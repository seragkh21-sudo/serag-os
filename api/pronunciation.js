export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const raw=Array.isArray(req.query?.word)?req.query.word[0]:req.query?.word;
  const word=String(raw||'').trim().slice(0,80);
  if(!word||!/[A-Za-z]/.test(word)||!/^[A-Za-z][A-Za-z '\-]*$/.test(word))return res.status(400).json({error:'Invalid word'});
  try{
    const upstream=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,{headers:{accept:'application/json'}});
    if(!upstream.ok)return res.status(upstream.status===404?404:502).json({error:upstream.status===404?'Word not found':'Dictionary unavailable'});
    const entries=await upstream.json();
    const entry=Array.isArray(entries)?entries[0]:null;
    if(!entry)return res.status(404).json({error:'Word not found'});
    const phonetics=Array.isArray(entry.phonetics)?entry.phonetics:[];
    const withAudio=phonetics.find(p=>p?.audio);
    const withText=phonetics.find(p=>p?.text);
    let audio=withAudio?.audio||'';
    if(audio.startsWith('//'))audio=`https:${audio}`;
    const phonetic=String(entry.phonetic||withText?.text||'').replace(/^\/+|\/+$/g,'').trim();
    const meaning=Array.isArray(entry.meanings)?entry.meanings[0]:null;
    const definition=meaning?.definitions?.[0]?.definition||'';
    res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({word:entry.word||word,phonetic,audio,partOfSpeech:meaning?.partOfSpeech||'',definition});
  }catch(error){
    console.error('pronunciation lookup failed',error);
    return res.status(502).json({error:'Dictionary unavailable'});
  }
}
