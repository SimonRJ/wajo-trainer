/* WAJO Trainer — progress stays in this browser. */
import { createExamCentre } from './exam.mjs?v=training';
import { studyTopics } from './exam-training.mjs';
(function () {
  "use strict";
  var W = window.WAJO, app = document.getElementById("app"), KEY = "wajo.v1", tick = null;

  /* ---------- storage ---------- */
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { mem = {}; }
    mem.p = mem.p || {}; mem.redos = mem.redos || {}; mem.mocks = mem.mocks || {}; mem.team = mem.team || {};
    mem.days = mem.days || []; mem.read = mem.read || {};
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* private mode: keep in memory */ } }
  function saveMockResult(id, result) {
    var S = load(), record = S.mocks[id] = S.mocks[id] || { hist: [] };
    var prior = record.hist.findIndex(function (entry) { return entry.examId === result.id; });
    var entry = { examId: result.id, score: result.summary.score, d: new Date(result.submittedAt).toLocaleDateString("en-AU"),
      min: Math.round((result.submittedAt - result.startedAt) / 60000), timed: result.deadline !== null };
    if (prior < 0) record.hist.push(entry);
    else record.hist[prior] = entry;
    record.best = Math.max(0, ...record.hist.map(function (item) { return item.score || 0; }));
    save();
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function touchDay() { var S = load(), t = today(); if (S.days.indexOf(t) < 0) { S.days.push(t); save(); } }
  function streak() {
    var S = load(), n = 0, d = new Date();
    function f(x) { return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
    if (S.days.indexOf(f(d)) < 0) d.setDate(d.getDate() - 1);
    while (S.days.indexOf(f(d)) >= 0) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ---------- helpers ---------- */
  var ALL = [], BYID = {};
  var M = W.M || function (x) { return x; };
  W.modules.forEach(function (m) { m.lesson = M(m.lesson); m.problems.forEach(function (p) { p.q = M(p.q); p.h = M(p.h); p.s = M(p.s); p.mod = m; ALL.push(p); BYID[p.id] = p; }); });
  W.mocks.forEach(function (m) { m.qs.forEach(function (q) { q.q = M(q.q); q.s = M(q.s); }); });
  W.team.forEach(function (t) { t.intro = M(t.intro); t.parts.forEach(function (p) { p.q = M(p.q); p.a = M(p.a); }); });
  function solved(id) {
    var S = load(), redo = S.redos[id];
    return Boolean(S.p[id]?.s || redo?.s || redo?.solvedBefore);
  }
  function solvedAlone(record) { return Boolean(record?.s && !record.h && !record.r); }
  function needsReview(p) {
    var S = load(), record = S.p[p.id];
    return Boolean(record && (record.h || record.r || record.t >= 2) && !solvedAlone(S.redos[p.id]));
  }
  function modPct(m) { var n = m.problems.filter(function (p) { return solved(p.id); }).length; return Math.round(100 * n / m.problems.length); }
  function totalSolved() { return ALL.filter(function (p) { return solved(p.id); }).length; }
  function bestMock() { var S = load(), b = null; W.mocks.forEach(function (m) { var r = S.mocks[m.id]; if (r && r.best != null && (b == null || r.best > b)) b = r.best; }); return b; }
  function h(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function lvl(d) { return "★★★★".slice(0, d) + "☆☆☆☆".slice(0, 4 - d); }
  function fmt(sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2); }
  function mountPracticeTimer(minutes, record) {
    var clock = document.getElementById("tleft"), button = document.getElementById("practice-timer");
    function update() {
      var running = Number.isFinite(record.timerEnds) && record.timerEnds > Date.now();
      var text = running ? fmt(Math.ceil((record.timerEnds - Date.now()) / 1000)) + " left" :
        record.timerEnds ? "Time is up" : fmt(minutes * 60);
      if (clock.textContent !== text) clock.textContent = text;
      button.disabled = running;
      if (!running) clearInterval(tick);
    }
    button.onclick = function () {
      record.timerEnds = Date.now() + minutes * 60000;
      save();
      clearInterval(tick);
      tick = setInterval(update, 250);
      update();
    };
    if (Number.isFinite(record.timerEnds) && record.timerEnds > Date.now()) tick = setInterval(update, 250);
    update();
  }
  function parseAns(v) {
    v = String(v).trim().normalize("NFKC").replace(/−/g, "-");
    if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(v)) return null;
    var value = Number(v.replace(/,/g, ""));
    return Number.isSafeInteger(value) ? value : null;
  }
  var exams = createExamCentre({
    app: app, show: h, mocks: W.mocks, plainMath: M,
    onMockResult: saveMockResult, onExamActivity: touchDay,
    legacyRun: function () { return load().run; },
    discardLegacy: function () { delete load().run; save(); }
  });

  /* ---------- problem card ---------- */
  function probHTML(p, n, redo = false) {
    var S = load(), r = (redo ? S.redos : S.p)[p.id] || {};
    return '<div class="prob' + (r.s ? " done" : "") + '" data-id="' + p.id + '"' + (redo ? ' data-practice-redo' : '') + '>' +
      '<div class="ptop"><span>' + (n ? "Problem " + n + " · " : "") + p.mod.title + '</span><span class="lvl" title="Level ' + p.d + ' of 4">' + lvl(p.d) + "</span></div>" +
      '<p class="pq">' + p.q + "</p>" +
      '<div class="row"><input class="ans" inputmode="' + (p.a < 0 ? 'text' : 'numeric') + '" autocomplete="off" placeholder="Answer" aria-label="Your answer"' + (r.s ? ' value="' + p.a + '"' : "") + ">" +
      '<button class="btn small" data-act="check">Check</button>' +
      '<button class="btn ghost small" data-act="hint">Hint</button>' +
      '<button class="btn ghost small" data-act="sol">Solution</button></div>' +
      '<div class="out" aria-live="polite">' + (r.s ? '<p class="fb ok">✓ Solved' + (r.r || r.h ? " (with help)" : "") + "</p>" : "") + "</div></div>";
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var card = b.closest(".prob"); if (!card) return;
    var p = BYID[card.dataset.id], S = load(), redo = card.hasAttribute("data-practice-redo");
    var records = redo ? S.redos : S.p, r = records[p.id] = records[p.id] || { t: 0 };
    var out = card.querySelector(".out"), act = b.dataset.act;
    touchDay();
    if (act === "hint") { if (!r.s) r.h = 1; if (!out.querySelector(".hint")) out.insertAdjacentHTML("beforeend", '<div class="hint"><b>Hint:</b> ' + p.h + "</div>"); }
    if (act === "sol") { if (!r.s) r.r = 1; if (!out.querySelector(".sol")) out.insertAdjacentHTML("beforeend", '<div class="sol"><b>Solution:</b> ' + p.s + "</div>"); }
    if (act === "check") {
      var v = parseAns(card.querySelector(".ans").value), fb = out.querySelector(".fb");
      if (fb) fb.remove();
      if (v === null) { out.insertAdjacentHTML("afterbegin", '<p class="fb no">Type a whole number.</p>'); }
      else if (v === p.a) {
        if (!r.s) { r.s = 1; r.ts = Date.now(); }
        card.classList.add("done");
        out.insertAdjacentHTML("afterbegin", '<p class="fb ok">✓ Correct!' + (!redo && r.t === 0 && !r.r && !r.h ? " First go, no help." : "") + "</p>");
        if (!out.querySelector(".sol")) out.insertAdjacentHTML("beforeend", '<div class="sol"><b>Solution:</b> ' + p.s + "</div>");
      } else {
        if (!r.s) r.t++;
        card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
        out.insertAdjacentHTML("afterbegin", '<p class="fb no">Not yet. ' + (r.t >= 2 ? "Try the hint, or re-read the question carefully." : "Check your working and try again.") + "</p>");
      }
    }
    save();
  });
  app.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList.contains("ans")) { var c = e.target.closest(".prob"); if (c) c.querySelector('[data-act="check"]').click(); }
  });

  /* ---------- views ---------- */
  var PLAN = [
    ["Week 1", "tools", "Learn the eight moves. Finish every toolkit problem."],
    ["Week 2", "divis", "Divisibility tests and primes until they are automatic."],
    ["Week 3", "factors", "Divisor counting, GCD and LCM."],
    ["Week 4", "words,stats", "Practise rates, word problems and weighted averages."],
    ["Week 5", "mod,digits", "Remainders and digit puzzles."],
    ["Week 6", "seq", "Sequences and sums. Then sit <a href='#/mocks'>Mock Paper A</a> under exam conditions."],
    ["Week 7", "angles,area", "Angle chasing, Pythagoras and similar triangles."],
    ["Week 8", "circles", "Circles: the classic final question."],
    ["Week 9", "count", "Counting methods. Then sit <a href='#/mocks'>Mock Paper B</a>."],
    ["Week 10", "logic,power", "Logic and invariants; algebra power tools."],
    ["Week 11", "teamskills", "Team skills and all three <a href='#/team'>team investigations</a>."],
    ["Week 12", "", "Sit <a href='#/mocks'>Mock Paper C</a>, clear your review list, then work through the <a href='#/past'>real past papers</a>, newest first."]
  ];
  function modById(id) { return W.modules.filter(function (m) { return m.id === id; })[0]; }

  function home() {
    var S = load(), ts = totalSolved(), bm = bestMock();
    var next = W.modules.filter(function (m) { return modPct(m) < 80; })[0];
    var examData;
    try { examData = exams.exportState(); } catch { /* Other training is still available. */ }
    var lastExam = examData?.attempts.at(-1);
    h('<h1>Train for the WA Junior Mathematics Olympiad</h1>' +
      '<p class="sub">Build skills for Years 7–9 with ' + W.modules.length + ' lessons, ' + ALL.length + ' practice problems, timed past papers and original mocks.</p>' +
      '<section class="training-start" aria-labelledby="training-start"><h2 id="training-start">What would you like to work on?</h2><div class="row">' +
      '<a class="btn" href="#/practice/daily">Do the Daily Five</a>' +
      (examData?.active ? '<a class="btn ghost" href="#/exam/' + examData.active.paperId + '">Resume exam</a>' : '<a class="btn ghost" href="#/exams">Sit a timed paper</a>') +
      (lastExam ? '<a class="btn ghost" href="#/exam-result/' + lastExam.id + '">Review last exam</a>' : '<a class="btn ghost" href="#/practice">Practise by topic</a>') +
      '</div></section>' +
      '<div class="stats"><div class="stat"><b>' + ts + "/" + ALL.length + '</b><span>problems solved</span></div>' +
      '<div class="stat"><b>' + streak() + '</b><span>day streak</span></div>' +
      '<div class="stat"><b>' + (bm == null ? "–" : bm + "/40") + '</b><span>best mock score</span></div>' +
      '<div class="stat"><b>' + Object.keys(S.read).length + "/" + W.modules.length + '</b><span>lessons read</span></div></div>' +
      (next ? '<p><a href="#/m/' + next.id + '">' + (ts ? 'Continue learning · ' : 'Start learning · ') + next.title + '</a></p>' : '') +
      '<h2>What is WAJO?</h2><div class="card"><ul style="margin:0;padding-left:1.2em">' +
      "<li>A problem-solving competition for WA students in <b>Years 7, 8 and 9</b>, run at UWA by the WA Mathematical Olympiads Committee since 1999. Entry is through your school.</li>" +
      "<li><b>Individual paper:</b> 100 minutes, no calculator. The question count, answer format and written-working rules follow the paper year.</li>" +
      "<li><b>Team paper:</b> usually 45–50 minutes, teams of four, one long investigation in parts, some needing written explanations.</li>" +
      "<li>Usually held in September or October. Use the <a href='#/past'>past-paper archive</a> for PDFs or the <a href='#/exams'>Exam centre</a> to sit a paper on screen.</li></ul></div>" +
      '<h2>The 12-week plan</h2><p class="sub">About 30–40 minutes a day, five days a week. Faster is fine. The order matters more than the speed.</p>' +
      '<div class="card"><table class="plan">' + PLAN.map(function (r) {
        var mods = r[1] ? r[1].split(",").map(function (id) { var m = modById(id); return '<a href="#/m/' + id + '">' + m.title + "</a> (" + modPct(m) + "%)"; }).join(" + ") + ". " : "";
        return "<tr><td>" + r[0] + "</td><td>" + mods + r[2] + "</td></tr>";
      }).join("") + "</table></div>" +
      '<h2>How to use this site</h2><div class="card"><ol style="margin:0;padding-left:1.2em"><li>Read the lesson with pencil and paper. Try each worked example before reading its solution.</li><li>Do the problems. Give each one a real attempt (at least 5 minutes) before opening the hint.</li><li>If you needed the solution, the problem goes on your <a href="#/practice/review">review list</a>. Redo it a few days later.</li><li>Sit the mock papers timed, in one sitting, with no calculator.</li></ol></div>');
  }

  function learn() {
    var strands = [];
    W.modules.forEach(function (m) { if (strands.indexOf(m.strand) < 0) strands.push(m.strand); });
    h("<h1>Learn</h1><p class='sub'>Learn the main problem-solving techniques. Follow the 12-week plan on the home page, or pick a topic to strengthen.</p>" +
      strands.map(function (s) {
        return "<h2>" + s + '</h2><div class="grid">' + W.modules.filter(function (m) { return m.strand === s; }).map(function (m) {
          var pc = modPct(m);
          return '<a class="mod" href="#/m/' + m.id + '"><span class="ic">' + m.icon + "</span><h3>" + m.title + "</h3><p>" + m.blurb + '</p><div class="bar"><i style="width:' + pc + '%"></i></div><p>' + pc + "% of " + m.problems.length + " problems</p></a>";
        }).join("") + "</div>";
      }).join(""));
  }

  function moduleView(id) {
    var m = modById(id); if (!m) return learn();
    var S = load(); if (!S.read[id]) { S.read[id] = 1; save(); }
    var i = W.modules.indexOf(m), nx = W.modules[i + 1];
    h('<a class="crumb" href="#/learn">← All modules</a><h1>' + m.icon + " " + m.title + '</h1><p class="sub">' + m.blurb + "</p>" +
      '<div class="lesson">' + m.lesson + "</div><h2>Practice problems</h2><p class='sub'>Stars show difficulty: ★ is like questions 1–4 on the paper, ★★★★ like questions 13–16.</p>" +
      m.problems.map(function (p, k) { return probHTML(p, k + 1); }).join("") +
      '<div class="row" style="margin-top:20px">' + (nx ? '<a class="btn" href="#/m/' + nx.id + '">Next: ' + nx.title + " →</a>" : '<a class="btn" href="#/mocks">Sit a mock paper →</a>') + "</div>");
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function practice(mode, arg, level) {
    var S = load(), list, title, sub, tools = '';
    if (mode === "daily") {
      if (!S.daily || S.daily.d !== today()) {
        var un = shuffle(ALL.filter(function (p) { return !solved(p.id); })), seen = {}, pick = [];
        un.forEach(function (p) { if (pick.length < 5 && !seen[p.mod.id]) { seen[p.mod.id] = 1; pick.push(p.id); } });
        un.forEach(function (p) { if (pick.length < 5 && pick.indexOf(p.id) < 0) pick.push(p.id); });
        S.daily = { d: today(), ids: pick }; save();
      }
      list = S.daily.ids.map(function (i) { return BYID[i]; }).filter(Boolean);
      title = "Daily Five"; sub = "Up to five unsolved problems from different topics.";
    } else if (mode === "review") {
      list = ALL.filter(needsReview);
      title = "Review list"; sub = "Try again without help. Your original work and progress stay recorded.";
    } else if (mode === "topic" && Object.hasOwn(studyTopics, arg)) {
      var topic = studyTopics[arg], selected = /^[1-4]$/.test(level || '') ? Number(level) : 0;
      list = ALL.filter(function (p) { return topic.modules.includes(p.mod.id) && (!selected || p.d === selected); })
        .sort(function (a, b) { return Number(solved(a.id)) - Number(solved(b.id)) || a.d - b.d; });
      title = topic.label; sub = "Start with an unsolved question. Change level to practise a particular difficulty.";
      tools = '<div class="training-topic-tools"><label>Level <select id="topic-level"><option value="">All levels</option>' +
        [1, 2, 3, 4].map(function (d) { return '<option value="' + d + '"' + (d === selected ? ' selected' : '') + '>Level ' + d + '</option>'; }).join('') +
        '</select></label><div class="row">' + topic.modules.map(function (id) {
          return '<a href="#/m/' + id + '">' + modById(id).title + '</a>';
        }).join('') + '</div></div>';
    } else if (mode === "level") {
      var d = parseInt(arg, 10) || 1; list = ALL.filter(function (p) { return p.d === d; }); title = "Level " + d + " problems"; sub = lvl(d) + " – like the " + d + "-mark questions on the individual paper.";
    } else {
      var rev = ALL.filter(needsReview).length;
      return h("<h1>Practice</h1><p class='sub'>Mixed practice keeps old topics fresh. In the real paper nobody tells you which topic a question belongs to.</p>" +
        '<div class="grid"><a class="mod" href="#/practice/daily"><span class="ic">📅</span><h3>Daily five</h3><p>Five unsolved problems from different topics.</p></a>' +
        '<a class="mod" href="#/practice/review"><span class="ic">🔁</span><h3>Review list</h3><p>' + rev + " problem" + (rev === 1 ? "" : "s") + " to redo without help.</p></a></div>" +
        '<h2>Practise by topic</h2><div class="grid">' +
        Object.entries(studyTopics).map(function ([key, topic]) {
          var problems = ALL.filter(function (p) { return topic.modules.includes(p.mod.id); });
          return '<a class="mod" href="#/practice/topic/' + key + '"><h3>' + topic.label + '</h3><p>' +
            problems.filter(function (p) { return solved(p.id); }).length + ' of ' + problems.length + ' solved</p></a>';
        }).join('') + '</div><h2>Practise by level</h2><div class="grid">' +
        [1, 2, 3, 4].map(function (d) { var L = ALL.filter(function (p) { return p.d === d; }), n = L.filter(function (p) { return solved(p.id); }).length; return '<a class="mod" href="#/practice/level/' + d + '"><span class="ic lvl">' + lvl(d) + "</span><h3>Level " + d + "</h3><p>" + n + " of " + L.length + " solved.</p></a>"; }).join("") + "</div>");
    }
    h('<a class="crumb" href="#/practice">← Practice</a><h1>' + title + '</h1><p class="sub">' + sub + "</p>" + tools +
      (mode === "review" && list.length ? '<p><button class="btn ghost small" id="fresh">Start fresh review</button></p>' : "") +
      (list.length ? list.map(function (p, k) { return probHTML(p, k + 1, mode === "review"); }).join("") :
        '<div class="card"><p>No problems in this set.</p><a href="#/practice">Choose another practice set</a></div>'));
    var f = document.getElementById("fresh");
    if (f) f.onclick = function () {
      list.forEach(function (p) {
        var prior = S.redos[p.id];
        S.redos[p.id] = { t: 0, solvedBefore: Boolean(prior?.s || prior?.solvedBefore) };
      });
      save();
      practice("review");
    };
    var levelSelect = document.getElementById("topic-level");
    if (levelSelect) levelSelect.onchange = function () {
      location.hash = '#/practice/topic/' + arg + (levelSelect.value ? '/' + levelSelect.value : '');
    };
  }

  /* ---------- past-paper downloads and score tracker ---------- */
  var REBUILT_PAPERS = {
    2006: "Reconstructed questions · official solutions",
    2026: "Reconstructed individual round · team paper pending"
  };
  function past() {
    var S = load(); S.past = S.past || {};
    S.archiveTimer = S.archiveTimer || {};
    var rows = "", done = 0;
    for (var y = 2026; y >= 2000; y--) {
      var r = S.past[y] || {}; if (r.done) done++;
      var path = "papers/wajo-" + y + "-";
      var score = Number.isInteger(r.score) ? r.score : "";
      rows += '<li class="paper-archive-year" aria-labelledby="past-' + y + '">' +
        '<div class="paper-archive-heading"><h2 id="past-' + y + '">' + y + '</h2><span>' +
        (REBUILT_PAPERS[y] || "Official pages · individual and team") + '</span></div>' +
        '<div class="paper-archive-links">' +
        '<a href="' + path + 'questions.pdf' + (y === 2026 ? '?v=2025-layout' : '') + '" target="_blank" rel="noopener" aria-label="WAJO ' + y + ' question paper (PDF)">Question paper <small>PDF</small></a>' +
        '<a href="' + path + 'solutions.pdf" target="_blank" rel="noopener" aria-label="WAJO ' + y + ' worked solutions (PDF)">Worked solutions <small>PDF</small></a>' +
        '<a href="#/exam/wajo-' + y + '" aria-label="Sit WAJO ' + y + ' individual paper online">Sit individual</a>' +
        (y <= 2025 ? '<a href="#/exam/wajo-' + y + '-team" aria-label="Sit WAJO ' + y + ' team paper online">Sit team</a>' : '') + '</div>' +
        '<div class="paper-archive-progress"><label>My score <input class="ans ps" inputmode="numeric" data-y="' + y +
        '" value="' + score + '"></label><label><input type="checkbox" class="pd" data-y="' + y + '"' +
        (r.done ? " checked" : "") + '> Done</label></div></li>';
    }
    h("<h1>Past papers and solutions</h1><p class='sub'>Open or save the question paper first. Use the separate worked solutions PDF to mark your answers. The paper gives the time limit for each round.</p>" +
      '<div class="timer"><span id="tleft" role="timer">100:00</span><button class="btn small" id="practice-timer">Start 100-minute individual timer</button></div>' +
      '<p class="sub"><span id="paper-archive-done">' + done + '</span> of 27 past papers done</p>' +
      '<ul class="paper-archive" aria-label="WAJO papers by year">' + rows + '</ul>' +
      '<p class="sub">Source: WAJO (Western Australian Junior Mathematics Olympiad). The 2026 individual round was reconstructed from the ProblemSolvingEducation practice compilation.</p>');
    app.querySelectorAll(".ps").forEach(function (i) { i.oninput = function () { var r = S.past[i.dataset.y] = S.past[i.dataset.y] || {}; var v = parseAns(i.value); if (v === null) delete r.score; else r.score = v; save(); touchDay(); }; });
    app.querySelectorAll(".pd").forEach(function (c) { c.onchange = function () {
      (S.past[c.dataset.y] = S.past[c.dataset.y] || {}).done = c.checked ? 1 : 0;
      done += c.checked ? 1 : -1;
      document.getElementById("paper-archive-done").textContent = done;
      save(); touchDay();
    }; });
    mountPracticeTimer(100, S.archiveTimer);
  }

  /* ---------- team round ---------- */
  function team() {
    var S = load();
    h("<h1>Team round</h1><p class='sub'>The team paper is one long investigation of an unfamiliar idea, answered in parts (A, B, C …), with some parts requiring full explanations. These three original investigations build that skill. Work with friends if you can, or alone with a 50-minute timer.</p>" +
      '<p><a class="btn ghost" href="#/exams/team">Sit a past team paper</a></p>' +
      '<div class="grid">' + W.team.map(function (t) {
        var r = S.team[t.id] || {}, got = 0, max = 0; t.parts.forEach(function (p, i) { max += p.m; got += +(r["m" + i] || 0); });
        return '<a class="mod" href="#/team/' + t.id + '"><span class="ic">🤝</span><h3>' + t.title + "</h3><p>" + t.parts.length + " parts · " + (r.marked ? "self-marked " + got + "/" + max : max + " marks") + "</p></a>";
      }).join("") + '</div><div class="card">First read <a href="#/m/teamskills">Team Paper &amp; Writing Explanations</a>. Write every answer in full sentences <b>before</b> revealing the model answer, then mark yourself honestly: full marks only if your explanation covers every case.</div>');
  }
  function teamView(id) {
    var t = W.team.filter(function (x) { return x.id === id; })[0]; if (!t) return team();
    var S = load(), r = S.team[id] = S.team[id] || {}, L = "ABCDEFGHIJKL";
    h('<a class="crumb" href="#/team">← Team round</a><h1>' + t.title + '</h1><div class="timer"><span id="tleft" role="timer">50:00</span><button class="btn small" id="practice-timer">Start 50-minute timer</button></div><div class="card">' + t.intro + "</div>" +
      t.parts.map(function (p, i) {
        var opts = ""; for (var k = 0; k <= p.m; k++) opts += "<option" + (+(r["m" + i] || 0) === k ? " selected" : "") + ">" + k + "</option>";
        return '<div class="prob"><div class="ptop"><span>Part ' + L[i] + "</span><span>[" + p.m + ' marks]</span></div><p class="pq">' + p.q + '</p><textarea data-i="' + i + '" placeholder="Write your answer and reasoning here (or on paper)…">' + (r["a" + i] || "").replace(/</g, "&lt;") + '</textarea><div class="row" style="margin-top:8px"><button class="btn ghost small" data-show="' + i + '">Show model answer</button><label>My mark: <select data-m="' + i + '">' + opts + "</select> / " + p.m + '</label></div><div class="sol" id="ma' + i + '" hidden><b>Model answer:</b> ' + p.a + "</div></div>";
      }).join("") + '<div class="card" id="ttotal"></div>');
    function total() { var got = 0, max = 0; t.parts.forEach(function (p, i) { max += p.m; got += +(r["m" + i] || 0); }); document.getElementById("ttotal").innerHTML = "<b>Self-marked total: " + got + " / " + max + "</b>"; }
    total();
    app.querySelectorAll("textarea").forEach(function (a) { a.oninput = function () { r["a" + a.dataset.i] = a.value; save(); }; });
    app.querySelectorAll("[data-show]").forEach(function (b) { b.onclick = function () { document.getElementById("ma" + b.dataset.show).hidden = false; touchDay(); }; });
    app.querySelectorAll("[data-m]").forEach(function (s) { s.onchange = function () { r["m" + s.dataset.m] = +s.value; r.marked = 1; save(); total(); }; });
    mountPracticeTimer(50, r);
  }

  /* ---------- tips ---------- */
  function tips() {
    h("<h1>Exam tips</h1><p class='sub'>Knowing the maths is half of it. The other half is spending 100 minutes wisely.</p>" + M(
      '<div class="key"><b>Before the day</b><ul><li>Know by heart: primes to 50, squares to 25², cubes to 10³, powers of 2 to 2¹⁰, and the Pythagorean triples.</li><li>Practise mental and written arithmetic. There is no calculator.</li><li>Sit at least three full timed papers so that 100 minutes feels familiar.</li><li>Sleep well. A rested brain spots patterns.</li></ul></div>' +
      '<div class="key"><b>Example pacing for the 2025 individual paper</b><table><tr><th>Questions</th><th>Marks each</th><th>Suggested time</th></tr><tr><td>1–4</td><td>1</td><td>about 10 minutes in total</td></tr><tr><td>5–8</td><td>2</td><td>about 20 minutes</td></tr><tr><td>9–12</td><td>3</td><td>about 30 minutes</td></tr><tr><td>13–16</td><td>4</td><td>about 30 minutes</td></tr><tr><td colspan="2">Checking</td><td>the last 10 minutes</td></tr></table></div>' +
      '<div class="key"><b>During the paper</b><ol><li><b>Read the question twice.</b> Identify exactly what it asks for, such as the largest value, the number of ways or a sum.</li><li><b>Secure the questions you know.</b> Start with questions where you can see an approach. Check the marks shown on the paper.</li><li><b>Flag and move on.</b> If you have made little progress after a few minutes, flag the question and return after completing others.</li><li><b>Choose where to spend time.</b> Read the higher-mark questions before deciding which one to try first.</li><li><b>Follow each question’s answer instructions.</b> Recent individual rounds use positive whole numbers below 1000. Some older questions accept other formats or require a written solution.</li><li><b>Check by a different route.</b> Substitute your answer back into the question, test a small case or estimate its size.</li></ol></div>' +
      '<div class="key"><b>When you are stuck</b><ul><li>Try a smaller version of the problem.</li><li>Draw a diagram or make a table.</li><li>Give the unknown a letter.</li><li>Ask "what stays the same?" and "what is the extreme case?"</li><li>Work backwards from what you want.</li></ul></div>' +
      '<div class="key"><b>In the team paper</b><ul><li>One person reads everything aloud first. Then split the parts.</li><li>Early parts are usually experiments. Do them carefully: later parts depend on them.</li><li>Appoint one scribe so the answer sheet is neat and consistent.</li><li>"Explain" means reasons, not examples. Write: claim, because, therefore.</li><li>With ten minutes left, stop exploring and write up what you have.</li></ul></div>' +
      '<div class="tip">After every practice paper keep an <b>error log</b>: the question, why you missed it, and the idea you learned. Read the log the night before the competition.</div>'));
  }

  /* ---------- progress ---------- */
  function progress() {
    var S = load();
    h("<h1>Progress</h1>" +
      '<div class="stats"><div class="stat"><b>' + totalSolved() + "/" + ALL.length + '</b><span>problems solved</span></div><div class="stat"><b>' + ALL.filter(function (p) { return solvedAlone(S.p[p.id]) || solvedAlone(S.redos[p.id]); }).length + '</b><span>solved with no help</span></div><div class="stat"><b>' + S.days.length + '</b><span>days practised</span></div><div class="stat"><b>' + streak() + '</b><span>current streak</span></div></div>' +
      '<div class="card"><table><tr><th>Module</th><th>Solved</th><th></th></tr>' + W.modules.map(function (m) { var pc = modPct(m), n = m.problems.filter(function (p) { return solved(p.id); }).length; return '<tr><td><a href="#/m/' + m.id + '">' + m.title + "</a></td><td>" + n + "/" + m.problems.length + '</td><td style="width:35%"><div class="bar" style="margin-top:8px"><i style="width:' + pc + '%"></i></div></td></tr>'; }).join("") + "</table></div>" +
      '<div class="card"><b>Exam history</b><p>Reopen a submitted paper and review the working from the <a href="#/exams">Exam centre</a>.</p></div>' +
      '<div class="card"><b>Mock papers</b><table>'  + W.mocks.map(function (m) { var r = S.mocks[m.id]; return "<tr><td>" + m.title + "</td><td>" + (r ? r.hist.map(function (x) { return x.score + "/40" + (x.timed ? "" : " (untimed)"); }).join(", ") : "not attempted") + "</td></tr>"; }).join("") + "</table></div>" +
      '<div class="card"><b>Backup</b><p class="sub">Download your progress, exam sittings, working and reviews. Restore the backup on another device to move them.</p><div class="row"><button class="btn small" id="exp">Download backup</button><label class="btn ghost small">Restore backup<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn ghost small" id="rst">Reset everything</button></div></div>');
    document.getElementById("exp").onclick = function () {
      try {
        var contents = { ...S, examCentre: exams.exportState() };
        var url = URL.createObjectURL(new Blob([JSON.stringify(contents)], { type: "application/json" }));
        var a = document.createElement("a");
        a.href = url;
        a.download = "wajo-progress-" + today() + ".json";
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } catch (error) { alert("Couldn’t create the backup. Check browser storage."); }
    };
    document.getElementById("imp").onchange = function (event) {
      var file = event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var { examCentre, ...progressData } = JSON.parse(reader.result);
          if (!progressData.p || typeof progressData.p !== "object") throw new Error();
          var savedExams = examCentre == null ? null : exams.validateBackup(examCentre);
          var oldProgress = localStorage.getItem(KEY);
          localStorage.setItem(KEY, JSON.stringify(progressData));
          try {
            if (savedExams) exams.restore(savedExams);
          } catch (error) {
            if (oldProgress === null) localStorage.removeItem(KEY);
            else localStorage.setItem(KEY, oldProgress);
            throw error;
          }
          mem = null;
          progress();
        } catch (error) { alert("Couldn’t restore this backup. Check the file and available browser storage."); }
      };
      reader.readAsText(file);
    };
    document.getElementById("rst").onclick = function () {
      if (!confirm("Erase all progress and exam sittings on this device?")) return;
      try {
        exams.reset();
        localStorage.removeItem(KEY);
        mem = null;
        progress();
      } catch (error) { alert("Couldn’t reset browser storage."); }
    };
  }

  /* ---------- router ---------- */
  function route() {
    clearInterval(tick);
    var parts = location.hash.replace(/^#\/?/, "").split("/"), r = parts[0] || "home", nav = r;
    exams.leave();
    if (r === "exams" || r === "exam" || r === "exam-result" || r === "exam-retry" || r === "mocks" || r === "mock") {
      nav = r === "mocks" || r === "mock" || parts[1]?.startsWith("mock-") ? "mocks" : "exams";
      exams.render(r === "mock" ? "exam/" + parts[1] : parts.join("/"));
    }
    else if (r === "m") { nav = "learn"; moduleView(parts[1]); }
    else if (r === "learn") learn();
    else if (r === "practice") practice(parts[1], parts[2], parts[3]);
    else if (r === "team") { if (parts[1]) teamView(parts[1]); else team(); }
    else if (r === "past") past();
    else if (r === "tips") tips();
    else if (r === "progress") progress();
    else { nav = "home"; home(); }
    document.querySelectorAll("#nav a").forEach(function (a) {
      var selected = a.dataset.r === nav;
      a.classList.toggle("on", selected);
      if (selected) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("hashchange", route);
  route();
})();
