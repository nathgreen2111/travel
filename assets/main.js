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

  /* ---------- confetti / fireworks engine ---------- */
  var confetti = (function () {
    var canvas, ctx, particles = [], raf = null, dpr = 1;
    var COLORS = ["#D9B36B", "#C8A15A", "#0D2338", "#ffffff", "#55789A", "#F1C97A"];
    function ensure() {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.className = "fx-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize);
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var SHAPES = ["rect", "circ", "star", "streamer", "star", "rect"];
    function spawn(x, y, count, power) {
      ensure();
      for (var i = 0; i < count; i++) {
        var ang = Math.random() * Math.PI * 2;
        var sp = Math.random() * power + power * 0.2;
        particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - power * 0.4,
          g: 0.11 + Math.random() * 0.08,
          size: 5 + Math.random() * 7,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.34,
          life: 1, decay: 0.006 + Math.random() * 0.009,
          shape: SHAPES[(Math.random() * SHAPES.length) | 0]
        });
      }
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function drawStar(c, r) {
      c.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = (Math.PI / 2.5) * i - Math.PI / 2;
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        var a2 = a + Math.PI / 5;
        c.lineTo(Math.cos(a2) * (r * 0.45), Math.sin(a2) * (r * 0.45));
      }
      c.closePath();
      c.fill();
    }
    function loop() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
        if (p.life <= 0 || p.y > window.innerHeight + 40) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else if (p.shape === "streamer") ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2.2);
        else if (p.shape === "star") drawStar(ctx, p.size * 0.8);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      if (particles.length) raf = requestAnimationFrame(loop);
      else { raf = null; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }
    return {
      burst: function (x, y) { spawn(x, y, 46, 9); },
      small: function (x, y) { spawn(x, y, 16, 6); },
      fireworks: function () {
        var w = window.innerWidth, h = window.innerHeight;
        var pts = [
          [w * 0.5, h * 0.30], [w * 0.24, h * 0.40], [w * 0.76, h * 0.40],
          [w * 0.38, h * 0.26], [w * 0.62, h * 0.26], [w * 0.5, h * 0.45]
        ];
        pts.forEach(function (pt, idx) {
          setTimeout(function () { spawn(pt[0], pt[1], 80, 12); }, idx * 220);
        });
        // celebratory cannons from the bottom corners
        setTimeout(function () { spawn(0, h, 70, 16); spawn(w, h, 70, 16); }, 120);
      }
    };
  })();

  function showToast(msg) {
    var t = document.createElement("div");
    t.className = "fx-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("in"); });
    setTimeout(function () {
      t.classList.remove("in");
      setTimeout(function () { t.remove(); }, 420);
    }, 3200);
  }

  /* ---------- celebratory payoffs ---------- */
  function initCelebrations() {
    var form = document.querySelector("form[action]");
    if (form) {
      form.addEventListener("submit", function (e) {
        if (reduceMotion || form.dataset.celebrated) return;
        e.preventDefault();
        form.dataset.celebrated = "1";
        confetti.fireworks();
        var label = form.querySelector('button[type="submit"] span');
        if (label) label.textContent = "Off we go!";
        setTimeout(function () { form.submit(); }, 1200);
      });
    }
    document.querySelectorAll(".testimonial-card .stars").forEach(function (stars) {
      stars.addEventListener("mouseenter", function () {
        if (reduceMotion) return;
        var r = stars.getBoundingClientRect();
        confetti.small(r.left + r.width / 2, r.top + r.height / 2);
      });
    });
  }

  /* ---------- escape-room easter egg ---------- */
  function initEasterEgg() {
    var seq = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    var pos = 0;
    document.addEventListener("keydown", function (e) {
      var k = e.key.toLowerCase();
      if (k === seq[pos]) {
        pos++;
        if (pos === seq.length) { pos = 0; if (!reduceMotion) confetti.fireworks(); showToast("\uD83D\uDD13 You escaped! Off we go again\u2026"); }
      } else {
        pos = (k === seq[0]) ? 1 : 0;
      }
    });

    // triple-tap the passport stamp for a little magic
    var stamp = document.querySelector(".passport-stamp");
    if (stamp) {
      stamp.style.cursor = "pointer";
      var sc = 0, st = null;
      stamp.addEventListener("click", function (e) {
        sc++;
        clearTimeout(st);
        st = setTimeout(function () { sc = 0; }, 700);
        if (!reduceMotion) confetti.small(e.clientX, e.clientY);
        if (sc >= 3) {
          sc = 0;
          if (!reduceMotion) confetti.burst(e.clientX, e.clientY);
          showToast("\u2728 You found a little magic \u2014 off we go!");
        }
      });
    }
  }

  /* ---------- 3D tilt + parallax ---------- */
  function initTilt() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll(".dest").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (px * 8) + "deg) rotateX(" + (-py * 8) + "deg) translateZ(6px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
    var keyhole = document.querySelector(".keyhole");
    var stage = document.querySelector(".keyhole-stage");
    if (keyhole && stage) {
      stage.addEventListener("mousemove", function (e) {
        var r = stage.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        keyhole.style.transform = "perspective(1000px) rotateY(" + (px * 10) + "deg) rotateX(" + (-py * 10) + "deg) translateY(-6px)";
      });
      stage.addEventListener("mouseleave", function () { keyhole.style.transform = ""; });
    }
  }

  /* ---------- scroll-driven flying plane ---------- */
  function initPlane() {
    if (reduceMotion || window.innerWidth <= 900) return;
    var rail = document.createElement("div");
    rail.className = "flight-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = '<div class="flight-plane"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg></div>';
    document.body.appendChild(rail);
    var plane = rail.querySelector(".flight-plane");
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      plane.style.top = (6 + p * 88) + "%";
      ticking = false;
    }
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- escape-room countdown motif ---------- */
  function initTimers() {
    var media = document.querySelector(".offer#rooms .offer-media");
    if (!media) return;
    var chip = document.createElement("div");
    chip.className = "timer-chip";
    chip.title = "Think you can beat the clock? Tap it.";
    chip.innerHTML = '<span class="dotpulse"></span><span class="t">60:00</span>';
    media.appendChild(chip);
    var el = chip.querySelector(".t");
    var START = 60 * 60; // 60:00
    var t = START;
    var finishing = false;
    function fmt(x) {
      var m = (x / 60) | 0, s = x % 60;
      return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }
    function escaped() {
      el.textContent = "ESCAPED!";
      chip.classList.add("escaped");
      var r = chip.getBoundingClientRect();
      if (!reduceMotion && r.top < window.innerHeight && r.bottom > 0) {
        confetti.burst(r.left + r.width / 2, r.top + r.height / 2);
      }
      setTimeout(function () {
        chip.classList.remove("escaped", "low");
        t = START; finishing = false; el.textContent = fmt(t);
      }, 2800);
    }
    if (reduceMotion) { el.textContent = "60:00"; return; }
    // authentic real-time countdown
    setInterval(function () {
      if (finishing || chip.classList.contains("escaped")) return;
      t -= 1;
      if (t <= 0) { finishing = true; escaped(); return; }
      chip.classList.toggle("low", t <= 30);
      el.textContent = fmt(t);
    }, 1000);
    // tap to dramatically race to the finish
    chip.addEventListener("click", function (e) {
      e.preventDefault();
      if (finishing) return;
      finishing = true;
      chip.classList.add("low");
      var fast = setInterval(function () {
        t -= 37;
        if (t <= 0) { clearInterval(fast); escaped(); return; }
        el.textContent = fmt(t);
      }, 28);
    });
  }

  /* ---------- unlocking intro preloader (once per session) ---------- */
  function initPreloader() {
    if (reduceMotion) return;
    try {
      if (sessionStorage.getItem("owg-seen")) return;
      sessionStorage.setItem("owg-seen", "1");
    } catch (e) { return; }

    var pre = document.createElement("div");
    pre.className = "preloader";
    pre.setAttribute("aria-hidden", "true");
    pre.innerHTML =
      '<div class="pl-inner">' +
        '<svg class="pl-lock" width="96" height="118" viewBox="0 0 96 118">' +
          '<path class="pl-shackle" d="M28 50 V34 a20 20 0 0 1 40 0 V50" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>' +
          '<rect class="pl-bodyrect" x="16" y="50" width="64" height="56" rx="12"/>' +
          '<circle class="pl-hole" cx="48" cy="72" r="6"/>' +
          '<rect class="pl-hole" x="45" y="74" width="6" height="17" rx="3"/>' +
        '</svg>' +
        '<div class="pl-word">Off We Go Again</div>' +
        '<div class="pl-sub">unlocking your next adventure</div>' +
      '</div>';
    document.body.appendChild(pre);
    document.documentElement.classList.add("preloading");

    setTimeout(function () { pre.classList.add("unlock"); }, 600);
    setTimeout(function () { confetti.small(window.innerWidth / 2, window.innerHeight * 0.42); }, 1180);
    setTimeout(function () {
      pre.classList.add("done");
      document.documentElement.classList.remove("preloading");
    }, 1280);
    setTimeout(function () { pre.remove(); }, 2100);
  }

  /* ---------- magnetic buttons ---------- */
  function initMagnetic() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (x * 0.3) + "px," + (y * 0.4 - 2) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- scroll progress bar ---------- */
  function initScrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var ticking = false;
    function upd() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    }
    upd();
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
  }

  /* ---------- floating travel icons in the hero ---------- */
  function initFloatingIcons() {
    if (reduceMotion) return;
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var icons = [
      '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
      '<path d="M12 2a7 7 0 0 0-7 7c0 3.6 3.2 6.4 6 8l-1 3h4l-1-3c2.8-1.6 6-4.4 6-8a7 7 0 0 0-7-7z"/>',
      '<path d="M12 2l2.9 6.3 6.9.6-5.2 4.5 1.6 6.7L12 17.3 5.8 20.6l1.6-6.7L2.2 8.9l6.9-.6z"/>',
      '<path d="M4 8h16v3a2 2 0 0 0 0 4v1H4v-1a2 2 0 0 0 0-4z"/>'
    ];
    var layer = document.createElement("div");
    layer.className = "float-layer";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 5; i++) {
      var span = document.createElement("span");
      span.className = "float-ic";
      span.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">' + icons[i % icons.length] + '</svg>';
      span.style.left = (8 + Math.random() * 82) + "%";
      span.style.top = (8 + Math.random() * 74) + "%";
      var sz = 18 + Math.random() * 22;
      span.style.width = sz + "px";
      span.style.height = sz + "px";
      span.style.animationDuration = (7 + Math.random() * 6) + "s";
      span.style.animationDelay = (-Math.random() * 8) + "s";
      layer.appendChild(span);
    }
    hero.appendChild(layer);
  }

  ready(function () {
    initNav();
    initHeader();
    initReveal();
    initCounters();
    initSparkles();
    initCursor();
    initCelebrations();
    initEasterEgg();
    initTilt();
    initPlane();
    initTimers();
    initPreloader();
    initMagnetic();
    initScrollProgress();
    initFloatingIcons();
  });
})();
