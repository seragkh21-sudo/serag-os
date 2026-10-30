/* EngoPlay quest gameplay: sentence-building challenges using the existing Serag grammar bank. */
(function () {
  'use strict';

  var PREFIX = 'seragEngoplayQuestV1:';
  var DIALOG_ID = 'eqQuestDialog';
  var observer = null;
  var initialized = false;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);
    });
  }
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (_) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function todayKey(value) {
    var date = value ? new Date(value) : new Date();
    if (Number.isNaN(+date)) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }
  function shiftDay(day, offset) {
    var p = String(day).split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + offset, 12));
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }
  function ownerKey() {
    if (window.ENGOPLAY && window.ENGOPLAY.owner) return 'user:' + String(window.ENGOPLAY.owner);
    try {
      if (window.user && window.user.id) return 'user:' + String(window.user.id);
    } catch (_) {}
    return 'guest';
  }
  function storageKey(owner) { return PREFIX + owner; }
  function hash(value) {
    var h = 2166136261, text = String(value);
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function tokensFromSentence(sentence) {
    return String(sentence == null ? '' : sentence).trim().split(/\s+/).filter(Boolean);
  }
  function normalizeSentence(sentence) {
    return String(sentence == null ? '' : sentence)
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.!?…]+$/g, '')
      .toLocaleLowerCase();
  }
  function pickDailyExamples(examples, owner, day, excludeIds) {
    var usable = (Array.isArray(examples) ? examples : []).filter(function (row) {
      return row && row.id != null && typeof row.sentence === 'string' &&
        tokensFromSentence(row.sentence).length >= 5 &&
        tokensFromSentence(row.sentence).length <= 24 &&
        row.sentence.length <= 180 && ! /_{2,}|\.{3,}/.test(row.sentence);
    });
    usable.sort(function (a, b) {
      var ka = hash(day + '|' + owner + '|' + a.id);
      var kb = hash(day + '|' + owner + '|' + b.id);
      return ka - kb || String(a.id).localeCompare(String(b.id));
    });
    var excluded = new Set((Array.isArray(excludeIds) ? excludeIds : []).map(String));
    var fresh = usable.filter(function (row) { return !excluded.has(String(row.id)); });
    var fallback = usable.filter(function (row) { return excluded.has(String(row.id)); });
    // Prefer examples not used recently; only reuse older examples when the bank is too small.
    return fresh.concat(fallback).slice(0, 3).map(function (row) { return String(row.id); });
  }
  function streakForDates(completedDates, today) {
    var set = new Set((Array.isArray(completedDates) ? completedDates : []).map(String));
    var cursor = set.has(today) ? today : shiftDay(today, -1);
    var count = 0;
    while (set.has(cursor) && count < 3650) {
      count++;
      cursor = shiftDay(cursor, -1);
    }
    return count;
  }
  function rewardPoints(mistakes, hintUsed) {
    if (Number(mistakes) === 0 && !hintUsed) return 10;
    if (Number(mistakes) <= 1) return 7;
    return 5;
  }
  function sharedProgress() {
    try {
      var engine = window.ENGOPLAY;
      if (!engine || typeof engine.stats !== 'function') return null;
      var result = engine.stats();
      if (!result || typeof result !== 'object') return null;
      return {
        xp: Math.max(0, Number(result.totalXP) || 0),
        streak: Math.max(0, Number(result.current) || 0)
      };
    } catch (_) { return null; }
  }
  function examples() {
    var bank = window.SERAG_GRAMMAR_EXAMPLES_V1;
    if (!bank || typeof bank.getExamples !== 'function') return [];
    try { return bank.getExamples() || []; } catch (_) { return []; }
  }
  function emptyState(owner, day, rows, recentIds) {
    return {
      points: 0,
      sessions: 0,
      completedDates: [],
      recentExampleIds: Array.isArray(recentIds) ? recentIds.slice(-90) : [],
      daily: {
        date: day,
        ids: pickDailyExamples(rows, owner, day, recentIds),
        index: 0,
        bank: [],
        selected: [],
        hintUsed: false,
        mistakes: 0,
        reward: 0,
        correct: false,
        answerStatus: '',
        feedback: ''
      }
    };
  }
  function currentExample(state, rows) {
    var id = state && state.daily && state.daily.ids && state.daily.ids[state.daily.index];
    return rows.find(function (row) { return String(row.id) === String(id); }) || null;
  }
  function prepareQuestion(state, rows, owner) {
    var daily = state.daily;
    var example = currentExample(state, rows);
    if (!example || daily.bank.length) return;
    var words = tokensFromSentence(example.sentence);
    for (var i = words.length - 1; i > 0; i--) {
      var j = hash(owner + '|' + daily.date + '|' + example.id + '|' + i) % (i + 1);
      var temp = words[i]; words[i] = words[j]; words[j] = temp;
    }
    if (words.join(' ') === tokensFromSentence(example.sentence).join(' ') && words.length > 2) {
      words.push(words.shift());
    }
    daily.bank = words;
    daily.selected = [];
    daily.hintUsed = false;
    daily.mistakes = 0;
    daily.reward = 0;
    daily.correct = false;
    daily.answerStatus = '';
    daily.feedback = '';
  }
  function getState() {
    var owner = ownerKey(), day = todayKey(), rows = examples();
    var state = read(storageKey(owner), null);
    if (!state || typeof state !== 'object') state = emptyState(owner, day, rows);
    if (!Array.isArray(state.completedDates)) state.completedDates = [];
    state.completedDates = state.completedDates.filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(String(x)); }).slice(-180);
    if (!Array.isArray(state.recentExampleIds)) state.recentExampleIds = [];
    state.recentExampleIds = state.recentExampleIds.map(String).slice(-90);
    state.points = Math.max(0, Number(state.points) || 0);
    state.sessions = Math.max(0, Number(state.sessions) || 0);
    if (!state.daily || state.daily.date !== day || !Array.isArray(state.daily.ids)) {
      var previousIds = Array.isArray(state.daily && state.daily.ids) ? state.daily.ids.map(String) : [];
      state.recentExampleIds = state.recentExampleIds.concat(previousIds).filter(function (id, index, all) { return all.lastIndexOf(id) === index; }).slice(-90);
      state.daily = emptyState(owner, day, rows, state.recentExampleIds).daily;
    }
    if (!Array.isArray(state.daily.bank)) state.daily.bank = [];
    if (!Array.isArray(state.daily.selected)) state.daily.selected = [];
    if (!Array.isArray(state.daily.ids) || !state.daily.ids.length) state.daily.ids = pickDailyExamples(rows, owner, day, state.recentExampleIds);
    if (!Number.isInteger(state.daily.index) || state.daily.index < 0) state.daily.index = 0;
    if (state.daily.index > 2) state.daily.index = 2;
    if (state.daily.completed) state.daily.index = 2;
    if (!state.daily.completed) prepareQuestion(state, rows, owner);
    write(storageKey(owner), state);
    return { owner: owner, state: state, rows: rows };
  }
  function save(bundle) { write(storageKey(bundle.owner), bundle.state); }
  function setStatus(message) {
    var el = document.querySelector('[data-eq-storage-status]');
    if (el) el.textContent = message || '';
  }
  function panelMarkup(bundle) {
    var state = bundle.state, daily = state.daily, complete = !!daily.completed;
    var shared = sharedProgress();
    var streak = shared ? shared.streak : streakForDates(state.completedDates, daily.date);
    var totalXP = shared ? shared.xp : state.points;
    var progress = complete ? 3 : Math.min(3, daily.index + (daily.correct ? 1 : 0));
    var available = daily.ids.length >= 3;
    var label = complete ? 'اعرض نتيجتك' : 'ابدأ تحدّي الجمل';
    return '<section class="eq-quest-panel" data-eq-panel data-eq-owner="' + esc(bundle.owner) + '" aria-labelledby="eqQuestPanelTitle">' +
      '<div class="eq-quest-copy"><div class="eq-eyebrow"><span class="eq-spark">✦</span> ENGOPLAY · DAILY QUEST</div>' +
      '<h3 id="eqQuestPanelTitle">خلّي الإنجليزي لعبة بتكسب منها</h3>' +
      '<p>رتّب كلمات من أمثلة القواعد الحقيقية، استخدم التلميح عند الحاجة، وخد نقاط على كل جملة تبنيها صح.</p>' +
      '<div class="eq-quest-tags"><span>ترتيب جمل</span><span>تصحيح فوري</span><span>نطق عند الطلب</span></div>' +
      '<button class="eq-quest-start" data-eq-open>' + label + ' <span aria-hidden="true">←</span></button>' +
      (!available ? '<p class="eq-unavailable" role="status">التحدّي هيبدأ لما يتوفر ٣ أمثلة جمل صالحة من بنك القواعد. اضغط للعرض أو افتح بنك أمثلة القواعد وتأكد إن الأمثلة محمّلة.</p>' : '') +
      '<small class="eq-local-note">محاولاتك بتدخل في XP وسلسلة EngoPlay، وبتتزامن تلقائيًا عند الاتصال. لو الشبكة فصلت، المحاولات بتفضل في طابور المزامنة.</small></div>' +
      '<div class="eq-quest-stats">' +
      '<div class="eq-stat-main"><span class="eq-stat-icon">✦</span><strong>' + totalXP.toLocaleString('en-US') + '</strong><small>XP · EngoPlay</small></div>' +
      '<div class="eq-stat-pair"><div><strong>🔥 ' + streak + '</strong><small>أيام تحدّي متتالية</small></div><div><strong>' + state.sessions + '</strong><small>تحدّي مكتمل</small></div></div>' +
      '<div class="eq-progress-head"><span>تقدّمك النهارده</span><b>' + progress + '/3</b></div><progress max="3" value="' + progress + '"></progress>' +
      '<div class="eq-mini-path" aria-label="تقدّم التحدّي">' + [0,1,2].map(function (i) { return '<span class="' + (i < progress ? 'is-done' : (i === daily.index && !complete ? 'is-current' : '')) + '">' + (i < progress ? '✓' : (i + 1)) + '</span>'; }).join('') + '</div>' +
      '<div class="eq-storage-status" data-eq-storage-status role="status"></div>' +
      '</div></section>';
  }
  function injectQuestMarkup(html) {
    if (typeof html !== 'string' || html.indexOf('data-eq-panel') >= 0) return html;
    var panel = panelMarkup(getState());
    var navPattern = /(<nav class="ep-tabs"[^>]*>[\s\S]*?<\/nav>)/;
    if (navPattern.test(html)) return html.replace(navPattern, function (match) { return match + panel; });
    var gridPattern = /(<div class="ep-play-grid"[^>]*>)/;
    if (gridPattern.test(html)) return html.replace(gridPattern, function (match) { return panel + match; });
    var headerPattern = /(<header class="ep-top"[^>]*>[\s\S]*?<\/header>)/;
    if (headerPattern.test(html)) return html.replace(headerPattern, function (match) { return match + panel; });
    return html;
  }
  function attachRenderHook() {
    var engine = window.ENGOPLAY;
    if (!engine || typeof engine.renderLobby !== 'function' || engine.renderLobby.__eqQuestWrapped) return false;
    var original = engine.renderLobby;
    var wrapped = function () { return injectQuestMarkup(original.apply(this, arguments)); };
    wrapped.__eqQuestWrapped = true;
    engine.renderLobby = wrapped;
    return true;
  }
  function dialogShell() {
    var dialog = document.getElementById(DIALOG_ID);
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = DIALOG_ID;
    dialog.className = 'eq-quest-dialog';
    dialog.setAttribute('dir', 'rtl');
    dialog.setAttribute('aria-labelledby', 'eqDialogTitle');
    document.body.appendChild(dialog);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    return dialog;
  }
  function dialogMarkup(bundle) {
    var state = bundle.state, daily = state.daily, rows = bundle.rows;
    var progress = daily.completed ? 3 : daily.index + (daily.correct ? 1 : 0);
    var shared = sharedProgress();
    if (daily.completed) {
      return '<button class="eq-close" data-eq-close aria-label="إغلاق">×</button>' +
        '<div class="eq-complete-icon">✦</div><div class="eq-eyebrow">QUEST COMPLETE</div>' +
        '<h2 id="eqDialogTitle">ممتاز! خلّصت تحدّي النهارده.</h2>' +
        '<p class="eq-complete-copy">أنهيت جولة التحدّي. إجاباتك اتسجلت ضمن تقدم EngoPlay، وتقدر تراجعها من سجل المحاولات.</p>' +
        '<div class="eq-complete-total"><strong>' + (shared ? shared.xp : state.points).toLocaleString('en-US') + '</strong><span>إجمالي XP في EngoPlay</span></div>' +
        '<button class="eq-primary-button" data-eq-close>ارجع لرحلتك ←</button>';
    }
    var row = currentExample(state, rows);
    if (!row) {
      return '<button class="eq-close" data-eq-close aria-label="إغلاق">×</button>' +
        '<div class="eq-eyebrow">DAILY QUEST</div><h2 id="eqDialogTitle">بنك الأمثلة لسه بيحمّل</h2>' +
        '<p>اقفل النافذة وافتح التحدّي مرة تانية بعد تحميل بنك أمثلة القواعد.</p><button class="eq-primary-button" data-eq-close>تمام</button>';
    }
    prepareQuestion(state, rows, bundle.owner);
    var selected = new Set(daily.selected);
    var answerStatusClass = daily.answerStatus === 'correct' ? ' eq-tile-correct' :
      (daily.answerStatus === 'incorrect' || daily.answerStatus === 'incomplete' ? ' eq-tile-incorrect' : '');
    var answerStateClass = daily.answerStatus ? ' eq-answer-' + daily.answerStatus : '';
    var answer = daily.selected.map(function (index, pos) {
      return '<button type="button" class="eq-tile eq-tile-selected' + answerStatusClass + '" data-eq-return="' + pos + '" aria-label="إزالة الكلمة ' + esc(daily.bank[index]) + '">' + esc(daily.bank[index]) + '</button>';
    }).join('');
    if (!answer) answer = '<span class="eq-answer-placeholder">اضغط على الكلمات بالترتيب الصحيح هنا</span>';
    var bank = daily.bank.map(function (word, index) {
      if (selected.has(index)) return '';
      return '<button type="button" class="eq-tile" data-eq-take="' + index + '">' + esc(word) + '</button>';
    }).join('');
    var hint = daily.hintUsed ? '<div class="eq-hint"><b>تلميح القاعدة</b>' +
      (row.summary ? '<p>' + esc(row.summary) + '</p>' : '') +
      (row.formula ? '<p class="eq-formula" lang="en" dir="ltr">' + esc(row.formula) + '</p>' : '') +
      (row.tip ? '<p>' + esc(row.tip) + '</p>' : '<p>رتّب الكلمات لتكوين جملة إنجليزية طبيعية، وانتبه لمكان الفعل والفاعل.</p>') +
      '</div>' : '';
    var feedback = daily.feedback ? '<div class="eq-feedback ' + (daily.correct ? 'is-correct' : 'is-incorrect') + '" role="status" aria-live="polite">' + esc(daily.feedback) + '</div>' : '';
    var controls = daily.correct ?
      '<div class="eq-success-actions"><button type="button" class="eq-primary-button eq-next-button" data-eq-next>' +
      '<span class="eq-button-check" aria-hidden="true">✓</span><span>' + (daily.index === 2 ? 'صح! أنهِ التحدّي' : 'صح! تابع للسؤال التالي') + '</span><span class="eq-button-arrow" aria-hidden="true">←</span></button>' +
      '<small>إجابتك صحيحة — جاهز للسؤال اللي بعده؟</small></div>' :
      daily.answerStatus === 'incorrect' ?
      '<div class="eq-action-row eq-retry-row"><button type="button" class="eq-primary-button eq-retry-button" data-eq-clear>عدّل الجملة وجرب تاني ↻</button>' +
      '<button type="button" class="eq-secondary-button" data-eq-audio>اسمع الجملة ◖))</button></div>' :
      '<div class="eq-action-row"><button type="button" class="eq-secondary-button" data-eq-hint>تلميح</button><button type="button" class="eq-secondary-button" data-eq-audio>اسمع الجملة ◖))</button>' +
      '<button type="button" class="eq-primary-button" data-eq-check>تحقّق من الجملة</button>' +
      '<button type="button" class="eq-text-button" data-eq-clear>ابدأ من جديد</button></div>';
    return '<button class="eq-close" data-eq-close aria-label="إغلاق">×</button>' +
      '<div class="eq-dialog-top"><div><div class="eq-eyebrow">DAILY QUEST · SENTENCE BUILDER</div>' +
      '<h2 id="eqDialogTitle">كوّن الجملة</h2><p>اختار كل كلمة بالترتيب. تقدر تغيّر ترتيب إجابتك بالضغط على الكلمة المختارة.</p></div>' +
      '<div class="eq-step-count"><strong>' + (daily.index + 1) + '</strong><span>/ 3</span></div></div>' +
      '<div class="eq-progress-line"><progress max="3" value="' + progress + '"></progress><span>' + progress + ' من 3</span></div>' +
      '<div class="eq-rule-meta"><span>' + esc(row.level || 'B1') + '</span><span>' + esc(row.titleAr || row.title || 'قاعدة نحوية') + '</span></div>' +
      '<div class="eq-build-area"><small>جملتك</small><div class="eq-answer' + answerStateClass + '" dir="ltr" lang="en">' + answer + '</div>' +
      '<div class="eq-word-bank" dir="ltr" lang="en">' + bank + '</div></div>' + hint + feedback + controls +
      '<p class="eq-source-note">بمجرد اختيار آخر كلمة، هتظهر النتيجة بالأخضر أو الأحمر. لو الإجابة صح، اضغط «تابع للسؤال التالي». النطق عند الطلب فقط.</p>';
  }
  function paintDialog() {
    var bundle = getState(), dialog = dialogShell();
    dialog.innerHTML = dialogMarkup(bundle);
    save(bundle);
    return dialog;
  }
  function openDialog() {
    var bundle = getState(), dialog = dialogShell();
    save(bundle);
    dialog.innerHTML = dialogMarkup(bundle);
    if (!dialog.open) dialog.showModal();
  }
  function paintPanel(bundle) {
    bundle = bundle || getState();
    var panel = document.querySelector('.eq-quest-panel');
    if (panel) panel.outerHTML = panelMarkup(bundle);
  }
  function mountPanel() {
    var lobby = document.querySelector('.ep-lobby');
    if (!lobby) return;
    var existing = lobby.querySelector('[data-eq-panel]');
    if (existing) {
      if (existing.getAttribute('data-eq-owner') !== ownerKey()) existing.outerHTML = panelMarkup(getState());
      return;
    }
    var panel = document.createElement('section');
    panel.innerHTML = panelMarkup(getState());
    var quest = panel.firstElementChild;
    var grid = lobby.querySelector('.ep-play-grid');
    var nav = lobby.querySelector('.ep-tabs');
    if (nav && nav.parentNode) nav.parentNode.insertBefore(quest, nav.nextSibling);
    else if (grid && grid.parentNode) grid.parentNode.insertBefore(quest, grid);
    else lobby.appendChild(quest);
  }
  function update(bundle) {
    bundle = bundle || getState();
    save(bundle);
    paintPanel(bundle);
    var dialog = document.getElementById(DIALOG_ID);
    if (dialog && dialog.open) {
      dialog.innerHTML = dialogMarkup(bundle);
    }
  }
  function evaluateAnswer(bundle) {
    var state = bundle.state, daily = state.daily;
    var row = currentExample(state, bundle.rows);
    if (!row || daily.correct) return;
    if (daily.selected.length !== daily.bank.length) {
      daily.correct = false;
      daily.answerStatus = 'incomplete';
      daily.feedback = 'اختار كل الكلمات مرة واحدة عشان نراجع الجملة.';
      return;
    }
    var built = daily.selected.map(function (index) { return daily.bank[index]; }).join(' ');
    if (normalizeSentence(built) === normalizeSentence(row.sentence)) {
      daily.correct = true;
      daily.answerStatus = 'correct';
      daily.reward = rewardPoints(daily.mistakes, daily.hintUsed);
      daily.feedback = 'مظبوط! اتسجلت إجابتك في تقدم EngoPlay.';
    } else {
      daily.mistakes++;
      daily.correct = false;
      daily.answerStatus = 'incorrect';
      daily.feedback = 'مش بالترتيب الصح. الإجابة الصحيحة: ' + row.sentence + ' — جرّب تاني أو راجعها قبل السؤال التالي.';
    }
    recordChallengeAttempt(row, built, daily.correct, bundle);
  }

  function recordChallengeAttempt(row, built, correct, bundle) {
    var at = new Date().toISOString();
    var questionKey = 'sentence-builder:' + String(row && row.id != null ? row.id : 'unknown');
    var owner = bundle && bundle.owner ? String(bundle.owner) : ownerKey();
    var trackedXP = false, syncedAttempt = false;
    try {
      if (window.ENGOPLAY && typeof window.ENGOPLAY.track === 'function') {
        window.ENGOPLAY.track({
          id: questionKey,
          topic: 'sentence-builder',
          correct: !!correct,
          answer: String(built || ''),
          at: at
        });
        trackedXP = true;
      }
    } catch (_) {}
    try {
      var sync = window.SERAG_ENGLISH_ATTEMPT_SYNC_V11;
      if (owner.indexOf('user:') === 0 && sync && typeof sync.trackChallengeAttempt === 'function') {
        sync.trackChallengeAttempt({
          source: 'engoplay_challenge',
          attempt_session: 'sentence-builder:' + todayKey(at) + ':' + owner,
          attempt_order: bundle && bundle.state && bundle.state.daily ? bundle.state.daily.index + 1 : null,
          question_number: bundle && bundle.state && bundle.state.daily ? bundle.state.daily.index + 1 : null,
          section: 'EngoPlay · Sentence Builder',
          question_type: 'sentence_arrange',
          prompt: String(row && row.sentence || ''),
          selected_answer: String(built || ''),
          correct_answer: String(row && row.sentence || ''),
          is_correct: !!correct,
          explanation: String(row && (row.summary || row.tip) || ''),
          metadata: { question_key: questionKey, topic: 'sentence-builder' }
        });
        syncedAttempt = true;
      }
    } catch (_) {}
    return { trackedXP: trackedXP, syncedAttempt: syncedAttempt, questionKey: questionKey };
  }

  function handleClick(event) {
    var button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button) return;
    var actions = ['data-eq-open','data-eq-close','data-eq-take','data-eq-return','data-eq-clear','data-eq-hint','data-eq-check','data-eq-next','data-eq-audio'];
    if (!actions.some(function (name) { return button.hasAttribute(name); })) return;
    event.preventDefault();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    else if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (button.hasAttribute('data-eq-open')) {
      openDialog();
      return;
    }
    if (button.hasAttribute('data-eq-close')) {
      var close = document.getElementById(DIALOG_ID);
      if (close && close.open) close.close();
      return;
    }
    var bundle = getState(), state = bundle.state, daily = state.daily, row = currentExample(state, bundle.rows);
    if (button.hasAttribute('data-eq-take')) {
      var take = Number(button.getAttribute('data-eq-take'));
      if (!daily.correct && Number.isInteger(take) && take >= 0 && take < daily.bank.length && daily.selected.indexOf(take) < 0) {
        daily.selected.push(take);
        daily.answerStatus = '';
        daily.feedback = '';
      }
      update(bundle);
    } else if (button.hasAttribute('data-eq-return')) {
      var removeAt = Number(button.getAttribute('data-eq-return'));
      if (!daily.correct && Number.isInteger(removeAt) && removeAt >= 0 && removeAt < daily.selected.length) {
        daily.selected.splice(removeAt, 1);
        daily.answerStatus = '';
        daily.feedback = '';
      }
      update(bundle);
    } else if (button.hasAttribute('data-eq-clear')) {
      if (!daily.correct) {
        daily.selected = [];
        daily.answerStatus = '';
        daily.feedback = '';
        save(bundle);
        update(bundle);
      }
    } else if (button.hasAttribute('data-eq-hint')) {
      if (!daily.correct) {
        daily.hintUsed = true;
        daily.feedback = 'التلميح ظاهر تحت منطقة الإجابة. جرّب ترتّب الكلمات بنفسك.';
        save(bundle);
        update();
      }
    } else if (button.hasAttribute('data-eq-check')) {
      evaluateAnswer(bundle);
      save(bundle);
      update(bundle);
    } else if (button.hasAttribute('data-eq-next')) {
      if (!daily.correct) return;
      if (daily.index >= 2) {
        daily.completed = true;
        if (state.completedDates.indexOf(daily.date) < 0) state.completedDates.push(daily.date);
        state.completedDates = state.completedDates.slice(-180);
        state.sessions += 1;
      } else {
        daily.index += 1;
        daily.bank = [];
        daily.selected = [];
        daily.hintUsed = false;
        daily.mistakes = 0;
        daily.reward = 0;
        daily.correct = false;
        daily.answerStatus = '';
        daily.feedback = '';
        prepareQuestion(state, bundle.rows, bundle.owner);
      }
      save(bundle);
      update();
    } else if (button.hasAttribute('data-eq-audio')) {
      if (!row || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
        var note = document.querySelector('.eq-source-note');
        if (note) note.textContent = 'النطق غير متاح في هذا المتصفح.';
        return;
      }
      window.speechSynthesis.cancel();
      var utterance = new window.SpeechSynthesisUtterance(row.sentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }
  function init() {
    if (initialized) return;
    initialized = true;
    mountPanel();
    if (!observer && window.MutationObserver && document.documentElement) {
      observer = new window.MutationObserver(function () { mountPanel(); });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    // Listen at window capture so earlier document-level handlers cannot swallow tile clicks.
    window.addEventListener('click', handleClick, true);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        mountPanel();
        paintPanel();
        var dialog = document.getElementById(DIALOG_ID);
        if (dialog && dialog.open) dialog.innerHTML = dialogMarkup(getState());
      }
    });
  }

  window.SERAG_ENGOPLAY_QUESTS_V1 = {
    version: 1,
    todayKey: todayKey,
    tokensFromSentence: tokensFromSentence,
    normalizeSentence: normalizeSentence,
    pickDailyExamples: pickDailyExamples,
    streakForDates: streakForDates,
    rewardPoints: rewardPoints,
    sharedProgress: sharedProgress,
    recordChallengeAttempt: recordChallengeAttempt,
    injectQuestMarkup: injectQuestMarkup,
    attachRenderHook: attachRenderHook
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  // The shell loader rebuilds the document with document.open/write after an async fetch.
  // DOMContentLoaded may already have fired for the initial document, so keep an idempotent fallback.
  if (typeof window.setTimeout === 'function') window.setTimeout(init, 0);
})();
