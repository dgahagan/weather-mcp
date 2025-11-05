/**
 * Test script for service status checking functionality
 */

import { NOAAService } from '../src/services/noaa.js';
import { OpenMeteoService } from '../src/services/openmeteo.js';

async function testServiceStatus() {
  console.log('='.repeat(80));
  console.log('Testing Weather MCP Service Status Checking');
  console.log('='.repeat(80));
  console.log();

  // Initialize services
  const noaaService = new NOAAService({
    userAgent: '(weather-mcp-test, github.com/weather-mcp)'
  });
  const openMeteoService = new OpenMeteoService();

  // Test 1: Check NOAA API Status
  console.log('Test 1: Checking NOAA API Status');
  console.log('-'.repeat(80));
  try {
    const noaaStatus = await noaaService.checkServiceStatus();
    console.log('✅ NOAA Status Check Complete:');
    console.log(`   Operational: ${noaaStatus.operational}`);
    console.log(`   Message: ${noaaStatus.message}`);
    console.log(`   Status Page: ${noaaStatus.statusPage}`);
    console.log(`   Timestamp: ${noaaStatus.timestamp}`);
  } catch (error) {
    console.error('❌ NOAA Status Check Failed:', error);
  }
  console.log();

  // Test 2: Check Open-Meteo API Status
  console.log('Test 2: Checking Open-Meteo API Status');
  console.log('-'.repeat(80));
  try {
    const openMeteoStatus = await openMeteoService.checkServiceStatus();
    console.log('✅ Open-Meteo Status Check Complete:');
    console.log(`   Operational: ${openMeteoStatus.operational}`);
    console.log(`   Message: ${openMeteoStatus.message}`);
    console.log(`   Status Page: ${openMeteoStatus.statusPage}`);
    console.log(`   Timestamp: ${openMeteoStatus.timestamp}`);
  } catch (error) {
    console.error('❌ Open-Meteo Status Check Failed:', error);
  }
  console.log();

  // Test 3: Test enhanced error handling with invalid coordinates
  console.log('Test 3: Testing Enhanced Error Handling (Invalid Coordinates)');
  console.log('-'.repeat(80));
  try {
    // This should fail with a helpful error message
    await noaaService.getPointData(999, 999);
    console.log('❌ Expected error but request succeeded');
  } catch (error) {
    if (error instanceof Error) {
      console.log('✅ Received enhanced error message:');
      console.log('---');
      console.log(error.message);
      console.log('---');

      // Check if error message contains helpful links
      const hasStatusLinks = error.message.includes('weather-gov.github.io') ||
                            error.message.includes('weather.gov');
      console.log(`\n   Contains status page links: ${hasStatusLinks ? '✅' : '❌'}`);
    }
  }
  console.log();

  // Test 4: Test NOAA API with valid US coordinates
  console.log('Test 4: Testing NOAA API (Valid US Location - San Francisco)');
  console.log('-'.repeat(80));
  try {
    const pointData = await noaaService.getPointData(37.7749, -122.4194);
    console.log('✅ NOAA API is operational - Point data retrieved successfully');
    console.log(`   Grid: ${pointData.properties.gridId} (${pointData.properties.gridX}, ${pointData.properties.gridY})`);
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ NOAA API Error:');
      console.log(error.message);

      // Check if error message contains helpful information
      const isEnhanced = error.message.includes('Check service status:') ||
                        error.message.includes('Planned outages:') ||
                        error.message.includes('weather-gov.github.io');
      console.log(`\n   Has enhanced error info: ${isEnhanced ? '✅' : '❌'}`);
    }
  }
  console.log();

  // Test 5: Test Open-Meteo API with historical data
  console.log('Test 5: Testing Open-Meteo API (Historical Data - London, 30 days ago)');
  console.log('-'.repeat(80));
  try {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - 30);
    const dateStr = testDate.toISOString().split('T')[0];

    const weatherData = await openMeteoService.getHistoricalWeather(
      51.5074,
      -0.1278,
      dateStr,
      dateStr,
      false // Use daily data
    );
    console.log('✅ Open-Meteo API is operational - Historical data retrieved successfully');
    console.log(`   Location: ${weatherData.latitude}°N, ${weatherData.longitude}°E`);
    console.log(`   Elevation: ${weatherData.elevation}m`);
    if (weatherData.daily && weatherData.daily.time) {
      console.log(`   Data points: ${weatherData.daily.time.length} days`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ Open-Meteo API Error:');
      console.log(error.message);

      // Check if error message contains helpful information
      const isEnhanced = error.message.includes('Check service status:') ||
                        error.message.includes('open-meteo.com') ||
                        error.message.includes('GitHub issues');
      console.log(`\n   Has enhanced error info: ${isEnhanced ? '✅' : '❌'}`);
    }
  }
  console.log();

  // Test 6: Test with invalid date range for Open-Meteo
  console.log('Test 6: Testing Enhanced Error Handling (Invalid Date - Too Recent)');
  console.log('-'.repeat(80));
  try {
    // Try to get data from yesterday (should fail due to 5-day delay)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await openMeteoService.getHistoricalWeather(
      51.5074,
      -0.1278,
      yesterdayStr,
      yesterdayStr,
      false
    );
    console.log('❌ Expected error for too-recent date but request succeeded');
  } catch (error) {
    if (error instanceof Error) {
      console.log('✅ Received enhanced error message for invalid date:');
      console.log('---');
      console.log(error.message);
      console.log('---');

      const hasHelpfulInfo = error.message.includes('5-day delay') ||
                            error.message.includes('1940') ||
                            error.message.includes('open-meteo.com');
      console.log(`\n   Contains helpful information: ${hasHelpfulInfo ? '✅' : '❌'}`);
    }
  }
  console.log();

  console.log('='.repeat(80));
  console.log('All tests completed!');
  console.log('='.repeat(80));
}

// Run tests
testServiceStatus().catch(error => {
  console.error('Fatal error during testing:', error);
  process.exit(1);
});
