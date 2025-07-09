// End-to-End Tests for Trading Journal Application
// Using Playwright for browser automation and testing

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:8000';

// Test data
const testTradeData = {
  symbol: 'NQ',
  setupType: 'MMXM_Breaker',
  entryPrice: '15000',
  exitPrice: '15025',
  positionSize: '1',
  outcome: 'win',
  notes: 'Clean breakout setup for E2E test'
};

const testDailyPlan = {
  marketBias: 'bullish',
  keyLevels: '14950, 15000, 15050',
  dailyGoal: 'Focus on clean breakout setups',
  riskParameters: 'Max loss: $200, Position size: 2 contracts',
  mentalState: 'focused',
  notes: 'Market showing strong bullish momentum - E2E test'
};

// Setup and teardown
test.beforeEach(async ({ page }) => {
  // Navigate to the application
  await page.goto(BASE_URL);
  
  // Wait for the application to load
  await page.waitForLoadState('networkidle');
  
  // Handle any authentication if required
  // This would need to be implemented based on your auth system
});

test.describe('Trading Journal E2E Tests', () => {
  
  test.describe('Dashboard Functionality', () => {
    
    test('should display dashboard with performance metrics', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for dashboard to load
      await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
      
      // Check for key performance metrics
      await expect(page.locator('text=Total Trades')).toBeVisible();
      await expect(page.locator('text=Win Rate')).toBeVisible();
      await expect(page.locator('text=Profit/Loss')).toBeVisible();
      await expect(page.locator('text=Avg Win')).toBeVisible();
      
      // Check for charts/visualizations
      await expect(page.locator('[data-testid="equity-curve-chart"]')).toBeVisible();
    });
    
    test('should allow timeframe selection', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('[data-testid="timeframe-selector"]');
      
      // Test different timeframe selections
      const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y'];
      
      for (const timeframe of timeframes) {
        await page.click(`text=${timeframe}`);
        
        // Wait for data to update
        await page.waitForTimeout(1000);
        
        // Verify timeframe is selected
        await expect(page.locator(`[data-testid="timeframe-${timeframe}"]`)).toHaveClass(/selected|active/);
      }
    });
    
    test('should display quick actions and allow trade creation', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Click Quick Add Trade button
      await page.click('[data-testid="quick-add-trade"]');
      
      // Should open trade form or navigate to trade entry page
      await expect(page.locator('text=Add New Trade')).toBeVisible();
    });
    
    test('should show market status and upcoming events', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Check for market status indicator
      await expect(page.locator('[data-testid="market-status"]')).toBeVisible();
      
      // Check for upcoming events section
      await expect(page.locator('[data-testid="upcoming-events"]')).toBeVisible();
    });
    
  });
  
  test.describe('Trade Management Workflow', () => {
    
    test('should complete full trade entry workflow', async ({ page }) => {
      // Navigate to trade entry page
      await page.goto(`${BASE_URL}/trades/new`);
      
      // Fill out trade form
      await page.fill('[data-testid="symbol-input"]', testTradeData.symbol);
      await page.selectOption('[data-testid="setup-type-select"]', testTradeData.setupType);
      await page.fill('[data-testid="entry-price-input"]', testTradeData.entryPrice);
      await page.fill('[data-testid="exit-price-input"]', testTradeData.exitPrice);
      await page.fill('[data-testid="position-size-input"]', testTradeData.positionSize);
      await page.selectOption('[data-testid="outcome-select"]', testTradeData.outcome);
      await page.fill('[data-testid="notes-textarea"]', testTradeData.notes);
      
      // Set entry and exit times
      await page.fill('[data-testid="entry-time-input"]', '09:30');
      await page.fill('[data-testid="exit-time-input"]', '10:00');
      
      // Submit the trade
      await page.click('[data-testid="submit-trade-button"]');
      
      // Should show success message
      await expect(page.locator('text=Trade saved successfully')).toBeVisible();
      
      // Should redirect to trades list or dashboard
      await page.waitForURL(/\/(trades|dashboard)/);
    });
    
    test('should validate required fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/trades/new`);
      
      // Try to submit without filling required fields
      await page.click('[data-testid="submit-trade-button"]');
      
      // Should show validation errors
      await expect(page.locator('text=Symbol is required')).toBeVisible();
      await expect(page.locator('text=Setup type is required')).toBeVisible();
      await expect(page.locator('text=Entry price is required')).toBeVisible();
    });
    
    test('should calculate profit/loss automatically', async ({ page }) => {
      await page.goto(`${BASE_URL}/trades/new`);
      
      // Fill entry and exit prices
      await page.fill('[data-testid="entry-price-input"]', '15000');
      await page.fill('[data-testid="exit-price-input"]', '15025');
      await page.fill('[data-testid="position-size-input"]', '1');
      
      // Profit/Loss should be calculated automatically
      const profitLossValue = await page.inputValue('[data-testid="profit-loss-input"]');
      expect(profitLossValue).toBe('25');
    });
    
    test('should allow trade editing and deletion', async ({ page }) => {
      // First create a trade
      await page.goto(`${BASE_URL}/trades/new`);
      
      // Fill and submit trade form
      await page.fill('[data-testid="symbol-input"]', testTradeData.symbol);
      await page.selectOption('[data-testid="setup-type-select"]', testTradeData.setupType);
      await page.fill('[data-testid="entry-price-input"]', testTradeData.entryPrice);
      await page.fill('[data-testid="exit-price-input"]', testTradeData.exitPrice);
      await page.fill('[data-testid="position-size-input"]', testTradeData.positionSize);
      await page.selectOption('[data-testid="outcome-select"]', testTradeData.outcome);
      await page.click('[data-testid="submit-trade-button"]');
      
      // Navigate to trades list
      await page.goto(`${BASE_URL}/trades`);
      
      // Find the created trade and click edit
      await page.click('[data-testid="edit-trade-button"]:first-child');
      
      // Modify the trade
      await page.fill('[data-testid="notes-textarea"]', 'Updated notes from E2E test');
      await page.click('[data-testid="submit-trade-button"]');
      
      // Should show success message
      await expect(page.locator('text=Trade updated successfully')).toBeVisible();
      
      // Test deletion
      await page.goto(`${BASE_URL}/trades`);
      await page.click('[data-testid="delete-trade-button"]:first-child');
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Should show success message
      await expect(page.locator('text=Trade deleted successfully')).toBeVisible();
    });
    
  });
  
  test.describe('Pre-Market Planning Workflow', () => {
    
    test('should complete daily planning workflow', async ({ page }) => {
      await page.goto(`${BASE_URL}/planning`);
      
      // Fill out daily plan form
      await page.selectOption('[data-testid="market-bias-select"]', testDailyPlan.marketBias);
      await page.fill('[data-testid="key-levels-input"]', testDailyPlan.keyLevels);
      await page.fill('[data-testid="daily-goal-textarea"]', testDailyPlan.dailyGoal);
      await page.fill('[data-testid="risk-parameters-textarea"]', testDailyPlan.riskParameters);
      await page.selectOption('[data-testid="mental-state-select"]', testDailyPlan.mentalState);
      await page.fill('[data-testid="notes-textarea"]', testDailyPlan.notes);
      
      // Submit the plan
      await page.click('[data-testid="submit-plan-button"]');
      
      // Should show success message
      await expect(page.locator('text=Daily plan saved successfully')).toBeVisible();
    });
    
    test('should integrate with market data', async ({ page }) => {
      await page.goto(`${BASE_URL}/planning`);
      
      // Check for market data integration
      await expect(page.locator('[data-testid="current-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="market-sentiment"]')).toBeVisible();
      
      // Test key level suggestions
      await page.click('[data-testid="suggest-levels-button"]');
      
      // Should populate key levels automatically
      const keyLevelsInput = await page.inputValue('[data-testid="key-levels-input"]');
      expect(keyLevelsInput.length).toBeGreaterThan(0);
    });
    
  });
  
  test.describe('Statistics and Analytics', () => {
    
    test('should display comprehensive statistics', async ({ page }) => {
      await page.goto(`${BASE_URL}/statistics`);
      
      // Check for key statistics
      await expect(page.locator('text=Win Rate')).toBeVisible();
      await expect(page.locator('text=Profit Factor')).toBeVisible();
      await expect(page.locator('text=Sharpe Ratio')).toBeVisible();
      await expect(page.locator('text=Max Drawdown')).toBeVisible();
      
      // Check for charts
      await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="setup-breakdown-chart"]')).toBeVisible();
    });
    
    test('should allow filtering by date range', async ({ page }) => {
      await page.goto(`${BASE_URL}/statistics`);
      
      // Open date range picker
      await page.click('[data-testid="date-range-picker"]');
      
      // Select custom date range
      await page.click('[data-testid="start-date-input"]');
      await page.fill('[data-testid="start-date-input"]', '2024-01-01');
      
      await page.click('[data-testid="end-date-input"]');
      await page.fill('[data-testid="end-date-input"]', '2024-01-31');
      
      await page.click('[data-testid="apply-filter-button"]');
      
      // Statistics should update
      await page.waitForTimeout(2000);
      
      // Verify filter is applied
      await expect(page.locator('text=January 2024')).toBeVisible();
    });
    
    test('should allow chart type switching', async ({ page }) => {
      await page.goto(`${BASE_URL}/statistics`);
      
      // Test switching between chart types
      const chartTypes = ['line', 'bar', 'area'];
      
      for (const chartType of chartTypes) {
        await page.selectOption('[data-testid="chart-type-selector"]', chartType);
        
        // Chart should update
        await page.waitForTimeout(1000);
        
        // Verify chart type
        await expect(page.locator(`[data-chart-type="${chartType}"]`)).toBeVisible();
      }
    });
    
    test('should export statistics data', async ({ page }) => {
      await page.goto(`${BASE_URL}/statistics`);
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-data-button"]');
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('statistics');
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|json)$/);
    });
    
  });
  
  test.describe('TradeSage AI Assistant', () => {
    
    test('should interact with AI assistant', async ({ page }) => {
      await page.goto(`${BASE_URL}/tradesage`);
      
      // Send message to TradeSage
      const testMessage = 'How can I improve my trading performance?';
      await page.fill('[data-testid="chat-input"]', testMessage);
      await page.click('[data-testid="send-message-button"]');
      
      // Should show typing indicator
      await expect(page.locator('text=TradeSage is typing')).toBeVisible();
      
      // Should receive response
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 10000 });
      
      // Response should contain advice
      const responseText = await page.locator('[data-testid="ai-response"]').textContent();
      expect(responseText.length).toBeGreaterThan(50);
    });
    
    test('should maintain conversation history', async ({ page }) => {
      await page.goto(`${BASE_URL}/tradesage`);
      
      // Send multiple messages
      const messages = [
        'What are my best performing setups?',
        'How is my risk management?',
        'Any patterns in my losing trades?'
      ];
      
      for (const message of messages) {
        await page.fill('[data-testid="chat-input"]', message);
        await page.click('[data-testid="send-message-button"]');
        
        // Wait for response
        await page.waitForSelector('[data-testid="ai-response"]', { timeout: 10000 });
        
        // Clear input for next message
        await page.fill('[data-testid="chat-input"]', '');
      }
      
      // All messages should be visible in chat history
      for (const message of messages) {
        await expect(page.locator(`text=${message}`)).toBeVisible();
      }
    });
    
    test('should handle AI errors gracefully', async ({ page }) => {
      // Mock AI service failure by intercepting API calls
      await page.route('**/api/tradesage/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'AI service unavailable' })
        });
      });
      
      await page.goto(`${BASE_URL}/tradesage`);
      
      await page.fill('[data-testid="chat-input"]', 'Test message');
      await page.click('[data-testid="send-message-button"]');
      
      // Should show error message
      await expect(page.locator('text=Sorry, I\'m having trouble')).toBeVisible();
    });
    
  });
  
  test.describe('Navigation and User Experience', () => {
    
    test('should navigate between all major sections', async ({ page }) => {
      const sections = [
        { name: 'Dashboard', url: '/dashboard', text: 'Performance Metrics' },
        { name: 'Trades', url: '/trades', text: 'Trade History' },
        { name: 'Planning', url: '/planning', text: 'Daily Plan' },
        { name: 'Statistics', url: '/statistics', text: 'Trading Statistics' },
        { name: 'TradeSage', url: '/tradesage', text: 'AI Assistant' }
      ];
      
      for (const section of sections) {
        await page.goto(`${BASE_URL}${section.url}`);
        
        // Verify page loads correctly
        await expect(page.locator(`text=${section.text}`)).toBeVisible();
        
        // Check for proper navigation highlighting
        await expect(page.locator(`[data-testid="nav-${section.name.toLowerCase()}"]`)).toHaveClass(/active|current/);
      }
    });
    
    test('should be responsive on different screen sizes', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Mobile menu should be visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Click mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);
      
      // Desktop navigation should be visible
      await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
    });
    
    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/trades/new`);
      
      // Test tab navigation through form fields
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="symbol-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="setup-type-select"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="entry-price-input"]')).toBeFocused();
    });
    
  });
  
  test.describe('Data Persistence and Sync', () => {
    
    test('should persist data across browser sessions', async ({ page, context }) => {
      // Create a trade
      await page.goto(`${BASE_URL}/trades/new`);
      
      await page.fill('[data-testid="symbol-input"]', 'NQ');
      await page.selectOption('[data-testid="setup-type-select"]', 'MMXM_Breaker');
      await page.fill('[data-testid="entry-price-input"]', '15000');
      await page.fill('[data-testid="exit-price-input"]', '15025');
      await page.fill('[data-testid="position-size-input"]', '1');
      await page.selectOption('[data-testid="outcome-select"]', 'win');
      await page.fill('[data-testid="notes-textarea"]', 'Persistence test trade');
      
      await page.click('[data-testid="submit-trade-button"]');
      
      // Wait for success
      await expect(page.locator('text=Trade saved successfully')).toBeVisible();
      
      // Close browser and create new context
      await context.close();
      const newContext = await page.context().browser().newContext();
      const newPage = await newContext.newPage();
      
      // Navigate to trades list
      await newPage.goto(`${BASE_URL}/trades`);
      
      // Trade should still be there
      await expect(newPage.locator('text=Persistence test trade')).toBeVisible();
      
      await newContext.close();
    });
    
    test('should handle offline scenarios', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Simulate going offline
      await page.context().setOffline(true);
      
      // Try to navigate or perform actions
      await page.click('[data-testid="refresh-data-button"]');
      
      // Should show offline message
      await expect(page.locator('text=You appear to be offline')).toBeVisible();
      
      // Go back online
      await page.context().setOffline(false);
      
      // Data should sync
      await page.click('[data-testid="refresh-data-button"]');
      await expect(page.locator('text=Data synchronized')).toBeVisible();
    });
    
  });
  
  test.describe('Performance and Load Testing', () => {
    
    test('should load pages within performance budget', async ({ page }) => {
      const performanceTargets = {
        '/dashboard': 3000,    // 3 seconds
        '/trades': 2000,       // 2 seconds
        '/statistics': 4000,   // 4 seconds (charts take longer)
        '/planning': 2000,     // 2 seconds
        '/tradesage': 2000     // 2 seconds
      };
      
      for (const [route, targetTime] of Object.entries(performanceTargets)) {
        const startTime = Date.now();
        await page.goto(`${BASE_URL}${route}`);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(targetTime);
      }
    });
    
    test('should handle large datasets efficiently', async ({ page }) => {
      // Navigate to trades with a large dataset
      await page.goto(`${BASE_URL}/trades?limit=1000`);
      
      // Should load within reasonable time
      await page.waitForSelector('[data-testid="trades-table"]', { timeout: 10000 });
      
      // Should support virtual scrolling or pagination
      const tradesTable = page.locator('[data-testid="trades-table"]');
      await expect(tradesTable).toBeVisible();
      
      // Scroll performance test
      const startTime = Date.now();
      await page.mouse.wheel(0, 5000);
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - startTime;
      
      // Scrolling should be smooth (less than 500ms)
      expect(scrollTime).toBeLessThan(500);
    });
    
  });
  
  test.describe('Error Scenarios and Edge Cases', () => {
    
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Should show error message
      await expect(page.locator('text=Something went wrong')).toBeVisible();
      
      // Should offer retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });
    
    test('should handle network timeouts', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
        route.continue();
      });
      
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Should show loading state initially
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // Should eventually show timeout error
      await expect(page.locator('text=Request timed out')).toBeVisible({ timeout: 35000 });
    });
    
    test('should validate form inputs comprehensively', async ({ page }) => {
      await page.goto(`${BASE_URL}/trades/new`);
      
      // Test various invalid inputs
      const invalidInputs = [
        { field: 'entry-price-input', value: 'abc', error: 'Invalid price format' },
        { field: 'position-size-input', value: '-1', error: 'Position size must be positive' },
        { field: 'symbol-input', value: '12345', error: 'Invalid symbol format' }
      ];
      
      for (const { field, value, error } of invalidInputs) {
        await page.fill(`[data-testid="${field}"]`, value);
        await page.click('[data-testid="submit-trade-button"]');
        
        await expect(page.locator(`text=${error}`)).toBeVisible();
        
        // Clear the field for next test
        await page.fill(`[data-testid="${field}"]`, '');
      }
    });
    
  });
  
});

// Visual regression tests
test.describe('Visual Regression Tests', () => {
  
  test('should match dashboard screenshot', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements (timestamps, random data)
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        [data-testid="current-time"],
        [data-testid="live-price"] {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('dashboard.png');
  });
  
  test('should match trade form screenshot', async ({ page }) => {
    await page.goto(`${BASE_URL}/trades/new`);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('trade-form.png');
  });
  
  test('should match statistics page screenshot', async ({ page }) => {
    await page.goto(`${BASE_URL}/statistics`);
    await page.waitForLoadState('networkidle');
    
    // Wait for charts to render
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('statistics.png');
  });
  
});
