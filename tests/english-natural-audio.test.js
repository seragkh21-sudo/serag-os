import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('natural audio splits long articles without dropping words and keeps generation lazy',()=>{
 let workers=0;
 const context={window:{seragMicrosoftTTS:{stop(){}},addEventListener(){}},document:{addEventListener(){}},localStorage:{getItem(){return null}},Worker:class{constructor(){workers++}},Map,URL,console};
 vm.runInNewContext(fs.readFileSync('english-natural-audio-v1.js','utf8'),context);
 const text=Array.from({length:700},(_,i)=>'word'+i+(i%10===0?'.':'')).join(' ');
 const parts=context.window.SERAG_NATURAL_AUDIO.chunks(text);
 assert.equal(parts.join(' '),text);assert.ok(parts.every(x=>x.length<=220));assert.equal(workers,0);
});

test('stopped generation cannot play later; a new request plays and releases its audio URL',async()=>{
 const nodes=new Map(),workers=[],urls=[],revoked=[];let plays=0;
 const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',hidden:false,showModal(){},close(){}});return nodes.get(id)};
 class WorkerMock{constructor(){workers.push(this);this.messages=[]}postMessage(m){this.messages.push(m)}terminate(){}}
 class AudioMock{play(){plays++;queueMicrotask(()=>this.onended());return Promise.resolve()}pause(){}}
 const context={window:{seragMicrosoftTTS:{stop(){}},addEventListener(){}},document:{readyState:'complete',addEventListener(){},getElementById:node},localStorage:{getItem:k=>k==='seragVoiceMode'?'natural':'us'},Worker:WorkerMock,Audio:AudioMock,Map,URL:{createObjectURL(){const u='blob:'+urls.length;urls.push(u);return u},revokeObjectURL:u=>revoked.push(u)},setTimeout,clearTimeout,console};
 vm.runInNewContext(fs.readFileSync('english-natural-audio-v1.js','utf8'),context);
 const api=context.window.SERAG_NATURAL_AUDIO;
 const first=api.speak('This must not play.');const w=workers[0],firstID=w.messages.at(-1).id;
 api.stop();w.onmessage({data:{id:firstID,type:'audio',blob:{}}});await first;assert.equal(plays,0);
 const second=api.speak('This should play.');const secondID=w.messages.at(-1).id;
 w.onmessage({data:{id:secondID,type:'audio',blob:{}}});assert.equal(await second,true);assert.equal(plays,1);assert.deepEqual(revoked,urls);assert.equal(node('enaStatus').textContent,'Finished.');
});
