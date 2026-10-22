/* 1.6B color-lab — trichromatic cone mixer + color deficiency simulator + opponent-process afterimage */
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
SK.css('color-lab-style', `
.color-lab-mix { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) 190px; align-items: center; }
@media (max-width: 560px) { .color-lab-mix { grid-template-columns: 1fr; } }
.color-lab-sliders { display: grid; gap: 10px; }
.color-lab-cone { display: grid; grid-template-columns: 44px 1fr; gap: 10px; align-items: center; }
.color-lab-cone svg { width: 44px; height: 44px; }
.color-lab-cone.off { opacity: .45; }
.color-lab-cone input[type=range] { accent-color: var(--c); }
.color-lab-sw { display: grid; gap: 8px; justify-items: center; }
.color-lab-swatch { width: 100%; max-width: 190px; aspect-ratio: 1.3; border-radius: 16px; border: 2px solid var(--line); box-shadow: inset 0 0 0 4px rgba(255,255,255,.12); transition: background .12s; }
.color-lab-swatch.small { aspect-ratio: 2.4; }
.color-lab-swl { font-size: 13px; font-weight: 700; color: var(--muted); text-align: center; }
.color-lab-target { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.color-lab-target i { width: 44px; height: 44px; border-radius: 12px; border: 2px solid var(--line); display: inline-block; }
.color-lab-plate { width: min(100%, 300px); aspect-ratio: 1; margin: 0 auto; display: block; border-radius: 50%; }
.color-lab-flagbox { position: relative; max-width: 560px; width: 100%; margin: 0 auto; border-radius: 12px; overflow: hidden; background: #fff; border: 1px solid var(--line); }
.color-lab-flagbox svg { display: block; width: 100%; height: auto; }
.color-lab-cd { position: absolute; right: 10px; top: 8px; font: 700 14px var(--f-mono); color: #444; background: rgba(255,255,255,.75); border-radius: 8px; padding: 2px 8px; }
.color-lab-cd:empty { display: none; }
.color-lab-real { max-width: 220px; width: 100%; border-radius: 8px; border: 1px solid var(--line); display: block; }
.color-lab-pairs { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); }
.color-lab-pair { border: 1px solid var(--line); border-radius: 12px; padding: 8px 10px; display: grid; gap: 6px; background: var(--surface-2); font-size: 14px; font-weight: 700; }
.color-lab-pair .bar { display: grid; grid-template-columns: 1fr 1fr; border-radius: 8px; overflow: hidden; height: 22px; border: 1px solid var(--line); }
.color-lab-pair .bar span { display: grid; place-items: center; font-size: 11px; }
.color-lab-pair .tired { outline: 3px dashed var(--ink); outline-offset: -3px; opacity: .55; }
.color-lab-pair .wins { box-shadow: inset 0 0 0 3px var(--ink); }
.color-lab-stages { display: grid; gap: 6px; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; font-size: 14px; }
.color-lab-stages div { border: 1px solid var(--line); border-radius: 12px; padding: 8px; background: var(--surface-2); text-align: center; }
.color-lab-stages b { display: block; font-size: 14px; color: var(--carolina); }
.color-lab-stages i { font-style: normal; color: var(--muted); }
@media (max-width: 520px) { .color-lab-stages { grid-template-columns: 1fr; } .color-lab-stages i { transform: rotate(90deg); justify-self: center; } }
`);

const VIEN = {
  protan: [[0.11238, 0.88762, 0], [0.11238, 0.88762, 0], [0.00401, -0.00401, 1]],
  deutan: [[0.29275, 0.70725, 0], [0.29275, 0.70725, 0], [-0.02234, 0.02234, 1]]
};
const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const toSRGB = v => { v = Math.max(0, Math.min(1, v)); return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); };
const LUT = new Float32Array(256).map((_, i) => toLin(i));
function sim(rgb, mode) {
  if (mode === 'typical') return rgb;
  const l = rgb.map(c => LUT[c]);
  if (mode === 'mono') { const y = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; const v = toSRGB(y); return [v, v, v]; }
  const M = VIEN[mode];
  return M.map(r => toSRGB(r[0] * l[0] + r[1] * l[1] + r[2] * l[2]));
}
const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const MODES = [{ v: 'typical', label: 'Typical (3 cones)' }, { v: 'protan', label: 'No red (L) cones' }, { v: 'deutan', label: 'No green (M) cones' }, { v: 'mono', label: 'Monochromat' }];
const MODE_TXT = {
  typical: 'Trichromat: all three cone types work, so the brain can compare all three signals.',
  protan: '<b>Dichromat</b> (protan): missing the long-wave “red” cones. Reds and greens collapse into similar yellowish browns, and reds look darker.',
  deutan: '<b>Dichromat</b> (deutan): missing the medium-wave “green” cones. This red-green deficiency is the most common. Reds and greens look alike.',
  mono: '<b>Monochromat</b>: only one working receptor type (or rods only), so the world is shades of gray. This is very rare.'
};

ML.registerWidget('color-lab', {
  title: 'Color vision lab', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const timers = new Set();
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'mix', label: 'Cone mixer' }, { v: 'test', label: 'Color vision test' }, { v: 'after', label: 'Afterimage' }], 'mix', v => { pMix.hidden = v !== 'mix'; pTest.hidden = v !== 'test'; pAfter.hidden = v !== 'after'; if (v === 'test') drawPlate(); if (v !== 'after') resetAfter(); }, 'Activity');
    root.append(SK.instr('Mix colors using only three kinds of cones, see how color deficiencies change the world, then make your own eyes see a flag that isn’t there.'), tabs.el);
    let vmode = 'typical';
    const modeSegs = [];
    function makeModeSeg() { const s = SK.seg(MODES, vmode, v => { vmode = v; modeSegs.forEach(x => x.set(v)); paintMix(); drawPlate(); paintModeTxt(); }, 'Vision type'); modeSegs.push(s); return s.el; }
    const modeTxts = [];
    function modeTxt() { const p = h('p', { class: 'sk-note' }); modeTxts.push(p); return p; }
    function paintModeTxt() { modeTxts.forEach(p => p.innerHTML = MODE_TXT[vmode]); }

    /* ---------- cone mixer ---------- */
    const pMix = h('div', { class: 'sk-root' });
    const vals = [255, 200, 0];
    const CONES = [{ n: 'Red (L) cones', c: '#E5484D', k: 'protan' }, { n: 'Green (M) cones', c: '#2FA35A', k: 'deutan' }, { n: 'Blue (S) cones', c: '#3B76E0', k: 'tritan' }];
    const coneRows = CONES.map((C, i) => {
      const icon = SK.svg('0 0 44 44', `<path d="M8 22 C8 12 20 8 30 12 L40 18 L40 26 L30 32 C20 36 8 32 8 22 Z" style="fill:${C.c}"/><circle class="glow" cx="18" cy="22" r="5" style="fill:#fff;opacity:.6"/>`, { 'aria-hidden': 'true' });
      const r = SK.range(C.n, 0, 255, 1, vals[i], v => `${Math.round(v / 2.55)}%`, v => { vals[i] = v; paintMix(); });
      const row = h('div', { class: 'color-lab-cone', style: { '--c': C.c } }, icon, r.el);
      row.style.setProperty('--c', C.c);
      return { row, r, icon };
    });
    const swT = h('div', { class: 'color-lab-swatch' }), swS = h('div', { class: 'color-lab-swatch small' });
    const swSLabel = h('div', { class: 'color-lab-swl' });
    const swBox = h('div', { class: 'color-lab-sw' }, h('div', { class: 'color-lab-swl' }, 'Your brain sees'), swT, swSLabel, swS);
    const mixCard = SK.card('', '');
    const TARGETS = [{ n: 'yellow', c: [255, 220, 0], hint: 'Yellow has no yellow cone! Turn on red and green cones, blue off.' }, { n: 'purple', c: [150, 30, 220], hint: 'Mostly blue plus some red, no green.' }, { n: 'orange', c: [255, 130, 0], hint: 'Lots of red, about half green, no blue.' }, { n: 'white', c: [255, 255, 255], hint: 'All three cones firing strongly.' }, { n: 'cyan', c: [0, 220, 230], hint: 'Green plus blue, no red.' }];
    let ti = 0, matched = new Set();
    const tSw = h('i'), tName = h('b'), tHint = h('button', { type: 'button', class: 'btn btn-sm btn-ghost' }, 'Hint'), tNext = h('button', { type: 'button', class: 'btn btn-sm' }, 'Next color →');
    const tStatus = h('span', { class: 'readout', style: { color: 'var(--muted)' } });
    tHint.onclick = () => { mixCard.set('Hint', TARGETS[ti].hint); };
    tNext.onclick = () => { ti = (ti + 1) % TARGETS.length; paintTarget(); paintMix(); };
    function paintTarget() { tSw.style.background = css(TARGETS[ti].c); tName.textContent = `Challenge: make ${TARGETS[ti].n}`; }
    pMix.append(h('div', { class: 'color-lab-target' }, tSw, h('div', null, tName, h('br'), tStatus), tHint, tNext),
      h('div', { class: 'color-lab-mix' }, h('div', { class: 'color-lab-sliders' }, coneRows.map(c => c.row)), swBox), mixCard.el,
      h('div', { class: 'sk-kicker' }, 'Whose eyes?'), makeModeSeg(), modeTxt());
    function paintMix() {
      const c = vals.map(Math.round), s = sim(c, vmode);
      swT.style.background = css(c);
      swS.hidden = swSLabel.hidden = vmode === 'typical';
      swS.style.background = css(s); swSLabel.textContent = 'A ' + (vmode === 'mono' ? 'monochromat' : 'dichromat') + ' sees the same light as';
      coneRows.forEach((r, i) => { r.icon.querySelector('.glow').style.opacity = (0.15 + vals[i] / 255 * 0.85).toFixed(2); r.row.classList.toggle('off', (vmode === 'protan' && i === 0) || (vmode === 'deutan' && i === 1) || vmode === 'mono'); });
      const T = TARGETS[ti].c, d = Math.hypot(c[0] - T[0], c[1] - T[1], c[2] - T[2]);
      tStatus.textContent = d < 45 ? 'Matched!' : d < 110 ? 'Getting close…' : 'Adjust the cone sliders';
      tStatus.style.color = d < 45 ? 'var(--good)' : 'var(--muted)';
      if (d < 45 && !matched.has(ti)) {
        matched.add(ti); api.sfx.good(); api.addXP(2);
        mixCard.set(`You made ${TARGETS[ti].n}!`, ti === 0 ? 'There is no “yellow cone.” When red (L) and green (M) cones fire together, your brain reports yellow. That is the <b>trichromatic (Young-Helmholtz) theory</b>: three cone types combine to make every color.' : `Three cone types, mixed in different amounts, can produce ${TARGETS[ti].n} and every other color you see. Try the next one!`, 'good');
      } else if (d >= 45 && mixCard.el.classList.contains('good') && matched.has(ti) === false) mixCard.set('', '');
    }
    mixCard.set('Three cones, millions of colors', 'Each slider is how strongly one cone type is firing. Your brain combines the three signals into one color. Match the challenge color above.');
    paintTarget(); paintMix(); paintModeTxt();

    /* ---------- color vision test (dot plate) ---------- */
    const pTest = h('div', { class: 'sk-root', hidden: true });
    const plate = h('canvas', { class: 'color-lab-plate', width: 560, height: 560, role: 'img', 'aria-label': 'Color dot plate with a hidden number made of orange-red dots among green dots' });
    const qCard = SK.card('What number do you see?', null);
    const ansRow = h('div', { class: 'sk-row' });
    ['74', '21', 'No number'].forEach(a => { const b = h('button', { type: 'button', class: 'btn btn-sm' }, a); b.onclick = () => answer(a); ansRow.append(b); });
    function answer(a) {
      if (a === '74') { api.sfx.good(); qCard.set('Yes: 74', 'People with typical color vision see 74 because the orange-red dots stand out from the green ones by <b>hue</b>. Now switch the vision type below and watch the number vanish. (This is a simulation, not a medical test.)', 'good'); }
      else qCard.set('Interesting!', 'Most people see <b>74</b>. If it was hard for you, you might have a red-green color deficiency. Only an eye doctor can tell for sure. Switch the vision type below to see the plate through other eyes.');
    }
    pTest.append(plate, qCard.el, ansRow, h('div', { class: 'sk-kicker' }, 'See it through other eyes'), makeModeSeg(), modeTxt(),
      h('div', { class: 'sk-card' }, h('h4', null, 'Why mostly boys?'), h('p', null, 'The genes for the red and green cone pigments are on the X chromosome. Males have one X, so one faulty copy causes a deficiency. Females have two X’s, so a working copy on the other X usually covers for it. That makes red-green deficiency far more common in males.')));
    paintModeTxt();
    let plateBase = null; const plateCache = {};
    function buildPlate() {
      const N = 560, g = plate.getContext('2d');
      const m = document.createElement('canvas'); m.width = m.height = N; const mg = m.getContext('2d');
      mg.fillStyle = '#000'; mg.font = '900 270px Arial, Helvetica, sans-serif'; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText('74', N / 2, N / 2 + 8);
      const mask = mg.getImageData(0, 0, N, N).data;
      let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const FIG = [[226, 110, 52], [212, 92, 58], [236, 134, 70], [204, 104, 44], [230, 120, 80]];
      const GND = [[152, 172, 74], [124, 160, 72], [166, 178, 92], [138, 166, 80], [176, 180, 96], [118, 150, 66]];
      g.fillStyle = '#F4EFE4'; g.fillRect(0, 0, N, N);
      const dots = [], cell = 24, grid = new Map();
      const key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
      for (let k = 0; k < 40000 && dots.length < 4000; k++) {
        const r = 4 + rnd() * rnd() * 11, a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (N / 2 - 10 - r), x = N / 2 + Math.cos(a) * rr, y = N / 2 + Math.sin(a) * rr;
        let ok = true; const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
        for (let i = -1; i <= 1 && ok; i++) for (let j = -1; j <= 1 && ok; j++) { const L = grid.get(`${cx + i},${cy + j}`); if (L) for (const d of L) if (Math.hypot(d[0] - x, d[1] - y) < d[2] + r + 2) { ok = false; break; } }
        if (!ok) continue;
        const d = [x, y, r]; dots.push(d); const kk = key(x, y); (grid.get(kk) || grid.set(kk, []).get(kk)).push(d);
      }
      dots.forEach(([x, y, r]) => {
        const inFig = mask[(Math.round(y) * N + Math.round(x)) * 4 + 3] > 128;
        const base = (inFig ? FIG : GND)[Math.floor(rnd() * (inFig ? FIG.length : GND.length))];
        const j = 0.86 + rnd() * 0.28;
        g.fillStyle = css(base.map(c => Math.min(255, Math.round(c * j)))); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      });
      plateBase = g.getImageData(0, 0, N, N);
    }
    function drawPlate() {
      if (pTest.hidden) return;
      if (!plateBase) buildPlate();
      const g = plate.getContext('2d');
      if (!plateCache[vmode]) {
        const out = new ImageData(new Uint8ClampedArray(plateBase.data), plateBase.width, plateBase.height);
        if (vmode !== 'typical') { const d = out.data; const memo = new Map(); for (let i = 0; i < d.length; i += 4) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; let r = memo.get(k); if (!r) { r = sim([d[i], d[i + 1], d[i + 2]], vmode); memo.set(k, r); } d[i] = r[0]; d[i + 1] = r[1]; d[i + 2] = r[2]; } }
        plateCache[vmode] = out;
      }
      g.putImageData(plateCache[vmode], 0, 0);
    }

    /* ---------- afterimage ---------- */
    const pAfter = h('div', { class: 'sk-root', hidden: true });
    const W = 380, H = 200;
    const star = (x, y, r) => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return p + 'Z'; };
    let flag = '';
    for (let i = 0; i < 13; i++) flag += `<rect x="0" y="${(i * H / 13).toFixed(2)}" width="${W}" height="${(H / 13 + 0.4).toFixed(2)}" fill="${i % 2 ? '#000' : '#16A34A'}"/>`;
    const cw = W * 0.4, ch = H * 7 / 13;
    flag += `<rect x="0" y="0" width="${cw}" height="${ch}" fill="#FFD60A"/>`;
    let stars = '';
    for (let r = 0; r < 9; r++) { const n = r % 2 ? 5 : 6; for (let c = 0; c < n; c++) { const x = cw / 12 * (r % 2 ? 2 * c + 2 : 2 * c + 1), y = ch / 10 * (r + 1); stars += star(x, y, 5.2); } }
    flag += `<path d="${stars}" fill="#000"/>`;
    const fsvg = SK.svg(`0 0 ${W} ${H}`, `<g id="cl-flag">${flag}</g><rect id="cl-blank" width="${W}" height="${H}" fill="#fff" opacity="0"/><circle cx="${W / 2}" cy="${H / 2}" r="4.5" fill="#fff" stroke="#000" stroke-width="2"/>`, { role: 'img', 'aria-label': 'The American flag in opposite colors: green and black stripes, a yellow box with black stars, and a dot in the center' });
    const cd = h('div', { class: 'color-lab-cd', 'aria-live': 'polite' });
    const flagBox = h('div', { class: 'color-lab-flagbox' }, fsvg, cd);
    const goB = h('button', { type: 'button', class: 'btn btn-primary sk-bigbtn' }, 'Start 20-second stare');
    const aCard = SK.card('How to do it', 'Press start and stare at the <b>dot in the center</b> of this strange flag for 20 seconds. Don’t look away. When the flag disappears, keep staring at the same spot on the white screen.');
    const result = h('div', { class: 'sk-root', hidden: true });
    let stareT = 0, phase = 'idle';
    function resetAfter() { clearInterval(stareT); phase = 'idle'; fsvg.querySelector('#cl-blank').setAttribute('opacity', '0'); cd.textContent = ''; goB.disabled = false; }
    goB.onclick = () => {
      resetAfter(); phase = 'stare'; goB.disabled = true; result.hidden = true; let n = 20; cd.textContent = n;
      aCard.set('Stare at the center dot…', 'Keep your eyes locked on the dot. Try not to blink. The more still your eyes, the stronger the effect.');
      stareT = setInterval(() => {
        n--; cd.textContent = n > 0 ? n : '';
        if (n <= 0) {
          clearInterval(stareT); phase = 'after'; fsvg.querySelector('#cl-blank').setAttribute('opacity', '1'); api.sfx.blip();
          aCard.set('Keep staring at the dot!', 'What colors do you see on the white screen?');
          let m = 0; stareT = setInterval(() => { m++; if (m >= 6) { clearInterval(stareT); showResult(); } }, 1000);
        }
      }, 1000);
    };
    function showResult() {
      goB.disabled = false; goB.textContent = 'Stare again'; result.hidden = false; api.addXP(2);
      fsvg.querySelector('#cl-blank').setAttribute('opacity', '0');
      aCard.set('Red, white, and blue!', 'You saw a flag that was never on the screen: a <b>negative afterimage</b> in the opposite colors. Green became red, black became white, and yellow became blue.', 'good');
    }
    const pair = (a, b, ca, cb) => h('div', { class: 'color-lab-pair' }, `${a} vs. ${b}`, h('div', { class: 'bar' }, h('span', { class: 'wins', style: { background: ca, color: ca === '#FFFFFF' || ca === '#FFD60A' ? '#000' : '#fff' } }, 'wins!'), h('span', { class: 'tired', style: { background: cb, color: cb === '#000' ? '#fff' : '#000' } }, 'stared at')));
    let real = '';
    for (let i = 0; i < 13; i++) real += `<rect x="0" y="${(i * H / 13).toFixed(2)}" width="${W}" height="${(H / 13 + 0.4).toFixed(2)}" fill="${i % 2 ? '#fff' : '#B22234'}"/>`;
    real += `<rect x="0" y="0" width="${cw}" height="${ch}" fill="#3C3B6E"/><path d="${stars}" fill="#fff"/>`;
    const realSvg = SK.svg(`0 0 ${W} ${H}`, real, { class: 'color-lab-real', role: 'img', 'aria-label': 'The real American flag in red, white, and blue' });
    result.append(
      h('div', { class: 'sk-row' }, realSvg, h('p', { class: 'sk-note', style: { flex: '1 1 160px' } }, 'Your afterimage should have looked something like this, only fainter and fuzzier.')),
      h('div', { class: 'sk-kicker' }, 'Opponent-process theory'),
      h('p', null, 'After the cones, color is coded by cells that work in opposing pairs. A cell excited by green is inhibited by red, and vice versa. Staring at green tires out the green side, so when you look at white, the red side wins.'),
      h('div', { class: 'color-lab-pairs' }, pair('Red', 'Green', '#E5484D', '#16A34A'), pair('Blue', 'Yellow', '#2563EB', '#FFD60A'), pair('White', 'Black', '#FFFFFF', '#000')),
      h('p', { class: 'sk-note' }, 'Faded = the color you stared at (tired cells). Outlined = its opposite, which wins in the afterimage.'),
      h('div', { class: 'sk-kicker' }, 'Both theories are right, at different stages'),
      h('div', { class: 'color-lab-stages' },
        h('div', null, h('b', null, 'Retina: cones'), 'Red, green, and blue cones respond to light', h('br'), h('small', null, 'Trichromatic theory')), h('i', null, '→'),
        h('div', null, h('b', null, 'Opponent cells'), 'Ganglion cells and the thalamus code red–green, blue–yellow, black–white', h('br'), h('small', null, 'Opponent-process theory')), h('i', null, '→'),
        h('div', null, h('b', null, 'Visual cortex'), 'Occipital lobe builds the color you experience')));
    pAfter.append(flagBox, h('div', { class: 'sk-row' }, goB), aCard.el, result);

    root.append(pMix, pTest, pAfter);
    el.append(root);
    return () => { clearInterval(stareT); timers.forEach(clearTimeout); };
  }
});
})();
