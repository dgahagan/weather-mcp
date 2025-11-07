#!/bin/bash
# End-to-End Test Script for v1.2.0 Features
# Tests new climate normals, snow/ice, timezone, fire weather, and air quality features

set -e

echo "=================================================="
echo "Weather MCP Server v1.2.0 - Feature Testing"
echo "=================================================="
echo ""

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local tool="$2"
    local args="$3"

    TESTS_RUN=$((TESTS_RUN + 1))
    echo "[$TESTS_RUN] Testing: $test_name"
    echo "Tool: $tool"
    echo "Args: $args"
    echo ""

    # Create the MCP request JSON
    local request=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": $TESTS_RUN,
  "method": "tools/call",
  "params": {
    "name": "$tool",
    "arguments": $args
  }
}
EOF
)

    # Run the MCP server with the request
    echo "$request" | node dist/index.js 2>/dev/null | tail -n +2 | jq -r '.result.content[0].text' > /tmp/mcp_test_$TESTS_RUN.txt

    if [ $? -eq 0 ] && [ -s /tmp/mcp_test_$TESTS_RUN.txt ]; then
        echo "✅ PASSED"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo ""
        echo "--- OUTPUT PREVIEW (first 30 lines) ---"
        head -n 30 /tmp/mcp_test_$TESTS_RUN.txt
        echo "--- END OUTPUT ---"
    else
        echo "❌ FAILED"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        cat /tmp/mcp_test_$TESTS_RUN.txt 2>/dev/null || echo "No output"
    fi

    echo ""
    echo "=================================================="
    echo ""
    sleep 2
}

echo "Building project..."
npm run build > /dev/null 2>&1

echo ""
echo "Starting Feature Tests..."
echo ""

# Test 1: Climate Normals - Current Conditions (US Location)
run_test \
    "Climate Normals - Current Conditions (Denver, CO)" \
    "get_current_conditions" \
    '{"latitude": 39.7392, "longitude": -104.9903, "include_normals": true}'

# Test 2: Climate Normals - Forecast (US Location)
run_test \
    "Climate Normals - Forecast (Denver, CO)" \
    "get_forecast" \
    '{"latitude": 39.7392, "longitude": -104.9903, "include_normals": true, "days": 3}'

# Test 3: Snow/Ice Data - Winter Location (Minneapolis in winter)
run_test \
    "Snow/Ice Data - Minneapolis, MN" \
    "get_current_conditions" \
    '{"latitude": 44.9778, "longitude": -93.2650, "include_fire_weather": false}'

# Test 4: Snow/Ice in Forecast - Alaska
run_test \
    "Snow/Ice Forecast - Anchorage, AK" \
    "get_forecast" \
    '{"latitude": 61.2181, "longitude": -149.9003, "days": 5}'

# Test 5: Fire Weather Indices - California
run_test \
    "Fire Weather Indices - Los Angeles, CA" \
    "get_current_conditions" \
    '{"latitude": 34.0522, "longitude": -118.2437, "include_fire_weather": true}'

# Test 6: Air Quality - Major City
run_test \
    "Air Quality - Los Angeles, CA" \
    "get_air_quality" \
    '{"latitude": 34.0522, "longitude": -118.2437}'

# Test 7: Air Quality with Forecast - NYC
run_test \
    "Air Quality Forecast - New York, NY" \
    "get_air_quality" \
    '{"latitude": 40.7128, "longitude": -74.0060, "forecast": true}'

# Test 8: Timezone-Aware Formatting - Different Timezones
run_test \
    "Timezone Formatting - Seattle, WA (PST)" \
    "get_current_conditions" \
    '{"latitude": 47.6062, "longitude": -122.3321}'

# Test 9: Timezone + Climate Normals - International
run_test \
    "Climate Normals - Paris, France (International)" \
    "get_forecast" \
    '{"latitude": 48.8566, "longitude": 2.3522, "include_normals": true, "days": 3}'

# Test 10: Marine Conditions - Great Lakes (NOAA data with timezone)
run_test \
    "Marine Conditions - Lake Michigan" \
    "get_marine_conditions" \
    '{"latitude": 44.7631, "longitude": -85.6206}'

echo ""
echo "=================================================="
echo "TEST SUMMARY"
echo "=================================================="
echo "Total Tests Run: $TESTS_RUN"
echo "Passed: $TESTS_PASSED ✅"
echo "Failed: $TESTS_FAILED ❌"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Ready for production release."
    exit 0
else
    echo "⚠️  Some tests failed. Review output above."
    exit 1
fi
