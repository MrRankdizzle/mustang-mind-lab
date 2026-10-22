/* Puzzle data for word games.
   connections: { title, topics:[...], groups:[{ name, level:1-4 (1 easiest), items:[4 labels] }] }
   acrostics:   { word, title, topics:[...], rows:[{ a: 'ANSWER' (A-Z only), clue }] }  — first letters of answers spell `word` */
ML.data.connections.push(
  { title: 'Nature & Nurture', topics: ['1.1'], groups: [
    { name: 'Genetics building blocks', level: 1, items: ['Gene', 'Genome', 'DNA', 'Chromosome'] },
    { name: 'Environmental influences', level: 2, items: ['Nutrition', 'Culture', 'Family', 'Education'] },
    { name: 'Evolution words', level: 3, items: ['Natural Selection', 'Mutation', 'Darwin', 'Survival'] },
    { name: 'Behavior genetics research', level: 4, items: ['Twin Study', 'Adoption Study', 'Family Study', 'Heritability'] }
  ] },
  { title: 'Divide & Conquer', topics: ['1.2'], groups: [
    { name: 'Somatic (voluntary) actions', level: 1, items: ['Kicking', 'Typing', 'Waving', 'Dancing'] },
    { name: 'Reflexes', level: 2, items: ['Knee-Jerk', 'Eye Blink', 'Sneeze', 'Hand Withdrawal'] },
    { name: 'Sympathetic effects', level: 3, items: ['Pupils Dilate', 'Heart Races', 'Digestion Slows', 'Palms Sweat'] },
    { name: 'Parasympathetic effects', level: 4, items: ['Pupils Constrict', 'Heart Slows', 'Digestion Resumes', 'Breathing Slows'] }
  ] },
  { title: 'Inside the Neuron', topics: ['1.3'], groups: [
    { name: 'Parts of a neuron', level: 1, items: ['Dendrites', 'Axon', 'Soma', 'Myelin'] },
    { name: 'Cells of the nervous system', level: 2, items: ['Sensory', 'Motor', 'Interneuron', 'Glial'] },
    { name: 'Neural firing words', level: 3, items: ['Threshold', 'Depolarization', 'Refractory', 'Resting Potential'] },
    { name: 'Disorders of neural communication', level: 4, items: ['MS', 'ALS', 'Parkinson’s', 'Myasthenia Gravis'] }
  ] },
  { title: 'Chemical Messengers', topics: ['1.3'], groups: [
    { name: 'Hormones', level: 1, items: ['Leptin', 'Ghrelin', 'Oxytocin', 'Melatonin'] },
    { name: 'Stimulants', level: 2, items: ['Caffeine', 'Cocaine', 'Meth', 'Ecstasy'] },
    { name: 'Excitatory neurotransmitters', level: 3, items: ['Glutamate', 'Dopamine', 'Norepinephrine', 'Acetylcholine'] },
    { name: 'Depressants and opioids', level: 4, items: ['Alcohol', 'Barbiturates', 'Heroin', 'Morphine'] }
  ] },
  { title: 'Brain Map', topics: ['1.4'], groups: [
    { name: 'Lobes of the cortex', level: 1, items: ['Frontal', 'Parietal', 'Occipital', 'Temporal'] },
    { name: 'Limbic system', level: 2, items: ['Amygdala', 'Hippocampus', 'Thalamus', 'Hypothalamus'] },
    { name: 'Brainstem structures', level: 3, items: ['Medulla', 'Pons', 'Midbrain', 'Reticular Formation'] },
    { name: 'Ways to study the brain', level: 4, items: ['EEG', 'fMRI', 'PET', 'Lesion'] }
  ] },
  { title: 'Sleep Lab', topics: ['1.5'], groups: [
    { name: 'Brain waves', level: 1, items: ['Alpha', 'Beta', 'Theta', 'Delta'] },
    { name: 'Sleep disorders', level: 2, items: ['Insomnia', 'Narcolepsy', 'Sleep Apnea', 'Night Terrors'] },
    { name: 'True of REM sleep', level: 3, items: ['Vivid Dreams', 'Paralyzed Muscles', 'Paradoxical Sleep', 'Rapid Eye Movement'] },
    { name: 'Your body clock', level: 4, items: ['SCN', 'Melatonin', 'Jet Lag', '24 Hours'] }
  ] },
  { title: 'Sense Organs', topics: ['1.6'], groups: [
    { name: 'Parts of the eye', level: 1, items: ['Cornea', 'Iris', 'Retina', 'Fovea'] },
    { name: 'Parts of the ear', level: 2, items: ['Cochlea', 'Ossicles', 'Eardrum', 'Pinna'] },
    { name: 'Basic tastes', level: 3, items: ['Sweet', 'Sour', 'Bitter', 'Umami'] },
    { name: 'Color vision', level: 4, items: ['Trichromatic', 'Opponent-Process', 'Afterimage', 'Dichromatism'] }
  ] },
  { title: 'Hidden Senses', topics: ['1.6'], groups: [
    { name: 'Balance and body position', level: 1, items: ['Semicircular Canals', 'Vertigo', 'Kinesthesis', 'Vestibular'] },
    { name: 'Pain', level: 2, items: ['Nociceptors', 'Gate Control', 'Phantom Limb', 'Substance P'] },
    { name: 'Chemical senses', level: 3, items: ['Olfaction', 'Gustation', 'Pheromones', 'Supertasters'] },
    { name: 'Hearing loss and help', level: 4, items: ['Conduction', 'Sensorineural', 'Cochlear Implant', 'Hearing Aid'] }
  ] },
  { title: 'Unit 1 Mashup', topics: ['1.1', '1.4', '1.6'], groups: [
    { name: 'Brain scans', level: 1, items: ['EEG', 'fMRI', 'PET', 'CT'] },
    { name: '___ study', level: 2, items: ['Twin', 'Adoption', 'Family', 'Lesion'] },
    { name: 'Psychology pioneers from the unit', level: 3, items: ['Darwin', 'Bandura', 'Gazzaniga', 'Weber'] },
    { name: 'Sensation processes', level: 4, items: ['Adaptation', 'Interaction', 'Transduction', 'Priming'] }
  ] }
);

ML.data.acrostics.push(
  { word: 'GENES', title: 'Hidden word: G-E-N-E-S', topics: ['1.1'], rows: [
    { a: 'GENOME', clue: 'The complete set of genetic instructions for an organism' },
    { a: 'EPIGENETICS', clue: 'Study of how the environment switches genes on or off without changing DNA' },
    { a: 'NURTURE', clue: 'The environment side of the big debate' },
    { a: 'EUGENICS', clue: 'Discredited movement that led to forced sterilizations' },
    { a: 'SELECTION', clue: 'Natural ___: helpful inherited traits get passed on' }
  ] },
  { word: 'NERVE', title: 'Hidden word: N-E-R-V-E', topics: ['1.2', '1.3'], rows: [
    { a: 'NEURON', clue: 'A nerve cell; the basic building block of the nervous system' },
    { a: 'EFFERENT', clue: 'Motor neurons are this type: they exit the CNS' },
    { a: 'REFLEX', clue: 'Automatic, involuntary response coordinated by the spinal cord' },
    { a: 'VOLUNTARY', clue: 'The somatic nervous system controls ___ movements' },
    { a: 'EXCITATORY', clue: 'Neurotransmitters that make the next neuron more likely to fire' }
  ] },
  { word: 'NEURON', title: 'Hidden word: N-E-U-R-O-N', topics: ['1.1', '1.3', '1.4', '1.6'], rows: [
    { a: 'NOCICEPTORS', clue: 'Receptors that detect potentially harmful stimuli and signal pain' },
    { a: 'ENDORPHINS', clue: 'The body’s natural painkillers' },
    { a: 'UMAMI', clue: 'The savory basic taste linked to proteins' },
    { a: 'RETINA', clue: 'Light-sensitive surface at the back of the eye' },
    { a: 'OCCIPITAL', clue: 'Lobe at the back of the head that processes vision' },
    { a: 'NATURE', clue: 'The heredity side of the big debate' }
  ] },
  { word: 'BRAIN', title: 'Hidden word: B-R-A-I-N', topics: ['1.3', '1.4', '1.5'], rows: [
    { a: 'BROCAS', clue: 'Left frontal lobe area for producing speech (no apostrophe)' },
    { a: 'REFLEX', clue: 'Automatic, involuntary response coordinated by the spinal cord' },
    { a: 'AXON', clue: 'Long fiber that carries the signal away from the cell body' },
    { a: 'INSOMNIA', clue: 'Recurring trouble falling or staying asleep' },
    { a: 'NARCOLEPSY', clue: 'Sudden sleep attacks, sometimes falling straight into REM' }
  ] },
  { word: 'LOBES', title: 'Hidden word: L-O-B-E-S', topics: ['1.4'], rows: [
    { a: 'LESION', clue: 'Damaged brain tissue studied to learn what an area does' },
    { a: 'OCCIPITAL', clue: 'The lobe that processes vision' },
    { a: 'BRAINSTEM', clue: 'Oldest, innermost part of the brain that runs survival functions' },
    { a: 'EEG', clue: 'Records brain waves with electrodes on the scalp' },
    { a: 'SEIZURES', clue: 'Split-brain surgery was done to stop severe epileptic ___' }
  ] },
  { word: 'SLEEP', title: 'Hidden word: S-L-E-E-P', topics: ['1.5'], rows: [
    { a: 'SPINDLES', clue: 'Bursts of rapid brain waves that mark Stage 2' },
    { a: 'LIGHT', clue: 'What the SCN responds to when it resets your body clock' },
    { a: 'EEG', clue: 'Tool that records brain waves during a sleep study' },
    { a: 'ENURESIS', clue: 'Medical term for bed-wetting, which happens in deep NREM sleep' },
    { a: 'PONS', clue: 'Brainstem structure involved in sleep and movement' }
  ] },
  { word: 'DREAM', title: 'Hidden word: D-R-E-A-M', topics: ['1.5'], rows: [
    { a: 'DELTA', clue: 'Slow, large brain waves of deep sleep' },
    { a: 'REM', clue: 'Sleep stage with vivid dreams and paralyzed muscles' },
    { a: 'EAST', clue: 'Jet lag is usually worse when you fly in this direction' },
    { a: 'ALPHA', clue: 'Brain waves of a relaxed, awake state' },
    { a: 'MELATONIN', clue: 'Hormone that rises when it gets dark and makes you sleepy' }
  ] },
  { word: 'TASTE', title: 'Hidden word: T-A-S-T-E', topics: ['1.6'], rows: [
    { a: 'TRANSDUCTION', clue: 'Converting stimulus energy into neural impulses' },
    { a: 'AMPLITUDE', clue: 'Height of a sound wave, heard as loudness' },
    { a: 'SYNESTHESIA', clue: 'When one sense triggers an experience in another, like seeing colors in music' },
    { a: 'THALAMUS', clue: 'Sensory relay station that smell skips' },
    { a: 'EARDRUM', clue: 'Thin membrane that vibrates when sound waves hit it' }
  ] },
  { word: 'PAIN', title: 'Hidden word: P-A-I-N', topics: ['1.6'], rows: [
    { a: 'PLACEBO', clue: 'A fake treatment that can still dampen pain because you expect it to work' },
    { a: 'ACUPUNCTURE', clue: 'Physical pain-control method using thin needles' },
    { a: 'INFLAMMATION', clue: 'Substance P contributes to this swelling response at an injury' },
    { a: 'NOCICEPTORS', clue: 'Sensory receptors that detect harmful stimuli' }
  ] }
);
