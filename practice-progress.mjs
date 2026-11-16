const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isFlag = value => value === true || value === 1;
const isTimestamp = value => Number.isSafeInteger(value) && value >= 0 && value <= 8.64e15;
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isMark = (value, max) => Number.isSafeInteger(value) && value >= 0 && value <= max;

function cleanEntries(source, keys, clean) {
  if (!isRecord(source)) return {};
  return Object.fromEntries(keys.filter(key => Object.hasOwn(source, key) && isRecord(source[key]))
    .map(key => [key, clean(source[key], key)]));
}

function cleanProblem(record) {
  const clean = { t: Number.isSafeInteger(record.t) && record.t >= 0 ? record.t : 0 };
  for (const key of ['s', 'r', 'h']) if (isFlag(record[key])) clean[key] = 1;
  if (isFlag(record.solvedBefore)) clean.solvedBefore = true;
  if (isTimestamp(record.ts)) clean.ts = record.ts;
  return clean;
}

function cleanMock(record) {
  const hist = Array.isArray(record.hist) ? record.hist.filter(entry => isRecord(entry) && isMark(entry.score, 40))
    .map(entry => {
      const clean = { score: entry.score, timed: isFlag(entry.timed) };
      if (typeof entry.examId === 'string' && /^[\w-]{1,60}$/.test(entry.examId)) clean.examId = entry.examId;
      if (typeof entry.d === 'string') clean.d = entry.d.slice(0, 30);
      if (Number.isSafeInteger(entry.min) && entry.min >= 0) clean.min = entry.min;
      return clean;
    }) : [];
  const best = hist.reduce((max, entry) => Math.max(max, entry.score), isMark(record.best, 40) ? record.best : null);
  return { hist, best };
}

export function cleanProgress(value, { modules, mocks, team }) {
  const data = isRecord(value) ? value : {};
  const problemIds = modules.flatMap(module => module.problems.map(problem => problem.id));
  const mockIds = mocks.map(mock => mock.id);
  const read = isRecord(data.read) ? data.read : {};
  const clean = {
    p: cleanEntries(data.p, problemIds, cleanProblem),
    redos: cleanEntries(data.redos, problemIds, cleanProblem),
    mocks: cleanEntries(data.mocks, mockIds, cleanMock),
    team: cleanEntries(data.team, team.map(item => item.id), (record, id) => {
      const clean = {};
      if (isFlag(record.marked)) clean.marked = 1;
      if (isTimestamp(record.timerEnds)) clean.timerEnds = record.timerEnds;
      team.find(item => item.id === id).parts.forEach((part, i) => {
        if (typeof record[`a${i}`] === 'string') clean[`a${i}`] = record[`a${i}`];
        if (isMark(record[`m${i}`], part.m)) clean[`m${i}`] = record[`m${i}`];
      });
      return clean;
    }),
    past: cleanEntries(data.past, Array.from({ length: 27 }, (_, i) => String(2000 + i)), record => {
      const clean = {};
      if (Number.isSafeInteger(record.score)) clean.score = record.score;
      if (isFlag(record.done)) clean.done = 1;
      return clean;
    }),
    days: Array.isArray(data.days) ? [...new Set(data.days.filter(isDate))] : [],
    read: Object.fromEntries(modules.filter(module => Object.hasOwn(read, module.id) && isFlag(read[module.id]))
      .map(module => [module.id, 1])),
  };
  if (isTimestamp(data.archiveTimer?.timerEnds)) clean.archiveTimer = { timerEnds: data.archiveTimer.timerEnds };
  if (isDate(data.daily?.d) && Array.isArray(data.daily.ids)) {
    clean.daily = { d: data.daily.d, ids: [...new Set(data.daily.ids.filter(id => problemIds.includes(id)))].slice(0, 5) };
  }
  const run = data.run;
  const mock = mocks.find(item => item.id === run?.id);
  if (mock && isTimestamp(run.start)) {
    const ans = {};
    mock.qs.forEach((_, i) => {
      const value = run.ans?.[i];
      if (typeof value === 'string' || Number.isFinite(value)) ans[i] = String(value).slice(0, 300);
    });
    clean.run = { id: run.id, start: run.start, timed: isFlag(run.timed), ans };
  }
  return clean;
}

export function validateProgressBackup(data, course) {
  if (!isRecord(data) || !isRecord(data.p)) throw new Error('Invalid practice backup.');
  return cleanProgress(data, course);
}
