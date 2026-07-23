#!/usr/bin/env bash
set -euo pipefail

echo "=== SurtiTelas Deploy Readiness Check ==="
echo ""

OK=0
FAIL=0
run() {
  echo "→ $*"
  if eval "$*"; then
    echo "✅ PASS"
    OK=$((OK+1))
  else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
  fi
  echo ""
}

echo "## Backend"
run "cd C:/Users/usuario/software_SurtiTelas.Backend && npm run typecheck"
run "cd C:/Users/usuario/software_SurtiTelas.Backend && npm run lint"
run "cd C:/Users/usuario/software_SurtiTelas.Backend && npm test --silent"
run "cd C:/Users/usuario/software_SurtiTelas.Backend && npx playwright test --project=chromium --reporter=line"

echo "## Frontend"
run "cd C:/Users/usuario/software_SurtiTelas.Fronend && npm run typecheck"
run "cd C:/Users/usuario/software_SurtiTelas.Fronend && npm run lint"

echo "=== Summary ==="
echo "Passed: $OK"
echo "Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
