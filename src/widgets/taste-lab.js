/* 1.6D taste-lab — sort foods into basic tastes, taster types, hold-your-nose flavor demo, smell pathway */
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
SK.css('taste-lab-style', `
.taste-lab-tray { display: flex; flex-wrap: wrap; gap: 8px; min-height: 56px; padding: 10px; border-radius: 14px; background: var(--surface-2); border: 1.5px dashed var(--line); }
.taste-lab-food { display: inline-flex; align-items: center; gap: 6px; border: 1.5px solid var(--line); background: var(--surface); border-radius: 12px; padding: 5px 10px 5px 6px; font-weight: 700; font-size: 15px; cursor: grab; touch-action: none; user-select: none; color: var(--ink); }
.taste-lab-food svg { width: 30px; height: 30px; flex: none; }
.taste-lab-food[aria-pressed="true"] { border-color: var(--spark); box-shadow: 0 0 0 3px var(--spark-soft); }
.taste-lab-food.dragging { position: fixed; z-index: 999; pointer-events: none; box-shadow: var(--shadow); }
.taste-lab-food.placed { cursor: default; border-color: var(--good); background: var(--good-soft); padding: 3px 8px 3px 4px; font-size: 13px; }
.taste-lab-food.placed svg { width: 22px; height: 22px; }
.taste-lab-food.shake { animation: shake .4s; }
.taste-lab-bins { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); }
.taste-lab-bin { border: 2px solid var(--line); border-radius: 14px; padding: 8px 10px; min-height: 92px; background: var(--surface); cursor: pointer; display: flex; flex-direction: column; gap: 6px; text-align: left; font: inherit; color: var(--ink); }
.taste-lab-bin.hot, .taste-lab-bin:hover { border-color: var(--carolina); background: var(--carolina-soft); }
.taste-lab-bin b { font-size: 16px; }
.taste-lab-bin small { font-size: 13px; color: var(--muted); }
.taste-lab-bin .why { font-size: 13px; color: var(--good); font-weight: 700; }
.taste-lab-bin .items { display: flex; flex-wrap: wrap; gap: 4px; }
.taste-lab-tongue { display: grid; grid-template-columns: 170px 1fr; gap: 14px; align-items: center; }
@media (max-width: 480px) { .taste-lab-tongue { grid-template-columns: 1fr; justify-items: center; } }
.taste-lab-bars { display: grid; gap: 8px; width: 100%; }
.taste-lab-bar { display: grid; grid-template-columns: 118px 1fr 62px; gap: 8px; align-items: center; font-size: 14px; font-weight: 700; }
.taste-lab-bar .sk-meter i { transition: width .5s ease; }
.taste-lab-flavor { font-size: 24px; font-weight: 700; text-align: center; padding: 8px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.taste-lab-path .sig { fill: var(--spark); filter: drop-shadow(0 0 4px var(--spark)); }
.taste-lab-path .node { fill: var(--surface-2); stroke: var(--line); stroke-width: 1.5; }
.taste-lab-path .node.smell { stroke: var(--spark); }
.taste-lab-path .node.th { stroke: var(--sk-gold); stroke-width: 2.5; }
.taste-lab-path .sk-ts { font-size: 12.5px; fill: var(--ink); }
`);

const ICON = {
  honey: '<rect x="6" y="9" width="20" height="19" rx="5" fill="#E9A21B"/><rect x="8" y="5" width="16" height="6" rx="2" fill="#8D5A2B"/><path d="M11 18 h10" stroke="#FFE08A" stroke-width="2.5" stroke-linecap="round"/>',
  lemon: '<ellipse cx="16" cy="16" rx="12" ry="9" fill="#F7D02A"/><path d="M3 16 l3 -1 v2 Z M29 16 l-3 -1 v2 Z" fill="#E2B511"/><ellipse cx="12" cy="13" rx="3" ry="1.6" fill="#FFF3A6"/>',
  chips: '<path d="M5 18 C 8 8 22 6 27 13 C 25 22 12 27 5 18 Z" fill="#E8B54C"/><circle cx="12" cy="15" r="1" fill="#fff"/><circle cx="18" cy="17" r="1" fill="#fff"/><circle cx="15" cy="12" r="1" fill="#fff"/>',
  coffee: '<rect x="6" y="10" width="16" height="16" rx="3" fill="#F2F2F2" stroke="#7A4A2A" stroke-width="2"/><rect x="8" y="12" width="12" height="4" fill="#4B2A14"/><path d="M22 14 h3 a3 3 0 0 1 0 7 h-3" fill="none" stroke="#7A4A2A" stroke-width="2"/><path d="M11 7 q2 -3 0 -5 M16 7 q2 -3 0 -5" stroke="#9AA" stroke-width="1.5" fill="none"/>',
  cheese: '<path d="M4 22 L26 10 L28 22 Z" fill="#F6CF4A" stroke="#C99A12" stroke-width="1.5"/><circle cx="14" cy="19" r="1.8" fill="#D9A915"/><circle cx="22" cy="17" r="1.3" fill="#D9A915"/>',
  broth: '<path d="M4 15 h24 a12 10 0 0 1 -24 0 Z" fill="#C9852C"/><rect x="3" y="13" width="26" height="3" rx="1.5" fill="#8C5A1C"/><path d="M11 10 q2 -3 0 -6 M16 10 q2 -3 0 -6 M21 10 q2 -3 0 -6" stroke="#9AA" stroke-width="1.5" fill="none"/>',
  bacon: '<path d="M3 20 C 9 12 13 24 19 16 C 23 11 26 14 29 10 L29 16 C 26 20 23 17 19 22 C 13 30 9 18 3 26 Z" fill="#D8574B"/><path d="M4 23 C 9 16 13 27 19 19 C 23 14 26 17 29 13" stroke="#F8D3C5" stroke-width="2" fill="none"/>',
  kale: '<path d="M16 28 C 6 24 4 12 10 5 C 14 9 18 9 22 5 C 28 12 26 24 16 28 Z" fill="#3E8E41"/><path d="M16 28 V8" stroke="#A5D6A7" stroke-width="1.5"/>'
};
const FOODS = [
  { id: 'honey', n: 'Honey', b: 0 }, { id: 'lemon', n: 'Lemon', b: 1 }, { id: 'chips', n: 'Potato chips', b: 2 }, { id: 'coffee', n: 'Black coffee', b: 3 },
  { id: 'cheese', n: 'Parmesan', b: 4 }, { id: 'broth', n: 'Chicken broth', b: 4 }, { id: 'bacon', n: 'Bacon fat', b: 5 }, { id: 'kale', n: 'Raw kale', b: 3 }
];
const BINS = [
  { n: 'Sweet', s: 'sugars', why: 'Signals energy-rich food' },
  { n: 'Sour', s: 'acids', why: 'Warns of spoiled or unripe food' },
  { n: 'Salty', s: 'sodium', why: 'Sodium keeps nerves and muscles working' },
  { n: 'Bitter', s: 'many plant chemicals', why: 'Warns of possible toxins' },
  { n: 'Umami', s: 'savory (glutamate)', why: 'Signals proteins' },
  { n: 'Oleogustus', s: 'fat (proposed 6th taste)', why: 'Signals calorie-dense fat' }
];
const icon = id => `<svg viewBox="0 0 32 32" aria-hidden="true">${ICON[id]}</svg>`;

ML.registerWidget('taste-lab', {
  title: 'Taste lab', tag: 'Interactive',
  mount(el, api) {
    const h = api.h;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const root = h('div', { class: 'sk-root' });
    const tabs = SK.seg([{ v: 'sort', label: 'Sort the tastes' }, { v: 'taster', label: 'Taster types' }, { v: 'nose', label: 'Hold your nose' }], 'sort', v => { pSort.hidden = v !== 'sort'; pTaster.hidden = v !== 'taster'; pNose.hidden = v !== 'nose'; }, 'Activity');
    root.append(SK.instr('Drag each food into its basic taste (or tap a food, then tap a taste). Then compare taster types and find out what your nose does for flavor.'), tabs.el);

    /* ---------- sort ---------- */
    const pSort = h('div', { class: 'sk-root' });
    const tray = h('div', { class: 'taste-lab-tray', 'aria-label': 'Foods to sort' });
    const sortCard = SK.card(null, 'Each taste is a survival signal. Sort a food to reveal what its taste tells your body.');
    let selected = null, placed = 0;
    const bins = BINS.map((B, i) => {
      const items = h('div', { class: 'items' }), why = h('div', { class: 'why', hidden: true }, B.why);
      const bin = h('button', { type: 'button', class: 'taste-lab-bin', 'data-i': i, 'aria-label': `${B.n} (${B.s})` }, h('b', null, B.n), h('small', null, B.s), why, items);
      bin._items = items; bin._why = why;
      bin.onclick = e => { if (e.target.closest('.taste-lab-food')) return; if (selected) drop(selected, i); };
      return bin;
    });
    const foods = api.util.shuffle(FOODS).map(F => {
      const tok = h('button', { type: 'button', class: 'taste-lab-food', 'aria-pressed': 'false', 'aria-label': F.n });
      tok.innerHTML = icon(F.id) + `<span>${F.n}</span>`;
      tok._f = F;
      tok.onclick = () => { if (tok.dataset.dragged || tok.classList.contains('placed')) return; foods.forEach(t => t.setAttribute('aria-pressed', 'false')); if (selected === tok) { selected = null; return; } selected = tok; tok.setAttribute('aria-pressed', 'true'); api.sfx.tap(); sortCard.set(null, `Now tap the taste for <b>${F.n}</b>.`); };
      api.makeDraggable(tok, () => bins, bin => drop(tok, +bin.dataset.i));
      tray.append(tok); return tok;
    });
    function drop(tok, i) {
      if (tok.classList.contains('placed')) return;
      const F = tok._f; selected = null; tok.setAttribute('aria-pressed', 'false');
      if (F.b === i) {
        tok.classList.add('placed'); tok.disabled = true; bins[i]._items.append(tok); bins[i]._why.hidden = false; placed++;
        api.sfx.good(); api.addXP(1);
        sortCard.set(`${F.n} → ${BINS[i].n}`, `${BINS[i].why}.${i === 5 ? ' Scientists proposed fat as a sixth basic taste in 2015; it is still being studied.' : ''}`, 'good');
        if (placed === FOODS.length) later(() => { sortCard.set('All sorted!', 'Five basic tastes (sweet, sour, salty, bitter, umami) plus proposed oleogustus. Taste receptors in your taste buds detect chemicals dissolved in saliva, and each taste nudges you toward food that helps you survive or away from food that might hurt you.', 'good'); api.sfx.level(); const r = root.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 60, 50); }, 600);
      } else {
        api.sfx.bad(); tok.classList.remove('shake'); void tok.offsetWidth; tok.classList.add('shake');
        sortCard.set('Try another taste', `${F.n} is not mainly ${BINS[i].n.toLowerCase()}. ${F.id === 'cheese' || F.id === 'broth' ? 'Think savory and protein-rich.' : F.id === 'bacon' ? 'Think about the fat, not the salt.' : F.id === 'kale' || F.id === 'coffee' ? 'Many people find this one hard to like at first. Why?' : ''}`, 'bad');
      }
    }
    pSort.append(tray, h('div', { class: 'taste-lab-bins' }, bins), sortCard.el);

    /* ---------- taster types ---------- */
    const pTaster = h('div', { class: 'sk-root', hidden: true });
    const TT = [
      { n: 'Nontaster', dots: 9, bitter: 0.2, pop: 'about 25% of people', txt: 'Fewer taste buds. Bitter foods like black coffee or broccoli taste mild, so nontasters often enjoy them.' },
      { n: 'Medium taster', dots: 22, bitter: 0.55, pop: 'about 50% of people', txt: 'An average number of taste buds. Most people are here.' },
      { n: 'Supertaster', dots: 44, bitter: 1, pop: 'about 25% of people', txt: 'Many more taste buds. Bitter tastes are intense, so supertasters often avoid bitter vegetables, black coffee, and grapefruit.' }
    ];
    const tCv = SK.svg('0 0 170 170', '', { role: 'img', 'aria-label': 'Magnified patch of tongue' });
    const tSl = SK.range('Taster type', 0, 2, 1, 1, v => TT[v].n, v => paintT(v));
    const bBar = h('div', { class: 'sk-meter', style: { height: '18px' } }, h('i')), sBar = h('div', { class: 'sk-meter', style: { height: '18px' } }, h('i'));
    const bVal = h('span', { class: 'readout' }), sVal = h('span', { class: 'readout' });
    const tCard = SK.card('', '');
    pTaster.append(tSl.el, h('div', { class: 'taste-lab-tongue' }, h('div', { class: 'sk-stage', style: { maxWidth: '170px' } }, tCv),
      h('div', { class: 'taste-lab-bars' }, h('div', { class: 'sk-kicker' }, 'How strong does black coffee taste?'),
        h('div', { class: 'taste-lab-bar' }, h('span', null, 'Bitterness'), bBar, bVal), h('div', { class: 'taste-lab-bar' }, h('span', null, 'Sweetness of candy'), sBar, sVal))), tCard.el,
      h('p', { class: 'sk-note' }, 'The magnified circle is like the blue-dye test: pink bumps (fungiform papillae) hold your taste buds. More bumps, more taste receptors.'));
    function paintT(v) {
      const T = TT[v];
      let s = `<circle cx="85" cy="78" r="74" style="fill:color-mix(in srgb,#3B6FD8 70%,var(--surface));stroke:var(--line);stroke-width:3"/>`;
      let seed = 5 + v; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const pts = []; let tries = 0;
      while (pts.length < T.dots && tries++ < 4000) { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * 64, x = 85 + Math.cos(a) * r, y = 78 + Math.sin(a) * r; if (pts.every(p => Math.hypot(p[0] - x, p[1] - y) > 16)) pts.push([x, y]); }
      pts.forEach(([x, y]) => { s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" style="fill:#F4A7B9;stroke:#D7708B;stroke-width:1.5"/>`; });
      s += `<text class="sk-t" x="85" y="167" text-anchor="middle" style="font-size:13px">${T.dots} papillae</text>`;
      tCv.innerHTML = s;
      bBar.firstChild.style.width = (T.bitter * 100) + '%'; bBar.firstChild.style.background = 'var(--good)';
      sBar.firstChild.style.width = (35 + v * 25) + '%';
      bVal.textContent = ['mild', 'strong', 'intense!'][v]; sVal.textContent = ['sweet', 'sweeter', 'very'][v];
      bBar.firstChild.style.background = v === 2 ? 'var(--bad)' : v === 1 ? 'var(--warn)' : 'var(--good)';
      tCard.set(`${T.n}: ${T.pop}`, T.txt);
    }
    paintT(1);

    /* ---------- hold your nose ---------- */
    const pNose = h('div', { class: 'sk-root', hidden: true });
    let pinch = false;
    const BEANS = [{ n: 'Cherry', c: '#D6283A', taste: [0.8, 0.25] }, { n: 'Lime', c: '#7CC242', taste: [0.7, 0.55] }, { n: 'Cinnamon', c: '#B5562B', taste: [0.7, 0.05] }];
    let bean = 0;
    const beanSeg = SK.seg(BEANS.map((b, i) => ({ v: i, label: b.n + ' jelly bean' })), 0, v => { bean = v; chew(); }, 'Jelly bean');
    const pinchB = h('button', { type: 'button', class: 'btn btn-primary', 'aria-pressed': 'false' }, 'Hold your nose');
    const face = SK.svg('0 0 300 200', '', { role: 'img', 'aria-label': 'Side view of a head eating a jelly bean; aroma travels from the mouth up the back of the throat to the nose' });
    const bars = {}; const barRow = (k, label) => { const m = h('div', { class: 'sk-meter', style: { height: '16px' } }, h('i')), v = h('span', { class: 'readout' }); bars[k] = [m, v]; return h('div', { class: 'taste-lab-bar' }, h('span', null, label), m, v); };
    const flavor = h('div', { class: 'taste-lab-flavor', 'aria-live': 'polite' });
    const nCard = SK.card('', '');
    pNose.append(beanSeg.el, h('div', { class: 'sk-row' }, pinchB), h('div', { class: 'sk-split' }, h('div', { class: 'sk-stage', style: { maxWidth: '360px' } }, face),
      h('div', { class: 'taste-lab-bars' }, h('div', { class: 'sk-kicker' }, 'Flavor = taste + smell + texture'), barRow('sw', 'Sweet (tongue)'), barRow('so', 'Sour (tongue)'), barRow('sm', 'Smell (nose)'), barRow('tx', 'Texture (touch)'), h('div', { class: 'sk-kicker' }, 'Your brain says…'), flavor)), nCard.el);
    pinchB.onclick = () => { pinch = !pinch; pinchB.setAttribute('aria-pressed', String(pinch)); pinchB.textContent = pinch ? 'Let go of your nose' : 'Hold your nose'; api.sfx.tap(); chew(); if (pinch) api.addXP(1); };
    let aroma = [], noseLoop = null;
    function drawFace() {
      const B = BEANS[bean];
      let s = `<path d="M60 190 C 40 150 40 60 110 30 C 170 8 236 30 250 84 C 256 104 262 112 276 124 C 282 130 276 136 268 138 L 262 140 C 266 148 262 152 256 154 C 262 160 258 168 250 170 C 246 182 232 186 214 184 L 200 190 Z" style="fill:var(--sk-flesh);stroke:var(--sk-flesh-d);stroke-width:2"/>
        <path d="M150 112 C 190 104 230 100 262 118 L 258 128 C 230 116 200 120 168 132" style="fill:color-mix(in srgb,#FCE3DD 70%,var(--surface));stroke:var(--sk-flesh-d);stroke-width:1.5"/>
        <path d="M166 150 C 190 146 230 150 250 158 L 246 164 C 224 160 196 160 170 166 Z" style="fill:color-mix(in srgb,#C2455B 75%,var(--surface))"/>
        <path d="M150 112 C 140 124 140 142 166 152" style="fill:none;stroke:color-mix(in srgb,#C2455B 50%,var(--surface));stroke-width:10;stroke-linecap:round;opacity:.6"/>
        <ellipse cx="226" cy="156" rx="9" ry="6" style="fill:${B.c}"/>
        <text class="sk-ts" x="206" y="96" text-anchor="middle">nasal cavity</text><text class="sk-ts" x="206" y="196" text-anchor="middle">tongue</text>
        <path d="M150 72 C 160 66 172 66 180 72" style="fill:none;stroke:var(--sk-nerve);stroke-width:4"/><text class="sk-ts" x="160" y="62" text-anchor="middle">olfactory bulb</text>`;
      if (pinch) s += `<g><rect x="258" y="112" width="34" height="12" rx="6" style="fill:var(--sk-flesh-d)"/><rect x="258" y="128" width="34" height="12" rx="6" style="fill:var(--sk-flesh-d)"/><text class="sk-t" x="268" y="104" text-anchor="middle" style="font-size:12px;fill:var(--bad)">pinched!</text></g>`;
      s += '<g id="tl-aroma"></g>';
      face.innerHTML = s;
    }
    function chew() {
      drawFace();
      const B = BEANS[bean];
      const vals = { sw: B.taste[0], so: B.taste[1], sm: pinch ? 0.06 : 0.9, tx: 0.6 };
      Object.entries(vals).forEach(([k, v]) => { bars[k][0].firstChild.style.width = (v * 100) + '%'; bars[k][0].firstChild.style.background = k === 'sm' ? 'var(--spark)' : 'var(--carolina)'; bars[k][1].textContent = Math.round(v * 100) + '%'; });
      flavor.textContent = pinch ? `“Sweet${B.taste[1] > 0.3 ? ' and a little sour' : ''}… but what flavor?”` : `“${B.n.toUpperCase()}!”`;
      flavor.style.color = pinch ? 'var(--muted)' : B.c;
      nCard.set(pinch ? 'Flavor collapsed' : 'Full flavor', pinch ? 'Your tongue only detects the basic tastes. The “cherry” part was actually <b>smell</b>: aroma floating from your mouth up the back of your throat to your nose. Block the airflow and the flavor disappears. This is <b>sensory interaction</b>, and why food tastes bland when you have a cold.'
        : 'Chewing releases aroma molecules that drift from the back of your mouth up into your nasal cavity. Your brain blends smell + taste + texture into one experience: <b>flavor</b>. Now hold your nose.', pinch ? 'spark' : '');
    }
    chew();
    noseLoop = SK.loop(dt => {
      if (pNose.hidden) return;
      const g = face.querySelector('#tl-aroma'); if (!g) return;
      if (!api.reduceMotion && Math.random() < dt * 6) aroma.push({ u: 0 });
      let s = '';
      aroma = aroma.filter(a => { a.u += dt * 0.35; return a.u < 1; });
      aroma.forEach(a => {
        let x, y; const u = a.u;
        // path: mouth (226,150) -> back of throat (150,140) -> up (150,112) -> nasal cavity (220,112) -> olfactory (165,74)
        if (u < 0.3) { const k = u / 0.3; x = 226 - 76 * k; y = 150 - 8 * k; }
        else if (u < 0.5) { const k = (u - 0.3) / 0.2; x = 150; y = 142 - 30 * k; }
        else if (pinch) { const k = (u - 0.5) / 0.5; x = 150 + 40 * k; y = 112 - 2 * k; if (k > 0.4) return; }
        else { const k = (u - 0.5) / 0.5; x = 150 + 60 * Math.sin(k * 3.1) * 0.5 + 10 * k; y = 112 - 38 * k; }
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" style="fill:${BEANS[bean].c};opacity:${(1 - u * 0.7).toFixed(2)}"/>`;
      });
      g.innerHTML = s;
    });
    // smell pathway
    const path = SK.svg('0 0 380 150', `
      <text class="sk-ts" x="6" y="16" style="fill:var(--muted)">OTHER SENSES</text>
      <rect class="node" x="6" y="24" width="110" height="30" rx="8"/><text class="sk-ts" x="61" y="44" text-anchor="middle">eyes, ears, skin</text>
      <rect class="node th" x="146" y="24" width="84" height="30" rx="8"/><text class="sk-ts" x="188" y="44" text-anchor="middle">thalamus</text>
      <rect class="node" x="260" y="24" width="114" height="30" rx="8"/><text class="sk-ts" x="317" y="44" text-anchor="middle">sensory cortex</text>
      <path d="M116 39 H146 M230 39 H260" style="stroke:var(--muted);stroke-width:2"/>
      <text class="sk-ts" x="6" y="84" style="fill:var(--spark)">SMELL: skips the thalamus</text>
      <rect class="node smell" x="6" y="94" width="70" height="30" rx="8"/><text class="sk-ts" x="41" y="114" text-anchor="middle">nose</text>
      <rect class="node smell" x="100" y="94" width="112" height="30" rx="8"/><text class="sk-ts" x="156" y="114" text-anchor="middle">olfactory bulb</text>
      <rect class="node smell" x="236" y="94" width="138" height="46" rx="8"/><text class="sk-ts" x="305" y="112" text-anchor="middle">limbic system +</text><text class="sk-ts" x="305" y="130" text-anchor="middle">olfactory cortex</text>
      <path d="M76 109 H100 M212 109 H236" style="stroke:var(--spark);stroke-width:2"/>
      <path d="M190 94 C 192 76 190 64 188 56" style="stroke:var(--bad);stroke-width:2;stroke-dasharray:4 4;fill:none"/><text class="sk-ts" x="196" y="78" style="fill:var(--bad)">✕</text>
      <g id="tl-sig"></g>`, { class: 'taste-lab-path', role: 'img', 'aria-label': 'Other senses go to the thalamus, then cortex. Smell goes from the nose to the olfactory bulb, then straight to the limbic system and olfactory cortex, skipping the thalamus.' });
    const pathLoop = SK.loop((dt, t) => {
      if (pNose.hidden) return;
      const u = ((t / 1000) * 0.4) % 1, v = ((t / 1000) * 0.4 + 0.5) % 1;
      const g = path.querySelector('#tl-sig'); if (!g) return;
      const top = u < 0.5 ? [116 + u * 2 * 30, 39] : [230 + (u - 0.5) * 2 * 30, 39];
      const bot = [76 + v * 148, 109];
      g.innerHTML = `<circle class="sig" cx="${top[0].toFixed(1)}" cy="${top[1]}" r="4" style="fill:var(--carolina);filter:none"/><circle class="sig" cx="${bot[0].toFixed(1)}" cy="${bot[1]}" r="4.5"/>`;
    });
    pNose.append(h('div', { class: 'sk-kicker' }, 'Why smells trigger memories'), h('div', { class: 'sk-stage', style: { maxWidth: '440px' } }, path),
      h('p', { class: 'sk-note' }, 'Smell is the only sense that skips the thalamus. Signals go from the olfactory bulb straight to the limbic system (amygdala and hippocampus, for emotion and memory) and the olfactory cortex. That is why a whiff of sunscreen or Grandma’s kitchen can bring back a whole memory and feeling at once.'));

    root.append(pSort, pTaster, pNose);
    el.append(root);
    return () => { noseLoop.stop(); pathLoop.stop(); timers.forEach(clearTimeout); };
  }
});
})();
