# Prozess: Check-in bei physischen Events (Entwurf)

Stand 27.10.2026. Entwurf für das Events-Team. Platzhalter sind mit [… tbc] markiert und werden mit dem Team gefüllt.

## Ziel

Nach jedem physischen Event liegt eine Datei vor, aus der die Schleuse Firmen-Aggregate bauen kann. Kein zweites System, keine Nachpflege, eine Datei.

## Mindestfelder je Teilnehmer

- E-Mail-Adresse (daraus wird die Firmendomain, der Rest wird verworfen).
- Firma als Freitext, als Fallback für private Adressen.
- Check-in ja oder nein (oder Zeitstempel).

Alles andere darf in der Datei stehen, wird aber nicht gelesen.

## Vor dem Event

1. Anmeldung läuft über [Werkzeug, tbc]. Pflichtfelder: E-Mail und Firma.
2. Jede Anmeldung bekommt einen QR-Code im Ticket oder in der Bestätigungsmail. [Werkzeug prüfen, tbc]
3. Die Datenschutzhinweise der Anmeldung enthalten den Satz zur Auswertung auf Unternehmensebene. [Formulierung vom DSB, tbc]

## Am Einlass

1. Scan des QR-Codes mit [Scanner-App oder Handy, tbc]. Ein Scan je Person, drei Sekunden.
2. Ohne QR: Name auf der Empfangsliste abhaken. Die Liste ist der Fallback und wird nach dem Event in die Datei übertragen.
3. Spontangäste: E-Mail und Firma auf der Nachtragsliste erfassen, mit Hinweis auf die Datenschutzhinweise.
4. Kleine Runden unter [Schwellwert, tbc] Personen: statt Scan reicht die Firmenliste der Gastgeberin.

## Nach dem Event

1. Export aus dem Anmeldewerkzeug als CSV oder Excel, Dateiname `checkin_<format>_<JJJJ-MM>.csv`.
2. Ablage im Eventordner unter [Pfad, tbc]. Dort gilt die Löschfrist des Eventordners.
3. Meldung an den Owner des Imports: „Datei liegt“. Der Import dauert zwei Minuten.
4. Die Datei wird nie per Mail weitergeleitet und nie in einen Chat kopiert.

## Rollen

| Rolle | Aufgabe |
|---|---|
| Events-Team | Anmeldung einrichten, Scan am Einlass, Export, Ablage |
| Gastgeberin des Formats | Nachtragsliste, Spontangäste, kleine Runden |
| Owner des Imports | Datei durch die Schleuse schicken, Prüfliste abarbeiten |

## Was wir messen

Anteil der physischen Events mit Check-in-Datei. Ziel: alle. Erste Zielmarke: drei Events in Folge.
