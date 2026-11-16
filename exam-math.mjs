import './vendor/katex/katex.min.js?v=0.19.1';

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
  for (const { index, length, tex, display } of texSpans(working)) {
    fragment.append(plainFragment(working.slice(last, index), plainMath), mathNode(tex, display));
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

const groups = {
  Essentials: [
    ['Fraction', 'a⁄b', '\\frac{«a»}{«b»}'], ['Power', 'xⁿ', '{«x»}^{«n»}'],
    ['Square root', '√', '\\sqrt{«x»}'], ['Subscript', 'xₙ', '{«x»}_{«n»}'],
    ['Multiply', '×'], ['Divide', '÷'], ['Minus', '−'], ['Plus', '+'],
    ['Equals', '='], ['Therefore', '∴'], ['Because', '∵'], ['Implies', '⇒'],
    ['Not equal', '≠'], ['Less than or equal', '≤'], ['Greater than or equal', '≥'],
    ['Approximately equal', '≈'],
  ],
  Layout: [
    ['Aligned equations', 'Align', '\\begin{aligned}\n«x» &= «a» \\\\\n    &= «b»\n\\end{aligned}', true],
    ['Cases', 'Cases', '\\begin{cases}\n«a» & \\text{if «condition»} \\\\\n«b» & \\text{otherwise}\n\\end{cases}', true],
    ['Two-column table', 'Table', '\\begin{array}{c|c}\n«x» & «y» \\\\ \\hline\n«a» & «b»\n\\end{array}', true],
    ['Gathered lines', 'Lines', '\\begin{gathered}\n«a» \\\\\n«b»\n\\end{gathered}', true],
    ['Equation label', '(1)', '\\tag{«1»}', true],
    ['Underbrace', '⏟', '\\underbrace{«x»}_{\\text{«label»}}'],
    ['Underline', 'x̲', '\\underline{«x»}'], ['Overline or digit string', 'x̅', '\\overline{«abc»}'],
    ['Words inside maths', 'Text', '\\text{«words»}'], ['Upright units', 'Units', '\\mathrm{«cm»}'],
    ['Name an operator', 'Op', '\\operatorname{«gcd»}'], ['Box final result', '□', '\\boxed{«x»}', true],
    ['Maths space', 'Space', '\\quad'], ['Inline maths', 'Inline', '«x»'],
    ['Displayed maths', 'Display', '«x»', true],
  ],
  Algebra: [
    ['Nth root', 'ⁿ√', '\\sqrt[«n»]{«x»}'], ['Absolute value', '|x|', '\\left|«x»\\right|'],
    ['Plus or minus', '±'], ['Minus or plus', '∓'], ['Less than', '<'], ['Greater than', '>'],
    ['Equivalent', '≡'], ['If and only if', '⇔'], ['Prime', '′'], ['Double prime', '″'],
    ['Parentheses', '( )', '\\left(«x»\\right)'], ['Brackets', '[ ]', '\\left[«x»\\right]'],
    ['Infinity', '∞'], ['Function', 'f(x)', 'f(«x»)'], ['Maximum', 'max', '\\max(«x»)'],
    ['Minimum', 'min', '\\min(«x»)'], ['Multiplication dot', '·'],
  ],
  Geometry: [
    ['Angle', '∠'], ['Degrees', '°'], ['Triangle', '△'], ['Pi', 'π'], ['Perpendicular', '⊥'],
    ['Parallel', '∥'], ['Congruent', '≅'], ['Similar', '∼'], ['Line segment', 'A̅B̅', '\\overline{«AB»}'],
    ['Arc', '⌢', '\\overset{\\frown}{«AB»}'], ['Vector', '→', '\\overrightarrow{«AB»}'],
    ['Square', '□', '\\square'], ['Alpha', 'α'], ['Beta', 'β'], ['Gamma', 'γ'], ['Delta', 'δ'],
    ['Capital delta', 'Δ'], ['Theta', 'θ'], ['Phi', 'φ'], ['Script ell', 'ℓ'],
  ],
  'Number and sets': [
    ['Divides', '∣'], ['Does not divide', '∤'], ['Modulo', 'mod', '\\pmod{«n»}'],
    ['Binary modulo', 'bmod', '\\bmod '], ['Floor', '⌊x⌋', '\\lfloor «x» \\rfloor'],
    ['Ceiling', '⌈x⌉', '\\lceil «x» \\rceil'], ['Set braces', '{ }', '\\{«x»\\}'],
    ['Element of', '∈'], ['Not an element of', '∉'], ['Subset', '⊂'], ['Subset or equal', '⊆'],
    ['Intersection', '∩'], ['Union', '∪'], ['Empty set', '∅'], ['Set difference', '∖'],
    ['Integers', 'ℤ'], ['Natural numbers', 'ℕ'], ['Rational numbers', 'ℚ'], ['Real numbers', 'ℝ'],
    ['For all', '∀'], ['There exists', '∃'], ['Contradiction', '↯'], ['End of proof', '∎'],
  ],
  Counting: [
    ['Choose', 'nCr', '\\binom{«n»}{«r»}'], ['Factorial', '!'], ['Summation', 'Σ', '\\sum_{«i=1»}^{«n»} «a_i»'],
    ['Product', '∏', '\\prod_{«i=1»}^{«n»} «a_i»'], ['Probability', 'P( )', 'P(«A»)'],
    ['Conditional probability', 'P(∣)', 'P(«A» \\mid «B»)'], ['Percent', '%'],
    ['Ellipsis', '…'], ['Centred dots', '⋯'], ['Vertical dots', '⋮'],
    ['Ratio', ':'], ['Maps to', '↦'],
  ],
};

const texSymbols = {
  '×':'times','÷':'div','−':'-','∴':'therefore','∵':'because','⇒':'Rightarrow','≠':'ne',
  '≤':'le','≥':'ge','≈':'approx','±':'pm','∓':'mp','≡':'equiv','⇔':'Leftrightarrow',
  '′':"'",'″':"''",'∞':'infty','·':'cdot','∠':'angle','°':'^{\\circ}','△':'triangle',
  'π':'pi','⊥':'perp','∥':'parallel','≅':'cong','∼':'sim','α':'alpha','β':'beta',
  'γ':'gamma','δ':'delta','Δ':'Delta','θ':'theta','φ':'phi','ℓ':'ell','∣':'mid','∤':'nmid',
  '∈':'in','∉':'notin','⊂':'subset','⊆':'subseteq','∩':'cap','∪':'cup','∅':'varnothing',
  '∖':'setminus','ℤ':'mathbb{Z}','ℕ':'mathbb{N}','ℚ':'mathbb{Q}','ℝ':'mathbb{R}',
  '∀':'forall','∃':'exists','↯':'text{(contradiction)}','∎':'blacksquare','%':'%',
  '…':'ldots','⋯':'cdots','⋮':'vdots','↦':'mapsto',
};

function insert(field, key) {
  const [, symbol, template, display] = key;
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  const selected = field.value.slice(start, end);
  const before = field.value.slice(0, start);
  const inside = [...before.matchAll(/\\[()[\]]/g)].at(-1)?.[0];
  const inMath = inside === '\\(' || inside === '\\[';
  const wrap = !inMath && template;
  const prefix = wrap ? (display ? '\n\\[' : '\\(') : '';
  const suffix = wrap ? (display ? '\\]\n' : '\\)') : '';
  let selection = null;
  const command = inMath && texSymbols[symbol];
  const token = command ? (/^[A-Za-z%]/.test(command) ? '\\' + command + ' ' : command) : symbol;
  const body = (template || token).replace(/«([^»]+)»/g, (match, example, offset) => {
    if (selection) return example;
    const value = selected || example;
    selection = [prefix.length + offset, prefix.length + offset + value.length];
    return value;
  });
  const value = prefix + body + suffix;
  if (field.value.length + value.length - selected.length > field.maxLength) return;
  field.setRangeText(value, start, end, 'end');
  field.setSelectionRange(start + (selection?.[0] ?? value.length), start + (selection?.[1] ?? value.length));
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.focus({ preventScroll: true });
}

export function mountKeypad(root, answer, working, workingOnly) {
  let target = working;
  const targetLabel = root.querySelector('[data-keypad-target]');
  function use(field) {
    target = field;
    targetLabel.textContent = field === working ? 'Working out' : 'Final answer';
  }
  working.addEventListener('focus', () => use(working));
  answer.addEventListener('focus', () => use(workingOnly ? working : answer));
  const keys = root.querySelector('[data-keypad-keys]');
  const select = root.querySelector('[data-keypad-category]');
  for (const category of Object.keys(groups)) select.add(new Option(category));
  function showKeys() {
    keys.replaceChildren();
    for (const key of groups[select.value]) {
      const [name, label] = key;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', name);
      button.title = name;
      button.addEventListener('pointerdown', event => event.preventDefault());
      button.addEventListener('click', () => insert(target, key));
      keys.append(button);
    }
  }
  select.addEventListener('change', showKeys);
  showKeys();
}
