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
