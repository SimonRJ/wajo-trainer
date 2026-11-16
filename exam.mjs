import { displayTime, examSeconds, gradePaper, questionGaps, remaining } from './exam-rules.mjs?v=all-years';
import { createExamStore, fieldLimits } from './exam-store.mjs?v=all-years';
import { mountKeypad, renderArchiveMath, workingPreview } from './exam-math.mjs?v=notation-2';
import { mountSketch, paintSketch } from './exam-sketch.mjs';

const BANK = './data/wajo/';
const markText = marks => `${marks} mark${marks === 1 ? '' : 's'}`;
const sittingLink = run => `#/exam/${run.paperId}`;
const reportLink = run => `#/exam-result/${run.id}`;
const dateText = time => new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(time));
const responseStatus = {
  correct: 'Final answer correct',
  incorrect: 'Final answer incorrect',
  blank: 'No final answer',
  invalid: 'Final answer outside the required format',
  review: 'Final answer needs review',
};
const labelFor = (paper, number) => `${paper.team ? 'Part' : 'Question'} ${number}`;
const paperLength = paper => `${paper.questions} ${paper.team ? 'parts' : 'questions'}`;
const paperMarkTotal = paper => paper.marks === null ? '' : ` · ${markText(paper.marks)}`;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function scoreText(run) {
  if (!run?.summary) return 'Submitted · view results';
  const { score, max, pending } = run.summary;
  return max === 0 ? (pending ? 'Awaiting review' : 'Submitted · view review') : `${score}/${max}${pending ? ' so far' : ''}`;
}

function reviewStatus(row) {
  if (row.question.answerFormat === 'written') return row.status === 'blank' ? 'No response' : 'Written response saved';
  return responseStatus[row.status];
}

function resultMark(row) {
  if (row.pending) return 'Awaiting review';
  if (row.earned === null) return row.reviewed ? 'Reviewed' : 'Unanswered';
  return `${row.earned}/${row.question.marks} marks`;
}

function resultTone(row) {
  if (row.pending) return 'pending';
  return (row.earned === null ? row.reviewed : row.earned === row.question.marks) ? 'correct' : 'missed';
}

function questionFigure(source, caption) {
  return source ? `<figure class="exam-figure"><img class="wajo-diagram" src="${escapeHtml(source)}" alt="${escapeHtml(caption)}"></figure>` : '';
}

function paperPages(file, regions, label) {
  return regions.map(([page, ...crop], index) => `<div class="exam-paper-page"
    data-paper-file="${escapeHtml(file)}" data-paper-page="${page}" data-paper-crop="${crop.join(',')}"
    data-paper-label="${escapeHtml(`${label}, page ${index + 1}`)}"
    aria-busy="true">Loading ${escapeHtml(label.toLowerCase())}…</div>`).join('');
}

function mathMarkup(question, paper) {
  const label = labelFor(paper, question.number);
  return `<div class="exam-maths exam-stem">${question.pages ?
    paperPages(paper.questionFile, question.pages, label) :
    question.prompt + questionFigure(question.image, `Diagram for ${paper.title}, ${label.toLowerCase()}`)}</div>`;
}

function editorGuide(question) {
  switch (question.answerFormat) {
    case 'fraction': return 'Enter an exact fraction, for example 3/4.';
    case 'exact': return 'Enter an exact value, for example sqrt(5)/2. The keypad can insert a square root.';
    case 'expression': return 'Enter an expression using a and b. Use parentheses for grouping.';
    case 'text': return 'State your conclusion in words.';
    case 'written': return 'Use the working area and sketchpad for your full response. Add a short answer here if needed.';
    default:
      if (question.integerMin === undefined && question.integerMax !== undefined) {
        return `Enter a whole number from 1 to ${question.integerMax}.`;
      }
      return question.integerMin !== undefined ? 'Enter a whole number.' : 'Enter a whole number from 1 to 999.';
  }
}

function activate(paper, root) {
  if (!paper.mock) renderArchiveMath(root);
  root.querySelectorAll('img.wajo-diagram').forEach(image => {
    image.addEventListener('error', () => {
      const note = document.createElement('p');
      note.textContent = 'Diagram unavailable. Reopen the paper when the connection returns.';
      note.className = 'exam-error';
      image.replaceWith(note);
    }, { once: true });
  });
}

function loadPaperPages(root) {
  const pages = [...root.querySelectorAll('[data-paper-file]')];
  if (!pages.length) return Promise.resolve();
  return import('./exam-pdf.mjs?v=all-years')
    .then(({ renderPaperPage }) => Promise.all(pages.map(renderPaperPage)))
    .catch(() => pages.forEach(page => {
      page.removeAttribute('aria-busy');
      page.textContent = 'Could not open the paper. Refresh this page to retry.';
    }));
}

export async function listAvailablePapers(loadJson) {
  const [{ papers }, { papers: teams }] = await Promise.all([loadJson('papers.json'), loadJson('team-papers.json')]);
  return [...papers, ...teams].map(paper => ({
    ...paper, repeatable: false,
    questionFile: `./papers/wajo-${paper.year}-questions.pdf`,
    solutionFile: `./papers/wajo-${paper.year}-solutions.pdf`,
  }));
}

export function createExamCentre({ app, show, mocks, onMockResult, onExamActivity, plainMath, legacyRun, discardLegacy }) {
  const store = createExamStore(window.localStorage);
  const cache = new Map();
  const mockPapers = mocks.map(paper => ({
    id: `mock-${paper.id.toLowerCase()}`, legacyId: paper.id, title: paper.title,
    minutes: 100, marks: 40, entries: paper.qs.length, questions: paper.qs.length,
    mock: true, repeatable: true,
    content: paper.qs.map((q, index) => ({
      id: `mock-q${index + 1}`, number: String(index + 1), marks: Math.floor(index / 4) + 1,
      answerFormat: 'integer', workingRequired: false, prompt: q.q,
    })),
    solutions: Object.fromEntries(paper.qs.map((q, index) => [`mock-q${index + 1}`, { answer: q.a, solution: q.s }])),
  }));
  let view = '';
  let interval;
  let sync = null;
  let hiddenSync = null;
  let renderVersion = 0;

  async function loadJson(path) {
    if (!cache.has(path)) {
      cache.set(path, fetch(`${BANK}${path}?v=all-years`).then(response => {
        if (!response.ok) throw new Error('Could not load this paper. Check your connection and try again.');
        return response.json();
      }).catch(error => {
        cache.delete(path);
        throw error;
      }));
    }
    return cache.get(path);
  }

  async function catalog() {
    return listAvailablePapers(loadJson);
  }

  async function findPaper(id) {
    const mock = mockPapers.find(paper => paper.id === id || paper.legacyId === id);
    return mock || (await catalog()).find(paper => paper.id === id);
  }

  function questionsFor(paper) {
    return paper.content ? Promise.resolve(paper.content) : loadJson(`${paper.year}-questions.json`);
  }

  function solutionsFor(paper) {
    return paper.team ? loadJson('team-solutions.json').then(solutions => solutions[paper.id]) :
      paper.mock ? Promise.resolve(paper.solutions) : loadJson(`${paper.year}-solutions.json`);
  }

  function problemError(error, retry = view) {
    show(`<div class="exam-centre"><a class="crumb" href="#/exams">← Exam centre</a>
      <h1>Couldn’t open the exam</h1><p role="alert">${escapeHtml(error.message || 'Check your connection.')}</p>
      <button class="btn" type="button" id="exam-retry">Try again</button></div>`);
    app.querySelector('#exam-retry').onclick = () => render(retry);
  }

  function attemptNotice(active) {
    return active ? `<div class="exam-resume"><span>You have a sitting in progress.</span>
      <a class="btn small" href="${sittingLink(active)}">Resume exam</a></div>` : '';
  }

  function paperCard(paper, state) {
    const run = state.active?.paperId === paper.id ? state.active : null;
    const finished = state.attempts.filter(attempt => attempt.paperId === paper.id).at(-1);
    const resume = run || (finished && !paper.repeatable);
    return `<a class="exam-paper-card" href="${finished && !run && !paper.repeatable ? reportLink(finished) : `#/exam/${paper.id}`}">
      <span class="exam-paper-title">${escapeHtml(paper.title)}</span>
      <span class="exam-paper-meta">${paperLength(paper)} · ${paper.minutes} min${paperMarkTotal(paper)}</span>
      <span class="exam-paper-status${resume ? ' has-attempt' : ''}">${run ? 'Resume sitting' : finished ? scoreText(finished) : 'Open paper'} <span aria-hidden="true">→</span></span>
    </a>`;
  }

  async function listPapers(version, mocksOnly) {
    const state = store.current();
    const past = mocksOnly ? [] : await catalog();
    if (version !== renderVersion) return;
    const teamsOnly = view === 'exams/team';
    show(`<div class="exam-centre">
      ${mocksOnly ? '<a class="crumb" href="#/exams">← Exam centre</a>' : ''}
      <h1>${mocksOnly ? 'Mock papers' : 'WAJO exam centre'}</h1>
      <p class="sub">${mocksOnly ? 'Original WAJO-style papers. Each timed sitting runs for 100 minutes.' :
        'Sit a past WAJO paper on screen. Enter your answers and keep your working with each question.'}</p>
      ${attemptNotice(state.active)}
      ${mocksOnly ? '' : `<nav class="row exam-round-links" aria-label="Past paper rounds">
        <a href="#/exams"${teamsOnly ? '' : ' aria-current="page"'}>Individual papers</a>
        <a href="#/exams/team"${teamsOnly ? ' aria-current="page"' : ''}>Team papers</a>
      </nav>`}
      ${mocksOnly ? '' : `<section aria-labelledby="past-paper-title">
        <h2 id="past-paper-title">${teamsOnly ? 'Team papers · 2000–2025' : 'Individual papers · 2000–2026'}</h2>
        <div class="exam-paper-grid">${past.filter(paper => Boolean(paper.team) === teamsOnly)
          .map(paper => paperCard(paper, state)).join('')}</div>
        ${teamsOnly ? '<p class="sub">The 2026 team paper is awaiting a verified copy.</p>' : ''}
        <p class="exam-credit">Source: WAJO (Western Australian Junior Mathematics Olympiad).
          <a href="#/past">Browse question papers and solutions</a></p>
        </section>`}
      <section aria-labelledby="mock-paper-title"><h2 id="mock-paper-title">Original mock papers</h2>
        <div class="exam-paper-grid">${mockPapers.map(paper => paperCard(paper, state)).join('')}</div>
      </section>
      ${state.attempts.length ? `<section aria-labelledby="exam-history-title"><h2 id="exam-history-title">Exam history</h2>
        <ul class="exam-history">${[...state.attempts].reverse().map(run => `<li><a href="${reportLink(run)}">${escapeHtml(
          [...mockPapers, ...past].find(p => p.id === run.paperId)?.title || `WAJO ${run.paperId.slice(5, 9)}${run.paperId.endsWith('-team') ? ' Team' : ''}`)}</a>
          <span>${scoreText(run)} · ${dateText(run.submittedAt)}${run.deadline === null ? ' · untimed' : ''}</span></li>`).join('')}</ul>
      </section>` : ''}
    </div>`);
  }

  function migrate(paper) {
    if (!paper.mock) return;
    const old = legacyRun();
    if (!old || old.id !== paper.legacyId || !Number.isFinite(old.start)) return;
    const id = `legacy-${paper.id}-${old.start}`;
    const state = store.current();
    if (state.active?.id === id || state.attempts.some(run => run.id === id)) {
      discardLegacy();
      return;
    }
    if (state.active) return;
    const responses = Object.fromEntries(paper.content.map((q, index) =>
      [q.id, { answer: String(old.ans?.[index] ?? '').slice(0, fieldLimits.answer) }]));
    if (store.start(paper, Boolean(old.timed), { id, startedAt: old.start, responses })) discardLegacy();
  }

  function showStart(paper, questions, state) {
    const last = state.attempts.filter(run => run.paperId === paper.id).at(-1);
    if (last && !paper.repeatable) return openReport(last.id);
    const written = [...new Set(questions.filter(q => q.workingRequired).map(q => q.number.replace(/[ab]$/, '')))];
    const instructions = paper.team ? 'Enter a shared response for each part. Keep your explanations and drawings with the relevant part.' :
      written.length ? `Follow the answer format shown for each question. A reviewer marks the written solution for question ${written.join(' and ')}.` :
        'Enter one positive whole number below 1000 for each final answer. The exam score is based on those answers.';
    show(`<div class="exam-centre">
      <a class="crumb" href="#/exams${paper.team ? '/team' : ''}">← Exam centre</a>
      <h1>${escapeHtml(paper.title)}</h1>
      <p class="sub">${paperLength(paper)} · ${paper.minutes} minutes${paperMarkTotal(paper)}</p>
      ${attemptNotice(state.active)}
      <section class="card exam-start" aria-labelledby="before-start">
        <h2 id="before-start">Before you start</h2>
        <ul>
          <li>Use a pen and paper or the on-screen working area. Calculators are prohibited.</li>
          <li>${instructions}</li>
          ${paper.team && paper.marks === null ? '<li>Review each part against the worked solutions after submitting.</li>' : ''}
          <li>Your answers and working save to this browser. The countdown continues if you leave or refresh.</li>
          <li>${paper.repeatable ? 'Submitting locks this sitting. You can start a new practice attempt afterwards.' :
            'This paper allows one sitting in this browser. After submitting you can review it.'}</li>
        </ul>
        <div class="row">
          <button class="btn" data-start="timed" type="button"${state.active ? ' disabled' : ''}>Start</button>
          ${paper.mock ? `<button class="btn ghost" data-start="untimed" type="button"${state.active ? ' disabled' : ''}>Practise untimed</button>` : ''}
        </div>
        ${last ? `<p><a href="${reportLink(last)}">Review your last sitting</a></p>` : ''}
        <p class="exam-error" data-start-error role="alert" hidden></p>
      </section>
    </div>`);
    for (const button of app.querySelectorAll('[data-start]')) {
      button.onclick = () => {
        try {
          const run = store.start(paper, button.dataset.start === 'timed');
          if (run) {
            onExamActivity();
            showSitting(paper, questions, run);
          } else render(view);
        } catch {
          const error = app.querySelector('[data-start-error]');
          error.textContent = 'This browser could not save a sitting. Check its storage settings or free some space, then try again.';
          error.hidden = false;
        }
      };
    }
  }

  function moveTo(run, index) {
    try {
      const next = store.select(run.id, index);
      return next;
    } catch {
      app.querySelector('[data-exam-save]').textContent = 'Couldn’t save. Free some space, then try again.';
      return undefined;
    }
  }

  function openReport(id) {
    const hash = `#/exam-result/${id}`;
    if (location.hash === hash) render(hash.slice(2));
    else location.hash = hash;
  }

  function showSitting(paper, questions, run, focusQuestion = false) {
    clearInterval(interval);
    const currentIndex = Math.min(run.current, questions.length - 1);
    const question = questions[currentIndex];
    const saved = run.responses[question.id] || {};
    const integer = question.answerFormat === 'integer';
    const label = labelFor(paper, question.number);
    show(`<div class="exam-centre exam-sitting">
      <header class="exam-competition-header">
        <a class="exam-wordmark" href="#/exams${paper.team ? '/team' : ''}"><strong>WAJO</strong><span>Trainer · Practice</span></a>
        <div class="exam-clock-pill"><span>${run.deadline === null ? 'Time Used' : 'Time Left'}:</span>
          <strong class="exam-clock" role="timer" data-exam-clock></strong></div>
      </header>
      <h1 class="exam-competition-progress">${escapeHtml(paper.title)} · ${currentIndex + 1}/${questions.length}</h1>
      <article class="card exam-question-card" aria-labelledby="exam-question-title">
        <div class="exam-question-header">
          <div><h2 id="exam-question-title" tabindex="-1">${label}</h2><span class="exam-question-marks">${question.marks === null ? 'Review against the worked solution' :
            markText(question.marks) + (question.workingRequired ? ' · Working marked' : '')}</span>
          </div>
          <div class="exam-save-stats"><span class="exam-save" role="status" data-exam-save>Saved</span>
            <span data-answer-count></span></div>
        </div>
        ${paper.referencePages ? `<details class="exam-model-solution"><summary>Full team paper and any answer sheets</summary>
          <div class="exam-maths">${paperPages(paper.questionFile, paper.referencePages, 'Team paper')}</div></details>` : ''}
        ${mathMarkup(question, paper)}
        <section class="exam-response" aria-label="Your response">
          <div class="exam-answer-wrap">
            <label for="exam-answer">Your answer</label>
            <input class="ans" id="exam-answer" type="text" inputmode="${integer && (question.integerMin ?? 1) >= 0 ? 'numeric' : 'text'}"
              autocomplete="off" spellcheck="false" autocapitalize="off"
              maxlength="${fieldLimits.answer}" aria-describedby="exam-answer-help" placeholder="${integer ? `Enter a whole number from ${question.integerMin ?? 1} to ${question.integerMax ?? 999}` : 'Enter your answer'}">
            <small id="exam-answer-help">${editorGuide(question)}</small>
          </div>
          <details class="exam-practice-tools"${question.workingRequired || saved.working || saved.sketch?.length ? ' open' : ''}>
            <summary>Working and maths tools</summary>
          <label for="exam-working">Working out <small>${question.workingRequired ?
            (question.marks === null ? 'Saved for review' : 'Required for full marks') : 'Saved for review'}</small></label>
          <textarea id="exam-working" rows="5" maxlength="${fieldLimits.working}"
            placeholder="Write your steps or explain your reasoning…" spellcheck="false"></textarea>
          <details class="exam-keypad">
            <summary>Maths keypad</summary>
            <div class="exam-keypad-inner">
              <div class="exam-keypad-head"><span>Inserting into <strong data-keypad-target>Working out</strong></span><label>Category <select data-keypad-category aria-label="Maths keypad category"></select></label></div>
              <div class="exam-keypad-grid" data-keypad-keys></div>
              <small>Templates include example values. Replace them with your own and check the preview.</small>
            </div>
          </details>
          <div class="exam-working-preview" data-working-wrap hidden>
            <span>Working preview</span><div class="exam-maths" data-working-preview></div>
          </div>
          <details class="exam-sketch"${saved.sketch?.length ? ' open' : ''}>
            <summary>Sketch or draw</summary>
            <div class="exam-sketch-inner">
              <canvas width="720" height="420" aria-label="Sketch area for this question"></canvas>
              <div class="row"><button class="btn small ghost" type="button" data-sketch-undo>Undo</button>
                <button class="btn small ghost" type="button" data-sketch-clear>Clear</button>
                <span data-sketch-status role="status"></span></div>
            </div>
          </details>
          </details>
        </section>
        <nav class="exam-navigator" aria-label="${paper.team ? 'Parts' : 'Questions'}">${questions.map((item, index) =>
          `<button type="button" data-question-index="${index}"${index === currentIndex ? ' aria-current="step"' : ''}>${item.number}</button>`).join('')}</nav>
        <div class="exam-question-controls">
          <button class="btn ghost" type="button" data-previous${currentIndex === 0 ? ' disabled' : ''}>Previous</button>
          <button class="btn" type="button" data-next>${currentIndex < questions.length - 1 ? 'Next' : 'Submit'}</button>
        </div>
      </article>
      <div class="exam-practice-controls">
        <button class="btn small ghost" data-flag type="button" aria-pressed="false">Flag</button>
        <span data-flag-count></span>
        <button class="btn small ghost" type="button" data-end-exam>Review &amp; submit</button>
      </div>
      <dialog class="exam-dialog" aria-labelledby="exam-submit-title"></dialog>
    </div>`);
    const root = app.querySelector('.exam-sitting');
    const answer = root.querySelector('#exam-answer');
    const working = root.querySelector('#exam-working');
    const timer = root.querySelector('[data-exam-clock]');
    const saveText = root.querySelector('[data-exam-save]');
    const flag = root.querySelector('[data-flag]');
    const nav = [...root.querySelectorAll('[data-question-index]')];
    const dialog = root.querySelector('dialog');
    const preview = root.querySelector('[data-working-preview]');
    const previewWrapper = root.querySelector('[data-working-wrap]');
    let previewTimer;

    answer.value = saved.answer || '';
    working.value = saved.working || '';
    activate(paper, root.querySelector('.exam-stem'));
    loadPaperPages(root.querySelector('.exam-stem'));
    const reference = root.querySelector('.exam-question-card > details');
    reference?.addEventListener('toggle', () => { if (reference.open) loadPaperPages(reference); }, { once: true });
    mountKeypad(root, answer, working, ['integer', 'text'].includes(question.answerFormat));
    hiddenSync = updateClock;
    function previewWorking() {
      previewWrapper.hidden = !working.value.trim();
      if (!previewWrapper.hidden) workingPreview(preview, working.value, plainMath);
    }
    previewWorking();

    function updateNavigation() {
      let answered = 0;
      let flagged = 0;
      for (const [index, button] of nav.entries()) {
        const q = questions[index];
        const r = run.responses[q.id] || {};
        const hasAnswer = Boolean(r.answer?.trim());
        const hasWorking = Boolean(r.working?.trim() || r.sketch?.length);
        const invalid = q.answerFormat === 'integer' && hasAnswer && questionGaps([q], run.responses).invalid.length > 0;
        const complete = !invalid && (hasAnswer || (q.answerFormat === 'written' && hasWorking));
        if (complete) answered++;
        if (r.flag) flagged++;
        button.classList.toggle('is-answered', complete);
        button.classList.toggle('is-invalid', invalid);
        button.classList.toggle('has-working', hasWorking && !complete);
        button.classList.toggle('is-flagged', Boolean(r.flag));
        const state = invalid ? 'check answer format' : complete ? 'answered' : hasWorking ? 'working saved, no answer' : 'unanswered';
        button.setAttribute('aria-label', `${labelFor(paper, q.number)}, ${state}${r.flag ? ', flagged' : ''}`);
      }
      root.querySelector('[data-answer-count]').textContent = `Answered: ${answered}/${questions.length}`;
      root.querySelector('[data-flag-count]').textContent = flagged ? `${flagged} flagged` : '';
      const invalid = integer && questionGaps([question], run.responses).invalid.length > 0;
      answer.setAttribute('aria-invalid', String(invalid));
      root.querySelector('[data-next]').disabled = integer &&
        (invalid || !run.responses[question.id]?.answer?.trim());
      const isFlagged = Boolean(run.responses[question.id]?.flag);
      flag.setAttribute('aria-pressed', String(isFlagged));
      flag.textContent = isFlagged ? 'Flagged' : 'Flag';
    }

    function write(patch) {
      try {
        const next = store.saveResponse(run.id, question.id, patch);
        if (!next) {
          render(view);
          return false;
        }
        run = next;
        saveText.textContent = 'Saved';
        updateNavigation();
        return true;
      } catch {
        saveText.textContent = 'Couldn’t save this change. Try again before leaving.';
        return false;
      }
    }
    function saveFields() {
      const response = run.responses[question.id] || {};
      if (answer.value === (response.answer || '') && working.value === (response.working || '')) return true;
      return write({ answer: answer.value, working: working.value });
    }

    answer.addEventListener('input', saveFields);
    working.addEventListener('input', () => {
      saveFields();
      clearTimeout(previewTimer);
      previewTimer = setTimeout(previewWorking, 100);
    });
    flag.onclick = () => write({ flag: !run.responses[question.id]?.flag });
    mountSketch(root.querySelector('.exam-sketch'), saved.sketch || [], sketch => write({ sketch }));
    updateNavigation();

    function move(index) {
      if (!saveFields()) return;
      const next = moveTo(run, index);
      if (next) showSitting(paper, questions, next, true);
      else if (next === null) render(view);
    }
    nav.forEach((button, index) => button.onclick = () => move(index));
    root.querySelector('[data-previous]').onclick = () => move(currentIndex - 1);
    root.querySelector('[data-next]').onclick = () => currentIndex + 1 === questions.length ? confirmSubmit() : move(currentIndex + 1);

    function finish(expired = false) {
      try {
        if (!expired && !saveFields()) return;
        const result = store.submit(run.id, expired);
        if (!result) return;
        clearInterval(interval);
        openReport(result.id);
      } catch {
        saveText.textContent = 'Submission could not be saved. Your previous responses are still stored. Try again.';
      }
    }

    function confirmSubmit() {
      if (!saveFields()) return;
      const gaps = questionGaps(questions, run.responses);
      const gapRow = (label, list) => list.length ? `<div><strong>${label}</strong>
        <div class="exam-gap-questions">${list.map(number => `<button type="button" data-back-question="${number}">${number}</button>`).join('')}</div></div>` : '';
      dialog.innerHTML = `<h2 id="exam-submit-title">Submit this sitting?</h2>
        <p>${run.deadline === null ? 'Your responses will be locked.' : `Time left <b data-dialog-clock>${displayTime(remaining(run))}</b>. Your responses will be locked.`}</p>
        <div class="exam-gaps">${gapRow('Unanswered', gaps.unanswered)}
          ${gapRow('Check answer format', gaps.invalid)}
          ${gapRow('Written working missing', gaps.missingWorking)}
          ${gapRow('Flagged for review', questions.filter(q => run.responses[q.id]?.flag).map(q => q.number))}</div>
        <div class="row"><button type="button" class="btn ghost" data-cancel-submit autofocus>Keep working</button>
          <button type="button" class="btn warn" data-confirm-submit>Submit and lock</button></div>`;
      dialog.querySelector('[data-cancel-submit]').onclick = () => dialog.close();
      dialog.querySelector('[data-confirm-submit]').onclick = () => finish();
      dialog.querySelectorAll('[data-back-question]').forEach(button => {
        button.onclick = () => move(questions.findIndex(q => q.number === button.dataset.backQuestion));
      });
      dialog.showModal();
    }

    root.querySelector('[data-end-exam]').onclick = confirmSubmit;
    function updateClock() {
      const seconds = run.deadline === null ? Math.floor(Math.max(0, Date.now() - run.startedAt) / 1000) : remaining(run);
      const text = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
        .map(part => String(part).padStart(2, '0')).join(':');
      if (timer.textContent !== text) timer.textContent = text;
      timer.parentElement.classList.toggle('exam-clock-warning', run.deadline !== null && seconds <= 300);
      const dialogClock = dialog.querySelector('[data-dialog-clock]');
      if (dialogClock) dialogClock.textContent = timer.textContent;
      if (run.deadline !== null && seconds === 0) finish(true);
    }
    sync = () => {
      try {
        const state = store.current();
        if (state.active?.id !== run.id) {
          const result = state.attempts.find(attempt => attempt.id === run.id);
          if (result) openReport(result.id);
          else render('exams');
        } else {
          const hasFocus = root.contains(document.activeElement) &&
            [answer, working].includes(document.activeElement);
          run = state.active;
          const updated = run.responses[question.id] || {};
          if (!hasFocus) {
            answer.value = updated.answer || '';
            working.value = updated.working || '';
            previewWorking();
          }
          updateNavigation();
        }
      } catch {
        saveText.textContent = 'Couldn’t synchronise this sitting.';
      }
    };
    interval = setInterval(updateClock, 250);
    updateClock();
    if (focusQuestion) {
      window.scrollTo(0, 0);
      root.querySelector('#exam-question-title').focus({ preventScroll: true });
    }
  }

  function reviewRow(paper, row, result) {
    const { question, response, key, status, manuallyScored } = row;
    const review = result.reviews[question.id] || {};
    const label = labelFor(paper, question.number);
    const tone = resultTone(row);
    const options = values => values.map(([value, name]) =>
      `<option value="${value}"${String(value) === String(review.mark ?? '') ? ' selected' : ''}>${name}</option>`).join('');
    const hasWorking = response.working?.trim() || response.sketch?.length;
    const answerReview = question.answerFormat !== 'written' && (status === 'review' || review.answerVerdict);
    return `<details class="exam-result-row" data-review-id="${question.id}" data-status="${tone}">
      <summary><strong>${label}</strong><span data-result-status>${reviewStatus(row)}</span><span class="exam-result-status ${tone}">${resultMark(row)}</span></summary>
      <div class="exam-result-body">
        ${mathMarkup(question, paper)}
        <div class="exam-answer-comparison">
          <div><span>Your final answer</span><div class="exam-maths" data-result-answer></div></div>
          ${key.answer === null ? '' : '<div><span>Answer key</span><div class="exam-maths" data-result-key></div></div>'}
        </div>
        <section aria-label="Submitted working">
          <h3>Your working</h3>
          ${hasWorking ? `<div class="exam-maths exam-recorded-work" data-result-working></div>
            ${response.sketch?.length ? '<canvas class="exam-result-sketch" width="720" height="420" aria-label="Submitted sketch"></canvas>' : ''}` :
            '<p class="sub">No working recorded.</p>'}
        </section>
        <details class="exam-model-solution"><summary>Worked solution</summary>
          <div class="exam-maths">${key.pages ? paperPages(paper.solutionFile, key.pages, 'Worked solution') :
            key.solution + (key.images || []).map((source, index) =>
              questionFigure(source, `Worked solution diagram ${index + 1} for ${label.toLowerCase()}`)).join('')}</div>
        </details>
        <form class="exam-review-form">
          <h3>Review the working</h3>
          ${manuallyScored ? `<label>Marks after reviewing the response
            <select name="mark">${options([['', 'Not marked'], ...Array.from({ length: question.marks + 1 }, (_, mark) => [mark, `${mark} / ${question.marks}`])])}</select>
            </label>` : ''}
          ${answerReview ? `<label>Final answer assessment <select name="answerVerdict">
            ${[['', 'Use answer check'], ['correct', 'Equivalent to the key'], ['incorrect', 'Different from the key']].map(([value, name]) =>
              `<option value="${value}"${value === (review.answerVerdict || '') ? ' selected' : ''}>${name}</option>`).join('')}
          </select></label>` : ''}
          <label>Working assessment <select name="verdict">
            ${[['', 'Not reviewed'], ['sound', 'Sound reasoning'], ['partial', 'Some steps missing'], ['check', 'Needs correction']].map(([value, name]) =>
              `<option value="${value}"${value === (review.verdict || '') ? ' selected' : ''}>${name}</option>`).join('')}
          </select></label>
          <label>Feedback <textarea name="note" rows="2" maxlength="${fieldLimits.note}" placeholder="Record the key step or correction…">${escapeHtml(review.note)}</textarea></label>
          <div class="row"><button type="submit" class="btn small ghost">Save review</button><span role="status" data-review-status></span></div>
        </form>
      </div>
    </details>`;
  }

  function summarize(grade) {
    return { score: grade.score, max: grade.max, pending: grade.pending };
  }

  function showReport(paper, questions, solutions, result) {
    let grade = gradePaper(questions, result.responses, solutions, result.reviews);
    const summary = summarize(grade);
    try {
      if (JSON.stringify(summary) !== JSON.stringify(result.summary)) {
        result = store.editResult(result.id, old => ({ ...old, summary })) || result;
      }
      onExamActivity();
      if (paper.mock) onMockResult(paper.legacyId, result);
    } catch {
      // The locked responses are still in storage and can be reopened.
    }
    show(`<div class="exam-centre exam-report">
      <a class="crumb" href="#/exams${paper.team ? '/team' : ''}">← Exam centre</a>
      <h1>${escapeHtml(paper.title)} results</h1>
      <div class="card exam-report-top">
        <div><span class="exam-clock-label">${grade.max ? 'Score' : 'Parts reviewed'}</span><div class="score" data-exam-score></div></div>
        <div>
          <p>${result.expired ? 'Time expired. Your responses were submitted.' : 'Your sitting has been submitted.'}
            Time used ${displayTime(examSeconds(result.submittedAt - result.startedAt))}.</p>
          <p class="sub" data-exam-report-note></p>
        </div>
      </div>
      <div class="exam-report-tools"><label>Show <select data-filter-results>
        <option value="all">${paper.team ? 'All parts' : 'All questions'}</option>
        <option value="attention">${grade.max ? 'Missed or pending' : 'Unreviewed'}</option>
        <option value="correct">${grade.max ? 'Full marks' : 'Reviewed'}</option>
      </select></label><button type="button" class="btn small ghost" data-print-exam>Print / save PDF</button></div>
      <section class="exam-result-list" aria-label="Question results">${grade.rows.map(row => reviewRow(paper, row, result)).join('')}</section>
      <p data-empty-filter hidden>No questions match this filter.</p>
      ${paper.mock ? `<p><a href="#/exam/${paper.id}">Start a new mock sitting</a></p>` :
        `<p class="exam-credit">Source: WAJO (Western Australian Junior Mathematics Olympiad).
          <a href="${paper.solutionFile}${paper.team ? `#page=${paper.solutionPage}` : ''}" target="_blank" rel="noopener">Worked solutions (PDF)</a></p>`}
    </div>`);
    const root = app.querySelector('.exam-report');
    const filter = root.querySelector('[data-filter-results]');
    const resultRows = [...root.querySelectorAll('.exam-result-row')];

    function refresh() {
      const reviewed = grade.rows.filter(row => row.reviewed).length;
      root.querySelector('[data-exam-score]').textContent = grade.max ? `${grade.score} / ${grade.max}` : `${reviewed} / ${questions.length}`;
      const unit = paper.team ? 'part' : 'question';
      root.querySelector('[data-exam-report-note]').textContent = grade.pending ?
        `${grade.pending} ${unit}${grade.pending === 1 ? ' is' : 's are'} waiting for review.${grade.max ? ' The score is provisional.' : ''}` :
        `${paper.team ? `${reviewed} reviewed` : `${grade.correct} final answers confirmed`} · ${grade.unanswered} unanswered`;
      let visible = 0;
      for (const [index, element] of resultRows.entries()) {
        const row = grade.rows[index];
        const tone = resultTone(row);
        element.dataset.status = tone;
        const status = element.querySelector('.exam-result-status');
        status.className = `exam-result-status ${tone}`;
        status.textContent = resultMark(row);
        element.querySelector('[data-result-status]').textContent = reviewStatus(row);
        element.hidden = filter.value === 'attention' ? tone === 'correct' : filter.value === 'correct' && tone !== 'correct';
        if (!element.hidden) visible++;
      }
      root.querySelector('[data-empty-filter]').hidden = visible > 0;
    }

    for (const [index, element] of resultRows.entries()) {
      const row = grade.rows[index];
      let rendered;
      function populate() {
        if (rendered) return rendered;
        const learner = element.querySelector('[data-result-answer]');
        workingPreview(learner, row.response.answer?.trim() || 'Unanswered', plainMath);
        const expected = element.querySelector('[data-result-key]');
        if (expected) workingPreview(expected, String(row.key.answer), plainMath);
        const working = element.querySelector('[data-result-working]');
        if (working) workingPreview(working, row.response.working || '', plainMath);
        const sketch = element.querySelector('canvas');
        if (sketch) paintSketch(sketch, row.response.sketch);
        activate(paper, element.querySelector('.exam-result-body'));
        rendered = loadPaperPages(element.querySelector('.exam-result-body'));
        return rendered;
      }
      element.addEventListener('toggle', () => { if (element.open) populate(); });
      element.populateForPrint = populate;
      element.querySelector('form').onsubmit = event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const selected = form.get('mark');
        const review = { mark: selected ? Number(selected) : null, verdict: form.get('verdict'),
          note: form.get('note'), answerVerdict: form.get('answerVerdict') || '' };
        const status = element.querySelector('[data-review-status]');
        try {
          const stored = store.editResult(result.id, old => {
            const reviews = { ...old.reviews, [row.question.id]: review };
            grade = gradePaper(questions, old.responses, solutions, reviews);
            return { ...old, reviews, summary: summarize(grade) };
          });
          if (!stored) throw new Error('Sitting is no longer available.');
          result = stored;
          if (paper.mock) onMockResult(paper.legacyId, result);
          refresh();
          status.textContent = 'Review saved.';
        } catch {
          status.textContent = 'Review couldn’t be saved. Please try again.';
        }
      };
    }
    filter.onchange = refresh;
    root.querySelector('[data-print-exam]').onclick = async () => {
      const states = resultRows.map(element => ({ open: element.open, hidden: element.hidden }));
      const solutionsOpen = resultRows.map(element => element.querySelector('.exam-model-solution').open);
      await Promise.all(resultRows.map(element => {
        element.hidden = false;
        element.open = true;
        element.querySelector('.exam-model-solution').open = true;
        return element.populateForPrint();
      }));
      window.addEventListener('afterprint', () => {
        resultRows.forEach((element, index) => {
          element.open = states[index].open;
          element.hidden = states[index].hidden;
          element.querySelector('.exam-model-solution').open = solutionsOpen[index];
        });
      }, { once: true });
      window.print();
    };
    refresh();
  }

  async function render(route) {
    clearInterval(interval);
    sync = hiddenSync = null;
    view = route;
    const version = ++renderVersion;
    const [kind, id] = route.split('/');
    show('<div class="exam-centre"><p role="status">Loading exam centre…</p></div>');
    try {
      if (kind === 'exams' || kind === 'mocks') {
        await listPapers(version, kind === 'mocks');
        return;
      }
      if (kind === 'exam-result') {
        const result = store.current().attempts.find(run => run.id === id);
        if (!result) throw new Error('This sitting is saved on the browser where it was taken.');
        const paper = await findPaper(result.paperId);
        if (!paper) throw new Error('This paper could not be found.');
        const [questions, solutions] = await Promise.all([questionsFor(paper), solutionsFor(paper)]);
        if (version === renderVersion) showReport(paper, questions, solutions, result);
        return;
      }
      const paper = await findPaper(id);
      if (!paper) throw new Error('This paper could not be found.');
      const questions = await questionsFor(paper);
      if (version !== renderVersion) return;
      migrate(paper);
      const state = store.current();
      if (state.active?.paperId === paper.id) showSitting(paper, questions, state.active);
      else showStart(paper, questions, state);
    } catch (error) {
      if (version === renderVersion) problemError(error, route);
    }
  }

  window.addEventListener('storage', event => {
    if (event.key === store.storageKey || event.key === null) sync?.();
  });
  window.addEventListener('resize', () => hiddenSync?.());
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) hiddenSync?.();
  });
  return {
    render,
    leave() {
      renderVersion++;
      clearInterval(interval);
      sync = hiddenSync = null;
    },
    exportState: store.exportState,
    validateBackup: store.validateBackup,
    restore: store.restore,
    reset: store.reset,
  };
}
