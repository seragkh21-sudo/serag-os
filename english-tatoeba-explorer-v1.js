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
      ? 'Sentence ' + Math.min(index + 1, list.length) + ' of ' + list.length.toLocaleString('en-US')
      : 'No matching results';
    if (reveal) reveal.hidden = !list.length || revealed;
    if (!card) return;
    if (!list.length) {
      card.innerHTML = '<div class="te-empty">No matching sentences. Try a different English or Arabic search term.</div>';
      return;
    }
    const row = list[index % list.length];
    card.innerHTML = '<article class="te-sentence-card">' +
      '<div class="te-label">ENGLISH</div>' +
      '<p class="te-english" lang="en" dir="ltr">' + esc(row.english) + '</p>' + '<button type="button" class="ea12-btn" data-speak-text="'+esc(row.english)+'">Listen</button>' +
      (revealed
        ? '<div class="te-label">Arabic meaning</div><p class="te-arabic" lang="ar" dir="rtl">' + esc(row.arabic) + '</p>'
        : '<p class="te-hidden-translation" dir="rtl">Try to understand the sentence first, then reveal the translation.</p>') +
      '<div class="te-attribution"><span>Source: Tatoeba via ManyThings</span><span>' + esc(row.attribution) + '</span></div>' +
      '</article>';
  }

  function panelHTML() {
    return '<div class="tatoeba-explorer">' +
      '<div class="te-intro">' +
        '<span class="te-kicker">OPEN SENTENCE CORPUS</span>' +
        '<h3>English sentence library</h3>' +
        '<p>Browse sentences in source order and search in English or Arabic. Try to understand the meaning before revealing the translation.</p>' +
        '<div class="te-stats"><strong>12,574</strong><span>sentence pairs available</span><span class="te-source-pill">Open source · attribution included</span></div>' +
      '</div>' +
      '<label class="te-search-label" for="tatoebaSearch">Search sentences</label>' +
      '<input id="tatoebaSearch" class="te-search" data-tatoeba-search type="search" value="' + esc(query) + '" placeholder="e.g. meeting or work" autocomplete="off" />' +
      '<div class="te-count" id="tatoebaCount">Loading sentences…</div>' +
      '<div id="tatoebaCurrent"><div class="te-loading">Loading the sentence library…</div></div>' +
      '<div class="te-actions">' +
        '<button type="button" class="ea12-btn primary" data-tatoeba-reveal>Reveal translation</button>' +
        '<button type="button" class="ea12-btn" data-tatoeba-next>Next sentence →</button>' +
      '</div>' +
      '<p class="te-caution">Note: These sentences come from a community source and have not all been reviewed for teaching. Check meaning and context before using them for study or exams. Tatoeba text is licensed under CC BY 2.0 FR; retain source and contributor attribution.</p>' +
      '<p class="te-links"><a href="https://www.manythings.org/anki/" target="_blank" rel="noopener noreferrer">Source and licence details ↗</a></p>' +
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
        if (host) host.outerHTML = '<div class="tatoeba-explorer"><h3>Could not load the sentence library</h3><p>Could not read the data file from the site (' +
          esc(loadError) + '). The other English sections remain available.</p><a href="https://github.com/seragkh21-sudo/serag-os/tree/main/data/review" target="_blank" rel="noopener noreferrer">View source files on GitHub ↗</a></div>';
      }
    })();
    return loadPromise;
  }

  function html() {
    if (!rows.length && !loadError) void load();
    if (loadError) return '<div class="tatoeba-explorer"><h3>Could not load the sentence library</h3><p>Could not read the data file from the site (' +
      esc(loadError) + '). The other English sections remain available.</p><a href="https://github.com/seragkh21-sudo/serag-os/tree/main/data/review" target="_blank" rel="noopener noreferrer">View source files on GitHub ↗</a></div>';
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
