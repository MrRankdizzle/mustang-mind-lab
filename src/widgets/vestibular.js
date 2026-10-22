/* 1.6E vestibular — semicircular canal fluid lag (spin, stop, dizziness) + kinesthesis arm demo */
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
SK.css('vestibular-style', `
.vestibular-svg .head { fill: var(--sk-flesh); stroke: var(--sk-flesh-d); stroke-width: 2.5; }
.vestibular-svg .hair { fill: color-mix(in srgb, #6B4A33 85%, var(--surface)); }
.vestibular-svg .canal { fill: none; stroke: color-mix(in srgb, #3E8DC4 80%, var(--surface)); stroke-width: 22; }
.vestibular-svg .canalf { fill: none; stroke: var(--sk-fluid); stroke-width: 16; }
.vestibular-svg .p { fill: color-mix(in srgb, #1F6FB5 90%, var(--surface)); }
.vestibular-svg .cupula { fill: color-mix(in srgb, #B79CF6 85%, var(--surface)); stroke: var(--sk-vio); stroke-width: 1.5; }
.vestibular-svg .hc { stroke: var(--spark); stroke-width: 2.2; stroke-linecap: round; }
.vestibular-svg .arrow { fill: none; stroke-width: 4; stroke-linecap: round; }
.vestibular-svg .sk-ts { font-size: 14.5px; }
.vestibular-svg .bone { fill: var(--sk-bone); stroke: var(--sk-bone-d); stroke-width: 2; }
.vestibular-svg .muscle { fill: color-mix(in srgb, #D9726A 80%, var(--surface)); stroke: color-mix(in srgb, #9E3F38 80%, var(--surface)); stroke-width: 1.5; }
.vestibular-svg .rec { fill: var(--sk-gold); stroke: #8A6300; stroke-width: 1; }
.vestibular-svg .sig { fill: var(--spark); filter: drop-shadow(0 0 4px var(--spark)); }
.vestibular-meters { display: grid; gap: 8px; }
.vestibular-m { display: grid; grid-template-columns: 130px 1fr 74px; gap: 8px; align-items: center; font-size: 14px; font-weight: 700; }
.vestibular-m .readout { font-size: 13px; text-align: right; }
.vestibular-bi { position: relative; height: 14px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line); overflow: hidden; }
.vestibular-bi::after { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: var(--muted); }
.vestibular-bi i { position: absolute; top: 0; bottom: 0; background: var(--carolina); border-radius: 99px; }
.vestibular-3 { display: grid; grid-template-columns: 150px 1fr; gap: 12px; align-items: center; }
@media (max-width: 480px) { .vestibular-3 { grid-template-columns: 1fr; justify-items: center; } .vestibular-m { grid-template-columns: 104px 1fr 64px; } }
`);

const CAN = [
  { id: 'h', n: 'Shake “no”', canal: 'horizontal canal', d: 'Turning your head side to side (or spinning) swirls the fluid in the horizontal canal.' },
  { id: 'a', n: 'Nod “yes”', canal: 'front (anterior) canal', d: 'Nodding up and down moves fluid mostly in the front vertical canal.' },
  { id: 'p', n: 'Tilt to shoulder', canal: 'back (posterior) canal', d: 'Tilting your ear toward your shoulder moves fluid mostly in the back vertical canal.' }
];

ML.registerWidget('vestibular', {
  title: 'Balance and body position', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'spin', label: 'Spin test' }, { v: 'canals', label: 'Three canals' }, { v: 'kin', label: 'Kinesthesis' }], 'spin', v => { p1.hidden = v !== 'spin'; p2.hidden = v !== 'canals'; p3.hidden = v !== 'kin'; }, 'Activity');
    root.append(SK.instr('Press <b>Spin</b> (or drag the head around) and watch the fluid inside a semicircular canal. Then stop suddenly and see why you feel dizzy.'), tabs.el);

    /* ---------- spin test ---------- */
    const p1 = h('div', { class: 'sk-root' });
    const svg = SK.svg('0 0 420 220', `
      <text class="sk-ts" x="100" y="16" text-anchor="middle">HEAD (top view)</text>
      <g id="vs-head" transform="translate(100 118)">
        <ellipse class="head" rx="58" ry="64"/>
        <path class="hair" d="M-54 10 C -60 -40 -30 -66 0 -66 C 30 -66 60 -40 54 10 C 40 -20 -40 -20 -54 10 Z" transform="rotate(180)"/>
        <path class="head" d="M-10 -62 C -8 -78 8 -78 10 -62 Z"/>
        <path class="head" d="M-58 -10 C -70 -12 -70 12 -58 10 Z M58 -10 C 70 -12 70 12 58 10 Z"/>
        <ellipse cx="-22" cy="-44" rx="7" ry="4" style="fill:var(--ink)"/><ellipse cx="22" cy="-44" rx="7" ry="4" style="fill:var(--ink)"/>
      </g>
      <g id="vs-feel"></g>
      <text class="sk-ts" x="300" y="16" text-anchor="middle">ONE CANAL</text>
      <circle class="canal" cx="300" cy="118" r="70"/><circle class="canalf" cx="300" cy="118" r="70"/>
      <g id="vs-p"></g>
      <g transform="translate(300 48)"><g id="vs-cup"><path class="cupula" d="M-4 -13 C -10 -2 -10 10 -3 14 L 3 14 C 10 10 10 -2 4 -13 Z" transform="rotate(90)"/></g>
        <g id="vs-hc"></g></g>
      <text class="sk-ts" x="300" y="122" text-anchor="middle">fluid</text><text class="sk-ts" x="300" y="138" text-anchor="middle">(endolymph)</text>
      <text class="sk-ts" x="300" y="214" text-anchor="middle">cupula + hair cells (top)</text>`, { class: 'vestibular-svg', role: 'img', 'aria-label': 'A head seen from above and one semicircular canal with fluid particles and a cupula with hair cells' });
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '560px', touchAction: 'none' } }, svg);
    const spinB = h('button', { type: 'button', class: 'btn btn-primary sk-bigbtn' }, 'Spin for 5 seconds');
    const stopB = h('button', { type: 'button', class: 'btn sk-bigbtn', disabled: true }, 'Stop suddenly');
    const bi = () => { const w = h('div', { class: 'vestibular-bi' }, h('i')); return w; };
    const mHead = bi(), mFeel = bi(), mDiz = h('div', { class: 'sk-meter' }, h('i'));
    const rHead = h('span', { class: 'readout' }), rFeel = h('span', { class: 'readout' }), rDiz = h('span', { class: 'readout' });
    const card = SK.card('Ready', 'Press <b>Spin</b>, or drag the head in a circle. You can also use the left and right arrow keys on the head.');
    p1.append(stage, h('div', { class: 'sk-row' }, spinB, stopB), h('div', { class: 'vestibular-meters' },
      h('div', { class: 'vestibular-m' }, h('span', null, 'Head really turning'), mHead, rHead),
      h('div', { class: 'vestibular-m' }, h('span', null, 'Brain feels turning'), mFeel, rFeel),
      h('div', { class: 'vestibular-m' }, h('span', null, 'Dizziness'), mDiz, rDiz)), card.el);
    let wh = 0, wf = 0, ang = 0, fluidAng = 0, spinT = 0, dragging = false, lastA = 0, lastT = 0, dragW = 0, phase = 'idle', peakAfter = 0;
    const TAU = 3, SPIN = 400; // deg/s
    spinB.onclick = () => { spinT = 5; phase = 'spinning'; stopB.disabled = false; spinB.disabled = true; api.sfx.blip(); card.set('Starting to spin', 'The canal turns with your head, but the fluid inside <b>lags behind</b> because of inertia. It pushes the cupula and bends the hair cells: your brain feels the turn.'); };
    stopB.onclick = () => { spinT = 0; };
    const head = svg.querySelector('#vs-head');
    head.setAttribute('tabindex', '0'); head.setAttribute('role', 'slider'); head.setAttribute('aria-label', 'Head. Left and right arrow keys turn it.');
    const angAt = e => { const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 420 - 100, y = (e.clientY - r.top) / r.height * 220 - 118; return Math.atan2(y, x) * 180 / Math.PI; };
    svg.addEventListener('pointerdown', e => { const r = svg.getBoundingClientRect(); if ((e.clientX - r.left) / r.width > 0.5) return; dragging = true; svg.setPointerCapture(e.pointerId); lastA = angAt(e); lastT = performance.now(); spinT = 0; });
    svg.addEventListener('pointermove', e => { if (!dragging) return; const a = angAt(e), now = performance.now(); let da = a - lastA; if (da > 180) da -= 360; if (da < -180) da += 360; const dt = Math.max(1, now - lastT) / 1000; dragW = dragW * 0.6 + (da / dt) * 0.4; ang += da; lastA = a; lastT = now; });
    const endDrag = () => { if (dragging) { dragging = false; dragW = 0; } };
    svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
    let keyW = 0;
    head.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); keyW = (e.key === 'ArrowRight' ? 1 : -1) * 300; setTimeout(() => keyW = 0, 250); } });
    const pG = svg.querySelector('#vs-p'), cup = svg.querySelector('#vs-cup'), hcG = svg.querySelector('#vs-hc'), feelG = svg.querySelector('#vs-feel');
    function setBi(m, v, max, col) { const i = m.firstChild, f = Math.max(-1, Math.min(1, v / max)); i.style.left = (f < 0 ? 50 + f * 50 : 50) + '%'; i.style.width = Math.abs(f) * 50 + '%'; i.style.background = col; }
    const lp = SK.loop(dt => {
      if (p1.hidden) return;
      // head angular velocity
      if (spinT > 0) { spinT -= dt; wh += (SPIN - wh) * (1 - Math.exp(-dt * 6)); if (spinT <= 0) { spinT = 0; } }
      else if (dragging) { wh = dragW; dragW *= Math.exp(-dt * 6); }
      else if (keyW) wh = keyW;
      else wh = phase === 'spinning' ? 0 : wh * Math.exp(-dt * 12);
      if (phase === 'spinning' && spinT === 0) { phase = 'stopped'; wh = 0; stopB.disabled = true; spinB.disabled = false; api.sfx.tap(); card.set('Stopped!', 'Your head stopped, but the fluid <b>keeps swirling</b>. It bends the hair cells the other way, so your brain thinks you are spinning in the opposite direction. That “still spinning” feeling is dizziness.', 'spark'); peakAfter = 0; }
      if (!dragging && spinT === 0) ang += wh * dt; else if (!dragging) ang += wh * dt;
      // fluid dynamics
      wf += (wh - wf) * (1 - Math.exp(-dt / TAU));
      fluidAng += (wf - wh) * dt; // fluid relative to canal (head frame)
      const feel = wh - wf; // cupula deflection signal
      const diz = Math.abs(wh) < 30 ? Math.min(1, Math.abs(feel) / 250) : 0;
      if (phase === 'stopped') { peakAfter = Math.max(peakAfter, diz); if (diz < 0.05 && peakAfter > 0.3) { phase = 'idle'; card.set('Settled', 'The fluid slowed down and stopped, the cupula straightened, and the dizziness faded. Spin again, or try dragging the head back and forth.', 'good'); api.addXP(2); } }
      if (phase === 'spinning' && spinT < 2.5 && spinT > 0 && Math.abs(feel) < 140) card.set('Still spinning…', 'Notice: after a few seconds of steady spinning, the fluid <b>catches up</b> with the canal. The cupula straightens and the feeling of turning fades, even though you are still spinning! Now stop suddenly.');
      head.setAttribute('transform', `translate(100 118) rotate(${ang.toFixed(1)})`);
      let s = '';
      for (let i = 0; i < 14; i++) { const a = (i / 14 * 360 + fluidAng) * Math.PI / 180; s += `<circle class="p" cx="${(300 + Math.cos(a) * 70).toFixed(1)}" cy="${(118 + Math.sin(a) * 70).toFixed(1)}" r="4"/>`; }
      pG.innerHTML = s;
      const bend = Math.max(-45, Math.min(45, feel / 400 * 45));
      cup.setAttribute('transform', `rotate(${(-bend).toFixed(1)} 0 14)`);
      let hc = ''; for (let k = -2; k <= 2; k++) hc += `<path class="hc" d="M${k * 4} 14 l ${(-bend / 6).toFixed(1)} -9"/>`;
      hcG.innerHTML = hc;
      // brain-feel arrow around head
      const fa = Math.max(-1, Math.min(1, feel / 300));
      if (Math.abs(fa) > 0.05) { const sweep = fa * 140, r = 82; const a0 = -90 * Math.PI / 180, a1 = (-90 + sweep) * Math.PI / 180; const x0 = 100 + Math.cos(a0) * r, y0 = 118 + Math.sin(a0) * r, x1 = 100 + Math.cos(a1) * r, y1 = 118 + Math.sin(a1) * r; const col = diz > 0.2 ? 'var(--spark)' : 'var(--carolina)';
        const ah = a1 + (fa > 0 ? Math.PI / 2 : -Math.PI / 2);
        feelG.innerHTML = `<path class="arrow" d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 ${fa > 0 ? 1 : 0} ${x1.toFixed(1)} ${y1.toFixed(1)}" style="stroke:${col}"/><path d="M${x1.toFixed(1)} ${y1.toFixed(1)} l ${(Math.cos(ah - 2.6) * 12).toFixed(1)} ${(Math.sin(ah - 2.6) * 12).toFixed(1)} M${x1.toFixed(1)} ${y1.toFixed(1)} l ${(Math.cos(ah + 2.6) * 12).toFixed(1)} ${(Math.sin(ah + 2.6) * 12).toFixed(1)}" style="stroke:${col};stroke-width:4;stroke-linecap:round"/><text class="sk-ts" x="100" y="212" text-anchor="middle" style="fill:${col}">brain feels: turning ${fa > 0 ? 'right' : 'left'}</text>`; }
      else feelG.innerHTML = '';
      setBi(mHead, wh, SPIN, 'var(--carolina)'); rHead.textContent = Math.abs(wh) < 5 ? 'still' : `${Math.round(Math.abs(wh))}°/s ${wh > 0 ? '→' : '←'}`;
      setBi(mFeel, feel, SPIN, diz > 0.2 ? 'var(--spark)' : 'var(--carolina)'); rFeel.textContent = Math.abs(feel) < 8 ? 'nothing' : `${Math.round(Math.abs(feel))}°/s ${feel > 0 ? '→' : '←'}`;
      mDiz.firstChild.style.width = (diz * 100) + '%'; mDiz.firstChild.style.background = 'var(--spark)'; rDiz.textContent = diz > 0.6 ? 'woozy!' : diz > 0.2 ? 'dizzy' : 'none';
    });

    /* ---------- three canals ---------- */
    const p2 = h('div', { class: 'sk-root', hidden: true });
    const c3 = SK.svg('0 0 150 150', `
      <ellipse id="vc-h" cx="75" cy="92" rx="54" ry="20" style="fill:none;stroke-width:9"/>
      <ellipse id="vc-a" cx="58" cy="62" rx="20" ry="48" transform="rotate(-25 58 62)" style="fill:none;stroke-width:9"/>
      <ellipse id="vc-p" cx="96" cy="62" rx="20" ry="48" transform="rotate(25 96 62)" style="fill:none;stroke-width:9"/>
      <circle cx="75" cy="108" r="12" style="fill:var(--sk-fluid);stroke:color-mix(in srgb,#3E8DC4 80%,var(--surface));stroke-width:2"/>`, { class: 'vestibular-svg', role: 'img', 'aria-label': 'Three semicircular canals at right angles to each other' });
    const face = SK.svg('0 0 120 120', `<g id="vc-face"><circle cx="60" cy="60" r="38" class="head"/><circle cx="46" cy="54" r="4" style="fill:var(--ink)"/><circle cx="74" cy="54" r="4" style="fill:var(--ink)"/><path d="M46 76 Q60 84 74 76" style="fill:none;stroke:var(--ink);stroke-width:3;stroke-linecap:round"/></g>`, { class: 'vestibular-svg', 'aria-hidden': 'true' });
    let cSel = 'h', cT = 0;
    const cSeg = SK.seg(CAN.map(c => ({ v: c.id, label: c.n })), 'h', v => { cSel = v; cT = 0; paintC(); api.sfx.tap(); }, 'Head movement');
    const cCard = SK.card('', '');
    p2.append(cSeg.el, h('div', { class: 'vestibular-3' }, h('div', { class: 'sk-stage', style: { maxWidth: '150px' } }, c3), h('div', { class: 'sk-row', style: { alignItems: 'center' } }, h('div', { style: { width: '110px' } }, face), cCard.el)),
      h('p', { class: 'sk-note' }, 'Three fluid-filled loops sit at right angles to each other, one for each direction your head can rotate. Together they tell the brain about any head movement, which helps keep your balance, posture, and eyes steady.'));
    function paintC() {
      ['h', 'a', 'p'].forEach(id => { const e = c3.querySelector('#vc-' + id); e.style.stroke = id === cSel ? 'var(--spark)' : 'color-mix(in srgb, #7FC4E8 70%, var(--surface))'; });
      const C = CAN.find(c => c.id === cSel); cCard.set(C.canal, C.d);
    }
    paintC();
    const lp2 = SK.loop(dt => {
      if (p2.hidden) return; cT += dt; const s = Math.sin(cT * 5) * (api.reduceMotion ? 0.3 : 1), f = c3 && face.querySelector('#vc-face');
      f.setAttribute('transform', cSel === 'h' ? `translate(${(s * 10).toFixed(1)} 0)` : cSel === 'a' ? `translate(0 ${(s * 8).toFixed(1)})` : `rotate(${(s * 22).toFixed(1)} 60 60)`);
    });

    /* ---------- kinesthesis ---------- */
    const p3 = h('div', { class: 'sk-root', hidden: true });
    const tryCard = SK.card('Try it', 'Close your eyes. Hold one arm out to the side, then slowly touch your nose with one finger. Open your eyes when you’re done.');
    const didB = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'I did it!');
    let elbow = 40, shoulder = 20, eyes = true;
    const arm = SK.svg('0 0 420 230', '', { class: 'vestibular-svg', role: 'img', 'aria-label': 'An arm with receptors in the muscles and joints sending position signals to the brain' });
    const shSl = SK.range('Shoulder (raise arm)', -20, 80, 1, shoulder, v => `${v}°`, v => { shoulder = v; wake(); });
    const elSl = SK.range('Elbow (bend)', 0, 140, 1, elbow, v => `${v}°`, v => { elbow = v; wake(); });
    const eyesB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': 'false' }, 'Close the eyes');
    eyesB.onclick = () => { eyes = !eyes; eyesB.setAttribute('aria-pressed', String(!eyes)); eyesB.textContent = eyes ? 'Close the eyes' : 'Open the eyes'; api.sfx.tap(); kCard.set(eyes ? 'Eyes open' : 'Eyes closed: still works!', eyes ? 'Vision helps too, but it is not needed.' : 'Even with no vision at all, the brain’s map still matches the real arm. That is <b>kinesthesis</b>.', eyes ? '' : 'good'); };
    const kCard = SK.card('Move the arm', 'Drag the sliders. Receptors in the <b>muscles</b> (sensing stretch) and <b>joints</b> (sensing angle) fire when the arm moves, and the brain updates its map of where your arm is.');
    didB.onclick = () => { tryCard.set('How did you do that?', 'Your hand found your nose without looking because receptors in your muscles, tendons, and joints constantly report the position and movement of your body parts. This is your <b>kinesthetic sense</b> (kinesthesis).', 'good'); didB.remove(); api.addXP(2); };
    p3.append(tryCard.el, h('div', { class: 'sk-row' }, didB), h('div', { class: 'sk-stage', style: { maxWidth: '560px' } }, arm), shSl.el, elSl.el, h('div', { class: 'sk-row' }, eyesB), kCard.el);
    let act = 0, sigs = [];
    function wake() { act = 1; }
    function armPts(sh, elb, ox, oy, sc) {
      const a1 = -sh * Math.PI / 180, L1 = 90 * sc, L2 = 80 * sc;
      const ex = ox + Math.cos(a1) * L1, ey = oy + Math.sin(a1) * L1;
      const a2 = a1 - elb * Math.PI / 180;
      return { ox, oy, ex, ey, hx: ex + Math.cos(a2) * L2, hy: ey + Math.sin(a2) * L2, a1, a2 };
    }
    const lp3 = SK.loop(dt => {
      if (p3.hidden) return;
      act = Math.max(0.15, act - dt * 0.8);
      const P = armPts(shoulder, elbow, 70, 150, 1);
      let s = `<rect x="20" y="110" width="40" height="110" rx="18" class="head"/><circle cx="40" cy="92" r="22" class="head"/>
        ${eyes ? '<circle cx="48" cy="88" r="3" style="fill:var(--ink)"/>' : '<path d="M44 89 h8" style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round"/>'}
        <line x1="${P.ox}" y1="${P.oy}" x2="${P.ex}" y2="${P.ey}" class="bone" style="stroke-width:14;stroke-linecap:round;stroke:var(--sk-flesh)"/>
        <line x1="${P.ex}" y1="${P.ey}" x2="${P.hx}" y2="${P.hy}" style="stroke-width:12;stroke-linecap:round;stroke:var(--sk-flesh)"/>
        <ellipse class="muscle" cx="${(P.ox + P.ex) / 2}" cy="${(P.oy + P.ey) / 2}" rx="30" ry="8" transform="rotate(${(P.a1 * 180 / Math.PI).toFixed(1)} ${(P.ox + P.ex) / 2} ${(P.oy + P.ey) / 2})"/>
        <circle class="hand" cx="${P.hx}" cy="${P.hy}" r="9" style="fill:var(--sk-flesh);stroke:var(--sk-flesh-d);stroke-width:2"/>`;
      const recs = [[(P.ox + P.ex) / 2, (P.oy + P.ey) / 2, 'muscle'], [P.ex, P.ey, 'joint'], [P.ox, P.oy, 'joint']];
      recs.forEach(([x, y]) => { s += `<circle class="rec" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(5 + act * 3).toFixed(1)}" style="filter:drop-shadow(0 0 ${(act * 8).toFixed(1)}px #F5B700)"/>`; });
      // brain + map
      s += `<g transform="translate(330 60)"><path d="M-48 8 C -50 -26 -18 -42 8 -40 C 36 -38 52 -20 50 6 C 48 28 26 36 2 34 C -16 40 -46 34 -48 8 Z" style="fill:color-mix(in srgb,#F2B6C3 60%,var(--surface));stroke:var(--muted);stroke-width:2"/></g>
        <text class="sk-ts" x="330" y="112" text-anchor="middle">brain’s body map</text>`;
      const Q = armPts(shoulder, elbow, 312, 70, 0.28);
      s += `<path d="M${Q.ox} ${Q.oy} L${Q.ex.toFixed(1)} ${Q.ey.toFixed(1)} L${Q.hx.toFixed(1)} ${Q.hy.toFixed(1)}" style="fill:none;stroke:var(--carolina);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/><circle cx="${Q.hx.toFixed(1)}" cy="${Q.hy.toFixed(1)}" r="3.5" style="fill:var(--carolina)"/>`;
      if (Math.random() < act * dt * 14) recs.forEach(([x, y]) => sigs.push({ x, y, u: 0 }));
      sigs = sigs.filter(g => (g.u += dt * 1.2) < 1);
      sigs.forEach(g => { const tx = 300, ty = 70; const x = g.x + (tx - g.x) * g.u, y = g.y + (ty - g.y) * g.u - Math.sin(g.u * Math.PI) * 30; s += `<circle class="sig" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/>`; });
      s += `<text class="sk-ts" x="210" y="222" text-anchor="middle">gold = receptors in muscles and joints</text>`;
      arm.innerHTML = s;
    });

    root.append(p1, p2, p3);
    el.append(root);
    return () => { lp.stop(); lp2.stop(); lp3.stop(); };
  }
});
})();
