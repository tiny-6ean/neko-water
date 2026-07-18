const CACHE_NAME = "neko-water-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./water192.png",
  "./water512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
