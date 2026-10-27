// schleuse.js: Import-Screen. Liest keine Datei. Zeigt den Weg einer Liste durch die Schleuse.
(function () {
  const T = () => window.NETZ_TEXTE.import;
  const D = () => window.NETZ_DATEN;
  const KEY = "netz_schleuse";
  const WEG = /^(vorname|nachname|name|first name|last name|ticket|beitritt|verlassen|dauer|job title|scanned at|check-in|rolle|anwesend|abwesend|session)$/i;
  const REDUZIERT = { "e-mail": "Domain", "email": "Domain", "firma": "Firma", "company": "Firma", "unternehmensname": "Firma" };

  function zustand() { try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function merke(z) { try { sessionStorage.setItem(KEY, JSON.stringify(z)); } catch (e) { /* ohne Speicher laeuft es trotzdem */ } }
  const f = (n) => Number(n).toLocaleString("de-DE");
  const dat = (s) => new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  function render(wurzel, helfer) {
    const t = T(), d = D();
    const z = zustand();
    const imp = d.importe.find(i => i.id === z.import) || null;
    const erledigt = new Set(z.erledigt || []);
    wurzel.innerHTML = `
      <section class="hero" style="margin-bottom:18px">
        <div>
          <div class="eyebrow"><b>•</b> ${t.eyebrow}</div>
          <h1>${t.titel}</h1>
          <p style="margin-top:12px;max-width:62ch">${t.text}</p>
        </div>
        <div class="karte">
          <h3>${t.protokollTitel}</h3>
          <p class="hinweis" style="margin-bottom:10px">${t.protokollText}</p>
          <div class="protokoll" id="protokoll"></div>
        </div>
      </section>
      <section class="drop" id="drop" tabindex="0" role="button" aria-label="${t.dropTitel}">
        <h3>${t.dropTitel}</h3>
        <p class="hinweis">${t.dropText}</p>
        <p class="hinweis" style="margin-top:14px">${t.beispiele}</p>
        <div class="dateien" id="dateien"></div>
      </section>
      <section class="stufen" id="stufen"></section>
      <section class="karte" style="margin-top:18px" id="review-karte">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div><h3>${t.reviewTitel}</h3><p class="hinweis">${t.reviewText}</p></div>
          <button class="knopf klein" id="reset">${t.zuruecksetzen}</button>
        </div>
        <div id="review" style="margin-top:12px"></div>
      </section>`;

    const dateien = wurzel.querySelector("#dateien");
    d.importe.forEach(i => {
      const b = document.createElement("button");
      b.className = "datei"; b.innerHTML = `<span>${i.datei}</span><small>${t.quelleLabel[i.quelle]} · ${f(i.zeilen)} Zeilen · ${dat(i.datum)}</small>`;
      b.addEventListener("click", (ev) => { ev.stopPropagation(); starte(i); });
      dateien.appendChild(b);
    });
    const drop = wurzel.querySelector("#drop");
    ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("ueber"); }));
    ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("ueber"); }));
    drop.addEventListener("drop", () => starte(d.importe[0]));           // Datei wird nicht gelesen
    drop.addEventListener("click", () => starte(d.importe[0]));
    drop.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); starte(d.importe[0]); } });
    wurzel.querySelector("#reset").addEventListener("click", () => { merke({}); render(wurzel, helfer); });

    function starte(i) { const zz = zustand(); zz.import = i.id; zz.erledigt = zz.erledigt || []; merke(zz); zeigeStufen(i, true); zeigeReview(i); zeigeProtokoll(); }

    function zeigeStufen(i, animiert) {
      const s = wurzel.querySelector("#stufen");
      if (!i) { s.innerHTML = t.stufen.map((st, k) => `<div class="stufe${k === 3 ? " final" : ""}"><div class="nr">${st.nr}</div><div class="zahl">…</div><div class="text">${st.titel}</div></div>`).join(""); return; }
      const spalten = i.spalten.map(sp => {
        const k = sp.toLowerCase();
        if (REDUZIERT[k]) return `<span class="bleibt">${sp} → ${REDUZIERT[k]}</span>`;
        if (WEG.test(sp)) return `<span class="weg">${sp}</span>`;
        return `<span>${sp}</span>`;
      }).join("");
      const zahlen = [f(i.zeilen), `${i.spalten.length} Spalten`, f(i.firmen), "0"];
      const texte = [
        `${t.stufen[0].text} ${t.quelleLabel[i.quelle]}, ${dat(i.datum)}.`,
        `${t.stufen[1].text}<div class="spalten">${spalten}</div>`,
        `${t.stufen[2].text}<br><b>${i.unsicher}</b> ${t.unsicher}, <b>${i.unzuordenbar}</b> ${t.unzuordenbar}.`,
        `${t.stufen[3].text}<br><b>${f(i.verworfen_personen)}</b> Zeilen verworfen.`];
      s.innerHTML = t.stufen.map((st, k) => `<div class="stufe${k === 3 ? " final" : ""}" id="stufe${k}"><div class="nr">${st.nr}</div><div class="zahl">${zahlen[k]}</div><div class="text"><b>${st.titel}</b><br>${texte[k]}</div></div>`).join("");
      t.stufen.forEach((_, k) => setTimeout(() => { const el = wurzel.querySelector("#stufe" + k); if (el) el.classList.add("an"); }, animiert ? 250 + k * 450 : 0));
    }

    function zeigeReview(i) {
      const r = wurzel.querySelector("#review");
      if (!i) { r.innerHTML = `<p class="hinweis">${t.reviewLeer}</p>`; return; }
      const zeilen = d.review.filter(x => x.import === i.id);
      if (!zeilen.length) { r.innerHTML = `<p class="hinweis">${t.reviewLeer}</p>`; return; }
      const z = zustand(); const erl = new Set(z.erledigt || []);
      r.innerHTML = `<div style="overflow:auto"><table class="review"><thead><tr><th>${t.reviewSpalten.roh}</th><th>${t.reviewSpalten.vorschlag}</th><th>${t.reviewSpalten.konfidenz}</th><th>${t.reviewSpalten.grund}</th><th>${t.reviewSpalten.aktion}</th></tr></thead><tbody>
        ${zeilen.map((x, k) => { const firma = helfer.firma(x.vorschlag); const key = i.id + ":" + k; const done = erl.has(key);
          return `<tr class="${done ? "erledigt" : ""}"><td><code>${x.roh}</code></td><td><a href="#/firma/${x.vorschlag}">${firma ? firma.name : x.vorschlag}</a></td>
          <td><span class="konf"><span class="spur"><span class="fuell" style="width:${Math.round(x.konfidenz * 100)}%"></span></span>${Math.round(x.konfidenz * 100)} %</span></td>
          <td>${x.grund}</td><td>${done ? `<span class="status">${t.erledigt}</span>` : `<span class="aktionen"><button class="knopf klein primaer" data-k="${key}">${t.bestaetigen}</button><button class="knopf klein" data-k="${key}">${t.andere}</button><button class="knopf klein" data-k="${key}">${t.verwerfen}</button></span>`}</td></tr>`; }).join("")}
      </tbody></table></div>`;
      r.querySelectorAll("button[data-k]").forEach(b => b.addEventListener("click", () => { const zz = zustand(); zz.erledigt = Array.from(new Set([...(zz.erledigt || []), b.dataset.k])); merke(zz); zeigeReview(i); zeigeStufen(i, false); wurzel.querySelectorAll(".stufe").forEach(s => s.classList.add("an")); zeigeProtokoll(); }));
    }

    function zeigeProtokoll() {
      const p = wurzel.querySelector("#protokoll"); const z = zustand(); const i = d.importe.find(x => x.id === z.import);
      const erl = (z.erledigt || []).filter(k => i && k.startsWith(i.id + ":")).length;
      const offen = i ? Math.max(0, d.review.filter(x => x.import === i.id).length - erl) : 0;
      p.textContent = i
        ? `datei        ${i.datei}\nimportiert   ${dat(i.datum)}\nquelle       ${t.quelleLabel[i.quelle]}\nzeilen       ${f(i.zeilen)}\nfirmen       ${i.firmen}\nunsicher     ${offen} offen, ${erl} geprüft\nunzuordenbar ${i.unzuordenbar}\npersonen     0 gespeichert, ${f(i.verworfen_personen)} verworfen\npruefsumme   sha256:${(i.id + i.datei).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 0xffffffff, 7).toString(16).padStart(8, "0")}…`
        : "noch kein Import in dieser Sitzung";
    }

    zeigeStufen(imp, false);
    if (imp) setTimeout(() => wurzel.querySelectorAll(".stufe").forEach(s => s.classList.add("an")), 30);
    zeigeReview(imp);
    zeigeProtokoll();
  }

  window.NETZ_SCHLEUSE = { render };
})();
