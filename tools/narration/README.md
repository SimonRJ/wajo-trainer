# Approved AMC Training narrator

Use this profile for every new WAJO Trainer video. The 15 November 2026 review of *The Square Trap* approved its exact voice. This folder stores the conditioning for that voice and the settings for the finished sound. The reusable data is in `approved-voice.enc`.

## Set up

1. Retrieve `AMC_Training_Narrator_Key.bin` from the project owner's private AMC Training files.
2. Place the model files at the paths listed in [preset.json](preset.json), relative to a local models directory. Each entry lists the exact download and checksum.
3. Check out [OpenVoice](https://github.com/myshell-ai/OpenVoice) at `74a1d147b17a8c3092dd5430504bd83ef6c7eb23`.
4. Use Python 3.12 and FFmpeg. Install CPU PyTorch 2.6.0 and the packages below in a local virtual environment.

```sh
python -m pip install torch==2.6.0 --index-url https://download.pytorch.org/whl/cpu
python -m pip install numpy==2.5.4 scipy==1.17.0 onnxruntime==1.32.0 tokenizers==0.23.3 \
  praat-parselmouth==0.4.7 cryptography==50.0.0
```

## Render a narration

Put one spoken phrase on each line of a UTF-8 script. Write maths as it should be read aloud. Generate the recording locally.

```sh
python tools/narration/render.py script.txt narration.wav \
  --key /private/AMC_Training_Narrator_Key.bin \
  --models /local/voice-models \
  --openvoice-src /local/OpenVoice
```

The output is a 48 kHz narration track. Use the finished audio to locate the spoken cues for each diagram and caption.

The profile bundles the approved Chatterbox Turbo conditioning and OpenVoice V2 tone vectors. It uses the quantised model files, pitch adjustment and audio filter recorded in [preset.json](preset.json). Keep the key in private storage.
