/* Ready public speech, opt-in remote voices, and source-attributed English resources. */
(()=>{
 'use strict';
 const base=window.SERAG_NATURAL_AUDIO,naturalSpeak=base?.speak?.bind(base);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
 let catalogPromise,providerPromise,providers=[],sequence=0,audio=null,blobUrl=null,controller=null,lookupController=null,lookupSequence=0;
 const remoteCache=new Map();let remoteBytes=0;
 const preference=()=>{try{return localStorage.getItem('seragEnglishVoiceProvider')||(localStorage.getItem('seragVoiceMode')==='natural'?'natural':'ready')}catch{return 'ready'}};
 const accent=()=>{try{return localStorage.getItem('seragVoiceAccent')==='uk'?'uk':'us'}catch{return 'us'}};
 const normal=s=>String(s||'').replace(/\s+/g,' ').trim();
 function setPreference(value){try{localStorage.setItem('seragEnglishVoiceProvider',value)}catch{}base?.setMode?.(value==='natural'?'natural':'device')}
 function status(text){const old=document.getElementById('enaBar');if(old)old.hidden=true;let node=document.getElementById('efsAudioStatus');if(!node){const host=document.createElement('aside');host.className='efs-audio-status';host.id='efsAudioBar';host.innerHTML='<span id="efsAudioStatus" role="status"></span><button type="button" data-efs-stop>Stop</button><button type="button" data-efs-settings>Voices</button>';document.body.append(host);node=document.getElementById('efsAudioStatus')}node.textContent=text;document.getElementById('efsAudioBar').hidden=false}
 function stop(){sequence++;controller?.abort();controller=null;audio?.pause();audio=null;if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=null;base?.stop();const bar=document.getElementById('efsAudioBar');if(bar)bar.hidden=true}
 async function catalog(){if(!catalogPromise)catalogPromise=fetch('/assets/english-audio/catalog.json',{cache:'force-cache',signal:AbortSignal.timeout(5000)}).then(r=>r.ok?r.json():{clips:{}}).catch(()=>{catalogPromise=null;return {clips:{}}});return catalogPromise}
 async function readyClip(text){const data=await catalog(),path=data.clips?.[accent()+'|'+normal(text)];return typeof path==='string'&&/^\/assets\/english-audio\/[a-f0-9]{24}\.mp3$/.test(path)?path:null}
 async function loadProviders(){if(!providerPromise)providerPromise=fetch('/api/english-speech?mode=status',{signal:AbortSignal.timeout(6000)}).then(r=>r.ok?r.json():{}).then(d=>providers=Array.isArray(d.providers)?d.providers:[]).catch(()=>{providerPromise=null;return []});return providerPromise}
 async function play(source,token){if(token!==sequence)return false;audio=new Audio(source);audio.onended=()=>{if(token===sequence){status('Finished.');if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=null;audio=null}};await audio.play();return token===sequence}
 async function device(text,options){base?.setMode?.('device');status('Playing device voice.');const result=await naturalSpeak?.(text,{...options,internal:true})||false;const old=document.getElementById('enaBar');if(old)old.hidden=true;return result}
 async function speak(text,options={}){
  const value=normal(text);if(!value)return false;stop();const token=sequence,mode=preference();
  if(mode==='device')return device(value,options);
  if(mode==='ready'||mode==='natural'){
   try{const path=await readyClip(value);if(token!==sequence)return false;if(path){status('Playing ready voice.');return await play(path,token)}}catch{}
   if(token!==sequence)return false;
   if(mode==='natural'){const bar=document.getElementById('efsAudioBar');if(bar)bar.hidden=true;base?.setMode?.('natural');return naturalSpeak?.(value,{...options,internal:true})||false}
   return device(value,options);
  }
  if(value.length>2000){status('Choose a shorter passage for this online voice, or use device voice.');return false}
  try{
   status('Preparing online voice…');let blob=remoteCache.get(mode+'|'+accent()+'|'+value);
   if(!blob){
    const owner=window.user?.id;if(!owner||!window.sb)return device(value,options);
    const {data}=await window.sb.auth.getSession();if(token!==sequence||window.user?.id!==owner)return false;
    const bearer=data?.session?.access_token;if(!bearer)throw Error('Sign in to use online voices.');
    controller=new AbortController();const timer=setTimeout(()=>controller?.abort(),15000);
    try{
     const response=await fetch('/api/english-speech',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+bearer},body:JSON.stringify({provider:mode,text:value,accent:accent()}),signal:controller.signal});
     if(!response.ok)throw Error('Online voice is unavailable.');blob=await response.blob();
    }finally{clearTimeout(timer)}
    if(token!==sequence||window.user?.id!==owner)return false;
    if(blob.size<=2*1024*1024){remoteCache.set(mode+'|'+accent()+'|'+value,blob);remoteBytes+=blob.size;while(remoteCache.size>16||remoteBytes>8*1024*1024){const key=remoteCache.keys().next().value;remoteBytes-=remoteCache.get(key).size;remoteCache.delete(key)}}
   }
   if(token!==sequence)return false;blobUrl=URL.createObjectURL(blob);status('Playing online voice.');return await play(blobUrl,token);
  }catch{if(token!==sequence)return false;status('Online voice unavailable; using device voice.');return device(value,options)}
 }
 async function settings(){
  stop();let dialog=document.getElementById('efsVoices');if(!dialog){dialog=document.createElement('dialog');dialog.id='efsVoices';dialog.className='efs-dialog';document.body.append(dialog)}
  dialog.innerHTML='<h2>English voices</h2><p>Ready audio plays published lesson recordings. Device voice handles other text without downloading a model.</p><label>Voice<select id="efsVoiceChoice"><option value="ready">Ready lesson audio + device fallback</option><option value="device">Fast device voice</option><option value="natural">Natural voice on this device</option></select></label><p>Natural voice downloads an approximately 90 MB model on first use. Online voices send the selected text to the chosen provider.</p><p id="efsProviderStatus" role="status">Checking online voices…</p><button type="button" data-efs-save>Save</button><button type="button" data-efs-close>Close</button>';
  const select=document.getElementById('efsVoiceChoice');select.value=preference();dialog.showModal();
  const remote=await loadProviders();if(!dialog.open)return;
  for(const p of remote){const option=document.createElement('option');option.value=p.id;option.disabled=!p.configured;option.textContent=p.name+(p.configured?'':' — needs account setup');select.append(option)}
  select.value=preference();if(!select.value)select.value='ready';document.getElementById('efsProviderStatus').textContent=remote.some(p=>p.configured)?'Configured online voices are available.':'Ready audio and device voices are available. Online voices need account setup.';
 }
 function resourcesHTML(){return '<details class="efs-resources"><summary>Explore more examples & related words</summary><p>Search public sources. Examples and related words support study; they are not automatically added as graded questions.</p><form data-efs-search><label>Word or expression<input name="word" maxlength="80" required pattern="[A-Za-z][A-Za-z\x27’ -]*" placeholder="appointment"></label><label>Source<select name="kind"><option value="sentences">English–Arabic examples · Tatoeba</option><option value="related">Related words · Datamuse</option></select></label><button type="submit">Search</button><button type="button" data-efs-settings>English voices</button></form><div id="efsResourceResult" aria-live="polite"></div><p><a href="https://kaikki.org/dictionary/English/" target="_blank" rel="noopener">Wiktionary / Kaikki dictionary data</a> · <a href="https://freedictionaryapi.com/" target="_blank" rel="noopener">Dictionary source and licensing</a></p></details>'}
 async function search(form){
  const target=document.getElementById('efsResourceResult');if(!target)return;const values=new FormData(form),word=String(values.get('word')||'').trim(),kind=String(values.get('kind')||'');
  const token=++lookupSequence;lookupController?.abort();lookupController=new AbortController();target.textContent='Searching…';
  try{
   const response=await fetch('/api/english-resources?'+new URLSearchParams({word,kind}),{signal:lookupController.signal});if(!response.ok)throw Error('Unavailable');const data=await response.json();if(token!==lookupSequence||!target.isConnected)return;
   const source=data.source||{},url=safe(source.url);
   target.innerHTML='<p>'+esc(source.note||'')+'</p>'+(data.rows||[]).map(row=>kind==='related'?'<button type="button" class="efs-word" data-efs-lookup="'+esc(row.word)+'">'+esc(row.word)+'</button>':'<article class="efs-example"><p lang="en">'+esc(row.text)+'</p><button type="button" data-speak-text="'+esc(row.text)+'">Listen</button>'+(row.translations||[]).map(t=>'<p lang="ar" dir="rtl">'+esc(t.text)+'</p><small>'+esc(t.owner)+' · '+esc(t.license)+'</small>').join('')+'<p><small>'+esc(row.owner)+' · '+esc(row.license)+'</small> <a href="'+esc(safe(row.url))+'" target="_blank" rel="noopener">Original sentence</a></p></article>').join('')+(!(data.rows||[]).length?'<p>No examples found. Your local sentence library is still available below.</p>':'')+'<p>'+esc(source.name)+' '+(url?'<a target="_blank" rel="noopener" href="'+esc(url)+'">Source & terms</a>':'')+'</p>';
  }catch(error){if(token===lookupSequence&&error.name!=='AbortError')target.textContent='This source is unavailable. You can continue using the local library.'}
 }
 document.addEventListener('submit',e=>{if(e.target.matches('[data-efs-search]')){e.preventDefault();void search(e.target)}});
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-efs-stop],[data-efs-settings],[data-efs-close],[data-efs-save],[data-efs-lookup]');if(!b)return;
  if(b.hasAttribute('data-efs-stop')){stop();status('Stopped.')}if(b.hasAttribute('data-efs-settings'))void settings();if(b.hasAttribute('data-efs-close'))document.getElementById('efsVoices')?.close();if(b.hasAttribute('data-efs-save')){setPreference(document.getElementById('efsVoiceChoice').value);stop();document.getElementById('efsVoices').close()}if(b.dataset.efsLookup)void window.SERAG_DICTIONARY_V1?.open(b.dataset.efsLookup);
 });
 function clear(){stop();remoteCache.clear();remoteBytes=0;lookupController?.abort();lookupSequence++;document.getElementById('efsVoices')?.close();const result=document.getElementById('efsResourceResult');if(result)result.textContent='';}
 if(window.sb?.auth?.onAuthStateChange)window.sb.auth.onAuthStateChange((event)=>{if(['SIGNED_OUT','SIGNED_IN'].includes(event))clear()});
 document.addEventListener('click',e=>{if(e.target.closest?.('[data-page],[data-so-page],[data-v5-page],[data-ea-tab],[data-ea-end]')){stop();lookupController?.abort();lookupSequence++}},true);
 window.addEventListener('pagehide',clear);
 window.SERAG_FREE_ENGLISH_AUDIO={speak,stop,settings,setPreference,readyClip};
 window.SERAG_OPEN_RESOURCES={html:resourcesHTML};
 if(base)base.speak=speak;
 window.seragMicrosoftTTS={...window.seragMicrosoftTTS,speak,stop};
 void catalog();
})();
