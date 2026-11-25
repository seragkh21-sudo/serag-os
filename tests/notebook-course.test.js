import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const batch=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-001.json',import.meta.url)));
const publishedCourse=JSON.parse(fs.readFileSync(new URL('../curriculum-data/course-v1.json',import.meta.url)));
batch.manifest={version:1,lessons:publishedCourse.manifest.lessons.filter(l=>batch.units.some(u=>u.lessons.some(x=>x.id===l.id)))};
const source=fs.readFileSync(new URL('../english-notebook-course-v1.js',import.meta.url),'utf8');
async function fixture({eligible=true,ready=true,course=batch}={}){
 const events={},tracks=[],skills=[];
 const window={user:{id:'owner-a'},addEventListener(){},ENGOPLAY:{isReady:ready,ensureReady:async()=>{},stats:()=>({answeredKeys:new Set()}),track:r=>tracks.push(r)},SERAG_ACADEMY_V12:{selectQuestions:list=>eligible?list:[]},SERAG_SKILL_EVIDENCE:{record:r=>skills.push(r)}};
 const document={addEventListener:(name,fn)=>events[name]=fn,querySelector:()=>null};
 vm.runInNewContext(source,{window,document,fetch:async()=>({ok:true,json:async()=>structuredClone(course)}),AbortSignal,localStorage:{getItem:()=>null},setInterval:()=>0,clearInterval});
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
 const seventh=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-007.json',import.meta.url)));
 const eighth=JSON.parse(fs.readFileSync(new URL('../curriculum-data/batch-008.json',import.meta.url)));
 const {api}=await fixture();api.validate(published);
 const originalExplanations=new Map([batch,...[second,third,fourth,fifth,sixth,seventh,eighth]].flatMap(b=>b.questions.map(q=>[q.id,q.explanation])));
 assert.deepEqual(published.questions.slice(0,128).map(q=>({...q,explanation:['q01','q95'].includes(q.id)?originalExplanations.get(q.id):q.explanation})),[...batch.questions.map(q=>({...q,batch_id:'batch-001'})),...second.questions.map(q=>({...q,batch_id:'batch-002'})),...third.questions.map(q=>({...q,batch_id:'batch-003'})),...fourth.questions.map(q=>({...q,batch_id:'batch-004'})),...fifth.questions.map(q=>({...q,batch_id:'batch-005'})),...sixth.questions.map(q=>({...q,batch_id:'batch-006'})),...seventh.questions.map(q=>({...q,batch_id:'batch-007'})),...eighth.questions.map(q=>({...q,batch_id:'batch-008'}))]);
 assert.equal(published.questions.length,151);assert.equal(published.units.flatMap(u=>u.lessons).length,32);
 for(const q of batch.questions){const live=published.questions.find(row=>row.canonical_id===q.canonical_id);for(const key of ['id','canonical_id','prompt','answer','accepted_answers'])assert.deepEqual(live[key],q[key])}
 assert.match(published.questions[0].explanation,/head noun or pronoun/);
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
 for(const q of seventh.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-007:q/);for(const ref of q.source_refs)assert.equal(ref.verification_status,'unverified');if(q.type==='multiple_choice')assert.equal(new Set(q.options.map(api.normalize)).size,q.options.length)}
 for(const kind of ['multiple_choice','fill_blank','error_correction','sentence_order'])assert.equal(seventh.questions.filter(q=>q.type===kind).length,second.questions.filter(q=>q.type===kind).length);
 for(const q of seventh.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer));
 assert.equal(seventh.questions.find(q=>q.id==='q111').lesson_id,'u11-l2');assert.deepEqual(seventh.questions.find(q=>q.id==='q105').accepted_answers,["didn't",'did not']);
 const missingPastTile=structuredClone(published);missingPastTile.questions.find(q=>q.id==='q111').tokens.pop();assert.throws(()=>api.validate(missingPastTile),/tokens/);
 for(const q of eighth.questions){assert.match(q.canonical_id,/^serag-notebook-course-v1:batch-008:q/);for(const ref of q.source_refs)assert.equal(ref.verification_status,'unverified');if(q.type==='multiple_choice'){assert.equal(new Set(q.options.map(api.normalize)).size,q.options.length);assert.ok(q.accepted_answers.every(a=>q.options.includes(a)))}}
 for(const kind of ['multiple_choice','fill_blank','error_correction','sentence_order'])assert.equal(eighth.questions.filter(q=>q.type===kind).length,second.questions.filter(q=>q.type===kind).length);
 for(const q of eighth.questions.filter(q=>q.type==='sentence_order'))assert.notEqual(api.normalize(q.tokens.join(' ')),api.normalize(q.answer));
 assert.deepEqual(eighth.questions.find(q=>q.id==='q121').accepted_answers,['while','when']);assert.ok(eighth.questions.find(q=>q.id==='q124').explanation.includes('can also be grammatical'));
 assert.deepEqual(eighth.questions.find(q=>q.id==='q119').accepted_answers,["weren't attending",'were not attending']);
 const incidentWords=eighth.writing_tasks[0].model_response.split(/\s+/).length;assert.ok(incidentWords>=60&&incidentWords<=90);
 assert.equal(api.normalize('women’s'),api.normalize("women's"));
 assert.notEqual(api.normalize('its'),api.normalize("it's"));
 const missingTile=structuredClone(published);missingTile.questions.find(q=>q.id==='q47').tokens.pop();assert.throws(()=>api.validate(missingTile),/tokens/);
 const impossible=structuredClone(published);impossible.questions.find(q=>q.id==='q32').accepted_answers.push('Major damage to city infrastructure is caused by earthquakes.');
 assert.throws(()=>api.validate(impossible),/tokens/);
 const duplicate=structuredClone(published);duplicate.units[0].lessons.push(duplicate.units[0].lessons[0]);assert.throws(()=>api.validate(duplicate),/Duplicate/);
});

test('manifest replaces the topic map and all seven enriched lessons have retrieval practice',async()=>{
 const {api}=await fixture({course:publishedCourse});
 const ids=['u1-l1','u7-l1','u8-l1','u9-l2','u10-l2','u11-l2','u11-l3'];
 assert.equal(publishedCourse.manifest.lessons.length,32);
 for(const id of ids){const questions=publishedCourse.questions.filter(q=>q.lesson_id===id);assert.ok(questions.length>=6,id);assert.ok(questions.filter(q=>q.type!=='multiple_choice').length>=2,id)}
 for(const row of publishedCourse.manifest.lessons){assert.ok(row.topic&&row.objective);assert.equal(api.questionsFor(row.id)[0]?.topic,row.topic)}
});

test('broken choices, answer keys, references and manifest are rejected',async()=>{
 const {api}=await fixture();
 for(const change of [
  d=>{d.questions[0].options[1]=d.questions[0].options[0]},
  d=>{d.questions[0].accepted_answers.push('not offered')},
  d=>{d.questions[0].unit_id='wrong'},
  d=>{d.manifest.lessons[0].topic=''},
  d=>{d.questions[0].canonical_id=d.questions[1].canonical_id}
 ]){const broken=structuredClone(publishedCourse);change(broken);assert.throws(()=>api.validate(broken))}
});

test('option order is stable per owner and canonical progress keys survive the new manifest',async()=>{
 const {api,window,tracks}=await fixture();
 const original=publishedCourse.questions[0];const q=api.questionsFor(original.lesson_id)[0];
 assert.equal(q.id,original.canonical_id);
 assert.deepEqual(api.optionsFor(q,'owner-a'),api.optionsFor(q,'owner-a'));
 assert.deepEqual(new Set(api.optionsFor(q,'owner-a')),new Set(q.options));
 assert.ok(['owner-b','owner-c','owner-d','owner-e','owner-f'].some(id=>JSON.stringify(api.optionsFor(q,id))!==JSON.stringify(api.optionsFor(q,'owner-a'))));
 await api.start();assert.equal(api.currentQuestion().id,original.canonical_id);
 api.respond(api.currentQuestion().answer);assert.equal(tracks[0].id,original.canonical_id);
 window.ENGOPLAY.stats=()=>({answeredKeys:new Set([original.canonical_id])});
 assert.match(api.html(),/1\/2 distinct questions answered/);
});
