const CACHE='between-lines-ec06c148f954de47';
const FILES=["./", "./index.html", "./build/site-797bb028178314ce.js", "./build/site-1e4866e57a4bc77e.css", "./assets/city.png", "./assets/moon.png", "./assets/summer.png", "./assets/salon.png", "./assets/audio/riviera.wav", "./assets/audio/mercato.wav", "./assets/audio/shore.wav", "./assets/story-props/contract.webp", "./assets/story-props/manuscript.webp", "./assets/story-props/market.webp", "./assets/story-props/notebook.webp", "./assets/story-props/pass.webp", "./assets/story-props/portrait.webp", "./assets/story-props/poster.webp", "./assets/story-props/ticket.webp", "./assets/story-props/vendor.webp", "./assets/full-length/bianchi.webp", "./assets/full-length/coral.webp", "./assets/full-length/couture.webp", "./assets/full-length/friend.webp", "./assets/full-length/ivory.webp", "./assets/full-length/kirill.webp", "./assets/full-length/linen.webp", "./assets/full-length/marta.webp", "./assets/full-length/producer.webp", "./assets/full-length/rose.webp", "./assets/full-length/sasha.webp", "./assets/full-length/silk.webp"];
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
