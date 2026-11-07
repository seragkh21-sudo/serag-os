/* Shared recency for English and EngoPlay. Exposure never awards answers or XP. */
(()=>{
  'use strict';
  const DAY=86400000,MAX=6000;
  const owner=()=>window.user?.id||null;
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/_+/g,' blank ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const wordKey=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
  const storage=()=> 'seragPracticeRecentV1:'+owner();
  const parsed=new Map();
  let snapshot=null,snapshotOwner=null,snapshotAt=0;

  function hash(text){
    let a=2166136261,b=5381;
    for(const c of text){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0)}
    return (a>>>0).toString(16)+'-'+(b>>>0).toString(16);
  }
  function key(q){return 'prompt:'+hash(normalize(q?.prompt)+'|'+normalize(q?.answer??q?.correct))}
  function readObject(name){
    try{
      const raw=localStorage.getItem(name)||'{}',previous=parsed.get(name);
      if(previous?.raw===raw)return previous.rows;
      const value=JSON.parse(raw),rows=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
      if(parsed.size>=4)parsed.clear();
      parsed.set(name,{raw,rows});return rows;
    }catch{return {}}
  }
  function activity(){
    const id=owner(),now=Date.now();
    if(snapshotOwner!==id||!snapshot||now-snapshotAt>100){
      snapshot=window.ENGOPLAY?.stats?.()||{};snapshotOwner=id;snapshotAt=now;
    }
    return snapshot;
  }
  function last(q){
    const local=readObject(storage()),remote=activity();let at=0;
    for(const id of [q.id,key(q)]){
      if(!id)continue;
      const exposure=window.ENGOPLAY?.exposureStatus?.(id);
      at=Math.max(at,Number(local[id])||0,Date.parse(exposure?.shown_at||'')||0,Number(remote?.lastAnsweredAt?.get?.(id))||0);
    }
    return at;
  }
  function recent(q,now=Date.now()){const at=last(q);return at>0&&now-at<DAY}
  function remember(q){
    if(!owner()||!q)return;
    snapshot=null;
    const at=Date.now(),rows={...readObject(storage())},ids=[q.id,key(q)].filter(Boolean);
    for(const id of ids)rows[id]=at;
    const pruned=Object.fromEntries(Object.entries(rows)
      .filter(([,v])=>Number.isFinite(v)&&at-v<7*DAY)
      .sort((a,b)=>b[1]-a[1]).slice(0,MAX));
    try{localStorage.setItem(storage(),JSON.stringify(pruned))}catch{}
    // Reuse the existing owner-only exposure table/queue; do not reset answer history.
    window.ENGOPLAY?.recordPresented?.(ids,new Date(at).toISOString());
  }
  const wordQuestion=w=>({id:w.id,prompt:'vocabulary '+normalize(w.phrase),answer:normalize(w.phrase)});
  function recentWord(w){
    if(recent(wordQuestion(w)))return true;
    const phrase=wordKey(w.phrase),prior=readObject('seragSentenceV21:'+owner())[phrase];
    const at=Math.max(Date.parse(prior?.at||'')||0,Date.parse(prior?.last_presented_at||'')||0);
    if(at>0&&Date.now()-at<DAY)return true;
    const remote=activity();
    return ['recognition:','sentence:','application:','match:'].some(prefix=>{
      const last=Number(remote?.lastAnsweredAt?.get?.(prefix+phrase))||0;
      return last>0&&Date.now()-last<DAY;
    });
  }
  window.SERAG_PRACTICE_STATE={key,recent,remember,recentWord,rememberWord(w){remember(wordQuestion(w))}};
})();
