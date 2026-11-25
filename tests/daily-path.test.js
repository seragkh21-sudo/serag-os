import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function app(){
 const calls=[],store=new Map();
 const c={user:{id:'owner-a'},Intl,Date,Math,document:{addEventListener(){},querySelectorAll(){return []},getElementById(){return null}},
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval(){},addEventListener(){},
  showPage:p=>calls.push(p)};
 c.window=c;vm.createContext(c);
 for(const file of ['english-content-v9.js','english-phrases-v16.js','word-practice-v21.js','english-daily-path-v1.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
 let level='B1';
 c.SERAG_ACADEMY_V12={homeState:()=>({level}),questions:()=>[],open:tab=>calls.push(tab)};
 c.ENGOPLAY={isReady:true,track(){},stats:()=>({today:{answers:2,goal:5}})};
 return {c,api:c.SERAG_WORD_PRACTICE,plan:c.SERAG_DAILY_PATH,calls,setLevel:l=>level=l};
}

test('daily plan uses actual history, exposes one primary action and explains the route',()=>{
 const {plan,c}=app();
 assert.equal(plan.model().answers,2);
 assert.equal(plan.model().action,'Start today’s practice');
 assert.equal((plan.html().match(/data-ep-daily/g)||[]).length,1);
 assert.match(plan.html(),/separate recall session/);
 c.ENGOPLAY.stats=()=>({today:{answers:5,goal:5}});
 assert.equal(plan.model().action,'Start optional practice');
 c.ENGOPLAY.isReady=false;
 assert.equal(plan.model().ready,false);
 assert.equal(plan.model().answers,0);
});

test('daily pause/resume keeps the same question and does not create or answer a new session',()=>{
 const {api,plan,calls}=app();
 api.startJourney([],'Today’s practice',[],true);
 const first=api.currentQuestion();
 api.respond(first.answer);api.next();
 const next=api.currentQuestion(),before=JSON.stringify(api.progress());
 assert.equal(api.dailyStatus().completed,1);
 assert.equal(api.pauseDaily(),true);
 assert.equal(calls.at(-1),'overview');
 assert.equal(plan.model().action,'Continue session');
 assert.equal(api.resumeDaily(),true);
 assert.equal(api.currentQuestion(),next);
 assert.equal(JSON.stringify(api.progress()),before);
 assert.deepEqual(calls.slice(-2),['engoplay','mixed']);
 assert.match(api.html(),/edp-session-guide/);
});

test('account, level and Cairo date changes cannot resume an old daily session',()=>{
 const {api,c,setLevel}=app();api.startJourney([],'Today’s practice',[],true);
 assert.ok(api.dailyStatus());
 c.user={id:'owner-b'};assert.equal(api.dailyStatus(),null);assert.equal(api.resumeDaily(),false);
 c.user={id:'owner-a'};setLevel('B2');assert.equal(api.resumeDaily(),false);
 setLevel('B1');const RealDate=Date;const tomorrow=Date.now()+86400000;
 c.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[tomorrow]))}static now(){return tomorrow}};
 assert.equal(api.resumeDaily(),false);
});

test('completed daily sessions expose result and review without claiming mastery',()=>{
 const {api,plan}=app();api.startJourney([],'Today’s practice',[],true);
 for(let i=0;api.currentQuestion()&&i<100;i++){api.reveal();api.next()}
 assert.equal(api.dailyStatus().complete,true);
 assert.equal(plan.model().action,'See session result');
 assert.match(api.html(),/Back to daily plan/);
 assert.match(api.html(),/data-ep-review/);
 assert.match(api.html(),/not mastery or a CEFR level/);
});

test('ordinary word practice is not offered as a resumable daily plan',()=>{
 const {api}=app();api.start('catch up');assert.equal(api.dailyStatus(),null);assert.equal(api.resumeDaily(),false);
});

test('both entry points render the same daily plan and startDaily tries resume before selection',()=>{
 for(const file of ['english-academy-v12.js','engoplay-v19.js'])assert.ok(fs.readFileSync(file,'utf8').includes('SERAG_DAILY_PATH?.html()'));
 assert.match(fs.readFileSync('engoplay-v19.js','utf8'),/function startDaily\(\)\{[\s\S]*?if\(window.SERAG_WORD_PRACTICE\?\.resumeDaily\?\.\(\)\)return/);
});


test('empty daily pools do not report completion or invent progress',()=>{
 const {api,c,plan}=app();
 c.SERAG_PRACTICE_STATE={pool:()=>[],wordLast:()=>0};
 api.startJourney([],"Today’s practice",[],true);
 assert.equal(api.dailyStatus().empty,true);
 assert.equal(api.dailyStatus().complete,false);
 assert.equal(plan.model().action,'See available options');
 assert.doesNotMatch(plan.html(),/Session finished/);
});

test('history failure blocks resume and signed-out plans expose no prior answer count',()=>{
 const {api,c,plan}=app();api.startJourney([],"Today’s practice",[],true);
 c.ENGOPLAY.isReady=false;assert.equal(api.resumeDaily(),false);
 c.user=null;c.ENGOPLAY.isReady=true;assert.equal(plan.model().ready,false);assert.equal(plan.model().answers,0);
});
