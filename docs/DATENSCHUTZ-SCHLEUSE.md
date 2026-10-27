# Die Schleuse: Datenschutz-Konzept (Entwurf für den Datenschutzbeauftragten)

Stand 27.10.2026. Entwurf, noch nicht geprüft. Alles, was hier steht, ist ein Vorschlag an den Datenschutzbeauftragten des BVDW.

## Prinzip

Der Personenbezug endet an der Schleuse. Das Werkzeug kennt Unternehmen, Gremien, Formate und Termine. Personenzeilen werden ausschließlich im Importschritt angefasst, im Arbeitsspeicher, und nach dem Verdichten verworfen. Es gibt im Datenmodell kein Feld, in dem eine Person stehen könnte.

## Datenfluss in fünf Schritten

1. **Import.** Die Datei (CSV, Excel, Teams-Bericht) wird gelesen, nie kopiert, nie in eine Datenbank geschrieben.
2. **Reduktion.** Je Zeile bleiben drei Dinge: die E-Mail-Domain (der Teil vor dem @ wird sofort verworfen), die Firmenspalte, falls vorhanden, und die Rolle der Firma (Teilnehmer, Speaker, Sponsor, Host). Vorname, Nachname, Beitritts- und Austrittszeiten, Ticketcodes und Freitexte werden nicht gelesen.
3. **Abgleich.** Domain gegen die Firmendomains im CRM. Fallback Firmenname gegen Aliasliste, dann unscharfer Vergleich, dann Prüfliste für einen Menschen. Nicht zuordenbare Zeilen werden nur gezählt.
4. **Aggregat.** Je Firma und Termin: anwesend ja, Anzahl als Stufe (1, 2 bis 4, 5 bis 9, 10 und mehr), Rolle der Firma, Quelle, Konfidenz.
5. **Löschen.** Nach dem Lauf existiert keine Zeile der Datei im Werkzeug. Das Protokoll kennt Dateiname, Zeilenzahl, Trefferquote, Zeitstempel und eine Prüfsumme gegen Doppelimport. Die Originaldatei bleibt, wo sie ist, im Eventordner mit der dortigen Löschfrist.

## Was nie gespeichert wird

Namen, E-Mail-Adressen, Local-Parts, Teilnahmedauer, personenbezogene Rollen („Frau X ist Vorsitzende“), Ticket- oder Badge-Nummern, Rohdateien, auch nicht als Kopie oder im Kontext eines KI-Modells.

## Was gespeichert wird

CRM-Firmen-ID, Firmenname, Status, Kategorien, Domains, Gremienzugehörigkeit auf Firmenebene mit Rolle und Zeitraum („stellt den Vorsitz seit 2025“), Termine mit Anwesenheitsstufe je Firma, Importprotokolle.

## Drei Sonderfälle

**Einzelunternehmer.** Hier ist die Firma die Person. Vorschlag: ein Flag `einzelperson_firma` (Heuristik: Domain enthält Personennamen, Rechtsform e.K. oder keine, ein Kontakt im CRM, manuell bestätigt). Für Mitglieder mit Flag nur Anwesenheit ja oder nein je Quartal, keine Stufe, kein Index, Sichtbarkeit nur für Membership Services und Geschäftsführung. Nichtmitglieder mit Flag nur als Sammelknoten „Einzelpersonen“. Ob das reicht oder ob Einzelunternehmer ganz herausbleiben, entscheidet der DSB.

**Kleine Termine.** Unter fünf teilnehmenden Firmen je Termin wird keine Firmenliste des Termins angezeigt. Die Anwesenheit zählt trotzdem in den Index der Firma. Die Stufen statt exakter Zahlen verhindern Aussagen wie „genau eine Person von Firma X war da“. Der Schwellwert fünf ist ein Startwert.

**Rollen statt Namen.** Vorsitz, Speaker, Sponsor, Jury werden als Firmenattribut mit Zeitraum geführt. Der Name steht ohnehin auf der Website des Verbands, das Werkzeug verlinkt dorthin, statt ihn zu speichern.

## E-Mail-Domain als Firmenschlüssel

Normalisierung: Kleinschreibung, Subdomains kappen, öffentliche Suffixe beachten. Eine Firma kann mehrere Domains haben, das CRM führt meist eine. Deshalb eine gepflegte Aliasliste für Domains im Repo. Firmendomains sind Geschäftsdaten.

Generische Anbieter (gmail, gmx, web.de, outlook, t-online, yahoo, icloud und ähnliche): kein Abgleich über die Domain, nur über die Firmenspalte. Fehlt sie, zählt die Zeile als unzuordenbar. Keine Heuristik über den Local-Part, der ist zu diesem Zeitpunkt schon weg.

## Rechtsgrundlage (Vorschlag zur Prüfung)

Für den kurzen Importschritt: berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) an Verbandsverwaltung und Mitgliederbetreuung, bei Mitgliedern zusätzlich das Mitgliedschaftsverhältnis (lit. b). Die Anwesenheitslisten wurden zur Durchführung der Veranstaltung erhoben. Die sofortige Verdichtung auf Unternehmensebene wäre ein kompatibler Zweck (Art. 6 Abs. 4), weil das Ergebnis keinen Personenbezug mehr hat. Trotzdem: die Datenschutzhinweise der Anmeldungen um einen Satz ergänzen („Auswertung der Teilnahme auf Unternehmensebene“).

Ins Verarbeitungsverzeichnis (Art. 30): „Aggregierte Teilnahmeauswertung auf Unternehmensebene“, Datenkategorien im Importschritt (Name, E-Mail, Firma, Rolle), Zweck, keine externen Empfänger, Löschung sofort nach Verdichtung, technische Maßnahmen (lokale Verarbeitung, kein Personenfeld im Datenmodell, automatisierter Test auf Personenfelder).

## Was der Datenschutzbeauftragte freigibt

1. Das Schleusenprinzip als Ganzes.
2. Die Regel für Einzelunternehmer.
3. Den Schwellwert für kleine Termine.
4. Die Formulierung in den Datenschutzhinweisen.
5. Ob eine Schwellwertanalyse zur Datenschutz-Folgenabschätzung genügt (unsere Annahme: ja, weil kein Personenprofil entsteht).
6. Welcher KI-Anbieter mit welchem Vertrag zulässig ist.

## KI-Aufrufe

| Erlaubt | Tabu |
|---|---|
| Spaltenköpfe zur Erkennung des Mappings | Jede Zeile mit Name oder E-Mail an einen externen Anbieter, egal wo er sitzt |
| Firmennamen-Paare zur Namensauflösung, nachdem Zeilen mit Personennamen-Mustern herausgefiltert sind | Firmennamen von Einzelunternehmern (das ist der Personenname) |
| Fragen gegen das Aggregat | Teams-Berichte als Ganzes „zum Zusammenfassen“ |
| Steckbrief-Text aus Aggregaten | Rohdateien in einen Chat-Kontext ziehen, auch nicht „nur kurz zum Prüfen“ |

Das ist ADR-002 und wird als automatisierter Test erzwungen: jeder Prompt läuft durch einen Filter, der E-Mail-Muster und bekannte Namensformen blockt.
