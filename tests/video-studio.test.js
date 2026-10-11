import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function module(){const c={window:{addEventListener(){}},URL,location:{origin:'https://serag-os.vercel.app'}};vm.createContext(c);vm.runInContext(fs.readFileSync('english-video-v17.js','utf8'),c);return c.window.SERAG_VIDEO_V17}
test('SRT and VTT import preserves cue timing, removes markup and rejects invalid timestamps',()=>{
 const m=module();let cues=m.parse('1\n00:00:08,500 --> 00:00:13,000\n<b>Hello</b> there.\n\n2\n00:00:13,000 --> 00:00:18,000\nNext line.');assert.equal(cues[0].start,8.5);assert.equal(cues[0].text,'Hello there.');
 cues=m.parse('WEBVTT\n\n00:08.500 --> 00:13.000 align:start\nHello.');assert.equal(cues.length,1);assert.equal(cues[0].end,13);
 for(const invalid of ['No captions','1\n00:80:00,000 --> 01:00:00,000\nBad time','1\n00:00:10,000 --> 00:00:09,000\nBackwards'])assert.throws(()=>m.parse(invalid));
 assert.throws(()=>m.parse('a'.repeat(500001)));
});
test('YouTube import accepts video URLs and rejects lookalike hosts and script URLs',()=>{
 const m=module();for(const url of ['https://youtu.be/JnfBXjWm7hc','https://www.youtube.com/watch?v=JnfBXjWm7hc','https://www.youtube.com/shorts/JnfBXjWm7hc'])assert.equal(m.youtubeId(url),'JnfBXjWm7hc');
 for(const url of ['https://youtube.com.evil.example/watch?v=JnfBXjWm7hc','javascript://youtube.com/watch?v=JnfBXjWm7hc','https://youtube.com/watch?v=bad','text'])assert.equal(m.youtubeId(url),null);
 assert.equal(m.library.length,5);assert.ok(m.library[0].cues.every(c=>c.end>c.start&&c.meaning));assert.ok(!m.html({notes:{}}).includes('undefined'));
});
test('native studio seeks, pauses at cue end, loops, saves once and cleans up',async()=>{
 const m=module(),events={},els={};let timer,cleared=false,saves=0;const native={paused:true,currentTime:0,pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()},addEventListener(){}};
 const selectors=['status','lines','saved','saved-count','result','pause','loop'];for(const s of selectors)els[`[data-v17-${s}]`]={textContent:'',innerHTML:'',checked:false,classList:{toggle(){}}};els['[data-v17-native]']=native;
 const buttons=m.library[0].cues.map((_,i)=>({dataset:{v17Cue:String(i)},setAttribute(k,v){this[k]=v},classList:{toggle(){}}}));const options=[{disabled:false},{disabled:false},{disabled:false}];
 const root={querySelector(s){return s==='[data-v17-studio]'?this:els[s]},querySelectorAll(s){return s==='[data-v17-cue]'?buttons:s==='[data-v17-answer]'?options:[]},addEventListener(k,f){events[k]=f},removeEventListener(k){delete events[k]}};
 const c={window:{addEventListener(){}},URL,location:{origin:'https://serag-os.vercel.app'},setInterval(f){timer=f;return 1},clearInterval(){cleared=true}};vm.createContext(c);vm.runInContext(fs.readFileSync('english-video-v17.js','utf8'),c);const api=c.window.SERAG_VIDEO_V17,state={notes:{}};api.mount(root,state,()=>saves++,()=>{});
 const target=(attr,dataset={})=>({dataset,hasAttribute:k=>k===attr,closest(){return this}});
 await events.click({target:target('',{v17Cue:'1'})});assert.equal(native.currentTime,13);assert.equal(native.paused,false);
 events.change({target:{...target('data-v17-pause'),checked:true}});native.currentTime=18.2;timer();assert.equal(native.paused,true);
 await events.click({target:target('data-v17-repeat')});events.change({target:{...target('data-v17-loop'),checked:true}});native.currentTime=18.2;timer();assert.equal(native.currentTime,13);
 await events.click({target:target('data-v17-save')});await events.click({target:target('data-v17-save')});assert.equal(state.videoSaved.length,1);assert.equal(saves,2);
 await events.click({target:target('',{v17Answer:'0'})});assert.equal(state.videoChecks.budget.correct,true);assert.ok(options.every(x=>x.disabled));
 api.cleanup();assert.ok(cleared);assert.equal(native.paused,true);assert.deepEqual(Object.keys(events),[]);
});
