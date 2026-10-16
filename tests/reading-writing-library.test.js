import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function context(){const c={window:{},document:{addEventListener(){}},setInterval(){return 0},URL,Date,Math};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('english-content-v9.js','utf8'),c);vm.runInContext(fs.readFileSync('english-writing-v13.js','utf8'),c);return c;}
test('reading library has enough original articles with complete comprehension questions',()=>{const c=context(),articles=c.SERAG_ENGLISH_V9.articles;assert.ok(articles.length>=20);assert.equal(new Set(articles.map(a=>a.title)).size,articles.length);for(const a of articles){assert.ok(a.text.length>250,a.title);assert.ok(a.answer&&a.question,a.title);assert.ok(a.checks.length>=2,a.title);for(const q of a.checks){assert.equal(q[1].length,3,a.title);assert.ok(q[1][q[2]],a.title)}}});
test('Writing Lab drills stay selectable and have tasks, checklists and examples',()=>{const c=context(),drills=c.SERAG_WRITING_V13.drills;assert.ok(drills.length>=12);assert.equal(new Set(drills.map(d=>d.id)).size,drills.length);for(const d of drills){assert.ok(d.prompt&&d.steps?.length&&d.checks?.length&&d.model,d.id);}});

test('PDF library catalog contains the books, uses private storage and scopes every query to the user',()=>{const app=fs.readFileSync('english-pdf-library-v1.js','utf8');assert.equal((app.match(/filename:'/g)||[]).length,20);assert.match(app,/serag-attachments/);assert.match(app,/eq\('user_id',id\)/);assert.match(app,/createSignedUrl/);assert.match(app,/\.upload\(/);assert.match(app,/data-ea-pdf-files/);assert.match(app,/multiple/);});
