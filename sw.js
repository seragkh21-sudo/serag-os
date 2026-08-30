const CACHE='serag-os-v5';
const CORE=['/','/index','/manifest.webmanifest','/icon.svg','/styles.css','/app.js','/shell-loader.js','/dashboard-v2.css','/dashboard-v2.js','/english-v3.css','/english-v3.js','/english-audio-v4.css','/english-audio-v4.js','/microsoft-tts-v1.js','/serag-v5.css','/serag-v5.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))})
