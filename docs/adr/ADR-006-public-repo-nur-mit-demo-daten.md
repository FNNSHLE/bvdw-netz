# ADR-006: Öffentliches Repo nur mit Demo-Daten

Status: beschlossen, 27.10.2026

## Kontext
GitHub Pages auf einem kostenlosen Konto gibt es nur für öffentliche Repos. Der Click-Dummy soll per Link teilbar sein.

## Entscheidung
Dieses Repo ist öffentlich und enthält ausschließlich erfundene Firmen (Domains auf .example, Flag demo), echte Gremien- und Formatnamen von der Website des Verbands und Docs ohne interne Zahlen und ohne Personen. Echte Aggregate, Anwesenheitslisten und CRM-Exporte kommen nie hinein, auch nicht in ein privates Repo. Ein Test im CI prüft `daten/`.

## Folgen
Die Demo ist ohne Anmeldung erreichbar. Sobald echte Aggregate ins Spiel kommen, braucht es eine getrennte, interne Umgebung.
