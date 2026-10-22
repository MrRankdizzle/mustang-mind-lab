/* gene-library — the slide's library analogy as a zoom: Cell → Nucleus → Chromosome → DNA → Gene → Genome. */
(function () {
'use strict';
const CSS = `
.gl { display: flex; flex-direction: column; gap: 14px; }
.gl-ins { font-size: 15px; color: var(--muted); }
.gl-crumbs { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.gl-crumbs .chip { padding: 5px 11px; font-size: 13px; }
.gl-crumbs .sep { color: var(--muted); font-size: 13px; }
.gl-pair { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; }
.gl-eq { font-family: var(--f-display); font-size: 28px; color: var(--spark); text-align: center; }
@media (max-width: 600px) { .gl-pair { grid-template-columns: 1fr; gap: 6px; } .gl-eq { font-size: 20px; line-height: 1; } }
.gl-panel { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); overflow: hidden; display: flex; flex-direction: column; }
.gl-ph { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 8px 12px 0; }
.gl-ph span { font-family: var(--f-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.gl-ph b { font-size: 17px; }
.gl-panel.lib .gl-ph b { color: var(--warn); }
.gl-panel.bio .gl-ph b { color: var(--carolina); }
.gl-panel svg { width: 100%; height: auto; display: block; max-height: 230px; }
.gl-layer { transition: transform .65s cubic-bezier(.55,0,.25,1), opacity .5s ease; transform-box: view-box; }
.reduce-motion .gl-layer { transition: opacity .2s; }
.gl-hot { cursor: pointer; }
.gl-hot .ring { fill: none; stroke: var(--spark); stroke-width: 2.5; transform-box: fill-box; transform-origin: center; animation: glPulse 1.4s ease-out infinite; }
.gl-hot:focus-visible { outline: none; }
.gl-hot:focus-visible .ring { stroke-width: 4; }
@keyframes glPulse { 0% { transform: scale(.7); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
.reduce-motion .gl-hot .ring { animation: none; }
.gl-ctrl { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.gl-desc { background: var(--surface-2); border-left: 4px solid var(--spark); border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; }
.gl-desc h4 { margin: 0; font-size: 18px; }
.gl-desc p { font-size: 16px; }
.gl-desc .fact { font-size: 14px; color: var(--muted); }
`;
const LEVELS = [
  { bio: 'Cell', lib: 'The library', hot: [150, 84], libHot: [150, 104],
    title: 'Cell = the library', text: 'Your body is built from trillions of cells. Almost every cell holds a complete copy of your genetic library.', fact: 'Tap the glowing ring or Zoom in to step inside.' },
  { bio: 'Nucleus', lib: 'The room where books are kept', hot: [182, 66], libHot: [151, 66],
    title: 'Nucleus = the room where the books are kept', text: 'The nucleus is the cell’s control room. It keeps the DNA safe inside a protective envelope.', fact: 'Red blood cells are one exception: they have no nucleus at all.' },
  { bio: 'Chromosome', lib: 'One book', hot: [178, 40], libHot: [150, 82],
    title: 'Chromosome = one book', text: 'DNA is packed into chromosomes. Humans have 46 chromosomes in 23 pairs: one set from each parent.', fact: 'Unwound, the DNA in one cell would stretch about 2 meters long.' },
  { bio: 'DNA', lib: 'The writing in the book', hot: [150, 80], libHot: [218, 74],
    title: 'DNA = the writing inside the book', text: 'DNA spells out instructions with a 4-letter chemical alphabet: A, T, G, and C. A always pairs with T, and G with C.', fact: 'Your genome is about 3 billion letter pairs long.' },
  { bio: 'Gene', lib: 'One section of instructions', hot: [150, 80], libHot: [150, 80],
    title: 'Gene = one section with specific instructions', text: 'A gene is a segment of DNA with instructions for building a protein, like a receptor that catches a neurotransmitter. Genes are the basic units of heredity.', fact: 'You have roughly 20,000 genes.' },
  { bio: 'Genome', lib: 'The whole collection', hot: null, libHot: null,
    title: 'Genome = the whole collection', text: 'Your genome is the complete set of genetic instructions: every book, every page. Behavior genetics studies how this collection and your environment work together.', fact: 'Identical twins share essentially the same genome. Fraternal twins share about half of the parts that vary between people.' }
];
const SP = ['#E5485F', '#4B9CD3', '#E0B020', '#35B88A', '#7A6FE0', '#FF9F5A', '#3BB3C3', '#D96BB5'];
const xchrom = (x, y, s, rot, col, extra = '') => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" ${extra}><rect x="-4" y="-15" width="8" height="30" rx="4" transform="rotate(22)" style="fill:${col}"/><rect x="-4" y="-15" width="8" height="30" rx="4" transform="rotate(-22)" style="fill:${col}"/></g>`;
function shelf(x, y, w, h, rows, seed) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:#8A5A2B"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" style="fill:#5E3B18"/>`;
  const rh = (h - 8) / rows;
  for (let r = 0; r < rows; r++) {
    let bx = x + 6, k = 0;
    while (bx < x + w - 10) {
      const bw = 4 + ((seed * 7 + r * 13 + k * 5) % 4), bh = rh - 6 - ((seed + k * 3 + r) % 3) * 2;
      s += `<rect x="${bx}" y="${y + 4 + r * rh + (rh - bh) - 2}" width="${bw}" height="${bh}" rx="1" style="fill:${SP[(seed + k + r * 3) % SP.length]}"/>`;
      bx += bw + 1.5; k++;
    }
    s += `<rect x="${x + 4}" y="${y + 4 + (r + 1) * rh - 2}" width="${w - 8}" height="3" style="fill:#8A5A2B"/>`;
  }
  return s;
}
function helix(x0, x1, cy, amp, n, letters) {
  let a = '', b = '', rungs = '';
  for (let i = 0; i <= 120; i++) { const x = x0 + (x1 - x0) * i / 120, ph = i / 120 * n * Math.PI * 2; a += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (cy + Math.sin(ph) * amp).toFixed(1); b += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (cy - Math.sin(ph) * amp).toFixed(1); }
  const pairs = { A: 'T', T: 'A', G: 'C', C: 'G' }, pc = { A: '#E5485F', T: '#E0B020', G: '#35B88A', C: '#4B9CD3' };
  const steps = n * 6;
  for (let k = 0; k < steps; k++) {
    const u = (k + 0.5) / steps, x = x0 + (x1 - x0) * u, ph = u * n * Math.PI * 2, y1 = cy + Math.sin(ph) * amp, y2 = cy - Math.sin(ph) * amp;
    const L = letters[k % letters.length], R = pairs[L];
    rungs += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${(y1 + y2) / 2}" style="stroke:${pc[L]};stroke-width:3.2"/><line x1="${x}" y1="${(y1 + y2) / 2}" x2="${x}" y2="${y2}" style="stroke:${pc[R]};stroke-width:3.2"/>`;
  }
  return rungs + `<path d="${a}" style="fill:none;stroke:var(--ink);stroke-width:3;opacity:.8"/><path d="${b}" style="fill:none;stroke:var(--muted);stroke-width:3;opacity:.8"/>`;
}
const T = (x, y, s, size = 12, col = 'var(--ink)', extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" style="font-size:${size}px;font-weight:700;fill:${col}" ${extra}>${s}</text>`;
const LIB = [
  () => `<rect x="0" y="134" width="300" height="26" style="fill:var(--line)"/>
    <rect x="66" y="126" width="168" height="8" style="fill:#C9B79A"/><rect x="58" y="132" width="184" height="6" style="fill:#B7A280"/>
    <polygon points="56,58 150,20 244,58" style="fill:#E8DCC4;stroke:#B7A280;stroke-width:2"/>
    ${T(150, 49, 'LIBRARY', 12, '#7A5A2E', 'letter-spacing="2"')}
    <rect x="62" y="58" width="176" height="10" style="fill:#D9CBB0"/>
    ${[76, 104, 182, 210].map(x => `<rect x="${x}" y="68" width="14" height="58" style="fill:#EFE6D3;stroke:#C9B79A"/>`).join('')}
    <rect x="128" y="68" width="44" height="58" style="fill:#EFE6D3"/><path d="M137 126 V96 a13 13 0 0 1 26 0 V126 Z" style="fill:#6B4423"/>
    <rect x="132" y="74" width="36" height="12" rx="2" style="fill:#F6D58A;opacity:.85"/>`,
  () => `<rect x="0" y="0" width="300" height="160" style="fill:#EFE3CF"/><rect x="0" y="132" width="300" height="28" style="fill:#B98D5E"/>
    ${shelf(18, 22, 80, 108, 3, 1)}${shelf(110, 22, 80, 108, 3, 4)}${shelf(202, 22, 80, 108, 3, 7)}
    <rect x="146" y="${22 + 4 + 34.7 + 6}" width="10" height="27" rx="1" style="fill:#FFD166;stroke:var(--spark);stroke-width:2"/>`,
  () => `<rect x="0" y="0" width="300" height="160" style="fill:#F3EADB"/>
    <rect x="104" y="24" width="96" height="120" rx="4" style="fill:#F5F0E6;stroke:#C9B79A"/>
    <rect x="98" y="20" width="96" height="120" rx="5" style="fill:#E5485F"/><rect x="98" y="20" width="12" height="120" rx="3" style="fill:#B9334A"/>
    <rect x="120" y="44" width="62" height="34" rx="3" style="fill:#FFF3D6"/>
    ${T(151, 59, 'VOLUME', 9, '#7A2B38')}${T(151, 73, '11', 14, '#7A2B38')}
    <path d="M122 100 h56 M122 108 h40" style="stroke:#FFF3D6;stroke-width:3;stroke-linecap:round;opacity:.7"/>`,
  () => `<rect x="0" y="0" width="300" height="160" style="fill:#F3EADB"/>
    <path d="M150 30 C120 22 70 22 34 30 V140 C70 132 120 132 150 140 Z" style="fill:#FFFDF6;stroke:#C9B79A;stroke-width:1.5"/>
    <path d="M150 30 C180 22 230 22 266 30 V140 C230 132 180 132 150 140 Z" style="fill:#FFFDF6;stroke:#C9B79A;stroke-width:1.5"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<text x="92" y="${46 + i * 12}" text-anchor="middle" style="font-family:var(--f-mono);font-size:9px;fill:#6B5A45;letter-spacing:.5px">${'ATGCGTACCTAGGATCCATGGCAT'.slice(i, i + 12)}</text>`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<text x="208" y="${46 + i * 12}" text-anchor="middle" style="font-family:var(--f-mono);font-size:9px;fill:#6B5A45;letter-spacing:.5px">${'GGCATTACGCTAGCATGCAAGTCC'.slice(i, i + 12)}</text>`).join('')}
    <rect x="172" y="62" width="74" height="26" rx="3" style="fill:#FFD166;opacity:.45"/>`,
  () => `<rect x="0" y="0" width="300" height="160" style="fill:#F3EADB"/>
    <rect x="62" y="12" width="176" height="140" rx="4" style="fill:#FFFDF6;stroke:#C9B79A;stroke-width:1.5"/>
    ${[24, 34, 44].map(y => `<rect x="76" y="${y}" width="${y === 44 ? 100 : 148}" height="4" rx="2" style="fill:#D8CDB8"/>`).join('')}
    <rect x="70" y="54" width="160" height="56" rx="6" style="fill:#FFD166;opacity:.55;stroke:var(--spark);stroke-width:2"/>
    ${T(150, 70, 'Instructions: build a', 11, '#5E3B18')}${T(150, 85, 'dopamine receptor', 13, '#B9334A')}
    <rect x="86" y="94" width="128" height="4" rx="2" style="fill:#C9A445"/>
    ${[120, 130, 140].map(y => `<rect x="76" y="${y}" width="${y === 140 ? 90 : 148}" height="4" rx="2" style="fill:#D8CDB8"/>`).join('')}`,
  () => `<rect x="0" y="0" width="300" height="160" style="fill:#EFE3CF"/><rect x="0" y="140" width="300" height="20" style="fill:#B98D5E"/>
    ${[0, 1, 2, 3, 4, 5].map(i => shelf(8 + i * 48, 14, 44, 60, 3, i * 2 + 1) + shelf(8 + i * 48, 78, 44, 60, 3, i * 3 + 2)).join('')}`
];
const BIO = [
  () => `<path d="M34 82 C32 34 104 16 158 20 C230 24 270 50 266 88 C262 130 204 148 150 144 C88 140 36 126 34 82Z" style="fill:var(--carolina-soft);stroke:var(--carolina);stroke-width:3"/>
    <ellipse cx="78" cy="62" rx="16" ry="8" transform="rotate(-20 78 62)" style="fill:#F2A65A;stroke:#C77B2D"/><path d="M66 64 q4 -6 8 0 t8 0 t8 0" transform="rotate(-20 78 62)" style="fill:none;stroke:#C77B2D;stroke-width:1.4"/>
    <ellipse cx="222" cy="112" rx="15" ry="7.5" transform="rotate(15 222 112)" style="fill:#F2A65A;stroke:#C77B2D"/>
    <path d="M196 54 q14 10 0 20 q-14 10 0 20" style="fill:none;stroke:var(--carolina);stroke-width:2;opacity:.6"/><path d="M206 50 q14 12 0 24 q-14 12 0 24" style="fill:none;stroke:var(--carolina);stroke-width:2;opacity:.6"/>
    ${[[70, 108], [96, 120], [236, 70], [116, 40], [180, 128], [60, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" style="fill:var(--carolina)"/>`).join('')}
    <circle cx="150" cy="84" r="32" style="fill:var(--spark-soft);stroke:var(--spark);stroke-width:3"/><circle cx="142" cy="80" r="9" style="fill:var(--spark);opacity:.5"/>`,
  () => `<circle cx="150" cy="80" r="70" style="fill:var(--spark-soft);stroke:var(--spark);stroke-width:5"/>
    ${[0, 40, 80, 130, 170, 215, 260, 305].map(a => `<circle cx="${150 + 70 * Math.cos(a * Math.PI / 180)}" cy="${80 + 70 * Math.sin(a * Math.PI / 180)}" r="3.4" style="fill:var(--surface-2)"/>`).join('')}
    ${[[110, 60, 25, 0], [130, 108, -30, 1], [200, 98, 40, 2], [150, 44, 70, 3], [104, 92, 80, 4], [170, 118, 10, 5], [120, 132, 50, 6], [214, 60, -15, 7]].map(([x, y, r, c]) => xchrom(x, y, 0.8, r, SP[c])).join('')}
    ${xchrom(182, 66, 1.05, -10, '#E5485F')}`,
  () => `<g transform="translate(150 82)">
      <g transform="rotate(20)"><rect x="-13" y="-66" width="26" height="132" rx="13" style="fill:#E5485F"/>${[-50, -36, -20, 18, 34, 50].map(y => `<rect x="-13" y="${y}" width="26" height="5" style="fill:#9E2236;opacity:.55"/>`).join('')}</g>
      <g transform="rotate(-20)"><rect x="-13" y="-66" width="26" height="132" rx="13" style="fill:#EF6A7E"/>${[-50, -36, -20, 18, 34, 50].map(y => `<rect x="-13" y="${y}" width="26" height="5" style="fill:#9E2236;opacity:.55"/>`).join('')}</g>
      <circle r="8" style="fill:#9E2236"/></g>`,
  () => helix(20, 280, 80, 34, 2, 'ATGCGTACCTAG') + T(150, 152, 'A–T   G–C', 12, 'var(--muted)'),
  () => `<rect x="14" y="58" width="272" height="44" rx="6" style="fill:var(--surface);stroke:var(--line)"/>
    ${'ATGCGTACCTAGGATCCATGGCATTACG'.split('').map((c, i) => { const pc = { A: '#E5485F', T: '#E0B020', G: '#35B88A', C: '#4B9CD3' }; const x = 22 + i * 9.6; return `<rect x="${x - 3.6}" y="66" width="7.2" height="12" rx="1.5" style="fill:${pc[c]}"/><text x="${x}" y="95" text-anchor="middle" style="font-family:var(--f-mono);font-size:9px;fill:var(--muted)">${c}</text>`; }).join('')}
    <rect x="${22 + 9 * 9.6 - 7}" y="52" width="${10 * 9.6 + 4}" height="56" rx="8" style="fill:none;stroke:var(--spark);stroke-width:3"/>
    <path d="M${22 + 9 * 9.6 - 5} 124 h${10 * 9.6} M${22 + 9 * 9.6 - 5} 118 v12 M${22 + 19 * 9.6 - 9} 118 v12" style="stroke:var(--spark);stroke-width:2.5;fill:none"/>
    ${T(22 + 14 * 9.6 - 7, 146, 'one gene', 14, 'var(--spark)')}${T(150, 36, 'a stretch of DNA', 12, 'var(--muted)')}`,
  () => { let s = ''; let k = 0; for (let r = 0; r < 4; r++) { const n = r < 3 ? 6 : 5; for (let c = 0; c < n; c++) { const x = 30 + c * 46 + (r === 3 ? 23 : 0), y = 26 + r * 36, sc = 0.78 - k * 0.018; s += xchrom(x - 7, y, sc, 0, SP[k % 8]) + xchrom(x + 7, y, sc, 0, SP[k % 8]); k++; } } return s + T(150, 156, '23 pairs = 46 chromosomes', 12, 'var(--muted)'); }
];

ML.registerWidget('gene-library', {
  title: 'Your genetic library', tag: 'Zoom',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('gl-css')) document.head.append(h('style', { id: 'gl-css' }, CSS));
    let lvl = 0;
    const timers = new Set();
    const root = h('div', { class: 'gl' });
    const ins = h('p', { class: 'gl-ins' }, 'Tap the glowing ring (or Zoom in) to travel from a whole cell down to a single gene. Each level matches a part of a library.');
    const crumbs = h('div', { class: 'gl-crumbs', role: 'group', 'aria-label': 'Zoom levels' });
    const chips = LEVELS.map((L, i) => { const c = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(i === 0) }, L.bio); c.addEventListener('click', () => go(i)); return c; });
    chips.forEach((c, i) => { if (i) crumbs.append(h('span', { class: 'sep', 'aria-hidden': 'true' }, '›')); crumbs.append(c); });
    const mk = (cls, label) => { const svg = svgEl('svg', { viewBox: '0 0 300 160', role: 'img' }); const name = h('b'); const p = h('div', { class: 'gl-panel ' + cls }, h('div', { class: 'gl-ph' }, h('span', null, label), name), svg); return { svg, name, p, layer: null }; };
    const lib = mk('lib', 'In the library'), bio = mk('bio', 'In your cells');
    const zin = h('button', { type: 'button', class: 'btn btn-primary btn-sm gl-in' }, 'Zoom in +');
    const zout = h('button', { type: 'button', class: 'btn btn-sm gl-out' }, '− Zoom out');
    const desc = h('div', { class: 'gl-desc', 'aria-live': 'polite' });
    zin.addEventListener('click', () => go(lvl + 1));
    zout.addEventListener('click', () => go(lvl - 1));
    root.append(ins, crumbs, h('div', { class: 'gl-pair' }, lib.p, h('div', { class: 'gl-eq', 'aria-hidden': 'true' }, '='), bio.p), h('div', { class: 'gl-ctrl' }, zout, zin), desc);
    el.append(root);

    function layerFor(P, i, isLib) {
      const L = LEVELS[i];
      const g = svgEl('g', { class: 'gl-layer' });
      g.innerHTML = (isLib ? LIB : BIO)[i]();
      const hot = isLib ? L.libHot : L.hot;
      if (hot) {
        const hs = svgEl('g', { class: 'gl-hot', tabindex: '0', role: 'button', 'aria-label': `Zoom in to the ${LEVELS[i + 1].bio.toLowerCase()}` });
        hs.innerHTML = `<circle cx="${hot[0]}" cy="${hot[1]}" r="18" style="fill:transparent"/><circle class="ring" cx="${hot[0]}" cy="${hot[1]}" r="13"/>`;
        hs.addEventListener('click', () => go(i + 1));
        hs.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i + 1); } });
        g.append(hs);
      }
      return g;
    }
    function swap(P, i, from, isLib) {
      const old = P.layer, nu = layerFor(P, i, isLib);
      const goingIn = from < i;
      const reverse = i === 5 || from === 5; // the genome is a zoom OUT to the whole collection
      const zoomIn = reverse ? !goingIn : goingIn;
      const oldHot = from >= 0 ? (isLib ? LEVELS[Math.min(from, i)].libHot : LEVELS[Math.min(from, i)].hot) || [150, 80] : [150, 80];
      P.svg.setAttribute('aria-label', `${isLib ? 'Library' : 'Biology'}: ${isLib ? LEVELS[i].lib : LEVELS[i].bio}`);
      if (!old || api.reduceMotion) { if (old) old.remove(); P.svg.append(nu); P.layer = nu; return; }
      const o = `${oldHot[0]}px ${oldHot[1]}px`;
      nu.style.transition = 'none'; nu.style.opacity = '0'; nu.style.transformOrigin = o;
      nu.style.transform = zoomIn ? 'scale(.3)' : 'scale(3.2)';
      old.style.transformOrigin = o;
      P.svg.append(nu); P.layer = nu;
      void nu.getBoundingClientRect();
      nu.style.transition = ''; nu.style.opacity = '1'; nu.style.transform = 'scale(1)';
      old.style.opacity = '0'; old.style.transform = zoomIn ? 'scale(3.2)' : 'scale(.3)';
      old.style.pointerEvents = 'none';
      const t = setTimeout(() => { old.remove(); timers.delete(t); }, 700); timers.add(t);
    }
    function go(i, silent) {
      if (i < 0 || i >= LEVELS.length || (i === lvl && !silent)) return;
      const from = silent ? -1 : lvl; lvl = i;
      swap(lib, i, from, true); swap(bio, i, from, false);
      const L = LEVELS[i];
      lib.name.textContent = L.lib; bio.name.textContent = L.bio;
      chips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
      zin.disabled = i === LEVELS.length - 1; zout.disabled = i === 0;
      zin.textContent = i === 4 ? 'Zoom way out: the whole genome' : 'Zoom in +';
      desc.innerHTML = '';
      desc.append(h('h4', null, L.title), h('p', null, L.text), h('p', { class: 'fact' }, L.fact));
      if (!silent) { sfx.tone(i === 5 ? 300 : 360 + i * 90, 0.16, 'triangle', 0.08, i === 5 ? 160 : 560 + i * 90); if (i === 5) api.addXP(2); }
    }
    go(0, true);
    return () => { timers.forEach(clearTimeout); timers.clear(); };
  }
});
})();
