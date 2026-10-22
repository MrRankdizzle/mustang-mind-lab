/* ns-tree — interactive nervous-system hierarchy with Explore and "Where does it go?" quiz modes. */
(function () {
'use strict';
const CSS = `
.nst { display: flex; flex-direction: column; gap: 14px; }
.nst-ins { font-size: 15px; color: var(--muted); }
.nst-modes { display: flex; gap: 8px; flex-wrap: wrap; }
.nst-tree { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); padding: 6px; }
.nst-tree svg { width: 100%; max-width: 540px; display: block; margin: 0 auto; }
.nst-node { cursor: pointer; }
.nst-node rect.box { transition: fill .25s, stroke-width .2s, transform .25s; transform-box: fill-box; transform-origin: center; }
.nst-node:hover rect.box, .nst-node:focus-visible rect.box { stroke-width: 3.5; }
.nst-node:focus, .nst-node:focus-visible { outline: none; }
.nst-node:focus-visible rect.box { stroke-dasharray: 5 3; }
.nst-node.sel rect.box { stroke-width: 4; }
.nst-node.ok rect.box { fill: var(--good-soft) !important; stroke: var(--good) !important; stroke-width: 4; }
.nst-node.no rect.box { fill: var(--bad-soft) !important; stroke: var(--bad) !important; stroke-width: 4; animation: nstShake .4s; }
@keyframes nstShake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.reduce-motion .nst-node.no rect.box { animation: none; }
.nst-link { fill: none; stroke: var(--line); stroke-width: 3; transition: stroke .3s; }
.nst-link.on { stroke: var(--spark); stroke-width: 4; }
.nst-pop { transform-box: fill-box; transform-origin: center; animation: nstPop .45s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes nstPop { from { transform: scale(.4); opacity: 0; } }
.reduce-motion .nst-pop { animation: none; }
.nst-info { border-radius: 14px; padding: 12px 14px; background: var(--surface-2); border-left: 5px solid var(--carolina); display: grid; gap: 6px; min-height: 92px; }
.nst-info h4 { margin: 0; font-size: 18px; }
.nst-info p { font-size: 16px; }
.nst-info .ex { font-size: 15px; color: var(--muted); }
.nst-info .ex b { color: var(--ink); }
.nst-q { border: 2px solid var(--carolina); border-radius: 14px; padding: 12px 14px; display: grid; gap: 6px; }
.nst-q .k { font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); font-weight: 700; display: flex; justify-content: space-between; gap: 8px; }
.nst-q .s { font-size: 19px; font-weight: 700; }
.nst-fb { font-size: 15px; border-radius: 10px; padding: 8px 12px; }
.nst-fb.good { background: var(--good-soft); } .nst-fb.bad { background: var(--bad-soft); }
.nst-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
`;
const COL = { ns: ['var(--surface)', 'var(--ink)'], cns: ['var(--carolina-soft)', 'var(--carolina)'], pns: ['var(--good-soft)', 'var(--good)'], aut: ['var(--warn-soft)', 'var(--warn)'], symp: ['var(--spark-soft)', 'var(--spark)'], para: ['var(--blank-soft)', 'var(--blank)'] };
const NODES = [
  { id: 'ns', x: 196, y: 28, w: 172, label: 'Nervous System', c: 'ns', parent: null,
    fn: 'The body’s fast communication network: billions of neurons carrying electrochemical messages.', ex: 'A spider lands on your arm: your senses detect it, your brain decides, and your muscles flick it off.' },
  { id: 'cns', x: 95, y: 100, w: 156, label: 'Central (CNS)', sub: 'brain + spinal cord', c: 'cns', parent: 'ns',
    fn: 'The command center. It integrates incoming sensory information and coordinates the body’s responses.', ex: 'Deciding whether that spider is real or just a piece of lint.' },
  { id: 'pns', x: 290, y: 100, w: 156, label: 'Peripheral (PNS)', sub: 'nerves to the body', c: 'pns', parent: 'ns',
    fn: 'All the nerves outside the brain and spinal cord. Sensory (afferent) nerves carry information TO the CNS; motor (efferent) nerves carry commands FROM it.', ex: 'Nerves in your fingertip reporting that the stove is hot.' },
  { id: 'brain', x: 46, y: 176, w: 84, label: 'Brain', c: 'cns', parent: 'cns',
    fn: 'Thinks, feels, remembers, and sends commands. It interprets what the senses report.', ex: 'Solving a math problem in your head.' },
  { id: 'spinal', x: 142, y: 176, w: 96, label: 'Spinal cord', c: 'cns', parent: 'cns',
    fn: 'The information highway between brain and body. Its interneurons can also run reflexes without waiting for the brain.', ex: 'The knee-jerk reflex at the doctor’s office.' },
  { id: 'som', x: 240, y: 176, w: 92, label: 'Somatic', sub: 'voluntary', c: 'pns', parent: 'pns',
    fn: 'Controls voluntary movements of the skeletal muscles and carries sensations from the skin and muscles.', ex: 'Dancing, drawing, or raising your hand.' },
  { id: 'aut', x: 338, y: 176, w: 92, label: 'Autonomic', sub: 'involuntary', c: 'aut', parent: 'pns',
    fn: 'Controls involuntary actions like heartbeat, breathing, digestion, and glands. It runs on autopilot.', ex: 'Your heart keeps beating while you sleep.' },
  { id: 'symp', x: 198, y: 268, w: 112, label: 'Sympathetic', sub: 'arouses', c: 'symp', parent: 'aut',
    fn: 'Arouses the body for fight-or-flight: heart races, pupils dilate, breathing speeds up, digestion slows, and sugar is released for energy.', ex: 'Your heart pounds before a big test.' },
  { id: 'para', x: 324, y: 268, w: 132, label: 'Parasympathetic', sub: 'calms', c: 'para', parent: 'aut',
    fn: 'Calms the body (rest-and-digest): slows the heart, restarts digestion, conserves energy, and brings you back to homeostasis.', ex: 'Relaxing and digesting after lunch.' }
];
const BY = Object.fromEntries(NODES.map(n => [n.id, n]));
const SCEN = [
  ['You decide to raise your hand in class.', ['som'], 'Choosing to move a skeletal muscle is voluntary, so it is the somatic nervous system.'],
  ['Your heart pounds before a big test.', ['symp'], 'A racing heart is arousal: the sympathetic division’s fight-or-flight response.'],
  ['After lunch, you relax and digest your food.', ['para'], 'Rest-and-digest is the parasympathetic division calming the body.'],
  ['Your spinal cord coordinates a knee-jerk reflex.', ['cns', 'spinal'], 'The spinal cord is part of the CNS, and its interneurons coordinate reflexes without the brain.'],
  ['You work out a tricky math problem in your head.', ['brain', 'cns'], 'Thinking and problem solving happen in the brain, part of the central nervous system.'],
  ['Your pupils widen when a car swerves toward you.', ['symp'], 'Dilated pupils let in more light during danger: a sympathetic response.'],
  ['You text a friend with your thumbs.', ['som'], 'Texting is a voluntary skeletal-muscle movement: somatic.'],
  ['Your heart and lungs keep working while you sleep.', ['aut'], 'Heartbeat and breathing run automatically: the autonomic nervous system.'],
  ['Nerves in your fingertip carry the feeling of a hot pan toward your spinal cord.', ['pns'], 'Sensory (afferent) nerves outside the brain and spinal cord belong to the peripheral nervous system.'],
  ['The scare is over and your heart rate slowly drops back to normal.', ['para'], 'Returning to calm and homeostasis is the parasympathetic division’s job.'],
  ['A sprinter pushes off the starting blocks.', ['som'], 'Moving the legs on purpose uses the somatic nervous system (and yes, the sympathetic division is pumping the heart too).'],
  ['Your mouth waters and your stomach starts digesting when you smell dinner.', ['para'], 'Salivating and digesting are rest-and-digest functions of the parasympathetic division.']
];

ML.registerWidget('ns-tree', {
  title: 'Map the nervous system', tag: 'Explore + quiz',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('nst-css')) document.head.append(h('style', { id: 'nst-css' }, CSS));
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    let mode = 'explore', sel = null;
    const root = h('div', { class: 'nst' });
    const ins = h('p', { class: 'nst-ins' }, 'Explore: tap any box to learn what that division does. Quiz: read the scenario and tap the division in charge.');
    const modeBtns = [['explore', 'Explore'], ['quiz', 'Where does it go? (quiz)']].map(([m, l]) => {
      const b = h('button', { type: 'button', class: 'chip nst-mode', 'data-m': m, 'aria-pressed': String(m === mode) }, l);
      b.addEventListener('click', () => setMode(m)); return b;
    });
    const svg = svgEl('svg', { viewBox: '0 0 392 296', role: 'group', 'aria-label': 'Nervous system hierarchy' });
    const panel = h('div', { 'aria-live': 'polite' });
    root.append(ins, h('div', { class: 'nst-modes', role: 'group', 'aria-label': 'Mode' }, modeBtns), h('div', { class: 'nst-tree' }, svg), panel);
    el.append(root);

    // ---- draw tree ----
    const H = n => n.sub ? 42 : 32;
    const links = {};
    let s = '';
    NODES.forEach(n => {
      if (!n.parent) return;
      const p = BY[n.parent], y1 = p.y + H(p) / 2, y2 = n.y - H(n) / 2, my = (y1 + y2) / 2;
      s += `<path class="nst-link" data-to="${n.id}" d="M${p.x} ${y1} C${p.x} ${my} ${n.x} ${my} ${n.x} ${y2}"/>`;
    });
    svg.innerHTML = s;
    svg.querySelectorAll('.nst-link').forEach(l => links[l.dataset.to] = l);
    const nodeEls = {};
    NODES.forEach((n, i) => {
      const [fill, stroke] = COL[n.c], hh = H(n);
      const g = svgEl('g', { class: 'nst-node', 'data-node': n.id, tabindex: '0', role: 'button', 'aria-label': n.label + (n.sub ? `, ${n.sub}` : '') });
      g.innerHTML = `<g class="${api.reduceMotion ? '' : 'nst-pop'}" style="animation-delay:${i * 60}ms"><rect class="box" x="${n.x - n.w / 2}" y="${n.y - hh / 2}" width="${n.w}" height="${hh}" rx="11" style="fill:${fill};stroke:${stroke};stroke-width:2"/>
        <text x="${n.x}" y="${n.y + (n.sub ? -3 : 5)}" text-anchor="middle" style="font-size:${n.id === 'ns' ? 15 : 14}px;font-weight:700;fill:var(--ink)">${n.label}</text>
        ${n.sub ? `<text x="${n.x}" y="${n.y + 13}" text-anchor="middle" style="font-size:11.5px;fill:var(--muted)">${n.sub}</text>` : ''}</g>`;
      g.addEventListener('click', () => tap(n.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(n.id); } });
      svg.append(g); nodeEls[n.id] = g;
    });
    function lightPath(id) {
      Object.values(links).forEach(l => l.classList.remove('on'));
      let n = BY[id];
      while (n && n.parent) { links[n.id].classList.add('on'); n = BY[n.parent]; }
    }
    function crumbs(id) { const a = []; let n = BY[id]; while (n) { a.unshift(n.label); n = BY[n.parent]; } return a.join(' → '); }

    // ---- explore ----
    function explore(id) {
      sel = id;
      Object.values(nodeEls).forEach(g => g.classList.toggle('sel', g.dataset.node === id));
      lightPath(id);
      const n = BY[id];
      panel.innerHTML = '';
      const info = h('div', { class: 'nst-info', style: { borderLeftColor: COL[n.c][1] === 'var(--ink)' ? 'var(--carolina)' : COL[n.c][1] } },
        h('div', { style: { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--f-mono)' } }, crumbs(id)),
        h('h4', null, n.label), h('p', null, n.fn), h('p', { class: 'ex' }, h('b', null, 'Example: '), n.ex));
      panel.append(info);
      sfx.blip();
    }
    // ---- quiz ----
    let deck = [], qi = 0, score = 0, answered = false, firstTry = true;
    function newQuiz() { deck = api.util.shuffle(SCEN).slice(0, 8); qi = 0; score = 0; ask(); }
    function ask() {
      answered = false; firstTry = true;
      Object.values(nodeEls).forEach(g => g.classList.remove('ok', 'no', 'sel'));
      Object.values(links).forEach(l => l.classList.remove('on'));
      panel.innerHTML = '';
      if (qi >= deck.length) {
        const again = h('button', { type: 'button', class: 'btn btn-primary' }, 'Play again');
        again.addEventListener('click', () => { sfx.tap(); newQuiz(); });
        panel.append(h('div', { class: 'nst-q' }, h('div', { class: 'k' }, h('span', null, 'Quiz complete')), h('div', { class: 's' }, `${score} of ${deck.length} on the first try`),
          h('p', null, score >= 7 ? 'Excellent. You can sort real situations into the right division.' : score >= 5 ? 'Solid work. Explore the boxes you missed, then try again.' : 'Good start. Use Explore mode to review each division, then play again.'), h('div', { class: 'nst-row' }, again)));
        if (score >= 7) { sfx.win(); const r = root.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 80, 60); } else sfx.level();
        return;
      }
      const [q, ans] = deck[qi];
      panel.append(h('div', { class: 'nst-q', 'data-ans': ans.join(',') }, h('div', { class: 'k' }, h('span', null, `Scenario ${qi + 1} of ${deck.length}`), h('span', null, `Score ${score}`)), h('div', { class: 's' }, q), h('div', { class: 'ins', style: { fontSize: '14px', color: 'var(--muted)' } }, 'Tap the division in charge.')));
    }
    function quizTap(id) {
      if (answered) return;
      const [, ans, why] = deck[qi];
      const box = panel.querySelector('.nst-q');
      box.querySelector('.nst-fb')?.remove();
      if (ans.includes(id)) {
        answered = true; if (firstTry) { score++; api.addXP(2); }
        nodeEls[id].classList.add('ok'); lightPath(id); sfx.good();
        const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, qi === deck.length - 1 ? 'See score' : 'Next scenario →');
        next.addEventListener('click', () => { qi++; sfx.tap(); ask(); });
        box.append(h('div', { class: 'nst-fb good' }, h('b', null, firstTry ? 'Yes! ' : 'Got it. '), why), h('div', { class: 'nst-row' }, next));
        later(() => next.focus({ preventScroll: true }), 50);
      } else {
        firstTry = false;
        const g = nodeEls[id]; g.classList.remove('no'); void g.getBoundingClientRect(); g.classList.add('no'); sfx.bad();
        later(() => g.classList.remove('no'), 900);
        const n = BY[id];
        box.append(h('div', { class: 'nst-fb bad' }, h('b', null, 'Not quite. '), `${n.label}: ${n.fn.split('.')[0]}. Try another box.`));
      }
    }
    function tap(id) { if (mode === 'explore') explore(id); else quizTap(id); }
    function setMode(m) {
      mode = m; modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m))); sfx.tap();
      Object.values(nodeEls).forEach(g => g.classList.remove('ok', 'no', 'sel'));
      if (m === 'quiz') newQuiz(); else explore(sel || 'ns');
    }
    explore('ns');
    return () => { timers.forEach(clearTimeout); timers.clear(); };
  }
});
})();
