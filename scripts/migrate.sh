#!/usr/bin/env bash
# AgencyOS migration runner
# Usage: ./scripts/migrate.sh [--seed]
# Runs pending Prisma migrations and optionally seeds the database.

set -euo pipefail

SEED="${1:-}"

echo "[migrate] Running pending migrations..."
npx prisma migrate deploy

echo "[migrate] Generating Prisma client..."
npx prisma generate

if [[ "$SEED" == "--seed" ]]; then
  echo "[migrate] Seeding database..."
  npx prisma db seed
fi

echo "[migrate] Done."
