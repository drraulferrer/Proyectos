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

  /* Publicaciones: actualización automática desde PubMed (NCBI E-utilities).
     Si la petición falla (p. ej. sin red o CSP restrictiva), se conserva la
     selección estática ya presente en el HTML. */
  (function pubmed() {
    var list = document.getElementById("pub-list");
    if (!list || !window.fetch) return;
    var author = list.getAttribute("data-pubmed-author") || "Ferrer-Peña R";
    var base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
    var term = encodeURIComponent(author + "[Author]");
    var esearch = base + "esearch.fcgi?db=pubmed&sort=date&retmax=6&retmode=json&term=" + term;

    fetch(esearch)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        var ids = d && d.esearchresult && d.esearchresult.idlist;
        if (!ids || !ids.length) return Promise.reject();
        return fetch(base + "esummary.fcgi?db=pubmed&retmode=json&id=" + ids.join(","))
          .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
          .then(function (s) { return { ids: ids, res: s.result }; });
      })
      .then(function (data) {
        var res = data.res; if (!res) return;
        var frag = document.createDocumentFragment();
        data.ids.forEach(function (id) {
          var a = res[id]; if (!a) return;
          var year = (a.sortpubdate || a.pubdate || "").slice(0, 4);
          var journal = a.fulljournalname || a.source || "";
          var li = document.createElement("li");
          li.className = "pub reveal vis";
          var t = document.createElement("a");
          t.className = "pub__t"; t.target = "_blank"; t.rel = "noopener";
          t.href = "https://pubmed.ncbi.nlm.nih.gov/" + id + "/";
          t.textContent = (a.title || "").replace(/\.$/, "");
          var meta = document.createElement("span");
          meta.className = "pub__meta";
          meta.textContent = [journal, year, "PMID " + id].filter(Boolean).join(" · ");
          li.appendChild(t); li.appendChild(meta); frag.appendChild(li);
        });
        if (frag.childNodes.length) {
          list.innerHTML = "";
          list.appendChild(frag);
          var st = document.getElementById("pub-status");
          if (st) st.textContent = "Últimas publicaciones, actualizadas automáticamente desde PubMed.";
        }
      })
      .catch(function () { /* se mantiene la selección estática */ });
  })();

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
