/**
 * Test utilities for MLB Stats MCP Server
 */

const WORKER_URL = process.env.WORKER_URL || 'https://mlbstats-mcp.gerrygugger.workers.dev';

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  /**
   * Make a request to the worker
   */
  async makeRequest(payload) {
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return {
        status: response.status,
        data: data,
        ok: response.ok
      };
    } catch (error) {
      return {
        status: 0,
        data: { error: error.message },
        ok: false
      };
    }
  }

  /**
   * Assert that a condition is true
   */
  assert(condition, message) {
    if (condition) {
      console.log(`✅ ${message}`);
      this.passed++;
    } else {
      console.log(`❌ ${message}`);
      this.failed++;
    }
  }

  /**
   * Assert that response is successful
   */
  assertSuccess(response, testName) {
    this.assert(response.ok, `${testName}: Response should be successful`);
    this.assert(response.status === 200, `${testName}: Status should be 200`);
    this.assert(response.data.result !== undefined, `${testName}: Should have result property`);
  }

  /**
   * Assert that response is an error
   */
  assertError(response, testName, expectedStatus = 400) {
    this.assert(!response.ok, `${testName}: Response should be an error`);
    this.assert(response.status === expectedStatus, `${testName}: Status should be ${expectedStatus}`);
    this.assert(response.data.error !== undefined, `${testName}: Should have error property`);
  }

  /**
   * Run a test function
   */
  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    console.log('=' .repeat(50));
    
    try {
      await testFunction(this);
      console.log(`✅ ${testName} completed`);
    } catch (error) {
      console.log(`💥 ${testName} threw error: ${error.message}`);
      this.failed++;
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${this.failed} test(s) failed`);
    }
    
    return this.failed === 0;
  }
}

// Test data constants
const TEST_DATA = {
  // Known player IDs for testing
  AARON_JUDGE: '592450',
  SHOHEI_OHTANI: '660271', 
  MIKE_TROUT: '545361',
  
  // Known team IDs
  YANKEES: '147',
  ANGELS: '108',
  DODGERS: '119',
  
  // Known game ID (this will likely be outdated but good for structure testing)
  SAMPLE_GAME: '717024',
  
  // Current season
  CURRENT_SEASON: '2024',
  
  // Test dates
  TEST_DATE: '2024-07-04'
};

module.exports = {
  TestRunner,
  TEST_DATA,
  WORKER_URL
};