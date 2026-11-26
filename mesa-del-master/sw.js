/* Crónicas D&D: copia local para abrir la app sin conexión.
   La página se pide primero a la red; si no hay conexión, se usa la última copia.
   Imágenes, sonidos y datos se guardan la primera vez que se usan y se refrescan en segundo plano.
   Las llamadas a motores de IA y a Kie.ai nunca pasan por aquí. */
var V = "cronicas-v1";
var BASE = ["./", "index.html", "manifest.webmanifest", "img/app/icono-192.png", "img/app/icono-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (K) {
    return Promise.all(K.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (r.mode === "navigate" || /\/(index\.html)?$/.test(u.pathname)) {
    e.respondWith(fetch(r).then(function (res) {
      var cp = res.clone(); caches.open(V).then(function (c) { c.put("index.html", cp); }); return res;
    }).catch(function () { return caches.match("index.html"); }));
    return;
  }
  e.respondWith(caches.open(V).then(function (c) {
    return c.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res.ok) c.put(r, res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
      return net;
    });
  }));
});
