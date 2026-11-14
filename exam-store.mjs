const STORE_KEY = 'wajo.exams.v1';
const MAX_ANSWER = 300;
const MAX_WORKING = 8000;
const MAX_NOTE = 2000;
export const MAX_SKETCH = 4800;

export const fieldLimits = { answer: MAX_ANSWER, working: MAX_WORKING, note: MAX_NOTE };

function blankState() {
  return { version: 1, active: null, attempts: [] };
}

function savedText(value, limit) {
  return typeof value === 'string' ? value.slice(0, limit) : '';
}

function validSketch(value) {
  let length = 0;
  if (!Array.isArray(value)) return [];
  return value.filter(stroke => {
    if (typeof stroke !== 'string' || stroke.length < 4 || stroke.length % 4 || !/^[a-z0-9]+$/.test(stroke)) return false;
    length += stroke.length;
    return length <= MAX_SKETCH;
  });
}

function cleanMap(value, clean) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key]) =>
    /^(?:wajo\d{2}_q\d+[ab]?|wajo\d{2}_team_q(?:[A-Z]|\d+)|mock-q\d+)$/.test(key))
    .map(([key, entry]) => [key, clean(entry || {})]));
}

function cleanSitting(run, submitted) {
  if (!run || typeof run !== 'object' || !/^[\w-]{1,60}$/.test(run.id)
    || !/^(?:wajo-20(?:[01]\d|2[0-6])(?:-team)?|mock-[a-z0-9-]+)$/.test(run.paperId)
    || !Number.isFinite(run.startedAt) || run.startedAt < 0
    || (run.deadline !== null && (!Number.isFinite(run.deadline) || run.deadline < run.startedAt))) return null;
  const clean = {
    id: run.id, paperId: run.paperId, startedAt: run.startedAt, deadline: run.deadline,
    current: Math.max(0, Math.min(100, Math.trunc(run.current) || 0)),
    responses: cleanMap(run.responses, response => ({
      answer: savedText(response.answer, MAX_ANSWER),
      working: savedText(response.working, MAX_WORKING),
      flag: response.flag === true,
      sketch: validSketch(response.sketch),
    })),
  };
  if (submitted) {
    if (!Number.isFinite(run.submittedAt) || run.submittedAt < run.startedAt) return null;
    clean.submittedAt = run.submittedAt;
    clean.expired = run.expired === true;
    clean.reviews = cleanMap(run.reviews, review => ({
      mark: Number.isInteger(review.mark) && review.mark >= 0 && review.mark <= 100 ? review.mark : null,
      verdict: ['sound', 'partial', 'check'].includes(review.verdict) ? review.verdict : '',
      note: savedText(review.note, MAX_NOTE),
      answerVerdict: ['correct', 'incorrect'].includes(review.answerVerdict) ? review.answerVerdict : '',
    }));
    if (run.summary && Number.isInteger(run.summary.score) && Number.isInteger(run.summary.max) &&
      Number.isInteger(run.summary.pending) && run.summary.score >= 0 && run.summary.score <= run.summary.max &&
      run.summary.max <= 200 && run.summary.pending >= 0) {
      clean.summary = { score: run.summary.score, max: run.summary.max, pending: run.summary.pending };
    }
  }
  return clean;
}

function cleanState(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.attempts)) throw new Error('That file has an invalid exam history.');
  const attempts = value.attempts.map(run => cleanSitting(run, true));
  const active = value.active == null ? null : cleanSitting(value.active, false);
  if (attempts.some(run => !run) || (value.active != null && !active) ||
    new Set(attempts.map(run => run.id)).size !== attempts.length ||
    attempts.some(run => run.id === active?.id)) throw new Error('That file has an invalid exam attempt.');
  return { version: 1, active, attempts };
}

export function createExamStore(storage, clock = () => Date.now()) {
  let cachedRaw;
  let cached = blankState();

  function read() {
    const raw = storage.getItem(STORE_KEY);
    if (raw === cachedRaw) return cached;
    cached = raw ? cleanState(JSON.parse(raw)) : blankState();
    cachedRaw = raw;
    return cached;
  }

  function write(next) {
    const raw = JSON.stringify(next);
    storage.setItem(STORE_KEY, raw);
    cachedRaw = raw;
    cached = next;
  }

  function submit(id, expired = false) {
    const state = read();
    const run = state.active;
    if (!run || run.id !== id) return state.attempts.find(attempt => attempt.id === id);
    const now = Math.max(clock(), run.startedAt);
    const timedOut = run.deadline !== null && now >= run.deadline;
    if (expired && !timedOut) return null;
    const result = {
      ...run, submittedAt: timedOut ? run.deadline : now, expired: timedOut, reviews: {},
    };
    write({ ...state, active: null, attempts: [...state.attempts, result] });
    return result;
  }

  function current() {
    const state = read();
    if (state.active?.deadline != null && clock() >= state.active.deadline) {
      submit(state.active.id, true);
      return read();
    }
    return state;
  }

  function start(paper, timed = true, legacy = null) {
    const state = current();
    const past = state.attempts.filter(run => run.paperId === paper.id);
    if (legacy && past.some(run => run.id === legacy.id)) return null;
    if (state.active || (!paper.repeatable && past.length)) return null;
    const startedAt = legacy ? legacy.startedAt : clock();
    const id = legacy?.id ?? `${paper.id}-${startedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const run = {
      id, paperId: paper.id, startedAt,
      deadline: timed ? startedAt + paper.minutes * 60_000 : null,
      current: 0, responses: legacy?.responses || {},
    };
    write({ ...state, active: run });
    return run;
  }

  function update(id, change) {
    const state = current();
    if (state.active?.id !== id) return null;
    const active = change(state.active);
    write({ ...state, active });
    return active;
  }

  function saveResponse(id, questionId, patch) {
    return update(id, run => ({
      ...run,
      responses: {
        ...run.responses,
        [questionId]: { ...run.responses[questionId], ...patch },
      },
    }));
  }

  function editResult(id, change) {
    const state = read();
    const index = state.attempts.findIndex(run => run.id === id);
    if (index < 0) return null;
    const attempts = state.attempts.slice();
    attempts[index] = change(attempts[index]);
    write({ ...state, attempts });
    return attempts[index];
  }

  return {
    storageKey: STORE_KEY,
    current, start, submit, saveResponse, editResult,
    select: (id, index) => update(id, run => ({ ...run, current: index })),
    exportState: read,
    validateBackup: cleanState,
    restore: data => write(cleanState(data)),
    reset() {
      storage.removeItem(STORE_KEY);
      cachedRaw = undefined;
      cached = blankState();
    },
  };
}
