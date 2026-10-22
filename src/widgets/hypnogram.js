/* hypnogram: an interactive night of sleep. Scrub or play through ~8 hours; see the stage, a live EEG trace,
   body state, and what can happen in each stage. REM rebound toggle shows a night after REM deprivation. Uses ML.w2. */
(function () {
'use strict';
// [stage, minutes, wave override]
const NORMAL = [['W', 6, 'beta'], ['W', 8, 'alpha'], ['N1', 6], ['N2', 14], ['N3', 38], ['N2', 10], ['R', 8],
  ['N2', 18], ['N3', 34], ['N2', 16], ['R', 18], ['W', 2, 'alpha'],
  ['N1', 2], ['N2', 30], ['N3', 14], ['N2', 22], ['R', 22],
  ['N2', 50], ['R', 28], ['W', 2, 'alpha'],
  ['N1', 3], ['N2', 52], ['R', 34],
  ['N2', 20], ['R', 16], ['W', 7, 'beta']];
const REBOUND = [['W', 5, 'beta'], ['W', 6, 'alpha'], ['N1', 4], ['N2', 10], ['N3', 30], ['N2', 6], ['R', 18],
  ['N2', 14], ['N3', 24], ['N2', 8], ['R', 26],
  ['N2', 18], ['N3', 10], ['N2', 10], ['R', 32], ['W', 2, 'alpha'],
  ['N1', 2], ['N2', 40], ['R', 40],
  ['N2', 38], ['R', 44],
  ['N2', 40], ['R', 46], ['W', 7, 'beta']];
const INFO = {
  beta: { name: 'Awake and alert', wave: 'Beta waves: fast and small. A busy, alert brain.', eyes: 'Open and moving', mus: 'Normal muscle tone', body: 'Normal heart rate and breathing', hap: ['Thinking, talking, scrolling your phone'] },
  alpha: { name: 'Awake but relaxed', wave: 'Alpha waves: slower and regular. Calm, eyes closed, drifting off.', eyes: 'Closed', mus: 'Relaxing', body: 'Heart rate starting to slow', hap: ['Lying in bed, winding down', 'Brief awakenings during the night are normal; you usually don’t remember them'] },
  N1: { name: 'NREM Stage 1 (light sleep)', wave: 'Theta waves: alpha fades into slower, irregular theta waves.', eyes: 'Slow rolling', mus: 'Relaxing; occasional twitches', body: 'Breathing slows', hap: ['Hypnagogic sensations: a feeling of falling, flashes of images, hearing your name', 'Hypnic jerk: a sudden full-body twitch', 'Very easy to wake: you might insist you were not asleep'] },
  N2: { name: 'NREM Stage 2', wave: 'Sleep spindles (quick bursts) and K-complexes (big single spikes) on a theta background.', eyes: 'Still', mus: 'Relaxed', body: 'Heart rate and body temperature drop', hap: ['About half of the night is spent here', 'Harder to wake than Stage 1', 'Sleep spindles help lock in new learning'] },
  N3: { name: 'NREM Stage 3 (deep sleep)', wave: 'Delta waves: large and slow.', eyes: 'Still', mus: 'Relaxed, but you CAN move (no paralysis)', body: 'Slowest heart rate and breathing; growth hormone released for body repair', hap: ['Hardest stage to wake from (groggy and confused if woken)', 'Sleepwalking (somnambulism) and sleep talking', 'Night terrors (mostly kids; not remembered)', 'Bed-wetting (enuresis)'] },
  R: { name: 'REM sleep', wave: 'Fast, irregular waves that look almost awake: “paradoxical sleep.”', eyes: 'Rapid eye movements under the eyelids', mus: 'Paralyzed (except eyes and breathing muscles)', body: 'Heart rate and breathing speed up and become irregular', hap: ['Vivid, story-like dreams and nightmares', 'Memory consolidation, especially skills learned that day', 'If the paralysis fails: REM sleep behavior disorder (acting out dreams)'] }
};
const WAVE = { W: 'beta', N1: 'theta', N2: 'n2', N3: 'delta', R: 'rem' };
const START = 23 * 60; // 11 PM
const clock = m => { let t = (START + m) % 1440; const H = Math.floor(t / 60), M = Math.floor(t % 60); const ap = H < 12 ? 'AM' : 'PM'; return `${H % 12 || 12}:${String(M).padStart(2, '0')} ${ap}`; };

ML.w2.css('hypnogram-css', `
.hyp-chart { width: 100%; max-width: 640px; margin: 0 auto; height: auto; display: block; touch-action: none; user-select: none; cursor: ew-resize; }
.hyp-chart:focus-visible { outline: 3px solid var(--carolina); outline-offset: 2px; border-radius: 8px; }
.hyp-lv { fill: var(--muted); font: 700 14px var(--f-mono); }
.hyp-ax { fill: var(--muted); font: 700 13px var(--f-mono); }
.hyp-grid { stroke: var(--line); stroke-width: 1; }
.hyp-path { fill: none; stroke: var(--carolina); stroke-width: 2.4; stroke-linejoin: round; }
.hyp-rem { stroke: var(--spark); stroke-width: 7; stroke-linecap: round; }
.hyp-n3 { fill: #9B7BEA; opacity: .18; }
.hyp-cyc { fill: var(--muted); font: 700 12px var(--f-mono); }
.hyp-ctrl { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; }
.hyp-grid2 { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
@media (max-width: 640px) { .hyp-grid2 { grid-template-columns: 1fr; } }
.hyp-stage { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.hyp-badge { font: 400 22px var(--f-display); letter-spacing: .02em; color: var(--carolina); }
.hyp-badge.R { color: var(--spark); } .hyp-badge.N3 { color: #9B7BEA; }
.hyp-time { font-family: var(--f-mono); font-weight: 700; color: var(--muted); }
.hyp-wave { font-size: 14.5px; color: var(--muted); }
.hyp-sleeper { width: 100%; height: auto; display: block; border-radius: 12px; }
.hyp-kv { display: grid; grid-template-columns: 88px 1fr; gap: 4px 10px; font-size: 14.5px; }
.hyp-kv b { color: var(--muted); font-family: var(--f-mono); font-size: 12px; letter-spacing: .05em; text-transform: uppercase; padding-top: 2px; }
.hyp-tot { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.hyp-tot div { background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; padding: 6px; text-align: center; font-size: 12px; font-weight: 700; color: var(--muted); }
.hyp-tot b { display: block; font-family: var(--f-mono); font-size: 15px; color: var(--ink); }
.hyp-z { fill: var(--carolina); font: 400 16px var(--f-display); opacity: 0; }
`);

ML.registerWidget('hypnogram', {
  title: 'A night of sleep', tag: 'Simulation',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    let night = NORMAL, minute = 60, playing = false;
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Drag across the chart (or press Play) to move through the night. Watch the brain waves and body change.');
    const play = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Play');
    const reb = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, 'REM rebound night');
    const chart = S('svg', { class: 'hyp-chart', viewBox: '0 0 440 196', tabindex: '0', role: 'slider', 'aria-label': 'Time of night', 'aria-valuemin': '0', 'aria-valuemax': '480' });
    const range = h('input', { type: 'range', min: '0', max: '479', value: String(minute), 'aria-label': 'Time of night (scrubber)' });
    const badge = h('div', { class: 'hyp-badge' }), timeEl = h('div', { class: 'hyp-time' });
    const eeg = W2.eegCanvas({ height: 86, secs: 3, reduceMotion: api.reduceMotion, label: 'Live EEG for the current sleep stage' });
    const waveTxt = h('div', { class: 'hyp-wave' });
    const sleeper = S('svg', { class: 'hyp-sleeper', viewBox: '0 0 260 120', role: 'img', 'aria-label': 'Sleeper' });
    const kv = h('div', { class: 'hyp-kv' });
    const hap = h('div', { class: 'w2-kv' });
    const tot = h('div', { class: 'hyp-tot' });
    const rebNote = h('div', { class: 'w2-fb warn', hidden: true }, h('strong', null, 'REM rebound: '), 'after nights of too little REM (from stress, alcohol, some drugs, or cutting sleep short), the brain makes up for it. REM arrives sooner, comes more often, and lasts longer. Dreams can be extra vivid, even nightmares.');
    root.append(inst, h('div', { class: 'w2-row' }, play, reb), h('div', { class: 'w2-panel', style: { padding: '10px 10px 6px' } }, chart, h('div', { class: 'hyp-ctrl' }, h('span', { class: 'w2-tag' }, 'Scrub'), range)), rebNote,
      h('div', { class: 'hyp-grid2' },
        h('div', { class: 'w2-panel', 'aria-live': 'polite' }, h('div', { class: 'hyp-stage' }, badge, timeEl), eeg.el, waveTxt),
        h('div', { class: 'w2-panel' }, sleeper, kv)),
      h('div', { class: 'w2-panel' }, hap), h('div', null, h('div', { class: 'w2-tag', style: { marginBottom: '6px' } }, 'Minutes in each stage tonight'), tot));
    el.append(root);

    /* ---- chart ---- */
    const X0 = 58, X1 = 430, YL = { W: 22, R: 50, N1: 78, N2: 106, N3: 134 };
    const xm = m => X0 + (m / 480) * (X1 - X0);
    const gBase = S('g', null, chart), gNight = S('g', null, chart), gHead = S('g', null, chart);
    Object.entries(YL).forEach(([k, y]) => { S('line', { class: 'hyp-grid', x1: X0, y1: y, x2: X1, y2: y }, gBase); const t = S('text', { class: 'hyp-lv', x: 4, y: y + 4 }, gBase); t.textContent = k === 'W' ? 'Awake' : k === 'R' ? 'REM' : k; });
    for (let hr = 0; hr <= 8; hr += 2) { const t = S('text', { class: 'hyp-ax', x: xm(hr * 60), y: 160, 'text-anchor': hr === 0 ? 'start' : hr === 8 ? 'end' : 'middle' }, gBase); t.textContent = clock(hr * 60).replace(':00', ''); }
    for (let c = 1; c <= 5; c++) { const x = xm(c * 90); if (c < 5) S('line', { x1: x, y1: 14, x2: x, y2: 140, style: 'stroke:var(--muted);stroke-dasharray:2 4;opacity:.5' }, gBase); }
    const cyc = S('text', { class: 'hyp-cyc', x: X0, y: 180 }, gBase); cyc.textContent = 'Dashed lines: every ~90 min = one cycle';
    const head = S('line', { x1: 0, y1: 10, x2: 0, y2: 146, style: 'stroke:var(--ink);stroke-width:2' }, gHead);
    const headDot = S('circle', { r: 6.5, style: 'fill:var(--ink);stroke:var(--surface);stroke-width:2' }, gHead);
    function segs() { let t = 0; return night.map(([st, m, w]) => { const s = { st, m, w, a: t, b: t + m }; t += m; return s; }); }
    let SEG = segs();
    function drawNight() {
      SEG = segs(); gNight.innerHTML = '';
      SEG.filter(s => s.st === 'N3').forEach(s => S('rect', { class: 'hyp-n3', x: xm(s.a), y: 14, width: xm(s.b) - xm(s.a), height: 126 }, gNight));
      let d = ''; SEG.forEach((s, i) => { const y = YL[s.st]; d += (i ? `L${xm(s.a)},${y}` : `M${xm(s.a)},${y}`) + `L${xm(s.b)},${y}`; });
      S('path', { class: 'hyp-path', d }, gNight);
      SEG.filter(s => s.st === 'R').forEach(s => S('line', { class: 'hyp-rem', x1: xm(s.a) + 2, y1: YL.R, x2: xm(s.b) - 2, y2: YL.R }, gNight));
      const totals = { W: 0, N1: 0, N2: 0, N3: 0, R: 0 }; SEG.forEach(s => totals[s.st] += s.m);
      tot.innerHTML = '';
      [['W', 'Awake'], ['N1', 'N1'], ['N2', 'N2'], ['N3', 'N3'], ['R', 'REM']].forEach(([k, l]) => tot.append(h('div', null, h('b', { style: k === 'R' ? { color: 'var(--spark)' } : null }, totals[k]), l)));
    }

    /* ---- sleeper illustration ---- */
    S('rect', { x: 0, y: 0, width: 260, height: 120, style: 'fill:var(--carolina-soft)' }, sleeper);
    S('rect', { x: 14, y: 70, width: 232, height: 16, rx: 6, style: 'fill:#8D6B4F' }, sleeper);
    S('rect', { x: 14, y: 52, width: 12, height: 50, rx: 4, style: 'fill:#7A5A40' }, sleeper);
    S('rect', { x: 30, y: 52, width: 46, height: 20, rx: 10, style: 'fill:#fff;stroke:#c9d4e2' }, sleeper);
    const headG = S('g', null, sleeper);
    S('circle', { cx: 60, cy: 50, r: 16, style: 'fill:#F2C7A5;stroke:#8a5a3c;stroke-width:1.4' }, headG);
    S('path', { d: 'M45,44 C48,30 70,28 76,42 C70,38 56,38 45,44 Z', style: 'fill:#4a3424' }, headG);
    const eyeLid = S('path', { d: 'M62,48 Q67,51 72,48', style: 'fill:none;stroke:#3a2a20;stroke-width:1.8;stroke-linecap:round' }, headG);
    const eyeOpen = S('g', null, headG); S('ellipse', { cx: 67, cy: 48, rx: 4.2, ry: 3, style: 'fill:#fff;stroke:#3a2a20' }, eyeOpen); const pupil = S('circle', { cx: 68, cy: 48, r: 1.7, style: 'fill:#12233B' }, eyeOpen);
    const remDot = S('circle', { cx: 67, cy: 47, r: 1.6, style: 'fill:#3a2a20' }, headG);
    const blanket = S('path', { d: 'M72,58 C110,40 200,44 240,58 L240,72 L72,72 Z', style: 'fill:#4B9CD3;stroke:#2F7FB8;stroke-width:1.5' }, sleeper);
    const arm = S('path', { d: 'M100,56 C112,52 126,54 136,58', style: 'fill:none;stroke:#F2C7A5;stroke-width:7;stroke-linecap:round' }, sleeper);
    const phone = S('rect', { x: 84, y: 30, width: 12, height: 20, rx: 2, style: 'fill:#12233B;stroke:#7CC0EE;stroke-width:1.5' }, sleeper);
    const zs = [0, 1, 2].map(i => { const t = S('text', { class: 'hyp-z', x: 82 + i * 14, y: 34 - i * 10, style: `font-size:${12 + i * 4}px` }, sleeper); t.textContent = 'Z'; return t; });
    const lock = S('g', null, sleeper);
    S('rect', { x: 180, y: 12, width: 72, height: 22, rx: 11, style: 'fill:var(--spark)' }, lock);
    const lockT = S('text', { x: 216, y: 27, 'text-anchor': 'middle', style: 'fill:#fff;font:700 11px var(--f-mono)' }, lock); lockT.textContent = 'PARALYZED';
    const heartG = S('g', { transform: 'translate(150,80)' }, sleeper);
    const heart = S('path', { d: 'M18,20 C18,14 26,12 28,18 C30,12 38,14 38,20 C38,27 28,32 28,32 C28,32 18,27 18,20 Z', style: 'fill:#E5485F' }, heartG);
    const bpm = S('text', { x: 44, y: 27, style: 'fill:var(--ink);font:700 12px var(--f-mono)' }, heartG);

    /* ---- state ---- */
    let cur = null;
    function segAt(m) { return SEG.find(s => m >= s.a && m < s.b) || SEG[SEG.length - 1]; }
    function update() {
      const s = segAt(minute);
      const key = s.st === 'W' ? (s.w || 'beta') : s.st;
      head.setAttribute('x1', xm(minute)); head.setAttribute('x2', xm(minute));
      headDot.setAttribute('cx', xm(minute)); headDot.setAttribute('cy', YL[s.st]);
      chart.setAttribute('aria-valuenow', String(Math.round(minute))); chart.setAttribute('aria-valuetext', `${clock(minute)}, ${INFO[key].name}`);
      range.value = String(Math.round(minute));
      const cycle = Math.min(5, Math.floor(minute / 90) + 1);
      timeEl.textContent = `${clock(minute)} · cycle ${cycle}`;
      if (cur === key + s.a) return;
      cur = key + s.a;
      const inf = INFO[key];
      badge.textContent = s.st === 'W' ? 'Awake' : s.st === 'R' ? 'REM' : s.st.replace('N', 'NREM ');
      badge.className = 'hyp-badge ' + s.st;
      eeg.setType(s.st === 'W' ? (s.w || 'beta') : WAVE[s.st]);
      waveTxt.textContent = inf.wave;
      kv.innerHTML = '';
      [['Stage', inf.name], ['Eyes', inf.eyes], ['Muscles', inf.mus], ['Body', inf.body]].forEach(([k, v]) => kv.append(h('b', null, k), h('span', null, v)));
      hap.innerHTML = ''; hap.append(h('b', null, 'What can happen here'), h('ul', null, inf.hap.map(x => h('li', null, x))));
      // sleeper
      const awake = s.st === 'W', alert = awake && key === 'beta';
      eyeOpen.style.display = alert ? '' : 'none'; eyeLid.style.display = alert ? 'none' : '';
      phone.style.display = alert ? '' : 'none';
      remDot.style.display = s.st === 'R' ? '' : 'none';
      lock.style.display = s.st === 'R' ? '' : 'none';
      arm.style.display = alert ? '' : 'none';
      zs.forEach((z, i) => z.style.opacity = awake ? 0 : s.st === 'N1' ? (i ? 0 : .7) : s.st === 'N2' ? (i < 2 ? .8 : 0) : 1);
      bpm.textContent = { W: '~70 bpm', N1: '~64 bpm', N2: '~60 bpm', N3: '~55 bpm', R: 'irregular' }[s.st];
      if (s.st === 'R' && !api.reduceMotion) api.sfx.tone(880, .05, 'sine', .03);
    }
    /* small per-frame animation for eyes and heart */
    const loop = W2.loop(root, (dt, t) => {
      const s = segAt(minute);
      if (s.st === 'R') { const x = 67 + Math.sin(t / 90) * 3 * (Math.sin(t / 700) > -0.2 ? 1 : 0.2); remDot.setAttribute('cx', x.toFixed(2)); }
      const rate = { W: 1.15, N1: 1.05, N2: 1, N3: .9, R: 1.25 + .3 * Math.sin(t / 900) }[s.st];
      const b = api.reduceMotion ? 1 : 1 + 0.12 * Math.max(0, Math.sin(t / 1000 * rate * Math.PI * 2)) ** 8;
      heart.setAttribute('transform', `translate(28,22) scale(${b.toFixed(3)}) translate(-28,-22)`);
      if (playing) { minute += dt * 12; if (minute >= 479) { minute = 479; stopPlay(); } update(); }
      if (!api.reduceMotion) zs.forEach((z, i) => z.setAttribute('transform', `translate(0,${(-((t / 1000 + i * .4) % 1.6) * 6).toFixed(1)})`));
    });
    function stopPlay() { playing = false; play.textContent = 'Play'; }
    play.addEventListener('click', () => { if (playing) stopPlay(); else { if (minute >= 478) minute = 0; playing = true; play.textContent = 'Pause'; api.sfx.tap(); } });
    reb.addEventListener('click', () => { const on = reb.getAttribute('aria-pressed') !== 'true'; reb.setAttribute('aria-pressed', String(on)); night = on ? REBOUND : NORMAL; rebNote.hidden = !on; cur = null; drawNight(); update(); api.sfx.flip(); });
    range.addEventListener('input', () => { stopPlay(); minute = +range.value; update(); });
    let drag = false;
    const fromEvt = e => { const r = chart.getBoundingClientRect(); const x = (e.clientX - r.left) * 440 / r.width; minute = Math.max(0, Math.min(479, (x - X0) / (X1 - X0) * 480)); update(); };
    chart.addEventListener('pointerdown', e => { drag = true; chart.setPointerCapture(e.pointerId); stopPlay(); fromEvt(e); });
    chart.addEventListener('pointermove', e => { if (drag) fromEvt(e); });
    chart.addEventListener('pointerup', () => drag = false); chart.addEventListener('pointercancel', () => drag = false);
    chart.addEventListener('keydown', e => { const st = { ArrowRight: 5, ArrowLeft: -5, PageUp: 30, PageDown: -30, Home: -999, End: 999 }[e.key]; if (st) { e.preventDefault(); stopPlay(); minute = Math.max(0, Math.min(479, minute + st)); update(); } });
    drawNight(); update();
    return () => { loop.stop(); eeg.stop(); bag.destroy(); };
  }
});
})();
