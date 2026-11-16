import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { checkAnswer, gradePaper, questionGaps, remaining } from '../exam-rules.mjs';
import { createExamStore } from '../exam-store.mjs';
import { examInsights, questionTopic, retryQuestions, studyTopics } from '../exam-training.mjs';
import { validateProgressBackup } from '../practice-progress.mjs';

const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const { papers } = await read('data/wajo/papers.json');
const { papers: teamPapers } = await read('data/wajo/team-papers.json');
const teamSolutions = await read('data/wajo/team-solutions.json');
assert.deepEqual(papers.map(paper => paper.year), Array.from({ length: 27 }, (_, index) => 2026 - index));
assert.deepEqual(teamPapers.map(paper => paper.year), Array.from({ length: 26 }, (_, index) => 2025 - index));

const pdfPaths = papers.flatMap(paper => ['questions', 'solutions'].map(kind => `papers/wajo-${paper.year}-${kind}.pdf`)).sort();
const archiveFiles = await readdir(new URL('papers/', root), { withFileTypes: true });
assert.deepEqual(archiveFiles.filter(file => file.isFile() && file.name.endsWith('.pdf'))
  .map(file => `papers/${file.name}`).sort(), pdfPaths, 'The archive must contain both PDFs for every year.');
const manifest = (await readFile(new URL('papers/SHA256SUMS', root), 'utf8')).trim().split('\n').map(line => {
  const match = /^([0-9a-f]{64})  (papers\/wajo-20\d{2}-(?:questions|solutions)\.pdf)$/.exec(line);
  assert(match, 'Invalid archive checksum entry.');
  return [match[2], match[1]];
});
assert.deepEqual(manifest.map(([path]) => path), pdfPaths, 'The checksum manifest must list every PDF once.');
for (const [path, hash] of manifest) {
  const bytes = await readFile(new URL(path, root));
  assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-', path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, `Unexpected archive bytes: ${path}`);
}

function checkPages(pages, id) {
  assert(pages.length > 0, id);
  for (const [page, left, top, right, bottom] of pages) {
    assert(Number.isInteger(page) && page > 0 && [left, top, right, bottom].every(Number.isFinite), id);
    assert(left >= 0 && top >= 0 && right <= 612 && bottom <= 842 && left < right && top < bottom, id);
  }
}

const ids = new Set();
const media = new Set();
const reviewed = [];
const byYear = new Map();
for (const paper of papers) {
  const questions = await read(`data/wajo/${paper.year}-questions.json`);
  const solutions = await read(`data/wajo/${paper.year}-solutions.json`);
  byYear.set(paper.year, { questions, solutions });
  assert.equal(questions.length, paper.entries);
  assert.deepEqual(Object.keys(solutions), questions.map(q => q.id));
  assert.equal(new Set(questions.map(q => q.number.replace(/[ab]$/, ''))).size, paper.questions);
  assert.equal(questions.reduce((sum, q) => sum + q.marks, 0), paper.marks);
  assert.equal(paper.minutes, 100);
  for (const question of questions) {
    const { id, prompt, image } = question;
    const solution = solutions[id];
    assert(!ids.has(id), `${id} is duplicated`);
    ids.add(id);
    assert(question.marks >= 1 && question.marks <= 5, id);
    assert(questionTopic(question), `${id} needs a practice topic`);
    assert(!('answer' in question) && !('solution' in question) && !('options' in question), id);
    if (question.answerFormat !== 'written') assert.equal(checkAnswer(question, solution.answer, solution.answer), 'correct', id);
    if (question.workingRequired) reviewed.push(id);
    if (question.pages) {
      checkPages(question.pages, id);
      checkPages(solution.pages, id);
      continue;
    }
    assert(prompt && solution.solution, id);
    for (const html of [prompt, solution.solution]) {
      assert(!/<(?:script|iframe|object|link)\b|\bon\w+=/i.test(html), id);
      for (const match of html.matchAll(/\bsrc="([^"]+)"/g)) media.add(match[1]);
    }
    for (const path of [image, ...(solution.images || [])]) if (path) media.add(path);
  }
}
assert.equal(ids.size, 329);
assert.equal(media.size, 73);
for (const path of media) {
  assert(/^data\/wajo\/diagrams\/[0-9a-f]{14}\.webp$/.test(path), path);
  assert((await stat(new URL(path, root))).size > 100, path);
}
assert.deepEqual(reviewed.slice(0, 8), ['wajo19_q12', 'wajo18_q12', 'wajo17_q12', 'wajo16_q12',
  'wajo15_q12a', 'wajo15_q12b', 'wajo14_q12', 'wajo13_q12']);
assert.equal(reviewed.length, 21);
for (const paper of teamPapers) {
  const { content, entries, id, marks, minutes, referencePages, year } = paper;
  assert.equal(entries, content.length, id);
  assert.equal(minutes, year >= 2021 ? 50 : 45, id);
  assert.equal(marks ?? 0, content.reduce((sum, q) => sum + q.marks, 0), id);
  assert.deepEqual(Object.keys(teamSolutions[id]), content.map(q => q.id));
  checkPages(referencePages, id);
  for (const question of content) {
    assert(!ids.has(question.id), question.id);
    ids.add(question.id);
    assert.equal(question.answerFormat, 'written');
    checkPages(question.pages, question.id);
    checkPages(teamSolutions[id][question.id].pages, question.id);
  }
}
assert.equal(byYear.get(2021).solutions.wajo21_q12.answer, 35);
assert.equal(papers[0].marks, 41);

const modern = byYear.get(2026);
const first = modern.questions[0];
assert.equal(checkAnswer(first, ' ８４ ', 84), 'correct');
assert.equal(checkAnswer(first, '8 4', 84), 'invalid');
assert.equal(checkAnswer(first, '84 apples', 84), 'invalid');
assert.equal(checkAnswer(first, '84.0', 84), 'invalid');
assert.equal(checkAnswer(first, '', 84), 'blank');
const course = { window: {} };
for (const path of ['number', 'algebra', 'geometry', 'mocks', 'team']) {
  runInNewContext(await readFile(new URL(`data/${path}.js`, root), 'utf8'), course);
}
const { modules, mocks } = course.window.WAJO;
const lessonIds = new Set(modules.map(module => module.id));
for (const topic of Object.values(studyTopics)) {
  for (const id of topic.modules) assert(lessonIds.has(id), `Missing lesson ${id}`);
}
for (const mock of mocks) {
  assert.equal(mock.qs.length, 16, mock.id);
  for (const question of mock.qs) assert(questionTopic(question), `${mock.id}: ${question.q} needs a practice topic`);
}
const practiceIds = modules.flatMap(module => module.problems.map(question => question.id));
assert.equal(practiceIds.length, new Set(practiceIds).size);
const restored = validateProgressBackup({
  p: { t1: { t: 2, s: 1 }, unexpected: { s: 1 } },
  redos: { t1: { t: 0, s: 1, solvedBefore: true } },
  mocks: { mockA: { best: 'invalid score', hist: [{ score: 24, timed: 1 }, { score: '25' }, null] } },
  team: { teamA: { a0: 'a < b and b & c', m0: 2, m1: 100 } },
  days: ['2026-11-16', 'invalid date'],
  run: { id: 'mockB', start: 1_800_000_000_000, timed: 1, ans: { 0: '10' } },
}, course.window.WAJO);
assert.deepEqual(restored.p.t1, { t: 2, s: 1 });
assert.equal(restored.p.unexpected, undefined);
assert.equal(restored.redos.t1.solvedBefore, true);
assert.deepEqual(restored.mocks.mockA, { best: 24, hist: [{ score: 24, timed: true }] });
assert.deepEqual(restored.team.teamA, { a0: 'a < b and b & c', m0: 2 });
assert.deepEqual(restored.days, ['2026-11-16']);
assert.deepEqual(restored.run, { id: 'mockB', start: 1_800_000_000_000, timed: true, ans: { 0: '10' } });
assert.throws(() => validateProgressBackup({ p: [] }, course.window.WAJO), /Invalid practice backup/);
const { questions: early, solutions: earlyKeys } = byYear.get(2001);
assert.equal(checkAnswer(early[0], '−40', earlyKeys[early[0].id].answer), 'correct');
assert.equal(checkAnswer(early[2], '1334', earlyKeys[early[2].id].answer), 'correct');
assert.equal(checkAnswer(byYear.get(2011).questions[0], '100', 7), 'invalid');
const { questions: placements, solutions: placementsKeys } = byYear.get(2002);
assert.equal(checkAnswer(placements[2], '2nd place', placementsKeys[placements[2].id].answer), 'correct');
assert.equal(checkAnswer(placements[2], 'equal', placementsKeys[placements[2].id].answer), 'review');
assert.equal(checkAnswer(byYear.get(2014).questions.at(-1), 'equal', 'Neither; the two areas are equal.'), 'correct');

const team = teamPapers[0];
const part = team.content[0];
const teamResponses = { [part.id]: { working: 'A written response.' } };
assert(!questionGaps(team.content, teamResponses).unanswered.includes(part.number));
assert.equal(gradePaper(team.content, teamResponses, teamSolutions[team.id]).pending, 1);
const reviewedTeam = gradePaper(team.content, teamResponses, teamSolutions[team.id], { [part.id]: { verdict: 'sound' } });
assert.equal(reviewedTeam.pending, 0);
assert.equal(reviewedTeam.rows[0].reviewed, true);
const teamReviews = { [part.id]: { verdict: 'partial' } };
const partiallyReviewed = gradePaper(team.content, teamResponses, teamSolutions[team.id], teamReviews);
assert(!retryQuestions(reviewedTeam.rows, { [part.id]: { verdict: 'sound' } }).some(row => row.question.id === part.id));
assert.equal(retryQuestions(partiallyReviewed.rows, teamReviews)[0].question.id, part.id);
assert.deepEqual(examInsights(partiallyReviewed.rows), { topics: [], markBands: [], untagged: 0 });
const { questions: oldQuestions, solutions: oldKeys } = byYear.get(2013);
const last = oldQuestions.at(-1);
assert.equal(checkAnswer(last, '√481/3', oldKeys[last.id].answer), 'correct');
assert.equal(checkAnswer(last, String.raw`\(\frac{\sqrt{481}}{3}\)`, oldKeys[last.id].answer), 'correct');
assert.equal(checkAnswer(last, 'sqrt(481)/0', oldKeys[last.id].answer), 'review');
assert.equal(checkAnswer(last, 'sqrt(479)/3', oldKeys[last.id].answer), 'incorrect');
const fraction = byYear.get(2015).questions.at(-2);
assert.equal(checkAnswer(fraction, String.raw`\(\frac{288}{98}\)`, '144/49'), 'correct');
assert.equal(checkAnswer(fraction, '144/00', '144/49'), 'review');
const responses = { [last.id]: { answer: '√481/3', working: 'Show why the circle is smallest.' } };
const provisionalGrade = gradePaper(oldQuestions, responses, oldKeys);
assert.equal(provisionalGrade.pending, 1);
assert.equal(retryQuestions(provisionalGrade.rows, {}).length, oldQuestions.length - 1);
const partialMarks = { [last.id]: { mark: 3 } };
const partialGrade = gradePaper(oldQuestions, responses, oldKeys, partialMarks);
assert.equal(retryQuestions(partialGrade.rows, partialMarks).at(-1).question.id, last.id);
assert.equal(examInsights(partialGrade.rows).markBands.reduce((sum, band) => sum + band.max, 0), partialGrade.max);
assert.equal(gradePaper(oldQuestions, responses, oldKeys).score, 0);
assert.equal(gradePaper(oldQuestions, responses, oldKeys, { [last.id]: { mark: 3 } }).score, 3);
assert.equal(gradePaper(oldQuestions, responses, oldKeys, { [last.id]: { mark: 5 } }).pending, 1);
assert.equal(gradePaper(modern.questions, { [first.id]: { answer: '84' } }, modern.solutions).score, 1);
const sampleGrade = gradePaper(modern.questions, { [first.id]: { answer: '84' } }, modern.solutions);
assert.equal(retryQuestions(sampleGrade.rows, {}).length, 15);
const { topics, markBands, untagged } = examInsights(sampleGrade.rows);
assert.equal(untagged, 0);
assert.equal(topics.reduce((sum, topic) => sum + topic.questions, 0), 16);
assert.deepEqual(markBands[0], { key: 1, questions: 4, full: 1, earned: 1, max: 4 });
assert.deepEqual(questionGaps([last], {}), { unanswered: ['12'], invalid: [], missingWorking: ['12'] });

const disk = new Map();
const storage = {
  getItem: key => disk.get(key) ?? null,
  setItem: (key, value) => disk.set(key, value),
  removeItem: key => disk.delete(key),
};
let now = 1_900_000_000_000;
const store = createExamStore(storage, () => now);
const run = store.start(papers[0]);
assert.equal(remaining(run, now), 6000);
assert.equal(store.start(papers[1]), null);
const initial = { answer: '84', working: 'Use the weighted mean.', sketch: ['0000zzzz'], flag: true };
store.saveResponse(run.id, first.id, initial);
store.select(run.id, 4);
const reloaded = createExamStore(storage, () => now);
assert.deepEqual(reloaded.current().active.responses[first.id], initial);
assert.equal(reloaded.current().active.current, 4);
now = run.deadline;
assert.equal(store.current().active, null);
assert.equal(store.current().attempts[0].submittedAt, run.deadline);
assert.equal(store.current().attempts[0].expired, true);
assert.equal(store.saveResponse(run.id, first.id, { answer: '83' }), null);
assert.equal(store.submit(run.id).id, run.id);
assert.equal(store.current().attempts.length, 1);
assert.equal(store.start(papers[0]), null);
assert.equal(store.validateBackup(store.exportState()).attempts[0].retries, undefined);
const retry = { answer: '85', working: 'Tried a new method.', sketch: [], checked: true };
const afterRetry = store.saveRetry(run.id, first.id, retry);
assert.deepEqual(afterRetry.responses[first.id], initial);
assert.deepEqual(afterRetry.retries[first.id], retry);
assert.deepEqual(store.validateBackup(store.exportState()).attempts[0].retries[first.id], retry);
const mock = { id: 'mock-mocka', repeatable: true, minutes: 100 };
const mockRun = store.start(mock, false);
assert.equal(mockRun.deadline, null);
store.submit(mockRun.id);
assert(store.start(mock, false));
assert.throws(() => store.restore({ version: 1, active: {}, attempts: [] }));
const state = store.validateBackup(store.exportState());
assert.equal(state.attempts.length, 2);
assert.equal(state.attempts[0].responses[first.id].working, initial.working);
const rounds = createExamStore({ ...storage, getItem: key => disk.get(`rounds-${key}`) ?? null,
  setItem: (key, value) => disk.set(`rounds-${key}`, value) }, () => now);
const earlyRun = rounds.start(papers.at(-1));
rounds.saveResponse(earlyRun.id, 'wajo00_q1', { answer: '100' });
rounds.submit(earlyRun.id);
const teamRun = rounds.start(teamPapers.at(-1));
assert.equal(remaining(teamRun, now), 2700);
rounds.saveResponse(teamRun.id, 'wajo00_team_q1', { working: 'Count the removed cubes.' });
assert.equal(rounds.validateBackup(rounds.exportState()).active.responses.wajo00_team_q1.working, 'Count the removed cubes.');
console.log(`PASS: ${pdfPaths.length} PDF checksums, ${papers.length} individual papers, ${teamPapers.length} team papers, ${ids.size} responses and keys, ${modules.length} lessons, ${practiceIds.length} practice problems, mocks, media, marking, timer, retries and backup.`);
