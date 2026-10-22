/* Lesson 1.1 Heredity & Environment */
ML.data.lessons.push({
  id: '1.1', topic: '1.1', title: 'Heredity & Environment', blurb: 'Nature, nurture, and how scientists tell them apart.',
  steps: [
    { kind: 'Big picture', title: 'Who made you, you?', blocks: [
      { type: 'hook', h: 'The Jim Twins', html: 'In 1979, identical twins Jim Lewis and Jim Springer met for the first time at age 39. They had been adopted by different families as babies. Both had married women named Linda, divorced, and then married women named Betty. One named his son James Alan and the other named his James Allan. Both had a dog named Toy, and both drove Chevrolets. Coincidence? Genes? Some of both? That question is the heart of this lesson.' },
      { type: 'text', html: [
        'Psychologists ask how our genes and our experiences combine to make us who we are. This is the {{nature vs. nurture}} debate.',
        '{{Heredity}}, or nature, means genetic or predisposed characteristics that influence our physical, behavioral, and mental traits. {{Environment}}, or nurture, means the external factors we experience, like family interactions, culture, friends, and education.'
      ] },
      { type: 'widget', id: 'nn-spectrum', caption: 'Commit to a guess for each trait from class, then reveal what research says.' },
      { type: 'cfu', q: { type: 'mc', id: '1.1-c1', q: 'Which statement best matches what psychologists have found about nature and nurture?', choices: ['Most traits are caused by genes alone.', 'Most traits are caused by the environment alone.', 'Genes and environment interact to shape most traits.', 'Genes matter only for physical traits like height.'], a: 2, why: 'Genes set the stage (like a potential height range), and the environment, like nutrition, helps decide the outcome. They work as a dynamic duo.' } }
    ] },
    { kind: 'Structure', title: 'Genes: the instruction manual', blocks: [
      { type: 'text', html: [
        '{{Behavior genetics}} is the study of how genetic and environmental differences contribute to differences in behavior.',
        '{{Genes}} are the basic units of heredity. The complete set of genetic instructions for making an organism is its {{genome}}. {{Molecular genetics}} is the subfield of biology that studies the molecular structure and function of genes.'
      ] },
      { type: 'widget', id: 'gene-library', caption: 'Zoom from the whole cell down to a single gene using the library analogy from class.' },
      { type: 'note', h: 'Exam scope', html: 'The AP exam does not test genotype, phenotype, DNA structure, or dominant and recessive genes. Focus on how genes and environment interact to influence behavior.' },
      { type: 'cfu', q: { type: 'match', id: '1.1-c2', q: 'Match each part of the library analogy to the biology it stands for.', pairs: [['The library', 'Cell'], ['The room where books are kept', 'Nucleus'], ['One book', 'Chromosome'], ['The writing in the book', 'DNA'], ['One section with specific instructions', 'Gene']] } }
    ] },
    { kind: 'How it works', title: 'A dynamic duo: interaction', blocks: [
      { type: 'text', html: [
        'Genes and environment are not a tug-of-war. They {{interact}}: the effect of one depends on the other.',
        'Genes might set the stage, like a potential height, but nutrition helps decide where you land. Your genes can even steer the environments you seek out. An outgoing person may choose a social job, which then builds even more social skill.'
      ] },
      { type: 'analogy', h: 'Reciprocal determinism', html: 'Albert Bandura described a three-way loop between your behavior, your personal factors (thoughts and feelings), and your environment. Your actions can change your environment, your environment can shape your thoughts, and your thoughts can change your actions. Each piece influences and is influenced by the others.' },
      { type: 'text', h: 'Epigenetics: switches on the genes', html: '{{Epigenetics}} is the study of how the environment can turn genes on or off without changing the DNA itself. Experiences like chronic stress, nutrition, or caregiving leave chemical tags that change how strongly a gene is expressed.' },
      { type: 'widget', id: 'epigenetics-switch', caption: 'Play environment cards and watch gene expression change while the DNA letters stay exactly the same.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.1-c3', q: 'Rat pups that are licked and groomed a lot by their mothers grow up calmer under stress. What best explains this?', choices: ['A mutation in the pups’ DNA', 'Epigenetic changes in how stress-related genes are expressed', 'Natural selection within one generation', 'The pups inherited calm genes from their fathers'], a: 1, why: 'Licking does not rewrite DNA. It changes which stress-response genes are switched on, which is epigenetics.' },
        { type: 'tf', id: '1.1-c4', q: 'Epigenetic changes alter the sequence of letters in a person’s DNA.', a: false, why: 'False. Epigenetics changes gene expression (on/off, up/down), not the DNA sequence.' }
      ] }
    ] },
    { kind: 'How it works', title: 'The evolutionary perspective', blocks: [
      { type: 'text', html: [
        'The {{evolutionary perspective}} explains behaviors as products of {{natural selection}}: traits and behaviors that helped our ancestors survive and reproduce were more likely to be passed on to later generations (Darwin).',
        '{{Mutations}}, random changes in DNA, are one source of the variation that natural selection acts on.'
      ] },
      { type: 'apply', h: 'Why are so many people afraid of snakes?', html: 'Ancestors who were quick to avoid snakes and other dangerous animals were more likely to survive and have children. Over many generations, a readiness to fear snakes could spread through the population. That is an evolutionary explanation for a behavior.' },
      { type: 'reveal', q: 'Use the evolutionary perspective to explain why people crave sweet and fatty foods.', a: 'For ancestors, sweet and fatty foods were rare sources of energy. People who loved them ate more calories and were more likely to survive lean times, so those preferences were passed on. Today the same craving can backfire because high-calorie food is everywhere.' },
      { type: 'cfu', q: { type: 'mc', id: '1.1-c5', q: 'A psychologist argues that people prefer faces that look healthy because healthy partners helped ancestors raise more surviving children. Which perspective is this?', choices: ['Behavior genetics', 'Evolutionary perspective', 'Epigenetics', 'Reciprocal determinism'], a: 1, why: 'It explains a preference by how it helped ancestors survive and reproduce, which is the evolutionary perspective.' } }
    ] },
    { kind: 'Research', title: 'Twins, families, and adoptees', blocks: [
      { type: 'text', html: 'Scientists cannot ethically control people’s genes or childhoods, so they use natural experiments. {{Twin studies}}, {{family studies}}, and {{adoption studies}} are the common methods for studying the effects of genes on behavior.' },
      { type: 'widget', id: 'twin-builder', caption: 'Build identical and fraternal twins, then see why comparing them reveals the influence of genes.' },
      { type: 'table', h: 'Three ways to study nature and nurture', head: ['Method', 'What researchers compare', 'Logic'], rows: [
        ['Twin study', 'Identical (monozygotic) twins vs. fraternal (dizygotic) twins', 'If identical twins are more alike on a trait than fraternal twins, genes likely play a role.'],
        ['Adoption study', 'Adopted children vs. their biological and adoptive parents', 'Resembling biological parents points to genes; resembling adoptive parents points to environment.'],
        ['Family study', 'Relatives who share more or fewer genes', 'If a trait is more common in closer relatives, genes may be involved, though families also share environments.']
      ] },
      { type: 'cfu', qs: [
        { type: 'sort', id: '1.1-c6', q: 'Sort each fact into the right kind of twins.', bins: ['Identical (monozygotic)', 'Fraternal (dizygotic)'], items: [
          { t: 'One fertilized egg splits', bin: 0 }, { t: 'Share nearly all genes', bin: 0 }, { t: 'Always the same sex', bin: 0 },
          { t: 'Two eggs, two sperm', bin: 1 }, { t: 'Share about 50% of genes', bin: 1 }, { t: 'Can be a boy and a girl', bin: 1 }] },
        { type: 'mc', id: '1.1-c7', q: 'Why do researchers include fraternal twins in twin studies?', choices: ['They are easier to find than identical twins.', 'They give a baseline: they share an environment but only half their genes.', 'They always have different personalities.', 'They share more of their environment than identical twins do.'], a: 1, why: 'Fraternal twins grow up together like identical twins but share only about half their genes, so they are the comparison group that reveals genetic influence.' }
      ] }
    ] },
    { kind: 'How it works', title: 'Heritability', blocks: [
      { type: 'text', html: [
        '{{Heritability}} is the proportion of variation among individuals in a group that we can attribute to genes. It runs from 0 (differences are all environmental) to 1 (differences are all genetic), a bit like a correlation coefficient.',
        'In the Minnesota twin research, the heritability of intelligence was estimated around 0.70. That number describes differences across a group of people, not how much of one person’s intelligence comes from genes.'
      ] },
      { type: 'widget', id: 'heritability-lab', caption: 'Change how different the environments are and watch heritability change, even though the seeds stay the same.' },
      { type: 'note', h: 'AP exam trap', html: 'Heritability never applies to one individual. If environments become more equal, differences between people are more due to genes, so heritability goes up.' },
      { type: 'cfu', q: { type: 'mc', id: '1.1-c8', q: 'A psychologist finds that the heritability of intelligence in a particular population is 0.55. Which conclusion is most appropriate?', choices: ['55% of a person’s intelligence is caused by their genes.', '55% of the differences in intelligence within that population are associated with genetic differences.', 'An individual’s intelligence is 55% genetic and 45% environmental.', 'People with high intelligence are 55% more likely to have intelligent parents.'], a: 1, keep: true, why: 'Heritability describes variation within a group. It says nothing about the makeup of any one person.' } }
    ] },
    { kind: 'Clinical connection', title: 'Eugenics: the misuse of genetics', blocks: [
      { type: 'text', html: [
        '{{Eugenics}} was the idea of "improving" human populations through selective breeding and controlling who could reproduce, based on flawed ideas of "desirable" traits. It is a misuse of the evolutionary perspective.',
        'In the early 1900s, eugenics was taught in schools and promoted at fairs. Its supporters claimed that complex traits like intelligence and "worthiness" came from single genes.'
      ] },
      { type: 'clinical', h: 'Why eugenics was wrong', html: '<b>Racial and class bias:</b> It targeted immigrants, minorities, people with disabilities, and the poor, falsely labeling them "genetically inferior." <br><b>Forced sterilizations:</b> More than 60,000 people in the United States were sterilized without consent, often in prisons and mental hospitals. Wisconsin was one of the states with a sterilization law. <br><b>Human rights:</b> It ignored individual rights in the name of "breeding better humans," and its ideas of racial purity fueled Nazi Germany. <br><b>Bad science:</b> Complex traits are shaped by many genes plus the environment. Eugenics is condemned today as prejudice dressed up as science.' },
      { type: 'cfu', q: { type: 'mc', id: '1.1-c9', q: 'Which modern finding most directly shows that eugenics was scientifically wrong?', choices: ['Complex traits like intelligence are shaped by many genes interacting with the environment.', 'Identical twins share nearly all their genes.', 'Mutations are random changes in DNA.', 'Natural selection only works over many generations.'], a: 0, why: 'Eugenics assumed single genes determined complex traits. Modern genetics shows many genes plus environment shape them.' } }
    ] },
    { kind: 'Wrap-up', title: 'Put it together', blocks: [
      { type: 'bullets', items: [
        'Both genes and environment influence behavior, and they interact.',
        'The evolutionary perspective explains behaviors by how they helped ancestors survive and reproduce.',
        'Twin, adoption, and family studies give clues about nature and nurture.',
        'Heritability describes differences within a group, not individuals.',
        'Epigenetics shows the environment can switch genes on or off.',
        'Eugenics misused genetic ideas and caused real harm.'
      ] },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.1-c10', q: 'Researchers find that adopted children’s anxiety levels resemble their biological parents’ more than their adoptive parents’. This suggests anxiety is influenced by', choices: ['heredity', 'the shared family environment', 'reciprocal determinism', 'epigenetic changes caused by the adoptive home'], a: 0, why: 'Biological parents contributed genes but not the home environment, so resemblance to them points to heredity.' },
        { type: 'match', id: '1.1-c11', q: 'Match each term to its meaning.', pairs: [['Genome', 'Complete set of genetic instructions'], ['Mutation', 'Random change in DNA'], ['Natural selection', 'Helpful inherited traits get passed on'], ['Interaction', 'One factor’s effect depends on another']] }
      ] }
    ] }
  ]
});
