#!/usr/bin/env bash
# AgencyOS health check script — use for monitoring, CI readiness checks, deploy gates
# Usage: ./scripts/health-check.sh [base_url]

set -euo pipefail

BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  response=$(curl -s -o /tmp/health_body -w "%{http_code}" "$url" 2>/dev/null || echo "000")

  if [[ "$response" == "$expected_status" ]]; then
    echo "  ✓ $name ($response)"
    ((PASS++))
  else
    echo "  ✗ $name (got $response, expected $expected_status)"
    cat /tmp/health_body 2>/dev/null || true
    ((FAIL++))
  fi
}

echo ""
echo "AgencyOS Health Check"
echo "Base URL: $BASE"
echo "─────────────────────────────────────"

check "Root health"    "$BASE/api/health"         "200"
check "DB health"      "$BASE/api/health/db"       "200"
check "Queue health"   "$BASE/api/health/queue"    "200"
check "Storage health" "$BASE/api/health/storage"  "200"
check "Auth guard"     "$BASE/api/auth/me"         "401"

echo "─────────────────────────────────────"
echo "Passed: $PASS  Failed: $FAIL"
echo ""

[[ $FAIL -eq 0 ]] && exit 0 || exit 1
