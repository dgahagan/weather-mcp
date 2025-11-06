# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-05

### Added

#### Core Features
- **Weather Forecasts** - 7-day forecasts for US locations via NOAA API
- **Current Conditions** - Real-time weather observations for US locations via NOAA API
- **Historical Weather Data** - Access to historical weather from 1940-present
  - Recent data (last 7 days): NOAA real-time API with hourly observations (US only)
  - Archival data (>7 days): Open-Meteo API with hourly/daily data (global coverage)

#### Enhanced Error Handling & Service Status
- **Service Status Checking** - New `check_service_status` MCP tool for proactive health monitoring
- **Enhanced Error Messages** - All errors include:
  - Clear problem descriptions
  - Contextual help specific to error type
  - Direct links to official status pages
  - Recommended actions for resolution
- **Service Status Methods** - Health check APIs for both NOAA and Open-Meteo services
- **Enhanced Tool Descriptions** - Guide AI clients on error handling and recovery strategies

#### Multi-Client Support
- Support for 8+ MCP clients: Claude Code, Claude Desktop, Cline, Cursor, Zed, VS Code (Copilot), LM Studio, Postman
- Comprehensive client setup documentation

#### API Integration
- NOAA Weather API integration (no API key required)
  - Forecasts endpoint
  - Current conditions endpoint
  - Historical observations (last 7 days)
- Open-Meteo Historical Weather API integration (no API key required)
  - Historical data from 1940 to 5 days ago
  - Hourly data for ranges up to 31 days
  - Daily summaries for longer periods
  - Global coverage

#### Tools
- `get_forecast` - Get weather forecasts for US locations
- `get_current_conditions` - Get current weather observations for US locations
- `get_historical_weather` - Get historical weather data (automatically selects NOAA or Open-Meteo based on date range)
- `check_service_status` - Check operational status of both weather APIs

#### Documentation
- Comprehensive README with installation and usage instructions
- CLIENT_SETUP.md with setup guides for 8 different MCP clients
- ERROR_HANDLING.md documenting enhanced error handling features
- MCP_BEST_PRACTICES.md guide for service status communication
- TESTING_GUIDE.md for manual testing procedures
- API research documentation (NOAA_API_RESEARCH.md)

#### Testing
- Service status checking tests
- MCP tool integration tests
- NOAA API connectivity tests

#### Developer Experience
- TypeScript implementation with full type definitions
- Modular architecture with separate service classes
- Unit conversion utilities (Celsius to Fahrenheit, etc.)
- Retry logic with exponential backoff
- Automatic service selection based on date range

### Infrastructure
- MIT License
- Node.js 18+ support
- No API keys or tokens required
- Public GitHub repository

### Status Page Links Integrated
- NOAA API: Planned outages, service notices, issue reporting
- Open-Meteo API: Production status, GitHub issues

## [0.3.0] - TBD

### Added

#### New Tools
- **Weather Alerts** - NEW `get_alerts` MCP tool for safety-critical weather information
  - Active watches, warnings, and advisories for US locations
  - Severity levels (Extreme, Severe, Moderate, Minor)
  - Urgency and certainty indicators
  - Effective and expiration times
  - Affected areas and event types
  - Instructions and recommended responses
  - Automatic sorting by severity
  - 5-minute cache TTL (alerts change rapidly)

#### Enhanced get_forecast Tool
- **Hourly Forecasts** - NEW `granularity` parameter
  - Options: "daily" (default) or "hourly"
  - Hourly provides up to 156 hours of detailed forecasts
  - Daily maintains backward compatibility
- **Precipitation Probability** - NEW `include_precipitation_probability` parameter
  - Shows chance of rain/snow for each period
  - Enabled by default
  - Available in both daily and hourly forecasts
- **Enhanced Output Formatting**
  - Temperature trends when available
  - Humidity display (especially in hourly forecasts)
  - Clear granularity indication in headers

#### Enhanced get_current_conditions Tool
- **Feels-Like Temperature** - Intelligent display of comfort indices
  - Heat Index shown when temperature >80°F
  - Wind Chill shown when temperature <50°F
  - Only displayed when significantly different from actual temperature
- **24-Hour Temperature Range** - Historical context
  - High temperature in last 24 hours
  - Low temperature in last 24 hours
  - Provides daily context for current conditions
- **Wind Gusts** - Enhanced wind information
  - Gust speed shown when 20%+ higher than sustained wind
  - Helps identify potentially hazardous conditions
- **Enhanced Visibility** - Descriptive categories
  - Dense fog (<0.25 mi)
  - Fog (0.25-1 mi)
  - Haze/mist (1-3 mi)
  - Clear (≥10 mi)
- **Cloud Cover Details** - Detailed sky conditions
  - Cloud layer heights in feet AGL
  - Descriptive categories (Few, Scattered, Broken, Overcast)
  - Multiple cloud layers displayed
- **Recent Precipitation** - Historical precipitation data
  - Last 1 hour accumulation
  - Last 3 hours accumulation
  - Last 6 hours accumulation
  - Displayed in inches

#### New Service Methods
- `NOAAService.getAlerts()` - Fetch weather alerts for coordinates
- `NOAAService.getHourlyForecastByCoordinates()` - Convenience method for hourly forecasts

#### Testing
- Comprehensive integration test suite for v0.3.0 features
- Individual feature tests for alerts, forecasts, and conditions
- Multi-location testing across different climates
- Test coverage for all enhanced display logic

### Changed
- Updated tool descriptions to reflect new capabilities
- Enhanced error messages for alerts endpoint
- Improved output formatting consistency across all tools
- Better handling of optional/missing data fields

### Infrastructure
- Added cache configuration for alerts (5-minute TTL)
- Extended TypeScript types for alert responses
- Improved null/undefined handling for optional fields

## [0.4.0] - 2025-11-06

### Security Improvements

#### Critical Security Fixes
- **Enhanced Input Validation** - Comprehensive NaN and Infinity checks for all coordinate inputs
  - Prevents edge case failures with invalid numeric values
  - Validates latitude (-90 to 90) and longitude (-180 to 180) ranges
  - Runtime type checking with `Number.isFinite()` validation
  - Applied to all service methods in NOAA and Open-Meteo services

#### Automated Security Monitoring
- **Dependency Scanning** - Integrated npm audit for continuous vulnerability monitoring
  - Added `npm run audit` and `npm run audit:fix` scripts
  - Configured GitHub Dependabot for automated dependency updates
  - Weekly security checks with automatic PR creation
  - Zero vulnerabilities detected in current dependencies
- **Security Policy** - Comprehensive SECURITY.md with vulnerability reporting process
  - Responsible disclosure guidelines
  - Response timeline commitments (48hr acknowledgment, 7-day assessment)
  - Security best practices for users
  - Supported versions and update policy

#### Error Handling Improvements
- **Custom Error Class Hierarchy** - Replaced generic errors with typed error classes
  - `RateLimitError` for 429 rate limit responses with retry guidance
  - `ServiceUnavailableError` for network/timeout failures with status page links
  - `InvalidLocationError` for invalid coordinates or parameters
  - `DataNotFoundError` for 404 responses (location outside coverage area)
  - `ApiError` base class with service attribution and help links
  - `ValidationError` for input validation failures
- **Error Sanitization** - Prevents information leakage in error messages
  - Network errors (ECONNREFUSED, ETIMEDOUT) sanitized to user-friendly messages
  - Stack traces properly handled and not exposed to users
  - Retryable errors clearly identified with `isRetryable` flag
- **Consistent Error Format** - All errors include contextual help and official status page links

### Reliability Improvements

#### Retry Logic Enhancement
- **Exponential Backoff with Jitter** - Prevents thundering herd during service recovery
  - 50-100% randomized jitter added to retry delays
  - Base delays: 1s, 2s, 4s for successive retries
  - Distributes retry attempts over time to reduce service load spikes
  - Applied to both NOAA and Open-Meteo service layers

### Testing Infrastructure

#### Comprehensive Test Suite Expansion
- **247 Total Tests** (up from 131, +89% increase)
  - Unit tests: 228 tests across 6 test files
  - Integration tests: 19 tests for error recovery scenarios
  - All tests passing with ~1 second execution time

#### New Test Coverage
- **Error Classes** - `tests/unit/errors.test.ts` (43 tests)
  - 100% coverage on custom error hierarchy
  - Tests for error message formatting, retryability, and inheritance
  - Validation of error sanitization functions
- **Cache Configuration** - `tests/unit/config.test.ts` (21 tests)
  - TTL strategy validation for different data types
  - Historical data aging logic tests
  - Environment variable parsing and bounds checking
- **Retry Logic** - `tests/unit/retry-logic.test.ts` (19 tests)
  - Mathematical validation of exponential backoff algorithm
  - Statistical distribution testing for jitter effectiveness
  - Boundary condition and overflow protection tests
- **Enhanced Units Tests** - `tests/unit/units.test.ts` (+33 tests, now 64 total)
  - 100% coverage on all formatting functions
  - Temperature, wind, visibility, pressure conversions
  - Date/time formatting with locale support
  - Cardinal direction mapping (16 directions)

#### Coverage Achievements
- **ApiError.ts**: 100% coverage (up from 0%)
- **units.ts**: 100% coverage (up from 19.6%)
- **cache.ts**: 100% coverage (maintained)
- **validation.ts**: 100% coverage (maintained)
- **Overall**: 54% statement coverage with 100% on critical utilities

### Documentation

#### Security Documentation
- **SECURITY.md** - Comprehensive security policy
  - Vulnerability reporting procedures
  - Response timeline commitments
  - Security best practices for users and developers
  - Dependencies security guidance
  - CI/CD security recommendations
- **Security Audit Report** - `SECURITY_AUDIT.md`
  - Overall security posture: B+ (Good)
  - Risk level: LOW
  - Zero critical or high-severity vulnerabilities
  - Detailed findings and recommendations

#### Code Quality Documentation
- **Code Review Report** - Updated `CODE_REVIEW.md`
  - All critical issues resolved
  - High and medium priority items completed
  - Comprehensive issue tracking with before/after analysis
  - Security and maintainability improvements documented

### Changed
- Updated service error handling to use custom error classes
- Enhanced coordinate validation in all API methods
- Improved retry logic with jitter for better failure recovery

### Infrastructure
- Added Dependabot configuration (`.github/dependabot.yml`)
- Integrated npm audit into development workflow
- Enhanced test infrastructure with vitest coverage reporting
- Added CI/CD readiness with fast, reliable test suite

### Developer Experience
- Improved error debugging with typed error classes
- Better test organization with logical grouping
- Comprehensive test coverage for critical code paths
- Clear security guidelines for contributors

---

## [Unreleased]

### Planned
- Location search by city name (geocoding)
- Global forecast support (via Open-Meteo)
- Extended forecast periods (up to 16 days)
- Air quality data
- Marine conditions
- Fire weather indices
- GitHub Actions for CI/CD
- Service integration tests (handlers and MCP lifecycle)

---

## Version History

- **[0.4.0]** - 2025-11-06 - Security & Quality Improvements (enhanced validation, error handling, testing)
- **[0.3.0]** - TBD - Enhanced Core Tools (alerts, hourly forecasts, enhanced conditions)
- **[0.2.0]** - 2025-11-05 - Added caching support
- **[0.1.0]** - 2025-11-05 - Initial public release

[0.4.0]: https://github.com/dgahagan/weather-mcp/releases/tag/v0.4.0
[0.3.0]: https://github.com/dgahagan/weather-mcp/releases/tag/v0.3.0
[0.2.0]: https://github.com/dgahagan/weather-mcp/releases/tag/v0.2.0
[0.1.0]: https://github.com/dgahagan/weather-mcp/releases/tag/v0.1.0
