import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { checkAnswer, gradePaper, questionGaps, remaining } from '../exam-rules.mjs';
import { createExamStore } from '../exam-store.mjs';

const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const { papers } = await read('data/wajo/papers.json');
assert.deepEqual(papers.map(paper => paper.year), Array.from({ length: 14 }, (_, index) => 2026 - index));

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
    assert(prompt && solution.solution && question.marks >= 1 && question.marks <= 4, id);
    assert(!('answer' in question) && !('solution' in question) && !('options' in question), id);
    assert.equal(checkAnswer(question, solution.answer, solution.answer), 'correct', id);
    if (question.workingRequired) reviewed.push(id);
    for (const html of [prompt, solution.solution]) {
      assert(!/<(?:script|iframe|object|link)\b|\bon\w+=/i.test(html), id);
      for (const match of html.matchAll(/\bsrc="([^"]+)"/g)) media.add(match[1]);
    }
    for (const path of [image, ...(solution.images || [])]) if (path) media.add(path);
  }
}
assert.equal(ids.size, 197);
assert.equal(media.size, 73);
for (const path of media) {
  assert(/^data\/wajo\/diagrams\/[0-9a-f]{14}\.webp$/.test(path), path);
  assert((await stat(new URL(path, root))).size > 100, path);
}
assert.deepEqual(reviewed, ['wajo19_q12', 'wajo18_q12', 'wajo17_q12', 'wajo16_q12',
  'wajo15_q12a', 'wajo15_q12b', 'wajo14_q12', 'wajo13_q12']);
assert.equal(byYear.get(2021).solutions.wajo21_q12.answer, 35);
assert.equal(papers[0].marks, 41);

const modern = byYear.get(2026);
const first = modern.questions[0];
assert.equal(checkAnswer(first, ' ８４ ', 84), 'correct');
assert.equal(checkAnswer(first, '8 4', 84), 'invalid');
assert.equal(checkAnswer(first, '84 apples', 84), 'invalid');
assert.equal(checkAnswer(first, '84.0', 84), 'invalid');
assert.equal(checkAnswer(first, '', 84), 'blank');
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
assert.equal(gradePaper(oldQuestions, responses, oldKeys).pending, 1);
assert.equal(gradePaper(oldQuestions, responses, oldKeys).score, 0);
assert.equal(gradePaper(oldQuestions, responses, oldKeys, { [last.id]: { mark: 3 } }).score, 3);
assert.equal(gradePaper(oldQuestions, responses, oldKeys, { [last.id]: { mark: 5 } }).pending, 1);
assert.equal(gradePaper(modern.questions, { [first.id]: { answer: '84' } }, modern.solutions).score, 1);
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
const mock = { id: 'mock-mocka', repeatable: true, minutes: 100 };
const mockRun = store.start(mock, false);
assert.equal(mockRun.deadline, null);
store.submit(mockRun.id);
assert(store.start(mock, false));
assert.throws(() => store.restore({ version: 1, active: {}, attempts: [] }));
const state = store.validateBackup(store.exportState());
assert.equal(state.attempts.length, 2);
assert.equal(state.attempts[0].responses[first.id].working, initial.working);
console.log('PASS: 14 papers, 197 question entries and keys, 73 local diagrams, written marking, timer, locks and backup.');
