(()=>{
  'use strict';
  const legacy=window.seragMicrosoftTTS;
  let worker,sequence=0,job=0,currentAudio,objectUrl,finishPlayback,pendingText='',pendingOptions={},mode='',accent='us';
  const jobs=new Map();
  try{mode=localStorage.getItem('seragVoiceMode')||'';accent=localStorage.getItem('seragVoiceAccent')||'us'}catch{}
  function status(message){const el=document.getElementById('enaStatus');if(el)el.textContent=message}
  function stop(){sequence++;worker?.postMessage({cancel:job+1});for(const p of jobs.values()){clearTimeout(p.timer);p.reject(new Error('Stopped.'))}jobs.clear();legacy?.stop();currentAudio?.pause();currentAudio=null;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;finishPlayback?.();finishPlayback=null;status('Stopped.');}
  function chunks(text){const words=String(text).replace(/\s+/g,' ').trim().split(' '),out=[];let part='';for(const word of words){if(part.length+word.length>220&&part){out.push(part);part=''}part+=(part?' ':'')+word;if(/[.!?]$/.test(word)&&part.length>70){out.push(part);part=''}}if(part)out.push(part);return out}
  function ensureWorker(){
    if(worker)return worker;
    worker=new Worker('/assets/natural-voice/worker.js',{type:'module'});
    worker.onmessage=({data})=>{const p=jobs.get(data.id);if(!p)return;if(data.type==='progress'){if(p.token===sequence)status(data.status==='progress'?`Downloading voice: ${Math.round(data.progress||0)}%`:'Preparing natural voice…');return}clearTimeout(p.timer);jobs.delete(data.id);data.type==='audio'?p.resolve(data.blob):p.reject(new Error(data.message));};
    worker.onerror=()=>{for(const p of jobs.values()){clearTimeout(p.timer);p.reject(new Error('Natural voice could not start.'))}jobs.clear();worker?.terminate();worker=null;};return worker;
  }
  function generate(text,token){return new Promise((resolve,reject)=>{const id=++job;const w=ensureWorker();const timer=setTimeout(()=>{jobs.delete(id);reject(new Error('Voice preparation took too long. Try again or use device voice.'));w.terminate();worker=null;for(const p of jobs.values()){clearTimeout(p.timer);p.reject(new Error('Voice preparation stopped.'))}jobs.clear()},180000);jobs.set(id,{resolve,reject,timer,token});w.postMessage({id,text,voice:accent})})}
  async function play(blob,token){if(token!==sequence)return;objectUrl=URL.createObjectURL(blob);currentAudio=new Audio(objectUrl);const audio=currentAudio;await new Promise((resolve,reject)=>{finishPlayback=resolve;audio.onended=resolve;audio.onerror=()=>reject(new Error('Audio playback failed.'));audio.play().catch(()=>reject(new Error('Tap Listen again to allow audio playback.')))});if(currentAudio===audio){currentAudio=null;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;finishPlayback=null}}
  async function speak(text,options={}){
    const value=String(text||'').trim();if(!value)return false;
    ensureUI();stop();const token=sequence;pendingText=value;pendingOptions=options;
    if(!mode){document.getElementById('enaDialog').showModal();status('Choose your English voice.');return false}
    document.getElementById('enaBar').hidden=false;
    if(mode==='device'){status('Playing device voice.');window.SERAG_NATURAL_AUDIO.deviceOnly=true;try{return await legacy?.speak(value,options)||false}finally{window.SERAG_NATURAL_AUDIO.deviceOnly=false}}
    if(value.length>20000){status('Select a shorter passage (up to 20,000 characters).');return false}
    status('Preparing natural voice…');document.getElementById('enaBar').hidden=false;
    try{const parts=chunks(value);for(let i=0;i<parts.length;i++){if(token!==sequence)return false;const blob=await generate(parts[i],token);if(token!==sequence)return false;status(`Natural voice · ${i+1}/${parts.length}`);await play(blob,token)}if(token===sequence)status('Finished.');return true}catch(e){if(token===sequence)status(e.message+' Choose Voice settings for the device fallback.');return false}
  }
  function ensureUI(){if(document.getElementById('enaDialog'))return;const host=document.createElement('div');host.id='enaRoot';host.innerHTML=`<dialog id="enaDialog" aria-labelledby="enaTitle"><h2 id="enaTitle">Your English voice</h2><p>Natural voice uses Kokoro on this device. The first use downloads a voice model (around 90 MB, plus runtime files). Preparation can take a few minutes. Wi-Fi is recommended.</p><p>Your text stays on this device in natural mode. Model files download from Hugging Face and can be cached by your browser. No paid API is used.</p><label>Accent <select id="enaAccent"><option value="us">American English · Heart</option><option value="uk">British English · Emma</option></select></label><div class="ena-actions"><button id="enaNatural">Use natural voice</button><button id="enaDevice">Use device voice</button><button id="enaClose">Close</button></div></dialog><aside id="enaBar" hidden aria-label="English audio"><span id="enaStatus" role="status" aria-live="polite"></span><button id="enaStop" aria-label="Stop English audio">Stop</button><button id="enaSettings">Voice settings</button><button id="enaHide" aria-label="Hide audio controls">×</button></aside>`;document.body.append(host);const dialog=document.getElementById('enaDialog');document.getElementById('enaAccent').value=accent;const select=value=>{mode=value;accent=document.getElementById('enaAccent').value;try{localStorage.setItem('seragVoiceMode',mode);localStorage.setItem('seragVoiceAccent',accent)}catch{}dialog.close();if(pendingText)void speak(pendingText,pendingOptions)};document.getElementById('enaNatural').onclick=()=>select('natural');document.getElementById('enaDevice').onclick=()=>select('device');document.getElementById('enaClose').onclick=()=>dialog.close();document.getElementById('enaStop').onclick=stop;document.getElementById('enaSettings').onclick=()=>{pendingText='';dialog.showModal()};document.getElementById('enaHide').onclick=()=>{stop();document.getElementById('enaBar').hidden=true};}
  function settings(){ensureUI();pendingText='';stop();document.getElementById('enaDialog').showModal()}
  // Capture the shared pronunciation controls before older handlers run.
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-speak-text],[data-word-sound],#articleReadBtn,[data-ena-settings]');if(!b)return;if(b.hasAttribute('data-ena-settings')){settings();return}let text=b.getAttribute('data-speak-text');if(b.hasAttribute('data-word-sound'))text=b.closest('.english-word-card')?.querySelector('.english-word-name')?.textContent||b.closest('#englishReviewBox')?.querySelector('.english-review-word')?.textContent;if(b.id==='articleReadBtn')text=document.getElementById('articleViewPane')?.innerText;if(!text)return;e.preventDefault();e.stopImmediatePropagation();void speak(text,{word:!text.trim().includes(' ')});},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page],[data-v5-page],[data-ea-tab],[data-ea-end],#enaStop'))stop()},true);
  window.addEventListener('pagehide',()=>{stop();worker?.terminate()});
  window.SERAG_NATURAL_AUDIO={speak,stop,settings,chunks};
  window.seragMicrosoftTTS={...legacy,speak,stop};
})();
