import {parse} from '@babel/parser';
import Papa from 'papaparse';
import {collectRecords,textRecords} from '../lib/english-import-core.js';

function literal(node){
 if(!node)return undefined;
 if(['StringLiteral','NumericLiteral','BooleanLiteral'].includes(node.type))return node.value;
 if(node.type==='NullLiteral')return null;
 if(node.type==='TemplateLiteral'&&!node.expressions.length)return node.quasis.map(q=>q.value.cooked).join('');
 if(node.type==='ArrayExpression'){const result=node.elements.map(literal);if(result.some(x=>x===undefined))return undefined;return result}
 if(node.type==='ObjectExpression'){const result=Object.create(null);for(const prop of node.properties){if(prop.type!=='ObjectProperty'||prop.computed)return undefined;const key=prop.key.name??prop.key.value;if(['__proto__','constructor','prototype'].includes(key))return undefined;const value=literal(prop.value);if(value===undefined)return undefined;result[key]=value}return result}
 return undefined;
}
export function staticRecords(source){
 const ast=parse(source,{sourceType:'unambiguous',plugins:['jsx','typescript'],errorRecovery:false});const found=[];
 function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const value=literal(node);if(value&&(value.prompt||value.question||value.content||value.body||value.text)){found.push(value);return}}
  for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);
 }
 walk(ast);return collectRecords(found);
}
export async function extractFile(file,mode='auto',progress=()=>{}){
 const extension=file.name.split('.').at(-1).toLowerCase(),warnings=[];
 if(file.size>20*1024*1024)throw Error('Choose a file up to 20 MB.');
 if(!['pdf','txt','md','json','csv','js','jsx','tsx'].includes(extension))throw Error('Supported files: PDF, TXT, MD, JSON, CSV, JS, JSX and TSX.');
 if(extension==='pdf'){
  const {getDocument,GlobalWorkerOptions}=await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc='/assets/importer/pdf.worker.min.mjs';
  const loading=getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,enableXfa:false,disableFontFace:true,cMapUrl:'/assets/importer/cmaps/',standardFontDataUrl:'/assets/importer/standard_fonts/',wasmUrl:'/assets/importer/wasm/'});let document;
  try{document=await loading.promise;if(document.numPages>100)throw Error('Split this PDF into files of up to 100 pages.');const pages=[];
   for(let n=1;n<=document.numPages;n++){progress(`Reading page ${n}/${document.numPages}…`);const page=await document.getPage(n),content=await page.getTextContent();const text=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('').trim();pages.push({text,page:n});page.cleanup()}
   const readable=pages.filter(p=>p.text.length>=20);if(readable.length!==pages.length)warnings.push(`${pages.length-readable.length} pages had little or no extractable text; review them separately or run OCR first.`);
   if(!readable.length)throw Error('This PDF has no readable text. Run OCR first, then upload its searchable PDF or extracted text.');
   if(readable.reduce((n,p)=>n+p.text.length,0)>1000000)throw Error('Extracted text exceeds 1 MB. Split this document.');
   const allText=readable.map(p=>p.text).join('\n\n');
   if(mode==='article'||(mode==='auto'&&!/^\s*[A-D][).:]\s+.+/im.test(allText)))return {records:textRecords(allText,{mode:'article',filename:file.name}),warnings};
   // Parse across pages so a question and its choices can continue on the next page.
   const records=textRecords(allText,{mode:'questions',filename:file.name});
   let cursor=0;for(const record of records){const at=allText.indexOf(record.prompt.slice(0,30),cursor);if(at>=0){let offset=0;record.source_page=readable.find(p=>{offset+=p.text.length+2;return at<offset})?.page||null;cursor=at+1}}
   return {records,warnings};
  }finally{await loading.destroy()}
 }
 if(file.size>2*1024*1024)throw Error('Text/data files must be up to 2 MB.');
 const source=await file.text();let records;
 if(extension==='json')records=collectRecords(JSON.parse(source));
 else if(['js','jsx','tsx'].includes(extension))records=staticRecords(source);
 else if(extension==='csv'){
  const parsed=Papa.parse(source,{header:true,skipEmptyLines:'greedy',transformHeader:h=>h.replace(/^\uFEFF/,'').trim()});if(parsed.errors.length)throw Error('CSV columns could not be read. Check quotes and column counts.');
  records=parsed.data.map(row=>({...row,options:row.options?JSON.parse(row.options):['A','B','C','D'].map(k=>row[k]||row['option'+k]).filter(Boolean)}));
 }else records=textRecords(source,{mode,filename:file.name});
 return {records,warnings};
}
