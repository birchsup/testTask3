#!/usr/bin/env sh
set -eu

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

echo "Running pre-push checks..."

# 1) Block push if any focused Playwright test is present.
# POSIX ERE pattern (no \b / \s — not portable on macOS git).
# Covers test.only and test.describe.only.
ONLY_PATTERN='(^|[^A-Za-z0-9_$.])(test\.only|test\.describe\.only)[[:space:]]*\('
ONLY_HITS="$(git grep -nE "$ONLY_PATTERN" -- '*.spec.ts' '*.test.ts' ':!node_modules/*' ':!dist/*' ':!playwright-report/*' ':!test-results/*' || true)"
if [ -n "$ONLY_HITS" ]; then
  echo ""
  echo "Push blocked: found focused test (test.only / test.describe.only):"
  echo "$ONLY_HITS"
  echo ""
  echo "Remove .only before push."
  exit 1
fi

# 2) Type-check the whole project.
echo "Type-checking (tsc --noEmit)..."
npx tsc --noEmit

# 3) Lint the whole project.
echo "Linting (eslint)..."
npx eslint "**/*.{ts,js,mjs}"

# 4) Formatting.
echo "Checking formatting (prettier)..."
npx prettier --check .

echo "Pre-push checks passed."
