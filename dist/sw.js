const CACHE='between-lines-93acb1159a931f7e';
const FILES=["./", "./index.html", "./build/site-36127c19199222a2.js", "./build/site-836b51f80544bd78.css", "./assets/city.png", "./assets/moon.png", "./assets/summer.png", "./assets/salon.png"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // Do not populate a new release from the browser's old HTTP cache.
 await Promise.all(FILES.map(async path=>{const response=await fetch(new Request(path,{cache:'reload'}));if(!response.ok)throw Error('Missing release file: '+path);await cache.put(path,response)}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Retain previously viewed art for offline reading while retiring old application code.
 const cache=await caches.open(CACHE);
 for(const key of await caches.keys())if(key.startsWith('between-lines-')&&key!==CACHE){const old=await caches.open(key);for(const request of await old.keys())if(new URL(request.url).pathname.includes('/assets/')){if(!await cache.match(request))await cache.put(request,await old.match(request))}await caches.delete(key)}
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const immutable=new URL(event.request.url).pathname.includes('/build/site-');
  if(immutable){const hit=await cache.match(event.request);if(hit)return hit}
  try{const response=await fetch(event.request,{cache:'no-cache'});if(response.ok)await cache.put(event.request,response.clone());return response}
  catch{const hit=await cache.match(event.request);if(hit)return hit;if(event.request.mode==='navigate'){const shell=await cache.match('./index.html');if(shell)return shell}return new Response('Offline resource unavailable',{status:503})}
 })());
});
