import { getDocument, GlobalWorkerOptions, Util } from './vendor/pdfjs/pdf.min.mjs';

GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
const documents = new Map();

function openPdf(file) {
  if (!documents.has(file)) {
    const loading = getDocument({ url: file, isEvalSupported: false, enableXfa: false }).promise;
    documents.set(file, loading);
    loading.catch(() => documents.delete(file));
  }
  return documents.get(file);
}

export async function renderPaperPage(element) {
  if (element.dataset.rendering) return;
  element.dataset.rendering = 'true';
  const { paperFile, paperPage, paperCrop, paperLabel } = element.dataset;
  try {
    const pdf = await openPdf(paperFile);
    const page = await pdf.getPage(Number(paperPage));
    const standard = page.getViewport({ scale: 1 });
    const [left, top, right, bottom] = paperCrop ? paperCrop.split(',').map(Number) :
      [0, 0, standard.width, standard.height];
    const width = right - left;
    const scale = Math.min(3, 1450 / width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil((bottom - top) * scale);
    canvas.setAttribute('aria-hidden', 'true');

    const zoom = document.createElement('button');
    zoom.type = 'button';
    zoom.className = 'exam-paper-zoom';
    zoom.textContent = 'Zoom';
    zoom.setAttribute('aria-label', `Zoom ${paperLabel}`);
    zoom.setAttribute('aria-pressed', 'false');
    zoom.onclick = () => {
      const enlarged = element.classList.toggle('is-enlarged');
      zoom.setAttribute('aria-pressed', String(enlarged));
      zoom.scrollIntoView({ block: 'nearest' });
    };

    const scroll = document.createElement('div');
    scroll.className = 'exam-paper-scroll';
    scroll.append(canvas);
    const text = document.createElement('span');
    text.className = 'exam-paper-text';
    const [, extracted] = await Promise.all([
      page.render({ canvas, viewport, transform: [1, 0, 0, 1, -left * scale, -top * scale] }).promise,
      page.getTextContent(),
    ]);
    text.textContent = extracted.items.filter(item => {
      if (!item.transform) return false;
      const [, , , , x, baseline] = Util.transform(standard.transform, item.transform);
      return x >= left - 1 && x < right && baseline > top && baseline <= bottom;
    }).map(item => item.str).join(' ') || paperLabel;
    element.replaceChildren(zoom, scroll, text);
  } catch {
    element.textContent = 'This page could not load. Refresh to try again.';
    delete element.dataset.rendering;
  } finally {
    element.removeAttribute('aria-busy');
  }
}
