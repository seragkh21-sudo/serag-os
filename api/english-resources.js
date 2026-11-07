import {validWord,publicJSON} from '../lib/english-public-data.js';
export default async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'})}
 const word=typeof req.query?.word==='string'?req.query.word.trim():'';
 const kind=req.query?.kind;
 if(!validWord(word)||!['related','sentences'].includes(kind))return res.status(400).json({error:'Enter an English word or short phrase.'});
 try{
  let rows,source;
  if(kind==='related'){
   const params=new URLSearchParams({ml:word,max:'12',md:'pf'});if(process.env.DATAMUSE_API_KEY)params.set('key',process.env.DATAMUSE_API_KEY);
   const data=await publicJSON('https://api.datamuse.com/words?'+params);
   rows=(Array.isArray(data)?data:[]).filter(r=>validWord(r.word)).slice(0,12).map(r=>({word:r.word,tags:(r.tags||[]).filter(t=>typeof t==='string').slice(0,6)}));
   source={name:'Datamuse',url:'https://www.datamuse.com/api/',note:'Related words are suggestions, not interchangeable answers.'};
  }else{
   const params=new URLSearchParams({lang:'eng',q:word,'trans:lang':'ara','trans:is_direct':'yes',is_unapproved:'no',is_orphan:'no',word_count:'4-20',sort:'relevance',limit:'8'});
   const data=await publicJSON('https://api.tatoeba.org/v1/sentences?'+params);
   rows=(data.data||[]).slice(0,8).map(r=>({id:r.id,text:String(r.text||'').slice(0,1000),owner:String(r.owner||''),license:String(r.license||''),url:'https://tatoeba.org/en/sentences/show/'+Number(r.id),translations:(r.translations||[]).filter(t=>t.lang==='ara'&&t.is_direct&&!t.is_unapproved).slice(0,3).map(t=>({text:String(t.text||'').slice(0,1000),owner:String(t.owner||''),license:String(t.license||'')}))})).filter(r=>r.text&&r.translations.length);
   source={name:'Tatoeba',url:'https://tatoeba.org/',license:'CC BY 2.0 FR',licenseUrl:'https://creativecommons.org/licenses/by/2.0/fr/',note:'Community examples; translations may need correction. Not graded exam questions.'};
  }
  res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({word,kind,rows,source});
 }catch{res.setHeader('Cache-Control','no-store');return res.status(502).json({error:'This source is temporarily unavailable. Your saved library is still available.'})}
}
