export const studyTopics = {
  number: { label: 'Number theory', modules: ['divis', 'factors', 'mod', 'digits'] },
  algebra: { label: 'Algebra', modules: ['words', 'seq', 'power'] },
  geometry: { label: 'Geometry', modules: ['angles', 'area', 'circles'] },
  counting: { label: 'Counting and probability', modules: ['count', 'logic'] },
  statistics: { label: 'Averages and data', modules: ['stats'] },
  reasoning: { label: 'Logical reasoning', modules: ['tools', 'logic'] },
};

const archiveTopics = new Map([
  ['Number Theory', 'number'], ['Algebra', 'algebra'], ['Geometry', 'geometry'],
  ['Geometry/Algebra', 'geometry'], ['Combinatorics', 'counting'], ['Statistics', 'statistics'],
  ['Logic', 'reasoning'],
]);

export function questionTopic(question) {
  return archiveTopics.get(question.topic);
}

export function retryQuestions(rows, reviews) {
  return rows.filter(row => {
    if (row.pending) return false;
    if (row.earned !== null) return row.earned < row.question.marks;
    const verdict = reviews[row.question.id]?.verdict;
    return verdict === 'partial' || verdict === 'check' || (!row.reviewed && row.status === 'blank');
  });
}

export function examInsights(rows) {
  const topics = new Map();
  const markBands = new Map();
  let untagged = 0;

  function add(groups, key, row) {
    const group = groups.get(key) ?? { key, questions: 0, full: 0, earned: 0, max: 0 };
    group.questions++;
    group.earned += row.earned;
    group.max += row.question.marks;
    if (row.earned === row.question.marks) group.full++;
    groups.set(key, group);
  }

  for (const row of rows) {
    if (row.pending || row.earned === null) continue;
    const topic = questionTopic(row.question);
    if (topic) add(topics, topic, row);
    else untagged++;
    add(markBands, row.question.marks, row);
  }

  const focusOrder = (a, b) => (b.max - b.earned) - (a.max - a.earned) ||
    b.questions - a.questions || studyTopics[a.key].label.localeCompare(studyTopics[b.key].label);
  return { topics: [...topics.values()].sort(focusOrder), markBands: [...markBands.values()].sort((a, b) => a.key - b.key), untagged };
}
