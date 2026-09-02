(()=>{
  const qs=s=>document.querySelector(s);
  const qsa=s=>[...document.querySelectorAll(s)];
  function wrapSection(el,{icon,title,desc,open=false,id=''}){
    if(!el||el.closest('.el7-accordion'))return;
    const d=document.createElement('details');d.className='el7-accordion';if(open)d.open=true;if(id)d.id=id;
    const summary=document.createElement('summary');summary.innerHTML=`<div class="el7-summary-left"><div class="el7-summary-icon">${icon}</div><div class="el7-summary-copy"><b>${title}</b><span>${desc}</span></div></div><span class="el7-chevron">⌄</span>`;
    const panel=document.createElement('div');panel.className='el7-panel';
    el.parentNode.insertBefore(d,el);d.append(summary,panel);panel.append(el);
  }
  function mount(){
    const page=qs('#page-english'),hub=qs('#page-english .el6-hub');if(!page||!hub||page.dataset.el7||hub.querySelector('.el8-today-nav'))return false;page.dataset.el7='1';
    if(!document.querySelector('link[href="/english-focus-v7.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/english-focus-v7.css';document.head.appendChild(l)}
    const hero=hub.querySelector('.el6-hero');
    const focus=document.createElement('section');focus.className='card el7-focusbar';focus.innerHTML=`<div><div class="el6-eyebrow">Focus Mode</div><h3>اعمل المطلوب النهارده وبس</h3><p class="el6-muted">ابدأ بالمهمة اليومية. افتح الكلمات أو الجرامر أو الخطة فقط لما تحتاجهم.</p></div><div class="el7-focus-actions"><button class="btn primary" id="el7StartToday">ابدأ 15 دقيقة</button><button class="btn" id="el7OpenWords">الكلمات</button><button class="btn" id="el7OpenGrammar">الجرامر</button></div>`;
    hero?.insertAdjacentElement('afterend',focus);

    const sectionTitles=[...hub.querySelectorAll('.el6-section-title')];
    sectionTitles.forEach(x=>x.classList.add('el7-hide'));
    const roadmap=qs('#el6Roadmap')?.closest('.card');
    const courses=qs('#el6Courses')?.closest('.card');
    const article=qs('#el6Article');
    const grammar=qs('#el6Grammar')?.closest('.card');
    const vocab=qs('#el6Vocab')?.closest('.card');
    if(roadmap)wrapSection(roadmap,{icon:'🧭',title:'Learning Path',desc:'A1/A2 → B1 → Work English → B2/C1',id:'el7Path'});
    if(courses)wrapSection(courses,{icon:'🎓',title:'Courses & Sources',desc:'Perfectly Spoken / Lingu English + support resources',id:'el7Courses'});
    if(article)wrapSection(article,{icon:'📰',title:'Daily Article',desc:'Vocabulary → article → quiz → discussion',open:true,id:'el7Article'});
    if(grammar)wrapSection(grammar,{icon:'Aa',title:'Grammar in Context',desc:'قواعد بأمثلة من الجرافيك والموشن والعملاء',id:'el7Grammar'});
    if(vocab){vocab.querySelector('#el6Vocab')?.classList.add('el7-compact-list');wrapSection(vocab,{icon:'W',title:'Graphic & Motion Vocabulary',desc:'بنك الكلمات — افتحه وقت المراجعة فقط',id:'el7Words'});}

    const speaking=[...hub.querySelectorAll('.card')].find(c=>c.textContent.includes('Speaking Track'));
    if(speaking)wrapSection(speaking,{icon:'🎙️',title:'Speaking Practice',desc:'Shadowing + client answers + self review',id:'el7Speaking'});

    const routine=document.createElement('section');routine.className='card';routine.innerHTML=`<div class="el6-eyebrow">How to use this</div><h3>روتين بسيط ثابت</h3><div class="el7-routine"><div><b>1 · 5 دقائق</b><span>راجع 5 كلمات فقط.</span></div><div><b>2 · 5 دقائق</b><span>اقرأ المقال وأجب على الـquiz.</span></div><div><b>3 · 3 دقائق</b><span>راجع قاعدة واحدة بمثال من شغلك.</span></div><div><b>4 · 2 دقائق</b><span>اتكلم بصوتك عن سؤال أو client scenario.</span></div></div><div class="el7-note" style="margin-top:10px">مرتين في الأسبوع فقط افتح Learning Path أو Courses. مش محتاج تشوفهم كل يوم.</div>`;
    hub.append(routine);

    function openAndScroll(id){const d=qs(id);if(!d)return;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});}
    qs('#el7StartToday')?.addEventListener('click',()=>{qs('#el6Mission')?.scrollIntoView({behavior:'smooth',block:'center'})});
    qs('#el7OpenWords')?.addEventListener('click',()=>openAndScroll('#el7Words'));
    qs('#el7OpenGrammar')?.addEventListener('click',()=>openAndScroll('#el7Grammar'));
    return true;
  }
  let n=0,t=setInterval(()=>{n++;if(mount()||n>40)clearInterval(t)},350);
})();
