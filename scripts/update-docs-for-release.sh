#!/bin/bash
# scripts/update-docs-for-release.sh
# Automates routine documentation updates for new release

set -e

# Check if version provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <new-version>"
  echo "Example: $0 1.3.0"
  exit 1
fi

NEW_VERSION=$1
CURRENT_VERSION=$(node -p "require('./package.json').version")
TODAY=$(date +%Y-%m-%d)
TEST_COUNT=$(npm test 2>&1 | grep -E "Tests.*[0-9]+ passed" | grep -oE '[0-9]+' | head -1)

echo "🔄 Updating documentation for release v${NEW_VERSION}"
echo "   Current version: v${CURRENT_VERSION}"
echo "   Date: ${TODAY}"
echo "   Test count: ${TEST_COUNT}"
echo ""

# Update CLAUDE.md version
echo "📝 Updating CLAUDE.md..."
sed -i.bak "s/Version: [0-9]\+\.[0-9]\+\.[0-9]\+/Version: ${NEW_VERSION}/" CLAUDE.md
sed -i.bak "s/Test Coverage: [0-9]\+ tests/Test Coverage: ${TEST_COUNT} tests/" CLAUDE.md
sed -i.bak "s/Last Updated: [0-9-]\+ (v[0-9.]\+)/Last Updated: ${TODAY} (v${NEW_VERSION} release)/" CLAUDE.md
rm -f CLAUDE.md.bak

# Update docs/README.md
echo "📝 Updating docs/README.md..."
sed -i.bak "s/Current Version: [0-9]\+\.[0-9]\+\.[0-9]\+/Current Version: ${NEW_VERSION}/" docs/README.md
sed -i.bak "s/Test Coverage: [0-9]\+ tests/Test Coverage: ${TEST_COUNT} tests/" docs/README.md
rm -f docs/README.md.bak

# Update package.json
echo "📝 Updating package.json version..."
npm version "$NEW_VERSION" --no-git-tag-version

echo ""
echo "✅ Automated updates complete!"
echo ""
echo "⚠️  Manual steps still required:"
echo "   1. Update CHANGELOG.md with release notes"
echo "   2. Update README.md feature descriptions"
echo "   3. Update SECURITY.md supported versions"
echo "   4. Create TEST_COVERAGE_REPORT_V${NEW_VERSION}.md (if minor/major release)"
echo "   5. Review CODE_REVIEW.md and SECURITY_AUDIT.md (if major release)"
echo ""
echo "Run './scripts/check-doc-versions.sh' to verify updates."
