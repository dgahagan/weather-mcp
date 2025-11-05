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
   * Handle API errors with retry logic and helpful status information
   */
  private async handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as NOAAErrorResponse;

      // Rate limit error - suggest retry
      if (status === 429) {
        throw new Error(
          `NOAA API rate limit exceeded. Please retry in a few seconds.\n\n` +
          `Details: ${data.detail || 'Too many requests'}\n\n` +
          `For more information about rate limits, visit:\n` +
          `https://weather-gov.github.io/api/`
        );
      }

      // Other client errors
      if (status >= 400 && status < 500) {
        let errorMsg = `NOAA API error: ${data.detail || data.title || 'Invalid request'}\n\n`;

        // Add contextual help based on error type
        if (status === 404) {
          errorMsg += `This location may be outside NOAA's coverage area (US only).\n\n`;
        }

        errorMsg += `If this persists, check:\n` +
          `- Planned outages: https://weather-gov.github.io/api/planned-outages\n` +
          `- Service notices: https://www.weather.gov/notification\n` +
          `- Report issues: https://weather-gov.github.io/api/reporting-issues`;

        throw new Error(errorMsg);
      }

      // Server errors
      if (status >= 500) {
        throw new Error(
          `NOAA API server error: ${data.detail || 'Service temporarily unavailable'}\n\n` +
          `The NOAA Weather API may be experiencing an outage.\n\n` +
          `Check service status:\n` +
          `- Planned outages: https://weather-gov.github.io/api/planned-outages\n` +
          `- Service notices: https://www.weather.gov/notification\n` +
          `- Report issues: nco.ops@noaa.gov or (301) 683-1518`
        );
      }
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      throw new Error(
        `Request to NOAA API timed out. Please try again.\n\n` +
        `If timeouts persist, the service may be experiencing issues:\n` +
        `https://weather-gov.github.io/api/planned-outages`
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(
        `Unable to connect to NOAA API.\n\n` +
        `Possible causes:\n` +
        `- Internet connection issues\n` +
        `- NOAA API service outage\n` +
        `- DNS resolution problems\n\n` +
        `Check:\n` +
        `- Your internet connection\n` +
        `- Service status: https://weather-gov.github.io/api/planned-outages`
      );
    }

    // Generic error
    throw new Error(
      `NOAA API request failed: ${error.message}\n\n` +
      `For assistance, visit:\n` +
      `https://weather-gov.github.io/api/reporting-issues`
    );
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
   * Check if the NOAA API is operational
   * Performs a lightweight health check by requesting a well-known endpoint
   * @returns Object with status information
   */
  async checkServiceStatus(): Promise<{
    operational: boolean;
    message: string;
    statusPage: string;
    timestamp: string;
  }> {
    try {
      // Use a simple, well-known location (US mainland center) for health check
      const response = await this.client.get('/points/39.8283,-98.5795', {
        timeout: 10000 // Shorter timeout for health check
      });

      if (response.status === 200) {
        return {
          operational: true,
          message: 'NOAA Weather API is operational',
          statusPage: 'https://weather-gov.github.io/api/planned-outages',
          timestamp: new Date().toISOString()
        };
      }

      return {
        operational: false,
        message: `NOAA API returned unexpected status: ${response.status}`,
        statusPage: 'https://weather-gov.github.io/api/planned-outages',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      let message = 'NOAA Weather API may be experiencing issues';
      let operational = false;

      if (axiosError.response) {
        const status = axiosError.response.status;
        if (status === 429) {
          operational = true; // API is up, just rate limited
          message = 'NOAA API is operational but rate limited';
        } else if (status >= 500) {
          message = 'NOAA API is experiencing server errors (possible outage)';
        } else if (status === 404) {
          operational = true; // 404 on this endpoint might just mean API change
          message = 'NOAA API is responding (health check endpoint may have changed)';
        }
      } else if (axiosError.code === 'ECONNABORTED') {
        message = 'NOAA API is not responding (timeout)';
      } else if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
        message = 'Cannot connect to NOAA API (DNS or connection failure)';
      }

      return {
        operational,
        message,
        statusPage: 'https://weather-gov.github.io/api/planned-outages',
        timestamp: new Date().toISOString()
      };
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
    // Validate date range if both dates are provided
    if (startTime && endTime) {
      if (startTime > endTime) {
        throw new Error(`Invalid date range: start date (${startTime.toISOString()}) must be before end date (${endTime.toISOString()})`);
      }
    }

    // Validate dates are not in the future
    const now = new Date();
    if (startTime && startTime > now) {
      throw new Error(`Start date (${startTime.toISOString()}) cannot be in the future`);
    }
    if (endTime && endTime > now) {
      throw new Error(`End date (${endTime.toISOString()}) cannot be in the future`);
    }

    let url = `/stations/${stationId}/observations`;

    const params = new URLSearchParams();
    if (startTime) {
      params.append('start', startTime.toISOString());
    }
    if (endTime) {
      params.append('end', endTime.toISOString());
    }
    if (limit) {
      // Ensure limit is between 1 and 500
      const validLimit = Math.max(1, Math.min(limit, 500));
      params.append('limit', validLimit.toString());
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
    // Validate date range
    if (startTime > endTime) {
      throw new Error(`Invalid date range: start date (${startTime.toISOString()}) must be before end date (${endTime.toISOString()})`);
    }

    // Validate dates are not in the future
    const now = new Date();
    if (startTime > now) {
      throw new Error(`Start date (${startTime.toISOString()}) cannot be in the future`);
    }
    if (endTime > now) {
      throw new Error(`End date (${endTime.toISOString()}) cannot be in the future`);
    }

    const stations = await this.getStations(latitude, longitude);

    if (!stations.features || stations.features.length === 0) {
      throw new Error('No weather stations found near the specified location.');
    }

    // Get observations from the nearest station
    const stationId = stations.features[0].properties.stationIdentifier;
    return this.getObservations(stationId, startTime, endTime, limit);
  }
}
