#!/usr/bin/env bash
# 🐾  Launch Claude Pet
#
# Usage:
#   ./start.sh                # run in current terminal
#   ./start.sh --float        # try to open a small floating window (requires xterm)

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🐾  Starting Claude Pet..."
echo "   q / Esc  = quit"
echo "   arrows   = move pet"
echo "   click    = interact"
echo ""

if [ "$1" = "--float" ] && command -v xterm &>/dev/null; then
  xterm -geometry 28x12+100+100 -title "Claude Pet" -e "cd '$DIR' && node index.js" &
else
  cd "$DIR" && node index.js
fi
