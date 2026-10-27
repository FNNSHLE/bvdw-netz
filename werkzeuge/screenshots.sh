#!/bin/bash
# screenshots.sh: rendert alle Routen headless mit Chrome (Desktop und Mobil) nach docs/screenshots/ und meldet Konsolenfehler.
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Chrome nicht gefunden"; exit 1; }
BASIS="file://$PWD/app/index.html"
ROUTEN=("01_start:#/" "02_firma:#/firma/f01" "03_firma_churn:#/firma/f02" "04_gremium:#/gremium/g12" "05_import:#/import" "06_datenschutz:#/datenschutz")
mkdir -p docs/screenshots qs
LOG=$(mktemp)
for r in "${ROUTEN[@]}"; do
  name="${r%%:*}"; hash="${r#*:}"
  for size in "1440,900:" "390,844:_mobil"; do
    dim="${size%%:*}"; suffix="${size#*:}"
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --enable-logging=stderr --v=0 \
      --virtual-time-budget=6000 --window-size="$dim" --force-device-scale-factor=1 \
      --screenshot="$([ -n "$suffix" ] && echo qs || echo docs/screenshots)/${name}${suffix}.png" "${BASIS}${hash}" 2>>"$LOG" >/dev/null
  done
  echo "  $name"
done
echo "--- Konsole (Fehler und Warnungen) ---"
grep -h "CONSOLE" "$LOG" | grep -v "DevTools\|Request Autofill\|Autofill.enable" | sed 's/.*CONSOLE/CONSOLE/' | sort | uniq -c | head -40 || true
rm -f "$LOG"
ls docs/screenshots/ qs/
