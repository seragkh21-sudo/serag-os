import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import speech,{providers} from '../api/english-speech.js';
import resources from '../api/english-resources.js';
import dictionary from '../api/dictionary.js';
import {wiktionaryEntries} from '../lib/english-public-data.js';
import {loadFiles} from '../english-harness.mjs';
const response=()=>({headers:{},code:200,setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(body){this.body=body;return this},send(body){this.body=body;return this}});

test('voice providers require explicit account configuration and never return secrets',async()=>{
 assert.ok(providers({}).every(p=>!p.configured));
 assert.equal(providers({AZURE_SPEECH_KEY:'secret',AZURE_SPEECH_REGION:'region'})[0].configured,false);
 assert.equal(providers({GOOGLE_TTS_API_KEY:'secret'})[2].configured,false);
 assert.equal(providers({AZURE_SPEECH_KEY:'secret',AZURE_SPEECH_REGION:'region',AZURE_SPEECH_FREE_TIER:'F0'})[0].configured,true);
 assert.ok(!JSON.stringify(providers({VOICERSS_API_KEY:'secret',VOICERSS_FREE_PLAN:'true'})).includes('secret'));
 const r=response();await speech({method:'GET',query:{mode:'status'}},r);assert.equal(r.code,200);
});

test('online speech verifies identity and quota before conversion, and rejects non-audio',async()=>{
 const old=global.fetch;process.env.VOICERSS_API_KEY='test-key';process.env.VOICERSS_FREE_PLAN='true';
 try{
  let conversions=0;
  for(const mode of ['anonymous','quota','text-error','success']){
   global.fetch=async url=>{
    if(url.includes('/auth/'))return {ok:true};
    if(url.includes('/rpc/'))return {ok:true,json:async()=>({allowed:mode!=='quota',retry_after:60})};
    conversions++;return {ok:true,headers:{get:()=>mode==='text-error'?'text/plain':'audio/mpeg'},arrayBuffer:async()=>new Uint8Array([73,68,51]).buffer};
   };
   const r=response();await speech({method:'POST',headers:mode==='anonymous'?{}:{authorization:'Bearer token'},body:{provider:'voicerss',text:'This is a test.'}},r);
   assert.equal(r.code,{anonymous:401,quota:429,'text-error':502,success:200}[mode]);
   assert.equal(r.headers['Cache-Control'],'private, no-store');
  }
  assert.equal(conversions,2);
 }finally{global.fetch=old;delete process.env.VOICERSS_API_KEY;delete process.env.VOICERSS_FREE_PLAN}
});

test('public resource search validates queries and uses fixed hosts with source attribution',async()=>{
 const old=global.fetch,calls=[];
 try{
  global.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>url.includes('datamuse')?[{word:'meeting',tags:['n']}]:{data:[{id:10,text:'I have an appointment.',owner:'writer',license:'CC BY 2.0 FR',translations:[{lang:'ara',text:'لدي موعد.',owner:'translator',license:'CC BY 2.0 FR',is_direct:true}]}]}}};
  const invalid=response();await resources({method:'GET',query:{word:'https://internal/',kind:'sentences'}},invalid);assert.equal(invalid.code,400);assert.equal(calls.length,0);
  for(const kind of ['related','sentences']){const r=response();await resources({method:'GET',query:{word:'appointment',kind}},r);assert.equal(r.code,200);assert.equal(r.body.rows.length,1);assert.ok(r.body.source.url.startsWith('https://'))}
  assert.ok(calls.some(url=>url.startsWith('https://api.tatoeba.org/v1/sentences?')&&url.includes('sort=relevance')));
 }finally{global.fetch=old}
});

test('dictionary fallback retains Wiktionary provenance and excludes unstructured text',async()=>{
 const raw={word:'testword',source:{url:'https://en.wiktionary.org/wiki/testword'},entries:[{partOfSpeech:'noun',pronunciations:[{type:'ipa',text:'/test/'}],senses:[{definition:'A test definition.',examples:['A simple example.'],synonyms:['sample']}]}]};
 const rows=wiktionaryEntries(raw);assert.equal(rows.length,1);assert.equal(rows[0].source.license,'CC BY-SA 4.0');assert.equal(rows[0].meanings[0].definitions[0].example,'A simple example.');
 assert.equal(wiktionaryEntries({entries:[]}).length,0);
 const old=global.fetch;
 try{global.fetch=async url=>url.includes('dictionaryapi.dev')?{ok:false,status:404}:{ok:true,json:async()=>raw};const r=response();await dictionary({method:'GET',query:{word:'testword'}},r);assert.equal(r.code,200);assert.equal(r.body[0].source.url,raw.source.url)}finally{global.fetch=old}
});

test('offline dictionary entries are attributed and have usable definitions',()=>{
 const data=JSON.parse(fs.readFileSync('data/english-dictionary-v1.json','utf8'));
 assert.ok(Object.keys(data.entries).length>=200);
 for(const rows of Object.values(data.entries))for(const row of rows){assert.ok(row.meanings[0].definitions.length);assert.equal(row.source.license,'CC BY-SA 4.0');assert.ok(row.source.url.startsWith('https://en.wiktionary.org/wiki/'))}
});

test('ready audio catalog references complete MP3s from public curriculum only',()=>{
 const {ctx,errors}=loadFiles(process.cwd(),['english-content-v9.js','english-vocab-v24.js','english-expansion-v1.js','english-phrases-v16.js','word-practice-v21.js']);
 assert.deepEqual(errors,[]);
 const publicText=new Set([...ctx.SERAG_WORD_PRACTICE.items().map(w=>w.phrase),...ctx.SERAG_ENGLISH_EXPANSION_V1.questions.map(q=>q.prompt.replace('___',q.answer))]);
 const catalog=JSON.parse(fs.readFileSync('assets/english-audio/catalog.json','utf8'));
 assert.ok(Object.keys(catalog.clips).length>=400);
 for(const [key,path] of Object.entries(catalog.clips)){
  assert.ok(publicText.has(key.slice(3)),key);assert.match(path,/^\/assets\/english-audio\/[a-f0-9]{24}\.mp3$/);
  const bytes=fs.readFileSync('.'+path);assert.ok(bytes.length>512,path);assert.equal(bytes.subarray(0,3).toString(),'ID3');
 }
});

function browserAudio(){
 const nodes=new Map(),played=[],store=new Map(),events={};let naturalCalls=0;
 const element=id=>{if(!nodes.has(id))nodes.set(id,{id,hidden:false,textContent:'',innerHTML:'',className:''});return nodes.get(id)};
 const c={console,Map,URL,AbortSignal,AbortController,setTimeout,clearTimeout,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes.get(id)||null,createElement(){return {set innerHTML(v){this.html=v}}},body:{append(host){element('efsAudioStatus');element('efsAudioBar')}},addEventListener:(name,fn)=>events[name]=fn},Audio:class{constructor(src){this.src=src}play(){played.push(this.src);return Promise.resolve()}pause(){}},fetch:async()=>({ok:true,json:async()=>({clips:{'us|appointment':'/assets/english-audio/1234567890abcdef12345678.mp3'}})}),addEventListener(){}};
 c.window=c;c.SERAG_NATURAL_AUDIO={stop(){},setMode(){},speak(_text,opts){assert.equal(opts.internal,true);naturalCalls++;return true}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('english-free-services-v1.js','utf8'),c);
 return {c,played,get naturalCalls(){return naturalCalls}};
}
test('ready audio plays the catalog asset, unknown text falls back without an online request loop',async()=>{
 const h=browserAudio();assert.equal(await h.c.SERAG_FREE_ENGLISH_AUDIO.speak('appointment'),true);assert.equal(h.played.length,1);assert.equal(h.naturalCalls,0);
 assert.equal(await h.c.SERAG_FREE_ENGLISH_AUDIO.speak('A new custom sentence.'),true);assert.equal(h.naturalCalls,1);
 h.c.SERAG_FREE_ENGLISH_AUDIO.setPreference('natural');
 assert.equal(await h.c.SERAG_FREE_ENGLISH_AUDIO.speak('appointment'),true);assert.equal(h.naturalCalls,1,'published natural audio avoids another inference');
});
