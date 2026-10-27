#!/usr/bin/env python3
"""kontrast.py: rechnet WCAG-Kontrast fuer die Textpaare der Tokens in app/app.css. Text unter 4,5:1 schlaegt fehl."""
import re, sys, pathlib
css = (pathlib.Path(__file__).resolve().parent.parent / "app/app.css").read_text(encoding="utf-8")
tok = dict(re.findall(r"--([a-z0-9-]+):(#[0-9A-Fa-f]{3,6})", css))
def lum(h):
    h = h.lstrip("#"); h = "".join(c * 2 for c in h) if len(h) == 3 else h
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def k(a, b):
    la, lb = lum(tok.get(a, a)), lum(tok.get(b, b)); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
# (Vordergrund, Hintergrund, Mindestwert, Zweck)
paare = [("ink", "offwhite", 4.5, "Text auf Grund"), ("ink", "white", 4.5, "Text auf Karte"), ("ink-2", "white", 4.5, "Nebentext auf Karte"), ("ink-2", "offwhite", 4.5, "Nebentext auf Grund"),
         ("ink-3", "white", 4.5, "Hinweistext auf Karte"), ("ink-3", "sunk", 4.5, "Hinweistext auf vertiefter Flaeche"), ("blue", "white", 4.5, "Link auf Karte"), ("blue", "offwhite", 4.5, "Link auf Grund"),
         ("white", "black", 4.5, "Text auf Schwarz"), ("black", "orange", 4.5, "Text auf Orange"), ("bad", "sunk", 4.5, "Status ehemalig"), ("ok", "white", 4.5, "Status ok"),
         ("orange", "white", 3.0, "Orange nur als Grafik oder grosser Text"), ("#CFC9C1", "black", 4.5, "Label auf schwarzer Kachel"), ("#3A1A10", "orange", 4.5, "Label auf oranger Kachel"), ("#E8E2DA", "black", 4.5, "Protokoll")]
schlecht = 0
for a, b, mn, zweck in paare:
    v = k(a, b); ok = v >= mn; schlecht += not ok
    print("%-5s %-22s auf %-8s %5.2f:1  %s" % ("ok" if ok else "FEHLT", a, b, v, zweck))
sys.exit(1 if schlecht else 0)
