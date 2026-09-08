/* Browser speech only: no paid AI/audio endpoints, no automatic microphone access. */
(()=>{
  const normalize=s=>String(s).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[؟?!.,،]/g,' ').replace(/\s+/g,' ').trim();
  function parse(text){
    const s=normalize(text);
    const pages={'الانجليزي':'english','انجليزي':'english','المهام':'tasks','الجيم':'fitness','الرئيسيه':'today','الشغل':'work','الكريتف':'creative'};
    if(s.startsWith('افتح ')&&pages[s.slice(5)])return {kind:'page',page:pages[s.slice(5)],label:text};
    if(/^(شربت|ضيف|اضف|سجل) (كوب|كبايه|كوباية|كوبايه) (مياه|ميه|ماء)$/.test(s))return {kind:'water',amount:250,label:'تسجيل 250 مل مياه'};
    const water=s.match(/^(?:شربت|ضيف|اضف|سجل) (\d+) (?:مل|ملي|مليلتر) (?:مياه|ميه|ماء)$/);
    if(water){const amount=Number(water[1]);return amount>=50&&amount<=2000?{kind:'water',amount,label:`تسجيل ${amount} مل مياه`}:{kind:'unknown',label:'اكتب كمية بين 50 و2000 مل.'};}
    if(/^(شربت كام|كام شربت)( مياه| ميه| ماء)?( النهارده)?$/.test(s))return {kind:'waterTotal',label:'مياه النهارده'};
    // Keep the original task title; dates remain explicit in the task editor.
    const task=String(text).trim().match(/^(?:ضيف|أضف|اضف|سجل)\s+مهم[ةه]\s+(.+)$/);
    if(task&&task[1].trim().length<=200)return {kind:'task',title:task[1].trim(),label:`إضافة مهمة: ${task[1].trim()} — بدون موعد`};
    return {kind:'unknown',label:'جرّب: شربت كوب مياه، ضيف 250 مل مياه، ضيف مهمة أراجع الإنجليزي، أو افتح الإنجليزي.'};
  }
  window.SeragVoiceCommands={parse};
  if(typeof document==='undefined')return;
  const header=document.querySelector('#page-today .top');
  if(!header||document.getElementById('voiceCommands'))return;
  const style=document.createElement('style');
  style.textContent='#voiceCommands{width:min(480px,calc(100vw - 32px));box-sizing:border-box;border:1px solid #dce2e9;border-radius:20px;padding:24px;background:#fff;color:#17212e;max-height:85dvh;overflow:auto;font:inherit}#voiceCommands::backdrop{background:rgba(12,23,38,.45)}#voiceCommands h3{margin:0}#voiceCommands p{line-height:1.7}#voiceCommands .voice-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}#voiceCommands textarea{width:100%;box-sizing:border-box;font:inherit;font-size:16px;min-height:90px;padding:12px;border:1px solid #b8c2d0;border-radius:10px}#voiceCommands button{font:inherit;font-size:14px;min-height:44px}#voiceCommands label{font-size:14px}#voiceCommands [hidden]{display:none!important}#voiceResult{background:#f1f5fa;padding:12px;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere}#voiceLaunch{white-space:nowrap}';
  document.head.append(style);
  const launch=document.createElement('button');launch.id='voiceLaunch';launch.type='button';launch.className='btn';launch.textContent='مساعد صوتي';header.append(launch);
  const panel=document.createElement('dialog');panel.id='voiceCommands';panel.dir='rtl';panel.setAttribute('aria-labelledby','voiceTitle');
  panel.innerHTML=`<div class="voice-row"><h3 id="voiceTitle">مساعد صوتي</h3><button id="voiceClose" class="btn" type="button" style="margin-inline-start:auto">إغلاق</button></div><p>اتكلم أو اكتب أمر بسيط. راجع الطلب قبل الحفظ.</p><div class="voice-row"><button id="voiceMic" class="btn primary" type="button">ابدأ الكلام</button><label><input id="voiceSpeak" type="checkbox" checked> رد بصوت</label></div><label for="voiceText">طلبك</label><textarea id="voiceText" maxlength="240" placeholder="شربت كوب مياه"></textarea><div class="voice-row"><button id="voiceReview" class="btn" type="button">راجع الطلب</button><button id="voiceConfirm" class="btn primary" type="button" hidden>تأكيد الحفظ</button></div><p id="voiceResult" role="status" aria-live="polite">جرّب: شربت كوب مياه، ضيف مهمة أراجع الإنجليزي، افتح الإنجليزي.</p><p class="muted">صوت المتصفح بدون اشتراك. قد يحتاج إنترنت؛ دعم العربي يختلف حسب الجهاز. المهمة تُضاف بدون موعد ويمكن تعديله من المهام.</p>`;
  document.getElementById('appView').append(panel);
  const q=id=>document.getElementById(id);
  let pending=null,busy=false,recognition=null,listening=false,timer=null;
  function say(message,speak=false){q('voiceResult').textContent=message;if(speak&&q('voiceSpeak').checked&&window.speechSynthesis){window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(message);utterance.lang='ar-EG';const voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('ar'));if(voice)utterance.voice=voice;window.speechSynthesis.speak(utterance);}}
  function stop(){clearTimeout(timer);if(recognition){const previous=recognition;recognition=null;previous.abort();}listening=false;q('voiceMic').textContent='ابدأ الكلام';}
  function reset(){pending=null;q('voiceConfirm').hidden=true;}
  function close(){stop();window.speechSynthesis?.cancel();reset();panel.close();}
  launch.onclick=()=>{if(!user)return toast('سجّل دخولك الأول');panel.showModal();q('voiceText').focus();};
  q('voiceClose').onclick=close;panel.addEventListener('cancel',()=>{stop();reset();window.speechSynthesis?.cancel();});
  q('voiceText').oninput=()=>{reset();};
  q('voiceSpeak').onchange=()=>{if(!q('voiceSpeak').checked)window.speechSynthesis?.cancel();};
  async function review(){
    if(busy)return;stop();reset();if(!user)return say('سجّل دخولك الأول.');
    const command=parse(q('voiceText').value);
    if(command.kind==='unknown')return say(command.label);
    if(command.kind==='page'){showPage(command.page);close();return;}
    if(command.kind==='waterTotal'){
      busy=true;q('voiceReview').disabled=true;
      const owner=user.id;
      try{const {data,error}=await sb.from('water_logs').select('amount_ml').eq('user_id',owner).gte('logged_at',localDayStart()).lte('logged_at',new Date().toISOString());if(error)throw error;if(user?.id!==owner)return;const total=(data||[]).reduce((a,x)=>a+Number(x.amount_ml||0),0);say(`شربت ${total} مل مياه النهارده.`,true);}catch{say('مقدرتش أجيب المياه. راجع اتصال الإنترنت.');}finally{busy=false;q('voiceReview').disabled=false;}return;
    }
    pending={...command,id:crypto.randomUUID(),owner:user.id};say(command.label);q('voiceConfirm').hidden=false;
  }
  q('voiceReview').onclick=review;
  q('voiceConfirm').onclick=async()=>{
    if(busy||!pending)return;const command=pending;
    if(user?.id!==command.owner){reset();return say('الجلسة اتغيرت. سجّل دخولك وراجع الطلب من جديد.');}
    stop();busy=true;q('voiceConfirm').disabled=true;q('voiceReview').disabled=true;q('voiceText').disabled=true;q('voiceMic').disabled=true;say('جاري الحفظ…');
    try{
      const table=command.kind==='water'?'water_logs':'tasks';
      const row=command.kind==='water'?{id:command.id,user_id:command.owner,amount_ml:command.amount}:{id:command.id,user_id:command.owner,title:command.title,category:'general',priority:'normal',due_at:null};
      const {error}=await sb.from(table).insert(row);if(error)throw error;
      reset();q('voiceText').value='';if(user?.id!==command.owner)return;
      say(command.kind==='water'?`اتسجل ${command.amount} مل مياه.`:'المهمة اتضافت بدون موعد. تقدر تعدلها من المهام.',true);
      Promise.resolve(refreshAll()).catch(()=>{});
    }catch(error){reset();say('لم يتأكد الحفظ. راجع قائمة المياه أو المهام قبل المحاولة تاني عشان الطلب ما يتكررش.');}
    finally{busy=false;q('voiceConfirm').disabled=false;q('voiceReview').disabled=false;q('voiceText').disabled=false;q('voiceMic').disabled=false;}
  };
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Speech){q('voiceMic').disabled=true;q('voiceMic').textContent='الصوت غير مدعوم؛ اكتب طلبك';}
  else q('voiceMic').onclick=()=>{
    if(busy)return;if(listening){stop();return;}reset();window.speechSynthesis?.cancel();
    const current=new Speech();recognition=current;current.lang='ar-EG';current.continuous=false;current.interimResults=false;let received=false;
    current.onresult=e=>{if(recognition!==current)return;received=true;q('voiceText').value=e.results[0][0].transcript;stop();review();};
    current.onerror=e=>{if(recognition!==current)return;stop();say(e.error==='not-allowed'?'اسمح للميكروفون من إعدادات المتصفح، أو اكتب الأمر.':'مسمعتش الكلام بوضوح. جرّب تاني أو اكتب الأمر.');};
    current.onend=()=>{if(recognition!==current)return;stop();if(!received)say('مسمعتش أمر. جرّب تاني أو اكتبه.');};
    try{current.start();listening=true;q('voiceMic').textContent='إيقاف الاستماع';say('سامعك…');timer=setTimeout(()=>{stop();say('الاستماع اتوقف. جرّب تاني أو اكتب الأمر.');},15000);}catch{stop();say('تعذر تشغيل الميكروفون. اكتب الأمر للتجربة.');}
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  sb.auth.onAuthStateChange((_event,session)=>{if(!session){close();q('voiceText').value='';say('سجّل دخولك لتجربة الأوامر.');}});
})();
