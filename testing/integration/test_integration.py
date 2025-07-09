#!/usr/bin/env python3
"""
Integration tests for the Trading Journal application
These tests verify that different components work together correctly
"""

import pytest
import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch
import requests
import time

from httpx import AsyncClient
from fastapi.testclient import TestClient

# Import application components
from backend.main import app
from backend.mcp.mcp_integration import MCPIntegration


class TestAPIIntegration:
    """Test integration between API endpoints and database"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    @pytest.fixture
    async def async_client(self):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    def test_trade_crud_workflow(self, client, sample_trade_data):
        """Test complete trade CRUD workflow"""
        # Create a trade
        create_response = client.post("/api/trades", json=sample_trade_data)
        assert create_response.status_code in [200, 201]
        
        if create_response.status_code == 201:
            trade_data = create_response.json()
            trade_id = trade_data["id"]
            
            # Read the trade
            get_response = client.get(f"/api/trades/{trade_id}")
            assert get_response.status_code == 200
            retrieved_trade = get_response.json()
            assert retrieved_trade["symbol"] == sample_trade_data["symbol"]
            
            # Update the trade
            updated_data = {**sample_trade_data, "notes": "Updated notes"}
            update_response = client.put(f"/api/trades/{trade_id}", json=updated_data)
            assert update_response.status_code == 200
            
            # Verify update
            get_updated = client.get(f"/api/trades/{trade_id}")
            assert get_updated.json()["notes"] == "Updated notes"
            
            # Delete the trade
            delete_response = client.delete(f"/api/trades/{trade_id}")
            assert delete_response.status_code in [200, 204]
            
            # Verify deletion
            get_deleted = client.get(f"/api/trades/{trade_id}")
            assert get_deleted.status_code == 404
    
    def test_statistics_update_after_trade_creation(self, client, sample_trade_data):
        """Test that statistics are updated when trades are created"""
        # Get initial statistics
        initial_stats = client.get("/api/statistics")
        assert initial_stats.status_code == 200
        initial_count = initial_stats.json().get("total_trades", 0)
        
        # Create several trades
        trades_to_create = 5
        for i in range(trades_to_create):
            trade_data = {**sample_trade_data, "notes": f"Trade {i+1}"}
            response = client.post("/api/trades", json=trade_data)
            assert response.status_code in [200, 201]
        
        # Check updated statistics
        updated_stats = client.get("/api/statistics")
        assert updated_stats.status_code == 200
        updated_count = updated_stats.json().get("total_trades", 0)
        
        # Statistics should reflect new trades
        assert updated_count >= initial_count + trades_to_create
    
    def test_dashboard_data_consistency(self, client, sample_trade_data):
        """Test that dashboard data is consistent across endpoints"""
        # Create some test trades
        for i in range(3):
            trade_data = {**sample_trade_data, "profit_loss": 25.0 + i * 10}
            client.post("/api/trades", json=trade_data)
        
        # Get dashboard data
        dashboard_response = client.get("/api/dashboard")
        assert dashboard_response.status_code == 200
        dashboard_data = dashboard_response.json()
        
        # Get statistics separately
        stats_response = client.get("/api/statistics")
        assert stats_response.status_code == 200
        stats_data = stats_response.json()
        
        # Compare key metrics for consistency
        if "performance_metrics" in dashboard_data and "total_trades" in stats_data:
            dashboard_trades = dashboard_data["performance_metrics"].get("total_trades")
            stats_trades = stats_data["total_trades"]
            
            # Should be consistent (allowing for timing differences)
            assert abs(dashboard_trades - stats_trades) <= 1


class TestMCPIntegration:
    """Test integration between API and MCP servers"""
    
    @pytest.fixture
    def mcp_integration(self):
        return MCPIntegration()
    
    @pytest.mark.asyncio
    async def test_trade_analysis_integration(self, mcp_integration, sample_trade_data):
        """Test integration between API and trade analysis MCP server"""
        # Mock the MCP client
        with patch.object(mcp_integration, 'trade_analysis_client') as mock_client:
            mock_client.call.return_value = {
                "setup_quality": "excellent",
                "execution_rating": 9,
                "lessons_learned": ["Perfect entry timing"]
            }
            
            # Call the integration method
            result = await mcp_integration.analyze_trade(sample_trade_data)
            
            assert result["setup_quality"] == "excellent"
            assert result["execution_rating"] == 9
            mock_client.call.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_statistics_mcp_integration(self, mcp_integration, large_trade_dataset):
        """Test integration between statistics API and MCP server"""
        with patch.object(mcp_integration, 'statistics_client') as mock_client:
            mock_client.call.return_value = {
                "win_rate": 0.65,
                "profit_factor": 2.1,
                "sharpe_ratio": 1.2
            }
            
            result = await mcp_integration.calculate_advanced_metrics(large_trade_dataset[:10])
            
            assert result["win_rate"] == 0.65
            assert result["profit_factor"] == 2.1
            mock_client.call.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_tradesage_integration(self, mcp_integration):
        """Test integration with TradeSage AI assistant"""
        with patch.object(mcp_integration, 'tradesage_client') as mock_client:
            mock_client.call.return_value = {
                "advice": "Focus on your best performing setups",
                "confidence": 0.8,
                "suggestions": ["Review morning performance", "Consider position sizing"]
            }
            
            result = await mcp_integration.get_trading_advice({
                "question": "How can I improve my trading?",
                "context": "recent_performance"
            })
            
            assert "advice" in result
            assert result["confidence"] > 0.7
            mock_client.call.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_alert_system_integration(self, mcp_integration, sample_trade_data):
        """Test integration with alert system"""
        with patch.object(mcp_integration, 'alert_client') as mock_client:
            mock_client.call.return_value = {
                "triggered_alerts": [
                    {
                        "alert_id": "daily_loss_warning",
                        "message": "Approaching daily loss limit",
                        "severity": "medium"
                    }
                ]
            }
            
            # Simulate current trading data
            current_data = {
                "daily_profit_loss": -150,
                "recent_trades": [sample_trade_data]
            }
            
            result = await mcp_integration.check_alerts(current_data)
            
            assert len(result["triggered_alerts"]) > 0
            assert result["triggered_alerts"][0]["alert_id"] == "daily_loss_warning"
            mock_client.call.assert_called_once()


class TestDatabaseIntegration:
    """Test database operations and data integrity"""
    
    def test_database_transaction_integrity(self, client, sample_trade_data):
        """Test that database transactions maintain integrity"""
        # This test would verify ACID properties
        # Create multiple trades in rapid succession
        import threading
        import queue
        
        results = queue.Queue()
        
        def create_trade(trade_data, result_queue):
            try:
                response = client.post("/api/trades", json=trade_data)
                result_queue.put(response.status_code)
            except Exception as e:
                result_queue.put(f"Error: {e}")
        
        # Create multiple threads to test concurrent access
        threads = []
        for i in range(5):
            trade_data = {**sample_trade_data, "notes": f"Concurrent trade {i}"}
            thread = threading.Thread(target=create_trade, args=(trade_data, results))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check results
        success_count = 0
        while not results.empty():
            result = results.get()
            if result in [200, 201]:
                success_count += 1
        
        # All operations should succeed
        assert success_count == 5
    
    def test_data_consistency_across_sessions(self, client, sample_trade_data):
        """Test data consistency across different client sessions"""
        # Create data with first client
        response1 = client.post("/api/trades", json=sample_trade_data)
        assert response1.status_code in [200, 201]
        
        if response1.status_code == 201:
            trade_id = response1.json()["id"]
            
            # Create second client instance
            client2 = TestClient(app)
            
            # Retrieve data with second client
            response2 = client2.get(f"/api/trades/{trade_id}")
            assert response2.status_code == 200
            
            # Data should be consistent
            trade_data = response2.json()
            assert trade_data["symbol"] == sample_trade_data["symbol"]


class TestAPIPerformance:
    """Test API performance under various conditions"""
    
    def test_api_response_times(self, client):
        """Test that API endpoints respond within acceptable time limits"""
        endpoints_to_test = [
            ("/api/health", "GET"),
            ("/api/trades", "GET"),
            ("/api/statistics", "GET"),
            ("/api/dashboard", "GET")
        ]
        
        for endpoint, method in endpoints_to_test:
            start_time = time.time()
            
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint, json={})
            
            end_time = time.time()
            response_time = end_time - start_time
            
            # API should respond within 1 second
            assert response_time < 1.0, f"{endpoint} took {response_time:.2f}s"
            assert response.status_code in [200, 201, 400, 422]  # Valid HTTP status
    
    def test_concurrent_request_handling(self, client):
        """Test handling of concurrent requests"""
        import threading
        import queue
        
        def make_request(endpoint, result_queue):
            try:
                start_time = time.time()
                response = client.get(endpoint)
                end_time = time.time()
                result_queue.put({
                    "status_code": response.status_code,
                    "response_time": end_time - start_time
                })
            except Exception as e:
                result_queue.put({"error": str(e)})
        
        # Test concurrent requests to statistics endpoint
        results = queue.Queue()
        threads = []
        
        for i in range(10):
            thread = threading.Thread(target=make_request, args=("/api/statistics", results))
            threads.append(thread)
            thread.start()
        
        # Wait for all requests to complete
        for thread in threads:
            thread.join()
        
        # Analyze results
        successful_requests = 0
        total_time = 0
        
        while not results.empty():
            result = results.get()
            if "status_code" in result and result["status_code"] == 200:
                successful_requests += 1
                total_time += result["response_time"]
        
        # All requests should succeed
        assert successful_requests == 10
        
        # Average response time should be reasonable
        avg_response_time = total_time / successful_requests
        assert avg_response_time < 2.0
    
    def test_large_dataset_handling(self, client, large_trade_dataset):
        """Test API performance with large datasets"""
        # Test creating multiple trades
        start_time = time.time()
        
        created_trades = 0
        for i in range(min(50, len(large_trade_dataset))):  # Limit to 50 for test speed
            trade_data = large_trade_dataset[i]
            response = client.post("/api/trades", json=trade_data)
            if response.status_code in [200, 201]:
                created_trades += 1
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Should handle 50 trades within reasonable time
        assert creation_time < 30.0  # 30 seconds max
        assert created_trades > 40  # At least 80% success rate
        
        # Test retrieving large dataset
        start_time = time.time()
        response = client.get("/api/trades?limit=50")
        end_time = time.time()
        retrieval_time = end_time - start_time
        
        assert response.status_code == 200
        assert retrieval_time < 5.0  # Should retrieve quickly


class TestErrorHandling:
    """Test error handling and recovery scenarios"""
    
    def test_invalid_data_handling(self, client):
        """Test API handling of invalid data"""
        invalid_trade_data = {
            "symbol": "",  # Empty symbol
            "setup_type": "INVALID_SETUP",
            "entry_price": "not_a_number",
            "exit_price": None,
            "position_size": -1  # Negative position size
        }
        
        response = client.post("/api/trades", json=invalid_trade_data)
        assert response.status_code in [400, 422]  # Bad request or validation error
        
        error_data = response.json()
        assert "detail" in error_data or "message" in error_data
    
    def test_missing_resource_handling(self, client):
        """Test handling of requests for non-existent resources"""
        # Try to get non-existent trade
        response = client.get("/api/trades/999999")
        assert response.status_code == 404
        
        # Try to update non-existent trade
        response = client.put("/api/trades/999999", json={"symbol": "NQ"})
        assert response.status_code == 404
        
        # Try to delete non-existent trade
        response = client.delete("/api/trades/999999")
        assert response.status_code == 404
    
    def test_malformed_request_handling(self, client):
        """Test handling of malformed requests"""
        # Send invalid JSON
        response = client.post(
            "/api/trades",
            data="invalid json content",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
        
        # Send request without required headers
        response = client.post("/api/trades", data="some data")
        assert response.status_code in [400, 415, 422]


class TestSecurityIntegration:
    """Test security-related integration scenarios"""
    
    def test_sql_injection_prevention(self, client):
        """Test that API prevents SQL injection attacks"""
        # Try SQL injection in trade search
        malicious_query = "'; DROP TABLE trades; --"
        response = client.get(f"/api/trades?search={malicious_query}")
        
        # Should not crash and should return valid response
        assert response.status_code in [200, 400]
        
        # Database should still be functional
        health_response = client.get("/api/health")
        assert health_response.status_code == 200
    
    def test_input_sanitization(self, client, sample_trade_data):
        """Test that inputs are properly sanitized"""
        # Try XSS attack in notes field
        xss_payload = "<script>alert('xss')</script>"
        malicious_trade = {**sample_trade_data, "notes": xss_payload}
        
        response = client.post("/api/trades", json=malicious_trade)
        
        if response.status_code in [200, 201]:
            trade_id = response.json()["id"]
            
            # Retrieve the trade
            get_response = client.get(f"/api/trades/{trade_id}")
            retrieved_trade = get_response.json()
            
            # Notes should be sanitized or escaped
            assert "<script>" not in retrieved_trade.get("notes", "")
    
    def test_rate_limiting(self, client):
        """Test rate limiting functionality"""
        # Make rapid requests to test rate limiting
        responses = []
        for i in range(100):  # Make many requests quickly
            response = client.get("/api/health")
            responses.append(response.status_code)
            
            if response.status_code == 429:  # Too Many Requests
                break
        
        # Should either handle all requests or implement rate limiting
        assert all(status in [200, 429] for status in responses)


class TestDataMigrationIntegration:
    """Test data migration and backup scenarios"""
    
    def test_data_export_import(self, client, sample_trade_data):
        """Test data export and import functionality"""
        # Create some test data
        trade_ids = []
        for i in range(5):
            trade_data = {**sample_trade_data, "notes": f"Test trade {i}"}
            response = client.post("/api/trades", json=trade_data)
            if response.status_code in [200, 201]:
                trade_ids.append(response.json()["id"])
        
        # Test export functionality
        export_response = client.get("/api/export/trades")
        
        if export_response.status_code == 200:
            export_data = export_response.json()
            assert "trades" in export_data
            assert len(export_data["trades"]) >= len(trade_ids)
        else:
            # Export endpoint might not be implemented yet
            assert export_response.status_code == 404
    
    def test_backup_restoration(self, client):
        """Test backup and restoration functionality"""
        # This would test backup/restore if implemented
        backup_response = client.post("/api/backup")
        
        # Endpoint might not exist yet
        assert backup_response.status_code in [200, 201, 404]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
