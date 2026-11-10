/* Drawing code for the demo: the schematic signer and Tobi. */
"use strict";
/* ---------------- animation loop manager ---------------- */
let active=[];
function stopAll(){active.forEach(o=>{o.dead=true;cancelAnimationFrame(o.id);});active=[];}
function prep(cv){const dpr=window.devicePixelRatio||1;const w=+cv.dataset.w,h=+cv.dataset.h;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}
function play(cv,draw,dur,opt){
  opt=opt||{};const {ctx,w,h}=prep(cv);const pause=opt.pause==null?0.7:opt.pause;const t0=performance.now();const o={id:0,dead:false};
  function fr(now){if(o.dead)return;let t=(now-t0)/1000;let more=true;
    if(opt.loop){t=t%(dur+pause);if(t>dur)t=dur;}else if(t>=dur){t=dur;more=false;}
    ctx.clearRect(0,0,w,h);draw(ctx,w,h,t);if(more)o.id=requestAnimationFrame(fr);}
  o.id=requestAnimationFrame(fr);active.push(o);
}
function still(cv,draw){const {ctx,w,h}=prep(cv);ctx.clearRect(0,0,w,h);draw(ctx,w,h,0);}

/* ---------------- events (the disk): plain grey disk, dark outline, white ground ---------------- */
const ease=u=>0.5-0.5*Math.cos(Math.PI*u);
function drawEvents(ctx,w,h,evs,t){
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);
  const s=Math.min(w/260,h/200);const cx=w/2,cy=h*0.64;const r=29*s;
  let dy=0,rot=0,sc=1,glow=0;
  for(const e of evs){const u=(t-e.t0)/e.dur;if(u<=0||u>=1)continue;
    /* each change ramps in over 0.3 s, stays fully on, and ramps out over 0.3 s */
    const r=Math.min(0.5,0.3/e.dur);const env=u<r?ease(u/r):u>1-r?ease((1-u)/r):1;
    if(e.ev==="rise")dy=-60*s*env;
    if(e.ev==="turn")rot=2*Math.PI*ease(u);
    if(e.ev==="swell")sc=1+0.55*env;
    if(e.ev==="pulse")glow=env;}
  /* home position: thin dashed ring */
  ctx.setLineDash([4*s,4*s]);ctx.strokeStyle="#bbbbbb";ctx.lineWidth=1.2*s;
  ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
  const x=cx,y=cy+dy,R=r*sc;
  /* pulse: yellow rays, and the disk turns from grey to yellow */
  if(glow>0.02){ctx.strokeStyle="#e0a000";ctx.globalAlpha=glow;ctx.lineWidth=3*s;ctx.lineCap="round";
    for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*(R+6*s),y+Math.sin(a)*(R+6*s));ctx.lineTo(x+Math.cos(a)*(R+15*s),y+Math.sin(a)*(R+15*s));ctx.stroke();}
    ctx.globalAlpha=1;}
  const mix=(a,b)=>Math.round(a+(b-a)*glow);
  ctx.fillStyle=`rgb(${mix(200,255)},${mix(200,214)},${mix(200,64)})`;ctx.strokeStyle="#222222";ctx.lineWidth=1.8*s;
  ctx.beginPath();ctx.arc(x,y,R,0,2*Math.PI);ctx.fill();ctx.stroke();
  /* face: two fixed dot eyes; they only move with the disk (turn rotates them), never change */
  ctx.fillStyle="#222222";
  for(const ex of [-0.34,0.34]){const px=ex*R,py=-0.2*R;
    const qx=x+px*Math.cos(rot)-py*Math.sin(rot),qy=y+px*Math.sin(rot)+py*Math.cos(rot);
    ctx.beginPath();ctx.arc(qx,qy,0.12*R,0,2*Math.PI);ctx.fill();}
  /* mouth: a short straight line that never changes */
  {const m=[[-0.24*R,0.3*R],[0.24*R,0.3*R]].map(([px,py])=>[x+px*Math.cos(rot)-py*Math.sin(rot),y+px*Math.sin(rot)+py*Math.cos(rot)]);
   ctx.strokeStyle="#222222";ctx.lineWidth=2.2*s;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(m[0][0],m[0][1]);ctx.lineTo(m[1][0],m[1][1]);ctx.stroke();}
}
function animOf(evs,dur){return (cv)=>play(cv,(c,w,h,t)=>drawEvents(c,w,h,evs,t),dur||4.8);}

/* signer_v3.js : schematic signer renderer (canvas 2D) for the ASLLP mock.
 * Drop-in replacement for signer_v2.js (same functions, signatures and keyframe semantics).
 *
 *   tracks = {dom:[{t,pos,shape}], non:[...]}, pos in "rest" | "neutral" | "out",
 *   shape in "fist" | "flat" | "index" | "spread" (null/absent at rest).
 *   drawSigner(ctx, w, h, tracks, t [, opts]) draws one frame and returns the
 *   joints {dom:{S,E,W}, non:{S,E,W}} in signer units, for testing.
 *   opts (optional): {bg: CSS colour (default: light grey) or null for transparent,
 *                     colors: {...overrides}}
 *
 * Look: a medium shot like a sign language stimulus video. Head to just below
 * the waist on a light plain background, plain dark long-sleeved top, flat
 * fills, thin dark outlines, five colours. The face is fixed (no nonmanuals).
 *
 * Geometry is in a 280 x 280 "signer unit" box, scaled and centred in the canvas.
 *
 * Arm model (as in v2): each position is a full arm pose, a wrist point W and
 * an elbow hint E. Both are interpolated with the same easing, and ik() fixes
 * the upper arm to a constant length L1 by moving the elbow along the
 * shoulder-elbow ray. The forearm is free to shorten (foreshortening). In the
 * signing poses the elbow is below and lateral to the wrist, and on every path
 * the wrist stays medial to the elbow, so the arm never folds and the elbow
 * cannot flip.
 *
 * The signer faces the viewer and is right-handed: "dom" (right hand) is on
 * the viewer's LEFT, "non" on the viewer's RIGHT. When signing, palms face the
 * viewer and each thumb points toward the body midline. At rest the hands lie
 * relaxed in front of the waist.
 *
 * Only function declarations are global; all constants live in signerConfig().
 */

function signerConfig() {
  if (signerConfig._c) return signerConfig._c;
  const L = { // dom side (viewer's left). The non side is mirrored about x = 140.
    shoulder: [84, 134],
    pos: {
      rest:    {W: [102, 243], E: [74, 218]},
      neutral: {W: [120, 195], E: [54, 220]},
      out:     {W: [60, 190], E: [20, 206]}
    }
  };
  const m = p => [280 - p[0], p[1]];
  const side = s => {
    if (s === "dom") return L;
    const pos = {};
    for (const k in L.pos) pos[k] = {W: m(L.pos[k].W), E: m(L.pos[k].E)};
    // the non-dominant hand rests a little higher, under the dominant one
    if (s === "non") pos.rest = {W: [178, 233], E: [206, 212]};
    return {shoulder: m(L.shoulder), pos};
  };
  signerConfig._c = {
    dom: side("dom"), non: side("non"),
    L1: 88,                          // upper arm length (constant)
    rS: 16, rE: 11.5, rW: 8.5,       // sleeve radius at shoulder, elbow, wrist
    handScale: 1,
    restAng: 1.8,                    // hand rotation at rest (0 = fingers up)
    lw: 1.4,                         // outline width (signer units)
    raise: {rest: 0, neutral: 1, out: 1},
    colors: {                        // five colours in total
      bg: "#eef0f2",                 // light plain background
      line: "#1f242b",               // outlines, eyes, mouth
      skin: "#e7c4a6",
      top: "#2f3b4e",                // plain dark long-sleeved top
      hair: "#3d342f"
    }
  };
  return signerConfig._c;
}

/* Hand state at time t: wrist W, elbow hint E, handshape, raise (0 rest .. 1 signing).
 * The shape switches exactly once per keyframe segment, at its midpoint, so it
 * cannot flicker. */
function handAt(track, t, side) {
  const C = signerConfig(), P = C[side || "dom"].pos;
  const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)));
  if (!track || !track.length) return {W: P.rest.W.slice(), E: P.rest.E.slice(), shape: null, raise: 0, a: null, b: null, u: 0};
  let a = track[0], b = track[track.length - 1];
  if (t <= a.t) b = a;
  else if (t >= b.t) a = b;
  else for (let i = 0; i < track.length - 1; i++) {
    if (t >= track[i].t && t <= track[i + 1].t) { a = track[i]; b = track[i + 1]; break; }
  }
  const u = a === b ? 0 : ease((t - a.t) / (b.t - a.t));
  const A = P[a.pos] || P.rest, B = P[b.pos] || P.rest;
  const lerp = (p, q) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
  const ra = C.raise[a.pos] || 0, rb = C.raise[b.pos] || 0;
  const sa = a.pos === "rest" ? null : (a.shape || null);
  const sb = b.pos === "rest" ? null : (b.shape || null);
  return {W: lerp(A.W, B.W), E: lerp(A.E, B.E), shape: u < 0.5 ? sa : sb,
    raise: ra + (rb - ra) * u, a, b, u};
}

/* Elbow solver. S shoulder, W wrist, Eh elbow hint from the interpolated pose.
 * Returns {E, W} with |E - S| = L1 exactly. Continuous in Eh: no flips or jumps. */
function ik(S, W, Eh, L1) {
  L1 = L1 || signerConfig().L1;
  let dx = Eh[0] - S[0], dy = Eh[1] - S[1];
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) { dx = 0; dy = 1; } else { dx /= d; dy /= d; }
  return {E: [S[0] + dx * L1, S[1] + dy * L1], W: [W[0], W[1]]};
}

/* Path helpers (internal, kept as properties so only function names are global). */
function _sgShapes() {
  if (_sgShapes._s) return _sgShapes._s;
  const circle = (P, r) => { const p = new Path2D(); p.arc(P[0], P[1], r, 0, 2 * Math.PI); return p; };
  // tapered capsule: convex hull of circle (P, r1) and circle (Q, r2)
  const capsule = (P, r1, Q, r2) => {
    const dx = Q[0] - P[0], dy = Q[1] - P[1], d = Math.hypot(dx, dy);
    const p = new Path2D();
    if (d <= Math.abs(r1 - r2) + 1e-6) { const big = r1 >= r2 ? [P, r1] : [Q, r2]; p.arc(big[0][0], big[0][1], big[1], 0, 2 * Math.PI); return p; }
    const th = Math.atan2(dy, dx), ph = Math.acos((r1 - r2) / d);
    p.arc(P[0], P[1], r1, th + ph, th - ph + 2 * Math.PI);
    p.arc(Q[0], Q[1], r2, th - ph, th + ph);
    p.closePath();
    return p;
  };
  const rrect = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  // finger as a capsule from its base (bx,by), angle a (0 = up, + toward the thumb)
  const finger = (bx, by, a, len, wd) => {
    const r = wd / 2, s = Math.sin(a), c = Math.cos(a);
    return capsule([bx, by], r, [bx + s * (len - r), by - c * (len - r)], r);
  };
  // silhouette: outline drawn only around the union of the parts
  const union = (ctx, parts, fill, line, lw) => {
    ctx.strokeStyle = line; ctx.lineWidth = 2 * lw;
    for (const p of parts) ctx.stroke(p);
    ctx.fillStyle = fill;
    for (const p of parts) ctx.fill(p);
  };
  const solid = (ctx, p, fill, line, lw) => {
    ctx.fillStyle = fill; ctx.fill(p); ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.stroke(p);
  };
  _sgShapes._s = {circle, capsule, rrect, finger, union, solid};
  return _sgShapes._s;
}

/* Draw one hand. (x,y) = wrist, ang = rotation (0 = fingers up), mirror = true
 * for the left (non-dominant) hand, k = scale. Palm faces the viewer; for the
 * right hand the thumb is on +x (toward the signer's midline). Hand units are
 * signer units at k = 1: palm 30 wide, middle fingertip about 68 from the wrist. */
function drawHand(ctx, x, y, shape, mirror, k, ang, colors) {
  const C = Object.assign({}, signerConfig().colors, colors || {});
  const G = _sgShapes();
  k = k || 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((mirror ? -1 : 1) * (ang || 0));
  ctx.scale(mirror ? -k : k, k);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  const lw = 1.2 / k;
  const xs = [-10.95, -3.65, 3.65, 10.95];       // pinky, ring, middle, index
  const len = [21, 27, 30, 27];
  const FW = 7.3, BY = -38;                       // finger width, finger base line
  const wrist = G.rrect(-9.5, -16, 19, 18, 6);
  const palm = G.rrect(-15, -43, 30, 35, [8, 8, 10, 10]);
  const line = (pts) => {
    ctx.strokeStyle = C.line; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.lineTo(pts[2], pts[3]); ctx.stroke();
  };
  // curled finger seen from the palm side: the folded finger as a short rounded block
  const curled = i => G.rrect(xs[i] - FW / 2, -51, FW, 19, [3.65, 3.65, 3, 3]);
  const thumbAcross = (tipX) => G.capsule([16.5, -21], 5.2, [tipX, -26.5], 4.3);

  if (!shape) {
    // relaxed hand at rest, seen from the back: fingers together, thumb on the upper edge
    const L2 = len.map(v => v * 0.9);
    const parts = [wrist, palm].concat(xs.map((bx, i) => G.finger(bx, BY, 0, L2[i], FW)));
    parts.push(G.capsule([-13.5, -12], 4.6, [-17, -36], 3.9));
    G.union(ctx, parts, C.skin, C.line, lw);
    line([-7.3, BY - L2[0] + 4, -7.3, -42]);
    line([0, BY - L2[1] + 4, 0, -42]);
    line([7.3, BY - L2[3] + 4, 7.3, -42]);
    line([-13.2, -36, -13.4, -22]);
  } else if (shape === "flat") {
    // fingers together, thumb alongside the index
    const parts = [wrist, palm].concat(xs.map((bx, i) => G.finger(bx, BY, 0, len[i], FW)));
    parts.push(G.capsule([14, -12], 4.8, [18.6, -41], 4.0));
    G.union(ctx, parts, C.skin, C.line, lw);
    line([-7.3, BY - len[0] + 4, -7.3, -43]);
    line([0, BY - len[1] + 4, 0, -43]);
    line([7.3, BY - len[3] + 4, 7.3, -43]);
    line([14.6, -41, 14.4, -22]);
  } else if (shape === "spread") {
    const ang5 = [-0.42, -0.14, 0.12, 0.38];
    const parts = [wrist, palm].concat(xs.map((bx, i) => G.finger(bx * 0.9, BY, ang5[i], len[i], FW)));
    parts.push(G.finger(11.5, -15, 1.0, 26, 9));
    G.union(ctx, parts, C.skin, C.line, lw);
  } else if (shape === "claw") {
    // spread fingers bent at the middle joints: shorter fingers with a fold line
    const ang5 = [-0.4, -0.13, 0.12, 0.36];
    const parts = [wrist, palm].concat(xs.map((bx, i) => G.finger(bx * 0.9, BY, ang5[i], len[i] * 0.62, FW + 0.6)));
    parts.push(G.finger(11.5, -15, 1.0, 22, 9));
    G.union(ctx, parts, C.skin, C.line, lw);
    xs.forEach((bx, i) => {
      const L1 = len[i] * 0.34, a = ang5[i], cx = bx * 0.9 + Math.sin(a) * L1, cy = BY - Math.cos(a) * L1;
      line([cx - 3, cy + 0.5, cx + 3, cy - 0.5]);
    });
  } else if (shape === "index") {
    G.union(ctx, [wrist, palm, G.finger(xs[3], BY, 0, len[3] + 1, FW)], C.skin, C.line, lw);
    [0, 1, 2].forEach(i => G.solid(ctx, curled(i), C.skin, C.line, lw));
    G.solid(ctx, thumbAcross(-3), C.skin, C.line, lw);
  } else { // fist
    G.union(ctx, [wrist, palm], C.skin, C.line, lw);
    [0, 1, 2, 3].forEach(i => G.solid(ctx, curled(i), C.skin, C.line, lw));
    G.solid(ctx, thumbAcross(-6), C.skin, C.line, lw);
  }
  ctx.restore();
}

/* One frame of the signer. */
function drawSigner(ctx, w, h, tracks, t, opts) {
  const C = signerConfig(), G = _sgShapes();
  opts = opts || {};
  const col = Object.assign({}, C.colors, opts.colors || {});
  const k = Math.min(w, h) / 280;
  const lw = C.lw;
  ctx.save();
  const bg = opts.bg === undefined ? col.bg : opts.bg;
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  ctx.translate((w - 280 * k) / 2, (h - 280 * k) / 2);
  ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, 280, 280); ctx.clip();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  const solid = (p, fill, wd) => G.solid(ctx, p, fill, col.line, wd || lw);

  // neck
  solid(G.rrect(125.5, 74, 29, 52, 4), col.skin);

  // torso: shoulders 2.4 head widths wide, narrowing slightly to the waist
  {
    const p = new Path2D();
    p.moveTo(125, 111);
    p.bezierCurveTo(112, 114, 98, 115, 84, 118);
    p.bezierCurveTo(72, 121, 67, 133, 68, 150);
    p.bezierCurveTo(70, 162, 80, 170, 84, 178);
    p.bezierCurveTo(88, 200, 93, 222, 94, 240);
    p.lineTo(92, 290); p.lineTo(188, 290); p.lineTo(186, 240);
    p.bezierCurveTo(187, 222, 192, 200, 196, 178);
    p.bezierCurveTo(200, 170, 210, 162, 212, 150);
    p.bezierCurveTo(213, 133, 208, 121, 196, 118);
    p.bezierCurveTo(182, 115, 168, 114, 155, 111);
    p.quadraticCurveTo(140, 133, 125, 111);
    p.closePath();
    solid(p, col.top);
    // crew-neck band
    ctx.strokeStyle = col.line; ctx.lineWidth = lw * 0.8;
    ctx.beginPath(); ctx.moveTo(122, 113); ctx.quadraticCurveTo(140, 138, 158, 113); ctx.stroke();
  }

  // head: ears, face shape, short hair, fixed neutral face
  solid(G.rrect(105, 44, 11, 22, 5.5), col.skin);
  solid(G.rrect(164, 44, 11, 22, 5.5), col.skin);
  {
    const p = new Path2D();
    p.moveTo(111, 52);
    p.ellipse(140, 52, 29, 38, 0, Math.PI, 2 * Math.PI);
    p.bezierCurveTo(169, 75, 157, 90, 140, 90);
    p.bezierCurveTo(123, 90, 111, 75, 111, 52);
    p.closePath();
    solid(p, col.skin);
    const hp = new Path2D();
    hp.moveTo(111.2, 50);
    hp.bezierCurveTo(107, 30, 118, 10.5, 140, 10.5);
    hp.bezierCurveTo(162, 10.5, 173, 30, 168.8, 50);
    hp.bezierCurveTo(167.5, 38, 160, 29, 140, 29);
    hp.bezierCurveTo(120, 29, 112.5, 38, 111.2, 50);
    hp.closePath();
    solid(hp, col.hair);
    ctx.fillStyle = col.line;
    for (const ex of [128, 152]) { ctx.beginPath(); ctx.ellipse(ex, 55, 2.4, 2.9, 0, 0, 2 * Math.PI); ctx.fill(); }
    ctx.strokeStyle = col.line; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(134, 75); ctx.lineTo(146, 75); ctx.stroke();
  }

  const joints = {};
  for (const side of ["non", "dom"]) {
    const Gs = C[side];
    const st = handAt(tracks && tracks[side], t, side);
    const sol = ik(Gs.shoulder, st.W, st.E);
    const S = Gs.shoulder, E = sol.E, W = sol.W;
    joints[side] = {S: [S[0], S[1]], E: [E[0], E[1]], W: [W[0], W[1]]};

    // sleeve: one smooth tapered shape, shoulder -> elbow -> wrist cuff
    const fore = G.capsule(E, C.rE, W, C.rW);
    G.union(ctx, [G.circle(S, C.rS), G.capsule(S, C.rS, E, C.rE), G.circle(E, C.rE), fore],
      col.top, col.line, lw / 2 + 0.2);

    // hand orientation: relaxed in front of the waist at rest (restAng),
    // upright when signing (0); rotation leads the raise.
    const r = st.raise;
    const ang = C.restAng * (1 - r) * (1 - r);
    drawHand(ctx, W[0], W[1], st.shape, side === "non", C.handScale, ang, col);

    // cuff: redraw the end of the sleeve over the wrist, so the hand comes out of the sleeve
    ctx.save();
    const cl = new Path2D(); cl.arc(W[0], W[1], C.rW + 5, 0, 2 * Math.PI); ctx.clip(cl);
    G.union(ctx, [fore], col.top, col.line, lw / 2 + 0.2);
    ctx.restore();
  }
  ctx.restore();
  return joints;
}

/* Track helpers */
function trSingle(shape, s) {
  s = s == null ? 0.5 : s;
  return [{t: 0, pos: "rest"}, {t: s - 0.25, pos: "rest"},
    {t: s, pos: "neutral", shape}, {t: s + 0.45, pos: "out", shape},
    {t: s + 0.9, pos: "neutral", shape}, {t: s + 1.15, pos: "rest"}];
}

/* clip = {type:"hold"|"lin"|"single", P, Q, X, hand, s}; MAP maps event -> handshape.
 * Without MAP (or for an unmapped key) the value is used as the handshape itself. */
function makeTracks(clip, MAP) {
  const sh = e => (MAP && MAP[e] != null) ? MAP[e] : e;
  if (clip.type === "hold") {
    const P = sh(clip.P), Q = sh(clip.Q);
    return {
      non: [{t: 0, pos: "rest"}, {t: 0.25, pos: "rest"}, {t: 0.5, pos: "neutral", shape: P},
        {t: 0.95, pos: "out", shape: P}, {t: 3.0, pos: "out", shape: P},
        {t: 3.45, pos: "neutral", shape: P}, {t: 3.7, pos: "rest"}],
      dom: [{t: 0, pos: "rest"}, {t: 1.85, pos: "rest"}, {t: 2.1, pos: "neutral", shape: Q},
        {t: 2.55, pos: "out", shape: Q}, {t: 3.0, pos: "neutral", shape: Q}, {t: 3.25, pos: "rest"}]
    };
  }
  if (clip.type === "lin") {
    const P = sh(clip.P), Q = sh(clip.Q);
    return {
      non: [],
      dom: [{t: 0, pos: "rest"}, {t: 0.25, pos: "rest"}, {t: 0.5, pos: "neutral", shape: P},
        {t: 0.95, pos: "out", shape: P}, {t: 1.4, pos: "neutral", shape: P},
        {t: 1.74, pos: "neutral", shape: P}, {t: 1.76, pos: "neutral", shape: Q},
        {t: 2.1, pos: "neutral", shape: Q}, {t: 2.55, pos: "out", shape: Q},
        {t: 3.0, pos: "neutral", shape: Q}, {t: 3.4, pos: "rest"}]
    };
  }
  const tr = trSingle(sh(clip.X), clip.s == null ? 0.5 : clip.s);
  return (clip.hand || "dom") === "dom" ? {dom: tr, non: []} : {non: tr, dom: []};
}
