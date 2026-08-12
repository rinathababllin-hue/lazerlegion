/* ЛЕГИON / app.js — browser logic. Без зависимостей: IntersectionObserver + rAF. */
(function () {
  "use strict";
  var CFG = window.LEGION_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(pointer: fine)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- ANALYTICS PROVIDER ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var payload = { event: event, ts: Date.now() };
    if (data) for (var k in data) payload[k] = data[k];
    window.dataLayer.push(payload);
    if (CFG.analyticsEndpoint) {
      try {
        fetch(CFG.analyticsEndpoint, { method: "POST", keepalive: true,
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(function () {});
      } catch (e) {}
    }
  }
  window.legionTrack = track;

  /* ---------- IMAGE CONFIG APPLY + FALLBACK ---------- */
  function getPath(obj, path) {
    return path.split(".").reduce(function (a, k) { return (a == null ? a : a[k]); }, obj);
  }
  function fallback(img) {
    var d = document.createElement("div");
    d.className = "img-missing"; d.textContent = "IMAGE PLACEHOLDER";
    img.replaceWith(d);
  }
  $$("img").forEach(function (img) {
    img.addEventListener("error", function () { fallback(img); }, { once: true });
  });
  function applyImages() {
    $$("img[data-img]").forEach(function (img) {
      var p = getPath(CFG.images || {}, img.getAttribute("data-img"));
      if (typeof p === "string" && p) img.src = p;
    });
    var hero = $('img[data-img="hero.desktop"]');
    if (hero && CFG.images && CFG.images.hero) {
      var mob = window.matchMedia("(max-width: 767px)").matches;
      hero.src = (mob ? CFG.images.hero.mobile : CFG.images.hero.desktop) || CFG.images.hero.desktop || hero.src;
    }
  }
  applyImages();
  window.addEventListener("resize", applyImages, { passive: true });

  /* ---------- LOADER (max ~1s, без искусственных задержек) ---------- */
  var loader = $("#loader"), pct = $("#loaderPct");
  function hideLoader() { if (!loader) return; loader.classList.add("done"); setTimeout(function () { loader && loader.remove(); loader = null; }, 600); }
  if (RM || !loader) { hideLoader(); }
  else {
    var t0 = null;
    var step = function (t) { if (t0 == null) t0 = t; var k = clamp((t - t0) / 850, 0, 1);
      pct.textContent = Math.round(k * 100) + "%";
      if (k < 1) requestAnimationFrame(step); else hideLoader(); };
    requestAnimationFrame(step);
    setTimeout(hideLoader, 1500);
  }
  track("page_view");

  /* ---------- HEADER / PROGRESS / SCROLL EVENTS ---------- */
  var header = $("#header"), bar = $("#scrollProgress"), sticky = $(".sticky-cta");
  var s50 = false, s90 = false, ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? y / max : 0;
    header.classList.toggle("scrolled", y > 40);
    bar.style.transform = "scaleX(" + p + ")";
    sticky.classList.toggle("show", y > innerHeight * 0.7);
    if (!s50 && p >= 0.5) { s50 = true; track("scroll_50"); }
    if (!s90 && p >= 0.9) { s90 = true; track("scroll_90"); }
    hScroll(); tlScroll(); ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- BOOKING / SOCIAL TRACKING ---------- */
  $$("a[data-booking]").forEach(function (a) {
    a.addEventListener("click", function () {
      track("booking_click", { source: a.getAttribute("data-source") || "unknown" });
      if (a.id === "heroCta") track("hero_cta_click");
    });
  });
  $$("a[data-track]").forEach(function (a) { a.addEventListener("click", function () { track(a.getAttribute("data-track")); }); });
  $$("a[data-format]").forEach(function (a) { a.addEventListener("click", function () { track("format_open", { format: a.getAttribute("data-format") }); }); });

  /* ---------- BURGER ---------- */
  var burger = $("#burger"), mmenu = $("#mmenu");
  function setMenu(open) {
    mmenu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(!mmenu.classList.contains("open")); });
  $$("#mmenu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- NAV ACTIVE STATE ---------- */
  var navLinks = $$(".nav a");
  var secIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  ["game", "formats", "companies", "gallery", "faq"].forEach(function (id) { var el = document.getElementById(id); if (el) secIO.observe(el); });

  /* ---------- REVEAL ON SCROLL ---------- */
  var rIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rIO.unobserve(e.target); } });
  }, { threshold: 0.15 });
  $$("[data-reveal]").forEach(function (el) { rIO.observe(el); });

  /* ---------- NUMBER COUNTERS ---------- */
  var cIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; cIO.unobserve(e.target);
      var el = e.target, target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (RM) { el.textContent = String(target).padStart(2, "0"); return; }
      var t0 = null;
      var st = function (t) { if (t0 == null) t0 = t; var k = clamp((t - t0) / 900, 0, 1);
        el.textContent = String(Math.round(k * target)).padStart(2, "0");
        if (k < 1) requestAnimationFrame(st); };
      requestAnimationFrame(st);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(function (el) { cIO.observe(el); });

  /* ---------- HORIZONTAL BENEFITS (sticky scroll-jack, desktop only) ---------- */
  var hwrap = $("#hwrap"), btrack = $("#btrack");
  var mqH = window.matchMedia("(min-width: 900px)");
  function hScroll() {
    if (!hwrap || !btrack) return;
    if (!mqH.matches || RM) { btrack.style.transform = "none"; return; }
    var r = hwrap.getBoundingClientRect();
    var total = hwrap.offsetHeight - innerHeight;
    if (total <= 0) return;
    var p = clamp(-r.top / total, 0, 1);
    var max = btrack.scrollWidth - innerWidth;
    btrack.style.transform = "translateX(" + (-p * Math.max(0, max)) + "px)";
  }
  mqH.addEventListener ? mqH.addEventListener("change", hScroll) : null;

  /* ---------- TIMELINE PROGRESS ---------- */
  var tl = $("#timeline"), tlLine = $("#tlLine");
  function tlScroll() {
    if (!tl || !tlLine) return;
    var r = tl.getBoundingClientRect();
    var p = clamp((innerHeight * 0.8 - r.top) / r.height, 0, 1);
    tlLine.style.transform = "scaleY(" + p + ")";
  }
  var stepIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("on"); });
  }, { threshold: 0.6 });
  $$(".tl-step").forEach(function (s) { stepIO.observe(s); });

  /* ---------- MAGNETIC CTA + HERO PARALLAX ---------- */
  if (FINE && !RM) {
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (ev) {
        var r = b.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) / r.width;
        var y = (ev.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = "translate(" + x * 8 + "px," + y * 6 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    var hero = $(".hero");
    hero.addEventListener("mousemove", function (ev) {
      var x = (ev.clientX / innerWidth - 0.5), y = (ev.clientY / innerHeight - 0.5);
      $$("[data-plx]").forEach(function (el) {
        var k = parseFloat(el.getAttribute("data-plx")) || 4;
        el.style.transform = "translate(" + x * k + "px," + y * k + "px)";
      });
    });
  }

  /* ---------- FAQ ---------- */
  $$(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      $$(".faq-q").forEach(function (b) { b.setAttribute("aria-expanded", "false"); b.nextElementSibling.style.maxHeight = 0; });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        var a = btn.nextElementSibling; a.style.maxHeight = a.scrollHeight + "px";
        track("faq_open", { q: btn.firstElementChild.textContent });
      }
    });
  });

  /* ---------- GALLERY MODAL ---------- */
  var gItems = $$(".g-item"), gModal = $("#galleryModal"), gImg = $("#gImg"), gCount = $("#gCount");
  var gIndex = 0, lastFocus = null;
  function gSrcs() { return gItems.map(function (f) { var i = $("img", f); return i ? i.currentSrc || i.src : ""; }); }
  function gShow(i) {
    gIndex = (i + gItems.length) % gItems.length;
    var s = gSrcs()[gIndex];
    if (s) gImg.src = s;
    gCount.textContent = String(gIndex + 1).padStart(2, "0") + " / " + String(gItems.length).padStart(2, "0");
  }
  function gOpen(i) { lastFocus = document.activeElement; gShow(i); gModal.hidden = false; gModal.classList.add("open"); document.body.style.overflow = "hidden"; $("#gClose").focus(); track("gallery_open", { index: i + 1 }); }
  function gClose() { gModal.classList.remove("open"); gModal.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  gItems.forEach(function (f, i) {
    f.addEventListener("click", function () { gOpen(i); });
    f.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); gOpen(i); } });
  });
  $("#gClose").addEventListener("click", gClose);
  $("#gPrev").addEventListener("click", function () { gShow(gIndex - 1); });
  $("#gNext").addEventListener("click", function () { gShow(gIndex + 1); });
  gModal.addEventListener("click", function (ev) { if (ev.target === gModal) gClose(); });
  var tX = null;
  gModal.addEventListener("touchstart", function (ev) { tX = ev.touches[0].clientX; }, { passive: true });
  gModal.addEventListener("touchend", function (ev) {
    if (tX == null) return;
    var d = ev.changedTouches[0].clientX - tX;
    if (Math.abs(d) > 48) gShow(gIndex + (d < 0 ? 1 : -1));
    tX = null;
  }, { passive: true });

  /* ---------- VIDEO MODAL ---------- */
  var vModal = $("#videoModal"), vFrame = $("#videoFrame");
  function vOpen() {
    if (CFG.videoUrl) {
      vFrame.innerHTML = '<video controls autoplay playsinline style="width:100%;height:100%;object-fit:cover" src="' + CFG.videoUrl + '"></video>';
    }
    vModal.hidden = false; vModal.classList.add("open"); document.body.style.overflow = "hidden";
    $("#vClose").focus(); track("video_play");
  }
  function vClose() { vModal.classList.remove("open"); vModal.hidden = true; document.body.style.overflow = ""; vFrame.innerHTML = '<div class="vf-t">[VIDEO PLACEHOLDER]</div><p>// ролик в производстве — скоро здесь будет PLAY EXPERIENCE</p>'; }
  $("#playBtn").addEventListener("click", vOpen);
  $("#vClose").addEventListener("click", vClose);
  vModal.addEventListener("click", function (ev) { if (ev.target === vModal) vClose(); });

  /* ---------- GLOBAL KEYS ---------- */
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { if (!gModal.hidden) gClose(); if (!vModal.hidden) vClose(); setMenu(false); }
    if (!gModal.hidden && ev.key === "ArrowRight") gShow(gIndex + 1);
    if (!gModal.hidden && ev.key === "ArrowLeft") gShow(gIndex - 1);
  });

  onScroll();
})();