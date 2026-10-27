#!/usr/bin/env python3
"""buendeln.py: baut dist/bvdw-netz-demo.html, eine einzige Datei mit CSS, Daten, d3 und App inline.
Plan B zum Teilen ohne GitHub Pages (zum Beispiel als privater Link). Kein Build, nur Verteilformat."""
import pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
html = (R / "app/index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="app.css[^"]*">', lambda m: "<style>\n" + (R / "app/app.css").read_text(encoding="utf-8") + "\n</style>", html)
def skript(m):
    pfad = m.group(1).split("?")[0]
    datei = (R / "app" / pfad).resolve()
    return "<script>\n" + datei.read_text(encoding="utf-8") + "\n</script>"
html = re.sub(r'<script src="([^"]+)"></script>', skript, html)
html = html.replace('href="favicon.svg"', 'href="data:image/svg+xml;utf8,' + (R / "app/favicon.svg").read_text(encoding="utf-8").replace("#", "%23").replace("\n", "") + '"')
html = html.replace('src="logo.svg"', 'src="data:image/svg+xml;utf8,' + (R / "app/logo.svg").read_text(encoding="utf-8").replace("#", "%23").replace("\n", "") + '"')
(R / "dist").mkdir(exist_ok=True)
ziel = R / "dist/bvdw-netz-demo.html"
ziel.write_text(html, encoding="utf-8")
print("geschrieben:", ziel, round(ziel.stat().st_size / 1024), "KB")
