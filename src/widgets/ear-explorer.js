/* 1.6C ear-explorer — ear cross-section: explore, quiz, follow the sound with energy changes */
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
SK.css('ear-explorer-style', `
.ear-explorer-svg .skin { fill: var(--sk-flesh); stroke: var(--sk-flesh-d); stroke-width: 2; }
.ear-explorer-svg .bone { fill: var(--sk-bone); }
.ear-explorer-svg .air { fill: color-mix(in srgb, #EAF5FF 70%, var(--surface)); stroke: var(--sk-flesh-d); stroke-width: 1.5; }
.ear-explorer-svg .drum { fill: color-mix(in srgb, #F6C7B9 85%, var(--surface)); stroke: var(--spark); stroke-width: 2.5; }
.ear-explorer-svg .oss { fill: var(--sk-white); stroke: var(--sk-bone-d); stroke-width: 2.2; stroke-linejoin: round; }
.ear-explorer-svg .fl { fill: none; stroke: var(--sk-fluid); stroke-linecap: round; }
.ear-explorer-svg .flo { fill: none; stroke: color-mix(in srgb, #3E8DC4 80%, var(--surface)); stroke-linecap: round; }
.ear-explorer-svg .flf { fill: var(--sk-fluid); stroke: color-mix(in srgb, #3E8DC4 80%, var(--surface)); stroke-width: 2; }
.ear-explorer-svg .nerve { fill: none; stroke: var(--sk-nerve); stroke-linecap: round; }
.ear-explorer-svg .tube { fill: none; stroke: color-mix(in srgb, #E9B2A6 85%, var(--surface)); stroke-linecap: round; }
.ear-explorer-svg .tubeo { fill: none; stroke: var(--sk-flesh-d); stroke-linecap: round; }
.ear-explorer-svg .wave { fill: none; stroke: var(--carolina); stroke-width: 3; stroke-linecap: round; }
.ear-explorer-svg .sig { fill: var(--spark); filter: drop-shadow(0 0 4px var(--spark)); }
.ear-explorer-svg .sk-t { font-size: 15px; }
.ear-explorer-svg .sk-ts { font-size: 13px; }
.ear-explorer-energy { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.ear-explorer-energy span { border-radius: 10px; padding: 6px 4px; text-align: center; font-size: 12.5px; font-weight: 700; background: var(--surface-2); border: 1.5px solid var(--line); color: var(--muted); line-height: 1.2; transition: all .25s; }
.ear-explorer-energy span.on { background: var(--spark-soft); border-color: var(--spark); color: var(--spark); transform: translateY(-2px); }
.ear-explorer-energy span.done { border-color: var(--carolina); color: var(--carolina); }
.ear-explorer-steps { display: flex; gap: 5px; }
.ear-explorer-steps span { flex: 1; height: 6px; border-radius: 9px; background: var(--line); }
.ear-explorer-steps span.on { background: var(--spark); } .ear-explorer-steps span.done { background: var(--carolina); }
`);

const PARTS = [
  { id: 'pinna', name: 'Pinna', info: 'The visible outer ear. Its folds collect sound waves and funnel them into the ear canal (and help you tell whether a sound is in front of you or behind you).' },
  { id: 'canal', name: 'Ear canal', info: 'The auditory canal: a tube that channels sound waves from the pinna to the eardrum, boosting some frequencies along the way.' },
  { id: 'drum', name: 'Eardrum', info: 'The tympanic membrane: a thin, tight membrane that vibrates when sound waves hit it. Here air pressure waves become mechanical vibration.' },
  { id: 'hammer', name: 'Hammer', info: 'The malleus, first of the three ossicles (the smallest bones in your body). It is attached to the eardrum and passes its vibrations to the anvil.' },
  { id: 'anvil', name: 'Anvil', info: 'The incus, the middle ossicle. It links the hammer to the stirrup. Together the ossicles act as a lever that amplifies the vibrations.' },
  { id: 'stirrup', name: 'Stirrup', info: 'The stapes, the last ossicle. Its footplate pushes in and out on the oval window of the cochlea, starting waves in the cochlear fluid.' },
  { id: 'tube', name: 'Eustachian tube', info: 'Connects the middle ear to the throat and equalizes air pressure on both sides of the eardrum. That is the “pop” you feel on an airplane.' },
  { id: 'cochlea', name: 'Cochlea', info: 'A snail-shaped, fluid-filled tube in the inner ear. Fluid waves ripple the <b>basilar membrane</b>, bending the <b>hair cells</b> on it. The hair cells transduce that motion into neural impulses.' },
  { id: 'canals', name: 'Semicircular canals', info: 'Three fluid-filled loops in the inner ear. They are for balance (the vestibular sense), not hearing: they detect head rotation.' },
  { id: 'nerve', name: 'Auditory nerve', info: 'Carries neural impulses from the cochlea’s hair cells to the brain: through the thalamus to the auditory cortex in the temporal lobe.' }
];
const STEPS = [
  { e: 0, hl: 'pinna', t: 'Sound waves arrive', d: 'Sound is waves of compressed and expanded air. The <b>pinna</b> funnels them into the <b>ear canal</b>.' },
  { e: 1, hl: 'drum', t: 'The eardrum vibrates', d: 'Air pressure waves push the <b>eardrum</b> back and forth. Sound energy is now <b>mechanical vibration</b>.' },
  { e: 1, hl: 'ossicles', t: 'Ossicles amplify', d: 'The <b>hammer → anvil → stirrup</b> pass the vibration along like a lever, making it stronger.' },
  { e: 2, hl: 'cochlea', t: 'Fluid waves', d: 'The stirrup pushes on the <b>oval window</b>, sending <b>fluid waves</b> through the <b>cochlea</b>. The waves ripple the basilar membrane (zoom view below).' },
  { e: 3, hl: 'cochlea', t: 'Hair cells bend: transduction', d: 'Rippling bends the <b>hair cells</b> on the basilar membrane. Bending opens ion channels and triggers <b>neural impulses</b>. That is transduction!' },
  { e: 3, hl: 'nerve', t: 'To the brain', d: 'The <b>auditory nerve</b> carries the impulses through the thalamus to the auditory cortex in the <b>temporal lobe</b>. Now you hear it.' }
];
const ENERGY = ['Air pressure waves', 'Mechanical vibration', 'Fluid waves', 'Neural impulses'];

function spiral(cx, cy, r0, r1, turns, a0) {
  let d = ''; const n = 120;
  for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1); }
  return d;
}
const COCH = spiral(338, 178, 40, 7, 2.3, Math.PI * 1.02);
function earMarkup() {
  return `
  <path class="bone" d="M96 0 H480 V300 H96 Z"/>
  <path class="skin" d="M96 0 V300" style="fill:none;stroke-width:3"/>
  <g class="sk-part" data-part="tube"><path class="tubeo sk-glow" d="M246 188 C 256 230 272 262 300 296" style="stroke-width:19"/><path class="tube" d="M246 188 C 256 230 272 262 300 296" style="stroke-width:14"/></g>
  <g class="sk-part" data-part="pinna"><path class="skin sk-glow" d="M96 58 C 40 26 6 104 34 186 C 46 220 78 240 98 230 L98 196 C 78 202 62 182 58 160 C 52 124 60 84 96 92 Z"/>
    <path d="M86 70 C 56 64 34 104 44 160" style="fill:none;stroke:var(--sk-flesh-d);stroke-width:2;opacity:.6"/></g>
  <g class="sk-part" data-part="canal"><path class="air sk-glow" d="M60 126 C 120 118 170 124 205 126 L205 158 C 170 158 120 164 60 160 C 52 150 52 136 60 126 Z"/></g>
  <path class="air" d="M211 104 Q 214 90 232 90 L 270 90 Q 284 92 284 108 L 284 178 Q 282 192 268 192 L 228 192 Q 212 190 211 176 Z"/>
  <g class="sk-part" data-part="canals">
    <ellipse class="flo sk-glow" cx="288" cy="78" rx="18" ry="30" style="stroke-width:10"/><ellipse class="fl" cx="288" cy="78" rx="18" ry="30" style="stroke-width:6"/>
    <ellipse class="flo sk-glow" cx="326" cy="88" rx="30" ry="12" style="stroke-width:10"/><ellipse class="fl" cx="326" cy="88" rx="30" ry="12" style="stroke-width:6"/>
    <ellipse class="flo sk-glow" cx="314" cy="64" rx="14" ry="28" transform="rotate(48 314 64)" style="stroke-width:10"/><ellipse class="fl" cx="314" cy="64" rx="14" ry="28" transform="rotate(48 314 64)" style="stroke-width:6"/></g>
  <circle class="flf" cx="298" cy="132" r="15"/>
  <g class="sk-part" data-part="nerve"><path class="nerve sk-glow" d="M340 176 C 380 168 420 150 480 146" style="stroke-width:16"/><path class="nerve" d="M318 104 C 350 120 370 150 392 160" style="stroke-width:8"/></g>
  <g class="sk-part" data-part="cochlea"><path class="flo sk-glow" d="${COCH}" style="stroke-width:17"/><path class="fl" d="${COCH}" style="stroke-width:12"/><path d="${COCH}" style="fill:none;stroke:var(--sk-nerve);stroke-width:1.6;opacity:.9"/></g>
  <g id="ee-oss">
  <g class="sk-part" data-part="drum"><ellipse class="drum sk-glow" id="ee-drum" cx="208" cy="142" rx="4" ry="23" transform="rotate(-8 208 142)"/></g>
  <g class="sk-part" data-part="hammer"><path class="oss sk-glow" id="ee-ham" d="M209 146 L214 146 L227 112 C 234 108 236 98 228 94 C 220 92 214 98 218 108 Z"/></g>
  <g class="sk-part" data-part="anvil"><path class="oss sk-glow" id="ee-anv" d="M232 98 C 240 92 252 94 254 104 L250 110 L 251 132 L 245 134 L 244 116 L 234 112 Z"/></g>
  <g class="sk-part" data-part="stirrup"><path class="oss sk-glow" id="ee-sti" d="M248 133 L258 133 M258 133 C 266 122 278 122 282 124 L282 144 C 278 146 266 146 258 135 Z" style="stroke-width:2.6"/><rect x="281" y="121" width="4" height="26" rx="1.5" style="fill:var(--sk-white);stroke:var(--sk-bone-d);stroke-width:1.5"/></g>
  </g>
  <g id="ee-waves"></g>`;
}
function labels() {
  const L = (id, tx, ty, anchor, lx, ly, x, y, txt) => `<g class="sk-lbl" data-part="${id}"><path class="sk-lead" d="M${lx} ${ly} L${x} ${y}"/><text class="sk-t" x="${tx}" y="${ty}" text-anchor="${anchor}">${txt || PARTS.find(p => p.id === id).name}</text></g>`;
  return L('pinna', 12, 22, 'start', 34, 28, 50, 64) + L('canal', 118, 226, 'middle', 118, 212, 128, 152) + L('drum', 176, 76, 'end', 172, 78, 205, 124) +
    L('hammer', 196, 22, 'middle', 198, 28, 222, 98) + L('anvil', 252, 22, 'middle', 250, 28, 244, 100) + L('stirrup', 262, 228, 'middle', 264, 214, 268, 140) +
    L('tube', 230, 288, 'end', 232, 282, 266, 256) + L('cochlea', 398, 252, 'start', 396, 246, 366, 206) + L('canals', 476, 22, 'end', 392, 28, 344, 76) +
    L('nerve', 476, 126, 'end', 446, 132, 438, 150);
}
function hits() {
  return `<path class="sk-hit" data-part="pinna" d="M96 58 C 40 26 6 104 34 186 C 46 220 78 240 98 230 L98 196 C 78 202 62 182 58 160 C 52 124 60 84 96 92 Z"/>
  <path class="sk-hit" data-part="canal" d="M62 124 H200 V160 H62 Z"/>
  <path class="sk-hit" data-part="tube" d="M246 196 C 256 230 272 262 300 296" style="stroke-width:24;fill:none"/>
  <ellipse class="sk-hit" data-part="canals" cx="308" cy="74" rx="44" ry="36"/>
  <path class="sk-hit" data-part="nerve" d="M384 160 C 420 150 440 148 480 146" style="stroke-width:28;fill:none"/>
  <circle class="sk-hit" data-part="cochlea" cx="338" cy="178" r="48"/>
  <rect class="sk-hit" data-part="drum" x="200" y="116" width="12" height="52"/>
  <rect class="sk-hit" data-part="hammer" x="212" y="90" width="18" height="40"/>
  <rect class="sk-hit" data-part="anvil" x="232" y="90" width="22" height="38"/>
  <rect class="sk-hit" data-part="stirrup" x="250" y="130" width="38" height="20"/>`;
}

ML.registerWidget('ear-explorer', {
  title: 'Inside the ear', tag: 'Anatomy',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    const modeSeg = SK.seg([{ v: 'explore', label: 'Explore' }, { v: 'quiz', label: 'Quiz me' }, { v: 'follow', label: 'Follow the sound' }], 'explore', setMode, 'Mode');
    root.append(SK.instr('Tap any part of the ear to learn what it does. Then quiz yourself, or follow a sound all the way to your brain.'), modeSeg.el);
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '600px' } });
    const svg = SK.svg('0 0 480 300', earMarkup(), { class: 'ear-explorer-svg', role: 'group', 'aria-label': 'Cross-section of the outer, middle, and inner ear' });
    const gL = document.createElementNS('http://www.w3.org/2000/svg', 'g'); gL.innerHTML = labels();
    const gH = document.createElementNS('http://www.w3.org/2000/svg', 'g'); gH.innerHTML = hits();
    svg.append(gL, gH);
    stage.append(svg);
    const inset = h('div', { class: 'sk-stage', style: { maxWidth: '560px' }, hidden: true });
    const ex = SK.explorer(api, svg, PARTS, { rootEl: root, onSelect: id => { inset.hidden = id !== 'cochlea'; if (id === 'cochlea') drawInset(false); } });

    /* follow mode */
    const followBox = h('div', { class: 'sk-root', hidden: true });
    const energy = h('div', { class: 'ear-explorer-energy', 'aria-hidden': 'true' }, ENERGY.map(e => h('span', null, e)));
    const stepsBar = h('div', { class: 'ear-explorer-steps', 'aria-hidden': 'true' }, STEPS.map(() => h('span')));
    const fCard = SK.card('', '');
    const prevB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Previous step' }, '← Back');
    const playB = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Play');
    const nextB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Next step' }, 'Next →');
    followBox.append(h('div', { class: 'sk-kicker' }, 'Energy changes'), energy, stepsBar, h('div', { class: 'sk-row' }, prevB, playB, nextB), fCard.el);
    let step = 0, playing = false, playT = 0, lp = null, t = 0;
    const gW = svg.querySelector('#ee-waves');
    const drum = svg.querySelector('#ee-drum'), ham = svg.querySelector('#ee-ham'), anv = svg.querySelector('#ee-anv'), sti = svg.querySelector('#ee-sti');
    let insetSvg = null;
    function drawInset(anim) {
      const s = `<rect x="0" y="0" width="480" height="176" rx="14" style="fill:var(--surface-2);stroke:var(--line)"/>
        <text class="sk-ts" x="14" y="22">ZOOM: COCHLEA UNROLLED</text>
        <text class="sk-t" x="466" y="22" text-anchor="end" style="fill:var(--sk-vio)">basilar membrane + hair cells</text>
        <path d="M30 40 L450 62 L450 98 L30 120 Z" class="flf" style="opacity:.8" transform="translate(0 12)"/>
        <text class="sk-ts" x="34" y="168">oval window (base)</text><text class="sk-ts" x="450" y="168" text-anchor="end">apex</text>
        <g transform="translate(0 12)"><path id="ee-bm" d="M30 80 L450 80" style="fill:none;stroke:var(--sk-vio);stroke-width:4"/>
        <g id="ee-hc"></g></g><g id="ee-sp"></g>`;
      inset.innerHTML = '';
      insetSvg = SK.svg('0 0 480 176', s, { class: 'ear-explorer-svg', role: 'img', 'aria-label': 'Unrolled cochlea: fluid waves ripple the basilar membrane and bend the hair cells on it' });
      inset.append(insetSvg);
      drawBM(0, anim ? step : -1);
    }
    function drawBM(tt, st) {
      if (!insetSvg) return;
      const amp = st >= 3 ? 1 : 0;
      let d = '', hc = '', sp = '';
      for (let i = 0; i <= 60; i++) {
        const x = 30 + i * 7, env = Math.exp(-Math.pow((i - 22) / 12, 2)) * amp;
        const y = 80 + Math.sin(i * 0.5 - tt * 9) * 10 * env;
        d += (i ? 'L' : 'M') + x + ' ' + y.toFixed(1);
        if (i % 3 === 0) { const tilt = Math.cos(i * 0.5 - tt * 9) * 10 * env; hc += `<path d="M${x} ${y.toFixed(1)} L${(x + tilt).toFixed(1)} ${(y - 12).toFixed(1)}" style="stroke:var(--spark);stroke-width:2.2;stroke-linecap:round"/>`; }
      }
      if (st >= 4) for (let k = 0; k < 4; k++) { const u = (tt * 0.8 + k / 4) % 1; sp += `<circle class="sig" cx="${(150 + u * 300).toFixed(1)}" cy="${(140 + u * 8).toFixed(1)}" r="4"/>`; }
      insetSvg.querySelector('#ee-bm').setAttribute('d', d);
      insetSvg.querySelector('#ee-hc').innerHTML = hc;
      insetSvg.querySelector('#ee-sp').innerHTML = sp;
    }
    function frame(dt) {
      t += dt;
      const st = step, rm = api.reduceMotion;
      // sound waves
      let w = '';
      if (st <= 1) for (let k = 0; k < 4; k++) { const u = ((t * 0.55 + k / 4) % 1); const x = 10 + u * 190; w += `<path class="wave" d="M${x} ${142 - 26 + (x > 60 ? 10 : 0)} Q ${x + 10} 142 ${x} ${142 + 26 - (x > 60 ? 10 : 0)}" style="opacity:${(1 - u * 0.5).toFixed(2)}"/>`; }
      if (st >= 3) { const u = (t * 0.9) % 1; for (let k = 0; k < 3; k++) { const v = (u + k / 3) % 1; const a = Math.PI * 1.02 + v * 2.3 * Math.PI * 2, r = 40 + (7 - 40) * v; w += `<circle cx="${(338 + Math.cos(a) * r).toFixed(1)}" cy="${(178 + Math.sin(a) * r).toFixed(1)}" r="5" style="fill:var(--carolina);opacity:.85"/>`; } }
      if (st >= 5) for (let k = 0; k < 4; k++) { const u = (t * 0.7 + k / 4) % 1; const x = 340 + u * 140, y = 176 - u * 30 + u * u * 0; w += `<circle class="sig" cx="${x.toFixed(1)}" cy="${(176 - (x - 340) * 0.21).toFixed(1)}" r="4.5"/>`; }
      gW.innerHTML = w;
      const vib = rm ? 0 : Math.sin(t * 40);
      const vd = st >= 1 ? 1.6 : 0, vo = st >= 2 ? 1.8 : st >= 1 ? 0.8 : 0;
      drum.setAttribute('transform', `rotate(-8 208 142) translate(${(vib * vd).toFixed(2)} 0)`);
      [ham, anv, sti].forEach((e, i) => e.setAttribute('transform', `translate(${(vib * vo * (1 + i * 0.25)).toFixed(2)} 0)`));
      drawBM(t, st);
    }
    function showStep(i) {
      step = Math.max(0, Math.min(STEPS.length - 1, i));
      const S = STEPS[step];
      [...energy.children].forEach((e, k) => e.className = k < S.e ? 'done' : k === S.e ? 'on' : '');
      [...stepsBar.children].forEach((s, k) => s.className = k < step ? 'done' : k === step ? 'on' : '');
      fCard.set(`${step + 1}. ${S.t}`, S.d);
      if (S.hl === 'ossicles') { ex.highlight('hammer'); ['anvil', 'stirrup'].forEach(id => svg.querySelectorAll(`[data-part="${id}"]`).forEach(x => x.classList.add('sk-on'))); }
      else ex.highlight(S.hl);
      if (step === 0) svg.querySelectorAll('[data-part="canal"]').forEach(x => x.classList.add('sk-on'));
      inset.hidden = step < 3;
      if (step >= 3 && !insetSvg) drawInset(true);
      prevB.disabled = step === 0; nextB.disabled = step === STEPS.length - 1;
      api.sfx.blip();
    }
    function stopPlay() { playing = false; clearTimeout(playT); playB.textContent = 'Play'; }
    playB.onclick = () => {
      if (playing) return stopPlay();
      playing = true; playB.textContent = 'Pause';
      showStep(step === STEPS.length - 1 ? 0 : step + 1);
      const tick = () => { playT = setTimeout(() => { if (!playing) return; if (step >= STEPS.length - 1) { stopPlay(); api.addXP(2); return; } showStep(step + 1); tick(); }, 3600); };
      tick();
    };
    prevB.onclick = () => { stopPlay(); showStep(step - 1); };
    nextB.onclick = () => { stopPlay(); showStep(step + 1); };

    function setMode(m) {
      stopPlay(); lp && lp.stop(); lp = null; gW.innerHTML = '';
      [drum, ham, anv, sti].forEach(e => e.removeAttribute('transform')); drum.setAttribute('transform', 'rotate(-8 208 142)');
      followBox.hidden = m !== 'follow'; inset.hidden = true; insetSvg = null; inset.innerHTML = '';
      ex.info.el.hidden = m === 'follow';
      gH.style.display = m === 'follow' ? 'none' : '';
      if (m === 'follow') { ex.setMode('none'); root.classList.remove('sk-quiz'); showStep(0); lp = SK.loop(frame); }
      else ex.setMode(m);
    }
    root.append(ex.qbar, stage, followBox, inset, ex.info.el);
    el.append(root);
    return () => { stopPlay(); lp && lp.stop(); };
  }
});
})();
