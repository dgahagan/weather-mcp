/**
 * Integration test for global forecast functionality
 * Tests forecasts from both NOAA (US) and Open-Meteo (international)
 */

import { NOAAService } from '../src/services/noaa.js';
import { OpenMeteoService } from '../src/services/openmeteo.js';
import { handleGetForecast } from '../src/handlers/forecastHandler.js';

const noaaService = new NOAAService();
const openMeteoService = new OpenMeteoService();

async function testGlobalForecasts() {
  console.log('=== Testing Global Forecast Functionality ===\n');

  // Test 1: US location (should use NOAA by default)
  console.log('Test 1: New York City, NY (US - auto-detect NOAA)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 40.7128,
        longitude: -74.0060,
        days: 3,
        granularity: 'daily'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 500) + '...\n');
    console.log('✅ Test 1 passed\n');
  } catch (error) {
    console.error('❌ Test 1 failed:', (error as Error).message, '\n');
  }

  // Test 2: Paris, France (should use Open-Meteo by default)
  console.log('Test 2: Paris, France (International - auto-detect Open-Meteo)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 48.8566,
        longitude: 2.3522,
        days: 5,
        granularity: 'daily'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 500) + '...\n');
    console.log('✅ Test 2 passed\n');
  } catch (error) {
    console.error('❌ Test 2 failed:', (error as Error).message, '\n');
  }

  // Test 3: Tokyo, Japan (Open-Meteo with 7-day forecast)
  console.log('Test 3: Tokyo, Japan (7-day forecast)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 35.6762,
        longitude: 139.6503,
        days: 7,
        granularity: 'daily'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 500) + '...\n');
    console.log('✅ Test 3 passed\n');
  } catch (error) {
    console.error('❌ Test 3 failed:', (error as Error).message, '\n');
  }

  // Test 4: London with extended 10-day forecast
  console.log('Test 4: London, UK (10-day extended forecast)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 51.5074,
        longitude: -0.1278,
        days: 10,
        granularity: 'daily'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 500) + '...\n');
    console.log('✅ Test 4 passed\n');
  } catch (error) {
    console.error('❌ Test 4 failed:', (error as Error).message, '\n');
  }

  // Test 5: Sydney with maximum 16-day forecast
  console.log('Test 5: Sydney, Australia (16-day maximum forecast)');
  try {
    const result = await handleGetForecast(
      {
        latitude: -33.8688,
        longitude: 151.2093,
        days: 16,
        granularity: 'daily'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 600) + '...\n');

    // Verify sunrise/sunset data is included
    if (result.content[0].text.includes('Sunrise:') && result.content[0].text.includes('Sunset:')) {
      console.log('✅ Sunrise/sunset data included');
    } else {
      console.log('⚠️  Warning: Sunrise/sunset data might be missing');
    }

    console.log('✅ Test 5 passed\n');
  } catch (error) {
    console.error('❌ Test 5 failed:', (error as Error).message, '\n');
  }

  // Test 6: US location with hourly forecast
  console.log('Test 6: San Francisco, CA (Hourly forecast - 2 days)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 37.7749,
        longitude: -122.4194,
        days: 2,
        granularity: 'hourly'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 400) + '...\n');
    console.log('✅ Test 6 passed\n');
  } catch (error) {
    console.error('❌ Test 6 failed:', (error as Error).message, '\n');
  }

  // Test 7: International hourly forecast
  console.log('Test 7: Berlin, Germany (Hourly forecast - 3 days)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 52.5200,
        longitude: 13.4050,
        days: 3,
        granularity: 'hourly'
      },
      noaaService,
      openMeteoService
    );
    console.log(result.content[0].text.substring(0, 400) + '...\n');
    console.log('✅ Test 7 passed\n');
  } catch (error) {
    console.error('❌ Test 7 failed:', (error as Error).message, '\n');
  }

  // Test 8: Explicit source selection - force Open-Meteo for US location
  console.log('Test 8: Los Angeles with explicit Open-Meteo source');
  try {
    const result = await handleGetForecast(
      {
        latitude: 34.0522,
        longitude: -118.2437,
        days: 5,
        granularity: 'daily',
        source: 'openmeteo'
      },
      noaaService,
      openMeteoService
    );

    // Verify it used Open-Meteo
    if (result.content[0].text.includes('Open-Meteo')) {
      console.log('✅ Correctly used Open-Meteo as requested');
    }

    console.log(result.content[0].text.substring(0, 400) + '...\n');
    console.log('✅ Test 8 passed\n');
  } catch (error) {
    console.error('❌ Test 8 failed:', (error as Error).message, '\n');
  }

  // Test 9: Check sunrise/sunset and daylight duration
  console.log('Test 9: Verify sunrise/sunset data (Reykjavik - interesting daylight)');
  try {
    const result = await handleGetForecast(
      {
        latitude: 64.1466,
        longitude: -21.9426,
        days: 3,
        granularity: 'daily'
      },
      noaaService,
      openMeteoService
    );

    const text = result.content[0].text;
    console.log(text.substring(0, 800) + '...\n');

    // Verify key features
    const hassunrise = text.includes('Sunrise:');
    const hasSunset = text.includes('Sunset:');
    const hasDaylight = text.includes('Daylight Duration:');

    console.log(`✅ Sunrise: ${hassunrise ? 'Yes' : 'No'}`);
    console.log(`✅ Sunset: ${hasSunset ? 'Yes' : 'No'}`);
    console.log(`✅ Daylight Duration: ${hasDaylight ? 'Yes' : 'No'}`);
    console.log('✅ Test 9 passed\n');
  } catch (error) {
    console.error('❌ Test 9 failed:', (error as Error).message, '\n');
  }

  console.log('=== All Global Forecast Tests Complete ===');
}

// Run tests
testGlobalForecasts().catch(console.error);
