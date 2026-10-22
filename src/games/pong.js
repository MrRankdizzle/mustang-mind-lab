/* Synapse Pong — vertical pong. Bounce the neurotransmitter past the reuptake pump into the receptor zone with the matching term. */
(function () {
'use strict';
const P = 'pong';

/* ================= shared arcade kit (each g1 game file keeps its own copy) ================= */
const PAUSE_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>';
function kitCSS(p) {
  return `
.${p}-root { position: relative; }
.${p}-root .${p}-hud { flex-wrap: nowrap; gap: 6px 14px; padding: 0 2px 8px; justify-content: flex-start; min-height: 38px; }
.${p}-hs { display: flex; align-items: baseline; gap: 6px; white-space: nowrap; }
.${p}-hs small { font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--arc-dim); }
.${p}-hs b { font-size: 15px; }
.${p}-hud .${p}-score { font-family: var(--f-display); font-weight: 400; color: var(--arc-gold); font-size: 21px; letter-spacing: .02em; display: inline-block; }
.${p}-score.bump { animation: ${p}-bump .35s ease; }
@keyframes ${p}-bump { 40% { transform: scale(1.25); color: #fff; } }
.${p}-lives { display: flex; gap: 3px; margin-left: auto; align-items: center; }
.${p}-lives span { display: grid; width: 19px; height: 19px; transition: opacity .3s, transform .3s; }
.${p}-lives svg { width: 100%; height: 100%; }
.${p}-lives .off { opacity: .2; transform: scale(.8); }
.${p}-lives .lost { animation: ${p}-lost .6s ease; }
@keyframes ${p}-lost { 0% { opacity: 1; transform: scale(1.5); } 30% { transform: scale(1.3) rotate(-12deg); } 60% { transform: scale(1) rotate(10deg); } }
.${p}-pause { width: 36px; height: 30px; border-radius: 9px; border: 1px solid var(--arc-line); background: var(--arc-panel); color: var(--arc-ink); display: grid; place-items: center; cursor: pointer; flex: none; padding: 0; }
.${p}-pause:hover { border-color: var(--arc-blue); }
.${p}-root .${p}-prompt { position: relative; margin: 8px 0 10px; padding: 12px 14px 10px; font-size: 17px; line-height: 1.38; transition: border-color .2s, box-shadow .2s; }
.${p}-prompt .tag { position: absolute; top: -8px; left: 12px; background: var(--arc-bg); padding: 0 6px; line-height: 16px; border-radius: 4px; }
.${p}-prompt.good { border-color: var(--arc-mint); box-shadow: 0 0 0 2px rgba(53,227,167,.22); }
.${p}-prompt.miss { border-color: var(--arc-spark); box-shadow: 0 0 0 2px rgba(255,107,129,.25); }
.${p}-prompt .${p}-ptext { display: block; }
.${p}-prompt.fresh .${p}-ptext { animation: ${p}-in .4s ease; }
@keyframes ${p}-in { from { opacity: 0; transform: translateY(5px); } }
.reduce-motion .${p}-prompt.fresh .${p}-ptext, .reduce-motion .${p}-score.bump, .reduce-motion .${p}-lives .lost { animation: none; }
.${p}-root .${p}-pad { display: none; }
@media (any-pointer: coarse), (max-width: 700px) { .${p}-root .${p}-pad { display: flex; } }
.${p}-pad { flex-wrap: nowrap; }
.${p}-pad button { flex: 1 1 0; max-width: 130px; min-width: 0; font-family: var(--f-display); font-weight: 400; font-size: 18px; letter-spacing: .04em; }
.${p}-pad button.on { background: var(--arc-line); border-color: var(--arc-blue); }
@media (max-width: 700px) and (max-height: 760px) {
  .${p}-root .${p}-prompt { font-size: 16px; line-height: 1.3; padding: 10px 12px 8px; margin-bottom: 8px; }
  .${p}-root .${p}-hud { min-height: 34px; padding-bottom: 4px; }
}
.${p}-root .${p}-pad.${p}-pad-off { display: none; }
@media (max-width: 420px) {
  .${p}-root .${p}-hud { gap: 4px 10px; }
  .${p}-hs small { font-size: 9.5px; letter-spacing: .08em; }
  .${p}-hs-score small, .${p}-root .${p}-hs-streak { display: none; }
}`;
}
function injectCSS(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.append(s);
}
/* Lay a label out in 1 or 2 lines at the largest size ≥ min that fits maxW.
   Long single words (Mechanoreceptors) get hyphenated at a word part before the text would shrink below min. */
const MORPH = ['receptor', 'transmit', 'chromat', 'sympath', 'sensor', 'physic', 'agnos', 'polar', 'thalam', 'campus', 'choline', 'ambul', 'social', 'neural', 'epineph', 'scious', 'modat', 'tropic', 'active', 'genetic', 'nergic', 'tasters', 'lateral', 'process', 'synth', 'plastic', 'cognit'];
function layoutLabel(g, text, maxW, size, min, family) {
  const wid = (s, t) => { g.font = `700 ${s}px ${family}`; return g.measureText(t).width; };
  const cuts = [];
  for (let i = 1; i < text.length - 1; i++) {
    if (text[i] === ' ') cuts.push([text.slice(0, i), text.slice(i + 1)]);
    else if (text[i] === '-' || text[i] === '/') cuts.push([text.slice(0, i + 1), text.slice(i + 1)]);
  }
  for (let s = size; s >= min; s--) {
    const w1 = wid(s, text);
    if (w1 <= maxW) return { lines: [text], size: s, w: w1 };
    let best = null;
    for (const c of cuts) { const w = Math.max(wid(s, c[0]), wid(s, c[1])); if (w <= maxW && (!best || w < best.w)) best = { lines: c, size: s, w }; }
    if (best) return best;
  }
  const V = /[aeiouy]/i, L = /[a-z]/i, hy = [];
  for (let i = 3; i <= text.length - 3; i++) {
    const a = text[i - 1], b = text[i], c = text[i + 1] || '';
    if (!L.test(a) || !L.test(b)) continue;
    const rest = text.slice(i).toLowerCase();
    const sc = MORPH.some(m => rest.startsWith(m)) ? 2 : (V.test(a) && !V.test(b) && V.test(c)) ? 1 : 0;
    if (sc) hy.push({ i, sc });
  }
  for (let s = size; s >= min; s--) {
    let best = null;
    for (const { i, sc } of hy) {
      const l1 = text.slice(0, i) + '-', l2 = text.slice(i);
      const w = Math.max(wid(s, l1), wid(s, l2));
      if (w <= maxW && (!best || sc > best.sc || (sc === best.sc && w < best.w))) best = { lines: [l1, l2], size: s, w, sc };
    }
    if (best) return best;
  }
  let s = min; while (s > 9 && wid(s, text) > maxW) s--;
  return { lines: [text], size: s, w: Math.min(maxW, wid(s, text)) };
}
function makeKit(el, ctx, o) {
  const { h } = ctx;
  const p = o.prefix, RM = !!ctx.reduceMotion, C = ctx.colors, F = ctx.fonts;
  const offs = [], timers = [];
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); };
  const later = (fn, ms) => { const id = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(id); return id; };
  let dead = false, ended = false, paused = false;
  const active = () => !dead && !ended;
  const modalOpen = () => !!document.querySelector('.modal-back');

  const root = h('div', { class: p + '-root' });
  const scoreB = h('b', { class: p + '-score' }, '0');
  const hud = h('div', { class: 'arc-hud ' + p + '-hud' }, h('span', { class: p + '-hs ' + p + '-hs-score' }, h('small', null, 'Score'), scoreB));
  const stat = {};
  (o.stats || []).forEach(([k, label, v]) => { const b = h('b', null, v); stat[k] = b; hud.append(h('span', { class: p + '-hs ' + p + '-hs-' + k }, h('small', null, label), b)); });
  const lifeBox = h('span', { class: p + '-lives', role: 'img' });
  const pauseBtn = h('button', { type: 'button', class: p + '-pause', 'aria-label': 'Pause game', 'aria-pressed': 'false' });
  pauseBtn.innerHTML = PAUSE_SVG;
  hud.append(lifeBox, pauseBtn);
  const ptext = h('span', { class: p + '-ptext' });
  const prompt = h('div', { class: 'arc-prompt ' + p + '-prompt', 'aria-live': 'polite' }, h('span', { class: 'tag' }, o.tag || 'Definition'), ptext);
  root.append(hud, prompt);
  const pad = o.pad ? h('div', { class: 'touch-pad ' + p + '-pad' }) : null;
  if (pad) root.append(pad);
  el.append(root);

  /* ---- HUD + prompt ---- */
  let shownLives = -1;
  function setLives(n, max) {
    lifeBox.innerHTML = '';
    for (let i = 0; i < max; i++) {
      const s = h('span', { class: i < n ? 'on' : (i === n && shownLives > n ? 'off lost' : 'off') });
      s.innerHTML = o.lifeIcon; lifeBox.append(s);
    }
    shownLives = n;
    lifeBox.setAttribute('aria-label', `${n} of ${max} ${o.lifeName || 'lives'} left`);
  }
  function setScore(v) { scoreB.textContent = v; scoreB.classList.remove('bump'); void scoreB.offsetWidth; scoreB.classList.add('bump'); }
  function setPrompt(text) {
    ptext.textContent = text;
    prompt.classList.remove('fresh', 'good', 'miss'); void prompt.offsetWidth; prompt.classList.add('fresh');
  }
  function markPrompt(cls) { prompt.classList.remove('good', 'miss'); if (cls) prompt.classList.add(cls); }

  /* ---- sizing: the prompt keeps the height of the longest definition in play so nothing jumps;
         the canvas then takes whatever height is left (phones scroll the cabinet up under the app bar).
         On phones the logical height adapts so the canvas can use the full width. ---- */
  let lastPW = 0;
  function sizePrompt() {
    const w = prompt.offsetWidth; if (!w || w === lastPW) return; lastPW = w;
    const m = prompt.cloneNode(true);
    m.removeAttribute('aria-live'); m.classList.remove('fresh');
    m.style.cssText = `position:absolute;left:0;top:0;width:${w}px;min-height:0;visibility:hidden;pointer-events:none;margin:0`;
    root.append(m);
    const t = m.querySelector('.' + p + '-ptext'); let max = 0;
    for (const d of o.defs) { t.textContent = d; max = Math.max(max, m.offsetHeight); }
    m.remove(); prompt.style.minHeight = max + 'px';
  }
  const padShown = () => !!pad && getComputedStyle(pad).display !== 'none';
  const padH = () => (pad && pad.offsetHeight > 30 ? pad.offsetHeight : 66) + 10;
  function geo() {
    const tab = document.querySelector('.tabbar');
    const tabH = tab && getComputedStyle(tab).display !== 'none' ? tab.offsetHeight : 0;
    const shell = el.closest('.game-shell') || root;
    const bar = document.querySelector('.appbar');
    const barB = bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
    const gameMode = innerWidth <= 700 || innerHeight <= 640;
    const sy = gameMode ? Math.max(0, shell.getBoundingClientRect().top + scrollY - barB - 8) : scrollY;
    return { tabH, sy, gameMode };
  }
  const availFrom = (topDoc, G) => innerHeight - G.tabH - (topDoc - G.sy) - (padShown() ? padH() : 0) - 18;
  sizePrompt();
  let H = o.H;
  if (o.adaptH) {
    const G = geo(), top = prompt.getBoundingClientRect().bottom + 10 + scrollY, dispW = root.clientWidth || o.W;
    let want = availFrom(top, G) * o.W / dispW;
    if (want < o.minH && padShown() && o.padOptional) { pad.classList.add(p + '-pad-off'); want = availFrom(top, G) * o.W / dispW; }
    H = Math.round(Math.max(o.minH, Math.min(o.H, want)));
    if (o.snapH) H = Math.max(o.snapH, Math.floor(H / o.snapH) * o.snapH);
  }
  const st = ctx.stage(root, o.W, H, { label: o.label, reserve: o.reserve || 330 });
  if (pad) root.insertBefore(st.wrap, pad);
  function fit() {
    if (dead) return;
    sizePrompt();
    const G = geo();
    const avail = availFrom(st.wrap.getBoundingClientRect().top + scrollY, G);
    const mw = Math.max(o.minW || 280, Math.floor(avail * o.W / H));
    st.wrap.style.maxWidth = mw + 'px';
    if (G.gameMode && Math.abs(scrollY - G.sy) > 2) window.scrollTo(0, G.sy);
  }
  on(window, 'resize', () => { lastPW = 0; fit(); });
  let ro = null;
  if (window.ResizeObserver) { let lastH = 0; ro = new ResizeObserver(() => { const hh = hud.offsetHeight + prompt.offsetHeight; if (hh !== lastH) { lastH = hh; fit(); } }); ro.observe(hud); ro.observe(prompt); }
  fit();
  requestAnimationFrame(() => fit());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) { lastPW = 0; fit(); } });

  /* ---- keyboard: only game keys, only while the round is live ---- */
  const held = new Set();
  const KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ' ': 'fire', Spacebar: 'fire', Enter: 'fire', p: 'pause', P: 'pause', Escape: 'pause' };
  const typing = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  on(window, 'keydown', e => {
    if (!active() || e.ctrlKey || e.metaKey || e.altKey || typing(e.target) || modalOpen()) return;
    const k = KEYS[e.key]; if (!k) return;
    e.preventDefault();
    if (k === 'pause') { if (!e.repeat) setPaused(!paused); return; }
    if (paused) { if (k === 'fire' && !e.repeat) setPaused(false); return; }
    if (!held.has(k)) { held.add(k); o.onKey && o.onKey(k, true); }
  });
  on(window, 'keyup', e => { const k = KEYS[e.key]; if (k && held.has(k)) { held.delete(k); o.onKey && o.onKey(k, false); } });
  on(window, 'blur', () => { held.clear(); o.onBlur && o.onBlur(); });

  /* ---- pause ---- */
  function setPaused(v) {
    if (v && !active()) return;
    if (paused === v) return;
    paused = v; held.clear(); o.onBlur && o.onBlur();
    pauseBtn.setAttribute('aria-pressed', String(v)); pauseBtn.setAttribute('aria-label', v ? 'Resume game' : 'Pause game');
    pauseBtn.innerHTML = v ? PLAY_SVG : PAUSE_SVG;
    if (!v) ctx.sfx.tap();
  }
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  on(document, 'visibilitychange', () => { if (document.hidden) setPaused(true); else if (loop) loop.resume(); });
  on(st.canvas, 'pointerdown', e => { if (paused) { e.preventDefault(); e.stopImmediatePropagation(); setPaused(false); } });
  function drawPause(g) {
    g.save(); g.fillStyle = 'rgba(8,13,26,.74)'; g.fillRect(0, 0, o.W, H);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = C.gold; g.font = `400 ${o.W < 420 ? 32 : 42}px ${F.display}`; g.fillText('PAUSED', o.W / 2, H / 2 - 16);
    g.fillStyle = C.ink; g.font = `700 16px ${F.body}`; g.fillText('Tap or press Space to resume', o.W / 2, H / 2 + 24);
    g.restore();
  }

  /* ---- juice ---- */
  const fx = { parts: [], pops: [], rings: [], flash: 0, flashC: '#fff', shake: 0 };
  fx.burst = (x, y, n, cols, spd = 170, size = 3, grav = 0) => {
    if (RM) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = spd * (0.3 + Math.random() * 0.8);
      fx.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 0.45 + Math.random() * 0.5, c: cols[i % cols.length], r: size * (0.6 + Math.random() * 0.8), grav });
    }
  };
  fx.ring = (x, y, color, max = 44) => { if (!RM) fx.rings.push({ x, y, color, max, t: 0 }); };
  fx.pop = (x, y, text, color, size = 19) => fx.pops.push({ x, y, text, color, size, t: 0 });
  fx.flashIt = (c, a = 0.26) => { if (!RM) { fx.flash = a; fx.flashC = c; } };
  fx.shakeIt = a => { if (!RM) fx.shake = Math.max(fx.shake, a); };
  fx.update = dt => {
    for (const q of fx.parts) { q.life += dt; const d = Math.max(0, 1 - 2.4 * dt); q.vx *= d; q.vy = q.vy * d + q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    fx.parts = fx.parts.filter(q => q.life < q.max);
    for (const r of fx.rings) r.t += dt; fx.rings = fx.rings.filter(r => r.t < 0.5);
    for (const q of fx.pops) q.t += dt; fx.pops = fx.pops.filter(q => q.t < 1.05);
    fx.flash = Math.max(0, fx.flash - dt * 1.5); fx.shake = Math.max(0, fx.shake - dt * 28);
  };
  fx.offset = () => fx.shake > 0.3 ? [(Math.random() * 2 - 1) * fx.shake, (Math.random() * 2 - 1) * fx.shake] : [0, 0];
  fx.draw = g => {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const q of fx.parts) { const k = 1 - q.life / q.max; g.globalAlpha = k; g.fillStyle = q.c; g.beginPath(); g.arc(q.x, q.y, q.r * (0.4 + k * 0.6), 0, 6.283); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    for (const r of fx.rings) { const k = r.t / 0.5; g.globalAlpha = 1 - k; g.strokeStyle = r.color; g.lineWidth = 4 * (1 - k) + 1; g.beginPath(); g.arc(r.x, r.y, 6 + r.max * k, 0, 6.283); g.stroke(); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (const q of fx.pops) {
      const k = q.t; g.globalAlpha = k < 0.72 ? 1 : Math.max(0, 1 - (k - 0.72) / 0.33);
      g.font = `400 ${q.size}px ${F.display}`;
      const hw = g.measureText(q.text).width / 2 + 4;
      const x = Math.max(hw, Math.min(o.W - hw, q.x));
      const y = q.y - (RM ? 0 : 30 * Math.min(1, k * 1.8));
      g.lineWidth = 5; g.strokeStyle = 'rgba(11,18,34,.9)'; g.strokeText(q.text, x, y);
      g.fillStyle = q.color; g.fillText(q.text, x, y);
    }
    g.restore();
  };
  fx.drawFlash = g => { if (fx.flash > 0) { g.save(); g.globalAlpha = fx.flash; g.fillStyle = fx.flashC; g.fillRect(0, 0, o.W, H); g.restore(); } };

  /* ---- loop ---- */
  let loop = null;
  loop = ctx.loop((dt, t) => {
    if (dead) return;
    if (!paused && active() && modalOpen()) setPaused(true);
    if (!paused && active()) o.update(dt, t / 1000);
    if (!paused) fx.update(dt);
    o.draw(st.g, t / 1000);
    if (paused) drawPause(st.g);
  });

  function end(res) {
    if (ended || dead) return;
    ended = true; held.clear(); loop.stop();
    ctx.finish(res);
  }
  function destroy() {
    if (dead) return; dead = true;
    loop.stop(); offs.forEach(f => f()); timers.forEach(clearTimeout); st.destroy(); if (ro) ro.disconnect();
  }
  return {
    root, hud, stat, st, pad, fx, H, held, on, later, RM, setScore, setLives, setPrompt, markPrompt, fit, end, destroy, setPaused,
    get paused() { return paused; }, get active() { return active(); }
  };
}
/* ================= end kit ================= */

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6s-7.6-4.6-9.6-9.4C.9 7.5 3.2 4 6.8 4c2.1 0 3.9 1.2 5.2 3 1.3-1.8 3.1-3 5.2-3 3.6 0 5.9 3.5 4.4 7.2-2 4.8-9.6 9.4-9.6 9.4z" fill="#FF6B81"/></svg>';

const ART = `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<rect width="250" height="112" fill="#0B1222"/>
<rect x="0" y="14" width="83" height="22" fill="#121C33"/><rect x="83" y="14" width="84" height="22" fill="#2A2410"/><rect x="167" y="14" width="83" height="22" fill="#121C33"/>
<path d="M2 36h79" stroke="#B79CF6" stroke-width="2.4"/><path d="M85 36h80" stroke="#FFD166" stroke-width="2.4"/><path d="M169 36h79" stroke="#FF9F5A" stroke-width="2.4"/>
<path d="M83 14v22M167 14v22" stroke="#24325A" stroke-width="2"/>
<g font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="700" font-size="10" text-anchor="middle"><text x="41.5" y="29" fill="#E8F0FF">GABA</text><text x="125" y="29" fill="#FFD166">Serotonin</text><text x="208.5" y="29" fill="#E8F0FF">Glutamate</text></g>
<rect x="160" y="46" width="40" height="7" rx="3.5" fill="#FF6B81"/>
<path d="M0 68h250" stroke="#24325A" stroke-width="1.5" stroke-dasharray="6 6"/>
<g fill="#35E3A7"><circle cx="86" cy="84" r="2" opacity=".35"/><circle cx="95" cy="74" r="2.4" opacity=".5"/><circle cx="104" cy="64" r="2.8" opacity=".7"/></g>
<circle cx="114" cy="54" r="10" fill="#35E3A7" opacity=".22"/><circle cx="114" cy="54" r="5.5" fill="#FFD166"/><circle cx="112.5" cy="52.5" r="1.8" fill="#fff"/>
<path d="M118 46l5-7" stroke="#FFD166" stroke-width="1.5" stroke-dasharray="2 3"/>
<rect x="54" y="88" width="56" height="9" rx="4.5" fill="#4B9CD3"/><rect x="72" y="90" width="20" height="5" rx="2.5" fill="#35E3A7"/>
</svg>`;

ML.registerGame({
  id: 'pong', title: 'Synapse Pong', kind: 'arcade',
  blurb: 'Fire a neurotransmitter across the synapse. Dodge the reuptake pump and land it in the receptor that matches the definition.',
  how: [
    'Read the definition. The top of the screen has 3 receptors, each labeled with a term.',
    'Bounce the glowing neurotransmitter into the matching receptor. Where it hits your paddle sets the angle, so aim with the edges.',
    'Move with ← → or A / D, or drag on the screen. Press Space or tap to launch.',
    'A wrong receptor or a missed ball costs a heart. Land 10 matches to win. Lose 3 hearts and the round ends.'
  ],
  art: ART,
  mount(el, ctx) {
    injectCSS(P + '-css', kitCSS(P));
    const C = ctx.colors, F = ctx.fonts, sfx = ctx.sfx, U = ctx.util, RM = !!ctx.reduceMotion;
    const narrow = (el.clientWidth || innerWidth) < 600;
    const W = narrow ? 360 : 560;
    const ZONE_H = narrow ? 58 : 60, CPU_Y = ZONE_H + (narrow ? 58 : 64);
    const PW = narrow ? 80 : 100, PH = 12, CPUW = narrow ? 64 : 82, BR = 7;
    const GOAL = 10, HEARTS = 3, LABEL = narrow ? 15 : 17;
    const ZW = W / 3;
    const ZCOL = [C.violet, C.blue, C.orange];
    const pool = ctx.terms.length >= 4 ? ctx.terms : ctx.allTerms;

    const kit = makeKit(el, ctx, {
      prefix: P, W, H: narrow ? 560 : 540, minH: 440, adaptH: narrow, label: 'Synapse Pong game screen', pad: false, lifeIcon: HEART, lifeName: 'hearts',
      stats: [['goal', 'Matches', `0/${GOAL}`], ['streak', 'Streak', '0']],
      defs: pool.map(t => t.d), update, draw, onKey
    });
    const g = kit.st.g, fx = kit.fx, canvas = kit.st.canvas, H = kit.H;
    const PLAYER_Y = H - 36;

    const S = {
      score: 0, hearts: HEARTS, correct: 0, total: 0, streak: 0, bestStreak: 0,
      item: null, zones: [], mode: 'serve', resT: 0, res: null, over: false, won: false, endT: 0, banner: null,
      px: W / 2, targetX: null, cpuX: W / 2, cpuGoal: W / 2, cpuDelay: 0, cpuV: 0,
      ball: { x: W / 2, y: PLAYER_Y - PH / 2 - BR - 1, vx: 0, vy: 0, spd: 0 }, trail: [], rally: 0,
      aimT: Math.random() * 6, spin: 0, hintT: 5
    };
    const motes = Array.from({ length: narrow ? 26 : 36 }, () => ({ x: Math.random() * W, y: ZONE_H + Math.random() * (H - ZONE_H), r: 1 + Math.random() * 2.2, s: 4 + Math.random() * 10, p: Math.random() * 6 }));

    /* ---------- prompts ---------- */
    function newPrompt() {
      S.item = ctx.deck.next(3);
      S.zones = S.item.choices.map(term => ({ term, lab: layoutLabel(g, term.s, ZW - 12, LABEL, 13, F.body), glow: 0 }));
      kit.setPrompt(S.item.prompt);
      serve();
    }
    function ansZone() { return S.zones.findIndex(z => z.term.id === S.item.answer.id); }
    function baseSpeed() { return (narrow ? 330 : 360) * (1 + 0.03 * S.correct); }
    function serve() {
      S.mode = 'serve'; S.rally = 0; S.trail = [];
      S.ball.vx = S.ball.vy = 0; S.ball.spd = baseSpeed();
      S.cpuGoal = W / 2;
    }
    function launch() {
      if (S.mode !== 'serve' || S.over) return;
      const a = aimAngle();
      S.ball.spd = baseSpeed();
      S.ball.vx = Math.sin(a) * S.ball.spd; S.ball.vy = -Math.cos(a) * S.ball.spd;
      S.mode = 'play'; S.cpuDelay = 0.28; S.hintT = 0;
      sfx.fire();
      fx.burst(S.ball.x, S.ball.y, 10, [C.mint, C.gold], 120, 2.4);
    }
    // Serve aim sweeps back and forth; launch when the dotted path points where you want.
    function aimAngle() { return Math.sin(S.aimT * 1.7) * 0.92; }

    /* ---------- scoring ---------- */
    function hud() {
      kit.stat.goal.textContent = `${S.correct}/${GOAL}`;
      kit.stat.streak.textContent = S.streak > 1 ? '×' + S.streak : S.streak;
    }
    function addScore(n, x, y, color, label) { S.score += n; kit.setScore(S.score); fx.pop(x, y, label || '+' + n, color || C.gold); }
    function scoreZone(zi) {
      const ai = ansZone();
      const zx = zi * ZW + ZW / 2;
      S.total++;
      if (zi === ai) {
        S.correct++; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
        ctx.record(S.item, true);
        const pts = 100 + 15 * S.rally + 20 * Math.min(S.streak - 1, 8);
        addScore(pts, zx, ZONE_H + 34, C.gold);
        if (S.rally >= 2) fx.pop(zx, ZONE_H + 60, `${S.rally}-HIT RALLY`, C.mint, 13);
        fx.burst(S.ball.x, ZONE_H, 36, [C.mint, C.gold, '#ffffff', ZCOL[zi]], 240, 3.2);
        fx.ring(S.ball.x, ZONE_H, C.mint, 60); fx.flashIt(C.mint, 0.2); fx.shakeIt(3);
        sfx.good(); sfx.tone(1046, 0.18, 'triangle', 0.08, null, 0.12);
        kit.markPrompt('good');
        S.res = { zi, ai, ok: true, t: 0 }; S.resT = 1.3;
      } else {
        S.streak = 0;
        ctx.record(S.item, false);
        fx.burst(S.ball.x, ZONE_H, 18, [C.spark, '#ffffff'], 160, 2.6);
        fx.ring(S.ball.x, ZONE_H, C.spark, 40); fx.flashIt(C.spark, 0.22); fx.shakeIt(7);
        sfx.bad();
        fx.pop(zx, ZONE_H + 34, 'WRONG RECEPTOR', C.spark, 15);
        kit.markPrompt('miss');
        S.res = { zi, ai, ok: false, t: 0 }; S.resT = 2.3;
        loseHeart();
      }
      hud();
      S.mode = 'result';
    }
    function missBall() {
      S.total++; S.streak = 0;
      ctx.record(S.item, false);
      sfx.bad(); fx.flashIt(C.spark, 0.22); fx.shakeIt(6);
      fx.pop(U.clamp(S.ball.x, 60, W - 60), H - 70, 'MISSED', C.spark, 16);
      kit.markPrompt('miss');
      S.res = { zi: -1, ai: ansZone(), ok: false, t: 0 }; S.resT = 2.3;
      loseHeart(); hud();
      S.mode = 'result';
    }
    function loseHeart() { S.hearts--; kit.setLives(Math.max(0, S.hearts), HEARTS); }
    function afterResult() {
      if (S.hearts <= 0) return endRound(false);
      if (S.correct >= GOAL) return endRound(true);
      newPrompt();
    }
    function endRound(won) {
      S.over = true; S.won = won; S.endT = 1.7; S.mode = 'over';
      S.banner = won ? { text: 'SIGNAL SENT!', sub: `${GOAL} matches landed`, color: C.mint, t: 0 } : { text: 'GAME OVER', sub: `${S.correct} of ${GOAL} matches`, color: C.spark, t: 0 };
      if (won) sfx.level();
    }

    /* ---------- input ---------- */
    function onKey(k, down) {
      if (!down) return;
      if (k === 'fire' || k === 'up') launch();
      if (k === 'left' || k === 'right') S.targetX = null;
    }
    let ptr = null;
    kit.on(canvas, 'pointerdown', e => {
      if (!kit.active) return;
      e.preventDefault();
      const q = kit.st.toLogical(e);
      ptr = { id: e.pointerId, x0: q.x, y0: q.y, drag: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      if (e.pointerType !== 'mouse') S.targetX = U.clamp(q.x, PW / 2, W - PW / 2);
    });
    kit.on(canvas, 'pointermove', e => {
      if (!kit.active) return;
      const q = kit.st.toLogical(e);
      if (ptr && ptr.id === e.pointerId) {
        if (Math.hypot(q.x - ptr.x0, q.y - ptr.y0) > 12) ptr.drag = true;
        S.targetX = U.clamp(q.x, PW / 2, W - PW / 2);
      } else if (e.pointerType === 'mouse') S.targetX = U.clamp(q.x, PW / 2, W - PW / 2);
    });
    const endPtr = e => {
      if (!ptr || ptr.id !== e.pointerId) return;
      const tap = !ptr.drag; ptr = null;
      if (tap && e.type === 'pointerup' && S.mode === 'serve') launch();
    };
    kit.on(canvas, 'pointerup', endPtr); kit.on(canvas, 'pointercancel', endPtr);

    /* ---------- update ---------- */
    function update(dt) {
      if (S.banner) S.banner.t += dt;
      S.hintT -= dt; S.padFlash = Math.max(0, (S.padFlash || 0) - dt);
      for (const z of S.zones) z.glow = Math.max(0, z.glow - dt * 2);
      // player paddle
      const k = kit.held, spd = W * 1.05;
      const dirIn = (k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0);
      const prev = S.px;
      if (dirIn) S.px += dirIn * spd * dt;
      else if (S.targetX != null) { const d = S.targetX - S.px; S.px += Math.sign(d) * Math.min(Math.abs(d), W * 2.6 * dt); }
      S.px = U.clamp(S.px, PW / 2, W - PW / 2);
      S.pv = (S.px - prev) / Math.max(dt, 1e-3);

      if (S.over) { S.endT -= dt; if (S.endT <= 0) finish(); updateCPU(dt); return; }

      if (S.mode === 'serve') {
        S.aimT += dt;
        S.ball.x = S.px; S.ball.y = PLAYER_Y - PH / 2 - BR - 1;
      } else if (S.mode === 'play') {
        stepBall(dt);
      } else if (S.mode === 'result') {
        S.res.t += dt; S.resT -= dt;
        if (S.res.ok) { S.ball.x += (S.res.zi * ZW + ZW / 2 - S.ball.x) * Math.min(1, dt * 6); S.ball.y += (ZONE_H - 10 - S.ball.y) * Math.min(1, dt * 6); }
        if (S.resT <= 0) afterResult();
      }
      updateCPU(dt);
      // trail
      if (S.mode === 'play' && !RM) { S.trail.push({ x: S.ball.x, y: S.ball.y }); if (S.trail.length > 12) S.trail.shift(); }
      else if (S.trail.length) S.trail.shift();
    }
    function updateCPU(dt) {
      const b = S.ball;
      const cpuSpd = W * (0.25 + 0.012 * Math.min(S.correct, 10));
      if (S.mode === 'play' && b.vy < 0 && b.y > CPU_Y) {
        S.cpuDelay -= dt;
        if (S.cpuDelay <= 0) {
          // predict where the ball will cross the pump's line (with wall bounces), with some error
          const tt = (b.y - CPU_Y) / -b.vy;
          let x = b.x + b.vx * tt;
          const span = W - 2 * BR;
          x = x - BR; x = ((x % (2 * span)) + 2 * span) % (2 * span); if (x > span) x = 2 * span - x; x += BR;
          if (S.cpuAimFor !== S.rally) { S.cpuAimFor = S.rally; S.cpuErr = U.rand(-0.75, 0.75) * CPUW; }
          S.cpuGoal = x + S.cpuErr;
          S.cpuDelay = 0.12;
        }
      } else if (S.mode !== 'play' || b.vy > 0) {
        S.cpuGoal = W / 2 + Math.sin(performance.now() / 900) * W * 0.12;
      }
      const d = S.cpuGoal - S.cpuX;
      S.cpuX += Math.sign(d) * Math.min(Math.abs(d), cpuSpd * dt);
      S.cpuX = U.clamp(S.cpuX, CPUW / 2, W - CPUW / 2);
    }
    function stepBall(dt) {
      const b = S.ball;
      const dist = b.spd * dt, n = Math.max(1, Math.ceil(dist / 4)), h = dt / n;
      for (let i = 0; i < n; i++) {
        const py = b.y;
        b.x += b.vx * h; b.y += b.vy * h;
        if (b.x < BR) { b.x = BR; b.vx = Math.abs(b.vx); wallHit(); }
        if (b.x > W - BR) { b.x = W - BR; b.vx = -Math.abs(b.vx); wallHit(); }
        // reuptake pump (CPU) — blocks from below
        const cTop = CPU_Y + PH / 2 + BR;
        if (b.vy < 0 && py >= cTop && b.y < cTop && Math.abs(b.x - S.cpuX) <= CPUW / 2 + BR) {
          b.y = cTop;
          const off = U.clamp((b.x - S.cpuX) / (CPUW / 2), -1, 1);
          const a = off * 0.85 + U.rand(-0.18, 0.18);
          b.spd = Math.min(b.spd * 1.02, baseSpeed() * 1.7);
          b.vx = Math.sin(a) * b.spd; b.vy = Math.cos(a) * b.spd;
          fx.burst(b.x, cTop - 4, 10, [C.spark, '#ffffff'], 110, 2.2); fx.shakeIt(2);
          sfx.tone(260, 0.07, 'square', 0.05, 180);
          fx.pop(b.x, CPU_Y + 30, 'BLOCKED', C.spark, 12);
        }
        // player paddle
        const pTop = PLAYER_Y - PH / 2 - BR;
        if (b.vy > 0 && py <= pTop && b.y > pTop && Math.abs(b.x - S.px) <= PW / 2 + BR) {
          b.y = pTop;
          const off = U.clamp((b.x - S.px) / (PW / 2), -1, 1);
          const a = off * 1.08; // up to ~62°
          b.spd = Math.min(b.spd * 1.04, baseSpeed() * 1.7);
          b.vx = Math.sin(a) * b.spd; b.vy = -Math.cos(a) * b.spd;
          S.rally++; S.padFlash = 0.25;
          fx.burst(b.x, pTop + 4, 12, [C.blue, C.mint], 120, 2.2); fx.ring(b.x, pTop + 4, C.blue, 20);
          sfx.tone(520 + Math.min(S.rally, 8) * 40, 0.06, 'square', 0.05);
          S.cpuAimFor = -1;
        }
        // receptor line
        if (b.y - BR <= ZONE_H && b.vy < 0) { b.y = ZONE_H + BR; scoreZone(U.clamp(Math.floor(b.x / ZW), 0, 2)); return; }
        if (b.y - BR > H) { missBall(); return; }
      }
    }
    function wallHit() { sfx.tone(380, 0.04, 'square', 0.03); }
    function finish() {
      kit.end({ score: S.score, correct: S.correct, total: S.total, won: S.won,
        note: S.won ? `You landed ${GOAL} matches with ${S.hearts} heart${S.hearts === 1 ? '' : 's'} to spare. Best streak: ${S.bestStreak}.` : `You landed ${S.correct} of ${GOAL} matches. Best streak: ${S.bestStreak}.` });
    }

    /* ---------- draw ---------- */
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#101A33'); bg.addColorStop(0.35, '#0B1222'); bg.addColorStop(1, '#0D1830');
    function draw(_g, t) {
      g.save();
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      const [ox, oy] = fx.offset(); g.translate(ox, oy);
      // drifting molecules in the cleft
      for (const m of motes) {
        if (!RM && !kit.paused) { m.y -= m.s / 60; if (m.y < ZONE_H) { m.y = H; m.x = Math.random() * W; } }
        g.globalAlpha = 0.18 + 0.12 * Math.sin(t * 2 + m.p);
        g.fillStyle = C.blue; g.beginPath(); g.arc(m.x + (RM ? 0 : Math.sin(t + m.p) * 3), m.y, m.r, 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
      // midline
      g.strokeStyle = C.line; g.lineWidth = 2; g.setLineDash([8, 10]);
      g.beginPath(); g.moveTo(0, (CPU_Y + PLAYER_Y) / 2); g.lineTo(W, (CPU_Y + PLAYER_Y) / 2); g.stroke(); g.setLineDash([]);
      drawZones(t);
      drawCPU(t);
      if (S.mode === 'serve' && !S.over) drawAim(t);
      drawPlayer(t);
      drawBall(t);
      fx.draw(g);
      g.restore();
      if (S.mode === 'serve' && !S.over) {
        g.font = `700 ${narrow ? 14 : 15}px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.globalAlpha = 0.75 + 0.25 * Math.sin(t * 4); g.fillStyle = C.ink;
        g.fillText(S.hintT > 0 && S.total === 0 ? (narrow ? 'Drag to move. Tap to launch.' : 'Aim with ← →. Space to launch.') : 'Tap or press Space to launch', W / 2, PLAYER_Y - 58);
        g.globalAlpha = 1;
      }
      if (S.mode === 'result' && S.res && !S.res.ok) drawAnswerCallout(t);
      if (S.banner) drawBanner(S.banner);
      fx.drawFlash(g);
    }
    function drawZones(t) {
      const res = S.mode === 'result' || S.over ? S.res : null;
      for (let i = 0; i < 3; i++) {
        const z = S.zones[i]; if (!z) continue;
        const x = i * ZW, col = ZCOL[i];
        let state = 'idle';
        if (res) { if (i === res.ai) state = 'answer'; else if (i === res.zi) state = 'wrong'; else state = 'dim'; }
        const pulse = 0.5 + 0.5 * Math.sin(t * 9);
        g.fillStyle = state === 'answer' ? `rgba(255,209,102,${0.18 + 0.12 * pulse})` : state === 'wrong' ? 'rgba(255,107,129,.2)' : 'rgba(18,28,51,.95)';
        g.fillRect(x, 0, ZW, ZONE_H);
        g.globalAlpha = state === 'dim' ? 0.4 : 1;
        // label
        const lab = z.lab, lh = lab.size + 3;
        g.font = `700 ${lab.size}px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = state === 'answer' ? C.gold : state === 'wrong' ? C.spark : C.ink;
        const y0 = (ZONE_H - 10) / 2 - (lab.lines.length - 1) * lh / 2;
        lab.lines.forEach((ln, li) => g.fillText(ln, x + ZW / 2, y0 + li * lh));
        // receptor cups along the membrane
        const cc = state === 'answer' ? C.gold : state === 'wrong' ? C.spark : col;
        g.strokeStyle = cc; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x + 4, ZONE_H); g.lineTo(x + ZW - 4, ZONE_H); g.stroke();
        g.lineWidth = 2.4;
        for (let c = 0; c < 2; c++) { // binding pockets open toward the cleft
          const cx = x + ZW * (c === 0 ? 0.3 : 0.7), y = ZONE_H;
          g.beginPath();
          g.moveTo(cx - 8, y); g.lineTo(cx - 8, y + 6); g.quadraticCurveTo(cx - 8, y + 9, cx - 4, y + 9);
          g.moveTo(cx + 8, y); g.lineTo(cx + 8, y + 6); g.quadraticCurveTo(cx + 8, y + 9, cx + 4, y + 9);
          g.stroke();
        }
        g.globalAlpha = 1;
        if (state === 'answer' && !RM) { g.save(); g.shadowColor = C.gold; g.shadowBlur = 16; g.strokeStyle = C.gold; g.lineWidth = 2; g.strokeRect(x + 2, 2, ZW - 4, ZONE_H - 4); g.restore(); }
      }
      g.strokeStyle = C.line; g.lineWidth = 2;
      g.beginPath(); g.moveTo(ZW, 0); g.lineTo(ZW, ZONE_H); g.moveTo(2 * ZW, 0); g.lineTo(2 * ZW, ZONE_H); g.stroke();
    }
    function drawCPU(t) {
      const x = S.cpuX, y = CPU_Y;
      g.save();
      if (S.mode === 'result' || S.over) g.globalAlpha = 0.35;
      g.fillStyle = 'rgba(255,107,129,.16)'; ML.roundRect(g, x - CPUW / 2 - 4, y - PH / 2 - 4, CPUW + 8, PH + 8, 10); g.fill();
      g.fillStyle = C.spark; ML.roundRect(g, x - CPUW / 2, y - PH / 2, CPUW, PH, 6); g.fill();
      g.strokeStyle = '#0B1222'; g.lineWidth = 1.6; g.beginPath();
      for (let k = 0; k <= 10; k++) { const xx = x - CPUW / 2 + 6 + k * (CPUW - 12) / 10; const yy = y + (k % 2 ? -2.5 : 2.5) * (RM ? 1 : Math.sin(t * 10 + k)); k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.stroke();
      if (S.mode !== 'result' && !S.over) {
        g.font = `700 10px ${F.mono}`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillStyle = 'rgba(255,107,129,.85)';
        g.fillText('REUPTAKE PUMP', x, y - PH / 2 - 5);
      }
      g.restore();
    }
    function drawPlayer(t) {
      const x = S.px, y = PLAYER_Y + (RM ? 0 : (S.padFlash || 0) * 10);
      g.save();
      if (S.padFlash > 0 && !RM) { g.globalAlpha = S.padFlash * 3; g.fillStyle = 'rgba(124,192,238,.45)'; ML.roundRect(g, x - PW / 2 - 6, y - PH / 2 - 6, PW + 12, PH + 12, 10); g.fill(); g.globalAlpha = 1; }
      // terminal button bulb under the paddle
      g.fillStyle = 'rgba(75,156,211,.25)'; g.beginPath(); g.ellipse(x, y + 10, PW * 0.42, 14, 0, 0, Math.PI); g.fill();
      const grd = g.createLinearGradient(0, y - PH / 2, 0, y + PH / 2); grd.addColorStop(0, C.blue); grd.addColorStop(1, C.carolina);
      g.fillStyle = grd; ML.roundRect(g, x - PW / 2, y - PH / 2, PW, PH, 6); g.fill();
      // aim zones: edges glow to show they send the ball sideways
      g.fillStyle = 'rgba(255,255,255,.55)';
      g.fillRect(x - PW / 2 + 6, y - 1, 6, 2); g.fillRect(x + PW / 2 - 12, y - 1, 6, 2);
      g.fillStyle = C.mint; g.globalAlpha = 0.8; ML.roundRect(g, x - 9, y - 3, 18, 6, 3); g.fill();
      g.restore();
    }
    function drawBall(t) {
      const b = S.ball;
      g.save();
      g.globalCompositeOperation = 'lighter';
      S.trail.forEach((p, i) => { const k = (i + 1) / S.trail.length; g.globalAlpha = 0.35 * k; g.fillStyle = C.mint; g.beginPath(); g.arc(p.x, p.y, BR * (0.4 + 0.6 * k), 0, 6.283); g.fill(); });
      g.globalAlpha = 1;
      const pr = BR * 2.6 * (RM ? 1 : 1 + 0.12 * Math.sin(t * 12));
      const glow = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, pr);
      glow.addColorStop(0, 'rgba(53,227,167,.6)'); glow.addColorStop(1, 'rgba(53,227,167,0)');
      g.fillStyle = glow; g.beginPath(); g.arc(b.x, b.y, pr, 0, 6.283); g.fill();
      g.globalCompositeOperation = 'source-over';
      const core = g.createRadialGradient(b.x - 2, b.y - 2, 0.5, b.x, b.y, BR);
      core.addColorStop(0, '#ffffff'); core.addColorStop(0.45, C.gold); core.addColorStop(1, C.orange);
      g.fillStyle = core; g.beginPath(); g.arc(b.x, b.y, BR, 0, 6.283); g.fill();
      // tiny bonded atoms orbiting = a molecule
      if (!RM) for (let k = 0; k < 3; k++) { const a = t * 5 + k * 2.094; g.fillStyle = k ? C.blue : C.mint; g.beginPath(); g.arc(b.x + Math.cos(a) * (BR + 3), b.y + Math.sin(a) * (BR + 3), 1.8, 0, 6.283); g.fill(); }
      g.restore();
    }
    function drawAim(t) {
      // dotted predicted path from the paddle to the receptor line (ignores the pump)
      const a = aimAngle();
      let x = S.ball.x, y = S.ball.y, vx = Math.sin(a), vy = -Math.cos(a);
      g.save(); g.fillStyle = C.gold;
      let d = 0, steps = 0;
      const dash = 12, ofs = (t * 40) % dash;
      let next = ofs;
      while (y > ZONE_H + 2 && steps++ < 2000) {
        x += vx * 2; y += vy * 2; d += 2;
        if (x < BR) { x = BR; vx = -vx; } if (x > W - BR) { x = W - BR; vx = -vx; }
        if (d >= next) { next += dash; const k = 1 - Math.min(1, d / 520); g.globalAlpha = 0.25 + 0.65 * k; g.beginPath(); g.arc(x, y, 2.2, 0, 6.283); g.fill(); }
      }
      g.restore();
    }
    function drawAnswerCallout(t) {
      const ai = S.res.ai; if (ai < 0) return;
      const x = ai * ZW + ZW / 2, y = ZONE_H + 18 + (RM ? 0 : Math.sin(t * 7) * 3);
      g.save(); g.fillStyle = C.gold;
      g.beginPath(); g.moveTo(x - 9, y + 8); g.lineTo(x + 9, y + 8); g.lineTo(x, y - 4); g.closePath(); g.fill();
      g.font = `700 14px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'top';
      g.lineWidth = 4; g.strokeStyle = '#0B1222'; g.strokeText('Right answer', U.clamp(x, 50, W - 50), y + 12);
      g.fillText('Right answer', U.clamp(x, 50, W - 50), y + 12);
      g.restore();
    }
    function drawBanner(b) {
      const k = U.clamp(b.t / 0.35, 0, 1), sc = RM ? 1 : 0.6 + 0.4 * easeBack(k);
      g.save(); g.globalAlpha = k;
      const by = H * 0.52;
      g.fillStyle = 'rgba(8,13,26,.62)'; g.fillRect(0, by - 42, W, 96);
      g.translate(W / 2, by); g.scale(sc, sc);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      ctx.fitText(g, b.text, W - 40, narrow ? 36 : 48, F.display, '400');
      g.lineWidth = 6; g.strokeStyle = '#0B1222'; g.strokeText(b.text, 0, 0);
      g.fillStyle = b.color; g.fillText(b.text, 0, 0);
      g.font = `700 15px ${F.body}`; g.fillStyle = C.ink; g.fillText(b.sub, 0, 34);
      g.restore();
    }
    function easeBack(x) { const c1 = 1.70158, c3 = c1 + 1; return x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

    /* ---------- start ---------- */
    kit.setLives(HEARTS, HEARTS); hud();
    newPrompt();
    kit.root.__dbg = { S, W, H, ZW, ZONE_H, CPU_Y, PLAYER_Y, ansZone, aimAngle };
    return () => kit.destroy();
  }
});
})();
