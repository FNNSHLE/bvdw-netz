# BVDW Netz

**Wo ist welches Unternehmen im BVDW aktiv?** Ein Click-Dummy und ein Produktkonzept für ein internes Werkzeug, das aus Check-in-Scans und Teams-Anwesenheiten ein Netz baut: Unternehmen, Gremien, Formate, Termine. Ohne eine einzige Person zu speichern.

Demo: **https://fnnshle.github.io/bvdw-netz/**

> Demo-Daten. Alle Firmen sind erfunden, Domains enden auf `.example`. Gremien- und Formatnamen sind echt (bvdw.org, Stand 27.10.2026). Keine Person ist enthalten, keine echte Firma, keine interne Zahl.

## Die Idee in fünf Sätzen

Der Verband weiß, wer Mitglied ist, aber nicht, wo ein Mitglied aktiv ist. Ab sofort wird an jeder Tür gescannt und jeder Teams-Bericht gesammelt. Eine Schleuse reduziert jede Zeile auf E-Mail-Domain und Firma, gleicht gegen das CRM ab, zählt je Firma und Termin und verwirft die Zeile. Übrig bleibt ein Netz, das in zehn Sekunden zeigt, wo eine Firma war und wo nicht. Membership Services bekommt daraus drei Listen: Abwanderungsrisiko, warme Leads, Gremienlücken.

## Prinzip

**Wir zählen Firmen, nicht Menschen.** Das Datenmodell hat kein Personenfeld. KI sieht nur Spaltenköpfe und Firmennamen. Die Entscheidungen dahinter stehen in [`docs/adr/`](docs/adr/), das Datenschutz-Konzept in [`docs/DATENSCHUTZ-SCHLEUSE.md`](docs/DATENSCHUTZ-SCHLEUSE.md).

## Status

| Phase | Inhalt | Stand |
|---|---|---|
| Dummy | Click-Dummy mit sechs Screens, Konzept, ADRs | fertig, 27.10.2026 |
| 0 Prozess | Check-in-SOP, Teams-Export, Memo an den Datenschutzbeauftragten, Gremienliste | offen |
| 1 Schleuse | Import, Abgleich, Aggregat, drei Listen, CRM-Felder | offen |
| 2 Netz | Oberfläche auf echten Aggregaten, intern gehostet | offen |
| 3 KI | Namensauflösung, Steckbrief-Text, Fragen in Sprache | offen |

Das Backlog liegt in den [Issues](../../issues), sortiert nach Phase.

## Lokal starten

Mac: Doppelklick auf `Start (Mac).command`. Windows: `Start (Windows).bat`. Oder `app/index.html` im Browser öffnen. Kein Internet nötig, kein Build, kein Node.

```
app/        Dummy (HTML, CSS, JS, d3 lokal)
daten/      Demo-Daten (demo.json, demo.js) und die echten Listen der Gremien und Formate
werkzeuge/  demo_daten.py (erzeugt), pruefe_demo.py (prüft), screenshots.sh, kontrast.py, copy_pruefen.py, buendeln.py
docs/       PRD, Datenmodell, Datenschutz-Schleuse, Prozesse, Pitch, ADRs, Screenshots
```

Demo-Daten neu erzeugen: `python3 werkzeuge/demo_daten.py` (fester Seed, zweimal laufen ergibt dieselbe Datei). Prüfen: `python3 werkzeuge/pruefe_demo.py`.

## Was der Dummy zeigt

1. **Start**: Reichweite der Mitglieder in zwölf Monaten, weiße Flecken je Segment, Suche.
2. **Firma**: Netz der Firma (Gremien blau, Formate orange, Kantenstärke gleich Häufigkeit), Steckbrief, Aktivitätsindex mit drei Teilen, Zeitstrahl, Hinweise aus Regeln, drei vorbereitete Fragen.
3. **Gremium**: Netz eines Gremiums, Firmen nach Aktivität, wer fehlt.
4. **Import**: die Schleuse in vier Schritten, Prüfliste, Importprotokoll. Es wird keine Datei gelesen.
5. **Datenschutz**: was gespeichert wird, was nie, der Datenfluss.

## Lizenz

Internes Werkzeug des BVDW, kein Open Source, alle Rechte vorbehalten. Die Demo-Daten dürfen frei verwendet werden. d3 steht unter ISC (`app/lib/LICENSE-d3.txt`).
