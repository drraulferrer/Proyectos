/* ══════════════════════════════════════════════════════════════════
   raulferrer.org · Interacciones (vanilla JS, sin dependencias)
   Tema claro/oscuro · menú móvil · logo/animaciones al hacer scroll
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Tema claro / oscuro (guarda la preferencia) */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored) root.setAttribute("data-theme", stored);

  var t = document.getElementById("theme");
  if (t) t.addEventListener("click", function () {
    var c = root.getAttribute("data-theme");
    if (!c) c = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    var next = c === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* Menú móvil */
  var mb = document.getElementById("menu"), lk = document.querySelector(".nav__links");
  if (mb && lk) {
    mb.addEventListener("click", function () {
      var o = lk.classList.toggle("open");
      mb.setAttribute("aria-expanded", o ? "true" : "false");
    });
    lk.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        lk.classList.remove("open");
        mb.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sombra de la nav al hacer scroll */
  var nv = document.getElementById("nav");
  function sc() { if (nv) nv.classList.toggle("scrolled", window.scrollY > 8); }
  sc();
  window.addEventListener("scroll", sc, { passive: true });

  /* Reveal al entrar en viewport (con salvavidas anti-secciones-en-blanco) */
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { el.classList.add("vis"); }); }, 2500);
  } else {
    rv.forEach(function (el) { el.classList.add("vis"); });
  }

  /* Enlace activo de la navegación según la sección visible */
  var secs = document.querySelectorAll("main section[id]");
  var nls = document.querySelectorAll('.nav__links a[href^="#"]');
  if ("IntersectionObserver" in window && secs.length) {
    var sp = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute("id");
          nls.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { sp.observe(s); });
  }
})();
