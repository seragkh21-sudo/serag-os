/* EngoPlay quest gameplay: sentence-building challenges using the existing Serag grammar bank. */
(function () {
  'use strict';

  var PREFIX = 'seragEngoplayQuestV1:';
  var DIALOG_ID = 'eqQuestDialog';
  var observer = null;

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
      if (typeof user !== 'undefined' && user && user.id) return 'user:' + String(user.id);
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
  function pickDailyExamples(examples, owner, day) {
    var usable = (Array.isArray(examples) ? examples : []).filter(function (row) {
      return row && row.id != null && typeof row.sentence === 'string' &&
        tokensFromSentence(row.sentence).length >= 5 &&
        tokensFromSentence(row.sentence).length <= 24 &&
        row.sentence.length <= 180;
    });
    usable.sort(function (a, b) {
      var ka = hash(day + '|' + owner + '|' + a.id);
      var kb = hash(day + '|' + owner + '|' + b.id);
      return ka - kb || String(a.id).localeCompare(String(b.id));
    });
    return usable.slice(0, 3).map(function (row) { return String(row.id); });
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
  function examples() {
    var bank = window.SERAG_GRAMMAR_EXAMPLES_V1;
    if (!bank || typeof bank.getExamples !== 'function') return [];
    try { return bank.getExamples() || []; } catch (_) { return []; }
  }
  function emptyState(owner, day, rows) {
    return {
      points: 0,
      sessions: 0,
      completedDates: [],
      daily: {
        date: day,
        ids: pickDailyExamples(rows, owner, day),
        index: 0,
        bank: [],
        selected: [],
        hintUsed: false,
        mistakes: 0,
        reward: 0,
        correct: false,
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
    daily.feedback = '';
  }
  function getState() {
    var owner = ownerKey(), day = todayKey(), rows = examples();
    var state = read(storageKey(owner), null);
    if (!state || typeof state !== 'object') state = emptyState(owner, day, rows);
    if (!Array.isArray(state.completedDates)) state.completedDates = [];
    state.completedDates = state.completedDates.filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(String(x)); }).slice(-180);
    state.points = Math.max(0, Number(state.points) || 0);
    state.sessions = Math.max(0, Number(state.sessions) || 0);
    if (!state.daily || state.daily.date !== day || !Array.isArray(state.daily.ids)) {
      state.daily = emptyState(owner, day, rows).daily;
    }
    if (!Array.isArray(state.daily.bank)) state.daily.bank = [];
    if (!Array.isArray(state.daily.selected)) state.daily.selected = [];
    if (!Array.isArray(state.daily.ids) || !state.daily.ids.length) state.daily.ids = pickDailyExamples(rows, owner, day);
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
    var streak = streakForDates(state.completedDates, daily.date);
    var progress = complete ? 3 : Math.min(3, daily.index + (daily.correct ? 1 : 0));
    var available = daily.ids.length >= 3;
    var label = complete ? 'اعرض نتيجتك' : 'ابدأ تحدّي الجمل';
    return '<section class="eq-quest-panel" data-eq-panel aria-labelledby="eqQuestPanelTitle">' +
      '<div class="eq-quest-copy"><div class="eq-eyebrow"><span class="eq-spark">✦</span> ENGOPLAY · DAILY QUEST</div>' +
      '<h3 id="eqQuestPanelTitle">خلّي الإنجليزي لعبة بتكسب منها</h3>' +
      '<p>رتّب كلمات من أمثلة القواعد الحقيقية، استخدم التلميح عند الحاجة، وخد نقاط على كل جملة تبنيها صح.</p>' +
      '<div class="eq-quest-tags"><span>ترتيب جمل</span><span>تصحيح فوري</span><span>نطق عند الطلب</span></div>' +
      '<button class="eq-quest-start" data-eq-open ' + (!available ? 'disabled' : '') + '>' + label + ' <span aria-hidden="true">←</span></button>' +
      '<small class="eq-local-note">نقاط التحدّي منفصلة عن XP الأساسي، ومحفوظة محليًا لكل حساب على هذا الجهاز.</small></div>' +
      '<div class="eq-quest-stats">' +
      '<div class="eq-stat-main"><span class="eq-stat-icon">✦</span><strong>' + state.points.toLocaleString('en-US') + '</strong><small>نقطة تحدّي</small></div>' +
      '<div class="eq-stat-pair"><div><strong>🔥 ' + streak + '</strong><small>أيام تحدّي متتالية</small></div><div><strong>' + state.sessions + '</strong><small>تحدّي مكتمل</small></div></div>' +
      '<div class="eq-progress-head"><span>تقدّمك النهارده</span><b>' + progress + '/3</b></div><progress max="3" value="' + progress + '"></progress>' +
      '<div class="eq-mini-path" aria-label="تقدّم التحدّي">' + [0,1,2].map(function (i) { return '<span class="' + (i < progress ? 'is-done' : (i === daily.index && !complete ? 'is-current' : '')) + '">' + (i < progress ? '✓' : (i + 1)) + '</span>'; }).join('') + '</div>' +
      '<div class="eq-storage-status" data-eq-storage-status role="status"></div>' +
      '</div></section>';
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
    if (daily.completed) {
      return '<button class="eq-close" data-eq-close aria-label="إغلاق">×</button>' +
        '<div class="eq-complete-icon">✦</div><div class="eq-eyebrow">QUEST COMPLETE</div>' +
        '<h2 id="eqDialogTitle">ممتاز! خلّصت تحدّي النهارده.</h2>' +
        '<p class="eq-complete-copy">بنيت 3 جمل من بنك القواعد، والنقاط اللي جمعتها فضلت محفوظة لحسابك على الجهاز ده.</p>' +
        '<div class="eq-complete-total"><strong>' + state.points.toLocaleString('en-US') + '</strong><span>إجمالي نقاط التحدّي</span></div>' +
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
    var answer = daily.selected.map(function (index, pos) {
      return '<button type="button" class="eq-tile eq-tile-selected" data-eq-return="' + pos + '" aria-label="إزالة الكلمة ' + esc(daily.bank[index]) + '">' + esc(daily.bank[index]) + '</button>';
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
      '<button type="button" class="eq-primary-button" data-eq-next>' + (daily.index === 2 ? 'أنهِ التحدّي ✦' : 'الجملة التالية ←') + '</button>' :
      '<div class="eq-action-row"><button type="button" class="eq-secondary-button" data-eq-hint>تلميح</button><button type="button" class="eq-secondary-button" data-eq-audio>اسمع الجملة ◖))</button><button type="button" class="eq-primary-button" data-eq-check>تحقّق من الجملة</button><button type="button" class="eq-text-button" data-eq-clear>ابدأ من جديد</button></div>';
    return '<button class="eq-close" data-eq-close aria-label="إغلاق">×</button>' +
      '<div class="eq-dialog-top"><div><div class="eq-eyebrow">DAILY QUEST · SENTENCE BUILDER</div>' +
      '<h2 id="eqDialogTitle">كوّن الجملة</h2><p>اختار كل كلمة بالترتيب. تقدر تغيّر ترتيب إجابتك بالضغط على الكلمة المختارة.</p></div>' +
      '<div class="eq-step-count"><strong>' + (daily.index + 1) + '</strong><span>/ 3</span></div></div>' +
      '<div class="eq-progress-line"><progress max="3" value="' + progress + '"></progress><span>' + progress + ' من 3</span></div>' +
      '<div class="eq-rule-meta"><span>' + esc(row.level || 'B1') + '</span><span>' + esc(row.titleAr || row.title || 'قاعدة نحوية') + '</span></div>' +
      '<div class="eq-build-area"><small>جملتك</small><div class="eq-answer" dir="ltr" lang="en">' + answer + '</div>' +
      '<div class="eq-word-bank" dir="ltr" lang="en">' + bank + '</div></div>' + hint + feedback + controls +
      '<p class="eq-source-note">المثال مأخوذ من بنك القواعد الموجود في EngoPlay. النطق لا يعمل تلقائيًا؛ شغّله عند الحاجة.</p>';
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
  function paintPanel() {
    var bundle = getState();
    var panel = document.querySelector('.eq-quest-panel');
    if (panel) panel.outerHTML = panelMarkup(bundle);
  }
  function mountPanel() {
    var lobby = document.querySelector('.ep-lobby');
    if (!lobby || lobby.querySelector('[data-eq-panel]')) return;
    var panel = document.createElement('section');
    panel.innerHTML = panelMarkup(getState());
    var quest = panel.firstElementChild;
    var grid = lobby.querySelector('.ep-play-grid');
    var nav = lobby.querySelector('.ep-tabs');
    if (nav && nav.parentNode) nav.parentNode.insertBefore(quest, nav.nextSibling);
    else if (grid && grid.parentNode) grid.parentNode.insertBefore(quest, grid);
    else lobby.appendChild(quest);
  }
  function update() {
    var bundle = getState();
    save(bundle);
    paintPanel();
    var dialog = document.getElementById(DIALOG_ID);
    if (dialog && dialog.open) {
      dialog.innerHTML = dialogMarkup(bundle);
    }
  }
  function handleClick(event) {
    var button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button) return;
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
      if (!daily.correct && Number.isInteger(take) && take >= 0 && take < daily.bank.length && daily.selected.indexOf(take) < 0) daily.selected.push(take);
      update();
    } else if (button.hasAttribute('data-eq-return')) {
      var removeAt = Number(button.getAttribute('data-eq-return'));
      if (!daily.correct && Number.isInteger(removeAt) && removeAt >= 0 && removeAt < daily.selected.length) daily.selected.splice(removeAt, 1);
      update();
    } else if (button.hasAttribute('data-eq-clear')) {
      if (!daily.correct) {
        daily.selected = [];
        daily.feedback = '';
        save(bundle);
        update();
      }
    } else if (button.hasAttribute('data-eq-hint')) {
      if (!daily.correct) {
        daily.hintUsed = true;
        daily.feedback = 'التلميح ظاهر تحت منطقة الإجابة. جرّب ترتّب الكلمات بنفسك.';
        save(bundle);
        update();
      }
    } else if (button.hasAttribute('data-eq-check')) {
      if (!row) return;
      if (daily.selected.length !== daily.bank.length) {
        daily.feedback = 'استخدم كل الكلمات مرة واحدة قبل ما تتحقّق.';
        daily.correct = false;
      } else {
        var built = daily.selected.map(function (index) { return daily.bank[index]; }).join(' ');
        if (normalizeSentence(built) === normalizeSentence(row.sentence)) {
          daily.correct = true;
          daily.reward = rewardPoints(daily.mistakes, daily.hintUsed);
          state.points += daily.reward;
          daily.feedback = 'مظبوط! + ' + daily.reward + ' نقطة. ' + (daily.hintUsed ? 'استخدمت التلميح بشكل ذكي.' : 'مبنيّة صح من أول مرة.');
        } else {
          daily.mistakes++;
          daily.correct = false;
          daily.feedback = 'قريب! راجع ترتيب الكلمات، وجرّب تاني. مفيش خصم على المحاولة.';
        }
      }
      save(bundle);
      update();
    } else if (button.hasAttribute('data-eq-next')) {
      if (!daily.correct) return;
      if (daily.index >= 2) {
        daily.completed = true;
        if (state.completedDates.indexOf(daily.date) < 0) state.completedDates.push(daily.date);
        state.completedDates = state.completedDates.slice(-180);
        state.sessions += 1;
        state.points += 10;
      } else {
        daily.index += 1;
        daily.bank = [];
        daily.selected = [];
        daily.hintUsed = false;
        daily.mistakes = 0;
        daily.reward = 0;
        daily.correct = false;
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
    mountPanel();
    if (!observer && window.MutationObserver && document.documentElement) {
      observer = new window.MutationObserver(function () { mountPanel(); });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    document.addEventListener('click', handleClick);
  }

  window.SERAG_ENGOPLAY_QUESTS_V1 = {
    version: 1,
    todayKey: todayKey,
    tokensFromSentence: tokensFromSentence,
    normalizeSentence: normalizeSentence,
    pickDailyExamples: pickDailyExamples,
    streakForDates: streakForDates,
    rewardPoints: rewardPoints
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
