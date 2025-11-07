/**
 * Fire weather utility functions for interpreting fire danger indices
 */

/**
 * Haines Index category information
 * The Haines Index measures atmospheric stability and dryness that affect fire growth potential
 * Scale: 2-6 (Low, Moderate, High fire growth potential)
 */
export interface HainesCategory {
  level: string;
  description: string;
  fireGrowthPotential: string;
  color: string;
}

/**
 * Get Haines Index category
 * Haines Index: 2-6 scale measuring atmospheric contribution to fire growth
 * - Low elevation (< 3,000 ft): 2-3 = Low, 4 = Moderate, 5-6 = High
 * - Mid elevation (3,000-10,000 ft): Same scale
 * - High elevation (> 10,000 ft): Same scale
 */
export function getHainesCategory(hainesValue: number): HainesCategory {
  if (hainesValue <= 3) {
    return {
      level: 'Low',
      description: 'Low fire growth potential',
      fireGrowthPotential: 'Very low likelihood of large plume-dominated fire growth. Fires should remain relatively easy to control.',
      color: 'Green'
    };
  } else if (hainesValue === 4) {
    return {
      level: 'Moderate',
      description: 'Moderate fire growth potential',
      fireGrowthPotential: 'Moderate likelihood of plume-dominated fire growth. Fires may develop rapidly and become difficult to control.',
      color: 'Yellow'
    };
  } else if (hainesValue === 5) {
    return {
      level: 'High',
      description: 'High fire growth potential',
      fireGrowthPotential: 'High likelihood of plume-dominated fire growth. Fires may exhibit extreme behavior and become very difficult to control.',
      color: 'Orange'
    };
  } else {
    return {
      level: 'Very High',
      description: 'Very high fire growth potential',
      fireGrowthPotential: 'Very high likelihood of extreme fire behavior. Fires will likely exhibit blow-up characteristics and be extremely difficult to control.',
      color: 'Red'
    };
  }
}

/**
 * Get grassland fire danger category
 * Scale: 1-4 (Low, Moderate, High, Very High)
 */
export function getGrasslandFireDangerCategory(value: number): {
  level: string;
  description: string;
  color: string;
} {
  if (value <= 1) {
    return {
      level: 'Low',
      description: 'Low fire danger in grassland/rangeland fuels',
      color: 'Green'
    };
  } else if (value === 2) {
    return {
      level: 'Moderate',
      description: 'Moderate fire danger in grassland/rangeland fuels',
      color: 'Yellow'
    };
  } else if (value === 3) {
    return {
      level: 'High',
      description: 'High fire danger in grassland/rangeland fuels',
      color: 'Orange'
    };
  } else {
    return {
      level: 'Very High',
      description: 'Very high fire danger in grassland/rangeland fuels',
      color: 'Red'
    };
  }
}

/**
 * Get red flag threat index category
 * Indicates potential for Red Flag Warning conditions
 */
export function getRedFlagCategory(value: number): {
  level: string;
  description: string;
  color: string;
} {
  if (value < 30) {
    return {
      level: 'Low',
      description: 'Low threat of Red Flag Warning conditions',
      color: 'Green'
    };
  } else if (value < 60) {
    return {
      level: 'Moderate',
      description: 'Moderate threat of Red Flag Warning conditions',
      color: 'Yellow'
    };
  } else if (value < 80) {
    return {
      level: 'High',
      description: 'High threat of Red Flag Warning conditions',
      color: 'Orange'
    };
  } else {
    return {
      level: 'Very High',
      description: 'Very high threat - Red Flag Warning likely',
      color: 'Red'
    };
  }
}

/**
 * Get current fire weather value from gridpoint data series
 * Returns the value for the current time period
 */
export function getCurrentFireWeatherValue(dataSeries: { values: Array<{ validTime: string; value: number }> } | undefined): number | null {
  if (!dataSeries || !dataSeries.values || dataSeries.values.length === 0) {
    return null;
  }

  // Get the first value (most recent/current)
  // NOAA gridpoint data is ordered with current/near-future values first
  return dataSeries.values[0]?.value ?? null;
}

/**
 * Format mixing height value
 * Mixing height indicates how high smoke and pollutants can rise
 * Higher is generally better for smoke dispersion
 */
export function formatMixingHeight(heightFt: number | null): string {
  if (heightFt === null) {
    return 'N/A';
  }

  if (heightFt < 1000) {
    return `${Math.round(heightFt)} ft (very poor dispersion)`;
  } else if (heightFt < 3000) {
    return `${Math.round(heightFt)} ft (poor dispersion)`;
  } else if (heightFt < 6000) {
    return `${Math.round(heightFt)} ft (moderate dispersion)`;
  } else {
    return `${Math.round(heightFt)} ft (good dispersion)`;
  }
}

/**
 * Interpret transport wind speed for fire behavior
 * Transport winds carry smoke and can influence fire spread
 */
export function interpretTransportWind(speedMph: number | null): string {
  if (speedMph === null) {
    return 'N/A';
  }

  if (speedMph < 5) {
    return `${Math.round(speedMph)} mph (light - poor smoke transport)`;
  } else if (speedMph < 15) {
    return `${Math.round(speedMph)} mph (moderate smoke transport)`;
  } else if (speedMph < 25) {
    return `${Math.round(speedMph)} mph (good smoke transport)`;
  } else {
    return `${Math.round(speedMph)} mph (strong - rapid fire spread potential)`;
  }
}

/**
 * Fire weather context information for when indices aren't available
 */
export interface FireWeatherContext {
  hasIndices: boolean;
  reason: string;
  seasonalRisk: 'Low' | 'Moderate' | 'Elevated' | 'High';
  explanatoryText: string;
}

/**
 * Determine fire weather context and why indices may not be available
 * Provides user-friendly explanations for missing fire weather data
 */
export function getFireWeatherContext(
  latitude: number,
  longitude: number,
  timestamp: string,
  hainesValue: number | null,
  grasslandValue: number | null,
  redFlagValue: number | null,
  humidity?: number | null
): FireWeatherContext {
  const hasIndices = hainesValue !== null || grasslandValue !== null || redFlagValue !== null;

  // Parse month from timestamp
  const date = new Date(timestamp);
  const month = date.getMonth() + 1; // 1-12

  // Determine geographic region
  const isWestern = longitude < -100; // Western US (higher fire risk regions)
  const isSouthwest = latitude < 40 && longitude < -100; // Southwest US
  const isCalifornia = latitude > 32 && latitude < 42 && longitude > -124 && longitude < -114;
  const isSouthern = latitude < 35; // Southern states

  // Determine seasonal fire risk
  let seasonalRisk: 'Low' | 'Moderate' | 'Elevated' | 'High' = 'Low';
  let reason = '';
  let explanatoryText = '';

  if (hasIndices) {
    // Indices are present - fire conditions warrant monitoring
    seasonalRisk = 'Elevated';
    reason = 'Fire conditions warrant monitoring';
    explanatoryText = 'Current atmospheric conditions support potential fire weather concerns.';
  } else {
    // Indices not present - determine why

    // Check if it's winter (low fire season everywhere)
    if (month >= 11 || month <= 3) {
      seasonalRisk = 'Low';
      reason = 'Winter/low fire season';

      if (isCalifornia) {
        // California can have winter fires (Santa Ana season)
        explanatoryText = 'Out of peak fire season. Fire danger indices are calculated during elevated risk periods (typically spring-fall, or during Santa Ana wind events).';
      } else if (isSouthern) {
        explanatoryText = 'Winter season with minimal fire risk. Fire danger indices are calculated during dry periods with elevated fire potential.';
      } else {
        explanatoryText = 'Winter season with minimal fire risk due to cold temperatures, snow cover, or high humidity. Fire danger indices are calculated during dry, warm periods with elevated fire potential.';
      }
    } else if (month >= 4 && month <= 10) {
      // Fire season months - but indices still not present
      if (humidity !== null && humidity !== undefined && humidity > 70) {
        seasonalRisk = 'Low';
        reason = 'High humidity/recent precipitation';
        explanatoryText = 'Current conditions (high humidity, recent precipitation) do not support significant fire weather threats. Fire danger indices are calculated when atmospheric conditions favor fire growth.';
      } else if (isWestern || isSouthwest || isCalifornia) {
        // Western US during fire season - indices should typically be present
        seasonalRisk = 'Moderate';
        reason = 'Favorable conditions';
        explanatoryText = 'Current conditions do not meet thresholds for fire weather concerns. Fire danger indices are calculated during periods of low humidity, high temperatures, and strong winds.';
      } else {
        // Eastern US during summer
        seasonalRisk = 'Low';
        reason = 'Regional/seasonal factors';
        explanatoryText = 'Low regional fire risk. Fire danger indices are primarily calculated for western states and during periods of drought or extreme fire weather conditions.';
      }
    } else {
      // Shoulder season (early spring/late fall)
      seasonalRisk = 'Low';
      reason = 'Seasonal conditions';
      explanatoryText = 'Current seasonal conditions do not support significant fire weather threats. Fire danger indices are calculated during periods of elevated fire risk.';
    }
  }

  return {
    hasIndices,
    reason,
    seasonalRisk,
    explanatoryText
  };
}
