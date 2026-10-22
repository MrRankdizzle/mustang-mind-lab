/* sleep-clinic: diagnosis game. Read a patient's story and sleep-lab data, pick the sleep disorder,
   and learn which sleep stage is involved. Uses ML.w2. */
(function () {
'use strict';
const DX = {
  insomnia: 'Insomnia', narco: 'Narcolepsy', apnea: 'Sleep apnea', rbd: 'REM sleep behavior disorder',
  walk: 'Sleepwalking (somnambulism)', terror: 'Night terrors', hypna: 'Hypnagogic sensation (normal)'
};
const CASES = [
  { a: 'insomnia', who: 'Maya', age: 16, story: '“I lie in bed for over an hour almost every night before I fall asleep. Then I wake up at 3 AM and can’t get back to sleep. It’s been months, and I’m exhausted in class.”',
    lab: { type: 'hyp', segs: [['W', 75], ['N1', 5], ['N2', 20], ['N3', 30], ['N2', 15], ['R', 15], ['N2', 25], ['W', 70], ['N1', 5], ['N2', 30], ['R', 20], ['W', 20]], note: 'Long stretches awake at bedtime and in the middle of the night.' },
    stage: 'Not one stage: trouble falling asleep or staying asleep.', why: 'Insomnia is recurring trouble falling or staying asleep. Stress, screens, and caffeine make it worse. Sleeping pills and alcohol can make it worse over time, partly by cutting REM.' },
  { a: 'apnea', who: 'Derek', age: 52, story: 'His wife says he snores like a chainsaw, goes silent, then gasps and snorts. He wakes with headaches and nods off at red lights, even after “8 hours” in bed.',
    lab: { type: 'breath', note: 'Breathing stops again and again; oxygen drops; he wakes briefly each time.' },
    stage: 'Breathing stops repeatedly, causing many brief awakenings, so he rarely reaches deep N3 or REM.', why: 'Sleep apnea: the airway closes or breathing pauses during sleep. Each pause ends with a mini-awakening he doesn’t remember, so he is sleepy all day. Treatable with a CPAP machine.' },
  { a: 'narco', who: 'Jordan', age: 19, story: 'He falls asleep in the middle of conversations and once during a test. When he laughs hard, his knees buckle and he collapses, but he stays aware the whole time.',
    lab: { type: 'hyp', segs: [['W', 3], ['R', 14], ['W', 6]], nap: true, note: 'Daytime nap test: asleep in about 2 minutes and straight into REM.' },
    stage: 'REM: sleep attacks can drop straight into REM, skipping NREM.', why: 'Narcolepsy causes sudden, uncontrollable sleep attacks. Cataplexy (going limp during strong emotion like laughter) is REM’s muscle paralysis showing up while awake.' },
  { a: 'rbd', who: 'Walter', age: 68, story: 'He punched the headboard and fell out of bed while “fighting off a bear” in his dream. When his wife woke him, he described the dream in detail.',
    lab: { type: 'hyp', segs: [['W', 10], ['N1', 5], ['N2', 20], ['N3', 40], ['N2', 15], ['R', 15], ['N2', 30], ['N3', 20], ['N2', 15], ['R', 25], ['N2', 40], ['R', 35]], events: [['R', 0.75, 'kicks'], ['R', 0.94, 'punches']], note: 'Big movements happen only during REM periods.' },
    stage: 'REM: the normal REM paralysis fails.', why: 'REM sleep behavior disorder: the body is supposed to be paralyzed during REM. When that fails, people act out their dreams. It is most common in older men.' },
  { a: 'walk', who: 'Eli', age: 9, story: 'His parents found him in the kitchen at midnight, eyes open with a blank stare, opening the fridge. He didn’t answer them, and the next morning he remembered nothing.',
    lab: { type: 'hyp', segs: [['W', 10], ['N1', 5], ['N2', 15], ['N3', 45], ['N2', 15], ['R', 10], ['N2', 20], ['N3', 30], ['N2', 20], ['R', 25]], events: [['N3', 0.26, 'walking']], note: 'The episode starts during deep sleep about an hour after bedtime.' },
    stage: 'NREM 3 (deep sleep): the muscles are NOT paralyzed, so you can get up and move.', why: 'Somnambulism (sleepwalking) happens in deep NREM sleep, mostly early in the night. It is common in kids, and it is not acting out a dream.' },
  { a: 'terror', who: 'Sofia', age: 5, story: 'About an hour after bedtime she sits up screaming, sweating, heart pounding. She doesn’t respond when her parents comfort her, and in the morning she remembers nothing.',
    lab: { type: 'hyp', segs: [['W', 10], ['N1', 5], ['N2', 15], ['N3', 45], ['N2', 15], ['R', 10], ['N2', 20], ['N3', 30], ['N2', 20], ['R', 25]], events: [['N3', 0.28, 'screaming']], note: 'Heart rate spikes during deep sleep early in the night.' },
    stage: 'NREM 3 (deep sleep), early in the night.', why: 'Night terrors happen in deep NREM sleep, mostly in children, and are rarely remembered. Nightmares are different: they happen in REM, usually toward morning, and you remember them.' },
  { a: 'hypna', who: 'Liam', age: 15, story: '“Just as I’m drifting off, I feel like I’m falling, and my whole body jerks awake. It happens every once in a while.”',
    lab: { type: 'hyp', segs: [['W', 12], ['N1', 4], ['W', 2], ['N1', 6], ['N2', 20], ['N3', 40], ['N2', 15], ['R', 15]], events: [['N1', 0.13, 'jerk']], note: 'A sudden twitch right at sleep onset, then a normal night.' },
    stage: 'NREM 1 (light sleep, just as you fall asleep).', why: 'Hypnagogic sensations (falling feelings, hypnic jerks, hearing your name) are common and normal. They happen more often when you are overtired or stressed. Not a disorder!' },
  { a: 'insomnia', who: 'Priya', age: 34, story: '“Ever since I started a stressful job, my mind races at night. I check my phone, watch the clock, and finally fall asleep around 2 AM. This has gone on for three months.”',
    lab: { type: 'hyp', segs: [['W', 150], ['N1', 5], ['N2', 20], ['N3', 25], ['N2', 20], ['R', 20], ['N2', 30], ['R', 25]], note: 'Almost 3 hours awake before sleep finally starts.' },
    stage: 'Not one stage: trouble falling asleep (and a shortened night).', why: 'Insomnia is recurring trouble falling or staying asleep. Racing thoughts and phone light at night keep the SCN and the brain in “daytime” mode.' },
  { a: 'apnea', who: 'Ray', age: 45, story: 'A truck driver who never feels rested. His partner hears loud snoring with long pauses in his breathing. The sleep lab counted more than 30 breathing pauses per hour.',
    lab: { type: 'breath', note: 'Repeated pauses in breathing, each followed by a gasp.' },
    stage: 'All night: pauses in breathing fragment sleep, especially deep N3 and REM.', why: 'Sleep apnea causes repeated breathing stops and brief awakenings, leading to dangerous daytime sleepiness. Risk goes up with age and weight.' },
  { a: 'narco', who: 'Ava', age: 17, story: 'Even after 9 hours of sleep, she suddenly falls asleep in class. As she nods off, she sees vivid dreamlike images, and sometimes she can’t move for a moment when she wakes up.',
    lab: { type: 'hyp', segs: [['W', 4], ['R', 16], ['W', 6]], nap: true, note: 'Daytime nap test: REM within about 3 minutes.' },
    stage: 'REM: sleep attacks can slip right into REM.', why: 'Narcolepsy: uncontrollable sleep attacks, often straight into REM, sometimes with vivid hallucinations and brief paralysis at sleep onset or waking. It involves the brain’s sleep-wake control system.' }
];

ML.w2.css('sleep-clinic-css', `
.slc-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.slc-card { border: 1.5px solid var(--line); border-radius: 16px; background: var(--surface-2); padding: 14px; display: grid; gap: 10px; }
.slc-who { display: flex; gap: 12px; align-items: center; }
.slc-av { width: 46px; height: 46px; border-radius: 50%; background: var(--spark-soft); color: var(--spark); display: grid; place-items: center; font: 400 18px var(--f-display); flex: none; }
.slc-name { font-weight: 700; font-size: 17px; }
.slc-story { font-size: 16.5px; margin: 0; }
.slc-lab { background: #0B1222; border-radius: 12px; padding: 8px 10px 6px; }
.slc-lab svg { width: 100%; max-width: 480px; margin: 0 auto; height: auto; display: block; }
.slc-labt { color: #8EA0C4; font: 700 11px var(--f-mono); letter-spacing: .06em; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.slc-labn { color: #E8F0FF; font-size: 13.5px; margin-top: 2px; }
.slc-ch { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
@media (min-width: 640px) { .slc-ch { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.slc-ch .btn { width: 100%; text-align: left; justify-content: flex-start; font-size: 15px; padding: 10px 12px; min-height: 48px; }
.slc-ch .btn.right { border-color: var(--good); background: var(--good-soft); color: var(--good); opacity: 1; }
.slc-ch .btn.wrong { border-color: var(--bad); background: var(--bad-soft); color: var(--bad); }
.slc-stage { font-weight: 700; }
`);

ML.registerWidget('sleep-clinic', {
  title: 'Sleep clinic', tag: 'Diagnosis game',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Read each patient’s story and sleep-lab data, then choose the diagnosis.');
    const prog = h('span', { class: 'w2-tag' }), scoreEl = h('span', { class: 'w2-score' });
    const card = h('div', { class: 'slc-card' });
    const ch = h('div', { class: 'slc-ch', role: 'group', 'aria-label': 'Diagnoses' });
    const fb = h('div', { class: 'w2-fb', 'aria-live': 'polite' });
    root.append(inst, h('div', { class: 'slc-top' }, prog, scoreEl), card, ch, fb);
    el.append(root);
    let deck = [], i = 0, score = 0, tries = 0, loop = null;

    function labChart(lab) {
      const svg = S('svg', { viewBox: '0 0 320 98', role: 'img', 'aria-label': lab.note });
      const ink = '#E8F0FF', dim = '#8EA0C4', grid = '#24325A';
      if (lab.type === 'hyp') {
        const total = lab.segs.reduce((a, s) => a + s[1], 0);
        const X0 = 36, X1 = 314, Y0 = 8, HH = 72;
        ['W', 'R', '1', '2', '3'].forEach((l, k) => { const y = Y0 + k * HH / 4; S('line', { x1: X0, y1: y, x2: X1, y2: y, style: `stroke:${grid}` }, svg); const t = S('text', { x: 4, y: y + 4, style: `fill:${dim};font:700 12px var(--f-mono)` }, svg); t.textContent = l === 'W' ? 'W' : l === 'R' ? 'REM' : 'N' + l; });
        S('path', { d: W2.hypnoPath(lab.segs, X0, Y0, X1 - X0, HH, total), style: 'fill:none;stroke:#7CC0EE;stroke-width:2;stroke-linejoin:round' }, svg);
        let t = 0; lab.segs.forEach(([st, m]) => { if (st === 'R') S('line', { x1: X0 + t / total * (X1 - X0) + 1, y1: Y0 + HH / 4, x2: X0 + (t + m) / total * (X1 - X0) - 1, y2: Y0 + HH / 4, style: 'stroke:#FF6B81;stroke-width:5;stroke-linecap:round' }, svg); t += m; });
        (lab.events || []).forEach(([st, f, label]) => {
          const x = X0 + f * (X1 - X0), y = Y0 + W2.STAGE_Y[st === 'R' ? 'R' : st] * HH / 4;
          const g = S('g', null, svg);
          S('circle', { cx: x, cy: y, r: 7, style: 'fill:#FFD166;stroke:#0B1222;stroke-width:2', class: 'slc-pulse' }, g);
          const tx = S('text', { x, y: y + 3.5, 'text-anchor': 'middle', style: 'fill:#0B1222;font:700 10px var(--f-mono)' }, g); tx.textContent = '!';
          const lb = S('text', { x: Math.min(X1 - 2, Math.max(X0 + 30, x)), y: y > 50 ? y - 11 : y + 20, 'text-anchor': 'middle', style: 'fill:#FFD166;font:700 13px var(--f-mono)' }, g); lb.textContent = label;
        });
        const ax = S('text', { x: X1, y: 94, 'text-anchor': 'end', style: `fill:${dim};font:700 12px var(--f-mono)` }, svg); ax.textContent = lab.nap ? 'daytime nap, ~25 min' : 'one night →';
      } else {
        // breathing trace with pauses + oxygen line
        const br = S('path', { style: 'fill:none;stroke:#35E3A7;stroke-width:2' }, svg);
        const ox = S('path', { style: 'fill:none;stroke:#FFD166;stroke-width:2' }, svg);
        const l1 = S('text', { x: 4, y: 14, style: `fill:${dim};font:700 10px var(--f-mono)` }, svg); l1.textContent = 'BREATHING';
        const l2 = S('text', { x: 4, y: 70, style: `fill:${dim};font:700 10px var(--f-mono)` }, svg); l2.textContent = 'OXYGEN';
        const draw = tm => {
          let d = '', o = '';
          for (let x = 0; x <= 320; x += 2) {
            const tt = tm / 1000 * 1.2 + x / 40; const cyc = tt % 6; // 6-unit cycle: 3.4 breathing, 2 pause, gasp
            let v = 0; if (cyc < 3.4) v = Math.sin(cyc * Math.PI * 2 / 1.1) * 0.7; else if (cyc < 5.4) v = 0.03 * Math.sin(cyc * 30); else v = Math.sin((cyc - 5.4) * Math.PI / 0.6) * 1.15;
            d += (x ? 'L' : 'M') + x + ',' + (40 - v * 18).toFixed(1);
            const lag = ((tt - 1.2) % 6 + 6) % 6; const sat = lag < 3.4 ? 0.95 - 0.02 * lag / 3.4 : lag < 5.4 ? 0.93 - 0.11 * (lag - 3.4) / 2 : 0.82 + 0.13 * (lag - 5.4) / 0.6;
            o += (x ? 'L' : 'M') + x + ',' + (86 - (sat - 0.78) * 90).toFixed(1);
          }
          br.setAttribute('d', d); ox.setAttribute('d', o);
        };
        draw(0);
        if (!api.reduceMotion) { if (loop) loop.stop(); loop = W2.loop(svg, (dt, tm) => draw(tm)); }
        const p = S('text', { x: 316, y: 14, 'text-anchor': 'end', style: 'fill:#FF6B81;font:700 10px var(--f-mono)' }, svg); p.textContent = 'flat = breathing stopped';
      }
      return svg;
    }
    function start() { deck = ML.util.shuffle(CASES); i = 0; score = 0; show(); }
    function show() {
      const c = deck[i]; tries = 0;
      if (loop) { loop.stop(); loop = null; }
      prog.textContent = `Patient ${i + 1} of ${deck.length}`; scoreEl.textContent = `Score ${score}`;
      card.innerHTML = '';
      card.append(h('div', { class: 'slc-who' }, h('div', { class: 'slc-av', 'aria-hidden': 'true' }, c.who[0]), h('div', null, h('div', { class: 'slc-name' }, c.who), h('div', { class: 'muted', style: { fontSize: '14px' } }, `Age ${c.age}`))),
        h('p', { class: 'slc-story' }, c.story),
        h('div', { class: 'slc-lab' }, h('div', { class: 'slc-labt' }, h('span', null, 'SLEEP LAB DATA'), h('span', null, c.lab.type === 'breath' ? 'overnight breathing monitor' : 'hypnogram')), labChart(c.lab), h('div', { class: 'slc-labn' }, c.lab.note)));
      ch.innerHTML = '';
      Object.entries(DX).forEach(([k, label]) => {
        const b = h('button', { type: 'button', class: 'btn' }, label);
        b.addEventListener('click', () => pick(k, b));
        ch.append(b);
      });
      fb.className = 'w2-fb'; fb.textContent = 'What is your diagnosis?';
    }
    function pick(k, b) {
      const c = deck[i];
      if (b.disabled) return;
      if (k === c.a) {
        b.classList.add('right'); ch.querySelectorAll('.btn').forEach(x => x.disabled = true);
        if (!tries) { score++; api.addXP(2); }
        scoreEl.textContent = `Score ${score}`; api.sfx.good();
        fb.className = 'w2-fb good'; fb.innerHTML = '';
        const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '10px', display: 'flex' } }, i + 1 < deck.length ? 'Next patient' : 'See results');
        next.addEventListener('click', () => { i++; if (i < deck.length) { show(); card.scrollIntoView({ block: 'nearest', behavior: api.reduceMotion ? 'auto' : 'smooth' }); } else end(); });
        fb.append(h('div', null, h('strong', null, `Diagnosis: ${DX[k]}. `), c.why), h('div', { class: 'slc-stage', style: { marginTop: '6px' } }, 'Sleep stage: ', h('span', { style: { fontWeight: 400 } }, c.stage)), next);
        next.focus({ preventScroll: true });
      } else {
        tries++; b.classList.add('wrong'); b.disabled = true; api.sfx.bad();
        fb.className = 'w2-fb bad'; fb.innerHTML = '';
        const hints = { insomnia: 'Insomnia is trouble falling or staying asleep, not strange behavior during sleep.', narco: 'Narcolepsy means sudden sleep attacks during the DAY.', apnea: 'Apnea is about breathing stopping during sleep.', rbd: 'RBD means acting out a dream during REM, and the person usually remembers the dream.', walk: 'Sleepwalking means getting up and moving around in deep sleep.', terror: 'Night terrors are screaming panic episodes in deep sleep, not remembered.', hypna: 'Hypnagogic sensations happen just as you fall asleep and are harmless.' };
        fb.append(h('strong', null, 'Not quite. '), hints[k], ' Look at the clues again.');
      }
    }
    function end() {
      if (loop) { loop.stop(); loop = null; }
      card.innerHTML = ''; ch.innerHTML = '';
      prog.textContent = 'Clinic closed';
      const pct = score / deck.length;
      fb.className = 'w2-fb ' + (pct >= .7 ? 'good' : 'warn'); fb.innerHTML = '';
      const again = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '10px', display: 'flex' } }, 'See new patients');
      again.addEventListener('click', start);
      fb.append(h('div', { style: { fontWeight: 700, fontSize: '19px' } }, `${score} of ${deck.length} diagnosed on the first try`),
        h('div', null, 'Remember the stage clues: sleepwalking and night terrors = deep NREM 3; acting out dreams = REM; falling feeling = NREM 1; sleep attacks straight into REM = narcolepsy.'), again);
      if (pct >= .7) { api.sfx.win(); const r = fb.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top, 70); }
      again.focus({ preventScroll: true });
    }
    start();
    return () => { if (loop) loop.stop(); bag.destroy(); };
  }
});
})();
