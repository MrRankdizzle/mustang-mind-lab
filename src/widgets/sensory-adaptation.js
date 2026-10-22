/* 1.6A sensory-adaptation — firing rate drops with a constant stimulus; Troxler fading stare test */
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
SK.css('sensory-adaptation-style', `
.sensory-adaptation-scope { position: relative; border: 1px solid var(--line); border-radius: 14px; background: var(--surface-2); overflow: hidden; }
.sensory-adaptation-scope canvas { display: block; width: 100%; height: 230px; }
.sensory-adaptation-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; }
.sensory-adaptation-stat { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; }
.sensory-adaptation-stat span { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 700; }
.sensory-adaptation-stat b { font-family: var(--f-mono); font-size: 20px; font-variant-numeric: tabular-nums; }
.sensory-adaptation-trox { position: relative; border-radius: 16px; overflow: hidden; background: #B4B4BA; }
.sensory-adaptation-trox svg { display: block; width: 100%; height: auto; }
.sensory-adaptation-count { position: absolute; right: 12px; bottom: 8px; font-family: var(--f-mono); font-weight: 700; font-size: 14px; color: #55555c; }
`);

const STIM = {
  watch: { label: 'Watch on your wrist', sense: 'touch', what: 'pressure receptors in your skin', change: 'Jiggle the watch' },
  smell: { label: 'Air freshener smell', sense: 'smell', what: 'odor receptors in your nose', change: 'New, stronger whiff' },
  hum: { label: 'Fridge hum', sense: 'hearing', what: 'hair cells and auditory neurons', change: 'Hum changes pitch' }
};

ML.registerWidget('sensory-adaptation', {
  title: 'Sensory adaptation', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'meter', label: 'Constant stimulus' }, { v: 'stare', label: 'Stare test' }], 'meter', v => { p1.hidden = v !== 'meter'; p2.hidden = v !== 'stare'; }, 'Demo');
    root.append(SK.instr('Turn on a stimulus and leave it alone. Watch what the neurons do over the next few seconds, then change it.'), tabs.el);

    /* ---------- Part 1: firing-rate meter ---------- */
    const p1 = h('div', { class: 'sk-root' });
    let kind = 'watch', on = false, x = 0, s = 0, tOn = 0, t = 0;
    const kindSeg = SK.seg(Object.entries(STIM).map(([v, o]) => ({ v, label: o.label })), 'watch', v => { kind = v; change(true); paintBtns(); }, 'Stimulus');
    const onBtn = h('button', { type: 'button', class: 'btn btn-primary sk-bigbtn' }, 'Put it on');
    const chBtn = h('button', { type: 'button', class: 'btn sk-bigbtn', disabled: true }, 'Jiggle the watch');
    const cv = h('canvas', { role: 'img', 'aria-label': 'Live graph of the stimulus and the sensory neuron firing rate over time' });
    const scope = h('div', { class: 'sensory-adaptation-scope' }, cv);
    const rateB = h('b', null, '0'), noticeB = h('b', null, '0%'), timeB = h('b', null, '—');
    const stats = h('div', { class: 'sensory-adaptation-stats' },
      h('div', { class: 'sensory-adaptation-stat' }, h('span', null, 'Firing rate'), rateB),
      h('div', { class: 'sensory-adaptation-stat' }, h('span', null, 'You notice it'), noticeB),
      h('div', { class: 'sensory-adaptation-stat' }, h('span', null, 'Stimulus on for'), timeB));
    const info = SK.card('Ready', 'Press <b>Put it on</b>. The stimulus will stay exactly the same the whole time.');
    p1.append(kindSeg.el, h('div', { class: 'sk-row' }, onBtn, chBtn), scope, stats, info.el);
    function paintBtns() { onBtn.textContent = on ? 'Take it off' : 'Put it on'; chBtn.disabled = !on; chBtn.textContent = STIM[kind].change; }
    let phase = '';
    function change(reset) {
      if (reset) { on = false; s = 0; x = 0; phase = ''; info.set('Ready', 'Press <b>Put it on</b>. The stimulus will stay exactly the same the whole time.'); paintBtns(); return; }
    }
    onBtn.onclick = () => {
      on = !on; api.sfx.tap();
      if (on) { s = 1; tOn = t; phase = 'on'; info.set('Stimulus ON', `Big burst! Your ${STIM[kind].what} fire fast because something new just happened.`); }
      else { s = 0; phase = 'off'; info.set('Stimulus OFF', 'Firing drops back to its resting level. Put it on again: the neurons have recovered, so you get a fresh burst.'); }
      paintBtns();
    };
    chBtn.onclick = () => { x *= 0.25; s = 1.15; tOn = t; api.sfx.blip(); phase = 'change'; info.set('A change!', 'Any <b>change</b> in the stimulus wakes the neurons back up. Your senses are built to report change, not sameness.'); };

    const g = cv.getContext('2d');
    let W = 0, H = 230, col = {};
    function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); readCols(); }
    function readCols() { col = { ink: SK.cssVar(root, '--ink'), muted: SK.cssVar(root, '--muted'), line: SK.cssVar(root, '--line'), car: SK.cssVar(root, '--carolina'), spark: SK.cssVar(root, '--spark'), good: SK.cssVar(root, '--good'), warn: SK.cssVar(root, '--warn') }; }
    const ro = new ResizeObserver(size); ro.observe(scope);
    const N = 300; // samples in view (~10 s)
    const hist = []; // {s, r, spike}
    let acc = 0, spikeAcc = 0, cFrame = 0, lastMsg = 0;
    const lp = SK.loop((dt) => {
      if (p1.hidden) return;
      t += dt; acc += dt;
      if (++cFrame % 60 === 0 || !col.ink) readCols();
      // adaptation dynamics
      const target = s > 0 ? 1 : 0, tau = s > 0 ? 2.2 : 3;
      x += (target - x) * (1 - Math.exp(-dt / tau));
      if (s > 1) s += (1 - s) * (1 - Math.exp(-dt / 0.6));
      const r = 3 + 60 * s * Math.max(0.06, 1 - 0.94 * x); // spikes/s
      while (acc >= 1 / 30) {
        acc -= 1 / 30;
        spikeAcc += r / 30;
        let spike = 0; if (Math.random() < Math.min(1, r / 30)) spike = 1;
        hist.push({ s, r, spike }); if (hist.length > N) hist.shift();
      }
      const notice = Math.max(0, Math.min(1, (r - 6) / 55));
      rateB.textContent = `${Math.round(r)}/s`; noticeB.textContent = `${Math.round(notice * 100)}%`;
      timeB.textContent = on ? `${(t - tOn).toFixed(1)} s` : '—';
      if (on && phase !== 'adapted' && t - tOn > 5) { phase = 'adapted'; info.set('Adapted', `Same stimulus, but the neurons barely fire now, so you stop noticing it. That is <b>sensory adaptation</b>: less sensitivity to a constant, unchanging stimulus. (You only noticed your ${kind === 'watch' ? 'watch' : kind === 'smell' ? 'room’s smell' : 'fridge'} again because you were reminded!)`, 'good'); api.addXP(1); }
      drawScope();
    });
    function drawScope() {
      g.clearRect(0, 0, W, H);
      const L = 10, R = W - 10, dx = (R - L) / N;
      const lane = (y, label) => { g.fillStyle = col.muted; g.font = `700 11px ${ML.fonts.mono}`; g.fillText(label, L, y); };
      lane(16, 'STIMULUS'); lane(84, 'NEURON SPIKES'); lane(146, 'FIRING RATE');
      // stimulus lane
      g.strokeStyle = col.car; g.lineWidth = 3; g.beginPath();
      hist.forEach((p, i) => { const xx = R - (hist.length - 1 - i) * dx, yy = 60 - Math.min(1.2, p.s) * 30; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }); g.stroke();
      // spikes
      g.strokeStyle = col.spark; g.lineWidth = 1.6; g.beginPath();
      hist.forEach((p, i) => { if (!p.spike) return; const xx = R - (hist.length - 1 - i) * dx; g.moveTo(xx, 94); g.lineTo(xx, 124); }); g.stroke();
      // rate line
      g.strokeStyle = col.line; g.lineWidth = 1; g.beginPath(); g.moveTo(L, 218); g.lineTo(R, 218); g.stroke();
      g.strokeStyle = col.ink; g.lineWidth = 2.5; g.beginPath();
      hist.forEach((p, i) => { const xx = R - (hist.length - 1 - i) * dx, yy = 218 - Math.min(70, p.r) * 0.95; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }); g.stroke();
      g.fillStyle = col.muted; g.textAlign = 'right'; g.fillText('now →', R, 16); g.textAlign = 'left';
    }

    /* ---------- Part 2: Troxler fading ---------- */
    const p2 = h('div', { class: 'sk-root', hidden: true });
    const trox = h('div', { class: 'sensory-adaptation-trox' });
    const tsvg = SK.svg('0 0 400 220', `<defs><filter id="sa-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="13"/></filter></defs>
      <rect width="400" height="220" fill="#B4B4BA"/>
      <g filter="url(#sa-blur)"><circle cx="70" cy="60" r="30" fill="#C9A3CF"/><circle cx="335" cy="70" r="30" fill="#A7C0A4"/><circle cx="300" cy="175" r="30" fill="#CDB59A"/><circle cx="85" cy="170" r="28" fill="#A4B6CE"/></g>
      <path d="M193 110 H207 M200 103 V117" stroke="#222" stroke-width="2.5"/>`, { role: 'img', 'aria-label': 'Gray field with a black plus sign in the center and four faint, blurry colored blobs near the corners' });
    const count = h('div', { class: 'sensory-adaptation-count', 'aria-live': 'polite' });
    trox.append(tsvg, count);
    const go = h('button', { type: 'button', class: 'btn btn-primary sk-bigbtn' }, 'Start 20-second stare');
    const tinfo = SK.card('How to do it', 'Press start, then stare at the black + without moving your eyes at all. Pay attention to the fuzzy colored blobs out of the corner of your eye.');
    const ask = h('div', { class: 'sk-row', hidden: true });
    let tTimer = 0;
    go.onclick = () => {
      clearInterval(tTimer); let n = 20; ask.hidden = true; go.disabled = true; count.textContent = n + ' s';
      tinfo.set('Stare at the +', 'Don’t move your eyes. Don’t blink if you can help it. Just watch the blobs with your side vision.');
      tTimer = setInterval(() => { n--; count.textContent = n > 0 ? n + ' s' : ''; if (n <= 0) { clearInterval(tTimer); go.disabled = false; go.textContent = 'Try it again'; api.sfx.blip(); tinfo.set('Time!', 'Did the blobs fade or vanish while you stared?'); ask.hidden = false; } }, 1000);
    };
    const yes = h('button', { type: 'button', class: 'btn btn-sm' }, 'Yes, they faded');
    const no = h('button', { type: 'button', class: 'btn btn-sm' }, 'No, they stayed');
    const explain = 'Your eyes normally make tiny, constant movements, so the image on your retina keeps changing. When you hold your eyes still, these fuzzy, low-contrast blobs land on the <b>same</b> receptors with <b>no change</b>, so those neurons adapt and the blobs fade from awareness (Troxler fading). Move your eyes and they pop right back.';
    yes.onclick = () => { api.sfx.good(); api.addXP(2); tinfo.set('That is sensory adaptation!', explain, 'good'); ask.hidden = true; };
    no.onclick = () => { api.sfx.tap(); tinfo.set('Try once more', 'It takes very still eyes. Get a bit closer, keep your gaze locked on the +, and try not to blink. ' + explain); ask.hidden = true; };
    ask.append(yes, no);
    p2.append(trox, h('div', { class: 'sk-row' }, go), tinfo.el, ask);

    root.append(p1, p2);
    el.append(root);
    return () => { lp.stop(); ro.disconnect(); clearInterval(tTimer); };
  }
});
})();
