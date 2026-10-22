/* twin-builder — animated formation of identical, fraternal, and semi-identical twins + Bouchard twins-reared-apart panel. */
(function () {
'use strict';
const CSS = `
.twb { display: flex; flex-direction: column; gap: 14px; }
.twb-ins { font-size: 15px; color: var(--muted); }
.twb-modes { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.twb-stage { border-radius: 16px; background: radial-gradient(ellipse at 50% 45%, var(--spark-soft), var(--surface-2) 70%); border: 1px solid var(--line); overflow: hidden; }
.twb-stage svg { width: 100%; max-width: 500px; margin: 0 auto; display: block; }
.twb-cap { font-weight: 700; text-align: center; min-height: 1.5em; font-size: 16px; }
.twb-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap: 8px; }
.twb-stat { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; }
.twb-stat span { display: block; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
.twb-stat b { font-size: 17px; }
.twb-legend { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; font-size: 13px; color: var(--muted); margin-top: -6px; }
.twb-legend i { display: inline-block; width: 18px; height: 9px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }
.twb-term { font-size: 15px; color: var(--muted); }
.twb-term b { color: var(--ink); }
.twb-panel { border: 1.5px solid var(--carolina); border-radius: 16px; overflow: hidden; }
.twb-tabs { display: flex; background: var(--carolina-soft); }
.twb-tab { flex: 1; border: 0; background: transparent; padding: 10px 8px; font-weight: 700; font-size: 14px; color: var(--carolina); cursor: pointer; border-bottom: 3px solid transparent; }
.twb-tab[aria-selected="true"] { background: var(--surface); border-bottom-color: var(--carolina); color: var(--ink); }
.twb-pbody { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; font-size: 16px; }
.twb-eyebrow { font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); font-weight: 700; }
.twb-bars { display: grid; gap: 8px; }
.twb-bar { display: grid; grid-template-columns: minmax(118px, 190px) 1fr 40px; gap: 10px; align-items: center; font-size: 14px; }
.twb-bar .tr { height: 16px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--line); overflow: hidden; }
.twb-bar .fl { height: 100%; width: 0; border-radius: 8px; transition: width 1.1s cubic-bezier(.2,.8,.2,1); }
@media (max-width: 560px) { .twb-bar { grid-template-columns: 1fr 44px; gap: 2px 10px; } .twb-bar > span:first-child { grid-column: 1 / -1; } }
.twb-bar .v { font-family: var(--f-mono); font-weight: 700; font-size: 14px; text-align: right; }
.twb-small { font-size: 13px; color: var(--muted); }
.twb-story { background: var(--warn-soft); border-radius: 12px; padding: 10px 12px; font-size: 15px; }
.twb-story b { color: var(--warn); }
.twb-cmp { width: 100%; border-collapse: collapse; font-size: 15px; }
.twb-cmp th, .twb-cmp td { padding: 7px 8px; border-bottom: 1px solid var(--line); text-align: center; }
.twb-cmp th:first-child, .twb-cmp td:first-child { text-align: left; }
.twb-cmp th { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.twb-cmp .y { color: var(--good); font-weight: 700; }
.twb-cmp .diff td { background: var(--spark-soft); font-weight: 700; }
.twb-key { background: var(--good-soft); border-radius: 12px; padding: 10px 12px; font-size: 15px; }
`;
const MODES = {
  identical: { label: 'Identical', sub: 'Monozygotic (MZ)', dur: 4000,
    stats: [['Eggs', '1'], ['Sperm', '1'], ['Zygotes', '1, then it splits'], ['Shared genes', 'About 100%'], ['Sex', 'Always the same']],
    term: '<b>Mono</b>zygotic means "from <b>one</b> zygote." A zygote is a fertilized egg. Early on, it splits into two embryos with the same genes.',
    caps: [[0, 'One egg + one sperm'], [1500, 'Fertilized: ONE zygote'], [2000, 'The zygote splits in two'], [2900, 'Two embryos, same genes, same sex']] },
  fraternal: { label: 'Fraternal', sub: 'Dizygotic (DZ)', dur: 4000,
    stats: [['Eggs', '2'], ['Sperm', '2'], ['Zygotes', '2'], ['Shared genes', 'About 50%'], ['Sex', 'Same or different']],
    term: '<b>Di</b>zygotic means "from <b>two</b> zygotes." Two eggs are fertilized by two sperm at about the same time, so they are as genetically alike as any brother or sister.',
    caps: [[0, 'Two eggs + two sperm'], [1500, 'Fertilized: TWO zygotes'], [2900, 'Two embryos, about half their genes shared']] },
  semi: { label: 'Semi-identical', sub: 'Extremely rare', dur: 4200,
    stats: [['Eggs', '1'], ['Sperm', '2'], ['Zygotes', '1, then it splits'], ['Shared genes', 'About 75%'], ['Sex', 'Same or different']],
    term: 'Semi-identical twins come from <b>one egg fertilized by two sperm</b>. Only a handful of cases have ever been confirmed. They share all of their mother\'s genes but only part of their father\'s, landing between identical and fraternal twins.',
    caps: [[0, 'One egg + TWO sperm'], [1500, 'Both sperm enter one egg (extremely rare)'], [2000, 'The cell splits in two'], [2900, 'Two embryos, about 75% of genes shared']] }
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const back = u => { const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

ML.registerWidget('twin-builder', {
  title: 'Build a pair of twins', tag: 'Animation',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('twb-css')) document.head.append(h('style', { id: 'twb-css' }, CSS));
    const root = h('div', { class: 'twb' });
    let mode = 'identical', t0 = 0, raf = 0, lastCap = -1, playing = false;
    const ins = h('p', { class: 'twb-ins' }, 'Pick a twin type to watch how it forms. Tap Replay to see it again.');
    const modeBtns = Object.entries(MODES).map(([k, m]) => {
      const b = h('button', { type: 'button', class: 'chip', 'data-mode': k, 'aria-pressed': String(k === mode) }, m.label);
      b.addEventListener('click', () => { mode = k; modeBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); sfx.tap(); start(); });
      return b;
    });
    const replay = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Replay the animation' }, '↻ Replay');
    replay.addEventListener('click', () => { sfx.tap(); start(); });
    const svg = svgEl('svg', { viewBox: '24 6 312 186', role: 'img', 'aria-label': 'Animation of twins forming' });
    const cap = h('div', { class: 'twb-cap', 'aria-live': 'polite' });
    const stats = h('div', { class: 'twb-stats' });
    const term = h('p', { class: 'twb-term' });
    root.append(ins, h('div', { class: 'twb-modes', role: 'group', 'aria-label': 'Twin type' }, modeBtns, replay), h('div', { class: 'twb-stage' }, svg), cap, h('div', { class: 'twb-legend', 'aria-hidden': 'true' }, h('span', null, h('i', { style: { background: '#E39A4B' } }), 'genes from mom'), h('span', null, h('i', { style: { background: 'linear-gradient(90deg,#4B9CD3,#6EC3A3)' } }), 'genes from dad')), stats, term, panel());
    el.append(root);

    /* ---------- scene ---------- */
    svg.innerHTML = `
      <defs><radialGradient id="twbEgg" cx="40%" cy="35%"><stop offset="0" stop-color="#FFF6E2"/><stop offset="1" stop-color="#F6C98A"/></radialGradient></defs>
      <g class="eggs"></g><g class="sperm"></g><g class="embryos"></g><g class="fx"></g><g class="labels"></g>`;
    const G = n => svg.querySelector('.' + n);
    function mkEgg() {
      const g = svgEl('g');
      g.innerHTML = `<circle r="33" style="fill:none;stroke:#E7A85A;stroke-width:5;opacity:.45"/><circle r="29" fill="url(#twbEgg)" style="stroke:#D58A35;stroke-width:1.5"/><circle class="nuc" r="7" style="fill:#C9762A;opacity:0"/>`;
      G('eggs').append(g); return g;
    }
    function mkSperm() {
      const g = svgEl('g');
      g.innerHTML = `<path class="tail" style="fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round"/><ellipse class="head" rx="5.5" ry="3.6" style="fill:var(--carolina)"/>`;
      G('sperm').append(g); return g;
    }
    function mkEmbryo(col) {
      const g = svgEl('g');
      g.innerHTML = `<circle r="30" style="fill:var(--surface);fill-opacity:.55;stroke:${col};stroke-width:2;stroke-dasharray:4 3"/>
        <g class="bod"><ellipse cx="3" cy="6" rx="9" ry="12" transform="rotate(-20 3 6)" style="fill:${col};opacity:.85"/><circle cx="-3" cy="-9" r="9" style="fill:${col}"/><circle cx="-6" cy="-10" r="1.6" style="fill:var(--surface)"/><path d="M8 12 q8 4 10 14" style="fill:none;stroke:${col};stroke-width:2"/></g>`;
      G('embryos').append(g); return g;
    }
    function mkBar(seq, x, y) {
      const g = svgEl('g', { transform: `translate(${x} ${y})` });
      seq.forEach((c, i) => g.append(svgEl('rect', { x: i * 7, y: 0, width: 6, height: 10, rx: 1.5, style: `fill:${c}` })));
      G('labels').append(g); return g;
    }
    function text(x, y, s, cls) { const t = svgEl('text', { x, y, 'text-anchor': 'middle', style: `font-size:${cls === 'big' ? 17 : 13}px;font-weight:700;fill:${cls === 'big' ? 'var(--ink)' : 'var(--muted)'}` }); t.textContent = s; G('labels').append(t); return t; }
    function tailPath(len, ph) { let d = 'M0 0'; for (let i = 1; i <= 12; i++) { const x = -i * len / 12, y = Math.sin(ph + i * 0.9) * 3.2 * (i / 12); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } return d; }

    let S = null;
    const M = '#7A6FE0';
    const MOM = ['#E39A4B', '#E39A4B', '#E39A4B', '#E39A4B'], MOM2 = ['#E39A4B', '#C77B2D', '#E39A4B', '#C77B2D'];
    function build() {
      ['eggs', 'sperm', 'embryos', 'fx', 'labels'].forEach(n => G(n).innerHTML = '');
      const m = mode;
      S = { eggs: [], sperm: [], emb: [], labels: [] };
      const P1 = ['#4B9CD3', '#2F7FB8', '#4B9CD3', '#2F7FB8'], P2 = ['#6EC3A3', '#2E9C78', '#2F7FB8', '#6EC3A3'], P3 = ['#4B9CD3', '#6EC3A3', '#2F7FB8', '#2E9C78'];
      if (m === 'fraternal') {
        S.eggs = [{ g: mkEgg(), x: 112, y: 92 }, { g: mkEgg(), x: 248, y: 92 }];
        S.sperm = [{ g: mkSperm(), from: [10, 30], to: [86, 80], egg: 0, at: 200 }, { g: mkSperm(), from: [350, 175], to: [274, 104], egg: 1, at: 380 }];
        S.emb = [{ g: mkEmbryo('var(--carolina)'), x: 112, y: 92 }, { g: mkEmbryo('var(--spark)'), x: 248, y: 92 }];
        S.bars = [mkBar([...MOM, ...P1], 84, 148), mkBar([...MOM2, ...P3], 220, 148)];
        S.tags = [text(112, 178, 'Embryo A'), text(248, 178, 'Embryo B'), text(180, 24, '~50% shared', 'big')];
      } else {
        S.eggs = [{ g: mkEgg(), x: 180, y: 92 }];
        S.sperm = [{ g: mkSperm(), from: [10, 40], to: [152, 84], egg: 0, at: 200 }];
        if (m === 'semi') S.sperm.push({ g: mkSperm(), from: [350, 170], to: [208, 102], egg: 0, at: 260 });
        const colB = m === 'semi' ? M : 'var(--carolina)';
        S.emb = [{ g: mkEmbryo('var(--carolina)'), x: 112, y: 92 }, { g: mkEmbryo(colB), x: 248, y: 92 }];
        S.bars = m === 'semi' ? [mkBar([...MOM, ...P1], 84, 148), mkBar([...MOM, ...P2.slice(0, 2), ...P1.slice(2)], 220, 148)] : [mkBar([...MOM, ...P1], 84, 148), mkBar([...MOM, ...P1], 220, 148)];
        S.tags = [text(112, 178, 'Embryo A'), text(248, 178, 'Embryo B'), text(180, 24, m === 'semi' ? '~75% shared' : '~100% shared', 'big')];
      }
      S.flash = svgEl('circle', { r: 30, style: 'fill:none;stroke:var(--warn);stroke-width:3;opacity:0' }); G('fx').append(S.flash);
      if (mode === 'fraternal') { S.flash2 = svgEl('circle', { r: 30, style: 'fill:none;stroke:var(--warn);stroke-width:3;opacity:0' }); G('fx').append(S.flash2); }
    }
    function render(t) {
      const m = mode, rm = api.reduceMotion;
      // eggs
      S.eggs.forEach((e, i) => {
        const a = back(seg(t, i * 120, 400 + i * 120));
        let x = e.x, sc = a, op = 1;
        const nuc = e.g.querySelector('.nuc');
        nuc.style.opacity = String(seg(t, 1500, 1800));
        if (m !== 'fraternal') {
          const sp = ease(seg(t, 2000, 2800));
          op = 1 - seg(t, 2700, 2950);
          sc = a * (1 - sp * 0.15);
          e.g.setAttribute('transform', `translate(${x} ${e.y}) scale(${sc.toFixed(3)} ${(sc * (1 - sp * .05)).toFixed(3)})`);
          // the splitting: draw two halves via duplicate group
          if (!e.twin) { e.twin = e.g.cloneNode(true); e.twin.style.opacity = '0'; G('eggs').append(e.twin); }
          const d = sp * 68;
          e.g.setAttribute('transform', `translate(${180 - d} ${e.y}) scale(${(sc).toFixed(3)})`);
          e.twin.setAttribute('transform', `translate(${180 + d} ${e.y}) scale(${(sc).toFixed(3)})`);
          e.twin.style.opacity = String(sp > 0 ? op : 0);
          e.twin.querySelector('.nuc').style.opacity = nuc.style.opacity;
          e.g.style.opacity = String(op);
        } else {
          op = 1 - seg(t, 2700, 2950);
          e.g.setAttribute('transform', `translate(${x} ${e.y}) scale(${sc.toFixed(3)})`); e.g.style.opacity = String(op);
        }
      });
      // sperm
      S.sperm.forEach((s, i) => {
        const u = ease(seg(t, s.at, 1300));
        const enter = seg(t, 1300, 1550);
        const egg = S.eggs[s.egg];
        let x = s.from[0] + (s.to[0] - s.from[0]) * u, y = s.from[1] + (s.to[1] - s.from[1]) * u;
        x += (egg.x - s.to[0]) * enter * 0.8; y += (egg.y - s.to[1]) * enter * 0.8;
        const ang = Math.atan2(s.to[1] - s.from[1], s.to[0] - s.from[0]) * 180 / Math.PI;
        s.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
        s.g.querySelector('.tail').setAttribute('d', tailPath(30, rm ? 0 : t / 70 + i));
        s.g.style.opacity = String((t < s.at ? 0 : 1) * (1 - enter));
      });
      // fertilization flash
      const fl = seg(t, 1450, 1950);
      [[S.flash, S.eggs[0]], [S.flash2, S.eggs[1]]].forEach(([f, e]) => { if (!f || !e) return; f.setAttribute('cx', e.x); f.setAttribute('cy', e.y); f.setAttribute('r', 30 + fl * 26); f.style.opacity = String(fl > 0 && fl < 1 ? (1 - fl) : 0); });
      // embryos
      S.emb.forEach((e, i) => {
        const a = back(seg(t, 2750 + i * 120, 3300 + i * 120));
        const bob = rm ? 0 : Math.sin(t / 500 + i * 2) * 1.5;
        e.g.setAttribute('transform', `translate(${e.x} ${e.y + bob}) scale(${(0.2 + 0.8 * a).toFixed(3)})`);
        e.g.style.opacity = String(seg(t, 2700, 2950));
      });
      const lb = seg(t, 3300, 3700);
      S.bars.forEach(b => b.style.opacity = String(lb));
      S.tags.forEach(b => b.style.opacity = String(lb));
      // caption
      const caps = MODES[m].caps; let k = 0; caps.forEach((c, i) => { if (t >= c[0]) k = i; });
      if (k !== lastCap) { lastCap = k; cap.textContent = caps[k][1]; if (k > 0) sfx.blip(); }
    }
    let vis = true;
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); const ioT = setTimeout(() => io.observe(root), 80);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!vis && !playing) return;
      const t = playing ? now - t0 : 99999;
      render(api.reduceMotion && playing ? Math.max(t, 0) : t);
      if (playing && t > MODES[mode].dur + 400) playing = false;
    }
    function start() {
      const m = MODES[mode];
      stats.innerHTML = '';
      m.stats.forEach(([k, v]) => stats.append(h('div', { class: 'twb-stat' }, h('span', null, k), h('b', null, v))));
      term.innerHTML = m.term;
      lastCap = -1; build(); t0 = performance.now(); playing = true;
      if (api.reduceMotion) t0 -= m.dur; // jump to the finished state
      svg.setAttribute('aria-label', `${m.label} twins: ${m.stats.map(s => s.join(' ')).join(', ')}`);
    }
    start();
    raf = requestAnimationFrame(frame);

    /* ---------- Bouchard / baseline panel ---------- */
    function panel() {
      const tabs = [['apart', 'Twins raised apart'], ['why', 'Why compare fraternal twins?']];
      const body = h('div', { class: 'twb-pbody', role: 'tabpanel' });
      const tbtns = tabs.map(([k, label]) => {
        const b = h('button', { type: 'button', class: 'twb-tab', role: 'tab', 'data-t': k, 'aria-selected': 'false' }, label);
        b.addEventListener('click', () => show(k));
        b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const o = tbtns[(tbtns.indexOf(b) + 1) % 2]; o.focus(); o.click(); } });
        return b;
      });
      function show(k) {
        tbtns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === k)));
        body.innerHTML = '';
        if (k === 'apart') {
          const data = [['Identical, raised together', .86, 'var(--carolina)'], ['Identical, raised APART', .72, 'var(--spark)'], ['Fraternal, raised together', .60, 'var(--warn)'], ['Siblings, raised together', .47, 'var(--muted)']];
          const bars = data.map(([l, v, c]) => { const fl = h('div', { class: 'fl', style: { background: c } }); return { row: h('div', { class: 'twb-bar' }, h('span', null, l), h('div', { class: 'tr' }, fl), h('span', { class: 'v' }, v.toFixed(2))), fl, v }; });
          body.append(
            h('div', { class: 'twb-eyebrow' }, 'Minnesota Study of Twins Reared Apart · Thomas Bouchard · began 1979'),
            h('p', null, 'Bouchard\'s team tracked down identical twins who were separated as babies and raised in different homes. When tested as adults, they were strikingly similar in interests, IQ scores, and personality. They never shared a home, so much of that similarity points to genes.'),
            h('div', null, h('div', { class: 'twb-small', style: { marginBottom: '6px', fontWeight: 700 } }, 'How similar are IQ scores? (correlation: 0 = no link, 1 = perfect match)'), h('div', { class: 'twb-bars' }, bars.map(b => b.row))),
            h('p', { class: 'twb-small' }, 'Approximate correlations from twin and family research (Bouchard & McGue). Identical twins raised apart are MORE alike than fraternal twins raised together.'),
            h('div', { class: 'twb-story', html: '<b>The "Jim twins":</b> separated at a few weeks old and reunited at age 39 in 1979. Both had been named Jim, both married a Linda and then a Betty, and both named a son James Alan. Stories like this are fun, but the science comes from averaging many twin pairs, not from coincidences.' }),
            h('p', { class: 'twb-small' }, 'Think critically: twins raised apart are rare, and adoption agencies often placed them in similar kinds of homes, so their environments were not completely different.'));
          requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach(b => b.fl.style.width = (b.v * 100) + '%')));
        } else {
          const rows = [['Same family and home', '✓', '✓'], ['Born at the same time', '✓', '✓'], ['Shared the same womb', '✓', '✓'], ['Genes shared', '~100%', '~50%']];
          body.append(
            h('div', { class: 'twb-eyebrow' }, 'Fraternal twins are the comparison baseline'),
            h('table', { class: 'twb-cmp' }, h('thead', null, h('tr', null, h('th', null, ''), h('th', null, 'Identical'), h('th', null, 'Fraternal'))),
              h('tbody', null, rows.map((r, i) => h('tr', { class: i === 3 ? 'diff' : '' }, r.map((c, j) => h('td', { class: c === '✓' ? 'y' : '' }, c, c === '✓' ? h('span', { class: 'sr-only' }, ' yes') : null)))))),
            h('div', { class: 'twb-key' }, 'Both kinds of twins share a family, a birthday, and a womb. The big difference is how many genes they share. So if identical twins are more alike on a trait than fraternal twins, that extra similarity is evidence for genetic influence.'));
        }
        sfx.tap();
      }
      show('apart');
      return h('div', { class: 'twb-panel' }, h('div', { class: 'twb-tabs', role: 'tablist', 'aria-label': 'Twin research' }, tbtns), body);
    }
    return () => { cancelAnimationFrame(raf); clearTimeout(ioT); io.disconnect(); };
  }
});
})();
