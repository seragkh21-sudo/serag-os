/* Original examples. References explain the grammar; no source exercises are reproduced. */
(() => {
  const references = {
    deduction: 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/modals-deductions-about-past',
    conditional: 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/conditionals-third-mixed',
    inversion: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar/inversion-after-negative-adverbials',
    participle: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar/participle-clauses'
  };
  const groups = [
    ['B2', 'modal-deduction', 'deduction', [
      ['There is no other entrance, and the camera shows Mina using this door. She ___ through this door.', 'must have come', 'might not have come', 'can’t have come', 'Must have + past participle expresses a strong deduction about the past.'],
      ['The receipt confirms that we paid in cash. We ___ by card.', 'can’t have paid', 'must have paid', 'should have paid', 'Can’t have paid rules out a past possibility on the evidence.'],
      ['I have no proof, but it’s possible the package ___ at the wrong house.', 'might have arrived', 'must have arrived', 'can’t have arrived', 'Might have arrived expresses a possibility without certainty.'],
      ['The official schedule says the match was played in another town. It ___ at this stadium.', 'can’t have taken place', 'must have taken place', 'should have taken place', 'Can’t have taken place rules out this venue based on the schedule.'],
      ['We don’t know why the lights went off. Choose the tentative explanation.', 'There may have been a power cut.', 'There must have been a power cut.', 'There can’t have been a power cut.', 'May have been presents one possible explanation.'],
      ['The library’s records show the book was returned on time. It ___ overdue at the end of the day.', 'can’t have been', 'must have been', 'ought to have been', 'The record rules out its being overdue at that point.'],
      ['Choose the strong deduction. The oven was off and the food was still frozen.', 'Nobody can have cooked it.', 'Somebody must have cooked it.', 'Somebody might have eaten it warm.', 'Can’t have and nobody can have can express a conclusion that a past event was impossible.'],
      ['It’s possible that I wrote the number down incorrectly. I ___ the number wrong.', 'could have written', 'must have written', 'can’t have written', 'Could have written can express a possible past explanation.']
    ]],
    ['B2', 'third-conditional', 'conditional', [
      ['We missed the ferry because we left late. If we had left earlier, we ___ it.', 'would have caught', 'would catch', 'will have caught', 'The third conditional imagines a different past result.'],
      ['The plants died because nobody watered them. If someone ___ them, they would have survived.', 'had watered', 'would have watered', 'waters', 'Use past perfect in the if-clause for the unreal past condition.'],
      ['I didn’t know about the free concert. If I had known, I ___ a ticket.', 'would have booked', 'will book', 'would booked', 'Would have + past participle gives the imagined past consequence.'],
      ['We took the wrong path. Choose the unreal past alternative.', 'If we had read the map, we would have found the lake.', 'If we read the map tomorrow, we will find the lake.', 'If we lived nearby, we would visit every week.', 'Had read and would have found refer to a past alternative.'],
      ['She deleted the message. If she ___ a copy, she could have shown it to us.', 'had kept', 'would have kept', 'has kept', 'Had kept sets up an unreal past condition. Could have shown describes an unreal possibility.'],
      ['The café ran out of soup. If we had arrived a little earlier, there ___ some left.', 'might have been', 'might be', 'will have been', 'Might have been describes a possible result in the unreal past.'],
      ['They drove on a flat tyre. If they ___ sooner, they would have avoided the damage.', 'had stopped', 'would stop', 'will stop', 'Had stopped is past perfect and changes the past condition.'],
      ['He forgot to set the alarm yesterday. Imagine the result if he had set it.', 'He would have woken up earlier.', 'He would wake up earlier every day.', 'He will wake up earlier tomorrow.', 'Would have woken up locates the imagined result in the past.']
    ]],
    ['C1', 'negative-inversion', 'inversion', [
      ['Rarely ___ the northern lights this far south.', 'do we see', 'we see', 'we do see', 'Fronted rarely triggers auxiliary–subject inversion.'],
      ['Only after the river fell ___ the extent of the damage.', 'did we see', 'we saw', 'did we saw', 'Only after introduces the condition. Invert in the main clause and use the base verb after did.'],
      ['Under no circumstances ___ the emergency exit be blocked.', 'should', 'the door should', 'the exit should', 'Put the modal before the subject after the fronted negative phrase.'],
      ['Not until the final chapter ___ why the narrator had left.', 'did I understand', 'I understood', 'did I understood', 'The main clause inverts after the fronted not until expression.'],
      ['No sooner had the lecture ended ___ the audience began asking questions.', 'than', 'when', 'while', 'The conventional pair is no sooner … than.'],
      ['Hardly ___ our seats when the lights went out.', 'had we found', 'we had found', 'did we found', 'Hardly at the front triggers inversion. The past perfect marks the earlier event.'],
      ['Little ___ that the quiet street would soon become a busy market.', 'did they know', 'they knew', 'did they knew', 'Little in this negative sense triggers inversion, and did takes the base form.'],
      ['At no point ___ consent to publish my photograph, according to the recording.', 'did I give', 'I gave', 'did I gave', 'Fronted at no point requires auxiliary–subject inversion.']
    ]],
    ['C1', 'participle-clauses', 'participle', [
      ['Choose the introductory clause that shares its understood subject with “the cyclist”.', 'Approaching the junction, the cyclist slowed down.', 'Approaching the junction, the traffic light turned red.', 'Approaching the junction, a loud bell sounded.', 'The cyclist is the person approaching and the subject of the main clause.'],
      ['___ the last chapter, Nadia returned the book to the library. The reading was complete first.', 'Having finished', 'Having been finished', 'Being finished', 'The active perfect participle presents Nadia’s completed action before the main event.'],
      ['___ in the nineteenth century, the bridge still carries local traffic. The builders are unnamed.', 'Built', 'Building', 'Having built', 'Built has passive meaning here: the bridge was built.'],
      ['Choose the version in which the person waiting is explicit and correctly attached.', 'Waiting for the bus, I noticed a crack in the shelter.', 'Waiting for the bus, the shelter looked unsafe.', 'Waiting for the bus, the notice caught my eye.', 'I is the understood subject of waiting and the subject of noticed.'],
      ['___ what the sign meant, we asked the attendant. We did not understand it.', 'Not knowing', 'Knowing', 'Having understood', 'Not knowing provides the reason for asking.'],
      ['Choose the reduced clause that means “if the samples are kept cold”.', 'Kept cold, the samples remain usable.', 'Keeping cold, the technician stores the samples.', 'Having kept cold, the samples remain usable.', 'Kept cold is a passive participle clause describing a condition.'],
      ['___ by heavy snow, the mountain road remained shut all day.', 'Blocked', 'Blocking', 'Having blocked', 'The road was affected by the snow. The past participle gives that passive relationship.'],
      ['Choose the sentence in which the -ing clause naturally expresses the result.', 'The river overflowed, flooding the nearby fields.', 'Flooding the nearby fields, the town council met.', 'The nearby fields overflowed, flooding the river upstream.', 'The overflow caused the flooding, expressed by the final -ing clause.']
    ]]
  ];

  window.SERAG_B2_C1_PRACTICE = groups.flatMap(([level, topic, reference, items], group) =>
    items.map(([prompt, answer, firstDistractor, secondDistractor, explanation], index) => ({
      id: `general-english:${group + 1}:${index + 1}`,
      level, topic, prompt, answer, explanation,
      options: [answer, firstDistractor, secondDistractor],
      source: 'general-english',
      reference: references[reference]
    }))
  );
})();
