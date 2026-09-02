const SUPABASE_URL='https://kdfbxcdxdhofqidczbot.supabase.co';
const SUPABASE_KEY='sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

let user=null, authMode='login', lastWaterLog=null;
let selectedFood=null, mealDraft=[];
let mediaRecorder=null, recordedChunks=[], recordedBlob=null, micStream=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number(n||0);
const round=(n,d=0)=>Number(num(n).toFixed(d));
const empty=msg=>`<div class="empty">${esc(msg)}</div>`;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add('hidden'),2200)}
function localDayStart(){const d=new Date();d.setHours(0,0,0,0);return d.toISOString()}
function fmtDate(v){if(!v)return 'بدون موعد';return new Date(v).toLocaleString('ar-EG',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function safeUrl(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function actionButtons(type,id,{openUrl='',done=false,edit=true,remove=true}={}){
  let x='<div class="row-actions">';
  if(openUrl)x+=`<a class="mini link" target="_blank" rel="noopener" href="${esc(openUrl)}">فتح</a>`;
  if(done)x+=`<button class="mini" data-action="done" data-type="${type}" data-id="${id}" type="button">تم</button>`;
  if(edit)x+=`<button class="mini" data-action="edit" data-type="${type}" data-id="${id}" type="button">تعديل</button>`;
  if(remove)x+=`<button class="mini danger" data-action="delete" data-type="${type}" data-id="${id}" type="button">حذف</button>`;
  return x+'</div>';
}
function showPage(page){
  document.querySelectorAll('.page').forEach(s=>s.classList.add('hidden'));
  $('page-'+page)?.classList.remove('hidden');
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  window.scrollTo({top:0,behavior:'instant'});
  refreshAll();
}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
$('todayDate').textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});

$('loginTab').onclick=()=>{authMode='login';$('loginTab').classList.add('active');$('signupTab').classList.remove('active');$('authSubmit').textContent='دخول'};
$('signupTab').onclick=()=>{authMode='signup';$('signupTab').classList.add('active');$('loginTab').classList.remove('active');$('authSubmit').textContent='إنشاء الحساب'};
$('authSubmit').onclick=async()=>{
  const email=$('email').value.trim(),password=$('password').value;
  if(!email||password.length<6){$('authMsg').textContent='اكتب إيميل صحيح وباسورد 6 حروف على الأقل.';return}
  $('authMsg').textContent='جاري...';
  const result=authMode==='signup'
    ? await sb.auth.signUp({email,password,options:{data:{display_name:'Serag'}}})
    : await sb.auth.signInWithPassword({email,password});
  $('authMsg').textContent=result.error?result.error.message:(authMode==='signup'?'اتعمل الحساب. لو وصلك تأكيد إيميل، أكده وبعدها ادخل.':'تم تسجيل الدخول.');
};
$('logoutBtn').onclick=()=>sb.auth.signOut();
$('refreshBtn').onclick=()=>refreshAll();
sb.auth.onAuthStateChange((_event,session)=>{
  user=session?.user||null;
  $('authView').classList.toggle('hidden',!!user);
  $('appView').classList.toggle('hidden',!user);
  $('quickFab').classList.toggle('hidden',!user);
  if(user)refreshAll(); else closeQuickDrawer();
});

async function loadWater(){
  const {data=[],error}=await sb.from('water_logs').select('*').gte('logged_at',localDayStart()).order('logged_at',{ascending:true});
  if(error)return 0;
  lastWaterLog=data.at(-1)?.id||null;
  const cups=Math.round(data.reduce((a,x)=>a+num(x.amount_ml),0)/250);
  $('waterCount').textContent=cups;$('homeWater').textContent=cups;$('waterSummary').textContent=`${cups}/8`;
  $('homeWaterBar').style.width=Math.min(100,cups/8*100)+'%';
  $('waterCups').innerHTML=Array.from({length:8},(_,i)=>`<div class="cup ${i<cups?'done':''}">💧</div>`).join('');
  return cups;
}
$('addWater').onclick=async()=>{const {error}=await sb.from('water_logs').insert({user_id:user.id,amount_ml:250});if(error)return toast(error.message);toast('اتسجل كوب مياه 💧');await loadWater();loadHomeTip()};
$('undoWater').onclick=async()=>{if(!lastWaterLog)return toast('مفيش كوب تتراجع عنه');await sb.from('water_logs').delete().eq('id',lastWaterLog);toast('اتشال آخر كوب');await loadWater();loadHomeTip()};

let foodSearchTimer;
$('foodSearch').addEventListener('input',()=>{
  clearTimeout(foodSearchTimer);
  const q=$('foodSearch').value.trim();
  if(q.length<1){$('foodResults').classList.add('hidden');return}
  foodSearchTimer=setTimeout(()=>searchFoods(q),180);
});
document.addEventListener('click',e=>{if(!e.target.closest('.food-search-wrap'))$('foodResults').classList.add('hidden')});
async function searchFoods(q){
  const cleaned=q.replace(/[%_,()]/g,' ').trim();
  const {data=[],error}=await sb.from('food_catalog').select('*').or(`name_ar.ilike.%${cleaned}%,name_en.ilike.%${cleaned}%`).limit(12);
  if(error){$('foodResults').innerHTML=empty('حصلت مشكلة في البحث.');$('foodResults').classList.remove('hidden');return}
  $('foodResults').innerHTML=data.length?data.map(f=>{
    const kcal=round(num(f.calories_per_100)*num(f.serving_grams)/100);
    const p=round(num(f.protein_per_100)*num(f.serving_grams)/100,1);
    return `<button class="food-result" type="button" data-food-id="${f.id}"><span><strong>${esc(f.name_ar)}</strong><br><span>${esc(f.serving_label||'100 جم')} · ${kcal} kcal · ${p}g بروتين</span></span><span>${esc(f.category||'')}</span></button>`;
  }).join(''):empty('مش موجود. جرّب اسم أبسط أو أضفه يدويًا.');
  $('foodResults').classList.remove('hidden');
  document.querySelectorAll('.food-result').forEach(b=>b.addEventListener('click',()=>selectFood(data.find(x=>String(x.id)===b.dataset.foodId))));
}
function selectFood(f){
  selectedFood=f;$('foodResults').classList.add('hidden');$('selectedFoodBox').classList.remove('hidden');
  $('selectedFoodName').textContent=f.name_ar;
  const g=num(f.serving_grams),k=round(num(f.calories_per_100)*g/100),p=round(num(f.protein_per_100)*g/100,1),c=round(num(f.carbs_per_100)*g/100,1),fat=round(num(f.fat_per_100)*g/100,1);
  $('selectedFoodInfo').textContent=`${f.serving_label||g+' جم'} ≈ ${k} kcal · P ${p}g · C ${c}g · F ${fat}g`;
  $('foodQty').value=1;$('foodQtyMode').value='serving';
}
$('addFoodToDraft').onclick=()=>{
  if(!selectedFood)return;
  let qty=Math.max(.1,num($('foodQty').value)||1);
  const grams=$('foodQtyMode').value==='grams'?qty:num(selectedFood.serving_grams)*qty;
  const item={
    food_id:selectedFood.id,food_name:selectedFood.name_ar,grams,
    calories:num(selectedFood.calories_per_100)*grams/100,
    protein_g:num(selectedFood.protein_per_100)*grams/100,
    carbs_g:num(selectedFood.carbs_per_100)*grams/100,
    fat_g:num(selectedFood.fat_per_100)*grams/100
  };
  mealDraft.push(item);renderMealDraft();$('foodSearch').value='';$('selectedFoodBox').classList.add('hidden');selectedFood=null;
};
function renderMealDraft(){
  $('mealDraftBox').classList.toggle('hidden',mealDraft.length===0);
  const totals=mealDraft.reduce((a,x)=>({cal:a.cal+x.calories,p:a.p+x.protein_g,c:a.c+x.carbs_g,f:a.f+x.fat_g}),{cal:0,p:0,c:0,f:0});
  $('mealDraftTotals').textContent=`≈ ${round(totals.cal)} kcal · P ${round(totals.p,1)}g · C ${round(totals.c,1)}g · F ${round(totals.f,1)}g`;
  $('mealDraftList').innerHTML=mealDraft.map((x,i)=>`<div class="row"><div class="row-main"><div class="meal-item-name">${esc(x.food_name)}</div><div class="macro-line">${round(x.grams)} جم · ${round(x.calories)} kcal · ${round(x.protein_g,1)}g بروتين</div></div><button class="mini danger draft-remove" data-index="${i}" type="button">حذف</button></div>`).join('');
  document.querySelectorAll('.draft-remove').forEach(b=>b.onclick=()=>{mealDraft.splice(Number(b.dataset.index),1);renderMealDraft()});
}
$('clearMealDraft').onclick=()=>{mealDraft=[];renderMealDraft()};
$('saveSmartMeal').onclick=async()=>{
  if(!mealDraft.length)return;
  const totals=mealDraft.reduce((a,x)=>({cal:a.cal+x.calories,p:a.p+x.protein_g,c:a.c+x.carbs_g,f:a.f+x.fat_g}),{cal:0,p:0,c:0,f:0});
  const name=$('smartMealName').value.trim()||mealDraft.map(x=>x.food_name).join(' + ').slice(0,100);
  const {data:meal,error}=await sb.from('meals').insert({user_id:user.id,name,calories:round(totals.cal),protein_g:round(totals.p,1),carbs_g:round(totals.c,1),fat_g:round(totals.f,1),notes:'Calculated from food catalog'}).select().single();
  if(error)return toast(error.message);
  const rows=mealDraft.map(x=>({...x,user_id:user.id,meal_id:meal.id,calories:round(x.calories,2),protein_g:round(x.protein_g,2),carbs_g:round(x.carbs_g,2),fat_g:round(x.fat_g,2)}));
  await sb.from('meal_items').insert(rows);
  mealDraft=[];$('smartMealName').value='';renderMealDraft();toast('الوجبة اتحفظت بالحسابات');loadMeals();loadHomeTip();
};
$('manualMealForm').onsubmit=async e=>{
  e.preventDefault();
  const {error}=await sb.from('meals').insert({user_id:user.id,name:$('manualMealName').value.trim(),calories:num($('manualCalories').value),protein_g:num($('manualProtein').value),carbs_g:num($('manualCarbs').value),fat_g:num($('manualFat').value),notes:'Manual entry'});
  if(error)return toast(error.message);e.target.reset();toast('الوجبة اتحفظت');loadMeals();
};
async function loadMeals(){
  const {data=[],error}=await sb.from('meals').select('*').gte('eaten_at',localDayStart()).order('eaten_at',{ascending:false});
  if(error)return 0;
  $('mealsCount').textContent=data.length;
  $('mealsList').innerHTML=data.length?data.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.name)}</div><div class="row-meta">${x.calories||0} kcal · P ${round(x.protein_g,1)}g · C ${round(x.carbs_g,1)}g · F ${round(x.fat_g,1)}g</div></div>${actionButtons('meal',x.id,{edit:false})}</div>`).join(''):empty('لسه مفيش وجبات مسجلة.');
  const calories=data.reduce((a,x)=>a+num(x.calories),0);
  $('homeCalories').textContent=round(calories);$('fitnessCalories').textContent=round(calories);$('homeCaloriesBar').style.width=Math.min(100,calories/2800*100)+'%';
  return calories;
}

$('workoutForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('workouts').insert({user_id:user.id,title:$('workoutTitle').value.trim(),notes:$('workoutNotes').value.trim(),exercises:[]});if(error)return toast(error.message);e.target.reset();toast('التمرين اتحفظ');loadWorkouts()};
async function loadWorkouts(){
  const {data=[]}=await sb.from('workouts').select('*').order('workout_date',{ascending:false}).limit(20);
  $('workoutsCount').textContent=data.length;
  $('workoutsList').innerHTML=data.length?data.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.notes||'')} · ${x.workout_date}</div></div>${actionButtons('workout',x.id,{edit:false})}</div>`).join(''):empty('لسه مفيش تمرين.');
}

async function addTask({title,category='general',due_at=null,priority='normal'}){
  return sb.from('tasks').insert({user_id:user.id,title,category,due_at,priority});
}
$('taskForm').onsubmit=async e=>{e.preventDefault();const due=$('taskDue').value?new Date($('taskDue').value).toISOString():null;const {error}=await addTask({title:$('taskTitle').value.trim(),category:$('taskCategory').value,due_at:due,priority:$('taskPriority').value});if(error)return toast(error.message);e.target.reset();toast('المهمة اتضافت');loadTasks()};
$('workTaskForm').onsubmit=async e=>{e.preventDefault();const due=$('workTaskDue').value?new Date($('workTaskDue').value).toISOString():null;const {error}=await addTask({title:$('workTaskTitle').value.trim(),category:'work',due_at:due,priority:$('workTaskPriority').value});if(error)return toast(error.message);e.target.reset();toast('مهمة الشغل اتضافت');loadTasks()};
async function loadTasks(){
  const [{data:open=[]},{data:done=[]}]=await Promise.all([
    sb.from('tasks').select('*').neq('status','done').order('due_at',{ascending:true,nullsFirst:false}),
    sb.from('tasks').select('*').eq('status','done').order('updated_at',{ascending:false}).limit(30)
  ]);
  const render=x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.category)} · ${fmtDate(x.due_at)} · ${esc(x.priority)}</div></div>${actionButtons('task',x.id,{done:true})}</div>`;
  $('tasksCount').textContent=open.length;$('doneTasksCount').textContent=done.length;$('homeTasks').textContent=open.length;
  $('tasksList').innerHTML=open.length?open.map(render).join(''):empty('مفيش مهام مفتوحة.');
  $('homeTaskList').innerHTML=open.length?open.slice(0,5).map(render).join(''):empty('الدنيا فاضية ✨');
  $('doneTasksList').innerHTML=done.length?done.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.category)} · مكتملة</div></div>${actionButtons('task',x.id,{done:false,edit:false})}</div>`).join(''):empty('لسه مفيش مهام مكتملة.');
  const work=open.filter(x=>x.category==='work');$('workTasksCount').textContent=work.length;$('workTaskList').innerHTML=work.length?work.map(render).join(''):empty('مفيش مهام شغل.');
  return {open,done};
}

$('wordForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('english_words').insert({user_id:user.id,word:$('newWord').value.trim(),meaning:$('wordMeaning').value.trim(),example:$('wordExample').value.trim()});if(error)return toast(error.message);e.target.reset();toast('الكلمة اتحفظت');loadEnglish()};
$('grammarForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('grammar_topics').insert({user_id:user.id,title:$('grammarTitle').value.trim(),notes:$('grammarNotes').value.trim()});if(error)return toast(error.message);e.target.reset();loadEnglish()};
$('englishCourseForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('courses').insert({user_id:user.id,title:$('englishCourseTitle').value.trim(),url:$('englishCourseUrl').value.trim(),progress:num($('englishCourseProgress').value),category:'english',status:'active'});if(error)return toast(error.message);e.target.reset();loadEnglish()};
$('writingForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('english_writing').insert({user_id:user.id,title:$('writingTitle').value.trim(),content:$('writingContent').value.trim()});if(error)return toast(error.message);e.target.reset();toast('الكتابة اتحفظت');loadEnglish()};
async function loadEnglish(){
  const [w,g,c,wr]=await Promise.all([
    sb.from('english_words').select('*').order('created_at',{ascending:false}).limit(100),
    sb.from('grammar_topics').select('*').order('created_at',{ascending:false}).limit(100),
    sb.from('courses').select('*').eq('category','english').order('created_at',{ascending:false}).limit(100),
    sb.from('english_writing').select('*').order('created_at',{ascending:false}).limit(100)
  ]);
  const words=w.data||[],grammar=g.data||[],courses=c.data||[],writing=wr.data||[];
  $('wordsCount').textContent=words.length;$('grammarCount').textContent=grammar.length;$('englishCoursesCount').textContent=courses.length;$('writingCount').textContent=writing.length;
  $('wordsList').innerHTML=words.length?words.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.word)}</div><div class="row-meta">${esc(x.meaning||'')}${x.example?' · '+esc(x.example):''}</div></div>${actionButtons('word',x.id)}</div>`).join(''):empty('ابدأ بأول كلمة.');
  $('grammarList').innerHTML=grammar.length?grammar.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.notes||'')}</div></div>${actionButtons('grammar',x.id)}</div>`).join(''):empty('لسه مفيش قواعد.');
  $('englishCoursesList').innerHTML=courses.length?courses.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${x.progress||0}% ${safeUrl(x.url)?'· رابط محفوظ':''}</div></div>${actionButtons('course',x.id,{openUrl:safeUrl(x.url)})}</div>`).join(''):empty('ضيف الكورس.');
  $('writingList').innerHTML=writing.length?writing.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title||'Writing')}</div><div class="row-meta">${esc((x.content||'').slice(0,120))}</div></div>${actionButtons('writing',x.id)}</div>`).join(''):empty('مفيش Writing محفوظ.');
}

$('workProjectForm').onsubmit=async e=>{
  e.preventDefault();const deadline=$('workProjectDeadline').value?new Date($('workProjectDeadline').value).toISOString():null;
  const {error}=await sb.from('work_projects').insert({user_id:user.id,title:$('workProjectTitle').value.trim(),client:$('workProjectClient').value.trim(),project_type:$('workProjectType').value.trim(),deadline,notes:$('workProjectNotes').value.trim()});
  if(error)return toast(error.message);e.target.reset();toast('مشروع الشغل اتضاف');loadWork();
};
$('workNoteForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('quick_notes').insert({user_id:user.id,title:$('workNoteTitle').value.trim(),content:$('workNoteContent').value.trim(),category:'work'});if(error)return toast(error.message);e.target.reset();toast('الملاحظة اتحفظت');loadCaptures();loadWork()};
async function loadWork(){
  const [{data:projects=[]},{data:notes=[]},{data:tasks=[]}]=await Promise.all([
    sb.from('work_projects').select('*').order('deadline',{ascending:true,nullsFirst:false}),
    sb.from('quick_notes').select('*').eq('category','work').order('created_at',{ascending:false}).limit(50),
    sb.from('tasks').select('*').eq('category','work').neq('status','done').order('due_at',{ascending:true,nullsFirst:false})
  ]);
  $('workProjectsCount').textContent=projects.length;$('workNotesCount').textContent=notes.length;
  $('workProjectsList').innerHTML=projects.length?projects.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.client||'بدون عميل')} · ${esc(x.project_type||'')} · ${fmtDate(x.deadline)} · ${esc(x.status)}</div></div>${actionButtons('workproject',x.id)}</div>`).join(''):empty('ضيف أول مشروع شغل.');
  $('workNotesList').innerHTML=notes.length?notes.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title||'ملاحظة')}</div><div class="row-meta">${esc((x.content||'').slice(0,140))}</div></div>${actionButtons('note',x.id)}</div>`).join(''):empty('مفيش ملاحظات شغل.');
  const deadlines=[
    ...projects.filter(x=>x.deadline).map(x=>({title:x.title,when:x.deadline,type:'مشروع'})),
    ...tasks.filter(x=>x.due_at).map(x=>({title:x.title,when:x.due_at,type:'مهمة'}))
  ].sort((a,b)=>new Date(a.when)-new Date(b.when));
  $('deadlinesList').innerHTML=deadlines.length?deadlines.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.type)}</div></div><span class="pill">${fmtDate(x.when)}</span></div>`).join(''):empty('مفيش Deadlines مسجلة.');
}

$('projectForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('creative_projects').insert({user_id:user.id,title:$('projectTitle').value.trim(),project_type:$('projectType').value.trim(),brief:$('projectBrief').value.trim()});if(error)return toast(error.message);e.target.reset();toast('المشروع اتضاف');loadCreative()};
$('resourceForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('creative_resources').insert({user_id:user.id,title:$('resourceTitle').value.trim(),url:$('resourceUrl').value.trim(),resource_type:$('resourceType').value.trim()||'reference'});if(error)return toast(error.message);e.target.reset();toast('المصدر اتحفظ');loadCreative()};
$('creativeCourseForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('courses').insert({user_id:user.id,title:$('creativeCourseTitle').value.trim(),url:$('creativeCourseUrl').value.trim(),progress:num($('creativeCourseProgress').value),category:'creative',status:'saved'});if(error)return toast(error.message);e.target.reset();loadCreative()};
async function loadCreative(){
  const [p,r,c]=await Promise.all([
    sb.from('creative_projects').select('*').order('created_at',{ascending:false}),
    sb.from('creative_resources').select('*').order('created_at',{ascending:false}),
    sb.from('courses').select('*').eq('category','creative').order('created_at',{ascending:false})
  ]);
  const projects=p.data||[],resources=r.data||[],courses=c.data||[];
  $('creativeProjectsCount').textContent=projects.length;$('resourcesCount').textContent=resources.length;$('creativeCoursesCount').textContent=courses.length;
  $('projectsList').innerHTML=projects.length?projects.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.project_type||'')} · ${esc((x.brief||'').slice(0,100))}</div></div>${actionButtons('creativeproject',x.id)}</div>`).join(''):empty('مفيش مشاريع كريتف.');
  $('resourcesList').innerHTML=resources.length?resources.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${esc(x.resource_type||'reference')}</div></div>${actionButtons('resource',x.id,{openUrl:safeUrl(x.url)})}</div>`).join(''):empty('ضيف أول Reference.');
  $('creativeCoursesList').innerHTML=courses.length?courses.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-meta">${x.progress||0}%</div></div>${actionButtons('course',x.id,{openUrl:safeUrl(x.url)})}</div>`).join(''):empty('مفيش كورسات كريتف.');
}

function openQuickDrawer(){if(!user)return;$('quickDrawer').classList.remove('hidden');$('drawerBackdrop').classList.remove('hidden');loadCaptures()}
function closeQuickDrawer(){$('quickDrawer').classList.add('hidden');$('drawerBackdrop').classList.add('hidden')}
$('quickFab').onclick=openQuickDrawer;$('openQuickFromHome').onclick=openQuickDrawer;$('closeQuickDrawer').onclick=closeQuickDrawer;$('drawerBackdrop').onclick=closeQuickDrawer;$('refreshCaptures').onclick=loadCaptures;
document.querySelectorAll('[data-capture-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-capture-tab]').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.capture-pane').forEach(x=>x.classList.add('hidden'));
  $('capture-'+b.dataset.captureTab).classList.remove('hidden');
});
$('quickNoteForm').onsubmit=async e=>{
  e.preventDefault();const {error}=await sb.from('quick_notes').insert({user_id:user.id,title:$('quickNoteTitle').value.trim(),content:$('quickNoteContent').value.trim(),category:$('quickNoteCategory').value});
  if(error)return toast(error.message);e.target.reset();toast('الملاحظة اتحفظت');await loadCaptures();closeQuickDrawer();
};
$('attachmentForm').onsubmit=async e=>{
  e.preventDefault();const title=$('attachmentTitle').value.trim(),file=$('attachmentFile').files?.[0],url=safeUrl($('attachmentUrl').value.trim()),parent_type=$('attachmentParentType').value;
  if(!file&&!url)return toast('اختار ملف أو حط رابط');
  let row={user_id:user.id,title,parent_type,kind:'link',external_url:url||null};
  if(file){
    const ext=(file.name.split('.').pop()||'bin').replace(/[^a-zA-Z0-9]/g,'');
    const path=`${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error:upErr}=await sb.storage.from('serag-attachments').upload(path,file,{contentType:file.type||'application/octet-stream'});
    if(upErr)return toast(upErr.message);
    row.storage_path=path;row.mime_type=file.type;row.external_url=null;row.kind=file.type.startsWith('image/')?'image':file.type.startsWith('audio/')?'audio':'file';
  }
  const {error}=await sb.from('attachments').insert(row);if(error)return toast(error.message);
  e.target.reset();toast('المرفق اتحفظ');loadCaptures();
};
async function startRecording(){
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')return toast('التسجيل الصوتي غير مدعوم في المتصفح ده');
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true});
    recordedChunks=[];recordedBlob=null;mediaRecorder=new MediaRecorder(micStream);
    mediaRecorder.ondataavailable=e=>{if(e.data.size)recordedChunks.push(e.data)};
    mediaRecorder.onstop=()=>{
      const type=mediaRecorder.mimeType||'audio/webm';recordedBlob=new Blob(recordedChunks,{type});
      $('recordPreview').src=URL.createObjectURL(recordedBlob);$('recordPreview').classList.remove('hidden');$('recordTitle').classList.remove('hidden');$('saveRecord').classList.remove('hidden');
      $('recordStatus').textContent='التسجيل جاهز. اسمعه، سميه، واحفظه.';
      micStream?.getTracks().forEach(t=>t.stop());micStream=null;
    };
    mediaRecorder.start();$('startRecord').disabled=true;$('stopRecord').disabled=false;$('recordStatus').textContent='جاري التسجيل...';
  }catch(err){toast('محتاج تسمح باستخدام الميكروفون')}
}
$('startRecord').onclick=startRecording;
$('stopRecord').onclick=()=>{if(mediaRecorder?.state==='recording'){mediaRecorder.stop();$('startRecord').disabled=false;$('stopRecord').disabled=true}};
$('saveRecord').onclick=async()=>{
  if(!recordedBlob)return;
  const title=$('recordTitle').value.trim()||`ريكورد ${new Date().toLocaleString('ar-EG')}`;
  const ext=recordedBlob.type.includes('ogg')?'ogg':recordedBlob.type.includes('mp4')?'m4a':'webm';
  const path=`${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const {error:upErr}=await sb.storage.from('serag-attachments').upload(path,recordedBlob,{contentType:recordedBlob.type||'audio/webm'});if(upErr)return toast(upErr.message);
  const {error}=await sb.from('attachments').insert({user_id:user.id,title,kind:'audio',storage_path:path,mime_type:recordedBlob.type,parent_type:'general'});if(error)return toast(error.message);
  recordedBlob=null;$('recordPreview').classList.add('hidden');$('recordTitle').classList.add('hidden');$('recordTitle').value='';$('saveRecord').classList.add('hidden');$('recordStatus').textContent='اتحفظ. تقدر تعمل تسجيل جديد.';toast('الريكورد اتحفظ');loadCaptures();
};
async function loadCaptures(){
  if(!user)return;
  const [n,a]=await Promise.all([
    sb.from('quick_notes').select('*').order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(30),
    sb.from('attachments').select('*').order('created_at',{ascending:false}).limit(30)
  ]);
  const notes=(n.data||[]).filter(x=>x.category!=='system_english'),atts=a.data||[];
  const combined=[
    ...notes.map(x=>({...x,_type:'note',_date:x.created_at})),
    ...atts.map(x=>({...x,_type:'attachment',_date:x.created_at}))
  ].sort((x,y)=>new Date(y._date)-new Date(x._date));
  const renderQuick=x=>{
    if(x._type==='note')return `<div class="row"><div class="row-main"><div class="row-title">📝 ${esc(x.title||'ملاحظة')}</div><div class="row-meta">${esc((x.content||'').slice(0,120))} · ${esc(x.category)}</div></div>${actionButtons('note',x.id)}</div>`;
    const icon=x.kind==='image'?'🖼️':x.kind==='audio'?'🎙️':x.kind==='link'?'🔗':'📎';
    return `<div class="row"><div class="row-main"><div class="row-title">${icon} ${esc(x.title)}</div><div class="row-meta">${esc(x.kind)} · ${esc(x.parent_type||'general')}</div></div><div class="row-actions"><button class="mini open-attachment" data-id="${x.id}" type="button">فتح</button><button class="mini danger" data-action="delete" data-type="attachment" data-id="${x.id}" type="button">حذف</button></div></div>`;
  };
  $('quickCaptureList').innerHTML=combined.length?combined.slice(0,16).map(renderQuick).join(''):empty('لسه مفيش ملاحظات أو مرفقات.');
  $('homeCaptureList').innerHTML=combined.length?combined.slice(0,6).map(x=>`<div class="compact-item"><strong>${x._type==='note'?'📝':'📎'} ${esc(x.title||'ملاحظة')}</strong><div>${esc(x._type==='note'?(x.content||''):(x.kind||''))}</div></div>`).join(''):empty('استخدم زر + لإضافة أول حاجة.');
  document.querySelectorAll('.open-attachment').forEach(b=>b.onclick=()=>openAttachment(b.dataset.id));
}
async function openAttachment(id){
  const {data,error}=await sb.from('attachments').select('*').eq('id',id).single();if(error)return toast(error.message);
  if(data.external_url){window.open(data.external_url,'_blank','noopener');return}
  if(!data.storage_path)return;
  const {data:signed,error:err}=await sb.storage.from('serag-attachments').createSignedUrl(data.storage_path,3600);if(err)return toast(err.message);
  window.open(signed.signedUrl,'_blank','noopener');
}

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-action]');if(!b||!user)return;
  const {action,type,id}=b.dataset;
  if(action==='done'&&type==='task'){await sb.from('tasks').update({status:'done',updated_at:new Date().toISOString()}).eq('id',id);toast('تم ✓');return refreshAll()}
  if(action==='delete')return deleteItem(type,id);
  if(action==='edit')return editItem(type,id);
});
async function deleteItem(type,id){
  if(!confirm('متأكد إنك عايز تمسح؟'))return;
  const map={task:'tasks',meal:'meals',workout:'workouts',word:'english_words',grammar:'grammar_topics',course:'courses',writing:'english_writing',workproject:'work_projects',note:'quick_notes',creativeproject:'creative_projects',resource:'creative_resources'};
  if(type==='attachment'){
    const {data}=await sb.from('attachments').select('storage_path').eq('id',id).single();
    if(data?.storage_path)await sb.storage.from('serag-attachments').remove([data.storage_path]);
    await sb.from('attachments').delete().eq('id',id);toast('اتمسح');return refreshAll();
  }
  const table=map[type];if(!table)return;
  const {error}=await sb.from(table).delete().eq('id',id);if(error)return toast(error.message);toast('اتمسح');refreshAll();
}
async function editItem(type,id){
  if(type==='task'){
    const {data}=await sb.from('tasks').select('*').eq('id',id).single();if(!data)return;
    const title=prompt('اسم المهمة',data.title);if(title===null)return;
    const due=prompt('الموعد بصيغة YYYY-MM-DD HH:MM أو اتركه كما هو',data.due_at?new Date(data.due_at).toISOString().slice(0,16).replace('T',' '):'');
    let due_at=data.due_at;if(due!==null&&due.trim()){const d=new Date(due.replace(' ','T'));if(!isNaN(d))due_at=d.toISOString()}else if(due!==null)due_at=null;
    await sb.from('tasks').update({title:title.trim()||data.title,due_at,updated_at:new Date().toISOString()}).eq('id',id);return refreshAll();
  }
  if(type==='word'){
    const {data}=await sb.from('english_words').select('*').eq('id',id).single();const word=prompt('الكلمة',data.word);if(word===null)return;const meaning=prompt('المعنى',data.meaning||'');const example=prompt('مثال',data.example||'');await sb.from('english_words').update({word,meaning,example}).eq('id',id);return loadEnglish();
  }
  if(type==='grammar'){
    const {data}=await sb.from('grammar_topics').select('*').eq('id',id).single();const title=prompt('اسم القاعدة',data.title);if(title===null)return;const notes=prompt('الملاحظات',data.notes||'');await sb.from('grammar_topics').update({title,notes}).eq('id',id);return loadEnglish();
  }
  if(type==='course'){
    const {data}=await sb.from('courses').select('*').eq('id',id).single();const title=prompt('اسم الكورس',data.title);if(title===null)return;const url=prompt('الرابط',data.url||'');const progress=Math.max(0,Math.min(100,num(prompt('نسبة التقدم %',data.progress||0))));await sb.from('courses').update({title,url,progress,updated_at:new Date().toISOString()}).eq('id',id);return refreshAll();
  }
  if(type==='writing'){
    const {data}=await sb.from('english_writing').select('*').eq('id',id).single();const title=prompt('العنوان',data.title||'');if(title===null)return;const content=prompt('النص',data.content||'');if(content===null)return;await sb.from('english_writing').update({title,content,updated_at:new Date().toISOString()}).eq('id',id);return loadEnglish();
  }
  if(type==='note'){
    const {data}=await sb.from('quick_notes').select('*').eq('id',id).single();const title=prompt('العنوان',data.title||'');if(title===null)return;const content=prompt('الملاحظة',data.content||'');if(content===null)return;await sb.from('quick_notes').update({title,content,updated_at:new Date().toISOString()}).eq('id',id);return refreshAll();
  }
  if(type==='resource'){
    const {data}=await sb.from('creative_resources').select('*').eq('id',id).single();const title=prompt('اسم المصدر',data.title);if(title===null)return;const url=prompt('الرابط',data.url||'');const resource_type=prompt('النوع',data.resource_type||'reference');await sb.from('creative_resources').update({title,url,resource_type}).eq('id',id);return loadCreative();
  }
  if(type==='creativeproject'){
    const {data}=await sb.from('creative_projects').select('*').eq('id',id).single();const title=prompt('اسم المشروع',data.title);if(title===null)return;const brief=prompt('Brief',data.brief||'');await sb.from('creative_projects').update({title,brief,updated_at:new Date().toISOString()}).eq('id',id);return loadCreative();
  }
  if(type==='workproject'){
    const {data}=await sb.from('work_projects').select('*').eq('id',id).single();const title=prompt('اسم المشروع',data.title);if(title===null)return;const client=prompt('العميل',data.client||'');const status=prompt('الحالة: idea / active / waiting / review / done / archived',data.status||'active');await sb.from('work_projects').update({title,client,status,updated_at:new Date().toISOString()}).eq('id',id);return loadWork();
  }
}

async function loadHomeTip(){
  const [cups,calories]=await Promise.all([loadWater(),loadMeals()]);
  let tip='الدنيا ماشية كويس.';
  if(cups<3)tip='المياه قليلة لحد دلوقتي. كوب دلوقتي هيفرق.';
  else if(calories<1200)tip='السعرات لسه قليلة مقارنة بهدف اليوم. سجّل الوجبة الجاية.';
  $('homeTip').textContent=tip;
}
async function refreshAll(){
  if(!user)return;
  await Promise.all([loadWater(),loadMeals(),loadWorkouts(),loadTasks(),loadEnglish(),loadWork(),loadCreative(),loadCaptures()]);
  loadHomeTip();
}

(async()=>{
  const {data:{session}}=await sb.auth.getSession();user=session?.user||null;
  $('authView').classList.toggle('hidden',!!user);$('appView').classList.toggle('hidden',!user);$('quickFab').classList.toggle('hidden',!user);
  if(user)refreshAll();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
})();
