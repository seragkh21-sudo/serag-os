export const MAX_RECORDS=500;
export function normalize(value){return String(value??'').normalize('NFKC').toLowerCase().replace(/_+/g,' blank ').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
const text=v=>typeof v==='string'?v.trim():'';
export function validateEntry(raw,{filename='Imported article',level='B1'}={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Each record must be a question or article.');
 const kind=raw.kind||(raw.prompt||raw.question?'question':raw.type||'article');
 const selected=text(raw.level)||level;
 if(!['B1','B2','C1','C2'].includes(selected))throw Error('Choose a supported practice level: B1, B2, C1 or C2.');
 const topic=text(raw.topic)||'Imported practice';
 if(topic.length>100)throw Error('Topic is too long.');
 const page=Number(raw.source_page||raw.page)||null;
 if(page!==null&&(!Number.isInteger(page)||page<1||page>10000))throw Error('Invalid source page.');
 if(['question','mcq','choice'].includes(kind)){
  const prompt=text(raw.prompt||raw.question),options=Array.isArray(raw.options||raw.choices)?Array.from(raw.options||raw.choices,text):[];
  let answer=raw.answer??raw.correctAnswer??raw.correct;
  if(typeof answer==='number'&&Number.isInteger(answer))answer=options[answer];
  else if(typeof answer==='string'&&/^[A-D]$/i.test(answer.trim())&&!options.includes(answer.trim()))answer=options[answer.trim().toUpperCase().charCodeAt(0)-65];
  answer=text(answer);const explanation=text(raw.explanation||raw.explain);
  if(!prompt||prompt.length>2000)throw Error('A question needs a prompt of 1–2,000 characters.');
  if(options.length<2||options.length>4||options.some(x=>!x||x.length>500)||new Set(options.map(normalize)).size!==options.length)throw Error('Provide 2–4 distinct, non-empty choices (up to 500 characters each).');
  if(!answer||!options.includes(answer))throw Error('The source answer is missing or does not match a choice. Add or correct it before importing.');
  if(explanation.length>3000)throw Error('Explanation is too long.');
  return {kind:'question',payload:{prompt,options,answer,explanation,level:selected,topic},source_page:page};
 }
 if(kind!=='article')throw Error('Only questions and articles are supported in this release.');
 const title=text(raw.title)||filename.replace(/\.[^.]+$/,''),content=text(raw.content||raw.text||raw.body);
 if(!title||title.length>200)throw Error('An article needs a title of 1–200 characters.');
 if(content.length<20||content.length>200000)throw Error('Article text must contain 20–200,000 characters.');
 return {kind:'article',payload:{title,content,level:selected,topic},source_page:page};
}
export function collectRecords(data){
 let result=[];
 function walk(value,depth=0){
  if(depth>8)throw Error('The document structure is too deeply nested.');
  if(Array.isArray(value)){for(const row of value)walk(row,depth+1);return}
  if(!value||typeof value!=='object')return;
  if(value.prompt||value.question||value.content||value.body||value.text){result.push(value);if(result.length>MAX_RECORDS)throw Error('Import up to 500 records at a time.');return}
  for(const key of ['questions','articles','items','data','records'])if(value[key])walk(value[key],depth+1);
 }
 walk(data);if(!result.length)throw Error('No question or article records were found.');return result;
}
export function textRecords(input,{mode='auto',filename='Imported article',page=null}={}){
 const source=String(input).replace(/\r\n?/g,'\n').trim();
 if(!source)throw Error('No readable text was found. Scanned PDF pages need OCR first.');
 if(mode==='article'||(mode==='auto'&&!/^\s*[A-D][).:]\s+.+/im.test(source)))return [{kind:'article',title:filename.replace(/\.[^.]+$/,''),content:source,source_page:page}];
 const blocks=source.split(/(?=^\s*(?:Q(?:uestion)?\s*)?\d+[.) :]\s+)/im).filter(x=>x.trim());
 const records=[];
 for(const block of blocks){
  const lines=block.split('\n').map(x=>x.trim()).filter(Boolean),firstChoice=lines.findIndex(x=>/^[A-D][).:]\s+/.test(x));
  if(firstChoice<0)continue;
  const choices=[];let answer='',explanation='';
  let activeChoice=-1,readingExplanation=false;
  for(const line of lines.slice(firstChoice)){
   const option=line.match(/^([A-D])[).:]\s+(.+)$/);
   if(option){const index=option[1].charCodeAt(0)-65;if(choices[index]!==undefined)throw Error('Repeated choice letters were found in one block. Number each question clearly.');choices[index]=option[2];activeChoice=index;readingExplanation=false;continue}
   const key=line.match(/^(?:correct\s+answer|answer)\s*:\s*(.+)$/i);if(key){answer=key[1].trim();activeChoice=-1;continue}
   const why=line.match(/^(?:explanation|reason)\s*:\s*(.+)$/i);if(why){explanation=why[1];readingExplanation=true;activeChoice=-1;continue}
   if(readingExplanation)explanation+=' '+line;else if(activeChoice>=0)choices[activeChoice]+=' '+line;
  }
  const prompt=lines.slice(0,firstChoice).join(' ').replace(/^(?:Q(?:uestion)?\s*)?\d+[.) :]\s*/i,'');
  records.push({kind:'question',prompt,options:choices,answer,explanation,source_page:page});
 }
 if(!records.length)throw Error('No readable multiple-choice questions were found. Use numbered questions, A)–D) choices and an Answer: line, or choose Article mode.');
 if(records.length>MAX_RECORDS)throw Error('Import up to 500 records at a time.');return records;
}
export function identity(entry){const p=entry.payload;return entry.kind+'|'+normalize(entry.kind==='question'?p.prompt+'|'+p.answer:p.content)}
const promptKey=e=>e.kind==='question'?normalize(e.payload.prompt):null;
const tokens=e=>new Set(normalize(e.kind==='question'?e.payload.prompt:e.payload.content).split(' ').slice(0,120));
export function compareEntries(raw,baseline=[],options={}){
 if(raw.length>MAX_RECORDS)throw Error('Import up to 500 records at a time.');
 const exact=new Map(),prompts=new Map(),candidates=[];
 function index(entry,label){exact.set(identity(entry),label);const key=promptKey(entry);if(key)prompts.set(key,label);candidates.push({entry,label,words:tokens(entry)})}
 for(const entry of baseline)index(entry,entry.label||'Existing content');
 return raw.map((value,i)=>{
  let entry;try{entry=validateEntry(value,options)}catch(error){return {index:i,raw:value,status:'invalid',reason:error.message,selected:false}}
  const key=identity(entry),label=exact.get(key);let status='new',reason='New content';
  if(label){status='duplicate';reason='Already present: '+label}
  else if(promptKey(entry)&&prompts.has(promptKey(entry))){status='conflict';reason='The same prompt has a different answer. Resolve it before importing.'}
  else{
   const words=tokens(entry);
   if(words.size>=4)for(const old of candidates){if(old.entry.kind!==entry.kind||old.words.size<4)continue;let common=0;for(const word of words)if(old.words.has(word))common++;if(common/(words.size+old.words.size-common)>=.82){status='similar';reason='Similar wording to: '+old.label;break}}
  }
  index(entry,'record '+(i+1)+' in this file');
  return {index:i,raw:value,entry,status,reason,selected:status==='new'};
 });
}
