"use strict";

const CACHE_VERSION = "student-result-portal-v20-interface-refresh";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./pages/result.html",
  "./pages/about.html",
  "./pages/privacy.html",
  "./pages/terms.html",
  "./assets/css/style.css",
  "./assets/css/result-card.css",
  "./assets/css/transcript.css",
  "./assets/css/print.css",
  "./assets/js/app.js",
  "./assets/js/search.js",
  "./assets/js/portal-sections.js",
  "./assets/js/utils.js",
  "./assets/js/data-service.js",
  "./assets/js/print-manager.js",
  "./assets/js/result-renderer.js",
  "./assets/js/transcript-renderer.js",
  "./assets/data/students.json",
  "./assets/data/class-analytics.json",
  "./assets/data/supply-records.json",
  "./assets/images/university-logo.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
});
