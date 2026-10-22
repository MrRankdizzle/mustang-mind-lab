/* 1.6B rods-cones — retina density map + microscope, "lights down" slider, blind spot test */
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
SK.css('rods-cones-style', `
.rods-cones-map { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr) 170px; align-items: center; }
@media (max-width: 560px) { .rods-cones-map { grid-template-columns: 1fr; justify-items: center; } }
.rods-cones-scope { width: 170px; height: 170px; border-radius: 50%; border: 6px solid var(--ink); background: color-mix(in srgb, #3B1F2B 85%, var(--surface)); overflow: hidden; position: relative; box-shadow: var(--shadow); }
.rods-cones-scope canvas { width: 100%; height: 100%; display: block; }
.rods-cones-svg .sk-ts { font-size: 14px; }
.rods-cones-svg .cone { fill: none; stroke: var(--spark); stroke-width: 3; }
.rods-cones-svg .rod { fill: none; stroke: var(--sk-vio); stroke-width: 3; }
.rods-cones-svg .ax { stroke: var(--line); stroke-width: 1.5; }
.rods-cones-svg .bs { fill: var(--surface-2); stroke: var(--line); stroke-dasharray: 3 3; }
.rods-cones-svg .cur { stroke: var(--ink); stroke-width: 2; }
.rods-cones-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 14px; font-weight: 700; }
.rods-cones-legend i { display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: -2px; margin-right: 5px; }
.rods-cones-scene { border-radius: 14px; overflow: hidden; border: 1px solid var(--line); position: relative; background: #000; }
.rods-cones-scene svg { display: block; width: 100%; height: auto; }
.rods-cones-status { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rods-cones-status div { border: 1px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 8px 12px; font-size: 14px; }
.rods-cones-status b { display: block; font-size: 15px; }
.rods-cones-bs { background: #fff; border-radius: 14px; border: 1px solid var(--line); position: relative; height: 150px; overflow: hidden; }
.rods-cones-bs .mark { position: absolute; top: 50%; transform: translate(-50%, -50%); color: #111; font: 700 40px/1 var(--f-body); }
.rods-cones-bs .dot { position: absolute; top: 50%; width: 30px; height: 30px; border-radius: 50%; background: #E5484D; transform: translate(-50%, -50%); }
.rods-cones-bs .line { position: absolute; top: 50%; height: 8px; background: #111; transform: translateY(-50%); }
.rods-cones-steps { margin: 0; padding-left: 22px; display: grid; gap: 4px; font-size: 15px; }
`);

const cone = e => 0.04 + 0.96 * Math.exp(-Math.abs(e) / 2.2);
const rod = e => Math.abs(e) < 0.6 ? 0 : (1 - Math.exp(-Math.abs(e) / 8)) * Math.exp(-Math.max(0, Math.abs(e) - 20) / 60);
const inBS = e => e >= 13 && e <= 18.5;

ML.registerWidget('rods-cones', {
  title: 'Rods and cones', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'map', label: 'Retina map' }, { v: 'dark', label: 'Lights down' }, { v: 'bs', label: 'Blind spot test' }], 'map', v => { pMap.hidden = v !== 'map'; pDark.hidden = v !== 'dark'; pBS.hidden = v !== 'bs'; if (v === 'map') drawScope(); }, 'Activity');
    root.append(SK.instr('Slide the microscope across the retina to see where rods and cones live. Then turn the lights down and find your own blind spot.'), tabs.el);

    /* ---------- Retina map ---------- */
    const pMap = h('div', { class: 'sk-root' });
    const graph = h('div', { class: 'sk-stage', style: { maxWidth: '520px', margin: 0 } });
    const cv = h('canvas', { width: 340, height: 340, 'aria-hidden': 'true' });
    const scope = h('div', { class: 'rods-cones-scope', role: 'img', 'aria-label': 'Microscope view of photoreceptors' }, cv);
    let ecc = 0;
    const sl = SK.range('Microscope position', -60, 60, 0.5, 0, v => v === 0 ? 'fovea (center)' : `${Math.abs(v)}° ${v < 0 ? 'toward ear' : 'toward nose'}`, v => { ecc = v; drawGraph(); drawScope(); });
    const mcard = SK.card('', '');
    const legend = h('div', { class: 'rods-cones-legend' }, h('span', null, h('i', { style: { background: 'var(--spark)' } }), 'Cones (color, detail)'), h('span', null, h('i', { style: { background: 'var(--sk-vio)' } }), 'Rods (dim light, gray)'));
    const jumps = h('div', { class: 'sk-chips' });
    [['Fovea', 0], ['Blind spot', 15.5], ['Periphery', -45]].forEach(([n, v]) => { const b = h('button', { type: 'button' }, n); b.onclick = () => { sl.set(v, true); api.sfx.tap(); }; jumps.append(b); });
    pMap.append(h('div', { class: 'rods-cones-map' }, graph, scope), legend, sl.el, jumps, mcard.el,
      h('p', { class: 'sk-note' }, 'Memory trick: Cones see Color and help with aCuity (sharpness). Rods take over in dim light and your side vision.'));
    function drawGraph() {
      const X = e => 36 + (e + 60) / 120 * 360, Y = v => 150 - v * 118;
      let c = '', r = '';
      for (let e = -60; e <= 60; e += 0.5) { const bs = inBS(e); c += (c ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(bs ? 0 : cone(e)).toFixed(1); r += (r ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(bs ? 0 : rod(e) * 0.9).toFixed(1); }
      let s = `<rect class="bs" x="${X(13)}" y="26" width="${X(18.5) - X(13)}" height="124"/><text class="sk-ts" x="${X(15.7)}" y="20" text-anchor="middle">blind spot</text>
        <line class="ax" x1="36" x2="396" y1="150" y2="150"/>
        <path class="rod" d="${r}"/><path class="cone" d="${c}"/>
        <text class="sk-ts" x="${X(0)}" y="168" text-anchor="middle">fovea</text><text class="sk-ts" x="36" y="168">← ear side</text><text class="sk-ts" x="396" y="168" text-anchor="end">nose side →</text>
        <text class="sk-ts" x="6" y="32" style="font-size:11px">dense</text>
        <line class="cur" x1="${X(ecc)}" x2="${X(ecc)}" y1="24" y2="152"/><circle cx="${X(ecc)}" cy="152" r="6" style="fill:var(--ink)"/>`;
      graph.innerHTML = '';
      graph.append(SK.svg('0 0 400 176', s, { class: 'rods-cones-svg', role: 'img', 'aria-label': 'Graph of receptor density: cones peak sharply at the fovea; rods are absent at the fovea and most dense about 20 degrees out; neither exists at the blind spot.' }));
      const cn = inBS(ecc) ? 0 : cone(ecc), rn = inBS(ecc) ? 0 : rod(ecc);
      if (inBS(ecc)) mcard.set('Optic disc: the blind spot', 'No rods, no cones. This is where ganglion cell axons leave the eye as the optic nerve, so light landing here is never detected.', 'spark');
      else if (Math.abs(ecc) < 1.5) mcard.set('Fovea: all cones', 'Cones are packed tightly and there are <b>no rods</b>. This gives your sharpest, most colorful vision, but in very dim light the fovea is the first place to go blind.');
      else if (Math.abs(ecc) < 8) mcard.set('Near the fovea', 'Cones thin out fast and rods start appearing between them.');
      else mcard.set('Periphery: mostly rods', `Rods outnumber cones here (about ${Math.round(rn / Math.max(cn, 0.01))} to 1 on this chart's scale). Great for dim light and spotting motion, poor for color and detail.`);
    }
    // stable random mosaic
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const g = cv.getContext('2d');
    function drawScope() {
      seed = 11;
      const W = 340, bs = inBS(ecc);
      g.fillStyle = '#2A1620'; g.fillRect(0, 0, W, W);
      if (bs) {
        g.fillStyle = '#F1D27A'; g.beginPath(); g.arc(W / 2 + (ecc - 15.7) * 40, W / 2, 150, 0, 7); g.fill();
        g.strokeStyle = '#C79A2E'; g.lineWidth = 4; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(W / 2 + (ecc - 15.7) * 40, W / 2); g.lineTo(W / 2 + Math.cos(k * .7) * 300, W / 2 + Math.sin(k * .7) * 300); g.stroke(); }
        g.fillStyle = '#5a3a10'; g.font = '700 26px ' + ML.fonts.body; g.textAlign = 'center'; g.fillText('no receptors', W / 2, W / 2 + 8);
        return;
      }
      const cn = cone(ecc), rn = rod(ecc);
      const cs = Math.min(70, 17 / Math.sqrt(cn)), cr = Math.min(10, 7 + (1 - cn) * 3) * (cn > 0.5 ? 1 : 1);
      const cones = [];
      for (let y = -cs; y < W + cs; y += cs * 0.87) for (let x = -cs, k = 0; x < W + cs; x += cs, k++) {
        const px = x + ((Math.round(y / (cs * 0.87)) % 2) ? cs / 2 : 0) + (rnd() - .5) * cs * 0.25, py = y + (rnd() - .5) * cs * 0.25;
        const q = rnd(); cones.push([px, py, q < 0.6 ? '#E5484D' : q < 0.93 ? '#3DBB62' : '#4A7FE8']);
      }
      if (rn > 0.03) {
        const rs = 9 / Math.sqrt(rn);
        g.fillStyle = '#9E86E8';
        for (let y = 0; y < W + rs; y += rs * 0.87) for (let x = 0; x < W + rs; x += rs) {
          const px = x + ((Math.round(y / (rs * 0.87)) % 2) ? rs / 2 : 0) + (rnd() - .5) * 2, py = y + (rnd() - .5) * 2;
          if (cones.some(c => Math.hypot(c[0] - px, c[1] - py) < cr + 4)) continue;
          g.beginPath(); g.arc(px, py, 3.4, 0, 7); g.fill();
        }
      }
      cones.forEach(([x, y, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.min(cr, cs * 0.46), 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - 2, y - 2, Math.min(cr, cs * 0.46) * 0.35, 0, 7); g.fill(); });
    }

    /* ---------- Lights down ---------- */
    const pDark = h('div', { class: 'sk-root', hidden: true });
    const sceneSVG = SK.svg('0 0 400 230', `
      <defs>
        <filter id="rc-vision" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix id="rc-mat" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/><feGaussianBlur id="rc-blur" stdDeviation="0"/></filter>
        <radialGradient id="rc-fov"><stop offset="0" stop-color="#000" stop-opacity="1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4EA5E8"/><stop offset="1" stop-color="#BFE3FA"/></linearGradient>
      </defs>
      <g filter="url(#rc-vision)">
        <rect width="400" height="230" fill="url(#rc-sky)"/>
        <circle cx="340" cy="44" r="22" fill="#FFD43B"/>
        <path d="M0 150 Q100 120 200 150 T400 140 V230 H0Z" fill="#4CAF50"/>
        <rect x="60" y="88" width="110" height="80" fill="#F2E3C6"/><path d="M50 92 L115 46 L180 92 Z" fill="#C0392B"/><rect x="102" y="120" width="26" height="48" fill="#2457C5"/>
        <rect x="236" y="96" width="120" height="44" rx="6" fill="#FFFFFF" stroke="#333" stroke-width="2"/><text x="296" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="19" fill="#1B4F9C">MUSTANGS</text>
        <rect x="292" y="140" width="8" height="30" fill="#7B5A3A"/>
        ${[30, 185, 215, 380, 250, 150].map((x, i) => `<g transform="translate(${x} ${185 + (i % 3) * 12})"><rect x="-1.5" y="0" width="3" height="20" fill="#2E7D32"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 6}" cy="${Math.sin(a * Math.PI / 180) * 6}" r="5" fill="${i % 2 ? '#E53935' : '#FFC107'}"/>`).join('')}<circle r="3.5" fill="#5D4037"/></g>`).join('')}
      </g>
      <rect id="rc-dark" width="400" height="230" fill="#000" opacity="0"/>
      <circle id="rc-fovea" cx="200" cy="118" r="34" fill="url(#rc-fov)" opacity="0"/>
      <g id="rc-stars" opacity="0">${[[40, 30], [90, 60], [150, 22], [230, 40], [300, 70], [372, 26], [260, 15]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('')}</g>
      <path d="M194 118 H206 M200 112 V124" stroke="#FF6B81" stroke-width="2"/>`, { role: 'img', 'aria-label': 'A sunny scene with a house, red and yellow flowers, and a MUSTANGS sign' });
    const scene = h('div', { class: 'rods-cones-scene' }, sceneSVG);
    const stC = h('div'), stR = h('div');
    const dcard = SK.card('', '');
    const lightSl = SK.range('Light level', 0, 100, 1, 100, v => v > 70 ? 'Daylight' : v > 40 ? 'Dusk' : v > 15 ? 'Moonlight' : 'Starlight', setLight);
    pDark.append(lightSl.el, scene, h('div', { class: 'rods-cones-status' }, stC, stR), dcard.el);
    const mat = sceneSVG.querySelector('#rc-mat'), blurF = sceneSVG.querySelector('#rc-blur');
    function setLight(L) {
      const k = Math.max(0, Math.min(1, (60 - L) / 50)); // 0 = cones fully on, 1 = rods only
      const sc = [0.04, 0.58, 0.38];
      const row = (i) => [0, 1, 2].map(j => ((i === j ? 1 : 0) * (1 - k) + sc[j] * k * (i === 2 ? 1.12 : i === 1 ? 1.02 : 0.9)).toFixed(3)).join(' ') + ' 0 0';
      mat.setAttribute('values', `${row(0)} ${row(1)} ${row(2)} 0 0 0 1 0`);
      blurF.setAttribute('stdDeviation', (k * 1.3).toFixed(2));
      sceneSVG.querySelector('#rc-dark').setAttribute('opacity', (0.78 * Math.pow(1 - L / 100, 1.4)).toFixed(3));
      sceneSVG.querySelector('#rc-fovea').setAttribute('opacity', (Math.max(0, (25 - L) / 25) * 0.85).toFixed(2));
      sceneSVG.querySelector('#rc-stars').setAttribute('opacity', (Math.max(0, (30 - L) / 30)).toFixed(2));
      const coneState = L > 60 ? ['Working', 'Full color and sharp detail'] : L > 10 ? ['Fading', 'Not enough light: colors wash out'] : ['Off', 'Too dark for cones'];
      const rodState = L > 60 ? ['Maxed out', 'Bright light overwhelms them'] : ['Working', 'Seeing in shades of gray'];
      stC.innerHTML = `<b style="color:var(--spark)">Cones: ${coneState[0]}</b>${coneState[1]}`;
      stR.innerHTML = `<b style="color:var(--sk-vio)">Rods: ${rodState[0]}</b>${rodState[1]}`;
      if (L > 60) dcard.set('Daylight: cones in charge', 'Keep your eyes on the pink + and drag the slider down toward starlight.');
      else if (L > 25) dcard.set('Dusk: color fades', 'Cones need lots of light. As they drop out, colors fade (reds go dark first) and the rods take over in shades of gray. The sign gets harder to read: rods are bad at fine detail.');
      else dcard.set('Starlight: rods only', 'Color is gone and details blur. Notice the dark patch right where you are looking: the fovea has only cones, so it goes blind first. Astronomers look slightly to the <b>side</b> of a faint star so its light lands on rods.', 'good');
    }
    setLight(100);

    /* ---------- Blind spot ---------- */
    const pBS = h('div', { class: 'sk-root', hidden: true });
    let eye = 'right', variant = 'dot';
    const eyeSeg = SK.seg([{ v: 'right', label: 'Test right eye' }, { v: 'left', label: 'Test left eye' }], 'right', v => { eye = v; drawBS(); }, 'Eye');
    const varSeg = SK.seg([{ v: 'dot', label: 'Vanishing dot' }, { v: 'line', label: 'Fill-in line' }], 'dot', v => { variant = v; drawBS(); }, 'Version');
    const board = h('div', { class: 'rods-cones-bs', role: 'img' });
    const steps = h('ol', { class: 'rods-cones-steps' });
    const bcard = SK.card(null, '');
    bcard.el.hidden = true;
    const yes = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'It vanished!');
    const no = h('button', { type: 'button', class: 'btn btn-sm' }, 'I can’t find it');
    yes.onclick = () => { api.sfx.good(); api.addXP(2); const r = board.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 40, 40); bcard.el.hidden = false;
      bcard.set('You found your blind spot!', variant === 'dot' ? 'The dot’s image landed on the <b>optic disc</b>, where the optic nerve leaves the eye. There are no rods or cones there, so nothing was detected. You never notice this hole because your brain fills it in using the surroundings (and your other eye covers it).' : 'The gap landed on your blind spot, and your brain <b>filled in</b> the line so it looked unbroken. Your brain guesses what should be there instead of showing you a hole: top-down processing at work!', 'good'); };
    no.onclick = () => { bcard.el.hidden = false; bcard.set('Tips', 'Make the screen wide (landscape on a phone). Keep the covered eye fully closed and stare only at the X, never at the target. Start about 20 cm (8 in) away and move <b>very slowly</b> forward and back. The target disappears in a narrow band of distances.'); };
    pBS.append(eyeSeg.el, varSeg.el, steps, board, h('div', { class: 'sk-row' }, yes, no), bcard.el);
    function drawBS() {
      board.innerHTML = '';
      const xX = eye === 'right' ? 12 : 88, tX = eye === 'right' ? 82 : 18;
      board.append(h('div', { class: 'mark', style: { left: xX + '%' } }, '✕'));
      if (variant === 'dot') board.append(h('div', { class: 'dot', style: { left: tX + '%' } }));
      else {
        const a0 = eye === 'right' ? 26 : 2, b1 = eye === 'right' ? 98 : 74;
        board.append(h('div', { class: 'line', style: { left: a0 + '%', width: `calc(${tX - a0}% - 16px)` } }));
        board.append(h('div', { class: 'line', style: { left: `calc(${tX}% + 16px)`, width: `calc(${b1 - tX}% - 16px)` } }));
      }
      board.setAttribute('aria-label', `Blind spot test: an X on the ${eye === 'right' ? 'left' : 'right'} and a ${variant === 'dot' ? 'red dot' : 'line with a gap'} on the ${eye === 'right' ? 'right' : 'left'}.`);
      const close = eye === 'right' ? 'LEFT' : 'RIGHT';
      steps.innerHTML = '';
      [`Cover or close your <b>${close}</b> eye.`, 'With your open eye, stare at the <b>✕</b>. Don’t look away from it.',
        'Start close to the screen and slowly lean back (or forward).', variant === 'dot' ? 'At the right distance the red dot vanishes!' : 'At the right distance the gap disappears and the line looks solid!'].forEach(t => { const li = h('li'); li.innerHTML = t; steps.append(li); });
      bcard.el.hidden = true;
    }
    drawBS();

    root.append(pMap, pDark, pBS);
    el.append(root);
    drawGraph(); drawScope();
    return () => {};
  }
});
})();
