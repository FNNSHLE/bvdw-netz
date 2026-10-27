// app.js: Router, Start, Firma, Gremium, Datenschutz, Suche, Fusszeile. Alles rechnet auf window.NETZ_DATEN.
(function () {
  const D = window.NETZ_DATEN, T = window.NETZ_TEXTE, G = window.NETZ_GRAPH, M = window.NETZ_MOTION;
  const byId = a => Object.fromEntries(a.map(x => [x.id, x]));
  const FIRMEN = byId(D.firmen), GREMIEN = byId(D.gremien), FORMATE = byId(D.formate), EVENTS = byId(D.events);
  const HEUTE = new Date(D.meta.heute + "T12:00:00"), TAG = 86400000, HEUTE_MONAT = D.meta.heute.slice(0, 7);
  const f = n => Number(n).toLocaleString("de-DE");
  const pz = (a, b) => (b ? Math.round(100 * a / b) : 0);
  const dat = s => new Date(s + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TN_FIRMA = {}, TN_EVENT = {}, MG_FIRMA = {}, MG_GREMIUM = {};
  D.teilnahmen.forEach(t => { const x = { ...t, ev: EVENTS[t.event] }; (TN_FIRMA[t.firma] = TN_FIRMA[t.firma] || []).push(x); (TN_EVENT[t.event] = TN_EVENT[t.event] || []).push(x); });
  D.mitgliedschaften.forEach(m => { (MG_FIRMA[m.firma] = MG_FIRMA[m.firma] || []).push(m); (MG_GREMIUM[m.gremium] = MG_GREMIUM[m.gremium] || []).push(m); });
  const aktivM = m => !m.bis || m.bis >= HEUTE_MONAT;
  let FENSTER = "12m"; try { FENSTER = sessionStorage.getItem("netz_fenster") || "12m"; } catch (e) { /* ohne Speicher */ }

  function grenzen(fen) {
    if (fen === "12m") return [new Date(HEUTE - 365 * TAG), HEUTE];
    if (fen === "2026") return [new Date("2026-01-01T00:00:00"), HEUTE];
    if (fen === "2025") return [new Date("2025-01-01T00:00:00"), new Date("2025-12-31T23:59:59")];
    return [new Date("2000-01-01T00:00:00"), HEUTE];
  }
  function im(fen, datum) { const [a, b] = grenzen(fen); const d = new Date(datum + "T12:00:00"); return d >= a && d <= b; }
  const refLabel = ev => (ev.reftyp === "format" ? FORMATE[ev.ref].kurz : GREMIEN[ev.ref].kurz);

  function aktivitaet(id, fen) {
    const rows = (TN_FIRMA[id] || []).filter(x => im(fen, x.ev.datum)).sort((a, b) => b.ev.datum.localeCompare(a.ev.datum));
    const agg = {};
    rows.forEach(x => { const a = agg[x.ev.ref] = agg[x.ev.ref] || { ref: x.ev.ref, reftyp: x.ev.reftyp, n: 0, personen: 0, letzte: null, speaker: false, instanzen: [] };
      a.n++; a.personen += x.anzahl; a.instanzen.push(x); if (!a.letzte || x.ev.datum > a.letzte) a.letzte = x.ev.datum; if (x.rolle === "speaker") a.speaker = true; });
    return { rows, agg: Object.values(agg) };
  }
  function index(id) {
    const halb = new Date(HEUTE - 182 * TAG);
    const rows = (TN_FIRMA[id] || []).filter(x => im("12m", x.ev.datum));
    const formate = new Set(rows.filter(x => x.ev.reftyp === "format").map(x => x.ev.ref));
    const haeuf = rows.reduce((s, x) => s + (new Date(x.ev.datum + "T12:00:00") > halb ? 1 : 0.5), 0);
    const mg = (MG_FIRMA[id] || []).filter(aktivM);
    const tiefe = (mg.length ? 0.5 : 0) + (mg.some(m => m.rolle === "vorsitz") ? 1 : 0) + (rows.some(x => x.rolle === "speaker") ? 0.5 : 0);
    const B = Math.min(1, formate.size / 5), H = Math.min(1, haeuf / 8), Ti = Math.min(1, tiefe);
    return { index: Math.round(40 * B + 40 * H + 20 * Ti), breite: Math.round(40 * B), haeufigkeit: Math.round(40 * H), tiefe: Math.round(20 * Ti), formate: formate.size, instanzen: rows.length };
  }
  function reichweite() {
    const mitgl = D.firmen.filter(x => x.status === "mitglied");
    const aktiv = new Set(mitgl.filter(x => (TN_FIRMA[x.id] || []).some(t => im("12m", t.ev.datum))).map(x => x.id));
    const kat = {};
    mitgl.forEach(x => { const k = kat[x.kategorie] = kat[x.kategorie] || { n: 0, a: 0 }; k.n++; if (aktiv.has(x.id)) k.a++; });
    return { n: mitgl.length, a: aktiv.size, kat };
  }
  function formateAnteil() {
    return D.formate.map(m => {
      const firmen = new Set();
      D.events.filter(e => e.ref === m.id && im("12m", e.datum)).forEach(e => (TN_EVENT[e.id] || []).forEach(t => { if (!FIRMEN[t.firma].sammel) firmen.add(t.firma); }));
      const arr = [...firmen], mit = arr.filter(id => FIRMEN[id].status === "mitglied").length;
      return { m, n: arr.length, mit, anteil: arr.length ? mit / arr.length : 0 };
    }).filter(x => x.n > 0).sort((a, b) => b.anteil - a.anteil || b.n - a.n);
  }
  function gauge(p, zahl, suffix, sub, o) {
    o = o || {}; const r = o.klein ? 30 : 58, c = o.klein ? 36 : 70, C = (2 * Math.PI * r).toFixed(1);
    return `<div class="gauge${o.klein ? " klein" : ""}"><svg viewBox="0 0 ${c * 2} ${c * 2}" aria-hidden="true"><circle class="spur" cx="${c}" cy="${c}" r="${r}"/><circle class="wert ${o.farbe || ""}" cx="${c}" cy="${c}" r="${r}" data-p="${p}" style="stroke-dasharray:${C};stroke-dashoffset:${C}"/></svg>
      <div class="gauge-zahl"><b data-zahl="${zahl}" data-suffix="${esc(suffix || "")}">0${esc(suffix || "")}</b>${sub ? `<span>${sub}</span>` : ""}</div></div>`;
  }

  // ------------------------------------------------------------ Suche
  function sucheEinbauen(container, gross) {
    container.innerHTML = `<svg class="lupe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" placeholder="${esc(T.suche.platzhalter)}" aria-label="${esc(T.suche.platzhalter)}" autocomplete="off"><div class="vorschlaege" role="listbox"></div>`;
    const input = container.querySelector("input"), liste = container.querySelector(".vorschlaege");
    let treffer = [], aktiv = -1;
    const kandidaten = [
      ...D.firmen.filter(x => !x.sammel).map(x => ({ typ: "firma", id: x.id, label: x.name, such: (x.name + " " + x.domain + " " + x.branche_label).toLowerCase(), neben: T.firma.statusLabel[x.status] })),
      ...D.gremien.map(x => ({ typ: "gremium", id: x.id, label: x.name, such: (x.name + " " + x.kurz).toLowerCase(), neben: T.gremium.typLabel[x.typ] })),
      ...D.formate.map(x => ({ typ: "format", id: x.id, label: x.name, such: (x.name + " " + x.kurz).toLowerCase(), neben: T.suche.typ.format }))];
    function zeige() {
      const q = input.value.trim().toLowerCase();
      if (!q) { liste.classList.remove("offen"); return; }
      treffer = kandidaten.filter(k => k.such.includes(q)).slice(0, 9); aktiv = -1;
      liste.innerHTML = treffer.length ? treffer.map(k => `<button type="button" data-typ="${k.typ}" data-id="${k.id}"><span class="punkt ${k.typ}"></span><span>${esc(k.label)}</span><span class="typ">${esc(k.neben)}</span></button>`).join("")
        : `<button type="button" disabled>${esc(T.suche.keinTreffer)}</button>`;
      liste.classList.add("offen");
      liste.querySelectorAll("button[data-id]").forEach(b => b.addEventListener("mousedown", ev => { ev.preventDefault(); gehe(b.dataset.typ, b.dataset.id); }));
    }
    function gehe(typ, id) { input.value = ""; liste.classList.remove("offen"); input.blur(); if (typ === "format") location.hash = FORMATE[id].gremium ? "#/gremium/" + FORMATE[id].gremium : "#/"; else location.hash = `#/${typ}/${id}`; }
    input.addEventListener("input", zeige);
    input.addEventListener("focus", zeige);
    input.addEventListener("blur", () => setTimeout(() => liste.classList.remove("offen"), 120));
    input.addEventListener("keydown", ev => {
      const bs = liste.querySelectorAll("button[data-id]");
      if (ev.key === "ArrowDown") aktiv = Math.min(bs.length - 1, aktiv + 1); else if (ev.key === "ArrowUp") aktiv = Math.max(0, aktiv - 1);
      else if (ev.key === "Enter") { const b = bs[aktiv >= 0 ? aktiv : 0]; if (b) gehe(b.dataset.typ, b.dataset.id); return; } else if (ev.key === "Escape") { liste.classList.remove("offen"); return; } else return;
      ev.preventDefault(); bs.forEach((b, i) => b.classList.toggle("aktiv", i === aktiv));
    });
    if (gross) setTimeout(() => input.focus({ preventScroll: true }), 400);
  }

  // ------------------------------------------------------------ Start
  function renderStart(app) {
    const t = T.start, rw = reichweite(), fa = formateAnteil();
    const kat = Object.entries(rw.kat).sort((a, b) => (b[1].a / b[1].n) - (a[1].a / a[1].n));
    const verworfen = D.importe.reduce((s, i) => s + i.verworfen_personen, 0);
    const letzter = D.importe.map(i => i.datum).sort().pop();
    const beispiele = [["firma", "f01"], ["firma", "f02"], ["firma", "f03"], ["gremium", "g12"]];
    const ins = typ => D.insights.filter(i => i.typ === typ);
    app.innerHTML = `
      <div class="hero-stage"><canvas class="wolke" aria-hidden="true"></canvas>
      <section class="hero">
        <div>
          <div class="eyebrow reveal"><b></b> ${esc(t.eyebrow)}</div>
          <h1>${M.worte(esc(t.titel))}</h1>
          <p class="reveal" style="margin-top:14px;max-width:58ch;font-size:17px">${esc(t.text)}</p>
          <div class="suche suche-gross reveal" id="suche-gross" style="margin-top:24px"></div>
          <div class="frage-chips reveal" style="margin-top:12px;align-items:center"><span class="hinweis">${esc(t.beispiele)}</span>
            ${beispiele.map(([typ, id]) => `<button type="button" data-hash="#/${typ}/${id}">${esc(typ === "firma" ? FIRMEN[id].name : GREMIEN[id].kurz)}</button>`).join("")}</div>
        </div>
        <div class="karte reveal" id="reichweite-karte">
          <h3>${esc(t.reichweiteTitel)}</h3><p class="hinweis">${esc(t.reichweiteText)}</p>
          <div style="margin:14px 0 6px">${gauge(rw.a / rw.n, pz(rw.a, rw.n), " %", `${rw.a} von ${rw.n} ${esc(t.reichweiteSub)}`)}</div>
          <h3 style="margin-top:20px">${esc(t.kategorienTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(t.kategorienText)}</p>
          <div class="balken">${kat.map(([k, v]) => `<div class="zeile"><span>${esc(k)}</span><span class="spur"><span class="fuell" data-breite="${pz(v.a, v.n)}"></span></span><span class="wert">${v.a}/${v.n}</span></div>`).join("")}</div>
        </div>
      </section></div>
      <section class="kacheln">
        <div class="kachel schwarz reveal"><div class="zahl">0</div><div class="label">${esc(t.kpi.personen)}<br><span data-zahl="${verworfen}">0</span> ${esc(t.kpi.personenSub)}</div></div>
        <div class="kachel reveal"><div class="zahl" data-zahl="${D.firmen.filter(x => !x.sammel).length}">0</div><div class="label">${esc(t.kpi.firmen)}</div></div>
        <div class="kachel reveal"><div class="zahl" data-zahl="${D.gremien.length}">0</div><div class="label">${esc(t.kpi.gremien)}</div></div>
        <div class="kachel reveal"><div class="zahl" data-zahl="${D.formate.length}">0</div><div class="label">${esc(t.kpi.formate)}</div></div>
        <div class="kachel reveal"><div class="zahl" data-zahl="${D.events.length}">0</div><div class="label">${esc(t.kpi.events)}</div></div>
        <a class="kachel orange reveal" href="#/import"><div class="zahl" style="font-size:24px">${dat(letzter)}</div><div class="label">${esc(t.kpi.importe)}</div></a>
      </section>
      <section class="raster-2" style="margin-top:18px">
        <div class="karte reveal"><h3>${esc(t.formateTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(t.formateText)}</p>
          <div class="balken">${fa.map(x => `<div class="zeile"><span>${x.m.gremium ? `<a href="#/gremium/${x.m.gremium}">${esc(x.m.kurz)}</a>` : esc(x.m.kurz)}</span><span class="spur"><span class="fuell blau" data-breite="${Math.round(x.anteil * 100)}"></span></span><span class="wert">${Math.round(x.anteil * 100)} %</span></div>`).join("")}</div></div>
        <div class="karte reveal"><h3>${esc(t.listenTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(t.listenText)}</p>
          ${["churn", "lead", "crosssell"].map(typ => { const l = ins(typ); return `<div class="eyebrow" style="margin:12px 0 6px"><b></b><span><b style="display:inline;width:auto;height:auto;background:none;font-size:inherit;color:var(--ink)">${l.length}</b> ${esc(t.listen[typ])}</span></div><ul class="liste">${l.length ? l.slice(0, 5).map((i, k) => `<li style="--i:${k}"><a href="#/firma/${i.firma}">${esc(FIRMEN[i.firma].name)}</a><span class="neben">${esc(FIRMEN[i.firma].branche_label)}</span></li>`).join("") : `<li>${esc(t.listenLeer)}</li>`}${l.length > 5 ? `<li><span class="neben">und ${l.length - 5} weitere</span></li>` : ""}</ul>`; }).join("")}
        </div>
      </section>`;
    sucheEinbauen(app.querySelector("#suche-gross"), true);
    app.querySelectorAll("button[data-hash]").forEach(b => b.addEventListener("click", () => location.hash = b.dataset.hash));
    M.pixelwolke(app.querySelector("canvas.wolke"));
    M.spotlight(app.querySelector("#reichweite-karte"));
  }

  // ------------------------------------------------------------ Netz-Seite (Firma oder Gremium)
  function zeitfilterHtml(legende) {
    return `<div class="zeitfilter"><span class="legende">${legende}</span><div class="seg" id="seg">${Object.entries(T.firma.filter).map(([k, v]) => `<button type="button" data-f="${k}" aria-pressed="${FENSTER === k}">${esc(v)}</button>`).join("")}</div><span class="fenster">${esc(T.firma.fensterText)}</span></div>`;
  }
  function filterBinden(app, neu) {
    app.querySelectorAll("#seg button").forEach(b => b.addEventListener("click", () => { FENSTER = b.dataset.f; try { sessionStorage.setItem("netz_fenster", FENSTER); } catch (e) { /* egal */ } app.querySelectorAll("#seg button").forEach(x => x.setAttribute("aria-pressed", x.dataset.f === FENSTER)); neu(); }));
  }

  function renderFirma(app, id) {
    const firma = FIRMEN[id], t = T.firma;
    if (!firma) { app.innerHTML = `<p class="leer">${esc(T.suche.keinTreffer)}</p>`; return; }
    if (firma.sammel) {
      const rows = (TN_FIRMA[id] || []).sort((a, b) => b.ev.datum.localeCompare(a.ev.datum));
      app.innerHTML = `<div class="eyebrow"><b></b> ${esc(t.eyebrowNetz)}</div><h1>${M.worte(esc(firma.name))}</h1><p class="reveal" style="margin:12px 0;max-width:62ch">${esc(t.sammelHinweis)}</p>
        <div class="karte reveal"><ul class="zeitstrahl">${rows.map((x, k) => `<li style="--i:${Math.min(k, 20)}"><span class="datum">${dat(x.ev.datum)}</span> ${esc(refLabel(x.ev))} <span class="anz">${x.anzahl}</span></li>`).join("")}</ul></div>`;
      return;
    }
    const sicht = { gremium: true, format: true };
    app.innerHTML = `<div class="eyebrow"><b></b> ${esc(t.eyebrowNetz)}</div>
      <div class="netz-layout">
        <div>
          <div class="netz-rahmen"><div class="netz-werkzeuge" id="werkzeuge"></div><div id="netz"></div><div class="tooltip" id="tt"></div>
            ${zeitfilterHtml(`<span><i style="background:#000"></i>${esc(firma.name)}</span><span><i style="background:#0045C3"></i>${esc(t.ringe.gremium)}</span><span><i style="background:#FF5833"></i>${esc(t.ringe.format)}</span>`)}</div>
          <div id="format-karte"></div>
        </div>
        <aside class="seite" id="seite"></aside>
      </div>`;
    const zeichne = () => {
      const { agg } = aktivitaet(id, FENSTER);
      const mg = (MG_FIRMA[id] || []).filter(aktivM);
      const knoten = [], kanten = [];
      const gremienIds = new Set([...mg.map(m => m.gremium), ...agg.filter(a => a.reftyp === "gremium").map(a => a.ref)]);
      if (sicht.gremium) gremienIds.forEach(g => { const gr = GREMIEN[g], a = agg.find(x => x.ref === g), m = mg.find(x => x.gremium === g);
        const gew = Math.max(1, a ? a.n : 1);
        knoten.push({ id: g, typ: gr.typ === "lab" ? "lab" : "gremium", label: gr.kurz, gewicht: gew, hinweis: `<span>${m ? (m.rolle === "vorsitz" ? "stellt den Vorsitz" : "Mitglied") + " seit " + m.seit : "Gast"}${a ? `, ${a.n} ${T.gremium.sitzungen}` : ""}</span>` });
        kanten.push({ ziel: g, gewicht: gew }); });
      if (sicht.format) agg.filter(a => a.reftyp === "format").forEach(a => { knoten.push({ id: a.ref, typ: "format", label: FORMATE[a.ref].kurz, gewicht: a.n, hinweis: `<span>${a.n} ${t.formatInstanzen}, ${a.personen} ${t.formatPersonen.toLowerCase()}${a.speaker ? ", Speaker gestellt" : ""}</span>` }); kanten.push({ ziel: a.ref, gewicht: a.n }); });
      const netz = app.querySelector("#netz");
      if (!knoten.length) { netz.__netz = null; netz.innerHTML = `<p class="leer" style="padding-top:220px">${esc(t.verlaufLeer)}</p>`; }
      else G.zeichne(netz, { zentrum: { id, typ: "firma", label: firma.name }, knoten, kanten }, { tooltip: G.tooltip(app.querySelector("#tt")), willNavigate: d => d.typ !== "format",
        onKlick: d => { if (d.typ === "format") zeigeFormat(d.id); else location.hash = "#/gremium/" + d.id; } });
      app.querySelector("#werkzeuge").innerHTML = ["gremium", "format"].map(k => `<button type="button" class="chip${sicht[k] ? " aktiv" : ""}" data-s="${k}"><span class="punkt ${k}"></span>${esc(t.ringe[k])}</button>`).join("");
      app.querySelectorAll("#werkzeuge .chip").forEach(b => b.addEventListener("click", () => { sicht[b.dataset.s] = !sicht[b.dataset.s]; zeichne(); }));
    };
    const zeigeFormat = fid => {
      const m = FORMATE[fid], { agg } = aktivitaet(id, FENSTER), a = agg.find(x => x.ref === fid);
      const fk = app.querySelector("#format-karte");
      fk.innerHTML = `<div class="karte" style="margin-top:14px;animation:auf .45s var(--ease) both"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div class="eyebrow" style="margin-bottom:4px"><b></b> ${esc(t.formatKarte)}</div><h3>${esc(m.name)}</h3></div><button type="button" class="knopf klein" id="fk-weg" aria-label="schließen">✕</button></div>
        <dl class="steck" style="margin-top:8px"><dt>${esc(t.formatInstanzen)}</dt><dd>${a ? a.n : 0}</dd><dt>${esc(t.formatPersonen)}</dt><dd>${a ? a.personen : 0}</dd>${m.gremium ? `<dt>${esc(t.formatGremium)}</dt><dd><a href="#/gremium/${m.gremium}">${esc(GREMIEN[m.gremium].kurz)}</a></dd>` : ""}</dl>
        ${a ? `<ul class="zeitstrahl" style="margin-top:12px">${a.instanzen.map((x, k) => `<li style="--i:${k}"><span class="datum">${dat(x.ev.datum)}</span> ${esc(x.ev.ort)} <span class="anz">${x.anzahl} Teilnehmende${x.rolle === "speaker" ? ", Speaker" : ""}</span></li>`).join("")}</ul>` : ""}</div>`;
      fk.querySelector("#fk-weg").addEventListener("click", () => { fk.innerHTML = ""; });
    };
    const seitenleiste = () => {
      const ix = index(id), { rows, agg } = aktivitaet(id, FENSTER), mg = (MG_FIRMA[id] || []).filter(aktivM);
      const letzte = (TN_FIRMA[id] || []).map(x => x.ev.datum).sort().pop();
      const ins = D.insights.filter(i => i.firma === id);
      const seite = app.querySelector("#seite");
      seite.innerHTML = `
        <div class="karte reveal"><div class="eyebrow"><b></b> ${esc(t.steckbrief)}</div><h2>${esc(firma.name)}<span class="demo-chip">Demo</span></h2>
          <dl class="steck" style="margin-top:12px">
            <dt>${esc(t.felder.status)}</dt><dd><span class="status ${firma.status}">${esc(t.statusLabel[firma.status])}</span></dd>
            <dt>${esc(t.felder.branche)}</dt><dd class="normal">${esc(firma.branche_label)}</dd>
            <dt>${esc(t.felder.stadt)}</dt><dd class="normal">${esc(firma.stadt)}</dd>
            <dt>${esc(firma.status === "ehemalig" ? t.felder.austritt : t.felder.seit)}</dt><dd class="normal">${firma.status === "ehemalig" ? dat(firma.ausgetreten) : (firma.mitglied_seit || "kein Mitglied")}</dd>
            <dt>${esc(t.felder.domain)}</dt><dd class="normal"><code>${esc(firma.domain)}</code></dd>
            <dt>${esc(t.felder.gremien)}</dt><dd>${mg.length}${mg.some(m => m.rolle === "vorsitz") ? ", Vorsitz" : ""}</dd>
            <dt>${esc(t.felder.formate)}</dt><dd>${ix.formate}</dd>
            <dt>${esc(t.felder.letzte)}</dt><dd class="normal">${letzte ? dat(letzte) : "keine"}</dd>
          </dl>
          <button type="button" class="knopf klein" id="kopieren" style="margin-top:14px">${esc(t.kopieren)}</button></div>
        <div class="karte reveal"><h3>${esc(t.indexTitel)}</h3><p class="hinweis" style="margin-bottom:12px">${esc(t.indexText)}</p>
          <div class="index-block">${gauge(ix.index / 100, ix.index, "", "", { klein: true, farbe: "schwarz" })}<div class="index-teile">
            ${[["breite", ix.breite, 40], ["haeufigkeit", ix.haeufigkeit, 40], ["tiefe", ix.tiefe, 20]].map(([k, v, max]) => `<div class="zeile"><span>${esc(t.indexTeile[k])}</span><span class="spur"><span class="fuell" data-breite="${pz(v, max)}"></span></span><b>${v}</b></div>`).join("")}</div></div>
          <p class="hinweis" style="margin-top:10px">${esc(t.indexHinweis)}</p></div>
        <div class="karte reveal"><h3>${esc(t.insightTitel)}</h3>
          ${ins.length ? ins.map((i, k) => `<div class="insight ${i.typ}" style="--i:${k}"><div class="kopf"><b>${esc(t.insightTyp[i.typ])}</b><span>${esc(t.insightMeta)} ${Math.round(i.konfidenz * 100)} %</span></div>${esc(i.text)}</div>`).join("") : `<p class="hinweis">${esc(t.insightLeer)}</p>`}</div>
        <div class="karte reveal"><h3>${esc(t.verlaufTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(T.firma.filter[FENSTER])}, ${rows.length} Instanzen</p>
          ${rows.length ? `<ul class="zeitstrahl">${rows.map((x, k) => `<li class="${x.ev.reftyp}" style="--i:${Math.min(k, 20)}"><span class="datum">${dat(x.ev.datum)}</span> ${esc(refLabel(x.ev))}${x.ev.reftyp === "gremium" ? ", Sitzung" : ""} <span class="anz">${x.anzahl}${x.rolle === "speaker" ? ", Speaker" : ""}</span></li>`).join("")}</ul>` : `<p class="hinweis">${esc(t.verlaufLeer)}</p>`}</div>
        <div class="karte reveal"><h3>${esc(t.fragenTitel)}</h3>
          <div class="frage-chips">${D.fragen.map(q => `<button type="button" data-q="${q.id}">${esc(q.frage)}</button>`).join("")}</div>
          <form class="frage" id="frage"><input type="text" placeholder="${esc(t.fragenPlatzhalter)}" aria-label="${esc(t.fragenPlatzhalter)}"><button type="submit">${esc(t.fragenSenden)}</button></form>
          <div class="antwort" id="antwort" style="margin-top:10px"><span class="hinweis">…</span></div></div>`;
      seite.querySelector("#kopieren").addEventListener("click", async () => {
        const text = [`${firma.name} (Demo-Daten)`, `${t.felder.status}: ${t.statusLabel[firma.status]}${firma.mitglied_seit ? " seit " + firma.mitglied_seit : ""} · ${firma.branche_label} · ${firma.stadt}`,
          `${t.indexTitel} 12 Monate: ${ix.index} (${t.indexTeile.breite} ${ix.breite}, ${t.indexTeile.haeufigkeit} ${ix.haeufigkeit}, ${t.indexTeile.tiefe} ${ix.tiefe})`,
          `Gremien: ${mg.map(m => GREMIEN[m.gremium].kurz + (m.rolle === "vorsitz" ? " (Vorsitz)" : "")).join(", ") || "keine"}`,
          `Formate (${T.firma.filter[FENSTER]}): ${agg.filter(a => a.reftyp === "format").map(a => `${FORMATE[a.ref].kurz} (${a.n})`).join(", ") || "keine"}`,
          ...ins.map(i => `${t.insightTyp[i.typ]}: ${i.text}`), `Quelle: BVDW Netz, Demo-Daten, Stand ${dat(D.meta.heute)}. Keine Personen enthalten.`].join("\n");
        try { await navigator.clipboard.writeText(text); } catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
        M.toast(t.kopiert);
      });
      const antworte = (typ) => {
        let text;
        if (typ === "formate_jahr") { const a = aktivitaet(id, "2026").agg.filter(x => x.reftyp === "format"); text = T.fragen.formate_jahr(a.length, a.map(x => `${FORMATE[x.ref].kurz} (${x.n})`).join(", "), 2026); }
        else if (typ === "fehlt_seit") { const jetzt = new Set(aktivitaet(id, "12m").agg.map(a => a.ref)); const vorher = (TN_FIRMA[id] || []).filter(x => { const d = new Date(x.ev.datum + "T12:00:00"); return d > new Date(HEUTE - 730 * TAG) && d <= new Date(HEUTE - 365 * TAG); }); const fehlt = [...new Set(vorher.map(x => x.ev.ref))].filter(r => !jetzt.has(r)).map(r => FORMATE[r] ? FORMATE[r].kurz : GREMIEN[r].kurz); text = T.fragen.fehlt_seit(fehlt); }
        else if (typ === "gremien_passend") { const eigene = new Set(mg.map(m => m.gremium)); const zaehl = {}; D.mitgliedschaften.filter(m => aktivM(m) && m.firma !== id && FIRMEN[m.firma].branche === firma.branche).forEach(m => zaehl[m.gremium] = (zaehl[m.gremium] || 0) + 1); const liste = Object.entries(zaehl).filter(([g, n]) => n >= 2 && !eigene.has(g)).sort((a, b) => b[1] - a[1]).map(([g]) => GREMIEN[g].kurz); text = T.fragen.gremien_passend(firma.branche_label, liste); }
        else text = t.fragenKeinTreffer;
        const box = seite.querySelector("#antwort"); box.innerHTML = '<span class="cursor"></span>'; let i = 0;
        if (M.rm) { box.innerHTML = esc(text) + `<span class="meta">${esc(t.fragenMeta)}</span>`; return; }
        const tick = setInterval(() => { i += 3; box.innerHTML = esc(text.slice(0, i)) + '<span class="cursor"></span>'; if (i >= text.length) { clearInterval(tick); box.innerHTML = esc(text) + `<span class="meta">${esc(t.fragenMeta)}</span>`; } }, 16);
      };
      seite.querySelectorAll("button[data-q]").forEach(b => b.addEventListener("click", () => { const q = D.fragen.find(x => x.id === b.dataset.q); seite.querySelector("#frage input").value = q.frage; antworte(q.typ); }));
      seite.querySelector("#frage").addEventListener("submit", ev => { ev.preventDefault(); const v = ev.target.querySelector("input").value.toLowerCase(); const q = D.fragen.find(x => x.frage.toLowerCase() === v) || D.fragen.find(x => (x.typ === "formate_jahr" && /format|besucht|2026/.test(v)) || (x.typ === "fehlt_seit" && /fehl|seit|mehr/.test(v)) || (x.typ === "gremien_passend" && /gremi|pass|branche/.test(v))); antworte(q ? q.typ : null); });
      M.alles(seite);
    };
    filterBinden(app, () => { zeichne(); seitenleiste(); });
    zeichne(); seitenleiste();
  }

  function renderGremium(app, id) {
    const gr = GREMIEN[id], t = T.gremium;
    if (!gr) { app.innerHTML = `<p class="leer">${esc(T.suche.keinTreffer)}</p>`; return; }
    app.innerHTML = `<div class="eyebrow"><b></b> ${esc(t.eyebrowNetz)}</div>
      <div class="netz-layout">
        <div><div class="netz-rahmen"><div id="netz"></div><div class="tooltip" id="tt"></div>
          ${zeitfilterHtml(`<span><i style="background:#0045C3"></i>${esc(gr.kurz)}</span><span><i style="background:#000"></i>${esc(t.ringe.firma)}</span><span><i style="background:#FF5833"></i>${esc(t.ringe.format)}</span>`)}</div></div>
        <aside class="seite" id="seite"></aside></div>`;
    const modell = () => {
      const sitzungen = D.events.filter(e => e.ref === id && im(FENSTER, e.datum));
      const mg = (MG_GREMIUM[id] || []).filter(aktivM);
      const firmen = {};
      mg.forEach(m => firmen[m.firma] = { id: m.firma, n: 0, mitglied: true, vorsitz: m.rolle === "vorsitz" });
      sitzungen.forEach(e => (TN_EVENT[e.id] || []).forEach(x => { if (FIRMEN[x.firma].sammel) return; const o = firmen[x.firma] = firmen[x.firma] || { id: x.firma, n: 0, mitglied: false, vorsitz: false }; o.n++; }));
      const formate = D.formate.filter(m => m.gremium === id).map(m => ({ m, n: D.events.filter(e => e.ref === m.id && im(FENSTER, e.datum)).length }));
      const labs = D.gremien.filter(g => g.parent === id).map(g => ({ g, n: D.events.filter(e => e.ref === g.id && im(FENSTER, e.datum)).length }));
      const luecken = {};
      formate.forEach(({ m }) => D.events.filter(e => e.ref === m.id && im(FENSTER, e.datum)).forEach(e => (TN_EVENT[e.id] || []).forEach(x => { const fi = FIRMEN[x.firma]; if (fi.sammel || (firmen[x.firma] && firmen[x.firma].mitglied)) return; const o = luecken[x.firma] = luecken[x.firma] || { id: x.firma, n: 0 }; o.n++; })));
      return { sitzungen, mg, firmen: Object.values(firmen).sort((a, b) => (b.vorsitz - a.vorsitz) || (b.n - a.n) || (b.mitglied - a.mitglied)), formate, labs, luecken: Object.values(luecken).sort((a, b) => b.n - a.n) };
    };
    const zeichne = () => {
      const m = modell(), knoten = [], kanten = [];
      m.firmen.forEach(x => { const fi = FIRMEN[x.id], gew = Math.max(1, x.n + (x.mitglied ? 1 : 0)); knoten.push({ id: x.id, typ: "firma", label: fi.name, gewicht: gew, hinweis: `<span>${x.vorsitz ? "stellt den Vorsitz" : x.mitglied ? "Mitglied" : "Gast"}, ${x.n} ${t.sitzungen} · ${esc(T.firma.statusLabel[fi.status])}</span>` }); kanten.push({ ziel: x.id, gewicht: gew }); });
      m.formate.forEach(({ m: fo, n }) => { knoten.push({ id: fo.id, typ: "format", label: fo.kurz, gewicht: Math.max(1, n), hinweis: `<span>${n} ${T.firma.formatInstanzen}</span>` }); kanten.push({ ziel: fo.id, gewicht: Math.max(1, n) }); });
      m.labs.forEach(({ g, n }) => { knoten.push({ id: g.id, typ: "lab", label: g.kurz, gewicht: Math.max(1, n), hinweis: `<span>${n} ${t.sitzungen}</span>` }); kanten.push({ ziel: g.id, gewicht: Math.max(1, n) }); });
      const netz = app.querySelector("#netz");
      if (!knoten.length) { netz.__netz = null; netz.innerHTML = `<p class="leer" style="padding-top:220px">${esc(T.firma.verlaufLeer)}</p>`; }
      else G.zeichne(netz, { zentrum: { id, typ: "gremium", label: gr.kurz }, knoten, kanten }, { tooltip: G.tooltip(app.querySelector("#tt")), willNavigate: d => d.typ !== "format",
        onKlick: d => { if (d.typ === "firma") location.hash = "#/firma/" + d.id; else if (d.typ === "lab") location.hash = "#/gremium/" + d.id; } });
    };
    const seitenleiste = () => {
      const m = modell(), letzte = D.events.filter(e => e.ref === id && e.datum <= D.meta.heute).map(e => e.datum).sort().pop();
      const vorsitz = m.mg.find(x => x.rolle === "vorsitz");
      const seite = app.querySelector("#seite");
      seite.innerHTML = `
        <div class="karte reveal"><div class="eyebrow"><b></b> ${esc(t.typLabel[gr.typ])}</div><h2>${esc(gr.name)}</h2>
          <dl class="steck" style="margin-top:12px">
            <dt>${esc(t.felder.firmen)}</dt><dd>${m.mg.length}</dd>
            <dt>${esc(t.felder.aktiv)}</dt><dd>${m.firmen.filter(x => x.n > 0).length}</dd>
            <dt>${esc(t.felder.sitzungen)}</dt><dd>${m.sitzungen.length}</dd>
            <dt>${esc(t.felder.letzte)}</dt><dd class="normal">${letzte ? dat(letzte) : "keine"}</dd>
            <dt>${esc(t.felder.vorsitz)}</dt><dd>${vorsitz ? `<a href="#/firma/${vorsitz.firma}">${esc(FIRMEN[vorsitz.firma].name)}</a>` : "<span class='normal'>offen</span>"}</dd>
            ${gr.parent ? `<dt>gehört zu</dt><dd><a href="#/gremium/${gr.parent}">${esc(GREMIEN[gr.parent].kurz)}</a></dd>` : ""}
            ${m.formate.length ? `<dt>${esc(t.felder.betreuung)}</dt><dd class="normal">${m.formate.map(x => esc(x.m.kurz)).join(", ")}</dd>` : ""}
            ${m.labs.length ? `<dt>${esc(t.felder.labs)}</dt><dd class="normal">${m.labs.map(x => `<a href="#/gremium/${x.g.id}">${esc(x.g.kurz)}</a>`).join(", ")}</dd>` : ""}
          </dl></div>
        <div class="karte reveal"><h3>${esc(t.firmenTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(t.firmenText)}</p>
          <ul class="liste">${m.firmen.slice(0, 14).map((x, k) => `<li style="--i:${k}"><a href="#/firma/${x.id}" style="${x.vorsitz ? "" : "font-weight:400"}">${esc(FIRMEN[x.id].name)}</a><span class="neben">${x.n} ${esc(t.sitzungen)}${x.mitglied ? "" : ", Gast"}</span></li>`).join("") || `<li>${esc(T.firma.verlaufLeer)}</li>`}</ul></div>
        <div class="karte reveal"><h3>${esc(t.lueckenTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(t.lueckenText)}</p>
          <ul class="liste">${m.luecken.length ? m.luecken.slice(0, 10).map((x, k) => `<li style="--i:${k}"><a href="#/firma/${x.id}">${esc(FIRMEN[x.id].name)}</a><span class="neben">${x.n} Mal, ${esc(T.firma.statusLabel[FIRMEN[x.id].status])}</span></li>`).join("") : `<li>${esc(t.lueckenLeer)}</li>`}</ul></div>`;
      M.alles(seite);
    };
    filterBinden(app, () => { zeichne(); seitenleiste(); });
    zeichne(); seitenleiste();
  }

  // ------------------------------------------------------------ Datenschutz
  function renderDatenschutz(app) {
    const t = T.datenschutz;
    const K = t.fluss, pos = { export: [20, 70], erkennen: [210, 70], abgleichen: [400, 70], aggregieren: [590, 70], speicher: [780, 70], verworfen: [400, 220] };
    const stil = { export: ["#FFF", "#000", "#000"], erkennen: ["#FF5833", "#FF5833", "#000"], abgleichen: ["#FF5833", "#FF5833", "#000"], aggregieren: ["#FF5833", "#FF5833", "#000"], speicher: ["#000", "#000", "#FFF"], verworfen: ["#FFF", "#8B857D", "#55504A"] };
    const box = (k, i) => { const [x, y] = pos[k.id], [fill, stroke, ink] = stil[k.id], w = k.id === "verworfen" ? 340 : 160, h = 72;
      return `<g class="kachel-svg" data-k="${k.id}" style="cursor:pointer;--i:${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${(h * 0.22).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${k.id === "verworfen" ? 'stroke-dasharray="6 5"' : ""}/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="${ink}">${esc(k.titel)}</text></g>`; };
    const pfeil = (x1, y1, x2, y2, i) => `<line class="pfeil" style="--i:${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="2" marker-end="url(#pf)"/>`;
    app.innerHTML = `
      <section class="hero" style="margin-bottom:18px"><div><div class="eyebrow"><b></b> ${esc(t.eyebrow)}</div><h1>${M.worte(esc(t.titel))}</h1><p class="reveal" style="margin-top:14px;max-width:60ch;font-size:17px">${esc(t.text)}</p></div>
        <div class="karte reveal"><h3>${esc(t.rechtTitel)}</h3><p style="margin-top:8px;font-size:14px">${esc(t.rechtText)}</p></div></section>
      <section class="zwei-spalten">
        <div class="spalte-ja reveal"><h3>${esc(t.jaTitel)}</h3><ul>${t.ja.map((x, i) => `<li style="--i:${i}">${esc(x)}</li>`).join("")}</ul></div>
        <div class="spalte-nie reveal"><h3>${esc(t.nieTitel)}</h3><ul>${t.nie.map((x, i) => `<li style="--i:${i}">${esc(x)}</li>`).join("")}</ul></div></section>
      <section class="karte reveal" style="margin-top:18px"><h3>${esc(t.flussTitel)}</h3><p class="hinweis" style="margin-bottom:10px">${esc(t.flussText)}</p>
        <div class="fluss"><svg viewBox="0 0 960 320"><defs><marker id="pf" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#000"/></marker></defs>
          <rect x="196" y="40" width="568" height="134" rx="29.5" fill="none" stroke="#DAD3C9" stroke-dasharray="4 6"/><text x="480" y="30" text-anchor="middle" font-size="12" fill="#67615A">Schleuse: läuft im Speicher, speichert nichts</text>
          ${pfeil(180, 106, 208, 106, 0)}${pfeil(370, 106, 398, 106, 1)}${pfeil(560, 106, 588, 106, 2)}${pfeil(750, 106, 778, 106, 3)}
          <path class="pfeil" style="--i:4" d="M570 142 L570 190 L570 218" stroke="#8B857D" stroke-width="2" fill="none" marker-end="url(#pf)"/>
          ${K.map(box).join("")}</svg></div>
        <div class="erklaer" id="erklaer" style="margin-top:12px"><b>${esc(K[0].titel)}.</b> ${esc(K[0].text)}</div></section>
      <section class="raster-2" style="margin-top:18px">
        <div class="karte reveal"><h3>${esc(t.sonderTitel)}</h3><div class="adr" style="margin-top:10px">${t.sonder.map((s, i) => `<div class="insight" style="--i:${i}"><b>${esc(s.titel)}</b><br>${esc(s.text)}</div>`).join("")}</div></div>
        <div class="karte reveal"><h3>${esc(t.adrTitel)}</h3><div class="adr" style="margin-top:10px">${t.adr.map((a, i) => `<div class="insight" style="border-color:#0045C3;--i:${i}"><div class="kopf"><b>${esc(a.titel)}</b><span>${esc(a.nr)}</span></div>${esc(a.text)}</div>`).join("")}</div></div></section>`;
    const erkl = app.querySelector("#erklaer");
    app.querySelectorAll(".kachel-svg").forEach(g => { const zeig = () => { const k = K.find(x => x.id === g.dataset.k); erkl.style.opacity = 0; setTimeout(() => { erkl.innerHTML = `<b>${esc(k.titel)}.</b> ${esc(k.text)}`; erkl.style.opacity = 1; }, 120); app.querySelectorAll(".kachel-svg").forEach(o => o.style.opacity = o === g ? 1 : 0.45); }; g.addEventListener("mouseenter", zeig); g.addEventListener("click", zeig); });
    app.querySelector(".fluss").addEventListener("mouseleave", () => app.querySelectorAll(".kachel-svg").forEach(o => o.style.opacity = 1));
  }

  // ------------------------------------------------------------ Rahmen
  function nav(seite) {
    const n = document.getElementById("nav");
    const eintraege = [["start", "#/", T.nav.start], ["import", "#/import", T.nav.import], ["datenschutz", "#/datenschutz", T.nav.datenschutz]];
    const aktivKey = (seite === "review") ? "import" : (["firma", "gremium", ""].includes(seite) ? "start" : seite);
    if (!n.querySelector(".indikator")) n.innerHTML = `<span class="indikator"></span>` + eintraege.map(([k, h, l]) => `<a href="${h}" data-k="${k}">${esc(l)}</a>`).join("");
    const ind = n.querySelector(".indikator");
    n.querySelectorAll("a").forEach(a => { if (a.dataset.k === aktivKey) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    requestAnimationFrame(() => { const a = n.querySelector("a[aria-current]"); if (!a) { ind.classList.remove("an"); return; } ind.style.transform = `translateX(${a.offsetLeft}px)`; ind.style.width = a.offsetWidth + "px"; ind.classList.add("an"); });
  }
  function schriftErkannt() {
    try { const c = document.createElement("canvas").getContext("2d"); const probe = "BVDW Netz Mitglieder 0123 Wo"; c.font = "32px monospace"; const a = c.measureText(probe).width; c.font = '32px "PP Telegraf", monospace'; return a !== c.measureText(probe).width; } catch (e) { return false; }
  }
  function fuss() {
    document.getElementById("fuss").innerHTML = `<span>${esc(T.fuss.schrift)}: <b>${schriftErkannt() ? "PP Telegraf" : "Arial (Fallback)"}</b></span><span>${esc(T.fuss.quelle)}</span><span>${esc(T.fuss.demo)} ${D.meta.seed}</span><span><a href="https://github.com/FNNSHLE/bvdw-netz">${esc(T.fuss.repo)}</a></span>`;
  }
  function route() {
    const h = location.hash.replace(/^#\/?/, ""); const [seite, id] = h.split("/"); const app = document.getElementById("app");
    nav(seite || "start");
    M.uebergang(() => {
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      if (seite === "firma") renderFirma(app, id);
      else if (seite === "gremium") renderGremium(app, id);
      else if (seite === "import" || seite === "review") { window.NETZ_SCHLEUSE.render(app, { firma: x => FIRMEN[x] }); if (seite === "review") setTimeout(() => { const r = document.getElementById("review-karte"); if (r) r.scrollIntoView({ behavior: "smooth" }); }, 120); }
      else if (seite === "datenschutz") renderDatenschutz(app);
      else renderStart(app);
      M.alles(app);
    });
  }
  document.getElementById("demo-band").lastElementChild.textContent = T.demoBand;
  document.getElementById("untertitel").textContent = T.untertitel;
  sucheEinbauen(document.getElementById("suche-kopf"), false);
  fuss();
  window.addEventListener("hashchange", route);
  window.addEventListener("resize", () => nav((location.hash.replace(/^#\/?/, "").split("/")[0]) || "start"));
  route();
})();
