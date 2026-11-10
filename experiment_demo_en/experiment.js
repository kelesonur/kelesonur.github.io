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
const TIM = {DUR: {P: 0.5, Q: 1.0}, SEQ: {P: 0.5, Q: 3.3}};

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
    else $("camwrap").innerHTML = '<div class="nocam">The camera could not be opened.</div>';
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
  return L({type: BTN, stimulus: `<div class="instr">${html}</div>`, choices: [btn || "Next"], button_html: plainBtn});
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
      `<p class="cd" id="cd">&nbsp;</p><div><button class="jspsych-btn" id="recStart" disabled>Start recording</button><button class="jspsych-btn" id="recStop" hidden>Stop recording</button></div>`,
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
          cd.innerHTML = '<span class="dot"></span>Recording'; startRecorder(); state = "recording";
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
const leftSign = clip => ({html: SIGN_CV("cvL"), start: () => playSign($("cvL"), clip, LOOP)});
const leftAnim = evs => ({html: ANIM_CV("cvL"), start: () => playAnim($("cvL"), evs, LOOP)});

/* sign an animation to the webcam (free production, production test) */
function signAnim(evs) {
  return [recScreen("Sign this animation to the camera.", leftAnim(evs), 4800)];
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
  return L({type: KB, stimulus: '<p class="wait">Press the space bar when you are ready.</p>', choices: [" "]});
}

/* message, then a choice among animations that play one after the other.
 * On the first view the answer buttons work only after every animation has
 * played once. "Watch again" shows the message and the animations again
 * (maxReplay times). store(key, replays) receives the answer. */
function seqChoice(q, opts, msgTrial, maxReplay, store, big) {
  const k = BS;
  let views = 0, replays = 0;
  const gap = 400, step = ANIM_DUR * 1000 + gap;
  const choose = L({type: BTN, stimulus: `<p class="q">${q}</p>`,
    choices: () => opts.map(o => o.key).concat(["replay"]), button_layout: "flex",
    button_html: (c, i) => c === "replay"
      ? `<div class="replay-row"${replays < maxReplay ? "" : " hidden"}><button class="jspsych-btn">Watch again</button></div>`
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
  const msg = timed(`<div class="stage">${SIGN_CV("cvS")}</div>`, 4200, () => playSign($("cvS"), clip2(form, P, Q)));
  const tl = [readyKey(), seqChoice("Which animation does this message show better?", opts, msg, 1, c => { chosen = c; }, true)];
  if (feedback) tl.push(L({type: KB, choices: "NO_KEYS",
    trial_duration: () => chosen === target ? 2000 : 5000,
    stimulus: () => `<p class="q">Which animation does this message show better?</p><div class="jspsych-btn-group-flex">${feedbackButtons(opts, target, chosen, true)}</div>` +
      (chosen === target ? '<p class="fbk ok">Correct!</p>' : '<p class="fbk bad">Incorrect.</p>'),
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
T.push(instr(`<h3>Welcome to the experiment</h3>
  <p>In this experiment, you will learn a small sign language used in the world of Tobi, a round character. The language has signs for the changes that Tobi makes.</p>
  <p>The experiment has four parts:</p>
  <ol>
    <li>Learning and practicing the signs.</li>
    <li>Signing animations and two-sign messages.</li>
    <li>A communication game with a partner in another room.</li>
    <li>A few short questions.</li>
  </ol>
  <p>In some parts of the experiment, you will make signs to the camera. The experiment takes about 60 minutes, with a short break in the middle.</p>
  <p><b>Please do not take any notes and do not talk to anyone during the experiment.</b> If you have a question, you can ask the experimenter.</p>
  <p>Click “Next” to continue.</p>`));
T.push(L({type: jsPsychSurveyHtmlForm, button_label: "Yes, I consent to participate",
  html: `<div class="instr form consent"><h3>Participant Information and Consent Form</h3>
  <p><b>What is this document for?</b> This document explains what the study is about, what you will be asked to do, your rights, and what will happen to your data. Please read it carefully.</p>
  <p><b>Researchers.</b> This study is carried out by Onur Keleş, a PhD student in the Department of Linguistics at Boğaziçi University, under the supervision of Dr. Kadir Gökgöz.</p>
  <p><b>Purpose of the study.</b> This study looks at how people learn a new language and how they use it to communicate with someone else.</p>
  <p><b>Who can take part?</b> People who are at least 18 years old, are native speakers of Turkish, and have normal or corrected-to-normal vision (with glasses or contact lenses).</p>
  <p><b>What will you be asked to do?</b> On a computer, you will learn a set of signs, make these signs to a camera, and make choices about short animations. Then you will play a communication game with another participant in another room, using the signs. At the end, you will answer a few questions about your language background. The experiment takes about 60 minutes.</p>
  <p><b>Video recordings.</b> In some parts of the experiment, your face, hands and upper body will be recorded by a camera. The recordings will be used to study the signs you make. No audio will be recorded. In the communication game, your partner will see your recordings during the game.</p>
  <p><b>Compensation.</b> Participants who complete the experiment will receive two course credits toward the relevant LING course.</p>
  <p><b>Risks and benefits.</b> There are no known risks in taking part in this study. If you feel tired, you can take a break. Apart from the course credits, there is no direct benefit to you, but you will add to our knowledge of how language is learned.</p>
  <p><b>Confidentiality and use of data.</b> Your data will be processed in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK). A participant number will be used in your data instead of your name. Video recordings and personal information will be stored in encrypted, password-protected locations and will be seen only by the research team. Video recordings will be kept for at most five years after the study ends and will then be deleted. Data with identifying information removed (for example, your answers and codings of the signs) may be used in a thesis, scientific publications and presentations, and may be shared with other researchers on open science platforms (for example, OSF). Your video recordings will not be shared unless you give separate permission below.</p>
  <p><b>Voluntary participation and right to withdraw.</b> Your participation is voluntary. You can stop the experiment at any time, without giving a reason. If you stop, your data will be deleted. If you want your data deleted after the experiment, you can write to us within two weeks of your participation. After that date, your data may not be deletable, because it will have been processed without identifying information.</p>
  <p><b>Contact.</b> For questions: Onur Keleş, <a href="mailto:onur.keles1@bogazici.edu.tr">onur.keles1@bogazici.edu.tr</a>. This study has been submitted for ethics review. Ethics committee and approval number: [to be added].</p>
  <p><b>Consent.</b> Please tick the statements below. Statements marked with <span class="req">*</span> are required.</p>
  <div class="checks">
    <label><input type="checkbox" name="read" required> I have read and understood the information above. <span class="req">*</span></label>
    <label><input type="checkbox" name="eligible" required> I am at least 18 years old and a native speaker of Turkish. <span class="req">*</span></label>
    <label><input type="checkbox" name="video" required> I agree to be video recorded, and to my partner seeing my recordings during the game. <span class="req">*</span></label>
    <label><input type="checkbox" name="voluntary" required> I take part voluntarily, and I know that I can withdraw at any time. <span class="req">*</span></label>
  </div>
  <p>Optional: I allow short clips from my video recordings to be shown in scientific presentations and publications. <span class="req">*</span></p>
  <div class="radios"><label><input type="radio" name="clips" value="yes" required> Yes</label><label><input type="radio" name="clips" value="no"> No</label></div>
  <p>Your answer to this question does not affect your participation.</p>
  </div>`}));

/* camera */
BS = "camera";
T.push(L({type: BTN, stimulus: `<div class="instr"><h3>Camera</h3>
  <p>In some parts of the experiment, you will make signs to the camera. When you are ready, press the space bar or click “Start recording”. Recording starts after a short countdown. When you have finished signing, press the space bar again or click “Stop recording”.</p>
  <p>Click the button below to turn on the camera.</p></div>`,
  choices: ["Turn on camera"], button_html: plainBtn, on_finish: () => { openCam(); }}));
T.push(L({type: BTN, stimulus: `<div class="instr"><p>You should see yourself below.</p>
  <ul>
    <li><b>Position:</b> Your face, hands and arms should be in the picture. When you move your arms out to the sides, your hands should stay in the picture.</li>
    <li><b>Lighting:</b> Your face and hands should be well lit, with no shadows on them.</li>
    <li>Once you have found the right position, do not move your chair closer to or further from the camera.</li>
  </ul></div><div class="pair"><figure>${CAM_BOX}</figure></div>`,
  choices: ["Next"], button_html: plainBtn, on_load: attachCam}));

/* sign learning: every sign, long and short version, then copy */
BS = "learning";
T.push(instr(`<h3>Learning the signs</h3>
  <p>Tobi can make four different changes. Each change has a sign. You will now see each sign together with the change it names. You will see each change in two versions: first a long one, then a short one.</p>
  <p>After you see each sign, you will make the sign yourself to the camera.</p>
  <p><b>Try to learn the signs as well as you can.</b> You will need to recognize them in the rest of the experiment.</p>`));
shuffle(EV).forEach(e => {
  T.push(L({type: BTN,
    stimulus: `<div class="pair"><figure>${SIGN_CV("cvS")}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
    choices: ["Next"], button_html: plainBtn, enable_button_after: 4500,
    on_load: () => {
      const tr = {dom: trSingle(MAP[e], 0.5).concat(trSingle(MAP[e], 2.4).slice(1)), non: []};
      play($("cvS"), (c, w, h, t) => drawSigner(c, w, h, tr, t), 3.9, {loop: true, pause: 0.6});
      play($("cvA"), (c, w, h, t) => drawEvents(c, w, h, [{ev: e, t0: 0.3, dur: 2}, {ev: e, t0: 2.9, dur: 1}], t), 4.1, {loop: true, pause: 0.6});
    }}));
  T.push(recScreen("Now make the sign yourself.", leftSign({type: "single", X: e, dur: 2.0})));
});

/* identification with feedback: one block, each sign once */
T.push(instr(`<h3>Practice</h3>
  <p>You will now see a sign. Then four animations will appear. Click on the animation that shows the change the sign names.</p>
  <p>After each answer, you will see whether your answer was correct.</p>`));
shuffle(EV).forEach(e => {
  const opts = shuffle(EV).map(x => ({key: x, evs: [{ev: x, t0: 0.6, dur: 2}]}));
  const ab = animButtons(opts);
  let chosen = null;
  T.push(readyKey());
  T.push(timed(`<div class="stage">${SIGN_CV("cvS")}</div>`, 2400, () => playSign($("cvS"), {type: "single", X: e, dur: 2.4})));
  T.push(L({type: BTN, stimulus: '<p class="q">Which change does this sign name?</p>',
    choices: ab.choices, button_html: ab.button_html, button_layout: "flex", on_load: ab.start,
    on_finish: d => { chosen = opts[d.response] ? opts[d.response].key : null; }}));
  T.push(L({type: KB, choices: "NO_KEYS", trial_duration: () => chosen === e ? 2000 : 4000,
    stimulus: () => `<p class="q">Which change does this sign name?</p><div class="jspsych-btn-group-flex">${feedbackButtons(opts, e, chosen)}</div>` +
      (chosen === e ? '<p class="fbk ok">Correct!</p>' : '<p class="fbk bad">Incorrect.</p>'),
    on_load: () => startFeedbackCanvases(opts)}));
});

/* free production */
BS = "free";
T.push(instr(`<h3>Signing the animations</h3>
  <p>You will now see animations in which Tobi makes two changes. Describe each animation to the camera with the signs you have learned. Someone who knows the signs should be able to pick out the animation among similar animations by watching your recording.</p>
  <p>After watching the animation, start the recording. When you have finished, stop the recording.</p>`));
{
  const prs = shuffle(TRAINED.concat(UNTRAINED));
  shuffle(["DUR", "SEQ"]).forEach((tm, i) => { const [P, Q] = orient(prs[i]); T.push(...signAnim(anim2(P, Q, tm))); });
}

/* pre-test */
BS = "pretest";
T.push(instr(`<h3>Two-sign messages</h3>
  <p>You will now see messages made of two signs. After each message, two animations will appear. Choose the animation that the message shows better.</p>
  <p>You have not seen these messages before. If you are not sure, please guess.</p>`));
{
  const prs = shuffle(TRAINED.concat(UNTRAINED));
  shuffle(["HOLD", "LIN"]).forEach((form, i) => { const [P, Q] = orient(prs[i]); T.push(...chooseTiming(form, P, Q, false)); });
}

/* phase 1: form training */
BS = "training";
T.push(instr(`<h3>Learning the messages</h3>
  <p>You will now learn what two-sign messages mean. First you will see each message together with the animation it describes. Then you will make the message yourself to the camera.</p>
  <p>After that, you will choose between two animations after each message, and you will see whether your answer was correct.</p>`));
{
  const prs = shuffle(TRAINED);
  shuffle(["HOLD", "LIN"]).forEach((form, i) => {
    const [P, Q] = orient(prs[i]), clip = clip2(form, P, Q), evs = anim2(P, Q, meaning(form));
    T.push(L({type: BTN, stimulus: `<div class="pair"><figure>${SIGN_CV("cvS")}</figure><figure>${ANIM_CV("cvA")}</figure></div>`,
      choices: ["Next"], button_html: plainBtn, enable_button_after: 5000,
      on_load: () => { playSign($("cvS"), clip, LOOP); playAnim($("cvA"), evs, LOOP); }}));
    T.push(recScreen("Now make the message yourself.", leftSign(clip)));
  });
  shuffle(["HOLD", "LIN"]).forEach((form, i) => { const [P, Q] = orient(prs[2 + i]); T.push(...chooseTiming(form, P, Q, true)); });
}

/* phase 1: comprehension test (one trained and one untrained pair) */
BS = "comprehension";
T.push(instr(`<h3>Understanding the messages</h3>
  <p>In this part, you will again choose between two animations after each message. This time, you will not see whether your answer was correct.</p>
  <p>Some messages will be new.</p>`));
{
  const forms = shuffle(["HOLD", "LIN"]);
  [rnd(TRAINED), rnd(UNTRAINED)].forEach((pr, i) => { const [P, Q] = orient(pr); T.push(...chooseTiming(forms[i], P, Q, false)); });
}

/* phase 1: production test */
BS = "production";
T.push(instr(`<h3>Signing the animations</h3>
  <p>You will again sign animations to the camera. After watching the animation, start the recording. When you have finished, stop the recording.</p>`));
{
  const tms = shuffle(["DUR", "SEQ"]);
  [rnd(TRAINED), rnd(UNTRAINED)].forEach((pr, i) => { const [P, Q] = orient(pr); T.push(...signAnim(anim2(P, Q, tms[i]))); });
}

/* break */
BS = "break";
T.push(instr(`<h3>Short break</h3>
  <p>The first part of the experiment is over. Take a short break if you like.</p>
  <p>Next, you will play a game with your partner. When you are ready, click “Next”.</p>`));

/* phase 2: communication game, one round in each role */
BS = "game";
T.push(instr(`<h3>Game with your partner</h3>
  <p>In this game, you and your partner will take turns in two roles.</p>
  <p>When you are the <b>director</b>, you will see an animation. Sign it to the camera so that your partner can pick it out.</p>
  <p>When you are the <b>matcher</b>, you will watch your partner’s recording. Then you will choose the animation your partner described from four animations.</p>
  <p>After each round, you will both see the correct animation and the chosen animation. Your team gets one point for each correct choice.</p>
  <p>Just do your best. We are interested in places where communication breaks down as well as where it succeeds.</p>`));
T.push(timed('<p class="wait">Waiting for your partner…</p>', 2500));
function gameOptions(P, Q, tm, competitor) {
  const opts = [{key: "target", evs: anim2(P, Q, tm)}];
  if (competitor) opts.push({key: "comp", evs: anim2(P, Q, other(tm))});
  const rest = shuffle(TRAINED.concat(UNTRAINED).filter(pr => !(pr.includes(P) && pr.includes(Q))));
  for (let i = 0; opts.length < 4; i++) { const [a, b] = orient(rest[i]); opts.push({key: "d" + i, evs: anim2(a, b, rnd(["DUR", "SEQ"]))}); }
  return shuffle(opts);
}
function gameFeedback(title, opts, chosenKey) {
  let counted = false;
  return L({type: BTN, choices: ["Next"], button_html: plainBtn,
    stimulus: () => {
      const ok = chosenKey() === "target";
      if (ok && !counted) { SCORE++; counted = true; }
      return `<p class="q">${title}</p><div class="pair"><figure>${ANIM_CV("fbT")}<figcaption>Target animation</figcaption></figure><figure>${ANIM_CV("fbC")}<figcaption>Chosen animation</figcaption></figure></div>` +
        (ok ? '<p class="fbk ok">Correct! You get one point.</p>' : '<p class="fbk bad">Incorrect. No point this round.</p>') +
        `<p class="score">Total points: ${SCORE}</p>`;
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
    T.push(timed('<p class="wait">Round 1. You are the director.</p>', 2000));
    T.push(recScreen("Describe this animation to your partner.", leftAnim(anim2(P, Q, tm)), 4800));
    T.push(timed('<p class="wait">Your partner is choosing…</p>', 3000));
    T.push(gameFeedback("Your partner chose an animation.", opts, () => "target"));
  }
  /* round 2: you are the matcher (with a timing competitor) */
  {
    const [P, Q] = orient(prs[1]), tm = rnd(["DUR", "SEQ"]);
    const opts = gameOptions(P, Q, tm, true);
    let chosen = null;
    T.push(timed('<p class="wait">Round 2. You are the matcher.</p>', 2000));
    T.push(timed('<p class="wait">Your partner is signing…</p>', 3000));
    const msg = timed(`<div class="frame">Your partner’s message</div><div class="stage">${SIGN_CV("cvS")}</div>`, 4200, () => playSign($("cvS"), clip2(formFor(tm), P, Q)));
    T.push(seqChoice("Which animation did your partner describe?", opts, msg, Infinity, c => { chosen = c; }));
    T.push(gameFeedback("Your choice", opts, () => chosen));
  }
}

/* debriefing */
BS = "debrief";
T.push(L({type: jsPsychSurveyHtmlForm, button_label: "Submit",
  html: `<div class="instr form"><h3>Final questions</h3>
    <p>For the two-sign messages, how did you decide which message to use or which animation to choose? <span class="req">*</span></p>
    <textarea name="strategy" rows="3" required></textarea>
    <p>Did you name the signs to yourself in words during the experiment? <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="words" value="yes" required> Yes</label><label><input type="radio" name="words" value="no"> No</label></div>
    <p>If yes, which words did you use?</p>
    <input type="text" name="words_which">
    <p>Did you take any notes during the experiment? <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="notes" value="yes" required> Yes</label><label><input type="radio" name="notes" value="no"> No</label></div>
    <p>Are you learning, or do you know, Turkish Sign Language (TİD)? <span class="req">*</span></p>
    <div class="radios"><label><input type="radio" name="tid" value="yes" required> Yes</label><label><input type="radio" name="tid" value="no"> No</label></div>
    <p>If yes, how long have you been learning TİD?</p>
    <input type="text" name="tid_years">
    <p>If yes, rate your proficiency in TİD from 1 (very low) to 7 (very high).</p>
    <div class="radios">${[1, 2, 3, 4, 5, 6, 7].map(n => `<label><input type="radio" name="tid_level" value="${n}"> ${n}</label>`).join("")}</div>
    <p><i>Optional:</i> Is there anything else you would like to tell us about the experiment?</p>
    <textarea name="comments" rows="2"></textarea></div>`}));

/* end */
BS = "end";
T.push(L({type: KB, choices: "NO_KEYS",
  stimulus: `<div class="instr"><p><b>That’s it! Thank you very much for taking part.</b></p><p>The experiment is now over. The sign language you learned was created for this study.</p></div>`,
  on_load: () => { if (STREAM) STREAM.getTracks().forEach(t => t.stop()); }}));

jsPsych.run(T);
