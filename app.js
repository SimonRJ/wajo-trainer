/* WAJO Trainer – single-page app. No dependencies, no server, progress kept in localStorage. */
(function () {
  "use strict";
  var W = window.WAJO, app = document.getElementById("app"), KEY = "wajo.v1", tick = null;
  var MARKS = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];

  /* ---------- storage ---------- */
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { mem = {}; }
    mem.p = mem.p || {}; mem.mocks = mem.mocks || {}; mem.team = mem.team || {}; mem.days = mem.days || []; mem.read = mem.read || {};
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* private mode: keep in memory */ } }
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
  W.modules.forEach(function (m) { m.problems.forEach(function (p) { p.mod = m; ALL.push(p); BYID[p.id] = p; }); });
  function solved(id) { var r = load().p[id]; return r && r.s; }
  function modPct(m) { var n = m.problems.filter(function (p) { return solved(p.id); }).length; return Math.round(100 * n / m.problems.length); }
  function totalSolved() { return ALL.filter(function (p) { return solved(p.id); }).length; }
  function bestMock() { var S = load(), b = null; W.mocks.forEach(function (m) { var r = S.mocks[m.id]; if (r && r.best != null && (b == null || r.best > b)) b = r.best; }); return b; }
  function h(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function lvl(d) { return "★★★★".slice(0, d) + "☆☆☆☆".slice(0, 4 - d); }
  function fmt(sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2); }
  function parseAns(v) { v = String(v).replace(/[\s,]/g, ""); return /^-?\d+$/.test(v) ? parseInt(v, 10) : null; }

  /* ---------- problem card ---------- */
  function probHTML(p, n) {
    var r = load().p[p.id] || {};
    return '<div class="prob' + (r.s ? " done" : "") + '" data-id="' + p.id + '">' +
      '<div class="ptop"><span>' + (n ? "Problem " + n + " · " : "") + p.mod.title + '</span><span class="lvl" title="Level ' + p.d + ' of 4">' + lvl(p.d) + "</span></div>" +
      '<p class="pq">' + p.q + "</p>" +
      '<div class="row"><input class="ans" inputmode="numeric" autocomplete="off" placeholder="Answer" aria-label="Your answer"' + (r.s ? ' value="' + p.a + '"' : "") + ">" +
      '<button class="btn small" data-act="check">Check</button>' +
      '<button class="btn ghost small" data-act="hint">Hint</button>' +
      '<button class="btn ghost small" data-act="sol">Solution</button></div>' +
      '<div class="out">' + (r.s ? '<p class="fb ok">✓ Solved' + (r.r ? " (with help)" : "") + "</p>" : "") + "</div></div>";
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var card = b.closest(".prob"); if (!card) return;
    var p = BYID[card.dataset.id], S = load(), r = S.p[p.id] = S.p[p.id] || { t: 0 }, out = card.querySelector(".out"), act = b.dataset.act;
    touchDay();
    if (act === "hint") { r.h = 1; if (!out.querySelector(".hint")) out.insertAdjacentHTML("beforeend", '<div class="hint"><b>Hint:</b> ' + p.h + "</div>"); }
    if (act === "sol") { if (!r.s) r.r = 1; if (!out.querySelector(".sol")) out.insertAdjacentHTML("beforeend", '<div class="sol"><b>Solution:</b> ' + p.s + "</div>"); }
    if (act === "check") {
      var v = parseAns(card.querySelector(".ans").value), fb = out.querySelector(".fb");
      if (fb) fb.remove();
      if (v === null) { out.insertAdjacentHTML("afterbegin", '<p class="fb no">Type a whole number.</p>'); }
      else if (v === p.a) {
        if (!r.s) { r.s = 1; r.ts = Date.now(); }
        card.classList.add("done");
        out.insertAdjacentHTML("afterbegin", '<p class="fb ok">✓ Correct!' + (r.t === 0 && !r.r && !r.h ? " First go, no help." : "") + "</p>");
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
    ["Week 4", "words", "Word problems: quick, safe marks."],
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
    h('<h1>Train for the WA Junior Mathematics Olympiad</h1>' +
      '<p class="sub">A complete course for keen students in Years 7–9: 14 lessons, ' + ALL.length + ' practice problems with hints and full solutions, 3 timed mock papers and 3 team investigations.</p>' +
      '<div class="stats"><div class="stat"><b>' + ts + "/" + ALL.length + '</b><span>problems solved</span></div>' +
      '<div class="stat"><b>' + streak() + '</b><span>day streak</span></div>' +
      '<div class="stat"><b>' + (bm == null ? "–" : bm + "/40") + '</b><span>best mock score</span></div>' +
      '<div class="stat"><b>' + Object.keys(S.read).length + "/" + W.modules.length + '</b><span>lessons read</span></div></div>' +
      '<div class="card"><h3 style="margin-top:0">Today</h3><div class="row">' +
      (next ? '<a class="btn" href="#/m/' + next.id + '">' + (ts ? "Continue: " : "Start: ") + next.title + "</a>" : '<a class="btn" href="#/mocks">All modules done. Sit a mock paper</a>') +
      '<a class="btn ghost" href="#/practice/daily">Daily five</a></div></div>' +
      '<h2>What is WAJO?</h2><div class="card"><ul style="margin:0;padding-left:1.2em">' +
      "<li>A problem-solving competition for WA students in <b>Years 7, 8 and 9</b>, run at UWA by the WA Mathematical Olympiads Committee since 1999. Entry is through your school.</li>" +
      "<li><b>Individual paper:</b> 100 minutes, 16 questions, no calculator. Every answer is a positive whole number less than 1000. Questions 1–4 are worth 1 mark, 5–8 worth 2, 9–12 worth 3 and 13–16 worth 4: 40 marks in total.</li>" +
      "<li><b>Team paper:</b> about 50 minutes, teams of four, one long investigation in parts, some needing written explanations.</li>" +
      "<li>Usually held in September or October. Dates and entry details change each year, so check the <a href='https://enrichedmaths.maths.uwa.edu.au/wajo/' target='_blank' rel='noopener'>official WAJO page</a>, and see <a href='#/past'>Real past papers</a> for every past paper with solutions.</li></ul></div>" +
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
    h("<h1>Learn</h1><p class='sub'>Fourteen modules covering everything WAJO tests. Follow the 12-week plan on the home page, or pick what you need.</p>" +
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
  function practice(mode, arg) {
    var S = load(), list, title, sub;
    if (mode === "daily") {
      if (!S.daily || S.daily.d !== today()) {
        var un = shuffle(ALL.filter(function (p) { return !solved(p.id); })), seen = {}, pick = [];
        un.forEach(function (p) { if (pick.length < 5 && !seen[p.mod.id]) { seen[p.mod.id] = 1; pick.push(p.id); } });
        un.forEach(function (p) { if (pick.length < 5 && pick.indexOf(p.id) < 0) pick.push(p.id); });
        S.daily = { d: today(), ids: pick }; save();
      }
      list = S.daily.ids.map(function (i) { return BYID[i]; }).filter(Boolean); title = "Daily five"; sub = "Five unsolved problems from different topics. A new set appears each day.";
    } else if (mode === "review") {
      list = ALL.filter(function (p) { var r = S.p[p.id]; return r && (r.r || r.t >= 2); }); title = "Review list"; sub = "Problems where you needed the solution or several tries. Press 'Start fresh' and solve them again without help.";
    } else if (mode === "level") {
      var d = parseInt(arg, 10) || 1; list = ALL.filter(function (p) { return p.d === d; }); title = "Level " + d + " problems"; sub = lvl(d) + " – like the " + d + "-mark questions on the individual paper.";
    } else {
      var rev = ALL.filter(function (p) { var r = S.p[p.id]; return r && (r.r || r.t >= 2); }).length;
      return h("<h1>Practice</h1><p class='sub'>Mixed practice keeps old topics fresh. In the real paper nobody tells you which topic a question belongs to.</p>" +
        '<div class="grid"><a class="mod" href="#/practice/daily"><span class="ic">📅</span><h3>Daily five</h3><p>Five unsolved problems from different topics.</p></a>' +
        '<a class="mod" href="#/practice/review"><span class="ic">🔁</span><h3>Review list</h3><p>' + rev + " problem" + (rev === 1 ? "" : "s") + " to redo without help.</p></a>" +
        [1, 2, 3, 4].map(function (d) { var L = ALL.filter(function (p) { return p.d === d; }), n = L.filter(function (p) { return solved(p.id); }).length; return '<a class="mod" href="#/practice/level/' + d + '"><span class="ic lvl">' + lvl(d) + "</span><h3>Level " + d + "</h3><p>" + n + " of " + L.length + " solved.</p></a>"; }).join("") + "</div>");
    }
    h('<a class="crumb" href="#/practice">← Practice</a><h1>' + title + '</h1><p class="sub">' + sub + "</p>" +
      (mode === "review" && list.length ? '<p><button class="btn small" id="fresh">Start fresh</button></p>' : "") +
      (list.length ? list.map(function (p, k) { return probHTML(p, k + 1); }).join("") : '<div class="card">Nothing here right now. 🎉</div>'));
    var f = document.getElementById("fresh");
    if (f) f.onclick = function () { list.forEach(function (p) { S.p[p.id] = { t: 0 }; }); save(); S.review = list.map(function (p) { return p.id; }); h('<a class="crumb" href="#/practice">← Practice</a><h1>Review: fresh attempt</h1>' + list.map(function (p, k) { return probHTML(p, k + 1); }).join("")); };
  }

  /* ---------- mock papers ---------- */
  function mocks() {
    var S = load();
    h("<h1>Mock papers</h1><p class='sub'>Three full individual papers in the real format: 16 questions, 100 minutes, 40 marks, no calculator. Every answer is a positive whole number less than 1000.</p>" +
      '<div class="grid">' + W.mocks.map(function (m) {
        var r = S.mocks[m.id] || {}, run = S.run && S.run.id === m.id;
        return '<a class="mod" href="#/mock/' + m.id + '"><span class="ic">📝</span><h3>' + m.title + "</h3><p>" + (run ? "In progress…" : r.best != null ? "Best: " + r.best + "/40 · attempts: " + r.hist.length : "Not attempted yet") + "</p></a>";
      }).join("") + "</div>" +
      '<div class="card"><b>What is a good score?</b> These papers are meant to be hard: on the real paper very few students finish everything. As a guide for practice: 15+ is a solid start, 25+ is strong, and 32+ is excellent (these are practice guides, not official cut-offs). Aim to get every 1- and 2-mark question right first.</div>' +
      '<div class="card"><b>Finished all three?</b> Move on to the real thing: the <a href="#/past">Real past papers</a> page links every WAJO paper since 2000 with its official solutions, and tracks your scores.</div>');
  }
  function mockView(id) {
    var m = W.mocks.filter(function (x) { return x.id === id; })[0]; if (!m) return mocks();
    var S = load(), run = S.run && S.run.id === id ? S.run : null;
    if (!run) {
      var r = S.mocks[id];
      h('<a class="crumb" href="#/mocks">← Mock papers</a><h1>' + m.title + "</h1>" +
        '<div class="card"><p><b>Instructions.</b> There are 16 questions. Each answer is a positive integer less than 1000. Calculators are not permitted. Diagrams, if you draw them, need not be to scale. You have 100 minutes.</p><p>Have paper and a pencil ready, and sit somewhere quiet. Questions 1–4 are worth 1 mark each, 5–8 are worth 2, 9–12 are worth 3 and 13–16 are worth 4.</p>' +
        '<div class="row"><button class="btn" id="go">Start the 100-minute timer</button><button class="btn ghost" id="go2">Practise untimed</button></div></div>' +
        (r ? '<div class="card"><b>Previous attempts:</b> ' + r.hist.map(function (x) { return x.score + "/40 (" + x.d + ")"; }).join(", ") + "</div>" : ""));
      document.getElementById("go").onclick = function () { S.run = { id: id, start: Date.now(), timed: 1, ans: {} }; save(); touchDay(); mockView(id); };
      document.getElementById("go2").onclick = function () { S.run = { id: id, start: Date.now(), timed: 0, ans: {} }; save(); touchDay(); mockView(id); };
      return;
    }
    h('<h1>' + m.title + '</h1><div class="timer" id="tm"><span id="tleft"></span><button class="btn small warn" id="sub">Hand in</button></div>' +
      m.qs.map(function (q, i) {
        return '<div class="prob"><div class="ptop"><span>Question ' + (i + 1) + "</span><span>[" + MARKS[i] + " mark" + (MARKS[i] > 1 ? "s" : "") + ']</span></div><p class="pq">' + q.q + '</p><input class="ans mk" data-i="' + i + '" inputmode="numeric" autocomplete="off" placeholder="Answer" value="' + (run.ans[i] != null ? run.ans[i] : "") + '"></div>';
      }).join("") + '<div class="row"><button class="btn warn" id="sub2">Hand in paper</button><button class="btn ghost" id="quit">Abandon attempt</button></div>');
    app.querySelectorAll(".mk").forEach(function (inp) { inp.oninput = function () { run.ans[inp.dataset.i] = inp.value; save(); }; });
    function finish() { clearInterval(tick); grade(m, run); }
    document.getElementById("sub").onclick = document.getElementById("sub2").onclick = function () { if (confirm("Hand in your paper now?")) finish(); };
    document.getElementById("quit").onclick = function () { if (confirm("Abandon this attempt? Your answers will be discarded.")) { clearInterval(tick); delete S.run; save(); mocks(); } };
    function upd() {
      var el = document.getElementById("tleft"); if (!el) return clearInterval(tick);
      var used = (Date.now() - run.start) / 1000;
      if (run.timed) { var left = 6000 - used; el.textContent = "⏱ " + fmt(left) + " left"; document.getElementById("tm").classList.toggle("low", left < 600); if (left <= 0) { alert("Time is up! Pencils down."); finish(); } }
      else el.textContent = "Untimed · " + fmt(used) + " so far";
    }
    upd(); tick = setInterval(upd, 1000);
  }
  function grade(m, run) {
    var S = load(), score = 0, used = Math.round((Date.now() - run.start) / 60000);
    var rows = m.qs.map(function (q, i) {
      var v = parseAns(run.ans[i] == null ? "" : run.ans[i]), ok = v === q.a; if (ok) score += MARKS[i];
      return '<div class="prob' + (ok ? " done" : "") + '"><div class="ptop"><span>Question ' + (i + 1) + " [" + MARKS[i] + ']</span><span class="' + (ok ? "right" : "wrong") + '">' + (ok ? "✓ +" + MARKS[i] : "✗ 0") + '</span></div><p class="pq">' + q.q + "</p><p>Your answer: <b>" + (run.ans[i] || "–") + "</b> · Correct answer: <b>" + q.a + '</b></p><div class="sol"><b>Solution:</b> ' + q.s + "</div></div>";
    }).join("");
    var r = S.mocks[m.id] = S.mocks[m.id] || { hist: [] };
    r.hist.push({ score: score, d: today(), min: used, timed: run.timed }); r.best = Math.max(r.best == null ? 0 : r.best, score);
    delete S.run; save();
    var msg = score >= 32 ? "Outstanding paper." : score >= 25 ? "Strong paper. Study the ones you missed and you're on track." : score >= 15 ? "Solid base. Lock in the 1–2 mark questions, then push into the 3s." : "Good that you sat a full paper. Go through every solution, then revisit the matching lessons.";
    h('<a class="crumb" href="#/mocks">← Mock papers</a><h1>' + m.title + ': result</h1><div class="card"><div class="score">' + score + '<span style="font-size:1.2rem;color:var(--mute)"> / 40</span></div><p>' + msg + " Time used: " + used + ' min.</p><p class="sub">For each question you missed: was it a slip, a misread question, or an idea you did not know? Slips and misreads are fixed by checking. Unknown ideas are fixed by the lessons.</p></div>' + rows);
  }


  /* ---------- real past papers (linked, not copied) ---------- */
  var ARCH = "https://enrichedmaths.maths.uwa.edu.au/wajo/qnsandsolns/";
  var PDF = { 2025: "wajo25qnsoln.pdf", 2024: "wajo24qnsoln.pdf", 2022: "wajo22qnsoln.pdf", 2018: "wajo18qnsoln.pdf", 2017: "wajo17qnsoln.pdf", 2015: "wajo15qnsoln.pdf", 2012: "wajo2012qa.pdf", 2011: "wajo11qa.pdf", 2010: "wajo10qa.pdf", 2009: "wajo09qa.pdf", 2008: "wajoq-a08.pdf", 2006: "wajoq-a_06.pdf", 2005: "wajoq-a_05.pdf", 2004: "wajoq-a_04.pdf", 2002: "wajoq-a_02.pdf" };
  function past() {
    var S = load(); S.past = S.past || {};
    var rows = "", done = 0;
    for (var y = 2026; y >= 2000; y--) {
      var r = S.past[y] || {}; if (r.done) done++;
      rows += "<tr><td><b>" + y + '</b></td><td><a href="' + ARCH + (PDF[y] || "") + '" target="_blank" rel="noopener">' + (PDF[y] ? "Questions &amp; solutions (PDF)" : "Find in official archive") + '</a></td><td><input class="ans ps" style="width:70px" inputmode="numeric" data-y="' + y + '" placeholder="score" value="' + (r.score != null ? r.score : "") + '"></td><td><label><input type="checkbox" class="pd" data-y="' + y + '"' + (r.done ? " checked" : "") + "> done</label></td></tr>";
    }
    h("<h1>Real past papers</h1><p class='sub'>Every WAJO paper since 2000, with official solutions, is published free by the WA Mathematical Olympiads Committee. Nothing prepares you better than the real thing. Source: WAJO (Western Australian Junior mathematics Olympiad).</p>" +
      '<div class="stats"><div class="stat"><b>' + done + '/27</b><span>past papers done</span></div></div>' +
      '<div class="card"><b>How to use them</b><ol style="margin:.4em 0 0;padding-left:1.2em"><li>Start with the most recent years: they match today\'s 16-question format. Older papers are shorter (10–12 questions) but just as good for practice.</li><li>Open the PDF, <b>stop scrolling at the end of the questions</b>, and start the timer. No calculator.</li><li>Mark yourself from the solutions, type your score in the table, and read the solution to every question you missed.</li><li>Do the team question separately: 45–50 minutes, with friends if you can.</li></ol></div>' +
      '<div class="timer"><span id="tleft">100:00</span><button class="btn small" id="pgo">Start 100-minute timer</button></div>' +
      '<div class="card"><b>Prefer to practise on screen?</b> <a href="https://www.problemsolvingeducation.com/wajopractise" target="_blank" rel="noopener">WAJO Practise at ProblemSolvingEducation</a> has the 2013–2026 questions and solutions, sorted by year, topic or marks.</div>' +
      '<div class="card" style="overflow-x:auto"><table><tr><th>Year</th><th>Paper</th><th>My score</th><th></th></tr>' + rows + '</table><p class="sub" style="margin-bottom:0">Where a direct link is missing, open the <a href="' + ARCH + '" target="_blank" rel="noopener">official archive</a> and pick the year.</p></div>');
    app.querySelectorAll(".ps").forEach(function (i) { i.oninput = function () { var r = S.past[i.dataset.y] = S.past[i.dataset.y] || {}; var v = parseAns(i.value); if (v === null) delete r.score; else r.score = v; save(); touchDay(); }; });
    app.querySelectorAll(".pd").forEach(function (c) { c.onchange = function () { (S.past[c.dataset.y] = S.past[c.dataset.y] || {}).done = c.checked ? 1 : 0; save(); touchDay(); }; });
    document.getElementById("pgo").onclick = function () {
      var end = Date.now() + 6000000; this.disabled = true; clearInterval(tick);
      tick = setInterval(function () { var el = document.getElementById("tleft"); if (!el) return clearInterval(tick); var left = (end - Date.now()) / 1000; el.textContent = "⏱ " + fmt(left) + " left"; if (left <= 0) { clearInterval(tick); el.textContent = "Time is up! Pencils down."; } }, 1000);
    };
  }

  /* ---------- team round ---------- */
  function team() {
    var S = load();
    h("<h1>Team round</h1><p class='sub'>The team paper is one long investigation of an unfamiliar idea, answered in parts (A, B, C …), with some parts requiring full explanations. Teams of four have about 50 minutes. These three original investigations build that skill. Work with friends if you can, or alone with a 50-minute timer.</p>" +
      '<div class="grid">' + W.team.map(function (t) {
        var r = S.team[t.id] || {}, got = 0, max = 0; t.parts.forEach(function (p, i) { max += p.m; got += +(r["m" + i] || 0); });
        return '<a class="mod" href="#/team/' + t.id + '"><span class="ic">🤝</span><h3>' + t.title + "</h3><p>" + t.parts.length + " parts · " + (r.marked ? "self-marked " + got + "/" + max : max + " marks") + "</p></a>";
      }).join("") + '</div><div class="card">First read <a href="#/m/teamskills">Team Paper &amp; Writing Explanations</a>. Write every answer in full sentences <b>before</b> revealing the model answer, then mark yourself honestly: full marks only if your explanation covers every case.</div>');
  }
  function teamView(id) {
    var t = W.team.filter(function (x) { return x.id === id; })[0]; if (!t) return team();
    var S = load(), r = S.team[id] = S.team[id] || {}, L = "ABCDEFGHIJKL";
    h('<a class="crumb" href="#/team">← Team round</a><h1>' + t.title + '</h1><div class="timer"><span id="tleft">50:00</span><button class="btn small" id="tgo">Start 50-minute timer</button></div><div class="card">' + t.intro + "</div>" +
      t.parts.map(function (p, i) {
        var opts = ""; for (var k = 0; k <= p.m; k++) opts += "<option" + (+(r["m" + i] || 0) === k ? " selected" : "") + ">" + k + "</option>";
        return '<div class="prob"><div class="ptop"><span>Part ' + L[i] + "</span><span>[" + p.m + ' marks]</span></div><p class="pq">' + p.q + '</p><textarea data-i="' + i + '" placeholder="Write your answer and reasoning here (or on paper)…">' + (r["a" + i] || "").replace(/</g, "&lt;") + '</textarea><div class="row" style="margin-top:8px"><button class="btn ghost small" data-show="' + i + '">Show model answer</button><label>My mark: <select data-m="' + i + '">' + opts + "</select> / " + p.m + '</label></div><div class="sol" id="ma' + i + '" hidden><b>Model answer:</b> ' + p.a + "</div></div>";
      }).join("") + '<div class="card" id="ttotal"></div>');
    function total() { var got = 0, max = 0; t.parts.forEach(function (p, i) { max += p.m; got += +(r["m" + i] || 0); }); document.getElementById("ttotal").innerHTML = "<b>Self-marked total: " + got + " / " + max + "</b>"; }
    total();
    app.querySelectorAll("textarea").forEach(function (a) { a.oninput = function () { r["a" + a.dataset.i] = a.value; save(); }; });
    app.querySelectorAll("[data-show]").forEach(function (b) { b.onclick = function () { document.getElementById("ma" + b.dataset.show).hidden = false; touchDay(); }; });
    app.querySelectorAll("[data-m]").forEach(function (s) { s.onchange = function () { r["m" + s.dataset.m] = +s.value; r.marked = 1; save(); total(); }; });
    document.getElementById("tgo").onclick = function () {
      var end = Date.now() + 3000000; this.disabled = true; clearInterval(tick);
      tick = setInterval(function () { var el = document.getElementById("tleft"); if (!el) return clearInterval(tick); var left = (end - Date.now()) / 1000; el.textContent = "⏱ " + fmt(left) + " left"; if (left <= 0) { clearInterval(tick); el.textContent = "Time is up!"; } }, 1000);
    };
  }

  /* ---------- tips ---------- */
  function tips() {
    h("<h1>Exam tips</h1><p class='sub'>Knowing the maths is half of it. The other half is spending 100 minutes wisely.</p>" +
      '<div class="key"><b>Before the day</b><ul><li>Know by heart: primes to 50, squares to 25², cubes to 10³, powers of 2 to 2¹⁰, and the Pythagorean triples.</li><li>Practise mental and written arithmetic. There is no calculator.</li><li>Sit at least three full timed papers so that 100 minutes feels familiar.</li><li>Sleep well. A rested brain spots patterns.</li></ul></div>' +
      '<div class="key"><b>The marks</b><table><tr><th>Questions</th><th>Marks each</th><th>Suggested time</th></tr><tr><td>1–4</td><td>1</td><td>about 10 minutes in total</td></tr><tr><td>5–8</td><td>2</td><td>about 20 minutes</td></tr><tr><td>9–12</td><td>3</td><td>about 30 minutes</td></tr><tr><td>13–16</td><td>4</td><td>about 30 minutes</td></tr><tr><td colspan="2">Checking</td><td>the last 10 minutes</td></tr></table></div>' +
      '<div class="key"><b>During the paper</b><ol><li><b>Read every question twice.</b> Underline what is asked: "how many", "the largest", "the sum of". The commonest lost mark is answering a different question.</li><li><b>Bank the early marks.</b> Questions 1–8 are worth 12 marks and are very gettable. Do them carefully rather than quickly.</li><li><b>Three-minute rule.</b> If you have no idea how to start after three minutes, circle it and move on. Come back later: a fresh look often works.</li><li><b>Hard does not mean last.</b> Question 16 might suit you better than question 13. Read all of 13–16 before choosing where to spend your time.</li><li><b>Use the answer format.</b> Every answer is a positive whole number under 1000. If you get a fraction, a negative or 4000, something went wrong.</li><li><b>Never leave a blank.</b> There is no penalty for a wrong answer, so write your best estimate.</li><li><b>Check by a different route.</b> Substitute back, test a small case, or estimate. Re-reading your own working rarely finds the error.</li></ol></div>' +
      '<div class="key"><b>When you are stuck</b><ul><li>Try a smaller version of the problem.</li><li>Draw a diagram or make a table.</li><li>Give the unknown a letter.</li><li>Ask "what stays the same?" and "what is the extreme case?"</li><li>Work backwards from what you want.</li></ul></div>' +
      '<div class="key"><b>In the team paper</b><ul><li>One person reads everything aloud first. Then split the parts.</li><li>Early parts are usually experiments. Do them carefully: later parts depend on them.</li><li>Appoint one scribe so the answer sheet is neat and consistent.</li><li>"Explain" means reasons, not examples. Write: claim, because, therefore.</li><li>With ten minutes left, stop exploring and write up what you have.</li></ul></div>' +
      '<div class="tip">After every practice paper keep an <b>error log</b>: the question, why you missed it, and the idea you learned. Read the log the night before the competition.</div>');
  }

  /* ---------- progress ---------- */
  function progress() {
    var S = load();
    h("<h1>Progress</h1>" +
      '<div class="stats"><div class="stat"><b>' + totalSolved() + "/" + ALL.length + '</b><span>problems solved</span></div><div class="stat"><b>' + ALL.filter(function (p) { var r = S.p[p.id]; return r && r.s && !r.r && !r.h; }).length + '</b><span>solved with no help</span></div><div class="stat"><b>' + S.days.length + '</b><span>days practised</span></div><div class="stat"><b>' + streak() + '</b><span>current streak</span></div></div>' +
      '<div class="card"><table><tr><th>Module</th><th>Solved</th><th></th></tr>' + W.modules.map(function (m) { var pc = modPct(m), n = m.problems.filter(function (p) { return solved(p.id); }).length; return '<tr><td><a href="#/m/' + m.id + '">' + m.title + "</a></td><td>" + n + "/" + m.problems.length + '</td><td style="width:35%"><div class="bar" style="margin-top:8px"><i style="width:' + pc + '%"></i></div></td></tr>'; }).join("") + "</table></div>" +
      '<div class="card"><b>Mock papers</b><table>' + W.mocks.map(function (m) { var r = S.mocks[m.id]; return "<tr><td>" + m.title + "</td><td>" + (r ? r.hist.map(function (x) { return x.score + "/40" + (x.timed ? "" : " (untimed)"); }).join(", ") : "not attempted") + "</td></tr>"; }).join("") + "</table></div>" +
      '<div class="card"><b>Backup</b><p class="sub">Progress lives only in this browser on this device. Download a backup to move it to another device or keep it safe.</p><div class="row"><button class="btn small" id="exp">Download backup</button><label class="btn ghost small">Restore backup<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn ghost small" id="rst">Reset everything</button></div></div>');
    document.getElementById("exp").onclick = function () { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" })); a.download = "wajo-progress-" + today() + ".json"; a.click(); };
    document.getElementById("imp").onchange = function (e) { var f = e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var o = JSON.parse(rd.result); if (!o || typeof o !== "object" || !o.p) throw 0; mem = null; localStorage.setItem(KEY, JSON.stringify(o)); progress(); } catch (x) { alert("That file is not a WAJO Trainer backup."); } }; rd.readAsText(f); };
    document.getElementById("rst").onclick = function () { if (confirm("Erase all progress on this device?")) { mem = null; try { localStorage.removeItem(KEY); } catch (x) {} progress(); } };
  }

  /* ---------- router ---------- */
  function route() {
    clearInterval(tick);
    var parts = location.hash.replace(/^#\/?/, "").split("/"), r = parts[0] || "home", nav = r;
    if (r === "m") { nav = "learn"; moduleView(parts[1]); }
    else if (r === "learn") learn();
    else if (r === "practice") practice(parts[1], parts[2]);
    else if (r === "mocks") mocks();
    else if (r === "mock") { nav = "mocks"; mockView(parts[1]); }
    else if (r === "team") { if (parts[1]) teamView(parts[1]); else team(); }
    else if (r === "past") past();
    else if (r === "tips") tips();
    else if (r === "progress") progress();
    else { nav = "home"; home(); }
    document.querySelectorAll("#nav a").forEach(function (a) { a.classList.toggle("on", a.dataset.r === nav); });
  }
  window.addEventListener("hashchange", route);
  route();
})();
