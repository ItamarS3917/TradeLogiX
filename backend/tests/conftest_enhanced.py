#!/usr/bin/env python3
"""
Enhanced test configuration with MCP server testing support
"""

import pytest
import tempfile
import os
import asyncio
from unittest.mock import AsyncMock, Mock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import json
from datetime import datetime, timedelta

# Import your app components
from backend.main import app

@pytest.fixture(scope="function")
def test_db():
    """Create a temporary database for testing"""
    db_fd, db_path = tempfile.mkstemp()
    database_url = f"sqlite:///{db_path}"
    
    try:
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create tables
        from backend.models import Base
        Base.metadata.create_all(bind=engine)
        
        db = TestingSessionLocal()
        yield db
        
    finally:
        db.close()
        os.close(db_fd)
        os.unlink(db_path)

@pytest.fixture
def client():
    """Create test client for FastAPI app"""
    return TestClient(app)

@pytest.fixture
def async_client():
    """Create async test client for testing async endpoints"""
    from httpx import AsyncClient
    return AsyncClient(app=app, base_url="http://test")

# Sample Data Fixtures
@pytest.fixture
def sample_trade_data():
    """Sample trade data for testing"""
    return {
        "symbol": "NQ",
        "setup_type": "MMXM_Breaker",
        "entry_price": 15000.0,
        "exit_price": 15025.0,
        "position_size": 1,
        "entry_time": "2024-01-01T09:30:00",
        "exit_time": "2024-01-01T10:00:00",
        "planned_risk_reward": 2.0,
        "actual_risk_reward": 2.5,
        "outcome": "win",
        "profit_loss": 25.0,
        "emotional_state": "confident",
        "plan_adherence": 9,
        "notes": "Clean breakout setup with good follow-through",
        "tags": ["breakout", "momentum", "clean_entry"]
    }

@pytest.fixture
def sample_losing_trade_data():
    """Sample losing trade for testing"""
    return {
        "symbol": "NQ",
        "setup_type": "ICT_FVG",
        "entry_price": 15000.0,
        "exit_price": 14985.0,
        "position_size": 1,
        "entry_time": "2024-01-01T14:30:00",
        "exit_time": "2024-01-01T14:45:00",
        "planned_risk_reward": 2.0,
        "actual_risk_reward": -1.0,
        "outcome": "loss",
        "profit_loss": -15.0,
        "emotional_state": "frustrated",
        "plan_adherence": 7,
        "notes": "FVG failed to hold, stopped out at planned level",
        "tags": ["fvg", "stop_out", "plan_followed"]
    }

@pytest.fixture
def sample_daily_plan():
    """Sample daily plan data"""
    return {
        "date": "2024-01-01",
        "market_bias": "bullish",
        "key_levels": [14950, 15000, 15050],
        "daily_goal": "Focus on clean breakout setups",
        "risk_parameters": {
            "max_daily_loss": 200,
            "max_position_size": 2,
            "risk_per_trade": 25
        },
        "mental_state": "focused",
        "notes": "Market showing strong bullish momentum"
    }

@pytest.fixture
def sample_journal_entry():
    """Sample journal entry data"""
    return {
        "date": "2024-01-01",
        "content": "Great trading day. Stuck to plan and captured two clean breakouts.",
        "mood_rating": 8,
        "tags": ["successful", "disciplined", "confident"],
        "insights": ["Patience paid off", "Following plan leads to success"],
        "related_trade_ids": []
    }

@pytest.fixture
def sample_statistics_data():
    """Sample statistics data for testing"""
    return {
        "total_trades": 100,
        "winning_trades": 65,
        "losing_trades": 35,
        "win_rate": 0.65,
        "profit_loss": 2500.0,
        "avg_win": 125.0,
        "avg_loss": -75.0,
        "largest_win": 500.0,
        "largest_loss": -200.0,
        "consecutive_wins": 5,
        "consecutive_losses": 3,
        "profit_factor": 2.67,
        "sharpe_ratio": 1.2,
        "max_drawdown": -300.0,
        "total_commissions": 250.0
    }

# MCP Server Testing Fixtures
@pytest.fixture
def mock_mcp_client():
    """Mock MCP client for testing MCP server interactions"""
    client = Mock()
    client.call = AsyncMock()
    client.notify = AsyncMock()
    client.close = AsyncMock()
    return client

@pytest.fixture
def sample_mcp_request():
    """Sample MCP JSON-RPC request"""
    return {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "analyze_trade",
        "params": {
            "trade_data": {
                "symbol": "NQ",
                "setup_type": "MMXM_Breaker",
                "entry_price": 15000.0,
                "exit_price": 15025.0,
                "outcome": "win"
            }
        }
    }

@pytest.fixture
def sample_mcp_response():
    """Sample MCP JSON-RPC response"""
    return {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "analysis": {
                "setup_quality": "excellent",
                "execution_rating": 9,
                "lessons_learned": ["Perfect entry timing", "Good risk management"],
                "similar_trades": 5,
                "success_probability": 0.8
            }
        }
    }

# Authentication Fixtures
@pytest.fixture
def auth_headers():
    """Mock authentication headers"""
    return {"Authorization": "Bearer test_token_123"}

@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "username": "test_trader",
        "email": "test@example.com",
        "trading_style": "day_trader",
        "preferred_instruments": ["NQ", "ES"],
        "risk_tolerance": "moderate",
        "experience_level": "intermediate"
    }

# Performance Testing Fixtures
@pytest.fixture
def large_trade_dataset():
    """Generate large dataset for performance testing"""
    trades = []
    base_date = datetime(2024, 1, 1)
    
    for i in range(1000):
        trade_date = base_date + timedelta(days=i % 365)
        trades.append({
            "id": i + 1,
            "symbol": "NQ",
            "setup_type": ["MMXM_Breaker", "ICT_FVG", "MMXM_Mitigation"][i % 3],
            "entry_price": 15000 + (i % 100),
            "exit_price": 15000 + (i % 100) + (10 if i % 2 == 0 else -5),
            "position_size": 1,
            "entry_time": trade_date.isoformat(),
            "exit_time": (trade_date + timedelta(minutes=30)).isoformat(),
            "outcome": "win" if i % 2 == 0 else "loss",
            "profit_loss": 10 if i % 2 == 0 else -5,
            "emotional_state": ["confident", "nervous", "calm"][i % 3],
            "plan_adherence": 7 + (i % 3),
            "notes": f"Trade {i+1} notes",
            "tags": ["test_data", f"batch_{i//100}"]
        })
    
    return trades

# Database State Fixtures
@pytest.fixture
def populated_db(test_db, large_trade_dataset):
    """Database populated with test data"""
    # This would populate the test database with the large dataset
    # Implementation depends on your ORM models
    return test_db

# Error Simulation Fixtures
@pytest.fixture
def mock_network_error():
    """Mock network error for testing error handling"""
    from unittest.mock import Mock
    error = Mock()
    error.side_effect = ConnectionError("Network unreachable")
    return error

@pytest.fixture
def mock_timeout_error():
    """Mock timeout error for testing"""
    from unittest.mock import Mock
    error = Mock()
    error.side_effect = TimeoutError("Request timed out")
    return error

# Market Data Fixtures
@pytest.fixture
def sample_market_data():
    """Sample market data for testing"""
    return {
        "symbol": "NQ",
        "current_price": 15025.0,
        "change": 25.0,
        "change_percent": 0.167,
        "volume": 125000,
        "high": 15050.0,
        "low": 14975.0,
        "open": 15000.0,
        "timestamp": datetime.now().isoformat()
    }

# Test Configuration
@pytest.fixture(scope="session", autouse=True)
def configure_test_environment():
    """Configure test environment settings"""
    os.environ["TESTING"] = "1"
    os.environ["DATABASE_URL"] = "sqlite:///test.db"
    os.environ["MCP_SERVER_PORT"] = "8001"
    os.environ["LOG_LEVEL"] = "DEBUG"
    
    yield
    
    # Cleanup
    for key in ["TESTING", "DATABASE_URL", "MCP_SERVER_PORT", "LOG_LEVEL"]:
        os.environ.pop(key, None)

# Async Testing Support
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Parameterized Test Data
@pytest.fixture(params=[
    "MMXM_Breaker", "MMXM_Mitigation", "ICT_FVG", "ICT_OB", "ICT_MSS"
])
def setup_types(request):
    """Parameterized setup types for testing"""
    return request.param

@pytest.fixture(params=["1D", "1W", "1M", "3M", "6M", "1Y"])
def timeframes(request):
    """Parameterized timeframes for testing"""
    return request.param

@pytest.fixture(params=[1, 5, 10, 50, 100])
def trade_counts(request):
    """Parameterized trade counts for testing"""
    return request.param

# Utility Functions for Tests
def create_test_trade(override_data=None):
    """Utility function to create test trade data"""
    base_data = {
        "symbol": "NQ",
        "setup_type": "MMXM_Breaker",
        "entry_price": 15000.0,
        "exit_price": 15025.0,
        "position_size": 1,
        "entry_time": datetime.now().isoformat(),
        "exit_time": (datetime.now() + timedelta(minutes=30)).isoformat(),
        "outcome": "win",
        "profit_loss": 25.0
    }
    
    if override_data:
        base_data.update(override_data)
    
    return base_data

def assert_valid_mcp_response(response):
    """Utility function to validate MCP response format"""
    assert "jsonrpc" in response
    assert response["jsonrpc"] == "2.0"
    assert "id" in response
    assert "result" in response or "error" in response
