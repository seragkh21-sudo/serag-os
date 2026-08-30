(()=>{
  const q=id=>document.getElementById(id);
  const BUCKET='serag-attachments';
  const MAX_BYTES=50*1024*1024;
  let audioArticleId=null;
  let audioRow=null;
  let saveTimer=null;
  let lastSavedSecond=-1;

  const safeName=name=>String(name||'audio').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-100);
  const extOf=file=>{
    const fromName=(file?.name||'').split('.').pop();
    if(fromName&&fromName!==file?.name)return fromName.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8)||'audio';
    const mime=String(file?.type||'').split('/')[1]?.split(';')[0];
    return (mime||'audio').replace(/[^a-z0-9]/g,'').slice(0,8);
  };
  const fmtBytes=n=>n>=1024*1024?`${(n/1024/1024).toFixed(1)} MB`:`${Math.ceil(n/1024)} KB`;

  function mount(){
    const modal=document.querySelector('[data-english-modal]');
    const body=modal?.querySelector('.english-modal-body');
    if(!modal||!body){setTimeout(mount,120);return}
    if(document.querySelector('[data-article-audio-panel]'))return;

    if(!document.querySelector('link[href="/english-audio-v4.css"]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='/english-audio-v4.css';document.head.appendChild(link);
    }

    body.insertAdjacentHTML('afterbegin',`
      <section class="article-audio-panel" data-article-audio-panel>
        <div class="article-audio-head">
          <div><strong>Article Audio</strong><div class="muted">ارفع تسجيلك الخاص، وهيشتغل بدل الصوت الآلي.</div></div>
          <span id="articleAudioState" class="article-audio-badge">TTS fallback</span>
        </div>
        <div id="articleAudioContent" class="article-audio-content"></div>
        <input id="articleAudioFile" type="file" accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.webm" hidden />
      </section>`);

    document.addEventListener('click',captureOpenArticle,true);
    q('articleAudioFile').addEventListener('change',handleUpload);
    q('articleReadBtn')?.addEventListener('click',captureReadAloud,true);
    q('articleDeleteBtn')?.addEventListener('click',captureDeleteArticle,true);
    q('articleCloseBtn')?.addEventListener('click',()=>persistProgress(true),true);
    modal.addEventListener('click',e=>{if(e.target===modal)persistProgress(true)},true);
  }

  function captureOpenArticle(e){
    const b=e.target.closest?.('[data-open-article]');
    if(!b)return;
    audioArticleId=b.dataset.openArticle;
    setTimeout(()=>loadAudioArticle(audioArticleId),40);
  }

  async function loadAudioArticle(id){
    if(!id||!user)return;
    const {data,error}=await sb.from('english_writing').select('id,title,audio_storage_path,audio_name,audio_mime_type,audio_position_seconds,audio_playback_rate').eq('id',id).single();
    if(error){console.warn('article audio load',error);return renderEmpty()}
    audioRow=data;audioArticleId=data.id;
    await renderAudio();
  }

  function renderEmpty(){
    audioRow=null;
    q('articleAudioState').textContent='TTS fallback';
    q('articleAudioContent').innerHTML=`
      <div class="article-audio-empty">
        <div><strong>مفيش Custom audio للمقال ده</strong><span>ارفع MP3 / M4A / WAV أو أي ملف صوتي حتى 50MB.</span></div>
        <button class="btn primary" data-audio-upload type="button">＋ Upload audio</button>
      </div>`;
    bindPanelButtons();
  }

  async function renderAudio(){
    if(!audioRow?.audio_storage_path)return renderEmpty();
    const {data:signed,error}=await sb.storage.from(BUCKET).createSignedUrl(audioRow.audio_storage_path,60*60*4);
    if(error){console.warn('audio signed url',error);return renderEmpty()}
    const rate=Math.max(.5,Math.min(2,Number(audioRow.audio_playback_rate||1)));
    q('articleAudioState').textContent='Custom audio';
    q('articleAudioContent').innerHTML=`
      <div class="article-audio-player-wrap">
        <div class="article-audio-fileline"><span>🎧</span><div><strong>${escapeHtml(audioRow.audio_name||'Custom article audio')}</strong><small>محفوظ مع المقال على حسابك</small></div></div>
        <audio id="articleCustomAudio" controls preload="metadata" src="${escapeAttr(signed.signedUrl)}"></audio>
        <div class="article-audio-controls">
          <div class="article-speed-group"><span>Speed</span>${[.75,1,1.25,1.5].map(v=>`<button class="article-speed ${Math.abs(rate-v)<.01?'active':''}" data-audio-rate="${v}" type="button">${v}×</button>`).join('')}</div>
          <div class="article-audio-manage"><button class="btn" data-audio-upload type="button">Replace</button><button class="btn danger" data-audio-remove type="button">Remove</button></div>
        </div>
        <div id="articleAudioResume" class="muted article-audio-resume"></div>
      </div>`;
    bindPanelButtons();
    bindPlayer(rate);
  }

  function bindPanelButtons(){
    document.querySelectorAll('[data-audio-upload]').forEach(b=>b.onclick=()=>{q('articleAudioFile').value='';q('articleAudioFile').click()});
    document.querySelector('[data-audio-remove]')?.addEventListener('click',removeAudio);
    document.querySelectorAll('[data-audio-rate]').forEach(b=>b.onclick=()=>setRate(Number(b.dataset.audioRate)));
  }

  function bindPlayer(rate){
    const audio=q('articleCustomAudio');if(!audio)return;
    audio.playbackRate=rate;
    const resume=Math.max(0,Number(audioRow?.audio_position_seconds||0));
    audio.addEventListener('loadedmetadata',()=>{
      if(resume>0&&isFinite(audio.duration)&&resume<audio.duration-2){
        audio.currentTime=resume;
        q('articleAudioResume').textContent=`مكمّل من ${formatTime(resume)} · السرعة ${rate}×`;
      }else q('articleAudioResume').textContent=`السرعة ${rate}×`;
    },{once:true});
    audio.addEventListener('timeupdate',()=>{
      const sec=Math.floor(audio.currentTime||0);
      if(sec-lastSavedSecond>=10){lastSavedSecond=sec;persistProgress(false)}
    });
    audio.addEventListener('pause',()=>persistProgress(true));
    audio.addEventListener('ended',async()=>{
      if(!audioArticleId)return;
      await sb.from('english_writing').update({audio_position_seconds:0,updated_at:new Date().toISOString()}).eq('id',audioArticleId);
      if(audioRow)audioRow.audio_position_seconds=0;
    });
  }

  async function handleUpload(){
    const file=q('articleAudioFile')?.files?.[0];
    if(!file||!audioArticleId||!user)return;
    if(!String(file.type||'').startsWith('audio/')&&!/\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(file.name||''))return toast('اختار ملف صوتي');
    if(file.size>MAX_BYTES)return toast(`الملف كبير — الحد الأقصى ${fmtBytes(MAX_BYTES)}`);

    const oldPath=audioRow?.audio_storage_path||null;
    const ext=extOf(file);
    const path=`${user.id}/english-audio/${audioArticleId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    q('articleAudioState').textContent='Uploading…';
    const {error:upErr}=await sb.storage.from(BUCKET).upload(path,file,{contentType:file.type||'audio/mpeg',upsert:false});
    if(upErr){q('articleAudioState').textContent='Upload failed';return toast(upErr.message)}

    const patch={audio_storage_path:path,audio_name:safeName(file.name),audio_mime_type:file.type||null,audio_position_seconds:0,audio_playback_rate:1,updated_at:new Date().toISOString()};
    const {data,error}=await sb.from('english_writing').update(patch).eq('id',audioArticleId).select('id,title,audio_storage_path,audio_name,audio_mime_type,audio_position_seconds,audio_playback_rate').single();
    if(error){await sb.storage.from(BUCKET).remove([path]);return toast(error.message)}
    if(oldPath&&oldPath!==path)await sb.storage.from(BUCKET).remove([oldPath]);
    audioRow=data;lastSavedSecond=-1;toast('الصوت اتحفظ مع المقال 🎧');await renderAudio();
  }

  async function removeAudio(){
    if(!audioArticleId||!audioRow?.audio_storage_path||!confirm('تشيل الصوت من المقال؟'))return;
    const path=audioRow.audio_storage_path;
    const {error}=await sb.from('english_writing').update({audio_storage_path:null,audio_name:null,audio_mime_type:null,audio_position_seconds:0,audio_playback_rate:1,updated_at:new Date().toISOString()}).eq('id',audioArticleId);
    if(error)return toast(error.message);
    await sb.storage.from(BUCKET).remove([path]);
    toast('اتشال الصوت — رجعنا للـRead aloud');renderEmpty();
  }

  function captureReadAloud(e){
    if(!audioRow?.audio_storage_path)return;
    const audio=q('articleCustomAudio');if(!audio)return;
    e.preventDefault();e.stopImmediatePropagation();
    window.speechSynthesis?.cancel?.();
    if(audio.paused)audio.play().catch(()=>toast('مش قادر أشغّل الملف'));else audio.pause();
  }

  async function setRate(rate){
    const audio=q('articleCustomAudio');if(!audio||!audioArticleId)return;
    const clean=Math.max(.5,Math.min(2,rate||1));audio.playbackRate=clean;
    document.querySelectorAll('[data-audio-rate]').forEach(b=>b.classList.toggle('active',Number(b.dataset.audioRate)===clean));
    if(audioRow)audioRow.audio_playback_rate=clean;
    await sb.from('english_writing').update({audio_playback_rate:clean,updated_at:new Date().toISOString()}).eq('id',audioArticleId);
    q('articleAudioResume').textContent=`${audio.currentTime>1?`عند ${formatTime(audio.currentTime)} · `:''}السرعة ${clean}×`;
  }

  function persistProgress(force){
    const audio=q('articleCustomAudio');if(!audio||!audioArticleId||!audioRow?.audio_storage_path)return;
    clearTimeout(saveTimer);
    const run=async()=>{
      const pos=Math.max(0,Math.floor(audio.currentTime||0));
      const rate=Number(audio.playbackRate||1);
      if(audioRow){audioRow.audio_position_seconds=pos;audioRow.audio_playback_rate=rate}
      await sb.from('english_writing').update({audio_position_seconds:pos,audio_playback_rate:rate,updated_at:new Date().toISOString()}).eq('id',audioArticleId);
    };
    if(force)run();else saveTimer=setTimeout(run,350);
  }

  async function captureDeleteArticle(e){
    if(!audioArticleId||!audioRow?.audio_storage_path)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!confirm('Delete this article?'))return;
    const path=audioRow.audio_storage_path,id=audioArticleId;
    const {error}=await sb.from('english_writing').delete().eq('id',id);
    if(error)return toast(error.message);
    await sb.storage.from(BUCKET).remove([path]);
    q('articleCloseBtn')?.click();
    toast('المقال والصوت اتمسحوا');
    try{await loadEnglish()}catch{}
  }

  const formatTime=s=>{const n=Math.max(0,Math.floor(Number(s||0)));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`};
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeAttr=s=>escapeHtml(s);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
