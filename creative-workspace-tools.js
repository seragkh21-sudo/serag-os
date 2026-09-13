/* Serag Creative Workspace Pro Tools: text, pen, highlighter and eraser. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const uid = () => crypto.randomUUID();
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const clone = v => JSON.parse(JSON.stringify(v));
  const paths = {
    text:'M5 5V3h14v2 M12 3v18 M8 21h8',
    pen:'M4 20l4.2-1 10.9-10.9a2.8 2.8 0 0 0-4-4L4.2 14 3 21z M13.8 5.2l5 5',
    marker:'M4 17l7-7 6 6-7 7H4z M13 8l3-3 4 4-3 3 M4 21h16',
    eraser:'m7 21-4-4 11-11a3 3 0 0 1 4 0l2 2a3 3 0 0 1 0 4l-9 9z M11 21h10',
    undo:'M3 10h10a6 6 0 0 1 0 12 M7 5l-5 5 5 5',
    redo:'M21 10H11a6 6 0 0 0 0 12 m7-17 5 5-5 5',
    trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15',
    check:'m4 12 5 5L20 6'
  };
  const icon = name => `<svg class="cw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const button = (mode,label,ic) => `<button type="button" class="cw-icon-button cw-pro-tool" data-cw-pro="${mode}" aria-label="${label}" title="${label}" aria-pressed="false">${icon(ic)}</button>`;

  let mode = null;
  let sessionId = null;
  let revision = 0;
  let data = {strokes:[],texts:[]};
  let drawing = null;
  let erasing = false;
  let selectedText = null;
  let saveTimer = null;
  let saving = false;
  let queued = false;
  let mounted = false;
  let pendingSessionId = null;
  let history = [];
  let future = [];
  let penColor = '#5d43c8';
  let penSize = 4;
  let textSize = 28;
  let loadedSession = false;

  const currentUser = () => {
    try { return typeof user !== 'undefined' ? user : null; } catch { return null; }
  };
  const client = () => {
    try { return typeof sb !== 'undefined' ? sb : null; } catch { return null; }
  };

  function announce(message) {
    const host = $('cwUploadStatus');
    if(!host) return;
    host.textContent = message;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => { if(host.textContent === message) host.textContent = ''; }, 2600);
  }

  function snapshot() {
    history.push(JSON.stringify(data));
    if(history.length > 50) history.shift();
    future = [];
    syncUndo();
  }
  function undo(redo=false) {
    const source = redo ? future : history;
    const target = redo ? history : future;
    if(!source.length) return;
    target.push(JSON.stringify(data));
    data = JSON.parse(source.pop());
    selectedText = null;
    render();
    scheduleSave();
    syncUndo();
  }
  function syncUndo() {
    const u = document.querySelector('[data-cw-pro-action="undo"]');
    const r = document.querySelector('[data-cw-pro-action="redo"]');
    if(u) u.disabled = !history.length;
    if(r) r.disabled = !future.length;
  }

  function setMode(next) {
    if(next && $('cwBoard')?.open && !loadedSession){ announce('جاري تحميل أدوات السيشن…'); return; }
    mode = next === mode ? null : next;
    const canvas = $('cwCanvas');
    if(canvas) canvas.dataset.proTool = mode || '';
    document.querySelectorAll('.cw-pro-tool').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cwPro === mode)));
    if(mode) document.querySelectorAll('#cwTools [data-cw][aria-pressed]').forEach(b => b.setAttribute('aria-pressed','false'));
    renderOptions();
    if(mode==='text') announce('اضغط في أي مكان على البورد علشان تضيف Text.');
    if(mode==='pen') announce('ارسم مباشرة على البورد.');
    if(mode==='highlighter') announce('Highlighter جاهز.');
    if(mode==='eraser') announce('اسحب على الرسومات لمسحها، واضغط على النص لمسحه.');
  }

  function installToolbar() {
    const tools = $('cwTools');
    if(!tools || tools.querySelector('[data-cw-pro="text"]')) return;
    const separator = document.createElement('hr');
    separator.className = 'cw-pro-separator';
    tools.insertBefore(separator, tools.querySelector('[data-cw="undo"]')?.previousElementSibling || null);
    separator.insertAdjacentHTML('afterend', button('text','كتابة Text · T','text')+button('pen','Pen · B','pen')+button('highlighter','Highlighter · M','marker')+button('eraser','Eraser · E','eraser'));
    const canvas = $('cwCanvas');
    if(canvas && !$('cwProOptions')) canvas.insertAdjacentHTML('beforeend', `<div id="cwProOptions" class="cw-pro-options" hidden></div>`);
    renderOptions();
  }

  function renderOptions() {
    const box = $('cwProOptions');
    if(!box) return;
    if(!mode) { box.hidden = true; return; }
    box.hidden = false;
    const colors = ['#22212b','#5d43c8','#2563eb','#0f9f6e','#e04f5f','#f59e0b','#ffffff'];
    const colorRow = colors.map(c => `<button type="button" class="cw-pro-color ${penColor===c?'active':''}" data-pro-color="${c}" style="--swatch:${c}" aria-label="لون ${c}"></button>`).join('');
    if(mode==='pen' || mode==='highlighter') {
      box.innerHTML = `<div class="cw-pro-options-head"><strong>${mode==='pen'?'Pen':'Highlighter'}</strong><span id="cwProSaveState">محفوظ</span></div><div class="cw-pro-colors">${colorRow}</div><label class="cw-pro-slider">الحجم <input data-pro-size type="range" min="2" max="18" step="1" value="${penSize}"><span>${penSize}px</span></label><div class="cw-pro-actions"><button type="button" data-cw-pro-action="undo">${icon('undo')} تراجع</button><button type="button" data-cw-pro-action="redo">${icon('redo')} إعادة</button><button type="button" data-cw-pro-action="clear">${icon('trash')} مسح الرسم</button></div>`;
    } else if(mode==='text') {
      box.innerHTML = `<div class="cw-pro-options-head"><strong>Text</strong><span id="cwProSaveState">محفوظ</span></div><div class="cw-pro-colors">${colorRow}</div><label class="cw-pro-slider">الحجم <input data-pro-text-size type="range" min="14" max="72" step="1" value="${textSize}"><span>${textSize}px</span></label><div class="cw-pro-actions"><button type="button" data-cw-pro-action="undo">${icon('undo')} تراجع</button><button type="button" data-cw-pro-action="redo">${icon('redo')} إعادة</button></div>`;
    } else {
      box.innerHTML = `<div class="cw-pro-options-head"><strong>Eraser</strong><span id="cwProSaveState">محفوظ</span></div><p>اسحب فوق الخطوط لمسحها. اضغط على أي Text لمسحه.</p><div class="cw-pro-actions"><button type="button" data-cw-pro-action="undo">${icon('undo')} تراجع</button><button type="button" data-cw-pro-action="redo">${icon('redo')} إعادة</button><button type="button" data-cw-pro-action="clear">${icon('trash')} مسح الرسم</button></div>`;
    }
    syncUndo();
  }

  function ensureLayer() {
    const world = $('cwWorld');
    if(!world) return;
    if(!$('cwInkLayer')) world.insertAdjacentHTML('beforeend', `<svg id="cwInkLayer" class="cw-ink-layer" aria-label="الرسم الحر"><g id="cwInkContent"></g></svg><div id="cwTextLayer" class="cw-text-layer"></div>`);
  }

  function smoothPath(points) {
    if(!points?.length) return '';
    if(points.length===1) return `M${points[0][0]} ${points[0][1]} l.01 .01`;
    let d = `M${points[0][0]} ${points[0][1]}`;
    for(let i=1;i<points.length-1;i++) { const p=points[i], n=points[i+1]; d += ` Q${p[0]} ${p[1]} ${(p[0]+n[0])/2} ${(p[1]+n[1])/2}`; }
    const last=points[points.length-1];
    d += ` L${last[0]} ${last[1]}`;
    return d;
  }

  function render() {
    ensureLayer();
    const ink = $('cwInkContent'), texts = $('cwTextLayer');
    if(!ink || !texts) return;
    ink.innerHTML = data.strokes.map(s => `<path class="cw-ink-stroke" data-stroke-id="${s.id}" d="${smoothPath(s.points)}" stroke="${s.color}" stroke-width="${s.size}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${s.opacity ?? 1}"/>`).join('');
    texts.innerHTML = data.texts.map(t => `<div class="cw-free-text ${selectedText===t.id?'selected':''}" data-text-id="${t.id}" style="left:${t.x}px;top:${t.y}px;color:${t.color};font-size:${t.size}px;font-weight:${t.weight||600};max-width:${t.w||520}px" dir="auto" tabindex="0">${escapeHtml(t.text||'')}</div>`).join('');
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function clientToWorld(e) {
    const world = $('cwWorld');
    if(!world) return {x:0,y:0};
    const matrix = new DOMMatrix(getComputedStyle(world).transform === 'none' ? undefined : getComputedStyle(world).transform);
    const inv = matrix.inverse(), canvas = $('cwCanvas').getBoundingClientRect();
    const p = new DOMPoint(e.clientX-canvas.left,e.clientY-canvas.top).matrixTransform(inv);
    return {x:p.x,y:p.y};
  }

  function distanceToSegment(px,py,x1,y1,x2,y2) {
    const vx=x2-x1, vy=y2-y1, wx=px-x1, wy=py-y1, c1=vx*wx+vy*wy;
    if(c1<=0) return Math.hypot(px-x1,py-y1);
    const c2=vx*vx+vy*vy;
    if(c2<=c1) return Math.hypot(px-x2,py-y2);
    const b=c1/c2, bx=x1+b*vx, by=y1+b*vy;
    return Math.hypot(px-bx,py-by);
  }
  function eraseAt(point) {
    const threshold = 13;
    let removed=false;
    data.strokes = data.strokes.filter(s => {
      const pts=s.points||[];
      for(let i=1;i<pts.length;i++) if(distanceToSegment(point.x,point.y,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]) <= threshold + (s.size||2)/2) { removed=true; return false; }
      return true;
    });
    if(removed) { render(); scheduleSave(); }
  }

  function beginText(point) {
    snapshot();
    const item={id:uid(),x:point.x,y:point.y,text:'اكتب هنا',color:penColor,size:textSize,weight:600,w:520};
    data.texts.push(item);selectedText=item.id;render();scheduleSave();
    requestAnimationFrame(()=>editText(item.id,true));
  }
  function editText(id,selectAll=false) {
    const el=document.querySelector(`.cw-free-text[data-text-id="${id}"]`); if(!el)return;
    el.contentEditable='true';el.focus();
    if(selectAll){const range=document.createRange();range.selectNodeContents(el);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);}
  }
  function commitText(el) {
    if(!el?.dataset.textId) return;
    const item=data.texts.find(t=>t.id===el.dataset.textId);if(!item)return;
    item.text=(el.textContent||'').trim()||'Text';el.contentEditable='false';scheduleSave();
  }

  function bindCanvas() {
    const canvas=$('cwCanvas'); if(!canvas || canvas.dataset.proBound) return;
    canvas.dataset.proBound='1';
    canvas.addEventListener('pointerdown', e => {
      const textEl=e.target.closest?.('.cw-free-text');
      if(textEl) {
        if(mode==='eraser') { e.preventDefault();e.stopImmediatePropagation();snapshot();data.texts=data.texts.filter(t=>t.id!==textEl.dataset.textId);selectedText=null;render();scheduleSave();return; }
        if(mode==='text') { e.preventDefault();e.stopImmediatePropagation();selectedText=textEl.dataset.textId;render();editText(selectedText);return; }
        if(!mode && e.button===0) {
          e.preventDefault();e.stopImmediatePropagation();
          const id=textEl.dataset.textId,item=data.texts.find(t=>t.id===id); if(!item)return;
          snapshot();selectedText=id;render();
          const start=clientToWorld(e), ox=item.x, oy=item.y;
          const move=ev=>{const p=clientToWorld(ev);item.x=ox+(p.x-start.x);item.y=oy+(p.y-start.y);const node=document.querySelector(`.cw-free-text[data-text-id="${id}"]`);if(node){node.style.left=item.x+'px';node.style.top=item.y+'px';}};
          const up=()=>{window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',up,true);scheduleSave();};
          window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',up,true);return;
        }
      }
      if(!mode || e.button!==0) return;
      if(e.target.closest?.('.cw-tools,.cw-pro-options,.cw-node,.cw-conflict')) return;
      e.preventDefault();e.stopImmediatePropagation();canvas.setPointerCapture?.(e.pointerId);
      const p=clientToWorld(e);
      if(mode==='text'){beginText(p);return;}
      if(mode==='pen'||mode==='highlighter'){
        snapshot();drawing={id:uid(),points:[[p.x,p.y]],color:penColor,size:mode==='highlighter'?Math.max(10,penSize*2.3):penSize,opacity:mode==='highlighter'?.28:1};data.strokes.push(drawing);render();return;
      }
      if(mode==='eraser'){snapshot();erasing=true;eraseAt(p);}
    },true);
    canvas.addEventListener('pointermove', e => {
      if(!drawing&&!erasing) return;
      e.preventDefault();e.stopImmediatePropagation();const p=clientToWorld(e);
      if(drawing){const last=drawing.points[drawing.points.length-1];if(Math.hypot(p.x-last[0],p.y-last[1])>1.5){drawing.points.push([p.x,p.y]);const path=document.querySelector(`[data-stroke-id="${drawing.id}"]`);if(path)path.setAttribute('d',smoothPath(drawing.points));}}
      if(erasing)eraseAt(p);
    },true);
    const finish=e=>{if(!drawing&&!erasing)return;e.preventDefault();e.stopImmediatePropagation();drawing=null;erasing=false;scheduleSave();};
    canvas.addEventListener('pointerup',finish,true);canvas.addEventListener('pointercancel',finish,true);
    canvas.addEventListener('dblclick',e=>{const text=e.target.closest?.('.cw-free-text');if(text&&!mode){e.preventDefault();e.stopImmediatePropagation();selectedText=text.dataset.textId;render();editText(selectedText,true);}},true);
  }

  async function resolveSession() {
    if(pendingSessionId) { const id=pendingSessionId;pendingSessionId=null;return id; }
    const c=client(),u=currentUser(),title=$('cwTitle')?.value?.trim();
    if(!c||!u||!title) return null;
    const {data:rows,error}=await c.from('creative_sessions').select('id').eq('user_id',u.id).eq('title',title).order('updated_at',{ascending:false}).limit(1);
    if(error) return null;
    return rows?.[0]?.id||null;
  }

  async function loadForSession(id) {
    sessionId=id;loadedSession=false;revision=0;data={strokes:[],texts:[]};history=[];future=[];selectedText=null;render();
    const c=client(),u=currentUser();if(!c||!u||!id)return;
    const {data:row,error}=await c.from('creative_workspace_annotations').select('data,revision').eq('session_id',id).eq('user_id',u.id).maybeSingle();
    if(error){announce('أدوات الرسم شغالة، لكن مزامنة الرسم محتاجة Refresh.');return;}
    if(sessionId!==id)return;
    if(row){data={strokes:Array.isArray(row.data?.strokes)?row.data.strokes:[],texts:Array.isArray(row.data?.texts)?row.data.texts:[]};revision=Number(row.revision)||0;}
    loadedSession=true;render();syncUndo();
  }

  function saveState(text,state='') { const el=$('cwProSaveState');if(!el)return;el.textContent=text;el.dataset.state=state; }
  function scheduleSave(){saveState('غير محفوظ','pending');clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,500);}
  async function saveNow(){
    clearTimeout(saveTimer);if(saving){queued=true;return;}const c=client(),u=currentUser(),id=sessionId;if(!c||!u||!id)return;
    saving=true;queued=false;saveState('جاري الحفظ…','saving');const payload=clone(data);const expected=revision;
    try{
      let result;
      if(expected===0) result=await c.from('creative_workspace_annotations').upsert({session_id:id,user_id:u.id,data:payload,revision:1,updated_at:new Date().toISOString()},{onConflict:'session_id'}).select('revision').single();
      else {
        result=await c.from('creative_workspace_annotations').update({data:payload,revision:expected+1,updated_at:new Date().toISOString()}).eq('session_id',id).eq('user_id',u.id).eq('revision',expected).select('revision').maybeSingle();
        if(!result.error&&!result.data){await loadForSession(id);announce('الرسم اتعدل من جهاز تاني؛ حمّلت النسخة الأحدث.');return;}
      }
      if(result.error)throw result.error;
      if(sessionId===id){revision=Number(result.data?.revision)||expected+1;saveState('محفوظ','saved');}
    }catch{if(sessionId===id){saveState('تعذّر الحفظ','error');announce('تعذّر حفظ الرسم. جرّب تاني.');}}
    finally{saving=false;if(queued&&sessionId===id)saveNow();}
  }

  function resetSession(){clearTimeout(saveTimer);sessionId=null;loadedSession=false;revision=0;data={strokes:[],texts:[]};history=[];future=[];selectedText=null;mode=null;renderOptions();render();}

  function bindUI() {
    document.addEventListener('click', e => {
      const open=e.target.closest?.('[data-cw-open]');if(open) pendingSessionId=open.dataset.cwOpen;
      const pro=e.target.closest?.('[data-cw-pro]');if(pro){e.preventDefault();e.stopPropagation();setMode(pro.dataset.cwPro);return;}
      const existing=e.target.closest?.('#cwTools [data-cw]');if(existing&&['cursor','hand','connect'].includes(existing.dataset.cw)){mode=null;renderOptions();document.querySelectorAll('.cw-pro-tool').forEach(b=>b.setAttribute('aria-pressed','false'));}
      const color=e.target.closest?.('[data-pro-color]');if(color){penColor=color.dataset.proColor;renderOptions();if(selectedText){const t=data.texts.find(t=>t.id===selectedText);if(t){snapshot();t.color=penColor;render();scheduleSave();}}return;}
      const action=e.target.closest?.('[data-cw-pro-action]')?.dataset.cwProAction;if(action){e.preventDefault();if(action==='undo')undo(false);if(action==='redo')undo(true);if(action==='clear'&&data.strokes.length){snapshot();data.strokes=[];render();scheduleSave();}return;}
    },true);
    document.addEventListener('input',e=>{
      if(e.target.matches?.('[data-pro-size]')){penSize=Number(e.target.value);e.target.nextElementSibling.textContent=penSize+'px';}
      if(e.target.matches?.('[data-pro-text-size]')){textSize=Number(e.target.value);e.target.nextElementSibling.textContent=textSize+'px';if(selectedText){const t=data.texts.find(t=>t.id===selectedText);if(t){t.size=textSize;render();scheduleSave();}}}
      const text=e.target.closest?.('.cw-free-text[contenteditable="true"]');if(text){const t=data.texts.find(t=>t.id===text.dataset.textId);if(t){t.text=text.textContent||'';scheduleSave();}}
    },true);
    document.addEventListener('focusout',e=>{const text=e.target.closest?.('.cw-free-text[contenteditable="true"]');if(text)commitText(text);},true);
    document.addEventListener('keydown',e=>{
      const board=$('cwBoard');if(!board?.open)return;
      const editing=e.target.closest?.('input,textarea,select,[contenteditable="true"]');
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!editing&&(mode||selectedText)){e.preventDefault();e.stopImmediatePropagation();undo(e.shiftKey);return;}
      if(editing)return;
      const k=e.key.toLowerCase();
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&['t','b','m','e'].includes(k)){e.preventDefault();e.stopImmediatePropagation();setMode({t:'text',b:'pen',m:'highlighter',e:'eraser'}[k]);return;}
      if((e.key==='Delete'||e.key==='Backspace')&&selectedText){e.preventDefault();e.stopImmediatePropagation();snapshot();data.texts=data.texts.filter(t=>t.id!==selectedText);selectedText=null;render();scheduleSave();}
    },true);
  }

  function observeDialog() {
    const board=$('cwBoard');if(!board)return;
    new MutationObserver(async()=>{
      if(board.open){installToolbar();ensureLayer();bindCanvas();const id=await resolveSession();if(id)loadForSession(id);}
      else resetSession();
    }).observe(board,{attributes:true,attributeFilter:['open']});
  }

  function mount() { if(mounted)return;mounted=true;installToolbar();ensureLayer();bindCanvas();bindUI();observeDialog(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
