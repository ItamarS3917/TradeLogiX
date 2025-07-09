// K6 Performance Test for Trading Journal API
// This script tests the API performance under various load conditions

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTimeTrend = new Trend('response_time');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: 10 },   // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 },   // Stay at 10 users for 5 minutes
    { duration: '2m', target: 25 },   // Ramp up to 25 users over 2 minutes
    { duration: '5m', target: 25 },   // Stay at 25 users for 5 minutes
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    // Performance requirements
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.05'], // Error rate < 5%
    error_rate: ['rate<0.05'],
    response_time: ['p(95)<500'],
  },
};

// Test data
const testTradeData = {
  symbol: 'NQ',
  setupType: 'MMXM_Breaker',
  entryPrice: 15000 + Math.random() * 100,
  exitPrice: 15025 + Math.random() * 100,
  positionSize: Math.floor(Math.random() * 3) + 1,
  outcome: Math.random() > 0.6 ? 'win' : 'loss',
  notes: `Performance test trade ${Math.random().toString(36).substring(7)}`
};

const testDailyPlan = {
  date: new Date().toISOString().split('T')[0],
  marketBias: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
  keyLevels: [14950, 15000, 15050],
  dailyGoal: 'Performance test goal',
  mentalState: 'focused',
  notes: `Performance test plan ${Math.random().toString(36).substring(7)}`
};

// Base URL from environment
const BASE_URL = __ENV.TEST_API_URL || 'http://localhost:8000';

export function setup() {
  console.log('🚀 Starting Trading Journal API Performance Tests');
  console.log(`📍 Target URL: ${BASE_URL}`);
  
  // Health check before starting tests
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  check(healthCheck, {
    'API is healthy': (r) => r.status === 200,
  });
  
  if (healthCheck.status !== 200) {
    throw new Error('API health check failed');
  }
  
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const baseUrl = data.baseUrl;
  
  group('API Health Checks', () => {
    // Health endpoint
    const healthRes = http.get(`${baseUrl}/api/health`);
    const healthCheck = check(healthRes, {
      'health endpoint status is 200': (r) => r.status === 200,
      'health response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    errorRate.add(!healthCheck);
    responseTimeTrend.add(healthRes.timings.duration);
    
    if (healthCheck) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });
  
  group('Dashboard Data Loading', () => {
    // Dashboard endpoint
    const dashboardRes = http.get(`${baseUrl}/api/dashboard`);
    const dashboardCheck = check(dashboardRes, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500,
      'dashboard has required fields': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.hasOwnProperty('performanceMetrics');
        } catch {
          return false;
        }
      }
    });
    
    errorRate.add(!dashboardCheck);
    responseTimeTrend.add(dashboardRes.timings.duration);
    
    if (dashboardCheck) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });
  
  group('Statistics Calculation', () => {
    // Statistics endpoint with different timeframes
    const timeframes = ['1D', '1W', '1M', '3M'];
    const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
    
    const statsRes = http.get(`${baseUrl}/api/statistics?timeframe=${timeframe}`);
    const statsCheck = check(statsRes, {
      'statistics status is 200': (r) => r.status === 200,
      'statistics response time < 1000ms': (r) => r.timings.duration < 1000,
      'statistics has win_rate': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.hasOwnProperty('win_rate');
        } catch {
          return false;
        }
      }
    });
    
    errorRate.add(!statsCheck);
    responseTimeTrend.add(statsRes.timings.duration);
    
    if (statsCheck) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });
  
  group('Trade Operations', () => {
    // Create trade
    const createTradeRes = http.post(
      `${baseUrl}/api/trades`,
      JSON.stringify({
        ...testTradeData,
        entryTime: new Date().toISOString(),
        exitTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const createCheck = check(createTradeRes, {
      'create trade status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'create trade response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    errorRate.add(!createCheck);
    responseTimeTrend.add(createTradeRes.timings.duration);
    
    if (createCheck) {
      successfulRequests.add(1);
      
      // If trade creation successful, try to read it
      try {
        const tradeData = JSON.parse(createTradeRes.body);
        if (tradeData.id) {
          const readTradeRes = http.get(`${baseUrl}/api/trades/${tradeData.id}`);
          const readCheck = check(readTradeRes, {
            'read trade status is 200': (r) => r.status === 200,
            'read trade response time < 200ms': (r) => r.timings.duration < 200,
          });
          
          errorRate.add(!readCheck);
          responseTimeTrend.add(readTradeRes.timings.duration);
          
          if (readCheck) {
            successfulRequests.add(1);
          } else {
            failedRequests.add(1);
          }
        }
      } catch (e) {
        console.warn('Failed to parse trade creation response');
      }
    } else {
      failedRequests.add(1);
    }
    
    // List trades
    const listTradesRes = http.get(`${baseUrl}/api/trades?limit=20`);
    const listCheck = check(listTradesRes, {
      'list trades status is 200': (r) => r.status === 200,
      'list trades response time < 400ms': (r) => r.timings.duration < 400,
    });
    
    errorRate.add(!listCheck);
    responseTimeTrend.add(listTradesRes.timings.duration);
    
    if (listCheck) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });
  
  group('Planning Operations', () => {
    // Create daily plan
    const createPlanRes = http.post(
      `${baseUrl}/api/planning`,
      JSON.stringify(testDailyPlan),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const planCheck = check(createPlanRes, {
      'create plan status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'create plan response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    errorRate.add(!planCheck);
    responseTimeTrend.add(createPlanRes.timings.duration);
    
    if (planCheck) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });
  
  // Simulate user think time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

export function teardown(data) {
  console.log('🏁 Performance test completed');
  console.log(`📊 Base URL: ${data.baseUrl}`);
  
  // Final health check
  const finalHealthCheck = http.get(`${data.baseUrl}/api/health`);
  check(finalHealthCheck, {
    'API still healthy after test': (r) => r.status === 200,
  });
}

// Handle different test scenarios
export function spikeTest() {
  // Spike test configuration
  return {
    stages: [
      { duration: '1m', target: 10 },   // Baseline
      { duration: '30s', target: 100 }, // Spike to 100 users
      { duration: '1m', target: 10 },   // Back to baseline
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'], // More lenient during spike
      http_req_failed: ['rate<0.1'],     // Allow higher error rate
    }
  };
}

export function stressTest() {
  // Stress test configuration
  return {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '10m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.15'],
    }
  };
}

export function enduranceTest() {
  // Endurance test configuration
  return {
    stages: [
      { duration: '5m', target: 30 },
      { duration: '60m', target: 30 }, // Run for 1 hour
      { duration: '5m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.05'],
    }
  };
}
