#!/usr/bin/env python3
"""pruefe_demo.py: prueft daten/demo.json auf alles, was nicht ins oeffentliche Repo darf.

Regeln: kein @, keine Personen-Felder, alle Firmendomains auf .example, keine Gedankenstriche,
keine Firmendomain aus dem lokalen HubSpot-Export (falls vorhanden, liegt nie im Repo).
Exit 1 bei Verstoss."""
import json
import pathlib
import re
import sys

HIER = pathlib.Path(__file__).resolve().parent
DATEN = HIER.parent / "daten"
PERSONENFELDER = {"vorname", "nachname", "name_person", "email", "e_mail", "mail", "telefon", "mobil", "titel_person"}
HUBSPOT = pathlib.Path.home() / "ClaudeProjects/BVDW/_Referenz/Daten/bvdw_hubspot_full.json"

fehler = []
roh = (DATEN / "demo.json").read_text(encoding="utf-8")
if "@" in roh:
    fehler.append("@ gefunden")
for z in ("–", "—"):
    if z in roh:
        fehler.append("Gedankenstrich gefunden: " + repr(z))
daten = json.loads(roh)


def schluessel(o, pfad=""):
    if isinstance(o, dict):
        for k, v in o.items():
            if k.lower() in PERSONENFELDER:
                fehler.append("Personenfeld %s unter %s" % (k, pfad))
            schluessel(v, pfad + "/" + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            schluessel(v, pfad + "[%d]" % i)


schluessel(daten)
for f in daten["firmen"]:
    if f.get("sammel"):
        continue
    if not f["domain"].endswith(".example"):
        fehler.append("Domain nicht .example: " + f["domain"])
    if not f.get("demo"):
        fehler.append("Firma ohne demo-Flag: " + f["name"])
    if re.search(r"\b(Telekom|Google|Amazon|Otto|Zalando|Douglas|Criteo|RTL|ProSieben|Axel Springer|Media-Saturn)\b", f["name"]):
        fehler.append("Echter Firmenname: " + f["name"])
if HUBSPOT.exists():
    try:
        hs = json.loads(HUBSPOT.read_text(encoding="utf-8"))
        echte = {str(c.get("domain", "")).lower() for c in hs.get("companies", [])}
        for f in daten["firmen"]:
            if f.get("domain") and f["domain"].lower() in echte:
                fehler.append("Domain existiert im HubSpot-Export: " + f["domain"])
        print("HubSpot-Export lokal geprueft (%d Domains), nichts getroffen" % len(echte) if not fehler else "")
    except Exception as e:  # Export ist optional
        print("Hinweis: HubSpot-Export nicht lesbar:", e)
else:
    print("Hinweis: kein lokaler HubSpot-Export, Domainabgleich uebersprungen")
if not daten["meta"].get("demo"):
    fehler.append("meta.demo ist nicht true")
if fehler:
    print("FEHLER:"); [print(" ", x) for x in fehler]; sys.exit(1)
print("pruefe_demo: ok (%d Firmen, %d Events, %d Teilnahmen)" % (len(daten["firmen"]), len(daten["events"]), len(daten["teilnahmen"])))
