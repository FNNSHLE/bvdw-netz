# ADR-007: Statisch ohne Build, d3 lokal, SVG-Knoten, Ego-Netz

Status: beschlossen, 27.10.2026

## Kontext
Der Dummy muss per Doppelklick und auf GitHub Pages laufen, ohne Node, ohne Build, auch offline.

## Entscheidung
Reines HTML, CSS und JavaScript mit klassischen Skript-Tags. Daten als JavaScript-Global, weil `fetch` auf `file://` scheitert. d3 7.9.0 liegt lokal im Repo (ISC-Lizenz). Knoten sind SVG-Rechtecke mit Radius 22 Prozent der Seite (Master-Pixel). Es wird nur das Ego-Netz der Fokus-Entität gezeichnet, nie der Vollgraph. Das Layout wird mit festem Seed vorgerechnet und gestoppt.

## Folgen
Keine Abhängigkeiten, keine Toolchain, reproduzierbare Screenshots. Bei echten Daten mit mehreren hundert Firmen bleibt das Ego-Netz; eine Gesamtübersicht bräuchte Canvas.
