/* 1.6C sound-localization — drag a honking car around a head; timing + intensity differences; guess-the-direction game */
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
SK.css('sound-localization-style', `
.sound-localization-svg .head { fill: var(--sk-flesh); stroke: var(--sk-flesh-d); stroke-width: 2.5; }
.sound-localization-svg .ear { fill: var(--sk-flesh); stroke: var(--sk-flesh-d); stroke-width: 2.5; transition: fill .15s; }
.sound-localization-svg .ear.hit { fill: var(--spark); }
.sound-localization-svg .ring { fill: none; stroke: var(--carolina); stroke-width: 2.5; }
.sound-localization-svg .track { fill: none; stroke: var(--line); stroke-width: 2; stroke-dasharray: 4 6; }
.sound-localization-svg .car { cursor: grab; }
.sound-localization-svg .car:focus { outline: none; }
.sound-localization-svg .car:focus-visible .carbody { stroke: var(--ink); stroke-width: 3; }
.sound-localization-svg .pad { fill: var(--surface-2); stroke: var(--carolina); stroke-width: 2.5; cursor: pointer; }
.sound-localization-svg .pad:hover, .sound-localization-svg .pad:focus-visible { fill: var(--carolina-soft); outline: none; stroke-width: 4; }
.sound-localization-svg .pad.right { fill: var(--good-soft); stroke: var(--good); }
.sound-localization-svg .pad.wrong { fill: var(--bad-soft); stroke: var(--bad); }
.sound-localization-meters { display: grid; gap: 8px; }
.sound-localization-svg .sk-ts { font-size: 14px; }
.sound-localization-m { display: grid; grid-template-columns: 74px 1fr 92px; gap: 8px; align-items: center; font-size: 14px; font-weight: 700; }
.sound-localization-m .readout { text-align: right; font-size: 13px; }
.sound-localization-tl { position: relative; height: 56px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface-2); }
.sound-localization-tl i { position: absolute; top: 8px; bottom: 8px; width: 4px; border-radius: 2px; transition: left .15s; }
.sound-localization-tl span { position: absolute; font-size: 12px; font-weight: 700; font-family: var(--f-mono); top: 4px; transform: translateX(-50%); white-space: nowrap; }
`);

const R_HEAD = 0.0875, C = 343;
function cues(theta) { // theta: radians, 0 = front, + = right
  const s = Math.sin(theta);
  const lat = Math.asin(Math.max(-1, Math.min(1, s))); // fold front/back
  const itd = R_HEAD / C * (lat + Math.sin(lat)) * 1000; // ms, + means right ear first
  const ild = 9 * s; // dB, + means right louder (approximate, mid-high frequencies)
  return { itd, ild };
}
const POS = [{ a: -90, n: 'left' }, { a: -45, n: 'front-left' }, { a: 0, n: 'straight ahead' }, { a: 45, n: 'front-right' }, { a: 90, n: 'right' }];

ML.registerWidget('sound-localization', {
  title: 'Where is that honk?', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'drag', label: 'Move the car' }, { v: 'game', label: 'Guess the direction' }], 'drag', v => { setMode(v); }, 'Activity');
    root.append(SK.instr('Drag the honking car around the head (top view, nose pointing up). Watch which ear gets the sound <b>first</b> and <b>louder</b>.'), tabs.el);
    const CX = 200, CY = 160, RR = 118;
    const svg = SK.svg('0 0 400 310', `
      <circle class="track" cx="${CX}" cy="${CY}" r="${RR}"/>
      <text class="sk-ts" x="${CX}" y="20" text-anchor="middle">FRONT</text><text class="sk-ts" x="${CX}" y="304" text-anchor="middle">BEHIND</text>
      <text class="sk-ts" x="4" y="${CY + 4}">LEFT</text><text class="sk-ts" x="396" y="${CY + 4}" text-anchor="end">RIGHT</text>
      <g id="sl-rings"></g>
      <path class="head" d="M${CX} ${CY - 50} C ${CX + 8} ${CY - 50} ${CX + 10} ${CY - 58} ${CX} ${CY - 62} C ${CX - 10} ${CY - 58} ${CX - 8} ${CY - 50} ${CX} ${CY - 50}"/>
      <ellipse class="head" cx="${CX}" cy="${CY}" rx="44" ry="50"/>
      <path class="ear" id="sl-earL" d="M${CX - 43} ${CY - 12} C ${CX - 58} ${CY - 14} ${CX - 58} ${CY + 12} ${CX - 43} ${CY + 10} Z"/>
      <path class="ear" id="sl-earR" d="M${CX + 43} ${CY - 12} C ${CX + 58} ${CY - 14} ${CX + 58} ${CY + 12} ${CX + 43} ${CY + 10} Z"/>
      <text class="sk-ts" x="${CX - 66}" y="${CY + 30}" text-anchor="middle">L ear</text><text class="sk-ts" x="${CX + 66}" y="${CY + 30}" text-anchor="middle">R ear</text>
      <path d="M${CX - 14} ${CY - 20} q 4 -4 8 0 M${CX + 6} ${CY - 20} q 4 -4 8 0" style="fill:none;stroke:var(--sk-flesh-d);stroke-width:2"/>
      <g id="sl-pads"></g>
      <g class="car" id="sl-car" tabindex="0" role="slider" aria-label="Honking car position. Use arrow keys to move it around the head." aria-valuemin="-180" aria-valuemax="180">
        <rect class="carbody" x="-20" y="-11" width="40" height="22" rx="7" style="fill:var(--spark);stroke:color-mix(in srgb,var(--spark) 60%,#000);stroke-width:2"/>
        <rect x="-10" y="-8" width="16" height="16" rx="3" style="fill:color-mix(in srgb,#CFE8FF 80%,var(--surface))"/>
        <circle cx="-13" cy="-12" r="4" style="fill:var(--ink)"/><circle cx="13" cy="-12" r="4" style="fill:var(--ink)"/><circle cx="-13" cy="12" r="4" style="fill:var(--ink)"/><circle cx="13" cy="12" r="4" style="fill:var(--ink)"/>
      </g>`, { class: 'sound-localization-svg', role: 'group', 'aria-label': 'Top view of a head with a car that can be moved around it' });
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '440px', touchAction: 'none' } }, svg);
    const car = svg.querySelector('#sl-car'), earL = svg.querySelector('#sl-earL'), earR = svg.querySelector('#sl-earR'), ringsG = svg.querySelector('#sl-rings'), padsG = svg.querySelector('#sl-pads');
    const mL = h('div', { class: 'sk-meter' }, h('i')), mR = h('div', { class: 'sk-meter' }, h('i'));
    const rL = h('span', { class: 'readout' }), rR = h('span', { class: 'readout' });
    const tl = h('div', { class: 'sound-localization-tl', 'aria-hidden': 'true' });
    const tlTxt = h('div', { class: 'readout', style: { fontSize: '14px' } });
    const meters = h('div', { class: 'sound-localization-meters' },
      h('div', { class: 'sk-kicker' }, 'Loudness at each ear'),
      h('div', { class: 'sound-localization-m' }, h('span', null, 'Left ear'), mL, rL), h('div', { class: 'sound-localization-m' }, h('span', null, 'Right ear'), mR, rR),
      h('div', { class: 'sk-kicker' }, 'Arrival time (zoomed way in)'), tl, tlTxt);
    const info = SK.card('', '');

    let theta = Math.PI / 2 * 0.7, mode = 'drag', t = 0;
    function place() {
      const x = CX + Math.sin(theta) * RR, y = CY - Math.cos(theta) * RR;
      car.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(theta * 180 / Math.PI).toFixed(1)})`);
      car.setAttribute('aria-valuenow', Math.round(theta * 180 / Math.PI));
      car.setAttribute('aria-valuetext', describe(theta));
    }
    function describe(th) { const d = ((th * 180 / Math.PI) + 540) % 360 - 180; const a = Math.abs(d); const side = d > 0 ? 'right' : 'left'; return a < 12 ? 'straight ahead' : a > 168 ? 'directly behind' : a < 70 ? `front-${side}` : a < 110 ? side : `behind, to the ${side}`; }
    function showCues(th, hideWhere) {
      const { itd, ild } = cues(th);
      const base = 0.72;
      const lL = Math.max(0.05, Math.min(1, base - ild / 30)), lR = Math.max(0.05, Math.min(1, base + ild / 30));
      mL.firstChild.style.width = (lL * 100) + '%'; mR.firstChild.style.width = (lR * 100) + '%';
      mL.firstChild.style.background = ild < -0.5 ? 'var(--spark)' : 'var(--carolina)'; mR.firstChild.style.background = ild > 0.5 ? 'var(--spark)' : 'var(--carolina)';
      rL.textContent = ild < -0.5 ? `+${Math.abs(ild).toFixed(1)} dB` : ild > 0.5 ? 'softer' : 'same';
      rR.textContent = ild > 0.5 ? `+${ild.toFixed(1)} dB` : ild < -0.5 ? 'softer' : 'same';
      const xl = 22 + (itd > 0 ? itd / 0.7 * 70 : 0), xr = 22 + (itd < 0 ? -itd / 0.7 * 70 : 0);
      const first = Math.abs(itd) < 0.02 ? 'Both ears at the same instant' : `${itd > 0 ? 'Right' : 'Left'} ear first, by ${Math.abs(itd).toFixed(2)} ms`;
      tl.innerHTML = `<span style="left:10px;top:8px;transform:none;color:var(--muted)">L</span><span style="left:10px;top:31px;transform:none;color:var(--muted)">R</span>
        <i style="left:calc(${xl}% - 2px);top:6px;bottom:auto;height:20px;background:var(--carolina)"></i>
        <i style="left:calc(${xr}% - 2px);top:29px;bottom:auto;height:20px;background:var(--spark)"></i>
`;
      tlTxt.textContent = first;
      if (hideWhere) return;
      const a = Math.abs(Math.sin(th));
      if (a < 0.17) info.set(describe(th) === 'straight ahead' ? 'Straight ahead: tricky!' : 'Directly behind: tricky!', 'Both ears get the sound at the <b>same time</b> and the <b>same loudness</b>, so these cues can’t tell front from behind. That is why sounds right in front of or behind you are hard to locate. Turning your head breaks the tie.', 'spark');
      else { const near = itd > 0 ? 'right' : 'left'; info.set(`The ${near} ear wins`, `The sound reaches your <b>${near}</b> ear about <b>${Math.abs(itd).toFixed(2)} ms sooner</b> and roughly <b>${Math.abs(ild).toFixed(0)} dB louder</b> (your head blocks some sound from the far ear). Your brain uses both differences to locate the honk: <b>sound localization</b>.`); }
    }
    // drag
    let dragging = false;
    const toAngle = e => { const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 400 - CX, y = (e.clientY - r.top) / r.height * 310 - CY; return Math.atan2(x, -y); };
    svg.addEventListener('pointerdown', e => { if (mode !== 'drag') return; if (e.target.closest('#sl-pads')) return; dragging = true; svg.setPointerCapture(e.pointerId); theta = toAngle(e); place(); showCues(theta); honkSoft(); });
    svg.addEventListener('pointermove', e => { if (!dragging) return; theta = toAngle(e); place(); showCues(theta); });
    const endDrag = () => { dragging = false; };
    svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
    car.addEventListener('keydown', e => { if (mode !== 'drag') return; if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(e.key)) { e.preventDefault(); theta += (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : -1) * Math.PI / 12; place(); showCues(theta); } });

    // ring animation
    const rings = [];
    let spawn = 0;
    const lp = SK.loop(dt => {
      if (mode !== 'drag') { ringsG.innerHTML = ''; return; }
      t += dt; spawn -= dt;
      if (spawn <= 0 && !api.reduceMotion) { spawn = 0.9; rings.push({ r: 0, x: CX + Math.sin(theta) * RR, y: CY - Math.cos(theta) * RR }); }
      let s = '';
      const earsP = [[CX - 50, CY, earL], [CX + 50, CY, earR]];
      for (let i = rings.length - 1; i >= 0; i--) {
        const g = rings[i], prev = g.r; g.r += dt * 90;
        earsP.forEach(([ex, ey, elx]) => { const d = Math.hypot(ex - g.x, ey - g.y); if (prev < d && g.r >= d) { elx.classList.add('hit'); setTimeout(() => elx.classList.remove('hit'), 160); } });
        if (g.r > 260) { rings.splice(i, 1); continue; }
        s += `<circle class="ring" cx="${g.x.toFixed(1)}" cy="${g.y.toFixed(1)}" r="${g.r.toFixed(1)}" style="opacity:${(1 - g.r / 260).toFixed(2)}"/>`;
      }
      ringsG.innerHTML = s;
    });

    /* audio */
    let ac = null; const live = new Set();
    function honk(th, vol = 0.045) {
      if (!SK.soundOn()) return false;
      ac = SK.audio(); if (!ac) return false;
      const { itd, ild } = cues(th);
      const t0 = ac.currentTime + 0.03, dur = 0.55;
      const merger = ac.createChannelMerger(2), master = ac.createGain(); master.gain.value = vol;
      const lpF = ac.createBiquadFilter(); lpF.type = 'lowpass'; lpF.frequency.value = 2400;
      const env = ac.createGain(); env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(1, t0 + 0.02); env.gain.setValueAtTime(1, t0 + dur - 0.08); env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      const oscs = [392, 494].map(fr => { const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = fr; o.connect(lpF); o.start(t0); o.stop(t0 + dur + 0.05); return o; });
      lpF.connect(env);
      [[0, itd < 0 ? 0 : itd / 1000, -ild], [1, itd > 0 ? 0 : -itd / 1000, ild]].forEach(([ch, delay, db]) => {
        const d = ac.createDelay(0.01); d.delayTime.value = delay;
        const g = ac.createGain(); g.gain.value = Math.pow(10, Math.min(0, db) / 20);
        env.connect(d).connect(g).connect(merger, 0, ch);
      });
      merger.connect(master).connect(ac.destination);
      const rec = { oscs, master }; live.add(rec); oscs[0].onended = () => { live.delete(rec); try { master.disconnect(); } catch (e) { } };
      return true;
    }
    let lastSoft = 0;
    function honkSoft() { if (!SK.soundOn() || mode !== 'drag') return; const now = performance.now(); if (now - lastSoft < 900) return; lastSoft = now; honk(theta, 0.03); }
    const honkB = h('button', { type: 'button', class: 'btn btn-sm' }, 'Honk (use headphones)');
    honkB.onclick = () => { if (!honk(theta)) api.toast('Sound is off. Turn it on with the speaker button at the top.'); };
    const dragBox = h('div', { class: 'sk-root' }, h('div', { class: 'sk-row' }, honkB), meters, info.el);

    /* game */
    const gameBox = h('div', { class: 'sk-root', hidden: true });
    let gmode = SK.soundOn() ? 'listen' : 'cues';
    const gSeg = SK.seg([{ v: 'listen', label: 'Listen (headphones)' }, { v: 'cues', label: 'Read the cues (no sound)' }], gmode, v => { gmode = v; newGame(); }, 'Game type');
    const gCard = SK.card('', '');
    const gBtn = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Play the honk');
    const gScore = h('span', { class: 'readout', style: { color: 'var(--carolina)' } });
    let rounds = [], gi = 0, gRight = 0, waiting = false;
    gameBox.append(gSeg.el, h('div', { class: 'sk-row' }, gBtn, gScore), gCard.el);
    function drawPads() {
      padsG.innerHTML = POS.map((p, i) => { const a = p.a * Math.PI / 180, x = CX + Math.sin(a) * RR, y = CY - Math.cos(a) * RR; return `<circle class="pad" data-i="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" tabindex="0" role="button" aria-label="Guess: ${p.n}"/>`; }).join('');
      padsG.querySelectorAll('.pad').forEach(pd => { pd.addEventListener('click', () => guess(+pd.dataset.i, pd)); pd.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); guess(+pd.dataset.i, pd); } }); });
    }
    function newGame() { rounds = Array.from({ length: 5 }, () => Math.floor(Math.random() * POS.length)); gi = 0; gRight = 0; nextRound(); }
    function nextRound() {
      padsG.querySelectorAll('.pad').forEach(p => p.classList.remove('right', 'wrong'));
      gScore.textContent = `Round ${Math.min(gi + 1, 5)}/5 · ${gRight} right`;
      if (gi >= 5) { waiting = false; gScore.textContent = `Final: ${gRight}/5`; gCard.set(gRight >= 4 ? 'Great localizing!' : 'Good effort', `You found ${gRight} of 5. Your brain does this all day using tiny timing and loudness differences between your ears. ${gmode === 'listen' ? 'Notice we only used positions in front of you: with headphones, behind sounds just like in front!' : ''}`, 'good'); gBtn.textContent = 'Play again'; if (gRight >= 4) api.sfx.level(); return; }
      waiting = true; gBtn.textContent = gmode === 'listen' ? 'Play the honk' : 'Show the cues';
      const th = POS[rounds[gi]].a * Math.PI / 180;
      if (gmode === 'listen') { meters.hidden = true; gCard.set('Put on headphones', 'Press <b>Play the honk</b> (as many times as you like), then tap the circle where you think the car is. Left earbud in the left ear!'); }
      else { meters.hidden = false; showCues(th, true); gCard.set('Read the cues', 'Look at the loudness meters and arrival times above. Which ear wins, and by how much? Tap the circle where the car must be.'); }
    }
    gBtn.onclick = () => {
      if (gi >= 5) { newGame(); return; }
      if (gmode === 'listen') { if (!honk(POS[rounds[gi]].a * Math.PI / 180, 0.05)) { api.toast('Sound is off, so try “Read the cues” instead.'); } }
      else { meters.hidden = false; showCues(POS[rounds[gi]].a * Math.PI / 180, true); }
    };
    function guess(i, pd) {
      if (!waiting || mode !== 'game') return;
      const ans = rounds[gi];
      waiting = false;
      if (i === ans) { gRight++; pd.classList.add('right'); api.sfx.good(); api.addXP(2); gCard.set('Got it!', `The car was ${POS[ans].n}.`, 'good'); }
      else { pd.classList.add('wrong'); padsG.querySelector(`[data-i="${ans}"]`).classList.add('right'); api.sfx.bad(); gCard.set('Not quite', `The car was ${POS[ans].n} (green). ${Math.abs(POS[ans].a) === 0 ? 'Same time, same loudness in both ears means straight ahead (or behind).' : 'The ear closer to the car hears it first and louder.'}`, 'bad'); }
      gi++; setTimeout(nextRound, 1500);
    }
    const timersOff = () => {};
    function setMode(m) {
      mode = m;
      dragBox.hidden = m !== 'drag'; gameBox.hidden = m !== 'game';
      car.style.display = m === 'drag' ? '' : 'none';
      padsG.innerHTML = '';
      if (m === 'game') { dragBox.after(gameBox); root.insertBefore(meters, gCard.el.parentNode === gameBox ? gameBox : null); gameBox.insertBefore(meters, gCard.el); drawPads(); newGame(); }
      else { dragBox.insertBefore(meters, info.el); meters.hidden = false; place(); showCues(theta); }
    }
    root.append(stage, dragBox, gameBox);
    el.append(root);
    place(); showCues(theta);
    return () => { lp.stop(); live.forEach(r => { try { r.oscs.forEach(o => o.stop()); r.master.disconnect(); } catch (e) { } }); live.clear(); timersOff(); };
  }
});
})();
