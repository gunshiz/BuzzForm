i = location.hostname;
self.addEventListener("install", (e) => {
  self.skipWaiting(),
    e.waitUntil(
      caches
        .open(i)
        .then((e) =>
          e.addAll([
            "/",
            "/index.html",
            "/favicon.webp",
            "/style.css",
            "/form.js",
          ])
        )
    );
}),
  self.addEventListener("fetch", (e) => {
    if (e.request.url.includes("/api/submit"))
      return e.stopImmediatePropagation(), void e.respondWith(fetch(e.request));
    e.respondWith(
      caches.match(e.request).then((t) => {
        const s = fetch(e.request).then((t) =>
          caches.open(i).then((s) => (s.put(e.request, t.clone()), t))
        );
        return t || s;
      })
    );
  }),
  self.addEventListener("activate", (e) => {
    e.waitUntil(clients.claim());
  });
