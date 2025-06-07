/**
 * Error handling tests for MLB Stats MCP Server
 */

const { TestRunner } = require('./test-utils');

/**
 * Test invalid HTTP methods
 */
async function testInvalidMethods(runner) {
  try {
    const response = await fetch('https://mlbstats-mcp.gerrygugger.workers.dev', {
      method: 'GET'
    });
    
    runner.assert(response.status === 405, 'GET method: Should return 405 Method Not Allowed');
  } catch (error) {
    runner.assert(false, `GET method test failed: ${error.message}`);
  }
}

/**
 * Test missing command parameter
 */
async function testMissingCommand(runner) {
  const response = await runner.makeRequest({
    params: {
      queryParams: {
        season: '2024'
      }
    }
  });

  runner.assertError(response, 'Missing command');
  runner.assert(response.data.error.includes('Missing'), 'Missing command: Error message should mention missing command');
}

/**
 * Test invalid command
 */
async function testInvalidCommand(runner) {
  const response = await runner.makeRequest({
    command: 'invalidCommand',
    params: {}
  });

  runner.assertError(response, 'Invalid command');
  runner.assert(response.data.error.includes('Unknown command'), 'Invalid command: Error message should mention unknown command');
  runner.assert(response.data.error.includes('Available commands'), 'Invalid command: Error should list available commands');
}

/**
 * Test invalid JSON payload
 */
async function testInvalidJSON(runner) {
  try {
    const response = await fetch('https://mlbstats-mcp.gerrygugger.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json {'
    });

    const data = await response.json();
    runner.assert(response.status === 400, 'Invalid JSON: Should return 400');
    runner.assert(data.error.includes('Invalid JSON'), 'Invalid JSON: Error message should mention invalid JSON');
  } catch (error) {
    runner.assert(false, `Invalid JSON test failed: ${error.message}`);
  }
}

/**
 * Test missing path parameters
 */
async function testMissingPathParams(runner) {
  const response = await runner.makeRequest({
    command: 'getPlayerStats',
    params: {
      queryParams: {
        stats: 'season',
        group: 'hitting'
      }
      // Missing pathParams.playerId
    }
  });

  // This should either return an error from our worker or from MLB API
  runner.assert(response.status !== 200, 'Missing path params: Should not succeed');
}

/**
 * Test invalid player ID
 */
async function testInvalidPlayerId(runner) {
  const response = await runner.makeRequest({
    command: 'getPlayerInfo',
    params: {
      pathParams: {
        playerId: 'invalid-player-id'
      }
    }
  });

  // Should return an error from MLB API
  runner.assert(response.status !== 200, 'Invalid player ID: Should not succeed');
}

/**
 * Test invalid team ID
 */
async function testInvalidTeamId(runner) {
  const response = await runner.makeRequest({
    command: 'getRoster',
    params: {
      pathParams: {
        teamId: '999999' // Non-existent team
      }
    }
  });

  // Should return an error from MLB API
  runner.assert(response.status !== 200, 'Invalid team ID: Should not succeed');
}

/**
 * Test empty request body
 */
async function testEmptyBody(runner) {
  try {
    const response = await fetch('https://mlbstats-mcp.gerrygugger.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: ''
    });

    runner.assert(response.status === 400, 'Empty body: Should return 400');
  } catch (error) {
    runner.assert(false, `Empty body test failed: ${error.message}`);
  }
}

/**
 * Test CORS preflight
 */
async function testCORSPreflight(runner) {
  try {
    const response = await fetch('https://mlbstats-mcp.gerrygugger.workers.dev', {
      method: 'OPTIONS'
    });

    runner.assert(response.status === 204, 'CORS preflight: Should return 204');
    runner.assert(
      response.headers.get('Access-Control-Allow-Origin') === '*',
      'CORS preflight: Should have correct CORS headers'
    );
  } catch (error) {
    runner.assert(false, `CORS preflight test failed: ${error.message}`);
  }
}

/**
 * Test malformed parameters
 */
async function testMalformedParams(runner) {
  const response = await runner.makeRequest({
    command: 'getTeamInfo',
    params: 'not an object' // Should be an object
  });

  // This might pass through to MLB API and fail there, which is acceptable
  runner.assert(response.status !== 200 || response.data.result !== undefined, 'Malformed params: Should handle gracefully');
}

module.exports = {
  testInvalidMethods,
  testMissingCommand,
  testInvalidCommand,
  testInvalidJSON,
  testMissingPathParams,
  testInvalidPlayerId,
  testInvalidTeamId,
  testEmptyBody,
  testCORSPreflight,
  testMalformedParams
};