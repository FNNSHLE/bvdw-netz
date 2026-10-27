# ADR-003: E-Mail-Domain als Firmenschlüssel

Status: vorgeschlagen, 27.10.2026

## Kontext
Firmennamen in Anmeldelisten sind Freitext: Tippfehler, Kurzformen, Konzerntöchter. Das CRM führt je Firma eine Domain.

## Entscheidung
Der erste Schlüssel ist die E-Mail-Domain (normalisiert: klein, Subdomains gekappt, öffentliche Suffixe beachtet). Der Teil vor dem @ wird nie gelesen. Firmennamen sind nur Fallback. Eine Aliasliste für Domains fängt Konzerne mit mehreren Domains. Generische Anbieter (gmail, gmx und ähnliche) matchen nie über die Domain.

## Folgen
Hohe Trefferquote ohne Personenbezug. Private Adressen bleiben unzuordenbar, wenn die Firmenspalte fehlt. Das ist akzeptiert und wird gezählt.
