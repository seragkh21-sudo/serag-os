(()=>{
  const q=id=>document.getElementById(id);
  const ev3Esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ev3SafeUrl=v=>{try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
  const ev3WordsCount=s=>String(s||'').trim()?String(s||'').trim().split(/\s+/).length:0;
  const ev3Date=v=>v?new Date(v).toLocaleDateString('ar-EG',{day:'numeric',month:'short',year:'numeric'}):'';
  const ev3Phonetic=v=>String(v||'').replace(/^\/+|\/+$/g,'').trim();
  let ev3Words=[],ev3Writing=[],ev3Grammar=[],ev3Courses=[];
  let ev3ReviewIndex=0,ev3ActiveArticleId=null,ev3EditingWordId=null;
  const ev3PronunciationAttempts=new Set();

  function ev3Speak(text,{word=false}={}){
    const value=String(text||'').trim();
    if(!value||!('speechSynthesis' in window))return toast('الصوت غير مدعوم على المتصفح ده');
    window.speechSynthesis.cancel();
    const utter=new SpeechSynthesisUtterance(value);
    utter.lang='en-US';utter.rate=word?.82:.9;utter.pitch=1;
    const voices=window.speechSynthesis.getVoices?.()||[];
    const preferred=voices.find(v=>/^en-(US|GB)/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
    if(preferred)utter.voice=preferred;
    window.speechSynthesis.speak(utter);
  }

  async function ev3LookupPronunciation(word){
    try{
      const r=await fetch(`/api/pronunciation?word=${encodeURIComponent(word)}`);
      if(!r.ok)return null;
      return await r.json();
    }catch{return null}
  }

  async function ev3EnrichWord(row,{play=false}={}){
    if(!row?.id||!row?.word)return null;
    const key=String(row.id);
    if(ev3PronunciationAttempts.has(key)&&!play)return null;
    ev3PronunciationAttempts.add(key);
    const info=await ev3LookupPronunciation(row.word);
    if(info){
      const patch={phonetic:ev3Phonetic(info.phonetic)||null,audio_url:ev3SafeUrl(info.audio)||null,part_of_speech:String(info.partOfSpeech||'').slice(0,40)||null};
      await sb.from('english_words').update(patch).eq('id',row.id);
      Object.assign(row,patch);
      if(play)ev3PlayWord(row);
      return patch;
    }
    if(play)ev3Speak(row.word,{word:true});
    return null;
  }

  function ev3PlayWord(row){
    const url=ev3SafeUrl(row?.audio_url);
    if(url){
      const audio=new Audio(url);
      audio.play().catch(()=>ev3Speak(row.word,{word:true}));
      return;
    }
    ev3EnrichWord(row,{play:true});
  }

  function ev3Mount(){
    const page=q('page-english');if(!page||page.dataset.ev3Mounted)return;
    page.dataset.ev3Mounted='1';
    if(!document.querySelector('link[href="/english-v3.css"]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='/english-v3.css';document.head.appendChild(link);
    }
    page.innerHTML=`
      <header class="top english-top">
        <div><div class="english-eyebrow">English learning workspace</div><h2>English</h2><p class="muted">اكتب، راجع، اسمع النطق، وتابع تقدمك من مكان واحد.</p></div>
      </header>

      <div class="english-kpis">
        <div class="english-kpi"><span>Vocabulary</span><strong id="englishVocabularyTotal">0</strong><small><b id="englishMasteredTotal">0</b> mastered</small></div>
        <div class="english-kpi"><span>Writing</span><strong id="englishWritingTotal">0</strong><small>saved articles</small></div>
        <div class="english-kpi"><span>Grammar</span><strong id="englishGrammarTotal">0</strong><small>topics</small></div>
        <div class="english-kpi"><span>Courses</span><strong id="englishCourseAverage">0%</strong><small>average progress</small></div>
      </div>

      <div class="english-grid">
        <section class="card english-card english-span7">
          <div class="english-card-head"><div><h3>Writing Studio</h3><p class="muted">اكتب المقال واحفظه في مكتبتك. تقدر تفتحه وتعدله وتسمعه بعدين.</p></div><span class="english-count-badge"><b id="writingCount">0</b> articles</span></div>
          <form id="writingForm" class="form english-writing-form">
            <input id="writingTitle" placeholder="Article title" autocomplete="off"/>
            <textarea id="writingContent" required placeholder="Write your article in English..."></textarea>
            <div class="english-editor-meta"><span id="writingLiveCount" class="muted">0 words</span><span class="muted">Saved to your account</span></div>
            <div class="english-writing-actions"><button class="btn primary" type="submit">Save article</button></div>
          </form>
        </section>

        <section class="card english-card english-span5">
          <div class="english-card-head"><div><h3>My Articles</h3><p class="muted">افتح أي مقال بدل ما يفضل مجرد Preview.</p></div></div>
          <div class="english-search-row"><input id="writingSearch" placeholder="Search articles..."/><button id="writingSearchClear" class="btn" type="button">مسح</button></div>
          <div id="writingList" class="english-article-list"></div>
        </section>

        <section class="card english-card english-span7">
          <div class="english-card-head"><div><h3>Vocabulary</h3><p class="muted">النطق والـphonetic بيتضافوا تلقائيًا قدر الإمكان.</p></div><span class="english-count-badge"><b id="wordsCount">0</b> words</span></div>
          <form id="wordForm" class="english-vocab-form">
            <input id="newWord" required placeholder="Word" autocomplete="off"/>
            <input id="wordMeaning" placeholder="المعنى بالعربي"/>
            <input id="wordExample" class="full" placeholder="Example sentence"/>
            <div class="full actions"><button id="wordSubmitBtn" class="btn primary" type="submit">Add word</button><button id="cancelWordEdit" class="btn english-hidden" type="button">Cancel edit</button></div>
          </form>
          <div class="english-vocab-toolbar"><input id="wordSearch" placeholder="Search vocabulary..."/><select id="wordStatusFilter"><option value="all">All words</option><option value="learning">Learning</option><option value="mastered">Mastered</option></select></div>
          <div id="wordsList" class="english-word-list"></div>
        </section>

        <section class="card english-card english-span5">
          <div class="english-card-head"><div><h3>Quick Review</h3><p class="muted">راجع الكلمات اللي لسه بتتعلمها واحدة واحدة.</p></div></div>
          <div id="englishReviewBox" class="english-review-box"></div>
        </section>

        <section class="card english-card english-span6">
          <div class="english-card-head"><div><h3>Grammar Notes</h3><p class="muted">قواعدك وملاحظاتك بشكل مختصر.</p></div><span class="english-count-badge"><b id="grammarCount">0</b> topics</span></div>
          <form id="grammarForm" class="form"><input id="grammarTitle" required placeholder="Grammar topic — e.g. Present Perfect"/><textarea id="grammarNotes" placeholder="Your notes"></textarea><button class="btn primary">Add grammar note</button></form>
          <div id="grammarList"></div>
        </section>

        <section class="card english-card english-span6">
          <div class="english-card-head"><div><h3>Course Progress</h3><p class="muted">تابع الكورس من غير ما تضيع مكانك.</p></div><span class="english-count-badge"><b id="englishCoursesCount">0</b> courses</span></div>
          <form id="englishCourseForm" class="form"><input id="englishCourseTitle" required placeholder="Course / unit name"/><input id="englishCourseUrl" placeholder="Course URL"/><input id="englishCourseProgress" type="number" min="0" max="100" placeholder="Progress %"/><button class="btn primary">Save course</button></form>
          <div id="englishCoursesList"></div>
        </section>
      </div>`;

    document.querySelector('[data-english-modal]')?.remove();
    document.body.insertAdjacentHTML('beforeend',`
      <div class="english-modal-backdrop english-hidden" data-english-modal>
        <section class="english-modal" role="dialog" aria-modal="true" aria-label="Article viewer">
          <div class="english-modal-head">
            <div><h3 id="articleModalTitle">Article</h3><div id="articleModalMeta" class="english-modal-meta"></div></div>
            <div class="english-modal-actions"><button id="articleReadBtn" class="btn" type="button">🔊 Read aloud</button><button id="articleCopyBtn" class="btn" type="button">Copy</button><button id="articleEditBtn" class="btn" type="button">Edit</button><button id="articleCloseBtn" class="icon-btn" type="button">×</button></div>
          </div>
          <div class="english-modal-body">
            <div id="articleViewPane" class="english-article-body"></div>
            <div id="articleEditPane" class="english-article-edit english-hidden"><input id="articleEditTitle"/><textarea id="articleEditContent"></textarea></div>
          </div>
          <div class="english-modal-foot"><button id="articleDeleteBtn" class="btn danger" type="button">Delete article</button><div class="actions" style="margin:0"><button id="articleCancelEditBtn" class="btn english-hidden" type="button">Cancel</button><button id="articleSaveEditBtn" class="btn primary english-hidden" type="button">Save changes</button></div></div>
        </section>
      </div>`);
    ev3Bind();
    try{loadEnglish=ev3LoadEnglish}catch{window.loadEnglish=ev3LoadEnglish}
    ev3LoadEnglish();
  }

  function ev3Bind(){
    q('writingContent')?.addEventListener('input',ev3UpdateWritingCount);
    q('writingSearch')?.addEventListener('input',ev3RenderWriting);
    q('writingSearchClear')?.addEventListener('click',()=>{q('writingSearch').value='';ev3RenderWriting()});
    q('wordSearch')?.addEventListener('input',ev3RenderWords);
    q('wordStatusFilter')?.addEventListener('change',ev3RenderWords);
    q('cancelWordEdit')?.addEventListener('click',ev3ResetWordForm);

    q('writingForm').onsubmit=async e=>{
      e.preventDefault();
      const content=q('writingContent').value.trim();if(!content)return;
      const title=q('writingTitle').value.trim()||`Article ${new Date().toLocaleDateString('en-GB')}`;
      const {error}=await sb.from('english_writing').insert({user_id:user.id,title,content});
      if(error)return toast(error.message);
      e.target.reset();ev3UpdateWritingCount();toast('المقال اتحفظ في My Articles');await ev3LoadEnglish();
    };

    q('wordForm').onsubmit=async e=>{
      e.preventDefault();
      const word=q('newWord').value.trim(),meaning=q('wordMeaning').value.trim(),example=q('wordExample').value.trim();if(!word)return;
      if(ev3EditingWordId){
        const old=ev3Words.find(x=>String(x.id)===String(ev3EditingWordId));
        const changed=old&&old.word.toLowerCase()!==word.toLowerCase();
        const patch={word,meaning,example,status:old?.status||'learning'};
        if(changed){patch.phonetic=null;patch.audio_url=null;patch.part_of_speech=null;ev3PronunciationAttempts.delete(String(ev3EditingWordId))}
        const {error}=await sb.from('english_words').update(patch).eq('id',ev3EditingWordId);
        if(error)return toast(error.message);
        const id=ev3EditingWordId;ev3ResetWordForm();toast('الكلمة اتعدلت');await ev3LoadEnglish();
        if(changed){const row=ev3Words.find(x=>String(x.id)===String(id));if(row){await ev3EnrichWord(row);await ev3LoadEnglish()}}
        return;
      }
      const {data,error}=await sb.from('english_words').insert({user_id:user.id,word,meaning,example,status:'learning'}).select('*').single();
      if(error)return toast(error.message);
      e.target.reset();toast('الكلمة اتحفظت — بنجيب النطق');await ev3LoadEnglish();
      if(data){await ev3EnrichWord(data);await ev3LoadEnglish()}
    };

    q('grammarForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('grammar_topics').insert({user_id:user.id,title:q('grammarTitle').value.trim(),notes:q('grammarNotes').value.trim()});if(error)return toast(error.message);e.target.reset();toast('Grammar note saved');ev3LoadEnglish()};
    q('englishCourseForm').onsubmit=async e=>{e.preventDefault();const progress=Math.max(0,Math.min(100,Number(q('englishCourseProgress').value||0)));const {error}=await sb.from('courses').insert({user_id:user.id,title:q('englishCourseTitle').value.trim(),url:q('englishCourseUrl').value.trim(),progress,category:'english',status:'active'});if(error)return toast(error.message);e.target.reset();ev3LoadEnglish()};

    q('page-english').addEventListener('click',ev3PageClick);
    document.querySelector('[data-english-modal]').addEventListener('click',e=>{if(e.target.matches('[data-english-modal]'))ev3CloseArticle()});
    q('articleCloseBtn').onclick=ev3CloseArticle;
    q('articleReadBtn').onclick=()=>{const a=ev3Writing.find(x=>String(x.id)===String(ev3ActiveArticleId));if(a)ev3Speak(a.content)};
    q('articleCopyBtn').onclick=async()=>{const a=ev3Writing.find(x=>String(x.id)===String(ev3ActiveArticleId));if(!a)return;try{await navigator.clipboard.writeText(a.content);toast('المقال اتنسخ')}catch{toast('مش قادر أنسخ من المتصفح ده')}};
    q('articleEditBtn').onclick=ev3StartArticleEdit;
    q('articleCancelEditBtn').onclick=ev3CancelArticleEdit;
    q('articleSaveEditBtn').onclick=ev3SaveArticleEdit;
    q('articleDeleteBtn').onclick=ev3DeleteActiveArticle;
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('[data-english-modal]').classList.contains('english-hidden'))ev3CloseArticle()});
  }

  async function ev3LoadEnglish(){
    if(!user)return;
    const [w,g,c,wr]=await Promise.all([
      sb.from('english_words').select('*').order('created_at',{ascending:false}).limit(200),
      sb.from('grammar_topics').select('*').order('created_at',{ascending:false}).limit(100),
      sb.from('courses').select('*').eq('category','english').order('created_at',{ascending:false}).limit(100),
      sb.from('english_writing').select('*').order('created_at',{ascending:false}).limit(100)
    ]);
    if(w.error||g.error||c.error||wr.error){console.warn('English workspace load',w.error||g.error||c.error||wr.error);return}
    ev3Words=w.data||[];ev3Grammar=g.data||[];ev3Courses=c.data||[];ev3Writing=wr.data||[];
    const mastered=ev3Words.filter(x=>x.status==='mastered').length;
    const courseAvg=ev3Courses.length?Math.round(ev3Courses.reduce((a,x)=>a+Number(x.progress||0),0)/ev3Courses.length):0;
    q('wordsCount').textContent=ev3Words.length;q('grammarCount').textContent=ev3Grammar.length;q('englishCoursesCount').textContent=ev3Courses.length;q('writingCount').textContent=ev3Writing.length;
    q('englishVocabularyTotal').textContent=ev3Words.length;q('englishMasteredTotal').textContent=mastered;q('englishWritingTotal').textContent=ev3Writing.length;q('englishGrammarTotal').textContent=ev3Grammar.length;q('englishCourseAverage').textContent=`${courseAvg}%`;
    ev3RenderWords();ev3RenderWriting();ev3RenderGrammar();ev3RenderCourses();ev3RenderReview();
    const missing=ev3Words.filter(x=>!ev3Phonetic(x.phonetic)&&!ev3PronunciationAttempts.has(String(x.id))).slice(0,6);
    if(missing.length){Promise.allSettled(missing.map(x=>ev3EnrichWord(x))).then(()=>ev3RenderWords())}
  }

  function ev3RenderWords(){
    const search=(q('wordSearch')?.value||'').trim().toLowerCase(),filter=q('wordStatusFilter')?.value||'all';
    const list=ev3Words.filter(x=>{
      const status=x.status==='mastered'?'mastered':'learning';
      const text=`${x.word||''} ${x.meaning||''} ${x.example||''}`.toLowerCase();
      return (!search||text.includes(search))&&(filter==='all'||status===filter);
    });
    q('wordsList').innerHTML=list.length?list.map(x=>{
      const status=x.status==='mastered'?'mastered':'learning',phon=ev3Phonetic(x.phonetic);
      return `<div class="english-word-card"><div class="english-word-head"><div class="english-word-name-wrap"><span class="english-word-name">${ev3Esc(x.word)}</span>${phon?`<span class="english-phonetic">/${ev3Esc(phon)}/</span>`:''}${x.part_of_speech?`<span class="english-pos">${ev3Esc(x.part_of_speech)}</span>`:''}<button class="english-sound-btn" data-word-sound="${x.id}" type="button" aria-label="Play pronunciation">🔊</button></div><div class="english-word-actions"><span class="english-status ${status}">${status==='mastered'?'Mastered':'Learning'}</span><button class="mini" data-word-status="${x.id}" type="button">${status==='mastered'?'Review again':'Mastered'}</button><button class="mini" data-word-edit="${x.id}" type="button">Edit</button><button class="mini danger" data-word-delete="${x.id}" type="button">Delete</button></div></div>${x.meaning?`<div class="english-word-meaning">${ev3Esc(x.meaning)}</div>`:''}${x.example?`<div class="english-word-example">${ev3Esc(x.example)}</div>`:''}</div>`;
    }).join(''):'<div class="english-empty">مفيش كلمات مطابقة.</div>';
  }

  function ev3RenderWriting(){
    const search=(q('writingSearch')?.value||'').trim().toLowerCase();
    const list=ev3Writing.filter(x=>!search||`${x.title||''} ${x.content||''}`.toLowerCase().includes(search));
    q('writingList').innerHTML=list.length?list.map(x=>{const wc=ev3WordsCount(x.content),mins=Math.max(1,Math.ceil(wc/200));return `<article class="english-article-card"><div class="english-article-top"><div><div class="english-article-title">${ev3Esc(x.title||'Untitled Article')}</div><div class="english-article-preview">${ev3Esc(x.content||'')}</div><div class="english-article-meta"><span>${wc} words</span><span>~${mins} min read</span><span>${ev3Date(x.updated_at||x.created_at)}</span></div></div><div class="english-article-actions"><button class="mini" data-open-article="${x.id}" type="button">Open</button></div></div></article>`}).join(''):'<div class="english-empty">لسه مفيش مقالات محفوظة.</div>';
  }

  function ev3RenderGrammar(){
    q('grammarList').innerHTML=ev3Grammar.length?ev3Grammar.map(x=>`<div class="english-grammar-card"><div class="english-grammar-top"><div><div class="english-grammar-title">${ev3Esc(x.title)}</div><div class="english-grammar-notes">${ev3Esc(x.notes||'No notes yet.')}</div></div><div class="english-word-actions"><button class="mini" data-action="edit" data-type="grammar" data-id="${x.id}" type="button">Edit</button><button class="mini danger" data-action="delete" data-type="grammar" data-id="${x.id}" type="button">Delete</button></div></div></div>`).join(''):'<div class="english-empty">Add your first grammar note.</div>';
  }

  function ev3RenderCourses(){
    q('englishCoursesList').innerHTML=ev3Courses.length?ev3Courses.map(x=>{const p=Math.max(0,Math.min(100,Number(x.progress||0))),url=ev3SafeUrl(x.url);return `<div class="english-course-card"><div class="english-course-top"><div style="min-width:0"><div class="english-course-title">${ev3Esc(x.title)}</div><div class="english-course-meta">${p}% complete</div><div class="english-progress"><span style="width:${p}%"></span></div></div><div class="english-word-actions">${url?`<a class="mini link" target="_blank" rel="noopener" href="${ev3Esc(url)}">Open</a>`:''}<button class="mini" data-action="edit" data-type="course" data-id="${x.id}" type="button">Edit</button><button class="mini danger" data-action="delete" data-type="course" data-id="${x.id}" type="button">Delete</button></div></div></div>`}).join(''):'<div class="english-empty">Add the English course you are following.</div>';
  }

  function ev3RenderReview(){
    const queue=ev3Words.filter(x=>x.status!=='mastered');
    if(!queue.length){q('englishReviewBox').innerHTML=ev3Words.length?'<div><div class="english-review-word">✓</div><div class="english-review-meaning">كل الكلمات عندك Mastered</div><div class="muted">تقدر ترجع أي كلمة لـ Review again من قائمة الكلمات.</div></div>':'<div class="english-empty">ضيف كلمات الأول علشان يبدأ الـReview.</div>';return}
    if(ev3ReviewIndex>=queue.length)ev3ReviewIndex=0;
    const x=queue[ev3ReviewIndex],phon=ev3Phonetic(x.phonetic);
    q('englishReviewBox').innerHTML=`<div class="english-review-word">${ev3Esc(x.word)}</div>${phon?`<div class="english-review-phonetic">/${ev3Esc(phon)}/</div>`:''}<button class="english-sound-btn" data-word-sound="${x.id}" type="button" aria-label="Play pronunciation" style="margin-top:9px">🔊</button><div id="reviewReveal" class="english-hidden"><div class="english-review-meaning">${ev3Esc(x.meaning||'No meaning saved')}</div>${x.example?`<div class="english-review-example">${ev3Esc(x.example)}</div>`:''}</div><div class="english-review-actions"><button class="btn" data-review-reveal type="button">Show meaning</button><button class="btn primary" data-review-mastered="${x.id}" type="button">I know it</button><button class="btn" data-review-next type="button">Next</button></div>`;
  }

  function ev3UpdateWritingCount(){const n=ev3WordsCount(q('writingContent')?.value);if(q('writingLiveCount'))q('writingLiveCount').textContent=`${n} word${n===1?'':'s'}`}
  function ev3ResetWordForm(){ev3EditingWordId=null;q('wordForm')?.reset();q('wordSubmitBtn').textContent='Add word';q('cancelWordEdit').classList.add('english-hidden')}

  async function ev3PageClick(e){
    const open=e.target.closest('[data-open-article]');if(open)return ev3OpenArticle(open.dataset.openArticle);
    const sound=e.target.closest('[data-word-sound]');if(sound){const row=ev3Words.find(x=>String(x.id)===sound.dataset.wordSound);if(row)ev3PlayWord(row);return}
    const status=e.target.closest('[data-word-status]');if(status){const row=ev3Words.find(x=>String(x.id)===status.dataset.wordStatus);if(!row)return;const next=row.status==='mastered'?'learning':'mastered';const {error}=await sb.from('english_words').update({status:next}).eq('id',row.id);if(error)return toast(error.message);row.status=next;ev3RenderWords();ev3RenderReview();q('englishMasteredTotal').textContent=ev3Words.filter(x=>x.status==='mastered').length;return}
    const edit=e.target.closest('[data-word-edit]');if(edit){const row=ev3Words.find(x=>String(x.id)===edit.dataset.wordEdit);if(!row)return;ev3EditingWordId=row.id;q('newWord').value=row.word||'';q('wordMeaning').value=row.meaning||'';q('wordExample').value=row.example||'';q('wordSubmitBtn').textContent='Save changes';q('cancelWordEdit').classList.remove('english-hidden');q('newWord').focus();return}
    const del=e.target.closest('[data-word-delete]');if(del){if(!confirm('Delete this word?'))return;const {error}=await sb.from('english_words').delete().eq('id',del.dataset.wordDelete);if(error)return toast(error.message);toast('الكلمة اتمسحت');return ev3LoadEnglish()}
    if(e.target.closest('[data-review-reveal]')){q('reviewReveal')?.classList.remove('english-hidden');return}
    const known=e.target.closest('[data-review-mastered]');if(known){const {error}=await sb.from('english_words').update({status:'mastered'}).eq('id',known.dataset.reviewMastered);if(error)return toast(error.message);toast('اتسجلت Mastered ✓');return ev3LoadEnglish()}
    if(e.target.closest('[data-review-next]')){ev3ReviewIndex++;ev3RenderReview();return}
  }

  function ev3OpenArticle(id){
    const a=ev3Writing.find(x=>String(x.id)===String(id));if(!a)return;
    ev3ActiveArticleId=a.id;ev3CancelArticleEdit();
    q('articleModalTitle').textContent=a.title||'Untitled Article';
    const wc=ev3WordsCount(a.content),mins=Math.max(1,Math.ceil(wc/200));q('articleModalMeta').textContent=`${wc} words · ~${mins} min read · ${ev3Date(a.updated_at||a.created_at)}`;
    q('articleViewPane').textContent=a.content||'';
    document.querySelector('[data-english-modal]').classList.remove('english-hidden');document.body.style.overflow='hidden';
  }
  function ev3CloseArticle(){window.speechSynthesis?.cancel?.();document.querySelector('[data-english-modal]')?.classList.add('english-hidden');document.body.style.overflow='';ev3ActiveArticleId=null;ev3CancelArticleEdit()}
  function ev3StartArticleEdit(){const a=ev3Writing.find(x=>String(x.id)===String(ev3ActiveArticleId));if(!a)return;q('articleEditTitle').value=a.title||'';q('articleEditContent').value=a.content||'';q('articleViewPane').classList.add('english-hidden');q('articleEditPane').classList.remove('english-hidden');q('articleEditBtn').classList.add('english-hidden');q('articleReadBtn').classList.add('english-hidden');q('articleCopyBtn').classList.add('english-hidden');q('articleCancelEditBtn').classList.remove('english-hidden');q('articleSaveEditBtn').classList.remove('english-hidden')}
  function ev3CancelArticleEdit(){q('articleViewPane')?.classList.remove('english-hidden');q('articleEditPane')?.classList.add('english-hidden');q('articleEditBtn')?.classList.remove('english-hidden');q('articleReadBtn')?.classList.remove('english-hidden');q('articleCopyBtn')?.classList.remove('english-hidden');q('articleCancelEditBtn')?.classList.add('english-hidden');q('articleSaveEditBtn')?.classList.add('english-hidden')}
  async function ev3SaveArticleEdit(){if(!ev3ActiveArticleId)return;const title=q('articleEditTitle').value.trim()||'Untitled Article',content=q('articleEditContent').value.trim();if(!content)return toast('المقال فاضي');const {error}=await sb.from('english_writing').update({title,content,updated_at:new Date().toISOString()}).eq('id',ev3ActiveArticleId);if(error)return toast(error.message);toast('المقال اتعدل');await ev3LoadEnglish();ev3OpenArticle(ev3ActiveArticleId)}
  async function ev3DeleteActiveArticle(){if(!ev3ActiveArticleId||!confirm('Delete this article?'))return;const {error}=await sb.from('english_writing').delete().eq('id',ev3ActiveArticleId);if(error)return toast(error.message);ev3CloseArticle();toast('المقال اتمسح');ev3LoadEnglish()}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ev3Mount,{once:true});else ev3Mount();
})();
