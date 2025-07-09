# 🧪 Testing Guide for MCP-Enhanced Trading Journal

Welcome to the comprehensive testing guide for the Trading Journal application. This document provides everything you need to know about testing the application effectively.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Architecture](#testing-architecture)
3. [Test Types](#test-types)
4. [Running Tests](#running-tests)
5. [Test Configuration](#test-configuration)
6. [Writing Tests](#writing-tests)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for integration tests)
- Git

### Setup

1. **Make the test runner executable:**
   ```bash
   chmod +x run_tests.sh
   ```

2. **Run the quick test suite:**
   ```bash
   ./run_tests.sh --quick
   ```

3. **Run all tests:**
   ```bash
   ./run_tests.sh --full
   ```

### Most Common Commands

```bash
# Quick tests (backend + frontend unit tests)
./run_tests.sh --quick

# Backend tests only
./run_tests.sh --backend

# Frontend tests only
./run_tests.sh --frontend

# Integration tests
./run_tests.sh --integration

# End-to-end tests
./run_tests.sh --e2e

# Performance tests
./run_tests.sh --performance

# Security tests
./run_tests.sh --security

# Setup test environment only
./run_tests.sh --setup
```

## 🏗️ Testing Architecture

Our testing strategy follows a comprehensive multi-layer approach:

```
┌─────────────────────────────────────────┐
│              End-to-End Tests           │
│         (Playwright, Real Browser)      │
├─────────────────────────────────────────┤
│            Integration Tests            │
│        (API + Frontend + MCP)           │
├─────────────────────────────────────────┤
│  Frontend Tests     │   Backend Tests   │
│  (React Testing     │   (pytest,        │
│   Library, Vitest)  │    FastAPI)       │
├─────────────────────┼───────────────────┤
│  Component Tests    │   MCP Server      │
│  (Mock APIs)        │   Tests           │
├─────────────────────┼───────────────────┤
│     Unit Tests      │   Database        │
│  (Individual        │   Tests           │
│   Functions)        │                   │
└─────────────────────┴───────────────────┘
```

### Key Components

- **Backend Tests**: Python/pytest for API and business logic
- **Frontend Tests**: Vitest/React Testing Library for components
- **MCP Tests**: Custom testing framework for MCP servers
- **Integration Tests**: Full API + Frontend integration
- **E2E Tests**: Playwright for user workflow testing
- **Performance Tests**: K6 for API, Lighthouse for frontend
- **Security Tests**: OWASP ZAP, Bandit, Safety

## 🔍 Test Types

### 1. Unit Tests

**Backend Unit Tests** (`backend/tests/`)
- Test individual functions and classes
- Mock external dependencies
- Fast execution (< 1 second per test)

```python
# Example: backend/tests/test_trade_service.py
def test_calculate_profit_loss():
    trade = Trade(entry_price=100, exit_price=110, position_size=1)
    result = calculate_profit_loss(trade)
    assert result == 10
```

**Frontend Unit Tests** (`frontend-new/src/test/`)
- Test individual components
- Mock API calls with MSW
- Test user interactions

```javascript
// Example: component test
test('renders trade form with required fields', () => {
  render(<TradeForm />);
  expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument();
});
```

### 2. Integration Tests

**API Integration** (`testing/integration/`)
- Test complete API workflows
- Real database interactions
- Multiple endpoint coordination

```python
def test_trade_creation_workflow(client):
    # Create trade
    response = client.post("/api/trades", json=trade_data)
    assert response.status_code == 201
    
    # Verify statistics updated
    stats = client.get("/api/statistics")
    assert stats.json()["total_trades"] > 0
```

**MCP Integration** (`backend/mcp/tests/`)
- Test MCP server functionality
- JSON-RPC protocol compliance
- Cross-server communication

### 3. End-to-End Tests

**User Workflows** (`testing/e2e/`)
- Complete user journeys
- Real browser automation
- Visual regression testing

```javascript
test('complete trading session workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  
  // Create daily plan
  await page.goto('/planning');
  await page.fill('[data-testid="market-bias"]', 'bullish');
  
  // Add trades
  await page.goto('/trades/new');
  // ... rest of workflow
});
```

### 4. Performance Tests

**API Performance** (`testing/performance/api-load-test.js`)
- Load testing with K6
- Response time monitoring
- Concurrent user simulation

**Frontend Performance** (`testing/performance/frontend-performance-test.js`)
- Core Web Vitals measurement
- Lighthouse auditing
- Performance budgets

### 5. Security Tests

- Vulnerability scanning
- Input validation testing
- Authentication/authorization testing
- OWASP compliance

## ▶️ Running Tests

### Local Development

```bash
# Setup test environment
./run_tests.sh --setup

# Run specific test types
./run_tests.sh --backend --frontend
./run_tests.sh --integration --e2e

# Run with specific options
./run_tests.sh --quick  # Fast tests only
./run_tests.sh --full   # All tests including performance/security
```

### Docker-based Testing

```bash
# Run tests in isolated containers
docker-compose -f docker-compose.test.yml up --build

# Run specific test profiles
docker-compose -f docker-compose.test.yml --profile test up
docker-compose -f docker-compose.test.yml --profile performance up
docker-compose -f docker-compose.test.yml --profile security up
```

### Individual Test Commands

**Backend Tests:**
```bash
# All backend tests
pytest backend/tests/ -v

# Specific test file
pytest backend/tests/test_api.py -v

# With coverage
pytest backend/tests/ --cov=backend --cov-report=html

# MCP tests
pytest backend/mcp/tests/ -v
```

**Frontend Tests:**
```bash
cd frontend-new

# All frontend tests
npm run test:run

# Watch mode for development
npm test

# With coverage
npm run test:coverage

# Specific test file
npm test -- TradeForm.test.jsx
```

**E2E Tests:**
```bash
# All E2E tests
npx playwright test

# Specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui
```

### Performance Tests

**API Performance:**
```bash
# Basic load test
k6 run testing/performance/api-load-test.js

# Stress test
k6 run testing/performance/api-load-test.js --env TEST_TYPE=stress

# Spike test
k6 run testing/performance/api-load-test.js --env TEST_TYPE=spike
```

**Frontend Performance:**
```bash
cd frontend-new
node ../testing/performance/frontend-performance-test.js
```

## ⚙️ Test Configuration

### Environment Variables

```bash
# Test environment
export TESTING=1
export NODE_ENV=test

# Database
export DATABASE_URL="sqlite:///test.db"
export TEST_DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_db"

# API URLs
export TEST_BASE_URL="http://localhost:3000"
export TEST_API_URL="http://localhost:8000"

# Test timeouts
export TEST_TIMEOUT=30000
export API_TIMEOUT=10000
```

### Configuration Files

**Backend: `pytest.ini`**
```ini
[tool:pytest]
testpaths = backend/tests backend/mcp/tests testing/integration
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

**Frontend: `vitest.config.js`**
```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

**E2E: `playwright.config.js`**
```javascript
export default defineConfig({
  testDir: './testing/e2e',
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
```

## ✍️ Writing Tests

### Test Data Management

**Using Factories:**
```python
from testing.factories.test_data_factories import TradeFactory, UserFactory

# Create test data
user = UserFactory()
trade = TradeFactory(user_id=user['id'])

# Create realistic trading session
session = create_realistic_trading_session(user_id=user['id'])
```

**Using Test Utilities:**
```python
from testing.test_utilities import TestEnvironment

def test_with_environment():
    env = TestEnvironment()
    components = env.setup()
    
    try:
        # Use test components
        api_client = components['api_client']
        data_manager = components['data_manager']
        
        # Run tests
        trade = data_manager.create_test_trade()
        response = api_client.get(f"/api/trades/{trade['id']}")
        
        assert response.status_code == 200
        
    finally:
        env.teardown()
```

### Mocking API Calls (Frontend)

```javascript
import { server, mockApiError } from '../test/mocks/api';

beforeEach(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

test('handles API errors gracefully', async () => {
  // Mock API error
  mockApiError('/api/trades', 500, 'Server error');
  
  render(<TradesList />);
  
  await waitFor(() => {
    expect(screen.getByText(/error loading trades/i)).toBeInTheDocument();
  });
});
```

### Testing MCP Servers

```python
import pytest
from backend.mcp.servers.trade_analysis_server import TradeAnalysisServer

@pytest.mark.asyncio
async def test_trade_analysis():
    server = TradeAnalysisServer()
    
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "analyze_trade",
        "params": {"trade_data": sample_trade_data}
    }
    
    response = await server.handle_request(request)
    
    assert response["jsonrpc"] == "2.0"
    assert "result" in response
    assert response["result"]["setup_quality"] in ["poor", "fair", "good", "excellent"]
```

### Performance Testing Guidelines

**API Performance:**
```javascript
// K6 test structure
export default function() {
  group('Trade Operations', () => {
    // Test trade creation
    const response = http.post(`${BASE_URL}/api/trades`, JSON.stringify(tradeData));
    
    check(response, {
      'status is 201': (r) => r.status === 201,
      'response time < 300ms': (r) => r.timings.duration < 300
    });
  });
}
```

**Frontend Performance:**
```javascript
// Lighthouse testing
test('dashboard performance', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Run Lighthouse audit
  const result = await lighthouse(page.url());
  
  expect(result.categories.performance.score).toBeGreaterThan(0.9);
});
```

## 🔄 CI/CD Integration

### GitHub Actions

Our comprehensive testing workflow (`.github/workflows/comprehensive-testing.yml`) includes:

1. **Code validation** (linting, formatting, security)
2. **Backend tests** (unit, integration, MCP)
3. **Frontend tests** (unit, component, accessibility)
4. **Integration tests** (API + Frontend)
5. **E2E tests** (user workflows)
6. **Performance tests** (load testing, Core Web Vitals)
7. **Security tests** (vulnerability scanning)

### Triggering Tests

```bash
# Manual trigger with specific test suite
gh workflow run comprehensive-testing.yml -f test_suite=quick

# Manual trigger for E2E only
gh workflow run comprehensive-testing.yml -f test_suite=e2e

# All tests (default on PR/push)
gh workflow run comprehensive-testing.yml -f test_suite=all
```

### Quality Gates

Tests must pass these thresholds:

- **Code Coverage**: >90% backend, >85% frontend
- **Performance**: API <200ms (95th percentile), LCP <2.5s
- **Security**: No high/critical vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliance

## 🔧 Troubleshooting

### Common Issues

**1. Tests timing out**
```bash
# Increase timeout
export TEST_TIMEOUT=60000

# Check if services are running
curl http://localhost:8000/api/health
curl http://localhost:3000
```

**2. Database connection issues**
```bash
# Reset test database
rm test.db
python backend/db/migrate.py

# Check PostgreSQL connection
psql -h localhost -U test_user -d trading_journal_test
```

**3. Frontend tests failing**
```bash
# Clear cache
npm test -- --clearCache

# Update snapshots
npm test -- --updateSnapshot

# Check for async issues
npm test -- --verbose
```

**4. E2E tests flaky**
```bash
# Run in headed mode to debug
npx playwright test --headed

# Generate trace for failed tests
npx playwright test --trace on

# Use debug mode
npx playwright test --debug
```

**5. Performance tests inconsistent**
```bash
# Check system resources
top
htop

# Run single user test first
k6 run testing/performance/api-load-test.js --vus 1 --duration 30s

# Check for background processes
ps aux | grep node
ps aux | grep python
```

### Debug Mode

**Enable verbose logging:**
```bash
export LOG_LEVEL=DEBUG
export PLAYWRIGHT_DEBUG=1
export K6_LOG_LEVEL=debug
```

**Run specific failing test:**
```bash
# Backend
pytest backend/tests/test_specific.py::test_failing_function -v -s

# Frontend
npm test -- --testNamePattern="failing test name" --verbose

# E2E
npx playwright test "failing test name" --debug
```

### Getting Help

1. **Check test logs** in `testing/reports/`
2. **Review GitHub Actions** logs for CI failures
3. **Check Docker logs** for containerized tests
4. **Run health checks** on all services
5. **Verify test data** setup and cleanup

### Performance Optimization

**Speed up tests:**
```bash
# Run tests in parallel
pytest -n auto backend/tests/

# Use faster database for tests
export TEST_DATABASE_URL="sqlite:///test.db"

# Skip slow tests during development
pytest -m "not slow" backend/tests/
```

**Reduce test overhead:**
```bash
# Use test containers
export USE_TEST_CONTAINERS=1

# Disable coverage during development
pytest backend/tests/ --no-cov

# Use headless mode for E2E
npx playwright test --project=chromium-headless
```

## 📊 Test Reports

Test reports are generated in `testing/reports/`:

- **Backend Coverage**: `htmlcov/index.html`
- **Frontend Coverage**: `frontend-new/coverage/index.html`
- **E2E Results**: `playwright-report/index.html`
- **Performance Results**: `performance-report.html`
- **Security Scan**: `security-*.json`

### Viewing Reports

```bash
# Open coverage reports
open testing/reports/htmlcov/index.html
open frontend-new/coverage/index.html

# View E2E report
npx playwright show-report

# View performance report
open testing/reports/performance-report.html
```

## 🎯 Best Practices

### Test Organization

1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** - no shared state
5. **Use proper test data** - factories for realistic data

### Naming Conventions

```bash
# Test files
test_trade_service.py          # Backend unit tests
TradeForm.test.jsx            # Frontend component tests
test_trade_integration.py     # Integration tests
trading-workflow.spec.js      # E2E tests
```

### Test Data

```python
# Good: Use factories
trade = TradeFactory(symbol='NQ', outcome='win')

# Bad: Hardcoded data
trade = {'symbol': 'NQ', 'entry_price': 15000, ...}
```

### Assertions

```python
# Good: Specific assertions
assert response.status_code == 201
assert trade['symbol'] == 'NQ'
assert len(trades) == 5

# Bad: Generic assertions
assert response.ok
assert trade
assert trades
```

### Clean Up

```python
# Always clean up test data
@pytest.fixture
def test_trade(data_manager):
    trade = data_manager.create_test_trade()
    yield trade
    data_manager.cleanup()
```

This comprehensive testing guide ensures your Trading Journal application maintains high quality, performance, and reliability throughout development and deployment.

Happy Testing! 🧪✨
