(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=v=>{try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
  const CATS=['Inspiration','Motion','Editing','Assets','Stock','3D','Audio','Typography','Color','Learning','AI'];
  const LABELS={Inspiration:'Inspiration',Motion:'Motion Design',Editing:'Editing & Post',Assets:'Assets & Templates',Stock:'Stock Footage', '3D':'3D Resources',Audio:'Audio & SFX',Typography:'Typography',Color:'Color Tools',Learning:'Learning',AI:'AI Creative Tools',Other:'Other'};
  const COLORS={
    Inspiration:['#b9d8ff','#78aef7'],Motion:['#d7c8ff','#9d82f0'],Editing:['#ffd3d4','#f39aab'],Assets:['#c8f4df','#74d8ae'],Stock:['#d5ecff','#82c0ef'],
    '3D':['#c8ddff','#76a8f3'],Audio:['#ffd0df','#ef87ad'],Typography:['#ffe8b5','#f3c568'],Color:['#d6cdfd','#aa8fea'],Learning:['#d8f0cf','#8dce85'],AI:['#e7d2ff','#ba8af0'],Other:['#e6e3eb','#b9b3c3']
  };
  let shell=null,allResources=[],activeFilter='all',activeCategory=null,refreshTimer=null;

  function normalizeType(v){
    const s=String(v||'').trim().toLowerCase();
    const found=CATS.find(c=>s===c.toLowerCase()||s.startsWith(c.toLowerCase())||s.includes(c.toLowerCase()));
    return found||'Other';
  }
  function hostOf(v){try{return new URL(v).hostname.replace(/^www\./,'')}catch{return ''}}
  function favicon(v){const host=hostOf(v);return host?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`:''}
  function initials(title){return String(title||'?').trim().slice(0,1).toUpperCase()||'?'}
  function filterRows(rows){
    if(activeFilter==='essential')return rows.filter(x=>(x.tags||[]).some(t=>String(t).toLowerCase()==='essential'));
    if(activeFilter==='free')return rows.filter(x=>(x.tags||[]).some(t=>String(t).toLowerCase()==='free'));
    return rows;
  }
  function visibleResources(){return filterRows(allResources.filter(x=>!x.project_id));}
  function siteIcon(x,klass='cl2-site-icon'){
    const src=favicon(x.url),fallback=esc(initials(x.title));
    return `<span class="${klass}">${src?`<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`:''}<span class="cl2-fav-fallback" style="${src?'display:none':''}">${fallback}</span></span>`;
  }
  function folderIcon(x){
    const src=favicon(x.url),fallback=esc(initials(x.title));
    return `<span class="cl2-fav">${src?`<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`:''}<span class="cl2-fav-fallback" style="${src?'display:none':''}">${fallback}</span></span>`;
  }

  function mount(){
    if(shell||window.__creativeLibraryV2Mounted)return;
    const list=$('resourcesList'),form=$('resourceForm');if(!list||!form)return;
    const details=list.closest('details'),body=list.closest('.accordion-body');if(!details||!body)return;
    window.__creativeLibraryV2Mounted=true;
    details.classList.add('cl2-source-details');
    shell=document.createElement('section');shell.id='creativeLibraryV2';shell.className='cl2-shell';shell.dataset.view='folders';
    shell.innerHTML=`
      <div class="cl2-top">
        <div class="cl2-heading"><span class="cl2-kicker">CREATIVE LIBRARY</span><h3>Your visual toolbox</h3><p id="cl2Subtitle">Curated references, assets and tools — organized for fast access.</p></div>
        <div class="cl2-top-actions"><button id="cl2AddBtn" class="cl2-btn primary" type="button">+ Add source</button></div>
      </div>
      <div class="cl2-add-panel" id="cl2AddPanel"></div>
      <div class="cl2-toolbar">
        <label class="cl2-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><input id="cl2Search" type="search" placeholder="Search websites, tags or categories…" autocomplete="off"></label>
        <div class="cl2-chips"><button class="cl2-chip active" data-cl2-filter="all" type="button">All</button><button class="cl2-chip" data-cl2-filter="essential" type="button">Essential</button><button class="cl2-chip" data-cl2-filter="free" type="button">Free</button></div>
      </div>
      <div class="cl2-folders"><div id="cl2Grid" class="cl2-grid"></div></div>
      <div class="cl2-browser"><div class="cl2-browser-head"><div class="cl2-browser-title"><button id="cl2Back" class="cl2-back" type="button" aria-label="Back">←</button><div><h4 id="cl2BrowserName">Category</h4><span id="cl2BrowserCount"></span></div></div></div><div id="cl2Sites" class="cl2-sites"></div></div>`;
    body.insertBefore(shell,body.firstChild);
    $('cl2AddPanel').appendChild(form);
    bind();observeLegacy(list);refresh();
  }

  function bind(){
    $('cl2AddBtn').onclick=()=>{shell.classList.toggle('add-open');if(shell.classList.contains('add-open'))setTimeout(()=>$('resourceTitle')?.focus(),50)};
    $('cl2Search').addEventListener('input',()=>render());
    $('cl2Back').onclick=()=>{activeCategory=null;$('cl2Search').value='';shell.dataset.view='folders';renderFolders()};
    shell.addEventListener('click',e=>{
      const folder=e.target.closest('[data-cl2-category]');if(folder){activeCategory=folder.dataset.cl2Category;shell.dataset.view='folder';renderBrowser(activeCategory);return}
      const chip=e.target.closest('[data-cl2-filter]');if(chip){activeFilter=chip.dataset.cl2Filter;shell.querySelectorAll('[data-cl2-filter]').forEach(b=>b.classList.toggle('active',b===chip));render();return}
    });
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="creative"],[data-v5-page="creative"]'))setTimeout(refresh,120)});
    try{
      if(typeof loadCreative==='function'&&!window.__creativeLibraryV2Wrapped){
        const original=loadCreative;window.__creativeLibraryV2Wrapped=true;
        loadCreative=async function(){const result=await original();setTimeout(refresh,30);return result};
      }
    }catch{}
  }

  function observeLegacy(list){
    new MutationObserver(()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,120)}).observe(list,{childList:true,subtree:true});
  }

  async function refresh(){
    if(!shell||typeof sb==='undefined'||!user)return;
    const {data=[],error}=await sb.from('creative_resources').select('*').order('created_at',{ascending:false});
    if(error)return;
    allResources=data;
    const globalCount=allResources.filter(x=>!x.project_id).length;
    const count=$('resourcesCount');if(count)count.textContent=globalCount;
    $('cl2Subtitle').textContent=`${globalCount} curated sources across design, motion, editing and more.`;
    render();
  }

  function render(){
    const q=String($('cl2Search')?.value||'').trim().toLowerCase();
    if(q){activeCategory='__search';shell.dataset.view='folder';renderBrowser('__search',q);return}
    if(activeCategory&&activeCategory!=='__search'){shell.dataset.view='folder';renderBrowser(activeCategory);return}
    activeCategory=null;shell.dataset.view='folders';renderFolders();
  }

  function renderFolders(){
    const rows=visibleResources(),grid=$('cl2Grid');if(!grid)return;
    const by={};[...CATS,'Other'].forEach(c=>by[c]=[]);rows.forEach(x=>(by[normalizeType(x.resource_type)]||by.Other).push(x));
    const cats=[...CATS,'Other'].filter(c=>by[c].length);
    grid.innerHTML=cats.length?cats.map(cat=>{
      const items=by[cat],colors=COLORS[cat]||COLORS.Other,icons=items.slice(0,4).map(folderIcon).join('');
      return `<button class="cl2-folder-card" type="button" data-cl2-category="${esc(cat)}" style="--cl2-a:${colors[0]};--cl2-b:${colors[1]}"><div class="cl2-folder-visual"><div class="cl2-folder-back"></div><div class="cl2-fav-stack">${icons}</div><div class="cl2-folder-front"></div>${items.length>4?`<span class="cl2-more-favs">+${items.length-4}</span>`:''}</div><div class="cl2-folder-meta"><div class="cl2-folder-name"><strong>${esc(LABELS[cat]||cat)}</strong><span class="cl2-folder-arrow">↗</span></div><div class="cl2-folder-count">${items.length} source${items.length===1?'':'s'}</div></div></button>`;
    }).join(''):`<div class="cl2-empty">No sources in this filter yet.</div>`;
  }

  function renderBrowser(cat,q=''){
    let rows=visibleResources();
    let title='Search results';
    if(cat==='__search')rows=rows.filter(x=>`${x.title||''} ${x.resource_type||''} ${(x.tags||[]).join(' ')} ${x.notes||''} ${hostOf(x.url)}`.toLowerCase().includes(q));
    else{rows=rows.filter(x=>normalizeType(x.resource_type)===cat);title=LABELS[cat]||cat}
    $('cl2BrowserName').textContent=title;$('cl2BrowserCount').textContent=`${rows.length} source${rows.length===1?'':'s'}`;
    $('cl2Sites').innerHTML=rows.length?rows.map(siteCard).join(''):`<div class="cl2-empty">Nothing matched this view.</div>`;
  }

  function siteCard(x){
    const url=safeUrl(x.url),host=hostOf(url),tags=(x.tags||[]).slice(0,3),essential=tags.some(t=>String(t).toLowerCase()==='essential');
    return `<article class="cl2-site" title="${esc(x.notes||'')}"><div class="cl2-site-top">${siteIcon(x)}<div class="cl2-site-text"><strong>${esc(x.title)}</strong><small>${esc(host||x.resource_type||'Source')}</small></div></div><div class="cl2-site-tags">${essential?'<span class="cl2-tag essential">Essential</span>':''}${tags.filter(t=>String(t).toLowerCase()!=='essential').slice(0,2).map(t=>`<span class="cl2-tag">${esc(t)}</span>`).join('')}</div><div class="cl2-site-actions">${url?`<a href="${esc(url)}" target="_blank" rel="noopener">Open ↗</a>`:''}<button type="button" data-action="edit" data-type="resource" data-id="${esc(x.id)}">Edit</button><button type="button" data-action="delete" data-type="resource" data-id="${esc(x.id)}">Delete</button></div></article>`;
  }

  function boot(){if($('resourcesList'))mount();else setTimeout(boot,120)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
