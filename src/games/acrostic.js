/* Acrostic Decoder — solve the rows; their first letters spell a hidden Unit 1 word (2 puzzles per round). */
(function () {
'use strict';
const ID = 'acrostic';
const PER_ROUND = 2, MAX_LEN = 12;
const HIDDEN = ['NEURON', 'SLEEP', 'BRAIN', 'SENSE', 'AXON', 'NERVE', 'CORTEX', 'DREAM', 'GENES', 'TASTE', 'LOBES', 'CONES',
  'RODS', 'PONS', 'MIND', 'PAIN', 'HEAR', 'SMELL', 'TOUCH', 'RETINA', 'SYNAPSE', 'LENS', 'IRIS', 'GLIA', 'REFLEX', 'MOODS', 'SPINE'];
const recent = [];

const CSS = `
.ac-root { display: flex; flex-direction: column; gap: 10px; max-width: 680px; margin: 0 auto; }
.ac-banner { background: var(--arc-panel); border: 1px solid var(--arc-line); border-radius: 14px; padding: 10px 12px 12px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; justify-items: center; }
.ac-banner .ac-s-lbl { font-family: var(--f-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--arc-gold); }
.ac-hidden { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.ac-hl { width: 44px; height: 50px; border-radius: 9px; border: 2px dashed #3A4B78; display: grid; place-items: center; font-family: var(--f-display); font-size: 28px; color: var(--arc-gold); line-height: 1; }
.ac-hl.ac-s-on { border: 2px solid var(--arc-gold); background: rgba(255,209,102,.12); animation: ac-drop .45s cubic-bezier(.2,.9,.3,1.4) both; }
.ac-hl.ac-s-all { background: var(--arc-gold); color: #0B1222; }
.ac-bonus { display: flex; gap: 8px; width: 100%; max-width: 420px; }
.ac-bonus input { flex: 1; min-width: 0; font: inherit; font-family: var(--f-mono); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; padding: 9px 12px; border-radius: 10px; border: 1.5px solid var(--arc-line); background: #0E1730; color: var(--arc-ink); }
.ac-bonus input::placeholder { text-transform: none; letter-spacing: 0; font-family: var(--f-body); font-weight: 400; color: var(--arc-dim); }
.ac-bonus input:focus { outline: 2px solid var(--arc-blue); outline-offset: 1px; }
.ac-bonus.ac-s-shake { animation: ac-shake .42s; }
.ac-rows { display: grid; gap: 8px; --box: min(38px, calc((100cqi - 24px - (var(--n) - 1) * 4px) / var(--n))); container-type: inline-size; }
.ac-row { border: 1.5px solid var(--arc-line); border-radius: 12px; padding: 8px 10px 10px; background: rgba(255,255,255,.02); display: grid; gap: 7px; cursor: pointer; text-align: left; transition: border-color .15s, background .15s; }
.ac-row.ac-s-on { border-color: var(--arc-blue); background: #15224A; box-shadow: 0 0 0 3px rgba(124,192,238,.15); }
.ac-row.ac-s-solved { border-color: rgba(53,227,167,.45); }
.ac-row.ac-s-failed { border-color: rgba(255,107,129,.45); }
.ac-row.ac-s-shake { animation: ac-shake .42s; }
.ac-clue { font-size: 16px; line-height: 1.35; color: var(--arc-ink); display: flex; gap: 8px; }
.ac-clue .ac-s-k { font-family: var(--f-mono); font-weight: 700; color: var(--arc-gold); flex: none; }
.ac-row.ac-s-solved .ac-clue, .ac-row.ac-s-failed .ac-clue { color: var(--arc-dim); }
.ac-boxes { display: flex; gap: 4px; }
.ac-box { width: var(--box); height: var(--box); flex: none; border-radius: 6px; background: #E8F0FF; color: #0B1222; display: grid; place-items: center; font-weight: 700; font-size: calc(var(--box) * .56); line-height: 1; position: relative; user-select: none; -webkit-user-select: none; }
.ac-box.ac-s-first { background: #FFE7A8; box-shadow: inset 0 0 0 2px var(--arc-gold); }
.ac-box.ac-s-cur { box-shadow: inset 0 0 0 3px var(--arc-spark); }
.ac-box.ac-s-hint { color: #2F7FB8; }
.ac-box.ac-s-bad { color: #D3263F; background: #FFD6DC; }
.ac-box.ac-s-pop { animation: ac-pop .15s ease; }
.ac-row.ac-s-solved .ac-box { background: #BFF5DF; color: #0B6B49; }
.ac-row.ac-s-solved .ac-box.ac-s-first { background: var(--arc-mint); color: #0B1222; box-shadow: none; }
.ac-row.ac-s-failed .ac-box { background: #2A3557; color: #FFB3BF; }
.ac-row.ac-s-failed .ac-box.ac-s-first { background: #FFD166; color: #0B1222; }
.ac-row.ac-s-solved .ac-box.ac-s-win { animation: ac-win .45s ease both; }
.ac-tools { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ac-btn { border: 1.5px solid var(--arc-line); background: var(--arc-panel); color: var(--arc-ink); border-radius: 99px; padding: 8px 14px; font-weight: 700; font-size: 15px; cursor: pointer; min-height: 42px; }
.ac-btn:hover:not([disabled]) { border-color: var(--arc-blue); }
.ac-btn[disabled] { opacity: .4; cursor: not-allowed; }
.ac-btn.ac-s-primary { background: var(--arc-blue); border-color: var(--arc-blue); color: #0B1222; }
.ac-btn.ac-s-gold { border-color: var(--arc-gold); color: var(--arc-gold); background: transparent; }
.ac-msg { text-align: center; min-height: 24px; font-family: var(--f-mono); font-size: 14px; color: var(--arc-gold); }
.ac-msg.ac-s-good { color: var(--arc-mint); }
.ac-dock { position: sticky; bottom: 0; z-index: 2; background: var(--arc-bg); padding: 6px 0 4px; display: grid; gap: 8px; }
.ac-kb { display: grid; gap: 5px; max-width: 520px; width: 100%; margin: 0 auto; user-select: none; -webkit-user-select: none; }
.ac-kr { display: flex; gap: 5px; justify-content: center; }
.ac-key { flex: 1 1 0; min-width: 0; max-width: 46px; height: 46px; border: 0; border-radius: 8px; padding: 0; background: #2C3C66; color: var(--arc-ink); font-weight: 700; font-size: 16px; cursor: pointer; touch-action: manipulation; }
.ac-key:active { transform: scale(.94); background: #3A4D80; }
.ac-key.ac-s-wide { max-width: 70px; flex-grow: 1.6; font-size: 13px; }
.ac-half { flex: .5 1 0; max-width: 22px; }
.ac-pop { position: fixed; z-index: 30; pointer-events: none; font-family: var(--f-display); font-size: 22px; color: var(--arc-gold); text-shadow: 0 2px 10px rgba(0,0,0,.5); animation: ac-float 1s ease-out forwards; }
@keyframes ac-drop { from { transform: translateY(-16px) scale(.6); opacity: 0; } }
@keyframes ac-shake { 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
@keyframes ac-pop { 50% { transform: scale(1.18); } }
@keyframes ac-win { 40% { transform: translateY(-6px) scale(1.08); } }
@keyframes ac-float { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -44px); } }
.ac-root.ac-s-rm * { animation: none !important; }
@media (max-width: 920px) { .ac-dock { bottom: calc(66px + env(safe-area-inset-bottom, 0px)); } }
@media (max-width: 480px) { .ac-hl { width: 36px; height: 42px; font-size: 22px; } .ac-clue { font-size: 15px; } }
@media (max-width: 380px) { .ac-key { height: 44px; font-size: 15px; } .ac-kr { gap: 4px; } }
`;
function injectCSS() {
  if (document.getElementById('css-' + ID)) return;
  const s = document.createElement('style'); s.id = 'css-' + ID; s.textContent = CSS; document.head.append(s);
}

/* ---------- helpers ---------- */
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
function typingElsewhere(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  if (document.querySelector('.modal-back')) return true;
  const t = e.target;
  if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) return true;
  return false;
}
function findTerm(ans, all) {
  return all.find(t => lettersOf(t.t) === ans) || all.find(t => lettersOf(t.s || '') === ans) || all.find(t => (wordsOf(t.t)[0] || '').toUpperCase().replace(/[^A-Z]/g, '') === ans) || null;
}
function rowFromTerm(t) {
  const n = wordsOf(t.t).length;
  return { a: lettersOf(t.t), clue: maskDef(t.d, t) + (n > 1 ? ` (${n} words)` : ''), term: t };
}
function generate(terms, allTerms, util) {
  const ok = t => { const a = lettersOf(t.t); return a.length >= 3 && a.length <= MAX_LEN; };
  const topic = terms.filter(ok), all = allTerms.filter(ok);
  const coverage = (word, pool) => {
    const used = new Set(); let n = 0;
    for (const L of word) { const c = pool.find(t => !used.has(t.id) && lettersOf(t.t)[0] === L); if (c) { used.add(c.id); n++; } }
    return n;
  };
  const fresh = HIDDEN.filter(w => !recent.includes('gen:' + w));
  const scored = util.shuffle(fresh.length >= 4 ? fresh : HIDDEN)
    .filter(w => coverage(w, all) === w.length)
    .map(w => ({ w, cov: coverage(w, topic) / w.length + Math.random() * 0.15 }))
    .sort((a, b) => b.cov - a.cov);
  if (!scored.length) return null;
  const word = scored[0].w;
  const used = new Set(), rows = [];
  for (const L of word) {
    const giveaway = t => { const a = lettersOf(t.t); return a.includes(word) || word.includes(a); };
    const pick = list => util.shuffle(list.filter(t => !used.has(t.id) && lettersOf(t.t)[0] === L && !giveaway(t)))[0];
    const t = pick(topic) || pick(all);
    if (!t) return null;
    used.add(t.id); rows.push(rowFromTerm(t));
  }
  return { word, title: 'Hidden word', generated: true, key: 'gen:' + word, rows };
}

ML.registerGame({
  id: ID, title: 'Acrostic Decoder', kind: 'word',
  blurb: 'Solve each clue. The first letters of your answers spell a hidden Unit 1 word.',
  how: [
    'Tap a row, then type the answer. It checks itself when the row is full.',
    'The gold first-letter column spells the hidden word at the top.',
    'Guess the hidden word early for bonus points.',
    'Hints reveal one letter but lower that row’s points.'
  ],
  art: `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="250" height="112" style="fill:#0B1222"/>
    ${['BROCAS', 'REFLEX', 'AXON', 'INSOMNIA', 'NERVE'].map((w, r) => [...w].map((ch, i) => {
      const x = 62 + i * 17, y = 6 + r * 20, first = i === 0;
      return `<rect x="${x}" y="${y}" width="15" height="17" rx="3" style="fill:${first ? '#FFD166' : r < 3 ? '#BFF5DF' : '#E8F0FF'}"/>` +
        (r < 3 ? `<text x="${x + 7.5}" y="${y + 13}" text-anchor="middle" style="fill:#0B1222;font-family:'Atkinson Hyperlegible',sans-serif;font-weight:700;font-size:11px">${ch}</text>` : '');
    }).join('')).join('')}
    <path d="M54 6 v96" style="stroke:#FFD166;stroke-width:2;stroke-dasharray:3 4"/>
    <g style="font-family:Bungee,Impact,sans-serif;font-size:13px">${[...'BRAIN'].map((c, i) => `<text x="22" y="${19 + i * 20}" text-anchor="middle" style="fill:${i < 3 ? '#FFD166' : '#3A4B78'}">${i < 3 ? c : '?'}</text>`).join('')}</g>
  </svg>`,

  mount(el, ctx) {
    injectCSS();
    const { h, sfx, util } = ctx;
    const RM = ctx.reduceMotion;
    let dead = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };

    /* ---- choose puzzles ---- */
    const valid = p => p && p.word && Array.isArray(p.rows) && p.rows.length === p.word.length &&
      p.rows.every((r, i) => r && typeof r.a === 'string' && r.a.toUpperCase().replace(/[^A-Z]/g, '')[0] === p.word.toUpperCase()[i]);
    const all = (ctx.data.acrostics || []).filter(valid);
    const topics = ctx.topics || [];
    const matching = topics.length ? all.filter(p => !p.topics || !p.topics.length || p.topics.some(t => topics.includes(t))) : all.slice();
    const sh = util.shuffle(matching);
    const ordered = sh.filter(p => !recent.includes(p.word + '|' + p.title)).concat(sh.filter(p => recent.includes(p.word + '|' + p.title)));
    const puzzles = ordered.slice(0, PER_ROUND).map(p => ({
      word: p.word.toUpperCase(), title: p.title || 'Hidden word', key: p.word + '|' + p.title,
      rows: p.rows.map(r => {
        const a = r.a.toUpperCase().replace(/[^A-Z]/g, '');
        return { a, clue: r.clue, term: findTerm(a, ctx.allTerms) };
      })
    }));
    for (let guard = 0; puzzles.length < PER_ROUND && guard < 4; guard++) {
      const g = generate(ctx.terms, ctx.allTerms, util);
      if (g && !puzzles.some(p => p.word === g.word)) puzzles.push(g);
    }
    puzzles.forEach(p => { recent.push(p.key); if (recent.length > 12) recent.shift(); });

    let pi = 0, score = 0, rowsRight = 0, rowsTotal = 0;
    let P, rows, active, cursor, over, bonusUsed, bonusMiss;

    /* ---- DOM ---- */
    const hudP = h('b'), hudRows = h('b'), hudScore = h('b', null, '0');
    const hud = h('div', { class: 'arc-hud' }, h('span', null, 'Puzzle ', hudP), h('span', null, 'Rows ', hudRows), h('span', null, 'Score ', hudScore));
    const hiddenBoxes = h('div', { class: 'ac-hidden', 'aria-live': 'polite' });
    const bonusIn = h('input', { type: 'text', placeholder: 'Know the hidden word? Guess it', 'aria-label': 'Guess the hidden word early for bonus points', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', maxlength: '14' });
    const bonusBtn = h('button', { type: 'button', class: 'ac-btn ac-s-gold' }, 'Guess');
    const bonus = h('div', { class: 'ac-bonus' }, bonusIn, bonusBtn);
    const bannerLbl = h('div', { class: 'ac-s-lbl' }, 'Hidden word');
    const banner = h('div', { class: 'ac-banner' }, bannerLbl, hiddenBoxes, bonus);
    const rowsEl = h('div', { class: 'ac-rows', role: 'list' });
    const msg = h('div', { class: 'ac-msg', role: 'status', 'aria-live': 'polite' });
    const checkBtn = h('button', { type: 'button', class: 'ac-btn' }, 'Check row');
    const hintBtn = h('button', { type: 'button', class: 'ac-btn' }, 'Hint (letter)');
    const revealBtn = h('button', { type: 'button', class: 'ac-btn' }, 'Reveal row');
    const nextBtn = h('button', { type: 'button', class: 'ac-btn ac-s-primary', hidden: true }, 'Next puzzle →');
    const tools = h('div', { class: 'ac-tools' }, checkBtn, hintBtn, revealBtn, nextBtn);
    const mkKey = (k, label, cls, aria) => h('button', { type: 'button', class: 'ac-key' + (cls ? ' ' + cls : ''), 'data-k': k, 'aria-label': aria || k }, label || k);
    const kb = h('div', { class: 'ac-kb', role: 'group', 'aria-label': 'On-screen keyboard' },
      h('div', { class: 'ac-kr' }, [...'QWERTYUIOP'].map(k => mkKey(k))),
      h('div', { class: 'ac-kr' }, h('span', { class: 'ac-half' }), [...'ASDFGHJKL'].map(k => mkKey(k)), h('span', { class: 'ac-half' })),
      h('div', { class: 'ac-kr' }, mkKey('ENTER', 'CHECK', 'ac-s-wide', 'Check row'), [...'ZXCVBNM'].map(k => mkKey(k)), mkKey('BACK', '⌫', 'ac-s-wide', 'Delete letter')));
    const dock = h('div', { class: 'ac-dock' }, kb);
    const root = h('div', { class: 'ac-root' + (RM ? ' ac-s-rm' : '') }, hud, banner, rowsEl, msg, tools, dock);
    el.append(root);

    function say(t, good) { msg.textContent = t; msg.className = 'ac-msg' + (good ? ' ac-s-good' : ''); }
    function popAt(text, anchor) {
      if (RM || !anchor) return;
      const r = anchor.getBoundingClientRect();
      const p = h('div', { class: 'ac-pop', style: { left: (r.left + r.width / 2) + 'px', top: (r.top - 6) + 'px' } }, text);
      document.body.append(p); later(() => p.remove(), 1000);
    }

    function startPuzzle() {
      P = puzzles[pi]; over = false; bonusUsed = false; bonusMiss = 0;
      hudP.textContent = `${pi + 1}/${puzzles.length}`;
      bannerLbl.textContent = `Hidden word · ${P.word.length} letters`;
      hiddenBoxes.innerHTML = '';
      [...P.word].forEach(() => hiddenBoxes.append(h('div', { class: 'ac-hl' }, '')));
      bonus.hidden = false; bonusIn.value = ''; bonusIn.disabled = false; bonusBtn.disabled = false;
      const n = Math.max(...P.rows.map(r => r.a.length));
      rowsEl.style.setProperty('--n', Math.max(n, 7));
      rowsEl.innerHTML = '';
      rows = P.rows.map((R, ri) => {
        const boxes = [...R.a].map((_, i) => h('div', { class: 'ac-box' + (i === 0 ? ' ac-s-first' : ''), 'data-i': i }));
        const elR = h('div', { class: 'ac-row', role: 'listitem', 'data-r': ri },
          h('div', { class: 'ac-clue' }, h('span', { class: 'ac-s-k' }, `${P.word[ri]}`), h('span', null, R.clue, h('span', { class: 'sr-only' }, `, ${R.a.length} letters`))),
          h('div', { class: 'ac-boxes', 'aria-hidden': 'true' }, boxes));
        rowsEl.append(elR);
        return { R, el: elR, boxes, vals: Array(R.a.length).fill(''), hinted: Array(R.a.length).fill(false), done: false, failed: false, hints: 0, misses: 0 };
      });
      hudRows.textContent = `0/${rows.length}`;
      nextBtn.hidden = true; checkBtn.hidden = hintBtn.hidden = revealBtn.hidden = false; dock.hidden = false;
      say('');
      activate(0, null, false);
    }

    function paint() {
      rows.forEach((row, ri) => {
        row.el.classList.toggle('ac-s-on', ri === active && !over);
        row.boxes.forEach((b, i) => {
          b.textContent = row.vals[i];
          b.classList.toggle('ac-s-cur', ri === active && i === cursor && !row.done && !over);
          b.classList.toggle('ac-s-hint', row.hinted[i]);
        });
      });
    }
    function keepVisible() {
      const row = rows[active]; if (!row || dock.hidden || getComputedStyle(dock).position !== 'sticky') return;
      const rr = row.el.getBoundingClientRect(), dr = dock.getBoundingClientRect();
      if (rr.bottom > dr.top - 6 && dr.top < innerHeight) window.scrollBy(0, rr.bottom - dr.top + 14);
      else if (rr.top < 64) window.scrollBy(0, rr.top - 76);
    }
    function activate(ri, at, sound = true) {
      if (ri == null || ri < 0 || !rows[ri]) return;
      active = ri;
      const row = rows[ri];
      if (at != null) cursor = at;
      else { const e = row.vals.findIndex((v, i) => !v || row.hinted[i]); cursor = e < 0 ? row.vals.length - 1 : e; }
      if (sound) sfx.tap();
      paint(); keepVisible();
    }
    function nextOpen(from) {
      for (let k = 1; k <= rows.length; k++) { const j = (from + k) % rows.length; if (!rows[j].done) return j; }
      return -1;
    }

    function typeLetter(L) {
      if (over) return;
      const row = rows[active]; if (!row || row.done) return;
      const len = row.vals.length;
      if (cursor >= len) cursor = len - 1;
      const wasFull = row.vals.every(v => v);
      if (row.hinted[cursor]) {
        // typing the hinted letter just steps past it; anything else goes in the next open box
        if (row.R.a[cursor] === L) { cursor = Math.min(cursor + 1, len - 1); paint(); return; }
        let c = cursor; while (c < len && row.hinted[c]) c++;
        if (c >= len) return;
        cursor = c;
      }
      row.vals[cursor] = L; row.boxes[cursor].classList.remove('ac-s-bad');
      if (!RM) { const b = row.boxes[cursor]; b.classList.remove('ac-s-pop'); void b.offsetWidth; b.classList.add('ac-s-pop'); }
      sfx.tone(560 + (L.charCodeAt(0) - 65) * 9, 0.04, 'square', 0.03);
      cursor = Math.min(cursor + 1, len - 1);
      paint();
      if (row.vals.every(v => v)) {
        if (row.vals.join('') === row.R.a) solveRow(active, false);
        else if (!wasFull) checkRow(true);
      }
    }
    function backspace() {
      if (over) return;
      const row = rows[active]; if (!row || row.done) return;
      if (row.vals[cursor] && !row.hinted[cursor]) { row.vals[cursor] = ''; }
      else {
        let c = cursor - 1; while (c >= 0 && row.hinted[c]) c--;
        if (c >= 0) { cursor = c; row.vals[c] = ''; }
      }
      row.boxes.forEach(b => b.classList.remove('ac-s-bad'));
      paint();
    }
    function checkRow(auto) {
      const row = rows[active]; if (!row || row.done || over) return;
      if (!row.vals.every(v => v)) { if (!auto) { say('Fill every box first.'); sfx.tap(); } return; }
      const guess = row.vals.join('');
      if (guess === row.R.a) return solveRow(active, false);
      row.misses++;
      sfx.bad(); say('Not quite. Red letters are off.');
      row.boxes.forEach((b, i) => b.classList.toggle('ac-s-bad', row.vals[i] !== row.R.a[i]));
      if (!RM) { row.el.classList.remove('ac-s-shake'); void row.el.offsetWidth; row.el.classList.add('ac-s-shake'); }
      const firstBad = row.vals.findIndex((v, i) => v !== row.R.a[i]);
      cursor = firstBad < 0 ? 0 : firstBad; paint();
    }
    function hint() {
      const row = rows[active]; if (!row || row.done || over) return;
      let i = (!row.hinted[cursor] && row.vals[cursor] !== row.R.a[cursor]) ? cursor : row.vals.findIndex((v, k) => v !== row.R.a[k]);
      if (i < 0) return checkRow(false);
      row.vals[i] = row.R.a[i]; row.hinted[i] = true; row.hints++;
      row.boxes[i].classList.remove('ac-s-bad');
      sfx.flip(); say(`Hint used on row ${P.word[active]}.`);
      cursor = Math.min(i + 1, row.vals.length - 1);
      paint();
      if (row.vals.every(v => v)) { if (row.vals.join('') === row.R.a) solveRow(active, false); else checkRow(true); }
    }
    function revealRow() {
      const row = rows[active]; if (!row || row.done || over) return;
      solveRow(active, true);
    }
    function solveRow(ri, gaveUp) {
      const row = rows[ri];
      row.done = true; row.failed = gaveUp;
      row.vals = [...row.R.a];
      row.el.classList.add(gaveUp ? 'ac-s-failed' : 'ac-s-solved');
      rowsTotal++;
      const clean = !gaveUp && row.hints === 0;
      if (!gaveUp) rowsRight++;
      const rec = row.R.term || { id: 'acr:' + row.R.a.toLowerCase(), t: row.R.a.charAt(0) + row.R.a.slice(1).toLowerCase(), d: row.R.clue };
      ctx.record(rec, clean);
      let gain = 0;
      if (!gaveUp) {
        gain = Math.max(20, 100 - row.hints * 25 - row.misses * 10);
        score += gain; hudScore.textContent = score;
        sfx.good(); say(clean ? ['Decoded!', 'Nice!', 'Locked in!', 'Signal received!'][rowsRight % 4] : 'Solved with a hint.', true);
        if (!RM) row.boxes.forEach((b, i) => later(() => b.classList.add('ac-s-win'), i * 40));
        popAt('+' + gain, row.boxes[row.boxes.length - 1]);
      } else { sfx.bad(); say(`The answer was ${row.R.a}.`); }
      paint();
      fillHidden(ri);
      hudRows.textContent = `${rows.filter(r => r.done).length}/${rows.length}`;
      if (rows.every(r => r.done)) return later(endPuzzle, RM ? 0 : 450);
      const nx = nextOpen(ri);
      later(() => activate(nx, null, false), RM ? 0 : 380);
    }
    function fillHidden(ri, all) {
      const box = hiddenBoxes.children[ri]; if (!box || box.classList.contains('ac-s-on')) return;
      box.textContent = P.word[ri]; box.classList.add('ac-s-on');
      if (!all) sfx.tone(660 + ri * 60, 0.12, 'triangle', 0.08, 990);
    }
    function guessHidden() {
      if (over || bonusUsed) return;
      const g = bonusIn.value.toUpperCase().replace(/[^A-Z]/g, '');
      if (!g) { bonusIn.focus(); return; }
      if (g === P.word) {
        bonusUsed = true;
        const open = rows.filter(r => !r.done).length;
        const gain = 30 + open * 40;
        score += gain; hudScore.textContent = score;
        [...P.word].forEach((_, i) => later(() => { fillHidden(i, true); hiddenBoxes.children[i].classList.add('ac-s-all'); }, RM ? 0 : i * 80));
        // free first letters for the rows still open
        rows.forEach(r => { if (!r.done && !r.hinted[0]) { r.vals[0] = r.R.a[0]; r.hinted[0] = true; } });
        bonus.hidden = true;
        sfx.level(); say(`Hidden word cracked! +${gain} bonus. First letters are filled in.`, true);
        popAt('+' + gain, hiddenBoxes);
        if (!RM) { const r = hiddenBoxes.getBoundingClientRect(); ctx.confetti(r.left + r.width / 2, r.top + r.height / 2, 60); }
        const row = rows[active];
        if (row && !row.done) { const e = row.vals.findIndex((v, i) => !v || row.hinted[i]); cursor = e < 0 ? row.vals.length - 1 : e; }
        paint();
        bonusIn.blur();
      } else {
        bonusMiss++;
        score = Math.max(0, score - 10); hudScore.textContent = score;
        sfx.bad();
        if (!RM) { bonus.classList.remove('ac-s-shake'); void bonus.offsetWidth; bonus.classList.add('ac-s-shake'); }
        if (bonusMiss >= 3) { bonusUsed = true; bonusIn.disabled = true; bonusBtn.disabled = true; say('No more early guesses. Solve the rows to reveal it.'); }
        else say(`Not it (−10). ${3 - bonusMiss} guess${3 - bonusMiss === 1 ? '' : 'es'} left.`);
        bonusIn.select();
      }
    }
    function endPuzzle() {
      over = true;
      [...P.word].forEach((_, i) => fillHidden(i, true));
      [...hiddenBoxes.children].forEach((b, i) => later(() => b.classList.add('ac-s-all'), RM ? 0 : i * 70));
      bonus.hidden = true;
      checkBtn.hidden = hintBtn.hidden = revealBtn.hidden = true; dock.hidden = true;
      const cleanRows = rows.filter(r => !r.failed).length;
      say(`${P.word}! You decoded ${cleanRows} of ${rows.length} rows.`, true);
      sfx.level();
      if (!RM) { const r = hiddenBoxes.getBoundingClientRect(); ctx.confetti(r.left + r.width / 2, r.top + r.height / 2, 80); }
      nextBtn.textContent = pi === puzzles.length - 1 ? 'See results' : 'Next puzzle →';
      nextBtn.hidden = false;
      paint();
      later(() => { try { nextBtn.focus({ preventScroll: true }); banner.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ } }, 60);
    }
    function nextPuzzle() {
      pi++;
      if (pi >= puzzles.length) {
        ctx.finish({ score, correct: rowsRight, total: rowsTotal, won: rowsRight >= Math.ceil(rowsTotal / 2),
          note: `You decoded ${rowsRight} of ${rowsTotal} rows across ${puzzles.length} hidden word${puzzles.length > 1 ? 's' : ''}.` });
        return;
      }
      sfx.level(); startPuzzle();
      try { root.scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ }
    }

    /* ---- events ---- */
    const onMouseDown = e => { if (e.target.closest('button')) e.preventDefault(); };
    root.addEventListener('mousedown', onMouseDown);
    rowsEl.addEventListener('click', e => {
      const r = e.target.closest('.ac-row'); if (!r || over) return;
      const ri = +r.dataset.r; if (rows[ri].done) { say('That row is already solved.'); return; }
      const b = e.target.closest('.ac-box');
      if (document.activeElement === bonusIn) bonusIn.blur();
      activate(ri, b ? +b.dataset.i : null);
    });
    kb.addEventListener('click', e => {
      const b = e.target.closest('.ac-key'); if (!b) return;
      const k = b.dataset.k;
      if (k === 'BACK') backspace(); else if (k === 'ENTER') checkRow(false); else typeLetter(k);
    });
    checkBtn.addEventListener('click', () => checkRow(false));
    hintBtn.addEventListener('click', hint);
    revealBtn.addEventListener('click', revealRow);
    nextBtn.addEventListener('click', nextPuzzle);
    bonusBtn.addEventListener('click', guessHidden);
    bonusIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); guessHidden(); } });

    const onKey = e => {
      if (dead || over || !ctx.isActive() || typingElsewhere(e)) return;
      const k = e.key, onBtn = e.target && e.target.tagName === 'BUTTON';
      if (/^[a-zA-Z]$/.test(k)) { e.preventDefault(); typeLetter(k.toUpperCase()); return; }
      if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); backspace(); return; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        e.preventDefault();
        const row = rows[active]; if (!row || row.done) return;
        cursor = Math.max(0, Math.min(row.vals.length - 1, cursor + (k === 'ArrowLeft' ? -1 : 1))); paint(); return;
      }
      if (k === 'ArrowUp' || k === 'ArrowDown') {
        e.preventDefault();
        const step = k === 'ArrowUp' ? -1 : 1;
        for (let j = active + step; j >= 0 && j < rows.length; j += step) if (!rows[j].done) { activate(j); break; }
        return;
      }
      if (k === 'Enter' && !onBtn) { e.preventDefault(); checkRow(false); }
    };
    window.addEventListener('keydown', onKey);

    root._ml = { rows: () => rows.map(r => r.R.a), word: () => P.word };
    if (!puzzles.length) root.append(h('p', null, 'No acrostics are available yet.'));
    else startPuzzle();

    return () => {
      dead = true;
      timers.forEach(clearTimeout); timers.clear();
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('mousedown', onMouseDown);
      document.querySelectorAll('.ac-pop').forEach(p => p.remove());
    };
  }
});
})();
