/* ═══════════════════════════════════════════════════════════════════════
   CHINA-EU FLOW ASCII · sw.js — service worker
   Makes the single-file ASCII data-viz installable and offline-capable.

   Deploy target: GitHub Pages PROJECT page (a SUBPATH), e.g.
   https://aaajiao.github.io/CHINA-EU-FLOW-ASCII/
   The SW is registered with a RELATIVE URL ("sw.js"), so its scope is the
   directory it lives in — exactly the app subpath. Because this file is
   fetched relative to that scope, self.registration.scope already carries
   the correct subpath and every same-origin URL below is resolved RELATIVE
   to the SW's own location (new URL("./x", self.location)). Nothing is
   hardcoded to "/CHINA-EU-FLOW-ASCII/", so the same file also works when
   served from the domain root or any other subpath.

   Two distinct caches:
     • APP_SHELL  — precached same-origin app shell (versioned, wiped on bump)
     • RUNTIME    — cross-origin esm.sh modules, cached lazily on first use.
                    esm.sh sends proper CORS headers, so these responses are
                    NON-opaque (readable status) and safe to cache-first.

   Lifecycle correctness note (the subtle offline bug this guards against):
   every cache write is tied to the FetchEvent via event.waitUntil(), so the
   worker is kept alive until the cloned body has fully streamed into the
   cache. A fire-and-forget cache.put() can be dropped when the SW is
   terminated the instant respondWith() settles — most damaging for the
   esm.sh module graph, which would then be intermittently absent offline and
   silently break the glyphcss boot. Threading the event fixes that.
   ═══════════════════════════════════════════════════════════════════════ */

// Bump this to invalidate the app-shell precache on the next activation.
const VERSION = "v3";
const APP_SHELL_CACHE = "cn-eu-flow-shell-" + VERSION;
const RUNTIME_CACHE = "cn-eu-flow-runtime-" + VERSION;

// Cross-origin CDN origin whose modules we cache-first for true offline.
const ESM_ORIGIN = "https://esm.sh";

// The top-level glyphcss module — warmed during install so a first visit
// that goes offline immediately still boots (see install handler note).
const ESM_ENTRY = "https://esm.sh/glyphcss";

/* App-shell assets, RELATIVE to this SW's scope. Resolved against
   self.location so the leading "./" maps onto the deploy subpath. */
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-1024.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png"
];

/* ── install: precache the app shell ─────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      // Resolve each relative entry against the SW location and fetch with
      // cache-busting reload so install never re-primes from the HTTP cache.
      const requests = APP_SHELL.map(
        (path) =>
          new Request(new URL(path, self.location).href, { cache: "reload" })
      );
      // NOT cache.addAll: addAll is atomic (any one 4xx/5xx rejects the whole
      // install). Guard each request individually so a single missing optional
      // asset can't block SW installation; anything skipped is still lazily
      // cached at runtime.
      await Promise.all(
        requests.map(async (req) => {
          try {
            const res = await fetch(req);
            if (res && res.ok) {
              await cache.put(req, res);
            }
          } catch (err) {
            // Non-fatal: asset will be fetched (and cached) at runtime.
          }
        })
      );

      // Warm the top-level esm.sh module so an install-then-immediately-offline
      // first visit can still boot glyphcss. LIMITATION: this warms only the
      // top stub, not its transitive version-pinned sub-imports — full-graph
      // offline is guaranteed only after one SW-controlled online load (each
      // sub-import is then intercepted and cached by cacheFirstRuntime). Best
      // effort; never allowed to fail the install.
      try {
        const runtime = await caches.open(RUNTIME_CACHE);
        const res = await fetch(ESM_ENTRY, { mode: "cors" });
        if (res && res.ok && res.type !== "opaque") {
          await runtime.put(ESM_ENTRY, res.clone());
        }
      } catch (err) {
        // Offline at install, or CDN hiccup — ignore.
      }

      // Take over as soon as installed; paired with clients.claim() below.
      await self.skipWaiting();
    })()
  );
});

/* ── activate: drop stale caches from previous versions ──────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([APP_SHELL_CACHE, RUNTIME_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => (keep.has(name) ? null : caches.delete(name)))
      );
      await self.clients.claim();
    })()
  );
});

/* ── fetch: routing ──────────────────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only GET is cacheable; let everything else hit the network untouched.
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (err) {
    return;
  }

  // 1) Cross-origin esm.sh modules → runtime cache-first (offline critical).
  if (url.origin === ESM_ORIGIN) {
    event.respondWith(cacheFirstRuntime(event));
    return;
  }

  // Ignore any other cross-origin requests (let the network handle them).
  if (url.origin !== self.location.origin) return;

  // 2) Same-origin navigations → network-first with cached shell fallback.
  if (req.mode === "navigate") {
    event.respondWith(networkFirstNavigate(event));
    return;
  }

  // 3) Same-origin static assets → cache-first.
  event.respondWith(cacheFirstShell(event));
});

/* Cache-first for cross-origin esm.sh modules (including transitive
   sub-imports esm.sh emits, e.g. /glyphcss@x/es2022/…). First online hit is
   fetched and stored; every later hit — online or offline — is served from
   RUNTIME_CACHE. esm.sh sends CORS headers so responses are non-opaque
   (res.type === "cors"), meaning res.ok is readable and safe to trust.

   The cache write is tied to the fetch event with event.waitUntil() so the
   worker cannot be killed before the cloned body finishes streaming to disk —
   this is what makes the esm.sh graph reliably present when offline. */
async function cacheFirstRuntime(event) {
  const req = event.request;
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req); // default cors mode for cross-origin GET
    // Cache successful, non-opaque responses only.
    if (res && res.ok && res.type !== "opaque") {
      event.waitUntil(cache.put(req, res.clone()));
    }
    return res;
  } catch (err) {
    // Offline and never fetched before — nothing we can do but fail.
    const fallback = await cache.match(req);
    if (fallback) return fallback;
    return Response.error();
  }
}

/* Network-first for navigations: prefer fresh HTML when online, fall back to
   the cached document (or the "./" app-shell root) when offline. */
async function networkFirstNavigate(event) {
  const req = event.request;
  const cache = await caches.open(APP_SHELL_CACHE);
  try {
    let res = await fetch(req);
    // Redirect-safety: a response with redirected===true cannot be returned to
    // a navigation request (redirect-mode mismatch throws) and would poison the
    // cache with the same throw. Rebuild a clean, non-redirected response.
    if (res && res.redirected) {
      const body = await res.clone().blob();
      res = new Response(body, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      });
    }
    // Keep the shell copy fresh for future offline loads.
    if (res && res.ok) {
      event.waitUntil(cache.put(req, res.clone()));
    }
    return res;
  } catch (err) {
    const cached =
      (await cache.match(req)) ||
      (await cache.match(new URL("./index.html", self.location).href)) ||
      (await cache.match(new URL("./", self.location).href));
    if (cached) return cached;
    return Response.error();
  }
}

/* Cache-first for same-origin static assets (icons, manifest, etc.).
   Serve from cache; on a miss, fetch and populate the shell cache. The
   res.type === "basic" gate ensures we only store genuine same-origin
   responses (never an opaque cross-origin one). */
async function cacheFirstShell(event) {
  const req = event.request;
  const cache = await caches.open(APP_SHELL_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === "basic") {
      event.waitUntil(cache.put(req, res.clone()));
    }
    return res;
  } catch (err) {
    return Response.error();
  }
}
