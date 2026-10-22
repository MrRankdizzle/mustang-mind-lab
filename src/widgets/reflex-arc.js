/* reflex-arc — hot stove (and knee-jerk) reflex: receptor → sensory neuron → interneuron → motor neuron → muscle, THEN the brain. */
(function () {
'use strict';
const CSS = `
.ra { display: flex; flex-direction: column; gap: 12px; }
.ra-ins { font-size: 15px; color: var(--muted); }
.ra-top { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ra-scene { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); overflow: hidden; }
.ra-scene svg { width: 100%; max-width: 520px; display: block; margin: 0 auto; }
.ra-path { display: flex; gap: 6px; align-items: center; justify-content: center; flex-wrap: wrap; font-family: var(--f-mono); font-weight: 700; font-size: 13px; }
.ra-path span.c { padding: 4px 10px; border-radius: 99px; border: 1.5px solid var(--line); color: var(--muted); transition: all .25s; }
.ra-path span.c.on { color: var(--surface); }
.ra-path span.c.pns.on { background: var(--good); border-color: var(--good); }
.ra-path span.c.cns.on { background: var(--carolina); border-color: var(--carolina); }
.ra-path span.c.br.on { background: #7A6FE0; border-color: #7A6FE0; }
.ra-path i { font-style: normal; color: var(--muted); }
.ra-cap { border-radius: 14px; background: var(--surface-2); border-left: 5px solid var(--spark); padding: 10px 14px; display: grid; gap: 4px; min-height: 86px; }
.ra-cap .n { font-family: var(--f-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; font-weight: 700; color: var(--spark); }
.ra-cap b { font-size: 17px; }
.ra-cap p { font-size: 15px; }
.ra-ctrl { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ra-dots { display: flex; gap: 5px; margin-left: auto; }
.ra-dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--line); }
.ra-dots i.on { background: var(--spark); }
`;
const C = { sen: 'var(--carolina)', int: 'var(--warn)', mot: 'var(--spark)', up: '#7A6FE0' };
const SC = {
  stove: {
    label: 'Hot stove', angle: -52, pivot: [220, 138],
    steps: [
      ['Ready', 'Your hand is about to touch a hot burner. Tap Next (or Play) to follow the message.', null],
      ['Receptors in the skin', 'Heat and pain receptors in your fingertip detect the burner.', 'pns'],
      ['Sensory (afferent) neuron', 'The sensory neuron carries the message from your hand TO the spinal cord.', 'pns'],
      ['Interneuron in the spinal cord', 'An interneuron in the spinal cord connects the sensory neuron to a motor neuron. The spinal cord handles this without waiting for the brain.', 'cns'],
      ['Motor (efferent) neuron', 'The motor neuron carries the command FROM the spinal cord out to your arm muscle.', 'pns'],
      ['Muscle pulls your hand away', 'Your biceps contracts and yanks your hand off the stove, all without a conscious decision.', 'pns'],
      ['THEN the brain feels it', 'Another message travels up the spinal cord to the brain. Only now do you feel "OUCH!" Your hand had already moved.', 'br']
    ] },
  knee: {
    label: 'Knee-jerk', angle: -48, pivot: [250, 128],
    steps: [
      ['Ready', 'The doctor is about to tap just below your kneecap. Tap Next (or Play).', null],
      ['Stretch receptors', 'The hammer tap stretches the tendon and thigh muscle. Stretch receptors in the muscle detect it.', 'pns'],
      ['Sensory (afferent) neuron', 'The sensory neuron races the message TO the spinal cord.', 'pns'],
      ['Spinal cord connection', 'In this reflex the sensory neuron connects straight to the motor neuron, which makes it extra fast. (An interneuron also relaxes the opposite muscle.)', 'cns'],
      ['Motor (efferent) neuron', 'The motor neuron carries the command FROM the spinal cord to the thigh muscle.', 'pns'],
      ['Quadriceps contracts: kick!', 'The thigh muscle contracts and your lower leg kicks forward before you decide anything.', 'pns'],
      ['THEN the brain notices', 'A message travels up to the brain, and you notice the tap and the kick a split second later.', 'br']
    ] }
};
const DUR = [0, 900, 1300, 800, 1200, 750, 1400];
const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;

ML.registerWidget('reflex-arc', {
  title: 'Trace a reflex arc', tag: 'Step-through animation',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('ra-css')) document.head.append(h('style', { id: 'ra-css' }, CSS));
    let sc = 'stove', k = 0, u = 1, raf = 0, playing = false, t0 = 0, timer = 0;
    const root = h('div', { class: 'ra' });
    const ins = h('p', { class: 'ra-ins' }, 'Tap Next to move the message one step at a time, or Play to watch the whole reflex.');
    const scBtns = Object.entries(SC).map(([key, S]) => {
      const b = h('button', { type: 'button', class: 'chip', 'data-sc': key, 'aria-pressed': String(key === sc) }, S.label);
      b.addEventListener('click', () => { stop(); sc = key; scBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); build(); goto(0, true); sfx.tap(); });
      return b;
    });
    const svg = svgEl('svg', { viewBox: '0 0 360 250', role: 'img', 'aria-label': 'Reflex arc diagram' });
    const chips = [['pns', 'PNS'], ['cns', 'CNS'], ['pns', 'PNS'], ['br', 'Brain']].map(([c, t]) => h('span', { class: 'c ' + c }, t));
    const pathRow = h('div', { class: 'ra-path', 'aria-hidden': 'true' }, chips[0], h('i', null, '→'), chips[1], h('i', null, '→'), chips[2], h('i', null, '→'), chips[3]);
    const cap = h('div', { class: 'ra-cap', 'aria-live': 'polite' });
    const prev = h('button', { type: 'button', class: 'btn btn-sm ra-prev', 'aria-label': 'Previous step' }, '◀ Back');
    const next = h('button', { type: 'button', class: 'btn btn-sm btn-primary ra-next', 'aria-label': 'Next step' }, 'Next ▶');
    const play = h('button', { type: 'button', class: 'btn btn-sm ra-play' }, '▶ Play');
    const reset = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Reset to the start' }, '↺');
    const dots = h('div', { class: 'ra-dots', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5, 6].map(() => h('i')));
    root.append(ins, h('div', { class: 'ra-top', role: 'group', 'aria-label': 'Reflex' }, scBtns), h('div', { class: 'ra-scene' }, svg), pathRow, cap, h('div', { class: 'ra-ctrl' }, prev, next, play, reset, dots));
    el.append(root);

    let E = {};
    function build() {
      const knee = sc === 'knee';
      const skin = '#E9B48C', skinD = '#C98B62';
      const cord = `
        <rect x="8" y="8" width="128" height="226" rx="16" style="fill:var(--carolina-soft);opacity:.55"/>
        <text x="20" y="226" style="font-family:var(--f-mono);font-size:13px;font-weight:700;fill:var(--carolina)">CNS</text>
        <text x="330" y="30" text-anchor="end" style="font-family:var(--f-mono);font-size:13px;font-weight:700;fill:var(--good)">PNS</text>
        <path d="M34 44 C30 20 58 10 74 16 C92 6 118 18 112 40 C124 52 110 70 94 66 C84 76 58 76 50 66 C30 70 22 54 34 44Z" style="fill:#F2B8C6;stroke:#C7778B;stroke-width:2"/>
        <path d="M50 36 q10 -8 18 0 M74 30 q10 8 20 0" style="fill:none;stroke:#C7778B;stroke-width:1.6"/>
        
        <rect x="62" y="68" width="18" height="62" rx="9" style="fill:#F4E6C8;stroke:#C9B07A;stroke-width:1.5"/><text x="72" y="58" text-anchor="middle" style="font-size:12px;font-weight:700;fill:#8A3B52">BRAIN</text>
        <ellipse cx="72" cy="160" rx="42" ry="33" style="fill:#F4E6C8;stroke:#C9B07A;stroke-width:2"/>
        <path d="M52 134 Q60 148 66 154 L78 154 Q84 148 92 134 Q100 146 90 160 Q100 174 94 188 Q84 172 78 166 L66 166 Q60 172 50 188 Q44 174 54 160 Q44 146 52 134Z" style="fill:#B9A6C9;opacity:.85"/>
        <text x="72" y="210" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--muted)">spinal cord (slice)</text>
        <ellipse cx="122" cy="128" rx="8" ry="6" style="fill:#D7C49A;stroke:#B39A64"/>`;
      let limb, nerves;
      if (!knee) {
        limb = `
          <rect x="250" y="206" width="104" height="44" rx="4" style="fill:var(--line)"/>
          <rect x="262" y="202" width="80" height="8" rx="4" class="ra-burner" style="fill:#E5485F"/>
          <g class="ra-heat">${[278, 300, 322].map(x => `<path d="M${x} 196 q-5 -7 0 -14 t0 -14" style="fill:none;stroke:#FF9F5A;stroke-width:2.4;stroke-linecap:round"/>`).join('')}</g>
          <circle cx="150" cy="106" r="20" style="fill:${skin}"/>
          <path d="M150 106 L220 138" style="stroke:${skin};stroke-width:24;stroke-linecap:round"/>
          <ellipse class="ra-muscle" cx="186" cy="114" rx="20" ry="9" transform="rotate(24 186 114)" style="fill:${skinD}"/>
          <g class="ra-swing"><path d="M220 138 L284 188" style="stroke:${skin};stroke-width:20;stroke-linecap:round"/><ellipse cx="294" cy="196" rx="15" ry="9" transform="rotate(38 294 196)" style="fill:${skin}"/>
            <path class="ra-n sen0" d="M300 200 L284 186 Q252 162 220 138" style="fill:none;stroke-width:3;stroke-linecap:round"/>
            <circle class="ra-rec" cx="300" cy="201" r="6" style="fill:none;stroke:var(--carolina);stroke-width:2.5;opacity:0"/></g>
          <path class="ra-n sen1" d="M220 138 Q185 118 150 104 Q132 110 122 128 Q104 140 86 146" style="fill:none;stroke-width:3;stroke-linecap:round"/>`;
        nerves = `<path class="ra-n int" d="M86 146 Q70 152 74 164 Q76 172 80 176" style="fill:none;stroke-width:3;stroke-linecap:round"/>
          <path class="ra-n mot" d="M80 176 Q112 190 140 168 Q160 140 182 118" style="fill:none;stroke-width:3;stroke-linecap:round"/>`;
      } else {
        limb = `
          <rect x="140" y="132" width="90" height="10" rx="3" style="fill:var(--line)"/>
          <circle cx="150" cy="112" r="20" style="fill:${skin}"/>
          <path d="M150 112 L250 128" style="stroke:${skin};stroke-width:26;stroke-linecap:round"/>
          <ellipse class="ra-muscle" cx="202" cy="112" rx="28" ry="9" transform="rotate(9 202 112)" style="fill:${skinD}"/>
          <g class="ra-swing"><path d="M250 128 L262 210" style="stroke:${skin};stroke-width:20;stroke-linecap:round"/><ellipse cx="276" cy="216" rx="18" ry="8" style="fill:${skin}"/>
            <circle class="ra-rec" cx="256" cy="144" r="6" style="fill:none;stroke:var(--carolina);stroke-width:2.5;opacity:0"/></g>
          <g class="ra-hammer" transform="translate(300 150)"><g class="ra-ham"><rect x="-2" y="-2" width="44" height="5" rx="2" style="fill:#8A6A45"/><rect x="-14" y="-9" width="16" height="18" rx="5" style="fill:#E5485F"/></g></g>`;
        nerves = `<path class="ra-n sen1" d="M214 114 Q182 106 150 104 Q132 110 122 128 Q104 140 86 146" style="fill:none;stroke-width:3;stroke-linecap:round"/>
          <path class="ra-n int" d="M86 146 Q90 160 80 176" style="fill:none;stroke-width:3;stroke-linecap:round"/>
          <path class="ra-n mot" d="M80 176 Q112 190 140 166 Q170 128 198 116" style="fill:none;stroke-width:3;stroke-linecap:round"/>`;
      }
      svg.innerHTML = cord + limb + nerves + `
        <path class="ra-n up" d="M66 150 L68 128 L70 70 L72 50" style="fill:none;stroke-width:3;stroke-linecap:round"/>
        <g class="ra-ouch" style="opacity:0"><path d="M124 18 h86 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-70 l-14 10 l2 -10 h-4 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10z" style="fill:var(--surface);stroke:#7A6FE0;stroke-width:2"/>
          <text x="167" y="44" text-anchor="middle" style="font-family:var(--f-display);font-size:16px;fill:#7A6FE0">${knee ? 'Whoa!' : 'OUCH!'}</text></g>
        <circle class="ra-pulse" r="7" style="fill:#FFD166;stroke:#E5485F;stroke-width:2.5;opacity:0"/>`;
      const q = s => svg.querySelector(s);
      E = { swing: q('.ra-swing'), muscle: q('.ra-muscle'), rec: q('.ra-rec'), heat: q('.ra-heat'), ouch: q('.ra-ouch'), pulse: q('.ra-pulse'), ham: q('.ra-ham'),
        legs: { 2: knee ? [q('.sen1')] : [q('.sen0'), q('.sen1')], 3: [q('.int')], 4: [q('.mot')], 6: [q('.up')] }, col: { 2: C.sen, 3: C.int, 4: C.mot, 6: C.up } };
      E.lens = {};
      svg.setAttribute('aria-label', knee ? 'Knee-jerk reflex: tap, stretch receptor, sensory neuron, spinal cord, motor neuron, thigh muscle, then the brain' : 'Hot stove reflex: skin receptors, sensory neuron, interneuron in the spinal cord, motor neuron, biceps, then the brain');
    }
    const len = p => { try { return p.getTotalLength(); } catch (e) { return 100; } };
    function render() {
      const S = SC[sc], knee = sc === 'knee';
      // nerve lighting
      [2, 3, 4, 6].forEach(st => {
        const ps = E.legs[st]; const Ls = ps.map(len); const tot = Ls.reduce((a, b) => a + b, 0);
        const prog = k > st ? 1 : k === st ? ease(u) : 0;
        let acc = 0;
        ps.forEach((p, i) => {
          const L = Ls[i]; const lit = Math.max(0, Math.min(1, (prog * tot - acc) / L)); acc += L;
          p.style.stroke = E.col[st];
          p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = String(L * (1 - lit));
          if (!p._ghost) { const g = p.cloneNode(); g.removeAttribute('class'); g.style.stroke = 'var(--line)'; g.style.strokeDasharray = 'none'; g.style.strokeDashoffset = '0'; g.style.strokeWidth = '3'; p.parentNode.insertBefore(g, p); p._ghost = g; }
        });
        if (k === st && u < 1) {
          let d = ease(u) * tot, i = 0; while (i < ps.length - 1 && d > Ls[i]) { d -= Ls[i]; i++; }
          const pt = ps[i].getPointAtLength(Math.min(d, Ls[i]));
          E.pulse.setAttribute('cx', pt.x); E.pulse.setAttribute('cy', pt.y); E.pulse.style.opacity = '1';
        }
      });
      if (!([2, 3, 4, 6].includes(k) && u < 1)) E.pulse.style.opacity = '0';
      // receptors
      E.rec.style.opacity = k >= 1 ? '1' : '0';
      E.rec.setAttribute('r', k === 1 ? 6 + Math.sin(u * Math.PI * 3) * 3 : 6);
      // muscle + swing
      const sw = k > 5 ? 1 : k === 5 ? ease(u) : 0;
      const [px, py] = S.pivot;
      E.swing.setAttribute('transform', `rotate(${S.angle * sw} ${px} ${py})`);
      E.muscle.setAttribute('ry', 9 + sw * 5);
      if (E.heat) E.heat.style.opacity = String(sw > 0.5 ? 0.25 : 1);
      if (E.ham) { const hit = k === 1 ? Math.sin(Math.min(1, u * 1.6) * Math.PI) : 0; E.ham.setAttribute('transform', `rotate(${-28 + hit * 28} 40 0)`); }
      E.ouch.style.opacity = k === 6 && u > 0.85 ? '1' : '0';
      // chips + caption
      const ch = [false, false, false, false];
      if (k === 1 || k === 2) ch[0] = true; if (k === 3) ch[1] = true; if (k === 4 || k === 5) ch[2] = true; if (k === 6) ch[3] = true;
      chips.forEach((c, i) => c.classList.toggle('on', ch[i]));
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i < k));
      prev.disabled = k === 0; next.disabled = k === 6 && u >= 1;
    }
    function caption() {
      const [t, d] = SC[sc].steps[k];
      cap.innerHTML = '';
      cap.append(h('span', { class: 'n' }, k === 0 ? (sc === 'knee' ? 'Knee-jerk reflex' : 'Hot stove reflex') : `Step ${k} of 6`), h('b', null, t), h('p', null, d));
    }
    function animate(onDone) {
      cancelAnimationFrame(raf);
      const dur = api.reduceMotion ? Math.min(DUR[k], 400) : DUR[k];
      t0 = performance.now(); u = 0;
      const f = now => {
        u = Math.min(1, (now - t0) / Math.max(1, dur));
        render();
        if (u < 1) raf = requestAnimationFrame(f); else { raf = 0; onDone && onDone(); }
      };
      raf = requestAnimationFrame(f);
    }
    function goto(n, instant, onDone) {
      k = Math.max(0, Math.min(6, n)); caption();
      if (instant || k === 0) { u = 1; render(); onDone && onDone(); return; }
      if (k === 1) sfx.tone(sc === 'knee' ? 300 : 900, 0.12, sc === 'knee' ? 'square' : 'sawtooth', 0.04);
      else if (k === 5) sfx.tone(180, 0.18, 'triangle', 0.12, 360);
      else if (k === 6) sfx.tone(700, 0.25, 'triangle', 0.1, 300);
      else sfx.tone(500 + k * 120, 0.1, 'sine', 0.06, 900 + k * 120);
      animate(onDone);
    }
    function stop() { playing = false; clearTimeout(timer); timer = 0; play.textContent = '▶ Play'; }
    function runFrom(n) {
      goto(n, false, () => {
        if (!playing) return;
        if (k < 6) timer = setTimeout(() => runFrom(k + 1), 1500);
        else { stop(); api.addXP(2); }
      });
    }
    next.addEventListener('click', () => { stop(); if (k < 6) goto(k + 1); });
    prev.addEventListener('click', () => { stop(); cancelAnimationFrame(raf); goto(k - 1, true); });
    reset.addEventListener('click', () => { stop(); cancelAnimationFrame(raf); goto(0, true); sfx.tap(); });
    play.addEventListener('click', () => {
      if (playing) { stop(); return; }
      playing = true; play.textContent = '❚❚ Pause';
      runFrom(k >= 6 ? 1 : k + 1);
    });
    build(); goto(0, true);
    return () => { stop(); cancelAnimationFrame(raf); };
  }
});
})();
