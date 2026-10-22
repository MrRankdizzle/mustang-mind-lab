/* 1.6C hearing-loss — damage parts of the ear: conduction vs sensorineural; hearing aid vs cochlear implant */
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
SK.css('hearing-loss-style', `
.hearing-loss-svg .skin { fill: var(--sk-flesh); stroke: var(--sk-flesh-d); stroke-width: 2; }
.hearing-loss-svg .air { fill: color-mix(in srgb, #EAF5FF 70%, var(--surface)); stroke: var(--sk-flesh-d); stroke-width: 1.5; }
.hearing-loss-svg .drum { fill: color-mix(in srgb, #F6C7B9 85%, var(--surface)); stroke: var(--spark); stroke-width: 2.5; }
.hearing-loss-svg .oss { fill: var(--sk-white); stroke: var(--sk-bone-d); stroke-width: 2; }
.hearing-loss-svg .coch { fill: none; stroke: var(--sk-fluid); stroke-width: 11; stroke-linecap: round; }
.hearing-loss-svg .cocho { fill: none; stroke: color-mix(in srgb, #3E8DC4 80%, var(--surface)); stroke-width: 15; stroke-linecap: round; }
.hearing-loss-svg .hair { stroke: var(--spark); stroke-width: 2; stroke-linecap: round; }
.hearing-loss-svg .nerve { fill: none; stroke: var(--sk-nerve); stroke-width: 10; stroke-linecap: round; }
.hearing-loss-svg .brain { fill: color-mix(in srgb, #F2B6C3 60%, var(--surface)); stroke: var(--muted); stroke-width: 2; }
.hearing-loss-svg .temporal { fill: color-mix(in srgb, #7CC0EE 75%, var(--surface)); }
.hearing-loss-svg .wax { fill: color-mix(in srgb, #C68B2C 90%, var(--surface)); }
.hearing-loss-svg .dmg { fill: none; stroke: var(--bad); stroke-width: 4; stroke-linecap: round; }
.hearing-loss-svg .bracket { fill: none; stroke: var(--muted); stroke-width: 1.5; }
.hearing-loss-svg .wv { fill: none; stroke: var(--carolina); stroke-width: 2.5; stroke-linecap: round; }
.hearing-loss-svg .vib { fill: var(--sk-bone-d); }
.hearing-loss-svg .fl { fill: color-mix(in srgb, #3E8DC4 90%, var(--surface)); }
.hearing-loss-svg .sp { fill: var(--spark); }
.hearing-loss-svg .el { fill: #F5B700; }
.hearing-loss-svg .implant { fill: var(--surface); stroke: var(--ink); stroke-width: 2; }
.hearing-loss-svg .wire { fill: none; stroke: #F5B700; stroke-width: 2.5; }
.hearing-loss-svg .aid { fill: var(--carolina); }
.hearing-loss-svg .sk-hit:focus-visible + g, .hearing-loss-svg .sk-hit:focus-visible { stroke: var(--carolina); stroke-width: 3; stroke-dasharray: 4 3; }
.hearing-loss-svg .sk-ts { font-size: 13px; }
.hearing-loss-dx { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
.hearing-loss-dx b.readout { font-size: 26px; }
.hearing-loss-big { font-size: 20px; font-weight: 700; }
`);

const DMG = [
  { id: 'wax', name: 'Ear canal (blocked)', type: 'c' },
  { id: 'drum', name: 'Eardrum (torn)', type: 'c' },
  { id: 'oss', name: 'Ossicles (stiff)', type: 'c' },
  { id: 'hair', name: 'Hair cells (damaged)', type: 's' },
  { id: 'nerve', name: 'Auditory nerve', type: 's' }
];

ML.registerWidget('hearing-loss', {
  title: 'Hearing loss lab', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    root.append(SK.instr('Tap a part of the ear (or a button below) to damage it. Watch how much sound reaches the brain, name the type of hearing loss, then try a fix.'));
    const svg = SK.svg('0 0 460 230', `
      <path class="bracket" d="M10 40 V34 H124 V40 M134 40 V34 H198 V40 M204 40 V34 H372 V40"/>
      <text class="sk-ts" x="67" y="28" text-anchor="middle">OUTER EAR</text><text class="sk-ts" x="166" y="28" text-anchor="middle">MIDDLE</text><text class="sk-ts" x="288" y="28" text-anchor="middle">INNER EAR + NERVE</text>
      <path class="skin" d="M40 60 C 10 50 4 110 14 150 C 20 170 34 176 42 170 L42 146 C 30 146 26 128 28 116 C 30 92 32 76 40 78 Z"/>
      <path class="air" d="M30 98 H124 V126 H30 Z"/>
      <g id="hl-wax" style="display:none"><path class="wax" d="M70 99 C 84 96 96 104 92 114 C 96 122 84 128 72 125 C 62 120 62 104 70 99 Z"/></g>
      <path class="air" d="M132 66 H198 V156 H132 Z" style="opacity:.8"/>
      <ellipse class="drum" cx="128" cy="112" rx="4" ry="22"/>
      <g id="hl-oss"><path class="oss" d="M131 112 L 146 88 L 156 90 L 150 96 Z"/><path class="oss" d="M154 88 C 166 82 176 88 172 98 L 170 112 L 164 112 Z"/><path class="oss" d="M168 112 H178 C 184 104 194 104 197 106 V 120 C 194 122 184 122 178 114 Z"/></g>
      <path class="cocho" id="hl-co" d=""/><path class="coch" id="hl-ci" d=""/>
      <g id="hl-hairs"></g>
      <path class="nerve" id="hl-nerve" d="M252 112 C 290 110 330 104 372 100"/>
      <g transform="translate(410 102)"><path class="brain" d="M-38 6 C -40 -24 -14 -38 8 -36 C 30 -34 42 -18 40 4 C 38 22 20 30 0 28 C -14 34 -36 28 -38 6 Z"/><path class="temporal" d="M-30 14 C -24 2 -4 2 6 12 C 2 22 -20 26 -30 14 Z"/></g>
      <text class="sk-ts" x="410" y="152" text-anchor="middle">brain</text><text class="sk-ts" x="410" y="166" text-anchor="middle">(temporal lobe)</text>
      <g id="hl-dmg"></g>
      <g id="hl-aid" style="display:none"><rect class="aid" x="18" y="100" width="22" height="24" rx="8"/><text class="sk-ts" x="6" y="204" style="fill:var(--carolina)">hearing aid (in canal)</text></g>
      <g id="hl-imp" style="display:none"><rect class="implant" x="44" y="44" width="28" height="18" rx="6"/><circle cx="58" cy="53" r="4" style="fill:var(--ink)"/>
        <path class="wire" id="hl-wire" d="M72 52 C 120 46 190 50 214 70 C 228 82 236 92 236 104"/><path id="hl-elec" d="" style="fill:none;stroke:#F5B700;stroke-width:3;stroke-dasharray:2 3"/><text class="sk-ts" x="6" y="204" style="fill:#B58400">implant: mic + electrodes in cochlea</text></g>
      <g id="hl-flow"></g>
      <text class="sk-ts" x="76" y="152" text-anchor="middle">canal</text><text class="sk-ts" x="128" y="152" text-anchor="middle">eardrum</text><text class="sk-ts" x="166" y="176" text-anchor="middle">ossicles</text>
      <text class="sk-ts" x="236" y="160" text-anchor="middle">cochlea</text><text class="sk-ts" x="316" y="128" text-anchor="middle">auditory nerve</text>
      <rect class="sk-hit" data-d="wax" x="44" y="94" width="78" height="36"/><rect class="sk-hit" data-d="drum" x="121" y="86" width="14" height="52"/>
      <rect class="sk-hit" data-d="oss" x="138" y="80" width="60" height="44"/><circle class="sk-hit" data-d="hair" cx="236" cy="112" r="30"/><path class="sk-hit" data-d="nerve" d="M268 112 C 300 110 330 104 372 100" style="stroke-width:24;fill:none"/>
      `, { class: 'hearing-loss-svg', role: 'group', 'aria-label': 'Simple ear diagram from the outer ear to the brain. Tap parts to damage them.' });
    // cochlea spiral
    let d = ''; for (let i = 0; i <= 90; i++) { const tt = i / 90, a = Math.PI + tt * 2.2 * Math.PI * 2, r = 30 - 24 * tt; d += (i ? 'L' : 'M') + (236 + Math.cos(a) * r).toFixed(1) + ' ' + (112 + Math.sin(a) * r).toFixed(1); }
    svg.querySelector('#hl-co').setAttribute('d', d); svg.querySelector('#hl-ci').setAttribute('d', d); svg.querySelector('#hl-elec').setAttribute('d', d.split('L').slice(0, 60).join('L'));
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '620px' } }, svg);
    const dmg = new Set();
    let aid = false, implant = false;
    const chips = h('div', { class: 'sk-chips', role: 'group', 'aria-label': 'Damage a part' });
    const chipEls = DMG.map(D => { const b = h('button', { type: 'button', 'aria-pressed': 'false' }, D.name); b.onclick = () => toggle(D.id); chips.append(b); return b; });
    svg.querySelectorAll('.sk-hit').forEach(hit => { hit.setAttribute('tabindex', '-1'); hit.addEventListener('click', () => toggle(hit.dataset.d)); });
    const reset = h('button', { type: 'button', class: 'btn btn-sm btn-ghost' }, 'Heal everything');
    reset.onclick = () => { dmg.clear(); aid = implant = false; paint(); api.sfx.blip(); };
    const aidB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': 'false' }, 'Add hearing aid');
    const impB = h('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': 'false' }, 'Add cochlear implant');
    aidB.onclick = () => { aid = !aid; if (aid) implant = false; api.sfx.tap(); paint(); };
    impB.onclick = () => { implant = !implant; if (implant) aid = false; api.sfx.tap(); paint(); };
    const meter = h('div', { class: 'sk-meter', style: { height: '18px' } }, h('i'));
    const pct = h('b', { class: 'readout' });
    const dxName = h('div', { class: 'hearing-loss-big' });
    const dxCard = SK.card('', '');
    root.append(stage, h('div', { class: 'sk-kicker' }, 'Damage a part'), chips, h('div', { class: 'sk-kicker' }, 'Try a fix'), h('div', { class: 'sk-row' }, aidB, impB, reset),
      h('div', { class: 'sk-panel' }, h('div', { class: 'hearing-loss-dx' }, h('div', null, h('div', { class: 'sk-kicker' }, 'Diagnosis'), dxName), h('div', { style: { textAlign: 'right' } }, h('div', { class: 'sk-kicker' }, 'Sound reaching brain'), pct)), meter),
      dxCard.el,
      h('div', { class: 'sk-card' }, h('h4', null, 'Hearing for the first time'), h('p', null, 'When a cochlear implant is switched on, some people hear sound for the first time in their lives. Videos of babies grinning at their mom’s voice, or adults bursting into tears, show how powerful it is. At first voices can sound robotic; over weeks the brain learns to make sense of the new signals.')));
    function toggle(id) { dmg.has(id) ? dmg.delete(id) : dmg.add(id); api.sfx.tap(); paint(); }
    let level = 1, stageAmp = [1, 1, 1, 1, 1];
    function compute() {
      const c = ['wax', 'drum', 'oss'].filter(x => dmg.has(x)).length, hair = dmg.has('hair'), nerve = dmg.has('nerve');
      // amplitude after: [canal, drum, ossicles, hair cells(neural), nerve]
      let a = aid ? 3.2 : 1;
      const amps = [];
      a *= dmg.has('wax') ? 0.3 : 1; amps.push(a);
      a *= dmg.has('drum') ? 0.25 : 1; amps.push(a);
      a *= dmg.has('oss') ? 0.25 : 1; amps.push(a);
      let neural = a * (hair ? 0.15 : 1);
      if (implant) neural = 0.75;
      amps.push(neural);
      const fin = nerve ? 0 : Math.min(1, neural); amps.push(fin);
      stageAmp = amps; level = fin;
      return { c, hair, nerve };
    }
    function paint() {
      const { c, hair, nerve } = compute();
      chipEls.forEach((b, i) => b.setAttribute('aria-pressed', String(dmg.has(DMG[i].id))));
      aidB.setAttribute('aria-pressed', String(aid)); impB.setAttribute('aria-pressed', String(implant));
      aidB.textContent = aid ? 'Remove hearing aid' : 'Add hearing aid'; impB.textContent = implant ? 'Remove cochlear implant' : 'Add cochlear implant';
      svg.querySelector('#hl-wax').style.display = dmg.has('wax') ? '' : 'none';
      svg.querySelector('#hl-aid').style.display = aid ? '' : 'none';
      svg.querySelector('#hl-imp').style.display = implant ? '' : 'none';
      let x = '';
      if (dmg.has('drum')) x += '<path class="dmg" d="M120 100 L136 108 L122 116 L136 124"/>';
      if (dmg.has('oss')) x += '<path class="dmg" d="M146 84 L182 120 M182 84 L146 120"/>';
      if (dmg.has('hair')) x += '<path class="dmg" d="M222 98 L250 126 M250 98 L222 126"/>';
      if (nerve) x += '<path class="dmg" d="M300 96 L320 120 M320 96 L300 120"/>';
      svg.querySelector('#hl-dmg').innerHTML = x;
      let hs = ''; for (let i = 0; i < 9; i++) { const a = Math.PI + i * 0.9, r = 26 - i * 2.2, px = 236 + Math.cos(a) * r, py = 112 + Math.sin(a) * r; hs += hair ? `<path class="hair" d="M${px.toFixed(1)} ${py.toFixed(1)} l 5 2" style="opacity:.5"/>` : `<path class="hair" d="M${px.toFixed(1)} ${py.toFixed(1)} l 0 -6"/>`; }
      svg.querySelector('#hl-hairs').innerHTML = hs;
      meter.firstChild.style.width = (level * 100) + '%';
      meter.firstChild.style.background = level > 0.7 ? 'var(--good)' : level > 0.3 ? 'var(--warn)' : 'var(--bad)';
      pct.textContent = Math.round(level * 100) + '%';
      const s = (hair || nerve);
      let name = 'Typical hearing';
      if (c && s) name = 'Mixed hearing loss'; else if (c) name = 'Conduction deafness'; else if (s) name = 'Sensorineural deafness';
      dxName.textContent = name;
      dxName.style.color = name === 'Typical hearing' ? 'var(--good)' : 'var(--bad)';
      let txt = '', cls = '';
      if (!dmg.size) txt = aid || implant ? 'This ear works fine on its own. Doctors only use these devices when there is hearing loss. Damage a part first.' : 'All parts work: sound waves get <b>conducted</b> to the cochlea and hair cells turn them into neural impulses. Tap a part to damage it.';
      else if (nerve) { txt = 'The <b>auditory nerve</b> is damaged, so nothing reaches the brain. A hearing aid can’t help, and neither can a cochlear implant: an implant needs a working auditory nerve to stimulate.'; cls = 'bad'; }
      else if (c && !s) txt = implant ? 'An implant would bypass the problem, but it means surgery and destroys natural hearing. For conduction problems, doctors usually fix the part (clear the canal, repair the eardrum, replace the ossicles) or use a hearing aid.'
        : aid ? 'The hearing aid <b>amplifies</b> sound so more of it gets through the damaged outer or middle ear. The cochlea is healthy, so louder input works well.' : '<b>Conduction deafness</b>: the problem is in the outer or middle ear, which <b>conduct</b> sound to the cochlea. The cochlea and nerve are fine; sound just doesn’t get there. Try a fix!';
      else if (hair) txt = implant ? 'The <b>cochlear implant</b> bypasses the damaged hair cells: a mic picks up sound and electrodes in the cochlea stimulate the <b>auditory nerve</b> directly. It doesn’t sound natural at first, but the brain adapts.'
        : aid ? 'A hearing aid helps only if some hair cells still work (mild or moderate loss). With badly damaged hair cells, louder sound still has nothing to transduce it. Try the cochlear implant.' : '<b>Sensorineural deafness</b>: the hair cells (or nerve) can’t turn vibration into neural signals. Loud noise and aging are common causes, and hair cells don’t grow back. Try a fix!';
      if (level > 0.6 && dmg.size && (aid || implant)) { cls = 'good'; }
      dxCard.set(null, txt, cls);
    }
    paint();
    // flow animation
    const flow = svg.querySelector('#hl-flow');
    const pulses = []; let spawn = 0;
    const lp = SK.loop(dt => {
      spawn -= dt;
      if (spawn <= 0) { spawn = 0.55; pulses.push({ x: implant ? -1 : 6, u: 0 }); }
      let s = '';
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (implant) {
          p.u += dt * 0.45; if (p.u > 1.6) { pulses.splice(i, 1); continue; }
          if (p.u < 1) { const wire = svg.querySelector('#hl-wire'); const L = wire.getTotalLength(); const pt = wire.getPointAtLength(p.u * L); s += `<circle class="el" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4"/>`; }
          else if (!dmg.has('nerve')) { const x = 252 + (p.u - 1) / 0.6 * 120; s += `<circle class="sp" cx="${x.toFixed(1)}" cy="${(112 - (x - 252) * 0.1).toFixed(1)}" r="${(3 + stageAmp[4] * 2).toFixed(1)}"/>`; }
          continue;
        }
        p.x += dt * (api.reduceMotion ? 70 : 95);
        if (p.x > 380) { pulses.splice(i, 1); continue; }
        const x = p.x;
        let a;
        if (x < 70) a = aid ? Math.min(1.6, 1.4) : 1; else if (x < 126) a = stageAmp[0]; else if (x < 136) a = stageAmp[1]; else if (x < 200) a = stageAmp[2]; else if (x < 252) a = stageAmp[2] * (dmg.has('hair') ? 1 : 1); else a = stageAmp[4];
        a = Math.min(a, 1.6);
        if (a < 0.03) continue;
        if (x < 128) s += `<path class="wv" d="M${x.toFixed(1)} ${(112 - 12 * a).toFixed(1)} q ${6 * a} ${12 * a} 0 ${24 * a}" style="opacity:${Math.min(1, a).toFixed(2)}"/>`;
        else if (x < 200) s += `<rect class="vib" x="${(x - 3).toFixed(1)}" y="${(128 - 3).toFixed(1)}" width="${(6 * Math.min(1.3, a) + 1).toFixed(1)}" height="6" rx="2" style="opacity:${Math.min(1, a).toFixed(2)}"/>`;
        else if (x < 252) { const tt = (x - 200) / 52, ang = Math.PI + tt * 4.4 * Math.PI, r = 30 - 24 * tt; s += `<circle class="fl" cx="${(236 + Math.cos(ang) * r).toFixed(1)}" cy="${(112 + Math.sin(ang) * r).toFixed(1)}" r="${(2 + 3 * Math.min(1, a)).toFixed(1)}"/>`; }
        else s += `<circle class="sp" cx="${x.toFixed(1)}" cy="${(112 - (x - 252) * 0.1).toFixed(1)}" r="${(2.5 + 2.5 * a).toFixed(1)}"/>`;
      }
      flow.innerHTML = s;
    });
    el.append(root);
    return () => lp.stop();
  }
});
})();
