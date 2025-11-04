/**
 * Type definitions for NOAA Weather API responses
 */

/**
 * Common properties in NOAA API responses
 */
export interface NOAAResponse<T> {
  '@context'?: unknown;
  type?: string;
  geometry?: {
    type: string;
    coordinates: number[];
  };
  properties: T;
}

/**
 * Response from /points/{lat},{lon} endpoint
 */
export interface PointsProperties {
  '@id': string;
  cwa: string; // Weather office ID
  forecastOffice: string;
  gridId: string;
  gridX: number;
  gridY: number;
  forecast: string; // URL to forecast
  forecastHourly: string; // URL to hourly forecast
  forecastGridData: string;
  observationStations: string; // URL to stations
  relativeLocation: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[];
    };
    properties: {
      city: string;
      state: string;
      distance: {
        unitCode: string;
        value: number;
      };
      bearing: {
        unitCode: string;
        value: number;
      };
    };
  };
  forecastZone: string;
  county: string;
  fireWeatherZone: string;
  timeZone: string;
  radarStation: string;
}

export type PointsResponse = NOAAResponse<PointsProperties>;

/**
 * Forecast period from /gridpoints/{office}/{x},{y}/forecast
 */
export interface ForecastPeriod {
  number: number;
  name: string; // "Tonight", "Thursday", etc.
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  temperatureTrend?: string | null;
  probabilityOfPrecipitation: {
    unitCode: string;
    value: number | null;
  };
  dewpoint: {
    unitCode: string;
    value: number;
  };
  relativeHumidity: {
    unitCode: string;
    value: number;
  };
  windSpeed: string; // "10 to 15 mph"
  windDirection: string; // "N", "SW", etc.
  icon: string; // URL to icon
  shortForecast: string;
  detailedForecast: string;
}

/**
 * Response from forecast endpoints
 */
export interface ForecastProperties {
  updated: string;
  units: string;
  forecastGenerator: string;
  generatedAt: string;
  updateTime: string;
  validTimes: string;
  elevation: {
    unitCode: string;
    value: number;
  };
  periods: ForecastPeriod[];
}

export type ForecastResponse = NOAAResponse<ForecastProperties>;

/**
 * Quantitative value with unit
 */
export interface QuantitativeValue {
  unitCode: string;
  value: number | null;
  qualityControl?: string;
}

/**
 * Observation data from /stations/{id}/observations
 */
export interface ObservationProperties {
  '@id': string;
  '@type': string;
  elevation: QuantitativeValue;
  station: string;
  timestamp: string; // ISO 8601 datetime
  rawMessage?: string;
  textDescription?: string;
  icon?: string;
  presentWeather?: Array<{
    intensity?: string;
    modifier?: string;
    weather: string;
    rawString: string;
  }>;
  temperature: QuantitativeValue;
  dewpoint: QuantitativeValue;
  windDirection: QuantitativeValue;
  windSpeed: QuantitativeValue;
  windGust: QuantitativeValue;
  barometricPressure: QuantitativeValue;
  seaLevelPressure: QuantitativeValue;
  visibility: QuantitativeValue;
  maxTemperatureLast24Hours: QuantitativeValue;
  minTemperatureLast24Hours: QuantitativeValue;
  precipitationLastHour: QuantitativeValue;
  precipitationLast3Hours: QuantitativeValue;
  precipitationLast6Hours: QuantitativeValue;
  relativeHumidity: QuantitativeValue;
  windChill: QuantitativeValue;
  heatIndex: QuantitativeValue;
  cloudLayers?: Array<{
    base: QuantitativeValue;
    amount: string; // "FEW", "SCT", "BKN", "OVC"
  }>;
}

export type ObservationResponse = NOAAResponse<ObservationProperties>;

/**
 * Collection of observations
 */
export interface ObservationCollectionResponse {
  '@context'?: unknown;
  type: string;
  features: ObservationResponse[];
}

/**
 * Weather station information
 */
export interface StationProperties {
  '@id': string;
  '@type': string;
  elevation: QuantitativeValue;
  stationIdentifier: string;
  name: string;
  timeZone: string;
  forecast?: string;
  county?: string;
  fireWeatherZone?: string;
}

export type StationResponse = NOAAResponse<StationProperties>;

/**
 * Collection of stations
 */
export interface StationCollectionResponse {
  '@context'?: unknown;
  type: string;
  features: StationResponse[];
  observationStations?: string[];
}

/**
 * Error response from NOAA API
 */
export interface NOAAErrorResponse {
  correlationId: string;
  title: string;
  type: string;
  status: number;
  detail: string;
  instance?: string;
}

/**
 * Helper type for converting units
 */
export type TemperatureUnit = 'F' | 'C' | 'K';
export type SpeedUnit = 'mph' | 'kph' | 'mps' | 'knots';
export type DistanceUnit = 'miles' | 'km' | 'meters' | 'feet';
export type PressureUnit = 'mb' | 'hPa' | 'inHg' | 'Pa';
