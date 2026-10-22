/* Neurdle — Wordle-style guessing of single-word Unit 1 terms (3 words per round). */
(function () {
'use strict';
const ID = 'wordle';
const MAX_GUESSES = 6, WORDS_PER_ROUND = 3, CLUE_COST = 25;
const recent = [];   // answers used in recent rounds, so replays feel fresh

const CSS = `
.wd-root { display: flex; flex-direction: column; gap: 10px; max-width: 560px; margin: 0 auto; }
.wd-clue { flex-wrap: wrap; }
.wd-clue .wd-cluetext { flex: 1 1 200px; font-size: 17px; line-height: 1.4; }
.wd-clue .wd-cluetext.wd-s-hidden { color: var(--arc-dim); font-style: italic; }
.wd-cluebtn { flex: none; border: 1px solid var(--arc-gold); background: transparent; color: var(--arc-gold); border-radius: 10px; padding: 7px 11px; font-weight: 700; font-size: 14px; cursor: pointer; }
.wd-cluebtn:hover { background: rgba(255,209,102,.12); }
.wd-msg { min-height: 24px; text-align: center; font-family: var(--f-mono); font-size: 14px; color: var(--arc-gold); }
.wd-board { display: grid; gap: 6px; width: min(100%, calc(var(--n) * 62px)); margin: 0 auto; container-type: inline-size; }
.wd-row { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 6px; }
.wd-row.wd-s-shake { animation: wd-shake .42s; }
.wd-row.wd-s-win .wd-tile { animation: wd-bounce .5s ease both; }
.wd-tile {
  aspect-ratio: 1; border: 2px solid var(--arc-line); border-radius: 8px; display: grid; place-items: center;
  font-family: var(--f-display); color: var(--arc-ink); background: rgba(255,255,255,.02);
  font-size: calc((100cqi - (var(--n) - 1) * 6px) / var(--n) * .5); line-height: 1; user-select: none;
  transition: border-color .12s;
}
.wd-tile.wd-s-filled { border-color: #4A5E92; animation: wd-pop .12s ease; }
.wd-tile.wd-s-flip { animation: wd-flip .46s ease both; }
.wd-tile.correct { background: var(--arc-mint); border-color: var(--arc-mint); color: #0B1222; }
.wd-tile.present { background: var(--arc-gold); border-color: var(--arc-gold); color: #0B1222; }
.wd-tile.absent { background: #2A3557; border-color: #2A3557; color: var(--arc-dim); }
.wd-tile.wd-s-answer { background: transparent; border-color: var(--arc-spark); color: var(--arc-spark); }
.wd-done { display: grid; gap: 10px; background: var(--arc-panel); border: 1px solid var(--arc-line); border-radius: 14px; padding: 14px 16px; text-align: left; }
.wd-done .wd-verdict { font-family: var(--f-display); font-size: 20px; letter-spacing: .02em; }
.wd-done .wd-verdict.wd-s-good { color: var(--arc-mint); }
.wd-done .wd-verdict.wd-s-bad { color: var(--arc-spark); }
.wd-done .wd-term { font-weight: 700; color: var(--arc-blue); font-size: 18px; }
.wd-done p { color: var(--arc-ink); font-size: 17px; line-height: 1.45; }
.wd-next { justify-self: start; background: var(--arc-blue); color: #0B1222; border: 0; border-radius: 12px; padding: 11px 18px; font-weight: 700; font-size: 16px; cursor: pointer; }
.wd-dock { position: sticky; bottom: 0; z-index: 2; background: var(--arc-bg); padding: 8px 0 4px; }
.wd-kb { display: grid; gap: 6px; max-width: 520px; margin: 0 auto; user-select: none; -webkit-user-select: none; }
.wd-kr { display: flex; gap: 5px; justify-content: center; }
.wd-key {
  flex: 1 1 0; min-width: 0; max-width: 46px; height: 52px; border: 0; border-radius: 8px; padding: 0;
  background: #2C3C66; color: var(--arc-ink); font-family: var(--f-body); font-weight: 700; font-size: 17px;
  cursor: pointer; touch-action: manipulation; transition: background .2s, transform .08s;
}
.wd-key:active { transform: scale(.94); }
.wd-key.wd-s-wide { max-width: 74px; flex-grow: 1.6; font-size: 13px; letter-spacing: .03em; }
.wd-key.correct { background: var(--arc-mint); color: #0B1222; }
.wd-key.present { background: var(--arc-gold); color: #0B1222; }
.wd-key.absent { background: #1A2340; color: #5D6E94; }
.wd-half { flex: .5 1 0; max-width: 22px; }
.wd-pop { position: fixed; z-index: 30; pointer-events: none; font-family: var(--f-display); font-size: 26px; color: var(--arc-gold); text-shadow: 0 2px 10px rgba(0,0,0,.5); animation: wd-float 1s ease-out forwards; }
@keyframes wd-pop { 50% { transform: scale(1.1); } }
@keyframes wd-flip { 0% { transform: rotateX(0); } 50% { transform: rotateX(90deg); } 100% { transform: rotateX(0); } }
@keyframes wd-shake { 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(4px); } }
@keyframes wd-bounce { 40% { transform: translateY(-12px); } 70% { transform: translateY(2px); } }
@keyframes wd-float { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -48px); } }
.wd-root.wd-s-rm * { animation: none !important; }
@media (max-width: 920px) { .wd-dock { bottom: calc(66px + env(safe-area-inset-bottom, 0px)); } }
@media (max-width: 380px) { .wd-key { height: 48px; font-size: 15px; } .wd-kr { gap: 4px; } }
`;
function injectCSS() {
  if (document.getElementById('css-' + ID)) return;
  const s = document.createElement('style'); s.id = 'css-' + ID; s.textContent = CSS; document.head.append(s);
}

/* ---------- word helpers ---------- */
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
function answerList(terms) {
  const out = [], seen = new Set();
  for (const t of terms) {
    const ws = wordsOf(t.t);
    if (ws.length !== 1) continue;
    const w = ws[0].toUpperCase().replace(/[^A-Z]/g, '');
    if (w.length < 4 || w.length > 8 || seen.has(w)) continue;
    seen.add(w); out.push({ word: w, term: t });
  }
  return out;
}
function evaluate(guess, ans) {
  const n = ans.length, res = Array(n).fill('absent'), left = {};
  for (let i = 0; i < n; i++) { if (guess[i] === ans[i]) res[i] = 'correct'; else left[ans[i]] = (left[ans[i]] || 0) + 1; }
  for (let i = 0; i < n; i++) if (res[i] !== 'correct' && left[guess[i]] > 0) { res[i] = 'present'; left[guess[i]]--; }
  return res;
}
function typingElsewhere(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  if (document.querySelector('.modal-back')) return true;
  const t = e.target;
  if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) return true;
  return false;
}

ML.registerGame({
  id: ID, title: 'Neurdle', kind: 'word',
  blurb: 'Guess the hidden Unit 1 term in six tries. Colors tell you which letters are close.',
  how: [
    'Type any guess with the right number of letters and press Enter.',
    'Green = right letter, right spot. Gold = in the word, wrong spot. Gray = not in the word.',
    'Stuck? Show the definition clue (it costs 25 points).',
    'Three words per round. Fewer guesses means more points.'
  ],
  art: `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="250" height="112" style="fill:#0B1222"/>
    <g style="font-family:Bungee,Impact,sans-serif;font-size:19px" text-anchor="middle">
      ${['N', 'E', 'U', 'R', 'O', 'N'].map((c, i) => {
        const x = 32 + i * 32, st1 = ['#35E3A7', '#35E3A7', '#FFD166', '#2A3557', '#2A3557', '#2A3557'][i], st2 = '#35E3A7';
        return `<rect x="${x - 13}" y="16" width="27" height="27" rx="5" style="fill:${st1}"/><text x="${x}" y="37" style="fill:${st1 === '#2A3557' ? '#8EA0C4' : '#0B1222'}">${'NERVES'[i]}</text>
        <rect x="${x - 13}" y="49" width="27" height="27" rx="5" style="fill:${st2}"/><text x="${x}" y="70" style="fill:#0B1222">${c}</text>
        <rect x="${x - 13}" y="82" width="27" height="27" rx="5" style="fill:none;stroke:#24325A;stroke-width:2"/>`;
      }).join('')}
    </g>
    <circle cx="228" cy="62" r="5" style="fill:#FF6B81"/><path d="M216 62h-6M240 62h6M228 50v-6M228 74v6" style="stroke:#FF6B81;stroke-width:2.5;stroke-linecap:round"/>
  </svg>`,

  mount(el, ctx) {
    injectCSS();
    const { h, sfx, util } = ctx;
    let dead = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };

    /* ---- pick the round's words ---- */
    // topic words first (fresh ones before recently used), then other Unit 1 words only if needed
    const topicPool = answerList(ctx.terms);
    const have = new Set(topicPool.map(p => p.word));
    const extraPool = answerList(ctx.allTerms).filter(p => !have.has(p.word));
    const order = list => { const sh = util.shuffle(list); return sh.filter(p => !recent.includes(p.word)).concat(sh.filter(p => recent.includes(p.word))); };
    const words = order(topicPool).concat(order(extraPool)).slice(0, WORDS_PER_ROUND);
    words.forEach(w => { recent.push(w.word); if (recent.length > 18) recent.shift(); });

    let wi = 0, score = 0, solvedCount = 0, totalGuesses = 0, cluesUsed = 0;
    let W, n, guesses, cur, done, busy, clueShown, rowEls, keyState;

    /* ---- DOM ---- */
    const hudWord = h('b', null, ''), hudLen = h('b', null, ''), hudScore = h('b', null, '0');
    const hud = h('div', { class: 'arc-hud' }, h('span', null, 'Word ', hudWord), h('span', null, hudLen, ' letters'), h('span', null, 'Score ', hudScore));
    const clueText = h('span', { class: 'wd-cluetext' });
    const clueBtn = h('button', { type: 'button', class: 'wd-cluebtn' }, `Show clue (−${CLUE_COST})`);
    const clue = h('div', { class: 'arc-prompt wd-clue', 'aria-live': 'polite' }, h('span', { class: 'tag' }, 'Clue'), clueText, clueBtn);
    const msg = h('div', { class: 'wd-msg', role: 'status', 'aria-live': 'polite' });
    const board = h('div', { class: 'wd-board', role: 'grid', 'aria-label': 'Guesses' });
    const doneBox = h('div', { class: 'wd-done', hidden: true, 'aria-live': 'polite' });
    const keyEls = {};
    const mkKey = (k, label, cls, aria) => {
      const b = h('button', { type: 'button', class: 'wd-key' + (cls ? ' ' + cls : ''), 'data-k': k, 'aria-label': aria || k }, label || k);
      if (/^[A-Z]$/.test(k)) keyEls[k] = b;
      return b;
    };
    const kb = h('div', { class: 'wd-kb', role: 'group', 'aria-label': 'On-screen keyboard' },
      h('div', { class: 'wd-kr' }, [...'QWERTYUIOP'].map(k => mkKey(k))),
      h('div', { class: 'wd-kr' }, h('span', { class: 'wd-half' }), [...'ASDFGHJKL'].map(k => mkKey(k)), h('span', { class: 'wd-half' })),
      h('div', { class: 'wd-kr' }, mkKey('ENTER', 'ENTER', 'wd-s-wide', 'Enter guess'), [...'ZXCVBNM'].map(k => mkKey(k)), mkKey('BACK', '⌫', 'wd-s-wide', 'Delete letter')));
    const dock = h('div', { class: 'wd-dock' }, kb);
    const root = h('div', { class: 'wd-root' + (ctx.reduceMotion ? ' wd-s-rm' : '') }, hud, clue, msg, board, doneBox, dock);
    el.append(root);

    const onMouseDown = e => { if (e.target.closest('button')) e.preventDefault(); };
    root.addEventListener('mousedown', onMouseDown);
    kb.addEventListener('click', e => {
      const b = e.target.closest('.wd-key'); if (!b) return;
      press(b.dataset.k);
    });
    clueBtn.addEventListener('click', showClue);

    function flash(text) {
      msg.textContent = text;
      later(() => { if (msg.textContent === text) msg.textContent = ''; }, 1800);
    }
    function popScore(text, anchor) {
      if (ctx.reduceMotion) return;
      const r = anchor.getBoundingClientRect();
      const p = h('div', { class: 'wd-pop', style: { left: (r.left + r.width / 2) + 'px', top: (r.top - 10) + 'px' } }, text);
      document.body.append(p); later(() => p.remove(), 1000);
    }

    function startWord() {
      W = words[wi]; n = W.word.length; guesses = []; cur = ''; done = false; busy = false; clueShown = false; keyState = {};
      hudWord.textContent = `${wi + 1}/${words.length}`; hudLen.textContent = n;
      board.style.setProperty('--n', n);
      board.innerHTML = ''; rowEls = [];
      for (let r = 0; r < MAX_GUESSES; r++) {
        const row = h('div', { class: 'wd-row', role: 'row' });
        for (let c = 0; c < n; c++) row.append(h('div', { class: 'wd-tile', role: 'gridcell' }));
        board.append(row); rowEls.push(row);
      }
      Object.values(keyEls).forEach(k => k.classList.remove('correct', 'present', 'absent'));
      clueText.className = 'wd-cluetext wd-s-hidden';
      clueText.textContent = `Topic ${W.term.topic} term, ${n} letters. Want the definition?`;
      clueBtn.hidden = false;
      doneBox.hidden = true; doneBox.innerHTML = '';
      dock.hidden = false; msg.textContent = '';
    }

    function showClue() {
      if (done || clueShown) return;
      clueShown = true; cluesUsed++;
      clueText.className = 'wd-cluetext';
      clueText.textContent = maskDef(W.term.d, W.term);
      clueBtn.hidden = true; sfx.flip();
    }

    function paintRow() {
      const row = rowEls[guesses.length]; if (!row) return;
      [...row.children].forEach((t, i) => {
        const ch = cur[i] || '';
        if (t.textContent !== ch) { t.textContent = ch; t.classList.toggle('wd-s-filled', !!ch); }
      });
    }

    function press(k) {
      if (dead || !ctx.isActive()) return;
      if (done) { if (k === 'ENTER') next(); return; }
      if (busy) return;
      if (k === 'ENTER') return submit();
      if (k === 'BACK') { if (cur.length) { cur = cur.slice(0, -1); paintRow(); } return; }
      if (/^[A-Z]$/.test(k) && cur.length < n) { cur += k; sfx.tap(); paintRow(); }
    }

    function submit() {
      const row = rowEls[guesses.length];
      if (cur.length < n) {
        flash(`Need ${n} letters`); sfx.bad();
        row.classList.remove('wd-s-shake'); void row.offsetWidth; row.classList.add('wd-s-shake');
        return;
      }
      const guess = cur, res = evaluate(guess, W.word);
      guesses.push(guess); cur = ''; busy = true; totalGuesses++;
      const tiles = [...row.children];
      const step = ctx.reduceMotion ? 0 : 230;
      tiles.forEach((t, i) => {
        if (ctx.reduceMotion) { t.classList.add(res[i]); return; }
        later(() => { t.classList.add('wd-s-flip'); sfx.tone(380 + i * 70, 0.06, 'triangle', 0.05); }, i * step);
        later(() => t.classList.add(res[i]), i * step + 230);
      });
      row.setAttribute('aria-label', `${guess}: ` + res.map((r, i) => `${guess[i]} ${r === 'correct' ? 'right spot' : r === 'present' ? 'wrong spot' : 'not in word'}`).join(', '));
      later(() => {
        const rank = { absent: 1, present: 2, correct: 3 };
        res.forEach((r, i) => { const L = guess[i]; if ((rank[r] || 0) > (rank[keyState[L]] || 0)) keyState[L] = r; });
        Object.entries(keyState).forEach(([L, s]) => { const k = keyEls[L]; if (k) { k.classList.remove('correct', 'present', 'absent'); k.classList.add(s); } });
        busy = false;
        if (guess === W.word) win(row);
        else if (guesses.length >= MAX_GUESSES) lose();
        else sfx.blip();
      }, n * step + (step ? 260 : 0));
    }

    function win(row) {
      done = true; solvedCount++;
      const g = guesses.length;
      const gain = Math.max(20, 40 + (MAX_GUESSES + 1 - g) * 20 - (clueShown ? CLUE_COST : 0));
      score += gain; hudScore.textContent = score;
      row.classList.add('wd-s-win'); sfx.good();
      popScore('+' + gain, row);
      if (!ctx.reduceMotion) { const r = row.getBoundingClientRect(); ctx.confetti(r.left + r.width / 2, r.top + r.height / 2, 50); }
      ctx.record(W.term, true);
      later(() => showDone(true), ctx.reduceMotion ? 0 : 650);
    }
    function lose() {
      done = true; sfx.bad();
      ctx.record(W.term, false);
      showDone(false);
    }
    function showDone(ok) {
      clueText.className = 'wd-cluetext'; clueText.textContent = W.term.d; clueBtn.hidden = true;
      dock.hidden = true;
      const last = wi === words.length - 1;
      const nextBtn = h('button', { type: 'button', class: 'wd-next' }, last ? 'See results' : 'Next word →');
      nextBtn.addEventListener('click', next);
      doneBox.innerHTML = '';
      doneBox.append(...[
        h('div', { class: 'wd-verdict ' + (ok ? 'wd-s-good' : 'wd-s-bad') }, ok ? (guesses.length <= 2 ? 'Brilliant!' : guesses.length <= 4 ? 'Nice!' : 'Got it!') : 'Out of guesses'),
        ok ? null : answerRow(),
        h('div', { class: 'wd-term' }, W.term.t),
        h('p', null, W.term.d),
        nextBtn].filter(Boolean));
      doneBox.hidden = false;
      later(() => { try { nextBtn.focus({ preventScroll: true }); doneBox.scrollIntoView({ block: 'nearest', behavior: ctx.reduceMotion ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ } }, 30);
    }
    function answerRow() {
      const r = h('div', { class: 'wd-board', style: { '--n': n, width: `min(100%, ${n * 44}px)`, margin: '0' }, 'aria-label': 'The word was ' + W.word },
        h('div', { class: 'wd-row' }, [...W.word].map(c => h('div', { class: 'wd-tile wd-s-answer' }, c))));
      r.style.setProperty('--n', n);
      return r;
    }
    function next() {
      if (!done) return;
      wi++;
      if (wi >= words.length) {
        ctx.finish({ score, correct: solvedCount, total: words.length, won: solvedCount >= 2,
          note: `${solvedCount} of ${words.length} words solved in ${totalGuesses} guesses${cluesUsed ? `, ${cluesUsed} clue${cluesUsed > 1 ? 's' : ''} used` : ''}.` });
        return;
      }
      sfx.level(); startWord();
      // bring the fresh board back into view (the done panel may have scrolled the page)
      const top = root.getBoundingClientRect().top;
      if (top < 70) window.scrollBy({ top: top - 80, behavior: ctx.reduceMotion ? 'auto' : 'smooth' });
    }

    const onKey = e => {
      if (dead || !ctx.isActive() || typingElsewhere(e)) return;
      const tgt = e.target;
      if ((e.key === 'Enter' || e.key === ' ') && tgt && tgt.tagName === 'BUTTON') return; // let focused buttons work
      let k = null;
      if (e.key === 'Enter') k = 'ENTER';
      else if (e.key === 'Backspace' || e.key === 'Delete') k = 'BACK';
      else if (/^[a-zA-Z]$/.test(e.key)) k = e.key.toUpperCase();
      if (!k) return;
      e.preventDefault();
      const kEl = keyEls[k];
      if (kEl && !ctx.reduceMotion) { kEl.style.transform = 'scale(.92)'; later(() => { kEl.style.transform = ''; }, 90); }
      press(k);
    };
    window.addEventListener('keydown', onKey);

    root._ml = { word: () => W.word };
    startWord();

    return () => {
      dead = true;
      timers.forEach(clearTimeout); timers.clear();
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('mousedown', onMouseDown);
      document.querySelectorAll('.wd-pop').forEach(p => p.remove());
    };
  }
});
})();
