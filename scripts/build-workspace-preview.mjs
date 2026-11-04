/* Build the safe fixture page from the same HTML transform as production. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
let captured='';
const source=fs.readFileSync('app-bootstrap.js','utf8');
const legacy=fs.readFileSync('legacy.html','utf8');
const marker=new Error('preview HTML captured');
await vm.runInNewContext(source,{
  fetch:async()=>({ok:true,text:async()=>legacy}),
  DOMParser:class {parseFromString(html){captured=html;throw marker}},
  document:{body:{innerHTML:''}},console:{error(e){if(e!==marker)throw e}}
});
if(!captured)throw Error('Bootstrap did not generate the workspace HTML');
const version=source.match(/const V='(\d+)'/)[1];
captured=captured.replace(/<script[^>]+src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js[^>]*><\/script>/,
  `<script src="/workspace-preview-v18.js?v=${version}"></script>`);
if(captured.includes('src="https://cdn.jsdelivr.net/npm/@supabase/'))throw Error('Real Supabase SDK must not run in fixtures');
captured=captured.replace('</head>','<meta name="robots" content="noindex"></head>');
fs.writeFileSync('workspace-preview-content.html',captured);
// Preserve existing external script sources and hashes; only add hashes actually needed by this build.
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const inline=[...captured.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const group of config.headers)for(const header of group.headers){
  if(header.key!=='Content-Security-Policy')continue;
  for(const script of inline){const hash="'sha256-"+crypto.createHash('sha256').update(script).digest('base64')+"'";
    if(!header.value.includes(hash))header.value=header.value.replace('script-src ','script-src '+hash+' ');
  }
}
fs.writeFileSync('vercel.json',JSON.stringify(config,null,2)+'\n');
console.log(`Preview matches production build ${version}; ${inline.length} inline scripts covered by CSP.`);
