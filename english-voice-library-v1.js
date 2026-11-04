/* Private recording library. Live browser transcription is optional; no paid API. */
(() => {
  'use strict';
  const TABLE = 'english_voice_recordings', BUCKET = 'serag-attachments', MAX_BYTES = 50 * 1024 * 1024;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => window.user?.id || null;
  const db = () => window.sb;
  let owner = null, rows = [], request = 0, search = '', archived = false, status = '', loading = false;
  let draft = null, recorder = null, stream = null, recognition = null, timer = null, elapsed = 0;
  let requestingMic = false, saving = false, saveTicket = null, previewUrl = '', authBound = false, modelSpeaking = false;
  const speechAPI = () => window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const fmtTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const fields = ['title', 'practice_text', 'transcript', 'notes', 'language'];
  function fileInfo(file) {
    if (!file || !file.size) throw Error('Choose a non-empty audio file.');
    if (file.size > MAX_BYTES) throw Error('Audio must be 50 MB or smaller.');
    const type = String(file.type || '').split(';')[0].toLowerCase();
    const ext = String(file.name || '').split('.').pop().toLowerCase();
    const formats = {mp3:'audio/mpeg',m4a:'audio/mp4',mp4:'audio/mp4',aac:'audio/aac',wav:'audio/wav',ogg:'audio/ogg',oga:'audio/ogg',webm:'audio/webm',flac:'audio/flac'};
    if (!type.startsWith('audio/') && type !== 'video/webm' && !(type === '' && formats[ext])) throw Error('Choose an audio file such as MP3, M4A, WAV, OGG or WebM.');
    return {mime:type || formats[ext], ext:formats[ext] ? ext : type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : type.includes('mpeg') ? 'mp3' : 'webm'};
  }
  function chooseMime() {
    return ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'].find(type => window.MediaRecorder?.isTypeSupported?.(type)) || '';
  }
  function html() {
    return `<section class="evl-library" aria-label="Voice library" lang="en" dir="ltr">
      <header class="evl-head"><div><small>YOUR SPEAKING SPACE</small><h3>Voice library</h3><p>Read aloud. Listen back. Keep each attempt and notice what improves.</p></div><button type="button" class="evl-primary" data-evl-new>＋ New recording</button></header>
      <div class="evl-steps"><span><b>01</b> Add a text to practise</span><span><b>02</b> Record or upload your voice</span><span><b>03</b> Listen, reflect and try again</span></div>
      <div class="evl-toolbar"><label>Search recordings<input type="search" data-evl-search placeholder="Title, practice text or transcript" value="${esc(search)}"></label><label>Show<select data-evl-filter><option value="active" ${!archived?'selected':''}>My recordings</option><option value="archived" ${archived?'selected':''}>Archived recordings</option></select></label><button type="button" data-evl-refresh>Refresh</button></div>
      <p class="evl-status" data-evl-status role="status">${esc(status)}</p><div class="evl-grid" data-evl-rows>${listHTML()}</div>
    </section>`;
  }
  function listHTML() {
    if (loading) return '<p class="evl-empty">Loading your recordings…</p>';
    const needle = search.trim().toLowerCase(), matches = rows.filter(row => row.archived === archived && [row.title,row.practice_text,row.transcript,row.notes].join(' ').toLowerCase().includes(needle));
    if (!matches.length) return `<div class="evl-empty"><h4>${needle?'No matching recordings':archived?'No archived recordings':'Your voice, one attempt at a time.'}</h4><p>${needle?'Try a different word.':archived?'Recordings you archive can be restored here.':'Start with 30–60 seconds. Save a recording, listen back and choose one thing to improve.'}</p></div>`;
    return matches.map(row => `<article class="evl-card"><div class="evl-card-meta"><span>${esc(new Date(row.created_at).toLocaleDateString('en-GB'))}</span><span>${(row.audio_bytes / 1024 / 1024).toFixed(1)} MB</span></div><h4>${esc(row.title)}</h4><p>${esc((row.practice_text || row.transcript || 'Add a practice text or transcript when you open this recording.').slice(0,180))}</p><span class="evl-badge">${row.transcript?'Transcript saved':'Audio saved'}</span><div class="evl-actions"><button type="button" data-evl-open="${esc(row.id)}">Open & listen</button>${!archived?`<button type="button" data-evl-again="${esc(row.id)}">Record again</button>`:''}<button type="button" data-evl-archive="${esc(row.id)}">${archived?'Restore':'Archive'}</button></div></article>`).join('');
  }
  function paintList() {
    const list = $('[data-evl-rows]'), message = $('[data-evl-status]');
    if (list) list.innerHTML = listHTML();
    if (message) message.textContent = status;
  }
  async function load() {
    const account = uid();
    if (!account || !db()) return;
    if (owner !== account) resetAccount(account);
    const serial = ++request;
    loading = true; status = ''; paintList();
    try {
      const result = await db().from(TABLE).select('*').eq('user_id', account).order('created_at', {ascending:false});
      if (uid() !== account || serial !== request) return;
      if (result.error) throw result.error;
      rows = result.data || [];
    } catch (_) { if (uid() === account && serial === request) status = 'Could not load your library. Check your connection and select Refresh.'; }
    finally { if (uid() === account && serial === request) { loading = false; paintList(); } }
  }
  function releaseUrl() { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = ''; }
  function releaseMic() {
    clearInterval(timer); timer = null;
    stream?.getTracks().forEach(track => track.stop()); stream = null;
  }
  function stopRecognition(abort = false) {
    const current = recognition; recognition = null;
    if (current) { try { abort ? current.abort() : current.stop(); } catch (_) {} }
  }
  function clearDraft() {
    const current = recorder; recorder = null;
    if (current) { current.onstop = null; current.ondataavailable = null; try { if (current.state !== 'inactive') current.stop(); } catch (_) {} }
    requestingMic = false; stopRecognition(true); releaseMic(); releaseUrl();
    if (modelSpeaking) { window.speechSynthesis?.cancel(); modelSpeaking = false; }
    $('#evlAudio')?.pause(); const audio = $('#evlAudio'); if (audio) { audio.removeAttribute('src'); audio.load(); }
    draft = null;
  }
  function resetAccount(account) {
    ++request; rows = []; owner = account; loading = false; search = ''; archived = false; status = ''; saving = false; saveTicket = null;
    clearDraft(); $('#evlEditor')?.close(); paintList();
    if ($('[data-evl-search]')) $('[data-evl-search]').value = '';
    if ($('[data-evl-filter]')) $('[data-evl-filter]').value = 'active';
  }
  function dialogHTML() {
    return `<dialog id="evlEditor" class="evl-dialog" aria-labelledby="evlEditorTitle" lang="en" dir="ltr"><form id="evlForm">
      <header class="evl-head"><div><small>RECORD · REVIEW · REPEAT</small><h2 id="evlEditorTitle">New recording</h2></div><button type="button" data-evl-close aria-label="Close voice recording">×</button></header>
      <label>Title<input id="evlTitle" data-evl-field="title" maxlength="200" required placeholder="e.g. My morning routine · Take 1"></label>
      <label>Text to practise <span class="evl-muted">Optional</span><textarea id="evlPractice" data-evl-field="practice_text" maxlength="20000" rows="3" placeholder="Paste a short English text, or describe what you want to talk about."></textarea></label>
      <div class="evl-actions"><button type="button" data-evl-model>Listen to practice text</button><label class="evl-language">English voice<select id="evlLanguage" data-evl-field="language"><option value="en-US">American English</option><option value="en-GB">British English</option></select></label></div>
      <section class="evl-recorder"><div id="evlCapture"><div class="evl-actions"><button type="button" class="evl-primary" data-evl-record>● Start recording</button><button type="button" data-evl-stop disabled>■ Stop recording</button><span id="evlTimer" aria-label="Recording time">0:00</span></div>
      <label class="evl-check"><input id="evlLive" type="checkbox">Live transcript while recording (optional)</label><p class="evl-muted" id="evlLiveHelp">Uses your browser’s speech service, which may send audio to its provider and require internet. Availability and accuracy vary. This is a transcript, not a pronunciation score.</p>
      <label class="evl-upload">Or upload audio<input id="evlFile" type="file" accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.webm,.flac"></label><p class="evl-muted">Up to 50 MB. Microphone recordings stop after 10 minutes. Uploaded files are not transcribed automatically; add their transcript below.</p></div>
      <p class="evl-status" id="evlCaptureStatus" role="status"></p><audio id="evlAudio" controls preload="metadata" hidden></audio><div class="evl-actions"><label>Playback speed<select id="evlSpeed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label><a id="evlDownload" hidden download target="_blank" rel="noopener">Download audio</a></div></section>
      <div class="evl-text-grid"><label>Transcript <span class="evl-muted">Editable</span><textarea id="evlTranscript" data-evl-field="transcript" maxlength="20000" rows="5" placeholder="Live transcript appears here if supported. You can also type or paste it."></textarea></label><label>My pronunciation notes<textarea id="evlNotes" data-evl-field="notes" maxlength="10000" rows="5" placeholder="Which sounds, words or pauses will you practise next?"></textarea></label></div>
      <p class="evl-status" id="evlSaveStatus" role="status"></p><footer class="evl-actions evl-footer"><button type="button" data-evl-close>Cancel</button><button type="submit" class="evl-primary" id="evlSave">Save recording</button></footer>
    </form></dialog>`;
  }
  function message(text) { const el = $('#evlSaveStatus'); if (el) el.textContent = text; }
  function captureMessage(text) { const el = $('#evlCaptureStatus'); if (el) el.textContent = text; }
  function controls() {
    const active = !!recorder || requestingMic;
    document.querySelectorAll('#evlEditor [data-evl-field]').forEach(el => { el.disabled = saving || active; });
    document.querySelectorAll('#evlEditor [data-evl-close]').forEach(el => { el.disabled = saving; });
    const start = $('[data-evl-record]'), stop = $('[data-evl-stop]');
    if (start) start.disabled = saving || active || !supported();
    if (stop) stop.disabled = !recorder;
    $('#evlFile').disabled = saving || active;
    $('#evlLive').disabled = saving || active || !speechAPI();
    $('#evlSave').disabled = saving || active || (!draft?.blob && !draft?.existing);
    $('#evlSave').textContent = saving ? 'Saving…' : draft?.existing ? 'Save changes' : 'Save recording';
  }
  function attachAudio(url, filename) {
    const audio = $('#evlAudio'); audio.pause(); audio.src = url; audio.hidden = false;
    audio.playbackRate = Number($('#evlSpeed').value) || 1;
    const download = $('#evlDownload'); download.href = url; download.download = filename || 'voice-recording'; download.hidden = false;
  }
  async function open(row = null, again = false) {
    if (!uid()) return;
    if (draft && !(await close())) return;
    clearDraft();
    draft = {owner:uid(), id:row && !again ? row.id : crypto.randomUUID(), existing:row && !again ? row : null, blob:null, uploadedPath:null, dirty:false,
      title:again ? `${row.title.slice(0,175)} · New take` : row?.title || 'Pronunciation practice', practice_text:row?.practice_text || '', transcript:again?'':row?.transcript || '', notes:again?'':row?.notes || '', language:row?.language || 'en-US'};
    const current = draft;
    $('#evlForm').reset();
    for (const field of fields) $(`[data-evl-field="${field}"]`).value = draft[field];
    $('#evlEditorTitle').textContent = draft.existing ? 'Review your recording' : 'New recording';
    $('#evlCapture').hidden = !!draft.existing; $('#evlAudio').hidden = true; $('#evlDownload').hidden = true;
    message(''); captureMessage(draft.existing ? 'Loading saved audio…' : !supported() ? 'Microphone recording is unavailable in this browser. You can upload audio instead.' : 'Your recording stays on this device until you save it.');
    if (!speechAPI()) $('#evlLiveHelp').textContent = 'Live transcription is unavailable in this browser. You can record or upload audio and add the transcript yourself.';
    else $('#evlLiveHelp').textContent = 'Uses your browser’s speech service, which may send audio to its provider and require internet. Availability and accuracy vary. This is a transcript, not a pronunciation score.';
    elapsed = 0; $('#evlTimer').textContent = '0:00'; controls(); $('#evlEditor').showModal();
    if (!draft.existing) return;
    try {
      const result = await db().storage.from(BUCKET).createSignedUrl(row.storage_path, 900);
      if (draft !== current || uid() !== current.owner) return;
      if (result.error || !result.data?.signedUrl) throw Error('Audio unavailable');
      attachAudio(result.data.signedUrl, row.audio_name); captureMessage('Listen back, edit the transcript and note one thing to improve. Reopen this recording to refresh an expired audio link.');
    } catch (_) { if (draft === current) captureMessage('Could not load audio. Close and reopen to retry. Your saved notes are still available.'); }
  }
  function startRecognition(current) {
    if (!$('#evlLive').checked || !speechAPI()) return;
    try {
      const engine = new (speechAPI())(); recognition = engine;
      engine.lang = current.language; engine.continuous = true; engine.interimResults = true;
      engine.onresult = event => {
        if (draft !== current || uid() !== current.owner || !recorder) return;
        let text = ''; for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript + ' ';
        current.transcript = text.trim().slice(0,20000);
        $('#evlTranscript').value = current.transcript; current.dirty = true;
      };
      engine.onerror = event => { if (draft === current) captureMessage(`Audio is still recording. Live transcript ${event.error === 'not-allowed'?'was not allowed':'is unavailable'}. You can edit the transcript after stopping.`); };
      engine.onend = () => { if (recognition === engine) { recognition = null; if (recorder && draft === current) captureMessage('Audio is still recording. Live transcript ended; you can add any missing text after stopping.'); } };
      engine.start();
    } catch (_) { recognition = null; captureMessage('Audio is recording. Live transcription could not start; you can type the transcript later.'); }
  }
  async function startRecording() {
    const current = draft;
    if (!current || current.existing || current.owner !== uid() || recorder || saving || requestingMic || !supported()) return;
    if (current.uploadedPath) { message('Save this uploaded attempt, or discard the draft before replacing its audio.'); return; }
    if (current.blob && !window.confirm('Replace the unsaved audio in this draft?')) return;
    requestingMic = true; controls(); captureMessage('Waiting for microphone permission…');
    try {
      const media = await navigator.mediaDevices.getUserMedia({audio:true});
      if (draft !== current || uid() !== current.owner) { media.getTracks().forEach(track => track.stop()); return; }
      stream = media;
      $('#evlAudio')?.pause();
      if (modelSpeaking) { window.speechSynthesis?.cancel(); modelSpeaking = false; }
      const mime = chooseMime(), rec = mime ? new MediaRecorder(media, {mimeType:mime}) : new MediaRecorder(media), chunks = [];
      recorder = rec;
      let bytes = 0;
      rec.ondataavailable = event => { if (draft !== current || uid() !== current.owner) return; if (event.data?.size) { chunks.push(event.data); bytes += event.data.size; if (bytes >= MAX_BYTES) stopRecording(); } };
      rec.onstop = () => {
        if (recorder === rec) recorder = null;
        releaseMic(); stopRecognition();
        if (draft !== current || uid() !== current.owner) return;
        const blob = new Blob(chunks, {type:rec.mimeType || chunks[0]?.type || 'audio/webm'});
        try { fileInfo(blob); } catch (error) { captureMessage(error.message); controls(); return; }
        releaseUrl(); current.blob = blob; current.audioName = `recording.${fileInfo(blob).ext}`; current.dirty = true;
        previewUrl = URL.createObjectURL(blob); attachAudio(previewUrl, current.audioName);
        captureMessage('Recording ready. Listen back, review the transcript and save your attempt.'); controls();
      };
      rec.onerror = () => { captureMessage('Recording was interrupted. Stop and check the audio before saving.'); stopRecording(); };
      rec.start(1000); elapsed = 0; const began = Date.now();
      timer = setInterval(() => { elapsed = Math.floor((Date.now() - began) / 1000); const label = $('#evlTimer'); if (label) label.textContent = fmtTime(elapsed); if (elapsed >= 600) stopRecording(); }, 250);
      captureMessage('Recording… Select Stop recording when you are done.'); startRecognition(current);
    } catch (_) { if (draft === current) { recorder = null; releaseMic(); captureMessage('Could not access the microphone. Allow microphone access, or upload an audio file instead.'); } }
    finally { if (draft === current) { requestingMic = false; controls(); } }
  }
  function stopRecording() {
    if (!recorder) return;
    stopRecognition(); clearInterval(timer); timer = null;
    if (recorder.state !== 'inactive') recorder.stop();
    // Stop the microphone immediately, even when the final data event is delayed.
    stream?.getTracks().forEach(track => track.stop());
  }
  async function useFile(file) {
    if (!draft || draft.existing || saving || recorder || requestingMic) return;
    if (draft.uploadedPath) { message('Save this uploaded attempt, or discard the draft before replacing its audio.'); return; }
    try {
      fileInfo(file);
      if (draft.blob && !window.confirm('Replace the unsaved audio in this draft?')) return;
      releaseUrl(); draft.blob = file; draft.audioName = String(file.name || 'uploaded-audio').slice(0,200); draft.dirty = true;
      previewUrl = URL.createObjectURL(file); attachAudio(previewUrl, draft.audioName);
      captureMessage('Audio ready. Add a transcript if you have one, listen back and save.'); controls();
    } catch (error) { message(error.message); }
  }
  function readFields() { if (!draft) return; for (const field of fields) draft[field] = $(`[data-evl-field="${field}"]`).value; }
  async function saveDraft() {
    const current = draft;
    if (!current || saving || recorder || requestingMic || uid() !== current.owner) return;
    readFields();
    if (!current.title.trim()) { message('Add a title for this recording.'); return; }
    if (!current.existing && !current.blob) { message('Record your voice or choose an audio file first.'); return; }
    const ticket = {}; saveTicket = ticket; saving = true; message('Saving privately to your account…'); controls();
    try {
      const metadata = Object.fromEntries(fields.map(field => [field, current[field]])); metadata.title = metadata.title.trim();
      let result;
      if (current.existing) {
        result = await db().from(TABLE).update(metadata).eq('user_id',current.owner).eq('id',current.id).eq('revision',current.existing.revision).select('*');
        if (!result.error && !result.data?.length) throw Error('This recording changed on another device. Your edits are still here. Copy them, close this window and refresh before editing again.');
      } else {
        const info = fileInfo(current.blob);
        if (!current.uploadedPath) {
          const path = `${current.owner}/voice/${current.id}/audio.${info.ext}`;
          const upload = await db().storage.from(BUCKET).upload(path,current.blob,{contentType:info.mime,upsert:true});
          if (upload.error) throw Error('Audio upload failed. Your draft is still here; check your connection and try Save again.');
          current.uploadedPath = path;
        }
        if (draft !== current || uid() !== current.owner) return;
        result = await db().from(TABLE).insert({...metadata,id:current.id,user_id:current.owner,storage_path:current.uploadedPath,audio_name:current.audioName,audio_mime_type:info.mime,audio_bytes:current.blob.size}).select('*');
        // An interrupted response may follow a successful insert. Never overwrite it on retry.
        if (result.error?.code === '23505') {
          result = await db().from(TABLE).select('*').eq('id',current.id).eq('user_id',current.owner);
          const saved = result.data?.[0];
          if (saved && (saved.storage_path !== current.uploadedPath || fields.some(field => saved[field] !== metadata[field]))) throw Error('This attempt was already saved during an earlier request. Your latest edits are still here. Copy them, then close and reopen the saved recording to update it.');
        }
      }
      if (draft !== current || uid() !== current.owner) return;
      if (result.error) throw Error('Could not save this recording. Your draft and audio are still here. Check your connection and try Save again.');
      if (!result.data?.length) throw Error('The server did not confirm the save. Keep this window open and try again.');
      const saved = result.data[0]; rows = [saved,...rows.filter(row => row.id !== saved.id)];
      clearDraft(); $('#evlEditor').close(); status = 'Recording saved to your private library.'; paintList();
    } catch (error) { if (draft === current) message(error.message || 'Could not save. Your draft is still here.'); }
    finally { if (saveTicket === ticket) { saving = false; saveTicket = null; if (draft === current) controls(); } }
  }
  async function close() {
    if (saving) return false;
    if (draft && (draft.dirty || recorder || requestingMic) && !window.confirm('Discard this unsaved draft? Download the audio first if you want to keep it.')) return false;
    const old = draft;
    clearDraft(); $('#evlEditor')?.close();
    if (old?.uploadedPath && uid() === old.owner) {
      // A failed insert can have committed remotely. Only remove an upload proven to be unreferenced.
      try { const check = await db().from(TABLE).select('id').eq('id',old.id).eq('user_id',old.owner); if (!check.error && !check.data?.length && uid() === old.owner) await db().storage.from(BUCKET).remove([old.uploadedPath]); } catch (_) {}
    }
    return true;
  }
  async function toggleArchive(id) {
    const row = rows.find(item => item.id === id), account = uid(); if (!row || !account || loading) return;
    loading = true; status = row.archived ? 'Restoring recording…' : 'Archiving recording…'; paintList();
    try {
      const result = await db().from(TABLE).update({archived:!row.archived}).eq('id',id).eq('user_id',account).eq('revision',row.revision).select('*');
      if (uid() !== account) return;
      if (result.error || !result.data?.length) throw Error('Could not update this recording. Select Refresh and try again.');
      rows = rows.map(item => item.id === id ? result.data[0] : item); status = row.archived ? 'Recording restored.' : 'Recording archived. You can restore it from Archived recordings.';
    } catch (error) { if (uid() === account) status = error.message; }
    finally { if (uid() === account) { loading = false; paintList(); } }
  }
  function mount() {
    if (!$('#evlEditor')) {
      document.body.insertAdjacentHTML('beforeend',dialogHTML());
      $('#evlForm').addEventListener('submit', event => { event.preventDefault(); void saveDraft(); });
      $('#evlEditor').addEventListener('cancel', event => { event.preventDefault(); void close(); });
      $('#evlEditor').addEventListener('input', event => { if (event.target.dataset.evlField && draft) { draft[event.target.dataset.evlField] = event.target.value; draft.dirty = true; } });
      $('#evlFile').addEventListener('change', event => { void useFile(event.target.files?.[0]); event.target.value = ''; });
      $('#evlSpeed').addEventListener('change', event => { $('#evlAudio').playbackRate = Number(event.target.value) || 1; });
    }
    if (!authBound && db()?.auth?.onAuthStateChange) { authBound = true; db().auth.onAuthStateChange((_event, session) => { const next = session?.user?.id || null; if (owner !== next) resetAccount(next); }); }
    if (owner !== uid()) resetAccount(uid());
    void load();
  }
  function cleanup() { $('#evlAudio')?.pause(); }
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-evl-new')) void open();
    else if (button.dataset.evlOpen) { const row = rows.find(row => row.id === button.dataset.evlOpen); if (row) void open(row); }
    else if (button.dataset.evlAgain) { const row = rows.find(row => row.id === button.dataset.evlAgain); if (row) void open(row,true); }
    else if (button.dataset.evlArchive) void toggleArchive(button.dataset.evlArchive);
    else if (button.hasAttribute('data-evl-refresh')) void load();
    else if (button.hasAttribute('data-evl-close')) void close();
    else if (button.hasAttribute('data-evl-record')) void startRecording();
    else if (button.hasAttribute('data-evl-stop')) stopRecording();
    else if (button.hasAttribute('data-evl-model') && draft) {
      readFields(); if (!draft.practice_text.trim()) { message('Add an English text to practise first.'); return; }
      if (recorder || requestingMic) { message('Stop recording before playing the practice text.'); return; }
      if (!window.speechSynthesis) { message('Read-aloud is unavailable in this browser.'); return; }
      speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(draft.practice_text); utterance.lang = draft.language; utterance.rate = .85; modelSpeaking = true; utterance.onend = utterance.onerror = () => { modelSpeaking = false; }; speechSynthesis.speak(utterance);
    }
  });
  document.addEventListener('input', event => { if (event.target.hasAttribute('data-evl-search')) { search = event.target.value; paintList(); } });
  document.addEventListener('change', event => { if (event.target.hasAttribute('data-evl-filter')) { archived = event.target.value === 'archived'; paintList(); } });
  window.addEventListener('beforeunload', event => { if (draft?.dirty || recorder || requestingMic || saving) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('pagehide', () => { if (recorder) stopRecording(); else releaseMic(); stopRecognition(true); });
  window.SERAG_VOICE_LIBRARY_V1 = {html,mount,cleanup};
})();
