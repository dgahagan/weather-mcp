/**
 * Handler for get_forecast tool
 * Supports both NOAA (US) and Open-Meteo (global) forecast sources
 */

import { NOAAService } from '../services/noaa.js';
import { OpenMeteoService } from '../services/openmeteo.js';
import {
  validateCoordinates,
  validateForecastDays,
  validateGranularity,
  validateOptionalBoolean,
} from '../utils/validation.js';

interface ForecastArgs {
  latitude?: number;
  longitude?: number;
  days?: number;
  granularity?: 'daily' | 'hourly';
  include_precipitation_probability?: boolean;
  source?: 'auto' | 'noaa' | 'openmeteo';
}

/**
 * Determine if coordinates are within the United States (including Alaska, Hawaii, and territories)
 * Uses bounding box approach for simplicity
 */
function isInUS(latitude: number, longitude: number): boolean {
  // Continental US, Alaska, Hawaii, Puerto Rico, and territories
  const inContinentalUS = latitude >= 24.5 && latitude <= 49.4 && longitude >= -125 && longitude <= -66.9;
  const inAlaska = latitude >= 51 && latitude <= 71.4 && longitude >= -180 && longitude <= -129.9;
  const inHawaii = latitude >= 18.9 && latitude <= 28.5 && longitude >= -178.4 && longitude <= -154.8;
  const inPuertoRico = latitude >= 17.9 && latitude <= 18.5 && longitude >= -67.3 && longitude <= -65.2;

  return inContinentalUS || inAlaska || inHawaii || inPuertoRico;
}

export async function handleGetForecast(
  args: unknown,
  noaaService: NOAAService,
  openMeteoService: OpenMeteoService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // Validate input parameters with runtime checks
  const { latitude, longitude } = validateCoordinates(args);
  const days = validateForecastDays(args);
  const granularity = validateGranularity((args as ForecastArgs)?.granularity);
  const include_precipitation_probability = validateOptionalBoolean(
    (args as ForecastArgs)?.include_precipitation_probability,
    'include_precipitation_probability',
    true
  );

  // Get source preference or auto-detect
  const requestedSource = (args as ForecastArgs)?.source || 'auto';
  let useNOAA: boolean;

  if (requestedSource === 'auto') {
    // Auto-detect based on location (US = NOAA, elsewhere = Open-Meteo)
    useNOAA = isInUS(latitude, longitude);
  } else {
    useNOAA = requestedSource === 'noaa';
  }

  // Use NOAA for US locations or if explicitly requested
  if (useNOAA) {
    return await formatNOAAForecast(
      noaaService,
      latitude,
      longitude,
      days,
      granularity,
      include_precipitation_probability
    );
  } else {
    // Use Open-Meteo for international locations
    return await formatOpenMeteoForecast(
      openMeteoService,
      latitude,
      longitude,
      days,
      granularity,
      include_precipitation_probability
    );
  }
}

/**
 * Format NOAA forecast data for display
 */
async function formatNOAAForecast(
  noaaService: NOAAService,
  latitude: number,
  longitude: number,
  days: number,
  granularity: 'daily' | 'hourly',
  include_precipitation_probability: boolean
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // Get forecast data based on granularity
  const forecast = granularity === 'hourly'
    ? await noaaService.getHourlyForecastByCoordinates(latitude, longitude)
    : await noaaService.getForecastByCoordinates(latitude, longitude);

  // Determine how many periods to show
  let periods;
  if (granularity === 'hourly') {
    // For hourly, show up to days * 24 hours
    periods = forecast.properties.periods.slice(0, days * 24);
  } else {
    // For daily, show up to days * 2 (day/night periods)
    periods = forecast.properties.periods.slice(0, days * 2);
  }

  // Format the forecast for display
  let output = `# Weather Forecast (${granularity === 'hourly' ? 'Hourly' : 'Daily'})\n\n`;
  output += `**Location:** ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n`;
  output += `**Elevation:** ${forecast.properties.elevation.value}m\n`;
  if (forecast.properties.updated) {
    output += `**Updated:** ${new Date(forecast.properties.updated).toLocaleString()}\n`;
  }
  output += `**Showing:** ${periods.length} ${granularity === 'hourly' ? 'hours' : 'periods'}\n\n`;

  for (const period of periods) {
    // For hourly forecasts, use the start time as the header since period names are empty
    const periodHeader = granularity === 'hourly' && !period.name
      ? new Date(period.startTime).toLocaleString()
      : period.name;
    output += `## ${periodHeader}\n`;
    output += `**Temperature:** ${period.temperature}°${period.temperatureUnit}`;

    // Add temperature trend if available
    if (period.temperatureTrend && period.temperatureTrend.trim()) {
      output += ` (${period.temperatureTrend})`;
    }
    output += `\n`;

    // Add precipitation probability if requested and available
    if (include_precipitation_probability && period.probabilityOfPrecipitation?.value !== null && period.probabilityOfPrecipitation?.value !== undefined) {
      output += `**Precipitation Chance:** ${period.probabilityOfPrecipitation.value}%\n`;
    }

    output += `**Wind:** ${period.windSpeed} ${period.windDirection}\n`;

    // Add humidity if available (more common in hourly forecasts)
    if (period.relativeHumidity?.value !== null && period.relativeHumidity?.value !== undefined) {
      output += `**Humidity:** ${period.relativeHumidity.value}%\n`;
    }

    output += `**Forecast:** ${period.shortForecast}\n\n`;

    // For daily forecasts, include detailed forecast
    if (granularity === 'daily' && period.detailedForecast) {
      output += `${period.detailedForecast}\n\n`;
    }
  }

  output += `---\n`;
  output += `*Data source: NOAA National Weather Service (US)*\n`;

  return {
    content: [
      {
        type: 'text',
        text: output
      }
    ]
  };
}

/**
 * Format Open-Meteo forecast data for display
 */
async function formatOpenMeteoForecast(
  openMeteoService: OpenMeteoService,
  latitude: number,
  longitude: number,
  days: number,
  granularity: 'daily' | 'hourly',
  include_precipitation_probability: boolean
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // Get forecast data from Open-Meteo
  const forecast = await openMeteoService.getForecast(
    latitude,
    longitude,
    days,
    granularity === 'hourly'
  );

  let output = `# Weather Forecast (${granularity === 'hourly' ? 'Hourly' : 'Daily'})\n\n`;
  output += `**Location:** ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n`;
  output += `**Elevation:** ${forecast.elevation}m\n`;
  output += `**Timezone:** ${forecast.timezone}\n`;
  output += `**Forecast Days:** ${days}\n\n`;

  if (granularity === 'hourly' && forecast.hourly) {
    // Format hourly data
    const hourly = forecast.hourly;
    const numHours = Math.min(hourly.time.length, days * 24);

    for (let i = 0; i < numHours; i++) {
      const time = new Date(hourly.time[i]);
      output += `## ${time.toLocaleString()}\n`;

      if (hourly.temperature_2m?.[i] !== undefined) {
        output += `**Temperature:** ${Math.round(hourly.temperature_2m[i])}°F`;
        if (hourly.apparent_temperature?.[i] !== undefined) {
          output += ` (feels like ${Math.round(hourly.apparent_temperature[i])}°F)`;
        }
        output += `\n`;
      }

      if (include_precipitation_probability && hourly.precipitation_probability?.[i] !== undefined) {
        output += `**Precipitation Chance:** ${hourly.precipitation_probability[i]}%\n`;
      }

      if (hourly.precipitation?.[i] !== undefined && hourly.precipitation[i] > 0) {
        output += `**Precipitation:** ${hourly.precipitation[i].toFixed(2)} in\n`;
      }

      if (hourly.wind_speed_10m?.[i] !== undefined) {
        const windDir = hourly.wind_direction_10m?.[i] !== undefined
          ? ` ${getWindDirection(hourly.wind_direction_10m[i])}`
          : '';
        output += `**Wind:** ${Math.round(hourly.wind_speed_10m[i])} mph${windDir}\n`;

        if (hourly.wind_gusts_10m?.[i] !== undefined && hourly.wind_gusts_10m[i] > hourly.wind_speed_10m[i] * 1.2) {
          output += `**Wind Gusts:** ${Math.round(hourly.wind_gusts_10m[i])} mph\n`;
        }
      }

      if (hourly.relative_humidity_2m?.[i] !== undefined) {
        output += `**Humidity:** ${hourly.relative_humidity_2m[i]}%\n`;
      }

      if (hourly.weather_code?.[i] !== undefined) {
        output += `**Conditions:** ${openMeteoService.getWeatherDescription(hourly.weather_code[i])}\n`;
      }

      output += `\n`;
    }
  } else if (forecast.daily) {
    // Format daily data with sunrise/sunset
    const daily = forecast.daily;
    const numDays = Math.min(daily.time.length, days);

    for (let i = 0; i < numDays; i++) {
      const date = new Date(daily.time[i]);
      output += `## ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n`;

      if (daily.temperature_2m_max?.[i] !== undefined && daily.temperature_2m_min?.[i] !== undefined) {
        output += `**Temperature:** High ${Math.round(daily.temperature_2m_max[i])}°F / Low ${Math.round(daily.temperature_2m_min[i])}°F\n`;
      }

      if (daily.apparent_temperature_max?.[i] !== undefined && daily.apparent_temperature_min?.[i] !== undefined) {
        output += `**Feels Like:** High ${Math.round(daily.apparent_temperature_max[i])}°F / Low ${Math.round(daily.apparent_temperature_min[i])}°F\n`;
      }

      // Include sunrise/sunset data
      if (daily.sunrise?.[i]) {
        const sunrise = new Date(daily.sunrise[i]);
        output += `**Sunrise:** ${sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}\n`;
      }

      if (daily.sunset?.[i]) {
        const sunset = new Date(daily.sunset[i]);
        output += `**Sunset:** ${sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}\n`;
      }

      if (daily.daylight_duration?.[i] !== undefined) {
        const hours = Math.floor(daily.daylight_duration[i] / 3600);
        const minutes = Math.floor((daily.daylight_duration[i] % 3600) / 60);
        output += `**Daylight Duration:** ${hours}h ${minutes}m\n`;
      }

      if (include_precipitation_probability && daily.precipitation_probability_max?.[i] !== undefined) {
        output += `**Precipitation Chance:** ${daily.precipitation_probability_max[i]}%\n`;
      }

      if (daily.precipitation_sum?.[i] !== undefined && daily.precipitation_sum[i] > 0) {
        output += `**Precipitation:** ${daily.precipitation_sum[i].toFixed(2)} in\n`;
      }

      if (daily.wind_speed_10m_max?.[i] !== undefined) {
        const windDir = daily.wind_direction_10m_dominant?.[i] !== undefined
          ? ` ${getWindDirection(daily.wind_direction_10m_dominant[i])}`
          : '';
        output += `**Wind:** ${Math.round(daily.wind_speed_10m_max[i])} mph${windDir}\n`;

        if (daily.wind_gusts_10m_max?.[i] !== undefined && daily.wind_gusts_10m_max[i] > daily.wind_speed_10m_max[i] * 1.2) {
          output += `**Wind Gusts:** ${Math.round(daily.wind_gusts_10m_max[i])} mph\n`;
        }
      }

      if (daily.weather_code?.[i] !== undefined) {
        output += `**Conditions:** ${openMeteoService.getWeatherDescription(daily.weather_code[i])}\n`;
      }

      if (daily.uv_index_max?.[i] !== undefined) {
        output += `**UV Index:** ${daily.uv_index_max[i].toFixed(1)}\n`;
      }

      output += `\n`;
    }
  }

  output += `---\n`;
  output += `*Data source: Open-Meteo (Global)*\n`;

  return {
    content: [
      {
        type: 'text',
        text: output
      }
    ]
  };
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
