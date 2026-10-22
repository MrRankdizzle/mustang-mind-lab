/* fight-or-flight — body readouts driven by sympathetic arousal vs. parasympathetic calming, plus a "Big game day" timeline. */
(function () {
'use strict';
const CSS = `
.ff { display: flex; flex-direction: column; gap: 12px; }
.ff-ins { font-size: 15px; color: var(--muted); }
.ff-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.ff-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
@media (max-width: 620px) { .ff-main { grid-template-columns: 1fr; } }
.ff-fig { border: 1px solid var(--line); border-radius: 16px; background: var(--surface-2); overflow: hidden; position: relative; }
.ff-fig svg { width: 100%; max-width: 380px; display: block; margin: 0 auto; }
.ff-charge { display: grid; gap: 6px; }
.ff-charge .lab { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; font-family: var(--f-mono); letter-spacing: .06em; text-transform: uppercase; }
.ff-charge .lab span:first-child { color: var(--blank); } .ff-charge .lab span:last-child { color: var(--spark); }
.ff-dial { position: relative; height: 14px; border-radius: 8px; background: linear-gradient(90deg, var(--blank), var(--line) 50%, var(--spark)); }
.ff-knob { position: absolute; top: 50%; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%; background: var(--surface); border: 3px solid var(--ink); }
.ff-who { font-weight: 700; font-size: 16px; text-align: center; padding: 6px 10px; border-radius: 10px; transition: background .3s, color .3s; }
.ff-who.symp { background: var(--spark-soft); color: var(--spark); }
.ff-who.para { background: var(--blank-soft); color: var(--blank); }
.ff-reads { display: grid; gap: 8px; }
.ff-r { display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: center; background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; }
.ff-r .n { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.ff-r .v { font-family: var(--f-mono); font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums; text-align: right; }
.ff-r .b { grid-column: 1 / -1; height: 6px; border-radius: 4px; background: var(--line); overflow: hidden; }
.ff-r .b i { display: block; height: 100%; border-radius: 4px; }
.ff-heart { width: 18px; height: 18px; display: inline-block; }
.ff-cap { border-radius: 14px; background: var(--surface-2); border-left: 5px solid var(--carolina); padding: 10px 14px; font-size: 15px; min-height: 3.2em; }
.ff-cap b { display: block; font-size: 16px; }
.ff-tl { display: flex; gap: 4px; }
.ff-tl i { flex: 1; height: 6px; border-radius: 4px; background: var(--line); transition: background .3s; }
.ff-tl i.done { background: var(--carolina); } .ff-tl i.now { background: var(--spark); }
`;
const GAME = [
  ['7:00 AM · Breakfast', 0.08, 'Rest-and-digest: the parasympathetic division keeps your heart slow and your stomach busy with breakfast.'],
  ['3:30 PM · Bus to the game', 0.42, 'Butterflies! The sympathetic division starts to rise. Blood shifts away from your stomach, so digestion slows.'],
  ['Warm-ups', 0.62, 'Heart rate and breathing climb to fuel your muscles.'],
  ['Kickoff!', 0.96, 'Full fight-or-flight: racing heart, fast breathing, wide pupils, sweat, and sugar released for energy.'],
  ['Halftime', 0.52, 'You catch your breath, but adrenaline is still in your blood, so you stay revved up.'],
  ['Final whistle: you won!', 0.8, 'Excitement is arousal too, so the sympathetic division spikes again.'],
  ['Bus ride home', 0.3, 'The parasympathetic division takes over and slowly brings you back toward homeostasis.'],
  ['Team dinner', 0.05, 'Rest-and-digest: heart rate is back down and your stomach gets to work.']
];
const lerp = (a, b, t) => a + (b - a) * t;

ML.registerWidget('fight-or-flight', {
  title: 'Fight, flight, or rest?', tag: 'Body simulation',
  mount(el, api) {
    const { h, sfx, svgEl } = api;
    if (!document.getElementById('ff-css')) document.head.append(h('style', { id: 'ff-css' }, CSS));
    let a = 0.05, target = 0.05, raf = 0, last = 0, phase = 0, breath = 0, bear = 0, bearT = 0, vis = true, gameI = -1, gameTimer = 0;
    const root = h('div', { class: 'ff' });
    const ins = h('p', { class: 'ff-ins' }, 'Make a bear appear, then make it safe again, and watch which division of the autonomic nervous system takes charge. Or play the Big game day.');
    const bBear = h('button', { type: 'button', class: 'btn btn-spark ff-bear' }, 'A bear appears!');
    const bSafe = h('button', { type: 'button', class: 'btn ff-safe' }, 'Safe again');
    const bGame = h('button', { type: 'button', class: 'btn btn-primary ff-game' }, '▶ Big game day');
    const svg = svgEl('svg', { viewBox: '0 0 300 300', role: 'img', 'aria-label': 'A person whose body responds to stress' });
    const knob = h('div', { class: 'ff-knob' });
    const who = h('div', { class: 'ff-who para', 'aria-live': 'polite' });
    const heartIco = svgEl('svg', { viewBox: '0 0 24 24', class: 'ff-heart', 'aria-hidden': 'true' }); heartIco.innerHTML = '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" style="fill:var(--spark)"/>';
    const R = {};
    const row = (key, name, icon) => { const v = h('span', { class: 'v' }), i = h('i'); R[key] = { v, i }; return h('div', { class: 'ff-r' }, h('span', { class: 'n' }, icon || null, name), v, h('div', { class: 'b' }, i)); };
    const reads = h('div', { class: 'ff-reads' }, row('hr', 'Heart rate', heartIco), row('br', 'Breathing'), row('pu', 'Pupils'), row('di', 'Digestion'), row('sw', 'Sweat'), row('gl', 'Blood sugar for energy'));
    const cap = h('div', { class: 'ff-cap', 'aria-live': 'polite' }, h('b', null, 'Calm and safe'), 'The parasympathetic division is in charge: rest-and-digest.');
    const tl = h('div', { class: 'ff-tl', 'aria-hidden': 'true', hidden: true }, GAME.map(() => h('i')));
    root.append(ins, h('div', { class: 'ff-btns' }, bBear, bSafe, bGame),
      h('div', { class: 'ff-main' }, h('div', { class: 'stack', style: { gap: '10px' } }, h('div', { class: 'ff-fig' }, svg),
        h('div', { class: 'ff-charge' }, h('div', { class: 'lab', 'aria-hidden': 'true' }, h('span', null, 'Parasympathetic'), h('span', null, 'Sympathetic')), h('div', { class: 'ff-dial', 'aria-hidden': 'true' }, knob), who)),
        h('div', { class: 'stack', style: { gap: '10px' } }, reads, tl, cap)));
    el.append(root);

    const skin = '#E9B48C';
    svg.innerHTML = `
      <rect x="0" y="262" width="300" height="38" style="fill:var(--good-soft)"/>
      <g class="ff-bearg" style="opacity:0"><g transform="translate(232 196)">
        <ellipse cx="0" cy="22" rx="44" ry="40" style="fill:#6B4423"/><circle cx="-6" cy="-30" r="26" style="fill:#6B4423"/><circle cx="-26" cy="-50" r="9" style="fill:#6B4423"/><circle cx="12" cy="-52" r="9" style="fill:#6B4423"/>
        <ellipse cx="-24" cy="-24" rx="11" ry="8" style="fill:#A97B50"/><circle cx="-30" cy="-27" r="3.5" style="fill:#222"/><circle cx="-14" cy="-36" r="3" style="fill:#222"/><circle cx="2" cy="-36" r="3" style="fill:#222"/>
        <path d="M-34 -16 l4 6 l4 -6 l4 6 l4 -6" style="fill:none;stroke:#fff;stroke-width:2"/>
        <rect x="-50" y="40" width="20" height="26" rx="8" style="fill:#5A381C"/><rect x="18" y="40" width="20" height="26" rx="8" style="fill:#5A381C"/></g></g>
      <g transform="translate(14 0)">
        <rect x="58" y="196" width="18" height="66" rx="9" style="fill:#3C5A85"/><rect x="88" y="196" width="18" height="66" rx="9" style="fill:#3C5A85"/>
        <path d="M54 90 Q82 78 110 90 L116 200 Q82 210 48 200Z" style="fill:var(--carolina);opacity:.9"/>
        <path d="M54 96 Q36 140 40 178" style="stroke:${skin};stroke-width:13;stroke-linecap:round;fill:none"/><path d="M110 96 Q128 140 124 178" style="stroke:${skin};stroke-width:13;stroke-linecap:round;fill:none"/>
        <rect x="74" y="72" width="16" height="16" style="fill:${skin}"/>
        <circle cx="82" cy="50" r="28" style="fill:${skin}"/>
        <path d="M56 42 Q60 18 82 20 Q106 18 108 42 Q96 30 82 32 Q66 30 56 42Z" style="fill:#4A3221"/>
        <g class="ff-eyes"><circle cx="72" cy="50" r="6.5" style="fill:#fff"/><circle cx="92" cy="50" r="6.5" style="fill:#fff"/><circle class="ff-pu" cx="72" cy="50" r="2.4" style="fill:#1B1B1B"/><circle class="ff-pu" cx="92" cy="50" r="2.4" style="fill:#1B1B1B"/></g>
        <path class="ff-mouth" d="M74 64 Q82 70 90 64" style="fill:none;stroke:#8A4B32;stroke-width:2.2;stroke-linecap:round"/>
        <g class="ff-sweat">${[[58, 36], [106, 40], [42, 120], [122, 118]].map(([x, y], i) => `<path class="drop" data-i="${i}" d="M${x} ${y} q-4 7 0 9 q4 -2 0 -9z" style="fill:#5BB8E8"/>`).join('')}</g>
        <g class="ff-lungs"><ellipse cx="70" cy="118" rx="12" ry="20" style="fill:#F2A1B5;opacity:.85"/><ellipse cx="96" cy="118" rx="12" ry="20" style="fill:#F2A1B5;opacity:.85"/></g>
        <g class="ff-hrt" transform="translate(86 128)"><path d="M0 9 C-14 0 -12 -10 -5 -10 C-2 -10 0 -7 0 -6 C0 -7 2 -10 5 -10 C12 -10 14 0 0 9Z" style="fill:#E5485F;stroke:#9E2236;stroke-width:1"/></g>
        <path d="M60 150 Q66 140 78 146 Q76 160 62 160Z" style="fill:#9E4B3A"/>
        <g class="ff-stom"><path class="sb" d="M84 148 Q100 144 100 158 Q100 174 86 172 Q80 166 86 160 Q90 154 84 148Z" style="fill:#F2B05A;stroke:#C77B2D;stroke-width:1.5"/></g>
        <g class="ff-sugar"></g>
      </g>`;
    const Q = s => svg.querySelector(s);
    const pupils = svg.querySelectorAll('.ff-pu'), drops = svg.querySelectorAll('.drop'), lungs = Q('.ff-lungs'), hrt = Q('.ff-hrt'), stom = Q('.ff-stom'), bearG = Q('.ff-bearg'), sugarG = Q('.ff-sugar'), mouth = Q('.ff-mouth');
    const sugars = [];
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); const ioT = setTimeout(() => io.observe(root), 80);

    function vals() {
      return { hr: lerp(66, 158, a), br: lerp(13, 34, a), pu: lerp(2.8, 7.6, a), di: lerp(100, 12, a), sw: a < 0.3 ? 0 : (a - 0.3) / 0.7, gl: a };
    }
    const col = t => t > 0.55 ? 'var(--spark)' : t > 0.3 ? 'var(--warn)' : 'var(--blank)';
    function paintReads() {
      const v = vals();
      R.hr.v.textContent = `${Math.round(v.hr)} bpm`; R.hr.i.style.width = `${(v.hr - 40) / 140 * 100}%`; R.hr.i.style.background = col(a);
      R.br.v.textContent = `${Math.round(v.br)} / min`; R.br.i.style.width = `${v.br / 40 * 100}%`; R.br.i.style.background = col(a);
      R.pu.v.textContent = `${v.pu.toFixed(1)} mm ${a > 0.45 ? 'dilated' : ''}`; R.pu.i.style.width = `${v.pu / 8 * 100}%`; R.pu.i.style.background = col(a);
      R.di.v.textContent = a > 0.45 ? 'slowed' : 'active'; R.di.i.style.width = `${v.di}%`; R.di.i.style.background = a > 0.45 ? 'var(--warn)' : 'var(--good)';
      R.sw.v.textContent = v.sw > 0.5 ? 'high' : v.sw > 0.05 ? 'some' : 'low'; R.sw.i.style.width = `${v.sw * 100}%`; R.sw.i.style.background = '#5BB8E8';
      R.gl.v.textContent = a > 0.45 ? 'released' : 'normal'; R.gl.i.style.width = `${30 + a * 70}%`; R.gl.i.style.background = col(a);
      knob.style.left = `${a * 100}%`;
      const symp = a > 0.45;
      if (who._s !== symp) { who._s = symp; who.className = 'ff-who ' + (symp ? 'symp' : 'para'); who.textContent = symp ? 'Sympathetic division in charge: fight-or-flight' : 'Parasympathetic division in charge: rest-and-digest'; }
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!vis) return;
      const tau = target > a ? 0.55 : 2.4; // arousal is fast; calming takes longer (adrenaline lingers)
      a += (target - a) * (1 - Math.exp(-dt / tau));
      const v = vals(), rm = api.reduceMotion;
      phase += v.hr / 60 * dt; breath += v.br / 60 * dt;
      const beat = Math.exp(-((phase % 1) * 9)) ;
      hrt.setAttribute('transform', `translate(86 128) scale(${(1 + (rm ? 0 : 0.28) * beat).toFixed(3)})`);
      heartIco.style.transform = `scale(${(1 + (rm ? 0 : 0.25) * beat).toFixed(3)})`;
      const bs = 1 + (rm ? 0 : 0.12) * Math.sin(breath * Math.PI * 2) * (0.5 + a);
      lungs.setAttribute('transform', `translate(83 118) scale(${bs.toFixed(3)}) translate(-83 -118)`);
      pupils.forEach(p => p.setAttribute('r', (1.6 + a * 3.6).toFixed(2)));
      drops.forEach((d, i) => { const on = v.sw > i * 0.22; d.style.opacity = on ? '1' : '0'; d.setAttribute('transform', on && !rm ? `translate(0 ${((t / 900 + i * 0.3) % 1) * 6})` : ''); });
      const wig = rm ? 0 : Math.sin(t / 260) * 2.4 * (v.di / 100);
      stom.setAttribute('transform', `translate(92 160) scale(${(1 + wig * 0.03).toFixed(3)} ${(1 - wig * 0.03).toFixed(3)}) translate(-92 -160)`);
      mouth.setAttribute('d', a > 0.55 ? 'M74 66 Q82 60 90 66' : 'M74 64 Q82 70 90 64');
      // bear slide
      bear += (bearT - bear) * (1 - Math.exp(-dt / 0.25));
      bearG.style.opacity = String(Math.min(1, bear * 1.4)); bearG.setAttribute('transform', `translate(${(1 - bear) * 80} 0)`);
      // sugar particles from the liver
      if (!rm && a > 0.45 && Math.random() < a * dt * 8 && sugars.length < 14) {
        const c = svgEl('circle', { r: 2.2, style: 'fill:#FFD166;stroke:#C9A445;stroke-width:.8' }); sugarG.append(c);
        sugars.push({ c, x: 70, y: 152, vx: (Math.random() - .3) * 30, vy: -20 - Math.random() * 30, life: 0 });
      }
      for (let i = sugars.length - 1; i >= 0; i--) { const s = sugars[i]; s.life += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.c.setAttribute('cx', s.x); s.c.setAttribute('cy', s.y); s.c.style.opacity = String(1 - s.life / 1.4); if (s.life > 1.4) { s.c.remove(); sugars.splice(i, 1); } }
      paintReads();
    }
    function setCap(title, text) { cap.innerHTML = ''; cap.append(h('b', null, title), text); }
    function stopGame() { clearTimeout(gameTimer); gameTimer = 0; gameI = -1; tl.hidden = true; bGame.textContent = '▶ Big game day'; }
    bBear.addEventListener('click', () => {
      stopGame(); target = 1; bearT = 1; sfx.boom(); sfx.tone(110, 0.4, 'sawtooth', 0.06, 70);
      setCap('A bear appears!', 'The sympathetic division fires: heart races, breathing speeds up, pupils widen, sweat starts, digestion pauses, and sugar is released for quick energy. Adrenaline joins in from the bloodstream.');
      svg.setAttribute('aria-label', 'A bear appears and the person goes into fight-or-flight');
    });
    bSafe.addEventListener('click', () => {
      stopGame(); target = 0.05; bearT = 0; sfx.tone(520, 0.3, 'sine', 0.08, 390);
      setCap('Safe again', 'The parasympathetic division calms the body back to homeostasis: heart slows, breathing deepens, digestion restarts. Notice that calming down takes longer than revving up, because adrenaline lingers in the blood.');
      svg.setAttribute('aria-label', 'The person is calm and safe');
    });
    function gameStep() {
      gameI++;
      [...tl.children].forEach((d, i) => d.className = i < gameI ? 'done' : i === gameI ? 'now' : '');
      if (gameI >= GAME.length) { stopGame(); setCap('Game day complete', 'Both divisions took turns all day. They work like a gas pedal (sympathetic) and a brake (parasympathetic) to keep you balanced.'); api.addXP(2); sfx.level(); return; }
      const [t, lvl, txt] = GAME[gameI];
      target = lvl; setCap(t, txt); sfx.tick ? sfx.tick() : sfx.blip();
      gameTimer = setTimeout(gameStep, 3200);
    }
    bGame.addEventListener('click', () => {
      if (gameI >= 0) { stopGame(); setCap('Paused', 'Tap Big game day to start again.'); return; }
      bearT = 0; tl.hidden = false; bGame.textContent = '■ Stop game day'; sfx.tap(); gameStep();
    });
    paintReads();
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); clearTimeout(gameTimer); clearTimeout(ioT); io.disconnect(); };
  }
});
})();
