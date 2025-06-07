#!/usr/bin/env node

/**
 * Quick test script for MLB Stats MCP Server
 * Tests a few key endpoints to verify basic functionality
 */

const { TestRunner, TEST_DATA, WORKER_URL } = require('./test-utils');

async function quickTest() {
  console.log('⚡ Quick Test - MLB Stats MCP Server');
  console.log('=' .repeat(50));
  console.log(`📡 Testing: ${WORKER_URL}`);
  
  const runner = new TestRunner();

  // Test 1: Get all teams (most reliable test)
  console.log('\n🧪 Test 1: Get All Teams');
  const teamsResponse = await runner.makeRequest({
    command: 'getTeamInfo',
    params: {
      queryParams: {
        season: TEST_DATA.CURRENT_SEASON,
        sportId: '1'
      }
    }
  });
  
  if (teamsResponse.ok) {
    console.log('✅ Teams endpoint working');
    console.log(`📊 Found ${teamsResponse.data.result.teams?.length || 0} teams`);
  } else {
    console.log('❌ Teams endpoint failed');
    console.log('📝 Response:', teamsResponse.data);
  }

  // Test 2: Get player info
  console.log('\n🧪 Test 2: Get Player Info (Aaron Judge)');
  const playerResponse = await runner.makeRequest({
    command: 'getPlayerInfo',
    params: {
      pathParams: {
        playerId: TEST_DATA.AARON_JUDGE
      }
    }
  });
  
  if (playerResponse.ok) {
    const player = playerResponse.data.result.people?.[0];
    console.log('✅ Player endpoint working');
    console.log(`👤 Player: ${player?.fullName || 'Unknown'} #${player?.primaryNumber || 'N/A'}`);
  } else {
    console.log('❌ Player endpoint failed');
    console.log('📝 Response:', playerResponse.data);
  }

  // Test 3: Error handling
  console.log('\n🧪 Test 3: Error Handling (Invalid Command)');
  const errorResponse = await runner.makeRequest({
    command: 'invalidCommand',
    params: {}
  });
  
  if (!errorResponse.ok && errorResponse.data.error) {
    console.log('✅ Error handling working');
    console.log(`🚨 Error: ${errorResponse.data.error}`);
  } else {
    console.log('❌ Error handling not working as expected');
  }

  // Test 4: CORS
  console.log('\n🧪 Test 4: CORS Headers');
  try {
    const corsResponse = await fetch(WORKER_URL, { method: 'OPTIONS' });
    const corsHeader = corsResponse.headers.get('Access-Control-Allow-Origin');
    
    if (corsHeader === '*') {
      console.log('✅ CORS headers working');
    } else {
      console.log('❌ CORS headers not configured correctly');
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Quick test completed!');
}

quickTest().catch(error => {
  console.error('💥 Quick test failed:', error);
  process.exit(1);
});