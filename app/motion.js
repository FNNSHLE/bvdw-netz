// motion.js: Bewegung fuer den Dummy. Zaehler, Reveal beim Scrollen, Seitenuebergang, Ringe, Toast, driftende Master-Pixel.
// Respektiert prefers-reduced-motion: dann steht alles sofort am Ziel.
(function () {
  // still=1 in der Adresse schaltet alle Bewegung ab (Screenshots, Praesentation ohne Ablenkung).
  const rm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || /[?&]still(=|&|$)/.test(location.search);
  if (rm) document.documentElement.classList.add("still");
  const outExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function zaehle(el, bis, o) {
    o = Object.assign({ dauer: 1100, von: 0, suffix: "", dezimal: 0 }, o || {});
    const fmt = v => Number(v.toFixed(o.dezimal)).toLocaleString("de-DE") + o.suffix;
    if (rm || !isFinite(bis)) { el.textContent = fmt(bis); return; }
    const t0 = performance.now();
    (function f(now) {
      const p = Math.min(1, (now - t0) / o.dauer);
      el.textContent = fmt(o.von + (bis - o.von) * outExpo(p));
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }
  function zaehleAlle(root) {
    root.querySelectorAll("[data-zahl]").forEach((el, i) => {
      const bis = parseFloat(el.dataset.zahl);
      setTimeout(() => zaehle(el, bis, { suffix: el.dataset.suffix || "", dauer: 900 + i * 50 }), 60 + i * 60);
    });
  }
  function balken(root) {
    root.querySelectorAll("[data-breite]").forEach((el, i) => {
      el.style.width = "0%";
      requestAnimationFrame(() => setTimeout(() => { el.style.width = el.dataset.breite + "%"; }, 140 + i * 55));
    });
  }
  function ringe(root) {
    root.querySelectorAll(".gauge .wert").forEach(c => {
      const p = Math.max(0, Math.min(1, parseFloat(c.dataset.p) || 0));
      const C = 2 * Math.PI * parseFloat(c.getAttribute("r"));
      c.style.strokeDasharray = C; c.style.strokeDashoffset = C;
      requestAnimationFrame(() => requestAnimationFrame(() => { c.style.strokeDashoffset = C * (1 - p); }));
    });
  }
  const io = ("IntersectionObserver" in window) ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("sichtbar"); io.unobserve(e.target); }
  }), { threshold: 0.06, rootMargin: "0px 0px -6% 0px" }) : null;
  function enthuelle(root) {
    const els = root.querySelectorAll(".reveal");
    els.forEach((el, i) => {
      if (rm || !io) { el.classList.add("sichtbar"); return; }
      el.style.transitionDelay = Math.min(i * 60, 480) + "ms";
      io.observe(el);
    });
  }
  function uebergang(render) {
    const main = document.getElementById("app");
    if (rm) { render(); return; }
    if (document.startViewTransition) { document.startViewTransition(() => { render(); }); return; }
    main.classList.add("weg");
    setTimeout(() => { render(); main.classList.remove("weg"); }, 170);
  }
  function toast(text) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = text; t.classList.add("an");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("an"), 1900);
  }
  function worte(text) {
    return text.split(" ").map((w, i) => `<span class="wort" style="--i:${i}">${w}</span>`).join(" ");
  }
  function spotlight(el) {
    if (rm || !(window.matchMedia && matchMedia("(hover: hover)").matches)) return;
    el.classList.add("spot");
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", (e.clientX - r.left) + "px"); el.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--mx", "-999px"); el.style.setProperty("--my", "-999px"); });
  }
  // Driftende Master-Pixel (Quadrate, Radius 22 %, nie gedreht) als ruhiger Hintergrund.
  function pixelwolke(canvas) {
    if (rm || !canvas.getContext) return;
    const ctx = canvas.getContext("2d"), farben = ["#FF5833", "#0045C3", "#000000"], N = 26, P = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    let w = 0, h = 0, mx = .5, my = .5, tx = .5, ty = .5;
    function resize() { const dpr = Math.min(2, window.devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize();
    for (let i = 0; i < N; i++) P.push({ x: rnd(0, 1), y: rnd(0, 1), s: rnd(8, 36), f: farben[i % 3], a: rnd(.05, .12), vx: rnd(-.00007, .00007), vy: rnd(-.00005, .00005), ph: rnd(0, 6.28), tiefe: rnd(.4, 1) });
    const eltern = canvas.parentElement;
    eltern.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); tx = (e.clientX - r.left) / Math.max(1, r.width); ty = (e.clientY - r.top) / Math.max(1, r.height); });
    const ro = ("ResizeObserver" in window) ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas);
    const t0 = performance.now();
    function quadrat(x, y, s, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, s, s, r); else ctx.rect(x, y, s, s); ctx.fill(); }
    (function frame(now) {
      if (!canvas.isConnected) { if (ro) ro.disconnect(); return; }
      if (document.hidden) { requestAnimationFrame(frame); return; }
      const t = now - t0; mx += (tx - mx) * .05; my += (ty - my) * .05;
      ctx.clearRect(0, 0, w, h);
      for (const p of P) {
        p.x += p.vx * 16; p.y += p.vy * 16;
        if (p.x < -.1) p.x = 1.1; if (p.x > 1.1) p.x = -.1; if (p.y < -.1) p.y = 1.1; if (p.y > 1.1) p.y = -.1;
        const s = p.s * (1 + Math.sin(t / 1500 + p.ph) * .06), dx = (mx - .5) * 40 * p.tiefe, dy = (my - .5) * 40 * p.tiefe;
        ctx.globalAlpha = p.a; ctx.fillStyle = p.f;
        quadrat(p.x * w - dx - s / 2, p.y * h - dy - s / 2, s, s * .22);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    })(t0);
  }
  // Element von seiner Position zu einem Ziel fliegen lassen (FLIP), danach entfernen.
  function fliege(von, nach, o) {
    if (rm || !von.animate) return Promise.resolve();
    o = Object.assign({ dauer: 520 }, o || {});
    const a = von.getBoundingClientRect(), b = nach.getBoundingClientRect();
    const k = von.cloneNode(true);
    Object.assign(k.style, { position: "fixed", left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px", margin: 0, zIndex: 60, pointerEvents: "none" });
    document.body.appendChild(k);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    const an = k.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.55)`, opacity: 0 }], { duration: o.dauer, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
    return an.finished.then(() => k.remove());
  }
  function alles(root) { enthuelle(root); zaehleAlle(root); balken(root); ringe(root); }
  window.NETZ_MOTION = { rm, zaehle, zaehleAlle, balken, ringe, enthuelle, uebergang, toast, worte, spotlight, pixelwolke, fliege, alles };
})();
