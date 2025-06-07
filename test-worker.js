#!/usr/bin/env node

/**
 * Simple test script to validate the MLB Stats MCP Worker
 * Run with: node test-worker.js <worker-url>
 */

const WORKER_URL = process.argv[2] || 'http://localhost:8787';

const testCases = [
  {
    name: "Get Teams",
    payload: {
      command: "getTeamInfo",
      params: {
        queryParams: {
          season: "2024",
          sportId: "1"
        }
      }
    }
  },
  {
    name: "Get Aaron Judge Player Info",
    payload: {
      command: "getPlayerInfo",
      params: {
        pathParams: {
          playerId: "592450"
        }
      }
    }
  },
  {
    name: "Invalid Command Test",
    payload: {
      command: "invalidCommand",
      params: {}
    }
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Running test: ${testCase.name}`);
  console.log(`📤 Request: ${JSON.stringify(testCase.payload, null, 2)}`);
  
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.payload)
    });
    
    const result = await response.json();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response: ${JSON.stringify(result, null, 2).substring(0, 500)}...`);
    
    if (response.ok) {
      console.log(`✅ Test passed: ${testCase.name}`);
    } else {
      console.log(`❌ Test failed: ${testCase.name}`);
    }
    
  } catch (error) {
    console.log(`💥 Test error: ${testCase.name} - ${error.message}`);
  }
}

async function main() {
  console.log(`🚀 Testing MLB Stats MCP Worker at: ${WORKER_URL}`);
  
  for (const testCase of testCases) {
    await runTest(testCase);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
  
  console.log('\n🏁 All tests completed!');
}

main().catch(console.error);