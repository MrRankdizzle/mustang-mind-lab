/* Mustang Mind Lab — core: helpers, state, sound, confetti, registries, CFU engine, lesson renderer, views */
(function () {
'use strict';
const ML = window.ML = window.ML || {};
ML.widgets = ML.widgets || {};
ML.games = ML.games || {};
ML.gameOrder = ML.gameOrder || [];
ML.registerWidget = (id, def) => { ML.widgets[id] = def; };
ML.registerGame = (def) => { ML.games[def.id] = def; if (!ML.gameOrder.includes(def.id)) ML.gameOrder.push(def.id); };

/* ================= helpers ================= */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
ML.util = { h, svgEl, esc, shuffle, sample, clamp, rand, pick };

/* ================= state ================= */
const KEY = 'mustang-mind-lab-v1';
const DEFAULTS = () => ({
  name: '', xp: 0, lessons: {}, steps: {}, cfu: {}, games: {}, quizzes: [], termStats: {},
  settings: { sound: true, reduceMotion: false, theme: 'system', blanks: true, arcadeTopics: [] },
  lastLesson: null, created: Date.now()
});
function load() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return null; return JSON.parse(raw); } catch (e) { return null; }
}
let state = Object.assign(DEFAULTS(), load() || {});
state.settings = Object.assign(DEFAULTS().settings, state.settings || {});
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } }
ML.state = () => state;
ML.save = save;

function addXP(n) {
  if (!n) return;
  state.xp += n; save();
  const pill = document.getElementById('xp-pill');
  if (pill) { pill.querySelector('b').textContent = state.xp; pill.classList.remove('pop'); void pill.offsetWidth; pill.classList.add('pop'); }
}
ML.addXP = addXP;
ML.reduceMotion = () => !!state.settings.reduceMotion;

function applySettings() {
  const root = document.documentElement;
  if (state.settings.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', state.settings.theme);
  document.body.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
}

/* ================= sound ================= */
const sfx = (() => {
  let ac = null;
  function ctx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, dur = 0.1, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
    if (!state.settings.sound) return;
    const c = ctx(); if (!c) return;
    const t0 = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.25, vol = 0.15) {
    if (!state.settings.sound) return;
    const c = ctx(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = c.createBufferSource(), g = c.createGain(); g.gain.value = vol;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    s.buffer = buf; s.connect(f).connect(g).connect(c.destination); s.start();
  }
  return {
    unlock: () => ctx(),
    tone, noise,
    tap: () => tone(620, 0.05, 'square', 0.04),
    blip: () => tone(1180, 0.04, 'sine', 0.06),
    good: () => { tone(523, 0.09, 'triangle', 0.14); tone(784, 0.14, 'triangle', 0.14, null, 0.07); },
    bad: () => tone(220, 0.22, 'sawtooth', 0.06, 120),
    shoot: () => tone(900, 0.08, 'square', 0.035, 300),
    boom: () => noise(0.3, 0.2),
    flip: () => tone(440, 0.06, 'triangle', 0.06, 660),
    level: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'triangle', 0.12, null, i * 0.08)),
    win: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.13, null, i * 0.09)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.18, 'sawtooth', 0.05, null, i * 0.12)),
    fire: () => { tone(200, 0.05, 'square', 0.06, 1600); tone(1600, 0.12, 'sine', 0.05, 300, 0.05); }
  };
})();
ML.sfx = sfx;

/* ================= confetti ================= */
let confCanvas, confParts = [], confRunning = false;
function confetti(x, y, n = 90) {
  if (state.settings.reduceMotion) return;
  if (!confCanvas) { confCanvas = h('canvas', { id: 'confetti', 'aria-hidden': 'true' }); document.body.append(confCanvas); }
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  confCanvas.width = W * dpr; confCanvas.height = H * dpr;
  const cx = x ?? W / 2, cy = y ?? H / 3;
  const cols = ['#4B9CD3', '#8CC4EA', '#FF6B81', '#FFD166', '#35E3A7', '#FFFFFF'];
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(4, 12);
    confParts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: rand(4, 8), c: pick(cols), rot: rand(0, 6), vr: rand(-.3, .3), life: 0, shape: Math.random() < .5 ? 0 : 1 });
  }
  if (!confRunning) { confRunning = true; requestAnimationFrame(confStep); }
}
function confStep() {
  const g = confCanvas.getContext('2d'), dpr = confCanvas.width / innerWidth;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
  confParts = confParts.filter(p => p.life < 150 && p.y < innerHeight + 40);
  for (const p of confParts) {
    p.life++; p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - p.life / 150);
    if (p.shape) g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); else { g.beginPath(); g.arc(0, 0, p.r / 2.4, 0, 7); g.fill(); }
    g.restore();
  }
  if (confParts.length) requestAnimationFrame(confStep); else { confRunning = false; g.clearRect(0, 0, innerWidth, innerHeight); }
}
ML.confetti = confetti;

/* ================= toast ================= */
let toastWrap;
function toast(msg, ms = 2200) {
  if (!toastWrap) { toastWrap = h('div', { class: 'toast-wrap', role: 'status', 'aria-live': 'polite' }); document.body.append(toastWrap); }
  const t = h('div', { class: 'toast' }, msg); toastWrap.append(t);
  setTimeout(() => t.remove(), ms);
}
ML.toast = toast;

/* ================= data access ================= */
ML.term = id => ML.data.termIndex[id];
ML.topic = id => ML.data.topics.find(t => t.id === id);
ML.lesson = id => ML.data.lessons.find(l => l.id === id);
ML.termsFor = (topicIds) => {
  const all = ML.data.terms;
  if (!topicIds || !topicIds.length) return all.slice();
  return all.filter(t => topicIds.includes(t.topic));
};
ML.arcadeTopics = () => state.settings.arcadeTopics || [];

/* Deck of term→definition items with smart distractors. next(k) returns
   { prompt, answer: term, choices: [term...k], type:'def' } */
ML.makeDeck = function (pool, opts = {}) {
  const all = ML.data.terms;
  pool = pool && pool.length >= 4 ? pool : all;
  let queue = [];
  const retry = [];
  let last = null;
  function draw() {
    if (retry.length && Math.random() < 0.35) return retry.shift();
    if (!queue.length) queue = shuffle(pool);
    let t = queue.pop();
    if (t === last && queue.length) { queue.unshift(t); t = queue.pop(); }
    return t;
  }
  function next(k = 3) {
    const ans = draw(); last = ans;
    const used = new Set([ans.id]);
    const labels = new Set([ans.s.toLowerCase()]);
    const out = [];
    const take = (list, n) => { for (const t of shuffle(list)) { if (out.length >= n) break; if (used.has(t.id) || labels.has(t.s.toLowerCase())) continue; used.add(t.id); labels.add(t.s.toLowerCase()); out.push(t); } };
    const sameGroup = pool.filter(t => t.g === ans.g);
    take(sameGroup, Math.ceil((k - 1) / 2));
    take(pool.filter(t => t.topic === ans.topic), k - 1);
    take(pool, k - 1);
    take(all, k - 1);
    const item = { type: 'def', prompt: ans.d, answer: ans, choices: shuffle([ans, ...out]) };
    item.miss = () => { if (!retry.includes(ans)) retry.push(ans); };
    return item;
  }
  return { next, size: pool.length };
};

function recordTerm(id, correct) {
  if (!id) return;
  const s = state.termStats[id] || (state.termStats[id] = [0, 0]);
  s[correct ? 0 : 1]++;
}

/* ================= canvas helpers for games ================= */
ML.arcade = { bg: '#0B1222', panel: '#121C33', line: '#24325A', ink: '#E8F0FF', dim: '#8EA0C4', blue: '#7CC0EE', carolina: '#4B9CD3', spark: '#FF6B81', mint: '#35E3A7', gold: '#FFD166', violet: '#B79CF6', orange: '#FF9F5A' };
ML.fonts = { display: '"Bungee", Impact, "Arial Black", sans-serif', body: '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, Menlo, monospace' };

/* stage(el, W, H): creates a DPR-sharp canvas with a fixed logical size that scales to fit. */
ML.stage = function (el, W, H, opts = {}) {
  const wrap = h('div', { class: 'arcade-screen' });
  const c = h('canvas', { role: 'img', 'aria-label': opts.label || 'Game screen', tabindex: '0' });
  wrap.append(c); el.append(wrap);
  const g = c.getContext('2d');
  const reserve = opts.reserve ?? 250;
  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    wrap.style.maxWidth = `max(300px, calc((100dvh - ${reserve}px) * ${W / H}))`;
  }
  fit();
  const onR = () => fit(); window.addEventListener('resize', onR);
  function toLogical(e) {
    const r = c.getBoundingClientRect();
    const p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: (p.clientX - r.left) * W / r.width, y: (p.clientY - r.top) * H / r.height };
  }
  return { canvas: c, g, W, H, wrap, toLogical, destroy() { window.removeEventListener('resize', onR); } };
};

/* loop(fn): rAF loop passing dt seconds (capped). Returns { stop, pause, resume, running } */
ML.loop = function (fn) {
  let id = 0, last = 0, paused = false, stopped = false;
  function frame(t) {
    if (stopped) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
    if (!paused) fn(dt, t);
    id = requestAnimationFrame(frame);
  }
  id = requestAnimationFrame(frame);
  const vis = () => { if (document.hidden) paused = true; };
  document.addEventListener('visibilitychange', vis);
  return {
    stop() { stopped = true; cancelAnimationFrame(id); document.removeEventListener('visibilitychange', vis); },
    pause() { paused = true; }, resume() { paused = false; last = 0; },
    get paused() { return paused; }
  };
};

/* fitText(g, text, maxW, size, family, weight): sets g.font to the largest size ≤ size that fits; returns size */
ML.fitText = function (g, text, maxW, size, family = ML.fonts.body, weight = '700') {
  let s = size;
  g.font = `${weight} ${s}px ${family}`;
  while (s > 8 && g.measureText(text).width > maxW) { s -= 1; g.font = `${weight} ${s}px ${family}`; }
  return s;
};
/* wrapText: draws wrapped text centered at x; returns height used */
ML.wrapText = function (g, text, x, y, maxW, lineH) {
  const words = String(text).split(/\s+/); let line = '', lines = [];
  for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
  if (line) lines.push(line);
  lines.forEach((l, i) => g.fillText(l, x, y + i * lineH));
  return lines.length * lineH;
};
ML.roundRect = function (g, x, y, w, h2, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h2, r); g.arcTo(x + w, y + h2, x, y + h2, r); g.arcTo(x, y + h2, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};

/* ================= icons ================= */
const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  learn: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" transform="translate(0 -1)"/>',
  arcade: '<rect x="2.5" y="7" width="19" height="11" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10.5v4M5 12.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="11.5" r="1.3" fill="currentColor"/><circle cx="18.2" cy="13.8" r="1.3" fill="currentColor"/>',
  prove: '<path d="M12 2l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 15.6 6.6 18.5l1.2-6L3.3 8.3l6.1-.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  gear: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
  book: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-4a3 3 0 0 0-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
};
function icon(name, cls = 'nav-ico') {
  const s = svgEl('svg', { viewBox: '0 0 24 24', class: cls, 'aria-hidden': 'true' }); s.innerHTML = ICONS[name] || ''; return s;
}
ML.icon = icon;
const BRAIN_MARK = `<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#0B1222"/><path d="M24 11c-3-3-9-2-10 3-4 0-6 5-3 8-3 3-1 8 3 8 0 4 5 6 8 3l2-1V11z" fill="none" stroke="#7CC0EE" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 11c3-3 9-2 10 3 4 0 6 5 3 8 3 3 1 8-3 8 0 4-5 6-8 3l-2-1" fill="none" stroke="#4B9CD3" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 38h9l3-6 4 10 3-7h13" fill="none" stroke="#FF6B81" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ================= text markup =================
   {{word}} → tap-to-reveal blue blank (guided notes). Raw HTML allowed. */
function rich(html) {
  const span = h('span');
  span.innerHTML = String(html).replace(/\{\{(.+?)\}\}/g, (_, w) => `<button type="button" class="blank" data-w="${esc(w)}">${w}</button>`);
  span.querySelectorAll('.blank').forEach(b => {
    if (!state.settings.blanks) { b.classList.add('open'); b.tabIndex = -1; return; }
    b.setAttribute('aria-label', 'Hidden word. Tap to reveal');
    b.addEventListener('click', () => { if (b.classList.contains('open')) return; b.classList.add('open'); b.removeAttribute('aria-label'); sfx.blip(); });
  });
  return span;
}
ML.rich = rich;

/* ================= CFU engine =================
   q: {type:'mc'|'tf'|'sort'|'order'|'match', id, q, choices, a, why, bins, items, pairs}
   renderCFU(q, onDone(firstTryCorrect)) */
function renderCFU(q, onDone, opts = {}) {
  const box = h('div', { class: 'cfu fade-in' });
  const tag = h('div', { class: 'cfu-tag' }, icon('bolt', 'nav-ico'), opts.label || 'Check for understanding');
  box.append(tag);
  if (q.q) box.append(h('p', { class: 'cfu-q' }, rich(q.q)));
  const why = h('div', { class: 'cfu-why', hidden: true, 'aria-live': 'polite' });
  let first = true, finished = false;
  const prev = q.id && state.cfu[q.id];
  function finish() {
    if (finished) return; finished = true;
    box.classList.add(opts.oneShot && !first ? 'missed' : 'done');
    tag.lastChild.textContent = first ? 'Nailed it — first try' : (opts.oneShot ? 'Review the explanation' : 'Got it');
    if (q.id && !state.cfu[q.id]) { state.cfu[q.id] = { c: first ? 1 : 0, t: Date.now() }; if (first) addXP(10); else addXP(3); save(); }
    if (first) { sfx.good(); const r = box.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + 30, 40); }
    onDone && onDone(first);
  }
  function showWhy(text, ok) {
    if (!text) { why.hidden = true; return; }
    why.hidden = false; why.className = 'cfu-why' + (ok ? '' : ' try'); why.innerHTML = ''; why.append(rich(text));
  }
  const type = q.type || 'mc';
  if (type === 'mc' || type === 'tf') {
    const choices = type === 'tf' ? ['True', 'False'] : q.choices;
    const answer = type === 'tf' ? (q.a ? 0 : 1) : q.a;
    const order = type === 'tf' || q.keep ? choices.map((_, i) => i) : shuffle(choices.map((_, i) => i));
    const wrap = h('div', { class: 'cfu-choices', role: 'group', 'aria-label': 'Answer choices' });
    order.forEach((ci, k) => {
      const b = h('button', { type: 'button', class: 'choice' }, h('span', { class: 'letter' }, 'ABCDEFG'[k]), h('span', null, rich(choices[ci])));
      b._ci = ci;
      b.addEventListener('click', () => {
        if (finished) return;
        if (ci === answer) {
          b.classList.add('right'); wrap.querySelectorAll('.choice').forEach(x => x.disabled = true);
          showWhy(q.why || '', true); finish();
        } else if (opts.oneShot) {
          first = false; b.classList.add('wrong'); sfx.bad();
          wrap.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x._ci === answer) x.classList.add('right'); });
          showWhy('The correct answer is highlighted in green. ' + (q.why || ''), false); finish();
        } else {
          first = false; b.classList.add('wrong'); b.disabled = true; sfx.bad();
          box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
          showWhy(q.hint || 'Not quite. Reread the question and try another answer.', false);
        }
      });
      wrap.append(b);
    });
    box.append(wrap);
  } else if (type === 'sort') {
    buildSort(box, q, ok => { if (!ok) first = false; }, () => { showWhy(q.why || '', true); finish(); }, showWhy);
  } else if (type === 'order') {
    buildOrder(box, q, ok => { if (!ok) first = false; }, () => { showWhy(q.why || '', true); finish(); }, showWhy);
  } else if (type === 'match') {
    buildMatch(box, q, ok => { if (!ok) first = false; }, () => { showWhy(q.why || '', true); finish(); }, showWhy);
  }
  box.append(why);
  if (prev && opts.allowSkip !== false) {
    const skip = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', style: { justifySelf: 'start' } }, 'Already answered — continue');
    skip.addEventListener('click', () => { skip.remove(); finished = true; box.classList.add('done'); onDone && onDone(!!prev.c, true); });
    box.append(skip);
  }
  return box;
}
ML.renderCFU = renderCFU;

function makeDraggable(tok, getTargets, onDrop) {
  let sx, sy, dragging = false, ghost = null, pid = null;
  tok.addEventListener('pointerdown', e => {
    if (tok.disabled) return;
    sx = e.clientX; sy = e.clientY; pid = e.pointerId; dragging = false;
    tok.setPointerCapture(pid);
  });
  tok.addEventListener('pointermove', e => {
    if (pid !== e.pointerId) return;
    if (!dragging && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
      dragging = true;
      ghost = tok.cloneNode(true); ghost.classList.add('dragging'); document.body.append(ghost);
      tok.style.opacity = '.35';
    }
    if (dragging) {
      ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (e.clientY - ghost.offsetHeight / 2) + 'px';
      getTargets().forEach(t => { const r = t.getBoundingClientRect(); t.classList.toggle('hot', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); });
    }
  });
  const end = e => {
    if (pid !== e.pointerId) return; pid = null;
    if (dragging) {
      tok.dataset.dragged = '1';
      ghost && ghost.remove(); ghost = null; tok.style.opacity = '';
      const hit = getTargets().find(t => { const r = t.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
      getTargets().forEach(t => t.classList.remove('hot'));
      if (hit) onDrop(hit);
      setTimeout(() => { delete tok.dataset.dragged; }, 50);
    }
    dragging = false;
  };
  tok.addEventListener('pointerup', end); tok.addEventListener('pointercancel', end);
}
ML.makeDraggable = makeDraggable;

function buildSort(box, q, onCheck, onSolved, showWhy) {
  const tray = h('div', { class: 'sort-tray', 'aria-label': 'Items to sort' });
  const bins = q.bins.map((name, i) => {
    const items = h('div', { class: 'sort-bin-items' });
    const bin = h('div', { class: 'sort-bin', role: 'button', tabindex: '0', 'data-i': i, 'aria-label': `Place selected item in ${name}` }, h('div', { class: 'sort-bin-name' }, name), items);
    bin._items = items; return bin;
  });
  let selected = null;
  const tokens = shuffle(q.items).map(it => {
    const tok = h('button', { type: 'button', class: 'token', 'aria-pressed': 'false' }, it.t);
    tok._bin = it.bin; tok._at = -1;
    tok.addEventListener('click', () => {
      if (tok.dataset.dragged) return;
      if (tok.classList.contains('right')) return;
      if (selected === tok) { selected = null; tok.setAttribute('aria-pressed', 'false'); return; }
      tokens.forEach(t => t.setAttribute('aria-pressed', 'false'));
      selected = tok; tok.setAttribute('aria-pressed', 'true'); sfx.tap();
    });
    makeDraggable(tok, () => bins, bin => place(tok, +bin.dataset.i));
    tray.append(tok); return tok;
  });
  function place(tok, i) {
    tok.classList.remove('wrong'); tok._at = i; bins[i]._items.append(tok); tok.setAttribute('aria-pressed', 'false'); selected = null; sfx.tap();
    check.disabled = tokens.some(t => t._at < 0);
  }
  bins.forEach((bin, i) => {
    const go = () => { if (selected) place(selected, i); };
    bin.addEventListener('click', e => { if (e.target.closest('.token')) return; go(); });
    bin.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  const check = h('button', { type: 'button', class: 'btn btn-primary', disabled: true }, 'Check my sort');
  check.addEventListener('click', () => {
    let allOk = true;
    tokens.forEach(t => { const ok = t._at === t._bin; if (!ok) allOk = false; t.classList.toggle('right', ok); t.classList.toggle('wrong', !ok); if (ok) t.disabled = true; });
    onCheck(allOk);
    if (allOk) { check.remove(); onSolved(); }
    else {
      sfx.bad(); showWhy('The red items are in the wrong group. They went back to the tray. Try again.', false);
      setTimeout(() => { tokens.filter(t => t.classList.contains('wrong')).forEach(t => { t.classList.remove('wrong'); t._at = -1; tray.append(t); }); check.disabled = true; }, 900);
    }
  });
  box.append(h('p', { class: 'muted', style: { fontSize: '15px' } }, 'Drag each item into a group, or tap an item and then tap a group.'), tray, h('div', { class: 'sort-bins' }, bins), check);
}

function buildOrder(box, q, onCheck, onSolved, showWhy) {
  const correct = q.items.slice();
  let cur = shuffle(correct);
  if (cur.every((x, i) => x === correct[i])) cur = cur.reverse();
  const list = h('ol', { class: 'order-list' });
  function draw(flash) {
    list.innerHTML = '';
    cur.forEach((txt, i) => {
      const up = h('button', { type: 'button', 'aria-label': `Move "${txt}" up`, disabled: i === 0 }, '↑');
      const dn = h('button', { type: 'button', 'aria-label': `Move "${txt}" down`, disabled: i === cur.length - 1 }, '↓');
      up.onclick = () => { [cur[i - 1], cur[i]] = [cur[i], cur[i - 1]]; sfx.tap(); draw(); list.children[i - 1]?.querySelector('button')?.focus(); };
      dn.onclick = () => { [cur[i + 1], cur[i]] = [cur[i], cur[i + 1]]; sfx.tap(); draw(); list.children[i + 1]?.querySelectorAll('button')[1]?.focus(); };
      const li = h('li', { class: 'order-item' + (flash ? (txt === correct[i] ? ' right' : ' wrong') : '') }, h('span', { class: 'num' }, i + 1), h('span', null, txt), h('span', { class: 'order-btns' }, up, dn));
      list.append(li);
    });
  }
  draw();
  const check = h('button', { type: 'button', class: 'btn btn-primary' }, 'Check my order');
  check.onclick = () => {
    const ok = cur.every((x, i) => x === correct[i]);
    onCheck(ok); draw(true);
    if (ok) { check.remove(); list.querySelectorAll('button').forEach(b => b.disabled = true); onSolved(); }
    else { sfx.bad(); showWhy('Green steps are in the right spot. Move the red ones and check again.', false); }
  };
  box.append(h('p', { class: 'muted', style: { fontSize: '15px' } }, 'Use the arrows to put the steps in order, top to bottom.'), list, check);
}

function buildMatch(box, q, onCheck, onSolved, showWhy) {
  const colors = ['#4B9CD3', '#FF6B81', '#35B88A', '#E0A030', '#9B7BEA', '#3BB3C3', '#D96BB5', '#7A8CA8'];
  const left = q.pairs.map((p, i) => ({ t: p[0], i })), right = shuffle(q.pairs.map((p, i) => ({ t: p[1], i })));
  const pairs = new Map(); // leftIdx -> rightIdx
  let selL = null;
  const lBtns = left.map(L => h('button', { type: 'button', class: 'match-btn', 'aria-pressed': 'false' }, h('span', { class: 'pair-dot', style: { background: 'transparent' } }), L.t));
  const rBtns = right.map(R => h('button', { type: 'button', class: 'match-btn' }, h('span', { class: 'pair-dot', style: { background: 'transparent' } }), R.t));
  function paint() {
    lBtns.forEach((b, li) => { const has = pairs.has(li); b.classList.toggle('paired', has); b.firstChild.style.background = has ? colors[li % colors.length] : 'transparent'; });
    rBtns.forEach((b, ri) => { let owner = null; pairs.forEach((r, l) => { if (r === ri) owner = l; }); b.classList.toggle('paired', owner != null); b.firstChild.style.background = owner != null ? colors[owner % colors.length] : 'transparent'; });
    check.disabled = pairs.size < left.length;
  }
  lBtns.forEach((b, li) => b.onclick = () => { if (b.classList.contains('right')) return; selL = li; lBtns.forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); sfx.tap(); });
  rBtns.forEach((b, ri) => b.onclick = () => {
    if (selL == null || b.classList.contains('right')) return;
    pairs.forEach((r, l) => { if (r === ri) pairs.delete(l); });
    pairs.set(selL, ri); lBtns[selL].setAttribute('aria-pressed', 'false'); selL = null; sfx.tap(); paint();
  });
  const check = h('button', { type: 'button', class: 'btn btn-primary', disabled: true }, 'Check my matches');
  check.onclick = () => {
    let ok = true;
    pairs.forEach((ri, li) => {
      const good = right[ri].i === left[li].i;
      lBtns[li].classList.toggle('right', good); rBtns[ri].classList.toggle('right', good);
      lBtns[li].classList.toggle('wrong', !good); rBtns[ri].classList.toggle('wrong', !good);
      if (!good) ok = false;
    });
    onCheck(ok);
    if (ok) { check.remove(); onSolved(); }
    else {
      sfx.bad(); showWhy('Red pairs do not match. They have been unpaired so you can try again.', false);
      setTimeout(() => { [...pairs.entries()].forEach(([li, ri]) => { if (right[ri].i !== left[li].i) { pairs.delete(li); lBtns[li].classList.remove('wrong'); rBtns[ri].classList.remove('wrong'); } }); paint(); }, 900);
    }
  };
  box.append(h('p', { class: 'muted', style: { fontSize: '15px' } }, 'Tap an item on the left, then its partner on the right.'),
    h('div', { class: 'match-cols' }, h('div', { class: 'match-col' }, lBtns), h('div', { class: 'match-col' }, rBtns)), check);
  paint();
}

/* ================= lesson blocks ================= */
const cleanups = [];
function mountWidget(id, caption) {
  const def = ML.widgets[id];
  const box = h('div', { class: 'widget fade-in' });
  if (!def) { box.append(h('p', { class: 'muted' }, `Interactive "${id}" is loading.`)); return box; }
  const head = h('div', { class: 'widget-head' }, h('div', { class: 'widget-title' }, def.title || ''), h('div', { class: 'widget-tag' }, def.tag || 'Interactive'));
  box.append(head);
  const body = h('div'); box.append(body);
  if (caption) box.append(h('p', { class: 'widget-caption' }, rich(caption)));
  const api = { h, svgEl, util: ML.util, sfx, confetti, toast, term: ML.term, reduceMotion: !!state.settings.reduceMotion, rich, addXP, makeDraggable, done: () => {} };
  try { const c = def.mount(body, api); if (typeof c === 'function') cleanups.push(c); }
  catch (e) { console.error('widget', id, e); body.append(h('p', { class: 'muted' }, 'This interactive could not load.')); }
  return box;
}
ML.mountWidget = mountWidget;

function renderBlock(b, ctx) {
  switch (b.type) {
    case 'hook': return h('div', { class: 'callout hook' }, h('h4', null, b.h || 'Hook'), h('div', null, rich(b.html)));
    case 'text': return h('div', { class: 'txt' }, b.h ? h('h3', { class: 'h3', style: { marginBottom: '8px' } }, b.h) : null, ...[].concat(b.html).map(p => h('p', null, rich(p))));
    case 'bullets': return h('div', { class: 'txt' }, b.h ? h('h3', { class: 'h3', style: { marginBottom: '8px' } }, b.h) : null, h('ul', { class: 'bul' }, b.items.map(i => h('li', null, rich(i)))));
    case 'analogy': return h('div', { class: 'callout analogy' }, h('h4', null, b.h || 'Think of it like this'), h('div', null, rich(b.html)));
    case 'clinical': return h('div', { class: 'callout clinical' }, h('h4', null, b.h || 'Clinical connection'), h('div', null, rich(b.html)));
    case 'apply': return h('div', { class: 'callout apply' }, h('h4', null, b.h || 'Real-world application'), h('div', null, rich(b.html)));
    case 'note': return h('div', { class: 'callout note' }, h('h4', null, b.h || 'AP exam tip'), h('div', null, rich(b.html)));
    case 'table': return h('div', null, b.h ? h('h3', { class: 'h3', style: { marginBottom: '10px' } }, b.h) : null,
      h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl cols-' + Math.min(4, b.head.length) }, h('thead', null, h('tr', null, b.head.map(x => h('th', null, x)))), h('tbody', null, b.rows.map(r => h('tr', null, r.map(c => h('td', null, rich(c)))))))));
    case 'cards': return h('div', null, b.h ? h('h3', { class: 'h3', style: { marginBottom: '10px' } }, b.h) : null, flipGrid(b.items.map(i => ({ front: i.t, back: i.d, tag: i.tag }))));
    case 'widget': return mountWidget(b.id, b.caption);
    case 'reveal': {
      const ans = h('div', { hidden: true }, rich(b.a));
      const btn = h('button', { type: 'button', class: 'btn btn-sm', style: { justifySelf: 'start' } }, b.btn || 'Show an answer');
      btn.onclick = () => { ans.hidden = false; btn.remove(); sfx.flip(); };
      return h('div', { class: 'reveal-box' }, h('div', { class: 'eyebrow' }, b.h || 'Think about it'), h('div', { style: { fontWeight: 700 } }, rich(b.q)), btn, ans);
    }
    case 'links': return h('div', null, h('div', { class: 'eyebrow', style: { marginBottom: '8px' } }, b.h || 'Go deeper (opens a new tab)'),
      h('div', { class: 'links' }, b.items.map(l => h('a', { href: l.url, target: '_blank', rel: 'noopener' }, '↗ ', l.t))));
    case 'cfu': {
      const qs = b.qs || [b.q];
      const wrap = h('div', { class: 'stack' });
      qs.forEach(q => { ctx.pending++; wrap.append(renderCFU(q, () => { ctx.pending--; ctx.update(); })); });
      return wrap;
    }
    default: return h('div');
  }
}
ML.renderBlock = renderBlock;

function flipGrid(items) {
  return h('div', { class: 'flip-grid' }, items.map(it => {
    const b = h('button', { type: 'button', class: 'flip', 'aria-label': `${it.front}. Tap to flip.` },
      h('div', { class: 'flip-in' },
        h('div', { class: 'flip-face flip-front' }, it.tag ? h('span', { class: 'flip-hint' }, it.tag) : null, h('strong', null, it.front), h('span', { class: 'flip-hint' }, 'Tap to flip')),
        h('div', { class: 'flip-face flip-back' }, rich(it.back))));
    b.onclick = () => { b.classList.toggle('on'); sfx.flip(); };
    return b;
  }));
}
ML.flipGrid = flipGrid;

/* ================= app shell & routing ================= */
let mainEl, route = { view: 'home' }, viewCleanup = null;
const NAV = [['home', 'Home', 'home'], ['learn', 'Learn', 'learn'], ['arcade', 'Arcade', 'arcade'], ['prove', 'Prove It', 'prove'], ['progress', 'Progress', 'progress']];

function navFor(view) { return ({ topic: 'learn', lesson: 'learn', glossary: 'learn', game: 'arcade', quiz: 'prove' })[view] || view; }

function go(view, params = {}) {
  if (viewCleanup) { try { viewCleanup(); } catch (e) { } viewCleanup = null; }
  while (cleanups.length) { try { cleanups.pop()(); } catch (e) { } }
  route = Object.assign({ view }, params);
  const active = navFor(view);
  document.querySelectorAll('[data-nav]').forEach(b => { if (b.dataset.nav === active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  mainEl.innerHTML = '';
  const fn = VIEWS[view] || VIEWS.home;
  const r = fn(params);
  if (typeof r === 'function') viewCleanup = r;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  const h1 = mainEl.querySelector('h1'); if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  try { if (['home', 'learn', 'arcade', 'prove', 'progress'].includes(view)) history.replaceState(null, '', '#' + view); } catch (e) { }
}
ML.go = go;

function buildShell() {
  const root = document.getElementById('app');
  const soundBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Sound on/off' });
  const paintSound = () => { soundBtn.innerHTML = ''; soundBtn.append(icon(state.settings.sound ? 'sound' : 'mute')); soundBtn.setAttribute('aria-pressed', String(state.settings.sound)); };
  paintSound();
  soundBtn.onclick = () => { state.settings.sound = !state.settings.sound; save(); paintSound(); if (state.settings.sound) sfx.good(); };
  const gearBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Settings' }, icon('gear'));
  gearBtn.onclick = openSettings;
  const brand = h('button', { class: 'brand', type: 'button', 'aria-label': 'Mustang Mind Lab home' });
  brand.innerHTML = BRAIN_MARK; brand.append(h('span', null, h('span', { class: 'brand-name' }, 'Mustang Mind Lab'), h('span', { class: 'brand-sub' }, 'AP Psych · Unit 1')));
  brand.onclick = () => go('home');
  const top = h('nav', { class: 'topnav', 'aria-label': 'Main' }, NAV.map(([id, label, ic]) => h('button', { type: 'button', 'data-nav': id, onclick: () => go(id) }, icon(ic), label)));
  const xp = h('span', { class: 'xp-pill', id: 'xp-pill', title: 'Experience points' }, icon('bolt', 'nav-ico'), h('b', null, state.xp), h('span', { class: 'xp-word' }, ' XP'));
  const bar = h('header', { class: 'appbar' }, h('div', { class: 'appbar-in' }, brand, top, h('div', { class: 'appbar-right' }, xp, soundBtn, gearBtn)));
  const tabs = h('nav', { class: 'tabbar', 'aria-label': 'Main' }, NAV.map(([id, label, ic]) => h('button', { type: 'button', 'data-nav': id, onclick: () => go(id) }, icon(ic), label)));
  mainEl = h('main', { class: 'view', id: 'main' });
  root.append(bar, mainEl, tabs);
  document.addEventListener('pointerdown', () => sfx.unlock(), { once: true });
}

function openSettings() {
  const s = state.settings;
  const close = () => back.remove();
  const sw = (id, key, label, help) => {
    const inp = h('input', { type: 'checkbox', class: 'switch', id });
    inp.checked = !!s[key];
    inp.onchange = () => { s[key] = inp.checked; save(); applySettings(); if (key === 'blanks') toast(inp.checked ? 'Guided-notes blanks are on' : 'Notes show every word'); };
    return h('div', { class: 'setting' }, h('label', { for: id }, label, h('small', null, help)), inp);
  };
  const theme = h('select', { id: 'set-theme' }, ['system', 'light', 'dark'].map(v => h('option', { value: v }, v[0].toUpperCase() + v.slice(1))));
  theme.value = s.theme; theme.onchange = () => { s.theme = theme.value; save(); applySettings(); };
  const name = h('input', { type: 'text', id: 'set-name', placeholder: 'First and last name', value: state.name || '', autocomplete: 'name' });
  name.oninput = () => { state.name = name.value.slice(0, 40); save(); };
  const resetZone = h('div', { class: 'row' });
  const resetBtn = h('button', { type: 'button', class: 'btn btn-sm' }, 'Reset all progress');
  resetBtn.onclick = () => {
    resetZone.innerHTML = '';
    const yes = h('button', { type: 'button', class: 'btn btn-sm btn-spark' }, 'Yes, erase everything');
    const no = h('button', { type: 'button', class: 'btn btn-sm' }, 'Cancel');
    yes.onclick = () => { const keep = state.settings; state = DEFAULTS(); state.settings = keep; save(); close(); go('home'); toast('Progress reset'); const p = document.querySelector('#xp-pill b'); if (p) p.textContent = 0; };
    no.onclick = () => { resetZone.innerHTML = ''; resetZone.append(resetBtn); };
    resetZone.append(h('span', { class: 'muted', style: { fontSize: '14px' } }, 'This cannot be undone.'), yes, no);
  };
  resetZone.append(resetBtn);
  const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'set-h' },
    h('div', { class: 'section-head' }, h('h2', { class: 'h2', id: 'set-h' }, 'Settings'), h('button', { type: 'button', class: 'btn btn-sm', onclick: close }, 'Done')),
    h('div', null,
      h('div', { class: 'setting' }, h('label', { for: 'set-name' }, 'Your name', h('small', null, 'Shows on your progress report')), name),
      sw('set-sound', 'sound', 'Sound effects', 'Blips, buzzes, and victory tunes'),
      sw('set-motion', 'reduceMotion', 'Reduce motion', 'Turns off confetti, flips, and shakes'),
      sw('set-blanks', 'blanks', 'Guided-notes blanks', 'Key words start hidden. Tap to reveal'),
      h('div', { class: 'setting' }, h('label', { for: 'set-theme' }, 'Theme', h('small', null, 'Light, dark, or match your device')), theme)),
    resetZone);
  const back = h('div', { class: 'modal-back', onclick: e => { if (e.target === back) close(); } }, modal);
  back.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.body.append(back); name.focus();
}

/* ================= progress math ================= */
function lessonProgress(lid) {
  const L = ML.lesson(lid); if (!L) return 0;
  if (state.lessons[lid]) return 1;
  const st = state.steps[lid] || 0; return Math.min(0.95, st / L.steps.length);
}
function topicProgress(tid) {
  const ls = ML.data.lessons.filter(l => l.topic === tid); if (!ls.length) return 0;
  return ls.reduce((a, l) => a + lessonProgress(l.id), 0) / ls.length;
}
ML.topicProgress = topicProgress;
function ring(p, label) {
  const s = svgEl('svg', { viewBox: '0 0 64 64', class: 'ring', 'aria-hidden': 'true' });
  const C = 2 * Math.PI * 27;
  s.innerHTML = `<circle class="ring-bg" cx="32" cy="32" r="27" fill="none" stroke-width="6"/><circle class="ring-fg" cx="32" cy="32" r="27" fill="none" stroke-width="6" stroke-linecap="round" transform="rotate(-90 32 32)" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/><text x="32" y="37" text-anchor="middle">${label}</text>`;
  return s;
}
function nextLesson() {
  return ML.data.lessons.find(l => !state.lessons[l.id]) || ML.data.lessons[0];
}

/* ================= views ================= */
const VIEWS = {};
ML.VIEWS = VIEWS;

VIEWS.home = function () {
  const nl = nextLesson();
  const started = Object.keys(state.lessons).length || Object.keys(state.steps).length;
  const cv = h('canvas', { 'aria-hidden': 'true' });
  const hero = h('section', { class: 'hero' }, cv,
    h('div', { class: 'hero-in' },
      h('div', { class: 'eyebrow' }, 'AP Psychology · Unit 1'),
      h('h1', null, 'Biological Bases ', h('span', { class: 'accent' }, 'of Behavior')),
      h('p', null, 'Relearn every concept from class, check yourself as you go, then lock it in with games.'),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => go('lesson', { id: nl.id }) }, started ? `Continue: ${nl.code} ${nl.title}` : 'Start with 1.1'),
        h('button', { type: 'button', class: 'btn btn-lg', onclick: () => go('arcade') }, 'Open the Arcade'))));
  const stopHero = heroNeuron(cv);
  const topics = h('section', { class: 'stack' },
    h('div', { class: 'section-head' }, h('h2', { class: 'h2' }, 'Your path through Unit 1'), h('span', { class: 'muted' }, `${Object.keys(state.lessons).length} of ${ML.data.lessons.length} lessons complete`)),
    h('div', { class: 'topic-grid' }, ML.data.topics.map(t => {
      const p = topicProgress(t.id);
      return h('button', { type: 'button', class: 'topic-tile', onclick: () => go('topic', { id: t.id }) }, ring(p, t.id),
        h('div', null, h('h3', null, t.title), h('p', { class: 'muted' }, t.blurb)));
    })));
  const games = h('section', { class: 'stack' },
    h('div', { class: 'section-head' }, h('h2', { class: 'h2' }, 'Arcade picks'), h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => go('arcade') }, 'See all games →')),
    h('div', { class: 'game-grid' }, shuffle(ML.gameOrder).slice(0, 4).map(id => gameCard(ML.games[id]))));
  mainEl.append(h('div', { class: 'stack-lg' }, hero, topics, games));
  return stopHero;
};

function heroNeuron(cv) {
  const g = cv.getContext('2d');
  let W = 0, H = 0, t = 0, pulses = [], stopped = false, raf;
  const nodes = [];
  function size() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes.length = 0;
    const n = Math.max(7, Math.round(W / 110));
    for (let i = 0; i < n; i++) nodes.push({ x: (i + 0.5) / n * W + rand(-20, 20), y: rand(26, Math.max(40, Math.min(H * 0.42, 110))), r: rand(8, 13) });
  }
  size();
  const onR = () => size(); addEventListener('resize', onR);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => size()) : null;
  if (ro) ro.observe(cv);
  function draw() {
    if (stopped) return;
    if (!W || !H || !nodes.length) size();
    t += 1;
    g.clearRect(0, 0, W, H);
    // links
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      g.strokeStyle = 'rgba(124,192,238,.28)'; g.lineWidth = 3; g.beginPath(); g.moveTo(a.x, a.y);
      g.bezierCurveTo(a.x + 60, a.y + 40, b.x - 60, b.y - 40, b.x, b.y); g.stroke();
      // myelin beads
      for (let k = 1; k < 4; k++) {
        const u = k / 4, x = bez(a.x, a.x + 60, b.x - 60, b.x, u), y = bez(a.y, a.y + 40, b.y - 40, b.y, u);
        g.fillStyle = 'rgba(75,156,211,.35)'; g.beginPath(); g.ellipse(x, y, 9, 4.5, Math.atan2(b.y - a.y, b.x - a.x), 0, 7); g.fill();
      }
    }
    for (const n of nodes) {
      g.fillStyle = 'rgba(124,192,238,.18)'; g.beginPath(); g.arc(n.x, n.y, n.r + 6, 0, 7); g.fill();
      g.fillStyle = '#4B9CD3'; g.beginPath(); g.arc(n.x, n.y, n.r, 0, 7); g.fill();
      for (let d = 0; d < 5; d++) { const ang = d * 1.3 + n.x; g.strokeStyle = 'rgba(124,192,238,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(n.x + Math.cos(ang) * (n.r + 16), n.y + Math.sin(ang) * (n.r + 16)); g.stroke(); }
    }
    if (!state.settings.reduceMotion && t % 90 === 1) pulses.push({ i: 0, u: 0 });
    for (const p of pulses) {
      p.u += 0.025;
      if (p.u >= 1) { p.u = 0; p.i++; }
      const a = nodes[p.i], b = nodes[p.i + 1];
      if (!b) { p.dead = true; continue; }
      const x = bez(a.x, a.x + 60, b.x - 60, b.x, p.u), y = bez(a.y, a.y + 40, b.y - 40, b.y, p.u);
      const gr = g.createRadialGradient(x, y, 0, x, y, 22); gr.addColorStop(0, 'rgba(255,107,129,.95)'); gr.addColorStop(1, 'rgba(255,107,129,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill();
      g.fillStyle = '#FFD166'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
    }
    pulses = pulses.filter(p => !p.dead);
    // fade bottom so text reads
    const fade = g.createLinearGradient(0, 110, 0, Math.min(H, 220)); fade.addColorStop(0, 'rgba(11,18,34,0)'); fade.addColorStop(1, 'rgba(11,18,34,.95)');
    g.fillStyle = fade; g.fillRect(0, 0, W, H);
    raf = requestAnimationFrame(draw);
  }
  function bez(p0, p1, p2, p3, u) { const v = 1 - u; return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3; }
  raf = requestAnimationFrame(draw);
  return () => { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', onR); if (ro) ro.disconnect(); };
}

VIEWS.learn = function () {
  mainEl.append(h('div', { class: 'stack-lg' },
    h('div', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Learn'), h('h1', { class: 'h1' }, 'Unit 1 lessons'),
      h('p', { class: 'lead' }, 'Each lesson walks from the big picture to the details, with checks for understanding along the way. Tap the blue blanks to reveal key words as you read.'),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => go('glossary') }, icon('book'), 'Unit 1 glossary'))),
    ...ML.data.topics.map(t => h('section', { class: 'stack' },
      h('div', { class: 'section-head' }, h('h2', { class: 'h2' }, `${t.id} ${t.title}`), h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => go('topic', { id: t.id }) }, 'Topic page →')),
      lessonList(t.id)))));
};

function lessonList(tid) {
  return h('div', { class: 'lesson-list' }, ML.data.lessons.filter(l => l.topic === tid).map(l => {
    const done = !!state.lessons[l.id], p = lessonProgress(l.id);
    return h('button', { type: 'button', class: 'lesson-row' + (done ? ' done' : ''), onclick: () => go('lesson', { id: l.id }) },
      h('span', { class: 'lesson-code' }, done ? icon('check', 'nav-ico') : l.code),
      h('span', null, h('strong', null, l.title), h('span', { class: 'muted', style: { display: 'block', fontSize: '14px' } }, l.blurb)),
      h('span', { class: done ? 'pill good' : p > 0 ? 'pill spark' : 'pill' }, done ? 'Done' : p > 0 ? `${Math.round(p * 100)}%` : `${l.steps.length} steps`));
  }));
}

VIEWS.topic = function ({ id }) {
  const t = ML.topic(id);
  const terms = ML.termsFor([id]);
  const back = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => go('learn') }, icon('back'), 'All lessons');
  const levels = h('div', { class: 'targets' }, t.targets.map((x, i) => h('div', { class: 'target' }, h('span', { class: 'lvl' }, `Level ${i + 1}`), h('span', null, x))));
  const vocabWrap = h('div');
  let showAll = false;
  const drawVocab = () => {
    vocabWrap.innerHTML = '';
    const list = showAll ? terms : terms.slice(0, 12);
    vocabWrap.append(flipGrid(list.map(x => ({ front: x.t, back: x.d }))));
    if (terms.length > 12) vocabWrap.append(h('div', { class: 'row', style: { marginTop: '12px' } }, h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { showAll = !showAll; drawVocab(); } }, showAll ? 'Show fewer' : `Show all ${terms.length} terms`)));
  };
  drawVocab();
  const playBtns = h('div', { class: 'game-grid' }, ML.gameOrder.slice(0, 4).map(gid => gameCard(ML.games[gid], [id])));
  mainEl.append(h('div', { class: 'col stack-lg' },
    h('div', { class: 'stack' }, back, h('div', { class: 'eyebrow' }, `Topic ${t.id}`), h('h1', { class: 'h1' }, t.title), h('p', { class: 'lead' }, t.objective)),
    h('section', { class: 'stack' }, h('h2', { class: 'h3' }, 'Learning targets'), levels),
    h('section', { class: 'stack' }, h('h2', { class: 'h3' }, 'Lessons'), lessonList(id)),
    h('section', { class: 'stack' }, h('div', { class: 'section-head' }, h('h2', { class: 'h3' }, `Vocabulary (${terms.length})`), h('span', { class: 'muted', style: { fontSize: '14px' } }, 'Tap a card to flip it')), vocabWrap),
    h('section', { class: 'stack' }, h('div', { class: 'section-head' }, h('h2', { class: 'h3' }, `Practice ${t.id} in the Arcade`), h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => { state.settings.arcadeTopics = [id]; save(); go('arcade'); } }, 'All games →')), playBtns)));
};

VIEWS.glossary = function () {
  const q = h('input', { type: 'text', id: 'gloss-q', class: 'glossary-search', placeholder: 'Search terms or definitions', autocomplete: 'off' });
  const list = h('div', { class: 'gloss-list' });
  const draw = () => {
    const s = q.value.trim().toLowerCase();
    list.innerHTML = '';
    const items = ML.data.terms.filter(t => !s || t.t.toLowerCase().includes(s) || t.d.toLowerCase().includes(s)).sort((a, b) => a.t.localeCompare(b.t));
    items.forEach(t => list.append(h('div', { class: 'gloss-item' }, h('b', null, t.t), h('span', null, t.d, ' ', h('span', { class: 'pill', style: { fontSize: '11px', padding: '1px 7px' } }, t.topic)))));
    if (!items.length) list.append(h('div', { class: 'gloss-item' }, h('span', { class: 'muted' }, 'No matches. Try a shorter word.')));
  };
  q.oninput = draw; draw();
  mainEl.append(h('div', { class: 'col stack' }, h('button', { type: 'button', class: 'btn btn-ghost btn-sm', style: { alignSelf: 'flex-start' }, onclick: () => go('learn') }, icon('back'), 'Lessons'),
    h('h1', { class: 'h1' }, 'Unit 1 glossary'), h('p', { class: 'muted' }, `${ML.data.terms.length} terms from the unit slides.`), q, list));
};

VIEWS.lesson = function ({ id, step }) {
  const L = ML.lesson(id);
  if (!L) return go('learn');
  state.lastLesson = id; save();
  let i = step != null ? step : Math.min(state.steps[id] || 0, L.steps.length - 1);
  if (state.lessons[id] && step == null) i = 0;
  const wrap = h('div', { class: 'col stack' });
  mainEl.append(wrap);
  function draw() {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { } }
    wrap.innerHTML = '';
    const S = L.steps[i];
    const bar = h('div', { class: 'steps-bar', 'aria-hidden': 'true' }, L.steps.map((_, k) => h('span', { class: k < i ? 'done' : k === i ? 'now' : '' })));
    const ctx = { pending: 0, update: () => { next.disabled = ctx.pending > 0; if (ctx.pending === 0) nextHint.hidden = true; } };
    const body = h('div', { class: 'lesson-body' }, S.blocks.map(b => renderBlock(b, ctx)));
    const prevB = h('button', { type: 'button', class: 'btn' }, icon('back'), 'Back');
    prevB.onclick = () => { if (i > 0) { i--; draw(); scrollTo(0, 0); } else go('topic', { id: L.topic }); };
    const last = i === L.steps.length - 1;
    const next = h('button', { type: 'button', class: 'btn btn-primary' }, last ? 'Finish lesson' : 'Next →');
    const nextHint = h('span', { class: 'muted', style: { fontSize: '14px', alignSelf: 'center' } }, 'Answer the checks to continue');
    next.onclick = () => {
      if (i + 1 > (state.steps[id] || 0)) { state.steps[id] = i + 1; save(); }
      if (last) { complete(); return; }
      i++; sfx.tap(); draw(); scrollTo(0, 0);
      const h2 = wrap.querySelector('h1'); if (h2) h2.focus({ preventScroll: true });
    };
    ctx.update(); nextHint.hidden = ctx.pending === 0;
    wrap.append(
      h('div', { class: 'lesson-top' },
        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
          h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => go('topic', { id: L.topic }) }, icon('back'), `${L.code} ${L.title}`),
          h('span', { class: 'pill blue' }, `Step ${i + 1} of ${L.steps.length}`)),
        bar,
        h('div', { class: 'step-title' }, h('span', { class: 'step-kind' }, S.kind || ''), h('h1', { class: 'h2', tabindex: '-1' }, S.title))),
      body,
      h('div', { class: 'lesson-nav' }, prevB, h('div', { class: 'row' }, nextHint, next)));
  }
  function complete() {
    const firstTime = !state.lessons[id];
    state.lessons[id] = Date.now(); save();
    if (firstTime) addXP(50);
    sfx.win(); confetti(innerWidth / 2, innerHeight / 3, 160);
    wrap.innerHTML = '';
    const idx = ML.data.lessons.indexOf(L), nl = ML.data.lessons[idx + 1];
    const t = ML.topic(L.topic);
    wrap.append(h('div', { class: 'stack fade-in', style: { alignItems: 'flex-start' } },
      h('div', { class: 'eyebrow' }, 'Lesson complete'),
      h('h1', { class: 'h1' }, `${L.code} ${L.title}`),
      h('p', { class: 'lead' }, firstTime ? 'Nice work. You earned 50 XP for finishing this lesson.' : 'Reviewed again. Repetition is how memories consolidate.'),
      h('div', { class: 'row' },
        nl ? h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => go('lesson', { id: nl.id }) }, `Next: ${nl.code} ${nl.title}`) : null,
        h('button', { type: 'button', class: 'btn btn-lg', onclick: () => { state.settings.arcadeTopics = [L.topic]; save(); go('arcade'); } }, `Practice ${t.id} terms in the Arcade`),
        h('button', { type: 'button', class: 'btn btn-lg', onclick: () => go('quiz', { topics: [L.topic], n: 10 }) }, `Prove It: ${t.id}`))));
  }
  draw();
};

/* ---------- Arcade ---------- */
function gameCard(G, topics) {
  if (!G) return h('div');
  const best = state.games[G.id]?.best;
  const art = h('div', { class: 'gc-art' }); art.innerHTML = G.art || '';
  return h('button', { type: 'button', class: 'game-card', onclick: () => { if (topics) { state.settings.arcadeTopics = topics; save(); } go('game', { id: G.id }); } },
    art,
    h('div', { class: 'gc-body' },
      h('span', { class: 'kind-tag' }, G.kind === 'word' ? 'Vocab game' : 'Arcade game'),
      h('h3', null, G.title),
      h('p', null, G.blurb),
      h('span', { class: 'gc-meta' }, best != null ? `Best: ${best}` : 'Not played yet')));
}

function topicChips(onChange) {
  const sel = new Set(state.settings.arcadeTopics || []);
  const all = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(sel.size === 0) }, 'All of Unit 1');
  const chips = ML.data.topics.map(t => h('button', { type: 'button', class: 'chip', 'aria-pressed': String(sel.has(t.id)), title: t.title }, `${t.id} ${t.short}`));
  const paint = () => { all.setAttribute('aria-pressed', String(sel.size === 0)); chips.forEach((c, i) => c.setAttribute('aria-pressed', String(sel.has(ML.data.topics[i].id)))); };
  all.onclick = () => { sel.clear(); commit(); };
  chips.forEach((c, i) => c.onclick = () => { const id = ML.data.topics[i].id; sel.has(id) ? sel.delete(id) : sel.add(id); if (sel.size === ML.data.topics.length) sel.clear(); commit(); });
  function commit() { state.settings.arcadeTopics = [...sel]; save(); paint(); sfx.tap(); onChange && onChange(); }
  return h('div', { class: 'row', role: 'group', 'aria-label': 'Topics to practice' }, all, chips);
}

VIEWS.arcade = function () {
  const count = h('span', { class: 'muted' });
  const upd = () => { count.textContent = `${ML.termsFor(ML.arcadeTopics()).length} terms in play`; };
  upd();
  const word = ML.gameOrder.map(id => ML.games[id]).filter(g => g.kind === 'word');
  const arc = ML.gameOrder.map(id => ML.games[id]).filter(g => g.kind !== 'word');
  mainEl.append(h('div', { class: 'stack-lg' },
    h('div', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Arcade'), h('h1', { class: 'h1' }, 'Play to lock it in'),
      h('p', { class: 'lead' }, 'Every game pulls from the vocabulary you pick below. Missed terms come back around until you get them.'),
      topicChips(upd), count),
    h('section', { class: 'stack' }, h('h2', { class: 'h2' }, 'Arcade games'), h('div', { class: 'game-grid five' }, arc.map(g => gameCard(g)))),
    h('section', { class: 'stack' }, h('h2', { class: 'h2' }, 'Vocab puzzles'), h('div', { class: 'game-grid five' }, word.map(g => gameCard(g))))));
};

VIEWS.game = function ({ id }) {
  const G = ML.games[id];
  if (!G) return go('arcade');
  const topics = ML.arcadeTopics();
  const scope = topics.length ? topics.map(t => `${t} ${ML.topic(t).short}`).join(', ') : 'All of Unit 1';
  const stage = h('div', { class: 'game-stage' });
  const shell = h('div', { class: 'game-shell' }, stage);
  let cleanup = null, alive = false;
  const page = h('div', { class: 'game-page' },
    h('div', { class: 'game-bar' },
      h('button', { type: 'button', class: 'btn btn-sm', onclick: () => go('arcade') }, icon('back'), 'Arcade'),
      h('h1', null, G.title),
      h('span', { class: 'pill blue', style: { marginLeft: 'auto' } }, scope)),
    shell);
  mainEl.append(page);

  function stop() { alive = false; if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; } }
  function showIntro() {
    stop(); stage.innerHTML = ''; shell.querySelector('.game-overlay')?.remove();
    const best = state.games[id]?.best;
    const ov = h('div', { class: 'game-overlay is-intro' }, h('div', { class: 'go-card' },
      h('div', { class: 'kind-tag' }, G.kind === 'word' ? 'Vocab puzzle' : 'Arcade game'),
      h('h2', null, G.title),
      h('p', null, G.blurb),
      G.how ? h('ul', { class: 'how-list' }, G.how.map(x => h('li', null, x))) : null,
      best != null ? h('div', { class: 'go-stat' }, 'Your best', h('b', null, best)) : null,
      h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: start }, 'Start')));
    shell.append(ov);
    setTimeout(() => ov.querySelector('.btn-primary')?.focus(), 30);
  }
  function start() {
    sfx.unlock(); sfx.level();
    shell.querySelector('.game-overlay')?.remove();
    stage.innerHTML = '';
    alive = true;
    const pool = ML.termsFor(ML.arcadeTopics());
    const missed = new Map(); let nRight = 0, nWrong = 0;
    const ctx = {
      id, terms: pool, allTerms: ML.data.terms, topics: ML.arcadeTopics(), data: ML.data,
      deck: ML.makeDeck(pool),
      record(item, correct) {
        const t = item && (item.answer || item);
        if (correct) nRight++; else { nWrong++; if (t && t.id) missed.set(t.id, t); item && item.miss && item.miss(); }
        recordTerm(t && t.id, correct);
      },
      finish(res = {}) { if (!alive) return; alive = false; save(); showResults(res, [...missed.values()], nRight, nWrong); },
      isActive: () => alive,
      sfx, confetti, toast, util: ML.util, h, stage: ML.stage, loop: ML.loop, fitText: ML.fitText, wrapText: ML.wrapText, roundRect: ML.roundRect,
      colors: ML.arcade, fonts: ML.fonts, reduceMotion: !!state.settings.reduceMotion,
      best: state.games[id]?.best ?? null
    };
    try { cleanup = G.mount(stage, ctx) || null; }
    catch (e) { console.error(e); stage.append(h('p', null, 'This game hit an error while loading. Try another game.')); }
  }
  function showResults(res, missedTerms, nRight, nWrong) {
    const score = res.score ?? nRight;
    const rec = state.games[id] || (state.games[id] = { best: null, plays: 0 });
    rec.plays++; rec.last = Date.now();
    const lowerBetter = !!res.lowerIsBetter;
    const isBest = rec.best == null || (lowerBetter ? score < rec.best : score > rec.best);
    if (isBest && (res.won !== false || !lowerBetter)) rec.best = score;
    const correct = res.correct ?? nRight, total = res.total ?? (nRight + nWrong);
    addXP(Math.min(60, correct * 2 + (res.won ? 10 : 0)));
    save();
    if (res.won !== false) { sfx.win(); confetti(innerWidth / 2, innerHeight / 3, 120); } else sfx.lose();
    const ov = h('div', { class: 'game-overlay' }, h('div', { class: 'go-card fade-in' },
      h('div', { class: 'kind-tag' }, res.title ? '' : 'Game over'),
      h('h2', null, res.title || (res.won === false ? 'Nice try!' : 'Great run!')),
      h('div', { class: 'go-score' }, score),
      h('div', { class: 'go-stats' },
        isBest ? h('div', { class: 'go-stat' }, 'Record', h('b', null, 'New best!')) : h('div', { class: 'go-stat' }, 'Best', h('b', null, rec.best)),
        total ? h('div', { class: 'go-stat' }, 'Accuracy', h('b', null, `${Math.round(100 * correct / Math.max(1, total))}%`)) : null,
        total ? h('div', { class: 'go-stat' }, 'Correct', h('b', null, `${correct}/${total}`)) : null),
      res.note ? h('p', null, res.note) : null,
      missedTerms.length ? h('div', { class: 'go-missed' }, h('div', { style: { fontFamily: 'var(--f-mono)', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--arc-gold)' } }, 'Review these'),
        missedTerms.slice(0, 12).map(t => h('div', null, h('b', null, t.t), ': ', t.d))) : null,
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => { stop(); start(); } }, 'Play again'),
        h('button', { type: 'button', class: 'btn btn-lg', onclick: () => go('arcade') }, 'Pick another game'))));
    shell.append(ov);
    setTimeout(() => ov.querySelector('.btn-primary')?.focus(), 30);
  }
  showIntro();
  return stop;
};

/* ---------- Prove It quiz ---------- */
VIEWS.prove = function () {
  const sel = new Set();
  const chips = ML.data.topics.map(t => {
    const c = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, `${t.id} ${t.short}`);
    c.onclick = () => { sel.has(t.id) ? sel.delete(t.id) : sel.add(t.id); c.setAttribute('aria-pressed', String(sel.has(t.id))); sfx.tap(); upd(); };
    return c;
  });
  let n = 10;
  const lens = [10, 20, 30].map(v => { const c = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(v === n) }, `${v} questions`); c.onclick = () => { n = v; lens.forEach(x => x.setAttribute('aria-pressed', String(x === c))); }; return c; });
  const avail = h('span', { class: 'muted' });
  const upd = () => { const qs = ML.data.questions.filter(q => !sel.size || sel.has(q.topic)); avail.textContent = `${qs.length} questions in the bank for this selection`; };
  upd();
  const history = state.quizzes.slice(-6).reverse();
  mainEl.append(h('div', { class: 'col stack-lg' },
    h('div', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Prove It'), h('h1', { class: 'h1' }, 'Show what you know'),
      h('p', { class: 'lead' }, 'AP-style multiple choice drawn from the whole unit or the topics you pick. You get feedback after every question and a review at the end.')),
    h('div', { class: 'card stack' },
      h('h2', { class: 'h3' }, 'Topics'), h('div', { class: 'row' }, chips), h('p', { class: 'muted', style: { fontSize: '14px' } }, 'Pick none to mix the whole unit.'),
      h('h2', { class: 'h3' }, 'Length'), h('div', { class: 'row' }, lens), avail,
      h('div', null, h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => go('quiz', { topics: [...sel], n }) }, 'Start Prove It'))),
    history.length ? h('section', { class: 'stack' }, h('h2', { class: 'h3' }, 'Recent attempts'),
      h('div', { class: 'gloss-list' }, history.map(qz => h('div', { class: 'gloss-item' }, h('b', null, `${qz.pct}%`), h('span', null, `${qz.right}/${qz.n} · ${qz.topics.length ? qz.topics.join(', ') : 'All of Unit 1'} · ${new Date(qz.at).toLocaleDateString()}`))))) : null));
};

VIEWS.quiz = function ({ topics = [], n = 10 }) {
  const bank = ML.data.questions.filter(q => !topics.length || topics.includes(q.topic));
  const qs = shuffle(bank).slice(0, Math.min(n, bank.length));
  let i = 0, right = 0; const log = [];
  const wrap = h('div', { class: 'col stack' }); mainEl.append(wrap);
  function draw() {
    wrap.innerHTML = '';
    const q = qs[i];
    const nextBtn = h('button', { type: 'button', class: 'btn btn-primary', hidden: true }, i === qs.length - 1 ? 'See results' : 'Next question →');
    nextBtn.onclick = () => { i++; if (i >= qs.length) results(); else { draw(); scrollTo(0, 0); } };
    const cfu = renderCFU(Object.assign({}, q, { id: null }), first => { if (first) right++; log.push({ q, first }); nextBtn.hidden = false; nextBtn.focus(); }, { label: `Question ${i + 1} of ${qs.length} · Topic ${q.topic}`, allowSkip: false, oneShot: true });
    wrap.append(
      h('div', { class: 'quiz-head' }, h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => go('prove') }, icon('back'), 'Quit'), h('span', { class: 'pill blue' }, `Score ${right}/${i}`)),
      h('div', { class: 'steps-bar', 'aria-hidden': 'true' }, qs.map((_, k) => h('span', { class: k < i ? 'done' : k === i ? 'now' : '' }))),
      h('h1', { class: 'sr-only' }, `Question ${i + 1}`), cfu, h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, nextBtn));
  }
  function results() {
    const pct = Math.round(100 * right / qs.length);
    state.quizzes.push({ at: Date.now(), topics, n: qs.length, right, pct }); save();
    addXP(right * 5);
    if (pct >= 80) { sfx.win(); confetti(innerWidth / 2, innerHeight / 3, 160); } else sfx.level();
    const missed = log.filter(l => !l.first);
    wrap.innerHTML = '';
    wrap.append(h('div', { class: 'stack fade-in' },
      h('div', { class: 'eyebrow' }, 'Prove It results'),
      h('h1', { class: 'h1' }, pct >= 80 ? 'Strong evidence of mastery' : pct >= 60 ? 'Solid. A little more practice will lock it in' : 'Good start. Review and try again'),
      h('div', { class: 'row', style: { alignItems: 'baseline', gap: '16px' } }, h('span', { class: 'big-num' }, `${pct}%`), h('span', { class: 'lead' }, `${right} of ${qs.length} correct on the first try`)),
      h('p', { class: 'muted' }, 'Want a record for your teacher? Open Progress for a screenshot-ready report.'),
      missed.length ? h('section', { class: 'stack' }, h('h2', { class: 'h3' }, 'Review the ones you missed'),
        ...missed.map(m => h('div', { class: 'card', style: { display: 'grid', gap: '8px' } }, h('strong', null, rich(m.q.q)),
          h('div', null, 'Answer: ', h('span', { style: { color: 'var(--good)', fontWeight: 700 } }, rich(m.q.type === 'tf' ? (m.q.a ? 'True' : 'False') : m.q.choices[m.q.a]))),
          m.q.why ? h('div', { class: 'muted' }, rich(m.q.why)) : null))) : null,
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => go('quiz', { topics, n }) }, 'Try a new set'),
        h('button', { type: 'button', class: 'btn btn-lg', onclick: () => go('progress') }, 'View progress report'))));
  }
  if (!qs.length) { wrap.append(h('p', null, 'No questions for that selection yet.')); return; }
  draw();
};

/* ---------- Progress report ---------- */
VIEWS.progress = function () {
  const nameIn = h('input', { type: 'text', id: 'rep-name', placeholder: 'Type your name', value: state.name || '', autocomplete: 'name', style: { fontFamily: 'var(--f-display)', fontSize: '22px', maxWidth: '100%' } });
  nameIn.oninput = () => { state.name = nameIn.value.slice(0, 40); save(); };
  const cfuVals = Object.values(state.cfu);
  const cfuPct = cfuVals.length ? Math.round(100 * cfuVals.filter(c => c.c).length / cfuVals.length) : 0;
  const bestQuiz = state.quizzes.length ? Math.max(...state.quizzes.map(q => q.pct)) : null;
  const gamesPlayed = Object.values(state.games).reduce((a, g) => a + (g.plays || 0), 0);
  const topicRows = ML.data.topics.map(t => {
    const qz = state.quizzes.filter(q => q.topics.length === 1 && q.topics[0] === t.id);
    const best = qz.length ? Math.max(...qz.map(q => q.pct)) + '%' : '—';
    return [`${t.id} ${t.title}`, `${Math.round(topicProgress(t.id) * 100)}%`, best];
  });
  const weak = Object.entries(state.termStats).filter(([, s]) => s[1] > s[0]).sort((a, b) => (b[1][1] - b[1][0]) - (a[1][1] - a[1][0])).slice(0, 8).map(([id]) => ML.term(id)).filter(Boolean);
  mainEl.append(h('div', { class: 'col stack-lg' },
    h('div', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Progress'), h('h1', { class: 'h1' }, 'Your progress report'),
      h('p', { class: 'lead' }, 'Screenshot this report to submit as evidence in Google Classroom. Progress is saved in this browser on this device.')),
    h('div', { class: 'report' },
      h('div', { class: 'report-head' }, h('div', { class: 'stack', style: { gap: '4px', minWidth: 0 } }, h('label', { for: 'rep-name', class: 'eyebrow' }, 'Student'), nameIn),
        h('div', { style: { textAlign: 'right' } }, h('div', { class: 'eyebrow' }, 'Mustang Mind Lab · Unit 1'), h('div', { class: 'muted readout', style: { fontFamily: 'var(--f-mono)', fontSize: '14px' } }, new Date().toLocaleString()))),
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('b', null, state.xp), h('span', null, 'XP earned')),
        h('div', { class: 'stat' }, h('b', null, `${Object.keys(state.lessons).length}/${ML.data.lessons.length}`), h('span', null, 'Lessons done')),
        h('div', { class: 'stat' }, h('b', null, cfuVals.length ? `${cfuPct}%` : '—'), h('span', null, `First-try checks (${cfuVals.length})`)),
        h('div', { class: 'stat' }, h('b', null, bestQuiz != null ? `${bestQuiz}%` : '—'), h('span', null, 'Best Prove It')),
        h('div', { class: 'stat' }, h('b', null, gamesPlayed), h('span', null, 'Games played'))),
      h('div', { class: 'stack', style: { gap: '8px' } }, h('h2', { class: 'h3' }, 'Lessons'),
        h('div', { class: 'check-list' }, ML.data.lessons.map(l => h('div', { class: 'check-item' }, h('span', { class: 'check-box' + (state.lessons[l.id] ? ' on' : '') }, state.lessons[l.id] ? '✓' : ''), `${l.code} ${l.title}`)))),
      h('div', { class: 'stack', style: { gap: '8px' } }, h('h2', { class: 'h3' }, 'By topic'),
        h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', null, 'Topic'), h('th', null, 'Lessons'), h('th', null, 'Best topic Prove It'))),
          h('tbody', null, topicRows.map(r => h('tr', null, r.map(c => h('td', null, c)))))))),
      Object.keys(state.games).length ? h('div', { class: 'stack', style: { gap: '8px' } }, h('h2', { class: 'h3' }, 'Arcade bests'),
        h('div', { class: 'row' }, Object.entries(state.games).map(([gid, g]) => ML.games[gid] ? h('span', { class: 'pill blue' }, `${ML.games[gid].title}: ${g.best ?? '—'}`) : null))) : null),
    weak.length ? h('section', { class: 'stack' }, h('h2', { class: 'h3' }, 'Terms to review'), h('p', { class: 'muted' }, 'You have missed these more often than you got them in games.'),
      flipGrid(weak.map(t => ({ front: t.t, back: t.d })))) : null));
};

/* ================= boot ================= */
ML.boot = function () {
  const D = ML.data;
  D.termIndex = {}; D.terms.forEach(t => { t.s = t.s || t.t; D.termIndex[t.id] = t; });
  const ord = D.lessonOrder || [];
  D.lessons.sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id));
  D.lessons.forEach(l => { l.code = l.code || l.id; });
  applySettings();
  buildShell();
  const hash = (location.hash || '').slice(1);
  go(['home', 'learn', 'arcade', 'prove', 'progress'].includes(hash) ? hash : 'home');
};
})();
