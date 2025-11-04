# Weather MCP Server - Implementation Plan

## Project Overview
Build an MCP (Model Context Protocol) server that provides weather data from NOAA's API to AI systems, with primary focus on Claude Code integration.

## Phase 1: Project Setup & Research

### 1.1 Initialize Project Structure
- [ ] Initialize npm project with `package.json`
- [ ] Set up TypeScript configuration (`tsconfig.json`)
- [ ] Create basic directory structure:
  ```
  /src
    /tools          # MCP tool implementations
    /services       # NOAA API service layer
    /types          # TypeScript type definitions
    /utils          # Helper utilities
    index.ts        # Main server entry point
  /tests            # Test files
  ```
- [ ] Install core dependencies:
  - `@modelcontextprotocol/sdk` - MCP SDK
  - `typescript` - TypeScript compiler
  - `tsx` - TypeScript execution
  - `axios` - HTTP client for NOAA API

### 1.2 Research NOAA API
- [ ] Document NOAA Weather API endpoints:
  - `api.weather.gov/points/{lat},{lon}` - Get forecast URLs for location
  - `api.weather.gov/gridpoints/{office}/{gridX},{gridY}/forecast` - Get forecast
  - `api.weather.gov/stations/{stationId}/observations` - Get observations
- [ ] Understand API rate limits and requirements
- [ ] Identify endpoints for historical data
- [ ] Document data formats and response structures
- [ ] Note any API keys or authentication requirements

## Phase 2: Core MCP Server Implementation

### 2.1 Server Bootstrap
- [ ] Create main server file (`src/index.ts`)
- [ ] Initialize MCP server with proper configuration
- [ ] Implement server lifecycle (startup, shutdown)
- [ ] Add error handling and logging
- [ ] Set up stdin/stdout transport for MCP communication

### 2.2 NOAA API Service Layer
- [ ] Create `NOAAService` class (`src/services/noaa.ts`)
- [ ] Implement location-to-forecast-URL resolution
- [ ] Implement forecast data fetching
- [ ] Implement observation/historical data fetching
- [ ] Add retry logic and error handling
- [ ] Add response caching (optional, for rate limit management)
- [ ] Create type definitions for NOAA API responses

## Phase 3: MCP Tools Implementation

### 3.1 Tool: get_forecast
**Purpose**: Get weather forecast for any location

**Input Parameters**:
- `location` (string): City, State format (e.g., "San Francisco, CA")
- `latitude` (number, optional): Latitude coordinate
- `longitude` (number, optional): Longitude coordinate
- `periods` (number, optional): Number of forecast periods (default: 7)

**Implementation**:
- [ ] Define tool schema
- [ ] Implement geocoding (if location string provided)
- [ ] Call NOAA points API to get forecast URLs
- [ ] Fetch and parse forecast data
- [ ] Format response for AI consumption
- [ ] Handle errors (invalid location, API failures)

### 3.2 Tool: get_current_conditions
**Purpose**: Get current weather conditions for a location

**Input Parameters**:
- `location` (string): City, State format
- `latitude` (number, optional): Latitude coordinate
- `longitude` (number, optional): Longitude coordinate

**Implementation**:
- [ ] Define tool schema
- [ ] Find nearest weather station
- [ ] Fetch latest observation data
- [ ] Format current conditions (temp, humidity, wind, etc.)
- [ ] Handle missing data gracefully

### 3.3 Tool: get_historical_weather
**Purpose**: Get historical weather data for a location

**Input Parameters**:
- `location` (string): City, State format
- `latitude` (number, optional): Latitude coordinate
- `longitude` (number, optional): Longitude coordinate
- `start_date` (string): ISO date string (YYYY-MM-DD)
- `end_date` (string): ISO date string (YYYY-MM-DD)
- `preset` (string, optional): "day", "week", "month" (alternative to date range)

**Implementation**:
- [ ] Define tool schema
- [ ] Find nearest weather station
- [ ] Calculate date range from preset if provided
- [ ] Fetch observation history from NOAA
- [ ] Aggregate data by day/period
- [ ] Format historical data for AI consumption
- [ ] Handle data gaps and missing observations

### 3.4 Tool: search_location (Helper)
**Purpose**: Convert location string to coordinates

**Input Parameters**:
- `location` (string): City, State or address

**Implementation**:
- [ ] Define tool schema
- [ ] Integrate geocoding service (NOAA, Census.gov, or similar)
- [ ] Return lat/lon with location metadata
- [ ] Handle ambiguous locations

## Phase 4: Testing & Validation

### 4.1 Unit Tests
- [ ] Test NOAA API service methods
- [ ] Test date range calculations
- [ ] Test error handling
- [ ] Test data formatting utilities
- [ ] Set up test framework (Jest or Vitest)

### 4.2 Integration Tests
- [ ] Test MCP tool execution end-to-end
- [ ] Test with actual NOAA API (or mocked responses)
- [ ] Test various location formats
- [ ] Test edge cases (invalid dates, missing data)

### 4.3 Manual Testing with Claude Code
- [ ] Add server to Claude Code MCP configuration
- [ ] Test forecast retrieval for various locations
- [ ] Test historical data queries
- [ ] Test error scenarios
- [ ] Verify data quality and formatting
- [ ] Test performance and response times

## Phase 5: Documentation & Configuration

### 5.1 Documentation
- [ ] Create comprehensive README.md:
  - Project description
  - Installation instructions
  - Configuration guide
  - Usage examples
  - API reference
- [ ] Add inline code documentation (JSDoc)
- [ ] Create CONTRIBUTING.md for open source
- [ ] Add LICENSE file (choose appropriate license)
- [ ] Document NOAA API limitations and best practices

### 5.2 Configuration
- [ ] Create example MCP configuration for Claude Code
- [ ] Add environment variable support (if needed)
- [ ] Create `.env.example` file
- [ ] Add configuration validation

### 5.3 Build & Distribution
- [ ] Set up build scripts in package.json
- [ ] Configure TypeScript build output
- [ ] Add npm scripts for development and production
- [ ] Consider publishing to npm (optional)

## Phase 6: Enhancements (Optional)

### 6.1 Advanced Features
- [ ] Add weather alerts/warnings tool
- [ ] Add radar/satellite data integration
- [ ] Implement caching strategy for repeated queries
- [ ] Add support for international locations (if NOAA supports)
- [ ] Add weather comparison tool (compare multiple locations)

### 6.2 Developer Experience
- [ ] Add development mode with hot reload
- [ ] Create debug logging with different levels
- [ ] Add health check/status endpoint
- [ ] Create CLI tool for testing server without MCP client

## Technical Decisions & Notes

### Geocoding Strategy
**Options**:
1. Use Census.gov Geocoding API (free, US-only)
2. Use NOAA's built-in location search
3. Require latitude/longitude input only
4. Use external service (OpenStreetMap Nominatim)

**Recommendation**: Start with Census.gov for US locations, allow manual lat/lon as fallback

### Historical Data Limitations
NOAA's observation API typically provides:
- Recent observations (last few days) easily accessible
- Historical data may require different endpoints or services
- May need to use NCDC (National Climatic Data Center) API for older data

**Approach**: Implement recent history (last 7-30 days) first, document limitations, plan for NCDC integration later

### Error Handling Philosophy
- Always provide meaningful error messages to AI
- Degrade gracefully (e.g., if historical data unavailable, explain why)
- Never expose raw API errors to end user
- Log detailed errors for debugging

### Data Format for AI Consumption
- Use clear, structured text format
- Include units (F/C, mph, etc.)
- Provide context (location name, date/time, source)
- Format numbers appropriately (round to reasonable precision)
- Use markdown formatting for readability

## Implementation Timeline (Estimated)

- **Phase 1**: 2-4 hours (setup + research)
- **Phase 2**: 4-6 hours (core server)
- **Phase 3**: 8-12 hours (tools implementation)
- **Phase 4**: 4-6 hours (testing)
- **Phase 5**: 3-4 hours (documentation)
- **Phase 6**: Variable (enhancements as needed)

**Total Estimated Time**: 21-32 hours for core implementation

## Success Criteria

1. ✅ MCP server successfully connects to Claude Code
2. ✅ Can retrieve accurate forecasts for any US location
3. ✅ Can retrieve current weather conditions
4. ✅ Can retrieve historical weather data (at least recent history)
5. ✅ Error handling is robust and informative
6. ✅ Documentation is complete and clear
7. ✅ Code is well-tested and reliable
8. ✅ Ready for GitHub publication

## Next Steps

1. Begin with Phase 1: Initialize project and research NOAA API
2. Create basic project structure
3. Test NOAA API endpoints manually to understand data format
4. Implement core MCP server with one simple tool
5. Iterate and expand functionality
