/* circadian-clock: a 24-hour dial. Drag the time handle to see daylight, melatonin, alertness, and body temperature.
   Scenarios: all-nighter, flying east 6 time zones (jet lag), blue screen light at midnight. */
(function () {
'use strict';
const TAU = Math.PI * 2;
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const mod24 = h => ((h % 24) + 24) % 24;
const gauss = (h, c, w) => { let d = Math.abs(mod24(h) - c); d = Math.min(d, 24 - d); return Math.exp(-(d * d) / (2 * w * w)); };
/* normal-schedule curves, h = body-clock hour (0-24) */
function melNorm(h) { const x = mod24(h - 21); return x <= 6 ? smooth(x / 6) : x <= 11 ? 1 - smooth((x - 6) / 5) : 0; }
function tempNorm(h) { return 0.5 - 0.5 * Math.cos(TAU * (h - 5) / 24); } // min ~5 AM, max ~5 PM
function alertNorm(h) { const v = 0.52 - 0.4 * Math.cos(TAU * (h - 4.5) / 24) + 0.12 * gauss(h, 10.5, 1.6) - 0.14 * gauss(h, 14.5, 1.1) + 0.05 * gauss(h, 19, 1.5); return Math.max(0.04, Math.min(1, v)); }
const SUNRISE = 6.5, SUNSET = 19.5;
const isDay = h => h >= SUNRISE && h < SUNSET;
const fmt = h => { h = mod24(h); let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { M = 0; H = (H + 1) % 24; } const ap = H < 12 ? 'AM' : 'PM'; const h12 = H % 12 === 0 ? 12 : H % 12; return `${h12}:${String(M).padStart(2, '0')} ${ap}`; };

ML.w2.css('circadian-clock-css', `
.cir-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: center; }
@media (max-width: 640px) { .cir-grid { grid-template-columns: 1fr; } }
.cir-dial { width: 100%; max-width: 330px; height: auto; display: block; margin: 0 auto; touch-action: none; user-select: none; }
.cir-knob { cursor: grab; outline: none; }
.cir-knob:focus-visible circle.k { stroke: var(--carolina); stroke-width: 5; }
.cir-tick { stroke: var(--muted); stroke-width: 1.5; }
.cir-hl { fill: var(--muted); font: 700 12px var(--f-mono); }
.cir-time { fill: var(--ink); font: 700 24px var(--f-mono); }
.cir-sub { fill: var(--muted); font: 700 12px var(--f-mono); letter-spacing: .06em; }
.cir-hand { stroke: var(--carolina); stroke-width: 4; stroke-linecap: round; }
.cir-hand2 { stroke: var(--spark); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 6; }
.cir-read { display: grid; gap: 9px; }
.cir-row { display: grid; grid-template-columns: 112px 1fr 64px; gap: 8px; align-items: center; font-size: 14.5px; font-weight: 700; }
.cir-row .w2-meter { height: 12px; }
.cir-row .readout { font-size: 13px; text-align: right; }
.cir-chart { width: 100%; max-width: 620px; margin: 0 auto; height: auto; display: block; }
.cir-ax { fill: var(--muted); font: 700 13px var(--f-mono); }
.cir-leg { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13.5px; font-weight: 700; }
.cir-leg span { display: inline-flex; align-items: center; gap: 6px; }
.cir-leg i { width: 16px; height: 4px; border-radius: 2px; display: inline-block; }
.cir-scn { font-size: 15px; }
.cir-days { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; font-weight: 700; font-size: 14px; }
`);
const COL = { mel: '#9B7BEA', alert: '#4B9CD3', temp: '#F2913A' };

ML.registerWidget('circadian-clock', {
  title: 'Your 24-hour body clock', tag: 'Simulation',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    let time = 22, scen = 'normal', days = 0;
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Drag the handle around the clock (or use the arrow keys). Then try a scenario.');
    const scenSeg = W2.seg([['normal', 'Normal day'], ['allnight', 'All-nighter'], ['east', 'Fly east 6 zones'], ['blue', 'Screens at midnight']], 'normal', v => setScen(v), 'Scenario');
    const dial = S('svg', { class: 'cir-dial', viewBox: '0 0 300 300' });
    const play = h('button', { type: 'button', class: 'btn btn-sm' }, 'Play the day');
    const reads = h('div', { class: 'cir-read' });
    const scn = h('div', { class: 'w2-fb cir-scn', 'aria-live': 'polite' });
    const daysIn = h('input', { type: 'range', min: '0', max: '6', step: '1', value: '0', 'aria-label': 'Days after landing' });
    const daysOut = h('span', { class: 'readout' }, 'Day 0');
    const daysRow = h('div', { class: 'cir-days', hidden: true }, h('span', null, 'Days after landing'), daysIn, daysOut);
    daysIn.addEventListener('input', () => { days = +daysIn.value; daysOut.textContent = `Day ${days}`; render(); });
    const chart = S('svg', { class: 'cir-chart', viewBox: '0 0 420 214', role: 'img', 'aria-label': 'Graph of melatonin, alertness, and body temperature over 24 hours' });
    const leg = h('div', { class: 'cir-leg', 'aria-hidden': 'true' }, h('span', null, h('i', { style: { background: COL.mel } }), 'Melatonin'), h('span', null, h('i', { style: { background: COL.alert } }), 'Alertness'), h('span', null, h('i', { style: { background: COL.temp } }), 'Body temperature'));
    const note = h('div', { class: 'w2-fb' });
    root.append(inst, scenSeg, h('div', { class: 'cir-grid' }, h('div', null, dial, h('div', { class: 'w2-row', style: { justifyContent: 'center', marginTop: '6px' } }, play)), h('div', { class: 'stack', style: { gap: '10px' } }, reads, scn)), daysRow, h('div', { class: 'w2-panel' }, h('div', { class: 'w2-tag' }, 'Your 24 hours'), chart, leg), note);
    el.append(root);

    /* ----- model with scenarios. hLocal = clock time where you are ----- */
    const offset = () => scen === 'east' ? -(6 - days) : 0; // body hour = local + offset
    function model(hLocal) {
      const hb = mod24(hLocal + offset());
      let mel = melNorm(hb), alert = alertNorm(hb), temp = tempNorm(hb);
      if (scen === 'blue') {
        const screen = hLocal >= 23.5 || hLocal < 1; // screen light
        mel = melNorm(hb - 1.5) * (screen ? 0.3 : 1);
        if (hLocal >= 22.5 || hLocal < 2.5) alert = Math.min(1, alert + 0.22 * gauss(hLocal, 0.3, 1));
        if (hLocal >= 6 && hLocal < 10) alert = Math.max(0.04, alert - 0.15 * gauss(hLocal, 7, 1.3));
      }
      if (scen === 'allnight') {
        const awakeNight = hLocal >= 23 || hLocal < 7;
        if (awakeNight) mel *= 0.6; // room lights partly suppress melatonin
        const debt = hLocal >= 23 ? 0.12 : hLocal < 12 ? 0.12 + 0.18 * Math.min(1, hLocal / 5) : hLocal < 20 ? 0.25 : 0.12;
        alert = Math.max(0.03, alert - debt);
      }
      return { mel, alert, temp, hb };
    }

    /* ----- dial ----- */
    const cx = 150, cy = 150, R = 118;
    const ang = hh => ((hh - 12) / 24) * TAU; // 12 PM at top, clockwise
    const pt = (hh, r) => [cx + r * Math.sin(ang(hh)), cy - r * Math.cos(ang(hh))];
    const arc = (h1, h2, r) => { const [x1, y1] = pt(h1, r), [x2, y2] = pt(h2, r); const span = mod24(h2 - h1); return `M${x1},${y1} A${r},${r} 0 ${span > 12 ? 1 : 0} 1 ${x2},${y2}`; };
    S('circle', { cx, cy, r: R + 16, style: 'fill:var(--surface-2);stroke:var(--line);stroke-width:1.5' }, dial);
    S('path', { d: arc(SUNRISE, SUNSET, R), style: 'fill:none;stroke:#FFD978;stroke-width:24' }, dial);
    S('path', { d: arc(SUNSET, SUNRISE, R), style: 'fill:none;stroke:#1B2A47;stroke-width:24' }, dial);
    const melBand = S('path', { style: `fill:${COL.mel};opacity:.55` }, dial);
    for (let k = 0; k < 24; k++) { const [x1, y1] = pt(k, R - 12), [x2, y2] = pt(k, R - (k % 6 ? 6 : 1)); S('line', { x1, y1, x2, y2, class: 'cir-tick', style: k % 6 ? 'opacity:.5' : '' }, dial); }
    [[12, '12 PM'], [18, '6 PM'], [0, '12 AM'], [6, '6 AM']].forEach(([hh, t]) => { const [x, y] = pt(hh, R - 30); const e = S('text', { x, y: y + 4, 'text-anchor': 'middle', class: 'cir-hl' }, dial); e.textContent = t; });
    // sun / moon icons on the ring
    const [sx, sy] = pt(13, R); const sun = S('g', null, dial); S('circle', { cx: sx, cy: sy, r: 7, style: 'fill:#F2A33A' }, sun);
    const [mx, my] = pt(1, R); S('path', { d: `M${mx + 3},${my - 7} A7,7 0 1 0 ${mx + 3},${my + 7} A5.5,5.5 0 1 1 ${mx + 3},${my - 7} Z`, style: 'fill:#E8F0FF' }, dial);
    const hand2 = S('line', { class: 'cir-hand2', x1: cx, y1: cy }, dial);
    const hand = S('line', { class: 'cir-hand', x1: cx, y1: cy }, dial);
    S('circle', { cx, cy, r: 5, style: 'fill:var(--carolina)' }, dial);
    const tTime = S('text', { x: cx, y: cy + 34, 'text-anchor': 'middle', class: 'cir-time' }, dial);
    const tSub = S('text', { x: cx, y: cy + 52, 'text-anchor': 'middle', class: 'cir-sub' }, dial);
    const tSub2 = S('text', { x: cx, y: cy - 30, 'text-anchor': 'middle', class: 'cir-sub', style: 'fill:var(--spark)' }, dial);
    const knob = S('g', { class: 'cir-knob', tabindex: '0', role: 'slider', 'aria-label': 'Time of day', 'aria-valuemin': '0', 'aria-valuemax': '24' }, dial);
    S('circle', { class: 'k', r: 14, style: 'fill:var(--surface);stroke:var(--carolina);stroke-width:4' }, knob);
    S('circle', { r: 4, style: 'fill:var(--carolina)' }, knob);
    function drawMelBand() {
      let d = '', back = '';
      const r0 = R - 13;
      for (let k = 0; k <= 240; k++) {
        const hh = k / 10, m = model(hh).mel, r1 = r0 - m * 34;
        const [x, y] = pt(hh, r1); d += (k ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
        const [xb, yb] = pt(24 - k / 10, r0); back += 'L' + xb.toFixed(1) + ',' + yb.toFixed(1);
      }
      melBand.setAttribute('d', d + back + 'Z');
    }
    function drawHands() {
      const [x, y] = pt(time, R); hand.setAttribute('x2', x); hand.setAttribute('y2', y);
      knob.setAttribute('transform', `translate(${x},${y})`);
      knob.setAttribute('aria-valuenow', time.toFixed(2)); knob.setAttribute('aria-valuetext', fmt(time) + (scen === 'east' ? ' local time' : ''));
      if (scen === 'east') { const hb = mod24(time + offset()); const [x2, y2] = pt(hb, R - 40); hand2.setAttribute('x2', x2); hand2.setAttribute('y2', y2); hand2.style.display = ''; tSub2.textContent = `BODY: ${fmt(hb)}`; }
      else { hand2.style.display = 'none'; tSub2.textContent = ''; }
      tTime.textContent = fmt(time);
      tSub.textContent = scen === 'east' ? 'LOCAL TIME' : isDay(time) ? 'DAYLIGHT' : 'DARK';
    }
    // drag
    let dragging = false;
    function fromEvt(e) {
      const r = dial.getBoundingClientRect();
      const x = (e.clientX - r.left) * 300 / r.width - cx, y = (e.clientY - r.top) * 300 / r.height - cy;
      let a = Math.atan2(x, -y); if (a < 0) a += TAU;
      time = mod24(12 + a / TAU * 24); time = Math.round(time * 4) / 4; render();
    }
    dial.addEventListener('pointerdown', e => { dragging = true; dial.setPointerCapture(e.pointerId); stopPlay(); fromEvt(e); knob.focus({ preventScroll: true }); });
    dial.addEventListener('pointermove', e => { if (dragging) fromEvt(e); });
    const endDrag = () => { dragging = false; };
    dial.addEventListener('pointerup', endDrag); dial.addEventListener('pointercancel', endDrag);
    knob.addEventListener('keydown', e => {
      const step = { ArrowRight: .25, ArrowUp: .25, ArrowLeft: -.25, ArrowDown: -.25, PageUp: 1, PageDown: -1 }[e.key];
      if (step) { e.preventDefault(); stopPlay(); time = mod24(time + step); render(); }
    });
    // play
    let playing = false, loop = null;
    function stopPlay() { playing = false; play.textContent = 'Play the day'; if (loop) { loop.stop(); loop = null; } }
    play.addEventListener('click', () => {
      if (playing) { stopPlay(); return; }
      playing = true; play.textContent = 'Pause';
      loop = W2.loop(dial, dt => { time = mod24(time + dt * (api.reduceMotion ? 1 : 1.2)); render(); });
    });

    /* ----- readouts ----- */
    const mk = (label, col) => { const bar = h('i', { style: { background: col } }), val = h('span', { class: 'readout' }); reads.append(h('div', { class: 'cir-row' }, h('span', null, label), h('div', { class: 'w2-meter' }, bar), val)); return { bar, val }; };
    const rMel = mk('Melatonin', COL.mel), rAl = mk('Alertness', COL.alert), rTe = mk('Body temp', COL.temp);
    const lvl = v => v > .75 ? 'High' : v > .45 ? 'Medium' : v > .15 ? 'Low' : 'None';

    /* ----- chart ----- */
    const X0 = 22, X1 = 404, Y0 = 18, Y1 = 170;
    const cxh = hh => X0 + (mod24(hh - 12) / 24) * (X1 - X0); // chart starts at noon
    const gNight = S('g', null, chart), gCurves = S('g', null, chart), gNow = S('g', null, chart);
    function drawChart() {
      gNight.innerHTML = ''; gCurves.innerHTML = '';
      S('rect', { x: cxh(SUNSET), y: Y0, width: cxh(SUNRISE) - cxh(SUNSET), height: Y1 - Y0, style: 'fill:#1B2A47;opacity:.16' }, gNight);
      const sleepA = scen === 'allnight' ? null : scen === 'blue' ? [1, 7] : [23, 7];
      if (sleepA) { const r = S('rect', { x: cxh(sleepA[0]), y: Y1 - 10, width: cxh(sleepA[1]) - cxh(sleepA[0]), height: 10, rx: 5, style: 'fill:var(--good);opacity:.7' }, gNight); r.setAttribute('aria-hidden', 'true'); const t = S('text', { x: cxh(sleepA[0]) + 6, y: Y1 - 13, class: 'cir-ax', style: 'fill:var(--good)' }, gNight); t.textContent = 'asleep'; }
      [12, 18, 0, 6].forEach(hh => { const t = S('text', { x: cxh(hh) + (hh === 12 ? 18 : 0), y: 192, 'text-anchor': 'middle', class: 'cir-ax' }, gNight); t.textContent = fmt(hh).replace(':00', ''); S('line', { x1: cxh(hh), y1: Y0, x2: cxh(hh), y2: Y1, style: 'stroke:var(--line);stroke-width:1' }, gNight); });
      const t2 = S('text', { x: X1, y: 192, 'text-anchor': 'end', class: 'cir-ax' }, gNight); t2.textContent = '12 PM';
      if (scen === 'east') { const t = S('text', { x: (X0 + X1) / 2, y: 212, 'text-anchor': 'middle', class: 'cir-ax', style: 'font-size:11px' }, gNight); t.textContent = 'LOCAL TIME (where you landed)'; }
      [['mel', COL.mel], ['alert', COL.alert], ['temp', COL.temp]].forEach(([k, c]) => {
        let d = ''; for (let i = 0; i <= 240; i++) { const hh = mod24(12 + i / 10); const v = model(hh)[k]; d += (i ? 'L' : 'M') + (X0 + i / 240 * (X1 - X0)).toFixed(1) + ',' + (Y1 - 12 - v * (Y1 - Y0 - 22)).toFixed(1); }
        S('path', { d, style: `fill:none;stroke:${c};stroke-width:3;stroke-linejoin:round` }, gCurves);
      });
    }
    function drawNow() { gNow.innerHTML = ''; const x = cxh(time); S('line', { x1: x, y1: Y0 - 6, x2: x, y2: Y1 + 4, style: 'stroke:var(--ink);stroke-width:2' }, gNow); S('circle', { cx: x, cy: Y0 - 6, r: 5, style: 'fill:var(--ink)' }, gNow); }

    function scnText() {
      const m = model(time), day = isDay(time);
      const light = day ? 'Light hits your eyes, so the SCN (suprachiasmatic nucleus, in the hypothalamus) keeps melatonin switched off.'
        : m.mel > .3 ? 'It is dark, so the SCN signals the pineal gland to release melatonin: time to get sleepy.'
          : 'It is dark, and the SCN is starting to cue melatonin.';
      let extra = '';
      if (scen === 'allnight') extra = time >= 2 && time < 7 ? ' This is the circadian low: alertness hits bottom between about 3 and 6 AM, and staying awake is hardest now.' : time >= 7 && time < 13 ? ' Morning “second wind”: your clock nudges alertness up, but sleep debt keeps you foggy.' : '';
      if (scen === 'east') { const hb = m.hb; extra = ` Your body thinks it is ${fmt(hb)}.` + (time >= 21 || time < 2 ? ' Bedtime here, but your melatonin is not out yet, so you lie awake.' : time >= 6 && time < 11 ? ' Morning here, but melatonin is still high, so you feel groggy.' : ''); }
      if (scen === 'blue') extra = (time >= 23.5 || time < 1) ? ' Screen glow! Blue light tells the SCN it is still daytime, so melatonin is held back.' : (time >= 1 && time < 4) ? ' Melatonin finally rises, about 1.5 hours late.' : '';
      return light + extra;
    }
    function render() {
      const m = model(time);
      rMel.bar.style.width = Math.round(m.mel * 100) + '%'; rMel.val.textContent = lvl(m.mel);
      rAl.bar.style.width = Math.round(m.alert * 100) + '%'; rAl.val.textContent = lvl(m.alert);
      rTe.bar.style.width = Math.round(20 + m.temp * 80) + '%'; rTe.val.textContent = (97.6 + m.temp * 1.3).toFixed(1) + '°F';
      scn.textContent = scnText();
      drawHands(); drawNow();
    }
    const NOTES = {
      normal: 'Your circadian rhythm is a roughly 24-hour cycle. The SCN uses light to keep it in sync: melatonin rises after dark, body temperature bottoms out before dawn, and alertness dips in the early afternoon.',
      allnight: 'All-nighter: you skip sleep, but your clock keeps ticking. Alertness crashes in the small hours, memory consolidation is lost, and the next night your brain makes up for it with extra deep sleep and REM rebound.',
      east: 'Jet lag: your body clock (dashed hand) is still on home time, 6 hours behind local time. Drag the days slider: the SCN shifts about an hour per day using daylight. Flying EAST is usually worse, because you must fall asleep earlier than your body wants. Your natural rhythm runs a little longer than 24 hours, so staying up later (flying west) is easier.',
      blue: 'Screens at midnight: blue-rich light reaches special cells in the retina that signal the SCN “it’s still day.” Melatonin is suppressed and delayed, so you fall asleep later and wake up groggy.'
    };
    function setScen(v) {
      scen = v; stopPlay(); api.sfx.tap();
      daysRow.hidden = v !== 'east';
      if (v === 'east') { days = 0; daysIn.value = 0; daysOut.textContent = 'Day 0'; time = 23; }
      if (v === 'allnight') time = 4;
      if (v === 'blue') time = 0;
      note.className = 'w2-fb' + (v === 'normal' ? '' : ' warn'); note.textContent = NOTES[v];
      drawMelBand(); drawChart(); render();
    }
    daysIn.addEventListener('input', () => { drawMelBand(); drawChart(); });
    setScen('normal'); time = 22; render();
    return () => { stopPlay(); bag.destroy(); };
  }
});
})();
