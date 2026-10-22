/* Shared kit for the 1.4 Brain and 1.5 Sleep widgets (ML.w2):
   UI helpers, brain diagrams (lateral + midline), a tap-the-region Explore/Quiz engine,
   an EEG wave generator, and a hypnogram path helper. Used by brain-lateral, brain-inner,
   neuro-er, brain-scans, hypnogram, sleep-clinic and the other w2 widgets. */
(function () {
'use strict';
const ML = window.ML;
const W2 = ML.w2 = ML.w2 || {};
const NS = 'http://www.w3.org/2000/svg';
let uidN = 0;
W2.uid = p => `${p || 'w2'}-${++uidN}`;
W2.css = (id, text) => {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = text; document.head.append(s);
};
W2.dark = (sel, body) => `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) ${sel}{${body}}}\n:root[data-theme="dark"] ${sel}{${body}}`;
W2.S = (tag, attrs, parent) => {
  const el = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) { if (attrs[k] != null) el.setAttribute(k, attrs[k]); }
  if (parent) parent.append(el);
  return el;
};
const S = W2.S;
const h = (...a) => ML.util.h(...a);

/* segmented toggle: opts = [[value, label], ...] */
W2.seg = function (opts, value, onChange, label) {
  const wrap = h('div', { class: 'w2-seg', role: 'group', 'aria-label': label || 'Mode' });
  const btns = opts.map(([v, txt]) => {
    const b = h('button', { type: 'button', 'aria-pressed': String(v === value) }, txt);
    b.addEventListener('click', () => { set(v); onChange(v); });
    wrap.append(b); b._v = v; return b;
  });
  function set(v) { value = v; btns.forEach(b => b.setAttribute('aria-pressed', String(b._v === v))); }
  wrap.set = set; wrap.get = () => value;
  return wrap;
};

/* rAF loop that pauses while the element is off screen or the tab is hidden. fn(dt, t). → { stop() } */
W2.loop = function (el, fn) {
  let raf = 0, vis = true, stopped = false, last = 0;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { vis = es[es.length - 1].isIntersecting; if (vis && !raf && !stopped) { last = 0; raf = requestAnimationFrame(frame); } }) : null;
  if (io) io.observe(el);
  function frame(t) {
    raf = 0; if (stopped) return;
    if (document.hidden) { last = 0; raf = requestAnimationFrame(frame); return; }
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
    fn(dt, t);
    if (vis) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return { stop() { stopped = true; cancelAnimationFrame(raf); if (io) io.disconnect(); } };
};

/* timers bag for cleanup */
W2.bag = function () {
  const ts = new Set(), rafs = new Set(), offs = [];
  return {
    t(fn, ms) { const id = setTimeout(() => { ts.delete(id); fn(); }, ms); ts.add(id); return id; },
    clearT(id) { clearTimeout(id); ts.delete(id); },
    raf(fn) { const id = requestAnimationFrame(t => { rafs.delete(id); fn(t); }); rafs.add(id); return id; },
    on(target, ev, fn, o) { target.addEventListener(ev, fn, o); offs.push(() => target.removeEventListener(ev, fn, o)); },
    clear() { ts.forEach(clearTimeout); ts.clear(); rafs.forEach(cancelAnimationFrame); rafs.clear(); },
    destroy() { this.clear(); offs.splice(0).forEach(f => f()); }
  };
};

W2.css('w2-kit-css', `
.w2 { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.w2-inst { font-size: 15px; color: var(--muted); margin: 0; }
.w2-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.w2-seg { display: inline-flex; flex-wrap: wrap; background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 3px; gap: 2px; }
.w2-seg button { border: 0; background: none; padding: 7px 13px; border-radius: 9px; font-weight: 700; font-size: 14px; color: var(--muted); cursor: pointer; min-height: 36px; }
.w2-seg button:hover { color: var(--ink); }
.w2-seg button[aria-pressed="true"] { background: var(--surface); color: var(--carolina); box-shadow: 0 1px 3px rgba(0,0,0,.14); }
.w2-panel { background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.w2-panel h4 { margin: 0; font-size: 19px; }
.w2-panel ul { margin: 0; padding-left: 20px; }
.w2-panel li { margin: 2px 0; }
.w2-kv { font-size: 15px; }
.w2-kv b { color: var(--carolina); font-family: var(--f-mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; display: block; }
.w2-hook { border-left: 4px solid var(--spark); background: var(--spark-soft); border-radius: 10px; padding: 8px 12px; font-size: 15px; }
.w2-hook::before { content: "Memory hook"; display: block; font-family: var(--f-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--spark); font-weight: 700; }
.w2-fb { border-radius: 12px; padding: 10px 14px; font-size: 15px; border-left: 4px solid var(--line); background: var(--surface-2); }
.w2-fb.good { border-left-color: var(--good); background: var(--good-soft); }
.w2-fb.bad { border-left-color: var(--bad); background: var(--bad-soft); }
.w2-fb.warn { border-left-color: var(--warn); background: var(--warn-soft); }
.w2-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.w2-chip { display: inline-flex; align-items: center; gap: 6px; border: 1.5px solid var(--line); background: var(--surface); border-radius: 99px; padding: 5px 11px 5px 7px; font-weight: 700; font-size: 13.5px; cursor: pointer; color: var(--ink); min-height: 34px; }
.w2-chip:hover { border-color: var(--carolina); }
.w2-chip[aria-pressed="true"] { border-color: var(--carolina); background: var(--carolina-soft); }
.w2-dot { width: 14px; height: 14px; border-radius: 50%; flex: none; border: 1px solid rgba(0,0,0,.25); }
.w2-num { font-family: var(--f-mono); font-size: 11px; min-width: 18px; height: 18px; border-radius: 9px; display: inline-grid; place-items: center; background: var(--ink); color: var(--surface); padding: 0 4px; }
.w2-score { font-family: var(--f-mono); font-weight: 700; font-variant-numeric: tabular-nums; font-size: 14px; color: var(--muted); }
.w2-q { font-size: 18px; font-weight: 700; }
.w2-q em { font-style: normal; color: var(--spark); }
.w2-tag { font-family: var(--f-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); font-weight: 700; }
.w2-meter { height: 10px; border-radius: 99px; background: var(--line); overflow: hidden; }
.w2-meter > i { display: block; height: 100%; background: var(--carolina); border-radius: 99px; transition: width .4s ease; }
.reduce-motion .w2-meter > i { transition: none; }
.w2 .btn { min-height: 40px; }

/* brain art */
.bk { --bk-out: #2B3D5A; --bk-gyri: rgba(20,35,60,.22);
  --bk-frontal: #8DC0EC; --bk-pfc: #B7DAF6; --bk-motor: #5C9EE0; --bk-somato: #F6AE5E; --bk-parietal: #F8D98E; --bk-occipital: #F5A3B3;
  --bk-temporal: #A3E0C1; --bk-broca: #3D7BC8; --bk-wern: #2E9E6E; --bk-cereb: #CDB6F7; --bk-stem: #E2C39F;
  --bk-cortex: #DCE7F3; --bk-cc: #FBF4E4; --bk-thal: #F6AE5E; --bk-hypo: #F38BA0; --bk-pit: #D9537A; --bk-hippo: #5FC797; --bk-amyg: #E5485F;
  --bk-nacc: #F2C94C; --bk-mid: #DDBA92; --bk-pons: #CFA477; --bk-med: #BE9064; --bk-cord: #AE8257; --bk-ras: #E5485F; }
.bk svg { width: 100%; height: auto; display: block; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.bk-r { cursor: pointer; outline: none; }
.bk-f { stroke: var(--bk-out); stroke-width: 1.2; transition: opacity .2s, filter .2s, stroke-width .15s; }
.bk-r:hover .bk-f { filter: brightness(1.07) saturate(1.15); }
.bk-r:focus-visible .bk-f { stroke: var(--carolina); stroke-width: 3.5; }
.bk.dimming .bk-r:not(.on) .bk-f { opacity: .5; filter: saturate(.55); }
.bk-r.on .bk-f { stroke: var(--ink); stroke-width: 3; filter: saturate(1.25); }
.bk-r.on { animation: bkPulse 1.6s ease-in-out infinite; }
.bk-r.good .bk-f { fill: var(--good) !important; stroke: var(--ink); stroke-width: 3; opacity: 1 !important; }
.bk-r.bad .bk-f { fill: var(--bad) !important; stroke: var(--ink); stroke-width: 3; opacity: 1 !important; }
.bk-r.hint .bk-f { stroke: var(--good); stroke-width: 4; stroke-dasharray: 6 4; opacity: 1 !important; animation: bkDash 1s linear infinite; }
@keyframes bkPulse { 50% { filter: drop-shadow(0 0 6px rgba(75,156,211,.65)); } }
@keyframes bkDash { to { stroke-dashoffset: -20; } }
.reduce-motion .bk-r.on, .reduce-motion .bk-r.hint .bk-f { animation: none; }
.bk-gy { fill: none; stroke: var(--bk-gyri); stroke-width: 1.6; stroke-linecap: round; pointer-events: none; }
.bk-sul { fill: none; stroke: var(--bk-out); stroke-width: 2.2; stroke-linecap: round; pointer-events: none; opacity: .75; }
.bk-outl { fill: none; stroke: var(--bk-out); stroke-width: 2.2; pointer-events: none; }
.bk-ghost { fill: none; stroke: var(--bk-out); stroke-width: 1.4; stroke-dasharray: 4 3; pointer-events: none; opacity: .55; }
.bk-ras-dots { fill: none; stroke: var(--bk-ras); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 0.1 6; pointer-events: none; opacity: .8; }
.bk-ras-proj { fill: none; stroke: var(--bk-ras); stroke-width: 2; stroke-dasharray: 2 5; stroke-linecap: round; pointer-events: none; opacity: 0; transition: opacity .3s; }
.bk.ras-on .bk-ras-proj { opacity: .9; animation: bkDash 1.2s linear infinite; }
.reduce-motion .bk.ras-on .bk-ras-proj { animation: none; }
.bk-hit { fill: transparent; stroke: transparent; }
.bk-lab { pointer-events: none; }
.bk-lab rect { fill: var(--surface); stroke: var(--ink); stroke-width: 1; opacity: .95; }
.bk-lab text { fill: var(--ink); font: 700 12.5px var(--f-body); }
.bk-lab line { stroke: var(--ink); stroke-width: 1.2; }
.bk-num circle { fill: var(--ink); }
.bk-num text { fill: var(--surface); font: 700 10px var(--f-mono); }
.bk-dir { fill: var(--muted); font: 700 11px var(--f-mono); letter-spacing: .08em; pointer-events: none; }
.bk-cap { fill: var(--muted); font: 12px var(--f-body); pointer-events: none; }
.bk-stage { max-width: 560px; width: 100%; margin: 0 auto; }
.bk-qbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
` + W2.dark('.bk.dimming .bk-r:not(.on) .bk-f', 'opacity:.62') + '\n' + W2.dark('.bk', `--bk-out: #050B16; --bk-gyri: rgba(0,0,0,.28);
  --bk-frontal: #5E98CC; --bk-pfc: #80B4E0; --bk-motor: #3E79BE; --bk-somato: #D98C3E; --bk-parietal: #D6B460; --bk-occipital: #D77890;
  --bk-temporal: #5FB58C; --bk-broca: #2A5C9E; --bk-wern: #1F7C55; --bk-cereb: #9F86D6; --bk-stem: #B9946C;
  --bk-cortex: #8EA3BD; --bk-cc: #E8DFC8; --bk-thal: #D98C3E; --bk-hypo: #D66A82; --bk-pit: #B83C62; --bk-hippo: #3FA676; --bk-amyg: #E0526A;
  --bk-nacc: #D6AE33; --bk-mid: #BF9A70; --bk-pons: #AD845A; --bk-med: #9C744C; --bk-cord: #8D6743; --bk-ras: #FF8FA0;`));

/* ================= brain data ================= */
W2.LATERAL = {
  frontal: { name: 'Frontal lobe', short: 'Frontal', fn: 'planning, decisions, and personality', color: 'frontal', label: [96, 84], where: 'Behind your forehead, in front of the central groove.',
    does: ['Planning, decision-making, and problem solving', 'Personality and impulse control', 'Voluntary movement (motor cortex at its back edge)', 'Speech production (Broca’s area, left side)'],
    hook: 'Frontal = thinking and doing.' },
  pfc: { name: 'Prefrontal cortex', short: 'Prefrontal', fn: 'judgment and impulse control', color: 'pfc', label: [70, 130], where: 'The very front of the frontal lobe, right behind your forehead.',
    does: ['Judgment and impulse control', 'Planning ahead and weighing consequences', 'Executive function: focus, organizing, self-control'],
    hook: 'The brain’s CEO. It is one of the last areas to fully mature (mid-20s). Phineas Gage’s injury hit this area.' },
  motor: { name: 'Motor cortex', short: 'Motor', fn: 'voluntary movement', color: 'motor', label: [172, 50], where: 'A strip at the back of the frontal lobe, running ear to ear like a headband.',
    does: ['Sends the commands for voluntary movement', 'Left motor cortex moves the RIGHT side of the body (contralateral)'],
    hook: 'Motor = move. It sits right in front of the touch strip: two headbands side by side.' },
  somato: { name: 'Somatosensory cortex', short: 'Sensory', fn: 'touch and body sensations', color: 'somato', label: [214, 96], where: 'A strip at the front of the parietal lobe, just behind the motor cortex.',
    does: ['Registers touch, pressure, temperature, and pain', 'Left strip feels the RIGHT side of the body (contralateral)'],
    hook: 'Body parts with more receptors (lips, fingertips) get more of this strip. That is the homunculus.' },
  parietal: { name: 'Parietal lobe', short: 'Parietal', fn: 'sensing touch and locating your body in space', color: 'parietal', label: [262, 66], where: 'The top and upper back of your head (the crown).',
    does: ['Processes touch, temperature, pressure, and pain', 'Knows where your body is in space', 'Spatial reasoning and attention'],
    hook: 'Parietal = sensing and locating.' },
  occipital: { name: 'Occipital lobe', short: 'Occipital', fn: 'vision', color: 'occipital', label: [334, 136], where: 'The back of your head.',
    does: ['Primary visual cortex: processes everything you see', 'Shapes, edges, colors, motion, and faces'],
    hook: 'Occipital = seeing. Bump the back of your head and you “see stars.”' },
  temporal: { name: 'Temporal lobe', short: 'Temporal', fn: 'hearing and memory', color: 'temporal', label: [190, 196], where: 'The sides of your head, above your ears (by your temples).',
    does: ['Hearing: the auditory cortex gets signals from your ears', 'Language comprehension (Wernicke’s area, left side)', 'Memory: the hippocampus is tucked deep inside'],
    hook: 'Temporal = hearing and remembering. Your temples are right by your ears.' },
  broca: { name: 'Broca’s area', short: 'Broca’s', fn: 'producing speech', color: 'broca', label: [130, 176], where: 'LEFT frontal lobe, just in front of the motor cortex’s face and mouth area.',
    does: ['Speech production: plans the muscle movements of words', 'Damage = Broca’s aphasia: understands fine, but speech is slow and effortful'],
    hook: 'Broca = broken speech. Words come out in pieces.' },
  wern: { name: 'Wernicke’s area', short: 'Wernicke’s', fn: 'understanding language', color: 'wern', label: [264, 164], where: 'LEFT temporal lobe, toward the back.',
    does: ['Language comprehension: understanding spoken and written words', 'Damage = Wernicke’s aphasia: fluent “word salad” and poor understanding'],
    hook: 'Wernicke = “Wait, what?” Words keep flowing, but meaning is lost.' },
  cereb: { name: 'Cerebellum', short: 'Cerebellum', fn: 'balance and coordination', color: 'cereb', label: [306, 226], where: 'Back of the brain, tucked under the occipital lobe.',
    does: ['Balance and coordination', 'Timing and smoothing movements', 'Practiced skills: riding a bike, jumping rope, tying your shoes'],
    hook: '“Get your bell rung” and you wobble: the cere-BELL-um runs balance.' },
  stem: { name: 'Brainstem', short: 'Brainstem', fn: 'automatic survival functions', color: 'stem', label: [232, 276], where: 'The base of the brain, connecting to the spinal cord.',
    does: ['Automatic survival: heartbeat and breathing (medulla)', 'Sleep and alertness (pons, reticular activating system)', 'Relays signals between brain and body'],
    hook: 'The oldest part of the brain. It runs your body on autopilot.' }
};
W2.INNER = {
  cortex: { name: 'Cerebral cortex', short: 'Cortex', fn: 'higher thinking', color: 'cortex', label: [104, 96], where: 'The wrinkled outer layer covering the whole brain.',
    does: ['Higher thinking: language, planning, reasoning', 'Divided into four lobes on each side', 'The farther out you go, the more complex the job'],
    hook: 'Outer layers = complex thinking. Inner core = basic survival.' },
  cc: { name: 'Corpus callosum', short: 'Corpus callosum', fn: 'connecting the two hemispheres', color: 'cc', label: [212, 104], where: 'A thick arch of fibers in the middle of the brain.',
    does: ['Connects the left and right hemispheres', 'Lets the two sides share information', 'Cut in split-brain surgery to stop severe seizures'],
    hook: 'The bridge between the hemispheres: about 200 million axons.' },
  thal: { name: 'Thalamus', short: 'Thalamus', fn: 'relaying senses to the cortex', color: 'thal', label: [228, 148], where: 'The center of the brain, sitting on top of the brainstem.',
    does: ['Relay station: routes incoming senses to the right area of the cortex', 'Handles every sense EXCEPT smell'],
    hook: 'Thalamus = relay station. Smell skips it.' },
  hypo: { name: 'Hypothalamus', short: 'Hypothalamus', fn: 'hunger, thirst, and temperature', color: 'hypo', label: [196, 175], where: '“Below the thalamus” (hypo = below).',
    does: ['Hunger, thirst, and body temperature', 'Keeps homeostasis (internal balance)', 'Controls the pituitary gland and holds the SCN body clock'],
    hook: 'Hypo = below. Small, but it is the body’s thermostat and hunger and thirst control panel.' },
  pit: { name: 'Pituitary gland', short: 'Pituitary', fn: 'releasing master hormones', color: 'pit', label: [176, 202], where: 'A pea-sized gland hanging below the hypothalamus.',
    does: ['The “master gland”: its hormones control other glands', 'Releases growth hormone and regulates essential processes', 'Takes its orders from the hypothalamus'],
    hook: 'Master gland, but the hypothalamus is its boss.' },
  hippo: { name: 'Hippocampus', short: 'Hippocampus', fn: 'forming new memories', color: 'hippo', label: [226, 214], where: 'Deep in each temporal lobe, just off the midline (shown dashed).',
    does: ['Forms and organizes new memories', 'Converts short-term memories into long-term ones', 'Does not store them permanently: they end up in the cortex'],
    hook: 'If you see a HIPPO on CAMPUS, you are going to remember it. (Hippocampus means “seahorse,” its shape.)' },
  amyg: { name: 'Amygdala', short: 'Amygdala', fn: 'fear and aggression', color: 'amyg', label: [200, 216], where: 'Deep in each temporal lobe, just in front of the hippocampus (off the midline).',
    does: ['Fear and aggression; triggers “fight or flight”', 'Makes emotional memories extra strong', 'Overactive in PTSD and anxiety'],
    hook: 'Almond-shaped (amygdala means “almond”): your brain’s alarm system.' },
  nacc: { name: 'Nucleus accumbens (reward center)', short: 'Reward center', fn: 'pleasure and motivation', color: 'nacc', label: [160, 167], where: 'Below the front of the corpus callosum.',
    does: ['Pleasure and motivation', 'A “dopamine dump” when something feels rewarding', 'Hijacked by drugs, gambling, and endless scrolling'],
    hook: 'It makes you want to do it again.' },
  mid: { name: 'Midbrain', short: 'Midbrain', fn: 'relaying sights and sounds', color: 'mid', label: [258, 180], where: 'The top of the brainstem, right under the thalamus.',
    does: ['Relays visual and auditory information (turning toward a sound)', 'Carries pain, movement, and sleep information'],
    hook: 'The “Look over there!” relay.' },
  pons: { name: 'Pons', short: 'Pons', fn: 'sleep and movement coordination', color: 'pons', label: [264, 216], where: 'The rounded bulge in the middle of the brainstem.',
    does: ['Coordinates movement', 'Helps control sleep and dreaming (REM)'],
    hook: 'Pons means “bridge”: it links the cerebellum to the rest of the brain.' },
  med: { name: 'Medulla oblongata', short: 'Medulla', fn: 'heartbeat and breathing', color: 'med', label: [268, 254], where: 'The base of the brainstem, just above the spinal cord.',
    does: ['Heartbeat', 'Breathing', 'Blood pressure and swallowing'],
    hook: 'Medulla = life support. Damage here can be fatal.' },
  ras: { name: 'Reticular activating system', short: 'RAS', fn: 'alertness and arousal', color: 'ras', label: [262, 196], where: 'A net of neurons running up the core of the brainstem (the dotted line).',
    does: ['Controls arousal, alertness, and sleep/wake cycles', 'Filters which signals get your attention', 'Linked to ADHD and narcolepsy'],
    hook: 'Your brain’s on/off switch and spam filter.' },
  cereb: { name: 'Cerebellum', short: 'Cerebellum', fn: 'balance and coordination', color: 'cereb', label: [332, 226], where: 'Back of the brain, behind the brainstem and under the occipital lobe.',
    does: ['Balance and coordination', 'Timing and smoothing movements', 'Practiced skills: riding a bike, jumping rope, tying your shoes'],
    hook: '“Get your bell rung” and you wobble: the cere-BELL-um runs balance.' },
  cord: { name: 'Spinal cord', short: 'Spinal cord', fn: 'carrying messages between brain and body', color: 'cord', label: [268, 300], where: 'Runs down from the medulla through your spine.',
    does: ['The information highway between brain and body', 'Handles simple reflexes on its own'],
    hook: 'Brain to body and back, at up to about 120 meters per second.' }
};

/* ================= brain art ================= */
function region(parent, id, color, shapes) {
  const g = S('g', { class: 'bk-r', 'data-id': id, tabindex: '0', role: 'button' }, parent);
  shapes.forEach(([t, a]) => S(t, Object.assign({ class: 'bk-f', style: `fill:var(--bk-${color})` }, a), g));
  return g;
}
function hit(g, tag, attrs) { S(tag, Object.assign({ class: 'bk-hit' }, attrs), g); }

const LAT_OUT = W2.LAT_OUT = 'M52,170 C30,140 35,95 70,70 C105,40 165,28 215,30 C275,32 330,60 352,105 C368,135 362,165 345,180 C325,195 295,200 270,205 C240,222 200,228 165,220 C135,214 112,200 106,188 C100,180 85,182 70,182 C60,181 55,176 52,170 Z';
function drawLateral(svg, uid) {
  svg.setAttribute('viewBox', '0 0 400 300');
  const defs = S('defs', null, svg);
  const cp = S('clipPath', { id: uid + '-clip' }, defs); S('path', { d: LAT_OUT }, cp);
  const R = {};
  const art = S('g', { class: 'bk-art' }, svg);
  R.stem = region(art, 'stem', 'stem', [['path', { d: 'M205,212 C211,240 214,262 214,298 L247,298 C245,270 249,246 264,224 C252,214 226,208 205,212 Z' }]]);
  R.cereb = region(art, 'cereb', 'cereb', [['path', { d: 'M248,214 C252,195 296,188 330,189 C360,191 372,210 362,231 C350,252 298,258 267,247 C252,241 245,227 248,214 Z' }]]);
  const fol = S('g', { 'pointer-events': 'none' }, art);
  ['M258,226 C280,214 330,210 360,218', 'M262,236 C290,226 330,224 356,232', 'M272,245 C300,238 330,238 348,242', 'M256,215 C280,204 320,200 350,206'].forEach(d => S('path', { d, class: 'bk-gy' }, fol));
  const lobes = S('g', { 'clip-path': `url(#${uid}-clip)` }, art);
  R.frontal = region(lobes, 'frontal', 'frontal', [['path', { d: 'M0,0 L216,0 L214,28 C206,58 190,100 174,140 L178,144 C150,150 125,162 106,180 L96,300 L0,300 Z' }]]);
  R.parietal = region(lobes, 'parietal', 'parietal', [['path', { d: 'M216,0 L312,0 L306,56 C304,90 303,120 302,156 L258,140 C235,139 205,139 178,144 L174,140 C190,100 206,58 214,28 Z' }]]);
  R.temporal = region(lobes, 'temporal', 'temporal', [['path', { d: 'M106,180 C125,162 150,150 178,144 C205,139 235,139 258,140 L302,156 L300,300 L96,300 Z' }]]);
  R.occipital = region(lobes, 'occipital', 'occipital', [['path', { d: 'M312,0 L400,0 L400,300 L300,300 L302,156 C303,120 304,90 306,56 Z' }]]);
  const gy = S('g', { 'clip-path': `url(#${uid}-clip)` }, art);
  ['M66,92 C92,80 118,86 138,70', 'M56,124 C82,112 106,118 126,102', 'M58,154 C78,146 92,150 110,146', 'M108,50 C124,60 148,54 166,44', 'M150,92 C158,80 166,76 172,62',
    'M232,56 C252,66 270,60 292,74', 'M226,96 C246,102 266,96 288,110', 'M244,128 C262,122 278,128 296,140',
    'M318,88 C334,104 330,124 346,140', 'M314,166 C330,166 340,156 356,162', 'M322,60 C330,70 342,74 350,90',
    'M130,194 C160,184 200,180 240,178 C262,177 280,180 296,188', 'M150,210 C182,205 216,203 252,200'].forEach(d => S('path', { d, class: 'bk-gy' }, gy));
  const ov = S('g', { 'clip-path': `url(#${uid}-clip)` }, art);
  R.pfc = region(ov, 'pfc', 'pfc', [['path', { d: 'M0,0 L146,0 L144,32 C134,72 120,124 104,176 L96,300 L0,300 Z', style: 'fill:var(--bk-pfc);stroke-dasharray:5 3' }]]);
  R.motor = region(ov, 'motor', 'motor', [['path', { d: 'M190,0 L216,0 L214,28 C206,58 190,100 174,140 L178,144 L156,150 C170,104 182,56 190,0 Z' }]]);
  R.somato = region(ov, 'somato', 'somato', [['path', { d: 'M216,0 L240,0 C234,52 218,100 200,140 L178,144 L174,140 C190,100 206,58 214,28 Z' }]]);
  R.broca = region(ov, 'broca', 'broca', [['ellipse', { cx: 134, cy: 158, rx: 18, ry: 11.5, transform: 'rotate(-26 134 158)' }]]);
  R.wern = region(ov, 'wern', 'wern', [['ellipse', { cx: 264, cy: 161, rx: 20, ry: 11.5, transform: 'rotate(16 264 161)' }]]);
  // pfc/frontal/motor gyri stripes
  const ov2 = S('g', { 'clip-path': `url(#${uid}-clip)` }, art);
  ['M66,92 C92,80 118,86 138,70', 'M56,124 C82,112 106,118 126,102'].forEach(d => S('path', { d, class: 'bk-gy' }, ov2));
  S('path', { class: 'bk-sul', d: 'M214,28 C206,58 190,100 174,140' }, art);
  S('path', { class: 'bk-sul', d: 'M106,180 C125,162 150,150 178,144 C205,139 235,139 258,140' }, art);
  S('path', { class: 'bk-outl', d: LAT_OUT }, art);
  S('text', { class: 'bk-dir', x: 14, y: 290 }, art).textContent = '◀ FRONT';
  S('text', { class: 'bk-dir', x: 386, y: 290, 'text-anchor': 'end' }, art).textContent = 'BACK ▶';
  S('text', { class: 'bk-cap', x: 14, y: 22 }, art).textContent = 'Left hemisphere, side view';
  return R;
}

const IN_OUT = 'M50,176 C28,140 36,92 74,66 C112,40 170,30 222,32 C285,35 336,64 358,110 C372,140 370,170 352,188 C336,200 312,202 296,198 C286,195 280,186 272,178 L252,180 C246,196 240,216 230,228 C208,240 168,236 146,224 C128,214 118,202 110,194 C96,188 78,190 66,188 C58,186 53,182 50,176 Z';
function drawInner(svg, uid) {
  svg.setAttribute('viewBox', '0 0 400 320');
  const R = {};
  const art = S('g', { class: 'bk-art' }, svg);
  R.cord = region(art, 'cord', 'cord', [['path', { d: 'M258,268 L282,268 C280,286 279,302 279,320 L262,320 C262,302 260,286 258,268 Z' }]]);
  R.cereb = region(art, 'cereb', 'cereb', [['path', { d: 'M290,206 C298,188 340,184 364,196 C384,208 384,236 368,250 C348,266 306,264 292,246 C284,236 284,218 290,206 Z' }]]);
  const arb = S('g', { 'pointer-events': 'none' }, art);
  ['M296,226 C312,224 324,220 338,208', 'M312,224 C324,230 340,232 356,226', 'M322,222 C334,214 348,208 362,212', 'M318,226 C326,240 340,248 352,252', 'M330,212 C336,202 346,198 354,198', 'M304,226 C312,236 322,246 334,252']
    .forEach(d => S('path', { d, fill: 'none', style: 'stroke:var(--bk-cc);stroke-width:2.6;stroke-linecap:round;opacity:.85' }, arb));
  R.cortex = region(art, 'cortex', 'cortex', [['path', { d: IN_OUT }]]);
  const gy = S('g', null, art);
  ['M136,150 C130,104 190,80 236,80 C292,80 326,108 320,154', 'M86,120 C100,96 120,86 140,82', 'M72,150 C82,140 96,138 112,132',
    'M188,58 C196,70 206,74 220,72', 'M262,60 C268,72 278,78 296,80', 'M330,120 C320,140 322,160 340,176', 'M300,174 C316,170 336,170 356,160', 'M94,174 C112,166 126,170 140,176']
    .forEach(d => S('path', { d, class: 'bk-gy' }, gy));
  S('path', { class: 'bk-ghost', d: 'M140,214 C150,192 236,188 246,204 C252,216 242,236 214,240 C184,244 148,232 140,214 Z' }, art);
  R.cc = region(art, 'cc', 'cc', [['path', { d: 'M150,160 C126,150 126,122 150,112 C186,94 252,92 288,112 C308,124 310,148 294,156 C284,160 276,152 280,142 C284,128 262,116 226,114 C190,113 164,122 160,136 C157,145 164,152 160,157 Z' }]]);
  R.mid = region(art, 'mid', 'mid', [['path', { d: 'M236,158 L272,156 C276,170 278,184 279,196 L246,198 C244,184 241,170 236,158 Z' }]]);
  R.pons = region(art, 'pons', 'pons', [['path', { d: 'M246,198 L279,196 C292,202 294,228 284,238 L254,240 C240,232 236,208 246,198 Z' }]]);
  R.med = region(art, 'med', 'med', [['path', { d: 'M254,240 L284,238 C284,250 283,260 282,268 L258,268 C257,258 256,250 254,240 Z' }]]);
  R.thal = region(art, 'thal', 'thal', [['ellipse', { cx: 230, cy: 146, rx: 27, ry: 16 }]]);
  R.hypo = region(art, 'hypo', 'hypo', [['path', { d: 'M180,170 C182,160 200,158 212,162 C218,166 216,178 208,182 C198,186 184,184 180,170 Z' }]]);
  R.pit = region(art, 'pit', 'pit', [['path', { d: 'M192,182 L186,194', style: 'fill:none;stroke-width:3' }], ['ellipse', { cx: 182, cy: 201, rx: 9, ry: 7 }]]);
  R.nacc = region(art, 'nacc', 'nacc', [['circle', { cx: 160, cy: 168, r: 9 }]]);
  R.amyg = region(art, 'amyg', 'amyg', [['ellipse', { cx: 200, cy: 215, rx: 10, ry: 7.5, style: 'fill:var(--bk-amyg);stroke-dasharray:3 2' }]]);
  R.hippo = region(art, 'hippo', 'hippo', [['path', { d: 'M211,216 C220,226 236,230 244,218 C250,208 244,196 234,197 C228,198 227,205 232,207 C237,209 237,216 231,219 C224,222 217,219 213,212 Z', style: 'fill:var(--bk-hippo);stroke-dasharray:3 2' }]]);
  [['pit', 182, 201, 12], ['amyg', 200, 215, 11], ['hippo', 233, 212, 12], ['nacc', 160, 168, 13], ['hypo', 198, 172, 12]].forEach(([id, cx, cy, r]) => hit(R[id], 'circle', { cx, cy, r }));
  // RAS network: dotted core + projections; hit target is a narrow core band
  R.ras = region(art, 'ras', 'ras', []);
  S('path', { class: 'bk-hit', d: 'M262,266 C262,240 260,214 258,192 C256,178 254,168 250,160', style: 'fill:none;stroke:transparent;stroke-width:10' }, R.ras);
  S('path', { class: 'bk-ras-dots', d: 'M268,264 C268,240 266,214 262,192 C260,178 256,168 252,160' }, R.ras);
  S('path', { class: 'bk-ras-dots', d: 'M262,262 C262,240 260,216 256,194 C254,180 250,170 246,162', style: 'opacity:.55' }, R.ras);
  const proj = S('g', null, art);
  ['M250,160 C240,120 200,80 150,64', 'M252,158 C258,110 270,72 292,58', 'M254,160 C280,130 320,112 342,122', 'M248,162 C220,150 150,140 96,140']
    .forEach(d => S('path', { class: 'bk-ras-proj', d, 'marker-end': `url(#${uid}-arr)` }, proj));
  const defs = S('defs', null, svg);
  const mk = S('marker', { id: uid + '-arr', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:var(--bk-ras)' }, mk);
  S('text', { class: 'bk-dir', x: 14, y: 310 }, art).textContent = '◀ FRONT';
  S('text', { class: 'bk-dir', x: 386, y: 310, 'text-anchor': 'end' }, art).textContent = 'BACK ▶';
  S('text', { class: 'bk-cap', x: 14, y: 22 }, art).textContent = 'Midline cutaway (dashed = off the midline)';
  return R;
}

/* brainArt(view) → { svg, root, regions, data, setOn(id|null), flash(id, cls, ms), hint(id), label(id|null), showAllLabels(bool), onPick(fn) } */
W2.brainArt = function (view, opts = {}) {
  const uid = W2.uid('bk');
  const svg = S('svg', { role: 'group', 'aria-label': view === 'inner' ? 'Midline cutaway of the brain' : 'Side view of the left hemisphere' });
  const R = view === 'inner' ? drawInner(svg, uid) : drawLateral(svg, uid);
  const data = view === 'inner' ? W2.INNER : W2.LATERAL;
  const order = Object.keys(data);
  const labLayer = S('g', null, svg);
  let pickFn = null, quiz = false;
  const root = h('div', { class: 'bk bk-stage' }, svg);
  Object.entries(R).forEach(([id, g]) => {
    const pick = e => { if (pickFn) pickFn(id, e); };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } });
  });
  function setQuiz(q) { quiz = q; Object.entries(R).forEach(([id, g], i) => g.setAttribute('aria-label', q ? `Brain region ${i + 1}` : (data[id] ? data[id].name : id))); }
  setQuiz(false);
  function pill(id, x, y, text) {
    const g = S('g', { class: 'bk-lab' }, labLayer);
    const w = text.length * 6.9 + 12, hh = 20;
    const vb = svg.viewBox.baseVal; const W = vb.width || 400, H = vb.height || 300;
    const bx = Math.max(2, Math.min(W - w - 2, x - w / 2)), by = Math.max(2, Math.min(H - hh - 2, y - hh / 2));
    S('rect', { x: bx, y: by, width: w, height: hh, rx: 10.5 }, g);
    const t = S('text', { x: bx + w / 2, y: by + 15, 'text-anchor': 'middle' }, g); t.textContent = text;
    return g;
  }
  function short(id) { return data[id].short || data[id].name; }
  let allLabels = false, current = null;
  function drawLabels() {
    labLayer.innerHTML = '';
    if (allLabels) {
      if (view === 'inner') {
        order.forEach((id, i) => {
          const [x, y] = data[id].label; const g = S('g', { class: 'bk-num' }, labLayer);
          S('circle', { cx: x, cy: y, r: 8.5 }, g); const t = S('text', { x, y: y + 3.5, 'text-anchor': 'middle' }, g); t.textContent = i + 1;
        });
      } else order.forEach(id => { if (id !== current) pill(id, data[id].label[0], data[id].label[1], short(id)); });
    }
    if (current && data[current]) {
      const [x, y] = data[current].label;
      pill(current, x, view === 'inner' ? y - 20 : y, short(current));
    }
  }
  const api = {
    svg, root, regions: R, data, order,
    onPick(fn) { pickFn = fn; },
    setQuiz,
    setOn(id) {
      current = id;
      Object.entries(R).forEach(([k, g]) => g.classList.toggle('on', k === id));
      root.classList.toggle('dimming', !!id);
      root.classList.toggle('ras-on', id === 'ras');
      drawLabels();
    },
    label(id) { current = id; drawLabels(); },
    showAllLabels(b) { allLabels = b; drawLabels(); },
    clearMarks() { Object.values(R).forEach(g => g.classList.remove('good', 'bad', 'hint')); },
    mark(id, cls) { if (R[id]) R[id].classList.add(cls); },
    unmark(id, cls) { if (R[id]) R[id].classList.remove(cls); }
  };
  return api;
};

/* ================= region map engine (Explore + Quiz) =================
   cfg: { view, inst, quiz: [{ q: 'html with <em>', a: [ids], near: {id: msg}, why }], perRound } */
W2.regionMap = function (el, api, cfg) {
  const bag = W2.bag();
  const root = h('div', { class: 'w2' });
  const art = W2.brainArt(cfg.view);
  const data = art.data;
  let mode = 'explore';
  const inst = h('p', { class: 'w2-inst' }, cfg.inst);
  const labelsChip = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, 'Show labels');
  labelsChip.addEventListener('click', () => { const on = labelsChip.getAttribute('aria-pressed') !== 'true'; labelsChip.setAttribute('aria-pressed', String(on)); art.showAllLabels(on); chipsNum(on); api.sfx.tap(); });
  const seg = W2.seg([['explore', 'Explore'], ['quiz', 'Quiz me']], 'explore', m => setMode(m), 'Mode');
  const controls = h('div', { class: 'w2-row' }, seg, labelsChip);
  const panel = h('div', { class: 'w2-panel', 'aria-live': 'polite' });
  const chips = h('div', { class: 'w2-chips', role: 'group', 'aria-label': 'Brain parts' });
  const chipEls = {};
  art.order.forEach((id, i) => {
    const c = h('button', { type: 'button', class: 'w2-chip', 'aria-pressed': 'false' }, h('span', { class: 'w2-dot', style: { background: `var(--bk-${data[id].color})` } }), h('span', { class: 'w2-num', hidden: true }, i + 1), data[id].name.replace(/ \(.*\)$/, ''));
    c.addEventListener('click', () => { if (mode === 'explore') { select(id); } });
    chipEls[id] = c; chips.append(c);
  });
  const chipWrap = h('div', { class: 'bk' }, chips);
  function chipsNum(on) { Object.values(chipEls).forEach(c => { c.querySelector('.w2-num').hidden = !(on && cfg.view === 'inner'); }); }
  root.append(inst, controls, art.root, panel, chipWrap);
  el.append(root);

  function select(id) {
    art.setOn(id); api.sfx.tap();
    Object.entries(chipEls).forEach(([k, c]) => c.setAttribute('aria-pressed', String(k === id)));
    const d = data[id];
    panel.innerHTML = '';
    panel.append(h('div', { class: 'w2-tag' }, cfg.view === 'inner' ? 'Inner brain' : 'Cortex and beyond'), h('h4', null, d.name),
      h('div', { class: 'w2-kv' }, h('b', null, 'Where'), d.where),
      h('div', { class: 'w2-kv' }, h('b', null, 'What it does'), h('ul', null, d.does.map(x => h('li', null, x)))),
      h('div', { class: 'w2-hook' }, d.hook));
  }
  function exploreIdle() {
    panel.innerHTML = '';
    panel.append(h('div', { class: 'w2-tag' }, 'Explore'), h('p', { class: 'muted', style: { margin: 0 } }, cfg.idle || 'Tap any part of the brain (or a name below) to learn where it is and what it does.'));
  }
  /* quiz */
  let qs = [], qi = 0, score = 0, misses = 0, locked = false;
  function startQuiz() {
    qs = ML.util.shuffle(cfg.quiz).slice(0, cfg.perRound || 8); qi = 0; score = 0; askQ();
  }
  function askQ() {
    art.clearMarks(); art.setOn(null); misses = 0; locked = false;
    const q = qs[qi];
    panel.innerHTML = '';
    const qEl = h('div', { class: 'w2-q' }); qEl.innerHTML = q.q;
    panel.append(h('div', { class: 'bk-qbar' }, h('span', { class: 'w2-tag' }, `Question ${qi + 1} of ${qs.length}`), h('span', { class: 'w2-score' }, `Score ${score}`)), qEl, fb);
    fb.className = 'w2-fb'; fb.textContent = 'Tap the diagram.';
  }
  const fb = h('div', { class: 'w2-fb' });
  function quizPick(id) {
    if (locked) return;
    const q = qs[qi];
    if (q.a.includes(id)) {
      locked = true;
      art.clearMarks(); art.mark(id, 'good'); art.label(id);
      if (!misses) { score++; api.addXP(2); }
      api.sfx.good();
      fb.className = 'w2-fb good'; fb.innerHTML = '';
      fb.append(h('strong', null, `Yes: ${data[id].name}. `), q.why || data[id].hook);
      const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '8px', display: 'flex' } }, qi + 1 < qs.length ? 'Next question' : 'See my score');
      next.addEventListener('click', () => { qi++; if (qi < qs.length) askQ(); else endQuiz(); });
      fb.append(next); next.focus({ preventScroll: true });
    } else {
      misses++; api.sfx.bad();
      art.clearMarks(); art.mark(id, 'bad'); art.label(id);
      bag.t(() => { art.unmark(id, 'bad'); }, 700);
      fb.className = 'w2-fb bad'; fb.innerHTML = '';
      const near = q.near && q.near[id];
      fb.append(h('strong', null, `That is the ${data[id].name.replace(/ \(.*\)$/, '')}. `), near || `It is in charge of ${data[id].fn}. Try again.`);
      if (misses >= 2) { q.a.forEach(a => art.mark(a, 'hint')); fb.append(' The dashed outline shows where to look.'); }
    }
  }
  function endQuiz() {
    art.clearMarks(); art.setOn(null);
    panel.innerHTML = '';
    const pct = score / qs.length;
    panel.append(h('div', { class: 'w2-tag' }, 'Quiz complete'), h('h4', null, `${score} of ${qs.length} on the first try`),
      h('p', { style: { margin: 0 } }, pct === 1 ? 'Perfect map of the brain. Nice work.' : pct >= .7 ? 'Strong! Explore the ones you missed, then try again.' : 'Good practice. Switch to Explore, review the memory hooks, and try again.'));
    const again = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { justifySelf: 'start', alignSelf: 'flex-start' } }, 'Play again');
    again.addEventListener('click', startQuiz);
    panel.append(again);
    if (pct >= .7) { api.sfx.win(); const r = panel.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 20, 60); }
  }
  function setMode(m) {
    mode = m; api.sfx.tap();
    art.clearMarks(); art.setOn(null);
    art.setQuiz(m === 'quiz');
    labelsChip.hidden = m === 'quiz';
    chipWrap.hidden = m === 'quiz';
    if (m === 'quiz') { art.showAllLabels(false); startQuiz(); }
    else { art.showAllLabels(labelsChip.getAttribute('aria-pressed') === 'true'); Object.values(chipEls).forEach(c => c.setAttribute('aria-pressed', 'false')); exploreIdle(); }
  }
  art.onPick(id => { if (mode === 'explore') select(id); else quizPick(id); });
  exploreIdle();
  return () => bag.destroy();
};

/* ================= EEG generator =================
   types: beta, alpha, theta, n2, delta, rem. Returns value roughly in [-1, 1]. Deterministic in t (seconds). */
const sn = (f, t, p = 0) => Math.sin(2 * Math.PI * f * t + p);
function jitter(t) { return 0.5 * sn(31.7, t, 1.3) + 0.35 * sn(47.3, t, .2) + 0.25 * sn(63.1, t, 2.2); }
W2.eeg = function (type, t) {
  switch (type) {
    case 'beta': return 0.16 * sn(18, t) + 0.12 * sn(23.3, t, 1) + 0.1 * sn(27.9, t, 2) + 0.07 * jitter(t) + 0.05 * sn(7.1, t);
    case 'alpha': return (0.32 + 0.12 * sn(0.45, t)) * sn(10, t) + 0.05 * jitter(t) + 0.04 * sn(21, t);
    case 'theta': return 0.36 * sn(5.5, t) + 0.16 * sn(6.8, t, 1.1) + 0.1 * sn(9.6, t, .4) * (0.5 + 0.5 * sn(0.3, t)) + 0.06 * jitter(t);
    case 'n2': {
      let v = 0.28 * sn(5.2, t) + 0.12 * sn(6.9, t, 1) + 0.05 * jitter(t);
      const sp = ((t % 4.3) + 4.3) % 4.3; // spindle 1.0s
      if (sp > 1 && sp < 2.1) { const e = Math.sin(Math.PI * (sp - 1) / 1.1); v += 0.42 * e * e * sn(13.5, t); }
      const kc = ((t % 6.7) + 6.7) % 6.7; // K-complex
      if (kc > 3.4 && kc < 4.4) { const x = kc - 3.4; v += -1.05 * Math.exp(-Math.pow((x - 0.25) / 0.11, 2)) + 0.7 * Math.exp(-Math.pow((x - 0.6) / 0.16, 2)); }
      return v;
    }
    case 'delta': return 0.72 * sn(1.1, t) + 0.25 * sn(1.9, t, 1.2) + 0.08 * sn(5, t) + 0.04 * jitter(t);
    case 'rem': {
      const saw = ((t * 5.2) % 1 + 1) % 1; const st = (saw < 0.75 ? saw / 0.75 : (1 - saw) / 0.25) - 0.5;
      return 0.16 * st * (0.6 + 0.4 * sn(0.7, t)) + 0.09 * sn(19, t) + 0.07 * sn(24.5, t, 1.4) + 0.08 * jitter(t);
    }
    default: return 0;
  }
};
/* scrolling EEG canvas. opts: { height, secs, reduceMotion, label } → { el, setType(type), stop() } */
W2.eegCanvas = function (opts = {}) {
  const H = opts.height || 90, secs = opts.secs || 4;
  const c = h('canvas', { class: 'w2-eeg', role: 'img', 'aria-label': opts.label || 'EEG brain-wave trace', style: { width: '100%', height: H + 'px', display: 'block', borderRadius: '10px' } });
  const g = c.getContext('2d');
  let type = opts.type || 'alpha', t0 = performance.now(), raf = 0, stopped = false, colors = null, lastCol = 0;
  function readColors(now) {
    if (colors && now - lastCol < 1000) return colors;
    lastCol = now; const cs = getComputedStyle(c);
    colors = { ink: cs.getPropertyValue('--carolina').trim() || '#2F7FB8', grid: cs.getPropertyValue('--line').trim() || '#ccc', bg: cs.getPropertyValue('--surface').trim() || '#fff', spark: cs.getPropertyValue('--spark').trim() || '#e5485f' };
    return colors;
  }
  function draw(now) {
    const w = c.clientWidth || 300; const dpr = Math.min(devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(H * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const col = readColors(now);
    g.fillStyle = col.bg; g.fillRect(0, 0, w, H);
    g.strokeStyle = col.grid; g.lineWidth = 1; g.beginPath();
    for (let x = 0; x < w; x += w / (secs * 2)) { g.moveTo(Math.round(x) + .5, 0); g.lineTo(Math.round(x) + .5, H); }
    g.moveTo(0, H / 2 + .5); g.lineTo(w, H / 2 + .5); g.stroke();
    const tEnd = opts.reduceMotion ? 10 : (now - t0) / 1000;
    const amp = H * 0.44;
    g.strokeStyle = col.ink; g.lineWidth = 1.8; g.lineJoin = 'round'; g.beginPath();
    for (let x = 0; x <= w; x += 1) {
      const t = tEnd - secs + (x / w) * secs;
      const y = H / 2 - Math.max(-1.15, Math.min(1.15, W2.eeg(type, t))) * amp;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    // 1-second scale bar
    g.fillStyle = col.ink; g.globalAlpha = .7; g.fillRect(w - 8 - w / secs, H - 6, w / secs, 2); g.globalAlpha = 1;
  }
  function frame(now) { if (stopped) return; draw(now); if (!opts.reduceMotion) raf = requestAnimationFrame(frame); }
  raf = requestAnimationFrame(frame);
  return {
    el: c,
    setType(tp) { if (tp === type) return; type = tp; if (opts.reduceMotion) requestAnimationFrame(frame); },
    redraw() { requestAnimationFrame(frame); },
    stop() { stopped = true; cancelAnimationFrame(raf); }
  };
};

/* hypnogram stage levels (0 = top) */
W2.STAGE_Y = { W: 0, R: 1, N1: 2, N2: 3, N3: 4 };
W2.STAGE_NAME = { W: 'Awake', R: 'REM', N1: 'NREM 1', N2: 'NREM 2', N3: 'NREM 3' };
/* segments [[stage, minutes], ...] → path string for a step chart */
W2.hypnoPath = function (segs, x0, y0, w, hgt, total) {
  total = total || segs.reduce((a, s) => a + s[1], 0);
  const ys = v => y0 + (W2.STAGE_Y[v] / 4) * hgt;
  let t = 0, d = '';
  segs.forEach(([st, m], i) => {
    const xA = x0 + (t / total) * w, xB = x0 + ((t + m) / total) * w, y = ys(st);
    d += (i ? ` L${xA.toFixed(1)},${y.toFixed(1)}` : `M${xA.toFixed(1)},${y.toFixed(1)}`) + ` L${xB.toFixed(1)},${y.toFixed(1)}`;
    t += m;
  });
  return d;
};
})();
