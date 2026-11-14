import { MAX_SKETCH } from './exam-store.mjs';

const DIMENSION = 1295;
const symbol = number => Math.round(Math.min(1, Math.max(0, number)) * DIMENSION).toString(36).padStart(2, '0');

export function paintSketch(canvas, strokes) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#123d46';
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const stroke of strokes) {
    context.beginPath();
    for (let i = 0; i < stroke.length; i += 4) {
      const x = parseInt(stroke.slice(i, i + 2), 36) / DIMENSION * canvas.width;
      const y = parseInt(stroke.slice(i + 2, i + 4), 36) / DIMENSION * canvas.height;
      if (i === 0) {
        context.moveTo(x, y);
        context.lineTo(x + 0.05, y);
      } else context.lineTo(x, y);
    }
    context.stroke();
  }
}

export function mountSketch(root, initial, onSave) {
  const canvas = root.querySelector('canvas');
  const undo = root.querySelector('[data-sketch-undo]');
  const clear = root.querySelector('[data-sketch-clear]');
  const status = root.querySelector('[data-sketch-status]');
  let strokes = [...initial];
  let active = '';
  let pointer;
  const encode = event => {
    const rect = canvas.getBoundingClientRect();
    return symbol((event.clientX - rect.left) / rect.width) + symbol((event.clientY - rect.top) / rect.height);
  };
  const paint = () => {
    paintSketch(canvas, active ? [...strokes, active] : strokes);
    undo.disabled = clear.disabled = strokes.length === 0;
  };
  function commit(next) {
    if (onSave(next)) strokes = next;
    paint();
  }

  canvas.addEventListener('pointerdown', event => {
    if (pointer !== undefined || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (strokes.join('').length + 4 > MAX_SKETCH) {
      status.textContent = 'Sketch is full. Undo or clear a stroke to add more.';
      return;
    }
    status.textContent = '';
    pointer = event.pointerId;
    canvas.setPointerCapture(pointer);
    active = encode(event);
    paint();
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer) return;
    const point = encode(event);
    if (active.endsWith(point) || strokes.join('').length + active.length + 4 > MAX_SKETCH) return;
    active += point;
    paint();
  });
  function end(event) {
    if (event.pointerId !== pointer) return;
    pointer = undefined;
    const stroke = active;
    active = '';
    if (stroke) commit([...strokes, stroke]);
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, end);
  undo.addEventListener('click', () => commit(strokes.slice(0, -1)));
  clear.addEventListener('click', () => {
    if (window.confirm('Clear the sketch for this question?')) commit([]);
  });
  paint();
}
