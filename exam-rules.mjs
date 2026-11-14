export function examSeconds(milliseconds) {
  return Math.ceil(Math.max(0, milliseconds) / 1000);
}

export function displayTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function remaining(run, now = Date.now()) {
  return examSeconds(run.deadline - now);
}

const superscripts = Object.fromEntries([...('⁰¹²³⁴⁵⁶⁷⁸⁹')].map((digit, number) => [digit, String(number)]));

function normaliseMath(value) {
  return String(value)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, digits => '^' + [...digits].map(d => superscripts[d]).join(''))
    .normalize('NFKC')
    .replace(/−/g, '-').replace(/[×·]/g, '*').replace(/[÷⁄]/g, '/')
    .replace(/\\(?:left|right)/g, '').replace(/\\(?:\(|\)|\[|\])/g, '').replace(/\$/g, '')
    .replace(/\\(?:cdot|times)/g, '*').replace(/\\div/g, '/')
    .replace(/\\(?:mathrm|text)\{\s*~?\s*cm\s*\}/gi, 'cm')
    .replace(/(?:\\sqrt|√)\s*\{([^{}]+)\}/g, 'sqrt($1)')
    .replace(/(?:\\sqrt|√)\s*(\d+)/g, 'sqrt($1)')
    .replace(/(?:\\sqrt|√)/g, 'sqrt')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/[{}]/g, c => c === '{' ? '(' : ')')
    .replace(/\s+/g, '').toLowerCase();
}

function integerRatio(value) {
  const match = /^\(?([+-]?\d{1,15})\)?(?:\/\(?([+-]?\d{1,15})\)?)?$/.exec(value);
  if (!match || match[2] === '0') return null;
  const denominator = BigInt(match[2] || '1');
  return denominator === 0n ? null : [BigInt(match[1]), denominator];
}

function radicalRatio(value) {
  const text = normaliseMath(value).replace(/cm$/, '');
  const root = text.match(/sqrt\((\d{1,9})\)/);
  if (!root || Number(root[1]) === 0) return null;
  const coefficient = text.replace(root[0], 'r').replace(/[()]/g, '');
  const match = /^([+-]?)(?:(\d{1,15})\*?)?r(?:\/(\d{1,15}))?$/.exec(coefficient)
    || /^([+-]?)(\d{1,15})\/(\d{1,15})\*?r$/.exec(coefficient);
  if (!match) return null;
  const top = BigInt(match[2] || '1');
  const bottom = BigInt(match[3] || '1');
  if (bottom === 0n) return null;
  return { squareTop: top * top * BigInt(root[1]), squareBottom: bottom * bottom, positive: match[1] !== '-' };
}

function words(value) {
  return String(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function checkAnswer(question, raw, expected) {
  const value = String(raw ?? '').trim();
  if (!value) return 'blank';
  if (question.answerFormat === 'integer') {
    const entered = value.normalize('NFKC');
    if (!/^\d{1,6}$/.test(entered) || Number(entered) < 1 || Number(entered) > 999) return 'invalid';
    return Number(entered) === expected ? 'correct' : 'incorrect';
  }
  if (question.answerFormat === 'fraction') {
    const actual = integerRatio(normaliseMath(value).replace(/cm$/, ''));
    const target = integerRatio(normaliseMath(expected));
    if (!actual || !target) return 'review';
    return actual[0] * target[1] === target[0] * actual[1] ? 'correct' : 'incorrect';
  }
  if (question.answerFormat === 'exact') {
    const actual = radicalRatio(value);
    const target = radicalRatio(expected);
    if (!actual || !target) return 'review';
    return actual.positive === target.positive && actual.squareTop * target.squareBottom === target.squareTop * actual.squareBottom
      ? 'correct' : 'incorrect';
  }
  if (question.answerFormat === 'text') {
    const acceptable = [words(expected), 'equal', 'equal areas', 'same area', 'the same area', 'neither', 'the two areas are equal', 'they are equal'];
    return acceptable.includes(words(value)) ? 'correct' : 'review';
  }
  const target = normaliseMath(expected);
  const actual = normaliseMath(value).replace(/^x=/, '')
    .replace(/\((a\*?b)\)(?=\/)/g, '$1').replace(/\^\((\d+)\)/g, '^$1');
  // Accept common equivalent written forms. Any unfamiliar form stays with the reviewer.
  const equivalent = [
    target, 'a*b/(sqrt(a)+sqrt(b))^2', 'ab/(sqrt(b)+sqrt(a))^2', 'a*b/(sqrt(b)+sqrt(a))^2',
    'ab/(a+b+2sqrt(ab))', 'ab/(a+b+2*sqrt(ab))', 'a*b/(a+b+2*sqrt(a*b))',
  ];
  return equivalent.includes(actual) ? 'correct' : 'review';
}

export function questionGaps(questions, responses) {
  return questions.reduce((gaps, q) => {
    const response = responses[q.id] || {};
    const answer = typeof response.answer === 'string' ? response.answer.trim() : '';
    if (!answer) gaps.unanswered.push(q.number);
    else if (q.answerFormat === 'integer' && checkAnswer(q, answer, -1) === 'invalid') gaps.invalid.push(q.number);
    if (q.workingRequired && !response.working?.trim() && !response.sketch?.length) gaps.missingWorking.push(q.number);
    return gaps;
  }, { unanswered: [], invalid: [], missingWorking: [] });
}

export function gradePaper(questions, responses, solutions, reviews = {}) {
  const rows = questions.map(question => {
    const response = responses[question.id] || {};
    const key = solutions[question.id];
    if (!key) throw new Error(`The answer key for question ${question.number} is unavailable.`);
    const checked = checkAnswer(question, response.answer, key.answer);
    const decision = reviews[question.id]?.answerVerdict;
    const status = (question.workingRequired && (decision === 'correct' || decision === 'incorrect')) ? decision : checked;
    const needsMark = question.workingRequired && (status !== 'blank' || response.working?.trim() || response.sketch?.length);
    const manuallyScored = question.workingRequired || status === 'review';
    const manualMark = manuallyScored ? reviews[question.id]?.mark : null;
    const marked = Number.isInteger(manualMark) && manualMark >= 0 && manualMark <= question.marks;
    const pending = !marked && Boolean(needsMark || status === 'review');
    const earned = marked ? manualMark : pending ? 0 : !question.workingRequired && status === 'correct' ? question.marks : 0;
    return { question, response, key, status, pending, earned, manuallyScored };
  });
  return {
    rows,
    score: rows.reduce((n, row) => n + row.earned, 0),
    max: rows.reduce((n, row) => n + row.question.marks, 0),
    pending: rows.filter(row => row.pending).length,
    correct: rows.filter(row => row.status === 'correct').length,
    unanswered: rows.filter(row => row.status === 'blank').length,
  };
}
