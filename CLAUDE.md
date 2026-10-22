# Mustang Mind Lab

An interactive review app for AP Psychology Unit 1: Biological Bases of Behavior (Little Chute High School, the Mustangs).
Students relearn each topic in lessons with checks for understanding (CFUs) and simulations, then practice in arcade and vocab games.
It is a static site with no build server and no AI: GitHub repo, deployed by Vercel as a single `index.html`.

## The golden rule
NEVER edit `index.html` by hand. It is generated. Edit files in `src/`, then run:

    python3 build.py

That rewrites `index.html`. Commit both the `src/` changes and the new `index.html`, then push to `main`; Vercel redeploys automatically.

## Workflow for every change
1. Read the relevant files in `src/` before editing.
2. Make the change in `src/`.
3. Run `python3 build.py`.
4. Test: `python3 tools/check.py 390` and `python3 tools/check.py 1280 dark` (phone and desktop). No output besides "sweep done" means pass. If Playwright is missing: `pip3 install playwright && python3 -m playwright install chromium`.
5. Summarize what changed in plain language, then commit with a clear message and push (only after I approve, unless I said to push).

## Project layout
- `src/core.js`: app shell, navigation, saved progress (localStorage key `mustang-mind-lab-v1`), sounds, confetti, the CFU engine, the lesson renderer, and the Home / Learn / Topic / Lesson / Arcade / Game / Prove It / Progress / Glossary views.
- `src/styles.css`: design tokens and shared classes. Light and dark themes are defined as CSS variables in `:root` and the dark blocks; always use the tokens, never hard-coded colors. Games use the fixed dark "arcade" palette (`--arc-*`, `ML.arcade`).
- `src/data/00-base.js`: topics (title, objective, "I can" Level 1–3 targets) and lesson order.
- `src/data/10-terms.js`: the 225 vocabulary terms that every game draws from. Format: `T(topic, group, id, term, shortLabel, definition)`. Short labels should be 16 characters or fewer (they appear on game targets).
- `src/data/21-26-lesson-*.js`: the 13 lessons (1.1, 1.2, 1.3A–C, 1.4A–B, 1.5, 1.6A–E).
- `src/data/30-questions.js`: Prove It question bank. Format: `Q(topic, question, [choices], indexOfCorrect, explanation)`.
- `src/data/40-puzzles.js`: Connections puzzles (4 groups of 4, levels 1–4) and acrostics (first letters of answers spell the hidden word; answers A–Z only).
- `src/widgets/*.js`: 39 lesson simulations, one per file, registered with `ML.registerWidget(id, {...})`. `_w2-kit.js` is a shared helper for the 1.4/1.5 widgets.
- `src/games/*.js`: 10 games registered with `ML.registerGame({...})`.
- `docs/component-api.md`: full API for writing widgets and games (contexts, helpers, quality rules).
- `tools/check.py`: automated smoke test.

## Lesson format (src/data/2x-lesson-*.js)
Each lesson has `steps`; each step has `kind`, `title`, and `blocks`. Block types:
`hook`, `text`, `bullets`, `analogy`, `apply`, `clinical`, `note`, `table`, `cards`, `reveal`, `links`, `widget` (`{type:'widget', id, caption}`), and `cfu`.
In any text, `{{word}}` becomes a blue tap-to-reveal blank (guided notes).
CFU types: `mc` (`choices`, `a` = correct index, `why`), `tf` (`a: true/false`), `sort` (`bins`, `items: [{t, bin}]`), `order` (`items` in correct order), `match` (`pairs: [[left, right]]`).
Every CFU needs a unique `id` (pattern `'1.3B-c9'`). Students must answer every CFU in a step to move on.

## Teaching conventions (keep these)
- Lesson structure: big picture → anatomy/structure → physiology/how it works → application → clinical connection, with CFUs after each major section.
- Learning targets: Level 1 starts with "I can…"; Levels 2 and 3 start with "Additionally, I can…".
- Narrative hooks, analogies, and real-world framing. Copy is short, plain, warm, and accurate for high school students. No emoji in the app copy.
- The more interactive, the better: prefer adding an interaction over adding reading.
- Content must match the class slides and standard AP Psychology (Myers). Known slide errors that are already corrected (do not reintroduce): identical twins come from one zygote that splits; night terrors and sleepwalking happen in deep NREM Stage 3; the SCN cues melatonin when it gets dark (not "collected in the pons"); heritability describes variation in a group, never a share of one person.
- Full animations play by default for every student, even if the device has reduced motion turned on. Motion is reduced only when a student turns on "Reduce motion" in the app's Settings (`ML.reduceMotion()` / `ctx.reduceMotion` / `api.reduceMotion`).

## Technical rules
- Vanilla JavaScript only, no frameworks, no npm dependencies, no network calls besides Google Fonts. Everything must keep working as one static file.
- Must work on school Chromebooks and phones (about 340px wide) with mouse, touch, and keyboard; no sideways page scrolling.
- Any component with an animation loop or listeners must return a cleanup function that stops them.
- Keep CSS class names prefixed by the component id to avoid collisions.
