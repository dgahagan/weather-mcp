/**
 * Integration test for search_location tool
 * Tests the geocoding functionality with various location queries
 */

import { OpenMeteoService } from '../src/services/openmeteo.js';
import { handleSearchLocation } from '../src/handlers/locationHandler.js';

const openMeteoService = new OpenMeteoService();

async function testSearchLocation() {
  console.log('=== Testing search_location Tool ===\n');

  // Test 1: Search for a major city
  console.log('Test 1: Search for Paris');
  try {
    const result = await handleSearchLocation(
      { query: 'Paris', limit: 3 },
      openMeteoService
    );
    console.log(result.content[0].text);
    console.log('\n✅ Test 1 passed\n');
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Search for a US city with state
  console.log('Test 2: Search for San Francisco, CA');
  try {
    const result = await handleSearchLocation(
      { query: 'San Francisco, CA', limit: 3 },
      openMeteoService
    );
    console.log(result.content[0].text);
    console.log('\n✅ Test 2 passed\n');
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Search for Tokyo
  console.log('Test 3: Search for Tokyo');
  try {
    const result = await handleSearchLocation(
      { query: 'Tokyo', limit: 3 },
      openMeteoService
    );
    console.log(result.content[0].text);
    console.log('\n✅ Test 3 passed\n');
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test 4: Search for London
  console.log('Test 4: Search for London');
  try {
    const result = await handleSearchLocation(
      { query: 'London', limit: 3 },
      openMeteoService
    );
    console.log(result.content[0].text);
    console.log('\n✅ Test 4 passed\n');
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  // Test 5: Search with default limit
  console.log('Test 5: Search for New York (default limit)');
  try {
    const result = await handleSearchLocation(
      { query: 'New York' },
      openMeteoService
    );
    console.log(result.content[0].text);
    console.log('\n✅ Test 5 passed\n');
  } catch (error) {
    console.error('❌ Test 5 failed:', error);
  }

  // Test 6: Search for a less common location
  console.log('Test 6: Search for Reykjavik');
  try {
    const result = await handleSearchLocation(
      { query: 'Reykjavik', limit: 2 },
      openMeteoService
    );
    console.log(result.content[0].text);
    console.log('\n✅ Test 6 passed\n');
  } catch (error) {
    console.error('❌ Test 6 failed:', error);
  }

  // Test 7: Empty query (should fail)
  console.log('Test 7: Empty query (expect error)');
  try {
    await handleSearchLocation(
      { query: '' },
      openMeteoService
    );
    console.error('❌ Test 7 failed: Should have thrown error');
  } catch (error) {
    console.log('✅ Test 7 passed: Correctly rejected empty query');
    console.log(`Error message: ${(error as Error).message}\n`);
  }

  // Test 8: Single character query (should fail)
  console.log('Test 8: Single character query (expect error)');
  try {
    await handleSearchLocation(
      { query: 'A' },
      openMeteoService
    );
    console.error('❌ Test 8 failed: Should have thrown error');
  } catch (error) {
    console.log('✅ Test 8 passed: Correctly rejected single character');
    console.log(`Error message: ${(error as Error).message}\n`);
  }

  console.log('=== All search_location Tests Complete ===');
}

// Run tests
testSearchLocation().catch(console.error);
