# Weather MCP Roadmap

This document outlines planned enhancements for future versions of the Weather MCP server.

## Version Planning

### v0.3.0 - Safety & Alerts (Target: Phase 1)

**Theme:** Critical safety features and quick wins

#### Features
1. **Weather Alerts Tool** 🔥 PRIORITY
   - Expose NOAA `/alerts/active` endpoint
   - Active watches, warnings, advisories
   - Filter by location (point, state, zone)
   - Severity levels, urgency, certainty
   - **User Query:** "Are there any weather alerts in my area?"
   - **Effort:** Low (1-2 days)
   - **Impact:** High - Safety-critical feature

2. **Hourly Forecast Tool**
   - Expose existing `getHourlyForecast` method as MCP tool
   - Hour-by-hour forecasts instead of 12-hour periods
   - **User Query:** "Give me hourly temperatures for tomorrow"
   - **Effort:** Very Low (< 1 day) - method already exists
   - **Impact:** High - Better planning queries

3. **Enhanced Current Conditions**
   - Display heat index and wind chill (already in data)
   - Show 24-hour max/min temperatures
   - Include precipitation history (last 1/3/6 hours)
   - Better cloud cover and visibility details
   - **Effort:** Low (1 day)
   - **Impact:** Medium - More complete weather picture

4. **Precipitation Probability in Forecasts**
   - Already available in API responses
   - Add to forecast output formatting
   - **User Query:** "What's the chance of rain tomorrow?"
   - **Effort:** Very Low (< 1 day)
   - **Impact:** Medium - Common user question

**Total Effort:** ~1 week
**Version Goal:** v0.3.0

---

### v0.4.0 - Global Expansion (Target: Phase 2)

**Theme:** Break US-only limitations, transform UX

#### Features
1. **Geocoding Integration** 🔥 PRIORITY
   - Implement Open-Meteo Geocoding API
   - Accept location names instead of requiring coordinates
   - Support: "weather in Paris", "forecast for Tokyo"
   - Return coordinates + location metadata
   - **Effort:** Medium (2-3 days)
   - **Impact:** Very High - Major UX improvement

2. **Global Forecast Support**
   - Implement Open-Meteo Weather Forecast API
   - Up to 16-day forecasts worldwide
   - Remove US-only limitation for forecasts
   - Multiple weather models available
   - **User Query:** "What's the forecast for London?"
   - **Effort:** Medium (3-4 days)
   - **Impact:** Very High - Opens to international users

3. **Sunrise/Sunset Times**
   - Add to daily forecasts using Open-Meteo data
   - Daylight duration calculation
   - **User Query:** "When's sunrise tomorrow?"
   - **Effort:** Low (1 day)
   - **Impact:** Medium - Useful for planning

**Total Effort:** ~1.5 weeks
**Version Goal:** v0.4.0

---

### v0.5.0 - Health & Environment (Target: Phase 3)

**Theme:** Air quality, fire weather, and health-related data

#### Features
1. **Air Quality Tool**
   - Open-Meteo Air Quality API
   - PM2.5, PM10, O3, NO2, SO2, CO
   - Air quality index (AQI)
   - UV index and aerosol data
   - **User Query:** "What's the air quality in Beijing?"
   - **Effort:** Medium (2-3 days)
   - **Impact:** High - Health-relevant data

2. **Fire Weather Indices**
   - Expose NOAA fire weather data (61 variables available)
   - Grassland fire danger index
   - Haines index (atmospheric stability)
   - Red flag threat index
   - **User Query:** "What's the fire danger level today?"
   - **Effort:** Medium (2-3 days)
   - **Impact:** Medium-High - Critical in fire-prone areas

3. **Advanced Heat/Cold Indices**
   - Prominent display of heat index when >80°F
   - Wind chill when <40°F
   - Wet bulb globe temperature (WBGT) for outdoor work safety
   - Apparent temperature
   - **Effort:** Low (1 day)
   - **Impact:** Medium - Safety-relevant

**Total Effort:** ~1.5 weeks
**Version Goal:** v0.5.0

---

### v0.6.0 - Specialized Weather (Target: Phase 4)

**Theme:** Marine, severe weather, and specialized use cases

#### Features
1. **Marine Weather Tool**
   - Open-Meteo Marine API
   - Wave height, period, direction
   - Ocean currents, water temperature
   - Swell data
   - **User Query:** "Are conditions safe for boating?"
   - **Effort:** Medium (3-4 days)
   - **Impact:** Medium - Valuable for coastal users

2. **Severe Weather Probabilities**
   - Expose NOAA severe weather data
   - Thunder probability
   - Tropical storm/hurricane wind probabilities
   - Wind gust potentials (20-60mph categories)
   - Tornado potential
   - **User Query:** "What's the probability of thunderstorms?"
   - **Effort:** Medium (2-3 days)
   - **Impact:** High - Safety-critical for severe weather

3. **Advanced Forecast Variables Tool**
   - Configurable parameter to request specific variables
   - Visibility, ceiling height, sky cover
   - Snow level, ice accumulation
   - Mixing height (air quality)
   - **User Query:** "What's the expected visibility tomorrow?"
   - **Effort:** Medium (3-4 days)
   - **Impact:** Medium - Specialized but valuable

**Total Effort:** ~2 weeks
**Version Goal:** v0.6.0

---

## Future Considerations (v0.7.0+)

### Long-term Enhancement Ideas

#### Ensemble/Probabilistic Forecasts
- Open-Meteo Ensemble API
- Confidence intervals for forecasts
- Multiple model run aggregation
- Uncertainty quantification
- **Use Case:** "What's the likelihood of rain between 2-4pm?"

#### Climate Trends & Analysis
- Open-Meteo Climate Change API
- Historical trend analysis
- Temperature anomalies
- Long-term climate projections (decades)
- **Use Case:** "How has average temperature changed over 50 years?"

#### Flood Monitoring
- Open-Meteo Flood API
- River levels and flood predictions
- **Use Case:** "Is there flood risk near the Mississippi?"

#### Agricultural/Soil Data
- Soil temperature at multiple depths
- Soil moisture content
- Evapotranspiration
- Growing degree days
- **Use Case:** "What's the soil temperature for planting?"

#### Solar Radiation Data
- Direct/diffuse/tilted radiation
- Shortwave radiation
- Sunshine duration
- **Use Case:** "What's the solar energy potential today?" (renewable energy)

#### Alert Subscriptions/Monitoring
- Monitor for specific weather conditions
- Proactive notifications when thresholds met
- **Use Case:** "Alert me if temperature drops below freezing"

#### Multi-Model Comparison
- Allow selection of specific weather models
- Compare forecasts from different models
- Show model agreement/disagreement
- **Use Case:** "What do different models predict for the hurricane path?"

---

## Data Already Available But Not Exposed

### NOAA API - Hidden in Current Responses
- 61 forecast variables from `/gridpoints` endpoint
- METAR raw messages (aviation weather)
- Detailed cloud layer information
- Station metadata (name, elevation)
- Weather phenomena arrays (intensity, modifier, type)

### Open-Meteo Historical API - Not Fully Utilized
- Wet bulb temperature
- Snow depth
- Soil data (temperature, moisture at 4 depths)
- Solar radiation (multiple types)
- Boundary layer height
- Vapor pressure deficit
- 100m wind height data

---

## Implementation Priorities

### Tier 1 - High Impact, Low Effort (v0.3.0)
1. Weather Alerts Tool ⭐⭐⭐
2. Hourly Forecast Tool ⭐⭐⭐
3. Enhanced Current Conditions ⭐⭐
4. Precipitation Probability ⭐⭐

### Tier 2 - High Impact, Medium Effort (v0.4.0)
5. Geocoding Integration ⭐⭐⭐
6. Global Forecast Support ⭐⭐⭐
7. Sunrise/Sunset Times ⭐⭐

### Tier 3 - Specialized, High Value (v0.5.0-v0.6.0)
8. Air Quality Tool ⭐⭐⭐
9. Fire Weather Indices ⭐⭐
10. Marine Weather Tool ⭐⭐
11. Severe Weather Probabilities ⭐⭐⭐

### Tier 4 - Future Expansion (v0.7.0+)
12. Ensemble Forecasts
13. Climate Trends
14. Flood Monitoring
15. Agricultural/Soil Data
16. Solar Radiation
17. Alert Subscriptions

---

## Technical Considerations

### Architecture Enhancements Needed

#### For v0.4.0 (Geocoding)
- New service: `src/services/geocoding.ts`
- Location name → coordinates resolution
- Cache geocoding results indefinitely (locations don't move)
- Reverse geocoding for coordinate → place name

#### For v0.4.0+ (Global Forecasts)
- New service methods in `openmeteo.ts` for forecast API
- Intelligent routing: NOAA (US, detailed) vs Open-Meteo (global)
- Unified response format between NOAA and Open-Meteo forecasts

#### For v0.3.0+ (Alerts)
- New service methods in `noaa.ts` for alerts endpoint
- Alert severity classification and formatting
- Consider alert caching (5-10 minute TTL)

#### For v0.5.0+ (Air Quality)
- New service: `src/services/airquality.ts` or extend `openmeteo.ts`
- Health category mapping (Good/Moderate/Unhealthy/etc.)
- AQI calculation and interpretation

### Caching Strategy Updates

**New TTL recommendations:**
- Weather alerts: 5-10 minutes (updates frequently)
- Geocoding results: Infinite (locations don't change)
- Air quality: 1 hour (updates hourly)
- Marine conditions: 1 hour (updates periodically)
- Fire weather indices: 3-6 hours (updates less frequently)

### Response Format Considerations

**Enhanced current conditions output:**
```markdown
## Current Weather

**Temperature:** 72°F
**Feels Like:** 68°F (wind chill)  ← NEW
**24hr High/Low:** 75°F / 52°F  ← NEW

**Recent Precipitation:**  ← NEW
- Last hour: 0.2 inches
- Last 3 hours: 0.5 inches
```

**Hourly forecast format:**
```markdown
## Hourly Forecast

### 2:00 PM
- Temperature: 75°F
- Precipitation Chance: 20%  ← NEW
- Wind: 10 mph SW
```

---

## User Query Patterns to Support

### Currently Not Well-Supported

#### Safety & Alerts ❌
- "Are there any weather warnings in my area?"
- "Is there a tornado watch active?"
- "Show me all weather alerts for California"

#### Natural Location Queries ⚠️
- "What's the weather in Paris?" (requires manual coordinates)
- "Forecast for Tokyo" (not available - US only forecasts)
- "Weather in downtown Seattle" (requires exact coordinates)

#### Health & Safety ❌
- "What's the air quality index?"
- "Is the heat dangerous today?"
- "What's the UV index?"

#### Specialized Weather ❌
- "What's the fire danger level?"
- "Are marine conditions safe?"
- "What are the surf conditions?"
- "When's sunrise tomorrow?"

#### Detailed Planning ⚠️
- "Give me hourly temperatures for tomorrow" (method exists but not exposed)
- "When will the rain start and stop?" (needs hourly + precipitation)

#### Severe Weather ❌
- "What's the probability of thunderstorms?"
- "Are hurricane winds possible?"
- "Show me the wind gust forecast"

---

## Testing Requirements

### For Each New Feature

1. **Unit Tests**
   - Service method tests with mocked API responses
   - Cache behavior verification
   - Error handling validation

2. **Integration Tests**
   - Real API connectivity tests
   - End-to-end MCP tool invocation
   - Multiple coordinate/location scenarios

3. **Documentation**
   - Update README.md with new tools
   - Add examples to TESTING_GUIDE.md
   - Update CLIENT_SETUP.md if needed

4. **Manual Testing Scenarios**
   - Test with actual AI conversations
   - Verify natural language query handling
   - Check error messages and edge cases

---

## Success Metrics

### Per Version Goals

**v0.3.0 Success:**
- Weather alerts functional for all US locations
- Hourly forecasts provide hour-by-hour detail
- Current conditions show "feels like" temperature
- Precipitation probability visible in forecasts

**v0.4.0 Success:**
- Users can query by location name (no coordinates needed)
- International forecasts available for major cities
- Global coverage for all forecast types

**v0.5.0 Success:**
- Air quality data available for major global cities
- Fire weather indices accessible for US locations
- Health-related warnings display prominently

**v0.6.0 Success:**
- Marine weather supports coastal planning
- Severe weather probabilities accessible
- Advanced variables support specialized use cases

### Overall Goals (v1.0.0)

- **Geographic Coverage:** Global forecasts and historical data
- **Safety:** Comprehensive alert system
- **User Experience:** Natural language location queries
- **Completeness:** 50%+ of available API data exposed
- **Health:** Air quality and health-related indices
- **Specialized:** Support for marine, fire, and severe weather

---

## Notes

- Prioritize features that enable natural AI conversations
- Focus on safety-critical features first (alerts, severe weather)
- Build on existing architecture (services, caching, error handling)
- Maintain backward compatibility with existing tools
- Document limitations clearly (e.g., some features US-only)
- Consider rate limits when adding new API integrations

---

## Contributing

When implementing features from this roadmap:

1. Create a feature branch: `feature/[feature-name]`
2. Update relevant documentation
3. Add tests for new functionality
4. Update CHANGELOG.md
5. Consider cache TTL for new data types
6. Test with real AI conversation patterns

---

*Last Updated: 2025-11-05*
*Current Version: v0.1.2 (with caching)*
*Next Target: v0.3.0 - Safety & Alerts*
