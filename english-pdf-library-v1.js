(function(){
'use strict';
const catalog=[
 {title:'Collins English for Exams — Writing for IELTS',filename:'Collins English for Exams writing_for_ielts (2).pdf'},
 {title:'Everybody Up Starter — Student Book',filename:'Everybody_Up_3ED_Starter_Students_Book.pdf'},
 {title:'Everybody Up Starter — Workbook',filename:'Everybody_Up_3ED_Starter_Workbook.pdf'},
 {title:'Everybody Up 1 — Student Book',filename:'Everybody_Up_3ED_1_Students_Book.pdf'},
 {title:'Everybody Up 1 — Workbook',filename:'Everybody_Up_3ED_1_Workbook.pdf'},
 {title:'Everybody Up 2 — Student Book',filename:'Everybody_Up_3ED_2_Students_Book.pdf'},
 {title:'Everybody Up 2 — Workbook',filename:'Everybody_Up_3ED_2_Workbook.pdf'},
 {title:'Everybody Up 3 — Student Book',filename:'Everybody_Up_3ED_3_Students_Book.pdf'},
 {title:'Everybody Up 3 — Workbook',filename:'Everybody_Up_3ED_3_Workbook.pdf'},
 {title:'Everybody Up 4 — Student Book',filename:'Everybody_Up_3ED_4_Students_Book.pdf'},
 {title:'Everybody Up 4 — Workbook',filename:'Everybody_Up_3ED_4_Workbook.pdf'},
 {title:'Everybody Up 5 — Student Book',filename:'Everybody_Up_3ED_5_Students_Book.pdf'},
 {title:'Everybody Up 5 — Workbook',filename:'Everybody_Up_3ED_5_Workbook.pdf'},
 {title:'Everybody Up 6 — Workbook',filename:'Everybody_Up_3ED_6_Workbook.pdf'},
 {title:'Success with Grammar — Grade 1',filename:'Success_with_Grammar_Grade_1_z_library_sk,_1lib_sk,_z_lib_sk.pdf'},
 {title:'Success with Grammar — Grade 2',filename:'Success_With_Grammar,_Grade_2_Scholastic_Scholastic_z_library_sk.pdf'},
 {title:'Scholastic Success with Grammar — Grade 3',filename:'Scholastic_Success_with_Grammar_Grade_3_Scholastic_z_library_sk.pdf'},
 {title:'Scholastic Success with Grammar — Grade 5',filename:'Scholastic_Success_with_Grammar_Grade_5_Scholastic_z_library_sk.pdf'},
 {title:'Understanding Semantics — Second Edition',filename:'Understanding_Semantics,_Second_Edition_Understanding_Language_Series.pdf'},
 {title:'Linguamarina Grammar Book',filename:'toaz_info_linguamarina_grammarbook_pr_55874b868c782241a9e003eb67e9a532.pdf'}
];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>typeof user!=='undefined'&&user&&user.id?user.id:'';
const norm=s=>String(s||'').toLowerCase().replace(/\.pdf$/i,'').replace(/[^a-z0-9]/g,'');
function prettyTitle(title){const item=catalog.find(x=>norm(title)===norm(x.filename));return item?.title||title;}
const sizeText=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
let rows=[],search='',mounting=false;
function meta(row){try{return JSON.parse(row.text_content||'{}')}catch{return {}}}
function setStatus(text){const n=$('.ea16-pdf-status');if(n)n.textContent=text}
function libraryHtml(){return '<section class="ea16-pdf-library"><div class="ea16-pdf-head"><div><small>STUDY LIBRARY</small><h3>مكتبة الكتب PDF</h3><p>كتبك الخاصة في مكان واحد — افتح أي كتاب وكمّل مذاكرتك من آخر نقطة تفتكرها.</p></div><button type="button" class="ea12-btn primary" data-ea-pdf-pick>＋ إضافة PDF</button><input type="file" accept=".pdf,application/pdf" multiple data-ea-pdf-files hidden></div><div class="ea16-pdf-note">الكتب اللي رفعتها في مكتبة ChatGPT مش بتنتقل للموقع تلقائيًا. نزّلها على جهازك، ثم اضغط + وحدد أكثر من PDF مرة واحدة. بعد الرفع هتتخزن بشكل خاص في حسابك.</div><div class="ea16-pdf-toolbar"><input type="search" data-ea-pdf-search placeholder="ابحث في كتبي المحفوظة…"><span class="ea16-pdf-count" id="ea16PdfCount">—</span></div><p class="ea16-pdf-status" role="status">جاري تحميل مكتبتك…</p><div class="ea16-pdf-list" id="ea16PdfList"></div></section>'}
function ensureDialog(){if($('#ea16PdfDialog'))return;document.body.insertAdjacentHTML('beforeend','<dialog id="ea16PdfDialog" class="ea16-pdf-dialog"><header><div><small>PDF READER</small><h3 id="ea16PdfDialogTitle">—</h3><p id="ea16PdfDialogStatus">الكتاب خاص بحسابك.</p></div><button type="button" class="ea12-btn" data-ea-pdf-close>إغلاق ✕</button></header><iframe id="ea16PdfFrame" title="قارئ PDF" referrerpolicy="no-referrer"></iframe><footer><button type="button" class="ea12-btn primary" data-ea-pdf-dialog-done>علّم الكتاب كمكتمل</button></footer></dialog>')}
function mount(){
 const target=$('#ea14Content'),heading=target?.querySelector('.ea14-section-head h3')?.textContent||'';
 if(!target||(!heading.includes('تقدمي ومكتبتي')&&!heading.toLowerCase().includes('progress')))return;
 if(target.querySelector('.ea16-pdf-library'))return
 target.insertAdjacentHTML('beforeend',libraryHtml());ensureDialog();void loadBooks();
}
async function loadBooks(){
 const id=uid();if(!id||typeof sb==='undefined'){setStatus('سجّل دخولك لفتح مكتبتك الخاصة.');renderRows();return}
 try{const r=await sb.from('attachments').select('*').eq('user_id',id).eq('parent_type','english-library').eq('kind','pdf').order('created_at',{ascending:false}).limit(200);if(r.error)throw r.error;rows=r.data||[];renderRows();setStatus(rows.length?'كل كتبك المضافة محفوظة بشكل خاص داخل حسابك.':'مكتبتك جاهزة. اضغط + لاستيراد أول كتاب PDF.')}catch(e){setStatus('تعذر تحميل المكتبة: '+(e.message||'خطأ غير معروف'))}
}
function renderRows(){
 const list=$('#ea16PdfList');if(!list)return;
 const needle=search.toLowerCase();const visible=rows.filter(x=>(x.title||'').toLowerCase().includes(needle)||prettyTitle(x.title).toLowerCase().includes(needle));
 $('#ea16PdfCount').textContent=rows.length+' كتاب';
 list.innerHTML=visible.length?visible.map(row=>{const m=meta(row),done=!!m.completed;return '<article class="ea16-pdf-row"><div class="ea16-pdf-icon">PDF</div><div class="ea16-pdf-main"><b>'+esc(row.title)+'</b><small>'+sizeText(m.sizeBytes||0)+' · '+(done?'مكتمل ✓':'قيد المذاكرة')+'</small></div><div class="ea16-pdf-actions"><button class="ea12-btn primary" type="button" data-ea-pdf-open="'+esc(row.id)+'">افتح الكتاب</button><button class="ea12-btn" type="button" data-ea-pdf-toggle="'+esc(row.id)+'" data-ea-pdf-value="'+String(!done)+'">'+(done?'إلغاء الاكتمال':'علّم كمكتمل')+'</button><button class="ea12-btn danger" type="button" data-ea-pdf-delete="'+esc(row.id)+'">حذف</button></div></article>'}).join(''):'<div class="ea16-pdf-empty">'+(search?'مفيش كتاب بالبحث ده.':'لسه مفيش كتب مستوردة. استخدم زر + لاختيار ملفات PDF من جهازك.')+'</div>';
}
async function uploadBooks(files){
 const id=uid();if(!id||typeof sb==='undefined'){setStatus('سجّل دخولك الأول علشان تضيف كتبك.');return}
 const list=Array.from(files||[]).filter(f=>f.type==='application/pdf'||/\.pdf$/i.test(f.name));
 if(!list.length){setStatus('اختار ملفات PDF فقط.');return}
 let ok=0;const skipped=[],failures=[];
 for(let i=0;i<list.length;i++){
  const file=list[i];
  if(file.size>45*1024*1024){skipped.push(file.name);continue}
  const filename=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-100)||'book.pdf';
  const path=id+'/english-library/'+Date.now()+'-'+crypto.randomUUID()+'-'+filename;
  setStatus('رفع '+(i+1)+'/'+list.length+': '+file.name);
  try{
   const up=await sb.storage.from('serag-attachments').upload(path,file,{contentType:'application/pdf',upsert:false});
   if(up.error){failures.push(file.name+': '+up.error.message);continue}
   const textContent=JSON.stringify({source:'english-library',sizeBytes:file.size,completed:false,lastOpenedAt:null});
   const ins=await sb.from('attachments').insert({user_id:id,title:file.name,kind:'pdf',storage_path:path,mime_type:'application/pdf',parent_type:'english-library',text_content:textContent});
   if(ins.error){
    const cleanup=await sb.storage.from('serag-attachments').remove([path]);
    failures.push(file.name+': '+ins.error.message+(cleanup.error?' (تعذر تنظيف الملف من التخزين: '+cleanup.error.message+')':''));
    continue;
   }
   ok++;
  }catch(error){failures.push(file.name+': '+(error?.message||'خطأ في الاتصال'))}
 }
 await loadBooks();
 const messages=['تم استيراد '+ok+' من '+list.length+' ملف PDF.'];
 if(skipped.length)messages.push('تم تخطي الملفات الأكبر من 45 MB: '+skipped.join('، ')+'.');
 if(failures.length)messages.push('تعذر استيراد: '+failures.join(' | '));
 if(!ok&&!failures.length)messages.push('راجع حجم الملفات وحاول تاني.');
 setStatus(messages.join(' '));
}
async function openBook(id){
 const owner=uid();if(!owner||typeof sb==='undefined')return;
 const result=await sb.from('attachments').select('*').eq('id',id).eq('user_id',owner).eq('parent_type','english-library').eq('kind','pdf').single();
 if(result.error){setStatus('تعذر فتح الكتاب: '+result.error.message);return}
 const row=result.data,link=await sb.storage.from('serag-attachments').createSignedUrl(row.storage_path,3600);
 if(link.error){setStatus('تعذر إنشاء رابط قراءة خاص: '+link.error.message);return}
 const dialog=$('#ea16PdfDialog');$('#ea16PdfDialogTitle').textContent=row.title;$('#ea16PdfFrame').src=link.data.signedUrl+'#toolbar=1&navpanes=0&view=FitH';
 const done=!!meta(row).completed,button=dialog.querySelector('[data-ea-pdf-dialog-done]');button.dataset.eaPdfToggle=row.id;button.dataset.eaPdfValue=String(!done);button.textContent=done?'الكتاب مكتمل ✓ — اضغط لإلغاء الحالة':'علّم الكتاب كمكتمل';
 dialog.querySelector('#ea16PdfDialogStatus').textContent=done?'معلّم كمكتمل. تقدر تفتح الكتاب وتراجع منه في أي وقت.':'ملف خاص — رابط القراءة مؤقت وينتهي بعد ساعة.';
 if(typeof dialog.showModal==='function')dialog.showModal();else window.open(link.data.signedUrl,'_blank','noopener');
 const m=meta(row);m.lastOpenedAt=new Date().toISOString();await sb.from('attachments').update({text_content:JSON.stringify(m)}).eq('id',id).eq('user_id',owner);
}
async function toggleDone(id,value){
 const owner=uid(),row=rows.find(x=>x.id===id);if(!owner||!row)return;
 const m=meta(row);m.completed=value===true||value==='true';const r=await sb.from('attachments').update({text_content:JSON.stringify(m)}).eq('id',id).eq('user_id',owner);
 if(r.error){setStatus('تعذر حفظ التقدم: '+r.error.message);return}
 await loadBooks();const dialog=$('#ea16PdfDialog');if(dialog?.open&&dialog.querySelector('[data-ea-pdf-dialog-done]')?.dataset.eaPdfToggle===id){const button=dialog.querySelector('[data-ea-pdf-dialog-done]');button.dataset.eaPdfValue=String(!m.completed);button.textContent=m.completed?'الكتاب مكتمل ✓ — اضغط لإلغاء الحالة':'علّم الكتاب كمكتمل';dialog.querySelector('#ea16PdfDialogStatus').textContent=m.completed?'اتسجل كمكتمل في مكتبتك.':'اتلغت علامة الاكتمال.'}
}
async function deleteBook(id){
 const row=rows.find(x=>x.id===id);if(!row||!confirm('متأكد إنك عايز تمسح '+row.title+' من مكتبتك؟'))return;
 const owner=uid();const removed=await sb.storage.from('serag-attachments').remove([row.storage_path]);if(removed.error){setStatus('تعذر حذف الملف من التخزين: '+removed.error.message);return}
 const result=await sb.from('attachments').delete().eq('id',id).eq('user_id',owner);if(result.error){setStatus('اتمسح الملف لكن تعذر حذف سجله: '+result.error.message);return}
 await loadBooks();setStatus('اتحذف '+row.title+' من مكتبتك.');
}
document.addEventListener('click',function(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-ea-pdf-pick')){$('[data-ea-pdf-files]')?.click();return}
 if(b.hasAttribute('data-ea-pdf-close')){$('#ea16PdfDialog')?.close();return}
 if(b.hasAttribute('data-ea-pdf-open')){void openBook(b.dataset.eaPdfOpen);return}
 if(b.hasAttribute('data-ea-pdf-toggle')){void toggleDone(b.dataset.eaPdfToggle,b.dataset.eaPdfValue);return}
 if(b.hasAttribute('data-ea-pdf-delete')){void deleteBook(b.dataset.eaPdfDelete);return}
});
document.addEventListener('click',function(e){const d=e.target;if(d?.id==='ea16PdfDialog'&&d.open&&d===e.target)d.close()});
document.addEventListener('change',function(e){if(!e.target.matches?.('[data-ea-pdf-files]'))return;void uploadBooks(Array.from(e.target.files||[]));e.target.value=''});
document.addEventListener('input',function(e){if(!e.target.matches?.('[data-ea-pdf-search]'))return;search=e.target.value;renderRows()});
function observe(){const observer=new MutationObserver(()=>mount());if(document.body)observer.observe(document.body,{childList:true,subtree:true});mount()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.SERAG_ENGLISH_PDF_LIBRARY={catalog,load:loadBooks};
})();