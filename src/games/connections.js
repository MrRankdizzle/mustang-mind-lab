/* Neural Connections — NYT Connections-style grouping puzzle (2 puzzles per round). */
(function () {
'use strict';
const ID = 'connections';
const PER_ROUND = 2, MISTAKES = 4;
const recent = [];   // titles of recently played data puzzles

/* Readable names for every term group key (g) in 10-terms.js, used for auto-generated puzzles. */
const GROUP_NAMES = {
  nn: 'Nature & nurture', evo: 'Evolution ideas', gen: 'Genetics words', twin: 'Twin & family research',
  ns: 'Nervous system divisions', ans: 'Autonomic balance', neuron: 'Parts of a neuron', ntype: 'Neuron types & pathways',
  disorder: 'Disorders & diseases', fire: 'Neural firing', nt: 'Neurotransmitters', horm: 'Hormones & endocrine',
  drugact: 'How drugs act', drugcat: 'Drug categories', drug: 'Specific drugs', drugfx: 'Effects of drug use',
  stem: 'Brainstem & cerebellum', limbic: 'Limbic system', cortex: 'Cerebral cortex', lobe: 'Lobes & cortex strips',
  hemi: 'Hemispheres & rewiring', lang: 'Language areas', scan: 'Ways to study the brain',
  cons: 'Consciousness & body clock', stage: 'Sleep stages & signs', wave: 'Brain waves', dream: 'Dreams & dream theories',
  sens: 'Sensation basics', thresh: 'Thresholds & psychophysics', eye: 'Parts of the eye', eyeproblem: 'Vision problems',
  color: 'Color vision', sound: 'Sound wave words', ear: 'Parts of the ear', pitch: 'Pitch & locating sound',
  deaf: 'Hearing loss & fixes', chem: 'Chemical senses', taste: 'Basic tastes', taster: 'Taster types',
  touch: 'Skin receptors', pain: 'Pain', body: 'Balance & body position'
};
/* Group pairs that would make tiles ambiguous if they shared a board. */
const CLASH = [['disorder', 'eyeproblem'], ['disorder', 'deaf'], ['fire', 'nt'], ['ns', 'ans'], ['stage', 'wave'], ['eye', 'color'], ['stage', 'disorder']];
const clash = (a, b) => CLASH.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const groupName = g => GROUP_NAMES[g] || (g.charAt(0).toUpperCase() + g.slice(1));
const LEVEL_COLORS = ['', '#35E3A7', '#4B9CD3', '#FFD166', '#B79CF6'];

const CSS = `
.cx-root { display: flex; flex-direction: column; gap: 10px; max-width: 660px; margin: 0 auto; }
.cx-title { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 12px; }
.cx-title h2 { font-family: var(--f-display); font-weight: 400; font-size: 20px; letter-spacing: .02em; color: var(--arc-ink); margin: 0; }
.cx-title span { color: var(--arc-dim); font-size: 15px; }
.cx-board { display: grid; gap: 8px; }
.cx-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.cx-tile {
  min-height: 74px; border-radius: 12px; border: 2px solid transparent; background: #E8F0FF; color: #0B1222;
  font-family: var(--f-body); font-weight: 700; font-size: 16px; line-height: 1.15; padding: 6px 4px; cursor: pointer;
  display: grid; place-items: center; text-align: center; overflow-wrap: normal; hyphens: auto; -webkit-hyphens: auto; touch-action: manipulation;
  transition: background .15s, color .15s, transform .15s; user-select: none; -webkit-user-select: none;
}
.cx-tile:hover { border-color: var(--arc-blue); }
.cx-tile[aria-pressed="true"] { background: #4A5E92; color: #fff; transform: scale(.97); }
.cx-tile.cx-s-hop { animation: cx-hop .32s ease; }
.cx-tile.cx-s-shake { animation: cx-shake .42s; }
.cx-tile.cx-s-out { animation: cx-out .3s ease forwards; }
.cx-tile.cx-s-in { animation: cx-in .3s ease both; }
.cx-bar {
  border-radius: 12px; padding: 10px 12px; text-align: center; color: #0B1222; display: grid; gap: 2px; min-height: 74px; align-content: center;
  animation: cx-bar .42s cubic-bezier(.2,.9,.3,1.3) both;
}
.cx-bar b { font-family: var(--f-display); font-weight: 400; font-size: 16px; letter-spacing: .03em; text-transform: uppercase; }
.cx-bar span { font-size: 15px; }
.cx-bar.cx-s-missed { opacity: .82; background-image: repeating-linear-gradient(135deg, rgba(11,18,34,.12) 0 8px, transparent 8px 16px); }
.cx-status { display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--arc-dim); font-size: 15px; min-height: 28px; }
.cx-dots { display: inline-flex; gap: 6px; }
.cx-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--arc-spark); transition: transform .3s, opacity .3s; }
.cx-dot.cx-s-gone { transform: scale(0); opacity: 0; }
.cx-msg { text-align: center; min-height: 26px; font-family: var(--f-mono); font-size: 14px; color: var(--arc-gold); }
.cx-msg.cx-s-good { color: var(--arc-mint); }
.cx-ctrls { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.cx-btn { border: 1.5px solid var(--arc-line); background: var(--arc-panel); color: var(--arc-ink); border-radius: 99px; padding: 10px 18px; font-weight: 700; font-size: 16px; cursor: pointer; min-height: 46px; }
.cx-btn:hover:not([disabled]) { border-color: var(--arc-blue); }
.cx-btn[disabled] { opacity: .4; cursor: not-allowed; }
.cx-btn.cx-s-primary { background: var(--arc-blue); border-color: var(--arc-blue); color: #0B1222; }
.cx-pop { position: fixed; z-index: 30; pointer-events: none; font-family: var(--f-display); font-size: 24px; color: var(--arc-gold); text-shadow: 0 2px 10px rgba(0,0,0,.5); animation: cx-float 1s ease-out forwards; }
@keyframes cx-hop { 40% { transform: translateY(-9px); } }
@keyframes cx-shake { 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
@keyframes cx-out { to { transform: scale(.6); opacity: 0; } }
@keyframes cx-in { from { transform: scale(.85); opacity: 0; } }
@keyframes cx-bar { from { transform: scaleY(.3) scaleX(.9); opacity: 0; } }
@keyframes cx-float { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -44px); } }
.cx-root.cx-s-rm * { animation: none !important; transition: none !important; }
@media (max-width: 560px) {
  .cx-grid, .cx-board { gap: 6px; }
  .cx-tile { min-height: 66px; font-size: 14px; border-radius: 10px; padding: 4px 3px; }
  .cx-bar { min-height: 66px; padding: 8px; }
  .cx-bar b { font-size: 14px; }
  .cx-bar span { font-size: 14px; }
}
`;
function injectCSS() {
  if (document.getElementById('css-' + ID)) return;
  const s = document.createElement('style'); s.id = 'css-' + ID; s.textContent = CSS; document.head.append(s);
}

/* Build a puzzle from term groups: 4 groups with ≥4 distinct labels each. */
function generate(terms, allTerms, util) {
  const byG = pool => {
    const m = new Map();
    pool.forEach(t => { if (!m.has(t.g)) m.set(t.g, []); m.get(t.g).push(t); });
    return m;
  };
  const uniq = list => { const seen = new Set(); return list.filter(t => { const k = t.s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); };
  const pick = (m, chosen) => {
    const keys = util.shuffle([...m.keys()].filter(g => uniq(m.get(g)).length >= 4));
    for (const g of keys) {
      if (chosen.some(c => c.g === g || clash(c.g, g))) continue;
      chosen.push({ g, list: uniq(m.get(g)) });
      if (chosen.length === 4) break;
    }
  };
  const chosen = [];
  pick(byG(terms), chosen);
  if (chosen.length < 4) pick(byG(allTerms), chosen);
  if (chosen.length < 4) return null;
  const used = new Set();
  const levels = util.shuffle([1, 2, 3, 4]);
  const groups = chosen.map((c, i) => {
    const items = [];
    for (const t of util.shuffle(c.list)) { const k = t.s.toLowerCase(); if (used.has(k)) continue; used.add(k); items.push(t); if (items.length === 4) break; }
    return { name: groupName(c.g), level: levels[i], items: items.map(t => t.s), terms: items };
  });
  if (groups.some(g => g.items.length < 4)) return null;
  return { title: 'Mystery Mix', generated: true, groups };
}

ML.registerGame({
  id: ID, title: 'Neural Connections', kind: 'word',
  blurb: 'Sixteen Unit 1 terms hide four secret groups. Find all four before you run out of mistakes.',
  how: [
    'Tap four tiles you think belong together, then press Submit.',
    'You can make four mistakes per puzzle. "One away" means three of your four are right.',
    'Groups are color coded from easiest (green) to trickiest (purple).',
    'Two puzzles per round.'
  ],
  art: `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="250" height="112" style="fill:#0B1222"/>
    <rect x="22" y="12" width="206" height="22" rx="6" style="fill:#35E3A7"/>
    <text x="125" y="28" text-anchor="middle" style="fill:#0B1222;font-family:Bungee,Impact,sans-serif;font-size:12px">LOBES OF THE CORTEX</text>
    ${[0, 1, 2, 3].map(c => [0, 1, 2].map(r => {
      const sel = (r === 1 && c === 1) || (r === 2 && c === 3) || (r === 1 && c === 2);
      return `<rect x="${22 + c * 53}" y="${40 + r * 23}" width="47" height="18" rx="4" style="fill:${sel ? '#4A5E92' : '#E8F0FF'}"/>`;
    }).join('')).join('')}
    <path d="M98 72 L151 72 L204 95" style="fill:none;stroke:#FF6B81;stroke-width:2.5;stroke-linecap:round;stroke-dasharray:4 4"/>
    <circle cx="98" cy="72" r="4" style="fill:#FFD166"/><circle cx="151" cy="72" r="4" style="fill:#FFD166"/><circle cx="204" cy="95" r="4" style="fill:#FFD166"/>
  </svg>`,

  mount(el, ctx) {
    injectCSS();
    const { h, sfx, util } = ctx;
    let dead = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };
    const RM = ctx.reduceMotion;

    /* ---- choose puzzles ---- */
    const all = (ctx.data.connections || []).filter(p => p && p.groups && p.groups.length === 4 && p.groups.every(g => g.items && g.items.length === 4));
    const topics = ctx.topics || [];
    const matching = topics.length ? all.filter(p => !p.topics || !p.topics.length || p.topics.some(t => topics.includes(t))) : all.slice();
    const freshFirst = list => { const sh = util.shuffle(list); return sh.filter(p => !recent.includes(p.title)).concat(sh.filter(p => recent.includes(p.title))); };
    const puzzles = freshFirst(matching).slice(0, PER_ROUND);
    let guard = 0;
    while (puzzles.length < PER_ROUND && guard++ < 6) {
      const gp = generate(ctx.terms, ctx.allTerms, util);
      if (gp) { gp.title = puzzles.some(p => p.generated) ? 'Mystery Mix 2' : 'Mystery Mix'; puzzles.push(gp); }
    }
    if (puzzles.length < PER_ROUND) puzzles.push(...freshFirst(all.filter(p => !puzzles.includes(p))).slice(0, PER_ROUND - puzzles.length));
    puzzles.forEach(p => { if (!p.generated) { recent.push(p.title); if (recent.length > 6) recent.shift(); } });

    let pi = 0, score = 0, groupsRight = 0, groupsTotal = 0;
    let P, tiles, selected, solvedGroups, mistakes, guessed, over, busy;

    /* ---- DOM ---- */
    const hudP = h('b'), hudScore = h('b', null, '0'), hudGroups = h('b', null, '0');
    const hud = h('div', { class: 'arc-hud' }, h('span', null, 'Puzzle ', hudP), h('span', null, 'Groups ', hudGroups), h('span', null, 'Score ', hudScore));
    const titleH = h('h2'), titleSub = h('span', null, 'Make four groups of four');
    const bars = h('div', { class: 'cx-board' });
    const grid = h('div', { class: 'cx-grid', role: 'group', 'aria-label': 'Tiles' });
    const board = h('div', { class: 'cx-board' }, bars, grid);
    const dots = h('span', { class: 'cx-dots', 'aria-hidden': 'true' });
    const mistakesSr = h('span', { class: 'sr-only' });
    const status = h('div', { class: 'cx-status' }, 'Mistakes left', dots, mistakesSr);
    const msg = h('div', { class: 'cx-msg', role: 'status', 'aria-live': 'polite' });
    const shuffleBtn = h('button', { type: 'button', class: 'cx-btn' }, 'Shuffle');
    const clearBtn = h('button', { type: 'button', class: 'cx-btn' }, 'Deselect all');
    const submitBtn = h('button', { type: 'button', class: 'cx-btn cx-s-primary' }, 'Submit');
    const nextBtn = h('button', { type: 'button', class: 'cx-btn cx-s-primary', hidden: true }, 'Next puzzle →');
    const ctrls = h('div', { class: 'cx-ctrls' }, shuffleBtn, clearBtn, submitBtn, nextBtn);
    const root = h('div', { lang: 'en', class: 'cx-root' + (RM ? ' cx-s-rm' : '') }, hud, h('div', { class: 'cx-title' }, titleH, titleSub), board, status, msg, ctrls);
    el.append(root);

    const onMouseDown = e => { if (e.target.closest('button')) e.preventDefault(); };
    root.addEventListener('mousedown', onMouseDown);
    shuffleBtn.addEventListener('click', () => { if (busy || over) return; tiles = util.shuffle(tiles); renderTiles(true); sfx.flip(); });
    clearBtn.addEventListener('click', () => { if (busy || over) return; selected.clear(); paintSel(); sfx.tap(); });
    submitBtn.addEventListener('click', submit);
    nextBtn.addEventListener('click', nextPuzzle);

    function say(text, good) { msg.textContent = text; msg.className = 'cx-msg' + (good ? ' cx-s-good' : ''); }
    function popScore(text, anchor) {
      if (RM || !anchor) return;
      const r = anchor.getBoundingClientRect();
      const p = h('div', { class: 'cx-pop', style: { left: (r.left + r.width / 2) + 'px', top: (r.top + 6) + 'px' } }, text);
      document.body.append(p); later(() => p.remove(), 1000);
    }

    function startPuzzle() {
      P = puzzles[pi];
      hudP.textContent = `${pi + 1}/${puzzles.length}`;
      titleH.textContent = P.title || 'Connections';
      tiles = [];
      P.groups.forEach((g, gi) => g.items.forEach(label => tiles.push({ label, gi })));
      tiles = util.shuffle(tiles);
      selected = new Set(); solvedGroups = []; mistakes = MISTAKES; guessed = new Set(); over = false; busy = false;
      bars.innerHTML = ''; say('');
      dots.innerHTML = ''; for (let i = 0; i < MISTAKES; i++) dots.append(h('span', { class: 'cx-dot' }));
      mistakesSr.textContent = `${mistakes} mistakes left`;
      nextBtn.hidden = true; shuffleBtn.hidden = clearBtn.hidden = submitBtn.hidden = false;
      renderTiles(true);
    }

    function renderTiles(animate) {
      grid.innerHTML = '';
      tiles.forEach((t, i) => {
        const b = h('button', { type: 'button', class: 'cx-tile' + (animate && !RM ? ' cx-s-in' : ''), 'aria-pressed': String(selected.has(t)), style: animate && !RM ? { animationDelay: (i * 18) + 'ms' } : null }, t.label);
        b._t = t;
        grid.append(b);
      });
      fitTiles(); paintSel();
    }
    function fitTiles() {
      // shrink any label that overflows its tile (long words on phones)
      grid.querySelectorAll('.cx-tile').forEach(b => {
        b.style.fontSize = '';
        let fs = parseFloat(getComputedStyle(b).fontSize) || 16, guardN = 0;
        b.style.overflowWrap = '';
        while (b.scrollWidth > b.clientWidth + 1 && fs > 11 && guardN++ < 10) { fs -= 1; b.style.fontSize = fs + 'px'; }
        if (b.scrollWidth > b.clientWidth + 1) b.style.overflowWrap = 'anywhere';
      });
    }
    function paintSel() {
      grid.querySelectorAll('.cx-tile').forEach(b => b.setAttribute('aria-pressed', String(selected.has(b._t))));
      submitBtn.disabled = selected.size !== 4 || busy;
      clearBtn.disabled = selected.size === 0 || busy;
    }
    grid.addEventListener('click', e => {
      const b = e.target.closest('.cx-tile'); if (!b || busy || over) return;
      const t = b._t;
      if (selected.has(t)) { selected.delete(t); sfx.tap(); }
      else if (selected.size < 4) { selected.add(t); sfx.blip(); }
      else { say('Four tiles max. Submit or deselect one.'); return; }
      paintSel();
    });
    grid.addEventListener('keydown', e => {
      const b = e.target.closest('.cx-tile'); if (!b) return;
      const list = [...grid.querySelectorAll('.cx-tile')], i = list.indexOf(b);
      const mv = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 }[e.key];
      if (mv == null) return;
      const j = i + mv; if (j < 0 || j >= list.length) return;
      e.preventDefault(); list[j].focus();
    });

    function tileEls(set) { return [...grid.querySelectorAll('.cx-tile')].filter(b => set.has(b._t)); }

    function submit() {
      if (busy || over || selected.size !== 4) return;
      const sel = [...selected];
      const key = sel.map(t => t.label).sort().join('|');
      if (guessed.has(key)) { say('You already tried that combo.'); sfx.tap(); return; }
      guessed.add(key);
      busy = true; paintSel();
      const els = tileEls(selected);
      const hop = RM ? 0 : 90;
      if (!RM) els.forEach((b, i) => later(() => { b.classList.remove('cx-s-hop'); void b.offsetWidth; b.classList.add('cx-s-hop'); sfx.tone(520 + i * 80, 0.05, 'triangle', 0.05); }, i * hop));
      later(() => {
        const counts = {}; sel.forEach(t => { counts[t.gi] = (counts[t.gi] || 0) + 1; });
        const best = Math.max(...Object.values(counts));
        if (best === 4) solve(sel[0].gi, els);
        else miss(best === 3, els);
      }, RM ? 0 : 4 * hop + 260);
    }

    function solve(gi, els) {
      const G = P.groups[gi];
      if (!RM) els.forEach(b => b.classList.add('cx-s-out'));
      later(() => {
        tiles = tiles.filter(t => t.gi !== gi);
        selected.clear();
        addBar(G, false);
        renderTiles(false);
        const gain = 40 + (G.level || 1) * 20;
        score += gain; groupsRight++; groupsTotal++;
        hudScore.textContent = score; hudGroups.textContent = groupsRight;
        sfx.good(); popScore('+' + gain, bars.lastChild);
        say(['Nice!', 'Great find!', 'Connected!', 'Synapse fired!'][solvedGroups.length % 4], true);
        record(G, true);
        busy = false;
        if (solvedGroups.length === 4) endPuzzle(true); else paintSel();
      }, RM ? 0 : 300);
    }

    function miss(oneAway, els) {
      mistakes--;
      const d = dots.children[MISTAKES - mistakes - 1]; if (d) d.classList.add('cx-s-gone');
      mistakesSr.textContent = `${mistakes} mistakes left`;
      sfx.bad();
      if (!RM) els.forEach(b => { b.classList.remove('cx-s-hop', 'cx-s-shake'); void b.offsetWidth; b.classList.add('cx-s-shake'); });
      say(oneAway ? 'One away…' : mistakes ? 'Not a group. Try again.' : 'Out of mistakes.');
      later(() => {
        busy = false; paintSel();
        if (mistakes <= 0) revealRest();
      }, RM ? 0 : 450);
    }

    function revealRest() {
      over = true; busy = true; selected.clear(); paintSel();
      const left = P.groups.map((g, gi) => gi).filter(gi => !solvedGroups.includes(gi)).sort((a, b) => (P.groups[a].level || 0) - (P.groups[b].level || 0));
      left.forEach((gi, k) => later(() => {
        const G = P.groups[gi];
        tiles = tiles.filter(t => t.gi !== gi);
        addBar(G, true); renderTiles(false); sfx.flip();
        groupsTotal++; record(G, false);
        if (k === left.length - 1) { busy = false; endPuzzle(false); }
      }, RM ? 0 : 500 + k * 650));
    }

    function addBar(G, missed) {
      solvedGroups.push(P.groups.indexOf(G));
      const bar = h('div', { class: 'cx-bar' + (missed ? ' cx-s-missed' : ''), style: { background: LEVEL_COLORS[G.level] || LEVEL_COLORS[1] }, role: 'status' },
        h('b', null, G.name), h('span', null, G.items.join(', ')));
      bars.append(bar);
    }

    function record(G, ok) {
      // one record per group; generated groups carry their terms for the review list
      const item = { id: 'conn:' + G.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), t: G.name, d: G.items.join(', ') };
      ctx.record(item, ok);
    }

    function endPuzzle(perfectRun) {
      over = true;
      shuffleBtn.hidden = clearBtn.hidden = submitBtn.hidden = true;
      if (perfectRun) {
        const bonus = mistakes * 20;
        if (bonus) { score += bonus; hudScore.textContent = score; }
        say(mistakes === MISTAKES ? `Perfect puzzle! +${bonus} bonus` : `Solved! +${bonus} for mistakes left`, true);
        sfx.level();
        if (!RM) { const r = bars.getBoundingClientRect(); ctx.confetti(r.left + r.width / 2, r.top + r.height / 2, 70); }
      } else say('Study the bars above, then keep going.');
      nextBtn.textContent = pi === puzzles.length - 1 ? 'See results' : 'Next puzzle →';
      nextBtn.hidden = false;
      later(() => { try { nextBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
    }

    function nextPuzzle() {
      pi++;
      if (pi >= puzzles.length) {
        ctx.finish({ score, correct: groupsRight, total: groupsTotal, won: groupsRight >= Math.ceil(groupsTotal / 2),
          note: `You found ${groupsRight} of ${groupsTotal} groups.` });
        return;
      }
      sfx.level(); startPuzzle();
    }

    root._ml = { groups: () => P.groups.map(g => g.items.slice()) };
    let rT = 0;
    const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { if (!dead) fitTiles(); }, 120); };
    window.addEventListener('resize', onResize);

    if (!puzzles.length) {
      root.append(h('p', null, 'No puzzles are available for these topics yet.'));
    } else startPuzzle();

    return () => {
      dead = true;
      timers.forEach(clearTimeout); timers.clear(); clearTimeout(rT);
      window.removeEventListener('resize', onResize);
      root.removeEventListener('mousedown', onMouseDown);
      document.querySelectorAll('.cx-pop').forEach(p => p.remove());
    };
  }
});
})();
