#!/usr/bin/env node

/**
 * Main test runner for MLB Stats MCP Server
 * Runs all endpoint and error handling tests
 */

const { TestRunner, WORKER_URL } = require('./test-utils');
const endpointTests = require('./endpoint-tests');
const errorTests = require('./error-tests');

async function main() {
  console.log('🚀 MLB Stats MCP Server Test Suite');
  console.log('=' .repeat(60));
  console.log(`📡 Testing: ${WORKER_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  
  const runner = new TestRunner();

  // Run endpoint tests
  console.log('\n📋 ENDPOINT TESTS');
  console.log('=' .repeat(60));
  
  await runner.runTest('Get Team Info', endpointTests.testGetTeamInfo);
  await runner.runTest('Get Roster', endpointTests.testGetRoster);
  await runner.runTest('Get Player Stats', endpointTests.testGetPlayerStats);
  await runner.runTest('Get Player Info', endpointTests.testGetPlayerInfo);
  await runner.runTest('Get Schedule', endpointTests.testGetSchedule);
  await runner.runTest('Get Standings', endpointTests.testGetStandings);
  await runner.runTest('Get Seasons', endpointTests.testGetSeasons);
  await runner.runTest('Get Venues', endpointTests.testGetVenues);
  await runner.runTest('Get Live Game', endpointTests.testGetLiveGame);
  await runner.runTest('Get Game Boxscore', endpointTests.testGetGameBoxscore);

  // Run error handling tests
  console.log('\n🚨 ERROR HANDLING TESTS');
  console.log('=' .repeat(60));
  
  await runner.runTest('Invalid HTTP Methods', errorTests.testInvalidMethods);
  await runner.runTest('Missing Command', errorTests.testMissingCommand);
  await runner.runTest('Invalid Command', errorTests.testInvalidCommand);
  await runner.runTest('Invalid JSON', errorTests.testInvalidJSON);
  await runner.runTest('Missing Path Params', errorTests.testMissingPathParams);
  await runner.runTest('Invalid Player ID', errorTests.testInvalidPlayerId);
  await runner.runTest('Invalid Team ID', errorTests.testInvalidTeamId);
  await runner.runTest('Empty Body', errorTests.testEmptyBody);
  await runner.runTest('CORS Preflight', errorTests.testCORSPreflight);
  await runner.runTest('Malformed Params', errorTests.testMalformedParams);

  // Print summary
  const allPassed = runner.printSummary();
  
  console.log(`\n⏰ Finished: ${new Date().toISOString()}`);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});