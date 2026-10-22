/* hunger-hormones — the hypothalamus hunger control panel (Orexin, Ghrelin, Insulin increase hunger; Leptin, PYY decrease it)
   with an animated hunger gauge, signal streams to the hypothalamus, and a "predict which hormones are high" scenario mode. */
(function () {
'use strict';
const CSS = `
.hh { display: flex; flex-direction: column; gap: 12px; }
.hh-ins { font-size: 15px; color: var(--muted); }
.hh-modes { display: flex; gap: 8px; flex-wrap: wrap; }
.hh-main { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
@media (max-width: 640px) { .hh-main { grid-template-columns: 1fr; } }
.hh-fig { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); overflow: hidden; }
.hh-fig svg { width: 100%; display: block; }
.hh-rows { display: grid; gap: 8px; }
.hh-row { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; align-items: center; background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; }
.hh-row .nm { font-weight: 700; font-size: 15px; }
.hh-row .nm small { font-weight: 400; color: var(--muted); font-size: 13px; }
.hh-row .ef { font-family: var(--f-mono); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; white-space: nowrap; }
.hh-row .ef.up { background: var(--good-soft); color: var(--good); }
.hh-row .ef.dn { background: var(--blank-soft); color: var(--blank); }
.hh-row input { grid-column: 1 / -1; }
.hh-row .lv { grid-column: 1 / -1; display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-top: -2px; }
.hh-row .lv b { color: var(--ink); }
.hh-scen { border: 2px solid var(--carolina); border-radius: 14px; padding: 12px 14px; display: grid; gap: 10px; }
.hh-scen .k { display: flex; justify-content: space-between; font-family: var(--f-mono); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); }
.hh-scen .s { font-size: 18px; font-weight: 700; }
.hh-picks { display: flex; gap: 8px; flex-wrap: wrap; }
.hh-pick { border: 2px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 7px 12px; font-weight: 700; cursor: pointer; color: var(--ink); font-size: 15px; }
.hh-pick[aria-pressed="true"] { border-color: var(--carolina); background: var(--carolina-soft); }
.hh-pick.right { border-color: var(--good); background: var(--good-soft); }
.hh-pick.wrong { border-color: var(--bad); background: var(--bad-soft); }
.hh-pick.missed { border-style: dashed; border-color: var(--good); }
.hh-pick.ok { border-color: var(--warn); background: var(--warn-soft); }
.hh-fb { font-size: 15px; border-radius: 10px; padding: 10px 12px; background: var(--surface-2); }
.hh-row2 { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.hh-read { text-align: center; font-weight: 700; font-size: 16px; }
`;
const HORM = [
  { id: 'orexin', name: 'Orexin', src: 'hypothalamus', w: 0.35, up: true, pos: [96, 56] },
  { id: 'ghrelin', name: 'Ghrelin', src: 'stomach', w: 0.45, up: true, pos: [118, 150] },
  { id: 'insulin', name: 'Insulin', src: 'pancreas', w: 0.25, up: true, pos: [150, 166] },
  { id: 'leptin', name: 'Leptin', src: 'fat cells', w: 0.4, up: false, pos: [56, 178] },
  { id: 'pyy', name: 'PYY', src: 'digestive tract', w: 0.4, up: false, pos: [108, 196] }
];
const HYP = [96, 50];
const SCEN = [
  { s: 'You skipped breakfast, and it is now 11:45 a.m.', high: ['ghrelin', 'orexin'], ok: [], lv: { orexin: 80, ghrelin: 92, insulin: 25, leptin: 45, pyy: 18 },
    why: 'Your empty stomach releases ghrelin and the hypothalamus releases orexin, and both increase hunger. PYY is low because your digestive tract is empty, so nothing is telling you "I’m full."' },
  { s: 'You just finished a huge Thanksgiving dinner.', high: ['pyy'], ok: ['insulin', 'leptin'], lv: { orexin: 22, ghrelin: 10, insulin: 85, leptin: 65, pyy: 95 },
    why: 'Food in your digestive tract releases PYY, which decreases hunger, and ghrelin drops. Insulin also rises to move sugar from the meal into your cells, and leptin from fat cells reports your energy stores. Result: stuffed.' },
  { s: 'After months of dieting, a person lost a lot of body fat but now feels hungry all the time.', high: ['ghrelin'], ok: ['orexin'], lv: { orexin: 62, ghrelin: 86, insulin: 40, leptin: 14, pyy: 40 },
    why: 'With less body fat, fat cells release less leptin, so the "we have enough energy" signal weakens. Ghrelin rises. That combination is one reason keeping weight off is hard.' }
];
const levelWord = v => v < 30 ? 'Low' : v > 70 ? 'High' : 'Normal';
const hungerWord = v => v < 20 ? 'Stuffed' : v < 40 ? 'Satisfied' : v < 60 ? 'Neutral' : v < 80 ? 'Hungry' : 'Starving';

ML.registerWidget('hunger-hormones', {
  title: 'The hunger control panel', tag: 'Simulation',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('hh-css')) document.head.append(h('style', { id: 'hh-css' }, CSS));
    const lv = { orexin: 50, ghrelin: 50, insulin: 50, leptin: 50, pyy: 50 };
    let hunger = 50, shown = 50, mode = 'panel', raf = 0, last = 0, vis = true, si = 0;
    const root = h('div', { class: 'hh' });
    const ins = h('p', { class: 'hh-ins' }, 'Slide each hormone up or down and watch the hypothalamus adjust your hunger. Then switch to Predict it and test yourself.');
    const modeBtns = [['panel', 'Control panel'], ['scen', 'Predict it']].map(([m, l]) => { const b = h('button', { type: 'button', class: 'chip hh-mode', 'data-m': m, 'aria-pressed': String(m === mode) }, l); b.addEventListener('click', () => setMode(m)); return b; });
    const svg = svgEl('svg', { viewBox: '0 0 360 230', role: 'img', 'aria-label': 'Body with hunger hormones flowing to the hypothalamus and a hunger gauge' });
    const read = h('div', { class: 'hh-read', 'aria-live': 'polite' });
    const side = h('div');
    root.append(ins, h('div', { class: 'hh-modes', role: 'group', 'aria-label': 'Mode' }, modeBtns), h('div', { class: 'hh-main' }, h('div', { class: 'stack', style: { gap: '8px' } }, h('div', { class: 'hh-fig' }, svg), read), side));
    el.append(root);

    /* ---- figure ---- */
    const skin = '#E9B48C';
    svg.innerHTML = `
      <path d="M60 96 Q96 84 132 96 L150 212 Q96 226 42 212Z" style="fill:var(--carolina-soft);stroke:var(--carolina);stroke-width:2"/>
      <circle cx="96" cy="52" r="36" style="fill:${skin}"/>
      <path d="M68 46 C66 22 90 14 100 20 C116 14 130 30 124 48 C128 60 116 70 104 66 C96 72 76 70 72 62 C62 60 62 50 68 46Z" style="fill:#F2B8C6;stroke:#C7778B;stroke-width:1.5"/>
      <circle class="hyp" cx="${HYP[0]}" cy="${HYP[1]}" r="8" style="fill:var(--spark);stroke:#fff;stroke-width:2"/>
      <text x="${HYP[0]}" y="11" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--spark)">hypothalamus</text><path d="M${HYP[0]} 14 V${HYP[1] - 9}" style="stroke:var(--spark);stroke-width:1.2"/>
      <g class="stom" transform="translate(118 150)"><path d="M-14 -12 Q8 -18 12 -2 Q14 16 -4 16 Q-12 12 -6 4 Q-2 -2 -14 -12Z" style="fill:#F2B05A;stroke:#C77B2D;stroke-width:1.5"/><text class="grr" x="18" y="-12" style="font-family:var(--f-display);font-size:11px;fill:var(--warn);opacity:0">GRRR</text></g>
      <ellipse cx="150" cy="166" rx="15" ry="5" transform="rotate(-12 150 166)" style="fill:#E7C27A;stroke:#B9933F"/>
      <g>${[[48, 172], [58, 182], [46, 186], [60, 170], [66, 186]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" style="fill:#FFE7A3;stroke:#D9B850"/>`).join('')}</g>
      <path d="M92 186 q8 -6 16 0 t16 0 q-4 10 -16 8 t-16 4" style="fill:none;stroke:#D9705A;stroke-width:4;stroke-linecap:round"/>
      ${HORM.map(o => o.id === 'orexin' ? '' : `<path class="lane" data-h="${o.id}" d="M${o.pos[0]} ${o.pos[1]} Q${(o.pos[0] + HYP[0]) / 2 + (o.pos[0] > 96 ? 30 : -30)} ${(o.pos[1] + HYP[1]) / 2} ${HYP[0]} ${HYP[1] + 6}" style="fill:none;stroke:${o.up ? 'var(--good)' : 'var(--blank)'};stroke-width:1.5;stroke-dasharray:3 4;opacity:.45"/>`).join('')}
      ${HORM.map(o => `<text x="${o.pos[0] + (o.id === 'leptin' ? -26 : o.id === 'orexin' ? 40 : 18)}" y="${o.pos[1] + (o.id === 'orexin' ? -4 : o.id === 'leptin' ? 22 : 4)}" text-anchor="start" style="font-size:11px;font-weight:700;fill:${o.up ? 'var(--good)' : 'var(--blank)'}">${o.name}</text>`).join('')}
      <g class="parts"></g>
      <g transform="translate(264 112)">
        <path d="M-70 0 A70 70 0 0 1 70 0" style="fill:none;stroke:var(--line);stroke-width:16;stroke-linecap:round"/>
        <path class="garc" d="M-70 0 A70 70 0 0 1 70 0" style="fill:none;stroke:url(#hhG);stroke-width:16;stroke-linecap:round"/>
        <defs><linearGradient id="hhG"><stop offset="0" stop-color="#4B9CD3"/><stop offset=".5" stop-color="#E0B020"/><stop offset="1" stop-color="#E5485F"/></linearGradient></defs>
        <g class="needle"><path d="M-3 0 L0 -58 L3 0Z" style="fill:var(--ink)"/><circle r="7" style="fill:var(--ink)"/></g>
        <text x="-74" y="20" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--muted)">Stuffed</text>
        <text x="74" y="20" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--muted)">Starving</text>
        <text class="hw" x="0" y="40" text-anchor="middle" style="font-size:18px;font-weight:700;fill:var(--ink)">Neutral</text>
        <text x="0" y="-82" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--muted)">HUNGER</text>
      </g>`;
    const needle = svg.querySelector('.needle'), hw = svg.querySelector('.hw'), grr = svg.querySelector('.grr'), stom = svg.querySelector('.stom'), partG = svg.querySelector('.parts'), hyp = svg.querySelector('.hyp');
    const lanes = {}; svg.querySelectorAll('.lane').forEach(p => lanes[p.dataset.h] = p);
    const parts = [];

    function compute() { hunger = Math.max(0, Math.min(100, 50 + HORM.reduce((a, o) => a + (o.up ? 1 : -1) * o.w * (lv[o.id] - 50), 0))); }

    /* ---- control panel ---- */
    const sliders = {};
    function panel() {
      side.innerHTML = '';
      side.append(h('div', { class: 'hh-rows' }, HORM.map(o => {
        const id = 'hh-' + o.id + Math.random().toString(36).slice(2, 6);
        const r = h('input', { type: 'range', min: '0', max: '100', value: String(lv[o.id]), id, 'data-h': o.id, 'aria-label': `${o.name} level` });
        const lw = h('b', null, levelWord(lv[o.id]));
        r.addEventListener('input', () => { lv[o.id] = +r.value; lw.textContent = levelWord(lv[o.id]); r.setAttribute('aria-valuetext', `${levelWord(lv[o.id])}, hunger ${hungerWord(hunger)}`); compute(); });
        r.addEventListener('change', () => sfx.tap());
        sliders[o.id] = { r, lw };
        return h('div', { class: 'hh-row' }, h('label', { class: 'nm', for: id }, o.name, ' ', h('small', null, `from ${o.src}`)), h('span', { class: 'ef ' + (o.up ? 'up' : 'dn') }, o.up ? '↑ hunger' : '↓ hunger'), r, h('div', { class: 'lv', 'aria-hidden': 'true' }, h('span', null, 'low'), lw, h('span', null, 'high')));
      })), h('div', { class: 'hh-row2', style: { marginTop: '8px' } }, h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { Object.keys(lv).forEach(k => lv[k] = 50); compute(); panel(); sfx.tap(); } }, '↺ Reset to normal')));
    }
    /* ---- scenarios ---- */
    function scen() {
      side.innerHTML = '';
      const S = SCEN[si];
      const picked = new Set();
      let checked = false;
      const picks = HORM.map(o => { const b = h('button', { type: 'button', class: 'hh-pick', 'data-h': o.id, 'aria-pressed': 'false' }, o.name); b.addEventListener('click', () => { if (checked) return; picked.has(o.id) ? picked.delete(o.id) : picked.add(o.id); b.setAttribute('aria-pressed', String(picked.has(o.id))); sfx.tap(); }); return b; });
      const fb = h('div', { 'aria-live': 'polite' });
      const check = h('button', { type: 'button', class: 'btn btn-primary btn-sm hh-check' }, 'Check my prediction');
      check.addEventListener('click', () => {
        if (checked) return; checked = true; check.remove();
        let ok = true;
        picks.forEach(b => {
          const id = b.dataset.h, isP = picked.has(id), need = S.high.includes(id), fine = S.ok.includes(id);
          if (need && isP) b.classList.add('right'); else if (need) { b.classList.add('missed'); ok = false; } else if (isP && fine) b.classList.add('ok'); else if (isP) { b.classList.add('wrong'); ok = false; }
        });
        Object.assign(lv, S.lv); compute();
        ok ? (sfx.good(), api.addXP(3)) : sfx.bad();
        const nx = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, si < SCEN.length - 1 ? 'Next scenario →' : 'Start over');
        nx.addEventListener('click', () => { si = (si + 1) % SCEN.length; scen(); });
        fb.append(h('div', { class: 'hh-fb' }, h('b', null, ok ? 'Nice prediction! ' : 'Here is what happens. '), S.why, h('div', { style: { fontSize: '13px', color: 'var(--muted)', marginTop: '6px' } }, 'Green = high and you picked it. Dashed = high but missed. Gold = also true, bonus. Red = not high here.')), h('div', { class: 'hh-row2', style: { marginTop: '8px' } }, nx));
      });
      side.append(h('div', { class: 'hh-scen' }, h('div', { class: 'k' }, h('span', null, `Scenario ${si + 1} of ${SCEN.length}`)), h('div', { class: 's' }, S.s), h('div', null, 'Tap every hormone you predict is HIGH right now.'), h('div', { class: 'hh-picks' }, picks), h('div', null, check), fb));
      Object.keys(lv).forEach(k => lv[k] = 50); compute();
    }
    function setMode(m) { mode = m; modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m))); sfx.tap(); m === 'panel' ? panel() : (si = si % SCEN.length, scen()); }

    /* ---- animation ---- */
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); const ioT = setTimeout(() => io.observe(root), 80);
    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!vis) return;
      shown += (hunger - shown) * Math.min(1, dt * 3);
      const ang = -90 + shown / 100 * 180;
      needle.setAttribute('transform', `rotate(${ang.toFixed(1)})`);
      const w = hungerWord(shown); if (hw.textContent !== w) { hw.textContent = w; read.textContent = `Hunger: ${w}`; svg.setAttribute('aria-label', `Hunger gauge reads ${w}`); }
      const rm = api.reduceMotion;
      const growl = shown > 78;
      grr.style.opacity = growl ? String(0.6 + 0.4 * Math.sin(t / 120)) : '0';
      stom.setAttribute('transform', `translate(${118 + (growl && !rm ? Math.sin(t / 30) * 1.6 : 0)} 150) scale(${(1 + (50 - shown) / 250).toFixed(3)})`);
      hyp.setAttribute('r', (7 + Math.sin(t / 300) * (rm ? 0 : 1)).toFixed(2));
      if (!rm) HORM.forEach(o => {
        if (o.id === 'orexin') { if (Math.random() < lv.orexin / 100 * dt * 4) { const c = svgEl('circle', { r: 2.4, style: 'fill:var(--good)' }); partG.append(c); parts.push({ c, x: HYP[0], y: HYP[1], ring: true, a: 0 }); } return; }
        const ln = lanes[o.id];
        if (Math.random() < lv[o.id] / 100 * dt * 7 && parts.length < 60) { const c = svgEl('circle', { r: 2.6, style: `fill:${o.up ? 'var(--good)' : 'var(--blank)'}` }); partG.append(c); parts.push({ c, ln, u: 0, L: ln.getTotalLength() }); }
      });
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.ring) { p.a += dt * 1.5; p.c.setAttribute('r', (8 + p.a * 14).toFixed(1)); p.c.style.fill = 'none'; p.c.style.stroke = 'var(--good)'; p.c.style.strokeWidth = '2'; p.c.style.opacity = String(Math.max(0, 1 - p.a)); p.c.setAttribute('cx', HYP[0]); p.c.setAttribute('cy', HYP[1]); if (p.a >= 1) { p.c.remove(); parts.splice(i, 1); } continue; }
        p.u += dt * 0.7; const pt = p.ln.getPointAtLength(p.L * Math.min(1, p.u)); p.c.setAttribute('cx', pt.x); p.c.setAttribute('cy', pt.y);
        if (p.u >= 1) { p.c.remove(); parts.splice(i, 1); }
      }
    }
    compute(); panel();
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); clearTimeout(ioT); io.disconnect(); };
  }
});
})();
