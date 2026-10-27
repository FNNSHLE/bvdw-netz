# ADR-002: KI sieht nie Personenzeilen

Status: vorgeschlagen, 27.10.2026

## Kontext
KI soll beim Import helfen (Spalten erkennen, Firmennamen auflösen) und später Fragen beantworten. Externe Modelle laufen bei Anbietern, denen keine Personendaten anvertraut werden sollen.

## Entscheidung
An ein Modell gehen nur Spaltenköpfe, Firmennamen-Paare (nach Filter auf Namensmuster) und Fragen gegen das Aggregat. Niemals eine Zeile mit Name oder E-Mail, niemals eine Rohdatei, niemals Firmennamen von Einzelunternehmern. Ein automatisierter Test prüft jeden Prompt-Builder auf E-Mail-Muster und Namensformen.

## Folgen
Die Namensauflösung bleibt für unbekannte Fälle etwas schlechter, weil das Modell keinen Kontext aus der Zeile bekommt. Dafür ist die Anbieterfrage entschärft: der Anbieter sieht Geschäftsdaten, keine Personen.
