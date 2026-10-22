/* homunculus: morph a body between real proportions and "cortex proportions" (sensory or motor homunculus).
   Tap a body part (or strip segment) to see how much cortex it gets and why. */
(function () {
'use strict';
const PARTS = {
  hand: { name: 'Hands and fingers', col: '#F28C6B', sens: 3.0, mot: 3.2, shareS: 100, shareM: 100,
    whyS: 'Fingertips have some of the densest touch receptors in your body. You can tell two pencil points apart only about 2 to 3 mm apart on a fingertip.',
    whyM: 'Typing, writing, and playing guitar need precise control of many small finger muscles, so lots of motor cortex runs the hands.' },
  lips: { name: 'Lips', col: '#E5485F', sens: 3.4, mot: 2.6, shareS: 92, shareM: 70,
    whyS: 'Lips are packed with receptors. Babies explore new objects by putting them in their mouths for this reason.',
    whyM: 'Talking takes fast, precise lip movements.' },
  tongue: { name: 'Tongue and throat', col: '#F59AB6', sens: 3.1, mot: 3.0, shareS: 80, shareM: 76,
    whyS: 'Your tongue can feel a single hair or a tiny seed in your food.',
    whyM: 'Speech, chewing, and swallowing need exact tongue control.' },
  face: { name: 'Face and eyes', col: '#F2C94C', sens: 1.7, mot: 1.6, shareS: 60, shareM: 58,
    whyS: 'Your face is very sensitive, especially around the eyes and nose.',
    whyM: 'Dozens of small face muscles make expressions; the jaw handles chewing.' },
  foot: { name: 'Feet and toes', col: '#B79CF6', sens: 1.6, mot: 1.5, shareS: 38, shareM: 40,
    whyS: 'The soles of your feet sense pressure and texture, which helps balance.',
    whyM: 'Toes and ankles make fine adjustments when you walk, run, and balance.' },
  arm: { name: 'Arms', col: '#5C9EE0', sens: 0.8, mot: 0.9, shareS: 22, shareM: 28,
    whyS: 'Arms have fewer receptors per square inch than hands.',
    whyM: 'Arm movements are big and less precise than finger movements.' },
  leg: { name: 'Legs', col: '#3FB8A5', sens: 0.65, mot: 0.75, shareS: 14, shareM: 18,
    whyS: 'Big area of skin, but receptors are spread out.',
    whyM: 'Leg muscles are strong, but their movements are not very fine-tuned.' },
  trunk: { name: 'Trunk (chest and back)', col: '#6CC08B', sens: 0.6, mot: 0.65, shareS: 12, shareM: 14,
    whyS: 'Your back has few receptors: two points about 4 cm apart can feel like one.',
    whyM: 'The trunk mostly holds you upright and needs little fine control.' }
};
const STRIP_ORDER = ['foot', 'leg', 'trunk', 'arm', 'hand', 'face', 'lips', 'tongue']; // medial (top) to lateral (bottom)
ML.w2.css('homunculus-css', `
.hom-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; align-items: center; }
@media (max-width: 600px) { .hom-grid { grid-template-columns: 1fr; } }
.hom-fig, .hom-strip { width: 100%; height: auto; display: block; touch-action: manipulation; }
.hom-fig { max-width: 340px; margin: 0 auto; }
.hom-strip { max-width: 300px; margin: 0 auto; }
@media (max-width: 600px) { .hom-strip { max-width: 230px; } .hom-fig { max-width: 300px; } }
.hom-p { stroke: #3a2a20; stroke-width: 1.5; cursor: pointer; transition: opacity .2s; outline: none; }
.hom-on .hom-p:not(.on) { opacity: .45; }
.hom-p.on { stroke: var(--ink); stroke-width: 3; }
.hom-p:focus-visible { stroke: var(--carolina); stroke-width: 3.5; }
.hom-seg { stroke: var(--surface); stroke-width: 1.5; cursor: pointer; transition: opacity .2s; outline: none; }
.hom-on .hom-seg:not(.on) { opacity: .4; }
.hom-seg.on { stroke: var(--ink); stroke-width: 2.5; }
.hom-seg:focus-visible { stroke: var(--carolina); stroke-width: 3; }
.hom-brain { fill: var(--surface-2); stroke: var(--muted); stroke-width: 1.5; }
.hom-lab { fill: var(--ink); font: 700 13px var(--f-body); pointer-events: none; }
.hom-cap { fill: var(--muted); font: 700 11px var(--f-mono); letter-spacing: .06em; pointer-events: none; }
.hom-eye { fill: #fff; stroke: #3a2a20; stroke-width: 1; pointer-events: none; }
.hom-pupil { fill: #12233B; pointer-events: none; }
.hom-slider { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; font-size: 14px; font-weight: 700; color: var(--muted); }
.hom-bar { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
.hom-bar .w2-meter { height: 14px; }
`);

ML.registerWidget('homunculus', {
  title: 'The homunculus: your body, as your cortex sees it', tag: 'Explore',
  mount(el, api) {
    const { h } = api; const W2 = ML.w2; const S = W2.S; const bag = W2.bag();
    let t = 1, map = 'sens', sel = null;
    const root = h('div', { class: 'w2' });
    const inst = h('p', { class: 'w2-inst' }, 'Drag the slider to morph between real proportions and cortex proportions. Tap a body part to see why it gets so much (or so little) cortex.');
    const mapSeg = W2.seg([['sens', 'Sensory (touch)'], ['mot', 'Motor (movement)']], 'sens', v => { map = v; draw(); drawStrip(); if (sel) info(sel); api.sfx.tap(); }, 'Which homunculus');
    const fig = S('svg', { class: 'hom-fig', viewBox: '0 0 320 360', role: 'group', 'aria-label': 'Body figure' });
    const strip = S('svg', { class: 'hom-strip', viewBox: '20 18 230 290', role: 'group', 'aria-label': 'Cortex strip map' });
    const slider = h('input', { type: 'range', min: '0', max: '100', value: '100', 'aria-label': 'Real proportions to cortex proportions' });
    const play = h('button', { type: 'button', class: 'btn btn-sm' }, 'Morph');
    const panel = h('div', { class: 'w2-panel', 'aria-live': 'polite' });
    const chips = h('div', { class: 'w2-chips', role: 'group', 'aria-label': 'Body parts' });
    const chipEls = {};
    Object.entries(PARTS).forEach(([id, p]) => { const c = h('button', { type: 'button', class: 'w2-chip', 'aria-pressed': 'false' }, h('span', { class: 'w2-dot', style: { background: p.col } }), p.name); c.addEventListener('click', () => select(id)); chipEls[id] = c; chips.append(c); });
    const figWrap = h('div', null, fig), stripWrap = h('div', null, strip);
    root.append(inst, mapSeg, h('div', { class: 'hom-grid' }, figWrap, stripWrap),
      h('div', { class: 'hom-slider' }, h('span', null, 'Real body'), slider, h('span', null, 'Cortex map')), h('div', { class: 'w2-row' }, play), panel, chips);
    el.append(root);
    slider.addEventListener('input', () => { t = slider.value / 100; draw(); });
    let anim = 0;
    play.addEventListener('click', () => {
      cancelAnimationFrame(anim); const from = t, to = t > .5 ? 0 : 1, s0 = performance.now(), dur = api.reduceMotion ? 1 : 1400;
      api.sfx.tone(to ? 300 : 600, .5, 'sine', .05, to ? 600 : 300);
      const step = now => { const f = Math.max(0, Math.min(1, (now - s0) / dur)); const e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; t = from + (to - from) * e; slider.value = Math.round(t * 100); draw(); if (f < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
    });

    /* ----- figure ----- */
    const sc = id => 1 + (PARTS[id][map] - 1) * t;
    const partEls = {};
    function mkPart(id, parent) {
      const g = S('g', { 'data-id': id, tabindex: '0', role: 'button', 'aria-label': PARTS[id].name }, parent);
      g.addEventListener('click', () => select(id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); } });
      partEls[id] = partEls[id] || []; partEls[id].push(g); return g;
    }
    const sh = (g, tag, a, id) => S(tag, Object.assign({ class: 'hom-p', style: `fill:${PARTS[id].col}` }, a), g);
    function draw() {
      fig.innerHTML = ''; Object.keys(partEls).forEach(k => delete partEls[k]);
      const cx = 160, sT = sc('trunk'), sH = sc('face'), sA = sc('arm'), sL = sc('leg'), sHa = sc('hand'), sF = sc('foot'), sLi = sc('lips'), sTo = sc('tongue');
      const tw = 66 * sT, th = 104 * sT, tcy = 196;
      const neckY = tcy - th / 2, hipY = tcy + th / 2;
      const shoulders = [[cx - tw / 2 + 4, neckY + 10 * sT], [cx + tw / 2 - 4, neckY + 10 * sT]];
      const hands = [[78, 236], [242, 236]], feet = [[134, 330], [186, 330]];
      // legs
      const gLeg = mkPart('leg', fig);
      [[cx - 14 * sT, hipY - 4], [cx + 14 * sT, hipY - 4]].forEach((hp, k) => {
        const f = feet[k]; const w = 18 * sL;
        const ang = Math.atan2(f[1] - hp[1], f[0] - hp[0]), nx = -Math.sin(ang) * w / 2, ny = Math.cos(ang) * w / 2;
        sh(gLeg, 'path', { d: `M${hp[0] + nx},${hp[1] + ny} L${f[0] + nx},${f[1] - 6 + ny} L${f[0] - nx},${f[1] - 6 - ny} L${hp[0] - nx},${hp[1] - ny} Z`, 'stroke-linejoin': 'round' }, 'leg');
      });
      const gFoot = mkPart('foot', fig);
      feet.forEach((f, k) => sh(gFoot, 'ellipse', { cx: f[0] + (k ? 7 : -7) * sF, cy: f[1], rx: 13 * sF, ry: 6.5 * sF }, 'foot'));
      // arms
      const gArm = mkPart('arm', fig);
      shoulders.forEach((s0, k) => {
        const hp = hands[k], w = 15 * sA;
        const ang = Math.atan2(hp[1] - s0[1], hp[0] - s0[0]), nx = -Math.sin(ang) * w / 2, ny = Math.cos(ang) * w / 2;
        sh(gArm, 'path', { d: `M${s0[0] + nx},${s0[1] + ny} L${hp[0] + nx},${hp[1] + ny} L${hp[0] - nx},${hp[1] - ny} L${s0[0] - nx},${s0[1] - ny} Z`, 'stroke-linejoin': 'round' }, 'arm');
      });
      // trunk
      const gTr = mkPart('trunk', fig);
      sh(gTr, 'rect', { x: cx - tw / 2, y: neckY, width: tw, height: th, rx: 18 * sT }, 'trunk');
      // hands
      const gHand = mkPart('hand', fig);
      hands.forEach((hp, k) => {
        const dir = k ? 1 : -1, r = 8.5 * sHa;
        for (let f = 0; f < 4; f++) {
          const a = (Math.PI / 2) + dir * (0.15 + f * 0.24); // fingers fan downward-outward
          const L = (11 + (f === 1 || f === 2 ? 2 : 0)) * sHa, fw = 4.2 * sHa;
          const x1 = hp[0] + Math.cos(a) * r * .6, y1 = hp[1] + Math.sin(a) * r * .6, x2 = hp[0] + Math.cos(a) * (r + L), y2 = hp[1] + Math.sin(a) * (r + L);
          sh(gHand, 'line', { x1, y1, x2, y2, style: `stroke:${PARTS.hand.col};stroke-width:${fw};stroke-linecap:round`, class: 'hom-p hom-fing' }, 'hand');
        }
        const ta = (Math.PI / 2) - dir * 0.9, TL = 9 * sHa;
        sh(gHand, 'line', { x1: hp[0], y1: hp[1], x2: hp[0] + Math.cos(ta) * (r + TL), y2: hp[1] + Math.sin(ta) * (r + TL), style: `stroke:${PARTS.hand.col};stroke-width:${4.8 * sHa};stroke-linecap:round`, class: 'hom-p hom-fing' }, 'hand');
        sh(gHand, 'circle', { cx: hp[0], cy: hp[1], r }, 'hand');
      });
      // head
      const r = 25 * sH, hcy = neckY - r * 0.9 + 2;
      const gFace = mkPart('face', fig);
      sh(gFace, 'ellipse', { cx: cx - r * 0.98, cy: hcy, rx: r * 0.16, ry: r * 0.26 }, 'face');
      sh(gFace, 'ellipse', { cx: cx + r * 0.98, cy: hcy, rx: r * 0.16, ry: r * 0.26 }, 'face');
      sh(gFace, 'circle', { cx, cy: hcy, r }, 'face');
      [-1, 1].forEach(s => { S('ellipse', { class: 'hom-eye', cx: cx + s * r * 0.38, cy: hcy - r * 0.2, rx: r * 0.15, ry: r * 0.11 }, gFace); S('circle', { class: 'hom-pupil', cx: cx + s * r * 0.38, cy: hcy - r * 0.2, r: r * 0.06 }, gFace); });
      S('path', { d: `M${cx},${hcy - r * 0.12} L${cx - r * 0.1},${hcy + r * 0.18} L${cx + r * 0.1},${hcy + r * 0.18}`, style: 'fill:none;stroke:#3a2a20;stroke-width:1.4;stroke-linejoin:round', 'pointer-events': 'none' }, gFace);
      const lipsY = hcy + r * 0.45 + 2 * sLi;
      const gTo = mkPart('tongue', fig);
      const tcy2 = lipsY + 3.5 * sLi * 0.6 + 4.2 * sTo;
      sh(gTo, 'path', { d: `M${cx - 4.6 * sTo},${lipsY} L${cx - 4.6 * sTo},${tcy2} A${4.6 * sTo},${4.6 * sTo} 0 0 0 ${cx + 4.6 * sTo},${tcy2} L${cx + 4.6 * sTo},${lipsY} Z` }, 'tongue');
      S('line', { x1: cx, y1: lipsY + 3 * sLi * 0.6, x2: cx, y2: tcy2 + 1.5 * sTo, style: 'stroke:#3a2a20;stroke-width:1.1;opacity:.6', 'pointer-events': 'none' }, gTo);
      const gLi = mkPart('lips', fig);
      sh(gLi, 'ellipse', { cx, cy: lipsY, rx: 8.5 * sLi, ry: 3.5 * sLi }, 'lips');
      S('line', { x1: cx - 8 * sLi, y1: lipsY, x2: cx + 8 * sLi, y2: lipsY, style: 'stroke:#3a2a20;stroke-width:1.2', 'pointer-events': 'none' }, gLi);
      const cap = S('text', { x: 6, y: 352, class: 'hom-cap' }, fig); cap.textContent = t > .5 ? (map === 'sens' ? 'SENSORY HOMUNCULUS' : 'MOTOR HOMUNCULUS') : 'REAL PROPORTIONS';
      paintSel();
    }
    /* ----- strip ----- */
    const segEls = {};
    function drawStrip() {
      strip.innerHTML = ''; Object.keys(segEls).forEach(k => delete segEls[k]);
      const cx = 212, cy = 214, R = 172, w = 30;
      S('path', { class: 'hom-brain', style: 'fill:var(--carolina-soft)', d: `M${cx},${cy - R - 4} A${R + 4},${R + 4} 0 0 0 ${cx - (R + 4) * Math.cos(Math.PI * 0.14)},${cy + (R + 4) * Math.sin(Math.PI * 0.14)} C70,300 120,300 150,282 C176,268 200,262 ${cx},262 Z` }, strip);
      const capT = S('text', { x: 24, y: 34, class: 'hom-cap' }, strip); capT.textContent = map === 'sens' ? 'SOMATOSENSORY STRIP' : 'MOTOR STRIP';
      const capT2 = S('text', { x: 24, y: 48, class: 'hom-cap', style: 'font-size:10px' }, strip); capT2.textContent = map === 'sens' ? '(parietal lobe)' : '(frontal lobe)';
      const mid = S('text', { x: cx - 4, y: 300, 'text-anchor': 'end', class: 'hom-cap', style: 'font-size:10px' }, strip); mid.textContent = 'MIDLINE ▲';
      const a0 = 92, a1 = 205, total = STRIP_ORDER.reduce((s, id) => s + PARTS[id][map === 'sens' ? 'shareS' : 'shareM'], 0);
      let a = a0;
      const pt = (ang, rr) => [cx + rr * Math.cos(ang * Math.PI / 180), cy - rr * Math.sin(ang * Math.PI / 180)];
      STRIP_ORDER.forEach(id => {
        const span = (a1 - a0) * PARTS[id][map === 'sens' ? 'shareS' : 'shareM'] / total;
        const b = a + span; const large = span > 180 ? 1 : 0;
        const [x1, y1] = pt(a, R), [x2, y2] = pt(b, R), [x3, y3] = pt(b, R - w), [x4, y4] = pt(a, R - w);
        const g = S('path', { class: 'hom-seg', d: `M${x1},${y1} A${R},${R} 0 ${large} 0 ${x2},${y2} L${x3},${y3} A${R - w},${R - w} 0 ${large} 1 ${x4},${y4} Z`, style: `fill:${PARTS[id].col}`, tabindex: '0', role: 'button', 'aria-label': `${PARTS[id].name} area of the strip` }, strip);
        g.addEventListener('click', () => select(id));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); } });
        segEls[id] = { g, mid: (a + b) / 2 };
        a = b;
      });
      const labG = S('g', null, strip); segEls._lab = labG;
      paintSel();
    }
    function paintSel() {
      fig.classList.toggle('hom-on', !!sel); strip.classList.toggle('hom-on', !!sel);
      Object.entries(partEls).forEach(([id, gs]) => gs.forEach(g => g.querySelectorAll('.hom-p').forEach(p => p.classList.toggle('on', id === sel))));
      STRIP_ORDER.forEach(id => segEls[id] && segEls[id].g.classList.toggle('on', id === sel));
      const lg = segEls._lab; if (!lg) return;
      lg.innerHTML = '';
      if (sel && segEls[sel]) {
        const cx = 212, cy = 214, R = 172, w = 30, ang = segEls[sel].mid * Math.PI / 180;
        const x = cx + (R - w - 14) * Math.cos(ang), y = cy - (R - w - 14) * Math.sin(ang);
        const txt = PARTS[sel].name.split(' (')[0];
        const tw = txt.length * 7 + 14;
        const bx = Math.max(24, Math.min(240 - tw, x - (Math.cos(ang) < 0 ? 0 : tw))), by = y - 10;
        S('line', { x1: cx + (R - w / 2) * Math.cos(ang), y1: cy - (R - w / 2) * Math.sin(ang), x2: bx + (Math.cos(ang) < 0 ? 0 : tw), y2: by + 10, style: 'stroke:var(--ink);stroke-width:1.2' }, lg);
        S('rect', { x: bx, y: by, width: tw, height: 20, rx: 10, style: 'fill:var(--surface);stroke:var(--ink)' }, lg);
        const tt = S('text', { x: bx + tw / 2, y: by + 14, 'text-anchor': 'middle', class: 'hom-lab' }, lg); tt.textContent = txt;
      }
    }
    function select(id) {
      sel = id; api.sfx.tap(); paintSel(); info(id);
      Object.entries(chipEls).forEach(([k, c]) => c.setAttribute('aria-pressed', String(k === id)));
    }
    function info(id) {
      const p = PARTS[id], share = map === 'sens' ? p.shareS : p.shareM;
      panel.innerHTML = '';
      const meter = h('div', { class: 'w2-meter' }, h('i', { style: { width: share + '%', background: p.col } }));
      panel.append(h('div', { class: 'w2-tag' }, map === 'sens' ? 'Somatosensory cortex (touch)' : 'Motor cortex (movement)'), h('h4', null, p.name),
        h('div', { class: 'w2-kv' }, h('b', null, 'How much cortex (relative)'), h('div', { class: 'hom-bar' }, meter, h('span', { class: 'readout' }, share >= 80 ? 'Huge' : share >= 50 ? 'Large' : share >= 30 ? 'Medium' : 'Small'))),
        h('div', { class: 'w2-kv' }, h('b', null, 'Why'), map === 'sens' ? p.whyS : p.whyM),
        h('p', { class: 'muted', style: { margin: 0, fontSize: '14px' } }, map === 'sens' ? 'More receptors = more sensitivity = more cortex. Size on the map is about sensitivity, not body size.' : 'The motor homunculus looks similar: more precise movement = more cortex. It sits in the motor strip, just in front of the touch strip.'));
    }
    function idle() {
      panel.innerHTML = '';
      panel.append(h('div', { class: 'w2-tag' }, 'Homunculus = “little person”'),
        h('p', { style: { margin: 0 } }, 'This is how your body would look if each part were sized by how much cortex it gets. Notice the giant hands, lips, and tongue, and the tiny trunk and legs. Tap a part to find out why.'));
    }
    draw(); drawStrip(); idle();
    return () => { cancelAnimationFrame(anim); bag.destroy(); };
  }
});
})();
