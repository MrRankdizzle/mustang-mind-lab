/* Synapse Slingshot — launch a neurotransmitter at the receptor whose term matches the definition. */
(function () {
'use strict';
const ID = 'slingshot';
const STYLE_ID = 'slingshot-style';
const CSS = `
.slingshot-root{display:flex;flex-direction:column}
.slingshot-root .slingshot-hud{flex-wrap:nowrap}
.slingshot-root .ss-group{display:flex;align-items:center;gap:6px;white-space:nowrap}
.slingshot-root .ss-lab{font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.slingshot-root .ss-score{font-family:var(--f-display);font-weight:400;font-size:20px;color:var(--arc-gold);letter-spacing:.02em;min-width:3ch}
.slingshot-root .slingshot-ammo{display:inline-flex;gap:5px}
.slingshot-root .slingshot-ammo i{width:13px;height:13px;border-radius:50%;background:var(--arc-spark);box-shadow:0 0 8px var(--arc-spark);display:block;transition:all .2s}
.slingshot-root .slingshot-ammo i.used{background:transparent;box-shadow:none;border:2px solid var(--arc-line)}
.slingshot-root .slingshot-prompt{transition:border-color .35s,box-shadow .35s}
.slingshot-root .ss-text{font-size:18px;line-height:1.35}
.slingshot-root .ss-text b{color:var(--arc-mint)}
.slingshot-root .slingshot-prompt.ss-flash{border-color:var(--arc-gold);box-shadow:0 0 0 3px rgba(255,209,102,.22)}
.slingshot-root .slingshot-prompt.ss-bad{border-color:var(--arc-spark)}
.slingshot-root .slingshot-hint{font-family:var(--f-mono);font-size:12px;color:var(--arc-dim);text-align:center;padding-top:8px}
@media (max-width:560px){
 .slingshot-root .slingshot-prompt .tag{display:none}
 .slingshot-root .slingshot-prompt{border-left:4px solid var(--arc-gold);padding:8px 12px;margin-bottom:8px}
 .slingshot-root .ss-text{font-size:17px;line-height:1.27}
 .slingshot-root .slingshot-hud{padding-bottom:8px;gap:8px}
 .slingshot-root .ss-lab{font-size:10px;letter-spacing:.08em}
 .slingshot-root .slingshot-hint{display:none}
}
@media (max-height:760px) and (min-width:561px){.slingshot-root .slingshot-hint{display:none}}
`;
function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.append(s);
}

const ART = `<svg viewBox="0 0 250 112" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="ssg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE6EA"/><stop offset=".45" stop-color="#FF6B81"/><stop offset="1" stop-color="#FF6B81" stop-opacity="0"/></radialGradient></defs>
<rect width="250" height="112" fill="#0B1222"/>
<g fill="#24325A"><circle cx="70" cy="22" r="5"/><circle cx="150" cy="14" r="3"/><circle cx="205" cy="30" r="4"/><circle cx="110" cy="40" r="2.5"/></g>
<rect y="94" width="250" height="18" fill="#121C33"/><g fill="#4B9CD3" opacity=".7"><circle cx="6" cy="94" r="3"/><circle cx="18" cy="94" r="3"/><circle cx="30" cy="94" r="3"/><circle cx="42" cy="94" r="3"/><circle cx="54" cy="94" r="3"/><circle cx="66" cy="94" r="3"/><circle cx="78" cy="94" r="3"/><circle cx="90" cy="94" r="3"/><circle cx="102" cy="94" r="3"/><circle cx="114" cy="94" r="3"/><circle cx="126" cy="94" r="3"/><circle cx="138" cy="94" r="3"/><circle cx="150" cy="94" r="3"/><circle cx="162" cy="94" r="3"/><circle cx="174" cy="94" r="3"/><circle cx="186" cy="94" r="3"/><circle cx="198" cy="94" r="3"/><circle cx="210" cy="94" r="3"/><circle cx="222" cy="94" r="3"/><circle cx="234" cy="94" r="3"/><circle cx="246" cy="94" r="3"/></g>
<path d="M36 92V70M36 70l-9-12M36 70l9-12" stroke="#7CC0EE" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M27 58L22 66M45 58L22 66" stroke="#FF9F5A" stroke-width="2" fill="none"/>
<circle cx="22" cy="66" r="11" fill="url(#ssg)"/><circle cx="22" cy="66" r="5" fill="#FF6B81"/>
<path d="M36 60Q90 0 150 30" stroke="#E8F0FF" stroke-width="2.4" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>
<g fill="#24325A" stroke="#8EA0C4" stroke-width="1"><rect x="160" y="78" width="18" height="16"/><rect x="160" y="62" width="18" height="16"/><rect x="210" y="78" width="18" height="16"/><rect x="210" y="62" width="18" height="16"/><rect x="210" y="46" width="18" height="16"/><rect x="210" y="30" width="18" height="16"/></g>
<path d="M159 62v-10h6a4 4 0 0 0 8 0h6v10z" fill="#FFD166"/><path d="M209 30v-10h6a4 4 0 0 0 8 0h6v10z" fill="#B79CF6"/>
<circle cx="169" cy="54" r="12" fill="none" stroke="#FFD166" stroke-width="2" opacity=".55"/>
<g fill="#35E3A7"><circle cx="150" cy="40" r="2"/><circle cx="182" cy="42" r="2"/><circle cx="160" cy="34" r="1.6"/></g>
</svg>`;

ML.registerGame({
  id: ID, title: 'Synapse Slingshot', kind: 'arcade',
  blurb: 'Fling a neurotransmitter across the synapse and bind it to the receptor that matches the definition.',
  how: [
    'Read the definition, then find the receptor labeled with the matching term.',
    'Drag anywhere on the screen to pull the sling back, aim with the dotted path, and let go to launch.',
    'Keyboard: ←/→ tilt the aim, ↑/↓ change power, Space to launch.',
    'Three shots per receptor. First-shot hits score the most, and wind shows up in later rounds.'
  ],
  art: ART,
  mount(el, ctx) {
    injectStyle();
    const { h, util, sfx } = ctx;
    const C = ctx.colors, F = ctx.fonts, RM = ctx.reduceMotion;
    const ROUNDS = 8, SHOTS = 3;

    /* ---------- DOM ---------- */
    const root = h('div', { class: 'slingshot-root' }); el.append(root);
    const scoreEl = h('b', { class: 'ss-score' }, '0');
    const roundEl = h('b', null, '1/' + ROUNDS);
    const ammoEl = h('span', { class: 'slingshot-ammo', role: 'img', 'aria-label': 'Shots left: 3' });
    const hud = h('div', { class: 'arc-hud slingshot-hud' },
      h('span', { class: 'ss-group' }, h('span', { class: 'ss-lab' }, 'Score'), scoreEl),
      h('span', { class: 'ss-group' }, h('span', { class: 'ss-lab' }, 'Receptor'), roundEl),
      h('span', { class: 'ss-group' }, h('span', { class: 'ss-lab' }, 'Shots'), ammoEl));
    const promptText = h('span', { class: 'ss-text' });
    const prompt = h('div', { class: 'arc-prompt slingshot-prompt', 'aria-live': 'polite' }, h('span', { class: 'tag' }, 'Bind to'), promptText);
    const status = h('div', { class: 'sr-only', 'aria-live': 'assertive' });
    root.append(hud, prompt, status);

    const avail = el.clientWidth || root.clientWidth || innerWidth;
    const wide = avail >= 600;
    const W = wide ? 960 : 440, H = wide ? 540 : 564;
    const st = ctx.stage(root, W, H, { label: 'Synapse Slingshot. Drag to pull the sling, release to launch. Keyboard: arrows aim, Space launches.', reserve: wide ? 330 : 262 });
    const g = st.g, canvas = st.canvas;
    const hint = h('div', { class: 'slingshot-hint' }, 'Drag anywhere to aim  ·  ←/→ tilt  ·  ↑/↓ power  ·  Space launch');
    root.append(hint);

    const K = wide
      ? { ground: 488, slX: 150, fork: 92, tip: 16, ballR: 11, recR: 23, bw: 40, bh: 26, grav: 900, vmax: 1060, maxPull: 120, label: 17, xMin: 420, xMax: 912, gap: 150, maxH: 340, prevT: 0.42 }
      : { ground: 522, slX: 96, fork: 78, tip: 13, ballR: 10, recR: 20, bw: 32, bh: 23, grav: 820, vmax: 860, maxPull: 84, label: 16, xMin: 196, xMax: 414, gap: 66, maxH: 400, prevT: 0.4 };
    const P0 = { x: K.slX, y: K.ground - K.fork + 8 };
    const REC_COLORS = [C.blue, C.violet, C.orange];

    /* ---------- state ---------- */
    let score = 0, roundNo = 0, shotsLeft = SHOTS, correct = 0, firsts = 0, streak = 0;
    let item = null, targets = [], blocks = [], debris = [], parts = [], pops = [], ghostPath = [], curPath = [];
    let ball = null, phase = 'build', buildT = 0, wrongThis = false, solved = false, recordedThis = false;
    let angle = 42, power = 0.62, pulling = null, kbActive = false, shake = 0, flash = 0, flashColor = C.mint;
    let wind = 0, obstacle = null, t = 0, banner = null, finished = false, firstRound = true;
    const held = new Set();
    const timers = [];
    const later = (s, fn) => timers.push({ s, fn });
    const vesicles = Array.from({ length: wide ? 22 : 14 }, () => ({ x: util.rand(0, W), y: util.rand(20, K.ground - 40), r: util.rand(3, 9), s: util.rand(4, 12), p: util.rand(0, 6) }));

    function cssScale() { const r = canvas.getBoundingClientRect(); return r.width ? r.width / W : 1; }
    function labelSize() { return Math.max(K.label, 14 / cssScale()); }

    function paintAmmo() {
      ammoEl.innerHTML = '';
      for (let i = 0; i < SHOTS; i++) ammoEl.append(h('i', { class: i < shotsLeft ? '' : 'used' }));
      ammoEl.setAttribute('aria-label', 'Shots left: ' + shotsLeft);
    }
    function addScore(n) { score += n; scoreEl.textContent = score; }

    /* ---------- label layout ---------- */
    function labelLines(text, fs, maxW) {
      g.font = `700 ${fs}px ${F.body}`;
      if (g.measureText(text).width <= maxW || !text.includes(' ')) return [text];
      const w = text.split(' '); let best = null;
      for (let i = 1; i < w.length; i++) {
        const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
        const m = Math.max(g.measureText(a).width, g.measureText(b).width);
        if (!best || m < best.m) best = { m, l: [a, b] };
      }
      return best.l;
    }
    function tagBox(tg) {
      g.font = `700 ${tg.fs}px ${F.body}`;
      const tw = Math.min(W - 8, Math.max(...tg.lines.map(l => g.measureText(l).width)) + 18);
      const th = tg.lines.length * tg.fs * 1.12 + 10;
      const cx = util.clamp(tg.x, tw / 2 + 4, W - tw / 2 - 4);
      const bottom = tg.y - K.recR * 0.9 - 8;
      return { x: cx - tw / 2, y: bottom - th, w: tw, h: th };
    }
    const overlap = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

    function buildTower(tg) {
      const out = [], n = tg.n, x = tg.x, bw = K.bw, bh = K.bh;
      let top = K.ground;
      if (tg.kind === 'arch' && n >= 3) {
        const pillars = n - 1;
        for (let i = 0; i < pillars; i++) {
          out.push({ x: x - bw * 0.75 - bw * 0.3, y: K.ground - (i + 1) * bh, w: bw * 0.6, h: bh, c: 0 });
          out.push({ x: x + bw * 0.75 - bw * 0.3, y: K.ground - (i + 1) * bh, w: bw * 0.6, h: bh, c: 0 });
        }
        top = K.ground - pillars * bh;
        out.push({ x: x - bw * 1.25, y: top - bh, w: bw * 2.5, h: bh, c: 1 });
        top -= bh;
      } else {
        for (let i = 0; i < n; i++) {
          const wideRow = tg.kind === 'base' && i < Math.ceil(n / 3);
          const w = wideRow ? bw * 1.7 : bw;
          out.push({ x: x - w / 2, y: K.ground - (i + 1) * bh, w, h: bh, c: wideRow ? 2 : 0 });
        }
        top = K.ground - n * bh;
      }
      tg.y = top - K.recR * 0.95;
      tg.foot = out.length ? Math.max(...out.map(b => b.w)) : K.recR * 2;
      return out;
    }

    function makeLayout(choices) {
      const fs0 = labelSize();
      const maxW1 = wide ? 200 : 150;
      const nMax = Math.floor((K.maxH - K.recR) / K.bh);
      const kinds = ['col', 'base', 'arch'];
      for (let fs = fs0; fs >= Math.min(fs0, 12 / cssScale()) - 0.01; fs -= 1) {
        for (let tries = 0; tries < 500; tries++) {
          const xs = [];
          for (let i = 0; i < 3; i++) xs.push(util.rand(K.xMin, K.xMax));
          xs.sort((a, b) => a - b);
          if (xs[1] - xs[0] < K.gap || xs[2] - xs[1] < K.gap) continue;
          const order = util.shuffle([0, 1, 2]);
          const tg = order.map((ci, i) => ({ term: choices[ci], x: xs[i], n: util.rand(0, nMax + 1) | 0, kind: util.pick(kinds), color: REC_COLORS[i], fs }));
          // keep heights varied
          const ns = tg.map(o => o.n).sort((a, b) => a - b);
          if (ns[1] - ns[0] < 2 || ns[2] - ns[1] < 2) continue;
          let bl = [];
          tg.forEach(o => { o.blocks = buildTower(o); bl = bl.concat(o.blocks); o.lines = labelLines(o.term.s, fs, maxW1); o.tag = tagBox(o); });
          let ok = true;
          for (let i = 0; i < 3 && ok; i++) {
            const a = tg[i];
            if (a.tag.y < 40 || a.x + a.foot / 2 > W - 4) ok = false;
            for (let j = 0; j < 3 && ok; j++) {
              if (i === j) continue;
              const b = tg[j];
              const rb = { x: b.x - K.recR - 4, y: b.y - K.recR - 4, w: 2 * K.recR + 8, h: 2 * K.recR + 8 };
              if (overlap(a.tag, b.tag, 5) || overlap(a.tag, rb, 2)) ok = false;
              if (j > i && Math.abs(a.x - b.x) < (a.foot + b.foot) / 2 + 10) ok = false;
            }
          }
          if (ok) return { tg, bl };
        }
      }
      // fallback: fixed staircase
      const tg = [0, 1, 2].map(i => ({ term: choices[i], x: K.xMin + (K.xMax - K.xMin) * (i / 2), n: [1, 5, 9][i], kind: 'col', color: REC_COLORS[i], fs: fs0 * 0.85 }));
      let bl = [];
      tg.forEach(o => { o.blocks = buildTower(o); bl = bl.concat(o.blocks); o.lines = labelLines(o.term.s, o.fs, maxW1); o.tag = tagBox(o); });
      return { tg, bl };
    }

    /* ---------- round flow ---------- */
    function newPrompt() {
      roundNo++;
      const prev = item;
      item = ctx.deck.next(3);
      if (prev && item.answer.id === prev.answer.id) { const again = item; item = ctx.deck.next(3); again.miss(); }
      shotsLeft = SHOTS; wrongThis = false; solved = false; recordedThis = false; ghostPath = []; curPath = [];
      paintAmmo();
      roundEl.textContent = `${roundNo}/${ROUNDS}`;
      promptText.textContent = item.prompt;
      prompt.classList.remove('ss-bad'); prompt.classList.add('ss-flash');
      later(1.4, () => prompt.classList.remove('ss-flash'));
      const lay = makeLayout(item.choices);
      targets = lay.tg.map(o => Object.assign(o, { correct: o.term.id === item.answer.id, state: 'idle', st: 0, pulse: 0 }));
      blocks = lay.bl;
      // later rounds: wind, then a drifting glial cell
      wind = roundNo >= 4 ? util.pick([-1, 1]) * util.rand(wide ? 70 : 55, wide ? 170 : 130) * (roundNo >= 7 ? 1.25 : 1) : 0;
      obstacle = roundNo >= 6 ? { x: wide ? util.rand(300, 360) : util.rand(118, 140), y: K.ground - 160, r: wide ? 26 : 20, a: util.rand(0, 6), amp: wide ? 130 : 120, spd: util.rand(0.9, 1.3) } : null;
      if (obstacle) {
        // keep the obstacle lane clear of tags
        const lane = { x: obstacle.x - obstacle.r - 6, y: 0, w: obstacle.r * 2 + 12, h: K.ground };
        if (targets.some(o => overlap(o.tag, lane))) obstacle.x = wide ? 300 : 120;
      }
      phase = 'build'; buildT = 0;
      if (roundNo === 4) banner = { text: 'WIND!', sub: 'Watch the arrow at the top', t: 0, c: C.blue };
      else if (roundNo === 6) banner = { text: 'GLIAL CELL!', sub: 'It drifts. Time your shot.', t: 0, c: C.violet };
      else banner = { text: `RECEPTOR ${roundNo}`, sub: 'Read the definition', t: 0, c: C.gold };
      status.textContent = `Receptor ${roundNo} of ${ROUNDS}. Targets: ${targets.map(o => o.term.s).join(', ')}.`;
    }

    function endRound() {
      if (finished) return; finished = true;
      const stars = correct >= 7 && firsts >= 4 ? 3 : correct >= 5 ? 2 : correct >= 3 ? 1 : 0;
      banner = { text: 'ROUND COMPLETE', sub: '★'.repeat(stars) + '☆'.repeat(3 - stars), t: 0, c: C.gold, long: true };
      phase = 'over';
      later(1.6, () => {
        if (!ctx.isActive()) return;
        const tips = ['Review the terms below, then try again.', 'Solid work. Aim for more first-shot hits next time.', 'Strong round. Can you get every receptor on the first shot?', 'Perfect aim and perfect recall.'];
        ctx.finish({ score, correct, total: ROUNDS, won: correct >= 4, note: `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}  ${stars} star${stars === 1 ? '' : 's'}: ${correct} of ${ROUNDS} receptors bound, ${firsts} on the first shot. ${tips[stars]}` });
      });
    }

    function nextOrEnd(delay) {
      phase = 'resolve';
      later(delay, () => { if (roundNo >= ROUNDS) endRound(); else newPrompt(); });
    }

    function launch() {
      if (phase !== 'aim' || shotsLeft <= 0) return;
      const pull = pullVec();
      const pos = { x: P0.x + pull.x, y: P0.y + pull.y };
      const sp = power * K.vmax, a = angle * Math.PI / 180;
      ball = { x: pos.x, y: pos.y, vx: Math.cos(a) * sp, vy: -Math.sin(a) * sp, r: K.ballR, life: 0, rest: 0, live: true, fade: 1, done: false, pathT: 0 };
      shotsLeft--; paintAmmo();
      phase = 'flight'; pulling = null;
      if (curPath.length) ghostPath = curPath;
      curPath = [{ x: ball.x, y: ball.y }];
      sfx.tone(260, 0.22, 'triangle', 0.12, 900); sfx.tone(140, 0.12, 'sine', 0.08);
      if (!RM) for (let i = 0; i < 8; i++) parts.push(P(P0.x, P0.y, util.rand(-120, 120), util.rand(-120, 60), C.orange, 0.4, 2.5));
    }

    function pullVec() {
      const a = angle * Math.PI / 180, d = power * K.maxPull;
      let x = -Math.cos(a) * d, y = Math.sin(a) * d;
      if (P0.y + y > K.ground - K.ballR - 2) y = K.ground - K.ballR - 2 - P0.y;
      if (P0.x + x < K.ballR + 2) x = K.ballR + 2 - P0.x;
      return { x, y };
    }

    function shotOver() {
      if (!ball || ball.done) return;
      ball.done = true;
      if (solved || phase === 'over') return;
      if (shotsLeft > 0) { phase = 'aim'; return; }
      // out of shots: reveal
      if (!wrongThis) { ctx.record(item, false); recordedThis = true; }
      streak = 0;
      const tg = targets.find(o => o.correct); tg.pulse = 1;
      reveal(`Out of shots. The answer was`);
      sfx.bad();
      pops.push(Pop(tg.x, tg.tag.y - 10, 'ANSWER', C.gold, 1.6));
      nextOrEnd(2.4);
    }

    function reveal(lead) {
      promptText.innerHTML = '';
      promptText.append(lead + ' ', h('b', null, item.answer.t), ': ' + item.prompt);
      prompt.classList.add('ss-bad');
    }

    function hitTarget(tg) {
      ball.live = false;
      if (tg.correct) {
        solved = true; tg.state = 'hit'; tg.st = 0;
        const shotIdx = SHOTS - shotsLeft - 1;
        let pts = wrongThis ? 50 : [300, 200, 100][shotIdx];
        if (!wrongThis) { correct++; ctx.record(item, true); recordedThis = true; }
        if (!wrongThis && shotIdx === 0) { firsts++; streak++; if (streak > 1) pts += 50 * (streak - 1); } else streak = 0;
        addScore(pts);
        ball.x = tg.x; ball.y = tg.y; ball.vx = ball.vy = 0; ball.bound = tg;
        pops.push(Pop(tg.x, tg.tag.y - 4, '+' + pts, C.gold, 1.3));
        if (!wrongThis && shotIdx === 0) pops.push(Pop(tg.x, tg.tag.y - 36, streak > 1 ? `STREAK x${streak}` : 'FIRST SHOT!', C.mint, 1.3));
        sfx.good(); sfx.boom(); sfx.tone(880, 0.25, 'triangle', 0.08, 1760, 0.12);
        flash = 1; flashColor = C.mint; if (!RM) shake = 10;
        status.textContent = `Bound! ${item.answer.t} is correct. Plus ${pts} points.`;
        promptText.innerHTML = ''; promptText.append(h('b', null, item.answer.t + ': '), item.prompt);
        burst(tg.x, tg.y, [C.mint, C.gold, tg.color, '#FFFFFF'], 46);
        // tumble the tower
        tg.blocks.forEach(b => {
          const i = blocks.indexOf(b); if (i >= 0) blocks.splice(i, 1);
          debris.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, w: b.w, h: b.h, c: b.c, vx: (b.x + b.w / 2 - tg.x) * 4 + util.rand(-140, 140), vy: util.rand(-380, -120), rot: 0, vr: util.rand(-7, 7), life: 0 });
        });
        later(0.35, () => { if (!RM) burst(tg.x, tg.y, [C.gold, C.mint], 20); sfx.tone(1320, 0.12, 'sine', 0.06); });
        nextOrEnd(2.0);
      } else {
        tg.state = 'wrong'; tg.st = 0; wrongThis = true; streak = 0;
        ctx.record(item, false); recordedThis = true;
        const right = targets.find(o => o.correct); right.pulse = 1;
        sfx.bad(); sfx.tone(110, 0.3, 'square', 0.05);
        flash = 0.7; flashColor = C.spark; if (!RM) shake = 6;
        pops.push(Pop(tg.x, tg.y - 40, 'WRONG RECEPTOR', C.spark, 1.2));
        status.textContent = `Wrong receptor. That was ${tg.term.t}. The glowing gold receptor is ${item.answer.t}.`;
        reveal(`${tg.term.s} is not it. Find`);
        // bounce the ball off and let it fade
        const dx = ball.x - tg.x, dy = ball.y - tg.y, d = Math.hypot(dx, dy) || 1;
        ball.vx = dx / d * 260; ball.vy = dy / d * 260 - 120; ball.fadeOut = true;
        if (!RM) burst(tg.x, tg.y, [C.spark, '#FFFFFF'], 16);
      }
    }

    /* ---------- particles ---------- */
    function P(x, y, vx, vy, c, life, size) { return { x, y, vx, vy, c, life, max: life, size }; }
    function Pop(x, y, text, c, life) { return { x, y, text, c, t: 0, life }; }
    function burst(x, y, cols, n) {
      if (RM) return;
      for (let i = 0; i < n; i++) { const a = util.rand(0, Math.PI * 2), s = util.rand(80, 380); parts.push(P(x, y, Math.cos(a) * s, Math.sin(a) * s - 60, util.pick(cols), util.rand(0.5, 1.1), util.rand(2, 5))); }
    }

    /* ---------- physics ---------- */
    function collideRect(b, r) {
      const cx = util.clamp(b.x, r.x, r.x + r.w), cy = util.clamp(b.y, r.y, r.y + r.h);
      let dx = b.x - cx, dy = b.y - cy, d2 = dx * dx + dy * dy;
      if (d2 >= b.r * b.r) return false;
      let d = Math.sqrt(d2), nx, ny;
      if (d < 0.0001) { // center inside rect: push out along the shortest axis
        const l = b.x - r.x, rr = r.x + r.w - b.x, tp = b.y - r.y, bt = r.y + r.h - b.y, m = Math.min(l, rr, tp, bt);
        nx = m === l ? -1 : m === rr ? 1 : 0; ny = m === tp ? -1 : m === bt ? 1 : 0; d = 0;
        if (!nx && !ny) ny = -1;
      } else { nx = dx / d; ny = dy / d; }
      b.x += nx * (b.r - d); b.y += ny * (b.r - d);
      const vn = b.vx * nx + b.vy * ny;
      if (vn < 0) {
        b.vx -= 1.45 * vn * nx; b.vy -= 1.45 * vn * ny;
        b.vx *= 0.9; b.vy *= 0.9;
        if (-vn > 90) sfx.tone(180 + Math.random() * 60, 0.05, 'square', Math.min(0.06, -vn / 9000));
      }
      return true;
    }

    function stepBall(dt) {
      const b = ball;
      b.life += dt;
      if (b.bound) return;
      b.vy += K.grav * dt; b.vx += wind * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      // ground
      if (b.y > K.ground - b.r) {
        b.y = K.ground - b.r;
        if (b.vy > 0) { if (b.vy > 140) sfx.tone(140, 0.06, 'sine', Math.min(0.1, b.vy / 6000)); b.vy = -b.vy * 0.42; if (Math.abs(b.vy) < 60) b.vy = 0; }
        b.vx *= Math.pow(0.25, dt); // rolling friction
      }
      // walls
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.5; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.5; sfx.tone(160, 0.05, 'square', 0.03); }
      for (const r of blocks) collideRect(b, r);
      if (obstacle) {
        const dx = b.x - obstacle.x, dy = b.y - obstacle.y, d = Math.hypot(dx, dy), R = b.r + obstacle.r;
        if (d < R && d > 0) {
          const nx = dx / d, ny = dy / d; b.x = obstacle.x + nx * R; b.y = obstacle.y + ny * R;
          const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.7 * vn * nx; b.vy -= 1.7 * vn * ny; sfx.tone(300, 0.08, 'sine', 0.06, 140); obstacle.wob = 1; }
        }
      }
      if (b.live && phase === 'flight') {
        for (const tg of targets) {
          if (tg.state === 'wrong' || tg.state === 'hit') continue;
          if (Math.hypot(b.x - tg.x, b.y - tg.y) < K.recR + b.r + 3) { hitTarget(tg); break; }
        }
      }
    }

    /* ---------- update ---------- */
    function update(dt) {
      t += dt;
      for (let i = timers.length - 1; i >= 0; i--) { timers[i].s -= dt; if (timers[i].s <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
      if (phase === 'build') { buildT += dt / (firstRound ? 1.0 : 0.8); if (buildT >= 1) { buildT = 1; phase = 'aim'; firstRound = false; } }
      if (banner) { banner.t += dt; if (banner.t > (banner.long ? 3 : 1.5)) banner = null; }
      // keyboard aim
      if (phase === 'aim' || phase === 'build') {
        let changed = false;
        if (held.has('left')) { angle += 40 * dt; changed = true; }
        if (held.has('right')) { angle -= 40 * dt; changed = true; }
        if (held.has('up')) { power += 0.55 * dt; changed = true; }
        if (held.has('down')) { power -= 0.55 * dt; changed = true; }
        if (changed) { angle = util.clamp(angle, -10, 88); power = util.clamp(power, 0.12, 1); kbActive = true; }
      }
      if (obstacle) { obstacle.a += dt * obstacle.spd; obstacle.y = K.ground - 150 - Math.sin(obstacle.a) * obstacle.amp * 0.9; obstacle.wob = Math.max(0, (obstacle.wob || 0) - dt * 2); }
      if (ball && !ball.done) {
        const n = 4;
        for (let i = 0; i < n && ball && !ball.done; i++) stepBall(dt / n);
        ball.pathT += dt;
        if (ball.pathT > 0.03 && !ball.bound && ball.live) { ball.pathT = 0; curPath.push({ x: ball.x, y: ball.y }); }
        if (!RM && ball.live && !ball.bound && Math.random() < 0.7) parts.push(P(ball.x, ball.y, util.rand(-20, 20), util.rand(-20, 20), Math.random() < 0.5 ? C.spark : C.gold, 0.35, 2));
        const speed = Math.hypot(ball.vx, ball.vy);
        if (speed < 45) ball.rest += dt; else ball.rest = 0; // resting on the membrane or on a block
        if (ball.fadeOut) { ball.fade -= dt * 1.4; if (ball.fade <= 0) shotOver(); }
        else if (ball.bound) { if (ball.life > 0.01) { ball.fade -= dt * 2; if (ball.fade <= 0) ball.done = true; } }
        else if (ball.rest > 0.4 || ball.life > 7) { ball.fadeOut = true; ball.live = false; }
      }
      for (const tg of targets) { tg.st += dt; if (tg.pulse) tg.pulse += dt; }
      for (const d of debris) {
        d.life += dt; d.vy += K.grav * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt;
        if (d.y > K.ground - d.h / 2) { d.y = K.ground - d.h / 2; d.vy *= -0.35; d.vx *= 0.7; d.vr *= 0.6; }
      }
      debris = debris.filter(d => d.life < 2.2);
      for (const p of parts) { p.life -= dt; p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; }
      parts = parts.filter(p => p.life > 0);
      for (const p of pops) p.t += dt;
      pops = pops.filter(p => p.t < p.life);
      shake = Math.max(0, shake - dt * 40); flash = Math.max(0, flash - dt * 2.5);
    }

    /* ---------- draw ---------- */
    const ease = x => 1 - Math.pow(1 - x, 3);
    function draw() {
      g.save();
      g.clearRect(0, 0, W, H);
      if (shake) g.translate(util.rand(-shake, shake) * 0.5, util.rand(-shake, shake) * 0.5);
      // background
      const bg = g.createLinearGradient(0, 0, 0, K.ground);
      bg.addColorStop(0, '#0A1020'); bg.addColorStop(1, '#13203D');
      g.fillStyle = bg; g.fillRect(-20, -20, W + 40, K.ground + 20);
      // vesicles floating in the cleft
      for (const v of vesicles) {
        const vy = v.y + Math.sin(t * 0.6 + v.p) * v.s;
        const vx = v.x + (RM ? 0 : (t * wind * 0.08) % W);
        const x = ((vx % W) + W) % W;
        g.beginPath(); g.arc(x, vy, v.r, 0, 7); g.strokeStyle = 'rgba(124,192,238,.16)'; g.lineWidth = 1.5; g.stroke();
      }
      // membrane (ground)
      g.fillStyle = '#121C33'; g.fillRect(-20, K.ground, W + 40, H - K.ground + 20);
      g.fillStyle = 'rgba(75,156,211,.65)';
      const hr = wide ? 5 : 4.5;
      for (let x = hr; x < W; x += hr * 2.4) { g.beginPath(); g.arc(x, K.ground + hr, hr, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(75,156,211,.25)'; g.lineWidth = 1.5;
      for (let x = hr; x < W; x += hr * 2.4) { g.beginPath(); g.moveTo(x - 1.5, K.ground + hr * 2); g.lineTo(x - 1.5, K.ground + hr * 5); g.moveTo(x + 1.5, K.ground + hr * 2); g.lineTo(x + 1.5, K.ground + hr * 5); g.stroke(); }

      drawWind();
      // structures rise from the membrane during build
      const rise = phase === 'build' ? (1 - ease(Math.min(1, buildT))) * (K.maxH + 80) : 0;
      g.save();
      g.beginPath(); g.rect(-20, -40, W + 40, K.ground + 40); g.clip();
      g.translate(0, rise);
      for (const b of blocks) drawBlock(b.x, b.y, b.w, b.h, b.c);
      for (const tg of targets) drawReceptor(tg);
      g.restore();
      for (const d of debris) {
        g.save(); g.translate(d.x, d.y); g.rotate(d.rot); g.globalAlpha = Math.max(0, Math.min(1, (2.2 - d.life) / 0.6));
        drawBlock(-d.w / 2, -d.h / 2, d.w, d.h, d.c); g.restore();
      }
      if (obstacle) drawObstacle();
      drawGhost();
      drawSling();
      if (banner) drawBanner();
      // labels on top so they stay readable
      if (phase !== 'build' || buildT > 0.55) {
        g.save(); g.globalAlpha = phase === 'build' ? Math.min(1, (buildT - 0.55) / 0.3) : 1;
        for (const tg of targets) drawTag(tg);
        g.restore();
      }
      if (ball && !ball.done) drawBall(ball);
      for (const p of parts) { g.globalAlpha = Math.max(0, p.life / p.max); g.fillStyle = p.c; g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
      g.globalAlpha = 1;
      for (const p of pops) {
        const k = p.t / p.life;
        g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
        const fs = (wide ? 22 : 19) * (k < 0.12 ? 0.6 + k * 3.4 : 1);
        g.font = `400 ${fs}px ${F.display}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        const y = Math.max(16, p.y - k * 30);
        const x = util.clamp(p.x, g.measureText(p.text).width / 2 + 6, W - g.measureText(p.text).width / 2 - 6);
        g.lineWidth = 5; g.strokeStyle = 'rgba(11,18,34,.9)'; g.strokeText(p.text, x, y);
        g.fillStyle = p.c; g.fillText(p.text, x, y);
      }
      g.globalAlpha = 1;
      if (ball && ball.y < -ball.r && !ball.done) { // off-screen indicator
        g.fillStyle = C.spark; g.beginPath(); g.moveTo(ball.x, 4); g.lineTo(ball.x - 7, 16); g.lineTo(ball.x + 7, 16); g.fill();
      }
      if (flash) { g.fillStyle = flashColor; g.globalAlpha = flash * (RM ? 0.08 : 0.18); g.fillRect(-20, -20, W + 40, H + 40); g.globalAlpha = 1; }
      if (roundNo === 1 && phase === 'aim' && !pulling && !kbActive && shotsLeft === SHOTS) drawCoach();
      g.restore();
    }

    function drawBlock(x, y, w, hh, c) {
      const fill = c === 1 ? '#2B5E8C' : c === 2 ? '#1E2C50' : '#24325A';
      g.fillStyle = fill; g.fillRect(x, y, w, hh);
      g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(x, y, w, 3);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + hh - 3, w, 3);
      g.strokeStyle = c === 1 ? C.carolina : '#3A4C7E'; g.lineWidth = 1.5; g.strokeRect(x + 0.75, y + 0.75, w - 1.5, hh - 1.5);
      if (c !== 1 && w > 20) { g.fillStyle = 'rgba(142,160,196,.35)'; g.beginPath(); g.arc(x + w / 2, y + hh / 2, 2, 0, 7); g.fill(); }
    }

    function drawReceptor(tg) {
      let { x, y } = tg; const r = K.recR;
      let col = tg.color, scale = 1, alpha = 1;
      if (tg.state === 'hit') { const k = tg.st / 0.6; scale = 1 + Math.min(1, k) * 0.7; alpha = Math.max(0, 1 - k); col = C.mint; }
      if (tg.state === 'wrong' && tg.st < 0.6 && !RM) x += Math.sin(tg.st * 70) * 4 * (1 - tg.st / 0.6);
      if (tg.state === 'wrong') col = C.spark;
      if (alpha <= 0) return;
      const bob = RM || tg.state !== 'idle' ? 0 : Math.sin(t * 2 + tg.x) * 1.5;
      g.save(); g.globalAlpha = alpha; g.translate(x, y + bob); g.scale(scale, scale);
      // pulse ring for the right answer after a miss
      if (tg.pulse && tg.state !== 'hit') {
        const k = (tg.pulse * 1.4) % 1;
        g.strokeStyle = C.gold; g.lineWidth = 3; g.globalAlpha = RM ? 0.8 : 1 - k;
        g.beginPath(); g.arc(0, 0, r + 6 + (RM ? 4 : k * 26), 0, 7); g.stroke(); g.globalAlpha = alpha;
        col = C.gold;
      }
      g.shadowColor = col; g.shadowBlur = 16;
      // receptor body: a cup with a binding pocket
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(-r, -r * 0.55); g.lineTo(-r * 0.5, -r * 0.55);
      g.arc(0, -r * 0.55, r * 0.5, Math.PI, 0, true);
      g.lineTo(r, -r * 0.55); g.lineTo(r, r * 0.55);
      g.quadraticCurveTo(r, r * 0.95, r * 0.6, r * 0.95); g.lineTo(-r * 0.6, r * 0.95); g.quadraticCurveTo(-r, r * 0.95, -r, r * 0.55);
      g.closePath(); g.fill();
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(11,18,34,.35)'; g.fillRect(-r + 4, r * 0.15, 2 * r - 8, 3);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-r + 3, -r * 0.5, 4, r * 0.8);
      if (tg.state === 'wrong') { // X
        g.strokeStyle = '#0B1222'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, r * 0.6); g.moveTo(6, 0); g.lineTo(-6, r * 0.6); g.stroke();
      }
      g.restore();
    }

    function drawTag(tg) {
      if (tg.state === 'hit' && tg.st > 0.6) return;
      const b = tg.tag, fs = tg.fs;
      const rise = phase === 'build' ? (1 - ease(Math.min(1, buildT))) * (K.maxH + 80) : 0;
      let border = tg.color;
      if (tg.state === 'wrong') border = C.spark;
      if (tg.pulse && tg.state !== 'hit') border = C.gold;
      if (tg.state === 'hit') border = C.mint;
      g.save(); g.translate(0, rise);
      if (tg.state === 'wrong') g.globalAlpha *= 0.6;
      if (tg.state === 'hit') g.globalAlpha *= Math.max(0, 1 - tg.st / 0.35);
      ctx.roundRect(g, b.x, b.y, b.w, b.h, 8);
      g.fillStyle = 'rgba(8,13,26,.9)'; g.fill();
      g.lineWidth = tg.pulse && tg.state !== 'hit' ? 3 : 2; g.strokeStyle = border; g.stroke();
      // pointer notch
      const nx = util.clamp(tg.x, b.x + 10, b.x + b.w - 10);
      g.fillStyle = border; g.beginPath(); g.moveTo(nx - 6, b.y + b.h); g.lineTo(nx + 6, b.y + b.h); g.lineTo(nx, b.y + b.h + 6); g.fill();
      g.fillStyle = tg.state === 'wrong' ? '#FFB3BE' : C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `700 ${fs}px ${F.body}`;
      tg.lines.forEach((l, i) => {
        ctx.fitText(g, l, b.w - 12, fs, F.body, '700');
        g.fillText(l, b.x + b.w / 2, b.y + 5 + fs * 1.12 * (i + 0.5) + 1);
      });
      g.restore();
    }

    function drawObstacle() {
      const o = obstacle, w = o.wob || 0;
      g.save(); g.translate(o.x, o.y);
      g.fillStyle = 'rgba(183,156,246,.18)'; g.beginPath(); g.arc(0, 0, o.r + 8, 0, 7); g.fill();
      g.fillStyle = C.violet; g.beginPath();
      for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, rr = o.r * (1 + 0.08 * Math.sin(a * 5 + t * 3) + w * 0.15 * Math.sin(a * 3 + t * 20)); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.fill();
      g.fillStyle = '#6E54B8'; g.beginPath(); g.arc(-o.r * 0.2, -o.r * 0.1, o.r * 0.38, 0, 7); g.fill();
      g.restore();
    }

    function drawWind() {
      if (!wind) return;
      const x = W / 2, y = 22, len = Math.min(70, Math.abs(wind) * 0.42), dir = Math.sign(wind);
      g.save();
      g.font = `700 ${Math.max(12, 12 / cssScale())}px ${F.mono}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.blue; g.fillText('WIND', x, y);
      g.strokeStyle = C.blue; g.lineWidth = 3; g.lineCap = 'round';
      const sx = x + dir * 30, ex = sx + dir * len;
      g.beginPath(); g.moveTo(sx, y); g.lineTo(ex, y); g.moveTo(ex, y); g.lineTo(ex - dir * 8, y - 6); g.moveTo(ex, y); g.lineTo(ex - dir * 8, y + 6); g.stroke();
      if (!RM) {
        g.globalAlpha = 0.25; g.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) { const yy = 60 + i * (K.ground - 120) / 6, xx = ((t * wind * 1.8 + i * 173) % (W + 80) + W + 80) % (W + 80) - 40; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx - dir * 26, yy); g.stroke(); }
      }
      g.restore();
    }

    function drawSling() {
      const tipL = { x: K.slX - K.tip, y: K.ground - K.fork }, tipR = { x: K.slX + K.tip, y: K.ground - K.fork };
      const showBall = (phase === 'aim' || phase === 'build') && shotsLeft > 0;
      const pull = (pulling || kbActive) && phase === 'aim' ? pullVec() : { x: 0, y: 0 };
      const bp = { x: P0.x + pull.x, y: P0.y + pull.y };
      // waiting ammo on the membrane
      for (let i = 0; i < shotsLeft - (showBall ? 1 : 0); i++) drawOrb(K.slX - 34 - i * (K.ballR * 2.4), K.ground - K.ballR, K.ballR * 0.85, 0.75);
      // back band
      if (showBall) { g.strokeStyle = '#C46A3A'; g.lineWidth = 4; g.beginPath(); g.moveTo(tipL.x, tipL.y); g.lineTo(bp.x - K.ballR * 0.6, bp.y); g.stroke(); }
      // fork: a branching dendrite-like post
      g.strokeStyle = C.carolina; g.lineCap = 'round'; g.lineWidth = wide ? 10 : 8;
      g.beginPath(); g.moveTo(K.slX, K.ground + 2); g.lineTo(K.slX, K.ground - K.fork * 0.45);
      g.quadraticCurveTo(K.slX, K.ground - K.fork * 0.7, tipL.x, tipL.y);
      g.moveTo(K.slX, K.ground - K.fork * 0.45); g.quadraticCurveTo(K.slX, K.ground - K.fork * 0.7, tipR.x, tipR.y); g.stroke();
      g.strokeStyle = C.blue; g.lineWidth = 3;
      g.beginPath(); g.moveTo(K.slX - 2, K.ground); g.lineTo(K.slX - 2, K.ground - K.fork * 0.45); g.stroke();
      if (showBall) {
        // aim preview
        if ((pulling || kbActive) && phase === 'aim') drawPreview(bp);
        drawOrb(bp.x, bp.y, K.ballR, 1);
        g.strokeStyle = C.orange; g.lineWidth = 4; g.beginPath(); g.moveTo(tipR.x, tipR.y); g.lineTo(bp.x + K.ballR * 0.4, bp.y); g.stroke();
        // power meter
        if ((pulling || kbActive) && phase === 'aim') {
          const mx = wide ? K.slX - K.fork * 0.75 : K.slX + K.tip + 18, my = K.ground - 8, mh = K.fork * (wide ? 0.9 : 0.6);
          g.fillStyle = 'rgba(8,13,26,.8)'; g.fillRect(mx - 5, my - mh, 10, mh);
          const pc = power > 0.8 ? C.spark : power > 0.5 ? C.gold : C.mint;
          g.fillStyle = pc; g.fillRect(mx - 3, my - mh * power, 6, mh * power);
          g.font = `700 ${Math.max(11, 12 / cssScale())}px ${F.mono}`; g.textAlign = 'center'; g.fillStyle = C.dim; g.textBaseline = 'alphabetic';
          g.fillText(`${Math.round(angle)}°`, mx, my - mh - 6);
        }
      } else {
        g.strokeStyle = '#C46A3A'; g.lineWidth = 3; g.beginPath(); g.moveTo(tipL.x, tipL.y); g.lineTo(P0.x, P0.y + 4); g.lineTo(tipR.x, tipR.y); g.stroke();
      }
    }

    function drawPreview(bp) {
      const sp = power * K.vmax, a = angle * Math.PI / 180;
      let x = bp.x, y = bp.y, vx = Math.cos(a) * sp, vy = -Math.sin(a) * sp;
      const step = 1 / 120; let acc = 0, n = 0;
      for (let tt = 0; tt < K.prevT; tt += step) {
        vy += K.grav * step; vx += wind * step; x += vx * step; y += vy * step; acc += step;
        if (y > K.ground) break;
        if (acc >= 0.035) {
          acc = 0; n++;
          const k = tt / K.prevT;
          g.globalAlpha = 0.95 - k * 0.75; g.fillStyle = C.ink;
          g.beginPath(); g.arc(x, y, (wide ? 4 : 3.4) * (1 - k * 0.5), 0, 7); g.fill();
        }
      }
      g.globalAlpha = 1;
    }

    function drawGhost() {
      if (!ghostPath.length || phase === 'build') return;
      g.fillStyle = 'rgba(255,107,129,.35)';
      for (let i = 0; i < ghostPath.length; i += 2) { const p = ghostPath[i]; g.beginPath(); g.arc(p.x, p.y, 2, 0, 7); g.fill(); }
    }

    function drawOrb(x, y, r, a) {
      g.save(); g.globalAlpha *= a;
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.2);
      gr.addColorStop(0, 'rgba(255,107,129,.55)'); gr.addColorStop(1, 'rgba(255,107,129,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.2, 0, 7); g.fill();
      g.fillStyle = C.spark; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.fillStyle = '#FFE1E6'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.38, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,209,102,.9)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, r * 1.45, r * 0.55, t * 2, 0, 7); g.stroke();
      g.restore();
    }

    function drawBall(b) {
      g.save(); g.globalAlpha = Math.max(0, b.fade);
      drawOrb(b.x, b.y, b.r, 1);
      g.restore();
    }

    function drawBanner() {
      const b = banner, dur = b.long ? 3 : 1.5, k = b.t / dur;
      const a = k < 0.15 ? k / 0.15 : k > 0.75 ? (1 - k) / 0.25 : 1;
      g.save(); g.globalAlpha = Math.max(0, a);
      const y = K.ground * 0.36;
      g.fillStyle = 'rgba(8,13,26,.72)'; g.fillRect(0, y - (wide ? 44 : 40), W, wide ? 88 : 80);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      ctx.fitText(g, b.text, W - 40, wide ? 40 : 30, F.display, '400');
      g.fillStyle = b.c; g.fillText(b.text, W / 2, y - 10);
      g.font = `700 ${Math.max(wide ? 17 : 15, 14 / cssScale())}px ${F.body}`; g.fillStyle = C.ink;
      g.fillText(b.sub, W / 2, y + (wide ? 24 : 22));
      g.restore();
    }

    function drawCoach() {
      // first-prompt coach mark: a hand-drawn drag arrow from the ball
      const k = (t % 1.6) / 1.6, d = ease(Math.min(1, k * 1.4)) * (wide ? 70 : 52);
      g.save(); g.globalAlpha = 0.9 * (1 - Math.max(0, k - 0.75) / 0.25);
      g.strokeStyle = C.gold; g.lineWidth = 3; g.setLineDash([6, 6]);
      g.beginPath(); g.moveTo(P0.x, P0.y); g.lineTo(P0.x - d, P0.y + d * 0.55); g.stroke(); g.setLineDash([]);
      g.fillStyle = C.gold; g.beginPath(); g.arc(P0.x - d, P0.y + d * 0.55, 7, 0, 7); g.fill();
      g.globalAlpha = 1;
      const fs = Math.max(15, 14 / cssScale()), txt = 'Drag back to aim';
      g.font = `700 ${fs}px ${F.body}`; g.textAlign = 'left'; g.textBaseline = 'middle';
      const tw = g.measureText(txt).width, tx = Math.max(8, P0.x - tw * 0.35), ty = P0.y - K.fork * 0.55 - fs * 1.6;
      ctx.roundRect(g, tx - 8, ty - fs * 0.8, tw + 16, fs * 1.6, 8); g.fillStyle = 'rgba(8,13,26,.85)'; g.fill();
      g.strokeStyle = C.gold; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = C.gold;
      g.fillText(txt, tx, ty);
      g.restore();
    }

    /* ---------- input ---------- */
    function onDown(e) {
      if (!ctx.isActive() || phase !== 'aim') return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      const p = st.toLogical(e);
      pulling = { id: e.pointerId, sx: p.x, sy: p.y, a0: angle, p0: power, moved: false };
      kbActive = false;
      sfx.tone(520, 0.04, 'square', 0.03);
    }
    function onMove(e) {
      if (!pulling || e.pointerId !== pulling.id) return;
      const p = st.toLogical(e);
      const dx = p.x - pulling.sx, dy = p.y - pulling.sy, d = Math.hypot(dx, dy);
      if (d < 6) return;
      pulling.moved = true;
      // launch direction is opposite the drag
      let a = Math.atan2(dy, -dx) * 180 / Math.PI; // up-right positive
      a = util.clamp(a, -10, 88);
      const pw = util.clamp(d / K.maxPull, 0.12, 1);
      if (Math.abs(pw - power) > 0.05) sfx.tone(300 + pw * 500, 0.02, 'sine', 0.02);
      angle = a; power = pw;
    }
    function onUp(e) {
      if (!pulling || e.pointerId !== pulling.id) return;
      const wasMoved = pulling.moved;
      const p = st.toLogical(e);
      const d = Math.hypot(p.x - pulling.sx, p.y - pulling.sy);
      pulling = null;
      if (wasMoved && d >= 14 && phase === 'aim') launch();
    }
    function onCancel() { pulling = null; }
    const keyMap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
    function onKey(e) {
      if (!ctx.isActive() || finished) return;
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      const outsideBtn = (tag === 'BUTTON' || tag === 'A') && !root.contains(e.target);
      const k = keyMap[e.key];
      if (k) { e.preventDefault(); held.add(k); if (phase === 'aim') kbActive = true; return; }
      if (e.key === ' ' || e.key === 'Enter') {
        if (outsideBtn) return;
        e.preventDefault();
        if (!e.repeat && phase === 'aim') { kbActive = true; launch(); }
      }
    }
    function onKeyUp(e) { const k = keyMap[e.key]; if (k) held.delete(k); }
    function onBlur() { held.clear(); pulling = null; }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // test hooks (read-only snapshot + aim helper) for automated checks
    root._ss = {
      state: () => ({ phase, roundNo, shotsLeft, score, correct, firsts, angle, power, wind, ball: ball && { x: ball.x, y: ball.y, done: ball.done }, targets: targets.map(o => ({ x: o.x, y: o.y, s: o.term.s, correct: o.correct, state: o.state, tag: o.tag })), K, W, H, P0 }),
      aim: (a, p) => { angle = a; power = p; kbActive = true; },
      fire: () => launch(),
      solveFor: (tx, ty) => { // brute-force an aim that reaches (tx,ty); used by automated tests only
        let best = null; const a0 = angle, p0 = power, dt = 1 / 240;
        for (let a = -10; a <= 88 && !best; a += 1) for (let pw = 0.12; pw <= 1.0001; pw += 0.01) {
          angle = a; power = pw; const pull = pullVec();
          let x = P0.x + pull.x, y = P0.y + pull.y, vx = Math.cos(a * Math.PI / 180) * pw * K.vmax, vy = -Math.sin(a * Math.PI / 180) * pw * K.vmax, hit = false, bad = false, oa = obstacle ? obstacle.a : 0;
          for (let s = 0; s < 4 / dt && !hit && !bad; s++) {
            vy += K.grav * dt; vx += wind * dt; x += vx * dt; y += vy * dt;
            if (y > K.ground || x < 0 || x > W) { bad = true; break; }
            if (blocks.some(r => x > r.x - K.ballR && x < r.x + r.w + K.ballR && y > r.y - K.ballR && y < r.y + r.h + K.ballR)) { bad = true; break; }
            if (obstacle) { oa += dt * obstacle.spd; const oy = K.ground - 150 - Math.sin(oa) * obstacle.amp * 0.9; if (Math.hypot(x - obstacle.x, y - oy) < obstacle.r + K.ballR + 2) { bad = true; break; } }
            for (const o of targets) if (Math.hypot(x - o.x, y - o.y) < K.recR + K.ballR + 3) { if (Math.hypot(o.x - tx, o.y - ty) < 1) hit = true; else bad = true; break; }
          }
          if (hit) { best = { a, p: pw }; break; }
        }
        angle = a0; power = p0;
        return best;
      }
    };

    newPrompt();
    const lp = ctx.loop((dt) => { update(dt); draw(); });

    return () => {
      lp.stop();
      st.destroy();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      timers.length = 0; held.clear();
      delete root._ss;
    };
  }
});
})();
