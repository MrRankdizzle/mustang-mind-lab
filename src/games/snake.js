/* Signal Snake — grid snake. Steer a myelinated axon to the vesicle labeled with the term that matches the definition. */
(function () {
'use strict';
const P = 'snake';

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
<g fill="#24325A"><circle cx="25" cy="20" r="1.2"/><circle cx="50" cy="20" r="1.2"/><circle cx="75" cy="20" r="1.2"/><circle cx="100" cy="20" r="1.2"/><circle cx="125" cy="20" r="1.2"/><circle cx="150" cy="20" r="1.2"/><circle cx="175" cy="20" r="1.2"/><circle cx="200" cy="20" r="1.2"/><circle cx="225" cy="20" r="1.2"/><circle cx="25" cy="92" r="1.2"/><circle cx="75" cy="92" r="1.2"/><circle cx="125" cy="92" r="1.2"/><circle cx="175" cy="92" r="1.2"/><circle cx="225" cy="92" r="1.2"/></g>
<path d="M30 86H95V58h55" fill="none" stroke="#CFE3F5" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 86H95V58h55" fill="none" stroke="#4B9CD3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="14 5"/>
<g fill="#35E3A7"><circle cx="48" cy="86" r="2.4"/><circle cx="67" cy="86" r="2.4"/><circle cx="86" cy="86" r="2.4"/><circle cx="95" cy="72" r="2.4"/><circle cx="110" cy="58" r="2.4"/><circle cx="129" cy="58" r="2.6" fill="#FFD166"/></g>
<circle cx="152" cy="58" r="10" fill="#4B9CD3"/><circle cx="155" cy="54" r="2.2" fill="#fff"/><circle cx="155" cy="62" r="2.2" fill="#fff"/><circle cx="156" cy="54" r="1" fill="#0B1222"/><circle cx="156" cy="62" r="1" fill="#0B1222"/>
<circle cx="200" cy="58" r="7" fill="#FFD166"/><circle cx="200" cy="58" r="12" fill="none" stroke="#FFD166" stroke-width="1.5" opacity=".6"/>
<g font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="700" font-size="9" text-anchor="middle"><rect x="176" y="31" width="48" height="13" rx="4" fill="#121C33" stroke="#FFD166"/><text x="200" y="40.5" fill="#FFD166">Myelin</text><rect x="56" y="22" width="48" height="13" rx="4" fill="#121C33" stroke="#B79CF6"/><text x="80" y="31.5" fill="#E8F0FF">Glia</text></g>
<circle cx="80" cy="46" r="6" fill="#B79CF6"/>
</svg>`;

const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

ML.registerGame({
  id: 'snake', title: 'Signal Snake', kind: 'arcade',
  blurb: 'You are a growing axon. Read the definition, then steer into the vesicle carrying the matching term.',
  how: [
    'Read the definition. Steer the axon into the vesicle labeled with the matching term to grow.',
    'Use the arrow keys or WASD, swipe on the screen, tap the side you want to turn toward, or use the arrow buttons.',
    'The edges wrap around, so you can exit one side and come back on the other. Biting your own tail short-circuits you.',
    'A wrong vesicle or a short circuit costs a heart and shrinks you. Make 15 matches to win before you lose 3 hearts.'
  ],
  art: ART,
  mount(el, ctx) {
    injectCSS(P + '-css', kitCSS(P) + `
.${P}-pad button { font-family: var(--f-body); font-size: 22px; }
`);
    const C = ctx.colors, F = ctx.fonts, sfx = ctx.sfx, U = ctx.util, RM = !!ctx.reduceMotion;
    const narrow = (el.clientWidth || innerWidth) < 600;
    const COLS = narrow ? 14 : 24, CELL = narrow ? 24 : 26;
    const W = COLS * CELL;
    const NPEL = narrow ? 3 : 4, GOAL = 15, HEARTS = 3, LABEL = narrow ? 14 : 15;
    const PCOL = [C.violet, C.blue, C.orange, '#F59AC8'];
    const pool = ctx.terms.length >= 4 ? ctx.terms : ctx.allTerms;

    const kit = makeKit(el, ctx, {
      prefix: P, W, H: (narrow ? 18 : 15) * CELL, minH: 13 * CELL, adaptH: narrow, snapH: CELL, padOptional: true, label: 'Signal Snake game screen', pad: true, lifeIcon: HEART, lifeName: 'hearts',
      stats: [['goal', 'Matches', `0/${GOAL}`], ['streak', 'Streak', '0']],
      defs: pool.map(t => t.d), update, draw, onKey
    });
    const g = kit.st.g, fx = kit.fx, canvas = kit.st.canvas, H = kit.H, ROWS = Math.round(H / CELL);

    const S = {
      score: 0, hearts: HEARTS, correct: 0, total: 0, streak: 0, bestStreak: 0,
      item: null, missed: false, pellets: [], freeze: 0, freezeMax: 1, started: false,
      body: [], prev: [], dir: DIRS.right, queue: [], stepT: 0, grow: 0, pulse: -1, pulseT: 1,
      over: false, won: false, endT: 0, banner: null, hurtT: 0
    };
    const cx0 = Math.floor(COLS / 2) - 2, cy0 = Math.floor(ROWS / 2);
    for (let i = 0; i < 4; i++) S.body.push({ x: cx0 - i, y: cy0 });
    S.prev = S.body.map(c => ({ ...c }));

    const interval = () => Math.max(0.095, 0.175 - 0.0055 * S.correct);

    /* ---------- prompts & pellets ---------- */
    function newPrompt(freeze) {
      S.item = ctx.deck.next(NPEL);
      S.missed = false;
      placePellets();
      kit.setPrompt(S.item.prompt);
      S.freeze = S.freezeMax = freeze;
    }
    function tagRect(px, py, lab) {
      const lh = lab.size + 3, w = lab.w + 14, hh = lab.lines.length * lh + 7;
      let y = py * CELL - hh - 3;
      if (y < 2) y = (py + 1) * CELL + 3;
      const x = U.clamp(px * CELL + CELL / 2 - w / 2, 2, W - w - 2);
      return { x, y, w, h: hh, lh };
    }
    const overlap = (a, b, m) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;
    function placePellets() {
      const head = S.body[0];
      const occupied = new Set(S.body.map(c => c.x + ',' + c.y));
      const choices = U.shuffle(S.item.choices);
      const placed = [];
      for (let i = 0; i < choices.length; i++) {
        const term = choices[i];
        const lab = layoutLabel(g, term.s, narrow ? 150 : 190, LABEL, 13, F.body);
        let best = null;
        for (let tries = 0; tries < 400 && !best; tries++) {
          const x = (Math.random() * COLS) | 0, y = (Math.random() * ROWS) | 0;
          if (occupied.has(x + ',' + y)) continue;
          // keep clear of the head and of the path straight ahead
          const dxw = Math.min(Math.abs(x - head.x), COLS - Math.abs(x - head.x)), dyw = Math.min(Math.abs(y - head.y), ROWS - Math.abs(y - head.y));
          if (dxw + dyw < (tries < 300 ? 5 : 3)) continue;
          if (tries < 300) {
            let ahead = false;
            for (let k = 1; k <= 6; k++) { const ax = (head.x + S.dir.x * k + COLS) % COLS, ay = (head.y + S.dir.y * k + ROWS) % ROWS; if (Math.abs(ax - x) + Math.abs(ay - y) <= 1) ahead = true; }
            if (ahead) continue;
          }
          const cell = { x: x * CELL, y: y * CELL, w: CELL, h: CELL };
          const tr = tagRect(x, y, lab);
          let bad = false;
          for (const q of placed) { if (overlap(cell, q.cell, 6) || overlap(tr, q.tr, 6) || overlap(cell, q.tr, 4) || overlap(tr, q.cell, 4)) { bad = true; break; } }
          if (bad && tries < 380) continue;
          best = { x, y, cell, tr };
        }
        if (!best) { // fallback: any free cell
          for (let k = 0; k < 500 && !best; k++) { const x = (Math.random() * COLS) | 0, y = (Math.random() * ROWS) | 0; if (!occupied.has(x + ',' + y)) best = { x, y, cell: { x: x * CELL, y: y * CELL, w: CELL, h: CELL }, tr: tagRect(x, y, lab) }; }
        }
        occupied.add(best.x + ',' + best.y);
        placed.push({ term, lab, x: best.x, y: best.y, cell: best.cell, tr: best.tr, col: PCOL[i % PCOL.length], born: 0, gone: 0, ph: Math.random() * 6 });
      }
      S.pellets = placed;
    }

    /* ---------- scoring ---------- */
    function hud() {
      kit.stat.goal.textContent = `${S.correct}/${GOAL}`;
      kit.stat.streak.textContent = S.streak > 1 ? '×' + S.streak : S.streak;
    }
    function addScore(n, x, y, color, label) { S.score += n; kit.setScore(S.score); fx.pop(x, y, label || '+' + n, color || C.gold); }
    function loseHeart() {
      S.hearts--; kit.setLives(Math.max(0, S.hearts), HEARTS); S.hurtT = 0.5;
      if (S.hearts <= 0) gameOver();
    }
    function shrink(n) {
      for (let i = 0; i < n && S.body.length > 3; i++) {
        const c = S.body.pop(); S.prev.pop();
        fx.burst(c.x * CELL + CELL / 2, c.y * CELL + CELL / 2, 10, [C.spark, '#CFE3F5'], 120, 2.6);
      }
    }
    function eat(p) {
      const x = p.x * CELL + CELL / 2, y = p.y * CELL + CELL / 2;
      if (p.term.id === S.item.answer.id) {
        fx.burst(x, y, 30, [p.col, C.gold, '#ffffff', C.mint], 210, 3.2);
        fx.ring(x, y, C.mint, 46); fx.flashIt(C.mint, 0.16); fx.shakeIt(3);
        sfx.good();
        if (!S.missed) {
          S.correct++; S.total++; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
          ctx.record(S.item, true);
          S.grow += 2;
          addScore(100 + 5 * S.body.length + 20 * Math.min(S.streak - 1, 8), x, y - 8, C.gold);
          if (S.streak >= 3) fx.pop(x, y + 18, `STREAK ×${S.streak}`, C.mint, 13);
          kit.markPrompt('good');
        } else {
          S.grow += 1; addScore(25, x, y - 8, C.blue);
        }
        hud();
        S.pulse = 0; S.gulp = 0.3; // send an action potential down the axon
        if (S.correct >= GOAL) { victory(); return; }
        newPrompt(1.1);
      } else {
        S.missed = true; S.total++; S.streak = 0;
        ctx.record(S.item, false);
        fx.burst(x, y, 16, [C.spark, '#ffffff'], 150, 2.6); fx.ring(x, y, C.spark, 34);
        fx.flashIt(C.spark, 0.22); fx.shakeIt(7); sfx.bad();
        fx.pop(x, y - 8, 'WRONG', C.spark, 16);
        kit.markPrompt('miss');
        shrink(2);
        // wrong vesicles pop; only the right one stays, pulsing, so you can grab it
        for (const q of S.pellets) if (q.term.id !== S.item.answer.id) q.gone = q.gone || 0.001;
        hud();
        S.freeze = S.freezeMax = 0.6;
        loseHeart();
      }
    }
    function shortCircuit(idx) {
      const cut = S.body.splice(idx); S.prev.splice(idx);
      cut.forEach((c, i) => fx.burst(c.x * CELL + CELL / 2, c.y * CELL + CELL / 2, 6, [C.gold, C.spark, '#CFE3F5'], 110 + i * 4, 2.4));
      const h0 = S.body[0];
      fx.pop(h0.x * CELL + CELL / 2, h0.y * CELL - 6, 'SHORT CIRCUIT', C.spark, 14);
      fx.flashIt(C.spark, 0.2); fx.shakeIt(8); sfx.boom(); sfx.bad();
      S.streak = 0; hud();
      while (S.body.length < 3) { const t = S.body[S.body.length - 1]; S.body.push({ ...t }); S.prev.push({ ...t }); }
      S.freeze = S.freezeMax = 0.8;
      loseHeart();
    }
    function gameOver() {
      S.over = true; S.won = false; S.endT = 1.8;
      S.body.forEach((c, i) => fx.burst(c.x * CELL + CELL / 2, c.y * CELL + CELL / 2, 4, [C.blue, '#CFE3F5', C.spark], 90 + i * 3, 2.2));
      S.banner = { text: 'SIGNAL LOST', sub: `${S.correct} of ${GOAL} matches`, color: C.spark, t: 0 };
    }
    function victory() {
      S.over = true; S.won = true; S.endT = 1.8; S.pellets = [];
      S.banner = { text: 'FULLY MYELINATED', sub: `${GOAL} matches made`, color: C.mint, t: 0 };
      sfx.level();
    }

    /* ---------- input ---------- */
    function steer(d) {
      if (!kit.active || S.over) return;
      const last = S.queue.length ? S.queue[S.queue.length - 1] : S.dir;
      if (S.freeze > 0 && S.freezeMax > 0.7) S.freeze = 0; // turning ends the reading pause early
      S.started = true;
      if (d.x === -last.x && d.y === -last.y) return;
      if (d.x === last.x && d.y === last.y) return;
      if (S.queue.length < 3) S.queue.push(d);
    }
    function onKey(k, down) { if (down && DIRS[k]) steer(DIRS[k]); }
    let sw = null;
    kit.on(canvas, 'pointerdown', e => {
      if (!kit.active) return;
      e.preventDefault();
      const q = kit.st.toLogical(e);
      sw = { id: e.pointerId, x: q.x, y: q.y, x0: q.x, y0: q.y, moved: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    });
    kit.on(canvas, 'pointermove', e => {
      if (!sw || sw.id !== e.pointerId) return;
      const q = kit.st.toLogical(e);
      const dx = q.x - sw.x, dy = q.y - sw.y, th = CELL * 0.9;
      if (Math.abs(dx) > th || Math.abs(dy) > th) {
        steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIRS.right : DIRS.left) : (dy > 0 ? DIRS.down : DIRS.up));
        sw.x = q.x; sw.y = q.y; sw.moved = true;
      }
    });
    const endSw = e => {
      if (!sw || sw.id !== e.pointerId) return;
      const s0 = sw; sw = null;
      if (s0.moved || e.type !== 'pointerup') return;
      // a tap turns toward the tapped side of the head
      const hx = S.body[0].x * CELL + CELL / 2, hy = S.body[0].y * CELL + CELL / 2;
      const cur = S.queue.length ? S.queue[S.queue.length - 1] : S.dir;
      if (cur.x !== 0) steer(s0.y0 < hy ? DIRS.up : DIRS.down);
      else steer(s0.x0 < hx ? DIRS.left : DIRS.right);
    };
    kit.on(canvas, 'pointerup', endSw); kit.on(canvas, 'pointercancel', endSw);
    [['left', '◀', 'Turn left'], ['up', '▲', 'Turn up'], ['down', '▼', 'Turn down'], ['right', '▶', 'Turn right']].forEach(([d, sym, aria]) => {
      const b = ctx.h('button', { type: 'button', 'aria-label': aria }, sym);
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (kit.paused) kit.setPaused(false); b.classList.add('on'); steer(DIRS[d]); });
      const off = () => b.classList.remove('on');
      b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
      b.addEventListener('click', e => { if (e.detail === 0) steer(DIRS[d]); });
      b.addEventListener('contextmenu', e => e.preventDefault());
      kit.pad.append(b);
    });

    /* ---------- update ---------- */
    function update(dt) {
      if (S.banner) S.banner.t += dt;
      S.hurtT = Math.max(0, S.hurtT - dt); S.gulp = Math.max(0, (S.gulp || 0) - dt);
      for (const p of S.pellets) { p.born = Math.min(1, p.born + dt * 3); if (p.gone) p.gone += dt * 3; }
      S.pellets = S.pellets.filter(p => !p.gone || p.gone < 1);
      if (S.pulse >= 0) { S.pulse += dt * 30; if (S.pulse > S.body.length + 2) S.pulse = -1; }
      if (S.over) { S.endT -= dt; if (S.endT <= 0) finish(); return; }
      if (!S.started) { S.freeze = Math.max(S.freeze, 0.01); S.startT = (S.startT || 0) + dt; if (S.startT > 2.6) S.started = true; return; }
      if (S.freeze > 0) { S.freeze -= dt; return; }
      S.stepT += dt;
      const iv = interval();
      while (S.stepT >= iv && !S.over) { S.stepT -= iv; step(); }
    }
    function step() {
      if (S.queue.length) S.dir = S.queue.shift();
      const head = S.body[0];
      const nx = (head.x + S.dir.x + COLS) % COLS, ny = (head.y + S.dir.y + ROWS) % ROWS;
      const tailMoves = S.grow === 0;
      let hit = -1;
      for (let i = 0; i < S.body.length; i++) { if (tailMoves && i === S.body.length - 1) continue; if (S.body[i].x === nx && S.body[i].y === ny) { hit = i; break; } }
      const old = S.body.map(c => ({ ...c }));
      S.body.unshift({ x: nx, y: ny });
      if (S.grow > 0) S.grow--; else S.body.pop();
      // each segment slides from where it was (old[i]) to where it is now; a newly grown tail stays put
      S.prev = S.body.map((_, i) => ({ ...old[Math.min(i, old.length - 1)] }));
      if (hit >= 0) { shortCircuit(Math.max(hit + 1, 1)); return; }
      const p = S.pellets.find(q => !q.gone && q.x === nx && q.y === ny);
      if (p) { S.pellets = S.pellets.filter(q => q !== p); eat(p); }
    }
    function finish() {
      kit.end({ score: S.score, correct: S.correct, total: S.total, won: S.won,
        note: S.won ? `You made all ${GOAL} matches and grew to ${S.body.length} nodes. Best streak: ${S.bestStreak}.` : `You made ${S.correct} of ${GOAL} matches. Best streak: ${S.bestStreak}.` });
    }

    /* ---------- draw ---------- */
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0C1427'); bg.addColorStop(1, '#0E1A31');
    function segPos(i, k) {
      const a = S.prev[i] || S.body[i], b = S.body[i];
      if (Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1) return { x: b.x * CELL + CELL / 2, y: b.y * CELL + CELL / 2, jump: true };
      return { x: (a.x + (b.x - a.x) * k) * CELL + CELL / 2, y: (a.y + (b.y - a.y) * k) * CELL + CELL / 2, jump: false };
    }
    function draw(_g, t) {
      g.save();
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      const [ox, oy] = fx.offset(); g.translate(ox, oy);
      // grid dots
      g.fillStyle = 'rgba(124,192,238,.13)';
      for (let y = 1; y < ROWS; y++) for (let x = 1; x < COLS; x++) g.fillRect(x * CELL - 1, y * CELL - 1, 2, 2);
      // wrap portals
      g.strokeStyle = C.mint; g.globalAlpha = 0.22 + 0.08 * Math.sin(t * 2); g.lineWidth = 2; g.setLineDash([4, 6]);
      g.strokeRect(1, 1, W - 2, H - 2); g.setLineDash([]); g.globalAlpha = 1;

      const k = S.over || S.freeze > 0 || !S.started ? 1 : U.clamp(S.stepT / interval(), 0, 1);
      const pts = S.body.map((_, i) => segPos(i, RM ? 1 : k));
      drawPellets(t);
      if (!(S.over && !S.won)) drawSnake(pts, t);
      drawTags(t, pts[0]);
      fx.draw(g);
      g.restore();
      // read bar
      if ((S.freeze > 0 || !S.started) && !S.over) {
        const kk = S.started ? U.clamp(S.freeze / S.freezeMax, 0, 1) : 1;
        g.fillStyle = 'rgba(255,209,102,.18)'; g.fillRect(0, 0, W, 4);
        g.fillStyle = C.gold; g.fillRect(0, 0, W * kk, 4);
        g.font = `700 11px ${F.mono}`; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillStyle = C.gold;
        g.fillText(S.started ? 'READ' : 'READ, THEN STEER', W - 6, 8);
      }
      if (S.banner) drawBanner(S.banner);
      fx.drawFlash(g);
    }
    function drawPellets(t) {
      const reveal = S.missed;
      for (const p of S.pellets) {
        const isAns = p.term.id === S.item.answer.id;
        const x = p.x * CELL + CELL / 2, y = p.y * CELL + CELL / 2;
        const sc = (RM ? 1 : easeBack(p.born)) * (p.gone ? Math.max(0, 1 - p.gone) : 1);
        if (sc <= 0.01) continue;
        const r = CELL * 0.34 * sc * (RM ? 1 : 1 + 0.06 * Math.sin(t * 4 + p.ph));
        const col = reveal && isAns ? C.gold : p.col;
        g.save();
        if (reveal && isAns) {
          const pr = (t * 1.6) % 1;
          g.strokeStyle = C.gold; g.lineWidth = 2.5; g.globalAlpha = 1 - pr;
          g.beginPath(); g.arc(x, y, r + 4 + pr * CELL * 0.9, 0, 6.283); g.stroke(); g.globalAlpha = 1;
        }
        g.fillStyle = col; g.globalAlpha = 0.22; g.beginPath(); g.arc(x, y, r * 1.7, 0, 6.283); g.fill(); g.globalAlpha = 1;
        const grd = g.createRadialGradient(x - r * 0.35, y - r * 0.35, 0.5, x, y, r);
        grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.35, col); grd.addColorStop(1, shade(col));
        g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
        // vesicle contents
        g.fillStyle = 'rgba(11,18,34,.55)';
        for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1 + p.ph; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.16, 0, 6.283); g.fill(); }
        g.restore();
      }
    }
    function drawTags(t, head) {
      const reveal = S.missed;
      for (const p of S.pellets) {
        const isAns = p.term.id === S.item.answer.id;
        const fade = p.gone ? Math.max(0, 1 - p.gone) : Math.min(1, p.born * 1.5);
        if (fade <= 0.01) continue;
        const tr = p.tr, glow = reveal && isAns;
        const near = head && head.x > tr.x - CELL && head.x < tr.x + tr.w + CELL && head.y > tr.y - CELL && head.y < tr.y + tr.h + CELL;
        g.save(); g.globalAlpha = fade * (near && !glow ? 0.6 : 1);
        // connector
        const px = p.x * CELL + CELL / 2, py = p.y * CELL + CELL / 2;
        const ty = tr.y > py ? tr.y : tr.y + tr.h;
        g.strokeStyle = glow ? C.gold : p.col; g.lineWidth = 1.5; g.globalAlpha *= 0.8;
        g.beginPath(); g.moveTo(px, py + (ty > py ? CELL * 0.34 : -CELL * 0.34)); g.lineTo(U.clamp(px, tr.x + 6, tr.x + tr.w - 6), ty); g.stroke();
        g.globalAlpha = fade * (near && !glow ? 0.6 : 1);
        if (glow && !RM) { g.shadowColor = C.gold; g.shadowBlur = 12 + 5 * Math.sin(t * 8); }
        ML.roundRect(g, tr.x, tr.y, tr.w, tr.h, 6);
        g.fillStyle = glow ? '#2A2410' : 'rgba(18,28,51,.94)'; g.fill(); g.shadowBlur = 0;
        g.lineWidth = glow ? 2.4 : 1.4; g.strokeStyle = glow ? C.gold : p.col; g.stroke();
        g.font = `700 ${p.lab.size}px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = glow ? C.gold : C.ink;
        p.lab.lines.forEach((ln, i) => g.fillText(ln, tr.x + tr.w / 2, tr.y + 4 + tr.lh * i + tr.lh / 2));
        g.restore();
      }
    }
    function drawSnake(pts, t) {
      if (!pts.length) return;
      const hurt = S.hurtT > 0 && Math.floor(S.hurtT * 16) % 2 === 0;
      // split the body into runs that don't jump across a wrap edge
      const runs = []; let run = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (Math.abs(a.x - b.x) > CELL * 1.5 || Math.abs(a.y - b.y) > CELL * 1.5) { runs.push(run); run = [b]; } else run.push(b);
      }
      runs.push(run);
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      for (const r of runs) {
        if (r.length < 2) continue;
        const path = () => { g.beginPath(); g.moveTo(r[0].x, r[0].y); for (let i = 1; i < r.length; i++) g.lineTo(r[i].x, r[i].y); };
        g.strokeStyle = 'rgba(124,192,238,.18)'; g.lineWidth = CELL * 0.92; path(); g.stroke();
        g.strokeStyle = hurt ? C.spark : '#CFE3F5'; g.lineWidth = CELL * 0.62; path(); g.stroke();   // myelin sheath
        g.strokeStyle = hurt ? '#FFB3BF' : C.carolina; g.lineWidth = CELL * 0.26; path(); g.stroke();  // axon core
      }
      // nodes of Ranvier between segments; the action potential jumps node to node
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (Math.abs(a.x - b.x) > CELL * 1.5 || Math.abs(a.y - b.y) > CELL * 1.5) continue;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const lit = S.pulse >= 0 && Math.abs(S.pulse - i) < 1.4;
        const idle = !RM && Math.abs(((t * 6) % (pts.length + 6)) - i) < 0.8;
        g.fillStyle = '#0B1222'; g.beginPath(); g.arc(mx, my, CELL * 0.2, 0, 6.283); g.fill();
        g.fillStyle = lit ? C.gold : idle ? '#9FFFE0' : C.mint;
        g.beginPath(); g.arc(mx, my, CELL * (lit ? 0.17 : 0.12), 0, 6.283); g.fill();
        if (lit && !RM) { g.globalAlpha = 0.35; g.beginPath(); g.arc(mx, my, CELL * 0.4, 0, 6.283); g.fill(); g.globalAlpha = 1; }
      }
      // head = soma
      const h0 = pts[0], d = S.dir;
      const grd = g.createRadialGradient(h0.x - 3, h0.y - 3, 1, h0.x, h0.y, CELL * 0.5);
      grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.35, hurt ? C.spark : C.blue); grd.addColorStop(1, hurt ? '#9B2A3B' : C.carolina);
      g.strokeStyle = hurt ? C.spark : C.blue; g.lineWidth = 2;
      for (let k = 0; k < 5; k++) { // little dendrites
        const a = Math.atan2(d.y, d.x) + Math.PI + (k - 2) * 0.55 + (RM ? 0 : Math.sin(t * 6 + k) * 0.12);
        g.beginPath(); g.moveTo(h0.x + Math.cos(a) * CELL * 0.4, h0.y + Math.sin(a) * CELL * 0.4); g.lineTo(h0.x + Math.cos(a) * CELL * 0.62, h0.y + Math.sin(a) * CELL * 0.62); g.stroke();
      }
      const hr = CELL * 0.5 * (RM ? 1 : 1 + (S.gulp || 0) * 1.1);
      g.fillStyle = grd; g.beginPath(); g.arc(h0.x, h0.y, hr, 0, 6.283); g.fill();
      const ex = -d.y, ey = d.x; // perpendicular for eye spacing
      for (const s of [-1, 1]) {
        const x = h0.x + d.x * CELL * 0.14 + ex * s * CELL * 0.2, y = h0.y + d.y * CELL * 0.14 + ey * s * CELL * 0.2;
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, CELL * 0.13, 0, 6.283); g.fill();
        g.fillStyle = '#0B1222'; g.beginPath(); g.arc(x + d.x * CELL * 0.05, y + d.y * CELL * 0.05, CELL * 0.065, 0, 6.283); g.fill();
      }
      g.restore();
    }
    function drawBanner(b) {
      const k = U.clamp(b.t / 0.35, 0, 1), sc = RM ? 1 : 0.6 + 0.4 * easeBack(k);
      g.save(); g.globalAlpha = k;
      const by = H * 0.5;
      g.fillStyle = 'rgba(8,13,26,.66)'; g.fillRect(0, by - 42, W, 96);
      g.translate(W / 2, by); g.scale(sc, sc);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      ctx.fitText(g, b.text, W - 30, narrow ? 34 : 46, F.display, '400');
      g.lineWidth = 6; g.strokeStyle = '#0B1222'; g.strokeText(b.text, 0, 0);
      g.fillStyle = b.color; g.fillText(b.text, 0, 0);
      g.font = `700 15px ${F.body}`; g.fillStyle = C.ink; g.fillText(b.sub, 0, 34);
      g.restore();
    }
    function easeBack(x) { const c1 = 1.70158, c3 = c1 + 1; return x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    function shade(hex) {
      const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * 0.45 | 0, gg = ((n >> 8) & 255) * 0.45 | 0, b = (n & 255) * 0.45 | 0;
      return `rgb(${r},${gg},${b})`;
    }

    /* ---------- start ---------- */
    kit.setLives(HEARTS, HEARTS); hud();
    newPrompt(0);
    kit.root.__dbg = { S, W, H, COLS, ROWS, CELL, steer, DIRS };
    return () => kit.destroy();
  }
});
})();
