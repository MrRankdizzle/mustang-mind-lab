/* split-brain: Gazzaniga split-brain experiment. Flash a word to the left or right visual field, watch the signal
   cross to the opposite hemisphere, get blocked (or not) at the corpus callosum, and see what the patient says and does. */
(function () {
'use strict';
const OBJS = ['KEY', 'CUP', 'BALL', 'SPOON'];
ML.w2.css('split-brain-css', `
.spb svg { width: 100%; height: auto; display: block; max-width: 520px; margin: 0 auto; }
.spb-head { fill: var(--surface-2); stroke: var(--muted); stroke-width: 2; }
.spb-ear { fill: var(--surface-2); stroke: var(--muted); stroke-width: 2; }
.spb-eye { fill: #fff; stroke: var(--ink); stroke-width: 1.6; }
.spb-pupil { fill: #12233B; }
.spb-hemi { stroke: var(--bk-out); stroke-width: 1.6; transition: filter .3s; }
.spb-hemi.glow { filter: drop-shadow(0 0 10px rgba(255,209,102,.95)) brightness(1.08); }
.spb-cc { fill: var(--bk-cc); stroke: var(--bk-out); stroke-width: 1.4; }
.spb-cut { stroke: var(--bad); stroke-width: 3; fill: none; stroke-linecap: round; }
.spb-ray { fill: none; stroke-width: 2; stroke-linecap: round; opacity: .22; transition: opacity .3s; }
.spb-ray.L { stroke: var(--spark); } .spb-ray.R { stroke: var(--carolina); }
.spb-ray.on { opacity: .95; stroke-width: 3; }
.spb-motor { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 3 4; opacity: .55; }
.spb-motor.on { stroke: var(--good); opacity: 1; stroke-width: 2.4; }
.spb-pulse { fill: #FFD166; stroke: #8a5a00; stroke-width: 1; }
.spb-t { fill: var(--ink); font: 700 17px var(--f-body); pointer-events: none; }
.spb-s { fill: var(--muted); font: 700 15px var(--f-body); pointer-events: none; }
.spb-sm { fill: var(--muted); font: 700 13px var(--f-mono); letter-spacing: .06em; pointer-events: none; }
.spb-lang { fill: var(--surface); stroke: var(--bk-out); stroke-width: 1.2; }
.spb-lang.glow { fill: #FFD166; }
.spb-bub rect { fill: var(--surface); stroke: var(--ink); stroke-width: 1.6; }
.spb-bub path { fill: var(--surface); stroke: var(--ink); stroke-width: 1.6; }
.spb-bub text { fill: var(--ink); font: 700 16px var(--f-body); }
.spb-tray { fill: var(--surface-2); stroke: var(--line); stroke-width: 2; stroke-dasharray: 6 4; }
.spb-obj { fill: var(--surface); stroke: var(--ink); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.spb-objring { fill: none; stroke: var(--good); stroke-width: 3; opacity: 0; }
.spb-objring.on { opacity: 1; }
.spb-hand { fill: #F2C7A5; stroke: #8a5a3c; stroke-width: 1.6; }
.spb-x { stroke: var(--bad); stroke-width: 4; stroke-linecap: round; opacity: 0; }
.spb-x.on { opacity: 1; }
.spb-steps { margin: 0; padding-left: 22px; display: grid; gap: 4px; }
.spb-steps li { animation: spbIn .35s ease both; }
@keyframes spbIn { from { opacity: 0; transform: translateY(4px); } }
.reduce-motion .spb-steps li { animation: none; }
.spb-say { font-weight: 700; }
.spb details { border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; background: var(--surface-2); }
.spb summary { cursor: pointer; font-weight: 700; color: var(--carolina); }
.spb details p { margin: 8px 0 0; font-size: 15px; }
.spb-fl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.spb-fl .btn { width: 100%; }
`);

ML.registerWidget('split-brain', {
  title: 'Split-brain experiment', tag: 'Simulation',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    let word = 'KEY', cut = true, running = false;
    const root = h('div', { class: 'w2 spb bk' });
    const inst = h('p', { class: 'w2-inst' }, 'The patient stares at the center dot. Pick a word, then flash it to one side and watch what happens.');
    const wordSeg = W2.seg(OBJS.map(o => [o, o]), word, v => { word = v; resetScene(); }, 'Word to flash');
    const ccSeg = W2.seg([['cut', 'Split brain (cut)'], ['intact', 'Intact corpus callosum']], 'cut', v => { cut = v === 'cut'; resetScene(); drawCC(); }, 'Corpus callosum');
    const bL = h('button', { type: 'button', class: 'btn btn-spark', 'aria-label': 'Flash the word in the left visual field' }, '◀ Flash LEFT');
    const bR = h('button', { type: 'button', class: 'btn btn-primary', 'aria-label': 'Flash the word in the right visual field' }, 'Flash RIGHT ▶');
    bL.addEventListener('click', () => run('L')); bR.addEventListener('click', () => run('R'));
    const svg = S('svg', { viewBox: '-20 0 440 476', role: 'img', 'aria-label': 'Split-brain setup: a screen, the patient’s eyes, both brain hemispheres, and hidden objects under a table' });
    const panel = h('div', { class: 'w2-panel', 'aria-live': 'polite' });
    const why = h('details', null, h('summary', null, 'Why would a surgeon cut the corpus callosum?'),
      h('p', null, 'To treat severe epilepsy. Seizures can spread from one hemisphere to the other across the corpus callosum. Cutting it keeps a seizure on one side.'),
      h('p', null, 'In daily life, split-brain patients seem normal because their eyes move and both hemispheres see almost everything. The differences only show up in lab tests like this one, where a word flashes too fast for the eyes to move.'),
      h('p', null, 'Contralateral rule: each hemisphere gets the OPPOSITE visual field and controls the OPPOSITE hand. Language (speech) is usually in the LEFT hemisphere. And no, people are not “left-brained” or “right-brained”: in a healthy brain both sides work together.'));
    root.append(inst, h('div', { class: 'w2-row' }, h('span', { class: 'w2-tag' }, 'Word'), wordSeg), ccSeg, svg, h('div', { class: 'spb-fl' }, bL, bR), panel, why);
    el.append(root);

    /* ---------- scene ---------- */
    // screen
    S('rect', { x: 20, y: 6, width: 360, height: 82, rx: 10, style: 'fill:#0B1222;stroke:#24325A;stroke-width:3' }, svg);
    S('line', { x1: 200, y1: 12, x2: 200, y2: 82, style: 'stroke:#24325A;stroke-width:2;stroke-dasharray:4 4' }, svg);
    S('circle', { cx: 200, cy: 47, r: 4.5, style: 'fill:#FF6B81' }, svg);
    const fL = S('text', { x: 30, y: 24, style: 'fill:#8EA0C4;font:700 14px var(--f-mono);letter-spacing:.04em' }, svg); fL.textContent = 'LEFT FIELD';
    const fR = S('text', { x: 370, y: 24, 'text-anchor': 'end', style: 'fill:#8EA0C4;font:700 14px var(--f-mono);letter-spacing:.04em' }, svg); fR.textContent = 'RIGHT FIELD';
    const flash = S('text', { x: 110, y: 58, 'text-anchor': 'middle', style: 'fill:#fff;font:400 26px var(--f-display);opacity:0' }, svg);
    // rays + optic paths
    const P = {
      Lle: [[110, 50], [170, 148]], Lre: [[110, 50], [228, 148]], Rle: [[290, 50], [172, 148]], Rre: [[290, 50], [230, 148]],
      leR: [[170, 152], [200, 194], [232, 238], [242, 318]], reR: [[230, 152], [246, 204], [252, 318]],
      leL: [[170, 152], [154, 204], [148, 318]], reL: [[230, 152], [200, 194], [168, 238], [158, 318]],
      RtoCC: [[246, 318], [232, 290], [214, 268]], CCtoL: [[214, 268], [186, 268], [158, 246], [142, 214]],
      LtoLang: [[154, 318], [148, 270], [142, 214]],
      LtoMouth: [[142, 214], [168, 160], [190, 132]]
    };
    const rays = {};
    const head = S('g', null, svg);
    S('ellipse', { cx: 92, cy: 236, rx: 12, ry: 24, class: 'spb-ear' }, head);
    S('ellipse', { cx: 308, cy: 236, rx: 12, ry: 24, class: 'spb-ear' }, head);
    S('ellipse', { cx: 200, cy: 240, rx: 110, ry: 120, class: 'spb-head' }, head);
    S('path', { d: 'M188,124 Q200,104 212,124', class: 'spb-head' }, head);
    const hemL = S('path', { class: 'spb-hemi', style: 'fill:var(--bk-frontal)', d: 'M192,176 C150,168 112,196 110,250 C108,304 144,346 192,340 Z' }, svg);
    const hemR = S('path', { class: 'spb-hemi', style: 'fill:var(--bk-occipital)', d: 'M208,176 C250,168 288,196 290,250 C292,304 256,346 208,340 Z' }, svg);
    const ccG = S('g', null, svg);
    function drawCC() {
      ccG.innerHTML = '';
      if (cut) {
        S('rect', { x: 190, y: 252, width: 7, height: 34, class: 'spb-cc' }, ccG);
        S('rect', { x: 203, y: 252, width: 7, height: 34, class: 'spb-cc' }, ccG);
        S('path', { class: 'spb-cut', d: 'M200,246 L196,254 L204,262 L196,270 L204,278 L196,286 L200,292' }, ccG);
      } else S('rect', { x: 190, y: 252, width: 20, height: 34, class: 'spb-cc' }, ccG);
      const t = S('text', { x: 200, y: 354, 'text-anchor': 'middle', class: 'spb-sm', style: 'font-size:12px' }, ccG); t.textContent = cut ? 'CORPUS CALLOSUM: CUT' : 'CORPUS CALLOSUM';
    }
    drawCC();
    const xMark = S('g', { class: 'spb-x' }, svg);
    S('line', { x1: 192, y1: 260, x2: 208, y2: 276 }, xMark); S('line', { x1: 208, y1: 260, x2: 192, y2: 276 }, xMark);
    Object.entries(P).forEach(([k, pts]) => {
      if (!/^(L|R)(le|re)$|^(le|re)(L|R)$/.test(k)) return;
      rays[k] = S('polyline', { points: pts.map(p => p.join(',')).join(' '), class: `spb-ray ${k.startsWith('L') || k.endsWith('R') ? 'L' : 'R'}` }, svg);
    });
    // eyes
    [[170, 150], [230, 150]].forEach(([x, y]) => { S('ellipse', { cx: x, cy: y, rx: 15, ry: 9, class: 'spb-eye' }, svg); S('circle', { cx: x, cy: y - 3, r: 4.5, class: 'spb-pupil' }, svg); });
    // labels
    const lab = (x, y, t, c) => { const e = S('text', { x, y, 'text-anchor': 'middle', class: c || 'spb-t' }, svg); e.textContent = t; return e; };
    lab(34, 300, 'LEFT'); lab(34, 316, 'hemisphere', 'spb-s');
    lab(366, 300, 'RIGHT'); lab(366, 316, 'hemisphere', 'spb-s');
    S('path', { d: 'M52,282 C70,276 96,272 114,276', class: 'spb-motor', style: 'stroke-dasharray:none;opacity:.6' }, svg);
    S('path', { d: 'M348,282 C330,276 304,272 286,276', class: 'spb-motor', style: 'stroke-dasharray:none;opacity:.6' }, svg);
    const lang = S('rect', { x: 120, y: 202, width: 46, height: 22, rx: 11, class: 'spb-lang' }, svg);
    lab(143, 217, 'speech', 'spb-s');
    lab(252, 217, 'spatial', 'spb-s');
    // motor crossing to hands
    const mL = S('path', { class: 'spb-motor', d: 'M244,336 C230,380 160,392 70,420' }, svg); // right hemi -> left hand
    const mR = S('path', { class: 'spb-motor', d: 'M156,336 C170,380 240,392 330,420' }, svg);
    // tray
    S('rect', { x: 92, y: 398, width: 216, height: 66, rx: 12, class: 'spb-tray' }, svg);
    lab(200, 392, 'HIDDEN UNDER THE TABLE', 'spb-sm');
    const objX = { KEY: 122, CUP: 174, BALL: 226, SPOON: 278 }; const objY = 434;
    const objG = {};
    OBJS.forEach(o => {
      const g = S('g', { transform: `translate(${objX[o]},${objY})` }, svg); objG[o] = g;
      S('circle', { r: 21, class: 'spb-objring' }, g);
      if (o === 'KEY') { S('circle', { cx: -8, cy: 0, r: 7, class: 'spb-obj' }, g); S('path', { d: 'M-1,0 L14,0 M9,0 L9,6 M13,0 L13,5', class: 'spb-obj', style: 'fill:none' }, g); }
      if (o === 'CUP') { S('path', { d: 'M-11,-9 L9,-9 L6,11 L-8,11 Z', class: 'spb-obj' }, g); S('path', { d: 'M8,-5 C17,-5 17,6 7,6', class: 'spb-obj', style: 'fill:none' }, g); }
      if (o === 'BALL') { S('circle', { r: 11, class: 'spb-obj' }, g); S('path', { d: 'M-11,0 C-4,-6 4,6 11,0', class: 'spb-obj', style: 'fill:none' }, g); }
      if (o === 'SPOON') { S('ellipse', { cx: -8, cy: 0, rx: 7, ry: 5, class: 'spb-obj' }, g); S('path', { d: 'M-1,0 L15,0', class: 'spb-obj' }, g); }
      const t = S('text', { y: 28, 'text-anchor': 'middle', class: 'spb-sm', style: 'font-size:11px' }, g); t.textContent = o;
    });
    function handShape(g, flip) {
      const s = flip ? -1 : 1;
      S('path', { class: 'spb-hand', d: `M0,-12 C${12 * s},-14 ${20 * s},-8 ${20 * s},0 C${20 * s},8 ${12 * s},13 0,12 C${-8 * s},11 ${-10 * s},-10 0,-12 Z` }, g);
      S('ellipse', { class: 'spb-hand', cx: 8 * s, cy: -13, rx: 4, ry: 6, transform: `rotate(${30 * s} ${8 * s} -13)` }, g);
    }
    const handL = S('g', null, svg); handShape(handL, false);
    const handR = S('g', null, svg); handShape(handR, true);
    lab(40, 470, 'left hand', 'spb-s'); lab(360, 470, 'right hand', 'spb-s');
    const HL0 = [46, 430], HR0 = [354, 430];
    const setHand = (g, x, y) => g.setAttribute('transform', `translate(${x},${y})`);
    setHand(handL, ...HL0); setHand(handR, ...HR0);
    // speech bubble
    const bub = S('g', { class: 'spb-bub', style: 'opacity:0' }, svg);
    const bubRect = S('rect', { x: -14, y: 100, width: 150, height: 52, rx: 14 }, bub);
    S('path', { d: 'M110,150 L150,166 L124,150 Z' }, bub);
    const bubT1 = S('text', { x: 61, y: 122, 'text-anchor': 'middle' }, bub), bubT2 = S('text', { x: 61, y: 141, 'text-anchor': 'middle' }, bub);
    const pulses = S('g', null, svg);

    /* ---------- animation engine ---------- */
    function seg(pts) { const d = [0]; for (let k = 1; k < pts.length; k++) d.push(d[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])); return d; }
    function at(pts, f) {
      const d = seg(pts), L = d[d.length - 1] * Math.max(0, Math.min(1, f));
      for (let k = 1; k < pts.length; k++) if (L <= d[k]) { const u = (L - d[k - 1]) / ((d[k] - d[k - 1]) || 1); return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * u, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * u]; }
      return pts[pts.length - 1];
    }
    let anims = [], events = [], t0 = 0, loopId = 0;
    function pulse(path, start, dur, opts = {}) { const c = S('circle', { r: opts.r || 6, class: 'spb-pulse', style: 'opacity:0' }, pulses); anims.push({ path, start, dur, c, bounce: opts.bounce }); }
    function ev(time, fn) { events.push({ time, fn, done: false }); }
    function tick(now) {
      const t = now - t0;
      anims.forEach(a => {
        const f = (t - a.start) / a.dur;
        if (f < 0) { a.c.style.opacity = 0; return; }
        if (a.bounce) { // go to end, then fade back a bit
          if (f > 1.6) { a.c.style.opacity = 0; return; }
          const g = f <= 1 ? f : 1 - (f - 1) * 0.5; const p = at(a.path, g); a.c.setAttribute('cx', p[0]); a.c.setAttribute('cy', p[1]); a.c.style.opacity = f <= 1 ? 1 : Math.max(0, 1 - (f - 1) / 0.6); return;
        }
        if (f > 1) { a.c.style.opacity = 0; return; }
        const p = at(a.path, f); a.c.setAttribute('cx', p[0]); a.c.setAttribute('cy', p[1]); a.c.style.opacity = 1;
      });
      events.forEach(e => { if (!e.done && t >= e.time) { e.done = true; e.fn(); } });
      const last = Math.max(0, ...events.map(e => e.time), ...anims.map(a => a.start + a.dur * (a.bounce ? 1.6 : 1)));
      if (t < last + 50) loopId = requestAnimationFrame(tick); else { running = false; setBtns(true); }
    }
    let handAnim = null;
    function moveHand(g, from, to, dur, then) {
      const s = performance.now();
      const step = now => { const f = Math.max(0, Math.min(1, (now - s) / dur)); const e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; setHand(g, from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e); if (f < 1) handAnim = requestAnimationFrame(step); else then && then(); };
      if (api.reduceMotion) { setHand(g, ...to); then && then(); } else handAnim = requestAnimationFrame(step);
    }
    function setBtns(on) { bL.disabled = bR.disabled = !on; }
    function say(a, b) { bubT1.textContent = a; bubT2.textContent = b || ''; bub.style.opacity = 1; const w = Math.max(a.length, (b || '').length) * 9 + 26; bubRect.setAttribute('width', Math.max(120, w)); bubRect.setAttribute('x', 61 - Math.max(120, w) / 2); }
    let stepsEl = null;
    function step(html, cls) { const li = h('li', { class: cls || '' }); li.innerHTML = html; stepsEl.append(li); }
    function resetScene() {
      cancelAnimationFrame(loopId); cancelAnimationFrame(handAnim); bag.clear();
      anims = []; events = []; pulses.innerHTML = ''; running = false; setBtns(true);
      Object.values(rays).forEach(r => r.classList.remove('on'));
      [hemL, hemR, lang].forEach(e => e.classList.remove('glow'));
      [mL, mR].forEach(e => e.classList.remove('on'));
      xMark.classList.remove('on'); bub.style.opacity = 0; flash.style.opacity = 0;
      Object.values(objG).forEach(g => { g.querySelector('.spb-objring').classList.remove('on'); });
      OBJS.forEach(o => objG[o].setAttribute('transform', `translate(${objX[o]},${objY})`));
      setHand(handL, ...HL0); setHand(handR, ...HR0);
      idle();
    }
    function idle() {
      panel.innerHTML = '';
      panel.append(h('div', { class: 'w2-tag' }, cut ? 'Split-brain patient' : 'Typical brain'),
        h('p', { style: { margin: 0 } }, cut ? 'This patient’s corpus callosum was cut, so the two hemispheres cannot share information. Predict: what will the patient SAY if the word goes to the left field? What will the LEFT hand do?'
          : 'The corpus callosum is intact, so the hemispheres share everything. Flash a word to either side and compare with the split-brain patient.'));
    }
    function run(field) {
      if (running) return;
      resetScene(); running = true; setBtns(false); api.sfx.tap();
      const toHemi = field === 'L' ? 'R' : 'L';
      panel.innerHTML = '';
      stepsEl = h('ol', { class: 'spb-steps' });
      panel.append(h('div', { class: 'w2-tag' }, `${word} flashed in the ${field === 'L' ? 'LEFT' : 'RIGHT'} visual field`), stepsEl);
      const RM = api.reduceMotion;
      const T = RM ? (x => 0) : (x => x);
      t0 = performance.now();
      flash.textContent = word; flash.setAttribute('x', field === 'L' ? 110 : 290);
      ev(0, () => { flash.style.opacity = 1; api.sfx.blip(); rays[field + 'le'].classList.add('on'); rays[field + 're'].classList.add('on'); });
      ev(T(260), () => { flash.style.opacity = RM ? 1 : 0; });
      ev(T(150), () => step(`The word flashes for a split second, too fast to move the eyes. Both eyes see it in the <b>${field === 'L' ? 'left' : 'right'} visual field</b>.`));
      pulse(P[field + 'le'], T(0), 420, { r: 5 }); pulse(P[field + 're'], T(0), 420, { r: 5 });
      const pA = toHemi === 'R' ? ['leR', 'reR'] : ['leL', 'reL'];
      ev(T(420), () => { pA.forEach(k => rays[k].classList.add('on')); });
      pulse(P[pA[0]], T(420), 800); pulse(P[pA[1]], T(420), 800);
      ev(T(1250), () => { (toHemi === 'R' ? hemR : hemL).classList.add('glow'); api.sfx.tone(toHemi === 'R' ? 520 : 660, .12, 'triangle', .08);
        step(`The signal crosses to the <b>${toHemi === 'R' ? 'RIGHT' : 'LEFT'} hemisphere</b> (opposite side: contralateral).`); });
      if (toHemi === 'L') {
        pulse(P.LtoLang, T(1300), 500);
        ev(T(1800), () => { lang.classList.add('glow'); step('The left hemisphere has the language areas, so it can name what it saw.'); });
        ev(T(2100), () => { say(`“I saw the`, `word ${word}!”`); api.sfx.good(); step(`<span class="spb-say">Patient says: “${word}.”</span>`); });
        if (cut) {
          ev(T(2600), () => { mL.classList.add('on'); step('Now ask the LEFT hand to find it by touch. The left hand is run by the RIGHT hemisphere, which never got the word...'); });
          ev(T(2700), () => { const wrong = OBJS.filter(o => o !== word); const g = objX[ML.util.pick(wrong)]; moveHand(handL, HL0, [g - 26, objY], 700, () => { bag.t(() => moveHand(handL, [g - 26, objY], HL0, 500), 450); }); });
          ev(T(3700), () => { step('...so the left hand just guesses. Only the left hemisphere knows the answer.', ''); });
        } else {
          ev(T(2600), () => { mL.classList.add('on'); step('With an intact corpus callosum, the right hemisphere gets the message too, so the LEFT hand can also find it.'); });
          ev(T(2700), () => grab());
        }
      } else {
        if (cut) {
          pulse(P.RtoCC, T(1300), 550, { bounce: true });
          ev(T(1850), () => { xMark.classList.add('on'); api.sfx.bad(); step('The message tries to cross to the left hemisphere, but the <b>cut corpus callosum blocks it</b>.'); });
          ev(T(2300), () => { say('“I didn’t see', 'anything.”'); step('<span class="spb-say">Patient says: “I didn’t see anything.”</span> The talking left hemisphere truly did not see it.'); });
          ev(T(2900), () => { mL.classList.add('on'); step('But ask the LEFT hand to find it by touch. The right hemisphere controls the left hand, and it DID see the word...'); });
          ev(T(3000), () => grab(() => { step(`<b>The left hand picks the ${word}!</b> The right hemisphere knew all along, but it cannot talk.`); api.sfx.good(); api.addXP(1); }));
        } else {
          pulse(P.RtoCC, T(1300), 450); pulse(P.CCtoL, T(1750), 500);
          ev(T(1700), () => step('The message crosses the <b>intact corpus callosum</b> to the left hemisphere.'));
          ev(T(2250), () => { lang.classList.add('glow'); hemL.classList.add('glow'); });
          ev(T(2400), () => { say('“I saw the', `word ${word}!”`); api.sfx.good(); step(`<span class="spb-say">Patient says: “${word}.”</span> Either hand can find it too.`); });
          ev(T(2900), () => { mL.classList.add('on'); grab(); });
        }
      }
      function grab(after) {
        const x = objX[word];
        moveHand(handL, HL0, [x - 26, objY], 800, () => {
          objG[word].querySelector('.spb-objring').classList.add('on');
          objG[word].setAttribute('transform', `translate(${x},${objY - 10})`);
          after && after();
        });
      }
      loopId = requestAnimationFrame(tick);
    }
    idle();
    return () => { cancelAnimationFrame(loopId); cancelAnimationFrame(handAnim); bag.destroy(); };
  }
});
})();
