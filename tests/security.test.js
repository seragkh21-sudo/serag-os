import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import tts from '../api/tts.js';
import coach from '../api/english-coach.js';
import assistant from '../api/assistant.js';
const response=()=>({headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v},status(n){this.statusCode=n;return this},json(x){this.body=x;return this},send(x){this.body=x;return this}});
test('all paid handlers reject anonymous requests without upstream work',async()=>{
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw Error('unexpected request')};
 try{for(const handler of [tts,coach,assistant]){const res=response();await handler({method:'POST',headers:{},body:{text:'Hello',prompt:'Test',message:'Test'}},res);assert.equal(res.statusCode,401)}assert.equal(calls,0)}finally{global.fetch=original}
});
test('TTS denies invalid identity, enforces quota before Azure, fails closed',async()=>{
 process.env.AZURE_SPEECH_KEY='test-only';process.env.AZURE_SPEECH_REGION='test';const original=global.fetch;
 try{for(const mode of ['identity','quota','unavailable','allowed']){const calls=[];global.fetch=async(url,options)=>{calls.push(url);if(url.includes('/auth/'))return {ok:mode!=='identity',json:async()=>({id:'test'})};if(url.includes('/rpc/'))return {ok:mode!=='unavailable',json:async()=>({allowed:mode==='allowed',retry_after:60})};assert.equal(mode,'allowed');assert.ok(options.body.includes('&lt;'));return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}};
 const res=response();await tts({method:'POST',headers:{authorization:'Bearer test'},body:{text:'Hello <world>',mode:'word'}},res);assert.equal(res.statusCode,{identity:401,quota:429,unavailable:503,allowed:200}[mode]);assert.equal(calls.some(x=>x.includes('microsoft.com')),mode==='allowed');assert.equal(res.headers['Cache-Control'],'private, no-store');}
 }finally{global.fetch=original;delete process.env.AZURE_SPEECH_KEY;delete process.env.AZURE_SPEECH_REGION}
});
test('service worker only intercepts icon requests',()=>{
 const listeners={};vm.runInNewContext(readFileSync('sw.js','utf8'),{self:{addEventListener:(k,v)=>listeners[k]=v,location:{origin:'https://example.test'}},URL});
 for(const path of ['/api/assistant','/api/tts?text=hello','/index.html','/private-document']){let handled=false;listeners.fetch({request:{method:'GET',url:'https://example.test'+path},respondWith(){handled=true}});assert.equal(handled,false,path)}
});
test('reading exercises have valid unique options and answers',()=>{
 const c={window:{}};c.window=c;vm.runInNewContext(readFileSync('english-content-v9.js','utf8'),c);
 assert.equal(c.SERAG_ENGLISH_V9.articles.length,14);for(const a of c.SERAG_ENGLISH_V9.articles.filter(a=>a.checks)){assert.equal(a.checks.length,2);for(const [q,options,answer,why] of a.checks){assert.ok(q&&why);assert.equal(new Set(options).size,options.length);assert.ok(options[answer])}}
});
