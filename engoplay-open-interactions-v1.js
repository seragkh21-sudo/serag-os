/* Original EngoPlay adapters for open exercise patterns: matching and error correction. */
(()=>{
 'use strict';
 const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
 // Curated meanings are deliberately paraphrased rather than word-for-word translations.
 // Unknown vocabulary falls back to source examples (with the answer removed) or original translations.
 const definitions=Object.freeze({
  'a win-win':'an outcome that brings meaningful benefits to both sides',
  'customer journey':'the complete experience someone has with a business before and after a purchase',
  'sedentary':'involving a lot of sitting and very little physical movement',
  'take a toll on me':'gradually harm my health, mood or ability to cope',
  'assumption':'a belief accepted without enough proof that it is true',
  'align':'bring different people or plans into agreement',
  'align on':'reach a shared understanding or agreement about something',
  'stuck':'unable to make progress despite trying',
  'vanish':'disappear completely, often suddenly',
  'prejudice':'an unfair judgment formed before knowing the facts',
  'vicious':'deliberately cruel, violent or harmful',
  'clarify':'make an unclear point easier to understand',
  'keep someone posted':'continue telling someone about important updates',
  'get back to someone':'reply after having time to check or think',
  'raise a concern':'bring up a possible problem for discussion',
  'address an issue':'take action to deal with a particular problem',
  'take into account':'consider something when making a decision',
  'on track':'progressing according to the expected plan or schedule',
  'fall behind':'make less progress than needed to keep up',
  'move forward':'continue with a plan after deciding what to do',
  'run something by someone':'ask for a quick opinion before taking action',
  'touch base':'make brief contact to exchange updates',
  'bring forward':'move a planned event to an earlier time',
  'push back':'move a planned event to a later time',
  'scope of work':'the agreed boundaries and deliverables of a project',
  'deliverable':'a specific result or item promised for completion',
  'turnaround time':'the time needed between receiving a request and completing it',
  'trust my instincts':'rely on my immediate judgment without fully explaining why',
  'gut feeling':'a strong intuition without clear supporting evidence',
  'go with my gut':'make a choice by following an instinctive feeling',
  'have a hunch':'suspect that something may be true without being certain',
  'second-guess myself':'keep doubting or reconsidering a decision already made',
  'sleep on it':'delay a decision until after having time to think',
  'butt heads':'argue repeatedly because opinions or approaches clash',
  'see eye to eye':'have the same opinion or understanding',
  'agree to disagree':'accept that two people will continue to hold different views',
  'meet halfway':'each give up part of what they want to reach an agreement',
  'stand my ground':'refuse to change my position under pressure',
  'carry out':'perform or complete a planned action',
  'break down':'stop functioning or divide a complex issue into smaller parts',
  'figure out':'understand or solve something after thinking about it',
  'come across':'find by chance or give a particular impression',
  'deal with':'handle a difficult situation or responsibility',
  'take for granted':'fail to appreciate something because it seems certain to continue',
  'burn out':'become exhausted after prolonged stress or overwork',
  'set boundaries':'establish limits around what behavior or demands are acceptable',
  'give someone a heads-up':'warn or inform someone briefly in advance',
  'keep an eye on':'watch something closely for changes or problems',
  'get the hang of':'gradually learn to do something comfortably',
  'work around':'find another way to progress despite an obstacle',
  'get carried away':'become so excited or involved that you lose restraint',
  'under pressure':'having to perform despite stress or difficult demands',
  'come up with':'think of a new idea, solution or plan',
  'take a step back':'create distance from a situation to consider it objectively',
  'go the extra mile':'make more effort than is normally expected',
  'worthwhile':'valuable enough to justify the effort or cost',
  'overwhelmed':'feeling unable to manage the number or intensity of demands',
  'reliable':'consistently able to be trusted or depended on',
  'efficient':'achieving good results without wasting resources',
  'evaluate':'judge the quality or value using evidence or criteria',
  'approach':'a particular method of dealing with a problem',
  'perspective':'a way of understanding a situation from a point of view',
  'priority':'something that deserves attention before other things',
  'outcome':'the final result of an action or process',
  'compromise':'an agreement in which each side gives up part of its demands',
  'adapt':'change behavior or methods to suit new conditions',
  'consistent':'remaining similar in quality or behavior over time',
  'concern':'a problem or risk that causes worry',
  'commitment':'willingness to keep doing something despite difficulties',
  'critical thinking':'carefully assessing claims and evidence instead of accepting them immediately'
 });
 function shuffled(values){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
 function matchingLayout(count){
  const ids=Array.from({length:count},(_,index)=>index),wordOrder=shuffled(ids);
  let meaningOrder=shuffled(ids);
  // A correct pair must NEVER appear opposite itself; re-randomize the independent column.
  for(let attempts=0;attempts<32&&meaningOrder.some((id,pos)=>id===wordOrder[pos]);attempts++)meaningOrder=shuffled(ids);
  if(meaningOrder.some((id,pos)=>id===wordOrder[pos]))meaningOrder=wordOrder.slice(1).concat(wordOrder[0]);
  return {wordOrder,meaningOrder};
 }
 function maskedExample(item){
  const source=String(item?.example||item?.examples?.find(Boolean)||'').trim();
  const phrase=String(item?.phrase||'').trim();
  if(!phrase||source.length<34)return '';
  const pos=source.toLowerCase().indexOf(phrase.toLowerCase());
  if(pos<0)return '';
  const before=source.slice(0,pos),after=source.slice(pos+phrase.length);
  if(/[a-z]$/i.test(before)||/^[a-z]/i.test(after))return '';
  const masked=before+'_____'+after;
  // Avoid meaningless blanks such as "It is _____."
  return masked.replace(/_____/g,'').trim().split(/\s+/).length>=6?masked:'';
 }
 function matching(items){
  const rows=[],seen=new Set(),seenMeanings=new Set();
  for(const item of items||[]){
   const key=normalize(item?.phrase),meaningKey=normalize(item?.meaning);
   if(!key||seen.has(key)||!meaningKey||seenMeanings.has(meaningKey))continue;
   seen.add(key);seenMeanings.add(meaningKey);
   rows.push({id:item.id||'vocab:'+key,item,phrase:item.phrase,meaning:item.meaning});
   if(rows.length===4)break;
  }
  if(rows.length!==4)return null;
  const contexts=rows.map(row=>maskedExample(row.item));
  const allContext=contexts.every(Boolean)&&new Set(contexts.map(normalize)).size===rows.length;
  const english=rows.map(row=>row.item?.definitionEn||definitions[normalize(row.phrase)]||'');
  const allEnglish=english.every(Boolean);
  const matchMode=allContext&&(!allEnglish||Math.random()<.65)?'context':allEnglish?'definitions':'translation';
  rows.forEach((row,index)=>{
   row.clue=matchMode==='context'?contexts[index]:matchMode==='definitions'?english[index]:row.meaning;
   row.clueLanguage=matchMode==='translation'?'ar':'en';
  });
  return {id:'matching:'+rows.map(row=>normalize(row.phrase)).join('|'),kind:'match',pairs:rows,matchMode,...matchingLayout(rows.length)};
 }
 function correction(question){
  if(!question||!Array.isArray(question.options)||question.options.length<2)return null;
  const wrong=question.options.find(option=>normalize(option)!==normalize(question.answer));
  if(!wrong)return null;
  const prompt=String(question.prompt||'');
  const pattern=/(?:_{2,}|…+|\[\s*\])/;
  if(!pattern.test(prompt))return null;
  return {id:String(question.id)+':correction',kind:'correction',grammar:question,answer:question.answer,options:[...question.options],incorrectSentence:prompt.replace(pattern,wrong),incorrectOption:wrong};
 }
 window.SERAG_ENGOPLAY_INTERACTIONS_V1={matching,correction,normalize};
})();
