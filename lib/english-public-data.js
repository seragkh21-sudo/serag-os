export const validWord=value=>typeof value==='string'&&value.length<=80&&/^[A-Za-z][A-Za-z'’ -]*$/.test(value)&&value.trim().split(/\s+/).length<=6;
export const safeLink=value=>{try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.href:''}catch{return ''}};
export async function publicJSON(url,timeout=6000){
 const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SeragOS/1.0 (English learning)'},signal:AbortSignal.timeout(timeout)});
 if(!response.ok){const error=new Error('Public source unavailable');error.status=response.status;throw error}
 return response.json();
}
export function wiktionaryEntries(data){
 if(!data||!Array.isArray(data.entries))return [];
 const source={name:'FreeDictionaryAPI.com / Wiktionary',url:safeLink(data.source?.url),license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'};
 return data.entries.slice(0,8).map(entry=>({
  word:String(data.word||'').slice(0,80),
  phonetic:String((entry.pronunciations||[]).find(p=>p.type==='ipa')?.text||entry.pronunciations?.[0]?.text||'').slice(0,200),
  phonetics:(entry.pronunciations||[]).slice(0,6).map(p=>({text:String(p.text||'').slice(0,200),audio:''})),
  meanings:[{partOfSpeech:String(entry.partOfSpeech||'').slice(0,40),definitions:(entry.senses||[]).slice(0,12).map(s=>({definition:String(s.definition||'').slice(0,1500),example:String(s.examples?.[0]||'').slice(0,1000),synonyms:(s.synonyms||[]).filter(x=>typeof x==='string').slice(0,12),antonyms:(s.antonyms||[]).filter(x=>typeof x==='string').slice(0,12)})).filter(s=>s.definition)}],
  source,license:{name:source.license,url:source.licenseUrl},sourceUrls:[source.url].filter(Boolean)
 })).filter(e=>e.meanings[0].definitions.length);
}
