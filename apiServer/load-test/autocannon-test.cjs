#!/usr/bin/env node

/**
 * Autocannon Load Test for Animal Zoom API
 *
 * This script performs load testing with 50+ concurrent connections
 * and measures API performance (p95, p99 response times).
 */

const autocannon = require('autocannon');
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to make HTTP requests
function makeRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Create a guest user and return the token
async function createGuestUser() {
  const response = await makeRequest('POST', '/auth/guest', {
    displayName: `LoadTest-${Date.now()}`,
  });

  if (response.status === 201) {
    return response.data.accessToken;
  }
  throw new Error('Failed to create guest user');
}

// Create a room and return the room code
async function createRoom(token) {
  const response = await makeRequest(
    'POST',
    '/rooms',
    { maxParticipants: 100 },
    { Authorization: `Bearer ${token}` }
  );

  if (response.status === 201) {
    return response.data.roomCode;
  }
  throw new Error('Failed to create room');
}

// Test configuration
const tests = [
  {
    name: 'Guest User Creation',
    url: `${API_URL}/auth/guest`,
    method: 'POST',
    body: JSON.stringify({ displayName: 'LoadTestUser' }),
    headers: { 'Content-Type': 'application/json' },
  },
  {
    name: 'Room Creation (requires auth)',
    url: `${API_URL}/rooms`,
    method: 'POST',
    setupHeaders: async () => {
      const token = await createGuestUser();
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
    },
    body: JSON.stringify({ maxParticipants: 100 }),
  },
  {
    name: 'Get Room Info (requires auth and room)',
    url: `${API_URL}/rooms/{{roomCode}}`,
    method: 'GET',
    setupHeaders: async () => {
      const token = await createGuestUser();
      const roomCode = await createRoom(token);
      return {
        Authorization: `Bearer ${token}`,
        roomCode,
      };
    },
  },
  {
    name: 'Avatar Update (requires auth)',
    url: `${API_URL}/avatars/me`,
    method: 'PUT',
    setupHeaders: async () => {
      const token = await createGuestUser();
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
    },
    body: JSON.stringify({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      accessories: ['hat'],
    }),
  },
];

// Run a single test
async function runTest(test) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`Testing: ${test.name}`, colors.bright);
  log('='.repeat(60), colors.blue);

  let url = test.url;
  let headers = test.headers || {};

  // Setup headers if function provided
  if (test.setupHeaders) {
    const setupResult = await test.setupHeaders();
    headers = { ...headers, ...setupResult };

    // Replace room code in URL if provided
    if (setupResult.roomCode) {
      url = url.replace('{{roomCode}}', setupResult.roomCode);
    }
  }

  const options = {
    url,
    method: test.method,
    connections: 50, // 50 concurrent connections
    duration: 30, // 30 seconds
    pipelining: 1,
    headers,
    body: test.body,
  };

  return new Promise((resolve, reject) => {
    const instance = autocannon(options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });

    // Track progress
    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: false,
    });
  });
}

// Print results
function printResults(result, testName) {
  const p95 = result.latency.p97_5 || result.latency.p95 || 0;
  const p99 = result.latency.p99 || 0;
  const errorRate = (result['2xx'] ? (result.non2xx / result.requests.total) * 100 : 0);

  log(`\n📊 Results for: ${testName}`, colors.bright);
  log(`${'─'.repeat(60)}`);
  log(`  Total Requests:    ${result.requests.total}`);
  log(`  Requests/sec:      ${result.requests.average.toFixed(2)}`);
  log(`  Throughput:        ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
  log(`  Latency (avg):     ${result.latency.mean.toFixed(2)} ms`);
  log(`  Latency (p50):     ${result.latency.p50.toFixed(2)} ms`);
  log(`  Latency (p95):     ${p95.toFixed(2)} ms ${p95 < 200 ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
  log(`  Latency (p99):     ${p99.toFixed(2)} ms ${p99 < 500 ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
  log(`  2xx Responses:     ${result['2xx'] || 0}`);
  log(`  Non-2xx Responses: ${result.non2xx || 0}`);
  log(`  Error Rate:        ${errorRate.toFixed(2)}% ${errorRate < 1 ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
  log(`  Timeouts:          ${result.timeouts}`);

  return {
    testName,
    p95,
    p99,
    errorRate,
    requestsPerSec: result.requests.average,
  };
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('🚀 Animal Zoom API Load Testing', colors.bright);
  log('='.repeat(60), colors.bright);
  log(`Target: ${API_URL}`);
  log(`Connections: 50 concurrent`);
  log(`Duration: 30 seconds per test`);
  log('='.repeat(60) + '\n', colors.bright);

  const allResults = [];

  // Run simple guest creation test first
  try {
    log('Running Guest User Creation load test...', colors.yellow);
    const result = await runTest(tests[0]);
    allResults.push(printResults(result, tests[0].name));
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
  }

  // Run avatar update test
  try {
    log('\nRunning Avatar Update load test...', colors.yellow);
    const result = await runTest(tests[3]);
    allResults.push(printResults(result, tests[3].name));
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
  }

  // Print summary
  log(`\n${'='.repeat(60)}`, colors.bright);
  log('📈 Summary', colors.bright);
  log('='.repeat(60), colors.bright);

  const avgP95 = allResults.reduce((sum, r) => sum + r.p95, 0) / allResults.length;
  const avgP99 = allResults.reduce((sum, r) => sum + r.p99, 0) / allResults.length;
  const avgErrorRate = allResults.reduce((sum, r) => sum + r.errorRate, 0) / allResults.length;
  const avgRps = allResults.reduce((sum, r) => sum + r.requestsPerSec, 0) / allResults.length;

  log(`\n  Average p95 Response Time: ${avgP95.toFixed(2)} ms ${avgP95 < 200 ? colors.green + '✅ PASS' + colors.reset : colors.red + '❌ FAIL' + colors.reset}`);
  log(`  Average p99 Response Time: ${avgP99.toFixed(2)} ms ${avgP99 < 500 ? colors.green + '✅ PASS' + colors.reset : colors.red + '❌ FAIL' + colors.reset}`);
  log(`  Average Error Rate:        ${avgErrorRate.toFixed(2)}% ${avgErrorRate < 1 ? colors.green + '✅ PASS' + colors.reset : colors.red + '❌ FAIL' + colors.reset}`);
  log(`  Average Requests/sec:      ${avgRps.toFixed(2)}`);

  log(`\n${'='.repeat(60)}\n`, colors.bright);

  // Exit with error code if thresholds not met
  if (avgP95 >= 200 || avgP99 >= 500 || avgErrorRate >= 1) {
    log('❌ Performance thresholds not met', colors.red);
    process.exit(1);
  } else {
    log('✅ All performance thresholds met!', colors.green);
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

// Run main function
main();
