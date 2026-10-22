/* neuron-anatomy — large labeled neuron: Explore (tap a part), Quiz ("Tap the ___" x8), and Fire! (saltatory impulse). */
(function () {
'use strict';
const CSS = `
.na { display: flex; flex-direction: column; gap: 12px; }
.na-ins { font-size: 15px; color: var(--muted); }
.na-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.na-bar .sp { flex: 1; }
.na-stage { border: 1px solid var(--line); border-radius: 16px; background: radial-gradient(ellipse at 30% 40%, var(--carolina-soft), var(--surface-2) 70%); overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; }
.na-swipe { display: none; font-size: 13px; color: var(--muted); text-align: center; margin-top: -6px; }
@media (max-width: 560px) { .na-stage svg { min-width: 440px; } .na-swipe { display: block; } }
.na-stage svg { width: 100%; max-width: 700px; display: block; margin: 0 auto; touch-action: manipulation; }
.na-part { cursor: pointer; transition: filter .2s, opacity .2s; }
.na-part:focus, .na-part:focus-visible { outline: none; }
.na-part:focus-visible { filter: drop-shadow(0 0 3px var(--ink)); }
.na-part.hl { filter: drop-shadow(0 0 5px var(--spark)) drop-shadow(0 0 2px var(--spark)); }
.na-part.ok { filter: drop-shadow(0 0 6px var(--good)) drop-shadow(0 0 2px var(--good)); }
.na-part.no { filter: drop-shadow(0 0 6px var(--bad)) drop-shadow(0 0 2px var(--bad)); }
.na-part.want { filter: drop-shadow(0 0 6px var(--good)); animation: naBlink .8s ease 3; }
@keyframes naBlink { 50% { opacity: .35; } }
.na-lbl { pointer-events: none; transition: opacity .3s; }
.na-info { border-radius: 14px; padding: 12px 14px; background: var(--surface-2); border-left: 5px solid var(--spark); display: grid; gap: 4px; min-height: 84px; }
.na-info h4 { margin: 0; font-size: 18px; }
.na-info p { font-size: 16px; }
.na-q { border: 2px solid var(--carolina); border-radius: 14px; padding: 12px 14px; display: grid; gap: 6px; }
.na-q .k { display: flex; justify-content: space-between; font-family: var(--f-mono); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); }
.na-q .s { font-size: 21px; font-weight: 700; }
.na-q .s em { font-style: normal; color: var(--spark); }
.na-fb { font-size: 15px; border-radius: 10px; padding: 8px 12px; }
.na-fb.good { background: var(--good-soft); } .na-fb.bad { background: var(--bad-soft); }
`;
const PARTS = {
  dendrites: ['Dendrites', 'The receivers. Branching fibers that pick up messages from other neurons and carry them toward the cell body.'],
  soma: ['Cell body (soma)', 'The control center. It contains the nucleus, keeps the cell alive, and adds up the incoming signals.'],
  nucleus: ['Nucleus', 'Inside the cell body. It holds the cell’s DNA, the instructions for running the neuron (including which neurotransmitter it makes).'],
  hillock: ['Axon hillock', 'Where the cell body meets the axon. If incoming signals push it past threshold, the action potential starts here.'],
  axon: ['Axon', 'The long cable that carries the action potential away from the cell body toward other neurons, muscles, or glands.'],
  myelin: ['Myelin sheath', 'A fatty insulating layer made by glial cells. It speeds up the impulse. Damage to myelin causes multiple sclerosis (MS).'],
  node: ['Node of Ranvier', 'A tiny gap between myelin segments. The impulse jumps from node to node, which makes it much faster.'],
  terminals: ['Axon terminals (terminal buttons)', 'Branched endings filled with vesicles. They release neurotransmitters into the synapse.'],
  synapse: ['Synapse', 'The tiny gap between one neuron’s axon terminal and the next neuron’s dendrite. Neurotransmitters carry the message across.'],
  glia: ['Glial cell', 'Support staff: glia nourish, protect, insulate (they make myelin), and clean up after neurons. The brain has about as many glia as neurons.']
};
const QUIZ_ACCEPT = { axon: ['axon', 'myelin', 'node'], soma: ['soma', 'nucleus'] };
// axon geometry: cubic Bezier
const P = [[188, 172], [282, 172], [296, 272], [416, 262]];
function bz(t) { const u = 1 - t; const f = (i) => u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i]; return [f(0), f(1)]; }
const SAMP = (() => { const a = [{ t: 0, p: bz(0), s: 0 }]; for (let i = 1; i <= 400; i++) { const t = i / 400, p = bz(t), q = a[i - 1].p; a.push({ t, p, s: a[i - 1].s + Math.hypot(p[0] - q[0], p[1] - q[1]) }); } return a; })();
const TOT = SAMP[SAMP.length - 1].s;
const at = s => { s = Math.max(0, Math.min(TOT, s)); let i = SAMP.findIndex(x => x.s >= s); if (i <= 0) return SAMP[0].p; const a = SAMP[i - 1], b = SAMP[i], f = (s - a.s) / (b.s - a.s || 1); return [a.p[0] + (b.p[0] - a.p[0]) * f, a.p[1] + (b.p[1] - a.p[1]) * f]; };
const poly = (s0, s1) => { let d = ''; for (let s = s0; s <= s1 + 0.01; s += 3) { const p = at(Math.min(s, s1)); d += (d ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); } return d; };
const START = 20, END = TOT - 22, NSEG = 5, GAP = 9;
const SEGLEN = (END - START - GAP * (NSEG - 1)) / NSEG;
const SEGS = Array.from({ length: NSEG }, (_, i) => [START + i * (SEGLEN + GAP), START + i * (SEGLEN + GAP) + SEGLEN]);
const NODES = SEGS.slice(0, -1).map(s => s[1] + GAP / 2);

ML.registerWidget('neuron-anatomy', {
  title: 'Anatomy of a neuron', tag: 'Explore + quiz',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('na-css')) document.head.append(h('style', { id: 'na-css' }, CSS));
    let mode = 'explore', labels = false, raf = 0, firing = false;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const root = h('div', { class: 'na' });
    const ins = h('p', { class: 'na-ins' }, 'Explore: tap any part of the neuron to learn its job. Quiz: find the part you are asked for. Press Fire! to send an impulse.');
    const modeBtns = [['explore', 'Explore'], ['quiz', 'Quiz me']].map(([m, l]) => { const b = h('button', { type: 'button', class: 'chip na-mode', 'data-m': m, 'aria-pressed': String(m === mode) }, l); b.addEventListener('click', () => setMode(m)); return b; });
    const lblBtn = h('button', { type: 'button', class: 'btn btn-sm na-labels', 'aria-pressed': 'false' }, 'Show labels');
    const fireBtn = h('button', { type: 'button', class: 'btn btn-sm btn-spark na-fire' }, '⚡ Fire!');
    const svg = svgEl('svg', { viewBox: '0 0 560 340', role: 'group', 'aria-label': 'Neuron diagram. Parts are buttons.' });
    const panel = h('div', { 'aria-live': 'polite' });
    root.append(ins, h('div', { class: 'na-bar' }, h('div', { class: 'na-bar', role: 'group', 'aria-label': 'Mode' }, modeBtns), h('span', { class: 'sp' }), lblBtn, fireBtn), h('div', { class: 'na-stage' }, svg), h('p', { class: 'na-swipe', 'aria-hidden': 'true' }, 'Swipe the diagram sideways to see the whole neuron.'), panel);
    el.append(root);

    /* ---------- drawing ---------- */
    const CB = 'var(--carolina)', MY = '#F3DE9A', MYS = '#C9A445';
    const dend = [
      ['M104 128 L72 98 L46 70', 6], ['M72 98 L40 100', 3.5], ['M46 70 L30 44', 2.5], ['M46 70 L20 70', 2.5], ['M72 98 L76 62', 3], ['M76 62 L66 36', 2], ['M76 62 L96 40', 2],
      ['M96 158 L58 176 L28 172', 6], ['M58 176 L40 206', 3.5], ['M28 172 L12 156', 2.5], ['M40 206 L18 220', 2], ['M40 206 L46 236', 2],
      ['M118 110 L114 72 L126 40', 5], ['M114 72 L98 58', 2.5], ['M126 40 L118 18', 2], ['M126 40 L146 24', 2],
      ['M126 188 L110 230 L120 262', 5], ['M110 230 L86 246', 2.5], ['M120 262 L104 288', 2], ['M120 262 L140 282', 2]];
    const termB = [[456, 226], [474, 254], [466, 288], [444, 312]];
    let s = `
      <g class="na-part" data-part="glia" role="button" tabindex="0" aria-label="Glial cell">
        <circle cx="332" cy="76" r="26" style="fill:transparent"/>
        ${[0, 60, 120, 180, 240, 300].map((a, i) => { const r = a * Math.PI / 180, l = i === 2 ? 52 : 26; return `<path d="M332 76 Q${332 + Math.cos(r + .3) * l * .6} ${76 + Math.sin(r + .3) * l * .6} ${332 + Math.cos(r) * l} ${76 + Math.sin(r) * l}" style="fill:none;stroke:#9B7BEA;stroke-width:4;stroke-linecap:round"/>`; }).join('')}
        <circle cx="332" cy="76" r="12" style="fill:#C8B6F5;stroke:#9B7BEA;stroke-width:2"/></g>
      <g class="na-part" data-part="synapse" role="button" tabindex="0" aria-label="Synapse"><rect x="478" y="236" width="24" height="40" rx="6" style="fill:var(--warn);opacity:.12"/><rect x="474" y="230" width="32" height="52" style="fill:transparent"/></g>
      <g class="na-next"><path d="M502 256 L530 232 L560 214" style="fill:none;stroke:#8BA3C7;stroke-width:7;stroke-linecap:round"/><path d="M498 290 L530 300 L560 290" style="fill:none;stroke:#8BA3C7;stroke-width:6;stroke-linecap:round"/><circle cx="580" cy="250" r="34" style="fill:#C9D6EA;stroke:#8BA3C7;stroke-width:2"/>
        <text x="556" y="150" text-anchor="end" style="font-size:14px;font-weight:700;fill:var(--muted)">next neuron</text></g>
      <g class="na-part" data-part="dendrites" role="button" tabindex="0" aria-label="Dendrites">${dend.map(([d, w]) => `<path d="${d}" style="fill:none;stroke:transparent;stroke-width:18;stroke-linecap:round"/><path class="den" d="${d}" style="fill:none;stroke:${CB};stroke-width:${w};stroke-linecap:round;stroke-linejoin:round"/>`).join('')}</g>
      <g class="na-part" data-part="axon" role="button" tabindex="0" aria-label="Axon"><path d="${poly(0, TOT)}" style="fill:none;stroke:transparent;stroke-width:24"/><path class="ax" d="${poly(0, TOT)}" style="fill:none;stroke:${CB};stroke-width:7;stroke-linecap:round"/></g>
      <g class="na-part" data-part="myelin" role="button" tabindex="0" aria-label="Myelin sheath">${SEGS.map(([a, b]) => `<path d="${poly(a, b)}" style="fill:none;stroke:${MYS};stroke-width:22;stroke-linecap:round"/><path d="${poly(a, b)}" style="fill:none;stroke:${MY};stroke-width:18;stroke-linecap:round"/>`).join('')}</g>
      <g class="na-part" data-part="node" role="button" tabindex="0" aria-label="Node of Ranvier">${NODES.map(n => { const p = at(n); return `<circle cx="${p[0]}" cy="${p[1]}" r="14" style="fill:transparent"/><circle cx="${p[0]}" cy="${p[1]}" r="5" style="fill:none;stroke:var(--spark);stroke-width:2;opacity:.8"/>`; }).join('')}</g>
      <g class="na-part" data-part="terminals" role="button" tabindex="0" aria-label="Axon terminals">
        ${termB.map(([x, y]) => `<path d="M416 262 Q436 ${(262 + y) / 2} ${x} ${y}" style="fill:none;stroke:transparent;stroke-width:16"/><path class="tb" d="M416 262 Q436 ${(262 + y) / 2} ${x} ${y}" style="fill:none;stroke:${CB};stroke-width:4;stroke-linecap:round"/><circle cx="${x}" cy="${y}" r="9" style="fill:var(--spark-soft);stroke:var(--spark);stroke-width:2.5"/><circle cx="${x - 2}" cy="${y - 2}" r="2" style="fill:var(--spark)"/><circle cx="${x + 3}" cy="${y + 2}" r="2" style="fill:var(--spark)"/>`).join('')}</g>
      <g class="na-part" data-part="hillock" role="button" tabindex="0" aria-label="Axon hillock"><path d="M158 150 Q176 160 192 168 L192 176 Q174 182 154 182Z" style="fill:var(--carolina-soft);stroke:${CB};stroke-width:3;stroke-linejoin:round"/><circle cx="178" cy="170" r="14" style="fill:transparent"/></g>
      <g class="na-part" data-part="soma" role="button" tabindex="0" aria-label="Cell body, soma"><path d="M130 106 C160 104 176 128 170 152 C166 178 146 194 122 190 C96 188 84 166 88 144 C92 120 106 106 130 106Z" style="fill:var(--carolina-soft);stroke:${CB};stroke-width:3.5"/></g>
      <g class="na-part" data-part="nucleus" role="button" tabindex="0" aria-label="Nucleus"><circle cx="126" cy="148" r="17" style="fill:#B9D3EE;stroke:${CB};stroke-width:2.5"/><circle cx="121" cy="144" r="5" style="fill:${CB};opacity:.7"/></g>
      <g class="na-fx"></g><g class="na-lbls"></g>`;
    svg.innerHTML = s;
    const partEls = {};
    svg.querySelectorAll('.na-part').forEach(g => {
      partEls[g.dataset.part] = g;
      g.addEventListener('click', () => tap(g.dataset.part));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(g.dataset.part); } });
    });
    const fx = svg.querySelector('.na-fx'), lblG = svg.querySelector('.na-lbls');
    // labels with leader lines
    const nodeP = at(NODES[1]), segP = at((SEGS[2][0] + SEGS[2][1]) / 2), endP = at(TOT - 10);
    const LBL = [['dendrites', 'Dendrites', 8, 22, 'start', 46, 70], ['soma', 'Cell body', 176, 92, 'start', 152, 116], ['nucleus', 'Nucleus', 8, 316, 'start', 120, 160],
      ['hillock', 'Axon hillock', 210, 146, 'start', 180, 168], ['myelin', 'Myelin sheath', 378, 168, 'start', segP[0] + 8, segP[1] - 8], ['node', 'Node', 238, 316, 'start', nodeP[0], nodeP[1] + 6],
      ['axon', 'Axon', 346, 322, 'start', endP[0] - 2, endP[1] + 4], ['terminals', 'Axon terminals', 400, 206, 'start', 452, 222], ['synapse', 'Synapse', 470, 326, 'middle', 490, 280], ['glia', 'Glial cell', 366, 50, 'start', 344, 68]];
    LBL.forEach(([id, t, x, y, anc, tx, ty]) => {
      const g = svgEl('g', { class: 'na-lbl', 'data-for': id, style: 'opacity:0' });
      g.innerHTML = `<line x1="${anc === 'middle' ? x : x + (anc === 'start' ? 2 : 0)}" y1="${y - 7}" x2="${tx}" y2="${ty}" style="stroke:var(--ink);stroke-width:1.4;opacity:.6"/><circle cx="${tx}" cy="${ty}" r="2.6" style="fill:var(--ink)"/>
        <text x="${x}" y="${y}" text-anchor="${anc}" style="font-size:19px;font-weight:700;fill:var(--ink);paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round">${t}</text>`;
      lblG.append(g);
    });
    const showLbl = id => lblG.querySelectorAll('.na-lbl').forEach(g => { g.style.opacity = labels || g.dataset.for === id ? '1' : '0'; });

    /* ---------- explore ---------- */
    let selPart = null;
    function explore(id) {
      selPart = id; Object.values(partEls).forEach(g => g.classList.toggle('hl', g.dataset.part === id));
      showLbl(id);
      panel.innerHTML = '';
      const [name, txt] = PARTS[id];
      panel.append(h('div', { class: 'na-info' }, h('h4', null, name), h('p', null, txt)));
      sfx.blip();
    }
    /* ---------- quiz ---------- */
    let deck = [], qi = 0, score = 0, first = true, answered = false;
    function newQuiz() { deck = api.util.shuffle(Object.keys(PARTS)).slice(0, 8); qi = 0; score = 0; ask(); }
    function clearMarks() { Object.values(partEls).forEach(g => g.classList.remove('hl', 'ok', 'no', 'want')); }
    function ask() {
      clearMarks(); showLbl(null); first = true; answered = false; panel.innerHTML = '';
      if (qi >= deck.length) {
        const again = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Play again'); again.addEventListener('click', () => { sfx.tap(); newQuiz(); });
        panel.append(h('div', { class: 'na-q' }, h('div', { class: 'k' }, h('span', null, 'Quiz complete')), h('div', { class: 's' }, `${score} of ${deck.length} on the first try`), h('div', null, again)));
        if (score >= 7) { sfx.win(); const r = root.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 100, 60); } else sfx.level();
        return;
      }
      const want = deck[qi];
      panel.append(h('div', { class: 'na-q', 'data-want': want }, h('div', { class: 'k' }, h('span', null, `Part ${qi + 1} of ${deck.length}`), h('span', null, `Score ${score}`)), h('div', { class: 's' }, 'Tap the ', h('em', null, PARTS[want][0].replace(/ \(.*\)/, '').toLowerCase()))));
    }
    function quizTap(id) {
      if (answered) return;
      const want = deck[qi], ok = (QUIZ_ACCEPT[want] || [want]).includes(id);
      const box = panel.querySelector('.na-q'); box.querySelector('.na-fb')?.remove();
      if (ok) {
        answered = true; if (first) { score++; api.addXP(2); }
        partEls[id].classList.add('ok'); showLbl(want); sfx.good();
        const note = id !== want ? ` (You tapped the ${PARTS[id][0].toLowerCase()}, which is part of it.)` : '';
        const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, qi === deck.length - 1 ? 'See score' : 'Next →');
        next.addEventListener('click', () => { qi++; sfx.tap(); ask(); });
        box.append(h('div', { class: 'na-fb good' }, h('b', null, first ? 'Yes! ' : 'Got it. '), PARTS[want][1] + note), h('div', null, next));
        later(() => next.focus({ preventScroll: true }), 40);
      } else {
        first = false; sfx.bad();
        const g = partEls[id]; g.classList.add('no'); later(() => g.classList.remove('no'), 700);
        box.append(h('div', { class: 'na-fb bad' }, h('b', null, 'Not quite. '), `That is the ${PARTS[id][0].toLowerCase()}. `, h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => { partEls[want].classList.add('want'); later(() => partEls[want].classList.remove('want'), 2500); } }, 'Show me')));
      }
    }
    function tap(id) { if (firing) return; mode === 'explore' ? explore(id) : quizTap(id); }
    function setMode(m) {
      mode = m; modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m))); sfx.tap(); clearMarks();
      if (m === 'quiz') { labels = false; lblBtn.setAttribute('aria-pressed', 'false'); lblBtn.textContent = 'Show labels'; lblBtn.disabled = true; newQuiz(); }
      else { lblBtn.disabled = false; explore(selPart || 'soma'); }
    }
    lblBtn.addEventListener('click', () => { labels = !labels; lblBtn.setAttribute('aria-pressed', String(labels)); lblBtn.textContent = labels ? 'Hide labels' : 'Show labels'; showLbl(selPart); sfx.tap(); });

    /* ---------- fire! ---------- */
    function dot(r, col) { return svgEl('circle', { r, style: `fill:${col};filter:drop-shadow(0 0 4px ${col})` }); }
    fireBtn.addEventListener('click', () => {
      if (firing) return; firing = true; fireBtn.disabled = true; sfx.fire();
      fx.innerHTML = '';
      const den = [...svg.querySelectorAll('.den')].filter((_, i) => [0, 7, 12, 17].includes(i));
      const tbs = [...svg.querySelectorAll('.tb')];
      const pulses = den.map(() => { const d = dot(5, '#FFD166'); fx.append(d); return d; });
      const head = dot(7, '#FFD166'); head.style.opacity = '0'; fx.append(head);
      const trail = svgEl('path', { style: 'fill:none;stroke:#FFD166;stroke-width:3;stroke-dasharray:4 4;opacity:0' }); fx.append(trail);
      const nts = Array.from({ length: 7 }, () => { const d = svgEl('circle', { r: 2.6, style: 'fill:var(--spark);opacity:0' }); fx.append(d); return d; });
      const somaGlow = svgEl('circle', { cx: 128, cy: 148, r: 44, style: 'fill:#FFD166;opacity:0' }); fx.insertBefore(somaGlow, fx.firstChild);
      const hops = [0, ...NODES, TOT];
      const T = { den: 600, soma: 300, hop: 170 }, tAx = T.den + T.soma, tTerm = tAx + T.hop * (hops.length - 1), tSyn = tTerm + 350, tEnd = tSyn + 700;
      const t0 = performance.now(); let lastHop = -1;
      const f = now => {
        const t = now - t0;
        den.forEach((p, i) => { const L = p.getTotalLength(), u = Math.min(1, t / T.den); const pt = p.getPointAtLength(L * (1 - u)); pulses[i].setAttribute('cx', pt.x); pulses[i].setAttribute('cy', pt.y); pulses[i].style.opacity = u < 1 ? '1' : '0'; });
        somaGlow.style.opacity = String(t > T.den - 100 && t < tAx + 200 ? 0.45 * Math.sin(Math.min(1, (t - T.den + 100) / (T.soma + 300)) * Math.PI) : 0);
        if (t >= tAx && t < tTerm) {
          const k = Math.min(hops.length - 2, Math.floor((t - tAx) / T.hop)), u = ((t - tAx) % T.hop) / T.hop;
          const a = at(hops[k]), b = at(hops[k + 1]);
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 26;
          const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
          head.setAttribute('cx', x); head.setAttribute('cy', y); head.style.opacity = '1';
          trail.setAttribute('d', `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`); trail.style.opacity = '.8';
          if (k !== lastHop) { lastHop = k; if (k > 0) sfx.tone(600 + k * 90, 0.05, 'square', 0.03); }
        } else if (t >= tTerm) { head.style.opacity = '0'; trail.style.opacity = '0'; }
        if (t >= tTerm && t < tSyn + 500) {
          const u = Math.min(1, (t - tTerm) / 350);
          tbs.forEach((p, i) => { const L = p.getTotalLength(), pt = p.getPointAtLength(L * u); pulses[i % pulses.length].setAttribute('cx', pt.x); pulses[i % pulses.length].setAttribute('cy', pt.y); pulses[i % pulses.length].style.opacity = u < 1 ? '1' : '0'; });
        }
        if (t >= tSyn) {
          const u = Math.min(1, (t - tSyn) / 600);
          nts.forEach((d, i) => { d.setAttribute('cx', 480 + u * 20 + (i % 2) * 2); d.setAttribute('cy', 244 + i * 4 + Math.sin(u * 6 + i) * 3); d.style.opacity = u < 1 ? '1' : '0'; });
          svg.querySelector('.na-next').style.filter = u > 0.6 && u < 1 ? 'drop-shadow(0 0 6px #FFD166)' : '';
        }
        if (t < tEnd) raf = requestAnimationFrame(f);
        else { fx.innerHTML = ''; svg.querySelector('.na-next').style.filter = ''; firing = false; fireBtn.disabled = false; raf = 0; }
      };
      raf = requestAnimationFrame(f);
      if (mode === 'explore') { panel.innerHTML = ''; panel.append(h('div', { class: 'na-info' }, h('h4', null, 'Firing!'), h('p', null, 'Dendrites → cell body → axon hillock → down the axon, jumping from node to node across the myelin → axon terminals → neurotransmitters cross the synapse to the next neuron.'))); }
    });
    explore('soma');
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers.clear(); };
  }
});
})();
