/* nt-cards — collectible neurotransmitter & hormone trading cards: flip, filter by type, and a sort quiz. */
(function () {
'use strict';
const CSS = `
.ntc { display: flex; flex-direction: column; gap: 12px; }
.ntc-ins { font-size: 15px; color: var(--muted); }
.ntc-top { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ntc-top .sp { flex: 1; }
.ntc-col { font-family: var(--f-mono); font-size: 13px; font-weight: 700; color: var(--muted); }
.ntc-col b { color: var(--spark); }
.ntc-note { font-size: 13px; color: var(--muted); }
.ntc-deckwrap { position: relative; }
.ntc-deck { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 4px 14px; scrollbar-width: thin; overscroll-behavior-x: contain; }
.ntc-card { flex: 0 0 auto; width: 232px; height: 350px; scroll-snap-align: center; perspective: 1000px; border: 0; background: none; padding: 0; cursor: pointer; text-align: left; color: var(--ink); }
.ntc-in { position: relative; width: 100%; height: 100%; transition: transform .6s cubic-bezier(.3,.7,.3,1); transform-style: preserve-3d; }
.ntc-card.on .ntc-in { transform: rotateY(180deg); }
.reduce-motion .ntc-in { transition: none; }
.ntc-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 18px; padding: 6px; background: var(--tc); box-shadow: 0 6px 18px rgba(0,0,0,.18); }
.ntc-face > div { height: 100%; border-radius: 13px; background: var(--surface); display: flex; flex-direction: column; overflow: hidden; }
.ntc-back { transform: rotateY(180deg); }
.ntc-band { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: color-mix(in srgb, var(--tc) 18%, var(--surface)); }
.ntc-num { font-family: var(--f-mono); font-size: 12px; font-weight: 700; color: var(--muted); }
.ntc-badge { font-family: var(--f-mono); font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: var(--tc); padding: 3px 8px; border-radius: 99px; }
.ntc-name { font-family: var(--f-display); font-size: 21px; line-height: 1.05; padding: 8px 12px 0; letter-spacing: .01em; }
.ntc-art { height: 104px; margin: 8px 12px 0; border-radius: 10px; background: radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--tc) 25%, var(--surface)), var(--surface-2)); display: grid; place-items: center; position: relative; overflow: hidden; }
.ntc-art svg { width: 120px; height: 96px; }
.ntc-card.got .ntc-art::after { content: ""; position: absolute; inset: -40%; background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.55) 50%, transparent 60%); animation: ntcShine 1.2s ease 1; }
@keyframes ntcShine { from { transform: translateX(-60%); } to { transform: translateX(60%); } }
.reduce-motion .ntc-card.got .ntc-art::after { display: none; }
.ntc-job { padding: 8px 12px 0; font-size: 14px; line-height: 1.35; }
.ntc-job b { display: block; font-family: var(--f-mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.ntc-hint { margin-top: auto; padding: 6px 12px 9px; font-family: var(--f-mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); display: flex; justify-content: space-between; }
.ntc-back > div { padding: 11px 12px; gap: 6px; overflow-y: auto; }
.ntc-back h5 { margin: 0; font-family: var(--f-display); font-weight: 400; font-size: 16px; }
.ntc-sec { font-size: 12.5px; line-height: 1.32; }
.ntc-sec b { display: block; font-family: var(--f-mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--tc); }
.ntc-nav { display: flex; gap: 8px; justify-content: center; align-items: center; }
.ntc-nav .cnt { font-family: var(--f-mono); font-size: 13px; color: var(--muted); min-width: 6ch; text-align: center; }
.ntc-quiz { border: 2px solid var(--carolina); border-radius: 16px; padding: 14px; display: grid; gap: 10px; }
.ntc-quiz .k { display: flex; justify-content: space-between; font-family: var(--f-mono); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--carolina); }
.ntc-quiz .nm { font-family: var(--f-display); font-size: 26px; }
.ntc-qopts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ntc-qopts button { border: 2px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 10px 6px; font-weight: 700; cursor: pointer; color: var(--ink); font-size: 15px; }
.ntc-qopts button.right { border-color: var(--good); background: var(--good-soft); }
.ntc-qopts button.wrong { border-color: var(--bad); background: var(--bad-soft); }
.ntc-fb { font-size: 15px; }
`;
const TYPES = { Excitatory: '#E5485F', Inhibitory: '#2F7FB8', Hormone: '#B07A10' };
const CARDS = [
  { n: 'Dopamine', t: 'Excitatory', job: 'Reward, motivation, attention, and smooth movement.',
    much: 'Too much activity is linked to schizophrenia (hallucinations, delusions).', little: 'Too little: Parkinson’s disease (tremors, slow movement), treated with L-dopa.',
    ex: 'The rush of wanting to play "just one more level."', fun: 'Cocaine blocks dopamine reuptake. Doctors give L-dopa because dopamine itself can’t cross the blood-brain barrier.' },
  { n: 'Serotonin', t: 'Inhibitory', job: 'Mood, hunger, sleep, and arousal.',
    much: 'Too much (from mixing certain drugs) can cause serotonin syndrome: agitation and high temperature.', little: 'Low activity is linked to depression. SSRIs like Prozac and Zoloft block its reuptake.',
    ex: 'Feeling steady and content after a good night’s sleep.', fun: 'About 90% of your body’s serotonin is made in your gut, not your brain.' },
  { n: 'Norepinephrine', t: 'Excitatory', job: 'Alertness and arousal: raises heart rate, blood pressure, and breathing.',
    much: 'Too much is linked to anxiety and feeling jittery.', little: 'Too little is linked to depressed mood and low energy.',
    ex: 'Snapping to full attention when the teacher calls your name.', fun: 'It works as a neurotransmitter AND as a hormone released by the adrenal glands.' },
  { n: 'Glutamate', t: 'Excitatory', job: 'The most common excitatory neurotransmitter. Key for learning and memory.',
    much: 'Too much overexcites neurons and is linked to migraines and seizures.', little: null,
    ex: 'Studying flashcards strengthens glutamate synapses so the memory sticks.', fun: 'GABA, the brain’s brake, is made from glutamate, the brain’s gas pedal.' },
  { n: 'GABA', t: 'Inhibitory', job: 'The main inhibitory neurotransmitter. Calms the nervous system.',
    much: 'Drugs that boost GABA (alcohol, barbiturates) slow reactions and cause drowsiness.', little: 'Too little is linked to anxiety, seizures, and insomnia.',
    ex: 'Winding down and feeling calm before sleep.', fun: 'GABA stands for gamma-aminobutyric acid. Alcohol makes GABA work harder, which is why it is a depressant.' },
  { n: 'Endorphins', t: 'Inhibitory', job: 'The body’s natural painkillers. Also linked to pleasure.',
    much: null, little: 'Opioids like heroin and morphine mimic endorphins. With repeated use, the brain makes fewer of its own, so withdrawal hurts.',
    ex: 'Runner’s high: pain fades during a long, hard run.', fun: 'The name means "endogenous morphine": morphine made inside the body.' },
  { n: 'Substance P', t: 'Excitatory', job: 'Carries pain signals to the brain and increases inflammation.',
    much: 'High levels are linked to chronic pain conditions like arthritis and fibromyalgia, and to stress and anxiety.', little: null,
    ex: 'The throbbing ache after you stub your toe.', fun: 'Capsaicin, the heat in chili peppers, triggers Substance P and can eventually use it up. That is why capsaicin creams relieve pain.' },
  { n: 'Acetylcholine', t: 'Excitatory', job: 'Muscle contraction at every nerve-muscle connection, plus learning and memory.',
    much: 'Myasthenia gravis: the immune system attacks ACh receptors, causing muscle weakness.', little: 'Alzheimer’s disease is linked to the loss of ACh-producing neurons.',
    ex: 'Every step you take: ACh tells your leg muscles to contract.', fun: 'ACh was the first neurotransmitter ever discovered (Otto Loewi, 1921, using frog hearts).' },
  { n: 'Adrenaline', t: 'Hormone', job: 'Also called epinephrine. Released by the adrenal glands for fight-or-flight: boosts heart rate, energy, and blood sugar.',
    much: 'Chronic stress keeps it high, which strains the heart over time.', little: null,
    ex: 'The surge right before a race or a big test.', fun: 'An EpiPen is a shot of epinephrine that stops a life-threatening allergic reaction.' },
  { n: 'Oxytocin', t: 'Hormone', job: 'Bonding, trust, and social connection.',
    much: null, little: null,
    ex: 'Feeling close to someone after a long hug.', fun: 'It is made in the hypothalamus and released by the pituitary gland. Levels rise during childbirth and nursing.' },
  { n: 'Leptin', t: 'Hormone', job: 'Released by fat cells. Tells the hypothalamus "we have enough stored energy," which decreases hunger.',
    much: 'In obesity, leptin is often high but the brain stops responding to it (leptin resistance).', little: 'Rare genetic leptin deficiency causes constant, extreme hunger.',
    ex: 'Over weeks, more stored fat means more leptin and less appetite.', fun: 'Sleep loss lowers leptin and raises ghrelin, so tired people feel hungrier.' },
  { n: 'Ghrelin', t: 'Hormone', job: 'Released by an empty stomach. Signals the brain that it is time to eat.',
    much: 'High after skipped meals and dieting, which makes hunger hard to ignore.', little: null,
    ex: 'Your stomach growling right before lunch.', fun: 'Ghrelin rises before your usual mealtimes, so your body learns your schedule.' },
  { n: 'Melatonin', t: 'Hormone', job: 'Regulates the sleep-wake cycle. The pineal gland releases it when it gets dark, cued by the SCN in the hypothalamus.',
    much: null, little: 'Bright screens at night can delay its release and make it harder to fall asleep.',
    ex: 'Feeling sleepy as the evening gets darker.', fun: 'During the teen years, melatonin release shifts later at night. That is why teens feel wide awake at 11 p.m.' }
];
function art(i, col) {
  // a simple "molecule" emblem, different for each card
  const r = (k) => { const x = Math.sin(i * 97.3 + k * 13.1) * 43758.5453; return x - Math.floor(x); };
  const ring = (cx, cy, s) => { let p = ''; for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; p += (k ? 'L' : 'M') + (cx + Math.cos(a) * s).toFixed(1) + ' ' + (cy + Math.sin(a) * s).toFixed(1); } return p + 'Z'; };
  const rings = 1 + (i % 2), atoms = [];
  let s = '';
  const c1 = [32 + r(1) * 6, 50], c2 = [70 + r(2) * 6, 40 + r(3) * 14];
  s += `<path d="${ring(c1[0], c1[1], 16)}" style="fill:none;stroke:${col};stroke-width:3"/>`;
  if (rings > 1) s += `<path d="${ring(c2[0], c2[1], 14)}" style="fill:none;stroke:${col};stroke-width:3"/>`;
  const tail = [[c1[0] + 16, c1[1] + 8]];
  for (let k = 0; k < 3; k++) { const p = tail[tail.length - 1]; tail.push([p[0] + 11 + r(k + 4) * 4, p[1] + (k % 2 ? -10 : 10)]); }
  s += `<path d="M${tail.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L')}" style="fill:none;stroke:${col};stroke-width:3;stroke-linejoin:round"/>`;
  const end = tail[tail.length - 1];
  atoms.push([end[0], end[1], 'N'], [c1[0] - 16, c1[1] - 8, 'O'], [tail[2][0], tail[2][1] - 14, i % 3 ? 'H' : 'O']);
  atoms.forEach(([x, y, a]) => { s += `<circle cx="${x}" cy="${y}" r="8" style="fill:var(--surface);stroke:${col};stroke-width:2"/><text x="${x}" y="${y + 3.5}" text-anchor="middle" style="font-size:10px;font-weight:700;fill:${col};font-family:var(--f-mono)">${a}</text>`; });
  return `<svg viewBox="0 0 120 96" aria-hidden="true">${s}</svg>`;
}

ML.registerWidget('nt-cards', {
  title: 'Neurotransmitter & hormone trading cards', tag: 'Card deck',
  mount(el, api) {
    const { h, sfx } = api;
    if (!document.getElementById('ntc-css')) document.head.append(h('style', { id: 'ntc-css' }, CSS));
    let filter = 'All', quiz = null;
    const got = new Set();
    const root = h('div', { class: 'ntc' });
    const ins = h('p', { class: 'ntc-ins' }, 'Swipe through the deck and tap a card to flip it. Flip all 13 to complete your collection, then test yourself with the sort quiz.');
    const chips = ['All', 'Excitatory', 'Inhibitory', 'Hormone'].map(f => { const b = h('button', { type: 'button', class: 'chip ntc-chip', 'data-f': f, 'aria-pressed': String(f === filter) }, f === 'All' ? 'All 13' : f); b.addEventListener('click', () => { filter = f; chips.forEach(c => c.setAttribute('aria-pressed', String(c === b))); render(); sfx.tap(); }); return b; });
    const col = h('span', { class: 'ntc-col', 'aria-live': 'polite' });
    const quizBtn = h('button', { type: 'button', class: 'btn btn-sm btn-primary ntc-quizbtn' }, 'Sort quiz');
    const deck = h('div', { class: 'ntc-deck', role: 'list', 'aria-label': 'Trading cards' });
    const prev = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Previous card' }, '◀');
    const next = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': 'Next card' }, '▶');
    const cnt = h('span', { class: 'cnt' });
    const quizBox = h('div');
    root.append(ins, h('div', { class: 'ntc-top', role: 'group', 'aria-label': 'Filter by type' }, chips, h('span', { class: 'sp' }), col, quizBtn),
      h('p', { class: 'ntc-note' }, 'Heads up: many neurotransmitters can excite or inhibit depending on the receptor. These badges follow how AP Psychology usually groups them.'),
      quizBox, h('div', { class: 'ntc-deckwrap' }, deck), h('div', { class: 'ntc-nav' }, prev, cnt, next));
    el.append(root);
    const paintCol = () => { col.innerHTML = ''; col.append('Collected ', h('b', null, got.size), ` / ${CARDS.length}`); };

    const cardEls = CARDS.map((c, i) => {
      const tc = TYPES[c.t];
      const sec = (k, v) => v ? h('div', { class: 'ntc-sec' }, h('b', null, k), v) : null;
      const b = h('button', { type: 'button', class: 'ntc-card', role: 'listitem', 'aria-label': `${c.n}, ${c.t}. Tap to flip.` },
        h('div', { class: 'ntc-in' },
          h('div', { class: 'ntc-face' }, h('div', null,
            h('div', { class: 'ntc-band' }, h('span', { class: 'ntc-num' }, `#${String(i + 1).padStart(2, '0')}`), h('span', { class: 'ntc-badge' }, c.t)),
            h('div', { class: 'ntc-name' }, c.n),
            h('div', { class: 'ntc-art', html: art(i, tc) }),
            h('div', { class: 'ntc-job' }, h('b', null, 'Main job'), c.job),
            h('div', { class: 'ntc-hint' }, h('span', null, 'Tap to flip'), h('span', null, c.t === 'Hormone' ? 'bloodstream' : 'synapse')))),
          h('div', { class: 'ntc-face ntc-back' }, h('div', null,
            h('h5', null, c.n),
            sec('Too much', c.much), sec('Too little', c.little),
            !c.much && !c.little ? sec('When it goes wrong', 'Not a classic "too much or too little" story at the AP level.') : null,
            sec('Real life', c.ex), sec('Fun fact', c.fun)))));
      b.style.setProperty('--tc', tc);
      b.addEventListener('click', () => {
        b.classList.toggle('on'); sfx.flip();
        if (!got.has(i)) { got.add(i); b.classList.add('got'); paintCol(); api.addXP(1); if (got.size === CARDS.length) { sfx.win(); const r = deck.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top + 60, 90); api.toast('Collection complete: all 13 cards!'); } }
      });
      return b;
    });
    function visible() { return cardEls.filter((_, i) => filter === 'All' || CARDS[i].t === filter); }
    function render() { deck.innerHTML = ''; visible().forEach(c => deck.append(c)); deck.scrollLeft = 0; updCnt(); }
    function current() { const v = visible(); const r = deck.getBoundingClientRect(); let best = 0, bd = 1e9; v.forEach((c, i) => { const q = c.getBoundingClientRect(); const d = Math.abs(q.left + q.width / 2 - (r.left + r.width / 2)); if (d < bd) { bd = d; best = i; } }); return best; }
    function updCnt() { const v = visible(); cnt.textContent = `${current() + 1} / ${v.length}`; }
    function go(d) { const v = visible(); const k = Math.max(0, Math.min(v.length - 1, current() + d)); const c = v[k]; deck.scrollTo({ left: c.offsetLeft - (deck.clientWidth - c.offsetWidth) / 2, behavior: api.reduceMotion ? 'auto' : 'smooth' }); sfx.tap(); }
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    let st = 0; deck.addEventListener('scroll', () => { cancelAnimationFrame(st); st = requestAnimationFrame(updCnt); });
    deck.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });

    /* ---- sort quiz ---- */
    quizBtn.addEventListener('click', () => { if (quiz) { quiz = null; quizBox.innerHTML = ''; quizBtn.textContent = 'Sort quiz'; return; } quiz = { order: api.util.shuffle(CARDS.map((_, i) => i)), k: 0, score: 0 }; quizBtn.textContent = 'Close quiz'; ask(); sfx.tap(); });
    function ask() {
      quizBox.innerHTML = '';
      if (quiz.k >= quiz.order.length) {
        const again = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Play again'); again.addEventListener('click', () => { quiz = { order: api.util.shuffle(CARDS.map((_, i) => i)), k: 0, score: 0 }; ask(); });
        quizBox.append(h('div', { class: 'ntc-quiz' }, h('div', { class: 'k' }, h('span', null, 'Sort quiz complete')), h('div', { class: 'nm' }, `${quiz.score} / ${quiz.order.length}`), h('div', { class: 'ntc-fb' }, quiz.score >= 11 ? 'Collector-level knowledge!' : 'Flip the cards you missed and try again.'), h('div', null, again)));
        quiz.score >= 11 ? sfx.win() : sfx.level(); return;
      }
      const c = CARDS[quiz.order[quiz.k]];
      const fb = h('div', { class: 'ntc-fb', 'aria-live': 'polite' });
      let tried = false, doneQ = false;
      const opts = Object.keys(TYPES).map(t => { const b = h('button', { type: 'button' }, t); b.addEventListener('click', () => {
        if (doneQ) return;
        if (t === c.t) { doneQ = true; b.classList.add('right'); if (!tried) { quiz.score++; api.addXP(1); } sfx.good();
          const nx = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Next →'); nx.addEventListener('click', () => { quiz.k++; ask(); });
          fb.innerHTML = ''; fb.append(h('b', null, `${c.n}: `), c.job, ' ', nx); nx.focus({ preventScroll: true }); }
        else { tried = true; b.classList.add('wrong'); sfx.bad(); fb.textContent = 'Not that one. Try again.'; }
      }); return b; });
      quizBox.append(h('div', { class: 'ntc-quiz' }, h('div', { class: 'k' }, h('span', null, `Card ${quiz.k + 1} of ${quiz.order.length}`), h('span', null, `Score ${quiz.score}`)), h('div', null, 'Is this card excitatory, inhibitory, or a hormone?'), h('div', { class: 'nm' }, c.n), h('div', { class: 'ntc-qopts' }, opts), fb));
    }
    paintCol(); render();
    return () => { cancelAnimationFrame(st); };
  }
});
})();
