#!/usr/bin/env bash
# BuildEstimate Pro - Linux & macOS Setup & Launcher
# Copyright (c) 2026 Shahid Akram

set -e

PORT=${1:-8080}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=========================================================="
echo " 🏗️  BuildEstimate Pro - Automated Setup Suite"
echo " Author: Shahid Akram | https://github.com/heyshahid"
echo "=========================================================="

echo ""
echo "[*] Launching BuildEstimate Pro from ${DIR}..."

if command -v python3 &>/dev/null; then
    echo "[*] Starting local HTTP server on http://localhost:${PORT}..."
    python3 -m http.server "${PORT}" --directory "${DIR}"
elif command -v python &>/dev/null; then
    python -m http.server "${PORT}" --directory "${DIR}"
elif command -v open &>/dev/null; then
    open "${DIR}/index.html"
elif command -v xdg-open &>/dev/null; then
    xdg-open "${DIR}/index.html"
else
    echo "[!] Please open ${DIR}/index.html in any modern web browser."
fi
