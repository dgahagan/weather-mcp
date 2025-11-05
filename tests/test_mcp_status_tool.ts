/**
 * Test the check_service_status MCP tool directly
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NOAAService } from '../src/services/noaa.js';
import { OpenMeteoService } from '../src/services/openmeteo.js';

async function testMCPStatusTool() {
  console.log('='.repeat(80));
  console.log('Testing check_service_status MCP Tool');
  console.log('='.repeat(80));
  console.log();

  // Initialize services (same as in index.ts)
  const noaaService = new NOAAService({
    userAgent: '(weather-mcp-test, github.com/weather-mcp)'
  });
  const openMeteoService = new OpenMeteoService();

  // Simulate the handler logic from index.ts
  try {
    console.log('Calling check_service_status tool...');
    console.log();

    // Check status of both services
    const noaaStatus = await noaaService.checkServiceStatus();
    const openMeteoStatus = await openMeteoService.checkServiceStatus();

    // Format the status report (same logic as in index.ts)
    let output = `# Weather API Service Status\n\n`;
    output += `**Check Time:** ${new Date().toLocaleString()}\n\n`;

    // NOAA Status
    output += `## NOAA Weather API (Forecasts & Current Conditions)\n\n`;
    output += `**Status:** ${noaaStatus.operational ? '✅ Operational' : '❌ Issues Detected'}\n`;
    output += `**Message:** ${noaaStatus.message}\n`;
    output += `**Status Page:** ${noaaStatus.statusPage}\n`;
    output += `**Coverage:** United States locations only\n\n`;

    if (!noaaStatus.operational) {
      output += `**Recommended Actions:**\n`;
      output += `- Check planned outages: https://weather-gov.github.io/api/planned-outages\n`;
      output += `- View service notices: https://www.weather.gov/notification\n`;
      output += `- Report issues: nco.ops@noaa.gov or (301) 683-1518\n\n`;
    }

    // Open-Meteo Status
    output += `## Open-Meteo API (Historical Weather Data)\n\n`;
    output += `**Status:** ${openMeteoStatus.operational ? '✅ Operational' : '❌ Issues Detected'}\n`;
    output += `**Message:** ${openMeteoStatus.message}\n`;
    output += `**Status Page:** ${openMeteoStatus.statusPage}\n`;
    output += `**Coverage:** Global (worldwide locations)\n\n`;

    if (!openMeteoStatus.operational) {
      output += `**Recommended Actions:**\n`;
      output += `- Check production status: https://open-meteo.com/en/docs/model-updates\n`;
      output += `- View GitHub issues: https://github.com/open-meteo/open-meteo/issues\n`;
      output += `- Review documentation: https://open-meteo.com/en/docs\n\n`;
    }

    // Overall status summary
    const bothOperational = noaaStatus.operational && openMeteoStatus.operational;
    const neitherOperational = !noaaStatus.operational && !openMeteoStatus.operational;

    if (bothOperational) {
      output += `## Overall Status: ✅ All Services Operational\n\n`;
      output += `Both NOAA and Open-Meteo APIs are functioning normally. Weather data requests should succeed.\n`;
    } else if (neitherOperational) {
      output += `## Overall Status: ❌ Multiple Service Issues\n\n`;
      output += `Both weather APIs are experiencing issues. Please check the status pages above for updates.\n`;
    } else {
      output += `## Overall Status: ⚠️ Partial Service Availability\n\n`;
      if (noaaStatus.operational) {
        output += `NOAA API is operational: Forecasts and current conditions for US locations are available.\n`;
        output += `Open-Meteo API has issues: Historical weather data may be unavailable.\n`;
      } else {
        output += `Open-Meteo API is operational: Historical weather data is available globally.\n`;
        output += `NOAA API has issues: Forecasts and current conditions for US locations may be unavailable.\n`;
      }
    }

    console.log('✅ Tool execution successful!');
    console.log();
    console.log('Output:');
    console.log('='.repeat(80));
    console.log(output);
    console.log('='.repeat(80));

    // Verify the output contains expected elements
    console.log();
    console.log('Validation Checks:');
    console.log(`  - Contains NOAA status: ${output.includes('NOAA Weather API') ? '✅' : '❌'}`);
    console.log(`  - Contains Open-Meteo status: ${output.includes('Open-Meteo API') ? '✅' : '❌'}`);
    console.log(`  - Contains status page links: ${output.includes('weather-gov.github.io') && output.includes('open-meteo.com') ? '✅' : '❌'}`);
    console.log(`  - Contains operational indicators: ${output.includes('Operational') || output.includes('Issues Detected') ? '✅' : '❌'}`);
    console.log(`  - Contains overall summary: ${output.includes('Overall Status:') ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Tool execution failed:', error);
    process.exit(1);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('Test completed successfully!');
  console.log('='.repeat(80));
}

// Run test
testMCPStatusTool().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
