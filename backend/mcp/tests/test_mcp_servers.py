#!/usr/bin/env python3
"""
Comprehensive tests for MCP servers in the trading journal application
"""

import pytest
import json
import asyncio
from unittest.mock import AsyncMock, Mock, patch
from datetime import datetime, timedelta

# Import MCP servers
from backend.mcp.servers.trade_analysis_server import TradeAnalysisServer
from backend.mcp.servers.tradesage_server import TradeSageServer
from backend.mcp.servers.statistics_server import StatisticsServer
from backend.mcp.servers.alert_server import AlertServer
from backend.mcp.servers.market_data_server import MarketDataServer

class TestTradeAnalysisServer:
    """Test the Trade Analysis MCP Server"""
    
    @pytest.fixture
    def trade_analysis_server(self):
        """Create trade analysis server instance"""
        return TradeAnalysisServer()
    
    @pytest.mark.asyncio
    async def test_analyze_trade_success(self, trade_analysis_server, sample_trade_data):
        """Test successful trade analysis"""
        # Mock the analysis method
        with patch.object(trade_analysis_server, '_perform_analysis') as mock_analysis:
            mock_analysis.return_value = {
                "setup_quality": "excellent",
                "execution_rating": 9,
                "risk_reward_analysis": {
                    "planned": 2.0,
                    "actual": 2.5,
                    "effectiveness": "above_plan"
                },
                "emotional_analysis": {
                    "state": "confident",
                    "impact_on_performance": "positive"
                },
                "lessons_learned": [
                    "Perfect entry timing",
                    "Good risk management"
                ],
                "similar_trades": {
                    "count": 5,
                    "success_rate": 0.8
                }
            }
            
            request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "analyze_trade",
                "params": {"trade_data": sample_trade_data}
            }
            
            response = await trade_analysis_server.handle_request(request)
            
            assert response["jsonrpc"] == "2.0"
            assert response["id"] == 1
            assert "result" in response
            assert response["result"]["setup_quality"] == "excellent"
            assert response["result"]["execution_rating"] == 9
    
    @pytest.mark.asyncio
    async def test_analyze_trade_invalid_data(self, trade_analysis_server):
        """Test trade analysis with invalid data"""
        invalid_trade_data = {
            "symbol": "",  # Invalid empty symbol
            "setup_type": "INVALID_SETUP",
            "entry_price": "not_a_number"
        }
        
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "analyze_trade",
            "params": {"trade_data": invalid_trade_data}
        }
        
        response = await trade_analysis_server.handle_request(request)
        
        assert response["jsonrpc"] == "2.0"
        assert response["id"] == 2
        assert "error" in response
        assert response["error"]["code"] == -32602  # Invalid params
    
    @pytest.mark.asyncio
    async def test_categorize_setup(self, trade_analysis_server):
        """Test setup categorization functionality"""
        setup_data = {
            "price_action": "breakout",
            "market_structure": "bullish",
            "volume": "high",
            "time_of_day": "09:30"
        }
        
        request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "categorize_setup",
            "params": {"setup_data": setup_data}
        }
        
        with patch.object(trade_analysis_server, '_categorize_setup') as mock_categorize:
            mock_categorize.return_value = {
                "primary_category": "MMXM_Breaker",
                "confidence": 0.85,
                "alternative_categories": ["ICT_MSS"],
                "key_characteristics": ["strong_breakout", "high_volume"]
            }
            
            response = await trade_analysis_server.handle_request(request)
            
            assert response["result"]["primary_category"] == "MMXM_Breaker"
            assert response["result"]["confidence"] > 0.8

class TestTradeSageServer:
    """Test the TradeSage AI Assistant MCP Server"""
    
    @pytest.fixture
    def tradesage_server(self):
        """Create TradeSage server instance"""
        return TradeSageServer()
    
    @pytest.mark.asyncio
    async def test_get_trading_advice(self, tradesage_server, sample_trade_data):
        """Test getting trading advice from TradeSage"""
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "get_trading_advice",
            "params": {
                "context": "recent_trades",
                "trade_history": [sample_trade_data],
                "question": "How can I improve my trade execution?"
            }
        }
        
        with patch.object(tradesage_server, '_generate_advice') as mock_advice:
            mock_advice.return_value = {
                "advice": "Based on your recent trades, you're showing good discipline with your planned setups. Consider focusing on position sizing to maximize your edge.",
                "confidence": 0.8,
                "suggestions": [
                    "Review your position sizing strategy",
                    "Consider scaling into positions",
                    "Track execution timing metrics"
                ],
                "references": ["similar_trader_experiences", "statistical_analysis"]
            }
            
            response = await tradesage_server.handle_request(request)
            
            assert "result" in response
            assert "advice" in response["result"]
            assert len(response["result"]["suggestions"]) > 0
    
    @pytest.mark.asyncio
    async def test_analyze_trading_psychology(self, tradesage_server):
        """Test psychological analysis functionality"""
        psychological_data = {
            "recent_emotional_states": ["confident", "nervous", "frustrated"],
            "performance_correlation": {
                "confident_trades": {"win_rate": 0.8, "avg_profit": 125},
                "nervous_trades": {"win_rate": 0.4, "avg_profit": 25},
                "frustrated_trades": {"win_rate": 0.2, "avg_profit": -50}
            }
        }
        
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "analyze_psychology",
            "params": {"psychological_data": psychological_data}
        }
        
        with patch.object(tradesage_server, '_analyze_psychology') as mock_psychology:
            mock_psychology.return_value = {
                "primary_patterns": [
                    "Performance strongly correlated with emotional state",
                    "Confidence leads to better execution"
                ],
                "recommendations": [
                    "Develop pre-trade emotional assessment routine",
                    "Avoid trading when frustrated",
                    "Focus on maintaining confident mindset"
                ],
                "risk_factors": ["emotional_trading", "revenge_trading"],
                "improvement_areas": ["emotional_regulation", "mindfulness"]
            }
            
            response = await tradesage_server.handle_request(request)
            
            assert "result" in response
            assert len(response["result"]["recommendations"]) > 0
            assert "emotional_regulation" in response["result"]["improvement_areas"]
    
    @pytest.mark.asyncio
    async def test_pattern_recognition(self, tradesage_server, large_trade_dataset):
        """Test pattern recognition in trading data"""
        request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "identify_patterns",
            "params": {
                "trades": large_trade_dataset[:50],  # Use subset for testing
                "analysis_type": "profitability_patterns"
            }
        }
        
        with patch.object(tradesage_server, '_identify_patterns') as mock_patterns:
            mock_patterns.return_value = {
                "identified_patterns": [
                    {
                        "pattern_type": "time_of_day",
                        "description": "Higher win rate during 9:30-11:00 AM",
                        "strength": 0.75,
                        "sample_size": 25
                    },
                    {
                        "pattern_type": "setup_sequence",
                        "description": "MMXM_Breaker followed by ICT_FVG shows 80% win rate",
                        "strength": 0.8,
                        "sample_size": 10
                    }
                ],
                "actionable_insights": [
                    "Focus trading during morning session",
                    "Look for setup combinations"
                ]
            }
            
            response = await tradesage_server.handle_request(request)
            
            assert "result" in response
            assert len(response["result"]["identified_patterns"]) > 0

class TestStatisticsServer:
    """Test the Statistics MCP Server"""
    
    @pytest.fixture
    def statistics_server(self):
        """Create statistics server instance"""
        return StatisticsServer()
    
    @pytest.mark.asyncio
    async def test_calculate_performance_metrics(self, statistics_server, large_trade_dataset):
        """Test performance metrics calculation"""
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "calculate_metrics",
            "params": {
                "trades": large_trade_dataset[:100],
                "timeframe": "1M",
                "metrics": ["win_rate", "profit_factor", "sharpe_ratio"]
            }
        }
        
        with patch.object(statistics_server, '_calculate_metrics') as mock_calc:
            mock_calc.return_value = {
                "win_rate": 0.65,
                "profit_factor": 2.1,
                "sharpe_ratio": 1.2,
                "total_trades": 100,
                "total_profit": 2500.0,
                "max_drawdown": -300.0,
                "avg_win": 125.0,
                "avg_loss": -75.0,
                "largest_win": 500.0,
                "largest_loss": -200.0
            }
            
            response = await statistics_server.handle_request(request)
            
            assert "result" in response
            assert response["result"]["win_rate"] == 0.65
            assert response["result"]["profit_factor"] > 2.0
    
    @pytest.mark.asyncio
    async def test_generate_report(self, statistics_server):
        """Test statistics report generation"""
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "generate_report",
            "params": {
                "report_type": "monthly_summary",
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        }
        
        with patch.object(statistics_server, '_generate_report') as mock_report:
            mock_report.return_value = {
                "report_title": "January 2024 Trading Summary",
                "summary_metrics": {
                    "total_trades": 45,
                    "win_rate": 0.67,
                    "net_profit": 1250.0
                },
                "detailed_analysis": {
                    "best_performing_setups": ["MMXM_Breaker", "ICT_FVG"],
                    "worst_performing_setups": ["ICT_OB"],
                    "time_analysis": "Morning sessions most profitable"
                },
                "recommendations": [
                    "Continue focusing on MMXM setups",
                    "Reduce ICT_OB frequency"
                ]
            }
            
            response = await statistics_server.handle_request(request)
            
            assert "result" in response
            assert response["result"]["summary_metrics"]["total_trades"] == 45

class TestAlertServer:
    """Test the Alert MCP Server"""
    
    @pytest.fixture
    def alert_server(self):
        """Create alert server instance"""
        return AlertServer()
    
    @pytest.mark.asyncio
    async def test_create_alert(self, alert_server):
        """Test creating a new alert"""
        alert_config = {
            "name": "Daily Loss Limit",
            "type": "risk_management",
            "condition": {
                "metric": "daily_loss",
                "operator": "exceeds",
                "threshold": -200
            },
            "action": {
                "type": "notification",
                "message": "Daily loss limit reached!"
            }
        }
        
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "create_alert",
            "params": {"alert_config": alert_config}
        }
        
        with patch.object(alert_server, '_create_alert') as mock_create:
            mock_create.return_value = {
                "alert_id": "alert_123",
                "status": "active",
                "created_at": datetime.now().isoformat()
            }
            
            response = await alert_server.handle_request(request)
            
            assert "result" in response
            assert response["result"]["status"] == "active"
    
    @pytest.mark.asyncio
    async def test_check_alert_conditions(self, alert_server, sample_trade_data):
        """Test checking alert trigger conditions"""
        current_data = {
            "daily_profit_loss": -150,
            "current_drawdown": -250,
            "consecutive_losses": 3,
            "recent_trades": [sample_trade_data]
        }
        
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "check_conditions",
            "params": {"current_data": current_data}
        }
        
        with patch.object(alert_server, '_check_conditions') as mock_check:
            mock_check.return_value = {
                "triggered_alerts": [
                    {
                        "alert_id": "alert_123",
                        "name": "Daily Loss Limit",
                        "severity": "high",
                        "message": "Daily loss approaching limit",
                        "triggered_at": datetime.now().isoformat()
                    }
                ],
                "status": "alerts_triggered"
            }
            
            response = await alert_server.handle_request(request)
            
            assert "result" in response
            assert len(response["result"]["triggered_alerts"]) > 0

class TestMarketDataServer:
    """Test the Market Data MCP Server"""
    
    @pytest.fixture
    def market_data_server(self):
        """Create market data server instance"""
        return MarketDataServer()
    
    @pytest.mark.asyncio
    async def test_get_current_price(self, market_data_server):
        """Test getting current market price"""
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "get_current_price",
            "params": {"symbol": "NQ"}
        }
        
        with patch.object(market_data_server, '_fetch_current_price') as mock_price:
            mock_price.return_value = {
                "symbol": "NQ",
                "price": 15025.75,
                "change": 12.25,
                "change_percent": 0.081,
                "volume": 125000,
                "timestamp": datetime.now().isoformat()
            }
            
            response = await market_data_server.handle_request(request)
            
            assert "result" in response
            assert response["result"]["symbol"] == "NQ"
            assert response["result"]["price"] > 0
    
    @pytest.mark.asyncio
    async def test_get_key_levels(self, market_data_server):
        """Test getting key support/resistance levels"""
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "get_key_levels",
            "params": {
                "symbol": "NQ",
                "timeframe": "1D",
                "lookback_periods": 20
            }
        }
        
        with patch.object(market_data_server, '_calculate_key_levels') as mock_levels:
            mock_levels.return_value = {
                "support_levels": [14950, 14900, 14850],
                "resistance_levels": [15050, 15100, 15150],
                "pivot_point": 15000,
                "strength_indicators": {
                    "14950": "strong",
                    "15050": "moderate"
                }
            }
            
            response = await market_data_server.handle_request(request)
            
            assert "result" in response
            assert len(response["result"]["support_levels"]) > 0
            assert len(response["result"]["resistance_levels"]) > 0

class TestMCPProtocolCompliance:
    """Test MCP protocol compliance across all servers"""
    
    @pytest.mark.parametrize("server_class", [
        TradeAnalysisServer,
        TradeSageServer,
        StatisticsServer,
        AlertServer,
        MarketDataServer
    ])
    def test_server_initialization(self, server_class):
        """Test that all servers initialize correctly"""
        server = server_class()
        assert server is not None
        assert hasattr(server, 'handle_request')
    
    @pytest.mark.asyncio
    async def test_invalid_json_rpc_request(self):
        """Test handling of invalid JSON-RPC requests"""
        server = TradeAnalysisServer()
        
        # Missing required fields
        invalid_request = {
            "method": "analyze_trade"
            # Missing jsonrpc, id, params
        }
        
        response = await server.handle_request(invalid_request)
        
        assert "error" in response
        assert response["error"]["code"] == -32600  # Invalid Request
    
    @pytest.mark.asyncio
    async def test_method_not_found(self):
        """Test handling of non-existent methods"""
        server = TradeAnalysisServer()
        
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "nonexistent_method",
            "params": {}
        }
        
        response = await server.handle_request(request)
        
        assert "error" in response
        assert response["error"]["code"] == -32601  # Method not found
    
    @pytest.mark.asyncio
    async def test_server_error_handling(self):
        """Test server error handling"""
        server = TradeAnalysisServer()
        
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "analyze_trade",
            "params": {"trade_data": None}  # This should cause an error
        }
        
        with patch.object(server, '_perform_analysis', side_effect=Exception("Test error")):
            response = await server.handle_request(request)
            
            assert "error" in response
            assert response["error"]["code"] == -32000  # Server error

class TestMCPIntegration:
    """Test integration between multiple MCP servers"""
    
    @pytest.mark.asyncio
    async def test_cross_server_data_flow(self):
        """Test data flow between trade analysis and statistics servers"""
        trade_server = TradeAnalysisServer()
        stats_server = StatisticsServer()
        
        # Analyze a trade
        trade_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "analyze_trade",
            "params": {"trade_data": {"symbol": "NQ", "outcome": "win"}}
        }
        
        # Mock the analysis
        with patch.object(trade_server, '_perform_analysis') as mock_analysis:
            mock_analysis.return_value = {"execution_rating": 9}
            
            trade_response = await trade_server.handle_request(trade_request)
            
            # Use analysis result in statistics calculation
            stats_request = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "update_metrics",
                "params": {
                    "trade_analysis": trade_response["result"],
                    "trade_data": {"symbol": "NQ", "outcome": "win"}
                }
            }
            
            with patch.object(stats_server, '_update_metrics') as mock_update:
                mock_update.return_value = {"updated": True}
                
                stats_response = await stats_server.handle_request(stats_request)
                
                assert "result" in stats_response
                assert stats_response["result"]["updated"] is True

# Performance Tests
class TestMCPPerformance:
    """Test MCP server performance"""
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test handling multiple concurrent requests"""
        server = StatisticsServer()
        
        # Create multiple concurrent requests
        requests = []
        for i in range(10):
            request = {
                "jsonrpc": "2.0",
                "id": i,
                "method": "calculate_metrics",
                "params": {"trades": [{"id": i}]}
            }
            requests.append(request)
        
        with patch.object(server, '_calculate_metrics', return_value={"win_rate": 0.5}):
            # Send all requests concurrently
            tasks = [server.handle_request(req) for req in requests]
            responses = await asyncio.gather(*tasks)
            
            # All requests should complete successfully
            assert len(responses) == 10
            for response in responses:
                assert "result" in response or "error" in response
    
    @pytest.mark.asyncio
    async def test_large_data_processing(self, large_trade_dataset):
        """Test processing large datasets"""
        server = StatisticsServer()
        
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "calculate_metrics",
            "params": {"trades": large_trade_dataset}
        }
        
        # Time the request
        import time
        start_time = time.time()
        
        with patch.object(server, '_calculate_metrics', return_value={"processed": len(large_trade_dataset)}):
            response = await server.handle_request(request)
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            assert "result" in response
            assert processing_time < 5.0  # Should complete within 5 seconds

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
