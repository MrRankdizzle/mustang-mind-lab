/* Neuro Invaders — Space-Invaders-style term shooter. Each invader carries a term; shoot the one that matches the definition. */
(function () {
'use strict';
const P = 'invaders';

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

const SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l8 3v6.1c0 5-3.4 8.9-8 10.6-4.6-1.7-8-5.6-8-10.6V5.2z" fill="#4B9CD3" stroke="#7CC0EE" stroke-width="1.6"/><path d="M8.5 12l2.4 2.4 4.6-5" fill="none" stroke="#0B1222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ART = `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<rect width="250" height="112" fill="#0B1222"/>
<g fill="#8EA0C4" opacity=".55"><circle cx="20" cy="24" r="1"/><circle cx="96" cy="66" r="1"/><circle cx="210" cy="70" r="1.2"/><circle cx="236" cy="30" r="1"/><circle cx="14" cy="80" r="1"/><circle cx="160" cy="18" r="1"/></g>
<g stroke-width="2" stroke-linecap="round" fill="none"><path d="M60 30l-8-6M60 30l8-6M53 35l-9 0M67 35l9 0M55 40l-5 5M65 40l5 5" stroke="#B79CF6"/><path d="M190 30l-8-6M190 30l8-6M183 35l-9 0M197 35l9 0M185 40l-5 5M195 40l5 5" stroke="#B79CF6"/><path d="M125 28l-8-6M125 28l8-6M118 33l-9 0M132 33l9 0M120 38l-5 5M130 38l5 5" stroke="#FF9F5A"/></g>
<circle cx="60" cy="35" r="8" fill="#B79CF6"/><circle cx="190" cy="35" r="8" fill="#B79CF6"/><circle cx="125" cy="33" r="8" fill="#FF9F5A"/>
<g fill="#0B1222"><circle cx="57" cy="34" r="1.8"/><circle cx="63" cy="34" r="1.8"/><circle cx="187" cy="34" r="1.8"/><circle cx="193" cy="34" r="1.8"/><circle cx="122" cy="32" r="1.8"/><circle cx="128" cy="32" r="1.8"/></g>
<g font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="700" font-size="9" text-anchor="middle">
<rect x="34" y="46" width="52" height="13" rx="4" fill="#121C33" stroke="#B79CF6"/><text x="60" y="55.5" fill="#E8F0FF">Dopamine</text>
<rect x="164" y="46" width="52" height="13" rx="4" fill="#121C33" stroke="#B79CF6"/><text x="190" y="55.5" fill="#E8F0FF">Myelin</text>
<rect x="104" y="44" width="42" height="13" rx="4" fill="#2A2410" stroke="#FFD166" stroke-width="1.6"/><text x="125" y="53.5" fill="#FFD166">Axon</text></g>
<path d="M125 62l-2 4 3 3-1 6" stroke="#FFD166" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="44" y="74" width="24" height="7" rx="2" fill="#35E3A7" opacity=".75"/><rect x="182" y="74" width="24" height="7" rx="2" fill="#35E3A7" opacity=".75"/>
<path d="M110 92h30l-5-8h-20z" fill="#4B9CD3"/><circle cx="125" cy="84" r="5" fill="#7CC0EE"/><rect x="123" y="75" width="4" height="8" rx="1" fill="#7CC0EE"/><circle cx="125" cy="75" r="2" fill="#FFD166"/>
<path d="M0 95h250" stroke="#35E3A7" stroke-width="1.5" opacity=".55"/>
</svg>`;

ML.registerGame({
  id: 'invaders', title: 'Neuro Invaders', kind: 'arcade',
  blurb: 'A swarm of rogue neurons is marching on your brain. Read the definition and blast the invader carrying the matching term.',
  how: [
    'Read the definition above the screen. Shoot the invader whose label matches it.',
    'Move with ← → or A / D and fire with Space. On a phone, tap above an invader to slide over and fire, or use the buttons.',
    'A wrong hit costs a shield and lights up the right answer. Letting the swarm reach your line costs one too.',
    'Purple inhibitory shots freeze your cannon for a second, so hide behind the barriers. Clear 4 waves to win.'
  ],
  art: ART,
  mount(el, ctx) {
    injectCSS(P + '-css', kitCSS(P) + `
.${P}-pad .${P}-fire { flex-grow: 1.6; max-width: 170px; color: var(--arc-gold); }
`);
    const C = ctx.colors, F = ctx.fonts, sfx = ctx.sfx, U = ctx.util, RM = !!ctx.reduceMotion;
    const narrow = (el.clientWidth || innerWidth) < 600;
    const W = narrow ? 340 : 720;
    const COLS = narrow ? 2 : 3, ROWS = 2, K = COLS * ROWS;
    // Rows are nudged apart sideways (OFF) so every invader's body has a clear line of fire;
    // labels hang below their invader and never block shots.
    const CELL_W = narrow ? 130 : 190, OFF = narrow ? 18 : 22, ROW_H = narrow ? 94 : 102, R = narrow ? 15 : 17;
    const LABEL = narrow ? 15 : 17, LABEL_MIN = 13;
    const PER_WAVE = 5, WAVES = 4, LIVES = 3;
    const TOP_Y = 46, STEP = narrow ? 12 : 14;
    const pool = ctx.terms.length >= 4 ? ctx.terms : ctx.allTerms;
    const ROW_COL = [C.violet, C.orange];

    const kit = makeKit(el, ctx, {
      prefix: P, W, H: narrow ? 480 : 500, minH: 410, adaptH: narrow, padOptional: true,
      label: 'Neuro Invaders game screen', pad: true, lifeIcon: SHIELD, lifeName: 'shields',
      stats: [['wave', 'Wave', `1/${WAVES}`], ['streak', 'Streak', '0']],
      defs: pool.map(t => t.d), update, draw, onKey, onBlur: () => { S.keyFire = false; S.padFire = false; }
    });
    const g = kit.st.g, fx = kit.fx, canvas = kit.st.canvas, H = kit.H;
    const PLAYER_Y = H - 28, BAR_Y = H - 96, DANGER_Y = H - 104;

    const S = {
      score: 0, lives: LIVES, streak: 0, bestStreak: 0, wave: 1, waveHits: 0, correct: 0, total: 0,
      item: null, missed: false, freeze: 0, freezeMax: 1, scramble: 0, over: false, endT: 0, won: false,
      px: W / 2, targetX: null, aimIdx: null, fireQ: 0, cool: 0, stun: 0, keyFire: false, padFire: false,
      shot: null, eshots: [], tickT: 0.6, dir: 1, frame: 0, note: 0, fx: 0, fy: TOP_Y,
      saucer: null, saucerT: U.rand(12, 20), eT: U.rand(2.4, 3.4), banner: null, invs: [], hintT: 4
    };
    const stars = Array.from({ length: narrow ? 40 : 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random(), tw: Math.random() * 6 }));

    /* ---------- barriers ---------- */
    const BC = 12, BR = 6, BS = 4;
    const barriers = [];
    const nBar = narrow ? 2 : 4;
    for (let i = 0; i < nBar; i++) {
      const cx = W * (i + 1) / (nBar + 1);
      const cells = new Uint8Array(BC * BR);
      for (let r = 0; r < BR; r++) for (let c = 0; c < BC; c++) {
        const corner = r === 0 && (c < 2 || c > BC - 3) || r === 1 && (c === 0 || c === BC - 1);
        const arch = r >= BR - 2 && c >= 4 && c <= BC - 5;
        cells[r * BC + c] = corner || arch ? 0 : 1;
      }
      barriers.push({ x: Math.round(cx - BC * BS / 2), y: BAR_Y, cells });
    }
    // Barriers only stop the purple inhibitory shots; your own signals pass straight through.
    function barrierHit(x, y0, y1, up) {
      for (const b of barriers) {
        const c = Math.floor((x - b.x) / BS);
        if (c < 0 || c >= BC) continue;
        const rA = Math.floor((Math.min(y0, y1) - b.y) / BS), rB = Math.floor((Math.max(y0, y1) - b.y) / BS);
        if (rB < 0 || rA >= BR) continue;
        const from = up ? Math.min(BR - 1, rB) : Math.max(0, rA), to = up ? Math.max(0, rA) : Math.min(BR - 1, rB), step = up ? -1 : 1;
        for (let r = from; up ? r >= to : r <= to; r += step) {
          if (b.cells[r * BC + c]) { erode(b, c, r); return { x: b.x + c * BS + 2, y: b.y + r * BS + 2 }; }
        }
      }
      return null;
    }
    function erode(b, c0, r0) {
      for (let r = r0 - 2; r <= r0 + 2; r++) for (let c = c0 - 2; c <= c0 + 2; c++) {
        if (r < 0 || r >= BR || c < 0 || c >= BC) continue;
        const d = Math.hypot(c - c0, r - r0);
        if (d < 1.01 || (d < 2.3 && Math.random() < 0.45)) b.cells[r * BC + c] = 0;
      }
    }

    /* ---------- formation ---------- */
    const formW = COLS * CELL_W + 2 * OFF;
    // March speed is set so the swarm needs ~50 s to reach your line in wave 1, whatever the screen height.
    const startBottom = TOP_Y + (ROWS - 1) * ROW_H + 2 * R + 13 + 2 * (LABEL + 3) + 9;
    const TICK0 = U.clamp(50 / (Math.max(4, (DANGER_Y - startBottom) / STEP) * 7), 0.38, 0.85);
    const dx = Math.max(5, (W - 16 - formW) / 6);
    function resetFormation() { S.fx = (W - formW) / 2; S.fy = TOP_Y; S.dir = Math.random() < 0.5 ? -1 : 1; }
    function slot(i) {
      const c = i % COLS, r = (i / COLS) | 0;
      return { x: S.fx + OFF + c * CELL_W + CELL_W / 2 + (r ? OFF : -OFF), y: S.fy + r * ROW_H + R + 6 };
    }
    function tagBox(inv, x, y) {
      const lab = inv.lab; const lh = lab.size + 3;
      const w = lab.w + 14, hh = lab.lines.length * lh + 9;
      return { x: x - w / 2, y: y + R + 7, w, h: hh, lh };
    }
    function formationBottom() {
      let b = 0;
      S.invs.forEach((inv, i) => { const s = slot(i), t = tagBox(inv, s.x, s.y); b = Math.max(b, t.y + t.h); });
      return b;
    }
    function relabel(spawnAll) {
      const ch = U.shuffle(S.item.choices);
      for (let i = 0; i < K; i++) {
        const term = ch[i % ch.length];
        const lab = layoutLabel(g, term.s, CELL_W - 22, LABEL, LABEL_MIN, F.body);
        const old = S.invs[i];
        S.invs[i] = { term, lab, spawn: spawnAll || !old ? 0 : (old.spawn >= 1 ? 1 : old.spawn), hit: 0, row: (i / COLS) | 0 };
      }
    }
    function newPrompt(spawnAll, freeze = 1.6) {
      S.item = ctx.deck.next(K);
      S.missed = false;
      relabel(spawnAll);
      kit.setPrompt(S.item.prompt);
      S.freeze = S.freezeMax = freeze; S.scramble = RM ? 0 : 0.32;
    }
    function answerIdx() { return S.invs.findIndex(v => v.term.id === S.item.answer.id); }

    /* ---------- scoring ---------- */
    function addScore(n, x, y, color, label) {
      S.score += n; kit.setScore(S.score);
      fx.pop(x, y, label || '+' + n, color || C.gold);
    }
    function hud() {
      kit.stat.wave.textContent = `${Math.min(S.wave, WAVES)}/${WAVES}`;
      kit.stat.streak.textContent = S.streak > 1 ? '×' + S.streak : S.streak;
    }
    function loseLife() {
      S.lives--; kit.setLives(Math.max(0, S.lives), LIVES);
      if (S.lives <= 0) gameOver();
    }
    function gameOver() {
      S.over = true; S.won = false; S.endT = 1.6;
      fx.burst(S.px, PLAYER_Y, 50, [C.blue, C.carolina, C.ink, C.spark], 260, 3.5);
      fx.ring(S.px, PLAYER_Y, C.spark, 70); fx.flashIt(C.spark, 0.35); fx.shakeIt(10);
      sfx.boom();
      S.banner = { text: 'GAME OVER', sub: `You reached wave ${S.wave}`, t: 0, dur: 9, color: C.spark };
    }
    function victory() {
      S.over = true; S.won = true; S.endT = 1.8;
      S.banner = { text: 'SWARM CLEARED', sub: 'Your brain is safe', t: 0, dur: 9, color: C.mint };
      sfx.level();
    }

    function hitInvader(i) {
      const inv = S.invs[i], s = slot(i);
      const right = inv.term.id === S.item.answer.id;
      if (right) {
        fx.burst(s.x, s.y, 34, [ROW_COL[inv.row], C.gold, '#ffffff', C.mint], 230, 3.4);
        fx.ring(s.x, s.y, C.mint, 50); fx.ring(s.x, s.y, C.gold, 30);
        fx.flashIt(C.mint, 0.18); fx.shakeIt(3);
        sfx.boom(); sfx.good();
        if (!S.missed) {
          S.correct++; S.total++; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
          ctx.record(S.item, true);
          const pts = 100 + 25 * (S.wave - 1) + 20 * Math.min(S.streak - 1, 8);
          addScore(pts, s.x, s.y - 6, C.gold);
          if (S.streak >= 3) fx.pop(s.x, s.y + 24, `STREAK ×${S.streak}`, C.mint, 14);
          kit.markPrompt('good');
        } else {
          addScore(25, s.x, s.y - 6, C.blue, '+25');
        }
        hud();
        S.waveHits++;
        S.shot = null;
        if (S.waveHits >= PER_WAVE) {
          const bonus = 150 * S.wave + 50 * S.lives;
          S.wave++;
          if (S.wave > WAVES) { addScore(bonus, W / 2, H / 2 + 40, C.mint, `+${bonus} BONUS`); victory(); return; }
          S.waveHits = 0; hud();
          addScore(bonus, W / 2, H / 2 + 44, C.mint, `+${bonus} BONUS`);
          S.banner = { text: `WAVE ${S.wave}`, sub: S.wave === WAVES ? 'Final wave' : 'The swarm speeds up', t: 0, dur: 1.9, color: C.gold };
          sfx.level();
          S.eshots = []; S.saucer = null;
          resetFormation();
          kit.later(() => { if (!S.over) newPrompt(true, 1.7); }, 450);
          S.freeze = S.freezeMax = 2.4;
          S.invs.forEach(v => v.spawn = -1); // hidden until relabel
        } else {
          newPrompt(false, 1.5);
          S.invs[i].spawn = 0;
        }
      } else {
        S.shot = null;
        if (S.missed) { // already revealed: shots on wrong invaders just fizzle
          inv.hit = 0.35; fx.ring(s.x, s.y, C.dim, 22); sfx.tap();
          return;
        }
        S.missed = true; S.total++; S.streak = 0; hud();
        ctx.record(S.item, false);
        inv.hit = 0.6;
        fx.burst(s.x, s.y, 14, [C.spark, '#ffffff'], 140, 2.6);
        fx.ring(s.x, s.y, C.spark, 36);
        fx.flashIt(C.spark, 0.22); fx.shakeIt(7);
        sfx.bad();
        fx.pop(s.x, s.y - 4, 'SHIELD −1', C.spark, 16);
        kit.markPrompt('miss');
        loseLife();
      }
    }

    /* ---------- input ---------- */
    function canFire() { return !S.over && !S.shot && S.cool <= 0 && S.stun <= 0 && S.invs.length && S.banner == null; }
    function fire() {
      if (!canFire()) return false;
      S.shot = { x: S.px, y: PLAYER_Y - 20, py: PLAYER_Y - 20 };
      S.cool = 0.22; sfx.shoot();
      return true;
    }
    function onKey(k, down) {
      if (k === 'fire') { S.keyFire = down; if (down) { S.targetX = null; S.aimIdx = null; fire(); } }
      if ((k === 'left' || k === 'right') && down) { S.targetX = null; S.fireQ = 0; S.aimIdx = null; }
    }
    let ptr = null;
    kit.on(canvas, 'pointerdown', e => {
      if (!kit.active) return;
      e.preventDefault();
      const q = kit.st.toLogical(e);
      ptr = { id: e.pointerId, x0: q.x, drag: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      S.aimIdx = pickAt(q.x, q.y);
      S.targetX = S.aimIdx != null ? slot(S.aimIdx).x : U.clamp(q.x, 22, W - 22);
      S.fireQ = 1.4;
    });
    kit.on(canvas, 'pointermove', e => {
      if (!kit.active) return;
      const q = kit.st.toLogical(e);
      if (ptr && ptr.id === e.pointerId) {
        if (Math.abs(q.x - ptr.x0) > 14) { ptr.drag = true; S.fireQ = 0; S.aimIdx = null; }
        if (ptr.drag) S.targetX = U.clamp(q.x, 22, W - 22);
      } else if (e.pointerType === 'mouse' && S.fireQ <= 0) {
        S.aimIdx = null; S.targetX = U.clamp(q.x, 22, W - 22);
      }
    });
    // tapping an invader or its label aims at that invader's body
    function pickAt(x, y) {
      for (let i = 0; i < S.invs.length; i++) {
        const v = S.invs[i]; if (v.spawn < 0) continue;
        const s = slot(i), t = tagBox(v, s.x, s.y);
        if (Math.hypot(x - s.x, y - s.y) < R * 1.7 || (x > t.x - 4 && x < t.x + t.w + 4 && y > t.y - 4 && y < t.y + t.h + 4)) return i;
      }
      return null;
    }
    const endPtr = e => { if (ptr && ptr.id === e.pointerId) ptr = null; };
    kit.on(canvas, 'pointerup', endPtr); kit.on(canvas, 'pointercancel', endPtr);

    /* touch pad */
    const mk = (label, aria, cls) => ctx.h('button', { type: 'button', class: cls || '', 'aria-label': aria }, label);
    const bL = mk('◀', 'Move left'), bF = mk('FIRE', 'Fire', P + '-fire'), bR = mk('▶', 'Move right');
    kit.pad.append(bL, bF, bR);
    const hold = (b, onDown, onUp) => {
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (kit.paused) kit.setPaused(false); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } onDown(); });
      const up = () => { b.classList.remove('on'); onUp(); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
      b.addEventListener('contextmenu', e => e.preventDefault());
    };
    hold(bL, () => { S.padL = true; S.targetX = null; S.fireQ = 0; S.aimIdx = null; }, () => { S.padL = false; });
    hold(bR, () => { S.padR = true; S.targetX = null; S.fireQ = 0; S.aimIdx = null; }, () => { S.padR = false; });
    hold(bF, () => { S.padFire = true; S.targetX = null; fire(); }, () => { S.padFire = false; });

    /* ---------- update ---------- */
    function update(dt) {
      const k = kit.held;
      if (S.banner) { S.banner.t += dt; if (S.banner.t > S.banner.dur) S.banner = null; }
      if (S.over) {
        S.endT -= dt;
        if (S.endT <= 0) kit.end({ score: S.score, correct: S.correct, total: S.total, won: S.won,
          note: S.won ? `You cleared all ${WAVES} waves with ${S.lives} shield${S.lives === 1 ? '' : 's'} left. Best streak: ${S.bestStreak}.` : `You made it to wave ${S.wave} of ${WAVES}. Best streak: ${S.bestStreak}.` });
        updateShots(dt);
        return;
      }
      S.cool -= dt; S.stun = Math.max(0, S.stun - dt); S.hintT -= dt;
      if (S.scramble > 0) S.scramble -= dt;
      const frozen = S.freeze > 0;
      if (frozen) S.freeze -= dt;
      for (const v of S.invs) { if (v.spawn >= 0 && v.spawn < 1) v.spawn = Math.min(1, v.spawn + dt * 2.6); v.hit = Math.max(0, v.hit - dt); }

      // player movement
      const spd = W * (narrow ? 0.78 : 0.7);
      const dirIn = ((k.has('right') || S.padR) ? 1 : 0) - ((k.has('left') || S.padL) ? 1 : 0);
      if (dirIn) S.px += dirIn * spd * dt;
      else if (S.targetX != null) {
        if (S.aimIdx != null && S.invs[S.aimIdx]) S.targetX = U.clamp(slot(S.aimIdx).x, 22, W - 22);
        const d = S.targetX - S.px;
        S.px += Math.sign(d) * Math.min(Math.abs(d), spd * 1.15 * dt);
      }
      S.px = U.clamp(S.px, 22, W - 22);
      if (S.fireQ > 0) {
        if (S.stun <= 0) S.fireQ -= dt;
        if (S.targetX == null || Math.abs(S.targetX - S.px) < 3) { if (fire()) { S.fireQ = 0; S.aimIdx = null; } }
      }
      if ((S.keyFire || S.padFire) && !S.shot) fire();

      updateShots(dt);

      // formation march
      if (!frozen && !S.banner) {
        S.tickT -= dt;
        if (S.tickT <= 0) {
          const desc = U.clamp((S.fy - TOP_Y) / (DANGER_Y - TOP_Y - ROW_H * ROWS), 0, 1);
          S.tickT = TICK0 * Math.pow(0.86, S.wave - 1) * (1 - 0.28 * desc);
          S.frame ^= 1;
          const nx = S.fx + S.dir * dx;
          if (nx < 8 || nx + formW > W - 8) { S.fy += STEP; S.dir *= -1; }
          else S.fx = nx;
          sfx.tone([98, 92, 87, 82][S.note++ % 4], 0.07, 'square', 0.03);
        }
        // breach
        if (formationBottom() >= DANGER_Y) {
          fx.flashIt(C.spark, 0.3); fx.shakeIt(9); sfx.bad(); sfx.boom();
          S.banner = { text: 'BREACH!', sub: 'They reached your line', t: 0, dur: 1.5, color: C.spark };
          S.eshots = [];
          resetFormation();
          S.invs.forEach(v => v.spawn = 0);
          S.freeze = S.freezeMax = 1.6;
          S.streak = 0; hud();
          loseLife();
          return;
        }
        // inhibitory fire
        S.eT -= dt;
        if (S.eT <= 0) {
          S.eT = U.rand(1.7, 3.1) / (1 + 0.18 * (S.wave - 1));
          if (S.eshots.length < 2 + (S.wave > 2 ? 1 : 0)) {
            // prefer an invader in a column near the player, from the bottom row
            const cand = S.invs.map((v, i) => ({ i, s: slot(i), v })).filter(o => o.v.spawn >= 1);
            if (cand.length) {
              cand.sort((a, b) => Math.abs(a.s.x - S.px) - Math.abs(b.s.x - S.px));
              const o = Math.random() < 0.55 ? cand[0] : U.pick(cand);
              const tb = tagBox(o.v, o.s.x, o.s.y);
              S.eshots.push({ x: o.s.x + U.rand(-8, 8), y: tb.y + tb.h + 6, vy: (narrow ? 105 : 120) * (1 + 0.1 * (S.wave - 1)), w: Math.random() * 6 });
            }
          }
        }
      }
      // saucer: the "reward signal" drone
      if (S.saucer) {
        S.saucer.x += S.saucer.dir * (narrow ? 70 : 95) * dt;
        if (S.saucer.x < -40 || S.saucer.x > W + 40) { S.saucer = null; S.saucerT = U.rand(16, 26); }
      } else if (!S.banner) {
        S.saucerT -= dt;
        if (S.saucerT <= 0) { const d = Math.random() < 0.5 ? 1 : -1; S.saucer = { x: d > 0 ? -30 : W + 30, y: 24, dir: d }; sfx.tone(520, 0.35, 'sine', 0.04, 880); }
      }
    }
    function updateShots(dt) {
      // player bolt
      if (S.shot) {
        const sh = S.shot; sh.py = sh.y; sh.y -= (narrow ? 560 : 640) * dt;
        let done = false;
        if (S.saucer && Math.abs(sh.x - S.saucer.x) < 22 && sh.y < S.saucer.y + 9 && sh.py > S.saucer.y - 9) {
          const s = S.saucer; S.saucer = null; S.saucerT = U.rand(18, 28);
          fx.burst(s.x, s.y, 30, [C.gold, '#ffffff', C.orange], 220, 3); fx.ring(s.x, s.y, C.gold, 40);
          sfx.boom(); sfx.tone(880, 0.12, 'triangle', 0.1, null, 0.05); sfx.tone(1320, 0.18, 'triangle', 0.1, null, 0.15);
          addScore(150, s.x, s.y + 22, C.gold, '+150 REWARD');
          done = true;
        }
        if (!done && !S.over) {
          for (let i = 0; i < S.invs.length; i++) {
            const v = S.invs[i]; if (v.spawn < 0.6) continue;
            const s = slot(i);
            if (Math.abs(sh.x - s.x) < R + 3 && sh.y < s.y + R + 2 && sh.py > s.y - R - 8) { hitInvader(i); done = true; break; }
          }
        }
        if (!done) {
          for (let j = 0; j < S.eshots.length; j++) {
            const e = S.eshots[j];
            if (Math.abs(e.x - sh.x) < 9 && sh.y < e.y + 8 && sh.py > e.y - 8) {
              S.eshots.splice(j, 1); fx.burst(e.x, e.y, 12, [C.violet, '#ffffff'], 120, 2.4); sfx.blip(); done = true; addScore(10, e.x, e.y, C.violet, '+10'); break;
            }
          }
        }
        if (done || sh.y < -20) S.shot = null;
      }
      // inhibitory shots
      for (let j = S.eshots.length - 1; j >= 0; j--) {
        const e = S.eshots[j]; const py = e.y; e.y += e.vy * dt; e.w += dt * 7;
        let gone = false;
        const b = barrierHit(e.x, py, e.y, false);
        if (b) { fx.burst(b.x, b.y, 6, [C.violet], 70, 2); gone = true; }
        if (!gone && !S.over && Math.abs(e.x - S.px) < 19 && e.y > PLAYER_Y - 14 && e.y < PLAYER_Y + 12) {
          gone = true;
          S.stun = 1.3; S.streak = Math.max(0, S.streak); fx.burst(S.px, PLAYER_Y - 6, 18, [C.violet, '#ffffff'], 150, 2.6);
          fx.ring(S.px, PLAYER_Y, C.violet, 34); fx.flashIt(C.violet, 0.16); fx.shakeIt(4);
          sfx.tone(300, 0.3, 'sawtooth', 0.05, 90);
          fx.pop(S.px, PLAYER_Y - 30, 'INHIBITED', C.violet, 15);
        }
        if (gone || e.y > H + 10) S.eshots.splice(j, 1);
      }
    }

    /* ---------- draw ---------- */
    const bgGrad = g.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0A1020'); bgGrad.addColorStop(0.6, '#0B1426'); bgGrad.addColorStop(1, '#0F1B33');
    function draw(_g, t) {
      g.save();
      g.fillStyle = bgGrad; g.fillRect(0, 0, W, H);
      // drifting ions
      for (const s of stars) {
        if (!RM && !kit.paused) s.y += (6 + s.z * 14) / 60;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        g.globalAlpha = 0.25 + 0.35 * s.z * (0.6 + 0.4 * Math.sin(t * 2 + s.tw));
        g.fillStyle = s.z > 0.7 ? C.blue : C.dim;
        g.fillRect(s.x, s.y, s.z > 0.8 ? 2 : 1, s.z > 0.8 ? 2 : 1);
      }
      g.globalAlpha = 1;
      const [ox, oy] = fx.offset();
      g.translate(ox, oy);

      // danger line
      const near = S.invs.length ? U.clamp(1 - (DANGER_Y - formationBottom()) / 120, 0, 1) : 0;
      g.strokeStyle = C.spark; g.globalAlpha = 0.18 + 0.5 * near * (0.6 + 0.4 * Math.sin(t * 8));
      g.setLineDash([6, 8]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, DANGER_Y); g.lineTo(W, DANGER_Y); g.stroke(); g.setLineDash([]);
      g.globalAlpha = 1;

      // barriers
      for (const b of barriers) {
        g.fillStyle = C.mint; g.globalAlpha = 0.72;
        for (let r = 0; r < BR; r++) for (let c = 0; c < BC; c++) if (b.cells[r * BC + c]) g.fillRect(b.x + c * BS, b.y + r * BS, BS, BS);
        g.globalAlpha = 0.95; g.fillStyle = '#B8FFE6';
        for (let c = 0; c < BC; c++) { for (let r = 0; r < BR; r++) if (b.cells[r * BC + c]) { g.fillRect(b.x + c * BS, b.y + r * BS, BS, 1); break; } }
      }
      g.globalAlpha = 1;

      // saucer
      if (S.saucer) drawSaucer(S.saucer.x, S.saucer.y, t);

      // invaders
      const ans = S.item ? answerIdx() : -1;
      S.invs.forEach((v, i) => drawInvader(v, i, i === ans, t));

      // shots
      if (S.shot) drawBolt(S.shot.x, S.shot.y, t);
      for (const e of S.eshots) drawInhib(e, t);

      // player
      if (!(S.over && !S.won)) drawPlayer(t);

      // membrane floor
      g.strokeStyle = C.mint; g.globalAlpha = 0.5; g.lineWidth = 2;
      g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, H - 6 + Math.sin(x * 0.08 + t * 2) * 1.5); g.stroke();
      g.globalAlpha = 1;

      fx.draw(g);
      g.restore();

      // read bar
      if (S.freeze > 0 && !S.over && !S.banner) {
        const k = U.clamp(S.freeze / S.freezeMax, 0, 1);
        g.fillStyle = 'rgba(255,209,102,.18)'; g.fillRect(0, 0, W, 4);
        g.fillStyle = C.gold; g.fillRect(0, 0, W * k, 4);
        g.font = `700 11px ${F.mono}`; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillStyle = C.gold;
        g.fillText('READ', W - 6, 8);
      }
      if (S.hintT > 0 && !S.over && S.wave === 1 && S.correct === 0 && !S.missed) {
        g.globalAlpha = Math.min(1, S.hintT);
        g.font = `700 13px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.dim;
        g.fillText(narrow ? 'Tap an invader to fire at it' : '← → to move · Space to fire', W / 2, DANGER_Y - 16);
        g.globalAlpha = 1;
      }
      if (S.banner) drawBanner(S.banner);
      fx.drawFlash(g);
    }
    function drawInvader(v, i, isAns, t) {
      if (v.spawn < 0) return;
      const s = slot(i);
      const sc = RM ? (v.spawn > 0 ? 1 : 0) : easeBack(v.spawn);
      if (sc <= 0.01) return;
      const reveal = S.missed;
      const dim = reveal && !isAns;
      const col = v.hit > 0 && Math.floor(v.hit * 14) % 2 === 0 ? C.spark : ROW_COL[v.row];
      g.save();
      g.globalAlpha = dim ? 0.32 : 1;
      g.translate(s.x, s.y);
      // body + tendrils
      g.save(); g.scale(sc, sc);
      const bob = RM ? 0 : Math.sin(t * 3 + i) * 1.2;
      g.translate(0, bob);
      g.strokeStyle = col; g.lineWidth = 2.2; g.lineCap = 'round';
      const n = 7;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (S.frame ? 0.22 : 0) + i;
        const wig = RM ? 0 : Math.sin(t * 4 + k * 1.7 + i) * 0.28;
        const r0 = R * 0.8, r1 = R * 1.55;
        const ex = Math.cos(a + wig) * r1, ey = Math.sin(a + wig) * r1;
        const mx = Math.cos(a - wig * 1.5) * (r0 + r1) / 2, my = Math.sin(a - wig * 1.5) * (r0 + r1) / 2;
        g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
        g.fillStyle = col; g.beginPath(); g.arc(ex, ey, 2.4, 0, 6.283); g.fill();
      }
      const grd = g.createRadialGradient(-R * 0.3, -R * 0.35, 1, 0, 0, R);
      grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.25, col); grd.addColorStop(1, shade(col));
      g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.fill();
      // eyes look toward the player
      const look = U.clamp((S.px - s.x) / 200, -1, 1) * 1.6;
      g.fillStyle = '#ffffff';
      g.beginPath(); g.ellipse(-R * 0.36, -R * 0.12, R * 0.24, R * 0.29, 0, 0, 6.283); g.ellipse(R * 0.36, -R * 0.12, R * 0.24, R * 0.29, 0, 0, 6.283); g.fill();
      g.fillStyle = '#0B1222';
      g.beginPath(); g.arc(-R * 0.36 + look, -R * 0.05, R * 0.12, 0, 6.283); g.arc(R * 0.36 + look, -R * 0.05, R * 0.12, 0, 6.283); g.fill();
      g.strokeStyle = '#0B1222'; g.lineWidth = 1.6;
      g.beginPath();
      if (S.frame) { g.moveTo(-R * 0.3, R * 0.38); g.lineTo(-R * 0.1, R * 0.5); g.lineTo(R * 0.1, R * 0.38); g.lineTo(R * 0.3, R * 0.5); }
      else { g.arc(0, R * 0.42, R * 0.16, 0, 6.283); }
      g.stroke();
      g.restore();
      // label tag
      const tb = tagBox(v, 0, 0);
      const glow = isAns && reveal;
      g.globalAlpha = (dim ? 0.32 : 1) * Math.min(1, sc);
      if (glow && !RM) { g.shadowColor = C.gold; g.shadowBlur = 14 + 6 * Math.sin(t * 8); }
      ML.roundRect(g, tb.x, tb.y, tb.w, tb.h, 7);
      g.fillStyle = glow ? '#2A2410' : 'rgba(18,28,51,.94)'; g.fill();
      g.shadowBlur = 0;
      g.lineWidth = glow ? 2.5 : 1.4; g.strokeStyle = glow ? C.gold : col; g.stroke();
      g.font = `700 ${v.lab.size}px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = glow ? C.gold : C.ink;
      v.lab.lines.forEach((ln, li) => {
        const txt = S.scramble > 0 ? ln.replace(/\S/g, () => '#*+=%&@'[Math.random() * 7 | 0]) : ln;
        g.fillText(txt, 0, tb.y + 5 + tb.lh * li + tb.lh / 2);
      });
      if (glow) {
        const by = -R - 22 + (RM ? 0 : Math.sin(t * 7) * 3);
        g.fillStyle = C.gold; g.beginPath(); g.moveTo(-8, by); g.lineTo(8, by); g.lineTo(0, by + 10); g.closePath(); g.fill();
      }
      g.restore();
    }
    function drawPlayer(t) {
      const x = S.px, y = PLAYER_Y, stun = S.stun > 0;
      g.save(); g.translate(x, y);
      const body = stun ? '#5B6A8A' : C.carolina, hi = stun ? '#8EA0C4' : C.blue;
      // dendrite fins
      g.strokeStyle = hi; g.lineWidth = 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-14, 4); g.lineTo(-24, 10); g.moveTo(-10, 8); g.lineTo(-16, 15); g.moveTo(14, 4); g.lineTo(24, 10); g.moveTo(10, 8); g.lineTo(16, 15); g.stroke();
      // base
      g.fillStyle = body; g.beginPath(); g.moveTo(-20, 12); g.lineTo(20, 12); g.lineTo(13, -2); g.lineTo(-13, -2); g.closePath(); g.fill();
      // soma dome
      const grd = g.createRadialGradient(-3, -6, 1, 0, -2, 11); grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.4, hi); grd.addColorStop(1, body);
      g.fillStyle = grd; g.beginPath(); g.arc(0, -2, 10, Math.PI, 0); g.fill();
      // axon barrel
      g.fillStyle = hi; ML.roundRect(g, -3, -20, 6, 14, 2); g.fill();
      const ready = canFire();
      g.fillStyle = ready ? C.gold : '#5B6A8A'; g.beginPath(); g.arc(0, -20, 3.2, 0, 6.283); g.fill();
      if (ready && !RM) { g.globalAlpha = 0.35 + 0.25 * Math.sin(t * 10); g.beginPath(); g.arc(0, -20, 6, 0, 6.283); g.fill(); g.globalAlpha = 1; }
      if (stun) {
        g.strokeStyle = C.violet; g.lineWidth = 2; g.globalAlpha = 0.85;
        g.beginPath();
        for (let k = 0; k < 3; k++) { const a = t * 6 + k * 2.09; g.moveTo(Math.cos(a) * 22, Math.sin(a) * 9 - 4); g.lineTo(Math.cos(a + 0.6) * 22, Math.sin(a + 0.6) * 9 - 4); }
        g.stroke(); g.globalAlpha = 1;
      }
      g.restore();
    }
    function drawBolt(x, y, t) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
      const j = RM ? 0 : (Math.floor(t * 30) % 2 ? 2 : -2);
      const path = () => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + j, y + 5); g.lineTo(x - j, y + 10); g.lineTo(x, y + 16); };
      g.strokeStyle = 'rgba(255,107,129,.55)'; g.lineWidth = 7; path(); g.stroke();
      g.strokeStyle = C.gold; g.lineWidth = 3.2; path(); g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; path(); g.stroke();
      g.restore();
    }
    function drawInhib(e, t) {
      const x = e.x + (RM ? 0 : Math.sin(e.w) * 3);
      g.save();
      g.fillStyle = 'rgba(183,156,246,.28)'; g.beginPath(); g.arc(x, e.y, 9, 0, 6.283); g.fill();
      g.fillStyle = C.violet; g.beginPath(); g.arc(x, e.y, 5.5, 0, 6.283); g.fill();
      g.strokeStyle = '#0B1222'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 3, e.y); g.lineTo(x + 3, e.y); g.stroke();
      g.restore();
    }
    function drawSaucer(x, y, t) {
      g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(255,209,102,.18)'; g.beginPath(); g.ellipse(0, 0, 30, 13, 0, 0, 6.283); g.fill();
      g.fillStyle = C.gold; g.beginPath(); g.ellipse(0, 2, 22, 7, 0, 0, 6.283); g.fill();
      g.fillStyle = '#FFF1C7'; g.beginPath(); g.ellipse(0, -2, 10, 7, 0, Math.PI, 0); g.fill();
      for (let k = -2; k <= 2; k++) { g.fillStyle = (Math.floor(t * 8) + k) % 2 ? C.orange : '#ffffff'; g.beginPath(); g.arc(k * 8, 3, 1.8, 0, 6.283); g.fill(); }
      g.font = `700 10px ${F.mono}`; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = C.gold;
      g.fillText('DOPAMINE', 0, 11);
      g.restore();
    }
    function drawBanner(b) {
      const k = U.clamp(b.t / 0.35, 0, 1), out = b.dur < 5 ? U.clamp((b.dur - b.t) / 0.35, 0, 1) : 1;
      const sc = RM ? 1 : 0.6 + 0.4 * easeBack(k);
      g.save(); g.globalAlpha = Math.min(k, out);
      const by = DANGER_Y - 64;
      g.fillStyle = 'rgba(8,13,26,.6)'; g.fillRect(0, by - 40, W, 96);
      g.translate(W / 2, by); g.scale(sc, sc);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      ctx.fitText(g, b.text, W - 40, narrow ? 36 : 50, F.display, '400');
      g.lineWidth = 6; g.strokeStyle = '#0B1222'; g.strokeText(b.text, 0, 0);
      g.fillStyle = b.color; g.fillText(b.text, 0, 0);
      if (b.sub) { g.font = `700 15px ${F.body}`; g.fillStyle = C.ink; g.fillText(b.sub, 0, 34); }
      g.restore();
    }
    function easeBack(x) { const c1 = 1.70158, c3 = c1 + 1; return x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    function shade(hex) {
      const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * 0.45 | 0, gg = ((n >> 8) & 255) * 0.45 | 0, b = (n & 255) * 0.45 | 0;
      return `rgb(${r},${gg},${b})`;
    }

    /* ---------- start ---------- */
    resetFormation();
    kit.setLives(LIVES, LIVES); hud();
    newPrompt(true, 2.2);
    kit.root.__dbg = { S, slot, answerIdx, tagBox, W, H, PLAYER_Y };
    return () => kit.destroy();
  }
});
})();
