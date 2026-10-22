/* 1.6A hidden-ducks — top-down processing puzzle ("CDEDBD DUCKS?") */
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
const LINES = [
  { groups: [{ code: 'CDEDBD', say: ['see', 'dee', 'ee', 'dee', 'bee', 'dee'] }, { word: 'DUCKS?' }], plain: 'See the itty-bitty ducks?' },
  { groups: [{ code: 'MR', say: ['em', 'ar'] }, { word: 'NOT' }, { word: 'DUCKS!' }], plain: 'Them are not ducks!' },
  { groups: [{ code: 'OSAR.', say: ['oh', 'ess', 'ay', 'ar', ''] }, { code: 'CDEDBD', say: ['see', 'dee', 'ee', 'dee', 'bee', 'dee'] }, { word: 'WINGS?' }], plain: 'Oh yes they are. See the itty-bitty wings?' },
  { groups: [{ code: 'YIB,', say: ['why', 'eye', 'bee', ''] }, { code: 'MR', say: ['em', 'ar'] }, { word: 'DUCKS!' }], plain: 'Why, I be, them are ducks!' }
];
SK.css('hidden-ducks-style', `
.hidden-ducks-lines { display: grid; gap: 12px; }
.hidden-ducks-line { border: 1px solid var(--line); border-radius: 16px; padding: 12px; background: var(--surface-2); display: grid; gap: 10px; transition: border-color .3s, background .3s; }
.hidden-ducks-line.solved { border-color: var(--good); background: var(--good-soft); }
.hidden-ducks-tiles { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: flex-start; }
.hidden-ducks-group { display: flex; gap: 3px; }
.hidden-ducks-tile { width: 30px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.hidden-ducks-tile b { width: 30px; height: 36px; border-radius: 7px; display: grid; place-items: center; font-family: var(--f-mono); font-size: 20px; font-weight: 700;
  background: var(--surface); border: 1.5px solid var(--line); box-shadow: 0 2px 0 var(--line); color: var(--ink); transition: transform .18s, background .18s, border-color .18s; }
.hidden-ducks-group.code b { border-color: var(--carolina); color: var(--carolina); }
.hidden-ducks-tile small { font-family: var(--f-mono); font-size: 11.5px; font-weight: 700; color: var(--spark); min-height: 16px; opacity: 0; transform: translateY(-4px); transition: opacity .2s, transform .2s; white-space: nowrap; }
.hidden-ducks-tile.said small { opacity: 1; transform: none; }
.hidden-ducks-tile.now b { transform: translateY(-5px) scale(1.08); background: var(--spark-soft); border-color: var(--spark); color: var(--spark); }
.hidden-ducks-group.word .hidden-ducks-tile.now b { background: var(--carolina-soft); border-color: var(--carolina); color: var(--carolina); }
.hidden-ducks-sound { font-family: var(--f-mono); font-size: 14px; color: var(--spark); font-weight: 700; min-height: 0; }
.hidden-ducks-plain { font-size: 20px; font-weight: 700; color: var(--blank); }
.hidden-ducks-plain.fade-in { animation: fadeIn .4s ease both; }
.hidden-ducks-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.hidden-ducks-paths { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); }
.hidden-ducks-path { border-radius: 14px; padding: 12px; border: 1px solid var(--line); background: var(--surface); display: grid; gap: 8px; }
.hidden-ducks-path h5 { margin: 0; font-size: 15px; }
.hidden-ducks-flow { display: flex; flex-direction: column; gap: 4px; font-size: 14.5px; }
.hidden-ducks-flow span { border-radius: 9px; padding: 5px 9px; background: var(--surface-2); border: 1px solid var(--line); }
.hidden-ducks-flow i { font-style: normal; color: var(--muted); text-align: center; line-height: 1; font-size: 13px; }
.hidden-ducks-progress { font-family: var(--f-mono); font-weight: 700; color: var(--carolina); font-size: 14px; }
@media (max-width: 420px) { .hidden-ducks-tile, .hidden-ducks-tile b { width: 25px; } .hidden-ducks-tile b { height: 32px; font-size: 17px; } .hidden-ducks-tiles { gap: 6px 10px; } .hidden-ducks-plain { font-size: 18px; } }
.reduce-motion .hidden-ducks-tile b, .reduce-motion .hidden-ducks-tile small { transition: none; }
`);

ML.registerWidget('hidden-ducks', {
  title: 'The hidden message', tag: 'Puzzle',
  mount(el, api) {
    const h = api.h;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const root = h('div', { class: 'sk-root' });
    root.append(SK.instr('Try to read the hidden message on your own first. Stuck? Tap <b>Read it out loud</b> and say each letter name fast.'));
    const prog = h('span', { class: 'hidden-ducks-progress' });
    const solved = new Set();
    const lineWrap = h('div', { class: 'hidden-ducks-lines' });
    let speaking = false;
    const rows = LINES.map((L, li) => {
      const tilesEls = [];
      const tiles = h('div', { class: 'hidden-ducks-tiles', 'aria-label': `Line ${li + 1}: ` + L.groups.map(g => g.code || g.word).join(' ') });
      L.groups.forEach(g => {
        const grp = h('div', { class: 'hidden-ducks-group ' + (g.code ? 'code' : 'word'), 'aria-hidden': 'true' });
        const txt = g.code || g.word;
        [...txt].forEach((ch, ci) => {
          const say = g.code ? (g.say[ci] || '') : '';
          const t = h('div', { class: 'hidden-ducks-tile' }, h('b', null, ch), h('small', null, say));
          t._say = say; t._group = g; grp.append(t); tilesEls.push(t);
        });
        tiles.append(grp);
      });
      const sound = h('div', { class: 'hidden-ducks-sound', 'aria-live': 'polite' });
      const plain = h('div', { class: 'hidden-ducks-plain', hidden: true }, `“${L.plain}”`);
      const hint = h('button', { type: 'button', class: 'btn btn-sm' }, 'Read it out loud');
      const reveal = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Reveal');
      const row = h('div', { class: 'hidden-ducks-line' }, tiles, sound, plain, h('div', { class: 'hidden-ducks-btns' }, hint, reveal));
      hint.onclick = () => readOut(li);
      reveal.onclick = () => doReveal(li);
      return { row, tilesEls, sound, plain, hint, reveal, L };
    });
    rows.forEach(r => lineWrap.append(r.row));

    function speak(text) {
      if (!SK.soundOn() || !('speechSynthesis' in window)) return;
      try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.volume = 0.8; speechSynthesis.speak(u); } catch (e) { /* no speech */ }
    }
    function readOut(li) {
      const r = rows[li];
      if (speaking) return;
      speaking = true; r.hint.disabled = true;
      r.tilesEls.forEach(t => t.classList.remove('said', 'now'));
      const step = api.reduceMotion ? 120 : 380;
      const parts = [];
      // speak letter names for code groups, words as words
      speak(r.L.groups.map(g => g.code ? [...g.code.replace(/[^A-Z]/g, '')].join(' ') : g.word.replace(/[^A-Za-z]/g, '').toLowerCase()).join(', '));
      let k = 0;
      r.L.groups.forEach(g => {
        const ts = r.tilesEls.filter(t => t._group === g);
        if (g.code) ts.forEach(t => { if (!t._say) return; const at = k++; later(() => { r.tilesEls.forEach(x => x.classList.remove('now')); t.classList.add('now', 'said'); api.sfx.tone(520 + at * 40, 0.06, 'triangle', 0.05); parts.push(t._say); r.sound.textContent = parts.join('-'); }, at * step); });
        else { const at = k++; later(() => { r.tilesEls.forEach(x => x.classList.remove('now')); ts.forEach(t => t.classList.add('now')); parts.push(g.word.toLowerCase()); r.sound.textContent = parts.join('-'); }, at * step); }
      });
      later(() => { r.tilesEls.forEach(x => x.classList.remove('now')); r.sound.textContent = 'Sounds like: ' + parts.join(' ').replace(/ /g, ' · '); speaking = false; r.hint.disabled = false; }, k * step + 200);
    }
    function doReveal(li) {
      const r = rows[li];
      if (solved.has(li)) return;
      solved.add(li); r.plain.hidden = false; r.plain.classList.add('fade-in'); r.row.classList.add('solved');
      r.reveal.disabled = true; r.reveal.textContent = 'Decoded';
      r.tilesEls.forEach(t => t.classList.add('said'));
      api.sfx.good(); api.addXP(1);
      paintProg();
      if (solved.size === LINES.length) later(showEnd, 300);
    }
    function paintProg() { prog.textContent = `Decoded ${solved.size}/${LINES.length}`; }
    paintProg();

    const revealAll = h('button', { type: 'button', class: 'btn btn-sm btn-ghost' }, 'Reveal all');
    revealAll.onclick = () => LINES.forEach((_, i) => doReveal(i));
    const end = h('div', { class: 'sk-panel', hidden: true });
    function showEnd() {
      if (!end.hidden) return;
      end.hidden = false; end.classList.add('fade-in');
      const r = root.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + r.height / 2, 50);
      const fb = SK.card(null, '');
      fb.el.hidden = true;
      const q = h('div', { class: 'sk-row' });
      const bU = h('button', { type: 'button', class: 'btn btn-sm' }, 'Bottom-up');
      const bT = h('button', { type: 'button', class: 'btn btn-sm' }, 'Top-down');
      bU.onclick = () => { fb.el.hidden = false; api.sfx.bad(); fb.set('Not quite', 'Bottom-up is how you started: staring at raw letters with no idea what they meant. Once you knew the trick, your <b>expectations</b> took over. That is top-down.', 'bad'); };
      bT.onclick = () => { fb.el.hidden = false; api.sfx.good(); fb.set('Yes: top-down!', 'Knowing the pattern (“say the letter names”) and expecting a joke about ducks let your brain turn letters into words almost instantly.', 'good'); bT.disabled = bU.disabled = true; api.addXP(2); };
      end.append(
        h('div', { class: 'sk-kicker' }, 'What just happened in your brain?'),
        h('p', null, 'The letters on the screen never changed. What changed was ', h('b', null, 'you'), ': once you knew the pattern, the same letters suddenly became words.'),
        h('div', { class: 'hidden-ducks-paths' },
          h('div', { class: 'hidden-ducks-path' }, h('h5', null, 'Bottom-up processing'),
            h('p', { class: 'sk-note' }, 'Starts with raw sensory data and builds up.'),
            h('div', { class: 'hidden-ducks-flow' }, h('span', null, 'Eyes detect shapes: C, D, E, D, B, D'), h('i', null, '▼'), h('span', null, 'Letters'), h('i', null, '▼'), h('span', null, '“CDEDBD”? Not a word…'))),
          h('div', { class: 'hidden-ducks-path' }, h('h5', null, 'Top-down processing'),
            h('p', { class: 'sk-note' }, 'Starts with experience and expectations and works down.'),
            h('div', { class: 'hidden-ducks-flow' }, h('span', null, 'Knowledge: “say each letter name”'), h('i', null, '▼'), h('span', null, 'Expectation: a silly duck joke'), h('i', null, '▼'), h('span', null, '“See the itty-bitty ducks?”')))),
        h('p', { style: { fontWeight: 700 } }, 'Quick check: after you learned the trick, which kind of processing were you using?'), q, fb.el);
      q.append(bU, bT);
    }
    root.append(h('div', { class: 'sk-row', style: { justifyContent: 'space-between' } }, prog, revealAll), lineWrap, end);
    el.append(root);
    return () => { timers.forEach(clearTimeout); timers.clear(); try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { } };
  }
});
})();
