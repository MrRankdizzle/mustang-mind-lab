/* epigenetics-switch — environment adds/removes epigenetic tags that dim or brighten genes; the DNA letters never change.
   Feature: the "licking rat pups" study. */
(function () {
'use strict';
const CSS = `
.epi { display: flex; flex-direction: column; gap: 14px; }
.epi-ins { font-size: 15px; color: var(--muted); }
.epi-dna { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); overflow: hidden; }
.epi-dna svg { width: 100%; max-width: 540px; display: block; margin: 0 auto; }
.epi-strip { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; border-top: 1px solid var(--line); font-size: 14px; }
.epi-same { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--good); font-family: var(--f-mono); font-size: 13px; border-radius: 99px; padding: 3px 10px; background: var(--good-soft); }
.epi-same.flash { animation: epiFlash .9s ease; }
@keyframes epiFlash { 30% { transform: scale(1.12); box-shadow: 0 0 0 6px var(--good-soft); } }
.reduce-motion .epi-same.flash { animation: none; }
.epi-legend { color: var(--muted); display: flex; align-items: center; gap: 6px; }
.epi-legend i { width: 12px; height: 12px; border-radius: 50%; background: #E0A030; border: 2px solid #A86A10; display: inline-block; }
.epi-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 8px; }
.epi-card { text-align: left; border: 1.5px solid var(--line); background: var(--surface); border-radius: 14px; padding: 10px 12px; cursor: pointer; display: grid; gap: 3px; color: var(--ink); transition: transform .12s, border-color .12s; }
.epi-card:hover { border-color: var(--carolina); transform: translateY(-2px); }
.epi-card:active { transform: scale(.98); }
.epi-card b { font-size: 15px; }
.epi-card span { font-size: 13px; color: var(--muted); }
.epi-card .bar { height: 5px; border-radius: 3px; margin-bottom: 4px; }
.epi-log { font-size: 15px; min-height: 2.6em; background: var(--surface-2); border-radius: 12px; padding: 10px 12px; border-left: 4px solid var(--carolina); }
.epi-row { display: flex; gap: 8px; flex-wrap: wrap; }
.epi-rat { border: 1.5px solid var(--spark); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.epi-rat h4 { margin: 0; font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--spark); }
.epi-rat p { font-size: 16px; }
.epi-rat svg { width: 100%; max-width: 460px; display: block; margin: 0 auto; }
.epi-out { font-size: 15px; background: var(--spark-soft); border-radius: 12px; padding: 10px 12px; min-height: 3em; }
`;
const SEQ = 'TACGATTCAGGCTAATCGGATCCA';
const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
const BC = { A: '#E5485F', T: '#E0B020', G: '#35B88A', C: '#4B9CD3' };
const GENES = [
  { name: 'Stress control', sub: 'cortisol receptor gene', start: 0, base: 1 },
  { name: 'Brain growth', sub: 'BDNF gene', start: 8, base: 1 },
  { name: 'Inflammation', sub: 'immune gene', start: 16, base: 2 }
];
const EXPR = [100, 74, 50, 30, 14];
const ENVS = [
  { id: 'stress', name: 'Chronic stress', hint: 'Months of fear or pressure', col: 'var(--bad)', d: [2, 1, -2],
    msg: 'Chronic stress added tags to the stress-control and brain-growth genes (turned DOWN) and removed tags from the inflammation gene (turned UP).' },
  { id: 'care', name: 'Nurturing care', hint: 'Like a mother rat licking her pups', col: 'var(--good)', d: [-2, -1, 0],
    msg: 'Nurturing care removed tags from the stress-control gene, turning it UP. More cortisol receptors help the brain shut off a stress response.' },
  { id: 'food', name: 'Healthy nutrition', hint: 'Nutrients the tagging system uses', col: 'var(--warn)', d: 'reset',
    msg: 'Good nutrition supplies raw materials the cell uses to place tags correctly, nudging each gene back toward its typical setting.' },
  { id: 'exercise', name: 'Exercise', hint: 'Regular movement', col: 'var(--carolina)', d: [0, -2, 1],
    msg: 'Exercise removed tags from the brain-growth gene (turned UP), which supports learning and new connections, and quieted the inflammation gene.' },
  { id: 'toxin', name: 'Toxins', hint: 'Like cigarette smoke', col: '#7A6FE0', d: [1, 1, -1],
    msg: 'Toxins scrambled the tag pattern, turning some genes down and the inflammation gene up, without changing a single DNA letter.' }
];

ML.registerWidget('epigenetics-switch', {
  title: 'Epigenetics: the dimmer switches', tag: 'Simulation',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('epi-css')) document.head.append(h('style', { id: 'epi-css' }, CSS));
    const timers = new Set(); let raf = 0, vis = true;
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const root = h('div', { class: 'epi' });
    const ins = h('p', { class: 'epi-ins' }, 'Tap an environment card. Watch the tags change how loudly each gene is "read," while the DNA letters stay exactly the same.');
    const svg = svgEl('svg', { viewBox: '0 6 360 210', role: 'img', 'aria-label': 'A DNA strand with three genes and their expression levels' });
    const same = h('span', { class: 'epi-same' }, '✓ DNA letters changed: 0');
    const strip = h('div', { class: 'epi-strip' }, same, h('span', { class: 'epi-legend' }, h('i'), 'tag = methyl group that turns a gene down'));
    const log = h('div', { class: 'epi-log', 'aria-live': 'polite' }, 'Every cell has the same DNA. Epigenetic tags decide which genes get read, and how much.');
    const reset = h('button', { type: 'button', class: 'btn btn-sm' }, '↻ Reset tags');
    const cards = ENVS.map(E => {
      const b = h('button', { type: 'button', class: 'epi-card', 'data-env': E.id }, h('div', { class: 'bar', style: { background: E.col } }), h('b', null, E.name), h('span', null, E.hint));
      b.addEventListener('click', () => apply(E));
      return b;
    });
    let cleanRat = () => {};
    root.append(ins, h('div', { class: 'epi-dna' }, svg, strip), h('div', { class: 'epi-cards' }, cards), log, h('div', { class: 'epi-row' }, reset), ratPanel());
    el.append(root);

    /* ---- DNA drawing ---- */
    const X = i => 24 + i * 13.5;
    let s = `<line x1="14" y1="86" x2="346" y2="86" style="stroke:var(--ink);stroke-width:3;opacity:.7"/><line x1="14" y1="130" x2="346" y2="130" style="stroke:var(--muted);stroke-width:3;opacity:.7"/>`;
    SEQ.split('').forEach((c, i) => {
      const x = X(i), d = COMP[c];
      s += `<line x1="${x}" y1="86" x2="${x}" y2="108" style="stroke:${BC[c]};stroke-width:4"/><line x1="${x}" y1="108" x2="${x}" y2="130" style="stroke:${BC[d]};stroke-width:4"/>
        <text x="${x}" y="80" text-anchor="middle" style="font-family:var(--f-mono);font-size:13px;font-weight:700;fill:var(--ink)">${c}</text>
        <text x="${x}" y="144" text-anchor="middle" style="font-family:var(--f-mono);font-size:13px;font-weight:700;fill:var(--muted)">${d}</text>`;
    });
    GENES.forEach((g, k) => {
      const a = X(g.start) - 6, b = X(g.start + 7) - 7.5;
      s += `<rect x="${a}" y="66" width="${b - a}" height="84" rx="6" class="epi-gbox" data-k="${k}" style="fill:var(--carolina);opacity:.08"/>
        <path d="M${a} 154 v5 h${b - a} v-5" style="fill:none;stroke:var(--carolina);stroke-width:2"/>
        <text x="${(a + b) / 2}" y="175" text-anchor="middle" style="font-size:13.5px;font-weight:700;fill:var(--ink)">${g.name}</text>
        <g class="epi-bulb" data-k="${k}" transform="translate(${(a + b) / 2 - 30} 186)"><rect width="60" height="10" rx="5" style="fill:var(--line)"/><rect class="lvl" width="60" height="10" rx="5" style="fill:var(--good)"/><text class="pct" x="30" y="25" text-anchor="middle" style="font-family:var(--f-mono);font-size:13px;font-weight:700;fill:var(--muted)">100%</text></g>
        <g class="epi-glow" data-k="${k}"><circle cx="${(a + b) / 2}" cy="108" r="30" style="fill:#FFD166;opacity:0"/></g>`;
    });
    s += `<g class="epi-tags"></g><g class="epi-parts"></g>
      <text x="180" y="22" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--muted)">Gene expression: how much each gene is used</text>`;
    svg.innerHTML = s;
    const tagG = svg.querySelector('.epi-tags'), partG = svg.querySelector('.epi-parts');
    const tags = GENES.map(() => []); // per gene list of tag elements
    const slotX = (k, j) => X(GENES[k].start) + 4 + j * 22;
    function addTag(k, delay) {
      if (tags[k].length >= 4) return;
      const j = [0, 1, 2, 3].find(q => !tags[k].some(t => t.j === q));
      const g = svgEl('g', { style: `opacity:0;transform:translate(${slotX(k, j)}px,${api.reduceMotion ? 0 : -60}px)` });
      g.innerHTML = `<line x1="0" y1="86" x2="0" y2="62" style="stroke:#A86A10;stroke-width:2"/><circle cx="0" cy="56" r="7" style="fill:#E0A030;stroke:#A86A10;stroke-width:2"/><text x="0" y="59.5" text-anchor="middle" style="font-size:8px;font-weight:700;fill:#5A3A00">m</text>`;
      g.style.transition = 'transform .55s cubic-bezier(.3,1.5,.5,1), opacity .3s';
      tagG.append(g); tags[k].push({ g, j });
      later(() => { g.style.opacity = '1'; g.style.transform = `translate(${slotX(k, j)}px,0px)`; }, 30 + delay);
    }
    function removeTag(k, delay) {
      const t = tags[k].pop(); if (!t) return;
      later(() => { t.g.style.opacity = '0'; t.g.style.transform = `translate(${slotX(k, t.j) + 20}px,-70px)`; later(() => t.g.remove(), 600); }, delay);
    }
    const level = k => EXPR[Math.min(4, tags[k].length)];
    function paint() {
      GENES.forEach((g, k) => {
        const v = level(k);
        const bulb = svg.querySelector(`.epi-bulb[data-k="${k}"]`);
        const lv = bulb.querySelector('.lvl'); lv.style.transition = 'width .6s ease'; lv.setAttribute('width', 60 * v / 100);
        lv.style.fill = v >= 70 ? 'var(--good)' : v >= 40 ? 'var(--warn)' : 'var(--bad)';
        bulb.querySelector('.pct').textContent = v + '%';
        const glow = svg.querySelector(`.epi-glow[data-k="${k}"] circle`); glow.style.transition = 'opacity .6s'; glow.style.opacity = (v / 100 * 0.32).toFixed(2);
      });
      svg.setAttribute('aria-label', 'Gene expression: ' + GENES.map((g, k) => `${g.name} ${level(k)} percent`).join(', ') + '. DNA letters unchanged.');
    }
    function setTags(target, stagger = true) {
      let d = 0;
      target.forEach((n, k) => {
        n = Math.max(0, Math.min(4, n));
        while (tags[k].length < n) { addTag(k, d); d += stagger ? 90 : 0; }
        while (tags[k].length > n) { removeTag(k, d); d += stagger ? 90 : 0; }
      });
      paint();
    }
    function apply(E) {
      const before = GENES.map((_, k) => level(k));
      if (E.d === 'reset') setTags(GENES.map(g => g.base));
      else setTags(GENES.map((g, k) => tags[k].length + E.d[k]));
      const after = GENES.map((_, k) => level(k));
      const changes = GENES.map((g, k) => after[k] === before[k] ? null : `${g.name} ${after[k] > before[k] ? '▲' : '▼'} ${after[k]}%`).filter(Boolean);
      log.textContent = E.msg + (changes.length ? ` (${changes.join(', ')})` : ' (No change this time: those genes were already at their limit.)');
      same.classList.remove('flash'); void same.offsetWidth; same.classList.add('flash');
      same.textContent = '✓ DNA letters changed: 0';
      sfx.tone(E.d === 'reset' ? 520 : (Array.isArray(E.d) && E.d[0] > 0 ? 300 : 620), 0.14, 'triangle', 0.08, E.d === 'reset' ? 660 : null);
    }
    reset.addEventListener('click', () => { setTags(GENES.map(g => g.base)); log.textContent = 'Tags reset to a typical pattern. Same DNA, as always.'; sfx.tap(); });
    GENES.forEach((g, k) => { for (let i = 0; i < g.base; i++) addTag(k, 0); });
    paint();

    /* ---- protein "output" particles: more expression → more output ---- */
    const parts = [];
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); const ioT = setTimeout(() => io.observe(root), 80);
    let last = 0;
    function tick(t) {
      raf = requestAnimationFrame(tick);
      if (!vis || api.reduceMotion) return;
      const dt = Math.min(50, t - (last || t)); last = t;
      GENES.forEach((g, k) => {
        if (Math.random() < level(k) / 100 * dt / 160 && parts.length < 40) {
          const c = svgEl('circle', { r: 2.6, style: 'fill:var(--good);opacity:.9' });
          const x0 = X(g.start + 3) + (Math.random() - .5) * 60;
          partG.append(c); parts.push({ c, x: x0, y: 112, vx: (Math.random() - .5) * 0.02, vy: -0.03 - Math.random() * 0.02, life: 0 });
        }
      });
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1)); p.c.style.opacity = String(Math.max(0, 0.9 - p.life / 1400));
        if (p.life > 1400) { p.c.remove(); parts.splice(i, 1); }
      }
    }
    raf = requestAnimationFrame(tick);

    /* ---- rat pup feature ---- */
    function ratPanel() {
      let mom = 'high', grown = false, rraf = 0;
      const rs = svgEl('svg', { viewBox: '0 0 360 150', role: 'img', 'aria-label': 'A mother rat licking her pup' });
      const momBtns = [['high', 'High-licking mom'], ['low', 'Low-licking mom']].map(([m, l]) => {
        const b = h('button', { type: 'button', class: 'chip epi-rat-btn', 'data-m': m, 'aria-pressed': String(m === mom) }, l);
        b.addEventListener('click', () => { mom = m; grown = false; momBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); sfx.tap(); out.textContent = 'Now tap "Grow up" to see how this pup handles stress as an adult.'; });
        return b;
      });
      const grow = h('button', { type: 'button', class: 'btn btn-sm btn-primary epi-grow' }, 'Grow up & face a stressor');
      const out = h('div', { class: 'epi-out', 'aria-live': 'polite' }, 'Pick a mom, then tap "Grow up."');
      grow.addEventListener('click', () => { grown = true; draw(); sfx.level(); api.addXP(2);
        out.textContent = mom === 'high'
          ? 'Well-licked pup: fewer tags on its stress-control gene, so it makes more cortisol receptors. As an adult, its stress response turns off quickly. It is calmer and explores more.'
          : 'Rarely licked pup: more tags silence its stress-control gene, so it makes fewer cortisol receptors. As an adult, stress hormones stay high longer. It is more anxious and jumpy.'; });
      const rat = (x, y, s, flip, col) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-46 6 C-70 10 -84 2 -92 -8" style="fill:none;stroke:${col};stroke-width:3;stroke-linecap:round"/><ellipse cx="-10" cy="0" rx="40" ry="22" style="fill:${col}"/><ellipse class="head" cx="34" cy="-6" rx="20" ry="14" style="fill:${col}"/><circle cx="26" cy="-20" r="8" style="fill:#F2B8C6"/><circle cx="42" cy="-10" r="2.6" style="fill:#222"/><circle cx="54" cy="-4" r="3" style="fill:#F28AA0"/></g>`;
      function draw() {
        cancelAnimationFrame(rraf);
        const col = 'var(--muted)';
        let s = `<rect x="0" y="122" width="360" height="28" style="fill:var(--warn-soft)"/>`;
        if (!grown) {
          s += `<g class="mom">${rat(120, 90, 1, false, col)}</g><g class="tongue"><ellipse cx="185" cy="96" rx="7" ry="3.4" style="fill:#F28AA0"/></g>
            <g transform="translate(206 104)"><ellipse rx="22" ry="12" style="fill:#F2C4CF"/><ellipse cx="18" cy="-4" rx="10" ry="8" style="fill:#F2C4CF"/><circle cx="22" cy="-6" r="1.6" style="fill:#333"/></g>
            <text x="180" y="24" text-anchor="middle" style="font-size:14px;font-weight:700;fill:var(--ink)">${mom === 'high' ? 'Mom licks and grooms a lot' : 'Mom rarely licks'}</text>
            <text x="180" y="42" text-anchor="middle" style="font-size:12px;fill:var(--muted)">first week of life</text>`;
          rs.innerHTML = s;
          const tongue = rs.querySelector('.tongue'), head = rs.querySelector('.mom .head');
          const rate = mom === 'high' ? 1 : 0.18;
          const t0 = performance.now();
          const anim = t => {
            const u = ((t - t0) / 1000 * rate * 2.2) % 1;
            const lick = !api.reduceMotion && u < 0.35 ? Math.sin(u / 0.35 * Math.PI) : 0;
            tongue.setAttribute('transform', `translate(${lick * 10} ${lick * 2})`); tongue.style.opacity = lick > 0.05 ? '1' : '0';
            head.setAttribute('transform', `translate(${lick * 4} ${lick * 3})`);
            rraf = requestAnimationFrame(anim);
          };
          rraf = requestAnimationFrame(anim);
        } else {
          const calm = mom === 'high';
          const path = calm ? 'M190 116 L210 116 C222 116 224 46 236 46 C248 46 252 112 270 114 L346 116' : 'M190 116 L210 116 C222 116 224 34 236 34 C252 34 262 50 282 60 C300 70 320 86 346 96';
          s += rat(84, 92, 0.85, false, col) + `<text x="84" y="40" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--ink)">${calm ? 'Calm adult' : 'Anxious adult'}</text>
            <text x="84" y="142" text-anchor="middle" style="font-size:11px;fill:var(--muted)">stress-control gene: ${calm ? 'turned UP' : 'turned DOWN'}</text>
            <line x1="190" y1="20" x2="190" y2="118" style="stroke:var(--line);stroke-width:2"/><line x1="190" y1="118" x2="350" y2="118" style="stroke:var(--line);stroke-width:2"/>
            <text x="268" y="16" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--muted)">Stress hormone after a scare</text>
            <text x="270" y="138" text-anchor="middle" style="font-size:11px;fill:var(--muted)">time →</text>
            <path class="curve" d="${path}" style="fill:none;stroke:${calm ? 'var(--good)' : 'var(--bad)'};stroke-width:3.5;stroke-linecap:round"/>
            <text x="${calm ? 302 : 318}" y="${calm ? 104 : 66}" text-anchor="middle" style="font-size:11px;font-weight:700;fill:${calm ? 'var(--good)' : 'var(--bad)'}">${calm ? 'back to normal fast' : 'stays high'}</text>`;
          rs.innerHTML = s;
          const c = rs.querySelector('.curve'), L = c.getTotalLength ? c.getTotalLength() : 300;
          if (!api.reduceMotion) { c.style.strokeDasharray = L; c.style.strokeDashoffset = L; c.style.transition = 'stroke-dashoffset 1.6s ease'; requestAnimationFrame(() => requestAnimationFrame(() => { c.style.strokeDashoffset = '0'; })); }
        }
        rs.setAttribute('aria-label', grown ? `Adult rat raised by a ${mom}-licking mother: stress hormone ${mom === 'high' ? 'returns to normal quickly' : 'stays high'}` : `A ${mom}-licking mother rat with her pup`);
      }
      draw();
      cleanRat = () => cancelAnimationFrame(rraf);
      return h('div', { class: 'epi-rat' }, h('h4', null, 'Fact of the day: licking rat pups'),
        h('p', null, 'Some mother rats lick and groom their pups a lot; others rarely do. Researchers found that licking removes tags from the pups’ stress-control gene. Pups born to low-licking moms but raised by high-licking moms grow up calm, so this comes from experience, not inherited DNA.'),
        h('div', { class: 'epi-row', role: 'group', 'aria-label': 'Mother type' }, momBtns), rs, h('div', { class: 'epi-row' }, grow), out);
    }
    return () => { cancelAnimationFrame(raf); cleanRat(); timers.forEach(clearTimeout); timers.clear(); clearTimeout(ioT); io.disconnect(); };
  }
});
})();
