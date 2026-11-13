/* WAJO Trainer – tiny maths typesetter.
   Finds mathematical expressions in the lesson/problem HTML and sets them in a serif maths face:
   italic variables, stacked fractions, radicals with a bar, real superscripts/subscripts.
   No dependencies. Exposes WAJO.M(html). */
(function (G) {
  "use strict";
  var W = (G.WAJO = G.WAJO || { modules: [], mocks: [], team: [] });
  var SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "−", "ⁿ": "n" };
  var SUB = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
  var PROD = ["xy", "ab", "lw", "nx", "ny", "qr"], FUNC = ["gcd", "lcm", "GCD", "LCM", "mod", "ways"], UNIT = "mhsLgW";
  function isL(c) { return !!c && /[A-Za-z]/.test(c); }

  function tokenAt(s, i) {
    var c = s[i], prev = s[i - 1], m, k, r = s.slice(i, i + 40);
    if (c === "<") {
      if ((m = /^<i>([A-Za-zℓ])<\/i>/.exec(r))) return { t: "v", x: m[1], forced: 1, raw: m[0] };
      if ((m = /^<(sup|sub)>([^<]*)<\/\1>/.exec(r))) return { t: "s", tag: m[1], x: m[2], raw: m[0] };
      if ((m = /^<(\/?)(i|b)>/.exec(r))) return { t: "tag", close: !!m[1], name: m[2], raw: m[0] };
      if (!/^<[A-Za-z\/!]/.test(r)) return { t: "op", raw: "<" };
      return null;
    }
    if (c === " " && s.substr(i, 3) === " : ") return { t: "op", raw: " : ", ratio: 1 };
    if (/\d/.test(c)) { if (isL(prev)) return null; m = /^\d+(?:\.\d+)?/.exec(r); return { t: "n", raw: m[0] }; }
    if (isL(c) || c === "ℓ") {
      if (isL(prev) || prev === "'" || prev === "’" || prev === "&") return null;
      if (prev === "/" && isL(s[i - 2]) && isL(s[i - 3])) return null; /* km/h */
      for (k = 0; k < FUNC.length; k++) if (s.substr(i, FUNC[k].length) === FUNC[k] && !isL(s[i + FUNC[k].length])) return { t: "f", raw: FUNC[k] };
      for (k = 0; k < PROD.length; k++) if (s.substr(i, 2) === PROD[k] && !isL(s[i + 2])) return { t: "v", x: PROD[k], raw: PROD[k] };
      if ((m = /^[A-Z]{2,3}/.exec(r)) && !isL(s[i + m[0].length])) return { t: "v", x: m[0], raw: m[0], caps: 1 };
      var nx = s[i + 1];
      if (isL(nx)) return null;
      if ((nx === "'" || nx === "’") && !/[b-z]/.test(c)) return null;
      if (nx === "." && isL(s[i + 2]) && s[i + 3] === ".") return null; /* e.g. / i.e. */
      if (prev === "." && nx === ".") return null;
      return { t: "v", x: c, raw: c };
    }
    if (c === "/" && isL(prev) && isL(s[i - 2])) return null; /* km/h */
    if ("=+−×÷>≤≥≡≠·!|°/".indexOf(c) >= 0) return { t: "op", raw: c };
    if (c === "√" || c === "π" || c === "½") return { t: c === "√" ? "rt" : c === "π" ? "pi" : "half", raw: c };
    if (c === "(" || c === ")") return { t: c, raw: c };
    if (c === ",") return { t: ",", raw: c };
    if (c === "…") return { t: "ell", raw: c };
    return null;
  }

  function readRun(s, i) {
    var toks = [], j = i, t, sp;
    for (;;) {
      sp = 0;
      if (toks.length && (s[j] === " " || s[j] === " ") && s.substr(j, 3) !== " : ") sp = 1;
      t = tokenAt(s, j + sp);
      if (!t && sp && s.substr(j, 3) === " : ") t = null;
      if (!t) break;
      t.sp = sp; toks.push(t); j += sp + t.raw.length;
    }
    return toks;
  }
  function rawOf(toks) { return toks.map(function (t) { return (t.sp ? " " : "") + t.raw; }).join(""); }

  function isAtomTok(t) { return t && (t.t === "n" || t.t === "v" || t.t === "s" || t.t === "pi"); }
  function atomEnd(toks, i) { /* index after the atom starting at i (adjacent n/v/s tokens) */
    var j = i; if (!isAtomTok(toks[j]) || toks[j].t === "s") return i;
    j++; while (j < toks.length && !toks[j].sp && isAtomTok(toks[j])) j++; return j;
  }
  function match(toks, i) { var d = 0, k; for (k = i; k < toks.length; k++) { if (toks[k].t === "(") d++; if (toks[k].t === ")") { d--; if (!d) return k; } } return -1; }
  function unitEnd(toks, i) {
    var j = i, k;
    if (isAtomTok(toks[j]) && toks[j].t !== "s") { j = atomEnd(toks, j); if (toks[j] && !toks[j].sp && toks[j].raw === "!") j++; }
    while (toks[j] && toks[j].t === "(" && (j === i || !toks[j].sp)) { k = match(toks, j); if (k < 0) break; j = k + 1; if (toks[j] && !toks[j].sp && toks[j].t === "s") j++; }
    return j;
  }
  function unwrap(part) { return part.length > 2 && part[0].t === "(" && match(part, 0) === part.length - 1 ? part.slice(1, -1) : part; }
  function inner(str) { /* typeset the inside of a sup/sub */
    var toks = readRun(str, 0); return rawOf(toks) === str && toks.length ? render(toks) : str;
  }
  function render(toks) {
    var o = "", i = 0, t, j, k, d, p;
    while (i < toks.length) {
      t = toks[i]; if (t.sp) o += " ";
      p = toks[i - 1];
      /* units: 25 m/s, 3 h */
      if (t.t === "v" && !t.forced && t.x.length === 1 && UNIT.indexOf(t.x) >= 0 && t.sp && p && p.t === "n") {
        o += t.x; i++;
        if (toks[i] && toks[i].raw === "/" && !toks[i].sp && toks[i + 1] && !toks[i + 1].sp && toks[i + 1].t === "v" && UNIT.indexOf(toks[i + 1].x) >= 0) { o += "/" + toks[i + 1].x; i += 2; }
        continue;
      }
      /* stacked fraction: unit / unit, where a unit is an atom, a bracketed group, or atom+groups */
      if ((isAtomTok(t) && t.t !== "s") || t.t === "(") {
        j = unitEnd(toks, i);
        if (j > i && toks[j] && toks[j].raw === "/" && !toks[j].sp && toks[j + 1] && !toks[j + 1].sp && (k = unitEnd(toks, j + 1)) > j + 1 &&
          !(toks[k] && !toks[k].sp && toks[k].raw === "/") && !(p && !t.sp && (p.raw === "/" || p.t === ")" || isAtomTok(p)))) {
          o += '<span class="fr"><span>' + render(clean(unwrap(toks.slice(i, j)))) + "</span><span>" + render(clean(unwrap(toks.slice(j + 1, k)))) + "</span></span>"; i = k; continue;
        }
      }
      if (t.t === "rt") {
        var nxt = toks[i + 1];
        if (nxt && !nxt.sp && nxt.t === "(") {
          d = 0; for (k = i + 1; k < toks.length; k++) { if (toks[k].t === "(") d++; if (toks[k].t === ")") { d--; if (!d) break; } }
          if (k < toks.length) { o += '<span class="rt">√<span>' + render(clean(toks.slice(i + 2, k))) + "</span></span>"; i = k + 1; continue; }
        } else if (nxt && !nxt.sp && (k = atomEnd(toks, i + 1)) > i + 1) { o += '<span class="rt">√<span>' + render(clean(toks.slice(i + 1, k))) + "</span></span>"; i = k; continue; }
        o += "√"; i++; continue;
      }
      if (t.t === "v") {
        p = toks[i - 1];
        var unit = !t.forced && t.x.length === 1 && UNIT.indexOf(t.x) >= 0 && p && ((t.sp && p.t === "n") || (p.raw === "/" && toks[i - 2] && toks[i - 2].unit));
        if (unit) { t.unit = 1; o += t.x; } else o += "<i>" + t.x + "</i>";
      } else if (t.t === "s") o += "<" + t.tag + ">" + inner(t.x) + "</" + t.tag + ">";
      else if (t.t === "half") o += '<span class="fr"><span>1</span><span>2</span></span>';
      else if (t.t === "op" && t.raw === "<") o += "&lt;";
      else o += t.raw;
      i++;
    }
    return o;
  }
  function clean(toks) { toks = toks.slice(); if (toks.length) { toks[0] = Object.assign({}, toks[0], { sp: 0 }); } return toks; }

  function accept(toks) {
    var hasNV = 0, op = 0, forced = 0, sup = 0, par = 0, com = 0, slashes = 0, onlyNumSlash = 1, bal = {}, i, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (t.t === "n" || t.t === "v" || t.t === "pi" || t.t === "half") hasNV = 1;
      if (t.t === "op" || t.t === "rt" || t.t === "half" || t.raw === "mod") op = 1;
      if (t.forced) forced = 1; if (t.t === "s") sup = 1;
      if (t.t === "(") par = 1; if (t.t === ",") com = 1;
      if (t.raw === "/") slashes++; else if (t.t !== "n") onlyNumSlash = 0;
      if (t.t === "tag") { bal[t.name] = (bal[t.name] || 0) + (t.close ? -1 : 1); if (bal[t.name] < 0) return 0; }
    }
    for (i in bal) if (bal[i]) return 0;
    if (!hasNV) return 0;
    if (onlyNumSlash && slashes > 1) return 0;
    if (op || forced || sup || (par && com)) return 1;
    var core = toks.filter(function (x) { return x.t !== "tag"; });
    if (core.some(function (x) { return x.t === "pi"; })) return 1;
    /* a coefficient term such as 3w or 1001a (but not coins "5c" or plurals "9s") */
    if (core.length === 2 && core[0].t === "n" && core[1].t === "v" && !core[1].sp && /^[abd-rt-z]$/.test(core[1].x)) return 1;
    /* lone variables, or a list of them: x  |  (k)  |  a, b, c */
    var vs = core.filter(function (x) { return x.t === "v"; }), rest = core.filter(function (x) { return x.t !== "v" && x.t !== "(" && x.t !== ")" && x.t !== "," && x.t !== "ell"; });
    if (!rest.length && vs.length && vs.every(function (x) { return /^[a-zℓ]$/.test(x.x); })) return vs.length > 1 || /^[b-zℓ]$/.test(vs[0].x) ? 1 : 0;
    return 0;
  }
  function trim(toks) { /* returns [leading, core, trailing] */
    var a = 0, b = toks.length, d, i, t;
    function soft(t) { return t.t === "," || t.t === "ell"; }
    for (;;) {
      var ch = 0;
      while (a < b && soft(toks[a])) { a++; ch = 1; }
      while (b > a && soft(toks[b - 1])) { b--; ch = 1; }
      /* article "a", "A", "I" followed by a spaced non-operator */
      if (b - a > 1 && toks[a].t === "v" && !toks[a].forced && /^[aAI]$/.test(toks[a].x) && toks[a + 1].sp && toks[a + 1].t !== "op") { a++; ch = 1; }
      if (b - a > 1 && toks[b - 1].t === "v" && !toks[b - 1].forced && /^[aAI]$/.test(toks[b - 1].x) && toks[b - 1].sp && toks[b - 2].t !== "op") { b--; ch = 1; }
      /* unmatched brackets at the ends */
      d = 0; var un = -1; for (i = a; i < b; i++) { t = toks[i]; if (t.t === "(") d++; if (t.t === ")") { d--; if (d < 0) { un = i; break; } } }
      if (un >= 0) { if (un === b - 1) b--; else if (un === a) a++; else b = un; ch = 1; }
      else if (d > 0) { var open = -1; d = 0; for (i = b - 1; i >= a; i--) { t = toks[i]; if (t.t === ")") d++; if (t.t === "(") { d--; if (d < 0) { open = i; break; } } } if (open === a) a++; else b = open; ch = 1; }
      /* unbalanced <b>/<i> tags: cut the run at the offending tag */
      var st = [], bad = -1, badOpen = 0;
      for (i = a; i < b && bad < 0; i++) { t = toks[i]; if (t.t === "tag") { if (!t.close) st.push(i); else if (st.length && toks[st[st.length - 1]].name === t.name) st.pop(); else bad = i; } }
      if (bad < 0 && st.length) { bad = st[0]; badOpen = 1; }
      if (bad >= 0) { if (badOpen) { if (bad - a >= b - bad - 1) b = bad; else a = bad + 1; } else { if (bad > a) b = bad; else a++; } ch = 1; }
      /* closing tags at the start / opening tags at the end belong outside */
      while (a < b && toks[a].t === "tag" && toks[a].close) { a++; ch = 1; }
      while (b > a && toks[b - 1].t === "tag" && !toks[b - 1].close) { b--; ch = 1; }
      if (!ch) break;
    }
    return [toks.slice(0, a), toks.slice(a, b), toks.slice(b)];
  }

  function chunk(s) {
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ]+/g, function (m) { return "<sup>" + m.split("").map(function (c) { return SUP[c]; }).join("") + "</sup>"; })
      .replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, function (m) { return "<sub>" + m.split("").map(function (c) { return SUB[c]; }).join("") + "</sub>"; });
    var o = "", i = 0, toks, parts, core;
    while (i < s.length) {
      toks = readRun(s, i);
      if (!toks.length) { o += s[i++]; continue; }
      parts = trim(toks); core = parts[1];
      if (core.length && accept(core)) {
        o += rawOf(parts[0]) + (core[0].sp ? " " : "") + '<span class="mth">' + render(clean(core)) + "</span>";
        i += rawOf(parts[0]).length + rawOf(core).length;
      } else if (toks[0].t === "v" && !toks[0].forced && /^[b-zℓ]$/.test(toks[0].x) && !/\d/.test(s[i - 1] || "") && toks[1] && toks[1].t === ",") {
        o += '<span class="mth"><i>' + toks[0].x + "</i></span>"; i += toks[0].raw.length;
      } else { o += rawOf(toks); i += rawOf(toks).length; }
    }
    return o;
  }

  W.M = function (html) {
    /* leave SVG and any non-inline tag untouched; typeset only the text between them */
    return String(html).split(/(<svg[\s\S]*?<\/svg>|<(?!\/?(?:sup|sub|i|b)>)\/?[A-Za-z][^>]*>)/).map(function (p, k) { return k % 2 ? p : chunk(p); }).join("");
  };
})(typeof window !== "undefined" ? window : globalThis);
