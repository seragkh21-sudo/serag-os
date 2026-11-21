/* Original practice inspired by the user's Subjunctive Mood and Position of adjectives handouts.
   Source examples and exercises are not copied. */
(() => {
  'use strict';
  const lessons = [
    {
      id:'focus-subjunctive-mood',level:'B2',track:'Verb forms',
      title:'The subjunctive: requests and imagined situations',titleAr:'��� ���� ��墩��',
      summary:'After a formal demand or recommendation, use the base verb. For an unreal present situation, use a past form; were is especially common in formal if/wish clauses.',
      formula:'suggest/insist that + subject + base verb | if/wish + subject + were | wish + past perfect (past regret)',
      uses:['The base verb stays the same for he, she and it: They insist that she attend.','The negative form is not + base verb: We recommend that he not leave early.','It is essential that the files be ready by noon.','If I were you expresses an imagined present situation; I wish I had checked refers to an earlier regret.'],
      examples:['The editor suggested that the team revise the opening scene.','It is important that every applicant be informed.','If I were in charge, I would allow more time.','I wish I had saved the earlier version.'],
      mistake:'Do not add -s in the formal that-clause: suggest that she attend, not suggests that she attends. In everyday British English, should attend is also natural.',
      tip:'Spot the trigger first: demand/recommend/essential ? base verb; unreal now ? past form; regret about the past ? had + past participle.',
      quiz:['The manager requested that each designer ___ a draft.','submit','submits'],
      task:'Write one recommendation, one unreal if-sentence and one sentence about a past regret.'
    },
    {
      id:'focus-adjective-position',level:'B1',track:'Adjectives',
      title:'Where adjectives go and how to order them',titleAr:'���� ��埢 ������',
      summary:'Most adjectives go before a noun or after a linking verb. Some go after indefinite pronouns; several adjectives before a noun usually follow a natural order.',
      formula:'adjective + noun | be/seem/look + adjective | something/anyone + adjective',
      uses:['A useful report; the report looks useful.','Something useful and anyone available put the adjective after the indefinite pronoun.','A beautiful old wooden desk follows opinion ? age ? material.','Use a comma between coordinate adjectives (a clear, concise brief), but usually not between cumulative adjectives (a small red bag).'],
      examples:['We need a reliable accounting system.','The figures seem accurate.','Is there anything urgent in the inbox?','She bought a small black leather bag.'],
      mistake:'Do not add commas between every pair of adjectives. In particular, a small, black, leather bag usually takes no commas because the adjectives build up toward the noun.',
      tip:'Try ?and? or reverse the adjectives: a clear and concise brief works, so a comma is natural; a leather and black bag sounds unnatural, so omit it.',
      quiz:['Choose the natural phrase: a ___ desk.','beautiful old wooden','wooden old beautiful'],
      task:'Describe an object using two adjectives, then rewrite the description after looks or seems.'
    }
  ];
  const questions = [
    ['focus-subj-01','focus-subjunctive-mood','The director insisted that everyone ___ on time.',['arrive','arrives','arrived'],'arrive','A formal insistence takes the base form, even with everyone.'],
    ['focus-subj-02','focus-subjunctive-mood','It is essential that the contract ___ signed today.',['be','is','was'],'be','After it is essential that, the formal subjunctive uses be for every subject.'],
    ['focus-subj-03','focus-subjunctive-mood','Which sentence is a formal recommendation?',['We recommend that she check the figures.','We recommend that she checks the figures.','We recommend that she checking the figures.'],'We recommend that she check the figures.','The formal that-clause uses the base form check.'],
    ['focus-subj-04','focus-subjunctive-mood','The client requested that we ___ publish the draft yet.',['not','do not','did not'],'not','A negative mandative subjunctive is not + base verb: not publish.'],
    ['focus-subj-05','focus-subjunctive-mood','If I ___ you, I would ask for the source files.',['were','am','will be'],'were','If I were you describes an imagined present situation.'],
    ['focus-subj-06','focus-subjunctive-mood','I wish I ___ the deadline before accepting the project.',['had checked','checked','will check'],'had checked','Had checked places the unreal action before the present regret.'],
    ['focus-subj-07','focus-subjunctive-mood','Which alternative is natural in everyday British English?',['They suggested that he should wait.','They suggested that he should waits.','They suggested that he waiting.'],'They suggested that he should wait.','Should + base verb is a common alternative to the formal mandative subjunctive.'],
    ['focus-subj-08','focus-subjunctive-mood','Which sentence describes an imagined present, rather than a past regret?',['I wish I were more confident.','I wish I had spoken sooner.','I wish I had saved the draft.'],'I wish I were more confident.','Wish + past form can express an unreal present state; wish + past perfect looks back.'],
    ['focus-adj-01','focus-adjective-position','Choose the natural sentence.',['The report looks accurate.','The report looks accurately.','The accurate looks report.'],'The report looks accurate.','Look is a linking verb here, so the adjective accurate describes the report.'],
    ['focus-adj-02','focus-adjective-position','Is there ___ we should fix before export?',['anything urgent','urgent anything','urgently anything'],'anything urgent','Adjectives normally follow indefinite pronouns such as anything and someone.'],
    ['focus-adj-03','focus-adjective-position','Choose the natural order.',['a beautiful old wooden desk','an old wooden beautiful desk','a wooden beautiful old desk'],'a beautiful old wooden desk','Opinion usually comes before age, then material.'],
    ['focus-adj-04','focus-adjective-position','Which phrase uses a comma between coordinate adjectives?',['a clear, concise summary','a clear, wooden summary','a small, red summary'],'a clear, concise summary','Clear and concise can be joined with and and can switch order.'],
    ['focus-adj-05','focus-adjective-position','Which phrase usually needs no comma?',['a small red bag','a small, red bag','a small, bag red'],'a small red bag','Size and color normally build up toward the noun, so there is usually no comma.'],
    ['focus-adj-06','focus-adjective-position','Choose the correct phrase.',['someone available','available someone','someone availably'],'someone available','Available follows the indefinite pronoun someone.'],
    ['focus-adj-07','focus-adjective-position','Which expression traditionally places the adjective after the noun?',['attorney general','general attorney','attorney generally'],'attorney general','Some established titles keep a postpositive adjective; the pattern is not general for all nouns.'],
    ['focus-adj-08','focus-adjective-position','Choose the natural phrase before a noun.',['a black-and-white photograph','a black white photograph','a black, and white photograph'],'a black-and-white photograph','Linked color words can form one compound modifier before a noun.']
  ].map(([id,topic,prompt,options,answer,explanation])=>({id,topic,prompt,options,answer,explanation}));
  const articles = [
    {
      title:'A Recommendation Before the Client Meeting',level:'B2',topic:'Work Communication',
      text:'The design team was preparing a campaign for a client meeting. The manager insisted that each designer submit a short explanation of the visual choices. She also recommended that the team not publish any draft before the client had reviewed it. One designer said, ?If I were presenting, I would show the simpler option first.? Later, he noticed an old version in the shared folder and wished he had checked the file names earlier. The team compared the versions, corrected the folder, and went into the meeting with a clear plan.',
      question:'What was the manager?s instruction before publishing?',
      answer:'The team should wait for the client to review the draft.',
      words:[['insist','ﭩ�'],['draft','����'],['version','뫦�']],
      checks:[['Which verb form follows ?insisted that each designer??',['submit','submits','submitted'],0,'A formal insistence takes the base verb submit.'],['What does ?If I were presenting? describe?',['An imagined situation now','A confirmed past event','A future certainty'],0,'Were presents a hypothetical situation.']]
    },
    {
      title:'Choosing Clear Descriptions for a Product Page',level:'B1',topic:'Writing & Design',
      text:'Maya was writing a product description for a small black leather bag. Her first draft called it ?a leather, black, small bag,? which sounded unnatural. She changed the order and removed the unnecessary commas. Then she asked a colleague whether anything important was missing. The colleague said the photographs looked sharp, but the description needed a measurement and a clear note about the material. Maya added both details. The final text was concise and useful because each adjective helped the reader picture a real feature.',
      question:'Why did Maya change her first description?',
      answer:'The adjective order and commas sounded unnatural.',
      words:[['concise','����'],['measurement','�'],['material','���']],
      checks:[['Which order did Maya use?',['size ? color ? material','material ? color ? size','color ? material ? size'],0,'A small black leather bag has a natural sequence.'],['Which word follows anything in the article?',['important','importantly','importance'],0,'An adjective can follow an indefinite pronoun.']]
    }
  ];
  const addUnique=(target,rows,key)=>{if(!Array.isArray(target))return;const seen=new Set(target.map(x=>x&&x[key]));for(const row of rows)if(!seen.has(row[key])){target.push(row);seen.add(row[key]);}};
  addUnique(window.SERAG_GRAMMAR_V10,lessons,'id');
  if(window.SERAG_SUPPLEMENT_V13) addUnique(window.SERAG_SUPPLEMENT_V13.questions,questions,'id');
  if(window.SERAG_ENGLISH_V9) addUnique(window.SERAG_ENGLISH_V9.articles,articles,'title');
})();

