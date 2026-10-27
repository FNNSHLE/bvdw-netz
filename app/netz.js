// netz.js: Ego-Netz mit d3 7. Knoten sind Master-Pixel (Quadrat, Radius 22 %). Deterministisches Layout.
(function () {
  const RING = { gremium: 160, format: 275, firma: 220, lab: 100 };
  const FARBE = { firma: "#000000", gremium: "#0045C3", format: "#FF5833", lab: "#0045C3" };

  function groesse(k) {
    if (k.zentrum) return 70;
    const g = Math.max(1, k.gewicht || 1);
    const basis = k.typ === "lab" ? 22 : 28;
    return Math.min(basis + 16, basis + Math.log2(g) * 5);
  }

  function kuerze(s, n) {
    return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
  }

  function initialen(name) {
    const w = name.replace(/\(.*?\)/g, "").split(/\s+/).filter(x => x && !/^(GmbH|AG|SE|PartG|mbB|und|im|BVDW|Working|Group|Circle|Lab|Initiative|Der|Die)$/i.test(x));
    return (w.slice(0, 2).map(x => x[0]).join("") || name.slice(0, 2)).toUpperCase();
  }

  // modell: { zentrum: {id, typ, label}, knoten: [{id, typ, label, gewicht, hinweis}], kanten: [{ziel, gewicht}] }
  function zeichne(wurzel, modell, optionen) {
    const opt = Object.assign({ onKlick: () => {}, tooltip: null }, optionen || {});
    wurzel.innerHTML = "";
    const W = 1000, H = 660;
    const svg = d3.select(wurzel).append("svg").attr("viewBox", `${-W / 2} ${-H / 2} ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const buehne = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.5, 2.5]).on("zoom", (ev) => buehne.attr("transform", ev.transform)));

    const ringTypen = [...new Set(modell.knoten.map(k => k.typ))];
    const ringe = buehne.append("g");
    ringTypen.forEach(t => {
      ringe.append("circle").attr("r", RING[t]).attr("fill", "none").attr("stroke", "#DAD3C9").attr("stroke-dasharray", "3 6");
    });

    const knoten = [{ ...modell.zentrum, zentrum: true, fx: 0, fy: 0 }].concat(modell.knoten.map(k => ({ ...k })));
    const index = Object.fromEntries(knoten.map(k => [k.id, k]));
    const kanten = modell.kanten.map(k => ({ source: index[modell.zentrum.id], target: index[k.ziel], gewicht: k.gewicht || 1 })).filter(k => k.target);

    const zufall = d3.randomLcg(0.4242);
    const sim = d3.forceSimulation(knoten).randomSource(zufall)
      .force("radial", d3.forceRadial(d => d.zentrum ? 0 : RING[d.typ], 0, 0).strength(1.1))
      .force("collide", d3.forceCollide(d => groesse(d) / 2 + 16).iterations(3))
      .force("charge", d3.forceManyBody().strength(-40).theta(0.9))
      .alphaDecay(0.05).stop();
    // Startwinkel gleichmaessig je Ring, damit das Layout ruhig und reproduzierbar ist
    ringTypen.forEach(t => {
      const gruppe = knoten.filter(k => k.typ === t && !k.zentrum);
      gruppe.forEach((k, i) => { const a = (i / gruppe.length) * Math.PI * 2 - Math.PI / 2; k.x = Math.cos(a) * RING[t]; k.y = Math.sin(a) * RING[t]; });
    });
    for (let i = 0; i < 300; i++) sim.tick();

    const kante = buehne.append("g").selectAll("line").data(kanten).join("line")
      .attr("class", "kante").attr("stroke-width", d => Math.min(9, 1 + d.gewicht * 0.9))
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);

    const g = buehne.append("g").selectAll("g").data(knoten).join("g")
      .attr("class", d => "knoten" + (d.zentrum ? " zentrum" : "")).attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("tabindex", 0).attr("role", "button").attr("aria-label", d => d.label);
    g.append("rect").attr("width", d => groesse(d)).attr("height", d => groesse(d)).attr("x", d => -groesse(d) / 2).attr("y", d => -groesse(d) / 2)
      .attr("rx", d => groesse(d) * 0.22).attr("fill", d => FARBE[d.typ]).attr("stroke", "#000").attr("stroke-width", d => d.zentrum ? 0 : 0);
    g.filter(d => d.zentrum).append("text").attr("text-anchor", "middle").attr("dy", "0.36em").attr("fill", d => d.typ === "format" ? "#000" : "#FFF")
      .attr("font-weight", 800).attr("font-size", 22).text(d => initialen(d.label));
    g.filter(d => !d.zentrum && d.typ !== "firma").append("text").attr("text-anchor", "middle").attr("dy", "0.36em")
      .attr("fill", d => d.typ === "format" ? "#000" : "#FFF").attr("font-weight", 800).attr("font-size", d => groesse(d) > 36 ? 12 : 10).text(d => d.gewicht > 1 ? d.gewicht : "");
    g.append("text").attr("text-anchor", "middle").attr("y", d => groesse(d) / 2 + 15).text(d => kuerze(d.label, d.zentrum ? 36 : 24));

    function hervor(d, an) {
      kante.classed("hervor", k => an && k.target === d);
      g.select("rect").attr("stroke-width", k => (an && k === d) ? 3 : 0);
    }
    g.on("mouseenter", (ev, d) => { hervor(d, true); if (opt.tooltip) opt.tooltip.zeige(ev, d); })
      .on("mousemove", (ev) => { if (opt.tooltip) opt.tooltip.bewege(ev); })
      .on("mouseleave", (ev, d) => { hervor(d, false); if (opt.tooltip) opt.tooltip.weg(); })
      .on("click", (ev, d) => { if (!d.zentrum) opt.onKlick(d); })
      .on("keydown", (ev, d) => { if ((ev.key === "Enter" || ev.key === " ") && !d.zentrum) { ev.preventDefault(); opt.onKlick(d); } });

    g.filter(d => !d.zentrum).call(d3.drag()
      .on("drag", (ev, d) => {
        d.x = ev.x; d.y = ev.y;
        d3.select(ev.sourceEvent.target.closest("g.knoten")).attr("transform", `translate(${d.x},${d.y})`);
        kante.filter(k => k.target === d).attr("x2", d.x).attr("y2", d.y);
      }));
    return { svg };
  }

  function tooltip(el) {
    return {
      zeige(ev, d) { el.innerHTML = `<b>${d.label}</b>${d.hinweis || ""}`; el.style.display = "block"; this.bewege(ev); },
      bewege(ev) { const r = el.parentElement.getBoundingClientRect(); let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14; if (x + 270 > r.width) x -= 290; el.style.left = x + "px"; el.style.top = y + "px"; },
      weg() { el.style.display = "none"; }
    };
  }

  window.NETZ_GRAPH = { zeichne, tooltip };
})();
