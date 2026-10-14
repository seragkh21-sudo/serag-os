/* One vocabulary deck and sentence engine for Words and Engoplay. No paid generation. */
(()=>{
 'use strict';
 const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const uid=()=>typeof user!=='undefined'?user?.id:null;
 const norm=s=>String(s).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 let custom=[],owner=null,session=null,round=0;
 function items(){
  const rows=(window.SERAG_ENGLISH_V9?.vocabulary||[]).map(([phrase,meaning,group,example])=>({phrase,meaning,group,example}));
  rows.push(...(window.SERAG_PHRASES_V16?.items||[]),...custom.map(w=>({phrase:w.word,meaning:w.meaning,example:w.example,group:'My Words'})));
  const map=new Map();
  for(const row of rows){const key=norm(row.phrase);if(!key)continue;const old=map.get(key);if(old){if(row.id)old.id=row.id;if(row.note)old.note=row.note;old.examples=[...new Set([...old.examples,row.example].filter(Boolean))];continue}map.set(key,{...row,id:row.id||'vocab:'+key,examples:[row.example].filter(Boolean)})}
  return [...map.values()];
 }
 function question(item,variant=0){
  const forms=[item.phrase];
  // Existing examples sometimes conjugate the first verb. Keep that natural surface answer.
  const irregular={run:['running','ran'],go:['went','going'],make:['made','making'],have:['had','having'],get:['got','getting'],take:['took','taking'],give:['gave','giving'],come:['came','coming'],keep:['kept','keeping'],put:['putting'],break:['broke','breaking'],bring:['brought','bringing'],feel:['felt','feeling'],set:['setting'],hold:['held','holding'],catch:['caught','catching'],think:['thought','thinking']};
  const [first,...rest]=item.phrase.split(' ');
  const verbs=irregular[first]||[first+'s',first+'ed',first.endsWith('e')?first.slice(0,-1)+'ing':first+'ing'];
  for(const v of verbs)forms.push([v,...rest].join(' '));
  const candidates=[];
  for(const example of item.examples||[item.example]){if(!example)continue;for(const form of forms){const re=new RegExp('(?<![A-Za-z])'+escape(form).replace(/ /g,'\\s+')+'(?![A-Za-z])','i'),match=example.match(re);if(match){candidates.push({sentence:example,answer:match[0],before:example.slice(0,match.index),after:example.slice(match.index+match[0].length),fallback:false});break}}}
  if(!candidates.length){
   const fallback={'raise a point':'May I raise a point before we make the final decision?','hang out':'We usually hang out at the park after work.','you nailed it':'That presentation was excellent; you nailed it!','carry out':'We need to carry out a final check before publishing.','fall behind':'I might fall behind if I miss another lesson.','feedback round':'We agreed on one feedback round before final delivery.','agree to disagree':'We have different opinions, so let’s agree to disagree.','meet halfway':'We can meet halfway and choose a simpler design.','be hard on me':'Please do not be hard on me while I learn this skill.','stand my ground':'I will stand my ground when a decision affects safety.','persuade':'Can you persuade the team to test the new idea?','convince':'The evidence should convince them to reconsider.'}[norm(item.phrase)];
   if(fallback){const match=fallback.match(new RegExp(escape(item.phrase),'i'));return {item,sentence:fallback,answer:match[0],before:fallback.slice(0,match.index),after:fallback.slice(match.index+match[0].length),fallback:false}}
   const sentence=`In my vocabulary notebook, I wrote “${item.phrase}” and added an example.`;return {item,sentence,answer:item.phrase,before:'In my vocabulary notebook, I wrote “',after:'” and added an example.',fallback:true}
  }
  return {...candidates[variant%candidates.length],item};
 }
 function hint(answer,count){let letters=0;return [...answer].map(c=>/[\p{L}\p{N}]/u.test(c)?(++letters<=count?c:'_'):c).join('')}
 function check(q,value){return norm(value)===norm(q.answer)}
 function state(){try{return JSON.parse(localStorage.getItem('seragSentenceV21:'+uid())||'{}')}catch{return {}}}
 function saveAttempt(q,correct,assisted){const id=uid();if(!id)return;const s=state(),key=norm(q.item.phrase),old=s[key]||{attempts:0,independent:0};s[key]={attempts:old.attempts+1,independent:old.independent+(correct&&!assisted?1:0),last_correct:correct,last_assisted:assisted,at:new Date().toISOString()};try{localStorage.setItem('seragSentenceV21:'+id,JSON.stringify(s))}catch{}
  // Both entry points use Engoplay's existing owner-scoped, server-synced answer queue.
  if(!assisted)window.ENGOPLAY?.track({id:'sentence:'+key,topic:'vocabulary-sentence',correct,answer:correct?q.answer:(session?.input||''),at:Date.now()});
 }
 function start(word=null){const list=items();if(!list.length)return;let pool=word?list.filter(w=>norm(w.phrase)===norm(word)):list;if(!pool.length)pool=list;pool=[...pool];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}session={owner:uid(),list:pool.slice(0,word?1:10).map(w=>question(w,round++)),index:0,hints:0,revealed:false,done:false,wrong:false,input:'',correct:0};paint()}
 function html(){const list=items(),s=state(),count=Object.values(s).filter(x=>x.independent>0).length;
  if(!session||session.owner!==uid())return `<section class="wp-card"><small>WORDS IN CONTEXT</small><h3>كمّل الجملة بكلمة واحدة أو تعبير.</h3><p>${list.length} كلمة وعبارة · ${count} تدربت عليها بإجابة مستقلة على هذا الجهاز.</p><button type="button" class="wp-primary" data-wp-start>ابدأ ١٠ جمل</button><label for="wpChoose">أو اختار كلمة من البنك كاملًا</label><input id="wpChoose" list="wpVocabulary" placeholder="ابحث عن كلمة أو تعبير"><datalist id="wpVocabulary">${list.map(w=>`<option value="${h(w.phrase)}"></option>`).join('')}</datalist><button type="button" data-wp-selected>تدرب على الكلمة</button></section>`;
  const q=session.list[session.index];if(!q)return `<section class="wp-card"><h3>انتهت الجولة</h3><p>${session.correct}/${session.list.length} إجابات مستقلة من أول محاولة. ده نتيجة التدريب، مش تقييم مستوى شامل.</p><button type="button" data-wp-start>جولة جديدة</button></section>`;
  return `<section class="wp-card" aria-label="تدريب إكمال الجملة"><header><small>WORDS IN CONTEXT · ${session.index+1}/${session.list.length}</small><button type="button" data-wp-exit>إنهاء</button></header><p>${h(q.item.meaning||q.item.group)}${q.fallback?' · تدريب تذكّر الكلمة':''}</p><p class="wp-sentence" lang="en" dir="ltr">${h(q.before)}<mark>${session.done?h(q.answer):'________'}</mark>${h(q.after)}</p><form data-wp-form><label for="wpAnswer">الكلمة أو التعبير الناقص</label><input id="wpAnswer" name="answer" lang="en" dir="ltr" autocomplete="off" spellcheck="false" value="${h(session.input)}" ${session.done?'disabled':''}><div class="wp-actions"><button class="wp-primary" ${session.done?'disabled':''}>تحقق ↵</button><button type="button" data-wp-hint ${session.done||session.hints>=[...q.answer].filter(c=>/[\p{L}\p{N}]/u.test(c)).length?'disabled':''}>Hint · حرف إضافي</button><button type="button" data-wp-reveal ${session.done?'disabled':''}>كشف الإجابة</button></div></form><p class="wp-hint" lang="en" dir="ltr">${session.hints?hint(q.answer,session.hints):''}</p><p role="status" aria-live="polite">${session.done?session.revealed?'الإجابة مكشوفة؛ لن تُحسب كإنجاز مستقل.':session.wrong||session.hints?'صحيح بعد المساعدة أو إعادة المحاولة. راجع الجملة كاملة.':'صحيح ✓ اقرأ الجملة كاملة.':session.wrong?'لسه محتاجة تعديل. جرّب تاني أو استخدم Hint.':''}</p>${session.done?`<p lang="en" dir="ltr">${h(q.sentence)}</p><button type="button" data-wp-next>الجملة التالية →</button>`:''}</section>`;
 }
 function paint(){document.querySelectorAll('[data-word-practice]').forEach(x=>x.innerHTML=html())}
 function mount(){const center=document.getElementById('ea12Center');if(!center)return;const words=!!center.querySelector('[data-ea-tab="words"][aria-pressed="true"]'),cards=!!center.querySelector('[data-ep-tab="cards"][aria-pressed="true"]');if(!words&&!cards)return;if(center.querySelector('[data-word-practice]'))return;const node=document.createElement('div');node.dataset.wordPractice='';(center.querySelector('#ea14Content')||center.querySelector('.ep-word-section')||center).prepend(node);node.innerHTML=html()}
 document.addEventListener('input',e=>{if(e.target.id==='wpAnswer'&&session)session.input=e.target.value});
 document.addEventListener('submit',e=>{if(!e.target.matches('[data-wp-form]'))return;e.preventDefault();if(!session||session.done||session.owner!==uid())return;const q=session.list[session.index],ok=check(q,session.input);if(!session.input.trim())return;if(ok){const assisted=!!(session.hints||session.wrong);session.done=true;if(!assisted)session.correct++;saveAttempt(q,true,assisted)}else{if(!session.wrong)saveAttempt(q,false,!!session.hints);session.wrong=true}paint();document.getElementById('wpAnswer')?.focus()});
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-wp-start'))start();if(b.hasAttribute('data-wp-selected')){const word=document.getElementById('wpChoose')?.value;if(items().some(w=>norm(w.phrase)===norm(word)))start(word)}if(b.dataset.wpWord)start(b.dataset.wpWord);if(!session||session.owner!==uid())return;const q=session.list[session.index];if(b.hasAttribute('data-wp-exit')){session=null;paint()}else if(b.hasAttribute('data-wp-hint')&&!session.done){session.hints=Math.min(session.hints+1,[...q.answer].filter(c=>/[\p{L}\p{N}]/u.test(c)).length);paint();document.getElementById('wpAnswer')?.focus()}else if(b.hasAttribute('data-wp-reveal')&&!session.done){session.done=true;session.revealed=true;saveAttempt(q,false,true);paint()}else if(b.hasAttribute('data-wp-next')&&session.done){session.index++;Object.assign(session,{hints:0,revealed:false,done:false,wrong:false,input:''});paint();document.getElementById('wpAnswer')?.focus()}});
 async function load(force=false){const id=uid();if(owner===id&&!force)return;const changed=owner!==id;owner=id;if(changed){custom=[];session=null;paint();}if(!id||typeof sb==='undefined')return;try{let rows=[],offset=0;for(;;){const r=await sb.from('english_words').select('word,meaning,example').eq('user_id',id).range(offset,offset+499);if(owner!==id)return;if(r.error)break;rows.push(...r.data);if(r.data.length<500)break;offset+=500}if(owner===id){custom=rows;paint()}}catch{}}
 document.addEventListener('submit',e=>{if(e.target.id==='wordForm')setTimeout(()=>void load(true),1200)});
 window.SERAG_WORD_PRACTICE={items,question,hint,check,norm,html,start,progress:state};
 const timer=setInterval(()=>{void load();mount()},500);window.addEventListener('pagehide',()=>clearInterval(timer));
})();
