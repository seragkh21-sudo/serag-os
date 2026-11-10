import test from 'node:test';
import assert from 'node:assert/strict';
import handler,{videoId,normalizeCues} from '../api/video-study.js';
const response=()=>({code:0,body:null,setHeader(){},status(n){this.code=n;return this},json(body){this.body=body;return this}});
test('transcript input rejects foreign hosts and keeps valid timed segments',()=>{
 assert.equal(videoId('https://youtu.be/JnfBXjWm7hc'),'JnfBXjWm7hc');
 for(const url of ['https://youtube.com.evil.test/watch?v=JnfBXjWm7hc','javascript://youtube.com/watch?v=JnfBXjWm7hc','https://youtube.com/watch?v=bad'])assert.equal(videoId(url),null);
 const cues=normalizeCues({content:[{text:'Hello',offset:1500,duration:2000},{text:'bad',offset:-5,duration:5},{text:'bad',offset:10,duration:-2}]});
 assert.deepEqual(cues,[{text:'Hello',start:1.5,end:3.5,meaning:''}]);
});
test('transcript service authenticates, validates, signs jobs per owner and normalizes results',async()=>{
 const original=global.fetch,oldKey=process.env.SUPADATA_API_KEY;let owner='user-a',calls=0,payload={jobId:'job-one'};
 global.fetch=async(url)=>{if(String(url).includes('/auth/v1/user'))return {ok:true,json:async()=>({id:owner})};if(String(url).includes('consume_api_quota'))return {ok:true,json:async()=>({allowed:true})};calls++;assert.ok(String(url).startsWith('https://api.supadata.ai/v1/transcript'));return {ok:true,status:payload.jobId?202:200,text:async()=>JSON.stringify(payload)}};
 const req=body=>({method:'POST',headers:{authorization:'Bearer fixture'},body});
 try{
  const unauth=response();await handler({method:'POST',headers:{},body:{}},unauth);assert.equal(unauth.code,401);
  delete process.env.SUPADATA_API_KEY;const missing=response();await handler(req({action:'transcript',url:'https://youtu.be/JnfBXjWm7hc'}),missing);assert.equal(missing.code,503);assert.equal(calls,0);
  process.env.SUPADATA_API_KEY='test-only-provider-key';const invalid=response();await handler(req({action:'transcript',url:'http://127.0.0.1'}),invalid);assert.equal(invalid.code,400);assert.equal(calls,0);
  const pending=response();await handler(req({action:'transcript',url:'https://youtu.be/JnfBXjWm7hc'}),pending);assert.equal(pending.code,202);assert.ok(pending.body.proof);assert.equal(calls,1);
  owner='user-b';const foreign=response();await handler(req({action:'job',...pending.body}),foreign);assert.equal(foreign.code,403);assert.equal(calls,1);
  owner='user-a';payload={status:'completed',result:{lang:'ar',content:[{text:'مرحبا',offset:1000,duration:2000}]}};const done=response();await handler(req({action:'job',...pending.body}),done);assert.equal(done.code,200);assert.equal(done.body.lang,'ar');assert.equal(done.body.cues[0].end,3);
 }finally{global.fetch=original;if(oldKey===undefined)delete process.env.SUPADATA_API_KEY;else process.env.SUPADATA_API_KEY=oldKey}
});
