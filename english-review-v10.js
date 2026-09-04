(()=>{
  const DATA=window.SERAG_REVIEW_V10_DATA;if(!DATA)return;
  const QUESTIONS=DATA.questions,TOPICS=DATA.topics;
  const STORAGE_KEY='seragEnglishReviewV10';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=s=>String(s||'').toLowerCase().trim().replace(/[’']/g,"'").replace(/\s+/g,' ').replace(/[.!?]+$/g,'');
  const sectionOrder=[...new Set(QUESTIONS.map(q=>q.section))];
  let state={answers:{},submitted:false};
  function load(){
    try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');if(x&&typeof x==='object')state={answers:x.answers||{},submitted:Boolean(x.submitted)}}catch{}
  }
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
  function isAnswered(q){return q.type==='text'?Boolean(String(state.answers[q.n]||'').trim()):state.answers[q.n]!==undefined}
  function isCorrect(q){
    const got=state.answers[q.n];
    if(q.type==='text')return (q.accepted||[q.answer]).some(a=>normalize(a)===normalize(got));
    return got===q.answer;
  }
  function score(){return QUESTIONS.filter(isCorrect).length}
  function resultLabel(pct){if(pct>=90)return 'ممتاز — القواعد ثابتة جدًا';if(pct>=75)return 'كويس جدًا — محتاج تثبيت نقاط بسيطة';if(pct>=60)return 'كويس — راجع الأخطاء مرة كمان';return 'محتاج مراجعة مركزة قبل ما نزود قواعد جديدة'}
  function injectStyle(){
    if($('#seragReviewStyle'))return;
    const st=document.createElement('style');st.id='seragReviewStyle';st.textContent=`
      #seragReviewWrap{scroll-margin-top:18px}
      .sr10-shell{direction:ltr;display:grid;gap:18px}
      .sr10-hero{display:grid;grid-template-columns:1.25fr .75fr;gap:16px;padding:20px;border:1px solid #e9e6ee;border-radius:18px;background:linear-gradient(135deg,#fbfaff,#f5f2ff)}
      .sr10-hero h3{margin:5px 0 7px;font-size:22px}.sr10-hero p{margin:0;color:#6f6a75;line-height:1.7}
      .sr10-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-self:stretch}.sr10-kpi{display:grid;place-items:center;text-align:center;background:#fff;border:1px solid #e7e2ef;border-radius:14px;padding:12px}.sr10-kpi strong{font-size:19px}.sr10-kpi span{font-size:11px;color:#77717e}
      .sr10-tabs{display:flex;gap:8px;flex-wrap:wrap}.sr10-tab{border:1px solid #e5e1ea;background:#fff;border-radius:999px;padding:9px 14px;font-weight:800;cursor:pointer}.sr10-tab.active{background:#17171a;color:#fff;border-color:#17171a}
      .sr10-panel{display:none}.sr10-panel.active{display:block}
      .sr10-topic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sr10-topic{border:1px solid #ece8f0;border-radius:15px;padding:14px;background:#fff}.sr10-topic b{display:block;margin-bottom:5px}.sr10-topic p{margin:0;color:#77717e;font-size:13px;line-height:1.65}
      .sr10-start{margin-top:14px;display:flex;gap:8px;align-items:center;justify-content:space-between;padding:14px 15px;border-radius:14px;background:#17171a;color:#fff}.sr10-start p{margin:0;color:#d8d5dd;font-size:13px}.sr10-btn{border:0;border-radius:11px;padding:10px 14px;font-weight:850;cursor:pointer;background:#6d58d9;color:#fff}.sr10-btn.secondary{background:#f0edf5;color:#2d2931}.sr10-btn.danger{background:#fff0f0;color:#9b3333}
      .sr10-progress-card{position:sticky;top:10px;z-index:8;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border:1px solid #ebe7ef;border-radius:14px;padding:11px 13px;margin-bottom:12px;box-shadow:0 10px 26px rgba(20,18,24,.06)}.sr10-progress-line{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:800}.sr10-bar{height:7px;background:#eeebf2;border-radius:99px;overflow:hidden;margin-top:8px}.sr10-bar i{display:block;height:100%;background:#6d58d9;border-radius:99px;transition:width .2s ease}
      .sr10-section{border:1px solid #ebe7ef;background:#fff;border-radius:17px;margin:12px 0;overflow:hidden}.sr10-section-head{padding:13px 15px;background:#faf9fb;border-bottom:1px solid #efedf2;display:flex;justify-content:space-between;align-items:center}.sr10-section-head b{font-size:14px}.sr10-section-head span{font-size:11px;color:#817b86}
      .sr10-question{padding:15px;border-bottom:1px solid #f0edf2;text-align:left}.sr10-question:last-child{border-bottom:0}.sr10-qhead{display:flex;gap:10px;align-items:flex-start}.sr10-num{flex:0 0 30px;width:30px;height:30px;border-radius:10px;background:#f0edf5;display:grid;place-items:center;font-size:12px;font-weight:900}.sr10-prompt{font-weight:800;line-height:1.55;padding-top:4px}
      .sr10-options{display:grid;gap:8px;margin:12px 0 0 40px}.sr10-option{display:flex;gap:10px;align-items:flex-start;border:1px solid #e8e4ec;border-radius:11px;padding:10px 11px;cursor:pointer;background:#fff;text-align:left}.sr10-option:hover{border-color:#cfc5ff;background:#fbfaff}.sr10-option input{margin-top:3px}.sr10-option.correct{border-color:#9bcaa8;background:#f1faf4}.sr10-option.wrong{border-color:#dba7a7;background:#fff4f4}.sr10-text{margin:12px 0 0 40px;width:calc(100% - 40px);box-sizing:border-box;border:1px solid #ded9e3;border-radius:11px;padding:11px 12px;font:inherit;outline:none}.sr10-text:focus{border-color:#8b78e6;box-shadow:0 0 0 3px #8b78e615}
      .sr10-explain{display:none;margin:12px 0 0 40px;padding:11px 12px;border-radius:11px;background:#f8f7fa;font-size:13px;line-height:1.65;color:#4c4651}.sr10-explain.show{display:block}.sr10-explain strong{color:#26222a}.sr10-model{display:block;margin-top:5px;color:#2f6d41;font-weight:800}
      .sr10-actions{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-top:14px}.sr10-missing{font-size:12px;color:#a25151;font-weight:700}.sr10-result{display:none;border-radius:17px;padding:18px;background:#17171a;color:#fff;margin-bottom:14px}.sr10-result.show{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center}.sr10-score{width:78px;height:78px;border-radius:50%;display:grid;place-items:center;background:#ffffff12;border:1px solid #ffffff20;font-size:20px;font-weight:900}.sr10-result h4{margin:0 0 5px;font-size:18px}.sr10-result p{margin:0;color:#d2ced7;font-size:13px;line-height:1.6}
      .sr10-lock{margin-top:10px;font-size:12px;color:#7f7884}
      @media(max-width:760px){.sr10-hero{grid-template-columns:1fr}.sr10-topic-grid{grid-template-columns:1fr}.sr10-kpis{grid-template-columns:repeat(3,1fr)}.sr10-options,.sr10-explain{margin-left:0}.sr10-text{margin-left:0;width:100%}.sr10-result.show{grid-template-columns:1fr}.sr10-score{width:66px;height:66px}}
    `;document.head.append(st);
  }
  function reviewHTML(){
    return `<div class="sr10-topic-grid">${TOPICS.map(t=>`<article class="sr10-topic"><b>${esc(t.title)}</b><p>${esc(t.tip)}</p></article>`).join('')}</div>
      <div class="sr10-start"><div><b>Ready for the checkpoint?</b><p>53 سؤال على كل اللي راجعته — الإجابات والشرح مقفولين لحد ما تخلص.</p></div><button class="sr10-btn" data-sr10-start>ابدأ الامتحان</button></div>`;
  }
  function questionHTML(q){
    const chosen=state.answers[q.n];
    let control='';
    if(q.type==='choice'){
      control=`<div class="sr10-options">${q.options.map(opt=>{
        const checked=chosen===opt?'checked':'';
        let cls='';
        if(state.submitted)cls=opt===q.answer?' correct':(chosen===opt?' wrong':'');
        return `<label class="sr10-option${cls}"><input type="radio" name="sr10q${q.n}" value="${esc(opt)}" ${checked} ${state.submitted?'disabled':''}><span>${esc(opt)}</span></label>`;
      }).join('')}</div>`;
    }else{
      control=`<input class="sr10-text" data-sr10-text="${q.n}" value="${esc(chosen||'')}" placeholder="Write your answer in English…" ${state.submitted?'disabled':''} />`;
    }
    const explain=`<div class="sr10-explain ${state.submitted?'show':''}"><strong>${isCorrect(q)?'✓ إجابتك صحيحة':'✗ راجع النقطة دي'}</strong><span class="sr10-model">الإجابة: ${esc(q.answer)}</span>${esc(q.explanation)}</div>`;
    return `<article class="sr10-question" data-q="${q.n}"><div class="sr10-qhead"><span class="sr10-num">${q.n}</span><div class="sr10-prompt">${esc(q.prompt)}</div></div>${control}${explain}</article>`;
  }
  function examHTML(){
    const answered=QUESTIONS.filter(isAnswered).length,pct=Math.round(answered/QUESTIONS.length*100);
    const sections=sectionOrder.map(s=>{
      const list=QUESTIONS.filter(q=>q.section===s);
      return `<section class="sr10-section"><div class="sr10-section-head"><b>${esc(s)}</b><span>${list[0].n}–${list[list.length-1].n}</span></div>${list.map(questionHTML).join('')}</section>`;
    }).join('');
    let result='';
    if(state.submitted){const sc=score(),p=Math.round(sc/QUESTIONS.length*100);result=`<div class="sr10-result show"><div class="sr10-score">${sc}/${QUESTIONS.length}</div><div><h4>${resultLabel(p)}</h4><p>نتيجتك ${p}%. تحت كل سؤال هتلاقي الإجابة الصحيحة والشرح. ركّز على الأسئلة الغلط وارجع حل الامتحان بعد المراجعة.</p></div></div>`}
    return `${result}<div class="sr10-progress-card"><div class="sr10-progress-line"><span>${state.submitted?'Exam finished':'Progress'}</span><span>${answered}/${QUESTIONS.length} answered</span></div><div class="sr10-bar"><i style="width:${pct}%"></i></div></div>${sections}<div class="sr10-actions">${state.submitted?'<button class="sr10-btn danger" data-sr10-reset>إعادة الامتحان من الأول</button>':'<button class="sr10-btn" data-sr10-submit>خلصت — ورّيني النتيجة والشرح</button>'}<span class="sr10-missing" id="sr10Missing"></span></div><div class="sr10-lock">الإجابات مش بتظهر أثناء الحل؛ بتتفك مرة واحدة بعد إنهاء كل الأسئلة.</div>`;
  }
  function render(root){
    const review=$('[data-sr10-panel="review"]',root),exam=$('[data-sr10-panel="exam"]',root);
    review.innerHTML=reviewHTML();exam.innerHTML=examHTML();
    $$('[data-sr10-tab]',root).forEach(b=>b.classList.toggle('active',b.dataset.sr10Tab===(state.submitted?'exam':(root.dataset.active||'review'))));
    const active=state.submitted?'exam':(root.dataset.active||'review');
    $$('[data-sr10-panel]',root).forEach(p=>p.classList.toggle('active',p.dataset.sr10Panel===active));
  }
  function setActive(root,name){root.dataset.active=name;$$('[data-sr10-tab]',root).forEach(b=>b.classList.toggle('active',b.dataset.sr10Tab===name));$$('[data-sr10-panel]',root).forEach(p=>p.classList.toggle('active',p.dataset.sr10Panel===name));if(name==='exam')root.scrollIntoView({behavior:'smooth',block:'start'})}
  function mount(){
    const grammar=$('#el9Grammar'),hub=grammar?.closest('.el9-hub');if(!grammar||!hub)return false;if($('#seragReviewWrap'))return true;
    injectStyle();load();
    const wrap=document.createElement('details');wrap.id='seragReviewWrap';wrap.className='el7-accordion';wrap.innerHTML=`<summary><div class="el7-summary-left"><div class="el7-summary-icon">✓</div><div class="el7-summary-copy"><b>Review & Grammar Checkpoint</b><span>مراجعة مركزة + امتحان 53 سؤال على اللي خلصته لحد Past Perfect</span></div></div><span class="el7-chevron">⌄</span></summary><div class="el7-panel"><div class="sr10-shell"><div class="sr10-hero"><div><div class="el6-eyebrow">YOUR CURRENT CHECKPOINT</div><h3>راجع اللي اتعلمته، وبعدها اختبر نفسك من غير hints.</h3><p>Articles، prepositions، simple & continuous tenses، Present Perfect وPast Perfect — بنفس مستوى المراجعة اللي وصلته.</p></div><div class="sr10-kpis"><div class="sr10-kpi"><strong>11</strong><span>topics</span></div><div class="sr10-kpi"><strong>53</strong><span>questions</span></div><div class="sr10-kpi"><strong>100%</strong><span>explained</span></div></div></div><div class="sr10-tabs"><button class="sr10-tab active" data-sr10-tab="review">المراجعة</button><button class="sr10-tab" data-sr10-tab="exam">الامتحان</button></div><div class="sr10-panel active" data-sr10-panel="review"></div><div class="sr10-panel" data-sr10-panel="exam"></div></div></div>`;
    grammar.insertAdjacentElement('afterend',wrap);
    const nav=$('.el9-today-nav',hub);if(nav&&!$('[data-jump="seragReviewWrap"]',nav))nav.insertAdjacentHTML('beforeend','<button data-jump="seragReviewWrap">Review Exam</button>');
    render(wrap);
    wrap.addEventListener('change',e=>{const radio=e.target.closest('input[type="radio"][name^="sr10q"]');if(!radio||state.submitted)return;state.answers[Number(radio.name.replace('sr10q',''))]=radio.value;save();render(wrap);setActive(wrap,'exam')});
    wrap.addEventListener('input',e=>{const inp=e.target.closest('[data-sr10-text]');if(!inp||state.submitted)return;state.answers[Number(inp.dataset.sr10Text)]=inp.value;save();const answered=QUESTIONS.filter(isAnswered).length;const card=$('.sr10-progress-card',wrap);if(card){$('.sr10-progress-line span:last-child',card).textContent=`${answered}/${QUESTIONS.length} answered`;$('.sr10-bar i',card).style.width=Math.round(answered/QUESTIONS.length*100)+'%'}});
    wrap.addEventListener('click',e=>{
      const tab=e.target.closest('[data-sr10-tab]');if(tab)return setActive(wrap,tab.dataset.sr10Tab);
      if(e.target.closest('[data-sr10-start]')){wrap.open=true;setActive(wrap,'exam');return}
      if(e.target.closest('[data-sr10-submit]')){
        $$('.sr10-text',wrap).forEach(inp=>{state.answers[Number(inp.dataset.sr10Text)]=inp.value});
        const missing=QUESTIONS.filter(q=>!isAnswered(q));if(missing.length){const box=$('#sr10Missing',wrap);if(box)box.textContent=`لسه ${missing.length} سؤال — أول واحد رقم ${missing[0].n}.`;wrap.querySelector(`[data-q="${missing[0].n}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});return}
        state.submitted=true;save();render(wrap);wrap.open=true;setActive(wrap,'exam');return
      }
      if(e.target.closest('[data-sr10-reset]')){if(!confirm('تمسح إجابات الامتحان وتبدأ من الأول؟'))return;state={answers:{},submitted:false};save();render(wrap);setActive(wrap,'review');return}
    });
    if(state.submitted){wrap.open=true;setActive(wrap,'exam')}
    return true;
  }
  let tries=0,timer=setInterval(()=>{tries++;if(mount()||tries>45)clearInterval(timer)},300);
})();
