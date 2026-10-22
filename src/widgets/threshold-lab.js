/* 1.6A threshold-lab — absolute threshold test + JND / Weber's law */
(function () {
'use strict';
/*SK>*/
/* --- SK kit: shared helpers for the 1.6 sensation widgets (identical copy in each file; styles inject once) --- */
const SK = (() => {
  const h = ML.util.h;
  function css(id, text) { if (document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = text; document.head.append(s); }
  css('sk-kit-style', `
.sk-root { display: flex; flex-direction: column; gap: 12px; min-width: 0;
  --sk-flesh: color-mix(in srgb, #EFA597 72%, var(--surface)); --sk-flesh-d: color-mix(in srgb, #C9776A 80%, var(--surface));
  --sk-bone: color-mix(in srgb, #E9DCC0 82%, var(--surface)); --sk-bone-d: color-mix(in srgb, #B59F74 85%, var(--surface));
  --sk-nerve: color-mix(in srgb, #E6B031 88%, var(--surface)); --sk-fluid: color-mix(in srgb, #7FC4E8 50%, var(--surface));
  --sk-white: color-mix(in srgb, #FFFFFF 88%, var(--surface)); --sk-fat: color-mix(in srgb, #F3D98A 70%, var(--surface));
  --sk-vio: color-mix(in srgb, #8E6FE0 85%, var(--surface)); --sk-gold: color-mix(in srgb, #E0A21B 90%, var(--surface)); }
.sk-instr { font-size: 15px; color: var(--muted); margin: 0; }
.sk-instr b { color: var(--ink); }
.sk-seg { display: flex; flex-wrap: wrap; gap: 6px; }
.sk-seg button { border: 1.5px solid var(--line); background: var(--surface-2); color: var(--muted); border-radius: 99px; padding: 6px 12px; font-weight: 700; font-size: 14px; cursor: pointer; min-height: 36px; }
.sk-seg button[aria-pressed="true"] { background: var(--carolina); border-color: var(--carolina); color: var(--surface); }
.sk-seg button:hover:not([aria-pressed="true"]) { border-color: var(--carolina); color: var(--ink); }
.sk-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sk-card { background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; font-size: 16px; min-height: 52px; }
.sk-card h4 { margin: 0 0 4px; font-size: 16px; color: var(--carolina); }
.sk-card p { margin: 0; }
.sk-card p + p { margin-top: 6px; }
.sk-card.good { border-color: var(--good); background: var(--good-soft); }
.sk-card.bad { border-color: var(--bad); background: var(--bad-soft); }
.sk-card.spark { border-color: var(--spark); background: var(--spark-soft); }
.sk-note { font-size: 14px; color: var(--muted); }
.sk-kicker { font-family: var(--f-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--carolina); font-weight: 700; }
.sk-stage { position: relative; width: 100%; max-width: 620px; margin: 0 auto; }
.sk-stage svg, .sk-stage canvas { width: 100%; height: auto; display: block; }
.sk-panel { border: 1px solid var(--line); border-radius: 16px; padding: 12px; background: var(--surface); display: flex; flex-direction: column; gap: 10px; }
.sk-split { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
.sk-quizbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; background: var(--carolina-soft); border-radius: 12px; padding: 10px 14px; font-weight: 700; }
.sk-quizbar .readout { color: var(--carolina); }
.sk-range { display: grid; gap: 4px; }
.sk-range label { display: flex; justify-content: space-between; gap: 8px; font-weight: 700; font-size: 15px; }
.sk-range label .readout { color: var(--carolina); font-size: 14px; }
.sk-t { fill: var(--ink); font-family: var(--f-body); font-weight: 700; font-size: 14px; paint-order: stroke; stroke: var(--surface); stroke-width: 3.5px; stroke-linejoin: round; }
.sk-ts { fill: var(--muted); font-family: var(--f-body); font-weight: 700; font-size: 12px; paint-order: stroke; stroke: var(--surface); stroke-width: 3px; stroke-linejoin: round; }
.sk-lead { stroke: var(--muted); stroke-width: 1.2; fill: none; }
.sk-hit { fill: transparent; stroke: transparent; cursor: pointer; pointer-events: all; }
.sk-hit:focus { outline: none; }
.sk-part { transition: filter .2s, opacity .2s; }
.sk-root .sk-on .sk-glow, .sk-root .sk-glow.sk-on { filter: drop-shadow(0 0 4px var(--spark)) drop-shadow(0 0 2px var(--spark)); }
.sk-root .sk-lbl.sk-on .sk-t { fill: var(--spark); }
.sk-root .sk-lbl.sk-on .sk-lead { stroke: var(--spark); stroke-width: 2; }
.sk-root .sk-lbl.sk-focus .sk-t { text-decoration: underline; }
.sk-root.sk-quiz .sk-lbl { display: none; }
.sk-root .sk-lbl.sk-show { display: inline; }
.sk-root .sk-right .sk-glow { filter: drop-shadow(0 0 5px var(--good)) drop-shadow(0 0 2px var(--good)); }
.sk-root .sk-wrong .sk-glow { filter: drop-shadow(0 0 5px var(--bad)) drop-shadow(0 0 2px var(--bad)); }
.sk-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sk-chips button { border: 1px solid var(--line); background: var(--surface); border-radius: 99px; padding: 5px 11px; font-size: 14px; font-weight: 700; color: var(--ink); cursor: pointer; }
.sk-chips button[aria-pressed="true"] { border-color: var(--spark); color: var(--spark); background: var(--spark-soft); }
.sk-meter { height: 14px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line); overflow: hidden; }
.sk-meter > i { display: block; height: 100%; width: 0; background: var(--carolina); border-radius: 99px; transition: width .15s linear; }
.sk-bigbtn { min-height: 48px; }
@media (max-width: 420px) { .sk-seg button { padding: 6px 10px; font-size: 13.5px; } .sk-card { font-size: 15px; } }
`);
  const instr = (html) => { const p = h('p', { class: 'sk-instr' }); p.innerHTML = html; return p; };
  function seg(options, value, onChange, label) {
    const el = h('div', { class: 'sk-seg', role: 'group', 'aria-label': label || 'Mode' });
    const btns = options.map(o => {
      const b = h('button', { type: 'button', 'aria-pressed': String(o.v === value) }, o.label);
      b.onclick = () => { if (cur === o.v) return; set(o.v); ML.sfx.tap(); onChange(o.v); };
      el.append(b); return b;
    });
    let cur = value;
    function set(v) { cur = v; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i].v === v))); }
    return { el, set, get: () => cur, btns };
  }
  function range(label, min, max, step, value, fmt, onInput) {
    const out = h('span', { class: 'readout' });
    const id = 'sk-r-' + Math.random().toString(36).slice(2, 8);
    const inp = h('input', { type: 'range', min, max, step, value, id });
    const upd = () => { out.textContent = fmt(+inp.value); onInput && onInput(+inp.value); };
    inp.addEventListener('input', upd);
    const el = h('div', { class: 'sk-range' }, h('label', { for: id }, h('span', null, label), out), inp);
    out.textContent = fmt(+value);
    return { el, inp, out, get: () => +inp.value, set(v, fire) { inp.value = v; out.textContent = fmt(+inp.value); if (fire) onInput && onInput(+inp.value); } };
  }
  function card(title, html, cls) {
    const c = h('div', { class: 'sk-card' + (cls ? ' ' + cls : ''), 'aria-live': 'polite' });
    set(title, html, cls);
    function set(t, x, k) { c.className = 'sk-card' + (k ? ' ' + k : ''); c.innerHTML = ''; if (t) c.append(h('h4', null, t)); if (x != null) { const p = h('div'); p.innerHTML = x; c.append(p); } }
    return { el: c, set };
  }
  function svg(viewBox, inner, attrs) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', viewBox); s.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (attrs) for (const k in attrs) s.setAttribute(k, attrs[k]);
    if (inner) s.innerHTML = inner;
    return s;
  }
  /* rAF loop that keeps going across tab switches; stop() is final */
  function loop(fn) {
    let id = 0, last = 0, dead = false;
    const f = t => { if (dead) return; const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t; fn(dt, t); if (!dead) id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    return { stop() { dead = true; cancelAnimationFrame(id); } };
  }
  const soundOn = () => !!ML.state().settings.sound;
  function audio() { if (!soundOn()) return null; try { return ML.sfx.unlock() || null; } catch (e) { return null; } }
  function cssVar(el, name) { return getComputedStyle(el).getPropertyValue(name).trim(); }
  /* Explore / Quiz engine for diagrams. parts: [{id, name, info}]; elements in `root` carry data-part="id".
     Hit targets: elements with class sk-hit + data-part (focusable). Labels: .sk-lbl[data-part]. */
  function explorer(api, root, parts, opts = {}) {
    const byId = Object.fromEntries(parts.map(p => [p.id, p]));
    const info = card(opts.title0 || 'Tap a part', opts.hint0 || 'Tap or Tab to any structure to see what it does.');
    let mode = 'explore', sel = null, order = [], qi = 0, firstTry = 0, missed = false, busy = false;
    const qbar = h('div', { class: 'sk-quizbar', hidden: true });
    const qText = h('span'), qScore = h('span', { class: 'readout' });
    qbar.append(qText, qScore);
    const els = id => root.querySelectorAll(`[data-part="${id}"]`);
    const hits = [...root.querySelectorAll('.sk-hit[data-part]')];
    hits.forEach((el, i) => {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      el.addEventListener('click', () => choose(el.dataset.part));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(el.dataset.part); } });
      el.addEventListener('focus', () => els(el.dataset.part).forEach(x => x.classList.add('sk-focus')));
      el.addEventListener('blur', () => els(el.dataset.part).forEach(x => x.classList.remove('sk-focus')));
    });
    function labelHits() { hits.forEach((el, i) => el.setAttribute('aria-label', mode === 'quiz' ? `Structure ${i + 1}` : byId[el.dataset.part].name)); }
    function clear(cls) { root.querySelectorAll('.' + cls).forEach(x => x.classList.remove(cls)); }
    function highlight(id) { clear('sk-on'); if (id) els(id).forEach(x => x.classList.add('sk-on')); }
    function choose(id) {
      if (!byId[id]) return;
      if (mode === 'explore') {
        sel = id; highlight(id); ML.sfx.blip();
        info.set(byId[id].name, byId[id].info);
        opts.onSelect && opts.onSelect(id);
      } else if (mode === 'quiz' && !busy) {
        const want = order[qi];
        if (id === want) {
          busy = true; if (!missed) { firstTry++; api.addXP(2); }
          els(id).forEach(x => x.classList.add('sk-right', 'sk-show')); api.sfx.good();
          info.set('Yes! ' + byId[id].name, byId[id].info, 'good');
          setTimeout(() => { clear('sk-right'); clear('sk-show'); qi++; missed = false; busy = false; ask(); }, 1100);
        } else {
          missed = true; api.sfx.bad();
          els(id).forEach(x => x.classList.add('sk-wrong', 'sk-show'));
          info.set('Not quite', `That is the <b>${byId[id].name}</b>. Find the <b>${byId[want].name}</b>.`, 'bad');
          setTimeout(() => { els(id).forEach(x => x.classList.remove('sk-wrong', 'sk-show')); }, 900);
        }
      }
    }
    function ask() {
      qScore.textContent = `${firstTry}/${order.length} first try`;
      if (qi >= order.length) {
        qText.textContent = 'Quiz complete!';
        const pct = firstTry / order.length;
        info.set(pct === 1 ? 'Perfect score!' : 'Nice work', `You found ${firstTry} of ${order.length} on the first try. ${pct === 1 ? '' : 'Switch to Explore to review the ones you missed, then try again.'}`, 'good');
        if (pct >= 0.75) { api.sfx.level(); const r = root.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 40, 60); }
        const again = h('button', { type: 'button', class: 'btn btn-sm' }, 'Quiz me again');
        again.onclick = () => setMode('quiz');
        qText.textContent = ''; qText.append('Quiz complete! ', again);
        return;
      }
      const nm = byId[order[qi]].name; qText.textContent = `Tap the ${nm.charAt(0).toLowerCase() + nm.slice(1)}`;
      if (qi === 0) info.set('Quiz', 'Tap the structure named above. Labels are hidden.');
    }
    function setMode(m) {
      mode = m; highlight(null); clear('sk-right'); clear('sk-wrong'); clear('sk-show');
      (opts.rootEl || root).classList.toggle('sk-quiz', m === 'quiz');
      qbar.hidden = m !== 'quiz';
      labelHits();
      if (m === 'quiz') { order = ML.util.shuffle(parts.filter(p => !p.noQuiz).map(p => p.id)); qi = 0; firstTry = 0; missed = false; busy = false; ask(); }
      else if (m === 'explore') { info.set(opts.title0 || 'Tap a part', opts.hint0 || 'Tap or Tab to any structure to see what it does.'); }
    }
    labelHits();
    return { info, qbar, setMode, select: choose, highlight, get mode() { return mode; } };
  }
  return { css, instr, seg, range, card, svg, loop, audio, soundOn, cssVar, explorer, h };
})();
/* --- end SK kit --- */
/*<SK*/
SK.css('threshold-lab-style', `
.threshold-lab-screen { position: relative; max-height: 300px; background: #000; border-radius: 16px; aspect-ratio: 16 / 8; width: 100%; overflow: hidden; border: 1px solid #1d2638; }
.threshold-lab-screen canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.threshold-lab-msg { position: absolute; left: 0; right: 0; bottom: 10px; text-align: center; color: #6f7d96; font-family: var(--f-mono); font-size: 13px; font-weight: 700; }
.threshold-lab-trial { position: absolute; left: 12px; top: 10px; color: #6f7d96; font-family: var(--f-mono); font-size: 12px; font-weight: 700; }
.threshold-lab-answer { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.threshold-lab-answer .btn { min-height: 50px; }
.threshold-lab-lamp { transition: fill .2s; }
.threshold-lab-plot .ax { stroke: var(--line); stroke-width: 1.5; }
.threshold-lab-plot .grid { stroke: var(--line); stroke-width: 1; stroke-dasharray: 3 4; }
.threshold-lab-plot .curve { fill: none; stroke: var(--carolina); stroke-width: 3; stroke-linejoin: round; }
.threshold-lab-plot .ideal { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 5 5; opacity: .6; }
.threshold-lab-plot .pt { fill: var(--surface); stroke: var(--carolina); stroke-width: 2.5; }
.threshold-lab-plot .half { stroke: var(--spark); stroke-width: 1.5; stroke-dasharray: 6 4; }
.threshold-lab-plot .thr { fill: var(--spark); }
`);

const LEVELS = [3, 6, 10, 15, 22, 34]; // gray level (0–255) of the dot on black
const fmtLb = v => (Math.round(v * 10) / 10).toFixed(1);

ML.registerWidget('threshold-lab', {
  title: 'Threshold lab', tag: 'Experiment',
  mount(el, api) {
    const h = api.h;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'abs', label: 'A. Absolute threshold' }, { v: 'jnd', label: 'B. JND + Weber’s law' }], 'abs', v => { partA.hidden = v !== 'abs'; partB.hidden = v !== 'jnd'; }, 'Part');
    root.append(SK.instr('Be the subject in a real psychophysics experiment. Part A finds the dimmest light <b>you</b> can see. Part B tests how big a change has to be before you notice it.'), tabs.el);

    /* ---------- Part A: absolute threshold ---------- */
    const partA = h('div', { class: 'sk-root' });
    const cv = h('canvas', { 'aria-hidden': 'true' });
    const msg = h('div', { class: 'threshold-lab-msg' }, 'Look at the + and press Start');
    const trialEl = h('div', { class: 'threshold-lab-trial' });
    const screen = h('div', { class: 'threshold-lab-screen', role: 'img', 'aria-label': 'Dark test screen with a fixation cross. A faint dot flashes in the center.' }, cv, trialEl, msg);
    const start = h('button', { type: 'button', class: 'btn btn-primary sk-bigbtn' }, 'Start 12 flashes');
    const saw = h('button', { type: 'button', class: 'btn sk-bigbtn', disabled: true }, 'I saw it (Y)');
    const didnt = h('button', { type: 'button', class: 'btn sk-bigbtn', disabled: true }, 'Didn’t see it (N)');
    const answer = h('div', { class: 'threshold-lab-answer' }, saw, didnt);
    const plotWrap = h('div', { class: 'threshold-lab-plot sk-stage', style: { maxWidth: '480px' } });
    const res = SK.card('How it works', 'A dot will flash in the middle of the dark screen 12 times at different brightness levels, in random order. After each flash, tell the truth: did you see it? Your answers become a detection curve.');
    partA.append(screen, h('div', { class: 'sk-row' }, start), answer, res.el, plotWrap);

    const g = cv.getContext('2d');
    let W = 0, H = 0;
    function size() { const r = screen.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); draw(null); }
    function draw(level) {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2 - 6;
      if (level != null) {
        const v = LEVELS[level];
        const grd = g.createRadialGradient(cx, cy, 0, cx, cy, 16);
        grd.addColorStop(0, `rgb(${v},${v},${v})`); grd.addColorStop(0.6, `rgb(${v},${v},${v})`); grd.addColorStop(1, 'rgb(0,0,0)');
        g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill();
      } else {
        g.strokeStyle = '#3a465e'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 7, cy); g.lineTo(cx + 7, cy); g.moveTo(cx, cy - 7); g.lineTo(cx, cy + 7); g.stroke();
      }
    }
    const ro = new ResizeObserver(size); ro.observe(screen);

    const data = LEVELS.map(() => [0, 0]); // [seen, shown]
    let queue = [], cur = null, running = false;
    function begin() {
      queue = api.util.shuffle(LEVELS.flatMap((_, i) => [i, i]));
      running = true; start.disabled = true; res.set('Testing…', 'Keep your eyes on the +. Answer honestly: guessing “saw it” every time ruins the data.');
      next();
    }
    let total = 0;
    function next() {
      if (!queue.length) return finish();
      cur = queue.pop(); total++;
      trialEl.textContent = `Flash ${12 - queue.length} of 12`;
      saw.disabled = didnt.disabled = true; msg.textContent = 'Get ready…'; draw(null);
      later(() => { draw(cur); msg.textContent = ''; later(() => { draw(null); msg.textContent = 'Did you see a dot?'; saw.disabled = didnt.disabled = false; saw.focus({ preventScroll: true }); }, 220); }, 700 + Math.random() * 700);
    }
    function respond(yes) {
      if (!running || saw.disabled) return;
      saw.disabled = didnt.disabled = true;
      data[cur][1]++; if (yes) data[cur][0]++;
      api.sfx.tap(); next();
    }
    saw.onclick = () => respond(true); didnt.onclick = () => respond(false);
    const onKey = e => { if (partA.hidden || !running) return; if (e.target.closest && e.target.closest('input,textarea')) return; const k = e.key.toLowerCase(); if (k === 'y') respond(true); else if (k === 'n') respond(false); };
    document.addEventListener('keydown', onKey);
    start.onclick = begin;

    function pava(ps) { // monotone increasing fit
      const blocks = ps.map(p => ({ v: p, n: 1 }));
      for (let i = 0; i < blocks.length - 1;) { if (blocks[i].v > blocks[i + 1].v) { const a = blocks[i], b = blocks[i + 1]; blocks.splice(i, 2, { v: (a.v * a.n + b.v * b.n) / (a.n + b.n), n: a.n + b.n }); i = Math.max(0, i - 1); } else i++; }
      return blocks.flatMap(b => Array(b.n).fill(b.v));
    }
    function finish() {
      running = false; start.disabled = false; start.textContent = 'Add 12 more flashes'; trialEl.textContent = ''; msg.textContent = 'Done! See your curve below';
      const ps = data.map(d => d[1] ? d[0] / d[1] : 0);
      const fit = pava(ps);
      let thr = null, note;
      const k = fit.findIndex(p => p >= 0.5);
      if (k === -1) { note = 'You never reached 50%. Your threshold is brighter than our brightest dot (or your screen is very dark). Try again in a darker room or with more brightness.'; }
      else if (k === 0) { thr = 1; note = 'You caught even the dimmest dot at least half the time, so your threshold is at or below level 1 on this screen. Sharp eyes (or a bright screen)!'; }
      else { const a = fit[k - 1], b = fit[k]; thr = k + (b === a ? 0 : (0.5 - a) / (b - a)); note = `You detected the dot 50% of the time at about <b>level ${thr.toFixed(1)}</b>. That is your absolute threshold for this display.`; }
      plot(ps, fit, thr);
      res.set('Your absolute threshold', note + ' Dimmer than that, the light was <b>subliminal</b> for you: below your threshold of conscious detection. Notice there is no sharp line, just a curve: that is why the threshold is defined as the 50% point.', 'good');
      api.sfx.level(); api.addXP(3);
    }
    function plot(ps, fit, thr) {
      const X = i => 52 + i * 62, Y = p => 196 - p * 160;
      let s = '';
      for (let p = 0; p <= 1.001; p += 0.25) s += `<line class="grid" x1="44" x2="380" y1="${Y(p)}" y2="${Y(p)}"/><text class="sk-ts" x="38" y="${Y(p) + 4}" text-anchor="end">${Math.round(p * 100)}%</text>`;
      s += `<line class="ax" x1="44" x2="380" y1="196" y2="196"/><line class="ax" x1="44" x2="44" y1="30" y2="196"/>`;
      LEVELS.forEach((_, i) => { s += `<text class="sk-ts" x="${X(i)}" y="214" text-anchor="middle">${i + 1}</text>`; });
      s += `<text class="sk-ts" x="212" y="234" text-anchor="middle">Brightness level (dim → bright)</text>`;
      s += `<text class="sk-ts" x="14" y="22">Detected</text>`;
      let ideal = ''; for (let x = 0; x <= 5; x += 0.1) ideal += (x ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(1 / (1 + Math.exp(-(x - 2.5) * 2.2))).toFixed(1);
      s += `<path class="ideal" d="${ideal}"/><text class="sk-ts" x="378" y="186" text-anchor="end">dashed = typical S-curve</text>`;
      s += `<line class="half" x1="44" x2="380" y1="${Y(0.5)}" y2="${Y(0.5)}"/><text class="sk-ts" x="380" y="${Y(0.5) - 6}" text-anchor="end" style="fill:var(--spark)">50%</text>`;
      s += `<path class="curve" d="${fit.map((p, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(p)).join('')}"/>`;
      ps.forEach((p, i) => { s += `<circle class="pt" cx="${X(i)}" cy="${Y(p)}" r="6"/>`; });
      if (thr != null) { const tx = X(thr - 1); s += `<line class="half" x1="${tx}" x2="${tx}" y1="${Y(0.5)}" y2="196"/><circle class="thr" cx="${tx}" cy="${Y(0.5)}" r="7"/><text class="sk-t" x="${Math.min(tx + 10, 300)}" y="${Y(0.5) + 22}" style="fill:var(--spark)">Your threshold</text>`; }
      plotWrap.innerHTML = '';
      plotWrap.append(SK.svg('0 0 392 244', s, { role: 'img', 'aria-label': 'Your detection curve: percent of flashes detected at each brightness level.' }));
    }

    /* ---------- Part B: JND + Weber ---------- */
    const partB = h('div', { class: 'sk-root', hidden: true });
    const CFG = {
      weight: { unit: 'lb', k: 0.02, starts: [5, 20, 100], max: 6, step: 0.1, start: 20, kLabel: '2%', what: 'weight' },
      tea: { unit: 'tsp', k: 0.15, starts: [1, 3, 10], max: 3, step: 0.25, start: 1, kLabel: '15%', what: 'sugar' }
    };
    let kind = 'weight', base = 20, add = 0.4;
    const kindSeg = SK.seg([{ v: 'weight', label: 'Lifting weight' }, { v: 'tea', label: 'Sugar in tea' }], 'weight', v => { kind = v; base = CFG[v].start; add = 0; buildStarts(); slider.inp.max = CFG[v].max; slider.inp.step = CFG[v].step; slider.set(0); render(); }, 'Stimulus');
    const startsEl = h('div', { class: 'sk-seg', role: 'group', 'aria-label': 'Starting amount' });
    function buildStarts() {
      startsEl.innerHTML = '';
      startsEl.append(h('span', { class: 'sk-note', style: { alignSelf: 'center', fontWeight: 700 } }, 'Start with:'));
      CFG[kind].starts.forEach(s => { const b = h('button', { type: 'button', 'aria-pressed': String(s === base) }, `${s} ${CFG[kind].unit}`); b.onclick = () => { base = s; api.sfx.tap(); buildStarts(); render(); }; startsEl.append(b); });
    }
    const slider = SK.range('Add', 0, 6, 0.1, 0.4, v => `+${kind === 'tea' ? v.toFixed(2) : fmtLb(v)} ${CFG[kind].unit}`, v => { add = v; render(); });
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '440px' } });
    const read = SK.card('', '');
    const chal = h('div', { class: 'sk-panel' });
    partB.append(kindSeg.el, startsEl, stage, slider.el, read.el, chal);

    const pNotice = () => { const pct = add / base, k = CFG[kind].k; return add <= 0 ? 0 : 1 / (1 + Math.exp(-(pct / k - 1) * 5)); };
    function hand(x, y) {
      return `<g transform="translate(${x} ${y})"><path d="M-30 64 L-24 18 Q-46 10 -48 -6 Q-47 -12 -40 -10 Q-34 0 -22 2 L-22 -8 Q22 -14 34 -4 Q40 6 34 20 L28 64 Z" style="fill:var(--sk-flesh);stroke:var(--sk-flesh-d);stroke-width:2"/>
        <path d="M-22 -8 Q-24 -16 -16 -16 M-6 -11 Q-7 -19 1 -18 M10 -12 Q10 -19 18 -17 M24 -8 Q27 -14 32 -9" style="fill:none;stroke:var(--sk-flesh-d);stroke-width:2;stroke-linecap:round"/></g>`;
    }
    function box(x, y, w, label, hot) {
      const hh = w * 0.8;
      return `<g><rect x="${x - w / 2}" y="${y - hh}" width="${w}" height="${hh}" rx="5" style="fill:color-mix(in srgb,#C89A5B 80%,var(--surface));stroke:color-mix(in srgb,#8A6232 85%,var(--surface));stroke-width:2"/>
        <path d="M${x - w / 2} ${y - hh + 10} H${x + w / 2}" style="stroke:color-mix(in srgb,#8A6232 60%,var(--surface));stroke-width:2"/>
        <text class="sk-t" x="${x}" y="${y - hh / 2 + 8}" text-anchor="middle" style="font-size:${Math.max(13, Math.min(18, w / 4))}px;${hot ? 'fill:var(--spark)' : ''}">${label}</text></g>`;
    }
    function glass(x, y, tsp, label) {
      const n = Math.round(tsp * 8);
      let grains = '';
      for (let i = 0; i < Math.min(n, 110); i++) { const gx = x - 30 + ((i * 37) % 60), gy = y - 4 - Math.floor(i / 10) * 3.2 - ((i * 13) % 3); grains += `<rect x="${gx}" y="${gy}" width="3" height="3" style="fill:var(--sk-white);stroke:var(--line);stroke-width:.5"/>`; }
      const tint = Math.min(1, tsp / 12);
      return `<g><path d="M${x - 40} ${y - 120} L${x - 32} ${y} H${x + 32} L${x + 40} ${y - 120}" style="fill:color-mix(in srgb,#B5651D ${Math.round(45 + tint * 30)}%,var(--surface));opacity:.85"/>
        <path d="M${x - 44} ${y - 132} L${x - 34} ${y + 2} H${x + 34} L${x + 44} ${y - 132}" style="fill:none;stroke:var(--muted);stroke-width:2.5;stroke-linejoin:round"/>${grains}
        <text class="sk-t" x="${x}" y="${y - 60}" text-anchor="middle">${label}</text></g>`;
    }
    function render() {
      const c = CFG[kind], p = pNotice(), pct = add / base * 100, jnd = base * c.k;
      const lampCol = p > 0.75 ? 'var(--good)' : p >= 0.25 ? 'var(--warn)' : 'var(--line)';
      const lampTxt = p > 0.75 ? (kind === 'tea' ? 'Tastes sweeter!' : 'Feels heavier!') : p >= 0.25 ? 'Just noticeable' : (kind === 'tea' ? 'Tastes the same' : 'Feels the same');
      let s = '';
      if (kind === 'weight') {
        const w1 = 46 + Math.sqrt(base) * 7, w2 = 46 + Math.sqrt(base + add) * 7;
        s += hand(100, 196) + box(100, 194, w1, `${base} lb`) + hand(292, 196) + box(292, 194, w2, `${fmtLb(base + add)} lb`, add > 0);
        s += `<text class="sk-ts" x="100" y="276" text-anchor="middle">BEFORE</text><text class="sk-ts" x="292" y="276" text-anchor="middle">AFTER</text>`;
      } else {
        s += glass(100, 250, base, `${base} tsp`) + glass(292, 250, base + add, `${(base + add).toFixed(2).replace(/\.00$/, '')} tsp`);
        s += `<text class="sk-ts" x="100" y="276" text-anchor="middle">BEFORE</text><text class="sk-ts" x="292" y="276" text-anchor="middle">AFTER</text>`;
      }
      s += `<g transform="translate(196 34)"><circle class="threshold-lab-lamp" r="17" style="fill:${lampCol};${p > 0.25 ? 'filter:drop-shadow(0 0 8px ' + lampCol + ')' : ''}"/><text class="sk-t" y="44" text-anchor="middle">${lampTxt}</text>
        <text class="sk-ts" y="62" text-anchor="middle">noticed ${Math.round(p * 100)}% of the time</text></g>`;
      // JND bar
      const bx = 40, bw = 312, sc = bw / c.max, jx = bx + Math.min(jnd, c.max) * sc;
      s += `<g transform="translate(0 300)"><rect x="${bx}" y="0" width="${bw}" height="10" rx="5" style="fill:var(--surface-2);stroke:var(--line)"/>
        <rect x="${bx}" y="0" width="${Math.max(0, Math.min(add, c.max) * sc)}" height="10" rx="5" style="fill:${add >= jnd ? 'var(--good)' : 'var(--carolina)'}"/>
        ${jnd <= c.max ? `<line x1="${jx}" x2="${jx}" y1="-6" y2="16" style="stroke:var(--spark);stroke-width:3"/><text class="sk-ts" x="${Math.min(Math.max(jx, 80), 330)}" y="34" text-anchor="middle" style="fill:var(--spark)">JND = ${c.kLabel} of ${base} = ${kind === 'tea' ? jnd.toFixed(2) : fmtLb(jnd)} ${c.unit}</text>` : `<text class="sk-ts" x="${bx + bw}" y="34" text-anchor="end" style="fill:var(--spark)">JND = ${fmtLb(jnd)} ${c.unit} (off this scale)</text>`}</g>`;
      stage.innerHTML = '';
      stage.append(SK.svg('0 0 392 340', s, { role: 'img', 'aria-label': `Before: ${base} ${c.unit}. After: ${fmtLb(base + add)} ${c.unit}. ${lampTxt}.` }));
      read.set(null, `<span class="readout">+${kind === 'tea' ? add.toFixed(2) : fmtLb(add)} ${c.unit} = ${pct.toFixed(1)}% change.</span> To be noticed, the change must be about <b>${c.kLabel}</b> of what you started with, so starting at ${base} ${c.unit} you need about <b>+${kind === 'tea' ? jnd.toFixed(2) : fmtLb(jnd)} ${c.unit}</b>. ${kind === 'tea' ? '(15% is an example value; real taste JNDs vary.)' : ''}`, p > 0.75 ? 'good' : '');
    }
    // challenge
    const fb = SK.card(null, '');
    fb.el.hidden = true;
    const c5 = h('button', { type: 'button', class: 'btn btn-sm' }, 'Holding 5 lb');
    const c100 = h('button', { type: 'button', class: 'btn btn-sm' }, 'Holding 100 lb');
    function pickChal(ans) {
      kind = 'weight'; kindSeg.set('weight'); slider.inp.max = 6; slider.inp.step = 0.1; base = ans; add = 2; slider.set(2); buildStarts(); render();
      fb.el.hidden = false;
      if (ans === 5) { api.sfx.good(); api.addXP(2); fb.set('Right!', '+2 lb on 5 lb is a 40% jump: impossible to miss. On 100 lb, +2 lb is only 2%, right at the JND, so you notice it only about half the time. Switch between 5 and 100 lb above to compare.', 'good'); }
      else { api.sfx.bad(); fb.set('Look again', '+2 lb on 100 lb is only a 2% change, right at the edge of noticing. The person holding 5 lb gets a 40% change and notices instantly. Weber’s law is about the <b>percentage</b>, not the amount.', 'bad'); }
    }
    c5.onclick = () => pickChal(5); c100.onclick = () => pickChal(100);
    chal.append(h('div', { class: 'sk-kicker' }, 'Challenge'), h('p', { style: { fontWeight: 700 } }, 'Who will notice if we add 2 lb?'), h('div', { class: 'sk-row' }, c5, c100), fb.el,
      h('p', { class: 'sk-note' }, 'Sugar in tea works the same way: one teaspoon in barely-sweet tea is obvious, but the same teaspoon in very sweet tea may go unnoticed. Try it with “Sugar in tea.”'));
    buildStarts(); render();

    root.append(partA, partB);
    el.append(root);
    return () => { timers.forEach(clearTimeout); timers.clear(); ro.disconnect(); document.removeEventListener('keydown', onKey); };
  }
});
})();
