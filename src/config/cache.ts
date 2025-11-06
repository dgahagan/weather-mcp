/**
 * Cache configuration for weather data
 *
 * TTL (Time To Live) values are set based on data volatility:
 * - Historical data: Never changes once recorded
 * - Geographic data: Static (grid coordinates, station locations)
 * - Forecasts: Updated approximately hourly
 * - Current conditions: Observations typically update every 20-60 minutes
 */

// Time constants in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const CacheConfig = {
  // Enable/disable caching globally
  enabled: process.env.CACHE_ENABLED !== 'false', // Default: enabled

  // Maximum number of entries in cache before LRU eviction
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),

  // TTL values for different data types
  ttl: {
    // Grid coordinate lookups (lat/lon -> grid mapping)
    // These are geographic and never change
    gridCoordinates: Infinity,

    // Weather station lists
    // Stations rarely change
    stations: 24 * HOUR,

    // 7-day forecasts
    // NOAA updates forecasts approximately hourly
    forecast: 2 * HOUR,

    // Current weather conditions
    // Observations typically update every 20-60 minutes
    currentConditions: 15 * MINUTE,

    // Recent historical data (< 7 days old)
    // Recent data may still be updated/corrected
    recentHistorical: 1 * HOUR,

    // Historical data (> 1 day old from current time)
    // Historical data beyond 1 day is finalized and won't change
    historicalData: Infinity,

    // Service health check status
    // Check freshness periodically
    serviceStatus: 5 * MINUTE,
  },
} as const;

/**
 * Determine appropriate TTL for historical weather data based on date
 * @param startDate Start date of the historical query
 * @returns TTL in milliseconds
 */
export function getHistoricalDataTTL(startDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const now = new Date();
  const daysDiff = (now.getTime() - start.getTime()) / DAY;

  if (daysDiff > 1) {
    // Data is more than 1 day old - it's finalized and won't change
    return CacheConfig.ttl.historicalData;
  } else {
    // Recent data may still be updated
    return CacheConfig.ttl.recentHistorical;
  }
}
