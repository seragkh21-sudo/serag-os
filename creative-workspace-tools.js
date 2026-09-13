/* Serag Creative Workspace Pro Tools v2: selectable text, pen, highlighter and eraser objects. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const uid = () => crypto.randomUUID();
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const clone = v => JSON.parse(JSON.stringify(v));
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    text:'M5 5V3h14v2 M12 3v18 M8 21h8',
    pen:'M4 20l4.2-1 10.9-10.9a2.8 2.8 0 0 0-4-4L4.2 14 3 21z M13.8 5.2l5 5',
    marker:'M4 17l7-7 6 6-7 7H4z M13 8l3-3 4 4-3 3 M4 21h16',
    eraser:'m7 21-4-4 11-11a3 3 0 0 1 4 0l2 2a3 3 0 0 1 0 4l-9 9z M11 21h10',
    undo:'M3 10h10a6 6 0 0 1 0 12 M7 5l-5 5 5 5',
    redo:'M21 10H11a6 6 0 0 0 0 12 m7-17 5 5-5 5',
    trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15',
    copy:'M9 9h12v12H9z M15 9V3H3v12h6'
  };
  const icon = name => `<svg class="cw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const toolButton = (mode,label,ic) => `<button type="button" class="cw-icon-button cw-pro-tool" data-cw-pro="${mode}" aria-label="${label}" title="${label}" aria-pressed="false">${icon(ic)}</button>`;

  let mode = null;
  let sessionId = null;
  let revision = 0;
  let data = {strokes:[],texts:[]};
  let drawing = null;
  let erasing = false;
  let selected = null;
  let interaction = null;
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

  const currentUser = () => { try { return typeof user !== 'undefined' ? user : null; } catch { return null; } };
  const client = () => { try { return typeof sb !== 'undefined' ? sb : null; } catch { return null; } };
  const selectedObject = () => selected?.type==='stroke' ? data.strokes.find(x=>x.id===selected.id) : selected?.type==='text' ? data.texts.find(x=>x.id===selected.id) : null;

  function announce(message) {
    const host = $('cwUploadStatus'); if(!host) return;
    host.textContent = message;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => { if(host.textContent===message) host.textContent=''; }, 2800);
  }

  function snapshot() {
    history.push(JSON.stringify(data));
    if(history.length>60) history.shift();
    future=[]; syncUndo();
  }
  function undo(redo=false) {
    const source=redo?future:history,target=redo?history:future;
    if(!source.length)return;
    target.push(JSON.stringify(data));
    data=JSON.parse(source.pop());
    selected=null; render(); scheduleSave(); syncUndo(); renderOptions();
  }
  function syncUndo() {
    const u=document.querySelector('[data-cw-pro-action="undo"]'),r=document.querySelector('[data-cw-pro-action="redo"]');
    if(u)u.disabled=!history.length;if(r)r.disabled=!future.length;
  }

  function clearProPressed(){document.querySelectorAll('.cw-pro-tool').forEach(b=>b.setAttribute('aria-pressed','false'));}
  function setMode(next) {
    if(next && $('cwBoard')?.open && !loadedSession){announce('جاري تحميل أدوات السيشن…');return;}
    mode=next===mode?null:next;
    if(mode) selected=null;
    const canvas=$('cwCanvas');if(canvas)canvas.dataset.proTool=mode||'';
    document.querySelectorAll('.cw-pro-tool').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cwPro===mode)));
    if(mode)document.querySelectorAll('#cwTools [data-cw][aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'));
    render();renderOptions();
    if(mode==='text')announce('اضغط في أي مكان لإضافة Text. دوبل كليك للتعديل بعدين.');
    if(mode==='pen')announce('Pen جاهز — ارسم فوق الصور أو أي جزء من البورد.');
    if(mode==='highlighter')announce('Highlighter جاهز.');
    if(mode==='eraser')announce('اسحب فوق الرسومات لمسحها، أو اضغط على Text لمسحه.');
  }

  function selectObject(type,id) {
    selected={type,id};mode=null;clearProPressed();
    const canvas=$('cwCanvas');if(canvas)canvas.dataset.proTool='';
    render();renderOptions();
  }
  function clearSelection(){if(!selected)return;selected=null;renderSelection();renderOptions();}

  function installToolbar() {
    const tools=$('cwTools');if(!tools||tools.querySelector('[data-cw-pro="text"]'))return;
    const sep=document.createElement('hr');sep.className='cw-pro-separator';
    const anchor=tools.querySelector('[data-cw="undo"]')?.previousElementSibling||null;
    tools.insertBefore(sep,anchor);
    sep.insertAdjacentHTML('afterend',toolButton('text','كتابة Text · T','text')+toolButton('pen','Pen · B','pen')+toolButton('highlighter','Highlighter · M','marker')+toolButton('eraser','Eraser · E','eraser'));
    const canvas=$('cwCanvas');if(canvas&&!$('cwProOptions'))canvas.insertAdjacentHTML('beforeend','<div id="cwProOptions" class="cw-pro-options" hidden></div>');
    renderOptions();
  }

  function colorRow(active) {
    const colors=['#22212b','#5d43c8','#2563eb','#0f9f6e','#e04f5f','#f59e0b','#ffffff'];
    return colors.map(c=>`<button type="button" class="cw-pro-color ${active===c?'active':''}" data-pro-color="${c}" style="--swatch:${c}" aria-label="لون ${c}"></button>`).join('');
  }
  function actionRow(extra='') {
    return `<div class="cw-pro-actions"><button type="button" data-cw-pro-action="undo">${icon('undo')} تراجع</button><button type="button" data-cw-pro-action="redo">${icon('redo')} إعادة</button>${extra}</div>`;
  }
  function renderOptions() {
    const box=$('cwProOptions');if(!box)return;
    const obj=selectedObject();
    if(!mode&&!obj){box.hidden=true;return;}
    box.hidden=false;
    if(obj&&!mode){
      const isText=selected.type==='text';
      const color=obj.color||'#22212b';
      box.innerHTML=`<div class="cw-pro-options-head"><strong>${isText?'Text محدد':'رسمة محددة'}</strong><span id="cwProSaveState">محفوظ</span></div>
      <div class="cw-pro-colors">${colorRow(color)}</div>
      <label class="cw-pro-slider">${isText?'حجم الخط':'سمك الخط'} <input ${isText?'data-pro-selected-text-size':'data-pro-selected-stroke-size'} type="range" min="${isText?12:1}" max="${isText?120:40}" step="1" value="${Math.round(isText?(obj.size||28):(obj.size||4))}"><span>${Math.round(isText?(obj.size||28):(obj.size||4))}px</span></label>
      ${actionRow(`<button type="button" data-cw-pro-action="duplicate">${icon('copy')} تكرار</button><button type="button" data-cw-pro-action="delete">${icon('trash')} حذف</button>`)}
      <p class="cw-pro-hint">اسحب العنصر لتحريكه، واسحب أي زاوية من الإطار لتكبيره أو تصغيره.</p>`;
      syncUndo();return;
    }
    if(mode==='pen'||mode==='highlighter'){
      box.innerHTML=`<div class="cw-pro-options-head"><strong>${mode==='pen'?'Pen':'Highlighter'}</strong><span id="cwProSaveState">محفوظ</span></div><div class="cw-pro-colors">${colorRow(penColor)}</div><label class="cw-pro-slider">الحجم <input data-pro-size type="range" min="2" max="18" step="1" value="${penSize}"><span>${penSize}px</span></label>${actionRow('<button type="button" data-cw-pro-action="clear">'+icon('trash')+' مسح الرسم</button>')}`;
    } else if(mode==='text') {
      box.innerHTML=`<div class="cw-pro-options-head"><strong>Text</strong><span id="cwProSaveState">محفوظ</span></div><div class="cw-pro-colors">${colorRow(penColor)}</div><label class="cw-pro-slider">الحجم <input data-pro-text-size type="range" min="14" max="72" step="1" value="${textSize}"><span>${textSize}px</span></label>${actionRow()}`;
    } else {
      box.innerHTML=`<div class="cw-pro-options-head"><strong>Eraser</strong><span id="cwProSaveState">محفوظ</span></div><p>اسحب فوق الخطوط لمسحها. اضغط على أي Text لمسحه.</p>${actionRow('<button type="button" data-cw-pro-action="clear">'+icon('trash')+' مسح الرسم</button>')}`;
    }
    syncUndo();
  }

  function ensureLayer() {
    const world=$('cwWorld');if(!world)return;
    if(!$('cwInkLayer'))world.insertAdjacentHTML('beforeend',`<svg id="cwInkLayer" class="cw-ink-layer" aria-label="الرسم الحر"><g id="cwInkContent"></g></svg><div id="cwTextLayer" class="cw-text-layer"></div><div id="cwProSelection" class="cw-pro-selection" hidden><span class="cw-pro-selection-label"></span><i data-pro-handle="nw"></i><i data-pro-handle="ne"></i><i data-pro-handle="sw"></i><i data-pro-handle="se"></i></div>`);
  }
  function smoothPath(points) {
    if(!points?.length)return'';
    if(points.length===1)return`M${points[0][0]} ${points[0][1]} l.01 .01`;
    let d=`M${points[0][0]} ${points[0][1]}`;
    for(let i=1;i<points.length-1;i++){const p=points[i],n=points[i+1];d+=` Q${p[0]} ${p[1]} ${(p[0]+n[0])/2} ${(p[1]+n[1])/2}`;}
    const last=points[points.length-1];return d+` L${last[0]} ${last[1]}`;
  }
  function normalizeData(raw) {
    return {
      strokes:(Array.isArray(raw?.strokes)?raw.strokes:[]).map(s=>({id:s.id||uid(),points:Array.isArray(s.points)?s.points:[],color:s.color||'#5d43c8',size:clamp(Number(s.size)||4,1,60),opacity:clamp(Number(s.opacity??1),.05,1)})),
      texts:(Array.isArray(raw?.texts)?raw.texts:[]).map(t=>({id:t.id||uid(),x:Number(t.x)||0,y:Number(t.y)||0,text:String(t.text||'Text'),color:t.color||'#22212b',size:clamp(Number(t.size)||28,10,160),weight:Number(t.weight)||600,w:clamp(Number(t.w)||280,70,1800)}))
    };
  }

  function render() {
    ensureLayer();
    const ink=$('cwInkContent'),texts=$('cwTextLayer');if(!ink||!texts)return;
    ink.innerHTML=data.strokes.map(s=>`<path class="cw-ink-stroke ${selected?.type==='stroke'&&selected.id===s.id?'selected':''}" data-stroke-id="${s.id}" d="${smoothPath(s.points)}" stroke="${s.color}" stroke-width="${s.size}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${s.opacity??1}"/>`).join('');
    texts.innerHTML=data.texts.map(t=>`<div class="cw-free-text ${selected?.type==='text'&&selected.id===t.id?'selected':''}" data-text-id="${t.id}" style="left:${t.x}px;top:${t.y}px;color:${t.color};font-size:${t.size}px;font-weight:${t.weight||600};width:${t.w||280}px" dir="auto" tabindex="0">${esc(t.text||'')}</div>`).join('');
    renderSelection();
  }

  function boundsForSelected() {
    const obj=selectedObject();if(!obj)return null;
    if(selected.type==='stroke'){
      const pts=obj.points||[];if(!pts.length)return null;
      const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),pad=Math.max(8,(obj.size||4)/2+4);
      const l=Math.min(...xs)-pad,t=Math.min(...ys)-pad,r=Math.max(...xs)+pad,b=Math.max(...ys)+pad;
      return{x:l,y:t,w:Math.max(18,r-l),h:Math.max(18,b-t)};
    }
    const el=document.querySelector(`.cw-free-text[data-text-id="${obj.id}"]`);
    return{x:obj.x,y:obj.y,w:el?.offsetWidth||obj.w||280,h:el?.offsetHeight||Math.max(42,(obj.size||28)*1.5)};
  }
  function renderSelection() {
    ensureLayer();const box=$('cwProSelection');if(!box)return;
    const b=boundsForSelected();
    if(!b||mode){box.hidden=true;return;}
    box.hidden=false;box.style.left=b.x+'px';box.style.top=b.y+'px';box.style.width=b.w+'px';box.style.height=b.h+'px';
    const label=box.querySelector('.cw-pro-selection-label');if(label)label.textContent=selected.type==='text'?'Text':'Drawing';
  }

  function clientToWorld(e) {
    const world=$('cwWorld');if(!world)return{x:0,y:0};
    const tr=getComputedStyle(world).transform;
    const matrix=new DOMMatrix(tr==='none'?undefined:tr),inv=matrix.inverse(),r=$('cwCanvas').getBoundingClientRect();
    const p=new DOMPoint(e.clientX-r.left,e.clientY-r.top).matrixTransform(inv);return{x:p.x,y:p.y};
  }
  function distanceToSegment(px,py,x1,y1,x2,y2){const vx=x2-x1,vy=y2-y1,wx=px-x1,wy=py-y1,c1=vx*wx+vy*wy;if(c1<=0)return Math.hypot(px-x1,py-y1);const c2=vx*vx+vy*vy;if(c2<=c1)return Math.hypot(px-x2,py-y2);const b=c1/c2,bx=x1+b*vx,by=y1+b*vy;return Math.hypot(px-bx,py-by);}
  function eraseAt(point) {
    const threshold=14;let removed=false;
    data.strokes=data.strokes.filter(s=>{const pts=s.points||[];if(pts.length===1&&Math.hypot(point.x-pts[0][0],point.y-pts[0][1])<=threshold+(s.size||2)/2){removed=true;return false;}for(let i=1;i<pts.length;i++)if(distanceToSegment(point.x,point.y,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1])<=threshold+(s.size||2)/2){removed=true;return false;}return true;});
    if(removed){selected=null;render();scheduleSave();}
  }

  function beginText(point){snapshot();const item={id:uid(),x:point.x,y:point.y,text:'اكتب هنا',color:penColor,size:textSize,weight:600,w:280};data.texts.push(item);selected={type:'text',id:item.id};render();scheduleSave();requestAnimationFrame(()=>editText(item.id,true));}
  function editText(id,selectAll=false){const el=document.querySelector(`.cw-free-text[data-text-id="${id}"]`);if(!el)return;el.contentEditable='true';el.focus();if(selectAll){const range=document.createRange();range.selectNodeContents(el);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);}}
  function commitText(el){if(!el?.dataset.textId)return;const item=data.texts.find(t=>t.id===el.dataset.textId);if(!item)return;item.text=(el.textContent||'').trim()||'Text';el.contentEditable='false';scheduleSave();renderSelection();}

  function beginMove(e,type,id) {
    const obj=type==='stroke'?data.strokes.find(x=>x.id===id):data.texts.find(x=>x.id===id);if(!obj)return;
    snapshot();selected={type,id};render();renderOptions();
    const start=clientToWorld(e);
    interaction={type:'move',objectType:type,id,start};
    if(type==='stroke')interaction.originalPoints=clone(obj.points);else{interaction.ox=obj.x;interaction.oy=obj.y;}
  }
  function beginResize(e,handle) {
    if(!selectedObject())return;
    e.preventDefault();e.stopImmediatePropagation();snapshot();
    const b=boundsForSelected();if(!b)return;
    const anchorX=handle.includes('w')?b.x+b.w:b.x;
    const anchorY=handle.includes('n')?b.y+b.h:b.y;
    const cornerX=handle.includes('w')?b.x:b.x+b.w;
    const cornerY=handle.includes('n')?b.y:b.y+b.h;
    const obj=selectedObject();
    interaction={type:'resize',objectType:selected.type,id:selected.id,handle,b,anchorX,anchorY,cornerX,cornerY};
    if(selected.type==='stroke'){interaction.originalPoints=clone(obj.points);interaction.originalSize=obj.size||4;}
    else{interaction.ox=obj.x;interaction.oy=obj.y;interaction.ow=obj.w||280;interaction.os=obj.size||28;}
  }
  function moveInteraction(e) {
    if(!interaction)return;
    const obj=interaction.objectType==='stroke'?data.strokes.find(x=>x.id===interaction.id):data.texts.find(x=>x.id===interaction.id);if(!obj)return;
    const p=clientToWorld(e);
    if(interaction.type==='move'){
      const dx=p.x-interaction.start.x,dy=p.y-interaction.start.y;
      if(interaction.objectType==='stroke')obj.points=interaction.originalPoints.map(q=>[q[0]+dx,q[1]+dy]);else{obj.x=interaction.ox+dx;obj.y=interaction.oy+dy;}
      render();return;
    }
    const denX=interaction.cornerX-interaction.anchorX||1,denY=interaction.cornerY-interaction.anchorY||1;
    const sx=clamp((p.x-interaction.anchorX)/denX,.12,8),sy=clamp((p.y-interaction.anchorY)/denY,.12,8);
    if(interaction.objectType==='stroke'){
      obj.points=interaction.originalPoints.map(q=>[interaction.anchorX+(q[0]-interaction.anchorX)*sx,interaction.anchorY+(q[1]-interaction.anchorY)*sy]);
      obj.size=clamp(interaction.originalSize*Math.sqrt(sx*sy),1,60);
    }else{
      const scale=clamp(Math.sqrt(sx*sy),.2,6);
      obj.x=interaction.anchorX+(interaction.ox-interaction.anchorX)*sx;
      obj.y=interaction.anchorY+(interaction.oy-interaction.anchorY)*sy;
      obj.w=clamp(interaction.ow*sx,70,1800);
      obj.size=clamp(interaction.os*scale,10,160);
    }
    render();renderOptions();
  }
  function finishInteraction(){if(!interaction)return;interaction=null;scheduleSave();renderSelection();}

  function duplicateSelected(){const obj=selectedObject();if(!obj)return;snapshot();const copy={...clone(obj),id:uid()};if(selected.type==='stroke')copy.points=copy.points.map(p=>[p[0]+28,p[1]+28]);else{copy.x+=28;copy.y+=28;}if(selected.type==='stroke')data.strokes.push(copy);else data.texts.push(copy);selected={type:selected.type,id:copy.id};render();renderOptions();scheduleSave();}
  function deleteSelected(){if(!selected)return;snapshot();if(selected.type==='stroke')data.strokes=data.strokes.filter(x=>x.id!==selected.id);else data.texts=data.texts.filter(x=>x.id!==selected.id);selected=null;render();renderOptions();scheduleSave();}

  function bindCanvas() {
    const canvas=$('cwCanvas');if(!canvas||canvas.dataset.proBound)return;canvas.dataset.proBound='2';
    canvas.addEventListener('pointerdown',e=>{
      const handle=e.target.closest?.('[data-pro-handle]');if(handle){beginResize(e,handle.dataset.proHandle);return;}
      const textEl=e.target.closest?.('.cw-free-text');
      const strokeEl=e.target.closest?.('.cw-ink-stroke');
      if(mode==='eraser'&&(textEl||strokeEl)){
        e.preventDefault();e.stopImmediatePropagation();snapshot();
        if(textEl)data.texts=data.texts.filter(t=>t.id!==textEl.dataset.textId);else data.strokes=data.strokes.filter(s=>s.id!==strokeEl.dataset.strokeId);
        selected=null;render();scheduleSave();return;
      }
      if(mode==='text'&&textEl){e.preventDefault();e.stopImmediatePropagation();selected={type:'text',id:textEl.dataset.textId};render();editText(textEl.dataset.textId);return;}
      if(!mode&&e.button===0&&(textEl||strokeEl)){
        if(textEl?.isContentEditable)return;
        e.preventDefault();e.stopImmediatePropagation();
        beginMove(e,textEl?'text':'stroke',textEl?textEl.dataset.textId:strokeEl.dataset.strokeId);return;
      }
      if(!mode){clearSelection();return;}
      if(e.button!==0||e.target.closest?.('.cw-tools,.cw-pro-options,.cw-conflict'))return;
      e.preventDefault();e.stopImmediatePropagation();canvas.setPointerCapture?.(e.pointerId);
      const p=clientToWorld(e);
      if(mode==='text'){beginText(p);return;}
      if(mode==='pen'||mode==='highlighter'){
        snapshot();drawing={id:uid(),points:[[p.x,p.y]],color:penColor,size:mode==='highlighter'?Math.max(10,penSize*2.3):penSize,opacity:mode==='highlighter'?.28:1};data.strokes.push(drawing);render();return;
      }
      if(mode==='eraser'){snapshot();erasing=true;eraseAt(p);}
    },true);
    canvas.addEventListener('pointermove',e=>{
      if(interaction){e.preventDefault();e.stopImmediatePropagation();moveInteraction(e);return;}
      if(!drawing&&!erasing)return;e.preventDefault();e.stopImmediatePropagation();const p=clientToWorld(e);
      if(drawing){const last=drawing.points[drawing.points.length-1];if(Math.hypot(p.x-last[0],p.y-last[1])>1.5){drawing.points.push([p.x,p.y]);const path=document.querySelector(`[data-stroke-id="${drawing.id}"]`);if(path)path.setAttribute('d',smoothPath(drawing.points));}}
      if(erasing)eraseAt(p);
    },true);
    const finish=e=>{
      if(interaction){e.preventDefault();e.stopImmediatePropagation();finishInteraction();return;}
      if(!drawing&&!erasing)return;e.preventDefault();e.stopImmediatePropagation();
      if(drawing){selected={type:'stroke',id:drawing.id};}
      drawing=null;erasing=false;scheduleSave();render();
    };
    canvas.addEventListener('pointerup',finish,true);canvas.addEventListener('pointercancel',finish,true);
    canvas.addEventListener('dblclick',e=>{const text=e.target.closest?.('.cw-free-text');if(text&&!mode){e.preventDefault();e.stopImmediatePropagation();selected={type:'text',id:text.dataset.textId};render();renderOptions();editText(text.dataset.textId,true);}},true);
  }

  async function resolveSession(){if(pendingSessionId){const id=pendingSessionId;pendingSessionId=null;return id;}const c=client(),u=currentUser(),title=$('cwTitle')?.value?.trim();if(!c||!u||!title)return null;const {data:rows,error}=await c.from('creative_sessions').select('id').eq('user_id',u.id).eq('title',title).order('updated_at',{ascending:false}).limit(1);if(error)return null;return rows?.[0]?.id||null;}
  async function loadForSession(id){sessionId=id;loadedSession=false;revision=0;data={strokes:[],texts:[]};history=[];future=[];selected=null;render();renderOptions();const c=client(),u=currentUser();if(!c||!u||!id)return;const {data:row,error}=await c.from('creative_workspace_annotations').select('data,revision').eq('session_id',id).eq('user_id',u.id).maybeSingle();if(error){announce('أدوات الرسم شغالة، لكن مزامنة الرسم محتاجة Refresh.');return;}if(sessionId!==id)return;if(row){data=normalizeData(row.data);revision=Number(row.revision)||0;}loadedSession=true;render();syncUndo();}
  function saveState(text,state=''){const el=$('cwProSaveState');if(!el)return;el.textContent=text;el.dataset.state=state;}
  function scheduleSave(){saveState('غير محفوظ','pending');clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,500);}
  async function saveNow(){clearTimeout(saveTimer);if(saving){queued=true;return;}const c=client(),u=currentUser(),id=sessionId;if(!c||!u||!id)return;saving=true;queued=false;saveState('جاري الحفظ…','saving');const payload=clone(data),expected=revision;try{let result;if(expected===0)result=await c.from('creative_workspace_annotations').upsert({session_id:id,user_id:u.id,data:payload,revision:1,updated_at:new Date().toISOString()},{onConflict:'session_id'}).select('revision').single();else{result=await c.from('creative_workspace_annotations').update({data:payload,revision:expected+1,updated_at:new Date().toISOString()}).eq('session_id',id).eq('user_id',u.id).eq('revision',expected).select('revision').maybeSingle();if(!result.error&&!result.data){await loadForSession(id);announce('في نسخة أحدث من جهاز تاني؛ حمّلتها دلوقتي.');return;}}if(result.error)throw result.error;if(sessionId===id){revision=Number(result.data?.revision)||expected+1;saveState('محفوظ','saved');}}catch{if(sessionId===id){saveState('تعذّر الحفظ','error');announce('تعذّر حفظ الرسم. جرّب تاني.');}}finally{saving=false;if(queued&&sessionId===id)saveNow();}}
  function resetSession(){clearTimeout(saveTimer);sessionId=null;loadedSession=false;revision=0;data={strokes:[],texts:[]};history=[];future=[];selected=null;mode=null;drawing=null;erasing=false;interaction=null;clearProPressed();renderOptions();render();}

  function bindUI(){
    document.addEventListener('click',e=>{
      const open=e.target.closest?.('[data-cw-open]');if(open)pendingSessionId=open.dataset.cwOpen;
      const pro=e.target.closest?.('[data-cw-pro]');if(pro){e.preventDefault();e.stopPropagation();setMode(pro.dataset.cwPro);return;}
      const existing=e.target.closest?.('#cwTools [data-cw]');if(existing&&['cursor','hand','connect'].includes(existing.dataset.cw)){mode=null;clearProPressed();renderOptions();renderSelection();}
      const color=e.target.closest?.('[data-pro-color]');if(color){const c=color.dataset.proColor, obj=selectedObject();if(obj&&!mode){snapshot();obj.color=c;render();renderOptions();scheduleSave();}else{penColor=c;renderOptions();}return;}
      const action=e.target.closest?.('[data-cw-pro-action]')?.dataset.cwProAction;if(action){e.preventDefault();if(action==='undo')undo(false);if(action==='redo')undo(true);if(action==='clear'&&data.strokes.length){snapshot();data.strokes=[];if(selected?.type==='stroke')selected=null;render();renderOptions();scheduleSave();}if(action==='delete')deleteSelected();if(action==='duplicate')duplicateSelected();return;}
    },true);
    document.addEventListener('input',e=>{
      if(e.target.matches?.('[data-pro-size]')){penSize=Number(e.target.value);e.target.nextElementSibling.textContent=penSize+'px';}
      if(e.target.matches?.('[data-pro-text-size]')){textSize=Number(e.target.value);e.target.nextElementSibling.textContent=textSize+'px';}
      if(e.target.matches?.('[data-pro-selected-text-size]')){const t=selected?.type==='text'?selectedObject():null;if(t){if(!e.target.dataset.snapshotted){snapshot();e.target.dataset.snapshotted='1';}t.size=Number(e.target.value);e.target.nextElementSibling.textContent=Math.round(t.size)+'px';render();scheduleSave();}}
      if(e.target.matches?.('[data-pro-selected-stroke-size]')){const s=selected?.type==='stroke'?selectedObject():null;if(s){if(!e.target.dataset.snapshotted){snapshot();e.target.dataset.snapshotted='1';}s.size=Number(e.target.value);e.target.nextElementSibling.textContent=Math.round(s.size)+'px';render();scheduleSave();}}
      const text=e.target.closest?.('.cw-free-text[contenteditable="true"]');if(text){const t=data.texts.find(t=>t.id===text.dataset.textId);if(t){t.text=text.textContent||'';scheduleSave();renderSelection();}}
    },true);
    document.addEventListener('change',e=>{if(e.target.matches?.('[data-pro-selected-text-size],[data-pro-selected-stroke-size]'))delete e.target.dataset.snapshotted;},true);
    document.addEventListener('focusout',e=>{const text=e.target.closest?.('.cw-free-text[contenteditable="true"]');if(text)commitText(text);},true);
    document.addEventListener('keydown',e=>{
      const board=$('cwBoard');if(!board?.open)return;
      const editing=e.target.closest?.('input,textarea,select,[contenteditable="true"]');
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!editing&&(mode||selected)){e.preventDefault();e.stopImmediatePropagation();undo(e.shiftKey);return;}
      if(editing)return;
      const k=e.key.toLowerCase();
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&['t','b','m','e'].includes(k)){e.preventDefault();e.stopImmediatePropagation();setMode({t:'text',b:'pen',m:'highlighter',e:'eraser'}[k]);return;}
      if(k==='v'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){mode=null;clearProPressed();renderOptions();renderSelection();return;}
      if((e.ctrlKey||e.metaKey)&&k==='d'&&selected){e.preventDefault();e.stopImmediatePropagation();duplicateSelected();return;}
      if((e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();e.stopImmediatePropagation();deleteSelected();return;}
      if(selected&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault();e.stopImmediatePropagation();snapshot();const d=e.shiftKey?20:4,obj=selectedObject();if(selected.type==='stroke'){const dx=e.key==='ArrowRight'?d:e.key==='ArrowLeft'?-d:0,dy=e.key==='ArrowDown'?d:e.key==='ArrowUp'?-d:0;obj.points=obj.points.map(p=>[p[0]+dx,p[1]+dy]);}else{obj.x+=e.key==='ArrowRight'?d:e.key==='ArrowLeft'?-d:0;obj.y+=e.key==='ArrowDown'?d:e.key==='ArrowUp'?-d:0;}render();scheduleSave();return;
      }
    },true);
  }

  function observeDialog(){const board=$('cwBoard');if(!board)return;new MutationObserver(async()=>{if(board.open){installToolbar();ensureLayer();bindCanvas();const id=await resolveSession();if(id)loadForSession(id);}else resetSession();}).observe(board,{attributes:true,attributeFilter:['open']});}
  function mount(){if(mounted)return;mounted=true;installToolbar();ensureLayer();bindCanvas();bindUI();observeDialog();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
