/* heritability-lab — heritability is a GROUP statistic: same seed mix, change how different the environments are. */
(function () {
'use strict';
const CSS = `
.hl { display: flex; flex-direction: column; gap: 14px; }
.hl-ins { font-size: 15px; color: var(--muted); }
.hl-field { border-radius: 16px; border: 1px solid var(--line); background: linear-gradient(180deg, var(--carolina-soft), var(--surface-2) 75%); overflow: hidden; }
.hl-field svg { width: 100%; max-width: 560px; display: block; margin: 0 auto; }
.hl-plant { cursor: pointer; }
.hl-plant:focus-visible { outline: none; }
.hl-plant:focus-visible .hl-hit { stroke: var(--carolina); stroke-width: 2; }
.hl-ctrl { display: grid; gap: 6px; }
.hl-ctrl label { font-weight: 700; }
.hl-ends { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }
.hl-read { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: center; background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
.hl-h { font-family: var(--f-mono); font-weight: 700; font-size: 30px; line-height: 1; color: var(--carolina); font-variant-numeric: tabular-nums; }
.hl-h small { display: block; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
.hl-meter { height: 12px; border-radius: 8px; background: var(--line); position: relative; overflow: hidden; margin-top: 8px; }
.hl-meter i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 8px; background: linear-gradient(90deg, var(--spark), var(--warn), var(--good)); transition: width .3s ease; }
.hl-meter-ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-top: 3px; }
.hl-sent { font-size: 16px; }
.hl-row { display: flex; gap: 8px; flex-wrap: wrap; }
.hl-box { border-radius: 14px; padding: 12px 14px; font-size: 16px; display: grid; gap: 8px; animation: hlIn .35s ease both; }
.hl-box h4 { font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; margin: 0; }
.hl-box.mis { background: var(--warn-soft); } .hl-box.mis h4 { color: var(--warn); }
.hl-box.split { background: var(--carolina-soft); } .hl-box.split h4 { color: var(--carolina); }
.hl-box.pair { background: var(--good-soft); font-size: 15px; } .hl-box.pair h4 { color: var(--good); }
.hl-wrong { text-decoration: line-through; text-decoration-color: var(--bad); text-decoration-thickness: 2px; }
.hl-right { font-weight: 700; color: var(--good); }
@keyframes hlIn { from { opacity: 0; transform: translateY(6px); } }
.reduce-motion .hl-box { animation: none; }
`;
const GEN = [-1, -0.71, -0.43, -0.14, 0.14, 0.43, 0.71, 1];
const COLS = ['#E5485F', '#FF9F5A', '#E0B020', '#35B88A', '#3BB3C3', '#4B9CD3', '#7A6FE0', '#D96BB5'];
const SEEDN = ['Red', 'Orange', 'Gold', 'Green', 'Teal', 'Blue', 'Violet', 'Pink'];
const BASE = 72, GW = 16, EW = 34, SPLIT = 26, GROUND = 166;

ML.registerWidget('heritability-lab', {
  title: 'The heritability garden', tag: 'Simulation',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('hl-css')) document.head.append(h('style', { id: 'hl-css' }, CSS));
    const root = h('div', { class: 'hl' });
    const ins = h('p', { class: 'hl-ins' }, 'Both plots got the same mix of 8 seed types. Slide to change how different the growing conditions are, and watch heritability change. Tap a plant to find its genetic twin.');
    const svg = svgEl('svg', { viewBox: '0 0 360 204', role: 'group', 'aria-label': 'Two garden plots with 8 plants each' });
    const range = h('input', { type: 'range', class: 'hl-range', id: 'hl-range-' + Math.random().toString(36).slice(2, 7), min: '0', max: '100', value: '0' });
    const ctrl = h('div', { class: 'hl-ctrl' }, h('label', { for: range.id }, 'How different are the growing conditions?'), range, h('div', { class: 'hl-ends', 'aria-hidden': 'true' }, h('span', null, 'Identical for every plant'), h('span', null, 'Very different')));
    const hv = h('div', { class: 'hl-h' }, h('small', null, 'Heritability'), h('span', null, '1.00'));
    const meterFill = h('i');
    const sent = h('p', { class: 'hl-sent', 'aria-live': 'polite' });
    const read = h('div', { class: 'hl-read' }, hv, h('div', null, sent, h('div', { class: 'hl-meter', 'aria-hidden': 'true' }, meterFill), h('div', { class: 'hl-meter-ends', 'aria-hidden': 'true' }, h('span', null, '0 = all environment'), h('span', null, '1 = all genes'))));
    const replant = h('button', { type: 'button', class: 'btn btn-sm' }, '↻ Re-plant');
    const splitB = h('button', { type: 'button', class: 'btn btn-sm hl-split', 'aria-pressed': 'false' }, 'Give Plot B poor soil');
    const misB = h('button', { type: 'button', class: 'btn btn-sm hl-mistake', 'aria-expanded': 'false' }, 'Common mistake');
    const pairBox = h('div');
    const splitBox = h('div');
    const misBox = h('div');
    root.append(ins, h('div', { class: 'hl-field' }, svg), ctrl, read, h('div', { class: 'hl-row' }, replant, splitB, misB), pairBox, splitBox, misBox);
    el.append(root);

    // ----- model -----
    let s = 0, split = false, sel = -1, raf = 0;
    let order, envRaw;
    const plants = [];
    function seedField() {
      const shuffle = api.util.shuffle;
      order = [shuffle([0, 1, 2, 3, 4, 5, 6, 7]), shuffle([0, 1, 2, 3, 4, 5, 6, 7])];
      let e = Array.from({ length: 16 }, () => Math.random() * 2 - 1);
      const m = e.reduce((a, b) => a + b, 0) / 16; e = e.map(v => v - m);
      const sd = Math.sqrt(e.reduce((a, b) => a + b * b, 0) / 16);
      const gm = GEN.reduce((a, b) => a + b, 0) / 8, gsd = Math.sqrt(GEN.reduce((a, b) => a + (b - gm) ** 2, 0) / 8);
      envRaw = e.map(v => v / sd * gsd);
    }
    function comps(i) {
      const plot = i < 8 ? 0 : 1, k = i % 8, gt = order[plot][k];
      const G = GW * GEN[gt], E = EW * s * envRaw[i] - (split && plot === 1 ? SPLIT : 0);
      return { plot, k, gt, G, E, H: Math.max(12, BASE + G + E) };
    }
    const variance = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length; };
    function herit(idx) { const c = idx.map(comps); const vg = variance(c.map(x => x.G)), ve = variance(c.map(x => x.E)); return vg / (vg + ve); }

    // ----- drawing -----
    svg.innerHTML = `
      <rect x="6" y="${GROUND}" width="168" height="22" rx="4" style="fill:#8A6A45;opacity:.25"/><rect x="186" y="${GROUND}" width="168" height="22" rx="4" style="fill:#8A6A45;opacity:.25"/>
      <text x="90" y="201" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--ink)">Plot A</text>
      <text x="270" y="201" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--ink)">Plot B</text>
      <line x1="180" y1="20" x2="180" y2="190" style="stroke:var(--line);stroke-width:2;stroke-dasharray:4 4"/>
      <g class="hl-sun" transform="translate(28 22)"><circle r="9" style="fill:#F2B632"/><g style="stroke:#F2B632;stroke-width:2;stroke-linecap:round">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="12" y1="0" x2="16" y2="0" transform="rotate(${a})"/>`).join('')}</g></g>
      <g class="hl-plants"></g><g class="hl-link"></g>`;
    const pg = svg.querySelector('.hl-plants'), link = svg.querySelector('.hl-link');
    for (let i = 0; i < 16; i++) {
      const plot = i < 8 ? 0 : 1, k = i % 8, x = (plot ? 196 : 16) + k * 21;
      const g = svgEl('g', { class: 'hl-plant', tabindex: '0', role: 'button' });
      g.innerHTML = `<rect class="hl-hit" x="${x - 10}" y="20" width="20" height="170" rx="6" style="fill:transparent"/>
        <rect class="soil" x="${x - 10}" y="${GROUND}" width="20" height="22" rx="3"/>
        <path class="stem" style="fill:none;stroke:#3E9B5A;stroke-width:2.6;stroke-linecap:round"/>
        <ellipse class="lf1" rx="6" ry="2.6" style="fill:#4DB36B"/><ellipse class="lf2" rx="6" ry="2.6" style="fill:#4DB36B"/>
        <g class="fl"><circle r="6.5" class="pet"/><circle r="2.6" style="fill:#FFE9A8"/></g>
        <circle class="seed" cx="${x}" cy="${GROUND + 13}" r="3.2"/>`;
      g.addEventListener('click', () => select(i));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); } });
      pg.append(g);
      plants.push({ g, x, cur: BASE, el: { soil: g.querySelector('.soil'), stem: g.querySelector('.stem'), l1: g.querySelector('.lf1'), l2: g.querySelector('.lf2'), fl: g.querySelector('.fl'), pet: g.querySelector('.pet'), seed: g.querySelector('.seed') } });
    }
    function soilColor(E) {
      const q = Math.max(0, Math.min(1, 0.5 + E / (EW * 2.1)));
      const a = [222, 200, 160], b = [74, 46, 22];
      return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * q)).join(',')})`;
    }
    function drawPlant(p, H) {
      const top = GROUND - H, x = p.x;
      p.el.stem.setAttribute('d', `M${x} ${GROUND} C${x - 3} ${GROUND - H * .4} ${x + 3} ${GROUND - H * .7} ${x} ${top}`);
      p.el.l1.setAttribute('transform', `translate(${x - 5} ${GROUND - H * .38}) rotate(-28)`);
      p.el.l2.setAttribute('transform', `translate(${x + 5} ${GROUND - H * .58}) rotate(28)`);
      p.el.fl.setAttribute('transform', `translate(${x} ${top})`);
    }
    function paint(instant) {
      plants.forEach((p, i) => {
        const c = comps(i);
        p.target = c.H;
        p.el.soil.style.fill = soilColor(c.E);
        p.el.pet.style.fill = COLS[c.gt]; p.el.seed.style.fill = COLS[c.gt];
        p.g.setAttribute('aria-label', `Plot ${c.plot ? 'B' : 'A'}, ${SEEDN[c.gt]} seed, height ${Math.round(c.H)}`);
        if (instant || api.reduceMotion) { p.cur = c.H; drawPlant(p, p.cur); }
      });
      const all = [...Array(16).keys()];
      const H = herit(all);
      hv.lastChild.textContent = H.toFixed(2);
      meterFill.style.width = (H * 100) + '%';
      sent.textContent = H >= 0.8 ? 'Conditions are nearly the same for every plant, so almost all of the differences in height come from differences in the seeds’ genes.'
        : H >= 0.4 ? 'Both the seeds’ genes and the growing conditions now explain the differences in height.'
        : 'Conditions vary so much that most of the height differences now come from the environment, even though the seeds did not change.';
      range.setAttribute('aria-valuetext', `Heritability ${H.toFixed(2)}`);
      splitBox.innerHTML = '';
      if (split) {
        const hA = herit([0, 1, 2, 3, 4, 5, 6, 7]), hB = herit([8, 9, 10, 11, 12, 13, 14, 15]);
        const mA = avg([0, 1, 2, 3, 4, 5, 6, 7]), mB = avg([8, 9, 10, 11, 12, 13, 14, 15]);
        splitBox.append(h('div', { class: 'hl-box split' }, h('h4', null, 'Within groups vs. between groups'),
          h('div', null, `Inside Plot A, heritability is ${hA.toFixed(2)}. Inside Plot B, it is ${hB.toFixed(2)}. Plot B is ${Math.round(mA - mB)} units shorter on average, and that gap is 100% environment, because both plots got the exact same seeds.`),
          h('div', null, h('b', null, 'Big idea: '), 'high heritability within a group tells you nothing about why two groups differ.'),
          s > 0.3 ? h('div', { style: { fontSize: '14px' } }, 'Tip: slide back toward identical conditions to see this most clearly.') : null));
      }
      if (sel >= 0) pairInfo();
      kick();
    }
    const avg = idx => idx.reduce((a, i) => a + comps(i).H, 0) / idx.length;
    function kick() { if (!raf) raf = requestAnimationFrame(step); }
    function step() {
      raf = 0; let moving = false;
      plants.forEach(p => { const d = p.target - p.cur; if (Math.abs(d) > .3) { p.cur += d * 0.14; moving = true; } else p.cur = p.target; drawPlant(p, p.cur); });
      drawLink();
      if (moving) raf = requestAnimationFrame(step);
    }
    function twinOf(i) { const c = comps(i); const other = c.plot ? 0 : 1; const k = order[other].indexOf(c.gt); return other * 8 + k; }
    function drawLink() {
      link.innerHTML = '';
      if (sel < 0) return;
      [sel, twinOf(sel)].forEach(i => { const p = plants[i]; link.append(svgEl('circle', { cx: p.x, cy: GROUND - p.cur, r: 11, style: 'fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:3 2' })); });
      const a = plants[sel], b = plants[twinOf(sel)];
      link.append(svgEl('path', { d: `M${a.x} ${GROUND - a.cur - 12} Q180 ${Math.min(GROUND - a.cur, GROUND - b.cur) - 40} ${b.x} ${GROUND - b.cur - 12}`, style: 'fill:none;stroke:var(--ink);stroke-width:1.6;stroke-dasharray:4 3' }));
    }
    function pairInfo() {
      pairBox.innerHTML = '';
      const a = comps(sel), b = comps(twinOf(sel));
      const diff = Math.abs(a.H - b.H);
      pairBox.append(h('div', { class: 'hl-box pair' }, h('h4', null, `Genetic twins: two ${SEEDN[a.gt].toLowerCase()} seeds`),
        h('div', null, diff < 1.5 ? 'Same seed type and the same conditions, so they grow to the same height.' : `Same seed type, but one grew ${Math.round(diff)} units taller. Their genes are identical, so that difference is 100% environment.`)));
    }
    function select(i) {
      sel = sel === i ? -1 : i; sfx.blip();
      if (sel < 0) pairBox.innerHTML = ''; else pairInfo();
      drawLink();
    }

    range.addEventListener('input', () => { s = range.value / 100; paint(); });
    replant.addEventListener('click', () => { seedField(); sfx.tap(); paint(); });
    splitB.addEventListener('click', () => { split = !split; splitB.setAttribute('aria-pressed', String(split)); splitB.textContent = split ? 'Give Plot B good soil again' : 'Give Plot B poor soil'; sfx.tap(); paint(); });
    misB.addEventListener('click', () => {
      const open = misB.getAttribute('aria-expanded') !== 'true';
      misB.setAttribute('aria-expanded', String(open)); misBox.innerHTML = ''; sfx.flip();
      if (open) misBox.append(h('div', { class: 'hl-box mis' }, h('h4', null, 'Common mistake'),
        h('div', null, 'A study finds the heritability of intelligence is 0.55. Which reading is right?'),
        h('div', { class: 'hl-wrong' }, '55% of YOUR intelligence comes from your genes.'),
        h('div', { class: 'hl-right' }, '55% of the DIFFERENCES in intelligence within that group are linked to genetic differences.'),
        h('div', null, 'Heritability describes variation in a group, never one person. A single plant’s height can’t be split into “gene inches” and “soil inches.” It needs both, the way a rectangle’s area needs both length and width. And as the slider shows, the same seeds can have high or low heritability depending on the environment.')));
    });

    seedField();
    paint(true);
    return () => { cancelAnimationFrame(raf); raf = 0; };
  }
});
})();
