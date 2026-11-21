/* Local, owner-scoped practice evidence. Not a CEFR or pronunciation assessment. */
(()=>{
 'use strict';
 const DAY=86400000,MAX=2000;
 const definitions=[
  ['recognition','Recognise meanings','Choosing or matching a meaning.'],
  ['recall','Recall from memory','Typing an expression without hints or an earlier error.'],
  ['grammar','Grammar & usage choices','Choosing a form or meaning in a sentence; this does not measure free writing.'],
  ['building','Sentence building','Ordering supplied words into a sentence.'],
  ['expression','Expression use checks','Checks target-expression use only, not grammar or writing quality.']
 ];
 const owner=()=>window.user?.id||null;
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const calendar=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'});
 const day=at=>calendar.format(new Date(at));
 const store=()=> 'seragSkillEvidenceV1:'+owner();
 let failedOwner=null;
 function fingerprint(value){let n=2166136261;for(const c of String(value||'').normalize('NFKC').toLowerCase().replace(/_+/g,' blank ').replace(/[^\p{L}\p{N}]+/gu,' ').trim())n=Math.imul(n^c.charCodeAt(0),16777619);return (n>>>0).toString(16)}
 function rows(now=Date.now()){
  if(!owner())return [];
  try{const data=JSON.parse(localStorage.getItem(store())||'[]');if(!Array.isArray(data))return [];
   return data.filter(r=>r&&definitions.some(d=>d[0]===r.skill)&&typeof r.key==='string'&&/^[a-f0-9]{1,8}$/.test(r.key)&&typeof r.at==='number'&&Number.isFinite(r.at)&&r.at<=now&&r.at>=now-90*DAY&&typeof r.correct==='boolean'&&typeof r.assisted==='boolean').slice(-MAX);
  }catch{failedOwner=owner();return []}
 }
 function record({skill,key,topic='',correct,assisted=false},now=Date.now()){
  if(!owner()||!definitions.some(d=>d[0]===skill)||!key||!Number.isFinite(now))return false;
  const list=rows(now),id=fingerprint(key),today=day(now);
  // A retry, reveal, alias or repeated exercise cannot overwrite the first evidence that day.
  if(list.some(r=>r.skill===skill&&r.key===id&&day(r.at)===today))return false;
  list.push({skill,key:id,topic:skill==='grammar'?String(topic).slice(0,100):'',correct:correct===true,assisted:assisted===true,at:now});
  try{localStorage.setItem(store(),JSON.stringify(list.slice(-MAX)));failedOwner=null;return true}catch{failedOwner=owner();return false}
 }
 function summarize(list,now=Date.now(),limited=false){
  const recent=[...list].sort((a,b)=>a.at-b.at).slice(-20),total=recent.length;
  const independent=recent.filter(r=>r.correct&&!r.assisted).length;
  const distinct=new Set(recent.map(r=>r.key)).size,days=new Set(recent.map(r=>day(r.at))).size;
  const last=recent.at(-1)?.at||0;
  let status='No evidence yet';
  if(total){status='Practising';if(!limited&&(now-last>14*DAY||recent.slice(-3).some(r=>!r.correct||r.assisted)))status='Needs review';
   else if(!limited&&total>=5&&distinct>=3&&days>=2&&independent/total>=.8)status='Consistent practice';}
  return {total,independent,distinct,days,last,status,accuracy:total?Math.round(independent/total*100):null};
 }
 function model(now=Date.now()){
  const ready=!!owner()&&window.ENGOPLAY?.isReady===true;
  if(!ready)return {ready:false,skills:[],topics:[]};
  const data=rows(now),skills=definitions.map(([id,title,description])=>({id,title,description,...summarize(data.filter(r=>r.skill===id),now,id==='expression')}));
  const topics=[...new Set(data.filter(r=>r.skill==='grammar'&&r.topic).map(r=>r.topic))].map(id=>({id,...summarize(data.filter(r=>r.skill==='grammar'&&r.topic===id),now)}));
  const legacy=window.SERAG_ACADEMY_V12?.homeState?.().attempts?.length||0;
  const prior=window.SERAG_WORD_PRACTICE?.progress?.()||{};const previousRecalls=Object.values(prior).reduce((n,r)=>n+(Number.isFinite(r?.independent)?Math.max(0,r.independent):0),0);
  return {ready,skills,topics,legacy,previousRecalls,saveFailed:failedOwner===owner()};
 }
 function html(){
  const report=model();if(!report.ready)return '<section class="ese-report"><h3>Skills beyond XP</h3><p>Load your practice history to see this account’s skills.</p><button type="button" data-ep-daily>Load practice history</button></section>';
  const labels=new Map((window.SERAG_ACADEMY_V12?.lessons?.()||[]).map(l=>[l.id,l.title]));
  return `<section class="ese-report" aria-labelledby="eseTitle"><h3 id="eseTitle">Skills beyond XP</h3><p>Recognition and recall are separate. XP rewards activity; these indicators describe observed practice.</p>${report.saveFailed?'<p role="alert">Skill evidence could not be saved on this browser. Existing answer saving is unchanged.</p>':''}<div class="ese-grid">${report.skills.map(s=>`<article class="ese-skill"><h4>${escape(s.title)}</h4><strong class="ese-status">${s.status}</strong><p>${escape(s.description)}</p>${s.total?`<p><b>${s.independent}/${s.total}</b> independent checks · ${s.accuracy}%<br>${s.distinct} different items · ${s.days} practice days</p>`:'<p>Complete a relevant exercise to begin collecting evidence.</p>'}${s.id==='recall'?'<button type="button" data-ese-recall>Start a separate recall session</button>':''}</article>`).join('')}</div><details class="ese-rules"><summary>How these indicators work</summary><p>Each skill uses its latest 20 item/day checks in a rolling 90-day window on this browser. Only the first check for an item each Cairo day counts. An incorrect answer, retry, hint or reveal is not independent success.</p><p>Consistent practice requires at least 5 checks, 3 different items, 2 days and 80% independent success, with no assisted or incorrect checks among the latest 3. A recent difficulty or 14 days without practice prompts review. Expression-use checks never establish writing proficiency.</p><p>This is a practice heuristic, not a validated mastery score, CEFR level or pronunciation assessment. Listening and speaking proficiency are not measured.</p></details><h4>Grammar by topic</h4><div class="ese-topics">${report.topics.map(t=>`<article><b>${escape(labels.get(t.id)||t.id)}</b><span>${t.status} · ${t.independent}/${t.total} independent checks</span></article>`).join('')||'<p>Topic evidence appears after grammar practice.</p>'}</div><p class="ese-note">${report.legacy} existing grammar answers and ${report.previousRecalls} previously recorded independent vocabulary recalls remain in your history. Older records do not reliably identify assistance and are not relabelled as independent skill evidence. New indicators are private to this account on this browser; they do not sync across devices. Storage retains up to 2,000 checks for 90 days.</p><button type="button" data-ep-review>Review mistakes and due items</button></section>`;
 }
 function compactHTML(){const report=model();if(!report.ready)return '';const needs=report.skills.filter(s=>s.status==='Needs review');return `<p class="ese-daily-note">${needs.length?'Skill to revisit: '+escape(needs[0].title)+'.':'Track recognition and recall separately as you practise.'} <button type="button" class="epath-link" data-ea-tab="progress">View my skills →</button></p>`}
 document.addEventListener('click',e=>{if(!e.target.closest?.('[data-ese-recall]')||!model().ready)return;if(typeof showPage==='function')showPage('english');window.SERAG_ACADEMY_V12?.open('words');window.SERAG_WORD_PRACTICE?.start(null,null,'Words and delayed recall',[],false)});
 window.SERAG_SKILL_EVIDENCE={record,model,html,compactHTML,summarize};
})();
