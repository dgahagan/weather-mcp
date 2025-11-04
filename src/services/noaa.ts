/**
 * Service for interacting with the NOAA Weather API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  PointsResponse,
  ForecastResponse,
  ObservationResponse,
  ObservationCollectionResponse,
  StationCollectionResponse,
  NOAAErrorResponse
} from '../types/noaa.js';

export interface NOAAServiceConfig {
  userAgent?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export class NOAAService {
  private client: AxiosInstance;
  private maxRetries: number;

  constructor(config: NOAAServiceConfig = {}) {
    const {
      userAgent = '(weather-mcp, contact@example.com)',
      baseURL = 'https://api.weather.gov',
      timeout = 30000,
      maxRetries = 3
    } = config;

    this.maxRetries = maxRetries;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/geo+json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as NOAAErrorResponse;

      // Rate limit error - suggest retry
      if (status === 429) {
        throw new Error(`NOAA API rate limit exceeded. Please retry in a few seconds. (${data.detail || 'Too many requests'})`);
      }

      // Other client errors
      if (status >= 400 && status < 500) {
        throw new Error(`NOAA API error: ${data.detail || data.title || 'Invalid request'}`);
      }

      // Server errors
      if (status >= 500) {
        throw new Error(`NOAA API server error: ${data.detail || 'Service temporarily unavailable'}`);
      }
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request to NOAA API timed out. Please try again.');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to NOAA API. Please check your internet connection.');
    }

    // Generic error
    throw new Error(`NOAA API request failed: ${error.message}`);
  }

  /**
   * Make request with retry logic
   */
  private async makeRequest<T>(
    url: string,
    retries = 0
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(url);
      return response.data;
    } catch (error) {
      // Retry on rate limit or server errors
      if (retries < this.maxRetries) {
        const shouldRetry =
          (error as Error).message.includes('rate limit') ||
          (error as Error).message.includes('server error') ||
          (error as Error).message.includes('timed out');

        if (shouldRetry) {
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest<T>(url, retries + 1);
        }
      }
      throw error;
    }
  }

  /**
   * Convert lat/lon coordinates to NWS grid information
   * This is the first step for getting forecast or observation data
   */
  async getPointData(latitude: number, longitude: number): Promise<PointsResponse> {
    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
    }

    const url = `/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    return this.makeRequest<PointsResponse>(url);
  }

  /**
   * Get forecast for a location using grid coordinates
   */
  async getForecast(office: string, gridX: number, gridY: number): Promise<ForecastResponse> {
    const url = `/gridpoints/${office}/${gridX},${gridY}/forecast`;
    return this.makeRequest<ForecastResponse>(url);
  }

  /**
   * Get hourly forecast for a location using grid coordinates
   */
  async getHourlyForecast(office: string, gridX: number, gridY: number): Promise<ForecastResponse> {
    const url = `/gridpoints/${office}/${gridX},${gridY}/forecast/hourly`;
    return this.makeRequest<ForecastResponse>(url);
  }

  /**
   * Get forecast for a location using lat/lon (convenience method)
   * This combines getPointData and getForecast
   */
  async getForecastByCoordinates(latitude: number, longitude: number): Promise<ForecastResponse> {
    const pointData = await this.getPointData(latitude, longitude);
    const { gridId, gridX, gridY } = pointData.properties;
    return this.getForecast(gridId, gridX, gridY);
  }

  /**
   * Get nearest observation stations for a location
   */
  async getStations(latitude: number, longitude: number): Promise<StationCollectionResponse> {
    const url = `/points/${latitude.toFixed(4)},${longitude.toFixed(4)}/stations`;
    return this.makeRequest<StationCollectionResponse>(url);
  }

  /**
   * Get the latest observation from a station
   */
  async getLatestObservation(stationId: string): Promise<ObservationResponse> {
    const url = `/stations/${stationId}/observations/latest`;
    return this.makeRequest<ObservationResponse>(url);
  }

  /**
   * Get observations from a station within a time range
   */
  async getObservations(
    stationId: string,
    startTime?: Date,
    endTime?: Date,
    limit?: number
  ): Promise<ObservationCollectionResponse> {
    let url = `/stations/${stationId}/observations`;

    const params = new URLSearchParams();
    if (startTime) {
      params.append('start', startTime.toISOString());
    }
    if (endTime) {
      params.append('end', endTime.toISOString());
    }
    if (limit) {
      params.append('limit', Math.min(limit, 500).toString()); // Max 500
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.makeRequest<ObservationCollectionResponse>(url);
  }

  /**
   * Get current conditions for a location (convenience method)
   * This combines getStations and getLatestObservation
   */
  async getCurrentConditions(latitude: number, longitude: number): Promise<ObservationResponse> {
    const stations = await this.getStations(latitude, longitude);

    if (!stations.features || stations.features.length === 0) {
      throw new Error('No weather stations found near the specified location.');
    }

    // Try the first station, fallback to others if it fails
    for (const station of stations.features) {
      try {
        const stationId = station.properties.stationIdentifier;
        return await this.getLatestObservation(stationId);
      } catch (error) {
        // Try next station
        continue;
      }
    }

    throw new Error('Unable to retrieve current conditions from nearby stations.');
  }

  /**
   * Get historical observations for a location (convenience method)
   */
  async getHistoricalObservations(
    latitude: number,
    longitude: number,
    startTime: Date,
    endTime: Date,
    limit?: number
  ): Promise<ObservationCollectionResponse> {
    const stations = await this.getStations(latitude, longitude);

    if (!stations.features || stations.features.length === 0) {
      throw new Error('No weather stations found near the specified location.');
    }

    // Get observations from the nearest station
    const stationId = stations.features[0].properties.stationIdentifier;
    return this.getObservations(stationId, startTime, endTime, limit);
  }
}
