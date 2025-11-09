/**
 * Integration tests for v1.6.0 Safety & Hazards features
 * Tests get_river_conditions and get_wildfire_info tools
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { handleGetRiverConditions } from '../../src/handlers/riverConditionsHandler.js';
import { handleGetWildfireInfo } from '../../src/handlers/wildfireHandler.js';
import { NOAAService } from '../../src/services/noaa.js';
import { NIFCService } from '../../src/services/nifc.js';

describe('River Conditions (v1.6.0)', () => {
  let noaaService: NOAAService;

  beforeAll(() => {
    noaaService = new NOAAService({
      userAgent: 'weather-mcp-test/1.6.0'
    });
  });

  describe('River Gauge Queries', () => {
    it('should find river gauges near St. Louis, MO (Mississippi River)', async () => {
      // St. Louis is on the Mississippi River - should have multiple gauges
      const result = await handleGetRiverConditions(
        {
          latitude: 38.6270,
          longitude: -90.1994,
          radius: 50
        },
        noaaService
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBe(1);
      expect(result.content[0].type).toBe('text');

      const text = result.content[0].text;
      expect(text).toContain('River Conditions Report');
      expect(text).toContain('38.6270, -90.1994');

      console.log('\n=== St. Louis River Conditions ===');
      console.log(text.substring(0, 500)); // Log first 500 chars
    }, 30000);

    it('should find river gauges near Houston, TX (near several rivers)', async () => {
      const result = await handleGetRiverConditions(
        {
          latitude: 29.7604,
          longitude: -95.3698,
          radius: 75
        },
        noaaService
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const text = result.content[0].text;
      expect(text).toContain('River Conditions Report');

      console.log('\n=== Houston River Conditions ===');
      console.log(text.substring(0, 500));
    }, 30000);

    it('should handle location with no nearby river gauges', async () => {
      // Remote desert location with no rivers
      const result = await handleGetRiverConditions(
        {
          latitude: 36.0,
          longitude: -114.0, // Nevada desert
          radius: 25
        },
        noaaService
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const text = result.content[0].text;
      expect(text).toContain('No river gauges found');

      console.log('\n=== Nevada Desert (No Gauges) ===');
      console.log(text.substring(0, 300));
    }, 30000);

    it('should respect custom radius parameter', async () => {
      const result = await handleGetRiverConditions(
        {
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 100 // Larger radius
        },
        noaaService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;
      expect(text).toContain('100 km');
      expect(text).toContain('62.1 miles');
    }, 30000);
  });

  describe('Validation', () => {
    it('should reject invalid coordinates', async () => {
      await expect(
        handleGetRiverConditions(
          {
            latitude: 100, // Invalid
            longitude: -90
          },
          noaaService
        )
      ).rejects.toThrow();
    });

    it('should handle missing coordinates', async () => {
      await expect(
        handleGetRiverConditions({}, noaaService)
      ).rejects.toThrow();
    });

    it('should clamp radius to valid range', async () => {
      // Radius > 500 should be clamped to 500
      const result = await handleGetRiverConditions(
        {
          latitude: 38.6270,
          longitude: -90.1994,
          radius: 1000 // Should be clamped to 500
        },
        noaaService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;
      expect(text).toContain('500 km');
    }, 30000);
  });
});

describe('Wildfire Information (v1.6.0)', () => {
  let nifcService: NIFCService;

  beforeAll(() => {
    nifcService = new NIFCService();
  });

  describe('Wildfire Queries', () => {
    it('should query wildfires near Los Angeles (high fire risk area)', async () => {
      const result = await handleGetWildfireInfo(
        {
          latitude: 34.0522,
          longitude: -118.2437,
          radius: 100
        },
        nifcService
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBe(1);
      expect(result.content[0].type).toBe('text');

      const text = result.content[0].text;
      expect(text).toContain('Wildfire Information Report');
      expect(text).toContain('34.0522, -118.2437');
      expect(text).toContain('Data source: NIFC');

      console.log('\n=== Los Angeles Wildfire Info ===');
      console.log(text.substring(0, 600));
    }, 30000);

    it('should query wildfires near Denver, CO', async () => {
      const result = await handleGetWildfireInfo(
        {
          latitude: 39.7392,
          longitude: -104.9903,
          radius: 150
        },
        nifcService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;
      expect(text).toContain('Wildfire Information Report');

      console.log('\n=== Denver Wildfire Info ===');
      console.log(text.substring(0, 600));
    }, 30000);

    it('should handle area with no active wildfires', async () => {
      // Query an area less likely to have fires (adjust seasonally if needed)
      const result = await handleGetWildfireInfo(
        {
          latitude: 42.3601,
          longitude: -71.0589, // Boston
          radius: 100
        },
        nifcService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;
      expect(text).toContain('Wildfire Information Report');
      // May or may not have fires - just verify it doesn't crash

      console.log('\n=== Boston Wildfire Info ===');
      console.log(text.substring(0, 400));
    }, 30000);

    it('should respect custom radius parameter', async () => {
      const result = await handleGetWildfireInfo(
        {
          latitude: 34.0522,
          longitude: -118.2437,
          radius: 200 // Larger radius
        },
        nifcService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;
      expect(text).toContain('200 km');
      expect(text).toContain('124.3 miles');
    }, 30000);

    it('should provide safety assessment when wildfires are found', async () => {
      // This test may vary based on current fire activity
      const result = await handleGetWildfireInfo(
        {
          latitude: 34.0522,
          longitude: -118.2437,
          radius: 200
        },
        nifcService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;

      // Should either show safety assessment or "no fires" message
      const hasFires = !text.includes('No active wildfires found');

      if (hasFires) {
        // Check for safety assessment keywords
        const hasSafetyInfo =
          text.includes('Safety Assessment') ||
          text.includes('EXTREME DANGER') ||
          text.includes('HIGH ALERT') ||
          text.includes('CAUTION') ||
          text.includes('AWARENESS');

        expect(hasSafetyInfo).toBe(true);
      }

      console.log('\n=== Safety Assessment Test ===');
      console.log(text.substring(0, 800));
    }, 30000);
  });

  describe('Validation', () => {
    it('should reject invalid coordinates', async () => {
      await expect(
        handleGetWildfireInfo(
          {
            latitude: -100, // Invalid
            longitude: -118
          },
          nifcService
        )
      ).rejects.toThrow();
    });

    it('should handle missing coordinates', async () => {
      await expect(
        handleGetWildfireInfo({}, nifcService)
      ).rejects.toThrow();
    });

    it('should clamp radius to valid range', async () => {
      // Radius < 1 should be clamped to 1
      const result = await handleGetWildfireInfo(
        {
          latitude: 34.0522,
          longitude: -118.2437,
          radius: 0.5 // Should be clamped to 1
        },
        nifcService
      );

      expect(result).toBeDefined();
      const text = result.content[0].text;
      expect(text).toContain('1 km');
    }, 30000);
  });

  describe('NIFC Service Health', () => {
    it('should verify NIFC service is operational', async () => {
      const status = await nifcService.checkServiceStatus();

      expect(status).toBeDefined();
      expect(status.operational).toBeDefined();
      expect(status.message).toBeDefined();
      expect(status.timestamp).toBeDefined();

      console.log('\n=== NIFC Service Status ===');
      console.log(`Operational: ${status.operational}`);
      console.log(`Message: ${status.message}`);
      console.log(`Timestamp: ${status.timestamp}`);
    }, 15000);
  });
});
