/* Serag Creative Workspace. Uses the existing authenticated Supabase client. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const h = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => crypto.randomUUID();
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const paths = {
    board:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    plus:'M12 5v14 M5 12h14', back:'m9 5 7 7-7 7',
    upload:'M12 16V3 m-5 5 5-5 5 5 M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',
    note:'M5 3h14a2 2 0 0 1 2 2v10l-6 6H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M15 21v-6h6 M7 8h10 M7 12h6',
    prompt:'m8 7-5 5 5 5 m8-10 5 5-5 5 m-3-13-2 16',
    image:'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z m-1 13 6-6 12 10 M15 7h.01',
    video:'m9 7 8 5-8 5z M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
    link:'m10 13 4-4 M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0 M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
    cursor:'m5 3 14 9-7 1-3 7z', hand:'M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v10c0 4-3 6-7 6-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l2 2',
    connect:'M5 4v12a3 3 0 0 0 3 3h12 m-4-4 4 4-4 4 M3 2h4v4H3z',
    undo:'M3 10h10a6 6 0 0 1 0 12 M7 5l-5 5 5 5', redo:'M21 10H11a6 6 0 0 0 0 12 m7-17 5 5-5 5',
    fit:'M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M8 8h8v8H8z',
    minus:'M5 12h14', close:'m6 6 12 12 M6 18 18 6', layers:'m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',
    trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
    copy:'M9 9h12v12H9z M15 9V3H3v12h6', archive:'M3 3h18v5H3z M5 8v13h14V8 M10 12h4',
    check:'m4 12 5 5L20 6', retry:'M20 7a9 9 0 1 0 1 8 M20 2v6h-6', file:'M5 3h9l5 5v13H5z M14 3v6h5',
    up:'m5 12 7-7 7 7 M12 5v15', download:'M12 3v13 m-5-5 5 5 5-5 M4 17v4h16v-4'
  };
  const icon = name => `<svg class="cw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`;
  const button = (action, label, glyph, extra = '') => `<button type="button" class="cw-icon-button" data-cw="${action}" title="${h(label)}" aria-label="${h(label)}" ${extra}>${icon(glyph)}</button>`;
  const blank = () => ({nodes:[], edges:[], assets:[], viewport:{x:110, y:70, zoom:1}});
  const labels = {note:'ملاحظة', prompt:'Prompt', link:'رابط', image:'صورة', video:'فيديو'};
  const colors = ['#fff5ca','#f0eaff','#e6f2ff','#e6f5ed','#ffe9df','#ffffff'];
  let sessions = [], projects = [], archived = false, session = null, doc = blank();
  let selected = null, tool = 'cursor', connectFrom = null, drag = null, space = false;
  let history = [], future = [], dirty = false, generation = 0, saveTimer, saving = null, conflict = false;
  let uploading = false, sidebarTab = 'layers', lastFocus, oldOverflow = '', loading = false;
  let authOwner = null, viewEpoch = 0, createBusy = false, copyBusy = false;
  const mediaUrls = new Map();
  const pendingMedia = new Map();
  const pointers = new Map();
  let pinch = null;
  const draftKey = row => `serag-creative-draft:${row.user_id}:${row.id}`;

  function mount() {
    const page = $('page-creative');
    if (!page || $('cwHome')) return;
    page.querySelector('.top .muted').textContent = 'مساحة شغلك، مشاريعك والريفرنسات.';
    page.querySelector('.top').insertAdjacentHTML('afterend', `<section id="cwHome" class="cw-home">
      <div class="cw-head"><div><div class="cw-kicker">YOUR CREATIVE SPACE</div><h3>Workspace Sessions</h3><p>كل فكرة ليها مساحة. اجمع الريفرنسات وابني عليها.</p></div>
      <div class="cw-head-actions"><button class="cw-button cw-primary" data-cw="new">${icon('plus')} سيشن جديدة</button></div></div>
      <div class="cw-search-row"><input id="cwSearch" type="search" aria-label="ابحث في السيشنز" placeholder="ابحث عن سيشن…"><button class="cw-button" data-cw="archive-filter" aria-pressed="false">${icon('archive')} الأرشيف</button>${button('reload','تحديث السيشنز','retry')}</div>
      <div id="cwSessions" class="cw-session-grid"><div class="cw-loading">جاري تحميل السيشنز…</div></div></section>`);
    document.body.insertAdjacentHTML('beforeend', `<dialog id="cwCreate" class="cw-dialog cw-small-dialog" dir="rtl" aria-labelledby="cwCreateTitle">
      <h3 id="cwCreateTitle">سيشن جديدة</h3><form id="cwCreateForm" class="cw-form">
      <label>اسم السيشن<input id="cwNewTitle" maxlength="160" required placeholder="مثلاً: حملة اليوم الوطني — Moodboard" autocomplete="off"></label>
      <label>المشروع<select id="cwNewProject"><option value="">سيشن مستقلة</option></select></label>
      <label>ابدأ بـ<select id="cwTemplate"><option value="blank">بورد فاضية</option><option value="moodboard">Moodboard — بريف واتجاه بصري</option><option value="storyboard">Storyboard — مشاهد فيديو</option><option value="campaign">حملة سوشيال — بريف وتسليم</option><option value="motion">Motion — سكريبت وإنتاج</option></select></label>
      <p id="cwCreateError" class="cw-form-error" role="alert"></p><div class="cw-actions"><button type="button" class="cw-button" data-cw="cancel-create">إلغاء</button><button id="cwCreateSubmit" class="cw-button cw-primary" type="submit">إنشاء السيشن ${icon('plus')}</button></div></form></dialog>
      <dialog id="cwBoard" class="cw-dialog cw-board-dialog" dir="rtl" aria-label="مساحة العمل الإبداعية">
      <header class="cw-board-head"><div class="cw-board-brand">${button('close','حفظ والرجوع للسيشنز','back')}<div><div class="cw-kicker">CREATIVE / WORKSPACE</div><input id="cwTitle" aria-label="اسم السيشن" maxlength="160"><small id="cwProjectLabel"></small></div></div>
      <div class="cw-row"><button class="cw-button" data-cw="arrange" title="ترتيب كروت البورد في شبكة">ترتيب</button><button class="cw-button" data-cw="export-brief">تصدير البريف</button><span id="cwSaveState" class="cw-save" role="status"></span><button class="cw-button cw-primary" data-cw="upload">${icon('upload')}<span class="cw-upload-label">رفع ملفات</span></button><span class="cw-sidebar-toggle">${button('sidebar','العناصر والملفات','layers')}</span></div></header>
      <div class="cw-board-body"><div id="cwCanvas" class="cw-canvas" tabindex="0" aria-label="البورد. اسحب العناصر من عنوانها. استخدم الأسهم لتحريك العنصر المحدد.">
      <div id="cwWorld" class="cw-world"><svg id="cwEdges" class="cw-edges" aria-hidden="true"></svg><div id="cwNodes"></div></div>
      <div id="cwBoardEmpty" class="cw-board-empty">${icon('board')}<h3>مساحة للفكرة اللي جاية.</h3><p>اسحب الصور والفيديوهات هنا، أو ابدأ بملاحظة.<br>حرّك، رتّب، ووصل أفكارك ببعض.</p><button class="cw-button" data-cw="upload">${icon('upload')} اختار ملفات</button></div>
      <div id="cwTools" class="cw-tools" role="toolbar" aria-label="أدوات البورد">${button('cursor','تحديد · V','cursor','aria-pressed="true"')}${button('hand','تحريك البورد · H أو Space','hand','aria-pressed="false"')}<hr>${button('note','إضافة ملاحظة · N','note')}${button('prompt','إضافة برومبت · P','prompt')}${button('link','إضافة رابط · L','link')}${button('connect','وصل عنصرين · C','connect','aria-pressed="false"')}<hr>${button('undo','تراجع · Ctrl Z','undo')}${button('redo','إعادة · Ctrl Shift Z','redo')}</div>
      <div id="cwConflict" class="cw-conflict" role="alert" hidden>السيشن اتعدلت في مكان تاني. احفظ شغلك كنسخة علشان تحتفظ بالاتنين.<button class="cw-button" data-cw="save-copy">حفظ كسيشن جديدة</button></div>
      <div id="cwUploadStatus" class="cw-upload-status" role="status"></div></div>
      <aside id="cwInspector" class="cw-inspector" aria-label="محتوى السيشن"><div class="cw-inspector-tabs"><button data-cw="layers" class="active">العناصر</button><button data-cw="assets">الملفات</button></div><div id="cwInspectorBody"></div></aside></div>
      <footer class="cw-footer"><span class="cw-footer-help">Space + سحب للتحريك · Ctrl + عجلة الماوس للزوم · Delete للحذف</span><button type="button" id="cwFooterState" class="cw-footer-status" data-cw="retry-save" aria-label="حالة الحفظ. اضغط لحفظ التعديلات." aria-live="polite"></button><div class="cw-zoom">${button('zoom-out','تصغير','minus')}<button class="cw-button" data-cw="reset-zoom" id="cwZoom">100%</button>${button('zoom-in','تكبير','plus')}${button('fit','عرض كل العناصر','fit')}</div></footer>
      <input id="cwFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime" multiple hidden></dialog>`);
    $('cwSearch').addEventListener('input', renderSessions);
    $('cwCreateForm').addEventListener('submit', createSession);
    $('cwFileInput').addEventListener('change', e => { uploadFiles([...e.target.files]); e.target.value = ''; });
    $('cwTitle').addEventListener('input', () => changed());
    $('cwTitle').addEventListener('blur', () => { if (!$('cwTitle').value.trim()) $('cwTitle').value = session?.title || 'سيشن بدون عنوان'; });
    $('cwBoard').addEventListener('cancel', e => { e.preventDefault(); closeBoard(); });
    $('cwCreate').addEventListener('cancel', e => { if(createBusy) e.preventDefault(); });
    document.addEventListener('click', onClick);
    bindCanvas();
    sb.auth.onAuthStateChange((_event, current) => {
      const next = current?.user?.id || null;
      if (next === authOwner) return;
      authOwner = next;
      setTimeout(() => { clearBoard(); sessions = []; renderSessions(); if(next) loadSessions(); }, 0);
    });
    // Observe visibility only; avoids the app's global refresh rebuilding an active board.
    new MutationObserver(() => { if (!page.classList.contains('hidden') && user && !session) loadSessions(); }).observe(page, {attributes:true,attributeFilter:['class']});
    window.addEventListener('beforeunload', e => { if(dirty || uploading) { e.preventDefault(); e.returnValue = ''; } });
    window.addEventListener('online', () => { if(dirty && !conflict) flushSave(); });
    document.addEventListener('visibilitychange', () => { if(document.hidden && dirty) flushSave(); });
    if (typeof user !== 'undefined' && user) { authOwner = user.id; loadSessions(); }
  }

  async function loadSessions() {
    if (!user || loading) return;
    loading = true;
    const owner = user.id;
    try {
      const [a,b] = await Promise.all([
        sb.from('creative_sessions').select('id,title,project_id,revision,archived,updated_at').eq('user_id',owner).order('updated_at',{ascending:false}),
        sb.from('creative_projects').select('id,title').eq('user_id',owner).order('created_at',{ascending:false})
      ]);
      if (user?.id !== owner) return;
      if(a.error) throw a.error;
      sessions = a.data || []; projects = b.data || [];
      renderSessions();
    } catch(e) { $('cwSessions').innerHTML = `<div class="cw-empty"><strong>تعذّر تحميل السيشنز</strong><p>راجع الاتصال وجرّب تاني.</p><button class="cw-button" data-cw="reload">إعادة المحاولة</button></div>`; }
    finally { loading = false; }
  }
  function renderSessions() {
    if (!$('cwSessions')) return;
    const query = $('cwSearch').value.trim().toLowerCase();
    const list = sessions.filter(s => s.archived === archived && `${s.title} ${projects.find(p=>p.id===s.project_id)?.title||''}`.toLowerCase().includes(query));
    $('cwSessions').innerHTML = list.length ? list.map(s => `<article class="cw-session"><button class="cw-session-open" data-cw-open="${h(s.id)}"><div class="cw-session-cover" aria-hidden="true"><div class="cw-cover-tile">${icon('image')}</div><div class="cw-cover-tile">${icon('note')}</div><div class="cw-cover-tile">${icon('video')}</div></div><div class="cw-session-info"><strong>${h(s.title)}</strong><small>${h(projects.find(p=>p.id===s.project_id)?.title || 'سيشن مستقلة')}</small></div></button><div class="cw-session-bottom"><span>آخر تعديل ${new Date(s.updated_at).toLocaleDateString('ar-EG',{day:'numeric',month:'short'})}</span><button class="cw-icon-button" data-cw-archive="${h(s.id)}" title="${archived?'استعادة السيشن':'أرشفة السيشن'}" aria-label="${archived?'استعادة':'أرشفة'} ${h(s.title)}">${icon(archived?'retry':'archive')}</button></div></article>`).join('') : `<div class="cw-empty">${icon('board')}<strong>${query?'مفيش سيشن بالاسم ده':archived?'الأرشيف فاضي':'ابدأ أول سيشن ليك'}</strong><p>${query?'جرّب اسم تاني.':archived?'السيشنز المؤرشفة هتفضل محفوظة هنا.':'ريفـرنسات، فيديوهات وبرومبتات… جنب بعض في بورد واحدة.'}</p>${!query&&!archived?'<button class="cw-button cw-primary" data-cw="new">+ سيشن جديدة</button>':''}</div>`;
  }
  function showCreate() {
    if(!user) return;
    $('cwCreateForm').reset(); $('cwCreateError').textContent = '';
    $('cwNewProject').innerHTML = '<option value="">سيشن مستقلة</option>'+projects.map(p=>`<option value="${h(p.id)}">${h(p.title)}</option>`).join('');
    $('cwCreate').showModal(); $('cwNewTitle').focus();
  }
  function templateDocument(type) {
    const value = blank();
    const note = (kind,title,text,x,y,w=300,height=270) => ({id:uid(),kind,title,text,x,y,w,h:height});
    if(type==='moodboard') value.nodes = [note('note','البريف','الهدف من التصميم:\n\nالجمهور:\n\nالرسالة الأساسية:',40,40),note('prompt','الاتجاه البصري','Style:\n\nLighting:\n\nColors:\n\nComposition:',400,40,330,300)];
    if(type==='storyboard') value.nodes = [0,1,2].map(i=>note('note',`المشهد 0${i+1}`,'الصورة / الحركة:\n\nالتعليق الصوتي:\n\nالمدة:',40+i*350,50,300,310));
    if(type==='campaign') value.nodes = [
      note('note','01 / البريف','العميل:\nالهدف:\nالجمهور والسوق:\nالرسالة الأساسية:\nدعوة لاتخاذ إجراء:',40,40,320,330),
      note('note','02 / الاتجاه البصري','الألوان:\nالخطوط:\nالملمس والإضاءة:\nزاوية التصوير:\nعناصر نستخدمها / نتجنبها:',410,40,320,330),
      note('prompt','03 / Hero prompt','Subject:\nComposition:\nCamera angle:\nMaterials and lighting:\nBrand colors:\nBackground:\nAvoid:',780,40,340,330),
      note('note','04 / قبل التسليم','□ مراجعة النص العربي\n□ مراجعة الشعار والألوان\n□ تأكيد المقاسات المطلوبة\n□ مراجعة الحواف والخلفية\n□ تصدير النسخة المعتمدة\n□ جمع ملفات المشروع والخطوط',40,430,320,300)];
    if(type==='motion') value.nodes = [
      note('note','01 / السكريبت','الفكرة:\nالافتتاحية:\nالمشكلة:\nالحل:\nالخاتمة / CTA:',40,40,320,330),
      note('note','02 / إعداد المشروع','المدة:\nالمقاس:\nFrame rate:\nالموسيقى:\nالتعليق الصوتي:\nطريقة التسليم:',410,40,320,330),
      ...[0,1,2].map(i=>note('note',`Shot 0${i+1}`,'Timecode:\nالصورة:\nالحركة:\nالصوت:\nTransition:',40+i*370,430,320,300))];
    return value;
  }
  async function createSession(e) {
    e.preventDefault(); if(createBusy || !user) return;
    const title = $('cwNewTitle').value.trim(); if(!title) return;
    createBusy = true; $('cwCreateSubmit').disabled = true;
    try {
      const {data,error} = await sb.from('creative_sessions').insert({user_id:user.id,title,project_id:$('cwNewProject').value||null,document:templateDocument($('cwTemplate').value)}).select().single();
      if(error) throw error;
      $('cwCreate').close(); await openBoard(data.id); loadSessions();
    } catch(e) { $('cwCreateError').textContent = 'السيشن ما اتحفظتش. راجع الاتصال وجرّب تاني.'; }
    finally { createBusy = false; $('cwCreateSubmit').disabled = false; }
  }

  function normalize(value) {
    const v = value || blank();
    return {nodes:(Array.isArray(v.nodes)?v.nodes:[]).filter(n=>Object.hasOwn(labels,n.kind)).slice(0,500).map(n=>({...n,x:clamp(Number(n.x)||0,-20000,20000),y:clamp(Number(n.y)||0,-20000,20000),w:clamp(Number(n.w)||300,180,1600),h:clamp(Number(n.h)||240,130,1600)})),edges:Array.isArray(v.edges)?v.edges:[],assets:Array.isArray(v.assets)?v.assets:[],viewport:{x:Number(v.viewport?.x)||110,y:Number(v.viewport?.y)||70,zoom:clamp(Number(v.viewport?.zoom)||1,.2,2)}};
  }
  async function openBoard(id) {
    if(session && !(await closeBoard())) return;
    const epoch = ++viewEpoch;
    try {
      const {data,error} = await sb.from('creative_sessions').select().eq('id',id).eq('user_id',user.id).single();
      if(error) throw error;
      if(epoch!==viewEpoch || user?.id!==data.user_id) return;
      session=data; doc=normalize(data.document); selected=null; dirty=false; conflict=false; history=[]; future=[]; generation=0;
      $('cwTitle').value = data.title;
      try {
        const draft=JSON.parse(localStorage.getItem(draftKey(data))||'null');
        if(draft?.document){doc=normalize(draft.document);$('cwTitle').value=draft.title||data.title;dirty=true;conflict=draft.revision!==data.revision;}
      } catch {}
      $('cwProjectLabel').textContent=projects.find(p=>p.id===data.project_id)?.title||'سيشن مستقلة';
      lastFocus=document.activeElement; oldOverflow=document.body.style.overflow; document.body.style.overflow='hidden';
      $('cwBoard').showModal(); $('cwConflict').hidden=!conflict;
      sidebarTab='layers';setTool('cursor');renderBoard(); status(conflict?'error':dirty?'pending':'saved');
      $('cwCanvas').focus();
      if(dirty&&!conflict) flushSave();
    } catch(e) { toast('تعذّر فتح السيشن. جرّب تاني.'); }
  }
  function persistDraft() {
    if(!session) return;
    try { localStorage.setItem(draftKey(session),JSON.stringify({revision:session.revision,title:$('cwTitle').value.trim()||session.title,document:doc})); } catch {}
  }
  function changed() {
    if(!session) return;
    dirty=true; generation++; persistDraft(); status(conflict?'error':'pending');
    clearTimeout(saveTimer); if(!conflict) saveTimer=setTimeout(flushSave,650);
  }
  function status(state, message) {
    const texts={saved:'كل التعديلات محفوظة',saving:'جاري الحفظ…',pending:'تعديلات لم تُحفظ بعد',error:'تعذّر الحفظ — اضغط للمحاولة'};
    $('cwSaveState').dataset.state=state;
    $('cwSaveState').textContent=message||texts[state];
    $('cwSaveState').onclick=state==='error'?()=>flushSave():null;
    $('cwFooterState').textContent=message||texts[state];
  }
  async function flushSave() {
    clearTimeout(saveTimer);
    if(saving) { await saving; return dirty&&!conflict?flushSave():!dirty; }
    if(!session || !dirty) return true;
    if(conflict) return false;
    const row=session, gen=generation, snapshot=clone(doc), title=$('cwTitle').value.trim()||row.title;
    status('saving');
    saving=(async()=>{
      try {
        const {data,error}=await sb.from('creative_sessions').update({title,document:snapshot,revision:row.revision+1,updated_at:new Date().toISOString()}).eq('id',row.id).eq('user_id',row.user_id).eq('revision',row.revision).select('revision,updated_at').maybeSingle();
        if(error) throw error;
        if(session!==row) return false;
        if(!data){conflict=true;$('cwConflict').hidden=false;status('error','فيه نسخة أحدث — احفظ شغلك كنسخة');return false;}
        row.revision=data.revision;row.updated_at=data.updated_at;row.title=title;
        if(generation===gen){dirty=false;try{localStorage.removeItem(draftKey(row));}catch{}status('saved');}
        else {persistDraft();status('pending');}
        return true;
      } catch(e) { if(session===row) status('error'); return false; }
    })();
    const result=await saving; saving=null;
    if(result&&dirty&&!conflict) return flushSave();
    return result;
  }
  async function saveCopy() {
    if(!session || uploading || saving || copyBusy) return;
    copyBusy=true;
    const old=session, copyGen=generation;
    try {
      const {data,error}=await sb.from('creative_sessions').insert({user_id:old.user_id,project_id:old.project_id,title:($('cwTitle').value.trim()||old.title).slice(0,145)+' — نسخة',document:clone(doc)}).select().single();
      if(error) throw error;
      if(session!==old)return;
      try{localStorage.removeItem(draftKey(old));}catch{}session=data;dirty=generation!==copyGen;conflict=false;$('cwConflict').hidden=true;$('cwTitle').value=data.title;status(dirty?'pending':'saved');if(dirty){persistDraft();flushSave();}loadSessions();
    } catch(e) { status('error','تعذّر حفظ النسخة. جرّب تاني.'); }
    finally {copyBusy=false;}
  }
  async function closeBoard() {
    if(uploading){announce('استنى لحد ما رفع الملفات يخلص.');return false;}
    if(session && !(await flushSave())) return false;
    clearBoard();loadSessions();return true;
  }
  function clearBoard() {
    viewEpoch++; clearTimeout(saveTimer);
    $('cwBoard')?.querySelectorAll('video').forEach(v=>v.pause());
    if($('cwBoard')?.open){$('cwBoard').close();document.body.style.overflow=oldOverflow;lastFocus?.focus();}
    if($('cwCreate')?.open) $('cwCreate').close();
    session=null;dirty=false;conflict=false;selected=null;history=[];future=[];doc=blank();drag=null;pointers.clear();pinch=null;
    mediaUrls.clear();pendingMedia.clear();
    if($('cwNodes')) $('cwNodes').replaceChildren();
  }
  function snapshot() {history.push(JSON.stringify({nodes:doc.nodes,edges:doc.edges}));if(history.length>60)history.shift();future=[];syncHistory();}
  function syncHistory(){
    $('cwTools').querySelector('[data-cw=undo]').disabled=!history.length;
    $('cwTools').querySelector('[data-cw=redo]').disabled=!future.length;
  }
  function undo(redo=false) {
    const source=redo?future:history,target=redo?history:future;
    if(!source.length) return;
    target.push(JSON.stringify({nodes:doc.nodes,edges:doc.edges}));Object.assign(doc,JSON.parse(source.pop()));selected=null;changed();renderBoard();
  }
  function position() { const r=$('cwCanvas').getBoundingClientRect(),v=doc.viewport; return {x:(r.width/2-v.x)/v.zoom-145,y:(r.height/2-v.y)/v.zoom-110}; }
  function addNode(kind,values={}) {
    if(doc.nodes.length>=500){announce('السيشن وصلت لـ500 عنصر. ابدأ سيشن جديدة.');return;}
    snapshot();const point=position();const n={id:uid(),kind,title:labels[kind],text:'',x:point.x,y:point.y,w:kind==='video'?380:300,h:kind==='link'?165:kind==='video'?265:260,...values};
    doc.nodes.push(n);selected=n.id;setTool('cursor');changed();renderBoard();
    if(['note','prompt','link'].includes(kind)) $('cwNodes').querySelector(`[data-node="${n.id}"] textarea, [data-node="${n.id}"] input`)?.focus();
  }
  function selectNode(id,center=false) {
    selected=id;
    document.querySelectorAll('.cw-node').forEach(el=>el.classList.toggle('cw-selected',el.dataset.node===id));
    if(center){const n=doc.nodes.find(x=>x.id===id),r=$('cwCanvas').getBoundingClientRect();if(n){doc.viewport.x=r.width/2-(n.x+n.w/2)*doc.viewport.zoom;doc.viewport.y=r.height/2-(n.y+n.h/2)*doc.viewport.zoom;transform();changed();}}
    renderInspector();
  }
  function setTool(value) {
    tool=value;connectFrom=null;$('cwCanvas').dataset.tool=value;
    for(const b of $('cwTools').querySelectorAll('[aria-pressed]'))b.setAttribute('aria-pressed',String(b.dataset.cw===value));
    if(value==='connect') announce('اختار العنصر الأول، وبعده العنصر التاني.');
  }
  function transform() {
    const v=doc.viewport;$('cwWorld').style.transform=`translate(${v.x}px,${v.y}px) scale(${v.zoom})`;
    const grid=Math.max(14,22*v.zoom);
    $('cwCanvas').style.backgroundSize=`${grid}px ${grid}px`;$('cwCanvas').style.backgroundPosition=`${v.x}px ${v.y}px`;
    $('cwZoom').textContent=`${Math.round(v.zoom*100)}%`;
  }
  function zoomTo(zoom,cx,cy) {
    const v=doc.viewport,r=$('cwCanvas').getBoundingClientRect();cx??=r.width/2;cy??=r.height/2;
    const z=clamp(zoom,.2,2),ratio=z/v.zoom;v.x=cx-(cx-v.x)*ratio;v.y=cy-(cy-v.y)*ratio;v.zoom=z;transform();changed();
  }
  function fit() {
    if(!doc.nodes.length){doc.viewport=blank().viewport;transform();changed();return;}
    const r=$('cwCanvas').getBoundingClientRect(),xs=doc.nodes.map(n=>n.x),ys=doc.nodes.map(n=>n.y),left=Math.min(...xs),top=Math.min(...ys),right=Math.max(...doc.nodes.map(n=>n.x+n.w)),bottom=Math.max(...doc.nodes.map(n=>n.y+n.h));
    const z=clamp(Math.min((r.width-140)/(right-left),(r.height-100)/(bottom-top)),.2,1.2);
    doc.viewport={zoom:z,x:(r.width-(right-left)*z)/2-left*z,y:(r.height-(bottom-top)*z)/2-top*z};transform();changed();
  }
  function renderBoard() {
    if(!session)return;
    const root=$('cwNodes');root.querySelectorAll('video').forEach(v=>v.pause());
    root.innerHTML=doc.nodes.map(nodeMarkup).join('');
    for(const el of root.querySelectorAll('.cw-node')) {
      const n=doc.nodes.find(x=>x.id===el.dataset.node);
      const edit=el.querySelector('textarea,input');
      if(edit){edit.addEventListener('focus',()=>{selectNode(n.id);snapshot();},{once:true});edit.addEventListener('input',()=>{if(n.kind==='link'){n.url=edit.value;const a=el.querySelector('a');a.href=safeUrl(n.url)||'#';a.hidden=!safeUrl(n.url);}else n.text=edit.value;changed();});}
      const media=el.querySelector('[data-asset]');if(media)hydrateMedia(media,n.assetId);
    }
    $('cwBoardEmpty').hidden=!!doc.nodes.length;transform();renderEdges();renderInspector();
    syncHistory();
  }
  function nodeMarkup(n) {
    const color=colors.includes(n.color)?`background:${n.color};`:'';
    let content='';
    if(n.kind==='note'||n.kind==='prompt') content=`<textarea aria-label="${h(n.title)}" placeholder="${n.kind==='prompt'?'اكتب البرومبت هنا…':'اكتب فكرتك…'}" maxlength="24000" spellcheck="${n.kind!=='prompt'}">${h(n.text)}</textarea>`;
    if(n.kind==='link') content=`<div class="cw-node-link"><input type="url" value="${h(n.url||'')}" placeholder="https://…" aria-label="رابط الريفرنس"><a href="${h(safeUrl(n.url)||'#')}" target="_blank" rel="noopener noreferrer" ${safeUrl(n.url)?'':'hidden'}>فتح الريفرنس ↗</a></div>`;
    if(n.kind==='image'||n.kind==='video') content=`<div class="cw-node-media">${n.kind==='image'?`<img data-asset="${h(n.assetId)}" alt="${h(n.title)}" draggable="false">`:`<video data-asset="${h(n.assetId)}" aria-label="${h(n.title)}" controls playsinline preload="metadata"></video>`}<div class="cw-media-failed" hidden><span>المعاينة غير متاحة لهذا الملف.</span><button class="cw-button" data-cw-download="${h(n.assetId)}">فتح الملف الأصلي ↗</button></div></div>`;
    return `<article class="cw-node ${selected===n.id?'cw-selected':''}" data-node="${h(n.id)}" data-kind="${h(n.kind)}" style="left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px;${color}"><div class="cw-node-head" title="اسحب لتحريك العنصر">${icon(n.kind)}<span>${h(n.title)}</span>${n.kind==='prompt'?`<button data-cw-copy="${h(n.id)}" aria-label="نسخ البرومبت" title="نسخ البرومبت">${icon('copy')}</button>`:''}</div>${content}<div class="cw-resize" aria-label="تغيير حجم العنصر"></div></article>`;
  }
  function renderEdges() {
    $('cwEdges').innerHTML=doc.edges.map(e=>{const a=doc.nodes.find(n=>n.id===e.from),b=doc.nodes.find(n=>n.id===e.to);if(!a||!b)return '';const x1=a.x+a.w/2,y1=a.y+a.h/2,x2=b.x+b.w/2,y2=b.y+b.h/2,mid=(x1+x2)/2;return `<path d="M${x1} ${y1} C${mid} ${y1},${mid} ${y2},${x2} ${y2}"/>`;}).join('');
  }
  function renderInspector() {
    if(!session)return;
    document.querySelectorAll('.cw-inspector-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.cw===sidebarTab));
    const n=doc.nodes.find(n=>n.id===selected);
    let html=sidebarTab==='assets'?`<h4>ملفات السيشن · ${doc.assets.length}</h4><p>اضغط على ملف لإضافته للبورد. الصور والفيديوهات حتى 50MB للملف.</p>${doc.assets.map(a=>`<button class="cw-layer" data-cw-asset="${h(a.id)}">${icon(a.kind)}<span>${h(a.name)}</span><small>${(a.size/1048576).toFixed(1)} MB</small></button>`).join('')||'<p>الملفات اللي ترفعها هتظهر هنا.</p>'}`:`<h4>على البورد · ${doc.nodes.length}</h4>${[...doc.nodes].reverse().map(x=>`<button class="cw-layer ${x.id===selected?'active':''}" data-cw-layer="${h(x.id)}">${icon(x.kind)}<span>${h(x.text?.trim().split('\n')[0]||x.title)}</span></button>`).join('')||'<p>ضيف ملاحظة أو ارفع أول ريفرنس.</p>'}`;
    if(n) html+=`<div class="cw-selection-controls">${['note','prompt'].includes(n.kind)?`<div class="cw-colors" aria-label="لون الملاحظة">${colors.map(c=>`<button class="cw-color" style="background:${c}" data-cw-color="${c}" aria-label="لون ${c}" aria-pressed="${n.color===c}"></button>`).join('')}</div>`:''}<button class="cw-button" data-cw="duplicate">${icon('copy')} تكرار</button><button class="cw-button" data-cw="front">${icon('up')} للأمام</button><button class="cw-button" data-cw="remove">${icon('trash')} إزالة</button>${doc.edges.some(e=>e.from===n.id||e.to===n.id)?'<button class="cw-button" data-cw="disconnect">فصل الروابط</button>':''}${n.assetId?`<button class="cw-button" data-cw-download="${h(n.assetId)}">${icon('download')} الملف الأصلي</button>`:''}</div>`;
    $('cwInspectorBody').innerHTML=html;
  }

  async function assetUrl(asset) {
    const cached=mediaUrls.get(asset.id);if(cached&&cached.expires>Date.now())return cached.url;
    if(pendingMedia.has(asset.id))return pendingMedia.get(asset.id);
    const request=(async()=>{const {data,error}=await sb.storage.from('serag-attachments').createSignedUrl(asset.path,3600);if(error)throw error;mediaUrls.set(asset.id,{url:data.signedUrl,expires:Date.now()+3300000});return data.signedUrl;})();
    pendingMedia.set(asset.id,request);try{return await request;}finally{pendingMedia.delete(asset.id);}
  }
  async function hydrateMedia(el,assetId) {
    const asset=doc.assets.find(a=>a.id===assetId);if(!asset)return;
    try {const url=await assetUrl(asset);if(!el.isConnected)return;el.src=url;el.addEventListener('error',()=>{el.parentElement.querySelector('.cw-media-failed').hidden=false;},{once:true});}
    catch {if(el.isConnected)el.parentElement.querySelector('.cw-media-failed').hidden=false;}
  }
  function announce(message) {
    $('cwUploadStatus').textContent=message;
    clearTimeout(announce.timer);if(!uploading)announce.timer=setTimeout(()=>{$('cwUploadStatus').textContent='';},4200);
  }
  async function uploadFiles(files,point) {
    if(!session||uploading||!files.length)return;
    if(files.length>20){announce('اختار لحد 20 ملف في المرة الواحدة.');return;}
    uploading=true;const owner=session.user_id,row=session,failures=[];let completed=0;
    const allowed=['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm','video/quicktime'];
    try {
      for(let i=0;i<files.length;i++){
        if(session!==row||user?.id!==owner)break;
        const file=files[i];
        if(!allowed.includes(file.type)||file.size>50*1048576||!file.size){failures.push(`${file.name}: ${file.size>50*1048576?'أكبر من 50MB':'نوع الملف غير مدعوم'}`);continue;}
        if(doc.nodes.length>=500){failures.push('وصلت للحد الأقصى للعناصر');break;}
        announce(`جاري رفع ${i+1} / ${files.length} · ${file.name}`);
        const id=uid(),path=`${owner}/creative-sessions/${row.id}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-').slice(-90)}`;
        const up=await sb.storage.from('serag-attachments').upload(path,file,{contentType:file.type,upsert:false});
        if(up.error){failures.push(`${file.name}: تعذّر الرفع`);continue;}
        if(session!==row||user?.id!==owner)break;
        const kind=file.type.startsWith('image/')?'image':'video',asset={id,path,name:file.name,size:file.size,mime:file.type,kind};
        doc.assets.push(asset);
        const origin=point||position();addNode(kind,{title:file.name,assetId:id,x:origin.x+(completed%3)*340,y:origin.y+Math.floor(completed/3)*310});
        completed++; await flushSave();
      }
    } catch(e) {failures.push('الاتصال اتقطع. الملفات المكتملة موجودة في السيشن.');}
    finally {uploading=false;if(session===row){await flushSave();announce(failures.length?`اترفع ${completed} ملف. ${failures.join(' · ')}`:`اترفع ${completed} ملف`);}}
  }
  async function openAsset(id) {
    const a=doc.assets.find(a=>a.id===id);if(!a)return;
    // Open synchronously to retain the browser's user gesture, then resolve the private URL.
    const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;
    try {const url=await assetUrl(a);if(tab)tab.location.replace(url);else announce('اسمح بفتح نافذة جديدة للملف.');} catch {tab?.close();announce('تعذّر فتح الملف. جرّب تاني.');}
  }
  async function archiveSession(id) {
    const s=sessions.find(s=>s.id===id);if(!s)return;
    const {data,error}=await sb.from('creative_sessions').update({archived:!s.archived,revision:s.revision+1,updated_at:new Date().toISOString()}).eq('id',id).eq('revision',s.revision).select('id').maybeSingle();
    if(error||!data)toast('تعذّر تحديث السيشن. حدّث القائمة وجرّب تاني.');
    await loadSessions();
  }
  function selectedAction(action) {
    const n=doc.nodes.find(n=>n.id===selected);if(!n)return;
    snapshot();
    if(action==='remove'){doc.nodes=doc.nodes.filter(x=>x.id!==n.id);doc.edges=doc.edges.filter(e=>e.from!==n.id&&e.to!==n.id);selected=null;}
    if(action==='duplicate'){if(doc.nodes.length>=500)return;const copy={...clone(n),id:uid(),x:n.x+36,y:n.y+36};doc.nodes.push(copy);selected=copy.id;}
    if(action==='front'){doc.nodes=doc.nodes.filter(x=>x.id!==n.id);doc.nodes.push(n);}
    if(action==='disconnect')doc.edges=doc.edges.filter(e=>e.from!==n.id&&e.to!==n.id);
    changed();renderBoard();
  }
  function arrangeNodes(){
    if(!doc.nodes.length)return;
    snapshot();
    const columns=Math.min(3,doc.nodes.length),width=Math.max(...doc.nodes.map(n=>n.w))+50;
    let y=40;
    for(let i=0;i<doc.nodes.length;i+=columns){
      const row=doc.nodes.slice(i,i+columns);
      row.forEach((n,j)=>{n.x=40+j*width;n.y=y;});
      y+=Math.max(...row.map(n=>n.h))+60;
    }
    changed();renderBoard();fit();announce('الكروت اترتبت. تقدر ترجع بـ Undo.');
  }
  function exportBrief(){
    const text=['# '+$('cwTitle').value,'',...doc.nodes.flatMap(n=>[
      '## '+(n.title||labels[n.kind]||'عنصر'),n.text||'',n.kind==='link'?safeUrl(n.url):'',
      n.assetId?'ملف: '+(doc.assets.find(a=>a.id===n.assetId)?.name||''): '', ''
    ])].filter(x=>x!==undefined).join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=($('cwTitle').value||'creative-brief').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,100)+'.txt';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);announce('البريف اتصدّر كنص. الصور والرسومات بتفضل في السيشن.');
  }
  function onClick(e) {
    const target=e.target.closest('button');if(!target)return;
    if(target.dataset.cwOpen)return openBoard(target.dataset.cwOpen);
    if(target.dataset.cwArchive)return archiveSession(target.dataset.cwArchive);
    if(target.dataset.cwLayer)return selectNode(target.dataset.cwLayer,true);
    if(target.dataset.cwAsset){const a=doc.assets.find(a=>a.id===target.dataset.cwAsset);if(a)addNode(a.kind,{assetId:a.id,title:a.name});return;}
    if(target.dataset.cwDownload)return openAsset(target.dataset.cwDownload);
    if(target.dataset.cwCopy){const n=doc.nodes.find(n=>n.id===target.dataset.cwCopy);navigator.clipboard.writeText(n?.text||'').then(()=>announce('البرومبت اتنسخ')).catch(()=>announce('تعذّر النسخ. حدد النص وانسخه يدويًا.'));return;}
    if(target.dataset.cwColor){const n=doc.nodes.find(n=>n.id===selected);if(n){snapshot();n.color=target.dataset.cwColor;changed();renderBoard();}return;}
    const action=target.dataset.cw;if(!action)return;
    if(action==='new')return showCreate();
    if(action==='cancel-create'){if(!createBusy)$('cwCreate').close();return;}
    if(action==='reload')return loadSessions();
    if(action==='archive-filter'){archived=!archived;target.setAttribute('aria-pressed',String(archived));renderSessions();return;}
    if(!session)return;
    if(action==='arrange')return arrangeNodes();
    if(action==='export-brief')return exportBrief();
    if(action==='close')return closeBoard();
    if(action==='upload')return $('cwFileInput').click();
    if(['cursor','hand','connect'].includes(action))return setTool(action);
    if(['note','prompt','link'].includes(action))return addNode(action);
    if(action==='undo'||action==='redo')return undo(action==='redo');
    if(action==='fit')return fit();
    if(action==='zoom-in'||action==='zoom-out')return zoomTo(doc.viewport.zoom*(action==='zoom-in'?1.2:1/1.2));
    if(action==='reset-zoom')return zoomTo(1);
    if(action==='sidebar')return $('cwInspector').classList.toggle('cw-inspector-open');
    if(action==='layers'||action==='assets'){sidebarTab=action;renderInspector();return;}
    if(action==='save-copy')return saveCopy();
    if(action==='retry-save')return flushSave();
    selectedAction(action);
  }

  function bindCanvas() {
    const canvas=$('cwCanvas');
    canvas.addEventListener('wheel',e=>{
      if(e.target.closest('textarea,input,video,.cw-tools,.cw-node-link,.cw-conflict'))return;
      e.preventDefault();
      if(e.ctrlKey||e.metaKey){const r=canvas.getBoundingClientRect();zoomTo(doc.viewport.zoom*Math.exp(-e.deltaY*.003),e.clientX-r.left,e.clientY-r.top);}
      else{doc.viewport.x-=e.shiftKey?e.deltaY:e.deltaX;doc.viewport.y-=e.shiftKey?0:e.deltaY;transform();changed();}
    },{passive:false});
    canvas.addEventListener('pointerdown',e=>{
      if(e.target.closest('.cw-tools,.cw-conflict,.cw-board-empty button'))return;
      if(e.button!==0&&e.button!==1)return;
      if(e.target.closest('button,a,input,textarea,video'))return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:doc.viewport.zoom,center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};drag=null;canvas.setPointerCapture(e.pointerId);return;}
      const el=e.target.closest('.cw-node'),n=el&&doc.nodes.find(n=>n.id===el.dataset.node);
      if(tool==='connect'&&n){
        e.preventDefault();
        if(!connectFrom){connectFrom=n.id;selectNode(n.id);announce('دلوقتي اختار العنصر التاني.');}
        else if(connectFrom!==n.id){snapshot();if(!doc.edges.some(x=>(x.from===connectFrom&&x.to===n.id)||(x.to===connectFrom&&x.from===n.id)))doc.edges.push({id:uid(),from:connectFrom,to:n.id});changed();renderEdges();setTool('cursor');announce('العنصرين اتوصلوا.');}
        return;
      }
      const pan=space||tool==='hand'||e.button===1||!el;
      if(n&&!pan)selectNode(n.id);
      if(pan){if(!space&&tool!=='hand')selectNode(null);drag={type:'pan',x:e.clientX,y:e.clientY,origin:{...doc.viewport}};}
      else if(n&&(e.target.closest('.cw-node-head')||e.target.closest('.cw-resize'))){snapshot();drag={type:e.target.closest('.cw-resize')?'resize':'move',id:n.id,x:e.clientX,y:e.clientY,origin:{...n}};}
      else return;
      e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove',e=>{
      if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],r=canvas.getBoundingClientRect(),center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};zoomTo(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance),center.x-r.left,center.y-r.top);doc.viewport.x+=center.x-pinch.center.x;doc.viewport.y+=center.y-pinch.center.y;pinch.center=center;transform();return;}
      if(!drag)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(drag.type==='pan'){doc.viewport.x=drag.origin.x+dx;doc.viewport.y=drag.origin.y+dy;transform();}
      else{const n=doc.nodes.find(n=>n.id===drag.id);if(!n)return;const el=$('cwNodes').querySelector(`[data-node="${n.id}"]`);
        if(drag.type==='move'){n.x=clamp(drag.origin.x+dx/doc.viewport.zoom,-20000,20000);n.y=clamp(drag.origin.y+dy/doc.viewport.zoom,-20000,20000);el.style.left=`${n.x}px`;el.style.top=`${n.y}px`;}
        else{n.w=clamp(drag.origin.w+dx/doc.viewport.zoom,180,1600);n.h=clamp(drag.origin.h+dy/doc.viewport.zoom,130,1600);el.style.width=`${n.w}px`;el.style.height=`${n.h}px`;}
        renderEdges();
      }
    });
    const finish=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(drag){drag=null;changed();renderInspector();}if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
    canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
    canvas.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();canvas.classList.add('cw-dragover');}});
    canvas.addEventListener('dragleave',e=>{if(!canvas.contains(e.relatedTarget))canvas.classList.remove('cw-dragover');});
    canvas.addEventListener('drop',e=>{e.preventDefault();canvas.classList.remove('cw-dragover');const r=canvas.getBoundingClientRect(),v=doc.viewport;uploadFiles([...e.dataTransfer.files],{x:(e.clientX-r.left-v.x)/v.zoom,y:(e.clientY-r.top-v.y)/v.zoom});});
    $('cwBoard').addEventListener('paste',e=>{if(e.target.closest('textarea,input'))return;const files=[...e.clipboardData.files];if(files.length){e.preventDefault();uploadFiles(files);}});
    $('cwBoard').addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.stopPropagation();}
      const editing=e.target.closest('input,textarea,select,[contenteditable=true]');
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();flushSave();return;}
      if(editing)return;
      if(e.code==='Space'){e.preventDefault();space=true;canvas.style.cursor='grab';}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);return;}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();selectedAction('duplicate');return;}
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();selectedAction('remove');}
      const n=doc.nodes.find(n=>n.id===selected);
      if(n&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();snapshot();const d=e.shiftKey?20:5;n.x+=e.key==='ArrowRight'?d:e.key==='ArrowLeft'?-d:0;n.y+=e.key==='ArrowDown'?d:e.key==='ArrowUp'?-d:0;changed();renderBoard();}
      const shortcuts={v:'cursor',h:'hand',c:'connect'};if(shortcuts[e.key.toLowerCase()])setTool(shortcuts[e.key.toLowerCase()]);
      const additions={n:'note',p:'prompt',l:'link'};if(additions[e.key.toLowerCase()]){e.preventDefault();addNode(additions[e.key.toLowerCase()]);}
    });
    window.addEventListener('keyup',e=>{if(e.code==='Space'){space=false;canvas.style.cursor='';}});
    window.addEventListener('blur',()=>{space=false;canvas.style.cursor='';pointers.clear();pinch=null;if(drag){drag=null;changed();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
