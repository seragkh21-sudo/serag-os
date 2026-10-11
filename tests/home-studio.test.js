import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function module(){const c={window:{},document:{readyState:'loading',addEventListener(){},getElementById(){return null}},setTimeout(){},Intl,Date};vm.createContext(c);vm.runInContext(fs.readFileSync('home-studio-v18.js','utf8'),c);return c.window.SERAG_HOME_V18}
test('weekly activity compares distinct days and honors Cairo midnight',()=>{
 const m=module(),now=new Date('2026-10-11T22:30:00Z');assert.equal(m.dateKey(now),'2026-10-12');assert.equal(m.lastDays(now)[0],'2026-10-06');
 const d={tasks:[{category:'work',status:'done',updated_at:'2026-10-09T09:00:00Z'},{category:'creative',status:'done',updated_at:'2026-10-09T15:00:00Z'},{category:'general',status:'done',updated_at:'2026-10-10T09:00:00Z'}],work:[{id:'p',updated_at:'2026-10-08T12:00:00Z'}],creative:[],sessions:[{updated_at:'2026-10-08T14:00:00Z'}],workouts:[{workout_date:'2026-10-07'}],quiz:[{attempt_date:'2026-10-12',is_correct:true}]};
 const local={attempts:[{at:+new Date('2026-10-11T22:20:00Z'),correct:true},{date:'2026-10-12',correct:false},{date:'2026-09-01',correct:true}]};
 const x=m.model(d,local,now);assert.equal(x.sets.english.size,1);assert.equal(x.sets.studio.size,2);assert.equal(x.sets.fitness.size,1);assert.equal(x.active.size,4);assert.equal(x.finished,2);assert.equal(x.answers,3);assert.equal(x.accuracy,67);
});
test('both project sources share one list and studio tasks include both types',()=>{
 const m=module();const x=m.model({work:[{id:'client',status:'active'}],creative:[{id:'personal',status:'done'}],tasks:[{id:'creativeTask',category:'creative',priority:'high',status:'open'},{id:'workTask',category:'work',priority:'urgent',status:'open'},{id:'projectTask',category:'general',parent_type:'creative',status:'open'},{id:'unrelated',category:'fitness',status:'open'}]});
 assert.deepEqual(Array.from(x.projects,p=>p.kind),['work','creative']);assert.deepEqual(Array.from(x.important,t=>t.id),['workTask','creativeTask','projectTask']);assert.equal(m.model({}).accuracy,null);
});
test('new home answer updates the same academy history and rejects invalid options',()=>{
 const events={},store=new Map(),root={innerHTML:'',addEventListener(k,f){events[k]=f},querySelector(){return null},scrollIntoView(){}};
 let tick;const c={window:{addEventListener(){}},document:{addEventListener(){},createElement(){return root},querySelector(s){if(s==='.el9-hub')return {prepend(){}};if(s==='#ea12Center')return root.innerHTML?root:null;return null},querySelectorAll(){return []}},setInterval(f){tick=f},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};
 vm.createContext(c);for(const f of ['english-grammar-v10.js','english-supplement-v13.js','english-levels-v14.js','english-academy-v12.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);tick();
 const a=c.window.SERAG_ACADEMY_V12,q=a.homeQuestion();assert.ok(q);assert.equal(a.homeAnswer(q.id,'NOT AN OPTION'),null);assert.equal(a.homeState().attempts.length,0);const result=a.homeAnswer(q.id,q.answer);assert.equal(result.correct,true);assert.equal(a.homeState().attempts.length,1);assert.equal(JSON.parse(store.get('seragAcademyV12:guest')).attempts[0].id,q.id);assert.notEqual(a.homeQuestion().id,q.id);assert.equal(a.open('grammar'),true);
});
