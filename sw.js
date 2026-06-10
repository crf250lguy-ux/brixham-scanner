const CACHE="bta-scanner-v3";
const ASSETS=[
  "./brixham-scanner.html",
  "./manifest.json"
];

// Install - cache core files
self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - serve from cache, fall back to network
self.addEventListener("fetch",e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(resp=>{
        // Cache new successful responses
        if(resp&&resp.status===200){
          const clone=resp.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request,clone));
        }
        return resp;
      }).catch(()=>cached);
    })
  );
});
