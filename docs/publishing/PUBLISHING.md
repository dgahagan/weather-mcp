# Publishing Guide

This guide covers how to publish the Weather MCP Server to npm, create GitHub releases, and list in MCP registries.

## Prerequisites

1. **npm account** - Create at https://www.npmjs.com/signup
2. **npm login** - Run `npm login` in your terminal
3. **GitHub repository** - Already done! (public repo at github.com/dgahagan/weather-mcp)

## Step 1: Create a GitHub Release

### 1.1 Create and Push a Version Tag

```bash
# Ensure all changes are committed
git status

# Create a version tag
git tag -a v0.1.0 -m "Release v0.1.0: Initial public release with enhanced error handling"

# Push the tag to GitHub
git push origin v0.1.0
```

### 1.2 Create Release on GitHub

1. Go to https://github.com/dgahagan/weather-mcp/releases
2. Click "Draft a new release"
3. Click "Choose a tag" and select `v0.1.0`
4. Release title: `v0.1.0 - Initial Public Release`
5. Description:

```markdown
## Weather MCP Server v0.1.0

Initial public release of the Weather MCP Server - a Model Context Protocol server providing comprehensive weather data with no API keys required!

### Features

- 🌤️ **Weather Forecasts** (7-day) for US locations via NOAA API
- 🌡️ **Current Conditions** for US locations via NOAA API
- 📊 **Historical Weather Data** (1940-present) globally via Open-Meteo API
- 🔍 **Service Status Checking** with proactive health monitoring
- ⚡ **Enhanced Error Handling** with actionable guidance and status page links
- 🔑 **No API Keys Required** - completely free to use

### Installation

#### Via npm (Recommended)
```bash
npm install -g weather-mcp
```

#### Via npx (No installation)
```bash
npx weather-mcp
```

#### From source
```bash
git clone https://github.com/dgahagan/weather-mcp.git
cd weather-mcp
npm install
npm run build
```

### Usage

Add to your MCP client configuration:

**Claude Code** (`~/.config/claude-code/mcp_settings.json`):
```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["-y", "weather-mcp"]
    }
  }
}
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["-y", "weather-mcp"]
    }
  }
}
```

See [CLIENT_SETUP.md](./docs/CLIENT_SETUP.md) for setup instructions for all supported clients.

### What's New in v0.1.0

- ✅ Initial public release
- ✅ NOAA Weather API integration for US forecasts and current conditions
- ✅ Open-Meteo API integration for global historical weather data
- ✅ Service status checking tool
- ✅ Enhanced error handling with status page links
- ✅ Support for 8+ MCP clients (Claude Code, Claude Desktop, Cline, Cursor, Zed, etc.)
- ✅ Comprehensive documentation and testing

### Documentation

- [README.md](./README.md) - Main documentation
- [CLIENT_SETUP.md](./docs/CLIENT_SETUP.md) - Setup for various AI assistants
- [ERROR_HANDLING.md](./docs/ERROR_HANDLING.md) - Error handling documentation
- [MCP_BEST_PRACTICES.md](./docs/MCP_BEST_PRACTICES.md) - MCP implementation guide

### Requirements

- Node.js 18 or higher
- No API keys or tokens required

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

MIT License - see [LICENSE](./LICENSE) for details
```

6. Click "Publish release"

## Step 2: Publish to npm

### 2.1 Pre-publish Checks

```bash
# Verify package.json is correct
cat package.json

# Test build
npm run build

# Check what will be published (dry run)
npm pack --dry-run

# This should show:
# - dist/
# - README.md
# - LICENSE
# - package.json
```

### 2.2 Publish to npm

```bash
# First time: publish with public access
npm publish --access public

# Future updates:
# 1. Update version in package.json (e.g., 0.1.0 -> 0.1.1)
# 2. Create git tag
# 3. npm publish
```

### 2.3 Verify Publication

```bash
# Check your package is live
npm view weather-mcp

# Test installation
npx weather-mcp@latest --help
```

## Step 3: Update README with npm Installation

The README.md should be updated with npm installation instructions. See the changes in the next commit.

## Step 4: Update Official MCP Registry

The Official MCP Registry (https://registry.modelcontextprotocol.io) is the primary directory for MCP servers. Update it after each release.

### 4.1 Prerequisites

1. **server.json file** - Must exist in project root (already done)
2. **mcp-publisher tool** - CLI tool for publishing to the registry
3. **GitHub authentication** - For `io.github.*` namespaces

### 4.2 Install mcp-publisher (One-time Setup)

**Option 1: Homebrew (macOS/Linux)**
```bash
brew install mcp-publisher
```

**Option 2: Download Binary**
Download from https://github.com/modelcontextprotocol/registry/releases

**Option 3: Build from Source**
```bash
git clone https://github.com/modelcontextprotocol/registry.git
cd registry
make publisher
# Binary will be in ./bin/mcp-publisher
```

For this project, the `mcp-publisher` binary is already in the project root.

### 4.3 Update server.json

Update version and description in `server.json`:

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json",
  "name": "io.github.dgahagan/weather-mcp",
  "title": "Weather Data MCP Server",
  "description": "Your description here (max 100 characters!)",
  "version": "0.2.0",
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@dangahagan/weather-mcp",
      "version": "0.2.0",
      "transport": {
        "type": "stdio"
      }
    }
  ],
  "homepage": "https://github.com/dgahagan/weather-mcp",
  "license": "MIT",
  "categories": ["data", "utilities"],
  "keywords": ["weather", "forecast", "noaa", "open-meteo"]
}
```

**Important:** Description must be ≤100 characters or publishing will fail.

### 4.4 Authenticate with GitHub (One-time)

```bash
# Using local binary
./mcp-publisher login github

# Using installed binary
mcp-publisher login github
```

This will:
1. Display a GitHub device code
2. Open browser to https://github.com/login/device
3. Prompt you to enter the code and authorize
4. Save authentication credentials locally

### 4.5 Publish to Registry

```bash
# Commit server.json changes first
git add server.json
git commit -m "Update server.json to v0.2.0 for MCP registry"
git push origin main

# Publish to registry
./mcp-publisher publish
```

Expected output:
```
Publishing to https://registry.modelcontextprotocol.io...
✓ Successfully published
✓ Server io.github.dgahagan/weather-mcp version 0.2.0
```

### 4.6 Verify Publication

Check the registry to confirm your update:

```bash
# Via curl
curl "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.dgahagan/weather-mcp"

# Or visit in browser
# https://registry.modelcontextprotocol.io/v0/servers?search=io.github.dgahagan/weather-mcp
```

You should see your new version marked as `"isLatest": true`.

### 4.7 Common Issues

**Error: "validation failed - description length"**
- Description must be ≤100 characters
- Shorten and try again

**Error: "authentication required"**
- Run `./mcp-publisher login github` first
- Ensure GitHub account matches namespace (`io.github.dgahagan`)

**Error: "version already exists"**
- Each version can only be published once
- Increment version in both `package.json` and `server.json`

### 4.8 Registry Update Checklist

For each release:

- [ ] Update version in `package.json`
- [ ] Update version in `server.json`
- [ ] Update description in `server.json` (if needed, ≤100 chars)
- [ ] Commit and push `server.json` changes
- [ ] Authenticate with GitHub (if not already)
- [ ] Run `./mcp-publisher publish`
- [ ] Verify publication in registry

## Version Numbering (Semantic Versioning)

Follow semantic versioning (semver):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.2.0): New features, backward compatible
- **PATCH** (0.1.1): Bug fixes, backward compatible

Examples:
- `0.1.0` → `0.1.1`: Bug fixes
- `0.1.1` → `0.2.0`: Added new weather tool
- `0.2.0` → `1.0.0`: Changed tool names (breaking change)

## Release Checklist

Before each release:

- [ ] All tests pass
- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated
- [ ] package.json version is incremented
- [ ] server.json version is incremented
- [ ] server.json description updated (if needed, ≤100 chars)
- [ ] Code is committed and pushed to GitHub
- [ ] Git tag created and pushed
- [ ] GitHub release created
- [ ] npm package published
- [ ] Official MCP Registry updated (`./mcp-publisher publish`)
- [ ] Registry publication verified (check isLatest: true)
- [ ] Installation tested with `npx @dangahagan/weather-mcp`
- [ ] MCP client configuration tested

## Automation (Future Enhancement)

Consider adding GitHub Actions for automated publishing:

```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Support After Publishing

Monitor these after publishing:

1. **GitHub Issues** - Respond to bug reports and feature requests
2. **npm downloads** - Track usage via `npm view weather-mcp`
3. **User feedback** - Gather feedback from MCP community
4. **Dependencies** - Keep @modelcontextprotocol/sdk up to date

## Getting Help

- npm docs: https://docs.npmjs.com/
- MCP docs: https://modelcontextprotocol.io/
- Semantic versioning: https://semver.org/
