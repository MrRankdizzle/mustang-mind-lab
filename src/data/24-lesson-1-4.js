/* Lessons 1.4A Brain structures (core and limbic), 1.4B Cortex, hemispheres, plasticity, research */
ML.data.lessons.push({
  id: '1.4A', topic: '1.4', title: 'The Brain from the Inside Out', blurb: 'Brainstem, cerebellum, and the limbic system.',
  steps: [
    { kind: 'Big picture', title: 'Old brain, new brain', blocks: [
      { type: 'hook', html: 'Your brain is like a house that kept getting additions. The oldest rooms in the basement keep you breathing and your heart beating. The newer rooms upstairs let you plan a weekend, solve an equation, or recognize a friend’s voice.' },
      { type: 'text', html: 'The brain’s outer layers handle complex thinking. As we move inward, we find regions responsible for more basic functions. In this lesson you start at the core (the brainstem), move to the cerebellum, and then explore the limbic system.' },
      { type: 'widget', id: 'brain-inner', caption: 'Slice the brain down the middle. Tap each structure to explore, then quiz yourself.' }
    ] },
    { kind: 'Anatomy', title: 'The brainstem: life support', blocks: [
      { type: 'text', html: [
        'The {{brainstem}} is the oldest, innermost part of the brain. It runs automatic survival functions.',
        'The {{midbrain}} relays visual, auditory, pain, movement, and sleep information. The {{pons}} helps coordinate movement and sleep. The {{medulla oblongata}} at the base controls heartbeat and breathing.'
      ] },
      { type: 'text', h: 'The reticular activating system', html: 'Running through the brainstem is the {{reticular activating system}} (RAS), also called the reticular formation. It controls arousal, alertness, and sleep-wake cycles, and filters which incoming stimuli get your attention. Problems in this system are linked to attention difficulties and narcolepsy.' },
      { type: 'text', h: 'The cerebellum: the "little brain"', html: 'At the back of the skull sits the {{cerebellum}}. It handles balance and coordination and helps with repeated, practiced movements like riding a bike, skipping rope, or tying your shoe. When someone "gets their bell rung" in a hard hit, balance and coordination are often the first things to go.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.4A-c1', q: 'Damage to which structure would most likely be immediately life-threatening because it controls breathing and heartbeat?', choices: ['Cerebellum', 'Medulla oblongata', 'Amygdala', 'Occipital lobe'], a: 1, why: 'The medulla controls heartbeat and breathing.' },
        { type: 'mc', id: '1.4A-c2', q: 'A gymnast can perform her floor routine smoothly without thinking about each step. Which structure is most responsible for this practiced coordination?', choices: ['Cerebellum', 'Hippocampus', 'Pons', 'Thalamus'], a: 0, why: 'The cerebellum coordinates balance and practiced, repeated movements.' }
      ] }
    ] },
    { kind: 'Anatomy', title: 'The limbic system: emotion and memory', blocks: [
      { type: 'text', html: 'The {{limbic system}} is a ring of structures that regulate emotions, behavior, motivation, and long-term memory. Problems here are linked to PTSD, depression, anxiety, and schizophrenia.' },
      { type: 'table', head: ['Structure', 'Job', 'Memory hook'], rows: [
        ['{{Thalamus}}', 'Relay station: sends sensory information to the right areas for processing (every sense except smell)', 'The switchboard operator'],
        ['{{Hypothalamus}}', 'Regulates hunger, thirst, body temperature; keeps homeostasis; controls the pituitary', '"Hypo" = below the thalamus'],
        ['{{Pituitary gland}}', 'The "master gland"; releases hormones that regulate growth and other glands', 'The boss of the endocrine system'],
        ['{{Hippocampus}}', 'Forms, organizes, and retrieves new memories (short-term to long-term); does not store them permanently', 'If you see a HIPPO on CAMPUS, you’ll remember it'],
        ['{{Amygdala}}', 'Processes emotions, especially fear and aggression; strong emotional memories', 'Two almonds of alarm'],
        ['{{Reward center}} (nucleus accumbens)', 'Drives pleasure and motivation with a "dopamine dump"', 'Hooked by drugs, social media, gambling']
      ] },
      { type: 'cfu', qs: [
        { type: 'match', id: '1.4A-c3', q: 'Match each limbic structure to its job.', pairs: [['Thalamus', 'Relays sensory messages'], ['Hypothalamus', 'Hunger, thirst, temperature'], ['Hippocampus', 'Forms new memories'], ['Amygdala', 'Fear and aggression'], ['Pituitary gland', 'Master gland']] },
        { type: 'mc', id: '1.4A-c4', q: 'Which sense does NOT pass through the thalamus on its way to the cortex?', choices: ['Vision', 'Hearing', 'Smell', 'Touch'], a: 2, why: 'Smell (olfaction) is the exception. It goes straight to the olfactory bulb and limbic areas, which is why smells trigger emotional memories.' }
      ] }
    ] },
    { kind: 'Clinical connection', title: 'When the core is damaged', blocks: [
      { type: 'clinical', h: 'Memory without a hippocampus', html: 'People whose hippocampus is damaged on both sides may remember their childhood but be unable to form new long-term memories of facts and events. They can meet you, chat for an hour, and not recognize you the next day.' },
      { type: 'clinical', h: 'A brain without fear', html: 'Rare patients with damage to both amygdalae show little fear, even in situations most people find terrifying. On the other hand, an overactive amygdala is linked to anxiety disorders and PTSD.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.4A-c5', q: 'After a stroke, a man is always hungry, even right after eating, and has trouble keeping a steady body temperature. Which structure was most likely damaged?', choices: ['Hippocampus', 'Hypothalamus', 'Cerebellum', 'Medulla'], a: 1, why: 'The hypothalamus regulates hunger, thirst, and body temperature.' },
        { type: 'mc', id: '1.4A-c6', q: 'Why do emotional events, like a car crash, tend to be remembered so vividly?', choices: ['The amygdala boosts memory formation for emotional events.', 'The medulla stores emotional memories.', 'The pons blocks ordinary memories.', 'The cerebellum records every detail.'], a: 0, why: 'The amygdala processes emotion and strengthens memories tied to strong emotions.' }
      ] }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.4B', topic: '1.4', title: 'The Cerebral Cortex', blurb: 'Lobes, hemispheres, language, plasticity, and brain research.',
  steps: [
    { kind: 'Big picture', title: 'The thinking cap', blocks: [
      { type: 'hook', h: 'An ode to the wrinkles', html: 'Spread out flat, your cerebral cortex would cover about the area of a large pizza, yet it is only a few millimeters thick. The wrinkles let all that surface fold into your skull. This thin sheet is where you plan, read, recognize faces, and decide what to eat for lunch.' },
      { type: 'text', html: [
        'The {{cerebral cortex}} is the brain’s wrinkled outer layer, responsible for higher-level thinking and complex tasks. It is divided into lobes.',
        '{{Cortex specialization}} means specific functions are handled by specific areas: sensory processing, motor control, language, vision, and higher-order thinking. {{Contralateral hemispheric organization}} means each hemisphere controls the opposite side of the body.'
      ] },
      { type: 'widget', id: 'brain-lateral', caption: 'Tap each lobe and strip to explore, then quiz yourself on where each job happens.' }
    ] },
    { kind: 'Anatomy', title: 'The four lobes', blocks: [
      { type: 'table', head: ['Lobe', 'Location', 'Big idea', 'Special areas'], rows: [
        ['{{Frontal}}', 'Behind the forehead', 'Thinking and doing: planning, decisions, personality, movement', '{{Prefrontal cortex}} (judgment, executive function); {{motor cortex}} at the back controls muscle movement'],
        ['{{Parietal}}', 'Top or crown of the head', 'Sensing and locating: touch, pressure, temperature, pain, body position', '{{Somatosensory cortex}} at the front registers touch'],
        ['{{Occipital}}', 'Back of the head', 'Seeing: shapes, edges, faces', 'Primary visual cortex'],
        ['{{Temporal}}', 'Sides, above the ears', 'Hearing and understanding language', 'Auditory cortex; Wernicke’s area (left)']
      ] },
      { type: 'widget', id: 'homunculus', caption: 'Slide from real proportions to "cortex proportions." The more cortex a body part gets, the bigger it grows.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.4B-c1', q: 'Your little sister touches a cold window. Which area first registers the cold on her fingertip?', choices: ['Motor cortex in the frontal lobe', 'Somatosensory cortex in the parietal lobe', 'Visual cortex in the occipital lobe', 'Auditory cortex in the temporal lobe'], a: 1, why: 'Touch and temperature are registered by the somatosensory cortex at the front of the parietal lobe.' },
        { type: 'mc', id: '1.4B-c2', q: 'On the sensory homunculus, the hands and lips are huge because', choices: ['they have the strongest muscles', 'more cortex is devoted to them, so they are more sensitive', 'they are controlled by the cerebellum', 'they send signals to both hemispheres'], a: 1, why: 'The homunculus shows how much cortex is devoted to each body part. Hands and lips have many receptors and lots of cortex.' }
      ] }
    ] },
    { kind: 'Clinical connection', title: 'Phineas Gage and the frontal lobe', blocks: [
      { type: 'clinical', h: 'The man with the iron rod', html: 'In 1848, railroad foreman Phineas Gage survived an explosion that drove an iron rod through his left frontal lobe. He could still walk and talk, but friends said he was "no longer Gage": he became impulsive, rude, and unable to stick to plans. His case was early evidence that the frontal lobe (especially the prefrontal cortex) shapes personality and self-control.' },
      { type: 'widget', id: 'neuro-er', caption: 'You are the neurologist. Read each case and tap the part of the brain that was damaged.' },
      { type: 'cfu', q: { type: 'mc', id: '1.4B-c3', q: 'After a stroke on the LEFT side of her motor cortex, Ana cannot move her', choices: ['left arm', 'right arm', 'eyes', 'left and right arms equally'], a: 1, why: 'Contralateral organization: each hemisphere controls the opposite side of the body.' } }
    ] },
    { kind: 'Function', title: 'Language and the left hemisphere', blocks: [
      { type: 'text', html: [
        'For most people, language lives mostly in the left hemisphere, along with reading, writing, math, and logic.',
        '{{Broca’s area}}, in the left frontal lobe, controls speech production. {{Wernicke’s area}}, in the left temporal lobe, controls language comprehension. {{Aphasia}} is a language disorder that impacts speech, comprehension, reading, or writing.'
      ] },
      { type: 'table', head: ['', 'Broca’s aphasia', 'Wernicke’s aphasia'], rows: [
        ['Damage', 'Broca’s area (left frontal)', 'Wernicke’s area (left temporal)'],
        ['Speaking', 'Slow, effortful, broken words', 'Fluent but meaningless "word salad"'],
        ['Understanding', 'Mostly intact', 'Impaired']
      ] },
      { type: 'analogy', h: 'Memory trick', html: 'Broca’s = Broken speech (production). Wernicke’s = Wordy nonsense (comprehension).' },
      { type: 'cfu', q: { type: 'mc', id: '1.4B-c4', q: 'A patient says, "The dog the green slept fast window jumping," and seems unaware it makes no sense. Where is the damage most likely?', choices: ['Broca’s area', 'Wernicke’s area', 'Occipital lobe', 'Cerebellum'], a: 1, why: 'Fluent word salad with poor comprehension is Wernicke’s aphasia.' } }
    ] },
    { kind: 'Research', title: 'Split-brain research', blocks: [
      { type: 'text', html: [
        'The {{corpus callosum}} is a thick bundle of nerve fibers connecting the two hemispheres. In cases of severe epilepsy, surgeons have cut it to stop seizures from spreading, creating a {{split brain}}.',
        'Michael Gazzaniga studied these patients. Because information from the right visual field goes to the left hemisphere (and vice versa), he could send a picture to just one side of the brain. The left hemisphere excels at verbal tasks; the right at spatial tasks.'
      ] },
      { type: 'widget', id: 'split-brain', caption: 'Flash a word to one visual field and see what the patient can say, and what their left hand can find.' },
      { type: 'note', h: 'Left brain vs. right brain myth', html: 'Hemispheres do specialize, but people are not "left-brained" or "right-brained." In an intact brain, both hemispheres constantly share information through the corpus callosum.' },
      { type: 'cfu', q: { type: 'mc', id: '1.4B-c5', q: 'A split-brain patient sees the word "KEY" flashed in his LEFT visual field. What will most likely happen?', choices: ['He says "key" out loud.', 'He says he saw nothing, but his left hand picks out a key.', 'He says he saw nothing, and his right hand picks out a key.', 'He sees two keys.'], a: 1, why: 'The left visual field goes to the right hemisphere, which cannot speak but controls the left hand.' } }
    ] },
    { kind: 'Function', title: 'Plasticity: the brain rewires', blocks: [
      { type: 'text', html: '{{Brain plasticity}} (neuroplasticity) is the brain’s ability to rewire itself. When one part is damaged, other areas can sometimes take over its function. Plasticity is highest in childhood, which is why children who have had half their brain removed (a hemispherectomy) can recover remarkably well. But it continues throughout life: every time you learn something new, you are shaping your brain.' },
      { type: 'widget', id: 'plasticity', caption: 'Practice to strengthen a pathway, then cause an injury and help the network rewire.' },
      { type: 'cfu', q: { type: 'tf', id: '1.4B-c6', q: 'Neuroplasticity stops completely after childhood.', a: false, why: 'False. Plasticity is greatest in childhood but continues throughout life whenever we learn.' } }
    ] },
    { kind: 'Research', title: 'How do we know? Studying the brain', blocks: [
      { type: 'text', html: 'Scientists use scans, case studies, and surgical procedures to understand brain function. {{Lesioning}} studies examine natural or experimentally damaged brain tissue (strokes, ablations, hemispherectomies, split brains) to see what a region does.' },
      { type: 'widget', id: 'brain-scans', caption: 'Compare each tool, then pick the best tool for each research question.' },
      { type: 'table', head: ['Tool', 'What it shows', 'Best for'], rows: [
        ['{{EEG}}', 'Electrical activity (brain waves) from scalp electrodes', 'Timing, like sleep stages; poor at pinpointing location'],
        ['{{fMRI}}', 'Blood flow to active areas', 'Where activity happens during a task (structure + function)'],
        ['PET', 'Where radioactive glucose is being used', 'Brain activity and metabolism'],
        ['CT (CAT)', 'X-ray slices of the brain', 'Structure: tumors, bleeding, damage'],
        ['MEG', 'Magnetic fields from neural activity', 'Precise timing of activity']
      ] },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.4B-c7', q: 'A researcher wants to see which brain areas become more active when people look at photos of their friends. Which tool is best?', choices: ['EEG', 'fMRI', 'CT scan', 'Lesion study'], a: 1, why: 'fMRI tracks blood flow to show where activity happens during a task.' },
        { type: 'mc', id: '1.4B-c8', q: 'To track how brain waves change minute by minute through a night of sleep, a researcher should use', choices: ['an EEG', 'a CT scan', 'a lesion study', 'a PET scan'], a: 0, why: 'EEG records electrical brain waves with excellent timing, perfect for sleep stages.' }
      ] }
    ] }
  ]
});
