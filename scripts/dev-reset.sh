#!/usr/bin/env bash
# Clear Next.js cache, stop a running dev server, and start fresh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Stopping Next.js dev server (if running)…"
pkill -f "next dev" 2>/dev/null || true
# Free the default port in case a stale process is still bound.
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
fi
sleep 0.3

echo "→ Removing .next cache…"
rm -rf .next

echo "→ Starting dev server…"
exec npm run dev
