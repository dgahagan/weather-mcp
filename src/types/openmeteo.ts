/**
 * TypeScript type definitions for Open-Meteo Historical Weather API
 * API Documentation: https://open-meteo.com/en/docs/historical-weather-api
 */

/**
 * Hourly weather variables available from Open-Meteo
 */
export interface OpenMeteoHourlyData {
  time: string[];
  temperature_2m?: number[];
  relative_humidity_2m?: number[];
  dewpoint_2m?: number[];
  apparent_temperature?: number[];
  precipitation?: number[];
  rain?: number[];
  snowfall?: number[];
  snow_depth?: number[];
  weather_code?: number[];
  pressure_msl?: number[];
  surface_pressure?: number[];
  cloud_cover?: number[];
  wind_speed_10m?: number[];
  wind_direction_10m?: number[];
  wind_gusts_10m?: number[];
  soil_temperature_0_to_7cm?: number[];
  soil_moisture_0_to_7cm?: number[];
}

/**
 * Daily weather variables available from Open-Meteo
 */
export interface OpenMeteoDailyData {
  time: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  temperature_2m_mean?: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  apparent_temperature_mean?: number[];
  precipitation_sum?: number[];
  rain_sum?: number[];
  snowfall_sum?: number[];
  precipitation_hours?: number[];
  weather_code?: number[];
  sunrise?: string[];
  sunset?: string[];
  sunshine_duration?: number[];
  wind_speed_10m_max?: number[];
  wind_gusts_10m_max?: number[];
  wind_direction_10m_dominant?: number[];
}

/**
 * Units used in the API response
 */
export interface OpenMeteoHourlyUnits {
  time?: string;
  temperature_2m?: string;
  relative_humidity_2m?: string;
  dewpoint_2m?: string;
  apparent_temperature?: string;
  precipitation?: string;
  rain?: string;
  snowfall?: string;
  snow_depth?: string;
  weather_code?: string;
  pressure_msl?: string;
  surface_pressure?: string;
  cloud_cover?: string;
  wind_speed_10m?: string;
  wind_direction_10m?: string;
  wind_gusts_10m?: string;
  soil_temperature_0_to_7cm?: string;
  soil_moisture_0_to_7cm?: string;
}

export interface OpenMeteoDailyUnits {
  time?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
  temperature_2m_mean?: string;
  apparent_temperature_max?: string;
  apparent_temperature_min?: string;
  apparent_temperature_mean?: string;
  precipitation_sum?: string;
  rain_sum?: string;
  snowfall_sum?: string;
  precipitation_hours?: string;
  weather_code?: string;
  sunrise?: string;
  sunset?: string;
  sunshine_duration?: string;
  wind_speed_10m_max?: string;
  wind_gusts_10m_max?: string;
  wind_direction_10m_dominant?: string;
}

/**
 * Complete API response from Open-Meteo Historical Weather API
 */
export interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units?: OpenMeteoHourlyUnits;
  hourly?: OpenMeteoHourlyData;
  daily_units?: OpenMeteoDailyUnits;
  daily?: OpenMeteoDailyData;
}

/**
 * Error response from Open-Meteo API
 */
export interface OpenMeteoErrorResponse {
  error: boolean;
  reason: string;
}

/**
 * Location result from Open-Meteo Geocoding API
 */
export interface GeocodingLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  country_id?: number;
  timezone?: string;
  population?: number;
  postcodes?: string[];
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  admin4_id?: number;
}

/**
 * Response from Open-Meteo Geocoding API
 */
export interface GeocodingResponse {
  results?: GeocodingLocation[];
  generationtime_ms?: number;
}

/**
 * Hourly forecast data from Open-Meteo Forecast API
 */
export interface OpenMeteoForecastHourlyData {
  time: string[];
  temperature_2m?: number[];
  relative_humidity_2m?: number[];
  dewpoint_2m?: number[];
  apparent_temperature?: number[];
  precipitation_probability?: number[];
  precipitation?: number[];
  rain?: number[];
  showers?: number[];
  snowfall?: number[];
  snow_depth?: number[];
  weather_code?: number[];
  pressure_msl?: number[];
  surface_pressure?: number[];
  cloud_cover?: number[];
  cloud_cover_low?: number[];
  cloud_cover_mid?: number[];
  cloud_cover_high?: number[];
  visibility?: number[];
  wind_speed_10m?: number[];
  wind_direction_10m?: number[];
  wind_gusts_10m?: number[];
  uv_index?: number[];
  is_day?: number[];
}

/**
 * Daily forecast data from Open-Meteo Forecast API
 */
export interface OpenMeteoForecastDailyData {
  time: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  sunrise?: string[];
  sunset?: string[];
  daylight_duration?: number[];
  sunshine_duration?: number[];
  uv_index_max?: number[];
  precipitation_sum?: number[];
  rain_sum?: number[];
  showers_sum?: number[];
  snowfall_sum?: number[];
  precipitation_hours?: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
  wind_gusts_10m_max?: number[];
  wind_direction_10m_dominant?: number[];
}

/**
 * Units for forecast hourly data
 */
export interface OpenMeteoForecastHourlyUnits {
  time?: string;
  temperature_2m?: string;
  relative_humidity_2m?: string;
  dewpoint_2m?: string;
  apparent_temperature?: string;
  precipitation_probability?: string;
  precipitation?: string;
  rain?: string;
  showers?: string;
  snowfall?: string;
  snow_depth?: string;
  weather_code?: string;
  pressure_msl?: string;
  surface_pressure?: string;
  cloud_cover?: string;
  cloud_cover_low?: string;
  cloud_cover_mid?: string;
  cloud_cover_high?: string;
  visibility?: string;
  wind_speed_10m?: string;
  wind_direction_10m?: string;
  wind_gusts_10m?: string;
  uv_index?: string;
  is_day?: string;
}

/**
 * Units for forecast daily data
 */
export interface OpenMeteoForecastDailyUnits {
  time?: string;
  weather_code?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
  apparent_temperature_max?: string;
  apparent_temperature_min?: string;
  sunrise?: string;
  sunset?: string;
  daylight_duration?: string;
  sunshine_duration?: string;
  uv_index_max?: string;
  precipitation_sum?: string;
  rain_sum?: string;
  showers_sum?: string;
  snowfall_sum?: string;
  precipitation_hours?: string;
  precipitation_probability_max?: string;
  wind_speed_10m_max?: string;
  wind_gusts_10m_max?: string;
  wind_direction_10m_dominant?: string;
}

/**
 * Complete API response from Open-Meteo Forecast API
 */
export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units?: OpenMeteoForecastHourlyUnits;
  hourly?: OpenMeteoForecastHourlyData;
  daily_units?: OpenMeteoForecastDailyUnits;
  daily?: OpenMeteoForecastDailyData;
}
