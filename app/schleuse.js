// schleuse.js: Import-Screen. Liest keine Datei. Zeigt den Weg einer Liste durch die Schleuse, mit Bewegung.
(function () {
  const T = () => window.NETZ_TEXTE.import;
  const D = () => window.NETZ_DATEN;
  const M = () => window.NETZ_MOTION;
  const KEY = "netz_schleuse";
  const WEG = /^(vorname|nachname|name|first name|last name|ticket|beitritt|verlassen|dauer|job title|scanned at|check-in|rolle|anwesend|abwesend|session)$/i;
  const REDUZIERT = { "e-mail": "Domain", "email": "Domain", "firma": "Firma", "company": "Firma", "unternehmensname": "Firma" };

  function zustand() { try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function merke(z) { try { sessionStorage.setItem(KEY, JSON.stringify(z)); } catch (e) { /* ohne Speicher laeuft es trotzdem */ } }
  const f = n => Number(n).toLocaleString("de-DE");
  const dat = s => new Date(s + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function render(wurzel, helfer) {
    const t = T(), d = D();
    const z = zustand();
    const imp = d.importe.find(i => i.id === z.import) || null;
    wurzel.innerHTML = `
      <section class="hero" style="margin-bottom:18px">
        <div>
          <div class="eyebrow"><b></b> ${esc(t.eyebrow)}</div>
          <h1>${M().worte(esc(t.titel))}</h1>
          <p class="reveal" style="margin-top:14px;max-width:62ch">${esc(t.text)}</p>
        </div>
        <div class="karte reveal">
          <h3>${esc(t.protokollTitel)}</h3>
          <p class="hinweis" style="margin-bottom:10px">${esc(t.protokollText)}</p>
          <div class="protokoll" id="protokoll"></div>
        </div>
      </section>
      <section class="drop reveal" id="drop" tabindex="0" role="button" aria-label="${esc(t.dropTitel)}">
        <h3>${esc(t.dropTitel)}</h3>
        <p class="hinweis">${esc(t.dropText)}</p>
        <p class="hinweis" style="margin-top:14px">${esc(t.beispiele)}</p>
        <div class="dateien" id="dateien"></div>
      </section>
      <section class="stufen" id="stufen"></section>
      <section class="karte reveal" style="margin-top:18px" id="review-karte">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div><h3>${esc(t.reviewTitel)}</h3><p class="hinweis">${esc(t.reviewText)}</p></div>
          <button type="button" class="knopf klein" id="reset">${esc(t.zuruecksetzen)}</button>
        </div>
        <div id="review" style="margin-top:12px"></div>
      </section>`;

    const dateien = wurzel.querySelector("#dateien"), drop = wurzel.querySelector("#drop");
    d.importe.forEach((i, k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "datei reveal"; b.style.transitionDelay = (k * 60) + "ms";
      b.innerHTML = `<span>${esc(i.datei)}</span><small>${esc(t.quelleLabel[i.quelle])} · ${f(i.zeilen)} Zeilen · ${dat(i.datum)}</small>`;
      b.addEventListener("click", ev => { ev.stopPropagation(); M().fliege(b, drop).then(() => starte(i)); });
      dateien.appendChild(b);
    });
    ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("ueber"); }));
    ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("ueber"); }));
    drop.addEventListener("drop", () => starte(d.importe[0]));           // die Datei wird nicht gelesen
    drop.addEventListener("click", () => starte(d.importe[0]));
    drop.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); starte(d.importe[0]); } });
    wurzel.querySelector("#reset").addEventListener("click", () => { merke({}); render(wurzel, helfer); M().toast(t.zuruecksetzen); });

    function starte(i) { const zz = zustand(); zz.import = i.id; zz.erledigt = zz.erledigt || []; merke(zz); zeigeStufen(i, true); zeigeReview(i); zeigeProtokoll(); }

    function zeigeStufen(i, animiert) {
      const s = wurzel.querySelector("#stufen");
      if (!i) { s.innerHTML = t.stufen.map((st, k) => `<div class="stufe${k === 3 ? " final" : ""}"><div class="nr">${esc(st.nr)}</div><div class="zahl">…</div><div class="text">${esc(st.titel)}</div></div>`).join(""); return; }
      const spalten = i.spalten.map((sp, k) => {
        const key = sp.toLowerCase(), st = `style="--i:${k}"`;
        if (REDUZIERT[key]) return `<span class="bleibt" ${st}>${esc(sp)} → ${REDUZIERT[key]}</span>`;
        if (WEG.test(sp)) return `<span class="weg" ${st}>${esc(sp)}</span>`;
        return `<span ${st}>${esc(sp)}</span>`;
      }).join("");
      const zahlen = [`<span data-stufe-zahl="${i.zeilen}">0</span>`, `${i.spalten.length} Spalten`, `<span data-stufe-zahl="${i.firmen}">0</span>`, "0"];
      const texte = [
        `${esc(t.stufen[0].text)} ${esc(t.quelleLabel[i.quelle])}, ${dat(i.datum)}.`,
        `${esc(t.stufen[1].text)}<div class="spalten">${spalten}</div>`,
        `${esc(t.stufen[2].text)}<br><b>${i.unsicher}</b> ${esc(t.unsicher)}, <b>${i.unzuordenbar}</b> ${esc(t.unzuordenbar)}.`,
        `${esc(t.stufen[3].text)}<br><b>${f(i.verworfen_personen)}</b> Zeilen verworfen.`];
      s.innerHTML = t.stufen.map((st, k) => `<div class="stufe${k === 3 ? " final" : ""}" id="stufe${k}"><div class="nr">${esc(st.nr)}</div><div class="zahl">${zahlen[k]}</div><div class="text"><b>${esc(st.titel)}</b><br>${texte[k]}</div></div>`).join("");
      t.stufen.forEach((_, k) => setTimeout(() => {
        const el = wurzel.querySelector("#stufe" + k); if (!el) return;
        el.classList.add("an");
        el.querySelectorAll("[data-stufe-zahl]").forEach(z => M().zaehle(z, parseFloat(z.dataset.stufeZahl), { dauer: animiert ? 900 : 1 }));
      }, animiert ? 200 + k * 520 : 0));
    }

    function zeigeReview(i) {
      const r = wurzel.querySelector("#review");
      if (!i) { r.innerHTML = `<p class="hinweis">${esc(t.reviewLeer)}</p>`; return; }
      const zeilen = d.review.filter(x => x.import === i.id);
      if (!zeilen.length) { r.innerHTML = `<p class="hinweis">${esc(t.reviewLeer)}</p>`; return; }
      const erl = new Set(zustand().erledigt || []);
      r.innerHTML = `<div style="overflow:auto"><table class="review"><thead><tr><th>${esc(t.reviewSpalten.roh)}</th><th>${esc(t.reviewSpalten.vorschlag)}</th><th>${esc(t.reviewSpalten.konfidenz)}</th><th>${esc(t.reviewSpalten.grund)}</th><th>${esc(t.reviewSpalten.aktion)}</th></tr></thead><tbody>
        ${zeilen.map((x, k) => { const firma = helfer.firma(x.vorschlag), key = i.id + ":" + k, done = erl.has(key);
          return `<tr class="${done ? "erledigt" : ""}" data-key="${key}"><td><code>${esc(x.roh)}</code></td><td><a href="#/firma/${x.vorschlag}">${esc(firma ? firma.name : x.vorschlag)}</a></td>
          <td><span class="konf"><span class="spur"><span class="fuell" data-breite="${Math.round(x.konfidenz * 100)}"></span></span>${Math.round(x.konfidenz * 100)} %</span></td>
          <td>${esc(x.grund)}</td><td>${done ? `<span class="status">${esc(t.erledigt)}</span>` : `<span class="aktionen"><button type="button" class="knopf klein primaer" data-k="${key}">${esc(t.bestaetigen)}</button><button type="button" class="knopf klein" data-k="${key}">${esc(t.andere)}</button><button type="button" class="knopf klein" data-k="${key}">${esc(t.verwerfen)}</button></span>`}</td></tr>`; }).join("")}
      </tbody></table></div>`;
      M().balken(r);
      r.querySelectorAll("button[data-k]").forEach(b => b.addEventListener("click", () => {
        const tr = b.closest("tr"); tr.classList.add("raus");
        setTimeout(() => {
          const zz = zustand(); zz.erledigt = Array.from(new Set([...(zz.erledigt || []), b.dataset.k])); merke(zz);
          zeigeReview(i); zeigeStufen(i, false); wurzel.querySelectorAll(".stufe").forEach(s => s.classList.add("an")); zeigeProtokoll();
          M().toast(b.textContent.trim());
        }, M().rm ? 0 : 260);
      }));
    }

    function zeigeProtokoll() {
      const p = wurzel.querySelector("#protokoll"), zz = zustand(), i = d.importe.find(x => x.id === zz.import);
      const erl = (zz.erledigt || []).filter(k => i && k.startsWith(i.id + ":")).length;
      const offen = i ? Math.max(0, d.review.filter(x => x.import === i.id).length - erl) : 0;
      const text = i
        ? `datei        ${i.datei}\nimportiert   ${dat(i.datum)}\nquelle       ${t.quelleLabel[i.quelle]}\nzeilen       ${f(i.zeilen)}\nfirmen       ${i.firmen}\nunsicher     ${offen} offen, ${erl} geprüft\nunzuordenbar ${i.unzuordenbar}\npersonen     0 gespeichert, ${f(i.verworfen_personen)} verworfen\npruefsumme   sha256:${(i.id + i.datei).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 0xffffffff, 7).toString(16).padStart(8, "0")}…`
        : "noch kein Import in dieser Sitzung";
      if (M().rm || p.textContent === text) { p.textContent = text; return; }
      let k = 0; p.textContent = "";
      const tick = setInterval(() => { k += 6; p.textContent = text.slice(0, k); if (k >= text.length) { clearInterval(tick); p.textContent = text; } }, 12);
    }

    zeigeStufen(imp, false);
    if (imp) setTimeout(() => wurzel.querySelectorAll(".stufe").forEach(s => s.classList.add("an")), 40);
    zeigeReview(imp);
    zeigeProtokoll();
    M().alles(wurzel);
  }

  window.NETZ_SCHLEUSE = { render };
})();
