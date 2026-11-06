/* EngoPlay B1+ / B2 pilot: isolated, fail-open content adapter. No database writes. */
(() => {
  'use strict';
  const SOURCE = '/engoplay-advanced-batch-01.json?v=78';
  const PREFIX = 'engoplay-advanced01:';
  const TOPICS = {
    aspect: {id:PREFIX+'aspect',title:'Aspect & Time in Professional English',level:'B1',track:'Grammar Lab',summary:'Distinguish finished events from achievements and results that connect to the present.',formula:'Past Simple: completed event in a finished time | Present Perfect: have/has + past participle',examples:['We approved the plan yesterday.','We have made progress since January.']},
    language: {id:PREFIX+'language',title:'Workplace Phrasal Verbs & Collocations',level:'B2',track:'Daily Interactive Practice',summary:'Choose precise, natural workplace phrasing and respond appropriately in professional situations.',formula:'Phrasal verb + appropriate particle | Natural word combinations',examples:['We followed up with the client.','We mitigated the risk.']},
    structure: {id:PREFIX+'structure',title:'Advanced Sentence Structures & Register',level:'B2',track:'Grammar Lab',summary:'Use passive reporting, conditional inversion, modals and formal paraphrases without changing meaning.',formula:'It + be + past participle + that clause | Should + subject + base verb',examples:['It is believed by the board that the targets are realistic.','Should you need help, please contact us.']}
  };
  const ASPECT = new Set([1,2,7,12,14,19,21,26,28,29]);
  const LANGUAGE = new Set([3,5,6,8,11,15,18,20,22,30]);
  const correctionChoices = {
    14: [
      'Our DevOps team updated the core security protocols two days ago.',
      'Our DevOps team has updated the core security protocols two days ago.',
      'Our DevOps team has update the core security protocols two days ago.',
      'Our DevOps team had updating the core security protocols two days ago.'
    ],
    15: [
      'We need to follow up with the client about the pending invoice before Friday.',
      'We need to follow up to the client about the pending invoice before Friday.',
      'We need to follow up at the client about the pending invoice before Friday.',
      'We need to follow up in the client about the pending invoice before Friday.'
    ],
    16: [
      'The new software update appeared on the server yesterday.',
      'The new software update was appeared on the server yesterday.',
      'The new software update has appeared on the server yesterday.',
      'The new software update was appear on the server yesterday.'
    ],
    17: [
      'We should have launched the marketing campaign earlier in the quarter.',
      'We should have launch the marketing campaign earlier in the quarter.',
      'We should have launching the marketing campaign earlier in the quarter.',
      'We should launched the marketing campaign earlier in the quarter.'
    ],
    18: [
      'The company decided to make a major strategic shift in Q4.',
      'The company decided to do a major strategic shift in Q4.',
      'The company decided to doing a major strategic shift in Q4.',
      'The company decided for make a major strategic shift in Q4.'
    ]
  };
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
  const shuffle = rows => {
    const result = [...rows];
    for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
    return result;
  };
  const tokensOf = text => String(text).match(/[A-Za-z]+(?:['’][A-Za-z]+)?|[.,!?;:]/g) || [];
  const exactTokens = (source, sentence) => {
    const provided=[...source].sort();
    const expected=tokensOf(sentence).sort();
    return provided.length===expected.length && provided.every((word,i)=>word===expected[i]);
  };
  const topicFor = n => ASPECT.has(n)?TOPICS.aspect.id:LANGUAGE.has(n)?TOPICS.language.id:TOPICS.structure.id;
  const levelFor = cefr => /^C2/i.test(cefr)?'C2':/^C1/i.test(cefr)?'C1':/^B2/i.test(cefr)?'B2':'B1';
  function validate(raw) {
    if(!raw || !Array.isArray(raw.items) || raw.items.length!==30) throw new Error('Expected 30 pilot items.');
    const seen=new Set(),counts={};
    for(const item of raw.items) {
      const m=/^ENG-B1P-(\d{3})$/.exec(String(item.id||''));
      const n=m&&Number(m[1]);
      if(!n||n<1||n>30||seen.has(n)) throw new Error('Duplicate or invalid source ID '+item.id);
      seen.add(n);
      const type=String(item.question_type||'');
      counts[type]=(counts[type]||0)+1;
      if(!/^B1\+|^B2\./.test(String(item.cefr||''))) throw new Error('Out-of-scope CEFR '+item.id);
      if(!item.prompt || !item.explanation) throw new Error('Missing prompt or explanation '+item.id);
      if(type==='sentence_building') {
        if(!Array.isArray(item.token_array)||!Array.isArray(item.accepted_sentences)||!item.accepted_sentences.length||
           item.accepted_sentences.some(answer=>!exactTokens(item.token_array,answer))) throw new Error('Unbuildable sentence '+item.id);
      } else if(type==='error_correction') {
        const choices=correctionChoices[n];
        if(!choices || choices[0]!==item.correct_sentence || choices[1]!==item.incorrect_sentence) throw new Error('Unreviewed correction '+item.id);
      } else {
        if(!Array.isArray(item.options)||item.options.length!==4||new Set(item.options).size!==4||
           !item.options.includes(item.correct_answer)) throw new Error('Invalid choice item '+item.id);
      }
    }
    if(counts.sentence_building!==6||counts.error_correction!==5||
       Object.entries(counts).filter(([kind])=>kind!=='sentence_building'&&kind!=='error_correction').reduce((sum,[,count])=>sum+count,0)!==19){
      throw new Error('Unexpected question-type counts.');
    }
  }
  function prepare(raw) {
    validate(raw);
    const questions=[],sentenceBuild=[];
    for(const item of raw.items) {
      const id=PREFIX+item.id,number=Number(item.id.slice(-3)),topic=topicFor(number);
      const common={id,topic,level:levelFor(item.cefr),sourceCEFR:item.cefr,
        sourceQuestionType:item.question_type,sourceOriginalId:item.id,
        sourceBatch:'advanced01',explanation:item.explanation,difficulty:item.difficulty,skillTags:item.skill_tags||[]};
      if(item.question_type==='sentence_building') {
        sentenceBuild.push({...common,prompt:item.prompt,tokens:[...item.token_array],
          answer:item.accepted_sentences[0],acceptedAnswers:[...item.accepted_sentences]});
      } else {
        const options=item.question_type==='error_correction'
          ?correctionChoices[number] :item.options;
        const answer=item.question_type==='error_correction'
          ?item.correct_sentence:item.correct_answer;
        questions.push({...common,prompt:item.question_type==='error_correction'
            ?'Choose the correct form of this sentence: '+item.incorrect_sentence
            :[item.scenario_text,item.prompt].filter(Boolean).join(' '),
          incorrectSentence:item.incorrect_sentence||null,
          answer,options:shuffle(options)});
      }
    }
    return {questions,sentenceBuild};
  }
  async function load() {
    const status={status:'loading',questions:[],sentenceBuild:[],topicCount:0,questionCount:0,correctionCount:0};
    window.SERAG_ADVANCED_BATCH01_V1=status;
    try {
      const response=await fetch(SOURCE,{credentials:'same-origin',cache:'no-store'});
      if(!response.ok) throw new Error('Pilot bank HTTP '+response.status);
      const {questions,sentenceBuild}=prepare(await response.json());
      const supplement=window.SERAG_SUPPLEMENT_V13;
      if(!supplement||!Array.isArray(supplement.questions)||!Array.isArray(supplement.lessons)) throw new Error('Grammar collections unavailable.');
      const oldQuestionIds=new Set(supplement.questions.map(row=>row.id));
      const oldLessonIds=new Set(supplement.lessons.map(row=>row.id));
      supplement.questions.push(...questions.filter(row=>!oldQuestionIds.has(row.id)));
      const lessons=Object.values(TOPICS).map(topic=>{
        const sample=questions.find(row=>row.topic===topic.id);
        return {...topic,uses:[topic.summary],titleAr:'',mistake:'Read the time expressions and keep the original meaning.',tip:'Use the explanation after each attempt to check why an alternative is wrong.',
          task:'Practise the advanced questions and write one new example of your own.',
          quiz:[sample.prompt,sample.answer,sample.options.find(option=>option!==sample.answer)]};
      });
      supplement.lessons.push(...lessons.filter(row=>!oldLessonIds.has(row.id)));
      Object.assign(status,{status:'ready',questions,sentenceBuild,topicCount:3,
        questionCount:questions.length+sentenceBuild.length,correctionCount:questions.filter(q=>q.sourceQuestionType==='error_correction').length,
        sourceStatus:'NotebookLM-generated; research/source anchors not independently verified.'});
    } catch(error) {
      Object.assign(status,{status:'unavailable',error:String(error&&error.message||error)});
      console.warn('EngoPlay advanced pilot could not load:',error);
    }
    return status;
  }
  window.SERAG_ADVANCED_BATCH01_V1_READY=load();
})();
