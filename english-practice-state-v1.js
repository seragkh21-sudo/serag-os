/* Shared practice rotation for English and EngoPlay. Exposure never awards XP. */
(()=>{
  'use strict';
  const DAY=86400000;
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
      at=Math.max(at,Number(local[id])||0,Date.parse(exposure?.shown_at||'')||0,Number(remote?.lastAnsweredAt?.get?.(id)??remote?.lastAnsweredAt?.[id])||0);
    }
    return at;
  }
  function recent(q,now=Date.now()){const at=last(q);return at>0&&now-at<DAY}
  function pool(list,{identify=key,lastAt=last,wasSeen=()=>false,available=()=>true,allowRepeat=true}={},now=Date.now()){
    const groups=new Map(),fresh=[],seen=[];
    for(const q of list){
      const id=identify(q),old=groups.get(id),at=Number(lastAt(q))||0;
      groups.set(id,{q:old?.q||q,at:Math.max(old?.at||0,at),seen:!!old?.seen||!!at||wasSeen(q),available:(old?.available??true)&&available(q)});
    }
    for(const row of groups.values()){
      if(!row.seen)fresh.push(row.q);
      else if((!row.at||now-row.at>=DAY)&&row.available)seen.push(row);
    }
    // Never fill a short unseen batch with reviews. Once exhausted, rotate oldest first.
    return fresh.length?fresh:!allowRepeat?[]:seen.sort((a,b)=>a.at-b.at).map(row=>row.q);
  }
  function remember(q){
    if(!owner()||!q)return;
    snapshot=null;
    const at=Date.now(),rows={...readObject(storage())},ids=[q.id,key(q)].filter(Boolean);
    for(const id of ids)rows[id]=at;
    // This is also the durable seen index. Expiring it makes old prompts look new.
    const pruned=Object.fromEntries(Object.entries(rows).filter(([,v])=>Number.isFinite(v)));
    try{localStorage.setItem(storage(),JSON.stringify(pruned))}catch{}
    // Reuse the existing owner-only exposure table/queue; do not reset answer history.
    window.ENGOPLAY?.recordPresented?.(ids,new Date(at).toISOString());
  }
  const wordQuestion=w=>({id:w.id,prompt:'vocabulary '+normalize(w.phrase),answer:normalize(w.phrase)});
  function wordLast(w){
    const phrase=wordKey(w.phrase),prior=readObject('seragSentenceV21:'+owner())[phrase];
    let at=Math.max(last(wordQuestion(w)),Date.parse(prior?.at||'')||0,Date.parse(prior?.last_presented_at||'')||0);
    const remote=activity();
    for(const prefix of ['recognition:','sentence:','application:','match:'])at=Math.max(at,Number(remote?.lastAnsweredAt?.get?.(prefix+phrase)??remote?.lastAnsweredAt?.[prefix+phrase])||0);
    return at;
  }
  function recentWord(w,now=Date.now()){const at=wordLast(w);return at>0&&now-at<DAY}
  window.SERAG_PRACTICE_STATE={key,last,pool,recent,remember,wordLast,recentWord,rememberWord(w){remember(wordQuestion(w))}};
})();
