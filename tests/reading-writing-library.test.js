import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function context(){const c={window:{},document:{addEventListener(){}},setInterval(){return 0},URL,Date,Math};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('english-content-v9.js','utf8'),c);vm.runInContext(fs.readFileSync('english-writing-v13.js','utf8'),c);return c;}
test('reading library has enough articles and complete comprehension sets where quizzes are provided',()=>{const c=context(),articles=c.SERAG_ENGLISH_V9.articles;assert.ok(articles.length>=26);assert.equal(new Set(articles.map(a=>a.title)).size,articles.length);const quizzed=articles.filter(a=>a.checks?.length);assert.ok(quizzed.length>=12);for(const a of articles){assert.ok(a.text.length>250,a.title);assert.ok(a.answer&&a.question,a.title)}for(const a of quizzed){assert.ok(a.checks.length>=2,a.title);for(const q of a.checks){assert.equal(q[1].length,3,a.title);assert.ok(q[1][q[2]],a.title)}}});
test('Writing Lab drills stay selectable and have tasks, checklists and examples',()=>{const c=context(),drills=c.SERAG_WRITING_V13.drills;assert.ok(drills.length>=12);assert.equal(new Set(drills.map(d=>d.id)).size,drills.length);for(const d of drills){assert.ok(d.prompt&&d.steps?.length&&d.checks?.length&&d.model,d.id);}});

test('PDF library catalog contains the books, uses private storage and scopes every query to the user',()=>{const app=fs.readFileSync('english-pdf-library-v1.js','utf8');assert.equal((app.match(/filename:'/g)||[]).length,20);assert.match(app,/serag-attachments/);assert.match(app,/eq\('user_id',id\)/);assert.match(app,/createSignedUrl/);assert.match(app,/\.upload\(/);assert.match(app,/data-ea-pdf-files/);assert.match(app,/multiple/);});

test('guided Writing Lab renders clear steps, a planning box and a reflection field',()=>{const c=context();for(const f of ['english-writing-flow-v1.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const state={writingDrill:'opinion',notes:{},writingChecks:{}};const html=c.SERAG_WRITING_V13.html(state,s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])));assert.match(html,/data-ea-writing-stage/);assert.match(html,/ea13-stepper/);assert.match(html,/writing-plan:opinion/);assert.match(html,/writing-reflection:opinion/);assert.match(html,/ea13-review-box/);});

test('reading completion persists across dates and can be restored from saved daily entries',()=>{const source=fs.readFileSync('english-learning-v6.js','utf8');assert.match(source,/seragReadingProgressV1/);assert.match(source,/function completedArticles\(\)/);assert.match(source,/function completeArticle\(title\)/);assert.match(source,/archive\|\|\[\]/);});

test('Reading Studio does not loop renders when its active tab changes the observed DOM',()=>{
 const source=fs.readFileSync('english-reading-studio-v2.js','utf8');
 let activeReading=false,hasDialog=false,observerCallback=null,renderCount=0;
 const grid={};
 Object.defineProperty(grid,'innerHTML',{set(){renderCount++;if(observerCallback)observerCallback([])}});
 const studioRoot={};
 const dialog={addEventListener(){}};
 const document={
  readyState:'complete',
  body:{classList:{toggle(){}},insertAdjacentHTML(){hasDialog=true}},
  querySelector(selector){
   if(selector==='#ersStudio')return studioRoot;
   if(selector==='#ea12Center [data-ea-tab="reading"][aria-pressed="true"]')return activeReading?{}:null;
   if(selector==='#ersEditorDialog')return hasDialog?dialog:null;
   if(selector==='#ersGrid')return grid;
   return null;
  },
  querySelectorAll(){return []},
  addEventListener(){}
 };
 class FakeMutationObserver{
  constructor(callback){observerCallback=callback}
  observe(){}
  disconnect(){}
 }
 const c={window:{},document,localStorage:{getItem(){return null},setItem(){}},MutationObserver:FakeMutationObserver,setInterval(){return 0},clearInterval(){},Date,Math,URL,console};
 c.window=c;c.window.addEventListener=()=>{};
 vm.createContext(c);
 vm.runInContext(source,c,{filename:'english-reading-studio-v2.js'});
 activeReading=true;
 observerCallback([]);
 assert.equal(renderCount,1,'entering Reading should render the library once');
 observerCallback([]);
 assert.equal(renderCount,1,'the observer must not trigger another render of its own DOM changes');
});
