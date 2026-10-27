# PRD: BVDW Netz (Arbeitstitel)

Stand 27.10.2026. Produktanforderungen für ein internes Werkzeug des BVDW. Status: Konzept mit Click-Dummy, noch nicht beschlossen.

## 1. Problem

Der BVDW weiß, wer Mitglied ist. Das steht im CRM. Er weiß nicht verlässlich, wo ein Mitglied aktiv ist: in welcher Working Group, bei welchem Format, wie oft, seit wann, mit wem. Anwesenheiten liegen verstreut in Excel-Listen, Messe-Exporten und in Teams-Berichten, die niemand sammelt. Eine Liste, welche Firma in welchem Gremium sitzt, gibt es maschinenlesbar nicht. Mitgliedergespräche, Kündigungsprävention und die Rekrutierung in Gremien laufen deshalb auf Einzelwissen.

## 2. Zielbild in einem Satz

Eine Suche nach einer Firma zeigt in zehn Sekunden, wo diese Firma im BVDW aktiv war und wo nicht, ohne dass das System eine einzige Person kennt.

## 3. Personas und Jobs-to-be-done

| Persona | Job 1 | Job 2 | Job 3 |
|---|---|---|---|
| Membership Services | Vor einem Verlängerungsgespräch in 30 Sekunden sehen, was die Firma in zwölf Monaten gemacht hat | Nichtmitglieder finden, die bei mehreren Formaten auftauchen | Mitglieder ohne Aktivität in zwölf Monaten als Liste bekommen, bevor die Kündigung kommt |
| Gremienbetreuung (Unit Leads) | Wissen, welche Firmen im Gremium sitzen und wer wirklich kommt | Firmen finden, die thematisch passen, aber noch nicht im Gremium sind | Vitalität des Gremiums über die Zeit zeigen |
| Geschäftsführung | Eine Zahl für Präsidium und Mitgliederversammlung: Anteil der Mitgliedsfirmen, die wir im Jahr erreicht haben | Weiße Flecken je Mitgliedersegment sehen | Formatportfolio bewerten: welche Formate erreichen Mitglieder, welche nur Externe |
| Events | Check-in so einfach, dass er an jeder Tür funktioniert | Nach dem Event eine Datei, fertig | Keine neue Pflege, kein zweites System |

Entscheidungen, die besser werden: Priorisierung von Verlängerungsgesprächen, Zielliste für die Akquise, Rekrutierung in Gremien, Prüfung der Einstufung wichtiger Mitglieder gegen tatsächliche Aktivität, Keep-or-Kill bei Formaten.

## 4. Kernprinzip: Firmen, nicht Personen

Der Personenbezug endet an der Schleuse. Das Werkzeug kennt Unternehmen, Gremien, Formate und Termine. Personenzeilen werden nur im Importschritt angefasst, im Speicher, und nach dem Verdichten verworfen. Details in `DATENSCHUTZ-SCHLEUSE.md`, Entscheidungen in `adr/`.

## 5. Scope je Phase

| Phase | Scope | Nicht-Scope | Definition of Done |
|---|---|---|---|
| 0 Prozess | Check-in-SOP für physische Events, Teams-Export-Routine für Gremien-Calls, Memo an den Datenschutzbeauftragten, Satz in den Datenschutzhinweisen, Gremienliste auf Firmenebene erstmals erheben | Code, Netz, KI, Rückwirkung vor 2026 | SOP abgenommen, Freigabe oder Auflagen des DSB, Gremienliste gefüllt, drei Events in Folge mit Check-in-Datei |
| 1 Schleuse und Tabelle | Import als Kommandozeile, Spaltenerkennung, Domain-Abgleich gegen das CRM, Aliasliste, Prüfliste, Aggregat-Datenbank, Firmentabelle, drei Listen, CSV für das CRM. Backfill mit vorhandenen Listen | Oberfläche außer Tabelle, Schreibzugriff ins CRM per API, Teams-Automatisierung | Altquellen importiert, Test „kein @ und kein Personenfeld in der Datenbank“ grün, Prüfliste abgearbeitet, erste CRM-Felder gefüllt, Membership Services hat die Churn-Liste kommentiert |
| 2 Netz-Oberfläche | Statische Oberfläche mit Suche, Netz, Steckbrief, Tabelle, Zeitfilter, Export. Hosting intern | Nutzerverwaltung, Schreiben in der Oberfläche, Mobile | Fünf echte Gespräche mit Steckbrief vorbereitet, eine Gremienlücke gefunden, Reichweitenzahl im Präsidium gezeigt |
| 3 KI | Modellgestützte Namensauflösung für den Rest, Steckbrief-Text, Standardfragen und Text-to-SQL, PII-Filter als Test | Eigenes Training, Vorhersagen, Chatbot für Mitglieder | Zehn Testfragen korrekt, kein Prompt mit Personenfeld (automatisiert geprüft), Anbieter vom DSB freigegeben |

## 6. KI-Funktionen nach Wert und Aufwand

| Funktion | Phase | Wie |
|---|---|---|
| Namensauflösung Firma gegen CRM | 1 | Kaskade: Domain exakt, Domain-Alias, Name normalisiert, unscharfer Vergleich, Modell nur für den Rest in Paaren. Jede manuelle Entscheidung wird ein Alias |
| Spaltenerkennung beim Import | 1 | Synonymliste für bekannte Quellen. Modell nur für unbekannte Köpfe, es sieht nur Köpfe |
| Hinweise aus Regeln | 1 | Abwanderungsrisiko, warmer Lead, Gremienlücke. Das ist eine Abfrage, keine KI |
| Gesprächs-Steckbrief | 2 | Vorlage aus Aggregaten, Modell glättet den Text. Enthält nie Personen |
| Frage in natürlicher Sprache | 3 | Erst zehn Standardfragen als Knöpfe, dann Text-to-SQL mit angezeigter Abfrage |

Die Suche nach einer Firma ist Volltext über Name und Aliase, keine KI. Das sagen wir auch so.

## 7. Build, Buy oder CRM

Der Kern ist eine Tabelle Firma mal Format mal Zeit, verdichtet zu vier Zahlen je Firma: Aktivitätsindex, letzte Aktivität, aktive Formate, Gremien. Diese vier Zahlen gehören ins CRM, wo Membership Services ohnehin arbeitet. Dort funktionieren Listen, Berichte und Workflows ohne neues Werkzeug. Phase 1 schreibt sie als monatlichen CSV-Import, später per API.

Gekaufte Graph-Werkzeuge scheiden aus: Hosting außerhalb der EU, Lizenzkosten, Lernkurve für eine Handvoll Nutzer. CRM-Funktionen für Veranstaltungsteilnahme arbeiten auf Personenebene und widersprechen dem Kernprinzip.

Das Netzdiagramm ist Pitch und Exploration, nicht Alltag. Im Alltag zählen Suche, Steckbrief und drei Listen. Das Netz zeigt, was man nicht gesucht hat. Es bleibt im Plan, als Sicht auf dieselben Daten (ADR-005).

## 8. Erfolgsmetriken

1. Abdeckung: Anteil physischer Events mit Check-in-Datei, Anteil Gremien-Calls mit Export.
2. Trefferquote: Anteil importierter Zeilen mit zugeordneter Firma. Zielwert nach dem ersten Backfill festlegen, nicht raten.
3. Reichweite: Anteil Mitgliedsfirmen mit mindestens einer Aktivität in zwölf Monaten.
4. Nutzung: Steckbriefe und Listenabrufe pro Monat.
5. Wirkung: Anteil der Verlängerungsgespräche, die mit Steckbrief vorbereitet wurden. Später Kündigungsquote bei als still markierten Firmen, mit und ohne Ansprache.
6. Compliance: null Personenfelder in der Datenbank, automatisch geprüft, vollständiges Importprotokoll je Lauf.

## 9. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Scannen an der Tür wird lästig oder vergessen | Scan als Vorteil (Badge, schnelle Spur), QR im Ticket, Papierliste als Fallback, Events-Team als Owner |
| Mitglieder empfinden es als Überwachung | Prinzip offen kommunizieren („wir zählen Firmen, nicht Menschen“), Statement des DSB, Gegenleistung in Form von Gremienberichten, Opt-out auf Firmenebene |
| Datenqualität bei Firmennamen | Domain zuerst, Aliasliste wächst mit jeder Prüfentscheidung, Konzernstrukturen bewusst später |
| Externe in Teams ohne Login | Verlust akzeptieren und zählen, Betreuung bittet um Login, Berichtseinstellung in der SOP |
| Werkzeugmüdigkeit und Besitzfrage | Business Owner Membership Services, Product Owner bis Ende Phase 2 benannt, Import als monatliches Ritual von zwei Minuten, Ergebnis landet im CRM |
| Öffentliches Repo mit echten Daten | Dieses Repo trägt nur Demo-Daten. Echte Aggregate liegen außerhalb, ein Test im CI prüft `daten/` |

## 10. Offene Fragen

1. Besitz: Übernimmt Membership Services die Rolle des Business Owners und das monatliche Import-Ritual?
2. Check-in-Werkzeug außerhalb der Messe: Ticket-Tool, CRM-Formular, eigene App, Papierliste?
3. Schreibzugriff ins CRM per API oder manueller CSV-Import?
4. Hosting der echten Oberfläche: lokal, interne Dateiablage, Cloud mit Firmenlogin?
5. Scan-Pflicht bei allen Events oder mit Schwellwert für kleine Runden?
6. Welcher KI-Anbieter mit welchem Vertrag für Firmennamen-Paare und Fragen an das Aggregat?
