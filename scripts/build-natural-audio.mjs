import {build} from 'esbuild';
import {mkdir,copyFile,readdir} from 'node:fs/promises';
const out='assets/natural-voice';
await mkdir(out,{recursive:true});
await build({entryPoints:['audio-src/natural-worker.js'],outfile:out+'/worker.js',bundle:true,format:'esm',platform:'browser',minify:true,legalComments:'eof'});
for(const name of await readdir('node_modules/onnxruntime-web/dist'))if(/^ort-wasm.*\.(wasm|mjs)$/.test(name))await copyFile('node_modules/onnxruntime-web/dist/'+name,out+'/'+name);
await copyFile('node_modules/kokoro-js/LICENSE',out+'/KOKORO-LICENSE.txt');

for(const [name,filename] of [['@huggingface/transformers','LICENSE'],['phonemizer','LICENSE'],['onnxruntime-web','LICENSE']]){try{await copyFile('node_modules/'+name+'/'+filename,out+'/'+name.replaceAll('/','-')+'-LICENSE.txt')}catch{}}
