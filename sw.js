let cache = "cachePWA";
let filesToCache = ["/", "/js/main.js", "js/general.js", "css/styles.css"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches
      .open(cache)
      .then(cache => cache.addAll(filesToCache))
      .catch(console.log)
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches
      .match(e.request, { ignoreSearch: true })
      .then(response => response || fetch(e.request))
  );
});
