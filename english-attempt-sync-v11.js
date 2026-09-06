(()=>{
  const TABLE='english_quiz_attempts';
  const PENDING_KEY='seragEnglishPendingAttemptsV11';
  const REVIEW_SESSION_KEY='seragEnglishReviewAttemptSessionV11';
  const today=()=>new Date().toLocaleDateString('en-CA');
  const makeId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  const norm=s=>String(s??'').toLowerCase().trim().replace(/[’']/g,"'").replace(/\s+/g,' ').replace(/[.!?]+$/g,'');
  const client=()=>typeof sb!=='undefined'?sb:null;
  const userId=()=>typeof user!=='undefined'&&user?.id?user.id:null;

  function readPending(){
    try{const x=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}
  }
  function writePending(list){
    try{localStorage.setItem(PENDING_KEY,JSON.stringify(list))}catch{}
  }
  let flushing=false;
  async function flushPending(){
    if(flushing)return;
    const db=client(),uid=userId();
    if(!db||!uid)return;
    flushing=true;
    try{
      let batches=readPending();
      for(const batch of [...batches]){
        const rows=Array.isArray(batch?.rows)?batch.rows:[];
        if(!rows.length){batches=batches.filter(x=>x.id!==batch.id);writePending(batches);continue}
        const ids=rows.map(x=>x.client_event_id).filter(Boolean);
        let existing=new Set();
        if(ids.length){
          const check=await db.from(TABLE).select('client_event_id').eq('user_id',uid).in('client_event_id',ids);
          if(check.error){console.warn('English attempt sync check failed',check.error);break}
          existing=new Set((check.data||[]).map(x=>x.client_event_id));
        }
        const missing=rows.filter(x=>!existing.has(x.client_event_id));
        if(missing.length){
          const saved=await db.from(TABLE).insert(missing);
          if(saved.error){console.warn('English attempt sync failed',saved.error);break}
        }
        batches=readPending().filter(x=>x.id!==batch.id);
        writePending(batches);
      }
    }catch(err){console.warn('English attempt sync failed',err)}
    finally{flushing=false}
  }
  function queueRows(id,rows){
    if(!rows?.length)return;
    const pending=readPending();
    if(!pending.some(x=>x.id===id)){
      pending.push({id,rows,queued_at:new Date().toISOString()});
      writePending(pending);
    }
    void flushPending();
  }
  function baseRow(extra={}){
    return {
      client_event_id:makeId(),
      attempt_date:today(),
      source:extra.source||'daily_quiz',
      attempt_session:extra.attempt_session||null,
      attempt_order:extra.attempt_order??null,
      question_number:extra.question_number??null,
      section:extra.section||null,
      question_type:extra.question_type||null,
      prompt:String(extra.prompt||''),
      selected_answer:extra.selected_answer==null?null:String(extra.selected_answer),
      correct_answer:String(extra.correct_answer||''),
      is_correct:Boolean(extra.is_correct),
      explanation:extra.explanation||null,
      options:Array.isArray(extra.options)?extra.options:[],
      metadata:extra.metadata&&typeof extra.metadata==='object'?extra.metadata:{}
    };
  }

  function visibleDailyOrder(quiz){
    const label=quiz?.querySelector('.el6-muted')?.textContent||'';
    const regular=label.match(/·\s*(\d+)\/10/);
    if(regular)return Number(regular[1]);
    const bonus=label.match(/Bonus\s+(\d+)/i);
    if(bonus)return 10+Number(bonus[1]);
    try{const x=JSON.parse(localStorage.getItem('seragEnglishV9')||'{}');return Math.max(1,Number(x.answers||0)+1)}catch{return 1}
  }
  function trackDailyQuiz(button){
    const quiz=button.closest('#el9Quiz')||document.querySelector('#el9Quiz');
    const optionsBox=button.closest('.el9-quiz-options');
    if(!quiz||!optionsBox||optionsBox.querySelector('.correct,.wrong'))return;
    const selected=button.dataset.quizAnswer;
    const correct=button.dataset.correct;
    if(selected==null||correct==null)return;
    const order=visibleDailyOrder(quiz);
    const label=quiz.querySelector('.el6-muted')?.textContent?.trim()||'Daily Quiz';
    const questionType=label.split('·')[0]?.trim()||'Daily Quiz';
    const prompt=quiz.querySelector('h3')?.textContent?.trim()||'';
    const options=[...optionsBox.querySelectorAll('[data-quiz-answer]')].map(x=>x.dataset.quizAnswer).filter(x=>x!=null);
    const row=baseRow({
      source:'daily_quiz',attempt_session:`daily:${today()}`,attempt_order:order,question_number:order,
      section:'Daily Quiz',question_type,prompt,selected_answer:selected,correct_answer:correct,
      is_correct:selected===correct,options,metadata:{version:11,ui:'english_v9'}
    });
    queueRows(`daily:${row.client_event_id}`,[row]);
  }

  function trackDailyGrammar(button){
    const box=button.closest('.el9-grammar-check');
    if(!box)return;
    const selected=button.dataset.grammarChoice,correct=button.dataset.correct;
    if(selected==null||correct==null)return;
    const section=button.closest('.el9-rule-today');
    const ruleTitle=section?.querySelector('h3')?.textContent?.trim()||'Grammar';
    const prompt=box.querySelector('span')?.textContent?.trim()||ruleTitle;
    const options=[...box.querySelectorAll('[data-grammar-choice]')].map(x=>x.dataset.grammarChoice).filter(x=>x!=null);
    const row=baseRow({
      source:'daily_grammar',attempt_session:`daily:${today()}`,section:ruleTitle,question_type:'Grammar choice',
      prompt,selected_answer:selected,correct_answer:correct,is_correct:selected===correct,options,
      metadata:{version:11,ui:'english_v9'}
    });
    queueRows(`grammar:${row.client_event_id}`,[row]);
  }

  function getReviewSession(){
    try{
      let id=localStorage.getItem(REVIEW_SESSION_KEY);
      if(!id){id=makeId();localStorage.setItem(REVIEW_SESSION_KEY,id)}
      return id;
    }catch{return makeId()}
  }
  function renewReviewSession(){
    const id=makeId();
    try{localStorage.setItem(REVIEW_SESSION_KEY,id)}catch{}
    return id;
  }
  function collectReviewRows(root){
    const questions=window.SERAG_REVIEW_V10_DATA?.questions;
    if(!Array.isArray(questions)||!questions.length||!root)return null;
    const session=getReviewSession(),rows=[];
    for(const q of questions){
      const node=root.querySelector(`[data-q="${q.n}"]`)||root.querySelector(`[data-fbq="${q.n}"]`);
      if(!node)return null;
      let selected='';
      if(q.type==='choice')selected=node.querySelector('input[type="radio"]:checked')?.value??'';
      else selected=node.querySelector('[data-sr10-text],[data-fbtext],.sr10-text,.sr10fb-text')?.value??'';
      if(!String(selected).trim())return null;
      const accepted=q.accepted||[q.answer];
      const ok=q.type==='text'?accepted.some(a=>norm(a)===norm(selected)):selected===q.answer;
      rows.push(baseRow({
        source:'review_checkpoint',attempt_session:`review:${session}`,attempt_order:q.n,question_number:q.n,
        section:q.section||'Review Checkpoint',question_type:q.type||null,prompt:q.prompt,
        selected_answer:selected,correct_answer:q.answer,is_correct:ok,explanation:q.explanation||null,
        options:Array.isArray(q.options)?q.options:[],metadata:{version:10,accepted:q.accepted||[]}
      }));
    }
    return {session,rows};
  }
  function trackReviewSubmit(button){
    const root=button.closest('#seragReviewWrap');
    const attempt=collectReviewRows(root);
    if(!attempt)return;
    queueRows(`review:${attempt.session}`,attempt.rows);
  }
  function trackReviewReset(button){
    if(!button.closest('#seragReviewWrap'))return;
    setTimeout(()=>{
      try{
        const x=JSON.parse(localStorage.getItem('seragEnglishReviewV10')||'{}');
        const empty=!x.submitted&&(!x.answers||Object.keys(x.answers).length===0);
        if(empty)renewReviewSession();
      }catch{}
    },0);
  }

  document.addEventListener('click',e=>{
    const quiz=e.target.closest?.('[data-quiz-answer]');if(quiz)trackDailyQuiz(quiz);
    const grammar=e.target.closest?.('[data-grammar-choice]');if(grammar)trackDailyGrammar(grammar);
    const submit=e.target.closest?.('[data-sr10-submit],[data-fbsubmit]');if(submit)trackReviewSubmit(submit);
    const reset=e.target.closest?.('[data-sr10-reset],[data-fbreset]');if(reset)trackReviewReset(reset);
  },true);

  window.addEventListener('online',()=>void flushPending());
  [400,1400,4000].forEach(ms=>setTimeout(()=>void flushPending(),ms));
})();