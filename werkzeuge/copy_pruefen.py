#!/usr/bin/env python3
"""copy_pruefen.py: zieht alle sichtbaren Strings aus app/texte.js und die Texte aus daten/demo.json in eine
Markdown-Datei im Scratchpad und ruft voice_check.py darauf auf (Fynns Stimme, keine Gedankenstriche)."""
import json, os, pathlib, re, subprocess, sys, tempfile
R = pathlib.Path(__file__).resolve().parent.parent
js = (R / "app/texte.js").read_text(encoding="utf-8")
strings = [s for s in re.findall(r'"((?:[^"\\]|\\.)*)"', js) if len(s) > 12 and " " in s]
d = json.loads((R / "daten/demo.json").read_text(encoding="utf-8"))
strings += [i["text"] for i in d["insights"]] + [q["frage"] for q in d["fragen"]] + [d["meta"]["hinweis"]]
out = pathlib.Path(tempfile.gettempdir()) / "bvdw-netz-copy.md"
out.write_text("# Copy des Dummys\n\n" + "\n\n".join(strings), encoding="utf-8")
vc = pathlib.Path.home() / "ClaudeProjects/00_System/2026/voice_check.py"
print("Strings:", len(strings), "->", out)
if vc.exists():
    sys.exit(subprocess.call([sys.executable, str(vc), str(out)]))
print("voice_check.py nicht gefunden, nur Strich-Check:")
treffer = [s for s in strings if "–" in s or "—" in s]
print(treffer or "keine Gedankenstriche"); sys.exit(1 if treffer else 0)
