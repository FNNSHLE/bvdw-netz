// netz.js: Ego-Netz mit d3 7. Knoten sind Master-Pixel (Quadrat, Radius 22 %). Deterministisches Layout,
// Einflug aus der Mitte, ruhiger Drift, Spring-Hover, Dive-in beim Klick, weiche Updates beim Zeitfilter.
(function () {
  const RING = { gremium: 160, format: 275, firma: 220, lab: 100 };
  const FARBE = { firma: "#000000", gremium: "#0045C3", format: "#FF5833", lab: "#0045C3" };
  const rm = () => !!(window.NETZ_MOTION && window.NETZ_MOTION.rm);

  function groesse(k) {
    if (k.zentrum) return 70;
    const g = Math.max(1, k.gewicht || 1), basis = k.typ === "lab" ? 22 : 28;
    return Math.min(basis + 16, basis + Math.log2(g) * 5);
  }
  const kuerze = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  function initialen(name) {
    const w = name.replace(/\(.*?\)/g, "").split(/\s+/).filter(x => x && !/^(GmbH|AG|SE|PartG|mbB|und|im|BVDW|Working|Group|Circle|Lab|Initiative|Der|Die)$/i.test(x));
    return (w.slice(0, 2).map(x => x[0]).join("") || name.slice(0, 2)).toUpperCase();
  }
  function layout(modell) {
    const knoten = [{ ...modell.zentrum, zentrum: true, fx: 0, fy: 0 }].concat(modell.knoten.map(k => ({ ...k })));
    const index = Object.fromEntries(knoten.map(k => [k.id, k]));
    const kanten = modell.kanten.map(k => ({ source: index[modell.zentrum.id], target: index[k.ziel], gewicht: k.gewicht || 1 })).filter(k => k.target);
    const ringTypen = [...new Set(modell.knoten.map(k => k.typ))];
    ringTypen.forEach(t => { const gr = knoten.filter(k => k.typ === t && !k.zentrum); gr.forEach((k, i) => { const a = (i / gr.length) * Math.PI * 2 - Math.PI / 2; k.x = Math.cos(a) * RING[t]; k.y = Math.sin(a) * RING[t]; }); });
    const sim = d3.forceSimulation(knoten).randomSource(d3.randomLcg(0.4242))
      .force("radial", d3.forceRadial(d => d.zentrum ? 0 : RING[d.typ], 0, 0).strength(1.1))
      .force("collide", d3.forceCollide(d => groesse(d) / 2 + 16).iterations(3))
      .force("charge", d3.forceManyBody().strength(-40).theta(0.9)).alphaDecay(0.05).stop();
    for (let i = 0; i < 300; i++) sim.tick();
    return { knoten, kanten, ringTypen };
  }

  // modell: { zentrum: {id, typ, label}, knoten: [{id, typ, label, gewicht, hinweis}], kanten: [{ziel, gewicht}] }
  function zeichne(wurzel, modell, optionen) {
    const opt = Object.assign({ onKlick: () => {}, willNavigate: () => true, tooltip: null }, optionen || {});
    const reduziert = rm();
    let st = wurzel.__netz;
    if (!st || st.zentrumId !== modell.zentrum.id) {
      wurzel.innerHTML = "";
      const W = 1000, H = 660;
      const svg = d3.select(wurzel).append("svg").attr("viewBox", `${-W / 2} ${-H / 2} ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
      const buehne = svg.append("g");
      svg.call(d3.zoom().scaleExtent([0.5, 2.5]).on("zoom", ev => buehne.attr("transform", ev.transform)));
      st = wurzel.__netz = { zentrumId: modell.zentrum.id, svg, buehne, gen: 0, raf: 0, pos: new Map(),
        ringe: buehne.append("g"), kantenEbene: buehne.append("g"), knotenEbene: buehne.append("g") };
    }
    st.gen++; cancelAnimationFrame(st.raf);
    const gen = st.gen;
    const { knoten, kanten, ringTypen } = layout(modell);
    const dauer = reduziert ? 0 : 720, stagger = reduziert ? 0 : 26;
    const start = d => st.pos.get(d.id) || { x: 0, y: 0 };
    // Ohne Bewegung werden Attribute direkt gesetzt, sonst als d3-Transition.
    const tr = (sel, delay, ease) => reduziert ? sel : sel.transition().delay(delay || 0).duration(dauer).ease(ease || d3.easeCubicOut);

    st.ringe.selectAll("circle").data(ringTypen, t => t).join(
      enter => enter.append("circle").attr("r", t => RING[t]).attr("fill", "none").attr("stroke", "#DAD3C9").attr("stroke-dasharray", "3 6").style("opacity", 0).call(s => tr(s).style("opacity", 1)),
      update => update, exit => reduziert ? exit.remove() : exit.transition().duration(300).style("opacity", 0).remove());

    const kante = st.kantenEbene.selectAll("line").data(kanten, d => d.target.id).join(
      enter => enter.append("line").attr("class", "kante").attr("x1", 0).attr("y1", 0).attr("x2", d => start(d.target).x).attr("y2", d => start(d.target).y).attr("stroke-width", 1).style("opacity", 0),
      update => update,
      exit => reduziert ? exit.remove() : exit.transition().duration(320).attr("x2", 0).attr("y2", 0).style("opacity", 0).remove());
    tr(kante, (d, i) => i * stagger)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y).attr("stroke-width", d => Math.min(9, 1 + d.gewicht * 0.9)).style("opacity", 1);

    const g = st.knotenEbene.selectAll("g.knoten").data(knoten, d => d.id).join(
      enter => {
        const e = enter.append("g").attr("class", d => "knoten" + (d.zentrum ? " zentrum" : "")).attr("tabindex", 0).attr("role", "button")
          .attr("transform", d => `translate(${start(d).x},${start(d).y}) scale(0.001)`).style("opacity", 0);
        e.filter(d => d.zentrum).append("circle").attr("class", "ping").attr("r", 36).attr("stroke", d => FARBE[d.typ]);
        e.append("rect").attr("width", 0).attr("height", 0);
        e.append("text").attr("class", "innen").attr("text-anchor", "middle").attr("dy", "0.36em");
        e.append("text").attr("class", "label").attr("text-anchor", "middle");
        return e;
      },
      update => update,
      exit => reduziert ? exit.remove() : exit.transition().duration(320).attr("transform", "translate(0,0) scale(0.001)").style("opacity", 0).remove());
    g.attr("aria-label", d => d.label);
    tr(g.select("rect")).attr("width", d => groesse(d)).attr("height", d => groesse(d)).attr("x", d => -groesse(d) / 2).attr("y", d => -groesse(d) / 2)
      .attr("rx", d => groesse(d) * 0.22).attr("fill", d => FARBE[d.typ]);
    g.select("text.innen").attr("fill", d => d.typ === "format" ? "#000" : "#FFF").attr("font-weight", 800).attr("font-size", d => d.zentrum ? 22 : (groesse(d) > 36 ? 12 : 10))
      .text(d => d.zentrum ? initialen(d.label) : (d.gewicht > 1 ? d.gewicht : ""));
    g.select("text.label").attr("y", d => groesse(d) / 2 + 15).text(d => kuerze(d.label, d.zentrum ? 36 : 24));
    tr(g, (d, i) => d.zentrum ? 0 : 80 + i * stagger, d3.easeBackOut.overshoot(1.3))
      .attr("transform", d => `translate(${d.x},${d.y}) scale(1)`).style("opacity", 1);
    st.pos = new Map(knoten.map(d => [d.id, { x: d.x, y: d.y }]));

    function hervor(d, an) { kante.classed("hervor", k => an && k.target === d); g.classed("hervor", k => an && k === d); }
    function klick(d) {
      if (d.zentrum) return;
      if (reduziert || !opt.willNavigate(d)) { opt.onKlick(d); return; }
      st.gen++; cancelAnimationFrame(st.raf);
      const k = 2.6;
      st.buehne.transition().duration(380).ease(d3.easeCubicIn).attr("transform", `translate(${-d.x * k},${-d.y * k}) scale(${k})`).style("opacity", 0.08).on("end", () => opt.onKlick(d));
    }
    g.on("mouseenter", (ev, d) => { hervor(d, true); if (opt.tooltip) opt.tooltip.zeige(ev, d); })
      .on("mousemove", ev => { if (opt.tooltip) opt.tooltip.bewege(ev); })
      .on("mouseleave", (ev, d) => { hervor(d, false); if (opt.tooltip) opt.tooltip.weg(); })
      .on("click", (ev, d) => klick(d))
      .on("keydown", (ev, d) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); klick(d); } });
    g.filter(d => !d.zentrum).call(d3.drag()
      .on("start", (ev, d) => { d.drag = true; })
      .on("drag", (ev, d) => { d.x = ev.x; d.y = ev.y; st.pos.set(d.id, { x: d.x, y: d.y });
        d3.select(ev.sourceEvent.target.closest("g.knoten")).attr("transform", `translate(${d.x},${d.y}) scale(1)`);
        kante.filter(k => k.target === d).attr("x2", d.x).attr("y2", d.y); })
      .on("end", (ev, d) => { d.drag = false; }));

    if (!reduziert) {
      setTimeout(() => {
        if (st.gen !== gen || !wurzel.isConnected) return;
        const t0 = performance.now();
        const f = now => {
          if (st.gen !== gen || !wurzel.isConnected) return;
          const t = (now - t0) / 1000;
          g.each(function (d, i) { if (d.zentrum || d.drag) return; d.ox = Math.sin(t * 0.7 + i * 1.1) * 2.6; d.oy = Math.cos(t * 0.55 + i * 0.9) * 2.6; d3.select(this).attr("transform", `translate(${d.x + d.ox},${d.y + d.oy}) scale(1)`); });
          kante.attr("x2", k => k.target.x + (k.target.ox || 0)).attr("y2", k => k.target.y + (k.target.oy || 0));
          st.raf = requestAnimationFrame(f);
        };
        st.raf = requestAnimationFrame(f);
      }, dauer + 120 + knoten.length * stagger);
    }
    return st;
  }

  function tooltip(el) {
    return {
      zeige(ev, d) { el.innerHTML = `<b>${d.label}</b>${d.hinweis || ""}`; el.classList.add("an"); this.bewege(ev); },
      bewege(ev) { const r = el.parentElement.getBoundingClientRect(); let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14; if (x + 270 > r.width) x -= 290; el.style.left = x + "px"; el.style.top = y + "px"; },
      weg() { el.classList.remove("an"); }
    };
  }
  window.NETZ_GRAPH = { zeichne, tooltip };
})();
