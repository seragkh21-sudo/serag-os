/* B2 vocabulary/collocation Batch #02: validated additive EngoPlay adapter; no destructive writes. */
(()=>{
'use strict';
const SOURCE='/engoplay-advanced-batch-02.json?v=80';
const PREFIX='engoplay-advanced02:';
const TOPICS={
 phrasal:{id:PREFIX+'phrasal',title:'B2 Phrasal Verbs in Context',level:'B2',track:'Daily Interactive Practice',summary:'Use phrasal verbs for meetings, decisions, troubleshooting and everyday conversation.',formula:'Verb + particle(s) + the right object',examples:['We need to iron out the remaining issues.','She brushed up on her Japanese.']},
 collocations:{id:PREFIX+'collocations',title:'B2 Natural Collocations',level:'B2',track:'Daily Interactive Practice',summary:'Choose natural verb–noun and adjective–noun combinations instead of literal translations.',formula:'Verb + noun | Adjective + noun | Correct dependent preposition',examples:['We need to strike a balance.','The project requires scalable infrastructure.']},
 idioms:{id:PREFIX+'idioms',title:'B2 Idioms, Paraphrasing & Tone',level:'B2',track:'Daily Interactive Practice',summary:'Use idiomatic expressions and rewrite naturally without changing a speaker’s meaning.',formula:'Context + natural expression + preserved meaning',examples:['They pulled off the launch.','Off the top of my head, sales rose.']},
 vocabulary:{id:PREFIX+'vocabulary',title:'B2 Vocabulary in Real Context',level:'B2',track:'Daily Interactive Practice',summary:'Understand precise meaning in tech, product, work and everyday situations.',formula:'Target word + context clues + accurate meaning',examples:['A bottleneck slows down a workflow.','A trade-off gives up one advantage for another.']}
};
const CORRECTIONS={
34:[
 'The QA department will carry out a complete security review next week.',
 'The QA department will carry through a complete security review next week.',
 'The QA department will carry up a complete security review next week.',
 'The QA department will carry across a complete security review next week.'
],
39:[
 'Good managers must strike a balance between team autonomy and operational oversight.',
 'Good managers must hit a balance between team autonomy and operational oversight.',
 'Good managers must make a balance between team autonomy and operational oversight.',
 'Good managers must take a balance between team autonomy and operational oversight.'
],
44:[
 'Our UX designers need to conduct market research before finalizing the layout.',
 'Our UX designers need to make market research before finalizing the layout.',
 'Our UX designers need to create market research before finalizing the layout.',
 'Our UX designers need to perform up market research before finalizing the layout.'
],
49:[
 'Engineers should pay close attention to user accessibility feedback.',
 'Engineers should pay close attention on user accessibility feedback.',
 'Engineers should pay close attention at user accessibility feedback.',
 'Engineers should pay close attention over user accessibility feedback.'
],
54:[
 'The executive board agreed to take action on the compliance audit findings.',
 'The executive board agreed to make action on the compliance audit findings.',
 'The executive board agreed to do action on the compliance audit findings.',
 'The executive board agreed to give action on the compliance audit findings.'
],
59:[
 'We were so focused on brainstorming that we lost track of time.',
 'We were so focused on brainstorming that we lost track on time.',
 'We were so focused on brainstorming that we lost track at time.',
 'We were so focused on brainstorming that we lost track for time.'
],
64:[
 'Investing in automated QA testing will save money in the long run.',
 'Investing in automated QA testing will save money on the long run.',
 'Investing in automated QA testing will save money at the long run.',
 'Investing in automated QA testing will save money into the long run.'
],
69:[
 "We need to discuss the Q3 marketing budget during tomorrow's call.",
 "We need to discuss about the Q3 marketing budget during tomorrow's call.",
 "We need to discuss on the Q3 marketing budget during tomorrow's call.",
 "We need to discuss over the Q3 marketing budget during tomorrow's call."
],
74:[
 'The committee spent two hours trying to reach a consensus on the new policy.',
 'The committee spent two hours trying to reach to a consensus on the new policy.',
 'The committee spent two hours trying to reach at a consensus on the new policy.',
 'The committee spent two hours trying to reach into a consensus on the new policy.'
],
79:[
 'During the sync, the developer raised a concern regarding data security.',
 'During the sync, the developer raised up a concern regarding data security.',
 'During the sync, the developer raised over a concern regarding data security.',
 'During the sync, the developer raised into a concern regarding data security.'
]
};
const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const tokenise=s=>String(s||'').match(/[A-Za-z]+(?:[-’'][A-Za-z]+)*|[.,!?;:]/g)||[];
const exactTokens=(tokens,sentence)=>{const sort=x=>[...x].sort().join('\x1f');return sort(tokens)===sort(tokenise(sentence))};
const topicFor=item=>{
 const tags=(item.skill_tags||[]).join('|').toLowerCase();
 if(item.question_type==='vocabulary_matching'||/vocabulary|terminology|system_reliability|decision_analysis/.test(tags))return TOPICS.vocabulary.id;
 if(/phrasal|particle|idiomatic_preposition|transitive/.test(tags))return TOPICS.phrasal.id;
 if(/colloc|adjective_noun|verb_noun|make_vs|verb_preposition/.test(tags))return TOPICS.collocations.id;
 return TOPICS.idioms.id;
};
function validate(data){
 if(!data||!Array.isArray(data.items)||data.items.length!==50)throw Error('Batch #02 must contain 50 questions.');
 const kinds={},seen=new Set();
 for(let i=0;i<data.items.length;i++){
  const q=data.items[i],number=i+31,expected='ENG-B2-'+String(number).padStart(3,'0');
  if(q.id!==expected||seen.has(q.id))throw Error('Invalid/duplicate ID '+q.id);
  seen.add(q.id);
  if(!/^B2\.[12]$/.test(q.cefr)||!q.prompt||!q.explanation)throw Error('Invalid level/content '+q.id);
  const kind=q.question_type;kinds[kind]=(kinds[kind]||0)+1;
  if(kind==='sentence_building'){
   if(!Array.isArray(q.token_array)||!q.token_array.length||!Array.isArray(q.accepted_sentences)||!q.accepted_sentences.length||q.accepted_sentences.some(answer=>!exactTokens(q.token_array,answer)))throw Error('Impossible sentence '+q.id);
  }else if(kind==='error_correction'){
   const choices=CORRECTIONS[number];
   if(!choices||choices[0]!==q.correct_sentence||choices[1]!==q.incorrect_sentence||new Set(choices).size!==4)throw Error('Unreviewed correction '+q.id);
  }else if(['multiple_choice','paraphrase_transformation','vocabulary_matching'].includes(kind)){
   if(!Array.isArray(q.options)||q.options.length!==4||new Set(q.options).size!==4||!q.options.includes(q.correct_answer))throw Error('Invalid answer '+q.id);
  }else throw Error('Unknown exercise type '+q.id);
 }
 for(const [kind,count] of Object.entries({multiple_choice:15,paraphrase_transformation:10,vocabulary_matching:5,sentence_building:10,error_correction:10})){
  if(kinds[kind]!==count)throw Error('Unexpected type count '+kind);
 }
}
function prepare(data){
 validate(data);
 const questions=[],sentenceBuild=[];
 for(const item of data.items){
  const numeric=Number(item.id.slice(-3)),topic=topicFor(item),kind=item.question_type;
  const common={id:PREFIX+item.id,topic,level:'B2',sourceCEFR:item.cefr,sourceOriginalId:item.id,
   sourceQuestionType:kind,sourceBatch:'advanced02',explanation:item.explanation,
   difficulty:item.difficulty,skillTags:item.skill_tags||[]};
  if(kind==='sentence_building'){
   sentenceBuild.push({...common,prompt:item.prompt,tokens:[...item.token_array],answer:item.accepted_sentences[0],
    acceptedAnswers:[...item.accepted_sentences]});
  }else{
   const opts=kind==='error_correction'?CORRECTIONS[numeric]:item.options;
   const answer=kind==='error_correction'?item.correct_sentence:item.correct_answer;
   questions.push({...common,prompt:kind==='error_correction'?item.prompt+' '+item.incorrect_sentence:item.prompt,
    incorrectSentence:item.incorrect_sentence||null,answer,options:shuffle(opts)});
  }
 }
 return {questions,sentenceBuild};
}
async function load(){
 const status={status:'loading',questions:[],sentenceBuild:[],questionCount:0,topicCount:0,correctionCount:0};
 window.SERAG_ADVANCED_BATCH02_V1=status;
 try{
  const response=await fetch(SOURCE,{credentials:'same-origin',cache:'no-store'});
  if(!response.ok)throw Error('Batch #02 HTTP '+response.status);
  const {questions,sentenceBuild}=prepare(await response.json());
  const supplement=window.SERAG_SUPPLEMENT_V13;
  if(!supplement||!Array.isArray(supplement.questions)||!Array.isArray(supplement.lessons))throw Error('Grammar collections unavailable.');
  const knownQuestions=new Set(supplement.questions.map(row=>row.id));
  supplement.questions.push(...questions.filter(row=>!knownQuestions.has(row.id)));
  const existingLessons=new Set(supplement.lessons.map(row=>row.id));
  const lessons=Object.values(TOPICS).map(topic=>{
   const sample=questions.find(row=>row.topic===topic.id);
   return {...topic,uses:[topic.summary],titleAr:'',mistake:'Focus on the intended meaning and the complete expression.',
    tip:'Read each option in its original context.',task:'Write one natural example from your own experience.',
    quiz:[sample?.prompt||topic.summary,sample?.answer||'Context matters',sample?.options?.find(option=>option!==sample?.answer)||'Unnatural usage']};
  });
  supplement.lessons.push(...lessons.filter(row=>!existingLessons.has(row.id)));
  Object.assign(status,{status:'ready',questions,sentenceBuild,questionCount:questions.length+sentenceBuild.length,
   topicCount:4,correctionCount:questions.filter(q=>q.sourceQuestionType==='error_correction').length,
   sourceStatus:'NotebookLM source references are unverified; do not display as confirmed citations.'});
 }catch(err){
  Object.assign(status,{status:'unavailable',error:String(err?.message||err)});
  console.warn('EngoPlay B2 Batch #02 unavailable:',err);
 }
 return status;
}
window.SERAG_ADVANCED_BATCH02_V1_READY=load();
})();