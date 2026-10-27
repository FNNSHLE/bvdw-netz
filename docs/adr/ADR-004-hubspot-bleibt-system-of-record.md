# ADR-004: Das CRM bleibt System of Record

Status: vorgeschlagen, 27.10.2026

## Kontext
Der Mitgliedsstatus lebt im CRM. Membership Services arbeitet dort. Ein zweites System mit eigener Mitgliederliste würde auseinanderlaufen.

## Entscheidung
Mitgliedsstatus, Kategorien und Firmendomains kommen aus dem CRM, nur lesend. Das Netz schreibt vier Kennzahlen zurück: Aktivitätsindex, letzte Aktivität, aktive Formate, Gremien. Phase 1 per CSV-Import nach Firmen-ID, später per API.

## Folgen
Listen, Berichte und Workflows laufen im CRM, ohne neues Werkzeug. Das Netz bleibt schlank. Schreibzugriff per API braucht einen Admin und ist eine offene Frage.
