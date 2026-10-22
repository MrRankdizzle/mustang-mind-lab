/* 1.6B eye-explorer — eye cross-section: explore, quiz, trace the light, focus lab (accommodation, near/farsighted) */
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
SK.css('eye-explorer-style', `
.eye-explorer-svg .sclera { fill: color-mix(in srgb, #DCEFFF 30%, var(--surface)); stroke: var(--sk-white); stroke-width: 7; }
.eye-explorer-svg .sclera-out { fill: none; stroke: var(--muted); stroke-width: 1.2; opacity: .55; }
.eye-explorer-svg .choroid { fill: none; stroke: color-mix(in srgb, #8E3B46 70%, var(--surface)); stroke-width: 3; }
.eye-explorer-svg .retina { fill: none; stroke: color-mix(in srgb, #E9785F 90%, var(--surface)); stroke-width: 5; stroke-linecap: round; }
.eye-explorer-svg .cornea { fill: color-mix(in srgb, #BFE3FF 45%, var(--surface)); stroke: color-mix(in srgb, #5FB3E8 90%, var(--surface)); stroke-width: 4; }
.eye-explorer-svg .iris { fill: color-mix(in srgb, #3C7DB8 90%, var(--surface)); stroke: color-mix(in srgb, #24557F 90%, var(--surface)); stroke-width: 1.5; }
.eye-explorer-svg .pupil { fill: var(--ink); opacity: .1; }
.eye-explorer-svg .lens { fill: color-mix(in srgb, #F4E3B0 70%, var(--surface)); stroke: color-mix(in srgb, #C49A3A 90%, var(--surface)); stroke-width: 2; transition: rx .5s; }
.eye-explorer-svg .cil { fill: color-mix(in srgb, #B5656F 80%, var(--surface)); }
.eye-explorer-svg .zon { stroke: var(--muted); stroke-width: 1; opacity: .7; }
.eye-explorer-svg .nerve { fill: var(--sk-nerve); stroke: color-mix(in srgb, #A87B12 90%, var(--surface)); stroke-width: 1.5; }
.eye-explorer-svg .fovea { fill: color-mix(in srgb, #E2B93B 95%, var(--surface)); }
.eye-explorer-svg .disc { fill: var(--sk-white); stroke: color-mix(in srgb, #A87B12 90%, var(--surface)); stroke-width: 1.5; }
.eye-explorer-svg .ray { fill: none; stroke: #FFB703; stroke-width: 2.5; stroke-linejoin: round; filter: drop-shadow(0 0 3px rgba(255,183,3,.7)); }
.eye-explorer-svg .ray.dim { opacity: .25; }
.eye-explorer-svg .photon { fill: #FFD60A; filter: drop-shadow(0 0 6px #FFB703); }
.eye-explorer-svg .obj { fill: var(--good); }
.eye-explorer-svg .img { fill: var(--good); opacity: .9; }
.eye-explorer-svg .focus-ok { fill: var(--good); }
.eye-explorer-svg .focus-bad { fill: var(--bad); }
.eye-explorer-svg .glasses { fill: color-mix(in srgb, #9FD3F5 55%, var(--surface)); stroke: var(--carolina); stroke-width: 2; }
.eye-explorer-svg .sig { fill: var(--spark); filter: drop-shadow(0 0 4px var(--spark)); }
.eye-explorer-svg .sk-t { font-size: 16px; }
.eye-explorer-svg .sk-ts { font-size: 13.5px; }
.eye-explorer-steps { display: flex; gap: 5px; }
.eye-explorer-steps span { flex: 1; height: 6px; border-radius: 9px; background: var(--line); transition: background .3s; }
.eye-explorer-steps span.on { background: var(--spark); }
.eye-explorer-steps span.done { background: var(--carolina); }
.eye-explorer-see { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; }
.eye-explorer-view { width: 132px; height: 92px; border-radius: 12px; border: 2px solid var(--line); background: #fff; overflow: hidden; display: grid; place-items: center; position: relative; }
.eye-explorer-view > div { font-family: Georgia, 'Times New Roman', serif; color: #111; text-align: center; line-height: 1.05; transition: filter .4s; }
.eye-explorer-view b { display: block; font-size: 30px; }
.eye-explorer-view span { font-size: 15px; letter-spacing: 2px; }
.eye-explorer-view small { position: absolute; left: 6px; top: 4px; font-family: var(--f-mono); font-size: 10px; color: #667; font-weight: 700; }
`);

const PARTS = [
  { id: 'cornea', name: 'Cornea', info: 'The clear, protective outer layer at the front of the eye. It bends (refracts) incoming light and does most of the eye’s focusing.' },
  { id: 'pupil', name: 'Pupil', info: 'The adjustable opening in the center of the eye. It looks black because light goes in and doesn’t come back out. It lets light reach the lens.' },
  { id: 'iris', name: 'Iris', info: 'The colored ring of muscle (blue, brown, green…) around the pupil. It widens the pupil in dim light and shrinks it in bright light. Try the light slider!' },
  { id: 'lens', name: 'Lens', info: 'The clear, flexible structure behind the pupil. It changes shape (accommodation) to fine-tune focus so the image lands on the retina. The image it makes is upside down!' },
  { id: 'retina', name: 'Retina', info: 'The light-sensitive inner lining at the back of the eye. Its rods and cones (photoreceptors) transduce light into neural signals.' },
  { id: 'fovea', name: 'Fovea', info: 'A tiny pit in the center of the retina packed with cones. Vision here is sharpest and most colorful, which is why you look straight at words to read them.' },
  { id: 'nerve', name: 'Optic nerve', info: 'A bundle of ganglion cell axons that carries visual information from the eye to the brain (thalamus, then the visual cortex in the occipital lobe).' },
  { id: 'blind', name: 'Blind spot', info: 'Where the optic nerve leaves the eye (the optic disc). There are no rods or cones here, so this spot can’t detect light. Your brain fills in the gap.' }
];

const STEPS = [
  { hl: 'cornea', t: 'Light enters', d: 'Light reflects off the object (the green arrow) and travels into the eye through the clear <b>cornea</b>, which bends it and does most of the focusing.' },
  { hl: 'pupil', t: 'Through the pupil', d: 'The light passes through the <b>pupil</b>. The <b>iris</b> around it makes the opening bigger in dim light and smaller in bright light.' },
  { hl: 'lens', t: 'The lens focuses', d: 'The <b>lens</b> bends the light more to fine-tune focus. Notice the rays cross: the image lands on the retina <b>upside down</b>. Your brain flips it.' },
  { hl: 'retina', t: 'Transduction', d: 'Light hits the <b>retina</b>. Photoreceptors (<b>rods</b> and <b>cones</b>) at the very back <b>transduce</b> light energy into neural signals. (Light passes through the other cell layers to reach them.)' },
  { hl: 'nerve', t: 'Ganglion cells', d: 'Signals go from photoreceptors to bipolar cells, then <b>ganglion cells</b>. The ganglion cells’ axons gather into the <b>optic nerve</b>, leaving through the blind spot.' },
  { hl: 'nerve', t: 'To the brain', d: 'The optic nerve carries the impulses to the <b>thalamus</b>, which relays them to the visual cortex in the <b>occipital lobe</b> at the back of your brain. Now you see!' }
];

function eyeMarkup(pupil) {
  const P = (th, r = 94) => [230 + r * Math.cos(th * Math.PI / 180), 130 + r * Math.sin(th * Math.PI / 180)];
  const [rx1, ry1] = P(-122), [rx2, ry2] = P(9), [rx3, ry3] = P(26), [rx4, ry4] = P(122);
  const [cx1, cy1] = P(-122, 97), [cx4, cy4] = P(122, 97);
  const f = P(0, 92), d = P(17.5, 95);
  const p = pupil;
  return `
  <defs><clipPath id="ee-clip"><circle cx="230" cy="130" r="98"/></clipPath></defs>
  <g class="sk-part" data-part="nerve"><path class="nerve sk-glow" d="M318 150 C 340 154 352 168 410 182 L 410 214 C 350 200 336 184 314 178 Z"/></g>
  <circle class="sclera" cx="230" cy="130" r="100"/>
  <circle class="sclera-out" cx="230" cy="130" r="104"/>
  <path class="choroid" d="M${cx1} ${cy1} A97 97 0 1 1 ${cx4} ${cy4}"/>
  <g class="sk-part" data-part="retina"><path class="retina sk-glow" d="M${rx1} ${ry1} A94 94 0 0 1 ${rx2} ${ry2} M${rx3} ${ry3} A94 94 0 0 1 ${rx4} ${ry4}"/></g>
  <g class="sk-part" data-part="fovea"><ellipse class="fovea sk-glow" cx="${f[0]}" cy="${f[1]}" rx="4" ry="9"/></g>
  <g class="sk-part" data-part="blind"><ellipse class="disc sk-glow" cx="${d[0] + 1}" cy="${d[1]}" rx="5" ry="12"/></g>
  <g class="sk-part" data-part="cornea"><path class="cornea sk-glow" d="M141.7 83 A58 58 0 0 0 141.7 177 L146 172 A54 54 0 0 1 146 88 Z"/></g>
  <path class="cil" d="M150 84 L176 92 L176 98 L152 94 Z M150 176 L176 168 L176 162 L152 166 Z"/>
  <path class="zon" d="M174 95 L172 101 M168 93 L170 101 M174 165 L172 159 M168 167 L170 159"/>
  <g class="sk-part" data-part="lens"><ellipse class="lens sk-glow" cx="172" cy="130" rx="12" ry="29"/></g>
  <g class="sk-part" data-part="iris"><path class="iris sk-glow" d="M151 86 h7 v${44 - p - 2} h-7 Z M151 174 h7 v-${44 - p - 2} h-7 Z"/></g>
  <g class="sk-part" data-part="pupil"><rect class="pupil sk-glow" x="150" y="${130 - p}" width="9" height="${2 * p}" rx="2"/></g>`;
}
function labelsMarkup(p) {
  const L = (id, tx, ty, anchor, lx, ly, x, y) => `<g class="sk-lbl" data-part="${id}"><path class="sk-lead" d="M${lx} ${ly} L${x} ${y}"/><text class="sk-t" x="${tx}" y="${ty}" text-anchor="${anchor}">${PARTS.find(q => q.id === id).name}</text></g>`;
  return L('cornea', 86, 52, 'end', 88, 52, 124, 104) + L('pupil', 86, 134, 'end', 90, 130, 151, 130) +
    L('iris', 86, 216, 'end', 88, 210, 154, 164) + L('lens', 186, 22, 'middle', 182, 27, 174, 101) + L('retina', 338, 26, 'middle', 330, 31, 289, 57) +
    L('fovea', 352, 104, 'start', 350, 101, 326, 127) + L('blind', 262, 252, 'middle', 272, 239, 320, 162) + L('nerve', 338, 238, 'start', 372, 224, 372, 194);
}
function hitsMarkup(p) {
  return `<path class="sk-hit" data-part="retina" d="M180 51 A94 94 0 0 1 320 112 M318 168 A94 94 0 0 1 180 209" style="stroke-width:16;fill:none"/>
  <path class="sk-hit" data-part="nerve" d="M330 168 C 350 172 360 182 410 196" style="stroke-width:30;fill:none"/>
  <ellipse class="sk-hit" data-part="fovea" cx="320" cy="130" rx="13" ry="15"/>
  <ellipse class="sk-hit" data-part="blind" cx="320" cy="159" rx="12" ry="14"/>
  <path class="sk-hit" data-part="cornea" d="M138 80 A58 58 0 0 0 138 180" style="stroke-width:16;fill:none"/>
  <rect class="sk-hit" data-part="iris" x="144" y="84" width="20" height="${44 - p}"/><rect class="sk-hit" data-part="iris" x="144" y="${130 + p}" width="20" height="${44 - p}"/>
  <rect class="sk-hit" data-part="pupil" x="144" y="${130 - p + 1}" width="20" height="${2 * p - 2}"/>
  <ellipse class="sk-hit" data-part="lens" cx="174" cy="130" rx="15" ry="30"/>
  ${''}`;
}

ML.registerWidget('eye-explorer', {
  title: 'Inside the eye', tag: 'Anatomy',
  mount(el, api) {
    const h = api.h;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const root = h('div', { class: 'sk-root' });
    const instr = SK.instr('Tap any part of the eye to learn what it does. Then quiz yourself, trace the path of light, or fix blurry vision in the Focus lab.');
    let mode = 'explore';
    const modeSeg = SK.seg([{ v: 'explore', label: 'Explore' }, { v: 'quiz', label: 'Quiz me' }, { v: 'trace', label: 'Trace the light' }, { v: 'focus', label: 'Focus lab' }], 'explore', setMode, 'Mode');
    root.append(instr, modeSeg.el);

    /* main eye */
    let pupil = 14;
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '560px' } });
    const svg = SK.svg('0 0 420 260', '', { class: 'eye-explorer-svg', role: 'group', 'aria-label': 'Cross-section of the human eye, light enters from the left' });
    const gTrace = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gEye = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gLbl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gHit = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.append(gEye, gTrace, gLbl, gHit);
    function drawEye() { gEye.innerHTML = eyeMarkup(pupil); gLbl.innerHTML = labelsMarkup(pupil); }
    drawEye();
    gHit.innerHTML = hitsMarkup(14);
    stage.append(svg);
    const light = SK.range('Light level', 0, 100, 1, 50, v => v < 30 ? 'Dim: pupil opens' : v > 70 ? 'Bright: pupil shrinks' : 'Medium', v => {
      pupil = 21 - v * 0.14; drawEye(); if (ex.mode === 'explore' && curSel) ex.highlight(curSel);
    });
    let curSel = null;
    const ex = SK.explorer(api, svg, PARTS, { rootEl: root, onSelect: id => { curSel = id; }, hint0: 'Tap or Tab to any structure. Drag the light slider to watch the iris resize the pupil.' });
    // hits are static; the explorer re-queries parts by data-part so redrawn eye elements still highlight
    const exploreBox = h('div', { class: 'sk-root' }, light.el);

    /* trace mode */
    const traceBox = h('div', { class: 'sk-root', hidden: true });
    const stepsBar = h('div', { class: 'eye-explorer-steps', 'aria-hidden': 'true' }, STEPS.map(() => h('span')));
    const tCard = SK.card('', '');
    const prevB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Previous step' }, '← Back');
    const playB = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Play');
    const nextB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Next step' }, 'Next →');
    const inset = h('div', { class: 'sk-stage', style: { maxWidth: '520px' } });
    traceBox.append(stepsBar, h('div', { class: 'sk-row' }, prevB, playB, nextB), tCard.el, inset);
    let step = 0, playing = false, anim = null;
    const RAYS = [
      [[22, 98], [128, 110], [172, 118], [322, 152]],
      [[22, 162], [128, 150], [172, 142], [322, 108]],
      [[22, 130], [128, 130], [172, 130], [322, 130]]
    ];
    function lenAt(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
    function ptAt(pts, d) { for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= s) { const k = d / s; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; } d -= s; } return pts[pts.length - 1]; }
    const STOP_X = [128, 158, 200, 322, 322, 322]; // how far the light has traveled at each step
    function drawTrace(progressX) {
      const clipPts = pts => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (pts[i][0] <= progressX) out.push(pts[i]); else { const a = pts[i - 1], b = pts[i], k = (progressX - a[0]) / (b[0] - a[0]); if (k > 0) out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); break; } } return out; };
      let s = `<path class="obj" d="M18 130 L18 104 L12 104 L22 92 L32 104 L26 104 L26 130 Z" transform="translate(0 36) scale(1 1)" /><rect class="obj" x="18" y="130" width="8" height="34" rx="1"/>`;
      s = `<g><path class="obj" d="M22 92 L32 106 L26 106 L26 164 L18 164 L18 106 L12 106 Z"/></g>`;
      RAYS.forEach(r => { const c = clipPts(r); s += `<path class="ray" d="${c.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')}"/>`; });
      if (progressX >= 322) s += `<path class="img" d="M319 152 L314 142 L317.5 142 L317.5 108 L320.5 108 L320.5 142 L324 142 Z" transform="translate(-6 0)"/>`;
      gTrace.innerHTML = s;
    }
    function insetFor(i) {
      inset.innerHTML = '';
      if (i === 3 || i === 4) {
        let s = `<rect x="0" y="0" width="420" height="190" rx="14" style="fill:var(--surface-2);stroke:var(--line)"/>
          <text class="sk-ts" x="14" y="22">ZOOM: RETINA (light comes from the left)</text>
          <rect x="356" y="30" width="18" height="150" style="fill:color-mix(in srgb,#5B2A2A 70%,var(--surface))"/><text class="sk-ts" x="340" y="186" text-anchor="middle">back of eye</text>`;
        for (let k = 0; k < 6; k++) { const y = 44 + k * 23; const cone = k % 2 === 0;
          s += cone ? `<path d="M300 ${y + 2} L330 ${y - 6} L354 ${y - 6} L354 ${y + 10} L330 ${y + 10} Z" style="fill:color-mix(in srgb,${['#E5484D', '#2EAD5B', '#3A76E0'][k % 3]} 80%,var(--surface))"/>`
            : `<rect x="300" y="${y - 4}" width="54" height="10" rx="5" style="fill:color-mix(in srgb,#8E8E99 85%,var(--surface))"/>`;
          s += `<line x1="230" y1="${y + 2}" x2="300" y2="${y + 2}" style="stroke:var(--muted);stroke-width:1.5"/><circle cx="220" cy="${y + 2}" r="8" style="fill:color-mix(in srgb,#B98DE0 80%,var(--surface))"/>`;
        }
        for (let k = 0; k < 3; k++) { const y = 56 + k * 46; s += `<line x1="140" y1="${y}" x2="212" y2="${y}" style="stroke:var(--muted);stroke-width:1.5"/><circle cx="130" cy="${y}" r="11" style="fill:var(--sk-nerve)"/><path d="M119 ${y} C 90 ${y} 80 ${y - 10} 70 ${y - 30}" style="fill:none;stroke:var(--sk-nerve);stroke-width:3"/>`; }
        s += `<text class="sk-ts" x="130" y="182" text-anchor="middle">ganglion cells</text><text class="sk-ts" x="220" y="182" text-anchor="middle">bipolar</text><text class="sk-ts" x="300" y="34" text-anchor="start">rods + cones</text>
          <text class="sk-ts" x="22" y="46">axons → optic nerve</text>`;
        s += `<g class="ee-light">${[60, 100, 140].map(y => `<path d="M12 ${y} H290" style="stroke:#FFB703;stroke-width:2;stroke-dasharray:4 6;opacity:.8"/>`).join('')}</g><g id="ee-sigs"></g>`;
        const sv = SK.svg('0 0 420 192', s, { class: 'eye-explorer-svg', role: 'img', 'aria-label': 'Zoomed retina: light passes through ganglion and bipolar cells to reach rods and cones at the back; signals travel back to ganglion cells whose axons form the optic nerve.' });
        inset.append(sv);
        animSignals(sv.querySelector('#ee-sigs'), i);
      } else if (i === 5) {
        const s = `<rect x="0" y="0" width="420" height="190" rx="14" style="fill:var(--surface-2);stroke:var(--line)"/>
          <text class="sk-ts" x="14" y="22">SIDE VIEW OF THE BRAIN</text>
          <path d="M120 120 C 110 60 170 30 240 34 C 320 38 372 74 370 124 C 368 150 350 160 330 160 C 300 170 250 168 220 160 C 190 166 140 160 120 120 Z" style="fill:color-mix(in srgb,#F2B6C3 55%,var(--surface));stroke:var(--muted);stroke-width:2"/>
          <path d="M318 52 C 360 70 374 104 370 124 C 368 150 350 160 330 160 C 316 150 306 110 318 52 Z" style="fill:color-mix(in srgb,#7CC0EE 80%,var(--surface));stroke:var(--carolina);stroke-width:2"/>
          <text class="sk-t" x="344" y="182" text-anchor="middle" style="fill:var(--carolina)">occipital lobe</text>
          <ellipse cx="232" cy="112" rx="16" ry="11" style="fill:color-mix(in srgb,#E2B93B 85%,var(--surface))"/><text class="sk-ts" x="232" y="94" text-anchor="middle">thalamus</text>
          <circle cx="62" cy="118" r="20" style="fill:var(--sk-white);stroke:var(--muted);stroke-width:2"/><circle cx="50" cy="118" r="7" style="fill:color-mix(in srgb,#3C7DB8 90%,var(--surface))"/><text class="sk-ts" x="62" y="154" text-anchor="middle">eye</text>
          <path id="ee-path" d="M82 120 C 140 124 190 116 218 113 M246 112 C 280 108 300 104 330 108" style="fill:none;stroke:var(--sk-nerve);stroke-width:5;stroke-linecap:round"/><g id="ee-sigs"></g>`;
        const sv = SK.svg('0 0 420 192', s, { class: 'eye-explorer-svg', role: 'img', 'aria-label': 'The optic nerve carries signals from the eye to the thalamus, then to the visual cortex in the occipital lobe.' });
        inset.append(sv);
        animSignals(sv.querySelector('#ee-sigs'), i);
      }
    }
    let sigLoop = null;
    function animSignals(g, i) {
      sigLoop && sigLoop.stop();
      if (api.reduceMotion) return;
      let t = 0;
      sigLoop = SK.loop(dt => {
        t += dt; let s = '';
        for (let k = 0; k < 4; k++) {
          const u = ((t * 0.45 + k / 4) % 1);
          if (i === 5) { const x = 82 + u * 248, y = x < 218 ? 120 - (x - 82) * 0.05 : 112 - (x - 246) * 0.05; s += `<circle class="sig" cx="${x}" cy="${y}" r="4"/>`; }
          else { const lane = 56 + (k % 3) * 46; let x, y; if (u < 0.6) { x = 300 - u / 0.6 * 170; y = lane + (u < 0.3 ? 0 : 0); } else { const v = (u - 0.6) / 0.4; x = 119 - v * 49; y = lane - v * 30; } s += `<circle class="sig" cx="${x}" cy="${y}" r="4"/>`; }
        }
        g.innerHTML = s;
      });
    }
    function showStep(i, animate) {
      step = Math.max(0, Math.min(STEPS.length - 1, i));
      [...stepsBar.children].forEach((s, k) => s.className = k < step ? 'done' : k === step ? 'on' : '');
      const S = STEPS[step];
      tCard.set(`${step + 1}. ${S.t}`, S.d);
      ex.highlight(S.hl);
      if (step >= 4) svg.querySelectorAll('[data-part="blind"]').forEach(x => x.classList.add('sk-on'));
      prevB.disabled = step === 0; nextB.disabled = step === STEPS.length - 1;
      const from = step > 0 ? STOP_X[step - 1] : 0, to = STOP_X[step];
      anim && anim.stop();
      if (!animate || api.reduceMotion) drawTrace(to);
      else { let x = from; anim = SK.loop(dt => { x = Math.min(to, x + dt * 160); drawTrace(x); if (x >= to) anim.stop(); }); }
      insetFor(step);
      api.sfx.blip();
    }
    let playT = 0;
    function stopPlay() { playing = false; clearTimeout(playT); playB.textContent = 'Play'; }
    playB.onclick = () => {
      if (playing) return stopPlay();
      playing = true; playB.textContent = 'Pause';
      if (step === STEPS.length - 1) showStep(0, true); else showStep(step + 1, true);
      const tick = () => { if (!playing) return; if (step >= STEPS.length - 1) { stopPlay(); api.addXP(2); return; } playT = later(() => { showStep(step + 1, true); tick(); }, 3600); };
      tick();
    };
    prevB.onclick = () => { stopPlay(); showStep(step - 1, false); };
    nextB.onclick = () => { stopPlay(); showStep(step + 1, true); };

    /* focus lab */
    const focusBox = h('div', { class: 'sk-root', hidden: true });
    let obj = 'far', eyeT = 'normal', glasses = false;
    const objSeg = SK.seg([{ v: 'far', label: 'Far object' }, { v: 'near', label: 'Near object' }], 'far', v => { obj = v; drawFocus(); }, 'Object distance');
    const eyeSeg = SK.seg([{ v: 'normal', label: 'Normal eye' }, { v: 'myopia', label: 'Nearsighted' }, { v: 'hyper', label: 'Farsighted' }], 'normal', v => { eyeT = v; glasses = false; drawFocus(); }, 'Eye type');
    const glassB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': 'false' }, 'Add corrective lens');
    glassB.onclick = () => { glasses = !glasses; api.sfx.tap(); drawFocus(); };
    const fStage = h('div', { class: 'sk-stage', style: { maxWidth: '560px' } });
    const view = h('div', { class: 'eye-explorer-view', 'aria-hidden': 'true' }, h('small', null, 'WHAT YOU SEE'), h('div', null, h('b', null, 'E'), h('span', null, 'F P'), h('br'), h('span', { style: { fontSize: '11px' } }, 'T O Z')));
    const fCard = SK.card('', '');
    focusBox.append(objSeg.el, eyeSeg.el, h('div', { class: 'sk-row' }, glassB), fStage, h('div', { class: 'eye-explorer-see' }, view, fCard.el));
    function drawFocus() {
      const R = eyeT === 'myopia' ? 348 : eyeT === 'hyper' ? 296 : 322;
      const near = obj === 'near';
      let xf;
      if (eyeT === 'normal') xf = R;
      else if (eyeT === 'myopia') xf = near ? R : (glasses ? R : 322);
      else xf = near ? (glasses ? R : 336) : R;
      const thick = near ? 15 : 9;
      const a = 24, cy = 110;
      glassB.disabled = eyeT === 'normal'; glassB.setAttribute('aria-pressed', String(glasses)); glassB.textContent = glasses ? 'Remove corrective lens' : 'Add corrective lens';
      const erx = (R + 4 - 126) / 2, ecx = 126 + erx, ery = 80;
      const ra = a2 => [ecx + (erx - 4) * Math.cos(a2), cy + (ery - 4) * Math.sin(a2)];
      const [r1x, r1y] = ra(-1.1), [r2x, r2y] = ra(1.1);
      let s = `<ellipse class="sclera" cx="${ecx}" cy="${cy}" rx="${erx}" ry="${ery}"/><ellipse class="sclera-out" cx="${ecx}" cy="${cy}" rx="${erx + 4}" ry="${ery + 4}"/>
        <path class="cornea" d="M130 66 A52 52 0 0 0 130 154 L134 150 A48 48 0 0 1 134 70 Z"/>
        <path class="retina" d="M${r1x.toFixed(1)} ${r1y.toFixed(1)} A${erx - 4} ${ery - 4} 0 0 1 ${r2x.toFixed(1)} ${r2y.toFixed(1)}" style="stroke-width:5"/>
        <path class="iris" d="M141 62 h6 v${46 - 26 - 2} h-6 Z M141 158 h6 v-${46 - 26 - 2} h-6 Z"/>
        <ellipse class="lens" cx="166" cy="${cy}" rx="${thick}" ry="28"/>`;
      // object
      if (near) s += `<g><rect x="8" y="${cy - 22}" width="26" height="44" rx="3" style="fill:var(--carolina)"/><rect x="11" y="${cy - 19}" width="20" height="38" rx="2" style="fill:var(--sk-white)"/><text class="sk-ts" x="21" y="${cy + 40}" text-anchor="middle">book</text></g>`;
      else s += `<g><path d="M6 ${cy + 8} L20 ${cy - 16} L34 ${cy + 8} Z" style="fill:var(--good)"/><rect x="18" y="${cy + 8}" width="4" height="8" style="fill:var(--sk-bone-d)"/><text class="sk-ts" x="20" y="${cy + 34}" text-anchor="middle">far tree</text></g>`;
      // glasses
      const gx = 92;
      if (glasses) s += eyeT === 'myopia'
        ? `<path class="glasses" d="M${gx - 9} ${cy - 34} L${gx + 9} ${cy - 34} Q${gx + 2} ${cy} ${gx + 9} ${cy + 34} L${gx - 9} ${cy + 34} Q${gx - 2} ${cy} ${gx - 9} ${cy - 34} Z"/>`
        : `<path class="glasses" d="M${gx} ${cy - 34} Q${gx + 14} ${cy} ${gx} ${cy + 34} Q${gx - 14} ${cy} ${gx} ${cy - 34} Z"/>`;
      // rays
      [-1, 1].forEach(sg => {
        const pts = [];
        if (near) { pts.push([34, cy]); if (glasses) pts.push([gx, cy + sg * a * 0.58]); pts.push([130, cy + sg * a * 0.92]); }
        else { if (glasses) { pts.push([40, cy + sg * a * 0.78]); pts.push([gx, cy + sg * a * 0.78]); } else pts.push([40, cy + sg * a]); pts.push([130, cy + sg * a]); }
        pts.push([166, cy + sg * a * 0.95]);
        const L0 = pts[pts.length - 1];
        if (xf <= R) { pts.push([xf, cy]); const k = (R - xf) / (xf - L0[0]); pts.push([R - 4, cy - sg * a * 0.95 * k]); }
        else { const k = (xf - R) / (xf - L0[0]); pts.push([R - 3, cy + sg * a * 0.95 * k]); }
        s += `<path class="ray" d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')}"/>`;
        if (xf > R) s += `<path class="ray dim" d="M${R - 3} ${(cy + sg * a * 0.95 * (xf - R) / (xf - L0[0])).toFixed(1)} L${xf} ${cy}" style="stroke-dasharray:4 4;opacity:.5"/>`;
      });
      const ok = Math.abs(xf - R) < 1;
      s += `<circle class="${ok ? 'focus-ok' : 'focus-bad'}" cx="${xf}" cy="${cy}" r="5"/>`;
      s += `<text class="sk-t" x="${Math.min(xf, 360)}" y="${cy + 102}" text-anchor="middle" style="fill:${ok ? 'var(--good)' : 'var(--bad)'}">${ok ? 'focus on retina' : xf < R ? 'focus in FRONT of retina' : 'focus BEHIND retina'}</text>`;
      s += `<text class="sk-ts" x="172" y="${cy - 56}" text-anchor="middle">lens: ${near ? 'thicker' : 'flatter'}</text>`;
      s += `<text class="sk-ts" x="${r1x + 18}" y="${r1y - 8}" text-anchor="middle">retina</text>`;
      if (glasses) s += `<text class="sk-ts" x="${gx}" y="${cy - 42}" text-anchor="middle">${eyeT === 'myopia' ? 'concave' : 'convex'}</text>`;
      fStage.innerHTML = '';
      fStage.append(SK.svg('0 0 420 226', s, { class: 'eye-explorer-svg', role: 'img', 'aria-label': `${eyeT} eye looking at a ${obj} object. ${ok ? 'Image focuses on the retina.' : xf < R ? 'Image focuses in front of the retina.' : 'Image focuses behind the retina.'}` }));
      const blur = Math.abs(xf - R) * 0.3;
      view.firstChild.nextSibling.style.filter = `blur(${blur.toFixed(1)}px)`;
      let t, d, cls = ok ? 'good' : 'bad';
      if (eyeT === 'normal') { t = near ? 'Accommodation: lens thickens' : 'Lens flattens for far objects'; d = near ? 'For a close object, ciliary muscles let the lens get <b>thicker and rounder</b> so it bends light more. That shape change is <b>accommodation</b>.' : 'For distant objects the lens stretches <b>thinner and flatter</b>. Switch to “Near object” and watch it change shape.'; }
      else if (eyeT === 'myopia') {
        if (near) { t = 'Nearsighted: near is clear'; d = 'A nearsighted eye is a bit too long (or the cornea curves too much). Close objects still focus on the retina. Now try a <b>far</b> object.'; }
        else if (!glasses) { t = 'Nearsighted: far is blurry'; d = 'The image of a far object focuses <b>in front of</b> the retina, so it is blurry. Tap <b>Add corrective lens</b>.'; }
        else { t = 'Fixed with a concave lens'; d = 'A <b>concave</b> (diverging) lens spreads the light slightly so the focus moves back onto the retina. Clear!'; }
      } else {
        if (!near) { t = 'Farsighted: far is clear'; d = 'A farsighted eye is a bit too short. Far objects can still focus on the retina. Now try a <b>near</b> object.'; }
        else if (!glasses) { t = 'Farsighted: near is blurry'; d = 'Even with the lens at its thickest, a near object focuses <b>behind</b> the retina, so reading is blurry. Tap <b>Add corrective lens</b>.'; }
        else { t = 'Fixed with a convex lens'; d = 'A <b>convex</b> (converging) lens adds extra bending so the focus moves forward onto the retina. Clear!'; }
      }
      fCard.set(t, d, cls);
    }

    function setMode(m) {
      mode = m; stopPlay(); anim && anim.stop(); sigLoop && sigLoop.stop();
      stage.hidden = m === 'focus';
      exploreBox.hidden = m !== 'explore';
      ex.info.el.hidden = !(m === 'explore' || m === 'quiz');
      traceBox.hidden = m !== 'trace'; focusBox.hidden = m !== 'focus';
      gTrace.innerHTML = ''; inset.innerHTML = '';
      gHit.style.display = m === 'trace' ? 'none' : '';
      root.classList.toggle('eye-explorer-tracing', m === 'trace');
      gLbl.style.display = m === 'trace' ? 'none' : '';
      if (m === 'explore' || m === 'quiz') ex.setMode(m);
      else { ex.setMode('none'); }
      if (m === 'trace') showStep(0, true);
      if (m === 'focus') drawFocus();
    }
    root.append(ex.qbar, stage, exploreBox, ex.info.el, traceBox, focusBox);
    el.append(root);
    return () => { stopPlay(); anim && anim.stop(); sigLoop && sigLoop.stop(); timers.forEach(clearTimeout); };
  }
});
})();
