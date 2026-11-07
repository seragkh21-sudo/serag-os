/* Generate public curriculum audio once; never sends account text to a provider. */
import {KokoroTTS} from 'kokoro-js';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {loadFiles} from '../english-harness.mjs';
const args=process.argv.slice(2),accent=args.includes('--uk')?'uk':'us',voice=accent==='uk'?'bf_emma':'af_heart';
const folder='assets/english-audio',normal=s=>String(s||'').replace(/\s+/g,' ').trim();
const {ctx,errors}=loadFiles(process.cwd(),['english-content-v9.js','english-vocab-v24.js','english-expansion-v1.js','english-phrases-v16.js','word-practice-v21.js']);
if(errors.length)throw Error(JSON.stringify(errors));
const items=ctx.SERAG_WORD_PRACTICE.items();
const list=[...items.map(w=>w.phrase),...ctx.SERAG_ENGLISH_EXPANSION_V1.questions.map(q=>q.prompt.replace('___',q.answer))];
const texts=[...new Set(list.map(normal))];
if(args.includes('--list')){console.log(JSON.stringify(texts));process.exit(0)}
await fs.mkdir(folder,{recursive:true});
const file=folder+'/catalog.json';let catalog;
try{catalog=JSON.parse(await fs.readFile(file,'utf8'))}catch{catalog={version:1,model:'onnx-community/Kokoro-82M-v1.0-ONNX',license:'Apache-2.0',source:'https://huggingface.co/hexgrad/Kokoro-82M',voices:{us:'af_heart',uk:'bf_emma'},clips:{}}}
let model;let count=0;
for(const text of texts){
 const key=accent+'|'+text;if(catalog.clips[key]){try{await fs.access('.'+catalog.clips[key]);continue}catch{}}
 model ||= await KokoroTTS.from_pretrained(catalog.model,{dtype:'q8',device:'cpu'});
 const hash=crypto.createHash('sha256').update(key).digest('hex').slice(0,24),wav=folder+'/'+hash+'.wav',mp3=folder+'/'+hash+'.mp3';
 const audio=await model.generate(text,{voice,speed:1});await audio.save(wav);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',wav,'-codec:a','libmp3lame','-b:a','64k',mp3],{stdio:'pipe'});
 await fs.unlink(wav);catalog.clips[key]='/'+mp3;
 await fs.writeFile(file,JSON.stringify(catalog,null,2)+'\n');
 if(++count%10===0)console.log('Generated '+count+' clips; catalog '+Object.keys(catalog.clips).length+'/'+texts.length);
}
console.log('Complete: '+Object.keys(catalog.clips).length+' public clips.');
