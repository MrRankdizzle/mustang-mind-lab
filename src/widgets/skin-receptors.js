/* 1.6D skin-receptors — skin cross-section, stimuli fire receptors, path to somatosensory cortex (+ limbic for pain) */
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
SK.css('skin-receptors-style', `
.skin-receptors-svg .epi { fill: color-mix(in srgb, #F6D3C4 85%, var(--surface)); stroke: var(--sk-flesh-d); stroke-width: 1.5; }
.skin-receptors-svg .der { fill: color-mix(in srgb, #EFA597 55%, var(--surface)); }
.skin-receptors-svg .hyp { fill: color-mix(in srgb, #F3D98A 55%, var(--surface)); }
.skin-receptors-svg .fat { fill: color-mix(in srgb, #F8E7A8 80%, var(--surface)); stroke: color-mix(in srgb, #D6B44A 70%, var(--surface)); stroke-width: 1; }
.skin-receptors-svg .fib { fill: none; stroke-width: 2.5; stroke-linecap: round; }
.skin-receptors-svg .mech { fill: color-mix(in srgb, #7C9CF0 75%, var(--surface)); stroke: #3E5FC4; stroke-width: 1.5; }
.skin-receptors-svg .mechf { stroke: #3E5FC4; }
.skin-receptors-svg .thermf { stroke: #E08A1E; }
.skin-receptors-svg .nocif { stroke: #D93A4E; }
.skin-receptors-svg .bundle { fill: none; stroke: var(--sk-nerve); stroke-width: 9; stroke-linecap: round; }
.skin-receptors-svg .hair { stroke: #5B4636; stroke-width: 3; stroke-linecap: round; }
.skin-receptors-svg .sig { filter: drop-shadow(0 0 4px currentColor); }
.skin-receptors-svg .fire { animation: skin-receptors-pulse .5s ease-in-out infinite alternate; }
@keyframes skin-receptors-pulse { from { filter: drop-shadow(0 0 2px #fff); } to { filter: drop-shadow(0 0 9px var(--spark)); } }
.reduce-motion .skin-receptors-svg .fire { animation: none; filter: drop-shadow(0 0 6px var(--spark)); }
.skin-receptors-stims { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 6px; }
.skin-receptors-stims button { display: flex; flex-direction: column; align-items: center; gap: 2px; border: 1.5px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 6px 4px; font-weight: 700; font-size: 13.5px; cursor: pointer; color: var(--ink); }
.skin-receptors-stims button svg { width: 34px; height: 34px; }
.skin-receptors-stims button[aria-pressed="true"] { border-color: var(--spark); background: var(--spark-soft); }
.skin-receptors-path { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 14px; font-weight: 700; }
.skin-receptors-path span { border: 1.5px solid var(--line); border-radius: 10px; padding: 5px 9px; background: var(--surface-2); transition: all .3s; }
.skin-receptors-path span.on { border-color: var(--carolina); background: var(--carolina-soft); color: var(--carolina); }
.skin-receptors-path span.pain.on { border-color: var(--spark); background: var(--spark-soft); color: var(--spark); }
.skin-receptors-path i { font-style: normal; color: var(--muted); }
.skin-receptors-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13.5px; font-weight: 700; }
.skin-receptors-legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
`);

const PARTS = [
  { id: 'mech', name: 'Mechanoreceptors', info: 'Detect <b>pressure, vibration, and texture</b>. Some sit just under the surface (light touch, like a feather); onion-like ones deep in the skin sense firm pressure and vibration.' },
  { id: 'therm', name: 'Thermoreceptors', info: 'Free nerve endings that detect <b>temperature changes</b>: some respond to cold, others to warmth.' },
  { id: 'noci', name: 'Nociceptors', info: 'Free nerve endings that detect <b>harmful</b> stimuli (extreme heat or cold, sharp pressure, damaging chemicals) and signal <b>pain</b>.' },
  { id: 'epi', name: 'Epidermis', info: 'The thin outer layer of skin. Only nociceptor endings reach up into it.' },
  { id: 'der', name: 'Dermis', info: 'The thick middle layer with most touch receptors, blood vessels, and hair follicles.' },
  { id: 'nerve', name: 'Sensory nerve', info: 'Bundles of sensory fibers that carry the signals to the spinal cord, then up to the brain.' }
];
const STIM = [
  { id: 'feather', n: 'Feather', fire: ['mech1'], pain: false, t: 'Light touch', d: 'The surface mechanoreceptors respond to the feather’s gentle pressure and movement.', ic: '<path d="M8 30 C 12 18 20 8 30 4 C 28 14 22 24 10 30 Z" fill="#B9C7E8" stroke="#6B7FB0"/><path d="M8 30 L24 12" stroke="#6B7FB0" stroke-width="1.5"/>' },
  { id: 'press', n: 'Firm press', fire: ['mech1', 'mech2'], pain: false, t: 'Pressure', d: 'Pressing harder reaches the deep, onion-shaped mechanoreceptors too.', ic: '<path d="M12 4 h10 v14 c4 0 6 3 6 7 v5 h-22 v-5 c0-4 2-7 6-7 Z" fill="#E9A693" stroke="#B9705E"/>' },
  { id: 'ice', n: 'Ice cube', fire: ['therm'], pain: false, t: 'Cold', d: 'Cold-sensitive <b>thermoreceptors</b> fire. Your brain reads “cold” even though no damage is happening.', ic: '<rect x="7" y="7" width="20" height="20" rx="4" fill="#CFEFFF" stroke="#5FA8D3" stroke-width="2"/><path d="M11 12 l5 -2" stroke="#fff" stroke-width="2"/>' },
  { id: 'mug', n: 'Hot mug', fire: ['therm', 'noci'], pain: true, t: 'Hot (too hot!)', d: 'Warmth receptors fire, and because it is hot enough to harm you, <b>nociceptors</b> join in. Pain is a warning: let go!', ic: '<rect x="6" y="12" width="18" height="18" rx="3" fill="#E5484D"/><path d="M24 16 h3 a3 3 0 0 1 0 8 h-3" fill="none" stroke="#E5484D" stroke-width="2.5"/><path d="M11 9 q2 -3 0 -6 M17 9 q2 -3 0 -6" stroke="#999" stroke-width="1.5" fill="none"/>' },
  { id: 'pin', n: 'Pin prick', fire: ['mech1', 'noci'], pain: true, t: 'Sharp pain', d: 'The pin presses the skin (mechanoreceptors) and threatens damage, so <b>nociceptors</b> fire fast. Ouch!', ic: '<path d="M17 4 L18 26 L16 26 Z" fill="#9AA4B2"/><circle cx="17" cy="5" r="4" fill="#E5484D"/>' }
];
const QUIZ = [['A feather brushes your arm', 'mech'], ['You step onto a cold floor', 'therm'], ['You touch a hot stove', 'noci'], ['You feel the texture of sandpaper', 'mech'], ['Warm bath water on your hand', 'therm'], ['A bee sting', 'noci']];

ML.registerWidget('skin-receptors', {
  title: 'Receptors in your skin', tag: 'Anatomy',
  mount(el, api) {
    const h = api.h;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const root = h('div', { class: 'sk-root' });
    let mode = 'touch';
    const modeSeg = SK.seg([{ v: 'touch', label: 'Touch the skin' }, { v: 'explore', label: 'Explore' }, { v: 'quiz', label: 'Quiz me' }], 'touch', setMode, 'Mode');
    root.append(SK.instr('Pick something to touch the skin with and watch which receptors fire and where the signal goes. Explore the layers, then quiz yourself.'), modeSeg.el);

    let fat = '';
    for (let i = 0; i < 9; i++) fat += `<ellipse class="fat" cx="${30 + i * 46}" cy="${222 + (i % 2) * 14}" rx="22" ry="14"/>`;
    const svg = SK.svg('0 0 420 270', `
      <rect class="hyp" x="0" y="190" width="420" height="80"/>${fat}
      <g class="sk-part" data-part="der"><path class="der sk-glow" d="M0 82 Q 30 96 60 82 T 120 82 T 180 82 T 240 82 T 300 82 T 360 82 T 420 82 V190 H0 Z"/></g>
      <g class="sk-part" data-part="epi"><path class="epi sk-glow" d="M0 46 Q 105 40 210 46 T 420 46 V82 Q 390 96 360 82 T 300 82 T 240 82 T 180 82 T 120 82 T 60 82 T 0 82 Z"/></g>
      <path class="hair" d="M340 190 C 338 150 336 100 344 20"/><ellipse cx="340" cy="186" rx="9" ry="12" style="fill:color-mix(in srgb,#B98C6A 70%,var(--surface))"/>
      <text class="sk-ts" x="6" y="64">epidermis</text><text class="sk-ts" x="6" y="140">dermis</text><text class="sk-ts" x="6" y="262">fat layer</text>
      <g class="sk-part" data-part="nerve"><path class="bundle sk-glow" d="M120 186 C 200 196 300 210 418 236"/></g>
      <g class="sk-part" data-part="mech">
        <path class="fib mechf" d="M100 98 C 102 140 110 170 128 188"/>
        <ellipse class="mech sk-glow" id="sr-mech1" cx="98" cy="94" rx="8" ry="13"/>
        <path class="fib mechf" d="M262 214 C 260 204 252 196 236 192"/>
        <g class="sk-glow" id="sr-mech2"><ellipse cx="280" cy="222" rx="22" ry="13" class="mech"/><ellipse cx="280" cy="222" rx="15" ry="8" style="fill:none;stroke:#3E5FC4;stroke-width:1.2"/><ellipse cx="280" cy="222" rx="8" ry="4" style="fill:none;stroke:#3E5FC4;stroke-width:1.2"/></g>
      </g>
      <g class="sk-part" data-part="therm"><g class="sk-glow" id="sr-therm"><path class="fib thermf" d="M190 100 L182 88 M190 100 L196 86 M190 100 L204 92 M190 100 C 192 140 196 170 200 192"/><circle cx="190" cy="100" r="4" style="fill:#E08A1E"/></g></g>
      <g class="sk-part" data-part="noci"><g class="sk-glow" id="sr-noci"><path class="fib nocif" d="M246 58 L240 70 M252 56 L252 72 M260 60 L256 72 M252 72 C 254 120 258 160 262 196"/><circle cx="252" cy="74" r="4" style="fill:#D93A4E"/></g></g>
      <g id="sr-stim"></g><g id="sr-sig"></g>
      <g class="sk-lbl" data-part="mech"><path class="sk-lead" d="M88 86 L70 28"/><text class="sk-t" x="70" y="22" text-anchor="middle">Mechano</text></g>
      <g class="sk-lbl" data-part="therm"><path class="sk-lead" d="M188 92 L170 28"/><text class="sk-t" x="166" y="22" text-anchor="middle">Thermo</text></g>
      <g class="sk-lbl" data-part="noci"><path class="sk-lead" d="M254 56 L262 28"/><text class="sk-t" x="262" y="22" text-anchor="middle">Noci</text></g>
      <g class="sk-lbl" data-part="mech"><path class="sk-lead" d="M234 252 L262 230"/><text class="sk-t" x="232" y="262" text-anchor="end">Mechano (deep)</text></g>
      <text class="sk-ts" x="414" y="226" text-anchor="end">to spinal cord →</text>
      <ellipse class="sk-hit" data-part="mech" cx="98" cy="94" rx="16" ry="20"/><ellipse class="sk-hit" data-part="mech" cx="280" cy="222" rx="28" ry="18"/>
      <circle class="sk-hit" data-part="therm" cx="192" cy="96" r="18"/><circle class="sk-hit" data-part="noci" cx="252" cy="66" r="18"/>
      <path class="sk-hit" data-part="nerve" d="M140 188 C 200 196 300 210 418 236" style="stroke-width:20;fill:none"/>
      <rect class="sk-hit" data-part="epi" x="300" y="48" width="30" height="30"/><rect class="sk-hit" data-part="der" x="40" y="120" width="40" height="50"/>`, { class: 'skin-receptors-svg', role: 'group', 'aria-label': 'Cross-section of skin showing epidermis, dermis, fat layer, and touch, temperature, and pain receptors' });
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '560px' } }, svg);
    const legend = h('div', { class: 'skin-receptors-legend' }, h('span', null, h('i', { style: { background: '#3E5FC4' } }), 'Mechanoreceptors: pressure, texture'), h('span', null, h('i', { style: { background: '#E08A1E' } }), 'Thermoreceptors: temperature'), h('span', null, h('i', { style: { background: '#D93A4E' } }), 'Nociceptors: pain'));
    const ex = SK.explorer(api, svg, PARTS, { rootEl: root, onSelect: quizPick });
    // touch mode
    const touchBox = h('div', { class: 'sk-root' });
    const stims = h('div', { class: 'skin-receptors-stims', role: 'group', 'aria-label': 'Stimuli' });
    const stimBtns = STIM.map(S => { const b = h('button', { type: 'button', 'aria-pressed': 'false' }); b.innerHTML = `<svg viewBox="0 0 34 34" aria-hidden="true">${S.ic}</svg>${S.n}`; b.onclick = () => touch(S, b); stims.append(b); return b; });
    const pathEls = ['Skin receptors', 'Spinal cord', 'Thalamus', 'Somatosensory cortex (parietal lobe)'].map(t => h('span', null, t));
    const limb = h('span', { class: 'pain' }, 'Limbic system: “this hurts!” feeling');
    const pathRow = h('div', { class: 'skin-receptors-path', 'aria-live': 'polite' }, pathEls[0], h('i', null, '→'), pathEls[1], h('i', null, '→'), pathEls[2], h('i', null, '→'), pathEls[3], h('i', null, '+'), limb);
    const tCard = SK.card('Pick a stimulus', 'Each kind of receptor responds to a different kind of energy, then all of them send signals up the same road to the brain.');
    touchBox.append(stims, tCard.el, h('div', { class: 'sk-kicker' }, 'Signal path'), pathRow);
    let sigs = [], firing = [];
    function touch(S, b) {
      stimBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      api.sfx.tap();
      firing = S.fire;
      ['mech1', 'mech2', 'therm', 'noci'].forEach(id => svg.querySelector('#sr-' + id).classList.toggle('fire', S.fire.includes(id)));
      const sx = S.id === 'feather' || S.id === 'press' ? 122 : S.id === 'pin' ? 232 : 216;
      svg.querySelector('#sr-stim').innerHTML = `<g transform="translate(${sx - 17} 10)">${S.ic}</g>`;
      tCard.set(S.t, S.d, S.pain ? 'spark' : '');
      pathEls.forEach(p => p.classList.remove('on')); limb.classList.remove('on');
      pathEls.forEach((p, i) => later(() => { p.classList.add('on'); if (i === 3 && S.pain) later(() => limb.classList.add('on'), 300); }, 300 + i * 380));
      if (S.pain) api.sfx.bad(); else api.sfx.blip();
    }
    // signal animation
    const sigG = svg.querySelector('#sr-sig');
    const routes = { mech1: [[98, 104], [102, 140], [128, 188]], mech2: [[262, 214], [236, 192]], therm: [[190, 100], [196, 170], [200, 192]], noci: [[252, 74], [256, 140], [262, 196]] };
    const exitPts = [[262, 198], [330, 212], [418, 236]];
    const col = { mech1: '#3E5FC4', mech2: '#3E5FC4', therm: '#E08A1E', noci: '#D93A4E' };
    let spawn = 0;
    const lp = SK.loop(dt => {
      if (mode !== 'touch' || !firing.length) { sigG.innerHTML = ''; return; }
      spawn -= dt;
      if (spawn <= 0) { spawn = 0.28; firing.forEach(id => sigs.push({ id, u: 0, spd: id === 'noci' ? 0.9 : 0.7 })); }
      let s = '';
      sigs = sigs.filter(g => { g.u += dt * g.spd; return g.u < 2; });
      sigs.forEach(g => {
        const pts = routes[g.id].concat(exitPts);
        const segs = pts.length - 1, f = Math.min(segs - 0.001, g.u / 2 * segs), i = Math.floor(f), k = f - i;
        const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k;
        s += `<circle class="sig" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" style="fill:${col[g.id]};color:${col[g.id]}"/>`;
      });
      sigG.innerHTML = s;
    });
    // quiz
    const quizBox = h('div', { class: 'sk-root', hidden: true });
    const qText = h('div', { class: 'sk-quizbar' });
    let qi = 0, qOrder = [], qRight = 0, qMiss = false, qBusy = false;
    quizBox.append(qText);
    function ask() {
      if (qi >= qOrder.length) { qText.innerHTML = ''; const again = h('button', { type: 'button', class: 'btn btn-sm' }, 'Quiz me again'); again.onclick = startQuiz; qText.append(h('span', null, `Done! ${qRight}/${qOrder.length} first try.`), again); if (qRight >= 5) api.sfx.level(); ex.info.set('Nice work', 'Remember: mechano = pressure and texture, thermo = temperature, noci = pain.', 'good'); return; }
      qText.innerHTML = ''; qText.append(h('span', null, `${qOrder[qi][0]}. Tap the receptor that fires most.`), h('span', { class: 'readout' }, `${qi + 1}/${qOrder.length}`));
    }
    function startQuiz() { qOrder = api.util.shuffle(QUIZ); qi = 0; qRight = 0; qMiss = false; qBusy = false; ex.info.set('Quiz', 'Read the situation, then tap the right type of receptor in the skin.'); ask(); }
    function quizPick(id) {
      if (mode !== 'quiz' || qBusy || qi >= qOrder.length) return;
      if (!['mech', 'therm', 'noci'].includes(id)) { ex.info.set('Pick a receptor', 'Tap one of the three receptor types (blue, orange, or red), not a skin layer.'); return; }
      const want = qOrder[qi][1];
      if (id === want) { qBusy = true; if (!qMiss) { qRight++; api.addXP(2); } api.sfx.good(); ex.info.set('Correct!', PARTS.find(p => p.id === id).info, 'good'); later(() => { qi++; qMiss = false; qBusy = false; ex.highlight(null); ask(); }, 1200); }
      else { qMiss = true; api.sfx.bad(); ex.info.set('Not that one', `That is a ${PARTS.find(p => p.id === id).name.toLowerCase().replace(/s$/, '')}. ${PARTS.find(p => p.id === id).info}`, 'bad'); }
    }
    function setMode(m) {
      mode = m;
      touchBox.hidden = m !== 'touch'; quizBox.hidden = m !== 'quiz';
      ex.info.el.hidden = m === 'touch';
      svg.querySelectorAll('.sk-hit').forEach(x => x.style.pointerEvents = m === 'touch' ? 'none' : '');
      ex.setMode('explore'); ex.highlight(null);
      root.classList.toggle('sk-quiz', m === 'quiz'); legend.hidden = m === 'quiz';
      if (m !== 'touch') { firing = []; ['mech1', 'mech2', 'therm', 'noci'].forEach(id => svg.querySelector('#sr-' + id).classList.remove('fire')); svg.querySelector('#sr-stim').innerHTML = ''; stimBtns.forEach(x => x.setAttribute('aria-pressed', 'false')); }
      if (m === 'quiz') startQuiz();
    }
    root.append(stage, legend, touchBox, quizBox, ex.info.el);
    setMode('touch');
    el.append(root);
    return () => { lp.stop(); timers.forEach(clearTimeout); };
  }
});
})();
