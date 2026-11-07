import azure from './tts.js';
import {allowUsage} from '../lib/usage-limit.js';
const URL='https://kdfbxcdxdhofqidczbot.supabase.co',KEY='sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';
export function providers(env=process.env){
 return [
  {id:'azure',name:'Azure Neural',configured:!!(env.AZURE_SPEECH_KEY&&env.AZURE_SPEECH_REGION&&env.AZURE_SPEECH_FREE_TIER==='F0'),needs:'Azure Speech F0 resource and server key'},
  {id:'voicerss',name:'VoiceRSS',configured:!!(env.VOICERSS_API_KEY&&env.VOICERSS_FREE_PLAN==='true'),needs:'VoiceRSS free account and server key'},
  {id:'google',name:'Google Cloud',configured:!!(env.GOOGLE_TTS_API_KEY&&env.GOOGLE_TTS_FREE_QUOTA_CONFIRMED==='true'),needs:'Google key with billing and enforced free-usage quotas'},
  {id:'kokoro',name:'Kokoro server',configured:!!(env.KOKORO_TTS_URL&&env.KOKORO_TTS_ENABLED==='true'),needs:'Your own Kokoro server'},
  {id:'piper',name:'Piper server',configured:!!(env.PIPER_TTS_URL&&env.PIPER_TTS_ENABLED==='true'),needs:'Your own Piper server and licensed voice'}
 ];
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'})}
 if(req.method==='GET'&&req.query?.mode==='status')return res.status(200).json({providers:providers()});
 if(req.method!=='POST')return res.status(405).json({error:'Use POST for speech.'});
 const body=typeof req.body==='object'&&req.body?req.body:{};
 const provider=providers().find(p=>p.id===body.provider);
 // Never try a paid-capable provider merely because a key happens to exist.
 if(!provider?.configured)return res.status(503).json({error:'This voice provider needs account setup. Ready audio and device voice are available.'});
 const text=typeof body.text==='string'?body.text.replace(/\s+/g,' ').trim():'';
 if(!text||text.length>2000||!/[A-Za-z]/.test(text))return res.status(400).json({error:'Use 1–2,000 characters of English text.'});
 if(provider.id==='azure'){req.body={text,mode:'article',accent:body.accent==='uk'?'uk':'us'};return azure(req,res)}
 const bearer=req.headers.authorization;
 if(typeof bearer!=='string'||!/^Bearer \S+$/.test(bearer))return res.status(401).json({error:'Sign in first.'});
 try{
  const identity=await fetch(URL+'/auth/v1/user',{headers:{apikey:KEY,Authorization:bearer},signal:AbortSignal.timeout(8000)});
  if(!identity.ok)return res.status(401).json({error:'Session expired.'});
  if(!await allowUsage(req,res,'tts',text.length))return;
  const british=body.accent==='uk';let upstream,type='audio/mpeg';
  if(provider.id==='voicerss'){
   upstream=await fetch('https://api.voicerss.org/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({key:process.env.VOICERSS_API_KEY,src:text,hl:british?'en-gb':'en-us',c:'MP3',f:'24khz_16bit_mono'}),signal:AbortSignal.timeout(12000)});
  }else if(provider.id==='google'){
   upstream=await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key='+encodeURIComponent(process.env.GOOGLE_TTS_API_KEY),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:{text},voice:{languageCode:british?'en-GB':'en-US',name:british?'en-GB-Standard-A':'en-US-Standard-C'},audioConfig:{audioEncoding:'MP3'}}),signal:AbortSignal.timeout(12000)});
  }else{
   const local=provider.id==='piper',base=new globalThis.URL(local?process.env.PIPER_TTS_URL:process.env.KOKORO_TTS_URL);
   if(base.protocol!=='https:')return res.status(503).json({error:'The voice server needs an HTTPS endpoint.'});
   const token=local?process.env.PIPER_TTS_API_KEY:process.env.KOKORO_TTS_API_KEY;
   upstream=await fetch(base.href,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(local?{text}:{model:'kokoro',input:text,voice:british?'bf_emma':'af_heart',response_format:'mp3'}),signal:AbortSignal.timeout(12000)});type=local?'audio/wav':'audio/mpeg';
  }
  if(!upstream.ok)return res.status(502).json({error:'Voice provider unavailable. Try ready audio or device voice.'});
  let bytes;
  if(provider.id==='google'){const data=await upstream.json();if(!data.audioContent)throw Error('Missing audio');bytes=Buffer.from(data.audioContent,'base64')}
  else{if(!/^audio\//i.test(upstream.headers.get('content-type')||''))throw Error('Not audio');bytes=Buffer.from(await upstream.arrayBuffer())}
  if(!bytes.length||bytes.length>8*1024*1024)throw Error('Invalid audio size');
  res.setHeader('Content-Type',type);res.setHeader('X-Serag-Speech-Provider',provider.id);return res.status(200).send(bytes);
 }catch{return res.status(502).json({error:'Voice provider unavailable. Try ready audio or device voice.'})}
}
