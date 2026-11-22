/* Experiment 1: trial lists.
 * Pure functions with no page code, so the lists can be checked outside the browser.
 * Design: SBİNAREK application (Part B) and the design appendix (Tables A1, A2). */
"use strict";

const EV = ["rise", "turn", "swell", "pulse"];
const PAIRS = [["rise", "turn"], ["rise", "swell"], ["rise", "pulse"], ["turn", "swell"], ["turn", "pulse"], ["swell", "pulse"]];
/* the three ways to pick 4 pairs so that each event is in exactly two of them (indices into PAIRS) */
const CYCLES = [[0, 4, 5, 1], [0, 3, 5, 2], [1, 3, 4, 2]];
/* two handshape mappings, counterbalanced across lists */
const MAPS = {
  A: {rise: "index", turn: "flat", swell: "fist", pulse: "claw"},
  B: {rise: "claw", turn: "fist", swell: "index", pulse: "flat"}
};
/* timing of two-event animations (seconds): P lasts 2.0 s, Q lasts 1.0 s */
const TIM = {DUR: {P: 0.5, Q: 1.0}, SEQ: {P: 0.5, Q: 3.3}};
const a2 = (P, Q, tm) => [{ev: P, t0: TIM[tm].P, dur: 2}, {ev: Q, t0: TIM[tm].Q, dur: 1}];
const aLong = X => [{ev: X, t0: TIM.DUR.P, dur: 2}];
const aShort = (X, tm) => [{ev: X, t0: TIM[tm || "SEQ"].Q, dur: 1}];
const D = "D", Y = "Y";   /* Doğru, Yanlış */

/* predicted answers when both events occur (brief, Table 1) */
function preds(form, pol, tm, adverb) {
  if (!adverb) {
    if (form === "HOLD") {
      if (pol === "pos") return tm === "DUR" ? {H1: D, H2: D, H3: D} : {H1: Y, H2: Y, H3: D};
      return tm === "DUR" ? {H1: Y, H2: Y, H3: Y} : {H1: D, H2: Y, H3: Y};
    }
    return pol === "pos" ? {H1: D, H2: D, H3: D} : {H1: Y, H2: Y, H3: Y};
  }
  if (form === "HOLD") return tm === "DUR" ? {H1: Y, H2: Y, H3: Y} : {H1: D, H2: "D/Y", H3: D};
  return tm === "SEQ" ? {H1: D, H2: D, H3: D} : {H1: Y, H2: Y, H3: Y};
}

function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function buildDesign(cond, seed) {
  const rand = makeRng(seed);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(rand() * a.length)];
  const others = (...ex) => EV.filter(e => !ex.includes(e));

  /* condition 0..7: list = which event of each pair is P (2) x handshape map (2); Doğru side (2) */
  cond = ((cond % 8) + 8) % 8;
  const list = cond % 4, reversed = list % 2 === 1, mapName = list < 2 ? "A" : "B", dogruLeft = cond < 4;
  /* four of the six pairs, chosen so that each event is in exactly two pairs (a cycle of the four events);
     which of the three possible cycles is used is random */
  const pairSet = Math.floor(rand() * 3);
  const pairs = CYCLES[pairSet].map(i => PAIRS[i]).map(p => reversed ? [p[1], p[0]] : p.slice());
  const pairKey = pr => pr.slice().sort().join("-");

  let nid = 0;
  const item = (o) => Object.assign({id: ++nid}, o);
  const exp = (P, Q, form, pol, tm, block) => {
    const adverb = block === "adverb";
    const p = preds(form, pol, tm, adverb);
    return item({block, kind: adverb && form === "LIN" ? "baseline" : "experimental", form, pol, frame: adverb ? "aneg" : pol,
      clip: {type: form === "HOLD" ? "hold" : "lin", P, Q}, anim: a2(P, Q, tm), anim_label: tm, anim_class: tm, pair: pairKey([P, Q]), P, Q,
      h1: p.H1, h2: p.H2, h3: p.H3,
      correct: p.H1 === p.H2 && p.H2 === p.H3 ? p.H1 : null,
      invariant: !adverb && ((form === "HOLD" && pol === "neg" && tm === "DUR") || (form === "LIN" && tm === "SEQ")),
      critical: form === "HOLD" && pol === "neg" && tm === "SEQ"});
  };
  const other = (o) => item(Object.assign({h2: o.correct, h3: o.correct, h1: o.correct}, o));

  /* ---------- sign learning: two passes, each in a new order ---------- */
  const learn1 = shuffle(EV);
  let learn2 = shuffle(EV);
  for (let g = 0; g < 50 && learn2[0] === learn1[3]; g++) learn2 = shuffle(EV);

  /* ---------- practice: 6 single-sign trials with feedback ---------- */
  /* the named sign: all four signs, and never the same sign twice in a row */
  const pracX = shuffle(EV);
  while (pracX.length < 6) pracX.push(pick(EV.filter(e => e !== pracX[pracX.length - 1])));
  const practice = shuffle([
    {frame: "pos", an: (X, B, C) => aLong(X), correct: D, anim_label: "X alone"},
    {frame: "pos", an: (X, B, C) => aLong(B), correct: Y, anim_label: "other alone"},
    {frame: "neg", an: (X, B, C) => a2(B, C, "SEQ"), correct: D, anim_label: "two other events"},
    {frame: "neg", an: (X, B, C) => aLong(X), correct: Y, anim_label: "X alone"},
    {frame: "pos", an: (X, B, C) => a2(X, B, "SEQ"), correct: D, anim_label: "X + other, SEQ"},
    {frame: "neg", an: (X, B, C) => a2(X, B, "DUR"), correct: Y, anim_label: "X + other, DUR"}
  ]).map((p, i) => { const X = pracX[i], [B, C] = shuffle(others(X));
    return item({block: "practice", kind: "practice", form: "single", pol: p.frame, frame: p.frame, clip: {type: "single", X}, X,
      anim: p.an(X, B, C), anim_label: p.anim_label, anim_class: "other", correct: p.correct, h1: p.correct}); });

  /* ---------- bare block: 46 trials ---------- */
  const expBare = [];
  pairs.forEach(([P, Q]) => ["HOLD", "LIN"].forEach(form => ["pos", "neg"].forEach(pol => ["DUR", "SEQ"].forEach(tm =>
    expBare.push(exp(P, Q, form, pol, tm, "bare"))))));
  const two = (pr, form, pol, anim, label, cls, correct, kind, extra) => other(Object.assign({block: "bare", kind, form, pol, frame: pol,
    clip: {type: form === "HOLD" ? "hold" : "lin", P: pr[0], Q: pr[1]}, anim, anim_label: label, anim_class: cls,
    pair: pairKey(pr), P: pr[0], Q: pr[1], correct}, extra || {}));
  const single = (X, pol, anim, label, cls, correct, kind, block) => other({block: block || "bare", kind, form: "single", pol, frame: pol,
    clip: {type: "single", X}, X, anim, anim_label: label, anim_class: cls, correct});
  const pp = shuffle(pairs);   /* pairs for the missing-event items */
  const missing = [
    two(pp[0], "LIN", "neg", aLong(pp[0][0]), "only P", "other", D, "missing"),
    two(pp[1], "LIN", "neg", aShort(pp[1][1], pick(["DUR", "SEQ"])), "only Q", "other", D, "missing")];
  const rep = (pr, form) => { const [P, Q] = pr, R = pick(others(P, Q)), which = pick(["P", "Q"]);
    const tm = form === "HOLD" ? "DUR" : "SEQ";
    const anim = which === "P" ? a2(R, Q, tm) : a2(P, R, tm);
    return two(pr, form, "pos", anim, `replaced ${which} (${R}), ${tm}`, tm, Y, "control", {replaced: true}); };
  const qq = shuffle(pairs);
  const warm1 = two(qq[0], "LIN", "neg", a2(...others(...qq[0]), "SEQ"), "two other events", "other", D, "control", {warmup: 1});
  const warm2 = two(qq[1], pick(["HOLD", "LIN"]), "pos", [], "no change", "none", Y, "control", {warmup: 2});
  const ctrlBare = [
    two(qq[2], warm2.form === "HOLD" ? "LIN" : "HOLD", "pos", [], "no change", "none", Y, "control"),
    rep(qq[3], "HOLD"), rep(qq[0], "LIN"),
    two(qq[1], "LIN", "neg", [], "no change", "none", D, "control")];
  { const xs = shuffle(EV);
    const o1 = pick(others(xs[0])), o2 = pick(others(xs[1])), o3 = pick(others(xs[2]));
    ctrlBare.push(single(xs[0], "pos", a2(xs[0], o1, "SEQ"), "X + other, SEQ", "SEQ", D, "control"));
    ctrlBare.push(single(xs[1], "pos", a2(o2, xs[1], "DUR"), "other + X, DUR", "DUR", D, "control"));
    ctrlBare.push(single(xs[2], "neg", a2(o3, xs[2], "DUR"), "other + X, DUR", "DUR", Y, "control"));
    ctrlBare.push(single(xs[3], "neg", a2(...others(xs[3]).slice(0, 2), "SEQ"), "two other events", "SEQ", D, "control")); }
  const whole = shuffle(EV).slice(0, 2).map(X => single(X, "neg", aLong(X), "long version of X", "other", Y, "wholeclip"));

  /* halves: each experimental cell twice per half */
  const cells = {};
  expBare.forEach(t => { const k = t.form + t.pol + t.anim_label; (cells[k] = cells[k] || []).push(t); });
  const h1 = [], h2 = [];
  Object.values(cells).forEach(c => { const s = shuffle(c); h1.push(...s.slice(0, 2)); h2.push(...s.slice(2)); });
  const rest = shuffle(missing.concat(ctrlBare, whole));
  /* replaced-event controls go to the second half, which is always after the first HOLD trials */
  const repl = rest.filter(t => t.replaced), nonrep = rest.filter(t => !t.replaced);
  const r1 = nonrep.slice(0, 5), r2 = nonrep.slice(5).concat(repl);
  const seq1 = orderTrials(h1.concat(r1), [warm1, warm2], rand);
  const seq2 = orderTrials(h2.concat(r2), seq1, rand);
  const bare = seq1.concat(seq2.slice(seq1.length));

  /* ---------- forced choice: 4 HOLD + 2 LIN, positive frame ---------- */
  const linPairs = shuffle(pairs).slice(0, 2);
  const fcRaw = pairs.map(pr => ({form: "HOLD", pr})).concat(linPairs.map(pr => ({form: "LIN", pr})));
  const fc = orderSimple(fcRaw.map(o => item({block: "fc", kind: "forced_choice", form: o.form, pol: "pos", frame: "pos",
    clip: {type: o.form === "HOLD" ? "hold" : "lin", P: o.pr[0], Q: o.pr[1]}, P: o.pr[0], Q: o.pr[1], pair: pairKey(o.pr),
    dur_left: rand() < 0.5})), rand);

  /* ---------- overt-adverb block: 18 trials ---------- */
  const adv = [];
  pairs.forEach(([P, Q]) => ["DUR", "SEQ"].forEach(tm => { adv.push(exp(P, Q, "HOLD", "neg", tm, "adverb")); adv.push(exp(P, Q, "LIN", "neg", tm, "adverb")); }));
  { const [x1, x2] = shuffle(EV); const o1 = pick(others(x1)), o2 = pick(others(x2));
    adv.push(single(x1, "pos", a2(o1, x1, "DUR"), "other + X, DUR", "DUR", D, "control", "adverb"));
    adv.push(single(x2, "neg", a2(x2, o2, "SEQ"), "X + other, SEQ", "SEQ", Y, "control", "adverb")); }
  /* almost every trial here is negative, so polarity is not balanced in this block */
  const adverb = orderTrials(adv, [], rand, ["form", "anim_class", "h1"]);

  /* ---------- inference task: 3 message types x 2 inferences x 2 pairs ---------- */
  const infPairs = shuffle(pairs).slice(0, 2);
  const infRaw = [];
  infPairs.forEach(pr => [["neg", "HOLD", "neg_hold"], ["pos", "HOLD", "pos_hold"], ["aneg", "LIN", "baseline"]].forEach(([frame, form, type]) =>
    ["target", "control"].forEach(inference => infRaw.push(item({block: "inference", kind: "inference", type, inference, form, frame,
      pol: frame === "pos" ? "pos" : "neg", clip: {type: form === "HOLD" ? "hold" : "lin", P: pr[0], Q: pr[1]},
      P: pr[0], Q: pr[1], pair: pairKey(pr)})))));
  const inference = orderSimple(infRaw, rand);

  /* ---------- post-tests: 4 + 4 items, each pair once in each ---------- */
  const wp = shuffle(pairs);
  const which = orderSimple(wp.map((pr, i) => ({pr, tm: i < 3 ? "DUR" : "SEQ"}))
    .map(o => item({block: "which", kind: "which_changes", P: o.pr[0], Q: o.pr[1], pair: pairKey(o.pr), anim: a2(o.pr[0], o.pr[1], o.tm), anim_label: o.tm})), rand);
  const rp = shuffle(pairs);
  const recovery = orderSimple(rp.map((pr, i) => item({block: "recovery", kind: "recovery", form: i < 2 ? "HOLD" : "LIN",
    clip: {type: i < 2 ? "hold" : "lin", P: pr[0], Q: pr[1]}, P: pr[0], Q: pr[1], pair: pairKey(pr)})), rand);

  return {cond, list, reversed, mapName, map: MAPS[mapName], dogruLeft, pairs, pairSet, learn: learn1.concat(learn2),
    practice, bare, fc, adverb, inference, which, recovery};
}

/* order trials so that the same pair never comes twice in a row and no more than three
 * trials in a row share polarity, form, animation or the answer under H1.
 * `prefix` is a fixed start (already ordered); the result includes it. */
function orderTrials(items, prefix, rand, keys) {
  keys = keys || ["pol", "form", "anim_class", "h1"];
  for (let attempt = 0; attempt < 20000; attempt++) {
    const seq = prefix.slice();
    let pool = items.slice();
    let ok = true;
    while (pool.length) {
      const cand = pool.filter(t => fits(seq, t, keys));
      if (!cand.length) { ok = false; break; }
      const t = cand[Math.floor(rand() * cand.length)];
      seq.push(t); pool = pool.filter(x => x !== t);
    }
    if (ok) return seq;
  }
  throw new Error("could not order trials");
}
function fits(seq, t, keys) {
  const n = seq.length;
  if (n && t.pair && seq[n - 1].pair && seq[n - 1].pair === t.pair) return false;
  if (n && t.X && seq[n - 1].X === t.X) return false;
  if (n >= 3) for (const k of keys) {
    if (t[k] != null && seq[n - 1][k] === t[k] && seq[n - 2][k] === t[k] && seq[n - 3][k] === t[k]) return false;
  }
  return true;
}
/* shorter tasks: only the same pair never twice in a row */
function orderSimple(items, rand) {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const s = items.slice();
    for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
    if (s.every((t, i) => i === 0 || t.pair !== s[i - 1].pair)) return s;
  }
  return items.slice();
}

if (typeof module !== "undefined") module.exports = {buildDesign, preds, orderTrials, EV, PAIRS, CYCLES, MAPS, TIM};
