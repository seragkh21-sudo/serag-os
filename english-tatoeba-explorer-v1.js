/* Searchable Tatoeba English-Arabic sentence explorer.
   The source corpus is community-contributed and is intentionally labeled as such. */
(() => {
  'use strict';
  const DATA_URL = '/data/review/tatoeba-ar-en-review.jsonl';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  let rows = [];
  let loadPromise = null;
  let loadError = '';
  let query = '';
  let index = 0;
  let revealed = false;

  function filteredRows() {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return rows;
    return rows.filter(row =>
      row.english.toLocaleLowerCase().includes(q) ||
      row.arabic.toLocaleLowerCase().includes(q)
    );
  }

  function currentCardHTML() {
    const list = filteredRows();
    const card = document.getElementById('tatoebaCurrent');
    const count = document.getElementById('tatoebaCount');
    const reveal = document.querySelector('[data-tatoeba-reveal]');
    if (count) count.textContent = list.length
      ? 'الجملة ' + Math.min(index + 1, list.length) + ' من ' + list.length.toLocaleString('en-US')
      : 'لا توجد نتائج مطابقة';
    if (reveal) reveal.hidden = !list.length || revealed;
    if (!card) return;
    if (!list.length) {
      card.innerHTML = '<div class="te-empty">ملقيناش جمل مطابقة. جرّب كلمة إنجليزية أو عربية مختلفة.</div>';
      return;
    }
    const row = list[index % list.length];
    card.innerHTML = '<article class="te-sentence-card">' +
      '<div class="te-label">ENGLISH</div>' +
      '<p class="te-english" lang="en" dir="ltr">' + esc(row.english) + '</p>' +
      (revealed
        ? '<div class="te-label">المعنى العربي</div><p class="te-arabic" lang="ar" dir="rtl">' + esc(row.arabic) + '</p>'
        : '<p class="te-hidden-translation" dir="rtl">حاول تفهم الجملة الأول، وبعدها اكشف الترجمة.</p>') +
      '<div class="te-attribution"><span>المصدر: Tatoeba عبر ManyThings</span><span>' + esc(row.attribution) + '</span></div>' +
      '</article>';
  }

  function panelHTML() {
    return '<div class="tatoeba-explorer">' +
      '<div class="te-intro">' +
        '<span class="te-kicker">OPEN SENTENCE CORPUS</span>' +
        '<h3>مكتبة الجمل الإنجليزية والعربية</h3>' +
        '<p>استكشف الجمل حسب ترتيب المصدر، وابحث بالإنجليزية أو العربية. حاول تفهم المعنى قبل كشف الترجمة.</p>' +
        '<div class="te-stats"><strong>12,574</strong><span>زوج جمل متاح</span><span class="te-source-pill">مصدر مفتوح · مع النَسب</span></div>' +
      '</div>' +
      '<label class="te-search-label" for="tatoebaSearch">ابحث في الجمل</label>' +
      '<input id="tatoebaSearch" class="te-search" data-tatoeba-search type="search" value="' + esc(query) + '" placeholder="مثال: meeting أو العمل" autocomplete="off" />' +
      '<div class="te-count" id="tatoebaCount">تحميل الجمل…</div>' +
      '<div id="tatoebaCurrent"><div class="te-loading">بنحمّل مكتبة الجمل…</div></div>' +
      '<div class="te-actions">' +
        '<button type="button" class="ea12-btn primary" data-tatoeba-reveal>اكشف الترجمة</button>' +
        '<button type="button" class="ea12-btn" data-tatoeba-next>الجملة التالية ←</button>' +
      '</div>' +
      '<p class="te-caution">تنبيه: دي جمل من مصدر مجتمعي وليست كلها مراجَعة تعليميًا. راجع المعنى والسياق قبل اعتماد أي جملة للحفظ أو الامتحانات. بيانات النص من Tatoeba بترخيص CC BY 2.0 FR؛ احتفظ بنسبة المصدر والمساهمين.</p>' +
      '<p class="te-links"><a href="https://www.manythings.org/anki/" target="_blank" rel="noopener noreferrer">تفاصيل المصدر والترخيص ↗</a></p>' +
    '</div>';
  }

  async function load() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      try {
        const response = await fetch(DATA_URL, { cache: 'force-cache' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const text = await response.text();
        rows = text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
          .filter(row => row.english && row.arabic && row.attribution);
        if (rows.length < 10000) throw new Error('Loaded only ' + rows.length + ' attributed pairs');
        const host = document.querySelector('#ea14Content .tatoeba-explorer');
        if (host && document.querySelector('[data-ea-tab="sentences"][aria-pressed="true"]')) {
          host.outerHTML = panelHTML();
          currentCardHTML();
        }
      } catch (error) {
        loadError = String(error?.message || error);
        const host = document.querySelector('#ea14Content .tatoeba-explorer');
        if (host) host.outerHTML = '<div class="tatoeba-explorer"><h3>تعذر تحميل مكتبة الجمل</h3><p>ما قدرناش نقرأ ملف الداتا من الموقع (' +
          esc(loadError) + '). باقي أقسام الإنجليزي تفضل شغالة.</p><a href="https://github.com/seragkh21-sudo/serag-os/tree/main/data/review" target="_blank" rel="noopener noreferrer">فتح ملفات المصدر على GitHub ↗</a></div>';
      }
    })();
    return loadPromise;
  }

  function html() {
    if (!rows.length && !loadError) void load();
    if (loadError) return '<div class="tatoeba-explorer"><h3>تعذر تحميل مكتبة الجمل</h3><p>ما قدرناش نقرأ ملف الداتا من الموقع (' +
      esc(loadError) + '). باقي أقسام الإنجليزي تفضل شغالة.</p><a href="https://github.com/seragkh21-sudo/serag-os/tree/main/data/review" target="_blank" rel="noopener noreferrer">فتح ملفات المصدر على GitHub ↗</a></div>';
    return panelHTML();
  }

  document.addEventListener('input', event => {
    if (!event.target.matches('[data-tatoeba-search]')) return;
    query = event.target.value;
    index = 0;
    revealed = false;
    currentCardHTML();
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-tatoeba-next], [data-tatoeba-reveal]');
    if (!button) return;
    if (button.hasAttribute('data-tatoeba-next')) {
      const list = filteredRows();
      if (list.length) index = (index + 1) % list.length;
      revealed = false;
    } else {
      revealed = true;
    }
    currentCardHTML();
  });

  window.SERAG_TATOEBA_EXPLORER_V1 = { html, get count() { return rows.length; } };
})();
