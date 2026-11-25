// Original Phase 1 practice. Existing q01–q128 and their progress identities stay intact.
const rows = [
  ['u1-l1','multiple_choice','Which is a complete subject–verb sentence?',['The train arrived.','The train.','Arrived at noon.','The train at noon.'],'The train arrived.','A subject and a finite verb make this clause complete.'],
  ['u1-l1','multiple_choice','In “The report is ready,” what follows the linking verb?',['a complement','a direct object','another subject','a past-tense verb'],'a complement','Ready describes the report; it is a subject complement.'],
  ['u1-l1','fill_blank','Complete the clause with the missing subject: “___ is important to check the brief.”','It','An ordinary declarative clause needs the subject it here.'],
  ['u1-l1','error_correction','Correct the fragment: “The designer finished.” is complete, but “Finished the design yesterday.” needs an explicit subject. Write the corrected second sentence.','The designer finished the design yesterday.','The second clause needs a subject before finished.'],
  ['u7-l1','multiple_choice','Choose the possessive pronoun: “This folder is ___.”',['mine','my','me','I'],'mine','Mine stands alone; my must come before a noun.'],
  ['u7-l1','fill_blank','Complete with a possessive determiner: “Maya checked ___ notes.”','her','Her modifies notes; hers would stand alone.'],
  ['u7-l1','error_correction',"Correct the possessive form: “This is their's.”",'This is theirs.','The possessive pronoun theirs has no apostrophe.'],
  ['u8-l1','multiple_choice','You are holding one file. Choose: “___ file is ready.”',['This','These','Those','They'],'This','This refers to one nearby thing.'],
  ['u8-l1','fill_blank','You are pointing to several distant buildings. Complete: “___ buildings are new.”','Those','Those refers to multiple things at a distance.'],
  ['u8-l1','error_correction','Correct the number mismatch: “These report is ready.”','This report is ready.','This agrees with the singular noun report.'],
  ['u9-l2','multiple_choice','The review happened first; the upload happened later. Choose: “We reviewed the file ___ uploading it.”',['before','after','during','until'],'before','Before marks the review as earlier than the upload.'],
  ['u9-l2','multiple_choice','Choose the sentence that puts lunch after the meeting.',['We had lunch after the meeting.','We had lunch before the meeting.','We had lunch during the meeting.','We had lunch until the meeting.'],'We had lunch after the meeting.','After places lunch later than the meeting.'],
  ['u9-l2','fill_blank','Complete the sequence: “First we tested the link. ___ that, we sent it.”','After','After that points back to the completed test.'],
  ['u9-l2','error_correction','Correct the sequence: “After we sent the file, we checked it first.” Write a sentence that clearly puts checking first.','We checked the file before we sent it.','Before makes checking earlier than sending.'],
  ['u10-l2','multiple_choice','The desk has a chair on each side. The desk is ___ the chairs.',['between','under','behind','next to'],'between','Between locates the desk in the space separating the two chairs.'],
  ['u10-l2','fill_blank','Complete: “The bag is directly ___ the desk, not on top of it.”','under','Under indicates a lower position.'],
  ['u10-l2','error_correction','Use “next to” to correct the location phrase: “The printer is between the desk.”','The printer is next to the desk.','Between needs two reference points; next to works with one.'],
  ['u11-l2','multiple_choice','Choose the regular past form of “plan” in “Yesterday, we ___ the shoot.”',['planned','planed','plans','planning'],'planned','A final consonant is doubled in planned.'],
  ['u11-l2','fill_blank','Complete with the past form of “carry”: “She ___ the boxes yesterday.”','carried','Consonant + y changes to ied in the past form.'],
  ['u11-l2','error_correction','Correct the past form: “We stoped filming at six.”','We stopped filming at six.','The final consonant doubles before -ed in stopped.'],
  ['u11-l3','multiple_choice','Choose the past form of “go”: “Last week, we ___ to the studio.”',['went','goed','goes','going'],'went','Went is the irregular past form of go.'],
  ['u11-l3','fill_blank','Complete with the past form of “write”: “Yesterday, she ___ the summary.”','wrote','Wrote is the irregular past form of write.'],
  ['u11-l3','error_correction','Correct the past form: “They buyed a new microphone.”','They bought a new microphone.','Bought is the irregular past form of buy.']
];
const unitFor = lessonId => lessonId.split('-')[0];
export const enrichment = { questions: rows.map(([lesson_id,type,prompt,optionsOrAnswer,answerOrExplanation,explanation],i)=>{
  const choice=type==='multiple_choice';
  const answer=choice?answerOrExplanation:optionsOrAnswer;
  return {
    id:`q${129+i}`,canonical_id:`serag-notebook-course-v1:phase-1:q${129+i}`,
    batch_id:'phase-1',unit_id:unitFor(lesson_id),lesson_id,type,
    skill:choice?'recognition':'production',prompt,
    ...(choice?{options:optionsOrAnswer}:{}),answer,accepted_answers:[answer],
    explanation:choice?explanation||answerOrExplanation:answerOrExplanation,
    origin:'newly_authored',source_refs:[],needs_review:false
  };
}) };
