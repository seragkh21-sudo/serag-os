import {build} from 'esbuild';
import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('assets/importer',{recursive:true});
await build({entryPoints:['import-src/extract.js'],outfile:'assets/importer/extract.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});
await build({entryPoints:['import-src/browser.js'],outfile:'assets/importer/ui.js',bundle:true,format:'iife',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','assets/importer/pdf.worker.min.mjs');
await copyFile('node_modules/pdfjs-dist/LICENSE','assets/importer/PDFJS-LICENSE.txt');

for(const dir of ['cmaps','standard_fonts','wasm'])await cp('node_modules/pdfjs-dist/'+dir,'assets/importer/'+dir,{recursive:true});
await copyFile('node_modules/@babel/parser/LICENSE','assets/importer/BABEL-LICENSE.txt');
await copyFile('node_modules/papaparse/LICENSE','assets/importer/PAPAPARSE-LICENSE.txt');
