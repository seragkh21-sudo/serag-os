(()=>{
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dayKey=()=>new Date().toISOString().slice(0,10);
  const stateKey='seragEnglishV6';
  const readState=()=>{try{return JSON.parse(localStorage.getItem(stateKey)||'{}')}catch{return {}}};
  const writeState=s=>localStorage.setItem(stateKey,JSON.stringify(s));

  const articles=[
    {title:'Why Good Feedback Makes Design Better',level:'B1',time:'4 min',topic:'Design & Clients',words:[['revision','تعديل جديد على التصميم'],['specific','محدد وواضح'],['feedback','ملاحظات أو رأي على العمل'],['clarify','يوضح'],['deadline','موعد التسليم النهائي']],text:`A strong design rarely appears after the first draft. In professional work, feedback is part of the process. The problem is not feedback itself, but unclear feedback. A client may say, “Make it more premium,” but that sentence can mean many things. A designer needs to clarify the goal, the audience, and the message before making another revision. Specific feedback saves time for both sides and makes the final design stronger. It also helps the designer protect the deadline because fewer unnecessary changes are needed.`,qs:[['What is the main problem mentioned in the article?',['Feedback is always bad','Unclear feedback','Clients never know what they want'],1],['What should a designer clarify?',['The goal, audience and message','Only the color','Only the deadline'],0]]},
    {title:'How Motion Designers Guide Attention',level:'B1',time:'4 min',topic:'Motion Graphics',words:[['emphasis','تأكيد أو إبراز'],['timing','توقيت الحركة'],['transition','انتقال بين مشهدين أو حالتين'],['hierarchy','تسلسل بصري حسب الأهمية'],['subtle','هادئ وغير مبالغ فيه']],text:`Motion design is not only about making objects move. Its real purpose is to guide attention. Timing, scale and contrast tell the viewer what to notice first. A subtle transition can connect two ideas without distracting the audience. Strong hierarchy is also important: the most important message should receive the clearest emphasis. When every element moves at the same time, the composition can feel noisy. Good motion designers decide what should move, when it should move, and why.`,qs:[['What is the main purpose of motion design here?',['To add as many effects as possible','To guide attention','To make videos longer'],1],['What happens when everything moves at once?',['The composition may feel noisy','The hierarchy becomes clearer','The video exports faster'],0]]},
    {title:'Presenting a Creative Idea to a Client',level:'B1-B2',time:'5 min',topic:'Client Communication',words:[['objective','الهدف'],['rationale','المنطق وراء القرار'],['proposal','مقترح'],['concise','مختصر وواضح'],['align','يتوافق']],text:`When you present a creative idea, do not only show the final visual. Explain the thinking behind it. Start with the client’s objective, then connect your design decisions to that objective. This gives the client a clear rationale instead of a personal opinion. Keep the explanation concise and focus on the strongest idea first. If the proposal does not fully align with the brief, explain what changed and why. Professional communication makes creative work easier to approve because the client understands the logic behind the design.`,qs:[['What should you start with?',['The client objective','Your software settings','Your favorite style'],0],['Why explain the rationale?',['To make the file larger','To connect decisions to the goal','To avoid showing the work'],1]]},
    {title:'Why Every Animation Needs a Clear Purpose',level:'B1',time:'4 min',topic:'Animation',words:[['purpose','غرض أو هدف'],['anticipation','تهيئة المشاهد للحركة'],['pace','سرعة إيقاع المشهد'],['sequence','تسلسل'],['distract','يشتت']],text:`Animation becomes more effective when every movement has a purpose. A small anticipation can prepare the viewer for an action. A faster pace can create energy, while a slower sequence can make a moment feel more important. Problems begin when movement is added only because it looks impressive. Extra animation can distract from the message. Before animating an element, ask one question: what does this movement help the viewer understand?`,qs:[['What can anticipation do?',['Prepare the viewer','Delete a scene','Reduce resolution'],0],['What question should you ask before animating?',['What does this movement help the viewer understand?','Which plugin is expensive?','How many layers can I add?'],0]]},
    {title:'Handling Client Revisions Professionally',level:'B1-B2',time:'5 min',topic:'Freelance English',words:[['scope','نطاق العمل'],['request','طلب'],['priority','أولوية'],['approve','يوافق'],['deliverable','الملف أو العمل المطلوب تسليمه']],text:`Client revisions are easier when the scope is clear from the beginning. If a new request changes the original deliverable, explain the impact on time and cost before starting the work. Ask which changes are the highest priority and confirm them in writing. This does not make you difficult to work with. It makes the process professional. When the client approves a clear list of revisions, both sides know what will happen next.`,qs:[['What should happen if a request changes the scope?',['Ignore it','Explain the time and cost impact','Do all changes immediately'],1],['Why confirm changes in writing?',['So both sides know what happens next','To make the email longer','To avoid priorities'],0]]}
  ];

  const vocab=[
    ['brief','ملخص ومتطلبات المشروع'],['deliverable','الملف/النتيجة المطلوبة'],['revision','تعديل'],['feedback','ملاحظات'],['deadline','موعد نهائي'],['layout','توزيع العناصر'],['hierarchy','التسلسل البصري'],['composition','التكوين'],['alignment','المحاذاة'],['spacing','المسافات'],['contrast','التباين'],['legibility','سهولة القراءة'],['typeface','نوع الخط'],['kerning','المسافة بين الحروف'],['mockup','عرض تجريبي للتصميم'],['storyboard','تخطيط بصري للمشاهد'],['keyframe','نقطة حركة أساسية'],['easing','تسارع/تباطؤ الحركة'],['transition','انتقال'],['motion blur','تمويه الحركة'],['frame rate','معدل الإطارات'],['render','إخراج نهائي'],['export','تصدير'],['footage','مادة الفيديو الخام'],['mask','قناع'],['tracking','تتبع'],['compositing','دمج العناصر بصريًا'],['seamless','سلس بدون قطع واضح'],['subtle','هادئ وغير مبالغ'],['polished','مصقول واحترافي'],['refine','يحسن ويصقل'],['iterate','يكرر ويحسن نسخة بعد نسخة'],['approve','يوافق'],['scope','نطاق العمل'],['proposal','مقترح'],['reference','مرجع بصري'],['brand guideline','دليل الهوية'],['visual direction','الاتجاه البصري'],['call to action','دعوة لاتخاذ إجراء'],['aspect ratio','نسبة أبعاد الفيديو']
  ];

  const grammar=[
    {title:'Present Simple — routines & facts',rule:'Use it for repeated work habits, facts and standard processes.',ex:'I usually send the first draft before the client meeting.'},
    {title:'Present Continuous — work happening now',rule:'Use it for something happening now or around the current period.',ex:'I am refining the animation because the client is reviewing the previous version.'},
    {title:'Past Simple — finished actions',rule:'Use it for completed actions at a finished time.',ex:'I exported the final video yesterday and sent it to the client.'},
    {title:'Present Perfect — recent result / experience',rule:'Use it when the result matters now or the time is not finished/specified.',ex:'The client has requested three revisions, so I need to update the storyboard.'},
    {title:'Future: will vs going to',rule:'Use going to for plans; will often for instant decisions, promises or predictions.',ex:'I am going to redesign the intro. I will send you the new version tonight.'},
    {title:'Modal verbs — can, could, should, must',rule:'Use modals for ability, polite requests, advice and necessity.',ex:'Could you send me the brand guidelines? We should keep the animation subtle.'},
    {title:'Conditionals — client scenarios',rule:'Use if-clauses to talk about results, possibilities and hypothetical situations.',ex:'If the client approves the storyboard today, we can start animation tomorrow.'},
    {title:'Passive Voice — process language',rule:'Use passive when the action/result matters more than who did it.',ex:'The final files will be delivered in 4K and the logo will be exported separately.'},
    {title:'Comparatives — presenting options',rule:'Use comparatives to explain why one creative option is stronger than another.',ex:'This layout is cleaner and more readable than the previous version.'},
    {title:'Polite professional requests',rule:'Use softeners to sound collaborative instead of demanding.',ex:'Would you mind sharing a higher-resolution version of the logo?'}
  ];

  const roadmap=[
    ['Foundation reset','CEFR A1–A2 essentials','British Council + Cambridge: core grammar, everyday vocabulary, short listening and reading.'],
    ['Independent English','CEFR B1','Build practical sentence patterns, reading comprehension and conversation.'],
    ['Work & client English','Professional communication','Emails, meetings, briefs, feedback, calls and presentations.'],
    ['Design English','Graphic & motion vocabulary','Use industry vocabulary in real sentences, briefs and revision conversations.'],
    ['Speaking upgrade','Pronunciation & fluency','Shadowing, self-recording, stress, intonation and short client-style answers.'],
    ['Upper-intermediate','CEFR B2','Explain decisions, defend ideas, discuss trade-offs and understand longer content.'],
    ['Advanced work English','B2→C1','Negotiation, nuanced feedback, presentations and confident spontaneous speaking.']
  ];

  const todayArticle=()=>articles[(new Date().getDate()-1)%articles.length];
  function speak(t){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=.9;speechSynthesis.speak(u)}
  async function saveWord(w,m,ex=''){
    if(typeof sb==='undefined'||typeof user==='undefined'||!user?.id)return window.toast?.('سجل دخولك الأول');
    try{const {error}=await sb.from('english_words').insert({user_id:user.id,word:w,meaning:m,example:ex,status:'learning'});if(error)throw error;window.toast?.('الكلمة اتضافت لـ My Words')}catch(e){window.toast?.(e.message||'مقدرتش أحفظ الكلمة')}
  }

  function missionState(){const s=readState();if(s.date!==dayKey())return {date:dayKey(),steps:[false,false,false,false,false],xp:0};return s}
  function setStep(i){const s=missionState();s.steps[i]=true;s.xp=s.steps.filter(Boolean).length*20;writeState(s);renderMission()}
  function renderMission(){
    const s=missionState(),done=s.steps.filter(Boolean).length,pct=done*20;
    const host=$('#el6Mission');if(!host)return;
    const names=['Learn 5 words','Play quick game','Read today’s article','Answer the quiz','Review one grammar rule'];
    host.innerHTML=`<h4>Today’s Mission</h4><div class="el6-muted">15 minutes. Small, focused, and connected to your real work.</div><div class="el6-progress"><i style="width:${pct}%"></i></div><div class="el6-steps">${names.map((n,i)=>`<div class="el6-step ${s.steps[i]?'done':i===done?'current':''}"><span class="el6-dot">${s.steps[i]?'✓':i+1}</span><b>${n}</b></div>`).join('')}</div>`;
    $('#el6Xp').textContent=s.xp+' XP';$('#el6MissionPct').textContent=pct+'%';
  }

  function renderArticle(){
    const a=todayArticle();
    $('#el6Article').innerHTML=`<div class="el6-eyebrow">Daily Reading</div><h4 class="el6-article-title">${esc(a.title)}</h4><div class="el6-tags"><span class="el6-tag">${a.level}</span><span class="el6-tag">${a.time}</span><span class="el6-tag">${esc(a.topic)}</span></div><div class="el6-muted">Key vocabulary first</div>${a.words.map(([w,m])=>`<div class="el6-vocab-row"><div><strong>${esc(w)}</strong><small>${esc(m)}</small></div><div><button class="el6-btn tiny secondary" data-speak="${esc(w)}">🔊</button> <button class="el6-btn tiny secondary" data-save-word="${esc(w)}" data-meaning="${esc(m)}">+ Save</button></div></div>`).join('')}<div class="el6-article">${esc(a.text)}</div><button class="el6-btn secondary" data-read-article>🔊 Read article</button><div id="el6Quiz">${a.qs.map((q,qi)=>`<div class="el6-question"><strong>${qi+1}. ${esc(q[0])}</strong><div class="el6-options">${q[1].map((o,oi)=>`<button class="el6-option" data-q="${qi}" data-o="${oi}">${esc(o)}</button>`).join('')}</div></div>`).join('')}</div>`;
  }

  let gameIndex=0,gameScore=0;
  function renderGame(){
    const pool=vocab.slice(0,20),item=pool[gameIndex%pool.length],wrong=pool.filter(x=>x[0]!==item[0]).sort(()=>Math.random()-.5).slice(0,3),opts=[item,...wrong].sort(()=>Math.random()-.5);
    $('#el6Game').innerHTML=`<div class="el6-game-box"><div class="el6-muted">Choose the meaning</div><div class="el6-game-word">${esc(item[0])}</div><div class="el6-game-hint">Graphic & Motion English</div><div class="el6-game-options">${opts.map(x=>`<button class="el6-game-choice" data-game-choice="${esc(x[0])}" data-correct="${esc(item[0])}">${esc(x[1])}</button>`).join('')}</div><div class="el6-score">Score: ${gameScore}</div></div>`;
  }

  function mount(){
    const page=$('#page-english');if(!page||page.dataset.el6)return false;page.dataset.el6='1';page.classList.add('el6-hidden-old-writing');
    if(!document.querySelector('link[href="/english-learning-v6.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/english-learning-v6.css';document.head.appendChild(l)}
    const anchor=page.querySelector('.english-kpis')||page.querySelector('header');
    const hub=document.createElement('section');hub.className='el6-hub';hub.innerHTML=`
      <div class="el6-hero"><div><div class="el6-eyebrow">Serag English Path · CEFR + Creative Work</div><h3>English that helps you work, not just pass lessons.</h3><p>Daily reading, grammar in context, client communication, graphic & motion vocabulary, and short game-based reviews.</p></div><div class="el6-stats"><div class="el6-stat"><strong id="el6MissionPct">0%</strong><span>today</span></div><div class="el6-stat"><strong id="el6Xp">0 XP</strong><span>earned</span></div><div class="el6-stat"><strong>B1→B2</strong><span>target path</span></div></div></div>
      <div class="el6-tabs"><button class="el6-tab active" data-el6-tab="today">Today</button><button class="el6-tab" data-el6-tab="path">Learning Path</button><button class="el6-tab" data-el6-tab="words">Design Vocabulary</button><button class="el6-tab" data-el6-tab="grammar">Grammar in Context</button><button class="el6-tab" data-el6-tab="game">Quick Game</button></div>
      <div class="el6-panel active" data-el6-panel="today"><div class="el6-grid"><div class="el6-card el6-span4" id="el6Mission"></div><div class="el6-card el6-span8" id="el6Article"></div></div></div>
      <div class="el6-panel" data-el6-panel="path"><div class="el6-grid"><div class="el6-card el6-span8"><h4>Your roadmap</h4><div class="el6-muted">Inspired by CEFR structure from British Council/Cambridge, then specialized for professional creative communication.</div><div class="el6-roadmap">${roadmap.map((r,i)=>`<div class="el6-roadmap-item"><span class="num">${i+1}</span><div><strong>${esc(r[0])}</strong><small>${esc(r[1])} · ${esc(r[2])}</small></div><span class="el6-tag">${i<2?'Core':i<5?'Work':'Advanced'}</span></div>`).join('')}</div></div><div class="el6-card el6-span4"><h4>Reference courses</h4><div class="el6-muted">British Council LearnEnglish · Cambridge English activities · Georgia Tech “Improve Your English Communication Skills” · BBC Learning English speaking/pronunciation practice.</div><div class="el6-grammar-card"><strong>Rule for Serag OS</strong><code>Every general grammar topic must include at least one design/client example.</code></div></div></div></div>
      <div class="el6-panel" data-el6-panel="words"><div class="el6-card"><h4>Graphic & Motion Vocabulary</h4><div class="el6-muted">Click any word to hear it. Save the useful ones to My Words.</div><div class="el6-word-cloud">${vocab.map(([w,m])=>`<button class="el6-word" data-word-card="${esc(w)}" data-meaning="${esc(m)}"><strong>${esc(w)}</strong><span>${esc(m)}</span></button>`).join('')}</div></div></div>
      <div class="el6-panel" data-el6-panel="grammar"><div class="el6-grid">${grammar.map((g,i)=>`<div class="el6-card el6-span6"><div class="el6-eyebrow">Grammar ${i+1}</div><h4>${esc(g.title)}</h4><div class="el6-muted">${esc(g.rule)}</div><div class="el6-grammar-card"><strong>Creative-work example</strong><code>${esc(g.ex)}</code><button class="el6-btn tiny secondary" data-speak="${esc(g.ex)}">🔊 Listen</button> <button class="el6-btn tiny secondary" data-grammar-done="${i}">Mark reviewed</button></div></div>`).join('')}</div></div>
      <div class="el6-panel" data-el6-panel="game"><div class="el6-card" id="el6Game"></div></div>
      <div class="el6-tools-label">Your existing English library & tools</div>`;
    anchor.insertAdjacentElement('afterend',hub);
    renderMission();renderArticle();renderGame();bind(page);return true;
  }

  function bind(page){
    page.addEventListener('click',async e=>{
      const tab=e.target.closest('[data-el6-tab]');if(tab){page.querySelectorAll('[data-el6-tab]').forEach(x=>x.classList.toggle('active',x===tab));page.querySelectorAll('[data-el6-panel]').forEach(x=>x.classList.toggle('active',x.dataset.el6Panel===tab.dataset.el6Tab));return}
      const sp=e.target.closest('[data-speak]');if(sp){speak(sp.dataset.speak);return}
      if(e.target.closest('[data-read-article]')){speak(todayArticle().text);setStep(2);return}
      const sw=e.target.closest('[data-save-word]');if(sw){await saveWord(sw.dataset.saveWord,sw.dataset.meaning);setStep(0);return}
      const wc=e.target.closest('[data-word-card]');if(wc){speak(wc.dataset.wordCard);await saveWord(wc.dataset.wordCard,wc.dataset.meaning);setStep(0);return}
      const qo=e.target.closest('[data-q]');if(qo){const a=todayArticle(),correct=a.qs[+qo.dataset.q][2],box=qo.parentElement;box.querySelectorAll('.el6-option').forEach(x=>{x.disabled=true;if(+x.dataset.o===correct)x.classList.add('correct')});if(+qo.dataset.o!==correct)qo.classList.add('wrong');const all=[...$('#el6Quiz').querySelectorAll('.el6-question')].every(q=>[...q.querySelectorAll('.el6-option')].some(x=>x.disabled));if(all)setStep(3);return}
      const gd=e.target.closest('[data-grammar-done]');if(gd){setStep(4);window.toast?.('Grammar reviewed ✓');return}
      const gc=e.target.closest('[data-game-choice]');if(gc){if(gc.dataset.gameChoice===gc.dataset.correct){gameScore++;gc.classList.add('correct')}else gc.classList.add('wrong');gameIndex++;setStep(1);setTimeout(renderGame,380);return}
    });
  }

  if(!mount()){
    const obs=new MutationObserver(()=>{if(mount())obs.disconnect()});obs.observe(document.documentElement,{subtree:true,childList:true});setTimeout(()=>obs.disconnect(),15000);
  }
})();