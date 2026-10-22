/* Mini Crossword — a fresh 6–9 word crossword generated from Unit 1 terms each round. */
(function () {
'use strict';
const ID = 'crossword';
const MAX_SIZE = 11, MAX_WORDS = 9, ATTEMPTS = 48;
const recent = [];

const CSS = `
.cw-root { display: flex; flex-direction: column; gap: 10px; }
.cw-layout { display: flex; flex-direction: column; gap: 12px; }
.cw-main { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.cw-board {
  display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 2px; width: min(100%, calc(var(--cols) * 44px));
  container-type: inline-size; touch-action: manipulation; user-select: none; -webkit-user-select: none; border-radius: 8px; outline-offset: 4px;
}
.cw-block { aspect-ratio: 1; }
.cw-cell {
  aspect-ratio: 1; position: relative; background: #E8F0FF; border-radius: 3px; cursor: pointer; display: grid; place-items: center;
  font-family: var(--f-body); font-weight: 700; color: #0B1222; font-size: calc((100cqi - (var(--cols) - 1) * 2px) / var(--cols) * .56); line-height: 1;
  transition: background .12s;
}
.cw-num { position: absolute; top: 1px; left: 2px; font-family: var(--f-mono); font-weight: 700; color: #3B4A6E; line-height: 1;
  font-size: max(8px, calc((100cqi - (var(--cols) - 1) * 2px) / var(--cols) * .27)); }
.cw-cell.cw-s-hl { background: #A9D3F2; }
.cw-cell.cw-s-cur { background: var(--arc-gold); }
.cw-cell.cw-s-lock { background: #BFF5DF; color: #0B6B49; }
.cw-cell.cw-s-lock.cw-s-hl { background: #9BEBCB; }
.cw-cell.cw-s-lock.cw-s-cur { background: var(--arc-gold); }
.cw-cell.cw-s-bad .cw-ch { color: #D3263F; }
.cw-cell.cw-s-bad::after { content: ""; position: absolute; left: 12%; right: 12%; top: 50%; height: 2px; background: #D3263F; transform: rotate(-35deg); }
.cw-cell.cw-s-rev::before { content: ""; position: absolute; top: 0; right: 0; border-style: solid; border-width: 0 7px 7px 0; border-color: transparent #E5485F transparent transparent; }
.cw-cell.cw-s-pop .cw-ch { animation: cw-pop .16s ease; }
.cw-cell.cw-s-win { animation: cw-win .5s ease both; }
.cw-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.cw-btn { border: 1.5px solid var(--arc-line); background: var(--arc-panel); color: var(--arc-ink); border-radius: 99px; padding: 8px 14px; font-weight: 700; font-size: 15px; cursor: pointer; min-height: 42px; }
.cw-btn:hover { border-color: var(--arc-blue); }
.cw-btn.cw-s-primary { background: var(--arc-blue); border-color: var(--arc-blue); color: #0B1222; }
.cw-dock { position: sticky; bottom: 0; z-index: 2; background: var(--arc-bg); padding: 6px 0 4px; display: grid; gap: 8px; width: 100%; }
.cw-cluebar { display: grid; grid-template-columns: 42px 1fr 42px; align-items: center; gap: 6px; background: #1C2C52; border: 1px solid var(--arc-line); border-radius: 12px; padding: 6px; min-height: 62px; }
.cw-cluebar button { height: 46px; border: 0; border-radius: 9px; background: rgba(255,255,255,.06); color: var(--arc-ink); font-size: 20px; font-weight: 700; cursor: pointer; }
.cw-cluetxt { font-size: 17px; line-height: 1.35; color: var(--arc-ink); }
.cw-cluetxt b { font-family: var(--f-mono); font-size: 13px; color: var(--arc-gold); letter-spacing: .06em; margin-right: 6px; white-space: nowrap; }
.cw-kb { display: grid; gap: 5px; max-width: 520px; width: 100%; margin: 0 auto; user-select: none; -webkit-user-select: none; }
.cw-kr { display: flex; gap: 5px; justify-content: center; }
.cw-key { flex: 1 1 0; min-width: 0; max-width: 46px; height: 46px; border: 0; border-radius: 8px; padding: 0; background: #2C3C66; color: var(--arc-ink); font-weight: 700; font-size: 16px; cursor: pointer; touch-action: manipulation; }
.cw-key:active { transform: scale(.94); background: #3A4D80; }
.cw-key.cw-s-wide { max-width: 66px; flex-grow: 1.5; font-size: 18px; }
.cw-half { flex: .5 1 0; max-width: 22px; }
.cw-side { display: grid; gap: 14px; align-content: start; }
.cw-list h3 { font-family: var(--f-mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--arc-gold); margin: 0 0 6px; }
.cw-list ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.cw-list button { width: 100%; text-align: left; display: grid; grid-template-columns: 28px 1fr; gap: 6px; border: 1px solid transparent; background: transparent; color: var(--arc-ink); border-radius: 9px; padding: 7px 8px; cursor: pointer; font-size: 15px; line-height: 1.35; }
.cw-list button:hover { border-color: var(--arc-line); }
.cw-list button .cw-s-n { font-family: var(--f-mono); font-weight: 700; color: var(--arc-blue); }
.cw-list button.cw-s-on { background: #1C2C52; border-color: var(--arc-blue); }
.cw-list button.cw-s-done { color: var(--arc-dim); }
.cw-list button.cw-s-done .cw-s-n { color: var(--arc-mint); }
.cw-list button.cw-s-done .cw-s-t { text-decoration: line-through; text-decoration-color: rgba(53,227,167,.6); }
.cw-done { display: grid; gap: 8px; justify-items: center; text-align: center; background: var(--arc-panel); border: 1px solid var(--arc-line); border-radius: 14px; padding: 14px 16px; width: 100%; }
.cw-done b { font-family: var(--f-display); font-weight: 400; font-size: 22px; color: var(--arc-mint); letter-spacing: .02em; }
.cw-pop { position: fixed; z-index: 30; pointer-events: none; font-family: var(--f-display); font-size: 22px; color: var(--arc-gold); text-shadow: 0 2px 10px rgba(0,0,0,.5); animation: cw-float 1s ease-out forwards; }
@keyframes cw-pop { 50% { transform: scale(1.25); } }
@keyframes cw-win { 40% { transform: scale(1.14) rotate(-3deg); background: var(--arc-mint); } }
@keyframes cw-float { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -44px); } }
.cw-root.cw-s-rm * { animation: none !important; }
@media (min-width: 900px) {
  .cw-layout { display: grid; grid-template-columns: minmax(0, 500px) minmax(260px, 1fr); grid-template-areas: "main side" "dock side"; grid-template-rows: auto 1fr; gap: 12px 26px; }
  .cw-main { grid-area: main; }
  .cw-dock { grid-area: dock; position: static; align-self: start; }
  .cw-side { grid-area: side; max-height: 760px; overflow-y: auto; padding-right: 4px; }
}
@media (max-width: 920px) { .cw-dock { bottom: calc(66px + env(safe-area-inset-bottom, 0px)); } }
@media (max-width: 899px) { .cw-side { grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); } }
@media (max-width: 600px) { .cw-actions { gap: 6px; } .cw-btn { font-size: 14px; padding: 7px 10px; min-height: 40px; } }
@media (max-width: 380px) { .cw-key { height: 44px; font-size: 15px; } .cw-kr { gap: 4px; } }
`;
function injectCSS() {
  if (document.getElementById('css-' + ID)) return;
  const s = document.createElement('style'); s.id = 'css-' + ID; s.textContent = CSS; document.head.append(s);
}

/* ---------- text helpers ---------- */
const stripParens = s => String(s).replace(/\([^)]*\)/g, ' ');
const wordsOf = s => stripParens(s).replace(/[’']/g, '').trim().split(/\s+/).filter(Boolean);
const lettersOf = s => wordsOf(s).join('').toUpperCase().replace(/[^A-Z]/g, '');
const STOP = new Set(['THAT', 'THIS', 'WITH', 'FROM', 'INTO', 'THEM', 'THEY', 'WHEN', 'EACH', 'ONES', 'OVER', 'MORE', 'LESS', 'LIKE', 'SUCH', 'HAVE', 'THEN', 'THAN', 'WHAT', 'SOME', 'ONLY', 'ALSO']);
function maskDef(def, term) {
  const ans = lettersOf(term.t);
  const tw = wordsOf(term.t).map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 4);
  return String(def).replace(/[A-Za-z’']+/g, tok => {
    const L = tok.toUpperCase().replace(/[^A-Z]/g, '');
    if (L.length < 4 || STOP.has(L)) return tok;
    if (ans.includes(L) || tw.some(w => L.startsWith(w) || (w.length >= 5 && w.startsWith(L)))) return '___';
    return tok;
  });
}
function candidates(terms) {
  const out = [], seen = new Set();
  for (const t of terms) {
    const ws = wordsOf(t.t);
    const ans = lettersOf(t.t);
    if (ans.length < 3 || ans.length > 10 || seen.has(ans)) continue;
    seen.add(ans); out.push({ term: t, ans, nWords: ws.length });
  }
  return out;
}
function typingElsewhere(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  if (document.querySelector('.modal-back')) return true;
  const t = e.target;
  if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) return true;
  return false;
}

/* ---------- generator ----------
   Greedy placement on a sparse grid: start with a long word across, then repeatedly add the
   best-scoring crossing placement (valid letter match, no parallel adjacency, empty cells before
   and after each word, bounding box ≤ 11×11). Many shuffled attempts; keep the densest. */
function tryBuild(cands, shuffle) {
  const K = (r, c) => (r + 64) * 256 + (c + 64);
  const cells = new Map(), list = [];
  const placed = [];
  let minR = 0, maxR = 0, minC = 0, maxC = 0;
  const part = (extra, single) => shuffle(cands.filter(c => !!c.extra === extra && (c.nWords === 1) === single));
  let pool = part(false, true).concat(part(false, false), part(true, true), part(true, false)).slice(0, 70);
  const starters = pool.filter(c => c.ans.length >= 6 && c.ans.length <= 10).slice(0, 10);
  if (!starters.length) return null;
  const first = starters.sort((a, b) => b.ans.length - a.ans.length)[Math.random() * Math.min(3, starters.length) | 0];

  function place(cand, r, c, dir) {
    const dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
    for (let i = 0; i < cand.ans.length; i++) {
      const rr = r + dr * i, cc = c + dc * i, k = K(rr, cc);
      let cell = cells.get(k);
      if (!cell) { cell = { r: rr, c: cc, ch: cand.ans[i], A: false, D: false }; cells.set(k, cell); list.push(cell); }
      cell[dir] = true;
    }
    if (!placed.length) { minR = r; minC = c; maxR = r + dr * (cand.ans.length - 1); maxC = c + dc * (cand.ans.length - 1); }
    else { minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r + dr * (cand.ans.length - 1)); maxC = Math.max(maxC, c + dc * (cand.ans.length - 1)); }
    placed.push({ cand, r, c, dir });
  }
  function check(word, r, c, dir) {
    const n = word.length, dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
    const r1 = r + dr * (n - 1), c1 = c + dc * (n - 1);
    const nr0 = Math.min(minR, r), nr1 = Math.max(maxR, r1), nc0 = Math.min(minC, c), nc1 = Math.max(maxC, c1);
    if (nr1 - nr0 + 1 > MAX_SIZE || nc1 - nc0 + 1 > MAX_SIZE) return null;
    if (cells.has(K(r - dr, c - dc)) || cells.has(K(r1 + dr, c1 + dc))) return null;
    let cross = 0;
    for (let i = 0; i < n; i++) {
      const rr = r + dr * i, cc = c + dc * i, cell = cells.get(K(rr, cc));
      if (cell) {
        if (cell.ch !== word[i] || cell[dir]) return null;
        cross++;
      } else if (dir === 'A' ? (cells.has(K(rr - 1, cc)) || cells.has(K(rr + 1, cc))) : (cells.has(K(rr, cc - 1)) || cells.has(K(rr, cc + 1)))) return null;
    }
    if (!cross || cross === n) return null;
    const growth = (nr1 - nr0 + 1) * (nc1 - nc0 + 1) - (maxR - minR + 1) * (maxC - minC + 1);
    return { cross, growth, h: nr1 - nr0 + 1, w: nc1 - nc0 + 1 };
  }

  place(first, 0, 0, 'A');
  pool = pool.filter(p => p !== first && !first.ans.includes(p.ans) && !p.ans.includes(first.ans));
  while (placed.length < MAX_WORDS) {
    let best = null;
    for (const cand of pool) {
      const w = cand.ans;
      for (const cell of list) {
        for (let i = 0; i < w.length; i++) {
          if (w[i] !== cell.ch) continue;
          for (const dir of ['A', 'D']) {
            if (cell[dir]) continue;
            const r = dir === 'A' ? cell.r : cell.r - i, c = dir === 'A' ? cell.c - i : cell.c;
            const ok = check(w, r, c, dir);
            if (!ok) continue;
            const squareness = -Math.abs(ok.h - ok.w) * 1.2;
            const sc = ok.cross * 9 + w.length * 0.9 + (cand.nWords === 1 ? 3 : 0) + (cand.extra ? 0 : 8) - ok.growth * 0.12 + squareness + Math.random() * 7;
            if (!best || sc > best.sc) best = { cand, r, c, dir, sc };
          }
        }
      }
    }
    if (!best) break;
    place(best.cand, best.r, best.c, best.dir);
    const a = best.cand.ans;
    pool = pool.filter(p => p !== best.cand && !a.includes(p.ans) && !p.ans.includes(a));
  }
  if (placed.length < 4) return null;
  const rows = maxR - minR + 1, cols = maxC - minC + 1;
  let crossings = 0; list.forEach(c => { if (c.A && c.D) crossings++; });
  return {
    rows, cols, crossings, density: list.length / (rows * cols),
    words: placed.map(p => ({ term: p.cand.term, ans: p.cand.ans, nWords: p.cand.nWords, extra: !!p.cand.extra, r: p.r - minR, c: p.c - minC, dir: p.dir }))
  };
}
function generate(cands, shuffle) {
  let best = null;
  for (let a = 0; a < ATTEMPTS; a++) {
    const g = tryBuild(cands, shuffle);
    if (!g) continue;
    const nw = g.words.length;
    const sc = Math.min(nw, MAX_WORDS) * 10 + g.crossings * 2.5 + g.density * 18 - Math.max(0, 6 - nw) * 15 + g.words.filter(w => !w.extra).length * 4;
    if (!best || sc > best.sc) { best = g; best.sc = sc; }
  }
  return best;
}

ML.registerGame({
  id: ID, title: 'Mini Crossword', kind: 'word',
  blurb: 'A brand-new crossword every round, built from Unit 1 terms and their definitions.',
  how: [
    'Tap a square to pick it. Tap it again to switch between Across and Down.',
    'Type with your keyboard or the on-screen keys. Clues are the term definitions.',
    'Words lock in green when they are right. Use Check or Reveal if you are stuck.',
    'Finish fast with few reveals for a high score.'
  ],
  art: `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="250" height="112" style="fill:#0B1222"/>
    <g style="font-family:'Atkinson Hyperlegible',sans-serif;font-weight:700;font-size:13px" text-anchor="middle">
    ${(() => {
      const cells = {};
      const put = (r, c, ch, cls) => { const k = r + ',' + c; cells[k] = cells[k] && cells[k].cls === 'cw-s-cur' ? cells[k] : { r, c, ch, cls }; };
      [...'SYNAPSE'].forEach((ch, i) => put(1, 2 + i, ch, i === 3 ? 'cw-s-cur' : 'cw-s-hl'));
      [...'AXON'].forEach((ch, i) => put(1 + i, 5, ch, i ? 'cw-s-lock' : 'cw-s-cur'));
      [...'LENS'].forEach((ch, i) => put(i, 8, ch, i === 1 ? 'cw-s-hl' : ''));
      return Object.values(cells).map(({ r, c, ch, cls }) => {
        const x = 38 + c * 19, y = 4 + r * 19;
        const fill = cls === 'cw-s-cur' ? '#FFD166' : cls === 'cw-s-hl' ? '#A9D3F2' : cls === 'cw-s-lock' ? '#BFF5DF' : '#E8F0FF';
        return `<rect x="${x}" y="${y}" width="17" height="17" rx="2" style="fill:${fill}"/><text x="${x + 8.5}" y="${y + 13}" style="fill:#0B1222">${ch}</text>`;
      }).join('');
    })()}
    </g>
    <text x="20" y="104" style="fill:#FFD166;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700">2 ACROSS</text>
    <rect x="82" y="98" width="90" height="5" rx="2.5" style="fill:#24325A"/>
  </svg>`,

  mount(el, ctx) {
    injectCSS();
    const { h, sfx, util } = ctx;
    const RM = ctx.reduceMotion;
    let dead = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };

    /* ---- build puzzle ---- */
    let cands = candidates(ctx.terms);
    if (cands.length < 18) {
      const have = new Set(cands.map(c => c.ans));
      cands = cands.concat(candidates(ctx.allTerms).filter(c => !have.has(c.ans)).map(c => Object.assign(c, { extra: true })));
    }
    // keep recently used answers out when there are plenty of alternatives
    const freshC = cands.filter(c => !recent.includes(c.ans));
    if (freshC.length >= 24) cands = freshC;
    // topic terms first: extras only used if needed
    const topicC = cands.filter(c => !c.extra);
    let puz = topicC.length >= 14 ? generate(topicC, util.shuffle) : null;
    if (!puz || puz.words.length < 6) { const p2 = generate(cands, util.shuffle); if (p2 && (!puz || p2.words.length > puz.words.length)) puz = p2; }
    if (!puz) { el.append(h('p', null, 'Could not build a crossword for these topics. Try more topics.')); return () => {}; }
    puz.words.forEach(w => { recent.push(w.ans); if (recent.length > 30) recent.shift(); });

    const R = puz.rows, C = puz.cols;
    const grid = Array.from({ length: R }, () => Array(C).fill(null));
    const words = puz.words.map((w, idx) => Object.assign({}, w, { idx, cells: [], locked: false, revealed: false }));
    words.forEach(w => {
      for (let i = 0; i < w.ans.length; i++) {
        const r = w.r + (w.dir === 'D' ? i : 0), c = w.c + (w.dir === 'A' ? i : 0);
        let cell = grid[r][c];
        if (!cell) cell = grid[r][c] = { r, c, sol: w.ans[i], val: '', A: -1, D: -1, num: 0, locked: false, el: null, ch: null };
        cell[w.dir] = w.idx; w.cells.push(cell);
      }
    });
    // numbering (row-major over word starts)
    let num = 0;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const starts = words.filter(w => w.r === r && w.c === c);
      if (starts.length) { num++; grid[r][c].num = num; starts.forEach(w => { w.num = num; }); }
    }
    words.forEach(w => {
      w.clue = maskDef(w.term.d, w.term) + (w.nWords > 1 ? ` (${w.nWords} words)` : '') ;
      w.label = `${w.num} ${w.dir === 'A' ? 'Across' : 'Down'}`;
    });
    const order = words.filter(w => w.dir === 'A').sort((a, b) => a.num - b.num).concat(words.filter(w => w.dir === 'D').sort((a, b) => a.num - b.num));

    let sel = order[0].cells[0], dir = order[0].dir;
    let reveals = 0, wrongChecks = 0, solved = 0, finished = false;
    const t0 = Date.now();

    /* ---- DOM ---- */
    const hudTime = h('b', null, '0:00'), hudWords = h('b', null, `0/${words.length}`), hudRev = h('b', null, '0');
    const hud = h('div', { class: 'arc-hud' }, h('span', null, 'Time ', hudTime), h('span', null, 'Words ', hudWords), h('span', null, 'Reveals ', hudRev));
    const board = h('div', { class: 'cw-board', tabindex: '0', role: 'grid', 'aria-label': 'Crossword grid. Type letters to fill squares. Arrow keys move, Space switches direction, Enter goes to the next clue.' });
    board.style.setProperty('--cols', C);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const cell = grid[r][c];
      if (!cell) { board.append(h('div', { class: 'cw-block', 'aria-hidden': 'true' })); continue; }
      cell.ch = h('span', { class: 'cw-ch' });
      cell.el = h('div', { class: 'cw-cell', role: 'gridcell', 'data-r': r, 'data-c': c }, cell.num ? h('span', { class: 'cw-num' }, cell.num) : null, cell.ch);
      board.append(cell.el);
    }
    const checkBtn = h('button', { type: 'button', class: 'cw-btn' }, 'Check word');
    const revLBtn = h('button', { type: 'button', class: 'cw-btn' }, 'Reveal letter');
    const revWBtn = h('button', { type: 'button', class: 'cw-btn' }, 'Reveal word');
    const actions = h('div', { class: 'cw-actions' }, checkBtn, revLBtn, revWBtn);
    const main = h('div', { class: 'cw-main' }, board, actions);

    const clueTxt = h('div', { class: 'cw-cluetxt', 'aria-live': 'polite' });
    const prevBtn = h('button', { type: 'button', 'aria-label': 'Previous clue' }, '‹');
    const nextBtn = h('button', { type: 'button', 'aria-label': 'Next clue' }, '›');
    const clueBar = h('div', { class: 'cw-cluebar' }, prevBtn, clueTxt, nextBtn);
    const mkKey = (k, label, cls, aria) => h('button', { type: 'button', class: 'cw-key' + (cls ? ' ' + cls : ''), 'data-k': k, 'aria-label': aria || k }, label || k);
    const kb = h('div', { class: 'cw-kb', role: 'group', 'aria-label': 'On-screen keyboard' },
      h('div', { class: 'cw-kr' }, [...'QWERTYUIOP'].map(k => mkKey(k))),
      h('div', { class: 'cw-kr' }, h('span', { class: 'cw-half' }), [...'ASDFGHJKL'].map(k => mkKey(k)), h('span', { class: 'cw-half' })),
      h('div', { class: 'cw-kr' }, mkKey('TOGGLE', '⇄', 'cw-s-wide', 'Switch Across or Down'), [...'ZXCVBNM'].map(k => mkKey(k)), mkKey('BACK', '⌫', 'cw-s-wide', 'Delete letter')));
    const dock = h('div', { class: 'cw-dock' }, clueBar, kb);

    const clueBtns = new Map();
    const mkList = (d, title) => h('div', { class: 'cw-list' }, h('h3', null, title),
      h('ol', null, order.filter(w => w.dir === d).map(w => {
        const b = h('button', { type: 'button', 'aria-label': `${w.label}: ${w.clue}` }, h('span', { class: 'cw-s-n' }, w.num), h('span', { class: 'cw-s-t' }, w.clue));
        b.addEventListener('click', () => { selectWord(w); try { board.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ } });
        clueBtns.set(w, b);
        return h('li', null, b);
      })));
    const side = h('div', { class: 'cw-side' }, mkList('A', 'Across'), mkList('D', 'Down'));
    const layout = h('div', { class: 'cw-layout' }, main, dock, side);
    const root = h('div', { class: 'cw-root' + (RM ? ' cw-s-rm' : '') }, hud, layout);
    el.append(root);

    /* ---- selection & painting ---- */
    const wordOf = (cell, d) => cell[d] >= 0 ? words[cell[d]] : null;
    const activeWord = () => wordOf(sel, dir) || wordOf(sel, dir === 'A' ? 'D' : 'A');
    function paint() {
      const w = activeWord();
      if (w && w.dir !== dir) dir = w.dir;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const cell = grid[r][c]; if (!cell) continue;
        cell.el.classList.toggle('cw-s-hl', !!w && w.cells.includes(cell));
        cell.el.classList.toggle('cw-s-cur', cell === sel);
      }
      clueTxt.innerHTML = '';
      clueTxt.append(h('b', null, w.label.toUpperCase()), w.clue);
      clueBtns.forEach((b, cw) => { b.classList.toggle('cw-s-on', cw === w); b.classList.toggle('cw-s-done', cw.locked); });
      const on = clueBtns.get(w);
      if (on && window.matchMedia('(min-width: 900px)').matches) { const sb = side; const top = on.offsetTop - sb.offsetTop; if (top < sb.scrollTop || top > sb.scrollTop + sb.clientHeight - 60) sb.scrollTop = top - 40; }
      sel.el.setAttribute('aria-label', `${w.label}, letter ${w.cells.indexOf(sel) + 1} of ${w.ans.length}${sel.val ? ', ' + sel.val : ', empty'}`);
      keepVisible();
    }
    function keepVisible() {
      // on phones the clue bar + keyboard dock is pinned to the bottom; keep the active square above it
      if (dock.hidden || getComputedStyle(dock).position !== 'sticky') return;
      const cr = sel.el.getBoundingClientRect(), dr = dock.getBoundingClientRect();
      if (cr.bottom > dr.top - 6 && dr.top < innerHeight) window.scrollBy(0, cr.bottom - dr.top + 14);
      else if (cr.top < 64) window.scrollBy(0, cr.top - 76);
    }
    function setCellVal(cell, v) {
      cell.val = v; cell.ch.textContent = v;
      cell.el.classList.remove('cw-s-bad');
      if (v && !RM) { cell.el.classList.remove('cw-s-pop'); void cell.el.offsetWidth; cell.el.classList.add('cw-s-pop'); }
    }
    function selectWord(w, preferEmpty = true) {
      dir = w.dir;
      sel = (preferEmpty && w.cells.find(c => !c.val && !c.locked)) || w.cells.find(c => !c.locked) || w.cells[0];
      sfx.tap(); paint();
    }
    function nextWord(step = 1) {
      const w = activeWord();
      let i = order.indexOf(w);
      for (let k = 0; k < order.length; k++) {
        i = (i + step + order.length) % order.length;
        if (!order[i].locked) return selectWord(order[i]);
      }
    }
    function tapCell(cell) {
      if (cell === sel) {
        const other = dir === 'A' ? 'D' : 'A';
        if (cell[other] >= 0) dir = other;
      } else {
        sel = cell;
        if (cell[dir] < 0) dir = dir === 'A' ? 'D' : 'A';
      }
      sfx.tap(); paint();
    }
    function advance() {
      // step to the very next square (typing a whole word over crossings stays aligned)
      const w = activeWord();
      if (w.locked) return nextWord(1);
      const i = w.cells.indexOf(sel);
      if (i < w.cells.length - 1) sel = w.cells[i + 1];
      else { const e = w.cells.find(c => !c.val && !c.locked); if (e) sel = e; }
      paint();
    }
    function typeLetter(L) {
      if (finished) return;
      if (!sel.locked) { setCellVal(sel, L); sfx.tone(560 + (L.charCodeAt(0) - 65) * 9, 0.04, 'square', 0.03); }
      checkWordsAt(sel);
      if (!finished) advance();
    }
    function backspace() {
      if (finished) return;
      const w = activeWord(), i = w.cells.indexOf(sel);
      if (sel.val && !sel.locked) { setCellVal(sel, ''); paint(); return; }
      for (let k = i - 1; k >= 0; k--) {
        const c = w.cells[k];
        if (!c.locked) { sel = c; setCellVal(c, ''); break; }
      }
      paint();
    }
    function move(dr, dc) {
      const want = dr ? 'D' : 'A';
      if (dir !== want && sel[want] >= 0) { dir = want; paint(); return; }
      let r = sel.r + dr, c = sel.c + dc;
      while (r >= 0 && r < R && c >= 0 && c < C) {
        if (grid[r][c]) { sel = grid[r][c]; if (sel[dir] < 0) dir = dir === 'A' ? 'D' : 'A'; paint(); return; }
        r += dr; c += dc;
      }
    }

    /* ---- checking & solving ---- */
    function checkWordsAt(cell) {
      let any = false;
      ['A', 'D'].forEach(d => {
        const w = wordOf(cell, d);
        if (w && !w.locked && w.cells.every(c => c.val === c.sol)) { lockWord(w); any = true; }
      });
      return any;
    }
    function lockWord(w) {
      w.locked = true; solved++;
      hudWords.textContent = `${solved}/${words.length}`;
      w.cells.forEach((c, i) => {
        c.locked = true; c.el.classList.add('cw-s-lock'); c.el.classList.remove('cw-s-bad');
        if (!RM) later(() => { c.el.classList.remove('cw-s-win'); void c.el.offsetWidth; c.el.classList.add('cw-s-win'); }, i * 45);
      });
      ctx.record(w.term, !w.revealed);
      sfx.good();
      if (!RM) {
        const r = w.cells[w.cells.length - 1].el.getBoundingClientRect();
        const p = h('div', { class: 'cw-pop', style: { left: (r.left + r.width / 2) + 'px', top: (r.top - 8) + 'px' } }, w.revealed ? '+30' : '+100');
        document.body.append(p); later(() => p.remove(), 1000);
      }
      if (solved === words.length) complete();
    }
    function checkWord() {
      const w = activeWord(); if (!w || w.locked || finished) return;
      let wrong = 0, empty = 0;
      w.cells.forEach(c => { if (c.locked) return; if (!c.val) empty++; else if (c.val !== c.sol) { wrong++; c.el.classList.add('cw-s-bad'); } });
      if (wrong) { wrongChecks++; sfx.bad(); ctx.toast(`${wrong} letter${wrong > 1 ? 's are' : ' is'} off. Try again.`, 1600); }
      else { sfx.blip(); ctx.toast(empty ? 'So far, so good.' : 'Looks right!', 1400); }
    }
    function revealLetter() {
      const w = activeWord(); if (!w || w.locked || finished) return;
      const target = (!sel.locked && sel.val !== sel.sol && w.cells.includes(sel)) ? sel : w.cells.find(c => !c.locked && c.val !== c.sol);
      if (!target) return;
      reveals++; hudRev.textContent = reveals; w.revealed = true;
      setCellVal(target, target.sol); target.el.classList.add('cw-s-rev');
      sel = target; sfx.flip();
      if (!checkWordsAt(target)) advance(); else if (!finished) nextWord(1);
    }
    function revealWord() {
      const w = activeWord(); if (!w || w.locked || finished) return;
      w.revealed = true;
      w.cells.forEach(c => { if (!c.locked && c.val !== c.sol) { reveals++; setCellVal(c, c.sol); c.el.classList.add('cw-s-rev'); } });
      hudRev.textContent = reveals; sfx.flip();
      w.cells.forEach(c => checkWordsAt(c));
      if (!finished) nextWord(1);
    }
    const secs = () => Math.round((Date.now() - t0) / 1000);
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const tick = setInterval(() => { if (!finished && !dead) hudTime.textContent = fmt(secs()); }, 1000);

    function complete() {
      finished = true;
      const s = secs(); hudTime.textContent = fmt(s);
      const clean = words.filter(w => !w.revealed).length;
      const timeBonus = Math.max(0, 360 - s);
      const score = Math.max(0, clean * 100 + (words.length - clean) * 30 + timeBonus - wrongChecks * 5);
      paint();
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c]) grid[r][c].el.classList.remove('cw-s-cur', 'cw-s-hl');
      sfx.level();
      if (!RM) { const b = board.getBoundingClientRect(); ctx.confetti(b.left + b.width / 2, b.top + b.height / 2, 90); }
      const seeBtn = h('button', { type: 'button', class: 'cw-btn cw-s-primary' }, 'See results');
      seeBtn.addEventListener('click', () => ctx.finish({
        score, correct: clean, total: words.length, won: true,
        note: `Solved in ${fmt(s)} with ${reveals} reveal${reveals === 1 ? '' : 's'}. Time bonus +${timeBonus}.`
      }));
      actions.replaceWith(h('div', { class: 'cw-done', role: 'status' }, h('b', null, 'Puzzle solved!'),
        h('span', null, `${fmt(s)} · ${clean} of ${words.length} words with no reveals`), seeBtn));
      dock.hidden = true;
      later(() => { try { seeBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 40);
    }

    /* ---- events ---- */
    const onMouseDown = e => { if (e.target.closest('button')) e.preventDefault(); };
    root.addEventListener('mousedown', onMouseDown);
    board.addEventListener('click', e => {
      const d = e.target.closest('.cw-cell'); if (!d || finished) return;
      tapCell(grid[+d.dataset.r][+d.dataset.c]);
    });
    kb.addEventListener('click', e => {
      const b = e.target.closest('.cw-key'); if (!b || finished) return;
      const k = b.dataset.k;
      if (k === 'BACK') backspace();
      else if (k === 'TOGGLE') tapCell(sel);
      else typeLetter(k);
    });
    prevBtn.addEventListener('click', () => nextWord(-1));
    nextBtn.addEventListener('click', () => nextWord(1));
    checkBtn.addEventListener('click', checkWord);
    revLBtn.addEventListener('click', revealLetter);
    revWBtn.addEventListener('click', revealWord);

    const onKey = e => {
      if (dead || finished || !ctx.isActive() || typingElsewhere(e)) return;
      const onBtn = e.target && e.target.tagName === 'BUTTON';
      const k = e.key;
      if (/^[a-zA-Z]$/.test(k)) { e.preventDefault(); typeLetter(k.toUpperCase()); return; }
      if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); backspace(); return; }
      const arrows = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (arrows[k]) { e.preventDefault(); move(...arrows[k]); return; }
      if (onBtn) return;
      if (k === ' ') { e.preventDefault(); tapCell(sel); return; }
      if (k === 'Enter') { e.preventDefault(); nextWord(e.shiftKey ? -1 : 1); }
    };
    window.addEventListener('keydown', onKey);

    root._ml = { words: () => words.map(w => ({ ans: w.ans, r: w.r, c: w.c, dir: w.dir })) };
    paint();

    return () => {
      dead = true;
      clearInterval(tick);
      timers.forEach(clearTimeout); timers.clear();
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('mousedown', onMouseDown);
      document.querySelectorAll('.cw-pop').forEach(p => p.remove());
    };
  }
});
})();
