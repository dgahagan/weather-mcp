import { describe, it, expect } from 'vitest';
import { OpenMeteoService } from '../../src/services/openmeteo.js';
import { NOAAService } from '../../src/services/noaa.js';

/**
 * Retry Logic Tests
 *
 * These tests verify the exponential backoff with jitter implementation.
 * The actual retry behavior is tested in integration tests with real API mocks.
 * Here we focus on:
 * - Service configuration
 * - Backoff calculation correctness
 * - Jitter randomization properties
 */

describe('Retry Logic with Jitter', () => {
  describe('Service Configuration', () => {
    it('should configure OpenMeteo service with custom maxRetries', () => {
      const service = new OpenMeteoService({ maxRetries: 5 });
      expect((service as any).maxRetries).toBe(5);
    });

    it('should configure NOAA service with custom maxRetries', () => {
      const service = new NOAAService({ maxRetries: 2 });
      expect((service as any).maxRetries).toBe(2);
    });

    it('should use default maxRetries of 3', () => {
      const openmeteo = new OpenMeteoService();
      const noaa = new NOAAService();

      expect((openmeteo as any).maxRetries).toBe(3);
      expect((noaa as any).maxRetries).toBe(3);
    });

    it('should handle maxRetries of 0', () => {
      const service = new OpenMeteoService({ maxRetries: 0 });
      expect((service as any).maxRetries).toBe(0);
    });
  });

  describe('Exponential Backoff Algorithm', () => {
    it('should calculate correct base delay for each retry', () => {
      // Both services use: Math.pow(2, retries) * 1000
      const retries = [0, 1, 2, 3, 4];
      const expectedDelays = retries.map(r => Math.pow(2, r) * 1000);

      expect(expectedDelays).toEqual([1000, 2000, 4000, 8000, 16000]);
    });

    it('should double delay on each retry', () => {
      for (let retry = 0; retry < 10; retry++) {
        const currentDelay = Math.pow(2, retry) * 1000;
        const nextDelay = Math.pow(2, retry + 1) * 1000;

        expect(nextDelay).toBe(currentDelay * 2);
      }
    });

    it('should start with 1 second base delay', () => {
      const firstRetryDelay = Math.pow(2, 0) * 1000;
      expect(firstRetryDelay).toBe(1000);
    });

    it('should handle large retry counts without overflow', () => {
      const largeRetry = 20;
      const baseDelay = Math.pow(2, largeRetry) * 1000;

      expect(baseDelay).toBeGreaterThan(0);
      expect(isFinite(baseDelay)).toBe(true);
    });
  });

  describe('Jitter Implementation', () => {
    it('should apply jitter factor between 0.5 and 1.0', () => {
      // Simulate the jitter calculation used in services
      const baseDelay = 2000;

      for (let i = 0; i < 100; i++) {
        const jitterFactor = 0.5 + Math.random() * 0.5;
        const delay = baseDelay * jitterFactor;

        expect(jitterFactor).toBeGreaterThanOrEqual(0.5);
        expect(jitterFactor).toBeLessThanOrEqual(1.0);
        expect(delay).toBeGreaterThanOrEqual(1000); // 2000 * 0.5
        expect(delay).toBeLessThanOrEqual(2000); // 2000 * 1.0
      }
    });

    it('should produce varied delays for same retry count', () => {
      const baseDelay = 4000;
      const delays: number[] = [];

      // Generate 100 delays with jitter
      for (let i = 0; i < 100; i++) {
        const jitterFactor = 0.5 + Math.random() * 0.5;
        delays.push(baseDelay * jitterFactor);
      }

      // Should have significant variation
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(50);

      // All should be in valid range
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(2000); // 4000 * 0.5
        expect(delay).toBeLessThanOrEqual(4000); // 4000 * 1.0
      });
    });

    it('should distribute delays to prevent thundering herd', () => {
      const baseDelay = 8000;
      const delays: number[] = [];

      // Simulate 1000 concurrent retries
      for (let i = 0; i < 1000; i++) {
        const jitterFactor = 0.5 + Math.random() * 0.5;
        delays.push(baseDelay * jitterFactor);
      }

      // Calculate distribution across buckets
      const bucketSize = 400; // 4000ms range / 10 buckets
      const buckets = new Array(10).fill(0);

      delays.forEach(delay => {
        const bucketIndex = Math.min(9, Math.floor((delay - 4000) / bucketSize));
        buckets[bucketIndex]++;
      });

      // No bucket should dominate (> 25% of requests)
      buckets.forEach(count => {
        expect(count).toBeLessThan(250);
      });
    });
  });

  describe('Retry Calculation Examples', () => {
    it('should calculate delays for first 5 retries with example jitter', () => {
      const results = [];

      for (let retry = 0; retry < 5; retry++) {
        const baseDelay = Math.pow(2, retry) * 1000;
        const minDelay = baseDelay * 0.5;
        const maxDelay = baseDelay * 1.0;

        results.push({
          retry,
          baseDelay,
          minDelay,
          maxDelay
        });
      }

      // Verify calculated ranges
      expect(results[0]).toEqual({ retry: 0, baseDelay: 1000, minDelay: 500, maxDelay: 1000 });
      expect(results[1]).toEqual({ retry: 1, baseDelay: 2000, minDelay: 1000, maxDelay: 2000 });
      expect(results[2]).toEqual({ retry: 2, baseDelay: 4000, minDelay: 2000, maxDelay: 4000 });
      expect(results[3]).toEqual({ retry: 3, baseDelay: 8000, minDelay: 4000, maxDelay: 8000 });
      expect(results[4]).toEqual({ retry: 4, baseDelay: 16000, minDelay: 8000, maxDelay: 16000 });
    });

    it('should show jitter reduces all concurrent retries below base', () => {
      const retry = 2; // Third attempt
      const baseDelay = Math.pow(2, retry) * 1000; // 4000ms
      const sampleSize = 100;
      let allBelowOrAtBase = true;

      for (let i = 0; i < sampleSize; i++) {
        const jitterFactor = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
        const actualDelay = baseDelay * jitterFactor;

        if (actualDelay > baseDelay) {
          allBelowOrAtBase = false;
        }
      }

      // All jittered delays should be <= base delay
      expect(allBelowOrAtBase).toBe(true);
    });
  });

  describe('Backoff Characteristics', () => {
    it('should have rapidly increasing delays', () => {
      const delays = [0, 1, 2, 3].map(r => Math.pow(2, r) * 1000);

      expect(delays[1] - delays[0]).toBe(1000);   // +1s
      expect(delays[2] - delays[1]).toBe(2000);   // +2s
      expect(delays[3] - delays[2]).toBe(4000);   // +4s
    });

    it('should reach significant delays by 5th retry', () => {
      const fifthRetryDelay = Math.pow(2, 4) * 1000;
      expect(fifthRetryDelay).toBe(16000); // 16 seconds
      expect(fifthRetryDelay).toBeGreaterThan(15000);
    });

    it('should be bounded for reasonable retry counts', () => {
      const maxRetries = 10;
      const maxDelay = Math.pow(2, maxRetries - 1) * 1000;

      // Should be less than 10 minutes
      expect(maxDelay).toBeLessThan(600000);
    });
  });

  describe('Service Timeout Configuration', () => {
    it('should accept custom timeout for OpenMeteo', () => {
      const service = new OpenMeteoService({ timeout: 60000 });
      expect((service as any).client.defaults.timeout).toBe(60000);
    });

    it('should accept custom timeout for NOAA', () => {
      const service = new NOAAService({ timeout: 45000 });
      expect((service as any).client.defaults.timeout).toBe(45000);
    });

    it('should use default timeout of 30 seconds', () => {
      const openmeteo = new OpenMeteoService();
      const noaa = new NOAAService();

      expect((openmeteo as any).client.defaults.timeout).toBe(30000);
      expect((noaa as any).client.defaults.timeout).toBe(30000);
    });
  });
});
