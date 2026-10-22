/* Unit 1 vocabulary. Fields: id, t (term), s (short arcade label), d (definition), topic, g (group for smart distractors) */
(function () {
const T = (topic, g, id, t, s, d) => ML.data.terms.push({ id, t, s: s || t, d, topic, g });

/* ---- 1.1 Heredity & Environment ---- */
T('1.1', 'nn', 'nature', 'Nature', '', 'Genetic or predisposed characteristics that influence physical, behavioral, and mental traits.');
T('1.1', 'nn', 'nurture', 'Nurture', '', 'External factors a person experiences, such as family interactions, culture, and education.');
T('1.1', 'nn', 'heredity', 'Heredity', '', 'The passing of genetic traits from parents to their offspring.');
T('1.1', 'nn', 'environment', 'Environment', '', 'Every nongenetic influence, from nutrition before birth to the people and things around us.');
T('1.1', 'nn', 'interaction', 'Interaction', '', 'When the effect of one factor (like the environment) depends on another factor (like heredity).');
T('1.1', 'evo', 'evolutionary-perspective', 'Evolutionary Perspective', 'Evolutionary', 'Explains behaviors as products of natural selection: behaviors that helped ancestors survive and reproduce were passed on.');
T('1.1', 'evo', 'natural-selection', 'Natural Selection', '', 'Darwin’s principle that inherited traits that help an organism survive and reproduce are passed on to later generations.');
T('1.1', 'evo', 'mutation', 'Mutation', '', 'A random change in DNA that can lead to a new trait.');
T('1.1', 'gen', 'behavior-genetics', 'Behavior Genetics', '', 'The study of how genetic and environmental differences contribute to differences in behavior.');
T('1.1', 'gen', 'genes', 'Genes', '', 'The basic units of heredity: segments of DNA that carry instructions for making proteins.');
T('1.1', 'gen', 'genome', 'Genome', '', 'The complete set of genetic instructions for making an organism.');
T('1.1', 'gen', 'molecular-genetics', 'Molecular Genetics', '', 'The subfield of biology that studies the molecular structure and function of genes.');
T('1.1', 'gen', 'epigenetics', 'Epigenetics', '', 'The study of how the environment turns genes on or off without changing the DNA itself.');
T('1.1', 'gen', 'heritability', 'Heritability', '', 'The proportion of variation among individuals in a group that can be attributed to genes, from 0 to 1.');
T('1.1', 'evo', 'eugenics', 'Eugenics', '', 'A discredited movement to "improve" humans through selective breeding, which led to forced sterilizations.');
T('1.1', 'twin', 'identical-twins', 'Identical (Monozygotic) Twins', 'Identical Twins', 'Twins from one fertilized egg that splits in two, so they share nearly all of their genes.');
T('1.1', 'twin', 'fraternal-twins', 'Fraternal (Dizygotic) Twins', 'Fraternal Twins', 'Twins from two eggs fertilized by two sperm, sharing about half their genes like any siblings.');
T('1.1', 'twin', 'twin-study', 'Twin Study', '', 'Research comparing identical and fraternal twins to estimate how much genes influence a trait.');
T('1.1', 'twin', 'adoption-study', 'Adoption Study', '', 'Research comparing adopted children with their biological and adoptive parents to separate genes from environment.');
T('1.1', 'twin', 'family-study', 'Family Study', '', 'Research that checks whether relatives who share more genes also share a trait more often.');
T('1.1', 'nn', 'reciprocal-determinism', 'Reciprocal Determinism', 'Reciprocal Det.', 'Bandura’s idea that behavior, personal thoughts and feelings, and the environment all influence each other.');

/* ---- 1.2 Nervous System ---- */
T('1.2', 'ns', 'nervous-system', 'Nervous System', '', 'The body’s fast, electrochemical communication network of nerve cells.');
T('1.2', 'ns', 'cns', 'Central Nervous System', 'CNS', 'The brain and spinal cord: the body’s command center.');
T('1.2', 'ns', 'pns', 'Peripheral Nervous System', 'PNS', 'The sensory and motor neurons that connect the central nervous system to the rest of the body.');
T('1.2', 'ns', 'nerves', 'Nerves', '', 'Bundled axons that form cables connecting the CNS with muscles, glands, and sense organs.');
T('1.2', 'ns', 'somatic', 'Somatic Nervous System', 'Somatic', 'The division of the PNS that controls voluntary movements of skeletal muscles.');
T('1.2', 'ns', 'autonomic', 'Autonomic Nervous System', 'Autonomic', 'The division of the PNS that controls involuntary functions like heartbeat, digestion, and breathing.');
T('1.2', 'ans', 'sympathetic', 'Sympathetic Nervous System', 'Sympathetic', 'Arouses the body for fight-or-flight: heart races, pupils dilate, digestion slows.');
T('1.2', 'ans', 'parasympathetic', 'Parasympathetic Nervous System', 'Parasympathetic', 'Calms the body and conserves energy (rest-and-digest), bringing it back to homeostasis.');
T('1.2', 'ns', 'reflex', 'Reflex', '', 'An automatic, rapid, involuntary response to a stimulus, coordinated by the spinal cord.');
T('1.2', 'ans', 'homeostasis', 'Homeostasis', '', 'The body’s tendency to keep a steady, balanced internal state.');

/* ---- 1.3A Neurons ---- */
T('1.3', 'neuron', 'neuron', 'Neuron', '', 'A nerve cell; the basic building block of the nervous system.');
T('1.3', 'neuron', 'cell-body', 'Cell Body (Soma)', 'Cell Body', 'The neuron’s control center; it contains the nucleus and keeps the cell alive.');
T('1.3', 'neuron', 'dendrites', 'Dendrites', '', 'Branching fibers that receive messages and carry them toward the cell body.');
T('1.3', 'neuron', 'axon', 'Axon', '', 'The long extension that carries messages away from the cell body toward other neurons, muscles, or glands.');
T('1.3', 'neuron', 'myelin', 'Myelin Sheath', 'Myelin', 'A fatty layer around many axons that speeds up neural impulses.');
T('1.3', 'neuron', 'axon-terminals', 'Axon Terminals (Terminal Buttons)', 'Axon Terminals', 'Branched endings of the axon that release neurotransmitters into the synapse.');
T('1.3', 'neuron', 'synapse', 'Synapse', '', 'The tiny gap between the axon terminal of one neuron and the dendrite of the next.');
T('1.3', 'neuron', 'vesicles', 'Synaptic Vesicles', 'Vesicles', 'Tiny sacs in the axon terminals that store and release neurotransmitters.');
T('1.3', 'neuron', 'glial-cells', 'Glial Cells', '', 'Support cells that nourish, protect, and insulate neurons and clean up after them.');
T('1.3', 'ntype', 'reflex-arc', 'Reflex Arc', '', 'The pathway sensory neuron → interneuron in the spinal cord → motor neuron.');
T('1.3', 'ntype', 'sensory-neurons', 'Sensory (Afferent) Neurons', 'Sensory Neurons', 'Neurons that carry information from the body’s receptors to the CNS.');
T('1.3', 'ntype', 'motor-neurons', 'Motor (Efferent) Neurons', 'Motor Neurons', 'Neurons that carry commands from the CNS out to muscles and glands.');
T('1.3', 'ntype', 'interneurons', 'Interneurons', '', 'Neurons in the brain and spinal cord that connect sensory input to motor output.');
T('1.3', 'disorder', 'ms', 'Multiple Sclerosis', 'MS', 'A disease in which the myelin sheath is damaged and scarred, slowing or scrambling neural messages.');
T('1.3', 'disorder', 'als', 'ALS', '', 'A disease that kills motor neurons, so the brain gradually loses control of voluntary muscles.');

/* ---- 1.3B Neural firing, neurotransmitters, hormones ---- */
T('1.3', 'fire', 'action-potential', 'Action Potential', '', 'A neural impulse: a brief electrical charge that travels down the axon.');
T('1.3', 'fire', 'resting-potential', 'Resting Potential', '', 'The neuron’s charge at rest, about −70 mV, ready to fire.');
T('1.3', 'fire', 'threshold', 'Threshold', '', 'The level of stimulation (about −55 mV) needed to trigger an action potential.');
T('1.3', 'fire', 'depolarization', 'Depolarization', '', 'Sodium gates open and Na+ ions rush in, making the inside of the neuron positive.');
T('1.3', 'fire', 'all-or-nothing', 'All-or-Nothing Principle', 'All-or-Nothing', 'A neuron either fires at full strength or does not fire at all.');
T('1.3', 'fire', 'refractory-period', 'Refractory Period', 'Refractory', 'A brief recovery time after firing before the neuron can fire again.');
T('1.3', 'fire', 'reuptake', 'Reuptake', '', 'The sending neuron reabsorbs leftover neurotransmitter from the synapse.');
T('1.3', 'nt', 'neurotransmitters', 'Neurotransmitters', '', 'Chemical messengers that cross the synapse and bind to receptor sites on the next neuron.');
T('1.3', 'fire', 'excitatory', 'Excitatory Neurotransmitter', 'Excitatory', 'A neurotransmitter that makes the receiving neuron more likely to fire.');
T('1.3', 'fire', 'inhibitory', 'Inhibitory Neurotransmitter', 'Inhibitory', 'A neurotransmitter that makes the receiving neuron less likely to fire.');
T('1.3', 'nt', 'dopamine', 'Dopamine', '', 'Neurotransmitter for reward, motivation, and movement; too little is linked to Parkinson’s, too much to schizophrenia.');
T('1.3', 'nt', 'serotonin', 'Serotonin', '', 'Neurotransmitter that regulates mood, hunger, and sleep; low levels are linked to depression.');
T('1.3', 'nt', 'norepinephrine', 'Norepinephrine', '', 'Neurotransmitter that raises alertness and arousal, like heart rate and blood pressure.');
T('1.3', 'nt', 'glutamate', 'Glutamate', '', 'The most common excitatory neurotransmitter; important for learning and memory.');
T('1.3', 'nt', 'gaba', 'GABA', '', 'The major inhibitory neurotransmitter; it calms the nervous system.');
T('1.3', 'nt', 'endorphins', 'Endorphins', '', 'The body’s natural painkillers, linked to pain control and pleasure.');
T('1.3', 'nt', 'substance-p', 'Substance P', '', 'Neurotransmitter that carries pain signals to the brain and adds to inflammation.');
T('1.3', 'nt', 'acetylcholine', 'Acetylcholine (ACh)', 'Acetylcholine', 'Neurotransmitter that triggers muscle contraction and helps with learning and memory.');
T('1.3', 'disorder', 'myasthenia-gravis', 'Myasthenia Gravis', 'Myasthenia', 'An autoimmune disorder that attacks acetylcholine receptors, causing muscle weakness.');
T('1.3', 'disorder', 'parkinsons', 'Parkinson’s Disease', 'Parkinson’s', 'Movement disorder caused by the loss of dopamine-producing neurons; treated with L-dopa.');
T('1.3', 'horm', 'endocrine', 'Endocrine System', 'Endocrine', 'The body’s slower chemical communication system of glands that secrete hormones into the bloodstream.');
T('1.3', 'horm', 'hormones', 'Hormones', '', 'Chemical messengers that travel through the bloodstream; slower than neurotransmitters but longer lasting.');
T('1.3', 'horm', 'adrenaline', 'Adrenaline (Epinephrine)', 'Adrenaline', 'Hormone that boosts heart rate and energy during fight-or-flight.');
T('1.3', 'horm', 'oxytocin', 'Oxytocin', '', 'Hormone linked to bonding, trust, and social behavior.');
T('1.3', 'horm', 'leptin', 'Leptin', '', 'Hormone released by fat cells that signals fullness and decreases hunger.');
T('1.3', 'horm', 'ghrelin', 'Ghrelin', '', 'Hormone released by the stomach that signals hunger.');
T('1.3', 'horm', 'melatonin', 'Melatonin', '', 'Hormone that regulates the sleep-wake cycle; it rises as it gets dark.');

/* ---- 1.3C Psychoactive drugs ---- */
T('1.3', 'drugact', 'psychoactive', 'Psychoactive Drug', 'Psychoactive', 'A chemical that changes perception, mood, or consciousness by altering brain activity.');
T('1.3', 'drugact', 'psychotropic', 'Psychotropic Drug', 'Psychotropic', 'A psychoactive drug prescribed to treat a mental health disorder.');
T('1.3', 'drugact', 'agonist', 'Agonist', '', 'A drug that mimics a neurotransmitter or boosts its action.');
T('1.3', 'drugact', 'antagonist', 'Antagonist', '', 'A drug that blocks a neurotransmitter’s action, often by sitting in its receptor sites.');
T('1.3', 'drugact', 'reuptake-inhibitor', 'Reuptake Inhibitor', 'Reuptake Blocker', 'A drug that blocks reabsorption, leaving more neurotransmitter in the synapse for longer.');
T('1.3', 'drugcat', 'stimulants', 'Stimulants', '', 'Drugs that speed up body functions and neural activity, like caffeine, cocaine, and methamphetamine.');
T('1.3', 'drugcat', 'depressants', 'Depressants', '', 'Drugs that slow body functions and neural activity, like alcohol and barbiturates.');
T('1.3', 'drugcat', 'opioids', 'Opioids', '', 'Drugs like heroin and morphine that act like endorphins to dull pain and anxiety.');
T('1.3', 'drugcat', 'hallucinogens', 'Hallucinogens', '', 'Drugs that distort perception and can cause sensory images without real input, like LSD.');
T('1.3', 'drug', 'caffeine', 'Caffeine', '', 'A mild stimulant in coffee, tea, and soda; increases alertness, and stopping it can cause headaches.');
T('1.3', 'drug', 'cocaine', 'Cocaine', '', 'A stimulant that blocks dopamine reuptake, causing an intense high followed by a crash.');
T('1.3', 'drug', 'methamphetamine', 'Methamphetamine', 'Meth', 'A powerful stimulant that floods the brain with dopamine; long-term use can reduce the brain’s own dopamine.');
T('1.3', 'drug', 'ecstasy', 'Ecstasy (MDMA)', 'Ecstasy', 'A stimulant and mild hallucinogen that releases serotonin and dopamine and can damage serotonin neurons.');
T('1.3', 'drug', 'alcohol', 'Alcohol', '', 'A depressant that boosts GABA; slows reactions, impairs judgment and memory, and suppresses REM sleep.');
T('1.3', 'drug', 'barbiturates', 'Barbiturates', '', 'Depressant tranquilizers that boost GABA to reduce anxiety; dangerous when combined with alcohol.');
T('1.3', 'drug', 'heroin', 'Heroin', '', 'An opioid that mimics endorphins; with repeated use the brain stops making its own endorphins.');
T('1.3', 'drug', 'lsd', 'LSD', '', 'A hallucinogen that mimics serotonin, causing distorted perceptions and hallucinations.');
T('1.3', 'drug', 'marijuana', 'Marijuana', '', 'A mild hallucinogen; its THC acts on the brain’s endocannabinoid (anandamide) receptors, altering perception and memory.');
T('1.3', 'drugfx', 'near-death', 'Near-Death Experience', 'Near-Death', 'An altered state reported after a close brush with death, often with visions of tunnels or bright light.');
T('1.3', 'drugfx', 'tolerance', 'Tolerance', '', 'Needing more of a drug to get the same effect as the brain adapts to it.');
T('1.3', 'drugfx', 'withdrawal', 'Withdrawal', '', 'Physical and psychological symptoms, like anxiety, nausea, and cravings, after stopping a drug.');
T('1.3', 'drugfx', 'addiction', 'Addiction', '', 'Compulsive craving for a substance despite harmful consequences.');
T('1.3', 'drugfx', 'sud', 'Substance Use Disorder', 'Use Disorder', 'Drug use that becomes uncontrollable and interferes with daily, social, or work life.');

/* ---- 1.4 The Brain ---- */
T('1.4', 'stem', 'brainstem', 'Brainstem', '', 'The oldest, innermost part of the brain; it runs automatic survival functions.');
T('1.4', 'stem', 'medulla', 'Medulla Oblongata', 'Medulla', 'The base of the brainstem; it controls heartbeat and breathing.');
T('1.4', 'stem', 'pons', 'Pons', '', 'Brainstem structure that helps coordinate movement and sleep.');
T('1.4', 'stem', 'midbrain', 'Midbrain', '', 'Top of the brainstem; relays visual, auditory, pain, and movement information.');
T('1.4', 'stem', 'ras', 'Reticular Activating System', 'RAS', 'A nerve network running through the brainstem that controls arousal, alertness, and sleep-wake cycles.');
T('1.4', 'stem', 'cerebellum', 'Cerebellum', '', 'The "little brain" at the back of the skull; it coordinates balance and practiced movements.');
T('1.4', 'limbic', 'limbic-system', 'Limbic System', '', 'A ring of structures tied to emotion, motivation, and memory.');
T('1.4', 'limbic', 'thalamus', 'Thalamus', '', 'The brain’s sensory relay station; it routes all senses except smell to the cortex.');
T('1.4', 'limbic', 'hypothalamus', 'Hypothalamus', '', 'Regulates hunger, thirst, and body temperature and controls the pituitary to keep homeostasis.');
T('1.4', 'limbic', 'pituitary', 'Pituitary Gland', 'Pituitary', 'The "master gland" whose hormones regulate growth and other glands.');
T('1.4', 'limbic', 'hippocampus', 'Hippocampus', '', 'Forms and organizes new memories, turning short-term memories into long-term ones.');
T('1.4', 'limbic', 'amygdala', 'Amygdala', '', 'Processes emotions, especially fear and aggression.');
T('1.4', 'limbic', 'reward-center', 'Reward Center (Nucleus Accumbens)', 'Reward Center', 'A dopamine-driven circuit that produces pleasure and motivation.');
T('1.4', 'cortex', 'cerebral-cortex', 'Cerebral Cortex', 'Cortex', 'The wrinkled outer layer of the brain; it handles higher-level thinking.');
T('1.4', 'lobe', 'frontal-lobe', 'Frontal Lobe', 'Frontal', 'Behind the forehead; handles planning, decision-making, personality, and movement.');
T('1.4', 'lobe', 'prefrontal-cortex', 'Prefrontal Cortex', 'Prefrontal', 'Front of the frontal lobe; handles judgment, impulse control, and executive function.');
T('1.4', 'lobe', 'motor-cortex', 'Motor Cortex', '', 'A strip at the back of the frontal lobe that controls voluntary movements.');
T('1.4', 'lobe', 'parietal-lobe', 'Parietal Lobe', 'Parietal', 'Top of the head; processes touch, temperature, pressure, pain, and body position.');
T('1.4', 'lobe', 'somatosensory-cortex', 'Somatosensory Cortex', 'Somatosensory', 'A strip at the front of the parietal lobe that registers touch and body sensations.');
T('1.4', 'lobe', 'occipital-lobe', 'Occipital Lobe', 'Occipital', 'Back of the head; processes visual information.');
T('1.4', 'lobe', 'temporal-lobe', 'Temporal Lobe', 'Temporal', 'Sides of the head above the ears; processes sound and language comprehension.');
T('1.4', 'cortex', 'homunculus', 'Homunculus', '', 'A distorted body map showing how much cortex is devoted to each body part.');
T('1.4', 'hemi', 'cortex-specialization', 'Cortex Specialization', 'Specialization', 'The idea that specific functions are handled by specific areas of the cortex.');
T('1.4', 'hemi', 'contralateral', 'Contralateral Hemispheric Organization', 'Contralateral', 'Each hemisphere of the brain controls the opposite side of the body.');
T('1.4', 'hemi', 'corpus-callosum', 'Corpus Callosum', '', 'A thick band of axon fibers that connects the two hemispheres.');
T('1.4', 'hemi', 'split-brain', 'Split Brain', '', 'A condition in which the corpus callosum has been cut, so the hemispheres cannot share information.');
T('1.4', 'lang', 'brocas-area', 'Broca’s Area', 'Broca’s', 'Area of the left frontal lobe that controls speech production.');
T('1.4', 'lang', 'wernickes-area', 'Wernicke’s Area', 'Wernicke’s', 'Area of the left temporal lobe that controls language comprehension.');
T('1.4', 'lang', 'aphasia', 'Aphasia', '', 'An impairment of language, usually caused by damage to Broca’s or Wernicke’s area.');
T('1.4', 'hemi', 'plasticity', 'Brain Plasticity (Neuroplasticity)', 'Plasticity', 'The brain’s ability to rewire itself after damage or through experience.');
T('1.4', 'scan', 'eeg', 'EEG', '', 'Records the brain’s electrical activity (brain waves) with electrodes on the scalp.');
T('1.4', 'scan', 'fmri', 'fMRI', '', 'Tracks blood flow to show which brain areas are active during a task.');
T('1.4', 'scan', 'pet', 'PET Scan', 'PET', 'Shows brain activity by tracking where radioactive glucose is used.');
T('1.4', 'scan', 'ct', 'CT (CAT) Scan', 'CT Scan', 'A series of X-ray slices that shows the brain’s structure.');
T('1.4', 'scan', 'meg', 'MEG', '', 'Measures the magnetic fields produced by neural activity.');
T('1.4', 'scan', 'lesion', 'Lesion', '', 'Natural or experimental destruction of brain tissue, studied to learn what that area does.');

/* ---- 1.5 Sleep ---- */
T('1.5', 'cons', 'consciousness', 'Consciousness', '', 'Our awareness of ourselves and our environment.');
T('1.5', 'cons', 'altered-state', 'Altered State of Consciousness', 'Altered State', 'Any condition that differs noticeably from normal waking awareness, like sleep, hypnosis, or meditation.');
T('1.5', 'cons', 'circadian-rhythm', 'Circadian Rhythm', 'Circadian', 'The body’s roughly 24-hour biological clock.');
T('1.5', 'cons', 'scn', 'Suprachiasmatic Nucleus (SCN)', 'SCN', 'A cluster of hypothalamus cells that responds to light and sets the circadian rhythm.');
T('1.5', 'cons', 'jet-lag', 'Jet Lag', '', 'Fatigue and fogginess from a circadian rhythm that is out of sync with local time; usually worst flying east.');
T('1.5', 'stage', 'nrem', 'NREM Sleep', 'NREM', 'Non-rapid eye movement sleep: Stages 1 to 3, getting progressively deeper.');
T('1.5', 'stage', 'rem', 'REM Sleep', 'REM', 'Rapid eye movement sleep: vivid dreams, an active brain, and a paralyzed body.');
T('1.5', 'stage', 'hypnagogic', 'Hypnagogic Sensations', 'Hypnagogic', 'Falling sensations or dreamlike images while drifting off in Stage 1 sleep.');
T('1.5', 'stage', 'sleep-spindles', 'Sleep Spindles', 'Spindles', 'Bursts of rapid brain-wave activity that mark Stage 2 sleep.');
T('1.5', 'wave', 'alpha-waves', 'Alpha Waves', '', 'Relatively slow brain waves of a relaxed, awake state.');
T('1.5', 'wave', 'delta-waves', 'Delta Waves', '', 'Large, slow brain waves of deep Stage 3 NREM sleep.');
T('1.5', 'wave', 'theta-waves', 'Theta Waves', '', 'Brain waves seen as you drift into Stage 1 sleep, also present during REM.');
T('1.5', 'stage', 'rem-rebound', 'REM Rebound', '', 'The tendency for REM sleep to increase after a person is deprived of it.');
T('1.5', 'dream', 'dream', 'Dream', '', 'A sequence of images, emotions, and thoughts passing through a sleeping mind.');
T('1.5', 'dream', 'activation-synthesis', 'Activation-Synthesis Theory', 'Activation-Synth', 'Dreams are the brain’s attempt to make sense of random neural activity.');
T('1.5', 'dream', 'consolidation-theory', 'Consolidation Theory', 'Consolidation', 'Dreams help process and store the day’s memories.');
T('1.5', 'disorder', 'insomnia', 'Insomnia', '', 'Recurring trouble falling asleep or staying asleep.');
T('1.5', 'disorder', 'narcolepsy', 'Narcolepsy', '', 'Sudden, uncontrollable sleep attacks, sometimes falling straight into REM.');
T('1.5', 'disorder', 'sleep-apnea', 'Sleep Apnea', '', 'Breathing repeatedly stops during sleep, causing many brief awakenings and daytime sleepiness.');
T('1.5', 'disorder', 'rem-behavior', 'REM Sleep Behavior Disorder', 'REM Behavior', 'Acting out dreams because the normal muscle paralysis of REM fails.');
T('1.5', 'disorder', 'somnambulism', 'Somnambulism', '', 'Sleepwalking; it happens during deep NREM sleep.');
T('1.5', 'disorder', 'night-terrors', 'Night Terrors', '', 'Episodes of screaming and intense fear during deep NREM sleep, mostly in children, rarely remembered.');

/* ---- 1.6A Sensation basics ---- */
T('1.6', 'sens', 'sensation', 'Sensation', '', 'Detecting stimuli from the environment and converting them into neural messages.');
T('1.6', 'sens', 'perception', 'Perception', '', 'The brain organizing and interpreting sensory information.');
T('1.6', 'sens', 'bottom-up', 'Bottom-Up Processing', 'Bottom-Up', 'Analysis that starts with the sensory receptors and works up to the brain.');
T('1.6', 'sens', 'top-down', 'Top-Down Processing', 'Top-Down', 'Interpretation guided by experience and expectations.');
T('1.6', 'sens', 'transduction', 'Transduction', '', 'Converting one form of energy, like light or sound, into neural impulses.');
T('1.6', 'thresh', 'psychophysics', 'Psychophysics', '', 'The study of how physical stimuli relate to our psychological experience of them.');
T('1.6', 'thresh', 'absolute-threshold', 'Absolute Threshold', 'Abs. Threshold', 'The minimum stimulus intensity a person can detect 50% of the time.');
T('1.6', 'thresh', 'jnd', 'Just-Noticeable Difference', 'JND', 'The smallest change in a stimulus a person can detect 50% of the time; the difference threshold.');
T('1.6', 'thresh', 'webers-law', 'Weber’s Law', 'Weber’s Law', 'To be noticed, two stimuli must differ by a constant percentage, not a constant amount.');
T('1.6', 'thresh', 'subliminal', 'Subliminal', '', 'Below a person’s absolute threshold for conscious awareness.');
T('1.6', 'sens', 'sensory-adaptation', 'Sensory Adaptation', 'Adaptation', 'Decreasing sensitivity to a constant, unchanging stimulus.');
T('1.6', 'sens', 'sensory-interaction', 'Sensory Interaction', 'Sense Interaction', 'One sense influencing another, like smell changing how food tastes.');
T('1.6', 'sens', 'synesthesia', 'Synesthesia', '', 'A rare condition where stimulating one sense triggers an experience in another, like seeing colors in music.');
T('1.6', 'sens', 'priming', 'Priming', '', 'Exposure to one stimulus influencing how you perceive or respond to a later one.');

/* ---- 1.6B Vision ---- */
T('1.6', 'eye', 'cornea', 'Cornea', '', 'The clear, protective outer layer of the eye that bends light to help focus it.');
T('1.6', 'eye', 'pupil', 'Pupil', '', 'The adjustable opening in the center of the eye that lets light in.');
T('1.6', 'eye', 'iris', 'Iris', '', 'The colored ring of muscle that controls the size of the pupil.');
T('1.6', 'eye', 'lens', 'Lens', '', 'The clear, flexible structure behind the pupil that changes shape to focus images on the retina.');
T('1.6', 'eye', 'accommodation', 'Accommodation', '', 'The lens changing shape to focus on near or far objects.');
T('1.6', 'eye', 'retina', 'Retina', '', 'The light-sensitive back surface of the eye that contains the rods and cones.');
T('1.6', 'eye', 'fovea', 'Fovea', '', 'The central point of the retina where cones cluster; vision is sharpest here.');
T('1.6', 'eye', 'photoreceptors', 'Photoreceptors', '', 'Rods and cones: retinal cells that transduce light into neural signals.');
T('1.6', 'eye', 'rods', 'Rods', '', 'Photoreceptors that detect black, white, and gray; they work in dim light and peripheral vision.');
T('1.6', 'eye', 'cones', 'Cones', '', 'Photoreceptors clustered in the fovea that detect color and fine detail.');
T('1.6', 'eye', 'optic-nerve', 'Optic Nerve', '', 'Carries neural impulses from the eye to the brain; made of ganglion cell axons.');
T('1.6', 'eye', 'blind-spot', 'Blind Spot', '', 'The point where the optic nerve leaves the eye; it has no rods or cones.');
T('1.6', 'eye', 'ganglion-cells', 'Ganglion Cells', '', 'Retinal neurons whose axons bundle together to form the optic nerve.');
T('1.6', 'eyeproblem', 'nearsightedness', 'Nearsightedness', 'Nearsighted', 'Near objects look clear but distant ones are blurry because the image focuses in front of the retina.');
T('1.6', 'eyeproblem', 'farsightedness', 'Farsightedness', 'Farsighted', 'Distant objects look clear but near ones are blurry because the image focuses behind the retina.');
T('1.6', 'color', 'trichromatic', 'Trichromatic Theory', 'Trichromatic', 'Young-Helmholtz theory: red, green, and blue cones combine to produce every color we see.');
T('1.6', 'color', 'opponent-process', 'Opponent-Process Theory', 'Opponent-Process', 'Color is processed in opposing pairs (red-green, blue-yellow, black-white), which explains afterimages.');
T('1.6', 'color', 'afterimage', 'Afterimage', '', 'An image that lingers after you stop staring at something, in the opposite colors.');
T('1.6', 'eyeproblem', 'dichromatism', 'Dichromatism', '', 'A color deficiency with only two working cone types; red-green is most common.');
T('1.6', 'eyeproblem', 'monochromatism', 'Monochromatism', '', 'Seeing only shades of gray because two or more cone types are missing.');
T('1.6', 'eyeproblem', 'prosopagnosia', 'Prosopagnosia', '', 'Face blindness: the inability to recognize faces, often from brain damage.');
T('1.6', 'eyeproblem', 'blindsight', 'Blindsight', '', 'Responding to visual stimuli without consciously seeing them, after damage to the visual cortex.');

/* ---- 1.6C Hearing ---- */
T('1.6', 'sound', 'audition', 'Audition', '', 'The sense of hearing.');
T('1.6', 'sound', 'amplitude', 'Amplitude', '', 'The height of a sound wave, which we hear as loudness (measured in decibels).');
T('1.6', 'sound', 'frequency', 'Frequency', '', 'The number of waves per second, which we hear as pitch (measured in hertz).');
T('1.6', 'sound', 'wavelength', 'Wavelength', '', 'The distance from one wave peak to the next; shorter wavelengths mean higher frequency.');
T('1.6', 'ear', 'eardrum', 'Eardrum (Tympanic Membrane)', 'Eardrum', 'A thin membrane that vibrates when sound waves hit it.');
T('1.6', 'ear', 'ossicles', 'Ossicles', '', 'Three tiny middle-ear bones (hammer, anvil, stirrup) that amplify vibrations.');
T('1.6', 'ear', 'cochlea', 'Cochlea', '', 'A snail-shaped, fluid-filled tube in the inner ear where sound vibrations become neural signals.');
T('1.6', 'ear', 'hair-cells', 'Hair Cells', '', 'Receptor cells lining the cochlea’s basilar membrane that transduce vibration into nerve impulses.');
T('1.6', 'ear', 'auditory-nerve', 'Auditory Nerve', '', 'Carries neural messages from the cochlea to the brain.');
T('1.6', 'pitch', 'place-theory', 'Place Theory', '', 'We hear different pitches because different places on the basilar membrane are stimulated; best for high pitches.');
T('1.6', 'pitch', 'frequency-theory', 'Frequency Theory', '', 'We sense pitch by how fast the auditory nerve fires, matching the sound’s frequency; best for low pitches.');
T('1.6', 'pitch', 'volley-theory', 'Volley Theory', '', 'Groups of neurons take turns firing in rapid succession to code pitches too fast for one neuron.');
T('1.6', 'deaf', 'conduction-deafness', 'Conduction Deafness', 'Conduction', 'Hearing loss from damage to the parts that conduct sound to the cochlea, like the eardrum or ossicles.');
T('1.6', 'deaf', 'sensorineural-deafness', 'Sensorineural Deafness', 'Sensorineural', 'Hearing loss from damage to the cochlea’s hair cells or the auditory nerve.');
T('1.6', 'deaf', 'cochlear-implant', 'Cochlear Implant', '', 'A device that turns sounds into electrical signals that stimulate the auditory nerve.');
T('1.6', 'pitch', 'sound-localization', 'Sound Localization', 'Localization', 'Finding where a sound comes from by comparing when and how loudly it reaches each ear.');

/* ---- 1.6D Chemical senses, touch, pain ---- */
T('1.6', 'chem', 'olfaction', 'Olfaction', '', 'The sense of smell; the only sense that skips the thalamus on its way to the cortex.');
T('1.6', 'chem', 'pheromones', 'Pheromones', '', 'Chemical signals released by an animal that trigger social or behavioral responses in others.');
T('1.6', 'chem', 'gustation', 'Gustation', '', 'The sense of taste.');
T('1.6', 'chem', 'taste-receptors', 'Taste Receptors', '', 'Cells inside taste buds that detect chemicals dissolved in saliva.');
T('1.6', 'taste', 'umami', 'Umami', '', 'A savory basic taste linked to proteins, like broth or parmesan.');
T('1.6', 'taste', 'oleogustus', 'Oleogustus', '', 'A proposed basic taste for fat.');
T('1.6', 'taster', 'supertasters', 'Supertasters', '', 'People with extra taste buds who are very sensitive to flavors, especially bitter ones.');
T('1.6', 'taster', 'medium-tasters', 'Medium Tasters', '', 'The majority of people, with an average number of taste buds.');
T('1.6', 'taster', 'nontasters', 'Nontasters', '', 'People with fewer taste buds and reduced sensitivity to tastes.');
T('1.6', 'touch', 'mechanoreceptors', 'Mechanoreceptors', '', 'Skin receptors that detect pressure and texture.');
T('1.6', 'touch', 'thermoreceptors', 'Thermoreceptors', '', 'Skin receptors that detect changes in temperature.');
T('1.6', 'touch', 'nociceptors', 'Nociceptors', '', 'Sensory receptors that detect harmful temperatures, pressures, or chemicals and signal pain.');
T('1.6', 'pain', 'gate-control', 'Gate Control Theory', 'Gate Control', 'A "gate" in the spinal cord blocks or allows pain signals; rubbing or distraction can close it.');
T('1.6', 'pain', 'phantom-limb', 'Phantom Limb Sensation', 'Phantom Limb', 'Feeling sensations or pain in a limb that has been amputated.');
T('1.6', 'pain', 'biopsychosocial-pain', 'Biopsychosocial Approach to Pain', 'Biopsychosocial', 'Pain is shaped by biological signals, psychological factors like attention, and social-cultural context.');

/* ---- 1.6E Balance and body position ---- */
T('1.6', 'body', 'vestibular-sense', 'Vestibular Sense', 'Vestibular', 'The sense of balance and head movement, from the semicircular canals in the inner ear.');
T('1.6', 'body', 'semicircular-canals', 'Semicircular Canals', 'Semicircular', 'Three fluid-filled loops in the inner ear that detect head rotation.');
T('1.6', 'body', 'kinesthesis', 'Kinesthesis', '', 'The sense of the position and movement of your body parts.');
T('1.6', 'body', 'vertigo', 'Vertigo', '', 'A spinning sensation when the vestibular system sends signals that conflict with the other senses.');
})();
