/* Personal article library for the Serag English reading area. */
(function () {
  'use strict';

  const TABLE = 'english_reading_articles';
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  let rows = [];
  let loadedFor = '__not_loaded__';
  let search = '';
  let filter = 'all';
  let editingId = null;
  let activeId = null;
  let readerFont = 18;
  let progressTimer = null;
  let lastProgressSaved = {};

  function uid() {
    try { return typeof user !== 'undefined' && user ? user.id : null; }
    catch (_) { return null; }
  }
  function db() {
    try { return typeof sb !== 'undefined' ? sb : null; }
    catch (_) { return null; }
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function safeUrl(value) {
    try {
      const url = new URL(String(value || '').trim());
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (_) { return ''; }
  }
  function notify(message) {
    try { if (typeof toast === 'function') return toast(message); } catch (_) {}
    const status = $('#erlLibraryStatus');
    if (status) status.textContent = message;
  }
  function statusLabel(status) {
    return ({ unread: 'للقراءة لاحقًا', reading: 'قيد القراءة', completed: 'مكتمل' })[status] || 'للقراءة لاحقًا';
  }
  function readMinutes(row) {
    const count = String(row.content || row.summary || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(count / 180));
  }
  function excerpt(row) {
    const source = String(row.summary || row.content || '').trim();
    if (source) return source.length > 155 ? source.slice(0, 152) + '…' : source;
    return row.source_url ? 'مقال محفوظ من الويب — افتح المصدر أو أضف النص لقراءته هنا.' : 'أضف نص المقال لبدء القراءة.';
  }
  function summaryHTML() {
    return '<section class="erl-reading-intro">' +
      '<div class="erl-reading-intro-copy"><span class="erl-eyebrow">YOUR READING SPACE</span>' +
      '<h3>مكتبة القراءة</h3>' +
      '<p>اجمع مقالاتك، اقرأ بهدوء، وارجع لها وقت ما تحتاج. مقالاتك الخاصة بتتزامن مع حسابك.</p></div>' +
      '<div class="erl-reading-intro-actions"><div class="erl-reading-mini-stats">' +
      '<span><b data-erl-count>0</b><small>مقال محفوظ</small></span>' +
      '<span><b data-erl-completed-count>0</b><small>مكتمل</small></span></div>' +
      '<button type="button" class="ea12-btn primary" data-erl-add>＋ أضف مقال</button></div></section>';
  }
  function libraryHTML() {
    return '<section id="erlLibraryCard" class="card erl-library-card" hidden>' +
      '<div class="erl-library-head"><div><span class="erl-eyebrow">MY ARTICLES</span><h3>مقالاتي المحفوظة</h3>' +
      '<p class="erl-muted">اكتب المقال أو الصق نصه، أو احفظ رابطًا للرجوع إليه لاحقًا.</p></div>' +
      '<button type="button" class="ea12-btn primary" data-erl-add>＋ إضافة مقال</button></div>' +
      '<div class="erl-library-toolbar"><label class="erl-search"><span>⌕</span><input type="search" id="erlSearch" placeholder="ابحث بالعنوان أو الموضوع أو الكلمات…" autocomplete="off"></label>' +
      '<div class="erl-filter-tabs" role="group" aria-label="تصفية المقالات">' +
      '<button type="button" data-erl-filter="all" aria-pressed="true">الكل</button>' +
      '<button type="button" data-erl-filter="unread" aria-pressed="false">للقراءة</button>' +
      '<button type="button" data-erl-filter="reading" aria-pressed="false">قيد القراءة</button>' +
      '<button type="button" data-erl-filter="completed" aria-pressed="false">مكتمل</button>' +
      '<button type="button" data-erl-filter="favorites" aria-pressed="false">★ المفضلة</button></div></div>' +
      '<div class="erl-library-status" id="erlLibraryStatus" role="status">جاري تجهيز مكتبتك…</div>' +
      '<div id="erlArticleRows" class="erl-article-grid"></div>' +
      '</section>';
  }
  function dialogsHTML() {
    return '<dialog id="erlEditorDialog" class="erl-dialog erl-editor-dialog">' +
      '<form id="erlEditorForm" class="erl-editor-form">' +
      '<header class="erl-dialog-head"><div><span class="erl-eyebrow">ADD TO YOUR LIBRARY</span><h3 id="erlEditorHeading">إضافة مقال جديد</h3>' +
      '<p class="erl-muted">احفظ نصًا تقرأه داخل سراج أو رابطًا ترجع له بعدين.</p></div>' +
      '<button type="button" class="erl-close" data-erl-close aria-label="إغلاق">×</button></header>' +
      '<div class="erl-form-grid">' +
      '<label class="erl-field erl-wide">عنوان المقال<input id="erlTitle" name="title" maxlength="200" required placeholder="مثال: How to communicate clearly at work"></label>' +
      '<label class="erl-field erl-wide">رابط المصدر <span class="erl-optional">اختياري</span><input id="erlUrl" name="source_url" type="url" maxlength="2048" placeholder="https://…"></label>' +
      '<label class="erl-field">الموضوع<input id="erlTopic" name="topic" maxlength="100" placeholder="Work, Daily life, Design…" value="General"></label>' +
      '<label class="erl-field">المستوى<select id="erlLevel" name="level"><option>A1</option><option>A2</option><option selected>B1</option><option>B2</option><option>C1</option><option>C2</option></select></label>' +
      '<label class="erl-field erl-wide">وسوم <span class="erl-optional">افصل بينها بفاصلة</span><input id="erlTags" name="tags" placeholder="communication, work, vocabulary"></label>' +
      '<label class="erl-field erl-wide">ملخص قصير <span class="erl-optional">اختياري</span><textarea id="erlSummary" name="summary" rows="2" maxlength="600" placeholder="عن إيه المقال؟"></textarea></label>' +
      '<label class="erl-field erl-wide">نص المقال <span class="erl-optional">الصق النص هنا للقراءة داخل الموقع</span><textarea id="erlContent" name="content" rows="8" maxlength="200000" placeholder="Paste the article text here…"></textarea></label>' +
      '</div><p class="erl-form-hint">ملاحظة: حفظ الرابط لا يستورد نص الموقع تلقائيًا؛ بعض المواقع تمنع الاستيراد. الصق النص إذا أردت قارئًا مريحًا داخل Serag OS.</p>' +
      '<footer class="erl-dialog-actions"><button type="button" class="ea12-btn" data-erl-close>إلغاء</button><button type="submit" class="ea12-btn primary" id="erlSaveArticle">حفظ المقال</button></footer>' +
      '</form></dialog>' +
      '<dialog id="erlReaderDialog" class="erl-dialog erl-reader-dialog">' +
      '<header class="erl-reader-header"><div class="erl-reader-title-wrap"><span class="erl-eyebrow">FOCUS READING</span><h2 id="erlReaderTitle">—</h2><p id="erlReaderMeta" class="erl-muted"></p></div>' +
      '<div class="erl-reader-tools"><button type="button" class="erl-reader-tool" data-erl-font="down" aria-label="تصغير الخط">A−</button><button type="button" class="erl-reader-tool" data-erl-font="up" aria-label="تكبير الخط">A+</button><button type="button" class="erl-close" data-erl-reader-close aria-label="إغلاق">×</button></div></header>' +
      '<div class="erl-reader-progress"><span id="erlReaderProgressLabel">0% مقروء</span><div><i id="erlReaderProgressBar" style="width:0%"></i></div></div>' +
      '<div id="erlReaderScroll" class="erl-reader-scroll"><article id="erlReaderBody" class="erl-reader-body"></article></div>' +
      '<section class="erl-reader-notes"><label for="erlReaderNotes">ملاحظاتي على المقال</label><textarea id="erlReaderNotes" rows="2" maxlength="10000" placeholder="اكتب فكرة أو كلمة عايز ترجع لها…"></textarea><button type="button" class="ea12-btn" data-erl-save-notes>حفظ الملاحظة</button></section>' +
      '<footer class="erl-reader-footer"><a id="erlSourceLink" href="#" target="_blank" rel="noopener noreferrer" hidden>فتح المصدر الأصلي ↗</a>' +
      '<div class="erl-reader-footer-actions"><button type="button" class="ea12-btn" data-erl-reader-favorite>☆ حفظ في المفضلة</button><button type="button" class="ea12-btn primary" data-erl-complete>علّم كمكتمل ✓</button></div></footer>' +
      '</dialog>';
  }
  function setStatus(message) {
    const el = $('#erlLibraryStatus');
    if (el) el.textContent = message;
  }
  function updateSummary() {
    const count = rows.length;
    const completed = rows.filter(function (row) { return row.status === 'completed'; }).length;
    $$('[data-erl-count]').forEach(function (el) { el.textContent = count; });
    $$('[data-erl-completed-count]').forEach(function (el) { el.textContent = completed; });
  }
  function renderRows() {
    const list = $('#erlArticleRows');
    if (!list) return;
    updateSummary();
    $$('[data-erl-filter]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.erlFilter === filter));
    });
    const query = search.trim().toLowerCase();
    const visible = rows.filter(function (row) {
      const text = [row.title, row.summary, row.content, row.topic, row.level, (row.tags || []).join(' ')].join(' ').toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesFilter = filter === 'all' ||
        (filter === 'favorites' ? !!row.favorite : row.status === filter);
      return matchesSearch && matchesFilter;
    });
    if (!visible.length) {
      list.innerHTML = '<div class="erl-empty"><span class="erl-empty-icon">✳</span><h4>' +
        (rows.length ? 'مفيش نتائج مطابقة' : 'ابدأ أول مجموعة مقالات') + '</h4><p>' +
        (rows.length ? 'جرّب كلمة بحث أو فلتر مختلف.' : 'أضف مقالًا من نص عندك أو احفظ رابطًا من الويب. هتلاقي كل حاجة هنا بعدين.') +
        '</p>' + (rows.length ? '' : '<button type="button" class="ea12-btn primary" data-erl-add>＋ أضف أول مقال</button>') + '</div>';
      return;
    }
    list.innerHTML = visible.map(function (row) {
      const progress = Math.max(0, Math.min(100, Number(row.reading_progress) || 0));
      const tags = (row.tags || []).slice(0, 3).map(function (tag) { return '<span class="erl-tag">' + esc(tag) + '</span>'; }).join('');
      const source = safeUrl(row.source_url);
      return '<article class="erl-article-card"><button type="button" class="erl-article-open" data-erl-open="' + esc(row.id) + '">' +
        '<div class="erl-card-kicker"><span class="erl-level">' + esc(row.level || 'B1') + '</span><span>' + esc(row.topic || 'General') + '</span><span>' + readMinutes(row) + ' د قراءة</span></div>' +
        '<h4>' + esc(row.title) + '</h4><p>' + esc(excerpt(row)) + '</p>' +
        '<div class="erl-card-progress"><div><i style="width:' + progress + '%"></i></div><small>' + (progress ? progress + '%' : statusLabel(row.status)) + '</small></div>' +
        '<div class="erl-tags">' + tags + (source ? '<span class="erl-source-tag">↗ رابط مصدر</span>' : '') + '</div>' +
        '<span class="erl-open-cta"><span>افتح المقال واقرأه</span><span class="erl-open-cta-arrow" aria-hidden="true">←</span></span></button>' +
        '<div class="erl-card-actions"><button type="button" data-erl-favorite="' + esc(row.id) + '" aria-label="المفضلة" title="المفضلة">' + (row.favorite ? '★' : '☆') + '</button>' +
        '<button type="button" data-erl-edit="' + esc(row.id) + '" aria-label="تعديل المقال" title="تعديل">✎</button>' +
        '<button type="button" data-erl-delete="' + esc(row.id) + '" aria-label="حذف المقال" title="حذف">⌫</button></div></article>';
    }).join('');
  }
  function studioOwnsAcademyReading() {
    return !!(window.SERAG_READING_STUDIO_V2 && $('#ea12Center'));
  }
  async function load(force) {
    // Reading Studio v2 owns the active Academy panel; don't run a second invisible query.
    if (studioOwnsAcademyReading()) return;
    const id = uid();
    if (!id) {
      rows = [];
      renderRows();
      setStatus('سجّل دخولك لعرض مقالاتك المحفوظة.');
      return;
    }
    if (!force && loadedFor === id) return;
    const client = db();
    if (!client) {
      setStatus('قاعدة البيانات غير متاحة حاليًا.');
      return;
    }
    setStatus('جاري تحميل مقالاتك…');
    const result = await client.from(TABLE).select('*').eq('user_id', id).order('updated_at', { ascending: false }).limit(200);
    if (result.error) {
      setStatus('تعذر تحميل المقالات. تأكد من الاتصال ثم حدّث الصفحة. (' + result.error.message + ')');
      return;
    }
    rows = result.data || [];
    loadedFor = id;
    renderRows();
    setStatus(rows.length ? 'مكتبتك متزامنة مع حسابك.' : 'مكتبتك جاهزة — أضف أول مقال من الزر بالأعلى.');
  }
  function editorDialog() { return $('#erlEditorDialog'); }
  function readerDialog() { return $('#erlReaderDialog'); }
  function openEditor(id) {
    editingId = id || null;
    const row = editingId ? rows.find(function (item) { return item.id === editingId; }) : null;
    const fields = {
      erlTitle: row ? row.title : '',
      erlUrl: row ? (row.source_url || '') : '',
      erlTopic: row ? (row.topic || 'General') : 'General',
      erlLevel: row ? (row.level || 'B1') : 'B1',
      erlTags: row ? (row.tags || []).join(', ') : '',
      erlSummary: row ? (row.summary || '') : '',
      erlContent: row ? (row.content || '') : ''
    };
    Object.keys(fields).forEach(function (idKey) {
      const el = $('#' + idKey);
      if (el) el.value = fields[idKey];
    });
    const heading = $('#erlEditorHeading');
    if (heading) heading.textContent = row ? 'تعديل المقال' : 'إضافة مقال جديد';
    const dialog = editorDialog();
    if (dialog && !dialog.open) dialog.showModal();
    setTimeout(function () { $('#erlTitle') && $('#erlTitle').focus(); }, 50);
  }
  function closeEditor() {
    const dialog = editorDialog();
    if (dialog && dialog.open) dialog.close();
  }
  function openReader(id) {
    const row = rows.find(function (item) { return item.id === id; });
    if (!row) return;
    activeId = id;
    clearTimeout(progressTimer);
    const title = $('#erlReaderTitle');
    const meta = $('#erlReaderMeta');
    const body = $('#erlReaderBody');
    const scroll = $('#erlReaderScroll');
    if (title) title.textContent = row.title;
    if (meta) meta.textContent = (row.topic || 'General') + ' · ' + (row.level || 'B1') + ' · ' + readMinutes(row) + ' دقيقة قراءة';
    if (body) {
      const content = String(row.content || '').trim();
      if (content) {
        body.innerHTML = content.split(/\n\s*\n/).filter(Boolean).map(function (paragraph) {
          return '<p>' + esc(paragraph).replace(/\n/g, '<br>') + '</p>';
        }).join('');
      } else {
        const source = safeUrl(row.source_url);
        body.innerHTML = '<div class="erl-no-body"><span>↗</span><h3>المقال محفوظ كرابط</h3><p>الموقع الأصلي لا يتيح نصًا محفوظًا داخل سراج تلقائيًا. افتح المصدر أو ارجع للتعديل والصق النص هنا.</p>' +
          (source ? '<a href="' + esc(source) + '" target="_blank" rel="noopener noreferrer">فتح المقال الأصلي ↗</a>' : '') + '</div>';
      }
    }
    const sourceLink = $('#erlSourceLink');
    const source = safeUrl(row.source_url);
    if (sourceLink) {
      sourceLink.href = source || '#';
      sourceLink.hidden = !source;
    }
    const notes = $('#erlReaderNotes');
    if (notes) notes.value = row.notes || '';
    const fav = $('[data-erl-reader-favorite]');
    if (fav) fav.textContent = row.favorite ? '★ محفوظ في المفضلة' : '☆ حفظ في المفضلة';
    readerFont = 18;
    try {
      const savedFont = Number(localStorage.getItem('serag-reading-font:' + uid()));
      if (savedFont >= 15 && savedFont <= 26) readerFont = savedFont;
    } catch (_) {}
    applyReaderFont();
    if (scroll) scroll.scrollTop = 0;
    updateReaderProgress(Number(row.reading_progress) || 0);
    const dialog = readerDialog();
    if (dialog && !dialog.open) dialog.showModal();
    if (row.status === 'unread') savePatch(id, { status: 'reading' });
  }
  function applyReaderFont() {
    const body = $('#erlReaderBody');
    if (body) body.style.fontSize = readerFont + 'px';
    try { localStorage.setItem('serag-reading-font:' + uid(), String(readerFont)); } catch (_) {}
  }
  function updateReaderProgress(progress) {
    const value = Math.max(0, Math.min(100, Math.round(progress || 0)));
    const label = $('#erlReaderProgressLabel');
    const bar = $('#erlReaderProgressBar');
    if (label) label.textContent = value + '% مقروء';
    if (bar) bar.style.width = value + '%';
  }
  async function savePatch(id, patch) {
    const client = db();
    const ownerId = uid();
    if (!client || !ownerId || !id) return false;
    const result = await client.from(TABLE).update(patch).eq('id', id).eq('user_id', ownerId).select('*').single();
    if (result.error) {
      notify('تعذر حفظ التعديل: ' + result.error.message);
      return false;
    }
    rows = rows.map(function (row) { return row.id === id ? result.data : row; });
    renderRows();
    if (activeId === id) {
      const fav = $('[data-erl-reader-favorite]');
      if (fav) fav.textContent = result.data.favorite ? '★ محفوظ في المفضلة' : '☆ حفظ في المفضلة';
      updateReaderProgress(Number(result.data.reading_progress) || 0);
    }
    return true;
  }
  async function saveArticle(event) {
    event.preventDefault();
    const ownerId = uid();
    const client = db();
    if (!ownerId || !client) return notify('سجّل دخولك الأول علشان تحفظ مقالاتك.');
    const title = $('#erlTitle').value.trim();
    const rawUrl = $('#erlUrl').value.trim();
    const sourceUrl = rawUrl ? safeUrl(rawUrl) : '';
    const content = $('#erlContent').value.trim();
    if (!title) return notify('اكتب عنوان المقال الأول.');
    if (rawUrl && !sourceUrl) return notify('رابط المصدر لازم يبدأ بـ http:// أو https://.');
    if (!content && !sourceUrl) return notify('اكتب نص المقال أو أضف رابط المصدر.');
    const current = editingId ? rows.find(function (row) { return row.id === editingId; }) : null;
    const tags = $('#erlTags').value.split(',').map(function (tag) { return tag.trim(); }).filter(Boolean).slice(0, 12);
    const payload = {
      title: title,
      source_url: sourceUrl || null,
      topic: $('#erlTopic').value.trim() || 'General',
      level: $('#erlLevel').value,
      tags: tags,
      summary: $('#erlSummary').value.trim(),
      content: content,
      status: current ? current.status : 'unread',
      favorite: current ? !!current.favorite : false,
      reading_progress: current ? Number(current.reading_progress) || 0 : 0,
      notes: current ? (current.notes || '') : ''
    };
    const button = $('#erlSaveArticle');
    if (button) { button.disabled = true; button.textContent = 'جاري الحفظ…'; }
    let result;
    if (current) {
      result = await client.from(TABLE).update(payload).eq('id', current.id).eq('user_id', ownerId).select('*').single();
    } else {
      result = await client.from(TABLE).insert(Object.assign({ user_id: ownerId }, payload)).select('*').single();
    }
    if (button) { button.disabled = false; button.textContent = 'حفظ المقال'; }
    if (result.error) return notify('تعذر حفظ المقال: ' + result.error.message);
    if (current) rows = rows.map(function (row) { return row.id === current.id ? result.data : row; });
    else rows.unshift(result.data);
    closeEditor();
    renderRows();
    setStatus('اتحفظ المقال بنجاح.');
    notify('اتحفظ المقال في مكتبتك ✓');
  }
  async function toggleFavorite(id) {
    const row = rows.find(function (item) { return item.id === id; });
    if (!row) return;
    await savePatch(id, { favorite: !row.favorite });
  }
  async function markComplete() {
    if (!activeId) return;
    const saved = await savePatch(activeId, { status: 'completed', reading_progress: 100 });
    if (saved) notify('اتعلّم كمكتمل ✓');
  }
  async function saveNotes() {
    if (!activeId) return;
    const notes = $('#erlReaderNotes');
    if (!notes) return;
    if (await savePatch(activeId, { notes: notes.value })) notify('ملاحظتك اتحفظت.');
  }
  async function deleteArticle(id) {
    const row = rows.find(function (item) { return item.id === id; });
    if (!row || !window.confirm('تحذف المقال «' + row.title + '» من مكتبتك؟')) return;
    const client = db();
    const ownerId = uid();
    const result = await client.from(TABLE).delete().eq('id', id).eq('user_id', ownerId);
    if (result.error) return notify('تعذر حذف المقال: ' + result.error.message);
    rows = rows.filter(function (item) { return item.id !== id; });
    renderRows();
    setStatus('اتحذف المقال.');
    notify('اتحذف المقال.');
  }
  function handleClick(event) {
    const target = event.target;
    const add = target.closest('[data-erl-add]');
    if (add) { event.preventDefault(); openEditor(null); return; }
    const filterButton = target.closest('[data-erl-filter]');
    if (filterButton) { filter = filterButton.dataset.erlFilter; renderRows(); return; }
    const open = target.closest('[data-erl-open]');
    if (open) { openReader(open.dataset.erlOpen); return; }
    const edit = target.closest('[data-erl-edit]');
    if (edit) { openEditor(edit.dataset.erlEdit); return; }
    const favorite = target.closest('[data-erl-favorite]');
    if (favorite) { toggleFavorite(favorite.dataset.erlFavorite); return; }
    const remove = target.closest('[data-erl-delete]');
    if (remove) { deleteArticle(remove.dataset.erlDelete); return; }
    if (target.closest('[data-erl-close]')) { closeEditor(); return; }
    if (target.closest('[data-erl-reader-close]')) { const d = readerDialog(); if (d && d.open) d.close(); return; }
    const font = target.closest('[data-erl-font]');
    if (font) {
      readerFont = Math.max(15, Math.min(26, readerFont + (font.dataset.erlFont === 'up' ? 1 : -1)));
      applyReaderFont();
      return;
    }
    if (target.closest('[data-erl-save-notes]')) { saveNotes(); return; }
    if (target.closest('[data-erl-complete]')) { markComplete(); return; }
    if (target.closest('[data-erl-reader-favorite]')) { if (activeId) toggleFavorite(activeId); return; }
    if (target.closest('[data-erl-reload]')) { load(true); return; }
  }
  function handleInput(event) {
    if (event.target && event.target.id === 'erlSearch') {
      search = event.target.value;
      renderRows();
    }
  }
  function handleReaderScroll() {
    if (!activeId) return;
    const scroll = $('#erlReaderScroll');
    if (!scroll) return;
    const max = scroll.scrollHeight - scroll.clientHeight;
    const progress = max > 0 ? Math.round((scroll.scrollTop / max) * 100) : 0;
    updateReaderProgress(progress);
    const row = rows.find(function (item) { return item.id === activeId; });
    const previous = lastProgressSaved[activeId] == null ? Number(row && row.reading_progress) || 0 : lastProgressSaved[activeId];
    if (Math.abs(progress - previous) < 12 && progress !== 100) return;
    clearTimeout(progressTimer);
    progressTimer = setTimeout(async function () {
      if (!activeId) return;
      const id = activeId;
      const ok = await savePatch(id, { reading_progress: progress, status: (rows.find(function (item) { return item.id === id; }) || {}).status === 'unread' ? 'reading' : (rows.find(function (item) { return item.id === id; }) || {}).status || 'reading' });
      if (ok) lastProgressSaved[id] = progress;
    }, 700);
  }
  function syncVisibility() {
    const card = $('#erlLibraryCard');
    if (!card) return;
    const readingActive = !!$('#ea12Center [data-ea-tab="reading"][aria-pressed="true"]');
    const page = $('#page-english');
    card.hidden = !readingActive || !page || page.classList.contains('hidden');
  }
  function mount() {
    const page = $('#page-english');
    if (!page) return;

    if (!$('#erlEditorDialog')) document.body.insertAdjacentHTML('beforeend', dialogsHTML());

    // The active English Academy owns its tab content. Mount the article list inside
    // the Reading panel instead of beside the legacy grid: organizeLegacy() hides
    // legacy siblings that are not part of the selected section.
    const academyRoot = $('#ea12Center');
    if (academyRoot) {
      if (window.SERAG_READING_STUDIO_V2) {
        const legacyCard = $('#erlLibraryCard');
        if (legacyCard) legacyCard.remove();
        return;
      }
      const readingActive = !!$('#ea12Center [data-ea-tab="reading"][aria-pressed="true"]');
      const intro = $('.erl-reading-intro', academyRoot);
      let card = $('#erlLibraryCard');

      if (readingActive && intro) {
        if (!card || !intro.parentElement || !intro.parentElement.contains(card)) {
          if (card) card.remove();
          intro.insertAdjacentHTML('afterend', libraryHTML());
          card = $('#erlLibraryCard');
          // Rows may already have loaded before the Reading tab was opened.
          renderRows();
        }
      } else if (card && !academyRoot.contains(card)) {
        // Remove any legacy sibling card; it would be hidden by the Academy's
        // legacy-layout organiser and leave learners with an empty Reading section.
        card.remove();
      }

      syncVisibility();
      const id = uid();
      if (loadedFor !== id) {
        loadedFor = id;
        load(true);
      }
      return;
    }

    // Compatibility fallback for pages that still use the standalone legacy reading layout.
    const article = $('#el9Article');
    if (!article) return;
    let card = $('#erlLibraryCard');
    const grid = article.closest('.el6-grid');
    if (!card && grid) {
      grid.insertAdjacentHTML('afterend', libraryHTML());
      card = $('#erlLibraryCard');
      renderRows();
    }
    syncVisibility();
    const id = uid();
    if (loadedFor !== id) {
      loadedFor = id;
      load(true);
    }
  }
  function boot() {
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    // The editor dialog is mounted dynamically, so delegate submit handling at document level.
    // Without this listener the browser performs a normal form submission and the article is not saved.
    document.addEventListener('submit', function (event) {
      if (event.target && event.target.id === 'erlEditorForm') saveArticle(event);
    });
    const observer = new MutationObserver(function () { mount(); syncVisibility(); });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('[data-ea-tab="reading"],[data-page="english"]')) {
        setTimeout(syncVisibility, 80);
      }
    });
    if (typeof sb !== 'undefined' && sb.auth) {
      sb.auth.onAuthStateChange(function () {
        setTimeout(function () {
          loadedFor = uid();
          load(true);
        }, 0);
      });
    }
    const reader = $('#erlReaderScroll');
    if (reader) reader.addEventListener('scroll', handleReaderScroll, { passive: true });
    mount();
    setInterval(mount, 900);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.SERAG_READING_LIBRARY_V1 = {
    summaryHTML: summaryHTML,
    refresh: function () { return load(true); }
  };
})();