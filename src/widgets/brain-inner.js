/* brain-inner: midline (sagittal) cutaway: limbic system, brainstem, RAS, cerebellum. Explore + Quiz. Uses ML.w2. */
(function () {
'use strict';
const Q = [
  { q: 'Tap the <em>relay station</em> that sends every sense except smell to the cortex.', a: ['thal'], why: 'Thalamus = relay station.' },
  { q: 'Tap the part that controls <em>hunger, thirst, and body temperature</em>.', a: ['hypo'], near: { thal: 'Close! Look just BELOW the thalamus (hypo = below).' }, why: 'The hypothalamus keeps homeostasis.' },
  { q: 'Tap the <em>master gland</em>.', a: ['pit'], near: { hypo: 'That is its boss. The master gland hangs just below it.' }, why: 'The pituitary gland releases hormones that control other glands.' },
  { q: 'Tap the part that <em>forms new memories</em>.', a: ['hippo'], near: { amyg: 'That one handles fear. Its memory-making neighbor is right behind it.' }, why: 'See a HIPPO on CAMPUS and you will remember it.' },
  { q: 'Tap the part that processes <em>fear and aggression</em>.', a: ['amyg'], near: { hippo: 'That one forms memories. The fear center is just in front of it.' }, why: 'The amygdala is the brain’s alarm system.' },
  { q: 'Tap the bridge that <em>connects the two hemispheres</em>.', a: ['cc'], why: 'The corpus callosum is cut in split-brain surgery.' },
  { q: 'Tap the part that controls <em>heartbeat and breathing</em>.', a: ['med'], near: { pons: 'Close! Go lower, to the base of the brainstem.' }, why: 'The medulla is life support.' },
  { q: 'Tap the part that runs <em>balance and practiced skills</em>.', a: ['cereb'], why: 'Get your bell rung and you wobble: the cerebellum.' },
  { q: 'Tap the network that controls <em>alertness and wakefulness</em>.', a: ['ras'], near: { mid: 'You are in the brainstem. Tap the dotted network running up its core.', pons: 'You are in the brainstem. Tap the dotted network running up its core.', med: 'You are in the brainstem. Tap the dotted network running up its core.' }, why: 'The reticular activating system is your on/off switch.' },
  { q: 'Tap the <em>reward center</em> that gets a dopamine rush.', a: ['nacc'], why: 'The nucleus accumbens drives pleasure and motivation.' },
  { q: 'Tap the brainstem bulge that helps with <em>sleep and movement</em>.', a: ['pons'], why: 'The pons (“bridge”) helps coordinate movement and sleep.' },
  { q: 'Tap the outer layer that does <em>higher thinking</em>.', a: ['cortex'], why: 'The cerebral cortex handles complex thinking.' },
  { q: 'Tap the top of the brainstem that relays <em>sights and sounds</em>.', a: ['mid'], why: 'The midbrain relays visual and auditory information.' }
];
ML.registerWidget('brain-inner', {
  title: 'Inside the brain', tag: 'Explore + quiz',
  mount(el, api) {
    return ML.w2.regionMap(el, api, { view: 'inner', inst: 'Tap a structure to learn what it does. Then switch to Quiz me.', quiz: Q, perRound: 8,
      idle: 'Tap any structure (or a name below). Dashed shapes (hippocampus, amygdala) sit deeper, off the midline, but are shown here so you can find them.' });
  }
});
})();
