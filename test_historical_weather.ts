#!/usr/bin/env -S npx tsx

/**
 * Test script for historical weather data retrieval
 * Tests both recent data (real-time API) and archival data (CDO API)
 */

import 'dotenv/config';
import { NOAAService } from './src/services/noaa.js';
import { CDOService } from './src/services/cdo.js';

// Test locations
const locations = {
  sanFrancisco: { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
  newYork: { name: 'New York, NY', lat: 40.7128, lon: -74.0060 },
  chicago: { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 }
};

async function testRecentHistoricalData() {
  console.log('\n=== Testing Recent Historical Data (Last 7 Days) ===');
  console.log('This uses the NOAA real-time API and should work without a CDO token\n');

  const noaaService = new NOAAService({
    userAgent: '(weather-mcp-test, github.com/weather-mcp)'
  });

  // Get date 3 days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const startDate = threeDaysAgo.toISOString();
  const endDate = twoDaysAgo.toISOString();

  console.log(`📅 Date range: ${startDate.split('T')[0]} to ${endDate.split('T')[0]}`);
  console.log(`📍 Location: ${locations.chicago.name} (${locations.chicago.lat}, ${locations.chicago.lon})\n`);

  try {
    const observations = await noaaService.getHistoricalObservations(
      locations.chicago.lat,
      locations.chicago.lon,
      threeDaysAgo,
      twoDaysAgo,
      50
    );

    if (!observations.features || observations.features.length === 0) {
      console.log('❌ No observations found');
      return false;
    }

    console.log(`✅ Found ${observations.features.length} observations`);
    console.log('\nSample observations:');

    // Show first 3 observations
    for (let i = 0; i < Math.min(3, observations.features.length); i++) {
      const obs = observations.features[i];
      const props = obs.properties;
      const timestamp = new Date(props.timestamp).toLocaleString();

      let tempF = 'N/A';
      if (props.temperature.value !== null) {
        const temp = props.temperature.unitCode.includes('degC')
          ? (props.temperature.value * 9/5) + 32
          : props.temperature.value;
        tempF = `${Math.round(temp)}°F`;
      }

      console.log(`  ${i + 1}. ${timestamp} - Temp: ${tempF}, Conditions: ${props.textDescription || 'N/A'}`);
    }

    return true;
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function testArchivalDataWithToken() {
  console.log('\n=== Testing Archival Historical Data (CDO API) ===');
  console.log('This uses the CDO API and requires a token\n');

  const cdoToken = process.env.NOAA_CDO_TOKEN;

  if (!cdoToken) {
    console.log('⚠️  No CDO token found in environment (NOAA_CDO_TOKEN)');
    console.log('📝 Skipping archival data test');
    console.log('   Get a free token at: https://www.ncdc.noaa.gov/cdo-web/token');
    return null;
  }

  console.log('✅ CDO token found');

  const cdoService = new CDOService({
    token: cdoToken
  });

  // Test with a date from 2024 (recent archival data)
  const startDate = '2024-01-15';
  const endDate = '2024-01-17';

  console.log(`📅 Date range: ${startDate} to ${endDate}`);
  console.log(`📍 Location: ${locations.newYork.name} (${locations.newYork.lat}, ${locations.newYork.lon})\n`);

  try {
    console.log('🔍 Step 1: Finding nearby weather stations...');
    const stations = await cdoService.findStationsByLocation(
      locations.newYork.lat,
      locations.newYork.lon,
      startDate,
      endDate,
      5
    );

    if (!stations.results || stations.results.length === 0) {
      console.log('❌ No stations found');
      return false;
    }

    console.log(`✅ Found ${stations.results.length} nearby station(s):`);
    for (let i = 0; i < Math.min(3, stations.results.length); i++) {
      const station = stations.results[i];
      console.log(`   ${i + 1}. ${station.name || station.id}`);
      console.log(`      Location: (${station.latitude}, ${station.longitude})`);
    }

    console.log('\n🔍 Step 2: Retrieving historical data...');
    const data = await cdoService.getHistoricalData(
      locations.newYork.lat,
      locations.newYork.lon,
      startDate,
      endDate,
      100
    );

    if (!data.results || data.results.length === 0) {
      console.log('❌ No data found for this date range');
      return false;
    }

    console.log(`✅ Found ${data.results.length} data points`);

    // Group by date
    const dataByDate = new Map<string, Map<string, number>>();
    for (const item of data.results) {
      const date = item.date.split('T')[0];
      if (!dataByDate.has(date)) {
        dataByDate.set(date, new Map());
      }
      dataByDate.get(date)!.set(item.datatype, item.value);
    }

    console.log('\nDaily summaries:');
    for (const [date, values] of dataByDate) {
      console.log(`  ${date}:`);
      if (values.has('TMAX')) console.log(`    High: ${Math.round(values.get('TMAX')!)}°F`);
      if (values.has('TMIN')) console.log(`    Low: ${Math.round(values.get('TMIN')!)}°F`);
      if (values.has('PRCP')) console.log(`    Precipitation: ${values.get('PRCP')!.toFixed(2)} inches`);
    }

    return true;
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  console.log('Testing that error messages are helpful and actionable\n');

  // Test 1: Missing token
  console.log('Test 1: Attempting archival data without token...');
  const cdoServiceNoToken = new CDOService({ token: undefined });

  try {
    await cdoServiceNoToken.getHistoricalData(
      locations.sanFrancisco.lat,
      locations.sanFrancisco.lon,
      '2024-01-01',
      '2024-01-02',
      100
    );
    console.log('❌ Should have thrown an error for missing token');
    return false;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.log('✅ Correctly threw error for missing token');

    // Check that error message contains helpful information
    if (message.includes('token') && message.includes('https://')) {
      console.log('✅ Error message includes setup instructions with URL');
    } else {
      console.log('⚠️  Error message could be more helpful');
      console.log(`   Message: ${message.substring(0, 100)}...`);
    }
  }

  // Test 2: Invalid date range
  console.log('\nTest 2: Testing with future dates...');
  const noaaService = new NOAAService({
    userAgent: '(weather-mcp-test, github.com/weather-mcp)'
  });

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);

  try {
    // This should fail at validation level in index.ts, but let's test the service
    await noaaService.getHistoricalObservations(
      locations.chicago.lat,
      locations.chicago.lon,
      futureDate,
      futureDate,
      10
    );
    console.log('⚠️  Request completed (might have no data for future dates)');
  } catch (error) {
    console.log('✅ Handled future date appropriately');
  }

  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Historical Weather Data Retrieval Test Suite          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    recentData: false,
    archivalData: null as boolean | null,
    errorHandling: false
  };

  // Test 1: Recent historical data
  results.recentData = await testRecentHistoricalData();

  // Test 2: Archival data (if token available)
  results.archivalData = await testArchivalDataWithToken();

  // Test 3: Error handling
  results.errorHandling = await testErrorHandling();

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      Test Summary                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Recent Historical Data (Real-time API):  ${results.recentData ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Archival Data (CDO API):                 ${results.archivalData === null ? '⏭️  SKIP (no token)' : results.archivalData ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Handling:                          ${results.errorHandling ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = results.recentData && results.errorHandling && (results.archivalData === null || results.archivalData);

  if (allPassed) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed or were skipped');
  }

  console.log('\n💡 To test archival data, set NOAA_CDO_TOKEN in your .env file');
  console.log('   Get a free token at: https://www.ncdc.noaa.gov/cdo-web/token');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
