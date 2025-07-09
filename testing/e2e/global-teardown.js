// Global teardown for E2E tests
// This runs once after all tests complete

async function globalTeardown() {
  console.log('🧹 Starting global E2E test teardown...');
  
  try {
    // Clean up test data
    await cleanupTestData();
    
    // Clear any temporary files
    await cleanupTempFiles();
    
    // Generate test summary
    await generateTestSummary();
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

async function cleanupTestData() {
  console.log('🗑️  Cleaning up test data...');
  
  try {
    // Clean up test trades
    const tradesResponse = await fetch('http://localhost:8000/api/trades?test_data=true');
    if (tradesResponse.ok) {
      const trades = await tradesResponse.json();
      
      for (const trade of trades.trades || []) {
        if (trade.notes && trade.notes.includes('E2E Test')) {
          await fetch(`http://localhost:8000/api/trades/${trade.id}`, {
            method: 'DELETE'
          });
        }
      }
    }
    
    // Clean up test plans
    const plansResponse = await fetch('http://localhost:8000/api/planning?test_data=true');
    if (plansResponse.ok) {
      const plans = await plansResponse.json();
      
      for (const plan of plans.plans || []) {
        if (plan.notes && plan.notes.includes('E2E Test')) {
          await fetch(`http://localhost:8000/api/planning/${plan.id}`, {
            method: 'DELETE'
          });
        }
      }
    }
    
    console.log('✅ Test data cleanup completed');
    
  } catch (error) {
    console.warn(`Test data cleanup warning: ${error.message}`);
  }
}

async function cleanupTempFiles() {
  console.log('📁 Cleaning up temporary files...');
  
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Clean up authentication state file
    const authStatePath = path.join(process.cwd(), 'testing/auth-state.json');
    try {
      await fs.unlink(authStatePath);
    } catch (error) {
      // File might not exist, which is fine
    }
    
    // Clean up any temporary screenshots or videos from failed tests
    const artifactsDir = path.join(process.cwd(), 'testing/reports/e2e-artifacts');
    try {
      const files = await fs.readdir(artifactsDir);
      
      // Keep only the most recent artifacts (last 5 test runs)
      const artifacts = files
        .filter(file => file.includes('test-'))
        .sort()
        .reverse()
        .slice(5); // Remove all but the 5 most recent
      
      for (const artifact of artifacts) {
        await fs.unlink(path.join(artifactsDir, artifact));
      }
    } catch (error) {
      // Directory might not exist
    }
    
    console.log('✅ Temporary files cleanup completed');
    
  } catch (error) {
    console.warn(`Temporary files cleanup warning: ${error.message}`);
  }
}

async function generateTestSummary() {
  console.log('📋 Generating test summary...');
  
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Read test results if available
    const resultsPath = path.join(process.cwd(), 'testing/reports/e2e-results.json');
    let testResults = null;
    
    try {
      const resultsData = await fs.readFile(resultsPath, 'utf8');
      testResults = JSON.parse(resultsData);
    } catch (error) {
      console.log('No test results file found');
    }
    
    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      environment: {
        baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
        apiUrl: process.env.TEST_API_URL || 'http://localhost:8000',
        ci: !!process.env.CI
      },
      results: testResults ? {
        totalTests: testResults.stats?.total || 0,
        passed: testResults.stats?.expected || 0,
        failed: testResults.stats?.unexpected || 0,
        skipped: testResults.stats?.skipped || 0,
        duration: testResults.stats?.duration || 0
      } : null,
      cleanup: {
        testDataCleaned: true,
        tempFilesCleaned: true
      }
    };
    
    // Write summary to file
    const summaryPath = path.join(process.cwd(), 'testing/reports/e2e-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    // Log summary to console
    console.log('📊 Test Run Summary:');
    if (summary.results) {
      console.log(`   Total Tests: ${summary.results.totalTests}`);
      console.log(`   Passed: ${summary.results.passed}`);
      console.log(`   Failed: ${summary.results.failed}`);
      console.log(`   Skipped: ${summary.results.skipped}`);
      console.log(`   Duration: ${Math.round(summary.results.duration / 1000)}s`);
    }
    console.log(`   Environment: ${summary.environment.ci ? 'CI' : 'Local'}`);
    console.log(`   Summary saved to: ${summaryPath}`);
    
    console.log('✅ Test summary generated');
    
  } catch (error) {
    console.warn(`Test summary generation warning: ${error.message}`);
  }
}

export default globalTeardown;
