/**
 * Individual endpoint tests for MLB Stats MCP Server
 */

const { TestRunner, TEST_DATA } = require('./test-utils');

/**
 * Test getTeamInfo endpoint
 */
async function testGetTeamInfo(runner) {
  // Test basic team info request
  const response = await runner.makeRequest({
    command: 'getTeamInfo',
    params: {
      queryParams: {
        season: TEST_DATA.CURRENT_SEASON,
        sportId: '1'
      }
    }
  });

  runner.assertSuccess(response, 'getTeamInfo');
  runner.assert(Array.isArray(response.data.result.teams), 'getTeamInfo: Should return teams array');
  runner.assert(response.data.result.teams.length === 30, 'getTeamInfo: Should return 30 MLB teams');
  
  // Check team structure
  const firstTeam = response.data.result.teams[0];
  runner.assert(firstTeam.id !== undefined, 'getTeamInfo: Team should have id');
  runner.assert(firstTeam.name !== undefined, 'getTeamInfo: Team should have name');
  runner.assert(firstTeam.abbreviation !== undefined, 'getTeamInfo: Team should have abbreviation');
}

/**
 * Test getRoster endpoint
 */
async function testGetRoster(runner) {
  const response = await runner.makeRequest({
    command: 'getRoster',
    params: {
      pathParams: {
        teamId: TEST_DATA.YANKEES
      },
      queryParams: {
        season: TEST_DATA.CURRENT_SEASON
      }
    }
  });

  runner.assertSuccess(response, 'getRoster');
  runner.assert(response.data.result.roster !== undefined, 'getRoster: Should have roster property');
  runner.assert(Array.isArray(response.data.result.roster), 'getRoster: Roster should be an array');
  
  if (response.data.result.roster.length > 0) {
    const firstPlayer = response.data.result.roster[0];
    runner.assert(firstPlayer.person !== undefined, 'getRoster: Player should have person property');
    runner.assert(firstPlayer.position !== undefined, 'getRoster: Player should have position property');
  }
}

/**
 * Test getPlayerStats endpoint
 */
async function testGetPlayerStats(runner) {
  const response = await runner.makeRequest({
    command: 'getPlayerStats',
    params: {
      pathParams: {
        playerId: TEST_DATA.AARON_JUDGE
      },
      queryParams: {
        stats: 'season',
        group: 'hitting',
        season: TEST_DATA.CURRENT_SEASON
      }
    }
  });

  runner.assertSuccess(response, 'getPlayerStats');
  runner.assert(response.data.result.stats !== undefined, 'getPlayerStats: Should have stats property');
  runner.assert(Array.isArray(response.data.result.stats), 'getPlayerStats: Stats should be an array');
}

/**
 * Test getPlayerInfo endpoint
 */
async function testGetPlayerInfo(runner) {
  const response = await runner.makeRequest({
    command: 'getPlayerInfo',
    params: {
      pathParams: {
        playerId: TEST_DATA.AARON_JUDGE
      }
    }
  });

  runner.assertSuccess(response, 'getPlayerInfo');
  runner.assert(response.data.result.people !== undefined, 'getPlayerInfo: Should have people property');
  runner.assert(Array.isArray(response.data.result.people), 'getPlayerInfo: People should be an array');
  
  if (response.data.result.people.length > 0) {
    const player = response.data.result.people[0];
    runner.assert(player.id === parseInt(TEST_DATA.AARON_JUDGE), 'getPlayerInfo: Should return correct player ID');
    runner.assert(player.fullName !== undefined, 'getPlayerInfo: Player should have fullName');
    runner.assert(player.primaryNumber !== undefined, 'getPlayerInfo: Player should have primaryNumber');
  }
}

/**
 * Test getSchedule endpoint
 */
async function testGetSchedule(runner) {
  const response = await runner.makeRequest({
    command: 'getSchedule',
    params: {
      queryParams: {
        sportId: '1',
        date: TEST_DATA.TEST_DATE
      }
    }
  });

  runner.assertSuccess(response, 'getSchedule');
  runner.assert(response.data.result.dates !== undefined, 'getSchedule: Should have dates property');
  runner.assert(Array.isArray(response.data.result.dates), 'getSchedule: Dates should be an array');
}

/**
 * Test getStandings endpoint
 */
async function testGetStandings(runner) {
  const response = await runner.makeRequest({
    command: 'getStandings',
    params: {
      queryParams: {
        leagueId: '103', // American League
        season: TEST_DATA.CURRENT_SEASON
      }
    }
  });

  runner.assertSuccess(response, 'getStandings');
  runner.assert(response.data.result.records !== undefined, 'getStandings: Should have records property');
  runner.assert(Array.isArray(response.data.result.records), 'getStandings: Records should be an array');
}

/**
 * Test getSeasons endpoint
 */
async function testGetSeasons(runner) {
  const response = await runner.makeRequest({
    command: 'getSeasons',
    params: {
      queryParams: {
        sportId: '1'
      }
    }
  });

  runner.assertSuccess(response, 'getSeasons');
  runner.assert(response.data.result.seasons !== undefined, 'getSeasons: Should have seasons property');
  runner.assert(Array.isArray(response.data.result.seasons), 'getSeasons: Seasons should be an array');
}

/**
 * Test getVenues endpoint
 */
async function testGetVenues(runner) {
  const response = await runner.makeRequest({
    command: 'getVenues',
    params: {
      queryParams: {
        sportId: '1'
      }
    }
  });

  runner.assertSuccess(response, 'getVenues');
  runner.assert(response.data.result.venues !== undefined, 'getVenues: Should have venues property');
  runner.assert(Array.isArray(response.data.result.venues), 'getVenues: Venues should be an array');
}

/**
 * Test getLiveGame endpoint (this might not always have data)
 */
async function testGetLiveGame(runner) {
  // This test uses a sample game ID and might not always work
  const response = await runner.makeRequest({
    command: 'getLiveGame',
    params: {
      pathParams: {
        gamePk: TEST_DATA.SAMPLE_GAME
      }
    }
  });

  // We don't assert success here since the game might not exist
  // But we check that the request format is correct
  runner.assert(response.status !== 400, 'getLiveGame: Should not return 400 for valid request format');
  
  if (response.ok) {
    runner.assert(response.data.result.gameData !== undefined, 'getLiveGame: Should have gameData if successful');
  }
}

/**
 * Test getGameBoxscore endpoint
 */
async function testGetGameBoxscore(runner) {
  // This test uses a sample game ID and might not always work
  const response = await runner.makeRequest({
    command: 'getGameBoxscore',
    params: {
      pathParams: {
        gamePk: TEST_DATA.SAMPLE_GAME
      }
    }
  });

  // We don't assert success here since the game might not exist
  runner.assert(response.status !== 400, 'getGameBoxscore: Should not return 400 for valid request format');
  
  if (response.ok) {
    runner.assert(response.data.result.teams !== undefined, 'getGameBoxscore: Should have teams if successful');
  }
}

module.exports = {
  testGetTeamInfo,
  testGetRoster,
  testGetPlayerStats,
  testGetPlayerInfo,
  testGetSchedule,
  testGetStandings,
  testGetSeasons,
  testGetVenues,
  testGetLiveGame,
  testGetGameBoxscore
};