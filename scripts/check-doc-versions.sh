#!/bin/bash
# scripts/check-doc-versions.sh
# Checks version consistency across all documentation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking documentation version consistency..."
echo ""

# Get source of truth
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "📦 package.json version: ${GREEN}${PACKAGE_VERSION}${NC}"
echo ""

ERRORS=0

# Function to check version in file
check_version_in_file() {
  local file=$1
  local pattern=$2
  local description=$3

  if [ -f "$file" ]; then
    local found_version=$(grep -oE "$pattern" "$file" | head -1)
    if [ -n "$found_version" ]; then
      if [[ "$found_version" == *"$PACKAGE_VERSION"* ]]; then
        echo "✅ $description: ${GREEN}$found_version${NC}"
      else
        echo "❌ $description: ${RED}$found_version${NC} (expected $PACKAGE_VERSION)"
        ((ERRORS++))
      fi
    else
      echo "⚠️  $description: ${YELLOW}Version not found${NC}"
    fi
  else
    echo "❌ $description: ${RED}File not found${NC}"
    ((ERRORS++))
  fi
}

# Check CLAUDE.md
CLAUDE_VERSION=$(grep -oE '[0-9]+\.[0-9]+\.[0-9]+' CLAUDE.md | head -1)
if [ -n "$CLAUDE_VERSION" ]; then
  if [ "$CLAUDE_VERSION" == "$PACKAGE_VERSION" ]; then
    echo "✅ CLAUDE.md version: ${GREEN}${CLAUDE_VERSION}${NC}"
  else
    echo "❌ CLAUDE.md version: ${RED}${CLAUDE_VERSION}${NC} (expected ${PACKAGE_VERSION})"
    ((ERRORS++))
  fi
else
  echo "⚠️  CLAUDE.md version: ${YELLOW}Version not found${NC}"
fi

# Check docs/README.md
DOCS_README_VERSION=$(grep "Current Version:" docs/README.md | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
if [ -n "$DOCS_README_VERSION" ]; then
  if [ "$DOCS_README_VERSION" == "$PACKAGE_VERSION" ]; then
    echo "✅ docs/README.md version: ${GREEN}${DOCS_README_VERSION}${NC}"
  else
    echo "❌ docs/README.md version: ${RED}${DOCS_README_VERSION}${NC} (expected ${PACKAGE_VERSION})"
    ((ERRORS++))
  fi
else
  echo "⚠️  docs/README.md version: ${YELLOW}Version not found${NC}"
fi

# Check CHANGELOG.md top entry
CHANGELOG_TOP_VERSION=$(grep -m 1 "^## \[" CHANGELOG.md | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
if [ "$CHANGELOG_TOP_VERSION" == "$PACKAGE_VERSION" ]; then
  echo "✅ CHANGELOG.md top entry: ${GREEN}v${CHANGELOG_TOP_VERSION}${NC}"
else
  echo "⚠️  CHANGELOG.md top entry: ${YELLOW}v${CHANGELOG_TOP_VERSION}${NC} (package.json is v${PACKAGE_VERSION})"
  echo "   Note: This is OK if working on next release (unreleased section)"
fi

# Check test count consistency
echo ""
echo "🧪 Checking test count consistency..."
TEST_COUNT=$(npm test 2>&1 | grep -E "Tests.*[0-9]+ passed" | grep -oE '[0-9]+' | head -1)
if [ -n "$TEST_COUNT" ]; then
  echo "📊 Actual test count: ${GREEN}${TEST_COUNT}${NC}"

  # Check README.md test count
  README_TEST_COUNT=$(grep -E "[0-9]+ (automated )?tests" README.md | head -1 | grep -oE '[0-9]+')
  if [ "$README_TEST_COUNT" == "$TEST_COUNT" ]; then
    echo "✅ README.md test count: ${GREEN}${README_TEST_COUNT}${NC}"
  else
    echo "❌ README.md test count: ${RED}${README_TEST_COUNT}${NC} (expected ${TEST_COUNT})"
    ((ERRORS++))
  fi

  # Check CLAUDE.md test count
  CLAUDE_TEST_COUNT=$(grep -E "Test Coverage.*[0-9]+ tests" CLAUDE.md | head -1 | grep -oE '[0-9]+' | head -1)
  if [ "$CLAUDE_TEST_COUNT" == "$TEST_COUNT" ]; then
    echo "✅ CLAUDE.md test count: ${GREEN}${CLAUDE_TEST_COUNT}${NC}"
  else
    echo "❌ CLAUDE.md test count: ${RED}${CLAUDE_TEST_COUNT}${NC} (expected ${TEST_COUNT})"
    ((ERRORS++))
  fi
else
  echo "⚠️  Could not determine test count (npm test failed?)"
fi

# Check for broken internal links
echo ""
echo "🔗 Checking for broken documentation links in README.md..."
BROKEN_LINKS=0
while IFS= read -r link; do
  # Extract file path from markdown link
  filepath=$(echo "$link" | sed -E 's/.*\(([^)]+)\).*/\1/' | sed 's/^.\///')
  if [ ! -f "$filepath" ]; then
    echo "❌ Broken link in README.md: ${RED}${filepath}${NC}"
    ((BROKEN_LINKS++))
    ((ERRORS++))
  fi
done < <(grep -oE '\[.*\]\(\./[^)]+\.md\)' README.md)

if [ $BROKEN_LINKS -eq 0 ]; then
  echo "✅ All documentation links valid"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo "✅ ${GREEN}All documentation checks passed!${NC}"
  exit 0
else
  echo "❌ ${RED}Found ${ERRORS} documentation inconsistencies${NC}"
  echo ""
  echo "Run this command to see what needs updating:"
  echo "  grep -rn 'Version:' CLAUDE.md docs/README.md"
  echo "  grep -A 5 '^## \[' CHANGELOG.md | head -20"
  exit 1
fi
