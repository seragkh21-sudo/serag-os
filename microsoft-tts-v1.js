(()=>{
  const WORD_CACHE_LIMIT=80;
  const wordAudioCache=new Map();
  let azureAvailable=false;
  let currentAudio=null;
  let currentObjectUrl=null;
  let requestToken=0;

  function allVoices(){return window.speechSynthesis?.getVoices?.()||[]}
  function microsoftVoice(){
    const voices=allVoices();
    const candidates=[
      /microsoft.*(aria|jenny|ava|emma|andrew).*en/i,
      /microsoft.*natural.*english/i,
      /microsoft.*english.*united states/i,
      /microsoft.*en-US/i,
      /microsoft/i
    ];
    for(const rx of candidates){
      const v=voices.find(x=>rx.test(`${x.name} ${x.lang}`)&&/^en/i.test(x.lang||''));
      if(v)return v;
    }
    return null;
  }

  function stopCurrent(){
    requestToken++;
    try{currentAudio?.pause()}catch{}
    if(currentAudio){try{currentAudio.currentTime=0}catch{}}
    currentAudio=null;
    if(currentObjectUrl){URL.revokeObjectURL(currentObjectUrl);currentObjectUrl=null}
    try{window.speechSynthesis?.cancel?.()}catch{}
  }

  function speakLocalMicrosoft(text,{word=false}={}){
    const value=String(text||'').trim();
    const voice=microsoftVoice();
    if(!value||!voice||!('speechSynthesis' in window))return false;
    stopCurrent();
    const utter=new SpeechSynthesisUtterance(value);
    utter.lang=voice.lang||'en-US';
    utter.voice=voice;
    utter.rate=word?.74:.9;
    utter.pitch=1;
    window.speechSynthesis.speak(utter);
    return true;
  }

  async function detectAzure(){
    try{
      const r=await fetch('/api/tts?mode=status',{cache:'no-store'});
      if(!r.ok)return false;
      const data=await r.json();
      azureAvailable=Boolean(data?.configured);
      return azureAvailable;
    }catch{return false}
  }

  async function fetchAzureAudio(text,{word=false}={}){
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
    if(!value)return false;

    if(azureAvailable){
      stopCurrent();
      const token=requestToken;
      const oldText=button?.textContent;
      if(button){button.disabled=true;button.textContent='…'}
      try{
        const result=await fetchAzureAudio(value,{word});
        if(token!==requestToken){if(!result.cached)URL.revokeObjectURL(result.url);return true}
        const audio=new Audio(result.url);
        currentAudio=audio;
        if(!result.cached)currentObjectUrl=result.url;
        audio.addEventListener('ended',()=>{
          if(currentAudio===audio)currentAudio=null;
          if(!result.cached&&currentObjectUrl===result.url){URL.revokeObjectURL(result.url);currentObjectUrl=null}
        },{once:true});
        await audio.play();
        return true;
      }catch(error){
        console.warn('Azure TTS fallback',error);
        azureAvailable=false;
      }finally{
        if(button){button.disabled=false;button.textContent=oldText||'🔊'}
      }
    }

    return speakLocalMicrosoft(value,{word});
  }

  function wordFromButton(button){
    const card=button.closest('.english-word-card');
    const cardWord=card?.querySelector('.english-word-name')?.textContent?.trim();
    if(cardWord)return cardWord;
    const review=button.closest('#englishReviewBox');
    return review?.querySelector('.english-review-word')?.textContent?.trim()||'';
  }

  function providerReady(){return azureAvailable||Boolean(microsoftVoice())}

  function bindArticleButton(){
    const btn=document.getElementById('articleReadBtn');
    if(!btn||btn.dataset.microsoftTtsBound||!providerReady())return;
    btn.dataset.microsoftTtsBound='1';
    btn.textContent='🔊 Microsoft voice';
    btn.title=azureAvailable?'Microsoft Azure English neural voice':'Microsoft English voice';
    btn.onclick=()=>{
      const text=document.getElementById('articleViewPane')?.innerText?.trim();
      if(text)speakMicrosoft(text,{word:false,button:btn});
    };
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest?.('[data-word-sound]');
    if(!button)return;
    const page=document.getElementById('page-english');
    if(!page?.contains(button)||!providerReady())return;
    const word=wordFromButton(button);
    if(!word)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    button.title=azureAvailable?'Microsoft Azure pronunciation':'Microsoft English pronunciation';
    button.setAttribute('aria-label','Microsoft English pronunciation');
    speakMicrosoft(word,{word:true,button});
  },true);

  async function refreshProviders(){
    await detectAzure();
    bindArticleButton();
  }

  const ready=()=>{
    try{window.speechSynthesis?.getVoices?.()}catch{}
    bindArticleButton();
    refreshProviders();
    window.speechSynthesis?.addEventListener?.('voiceschanged',bindArticleButton);
    const observer=new MutationObserver(bindArticleButton);
    observer.observe(document.body,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
  window.seragMicrosoftTTS={speak:speakMicrosoft,stop:stopCurrent,voice:microsoftVoice};
})();
