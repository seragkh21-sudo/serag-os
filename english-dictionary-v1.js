/* EngoPlay Dictionary v1 — resilient, opt-in dictionary lookup for Reading and Vocabulary. */
(function () {
  'use strict';
  const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const CACHE_KEY = 'seragDictionaryCacheV1';
  const TTL = 7 * 24 * 60 * 60 * 1000;
  const MAX_CACHE = 100;
  const memory = new Map();
  let activePhrase = '';
  let activeContext = '';
  let requestToken = 0;
  let floating = null;

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = v => String(v || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const validPhrase = v => {
    const s = String(v || '').trim();
    return s.length > 0 && s.length <= 80 && /^[A-Za-z][A-Za-z'’ -]*$/.test(s) && s.split(/\s+/).length <= 6;
  };
  function readCache() {
    try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}'); } catch (_) { return {}; }
  }
  function writeCache(key, data) {
    try {
      const cache = readCache();
      cache[key] = { at: Date.now(), data };
      const entries = Object.entries(cache).sort((a,b) => b[1].at - a[1].at).slice(0, MAX_CACHE);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch (_) {}
  }
  function cached(key) {
    if (memory.has(key)) return memory.get(key);
    const item = readCache()[key];
    if (item && Date.now() - item.at < TTL) {
      memory.set(key, item.data);
      return item.data;
    }
    return null;
  }
  function flatten(data) {
    const entries = Array.isArray(data) ? data : [];
    const result = { word: '', phonetic: '', audio: '', meanings: [], origin: '' };
    const seen = new Set();
    for (const entry of entries) {
      result.word ||= entry.word || '';
      result.phonetic ||= entry.phonetic || (entry.phonetics || []).find(x => x && x.text)?.text || '';
      result.audio ||= (entry.phonetics || []).find(x => x && typeof x.audio === 'string' && x.audio.trim())?.audio || '';
      result.origin ||= entry.origin || '';
      for (const meaning of entry.meanings || []) {
        const defs = [];
        for (const d of meaning.definitions || []) {
          const key = norm(d.definition);
          if (!d.definition || seen.has(key)) continue;
          seen.add(key);
          defs.push({ definition: d.definition, example: d.example || '', synonyms: d.synonyms || [], antonyms: d.antonyms || [] });
        }
        if (defs.length) result.meanings.push({ partOfSpeech: meaning.partOfSpeech || '', definitions: defs });
      }
    }
    if (result.audio.startsWith('//')) result.audio = 'https:' + result.audio;
    return result;
  }
  async function lookup(phrase) {
    const key = norm(phrase);
    const old = cached(key);
    if (old) return old;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(API + encodeURIComponent(String(phrase).trim()), {
        method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal, cache: 'no-store'
      });
      if (response.status === 404) return { notFound: true };
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const json = await response.json();
      if (!Array.isArray(json)) return { notFound: true };
      const data = flatten(json);
      if (!data.meanings.length) return { notFound: true };
      memory.set(key, data);
      writeCache(key, data);
      return data;
    } finally { clearTimeout(timeout); }
  }
  function ensureUI() {
    if ($('#edDialog')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<dialog id="edDialog" class="ed-dialog" aria-labelledby="edTitle">' +
      '<header class="ed-head"><div><span class="ed-kicker">ENGOPLAY · SMART DICTIONARY</span><h2 id="edTitle">Dictionary</h2><p id="edSub">معنى الكلمة واستخدامها في السياق</p></div><button type="button" class="ed-close" data-ed-close aria-label="إغلاق">×</button></header>' +
      '<form id="edSearchForm" class="ed-search"><input id="edSearch" maxlength="80" autocomplete="off" spellcheck="false" placeholder="اكتب كلمة أو تعبيرًا بالإنجليزية" aria-label="ابحث في القاموس"><button type="submit">بحث</button></form>' +
      '<div id="edStatus" class="ed-status" role="status" aria-live="polite"></div><div id="edResult" class="ed-result"></div>' +
      '<footer class="ed-foot"><span>التعريفات من Free Dictionary API · قد لا تتوفر كل الكلمات والتعبيرات</span><button type="button" id="edSave" class="ed-save" disabled>＋ احفظ في بنك الكلمات</button></footer></dialog>' +
      '<button type="button" id="edSelectionTrigger" class="ed-selection-trigger" hidden>قاموس <span>↗</span></button>');
    floating = $('#edSelectionTrigger');
  }
  function setStatus(text) { const el = $('#edStatus'); if (el) el.textContent = text; }
  function render(data, phrase) {
    const result = $('#edResult');
    const save = $('#edSave');
    if (!result) return;
    if (data.notFound) {
      result.innerHTML = '<div class="ed-empty"><strong>ملقيناش تعريف للكلمة دي.</strong><p>جرّب كلمة واحدة، أو راجع كتابة التعبير. بعض التعابير المركبة مش موجودة في القاموس.</p></div>';
      if (save) save.disabled = true;
      return;
    }
    const audio = data.audio ? '<button type="button" class="ed-audio" data-ed-audio aria-label="استمع للنطق">▶ <span>اسمع النطق</span></button>' : '';
    const meanings = data.meanings.slice(0, 5).map(group =>
      '<section class="ed-meaning"><span class="ed-pos">' + esc(group.partOfSpeech) + '</span>' +
      '<ol>' + group.definitions.slice(0, 4).map(d =>
        '<li><p>' + esc(d.definition) + '</p>' +
        (d.example ? '<blockquote>' + esc(d.example) + '</blockquote>' : '') +
        (d.synonyms.length ? '<div class="ed-related"><b>Synonyms</b> ' + esc(d.synonyms.slice(0, 8).join(' · ')) + '</div>' : '') +
        (d.antonyms.length ? '<div class="ed-related"><b>Antonyms</b> ' + esc(d.antonyms.slice(0, 8).join(' · ')) + '</div>' : '') +
        '</li>').join('') + '</ol></section>').join('');
    result.innerHTML = '<div class="ed-wordline"><div><h3>' + esc(data.word || phrase) + '</h3><span class="ed-ipa">' + esc(data.phonetic || 'النطق الصوتي غير متاح') + '</span></div>' + audio + '</div>' +
      meanings + (data.origin ? '<details class="ed-origin"><summary>أصل الكلمة</summary><p>' + esc(data.origin) + '</p></details>' : '') +
      '<p class="ed-note">التعريف بالإنجليزية. القاموس لا يوفر ترجمة عربية موثوقة؛ تقدر تضيف المعنى العربي بنفسك في بنك الكلمات.</p>';
    if (save) save.disabled = false;
  }
  async function open(phrase, context) {
    ensureUI();
    const clean = String(phrase || '').trim().replace(/\s+/g, ' ');
    if (!validPhrase(clean)) { setStatus('حدد كلمة أو تعبيرًا إنجليزيًا قصيرًا (حتى 6 كلمات).'); $('#edResult').innerHTML = ''; $('#edDialog').showModal(); return; }
    activePhrase = clean;
    activeContext = String(context || '').trim().slice(0, 1200);
    $('#edSearch').value = clean;
    $('#edTitle').textContent = clean;
    $('#edResult').innerHTML = '';
    setStatus('جاري البحث…');
    $('#edSave').disabled = true;
    if (!$('#edDialog').open) $('#edDialog').showModal();
    const token = ++requestToken;
    try {
      const data = await lookup(clean);
      if (token !== requestToken || !$('#edDialog').open) return;
      setStatus(data.notFound ? 'مفيش نتيجة مطابقة.' : 'تم العثور على تعريفات للكلمة.');
      render(data, clean);
      if (data.notFound && clean.includes(' ')) {
        const first = clean.split(/\s+/)[0];
        if (validPhrase(first)) {
          const fallback = await lookup(first);
          if (token !== requestToken || !$('#edDialog').open) return;
          if (!fallback.notFound) {
            setStatus('ملقيناش التعبير كامل؛ دي نتيجة لأول كلمة منه.');
            render(fallback, first);
          }
        }
      }
    } catch (error) {
      if (token !== requestToken || !$('#edDialog').open) return;
      setStatus(error && error.name === 'AbortError' ? 'البحث أخد وقت طويل. جرّب تاني.' : 'القاموس الخارجي مش متاح حاليًا. جرّب بعد شوية.');
      $('#edResult').innerHTML = '<div class="ed-empty"><strong>تعذر تحميل القاموس.</strong><p>ده مش معناه إن الكلمة غلط. تقدر تكمل القراءة وتحاول تاني لاحقًا.</p><button type="button" data-ed-retry>إعادة المحاولة</button></div>';
      $('#edSave').disabled = true;
    }
  }
  async function save() {
    const button = $('#edSave');
    const owner = (() => { try { return typeof user !== 'undefined' && user ? user.id : null; } catch (_) { return null; } })();
    const client = (() => { try { return typeof sb !== 'undefined' ? sb : null; } catch (_) { return null; } })();
    if (!owner || !client) { setStatus('سجّل دخولك الأول علشان تحفظ الكلمة.'); return; }
    if (!activePhrase) return;
    button.disabled = true;
    button.textContent = 'جاري الحفظ…';
    try {
      const existing = await client.from('english_words').select('word').eq('user_id', owner).ilike('word', activePhrase).limit(1);
      if (existing.error) throw existing.error;
      if (!existing.data || !existing.data.length) {
        const inserted = await client.from('english_words').insert({
          user_id: owner, word: activePhrase, meaning: '', example: activeContext || activePhrase
        });
        if (inserted.error) throw inserted.error;
      }
      setStatus('الكلمة موجودة بالفعل أو اتحفظت في بنك الكلمات ✓');
      button.textContent = '✓ محفوظة في بنك الكلمات';
    } catch (_) {
      setStatus('تعذر الحفظ في الوقت الحالي. جرّب تاني.');
      button.disabled = false;
      button.textContent = '＋ احفظ في بنك الكلمات';
    }
  }
  function hideFloating() { if (floating) floating.hidden = true; }
  function showFloating(text, context, rect) {
    if (!floating) return;
    if (!validPhrase(text)) { hideFloating(); return; }
    floating.dataset.phrase = text;
    floating.dataset.context = context || '';
    floating.hidden = false;
    const x = Math.max(90, Math.min(window.innerWidth - 90, rect.left + rect.width / 2));
    const y = Math.max(12, rect.top - 46);
    floating.style.left = x + 'px';
    floating.style.top = y + 'px';
  }
  function selectionHandler() {
    const selection = window.getSelection && window.getSelection();
    if (!selection || selection.isCollapsed) { hideFloating(); return; }
    const text = selection.toString().trim().replace(/\s+/g, ' ');
    if (!validPhrase(text)) { hideFloating(); return; }
    const range = selection.getRangeAt(0);
    const host = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
    if (!host || !host.closest || host.closest('#ersBody') || !host.closest('#ea12Center')) { hideFloating(); return; }
    const rect = range.getBoundingClientRect();
    const context = host.closest('p, article, section')?.textContent || text;
    showFloating(text, context, rect);
  }
  function click(e) {
    const t = e.target.closest && e.target.closest('[data-ed-close],[data-ed-audio],[data-ed-retry],#edSave,#edSelectionTrigger');
    if (!t) return;
    if (t.hasAttribute('data-ed-close')) { $('#edDialog').close(); return; }
    if (t.id === 'edSelectionTrigger') { const phrase=t.dataset.phrase, context=t.dataset.context; hideFloating(); return void open(phrase, context); }
    if (t.hasAttribute('data-ed-audio')) {
      const key = norm(activePhrase), data = cached(key);
      if (!data || !data.audio) return;
      const audio = new Audio(data.audio);
      audio.play().catch(() => setStatus('تعذر تشغيل ملف النطق على هذا الجهاز.'));
      return;
    }
    if (t.hasAttribute('data-ed-retry')) return void open(activePhrase, activeContext);
    if (t.id === 'edSave') return void save();
  }
  function submit(e) {
    if (e.target.id !== 'edSearchForm') return;
    e.preventDefault();
    const phrase = $('#edSearch').value.trim();
    void open(phrase, activeContext);
  }
  function boot() {
    ensureUI();
    document.addEventListener('mouseup', selectionHandler);
    document.addEventListener('keyup', e => { if (['Shift','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) selectionHandler(); });
    document.addEventListener('click', click);
    document.addEventListener('submit', submit);
    document.addEventListener('scroll', hideFloating, true);
    document.addEventListener('pointerdown', e => { if (floating && !floating.contains(e.target)) hideFloating(); });
  }
  window.SERAG_DICTIONARY_V1 = { open, lookup, version: 1 };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();