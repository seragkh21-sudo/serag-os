import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

function harness() {
  const elements = new Map(), events = {}, calls = {upload:[],insert:[],update:[],remove:[],stopped:0}, stored = [];
  const failures = {insert:false,upload:false}, deferred = {};
  const el = selector => {
    if (!elements.has(selector)) elements.set(selector, {value:'',textContent:'',hidden:false,disabled:false,checked:false,open:false,src:'',playbackRate:1,
      reset(){},pause(){},load(){},removeAttribute(key){this[key]='';},showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},hasAttribute(){return false;}});
    return elements.get(selector);
  };
  function query() {
    let mode = 'select', payload, filters = [];
    const q = {select(){return q;},eq(key,value){filters.push(row => row[key] === value);return q;},order(){return q;},insert(row){mode='insert';payload=row;return q;},update(row){mode='update';payload=row;return q;},
      async then(resolve,reject) {
        try {
          if (deferred.query) await deferred.query;
          if (mode === 'insert') {
            calls.insert.push(payload);
            if (failures.insert) return resolve({data:null,error:{code:'offline'}});
            if (stored.some(row => row.id === payload.id)) return resolve({data:null,error:{code:'23505'}});
            const row={revision:0,archived:false,created_at:new Date().toISOString(),...payload};stored.push(row);return resolve({data:[row],error:null});
          }
          const matches=stored.filter(row => filters.every(f => f(row)));
          if (mode === 'update') {calls.update.push({payload,matches:matches.length});matches.forEach(row=>{Object.assign(row,payload);row.revision++;});}
          return resolve({data:matches.map(row=>({...row})),error:null});
        } catch(error) { return reject(error); }
      }};return q;
  }
  class Recorder {
    static isTypeSupported(type){return type.startsWith('audio/webm');}
    constructor(_stream,options){this.mimeType=options?.mimeType||'audio/webm';this.state='inactive';Recorder.last=this;}
    start(){this.state='recording';}
    stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['test audio'],{type:this.mimeType})});this.onstop?.();}
  }
  class Recognition {constructor(){Recognition.last=this;}start(){}stop(){}abort(){this.aborted=true;}}
  const media = {getTracks:()=>[{stop(){calls.stopped++;}}]};
  const c={Blob,File,Date,Math,Error,Promise,crypto:{randomUUID:()=>`voice-${Math.random()}`},URL:{createObjectURL:()=>`blob:preview`,revokeObjectURL(){}},
    navigator:{mediaDevices:{getUserMedia:async()=>deferred.mic ? await deferred.mic : media}},MediaRecorder:Recorder,SpeechRecognition:Recognition,
    document:{querySelector:el,querySelectorAll:()=>[],addEventListener(name,fn){(events[name]??=[]).push(fn);},body:{insertAdjacentHTML(){}}},
    setInterval:()=>1,clearInterval(){},user:{id:'owner-a'},confirm:()=>true,addEventListener(name,fn){events[name]=fn;},
    sb:{from:query,storage:{from(){return {async upload(path,blob,options){calls.upload.push({path,blob,options});if(deferred.upload)await deferred.upload;return {error:failures.upload?{message:'offline'}:null};},async createSignedUrl(path){return {data:{signedUrl:`https://private.test/${path}`},error:null};},async remove(paths){calls.remove.push(paths);return {error:null};}};}}}};
  c.window=c;vm.createContext(c);
  const source=fs.readFileSync('english-voice-library-v1.js','utf8').replace('{html,mount,cleanup};','{html,mount,cleanup,open,load,close,useFile,saveDraft,startRecording,stopRecording,resetAccount,toggleArchive,fileInfo,chooseMime,_draft:()=>draft};');
  vm.runInContext(source,c);
  return {api:c.SERAG_VOICE_LIBRARY_V1,c,el,events,calls,stored,failures,deferred,Recorder,Recognition,media};
}
const sample=()=>new File(['voice bytes'],'practice.m4a',{type:'audio/mp4'});
function fill(h,title='My practice') {for(const [field,value] of Object.entries({title,practice_text:'I would like to clarify the brief.',transcript:'I would like to clarify the brief.',notes:'Practise the th sound.',language:'en-US'}))h.el(`[data-evl-field="${field}"]`).value=value;}

test('audio validation handles mobile formats, unknown MIME and oversized or empty files',()=>{
  const {api}=harness();assert.equal(api.fileInfo(sample()).ext,'m4a');assert.equal(api.fileInfo(new File(['x'],'phone.wav')).mime,'audio/wav');
  assert.throws(()=>api.fileInfo({size:0,type:'audio/webm'}),/non-empty/);assert.throws(()=>api.fileInfo({size:52428801,type:'audio/wav'}),/50 MB/);
  assert.throws(()=>api.fileInfo({size:2,type:'text/html',name:'audio.mp3'}),/audio file/);assert.equal(api.chooseMime(),'audio/webm;codecs=opus');
});
test('saving uploads private owner-path audio before metadata and reopening uses a signed URL',async()=>{
  const h=harness();await h.api.open();await h.api.useFile(sample());fill(h);await h.api.saveDraft();
  assert.equal(h.calls.upload.length,1);assert.match(h.calls.upload[0].path,/^owner-a\/voice\/voice-.*\/audio.m4a$/);assert.equal(h.calls.insert[0].user_id,'owner-a');assert.equal(h.stored[0].notes,'Practise the th sound.');assert.equal(h.api._draft(),null);
  await h.api.open(h.stored[0]);assert.match(h.el('#evlAudio').src,/https:\/\/private.test\/owner-a\/voice\//);assert.equal(h.el('#evlCapture').hidden,true);
});
test('failed upload and metadata save retain the draft and retry avoids duplicate uploads',async()=>{
  const h=harness();await h.api.open();await h.api.useFile(sample());fill(h);h.failures.upload=true;await h.api.saveDraft();assert.ok(h.api._draft().blob);assert.equal(h.calls.insert.length,0);
  h.failures.upload=false;h.failures.insert=true;await h.api.saveDraft();assert.ok(h.api._draft().uploadedPath);assert.match(h.el('#evlSaveStatus').textContent,/draft/);
  h.failures.insert=false;await h.api.saveDraft();assert.equal(h.calls.upload.length,2);assert.equal(h.stored.length,1);
});
test('stale revision cannot overwrite another device’s notes',async()=>{
  const h=harness();await h.api.open();await h.api.useFile(sample());fill(h);await h.api.saveDraft();const stale={...h.stored[0]};h.stored[0].revision=1;h.stored[0].notes='Other device';
  await h.api.open(stale);fill(h);await h.api.saveDraft();assert.equal(h.stored[0].notes,'Other device');assert.match(h.el('#evlSaveStatus').textContent,/another device/);assert.ok(h.api._draft());
});
test('recording stops microphone tracks, captures audio and keeps editable live transcript without a score',async()=>{
  const h=harness();await h.api.open();h.el('#evlLive').checked=true;await h.api.startRecording();assert.equal(h.Recorder.last.state,'recording');
  h.Recognition.last.onresult({results:[[{transcript:'A clear brief helps.'}]]});assert.equal(h.el('#evlTranscript').value,'A clear brief helps.');
  h.api.stopRecording();assert.ok(h.calls.stopped>0);assert.ok(h.api._draft().blob.size);assert.equal(h.el('#evlAudio').hidden,false);assert.match(h.el('#evlCaptureStatus').textContent,/ready/);
});
test('unsupported speech recognition does not block audio recording and denied mic is recoverable',async()=>{
  const h=harness();delete h.c.SpeechRecognition;await h.api.open();assert.equal(h.el('#evlLive').disabled,true);await h.api.startRecording();h.api.stopRecording();assert.ok(h.api._draft().blob);
  await h.api.close();await h.api.open();h.c.navigator.mediaDevices.getUserMedia=async()=>{throw Error('denied');};await h.api.startRecording();assert.equal(h.el('[data-evl-record]').disabled,false);assert.match(h.el('#evlCaptureStatus').textContent,/upload an audio/);
});
test('late microphone permission after closing cannot leave a live recorder',async()=>{
  const h=harness();let resolve;h.deferred.mic=new Promise(r=>{resolve=r;});await h.api.open();const pending=h.api.startRecording();await h.api.close();resolve(h.media);await pending;assert.ok(h.calls.stopped>0);assert.equal(h.api._draft(),null);assert.equal(h.Recorder.last,undefined);
});
test('account switch during upload prevents metadata writes into the new account',async()=>{
  const h=harness();let resolve;h.deferred.upload=new Promise(r=>{resolve=r;});await h.api.open();await h.api.useFile(sample());fill(h);const pending=h.api.saveDraft();h.c.user={id:'owner-b'};h.api.resetAccount('owner-b');resolve();await pending;
  assert.equal(h.calls.insert.length,0);assert.equal(h.api._draft(),null);assert.equal(h.el('#evlEditor').open,false);
});
test('record again preserves the original and archive can be restored without deleting audio',async()=>{
  const h=harness();await h.api.open();await h.api.useFile(sample());fill(h);await h.api.saveDraft();await h.api.load();const row={...h.stored[0]};
  await h.api.open(row,true);assert.notEqual(h.api._draft().id,row.id);assert.equal(h.api._draft().practice_text,row.practice_text);assert.equal(h.api._draft().transcript,'');await h.api.close();
  await h.api.toggleArchive(row.id);assert.equal(h.stored[0].archived,true);await h.api.toggleArchive(row.id);assert.equal(h.stored[0].archived,false);assert.equal(h.calls.remove.length,0);
});
test('library escapes titles and transcript previews',async()=>{
  const h=harness();h.stored.push({id:'test',user_id:'owner-a',archived:false,created_at:new Date().toISOString(),title:'<img onerror=evil()>',transcript:'<script>x</script>',audio_bytes:10});await h.api.load();
  assert.doesNotMatch(h.api.html(),/<img onerror|<script>x/);assert.match(h.api.html(),/&lt;img/);
});
