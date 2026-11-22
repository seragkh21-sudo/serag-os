import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const batch=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-001.json',import.meta.url)));
const source=fs.readFileSync(new URL('../english-notebook-course-v1.js',import.meta.url),'utf8');
async function fixture({eligible=true,ready=true}={}){
 const events={},tracks=[],skills=[];
 const window={user:{id:'owner-a'},addEventListener(){},ENGOPLAY:{isReady:ready,ensureReady:async()=>{},stats:()=>({answeredKeys:new Set()}),track:r=>tracks.push(r)},SERAG_ACADEMY_V12:{selectQuestions:list=>eligible?list:[]},SERAG_SKILL_EVIDENCE:{record:r=>skills.push(r)}};
 const document={addEventListener:(name,fn)=>events[name]=fn,querySelector:()=>null};
 vm.runInNewContext(source,{window,document,fetch:async()=>({ok:true,json:async()=>structuredClone(batch)}),AbortSignal,localStorage:{getItem:()=>null},setInterval:()=>0,clearInterval});
 await window.SERAG_NOTEBOOK_COURSE_READY;
 return {api:window.SERAG_NOTEBOOK_COURSE,window,tracks,skills,events};
}
test('published batch retains all four formats, distinct IDs, valid ordering and unverified citations',async()=>{
 const {api}=await fixture();assert.equal(api.data.questions.length,16);
 assert.equal(new Set(batch.questions.map(q=>q.type)).size,4);
 assert.equal(batch.units.length,1);assert.equal(batch.units[0].lessons.length,4);
 for(const q of batch.questions){for(const ref of q.source_refs){assert.equal(ref.pdf_page,null);assert.equal(ref.verification_status,'unverified')}
  if(q.type==='sentence_order')for(const answer of q.accepted_answers)assert.deepEqual(api.normalize(answer).split(' ').sort(),Array.from(q.tokens,t=>api.normalize(t)).sort());
 }
 assert.throws(()=>api.validate({...batch,questions:[{...batch.questions[0],options:['broken']}]}));
});
test('wrong first submission stays wrong in synced history and revision cannot earn independent success',async()=>{
 const {api,tracks,skills}=await fixture();await api.start();
 const q=api.currentQuestion();assert.equal(api.respond('unreviewed wrong answer'),false);assert.equal(api.respond(q.answer),true);
 assert.equal(tracks.length,1);assert.equal(tracks[0].correct,false);assert.equal(skills[1].assisted,true);
 assert.match(api.html(),/Correct after revision/);api.next();
 const before=tracks.length;api.reveal();assert.equal(tracks.length,before);assert.equal(api.respond(api.currentQuestion().answer),false);
});
test('recent-history exclusion, missing history and owner changes cannot leak or record a stale session',async()=>{
 const empty=await fixture({eligible:false});await empty.api.start();assert.equal(empty.api.currentQuestion(),null);assert.match(empty.api.html(),/No eligible questions/);
 const blocked=await fixture({ready:false});assert.equal(await blocked.api.start(),false);assert.equal(blocked.tracks.length,0);
 const active=await fixture();await active.api.start();const q=active.api.currentQuestion();active.window.user={id:'owner-b'};assert.equal(active.api.respond(q.answer),false);assert.equal(active.api.reveal(),false);assert.equal(active.tracks.length,0);
});

test('combined course retains prior batches and all word-order answers remain constructible',async()=>{
 const published=JSON.parse(fs.readFileSync(new URL('../curriculum-data/course-v1.json',import.meta.url)));
 const second=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-002.json',import.meta.url)));
 const third=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-003.json',import.meta.url)));
 const fourth=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-004.json',import.meta.url)));
 const fifth=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-005.json',import.meta.url)));
 const sixth=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-006.json',import.meta.url)));
 const {api}=await fixture();api.validate(published);
 assert.deepEqual(published.questions,[...batch.questions.map(q=>({...q,batch_id:'batch-001'})),...second.questions.map(q=>({...q,batch_id:'batch-002'})),...third.questions.map(q=>({...q,batch_id:'batch-003'})),...fourth.questions.map(q=>({...q,batch_id:'batch-004'})),...fifth.questions.map(q=>({...q,batch_id:'batch-005'})),...sixth.questions.map(q=>({...q,batch_id:'batch-006'}))]);
 assert.equal(published.questions.length,96);assert.equal(published.units.flatMap(u=>u.lessons).length,24);
 for(const q of batch.questions){const live=published.questions.find(row=>row.canonical_id===q.canonical_id);for(const key of ['id','canonical_id','prompt','answer','accepted_answers'])assert.deepEqual(live[key],q[key])}
 for(const q of second.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-002:q/);for(const ref of q.source_refs)assert.equal(ref.pdf_page,null)}
 assert.equal(second.questions.filter(q=>q.type==='multiple_choice').length,5);
 assert.equal(second.questions.filter(q=>q.type==='fill_blank').length,4);
 assert.equal(second.questions.filter(q=>q.type==='error_correction').length,4);
 assert.equal(second.questions.filter(q=>q.type==='sentence_order').length,3);
 for(const q of second.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer),'Order exercises must not arrive already solved');
 for(const q of third.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-003:q/);for(const ref of q.source_refs)assert.equal(ref.pdf_page,null)}
 for(const kind of ['multiple_choice','fill_blank','error_correction','sentence_order'])assert.equal(third.questions.filter(q=>q.type===kind).length,second.questions.filter(q=>q.type===kind).length);
 for(const q of third.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer));
 for(const q of fourth.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-004:q/);for(const ref of q.source_refs)assert.equal(ref.pdf_page,null)}
 for(const kind of ['multiple_choice','fill_blank','error_correction','sentence_order'])assert.equal(fourth.questions.filter(q=>q.type===kind).length,second.questions.filter(q=>q.type===kind).length);
 for(const q of fourth.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer));
 assert.deepEqual(fourth.questions.find(q=>q.id==='q55').accepted_answers,['some','any']);
 for(const q of fifth.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-005:q/);for(const ref of q.source_refs)assert.equal(ref.pdf_page,null)}
 for(const kind of ['multiple_choice','fill_blank','error_correction','sentence_order'])assert.equal(fifth.questions.filter(q=>q.type===kind).length,second.questions.filter(q=>q.type===kind).length);
 for(const q of fifth.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer));
 const clock=fifth.questions.find(q=>q.id==='q78');assert.ok(clock.tokens.includes("o'clock"));assert.notEqual(api.normalize("o'clock"),api.normalize('oclock'));assert.equal(clock.accepted_answers.length,3);
 assert.ok(fifth.questions.find(q=>q.id==='q71').prompt.includes('First the team finishes the tests. Then'));
 for(const q of sixth.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-006:q/);for(const ref of q.source_refs)assert.equal(ref.verification_status,'unverified');if(q.type==='multiple_choice')assert.ok(q.accepted_answers.every(a=>q.options.includes(a)))}
 for(const kind of ['multiple_choice','fill_blank','error_correction','sentence_order'])assert.equal(sixth.questions.filter(q=>q.type===kind).length,second.questions.filter(q=>q.type===kind).length);
 for(const q of sixth.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer));
 assert.deepEqual(sixth.questions.find(q=>q.id==='q86').accepted_answers,['at','on']);assert.deepEqual(sixth.questions.find(q=>q.id==='q89').accepted_answers,['through','along']);
 const extraTile=structuredClone(published);extraTile.questions.find(q=>q.id==='q95').tokens.push('the');assert.throws(()=>api.validate(extraTile),/tokens/);
 assert.equal(api.normalize('women’s'),api.normalize("women's"));
 assert.notEqual(api.normalize('its'),api.normalize("it's"));
 const missingTile=structuredClone(published);missingTile.questions.find(q=>q.id==='q47').tokens.pop();assert.throws(()=>api.validate(missingTile),/tokens/);
 const impossible=structuredClone(published);impossible.questions.find(q=>q.id==='q32').accepted_answers.push('Major damage to city infrastructure is caused by earthquakes.');
 assert.throws(()=>api.validate(impossible),/tokens/);
 const duplicate=structuredClone(published);duplicate.units[0].lessons.push(duplicate.units[0].lessons[0]);assert.throws(()=>api.validate(duplicate),/Duplicate/);
});
