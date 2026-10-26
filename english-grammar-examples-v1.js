/* Searchable grammar examples drawn from the existing Serag English curriculum.
   SCoRE is linked as an external resource; its CC BY-NC-SA corpus is not copied into this bank. */
(() => {
  'use strict';
  const SCORE_URL = 'https://score.ddl-study.org/en/';
  const LEVEL_LABELS = {A1:'A1 · تأسيسي',A2:'A2 · أساسي',B1:'B1 · متوسط',B2:'B2 · فوق المتوسط',C1:'C1 · متقدم',C2:'C2 · متقدم جدًا'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const norm = value => String(value ?? '').replace(/\s+/g,' ').trim();
  const normKey = value => norm(value).toLocaleLowerCase();
  let query = '';
  let level = 'all';
  let topic = 'all';
  let visibleLimit = 24;
  let boundRoot = null;

  function lessonSources() {
    const sources = [
      window.SERAG_GRAMMAR_V10,
      window.SERAG_LEVELS_V14 && window.SERAG_LEVELS_V14.lessons,
      window.SERAG_SUPPLEMENT_V13 && window.SERAG_SUPPLEMENT_V13.lessons,
      window.SERAG_SOURCE_CURRICULUM_V1 && window.SERAG_SOURCE_CURRICULUM_V1.lessons
    ];
    const byId = new Map();
    for (const group of sources) {
      if (!Array.isArray(group)) continue;
      for (const lesson of group) {
        if (!lesson || typeof lesson !== 'object' || !lesson.id) continue;
        const id = String(lesson.id);
        const existing = byId.get(id);
        if (!existing) {
          byId.set(id, {...lesson, examples:Array.isArray(lesson.examples)?lesson.examples.slice():[]});
          continue;
        }
        const combined = [...(Array.isArray(existing.examples)?existing.examples:[])];
        const seen = new Set(combined.map(normKey));
        for (const example of Array.isArray(lesson.examples)?lesson.examples:[]) {
          const key = normKey(typeof example === 'string' ? example : example && (example.text || example.sentence));
          if (key && !seen.has(key)) { combined.push(example); seen.add(key); }
        }
        existing.examples = combined;
        for (const key of ['title','titleAr','level','track','summary','formula','mistake','tip']) {
          if (!existing[key] && lesson[key]) existing[key] = lesson[key];
        }
      }
    }
    return Array.from(byId.values());
  }

  function getLessons() {
    return lessonSources().filter(lesson => Array.isArray(lesson.examples) && lesson.examples.some(example => {
      const value = typeof example === 'string' ? example : example && (example.text || example.sentence);
      return typeof value === 'string' && value.trim();
    }));
  }

  function getExamples() {
    const output = [];
    for (const lesson of getLessons()) {
      const seen = new Set();
      for (const [index, raw] of lesson.examples.entries()) {
        const sentence = norm(typeof raw === 'string' ? raw : raw && (raw.text || raw.sentence));
        if (!sentence) continue;
        const key = normKey(sentence);
        if (seen.has(key)) continue;
        seen.add(key);
        output.push({
          id: String(lesson.id) + '--example-' + (index + 1),
          lessonId: String(lesson.id),
          level: String(lesson.level || 'B1'),
          title: String(lesson.title || lesson.id),
          titleAr: String(lesson.titleAr || lesson.title || lesson.id),
          track: String(lesson.track || 'Grammar'),
          sentence,
          summary: String(lesson.summary || ''),
          formula: String(lesson.formula || ''),
          mistake: String(lesson.mistake || ''),
          tip: String(lesson.tip || '')
        });
      }
    }
    return output;
  }

  function filtered(rows) {
    const search = query.trim().toLocaleLowerCase();
    return rows.filter(row => {
      if (level !== 'all' && row.level !== level) return false;
      if (topic !== 'all' && row.lessonId !== topic) return false;
      if (search) {
        const text = [row.sentence,row.title,row.titleAr,row.track,row.level,row.summary,row.formula,row.mistake,row.tip].join(' ').toLocaleLowerCase();
        if (!text.includes(search)) return false;
      }
      return true;
    });
  }

  function statsHTML(rows) {
    const lessons = new Set(rows.map(row => row.lessonId));
    const levels = new Set(rows.map(row => row.level));
    return '<div class="ege-stats">' +
      '<div><strong>' + rows.length.toLocaleString('en-US') + '</strong><span>مثال متاح</span></div>' +
      '<div><strong>' + lessons.size.toLocaleString('en-US') + '</strong><span>قاعدة مرتبطة بأمثلة</span></div>' +
      '<div><strong>' + levels.size.toLocaleString('en-US') + '</strong><span>مستوى تدريبي</span></div>' +
      '</div>';
  }

  function option(value,label,selected) {
    return '<option value="' + esc(value) + '"' + (selected?' selected':'') + '>' + esc(label) + '</option>';
  }

  function filtersHTML(rows) {
    const levels = ['all',...Array.from(new Set(rows.map(row=>row.level))).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))];
    const topics = getLessons().filter(lesson => rows.some(row => row.lessonId === String(lesson.id)))
      .sort((a,b)=>String(a.titleAr||a.title).localeCompare(String(b.titleAr||b.title),'ar'));
    return '<div class="ege-filters">' +
      '<label>المستوى<select data-ege-level>' + levels.map(value=>option(value,value==='all'?'كل المستويات':(LEVEL_LABELS[value]||value),level===value)).join('') + '</select></label>' +
      '<label>القاعدة<select data-ege-topic>' + option('all','كل القواعد',topic==='all') +
      topics.map(lesson=>option(String(lesson.id),String(lesson.titleAr||lesson.title||lesson.id) + ' · ' + String(lesson.level||'B1'),topic===String(lesson.id))).join('') +
      '</select></label>' +
      '<label class="ege-search-label">ابحث في الأمثلة والقواعد<input type="search" data-ege-search value="' + esc(query) + '" placeholder="مثال: present perfect أو الشرط" autocomplete="off"></label>' +
      '</div>';
  }

  function cardHTML(row) {
    const details = (row.summary || row.formula || row.mistake || row.tip)
      ? '<details class="ege-rule-details"><summary>افهم القاعدة وراء المثال</summary>' +
        (row.summary ? '<p>' + esc(row.summary) + '</p>' : '') +
        (row.formula ? '<div class="ege-formula"><b>الصيغة</b><span dir="ltr" lang="en">' + esc(row.formula) + '</span></div>' : '') +
        (row.mistake ? '<p><b>خطأ شائع:</b> ' + esc(row.mistake) + '</p>' : '') +
        (row.tip ? '<p><b>تلميح:</b> ' + esc(row.tip) + '</p>' : '') +
      '</details>'
      : '';
    return '<article class="ege-card">' +
      '<div class="ege-card-meta"><span class="ege-level">' + esc(row.level) + '</span><span>' + esc(row.track) + '</span></div>' +
      '<h4>' + esc(row.titleAr) + '</h4><p class="ege-rule-name" lang="en" dir="ltr">' + esc(row.title) + '</p>' +
      '<blockquote class="ege-sentence" dir="ltr" lang="en">' + esc(row.sentence) + '</blockquote>' +
      details +
      '<div class="ege-card-actions"><button class="ege-btn" data-ea-lesson="' + esc(row.lessonId) + '">افتح شرح القاعدة ↗</button></div>' +
      '</article>';
  }

  function resultsHTML(rows) {
    const list = filtered(rows);
    const count = document.getElementById('egeCount');
    const cards = document.getElementById('egeCards');
    const more = document.querySelector('#seragGrammarExamples [data-ege-action="more"]');
    if (count) count.textContent = list.length
      ? 'عرض ' + Math.min(visibleLimit,list.length).toLocaleString('en-US') + ' من ' + list.length.toLocaleString('en-US') + ' مثال'
      : 'لا توجد أمثلة مطابقة للفلاتر الحالية';
    if (cards) cards.innerHTML = list.length
      ? list.slice(0,visibleLimit).map(cardHTML).join('')
      : '<div class="ege-empty"><b>ملقيناش أمثلة مطابقة.</b><p>جرّب مستوى أو قاعدة مختلفة، أو امسح كلمة البحث.</p><button class="ege-btn" data-ege-action="reset">عرض كل الأمثلة</button></div>';
    if (more) more.hidden = visibleLimit >= list.length;
  }

  function html() {
    bindRoot();
    const rows = getExamples();
    const initialList = filtered(rows);
    const initialCards = initialList.length
      ? initialList.slice(0,visibleLimit).map(cardHTML).join('')
      : '<div class="ege-empty"><b>ملقيناش أمثلة مطابقة.</b><p>جرّب مستوى أو قاعدة مختلفة، أو امسح كلمة البحث.</p><button class="ege-btn" data-ege-action="reset">عرض كل الأمثلة</button></div>';
    const initialCount = initialList.length
      ? 'عرض ' + Math.min(visibleLimit,initialList.length).toLocaleString('en-US') + ' من ' + initialList.length.toLocaleString('en-US') + ' مثال'
      : 'لا توجد أمثلة مطابقة للفلاتر الحالية';
    return '<section id="seragGrammarExamples" class="ege-root">' +
      '<header class="ege-intro"><div><span class="ege-kicker">SERAG ENGLISH · EXAMPLE LIBRARY</span>' +
      '<h3>بنك أمثلة القواعد</h3>' +
      '<p>شوف القاعدة في جمل فعلية من دروس المنهج، وابحث باسم القاعدة أو الصيغة أو الجملة. كل مثال مرتبط بدرس تقدر تفتحه مباشرة.</p></div>' +
      '<a class="ege-source-link" href="' + SCORE_URL + '" target="_blank" rel="noopener noreferrer">استكشف SCoRE الرسمي ↗</a></header>' +
      statsHTML(rows) +
      filtersHTML(rows) +
      '<div id="egeCount" class="ege-count">' + esc(initialCount) + '</div>' +
      '<div id="egeCards" class="ege-grid">' + initialCards + '</div>' +
      '<div class="ege-load-more"><button class="ege-btn primary" data-ege-action="more"' + (visibleLimit >= initialList.length ? ' hidden' : '') + '>حمّل أمثلة إضافية ↓</button></div>' +
      '<aside class="ege-corpus-note"><b>مصدر إضافي:</b> يوفّر SCoRE الرسمي أكثر من 10,000 جملة مصنّفة ضمن 22 موضوعًا نحويًا وثلاثة مستويات، لكنه يُعرض هنا كرابط خارجي ولا ننسخ بياناته إلى هذا البنك. محتوى SCoRE مرخّص CC BY-NC-SA 4.0.</aside>' +
      '<p class="ege-attribution">الأمثلة المحلية مجمّعة من دروس القواعد الموجودة في Serag OS. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">تفاصيل ترخيص SCoRE ↗</a></p>' +
      '</section>';
  }

  function paintResults() { resultsHTML(getExamples()); }

  function handleClick(event) {
    const button = event.target && event.target.closest ? event.target.closest('[data-ege-action]') : null;
    if (!button || !document.getElementById('seragGrammarExamples')) return;
    const action = button.getAttribute('data-ege-action');
    if (action === 'more') { visibleLimit += 24; paintResults(); }
    if (action === 'reset') {
      query='';level='all';topic='all';visibleLimit=24;
      const root=document.getElementById('seragGrammarExamples');
      const search=root?.querySelector('[data-ege-search]');
      const levelSelect=root?.querySelector('[data-ege-level]');
      const topicSelect=root?.querySelector('[data-ege-topic]');
      if(search)search.value='';
      if(levelSelect)levelSelect.value='all';
      if(topicSelect)topicSelect.value='all';
      paintResults();
    }
  }

  function handleChange(event) {
    const target=event.target;
    if(!target)return;
    if(target.matches('[data-ege-level]')) level=target.value;
    else if(target.matches('[data-ege-topic]')) topic=target.value;
    else return;
    visibleLimit=24;
    paintResults();
  }

  function handleInput(event) {
    const target=event.target;
    if(!target || !target.matches('[data-ege-search]'))return;
    query=target.value;
    visibleLimit=24;
    paintResults();
  }

  function bindRoot() {
    const root=document.getElementById('ea12Center');
    if(!root || root===boundRoot || !root.addEventListener)return;
    boundRoot=root;
    root.addEventListener('click',handleClick);
    root.addEventListener('change',handleChange);
    root.addEventListener('input',handleInput);
  }

  window.SERAG_GRAMMAR_EXAMPLES_V1 = {
    version:1,
    html,
    getLessons,
    getExamples,
    filter: (filters={}) => {
      const previous={query,level,topic};
      query=String(filters.query??'');
      level=String(filters.level??'all');
      topic=String(filters.topic??'all');
      const result=filtered(getExamples());
      query=previous.query;level=previous.level;topic=previous.topic;
      return result;
    }
  };
})();