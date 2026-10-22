/* synapse-sim — animated synapse: release, binding, reuptake, enzymes; Normal / Agonist / Antagonist / Reuptake inhibitor modes. */
(function () {
'use strict';
const CSS = `
.syn { display: flex; flex-direction: column; gap: 12px; }
.syn-ins { font-size: 15px; color: var(--muted); }
.syn-modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr)); gap: 6px; }
.syn-modes .chip { border-radius: 12px; padding: 8px 10px; }
.syn-stage { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: var(--surface-2); }
.syn-stage canvas { display: block; width: 100%; }
.syn-meter { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; align-items: center; }
.syn-meter b { grid-column: 1 / -1; }
.syn-meter b { font-size: 14px; }
.syn-bar { height: 16px; border-radius: 9px; background: var(--line); overflow: hidden; position: relative; }
.syn-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 9px; background: linear-gradient(90deg, var(--good), var(--warn), var(--spark)); }
.syn-val { font-family: var(--f-mono); font-weight: 700; min-width: 4ch; text-align: right; font-variant-numeric: tabular-nums; }
.syn-exp { border-radius: 14px; padding: 10px 14px; background: var(--surface-2); border-left: 5px solid var(--carolina); font-size: 15px; min-height: 3.3em; }
.syn-exp b { display: block; font-size: 16px; }
.syn-reads { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 13px; color: var(--muted); }
.syn-reads .pill { font-family: var(--f-mono); }
.syn-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.syn-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; color: var(--muted); }
.syn-legend span { display: inline-flex; align-items: center; gap: 5px; }
.syn-legend svg { width: 14px; height: 14px; }
`;
const MODES = {
  normal: ['Normal', 'Normal transmission', 'Neurotransmitter crosses the synapse and binds to receptor sites. Then reuptake pumps pull it back into the sending neuron and enzymes break leftovers down.'],
  agonist: ['Agonist', 'Agonist: a mimic', 'Drug molecules shaped like the neurotransmitter also activate the receptors, so activity goes UP. Example: heroin and morphine mimic endorphins.'],
  antagonist: ['Antagonist', 'Antagonist: a blocker', 'Blocker molecules sit in the receptor sites without activating them, so the real neurotransmitter can’t bind and activity goes DOWN. Example: some antipsychotic drugs block dopamine receptors.'],
  reuptake: ['Reuptake inhibitor', 'Reuptake inhibitor', 'The reuptake pumps are blocked, so neurotransmitter lingers in the synapse and keeps binding. Activity goes UP. Examples: SSRIs like Prozac (serotonin) and cocaine (dopamine).']
};
const W = 400, H = 300, TOPM = 118, BOTM = 196;
const RX = [118, 159, 200, 241, 282];
const PUMPS = [86, 314];

ML.registerWidget('synapse-sim', {
  title: 'Inside the synapse', tag: 'Simulation',
  mount(el, api) {
    const { h, sfx } = api;
    if (!document.getElementById('syn-css')) document.head.append(h('style', { id: 'syn-css' }, CSS));
    let mode = 'normal', auto = true, raf = 0, last = 0, vis = true, nextFire = 0.6, time = 0;
    const root = h('div', { class: 'syn' });
    const ins = h('p', { class: 'syn-ins' }, 'Watch a message cross the synapse. Then switch modes to see how drugs change it, and compare the activity meter.');
    const mBtns = Object.entries(MODES).map(([k, m]) => { const b = h('button', { type: 'button', class: 'chip', 'data-mode': k, 'aria-pressed': String(k === mode) }, m[0]); b.addEventListener('click', () => setMode(k)); return b; });
    const cv = h('canvas', { role: 'img', 'aria-label': 'Animated synapse' });
    const fill = h('i'), val = h('span', { class: 'syn-val' }, '0');
    const meter = h('div', { class: 'syn-meter' }, h('b', null, 'Receptor activity (5-second average)'), h('div', { class: 'syn-bar', role: 'meter', 'aria-label': 'Receptor activity', 'aria-valuemin': '0', 'aria-valuemax': '100' }, fill), val);
    const exp = h('div', { class: 'syn-exp', 'aria-live': 'polite' });
    const reads = h('div', { class: 'syn-reads' }, 'Your readings (after 8 seconds in a mode): ');
    const readVals = {}; let modeTime = 0;
    const fireB = h('button', { type: 'button', class: 'btn btn-sm btn-spark' }, '⚡ Send a signal');
    const autoB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': 'true' }, 'Auto-fire: on');
    const ic = s => { const x = api.svgEl('svg', { viewBox: '0 0 14 14', 'aria-hidden': 'true' }); x.innerHTML = s; return x; };
    const legend = h('div', { class: 'syn-legend' },
      h('span', null, ic('<circle cx="7" cy="7" r="4.5" style="fill:var(--spark)"/>'), 'neurotransmitter'),
      h('span', null, ic('<path d="M7 1.5 L12.5 7 L7 12.5 L1.5 7Z" style="fill:#8B6CF0"/>'), 'agonist drug'),
      h('span', null, ic('<rect x="2" y="2" width="10" height="10" rx="2" style="fill:#7D8799"/>'), 'blocker drug'),
      h('span', null, ic('<path d="M7 7 L13 4 A6 6 0 1 0 13 10Z" style="fill:var(--warn)"/>'), 'enzyme'),
      h('span', null, ic('<rect x="3" y="1" width="8" height="12" rx="3" style="fill:var(--good)"/>'), 'reuptake pump'));
    root.append(ins, h('div', { class: 'syn-modes', role: 'group', 'aria-label': 'Mode' }, mBtns), h('div', { class: 'syn-stage' }, cv), meter, reads, exp, h('div', { class: 'syn-row' }, fireB, autoB), legend);
    el.append(root);

    /* -------- state -------- */
    const nts = [], drugs = [], frags = [];
    const rec = RX.map(x => ({ x, by: null, t: 0, act: 0 }));
    let vesicles = [], pulse = -1, activity = 0, hist = [], histT = 0;
    const enz = [{ x: 140, y: 160, vx: 18 }, { x: 270, y: 150, vx: -14 }];
    function makeVesicles() { vesicles = [[150, 70], [200, 82], [250, 70], [176, 102], [226, 102], [130, 100], [270, 100]].map(([x, y]) => ({ x, y, hx: x, hy: y, state: 'ready', a: 1, t: 0 })); }
    makeVesicles();
    function fire() {
      if (pulse >= 0) return;
      pulse = 0; sfx.fire();
    }
    function release() {
      const ready = vesicles.filter(v => v.state === 'ready');
      api.util.shuffle(ready).slice(0, 3).forEach((v, i) => { v.state = 'moving'; v.t = -i * 0.08; v.tx = 150 + Math.random() * 100; });
    }
    function spawnNT(x) { for (let i = 0; i < 6; i++) nts.push({ x: x + (Math.random() - .5) * 14, y: TOPM + 4, vx: (Math.random() - .5) * 90, vy: 70 + Math.random() * 50, st: 'free', life: 0 }); }
    function setDrugs() {
      drugs.length = 0; rec.forEach(r => { if (r.by && r.by.kind !== 'nt') { r.by = null; r.act = 0; } });
      if (mode === 'agonist') for (let i = 0; i < 8; i++) drugs.push({ kind: 'ag', x: 70 + Math.random() * 260, y: TOPM + 16 + Math.random() * 40, vx: (Math.random() - .5) * 60, vy: 40, st: 'free', cool: 0 });
      if (mode === 'antagonist') for (let i = 0; i < 6; i++) drugs.push({ kind: 'bl', x: RX[i % 5] + (Math.random() - .5) * 30, y: TOPM + 20 + Math.random() * 20, vx: (Math.random() - .5) * 20, vy: 60, st: 'free', cool: 0 });
    }
    function setMode(k) {
      mode = k; modeTime = 0; mBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === k))); setDrugs();
      const m = MODES[k]; exp.innerHTML = ''; exp.append(h('b', null, m[1]), m[2]);
      exp.style.borderLeftColor = k === 'normal' ? 'var(--carolina)' : k === 'antagonist' ? '#7D8799' : k === 'agonist' ? '#8B6CF0' : 'var(--good)';
      sfx.tap(); cv.setAttribute('aria-label', 'Animated synapse: ' + m[1]);
    }
    fireB.addEventListener('click', () => { fire(); });
    autoB.addEventListener('click', () => { auto = !auto; autoB.setAttribute('aria-pressed', String(auto)); autoB.textContent = `Auto-fire: ${auto ? 'on' : 'off'}`; sfx.tap(); });

    /* -------- simulation -------- */
    const freeRec = () => rec.filter(r => !r.by);
    function bindCheck(m, kind) {
      for (const r of rec) {
        if (r.by) continue;
        if (Math.abs(m.x - r.x) < 14 && m.y > BOTM - 22 && m.y < BOTM) {
          r.by = m; m.st = 'bound'; m.x = r.x; m.y = BOTM - 9; m.r = r;
          r.t = kind === 'bl' ? 5 + Math.random() * 3 : kind === 'ag' ? 1.2 + Math.random() * 0.6 : 0.3 + Math.random() * 0.2;
          r.act = kind === 'bl' ? 0 : 1; if (kind !== 'bl') sfx.tone(880 + Math.random() * 300, 0.03, 'sine', 0.015);
          return true;
        }
      }
      return false;
    }
    function moveFree(m, dt, drift) {
      m.vx += (Math.random() - .5) * 1100 * dt; m.vy += (Math.random() - .5) * 1100 * dt + drift * dt;
      m.vx *= 0.985; m.vy *= 0.985;
      if (m.y > BOTM - 46 && m.st === 'free' && !(m.cool > 0)) { const fr = freeRec(); if (fr.length) { const r = fr.reduce((b, q) => Math.abs(q.x - m.x) < Math.abs(b.x - m.x) ? q : b); if (Math.abs(r.x - m.x) < 40) m.vx += Math.sign(r.x - m.x) * 220 * dt; } }
      if (m.x < 4) { m.x = 4; m.vx = Math.abs(m.vx); } if (m.x > W - 4) { m.x = W - 4; m.vx = -Math.abs(m.vx); }
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.y < TOPM + 5) { m.y = TOPM + 5; m.vy = Math.abs(m.vy); }
      if (m.y > BOTM - 4) { m.y = BOTM - 4; m.vy = -Math.abs(m.vy) * 0.6; }
    }
    function step(dt) {
      time += dt;
      if (auto && time >= nextFire) { fire(); nextFire = time + 2.6; }
      if (pulse >= 0) { pulse += dt / 0.45; if (pulse >= 1) { pulse = -1; release(); } }
      vesicles.forEach(v => {
        if (v.state === 'moving') { v.t += dt; if (v.t > 0) { const u = Math.min(1, v.t / 0.35); v.x = v.hx + (v.tx - v.hx) * u; v.y = v.hy + (TOPM - 10 - v.hy) * u; if (u >= 1) { v.state = 'fuse'; v.t = 0; spawnNT(v.x); } } }
        else if (v.state === 'fuse') { v.t += dt; v.a = Math.max(0, 1 - v.t / 0.3); if (v.t > 0.3) { v.state = 'gone'; v.t = 0; } }
        else if (v.state === 'gone') { v.t += dt; if (v.t > 1.6) { v.state = 'ready'; v.x = v.hx; v.y = v.hy; v.a = 0; } }
        else if (v.state === 'ready' && v.a < 1) v.a = Math.min(1, v.a + dt * 2);
      });
      // receptors
      rec.forEach(r => { if (r.by) { r.t -= dt; if (r.t <= 0) { const m = r.by; r.by = null; r.act = 0; m.st = 'free'; m.y = BOTM - 22; m.vy = -60 - Math.random() * 40; m.vx = (Math.random() - .5) * 80; m.r = null; if (m.kind) m.cool = 0.4; else m.cool = 0.6; } } });
      // enzymes
      enz.forEach(e => { e.x += e.vx * dt; if (e.x < 40 || e.x > 360) e.vx *= -1; e.y = 156 + Math.sin(time * 1.3 + e.x / 40) * 10; });
      // neurotransmitters
      for (let i = nts.length - 1; i >= 0; i--) {
        const m = nts[i]; m.life += dt;
        if (m.st === 'free') {
          moveFree(m, dt, m.life < 0.7 ? 140 : mode === 'reuptake' ? 0 : -70);
          if (m.cool > 0) m.cool -= dt; else bindCheck(m, 'nt');
          if (m.st === 'free') {
            const pumpsOn = mode !== 'reuptake';
            if (pumpsOn && m.life > 0.9 && m.y < TOPM + 46) {
              for (const px of PUMPS) { const dx = px - m.x; if (Math.abs(dx) < 70) { m.vx += Math.sign(dx) * 260 * dt; m.vy -= 120 * dt; } if (Math.abs(dx) < 10 && m.y < TOPM + 12) { m.st = 'up'; m.px = px; } }
            }
            if (m.st === 'free' && m.life > 1.2) for (const e of enz) if (Math.hypot(e.x - m.x, e.y - m.y) < 13 && Math.random() < (mode === 'reuptake' ? 0.03 : 0.12)) { m.st = 'dead'; for (let k = 0; k < 3; k++) frags.push({ x: m.x, y: m.y, vx: (Math.random() - .5) * 60, vy: (Math.random() - .5) * 60, a: 1 }); }
            if (m.life > 9) m.st = 'dead';
          }
        } else if (m.st === 'up') { m.x += (m.px - m.x) * Math.min(1, dt * 10); m.y -= 70 * dt; if (m.y < TOPM - 18) m.st = 'dead'; }
        if (m.st === 'dead') nts.splice(i, 1);
      }
      // drugs
      drugs.forEach(d => {
        if (d.st !== 'free') return;
        moveFree(d, dt, 10);
        if (d.x < 6) { d.x = 6; d.vx = Math.abs(d.vx); } if (d.x > W - 6) { d.x = W - 6; d.vx = -Math.abs(d.vx); }
        if (d.kind === 'bl') { const fr = freeRec(); if (fr.length) { const r = fr.reduce((b, q) => Math.abs(q.x - d.x) < Math.abs(b.x - d.x) ? q : b); d.vx += Math.sign(r.x - d.x) * 320 * dt; d.vy += 260 * dt; } }
        if (d.cool > 0) d.cool -= dt; else bindCheck(d, d.kind);
      });
      for (let i = frags.length - 1; i >= 0; i--) { const f = frags[i]; f.x += f.vx * dt; f.y += f.vy * dt; f.a -= dt * 1.6; if (f.a <= 0) frags.splice(i, 1); }
      const now = rec.reduce((a, r) => a + r.act, 0) / rec.length;
      activity += (now - activity) * Math.min(1, dt / 0.7);
      histT += dt; if (histT >= 0.05) { histT = 0; hist.push(activity); if (hist.length > 240) hist.shift(); }
    }

    /* -------- drawing -------- */
    const g = cv.getContext('2d'); let CW = 400, CH = 300, dpr = 1, C = {}, ct = 0;
    function readColors() { const cs = getComputedStyle(root); ['ink', 'muted', 'line', 'spark', 'carolina', 'carolina-soft', 'good', 'warn', 'surface', 'surface-2', 'good-soft'].forEach(k => C[k] = cs.getPropertyValue('--' + k).trim() || '#888'); }
    readColors();
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); CW = cv.parentElement.clientWidth || 400; CH = Math.min(380, CW * 0.75); cv.width = CW * dpr; cv.height = CH * dpr; cv.style.height = CH + 'px'; }
    let lastW = -1; const ro = new ResizeObserver(() => { const w = cv.parentElement.clientWidth; if (w && w !== lastW) { lastW = w; size(); } }); ro.observe(root); size();
    function draw() {
      const s = Math.min(CW / W, CH / H), ox = (CW - W * s) / 2, oy = (CH - H * s) / 2;
      g.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy); g.clearRect(-ox / s, -oy / s, CW / s, CH / s);
      // postsynaptic neuron
      g.fillStyle = C['surface']; g.fillRect(-ox / s, BOTM, CW / s, H - BOTM + oy / s);
      g.fillStyle = C['good']; g.globalAlpha = activity * 0.35; g.fillRect(-ox / s, BOTM, CW / s, H - BOTM + oy / s); g.globalAlpha = 1;
      g.strokeStyle = C.carolina; g.lineWidth = 3; g.beginPath(); g.moveTo(-ox / s, BOTM); g.lineTo(W + ox / s, BOTM); g.stroke();
      g.font = `700 13px ${ML.fonts.body}`; g.fillStyle = C.muted; g.textAlign = 'left';
      g.fillText('RECEIVING NEURON (dendrite)', 10, H - 66); g.font = `400 11px ${ML.fonts.body}`; g.fillText('activity over time', 10, H - 52);
      // activity sparkline
      g.strokeStyle = C.good; g.lineWidth = 2; g.beginPath(); hist.forEach((v, i) => { const x = 10 + i / 240 * (W - 20), y = H - 12 - v * 46; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(10, H - 12); g.lineTo(W - 10, H - 12); g.stroke();
      // presynaptic terminal
      g.fillStyle = C['carolina-soft']; g.strokeStyle = C.carolina; g.lineWidth = 3;
      g.beginPath(); g.moveTo(170, -oy / s - 4); g.lineTo(170, 20); g.bezierCurveTo(90, 26, 46, 60, 50, TOPM - 12); g.quadraticCurveTo(52, TOPM, 66, TOPM); g.lineTo(334, TOPM); g.quadraticCurveTo(348, TOPM, 350, TOPM - 12); g.bezierCurveTo(354, 60, 310, 26, 230, 20); g.lineTo(230, -oy / s - 4); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = C.muted; g.font = `700 13px ${ML.fonts.body}`; g.textAlign = 'center'; g.fillText('SENDING NEURON (axon terminal)', 200, 52);
      // action potential pulse
      if (pulse >= 0) { const y = -10 + pulse * 70; const gr = g.createRadialGradient(200, y, 0, 200, y, 28); gr.addColorStop(0, 'rgba(255,209,102,1)'); gr.addColorStop(1, 'rgba(255,209,102,0)'); g.fillStyle = gr; g.beginPath(); g.arc(200, y, 28, 0, 7); g.fill(); }
      // vesicles
      vesicles.forEach(v => { if (v.state === 'gone') return; g.globalAlpha = v.a; g.fillStyle = C.surface; g.strokeStyle = C.spark; g.lineWidth = 2; g.beginPath(); g.arc(v.x, v.y, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = C.spark; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(v.x + Math.cos(k * 1.3) * 5, v.y + Math.sin(k * 1.3) * 5, 2.4, 0, 7); g.fill(); } g.globalAlpha = 1; });
      // pumps
      PUMPS.forEach(px => {
        g.fillStyle = C.good; roundRect(px - 9, TOPM - 14, 18, 26, 6); g.fill();
        g.fillStyle = C['surface']; g.fillRect(px - 2.5, TOPM - 12, 5, 22);
        if (mode === 'reuptake') { g.fillStyle = '#7D8799'; g.beginPath(); g.arc(px, TOPM + 12, 8, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(px - 4, TOPM + 8); g.lineTo(px + 4, TOPM + 16); g.moveTo(px + 4, TOPM + 8); g.lineTo(px - 4, TOPM + 16); g.stroke(); }
      });
      g.font = `700 12px ${ML.fonts.body}`; g.fillStyle = C.good; g.textAlign = 'center'; PUMPS.forEach(px => { g.fillText(mode === 'reuptake' ? 'pump' : 'reuptake', px, TOPM - 34); g.fillText(mode === 'reuptake' ? 'BLOCKED' : 'pump', px, TOPM - 21); });
      // cleft label
      g.fillStyle = C.muted; g.font = `700 13px ${ML.fonts.body}`; g.textAlign = 'right'; g.fillText('synapse', W - 8, (TOPM + BOTM) / 2 + 4);
      // receptors
      rec.forEach(r => {
        const on = r.act > 0;
        g.fillStyle = on ? C.good : r.by ? '#7D8799' : C.carolina; g.globalAlpha = 1;
        g.beginPath(); g.moveTo(r.x - 13, BOTM - 14); g.lineTo(r.x - 13, BOTM + 8); g.lineTo(r.x + 13, BOTM + 8); g.lineTo(r.x + 13, BOTM - 14); g.lineTo(r.x + 7, BOTM - 14); g.lineTo(r.x + 7, BOTM - 4); g.lineTo(r.x - 7, BOTM - 4); g.lineTo(r.x - 7, BOTM - 14); g.closePath(); g.fill();
        if (on) { g.strokeStyle = C.good; g.lineWidth = 2; g.globalAlpha = 0.5; g.beginPath(); g.arc(r.x, BOTM + 10, 16, 0.2, Math.PI - 0.2); g.stroke(); g.globalAlpha = 1; }
      });
      // enzymes
      enz.forEach(e => { const m = 0.35 + Math.abs(Math.sin(time * 6)) * 0.35; g.fillStyle = C.warn; g.beginPath(); g.moveTo(e.x, e.y); g.arc(e.x, e.y, 10, (e.vx > 0 ? 0 : Math.PI) + m, (e.vx > 0 ? 0 : Math.PI) - m + Math.PI * 2); g.closePath(); g.fill(); });
      // molecules
      nts.forEach(m => { g.fillStyle = C.spark; g.beginPath(); g.arc(m.x, m.y, 4.5, 0, 7); g.fill(); });
      drugs.forEach(d => {
        if (d.kind === 'ag') { g.fillStyle = '#8B6CF0'; g.beginPath(); g.moveTo(d.x, d.y - 6.5); g.lineTo(d.x + 6.5, d.y); g.lineTo(d.x, d.y + 6.5); g.lineTo(d.x - 6.5, d.y); g.closePath(); g.fill(); }
        else { g.fillStyle = '#7D8799'; roundRect(d.x - 6, d.y - 6, 12, 12, 2.5); g.fill(); }
      });
      frags.forEach(f => { g.globalAlpha = Math.max(0, f.a); g.fillStyle = C.spark; g.fillRect(f.x - 1.5, f.y - 1.5, 3, 3); }); g.globalAlpha = 1;
    }
    function roundRect(x, y, w, hh, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); const ioT = setTimeout(() => io.observe(root), 80);
    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!vis) return;
      let rem = dt; while (rem > 0) { const d = Math.min(rem, 1 / 90); step(d); rem -= d; }
      if (++ct % 30 === 0) readColors();
      draw();
      const recent = hist.slice(-100), avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
      const pct = Math.round(avg * 100);
      modeTime += dt;
      if (modeTime > 8 && readVals[mode] == null) {
        readVals[mode] = pct; reads.querySelectorAll('.pill').forEach(x => x.remove());
        Object.keys(MODES).forEach(k => { if (readVals[k] != null) reads.append(h('span', { class: 'pill' + (k === 'antagonist' ? '' : k === 'normal' ? ' blue' : ' spark') }, `${MODES[k][0]}: ${readVals[k]}`)); });
        if (Object.keys(readVals).length === 4) { api.addXP(3); sfx.level(); }
      }
      fill.style.width = pct + '%'; val.textContent = pct; meter.querySelector('.syn-bar').setAttribute('aria-valuenow', pct);
    }
    setMode('normal');
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(ioT); io.disconnect(); };
  }
});
})();
