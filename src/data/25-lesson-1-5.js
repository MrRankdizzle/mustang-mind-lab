/* Lesson 1.5 Sleep */
ML.data.lessons.push({
  id: '1.5', topic: '1.5', title: 'Sleep & Dreams', blurb: 'Circadian rhythm, sleep stages, dreams, and sleep disorders.',
  steps: [
    { kind: 'Big picture', title: 'A third of your life', blocks: [
      { type: 'hook', html: 'If you live to 90, you will spend about 30 of those years asleep. Far from being "off," your sleeping brain cycles through stages, sorts memories, and sometimes produces wild stories. When sleep goes wrong, mood, memory, and focus go with it.' },
      { type: 'text', html: [
        '{{Consciousness}} is our awareness of ourselves and our environment. It shifts throughout the day, influencing focus and performance.',
        'An {{altered state of consciousness}} is any condition that differs significantly from a normal waking state. Examples: sleep and dreaming, hypnosis, meditation and prayer, psychoactive drugs, daydreaming, and unconsciousness such as a coma.'
      ] },
      { type: 'cfu', q: { type: 'mc', id: '1.5-c1', q: 'Which is NOT an altered state of consciousness?', choices: ['Hypnosis', 'Daydreaming', 'Meditation', 'Alert, focused problem solving'], a: 3, why: 'Alert, focused thinking is the normal waking state. The others differ significantly from it.' } }
    ] },
    { kind: 'How it works', title: 'Your 24-hour clock', blocks: [
      { type: 'text', html: [
        'Your {{circadian rhythm}} is a roughly 24-hour biological clock that regulates sleep, wakefulness, body temperature, and other functions.',
        'It is controlled by the {{suprachiasmatic nucleus}} (SCN) in the hypothalamus. The SCN responds to light from the eyes to reset the cycle. As darkness falls, it cues the release of {{melatonin}}, which makes you sleepy.'
      ] },
      { type: 'widget', id: 'circadian-clock', caption: 'Drag the clock through a day. Then try an all-nighter, a flight east, and a phone at midnight.' },
      { type: 'text', h: 'Jet lag and all-nighters', html: '{{Jet lag}} happens when your body clock is out of sync with local time, which hurts mood, alertness, and thinking. It is usually worst flying west to east, because you have to shorten your day and fall asleep earlier than your body wants. An all-nighter throws the rhythm off in the same way.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.5-c2', q: 'Which structure resets the circadian rhythm in response to light?', choices: ['Hippocampus', 'Suprachiasmatic nucleus', 'Medulla', 'Amygdala'], a: 1, why: 'The SCN in the hypothalamus responds to light and sets the body clock.' },
        { type: 'mc', id: '1.5-c3', q: 'Why might scrolling on a bright phone at midnight make it harder to fall asleep?', choices: ['Light signals the SCN that it is daytime, delaying melatonin.', 'Light increases REM rebound.', 'Light triggers the medulla to slow breathing.', 'Phones lower adrenaline.'], a: 0, why: 'Bright light tells the SCN it is still day, so melatonin release is delayed.' }
      ] }
    ] },
    { kind: 'Physiology', title: 'The stages of sleep', blocks: [
      { type: 'text', html: [
        'Sleep cycles through stages about every {{90 minutes}}, four or five times a night. {{NREM}} (non-rapid eye movement) sleep has progressively deeper stages; {{REM}} sleep is when vivid dreams happen.',
        'Awake and relaxed, your brain shows {{alpha waves}}. In {{Stage 1}} (light sleep), you slow into theta waves and may have {{hypnagogic sensations}}, like a feeling of falling or hearing a sound as you drift off. {{Stage 2}} brings deeper relaxation and bursts of rapid activity called {{sleep spindles}}. {{Stage 3}} is deep sleep with large, slow {{delta waves}}. It is the hardest stage to wake from and crucial for physical restoration.',
        '{{REM sleep}} is called paradoxical sleep: the brain is highly active, but the body’s muscles are paralyzed. It is linked to vivid dreams and memory consolidation, especially for skills and information learned that day.'
      ] },
      { type: 'widget', id: 'hypnogram', caption: 'Drag through a full night. Watch the brain waves change, and notice when deep sleep and REM happen.' },
      { type: 'table', head: ['Stage', 'Brain waves', 'What happens'], rows: [
        ['Awake, relaxed', 'Alpha', 'Calm and drowsy'],
        ['NREM Stage 1', 'Alpha slowing to theta', 'Light sleep; hypnagogic jerks and images'],
        ['NREM Stage 2', 'Sleep spindles', 'Deeper relaxation; most of the night is here'],
        ['NREM Stage 3', 'Delta (slow, large)', 'Deep sleep; sleepwalking, sleep talking, night terrors, bed-wetting'],
        ['REM', 'Fast, wake-like', 'Vivid dreams; muscles paralyzed; memory consolidation']
      ] },
      { type: 'cfu', qs: [
        { type: 'order', id: '1.5-c4', q: 'Put the first sleep cycle of the night in order.', items: ['Awake and relaxed (alpha waves)', 'Stage 1 (light sleep)', 'Stage 2 (sleep spindles)', 'Stage 3 (delta waves)', 'REM sleep'], why: 'After Stage 3 you usually climb back up through Stage 2 before entering REM, but the order of first arrival is 1, 2, 3, then REM.' },
        { type: 'mc', id: '1.5-c5', q: 'Why is REM sleep called "paradoxical sleep"?', choices: ['The brain is very active while the body’s muscles are paralyzed.', 'It only happens during the day.', 'Brain waves are the slowest of the night.', 'It happens before Stage 1.'], a: 0, why: 'In REM the brain looks almost awake on an EEG, yet the body is essentially paralyzed.' }
      ] }
    ] },
    { kind: 'How it works', title: 'REM rebound and why dreams happen', blocks: [
      { type: 'text', h: 'REM rebound', html: 'If you are deprived of REM sleep, your brain makes up for it later with more frequent and intense REM. This is {{REM rebound}}. Alcohol, stress, and some drugs suppress REM, so when a person stops using them, REM rebound can bring vivid nightmares, which can push some people to keep using.' },
      { type: 'text', h: 'Why do we dream?', html: 'Other animals have REM sleep too, which suggests a biological need for REM and possibly for dreaming. Two biological theories try to explain dreams. {{Activation-synthesis theory}} says dreams are the brain’s way of making sense of random neural activity. {{Consolidation theory}} says dreams help process and solidify memories and experiences from the day.' },
      { type: 'widget', id: 'dream-theories', caption: 'Build a dream from random sparks, then watch memories get filed. Which theory explains each example?' },
      { type: 'note', h: 'Exam scope', html: 'Freud’s psychoanalytic view (dreams as wish fulfillment with hidden latent content) is famous, but the AP exam does not test it. Focus on activation-synthesis and consolidation.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.5-c6', q: 'Tia dreamed she was taking a test while riding a giraffe through her school. A psychologist says her brain was weaving random neural firing into a story. Which theory is that?', choices: ['Consolidation theory', 'Activation-synthesis theory', 'Opponent-process theory', 'REM rebound'], a: 1, why: 'Activation-synthesis: random brainstem activity during REM, which the cortex synthesizes into a story.' },
        { type: 'mc', id: '1.5-c7', q: 'After cramming lines for a play, Leo gets almost no REM sleep for two nights. On the third night, what is most likely?', choices: ['Less REM than normal', 'More and more intense REM (REM rebound)', 'No Stage 3 sleep at all', 'Night terrors in REM'], a: 1, why: 'REM deprivation leads to REM rebound: more frequent, intense REM later.' }
      ] }
    ] },
    { kind: 'Clinical connection', title: 'Sleep disorders', blocks: [
      { type: 'table', head: ['Disorder', 'What it looks like', 'When'], rows: [
        ['{{Insomnia}}', 'Trouble falling or staying asleep; tired and impaired during the day', 'Bedtime and through the night'],
        ['{{Narcolepsy}}', 'Sudden, uncontrollable sleep attacks, often straight into REM; sometimes sudden muscle weakness (cataplexy)', 'Any time, even mid-conversation'],
        ['{{Sleep apnea}}', 'Breathing repeatedly stops and starts; loud snoring and gasping; daytime sleepiness', 'Throughout sleep'],
        ['{{REM sleep behavior disorder}}', 'Acting out dreams because REM paralysis fails; mostly older men', 'REM'],
        ['{{Somnambulism}} (sleepwalking)', 'Walking or doing tasks while asleep', 'Deep NREM (Stage 3)'],
        ['{{Night terrors}}', 'Screaming and terror, usually not remembered; mostly children', 'Deep NREM (Stage 3), when muscles are not paralyzed']
      ] },
      { type: 'widget', id: 'sleep-clinic', caption: 'Diagnose each patient. Pay attention to the sleep stage clues.' },
      { type: 'apply', h: 'Sleep matters', html: 'Sleep is crucial for physical restoration, memory consolidation, and emotional regulation. Teens need about 8 to 10 hours a night. A consistent schedule, a dark and cool room, and putting screens away before bed all help your circadian rhythm do its job.' },
      { type: 'cfu', qs: [
        { type: 'mc', id: '1.5-c8', q: 'A 70-year-old man punches and kicks during vivid dreams and once fell out of bed. Which disorder fits best?', choices: ['Night terrors', 'Narcolepsy', 'REM sleep behavior disorder', 'Insomnia'], a: 2, why: 'Acting out dreams because REM paralysis fails is REM sleep behavior disorder, most common in older men.' },
        { type: 'mc', id: '1.5-c9', q: 'Why can people sleepwalk during Stage 3 but usually not during REM?', choices: ['Muscles are paralyzed during REM but not during Stage 3.', 'Stage 3 is the lightest stage of sleep.', 'People only dream during Stage 3.', 'The SCN turns off in Stage 3.'], a: 0, why: 'REM includes muscle paralysis. Deep NREM does not, so the body can move.' }
      ] }
    ] }
  ]
});
