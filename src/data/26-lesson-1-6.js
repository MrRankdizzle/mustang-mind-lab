/* Lessons 1.6A–E Sensation */
ML.data.lessons.push({
  id: '1.6A', topic: '1.6', title: 'Sensation Basics', blurb: 'Thresholds, Weber’s law, adaptation, and sensory interaction.',
  steps: [
    { kind: 'Big picture', title: 'From the world to your brain', blocks: [
      { type: 'hook', h: 'Can you read this?', html: 'Your eyes see only letters. Your brain sees a message. Try the puzzle below before reading on.' },
      { type: 'widget', id: 'hidden-ducks', caption: 'Decode the four lines. Notice how much easier it gets once you know the pattern.' },
      { type: 'text', html: [
        '{{Sensation}} is the process of detecting information from the environment that meets a certain threshold and {{transducing}} it into neural messages the brain can process. {{Perception}} is the brain organizing and interpreting those messages.',
        '{{Bottom-up processing}} starts with the sensory receptors and works up to the brain, like reading letter by letter. {{Top-down processing}} uses experience and expectations to interpret, which is how the duck puzzle suddenly clicks.'
      ] },
      { type: 'cfu', q: { type: 'mc', id: '1.6A-c1', q: 'You recognize your best friend’s messy handwriting on a note even though some letters are barely legible. This is mainly', choices: ['bottom-up processing', 'top-down processing', 'sensory adaptation', 'transduction'], a: 1, why: 'Your experience with her handwriting fills in the gaps. That is top-down processing.' } }
    ] },
    { kind: 'How it works', title: 'Thresholds', blocks: [
      { type: 'text', html: [
        '{{Psychophysics}} studies how the physical characteristics of stimuli, like their intensity, relate to our psychological experience of them. Gustav Fechner and Ernst Weber were pioneers.',
        'The {{absolute threshold}} is the minimum intensity of a stimulus that can be detected 50% of the time: the smallest detectable LEVEL. The {{just-noticeable difference}} (JND), or difference threshold, is the smallest detectable CHANGE in a stimulus, also detected 50% of the time.',
        '{{Weber’s law}} says the size of the JND is proportional to the starting intensity. Two stimuli must differ by a constant minimum percentage, not a constant amount.'
      ] },
      { type: 'widget', id: 'threshold-lab', caption: 'Find your own absolute threshold, then test Weber’s law with weights.' },
      { type: 'apply', h: 'Sweet tea', html: 'A teaspoon of sugar in barely-sweet tea makes a big difference. The same teaspoon in very sweet tea might not be noticeable. The bigger the starting amount, the bigger the change needed to notice it.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.6A-c2', q: 'Carrying a 5-pound backpack, you notice when a friend adds a 1-pound book. With a 50-pound pack, you don’t notice the same book. Which principle explains this?', choices: ['Absolute threshold', 'Sensory adaptation', 'Weber’s law', 'Synesthesia'], a: 2, why: 'The JND is a constant proportion of the starting weight, so a heavier load needs a bigger change.' },
        { type: 'mc', id: '1.6A-c3', q: 'The faintest hum that a listener can detect half the time is the', choices: ['difference threshold', 'absolute threshold', 'just-noticeable difference', 'subliminal threshold'], a: 1, why: 'The minimum intensity detected 50% of the time is the absolute threshold.' }
      ] }
    ] },
    { kind: 'Research', title: 'Subliminal messages', blocks: [
      { type: 'text', html: '{{Subliminal}} stimuli are below the absolute threshold for conscious awareness. In 1957, James Vicary claimed that flashing "Eat Popcorn" and "Drink Coca-Cola" during movies boosted sales, but he later admitted he made up the data. Claims about secret backward messages in music were tested and debunked too. Subliminal stimuli can cause small, brief priming effects, but they do not control behavior.' },
      { type: 'cfu', q: { type: 'tf', id: '1.6A-c4', q: 'Research shows that subliminal ads can make people buy products they did not want.', a: false, why: 'False. Subliminal stimuli can produce brief, subtle priming effects, but there is no good evidence they can make people buy things or change lasting behavior.' } }
    ] },
    { kind: 'How it works', title: 'Adaptation and interaction', blocks: [
      { type: 'text', html: '{{Sensory adaptation}} is decreased sensitivity to a constant, unchanging stimulus. You stop feeling your watch, a bandage, or your clothes soon after putting them on. Your receptors fire less when nothing changes, which frees your attention for things that do.' },
      { type: 'widget', id: 'sensory-adaptation', caption: 'Keep a stimulus constant and watch the firing rate drop. Then try the staring demo.' },
      { type: 'text', html: [
        '{{Sensory interaction}} is when one sense influences another, like how smell affects taste. In the McGurk effect, what you see a person’s lips doing changes the sound you hear.',
        '{{Synesthesia}} is a rare condition where stimulating one sensory pathway causes an involuntary experience in another, like seeing colors when hearing music. {{Priming}} is when exposure to one stimulus influences how we perceive a later one.'
      ] },
      { type: 'cfu', q: { type: 'match', id: '1.6A-c5', q: 'Match each example to the concept.', pairs: [['You stop noticing the smell of your own house', 'Sensory adaptation'], ['Food tastes bland when you have a cold', 'Sensory interaction'], ['Hearing a trumpet makes you see orange', 'Synesthesia'], ['After seeing "yellow," you read "banana" faster', 'Priming']] } }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.6B', topic: '1.6', title: 'Vision', blurb: 'The eye, rods and cones, color theories, and visual disorders.',
  steps: [
    { kind: 'Big picture', title: 'Light in, sight out', blocks: [
      { type: 'hook', html: 'You never actually see light. You see what your brain builds from electrical signals. Your eye is a living camera that turns light waves into neural impulses through {{transduction}}: changing one form of energy into another.' },
      { type: 'table', head: ['Organ', 'Its receptors transduce'], rows: [['Eyes', 'Light waves'], ['Ears', 'Sound waves'], ['Tongue', 'Flavor molecules'], ['Nose', 'Scent molecules'], ['Skin', 'Pressure, temperature, and pain']] }
    ] },
    { kind: 'Anatomy', title: 'Parts of the eye', blocks: [
      { type: 'widget', id: 'eye-explorer', caption: 'Explore each part, trace the path of light, and try the near/far and nearsighted/farsighted toggles.' },
      { type: 'table', head: ['Part', 'Job'], rows: [
        ['{{Cornea}}', 'Clear outer layer that helps focus incoming light'],
        ['{{Pupil}}', 'Opening in the center that lets light in by getting bigger or smaller'],
        ['{{Iris}}', 'Colored muscle ring that changes the size of the pupil'],
        ['{{Lens}}', 'Flexible structure that changes shape ({{accommodation}}) to focus light on the retina'],
        ['{{Retina}}', 'Back surface where rods and cones turn light into neural signals'],
        ['{{Fovea}}', 'Center of the retina, packed with cones; sharpest vision for reading'],
        ['{{Optic nerve}}', 'Carries signals to the brain; where it leaves the eye there are no receptors, creating the {{blind spot}}']
      ] },
      { type: 'cfu', q: { type: 'order', id: '1.6B-c1', q: 'Trace light into the eye and the message to the brain.', items: ['Cornea', 'Pupil', 'Lens', 'Retina (rods and cones)', 'Optic nerve', 'Occipital lobe'] } }
    ] },
    { kind: 'Physiology', title: 'Rods, cones, and focusing', blocks: [
      { type: 'text', html: [
        '{{Rods}} detect light and work in dim light and in your peripheral vision. They see in black, white, and gray. {{Cones}} detect color and fine detail and are concentrated in the fovea. Memory trick: Cones see Color and Acuity.',
        'Photoreceptors pass signals to {{ganglion cells}}, whose axons bundle together into the optic nerve.'
      ] },
      { type: 'widget', id: 'rods-cones', caption: 'Dim the lights to see rods take over, then find your own blind spot.' },
      { type: 'text', h: 'When focus goes wrong', html: 'In {{nearsightedness}}, the image focuses in front of the retina, so distant objects are blurry. In {{farsightedness}}, the image focuses behind the retina, so near objects are blurry.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.6B-c2', q: 'At night, you can see a faint star better by looking slightly to the side of it. Why?', choices: ['Cones in the fovea are more sensitive to dim light.', 'Rods in the periphery are more sensitive to dim light.', 'The blind spot is in the fovea.', 'The lens accommodates in the dark.'], a: 1, why: 'Rods, which are better in dim light, are concentrated outside the fovea in the periphery.' },
        { type: 'mc', id: '1.6B-c3', q: 'Marco can read his phone clearly but can’t read the board from the back of class. His image is focusing', choices: ['behind the retina (farsighted)', 'in front of the retina (nearsighted)', 'on the blind spot', 'on the fovea perfectly'], a: 1, why: 'Clear near vision with blurry distance vision is nearsightedness: the image focuses in front of the retina.' }
      ] }
    ] },
    { kind: 'Physiology', title: 'Seeing color', blocks: [
      { type: 'text', html: [
        'The {{trichromatic theory}} (Young-Helmholtz) says the retina has three types of cones, most sensitive to red, green, and blue. Their combined activity creates every color we see. There is no yellow cone: when red and green cones fire together, we see yellow.',
        'The {{opponent-process theory}} (Hering) says that after the cones, cells process color in opposing pairs: red-green, blue-yellow, and black-white. Stimulating one side of a pair inhibits the other. This explains {{afterimages}}: stare at green and the red side rebounds when you look away.',
        'Both are right at different stages. Trichromatic processing happens in the cones of the retina; opponent processing happens in ganglion cells and on the way to the brain.'
      ] },
      { type: 'widget', id: 'color-lab', caption: 'Mix cone signals, try a color-deficient view, then stare at the flag and see the afterimage for yourself.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.6B-c4', q: 'After staring at a green, black, and yellow flag, Ella looks at a white wall and sees a red, white, and blue flag. Which theory best explains this?', choices: ['Trichromatic theory', 'Opponent-process theory', 'Place theory', 'Gate control theory'], a: 1, why: 'Afterimages appear in the opposing colors, which is what opponent-process theory predicts.' },
        { type: 'mc', id: '1.6B-c5', q: 'According to trichromatic theory, we see yellow when', choices: ['yellow cones fire', 'red and green cones are stimulated together', 'blue cones are inhibited', 'rods are stimulated in bright light'], a: 1, why: 'There are no yellow cones. Red plus green cone activity is perceived as yellow.' }
      ] }
    ] },
    { kind: 'Clinical connection', title: 'When vision is different', blocks: [
      { type: 'text', html: [
        'Most people with a color vision deficiency are not truly "color blind." In {{dichromatism}}, a person has only two working cone types; red-green deficiency is the most common. In {{monochromatism}}, two or more cone types are missing and the world appears in shades of gray.',
        'Red-green deficiency genes are carried on the X chromosome, so it is far more common in males (about 1 in 12) than in females.'
      ] },
      { type: 'clinical', h: 'Brain damage and vision', html: '{{Prosopagnosia}} (face blindness) is the inability to recognize faces, even familiar ones, often after damage to a face-processing area of the brain. In {{blindsight}}, damage to the visual cortex leaves a person unaware of seeing something, yet they can still point to it or avoid it, because other visual pathways still work.' },
      { type: 'cfu', q: { type: 'mc', id: '1.6B-c6', q: 'After a stroke, Mr. Lee can describe a person’s hair and glasses but cannot tell that the face belongs to his own daughter until she speaks. This is', choices: ['blindsight', 'prosopagnosia', 'monochromatism', 'nearsightedness'], a: 1, why: 'Being unable to recognize faces is prosopagnosia.' } }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.6C', topic: '1.6', title: 'Hearing', blurb: 'Sound waves, the ear, pitch theories, localization, and hearing loss.',
  steps: [
    { kind: 'Big picture', title: 'Air that you can hear', blocks: [
      { type: 'hook', html: 'In a crowded hallway full of voices, you can pick out your best friend saying your name. Your ears are detecting tiny changes in air pressure, and your brain is sorting them in milliseconds. That is {{audition}}, the formal name for hearing.' },
      { type: 'text', html: [
        'Sound waves are bands of compressed and expanded air. Their {{amplitude}} (height) is perceived as loudness, measured in {{decibels}}. Their {{frequency}} (waves per second) is perceived as pitch, measured in {{hertz}}. Shorter {{wavelengths}} mean higher frequency and higher pitch.'
      ] },
      { type: 'widget', id: 'sound-wave', caption: 'Change amplitude and frequency, play the tone, and watch where the basilar membrane responds.' },
      { type: 'cfu', q: { type: 'match', id: '1.6C-c1', q: 'Match the wave property to what we hear.', pairs: [['Amplitude', 'Loudness (decibels)'], ['Frequency', 'Pitch (hertz)'], ['Short wavelength', 'High pitch'], ['Long wavelength', 'Low pitch']] } }
    ] },
    { kind: 'Anatomy', title: 'The path of sound', blocks: [
      { type: 'widget', id: 'ear-explorer', caption: 'Follow the sound from the pinna to the brain and notice where the energy changes form.' },
      { type: 'table', head: ['Region', 'Parts', 'Job'], rows: [
        ['Outer ear', 'Pinna, ear canal, {{eardrum}}', 'Collect and funnel sound; the eardrum vibrates'],
        ['Middle ear', '{{Ossicles}} (hammer, anvil, stirrup), eustachian tube', 'Amplify vibrations; the eustachian tube equalizes pressure (ears "pop")'],
        ['Inner ear', '{{Cochlea}}, basilar membrane, {{hair cells}}, {{auditory nerve}}', 'Fluid waves bend hair cells, which transduce vibration into neural signals']
      ] },
      { type: 'cfu', q: { type: 'order', id: '1.6C-c2', q: 'Put the path of sound in order.', items: ['Pinna and ear canal', 'Eardrum', 'Ossicles', 'Cochlea fluid and hair cells', 'Auditory nerve', 'Temporal lobe'] } }
    ] },
    { kind: 'Physiology', title: 'How do we hear pitch?', blocks: [
      { type: 'text', html: [
        '{{Place theory}}: different frequencies stimulate different places along the basilar membrane, like keys on a piano. It best explains high-pitched sounds.',
        '{{Frequency theory}} (temporal theory): the auditory nerve fires at the same rate as the sound wave. A 100 Hz tone makes the nerve fire 100 times per second. It best explains low-pitched sounds.',
        '{{Volley theory}}: a single neuron cannot fire faster than about 1,000 times a second because of its refractory period, so groups of neurons take turns firing in rapid succession. This explains pitches in the middle range, roughly 1,000 to 4,000 Hz.'
      ] },
      { type: 'cfu', q: { type: 'mc', id: '1.6C-c3', q: 'A tuba plays a very low 60 Hz note. Which theory best explains how we hear its pitch?', choices: ['Place theory', 'Frequency theory', 'Opponent-process theory', 'Gate control theory'], a: 1, why: 'For low pitches, the auditory nerve can fire at the same rate as the wave: frequency theory.' } }
    ] },
    { kind: 'Function', title: 'Where did that sound come from?', blocks: [
      { type: 'text', html: '{{Sound localization}} lets us figure out where a sound is coming from. If a car honks on your right, your right ear hears it slightly louder and slightly sooner than your left ear. Your brain uses those tiny differences in intensity and timing to locate the sound.' },
      { type: 'widget', id: 'sound-localization', caption: 'Move the car around the head and compare what each ear receives.' },
      { type: 'cfu', q: { type: 'mc', id: '1.6C-c4', q: 'Why is it hard to tell whether a sound is directly in front of you or directly behind you?', choices: ['Both ears receive it at the same time and loudness.', 'The cochlea only works for sounds from the side.', 'Sounds from behind are always quieter.', 'The eardrum cannot vibrate from behind.'], a: 0, why: 'Localization relies on differences between the ears. A sound straight ahead or behind reaches both ears equally.' } }
    ] },
    { kind: 'Clinical connection', title: 'Hearing loss', blocks: [
      { type: 'text', html: '{{Conduction deafness}} is caused by problems conducting sound to the cochlea, like a damaged eardrum, damaged ossicles, or obstructions. {{Sensorineural deafness}} comes from damage to the cochlea’s hair cells or the auditory nerve, often from loud noise or aging.' },
      { type: 'widget', id: 'hearing-loss', caption: 'Damage different parts of the ear and see which type of hearing loss results and what can help.' },
      { type: 'clinical', h: 'Cochlear implants', html: 'A {{cochlear implant}} turns sound into electrical signals that stimulate the auditory nerve directly, bypassing damaged hair cells. Videos of people hearing for the first time after an implant is switched on show how powerful this can be.' },
      { type: 'cfu', q: { type: 'mc', id: '1.6C-c5', q: 'Years of concerts without ear protection destroyed many of DeShawn’s hair cells. He has', choices: ['conduction deafness, which a cochlear implant cannot help', 'sensorineural deafness, which a cochlear implant may help', 'conduction deafness caused by the ossicles', 'a problem with sound localization only'], a: 1, why: 'Hair cell damage is sensorineural. A cochlear implant bypasses the hair cells to stimulate the auditory nerve.' } }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.6D', topic: '1.6', title: 'Smell, Taste, Touch & Pain', blurb: 'Chemical senses, skin receptors, gate control, and phantom limbs.',
  steps: [
    { kind: 'Big picture', title: 'The chemical senses', blocks: [
      { type: 'hook', html: 'One whiff of a certain cologne, or a grandparent’s kitchen, and you are suddenly flooded with a memory. Smell is the only sense with a direct line to the brain’s emotion and memory centers.' },
      { type: 'text', html: [
        'Taste and smell are both chemical senses: we physically contact chemicals in the air and in our food.',
        'In {{olfaction}}, scent molecules dissolve in the mucus at the top of the nasal cavity and stimulate olfactory receptors, which signal the olfactory bulb. Unlike other senses, smell bypasses the {{thalamus}} and goes straight to the limbic system and olfactory cortex, which is why smells trigger emotional memories. {{Pheromones}} are chemical signals released by animals that trigger social or behavioral responses in others.'
      ] },
      { type: 'cfu', q: { type: 'mc', id: '1.6D-c1', q: 'Why can a smell bring back a vivid emotional memory more easily than a sound can?', choices: ['Smell signals go directly to limbic areas without passing through the thalamus.', 'Smell receptors are in the cochlea.', 'Smell is processed only in the occipital lobe.', 'Sounds never reach the hippocampus.'], a: 0, why: 'Olfactory signals skip the thalamus and reach emotion and memory areas directly.' } }
    ] },
    { kind: 'Physiology', title: 'Taste', blocks: [
      { type: 'text', html: [
        '{{Gustation}} is the sense of taste. {{Taste receptors}} inside taste buds detect chemicals dissolved in saliva and send signals to the brain.',
        'The five basic tastes each had survival value: sweet (energy), sour (possible spoilage), salty (sodium the body needs), bitter (possible toxins), and {{umami}} (savory, linked to proteins). {{Oleogustus}} is a newer, proposed taste for fat.',
        '{{Supertasters}} have more taste buds and are very sensitive, especially to bitter flavors. Most people are {{medium tasters}}. {{Nontasters}} have fewer taste buds and reduced sensitivity.'
      ] },
      { type: 'widget', id: 'taste-lab', caption: 'Sort foods by taste, compare taster types, and hold your nose to see how much flavor depends on smell.' },
      { type: 'cfu', q: { type: 'mc', id: '1.6D-c2', q: 'Priya finds broccoli and black coffee unbearably bitter, while her brother barely notices. Priya is most likely a', choices: ['nontaster', 'medium taster', 'supertaster', 'dichromat'], a: 2, why: 'Supertasters have more taste buds and are especially sensitive to bitter flavors.' } }
    ] },
    { kind: 'Anatomy', title: 'Touch', blocks: [
      { type: 'text', html: [
        'Your skin contains specialized receptors. {{Mechanoreceptors}} detect pressure and texture. {{Thermoreceptors}} detect changes in temperature. {{Nociceptors}} detect pain from potential tissue damage.',
        'Touch signals travel through the spinal cord to the thalamus, which relays them to the {{somatosensory cortex}} in the parietal lobe. Remember the homunculus: hands and lips get the most cortex because they are the most sensitive.'
      ] },
      { type: 'widget', id: 'skin-receptors', caption: 'Touch the skin with each object and see which receptors fire.' },
      { type: 'cfu', q: { type: 'match', id: '1.6D-c3', q: 'Match each receptor to what it detects.', pairs: [['Mechanoreceptors', 'Pressure and texture'], ['Thermoreceptors', 'Temperature'], ['Nociceptors', 'Pain (tissue damage)']] } }
    ] },
    { kind: 'Physiology', title: 'Pain', blocks: [
      { type: 'text', html: [
        'Pain is the body’s alarm that something has gone wrong. Nociceptors send signals to the thalamus, which relays them to the somatosensory cortex (where and how intense) and to the limbic system (how it feels emotionally). People born with a rare condition (CIPA) cannot feel pain and are often badly injured without knowing it.',
        '{{Gate control theory}} says the spinal cord has a neurological "gate" that blocks or lets through pain signals. Small fibers carry pain; large fibers carry other touch signals. Rubbing a sore spot activates large fibers and closes the gate. The brain can close it too, through distraction or relaxation.'
      ] },
      { type: 'widget', id: 'gate-control', caption: 'Open and close the pain gate with rubbing, distraction, and focus.' },
      { type: 'text', h: 'Controlling pain', html: 'Physical methods include medications, surgery, acupuncture, electrical stimulation, massage, and exercise. Psychological methods include hypnosis, relaxation, meditation, and distraction. Even a placebo can dampen pain. Burn patients who explore virtual reality during painful treatment report less pain. This is the {{biopsychosocial}} view of pain: biology, psychology, and social context all shape how much it hurts.' },
      { type: 'clinical', h: 'Phantom limbs', html: '{{Phantom limb sensation}} is feeling sensations, even pain, in a limb that has been amputated. The brain’s sensory map still includes the missing limb and can "misfire," producing feelings as if it were still there.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.6D-c4', q: 'After stubbing his toe, Ethan rubs it hard and it hurts less. Which theory explains this?', choices: ['Gate control theory', 'Opponent-process theory', 'Place theory', 'Activation-synthesis theory'], a: 0, why: 'Rubbing activates large fibers that close the spinal "gate" to pain signals.' },
        { type: 'mc', id: '1.6D-c5', q: 'A veteran feels an itch in a hand that was amputated years ago. This happens because', choices: ['the nociceptors in the missing hand are still active', 'the brain’s map of the body still includes the hand', 'the gate in the spinal cord is closed', 'the thalamus has stopped relaying touch'], a: 1, why: 'Phantom limb sensations come from the brain’s sensory map, which still represents the missing limb.' }
      ] }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.6E', topic: '1.6', title: 'Balance & Body Position', blurb: 'The vestibular sense and kinesthesis.',
  steps: [
    { kind: 'Big picture', title: 'Your hidden senses', blocks: [
      { type: 'hook', html: 'Close your eyes and touch your nose. You just used a sense most people never think about. Spin in a circle and stop, and the room keeps spinning thanks to another. These are your body senses.' },
      { type: 'text', html: [
        'The {{vestibular sense}} detects head movement and position relative to gravity. It helps you keep your balance, posture, and spatial orientation for smooth, coordinated movement like walking and standing.',
        'It comes from the {{semicircular canals}}: three fluid-filled tubes in the inner ear, each oriented in a different plane (horizontal, vertical, and diagonal) to detect tilting, spinning, and turning. When your head moves, the fluid moves and bends tiny hair cells, which signal the brain about direction and speed.'
      ] },
      { type: 'widget', id: 'vestibular', caption: 'Spin the head, stop it, and watch the fluid keep moving. Then try the kinesthesis challenge.' },
      { type: 'text', html: [
        'Dizziness after spinning happens because the fluid keeps moving after you stop, so your brain thinks you are still turning. {{Vertigo}} is a spinning sensation when the vestibular system sends signals that conflict with your other senses.',
        '{{Kinesthesis}} is your sense of the position and movement of your muscles, joints, and limbs. It lets you know where your body parts are without looking.'
      ] },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.6E-c1', q: 'A figure skater spins fast, stops, and keeps her balance while everyone watching feels dizzy just looking. Which structures detect the spin?', choices: ['Cochlea', 'Semicircular canals', 'Ossicles', 'Retina'], a: 1, why: 'The semicircular canals in the inner ear detect head rotation.' },
        { type: 'mc', id: '1.6E-c2', q: 'You can type on a keyboard without looking at your fingers. This is mostly thanks to', choices: ['kinesthesis', 'the vestibular sense', 'sensory adaptation', 'synesthesia'], a: 0, why: 'Kinesthesis tells you the position and movement of your body parts.' },
        { type: 'sort', id: '1.6E-c3', q: 'Vestibular or kinesthetic?', bins: ['Vestibular sense', 'Kinesthesis'], items: [
          { t: 'Feeling dizzy after a merry-go-round', bin: 0 }, { t: 'Staying upright on a tilting boat', bin: 0 }, { t: 'Sensing your head tilt back', bin: 0 },
          { t: 'Knowing your arm is raised with eyes closed', bin: 1 }, { t: 'Touching your nose in the dark', bin: 1 }, { t: 'Feeling how bent your knee is', bin: 1 }] }
      ] }
    ] }
  ]
});
