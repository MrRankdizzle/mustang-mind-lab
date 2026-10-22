/* Lessons 1.3A Neurons, 1.3B Neural firing + neurotransmitters + hormones, 1.3C Psychoactive drugs */
ML.data.lessons.push({
  id: '1.3A', topic: '1.3', title: 'The Neuron', blurb: 'Parts of a neuron, glial cells, and the three types of neurons.',
  steps: [
    { kind: 'Big picture', title: 'The brain’s communication lines', blocks: [
      { type: 'hook', html: 'Every time you think, move, or feel something, about 86 billion neurons are at work. Each one is a tiny messenger passing signals along at up to 120 meters per second. Right now, reading this sentence, millions of them are firing.' },
      { type: 'text', html: [
        '{{Neurons}} are specialized cells that process and transmit electrical and chemical signals to other neurons, muscles, or glands. Some signals are excitatory (they stimulate the next cell) and some are inhibitory (they decrease or slow activity).',
        '{{Glial cells}} are the brain’s support staff. They protect, give structure, nourish, and clean up after neurons. Glia help form the {{blood-brain barrier}}, build the {{myelin sheath}}, and produce cerebrospinal fluid.'
      ] },
      { type: 'analogy', h: 'Think of it like a movie', html: 'Neurons are the stars of the brain’s movie. Glial cells are the directors, producers, and backstage crew who make everything run smoothly.' },
      { type: 'reveal', q: 'What does the blood-brain barrier do?', a: 'It is a protective lining of tightly packed cells around the brain’s blood vessels that lets nutrients in but keeps many harmful substances in the blood out of the brain.' },
      { type: 'cfu', q: { type: 'mc', id: '1.3A-c1', q: 'Which job belongs to glial cells, not neurons?', choices: ['Sending action potentials down an axon', 'Releasing neurotransmitters into the synapse', 'Forming the myelin sheath and cleaning up waste', 'Receiving messages through dendrites'], a: 2, why: 'Glia support neurons: they insulate axons with myelin, nourish, protect, and clean up.' } }
    ] },
    { kind: 'Anatomy', title: 'Parts of a neuron', blocks: [
      { type: 'text', html: 'A message travels through a neuron in one direction: in through the dendrites, through the cell body, down the axon, and out the axon terminals.' },
      { type: 'widget', id: 'neuron-anatomy', caption: 'Explore each part, press Fire to send an impulse, then switch to quiz mode.' },
      { type: 'table', head: ['Part', 'Job', 'Memory hook'], rows: [
        ['{{Dendrites}}', 'Receive incoming signals from other neurons', 'Branches that catch messages, like antennas'],
        ['{{Cell body}} (soma)', 'Control center; holds the nucleus and keeps the cell alive', 'The headquarters'],
        ['{{Axon}}', 'Long fiber that carries the signal away from the cell body', 'Axon = away'],
        ['{{Myelin sheath}}', 'Fatty insulation that speeds up the signal', 'Like the rubber coating on a wire'],
        ['{{Axon terminals}}', 'Branched endings that release neurotransmitters', 'The send button']
      ] },
      { type: 'cfu', q: { type: 'match', id: '1.3A-c2', q: 'Match each neuron part to its job.', pairs: [['Dendrites', 'Receive messages'], ['Cell body', 'Contains the nucleus'], ['Axon', 'Carries the signal away'], ['Myelin sheath', 'Speeds up the signal'], ['Axon terminals', 'Release neurotransmitters']] } }
    ] },
    { kind: 'Physiology', title: 'The synapse: where the magic happens', blocks: [
      { type: 'text', html: [
        'Neurons do not actually touch. The {{synapse}} is the tiny gap between the axon terminal of one neuron and the dendrite of the next, where chemical communication happens.',
        'Inside the axon terminals, {{synaptic vesicles}} are little sacs that store chemical messengers called neurotransmitters. When the signal arrives, the vesicles release them into the synapse. You will see the full process in the next lesson.'
      ] },
      { type: 'cfu', q: { type: 'order', id: '1.3A-c3', q: 'Trace a message through a neuron and on to the next one.', items: ['Dendrites', 'Cell body', 'Axon', 'Axon terminals', 'Synapse', 'Next neuron’s dendrites'] } }
    ] },
    { kind: 'Structure', title: 'Three types of neurons', blocks: [
      { type: 'text', html: [
        '{{Sensory neurons}} (afferent) carry information from the body’s receptors to the CNS. {{Motor neurons}} (efferent) carry commands from the CNS out to muscles and glands. {{Interneurons}} live in the brain and spinal cord and connect the two, processing the information in between.',
        'Sensory and motor neurons make up the PNS. Interneurons are in the CNS. Together they form the {{reflex arc}}: sensory neuron → interneuron → motor neuron.'
      ] },
      { type: 'cfu', qs: [
        { type: 'sort', id: '1.3A-c4', q: 'Which type of neuron is described?', bins: ['Sensory (afferent)', 'Interneuron', 'Motor (efferent)'], items: [
          { t: 'Carries a "hot!" message from your fingertip', bin: 0 }, { t: 'Detects light in your eye and sends it in', bin: 0 },
          { t: 'Connects messages inside the spinal cord', bin: 1 }, { t: 'Processes information in the brain', bin: 1 },
          { t: 'Tells your leg muscle to kick', bin: 2 }, { t: 'Signals a gland to release sweat', bin: 2 }] },
        { type: 'mc', id: '1.3A-c5', q: 'Interneurons are found mainly in the', choices: ['peripheral nervous system', 'central nervous system', 'skeletal muscles', 'sensory receptors in the skin'], a: 1, why: 'Interneurons are in the brain and spinal cord (the CNS), where they connect sensory input to motor output.' }
      ] }
    ] },
    { kind: 'Clinical connection', title: 'When neurons break down', blocks: [
      { type: 'clinical', h: 'Multiple sclerosis (MS)', html: 'In {{multiple sclerosis}}, the immune system attacks the myelin sheath and replaces it with hard scar tissue ("sclerosis" means hardening). Signals slow down or get scrambled, causing problems like numbness, weakness, and trouble with vision or balance.' },
      { type: 'clinical', h: 'ALS', html: '{{ALS}} (amyotrophic lateral sclerosis) is a chronic condition that kills the motor neurons in the brain and spinal cord. Motor neurons normally carry signals to voluntary muscles, so as they are lost, the brain has more and more trouble communicating with the muscles.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.3A-c6', q: 'A patient’s neural signals are traveling much more slowly than normal because the insulation on her axons is damaged. Which condition fits best?', choices: ['ALS', 'Multiple sclerosis', 'Myasthenia gravis', 'Parkinson’s disease'], a: 1, why: 'MS damages the myelin sheath, which normally speeds up neural impulses.' },
        { type: 'mc', id: '1.3A-c7', q: 'ALS gradually weakens voluntary muscles because it destroys', choices: ['sensory neurons', 'glial cells in the eye', 'motor neurons', 'the corpus callosum'], a: 2, why: 'Motor neurons carry commands to muscles. When they die, the muscles stop getting the message.' }
      ] }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.3B', topic: '1.3', title: 'Neural Firing & Chemical Messengers', blurb: 'Action potentials, neurotransmitters, and hormones.',
  steps: [
    { kind: 'Big picture', title: 'Electric inside, chemical between', blocks: [
      { type: 'hook', html: 'Your neurons run on electricity and chemistry at the same time. Inside a neuron the message is electrical. To cross to the next neuron, it turns chemical. Then it turns electrical again. That is why neural communication is called an {{electrochemical}} process.' },
      { type: 'text', html: 'In this lesson you will fire a neuron yourself, watch chemicals cross the synapse, and meet the body’s slower messaging service: the endocrine system.' }
    ] },
    { kind: 'Physiology', title: 'Part 1: the action potential', blocks: [
      { type: 'text', html: [
        'At rest, a neuron sits at its {{resting potential}}, about −70 millivolts (mV). Inside are mostly potassium ions (K+); outside are mostly sodium ions (Na+). The neuron is "loaded" and ready.',
        'Incoming signals nudge the charge up. If the charge reaches the {{threshold}} (about −55 mV), sodium gates open and Na+ rushes in. This {{depolarization}} makes the inside positive, and an {{action potential}} races down the axon.',
        'After firing, potassium flows out, the neuron resets during the {{refractory period}}, and it cannot fire again until it recovers.'
      ] },
      { type: 'widget', id: 'action-potential', caption: 'Stimulate the neuron. Find the threshold, then try a huge stimulus. Does the spike get bigger?' },
      { type: 'note', h: 'All-or-nothing', html: 'The {{all-or-nothing principle}} says a neuron either fires at full strength or not at all. There is no half action potential. A stronger stimulus makes a neuron fire more often, not harder.' },
      { type: 'cfu', qs: [
        { type: 'order', id: '1.3B-c1', q: 'Put the events of neural firing in order.', items: ['Resting potential (−70 mV)', 'Stimulation reaches threshold', 'Sodium rushes in (depolarization)', 'Action potential travels down the axon', 'Refractory period while the neuron resets'] },
        { type: 'mc', id: '1.3B-c2', q: 'Jordan presses harder on a pin. Why does it feel more intense even though each action potential is the same size?', choices: ['Each action potential becomes larger.', 'Neurons fire more often, and more neurons fire.', 'The refractory period gets longer.', 'The resting potential becomes positive.'], a: 1, why: 'Because of the all-or-nothing principle, intensity is coded by how often neurons fire and how many fire, not by bigger spikes.' }
      ] }
    ] },
    { kind: 'Physiology', title: 'Part 2: crossing the synapse', blocks: [
      { type: 'text', html: [
        'When the action potential reaches the axon terminals, vesicles release {{neurotransmitters}} into the synapse. The message has changed from electrical to chemical (electrical → chemical → electrical).',
        'Neurotransmitters cross the gap and bind to receptor sites on the next neuron like a key in a lock. Afterward, the leftovers are cleared three ways: {{reuptake}} (the sending neuron reabsorbs them), diffusion (they drift away), or enzymes break them down. For example, the enzyme monoamine oxidase (MAO) breaks down serotonin, dopamine, and norepinephrine.'
      ] },
      { type: 'widget', id: 'synapse-sim', caption: 'Start in Normal mode and watch the full cycle. You will use the other modes in the drugs lesson.' },
      { type: 'analogy', h: 'Who decides which chemical?', html: 'Each neuron is set up to make and release particular neurotransmitters, using instructions from your genes. It does not decide in the moment, "I need serotonin now." The neuron decides WHAT messenger it uses. The action potential decides WHEN it releases it.' },
      { type: 'cfu', q: { type: 'mc', id: '1.3B-c3', q: 'Which process returns excess neurotransmitter to the neuron that released it?', choices: ['Depolarization', 'Reuptake', 'Refractory period', 'Threshold'], a: 1, why: 'In reuptake, the sending neuron reabsorbs leftover neurotransmitter from the synapse.' } }
    ] },
    { kind: 'Function', title: 'Meet the neurotransmitters', blocks: [
      { type: 'text', html: '{{Excitatory}} neurotransmitters make the next neuron more likely to fire. {{Inhibitory}} neurotransmitters make it less likely to fire. Collect the cards below. These are the neurotransmitters and hormones the AP exam can ask about.' },
      { type: 'widget', id: 'nt-cards', caption: 'Flip each card. Look for each chemical’s main job and what happens with too much or too little.' },
      { type: 'table', h: 'Quick reference', head: ['Neurotransmitter', 'Mostly', 'Main job', 'When it goes wrong'], rows: [
        ['Dopamine', 'Excitatory', 'Reward, motivation, movement', 'Too little: Parkinson’s. Too much: linked to schizophrenia'],
        ['Norepinephrine', 'Excitatory', 'Alertness and arousal', 'Too little: linked to depressed mood'],
        ['Glutamate', 'Excitatory', 'Most common; learning and memory', 'Too much: overexcites the brain (migraines, seizures)'],
        ['Acetylcholine', 'Excitatory', 'Muscle contraction; memory', 'Lost in Alzheimer’s; receptors attacked in myasthenia gravis'],
        ['Substance P', 'Excitatory', 'Carries pain signals; inflammation', 'High levels: chronic pain conditions'],
        ['GABA', 'Inhibitory', 'Main calming chemical', 'Too little: anxiety, seizures'],
        ['Serotonin', 'Inhibitory', 'Mood, hunger, sleep', 'Too little: linked to depression (SSRIs boost it)'],
        ['Endorphins', 'Inhibitory', 'Natural painkillers', 'Opioids mimic them']
      ] },
      { type: 'cfu', qs: [
        { type: 'sort', id: '1.3B-c4', q: 'Excitatory or inhibitory?', bins: ['Excitatory', 'Inhibitory'], items: [
          { t: 'Glutamate', bin: 0 }, { t: 'Norepinephrine', bin: 0 }, { t: 'Acetylcholine', bin: 0 }, { t: 'Substance P', bin: 0 },
          { t: 'GABA', bin: 1 }, { t: 'Serotonin', bin: 1 }, { t: 'Endorphins', bin: 1 }] },
        { type: 'mc', id: '1.3B-c5', q: 'A runner feels a rush of pleasure and less pain near the end of a long race. Which neurotransmitter is most responsible?', choices: ['Substance P', 'Endorphins', 'Glutamate', 'Acetylcholine'], a: 1, why: 'Endorphins are the body’s natural painkillers, behind the "runner’s high."' },
        { type: 'mc', id: '1.3B-c6', q: 'People with Parkinson’s disease have tremors and trouble starting movements. This is linked to the loss of neurons that produce', choices: ['serotonin', 'dopamine', 'GABA', 'endorphins'], a: 1, why: 'Parkinson’s involves the loss of dopamine-producing neurons. L-dopa helps the brain make more dopamine.' }
      ] }
    ] },
    { kind: 'Function', title: 'The endocrine system: hormones at work', blocks: [
      { type: 'text', html: [
        'The {{endocrine system}} is a slower communication system. Its glands release {{hormones}}, chemical messengers that travel through the bloodstream and affect behavior and mood.',
        'The hypothalamus in the brain controls the {{pituitary gland}}, the "master gland" whose hormones direct other glands.'
      ] },
      { type: 'widget', id: 'text-vs-postcard', caption: 'Send both messages and compare speed, reach, and how long the effect lasts.' },
      { type: 'table', head: ['Hormone', 'What it does'], rows: [
        ['{{Adrenaline}} (epinephrine)', 'Increases heart rate and energy for fight-or-flight'],
        ['{{Oxytocin}}', 'Influences bonding, trust, and social behavior'],
        ['{{Leptin}}', 'From fat cells; signals fullness and decreases hunger'],
        ['{{Ghrelin}}', 'From the stomach; stimulates hunger ("ghrelin growls")'],
        ['{{Melatonin}}', 'Regulates the sleep-wake cycle; rises when it gets dark']
      ] },
      { type: 'widget', id: 'hunger-hormones', caption: 'Push each hormone up and watch the hypothalamus change your hunger.' },
      { type: 'cfu', qs: [
        { type: 'match', id: '1.3B-c7', q: 'Match each hormone to its effect.', pairs: [['Ghrelin', 'Makes you hungry'], ['Leptin', 'Signals you are full'], ['Melatonin', 'Makes you sleepy'], ['Oxytocin', 'Promotes bonding'], ['Adrenaline', 'Fuels fight-or-flight']] },
        { type: 'mc', id: '1.3B-c8', q: 'Compared with neurotransmitters, hormones', choices: ['act faster and more briefly', 'travel through the bloodstream and act more slowly but last longer', 'only affect one neighboring neuron', 'are released only by the spinal cord'], a: 1, why: 'Neurotransmitters are like text messages; hormones are like postcards. Slower, but the message lasts.' }
      ] }
    ] },
    { kind: 'Clinical connection', title: 'When the messengers misfire', blocks: [
      { type: 'text', h: 'What causes too much or too little?', html: 'Genetics can affect how much neurotransmitter is made or how receptors work. Brain disorders can destroy the neurons that make a chemical (like dopamine in Parkinson’s). Drugs can change release, binding, or cleanup. Stress and experience matter too. And even a normal amount can act like too much or too little if receptors or enzymes do not work properly.' },
      { type: 'clinical', h: 'Myasthenia gravis', html: 'In {{myasthenia gravis}}, an autoimmune disorder, the immune system attacks acetylcholine receptors on muscles. The muscle cannot "hear" the message to contract, so the person has muscle weakness, often starting with drooping eyelids.' },
      { type: 'cfu', q: { type: 'mc', id: '1.3B-c9', q: 'A doctor prescribes a medication that slows the enzyme that breaks down acetylcholine for a patient with myasthenia gravis. Why might this help?', choices: ['It destroys the attacked receptors.', 'It leaves more acetylcholine in the synapse to activate the remaining receptors.', 'It turns acetylcholine into an inhibitory neurotransmitter.', 'It increases the refractory period.'], a: 1, why: 'If less ACh is broken down, more stays in the synapse, so the remaining receptors are more likely to be activated.' } }
    ] }
  ]
});

ML.data.lessons.push({
  id: '1.3C', topic: '1.3', title: 'Psychoactive Drugs', blurb: 'Agonists, antagonists, drug categories, tolerance, and addiction.',
  steps: [
    { kind: 'Big picture', title: 'Chemicals that change the mind', blocks: [
      { type: 'hook', html: 'Morning coffee, a prescription antidepressant, and an illegal drug all have something in common: they work at the synapse. Once you understand how neurotransmitters work, you can predict what almost any drug will do.' },
      { type: 'text', html: [
        '{{Psychoactive drugs}} are substances that affect brain activity and change perception, mood, or consciousness. They work by enhancing or inhibiting neurotransmitter function.',
        '{{Psychotropic drugs}} are the subset of psychoactive drugs prescribed to treat mental health disorders.'
      ] },
      { type: 'cfu', q: { type: 'tf', id: '1.3C-c1', q: 'All psychotropic drugs are psychoactive, but not all psychoactive drugs are psychotropic.', a: true, why: 'True. Psychotropic drugs are the prescribed, mental-health subset of all psychoactive drugs.' } }
    ] },
    { kind: 'Physiology', title: 'Agonists, antagonists, and reuptake inhibitors', blocks: [
      { type: 'text', html: [
        'Some drugs look so much like a neurotransmitter that receptors accept them: dopamine is similar to cocaine, serotonin to LSD and ecstasy, anandamide (an endocannabinoid) to THC, and endorphins to morphine.',
        'An {{agonist}} mimics a neurotransmitter or enhances its action. Opioids like heroin act as agonists at endorphin receptors, reducing pain.',
        'An {{antagonist}} inhibits or blocks a neurotransmitter, often by sitting in its receptor without activating it. Some antipsychotic medications block dopamine receptors to reduce hallucinations.',
        'A {{reuptake inhibitor}} blocks reabsorption, so the neurotransmitter stays in the synapse longer and keeps working. Cocaine blocks dopamine reuptake, causing an intense "high." SSRIs (selective serotonin reuptake inhibitors) like Prozac and Zoloft leave more serotonin in the synapse to treat depression.'
      ] },
      { type: 'widget', id: 'synapse-sim', caption: 'Switch between Agonist, Antagonist, and Reuptake inhibitor. Watch the receptor-activity meter in each mode.' },
      { type: 'analogy', h: 'Key and lock', html: 'An agonist is a copy of the key that opens the lock. An antagonist is a key that fits the lock but will not turn, so it jams it. A reuptake inhibitor leaves the real keys lying around longer.' },
      { type: 'cfu', qs: [
        { type: 'sort', id: '1.3C-c2', q: 'Agonist, antagonist, or reuptake inhibitor?', bins: ['Agonist', 'Antagonist', 'Reuptake inhibitor'], items: [
          { t: 'Morphine activating endorphin receptors', bin: 0 }, { t: 'A drug that mimics acetylcholine', bin: 0 },
          { t: 'An antipsychotic blocking dopamine receptors', bin: 1 }, { t: 'A drug that sits in receptors without activating them', bin: 1 },
          { t: 'An SSRI like Prozac', bin: 2 }, { t: 'Cocaine keeping dopamine in the synapse', bin: 2 }] },
        { type: 'mc', id: '1.3C-c3', q: 'A new drug occupies serotonin receptor sites but does not activate them. It is best described as', choices: ['a serotonin agonist', 'a serotonin antagonist', 'a serotonin reuptake inhibitor', 'a stimulant'], a: 1, why: 'Blocking receptors without activating them is what an antagonist does.' }
      ] }
    ] },
    { kind: 'Function', title: 'Four kinds of psychoactive drugs', blocks: [
      { type: 'table', head: ['Category', 'Effect', 'Examples', 'How'], rows: [
        ['{{Stimulants}}', 'Speed up body functions; more alertness and energy', 'Caffeine, cocaine, methamphetamine, ecstasy', 'Boost dopamine, norepinephrine, and serotonin'],
        ['{{Depressants}}', 'Slow body functions and neural activity', 'Alcohol, barbiturates', 'Enhance GABA: less anxiety, but impaired judgment and motor skills'],
        ['{{Opioids}}', 'Dull pain and anxiety', 'Heroin, morphine', 'Act as endorphin agonists'],
        ['{{Hallucinogens}}', 'Distort perception; can cause hallucinations', 'LSD, marijuana', 'Act on serotonin (LSD) or endocannabinoid (THC) systems']
      ] },
      { type: 'note', h: 'Near-death experiences', html: 'People who survive a close brush with death sometimes report visions of a tunnel, a bright light, or reliving memories. These reports resemble hallucinogen experiences, possibly because the oxygen-starved brain produces similar activity.' },
      { type: 'cfu', q: { type: 'sort', id: '1.3C-c4', q: 'Sort each drug into its category.', bins: ['Stimulant', 'Depressant', 'Opioid', 'Hallucinogen'], items: [
        { t: 'Caffeine', bin: 0 }, { t: 'Methamphetamine', bin: 0 }, { t: 'Alcohol', bin: 1 }, { t: 'Barbiturates', bin: 1 },
        { t: 'Heroin', bin: 2 }, { t: 'Morphine', bin: 2 }, { t: 'LSD', bin: 3 }, { t: 'Marijuana', bin: 3 }] } }
    ] },
    { kind: 'Application', title: 'Tolerance, withdrawal, and addiction', blocks: [
      { type: 'text', html: [
        '{{Tolerance}} is needing more of a drug to get the same effect, because the brain adapts. Think of needing more coffee every day just to stay awake.',
        '{{Withdrawal}} is the physical and psychological discomfort when a person stops using a drug, like anxiety, nausea, tremors, or intense cravings. The headache you get when you skip your usual coffee is caffeine withdrawal.',
        '{{Addiction}} is a compulsive craving for a substance despite harmful consequences. It is linked to changes in the brain’s dopamine-driven reward system.'
      ] },
      { type: 'clinical', h: 'Substance use disorder', html: 'A {{substance use disorder}} is diagnosed when drug use becomes uncontrollable and interferes with daily life, relationships, school, or work. It can bring physical harm (like liver damage from alcohol or lung damage from smoking) and psychological harm (like depression, anxiety, or paranoia). Substance use disorders are treatable medical conditions, not a lack of willpower.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.3C-c5', q: 'After months of daily energy drinks, Sam needs two cans to feel as alert as one can used to make him. Sam is experiencing', choices: ['withdrawal', 'tolerance', 'a near-death experience', 'an antagonist effect'], a: 1, why: 'Needing more of a substance for the same effect is tolerance.' },
        { type: 'mc', id: '1.3C-c6', q: 'Over time, a person using heroin produces fewer of their own endorphins. When they stop using, they feel intense pain and sickness. This is best explained by', choices: ['heroin acting as an endorphin agonist, so the brain cut its own production', 'heroin acting as a dopamine antagonist', 'the refractory period lasting longer', 'heroin being a stimulant'], a: 0, why: 'Heroin mimics endorphins. The brain adapts by making fewer of its own, so stopping leaves too little painkilling chemistry: withdrawal.' }
      ] }
    ] }
  ]
});
