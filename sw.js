const CACHE='serag-os-static-v18';
const STATIC=['/icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('serag-os-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  // Never cache API responses, credentials, audio or user documents.
  if(!STATIC.includes(url.pathname))return;
  event.respondWith(fetch(event.request).then(async response=>{
    if(response.ok){
      const cache=await caches.open(CACHE);
      await cache.put(event.request,response.clone());
    }
    return response;
  }).catch(()=>caches.match(event.request)));
});
