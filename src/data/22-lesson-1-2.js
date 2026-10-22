/* Lesson 1.2 Overview of the Nervous System */
ML.data.lessons.push({
  id: '1.2', topic: '1.2', title: 'The Nervous System', blurb: 'Map the body’s communication network, division by division.',
  steps: [
    { kind: 'Big picture', title: 'Your body’s control network', blocks: [
      { type: 'hook', h: 'There’s a spider on your arm', html: 'Before you even decide to, you flinch. Your heart jumps, your breath catches, your hand flicks the spider away, and a second later your brain catches up: "Was that a spider?!" In that one moment, almost every division of your nervous system did its job.' },
      { type: 'text', html: 'Think of the {{nervous system}} as the ultimate communication network of your body, like the control center of a massive video game. It manages everything from your reaction time to your heartbeat. It is divided into subsystems, each with a specific job, that work together to keep you alive, moving, and feeling.' },
      { type: 'widget', id: 'ns-tree', caption: 'Tap each division to learn its job. Then switch to quiz mode and place real-life moments in the right division.' },
      { type: 'cfu', q: { type: 'order', id: '1.2-c1', q: 'Put the divisions in order from the biggest system to the most specific branch on the fight-or-flight side.', items: ['Nervous system', 'Peripheral nervous system', 'Autonomic nervous system', 'Sympathetic nervous system'], why: 'The nervous system splits into the CNS and PNS. The PNS splits into somatic and autonomic. The autonomic splits into sympathetic and parasympathetic.' } }
    ] },
    { kind: 'Structure', title: 'The central nervous system', blocks: [
      { type: 'text', html: 'The {{central nervous system}} (CNS) is the {{brain}} and {{spinal cord}}. It is the body’s command center: it integrates sensory input and coordinates bodily functions.' },
      { type: 'text', h: 'Reflexes: the CNS in action', html: 'A {{reflex}} is an automatic, rapid, involuntary response to a specific stimulus, with no conscious thought. The knee-jerk and the eye blink are classic reflexes. The spinal cord can process the message and trigger a response before the brain consciously knows what happened.' },
      { type: 'widget', id: 'reflex-arc', caption: 'Touch the hot stove and follow the signal. Notice when the brain finally feels the pain.' },
      { type: 'analogy', h: 'Think about the jobs', html: 'PNS = communication. It detects something through sensory receptors, carries the information to the CNS, and carries commands back out to muscles and glands.<br>CNS = processing and coordination. It figures out what to do and coordinates the response.' },
      { type: 'cfu', qs: [
        { type: 'order', id: '1.2-c2', q: 'Put the steps of the hot-stove reflex in order.', items: ['Skin receptors detect heat', 'Sensory neuron carries the message to the spinal cord', 'Interneuron in the spinal cord connects the message', 'Motor neuron carries a command to the arm muscles', 'Hand pulls away', 'The brain registers pain'] },
        { type: 'mc', id: '1.2-c3', q: 'Why is a reflex so fast?', choices: ['The brain processes it before any other signal.', 'The spinal cord coordinates the response without waiting for conscious thought.', 'Reflexes use hormones instead of neurons.', 'Motor neurons fire faster than sensory neurons.'], a: 1, why: 'The pathway goes PNS → spinal cord → PNS. Skipping conscious processing in the brain saves precious time.' }
      ] }
    ] },
    { kind: 'Structure', title: 'The peripheral nervous system', blocks: [
      { type: 'text', html: [
        'The {{peripheral nervous system}} (PNS) is all the nerves outside the brain and spinal cord. {{Nerves}} are bundles of axons that act like cables connecting the CNS to muscles, glands, and sense organs.',
        '{{Sensory}} (afferent) nerves carry information from inside and outside the body TO the CNS. {{Motor}} (efferent) nerves carry commands FROM the CNS out to the muscles and glands.'
      ] },
      { type: 'analogy', h: 'Memory trick: SAME', html: '<b>S</b>ensory = <b>A</b>fferent (arrives at the CNS). <b>M</b>otor = <b>E</b>fferent (exits the CNS).' },
      { type: 'text', html: 'The PNS has two divisions. The {{somatic}} nervous system controls voluntary movements of the skeletal muscles, like dancing or drawing. The {{autonomic}} nervous system controls involuntary actions like heartbeat, digestion, and breathing.' },
      { type: 'cfu', q: { type: 'sort', id: '1.2-c4', q: 'Somatic (voluntary) or autonomic (involuntary)?', bins: ['Somatic', 'Autonomic'], items: [
        { t: 'Kicking a soccer ball', bin: 0 }, { t: 'Typing a text', bin: 0 }, { t: 'Raising your hand', bin: 0 },
        { t: 'Your heart speeding up', bin: 1 }, { t: 'Digesting lunch', bin: 1 }, { t: 'Pupils widening in the dark', bin: 1 }] } }
    ] },
    { kind: 'How it works', title: 'Fight-or-flight and rest-and-digest', blocks: [
      { type: 'text', html: [
        'The autonomic nervous system has two parts that work like a gas pedal and a brake.',
        'The {{sympathetic}} nervous system excites. It arouses the body for {{fight-or-flight}}: heart rate and breathing rise, pupils dilate, digestion slows, and energy is released. The {{parasympathetic}} nervous system calms. It conserves energy (rest-and-digest) and returns the body to {{homeostasis}}, a steady balanced state.'
      ] },
      { type: 'widget', id: 'fight-or-flight', caption: 'Release the bear, then bring the body back to calm. Watch which division takes control.' },
      { type: 'table', head: ['Body function', 'Sympathetic (arouses)', 'Parasympathetic (calms)'], rows: [
        ['Heart rate', 'Speeds up', 'Slows down'], ['Breathing', 'Faster', 'Slower'], ['Pupils', 'Dilate', 'Constrict'], ['Digestion', 'Slows', 'Resumes'], ['Sweating', 'Increases', 'Decreases']] },
      { type: 'cfu', q: { type: 'sort', id: '1.2-c5', q: 'Which division is in charge?', bins: ['Sympathetic', 'Parasympathetic'], items: [
        { t: 'Butterflies before a big game', bin: 0 }, { t: 'Heart pounding at a jump scare', bin: 0 }, { t: 'Sweaty palms during a speech', bin: 0 },
        { t: 'Heart rate slowing after a workout', bin: 1 }, { t: 'Calm breathing during mindfulness', bin: 1 }, { t: 'Stomach digesting after dinner', bin: 1 }] } }
    ] },
    { kind: 'Application', title: 'Your nervous system in real life', blocks: [
      { type: 'apply', h: 'Before and after', html: 'Before a big game, your sympathetic nervous system kicks in when you get excited or nervous: butterflies in your stomach, heart racing. After a workout, your parasympathetic nervous system helps you relax, slowing your heart rate so your body can recover.' },
      { type: 'reveal', q: 'Think of a time you felt your sympathetic and parasympathetic systems in action. What did your body do during the event, and how did it calm down after?', a: 'A strong answer names the event, lists physical responses (racing heart, quick breathing, sweaty hands, tense muscles) and says the sympathetic system caused them. Then it describes calming down (slower heart and breathing, feeling hungry or tired) and credits the parasympathetic system for returning the body to homeostasis.', btn: 'See what a strong answer includes' },
      { type: 'clinical', h: 'Spinal cord injury', html: 'If the spinal cord is severed, messages between the brain and body below the injury cannot get through, causing loss of sensation and voluntary movement there. Yet some reflexes below the injury can still happen, because the spinal cord itself coordinates them.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.2-c6', q: 'Maya hears a loud crash at night. Her heart pounds and her pupils dilate. Which part of her nervous system is most active?', choices: ['Somatic nervous system', 'Parasympathetic nervous system', 'Sympathetic nervous system', 'Central nervous system only'], a: 2, why: 'A pounding heart and dilated pupils are the fight-or-flight response, run by the sympathetic division of the autonomic nervous system.' },
        { type: 'mc', id: '1.2-c7', q: 'Which pairing is correct?', choices: ['Afferent neurons: carry commands to muscles', 'Somatic nervous system: controls heartbeat', 'Efferent neurons: carry commands away from the CNS', 'Parasympathetic: prepares for fight-or-flight'], a: 2, why: 'Efferent (motor) neurons exit the CNS to muscles and glands. Afferent (sensory) neurons arrive at the CNS.' }
      ] }
    ] }
  ]
});
