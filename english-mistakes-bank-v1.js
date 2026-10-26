/* Serag English Mistake Correction Bank v1.
   Uses the MIT-licensed Elispeak text dataset. Progress is local-only and is not written to quiz arrays or Supabase. */
(() => {
  'use strict';
  const DATA_URL = '/data/review/english-mistakes-bank-v1.jsonl';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const categoryLabels = {
    article: 'أدوات a / an / the',
    collocation: 'التراكيب الشائعة',
    conditional: 'الجمل الشرطية',
    countability: 'الأسماء المعدودة وغير المعدودة',
    modal: 'الأفعال الناقصة',
    preposition: 'حروف الجر',
    pronoun: 'الضمائر',
    question: 'تكوين الأسئلة',
    tense: 'الأزمنة',
    verb_pattern: 'تركيب الأفعال',
    word_choice: 'اختيار الكلمة',
    word_order: 'ترتيب الكلمات'
  };
  let rows = [];
  let loadPromise = null;
  let loadError = '';
  let query = '';
  let level = 'B1';
  let category = 'all';
  let statusFilter = 'all';
  let index = 0;
  let answer = '';
  let revealed = false;
  let feedback = null;
  let progress = {};
  let progressOwner = '';
  let boundRoot = null;

  function storageKey() {
    const owner = window.user && window.user.id ? String(window.user.id) : 'guest';
    return 'serag:english-mistakes-bank:v1:' + owner;
  }
  function syncProgressOwner() {
    const key = storageKey();
    if (key === progressOwner) return;
    progressOwner = key;
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || '{}');
      progress = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) { progress = {}; }
  }
  function saveProgress() {
    syncProgressOwner();
    try { window.localStorage.setItem(progressOwner, JSON.stringify(progress)); } catch (_) {}
  }
  function validateRows(input) {
    const errors = [];
    if (!Array.isArray(input)) return ['dataset must be an array'];
    const ids = new Set();
    input.forEach((row, i) => {
      const label = row && row.id ? row.id : 'row ' + (i + 1);
      if (!row || typeof row !== 'object') { errors.push(label + ': invalid record'); return; }
      ['id','category','cefr','learner_sentence','corrected_sentence','explanation','explanation_ar','practice_prompt','practice_prompt_ar'].forEach(key => {
        if (typeof row[key] !== 'string' || !row[key].trim()) errors.push(label + ': missing ' + key);
      });
      if (ids.has(row.id)) errors.push(label + ': duplicate id');
      ids.add(row.id);
      if (row.learner_sentence === row.corrected_sentence) errors.push(label + ': no correction');
      if (!['A1','A2','B1','B2','C1','C2'].includes(row.cefr)) errors.push(label + ': invalid CEFR level');
      if (!Array.isArray(row.tags) || !row.tags.length) errors.push(label + ': missing tags');
    });
    return errors;
  }
  function ensureLoaded() {
    if (rows.length || loadPromise) return;
    loadError = '';
    if (!window.fetch) {
      loadError = 'متصفحك لا يدعم تحميل مكتبة الأخطاء.';
      paint();
      return;
    }
    loadPromise = window.fetch(DATA_URL, { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(text => {
        const parsed = text.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
        const errors = validateRows(parsed);
        if (errors.length) throw new Error(errors.slice(0, 3).join('; '));
        rows = parsed;
        loadError = '';
        syncProgressOwner();
        index = firstVisibleIndex();
        paint();
      })
      .catch(error => {
        loadError = 'تعذّر تحميل بنك الأخطاء. تأكد من اتصالك ثم جرّب مرة أخرى.';
        loadPromise = null;
        paint();
      });
  }
  function progressFor(row) {
    return row && progress[row.id] ? progress[row.id] : {};
  }
  function rowStatus(row) {
    const current = progressFor(row);
    return current.status || 'new';
  }
  function filteredRows() {
    syncProgressOwner();
    const q = query.trim().toLocaleLowerCase();
    return rows.filter(row => {
      if (level !== 'all' && row.cefr !== level) return false;
      if (category !== 'all' && row.category !== category) return false;
      const state = rowStatus(row);
      if (statusFilter === 'new' && state !== 'new') return false;
      if (statusFilter === 'review' && state !== 'review') return false;
      if (statusFilter === 'learned' && state !== 'learned') return false;
      if (q) {
        const searchable = [
          row.learner_sentence, row.corrected_sentence, row.explanation,
          row.explanation_ar, row.practice_prompt, row.practice_prompt_ar,
          categoryLabels[row.category] || row.category, row.cefr, (row.tags || []).join(' ')
        ].join(' ').toLocaleLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }
  function firstVisibleIndex() {
    const list = filteredRows();
    const unseen = list.findIndex(row => rowStatus(row) === 'new');
    return unseen >= 0 ? unseen : 0;
  }
  function currentRow(list) {
    const items = list || filteredRows();
    if (!items.length) return null;
    if (index < 0) index = 0;
    if (index >= items.length) index = items.length - 1;
    return items[index];
  }
  function norm(value) {
    return String(value || '').toLocaleLowerCase()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function statsHTML() {
    const reviewed = Object.keys(progress).filter(id => progress[id] && (progress[id].attempts || progress[id].status === 'learned' || progress[id].status === 'review')).length;
    const learned = Object.keys(progress).filter(id => progress[id] && progress[id].status === 'learned').length;
    const needs = Object.keys(progress).filter(id => progress[id] && progress[id].status === 'review').length;
    return '<div class="emb-stats">' +
      '<div><strong>' + rows.length.toLocaleString('en-US') + '</strong><span>مثال تصحيح</span></div>' +
      '<div><strong>' + reviewed.toLocaleString('en-US') + '</strong><span>بدأت مراجعته</span></div>' +
      '<div><strong>' + learned.toLocaleString('en-US') + '</strong><span>فهمت قاعدته</span></div>' +
      '<div><strong>' + needs.toLocaleString('en-US') + '</strong><span>يحتاج مراجعة</span></div>' +
      '</div>';
  }
  function option(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (selected ? ' selected' : '') + '>' + esc(label) + '</option>';
  }
  function filtersHTML() {
    const levels = ['all','A2','B1','B2'];
    const levelNames = {all:'كل المستويات',A2:'A2 · قبل المتوسط',B1:'B1 · متوسط',B2:'B2 · فوق المتوسط',C1:'C1 · متقدم'};
    const categories = ['all'].concat(Array.from(new Set(rows.map(row => row.category))));
    const statuses = [
      ['all','كل الحالات'],
      ['new','لم أراجعها'],
      ['review','تحتاج مراجعة'],
      ['learned','فهمت قاعدتها']
    ];
    return '<div class="emb-filters">' +
      '<label>المستوى<select data-emb-level>' + levels.map(v => option(v, levelNames[v], level === v)).join('') + '</select></label>' +
      '<label>نوع الخطأ<select data-emb-category>' + categories.map(v => option(v, v === 'all' ? 'كل أنواع الأخطاء' : (categoryLabels[v] || v), category === v)).join('') + '</select></label>' +
      '<label>حالة المراجعة<select data-emb-status>' + statuses.map(v => option(v[0],v[1],statusFilter === v[0])).join('') + '</select></label>' +
      '<label class="emb-search-label">ابحث في الجمل والقواعد<input type="search" data-emb-search value="' + esc(query) + '" placeholder="مثال: present perfect أو حروف الجر" autocomplete="off"></label>' +
      '</div>';
  }
  function currentCardHTML(row, list) {
    if (!row) {
      return '<article class="emb-empty"><h4>مفيش نتائج مطابقة</h4><p>جرّب مستوى أو نوع خطأ مختلف، أو امسح البحث.</p><button class="emb-btn" data-emb-action="resetfilters">عرض كل الأمثلة</button></article>';
    }
    const state = rowStatus(row);
    const stateLabel = state === 'learned' ? 'فهمت القاعدة' : state === 'review' ? 'تحتاج مراجعة' : 'جديدة';
    const item = progressFor(row);
    const showCorrection = revealed;
    const feedbackHTML = feedback
      ? '<p class="emb-feedback ' + esc(feedback.type) + '" role="status">' + esc(feedback.text) + '</p>'
      : '';
    const correctionHTML = showCorrection
      ? '<section class="emb-correction"><div class="emb-label">التصحيح الصحيح</div>' +
        '<p class="emb-corrected" lang="en" dir="ltr">' + esc(row.corrected_sentence) + '</p>' +
        '<div class="emb-explanations"><div><b>القاعدة بالإنجليزية</b><p lang="en" dir="ltr">' + esc(row.explanation) + '</p></div>' +
        '<div><b>شرح بالعربي</b><p dir="rtl" lang="ar">' + esc(row.explanation_ar) + '</p></div></div>' +
        '<div class="emb-prompt"><b>طبّق بنفسك</b><p lang="en" dir="ltr">' + esc(row.practice_prompt) + '</p>' +
        '<p dir="rtl" lang="ar">' + esc(row.practice_prompt_ar) + '</p></div>' +
        '<div class="emb-actions"><button class="emb-btn primary" data-emb-action="learned">فهمت القاعدة</button><button class="emb-btn" data-emb-action="review">محتاج أراجعها</button></div>' +
        '</section>'
      : '';
    return '<article class="emb-card">' +
      '<header class="emb-card-head"><div><span class="emb-label">الجملة قبل التصحيح</span><h4 lang="en" dir="ltr">' + esc(row.learner_sentence) + '</h4></div>' +
      '<div class="emb-meta"><span>' + esc(row.cefr) + '</span><span>' + esc(categoryLabels[row.category] || row.category) + '</span><span>' + esc(stateLabel) + '</span></div></header>' +
      '<div class="emb-attempt"><label for="embAnswer">جرّب تصلّح الجملة بنفسك</label><input id="embAnswer" data-emb-answer-input type="text" dir="ltr" lang="en" value="' + esc(answer) + '" placeholder="Type the corrected sentence..." autocomplete="off" spellcheck="false"></div>' +
      '<div class="emb-actions"><button class="emb-btn primary" data-emb-action="check">تحقق من إجابتي</button><button class="emb-btn" data-emb-action="reveal">' + (showCorrection ? 'التصحيح ظاهر' : 'اكشف التصحيح والشرح') + '</button></div>' +
      feedbackHTML + correctionHTML +
      '<footer class="emb-card-foot"><span>المصدر: Elispeak Common English Mistakes · MIT</span><span>المحاولات: ' + Number(item.attempts || 0).toLocaleString('en-US') + '</span></footer>' +
      '</article>';
  }
  function countText(list) {
    if (!list.length) return 'لا توجد نتائج مطابقة';
    return 'المثال ' + (index + 1).toLocaleString('en-US') + ' من ' + list.length.toLocaleString('en-US') + ' في الفلتر الحالي';
  }
  function contentHTML() {
    syncProgressOwner();
    if (loadError) {
      return '<div class="emb-intro"><span class="emb-kicker">SERAG ENGLISH · CORRECTION LAB</span><h3>بنك الأخطاء والتصحيح</h3><p>' + esc(loadError) + '</p><button class="emb-btn primary" data-emb-action="retry">حاول مرة أخرى</button></div>';
    }
    if (!rows.length) {
      return '<div class="emb-intro"><span class="emb-kicker">SERAG ENGLISH · CORRECTION LAB</span><h3>بنك الأخطاء والتصحيح</h3><p>بنحمّل الأمثلة…</p></div>';
    }
    const list = filteredRows();
    const row = currentRow(list);
    return '<div class="emb-intro"><div><span class="emb-kicker">SERAG ENGLISH · CORRECTION LAB</span><h3>اتعلّم من الخطأ، مش من حفظ الإجابة</h3>' +
      '<p>اقرأ الجملة، اكتب تصحيحك، وبعدها قارن بالحل والشرح. الأمثلة متدرجة، والتقدم محفوظ محليًا على جهازك.</p></div>' +
      '<span class="emb-source-pill">محتوى مفتوح · مع نسب المصدر</span></div>' +
      statsHTML() +
      filtersHTML() +
      '<div class="emb-count" id="embCount">' + esc(countText(list)) + '</div>' +
      '<div class="emb-current" id="embCurrent">' + currentCardHTML(row,list) + '</div>' +
      '<div class="emb-navigation"><button class="emb-btn" data-emb-action="prev"' + (index <= 0 || !list.length ? ' disabled' : '') + '>← السابق</button>' +
      '<button class="emb-btn primary" data-emb-action="next"' + (index >= list.length - 1 || !list.length ? ' disabled' : '') + '>المثال التالي →</button>' +
      '<button class="emb-btn" data-emb-action="restart"' + (!list.length || index === 0 ? ' hidden' : '') + '>ابدأ المجموعة من الأول</button></div>' +
      '<p class="emb-caution">ملاحظة: الجمل الإنجليزية من مصدر مرخص MIT. الشرح العربي والتطبيق العربي إضافات تحريرية أولية لم تخضع لمراجعة بشرية مستقلة؛ تعامل معها كوسيلة تدريب وراجع السياق عند الحاجة.</p>' +
      '<p class="emb-attribution">المصدر: <a href="https://github.com/elispeak/elispeak-common-english-mistakes" target="_blank" rel="noopener noreferrer">Elispeak Common English Mistakes</a> · <a href="https://opensource.org/license/mit/" target="_blank" rel="noopener noreferrer">MIT License</a>.</p>';
  }
  function html() {
    bindRoot();
    ensureLoaded();
    return '<section id="seragMistakesBank" class="emb-root">' + contentHTML() + '</section>';
  }
  function paint() {
    const container = document.getElementById('seragMistakesBank');
    if (container) container.innerHTML = contentHTML();
  }
  function paintCurrent() {
    const list = filteredRows();
    const card = document.getElementById('embCurrent');
    const count = document.getElementById('embCount');
    if (count) count.textContent = countText(list);
    if (card) card.innerHTML = currentCardHTML(currentRow(list),list);
    const nav = document.querySelector('#seragMistakesBank .emb-navigation');
    if (nav) {
      const prev = nav.querySelector('[data-emb-action="prev"]');
      const next = nav.querySelector('[data-emb-action="next"]');
      const restart = nav.querySelector('[data-emb-action="restart"]');
      if (prev) prev.disabled = index <= 0 || !list.length;
      if (next) next.disabled = index >= list.length - 1 || !list.length;
      if (restart) restart.hidden = !list.length || index === 0;
    }
  }
  function recordAttempt(row, correct) {
    syncProgressOwner();
    const old = progress[row.id] || {};
    progress[row.id] = {
      status: correct && old.status === 'learned' ? 'learned' : (correct ? (old.status || 'new') : 'review'),
      attempts: Number(old.attempts || 0) + 1,
      correct: Number(old.correct || 0) + (correct ? 1 : 0),
      lastReviewedAt: new Date().toISOString()
    };
    saveProgress();
  }
  function handleClick(event) {
    const button = event.target && event.target.closest ? event.target.closest('[data-emb-action]') : null;
    if (!button || !document.getElementById('seragMistakesBank')) return;
    const action = button.getAttribute('data-emb-action');
    if (action === 'retry') {
      loadPromise = null;
      loadError = '';
      ensureLoaded();
      return;
    }
    if (action === 'resetfilters') {
      level = 'all'; category = 'all'; statusFilter = 'all'; query = '';
      index = 0; answer = ''; revealed = false; feedback = null;
      paint();
      return;
    }
    const list = filteredRows();
    const row = currentRow(list);
    if (action === 'next' && index < list.length - 1) {
      index++; answer = ''; revealed = false; feedback = null; paint(); return;
    }
    if (action === 'prev' && index > 0) {
      index--; answer = ''; revealed = false; feedback = null; paint(); return;
    }
    if (action === 'restart') {
      index = 0; answer = ''; revealed = false; feedback = null; paint(); return;
    }
    if (!row) return;
    if (action === 'reveal') {
      revealed = true;
      feedback = null;
      paint();
      return;
    }
    if (action === 'check') {
      const input = document.getElementById('embAnswer');
      answer = input ? input.value : answer;
      if (!answer.trim()) {
        feedback = {type:'hint',text:'اكتب الجملة المصححة الأول، أو اكشف التصحيح لو محتاج مساعدة.'};
        paint();
        return;
      }
      const correct = norm(answer) === norm(row.corrected_sentence);
      recordAttempt(row, correct);
      revealed = true;
      feedback = correct
        ? {type:'good',text:'ممتاز! تصحيحك مطابق. اقرأ القاعدة مرة، وبعدها طبّقها في جملة من عندك.'}
        : {type:'bad',text:'لسه فيه اختلاف. قارن إجابتك بالتصحيح، وحدد الجزء اللي اتغيّر.'};
      paint();
      return;
    }
    if (action === 'learned' || action === 'review') {
      syncProgressOwner();
      const old = progress[row.id] || {};
      progress[row.id] = {
        status: action === 'learned' ? 'learned' : 'review',
        attempts: Number(old.attempts || 0),
        correct: Number(old.correct || 0),
        lastReviewedAt: new Date().toISOString()
      };
      saveProgress();
      feedback = {type:'hint',text:action === 'learned' ? 'اتسجلت كقاعدة فهمتها. ارجع لها لاحقًا للتثبيت.' : 'اتسجلت للمراجعة. جرّب تعود لها بعد ما تحل أمثلة أخرى.'};
      paint();
    }
  }
  function handleChange(event) {
    const target = event.target;
    if (!target) return;
    if (target.matches('[data-emb-level]')) level = target.value;
    else if (target.matches('[data-emb-category]')) category = target.value;
    else if (target.matches('[data-emb-status]')) statusFilter = target.value;
    else return;
    index = firstVisibleIndex();
    answer = ''; revealed = false; feedback = null;
    paint();
  }
  function handleInput(event) {
    const target = event.target;
    if (!target) return;
    if (target.matches('[data-emb-answer-input]')) {
      answer = target.value;
      return;
    }
    if (target.matches('[data-emb-search]')) {
      query = target.value;
      index = 0; answer = ''; revealed = false; feedback = null;
      paintCurrent();
    }
  }
  function bindRoot() {
    const root = document.getElementById('ea12Center');
    if (!root || root === boundRoot) return;
    boundRoot = root;
    root.addEventListener('click', handleClick);
    root.addEventListener('change', handleChange);
    root.addEventListener('input', handleInput);
  }

  window.SERAG_MISTAKES_BANK_V1 = {
    version: 1,
    dataUrl: DATA_URL,
    html,
    validateRows,
    categoryLabels,
    statusFor: row => rowStatus(row),
    loadedCount: () => rows.length
  };
})();