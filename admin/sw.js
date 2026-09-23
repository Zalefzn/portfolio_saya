'use strict';

// Service worker for the chat admin PWA: shows Web Push notifications sent by
// the notify-admin Edge Function and opens the right conversation on click.

const SHELL_CACHE = "chat-admin-shell-v3";
const SHELL = ["./", "./admin.css", "./admin.js", "../assets/js/chat-config.js", "./icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// network first so updates show immediately; the cached shell only covers offline starts
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  const conversationId = data.conversationId || "";
  event.waitUntil(
    self.registration.showNotification(data.title || "New chat message", {
      body: data.body || "",
      icon: "icons/icon-192.png",
      badge: "icons/badge-96.png",
      tag: conversationId || "chat",
      renotify: true,
      data: { url: "./?c=" + encodeURIComponent(conversationId) }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data.url, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.registration.scope)) {
          client.postMessage({ type: "open-conversation", url: target });
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
