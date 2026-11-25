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
  const completed=Math.min(plan.answers,plan.goal);
  const goalReached=plan.ready&&completed>=plan.goal;
  const status=s?.empty?'Try another level or return when reviews are due.':s?.complete?`Session finished · ${s.independent} independent first-attempt answers`:s?`Session in progress · ${s.completed}/${s.total} exercises completed`:'';
  return `<section class="edp-card" aria-labelledby="edpTitle">
    <div class="edp-heading">
      <div><small>${escape(plan.level)}</small><h3 id="edpTitle">Today’s practice</h3><p>Vocabulary, grammar and sentence building.</p></div>
    </div>
    <div class="edp-goal">
      <div class="edp-goal-label"><strong>Daily goal</strong><span>${plan.ready?`${completed} / ${plan.goal} answers`:'Loading history'}</span></div>
      <progress aria-label="Daily answer goal" max="${plan.goal}" ${plan.ready?`value="${completed}"`:'value="0"'}></progress>
      ${goalReached?'<p class="edp-note">✓ Daily goal reached</p>':''}
    </div>
    ${status?`<p class="edp-session" role="status">${escape(status)}</p>`:''}
    <div class="edp-actions"><button type="button" class="epath-primary ep-button primary" data-ep-daily>${escape(plan.action)} <span aria-hidden="true">→</span></button></div>
    <p class="edp-note">For memory practice, start a separate recall session in My skills.</p>
    ${window.SERAG_SKILL_EVIDENCE?.compactHTML()||''}
    <button type="button" class="epath-link" data-ea-tab="course">Foundations course →</button>
    <button type="button" class="epath-link" data-ea-tab="imports">Import questions or articles →</button>
  </section>`;
 }
 window.SERAG_DAILY_PATH={model,html};
})();
