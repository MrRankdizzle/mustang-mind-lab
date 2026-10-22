/* plasticity: a small neural network. Practice strengthens a pathway; an injury knocks out neurons;
   rewiring and more practice let neighbors take over. Child vs. adult brain changes how fast. */
(function () {
'use strict';
const C = 6, R = 4, BASE = 0.07;
ML.w2.css('plasticity-css', `
.pla svg { width: 100%; height: auto; display: block; touch-action: manipulation; }
.pla-stage { background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; }
.pla-e { stroke: var(--carolina); stroke-linecap: round; fill: none; }
.pla-e.new { stroke: var(--good); stroke-dasharray: 5 4; }
.pla-e.dead { stroke: var(--muted); stroke-dasharray: 2 5; opacity: .35; }
.pla-n { fill: var(--surface); stroke: var(--carolina); stroke-width: 2.4; transition: fill .3s; }
.pla-n.hot { fill: var(--carolina); }
.pla-n.dead { fill: var(--line); stroke: var(--muted); }
.pla-n.take { stroke: var(--good); stroke-width: 3.4; }
.pla-x { stroke: var(--bad); stroke-width: 2.6; stroke-linecap: round; }
.pla-io { fill: var(--spark); }
.pla-io-t { fill: var(--ink); font: 700 13px var(--f-body); }
.pla-zone { fill: var(--bad-soft); stroke: var(--bad); stroke-dasharray: 5 4; stroke-width: 1.5; }
.pla-zt { fill: var(--bad); font: 700 12px var(--f-mono); letter-spacing: .06em; }
.pla-pulse { fill: #FFD166; stroke: #8a5a00; }
.pla-btns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
@media (max-width: 520px) { .pla-btns { grid-template-columns: repeat(2, 1fr); } }
.pla-btns .btn { width: 100%; padding: 10px 8px; }
.pla-sk { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; font-weight: 700; }
.pla-sk .w2-meter { height: 14px; }
.pla-sk .w2-meter > i { background: linear-gradient(90deg, var(--carolina), var(--good)); }
`);

ML.registerWidget('plasticity', {
  title: 'Rewire it: neuroplasticity', tag: 'Simulation',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    let age = 'child';
    const root = h('div', { class: 'w2 pla' });
    const inst = h('p', { class: 'w2-inst' }, 'Tap Practice to learn a guitar chord. Then cause an Injury and see if the brain can rewire.');
    const ageSeg = W2.seg([['child', 'Child brain'], ['adult', 'Adult brain']], age, v => { age = v; api.sfx.tap(); say(v === 'child' ? 'Child brain: connections grow fast and sprout easily. Plasticity is highest in childhood.' : 'Adult brain: still plastic, but changes take more practice.'); }, 'Brain age');
    const svg = S('svg', { viewBox: '0 0 360 230', role: 'img', 'aria-label': 'Network of neurons between a sensory input and a movement output' });
    const stage = h('div', { class: 'pla-stage' }, svg);
    const bP = h('button', { type: 'button', class: 'btn btn-primary' }, 'Practice');
    const bI = h('button', { type: 'button', class: 'btn btn-spark' }, 'Injury');
    const bW = h('button', { type: 'button', class: 'btn' }, 'Rewire');
    const bR = h('button', { type: 'button', class: 'btn btn-ghost' }, 'Reset');
    bW.setAttribute('aria-label', 'Rewire: sprout new connections around the damage');
    const skillBar = h('i', { style: { width: '0%' } }), skillTxt = h('span', { class: 'readout' }, '0%');
    const reps = h('span', { class: 'w2-score' });
    const msg = h('div', { class: 'w2-fb', 'aria-live': 'polite' });
    const note = h('div', { class: 'w2-fb warn' }, h('strong', null, 'Real case: hemispherectomy. '), 'Some children with severe seizures have half of their brain removed. Because young brains are so plastic, the remaining hemisphere often takes over language and movement, and many go on to walk, talk, and do well in school. Plasticity is highest in childhood, but it continues for life: every time you learn something, you reshape your brain.');
    root.append(inst, ageSeg, stage, h('div', { class: 'pla-btns' }, bP, bI, bW, bR), h('div', { class: 'pla-sk' }, h('span', null, 'Skill'), h('div', { class: 'w2-meter' }, skillBar), skillTxt), reps, msg, note);
    el.append(root);

    /* network */
    let nodes, edges, injured, practiced, rewired, busy = false, pathNow = [];
    const IN = C * R, OUT = C * R + 1;
    const key = (a, b) => a < b ? a + '-' + b : b + '-' + a;
    function build() {
      nodes = [];
      for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) {
        const jx = Math.sin(c * 7.1 + r * 3.3) * 7, jy = Math.cos(c * 5.3 + r * 2.1) * 7;
        nodes.push({ x: 72 + c * 44 + jx, y: 40 + r * 50 + jy, alive: true, c, r });
      }
      nodes.push({ x: 22, y: 115, alive: true, io: 'in' }, { x: 338, y: 115, alive: true, io: 'out' });
      edges = new Map();
      const add = (a, b, w, nw) => { const k = key(a, b); if (!edges.has(k)) edges.set(k, { a, b, w, nw: !!nw }); };
      const id = (c, r) => c * R + r;
      for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) {
        if (r < R - 1) add(id(c, r), id(c, r + 1), BASE);
        if (c < C - 1) { add(id(c, r), id(c + 1, r), r === 1 ? 0.22 : BASE); if (r > 0) add(id(c, r), id(c + 1, r - 1), BASE); if (r < R - 1) add(id(c, r), id(c + 1, r + 1), BASE); }
      }
      for (let r = 0; r < R; r++) { add(IN, id(0, r), r === 1 ? 0.22 : BASE); add(id(C - 1, r), OUT, r === 1 ? 0.22 : BASE); }
      injured = false; practiced = 0; rewired = false; pathNow = bestPath();
    }
    function bestPath() {
      const dist = new Map([[IN, 0]]), prev = new Map(), done = new Set();
      while (true) {
        let u = null, du = Infinity;
        dist.forEach((d, n) => { if (!done.has(n) && d < du) { du = d; u = n; } });
        if (u == null || u === OUT) break;
        done.add(u);
        edges.forEach(e => {
          if (e.a !== u && e.b !== u) return;
          const v = e.a === u ? e.b : e.a;
          if (!nodes[v].alive || done.has(v)) return;
          const nd = du + 1 / (e.w + 0.02);
          if (nd < (dist.get(v) ?? Infinity)) { dist.set(v, nd); prev.set(v, u); }
        });
      }
      if (!dist.has(OUT)) return [];
      const p = [OUT]; while (p[0] !== IN) p.unshift(prev.get(p[0]));
      return p;
    }
    const pathEdges = p => p.slice(1).map((n, i) => edges.get(key(p[i], n)));
    function skill() { if (!pathNow.length) return 0; const m = Math.min(...pathEdges(pathNow).map(e => e.w)); return Math.max(0, Math.min(1, (m - BASE) / (0.92 - BASE))); }

    /* draw */
    const gE = S('g', null, svg), gZ = S('g', null, svg), gN = S('g', null, svg), gP = S('g', null, svg);
    function draw() {
      gE.innerHTML = ''; gN.innerHTML = ''; gZ.innerHTML = '';
      const onPath = new Set(pathEdges(pathNow).filter(Boolean).map(e => key(e.a, e.b)));
      const pathNodes = new Set(pathNow);
      if (injured) {
        const dead = nodes.filter(n => !n.alive);
        const xs = dead.map(n => n.x), ys = dead.map(n => n.y);
        S('rect', { class: 'pla-zone', x: Math.min(...xs) - 18, y: Math.min(...ys) - 18, width: Math.max(...xs) - Math.min(...xs) + 36, height: Math.max(...ys) - Math.min(...ys) + 36, rx: 14 }, gZ);
        const t = S('text', { class: 'pla-zt', x: (Math.min(...xs) + Math.max(...xs)) / 2, y: Math.max(...ys) + 32, 'text-anchor': 'middle' }, gZ); t.textContent = 'DAMAGED';
      }
      edges.forEach(e => {
        const A = nodes[e.a], B = nodes[e.b];
        const dead = !A.alive || !B.alive;
        const on = onPath.has(key(e.a, e.b));
        S('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: 'pla-e' + (dead ? ' dead' : e.nw ? ' new' : ''),
          style: dead ? 'stroke-width:1.2' : `stroke-width:${(1 + 8 * e.w).toFixed(2)};opacity:${(0.18 + 0.82 * e.w).toFixed(2)}${on && e.w > .5 ? ';filter:drop-shadow(0 0 3px rgba(75,156,211,.8))' : ''}` }, gE);
      });
      nodes.forEach((n, i) => {
        if (n.io) {
          S('circle', { class: 'pla-io', cx: n.x, cy: n.y, r: 11 }, gN);
          const t = S('text', { class: 'pla-io-t', x: n.x, y: n.io === 'in' ? 214 : 214, 'text-anchor': n.io === 'in' ? 'start' : 'end' }, gN);
          t.setAttribute('x', n.io === 'in' ? 8 : 352); t.textContent = n.io === 'in' ? 'See the chord' : 'Play it';
          return;
        }
        const cls = 'pla-n' + (!n.alive ? ' dead' : pathNodes.has(i) && skill() > .35 ? ' hot' : '') + (n.take && n.alive ? ' take' : '');
        S('circle', { class: cls, cx: n.x, cy: n.y, r: 8 }, gN);
        if (!n.alive) { S('line', { class: 'pla-x', x1: n.x - 5, y1: n.y - 5, x2: n.x + 5, y2: n.y + 5 }, gN); S('line', { class: 'pla-x', x1: n.x + 5, y1: n.y - 5, x2: n.x - 5, y2: n.y + 5 }, gN); }
      });
      const sk = skill();
      skillBar.style.width = Math.round(sk * 100) + '%'; skillTxt.textContent = Math.round(sk * 100) + '%';
      reps.textContent = `Practice sessions: ${practiced}`;
      bW.disabled = !injured || rewired; bI.disabled = injured;
    }
    function say(t, cls) { msg.className = 'w2-fb ' + (cls || ''); msg.textContent = t; }

    /* actions */
    let raf = 0;
    function firePulse(p, done) {
      if (api.reduceMotion || !p.length) { done(); return; }
      const pts = p.map(n => [nodes[n].x, nodes[n].y]);
      const c = S('circle', { class: 'pla-pulse', r: 6 }, gP);
      const s0 = performance.now(), dur = 900;
      const step = now => {
        const f = Math.max(0, Math.min(1, (now - s0) / dur)), segs = pts.length - 1, k = Math.min(segs - 1, Math.floor(f * segs)), u = f * segs - k;
        c.setAttribute('cx', pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u); c.setAttribute('cy', pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u);
        if (f < 1) raf = requestAnimationFrame(step); else { c.remove(); done(); }
      };
      raf = requestAnimationFrame(step);
    }
    function practice() {
      if (busy) return; busy = true; setBusy(true);
      pathNow = bestPath();
      if (!pathNow.length) { busy = false; setBusy(false); say('No route left! Tap Rewire to sprout new connections.', 'bad'); api.sfx.bad(); return; }
      api.sfx.tone(440 + skill() * 440, .15, 'triangle', .08);
      draw();
      firePulse(pathNow, () => {
        const rate = age === 'child' ? 0.34 : 0.18;
        const used = new Set(pathEdges(pathNow).map(e => key(e.a, e.b)));
        edges.forEach((e, k) => { if (used.has(k)) e.w = Math.min(1, e.w + rate * (1 - e.w)); else e.w = Math.max(BASE, e.w - 0.012); });
        practiced++;
        pathNow = bestPath();
        const sk = skill();
        busy = false; setBusy(false); draw();
        if (sk > .85) { say(injured ? 'Recovered! Healthy neighbors took over the damaged area’s job. That is neuroplasticity.' : 'Mastered! Repetition built a strong, fast pathway. Unused connections faded: use it or lose it.', 'good'); api.sfx.good(); if (!api.reduceMotion && practiced % 3 === 0) { const r = stage.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 40, 30); } api.addXP(1); }
        else if (injured) say(`Practice ${practiced}: the signal detours around the damage, and that new route gets stronger each time.`, '');
        else say(`Practice ${practiced}: synapses along the path get stronger, so the signal travels faster and more reliably.`, '');
      });
    }
    function injury() {
      if (busy || injured) return;
      const p = pathNow.length ? pathNow : bestPath();
      const mids = p.filter(n => nodes[n].c === 2 || nodes[n].c === 3);
      const rows = mids.length ? mids.map(n => nodes[n].r) : [1];
      const rc = Math.round(rows.reduce((a, b) => a + b, 0) / rows.length);
      const r0 = Math.max(0, Math.min(R - 3, rc - 1));
      nodes.forEach(n => { if (!n.io && (n.c === 2 || n.c === 3) && n.r >= r0 && n.r <= r0 + 2) n.alive = false; });
      injured = true; api.sfx.boom();
      if (!api.reduceMotion) { stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); }
      pathNow = bestPath(); draw();
      say('Stroke! Neurons in the middle died, and the strong pathway is broken. Skill crashes. Keep practicing, or tap Rewire.', 'bad');
    }
    function rewire() {
      if (!injured || rewired) return;
      rewired = true;
      const alive = nodes.map((n, i) => [n, i]).filter(([n]) => n.alive && !n.io);
      const near = alive.filter(([n]) => n.c >= 1 && n.c <= 4);
      let added = 0;
      near.forEach(([n, i]) => near.forEach(([m, j]) => {
        if (i >= j) return;
        const dc = Math.abs(n.c - m.c), dr = Math.abs(n.r - m.r);
        if ((dc === 3 && dr <= 1) || (dc === 2 && dr <= 1)) {
          if (age === 'adult' && (i + j) % 2) return;
          const k = key(i, j); if (!edges.has(k)) { edges.set(k, { a: i, b: j, w: 0.16, nw: true }); added++; m.take = true; n.take = true; }
        }
      }));
      api.sfx.tone(300, .5, 'sine', .07, 900);
      pathNow = bestPath(); draw();
      say(`Rewired: ${added} new connections sprouted (green) and healthy neighbors (green rings) start taking over. Now practice to strengthen the new route.`, 'good');
    }
    function setBusy(b) { bP.disabled = b; }
    bP.addEventListener('click', practice);
    bI.addEventListener('click', injury);
    bW.addEventListener('click', rewire);
    bR.addEventListener('click', () => { cancelAnimationFrame(raf); gP.innerHTML = ''; busy = false; setBusy(false); build(); draw(); say('Fresh brain. A weak connection already links seeing the chord to playing it.'); api.sfx.tap(); });
    build(); draw(); say('A weak connection already links seeing the chord to playing it. Practice it a few times.');
    return () => { cancelAnimationFrame(raf); bag.destroy(); };
  }
});
})();
