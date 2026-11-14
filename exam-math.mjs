import './vendor/katex/katex.min.js';

const katex = globalThis.katex;
const delimiters = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<!\\)\$((?:\\[^\n]|[^$\\\n])+?)\$|\\begin\{(align\*?|gather\*?|equation\*?|aligned|gathered|array)\}([\s\S]+?)\\end\{\5\}/g;

export function texSpans(value) {
  return [...value.matchAll(delimiters)].map(match => ({
    index: match.index,
    length: match[0].length,
    tex: match.slice(1, 5).find(item => item !== undefined) ?? match[0],
    display: match[1] !== undefined || match[2] !== undefined || match[5] !== undefined,
  }));
}

export function normaliseTex(value) {
  return value.trim()
    .replace(/\\(begin|end)\{align\*?\}/g, '\\$1{aligned}')
    .replace(/\\(begin|end)\{gather\*?\}/g, '\\$1{gathered}')
    .replace(/\\(?:begin|end)\{equation\*?\}/g, '')
    .replace(/\\tag\{([^{}]+)\}/g, '\\quad ($1)')
    .replace(/\\text\s*\{([^{}]*)\}/g, (_, words) => '\\text{' + words.replace(/_/g, ' ') + '}')
    .replace(/\\unicode\{x21af\}/g, '\\text{ (contradiction)}')
    .replace(/\\leqslant\b/g, '\\leq').replace(/\\geqslant\b/g, '\\geq');
}

function mathNode(tex, display) {
  const math = document.createElement(display ? 'div' : 'span');
  math.className = display ? 'exam-display-math' : 'exam-inline-math';
  try {
    katex.render(normaliseTex(tex), math, {
      displayMode: display, strict: 'ignore', trust: false, maxExpand: 500, maxSize: 16,
    });
    if (!display && tex.length > 42) math.classList.add('exam-long-math');
  } catch {
    math.classList.add('exam-math-fallback');
    math.textContent = tex;
  }
  return math;
}

export function renderArchiveMath(container) {
  const textNodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode;
    if (!text.parentElement.closest('.katex,.exam-math-fallback')) textNodes.push(text);
  }
  for (const node of textNodes) {
    const text = node.nodeValue;
    const spans = texSpans(text);
    if (!spans.length) {
      node.nodeValue = text.replace(/\\\$/g, '$');
      continue;
    }
    const result = document.createDocumentFragment();
    let last = 0;
    for (const span of spans) {
      result.append(text.slice(last, span.index).replace(/\\\$/g, '$'), mathNode(span.tex, span.display));
      last = span.index + span.length;
    }
    result.append(text.slice(last).replace(/\\\$/g, '$'));
    node.replaceWith(result);
  }
}

export function workingPreview(container, working, plainMath) {
  const fragment = document.createDocumentFragment();
  let last = 0;
  for (const { index, length, tex } of texSpans(working)) {
    fragment.append(plainFragment(working.slice(last, index), plainMath), mathNode(tex, false));
    last = index + length;
  }
  fragment.append(plainFragment(working.slice(last), plainMath));
  container.replaceChildren(fragment);
}

function plainFragment(value, plainMath) {
  const template = document.createElement('template');
  // The trainer's original formatter takes HTML. Escape student text first.
  const escaped = value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  template.innerHTML = plainMath(escaped);
  return template.content;
}

const keypad = [
  { name: 'Fraction', label: 'a⁄b', open: '\\(\\frac{', close: '}{}\\)', first: '}' },
  { name: 'Power', label: 'xⁿ', open: '\\(', close: '^{}\\)', first: '' },
  { name: 'Square root', label: '√', open: '\\(\\sqrt{', close: '}\\)' },
  { name: 'Multiply', label: '×' }, { name: 'Divide', label: '÷' }, { name: 'Minus', label: '−' },
  { name: 'Equals', label: '=' }, { name: 'Plus or minus', label: '±' },
  { name: 'Less than or equal to', label: '≤' }, { name: 'Greater than or equal to', label: '≥' },
  { name: 'Not equal to', label: '≠' }, { name: 'Pi', label: 'π' }, { name: 'Angle', label: '∠' },
  { name: 'Degrees', label: '°' }, { name: 'Perpendicular', label: '⊥' }, { name: 'Implies', label: '⇒' },
];

function insert(field, key) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  const selected = field.value.slice(start, end);
  const surroundingMath = /\\\([^)]*$/.test(field.value.slice(0, start)) && field.value.slice(end).includes('\\)');
  let insertion = key.label;
  let cursor = insertion.length;
  if (key.open) {
    const open = surroundingMath ? key.open.replace(/^\\\(/, '') : key.open;
    const close = surroundingMath ? key.close.replace(/\\\)$/, '') : key.close;
    insertion = open + selected + close;
    cursor = open.length + selected.length;
    if (selected && key.first) cursor += 2;
    else if (selected && key.name === 'Power') cursor += 2;
  }
  field.focus({ preventScroll: true });
  if (field.value.length + insertion.length - selected.length > field.maxLength) return;
  field.setRangeText(insertion, start, end, 'end');
  field.setSelectionRange(start + cursor, start + cursor);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

export function mountKeypad(root, answer, working, integerOnly) {
  let target = working;
  const targetLabel = root.querySelector('[data-keypad-target]');
  function use(field) {
    target = field;
    targetLabel.textContent = field === working ? 'Working out' : 'Final answer';
  }
  working.addEventListener('focus', () => use(working));
  answer.addEventListener('focus', () => use(integerOnly ? working : answer));
  const keys = root.querySelector('[data-keypad-keys]');
  for (const key of keypad) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = key.label;
    button.setAttribute('aria-label', key.name);
    button.title = key.name;
    button.addEventListener('pointerdown', event => event.preventDefault());
    button.addEventListener('click', () => insert(target, key));
    keys.append(button);
  }
}
