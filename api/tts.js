const VOICE='en-US-JennyNeural';
const MAX_WORD_CHARS=120;
const MAX_ARTICLE_CHARS=5000;
const SUPABASE_URL='https://kdfbxcdxdhofqidczbot.supabase.co';
const SUPABASE_KEY='sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';

function readBody(req){
  if(!req?.body)return {};
  if(typeof req.body==='object')return req.body;
  try{return JSON.parse(req.body)}catch{return {}}
}

function cleanText(value,max){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,max);
}

function escapeXml(value){
  return String(value||'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'
  }[c]));
}

async function verify(req){
  const header=req.headers.authorization||'';
  if(!header.startsWith('Bearer '))return null;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:header}});
  return r.ok?r.json():null;
}

export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});

  const key=process.env.AZURE_SPEECH_KEY||'';
  const region=process.env.AZURE_SPEECH_REGION||'';
  const rawMode=req.method==='GET'?req.query?.mode:readBody(req).mode;

  if(rawMode==='status'){
    res.setHeader('Cache-Control','private, max-age=60');
    return res.status(200).json({configured:Boolean(key&&region),provider:'Microsoft Azure Speech',voice:VOICE});
  }

  const user=await verify(req);
  if(!user)return res.status(401).json({error:'Session expired. Sign in again.'});

  if(!key||!region)return res.status(503).json({error:'Azure Speech is not configured'});

  const body=req.method==='POST'?readBody(req):{};
  const mode=rawMode==='article'?'article':'word';
  const rawText=req.method==='GET'?req.query?.text:body.text;
  const text=cleanText(Array.isArray(rawText)?rawText[0]:rawText,mode==='word'?MAX_WORD_CHARS:MAX_ARTICLE_CHARS);
  if(!text)return res.status(400).json({error:'Text is required'});
  if(mode==='word'&&!/[A-Za-z]/.test(text))return res.status(400).json({error:'English text is required'});

  const rate=mode==='word'?'-12%':'-3%';
  const ssml=`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${VOICE}"><prosody rate="${rate}">${escapeXml(text)}</prosody></voice></speak>`;

  try{
    const upstream=await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{
      method:'POST',
      headers:{
        'Ocp-Apim-Subscription-Key':key,
        'Content-Type':'application/ssml+xml',
        'X-Microsoft-OutputFormat':'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent':'Serag-OS'
      },
      body:ssml,
      signal:AbortSignal.timeout(20000)
    });
    if(!upstream.ok){
      const detail=(await upstream.text()).slice(0,300);
      console.error('Azure Speech failed',upstream.status,detail);
      return res.status(502).json({error:'Microsoft TTS unavailable'});
    }
    const bytes=Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type','audio/mpeg');
    res.setHeader('Content-Length',String(bytes.length));
    res.setHeader('X-Serag-TTS-Voice',VOICE);
    res.setHeader('Cache-Control','private, no-store');
    return res.status(200).send(bytes);
  }catch(error){
    console.error('Azure Speech request failed',error);
    return res.status(502).json({error:'Microsoft TTS unavailable'});
  }
}
