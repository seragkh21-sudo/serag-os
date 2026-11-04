import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function app(){
 const store=new Map(),events={},tracked=[];
 const c={user:{id:'user-a'},window:{addEventListener(){}},document:{addEventListener:(name,fn)=>(events[name]??=[]).push(fn),querySelectorAll:()=>[],getElementById:()=>null},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval(){},Date,Math};
 c.addEventListener=()=>{};c.window=c;c.ENGOPLAY={track:row=>tracked.push(row),stats:()=>({answeredToday:new Set()})};
 vm.createContext(c);
 for(const file of ['english-content-v9.js','english-phrases-v16.js','engoplay-open-interactions-v1.js','engoplay-quests-v1.js','word-practice-v21.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
 c.SERAG_ACADEMY_V12={questions:()=>[],selectQuestions:(rows,_kind,count)=>rows.slice(0,count),homeAnswer(){}};
 return {c,api:c.SERAG_WORD_PRACTICE,events,tracked,store};
}

test('open interaction adapters build matching and sentence-correction drills from first-party content',()=>{
 const {c}=app(),items=c.SERAG_WORD_PRACTICE.items().slice(0,4),adapter=c.SERAG_ENGOPLAY_INTERACTIONS_V1;
 const match=adapter.matching(items),correction=adapter.correction({id:'grammar:test',prompt:'She ___ to work every day.',answer:'goes',options:['go','goes']});
 assert.equal(match.kind,'match');assert.equal(match.pairs.length,4);assert.equal(new Set(match.pairs.map(x=>adapter.normalize(x.phrase))).size,4);
 assert.equal(correction.incorrectSentence,'She go to work every day.');assert.equal(correction.answer,'goes');assert.ok(correction.options.includes(correction.answer));
 assert.equal(adapter.correction({prompt:'No blank here',answer:'yes',options:['no','yes']}),null);
});

test('matching is added to mixed EngoPlay rounds and records each owner-scoped pair after completion',()=>{
 const {api,c,tracked,store}=app();
 c.SERAG_ACADEMY_V12={questions:()=>[],selectQuestions:(rows,_kind,count)=>rows.slice(0,count),homeAnswer(){}};
 const round=api.buildRound(api.items().slice(0,4),[],4,[],true);
 assert.equal(round.filter(q=>q.kind==='match').length,1);
 api.startJourney([],"Today's practice",[],true);
 while(api.currentQuestion()?.kind!=='match'){api.reveal();api.next()}
 let q=api.currentQuestion();assert.match(api.html(),/wp-match-grid/);assert.equal(q.pairs.length,4);
 api.chooseMatchWord(0);assert.equal(api.chooseMatchMeaning((0+1)%4),false);assert.equal(api.currentQuestion().kind,'match');
 for(let index=0;index<4;index++){api.chooseMatchWord(index);api.chooseMatchMeaning(index)}
 assert.match(api.html(),/Matched\. Review the pairs you missed/);assert.equal(tracked.length,0); // an imperfect round is practice, not an independent success
 const saved=JSON.parse(store.get('seragSentenceV21:user-a'));
 assert.equal(Object.values(saved).filter(x=>x.last_stage==='match').length,4);
 assert.ok(Object.values(saved).every(x=>x.last_assisted===true));
});

test('grammar correction questions keep the source grammar question identity and appear as a distinct format',()=>{
 const {api,c}=app();
 const grammar={id:'grammar:present-simple',answer:'goes',prompt:'She ___ to work every day.',options:['go','goes'],explanation:'Use -s with a singular third-person subject.'};
 c.SERAG_ACADEMY_V12={questions:()=>[grammar],selectQuestions:rows=>rows};
 const round=api.buildRound(api.items().slice(0,4),[grammar],4,[],true),correction=round.find(q=>q.kind==='correction');
 assert.ok(correction);assert.equal(correction.grammar.id,grammar.id);assert.equal(correction.incorrectSentence,'She go to work every day.');
});

test('the shared practice UI renders a broken sentence and routes its correction to grammar history',()=>{
 const {api,c}=app(),answered=[];
 const grammar={id:'grammar:present-simple',answer:'goes',prompt:'She ___ to work every day.',options:['go','goes'],explanation:'Use -s with a singular third-person subject.'};
 c.SERAG_ACADEMY_V12={questions:()=>[grammar],selectQuestions:rows=>rows,homeAnswer:(id,value)=>answered.push([id,value])};
 api.startJourney([grammar.id],'Grammar practice');
 while(api.currentQuestion()?.kind!=='correction'){
  if(api.currentQuestion()?.kind==='match')for(let index=0;index<4;index++){api.chooseMatchWord(index);api.chooseMatchMeaning(index)}
  else api.reveal();
  api.next();
 }
 assert.match(api.html(),/Fix the grammar mistake/);assert.match(api.html(),/She go to work every day/);
 api.respond('goes');assert.deepEqual(answered.at(-1),[grammar.id,'goes']);
});
