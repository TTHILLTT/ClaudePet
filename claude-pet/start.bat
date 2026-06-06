@echo off
title Claude Pet
echo.
echo   🐾  Starting Claude Pet...
echo   ─────────────────────────
echo   q / Esc  = quit
echo   arrows   = move pet
echo   click    = interact
echo   ─────────────────────────
echo.
cd /d "%~dp0"
node index.js
