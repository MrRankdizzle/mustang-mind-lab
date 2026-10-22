/* brain-scans: compare EEG, fMRI, PET, CT, MEG, and lesion studies with animated visuals,
   a "when vs. where" chart, and a "Pick the tool" quiz. Uses ML.w2. */
(function () {
'use strict';
const TOOLS = {
  eeg: { name: 'EEG', short: 'electrical activity (brain waves) with great timing', full: 'Electroencephalogram', kind: 'Function', col: '#4B9CD3',
    measures: 'Electrical activity (brain waves) picked up by electrodes on the scalp.',
    good: 'Excellent timing: tracks changes millisecond by millisecond. Cheap, safe, and portable.',
    bad: 'Poor location: it cannot pinpoint exactly where (especially deep inside) the activity comes from.',
    use: 'Sleep stages, seizures (epilepsy), brain waves during a task.' },
  fmri: { name: 'fMRI', short: 'WHERE activity is, by tracking blood flow', full: 'Functional magnetic resonance imaging', kind: 'Function', col: '#E5485F',
    measures: 'Blood flow: active areas pull in more oxygen-rich blood, and the scanner detects it.',
    good: 'Good location: shows WHERE the brain is active, down to a few millimeters. No radiation.',
    bad: 'Slower: blood flow lags a few seconds behind neurons. Loud, expensive, and you must lie still.',
    use: 'Which areas work while reading, seeing faces, or feeling emotions. (A regular MRI shows structure.)' },
  pet: { name: 'PET', short: 'where radioactive glucose is used', full: 'Positron emission tomography', kind: 'Function', col: '#F2A33A',
    measures: 'Where radioactive glucose (sugar) is used up. Busy neurons burn more fuel, so they glow.',
    good: 'Shows brain activity and even brain chemistry (like dopamine).',
    bad: 'Needs a radioactive injection. Slower and blurrier than fMRI.',
    use: 'Activity during tasks, Alzheimer’s disease, comparing brains with and without a disorder.' },
  ct: { name: 'CT', short: 'brain STRUCTURE with X-ray slices', full: 'Computerized (axial) tomography, a CAT scan', kind: 'Structure', col: '#8A97A8',
    measures: 'X-ray images taken in slices around the head, stacked into a picture of brain structure.',
    good: 'Fast and widely available. Great for spotting bleeding, tumors, and skull fractures.',
    bad: 'Shows structure only, not activity. Uses X-ray radiation. Less detailed than MRI.',
    use: 'Emergency rooms: strokes, head injuries, tumors.' },
  meg: { name: 'MEG', short: 'magnetic fields from firing neurons', full: 'Magnetoencephalography', kind: 'Function', col: '#9B7BEA',
    measures: 'The tiny magnetic fields produced by neurons firing.',
    good: 'Excellent timing like EEG, with better location.',
    bad: 'Very expensive. Needs a magnetically shielded room.',
    use: 'Finding where seizures start; tracking fast brain responses to sounds or sights.' },
  lesion: { name: 'Lesion study', short: 'what is lost after brain damage', full: 'Studying natural or experimental brain damage', kind: 'Function (by what is lost)', col: '#3FA676',
    measures: 'What a person or animal can no longer do after part of the brain is damaged (stroke, injury, surgery, or animal research).',
    good: 'Shows an area is NEEDED for a function: a cause-and-effect clue.',
    bad: 'Damage in humans cannot be controlled and is rarely tidy. Every brain is a little different.',
    use: 'Phineas Gage, Broca’s patients, split-brain patients, hemispherectomy, animal ablation studies.' }
};
const ORDER = ['eeg', 'fmri', 'pet', 'ct', 'meg', 'lesion'];
const QUIZ = [
  { q: 'Which brain areas light up while a student reads a paragraph?', a: 'fmri', why: 'fMRI tracks blood flow to show WHERE activity happens during a task.' },
  { q: 'Track a sleeper’s stages minute by minute all night long.', a: 'eeg', why: 'Sleep stages are defined by brain-wave patterns, and EEG has excellent timing.' },
  { q: 'Quickly check an ER patient for bleeding or a tumor after a car crash.', a: 'ct', why: 'CT uses X-ray slices to show structure fast.' },
  { q: 'See which areas burn the most glucose while someone solves math problems.', a: 'pet', why: 'PET tracks radioactive glucose: busy neurons use more fuel.' },
  { q: 'Measure the magnetic fields of firing neurons to find where a seizure starts, millisecond by millisecond.', a: 'meg', why: 'MEG measures magnetic fields with excellent timing and decent location.' },
  { q: 'After a stroke damaged part of the left frontal lobe, a patient cannot speak fluently. What kind of evidence is this?', a: 'lesion', why: 'Learning from damaged tissue is a lesion study (here, Broca’s area).' },
  { q: 'Catch the electrical spikes of an epileptic seizure the instant they happen.', a: 'eeg', why: 'EEG records electrical activity in real time.' },
  { q: 'Show WHERE the brain is active, within millimeters, with no radiation.', a: 'fmri', why: 'fMRI has good spatial detail and uses magnets, not radiation.' },
  { q: 'Researchers destroy a tiny area of a rat’s hypothalamus, and the rat starts overeating.', a: 'lesion', why: 'Experimentally damaging tissue (an ablation) is a lesion study.' },
  { q: 'Take a picture of brain STRUCTURE using X-rays.', a: 'ct', why: 'CT = X-ray slices = structure.' }
];

ML.w2.css('brain-scans-css', `
.bsc-tabs { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
@media (max-width: 620px) { .bsc-tabs { grid-template-columns: repeat(3, 1fr); } }
.bsc-tab { border: 1.5px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 8px 6px; cursor: pointer; font-weight: 700; font-size: 15px; display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--ink); min-height: 48px; }
.bsc-tab small { font-size: 11px; color: var(--muted); font-weight: 700; font-family: var(--f-mono); letter-spacing: .04em; }
.bsc-tab[aria-selected="true"] { border-color: var(--carolina); background: var(--carolina-soft); box-shadow: inset 0 -3px 0 var(--carolina); }
.bsc-tab:hover { border-color: var(--carolina); }
.bsc-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
@media (max-width: 620px) { .bsc-card { grid-template-columns: 1fr; } }
.bsc-vis { background: #0B1222; border-radius: 14px; overflow: hidden; }
.bsc-vis svg { width: 100%; height: auto; display: block; }
.bsc-badge { display: inline-block; border-radius: 99px; padding: 2px 10px; font-size: 12px; font-weight: 700; font-family: var(--f-mono); letter-spacing: .04em; }
.bsc-badge.f { background: var(--spark-soft); color: var(--spark); }
.bsc-badge.s { background: var(--carolina-soft); color: var(--carolina); }
.bsc-pro b, .bsc-con b { font-family: var(--f-mono); font-size: 12px; letter-spacing: .06em; text-transform: uppercase; display: block; }
.bsc-pro b { color: var(--good); } .bsc-con b { color: var(--bad); }
.bsc-chart { width: 100%; max-width: 440px; height: auto; display: block; margin: 0 auto; }
.bsc-ax { stroke: var(--muted); stroke-width: 1.5; fill: none; }
.bsc-axt { fill: var(--muted); font: 700 13px var(--f-mono); letter-spacing: .03em; }
.bsc-pt text { fill: var(--ink); font: 700 17px var(--f-body); }
.bsc-pt circle { stroke: var(--surface); stroke-width: 2; transition: r .2s; }
.bsc-pt { cursor: pointer; }
.bsc-pt.on circle { stroke: var(--ink); stroke-width: 3; }
.bsc-qbtns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.bsc-qbtns .btn { padding: 9px 6px; font-size: 15px; }
.bsc-qbtns .btn.right { border-color: var(--good); background: var(--good-soft); color: var(--good); opacity: 1; }
.bsc-qbtns .btn.wrong { border-color: var(--bad); background: var(--bad-soft); color: var(--bad); }
.bsc-h { font-weight: 700; font-size: 17px; margin: 4px 0 0; }
.bsc-ring { animation: bscDash 1.4s linear infinite; }
@keyframes bscDash { to { stroke-dashoffset: -24; } }
.reduce-motion .bsc-ring { animation: none; }
`);

ML.registerWidget('brain-scans', {
  title: 'How do we study the brain?', tag: 'Compare + quiz',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    let cur = 'eeg';
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Tap each tool to see what it measures. Then try “Pick the tool” below.');
    const tabs = h('div', { class: 'bsc-tabs', role: 'tablist', 'aria-label': 'Brain research tools' });
    const tabEls = {};
    ORDER.forEach(id => {
      const t = TOOLS[id];
      const b = h('button', { type: 'button', role: 'tab', class: 'bsc-tab', 'aria-selected': 'false', id: W2.uid('bsc-tab') }, id === 'lesion' ? 'Lesion' : t.name, h('small', null, t.kind.startsWith('Structure') ? 'STRUCTURE' : 'FUNCTION'));
      b.addEventListener('click', () => show(id));
      b.addEventListener('keydown', e => { const i = ORDER.indexOf(id); if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = ORDER[(i + (e.key === 'ArrowRight' ? 1 : -1) + ORDER.length) % ORDER.length]; show(n); tabEls[n].focus(); } });
      tabEls[id] = b; tabs.append(b);
    });
    const vis = h('div', { class: 'bsc-vis' });
    const info = h('div', { class: 'w2-panel', role: 'tabpanel' });
    const card = h('div', { class: 'bsc-card' }, vis, info);
    // when vs where chart
    const chart = S('svg', { class: 'bsc-chart', viewBox: '0 0 360 236', role: 'group', 'aria-label': 'Chart: timing versus location precision of each tool' });
    const chartBox = h('div', { class: 'w2-panel' }, h('div', { class: 'w2-tag' }, 'When vs. where'), chart,
      h('p', { class: 'muted', style: { margin: 0, fontSize: '14px' } }, 'CT shows structure only (no activity), and lesion studies work by what is lost, so they are not on this chart.'));
    const quiz = h('div', { class: 'w2-panel', 'aria-live': 'polite' });
    root.append(inst, tabs, card, chartBox, h('h3', { class: 'bsc-h' }, 'Pick the tool'), quiz);
    el.append(root);

    /* chart */
    S('path', { class: 'bsc-ax', d: 'M34,12 L34,190 L352,190' }, chart);
    const ax1 = S('text', { class: 'bsc-axt', x: 193, y: 228, 'text-anchor': 'middle' }, chart); ax1.textContent = 'WHEN (timing) →';
    const ax2 = S('text', { class: 'bsc-axt', x: 22, y: 100, 'text-anchor': 'middle', transform: 'rotate(-90 22 100)' }, chart); ax2.textContent = 'WHERE (location) →';
    const lo = S('text', { class: 'bsc-axt', x: 38, y: 207 }, chart); lo.textContent = 'seconds+';
    const hi = S('text', { class: 'bsc-axt', x: 352, y: 207, 'text-anchor': 'end' }, chart); hi.textContent = 'milliseconds';
    const PTS = { eeg: [0.93, 0.14], meg: [0.9, 0.55], fmri: [0.36, 0.86], pet: [0.1, 0.58] };
    const ptEls = {};
    Object.entries(PTS).forEach(([id, [x, y]]) => {
      const px = 34 + 18 + x * 280, py = 190 - 12 - y * 150;
      const g = S('g', { class: 'bsc-pt', tabindex: '0', role: 'button', 'aria-label': `${TOOLS[id].name}: timing ${x > .6 ? 'excellent' : 'slow'}, location ${y > .6 ? 'good' : y > .4 ? 'fair' : 'poor'}` }, chart);
      S('circle', { cx: px, cy: py, r: 11, style: `fill:${TOOLS[id].col}` }, g);
      const t = S('text', { x: px + (x > .8 ? -16 : 16), y: py + 5, 'text-anchor': x > .8 ? 'end' : 'start' }, g); t.textContent = TOOLS[id].name;
      g.addEventListener('click', () => show(id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(id); } });
      ptEls[id] = g;
    });

    /* visuals */
    let draw = null; // per-frame updater for the current visual
    const brainPath = (tx, ty, s) => ({ d: W2.LAT_OUT, transform: `translate(${tx},${ty}) scale(${s})` });
    function buildVis(id) {
      vis.innerHTML = ''; draw = null;
      const svg = S('svg', { viewBox: '0 0 320 220', role: 'img', 'aria-label': `${TOOLS[id].name} animation` });
      vis.append(svg);
      const txt = (x, y, s, opt = {}) => { const t = S('text', Object.assign({ x, y, style: `fill:${opt.fill || '#8EA0C4'};font:700 ${opt.size || 12}px var(--f-mono);letter-spacing:.05em` }, opt.a || {}), svg); t.textContent = s; return t; };
      if (id === 'eeg') {
        S('circle', { cx: 52, cy: 104, r: 40, style: 'fill:#1B2A47;stroke:#7CC0EE;stroke-width:2' }, svg);
        S('path', { d: 'M90,96 L100,104 L90,110', style: 'fill:none;stroke:#7CC0EE;stroke-width:2' }, svg);
        const el2 = [[30, 80], [52, 70], [74, 80], [26, 104], [52, 100], [78, 104], [34, 128], [56, 132]];
        el2.forEach(([x, y]) => { S('circle', { cx: x, cy: y, r: 4.5, style: 'fill:#FFD166;stroke:#0B1222' }, svg); });
        const lines = [0, 1, 2].map(k => { S('path', { d: `M${78},${104} C110,${104} 110,${60 + k * 50} 128,${60 + k * 50}`, style: 'fill:none;stroke:#24325A;stroke-width:1.5' }, svg); return S('path', { style: `fill:none;stroke:${['#7CC0EE', '#35E3A7', '#FF6B81'][k]};stroke-width:1.8;stroke-linejoin:round` }, svg); });
        txt(130, 30, 'BRAIN WAVES (LIVE)');
        txt(130, 212, 'timing: ms  ·  location: fuzzy', { size: 10 });
        const types = ['beta', 'alpha', 'theta'];
        draw = (t) => { lines.forEach((p, k) => { let d = ''; for (let x = 0; x <= 180; x += 2) { const tt = t / 1000 - (180 - x) / 90; const y = 60 + k * 50 - W2.eeg(types[k], tt) * 20; d += (x ? 'L' : 'M') + (130 + x) + ',' + y.toFixed(1); } p.setAttribute('d', d); }); };
      }
      if (id === 'fmri' || id === 'lesion') {
        const g = S('g', null, svg);
        const tf = 'translate(10,6) scale(0.74)';
        S('path', { d: 'M205,212 C211,240 214,262 214,298 L247,298 C245,270 249,246 264,224 C252,214 226,208 205,212 Z', transform: tf, style: 'fill:#4E596A;stroke:#AFC0D6;stroke-width:2.5' }, g);
        S('path', { d: 'M248,214 C252,195 296,188 330,189 C360,191 372,210 362,231 C350,252 298,258 267,247 C252,241 245,227 248,214 Z', transform: tf, style: 'fill:#5B6779;stroke:#AFC0D6;stroke-width:2.5' }, g);
        S('path', Object.assign({ style: 'fill:#6E7B8E;stroke:#AFC0D6;stroke-width:2.5' }, brainPath(10, 6, 0.74)), g);
        ['M66,92 C92,80 118,86 138,70', 'M56,124 C82,112 106,118 126,102', 'M214,28 C206,58 190,100 174,140', 'M106,180 C125,162 150,150 178,144 C205,139 235,139 258,140', 'M232,56 C252,66 270,60 292,74', 'M318,88 C334,104 330,124 346,140', 'M130,194 C160,184 200,180 240,178'].forEach(d => S('path', { d, transform: tf, style: 'fill:none;stroke:#4A5566;stroke-width:2.4;stroke-linecap:round' }, g));
        if (id === 'fmri') {
          const defs = S('defs', null, svg); const gid = W2.uid('bscg');
          const gr = S('radialGradient', { id: gid }, defs);
          [['0%', '#FFF3A0', 1], ['45%', '#FFB020', .95], ['100%', '#FF3B3B', 0]].forEach(([o, c, op]) => S('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, gr));
          const blobs = [[257, 106, 26, 0], [205, 125, 20, 1.2], [109, 123, 18, 2.1]].map(([x, y, r, ph]) => ({ c: S('circle', { cx: x, cy: y, r, style: `fill:url(#${gid})` }, svg), ph, r }));
          const lab = txt(12, 26, 'TASK: READING', { fill: '#FFD166' });
          txt(12, 210, 'more blood flow = more activity', { size: 10 });
          const cap = ['vision (occipital)', 'meaning (Wernicke)', 'inner speech (Broca)'];
          const capEl = txt(316, 26, '', { a: { 'text-anchor': 'end' }, size: 11, fill: '#FFF3A0' });
          draw = t => { const s = t / 1000; let best = 0, bi = 0; blobs.forEach((b, i) => { const v = 0.35 + 0.65 * Math.max(0, Math.sin(s * 1.4 - b.ph)); b.c.setAttribute('r', (b.r * (0.75 + 0.35 * v)).toFixed(1)); b.c.style.opacity = v.toFixed(2); if (v > best) { best = v; bi = i; } }); capEl.textContent = cap[bi]; };
          void lab;
        } else {
          const cases = [
            { d: 'M94,123 C94,110.0 124,110.0 124,123 C124,136.0 94,136.0 94,123 Z', lost: 'Broca’s area → speech production' },
            { d: 'M237,100 C237,79.2 273,79.2 273,100 C273,120.8 237,120.8 237,100 Z', lost: 'Occipital lobe → part of vision' },
            { d: 'M211,170 C211,154.4 259,154.4 259,170 C259,185.6 211,185.6 211,170 Z', lost: 'Cerebellum → balance and coordination' }
          ];
          const pid = W2.uid('bsch'); const defs = S('defs', null, svg);
          const pat = S('pattern', { id: pid, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
          S('rect', { width: 6, height: 6, style: 'fill:#1a0d12' }, pat); S('line', { x1: 0, y1: 0, x2: 0, y2: 6, style: 'stroke:#FF6B81;stroke-width:2.5' }, pat);
          const patch = S('path', { style: `fill:url(#${pid});stroke:#FF6B81;stroke-width:2.5;stroke-dasharray:4 3`, class: 'bsc-ring' }, svg);
          txt(12, 26, 'DAMAGED AREA', { fill: '#FF6B81' });
          const lost = txt(12, 210, '', { size: 11, fill: '#E8F0FF' });
          let ci = -1;
          draw = t => { const k = Math.floor(t / 2600) % cases.length; if (k !== ci) { ci = k; patch.setAttribute('d', cases[k].d); lost.textContent = 'Lost: ' + cases[k].lost; } };
        }
      }
      if (id === 'pet') {
        const defs = S('defs', null, svg);
        const mk = (c1, c2) => { const gid = W2.uid('bscp'); const gr = S('radialGradient', { id: gid }, defs); S('stop', { offset: '0%', 'stop-color': c1 }, gr); S('stop', { offset: '60%', 'stop-color': c2, 'stop-opacity': .75 }, gr); S('stop', { offset: '100%', 'stop-color': c2, 'stop-opacity': 0 }, gr); return gid; };
        S('ellipse', { cx: 160, cy: 108, rx: 92, ry: 84, style: 'fill:#16206e;stroke:#3a4ab0;stroke-width:3' }, svg);
        S('ellipse', { cx: 160, cy: 108, rx: 78, ry: 70, style: 'fill:#1d3fa8' }, svg);
        S('line', { x1: 160, y1: 30, x2: 160, y2: 186, style: 'stroke:#16206e;stroke-width:3' }, svg);
        const hot = [[124, 70, 30, mk('#FFF7B0', '#FF3B2E'), 0], [196, 72, 26, mk('#FFF7B0', '#FF8A00'), 1], [130, 150, 22, mk('#B8FF9E', '#00C46A'), 2], [194, 148, 28, mk('#FFF7B0', '#FF3B2E'), 3]];
        const spots = hot.map(([x, y, r, gid, ph]) => ({ c: S('circle', { cx: x, cy: y, r, style: `fill:url(#${gid})` }, svg), ph, r, x, y }));
        const parts = Array.from({ length: 16 }, (_, i) => ({ c: S('circle', { r: 2.6, style: 'fill:#FFD166' }, svg), t: i / 16, s: spots[i % 4] }));
        txt(10, 24, 'RADIOACTIVE GLUCOSE', { fill: '#FFD166', size: 11 });
        txt(10, 212, 'hotter color = more fuel used', { size: 10 });
        draw = t => { const s = t / 1000; spots.forEach(sp => { const v = .6 + .4 * Math.sin(s * 1.2 + sp.ph); sp.c.setAttribute('r', (sp.r * (0.85 + .3 * v)).toFixed(1)); sp.c.style.opacity = v.toFixed(2); });
          parts.forEach(p => { const f = ((s * 0.35 + p.t) % 1); const x0 = 160 + (p.t - .5) * 40, y0 = 222; const x = x0 + (p.s.x - x0) * f, y = y0 + (p.s.y - y0) * f; p.c.setAttribute('cx', x.toFixed(1)); p.c.setAttribute('cy', y.toFixed(1)); p.c.style.opacity = f < .9 ? 1 : (1 - f) * 10; }); };
      }
      if (id === 'ct') {
        [[24, 150], [36, 138], [48, 126]].forEach(([x, y], i) => S('path', { d: `M${x},${y} l40,-14 l0,32 l-40,14 z`, style: `fill:${i === 2 ? '#8A97A8' : '#3a4560'};stroke:#AFC0D6;stroke-width:1` }, svg));
        txt(20, 196, 'SLICES', { size: 10 });
        S('ellipse', { cx: 196, cy: 110, rx: 82, ry: 94, style: 'fill:#F2F2F2' }, svg);
        S('ellipse', { cx: 196, cy: 110, rx: 72, ry: 84, style: 'fill:#7D7D7D' }, svg);
        S('path', { d: 'M196,60 L196,160', style: 'stroke:#4E4E4E;stroke-width:2' }, svg);
        S('path', { d: 'M184,92 C172,96 170,118 180,126 C186,120 188,104 190,96 Z M208,92 C220,96 222,118 212,126 C206,120 204,104 202,96 Z', style: 'fill:#2B2B2B' }, svg);
        ['M140,80 C150,86 156,84 162,92', 'M252,80 C242,86 236,84 230,92', 'M134,130 C146,134 150,142 160,140', 'M258,130 C246,134 242,142 232,140'].forEach(d => S('path', { d, style: 'fill:none;stroke:#5E5E5E;stroke-width:2' }, svg));
        S('circle', { cx: 232, cy: 150, r: 9, style: 'fill:#DCDCDC;stroke:#fff;stroke-width:1' }, svg);
        const scan = S('rect', { x: 110, y: 14, width: 172, height: 4, style: 'fill:#7CC0EE;opacity:.85' }, svg);
        txt(10, 24, 'X-RAY SLICE', { fill: '#E8F0FF', size: 11 });
        txt(244, 172, 'tumor', { size: 10, fill: '#FFD166' });
        draw = t => { const f = (t / 2200) % 1; scan.setAttribute('y', (16 + f * 186).toFixed(1)); };
      }
      if (id === 'meg') {
        S('path', { d: 'M70,214 C70,140 110,110 160,110 C210,110 250,140 250,214 Z', style: 'fill:#1B2A47;stroke:#7CC0EE;stroke-width:2' }, svg);
        S('path', { d: 'M50,150 C50,60 270,60 270,150', style: 'fill:none;stroke:#3a4a74;stroke-width:16;stroke-linecap:round' }, svg);
        const sens = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 - i / 12); const x = 160 + 110 * Math.cos(a), y = 150 - 86 * Math.sin(a); sens.push(S('rect', { x: x - 5, y: y - 5, width: 10, height: 10, rx: 2, style: 'fill:#24325A;stroke:#8EA0C4' }, svg)); }
        const src = [190, 140];
        [16, 28, 42].forEach((r, i) => S('ellipse', { cx: src[0], cy: src[1] - r * .9, rx: r * .7, ry: r, class: 'bsc-ring', style: `fill:none;stroke:#B79CF6;stroke-width:2;stroke-dasharray:5 7;opacity:${1 - i * .25}` }, svg));
        S('circle', { cx: src[0], cy: src[1], r: 5, style: 'fill:#FFD166' }, svg);
        txt(10, 24, 'MAGNETIC FIELDS', { fill: '#B79CF6', size: 11 });
        txt(10, 212, 'shielded room', { size: 10 });
        draw = t => { const s = t / 1000; sens.forEach((r, i) => { const near = Math.abs(i - 8.2) < 2.2; const v = near ? .5 + .5 * Math.sin(s * 6 + i) : 0; r.style.fill = near ? `rgba(183,156,246,${.3 + .7 * v})` : '#24325A'; }); };
      }
      if (api.reduceMotion && draw) { draw(1800); draw = null; }
    }
    const loop = W2.loop(vis, (dt, t) => { if (draw) draw(t); });

    function show(id) {
      cur = id; api.sfx.tap();
      ORDER.forEach(k => { tabEls[k].setAttribute('aria-selected', String(k === id)); tabEls[k].tabIndex = k === id ? 0 : -1; });
      info.setAttribute('aria-labelledby', tabEls[id].id);
      Object.entries(ptEls).forEach(([k, g]) => g.classList.toggle('on', k === id));
      buildVis(id);
      const t = TOOLS[id];
      info.innerHTML = '';
      info.append(h('div', { class: 'w2-row' }, h('span', { class: 'bsc-badge ' + (t.kind === 'Structure' ? 's' : 'f') }, t.kind.toUpperCase())),
        h('h4', null, t.name === 'Lesion study' ? t.name : `${t.name}`, h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '15px' } }, t.name === 'Lesion study' ? '' : ` · ${t.full}`)),
        h('div', { class: 'w2-kv' }, h('b', null, 'Measures'), t.measures),
        h('div', { class: 'bsc-pro w2-kv' }, h('b', null, 'Strength'), t.good),
        h('div', { class: 'bsc-con w2-kv' }, h('b', null, 'Limit'), t.bad),
        h('div', { class: 'w2-kv' }, h('b', null, 'Used for'), t.use));
    }

    /* quiz */
    let qs = [], qi = 0, score = 0, tries = 0;
    function startQuiz() { qs = ML.util.shuffle(QUIZ).slice(0, 8); qi = 0; score = 0; ask(); }
    function ask() {
      const q = qs[qi]; tries = 0;
      quiz.innerHTML = '';
      const fb = h('div', { class: 'w2-fb' }, 'Which tool fits best?');
      const btns = h('div', { class: 'bsc-qbtns', role: 'group', 'aria-label': 'Tools' });
      ORDER.forEach(id => {
        const b = h('button', { type: 'button', class: 'btn' }, id === 'lesion' ? 'Lesion' : TOOLS[id].name);
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (id === q.a) {
            b.classList.add('right'); btns.querySelectorAll('.btn').forEach(x => x.disabled = true);
            if (!tries) { score++; api.addXP(2); }
            api.sfx.good(); fb.className = 'w2-fb good'; fb.innerHTML = '';
            const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '8px', display: 'flex' } }, qi + 1 < qs.length ? 'Next question' : 'See my score');
            next.addEventListener('click', () => { qi++; qi < qs.length ? ask() : end(); });
            fb.append(h('strong', null, 'Yes! '), q.why, next); next.focus({ preventScroll: true });
          } else {
            tries++; b.classList.add('wrong'); b.disabled = true; api.sfx.bad();
            fb.className = 'w2-fb bad'; fb.innerHTML = ''; fb.append(h('strong', null, `Not ${id === 'lesion' ? 'a lesion study' : TOOLS[id].name}. `), `${id === 'lesion' ? 'A lesion study' : TOOLS[id].name} shows ${TOOLS[id].short}. Try again.`);
          }
        });
        btns.append(b);
      });
      quiz.append(h('div', { class: 'bk-qbar', style: { display: 'flex', justifyContent: 'space-between' } }, h('span', { class: 'w2-tag' }, `Question ${qi + 1} of ${qs.length}`), h('span', { class: 'w2-score' }, `Score ${score}`)),
        h('div', { class: 'w2-q' }, q.q), btns, fb);
    }
    function end() {
      quiz.innerHTML = '';
      const again = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { alignSelf: 'flex-start' } }, 'Play again');
      again.addEventListener('click', startQuiz);
      quiz.append(h('div', { class: 'w2-tag' }, 'Done'), h('h4', null, `${score} of ${qs.length} on the first try`),
        h('p', { style: { margin: 0 } }, score >= 6 ? 'You know your tools. Remember: EEG = when, fMRI = where, CT = structure.' : 'Quick rule: EEG/MEG = great timing, fMRI/PET = where, CT = structure only, lesion = what is lost.'), again);
      if (score >= 6) { api.sfx.win(); const r = quiz.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top, 60); }
    }
    show('eeg'); startQuiz();
    return () => { loop.stop(); bag.destroy(); };
  }
});
})();
