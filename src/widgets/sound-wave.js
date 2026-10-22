/* 1.6C sound-wave — amplitude/frequency visualizer, gentle tone, basilar membrane place map, pitch theories, challenge */
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
SK.css('sound-wave-style', `
.sound-wave-scope { border: 1px solid var(--line); border-radius: 14px; background: var(--surface-2); overflow: hidden; }
.sound-wave-scope canvas { display: block; width: 100%; height: 230px; }
.sound-wave-reads { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 136px), 1fr)); gap: 8px; }
.sound-wave-read { border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; background: var(--surface-2); }
.sound-wave-read span { display: block; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.sound-wave-read b { font-family: var(--f-mono); font-size: 19px; font-variant-numeric: tabular-nums; }
.sound-wave-read small { display: block; font-size: 13px; color: var(--muted); }
.sound-wave-theories { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.sound-wave-th { border: 1.5px solid var(--line); border-radius: 12px; padding: 10px 12px; background: var(--surface); font-size: 14px; transition: all .25s; opacity: .6; }
.sound-wave-th b { display: block; font-size: 15px; }
.sound-wave-th small { font-family: var(--f-mono); color: var(--muted); font-size: 12px; }
@media (max-width: 520px) { .sound-wave-th:not(.on) > div { display: none; } }
.sound-wave-th.on { opacity: 1; border-color: var(--spark); background: var(--spark-soft); box-shadow: 0 0 0 3px var(--spark-soft); }
.sound-wave-th.half { opacity: .9; border-color: var(--carolina); }
.sound-wave-strip svg { cursor: crosshair; touch-action: manipulation; }
.sound-wave-strip svg:focus-visible { outline: 3px solid var(--carolina); outline-offset: 2px; border-radius: 8px; }
.sound-wave-svg .memb { fill: color-mix(in srgb, #B79CF6 45%, var(--surface)); stroke: var(--sk-vio); stroke-width: 2; }
.sound-wave-svg .wavep { fill: none; stroke: var(--spark); stroke-width: 3; stroke-linejoin: round; }
.sound-wave-svg .sk-ts { font-size: 13px; }
`);

const LOGMIN = Math.log10(20), LOGMAX = Math.log10(20000);
const fFromS = s => Math.pow(10, LOGMIN + s / 1000 * (LOGMAX - LOGMIN));
const sFromF = f => (Math.log10(f) - LOGMIN) / (LOGMAX - LOGMIN) * 1000;
const fmtHz = f => f >= 1000 ? (f / 1000).toFixed(f >= 10000 ? 0 : 1) + ',000'.slice(0, 0) + ' kHz' : Math.round(f) + ' Hz';
const DB = [[20, 'Rustling leaves'], [35, 'Whisper'], [50, 'Quiet classroom'], [62, 'Normal conversation'], [75, 'Vacuum cleaner'], [87, 'Heavy traffic: risk with long exposure'], [100, 'Motorcycle: damage within ~15 min'], [112, 'Rock concert: damage in minutes'], [125, 'Pain threshold']];
const PITCH = f => f < 60 ? 'Deep rumble' : f < 250 ? 'Low (deep voice, bass)' : f < 1000 ? 'Middle (most speech)' : f < 4000 ? 'High (whistle, smoke alarm)' : f < 12000 ? 'Very high (cymbal shimmer)' : 'Ultra high (many adults can’t hear it)';
const CHAL = [['A bass drum', 60], ['A deep male voice', 120], ['Middle C on a piano', 262], ['A soprano singing', 1000], ['A smoke alarm', 3200], ['A cymbal shimmer', 9000], ['The highest tone most teens can hear', 17000]];

ML.registerWidget('sound-wave', {
  title: 'Make a sound wave', tag: 'Simulation',
  mount(el, api) {
    const h = api.h;
    const root = h('div', { class: 'sk-root' });
    root.append(SK.instr('Drag the sliders to change the wave. Amplitude is loudness; frequency is pitch. Press <b>Play tone</b> to hear it (it starts quiet), then find where each pitch lands in the cochlea.'));
    let dB = 60, f = 262, phase = 0;
    const cv = h('canvas', { role: 'img', 'aria-label': 'Animated sound wave with nerve firing pattern below it' });
    const scope = h('div', { class: 'sound-wave-scope' }, cv);
    const ampR = SK.range('Amplitude (loudness)', 10, 125, 1, dB, v => `${v} dB`, v => { dB = v; paint(); });
    const frqR = SK.range('Frequency (pitch)', 0, 1000, 1, sFromF(f), v => fmtHz(fFromS(v)), v => { f = fFromS(v); paint(); });
    const playB = h('button', { type: 'button', class: 'btn btn-primary' }, '▶ Play tone');
    const stopB = h('button', { type: 'button', class: 'btn', disabled: true }, '■ Stop');
    const presets = h('div', { class: 'sk-chips' });
    [['Bass', 80], ['Middle C', 262], ['Whistle', 2000], ['Very high', 9000]].forEach(([n, hz]) => { const b = h('button', { type: 'button' }, n); b.onclick = () => { frqR.set(sFromF(hz), true); api.sfx.tap(); }; presets.append(b); });
    const rLoud = h('b'), rLoudS = h('small'), rPitch = h('b'), rPitchS = h('small'), rWave = h('b'), rWaveS = h('small', null, 'shorter wave = higher pitch');
    const reads = h('div', { class: 'sound-wave-reads' },
      h('div', { class: 'sound-wave-read' }, h('span', null, 'Loudness'), rLoud, rLoudS),
      h('div', { class: 'sound-wave-read' }, h('span', null, 'Pitch'), rPitch, rPitchS),
      h('div', { class: 'sound-wave-read' }, h('span', null, 'Wavelength in air'), rWave, rWaveS));

    /* basilar strip */
    const strip = h('div', { class: 'sound-wave-strip sk-stage', style: { maxWidth: '480px' } });
    const ssvg = SK.svg('0 0 340 120', `
      <text class="sk-ts" x="6" y="14">BASILAR MEMBRANE (unrolled)</text>
      <path class="memb" d="M20 58 L320 46 L320 82 L20 70 Z"/>
      <path class="wavep" id="sw-wave" d=""/>
      <g id="sw-mark"></g><g id="sw-guess"></g>
      <text class="sk-ts" x="20" y="98" style="fill:var(--ink)">BASE: high pitches</text><text class="sk-ts" x="20" y="113">by oval window, stiff</text>
      <text class="sk-ts" x="320" y="98" text-anchor="end" style="fill:var(--ink)">APEX: low pitches</text><text class="sk-ts" x="320" y="113" text-anchor="end">tip, wide + floppy</text>
      <text class="sk-ts" x="20" y="38">20 kHz</text><text class="sk-ts" x="320" y="38" text-anchor="end">20 Hz</text>
      <rect id="sw-hit" x="10" y="24" width="320" height="66" fill="transparent"/>`, { class: 'sound-wave-svg', tabindex: '0', role: 'img', 'aria-label': 'Basilar membrane from base (high pitches) to apex (low pitches). Highlighted where the current pitch vibrates most.' });
    strip.append(ssvg);
    const X0 = 20, X1 = 320;
    const xFromF = fr => X0 + (1 - (Math.log10(fr) - LOGMIN) / (LOGMAX - LOGMIN)) * (X1 - X0);
    const fFromX = x => Math.pow(10, LOGMIN + (1 - (x - X0) / (X1 - X0)) * (LOGMAX - LOGMIN));

    /* theories */
    const thF = h('div', { class: 'sound-wave-th' }, h('b', null, 'Frequency theory'), h('small', null, 'low pitches, under ~500 Hz'), h('div', null, 'The whole membrane vibrates and the auditory nerve fires at the same rate as the wave.'));
    const thV = h('div', { class: 'sound-wave-th' }, h('b', null, 'Volley theory'), h('small', null, '~500 to 4,000 Hz'), h('div', null, 'One neuron can’t fire that fast, so groups take turns (volleys) to keep up with the wave.'));
    const thP = h('div', { class: 'sound-wave-th' }, h('b', null, 'Place theory'), h('small', null, 'high pitches'), h('div', null, 'Each pitch vibrates one place on the membrane most. The brain reads pitch from which hair cells fire.'));
    const thCard = SK.card('', '');

    /* challenge */
    const chal = h('div', { class: 'sk-panel' });
    const cQ = h('p', { style: { fontWeight: 700 } }), cFb = SK.card(null, ''); cFb.el.hidden = true;
    const cStart = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Start challenge');
    const cScore = h('span', { class: 'readout', style: { color: 'var(--carolina)' } });
    let cOn = false, cItems = [], ci = 0, cRight = 0, cursorX = 170;
    chal.append(h('div', { class: 'sk-kicker' }, 'Challenge: where on the membrane?'), cQ, h('div', { class: 'sk-row' }, cStart, cScore), cFb.el);
    cQ.textContent = 'Tap the spot on the basilar membrane that would vibrate most for each sound. (Keyboard: arrow keys, then Enter.)';
    cStart.onclick = () => { cOn = true; cItems = api.util.sample(CHAL, 5); ci = 0; cRight = 0; cFb.el.hidden = true; cStart.hidden = true; ask(); strip.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    function ask() { cScore.textContent = `${ci}/5 · ${cRight} right`; if (ci >= 5) { cOn = false; cStart.hidden = false; cStart.textContent = 'Play again'; cQ.textContent = `Done! You placed ${cRight} of 5 correctly.`; if (cRight >= 4) { api.sfx.level(); } ssvg.querySelector('#sw-guess').innerHTML = ''; return; } const [n, hz] = cItems[ci]; cQ.textContent = `${ci + 1}. ${n} (about ${hz.toLocaleString()} Hz). Where does it peak?`; ssvg.querySelector('#sw-guess').innerHTML = ''; }
    function guess(x) {
      if (!cOn) { return; }
      const [n, hz] = cItems[ci], tx = xFromF(hz), ok = Math.abs(x - tx) < 34;
      ssvg.querySelector('#sw-guess').innerHTML = `<line x1="${x}" x2="${x}" y1="30" y2="88" style="stroke:${ok ? 'var(--good)' : 'var(--bad)'};stroke-width:3"/><circle cx="${tx}" cy="64" r="9" style="fill:none;stroke:var(--good);stroke-width:3"/>`;
      cFb.el.hidden = false;
      if (ok) { cRight++; api.sfx.good(); api.addXP(2); cFb.set('Right spot!', `${n} at ${hz.toLocaleString()} Hz peaks ${hz > 2000 ? 'near the base' : hz < 300 ? 'near the apex' : 'in the middle'} (green circle).`, 'good'); }
      else { api.sfx.bad(); cFb.set('Not quite', `The green circle shows where ${hz.toLocaleString()} Hz peaks. Remember: high pitches near the <b>base</b> (oval window), low pitches toward the <b>apex</b>.`, 'bad'); }
      ci++; frqR.set(sFromF(hz), true);
      setTimeout(() => { if (cOn || ci >= 5) ask(); }, 1400);
    }
    const toSvgX = e => { const r = ssvg.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 340; };
    ssvg.addEventListener('click', e => { const x = Math.max(X0, Math.min(X1, toSvgX(e))); if (cOn) guess(x); else { frqR.set(sFromF(fFromX(x)), true); api.sfx.tap(); } });
    ssvg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); cursorX = Math.max(X0, Math.min(X1, cursorX + (e.key === 'ArrowLeft' ? -12 : 12))); ssvg.querySelector('#sw-guess').innerHTML = `<line x1="${cursorX}" x2="${cursorX}" y1="30" y2="88" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:3 3"/>`; if (!cOn) frqR.set(sFromF(fFromX(cursorX)), true); }
      else if ((e.key === 'Enter' || e.key === ' ') && cOn) { e.preventDefault(); guess(cursorX); }
    });

    root.append(scope, ampR.el, frqR.el, presets, h('div', { class: 'sk-row' }, playB, stopB), reads, strip,
      h('div', { class: 'sk-kicker' }, 'Which pitch theory explains this frequency?'), h('div', { class: 'sound-wave-theories' }, thF, thV, thP), thCard.el, chal);
    el.append(root);

    /* audio */
    let osc = null, gain = null, ac = null;
    const gainFor = d => 0.004 + Math.max(0, d - 10) / 115 * 0.05;
    function play() {
      if (!SK.soundOn()) { api.toast('Sound is off. Turn it on with the speaker button at the top.'); return; }
      ac = SK.audio(); if (!ac) return;
      stop(true);
      osc = ac.createOscillator(); gain = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, ac.currentTime); gain.gain.exponentialRampToValueAtTime(gainFor(dB), ac.currentTime + 0.15);
      osc.connect(gain).connect(ac.destination); osc.start();
      playB.disabled = true; stopB.disabled = false;
    }
    function stop(quiet) {
      if (osc && ac) { try { const t0 = ac.currentTime; gain.gain.cancelScheduledValues(t0); gain.gain.setValueAtTime(gain.gain.value, t0); gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08); osc.stop(t0 + 0.1); } catch (e) { } }
      osc = null; gain = null; playB.disabled = false; stopB.disabled = true;
    }
    playB.onclick = play; stopB.onclick = () => stop();

    function paint() {
      const dd = DB.reduce((a, b) => Math.abs(b[0] - dB) < Math.abs(a[0] - dB) ? b : a);
      rLoud.textContent = `${dB} dB`; rLoudS.textContent = dd[1];
      rPitch.textContent = fmtHz(f); rPitchS.textContent = PITCH(f);
      const wl = 343 / f; rWave.textContent = wl >= 1 ? `${wl.toFixed(1)} m` : `${(wl * 100).toFixed(wl < 0.1 ? 1 : 0)} cm`;
      thF.className = 'sound-wave-th' + (f < 500 ? ' on' : '');
      thV.className = 'sound-wave-th' + (f >= 500 && f <= 4000 ? ' on' : '');
      thP.className = 'sound-wave-th' + (f > 4000 ? ' on' : f >= 500 ? ' half' : '');
      thCard.set(null, f < 500 ? `At ${fmtHz(f)}, the nerve can fire once per wave, ${Math.round(f)} times a second. The raster above shows one neuron firing on every peak.`
        : f <= 4000 ? `At ${fmtHz(f)}, the wave is too fast for one neuron (they need a short rest after each spike). Three neurons take turns, so together they still fire on every peak. Place coding also starts to help here.`
          : `At ${fmtHz(f)}, even volleys can’t keep up. Pitch is coded by <b>where</b> the membrane vibrates most, near the base for high pitches.`);
      if (osc && ac) { osc.frequency.setTargetAtTime(f, ac.currentTime, 0.03); gain.gain.setTargetAtTime(gainFor(dB), ac.currentTime, 0.05); }
    }
    paint();

    /* draw loop */
    const g = cv.getContext('2d');
    let W = 0, H = 230, col = {}, frameN = 0;
    function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); }
    const readCols = () => { col = { ink: SK.cssVar(root, '--ink'), muted: SK.cssVar(root, '--muted'), line: SK.cssVar(root, '--line'), car: SK.cssVar(root, '--carolina'), spark: SK.cssVar(root, '--spark'), vio: SK.cssVar(root, '--sk-vio') }; };
    readCols();
    const ro = new ResizeObserver(size); ro.observe(scope);
    const waveEl = ssvg.querySelector('#sw-wave'), markEl = ssvg.querySelector('#sw-mark');
    let rnd = [];
    const lp = SK.loop(dt => {
      if (++frameN % 60 === 0 || !col.ink) readCols();
      const n = 1.5 + 20 * (Math.log10(f) - LOGMIN) / (LOGMAX - LOGMIN);
      if (!api.reduceMotion) phase += dt * (2 + n * 0.35);
      g.clearRect(0, 0, W, H);
      const mid = 70, A = 8 + (dB - 10) / 115 * 52;
      g.strokeStyle = col.line; g.lineWidth = 1; g.beginPath(); g.moveTo(0, mid); g.lineTo(W, mid); g.stroke();
      // amplitude guide
      g.setLineDash([4, 4]); g.strokeStyle = col.muted; g.beginPath(); g.moveTo(0, mid - A); g.lineTo(W, mid - A); g.moveTo(0, mid + A); g.lineTo(W, mid + A); g.stroke(); g.setLineDash([]);
      g.strokeStyle = col.car; g.lineWidth = 3; g.beginPath();
      for (let x = 0; x <= W; x += 2) { const y = mid - A * Math.sin(2 * Math.PI * n * x / W - phase); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.fillStyle = col.muted; g.font = `700 11px ${ML.fonts.mono}`;
      g.fillText('AIR PRESSURE (wave drawn slowed down)', 8, 14);
      // wavelength bracket
      const wl = W / n; if (wl > 30) { const x0 = ((phase / (2 * Math.PI)) % 1) * wl + wl * 0.25; g.strokeStyle = col.spark; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, mid - A - 8); g.lineTo(x0 + wl, mid - A - 8); g.stroke(); g.fillStyle = col.spark; g.fillText('1 wavelength', Math.min(W - 90, x0 + 4), mid - A - 12 < 24 ? 26 : mid - A - 12); }
      // raster
      const top = 150; g.fillStyle = col.muted; g.fillText(f > 4000 ? 'NEURONS FIRING (out of step with the wave)' : f >= 500 ? 'NEURONS FIRING (taking turns)' : 'NEURONS FIRING (one spike per wave)', 8, top - 8);
      const peaks = [];
      for (let k = -1; k <= n + 1; k++) { const x = ((k + 0.25) / n) * W + phase / (2 * Math.PI) * W / n; if (x >= 0 && x <= W) peaks.push([x, k]); }
      for (let r = 0; r < 3; r++) { g.strokeStyle = col.line; g.beginPath(); g.moveTo(40, top + 12 + r * 24); g.lineTo(W, top + 12 + r * 24); g.stroke(); g.fillStyle = col.muted; g.fillText('N' + (r + 1), 8, top + 16 + r * 24); }
      g.strokeStyle = col.spark; g.lineWidth = 2.5; g.beginPath();
      if (f < 500) peaks.forEach(([x]) => { if (x > 40) { g.moveTo(x, top + 2); g.lineTo(x, top + 22); } });
      else if (f <= 4000) peaks.forEach(([x, k]) => { if (x > 40) { const r = ((k % 3) + 3) % 3; g.moveTo(x, top + 2 + r * 24); g.lineTo(x, top + 22 + r * 24); } });
      else { if (frameN % 4 === 0) rnd = Array.from({ length: 12 }, () => [40 + Math.random() * (W - 40), Math.floor(Math.random() * 3)]); rnd.forEach(([x, r]) => { g.moveTo(x, top + 2 + r * 24); g.lineTo(x, top + 22 + r * 24); }); }
      g.stroke();
      // membrane
      const px = xFromF(f);
      let d = '';
      for (let x = X0; x <= X1; x += 3) {
        const env = Math.exp(-Math.pow((x - px) / (f < 500 ? 90 : 28), 2)) * (x < px ? Math.pow((x - X0) / Math.max(1, px - X0 + 1), 0.6) : 1);
        const y = 64 - (x - X0) / (X1 - X0) * 6 * 0 + Math.sin((x - X0) * 0.16 - phase * 2.4) * 12 * env * (0.4 + dB / 125);
        d += (d ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      waveEl.setAttribute('d', d);
      markEl.innerHTML = `<path d="M${px} 28 l-6 -8 h12 Z" style="fill:var(--spark)"/>`;
    });
    return () => { lp.stop(); ro.disconnect(); stop(true); };
  }
});
})();
