/* dream-theories: Activation-synthesis (random brainstem sparks → cortex builds a story) vs. consolidation
   (sleep files the day's memories). Then quick "Which theory explains this?" prompts. Uses ML.w2. */
(function () {
'use strict';
const FRAG = {
  who: ['your math teacher', 'a talking golden retriever', 'your best friend', 'a famous rapper', 'your grandma', 'Coach', 'a penguin in a hoodie'],
  where: ['in the school hallway', 'in a giant swimming pool', 'in outer space', 'in the cafeteria', 'on a soccer field made of pancakes', 'in your old bedroom', 'at the mall'],
  act: ['flying', 'running in slow motion', 'taking a test you never studied for', 'searching for your locker', 'riding a bike', 'falling', 'singing in front of everyone'],
  ev: ['your teeth start falling out', 'everyone turns into pigeons', 'the floor turns into lava', 'you realize you forgot your shoes', 'a giant taco starts teaching history', 'the bell rings and you can’t move', 'it starts raining jellybeans']
};
const MEMS = [
  { t: 'Spanish vocab you studied', keep: true, dream: 'replaying flashcards: ¿Dónde está la biblioteca?', res: 'You remember more words at the quiz.' },
  { t: 'New soccer passing drill', keep: true, dream: 'practicing the drill, cone after cone', res: 'The drill feels smoother at practice.' },
  { t: 'Argument with a friend', keep: true, emo: true, dream: 'replaying the argument, but the feelings soften', res: 'You remember it, with less sting.' },
  { t: 'What you ate for lunch', keep: false, res: 'Gone. Not important enough to keep.' },
  { t: 'Color of a random car', keep: false, res: 'Gone. Your brain clears the clutter.' }
];
const QUIZ = [
  { q: 'Your dream jumps from your kitchen to outer space to a soccer game, with no logic at all.', a: 'as', why: 'Random signals, stitched together on the fly, make jumpy, illogical dreams.' },
  { q: 'After studying Spanish all evening, you dream in Spanish and remember the words better the next day.', a: 'con', why: 'Dreams replaying the day’s learning fits consolidation theory.' },
  { q: 'Students woken every time they entered REM remembered less of a new skill the next day.', a: 'con', why: 'Losing REM hurt memory, which supports consolidation theory.' },
  { q: 'During REM, the pons sends out random signals, and the cortex weaves them into a story.', a: 'as', why: 'That is the definition of activation-synthesis.' },
  { q: 'You dream that a giant taco is teaching your history class.', a: 'as', why: 'A bizarre mash-up of random images is the cortex making sense of noise.' }
];
const pick = a => a[Math.random() * a.length | 0];

ML.w2.css('dream-theories-css', `
.drm-stage { background: #0B1222; border-radius: 14px; overflow: hidden; position: relative; }
.drm-stage svg { width: 100%; max-width: 560px; margin: 0 auto; height: auto; display: block; }
.drm-frags { display: flex; flex-wrap: wrap; gap: 6px; min-height: 34px; }
.drm-frag { background: var(--spark-soft); color: var(--spark); border-radius: 99px; padding: 4px 11px; font-size: 14px; font-weight: 700; animation: drmPop .35s ease both; }
@keyframes drmPop { from { transform: scale(.6); opacity: 0; } }
.reduce-motion .drm-frag, .reduce-motion .drm-card { animation: none; }
.drm-story { font-size: 18px; font-weight: 700; min-height: 54px; }
.drm-story .caret { display: inline-block; width: 2px; height: 1.1em; background: var(--carolina); vertical-align: -3px; margin-left: 2px; animation: drmBlink .8s steps(1) infinite; }
@keyframes drmBlink { 50% { opacity: 0; } }
.drm-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
@media (max-width: 560px) { .drm-cols { grid-template-columns: 1fr; } }
.drm-col { border: 1.5px dashed var(--line); border-radius: 14px; padding: 10px; min-height: 110px; display: flex; flex-direction: column; gap: 6px; background: var(--surface-2); }
.drm-col h5 { margin: 0 0 2px; font-size: 12px; font-family: var(--f-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--carolina); }
.drm-card { border: 1.5px solid var(--line); background: var(--surface); border-radius: 10px; padding: 6px 10px; font-size: 14px; font-weight: 700; animation: drmPop .35s ease both; }
.drm-card.keep { border-color: var(--good); box-shadow: 0 0 0 3px var(--good-soft); }
.drm-card.emo { border-color: var(--spark); box-shadow: 0 0 0 3px var(--spark-soft); }
.drm-card.gone { opacity: .35; text-decoration: line-through; }
.drm-card.weak { border-style: dashed; opacity: .7; }
.drm-bub { min-height: 26px; font-style: italic; color: var(--muted); }
.drm-q { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.drm-q .btn.right { border-color: var(--good); background: var(--good-soft); color: var(--good); opacity: 1; }
.drm-q .btn.wrong { border-color: var(--bad); background: var(--bad-soft); color: var(--bad); }
`);

ML.registerWidget('dream-theories', {
  title: 'Why do we dream?', tag: 'Compare + quiz',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Try both theories: fire the brainstem to build a dream, then sleep on your day. Finish with the quick check.');
    const seg = W2.seg([['as', 'Activation-synthesis'], ['con', 'Consolidation']], 'as', v => setTab(v), 'Dream theory');
    const pane = h('div', { class: 'stack', style: { gap: '12px' } });
    const quiz = h('div', { class: 'w2-panel', 'aria-live': 'polite' });
    const freud = h('p', { class: 'muted', style: { margin: 0, fontSize: '14px' } }, 'Heads up: Freud’s psychoanalytic theory (dreams as hidden wishes, with manifest and latent content) exists, but it is outside the scope of the AP exam. Focus on these two biological theories.');
    root.append(inst, seg, pane, h('h3', { class: 'h3', style: { margin: '6px 0 0' } }, 'Which theory explains this?'), quiz, freud);
    el.append(root);
    let raf = 0;

    /* ---------- activation-synthesis ---------- */
    function buildAS() {
      pane.innerHTML = '';
      const svg = S('svg', { viewBox: '0 0 360 250', role: 'img', 'aria-label': 'Brain with the brainstem sending random sparks up to the cortex' });
      const stage = h('div', { class: 'drm-stage' }, svg);
      const g = S('g', { transform: 'translate(8,2) scale(0.82)' }, svg);
      S('path', { d: 'M205,212 C211,240 214,262 214,298 L247,298 C245,270 249,246 264,224 C252,214 226,208 205,212 Z', style: 'fill:#B9946C;stroke:#E8F0FF;stroke-width:2' }, g);
      S('path', { d: 'M248,214 C252,195 296,188 330,189 C360,191 372,210 362,231 C350,252 298,258 267,247 C252,241 245,227 248,214 Z', style: 'fill:#5B4C86;stroke:#E8F0FF;stroke-width:2' }, g);
      const cortex = S('path', { d: W2.LAT_OUT, style: 'fill:#24325A;stroke:#7CC0EE;stroke-width:2.5' }, g);
      ['M66,92 C92,80 118,86 138,70', 'M56,124 C82,112 106,118 126,102', 'M214,28 C206,58 190,100 174,140', 'M106,180 C125,162 150,150 178,144 C205,139 235,139 258,140', 'M232,56 C252,66 270,60 292,74', 'M318,88 C334,104 330,124 346,140'].forEach(d => S('path', { d, style: 'fill:none;stroke:#3a4a74;stroke-width:2.5;stroke-linecap:round' }, g));
      const pons = S('circle', { cx: 226, cy: 236, r: 9, style: 'fill:#FFD166;opacity:.5' }, g);
      const lab1 = S('text', { x: 172, y: 222, 'text-anchor': 'end', style: 'fill:#FFD166;font:700 12px var(--f-mono)' }, svg); lab1.textContent = 'PONS (brainstem) →';
      const lab2 = S('text', { x: 10, y: 22, style: 'fill:#7CC0EE;font:700 12px var(--f-mono)' }, svg); lab2.textContent = 'CORTEX: “What story fits?”';
      const sparks = S('g', null, g);
      const frags = h('div', { class: 'drm-frags', 'aria-live': 'polite' });
      const story = h('div', { class: 'drm-story', 'aria-live': 'polite' }, h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '16px' } }, 'Your dream will appear here.'));
      const fire = h('button', { type: 'button', class: 'btn btn-primary' }, 'Fire the brainstem (REM)');
      const box = h('div', { class: 'w2-panel' }, h('div', { class: 'w2-tag' }, 'Random signals'), frags, h('div', { class: 'w2-tag' }, 'The cortex synthesizes a story'), story);
      const expl = h('div', { class: 'w2-fb' }, h('strong', null, 'Activation-synthesis theory: '), 'during REM, the brainstem (pons) fires random neural signals (activation). The cortex tries to make sense of them and stitches together a story (synthesis). That is why dreams are often bizarre and jumpy.');
      pane.append(stage, h('div', { class: 'w2-row' }, fire), box, expl);
      fire.addEventListener('click', () => {
        fire.disabled = true; frags.innerHTML = ''; story.innerHTML = ''; sparks.innerHTML = ''; api.sfx.fire();
        const parts = { who: pick(FRAG.who), where: pick(FRAG.where), act: pick(FRAG.act), ev: pick(FRAG.ev) };
        const order = ['act', 'where', 'who', 'ev'];
        const targets = [[90, 90], [160, 60], [270, 80], [320, 130]].sort(() => Math.random() - .5);
        const cols = ['#FF6B81', '#35E3A7', '#FFD166', '#B79CF6'];
        const t0 = performance.now();
        const dots = order.map((k, i) => ({ k, c: S('circle', { r: 7, cx: 226, cy: 236, style: `fill:${cols[i]}` }, sparks), trail: S('path', { style: `fill:none;stroke:${cols[i]};stroke-width:2;opacity:.6;stroke-linecap:round` }, sparks), tx: targets[i][0], ty: targets[i][1], start: i * 380, done: false }));
        pons.style.opacity = 1;
        const step = now => {
          const t = now - t0; let all = true;
          dots.forEach((d, i) => {
            const f = Math.max(0, Math.min(1, (t - d.start) / 650));
            if (f < 1) all = false;
            const cx = 226 + (d.tx - 226) * f + Math.sin(f * 9 + i) * 14 * (1 - f), cy = 236 + (d.ty - 236) * f;
            d.c.setAttribute('cx', cx.toFixed(1)); d.c.setAttribute('cy', cy.toFixed(1));
            d.trail.setAttribute('d', `M226,236 Q${(226 + d.tx) / 2 + 30},${(236 + d.ty) / 2 + 20} ${cx.toFixed(1)},${cy.toFixed(1)}`);
            if (f >= 1 && !d.done) { d.done = true; d.c.setAttribute('r', 11); api.sfx.tone(500 + i * 120, .1, 'triangle', .07); frags.append(h('span', { class: 'drm-frag', style: { color: 'var(--ink)', background: 'transparent', border: `2px solid ${cols[i]}` } }, parts[d.k])); }
          });
          if (!all && !api.reduceMotion) raf = requestAnimationFrame(step);
          else {
            if (api.reduceMotion) dots.forEach((d, i) => { if (!d.done) { d.done = true; frags.append(h('span', { class: 'drm-frag', style: { color: 'var(--ink)', background: 'transparent', border: `2px solid ${cols[i]}` } }, parts[d.k])); } });
            pons.style.opacity = .5;
            type(`You are ${parts.act} ${parts.where} with ${parts.who}, when suddenly ${parts.ev}.`);
          }
        };
        raf = requestAnimationFrame(step);
      });
      function type(text) {
        story.innerHTML = ''; const span = h('span'); const caret = h('span', { class: 'caret' }); story.append(span, caret);
        if (api.reduceMotion) { span.textContent = text; caret.remove(); fire.disabled = false; fire.textContent = 'Fire again'; return; }
        let k = 0;
        const tick = () => { k += 2; span.textContent = text.slice(0, k); if (k < text.length) bag.t(tick, 28); else { caret.remove(); fire.disabled = false; fire.textContent = 'Fire again'; api.sfx.blip(); } };
        tick();
      }
    }

    /* ---------- consolidation ---------- */
    function buildCon() {
      pane.innerHTML = '';
      const skipRem = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, 'Skip REM (all-nighter)');
      skipRem.addEventListener('click', () => { const on = skipRem.getAttribute('aria-pressed') !== 'true'; skipRem.setAttribute('aria-pressed', String(on)); reset(); go.textContent = 'Sleep on it'; api.sfx.tap(); });
      const go = h('button', { type: 'button', class: 'btn btn-primary' }, 'Sleep on it');
      const colA = h('div', { class: 'drm-col' }, h('h5', null, 'Today'));
      const colB = h('div', { class: 'drm-col' }, h('h5', null, 'Hippocampus (inbox)'));
      const colC = h('div', { class: 'drm-col' }, h('h5', null, 'Cortex (long-term files)'));
      const bub = h('div', { class: 'drm-bub', 'aria-live': 'polite' });
      const res = h('div', { class: 'w2-panel', hidden: true });
      const expl = h('div', { class: 'w2-fb' }, h('strong', null, 'Consolidation theory: '), 'dreams help process the day’s experiences and store important memories. During sleep, especially REM, the brain replays new learning and moves it from the hippocampus into long-term storage in the cortex, while clearing out clutter.');
      pane.append(h('div', { class: 'w2-row' }, go, skipRem), h('div', { class: 'drm-cols' }, colA, colB, colC), bub, res, expl);
      let cards = [];
      function reset() {
        bag.clear(); go.disabled = false; res.hidden = true; bub.textContent = '';
        [colA, colB, colC].forEach(c => c.querySelectorAll('.drm-card').forEach(x => x.remove()));
        cards = MEMS.map(m => { const c = h('div', { class: 'drm-card' }, m.t); colA.append(c); return { m, c }; });
      }
      let ran = false;
      go.addEventListener('click', () => {
        if (ran) reset();
        ran = true;
        go.disabled = true; api.sfx.tone(300, .6, 'sine', .05, 150);
        const noRem = skipRem.getAttribute('aria-pressed') === 'true';
        const D = api.reduceMotion ? 0.5 : 1;
        let t = 0;
        cards.forEach(({ m, c }) => {
          bag.t(() => { colB.append(c); api.sfx.tap(); }, t += 450 * D);
        });
        cards.forEach(({ m, c }) => {
          bag.t(() => {
            if (m.keep && !noRem) { colC.append(c); c.classList.add(m.emo ? 'emo' : 'keep'); bub.textContent = `Dreaming: ${m.dream}...`; api.sfx.tone(660, .1, 'triangle', .07); }
            else if (m.keep && noRem) { if (m.t.startsWith('Argument')) { colC.append(c); c.classList.add('weak'); } else { c.classList.add('weak'); } bub.textContent = 'No REM tonight: very little replay...'; }
            else { c.classList.add('gone'); bub.textContent = `“${m.t}” fades away.`; }
          }, t += 1100 * D);
        });
        bag.t(() => {
          bub.textContent = 'Morning!';
          res.hidden = false; res.innerHTML = '';
          res.append(h('div', { class: 'w2-tag' }, 'Next day'), h('ul', null, MEMS.map(m => h('li', null, h('strong', null, m.t + ': '), noRem && m.keep ? (m.emo ? 'You remember it, but it still stings.' : 'Fuzzy. Without REM, it never got filed well.') : m.res))));
          if (noRem) res.append(h('p', { style: { margin: 0 } }, 'Skipping sleep (and REM) cuts the replay that locks in learning. Tomorrow night, expect REM rebound.'));
          go.disabled = false; go.textContent = 'Sleep again'; api.sfx.good(); api.addXP(1);
        }, t += 900);
      });
      reset();
    }
    function setTab(v) { cancelAnimationFrame(raf); bag.clear(); api.sfx.tap(); v === 'as' ? buildAS() : buildCon(); }

    /* ---------- quick check ---------- */
    let qi = 0, score = 0, tries = 0;
    function ask() {
      const q = QUIZ[qi]; tries = 0;
      quiz.innerHTML = '';
      const fb = h('div', { class: 'w2-fb' }, 'Tap a theory.');
      const row = h('div', { class: 'drm-q' });
      [['as', 'Activation-synthesis'], ['con', 'Consolidation']].forEach(([k, l]) => {
        const b = h('button', { type: 'button', class: 'btn' }, l);
        b.addEventListener('click', () => {
          if (k === q.a) {
            b.classList.add('right'); row.querySelectorAll('.btn').forEach(x => x.disabled = true);
            if (!tries) { score++; api.addXP(2); } api.sfx.good();
            fb.className = 'w2-fb good'; fb.innerHTML = '';
            const nx = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { marginTop: '8px', display: 'flex' } }, qi + 1 < QUIZ.length ? 'Next' : 'Finish');
            nx.addEventListener('click', () => { qi++; if (qi < QUIZ.length) ask(); else done(); });
            fb.append(h('strong', null, 'Yes. '), q.why, nx); nx.focus({ preventScroll: true });
          } else { tries++; b.classList.add('wrong'); b.disabled = true; api.sfx.bad(); fb.className = 'w2-fb bad'; fb.textContent = 'Not this one. Is the dream random noise, or the brain storing the day?'; }
        });
        row.append(b);
      });
      quiz.append(h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, h('span', { class: 'w2-tag' }, `${qi + 1} of ${QUIZ.length}`), h('span', { class: 'w2-score' }, `Score ${score}`)), h('div', { class: 'w2-q' }, q.q), row, fb);
    }
    function done() {
      quiz.innerHTML = '';
      const again = h('button', { type: 'button', class: 'btn btn-primary btn-sm', style: { alignSelf: 'flex-start' } }, 'Try again');
      again.addEventListener('click', () => { qi = 0; score = 0; ask(); });
      quiz.append(h('div', { class: 'w2-tag' }, 'Done'), h('h4', null, `${score} of ${QUIZ.length} on the first try`), h('p', { style: { margin: 0 } }, 'Activation-synthesis = random brainstem signals + a story-making cortex. Consolidation = sleep and dreams help store the day’s memories.'), again);
      if (score >= 4) { api.sfx.win(); const r = quiz.getBoundingClientRect(); api.confetti(r.left + r.width / 2, r.top, 50); }
    }
    buildAS(); ask();
    return () => { cancelAnimationFrame(raf); bag.destroy(); };
  }
});
})();
