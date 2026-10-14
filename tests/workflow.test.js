import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('dependency links reject self references and indirect cycles',()=>{const c={window:{addEventListener(){}},document:{addEventListener(){}},setInterval(){}};vm.createContext(c);vm.runInContext(fs.readFileSync('workflow-v21.js','utf8'),c);const a=c.window.SERAG_WORKFLOW;assert.equal(a.wouldCycle({},'a','a'),true);assert.equal(a.wouldCycle({b:{depends:['c']},c:{depends:['a']}},'a','b'),true);assert.equal(a.wouldCycle({b:{depends:['c']}},'a','b'),false)});
test('goal milestones count explicit results, never visits or duplicate task links',()=>{const c={window:{addEventListener(){}},document:{addEventListener(){}},setInterval(){}};vm.createContext(c);vm.runInContext(fs.readFileSync('workflow-v21.js','utf8'),c);const a=c.window.SERAG_WORKFLOW,g={document:{milestones:[{done:true},{done:false}],tracks:[{taskIds:['one','one']},{taskIds:['one']}]}};assert.equal(a.progress(g).done,1);assert.equal(a.progress(g).total,2);assert.equal(a.progress({document:{milestones:[]}}).total,0);assert.equal(a.linked(g).length,0)});
