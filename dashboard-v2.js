let v2Metric='water';
let v2WeeklyData=null;
let v2CalendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let v2SelectedDay=v2DateKey(new Date());
let v2CalendarEvents=[];

function v2DateKey(value){const d=value instanceof Date?value:new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function v2StartOfDay(value=new Date()){const d=new Date(value);d.setHours(0,0,0,0);return d}
function v2AddDays(value,n){const d=new Date(value);d.setDate(d.getDate()+n);return d}
function v2FmtTime(value){if(!value)return '';return new Date(value).toLocaleTimeString('ar-EG',{hour:'numeric',minute:'2-digit'})}
function v2FmtShort(value){if(!value)return '';return new Date(value).toLocaleDateString('ar-EG',{day:'numeric',month:'short'})}
function v2SourceLabel(source){return ({task:'مهمة',reminder:'موعد',work:'شغل',creative:'Creative',workout:'Gym'})[source]||source}
function v2Html(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

async function v2LoadWeekly(){return}

function v2RenderWeekly(){return}

async function v2LoadEventsRange(start,end){
  const startIso=start.toISOString(),endIso=end.toISOString(),startKey=v2DateKey(start),endKey=v2DateKey(end);
  const [tasksR,remindersR,workR,creativeR]=await Promise.all([
    sb.from('tasks').select('id,title,category,due_at,priority,status').gte('due_at',startIso).lte('due_at',endIso),
    sb.from('reminders').select('id,title,category,remind_at,is_done').gte('remind_at',startIso).lte('remind_at',endIso),
    sb.from('work_projects').select('id,title,client,deadline,status').gte('deadline',startIso).lte('deadline',endIso),
    sb.from('creative_projects').select('id,title,project_type,deadline,status').gte('deadline',startIso).lte('deadline',endIso)
  ]);
  const err=tasksR.error||remindersR.error||workR.error||creativeR.error;
  if(err){console.warn('calendar data',err);return []}
  return [
    ...(tasksR.data||[]).map(x=>({id:x.id,title:x.title,when:x.due_at,category:x.category||'general',source:'task',status:x.status})),
    ...(remindersR.data||[]).map(x=>({id:x.id,title:x.title,when:x.remind_at,category:x.category||'general',source:'reminder',status:x.is_done?'done':'open'})),
    ...(workR.data||[]).map(x=>({id:x.id,title:x.title,when:x.deadline,category:'work',source:'work',status:x.status,detail:x.client||''})),
    ...(creativeR.data||[]).map(x=>({id:x.id,title:x.title,when:x.deadline,category:'creative',source:'creative',status:x.status,detail:x.project_type||''}))
  ].filter(x=>x.when).sort((a,b)=>new Date(a.when)-new Date(b.when));
}

async function v2LoadHomeCalendar(){
  if(!user)return;
  const start=v2StartOfDay(new Date()),end=v2AddDays(start,7);end.setHours(23,59,59,999);
  const events=await v2LoadEventsRange(start,end);
  const days=Array.from({length:7},(_,i)=>v2AddDays(start,i));
  $('homeWeekStrip').innerHTML=days.map((d,i)=>{const key=v2DateKey(d),has=events.some(e=>v2DateKey(e.when)===key);return `<div class="week-day ${i===0?'today':''} ${has?'has-events':''}"><strong>${d.getDate().toLocaleString('ar-EG')}</strong><span>${d.toLocaleDateString('ar-EG',{weekday:'short'})}</span></div>`}).join('');
  const upcoming=events.filter(e=>new Date(e.when)>=new Date()).slice(0,3);
  $('homeUpcomingList').innerHTML=upcoming.length?upcoming.map(e=>`<div class="upcoming-mini"><div class="upcoming-main"><span class="source-dot"></span><strong>${v2Html(e.title)}</strong></div><span>${v2FmtShort(e.when)} ${e.allDay?'':v2FmtTime(e.when)}</span></div>`).join(''):'<div class="calendar-empty">مفيش مواعيد قريبة.</div>';
}

function v2MonthGridBounds(){
  const first=new Date(v2CalendarCursor.getFullYear(),v2CalendarCursor.getMonth(),1);
  const offset=(first.getDay()+1)%7;
  const start=v2AddDays(first,-offset);
  const end=v2AddDays(start,41);end.setHours(23,59,59,999);
  return {start,end};
}

async function v2LoadCalendar(){
  if(!user)return;
  $('calendarGrid').innerHTML='<div class="v2-loading" style="grid-column:1/-1;min-height:300px">جاري تحميل التقويم…</div>';
  const {start,end}=v2MonthGridBounds();
  v2CalendarEvents=await v2LoadEventsRange(start,end);
  v2RenderCalendar(start);
  v2RenderSelectedDay();
}

function v2RenderCalendar(gridStart){
  $('calendarMonthTitle').textContent=v2CalendarCursor.toLocaleDateString('ar-EG',{month:'long',year:'numeric'});
  const todayKey=v2DateKey(new Date()),month=v2CalendarCursor.getMonth();
  const cells=Array.from({length:42},(_,i)=>v2AddDays(gridStart,i));
  $('calendarGrid').innerHTML=cells.map(d=>{
    const key=v2DateKey(d),events=v2CalendarEvents.filter(e=>v2DateKey(e.when)===key),outside=d.getMonth()!==month;
    const chips=events.slice(0,2).map(e=>`<div class="calendar-chip">${v2Html(e.title)}</div>`).join('');
    return `<button class="calendar-day ${outside?'outside':''} ${key===todayKey?'today':''} ${key===v2SelectedDay?'selected':''} ${events.length?'has-events':''}" data-day="${key}" type="button"><span class="calendar-day-num">${d.getDate().toLocaleString('ar-EG')}</span><div class="calendar-day-events">${chips}</div>${events.length>2?`<div class="calendar-more">+${events.length-2}</div>`:''}</button>`;
  }).join('');
  document.querySelectorAll('.calendar-day').forEach(b=>b.onclick=()=>{v2SelectedDay=b.dataset.day;v2RenderCalendar(gridStart);v2RenderSelectedDay()});
}

function v2GoogleUrl(event){
  const start=new Date(event.when),end=new Date(start.getTime()+60*60*1000);
  const g=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${g(start)}/${g(end)}&details=${encodeURIComponent('Added from Serag OS')}`;
}

function v2RenderSelectedDay(){
  const day=new Date(`${v2SelectedDay}T12:00:00`);
  $('selectedDayTitle').textContent=day.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
  const events=v2CalendarEvents.filter(e=>v2DateKey(e.when)===v2SelectedDay);
  $('selectedDayEvents').innerHTML=events.length?events.map(e=>`<div class="calendar-event"><div class="calendar-event-top"><div><div class="calendar-event-title">${v2Html(e.title)}</div><div class="calendar-event-meta">${v2SourceLabel(e.source)}${e.allDay?'':` · ${v2FmtTime(e.when)}`}${e.detail?' · '+v2Html(e.detail):''}</div></div><span class="pill">${v2Html(e.category)}</span></div><div class="calendar-event-actions"><a class="mini link" target="_blank" rel="noopener" href="${v2GoogleUrl(e)}">Google</a>${e.source==='reminder'?`<button class="mini danger" data-delete-reminder="${e.id}" type="button">حذف</button>`:''}</div></div>`).join(''):'<div class="calendar-empty">مفيش حاجة في اليوم ده.</div>';
  document.querySelectorAll('[data-delete-reminder]').forEach(b=>b.onclick=async()=>{const {error}=await sb.from('reminders').delete().eq('id',b.dataset.deleteReminder);if(error)return toast(error.message);toast('الموعد اتحذف');await v2LoadCalendar();await v2LoadHomeCalendar()});
}

function v2SetDefaultEventTime(){
  const el=$('calendarEventAt');if(!el||el.value)return;
  const d=new Date();d.setMinutes(0,0,0);d.setHours(d.getHours()+1);
  const z=n=>String(n).padStart(2,'0');el.value=`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:00`;
}

async function v2RefreshAll(){if(!user)return;await v2LoadHomeCalendar();if($('page-calendar')&&!$('page-calendar').classList.contains('hidden'))await v2LoadCalendar()}

document.querySelectorAll('[data-metric]').forEach(b=>b.addEventListener('click',()=>{v2Metric=b.dataset.metric;v2RenderWeekly()}));
$('openCalendarFromHome')?.addEventListener('click',()=>{showPage('calendar');v2LoadCalendar()});
document.querySelector('[data-page="calendar"]')?.addEventListener('click',()=>v2LoadCalendar());
$('calendarPrev')?.addEventListener('click',()=>{v2CalendarCursor=new Date(v2CalendarCursor.getFullYear(),v2CalendarCursor.getMonth()-1,1);v2LoadCalendar()});
$('calendarNext')?.addEventListener('click',()=>{v2CalendarCursor=new Date(v2CalendarCursor.getFullYear(),v2CalendarCursor.getMonth()+1,1);v2LoadCalendar()});
$('calendarToday')?.addEventListener('click',()=>{const now=new Date();v2CalendarCursor=new Date(now.getFullYear(),now.getMonth(),1);v2SelectedDay=v2DateKey(now);v2LoadCalendar()});
$('openGoogleCalendar')?.addEventListener('click',()=>window.open('https://calendar.google.com/calendar/u/0/r','_blank','noopener'));
$('refreshBtn')?.addEventListener('click',()=>v2RefreshAll());
$('calendarEventForm')?.addEventListener('submit',async e=>{e.preventDefault();const at=$('calendarEventAt').value?new Date($('calendarEventAt').value).toISOString():null;if(!at)return;const {error}=await sb.from('reminders').insert({user_id:user.id,title:$('calendarEventTitle').value.trim(),remind_at:at,category:$('calendarEventCategory').value,is_done:false});if(error)return toast(error.message);e.target.reset();v2SetDefaultEventTime();toast('الموعد اتضاف للتقويم');await Promise.all([v2LoadCalendar(),v2LoadHomeCalendar()])});

sb.auth.onAuthStateChange((_event,session)=>{if(session?.user)setTimeout(()=>{v2SetDefaultEventTime();v2RefreshAll()},80)});
(async()=>{const {data:{session}}=await sb.auth.getSession();if(session?.user){v2SetDefaultEventTime();v2RefreshAll()}})();
