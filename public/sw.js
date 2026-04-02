const CACHE_NAME = "epoque-v2";
const STATIC_ASSETS = [
  "/",
  "/logo.png",
  "/manifest.json",
];

// Install — cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network first for API/Supabase, Cache first for everything else
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Supabase / API calls — network only, fail silently offline
  if (url.hostname.includes("supabase")) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(JSON.stringify({ data: null, error: "offline" }), {
        headers: { "Content-Type": "application/json" },
      }))
    );
    return;
  }

  // Everything else — stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Only cache valid responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // If network fails, use cached version

      return cached || fetchPromise;
    })
  );
});
