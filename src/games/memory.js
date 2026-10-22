/* Synapse Match — memory/concentration: match each term card with its definition card. */
(function () {
'use strict';
const ID = 'memory';
const PAIR_COLORS = ['#35E3A7', '#7CC0EE', '#FFD166', '#B79CF6', '#FF9F5A', '#FF6B81', '#4B9CD3', '#F48FD8'];
const recent = [];

const CSS = `
.sm-root { display: flex; flex-direction: column; gap: 10px; max-width: 820px; margin: 0 auto; }
.sm-tip { text-align: center; color: var(--arc-dim); font-size: 15px; min-height: 22px; }
.sm-tip.sm-s-good { color: var(--arc-mint); }
.sm-tip.sm-s-bad { color: var(--arc-spark); }
.sm-board { position: relative; display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 10px; }
.sm-card { position: relative; height: var(--ch); padding: 0; border: 0; background: none; cursor: pointer; perspective: 900px; border-radius: 12px; touch-action: manipulation; color: inherit; font: inherit; }
.sm-card:focus-visible { outline: 3px solid var(--arc-gold); outline-offset: 2px; }
.sm-in { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .42s cubic-bezier(.3,.7,.3,1.1); }
.sm-card.sm-s-up .sm-in, .sm-card.sm-s-matched .sm-in { transform: rotateY(180deg); }
.sm-back, .sm-face { position: absolute; inset: 0; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden; }
.sm-back { background: linear-gradient(145deg, #1B2A52, #121C33); border: 1.5px solid var(--arc-line); display: grid; place-items: center; }
.sm-back svg { width: 54%; max-width: 74px; height: auto; opacity: .9; }
.sm-card:hover .sm-back { border-color: var(--arc-blue); }
.sm-face { transform: rotateY(180deg); display: flex; flex-direction: column; gap: 4px; padding: 8px 9px; text-align: left; color: #0B1222; border: 2px solid transparent; }
.sm-face .sm-s-tg { font-family: var(--f-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; font-weight: 700; flex: none; }
.sm-face.term { background: #E8F0FF; justify-content: center; }
.sm-face.term .sm-s-tg { color: #2F7FB8; }
.sm-face .sm-s-tx { flex: 0 1 auto; min-height: 0; overflow: hidden; }
.sm-face.term .sm-s-tx { font-family: var(--f-body); font-weight: 700; font-size: 19px; line-height: 1.15; overflow-wrap: normal; hyphens: auto; -webkit-hyphens: auto; }
.sm-face.def { background: #FFF3D1; }
.sm-face.def .sm-s-tg { color: #A86400; }
.sm-face.def .sm-s-tx { font-size: 14px; line-height: 1.28; }
.sm-card.sm-s-matched .sm-face { border-color: var(--pc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--pc) 45%, transparent), 0 0 18px color-mix(in srgb, var(--pc) 40%, transparent); }
.sm-card.sm-s-matched .sm-face::after { content: ""; position: absolute; top: 7px; right: 7px; width: 11px; height: 11px; border-radius: 50%; background: var(--pc); box-shadow: 0 0 0 2px #0B1222; }
.sm-card.sm-s-matched.sm-s-zap .sm-in { animation: sm-zap .55s ease; }
.sm-card.sm-s-miss .sm-in { animation: sm-miss .42s ease; }
.sm-sparks { position: absolute; inset: 0; pointer-events: none; overflow: visible; z-index: 3; }
.sm-sparks path { fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 8 10; animation: sm-dash .9s linear forwards, sm-fade 1.1s ease forwards; filter: drop-shadow(0 0 6px currentColor); }
.sm-sparks circle { filter: drop-shadow(0 0 8px currentColor); animation: sm-fade 1.1s ease forwards; }
.sm-done { display: grid; gap: 8px; justify-items: center; text-align: center; background: var(--arc-panel); border: 1px solid var(--arc-line); border-radius: 14px; padding: 14px 16px; }
.sm-done b { font-family: var(--f-display); font-weight: 400; font-size: 22px; color: var(--arc-mint); letter-spacing: .02em; }
.sm-btn { border: 0; background: var(--arc-blue); color: #0B1222; border-radius: 99px; padding: 10px 18px; font-weight: 700; font-size: 16px; cursor: pointer; min-height: 44px; }
@keyframes sm-zap { 0% { transform: rotateY(180deg) scale(1); } 40% { transform: rotateY(180deg) scale(1.08); } 100% { transform: rotateY(180deg) scale(1); } }
@keyframes sm-miss { 0%, 100% { transform: rotateY(180deg); } 25% { transform: rotateY(180deg) translateX(-5px); } 75% { transform: rotateY(180deg) translateX(5px); } }
@keyframes sm-dash { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
@keyframes sm-fade { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }
.sm-root.sm-s-rm .sm-in { transition: none; }
.sm-root.sm-s-rm * { animation: none !important; }
@media (max-width: 600px) {
  .sm-board { gap: 7px; }
  .sm-face { padding: 6px 6px; }
  .sm-face .sm-s-tg { font-size: 9px; }
  .sm-face.term .sm-s-tx { font-size: 16px; }
  .sm-face.def .sm-s-tx { font-size: 12.5px; line-height: 1.22; }
}
`;
function injectCSS() {
  if (document.getElementById('css-' + ID)) return;
  const s = document.createElement('style'); s.id = 'css-' + ID; s.textContent = CSS; document.head.append(s);
}
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
const BACK_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="20" cy="32" r="9" style="fill:#4B9CD3"/><path d="M20 23l-6-10M20 41l-6 10M11 32H2M29 32h10" style="stroke:#7CC0EE;stroke-width:3;stroke-linecap:round"/><path d="M39 32h4" style="stroke:#FF6B81;stroke-width:3;stroke-linecap:round;stroke-dasharray:1 3"/><path d="M48 24v16M48 32h12M48 24l8-8M48 40l8 8" style="stroke:#7CC0EE;stroke-width:3;stroke-linecap:round"/><circle cx="44" cy="32" r="2.5" style="fill:#FFD166"/></svg>';

ML.registerGame({
  id: ID, title: 'Synapse Match', kind: 'word',
  blurb: 'Flip cards to connect each term with its definition. Fewer flips, more points.',
  how: [
    'Tap a card to flip it, then tap a second card.',
    'A term and its matching definition stay face up and fire a synapse spark.',
    'No match? They flip back. Remember where things were.',
    'Finish in fewer moves for a bigger score.'
  ],
  art: `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="250" height="112" style="fill:#0B1222"/>
    ${[0, 1, 2, 3, 4].map(i => {
      const x = 14 + i * 46, up = i === 1 || i === 3;
      return `<rect x="${x}" y="18" width="38" height="76" rx="7" style="fill:${up ? (i === 1 ? '#E8F0FF' : '#FFF3D1') : '#1B2A52'};stroke:${up ? '#35E3A7' : '#24325A'};stroke-width:${up ? 3 : 1.5}"/>` +
        (up ? (i === 1 ? `<text x="${x + 19}" y="60" text-anchor="middle" style="fill:#0B1222;font-family:'Atkinson Hyperlegible',sans-serif;font-weight:700;font-size:11px">AXON</text>`
          : [0, 1, 2, 3].map(k => `<rect x="${x + 6}" y="${36 + k * 11}" width="${26 - (k === 3 ? 10 : 0)}" height="4" rx="2" style="fill:#A86400;opacity:.55"/>`).join(''))
          : `<circle cx="${x + 19}" cy="56" r="7" style="fill:#4B9CD3"/><path d="M${x + 10} 56h-4M${x + 28} 56h4" style="stroke:#7CC0EE;stroke-width:2.5;stroke-linecap:round"/>`);
    }).join('')}
    <path d="M90 36 Q 125 4 160 36" style="fill:none;stroke:#FF6B81;stroke-width:3;stroke-linecap:round;stroke-dasharray:6 6"/>
    <circle cx="125" cy="20" r="5" style="fill:#FFD166"/>
  </svg>`,

  mount(el, ctx) {
    injectCSS();
    const { h, sfx, util } = ctx;
    const RM = ctx.reduceMotion;
    let dead = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };

    const phone = window.matchMedia('(max-width: 600px)').matches;
    const nPairs = phone ? 6 : 8;
    const maxDef = phone ? 92 : 135;

    /* ---- pick terms ---- */
    const usable = list => list.filter(t => t.d && t.d.length <= maxDef);
    const pickFrom = (list, n, taken) => {
      const out = [];
      const labels = new Set(taken.map(t => t.s.toLowerCase()));
      const sh = util.shuffle(list);
      const ordered = sh.filter(t => !recent.includes(t.id)).concat(sh.filter(t => recent.includes(t.id)));
      for (const t of ordered) { if (out.length >= n) break; if (labels.has(t.s.toLowerCase()) || taken.includes(t)) continue; labels.add(t.s.toLowerCase()); out.push(t); }
      return out;
    };
    let chosen = pickFrom(usable(ctx.terms), nPairs, []);
    if (chosen.length < nPairs) chosen = chosen.concat(pickFrom(usable(ctx.allTerms), nPairs - chosen.length, chosen));
    chosen.forEach(t => { recent.push(t.id); if (recent.length > 24) recent.shift(); });
    const N = chosen.length;

    const cards = util.shuffle(chosen.flatMap((t, p) => [
      { p, kind: 'term', text: t.s, term: t },
      { p, kind: 'def', text: maskDef(t.d, t), term: t }
    ]));

    let first = null, lock = false, moves = 0, matched = 0, finished = false;
    const seen = new Set(), slip = new Set();
    const t0 = Date.now();

    /* ---- DOM ---- */
    const hudPairs = h('b', null, `0/${N}`), hudMoves = h('b', null, '0'), hudTime = h('b', null, '0:00');
    const hud = h('div', { class: 'arc-hud' }, h('span', null, 'Pairs ', hudPairs), h('span', null, 'Moves ', hudMoves), h('span', null, 'Time ', hudTime));
    const tip = h('div', { class: 'sm-tip', role: 'status', 'aria-live': 'polite' }, 'Flip two cards. Match each term to its definition.');
    const cols = phone ? 3 : 4;
    const board = h('div', { class: 'sm-board', role: 'group', 'aria-label': 'Memory cards' });
    board.style.setProperty('--cols', cols);
    board.style.setProperty('--ch', phone ? '146px' : '148px');
    const sparks = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sparks.setAttribute('class', 'sm-sparks'); sparks.setAttribute('aria-hidden', 'true');
    cards.forEach((c, i) => {
      const face = h('div', { class: 'sm-face ' + c.kind },
        h('span', { class: 'sm-s-tg' }, c.kind === 'term' ? 'Term' : 'Definition'),
        h('span', { class: 'sm-s-tx' }, c.text));
      const back = h('div', { class: 'sm-back', html: BACK_SVG });
      c.el = h('button', { type: 'button', class: 'sm-card', 'data-i': i, 'aria-label': `Card ${i + 1}, face down` }, h('div', { class: 'sm-in' }, back, face));
      c.tx = face.lastChild;
      board.append(c.el);
    });
    board.append(sparks);
    const doneBox = h('div', { class: 'sm-done', hidden: true, role: 'status' });
    const root = h('div', { lang: 'en', class: 'sm-root' + (RM ? ' sm-s-rm' : '') }, hud, tip, board, doneBox);
    el.append(root);

    function fitText() {
      cards.forEach(c => {
        const tx = c.tx; tx.style.fontSize = '';
        let fs = parseFloat(getComputedStyle(tx).fontSize) || 14, g = 0;
        tx.style.overflowWrap = '';
        const fits = () => tx.scrollHeight <= tx.clientHeight + 1 && tx.scrollWidth <= tx.clientWidth + 1;
        const min = c.kind === 'term' ? 13 : 11;
        while (!fits() && fs > min && g++ < 16) { fs -= 0.5; tx.style.fontSize = fs + 'px'; }
        if (!fits()) tx.style.overflowWrap = 'anywhere';
      });
    }
    fitText();

    const say = (t, cls) => { tip.textContent = t; tip.className = 'sm-tip' + (cls ? ' ' + cls : ''); };
    const label = c => `${c.kind === 'term' ? 'Term' : 'Definition'}: ${c.text}`;

    function flipUp(c) {
      c.el.classList.add('sm-s-up'); c.el.setAttribute('aria-label', label(c));
      sfx.flip();
    }
    function flipDown(c) {
      c.el.classList.remove('sm-s-up', 'sm-s-miss'); c.el.setAttribute('aria-label', `Card ${cards.indexOf(c) + 1}, face down`);
    }
    function partnerOf(c) { return cards.find(x => x !== c && x.p === c.p); }

    function onPick(c) {
      if (lock || finished || c.matched || c.el.classList.contains('sm-s-up')) return;
      flipUp(c);
      if (!first) { first = c; return; }
      const a = first, b = c; first = null;
      moves++; hudMoves.textContent = moves;
      if (a.p === b.p) {
        a.matched = b.matched = true; matched++;
        hudPairs.textContent = `${matched}/${N}`;
        const pc = PAIR_COLORS[(matched - 1) % PAIR_COLORS.length];
        [a, b].forEach(x => { x.el.style.setProperty('--pc', pc); x.el.classList.add('sm-s-matched'); x.el.classList.remove('sm-s-up'); x.el.setAttribute('aria-label', label(x) + '. Matched.'); });
        if (!RM) [a, b].forEach(x => { x.el.classList.remove('sm-s-zap'); void x.el.offsetWidth; x.el.classList.add('sm-s-zap'); });
        spark(a, b, pc);
        sfx.fire(); later(() => sfx.good(), 140);
        ctx.record(a.term, !slip.has(a.p));
        say(`Connected: ${a.term.s}`, 'sm-s-good');
        seen.add(a); seen.add(b);
        if (matched === N) later(complete, RM ? 200 : 900);
      } else {
        // a "slip" = flipping a card whose partner you had already seen, then missing it
        [a, b].forEach(x => { if (seen.has(partnerOf(x))) slip.add(x.p); });
        seen.add(a); seen.add(b);
        lock = true;
        say('No connection. Try again.', 'sm-s-bad');
        later(() => {
          sfx.bad();
          if (!RM) [a, b].forEach(x => { x.el.classList.remove('sm-s-miss'); void x.el.offsetWidth; x.el.classList.add('sm-s-miss'); });
        }, 380);
        later(() => { flipDown(a); flipDown(b); lock = false; }, 1250);
      }
    }

    function spark(a, b, color) {
      if (RM) return;
      const br = board.getBoundingClientRect(), ra = a.el.getBoundingClientRect(), rb = b.el.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - br.left, y1 = ra.top + ra.height / 2 - br.top;
      const x2 = rb.left + rb.width / 2 - br.left, y2 = rb.top + rb.height / 2 - br.top;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const bend = Math.min(60, len * 0.25), cx = mx - dy / len * bend, cy = my + dx / len * bend;
      const d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
      sparks.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
      sparks.setAttribute('width', br.width); sparks.setAttribute('height', br.height);
      const ns = 'http://www.w3.org/2000/svg';
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('style', `color:${color}`);
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d); path.setAttribute('style', `stroke:${color}`);
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', '7'); dot.setAttribute('style', 'fill:#FFD166');
      const mo = document.createElementNS(ns, 'animateMotion');
      mo.setAttribute('dur', '0.6s'); mo.setAttribute('fill', 'freeze'); mo.setAttribute('path', d);
      dot.append(mo);
      const burst = document.createElementNS(ns, 'circle');
      burst.setAttribute('cx', x2); burst.setAttribute('cy', y2); burst.setAttribute('r', '4'); burst.setAttribute('style', `fill:none;stroke:${color};stroke-width:3`);
      const grow = document.createElementNS(ns, 'animate');
      grow.setAttribute('attributeName', 'r'); grow.setAttribute('from', '4'); grow.setAttribute('to', '34'); grow.setAttribute('begin', '0.55s'); grow.setAttribute('dur', '0.5s'); grow.setAttribute('fill', 'freeze');
      burst.append(grow);
      g.append(path, dot, burst);
      sparks.append(g);
      try { mo.beginElement(); } catch (e) { /* SMIL optional */ }
      later(() => g.remove(), 1150);
    }

    const secs = () => Math.round((Date.now() - t0) / 1000);
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const tick = setInterval(() => { if (!finished && !dead) hudTime.textContent = fmt(secs()); }, 1000);

    function complete() {
      finished = true;
      const s = secs(); hudTime.textContent = fmt(s);
      const extra = Math.max(0, moves - N);
      const effBonus = Math.max(0, 2 * N - extra) * 20;
      const timeBonus = Math.max(0, 150 - s);
      const score = N * 50 + effBonus + timeBonus;
      const clean = N - slip.size;
      sfx.level();
      if (!RM) { const r = board.getBoundingClientRect(); ctx.confetti(r.left + r.width / 2, r.top + r.height / 3, 90); }
      say('Every synapse connected!', 'sm-s-good');
      const btn = h('button', { type: 'button', class: 'sm-btn' }, 'See results');
      btn.addEventListener('click', () => ctx.finish({
        score, correct: clean, total: N, won: true,
        note: `${moves} moves for ${N} pairs (perfect is ${N}) in ${fmt(s)}. Efficiency bonus +${effBonus}, time bonus +${timeBonus}.`
      }));
      doneBox.innerHTML = '';
      doneBox.append(h('b', null, 'Board cleared!'), h('span', null, `${moves} moves · ${fmt(s)} · review the pairs, then see your score`), btn);
      doneBox.hidden = false;
      later(() => { try { btn.focus({ preventScroll: true }); doneBox.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ } }, 40);
    }

    board.addEventListener('click', e => {
      const b = e.target.closest('.sm-card'); if (!b) return;
      onPick(cards[+b.dataset.i]);
    });
    board.addEventListener('keydown', e => {
      const b = e.target.closest('.sm-card'); if (!b) return;
      const i = +b.dataset.i;
      const mv = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (mv == null) return;
      const j = i + mv; if (j < 0 || j >= cards.length) return;
      e.preventDefault(); cards[j].el.focus();
    });
    const onMouseDown = e => { if (e.target.closest('button')) e.preventDefault(); };
    root.addEventListener('mousedown', onMouseDown);
    root._ml = { pairs: () => cards.map(c => c.p) };
    let rT = 0;
    const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { if (!dead) fitText(); }, 150); };
    window.addEventListener('resize', onResize);

    return () => {
      dead = true;
      clearInterval(tick); clearTimeout(rT);
      timers.forEach(clearTimeout); timers.clear();
      window.removeEventListener('resize', onResize);
      root.removeEventListener('mousedown', onMouseDown);
    };
  }
});
})();
