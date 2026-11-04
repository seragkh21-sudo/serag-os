/* Original EngoPlay adapters for open exercise patterns: matching and error correction. */
(()=>{
 'use strict';
 const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
 function matching(items){
  const rows=[],seen=new Set();
  for(const item of items||[]){const key=normalize(item?.phrase);if(!key||seen.has(key)||!item.meaning)continue;seen.add(key);rows.push({id:item.id||'vocab:'+key,item,phrase:item.phrase,meaning:item.meaning});if(rows.length===4)break}
  return rows.length===4?{id:'matching:'+rows.map(row=>normalize(row.phrase)).join('|'),kind:'match',pairs:rows}:null;
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
