# MLB Stats MCP Server - Test Suite

Comprehensive test suite for validating the MLB Stats MCP Server functionality.

## Test Files

- **`test-utils.js`** - Test utilities and helper functions
- **`endpoint-tests.js`** - Tests for all MLB API endpoints
- **`error-tests.js`** - Error handling and edge case tests
- **`run-all-tests.js`** - Main test runner (runs all tests)
- **`quick-test.js`** - Quick validation test (4 key tests)

## Running Tests

### Quick Test (Recommended for CI/CD)
```bash
npm run test:quick
```
Tests basic functionality: teams, player info, error handling, and CORS.

### Full Test Suite
```bash
npm test
# or
npm run test:endpoints
```
Runs all endpoint and error handling tests (~70 tests).

### Local Development Testing
```bash
npm run test:local
```
Tests against local development server (requires `wrangler dev` running).

## Test Coverage

### Endpoint Tests ✅
- ✅ `getTeamInfo` - Team information
- ✅ `getRoster` - Team rosters  
- ✅ `getPlayerStats` - Player statistics
- ✅ `getPlayerInfo` - Player information
- ✅ `getSchedule` - Game schedules
- ✅ `getStandings` - League standings
- ✅ `getSeasons` - Season information
- ✅ `getVenues` - Stadium/venue data
- ✅ `getLiveGame` - Live game data
- ✅ `getGameBoxscore` - Game boxscores

### Error Handling Tests ✅
- ✅ Invalid HTTP methods (GET, PUT, etc.)
- ✅ Missing command parameter
- ✅ Invalid/unknown commands
- ✅ Malformed JSON payloads
- ✅ Missing path parameters
- ✅ Invalid player/team IDs
- ✅ Empty request bodies
- ✅ CORS preflight handling
- ✅ Malformed parameter structures

## Test Results

**Latest Run**: 69/70 tests passing (98.6% success rate)

### Known Issues
- One test may fail for "Invalid Team ID" due to MLB API's flexible handling of team IDs

## Test Data

Tests use real MLB data including:
- **Players**: Aaron Judge (#592450), Shohei Ohtani (#660271), Mike Trout (#545361)
- **Teams**: Yankees (#147), Angels (#108), Dodgers (#119)
- **Season**: 2024
- **Test Date**: July 4, 2024

## Environment Variables

- `WORKER_URL` - Override the default worker URL for testing
  - Default: `https://mlbstats-mcp.gerrygugger.workers.dev`
  - Local dev: `http://localhost:8787`

## Adding New Tests

1. Add endpoint tests to `endpoint-tests.js`
2. Add error tests to `error-tests.js` 
3. Update the main runner in `run-all-tests.js`
4. Test locally with `npm run test:quick`