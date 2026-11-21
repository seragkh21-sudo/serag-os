/* One daily entry point. Progress comes from existing practice, never from clicks. */
(()=>{
 'use strict';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function model(){
  const ready=!!window.user?.id&&window.ENGOPLAY?.isReady===true;
  const stats=ready?window.ENGOPLAY.stats?.():null;
  const journey=window.SERAG_WORD_PRACTICE?.dailyStatus?.();
  const level=window.SERAG_ACADEMY_V12?.homeState?.().level||'B1';
  const goal=stats?.today?.goal||5,answers=stats?.today?.answers||0;
  return {ready,level,goal,answers,journey,
   action:!ready?'Load today’s practice':journey?.empty?'See available options':journey?.complete?'See session result':journey?'Continue session':answers>=goal?'Start optional practice':'Start today’s practice'};
 }
 function html(){
  const plan=model(),s=plan.journey;
  return `<section class="edp-card" aria-labelledby="edpTitle"><div class="edp-heading"><div><small>YOUR DAILY PATH · ${escape(plan.level)}</small><h3 id="edpTitle">One clear step for your English.</h3><p>Today’s aim: understand words in context, then use them in clear sentences.</p></div><span class="edp-badge">${plan.ready?`${Math.min(plan.answers,plan.goal)}/${plan.goal} daily answers`:'Loading your history'}</span></div><div class="edp-actions"><button type="button" class="epath-primary ep-button primary" data-ep-daily>${escape(plan.action)} <span aria-hidden="true">→</span></button></div><ol class="edp-steps"><li><b>1 · Know the goal</b><span>Read the context and learn what each expression means.</span></li><li${s&&!s.complete?' aria-current="step"':''}><b>2 · Practise in context</b><span>Follow one mixed session. For memory practice, start a separate recall session in My skills.</span></li><li${s?.complete?' aria-current="step"':''}><b>3 · Check your result</b><span>See what you answered independently and choose a review.</span></li></ol>${s?`<p class="edp-session" role="status">${s.empty?'No eligible questions are available. Try another level or return when reviews are due':s.complete?'Session finished':`Session in progress: ${s.completed}/${s.total} exercises completed`}. ${s.complete?`${s.independent} independent first-attempt answers.`:'Continue from your current exercise in this tab.'}</p>`:''}<p class="edp-note">${plan.ready&&plan.answers>=plan.goal?'Your daily answer goal is complete. More practice is optional.':'Your saved history guides question selection. Recent questions are not recycled to fill a session.'} You can still explore the library below.</p>${window.SERAG_SKILL_EVIDENCE?.compactHTML()||''}<button type="button" class="epath-link" data-ea-tab="course">Foundations course →</button><button type="button" class="epath-link" data-ea-tab="imports">Import questions or articles →</button></section>`;
 }
 window.SERAG_DAILY_PATH={model,html};
})();
