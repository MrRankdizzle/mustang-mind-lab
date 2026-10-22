/* 1.6D gate-control — pain signals through a spinal "gate"; rubbing, distraction, focusing; phantom limb note */
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
SK.css('gate-control-style', `
.gate-control-svg .cord { fill: color-mix(in srgb, #F1E3C8 80%, var(--surface)); stroke: var(--sk-bone-d); stroke-width: 2; }
.gate-control-svg .gray { fill: color-mix(in srgb, #C9B7D9 70%, var(--surface)); }
.gate-control-svg .small { fill: none; stroke: #D93A4E; stroke-width: 2.5; stroke-linecap: round; }
.gate-control-svg .large { fill: none; stroke: #3E5FC4; stroke-width: 6; stroke-linecap: round; }
.gate-control-svg .up { fill: none; stroke: color-mix(in srgb, #D93A4E 55%, var(--surface)); stroke-width: 4; stroke-linecap: round; }
.gate-control-svg .down { fill: none; stroke: color-mix(in srgb, #1FA971 70%, var(--surface)); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 6; }
.gate-control-svg .door { fill: var(--ink); }
.gate-control-svg .foot { fill: var(--sk-flesh); stroke: var(--sk-flesh-d); stroke-width: 2; }
.gate-control-svg .brain { fill: color-mix(in srgb, #F2B6C3 60%, var(--surface)); stroke: var(--muted); stroke-width: 2; }
.gate-control-svg .sk-ts { font-size: 13px; }
.gate-control-btns { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; }
.gate-control-btns .btn { position: relative; overflow: hidden; min-height: 48px; }
.gate-control-btns .btn i { position: absolute; left: 0; bottom: 0; height: 4px; background: currentColor; opacity: .5; width: 0; }
.gate-control-cards { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); }
`);

ML.registerWidget('gate-control', {
  title: 'The pain gate', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    root.append(SK.instr('Stub your toe to send pain signals toward the spinal “gate.” Then try rubbing it, escaping to your happy place, or focusing on the pain. Watch the gate and the pain meter.'));
    const svg = SK.svg('0 0 420 290', `
      <path class="foot" d="M16 250 C 14 222 30 206 60 204 L 110 204 C 128 204 136 214 134 226 C 132 240 120 246 104 246 L 40 252 C 28 254 18 256 16 250 Z"/>
      <circle id="gc-toe" cx="122" cy="222" r="14" style="fill:#D93A4E;opacity:0"/>
      <text class="sk-ts" x="70" y="276" text-anchor="middle">stubbed toe</text>
      <path class="large" id="gc-large" d="M118 216 C 170 196 210 188 262 186"/>
      <path class="small" id="gc-small" d="M126 228 C 176 214 214 206 262 204"/>
      <text class="sk-ts" x="252" y="176" text-anchor="end" style="fill:#3E5FC4">large fibers (touch)</text>
      <text class="sk-ts" x="150" y="238" style="fill:#D93A4E">small fibers (pain)</text>
      <rect class="cord" x="262" y="60" width="64" height="226" rx="26"/>
      <path class="gray" d="M294 80 C 280 120 280 150 294 170 C 308 150 308 120 294 80 Z M294 180 C 280 210 280 250 294 270 C 308 250 308 210 294 180 Z" style="opacity:.6"/>
      <text class="sk-ts" x="294" y="282" text-anchor="middle">spinal cord</text>
      <path class="up" d="M280 196 L280 72 C 280 50 290 40 318 38"/>
      <path class="down" id="gc-down" d="M342 50 C 316 56 310 62 310 80 L310 196"/>
      <g id="gc-gate" transform="translate(280 204)"><circle cx="0" cy="-18" r="3" style="fill:var(--muted)"/><circle cx="0" cy="18" r="3" style="fill:var(--muted)"/><rect class="door" id="gc-d1" x="-2.5" y="-18" width="5" height="17" rx="2"/><rect class="door" id="gc-d2" x="-2.5" y="1" width="5" height="17" rx="2"/><circle r="22" style="fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:3 4"/></g>
      <text class="sk-t" id="gc-gtext" x="200" y="266" text-anchor="middle" style="font-size:13px">gate 70% open</text>
      <g transform="translate(360 40)"><path class="brain" d="M-40 6 C -42 -22 -16 -34 6 -32 C 30 -30 44 -16 42 6 C 40 24 22 30 2 28 C -14 34 -38 28 -40 6 Z"/></g>
      <text class="sk-ts" x="360" y="86" text-anchor="middle">brain</text>
      <g id="gc-meter" transform="translate(394 104)"><rect x="-10" y="0" width="20" height="150" rx="10" style="fill:var(--surface-2);stroke:var(--line)"/><rect id="gc-fill" x="-10" y="150" width="20" height="0" rx="10" style="fill:#D93A4E"/></g>
      <text class="sk-ts" x="394" y="270" text-anchor="middle">pain</text><text class="sk-t" id="gc-num" x="394" y="98" text-anchor="middle" style="font-size:15px">0</text>
      <g id="gc-dots"></g>`, { class: 'gate-control-svg', role: 'img', 'aria-label': 'Pain signals travel from a stubbed toe along small fibers to a gate in the spinal cord; signals that pass go up to the brain. Large touch fibers and signals from the brain can close the gate.' });
    const stage = h('div', { class: 'sk-stage', style: { maxWidth: '560px' } }, svg);
    const mk = (txt, cls) => { const b = h('button', { type: 'button', class: 'btn ' + (cls || '') }, txt, h('i')); return b; };
    const ouch = mk('Stub your toe!', 'btn-spark'), rub = mk('Rub it'), happy = mk('Happy place (distraction)'), focus = mk('Focus on the pain');
    const card = SK.card('Ready', 'Press <b>Stub your toe!</b> to start the pain signals.');
    root.append(stage, h('div', { class: 'gate-control-btns' }, ouch, rub, happy, focus), card.el,
      h('div', { class: 'gate-control-cards' },
        h('div', { class: 'sk-card' }, h('h4', null, 'Closing the gate in real life'), h('p', null, 'Massage, ice, and electrical stimulation activate large fibers. Distraction, relaxation, hypnosis, and even placebos work through signals from the brain. Burn patients playing a snowy virtual reality game during wound care report much less pain, and brain scans show less pain activity.')),
        h('div', { class: 'sk-card' }, h('h4', null, 'Phantom limb sensation'), h('p', null, 'After an amputation, many people still feel the missing limb, even pain in it. The brain’s map of the body (in the somatosensory cortex) still includes the limb, and it can “misfire” and create feelings as if the limb were there. Pain is made by the brain, not just the body.'))));
    let hurt = false, open = 0.7, target = 0.7, rubT = 0, happyT = 0, focusT = 0, pain = 0;
    const DUR = 5;
    ouch.onclick = () => { hurt = !hurt; ouch.firstChild.textContent = hurt ? 'Heal the toe' : 'Stub your toe!'; ouch.classList.toggle('btn-spark', !hurt); if (hurt) { api.sfx.bad(); card.set('Ouch!', 'Nociceptors in your toe fire. Pain signals race along the <b>small fibers</b> to the spinal cord. The gate is partly open, so many get through to your brain.', 'spark'); } else { rubT = happyT = focusT = 0; card.set('Healed', 'No more pain signals. Stub it again to try the gate controls.'); } };
    rub.onclick = () => { if (!hurt) return needHurt(); rubT = DUR; focusT = 0; api.sfx.tap(); card.set('Rubbing it', 'Rubbing fires the <b>large fibers</b> (touch and pressure). Their signals reach the gate and <b>close it</b>, so fewer pain signals get through. That’s why you grab your stubbed toe!', 'good'); api.addXP(1); };
    happy.onclick = () => { if (!hurt) return needHurt(); happyT = DUR; focusT = 0; api.sfx.tap(); card.set('Distraction', 'Thinking about something pleasant sends signals <b>down from the brain</b> that help <b>close the gate</b>. Same toe, same damage, less pain felt.', 'good'); api.addXP(1); };
    focus.onclick = () => { if (!hurt) return needHurt(); focusT = DUR; rubT = happyT = 0; api.sfx.tap(); card.set('Focusing on it', 'Worrying about and paying attention to pain sends signals from the brain that <b>open the gate wider</b>. More pain signals reach the brain, so it hurts more.', 'bad'); };
    function needHurt() { api.toast('Stub your toe first!'); }
    const dotsG = svg.querySelector('#gc-dots');
    const smallP = svg.querySelector('#gc-small'), largeP = svg.querySelector('#gc-large'), downP = svg.querySelector('#gc-down');
    const upPts = [[280, 196], [280, 72], [300, 44], [318, 38]];
    const Ls = smallP.getTotalLength(), Ll = largeP.getTotalLength(), Ld = downP.getTotalLength();
    let dots = [], sp = 0, lpT = 0, dpT = 0, arrivals = 0, rateS = 0;
    const lp = SK.loop(dt => {
      rubT = Math.max(0, rubT - dt); happyT = Math.max(0, happyT - dt); focusT = Math.max(0, focusT - dt);
      target = 0.7; if (rubT > 0) target -= 0.42; if (happyT > 0) target -= 0.38; if (focusT > 0) target = 1;
      target = Math.max(0.08, target);
      open += (target - open) * (1 - Math.exp(-dt * 3));
      [[rub, rubT], [happy, happyT], [focus, focusT]].forEach(([b, t]) => { b.lastChild.style.width = (t / DUR * 100) + '%'; });
      // spawn
      sp -= dt; lpT -= dt; dpT -= dt;
      if (hurt && sp <= 0) { sp = 0.16; dots.push({ k: 's', u: 0 }); }
      if (rubT > 0 && lpT <= 0) { lpT = 0.12; dots.push({ k: 'l', u: 0 }); }
      if ((happyT > 0 || focusT > 0) && dpT <= 0) { dpT = 0.2; dots.push({ k: 'd', u: 0 }); }
      let s = '';
      dots = dots.filter(d => {
        if (d.k === 's') { d.u += dt * 260; if (d.u < Ls) { const p = smallP.getPointAtLength(d.u); s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" style="fill:#D93A4E"/>`; return true; } if (d.pass === undefined) d.pass = Math.random() < open; if (!d.pass) { d.fade = (d.fade || 0) + dt; if (d.fade < 0.25) s += `<circle cx="${270 - d.fade * 20}" cy="${210 + d.fade * 30}" r="4" style="fill:#D93A4E;opacity:${(1 - d.fade * 4).toFixed(2)}"/>`; return d.fade < 0.25; } d.v = (d.v || 0) + dt * 1.1; if (d.v >= 1) { arrivals++; return false; } const seg = d.v * 3, i = Math.min(2, Math.floor(seg)), k = seg - i; const x = upPts[i][0] + (upPts[i + 1][0] - upPts[i][0]) * k, y = upPts[i][1] + (upPts[i + 1][1] - upPts[i][1]) * k; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" style="fill:#D93A4E"/>`; return true; }
        if (d.k === 'l') { d.u += dt * 300; if (d.u >= Ll) return false; const p = largeP.getPointAtLength(d.u); s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" style="fill:#3E5FC4"/>`; return true; }
        if (d.k === 'd') { d.u += dt * 200; if (d.u >= Ld) return false; const p = downP.getPointAtLength(d.u); s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" style="fill:${focusT > 0 ? '#E08A1E' : '#1FA971'}"/>`; return true; }
        return false;
      });
      dotsG.innerHTML = s;
      // pain meter: smoothed arrival rate
      rateS = rateS * Math.exp(-dt / 1.2) + arrivals / 1.2; arrivals = 0;
      pain = Math.min(10, rateS / 6.25 * 10);
      const pv = Math.max(0, Math.min(10, pain));
      svg.querySelector('#gc-fill').setAttribute('y', (150 - pv * 15).toFixed(1)); svg.querySelector('#gc-fill').setAttribute('height', (pv * 15).toFixed(1));
      svg.querySelector('#gc-num').textContent = pv.toFixed(0);
      const ang = open * 75;
      svg.querySelector('#gc-d1').setAttribute('transform', `rotate(${-ang} 0 -18)`); svg.querySelector('#gc-d2').setAttribute('transform', `rotate(${ang} 0 18)`);
      svg.querySelector('#gc-gtext').textContent = `gate ${Math.round(open * 100)}% open`;
      svg.querySelector('#gc-toe').style.opacity = hurt ? (0.35 + 0.25 * Math.sin(performance.now() / 200)).toFixed(2) : '0';
    });
    el.append(root);
    return () => lp.stop();
  }
});
})();
