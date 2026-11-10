/* Demo session: learning, communication and simultaneity in a small sign system.
 * Recorded clips (clips/) where available, otherwise the drawn signer (draw.js). Webcam recordings stay in the browser
 * and are not uploaded. */
"use strict";

/* ---------------- basic data ---------------- */
const EV = ["rise", "turn", "swell", "pulse"];
/* the demo uses one fixed mapping between events and handshapes (counterbalanced in the study) */
const DEMO_MAP = {rise: "index", turn: "flat", swell: "fist", pulse: "claw"};
const TRAINED = [["rise", "turn"], ["rise", "swell"], ["turn", "pulse"], ["swell", "pulse"]];
const UNTRAINED = [["rise", "pulse"], ["turn", "swell"]];
const TIM = {DUR: {P: 0.5, Q: 1.0}, SEQ: {P: 0.5, Q: 3.3}};

const params = new URLSearchParams(location.search);
const CONGRUENT = !/^(i|inc|incongruent|uyumsuz)$/i.test(params.get("lang") || "");
const MAP = DEMO_MAP;

const rnd = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const other = tm => tm === "DUR" ? "SEQ" : "DUR";
const orient = pr => pr.includes("rise") ? ["rise", pr.find(e => e !== "rise")] : (Math.random() < 0.5 ? pr.slice() : [pr[1], pr[0]]);
/* the language: which timing each form means */
const meaning = form => (form === "HOLD") === CONGRUENT ? "DUR" : "SEQ";
const formFor = tm => meaning("HOLD") === tm ? "HOLD" : "LIN";

const anim2 = (P, Q, tm) => [{ev: P, t0: TIM[tm].P, dur: 2}, {ev: Q, t0: TIM[tm].Q, dur: 1}];
const clip2 = (form, P, Q) => ({type: form === "HOLD" ? "hold" : "lin", P, Q});

/* ---------------- drawing on the page ---------------- */
/* ---------------- recorded sign videos ----------------
 * Clips recorded so far; any other combination falls back to the drawn signer.
 * Keys use handshapes: single_<hs>, hold_<held>_<other>, lin_<first>_<second>. */
const CLIP_DIR = "../experiment_demo/clips/";
const VIDS = {
  single_index: 3.3, single_flat: 3.33, single_fist: 3.27, single_claw: 3.3,
  hold_index_flat: 7.97, hold_index_fist: 8.0, hold_index_claw: 7.97,
  lin_index_flat: 7.9, lin_index_fist: 7.93, lin_index_claw: 7.97
};
function vidKey(clip) {
  if (!clip) return null;
  const k = clip.type === "single" ? `single_${MAP[clip.X]}` : `${clip.type}_${MAP[clip.P]}_${MAP[clip.Q]}`;
  return k in VIDS ? k : null;
}
const clipMs = clip => { const k = vidKey(clip); return k ? Math.round(VIDS[k] * 1000) : Math.round((clip && clip.dur || SIGN_DUR) * 1000); };

const SIGN_DUR = 4.0, ANIM_DUR = 4.8;
function playSign(el, clip, opt) {
  if (el && el.tagName === "VIDEO") { el.loop = !!(opt && opt.loop); el.currentTime = 0; el.play().catch(() => {}); return; }
  const tr = makeTracks(clip, MAP); play(el, (c, w, h, t) => drawSigner(c, w, h, tr, t), clip.dur || SIGN_DUR, opt);
}
function playAnim(cv, evs, opt) { play(cv, (c, w, h, t) => drawEvents(c, w, h, evs, t), ANIM_DUR, opt); }
const LOOP = {loop: true, pause: 0.8};
const SIGN_CV = (id, clip) => { const k = vidKey(clip); return k ? `<video class="sv" id="${id}" muted playsinline preload="auto"><source src="${CLIP_DIR}${k}.mp4" type="video/mp4"><source src="${CLIP_DIR}${k}.webm" type="video/webm"></video>` : `<canvas class="sg" id="${id}" data-w="320" data-h="320"></canvas>`; };
const ANIM_CV = id => `<canvas class="an" id="${id}" data-w="320" data-h="246"></canvas>`;
const $ = id => document.getElementById(id);

/* ---------------- skipping sections ---------------- */
const SKIP = {};
let CUR = null, BS = null, TIMERS = [], RECORDER = null, SCORE = 0, REC_KEY = null;
const skipBtn = $("skip");
function later(fn, t) { TIMERS.push(setTimeout(fn, t)); }
function cleanup() {
  stopAll(); TIMERS.forEach(clearTimeout); TIMERS = []; stopRecorder();
  if (REC_KEY) { document.removeEventListener("keydown", REC_KEY); REC_KEY = null; }
}
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

/* recording screen: left panel (sign or animation, looping), camera on the right.
 * The participant starts the recording (a short countdown lets the hands come
 * back into view) and stops it, with the buttons or the space bar. */
function recScreen(title, left, enableAfter) {
  return L({
    type: KB, choices: "NO_KEYS",
    stimulus: () => `<div class="frame">${title}</div><div class="pair">${left ? `<figure>${left.html}</figure>` : ""}<figure>${CAM_BOX}</figure></div>` +
      `<p class="cd" id="cd">&nbsp;</p><div><button class="jspsych-btn" id="recStart" disabled>Kaydı başlat</button><button class="jspsych-btn" id="recStop" hidden>Kaydı durdur</button></div>`,
    on_load: () => {
      if (left) left.start();
      attachCam();
      const cd = $("cd"), bStart = $("recStart"), bStop = $("recStop");
      let state = "wait";  /* wait, ready, countdown, recording */
      later(() => { bStart.disabled = false; state = "ready"; }, enableAfter || 0);
      const start = () => {
        if (state !== "ready") return;
        state = "countdown"; bStart.hidden = true;
        [3, 2, 1].forEach((n, i) => later(() => { cd.textContent = n; }, i * 1000));
        later(() => {
          cd.innerHTML = '<span class="dot"></span>Kayıt'; startRecorder(); state = "recording";
          bStop.hidden = false;
        }, 3000);
      };
      const stop = () => {
        if (state !== "recording") return;
        state = "done"; jsPsych.finishTrial({recorded: true});
      };
      /* the space bar starts the recording and then stops it */
      REC_KEY = e => { if (e.code === "Space") { e.preventDefault(); if (state === "ready") start(); else stop(); } };
      document.addEventListener("keydown", REC_KEY);
      bStart.addEventListener("click", start);
      bStop.addEventListener("click", stop);
    }
  });
}
const leftSign = clip => ({html: SIGN_CV("cvL", clip), start: () => playSign($("cvL"), clip, LOOP)});
const leftAnim = evs => ({html: ANIM_CV("cvL"), start: () => playAnim($("cvL"), evs, LOOP)});

/* sign an animation to the webcam (free production, production test) */
function signAnim(evs) {
  return [recScreen("Bu animasyonu kameraya doğru işaretleyin.", leftAnim(evs), 4800)];
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

/* ready screen: the trial starts when the participant presses the space bar */
function readyKey() {
  return L({type: KB, stimulus: '<p class="wait">Hazır olduğunuzda boşluk tuşuna basın.</p>', choices: [" "]});
}

/* message, then a choice among animations that play one after the other.
 * On the first view the answer buttons work only after every animation has
 * played once. "Tekrar izle" shows the message and the animations again
 * (maxReplay times). store(key, replays) receives the answer. */
function seqChoice(q, opts, msgTrial, maxReplay, store, big) {
  const k = BS;
  let views = 0, replays = 0;
  const gap = 400, step = ANIM_DUR * 1000 + gap;
  const choose = L({type: BTN, stimulus: `<p class="q">${q}</p>`,
    choices: () => opts.map(o => o.key).concat(["replay"]), button_layout: "flex",
    button_html: (c, i) => c === "replay"
      ? `<div class="replay-row"${replays < maxReplay ? "" : " hidden"}><button class="jspsych-btn">Tekrar izle</button></div>`
      : `<button class="jspsych-btn anim-btn${big ? " big" : ""}"><canvas data-w="320" data-h="246" data-i="${i}"></canvas></button>`,
    on_load: () => {
      const btns = [...document.querySelectorAll(".anim-btn")], cvs = btns.map(b => b.querySelector("canvas"));
      const all = [...document.querySelectorAll("#jspsych-html-button-response-btngroup button")];
      cvs.forEach(cv => still(cv, (c, w, h) => drawEvents(c, w, h, [], 0)));
      if (views === 0) all.forEach(b => { b.disabled = true; });
      cvs.forEach((cv, i) => later(() => {
        btns.forEach(b => b.classList.remove("playing")); btns[i].classList.add("playing");
        play(cv, (c, w, h, t) => drawEvents(c, w, h, opts[i].evs, t), ANIM_DUR);
      }, i * step));
      later(() => { btns.forEach(b => b.classList.remove("playing")); all.forEach(b => { b.disabled = false; }); }, cvs.length * step);
    },
    on_finish: d => {
      views++;
      const keys = opts.map(o => o.key).concat(["replay"]), c = keys[d.response];
      if (c === "replay") { replays++; d.replay = true; return; }
      d.replay = false; store(c, replays);
    }});
  return {timeline: [msgTrial, choose],
    loop_function: data => { const last = data.values().slice(-1)[0]; return !SKIP[k] && !!(last && last.replay); }};
}

/* two-sign clip, then a DUR and a SEQ animation of the same two events */
function chooseTiming(form, P, Q, feedback) {
  const opts = shuffle(["DUR", "SEQ"]).map(tm => ({key: tm, evs: anim2(P, Q, tm)}));
  const target = meaning(form);
  let chosen = null;
  const clip = clip2(form, P, Q);
  const msg = timed(`<div class="stage">${SIGN_CV("cvS", clip)}</div>`, clipMs(clip) + 200, () => playSign($("cvS"), clip));
  const tl = [readyKey(), seqChoice("Bu mesaj hangi animasyonu daha iyi anlatıyor?", opts, msg, 1, c => { chosen = c; }, true)];
  if (feedback) tl.push(L({type: KB, choices: "NO_KEYS",
    trial_duration: () => chosen === target ? 2000 : 5000,
    stimulus: () => `<p class="q">Bu mesaj hangi animasyonu daha iyi anlatıyor?</p><div class="jspsych-btn-group-flex">${feedbackButtons(opts, target, chosen, true)}</div>` +
      (chosen === target ? '<p class="fbk ok">Doğru!</p>' : '<p class="fbk bad">Yanlış.</p>'),
    /* the correct animation plays once more; the other one stays still */
    on_load: () => opts.forEach((o, i) => { const cv = document.querySelector(`.fbbtn canvas[data-i="${i}"]`);
      if (o.key === target) play(cv, (c, w, h, t) => drawEvents(c, w, h, o.evs, t), ANIM_DUR);
      else still(cv, (c, w, h) => drawEvents(c, w, h, [], 0)); })}));
  return tl;
}

/* ---------------- build the session ---------------- */
const T = [];

/* welcome and consent */
BS = "welcome";
T.push(instr(`<h3>Deneye hoş geldiniz</h3>
  <p>Bu deneyde, Tobi adlı yuvarlak bir karakterin dünyasında kullanılan küçük bir işaret dili öğreneceksiniz. Bu dilde, Tobi’nin yaptığı değişiklikler için işaretler var.</p>
  <p>Deney dört bölümden oluşur:</p>
  <ol>
    <li>İşaretleri öğrenme ve alıştırma.</li>
    <li>Animasyonları işaretleme ve iki işaretli mesajlar.</li>
    <li>Başka bir odadaki eşinizle birlikte bir iletişim oyunu.</li>
    <li>Birkaç kısa soru.</li>
  </ol>
  <p>Deneyin bazı bölümlerinde işaretleri kameraya doğru yapacaksınız. Deney, ortada kısa bir ara ile birlikte yaklaşık 60 dakika sürer.</p>
  <p><b>Lütfen deney boyunca not almayın ve kimseyle konuşmayın.</b> Bir sorunuz olursa deneyi yürüten araştırmacıya sorabilirsiniz.</p>
  <p>Devam etmek için “İleri” düğmesine tıklayın.</p>`));
T.push(L({type: jsPsychSurveyHtmlForm, button_label: "Katılmayı kabul ediyorum",
  html: `<div class="instr form consent"><h3>Katılımcı Bilgilendirme ve Onam Formu</h3>
  <p><b>Bu belge ne işe yarar?</b> Bu belge, araştırmanın ne olduğunu, sizden ne istendiğini, haklarınızı ve verilerinizle ne yapılacağını açıklar. Lütfen dikkatle okuyun.</p>
  <p><b>Araştırmacılar.</b> Bu çalışma, Boğaziçi Üniversitesi Dilbilim Bölümü doktora öğrencisi Onur Keleş tarafından, Dr. Kadir Gökgöz danışmanlığında yürütülmektedir.</p>
  <p><b>Araştırmanın amacı.</b> Bu çalışma, insanların yeni bir dili nasıl öğrendiğini ve bu dili başka biriyle iletişim kurmak için nasıl kullandığını incelemektedir.</p>
  <p><b>Kimler katılabilir?</b> En az 18 yaşında olan, anadili Türkçe olan ve normal ya da düzeltilmiş (gözlük veya lens ile) görmeye sahip kişiler katılabilir.</p>
  <p><b>Sizden ne istenecek?</b> Bilgisayarda bir dizi işaret öğrenecek, bu işaretleri kameraya doğru yapacak ve kısa animasyonlarla ilgili seçimler yapacaksınız. Ardından başka bir odadaki bir katılımcıyla, işaretleri kullanarak bir iletişim oyunu oynayacaksınız. En sonda dil geçmişinizle ilgili birkaç soru yanıtlayacaksınız. Deney yaklaşık 60 dakika sürer.</p>
  <p><b>Video kayıtları.</b> Deneyin bazı bölümlerinde yüzünüz, elleriniz ve üst bedeniniz kameraya kaydedilecektir. Kayıtlar, yaptığınız işaretleri incelemek için kullanılacaktır. Ses kaydı alınmayacaktır. İletişim oyununda, oyundaki eşiniz kayıtlarınızı oyun sırasında görecektir.</p>
  <p><b>Katılım karşılığı.</b> Deneyi tamamlayan katılımcılar, ilgili LING kodlu derste kullanılmak üzere iki ders kredisi alacaktır.</p>
  <p><b>Riskler ve yararlar.</b> Bu çalışmaya katılmanın bilinen bir riski yoktur. Kendinizi yorgun hissederseniz ara verebilirsiniz. Ders kredisi dışında size doğrudan bir yararı yoktur, ancak dilin nasıl öğrenildiğine dair bilgimize katkıda bulunacaksınız.</p>
  <p><b>Verilerin gizliliği ve kullanımı.</b> Verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu’na uygun olarak işlenecektir. Verilerinizde adınız yerine bir katılımcı numarası kullanılacaktır. Video kayıtları ve kişisel bilgileriniz, şifreli ve parola korumalı ortamlarda saklanacak ve yalnızca araştırma ekibi tarafından görülebilecektir. Video kayıtları, çalışma tamamlandıktan sonra en fazla beş yıl saklanacak ve ardından silinecektir. Kimlik bilgileri çıkarılmış veriler (örneğin cevaplarınız ve işaretlerin kodlamaları) tez, bilimsel yayın ve sunumlarda kullanılabilir ve açık bilim platformlarında (örneğin OSF) diğer araştırmacılarla paylaşılabilir. Video kayıtlarınız, aşağıda ayrıca izin vermediğiniz sürece paylaşılmayacaktır.</p>
  <p><b>Gönüllü katılım ve çekilme hakkı.</b> Katılımınız tamamen gönüllüdür. İstediğiniz zaman, herhangi bir neden göstermeden deneyden ayrılabilirsiniz. Deneyden ayrılırsanız verileriniz silinecektir. Deneyden sonra verilerinizin silinmesini isterseniz, katılım tarihinizden sonraki iki hafta içinde bize yazabilirsiniz. Bu tarihten sonra veriler kimlik bilgileri çıkarılarak işlendiği için silinemeyebilir.</p>
  <p><b>İletişim.</b> Sorularınız için: Onur Keleş, <a href="mailto:onur.keles1@bogazici.edu.tr">onur.keles1@bogazici.edu.tr</a>. Bu çalışma etik kurul değerlendirmesine sunulmuştur. Etik kurul adı ve onay numarası: [eklenecek].</p>
  <p><b>Onay.</b> Lütfen aşağıdaki maddeleri işaretleyin. <span class="req">*</span> ile gösterilen maddeler zorunludur.</p>
  <div class="checks">
    <label><input type="checkbox" name="read" required> Yukarıdaki bilgileri okudum ve anladım. <span class="req">*</span></label>
    <label><input type="checkbox" name="eligible" required> En az 18 yaşındayım ve anadilim Türkçe. <span class="req">*</span></label>
    <label><input type="checkbox" name="video" required> Video kaydı alınmasını ve oyundaki eşimin kayıtlarımı oyun sırasında görmesini kabul ediyorum. <span class="req">*</span></label>
    <label><input type="checkbox" name="voluntary" required> Çalışmaya gönüllü olarak katılıyorum ve istediğim zaman ayrılabileceğimi biliyorum. <span class="req">*</span></label>
  </div>
  <p>İsteğe bağlı: Video kayıtlarımdan kısa kesitlerin bilimsel sunum ve yayınlarda gösterilmesine izin veriyorum. <span class="req">*</span></p>
  <div class="radios"><label><input type="radio" name="clips" value="evet" required> Evet</label><label><input type="radio" name="clips" value="hayir"> Hayır</label></div>
  <p>Bu sorudaki cevabınız, deneye katılımınızı etkilemez.</p>
  </div>`}));

/* camera */
BS = "camera";
T.push(L({type: BTN, stimulus: `<div class="instr"><h3>Kamera</h3>
  <p>Deneyin bazı bölümlerinde işaretleri kameraya doğru yapacaksınız. Hazır olduğunuzda boşluk tuşuna basın ya da “Kaydı başlat” düğmesine tıklayın. Kısa bir geri sayımdan sonra kayıt başlar. İşareti bitirdiğinizde yine boşluk tuşuna basın ya da “Kaydı durdur” düğmesine tıklayın.</p>
  <p>Kamerayı açmak için aşağıdaki düğmeye tıklayın.</p></div>`,
  choices: ["Kamerayı aç"], button_html: plainBtn, on_finish: () => { openCam(); }}));
T.push(L({type: BTN, stimulus: `<div class="instr"><p>Kendinizi aşağıda görüyor olmalısınız.</p>
  <ul>
    <li><b>Konum:</b> Yüzünüz, elleriniz ve kollarınız görüntüde olmalı. Kollarınızı yanlara açtığınızda elleriniz görüntüden çıkmamalı.</li>
    <li><b>Işık:</b> Yüzünüz ve elleriniz iyi aydınlanmış olmalı ve üzerlerinde gölge olmamalı.</li>
    <li>Doğru konumu bulduktan sonra sandalyenizi kameraya yaklaştırmayın veya uzaklaştırmayın.</li>
  </ul></div><div class="pair"><figure>${CAM_BOX}</figure></div>`,
  choices: ["İleri"], button_html: plainBtn, on_load: attachCam}));

/* sign learning: every sign, long and short version, then copy */
BS = "learning";
T.push(instr(`<h3>İşaretleri öğrenme</h3>
  <p>Tobi dört farklı değişiklik yapabiliyor. Her değişikliğin bir işareti var. Şimdi her işareti, anlattığı değişiklikle birlikte göreceksiniz. Her değişikliği iki hâliyle göreceksiniz: önce uzun süren hâlini, sonra kısa süren hâlini.</p>
  <p>Her işareti gördükten sonra, işareti kameraya doğru siz de yapacaksınız.</p>
  <p><b>İşaretleri olabildiğince iyi öğrenmeye çalışın.</b> Deneyin geri kalanında bu işaretleri tanımanız gerekecek.</p>`));
shuffle(EV).forEach(e => {
  T.push(L({type: BTN,
    stimulus: `<div class="pair"><figure>${SIGN_CV("cvS", {type: "single", X: e})}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
    choices: ["İleri"], button_html: plainBtn, enable_button_after: 4500,
    on_load: () => {
      if (vidKey({type: "single", X: e})) playSign($("cvS"), {type: "single", X: e}, LOOP);
      else { const tr = {dom: trSingle(MAP[e], 0.5).concat(trSingle(MAP[e], 2.4).slice(1)), non: []};
      play($("cvS"), (c, w, h, t) => drawSigner(c, w, h, tr, t), 3.9, {loop: true, pause: 0.6}); }
      play($("cvA"), (c, w, h, t) => drawEvents(c, w, h, [{ev: e, t0: 0.3, dur: 2}, {ev: e, t0: 2.9, dur: 1}], t), 4.1, {loop: true, pause: 0.6});
    }}));
  T.push(recScreen("Şimdi işareti siz yapın.", leftSign({type: "single", X: e, dur: 2.0})));
});

/* identification with feedback: one block, each sign once */
T.push(instr(`<h3>Alıştırma</h3>
  <p>Şimdi bir işaret göreceksiniz. Ardından dört animasyon belirecek. İşaretin anlattığı değişikliği gösteren animasyona tıklayın.</p>
  <p>Her cevaptan sonra cevabınızın doğru olup olmadığını göreceksiniz.</p>`));
shuffle(EV).forEach(e => {
  const opts = shuffle(EV).map(x => ({key: x, evs: [{ev: x, t0: 0.6, dur: 2}]}));
  const ab = animButtons(opts);
  let chosen = null;
  T.push(readyKey());
  T.push(timed(`<div class="stage">${SIGN_CV("cvS", {type: "single", X: e})}</div>`, Math.max(2400, clipMs({type: "single", X: e})), () => playSign($("cvS"), {type: "single", X: e, dur: 2.4})));
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
  <p>Animasyonu izledikten sonra kaydı başlatın. Bitirdiğinizde kaydı durdurun.</p>`));
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
    T.push(L({type: BTN, stimulus: `<div class="pair"><figure>${SIGN_CV("cvS", clip)}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
      choices: ["İleri"], button_html: plainBtn, enable_button_after: 5000,
      on_load: () => { playSign($("cvS"), clip, LOOP); playAnim($("cvA"), evs, LOOP); }}));
    T.push(recScreen("Şimdi mesajı siz yapın.", leftSign(clip)));
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
  <p>Şimdi yine animasyonları kameraya doğru işaretleyeceksiniz. Animasyonu izledikten sonra kaydı başlatın. Bitirdiğinizde kaydı durdurun.</p>`));
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
  <p>Her turdan sonra ikiniz de doğru animasyonu ve seçilen animasyonu göreceksiniz. Her doğru seçim için takımınız bir puan kazanır.</p>
  <p>Elinizden geleni yapın. İletişimin işe yaradığı durumlar kadar aksadığı durumlar da bizim için ilginçtir.</p>`));
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
    T.push(recScreen("Bu animasyonu eşinize anlatın.", leftAnim(anim2(P, Q, tm)), 4800));
    T.push(timed('<p class="wait">Eşiniz seçim yapıyor…</p>', 3000));
    T.push(gameFeedback("Eşiniz bir animasyon seçti.", opts, () => "target"));
  }
  /* round 2: you are the matcher (with a timing competitor) */
  {
    const [P, Q] = orient(prs[1]), tm = rnd(["DUR", "SEQ"]);
    const opts = gameOptions(P, Q, tm, true);
    let chosen = null;
    T.push(timed('<p class="wait">Tur 2. Siz seçicisiniz.</p>', 2000));
    T.push(timed('<p class="wait">Eşiniz işaret yapıyor…</p>', 3000));
    const msg = timed(`<div class="frame">Eşinizin mesajı</div><div class="stage">${SIGN_CV("cvS", clip2(formFor(tm), P, Q))}</div>`, clipMs(clip2(formFor(tm), P, Q)) + 200, () => playSign($("cvS"), clip2(formFor(tm), P, Q)));
    T.push(seqChoice("Eşiniz hangi animasyonu anlattı?", opts, msg, Infinity, c => { chosen = c; }));
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
