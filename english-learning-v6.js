(()=>{
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data=window.SERAG_ENGLISH_V9;
  if(!data)return;
  const today=()=>new Date().toLocaleDateString('en-CA');
  const seed=d=>[...String(d)].reduce((a,c)=>((a*31)+c.charCodeAt(0))>>>0,17);
  const shuffle=(arr,s)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){s=(s*1664525+1013904223)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
  const pick=(category,d,n=1)=>shuffle(data.vocabulary.filter(x=>x[2]===category),seed(d+category)).slice(0,n);
  const professional=['Work & Office','Jobs & Interviews','HR & People','Company & Business','Marketing & Sales','Meetings'];
  function dailyWords(d=today()){
    const s=seed(d),pro=shuffle(professional,s).slice(0,4).flatMap((c,i)=>pick(c,d+i));
    const general=pick('Everyday',d,2),natural=[...pick('Slang & Natural',d),...pick('Idioms',d),...pick('Phrasal Verbs',d)];
    const last=s%3===0?pick('Creative',d):pick(professional[(s+4)%professional.length],d+'extra');
    return shuffle([...pro,...general,...natural,...last],s+93).slice(0,10);
  }
  const dailyArticle=(d=today())=>data.articles[seed(d)%data.articles.length];
  const dailyGrammar=(d=today())=>data.grammar[seed(d)%data.grammar.length];
  const dailySpeaking=(d=today(),offset=0)=>data.speaking[(seed(d)+offset)%data.speaking.length];
  const blankExample=entry=>entry[3].replace(new RegExp(entry[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'_____');
  let state={date:today(),steps:Array(6).fill(false),xp:0,answers:0,correct:0,revealed:[],videoUrl:'',videoPhrase:'',videoMeaning:'',videoNotes:'',videoFeedback:'',speakingPromptOffset:0,speakingTranscript:'',speakingFeedback:'',grammarPractice:'',grammarFeedback:''};
  let archive=[],syncId=null,gameIndex=0,score=0,answered=false,grammarFilter='All',recognition=null,isRecording=false;

  function normalizeState(x={}){
    const steps=Array.from({length:6},(_,i)=>Boolean(x.steps?.[i]));
    return {...state,...x,date:today(),steps,revealed:Array.isArray(x.revealed)?x.revealed:[]};
  }
  function restoreProgress(){gameIndex=Math.max(0,Number(state.answers)||0)%10;score=Math.max(0,Number(state.correct)||0)}
  function cache(){try{localStorage.setItem('seragEnglishV9',JSON.stringify(state))}catch{}}
  function loadCache(){try{const x=JSON.parse(localStorage.getItem('seragEnglishV9')||'{}');if(x.date===today()){state=normalizeState(x);restoreProgress()}}catch{}}
  async function loadSync(){
    loadCache();renderAll();if(typeof sb==='undefined'||!user?.id)return;
    try{
      const r=await sb.from('quick_notes').select('*').eq('category','system_english').order('created_at',{ascending:false}).limit(90);
      archive=(r.data||[]).map(x=>{try{return {...JSON.parse(x.content),id:x.id}}catch{return null}}).filter(Boolean);
      const saved=archive.find(x=>x.date===today());if(saved){state=normalizeState(saved);syncId=saved.id;restoreProgress()}renderAll();
    }catch{}
  }
  let syncTimer;
  function sync(){
    cache();clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{
      if(typeof sb==='undefined'||!user?.id)return;
      const content=JSON.stringify({...state,version:9,updatedAt:new Date().toISOString()});
      if(syncId)await sb.from('quick_notes').update({content,updated_at:new Date().toISOString()}).eq('id',syncId);
      else{const r=await sb.from('quick_notes').insert({user_id:user.id,title:`English Daily ${state.date}`,content,category:'system_english'}).select('id').single();if(!r.error)syncId=r.data.id}
    },450);
  }
  function complete(i){state.steps[i]=true;state.xp=state.steps.filter(Boolean).length*20;sync();renderMission()}
  function speak(text,rate=.88){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;speechSynthesis.speak(u)}
  function reveal(meaning,index=null){const shown=index!==null&&state.revealed.includes(index);return `<button class="el9-reveal ${shown?'revealed':''}" ${index!==null?`data-reveal="${index}"`:''} type="button"><span>${esc(meaning)}</span><small>${shown?'اضغط للإخفاء':'اضغط لكشف المعنى'}</small></button>`}

  function renderMission(){
    const done=state.steps.filter(Boolean).length,pct=Math.round(done/6*100);
    $('#el9Mission').innerHTML=`<div class="el9-card-head"><div><div class="el6-eyebrow">TODAY · ${state.date}</div><h3>مهمة النهارده</h3></div><span class="el9-pill">${done}/6</span></div><div class="el6-progress"><i style="width:${pct}%"></i></div><div class="el9-mission-list">${['10 كلمات متنوعة','10 أسئلة سريعة','مقال قصير','تطبيق Grammar','دقيقة Speaking','تدريب من فيديو'].map((x,i)=>`<button data-jump="${['el9Words','el9Quiz','el9Article','el9Grammar','el9Speaking','el9VideoDetails'][i]}" class="${state.steps[i]?'done':i===done?'current':''}"><span>${state.steps[i]?'✓':i+1}</span>${x}</button>`).join('')}</div>`;
    $('#el9TodayPct').textContent=pct+'%';$('#el9Xp').textContent=state.xp+' XP';
  }
  function renderWords(){
    const words=dailyWords();
    $('#el9WordsList').innerHTML=words.map(([word,meaning,category,example,register],i)=>`<article class="el9-word-card"><div class="el9-word-head"><div><strong>${esc(word)}</strong><div><span>${esc(category)}</span><em>${esc(register)}</em></div></div><button data-speak="${esc(word)}" aria-label="اسمع ${esc(word)}">🔊</button></div>${reveal(meaning,i)}<details><summary>Example</summary><p>${esc(example)}</p><button data-speak="${esc(example)}">🔊 Listen</button></details><button class="el6-btn tiny secondary" data-save-word="${esc(word)}" data-meaning="${esc(meaning)}" data-example="${esc(example)}">+ My Words</button></article>`).join('');
    $('#el9WordsCount').textContent=`${words.length} كلمات · General + Work`;
  }
  function currentQuiz(){
    const words=dailyWords(),entry=words[gameIndex%words.length],mode=gameIndex%4,s=seed(today())+gameIndex*17;
    const alternatives=shuffle(data.vocabulary.filter(x=>x[0]!==entry[0]&&(x[2]===entry[2]||x[4]===entry[4])),s).slice(0,3);
    const fallback=alternatives.length<3?shuffle(data.vocabulary.filter(x=>x[0]!==entry[0]&&!alternatives.includes(x)),s+9).slice(0,3-alternatives.length):[];
    const pool=[entry,...alternatives,...fallback];
    if(mode===1)return {title:'Complete the sentence',prompt:blankExample(entry),correct:entry[0],options:shuffle(pool,s+1).map(x=>x[0])};
    if(mode===2){const categories=[entry[2],...shuffle([...new Set(data.vocabulary.map(x=>x[2]).filter(x=>x!==entry[2]))],s).slice(0,3)];return {title:'Which topic does it belong to?',prompt:entry[0],correct:entry[2],options:shuffle(categories,s+2)}}
    if(mode===3)return {title:'Choose the natural English',prompt:entry[1],correct:entry[0],options:shuffle(pool,s+3).map(x=>x[0])};
    return {title:'Choose the meaning',prompt:entry[0],correct:entry[1],options:shuffle(pool,s+4).map(x=>x[1])};
  }
  function renderQuiz(){const q=currentQuiz(),label=state.answers<10?`${state.answers+1}/10`:`Bonus ${state.answers-9}`;$('#el9Quiz').innerHTML=`<div class="el9-card-head"><div><div class="el6-muted">${q.title} · ${label}</div><h3>${esc(q.prompt)}</h3></div><span class="el9-pill">${score} صح</span></div><div class="el9-quiz-options">${q.options.map(x=>`<button data-quiz-answer="${esc(x)}" data-correct="${esc(q.correct)}">${esc(x)}</button>`).join('')}</div><div class="el6-muted">4 أنواع أسئلة، وتتغير الكلمات تلقائيًا كل يوم. بعد أول 10 تقدر تكمل Bonus.</div>`}
  function renderArticle(){const a=dailyArticle();$('#el9Article').innerHTML=`<div class="el9-card-head"><div><div class="el6-eyebrow">DAILY READING</div><h3>${esc(a.title)}</h3></div><div class="el6-tags"><span class="el6-tag">${a.level}</span><span class="el6-tag">${a.topic}</span></div></div><div class="el6-article">${esc(a.text)}</div><div class="el9-actions"><button class="el6-btn secondary" data-read-article>🔊 Listen</button><button class="el6-btn secondary" data-article-done>✓ قرأت المقال</button></div><div class="el6-question"><strong>${esc(a.question)}</strong><div class="el8-short-answer"><input id="el9ArticleAnswer" placeholder="Answer in English"><button class="el6-btn" data-check-article>Check</button></div><div id="el9ArticleFeedback" class="el6-muted"></div></div>`}
  function renderGrammar(){
    const g=dailyGrammar(),tracks=['All',...new Set(data.grammar.map(x=>x.track))],list=grammarFilter==='All'?data.grammar:data.grammar.filter(x=>x.track===grammarFilter);
    $('#el9GrammarBody').innerHTML=`<section class="el9-rule-today"><div class="el6-eyebrow">RULE OF THE DAY</div><h3>${esc(g.title)}</h3><p>${esc(g.rule)}</p><div class="el6-example">${esc(g.example)}</div><div class="el6-muted"><b>Practice:</b> ${esc(g.task)}</div><div class="el9-grammar-check"><span>${esc(g.quiz[0])}</span><div><button data-grammar-choice="${esc(g.quiz[1])}" data-correct="${esc(g.quiz[1])}">${esc(g.quiz[1])}</button><button data-grammar-choice="${esc(g.quiz[2])}" data-correct="${esc(g.quiz[1])}">${esc(g.quiz[2])}</button></div><div id="el9GrammarResult"></div></div><div class="el9-grammar-write"><label for="el9GrammarPractice">اكتب مثال من حياتك أو شغلك</label><textarea id="el9GrammarPractice" placeholder="Write one sentence using today’s rule…">${esc(state.grammarPractice)}</textarea></div><div class="el9-actions"><button class="el6-btn tiny secondary" data-speak="${esc(g.example)}">🔊 Listen</button><button class="el6-btn tiny secondary" data-grammar-ai>اشرح القاعدة ببساطة</button><button class="el6-btn tiny" data-grammar-check-writing>صحّح جملتي</button></div><div id="el9GrammarAi" class="el9-ai-feedback ${state.grammarFeedback?'':'hidden'}">${esc(state.grammarFeedback)}</div></section><div class="el9-scroll-tabs">${tracks.map(x=>`<button class="el7-tab ${x===grammarFilter?'active':''}" data-grammar-filter="${x}">${x}</button>`).join('')}</div><div class="el9-grammar-list">${list.map(x=>`<details class="el6-grammar-item"><summary><div><b>${esc(x.title)}</b><span>${esc(x.track)}</span></div><span>⌄</span></summary><div class="el6-grammar-body"><p>${esc(x.rule)}</p><div class="el6-example">${esc(x.example)}</div><p class="el6-muted"><b>Practice:</b> ${esc(x.task)}</p></div></details>`).join('')}</div>`;
  }
  function renderSpeaking(){
    const p=dailySpeaking(today(),state.speakingPromptOffset||0);
    $('#el9Speaking').innerHTML=`<div class="el9-card-head"><div><div class="el6-eyebrow">SPEAKING LAB · ${esc(p.type)}</div><h3>اتكلم دقيقة من غير ترجمة في دماغك</h3></div><span class="el9-live ${isRecording?'recording':''}">${isRecording?'● Recording':'1 min'}</span></div><div class="el9-prompt"><strong>${esc(p.prompt)}</strong>${reveal(p.hint)}<details><summary>Sentence starter</summary><p>${esc(p.starter)}</p></details></div><div class="el9-actions"><button class="el6-btn secondary" data-speak-prompt>🔊 Listen</button><button class="el6-btn secondary" data-next-speaking>موضوع تاني</button><button class="el6-btn" data-record ${isRecording?'disabled':''}>${isRecording?'Listening…':'🎙 Start speaking'}</button><button class="el6-btn secondary ${isRecording?'':'hidden'}" data-stop-record>Stop</button></div><textarea id="el9Transcript" placeholder="كلامك هيظهر هنا، أو اكتبه لو المتصفح مش بيدعم الميكروفون.">${esc(state.speakingTranscript)}</textarea><div class="el9-actions"><button class="el6-btn secondary" data-speak-answer>🔊 اسمع إجابتي</button><button class="el6-btn" data-speaking-feedback>تصحيح Speaking بالـAI</button></div><div id="el9SpeakingFeedback" class="el9-ai-feedback ${state.speakingFeedback?'':'hidden'}">${esc(state.speakingFeedback)}</div>`;
  }
  function youtubeId(value){try{const u=new URL(value);if(u.hostname.includes('youtu.be'))return u.pathname.slice(1).split('/')[0];if(u.hostname.includes('youtube.com'))return u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop()}catch{}return ''}
  function renderVideo(){
    const id=youtubeId(state.videoUrl);
    $('#el9VideoContent').innerHTML=`<div class="el9-card-head"><div><div class="el6-eyebrow">REAL VIDEO IMMERSION · PLAYLINGO-INSPIRED</div><h3>اتعلم من فيديو بتحبه</h3></div><span class="el9-pill">Watch → Notice → Explain → Shadow</span></div><p class="el6-muted">حط فيديو YouTube إنجليزي عن أي موضوع. شاهد 60–90 ثانية بالـEnglish subtitles، التقط جملة واحدة، افهمها في سياقها، ثم كررها بنفس الإيقاع.</p><div class="el9-video-url"><input id="el9VideoUrl" type="url" value="${esc(state.videoUrl)}" placeholder="Paste YouTube link"><button class="el6-btn" data-load-video>Load</button></div>${id?`<div class="el9-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="English practice video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`:'<div class="el9-video-empty">الصق رابط فيديو علشان يبدأ التدريب.</div>'}<div class="el9-video-tip"><b>طريقة المشاهدة:</b> أول مرة من غير ترجمة عربية. اكشف المعنى فقط لو السياق مش كفاية، وما توقفش عند كل كلمة.</div><div class="el9-video-steps"><label><span>1</span><div><b>Catch one subtitle line</b><input id="el9VideoPhrase" value="${esc(state.videoPhrase)}" placeholder="Paste or write the English line you heard"></div></label><label><span>2</span><div><b>Guess the meaning first</b><input id="el9VideoMeaning" value="${esc(state.videoMeaning)}" placeholder="اكتب فهمك للجملة بالعربي"></div></label><label><span>3</span><div><b>Shadow it aloud</b><textarea id="el9VideoNotes" placeholder="إيه اللي لاحظته في النطق، الربط أو السياق؟">${esc(state.videoNotes)}</textarea></div></label></div><div class="el9-actions"><button class="el6-btn secondary" data-video-explain>AI: اشرح Slang / Idiom / Grammar</button><button class="el6-btn secondary" data-video-listen>🔊 Shadow slowly</button><button class="el6-btn secondary" data-video-save>+ Save phrase</button><button class="el6-btn" data-video-done>Done for today</button></div><div id="el9VideoAi" class="el9-ai-feedback ${state.videoFeedback?'':'hidden'}">${esc(state.videoFeedback)}</div>`;
  }
  function renderBank(){
    const categories=[...new Set(data.vocabulary.map(x=>x[2]))];
    $('#el9WordBank').innerHTML=categories.map(category=>`<details class="el8-vocab-group"><summary><div><b>${esc(category)}</b><small>${category==='Creative'?'جزء صغير متخصص':category.includes('Slang')?'استخدمه في الكلام غير الرسمي':''}</small></div><span>${data.vocabulary.filter(x=>x[2]===category).length} كلمة</span></summary><div>${data.vocabulary.filter(x=>x[2]===category).map(([w,m,,ex,reg])=>`<div class="el6-vocab-row"><div><strong>${esc(w)}</strong><small>${esc(reg)} · ${esc(ex)}</small>${reveal(m)}</div><div><button data-speak="${esc(w)}">🔊</button><button class="el6-btn tiny secondary" data-save-word="${esc(w)}" data-meaning="${esc(m)}" data-example="${esc(ex)}">+ Save</button></div></div>`).join('')}</div></details>`).join('');
  }
  function renderArchive(){
    const days=Array.from({length:21},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i-1);const key=d.toLocaleDateString('en-CA'),saved=archive.find(x=>x.date===key);return {d,key,xp:saved?.xp||0,a:dailyArticle(key)}});
    $('#el9Archive').innerHTML=days.map(x=>`<details class="el8-archive-day"><summary><div><b>${x.d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'short'})}</b><span>${esc(x.a.title)}</span></div><span>${x.xp?x.xp+' XP':'مراجعة'}</span></summary><div class="el8-archive-words">${dailyWords(x.key).map(([w,m])=>`<button class="el9-reveal" type="button"><b>${esc(w)}</b><span>${esc(m)}</span><small>اضغط لكشف المعنى</small></button>`).join('')}</div></details>`).join('');
  }
  function renderAll(){renderMission();renderWords();renderQuiz();renderArticle();renderGrammar();renderSpeaking();renderVideo();renderBank();renderArchive()}

  async function saveWord(word,meaning,example=''){
    if(!user?.id)return toast?.('سجّل دخولك الأول');
    const old=await sb.from('english_words').select('id').ilike('word',word).limit(1);if(old.data?.length)return toast?.('موجودة بالفعل في My Words');
    const r=await sb.from('english_words').insert({user_id:user.id,word,meaning,example,status:'learning'});toast?.(r.error?r.error.message:'اتضافت لـ My Words');try{loadEnglish?.()}catch{}
  }
  async function coach(mode,prompt,response=''){
    const box=mode==='speaking'?$('#el9SpeakingFeedback'):mode==='video'?$('#el9VideoAi'):$('#el9GrammarAi');box.classList.remove('hidden');box.textContent='AI is reviewing…';
    try{
      const session=(await sb.auth.getSession()).data.session;if(!session)throw new Error('سجّل دخولك الأول');
      const r=await fetch('/api/english-coach',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({mode,prompt,response})});
      const out=await r.json();if(!r.ok)throw new Error(out.error||'تعذر التصحيح');box.textContent=out.feedback;
      if(mode==='speaking'){state.speakingFeedback=out.feedback;complete(4)}
      if(mode==='grammar'){state.grammarFeedback=out.feedback;complete(3)}
      if(mode==='video'){state.videoFeedback=out.feedback;sync()}
    }catch(e){box.textContent=e.message}
  }
  function startRecording(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast?.('الميكروفون للتصحيح غير مدعوم هنا؛ اكتب إجابتك في الصندوق.');return}
    recognition?.stop();recognition=new SR();recognition.lang='en-US';recognition.continuous=true;recognition.interimResults=true;let finalText=state.speakingTranscript||'';
    recognition.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=(finalText?' ':'')+t;else interim+=t}state.speakingTranscript=(finalText+' '+interim).trim();const area=$('#el9Transcript');if(area)area.value=state.speakingTranscript};
    recognition.onend=()=>{isRecording=false;sync();renderSpeaking()};recognition.onerror=()=>{isRecording=false;renderSpeaking()};isRecording=true;recognition.start();renderSpeaking();
  }
  function stopRecording(){recognition?.stop();isRecording=false;state.speakingTranscript=$('#el9Transcript')?.value.trim()||state.speakingTranscript;sync();renderSpeaking()}
  function wrapPersonalLibrary(page,hub){
    const grid=page.querySelector('.english-grid');if(!grid||grid.closest('#el9PersonalLibrary'))return;
    const details=document.createElement('details');details.id='el9PersonalLibrary';details.className='el7-accordion';details.innerHTML='<summary><div class="el7-summary-left"><div class="el7-summary-icon">☰</div><div class="el7-summary-copy"><b>مكتبتك وكورساتك</b><span>My Words · Writing · Grammar notes · Courses</span></div></div><span class="el7-chevron">⌄</span></summary><div class="el7-panel"></div>';
    hub.insertAdjacentElement('afterend',details);details.querySelector('.el7-panel').append(grid);
  }
  function mount(){
    const page=$('#page-english');if(!page)return false;if(page.dataset.el9)return true;page.dataset.el9='1';page.classList.remove('el6-hidden-old-writing');
    const anchor=page.querySelector('.english-kpis')||page.querySelector('header'),hub=document.createElement('section');hub.className='el6-hub el9-hub';hub.innerHTML=`
      <div class="el6-hero"><div><div class="el6-eyebrow">SERAG ENGLISH · GENERAL + PROFESSIONAL</div><h3>اتكلم طبيعي في الحياة، وواثق في الشغل.</h3><p>General English، شغل وشركات، HR، مقابلات، Marketing، Slang وIdioms — والجرافيك جزء صغير فقط.</p></div><div class="el6-stats"><div class="el6-stat"><strong id="el9TodayPct">0%</strong><span>Today</span></div><div class="el6-stat"><strong id="el9Xp">0 XP</strong><span>Daily XP</span></div><div class="el6-stat"><strong>${data.vocabulary.length}</strong><span>Useful words</span></div></div></div>
      <nav class="card el9-today-nav" aria-label="English tools"><button data-jump="el9Mission">Today</button><button data-jump="el9Speaking">Speaking</button><button data-jump="el9Grammar">Grammar</button><button data-jump="el9VideoDetails">PlayLingo</button><button data-jump="el9WordBankWrap">Word Bank</button></nav>
      <div class="el6-grid"><section class="card el6-span4" id="el9Mission"></section><section class="card el6-span8" id="el9Words"><div class="el9-card-head"><div><div class="el6-eyebrow">WORDS OF THE DAY</div><h3>كلمات النهارده</h3></div><span id="el9WordsCount" class="el9-pill"></span></div><p class="el6-muted">خليط مقصود من الحياة والشغل واللغة الطبيعية، مع مثال وسياق لكل كلمة.</p><div id="el9WordsList" class="el9-daily-words"></div></section></div>
      <div class="el6-grid"><section class="card el6-span5" id="el9Quiz"></section><section class="card el6-span7" id="el9Article"></section></div>
      <section class="card" id="el9Speaking"></section>
      <details class="el7-accordion" id="el9Grammar"><summary><div class="el7-summary-left"><div class="el7-summary-icon">Aa</div><div class="el7-summary-copy"><b>Grammar Lab</b><span>قاعدة يومية + تطبيق وتصحيح، ثم المسار الكامل</span></div></div><span class="el7-chevron">⌄</span></summary><div class="el7-panel" id="el9GrammarBody"></div></details>
      <details class="el7-accordion" id="el9VideoDetails"><summary><div class="el7-summary-left"><div class="el7-summary-icon">▶</div><div class="el7-summary-copy"><b>Learn from Video</b><span>تدريب Immersion مستوحى من PlayLingo على أي فيديو YouTube</span></div></div><span class="el7-chevron">⌄</span></summary><div class="el7-panel" id="el9VideoContent"></div></details>
      <details class="el7-accordion" id="el9WordBankWrap"><summary><div class="el7-summary-left"><div class="el7-summary-icon">W</div><div class="el7-summary-copy"><b>Word Bank by Topic</b><span>Work · HR · Jobs · Marketing · Everyday · Slang · Idioms · More</span></div></div><span class="el7-chevron">⌄</span></summary><div class="el7-panel" id="el9WordBank"></div></details>
      <details class="el7-accordion" id="el9ArchiveWrap"><summary><div class="el7-summary-left"><div class="el7-summary-icon">↺</div><div class="el7-summary-copy"><b>الأيام القديمة والمراجعة</b><span>آخر 21 يوم من الكلمات والمقالات</span></div></div><span class="el7-chevron">⌄</span></summary><div class="el7-panel" id="el9Archive"></div></details>`;
    anchor.insertAdjacentElement('afterend',hub);
    wrapPersonalLibrary(page,hub);renderAll();loadSync();
    hub.addEventListener('input',e=>{
      if(e.target.id==='el9Transcript'){state.speakingTranscript=e.target.value;sync()}
      if(e.target.id==='el9GrammarPractice'){state.grammarPractice=e.target.value;state.grammarFeedback='';$('#el9GrammarAi')?.classList.add('hidden');sync()}
      if(e.target.id==='el9VideoPhrase'){state.videoPhrase=e.target.value;state.videoFeedback='';$('#el9VideoAi')?.classList.add('hidden');sync()}
      if(e.target.id==='el9VideoMeaning'){state.videoMeaning=e.target.value;sync()}
      if(e.target.id==='el9VideoNotes'){state.videoNotes=e.target.value;sync()}
    });
    hub.addEventListener('click',e=>{
      const jump=e.target.closest('[data-jump]');if(jump){const target=$('#'+jump.dataset.jump);if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({behavior:'smooth',block:'start'});return}
      const sound=e.target.closest('[data-speak]');if(sound)return speak(sound.dataset.speak);
      const save=e.target.closest('[data-save-word]');if(save)return saveWord(save.dataset.saveWord,save.dataset.meaning,save.dataset.example);
      const r=e.target.closest('.el9-reveal');if(r){if(r.dataset.reveal!==undefined){const i=Number(r.dataset.reveal);state.revealed=state.revealed.includes(i)?state.revealed.filter(x=>x!==i):[...state.revealed,i];if(state.revealed.length>=10)complete(0);else sync();renderWords()}else r.classList.toggle('revealed');return}
      const qa=e.target.closest('[data-quiz-answer]');if(qa&&!answered){answered=true;const ok=qa.dataset.quizAnswer===qa.dataset.correct;qa.classList.add(ok?'correct':'wrong');qa.closest('.el9-quiz-options')?.querySelectorAll('button').forEach(x=>{if(x.dataset.quizAnswer===qa.dataset.correct)x.classList.add('correct')});state.answers++;if(ok){score++;state.correct++}sync();if(state.answers>=10)complete(1);setTimeout(()=>{gameIndex=(gameIndex+1)%10;answered=false;renderQuiz()},850);return}
      if(e.target.closest('[data-read-article]'))return speak(dailyArticle().text);
      if(e.target.closest('[data-article-done]'))return complete(2);
      if(e.target.closest('[data-check-article]')){const answer=$('#el9ArticleAnswer').value.trim();$('#el9ArticleFeedback').textContent=answer?'Model answer: '+dailyArticle().answer:'اكتب إجابة قصيرة الأول.';if(answer)complete(2);return}
      const gc=e.target.closest('[data-grammar-choice]');if(gc){const ok=gc.dataset.grammarChoice===gc.dataset.correct;gc.classList.add(ok?'correct':'wrong');$('#el9GrammarResult').textContent=ok?'Correct ✓':'الصحيح: '+gc.dataset.correct;if(ok)complete(3);return}
      if(e.target.closest('[data-grammar-ai]')){const g=dailyGrammar();return coach('grammar',`${g.title}: ${g.rule}`,'')}
      if(e.target.closest('[data-grammar-check-writing]')){const g=dailyGrammar(),answer=$('#el9GrammarPractice').value.trim();if(!answer)return toast?.('اكتب جملة الأول');state.grammarPractice=answer;return coach('grammar',`${g.title}: ${g.rule}`,answer)}
      const gf=e.target.closest('[data-grammar-filter]');if(gf){grammarFilter=gf.dataset.grammarFilter;renderGrammar();return}
      if(e.target.closest('[data-speak-prompt]'))return speak(dailySpeaking(today(),state.speakingPromptOffset||0).prompt,.84);
      if(e.target.closest('[data-next-speaking]')){state.speakingPromptOffset=((state.speakingPromptOffset||0)+1)%data.speaking.length;state.speakingTranscript='';state.speakingFeedback='';sync();renderSpeaking();return}
      if(e.target.closest('[data-record]'))return startRecording();
      if(e.target.closest('[data-stop-record]'))return stopRecording();
      if(e.target.closest('[data-speak-answer]'))return state.speakingTranscript?speak(state.speakingTranscript,.84):toast?.('اتكلم أو اكتب إجابتك الأول');
      if(e.target.closest('[data-speaking-feedback]')){state.speakingTranscript=$('#el9Transcript').value.trim();if(!state.speakingTranscript)return toast?.('اتكلم أو اكتب إجابتك الأول');return coach('speaking',dailySpeaking(today(),state.speakingPromptOffset||0).prompt,state.speakingTranscript)}
      if(e.target.closest('[data-load-video]')){state.videoUrl=$('#el9VideoUrl').value.trim();sync();renderVideo();return}
      if(e.target.closest('[data-video-explain]'))return state.videoPhrase?coach('video','Explain this real English line in context, including any slang, idiom, grammar or connected speech.',state.videoPhrase):toast?.('اكتب الجملة اللي سمعتها الأول');
      if(e.target.closest('[data-video-listen]'))return state.videoPhrase?speak(state.videoPhrase,.78):toast?.('اكتب الجملة اللي سمعتها الأول');
      if(e.target.closest('[data-video-save]'))return state.videoPhrase?saveWord(state.videoPhrase,state.videoMeaning,'Saved from video practice'):toast?.('اكتب الجملة الأول');
      if(e.target.closest('[data-video-done]')){complete(5);toast?.('Video practice completed ✓');return}
    });
    return true;
  }
  let attempts=0,timer=setInterval(()=>{attempts++;if(mount()||attempts>35)clearInterval(timer)},350);
})();
