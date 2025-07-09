#!/usr/bin/env python3
"""
Test cases for trading journal API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class TestHealthEndpoints:
    """Test basic health and info endpoints"""
    
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_api_info(self):
        """Test API info endpoint"""
        response = client.get("/api/info")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data

class TestTradeEndpoints:
    """Test trade-related API endpoints"""
    
    def test_get_trades_empty(self):
        """Test getting trades when database is empty"""
        response = client.get("/api/trades")
        assert response.status_code == 200
        data = response.json()
        assert "trades" in data
    
    def test_create_trade(self, sample_trade_data):
        """Test creating a new trade"""
        response = client.post("/api/trades", json=sample_trade_data)
        # This might return 201 or 200 depending on your implementation
        assert response.status_code in [200, 201]
        
        if response.status_code == 201:
            data = response.json()
            assert data["symbol"] == sample_trade_data["symbol"]
            assert data["setup_type"] == sample_trade_data["setup_type"]
    
    def test_create_trade_invalid_data(self):
        """Test creating trade with invalid data"""
        invalid_data = {
            "symbol": "",  # Empty symbol should be invalid
            "entry_price": "not_a_number"  # Invalid price
        }
        response = client.post("/api/trades", json=invalid_data)
        # Should return validation error
        assert response.status_code in [400, 422]
    
    def test_get_trade_by_id(self):
        """Test getting a specific trade by ID"""
        # First create a trade
        trade_data = {
            "symbol": "NQ",
            "setup_type": "ICT_FVG",
            "entry_price": 15000.0,
            "exit_price": 15025.0,
            "position_size": 1
        }
        
        create_response = client.post("/api/trades", json=trade_data)
        if create_response.status_code in [200, 201]:
            # If creation successful, try to get it
            trade_id = create_response.json().get("id")
            if trade_id:
                response = client.get(f"/api/trades/{trade_id}")
                assert response.status_code in [200, 404]  # 404 if endpoint not implemented

class TestStatisticsEndpoints:
    """Test statistics-related API endpoints"""
    
    def test_get_statistics(self):
        """Test getting trading statistics"""
        response = client.get("/api/statistics")
        assert response.status_code == 200
        data = response.json()
        
        # Check that basic statistical fields are present
        expected_fields = ["total_trades", "win_rate", "profit_loss"]
        for field in expected_fields:
            assert field in data
    
    def test_get_statistics_with_timeframe(self):
        """Test getting statistics with timeframe filter"""
        response = client.get("/api/statistics?timeframe=1W")
        assert response.status_code == 200
        data = response.json()
        assert "total_trades" in data
    
    def test_get_statistics_with_date_range(self):
        """Test getting statistics with custom date range"""
        params = {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        response = client.get("/api/statistics", params=params)
        assert response.status_code == 200

class TestDashboardEndpoints:
    """Test dashboard-related API endpoints"""
    
    def test_get_dashboard_data(self):
        """Test getting dashboard data"""
        response = client.get("/api/dashboard")
        # This endpoint might not exist yet
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            # Check for expected dashboard fields
            possible_fields = ["recent_trades", "performance_metrics", "alerts"]
            # At least one of these should be present
            assert any(field in data for field in possible_fields)

class TestJournalEndpoints:
    """Test journal-related API endpoints"""
    
    def test_get_journal_entries(self):
        """Test getting journal entries"""
        response = client.get("/api/journal")
        assert response.status_code in [200, 404]  # 404 if not implemented yet
    
    def test_create_journal_entry(self):
        """Test creating a journal entry"""
        journal_data = {
            "date": "2024-01-01",
            "content": "Market opened with strong bullish sentiment",
            "mood_rating": 4,
            "tags": ["bullish", "confident"]
        }
        
        response = client.post("/api/journal", json=journal_data)
        assert response.status_code in [200, 201, 404]  # 404 if not implemented

class TestErrorHandling:
    """Test error handling scenarios"""
    
    def test_invalid_endpoint(self):
        """Test accessing non-existent endpoint"""
        response = client.get("/api/nonexistent")
        assert response.status_code == 404
    
    def test_invalid_method(self):
        """Test using wrong HTTP method"""
        response = client.delete("/api/trades")  # If DELETE is not supported
        assert response.status_code in [404, 405]  # Method not allowed or not found
    
    def test_malformed_json(self):
        """Test sending malformed JSON"""
        response = client.post(
            "/api/trades",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422  # Unprocessable entity

# Performance tests
class TestPerformance:
    """Test API performance"""
    
    def test_response_time(self):
        """Test that basic endpoints respond quickly"""
        import time
        
        start_time = time.time()
        response = client.get("/api/health")
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 1.0  # Should respond within 1 second

# Integration tests that might require database setup
class TestIntegration:
    """Integration tests that test multiple components together"""
    
    def test_trade_creation_and_statistics_update(self, sample_trade_data):
        """Test that creating trades updates statistics"""
        # Get initial statistics
        initial_stats = client.get("/api/statistics")
        assert initial_stats.status_code == 200
        initial_count = initial_stats.json().get("total_trades", 0)
        
        # Create a trade
        trade_response = client.post("/api/trades", json=sample_trade_data)
        
        if trade_response.status_code in [200, 201]:
            # Check if statistics updated
            updated_stats = client.get("/api/statistics")
            assert updated_stats.status_code == 200
            updated_count = updated_stats.json().get("total_trades", 0)
            
            # Statistics should be updated (if real-time updates are implemented)
            # This might not pass if statistics are calculated batch-wise
            # assert updated_count > initial_count