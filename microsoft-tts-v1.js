(()=>{
  const WORD_CACHE_LIMIT=80;
  const wordAudioCache=new Map();
  let currentAudio=null;
  let currentObjectUrl=null;
  let requestToken=0;

  function stopCurrent(){
    requestToken++;
    try{currentAudio?.pause()}catch{}
    if(currentAudio){try{currentAudio.currentTime=0}catch{}}
    currentAudio=null;
    if(currentObjectUrl){URL.revokeObjectURL(currentObjectUrl);currentObjectUrl=null}
    try{window.speechSynthesis?.cancel?.()}catch{}
  }

  function fallbackSpeak(text,{word=false}={}){
    const value=String(text||'').trim();
    if(!value||!('speechSynthesis' in window))return;
    try{window.speechSynthesis.cancel()}catch{}
    const utter=new SpeechSynthesisUtterance(value);
    utter.lang='en-US';
    utter.rate=word?.78:.9;
    utter.pitch=1;
    const voices=window.speechSynthesis.getVoices?.()||[];
    const preferred=
      voices.find(v=>/microsoft/i.test(v.name)&&/^en-US/i.test(v.lang))||
      voices.find(v=>/microsoft/i.test(v.name)&&/^en/i.test(v.lang))||
      voices.find(v=>/^en-US/i.test(v.lang))||
      voices.find(v=>/^en/i.test(v.lang));
    if(preferred)utter.voice=preferred;
    window.speechSynthesis.speak(utter);
  }

  async function fetchMicrosoftAudio(text,{word=false}={}){
    const value=String(text||'').replace(/\s+/g,' ').trim();
    if(!value)throw new Error('Empty text');

    if(word){
      const key=value.toLowerCase();
      const cached=wordAudioCache.get(key);
      if(cached)return {url:cached,cached:true};
      const res=await fetch(`/api/tts?mode=word&text=${encodeURIComponent(value)}`,{headers:{accept:'audio/mpeg'}});
      if(!res.ok)throw new Error(`TTS ${res.status}`);
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      wordAudioCache.set(key,url);
      if(wordAudioCache.size>WORD_CACHE_LIMIT){
        const oldest=wordAudioCache.keys().next().value;
        const oldUrl=wordAudioCache.get(oldest);
        wordAudioCache.delete(oldest);
        if(oldUrl)URL.revokeObjectURL(oldUrl);
      }
      return {url,cached:true};
    }

    const res=await fetch('/api/tts',{
      method:'POST',
      headers:{'content-type':'application/json',accept:'audio/mpeg'},
      body:JSON.stringify({mode:'article',text:value})
    });
    if(!res.ok)throw new Error(`TTS ${res.status}`);
    const blob=await res.blob();
    return {url:URL.createObjectURL(blob),cached:false};
  }

  async function speakMicrosoft(text,{word=false,button=null}={}){
    const value=String(text||'').trim();
    if(!value)return;
    stopCurrent();
    const token=requestToken;
    const oldText=button?.textContent;
    if(button){button.disabled=true;button.textContent='…'}
    try{
      const result=await fetchMicrosoftAudio(value,{word});
      if(token!==requestToken){if(!result.cached)URL.revokeObjectURL(result.url);return}
      const audio=new Audio(result.url);
      currentAudio=audio;
      if(!result.cached)currentObjectUrl=result.url;
      audio.preload='auto';
      audio.addEventListener('ended',()=>{
        if(currentAudio===audio)currentAudio=null;
        if(!result.cached&&currentObjectUrl===result.url){URL.revokeObjectURL(result.url);currentObjectUrl=null}
      },{once:true});
      await audio.play();
    }catch(error){
      console.warn('Microsoft TTS fallback',error);
      fallbackSpeak(value,{word});
    }finally{
      if(button){button.disabled=false;button.textContent=oldText||'🔊'}
    }
  }

  function wordFromButton(button){
    const card=button.closest('.english-word-card');
    const cardWord=card?.querySelector('.english-word-name')?.textContent?.trim();
    if(cardWord)return cardWord;
    const review=button.closest('#englishReviewBox');
    return review?.querySelector('.english-review-word')?.textContent?.trim()||'';
  }

  function bindArticleButton(){
    const btn=document.getElementById('articleReadBtn');
    if(!btn||btn.dataset.microsoftTtsBound)return;
    btn.dataset.microsoftTtsBound='1';
    btn.textContent='🔊 Microsoft voice';
    btn.title='Read with Microsoft English neural voice';
    btn.onclick=()=>{
      const text=document.getElementById('articleViewPane')?.innerText?.trim();
      if(text)speakMicrosoft(text,{word:false,button:btn});
    };
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest?.('[data-word-sound]');
    if(!button)return;
    const page=document.getElementById('page-english');
    if(!page?.contains(button))return;
    const word=wordFromButton(button);
    if(!word)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    button.title='Microsoft English pronunciation';
    button.setAttribute('aria-label','Microsoft English pronunciation');
    speakMicrosoft(word,{word:true,button});
  },true);

  const ready=()=>{
    bindArticleButton();
    const observer=new MutationObserver(bindArticleButton);
    observer.observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();

  window.seragMicrosoftTTS={speak:speakMicrosoft,stop:stopCurrent};
})();
