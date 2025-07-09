// Global setup for E2E tests
// This runs once before all tests

import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Starting global E2E test setup...');
  
  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for application to be ready
    console.log('⏳ Waiting for application to be ready...');
    
    const maxRetries = 30;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        // Check if backend is ready
        const backendResponse = await fetch('http://localhost:8000/api/health');
        if (!backendResponse.ok) {
          throw new Error('Backend not ready');
        }
        
        // Check if frontend is ready
        const frontendResponse = await fetch('http://localhost:3000');
        if (!frontendResponse.ok) {
          throw new Error('Frontend not ready');
        }
        
        console.log('✅ Application is ready!');
        break;
        
      } catch (error) {
        retries++;
        console.log(`⏳ Attempt ${retries}/${maxRetries}: Waiting for application...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (retries >= maxRetries) {
          throw new Error('Application failed to start within timeout period');
        }
      }
    }
    
    // Navigate to application and perform any necessary setup
    await page.goto('http://localhost:3000');
    
    // Setup test data if needed
    await setupTestData(page);
    
    // Authenticate if required
    await authenticateUser(page);
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page) {
  console.log('📊 Setting up test data...');
  
  // Create some sample trades for testing
  const sampleTrades = [
    {
      symbol: 'NQ',
      setupType: 'MMXM_Breaker',
      entryPrice: 15000,
      exitPrice: 15025,
      positionSize: 1,
      outcome: 'win',
      profitLoss: 25,
      notes: 'E2E Test Trade 1'
    },
    {
      symbol: 'NQ',
      setupType: 'ICT_FVG',
      entryPrice: 15020,
      exitPrice: 15010,
      positionSize: 1,
      outcome: 'loss',
      profitLoss: -10,
      notes: 'E2E Test Trade 2'
    },
    {
      symbol: 'NQ',
      setupType: 'MMXM_Mitigation',
      entryPrice: 15005,
      exitPrice: 15035,
      positionSize: 2,
      outcome: 'win',
      profitLoss: 60,
      notes: 'E2E Test Trade 3'
    }
  ];
  
  // Create trades via API
  for (const trade of sampleTrades) {
    try {
      const response = await fetch('http://localhost:8000/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trade)
      });
      
      if (!response.ok) {
        console.warn(`Failed to create test trade: ${trade.notes}`);
      }
    } catch (error) {
      console.warn(`Error creating test trade: ${error.message}`);
    }
  }
  
  // Create a sample daily plan
  const samplePlan = {
    date: new Date().toISOString().split('T')[0],
    marketBias: 'bullish',
    keyLevels: [14950, 15000, 15050],
    dailyGoal: 'E2E Test - Focus on clean setups',
    riskParameters: {
      maxDailyLoss: 200,
      maxPositionSize: 2,
      riskPerTrade: 25
    },
    mentalState: 'focused',
    notes: 'E2E Test Daily Plan'
  };
  
  try {
    await fetch('http://localhost:8000/api/planning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(samplePlan)
    });
  } catch (error) {
    console.warn(`Error creating test plan: ${error.message}`);
  }
  
  console.log('✅ Test data setup completed');
}

async function authenticateUser(page) {
  console.log('🔐 Setting up authentication...');
  
  // If authentication is required, implement login here
  // For now, assuming no authentication or token-based auth
  
  try {
    // Check if login is required
    await page.goto('http://localhost:3000');
    
    // Look for login form
    const loginForm = await page.locator('[data-testid="login-form"]').count();
    
    if (loginForm > 0) {
      console.log('🔑 Login required, authenticating...');
      
      // Fill login form
      await page.fill('[data-testid="username-input"]', 'test_user');
      await page.fill('[data-testid="password-input"]', 'test_password');
      await page.click('[data-testid="login-button"]');
      
      // Wait for successful login
      await page.waitForURL('**/dashboard');
      console.log('✅ Authentication successful');
      
      // Store authentication state
      await page.context().storageState({ path: 'testing/auth-state.json' });
    } else {
      console.log('ℹ️  No authentication required');
    }
  } catch (error) {
    console.warn(`Authentication setup warning: ${error.message}`);
  }
}

export default globalSetup;
