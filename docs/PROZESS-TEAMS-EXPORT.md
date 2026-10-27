# Prozess: Anwesenheit aus Teams-Calls (Entwurf)

Stand 27.10.2026. Entwurf für die Betreuerinnen der Gremien. Platzhalter mit [… tbc].

## Ziel

Nach jeder Sitzung eines Gremiums liegt der Anwesenheitsbericht aus Teams in einem festen Ordner. Die Schleuse macht daraus: welche Firma war da. Nicht wer, nicht wie lange.

## Einmalig einrichten

1. In den Besprechungsoptionen der Serie „Anwesenheitsbericht zulassen“ aktivieren. Ohne diese Einstellung gibt es keinen Bericht. [Screenshot, tbc]
2. Teilnehmer bitten, sich mit ihrem Firmenkonto einzuwählen. Gäste ohne Login erscheinen nur mit Anzeigename und sind nicht zuordenbar. Das ist in Ordnung, sie werden gezählt, nicht verloren.

## Nach jeder Sitzung

1. Im Chat der Besprechung den Anwesenheitsbericht herunterladen (CSV).
2. Umbenennen nach dem Muster `teams_<gremium-slug>_<JJJJ-MM-TT>.csv`.
3. Ablegen unter [Ordner in der Teamablage, tbc] im Unterordner des Gremiums.
4. Fertig. Mehr nicht. Der Import holt sich die Dateien monatlich.

## Was nicht passiert

- Der Bericht wird nicht geöffnet, nicht gelesen, nicht weitergeleitet.
- Niemand übernimmt Namen in eine Tabelle.
- Aus den Spalten Beitritt, Verlassen und Dauer wird nichts gelesen. Sie fallen an der Schleuse weg.

## Was die Schleuse aus dem Bericht macht

| Spalte im Bericht | Was passiert |
|---|---|
| Name | wird nicht gelesen |
| E-Mail | nur die Domain bleibt |
| Beitrittszeit, Austrittszeit, Dauer | werden nicht gelesen |
| Rolle (Organisator, Referent, Teilnehmer) | wird zur Firmenrolle, falls relevant |

## Was wir messen

Anteil der Gremiensitzungen mit Bericht im Ordner. Ziel: alle Sitzungen der Working Groups und Circles.
