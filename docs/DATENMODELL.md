# Datenmodell

Vier Knotentypen, fünf Kantentypen, kein Personenfeld. Die Demo-Daten in `daten/demo.json` folgen genau diesem Schema, damit echte Aggregate später eins zu eins eingesetzt werden können.

## Knoten

| Typ | Schlüssel | Attribute |
|---|---|---|
| Unternehmen | CRM-Firmen-ID | name, status (mitglied, ehemalig, lead), kategorie, branche, domains, mitglied_seit, ausgetreten, einzelperson_firma |
| Gremium | slug | typ (working_group, circle, lab, initiative, expert_group), name, kurz, parent (Labs hängen an einer Working Group) |
| Format | slug | name, kurz, typ (konferenz, meetup, dmexco, award, online, academy, studie), rhythmus, gremium (optional) |
| Event-Instanz | id | ref (Format oder Gremium), reftyp, datum, ort, modus (praesenz, online), quelle (checkin, swapcard, teams, liste) |

## Kanten

| Kante | Attribute |
|---|---|
| Unternehmen TEILNAHM_AN Event-Instanz | anzahl (als Stufe: 1, 2 bis 4, 5 bis 9, 10 und mehr), rolle (teilnehmer, speaker, sponsor, host), quelle, konfidenz |
| Unternehmen MITGLIED_IN Gremium | rolle (mitglied, vorsitz, stellv), seit, bis |
| Unternehmen PARTNER_VON Format | jahr, art (sponsor, medienpartner, co-host) |
| Event-Instanz INSTANZ_VON Format oder Gremium | |
| Format GEHOERT_ZU Gremium | zum Beispiel KI Meet-Up zur Working Group Künstliche Intelligenz |

Konfidenz der Zuordnung: Domain exakt 1,0, Domain-Alias 0,95, unscharfer Namensvergleich 0,6 bis 0,9, manuell bestätigt 1,0.

## Zeit

Format und Gremium sind zeitlos. Die Event-Instanz trägt das Datum. Die Kante Unternehmen zu Format im Netz ist abgeleitet: Gewicht gleich Anzahl Instanzen im gewählten Zeitfenster (Standard zwölf Monate rollierend). Event-Instanzen sind im Diagramm keine Knoten, nur Kantengewicht und Zeitstrahl. So bleibt das Netz lesbar und die Historie trotzdem erhalten.

## Aktivitätsindex

Null bis hundert, zwölf Monate rollierend, immer mit den drei Teilwerten angezeigt. Sonst glaubt niemand der Zahl.

```
Index       = 40 x Breite + 40 x Häufigkeit + 20 x Tiefe
Breite      = min(1, verschiedene Formate / 5)
Häufigkeit  = min(1, Event-Instanzen / 8), Instanzen älter als 6 Monate zählen halb
Tiefe       = min(1, 0,5 x Gremienmitglied + 1,0 x Vorsitz + 0,5 x Speaker + 0,5 x Sponsor)
```

Die Personenzahl fließt bewusst nicht ein, sonst stehen Konzerne automatisch oben. Die Grenzwerte 5 und 8 sind Startwerte und werden an der echten Verteilung kalibriert.

## Beispiel (aus den Demo-Daten)

```json
{"id": "f01", "name": "Nordlicht Telco AG", "demo": true, "status": "mitglied", "kategorie": "Werbungtreibende",
 "branche": "konzern", "domain": "nordlicht-telco.example", "mitglied_seit": 2012}
{"firma": "f01", "event": "e042", "anzahl": 3, "rolle": "teilnehmer"}
{"firma": "f01", "gremium": "g12", "rolle": "mitglied", "seit": "Monat des Eintritts", "bis": null}
```

## Was aus dem Import übrig bleibt

Je Lauf ein Protokoll: Dateiname, Datum, Quelle, Zeilen, zugeordnete Firmen, unsichere Fälle, unzuordenbare Zeilen, verworfene Personenzeilen, Prüfsumme der Datei gegen Doppelimport. Keine Zeile der Datei.
