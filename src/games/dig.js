/* Memory Dig — tunnel through strata to the memory crystal whose term matches the definition. */
(function () {
'use strict';
const ID = 'dig';
const STYLE_ID = 'dig-style';
const CSS = `
.dig-root{display:flex;flex-direction:column}
.dig-root .dig-hud{flex-wrap:nowrap}
.dig-root .dig-group{display:flex;align-items:center;gap:6px;white-space:nowrap}
.dig-root .dig-lab{font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.dig-root .dig-score{font-family:var(--f-display);font-weight:400;font-size:20px;color:var(--arc-gold);letter-spacing:.02em;min-width:3ch}
.dig-root .dig-hearts{display:inline-flex;gap:3px}
.dig-root .dig-hearts svg{width:17px;height:17px;display:block}
.dig-root .dig-hearts .on path{fill:var(--arc-spark)}
.dig-root .dig-hearts .off path{fill:none;stroke:var(--arc-line);stroke-width:2}
.dig-root .dig-time.low{color:var(--arc-spark)}
.dig-root .dig-prompt{transition:border-color .35s,box-shadow .35s}
.dig-root .dig-text{font-size:18px;line-height:1.35}
.dig-root .dig-text b{color:var(--arc-mint)}
.dig-root .dig-prompt.dig-flash{border-color:var(--arc-gold);box-shadow:0 0 0 3px rgba(255,209,102,.22)}
.dig-root .dig-prompt.dig-bad{border-color:var(--arc-spark)}
.dig-root .dig-body{display:flex;flex-direction:column;gap:10px}
.dig-root .dig-stagecol{min-width:0;flex:1;width:100%;margin:0 auto}
.dig-root .dig-pad{display:flex;justify-content:center;align-items:center;gap:16px;padding-top:0}
.dig-root .dig-cross{display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(2,46px);gap:6px}
.dig-root .dig-pad button{min-width:0;width:100%;height:100%;border-radius:12px;border:1px solid var(--arc-line);background:var(--arc-panel);color:var(--arc-ink);font-size:20px;font-weight:700;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;display:grid;place-items:center;padding:0}
.dig-root .dig-pad button svg{width:22px;height:22px}
.dig-root .dig-pad button.on,.dig-root .dig-pad button:active{background:var(--arc-line);border-color:var(--arc-blue)}
.dig-root .dig-cross .u{grid-column:2;grid-row:1}
.dig-root .dig-cross .l{grid-column:1;grid-row:2}
.dig-root .dig-cross .d{grid-column:2;grid-row:2}
.dig-root .dig-cross .r{grid-column:3;grid-row:2}
.dig-root .dig-pad .dig-zap{width:96px;height:98px;border-radius:50%;font-family:var(--f-display);font-weight:400;font-size:18px;letter-spacing:.04em;color:var(--arc-bg);background:var(--arc-mint);border-color:var(--arc-mint);box-shadow:0 0 18px rgba(53,227,167,.35)}
.dig-root .dig-pad .dig-zap:active,.dig-root .dig-pad .dig-zap.on{background:#7DF0C8}
.dig-root .dig-legend{display:none;font-family:var(--f-mono);font-size:12px;color:var(--arc-dim);line-height:1.5}
.dig-root .dig-legend b{color:var(--arc-ink);font-weight:700}
@media (min-width:921px){
 .dig-root .dig-body{flex-direction:row;align-items:center;justify-content:center;gap:28px}
 .dig-root .dig-stagecol{margin:0}
 .dig-root .dig-side{flex:none;width:208px;display:flex;flex-direction:column;gap:16px;align-items:center}
 .dig-root .dig-pad{flex-direction:column;gap:14px}
 .dig-root .dig-cross{grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,54px)}
 .dig-root .dig-pad .dig-zap{width:186px;height:54px;border-radius:14px}
 .dig-root .dig-legend{display:block}
}
@media (max-width:560px){
 .dig-root .dig-prompt .tag{display:none}
 .dig-root .dig-prompt{border-left:4px solid var(--arc-gold);padding:8px 12px;margin-bottom:8px}
 .dig-root .dig-text{font-size:17px;line-height:1.27}
 .dig-root .dig-hud{padding-bottom:8px;gap:8px}
 .dig-root .dig-lab{font-size:10px;letter-spacing:.08em}
 .dig-root .dig-cross{grid-template-columns:repeat(3,54px);grid-template-rows:repeat(2,44px)}
 .dig-root .dig-pad .dig-zap{width:86px;height:86px}
 .dig-root .dig-body{gap:8px}
}
`;
function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.append(s);
}

const ART = `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<rect width="250" height="112" fill="#0B1222"/>
<rect y="22" width="250" height="24" fill="#C9853A"/><rect y="46" width="250" height="22" fill="#A85A32"/><rect y="68" width="250" height="22" fill="#7A3E4A"/><rect y="90" width="250" height="22" fill="#4E3466"/>
<rect y="20" width="250" height="3" fill="#35E3A7"/>
<g fill="#0B1222"><rect x="60" y="22" width="18" height="58" rx="6"/><rect x="60" y="62" width="110" height="18" rx="6"/><rect x="152" y="40" width="18" height="40" rx="6"/></g>
<g fill="#000" opacity=".18"><circle cx="20" cy="34" r="2"/><circle cx="110" cy="30" r="2"/><circle cx="210" cy="56" r="2"/><circle cx="30" cy="78" r="2"/><circle cx="200" cy="98" r="2"/><circle cx="120" cy="100" r="2"/></g>
<circle cx="69" cy="71" r="8" fill="#E8F0FF"/><rect x="69" y="67" width="7" height="5" rx="2" fill="#FFD166"/><path d="M66 63l-3-6" stroke="#E8F0FF" stroke-width="2"/><circle cx="62.5" cy="56" r="2.2" fill="#FF6B81"/>
<path d="M77 71h12l4-3 4 6 4-6 4 6 4-3" stroke="#35E3A7" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="122" cy="71" r="10" fill="#FF9F5A"/><circle cx="118" cy="68" r="3" fill="#fff"/><circle cx="126" cy="68" r="3" fill="#fff"/><circle cx="119" cy="68.5" r="1.4" fill="#0B1222"/><circle cx="127" cy="68.5" r="1.4" fill="#0B1222"/>
<path d="M214 78l9-7 9 7-9 11z" fill="#B79CF6"/><circle cx="223" cy="80" r="16" fill="#B79CF6" opacity=".18"/>
<path d="M30 102l7-6 7 6-7 8z" fill="#7CC0EE"/><circle cx="37" cy="103" r="12" fill="#7CC0EE" opacity=".16"/>
<rect x="186" y="54" width="54" height="13" rx="4" fill="#0B1222" stroke="#B79CF6"/><rect x="194" y="59" width="38" height="3" rx="1.5" fill="#E8F0FF"/>
</svg>`;

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const ARROW = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${{ u: 'M12 5l-7 8h14z', d: 'M12 19l-7-8h14z', l: 'M5 12l8-7v14z', r: 'M19 12l-8-7v14z' }[d]}" fill="currentColor"/></svg>`;

ML.registerGame({
  id: ID, title: 'Memory Dig', kind: 'arcade',
  blurb: 'Tunnel through layers of memory to recover the glowing crystal whose term matches the definition, while dodging Distractions.',
  how: [
    'Read the definition, then dig to the memory crystal with the matching term.',
    'Move with the arrow keys or WASD, the on-screen pad, or tap a spot (or a label) to walk there. Digging through dirt is slower than running through tunnels.',
    'Distractions roam the tunnels and can drift through dirt. Press Space or ZAP three times to pop one.',
    'A wrong crystal or a Distraction costs a heart. Recover 10 memories before 3 minutes run out.'
  ],
  art: ART,
  mount(el, ctx) {
    injectStyle();
    const { h, util, sfx } = ctx;
    const C = ctx.colors, F = ctx.fonts, RM = ctx.reduceMotion;
    const COLS = 13, ROWS = 11, CELL = 40, SURF = 48;
    const W = COLS * CELL, H = SURF + ROWS * CELL;
    const GOAL = 10, TIME = 180, HEARTS = 3;
    const WALK_T = 0.15, DIG_T = 0.34, EN_T = 0.52, GHOST_T = 1.15, READ_T = 2.6;
    const CRYSTAL_COLORS = [C.blue, C.violet, C.orange, '#63E6E2'];
    const STRATA = [
      { rows: [0, 2], c: '#C9853A', d: '#A86A28', l: '#E0A45E' },
      { rows: [3, 5], c: '#A85A32', d: '#8A4524', l: '#C27650' },
      { rows: [6, 8], c: '#7A3E4A', d: '#62303B', l: '#985666' },
      { rows: [9, 10], c: '#4E3466', d: '#3D2752', l: '#6A4C86' }
    ];
    const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

    /* ---------- DOM ---------- */
    const root = h('div', { class: 'dig-root' }); el.append(root);
    const scoreEl = h('b', { class: 'dig-score' }, '0');
    const heartsEl = h('span', { class: 'dig-hearts', role: 'img', 'aria-label': 'Hearts: 3' });
    const foundEl = h('b', null, '0/' + GOAL);
    const timeEl = h('b', { class: 'dig-time' }, '3:00');
    const hud = h('div', { class: 'arc-hud dig-hud' },
      h('span', { class: 'dig-group' }, h('span', { class: 'dig-lab' }, 'Score'), scoreEl),
      heartsEl,
      h('span', { class: 'dig-group' }, h('span', { class: 'dig-lab' }, 'Found'), foundEl),
      h('span', { class: 'dig-group' }, h('span', { class: 'dig-lab' }, 'Time'), timeEl));
    const promptText = h('span', { class: 'dig-text' });
    const prompt = h('div', { class: 'arc-prompt dig-prompt', 'aria-live': 'polite' }, h('span', { class: 'tag' }, 'Dig up'), promptText);
    const status = h('div', { class: 'sr-only', 'aria-live': 'assertive' });
    const stageCol = h('div', { class: 'dig-stagecol' });
    const mkBtn = (cls, d, label) => { const b = h('button', { type: 'button', class: cls, 'aria-label': label }); b.innerHTML = ARROW(d); return b; };
    const bU = mkBtn('u', 'u', 'Move up'), bL = mkBtn('l', 'l', 'Move left'), bD = mkBtn('d', 'd', 'Move down'), bR = mkBtn('r', 'r', 'Move right');
    const bZ = h('button', { type: 'button', class: 'dig-zap', 'aria-label': 'Zap' }, 'ZAP');
    const pad = h('div', { class: 'dig-pad' }, h('div', { class: 'dig-cross' }, bU, bL, bD, bR), bZ);
    const legend = h('div', { class: 'dig-legend' },
      h('div', null, h('b', null, 'Dirt'), ' is slow. ', h('b', null, 'Tunnels'), ' are fast.'),
      h('div', null, 'Zap a ', h('b', null, 'Distraction'), ' 3 times to pop it.'),
      h('div', null, 'Old tunnels fade as you go.'));
    const side = h('div', { class: 'dig-side' }, pad, legend);
    const body = h('div', { class: 'dig-body' }, stageCol, side);
    root.append(hud, prompt, status, body);
    const st = ctx.stage(stageCol, W, H, { label: 'Memory Dig. Move with arrow keys, the pad, or tap a spot. Space zaps.', reserve: 282 });
    const g = st.g, canvas = st.canvas;
    stageCol.style.maxWidth = `max(300px, calc((100dvh - 282px) * ${W / H}))`;

    /* ---------- state ---------- */
    const dug = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const fades = []; // tunnels refilling: {c,r,t}
    let score = 0, hearts = HEARTS, found = 0, firstTry = 0, answered = 0, timeLeft = TIME, t = 0, popsN = 0, streak = 0;
    let item = null, crystals = [], enemies = [], parts = [], pops = [], beam = null, banner = null;
    let readT = READ_T, phase = 'play', wrongThis = false, shake = 0, flash = 0, flashColor = C.mint, finished = false;
    let path = [], pathTarget = null, zapCD = 0, collectT = 0, decayNotice = false;
    const player = { c: 6, r: -1, x: 0, y: 0, dir: 'down', mv: null, inv: 0, bob: 0, digSfx: 0 };
    const heldStack = [];
    const timers = [];
    const later = (s, fn) => timers.push({ s, fn });
    const speck = [];
    for (let i = 0; i < 520; i++) speck.push({ x: Math.random() * W, y: SURF + Math.random() * ROWS * CELL, r: util.rand(1, 2.6), k: Math.random() < 0.5 });
    const stars = Array.from({ length: 16 }, () => ({ x: util.rand(0, W), y: util.rand(3, SURF - 14), p: util.rand(0, 6) }));

    const cx = c => c * CELL + CELL / 2;
    const cy = r => SURF + r * CELL + CELL / 2;
    const inB = (c, r) => c >= 0 && c < COLS && r >= -1 && r < ROWS;
    const isOpen = (c, r) => r === -1 || (r >= 0 && r < ROWS && c >= 0 && c < COLS && dug[r][c]);
    const crystalAt = (c, r) => crystals.find(k => k.c === c && k.r === r && k.state !== 'gone');
    player.x = cx(player.c); player.y = cy(player.r);

    function cssScale() { const r = canvas.getBoundingClientRect(); return r.width ? r.width / W : 1; }
    function paintHearts() {
      heartsEl.innerHTML = '';
      for (let i = 0; i < HEARTS; i++) { const s = h('span', { class: i < hearts ? 'on' : 'off' }); s.innerHTML = HEART; heartsEl.append(s); }
      heartsEl.setAttribute('aria-label', 'Hearts: ' + hearts);
    }
    function paintTime() {
      const s = Math.max(0, Math.ceil(timeLeft));
      timeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      timeEl.classList.toggle('low', s <= 20);
    }
    function addScore(n) { score += n; scoreEl.textContent = score; }

    /* ---------- crystals ---------- */
    function labelLines(text, fs, maxW) {
      g.font = `700 ${fs}px ${F.body}`;
      if (g.measureText(text).width <= maxW || !text.includes(' ')) return [text];
      const w = text.split(' '); let best = null;
      for (let i = 1; i < w.length; i++) {
        const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
        const m = Math.max(g.measureText(a).width, g.measureText(b).width);
        if (!best || m < best.m) best = { m, l: [a, b] };
      }
      return best.l;
    }
    function tagFor(k) {
      g.font = `700 ${k.fs}px ${F.body}`;
      const tw = Math.min(W - 6, Math.max(...k.lines.map(l => g.measureText(l).width)) + 16);
      const th = k.lines.length * k.fs * 1.1 + 8;
      const x = util.clamp(cx(k.c), tw / 2 + 3, W - tw / 2 - 3);
      let y = cy(k.r) - CELL * 0.42 - th, below = false;
      if (y < 2) { y = cy(k.r) + CELL * 0.42; below = true; }
      return { x: x - tw / 2, y, w: tw, h: th, below };
    }
    const overlap = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

    function placeCrystals(choices) {
      const fs = Math.max(15, 14 / cssScale());
      const maxW1 = CELL * 3.3;
      const occupied = new Set(enemies.map(e => e.c + ',' + e.r));
      for (const relax of [0, 1, 2]) {
        for (let tries = 0; tries < 700; tries++) {
          const ks = [];
          let ok = true;
          for (let i = 0; i < choices.length && ok; i++) {
            let c = 0, r = 0, found2 = false;
            for (let j = 0; j < 30; j++) {
              c = util.rand(0, COLS) | 0; r = (util.rand(1, ROWS) | 0);
              if (dug[r][c] || occupied.has(c + ',' + r)) continue;
              if (Math.abs(c - player.c) + Math.abs(r - player.r) < (relax ? 3 : 4)) continue;
              if (ks.some(k => Math.abs(k.c - c) + Math.abs(k.r - r) < (relax > 1 ? 2 : 3))) continue;
              found2 = true; break;
            }
            if (!found2) { ok = false; break; }
            const k = { c, r, term: choices[i], color: CRYSTAL_COLORS[i], fs, state: 'buried', t: 0, pulse: 0, ph: Math.random() * 6 };
            k.lines = labelLines(k.term.s, fs, maxW1); k.tag = tagFor(k);
            ks.push(k);
          }
          if (!ok) continue;
          for (let i = 0; i < ks.length && ok; i++) for (let j = 0; j < ks.length && ok; j++) {
            if (i === j) continue;
            const cellJ = { x: ks[j].c * CELL, y: SURF + ks[j].r * CELL, w: CELL, h: CELL };
            if (overlap(ks[i].tag, ks[j].tag, relax > 1 ? 1 : 4) || overlap(ks[i].tag, cellJ, -2)) ok = false;
          }
          if (ok) return ks;
        }
      }
      // fallback: spread along a diagonal
      return choices.map((term, i) => { const k = { c: 1 + i * 3, r: 3 + i * 2, term, color: CRYSTAL_COLORS[i], fs: fs * 0.85, state: 'buried', t: 0, pulse: 0, ph: 0 }; dug[k.r][k.c] = false; k.lines = labelLines(term.s, k.fs, maxW1); k.tag = tagFor(k); return k; });
    }

    function newPrompt(first) {
      const prev = item;
      item = ctx.deck.next(4);
      if (prev && item.answer.id === prev.answer.id) { const again = item; item = ctx.deck.next(4); again.miss(); }
      wrongThis = false;
      if (!first) decayTunnels();
      crystals = placeCrystals(item.choices);
      crystals.forEach(k => { k.correct = k.term.id === item.answer.id; k.t = 0; k.appear = 0; });
      promptText.textContent = item.prompt;
      prompt.classList.remove('dig-bad'); prompt.classList.add('dig-flash');
      later(1.6, () => prompt.classList.remove('dig-flash'));
      readT = READ_T;
      sfx.tone(660, 0.12, 'triangle', 0.05, 990, 0.05);
      banner = { kind: 'read', text: first ? 'READ THE CLUE' : 'NEW CLUE', t: 0, dur: READ_T, c: C.gold };
      status.textContent = `New definition. Crystals: ${crystals.map(k => k.term.s).join(', ')}.`;
      path = []; pathTarget = null;
    }

    function decayTunnels() {
      let n = 0;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!dug[r][c]) continue;
        if (Math.abs(c - player.c) + Math.abs(r - player.r) <= 2) continue;
        if (player.mv && Math.abs(c - player.mv.tc) + Math.abs(r - player.mv.tr) <= 2) continue;
        if (enemies.some(e => !e.dead && ((e.c === c && e.r === r) || (e.mv && e.mv.tc === c && e.mv.tr === r)))) continue;
        if (Math.random() < 0.3) { dug[r][c] = false; fades.push({ c, r, t: 0 }); n++; }
      }
      if (n && !decayNotice) { decayNotice = true; later(0.4, () => pops.push(Pop(W / 2, SURF + 30, 'OLD TUNNELS FADE', C.dim, 1.8, 15))); }
    }

    /* ---------- enemies ---------- */
    function carvePocket() {
      for (let tries = 0; tries < 200; tries++) {
        const r = 3 + (util.rand(0, ROWS - 3) | 0), c0 = util.rand(0, COLS - 2) | 0;
        const cells = [[c0, r], [c0 + 1, r], [c0 + 2, r]];
        if (cells.some(([c, rr]) => c >= COLS || crystalAt(c, rr) || Math.abs(c - player.c) + Math.abs(rr - player.r) < 6)) continue;
        cells.forEach(([c, rr]) => { dug[rr][c] = true; });
        return cells[1];
      }
      return null;
    }
    function spawnEnemy(e) {
      e = e || { id: enemies.length };
      let spot = null;
      const open = [];
      for (let r = 2; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (dug[r][c] && Math.abs(c - player.c) + Math.abs(r - player.r) >= 6) open.push([c, r]);
      if (open.length && Math.random() < 0.6) spot = util.pick(open); else spot = carvePocket() || [util.rand(0, COLS) | 0, ROWS - 1];
      Object.assign(e, { c: spot[0], r: spot[1], x: cx(spot[0]), y: cy(spot[1]), mv: null, mode: 'walk', ghostIn: util.rand(7, 11), ghostSteps: 0, inflate: 0, inflT: 0, dead: false, respawn: 0, last: null, appear: 0, hue: util.pick([C.spark, C.orange, '#FF8FD8']), wob: Math.random() * 6 });
      if (!enemies.includes(e)) enemies.push(e);
      return e;
    }
    function wantedEnemies() { return 1 + (found >= 3 ? 1 : 0) + (found >= 6 ? 1 : 0); }

    function enemyStep(e, dt) {
      if (e.dead) { e.respawn -= dt; if (e.respawn <= 0 && phase === 'play') spawnEnemy(e); return; }
      e.appear = Math.min(1, e.appear + dt * 1.5);
      if (e.inflate > 0) {
        e.inflT += dt;
        if (e.inflT > 1.1) { e.inflate--; e.inflT = 0; }
        return;
      }
      const slow = readT > 0 ? 0.25 : 1;
      if (e.frozen) return;
      if (e.mv) {
        e.mv.t += dt * slow / e.mv.dur;
        const k = Math.min(1, e.mv.t);
        e.x = cx(e.mv.fc) + (cx(e.mv.tc) - cx(e.mv.fc)) * k; e.y = cy(e.mv.fr) + (cy(e.mv.tr) - cy(e.mv.fr)) * k;
        if (k >= 1) {
          e.last = [e.c, e.r]; e.c = e.mv.tc; e.r = e.mv.tr; e.mv = null;
          if (e.mode === 'ghost') {
            e.ghostSteps++;
            const inTunnel = isOpen(e.c, e.r) && e.r >= 0;
            if ((inTunnel && e.ghostSteps >= 2) || (e.ghostSteps > 8 && !crystalAt(e.c, e.r))) {
              e.mode = 'walk'; e.ghostIn = util.rand(8, 13) - found * 0.35;
              if (!inTunnel) dug[e.r][e.c] = true; // settle into a small pocket
            }
          }
        }
        return;
      }
      // choose next move
      if (e.mode === 'walk') {
        e.ghostIn -= dt * slow;
        const opts = Object.values(DIRS).map(([dx, dy]) => [e.c + dx, e.r + dy]).filter(([c, r]) => r >= 0 && inB(c, r) && isOpen(c, r));
        if (e.ghostIn <= 0 || !opts.length) { e.mode = 'ghost'; e.ghostSteps = 0; sfx.tone(300, 0.25, 'sine', 0.03, 180); return; }
        let choices = opts.filter(([c, r]) => !e.last || c !== e.last[0] || r !== e.last[1]);
        if (!choices.length) choices = opts;
        let nxt;
        if (Math.random() < 0.45) nxt = choices.slice().sort((a, b) => (Math.abs(a[0] - player.c) + Math.abs(a[1] - player.r)) - (Math.abs(b[0] - player.c) + Math.abs(b[1] - player.r)))[0];
        else nxt = util.pick(choices);
        e.mv = { fc: e.c, fr: e.r, tc: nxt[0], tr: nxt[1], t: 0, dur: EN_T * (found >= 6 ? 0.85 : 1) };
      } else {
        const dc = player.c - e.c, dr = player.r - e.r;
        if (!dc && !dr) { e.mode = 'walk'; return; }
        let step;
        if (Math.abs(dc) > Math.abs(dr) || (Math.abs(dc) === Math.abs(dr) && Math.random() < 0.5)) step = [Math.sign(dc), 0]; else step = [0, Math.sign(dr)];
        e.mv = { fc: e.c, fr: e.r, tc: e.c + step[0], tr: Math.max(0, e.r + step[1]), t: 0, dur: GHOST_T };
        if (e.mv.tc === e.c && e.mv.tr === e.r) { e.mv = null; e.mode = 'walk'; }
      }
    }

    /* ---------- player ---------- */
    function heldDir() { return heldStack.length ? heldStack[heldStack.length - 1] : null; }
    function playerStep(dt) {
      player.inv = Math.max(0, player.inv - dt);
      if (player.mv) {
        const m = player.mv;
        m.t += dt / m.dur;
        const k = Math.min(1, m.t);
        player.x = cx(m.fc) + (cx(m.tc) - cx(m.fc)) * k; player.y = cy(m.fr) + (cy(m.tr) - cy(m.fr)) * k;
        player.bob += dt * (m.dig ? 18 : 26);
        if (m.dig) {
          player.digSfx -= dt;
          if (player.digSfx <= 0) { player.digSfx = 0.12; sfx.tone(util.rand(90, 140), 0.04, 'square', 0.025); }
          if (!RM && Math.random() < 0.5) { const s = STRATA.find(sx => m.tr >= sx.rows[0] && m.tr <= sx.rows[1]) || STRATA[0]; parts.push(P(player.x + DIRS[player.dir][0] * 14, player.y + DIRS[player.dir][1] * 14, util.rand(-60, 60), util.rand(-90, 10), Math.random() < 0.5 ? s.l : s.d, 0.45, util.rand(2, 4))); }
        }
        if (k >= 1) {
          player.c = m.tc; player.r = m.tr; player.mv = null;
          if (m.dig && player.r >= 0) dug[player.r][player.c] = true;
          const k2 = crystalAt(player.c, player.r);
          if (k2 && (k2.state === 'buried')) touchCrystal(k2);
        } else return;
      }
      // pick the next move
      let dir = heldDir();
      if (!dir && path.length) dir = path.shift();
      if (!dir) { if (!path.length) pathTarget = null; return; }
      player.dir = dir;
      const [dx, dy] = DIRS[dir];
      const tc = player.c + dx, tr = player.r + dy;
      if (!inB(tc, tr)) { path = []; return; }
      const dig = !isOpen(tc, tr);
      player.mv = { fc: player.c, fr: player.r, tc, tr, t: 0, dur: dig ? DIG_T : WALK_T, dig };
      if (dig) player.digSfx = 0;
    }

    function touchCrystal(k) {
      if (phase !== 'play') return;
      if (k.correct) {
        k.state = 'got'; k.t = 0;
        let pts = 25;
        if (!wrongThis) { ctx.record(item, true); firstTry++; answered++; streak++; pts = 100 + 10 * k.r + 25 * Math.min(4, streak - 1); }
        found++; foundEl.textContent = `${found}/${GOAL}`;
        addScore(pts);
        pops.push(Pop(cx(k.c), cy(k.r) - 20, '+' + pts, C.gold, 1.3));
        if (!wrongThis && streak > 1) pops.push(Pop(cx(k.c), cy(k.r) - 50, `STREAK x${streak}`, C.mint, 1.3, 16));
        sfx.good(); sfx.tone(1046, 0.18, 'triangle', 0.08, 1568, 0.1);
        flash = 1; flashColor = C.mint; if (!RM) shake = 6;
        burst(cx(k.c), cy(k.r), [k.color, C.gold, C.mint, '#FFFFFF'], 40);
        promptText.innerHTML = ''; promptText.append(h('b', null, item.answer.t + ': '), item.prompt);
        status.textContent = `Recovered ${item.answer.t}. Plus ${pts} points.`;
        crystals.forEach(o => { if (o !== k) { o.state = 'sink'; o.t = 0; } });
        phase = 'between';
        if (found >= GOAL) { later(0.9, () => endRound('goal')); return; }
        while (enemies.filter(e => !e.dead || e.respawn > 0).length < wantedEnemies()) { const e = spawnEnemy(); e.mode = 'ghost'; e.appear = 0; }
        later(1.1, () => { if (phase !== 'between') return; phase = 'play'; newPrompt(false); });
      } else {
        k.state = 'wrong'; k.t = 0;
        if (!wrongThis) answered++;
        wrongThis = true; streak = 0;
        ctx.record(item, false);
        const right = crystals.find(o => o.correct); right.pulse = 0.001;
        promptText.innerHTML = '';
        promptText.append(`That was ${k.term.t}. Dig to `, h('b', null, item.answer.t), ' (glowing gold): ' + item.prompt);
        prompt.classList.add('dig-bad');
        status.textContent = `Wrong crystal: ${k.term.t}. The answer is ${item.answer.t}, glowing gold.`;
        pops.push(Pop(cx(k.c), cy(k.r) - 20, 'WRONG MEMORY', C.spark, 1.3, 16));
        if (!RM) burst(cx(k.c), cy(k.r), [C.spark, '#FFFFFF'], 18);
        hurt(true);
      }
    }

    function hurt(fromCrystal) {
      hearts--; paintHearts();
      player.inv = 2.5;
      sfx.bad(); if (!fromCrystal) sfx.boom();
      flash = 0.9; flashColor = C.spark; if (!RM) shake = 10;
      if (hearts <= 0) { phase = 'between'; later(0.8, () => endRound('hearts')); }
    }

    function zap() {
      if (phase !== 'play' && phase !== 'between') return;
      if (zapCD > 0) return;
      zapCD = 0.28;
      const [dx, dy] = DIRS[player.dir];
      // beam runs through open cells (max 3) starting from the player's cell
      let c = player.mv ? player.mv.tc : player.c, r = player.mv ? player.mv.tr : player.r, len = 0;
      for (let i = 0; i < 3; i++) { if (!inB(c + dx, r + dy) || !isOpen(c + dx, r + dy)) break; c += dx; r += dy; len++; }
      const reach = len * CELL + CELL * 0.55;
      const sx = player.x, sy = player.y, ex = sx + dx * reach, ey = sy + dy * reach;
      beam = { sx, sy, ex, ey, t: 0 };
      sfx.shoot();
      // nearest enemy along the beam
      let best = null, bd = 1e9;
      for (const e of enemies) {
        if (e.dead || e.appear < 0.5) continue;
        const along = (e.x - sx) * dx + (e.y - sy) * dy, perp = Math.abs((e.x - sx) * dy - (e.y - sy) * dx);
        if (along > -6 && along < reach + CELL * 0.35 && perp < CELL * 0.55 && along < bd) { bd = along; best = e; }
      }
      if (best) {
        if (best.mode === 'ghost' && !isOpen(Math.round((best.x - CELL / 2) / CELL), Math.round((best.y - SURF - CELL / 2) / CELL))) { /* ghosts inside dirt are out of reach */ }
        else {
          best.inflate++; best.inflT = 0; best.mv = null; best.c = Math.round((best.x - CELL / 2) / CELL); best.r = util.clamp(Math.round((best.y - SURF - CELL / 2) / CELL), 0, ROWS - 1); best.x = cx(best.c); best.y = cy(best.r);
          if (best.mode === 'ghost') best.mode = 'walk';
          beam.ex = best.x; beam.ey = best.y; beam.hit = true;
          sfx.tone(300 + best.inflate * 180, 0.12, 'triangle', 0.09, 500 + best.inflate * 200);
          if (best.inflate >= 3) popEnemy(best);
        }
      }
    }
    function popEnemy(e) {
      e.dead = true; e.respawn = 5.5; e.inflate = 0; popsN++;
      addScore(50);
      pops.push(Pop(e.x, e.y - 18, '+50 POP', C.mint, 1.1, 16));
      sfx.boom(); sfx.tone(900, 0.15, 'sine', 0.07, 200);
      burst(e.x, e.y, [e.hue, '#FFFFFF', C.gold], 26);
      status.textContent = 'Distraction popped.';
    }

    function endRound(why) {
      if (finished) return; finished = true; phase = 'over';
      let bonus = 0;
      if (why === 'goal') bonus = Math.round(timeLeft) * 2 + hearts * 100;
      if (bonus) addScore(bonus);
      const title = why === 'goal' ? 'MEMORY BANK FULL!' : why === 'hearts' ? 'OUT OF HEARTS' : "TIME'S UP";
      banner = { text: title, sub: bonus ? `Time + heart bonus +${bonus}` : `${found} memories recovered`, t: 0, dur: 2, c: why === 'hearts' ? C.spark : C.gold };
      if (why === 'goal') sfx.level();
      later(1.8, () => {
        if (!ctx.isActive()) return;
        const won = hearts > 0 && found >= 5;
        const tip = found >= GOAL ? 'Every memory recovered.' : found >= 6 ? 'Strong recall. Review the terms below and go for all 10.' : 'Review the terms below, then dig again.';
        ctx.finish({ score, correct: firstTry, total: Math.max(answered, firstTry), won, note: `${found} of ${GOAL} memories recovered, ${popsN} Distraction${popsN === 1 ? '' : 's'} popped, ${hearts} heart${hearts === 1 ? '' : 's'} left. ${tip}` });
      });
    }

    /* ---------- tap-to-walk path ---------- */
    function findPath(tc, tr) {
      const start = player.mv ? [player.mv.tc, player.mv.tr] : [player.c, player.r];
      const N = COLS * (ROWS + 1), idx = (c, r) => (r + 1) * COLS + c;
      const dist = new Array(N).fill(Infinity), prev = new Array(N).fill(-1), done = new Array(N).fill(false);
      dist[idx(start[0], start[1])] = 0;
      for (;;) {
        let u = -1, best = Infinity;
        for (let i = 0; i < N; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
        if (u < 0) break;
        done[u] = true;
        const uc = u % COLS, ur = Math.floor(u / COLS) - 1;
        if (uc === tc && ur === tr) break;
        for (const [dx, dy] of Object.values(DIRS)) {
          const nc = uc + dx, nr = ur + dy;
          if (!inB(nc, nr)) continue;
          let cost = isOpen(nc, nr) ? 1 : DIG_T / WALK_T;
          const k = crystalAt(nc, nr);
          if (k && k.state === 'buried' && !(nc === tc && nr === tr)) cost += 60;
          const v = idx(nc, nr);
          if (dist[u] + cost < dist[v]) { dist[v] = dist[u] + cost; prev[v] = u; }
        }
      }
      const out = []; let v = idx(tc, tr);
      if (dist[v] === Infinity) return [];
      while (prev[v] >= 0) {
        const p = prev[v];
        const dc = (v % COLS) - (p % COLS), dr = Math.floor(v / COLS) - Math.floor(p / COLS);
        out.unshift(dc === 1 ? 'right' : dc === -1 ? 'left' : dr === 1 ? 'down' : 'up');
        v = p;
      }
      return out;
    }
    function walkTo(tc, tr) {
      tc = util.clamp(tc, 0, COLS - 1); tr = util.clamp(tr, -1, ROWS - 1);
      if (pathTarget && pathTarget.c === tc && pathTarget.r === tr && path.length) return;
      path = findPath(tc, tr); pathTarget = path.length ? { c: tc, r: tr, t: 0 } : null;
    }

    /* ---------- particles ---------- */
    function P(x, y, vx, vy, c, life, size) { return { x, y, vx, vy, c, life, max: life, size }; }
    function Pop(x, y, text, c, life, size) { return { x, y, text, c, t: 0, life, size: size || 20 }; }
    function burst(x, y, cols, n) {
      if (RM) return;
      for (let i = 0; i < n; i++) { const a = util.rand(0, Math.PI * 2), s = util.rand(60, 300); parts.push(P(x, y, Math.cos(a) * s, Math.sin(a) * s - 40, util.pick(cols), util.rand(0.4, 1), util.rand(2, 5))); }
    }

    /* ---------- update ---------- */
    function update(dt) {
      t += dt;
      for (let i = timers.length - 1; i >= 0; i--) { timers[i].s -= dt; if (timers[i].s <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
      if (banner) { banner.t += dt; if (banner.t > banner.dur) banner = null; }
      zapCD = Math.max(0, zapCD - dt);
      if (phase === 'over') { stepFx(dt); return; }
      if (readT > 0) readT -= dt;
      if (phase === 'play') {
        timeLeft -= dt; paintTime();
        if (timeLeft <= 0) { timeLeft = 0; paintTime(); endRound('time'); return; }
      }
      playerStep(dt);
      for (const e of enemies) enemyStep(e, dt);
      // collisions
      if (phase === 'play' && player.inv <= 0) {
        for (const e of enemies) {
          if (e.dead || e.inflate > 0 || e.appear < 0.8) continue;
          if (Math.hypot(e.x - player.x, e.y - player.y) < CELL * 0.55) {
            e.dead = true; e.respawn = 5.5;
            pops.push(Pop(player.x, player.y - 24, 'DISTRACTED!', C.spark, 1.2, 16));
            if (!RM) burst(e.x, e.y, [e.hue, '#FFFFFF'], 14);
            status.textContent = 'A Distraction got you. You lost a heart.';
            hurt(false);
            break;
          }
        }
      }
      for (const k of crystals) { k.t += dt; k.appear = Math.min(1, (k.appear || 0) + dt * 2.2); if (k.pulse) k.pulse += dt; }
      stepFx(dt);
    }
    function stepFx(dt) {
      for (const f of fades) f.t += dt;
      for (let i = fades.length - 1; i >= 0; i--) if (fades[i].t > 0.8) fades.splice(i, 1);
      for (const p of parts) { p.life -= dt; p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      parts = parts.filter(p => p.life > 0);
      for (const p of pops) p.t += dt;
      pops = pops.filter(p => p.t < p.life);
      if (beam) { beam.t += dt; if (beam.t > 0.2) beam = null; }
      if (pathTarget) pathTarget.t += dt;
      shake = Math.max(0, shake - dt * 30); flash = Math.max(0, flash - dt * 2.5);
    }

    /* ---------- draw ---------- */
    function draw() {
      g.save();
      g.clearRect(0, 0, W, H);
      if (shake) g.translate(util.rand(-shake, shake) * 0.4, util.rand(-shake, shake) * 0.4);
      // surface
      const sky = g.createLinearGradient(0, 0, 0, SURF);
      sky.addColorStop(0, '#0A1020'); sky.addColorStop(1, '#17284A');
      g.fillStyle = sky; g.fillRect(-10, -10, W + 20, SURF + 10);
      for (const s of stars) { g.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.5 + s.p); g.fillStyle = C.ink; g.fillRect(s.x, s.y, 2, 2); }
      g.globalAlpha = 1;
      // strata
      for (const s of STRATA) {
        const y0 = SURF + s.rows[0] * CELL, hh = (s.rows[1] - s.rows[0] + 1) * CELL;
        g.fillStyle = s.c; g.fillRect(0, y0, W, hh);
        g.fillStyle = s.l; g.globalAlpha = 0.5; g.fillRect(0, y0, W, 2); g.globalAlpha = 1;
      }
      for (const p of speck) {
        const r = Math.floor((p.y - SURF) / CELL), s = STRATA.find(sx => r >= sx.rows[0] && r <= sx.rows[1]) || STRATA[3];
        g.fillStyle = p.k ? s.d : s.l; g.globalAlpha = 0.7;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      // grass line
      g.fillStyle = C.mint; g.fillRect(0, SURF - 3, W, 3);
      g.fillStyle = 'rgba(53,227,167,.5)';
      for (let x = 4; x < W; x += 13) { g.fillRect(x, SURF - 7, 2, 4); }
      drawTunnels();
      // tap target marker
      if (pathTarget) {
        const a = 0.5 + 0.4 * Math.sin(pathTarget.t * 8);
        g.strokeStyle = C.mint; g.globalAlpha = a; g.lineWidth = 2; g.setLineDash([5, 4]);
        g.strokeRect(pathTarget.c * CELL + 5, cy(pathTarget.r) - CELL / 2 + 5, CELL - 10, CELL - 10); g.setLineDash([]); g.globalAlpha = 1;
      }
      for (const k of crystals) drawCrystal(k);
      for (const k of crystals) drawTag(k);
      for (const e of enemies) drawEnemy(e);
      if (beam) drawBeam();
      drawPlayer();
      for (const p of parts) { g.globalAlpha = Math.max(0, p.life / p.max); g.fillStyle = p.c; g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
      g.globalAlpha = 1;
      for (const p of pops) {
        const k = p.t / p.life;
        g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
        const fs = Math.max(p.size, 14 / cssScale()) * (k < 0.12 ? 0.6 + k * 3.4 : 1);
        g.font = `400 ${fs}px ${F.display}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        const tw = g.measureText(p.text).width;
        const x = util.clamp(p.x, tw / 2 + 4, W - tw / 2 - 4), y = Math.max(fs / 2 + 2, p.y - k * 26);
        g.lineWidth = 5; g.strokeStyle = 'rgba(11,18,34,.9)'; g.strokeText(p.text, x, y);
        g.fillStyle = p.c; g.fillText(p.text, x, y);
      }
      g.globalAlpha = 1;
      if (banner) drawBanner();
      if (flash) { g.fillStyle = flashColor; g.globalAlpha = flash * (RM ? 0.06 : 0.16); g.fillRect(-10, -10, W + 20, H + 20); g.globalAlpha = 1; }
      g.restore();
    }

    function drawTunnels() {
      const TUN = '#0B1222';
      g.fillStyle = TUN;
      const inset = 4;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!dug[r][c]) continue;
        const x = c * CELL, y = SURF + r * CELL;
        ctx.roundRect(g, x + inset, y + inset, CELL - inset * 2, CELL - inset * 2, 10); g.fill();
        if (c + 1 < COLS && dug[r][c + 1]) g.fillRect(x + CELL / 2, y + inset, CELL, CELL - inset * 2);
        if (r + 1 < ROWS && dug[r + 1][c]) g.fillRect(x + inset, y + CELL / 2, CELL - inset * 2, CELL);
        if (r === 0) g.fillRect(x + inset, SURF - 3, CELL - inset * 2, CELL / 2 + 3);
      }
      // tunnels refilling
      for (const f of fades) {
        g.globalAlpha = Math.max(0, 1 - f.t / 0.8);
        ctx.roundRect(g, f.c * CELL + inset, SURF + f.r * CELL + inset, CELL - inset * 2, CELL - inset * 2, 10); g.fill();
      }
      g.globalAlpha = 1;
      // the tunnel being dug right now
      const m = player.mv;
      if (m && m.dig) {
        const x0 = Math.min(cx(m.fc), player.x), x1 = Math.max(cx(m.fc), player.x), y0 = Math.min(cy(m.fr), player.y), y1 = Math.max(cy(m.fr), player.y);
        const half = CELL / 2 - inset;
        ctx.roundRect(g, x0 - half, y0 - half, x1 - x0 + half * 2, y1 - y0 + half * 2, 10); g.fill();
      }
      // faint glow lines along tunnel floors
      g.strokeStyle = 'rgba(124,192,238,.10)'; g.lineWidth = 2;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (dug[r][c]) { g.beginPath(); g.moveTo(c * CELL + 10, SURF + r * CELL + CELL - 7); g.lineTo(c * CELL + CELL - 10, SURF + r * CELL + CELL - 7); g.stroke(); }
    }

    function drawCrystal(k) {
      if (k.state === 'gone') return;
      const x = cx(k.c), y = cy(k.r);
      let a = k.appear ?? 1, sc = 1, col = k.color;
      if (k.state === 'got') { const q = k.t / 0.5; if (q >= 1) return; sc = 1 + q * 1.2; a = 1 - q; col = C.mint; }
      if (k.state === 'sink') { const q = k.t / 0.6; if (q >= 1) return; a = 1 - q; }
      if (k.state === 'wrong') { col = '#5B6684'; }
      if (k.pulse && k.state === 'buried') col = C.gold;
      const exposed = isOpen(k.c, k.r);
      g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(sc, sc);
      const glow = 0.55 + 0.35 * Math.sin(t * 3 + k.ph);
      if (k.state !== 'wrong') {
        const gr = g.createRadialGradient(0, 0, 2, 0, 0, CELL * 0.75);
        gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalAlpha = a * (exposed ? 0.55 : 0.4) * glow; g.fillStyle = gr; g.beginPath(); g.arc(0, 0, CELL * 0.75, 0, 7); g.fill();
        g.globalAlpha = a;
      }
      if (k.pulse && k.state === 'buried') {
        const q = (k.pulse * 1.3) % 1;
        g.strokeStyle = C.gold; g.lineWidth = 3; g.globalAlpha = a * (RM ? 0.8 : 1 - q);
        g.beginPath(); g.arc(0, 0, CELL * 0.45 + (RM ? 4 : q * 22), 0, 7); g.stroke(); g.globalAlpha = a;
      }
      // gem
      const s = CELL * 0.3;
      g.fillStyle = col;
      g.beginPath(); g.moveTo(0, -s * 1.15); g.lineTo(s, -s * 0.3); g.lineTo(s * 0.6, s * 1.05); g.lineTo(-s * 0.6, s * 1.05); g.lineTo(-s, -s * 0.3); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)';
      g.beginPath(); g.moveTo(0, -s * 1.15); g.lineTo(s * 0.35, -s * 0.3); g.lineTo(0, s * 0.3); g.lineTo(-s * 0.35, -s * 0.3); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(11,18,34,.45)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-s, -s * 0.3); g.lineTo(s, -s * 0.3); g.stroke();
      if (k.state === 'wrong') { g.strokeStyle = C.spark; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-s * 0.5, -s * 0.8); g.lineTo(s * 0.1, 0); g.lineTo(-s * 0.2, s * 0.9); g.stroke(); }
      // dirt veil when still buried
      if (!exposed && k.state === 'buried') { g.globalAlpha = a * 0.18; g.fillStyle = '#000'; g.beginPath(); g.arc(0, 0, s * 1.3, 0, 7); g.fill(); }
      g.restore();
    }

    function drawTag(k) {
      if (k.state === 'gone' || (k.state === 'got' && k.t > 0.4) || (k.state === 'sink' && k.t > 0.5)) return;
      const b = k.tag, fs = k.fs;
      let border = k.color;
      if (k.state === 'wrong') border = C.spark;
      if (k.pulse && k.state === 'buried') border = C.gold;
      if (k.state === 'got') border = C.mint;
      const a = (k.appear ?? 1) * (k.state === 'sink' ? Math.max(0, 1 - k.t / 0.5) : 1) * (k.state === 'wrong' ? 0.6 : 1);
      // fade the tag a bit when the player stands under it so the miner stays visible
      const under = player.x > b.x - 8 && player.x < b.x + b.w + 8 && player.y > b.y - 8 && player.y < b.y + b.h + 8;
      g.save(); g.globalAlpha = a * (under ? 0.55 : 1);
      ctx.roundRect(g, b.x, b.y, b.w, b.h, 7);
      g.fillStyle = 'rgba(8,13,26,.9)'; g.fill();
      g.lineWidth = k.pulse && k.state === 'buried' ? 3 : 2; g.strokeStyle = border; g.stroke();
      const nx = util.clamp(cx(k.c), b.x + 9, b.x + b.w - 9);
      g.fillStyle = border; g.beginPath();
      if (b.below) { g.moveTo(nx - 5, b.y); g.lineTo(nx + 5, b.y); g.lineTo(nx, b.y - 5); }
      else { g.moveTo(nx - 5, b.y + b.h); g.lineTo(nx + 5, b.y + b.h); g.lineTo(nx, b.y + b.h + 5); }
      g.fill();
      g.fillStyle = k.state === 'wrong' ? '#FFB3BE' : C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
      k.lines.forEach((l, i) => { ctx.fitText(g, l, b.w - 10, fs, F.body, '700'); g.fillText(l, b.x + b.w / 2, b.y + 4 + fs * 1.1 * (i + 0.5) + 1); });
      g.restore();
    }

    function drawEnemy(e) {
      if (e.dead) return;
      const ghost = e.mode === 'ghost';
      const sc = (1 + e.inflate * 0.28) * (0.4 + 0.6 * e.appear);
      const r = CELL * 0.34;
      g.save(); g.translate(e.x, e.y); g.scale(sc, sc);
      g.globalAlpha = ghost ? 0.55 : e.appear;
      const col = e.inflate ? mix(e.hue, '#FFFFFF', e.inflate * 0.22) : e.hue;
      if (!ghost) {
        g.fillStyle = col; g.beginPath();
        for (let i = 0; i <= 20; i++) {
          const a = i / 20 * Math.PI * 2, rr = r * (1 + (RM ? 0 : 0.07 * Math.sin(a * 4 + t * 6 + e.wob)));
          const px = Math.cos(a) * rr, py = Math.sin(a) * rr * (a > 0 && a < Math.PI ? 1.05 : 0.95);
          i ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.fill();
        // little feet
        g.fillRect(-r * 0.7, r * 0.75, r * 0.4, r * 0.3); g.fillRect(r * 0.3, r * 0.75, r * 0.4, r * 0.3);
      } else {
        g.strokeStyle = e.hue; g.lineWidth = 2; g.setLineDash([4, 4]);
        g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.setLineDash([]);
      }
      // eyes look at the player
      const ang = Math.atan2(player.y - e.y, player.x - e.x), ex = Math.cos(ang) * 2.2, ey = Math.sin(ang) * 2.2;
      g.fillStyle = '#FFFFFF';
      g.beginPath(); g.arc(-r * 0.38, -r * 0.15, r * 0.3, 0, 7); g.arc(r * 0.38, -r * 0.15, r * 0.3, 0, 7); g.fill();
      g.fillStyle = '#0B1222';
      g.beginPath(); g.arc(-r * 0.38 + ex, -r * 0.15 + ey, r * 0.14, 0, 7); g.arc(r * 0.38 + ex, -r * 0.15 + ey, r * 0.14, 0, 7); g.fill();
      if (e.inflate) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.globalAlpha = 0.5; g.beginPath(); g.arc(0, 0, r * 1.15, -2.4, -1.6); g.stroke(); }
      g.restore();
    }
    function mix(a, b, k) {
      const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
      const ch = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
      return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
    }

    function drawBeam() {
      const b = beam, a = 1 - b.t / 0.2;
      const len = Math.hypot(b.ex - b.sx, b.ey - b.sy), ux = (b.ex - b.sx) / (len || 1), uy = (b.ey - b.sy) / (len || 1);
      const shown = Math.min(1, b.t / 0.07) * len;
      g.save(); g.globalAlpha = Math.max(0, a);
      g.strokeStyle = C.mint; g.lineWidth = 3; g.shadowColor = C.mint; g.shadowBlur = 10; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(b.sx, b.sy);
      const n = Math.max(2, Math.floor(shown / 8));
      for (let i = 1; i <= n; i++) { const d = shown * i / n, off = (i % 2 ? 5 : -5) * (i === n ? 0 : 1); g.lineTo(b.sx + ux * d - uy * off, b.sy + uy * d + ux * off); }
      g.stroke();
      if (b.hit) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(b.ex, b.ey, 6, 0, 7); g.fill(); }
      g.restore();
    }

    function drawPlayer() {
      const blink = player.inv > 0 && Math.floor(player.inv * 10) % 2 === 0;
      if (blink && phase !== 'over') return;
      const [dx, dy] = DIRS[player.dir];
      const bob = player.mv ? Math.sin(player.bob) * 1.6 : 0;
      const x = player.x, y = player.y + bob, r = CELL * 0.3;
      g.save(); g.translate(x, y);
      // treads
      g.fillStyle = '#24325A'; ctx.roundRect(g, -r * 0.95, r * 0.55, r * 1.9, r * 0.55, 4); g.fill();
      g.fillStyle = C.dim; for (let i = -2; i <= 2; i++) g.fillRect(i * r * 0.36 - 1.5 + (player.mv ? (player.bob * 2) % (r * 0.36) - r * 0.18 : 0), r * 0.68, 3, r * 0.3);
      // body
      g.fillStyle = '#E8F0FF'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
      g.fillStyle = C.carolina; g.beginPath(); g.arc(0, 0, r, 0.15 * Math.PI, 0.85 * Math.PI); g.fill();
      // visor faces the direction of travel
      g.fillStyle = C.gold;
      const vx = dx * r * 0.45, vy = dy * r * 0.45 - (dy ? 0 : r * 0.15);
      ctx.roundRect(g, vx - r * 0.5, vy - r * 0.3, r * 1.0, r * 0.55, 5); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(vx - r * 0.35, vy - r * 0.2, r * 0.25, r * 0.12);
      // antenna (dendrite) with a glowing tip
      g.strokeStyle = '#E8F0FF'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-r * 0.3, -r * 0.85); g.lineTo(-r * 0.55, -r * 1.45); g.moveTo(-r * 0.45, -r * 1.2); g.lineTo(-r * 0.15, -r * 1.45); g.stroke();
      g.fillStyle = C.spark; g.beginPath(); g.arc(-r * 0.55, -r * 1.5, 3, 0, 7); g.fill();
      if (!RM) { g.globalAlpha = 0.35 + 0.3 * Math.sin(t * 6); g.beginPath(); g.arc(-r * 0.55, -r * 1.5, 6, 0, 7); g.fill(); g.globalAlpha = 1; }
      // drill nub in front
      g.fillStyle = C.dim;
      g.save(); g.rotate(Math.atan2(dy, dx)); g.beginPath(); g.moveTo(r * 0.9, -r * 0.3); g.lineTo(r * 1.35, 0); g.lineTo(r * 0.9, r * 0.3); g.fill(); g.restore();
      g.restore();
    }

    function drawBanner() {
      const b = banner, k = b.t / b.dur;
      const a = k < 0.12 ? k / 0.12 : k > 0.85 ? (1 - k) / 0.15 : 1;
      g.save(); g.globalAlpha = Math.max(0, a);
      g.textBaseline = 'middle';
      if (b.kind === 'read') {
        // slim reading banner in the sky strip so it never hides a crystal label
        const side = player.x < W / 2 ? 'right' : 'left';
        const avail = (side === 'left' ? player.x : W - player.x) - CELL * 0.7 - 8;
        const fs = ctx.fitText(g, b.text, avail - 20, Math.max(16, 13 / cssScale()), F.display, '400');
        const bw = g.measureText(b.text).width + 20, bx = side === 'left' ? 8 : W - bw - 8, bh = fs * 1.6, by = SURF / 2 - bh / 2 - 1;
        ctx.roundRect(g, bx, by, bw, bh, 8); g.fillStyle = 'rgba(8,13,26,.85)'; g.fill();
        g.strokeStyle = b.c; g.lineWidth = 1.5; g.stroke();
        g.textAlign = 'left'; g.fillStyle = b.c; g.fillText(b.text, bx + 10, by + bh / 2);
        if (readT > 0) { g.fillStyle = b.c; g.fillRect(bx + 8, by + bh - 4, (bw - 16) * Math.max(0, readT / READ_T), 2.5); }
      } else {
        const y = SURF + (H - SURF) * 0.4;
        g.fillStyle = 'rgba(8,13,26,.82)'; g.fillRect(0, y - 40, W, 84);
        g.textAlign = 'center';
        ctx.fitText(g, b.text, W - 30, 34, F.display, '400');
        g.fillStyle = b.c; g.fillText(b.text, W / 2, y - 10);
        g.font = `700 ${Math.max(15, 14 / cssScale())}px ${F.body}`; g.fillStyle = C.ink;
        g.fillText(b.sub, W / 2, y + 22);
      }
      g.restore();
    }

    /* ---------- input ---------- */
    const keyMap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
    function press(dir) { const i = heldStack.indexOf(dir); if (i >= 0) heldStack.splice(i, 1); heldStack.push(dir); path = []; pathTarget = null; }
    function release(dir) { const i = heldStack.indexOf(dir); if (i >= 0) heldStack.splice(i, 1); }
    function onKey(e) {
      if (!ctx.isActive() || finished) return;
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      const outsideBtn = (tag === 'BUTTON' || tag === 'A') && !root.contains(e.target);
      const k = keyMap[e.key];
      if (k) { e.preventDefault(); if (!e.repeat) press(k); return; }
      if (e.key === ' ' || e.key === 'Enter') {
        if (outsideBtn) return;
        e.preventDefault();
        if (!e.repeat) zap();
      }
    }
    function onKeyUp(e) { const k = keyMap[e.key]; if (k) release(k); }
    function onBlur() { heldStack.length = 0; }

    let tapId = null;
    function cellFromPoint(p) {
      // tapping a label walks to its crystal
      for (const k of crystals) { if (k.state !== 'buried') continue; const b = k.tag; if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return [k.c, k.r]; }
      return [Math.floor(p.x / CELL), p.y < SURF ? -1 : Math.floor((p.y - SURF) / CELL)];
    }
    function onDown(e) {
      if (!ctx.isActive() || finished) return;
      e.preventDefault();
      tapId = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      const [c, r] = cellFromPoint(st.toLogical(e));
      heldStack.length = 0;
      walkTo(c, r);
      sfx.tap();
    }
    function onMove(e) {
      if (tapId !== e.pointerId) return;
      const [c, r] = cellFromPoint(st.toLogical(e));
      walkTo(c, r);
    }
    function onUp(e) { if (tapId === e.pointerId) tapId = null; }

    const padBtns = [[bU, 'up'], [bD, 'down'], [bL, 'left'], [bR, 'right']];
    const padHandlers = [];
    padBtns.forEach(([b, dir]) => {
      let viaPointer = false;
      const down = e => { e.preventDefault(); viaPointer = true; try { b.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } b.classList.add('on'); press(dir); };
      const up = () => { b.classList.remove('on'); release(dir); };
      const click = () => { if (viaPointer) { viaPointer = false; return; } press(dir); later(0.05, () => release(dir)); };
      b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up); b.addEventListener('click', click);
      b.addEventListener('contextmenu', ev => ev.preventDefault());
      padHandlers.push([b, down, up, click]);
    });
    let zapViaPointer = false;
    const zapDown = e => { e.preventDefault(); zapViaPointer = true; bZ.classList.add('on'); zap(); };
    const zapUp = () => bZ.classList.remove('on');
    const zapClick = () => { if (zapViaPointer) { zapViaPointer = false; return; } zap(); };
    bZ.addEventListener('pointerdown', zapDown); bZ.addEventListener('pointerup', zapUp); bZ.addEventListener('pointercancel', zapUp); bZ.addEventListener('click', zapClick);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // read-only hooks for automated tests
    root._dig = {
      state: () => ({ phase, found, hearts, score, timeLeft, readT, player: { c: player.c, r: player.r, moving: !!player.mv, dir: player.dir }, crystals: crystals.map(k => ({ c: k.c, r: k.r, s: k.term.s, correct: k.correct, state: k.state, tag: k.tag })), enemies: enemies.map(e => ({ c: e.c, r: e.r, mode: e.mode, dead: e.dead, inflate: e.inflate, x: e.x, y: e.y })), path: path.length, W, H, CELL, SURF }),
      walkTo, cellCenter: (c, r) => [cx(c), cy(r)],
      calm: () => { enemies.forEach(e => { e.dead = true; e.respawn = 9999; }); },
      placeEnemy: (c, r) => { const e = spawnEnemy(); dug[r][c] = true; Object.assign(e, { c, r, x: cx(c), y: cy(r), mv: null, mode: 'walk', ghostIn: 999, appear: 1, frozen: true }); return enemies.indexOf(e); },
      setTime: s => { timeLeft = s; },
      open: (c, r) => { dug[r][c] = true; },
      face: d => { player.dir = d; }
    };

    /* ---------- start ---------- */
    paintHearts(); paintTime();
    newPrompt(true);
    spawnEnemy();
    const lp = ctx.loop(dt => { update(dt); draw(); });

    return () => {
      lp.stop();
      st.destroy();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      padHandlers.forEach(([b, down, up, click]) => { b.removeEventListener('pointerdown', down); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up); b.removeEventListener('lostpointercapture', up); b.removeEventListener('click', click); });
      bZ.removeEventListener('pointerdown', zapDown); bZ.removeEventListener('pointerup', zapUp); bZ.removeEventListener('pointercancel', zapUp); bZ.removeEventListener('click', zapClick);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      timers.length = 0; heldStack.length = 0;
      delete root._dig;
    };
  }
});
})();
