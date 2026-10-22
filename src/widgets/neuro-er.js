/* neuro-er: "Neurologist on call" case game. Read a patient case, tap the damaged region on a brain diagram. Uses ML.w2. */
(function () {
'use strict';
const CASES = [
  { id: 'gage', view: 'lateral', a: ['pfc', 'frontal'], who: 'Phineas G.', age: '25, railroad foreman (1848)',
    story: 'An iron rod blasted up through his left cheek and out the top front of his skull. He survived, and he can still walk, talk, and remember. But friends say he is “no longer Gage”: rude, impulsive, and unable to stick to any plan.',
    dx: 'Frontal lobe damage, especially the prefrontal cortex', why: 'The prefrontal cortex handles judgment, planning, and impulse control, so personality changed while movement, speech, and memory survived. Frontal = thinking and doing.' },
  { id: 'broca', view: 'lateral', a: ['broca'], who: 'Mr. T.', age: '62, retired bus driver',
    story: 'After a stroke, he understands every question and follows directions perfectly. But speaking is a struggle. He says, slowly: “Walk... dog... park.” He knows what he wants to say and gets frustrated.',
    dx: 'Broca’s aphasia', why: 'Broca’s area in the LEFT frontal lobe plans the movements of speech. Comprehension is fine because Wernicke’s area is untouched.',
    near: { frontal: 'Right lobe. Now find the small speech-production area near the bottom of it.', wern: 'Close, but he UNDERSTANDS fine. Find the area that PRODUCES speech.' } },
  { id: 'wern', view: 'lateral', a: ['wern'], who: 'Ms. R.', age: '70, grandmother',
    story: 'After a stroke, she talks fast and fluently, but it makes no sense: “The flibber went sky store and the blue sandwich told me.” When you ask her to raise her hand, she just smiles and keeps talking.',
    dx: 'Wernicke’s aphasia', why: 'Wernicke’s area in the LEFT temporal lobe handles language comprehension. Damage gives fluent “word salad” and poor understanding.',
    near: { temporal: 'Right lobe. Now find the language-comprehension area toward its back.', broca: 'Her speech flows easily, so production is fine. Find where understanding happens.' } },
  { id: 'hm', view: 'inner', a: ['hippo'], who: 'Henry M.', age: '27, after brain surgery',
    story: 'Surgeons removed tissue deep in both temporal lobes to stop his seizures. Now he remembers his childhood clearly, but he cannot form new long-term memories. He greets his doctor every day as if they had never met.',
    dx: 'Hippocampus damage', why: 'The hippocampus forms and organizes NEW memories. Old memories were already stored in the cortex, so they survived. (HIPPO on CAMPUS.)',
    near: { amyg: 'Right neighborhood. That one handles fear. The memory maker is just behind it.' } },
  { id: 'cereb', view: 'lateral', a: ['cereb'], who: 'Jake', age: '17, skateboarder',
    story: 'He fell and hit the lowest part of the back of his skull. Now he sways when he stands, his steps are clumsy, and he cannot smoothly touch his finger to his nose. Riding a bike feels brand new again.',
    dx: 'Cerebellum injury', why: 'The cerebellum runs balance, coordination, and practiced skills like riding a bike. (“Get your bell rung.”)',
    near: { occipital: 'His vision is fine. Look just below that lobe.' } },
  { id: 'occ', view: 'lateral', a: ['occipital'], who: 'Ana', age: '45, accountant',
    story: 'After a fall onto the back of her head, her eye doctor says both eyes are perfectly healthy. Yet she cannot see anything in the RIGHT half of her view.',
    dx: 'Left occipital lobe damage', why: 'The occipital lobe processes vision. The LEFT occipital lobe handles the RIGHT half of what you see, from both eyes (contralateral). The eyes work; the brain cannot process the signal.' },
  { id: 'touch', view: 'lateral', a: ['somato'], who: 'Mr. K.', age: '58, chef',
    story: 'After a small stroke, he can still move his RIGHT hand normally, but he cannot feel touch, heat, or pain on it. He burned it on a pan without noticing. His left hand feels fine.',
    dx: 'Left somatosensory cortex damage', why: 'The somatosensory strip (front of the parietal lobe) registers touch. It is contralateral: the LEFT strip feels the RIGHT side of the body. His motor strip is fine, so he can still move.',
    near: { motor: 'That strip MOVES the hand, and his movement is fine. Find the strip that FEELS.', parietal: 'Right lobe. Now find the strip at its front edge.' } },
  { id: 'motor', view: 'lateral', a: ['motor'], who: 'Mrs. D.', age: '66, gardener',
    story: 'After a stroke, she can feel it when you touch her right arm and leg, but she cannot move them at all. Her left side works normally.',
    dx: 'Left motor cortex damage', why: 'The motor cortex (back of the frontal lobe) sends commands for voluntary movement, and it is contralateral: the LEFT strip moves the RIGHT side.',
    near: { somato: 'She can FEEL fine. Find the strip that MOVES the body, just in front.', frontal: 'Right lobe. Find the strip at its back edge.' } },
  { id: 'face', view: 'lateral', a: ['occipital', 'temporal'], who: 'Dr. P.', age: '52, music teacher',
    story: 'After an injury, he cannot recognize faces, not even his wife’s or his own in a mirror. His eyesight is sharp, and he knows people instantly by their voices.',
    dx: 'Prosopagnosia (face blindness)', why: 'Faces are processed on the underside of the brain where the occipital and temporal lobes meet (the fusiform face area). Either lobe counts here. Vision and hearing still work.' },
  { id: 'med', view: 'inner', a: ['med'], who: 'Patient in Bay 4', age: '34, car crash',
    story: 'His injury is at the very base of the skull, where the brain meets the spinal cord. His heartbeat is unstable and he cannot breathe without a ventilator.',
    dx: 'Medulla oblongata damage', why: 'The medulla controls heartbeat and breathing. It is life support, which is why injuries here are so dangerous.',
    near: { pons: 'Close. Go a little lower, to the base of the brainstem.', cord: 'Close. Go a little higher, to the base of the brainstem.' } },
  { id: 'amyg', view: 'inner', a: ['amyg'], who: 'S.M.', age: '40s, real case study',
    story: 'A rare disease destroyed a small almond-shaped area on both sides of her brain. She feels no fear: she picks up snakes, walks alone through dangerous parks at night, and cannot recognize fear on other people’s faces.',
    dx: 'Amygdala damage', why: 'The amygdala processes fear and aggression and triggers fight or flight. Without it, danger does not feel scary.',
    near: { hippo: 'Right neighborhood. That one forms memories. The fear center is just in front of it.' } },
  { id: 'hypo', view: 'inner', a: ['hypo'], who: 'Leo', age: '14, student',
    story: 'A tumor is pressing on a small area near the center of his brain, just below the relay station. He is always hungry and never feels full, he is constantly thirsty, and his body temperature swings.',
    dx: 'Hypothalamus damage', why: 'The hypothalamus (“below the thalamus”) regulates hunger, thirst, and body temperature to keep homeostasis.',
    near: { thal: 'Close. The clue says BELOW the relay station.', pit: 'Close. That gland takes orders from the area just above it.' } },
  { id: 'ras', view: 'inner', a: ['ras'], who: 'Ms. J.', age: '50, after a brainstem stroke',
    story: 'Scans show her cerebral cortex is undamaged, but she cannot be woken up. She is in a coma. The stroke hit the network running up the core of her brainstem.',
    dx: 'Reticular activating system damage', why: 'The RAS controls arousal and wakefulness. Without it, a healthy cortex cannot “turn on.”',
    near: { pons: 'You are in the brainstem. Tap the dotted network running up its core.', mid: 'You are in the brainstem. Tap the dotted network running up its core.', med: 'You are in the brainstem. Tap the dotted network running up its core.' } }
];
const ROUND = 10;

ML.w2.css('neuro-er-css', `
.ner-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.ner-card { border: 1.5px solid var(--line); border-radius: 16px; overflow: hidden; background: var(--surface-2); }
.ner-mon { height: 34px; background: #0B1222; display: block; width: 100%; }
.ner-mon path { fill: none; stroke: #35E3A7; stroke-width: 2; stroke-linejoin: round; stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: nerEcg 3s linear infinite; }
@keyframes nerEcg { to { stroke-dashoffset: 0; } }
.reduce-motion .ner-mon path { animation: none; stroke-dashoffset: 0; }
.ner-body { padding: 12px 14px 14px; display: grid; grid-template-columns: 52px 1fr; gap: 12px; align-items: start; }
.ner-av { width: 52px; height: 52px; border-radius: 50%; background: var(--carolina-soft); color: var(--carolina); display: grid; place-items: center; font: 700 18px var(--f-mono); }
.ner-who { font-weight: 700; font-size: 17px; }
.ner-age { color: var(--muted); font-size: 14px; }
.ner-story { margin-top: 6px; font-size: 16px; }
.ner-ask { font-weight: 700; color: var(--spark); font-size: 15px; }
.ner-dx { font-weight: 700; }
.ner-streak { color: var(--spark); }
@media (max-width: 420px) { .ner-body { grid-template-columns: 1fr; } .ner-av { width: 40px; height: 40px; font-size: 15px; } }
`);

ML.registerWidget('neuro-er', {
  title: 'Neurologist on call', tag: 'Case game',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const bag = W2.bag();
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Read each patient’s symptoms, then tap the brain area that was damaged.');
    const prog = h('span', { class: 'w2-tag' }), scoreEl = h('span', { class: 'w2-score' });
    const top = h('div', { class: 'ner-top' }, prog, scoreEl);
    const card = h('div', { class: 'ner-card' });
    const stageBox = h('div');
    const fb = h('div', { class: 'w2-fb', 'aria-live': 'polite' });
    root.append(inst, top, card, stageBox, fb);
    el.append(root);
    let deck = [], i = 0, score = 0, streak = 0, best = 0, misses = 0, locked = false, art = null;
    const ecg = 'M0,20 L40,20 L46,17 L52,20 L60,20 L64,26 L70,4 L76,30 L80,20 L94,20 L100,15 L108,20 L150,20 L156,17 L162,20 L170,20 L174,26 L180,4 L186,30 L190,20 L204,20 L210,15 L218,20 L260,20 L266,17 L272,20 L280,20 L284,26 L290,4 L296,30 L300,20 L314,20 L320,15 L328,20 L370,20 L376,17 L382,20 L390,20 L394,26 L400,4 L406,30 L410,20 L424,20 L430,15 L438,20 L480,20';
    function start() { deck = ML.util.shuffle(CASES).slice(0, ROUND); i = 0; score = 0; streak = 0; show(); }
    function paintScore() { scoreEl.innerHTML = ''; scoreEl.append(`Correct ${score}`, streak > 1 ? h('span', { class: 'ner-streak' }, `  ·  streak ${streak}`) : ''); }
    function show() {
      const c = deck[i]; misses = 0; locked = false;
      prog.textContent = `Patient ${i + 1} of ${deck.length}`; paintScore();
      card.innerHTML = '';
      const mon = W2.S('svg', { class: 'ner-mon', viewBox: '0 0 480 34', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
      W2.S('path', { d: ecg, transform: 'translate(0,3)' }, mon);
      const initials = c.who.replace(/[^A-Z]/g, '').slice(0, 2) || 'PT';
      card.append(mon, h('div', { class: 'ner-body' }, h('div', { class: 'ner-av', 'aria-hidden': 'true' }, initials),
        h('div', null, h('div', { class: 'ner-who' }, c.who), h('div', { class: 'ner-age' }, c.age), h('p', { class: 'ner-story' }, c.story))));
      stageBox.innerHTML = '';
      art = W2.brainArt(c.view); art.setQuiz(true);
      art.onPick(pick);
      stageBox.append(art.root);
      fb.className = 'w2-fb'; fb.innerHTML = '';
      fb.append(h('span', { class: 'ner-ask' }, c.view === 'inner' ? 'Tap the damaged structure on the inner-brain cutaway.' : 'Tap the damaged area on the left hemisphere.'));
    }
    function pick(id) {
      if (locked) return;
      const c = deck[i];
      art.clearMarks();
      if (c.a.includes(id)) {
        locked = true; art.mark(id, 'good'); art.label(id);
        if (!misses) { score++; streak++; best = Math.max(best, streak); api.addXP(2); } else streak = 0;
        paintScore(); api.sfx.good();
        fb.className = 'w2-fb good'; fb.innerHTML = '';
        const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '10px', display: 'flex' } }, i + 1 < deck.length ? 'Next patient' : 'Finish shift');
        next.addEventListener('click', () => { i++; if (i < deck.length) { show(); card.scrollIntoView({ block: 'nearest', behavior: api.reduceMotion ? 'auto' : 'smooth' }); } else end(); });
        fb.append(h('div', { class: 'ner-dx' }, `Diagnosis: ${c.dx}`), h('div', null, c.why), next);
        next.focus({ preventScroll: true });
      } else {
        misses++; streak = 0; paintScore(); api.sfx.bad();
        art.mark(id, 'bad'); art.label(id);
        bag.t(() => art.unmark(id, 'bad'), 700);
        const d = art.data[id];
        fb.className = 'w2-fb bad'; fb.innerHTML = '';
        fb.append(h('strong', null, `Not the ${d.name.replace(/ \(.*\)$/, '').toLowerCase()}. `), (c.near && c.near[id]) || `That area handles ${d.fn}. Reread the symptoms and try again.`);
        if (misses >= 2) { c.a.forEach(x => art.mark(x, 'hint')); fb.append(' The dashed outline shows where to look.'); }
      }
    }
    function end() {
      card.innerHTML = ''; stageBox.innerHTML = '';
      prog.textContent = 'Shift complete';
      const pct = score / deck.length;
      fb.className = 'w2-fb ' + (pct >= .7 ? 'good' : 'warn'); fb.innerHTML = '';
      const again = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '10px', display: 'flex' } }, 'New shift');
      again.addEventListener('click', start);
      fb.append(h('div', { class: 'ner-dx', style: { fontSize: '19px' } }, `${score} of ${deck.length} diagnosed on the first try`),
        h('div', null, `Best streak: ${best}. ` + (pct === 1 ? 'Chief of neurology material.' : pct >= .7 ? 'Strong work, doctor. Review any you missed in the brain explorers.' : 'Good practice. Review the lobes and inner structures, then take another shift.')), again);
      if (pct >= .7) { api.sfx.win(); const r = fb.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top, 70); }
      again.focus({ preventScroll: true });
    }
    start();
    return () => bag.destroy();
  }
});
})();
