(()=>{
  'use strict';
  const by=id=>document.getElementById(id);
  const make=(tag,attrs={},html='')=>{const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));n.innerHTML=html;return n};
  let planView='calendar',projectView='work',baseShowPage=null;
  function setPanel(kind,value){
    const panels=kind==='plan'?['page-calendar','page-tasks']:['page-work','page-creative'];
    panels.forEach(id=>{const node=by(id);if(node)node.classList.toggle('hidden',id===(kind==='plan'?(value==='tasks'?'page-calendar':'page-tasks'):(value==='creative'?'page-work':'page-creative')))});
    if(kind==='plan'){planView=value;document.querySelectorAll('[data-product-plan-view]').forEach(b=>b.classList.toggle('active',b.dataset.productPlanView===value));if(value==='calendar'){try{window.v2LoadCalendar?.();if(!by('v5CalendarAgenda')?.classList.contains('hidden'))window.renderAgenda?.()}catch{}}else{try{window.loadTasks?.()}catch{}}}
    else{projectView=value;document.querySelectorAll('[data-product-project-view]').forEach(b=>b.classList.toggle('active',b.dataset.productProjectView===value));if(value==='work')window.renderWorkProjects?.();else window.renderCreativeProjects?.()}
  }
  function buildPlan(main){
    const calendar=by('page-calendar'),tasks=by('page-tasks');if(!calendar||!tasks)return;
    const page=make('section',{id:'page-plan',class:'page hidden'});
    page.append(make('header',{class:'top product-page-head'},'<div><h2>Plan</h2><p class="muted">Tasks, events and deadlines in one place.</p></div><button class="btn" type="button" data-product-plan-add>+ Add</button>'));
    page.append(make('div',{class:'product-subnav','aria-label':'Plan views'},'<button type="button" data-product-plan-view="calendar" class="active">Calendar</button><button type="button" data-product-plan-view="tasks">Tasks</button>'));
    calendar.classList.remove('page','hidden');calendar.classList.add('product-plan-panel');calendar.querySelector('.top')?.remove();
    tasks.classList.remove('page','hidden');tasks.classList.add('product-plan-panel','hidden');tasks.querySelector('.top')?.remove();
    const workTask=by('workTaskForm')?.closest('details');workTask?.remove();
    const workDeadlines=by('deadlinesList')?.closest('details');workDeadlines?.remove();
    page.append(calendar,tasks);main.append(page);
    page.querySelector('[data-product-plan-add]').addEventListener('click',()=>setPanel('plan','tasks'));
    page.querySelectorAll('[data-product-plan-view]').forEach(b=>b.addEventListener('click',()=>setPanel('plan',b.dataset.productPlanView)));
    const taskCategory=by('taskCategory');taskCategory?.querySelector('option[value="fitness"]')?.remove();
    const eventCategory=by('calendarEventCategory');eventCategory?.querySelector('option[value="fitness"]')?.remove();
  }
  function buildProjects(main){
    const work=by('page-work'),creative=by('page-creative');if(!work||!creative)return;
    const page=make('section',{id:'page-projects',class:'page hidden'});
    page.append(make('header',{class:'top product-page-head'},'<div><h2>Projects</h2><p class="muted">Work and creative projects, together.</p></div><button class="btn" type="button" data-product-project-add>+ New project</button>'));
    page.append(make('div',{class:'product-subnav','aria-label':'Project filters'},'<button type="button" data-product-project-view="work" class="active">Work</button><button type="button" data-product-project-view="creative">Creative</button>'));
    [work,creative].forEach((node,i)=>{node.classList.remove('page','hidden');node.classList.add('product-project-panel');node.querySelector('.top')?.remove();page.append(node)});
    main.append(page);
    page.querySelectorAll('[data-product-project-view]').forEach(b=>b.addEventListener('click',()=>setPanel('projects',b.dataset.productProjectView)));
    page.querySelector('[data-product-project-add]').addEventListener('click',()=>{setPanel('projects',projectView);const form=by(projectView==='work'?'workProjectForm':'projectForm');form?.scrollIntoView({behavior:'smooth',block:'center'});form?.querySelector('input')?.focus()});
  }
  function simplifyToday(){
    const page=by('page-today');if(!page)return;
    const taskCard=by('homeTaskList')?.closest('.card');
    const calendarCard=by('homeWeekStrip')?.closest('.card');
    const header=page.querySelector('.top');
    const date=header?.querySelector('.date')?.outerHTML||'';
    page.replaceChildren();
    const cleanHeader=make('header',{class:'top product-page-head'},'<div>'+date+'<h2>Today</h2><p class="muted">Your priorities and what is coming up.</p></div><button class="btn" type="button" data-product-goto="plan">Open plan</button>');
    page.append(cleanHeader);
    const grid=make('div',{class:'product-today-grid'});
    if(taskCard){taskCard.querySelector('h3')?.replaceChildren(document.createTextNode("Today's tasks"));grid.append(taskCard)}
    if(calendarCard){calendarCard.querySelector('h3')?.replaceChildren(document.createTextNode('Coming up'));const p=calendarCard.querySelector('.muted');if(p)p.textContent='Your next events and deadlines.';grid.append(calendarCard)}
    page.append(grid);
    by('v5CommandCenter')?.remove();
    cleanHeader.querySelector('[data-product-goto]').addEventListener('click',()=>window.showPage('plan'));
  }
  function buildNavigation(){
    const nav=document.querySelector('.sidebar .nav');if(nav){
      nav.innerHTML='<button data-page="today" class="active" type="button">Today</button><button data-page="plan" type="button">Plan</button><button data-page="projects" type="button">Projects</button><button data-page="english" type="button">English</button>';
      nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>window.showPage(b.dataset.page)));
    }
    const mobile=by('v5BottomNav');if(mobile)mobile.innerHTML='<button class="active" data-v5-page="today"><span>⌂</span>Today</button><button data-v5-page="plan"><span>▦</span>Plan</button><button data-v5-page="projects"><span>▣</span>Projects</button><button data-v5-page="english"><span>EN</span>English</button><button data-v5-more><span>•••</span>More</button>';
    const more=by('v5MobileMore');if(more)more.innerHTML='<button data-product-settings>Settings</button><button id="productLogout" type="button">Sign out</button>';
    more?.querySelector('[data-product-settings]')?.addEventListener('click',()=>window.showPage('settings'));
    more?.querySelector('#productLogout')?.addEventListener('click',()=>by('logoutBtn')?.click());
    const foot=document.querySelector('.sidebar-foot');if(foot&&!by('productDesktopSettings'))foot.insertAdjacentHTML('afterbegin','<button id="productDesktopSettings" class="btn" type="button">Settings</button>');
    by('productDesktopSettings')?.addEventListener('click',()=>window.showPage('settings'));
    by('page-fitness')?.classList.add('hidden');
    document.querySelector('[data-page="fitness"]')?.remove();
  }
  function simplifyQuickAdd(){
    by('v5QuickActions')?.remove();
    const drawer=by('quickDrawer');if(!drawer||by('productQuickActions'))return;
    drawer.insertAdjacentHTML('afterbegin','<section id="productQuickActions" class="product-quick-actions"><button data-product-action="task" type="button">Task</button><button data-product-action="event" type="button">Event</button><button data-product-action="note" type="button">Note</button><button data-product-action="file" type="button">File</button></section>');
    drawer.addEventListener('click',e=>{
      const b=e.target.closest('[data-product-action]');if(!b)return;
      const action=b.dataset.productAction;
      if(action==='task'){window.showPage('plan');setPanel('plan','tasks');setTimeout(()=>by('taskTitle')?.focus(),80)}
      if(action==='event'){window.showPage('plan');setPanel('plan','calendar');setTimeout(()=>by('calendarEventTitle')?.focus(),80)}
      if(action==='note'||action==='file'){document.querySelector('[data-capture-tab="'+action+'"]')?.click();by(action==='note'?'quickNoteContent':'attachmentTitle')?.focus()}
    });
  }
  function removeHealthChoices(){
    ['quickNoteCategory','attachmentParentType','taskCategory','calendarEventCategory'].forEach(id=>by(id)?.querySelector('option[value="fitness"]')?.remove());
    by('v5NutritionCard')?.remove();
    document.querySelectorAll('[data-metric="water"],[data-metric="calories"],[data-metric="workouts"]').forEach(x=>x.remove());
    const weekly=by('weeklyChartCanvas')?.closest('.weekly-card');weekly?.remove();
    document.querySelectorAll('#v5QuickActions [data-v5-quick="meal"],#v5QuickActions [data-v5-quick="water"],#v5QuickActions [data-v5-quick="workout"]').forEach(x=>x.remove());
  }
  function mount(){
    if(window.__productSimplificationV1)return;
    const main=document.querySelector('main.content');if(!main||!by('page-calendar')||!by('page-tasks'))return;
    window.__productSimplificationV1=true;
    buildPlan(main);buildProjects(main);simplifyToday();buildNavigation();simplifyQuickAdd();removeHealthChoices();
    document.querySelector('.sidebar-foot .btn:not(#productDesktopSettings)')?.replaceChildren(document.createTextNode('Sign out'));
    baseShowPage=window.showPage;
    if(typeof baseShowPage==='function')window.showPage=function(page){
      if(page==='fitness')page='today';
      if(page==='calendar'||page==='tasks'){const view=page;page='plan';setPanel('plan',view)}
      if(page==='work'||page==='creative'){const view=page;page='projects';setPanel('projects',view)}
      baseShowPage(page);
      document.querySelectorAll('.sidebar .nav [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
      document.querySelectorAll('#v5BottomNav [data-v5-page]').forEach(b=>b.classList.toggle('active',b.dataset.v5Page===page));
      if(page==='plan'&&planView==='calendar')setPanel('plan','calendar');
      if(page==='projects')setPanel('projects',projectView);
      if(page==='settings')by('v5SettingsForm')?.querySelectorAll('label')?.forEach(label=>{if(/Calories|Protein|Water/i.test(label.textContent))label.hidden=true});
    };
    window.addEventListener('resize',()=>{if(innerWidth>820)by('v5MobileMore')?.classList.add('hidden')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,180),{once:true});else setTimeout(mount,180);
})();