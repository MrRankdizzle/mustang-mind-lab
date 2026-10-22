/* text-vs-postcard — neurotransmitters are like text messages (fast, one target, brief); hormones are like postcards
   (slow, through the bloodstream, many targets, long-lasting). Race them, then sort examples. */
(function () {
'use strict';
const CSS = `
.tvp { display: flex; flex-direction: column; gap: 12px; }
.tvp-ins { font-size: 15px; color: var(--muted); }
.tvp-lane { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); overflow: hidden; }
.tvp-lh { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 12px 0; }
.tvp-lh .t { font-weight: 700; font-size: 16px; }
.tvp-lh .t small { display: block; font-weight: 400; font-size: 13px; color: var(--muted); }
.tvp-lh .sp { flex: 1; }
.tvp-lane svg { width: 100%; max-width: 500px; display: block; margin: 0 auto; }
.tvp-stat { display: flex; gap: 14px; flex-wrap: wrap; padding: 0 12px 10px; font-family: var(--f-mono); font-size: 13px; color: var(--muted); }
.tvp-stat b { color: var(--ink); font-variant-numeric: tabular-nums; }
.tvp-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tvp-cmp { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr); overflow-wrap: anywhere; gap: 0; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; font-size: 14px; }
.tvp-cmp > div { padding: 7px 10px; border-bottom: 1px solid var(--line); }
.tvp-cmp > div:nth-last-child(-n+3) { border-bottom: 0; }
.tvp-cmp .hd { font-family: var(--f-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; background: var(--surface-2); color: var(--muted); }
.tvp-cmp .k { font-weight: 700; background: var(--surface-2); }
.tvp-quiz { border: 2px solid var(--carolina); border-radius: 14px; padding: 12px 14px; display: grid; gap: 10px; }
.tvp-quiz h4 { margin: 0; font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); display: flex; justify-content: space-between; }
.tvp-q { display: grid; gap: 6px; padding: 8px 0; border-top: 1px dashed var(--line); }
.tvp-q:first-of-type { border-top: 0; }
.tvp-q p { font-size: 15px; font-weight: 700; }
.tvp-q .opts { display: flex; gap: 8px; flex-wrap: wrap; }
.tvp-q .opts button { border: 2px solid var(--line); background: var(--surface-2); border-radius: 10px; padding: 6px 12px; font-weight: 700; cursor: pointer; color: var(--ink); }
.tvp-q .opts button.right { border-color: var(--good); background: var(--good-soft); }
.tvp-q .opts button.wrong { border-color: var(--bad); background: var(--bad-soft); }
.tvp-q .why { font-size: 14px; color: var(--muted); }
`;
const QUIZ = [
  ['Adrenaline keeps your heart pounding for minutes after a scare.', 1, 'Adrenaline is a hormone carried by the blood, so its effect lasts.'],
  ['A motor neuron tells one finger muscle to twitch right now.', 0, 'Fast and aimed at one target: a neurotransmitter "text."'],
  ['Melatonin builds up through the evening and makes your whole body sleepy.', 1, 'Melatonin is a hormone released into the bloodstream: slow and widespread.'],
  ['Glutamate passes a message to the next neuron in a memory circuit.', 0, 'Glutamate crosses one synapse in a split second: a "text."'],
  ['Leptin from fat cells tells the brain over days that energy stores are full.', 1, 'Leptin travels in the blood and works over long time spans: a "postcard."']
];
const ORG = [['heart', 120, 20, 138, 24, 'start'], ['lungs', 190, 104, 208, 108, 'start'], ['liver', 262, 20, 280, 24, 'start'], ['muscles', 330, 106, 312, 110, 'end']];
const ORG_ICON = {
  heart: '<path d="M0 8 C-12 0 -10 -9 -4 -9 C-1 -9 0 -6 0 -5 C0 -6 1 -9 4 -9 C10 -9 12 0 0 8Z" style="fill:#E5485F"/>',
  lungs: '<ellipse cx="-6" cy="0" rx="6" ry="10" style="fill:#F2A1B5"/><ellipse cx="6" cy="0" rx="6" ry="10" style="fill:#F2A1B5"/><path d="M0 -12 V-2" style="stroke:#C7778B;stroke-width:2"/>',
  liver: '<path d="M-13 -3 Q-6 -10 12 -8 Q14 2 4 7 Q-8 8 -13 -3Z" style="fill:#9E4B3A"/>',
  muscles: '<ellipse rx="13" ry="6" style="fill:#D9705A"/><path d="M-8 -2 Q0 -5 8 -2 M-8 2 Q0 -1 8 2" style="fill:none;stroke:#A84A36;stroke-width:1.2"/>'
};

ML.registerWidget('text-vs-postcard', {
  title: 'Text message vs. postcard', tag: 'Race',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('tvp-css')) document.head.append(h('style', { id: 'tvp-css' }, CSS));
    let raf = 0, last = 0, tT = null, cT = null, tGlow = 0, orgGlow = ORG.map(() => 0), orgHit = ORG.map(() => false), cards = [];
    const root = h('div', { class: 'tvp' });
    const ins = h('p', { class: 'tvp-ins' }, 'Press "Race them!" to send a neurotransmitter text and a hormone postcard at the same time. Which arrives first? Which effect lasts longer?');
    const raceB = h('button', { type: 'button', class: 'btn btn-primary tvp-race' }, '▶ Race them!');
    const sendT = h('button', { type: 'button', class: 'btn btn-sm' }, 'Send a text');
    const sendC = h('button', { type: 'button', class: 'btn btn-sm' }, 'Mail a postcard');
    const s1 = svgEl('svg', { viewBox: '0 0 360 120', role: 'img', 'aria-label': 'A neuron sends a neurotransmitter message across a synapse to one target neuron' });
    const s2 = svgEl('svg', { viewBox: '0 0 360 124', role: 'img', 'aria-label': 'An adrenal gland releases hormone into a blood vessel that reaches the heart, lungs, liver, and muscles' });
    const st1 = h('div', { class: 'tvp-stat', 'aria-live': 'polite' }, 'Arrives: ', h('b', null, '—'), ' Effect: ', h('b', null, '—'));
    const st2 = h('div', { class: 'tvp-stat', 'aria-live': 'polite' }, 'Arrives: ', h('b', null, '—'), ' Effect: ', h('b', null, '—'));
    root.append(ins, h('div', { class: 'tvp-row' }, raceB),
      h('div', { class: 'tvp-lane' }, h('div', { class: 'tvp-lh' }, h('div', { class: 't' }, 'Text message = neurotransmitter', h('small', null, 'Nervous system: across a synapse')), h('span', { class: 'sp' }), sendT), s1, st1),
      h('div', { class: 'tvp-lane' }, h('div', { class: 'tvp-lh' }, h('div', { class: 't' }, 'Postcard = hormone', h('small', null, 'Endocrine system: through the bloodstream')), h('span', { class: 'sp' }), sendC), s2, st2),
      table(), quiz());
    el.append(root);

    s1.innerHTML = `
      <circle cx="34" cy="62" r="17" style="fill:var(--carolina-soft);stroke:var(--carolina);stroke-width:2.5"/>
      ${[[-1, -1], [-1, 1], [0, -1.3]].map(([dx, dy]) => `<path d="M${34 + dx * 14} ${62 + dy * 14} l${dx * 12} ${dy * 10}" style="stroke:var(--carolina);stroke-width:3;stroke-linecap:round"/>`).join('')}
      <path d="M51 62 H272" style="stroke:var(--carolina);stroke-width:4"/>
      ${[70, 112, 154, 196, 238].map(x => `<rect x="${x}" y="55" width="34" height="14" rx="7" style="fill:#F3DE9A;stroke:#C9A445"/>`).join('')}
      <circle cx="276" cy="62" r="7" style="fill:var(--spark-soft);stroke:var(--spark);stroke-width:2"/>
      <g class="tg"><circle cx="322" cy="62" r="19" style="fill:var(--carolina-soft);stroke:var(--carolina);stroke-width:2.5"/><path d="M303 62 h-12" style="stroke:var(--carolina);stroke-width:4;stroke-linecap:round"/></g>
      <circle class="glow" cx="322" cy="62" r="26" style="fill:#FFD166;opacity:0"/>
      <text x="356" y="100" text-anchor="end" style="font-size:12px;font-weight:700;fill:var(--muted)">1 target neuron</text>
      <text x="34" y="100" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--muted)">sender</text>
      <g class="nt"></g>
      <g class="msg" style="opacity:0"><rect x="-13" y="-10" width="26" height="18" rx="6" style="fill:var(--spark)"/><path d="M-4 8 l-3 6 l8 -6z" style="fill:var(--spark)"/>${[-6, 0, 6].map(x => `<circle cx="${x}" cy="-1" r="2" style="fill:#fff"/>`).join('')}</g>`;
    s2.innerHTML = `
      <path class="ves" d="M44 62 Q80 10 120 40 T190 78 T262 42 T340 80" style="fill:none;stroke:#E5485F;stroke-width:12;stroke-linecap:round;opacity:.25"/>
      <path class="ves2" d="M44 62 Q80 10 120 40 T190 78 T262 42 T340 80" style="fill:none;stroke:#E5485F;stroke-width:3;stroke-dasharray:2 8;stroke-linecap:round;opacity:.6"/>
      <g transform="translate(26 70)"><path d="M-12 -2 C-14 -18 6 -20 10 -8 C14 4 8 18 -4 16 C-12 14 -10 6 -12 -2Z" style="fill:#B05A48"/><path d="M-10 -10 L2 -22 L10 -8 Z" style="fill:var(--warn)"/></g>
      <text x="4" y="112" text-anchor="start" style="font-size:12px;font-weight:700;fill:var(--muted)">adrenal gland</text>
      ${ORG.map(([n, x, y, lx, ly, la], i) => `<g class="org" data-i="${i}" transform="translate(${x} ${y})"><circle class="og" r="17" style="fill:#FFD166;opacity:0"/>${ORG_ICON[n]}</g><text x="${lx}" y="${ly}" text-anchor="${la}" style="font-size:12px;font-weight:700;fill:var(--muted)">${n}</text>`).join('')}
      <g class="cards"></g>`;
    const msg = s1.querySelector('.msg'), glow = s1.querySelector('.glow'), ntG = s1.querySelector('.nt');
    const ves = s2.querySelector('.ves'), cardG = s2.querySelector('.cards');
    const orgEls = [...s2.querySelectorAll('.org .og')];
    const setStat = (st, a, b) => { const bs = st.querySelectorAll('b'); bs[0].textContent = a; bs[1].textContent = b; };

    function sendText() { tT = 0; tGlow = 0; sfx.tone(1200, 0.06, 'square', 0.05, 1800); setStat(st1, 'sending…', '—'); kick(); }
    function sendCard() {
      cT = 0; orgGlow = ORG.map(() => 0); orgHit = ORG.map(() => false); cardG.innerHTML = '';
      cards = [0, 0.25, 0.5].map(d => { const g = svgEl('g', { style: 'opacity:0' }); g.innerHTML = '<rect x="-9" y="-6" width="18" height="12" rx="2" style="fill:#FFF6E2;stroke:#B07A10;stroke-width:1.4"/><path d="M-9 -6 L0 1 L9 -6" style="fill:none;stroke:#B07A10;stroke-width:1.2"/>'; cardG.append(g); return { g, d }; });
      sfx.tone(300, 0.2, 'triangle', 0.07, 200); setStat(st2, 'traveling…', '—'); kick();
    }
    raceB.addEventListener('click', () => { sendText(); sendCard(); api.addXP(1); });
    sendT.addEventListener('click', sendText); sendC.addEventListener('click', sendCard);
    const TT = 0.45, CT = 3.6, TEFF = 1.0, CEFF = 10;
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      let busy = false;
      if (tT != null) {
        tT += dt; busy = true;
        if (tT < TT) { const u = tT / TT, x = 58 + u * 212; msg.style.opacity = '1'; msg.setAttribute('transform', `translate(${x} 46)`); }
        else { msg.style.opacity = '0'; }
        if (tT >= TT && tT < TT + 0.25) { if (!ntG.childNodes.length) { for (let i = 0; i < 5; i++) ntG.append(svgEl('circle', { r: 2.4, style: 'fill:var(--spark)' })); setStat(st1, '0.45 s', 'active…'); sfx.tone(1500, 0.05, 'sine', 0.05); }
          const u = (tT - TT) / 0.25; [...ntG.children].forEach((c, i) => { c.setAttribute('cx', 284 + u * 16); c.setAttribute('cy', 56 + i * 3); }); }
        else ntG.innerHTML = '';
        const ge = tT < TT + 0.2 ? 0 : tT < TT + 0.2 + TEFF ? 1 - (tT - TT - 0.2) / TEFF : 0;
        glow.style.opacity = String(ge * 0.6);
        if (tT > TT + 0.2 + TEFF) { tT = null; setStat(st1, 'split second', 'over almost instantly (reuptake clears it)'); }
      }
      if (cT != null) {
        cT += dt; busy = true;
        const L = ves.getTotalLength();
        cards.forEach(c => {
          const u = Math.max(0, Math.min(1, (cT - c.d) / CT));
          const p = ves.getPointAtLength(L * u);
          c.g.style.opacity = u > 0 && u < 1 ? '1' : '0'; c.g.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${Math.sin(cT * 4 + c.d * 9) * 10})`);
          ORG.forEach(([, ox], i) => { if (!orgHit[i] && p.x >= ox - 4 && u > 0) { orgHit[i] = true; sfx.tone(500 + i * 90, 0.12, 'triangle', 0.06); if (i === 0) setStat(st2, `${(cT).toFixed(1)} s`, 'spreading…'); } });
        });
        orgEls.forEach((o, i) => { if (orgHit[i]) orgGlow[i] = Math.min(1, orgGlow[i] + dt * 3); const lastHit = orgHit.every(Boolean) ? cT - CT - 0.5 : 0; const fade = lastHit > CEFF ? Math.max(0, 1 - (lastHit - CEFF) / 2) : 1; o.style.opacity = String(orgGlow[i] * 0.55 * fade); });
        if (orgHit.every(Boolean)) { const e = cT - CT - 0.5; if (e > 0 && e <= CEFF) setStat(st2, `${CT.toFixed(1)} s`, `still working: ${e.toFixed(0)} s and counting (real hormones: minutes to hours)`); }
        if (cT > CT + 0.5 + CEFF + 2) { cT = null; setStat(st2, 'slow (seconds or more)', 'lasted much longer, in many organs'); orgEls.forEach(o => o.style.opacity = '0'); }
      }
      raf = busy ? requestAnimationFrame(frame) : 0;
    }

    function table() {
      const rows = [['Speed', 'Very fast', 'Slower'], ['Route', 'Along a neuron, across a synapse', 'Through the bloodstream'], ['Reaches', 'One specific target', 'Many organs at once'], ['Lasts', 'A split second', 'Minutes to hours'], ['Example', 'Glutamate, dopamine', 'Adrenaline, melatonin']];
      return h('div', { class: 'tvp-cmp' }, h('div', { class: 'hd' }, ''), h('div', { class: 'hd' }, 'Text (neurotransmitter)'), h('div', { class: 'hd' }, 'Postcard (hormone)'), rows.map(r => [h('div', { class: 'k' }, r[0]), h('div', null, r[1]), h('div', null, r[2])]));
    }
    function quiz() {
      let score = 0, n = 0;
      const sc = h('span', null, `0 / ${QUIZ.length}`);
      const box = h('div', { class: 'tvp-quiz' }, h('h4', null, h('span', null, 'Text or postcard?'), sc));
      QUIZ.forEach(([q, a, why]) => {
        const w = h('div', { class: 'why', 'aria-live': 'polite' });
        let doneQ = false, tried = false;
        const bs = ['Text', 'Postcard'].map((t, i) => { const b = h('button', { type: 'button' }, t); b.addEventListener('click', () => {
          if (doneQ) return;
          if (i === a) { doneQ = true; b.classList.add('right'); if (!tried) { score++; api.addXP(1); } n++; sc.textContent = `${score} / ${QUIZ.length}`; w.textContent = why; sfx.good(); if (n === QUIZ.length && score === QUIZ.length) { sfx.win(); } }
          else { tried = true; b.classList.add('wrong'); sfx.bad(); w.textContent = 'Not quite. Think about speed, route, and how long it lasts.'; }
        }); return b; });
        box.append(h('div', { class: 'tvp-q' }, h('p', null, q), h('div', { class: 'opts' }, bs), w));
      });
      return box;
    }
    return () => { cancelAnimationFrame(raf); raf = 0; };
  }
});
})();
