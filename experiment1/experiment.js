/* Experiment 1 (online): learning simultaneity, iconicity and negation in an artificial sign language.
 * Session: computer check, consent, sign learning to criterion, practice, bare block (46),
 * forced choice (6), break, overt-adverb block (18), inference task (12), two post-tests (4 + 4), debriefing.
 * Trial lists are built in design.js. Data go to a private Google Drive folder through DataPipe (pipe.jspsych.org).
 *
 * URL options: ?test=1 runs a short version (a few trials per part, no upload, data downloaded at the end).
 *              ?test=1&fail=1 also fails the learning criterion, to check the early end.
 *              ?test=1&upload=1 sends the test data to DataPipe (files start with TEST_).
 *              ?test=1&from=<phase> starts at a phase: learn, id, practice, bare, fc, adverb, inference, post, debrief.
 *              ?cond=0..7 forces a condition (for checking lists). */
"use strict";

/* ---------------- settings ---------------- */
const DATAPIPE_ID = "dgiQ7IilCRxD";
const DATAPIPE_ID_KIMLIK = "jaF6qB0pCy7V";   /* separate DataPipe experiment for name, student number and course */          /* DataPipe experiment ID (12 characters). Empty: no upload, data are downloaded at the end. */
const N_CONDITIONS = 8;          /* must match the number of conditions set in DataPipe */
const CONTACT_EMAIL = "onur.keles1@bogazici.edu.tr";
const MIN_W = 900, MIN_H = 550;   /* minimum browser window size in pixels */

const params = new URLSearchParams(location.search);
const TEST = params.get("test") === "1";
/* test sessions upload only with ?upload=1; their files start with TEST_ */
const UPLOAD = !!DATAPIPE_ID && (!TEST || params.get("upload") === "1");

/* ---------------- state ---------------- */
let DESIGN = null, MAP = null, SUBJ = null, SEED = 0;
let ID_INFO = null;                    /* name, student number, course: saved in a separate file */
let ID_PASSED = false, ID_BLOCKS = [];
const CRIT_ANSWERS = [];               /* the participant's critical trials, for the debriefing */
let SAVE_OK = true;

const jsPsych = initJsPsych({display_element: "jspsych-target"});
const BTN = jsPsychHtmlButtonResponse, KB = jsPsychHtmlKeyboardResponse, FORM = jsPsychSurveyHtmlForm;
const $ = id => document.getElementById(id);
const rnd = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const plainBtn = c => `<button class="jspsych-btn">${c}</button>`;
const gloss = c => !c ? "" : c.type === "single" ? c.X.toUpperCase() : `${c.type.toUpperCase()}(${c.P.toUpperCase()},${c.Q.toUpperCase()})`;

/* ---------------- drawing ---------------- */
const SIGN_DUR = 4.0, ANIM_DUR = 4.8;
const SLOT_CV = id => `<canvas class="sg" id="${id}" data-w="200" data-h="200"></canvas>`;
const ANIM_CV = id => `<canvas class="an" id="${id}" data-w="320" data-h="246"></canvas>`;
const EMPTY_SLOT = '<div class="empty"></div>';
const EMPTY_STAGE = '<div class="stage"></div>';
function playSign(cv, clip, opt) { const tr = makeTracks(clip, MAP); play(cv, (c, w, h, t) => drawSigner(c, w, h, tr, t), clip.dur || SIGN_DUR, opt); }
function playAnim(cv, evs, opt) { play(cv, (c, w, h, t) => drawEvents(c, w, h, evs, t), ANIM_DUR, opt); }
const LOOP = {loop: true, pause: 0.8};

/* the written sentence; the sign clip fills the object position */
const VERB = {pos: "yaptı.", neg: "yapmadı.", aneg: "yapmadı."};
function frameHTML(frame, slot) {
  return `<div class="msg"><span>Tobi</span>${frame === "aneg" ? "<span>aynı anda</span>" : ""}<span class="slot">${slot || EMPTY_SLOT}</span><span>${VERB[frame]}</span></div>`;
}

/* ---------------- data helpers ---------------- */
function itemData(t) {
  if (!t) return {};
  return {item_id: t.id, block: t.block, kind: t.kind, form: t.form || "", polarity: t.pol || "", frame: t.frame || "",
    message: t.clip ? gloss(t.clip) : "", pair: t.pair || "", P: t.P || "", Q: t.Q || "", X: t.X || "",
    animation: t.anim_label || "", h1: t.h1 || "", h2: t.h2 || "", h3: t.h3 || "", correct_answer: t.correct || "",
    invariant: t.invariant ? 1 : 0, critical: t.critical ? 1 : 0, replaced: t.replaced ? 1 : 0, warmup: t.warmup || 0,
    inference: t.inference || "", inf_type: t.type || ""};
}
const ANS = {D: "Doğru", Y: "Yanlış"};

/* ---------------- generic screens ---------------- */
function instr(html, btn, extra) {
  return Object.assign({type: BTN, stimulus: `<div class="instr">${html}</div>`, choices: [btn || "İleri"], button_html: plainBtn,
    data: {task: "instructions"}, on_load: stopAll}, extra || {});
}
function readyKey() {
  return {type: KB, stimulus: '<p class="wait">Hazır olduğunuzda <b>boşluk tuşuna</b> basın.</p>', choices: [" "], data: {task: "ready"}, on_load: stopAll};
}
function timed(html, ms, onload, data) {
  return {type: KB, stimulus: html, choices: "NO_KEYS", trial_duration: ms, data: Object.assign({task: "display"}, data || {}),
    on_load: () => { stopAll(); onload && onload(); }};
}

/* ---------------- one true/false trial ----------------
 * Ready screen (space bar), fixation (0.5 s), sentence with an empty slot (1.0 s), sentence with the clip (4.0 s),
 * blank (0.3 s), sentence with the animation (4.8 s), then Doğru / Yanlış. Message and animation can be replayed
 * as often as the participant wants; every replay is logged. */
function tvjTrial(t, feedback) {
  let replays = 0, answer = null;
  const order = DESIGN.dogruLeft ? ["D", "Y"] : ["Y", "D"];
  const show = [
    timed('<div class="fix">+</div>', 500),
    timed(frameHTML(t.frame) + EMPTY_STAGE, 1000),
    timed(frameHTML(t.frame, SLOT_CV("cvS")) + EMPTY_STAGE, SIGN_DUR * 1000, () => playSign($("cvS"), t.clip)),
    timed('<div class="msg"></div>' + EMPTY_STAGE, 300),
    timed(frameHTML(t.frame) + `<div class="stage">${ANIM_CV("cvA")}</div>`, ANIM_DUR * 1000, () => playAnim($("cvA"), t.anim))
  ];
  const resp = {type: BTN,
    stimulus: frameHTML(t.frame) + EMPTY_STAGE,
    choices: () => order.concat(["replay"]), button_layout: "flex",
    button_html: c => c === "replay"
      ? '<div class="replay-row"><button class="jspsych-btn">Tekrar izle</button></div>'
      : `<button class="jspsych-btn resp-btn">${c === "D" ? "✓ Doğru" : "✗ Yanlış"}</button>`,
    data: Object.assign({task: feedback ? "practice" : "tvj"}, itemData(t)),
    on_load: stopAll,
    on_finish: d => {
      const c = order.concat(["replay"])[d.response];
      if (c === "replay") { replays++; d.replay = true; d.task = "replay_request"; return; }
      d.replay = false; answer = c;
      d.answer = c; d.accept = c === "D" ? 1 : 0; d.replays = replays;
      d.is_correct = t.correct ? (c === t.correct ? 1 : 0) : "";
      d.dogru_left = DESIGN.dogruLeft ? 1 : 0;
      if (t.critical && t.block === "bare") CRIT_ANSWERS.push({t, answer: c});
    }};
  const loop = {timeline: show.concat([resp]), loop_function: data => { const last = data.values().slice(-1)[0]; return !!(last && last.replay); }};
  const tl = [readyKey(), loop];
  if (feedback) tl.push({type: KB, choices: "NO_KEYS", trial_duration: () => answer === t.correct ? 1600 : 3200,
    data: {task: "feedback"},
    stimulus: () => frameHTML(t.frame) + '<div class="stage"><div>' + (answer === t.correct ? '<p class="fbk ok">Doğru cevap!</p>'
      : `<p class="fbk bad">Yanlış cevap.</p><p>Animasyona göre bu cümle ${t.correct === "D" ? "doğruydu" : "yanlıştı"}.</p>`) + '</div></div>',
    on_load: stopAll});
  return {timeline: tl};
}

/* attention check, with the same buttons as the main task */
function attentionTrial(target) {
  const order = DESIGN.dogruLeft ? ["D", "Y"] : ["Y", "D"];
  return {timeline: [readyKey(), {type: BTN,
    stimulus: `<div class="attn">Dikkat kontrolü: Bu denemede mesaj ve animasyon yok. Lütfen “${ANS[target]}” düğmesine tıklayın.</div>` + EMPTY_STAGE,
    choices: order, button_layout: "flex",
    button_html: c => `<button class="jspsych-btn resp-btn">${c === "D" ? "✓ Doğru" : "✗ Yanlış"}</button>`,
    data: {task: "attention", correct_answer: target},
    on_finish: d => { d.answer = order[d.response]; d.is_correct = d.answer === target ? 1 : 0; }}]};
}

/* ---------------- sign learning ---------------- */
function learnScreen(e, i) {
  return {type: BTN,
    stimulus: `<div class="pair"><figure>${SLOT_CV("cvS").replace('class="sg"', 'class="sg" style="width:300px;height:300px"').replace('data-w="200" data-h="200"', 'data-w="300" data-h="300"')}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
    choices: ["İleri"], button_html: plainBtn, enable_button_after: TEST ? 300 : 4500,
    data: {task: "learning", event: e, handshape: MAP[e], pass: i < 4 ? 1 : 2},
    on_load: () => {
      stopAll();
      const tr = {dom: trSingle(MAP[e], 0.5).concat(trSingle(MAP[e], 2.4).slice(1)), non: []};
      play($("cvS"), (c, w, h, t) => drawSigner(c, w, h, tr, t), 3.9, {loop: true, pause: 0.6});
      play($("cvA"), (c, w, h, t) => drawEvents(c, w, h, [{ev: e, t0: 0.3, dur: 2}, {ev: e, t0: 2.9, dur: 1}], t), 4.1, {loop: true, pause: 0.6});
    }};
}

/* identification: a sign, then four animations; feedback after each trial */
function idTrial(getEv, block, k) {
  let opts = null, ev = null, chosen = null;
  const btnCv = (e, i) => `<canvas data-w="150" data-h="115" data-ev="${e}"></canvas>`;
  return [readyKey(),
    {type: KB, choices: "NO_KEYS", trial_duration: 2400, stimulus: '<div class="stage" style="height:320px">' + SLOT_CV("cvS") + '</div>',
      data: {task: "display"},
      on_start: () => { ev = getEv(k); opts = shuffle(EV); },
      on_load: () => { stopAll(); playSign($("cvS"), {type: "single", X: ev, dur: 2.4}); }},
    {type: BTN, stimulus: '<p class="q">Bu işaret hangi değişikliği anlatıyor?</p>',
      choices: () => opts, button_layout: "flex", button_html: (c, i) => `<button class="jspsych-btn anim-btn">${btnCv(c, i)}</button>`,
      data: {task: "identification"},
      on_load: () => { stopAll(); document.querySelectorAll(".anim-btn canvas").forEach(cv => play(cv, (c, w, h, t) => drawEvents(c, w, h, [{ev: cv.dataset.ev, t0: 0.3, dur: 2}], t), 2.4, {loop: true, pause: 0.5})); },
      on_finish: d => { chosen = opts[d.response]; d.target = ev; d.chosen = chosen; d.is_correct = chosen === ev ? 1 : 0; d.id_block = block(); }},
    {type: KB, choices: "NO_KEYS", trial_duration: () => chosen === ev ? 1600 : 2800, data: {task: "feedback"},
      stimulus: () => `<p class="q">Bu işaret hangi değişikliği anlatıyor?</p><div class="jspsych-btn-group-flex">` +
        opts.map(o => `<button disabled class="jspsych-btn anim-btn fbbtn" style="border-color:${o === ev ? "forestgreen" : o === chosen ? "#c00000" : "#cccccc"};opacity:${o === ev || o === chosen ? 1 : 0.4}">${btnCv(o)}</button>`).join("") +
        `</div><p class="fbk ${chosen === ev ? "ok" : "bad"}">${chosen === ev ? "Doğru cevap!" : "Yanlış cevap."}</p>`,
      on_load: () => { stopAll(); document.querySelectorAll(".fbbtn canvas").forEach(cv => {
        if (cv.dataset.ev === ev) play(cv, (c, w, h, t) => drawEvents(c, w, h, [{ev, t0: 0.2, dur: 1.2}], t), 1.6);
        else still(cv, (c, w, h) => drawEvents(c, w, h, [], 0)); }); }}];
}

/* ---------------- understanding checks ---------------- */
function quiz(title, intro, qs, again) {
  const instrHtml = again.stimulus.replace(/<\/?div[^>]*>/g, "");
  let tries = 0, allOk = false;
  const form = {type: FORM, button_label: "Cevapları gönder",
    html: () => `<div class="instr form"><h3>${title}</h3>${tries > 0 ? '<p class="err">Bazı cevaplar yanlıştı. Lütfen açıklamayı tekrar okuyun ve yeniden cevaplayın.</p>' : ""}<p>${intro}</p>` +
      `<details class="again"><summary>Açıklamayı tekrar göster</summary><div class="againbox">${instrHtml}</div></details>` +
      qs.map((q, i) => `<p><b>${i + 1}. ${q.q}</b> <span class="req">*</span></p><div class="radios col">${shuffle(q.opts.map((o, j) => [o, j])).map(([o, j]) =>
        `<label><input type="radio" name="q${i}" value="${j}" required> ${o}</label>`).join("")}</div>`).join("") + "</div>",
    data: {task: "quiz", quiz: title},
    on_finish: d => { tries++; allOk = qs.every((q, i) => +d.response["q" + i] === q.ok); d.quiz_ok = allOk ? 1 : 0; d.quiz_try = tries; }};
  return {timeline: [{timeline: [Object.assign({}, again, {data: {task: "instructions_again"}})], conditional_function: () => tries > 0}, form], loop_function: () => !allOk};
}

/* ---------------- forced choice ---------------- */
/* The two animations play one after the other (A, then B), each framed while it plays.
 * Then the participant can replay either one with its own button, or replay the sentence.
 * A and B can be chosen only after both have played once. */
function fcTrial(t) {
  const L = a2(t.P, t.Q, t.dur_left ? "DUR" : "SEQ"), R = a2(t.P, t.Q, t.dur_left ? "SEQ" : "DUR");
  let replays = 0, plays = {A: 0, B: 0};
  const fig = k => `<figure id="fig${k}">${ANIM_CV("fc" + k)}<figcaption>${k}</figcaption>` +
    `<button type="button" class="jspsych-btn playbtn" id="play${k}" disabled>▶ ${k} animasyonunu oynat</button></figure>`;
  const choose = {type: BTN, stimulus: frameHTML("pos") + '<p class="q">Bu cümle hangi animasyonu daha iyi anlatıyor?</p>' +
      `<div class="pair">${fig("A")}${fig("B")}</div>`,
    choices: ["A", "B", "replay"], button_layout: "flex",
    button_html: c => c === "replay" ? '<div class="replay-row"><button class="jspsych-btn">Cümleyi tekrar izle</button></div>' : `<button class="jspsych-btn resp-btn" disabled>${c}</button>`,
    data: Object.assign({task: "forced_choice", dur_left: t.dur_left ? 1 : 0}, itemData(t)),
    on_load: () => {
      stopAll();
      const ev = {A: L, B: R}, cv = {A: $("fcA"), B: $("fcB")};
      const blank = k => still(cv[k], (c, w, h) => drawEvents(c, w, h, [], 0));
      const show = (k, on) => $("fig" + k).classList.toggle("on", on);
      const once = k => { show(k, true); playAnim(cv[k], ev[k]); jsPsych.pluginAPI.setTimeout(() => show(k, false), ANIM_DUR * 1000); };
      blank("A"); blank("B");
      once("A");
      jsPsych.pluginAPI.setTimeout(() => { blank("A"); once("B"); }, ANIM_DUR * 1000 + 400);
      jsPsych.pluginAPI.setTimeout(() => {
        blank("B");
        document.querySelectorAll(".resp-btn, .playbtn").forEach(b => { b.disabled = false; });
        ["A", "B"].forEach(k => $("play" + k).addEventListener("click", () => { plays[k]++; once(k); }));
      }, TEST ? 400 : 2 * ANIM_DUR * 1000 + 600);
    },
    on_finish: d => {
      d.plays_A = plays.A; d.plays_B = plays.B;
      if (d.response === 2) { replays++; d.replay = true; d.task = "replay_request"; return; }
      d.replay = false; d.replays = replays; d.chose_dur = ((d.response === 0) === t.dur_left) ? 1 : 0; }};
  return {timeline: [readyKey(), {timeline: [timed(frameHTML("pos", SLOT_CV("cvS")), SIGN_DUR * 1000, () => playSign($("cvS"), t.clip)), choose],
    loop_function: data => { const last = data.values().slice(-1)[0]; return !!(last && last.replay); }}]};
}

/* ---------------- inference task ---------------- */
const STATEMENT = {
  neg: {target: "Tobi iki değişikliği de yapmış olsaydı, ikinci değişiklik birincisi sürerken olurdu.",
        control: "Tobi iki değişikliği de yapmış olsaydı, ikinci değişiklik birincisi bittikten sonra olurdu."},
  pos: {target: "İkinci değişiklik birincisi sürerken oldu.",
        control: "İkinci değişiklik birincisi bittikten sonra oldu."}
};
function infTrial(t) {
  const st = STATEMENT[t.frame === "pos" ? "pos" : "neg"][t.inference];
  return {timeline: [readyKey(),
    timed(frameHTML(t.frame, SLOT_CV("cvS")), SIGN_DUR * 1000, () => playSign($("cvS"), t.clip)),
    {type: jsPsychHtmlSliderResponse,
      stimulus: frameHTML(t.frame, SLOT_CV("cvS")) + '<p class="q">Bu cümle aşağıdaki ifadeyi ne kadar düşündürüyor?</p>' + `<p class="statement">“${st}”</p>`,
      labels: ["0<br>hiç", "100<br>çok güçlü"], min: 0, max: 100, slider_start: 50, require_movement: true, button_label: "İleri", slider_width: 560,
      data: Object.assign({task: "inference", statement: st}, itemData(t)),
      on_load: () => { stopAll(); playSign($("cvS"), t.clip, {loop: true, pause: 1.5}); },
      on_finish: d => { d.rating = d.response; }}]};
}

/* ---------------- post-tests ---------------- */
const evGrid = () => `<div class="evgrid">${shuffle(EV).map(e => `<label><canvas data-w="150" data-h="115" data-ev="${e}"></canvas><input type="checkbox" name="ev_${e}"></label>`).join("")}</div>`;
function gridOn(nExact) {
  stopAll();
  document.querySelectorAll(".evgrid canvas").forEach(cv => play(cv, (c, w, h, t) => drawEvents(c, w, h, [{ev: cv.dataset.ev, t0: 0.3, dur: 2}], t), 2.4, {loop: true, pause: 0.5}));
  const boxes = [...document.querySelectorAll(".evgrid input")], btn = document.querySelector("#jspsych-survey-html-form-next");
  const upd = () => { boxes.forEach(b => b.parentNode.classList.toggle("on", b.checked));
    const n = boxes.filter(b => b.checked).length; btn.disabled = nExact ? n !== nExact : n < 1; };
  boxes.forEach(b => b.addEventListener("change", upd)); upd();
}
function whichTrial(t) {
  return {timeline: [readyKey(),
    timed(`<div class="stage">${ANIM_CV("cvA")}</div>`, ANIM_DUR * 1000, () => playAnim($("cvA"), t.anim)),
    {type: FORM, button_label: "İleri",
      html: '<div class="instr form"><p><b>Animasyonda hangi değişiklikler oldu?</b> Olanların hepsini işaretleyin.</p>' + evGrid() +
        '<p><b>Bu değişiklikler nasıl oldu?</b> <span class="req">*</span></p><div class="radios col">' +
        '<label><input type="radio" name="when" value="overlap" required> Biri sürerken öbürü de oldu.</label>' +
        '<label><input type="radio" name="when" value="after"> Biri bittikten sonra öbürü oldu.</label></div></div>',
      data: Object.assign({task: "which_changes"}, itemData(t)),
      on_load: () => gridOn(0),
      on_finish: d => { const r = d.response; const ch = EV.filter(e => r["ev_" + e]);
        d.chosen = ch.join("+"); d.when = r.when; d.response = null;
        d.events_ok = ch.length === 2 && ch.includes(t.P) && ch.includes(t.Q) ? 1 : 0;
        d.timing_ok = (r.when === "overlap") === (t.anim_label === "DUR") ? 1 : 0; }}]};
}
function recoveryTrial(t) {
  return {timeline: [readyKey(),
    timed(`<div class="stage" style="height:320px">${SLOT_CV("cvS")}</div>`, SIGN_DUR * 1000, () => playSign($("cvS"), t.clip)),
    {type: FORM, button_label: "İleri",
      html: '<div class="instr form"><p><b>Bu mesaj hangi iki değişikliği anlatıyor?</b> İkisini işaretleyin.</p>' + evGrid() + "</div>",
      data: Object.assign({task: "recovery"}, itemData(t)),
      on_load: () => gridOn(2),
      on_finish: d => { const ch = EV.filter(e => d.response["ev_" + e]); d.chosen = ch.join("+"); d.response = null;
        d.is_correct = ch.includes(t.P) && ch.includes(t.Q) ? 1 : 0; }}]};
}

/* ---------------- debriefing ---------------- */
function debriefTrial(k) {
  return {timeline: [{type: FORM, button_label: "İleri",
    html: () => { const c = CRIT_ANSWERS[k]; if (!c) return "";
      return `<div class="instr form"><h3>Son sorular (${k + 1}/2)</h3><p>Aşağıda daha önce gördüğünüz bir deneme yeniden oynatılıyor. Bu denemede <b>“${ANS[c.answer]}”</b> cevabını verdiniz.</p></div>` +
        frameHTML(c.t.frame, SLOT_CV("dbS")) + `<div class="stage">${ANIM_CV("dbA")}</div>` +
        '<div class="instr form"><p><b>Neden bu cevabı verdiniz?</b> <span class="req">*</span></p><textarea name="why" rows="3" required></textarea></div>'; },
    data: {task: "debrief_trial"},
    on_load: () => { stopAll(); const c = CRIT_ANSWERS[k]; if (!c) return;
      const tr = makeTracks(c.t.clip, MAP);
      play($("dbS"), (cx, w, h, t) => drawSigner(cx, w, h, tr, t), SIGN_DUR, {loop: true, pause: ANIM_DUR + 1.3});
      play($("dbA"), (cx, w, h, t) => { const tt = t - SIGN_DUR - 0.3; drawEvents(cx, w, h, c.t.anim, tt < 0 ? 0 : tt); }, SIGN_DUR + 0.3 + ANIM_DUR, {loop: true, pause: 1.0}); },
    on_finish: d => { const c = CRIT_ANSWERS[k]; Object.assign(d, itemData(c && c.t)); d.answer = c ? c.answer : ""; d.why = d.response.why; d.response = null; }}],
    conditional_function: () => !!CRIT_ANSWERS[k]};
}
const BACKGROUND = {type: FORM, button_label: "Gönder",
  html: `<div class="instr form"><h3>Son sorular</h3>
    <p><b>Bir işaret bir elde tutulurken diğer elin ikinci işareti yaptığı mesajlar sizce ne anlatıyordu?</b> <span class="req">*</span></p>
    <textarea name="held_meaning" rows="3" required></textarea>
    <p><b>Deney sırasında işaretleri hatırlamak için aklınızdan bir isim verdiniz mi?</b> <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="named" value="evet" required> Evet</label><label><input type="radio" name="named" value="hayir"> Hayır</label></div>
    <p>Evet ise, hangi kelimeleri kullandınız?</p><input type="text" name="named_words">
    <p><b>Deney sırasında not aldınız mı?</b> <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="notes" value="evet" required> Evet</label><label><input type="radio" name="notes" value="hayir"> Hayır</label></div>
    <p><b>Türk İşaret Dili’ni (TİD) veya başka bir işaret dilini öğreniyor musunuz ya da biliyor musunuz?</b> <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="signlang" value="evet" required> Evet</label><label><input type="radio" name="signlang" value="hayir"> Hayır</label></div>
    <p>Evet ise, hangi dili ve ne kadar süredir?</p><input type="text" name="signlang_which">
    <p>Evet ise, bu dildeki yeterliliğinizi 1 (çok düşük) ile 7 (çok yüksek) arasında değerlendirin.</p>
    <div class="radios">${[1, 2, 3, 4, 5, 6, 7].map(n => `<label><input type="radio" name="signlang_level" value="${n}"> ${n}</label>`).join("")}</div>
    <p><i>İsteğe bağlı:</i> Deneyle ilgili eklemek istediğiniz bir şey var mı?</p><textarea name="comments" rows="2"></textarea></div>`,
  data: {task: "background"},
  on_finish: d => { Object.assign(d, d.response); d.response = null; }};

/* ---------------- consent ---------------- */
const TITLE = "Yapay Bir İşaret Dilinin Öğrenilmesi";
const CONSENT = {type: FORM, button_label: "Katılmayı kabul ediyorum",
  html: `<div class="instr form consent"><h3>Bilgilendirilmiş Onam Formu</h3>
  <p><b>Araştırmanın adı:</b> “${TITLE}”</p>
  <p>Sayın katılımcı,</p><p>Boğaziçi Üniversitesi Dilbilimi Bölümü doktora öğrencisi Onur Keleş tez çalışması için Doç. Dr. Kadir Gökgöz danışmanlığında “Yapay Bir İşaret Dilinin Öğrenilmesi” adında bir araştırma projesi gerçekleştirmektedir. Bu çalışmanın amacı, insanların yeni bir işaret sistemini nasıl öğrendiğini incelemektir. Bu araştırmada bize yardımcı olmanız için sizi projemize davet ediyoruz. Kararınızdan önce araştırma hakkında sizi bilgilendirmek istiyoruz. Bu bilgileri okuduktan sonra araştırmaya katılmak isterseniz lütfen formun sonundaki ifadeleri işaretleyin ve bilgilerinizi yazın.</p><p>Bu araştırmaya katılmayı kabul ettiğiniz takdirde, kendi bilgisayarınızda, bir internet tarayıcısında çevrimiçi bir deney yapacaksınız. Deney telefon veya tablette yapılamaz. Bu deneye katılmak için en az 18 yaşında olmanız, anadilinizin Türkçe olması ve normal ya da düzeltilmiş (gözlük veya lens ile) görmeye sahip olmanız gerekmektedir. Bu projenin başka bir bölümüne daha önce katıldıysanız lütfen tekrar katılmayınız. İlk aşamada, Tobi adlı yuvarlak bir çizgi karakterin yaptığı dört değişiklik için dört işaret öğreneceksiniz. İşaretler ekranda çizilmiş bir figür tarafından gösterilecektir. Daha sonra, içinde işaret bulunan kısa Türkçe cümleler (örneğin “Tobi [işaret] yapmadı.”) ve Tobi’nin animasyonlarını göreceksiniz ve her animasyondan sonra cümlenin doğru mu yanlış mı olduğuna karar vereceksiniz. Bazı bölümlerde iki animasyon arasından seçim yapmanız veya bir cümlenin bir ifadeyi ne kadar düşündürdüğünü 0 ile 100 arasında değerlendirmeniz istenecektir. Son olarak cevaplarınızı kısaca açıklamanız ve dil geçmişinizle ilgili birkaç soruyu yanıtlamanız istenecektir. Bu deneyde video veya ses kaydı alınmayacaktır. Deneyin tamamlanması, kısa bir ara ile birlikte yaklaşık 60 dakika sürmektedir. Lütfen deneyi sessiz bir yerde ve tek seferde yapın.</p><p>Yapmak istediğimiz araştırmanın size günlük hayatta karşılaşılan risklerin ötesinde bir risk getirmesi beklenmemektedir. Kendinizi yorgun hissederseniz deneydeki ara ekranlarında istediğiniz kadar dinlenebilirsiniz.</p><p>Bu araştırma bilimsel bir amaçla yapılmaktadır ve katılımcı bilgilerinin gizliliği esas tutulmaktadır. Araştırmada toplanan veriler güvenli bir şekilde saklanacaktır. Verilerinizde isminiz kullanılmayacak, size tanımlayıcı bir numara verilecektir. Cevaplarınız, adınız olmadan yalnızca bu numarayla, DataPipe (pipe.jspsych.org) aracılığıyla araştırma ekibine ait, yalnızca araştırma ekibinin erişebildiği bir Google Drive klasörüne kaydedilecektir. Bu formda yazdığınız adınız, öğrenci numaranız ve dersiniz, cevaplarınızdan ayrı bir klasörde saklanacaktır. Veri toplama bittiğinde dosyalar şifreli ve parola korumalı ortamlara taşınacak ve Google Drive’dan silinecektir. Öğrenci numaranız yalnızca ders puanınızın ilgili öğretim üyesine bildirilmesi için kullanılacak ve puan bildirildikten sonra silinecektir. Verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu’na uygun olarak işlenecek, şifreli ve parola korumalı ortamlarda saklanacak ve yalnızca araştırma ekibi tarafından görülebilecektir. Anonim hale getirilen veriler bilimsel nitelikteki konferans sunularında ve/veya bilimsel yayınlarda kullanılabilir ve açık bilim platformlarında (örneğin OSF) diğer araştırmacılarla paylaşılabilir. Çalışma bittikten sonra yayınlanması halinde dilerseniz çalışmanın bir kopyası sizlerle paylaşılacaktır.</p><p>Bu araştırmaya katılmak tamamen isteğe bağlıdır. Katıldığınız takdirde çalışmanın herhangi bir aşamasında herhangi bir sebep göstermeden onayınızı çekmek hakkına sahipsiniz. Bu durumda cevaplarınız ve verileriniz silinecek ve çalışmada kullanılmayacaktır. Deneyi tamamlamazsanız herhangi bir ceza olmayacaktır. Deneyi bitirmeden sayfayı kapatırsanız cevaplarınız kaydedilmez. Katılımınızdan sonraki iki hafta içinde araştırmacıya yazarak verilerinizin silinmesini de isteyebilirsiniz. Bu çalışmaya katılacak Boğaziçi Üniversitesi öğrencileri almakta oldukları LING (Linguistics) veya TİD (Türk İşaret Dili) kodlu ders için deneyi tamamlamaları durumunda toplam ders puanına eklenecek artı “iki” puan kazanacaktır (örneğin toplam notunuz 59 ise 59+2=61, 72 ise 72+2=74, 88 ise 88+2=90 şeklinde). Öğrenme aşamasındaki ölçütü karşılayamadığı için deneyi erken bitiren katılımcılar da bu puanı alacaktır. Bu çalışmaya katıldığınız dönemde birden fazla LING veya TİD dersi alıyorsanız, deneye lütfen yalnızca bir kez katılınız.</p><p>Araştırma projesi hakkında ek bilgi almak istediğiniz takdirde lütfen Boğaziçi Üniversitesi Dilbilimi Bölümü Öğretim Üyesi Doç. Dr. Kadir Gökgöz (Telefon: +90 212 359 4902, elektronik posta: kadir.gokgoz@bogazici.edu.tr) veya Dilbilimi Bölümü doktora öğrencisi ve araştırma görevlisi Onur Keleş (Telefon: +90 212 359 4908, elektronik posta: onur.keles1@bogazici.edu.tr) ile temasa geçiniz (Adres: Boğaziçi Üniversitesi, Dilbilimi Bölümü, 34342 Bebek, İstanbul). Araştırmayla ilgili haklarınız konusunda Boğaziçi Üniversitesi Sosyal ve Beşeri Bilimler İnsan Araştırmaları Etik Kurulu’na (sbinarek@bogazici.edu.tr) da danışabilirsiniz.</p>
  <p>Eğer bu araştırma projesine katılmayı kabul ediyorsanız, lütfen aşağıdaki ifadeleri işaretleyin ve adınızı, öğrenci numaranızı ve dersinizi yazın.</p>
  <div class="checks">
    <label><input type="checkbox" name="read" required> Yukarıdaki metni okudum ve katılmam istenen çalışmanın kapsamını ve amacını, gönüllü olarak üzerime düşen sorumlulukları tamamen anladım. Çalışma hakkında sorularımı araştırmacılara e-posta ile sorabileceğimi biliyorum. Bu çalışmayı istediğim zaman ve herhangi bir neden belirtmek zorunda kalmadan bırakabileceğimi ve bıraktığım takdirde herhangi bir olumsuzluk ile karşılaşmayacağımı anladım. <span class="req">*</span></label>
    <label><input type="checkbox" name="eligible" required> En az 18 yaşındayım, anadilim Türkçe ve normal ya da düzeltilmiş (gözlük veya lens ile) görmeye sahibim. <span class="req">*</span></label>
    <label><input type="checkbox" name="voluntary" required> Bu koşullarda söz konusu araştırmaya kendi isteğimle, hiçbir baskı ve zorlama olmaksızın katılmayı kabul ediyorum.  <span class="req">*</span></label>
    
  </div>
  <p><b>Adınız ve soyadınız</b> <span class="req">*</span></p><input type="text" name="name" required autocomplete="off">
  <p><b>Öğrenci numaranız</b> (ders puanı için) <span class="req">*</span></p><input type="text" name="student_no" required inputmode="numeric" pattern="[0-9]{6,12}" title="Lütfen öğrenci numaranızı yalnızca rakamla yazın." autocomplete="off">
  <p><b>Dersiniz ve şubeniz</b> <span class="req">*</span></p>
  <select name="course" required><option value="">Seçiniz</option><option>LING 101.02 (Gökgöz)</option><option>LING 101.03 (Fiddler)</option><option>TİD 101.01</option><option>TİD 101.02</option><option>Diğer</option></select>
  <p>Tarih: ${new Date().toLocaleDateString("tr-TR")}</p>
  <p>Bu formun bir örneğini almak isterseniz araştırmacıya e-posta ile yazabilirsiniz.</p></div>`,
  data: {task: "consent"},
  on_finish: d => {
    const r = d.response;
    ID_INFO = {subject: SUBJ, name: r.name, student_no: r.student_no, course: r.course, date: new Date().toISOString()};
    d.consent = 1; d.course = r.course; d.response = null;   /* name and student number are not kept with the answers */
  }};

/* ---------------- saving ---------------- */
function csvOf(rows) {
  const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const esc = v => { if (v == null) return ""; const s = typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [cols.join(",")].concat(rows.map(r => cols.map(c => esc(r[c])).join(","))).join("\n");
}
function mainCSV(extra) {
  const rows = jsPsych.data.get().filterCustom(r => !["display", "ready", "replay_request"].includes(r.task)).values()
    .map(r => { const o = Object.assign({}, r); delete o.stimulus; return o; });
  if (extra) rows.push(extra);
  return csvOf(rows);
}
let SUMMARY = null;
function makeSummary(status) {
  const inter = jsPsych.data.getInteractionData().values();
  const all = jsPsych.data.get();
  const ctrl = all.filter({task: "tvj"}).values().filter(r => r.kind === "control");
  const base = all.values()[0] || {};
  const keep = ["subject", "condition", "cond_source", "seed", "list", "p_order", "handshape_map", "map_rise", "map_turn", "map_swell", "map_pulse", "dogru_left", "test_mode"];
  SUMMARY = Object.assign({}, ...keep.map(k => ({[k]: base[k]})), {task: "summary", status, total_ms: Math.round(performance.now() - T0),
    blur_count: inter.filter(e => e.event === "blur").length, fullscreen_exits: inter.filter(e => e.event === "fullscreenexit").length,
    id_blocks: ID_BLOCKS.join("|"), id_passed: ID_PASSED ? 1 : 0,
    controls_correct: ctrl.filter(r => r.is_correct === 1).length, controls_n: ctrl.length,
    attention_correct: all.filter({task: "attention"}).values().filter(r => r.is_correct === 1).length,
    attention_n: all.filter({task: "attention"}).count()});
  return SUMMARY;
}
function saveScreen(status) {
  return {type: KB, choices: "NO_KEYS", stimulus: '<p class="wait">Cevaplarınız kaydediliyor. Lütfen bekleyin…</p>', data: {task: "summary"},
    on_load: () => {
      const sum = makeSummary(status);
      if (!UPLOAD) { jsPsych.finishTrial(sum); return; }
      const idCsv = csvOf([ID_INFO || {subject: SUBJ}]);
      Promise.all([jsPsychPipe.saveData(DATAPIPE_ID, `${SUBJ}.csv`, mainCSV(sum)), jsPsychPipe.saveData(DATAPIPE_ID_KIMLIK, `kimlik_${SUBJ}.csv`, idCsv)])
        .then(rs => { SAVE_OK = rs.every(r => r && !r.error && !(r instanceof Error)); jsPsych.finishTrial(Object.assign({}, sum, {save_ok: SAVE_OK ? 1 : 0})); })
        .catch(() => { SAVE_OK = false; jsPsych.finishTrial(Object.assign({}, sum, {save_ok: 0})); });
    }};
}
function download(name, text) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type: "text/csv"})); a.download = name; a.click();
}
function endScreen(early) {
  return {type: BTN, choices: () => (!UPLOAD || !SAVE_OK) ? ["Veriyi indir"] : [], button_html: plainBtn,
    stimulus: () => `<div class="instr"><h3>Katıldığınız için teşekkür ederiz!</h3>` +
      (early ? "<p>İşaretleri öğrenme bölümü burada sona erdi ve deney sizin için tamamlandı. Ders puanınızı yine alacaksınız.</p>" : "") +
      `<p>Bu deneyde öğrendiğiniz işaret sistemi bu çalışma için oluşturuldu. Çalışmada, öğrenenlerin iki işaretin zamanlamasını (bir işaret elde tutulurken ikinci işaretin yapılmasını) iki olayın zamanlaması olarak okuyup okumadığını ve bu anlamın olumsuz cümlelerde nasıl davrandığını inceliyoruz.</p>
      <p>Lütfen deneyin içeriğini, bu çalışmaya katılabilecek arkadaşlarınızla <b>11 Aralık’a kadar</b> konuşmayın.</p>` +
      (UPLOAD && SAVE_OK ? "<p>Cevaplarınız kaydedildi. Bu sayfayı şimdi kapatabilirsiniz.</p>" : "") +
      (UPLOAD && !SAVE_OK ? `<p class="err">Cevaplarınız gönderilemedi. Lütfen aşağıdaki düğmeyle dosyayı indirip ${CONTACT_EMAIL} adresine e-postayla gönderin.</p>` : "") +
      (!UPLOAD ? "<p class=\"err\">Deneme sürümü: veriler gönderilmedi. Aşağıdaki düğmeyle indirebilirsiniz.</p>" : "") + "</div>",
    data: {task: "end"},
    on_load: () => { stopAll(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); },
    on_finish: () => { download(`${SUBJ}.csv`, mainCSV()); if (ID_INFO) download(`kimlik_${SUBJ}.csv`, csvOf([ID_INFO])); }};
}

/* ---------------- build the session ---------------- */
let T0 = performance.now();
function build() {
  const D = DESIGN, T = [], MARK = {};
  const cut = (a, n) => TEST ? a.slice(0, n) : a;

  /* 1. computer check */
  T.push({type: jsPsychBrowserCheck, minimum_width: MIN_W, minimum_height: MIN_H,
    features: ["width", "height", "browser", "browser_version", "mobile", "os"],
    window_resize_message: `<div class="instr"><p>Tarayıcı pencereniz bu deney için çok küçük. Lütfen pencereyi büyütün.</p>
      <p>En az genişlik: <span id="browser-check-min-width"></span> piksel. Şu anki genişlik: <span id="browser-check-actual-width"></span> piksel.</p>
      <p>En az yükseklik: <span id="browser-check-min-height"></span> piksel. Şu anki yükseklik: <span id="browser-check-actual-height"></span> piksel.</p></div>`,
    resize_fail_button_text: "Pencereyi daha fazla büyütemiyorum",
    inclusion_function: f => !f.mobile,
    exclusion_message: f => f.mobile
      ? "<div class=\"instr\"><p>Bu deney yalnızca bir <b>bilgisayarda</b> (dizüstü veya masaüstü) yapılabilir. Lütfen bağlantıyı bir bilgisayarda açın.</p></div>"
      : "<div class=\"instr\"><p>Ekranınız bu deney için çok küçük. Lütfen daha büyük ekranı olan bir bilgisayar kullanın.</p></div>",
    data: {task: "browser_check"}});

  /* 2. welcome, consent, fullscreen */
  T.push(instr(`<h3>Deneye hoş geldiniz</h3>
    <p>Bu deneyde, Tobi adlı yuvarlak bir karakterin dünyasında kullanılan küçük bir işaret dili öğreneceksiniz. Bu dilde, Tobi’nin yaptığı değişiklikler için işaretler var. Önce işaretleri öğreneceksiniz. Ardından, içinde işaret bulunan Türkçe cümleler ve Tobi’nin animasyonlarını göreceksiniz.</p>
    <p>Deney, kısa bir ara ile birlikte yaklaşık 60 dakika sürer. <b>Lütfen deney boyunca not almayın ve kimseyle konuşmayın.</b> Lütfen deneyi sessiz bir yerde ve tek seferde yapın.</p>
    <p>Deney tam ekranda yapılır. Lütfen deney bitene kadar tam ekrandan çıkmayın ve başka bir pencereye geçmeyin.</p>`));
  T.push(CONSENT);
  T.push({type: jsPsychFullscreen, fullscreen_mode: true, button_label: "Tam ekrana geç",
    message: '<div class="instr"><p>Deney tam ekranda yapılacak. Başlamak için aşağıdaki düğmeye tıklayın.</p></div>', data: {task: "fullscreen"}});

  MARK.learn = T.length;
  /* 3. sign learning */
  T.push(instr(`<h3>İşaretleri öğrenme</h3>
    <p>Tobi dört farklı değişiklik yapabiliyor. Her değişikliğin bir işareti var. Şimdi her işareti, anlattığı değişiklikle birlikte göreceksiniz. Her değişikliği iki kez göreceksiniz. Dört işareti iki tur hâlinde göreceksiniz.</p>
    <p><b>İşaretleri olabildiğince iyi öğrenmeye çalışın.</b> Deneyin geri kalanında bu işaretleri tanımanız gerekecek.</p>
    <p>Her ekranda “İleri” düğmesine birkaç saniye sonra tıklayabileceksiniz.</p>`));
  cut(D.learn, 4).forEach((e, i) => T.push(learnScreen(e, i)));

  /* identification blocks: 8 trials each; criterion 7 of 8 in two blocks in a row, at most 4 blocks */
  MARK.id = T.length;
  T.push(instr(`<h3>İşaretleri tanıma</h3>
    <p>Şimdi bir işaret göreceksiniz. Ardından ekranda dört animasyon belirecek. İşaretin anlattığı değişikliği gösteren animasyona tıklayın.</p>
    <p>Her cevaptan sonra cevabınızın doğru olup olmadığını göreceksiniz. Doğru animasyon yeşil çerçeveyle gösterilecek.</p>
    <p>Her denemeyi başlatmak için boşluk tuşuna basacaksınız.</p>`));
  { const nPer = TEST ? 2 : 8;
    let order = [];
    const blockTl = [];
    for (let k = 0; k < nPer; k++) blockTl.push(...idTrial(kk => { if (kk === 0) order = shuffle(EV.concat(EV)); return order[kk]; }, () => ID_BLOCKS.length + 1, k));
    T.push({timeline: blockTl, loop_function: () => {
      const last = jsPsych.data.get().filter({task: "identification"}).last(nPer).values();
      ID_BLOCKS.push(last.filter(r => r.is_correct === 1).length);
      const n = ID_BLOCKS.length;
      ID_PASSED = (TEST && params.get("fail") !== "1") || (n >= 2 && ID_BLOCKS[n - 1] >= 7 && ID_BLOCKS[n - 2] >= 7);
      return !ID_PASSED && n < 4;
    }}); }
  /* participants who do not reach the criterion end here */
  T.push({timeline: [saveScreen("criterion_not_reached"), endScreen(true), {type: KB, stimulus: "", choices: "NO_KEYS",
    on_load: () => jsPsych.abortExperiment('<div class="instr"><p>Teşekkür ederiz. Bu sayfayı kapatabilirsiniz.</p></div>')}],
    conditional_function: () => !ID_PASSED});

  MARK.practice = T.length;
  /* 4. task instructions, understanding check, practice */
  const taskInstr = instr(`<h3>Cümleler</h3>
    <p>Şimdi Tobi hakkında cümleler göreceksiniz. Cümlelerde bir kelimenin yerinde bir işaret olacak, örneğin: “Tobi [işaret] yaptı.” Ardından Tobi’nin ne yaptığını gösteren kısa bir animasyon gelecek.</p>
    <p>Animasyonda gördüklerinize göre cümle doğruysa <b>✓ Doğru</b> düğmesine, yanlışsa <b>✗ Yanlış</b> düğmesine tıklayın.</p>
    <p>Cevap vermeden önce cümleyi ve animasyonu tekrar izlemek isterseniz <b>Tekrar izle</b> düğmesine tıklayın.</p>
    <p>Önce birkaç alıştırma denemesi yapacaksınız. Alıştırmada cevabınızın doğru olup olmadığını göreceksiniz.</p>`);
  T.push(taskInstr);
  T.push(quiz("Kısa kontrol", "Başlamadan önce lütfen aşağıdaki soruları cevaplayın.", [
    {q: "Her denemede ne yapacaksınız?", opts: ["Animasyonu izledikten sonra cümlenin doğru mu yanlış mı olduğuna karar vereceğim.", "İşareti kameraya doğru yapacağım.", "Cümleyi klavyeyle yazacağım."], ok: 0},
    {q: "Cümleyi ve animasyonu tekrar görmek isterseniz ne yaparsınız?", opts: ["“Tekrar izle” düğmesine tıklarım.", "Sayfayı yenilerim.", "Tekrar izleyemem."], ok: 0},
    {q: "Deney sırasında not alabilir misiniz?", opts: ["Evet", "Hayır"], ok: 1}
  ], taskInstr));
  cut(D.practice, 2).forEach(t => T.push(tvjTrial(t, true)));

  MARK.bare = T.length;
  /* 5. bare block */
  T.push(instr(`<h3>Asıl bölüm</h3>
    <p>Şimdi deneyin asıl bölümü başlıyor. Bazı cümlelerde iki işaret olacak. Bu tür cümleleri daha önce görmediniz. Öğrendiklerinizi kullanarak doğru olduğunu düşündüğünüz cevabı verin.</p>
    <p>Göreviniz aynı. Animasyonda gördüklerinize göre cümle doğruysa <b>✓ Doğru</b>, yanlışsa <b>✗ Yanlış</b> düğmesine tıklayın. Bazen Tobi hiçbir şey yapmayabilir.</p>
    <p>Bu bölümde cevaplarınızın doğru olup olmadığı gösterilmeyecek. Bölümün ortasında kısa bir mola var.</p>`, "Başla"));
  { const bare = TEST ? D.bare.slice(0, 4).concat(D.bare.slice(4).filter(t => t.critical).slice(0, 2)) : D.bare, half = Math.ceil(bare.length / 2);
    const attnAt = half + 2 + Math.floor(Math.random() * (bare.length - half - 4 > 0 ? bare.length - half - 4 : 1));
    bare.forEach((t, i) => {
      if (i === half) T.push(instr("<h3>Kısa mola</h3><p>Bölümün yarısını tamamladınız. İsterseniz kısa bir mola verin. Hazır olduğunuzda devam edin.</p>", "Devam"));
      if (i === attnAt) T.push(attentionTrial("Y"));
      T.push(tvjTrial(t, false));
    }); }

  MARK.fc = T.length;
  /* 6. forced choice */
  T.push(instr(`<h3>İki animasyon</h3>
    <p>Şimdi bir cümle, ardından yan yana iki animasyon göreceksiniz. Cümlenin hangi animasyonu daha iyi anlattığını seçin.</p>
    <p>Önce soldaki animasyon (A), sonra sağdaki animasyon (B) oynatılacak. Sonra her animasyonu kendi düğmesiyle istediğiniz kadar tekrar oynatabilirsiniz. Cümleyi tekrar görmek isterseniz <b>Cümleyi tekrar izle</b> düğmesine tıklayın. Seçiminizi <b>A</b> veya <b>B</b> düğmesine tıklayarak yapın.</p>`));
  cut(D.fc, 2).forEach(t => T.push(fcTrial(t)));

  MARK.adverb = T.length;
  /* 7. break, then the overt-adverb block */
  T.push(instr(`<h3>Ara</h3>
    <p>İsterseniz biraz dinlenin.</p>
    <p>Bundan sonraki bazı cümlelerde <b><i>aynı anda</i></b> ifadesi geçecek. Göreviniz değişmiyor: animasyonda gördüklerinize göre cümle doğruysa <b>✓ Doğru</b>, yanlışsa <b>✗ Yanlış</b> düğmesine tıklayın.</p>
    <p>Hazır olduğunuzda “Devam” düğmesine tıklayın.</p>`, "Devam"));
  { const adv = cut(D.adverb, 4), attnAt = 3 + Math.floor(Math.random() * Math.max(1, adv.length - 6));
    adv.forEach((t, i) => { if (i === attnAt) T.push(attentionTrial("D")); T.push(tvjTrial(t, false)); }); }

  MARK.inference = T.length;
  /* 8. inference task */
  const infInstr = instr(`<h3>Değerlendirme</h3>
    <p>Şimdi yalnızca cümleleri göreceksiniz; animasyon olmayacak. Her cümleden sonra bir ifade göreceksiniz.</p>
    <p>Cümlenin bu ifadeyi ne kadar güçlü bir şekilde düşündürdüğünü 0 (hiç) ile 100 (çok güçlü) arasında, kaydırıcıyı kullanarak değerlendirin. Doğru ya da yanlış cevap yoktur; ilk izleniminizi verin.</p>`);
  T.push(infInstr);
  T.push(quiz("Kısa kontrol", "Başlamadan önce lütfen aşağıdaki soruyu cevaplayın.", [
    {q: "Kaydırıcıyı 100’e getirmek ne anlama gelir?", opts: ["Cümle bu ifadeyi çok güçlü bir şekilde düşündürüyor.", "Cümle bu ifadeyi hiç düşündürmüyor.", "Animasyon doğruydu."], ok: 0}
  ], infInstr));
  cut(D.inference, 3).forEach(t => T.push(infTrial(t)));

  MARK.post = T.length;
  /* 9. post-tests */
  T.push(instr(`<h3>Ne oldu?</h3>
    <p>Şimdi işaret olmadan yalnızca bir animasyon göreceksiniz. Ardından animasyonda hangi değişikliklerin olduğunu ve bunların nasıl olduğunu seçeceksiniz.</p>`));
  cut(D.which, 2).forEach(t => T.push(whichTrial(t)));
  T.push(instr(`<h3>İki işaretli mesajlar</h3>
    <p>Şimdi cümle ve animasyon olmadan, iki işaretten oluşan bir mesaj göreceksiniz. Ardından mesajın hangi iki değişikliği anlattığını seçeceksiniz.</p>`));
  cut(D.recovery, 2).forEach(t => T.push(recoveryTrial(t)));

  MARK.debrief = T.length;
  /* 10. debriefing and background questions */
  T.push(debriefTrial(0), debriefTrial(1), BACKGROUND);

  /* 11. save and end */
  T.push(saveScreen("complete"), endScreen(false));
  /* test version only: ?test=1&from=<phase> starts at that phase (after full screen) */
  const from = TEST && params.get("from");
  if (from && MARK[from] != null) {
    if (MARK[from] > MARK.id) ID_PASSED = true;
    const fs = T.find(t => t.type === jsPsychFullscreen);
    return [fs].concat(T.slice(MARK[from]));
  }
  return T;
}

/* ---------------- start ---------------- */
async function start() {
  SUBJ = (TEST ? "TEST_" : "") + jsPsych.randomization.randomID(10);
  SEED = Math.floor(Math.random() * 2 ** 31);
  let cond = null, condSource = "random";
  if (params.get("cond") != null && /^[0-7]$/.test(params.get("cond"))) { cond = +params.get("cond"); condSource = "url"; }
  else if (UPLOAD) {
    try {   /* getCondition returns the condition number itself */
      const r = await jsPsychPipe.getCondition(DATAPIPE_ID);
      const c = Number.isInteger(r) ? r : (r && Number.isInteger(r.condition) ? r.condition : null);
      if (c != null) { cond = c % N_CONDITIONS; condSource = "datapipe"; }
    } catch (e) { /* random below */ }
  }
  if (cond == null) cond = Math.floor(Math.random() * N_CONDITIONS);
  DESIGN = buildDesign(cond, SEED);
  MAP = DESIGN.map;
  jsPsych.data.addProperties({subject: SUBJ, condition: DESIGN.cond, cond_source: condSource, seed: SEED, list: DESIGN.list,
    p_order: DESIGN.reversed ? "reversed" : "standard", handshape_map: DESIGN.mapName,
    map_rise: MAP.rise, map_turn: MAP.turn, map_swell: MAP.swell, map_pulse: MAP.pulse,
    dogru_left: DESIGN.dogruLeft ? 1 : 0, pair_set: DESIGN.pairSet,
    pairs_used: DESIGN.pairs.map(p => p.join("-")).join("|"), test_mode: TEST ? 1 : 0});
  T0 = performance.now();
  jsPsych.run(build());
}
start();
