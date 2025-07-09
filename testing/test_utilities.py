#!/usr/bin/env python3
"""
Test utilities and helpers for the Trading Journal application
"""

import asyncio
import json
import os
import tempfile
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from unittest.mock import Mock, AsyncMock
import pytest
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test database utilities
class TestDatabase:
    """Utility class for managing test databases"""
    
    def __init__(self, db_url: str = None):
        self.db_url = db_url or "sqlite:///test.db"
        self.engine = None
        self.session_factory = None
        self.temp_files = []
    
    def setup(self):
        """Setup test database"""
        if self.db_url.startswith("sqlite"):
            # Create temporary file for SQLite
            db_fd, db_path = tempfile.mkstemp(suffix='.db')
            os.close(db_fd)
            self.temp_files.append(db_path)
            self.db_url = f"sqlite:///{db_path}"
        
        self.engine = create_engine(self.db_url, echo=False)
        self.session_factory = sessionmaker(bind=self.engine)
        
        # Create tables
        self._create_tables()
        
        return self.session_factory()
    
    def _create_tables(self):
        """Create database tables"""
        try:
            from backend.models import Base
            Base.metadata.create_all(self.engine)
        except ImportError:
            # Handle case where models might not be available
            pass
    
    def cleanup(self):
        """Clean up test database"""
        if self.engine:
            self.engine.dispose()
        
        for temp_file in self.temp_files:
            try:
                os.unlink(temp_file)
            except OSError:
                pass
    
    def populate_test_data(self, session):
        """Populate database with test data"""
        from testing.factories.test_data_factories import (
            create_test_user_with_history,
            create_realistic_trading_session
        )
        
        # Create test user with trading history
        user_data = create_test_user_with_history('intermediate', 'good')
        
        # Add user to database (implementation depends on your ORM)
        # This is a placeholder - adjust based on your actual models
        return user_data


class APITestClient:
    """Enhanced test client for API testing"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.auth_token = None
    
    def authenticate(self, username: str = "test_user", password: str = "test_password"):
        """Authenticate with the API"""
        response = self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"username": username, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data.get("access_token")
            self.session.headers.update({
                "Authorization": f"Bearer {self.auth_token}"
            })
        
        return response
    
    def get(self, endpoint: str, **kwargs):
        """GET request with automatic base URL"""
        return self.session.get(f"{self.base_url}{endpoint}", **kwargs)
    
    def post(self, endpoint: str, **kwargs):
        """POST request with automatic base URL"""
        return self.session.post(f"{self.base_url}{endpoint}", **kwargs)
    
    def put(self, endpoint: str, **kwargs):
        """PUT request with automatic base URL"""
        return self.session.put(f"{self.base_url}{endpoint}", **kwargs)
    
    def delete(self, endpoint: str, **kwargs):
        """DELETE request with automatic base URL"""
        return self.session.delete(f"{self.base_url}{endpoint}", **kwargs)
    
    def wait_for_server(self, timeout: int = 30):
        """Wait for server to be ready"""
        start_time = datetime.now()
        
        while (datetime.now() - start_time).seconds < timeout:
            try:
                response = self.get("/api/health")
                if response.status_code == 200:
                    return True
            except requests.exceptions.ConnectionError:
                pass
            
            asyncio.sleep(1)
        
        return False


class MockMCPServer:
    """Mock MCP server for testing"""
    
    def __init__(self):
        self.call_history = []
        self.responses = {}
        self.default_responses = {
            "analyze_trade": {
                "setup_quality": "good",
                "execution_rating": 7,
                "lessons_learned": ["Test lesson"]
            },
            "get_trading_advice": {
                "advice": "Test advice",
                "confidence": 0.8,
                "suggestions": ["Test suggestion"]
            },
            "calculate_metrics": {
                "win_rate": 0.65,
                "profit_factor": 2.1
            }
        }
    
    async def call(self, method: str, params: Dict = None):
        """Mock MCP call"""
        self.call_history.append({
            "method": method,
            "params": params,
            "timestamp": datetime.now()
        })
        
        # Return configured response or default
        if method in self.responses:
            return self.responses[method]
        
        return self.default_responses.get(method, {"status": "success"})
    
    def set_response(self, method: str, response: Dict):
        """Set custom response for a method"""
        self.responses[method] = response
    
    def get_call_count(self, method: str = None):
        """Get number of calls made"""
        if method:
            return len([call for call in self.call_history if call["method"] == method])
        return len(self.call_history)
    
    def reset(self):
        """Reset call history and responses"""
        self.call_history = []
        self.responses = {}


class TestDataManager:
    """Manages test data creation and cleanup"""
    
    def __init__(self):
        self.created_trades = []
        self.created_plans = []
        self.created_journal_entries = []
        self.api_client = None
    
    def set_api_client(self, client: APITestClient):
        """Set the API client for data operations"""
        self.api_client = client
    
    def create_test_trade(self, trade_data: Dict = None) -> Dict:
        """Create a test trade via API"""
        from testing.factories.test_data_factories import TradeFactory
        
        if trade_data is None:
            trade_data = TradeFactory()
        
        if self.api_client:
            response = self.api_client.post("/api/trades", json=trade_data)
            if response.status_code in [200, 201]:
                trade = response.json()
                self.created_trades.append(trade["id"])
                return trade
        
        return trade_data
    
    def create_test_plan(self, plan_data: Dict = None) -> Dict:
        """Create a test daily plan via API"""
        from testing.factories.test_data_factories import DailyPlanFactory
        
        if plan_data is None:
            plan_data = DailyPlanFactory()
        
        if self.api_client:
            response = self.api_client.post("/api/planning", json=plan_data)
            if response.status_code in [200, 201]:
                plan = response.json()
                self.created_plans.append(plan["id"])
                return plan
        
        return plan_data
    
    def create_test_journal_entry(self, entry_data: Dict = None) -> Dict:
        """Create a test journal entry via API"""
        from testing.factories.test_data_factories import JournalEntryFactory
        
        if entry_data is None:
            entry_data = JournalEntryFactory()
        
        if self.api_client:
            response = self.api_client.post("/api/journal", json=entry_data)
            if response.status_code in [200, 201]:
                entry = response.json()
                self.created_journal_entries.append(entry["id"])
                return entry
        
        return entry_data
    
    def cleanup(self):
        """Clean up all created test data"""
        if not self.api_client:
            return
        
        # Delete trades
        for trade_id in self.created_trades:
            try:
                self.api_client.delete(f"/api/trades/{trade_id}")
            except:
                pass
        
        # Delete plans
        for plan_id in self.created_plans:
            try:
                self.api_client.delete(f"/api/planning/{plan_id}")
            except:
                pass
        
        # Delete journal entries
        for entry_id in self.created_journal_entries:
            try:
                self.api_client.delete(f"/api/journal/{entry_id}")
            except:
                pass
        
        # Reset lists
        self.created_trades = []
        self.created_plans = []
        self.created_journal_entries = []


class PerformanceMonitor:
    """Monitor performance during tests"""
    
    def __init__(self):
        self.metrics = []
        self.thresholds = {
            "response_time": 1000,  # ms
            "memory_usage": 100,    # MB
            "cpu_usage": 80         # %
        }
    
    def start_monitoring(self, test_name: str):
        """Start monitoring for a test"""
        self.current_test = {
            "name": test_name,
            "start_time": datetime.now(),
            "metrics": []
        }
    
    def record_response_time(self, endpoint: str, duration_ms: float):
        """Record API response time"""
        self.current_test["metrics"].append({
            "type": "response_time",
            "endpoint": endpoint,
            "value": duration_ms,
            "timestamp": datetime.now()
        })
    
    def record_memory_usage(self, usage_mb: float):
        """Record memory usage"""
        self.current_test["metrics"].append({
            "type": "memory_usage",
            "value": usage_mb,
            "timestamp": datetime.now()
        })
    
    def finish_monitoring(self):
        """Finish monitoring and analyze results"""
        if hasattr(self, 'current_test'):
            self.current_test["end_time"] = datetime.now()
            self.current_test["duration"] = (
                self.current_test["end_time"] - self.current_test["start_time"]
            ).total_seconds()
            
            # Analyze performance
            violations = self._check_thresholds()
            self.current_test["violations"] = violations
            
            self.metrics.append(self.current_test)
            return self.current_test
    
    def _check_thresholds(self) -> List[Dict]:
        """Check if any performance thresholds were violated"""
        violations = []
        
        for metric in self.current_test["metrics"]:
            metric_type = metric["type"]
            if metric_type in self.thresholds:
                if metric["value"] > self.thresholds[metric_type]:
                    violations.append({
                        "type": metric_type,
                        "value": metric["value"],
                        "threshold": self.thresholds[metric_type],
                        "endpoint": metric.get("endpoint")
                    })
        
        return violations
    
    def get_summary(self) -> Dict:
        """Get performance summary"""
        total_tests = len(self.metrics)
        total_violations = sum(len(test["violations"]) for test in self.metrics)
        
        return {
            "total_tests": total_tests,
            "total_violations": total_violations,
            "violation_rate": total_violations / total_tests if total_tests > 0 else 0,
            "avg_test_duration": sum(test["duration"] for test in self.metrics) / total_tests if total_tests > 0 else 0,
            "slowest_test": max(self.metrics, key=lambda x: x["duration"]) if self.metrics else None
        }


class TestReporter:
    """Generate test reports"""
    
    def __init__(self, output_dir: str = "testing/reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.test_results = []
    
    def add_test_result(self, test_name: str, status: str, duration: float, 
                       details: Dict = None):
        """Add a test result"""
        self.test_results.append({
            "name": test_name,
            "status": status,
            "duration": duration,
            "details": details or {},
            "timestamp": datetime.now()
        })
    
    def generate_summary_report(self) -> str:
        """Generate a summary report"""
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["status"] == "passed"])
        failed_tests = len([t for t in self.test_results if t["status"] == "failed"])
        skipped_tests = len([t for t in self.test_results if t["status"] == "skipped"])
        
        total_duration = sum(t["duration"] for t in self.test_results)
        avg_duration = total_duration / total_tests if total_tests > 0 else 0
        
        report = f"""
# Test Summary Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overview
- **Total Tests:** {total_tests}
- **Passed:** {passed_tests} ({passed_tests/total_tests*100:.1f}%)
- **Failed:** {failed_tests} ({failed_tests/total_tests*100:.1f}%)
- **Skipped:** {skipped_tests} ({skipped_tests/total_tests*100:.1f}%)
- **Total Duration:** {total_duration:.2f}s
- **Average Duration:** {avg_duration:.2f}s

## Failed Tests
"""
        
        failed_test_results = [t for t in self.test_results if t["status"] == "failed"]
        if failed_test_results:
            for test in failed_test_results:
                report += f"- **{test['name']}** ({test['duration']:.2f}s)\n"
                if test['details']:
                    report += f"  - Error: {test['details'].get('error', 'Unknown error')}\n"
        else:
            report += "No failed tests 🎉\n"
        
        report += f"""
## Slowest Tests
"""
        
        slowest_tests = sorted(self.test_results, key=lambda x: x['duration'], reverse=True)[:5]
        for test in slowest_tests:
            report += f"- **{test['name']}**: {test['duration']:.2f}s\n"
        
        return report
    
    def save_report(self, filename: str = None):
        """Save the report to file"""
        if filename is None:
            filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        report_path = self.output_dir / filename
        with open(report_path, 'w') as f:
            f.write(self.generate_summary_report())
        
        return str(report_path)
    
    def save_json_report(self, filename: str = None):
        """Save detailed results as JSON"""
        if filename is None:
            filename = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report_path = self.output_dir / filename
        with open(report_path, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total": len(self.test_results),
                    "passed": len([t for t in self.test_results if t["status"] == "passed"]),
                    "failed": len([t for t in self.test_results if t["status"] == "failed"]),
                    "skipped": len([t for t in self.test_results if t["status"] == "skipped"])
                },
                "results": self.test_results
            }, f, indent=2, default=str)
        
        return str(report_path)


# Utility functions
def wait_for_condition(condition_func, timeout: int = 30, interval: float = 1.0) -> bool:
    """Wait for a condition to become true"""
    start_time = datetime.now()
    
    while (datetime.now() - start_time).total_seconds() < timeout:
        if condition_func():
            return True
        
        asyncio.sleep(interval)
    
    return False


def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """Decorator to retry function on failure"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        asyncio.sleep(delay * (attempt + 1))
                    continue
            
            raise last_exception
        return wrapper
    return decorator


def measure_time(func):
    """Decorator to measure function execution time"""
    def wrapper(*args, **kwargs):
        start_time = datetime.now()
        result = func(*args, **kwargs)
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        print(f"{func.__name__} took {duration:.3f} seconds")
        
        return result
    return wrapper


class TestEnvironment:
    """Manages test environment setup and teardown"""
    
    def __init__(self):
        self.database = None
        self.api_client = None
        self.data_manager = None
        self.performance_monitor = None
        self.mock_mcp_server = None
        self.reporter = None
    
    def setup(self, config: Dict = None):
        """Set up the complete test environment"""
        config = config or {}
        
        # Setup database
        self.database = TestDatabase(config.get('database_url'))
        db_session = self.database.setup()
        
        # Setup API client
        api_url = config.get('api_url', 'http://localhost:8000')
        self.api_client = APITestClient(api_url)
        
        # Wait for API to be ready
        if not self.api_client.wait_for_server():
            raise RuntimeError("API server not ready")
        
        # Setup other components
        self.data_manager = TestDataManager()
        self.data_manager.set_api_client(self.api_client)
        
        self.performance_monitor = PerformanceMonitor()
        self.mock_mcp_server = MockMCPServer()
        self.reporter = TestReporter()
        
        return {
            'database_session': db_session,
            'api_client': self.api_client,
            'data_manager': self.data_manager,
            'performance_monitor': self.performance_monitor,
            'mock_mcp_server': self.mock_mcp_server,
            'reporter': self.reporter
        }
    
    def teardown(self):
        """Clean up the test environment"""
        if self.data_manager:
            self.data_manager.cleanup()
        
        if self.database:
            self.database.cleanup()
        
        # Generate final reports
        if self.reporter:
            summary_path = self.reporter.save_report()
            json_path = self.reporter.save_json_report()
            print(f"Test reports saved: {summary_path}, {json_path}")
        
        if self.performance_monitor:
            perf_summary = self.performance_monitor.get_summary()
            print(f"Performance summary: {perf_summary}")


# Pytest fixtures for easy use
@pytest.fixture(scope="session")
def test_environment():
    """Session-scoped test environment fixture"""
    env = TestEnvironment()
    components = env.setup()
    
    yield components
    
    env.teardown()


@pytest.fixture
def api_client(test_environment):
    """API client fixture"""
    return test_environment['api_client']


@pytest.fixture
def data_manager(test_environment):
    """Data manager fixture"""
    return test_environment['data_manager']


@pytest.fixture
def mock_mcp_server(test_environment):
    """Mock MCP server fixture"""
    server = test_environment['mock_mcp_server']
    server.reset()  # Reset before each test
    return server


@pytest.fixture
def performance_monitor(test_environment):
    """Performance monitor fixture"""
    return test_environment['performance_monitor']


if __name__ == "__main__":
    # Example usage
    print("Setting up test environment...")
    
    env = TestEnvironment()
    components = env.setup()
    
    try:
        # Example test operations
        api_client = components['api_client']
        data_manager = components['data_manager']
        
        # Create test data
        trade = data_manager.create_test_trade()
        print(f"Created test trade: {trade.get('id', 'Unknown')}")
        
        # Test API
        response = api_client.get("/api/health")
        print(f"Health check: {response.status_code}")
        
    finally:
        print("Cleaning up test environment...")
        env.teardown()
