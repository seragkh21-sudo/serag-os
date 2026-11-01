(function(){
'use strict';
const api=window.SERAG_WRITING_V13;
if(!api)return;
const originalHtml=api.html;
const stages=['Understand the task','Plan your answer','Write your draft','Review your work','Compare with the sample'];
const uid=()=>typeof user!=='undefined'&&user&&user.id?user.id:'guest';
const key=id=>'seragWritingFlowV1:'+uid()+':'+id;
const getStage=id=>{try{return Math.max(0,Math.min(4,Number(localStorage.getItem(key(id))||0)))}catch{return 0}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
api.html=function(state,escapeFn){
 const d=api.drills.find(x=>x.id===state.writingDrill)||api.drills[0],stage=getStage(d.id);
 let html=originalHtml(state,escapeFn);
 const nav='<div class="ea13-guided-intro"><b>Follow the steps in order</b><p>Understand the task, make a short plan, write your draft, review it, then compare it with the sample. No automated band score or paid AI correction.</p></div><nav class="ea13-stepper" aria-label="Writing practice steps">'+stages.map((s,i)=>'<button type="button" data-ea-writing-stage="'+i+'" aria-pressed="'+String(i===stage)+'"><small>'+(i+1)+'</small><span>'+s+'</span></button>').join('')+'</nav><p class="ea13-stage-status" role="status">Current step: '+(stage+1)+' of 5 — '+stages[stage]+'.</p>';
 html=html.replace('<label>Choose a task',nav+'<label>Choose a task');
 html=html.replace('class="ea12-grid ea13-writing-grid"','class="ea12-grid ea13-writing-grid" data-writing-stage="'+stage+'" data-writing-drill="'+esc(d.id)+'"');
 const planKey='writing-plan:'+d.id,reflectionKey='writing-reflection:'+d.id;
 const plan='<section class="ea13-plan-box"><label for="ea13Plan">Three-point plan</label><p>Before drafting, note your main idea, one reason or example, and how you will close your answer.</p><textarea id="ea13Plan" class="ea12-input" dir="ltr" lang="en" data-ea-note="'+planKey+'" placeholder="Main idea… / Reason or example… / Closing point…">'+esc(state.notes?.[planKey]||'')+'</textarea></section>';
 html=html.replace('<label for="ea13Draft">Your draft</label>',plan+'<label for="ea13Draft">مسودتك</label>');
 html=html.replace('<details><summary>Self-review checklist</summary>','<details class="ea13-review-box"><summary>قائمة المراجعة الذاتية</summary>');
 html=html.replace('<details><summary>View the sample or plan after your attempt</summary>','<details class="ea13-model-box"><summary>شاهد المثال أو الخطة بعد محاولتك</summary>');
 html=html.replace('<details class="ea13-model-box">','<details class="ea13-model-box"'+(stage===4?' open':'')+'>');
 const reflection='<section class="ea13-reflection-box"><label for="ea13Reflection">After comparing: what is the most important change you will make?</label><textarea id="ea13Reflection" class="ea12-input" data-ea-note="'+reflectionKey+'" placeholder="I will improve… because…">'+esc(state.notes?.[reflectionKey]||'')+'</textarea></section>';
 html=html.replace('</details></article></div><div class="ea12-tip">','</details>'+reflection+'</article></div><div class="ea12-tip">');
 return html;
};
document.addEventListener('click',function(event){
 const b=event.target.closest('[data-ea-writing-stage]');
 if(!b)return;
 const target=Number(b.dataset.eaWritingStage),grid=document.querySelector('.ea13-writing-grid');
 if(!grid||!Number.isInteger(target)||target<0||target>4)return;
 const id=grid.dataset.writingDrill,d=api.drills.find(x=>x.id===id),status=document.querySelector('.ea13-stage-status');
 const plan=document.querySelector('#ea13Plan')?.value||'',draft=document.querySelector('#ea13Draft')?.value||'';
 const words=count(draft);
 if(target>=2&&count(plan)<3){if(status)status.textContent='Write three short points in your plan before moving to the draft.';return;}
 if(target>=3&&words<20){if(status)status.textContent='Write an initial draft of at least 20 words before reviewing. The actual IELTS minimum is shown above the draft.';return;}
 if(target>=4){const boxes=[...document.querySelectorAll('.ea13-review-box input[data-ea-writing-check]')],checked=boxes.filter(x=>x.checked).length,needed=Math.min(2,boxes.length);if(checked<needed){if(status)status.textContent='Review at least two checklist items before opening the sample.';return;}}
 try{localStorage.setItem(key(id),String(target))}catch{}
 const tab=document.querySelector('#ea12Center [data-ea-tab="writing"]');
 if(tab)tab.click();
});
})();