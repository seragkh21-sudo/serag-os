import { generateSpeech } from '@bestcodes/edge-tts';

const VOICE='en-US-EmmaMultilingualNeural';
const MAX_WORD_CHARS=120;
const MAX_ARTICLE_CHARS=5000;

function readBody(req){
  if(!req?.body)return {};
  if(typeof req.body==='object')return req.body;
  try{return JSON.parse(req.body)}catch{return {}}
}

function cleanText(value,max){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,max);
}

async function toBuffer(audio){
  if(Buffer.isBuffer(audio))return audio;
  if(audio instanceof Uint8Array)return Buffer.from(audio);
  if(audio?.arrayBuffer)return Buffer.from(await audio.arrayBuffer());
  return Buffer.from(audio||[]);
}

export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});

  const body=req.method==='POST'?readBody(req):{};
  const rawMode=req.method==='GET'?req.query?.mode:body.mode;
  const mode=rawMode==='article'?'article':'word';
  const rawText=req.method==='GET'?req.query?.text:body.text;
  const text=cleanText(Array.isArray(rawText)?rawText[0]:rawText,mode==='word'?MAX_WORD_CHARS:MAX_ARTICLE_CHARS);

  if(!text)return res.status(400).json({error:'Text is required'});
  if(mode==='word'&&!/[A-Za-z]/.test(text))return res.status(400).json({error:'English text is required'});

  try{
    const audio=await generateSpeech({
      text,
      voice:VOICE,
      rate:mode==='word'?'-14%':'-4%',
      volume:'+0%',
      pitch:'+0Hz'
    });
    const bytes=await toBuffer(audio);
    if(!bytes.length)throw new Error('No audio returned');

    res.setHeader('Content-Type','audio/mpeg');
    res.setHeader('Content-Length',String(bytes.length));
    res.setHeader('X-Serag-TTS-Voice',VOICE);
    if(req.method==='GET')res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    else res.setHeader('Cache-Control','private, no-store');
    return res.status(200).send(bytes);
  }catch(error){
    console.error('Microsoft Edge TTS failed',error);
    return res.status(502).json({error:'Microsoft TTS unavailable'});
  }
}
