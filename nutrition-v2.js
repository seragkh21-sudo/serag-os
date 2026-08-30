(()=>{
  const q=id=>document.getElementById(id);
  let originalLoadMeals=null;

  function ensureStyles(){
    if(document.querySelector('link[href="/nutrition-v2.css"]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/nutrition-v2.css';
    document.head.appendChild(link);
  }

  function injectProteinStats(){
    const homeStats=document.querySelector('#page-today .stats');
    if(homeStats&&!q('homeProtein')){
      homeStats.insertAdjacentHTML('beforeend',`<div class="stat protein-stat"><span>البروتين</span><strong><b id="homeProtein">0</b><small> / <span id="homeProteinTarget">150</span> جم</small></strong><div class="progress"><div id="homeProteinBar" class="bar"></div></div></div>`);
      homeStats.classList.add('nutrition-home-stats');
    }
    const fitnessStats=document.querySelector('#page-fitness .stats');
    if(fitnessStats&&!q('fitnessProtein')){
      fitnessStats.insertAdjacentHTML('beforeend',`<div class="stat protein-stat"><span>بروتين اليوم</span><strong><b id="fitnessProtein">0</b><small> / <span id="fitnessProteinTarget">150</span> جم</small></strong><div class="progress"><div id="fitnessProteinBar" class="bar"></div></div></div>`);
      fitnessStats.classList.add('nutrition-fitness-stats');
    }
  }

  async function loadDailyProtein(){
    if(!user)return 0;
    injectProteinStats();
    const dayStart=typeof localDayStart==='function'?localDayStart():(()=>{const d=new Date();d.setHours(0,0,0,0);return d.toISOString()})();
    const [mealsRes,profileRes]=await Promise.all([
      sb.from('meals').select('protein_g').gte('eaten_at',dayStart),
      sb.from('profiles').select('protein_target').eq('id',user.id).maybeSingle()
    ]);
    if(mealsRes.error){console.warn('protein load',mealsRes.error);return 0}
    const total=Math.round((mealsRes.data||[]).reduce((sum,row)=>sum+Number(row.protein_g||0),0)*10)/10;
    const target=Math.max(1,Number(profileRes.data?.protein_target||150));
    if(q('homeProtein'))q('homeProtein').textContent=total;
    if(q('fitnessProtein'))q('fitnessProtein').textContent=total;
    if(q('homeProteinTarget'))q('homeProteinTarget').textContent=target;
    if(q('fitnessProteinTarget'))q('fitnessProteinTarget').textContent=target;
    const width=Math.min(100,total/target*100)+'%';
    if(q('homeProteinBar'))q('homeProteinBar').style.width=width;
    if(q('fitnessProteinBar'))q('fitnessProteinBar').style.width=width;
    return total;
  }

  function mount(){
    ensureStyles();
    injectProteinStats();
    try{
      if(typeof loadMeals==='function'&&!window.__seragProteinWrapped){
        originalLoadMeals=loadMeals;
        loadMeals=async function(){
          const result=await originalLoadMeals();
          await loadDailyProtein();
          return result;
        };
        window.__seragProteinWrapped=true;
      }
    }catch(err){console.warn('protein hook',err)}
    loadDailyProtein();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
