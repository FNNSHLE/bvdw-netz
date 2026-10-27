# ADR-008: Schrift über lokalen Alias, kein Dark Mode, keine Versalien

Status: beschlossen, 27.10.2026

## Kontext
Die Hausschrift ist lizenziert und darf nicht in ein öffentliches Repo. Das Brand Book nennt Arial und Arial Black als Ersatz, verbietet Versalien und definiert den Grund als Off White.

## Entscheidung
Eine Alias-Schriftfamilie mit `local()`-Quellen: auf Rechnern mit installierter Hausschrift rendert sie, sonst exakt der Brand-Ersatz (Arial, Arial Black bei Gewicht 800). Keine Schriftdateien im Repo. Kein Dark Mode, `color-scheme: light`. Kein `text-transform: uppercase`, keine Unterstreichung.

## Folgen
Die Fußzeile zeigt, welche Schrift aktiv ist. Auf Fremdrechnern sieht der Dummy etwas anders aus, bleibt aber markenkonform.
