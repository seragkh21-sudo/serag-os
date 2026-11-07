/* Snapshot public curriculum definitions for fast offline/server lookups. */
import fs from 'node:fs/promises';
import {loadFiles} from '../english-harness.mjs';
import {publicJSON,wiktionaryEntries} from '../lib/english-public-data.js';
const {ctx,errors}=loadFiles(process.cwd(),['english-content-v9.js','english-vocab-v24.js','english-expansion-v1.js','english-phrases-v16.js','word-practice-v21.js']);
if(errors.length)throw Error(JSON.stringify(errors));
const file='data/english-dictionary-v1.json';let data=JSON.parse(await fs.readFile(file,'utf8'));
let count=0,missing=0;const words=ctx.SERAG_WORD_PRACTICE.items().map(w=>w.phrase.toLowerCase());
for(let i=0;i<words.length;i+=3){
 await Promise.all(words.slice(i,i+3).map(async word=>{
  if(data.entries[word])return;
  try{const rows=wiktionaryEntries(await publicJSON('https://freedictionaryapi.com/api/v1/entries/en/'+encodeURIComponent(word),10000));if(rows.length){data.entries[word]=rows;count++}else missing++}catch{missing++}
 }));
 data.updatedAt=new Date().toISOString();await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
 if(i%30===0)console.log('Dictionary: '+Object.keys(data.entries).length+' saved; '+missing+' unavailable.');
 await new Promise(resolve=>setTimeout(resolve,600));
}
console.log('Complete: '+Object.keys(data.entries).length+' dictionary terms; '+missing+' unavailable.');
