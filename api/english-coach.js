import {generateText} from 'ai';

const SUPABASE_URL='https://kdfbxcdxdhofqidczbot.supabase.co';
const SUPABASE_KEY='sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';

async function verify(req){
  const header=req.headers.authorization||'';
  if(!header.startsWith('Bearer '))return null;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:header}});
  return r.ok?r.json():null;
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const user=await verify(req);if(!user)return res.status(401).json({error:'Session expired. Sign in again.'});
  const requestedMode=String(req.body?.mode||'speaking').slice(0,20);
  const mode=['speaking','grammar','video'].includes(requestedMode)?requestedMode:'speaking';
  const prompt=String(req.body?.prompt||'').trim().slice(0,1200);
  const response=String(req.body?.response||'').trim().slice(0,3000);
  if(!prompt)return res.status(400).json({error:'Missing exercise'});
  try{
    const system=mode==='grammar'
      ?`You are a concise English grammar coach for an Arabic-speaking B1 learner. Explain the rule in simple Egyptian Arabic. If learner text is supplied, correct it and briefly say why. Keep English examples in English. Use exactly: الفكرة، مثال طبيعي، التصحيح (write "لا يوجد مثال للتصحيح" when none), غلطة شائعة. Include one everyday example and, when useful, one professional example. Maximum 150 words. No markdown tables.`
      :mode==='video'
        ?`You are an English immersion coach for an Arabic-speaking B1 learner. Explain a real subtitle line in context, especially slang, idioms, contractions, connected speech and grammar. Reply in concise Egyptian Arabic and keep the original or corrected English in English. Use exactly: المعنى الطبيعي، التعبير المهم، ملاحظة النطق، Shadowing. For Shadowing, split the English line into short rhythm groups with slashes. Maximum 150 words. No markdown tables.`
        :`You are a supportive English speaking coach for an Arabic-speaking B1 learner who wants natural everyday and professional English. Evaluate the transcript, not pronunciation audio. Reply mostly in concise Egyptian Arabic and keep corrected English in English. Use exactly these five short sections: الدرجة من 10، تقييم سريع، التصحيح، صياغة طبيعية، خطوة واحدة للتدريب. Correct only the 2-3 most important issues. Never shame the learner. Maximum 180 words. No markdown tables.`;
    const message=mode==='grammar'?`Rule: ${prompt}\nLearner sentence: ${response||'(none — explain only)'}`:mode==='video'?`Task: ${prompt}\nSubtitle line: ${response}`:`Speaking prompt: ${prompt}\nLearner transcript: ${response}`;
    const result=await generateText({model:'openai/gpt-5.6-terra-fast',system,prompt:message,maxOutputTokens:450});
    return res.status(200).json({feedback:result.text.trim()});
  }catch(e){
    console.error(e);return res.status(500).json({error:'AI feedback is temporarily unavailable.'});
  }
}
