/* brain-lateral: side view of the left hemisphere. Explore lobes/strips/language areas, then quiz. Uses ML.w2 (_w2-kit.js). */
(function () {
'use strict';
const Q = [
  { q: 'Tap where <em>vision</em> is processed.', a: ['occipital'], why: 'Occipital = seeing. The primary visual cortex is at the very back of your head.' },
  { q: 'Tap the area that controls <em>speech production</em>.', a: ['broca'], near: { frontal: 'Right lobe! Now find the small area on the left frontal lobe near the bottom of the motor strip.', pfc: 'Right lobe! Look a little farther back and lower, near the face area of the motor strip.' }, why: 'Broca’s area (left frontal lobe) plans the mouth movements of speech.' },
  { q: 'Tap the strip that registers <em>touch</em>.', a: ['somato'], near: { parietal: 'Close! Touch is in the parietal lobe, but find the strip at its front edge.' }, why: 'The somatosensory cortex runs along the front of the parietal lobe.' },
  { q: 'Tap where <em>hearing</em> is processed.', a: ['temporal', 'wern'], why: 'Temporal = hearing and remembering. The auditory cortex sits on the top of the temporal lobe.' },
  { q: 'Tap the area in charge of <em>planning and impulse control</em>.', a: ['pfc'], near: { frontal: 'Right lobe! Now tap its very front part.', motor: 'Right lobe! Now move to its very front part.' }, why: 'The prefrontal cortex is the brain’s CEO: judgment, planning, self-control.' },
  { q: 'Tap the part that handles <em>balance and coordination</em>.', a: ['cereb'], why: '“Get your bell rung” and you wobble: the cerebellum.' },
  { q: 'Tap the strip that sends commands for <em>voluntary movement</em>.', a: ['motor'], near: { frontal: 'Right lobe! Find the strip at the back edge of the frontal lobe.', somato: 'So close! That strip feels. The movement strip is just in front of it.' }, why: 'The motor cortex runs along the back of the frontal lobe.' },
  { q: 'Tap where <em>language comprehension</em> happens.', a: ['wern'], near: { temporal: 'Right lobe! Now find the specific language area toward the back of it.', broca: 'That one produces speech. Understanding happens in the temporal lobe.' }, why: 'Wernicke’s area (left temporal lobe) lets you understand words.' },
  { q: 'Tap the lobe that tells you <em>where your body is in space</em>.', a: ['parietal', 'somato'], why: 'Parietal = sensing and locating.' },
  { q: 'Tap the part that keeps your <em>heart beating and lungs breathing</em>.', a: ['stem'], why: 'The brainstem (its medulla) runs heartbeat and breathing automatically.' },
  { q: 'Tap the lobe for <em>personality and decision-making</em>.', a: ['frontal', 'pfc'], why: 'Frontal = thinking and doing. Phineas Gage’s personality changed after frontal damage.' },
  { q: 'Tap the part that stores <em>practiced skills</em> like riding a bike.', a: ['cereb'], why: 'Repeated, practiced movements (bike riding, jumping rope, tying shoes) rely on the cerebellum.' }
];
ML.registerWidget('brain-lateral', {
  title: 'The cortex from the side', tag: 'Explore + quiz',
  mount(el, api) {
    return ML.w2.regionMap(el, api, { view: 'lateral', inst: 'Tap a lobe or area to learn what it does. Then switch to Quiz me.', quiz: Q, perRound: 8,
      idle: 'Tap any lobe, strip, or language area (or a name below). Front of the brain points left.' });
  }
});
})();
