/* Dialln Converter — offline cache */
const VER='dialln-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
const ENGINE_HOSTS=['cdn.jsdelivr.net','cdnjs.cloudflare.com','staticimgly.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // app shell: network first (so updates arrive), fall back to cache when offline
    e.respondWith(fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(VER).then(c=>c.put(req,cp))}return res}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  }else if(ENGINE_HOSTS.includes(url.hostname)){
    // optional engines (AI background remover, OCR, HEIC): cache after first download so they work offline later
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.status===200){const cp=res.clone();caches.open(VER+'-engines').then(c=>c.put(req,cp))}return res})));
  }
});
