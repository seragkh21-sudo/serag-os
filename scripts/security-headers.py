"""Regenerate CSP hashes after changing inline HTML or shell boot scripts."""
from pathlib import Path
import re,hashlib,base64,json
hashes=set()
for p in [*Path('.').glob('*.html'),Path('shell-loader.js')]:
 for attrs,script in re.findall(r'<script([^>]*)>(.*?)</script>',p.read_text(),re.S|re.I):
  if not re.search(r'\bsrc\s*=',attrs) and script.strip():
   hashes.add("'sha256-"+base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()+"'")
v=json.loads(Path('vercel.json').read_text())
csp="; ".join(["default-src 'self'", "script-src 'self' https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0 "+' '.join(sorted(hashes)), "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:","media-src 'self' blob: https:","connect-src 'self' https://kdfbxcdxdhofqidczbot.supabase.co wss://kdfbxcdxdhofqidczbot.supabase.co", "frame-src https://www.youtube-nocookie.com", "font-src 'self' data:", "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'self'", "upgrade-insecure-requests"])
h=next(x['headers'] for x in v['headers'] if x['source']=='/(.*)')
extra={'Content-Security-Policy':csp,'X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), geolocation=(), microphone=(self)','Cache-Control':'no-store'}
h[:]=[x for x in h if x['key'] not in extra]+[{'key':k,'value':val} for k,val in extra.items()]
Path('vercel.json').write_text(json.dumps(v,indent=2)+'\n')
print('CSP generated for',len(hashes),'inline scripts')
