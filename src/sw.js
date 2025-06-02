/**
 * @file Service Worker script for caching assets, handling fetch events,
 * activating new service worker versions, and displaying push notifications.
 *
 * @module sw
 * @type {ServiceWorkerGlobalScope}
 *
 * @description
 * This service worker:
 * - Caches essential assets during the install event.
 * - Intercepts fetch requests to serve cached responses and update the cache.
 * - Claims clients immediately upon activation.
 * - Listens for push events to display notifications.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 * @see https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
 *
 * @typedef {ServiceWorkerGlobalScope} Window
 */
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

// Front-end **Service Worker** listening for events
self.addEventListener("push", (event) => {
  const data = event.data.json(); // Payload from the server, assumed to be in JSON format
  const icon = "https://buzz.gunshiz.top/favicon.webp";

  event.waitUntil(
    // Upon receiving the push event, call **Notifications API** to push the notification
    self.registration.showNotification(
      data.title ? data.title : "New Submission Received",
      {
        body: data.body,
        badge: icon,
        icon,
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
        // data: { use_to_open_specific_page: data.props }, // Custom data sent from the server
      }
    )
  );
});
