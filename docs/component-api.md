# Mustang Mind Lab — brief for component builders

## What this is
A single-page study app (one self-contained HTML file, published as a claude.ai artifact) for high school
AP Psychology students to re-learn and practice **Unit 1: Biological Bases of Behavior**. Students relearn
concepts in lessons (with interactive widgets and checks for understanding), then play arcade and vocab games.
Users: 9th–12th graders on school Chromebooks and phones. The teacher wants LOTS of animation, visuals,
interactivity, and games; "the more interactive elements in every part, the better."

Source slides (text extract): `/home/claude/psych/deck_clean.md` — the class content. Stay faithful to it and
to standard AP Psychology (Myers) content, but fix these known slide errors rather than copying them:
identical twins come from ONE zygote that splits; night terrors and sleepwalking happen in deep NREM (Stage 3);
melatonin is not "collected in the pons" (the SCN in the hypothalamus cues melatonin release when it gets dark);
Stage 1 sleep moves from alpha into theta waves; heritability describes variation in a GROUP, never "% of one person."

## Project layout (/home/claude/psych)
- `src/core.js` — shell, router, helpers, CFU engine, game page, registries. READ IT FIRST.
- `src/styles.css` — design tokens + component classes. Read the `:root` token block and the `.arc-*`, `.widget*`, `.touch-pad`, `.btn`, `.chip`, `.token` classes.
- `src/data/*.js` — `ML.data` (topics, terms, lessons, questions, connections, acrostics). Term schema in `src/data/10-terms.js`:
  `{ id, t: full term, s: short label (≤ ~16 chars), d: definition, topic: '1.1'..'1.6', g: group key }`.
- `src/widgets/*.js`, `src/games/*.js` — where YOUR files go (one file per component, named after its id).
- `python3 build.py OUT.html` bundles everything into OUT.html and OUT.preview.html (the preview has a doctype; test with it).
  ALWAYS pass your own OUT path (e.g. `dist/<yourname>.html`) — other builders run in parallel.
- `python3 tools/shot.py OUT.png --html dist/<yourname>.preview.html [--w 390 --h 844 --touch] [--dark] --js "..." --js "..." [--wait ms] [--full]`
  screenshots and prints console errors. Look at your screenshots with the Read tool. For deeper testing, write your own
  Playwright (python `playwright.sync_api`, Chromium is preinstalled; never run `playwright install`) scripts in `/home/claude/psych/tools/` with a unique filename.

## Rules
- Do NOT edit `src/core.js`, `src/styles.css`, or anything in `src/data/`. Only create your own files. If you truly need a
  core change, explain it in your final report.
- Vanilla JS only, no libraries, no network requests (the page runs in a sandboxed iframe: no alert/confirm/prompt, no fetch).
- Wrap each file in an IIFE. Put component CSS inside the JS: inject one `<style>` element once (guard with an id), with class
  names prefixed by your component id to avoid collisions. Use the CSS custom properties from styles.css so light and dark themes
  both work: widgets use `var(--surface)`, `var(--surface-2)`, `var(--ink)`, `var(--muted)`, `var(--line)`, `var(--carolina)`,
  `var(--carolina-soft)`, `var(--spark)`, `var(--spark-soft)`, `var(--good)`, `var(--bad)`, `var(--warn)`, `var(--blank)`.
  Games live on a dark "arcade cabinet" that is the same in both themes: use `ML.arcade` colors (canvas) / `var(--arc-*)` (DOM).
  In SVG, set colors with `style="fill:var(--x)"` or CSS classes, NOT presentation attributes like `fill="var(--x)"`.
  Fonts: `ML.fonts.display` (Bungee, arcade titles/scores), `ML.fonts.body` (Atkinson Hyperlegible), `ML.fonts.mono` (JetBrains Mono, HUD/readouts).
  (Fonts load from Google Fonts in production; they fall back locally, that's fine.)
- Must work at phone width (≈340px usable) up to desktop, with mouse, touch, AND keyboard. Buttons get aria-labels where the text
  is not self-explanatory. No horizontal page overflow.
- Animations ON by default. If `ctx.reduceMotion` / `api.reduceMotion` is true, drop non-essential motion (shake, particles, confetti) but keep it fully usable.
- Sounds: `ML.sfx` / `ctx.sfx` / `api.sfx` → `tap, blip, good, bad, shoot, boom, flip, level, win, lose, fire, tone(freq, dur, type, vol, slideTo, delay)`.
- Your mount function must return a cleanup function that stops every rAF loop/timer and removes every window/document listener.
- Copy is for teenagers: short, plain, encouraging, accurate. No emoji as decoration.

## Games API (`src/games/<id>.js`)
```js
ML.registerGame({
  id: 'invaders', title: 'Neuro Invaders', kind: 'arcade' /* or 'word' */,
  blurb: 'One sentence.', how: ['3-4 short how-to-play bullets'],
  art: '<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice">…</svg>',  // card thumbnail, arcade palette, simple shapes
  mount(el, ctx) { …; return () => { /* cleanup */ }; }
});
```
`ctx` (see VIEWS.game in core.js): `terms` (pool for the student's chosen topics), `allTerms`, `topics`, `data` (ML.data),
`deck.next(k)` → `{ prompt: definition, answer: term, choices: [k terms incl. answer], miss() }` (smart distractors, missed terms recycle),
`record(item, correct)` — call for EVERY answer (pass the item from deck.next, or a term object),
`finish({ score, correct, total, won, note, title, lowerIsBetter })` — ends the round; the shell shows a results overlay with missed terms,
`isActive()`, `sfx`, `confetti`, `toast`, `stage(el, W, H, {label, reserve})` → `{ canvas, g, W, H, toLogical(evt), destroy() }` (DPR-sharp fixed logical size that scales to fit),
`loop(fn(dt, t))` → `{ stop, pause, resume }`, `fitText(g, text, maxW, size, family, weight)`, `wrapText(g, text, x, y, maxW, lineH)`,
`roundRect(g, x, y, w, h, r)`, `colors` (= ML.arcade), `fonts`, `reduceMotion`, `best`, `h` (DOM builder: `h(tag, attrs, ...children)`), `util` (shuffle, sample, clamp, rand, pick).
The shell already shows a How-to-play intro with a Start button before mount, and results after finish. Inside `el` render your own HUD
(use `.arc-hud` and `.arc-prompt` classes) + canvas + on-screen `.touch-pad` buttons for phones. Round length 2–4 minutes; give
students time to READ the definition prompt (they are learning, not speedrunning): e.g. slow/pause action briefly when a new prompt appears,
keep prompt text large (≥17px DOM) above the canvas. Correct answers: satisfying juice (particles, flash, score popup, sound). Wrong answers:
clear feedback that shows the right answer briefly. Labels drawn on canvas must stay readable (≥13px at a 390px-wide phone) — use `fitText`.
Keyboard: arrows/WASD + Space/Enter; also pointer/touch.

## Widgets API (`src/widgets/<id>.js`)
```js
ML.registerWidget('action-potential', {
  title: 'Fire a neuron', tag: 'Simulation',   // shown in the widget header
  mount(el, api) { …; return () => { /* cleanup */ }; }
});
```
`api`: `h`, `svgEl(tag, attrs)`, `util`, `sfx`, `confetti(x, y, n)`, `toast(msg)`, `term(id)`, `reduceMotion`, `rich(html)` (renders
`{{word}}` as tap-to-reveal blanks), `addXP(n)`, `makeDraggable(el, getTargets, onDrop)`.
The widget renders inside a `.widget` card in a 760px-max lesson column (often ~340px on phones). Start with one short instruction
line telling the student what to do. Prefer SVG for diagrams (crisp, themeable) and canvas for heavy animation. Give every widget at least
one real interaction (tap parts, drag, sliders, buttons, quiz mode), immediate visual feedback, and accurate labels. Where it fits, add an
"Explore / Quiz me" toggle: Explore = tap to learn; Quiz = "Tap the ___" with right/wrong feedback (`api.sfx.good()`/`bad()`, `api.addXP(2)` per right answer).

## Done means
Your components build without console errors, look polished in light AND dark at 1280px and 390px, are playable/usable with keyboard and
touch, clean up on navigation (`ML.go('home')` after mounting must leave no running loops or errors). Final report: list each id you
registered, one line on what it does, and anything the lesson author should know (e.g. what concepts it covers, captions to use).
For widgets, test by mounting directly, e.g. `--js "document.querySelector('#main').innerHTML='';document.querySelector('#main').append(ML.mountWidget('action-potential'))"`.
