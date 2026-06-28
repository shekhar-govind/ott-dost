// OTT Dost service worker.
//
// Purpose today: exist with a `fetch` handler so Chromium browsers can treat
// the app as installable, WITHOUT intercepting any requests.
//
// History: a previous version proxied navigations via
// `event.respondWith(fetch(event.request))`. Because a service worker is sticky
// and keeps controlling pages, a single failed/redirected navigation fetch
// could wedge the worker and leave users staring at a blank screen until they
// fully restarted the browser. This version never calls `respondWith`, so it
// cannot break navigations or any other request — the browser handles
// everything natively.
//
// Bumping SW_VERSION changes the file bytes, which is what makes browsers pick
// up a new worker; combined with skipWaiting + clients.claim below, the safe
// worker immediately replaces any previously wedged one.
const SW_VERSION = "v2";

self.addEventListener("install", () => {
  // Activate this worker immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of open clients at once so a stuck old worker is replaced.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally a no-op. The handler exists for installability, but we never
  // call event.respondWith — every request goes to the browser's default
  // handling and existing HTTP cache. Caching strategies could be added here
  // later, but only with thorough testing given the wedging risk above.
});
