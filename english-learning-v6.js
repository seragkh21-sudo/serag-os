(()=>{
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dayKey=()=>new Date().toISOString().slice(0,10);
  const stateKey='seragEnglishV7';
  const readState=()=>{try{return JSON.parse(localStorage.getItem(stateKey)||'{}')}catch{return {}}};
  const writeState=s=>localStorage.setItem(stateKey,JSON.stringify(s));

  const articles=[
    {title:'Why Good Feedback Makes Design Better',level:'B1',time:'4 min',topic:'Design & Clients',words:[['revision','تعديل على التصميم'],['specific','محدد وواضح'],['feedback','ملاحظات على العمل'],['clarify','يوضّح'],['deadline','موعد التسليم النهائي']],text:`A strong design rarely appears after the first draft. In professional work, feedback is part of the process. The problem is not feedback itself, but unclear feedback. A client may say, “Make it more premium,” but that sentence can mean many things. A designer needs to clarify the goal, the audience, and the message before making another revision. Specific feedback saves time for both sides and makes the final design stronger. It also helps the designer protect the deadline because fewer unnecessary changes are needed.`,qs:[['What is the main problem mentioned in the article?',['Feedback is always bad','Unclear feedback','Clients never know what they want'],1],['What should a designer clarify?',['The goal, audience and message','Only the color','Only the deadline'],0]]},
    {title:'How Motion Designers Guide Attention',level:'B1',time:'4 min',topic:'Motion Graphics',words:[['emphasis','إبراز'],['timing','توقيت الحركة'],['transition','انتقال'],['hierarchy','تسلسل بصري'],['subtle','هادئ وغير مبالغ فيه']],text:`Motion design is not only about making objects move. Its real purpose is to guide attention. Timing, scale and contrast tell the viewer what to notice first. A subtle transition can connect two ideas without distracting the audience. Strong hierarchy is also important: the most important message should receive the clearest emphasis. When every element moves at the same time, the composition can feel noisy. Good motion designers decide what should move, when it should move, and why.`,qs:[['What is the main purpose of motion design here?',['To add as many effects as possible','To guide attention','To make videos longer'],1],['What happens when everything moves at once?',['The composition may feel noisy','The hierarchy becomes clearer','The video exports faster'],0]]},
    {title:'Presenting a Creative Idea to a Client',level:'B1-B2',time:'5 min',topic:'Client Communication',words:[['objective','الهدف'],['rationale','المنطق وراء القرار'],['proposal','مقترح'],['concise','مختصر وواضح'],['align','يتوافق']],text:`When you present a creative idea, do not only show the final visual. Explain the thinking behind it. Start with the client’s objective, then connect your design decisions to that objective. This gives the client a clear rationale instead of a personal opinion. Keep the explanation concise and focus on the strongest idea first. If the proposal does not fully align with the brief, explain what changed and why. Professional communication makes creative work easier to approve because the client understands the logic behind the design.`,qs:[['What should you start with?',['The client objective','Your software settings','Your favorite style'],0],['Why explain the rationale?',['To make the file larger','To connect decisions to the goal','To avoid showing the work'],1]]},
    {title:'Handling Client Revisions Professionally',level:'B1-B2',time:'5 min',topic:'Freelance English',words:[['scope','نطاق العمل'],['request','طلب'],['priority','أولوية'],['approve','يوافق'],['deliverable','العمل المطلوب تسليمه']],text:`Client revisions are easier when the scope is clear from the beginning. If a new request changes the original deliverable, explain the impact on time and cost before starting the work. Ask which changes are the highest priority and confirm them in writing. This does not make you difficult to work with. It makes the process professional. When the client approves a clear list of revisions, both sides know what will happen next.`,qs:[['What should happen if a request changes the scope?',['Ignore it','Explain the time and cost impact','Do all changes immediately'],1],['Why confirm changes in writing?',['So both sides know what happens next','To make the email longer','To avoid priorities'],0]]}
  ];

  const vocab=[
    ['brief','ملخص ومتطلبات المشروع'],['deliverable','النتيجة المطلوبة'],['revision','تعديل'],['feedback','ملاحظات'],['deadline','موعد نهائي'],['layout','توزيع العناصر'],['hierarchy','التسلسل البصري'],['composition','التكوين'],['alignment','المحاذاة'],['spacing','المسافات'],['contrast','التباين'],['legibility','سهولة القراءة'],['typeface','نوع الخط'],['kerning','المسافة بين الحروف'],['mockup','عرض تجريبي'],['storyboard','تخطيط بصري للمشاهد'],['keyframe','نقطة حركة أساسية'],['easing','تسارع وتباطؤ الحركة'],['transition','انتقال'],['motion blur','تمويه الحركة'],['frame rate','معدل الإطارات'],['render','إخراج نهائي'],['export','تصدير'],['footage','مادة الفيديو الخام'],['mask','قناع'],['tracking','تتبع'],['compositing','دمج العناصر بصريًا'],['seamless','سلس'],['subtle','هادئ وغير مبالغ'],['polished','مصقول واحترافي'],['refine','يصقل ويحسن'],['iterate','يطور نسخة بعد نسخة'],['approve','يوافق'],['scope','نطاق العمل'],['proposal','مقترح'],['reference','مرجع بصري'],['brand guidelines','دليل الهوية'],['visual direction','الاتجاه البصري'],['call to action','دعوة لاتخاذ إجراء'],['aspect ratio','نسبة الأبعاد'],['resolution','الدقة'],['color palette','لوحة الألوان'],['visual balance','التوازن البصري'],['negative space','المساحة السلبية'],['pace','إيقاع الحركة'],['anticipation','تهيئة للحركة'],['overshoot','تجاوز بسيط للحركة'],['loop','حركة متكررة'],['asset','عنصر/ملف مستخدم'],['source file','الملف الأصلي القابل للتعديل'],['rough cut','نسخة مونتاج أولية'],['final cut','النسخة النهائية'],['voice-over','تعليق صوتي'],['caption','نص/وصف مصاحب'],['lower third','شريط معلومات سفلي'],['client-facing','مناسب للعرض على العميل'],['on-brand','متوافق مع الهوية'],['off-brand','غير متوافق مع الهوية'],['turnaround time','مدة التنفيذ'],['scope creep','زيادة غير مخططة في نطاق العمل'],['stakeholder','صاحب مصلحة/قرار'],['approval','اعتماد'],['amendment','تعديل رسمي'],['reference board','لوحة مراجع'],['visual treatment','المعالجة البصرية']
  ];

  const grammar=[
    {title:'Present Simple',why:'للعادات والـworkflow المتكرر.',rule:'Use the base verb for routines and facts.',ex:'I usually send the first draft before the client meeting.',task:'Describe your normal design workflow in 3 sentences.'},
    {title:'Present Continuous',why:'للشغل الجاري الآن.',rule:'am/is/are + verb-ing.',ex:'I am refining the animation because the client is reviewing the previous version.',task:'Say what you are working on this week.'},
    {title:'Past Simple',why:'لما تحكي عمل خلص في وقت محدد.',rule:'Use past forms with finished time expressions.',ex:'I exported the final video yesterday and sent it to the client.',task:'Explain what you finished yesterday.'},
    {title:'Present Perfect',why:'للنتيجة الحالية والخبرة.',rule:'have/has + past participle.',ex:'The client has requested three revisions, so I need to update the storyboard.',task:'Write 2 things you have completed this week.'},
    {title:'Future: will / going to',why:'للتخطيط والوعود والمواعيد.',rule:'going to = plan; will = promise/decision/prediction.',ex:'I am going to redesign the intro. I will send you the new version tonight.',task:'Tell a client what you plan to do next.'},
    {title:'Modal verbs',why:'للـrequests والنصيحة والضرورة.',rule:'can, could, should, must + base verb.',ex:'Could you send me the brand guidelines? We should keep the animation subtle.',task:'Turn 3 direct requests into polite client requests.'},
    {title:'Conditionals',why:'لشرح النتائج والسيناريوهات.',rule:'If + condition, result.',ex:'If the client approves the storyboard today, we can start animation tomorrow.',task:'Write 3 if-sentences about a project deadline.'},
    {title:'Passive Voice',why:'للـprocess والـdeliverables.',rule:'be + past participle.',ex:'The final files will be delivered in 4K and the logo will be exported separately.',task:'Describe your delivery process using passive voice.'},
    {title:'Comparatives',why:'للدفاع عن اختيار تصميمي.',rule:'Use -er / more + adjective + than.',ex:'This layout is cleaner and more readable than the previous version.',task:'Compare two design directions.'},
    {title:'Polite professional requests',why:'للتعامل مع العملاء بدون نبرة حادة.',rule:'Could you…? Would you mind…? Would it be possible to…?',ex:'Would you mind sharing a higher-resolution version of the logo?',task:'Rewrite 3 client messages in a softer tone.'},
    {title:'Relative clauses',why:'لوصف عناصر أو أفكار بدقة.',rule:'who / which / that connect extra information.',ex:'The version that uses slower easing feels more premium.',task:'Describe 3 assets using that/which.'},
    {title:'Reported speech',why:'لنقل feedback من اجتماع للفريق.',rule:'He said that… / She asked us to…',ex:'The client said that the intro felt too busy and asked us to simplify it.',task:'Report 3 pieces of client feedback.'}
  ];

  const curriculum=[
    {phase:'01',title:'Foundation Reset',level:'A1–A2',goal:'سد أي فراغات في الأساس بسرعة من غير الرجوع للصفر.',focus:['Core sentence structure','Present / past / future basics','Essential everyday vocabulary','Short listening + pronunciation'],source:'Perfectly Spoken / Lingu English + British Council / Cambridge style progression'},
    {phase:'02',title:'Independent English',level:'B1',goal:'تقدر تقرأ وتتكلم وتكتب في مواقف يومية وشغل بسيطة.',focus:['Reading comprehension','Useful sentence patterns','Vocabulary in context','Short speaking answers'],source:'CEFR B1 progression + Daily Mission'},
    {phase:'03',title:'Work & Client English',level:'B1–B2',goal:'تتعامل مع عميل بالإنجليزي بثقة.',focus:['Emails & chat','Briefs','Meetings','Feedback & revisions','Deadlines','Presenting ideas'],source:'Business English + professional speaking practice'},
    {phase:'04',title:'Graphic & Motion English',level:'Specialized',goal:'المصطلحات اللي بتستخدمها فعلًا تبقى جزء من لغتك.',focus:['Design vocabulary','Motion vocabulary','Creative direction','Production workflow','Client terminology'],source:'Personalized creative-industry vocabulary bank'},
    {phase:'05',title:'Speaking Upgrade',level:'B1→B2',goal:'تقلل الترجمة في دماغك وتحسن النطق والطلاقة.',focus:['Shadowing','Self-recording','Stress','Intonation','Client-style answers'],source:'Pronunciation practice + AI/self feedback'},
    {phase:'06',title:'Upper Intermediate',level:'B2',goal:'تشرح وتدافع عن أفكارك وتفهم محتوى أطول.',focus:['Explain rationale','Discuss trade-offs','Longer listening','Natural collocations','Professional writing'],source:'CEFR B2 + work scenarios'},
    {phase:'07',title:'Advanced Work English',level:'B2→C1',goal:'تتكلم تلقائيًا في تفاوض وعروض ومناقشات معقدة.',focus:['Negotiation','Nuanced feedback','Presentations','Spontaneous speaking','Advanced vocabulary'],source:'C1-oriented professional practice'}
  ];

  const courseStack=[
    {name:'Perfectly Spoken / Lingu English',role:'Main structured course',use:'A1–C2 self-study, live classes, speaking/conversation, vocabulary, grammar, Business English, AI speaking/writing feedback, progress tests and teacher-corrected tasks.',priority:'Primary'},
    {name:'British Council LearnEnglish',role:'Skill practice',use:'CEFR-organized Grammar, Vocabulary, Reading, Listening, Writing and Speaking practice.',priority:'Support'},
    {name:'Cambridge English',role:'Practice & level support',use:'Short activities, CEFR-aligned learning and exam-quality language practice.',priority:'Support'},
    {name:'BBC Learning English',role:'Pronunciation & natural English',use:'Pronunciation, stress, intonation, vocabulary and short listening routines.',priority:'Weekly'},
    {name:'Engoo-style reading',role:'Daily reading system',use:'Key vocabulary → short article → comprehension questions → discussion.',priority:'Daily'}
  ];

  const todayArticle=()=>articles[(new Date().getDate()-1)%articles.length];
  function speak(t){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=.88;speechSynthesis.speak(u)}
  async function saveWord(w,m,ex=''){
    if(typeof sb==='undefined'||typeof user==='undefined'||!user?.id)return window.toast?.('سجّل دخولك الأول');
    try{const {error}=await sb.from('english_words').insert({user_id:user.id,word:w,meaning:m,example:ex,status:'learning'});if(error)throw error;window.toast?.('الكلمة اتضافت لـ My Words')}catch(e){window.toast?.(e.message||'مقدرتش أحفظ الكلمة')}
  }
  function missionState(){const s=readState();if(s.date!==dayKey())return {date:dayKey(),steps:[false,false,false,false,false],xp:0};return s}
  function setStep(i){const s=missionState();s.steps[i]=true;s.xp=s.steps.filter(Boolean).length*20;writeState(s);renderMission()}
  function renderMission(){
    const s=missionState(),done=s.steps.filter(Boolean).length,pct=done*20,host=$('#el6Mission');if(!host)return;
    const names=['Learn 5 work words','Play quick game','Read today’s article','Answer the quiz','Review one grammar rule'];
    host.innerHTML=`<h4>Today’s Mission</h4><div class="el6-muted">15 minutes · English connected to your real creative work.</div><div class="el6-progress"><i style="width:${pct}%"></i></div><div class="el6-steps">${names.map((n,i)=>`<div class="el6-step ${s.steps[i]?'done':i===done?'current':''}"><span class="el6-dot">${s.steps[i]?'✓':i+1}</span><b>${n}</b></div>`).join('')}</div>`;
    $('#el6Xp').textContent=s.xp+' XP';$('#el6MissionPct').textContent=pct+'%';
  }
  function renderArticle(){
    const a=todayArticle();
    $('#el6Article').innerHTML=`<div class="el6-eyebrow">Daily Reading · Engoo-style flow</div><h4 class="el6-article-title">${esc(a.title)}</h4><div class="el6-tags"><span class="el6-tag">${a.level}</span><span class="el6-tag">${a.time}</span><span class="el6-tag">${esc(a.topic)}</span></div><div class="el6-muted">Key vocabulary first</div>${a.words.map(([w,m])=>`<div class="el6-vocab-row"><div><strong>${esc(w)}</strong><small>${esc(m)}</small></div><div><button class="el6-btn tiny secondary" data-speak="${esc(w)}">🔊</button> <button class="el6-btn tiny secondary" data-save-word="${esc(w)}" data-meaning="${esc(m)}">+ Save</button></div></div>`).join('')}<div class="el6-article">${esc(a.text)}</div><button class="el6-btn secondary" data-read-article>🔊 Read article</button><div id="el6Quiz">${a.qs.map((q,qi)=>`<div class="el6-question"><strong>${qi+1}. ${esc(q[0])}</strong><div class="el6-options">${q[1].map((o,oi)=>`<button class="el6-option" data-q="${qi}" data-o="${oi}">${esc(o)}</button>`).join('')}</div></div>`).join('')}</div>`;
  }
  let gameIndex=0,gameScore=0;
  function renderGame(){
    const item=vocab[gameIndex%vocab.length],wrong=vocab.filter(x=>x[0]!==item[0]).sort(()=>Math.random()-.5).slice(0,3),opts=[item,...wrong].sort(()=>Math.random()-.5);
    $('#el6Game').innerHTML=`<div class="el6-game-box"><div class="el6-muted">Choose the meaning</div><div class="el6-game-word">${esc(item[0])}</div><div class="el6-game-hint">Graphic · Motion · Client English</div><div class="el6-game-options">${opts.map(x=>`<button class="el6-game-choice" data-game-choice="${esc(x[0])}" data-correct="${esc(item[0])}">${esc(x[1])}</button>`).join('')}</div><div class="el6-score">Score: ${gameScore}</div></div>`;
  }
  function renderGrammar(){
    $('#el6Grammar').innerHTML=grammar.map((g,i)=>`<details class="el6-grammar-item" ${i===0?'open':''}><summary><b>${i+1}. ${esc(g.title)}</b><span>${esc(g.why)}</span></summary><div class="el6-grammar-body"><p>${esc(g.rule)}</p><div class="el6-example">${esc(g.ex)}</div><div class="el6-muted"><b>Practice:</b> ${esc(g.task)}</div><button class="el6-btn tiny secondary" data-speak="${esc(g.ex)}">🔊 Listen</button><button class="el6-btn tiny secondary" data-grammar-done="${i}">Mark reviewed</button></div></details>`).join('');
  }
  function renderVocab(){
    $('#el6Vocab').innerHTML=vocab.map(([w,m])=>`<div class="el6-vocab-row"><div><strong>${esc(w)}</strong><small>${esc(m)}</small></div><div><button class="el6-btn tiny secondary" data-speak="${esc(w)}">🔊</button><button class="el6-btn tiny secondary" data-save-word="${esc(w)}" data-meaning="${esc(m)}">+ My Words</button></div></div>`).join('');
  }
  function renderCurriculum(){
    $('#el6Roadmap').innerHTML=curriculum.map(x=>`<div class="el6-roadmap-row"><div class="el6-road-num">${x.phase}</div><div><div class="el6-tags"><span class="el6-tag">${esc(x.level)}</span></div><h4>${esc(x.title)}</h4><p>${esc(x.goal)}</p><div class="el6-muted">${x.focus.map(f=>`• ${esc(f)}`).join(' &nbsp; ')}</div><small>${esc(x.source)}</small></div></div>`).join('');
  }
  function renderCourses(){
    $('#el6Courses').innerHTML=courseStack.map(c=>`<div class="el6-vocab-row"><div><strong>${esc(c.name)}</strong><small><b>${esc(c.role)}</b> · ${esc(c.use)}</small></div><span class="el6-tag">${esc(c.priority)}</span></div>`).join('');
  }
  function mount(){
    const page=$('#page-english');if(!page)return false;if(page.dataset.el6)page.querySelector('.el6-hub')?.remove();page.dataset.el6='1';page.classList.add('el6-hidden-old-writing');
    if(!document.querySelector('link[href="/english-learning-v6.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/english-learning-v6.css';document.head.appendChild(l)}
    const anchor=page.querySelector('.english-kpis')||page.querySelector('header');
    const hub=document.createElement('section');hub.className='el6-hub';hub.innerHTML=`
      <div class="el6-hero"><div><div class="el6-eyebrow">Serag English Path · CEFR + Creative Work</div><h3>English built around your real work.</h3><p>مش كورس عشوائي: خطة من الأساس لحد B2/C1، ومحتوى Graphic/Motion، Client English، Reading، Speaking، Grammar وVocabulary في نظام واحد.</p></div><div class="el6-stats"><div class="el6-stat"><strong id="el6MissionPct">0%</strong><span>Today</span></div><div class="el6-stat"><strong id="el6Xp">0 XP</strong><span>Mission XP</span></div><div class="el6-stat"><strong>${vocab.length}</strong><span>Work words</span></div></div></div>
      <div class="el6-grid"><section class="card el6-span5" id="el6Mission"></section><section class="card el6-span7" id="el6Game"></section></div>
      <div class="el6-section-title"><div><div class="el6-eyebrow">Your Curriculum</div><h3>الخطة الكبيرة</h3><p class="el6-muted">كل جزء له هدف واضح ومصدر واستخدام عملي.</p></div></div>
      <section class="card"><div id="el6Roadmap"></div></section>
      <div class="el6-section-title"><div><div class="el6-eyebrow">Course Stack</div><h3>المصادر اللي هنستعين بيها</h3><p class="el6-muted">Perfectly Spoken / Lingu English هو المسار الأساسي، والباقي دعم حسب المهارة.</p></div></div>
      <section class="card"><div id="el6Courses"></div></section>
      <div class="el6-section-title"><div><div class="el6-eyebrow">Read · Understand · Discuss</div><h3>Daily Article</h3></div></div><section class="card" id="el6Article"></section>
      <div class="el6-grid"><section class="card el6-span6"><div class="el6-eyebrow">Grammar in your context</div><h3>Grammar Path</h3><p class="el6-muted">كل قاعدة مرتبطة بالجرافيك، الموشن، الـfeedback أو العميل.</p><div id="el6Grammar"></div></section><section class="card el6-span6"><div class="el6-eyebrow">Industry English</div><h3>Graphic & Motion Vocabulary</h3><p class="el6-muted">احفظ اللي محتاجه، اسمع نطقه، وراجعه من My Words.</p><div id="el6Vocab" style="max-height:760px;overflow:auto"></div></section></div>
      <section class="card"><div class="el6-eyebrow">Speaking Track</div><h3>من “فاهم الإنجليزي” لـ “بعرف أستخدمه”</h3><div class="el6-grid"><div class="el6-span4"><b>Shadowing</b><p class="el6-muted">اسمع جملة قصيرة وكررها بنفس الـstress والـintonation.</p></div><div class="el6-span4"><b>Client answers</b><p class="el6-muted">جاوب بصوتك على feedback وbriefs ومواعيد وتسليمات.</p></div><div class="el6-span4"><b>Self review</b><p class="el6-muted">سجل إجابتك، اسمعها، وعدّل النطق والجملة بدل الحفظ.</p></div></div></section>`;
    anchor?.insertAdjacentElement('afterend',hub);
    renderMission();renderGame();renderCurriculum();renderCourses();renderArticle();renderGrammar();renderVocab();
    hub.addEventListener('click',e=>{
      const sp=e.target.closest('[data-speak]');if(sp)return speak(sp.dataset.speak);
      const sw=e.target.closest('[data-save-word]');if(sw)return saveWord(sw.dataset.saveWord,sw.dataset.meaning||'');
      if(e.target.closest('[data-read-article]')){setStep(2);return speak(todayArticle().text)}
      const gc=e.target.closest('[data-game-choice]');if(gc){const ok=gc.dataset.gameChoice===gc.dataset.correct;gc.classList.add(ok?'correct':'wrong');if(ok){gameScore++;setStep(1)}setTimeout(()=>{gameIndex++;renderGame()},450);return}
      const qo=e.target.closest('[data-q]');if(qo){const a=todayArticle(),q=Number(qo.dataset.q),o=Number(qo.dataset.o),ok=a.qs[q][2]===o;qo.classList.add(ok?'correct':'wrong');if(ok)setStep(3);return}
      if(e.target.closest('[data-grammar-done]'))setStep(4);
    });
    setTimeout(()=>setStep(0),1200);
    return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(mount()||tries>30)clearInterval(timer)},400);
})();