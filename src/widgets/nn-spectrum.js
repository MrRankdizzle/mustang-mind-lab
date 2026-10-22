/* nn-spectrum — "Nature or nurture?" opinion slider per trait, then a reveal of how genes AND environment interact. */
(function () {
'use strict';
const CSS = `
.nns { display: flex; flex-direction: column; gap: 14px; }
.nns-ins { font-size: 15px; color: var(--muted); }
.nns-dots { display: flex; gap: 6px; flex-wrap: wrap; }
.nns-dot { width: 34px; height: 8px; border-radius: 9px; background: var(--line); border: 0; padding: 0; transition: background .3s; }
.nns-dot.done { background: var(--carolina); }
.nns-dot.now { background: var(--spark); }
.nns-card { border: 1px solid var(--line); background: var(--surface-2); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.nns-trait { display: flex; align-items: center; gap: 12px; }
.nns-ico { width: 52px; height: 52px; flex: none; border-radius: 14px; background: var(--carolina-soft); display: grid; place-items: center; }
.nns-ico svg { width: 34px; height: 34px; }
.nns-ico .s { fill: none; stroke: var(--carolina); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.nns-ico .f { fill: var(--carolina); }
.nns-kicker { font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.nns-name { font-size: 22px; font-weight: 700; line-height: 1.15; }
.nns-scale { position: relative; padding: 4px 0 0; user-select: none; -webkit-user-select: none; }
.nns-ends { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.nns-ends span:first-child { color: var(--carolina); }
.nns-ends span:last-child { color: var(--spark); text-align: right; }
.nns-track { position: relative; height: 44px; border-radius: 22px; cursor: pointer; touch-action: none;
  background: linear-gradient(90deg, var(--carolina) 0%, color-mix(in srgb, var(--carolina) 55%, var(--spark)) 50%, var(--spark) 100%); opacity: .95; }
.nns-track::before { content: ""; position: absolute; left: 50%; top: 8px; bottom: 8px; width: 2px; background: rgba(255,255,255,.7); transform: translateX(-1px); border-radius: 2px; }
.nns-ticks { position: absolute; inset: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 22px; pointer-events: none; }
.nns-ticks i { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,.65); }
.nns-thumb { position: absolute; top: 50%; width: 40px; height: 40px; margin-left: -20px; margin-top: -20px; border-radius: 50%;
  background: var(--surface); border: 3px solid var(--ink); box-shadow: 0 3px 10px rgba(0,0,0,.25); display: grid; place-items: center; cursor: grab; touch-action: none; }
.nns-thumb::after { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--ink); }
.nns-thumb.idle { animation: nnsNudge 1.6s ease-in-out infinite; }
@keyframes nnsNudge { 0%,100% { transform: translateX(0); } 30% { transform: translateX(-7px); } 60% { transform: translateX(7px); } }
.reduce-motion .nns-thumb.idle { animation: none; }
.nns-pick { text-align: center; font-weight: 700; min-height: 1.5em; }
.nns-pick b { color: var(--carolina); }
.nns-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.nns-hint { font-size: 14px; color: var(--muted); }
.nns-reveal { display: flex; flex-direction: column; gap: 12px; border-top: 1px dashed var(--line); padding-top: 14px; animation: nnsIn .4s ease both; }
@keyframes nnsIn { from { opacity: 0; transform: translateY(8px); } }
.reduce-motion .nns-reveal { animation: none; }
.nns-verdict { display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; font-weight: 700; color: var(--good); background: var(--good-soft); padding: 4px 10px; border-radius: 99px; }
.nns-why { font-size: 16px; }
.nns-range { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.nns-range h4 { margin: 0; font-size: 14px; font-weight: 700; }
.nns-range svg { width: 100%; max-width: 440px; height: auto; display: block; margin: 0 auto; }
.nns-env { display: flex; gap: 8px; flex-wrap: wrap; }
.nns-env button { flex: 1 1 140px; text-align: left; border: 1.5px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 8px 10px; font-size: 14px; font-weight: 700; cursor: pointer; color: var(--ink); }
.nns-env button[aria-pressed="true"] { border-color: var(--spark); background: var(--spark-soft); }
.nns-envnote { font-size: 14px; color: var(--muted); min-height: 1.4em; }
.nns-sum { display: flex; flex-direction: column; gap: 12px; animation: nnsIn .4s ease both; }
.nns-big { background: var(--arc-bg); color: var(--arc-ink); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
.nns-big .k { font-family: var(--f-mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--arc-gold); font-weight: 700; }
.nns-big .t { font-size: 22px; font-weight: 700; line-height: 1.25; }
.nns-big .t em { font-style: normal; color: var(--arc-blue); }
.nns-rows { display: grid; gap: 8px; }
.nns-row { display: grid; grid-template-columns: minmax(92px, 150px) 1fr; gap: 10px; align-items: center; font-size: 14px; font-weight: 700; }
.nns-mini { position: relative; height: 12px; border-radius: 8px; background: linear-gradient(90deg, var(--carolina), var(--spark)); opacity: .9; }
.nns-mini i { position: absolute; top: 50%; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; background: var(--surface); border: 3px solid var(--ink); }
.nns-mini-ends { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-top: -4px; }
`;
const TRAITS = [
  { name: 'Height', icon: 'height',
    why: 'Height is strongly influenced by genes: tall parents tend to have tall kids. But genes only set the potential. A child who inherits "tall" genes but grows up without enough nourishment may never reach the height they could have. Average heights in many countries rose over the last century mostly because nutrition improved, not because genes changed.',
    lo: 'Shorter', hi: 'Taller', range: [0.48, 0.92],
    env: [['Poor nutrition', 0.12, 'Without enough food, the body never reaches the top of its genetic range.'], ['Healthy diet and care', 0.9, 'Good nutrition lets the body grow toward the top of the range the genes allow.']] },
  { name: 'Addiction & mental disorders', icon: 'brain',
    why: 'Genes can raise risk: addiction and disorders like schizophrenia and depression run in families. But genes are not destiny. Stress, trauma, friends, and whether a drug is even available all affect whether that risk ever shows up. Even the identical twin of someone with schizophrenia has only about a 1-in-2 chance of developing it.',
    lo: 'Lower risk', hi: 'Higher risk', range: [0.35, 0.85],
    env: [['Supportive home, no early drug use', 0.1, 'Support and protection keep the person near the low end of their risk range.'], ['Chronic stress, early drug use', 0.92, 'Stress and early exposure push the same genes toward the high end of the risk range.']] },
  { name: 'Talent in sports or music', icon: 'music',
    why: 'Genes can shape body build, reaction speed, or an ear for pitch. But nobody is born able to shoot free throws or play guitar. Skill takes coaching and thousands of hours of practice. Genes can even shape the environment you pick: a kid who is naturally quick may join a team and practice more.',
    lo: 'Less skilled', hi: 'More skilled', range: [0.25, 0.8],
    env: [['Rarely practices', 0.08, 'Natural ability with no practice stays at the low end of the range.'], ['Years of coaching and practice', 0.94, 'Practice and coaching move the same person to the top of their range.']] },
  { name: 'Personality', icon: 'mask',
    why: 'Twin studies suggest roughly 40 to 50 percent of the differences in personality traits, like how outgoing people are, are linked to genetic differences. Babies show different temperaments from birth. Family, friends, and culture then shape how that temperament gets expressed.',
    lo: 'More reserved', hi: 'More outgoing', range: [0.3, 0.75],
    env: [['Few chances to socialize', 0.15, 'Limited social practice keeps the person nearer the reserved end of their range.'], ['Lots of team, club, and family time', 0.88, 'Frequent social practice helps the same temperament show up as more outgoing.']] },
  { name: 'Intelligence', icon: 'bulb',
    why: 'Identical twins have more similar intelligence scores than fraternal twins, even when raised apart, so genes matter. But nutrition, schooling, and a stimulating home also raise scores. Children adopted from poor environments into enriched homes tend to score higher than expected.',
    lo: 'Lower test scores', hi: 'Higher test scores', range: [0.3, 0.82],
    env: [['Poor nutrition, little schooling', 0.1, 'A deprived environment keeps scores at the low end of the genetic range.'], ['Good nutrition, rich learning', 0.9, 'An enriched environment helps the same genes reach the high end of the range.']] },
  { name: 'Sense of humor', icon: 'laugh',
    why: 'Twin studies suggest a cheerful, playful humor style is partly heritable. But what you find funny is learned from family, friends, and culture. Inside jokes are 100 percent nurture.',
    lo: 'Laughs less', hi: 'Laughs more', range: [0.3, 0.85],
    env: [['Serious household', 0.15, 'A household that rarely jokes keeps humor near the low end of the range.'], ['Family that jokes around', 0.9, 'Growing up around jokes pushes the same temperament toward the high end.']] }
];
const ICONS = {
  height: '<path class="s" d="M8 4v26M5 7h6M5 27h6"/><circle class="s" cx="23" cy="8" r="3.4"/><path class="s" d="M23 12v10M17 15h12M23 22l-4 8M23 22l4 8"/>',
  brain: '<path class="s" d="M17 6c-3-2-8-1-8 3-4 0-5 5-2 7-3 2-1 7 3 7 0 3 4 5 7 3V6zM17 6c3-2 8-1 8 3 4 0 5 5 2 7 3 2 1 7-3 7 0 3-4 5-7 3"/><path class="s" d="M12 13h3M20 17h3"/>',
  music: '<path class="s" d="M12 24V8l12-3v15"/><circle class="s" cx="9" cy="24" r="3"/><circle class="s" cx="21" cy="21" r="3"/><circle class="s" cx="27" cy="9" r="0.6"/>',
  mask: '<path class="s" d="M5 7c4 2 9 2 13 0v9c0 5-3 9-6.5 9S5 21 5 16z"/><path class="s" d="M9 13h2M13 13h2M9 18c1.5 1.5 3.5 1.5 5 0"/><path class="s" d="M20 11c3 1.5 6 1.5 9 0v8c0 4-2 7-4.5 7-1.5 0-3-1-3.8-2.5"/><path class="s" d="M23 16h1.5M26 16h1.5M23.5 22c1-1 2.5-1 3.5 0"/>',
  bulb: '<path class="s" d="M17 4a8 8 0 0 0-5 14c1 1 1.5 2 1.5 3.5h7c0-1.5.5-2.5 1.5-3.5A8 8 0 0 0 17 4z"/><path class="s" d="M13.5 25h7M14.5 29h5"/><path class="s" d="M17 10v5M14.5 12.5h5"/>',
  laugh: '<circle class="s" cx="17" cy="17" r="12"/><path class="s" d="M11 13l3 1.5-3 1.5M23 13l-3 1.5 3 1.5"/><path class="s" d="M10.5 19.5h13c0 4-3 6.5-6.5 6.5s-6.5-2.5-6.5-6.5z"/>'
};
const pickLabel = v => v < 15 ? 'All nature' : v < 40 ? 'Mostly nature' : v <= 60 ? 'Both about equally' : v <= 85 ? 'Mostly nurture' : 'All nurture';

ML.registerWidget('nn-spectrum', {
  title: 'Nature or nurture?', tag: 'Opinion slider',
  mount(el, api) {
    const { h, sfx } = api;
    if (!document.getElementById('nns-css')) document.head.append(h('style', { id: 'nns-css' }, CSS));
    const picks = TRAITS.map(() => null);
    let idx = 0, raf = 0;
    const root = h('div', { class: 'nns' });
    const ins = h('p', { class: 'nns-ins' }, 'Drag the marker to where you think each trait falls, then tap Reveal to see what the science says.');
    const dots = h('div', { class: 'nns-dots', 'aria-hidden': 'true' }, TRAITS.map(() => h('span', { class: 'nns-dot' })));
    const stage = h('div');
    root.append(ins, dots, stage);
    el.append(root);

    function paintDots() { [...dots.children].forEach((d, i) => { d.className = 'nns-dot' + (i < idx || picks[i] != null && i !== idx ? ' done' : i === idx ? ' now' : ''); }); }

    function showTrait(i) {
      idx = i; paintDots(); stage.innerHTML = '';
      const T = TRAITS[i];
      let val = 50, moved = false, revealed = false;
      const ico = h('div', { class: 'nns-ico', 'aria-hidden': 'true' }); ico.innerHTML = `<svg viewBox="0 0 34 34">${ICONS[T.icon]}</svg>`;
      const head = h('div', { class: 'nns-trait' }, ico, h('div', null, h('div', { class: 'nns-kicker' }, `Trait ${i + 1} of ${TRAITS.length}`), h('div', { class: 'nns-name' }, T.name)));
      const thumb = h('div', { class: 'nns-thumb idle', role: 'slider', tabindex: '0', 'aria-label': `Where does ${T.name} fall between nature and nurture?`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '50', 'aria-valuetext': 'Both about equally' });
      const track = h('div', { class: 'nns-track' }, h('div', { class: 'nns-ticks', 'aria-hidden': 'true' }, [0, 1, 2, 3, 4].map(() => h('i'))), thumb);
      const pick = h('div', { class: 'nns-pick', 'aria-live': 'polite' }, 'Move the marker to commit your opinion.');
      const reveal = h('button', { type: 'button', class: 'btn btn-primary nns-reveal-btn', disabled: true }, 'Reveal the science');
      const hint = h('span', { class: 'nns-hint' }, 'Move the marker first.');
      const actions = h('div', { class: 'nns-actions' }, reveal, hint);
      const scale = h('div', { class: 'nns-scale' }, h('div', { class: 'nns-ends' }, h('span', null, '← Nature (genes)'), h('span', null, 'Nurture (environment) →')), track);
      const card = h('div', { class: 'nns-card' }, head, scale, pick, actions);
      stage.append(card);
      const set = (v, user) => {
        val = Math.max(0, Math.min(100, Math.round(v)));
        thumb.style.left = `calc(22px + (100% - 44px) * ${val / 100})`;
        thumb.setAttribute('aria-valuenow', val); thumb.setAttribute('aria-valuetext', pickLabel(val));
        if (user) {
          if (!moved) { moved = true; thumb.classList.remove('idle'); reveal.disabled = false; hint.textContent = ''; }
          pick.innerHTML = ''; pick.append('You say: ', h('b', null, pickLabel(val)));
          if (revealed) { picks[i] = val; }
        }
      };
      set(50, false);
      const fromEvt = e => { const r = track.getBoundingClientRect(); return ((e.clientX - r.left - 22) / (r.width - 44)) * 100; };
      let dragId = null, lastTick = -1;
      track.addEventListener('pointerdown', e => { dragId = e.pointerId; track.setPointerCapture(dragId); set(fromEvt(e), true); thumb.style.cursor = 'grabbing'; e.preventDefault(); });
      track.addEventListener('pointermove', e => { if (dragId !== e.pointerId) return; set(fromEvt(e), true); const t = Math.round(val / 10); if (t !== lastTick) { lastTick = t; sfx.tap(); } });
      const end = e => { if (dragId !== e.pointerId) return; dragId = null; thumb.style.cursor = ''; };
      track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
      thumb.addEventListener('keydown', e => {
        const step = e.shiftKey ? 20 : 5;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(val - step, true); e.preventDefault(); sfx.tap(); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(val + step, true); e.preventDefault(); sfx.tap(); }
        else if (e.key === 'Home') { set(0, true); e.preventDefault(); }
        else if (e.key === 'End') { set(100, true); e.preventDefault(); }
        else if (e.key === 'Enter' && moved && !revealed) { reveal.click(); }
      });
      reveal.addEventListener('click', () => {
        if (revealed || !moved) return;
        revealed = true; picks[i] = val; reveal.remove(); hint.remove(); sfx.flip(); api.addXP(1);
        const env = rangeView(T);
        const last = i === TRAITS.length - 1;
        const next = h('button', { type: 'button', class: 'btn btn-primary nns-next' }, last ? 'See the big idea' : 'Next trait →');
        next.addEventListener('click', () => { sfx.tap(); if (last) summary(); else showTrait(i + 1); stage.querySelector('button,[tabindex]')?.focus({ preventScroll: true }); });
        const box = h('div', { class: 'nns-reveal' }, h('span', { class: 'nns-verdict' }, 'The science: both'), h('p', { class: 'nns-why' }, T.why), env, h('div', { class: 'nns-actions' }, next));
        card.append(box);
      });
    }

    function rangeView(T) {
      const W = 320, H = 92;
      const svg = api.svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Genes set a range for ${T.name}; the environment decides where in that range a person lands.` });
      const x0 = 14, x1 = W - 14, X = f => x0 + (x1 - x0) * f;
      const a = X(T.range[0]), b = X(T.range[1]);
      svg.innerHTML = `
        <line x1="${x0}" y1="46" x2="${x1}" y2="46" style="stroke:var(--line);stroke-width:6;stroke-linecap:round"/>
        <rect x="${a}" y="36" width="${b - a}" height="20" rx="10" style="fill:var(--carolina-soft);stroke:var(--carolina);stroke-width:2"/>
        <text x="${(a + b) / 2}" y="26" text-anchor="middle" style="fill:var(--carolina);font-size:13px;font-weight:700">Range set by genes</text>
        <text x="${x0}" y="84" style="fill:var(--muted);font-size:12px">${T.lo}</text>
        <text x="${x1}" y="84" text-anchor="end" style="fill:var(--muted);font-size:12px">${T.hi}</text>
        <g class="nns-pin" style="transition:transform .7s cubic-bezier(.3,1.4,.5,1)"><circle cx="0" cy="46" r="11" style="fill:var(--spark);stroke:var(--surface);stroke-width:3"/><text x="0" y="72" text-anchor="middle" style="fill:var(--spark);font-size:12px;font-weight:700">lands here</text></g>`;
      const pin = svg.querySelector('.nns-pin');
      pin.style.transform = `translateX(${a + (b - a) * 0.5}px)`;
      const note = h('p', { class: 'nns-envnote', 'aria-live': 'polite' }, 'Tap an environment to see where this person lands.');
      const btns = T.env.map(([label, f, msg]) => {
        const bt = h('button', { type: 'button', 'aria-pressed': 'false' }, label);
        bt.addEventListener('click', () => { btns.forEach(x => x.setAttribute('aria-pressed', String(x === bt))); pin.style.transform = `translateX(${a + (b - a) * f}px)`; note.textContent = msg; sfx.blip(); });
        return bt;
      });
      return h('div', { class: 'nns-range' }, h('h4', null, 'Same genes, two environments'), svg, h('div', { class: 'nns-env' }, btns), note);
    }

    function summary() {
      idx = TRAITS.length; paintDots(); stage.innerHTML = '';
      const rows = TRAITS.map((T, i) => h('div', { class: 'nns-row' }, h('span', null, T.name), h('div', { class: 'nns-mini', role: 'img', 'aria-label': `${T.name}: you said ${pickLabel(picks[i] ?? 50)}` }, h('i', { style: { left: `${picks[i] ?? 50}%` } }))));
      const again = h('button', { type: 'button', class: 'btn' }, 'Start over');
      again.addEventListener('click', () => { picks.fill(null); showTrait(0); });
      stage.append(h('div', { class: 'nns-sum' },
        h('div', { class: 'nns-big' }, h('span', { class: 'k' }, 'The big idea'), h('span', { class: 't' }, 'Both. ', h('em', null, 'Genes set a range;'), ' environment shapes where you land.')),
        h('p', { class: 'nns-why' }, 'Here is where you placed each trait. Every one of them is shaped by heredity and environment working together, and psychologists call that an interaction: the effect of one depends on the other.'),
        h('div', { class: 'nns-rows' }, rows, h('div', { class: 'nns-row', 'aria-hidden': 'true' }, h('span'), h('div', { class: 'nns-mini-ends' }, h('span', null, 'Nature'), h('span', null, 'Nurture')))),
        h('div', { class: 'nns-actions' }, again)));
      sfx.level();
      if (!api.reduceMotion) { const r = root.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 60, 50); }
    }

    showTrait(0);
    return () => { cancelAnimationFrame(raf); };
  }
});
})();
