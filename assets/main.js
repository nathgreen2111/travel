/* Off We Go Again Travel — interactions
   Magical cursor, scroll reveals, count-up stats, sparkles, mobile nav.
   Everything degrades gracefully and bows out for reduced-motion / touch. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  // Flag that JS is live so reveal styles only apply when we can un-hide them.
  document.documentElement.classList.add("js");

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    var burger = document.querySelector(".burger");
    var nav = document.querySelector(".navlinks");
    if (!burger || !nav) return;

    burger.setAttribute("aria-expanded", "false");

    function close() {
      document.body.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    burger.addEventListener("click", toggle);
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- header shadow on scroll ---------- */
  function initHeader() {
    var header = document.querySelector("header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var selectors = [
      ".sec-head", ".way", ".step", ".dest", ".story-photos", ".story-text",
      ".stat", ".why", ".offer", ".cta-band", ".form-card", ".form-aside",
      ".testimonial-card",
      ".hero-copy", ".keyhole-stage", ".page-hero .inner", ".trust .it"
    ];
    var nodes = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { nodes.push(el); });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("reveal", "in"); });
      return;
    }

    // small stagger for siblings sharing a parent
    var groups = new Map();
    nodes.forEach(function (el) {
      el.classList.add("reveal");
      var parent = el.parentElement;
      var i = groups.get(parent) || 0;
      el.style.setProperty("--reveal-delay", Math.min(i, 6) * 70 + "ms");
      groups.set(parent, i + 1);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    nodes.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  function initCounters() {
    var stats = document.querySelectorAll(".stat .n");
    if (!stats.length) return;

    function animate(el) {
      var raw = el.textContent.trim();
      var match = raw.match(/(\d[\d,]*)/);
      if (reduceMotion || !match) return;
      var target = parseInt(match[1].replace(/,/g, ""), 10);
      var prefix = raw.slice(0, match.index);
      var suffix = raw.slice(match.index + match[1].length);
      var start = null;
      var dur = 1400;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = raw;
      }
      requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      stats.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { io.observe(el); });
  }

  /* ---------- floating sparkles in dark heroes ---------- */
  function initSparkles() {
    if (reduceMotion) return;
    var stages = document.querySelectorAll(".hero, .page-hero");
    stages.forEach(function (stage) {
      var layer = document.createElement("div");
      layer.className = "sparkle-layer";
      layer.setAttribute("aria-hidden", "true");
      var count = stage.classList.contains("hero") ? 14 : 8;
      for (var i = 0; i < count; i++) {
        var s = document.createElement("span");
        s.className = "sparkle";
        s.style.left = Math.random() * 100 + "%";
        s.style.top = Math.random() * 100 + "%";
        var size = 2 + Math.random() * 4;
        s.style.width = size + "px";
        s.style.height = size + "px";
        s.style.animationDuration = 3 + Math.random() * 4 + "s";
        s.style.animationDelay = -Math.random() * 6 + "s";
        layer.appendChild(s);
      }
      stage.appendChild(layer);
    });
  }

  /* ---------- magical custom cursor ---------- */
  function initCursor() {
    if (reduceMotion || !finePointer) return;

    document.body.classList.add("has-cursor");

    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    dot.setAttribute("aria-hidden", "true");
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var lastSpark = 0;

    function spawnSpark(x, y) {
      var spark = document.createElement("div");
      spark.className = "cursor-spark";
      var ang = Math.random() * Math.PI * 2;
      var dist = 8 + Math.random() * 16;
      spark.style.left = x + "px";
      spark.style.top = y + "px";
      spark.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      spark.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(spark);
      setTimeout(function () { spark.remove(); }, 700);
    }

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 4) + "px," + (my - 4) + "px)";
      var now = performance.now();
      var moved = Math.abs(e.movementX) + Math.abs(e.movementY);
      if (now - lastSpark > 45 && moved > 6) {
        spawnSpark(mx, my);
        lastSpark = now;
      }
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + (rx - 18) + "px," + (ry - 18) + "px)";
      requestAnimationFrame(loop);
    })();

    var interactive = "a, button, input, textarea, select, label.chip, .dest, .why, .way";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(interactive)) document.body.classList.add("cursor-hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(interactive)) document.body.classList.remove("cursor-hot");
    });
    document.addEventListener("mousedown", function () { document.body.classList.add("cursor-down"); });
    document.addEventListener("mouseup", function () { document.body.classList.remove("cursor-down"); });
    document.addEventListener("mouseleave", function () { dot.style.opacity = ring.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { dot.style.opacity = ring.style.opacity = ""; });
  }

  ready(function () {
    initNav();
    initHeader();
    initReveal();
    initCounters();
    initSparkles();
    initCursor();
  });
})();
