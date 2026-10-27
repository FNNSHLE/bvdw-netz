# ADR-001: Unternehmen statt Personen

Status: vorgeschlagen, 27.10.2026

## Kontext
Der Wunsch lautet „Personen und Unternehmen in Beziehung zu Formaten und Gremien“. Gleichzeitig dürfen keine personenbezogenen Daten ins System. Beides zusammen geht nicht.

## Entscheidung
Das Datenmodell kennt Unternehmen, Gremien, Formate und Termine. Es gibt kein Personenfeld. Personen tauchen nur als Zählgröße (Anzahl je Firma und Termin, als Stufe) und als Rolle der Firma auf („stellt den Vorsitz“).

## Folgen
Fragen wie „wer von Firma X war da“ beantwortet das Werkzeug nie. Dafür braucht es keine Einwilligung je Person, keine Löschfristen je Person, keine Auskunftsprozesse. Was nicht gespeichert ist, kann nicht leaken.
