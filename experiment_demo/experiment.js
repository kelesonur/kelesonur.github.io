/* Demo session: learning, communication and simultaneity in a small sign system.
 * Stimuli are drawn on canvas (draw.js). Webcam recordings stay in the browser
 * and are not uploaded. */
"use strict";

/* ---------------- basic data ---------------- */
const EV = ["rise", "turn", "swell", "pulse"];
const MAPS = [
  {rise: "index", turn: "spread", swell: "fist", pulse: "flat"},
  {rise: "spread", turn: "flat", swell: "index", pulse: "fist"}
];
const TRAINED = [["rise", "turn"], ["rise", "swell"], ["turn", "pulse"], ["swell", "pulse"]];
const UNTRAINED = [["rise", "pulse"], ["turn", "swell"]];
const TIM = {DUR: {P: 1.35, Q: 1.85}, SEQ: {P: 0.60, Q: 3.10}};

const params = new URLSearchParams(location.search);
const CONGRUENT = !/^(i|inc|incongruent|uyumsuz)$/i.test(params.get("lang") || "");
const MAP = MAPS[Math.random() < 0.5 ? 0 : 1];

const rnd = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const other = tm => tm === "DUR" ? "SEQ" : "DUR";
const orient = pr => Math.random() < 0.5 ? pr.slice() : [pr[1], pr[0]];
/* the language: which timing each form means */
const meaning = form => (form === "HOLD") === CONGRUENT ? "DUR" : "SEQ";
const formFor = tm => meaning("HOLD") === tm ? "HOLD" : "LIN";

const anim2 = (P, Q, tm) => [{ev: P, t0: TIM[tm].P, dur: 2}, {ev: Q, t0: TIM[tm].Q, dur: 1}];
const clip2 = (form, P, Q) => ({type: form === "HOLD" ? "hold" : "lin", P, Q});

/* ---------------- drawing on the page ---------------- */
const SIGN_DUR = 4.0, ANIM_DUR = 4.8;
function playSign(cv, clip, opt) { const tr = makeTracks(clip, MAP); play(cv, (c, w, h, t) => drawSigner(c, w, h, tr, t), clip.dur || SIGN_DUR, opt); }
function playAnim(cv, evs, opt) { play(cv, (c, w, h, t) => drawEvents(c, w, h, evs, t), ANIM_DUR, opt); }
const LOOP = {loop: true, pause: 0.8};
const SIGN_CV = id => `<canvas class="sg" id="${id}" data-w="320" data-h="320"></canvas>`;
const ANIM_CV = id => `<canvas class="an" id="${id}" data-w="320" data-h="246"></canvas>`;
const $ = id => document.getElementById(id);

/* ---------------- skipping sections ---------------- */
const SKIP = {};
let CUR = null, BS = null, TIMERS = [], RECORDER = null, SCORE = 0;
const skipBtn = $("skip");
function later(fn, t) { TIMERS.push(setTimeout(fn, t)); }
function cleanup() { stopAll(); TIMERS.forEach(clearTimeout); TIMERS = []; stopRecorder(); }
/* every trial belongs to the section that is being built when it is added */
function L(trial) {
  const k = BS, os = trial.on_start, of = trial.on_finish;
  trial.on_start = t => { CUR = k; skipBtn.hidden = k === "end"; os && os(t); };
  trial.on_finish = d => { cleanup(); of && of(d); };
  return {timeline: [trial], conditional_function: () => !SKIP[k]};
}
skipBtn.addEventListener("click", () => {
  if (CUR == null || CUR === "end") return;
  SKIP[CUR] = true; cleanup(); jsPsych.finishTrial({skipped: true});
});

/* ---------------- webcam ---------------- */
let STREAM = null, CAM_FAILED = false, camPromise = null;
function openCam() {
  if (!camPromise) {
    camPromise = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ? navigator.mediaDevices.getUserMedia({video: {width: 640, height: 480}, audio: false})
      : Promise.reject(new Error("no camera")))
      .then(s => (STREAM = s)).catch(() => { CAM_FAILED = true; return null; });
  }
  return camPromise;
}
const CAM_BOX = '<div id="camwrap"><video class="cam" id="cam" autoplay muted playsinline></video></div>';
function attachCam() {
  openCam().then(s => {
    const v = $("cam");
    if (!v) return;
    if (s) { v.srcObject = s; v.play().catch(() => {}); }
    else $("camwrap").innerHTML = '<div class="nocam">Kamera açılamadı.</div>';
  });
}
function startRecorder() {
  if (!STREAM || typeof MediaRecorder === "undefined") return;
  const chunks = [];
  try { RECORDER = new MediaRecorder(STREAM); } catch (e) { RECORDER = null; return; }
  RECORDER.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  RECORDER.start();
}
function stopRecorder() {
  if (RECORDER && RECORDER.state !== "inactive") { try { RECORDER.stop(); } catch (e) {} }
  RECORDER = null;
}

/* ---------------- jsPsych ---------------- */
const jsPsych = initJsPsych({display_element: "jspsych-target"});
const BTN = jsPsychHtmlButtonResponse, KB = jsPsychHtmlKeyboardResponse;
const plainBtn = c => `<button class="jspsych-btn">${c}</button>`;

function instr(html, btn) {
  return L({type: BTN, stimulus: `<div class="instr">${html}</div>`, choices: [btn || "İleri"], button_html: plainBtn});
}
function timed(html, ms, onload) {
  return L({type: KB, stimulus: html, choices: "NO_KEYS", trial_duration: ms, on_load: () => { onload && onload(); }});
}

/* recording screen: left panel (sign or animation, looping), camera on the right,
 * countdown 3-2-1, then recording for recMs, then the trial ends by itself */
function recScreen(title, left, recMs) {
  return L({
    type: KB, choices: "NO_KEYS",
    stimulus: () => `<div class="frame">${title}</div><div class="pair">${left ? `<figure>${left.html}</figure>` : ""}<figure>${CAM_BOX}</figure></div><p class="cd" id="cd">&nbsp;</p>`,
    on_load: () => {
      if (left) left.start();
      attachCam();
      const cd = $("cd");
      [3, 2, 1].forEach((n, i) => later(() => { cd.textContent = n; }, i * 1000));
      later(() => { cd.innerHTML = '<span class="dot"></span>Kayıt'; startRecorder(); }, 3000);
      later(() => { stopRecorder(); cd.innerHTML = "&nbsp;"; jsPsych.finishTrial({recorded: true}); }, 3000 + recMs);
    }
  });
}
const leftSign = clip => ({html: SIGN_CV("cvL"), start: () => playSign($("cvL"), clip, LOOP)});
const leftAnim = evs => ({html: ANIM_CV("cvL"), start: () => playAnim($("cvL"), evs, LOOP)});

/* watch an animation, then press the button when ready to sign it */
function watchAnim(title, evs, btn) {
  return L({type: BTN, stimulus: `<div class="frame">${title}</div><div class="stage" style="height:auto">${ANIM_CV("cvA")}</div>`,
    choices: [btn || "Hazırım"], button_html: plainBtn, enable_button_after: 4800,
    on_load: () => playAnim($("cvA"), evs, LOOP)});
}
/* sign an animation to the webcam (free production, production test) */
function signAnim(evs) {
  return [watchAnim("Bu animasyonu izleyin.", evs), recScreen("Şimdi animasyonu kameraya doğru işaretleyin.", leftAnim(evs), 6000)];
}

/* choose among animation buttons; opts = [{key, evs}]; returns the chosen key through store */
function animButtons(opts, big) {
  return {
    choices: opts.map(o => o.key),
    button_html: (c, i) => `<button class="jspsych-btn anim-btn${big ? " big" : ""}"><canvas data-w="320" data-h="246" data-i="${i}"></canvas></button>`,
    start: () => document.querySelectorAll(".anim-btn canvas").forEach(cv => playAnim(cv, opts[+cv.dataset.i].evs, LOOP))
  };
}
function feedbackButtons(opts, target, chosen, big) {
  return opts.map((o, i) => {
    const bc = o.key === target ? "forestgreen" : o.key === chosen ? "red" : "#cccccc";
    const op = o.key === target || o.key === chosen ? 1 : 0.4;
    return `<button disabled class="jspsych-btn anim-btn fbbtn${big ? " big" : ""}" style="border-color:${bc};opacity:${op}"><canvas data-w="320" data-h="246" data-i="${i}"></canvas></button>`;
  }).join("");
}
function startFeedbackCanvases(opts) {
  document.querySelectorAll(".fbbtn canvas").forEach(cv => playAnim(cv, opts[+cv.dataset.i].evs, LOOP));
}

/* two-sign clip, then a DUR and a SEQ animation of the same two events */
function chooseTiming(form, P, Q, feedback) {
  const opts = shuffle(["DUR", "SEQ"]).map(tm => ({key: tm, evs: anim2(P, Q, tm)}));
  const target = meaning(form);
  let chosen = null;
  const ab = animButtons(opts, true);
  const tl = [
    timed('<p class="wait">Hazır olun.</p>', 1000),
    timed(`<div class="stage">${SIGN_CV("cvS")}</div>`, 4200, () => playSign($("cvS"), clip2(form, P, Q))),
    L({type: BTN, stimulus: '<p class="q">Bu mesaj hangi animasyonu daha iyi anlatıyor?</p>',
      choices: ab.choices, button_html: ab.button_html, button_layout: "flex", on_load: ab.start,
      on_finish: d => { chosen = opts[d.response] ? opts[d.response].key : null; }})
  ];
  if (feedback) tl.push(L({type: KB, choices: "NO_KEYS",
    trial_duration: () => chosen === target ? 2000 : 4000,
    stimulus: () => `<p class="q">Bu mesaj hangi animasyonu daha iyi anlatıyor?</p><div class="jspsych-btn-group-flex">${feedbackButtons(opts, target, chosen, true)}</div>` +
      (chosen === target ? '<p class="fbk ok">Doğru!</p>' : '<p class="fbk bad">Yanlış.</p>'),
    on_load: () => startFeedbackCanvases(opts)}));
  return tl;
}

/* ---------------- build the session ---------------- */
const T = [];

/* welcome and consent */
BS = "welcome";
T.push(instr(`<h3>Deneye hoş geldiniz</h3>
  <p>Bu deneyde, Tobi adlı yuvarlak bir karakterin yaptığı değişiklikleri anlatan küçük bir işaret dili öğreneceksiniz. Deneyin bazı bölümlerinde işaretleri kameraya doğru yapmanız istenecek. Deneyin sonunda başka bir katılımcıyla birlikte kısa bir oyun oynayacaksınız.</p>
  <p><b>Lütfen deney boyunca not almayın.</b></p>
  <p>Devam etmek için “İleri” düğmesine tıklayın.</p>`));
T.push(instr(`<h3>Bilgilendirilmiş onam</h3>
  <p>Bu çalışma, insanların yeni bir dili nasıl öğrendiğini ve kullandığını incelemektedir. Araştırmacı: Onur Keleş, Boğaziçi Üniversitesi.</p>
  <p>Aşağıdaki düğmeye tıklayarak şunları onaylamış olursunuz:</p>
  <ul>
    <li>18 yaşından büyüğüm.</li>
    <li>Bu çalışmaya gönüllü olarak katılıyorum ve istediğim zaman ayrılabilirim.</li>
    <li>Deney sırasında yüzümün ve ellerimin video kaydının alınmasını kabul ediyorum.</li>
    <li>Kayıtlar yalnızca araştırma amacıyla kullanılacak ve üçüncü kişilerle paylaşılmayacaktır.</li>
  </ul>`, "Katılmayı kabul ediyorum"));

/* camera */
BS = "camera";
T.push(L({type: BTN, stimulus: `<div class="instr"><h3>Kamera</h3>
  <p>Deneyin bazı bölümlerinde işaretleri kameraya doğru yapacaksınız. Kayıt her seferinde geri sayımdan sonra kendiliğinden başlar ve kendiliğinden durur. Böylece iki eliniz de serbest kalır.</p>
  <p>Kamerayı açmak için aşağıdaki düğmeye tıklayın. Tarayıcınız izin isterse lütfen izin verin.</p></div>`,
  choices: ["Kamerayı aç"], button_html: plainBtn, on_finish: () => { openCam(); }}));
T.push(L({type: BTN, stimulus: `<div class="instr"><p>Kendinizi aşağıda görüyor olmalısınız. Lütfen yüzünüzün, ellerinizin ve kollarınızın görüntüde olduğundan emin olun.</p></div><div class="pair"><figure>${CAM_BOX}</figure></div>`,
  choices: ["İleri"], button_html: plainBtn, on_load: attachCam}));

/* sign learning: every sign, long and short version, then copy */
BS = "learning";
T.push(instr(`<h3>İşaretleri öğrenme</h3>
  <p>Tobi dört farklı değişiklik yapabiliyor. Her değişikliğin bir işareti var. Şimdi her işareti, anlattığı değişiklikle birlikte göreceksiniz. Her değişikliği iki hâliyle göreceksiniz: önce uzun süren hâlini, sonra kısa süren hâlini.</p>
  <p>Her işareti gördükten sonra, işareti kameraya doğru siz de yapacaksınız.</p>
  <p><b>İşaretleri olabildiğince iyi öğrenmeye çalışın.</b> Deneyin geri kalanında bu işaretleri tanımanız gerekecek.</p>`));
shuffle(EV).forEach(e => {
  T.push(L({type: BTN,
    stimulus: `<div class="pair"><figure>${SIGN_CV("cvS")}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
    choices: ["İleri"], button_html: plainBtn, enable_button_after: 4500,
    on_load: () => {
      const tr = {dom: trSingle(MAP[e], 0.5).concat(trSingle(MAP[e], 2.4).slice(1)), non: []};
      play($("cvS"), (c, w, h, t) => drawSigner(c, w, h, tr, t), 3.9, {loop: true, pause: 0.6});
      play($("cvA"), (c, w, h, t) => drawEvents(c, w, h, [{ev: e, t0: 0.3, dur: 2}, {ev: e, t0: 2.9, dur: 1}], t), 4.1, {loop: true, pause: 0.6});
    }}));
  T.push(recScreen("Şimdi işareti siz yapın.", leftSign({type: "single", X: e, dur: 2.0}), 3000));
});

/* identification with feedback: one block, each sign once */
T.push(instr(`<h3>Alıştırma</h3>
  <p>Şimdi bir işaret göreceksiniz. Ardından dört animasyon belirecek. İşaretin anlattığı değişikliği gösteren animasyona tıklayın.</p>
  <p>Her cevaptan sonra cevabınızın doğru olup olmadığını göreceksiniz.</p>`));
shuffle(EV).forEach(e => {
  const opts = shuffle(EV).map(x => ({key: x, evs: [{ev: x, t0: 0.6, dur: 2}]}));
  const ab = animButtons(opts);
  let chosen = null;
  T.push(timed('<p class="wait">Hazır olun.</p>', 1000));
  T.push(timed(`<div class="stage">${SIGN_CV("cvS")}</div>`, 2400, () => playSign($("cvS"), {type: "single", X: e, dur: 2.4})));
  T.push(L({type: BTN, stimulus: '<p class="q">Bu işaret hangi değişikliği anlatıyor?</p>',
    choices: ab.choices, button_html: ab.button_html, button_layout: "flex", on_load: ab.start,
    on_finish: d => { chosen = opts[d.response] ? opts[d.response].key : null; }}));
  T.push(L({type: KB, choices: "NO_KEYS", trial_duration: () => chosen === e ? 2000 : 4000,
    stimulus: () => `<p class="q">Bu işaret hangi değişikliği anlatıyor?</p><div class="jspsych-btn-group-flex">${feedbackButtons(opts, e, chosen)}</div>` +
      (chosen === e ? '<p class="fbk ok">Doğru!</p>' : '<p class="fbk bad">Yanlış.</p>'),
    on_load: () => startFeedbackCanvases(opts)}));
});

/* free production */
BS = "free";
T.push(instr(`<h3>Animasyonları işaretleme</h3>
  <p>Şimdi Tobi’nin iki değişiklik yaptığı animasyonlar göreceksiniz. Her animasyonu, öğrendiğiniz işaretlerle kameraya doğru anlatın. İşaretleri bilen biri, sizin kaydınızı izleyerek bu animasyonu benzer animasyonlar arasından seçebilmeli.</p>
  <p>Animasyonu izledikten sonra “Hazırım” düğmesine tıklayın. Geri sayımdan sonra kayıt başlayacak ve kendiliğinden duracak.</p>`));
{
  const prs = shuffle(TRAINED.concat(UNTRAINED));
  shuffle(["DUR", "SEQ"]).forEach((tm, i) => { const [P, Q] = orient(prs[i]); T.push(...signAnim(anim2(P, Q, tm))); });
}

/* pre-test */
BS = "pretest";
T.push(instr(`<h3>İki işaretli mesajlar</h3>
  <p>Şimdi iki işaretten oluşan mesajlar göreceksiniz. Her mesajdan sonra iki animasyon belirecek. Mesajın hangi animasyonu daha iyi anlattığını seçin.</p>
  <p>Bu mesajları ilk kez göreceksiniz. Emin değilseniz lütfen tahmin edin.</p>`));
{
  const prs = shuffle(TRAINED.concat(UNTRAINED));
  shuffle(["HOLD", "LIN"]).forEach((form, i) => { const [P, Q] = orient(prs[i]); T.push(...chooseTiming(form, P, Q, false)); });
}

/* phase 1: form training */
BS = "training";
T.push(instr(`<h3>Mesajları öğrenme</h3>
  <p>Şimdi iki işaretli mesajların ne anlattığını öğreneceksiniz. Önce her mesajı, anlattığı animasyonla birlikte göreceksiniz. Ardından mesajı kameraya doğru siz de yapacaksınız.</p>
  <p>Sonra her mesajdan sonra iki animasyon arasından seçim yapacaksınız ve cevabınızın doğru olup olmadığını göreceksiniz.</p>`));
{
  const prs = shuffle(TRAINED);
  shuffle(["HOLD", "LIN"]).forEach((form, i) => {
    const [P, Q] = orient(prs[i]), clip = clip2(form, P, Q), evs = anim2(P, Q, meaning(form));
    T.push(L({type: BTN, stimulus: `<div class="pair"><figure>${SIGN_CV("cvS")}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
      choices: ["İleri"], button_html: plainBtn, enable_button_after: 5000,
      on_load: () => { playSign($("cvS"), clip, LOOP); playAnim($("cvA"), evs, LOOP); }}));
    T.push(recScreen("Şimdi mesajı siz yapın.", leftSign(clip), 4500));
  });
  shuffle(["HOLD", "LIN"]).forEach((form, i) => { const [P, Q] = orient(prs[2 + i]); T.push(...chooseTiming(form, P, Q, true)); });
}

/* phase 1: comprehension test (one trained and one untrained pair) */
BS = "comprehension";
T.push(instr(`<h3>Mesajları anlama</h3>
  <p>Bu bölümde de her mesajdan sonra iki animasyon arasından seçim yapacaksınız. Bu kez cevabınızın doğru olup olmadığını görmeyeceksiniz.</p>
  <p>Bazı mesajlar yeni olacak.</p>`));
{
  const forms = shuffle(["HOLD", "LIN"]);
  [rnd(TRAINED), rnd(UNTRAINED)].forEach((pr, i) => { const [P, Q] = orient(pr); T.push(...chooseTiming(forms[i], P, Q, false)); });
}

/* phase 1: production test */
BS = "production";
T.push(instr(`<h3>Animasyonları işaretleme</h3>
  <p>Şimdi yine animasyonları kameraya doğru işaretleyeceksiniz. Animasyonu izledikten sonra “Hazırım” düğmesine tıklayın.</p>`));
{
  const tms = shuffle(["DUR", "SEQ"]);
  [rnd(TRAINED), rnd(UNTRAINED)].forEach((pr, i) => { const [P, Q] = orient(pr); T.push(...signAnim(anim2(P, Q, tms[i]))); });
}

/* break */
BS = "break";
T.push(instr(`<h3>Kısa ara</h3>
  <p>Deneyin ilk kısmı bitti. İsterseniz kısa bir ara verin.</p>
  <p>Ardından eşinizle birlikte bir oyun oynayacaksınız. Hazır olduğunuzda “İleri” düğmesine tıklayın.</p>`));

/* phase 2: communication game, one round in each role */
BS = "game";
T.push(instr(`<h3>Eşinizle oyun</h3>
  <p>Bu oyunda eşinizle sırayla iki rol alacaksınız.</p>
  <p><b>Anlatıcı</b> olduğunuzda bir animasyon göreceksiniz. Bu animasyonu, eşiniz onu seçebilecek şekilde kameraya doğru işaretleyin.</p>
  <p><b>Seçici</b> olduğunuzda eşinizin kaydını izleyeceksiniz. Ardından dört animasyon arasından eşinizin anlattığı animasyonu seçeceksiniz.</p>
  <p>Her turdan sonra ikiniz de doğru animasyonu ve seçilen animasyonu göreceksiniz. Her doğru seçim için takımınız bir puan kazanır.</p>`));
T.push(timed('<p class="wait">Eşiniz bekleniyor…</p>', 2500));
function gameOptions(P, Q, tm, competitor) {
  const opts = [{key: "target", evs: anim2(P, Q, tm)}];
  if (competitor) opts.push({key: "comp", evs: anim2(P, Q, other(tm))});
  const rest = shuffle(TRAINED.concat(UNTRAINED).filter(pr => !(pr.includes(P) && pr.includes(Q))));
  for (let i = 0; opts.length < 4; i++) { const [a, b] = orient(rest[i]); opts.push({key: "d" + i, evs: anim2(a, b, rnd(["DUR", "SEQ"]))}); }
  return shuffle(opts);
}
function gameFeedback(title, opts, chosenKey) {
  let counted = false;
  return L({type: BTN, choices: ["İleri"], button_html: plainBtn,
    stimulus: () => {
      const ok = chosenKey() === "target";
      if (ok && !counted) { SCORE++; counted = true; }
      return `<p class="q">${title}</p><div class="pair"><figure>${ANIM_CV("fbT")}<figcaption>Hedef animasyon</figcaption></figure><figure>${ANIM_CV("fbC")}<figcaption>Seçilen animasyon</figcaption></figure></div>` +
        (ok ? '<p class="fbk ok">Doğru! Bir puan kazandınız.</p>' : '<p class="fbk bad">Yanlış. Bu turda puan yok.</p>') +
        `<p class="score">Toplam puan: ${SCORE}</p>`;
    },
    on_load: () => {
      const t = opts.find(o => o.key === "target"), c = opts.find(o => o.key === chosenKey()) || t;
      playAnim($("fbT"), t.evs, LOOP); playAnim($("fbC"), c.evs, LOOP);
    }});
}
{
  const prs = shuffle(TRAINED.concat(UNTRAINED));
  /* round 1: you are the director (no timing competitor) */
  {
    const [P, Q] = orient(prs[0]), tm = rnd(["DUR", "SEQ"]);
    const opts = gameOptions(P, Q, tm, false);
    T.push(timed('<p class="wait">Tur 1. Siz anlatıcısınız.</p>', 2000));
    T.push(watchAnim("Bu animasyonu eşinize anlatın.", anim2(P, Q, tm)));
    T.push(recScreen("Şimdi animasyonu kameraya doğru işaretleyin.", leftAnim(anim2(P, Q, tm)), 6000));
    T.push(timed('<p class="wait">Eşiniz seçim yapıyor…</p>', 3000));
    T.push(gameFeedback("Eşiniz bir animasyon seçti.", opts, () => "target"));
  }
  /* round 2: you are the matcher (with a timing competitor) */
  {
    const [P, Q] = orient(prs[1]), tm = rnd(["DUR", "SEQ"]);
    const opts = gameOptions(P, Q, tm, true);
    const ab = animButtons(opts);
    let chosen = null;
    T.push(timed('<p class="wait">Tur 2. Siz seçicisiniz.</p>', 2000));
    T.push(timed('<p class="wait">Eşiniz işaret yapıyor…</p>', 3000));
    T.push(timed(`<div class="frame">Eşinizin mesajı</div><div class="stage">${SIGN_CV("cvS")}</div>`, 4200, () => playSign($("cvS"), clip2(formFor(tm), P, Q))));
    T.push(L({type: BTN, stimulus: '<p class="q">Eşiniz hangi animasyonu anlattı?</p>',
      choices: ab.choices, button_html: ab.button_html, button_layout: "flex", on_load: ab.start,
      on_finish: d => { chosen = opts[d.response] ? opts[d.response].key : null; }}));
    T.push(gameFeedback("Seçiminiz", opts, () => chosen));
  }
}

/* debriefing */
BS = "debrief";
T.push(L({type: jsPsychSurveyHtmlForm, button_label: "Gönder",
  html: `<div class="instr form"><h3>Son sorular</h3>
    <p>İki işaretli mesajlarda, hangi mesajı kullanacağınıza ya da hangi animasyonu seçeceğinize nasıl karar verdiniz? <span class="req">*</span></p>
    <textarea name="strategy" rows="3" required></textarea>
    <p>Deney sırasında işaretleri aklınızdan kelimelerle adlandırdınız mı? <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="words" value="evet" required> Evet</label><label><input type="radio" name="words" value="hayir"> Hayır</label></div>
    <p>Evet ise, hangi kelimeleri kullandınız?</p>
    <input type="text" name="words_which">
    <p>Deney sırasında not aldınız mı? <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="notes" value="evet" required> Evet</label><label><input type="radio" name="notes" value="hayir"> Hayır</label></div>
    <p>Türk İşaret Dili’ni (TİD) öğreniyor musunuz ya da biliyor musunuz? <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="tid" value="evet" required> Evet</label><label><input type="radio" name="tid" value="hayir"> Hayır</label></div>
    <p>Evet ise, ne kadar süredir TİD öğreniyorsunuz?</p>
    <input type="text" name="tid_years">
    <p>Evet ise, TİD’deki yeterliliğinizi 1 (çok düşük) ile 7 (çok yüksek) arasında değerlendirin.</p>
    <div class="radios">${[1, 2, 3, 4, 5, 6, 7].map(n => `<label><input type="radio" name="tid_level" value="${n}"> ${n}</label>`).join("")}</div>
    <p><i>İsteğe bağlı:</i> Deneyle ilgili eklemek istediğiniz bir şey var mı?</p>
    <textarea name="comments" rows="2"></textarea></div>`}));

/* end */
BS = "end";
T.push(L({type: KB, choices: "NO_KEYS",
  stimulus: `<div class="instr"><p><b>Katıldığınız için teşekkür ederiz!</b></p><p>Deney burada sona erdi. Öğrendiğiniz işaret dili bu çalışma için oluşturuldu.</p></div>`,
  on_load: () => { if (STREAM) STREAM.getTracks().forEach(t => t.stop()); }}));

jsPsych.run(T);
