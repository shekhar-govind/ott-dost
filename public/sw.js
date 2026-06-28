// OTT Dost service worker.
//
// Purpose today: exist with a real `fetch` handler so Chromium browsers treat
// the app as installable and surface the automatic install prompt.
//
// It intentionally does NO caching. Navigations go straight to the network and
// every other request (images, assets, API) falls through to the browser's
// default handling and existing HTTP cache.
//
// Bump SW_VERSION whenever the worker's behavior changes so clients update.
const SW_VERSION = "v1";

self.addEventListener("install", () => {
  // Activate this worker immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of open clients as soon as the worker activates.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // ---------------------------------------------------------------------------
  // CACHING EXTENSION POINT
  // Add runtime caching strategies here later (e.g. cache-first for TMDB
  // images, stale-while-revalidate for API data). Until then we only handle
  // navigations with a plain network fetch, which is enough to qualify as a
  // real fetch handler for installability.
  // ---------------------------------------------------------------------------
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
  }
});
