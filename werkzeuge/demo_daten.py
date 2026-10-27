#!/usr/bin/env python3
"""demo_daten.py: erzeugt die synthetischen Demo-Daten des BVDW-Netz-Dummys.

Alle Firmen sind erfunden, alle Domains enden auf .example (RFC 2606, kann nie echt sein).
Gremien- und Formatnamen kommen aus daten/gremien.json und daten/formate.json (echt, mit Quelle).
Fester Seed: zweimal laufen ergibt dieselben Dateien. Nur Standardbibliothek.

Aufruf: python3 werkzeuge/demo_daten.py
Schreibt: daten/demo.json und daten/demo.js (window.NETZ_DATEN)
"""
import datetime as dt
import json
import pathlib
import random

HIER = pathlib.Path(__file__).resolve().parent
DATEN = HIER.parent / "daten"
SEED = 20261027
HEUTE = dt.date(2026, 10, 27)
R = random.Random(SEED)

# ------------------------------------------------------------------ Branchen
# Anteile und Affinitaeten sind Annahmen fuer die Demo, keine BVDW-Fakten.
BRANCHEN = {
    "agentur_fullservice": {"label": "Full-Service-Digitalagentur", "kategorie": "Agenturen", "groesse": (1, 3),
        "gremien": {"g11": 1.0, "g15": .4, "g02": .3, "g08": .3, "g12": .4},
        "formate": {"m01": .8, "m02": .6, "m03": .7, "m11": .9, "m13": .8, "m08": .5, "m09": .4, "m05": .3, "m15": .3, "m04": .3}},
    "agentur_media": {"label": "Mediaagentur", "kategorie": "Agenturen", "groesse": (1, 4),
        "gremien": {"c02": 1.0, "g13": .5, "g05": .4, "g07": .4, "g03": .3},
        "formate": {"m01": .7, "m02": .6, "m03": .6, "m08": .6, "m12": .7, "m09": .3, "m04": .3}},
    "agentur_kreativ": {"label": "Kreativagentur", "kategorie": "Agenturen", "groesse": (1, 2),
        "gremien": {"g11": .7, "g02": .8, "g07": .3},
        "formate": {"m11": 1.0, "m13": .9, "m01": .6, "m03": .5, "m08": .3}},
    "agentur_performance": {"label": "Performance-Agentur", "kategorie": "Agenturen", "groesse": (1, 2),
        "gremien": {"g15": 1.0, "g01": .5, "g10": .4, "g13": .3},
        "formate": {"m01": .5, "m08": .6, "m09": .3, "m12": .3, "m03": .4, "m05": .3}},
    "adtech": {"label": "AdTech", "kategorie": "Technologie", "groesse": (1, 3),
        "gremien": {"g13": .9, "g03": .7, "g05": .5, "g01": .3, "c01": .3},
        "formate": {"m01": .6, "m08": .7, "m12": .7, "m10": .4, "m09": .3, "m03": .4, "m05": .4}},
    "martech": {"label": "MarTech", "kategorie": "Technologie", "groesse": (1, 3),
        "gremien": {"g10": .7, "g03": .6, "g12": .6, "g15": .3},
        "formate": {"m01": .6, "m08": .7, "m15": .6, "m05": .5, "m03": .3}},
    "vermarkter": {"label": "Vermarkter", "kategorie": "Medien und Vermarktung", "groesse": (1, 4),
        "gremien": {"c03": 1.0, "g07": .6, "g13": .5, "g04": .3, "g05": .4},
        "formate": {"m12": 1.0, "m01": .7, "m02": .6, "m08": .5, "m03": .6, "m09": .2}},
    "publisher": {"label": "Publisher", "kategorie": "Medien und Vermarktung", "groesse": (1, 3),
        "gremien": {"c03": .6, "g07": .5, "g04": .4, "g02": .3},
        "formate": {"m12": .7, "m01": .5, "m06": .4, "m08": .4, "m03": .4}},
    "audio": {"label": "Audio-Anbieter", "kategorie": "Medien und Vermarktung", "groesse": (1, 2),
        "gremien": {"g04": 1.0, "c03": .4},
        "formate": {"m06": 1.0, "m01": .5, "m12": .5, "m08": .4, "m03": .3}},
    "haendler": {"label": "Händler und Retail Media", "kategorie": "Handel", "groesse": (1, 4),
        "gremien": {"g14": .9, "c04": .9, "i01": .6, "l03": .4},
        "formate": {"m07": 1.0, "m10": .9, "m01": .5, "m08": .4, "m09": .4, "m03": .3}},
    "konzern": {"label": "Werbungtreibender Konzern", "kategorie": "Werbungtreibende", "groesse": (2, 6),
        "gremien": {"g12": .6, "g09": .5, "g03": .5, "g06": .4, "g08": .3, "x01": .3},
        "formate": {"m01": .8, "m02": .7, "m08": .6, "m09": .7, "m15": .6, "m05": .5, "m14": .5, "m04": .4, "m03": .5}},
    "beratung": {"label": "Beratung", "kategorie": "Beratung und Recht", "groesse": (1, 2),
        "gremien": {"g08": .5, "g06": .5, "g12": .5, "g03": .4, "x01": .4},
        "formate": {"m01": .6, "m04": .6, "m14": .5, "m15": .5, "m08": .4, "m03": .3}},
    "recht": {"label": "Kanzlei", "kategorie": "Beratung und Recht", "groesse": (1, 2),
        "gremien": {"g09": .8, "g06": .6, "g03": .3, "l02": .5},
        "formate": {"m14": .9, "m01": .4, "m02": .5, "m08": .3}},
    "startup": {"label": "Start-up", "kategorie": "Start-ups", "groesse": (1, 2),
        "gremien": {"g12": .5, "g02": .3},
        "formate": {"m05": .7, "m01": .5, "m15": .6, "m08": .3, "m03": .4}},
}

# ------------------------------------------------------------------ Firmen (alle erfunden)
# (id, name, branche, stadt, status, mitglied_seit, aktivitaet, extra)
# extra: aktiv_bis / aktiv_ab als ISO-Datum fuer die Demo-Geschichten.
FIRMEN = [
    ("f01", "Nordlicht Telco AG", "konzern", "Hamburg", "mitglied", 2012, 1.15, {"story": "crosssell"}),
    ("f02", "Elbwerk Digital GmbH", "agentur_fullservice", "Hamburg", "mitglied", 2016, 1.1, {"aktiv_bis": "2025-12-20", "story": "churn"}),
    ("f03", "Kupferdraht Analytics GmbH", "adtech", "Berlin", "lead", None, 0.9, {"story": "lead"}),
    ("f04", "Alsterbyte Commerce SE", "haendler", "Hamburg", "mitglied", 2026, 1.0, {"aktiv_ab": "2026-04-01", "story": "neu"}),
    ("f05", "Hafenpixel Studios GmbH", "agentur_kreativ", "Hamburg", "mitglied", 2019, 0.8, {}),
    ("f06", "Fahrtwind Media GmbH", "agentur_media", "Düsseldorf", "mitglied", 2014, 0.9, {}),
    ("f07", "Spreekanal Publishing GmbH", "publisher", "Berlin", "mitglied", 2010, 0.7, {}),
    ("f08", "Rheinblick Vermarktung GmbH", "vermarkter", "Köln", "mitglied", 2011, 1.0, {}),
    ("f09", "Isarflow Performance GmbH", "agentur_performance", "München", "mitglied", 2020, 0.75, {}),
    ("f10", "Weserbogen Retail GmbH", "haendler", "Bremen", "mitglied", 2023, 0.85, {}),
    ("f11", "Tannenhof Consulting GmbH", "beratung", "Frankfurt", "mitglied", 2018, 0.5, {"aktiv_bis": "2025-05-10", "story": "ruhig"}),
    ("f12", "Dünenfunk Audio GmbH", "audio", "Hamburg", "mitglied", 2021, 0.8, {}),
    ("f13", "Mainwelle Programmatic GmbH", "adtech", "Frankfurt", "mitglied", 2017, 0.9, {}),
    ("f14", "Kieler Förde Data GmbH", "martech", "Kiel", "mitglied", 2022, 0.7, {}),
    ("f15", "Neckarlicht Agentur GmbH", "agentur_fullservice", "Stuttgart", "mitglied", 2015, 0.3, {}),
    ("f16", "Steinwerk Rechtsanwälte PartG mbB", "recht", "Berlin", "mitglied", 2019, 0.6, {"aktiv_bis": "2025-11-20"}),
    ("f17", "Ostwind Commerce GmbH", "haendler", "Leipzig", "lead", None, 0.5, {}),
    ("f18", "Sandbank Search GmbH", "agentur_performance", "Hannover", "mitglied", 2013, 0.8, {}),
    ("f19", "Moorland Video Network GmbH", "vermarkter", "Köln", "mitglied", 2016, 0.7, {}),
    ("f20", "Polarstern Mail Solutions GmbH", "martech", "München", "mitglied", 2018, 0.75, {}),
    ("f21", "Wattenmeer Affiliate GmbH", "adtech", "Hamburg", "mitglied", 2015, 0.7, {}),
    ("f22", "Brückenschlag Digital GmbH", "agentur_fullservice", "Düsseldorf", "ehemalig", 2013, 0.9, {"aktiv_bis": "2025-12-31", "ausgetreten": "2025-12-31"}),
    ("f23", "Leuchtturm Creators GmbH", "agentur_kreativ", "Berlin", "mitglied", 2024, 0.85, {}),
    ("f24", "Granitstadt Konzern AG", "konzern", "Stuttgart", "mitglied", 2009, 0.8, {}),
    ("f25", "Heidekraut Mobility SE", "konzern", "Hannover", "lead", None, 0.4, {}),
    ("f26", "Birkenallee Media GmbH", "agentur_media", "Hamburg", "mitglied", 2012, 0.7, {}),
    ("f27", "Quellwasser Retail Media GmbH", "haendler", "Köln", "mitglied", 2024, 0.9, {}),
    ("f28", "Zugspitz Software GmbH", "martech", "München", "ehemalig", 2016, 0.6, {"aktiv_bis": "2025-06-30", "ausgetreten": "2025-06-30"}),
    ("f29", "Nebelbank AdTech GmbH", "adtech", "Berlin", "mitglied", 2021, 0.65, {}),
    ("f30", "Fjordlicht Audio GmbH", "audio", "Kiel", "lead", None, 0.5, {}),
    ("f31", "Kreidefelsen Digital GmbH", "agentur_fullservice", "Rostock", "mitglied", 2017, 0.9, {"aktiv_bis": "2025-07-15", "story": "churn"}),
    ("f32", "Taubenschlag Publishing GmbH", "publisher", "Köln", "ehemalig", 2011, 0.5, {"aktiv_bis": "2025-09-30", "ausgetreten": "2025-09-30"}),
    ("f33", "Schlossgarten Agentur GmbH", "agentur_kreativ", "Stuttgart", "mitglied", 2020, 0.8, {"aktiv_bis": "2025-10-10", "story": "churn"}),
    ("f34", "Hochufer Research GmbH", "beratung", "Berlin", "mitglied", 2016, 0.7, {}),
    ("f35", "Bernstein Programmatic GmbH", "adtech", "Hamburg", "mitglied", 2019, 0.8, {}),
    ("f36", "Ebbe und Flut Commerce GmbH", "haendler", "Bremen", "lead", None, 0.45, {}),
    ("f37", "Lindenhof Versicherung AG", "konzern", "Hannover", "mitglied", 2014, 0.35, {"story": "ruhig"}),
    ("f38", "Sternschnuppe Labs GmbH", "startup", "Berlin", "mitglied", 2025, 0.8, {}),
    ("f39", "Deichgraf Media GmbH", "agentur_media", "Hamburg", "ehemalig", 2010, 0.7, {"aktiv_bis": "2025-03-31", "ausgetreten": "2025-03-31"}),
    ("f40", "Marschland Video GmbH", "vermarkter", "Hamburg", "mitglied", 2022, 0.75, {}),
]

# Format-Instanzen 2025 bis 2026 (Termine erfunden, bis HEUTE)
TERMINE = {
    "m01": [("2025-06-24", "Berlin", "praesenz", "checkin"), ("2026-06-18", "Berlin", "praesenz", "checkin")],
    "m02": [("2025-01-21", "Berlin", "praesenz", "liste"), ("2026-01-20", "Berlin", "praesenz", "liste")],
    "m03": [("2025-07-03", "Berlin", "praesenz", "liste"), ("2026-07-02", "Berlin", "praesenz", "liste")],
    "m04": [("2025-03-13", "online", "online", "teams"), ("2026-03-12", "online", "online", "teams")],
    "m05": [("2025-03-25", "Köln", "praesenz", "liste"), ("2025-06-17", "Berlin", "praesenz", "liste"),
            ("2025-09-30", "Hamburg", "praesenz", "liste"), ("2025-12-02", "Köln", "praesenz", "liste"),
            ("2026-03-24", "Köln", "praesenz", "liste"), ("2026-06-16", "Berlin", "praesenz", "liste"),
            ("2026-09-29", "Hamburg", "praesenz", "liste")],
    "m06": [("2025-05-15", "Hamburg", "praesenz", "liste"), ("2025-11-06", "Berlin", "praesenz", "liste"),
            ("2026-05-14", "Hamburg", "praesenz", "liste")],
    "m07": [("2025-03-27", "Düsseldorf", "praesenz", "checkin"), ("2025-10-09", "Düsseldorf", "praesenz", "checkin"),
            ("2026-03-26", "Düsseldorf", "praesenz", "checkin"), ("2026-10-08", "Düsseldorf", "praesenz", "checkin")],
    "m08": [("2025-09-17", "Köln", "praesenz", "swapcard"), ("2026-09-23", "Köln", "praesenz", "swapcard")],
    "m09": [("2025-09-18", "Köln", "praesenz", "liste"), ("2026-09-24", "Köln", "praesenz", "liste")],
    "m10": [("2025-09-17", "Köln", "praesenz", "swapcard"), ("2026-09-23", "Köln", "praesenz", "swapcard")],
    "m11": [("2025-09-18", "Köln", "praesenz", "swapcard"), ("2026-09-24", "Köln", "praesenz", "swapcard")],
    "m12": [("2025-02-20", "Frankfurt", "praesenz", "checkin"), ("2026-02-19", "Frankfurt", "praesenz", "checkin")],
    "m13": [("2025-04-10", "Berlin", "praesenz", "liste"), ("2026-04-16", "Berlin", "praesenz", "liste")],
    "m14": [("2025-11-13", "Berlin", "praesenz", "checkin")],
    "m15": [("2026-%02d-0%d" % (m, 1 + (m % 4)), "online", "online", "teams") for m in range(3, 11)],
}

# Welches Format haengt an welchem Gremium (fuer Cross-Sell-Regel), aus formate.json
IMPORTE = [
    {"id": "i01", "datei": "checkin_convention_2026-06.csv", "datum": "2026-06-19", "quelle": "checkin", "format": "m01",
     "zeilen": 173, "firmen": 61, "unsicher": 5, "unzuordenbar": 9, "verworfen_personen": 173,
     "spalten": ["E-Mail", "Vorname", "Nachname", "Firma", "Ticket", "Check-in"]},
    {"id": "i02", "datei": "teams_wg-retail-commerce-media_2026-09.csv", "datum": "2026-09-11", "quelle": "teams", "gremium": "g14",
     "zeilen": 24, "firmen": 18, "unsicher": 2, "unzuordenbar": 1, "verworfen_personen": 24,
     "spalten": ["Name", "E-Mail", "Beitritt", "Verlassen", "Dauer", "Rolle"]},
    {"id": "i03", "datei": "swapcard_masterclasses_2026-09.xlsx", "datum": "2026-10-02", "quelle": "swapcard", "format": "m08",
     "zeilen": 1840, "firmen": 412, "unsicher": 37, "unzuordenbar": 96, "verworfen_personen": 1840,
     "spalten": ["Session", "First name", "Last name", "Email", "Company", "Job title", "Scanned at"]},
    {"id": "i04", "datei": "liste_ki-meetup_2026-09.xlsx", "datum": "2026-09-30", "quelle": "liste", "format": "m05",
     "zeilen": 64, "firmen": 41, "unsicher": 3, "unzuordenbar": 2, "verworfen_personen": 64,
     "spalten": ["Vorname", "Unternehmensname", "Anwesend", "Abwesend"]},
    {"id": "i05", "datei": "teams_ai-office-hours_2026-10.csv", "datum": "2026-10-01", "quelle": "teams", "format": "m15",
     "zeilen": 31, "firmen": 22, "unsicher": 1, "unzuordenbar": 4, "verworfen_personen": 31,
     "spalten": ["Name", "E-Mail", "Beitritt", "Verlassen", "Dauer", "Rolle"]},
]

REVIEW = [
    {"import": "i01", "roh": "Elbwerk Digitl GmbH", "vorschlag": "f02", "konfidenz": 0.62, "grund": "Namensabgleich, Domain fehlt"},
    {"import": "i01", "roh": "Nordlicht Telekommunikation", "vorschlag": "f01", "konfidenz": 0.71, "grund": "Alias nicht bekannt, Namensähnlichkeit"},
    {"import": "i01", "roh": "Alsterbyte", "vorschlag": "f04", "konfidenz": 0.58, "grund": "Kurzname ohne Rechtsform"},
    {"import": "i01", "roh": "Rheinblick Vermarktung / Agentur", "vorschlag": "f08", "konfidenz": 0.66, "grund": "Zwei Firmen in einem Feld"},
    {"import": "i01", "roh": "kupferdraht.example", "vorschlag": "f03", "konfidenz": 0.74, "grund": "Domain bekannt, Firma ist Lead, nicht Mitglied"},
]

FRAGEN = [
    {"id": "q1", "frage": "Welche Formate hat die Firma 2026 besucht?", "typ": "formate_jahr"},
    {"id": "q2", "frage": "Wo fehlt sie seit einem Jahr?", "typ": "fehlt_seit"},
    {"id": "q3", "frage": "Welche Gremien passen zur Branche?", "typ": "gremien_passend"},
]


def d(s):
    return dt.date.fromisoformat(s)


def monat(s):
    return s[:7]


def lade(name):
    with open(DATEN / name, encoding="utf-8") as f:
        return json.load(f)


def main():
    gremien = lade("gremien.json")["gremien"]
    formate = lade("formate.json")["formate"]
    gid = {g["id"]: g for g in gremien}
    fid = {f["id"]: f for f in formate}
    format_gremium = {f["id"]: f["gremium"] for f in formate if f.get("gremium")}

    firmen = []
    for (i, name, br, stadt, status, seit, akt, extra) in FIRMEN:
        dom = (name.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
               .replace(" und ", "-").replace(" ", "-"))
        for t in ("-gmbh", "-ag", "-se", "-partg-mbb", "-rechtsanwaelte"):
            dom = dom.replace(t, "")
        firmen.append({
            "id": i, "name": name, "demo": True, "branche": br,
            "branche_label": BRANCHEN[br]["label"], "kategorie": BRANCHEN[br]["kategorie"],
            "stadt": stadt, "domain": dom + ".example", "status": status,
            "mitglied_seit": seit, "ausgetreten": extra.get("ausgetreten"),
            "_akt": akt, "_bis": extra.get("aktiv_bis"), "_ab": extra.get("aktiv_ab"), "_story": extra.get("story"),
        })
    firmen.append({"id": "f99", "name": "Einzelunternehmer (gebündelt)", "demo": True, "sammel": True,
                   "branche": "einzel", "branche_label": "Einzelunternehmer, nur gebündelt",
                   "kategorie": "Einzelunternehmer", "stadt": "", "domain": "", "status": "gemischt",
                   "mitglied_seit": None, "ausgetreten": None, "_akt": 0, "_bis": None, "_ab": None, "_story": None})

    def aktiv_am(f, tag):
        if f.get("sammel"):
            return False
        if f["_bis"] and tag > d(f["_bis"]):
            return False
        if f["_ab"] and tag < d(f["_ab"]):
            return False
        return True

    # ---------------------------------------------------------- Gremienmitgliedschaften (Firmenebene)
    mitgliedschaften = []
    monate = ["2024-%02d" % m for m in range(1, 13)] + ["2025-%02d" % m for m in range(1, 13)] + ["2026-%02d" % m for m in range(1, 7)]
    for f in firmen:
        if f["status"] not in ("mitglied", "ehemalig"):
            continue
        for g, w in sorted(BRANCHEN[f["branche"]]["gremien"].items()):
            if f["id"] == "f01" and g in ("g14", "c04"):
                continue
            if f["id"] == "f04":
                continue
            if R.random() < w * 0.75:
                seit = R.choice(monate)
                if f["mitglied_seit"] and int(seit[:4]) < f["mitglied_seit"]:
                    seit = "%d-%02d" % (f["mitglied_seit"], R.randint(1, 12))
                mitgliedschaften.append({"firma": f["id"], "gremium": g, "rolle": "mitglied", "seit": seit,
                                         "bis": f["ausgetreten"][:7] if f["ausgetreten"] else None})
    mitgliedschaften.append({"firma": "f04", "gremium": "g14", "rolle": "mitglied", "seit": "2026-05", "bis": None})
    mitgliedschaften.append({"firma": "f04", "gremium": "c04", "rolle": "mitglied", "seit": "2026-06", "bis": None})
    mitgliedschaften.append({"firma": "f02", "gremium": "g11", "rolle": "mitglied", "seit": "2017-03", "bis": None})
    # Vorsitz: je Working Group und Circle eine aktive Mitgliedsfirma mit hoechster Affinitaet
    vorsitz_vergeben = set()
    for g in gremien:
        if g["typ"] not in ("working_group", "circle"):
            continue
        still = {f["id"] for f in firmen if f.get("_bis") or f.get("_story") == "ruhig"}
        kand = [m for m in mitgliedschaften if m["gremium"] == g["id"] and m["bis"] is None
                and m["firma"] not in vorsitz_vergeben and m["firma"] not in still and m["firma"] != "f04"]
        if not kand:
            continue
        kand.sort(key=lambda m: -BRANCHEN[next(x for x in firmen if x["id"] == m["firma"])["branche"]]["gremien"].get(g["id"], 0)
                  * next(x for x in firmen if x["id"] == m["firma"])["_akt"])
        kand[0]["rolle"] = "vorsitz"
        vorsitz_vergeben.add(kand[0]["firma"])

    def ist_mitglied(firma, g, tag):
        for m in mitgliedschaften:
            if m["firma"] == firma and m["gremium"] == g and m["seit"] <= tag.isoformat()[:7] and (m["bis"] is None or m["bis"] >= tag.isoformat()[:7]):
                return m
        return None

    # ---------------------------------------------------------- Events
    events = []
    n = 0

    def ev(ref, reftyp, datum, ort, modus, quelle):
        nonlocal n
        if d(datum) > HEUTE:
            return
        n += 1
        events.append({"id": "e%03d" % n, "ref": ref, "reftyp": reftyp, "datum": datum, "ort": ort, "modus": modus, "quelle": quelle})

    for m, liste in sorted(TERMINE.items()):
        for (datum, ort, modus, quelle) in liste:
            ev(m, "format", datum, ort, modus, quelle)
    sitz_monate = {"working_group": 5, "circle": 4, "lab": 2, "initiative": 3, "expert_group": 4}
    for g in gremien:
        for jahr in (2025, 2026):
            if g["typ"] == "lab" and g["id"] in ("l01", "l02", "l03") and jahr == 2025:
                continue
            k = sitz_monate[g["typ"]]
            ms = sorted(R.sample(range(1, 13), k))
            praesenz_idx = R.randrange(k)
            for j, mm in enumerate(ms):
                tag = "%d-%02d-%02d" % (jahr, mm, R.randint(2, 26))
                if j == praesenz_idx:
                    ev(g["id"], "gremium", tag, R.choice(["Berlin", "Köln", "Hamburg", "Düsseldorf"]), "praesenz", "liste")
                else:
                    ev(g["id"], "gremium", tag, "online", "online", "teams")
    events.sort(key=lambda e: (e["datum"], e["id"]))

    # ---------------------------------------------------------- Teilnahmen
    teilnahmen = []
    status_faktor = {"mitglied": 1.0, "ehemalig": 0.9, "lead": 0.45}
    for e in events:
        tag = d(e["datum"])
        for f in firmen:
            if not aktiv_am(f, tag):
                continue
            br = BRANCHEN[f["branche"]]
            if e["reftyp"] == "format":
                aff = br["formate"].get(e["ref"], 0.05)
            else:
                aff = 0.85 if ist_mitglied(f["id"], e["ref"], tag) else br["gremien"].get(e["ref"], 0) * 0.15
            p = aff * f["_akt"] * status_faktor[f["status"]]
            if f["id"] == "f01" and e["ref"] == "m07":
                p = 0.97
            if f["id"] == "f03" and e["ref"] in ("m05", "m08", "m01") and tag.year == 2026:
                p = 0.97
            if f["id"] == "f37":
                p *= 0.5
            if R.random() < min(p, 0.95):
                lo, hi = br["groesse"]
                if e["reftyp"] == "gremium" or e["modus"] == "online":
                    anzahl = R.randint(1, max(1, min(2, hi)))
                else:
                    anzahl = R.randint(lo, hi)
                rolle = "teilnehmer"
                if e["ref"] in ("m08", "m10", "m11", "m01") and f["status"] == "mitglied" and R.random() < 0.14:
                    rolle = "speaker"
                teilnahmen.append({"firma": f["id"], "event": e["id"], "anzahl": anzahl, "rolle": rolle})
        if e["modus"] == "praesenz" and e["reftyp"] == "format" and R.random() < 0.8:
            teilnahmen.append({"firma": "f99", "event": e["id"], "anzahl": R.randint(2, 9), "rolle": "teilnehmer"})

    # ---------------------------------------------------------- Index und Insights (regelbasiert)
    evid = {e["id"]: e for e in events}

    def index(firma, ende):
        start = ende - dt.timedelta(days=365)
        halb = ende - dt.timedelta(days=182)
        inst = [t for t in teilnahmen if t["firma"] == firma and start < d(evid[t["event"]]["datum"]) <= ende]
        formate_ = {evid[t["event"]]["ref"] for t in inst if evid[t["event"]]["reftyp"] == "format"}
        haeuf = sum(1.0 if d(evid[t["event"]]["datum"]) > halb else 0.5 for t in inst)
        mitgl = [m for m in mitgliedschaften if m["firma"] == firma and (m["bis"] is None or m["bis"] >= ende.isoformat()[:7])]
        tiefe = (0.5 if mitgl else 0) + (1.0 if any(m["rolle"] == "vorsitz" for m in mitgl) else 0) \
            + (0.5 if any(t["rolle"] == "speaker" for t in inst) else 0)
        b, h, t = min(1, len(formate_) / 5), min(1, haeuf / 8), min(1, tiefe)
        return {"index": round(40 * b + 40 * h + 20 * t), "breite": round(40 * b), "haeufigkeit": round(40 * h), "tiefe": round(20 * t),
                "formate": len(formate_), "instanzen": len(inst)}

    insights = []
    for f in firmen:
        if f.get("sammel"):
            continue
        jetzt = index(f["id"], HEUTE)
        vorher = index(f["id"], HEUTE - dt.timedelta(days=365))
        letzte = max((evid[t["event"]]["datum"] for t in teilnahmen if t["firma"] == f["id"]), default=None)
        still_seit = (HEUTE - d(letzte)).days if letzte else 9999
        davor = len([t for t in teilnahmen if t["firma"] == f["id"]
                     and HEUTE - dt.timedelta(days=545) < d(evid[t["event"]]["datum"]) <= HEUTE - dt.timedelta(days=182)])
        if f["status"] == "mitglied" and still_seit > 182 and davor >= 3:
            insights.append({"firma": f["id"], "typ": "churn", "konfidenz": 0.78,
                             "text": "Letzte Teilnahme %s, seit %d Monaten still. Davor %d Event-Instanzen in zwölf Monaten. Verlängerungsgespräch vorziehen."
                             % (letzte[8:10] + "." + letzte[5:7] + "." + letzte[:4], still_seit // 30, davor)})
        elif f["status"] == "mitglied" and jetzt["index"] < 15 and vorher["index"] < 15:
            insights.append({"firma": f["id"], "typ": "ruhig", "konfidenz": 0.7,
                             "text": "Seit zwei Jahren kaum sichtbar (Index unter 15). Kein Gremium, einzelne Events. Ansprache über die Branche prüfen."})
        if f["status"] == "lead" and jetzt["instanzen"] >= 2:
            insights.append({"firma": f["id"], "typ": "lead", "konfidenz": 0.8,
                             "text": "Nichtmitglied mit %d Event-Instanzen in 12 Monaten. Warmer Lead für Membership Services." % jetzt["instanzen"]})
        if f["status"] == "mitglied":
            def _n(m):
                return -len([t for t in teilnahmen if t["firma"] == f["id"] and evid[t["event"]]["ref"] == m
                             and d(evid[t["event"]]["datum"]) > HEUTE - dt.timedelta(days=365)])
            for m, g in sorted(format_gremium.items(), key=lambda kv: (_n(kv[0]), kv[0])):
                inst = [t for t in teilnahmen if t["firma"] == f["id"] and evid[t["event"]]["ref"] == m
                        and d(evid[t["event"]]["datum"]) > HEUTE - dt.timedelta(days=365)]
                if len(inst) >= 2 and not ist_mitglied(f["id"], g, HEUTE):
                    insights.append({"firma": f["id"], "typ": "crosssell", "konfidenz": 0.74,
                                     "text": "%d Mal beim Format %s in 12 Monaten, aber nicht im zugehörigen Gremium %s. Einladung durch die Betreuerin anbieten."
                                     % (len(inst), fid[m]["kurz"], gid[g]["kurz"])})
                    break
        if f["mitglied_seit"] == 2026:
            insights.append({"firma": f["id"], "typ": "neu", "konfidenz": 0.85,
                             "text": "Mitglied seit 2026, schon %d Event-Instanzen und %d Gremien. Onboarding läuft, Ansprechpartner stabil halten."
                             % (jetzt["instanzen"], len([m for m in mitgliedschaften if m["firma"] == f["id"]]))})

    for f in firmen:
        for k in ("_akt", "_bis", "_ab", "_story"):
            f.pop(k, None)

    daten = {
        "meta": {"demo": True, "seed": SEED, "erzeugt": "2026-10-27", "heute": HEUTE.isoformat(),
                 "hinweis": "Demo-Daten. Alle Firmen fiktiv, Domains .example. Gremien und Formate echt. Keine Person ist enthalten.",
                 "index_formel": "40 x Breite (Formate/5) + 40 x Haeufigkeit (Instanzen/8, aelter als 6 Monate halb) + 20 x Tiefe (Gremium 0.5, Vorsitz 1.0, Speaker 0.5), 12 Monate rollierend"},
        "firmen": firmen, "gremien": gremien, "formate": formate, "events": events, "teilnahmen": teilnahmen,
        "mitgliedschaften": mitgliedschaften, "importe": IMPORTE, "review": REVIEW, "insights": insights, "fragen": FRAGEN,
    }
    js = json.dumps(daten, ensure_ascii=False, indent=1, sort_keys=True)
    (DATEN / "demo.json").write_text(js + "\n", encoding="utf-8")
    (DATEN / "demo.js").write_text("// Erzeugt von werkzeuge/demo_daten.py. Nicht von Hand aendern.\nwindow.NETZ_DATEN = " + js + ";\n", encoding="utf-8")
    print("Firmen %d, Events %d, Teilnahmen %d, Mitgliedschaften %d, Insights %d" % (len(firmen), len(events), len(teilnahmen), len(mitgliedschaften), len(insights)))
    for i in insights:
        print(" ", i["firma"], i["typ"], "|", i["text"][:90])


if __name__ == "__main__":
    main()
