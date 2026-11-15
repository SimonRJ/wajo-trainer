"""Render the approved AMC Training narrator with the pinned voice profile."""

import argparse
import hashlib
from io import BytesIO
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

import numpy as np
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import parselmouth
from scipy.io import wavfile
from scipy.signal import butter, resample_poly, sosfilt

PRESET = Path(__file__).resolve().parent
RATE = 24000
PROFILE_HEADER = b'AMC Training narrator v1\0'
START_TOKEN = 6561
STOP_TOKEN = 6562
SILENCE_TOKEN = 4299


def load_voice(key_path):
    key = key_path.read_bytes()
    envelope = (PRESET / 'approved-voice.enc').read_bytes()
    if len(key) != 32 or not envelope.startswith(PROFILE_HEADER):
        raise ValueError('Expected the 32-byte AMC Training voice key and its encrypted profile.')
    body = envelope[len(PROFILE_HEADER):]
    clear = AESGCM(key).decrypt(body[:12], body[12:], PROFILE_HEADER)
    with np.load(BytesIO(clear), allow_pickle=False) as archive:
        return {key: archive[key] for key in archive.files}


def validate_models(directory, assets):
    for model in assets:
        path = directory / model['path']
        with path.open('rb') as handle:
            digest = hashlib.file_digest(handle, 'sha256').hexdigest()
        if digest != model['sha256']:
            raise ValueError(f'Model checksum mismatch for {path}')


def trim_take(wave):
    wave = sosfilt(butter(2, 64, btype='highpass', fs=RATE, output='sos'), wave).astype(np.float32)
    width = RATE // 100
    peaks = abs(wave[:len(wave)//width*width]).reshape((-1, width)).max(axis=1)
    active = np.flatnonzero(peaks > max(.0035, .016 * peaks.max()))
    if len(active) == 0:
        raise ValueError('The synthesizer returned a silent take.')
    take = wave[max(0, (active[0]-2)*width):min(len(wave), (active[-1]+9)*width)]
    taper = np.linspace(0, 1, 96)
    take[:96] *= taper
    take[-96:] *= taper[::-1]
    return take * min(2.2, .61 / max(.01, abs(take).max()))


class Narrator:
    def __init__(self, models, voice):
        import onnxruntime as ort
        from tokenizers import Tokenizer

        ort.disable_telemetry_events()
        options = ort.SessionOptions()
        options.intra_op_num_threads = 2
        options.inter_op_num_threads = 1
        options.log_severity_level = 3
        options.enable_cpu_mem_arena = False
        options.enable_mem_pattern = False
        folder = models / 'chatterbox'
        self.tokenizer = Tokenizer.from_file(str(folder / 'tokenizer.json'))

        def session(name):
            return ort.InferenceSession(str(folder / 'onnx' / f'{name}_q4.onnx'),
                                        options, providers=['CPUExecutionProvider'])

        self.embed = session('embed_tokens')
        self.language = session('language_model')
        self.decoder = session('conditional_decoder')
        self.cache_inputs = [v for v in self.language.get_inputs() if 'past_key_values' in v.name]
        self.voice = voice

    def say(self, phrase):
        token_ids = np.array([self.tokenizer.encode(phrase).ids], dtype=np.int64)
        text = self.embed.run(None, {'input_ids': token_ids})[0]
        hidden = np.concatenate((self.voice['condition'], text), axis=1)
        count = hidden.shape[1]
        positions = np.arange(count, dtype=np.int64)[None, :]
        mask = np.ones((1, count), dtype=np.int64)
        cache = {
            value.name: np.zeros((1, 16, 0, 64),
                                dtype=np.float16 if 'float16' in value.type else np.float32)
            for value in self.cache_inputs
        }
        result = [START_TOKEN]
        for _ in range(640):
            logits, *updated = self.language.run(None, {
                'inputs_embeds': hidden, 'attention_mask': mask, 'position_ids': positions, **cache,
            })
            scores = logits[0, -1].copy()
            history = np.asarray(list(set(result)), dtype=np.int64)
            chosen = scores[history]
            scores[history] = np.where(chosen < 0, chosen * 1.2, chosen / 1.2)
            token = int(scores.argmax())
            if token == STOP_TOKEN:
                break
            result.append(token)
            hidden = self.embed.run(None, {'input_ids': np.asarray([[token]], dtype=np.int64)})[0]
            mask = np.ones((1, count + len(result) - 1), dtype=np.int64)
            positions = positions[:, -1:] + 1
            cache = dict(zip(cache, updated))
        if not 5 < len(result) < 641:
            raise ValueError('Unexpected speech length. Use one short sentence or phrase per line.')
        generated = np.asarray([result[1:] + [SILENCE_TOKEN]*3], dtype=np.int64)
        tokens = np.concatenate((self.voice['prompt'], generated), axis=1)
        wave = self.decoder.run(None, {
            'speech_tokens': tokens,
            'speaker_embeddings': self.voice['speaker'],
            'speaker_features': self.voice['features'],
        })[0].reshape(-1)
        return trim_take(wave)


class VoiceFinish:
    def __init__(self, models, voice, openvoice_src, settings):
        sys.path.insert(0, str(openvoice_src))
        import torch
        from openvoice.models import SynthesizerTrn

        self.torch = torch
        torch.set_num_threads(4)
        torch.set_num_interop_threads(1)
        torch.manual_seed(settings['seed'])
        folder = models / 'openvoice-v2'
        config = json.loads((folder / 'config.json').read_text())
        spec = config['data']
        self.sample_rate = spec['sampling_rate']
        self.fft, self.hop, self.win = (spec[k] for k in ('filter_length', 'hop_length', 'win_length'))
        self.hann = torch.hann_window(self.win)
        self.model = SynthesizerTrn(len(config.get('symbols', [])), self.fft//2+1,
                                    n_speakers=spec['n_speakers'], **config['model']).eval()
        state = torch.load(folder / 'checkpoint.pth', map_location='cpu', weights_only=True)
        missing, extra = self.model.load_state_dict(state['model'], strict=False)
        if missing or extra:
            raise ValueError('Voice converter state does not match its pinned implementation.')
        self.source = torch.from_numpy(voice['source_tone'])
        self.target = torch.from_numpy(voice['target_tone'])
        self.tau = settings['conversion_noise']
        self.pitch = settings['pitch_multiplier']

    def convert(self, dry):
        from math import gcd

        t = self.torch
        lead, trail = round(RATE*.09), round(RATE*.11)
        wave = np.pad(dry, (lead, trail))
        common = gcd(self.sample_rate, RATE)
        at_model_rate = resample_poly(wave, self.sample_rate // common, RATE // common)
        at_model_rate = np.pad(at_model_rate, (2*self.hop, 3*self.hop))
        values = t.from_numpy(at_model_rate)[None, None, :]
        margin = (self.fft - self.hop)//2
        with t.inference_mode():
            values = t.nn.functional.pad(values, (margin, margin), 'reflect').squeeze(1)
            stft = t.stft(values, self.fft, hop_length=self.hop, win_length=self.win,
                          window=self.hann, center=False, return_complex=True)
            stft = t.sqrt(stft.abs().square() + 1e-6)
            result = self.model.voice_conversion(stft, t.LongTensor([stft.size(-1)]),
                sid_src=self.source, sid_tgt=self.target, tau=self.tau)[0]
            converted = result[0, 0, 2*self.hop:].cpu().numpy()
        tuned = resample_poly(converted, RATE // common, self.sample_rate // common)[:len(wave)]
        tuned = np.pad(tuned, (0, len(wave)-len(tuned)))
        tuned = sosfilt(butter(2, 62, btype='highpass', fs=RATE, output='sos'), tuned)
        taper = np.linspace(0, 1, 180)
        tuned[:180] *= taper
        tuned[-180:] *= taper[::-1]
        tuned *= min(1.75, .68 / max(.01, abs(tuned).max()))
        sound = parselmouth.Sound(tuned, sampling_frequency=RATE)
        call = parselmouth.praat.call
        adjustment = call(sound, 'To Manipulation', .01, 75, 360)
        tier = call(adjustment, 'Extract pitch tier')
        call(tier, 'Multiply frequencies', sound.xmin, sound.xmax, self.pitch)
        call([tier, adjustment], 'Replace pitch tier')
        take = call(adjustment, 'Get resynthesis (overlap-add)').values[0][lead:lead+len(dry)]
        taper = np.linspace(0, 1, 144)
        take[:144] *= taper
        take[-144:] *= taper[::-1]
        return take.astype(np.float32)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('script', type=Path, help='UTF-8 script with one spoken phrase per line')
    parser.add_argument('output', type=Path, help='Output WAV')
    parser.add_argument('--key', type=Path, required=True)
    parser.add_argument('--models', type=Path, required=True)
    parser.add_argument('--openvoice-src', type=Path, required=True,
                        help='Checkout containing the pinned openvoice Python package')
    args = parser.parse_args()
    os.environ['ORT_DISABLE_TELEMETRY'] = '1'
    settings = json.loads((PRESET / 'preset.json').read_text())
    validate_models(args.models, settings['assets'])
    voice = load_voice(args.key)
    narrator = Narrator(args.models, voice)
    finish = VoiceFinish(args.models, voice, args.openvoice_src, settings)
    phrases = [line.strip() for line in args.script.read_text(encoding='utf8').splitlines() if line.strip()]
    if not phrases:
        raise ValueError('The script must contain at least one phrase.')
    silence = np.zeros(round(RATE*.23), dtype=np.float32)
    tracks = []
    for phrase in phrases:
        tracks += [finish.convert(narrator.say(phrase)), silence]
    audio = np.concatenate(tracks)
    with tempfile.TemporaryDirectory() as temp:
        dry = Path(temp) / 'matched.wav'
        wavfile.write(dry, RATE, (32767*np.clip(audio, -.998, .998)).astype(np.int16))
        subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', str(dry),
            '-af', settings['audio_filter'], '-ar', '48000', '-c:a', 'pcm_s16le', str(args.output)], check=True)


if __name__ == '__main__':
    main()
