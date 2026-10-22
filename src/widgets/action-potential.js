/* action-potential — live membrane-potential graph + membrane cross-section with Na+/K+ channels.
   Leaky integrate-and-fire with a fixed spike shape: threshold, all-or-nothing, refractory period, summation,
   and rate coding (stronger stimulus → more frequent spikes, never bigger ones). Time is slowed way down. */
(function () {
'use strict';
const CSS = `
.ap { display: flex; flex-direction: column; gap: 12px; }
.ap-ins { font-size: 15px; color: var(--muted); }
.ap-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ap-mv { font-family: var(--f-mono); font-weight: 700; font-size: 34px; line-height: 1; font-variant-numeric: tabular-nums; min-width: 5.2ch; }
.ap-mv small { font-size: 15px; color: var(--muted); margin-left: 3px; }
.ap-state { font-weight: 700; font-size: 15px; padding: 6px 12px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line); transition: background .2s, color .2s; }
.ap-state.fire { background: var(--spark); color: #fff; border-color: var(--spark); }
.ap-state.sub { background: var(--warn-soft); color: var(--warn); border-color: transparent; }
.ap-state.ref { background: var(--blank-soft); color: var(--blank); border-color: transparent; }
.ap-graph, .ap-mem { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); background: var(--surface-2); }
.ap-graph canvas, .ap-mem canvas { display: block; width: 100%; touch-action: manipulation; }
.ap-flash { position: absolute; right: 10px; top: 8px; font-family: var(--f-mono); font-weight: 700; font-size: 13px; padding: 4px 9px; border-radius: 8px; background: var(--blank); color: var(--surface); opacity: 0; transition: opacity .2s; pointer-events: none; }
.ap-btns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) auto; gap: 8px; }
.ap-btns .btn { flex-direction: column; gap: 2px; padding: 9px 6px; }
.ap-btns .btn small { font-weight: 400; font-size: 12px; opacity: .85; }
.ap-stim.small { border-color: var(--warn); }
.ap-stim.medium { border-color: var(--spark); }
.ap-stim.large { background: var(--spark); border-color: var(--spark); color: #fff; }
.ap-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 13px; color: var(--muted); }
.ap-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 50%; margin-right: 5px; vertical-align: -1px; }
.ap-ch { border: 1.5px solid var(--line); border-radius: 14px; padding: 12px 14px; display: grid; gap: 8px; }
.ap-ch h4 { margin: 0; font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); display: flex; justify-content: space-between; }
.ap-c { display: grid; grid-template-columns: 24px 1fr; gap: 8px; align-items: start; font-size: 15px; }
.ap-c .bx { width: 22px; height: 22px; border-radius: 7px; border: 2px solid var(--line); display: grid; place-items: center; font-weight: 700; font-size: 13px; color: transparent; transition: all .25s; }
.ap-c.done .bx { background: var(--good); border-color: var(--good); color: #fff; }
.ap-c .why { display: none; font-size: 14px; color: var(--good); font-weight: 700; margin-top: 2px; }
.ap-c.done .why { display: block; }
.ap-note { font-size: 13px; color: var(--muted); }
`;
const VREST = -70, THRESH = -55, PEAK = 40, VHYP = -80, TAU = 0.35, PULSE = 1.6, RISE = 0.14, FALL = 0.22, REFR = 0.66;
const STIM = { small: 10, medium: 22, large: 50 };
const CH = [
  ['one', 'Give one small stimulus. Does it fire?', 'No. It stayed below threshold (−55 mV), so the little bump just faded.'],
  ['sum', 'Make it fire using only small stimuli.', 'Summation! Quick small inputs added up past threshold.'],
  ['big', 'Fire with a large stimulus. Is the spike taller?', 'Nope. Same +40 mV peak every time: all-or-nothing.'],
  ['rate', 'Get 3 spikes from a single stimulus.', 'A stronger stimulus makes the neuron fire more OFTEN, not harder.'],
  ['ref', 'Press a stimulus during the refractory period.', 'Nothing happened. The neuron has to reset before it can fire again.']
];

ML.registerWidget('action-potential', {
  title: 'Fire a neuron', tag: 'Simulation',
  mount(el, api) {
    const { h, sfx } = api;
    if (!document.getElementById('ap-css')) document.head.append(h('style', { id: 'ap-css' }, CSS));
    const root = h('div', { class: 'ap' });
    const ins = h('p', { class: 'ap-ins' }, 'Tap a stimulus button and watch the voltage. Can you reach threshold? Try the challenges below.');
    const mv = h('div', { class: 'ap-mv', 'aria-hidden': 'true' }, '−70', h('small', null, 'mV'));
    const stateEl = h('div', { class: 'ap-state', role: 'status' }, 'Resting potential');
    const gCan = h('canvas', { role: 'img', 'aria-label': 'Graph of membrane potential over time' });
    const flash = h('div', { class: 'ap-flash' }, 'Refractory!');
    const mCan = h('canvas', { role: 'img', 'aria-label': 'Neuron membrane with sodium and potassium channels' });
    const mkStim = (k, label, sub) => { const b = h('button', { type: 'button', class: `btn ap-stim ${k}`, 'data-stim': k }, label, h('small', null, sub)); b.addEventListener('click', () => stim(k)); return b; };
    const pauseB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': 'false', 'aria-label': 'Pause the simulation' }, '❚❚');
    const chEls = {};
    const chBox = h('div', { class: 'ap-ch' }, h('h4', null, h('span', null, 'Challenges'), h('span', { class: 'cnt' }, `0 / ${CH.length}`)),
      CH.map(([id, t, why]) => { const r = h('div', { class: 'ap-c' }, h('span', { class: 'bx', 'aria-hidden': 'true' }, '✓'), h('div', null, h('span', { class: 'sr-only st' }, 'Not done: '), t, h('div', { class: 'why' }, why))); chEls[id] = r; return r; }));
    root.append(ins, h('div', { class: 'ap-head' }, mv, stateEl),
      h('div', { class: 'ap-graph' }, gCan, flash),
      h('div', { class: 'ap-btns' }, mkStim('small', 'Small', '+10 mV'), mkStim('medium', 'Medium', '+22 mV'), mkStim('large', 'Large', '+50 mV'), pauseB),
      h('div', { class: 'ap-mem' }, mCan),
      h('div', { class: 'ap-legend', 'aria-hidden': 'true' }, h('span', null, h('i', { style: { background: '#F08A24' } }), 'Na+ sodium'), h('span', null, h('i', { style: { background: '#8B6CF0' } }), 'K+ potassium'), h('span', null, h('i', { style: { background: 'var(--line)', borderRadius: '3px' } }), 'membrane')),
      h('p', { class: 'ap-note' }, 'Time is slowed way down: a real action potential lasts about 1 millisecond.'),
      chBox);
    el.append(root);

    /* ---------------- model ---------------- */
    let t = 0, V = VREST, pulses = [], spike = null, refrUntil = -1, paused = false;
    const samples = [], spikes = [], marks = [];
    const done = new Set();
    let oneWatch = null, flashT = 0;
    function stim(k) {
      sfx.unlock && sfx.unlock();
      if (spike || t < refrUntil) {
        marks.push({ t, k, ignored: true });
        flash.style.opacity = '1'; flashT = t + 0.8; sfx.tone(160, 0.08, 'square', 0.04);
        complete('ref');
        return;
      }
      pulses.push({ k, amp: STIM[k], start: t, end: t + PULSE, spikes: 0 });
      marks.push({ t, k });
      sfx.tone(k === 'small' ? 330 : k === 'medium' ? 420 : 520, 0.07, 'triangle', 0.06);
      if (k === 'small') oneWatch = { t, spikes: spikes.length }; else oneWatch = null;
    }
    function complete(id) {
      if (done.has(id)) return; done.add(id);
      const r = chEls[id]; r.classList.add('done'); r.querySelector('.st').textContent = 'Done: ';
      chBox.querySelector('.cnt').textContent = `${done.size} / ${CH.length}`;
      sfx.good(); api.addXP(3);
      if (done.size === CH.length) { sfx.win(); const rc = chBox.getBoundingClientRect(); api.confetti(rc.left + rc.width / 2, rc.top, 90); }
    }
    function step(dt) {
      t += dt;
      pulses = pulses.filter(p => p.end > t - 0.001);
      const I = pulses.reduce((a, p) => a + p.amp, 0);
      if (spike) {
        const u = t - spike.t0;
        if (u < RISE) { const f = u / RISE; V = spike.v0 + (PEAK - spike.v0) * (1 - Math.pow(1 - f, 2)); spike.phase = 'rise'; }
        else if (u < RISE + FALL) { const f = (u - RISE) / FALL; V = PEAK + (VHYP - PEAK) * (f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2); spike.phase = 'fall'; }
        else { spike = null; V = VHYP; }
      } else {
        V += ((VREST - V) + I) / TAU * dt;
        if (V >= THRESH && t >= refrUntil) {
          spike = { t0: t, v0: V, phase: 'rise' }; refrUntil = t + REFR;
          spikes.push({ t, small: pulses.length > 0 && pulses.every(p => p.k === 'small'), nSmall: pulses.filter(p => p.k === 'small').length });
          pulses.forEach(p => p.spikes++);
          sfx.fire();
          const last = spikes[spikes.length - 1];
          if (last.small && last.nSmall >= 2) complete('sum');
          if (pulses.some(p => p.k === 'large')) complete('big');
          if (pulses.some(p => p.spikes >= 3)) complete('rate');
        }
      }
      if (oneWatch && t - oneWatch.t > PULSE + 0.4) { if (spikes.length === oneWatch.spikes && pulses.length === 0) complete('one'); oneWatch = null; }
      if (oneWatch && pulses.some(p => p.k !== 'small' || p.start > oneWatch.t)) oneWatch = null;
      if (flashT && t > flashT) { flash.style.opacity = '0'; flashT = 0; }
      samples.push([t, V]);
      while (samples.length && samples[0][0] < t - 12) samples.shift();
      while (marks.length && marks[0].t < t - 12) marks.shift();
      while (spikes.length > 40) spikes.shift();
    }
    function stateOf() {
      if (spike) return spike.phase === 'rise' ? ['Depolarization: Na+ rushes in', 'fire'] : ['Repolarization: K+ flows out', 'fire'];
      if (t < refrUntil) return [V < VREST - 2 ? 'Hyperpolarized (refractory)' : 'Refractory period', 'ref'];
      if (V > VREST + 0.8) return ['Graded potential: below threshold', 'sub'];
      return ['Resting potential', ''];
    }

    /* ---------------- drawing ---------------- */
    let C = {};
    function readColors() { const cs = getComputedStyle(root); ['ink', 'muted', 'line', 'spark', 'carolina', 'good', 'warn', 'surface', 'surface-2', 'blank'].forEach(k => C[k] = cs.getPropertyValue('--' + k).trim() || '#888'); }
    readColors();
    let GW = 600, GH = 240, MW = 600, MH = 130, dpr = 1;
    const gg = gCan.getContext('2d'), mg = mCan.getContext('2d');
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      GW = Math.max(260, gCan.parentElement.clientWidth || 600); GH = Math.round(Math.max(210, Math.min(280, GW * 0.42)));
      gCan.width = GW * dpr; gCan.height = GH * dpr; gCan.style.height = GH + 'px';
      MW = GW; MH = Math.round(Math.max(120, Math.min(150, GW * 0.22)));
      mCan.width = MW * dpr; mCan.height = MH * dpr; mCan.style.height = MH + 'px';
      initIons();
    }
    let lastW = -1;
    const ro = new ResizeObserver(() => { const w = gCan.parentElement.clientWidth; if (w && w !== lastW) { lastW = w; size(); } }); ro.observe(root);
    const F = (w, s) => `${w} ${s}px ${ML.fonts.body}`;
    function label(g, txt, x, y, col, align = 'left', size = 12, bg = true) {
      g.font = F(700, size); const w = g.measureText(txt).width;
      let bx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      bx = Math.max(4, Math.min(GW - w - 6, bx));
      if (bg) { g.fillStyle = C['surface-2']; g.globalAlpha = 0.85; g.fillRect(bx - 3, y - size + 1, w + 6, size + 4); g.globalAlpha = 1; }
      g.fillStyle = col; g.textAlign = 'left'; g.fillText(txt, bx, y);
    }
    function drawGraph() {
      const g = gg; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, GW, GH);
      const L = 46, R = 12, T = 14, B = 24, w = GW - L - R, hgt = GH - T - B;
      const win = Math.max(3.2, Math.min(7, w / 85));
      const y = v => T + (50 - v) / 140 * hgt, x = tt => L + (tt - (t - win)) / win * w;
      // grid
      g.strokeStyle = C.line; g.lineWidth = 1; g.font = F(400, 11); g.fillStyle = C.muted; g.textAlign = 'right';
      [40, 0, -40, -80].forEach(v => { g.globalAlpha = 0.6; g.beginPath(); g.moveTo(L, y(v)); g.lineTo(GW - R, y(v)); g.stroke(); g.globalAlpha = 1; g.fillText(`${v > 0 ? '+' : ''}${v}`, L - 6, y(v) + 4); });
      g.save(); g.translate(12, T + hgt / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText('mV', 0, 0); g.restore();
      g.textAlign = 'right'; g.fillText('time →', GW - R, GH - 6);
      // refractory bands
      spikes.forEach(s => { const a = x(s.t), b = x(s.t + REFR); if (b < L) return; g.fillStyle = C.blank; g.globalAlpha = 0.1; g.fillRect(Math.max(L, a), T, b - Math.max(L, a), hgt); g.globalAlpha = 1; });
      // threshold + rest
      g.setLineDash([6, 5]); g.lineWidth = 1.6;
      g.strokeStyle = C.warn; g.beginPath(); g.moveTo(L, y(THRESH)); g.lineTo(GW - R, y(THRESH)); g.stroke();
      g.strokeStyle = C.muted; g.beginPath(); g.moveTo(L, y(VREST)); g.lineTo(GW - R, y(VREST)); g.stroke();
      g.setLineDash([]);
      label(g, 'threshold −55', L + 4, y(THRESH) - 4, C.warn, 'left', 11);
      label(g, 'resting −70', L + 4, y(VREST) + 14, C.muted, 'left', 11);
      // stimulus marks
      marks.forEach(m => { const mx = x(m.t); if (mx < L) return; g.fillStyle = m.ignored ? C.blank : m.k === 'large' ? C.spark : m.k === 'medium' ? C.spark : C.warn; g.font = F(700, 11); g.textAlign = 'center';
        g.beginPath(); g.moveTo(mx, GH - B + 2); g.lineTo(mx - 5, GH - B + 10); g.lineTo(mx + 5, GH - B + 10); g.fill(); g.fillText(m.ignored ? '×' : m.k[0].toUpperCase(), mx, GH - 2); });
      // trace
      g.save(); g.beginPath(); g.rect(L, 0, w, GH); g.clip();
      g.strokeStyle = C.carolina; g.lineWidth = 2.6; g.lineJoin = 'round'; g.beginPath();
      let started = false;
      for (const [st, sv] of samples) { if (st < t - win - 0.1) continue; const px = x(st), py = y(sv); if (!started) { g.moveTo(px, py); started = true; } else g.lineTo(px, py); }
      g.stroke();
      // glow head
      g.fillStyle = spike ? C.spark : C.carolina; g.beginPath(); g.arc(x(t), y(V), 5, 0, 7); g.fill();
      g.restore();
      // annotations on the most recent finished spike
      const s = spikes[spikes.length - 1];
      if (s && t - s.t > RISE && x(s.t) > L + 4) {
        const sx = x(s.t), px = x(s.t + RISE), fx = x(s.t + RISE + FALL * 0.5), hx = x(s.t + RISE + FALL + 0.04);
        label(g, 'action potential', Math.max(L + 52, px), y(PEAK) - 2 < T + 10 ? T + 11 : y(PEAK) - 4, C.spark, 'center', 12);
        if (sx - L > 70) label(g, 'depolarization', sx - 6, y(5), C.spark, 'right', 11);
        if (t - s.t > RISE + FALL * 0.6 && GW - R - fx > 60) label(g, 'repolarization', fx + 8, y(-10), C.carolina, 'left', 11);
        if (w >= 380 && t - s.t > RISE + FALL + 0.05 && GW - R - hx > 80) label(g, 'hyperpolarization', hx + 4, y(-60), C.blank, 'left', 11);
        const rb = x(s.t + REFR);
        if (w >= 380 && rb > L + 40) label(g, 'refractory period', Math.max(L + 2, sx) + (Math.min(rb, GW - R) - Math.max(L, sx)) / 2, T + hgt - 4, C.blank, 'center', 10, false);
      }
    }
    /* membrane: ions + channels */
    let ions = [];
    const NA_CH = [0.2, 0.5, 0.8], K_CH = [0.35, 0.65];
    function initIons() {
      ions = [];
      for (let i = 0; i < 30; i++) ions.push({ type: 'na', rank: i / 30, side: 0, x: Math.random() * MW, y: Math.random() * (MH * 0.32) + 6, vx: 0, vy: 0, mode: 'free', a: 1 });
      for (let i = 0; i < 30; i++) ions.push({ type: 'k', rank: i / 30, side: 1, x: Math.random() * MW, y: MH * 0.66 + Math.random() * (MH * 0.3), vx: 0, vy: 0, mode: 'free', a: 1 });
    }
    let fNa = 0.06, fK = 0.06;
    function drawMem(dt) {
      const g = mg; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, MW, MH);
      const top = MH * 0.42, bot = MH * 0.58;
      g.fillStyle = C.surface; g.fillRect(0, 0, MW, top);
      g.font = F(700, 11); g.fillStyle = C.muted; g.textAlign = 'left'; g.fillText('OUTSIDE the axon', 8, 14); g.fillText('INSIDE the axon', 8, MH - 6);
      // inside charge
      const pos = V > 0; g.textAlign = 'right'; g.font = F(700, 12); g.fillStyle = pos ? C.spark : C.carolina; g.fillText(`inside is ${pos ? 'POSITIVE +' : 'negative −'}`, MW - 8, MH - 6);
      // membrane bilayer
      g.fillStyle = C.line; g.fillRect(0, top, MW, bot - top);
      g.fillStyle = C['surface-2']; for (let xx = 4; xx < MW; xx += 9) { g.beginPath(); g.arc(xx, top + 3, 2.6, 0, 7); g.arc(xx, bot - 3, 2.6, 0, 7); g.fill(); }
      // channel states
      const naOpen = spike && spike.phase === 'rise', kOpen = (spike && spike.phase === 'fall') || (t < refrUntil && V < VREST - 1);
      const chan = (fx, open, col, lab) => {
        const cx = fx * MW, wC = 22;
        g.fillStyle = col; g.globalAlpha = 0.9;
        const gap = open ? 10 : 2;
        g.fillRect(cx - wC / 2 - 4, top - 6, wC / 2 + 4 - gap / 2, bot - top + 12); g.fillRect(cx + gap / 2, top - 6, wC / 2 + 4 - gap / 2, bot - top + 12);
        g.globalAlpha = 1; g.fillStyle = col; g.font = F(700, 10); g.textAlign = 'center'; g.fillText(lab + (open ? ' open' : ''), cx, top - 10);
      };
      NA_CH.forEach(f => chan(f, naOpen, '#F08A24', 'Na+'));
      K_CH.forEach(f => chan(f, kOpen, '#8B6CF0', 'K+'));
      // fraction targets
      const graded = Math.max(0, Math.min(1, (V - VREST) / 15));
      let tNa = spike ? 0.6 : (t < refrUntil ? 0.6 : 0.06 + 0.18 * graded);
      let tK = (spike && spike.phase === 'fall') || (t < refrUntil) ? 0.55 : 0.06;
      if (!spike && t >= refrUntil) { tNa = 0.06 + 0.18 * graded; tK = 0.06; }
      const restoring = tNa < fNa - 0.01 || tK < fK - 0.01;
      fNa += (tNa - fNa) * Math.min(1, dt * (tNa > fNa ? 9 : 1.6));
      fK += (tK - fK) * Math.min(1, dt * (tK > fK ? 9 : 1.6));
      const rm = api.reduceMotion;
      ions.forEach(io => {
        const want = io.rank < (io.type === 'na' ? fNa : fK) ? (io.type === 'na' ? 1 : 0) : (io.type === 'na' ? 0 : 1);
        if (want !== io.side && io.mode === 'free') {
          if ((io.type === 'na' && want === 1) || (io.type === 'k' && want === 0)) {
            const chs = io.type === 'na' ? NA_CH : K_CH; const c = chs.reduce((b, f) => Math.abs(f * MW - io.x) < Math.abs(b * MW - io.x) ? f : b, chs[0]);
            io.mode = 'through'; io.cx = c * MW; io.dest = want; io.stage = 0;
          } else { io.mode = 'fade'; io.dest = want; }
        }
        const sp = rm ? 1 : 1;
        if (io.mode === 'through') {
          const ty = io.stage === 0 ? (io.dest === 1 ? top - 8 : bot + 8) : io.stage === 1 ? (io.dest === 1 ? bot + 10 : top - 10) : io.ty;
          const tx = io.stage < 2 ? io.cx : io.tx;
          const dx = tx - io.x, dy = ty - io.y, d = Math.hypot(dx, dy), v = 260 * sp * dt;
          if (d <= v) { io.x = tx; io.y = ty; io.stage++; if (io.stage === 2) { io.tx = io.x + (Math.random() - .5) * 60; io.ty = io.dest === 1 ? bot + 10 + Math.random() * (MH - bot - 22) : 8 + Math.random() * (top - 22); } if (io.stage === 3) { io.mode = 'free'; io.side = io.dest; } }
          else { io.x += dx / d * v; io.y += dy / d * v; }
        } else if (io.mode === 'fade') {
          io.a -= dt * 2.5; if (io.a <= 0) { io.side = io.dest; io.x = Math.random() * MW; io.y = io.dest === 1 ? bot + 10 + Math.random() * (MH - bot - 22) : 8 + Math.random() * (top - 22); io.mode = 'in'; }
        } else if (io.mode === 'in') { io.a += dt * 2.5; if (io.a >= 1) { io.a = 1; io.mode = 'free'; } }
        else if (!rm) {
          io.vx += (Math.random() - .5) * 60 * dt; io.vy += (Math.random() - .5) * 60 * dt; io.vx *= 0.96; io.vy *= 0.96;
          io.x += io.vx * dt * 6; io.y += io.vy * dt * 6;
          const y0 = io.side === 1 ? bot + 8 : 20, y1 = io.side === 1 ? MH - 16 : top - 8;
          if (io.y < y0) { io.y = y0; io.vy = Math.abs(io.vy); } if (io.y > y1) { io.y = y1; io.vy = -Math.abs(io.vy); }
          if (io.x < 4) { io.x = 4; io.vx = Math.abs(io.vx); } if (io.x > MW - 4) { io.x = MW - 4; io.vx = -Math.abs(io.vx); }
        }
        g.globalAlpha = Math.max(0, io.a); g.fillStyle = io.type === 'na' ? '#F08A24' : '#8B6CF0';
        g.beginPath(); g.arc(io.x, io.y, 4.2, 0, 7); g.fill();
        g.globalAlpha = 1;
      });
      if (restoring && !spike) { g.font = F(400, 10); g.fillStyle = C.muted; g.textAlign = 'center'; g.fillText('ions are restored to resting positions', MW / 2, MH - 6 - 14 > bot ? MH - 20 : MH - 6); }
    }

    /* ---------------- loop ---------------- */
    let raf = 0, last = 0, vis = true, colorTick = 0, lastState = '';
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; });
    const ioT = setTimeout(() => io.observe(root), 80);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (!vis) return;
      if (!paused) { let rem = dt; while (rem > 0) { const d = Math.min(rem, 1 / 120); step(d); rem -= d; } }
      if (++colorTick % 30 === 0) readColors();
      drawGraph(); drawMem(paused ? 0 : dt);
      mv.firstChild.textContent = `${V >= 0 ? '+' : V < 0 ? '−' : ''}${Math.abs(Math.round(V))}`;
      mv.style.color = spike ? 'var(--spark)' : V > VREST + 1 ? 'var(--warn)' : 'var(--ink)';
      const [st, cls] = stateOf();
      if (st !== lastState) { lastState = st; stateEl.textContent = st; stateEl.className = 'ap-state ' + cls; }
    }
    pauseB.addEventListener('click', () => { paused = !paused; pauseB.setAttribute('aria-pressed', String(paused)); pauseB.textContent = paused ? '▶' : '❚❚'; pauseB.setAttribute('aria-label', paused ? 'Resume the simulation' : 'Pause the simulation'); sfx.tap(); });
    // keyboard shortcuts 1/2/3 while focus is inside the widget
    const onKey = e => { if (!root.contains(document.activeElement)) return; if (e.key === '1') stim('small'); else if (e.key === '2') stim('medium'); else if (e.key === '3') stim('large'); };
    root.addEventListener('keydown', onKey);
    size();
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(ioT); io.disconnect(); };
  }
});
})();
