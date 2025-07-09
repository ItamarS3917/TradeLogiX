#!/usr/bin/env python3
"""
Test configuration and fixtures for the trading journal backend
"""

import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Import your app components
from backend.main import app  # Adjust import path as needed

@pytest.fixture(scope="function")
def test_db():
    """Create a temporary database for testing"""
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp()
    database_url = f"sqlite:///{db_path}"
    
    try:
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create tables
        from backend.models import Base  # Adjust import as needed
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
        "outcome": "win",
        "notes": "Clean breakout setup"
    }

@pytest.fixture
def sample_statistics_data():
    """Sample statistics data for testing"""
    return {
        "total_trades": 100,
        "win_rate": 0.65,
        "profit_loss": 2500.0,
        "avg_win": 125.0,
        "avg_loss": -75.0,
        "largest_win": 500.0,
        "largest_loss": -200.0,
        "consecutive_wins": 5,
        "consecutive_losses": 3
    }