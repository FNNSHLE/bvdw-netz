#!/bin/bash
# BVDW Netz, Click-Dummy: oeffnet die Demo im Standardbrowser. Keine Daten werden geholt, alles liegt lokal.
cd "$(dirname "$0")"
open "app/index.html"
