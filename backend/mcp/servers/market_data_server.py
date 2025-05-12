# File: backend/mcp/servers/market_data_server.py
# Purpose: MCP server for market data integration

import logging
import json
import httpx
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import HTTPException, Request, Response, Body

from ..mcp_server import MCPServer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketDataServer(MCPServer):
    """
    MCP server for market data integration
    Provides access to market data from various sources
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize market data server
        
        Args:
            config (Dict[str, Any]): Server configuration
        """
        super().__init__(config)
        
        # API keys for market data providers
        self.alpha_vantage_key = config.get("alpha_vantage_key", "demo")
        self.finnhub_key = config.get("finnhub_key")
        self.polygon_key = config.get("polygon_key")
        
        # Cache for market data to reduce API calls
        self.data_cache = {}
        self.cache_expiration = {}
        
        logger.info("Initialized MarketDataServer")
    
    def register_routes(self):
        """Register API routes"""
        
        @self.app.get("/api/v1/health")
        async def health_check():
            """Health check endpoint"""
            return {"status": "healthy", "server": self.name}
        
        @self.app.get("/api/v1/quote/{symbol}")
        async def get_quote(symbol: str):
            """
            Get real-time quote for a symbol
            
            Args:
                symbol (str): Trading symbol
                
            Returns:
                Dict[str, Any]: Quote data
            """
            try:
                # Check cache first
                cache_key = f"quote_{symbol}"
                if cache_key in self.data_cache:
                    # Check if cache is still valid (5 min expiration)
                    if datetime.utcnow() < self.cache_expiration.get(cache_key, datetime.min):
                        return self.data_cache[cache_key]
                
                # Fetch from Alpha Vantage
                quote = await self._fetch_alpha_vantage_quote(symbol)
                
                # Cache the result
                self.data_cache[cache_key] = quote
                self.cache_expiration[cache_key] = datetime.utcnow() + timedelta(minutes=5)
                
                return quote
            except Exception as e:
                logger.error(f"Error fetching quote for {symbol}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error fetching quote: {str(e)}")
        
        @self.app.get("/api/v1/market-hours")
        async def get_market_hours():
            """
            Get market trading hours information
            
            Returns:
                Dict[str, Any]: Market hours information
            """
            try:
                # Get current date in US/Eastern timezone (for US markets)
                now = datetime.utcnow() - timedelta(hours=4)  # Rough approximation of Eastern Time
                
                # Standard market hours (9:30 AM - 4:00 PM Eastern)
                market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
                market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
                
                # Check if weekend
                is_weekend = now.weekday() >= 5  # 5 = Saturday, 6 = Sunday
                
                # Check if market is open
                is_open = (
                    not is_weekend and 
                    market_open <= now <= market_close
                )
                
                # Check for holidays (simplified)
                holidays = [
                    # 2025 US market holidays
                    "2025-01-01",  # New Year's Day
                    "2025-01-20",  # Martin Luther King Jr. Day
                    "2025-02-17",  # Presidents' Day
                    "2025-04-18",  # Good Friday
                    "2025-05-26",  # Memorial Day
                    "2025-07-04",  # Independence Day
                    "2025-09-01",  # Labor Day
                    "2025-11-27",  # Thanksgiving Day
                    "2025-12-25",  # Christmas Day
                ]
                
                today_str = now.strftime("%Y-%m-%d")
                if today_str in holidays:
                    is_open = False
                
                return {
                    "is_open": is_open,
                    "market_open": market_open.isoformat(),
                    "market_close": market_close.isoformat(),
                    "current_time": now.isoformat(),
                    "is_weekend": is_weekend,
                    "timezone": "US/Eastern"
                }
            except Exception as e:
                logger.error(f"Error getting market hours: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting market hours: {str(e)}")
        
        @self.app.get("/api/v1/historical/{symbol}")
        async def get_historical_data(symbol: str, interval: str = "daily", limit: int = 30):
            """
            Get historical market data for a symbol
            
            Args:
                symbol (str): Trading symbol
                interval (str): Data interval (daily, weekly, monthly)
                limit (int): Number of data points to return
                
            Returns:
                Dict[str, Any]: Historical market data
            """
            try:
                # Check cache first
                cache_key = f"historical_{symbol}_{interval}_{limit}"
                if cache_key in self.data_cache:
                    # Check if cache is still valid (1 hour expiration for historical data)
                    if datetime.utcnow() < self.cache_expiration.get(cache_key, datetime.min):
                        return self.data_cache[cache_key]
                
                # Fetch from Alpha Vantage
                historical_data = await self._fetch_alpha_vantage_historical(symbol, interval, limit)
                
                # Cache the result
                self.data_cache[cache_key] = historical_data
                self.cache_expiration[cache_key] = datetime.utcnow() + timedelta(hours=1)
                
                return historical_data
            except Exception as e:
                logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error fetching historical data: {str(e)}")
        
        @self.app.get("/api/v1/market-sentiment")
        async def get_market_sentiment():
            """
            Get overall market sentiment
            
            Returns:
                Dict[str, Any]: Market sentiment data
            """
            try:
                # For now, using simplified approach with mocked market sentiment
                # In a real implementation, this would use actual market data and sentiment analysis
                
                # Check cache
                cache_key = "market_sentiment"
                if cache_key in self.data_cache:
                    # Check if cache is still valid (6 hour expiration for sentiment)
                    if datetime.utcnow() < self.cache_expiration.get(cache_key, datetime.min):
                        return self.data_cache[cache_key]
                
                # Default sentiment (neutral)
                sentiment = {
                    "overall": "neutral",
                    "score": 0.0,
                    "momentum": "neutral",
                    "volatility": "medium",
                    "timestamp": datetime.utcnow().isoformat(),
                    "indicators": {
                        "vix": 15.0,  # Placeholder VIX value
                        "put_call_ratio": 0.9,  # Placeholder put/call ratio
                        "advance_decline": 1.2,  # Placeholder advance/decline ratio
                    }
                }
                
                # TODO: Implement actual sentiment analysis using market data
                
                # Cache the result
                self.data_cache[cache_key] = sentiment
                self.cache_expiration[cache_key] = datetime.utcnow() + timedelta(hours=6)
                
                return sentiment
            except Exception as e:
                logger.error(f"Error getting market sentiment: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting market sentiment: {str(e)}")
        
        @self.app.get("/api/v1/trading-context")
        async def get_trading_context(symbol: Optional[str] = None):
            """
            Get trading context information
            
            Args:
                symbol (Optional[str]): Trading symbol for specific context
                
            Returns:
                Dict[str, Any]: Trading context information
            """
            try:
                # Get market hours
                market_hours = await get_market_hours()
                
                # Get market sentiment
                market_sentiment = await get_market_sentiment()
                
                # Get symbol quote if provided
                symbol_data = None
                if symbol:
                    symbol_data = await get_quote(symbol)
                
                # Combine data
                context = {
                    "market_hours": market_hours,
                    "market_sentiment": market_sentiment,
                    "symbol_data": symbol_data,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                return context
            except Exception as e:
                logger.error(f"Error getting trading context: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting trading context: {str(e)}")
    
    async def _fetch_alpha_vantage_quote(self, symbol: str) -> Dict[str, Any]:
        """
        Fetch real-time quote from Alpha Vantage
        
        Args:
            symbol (str): Trading symbol
            
        Returns:
            Dict[str, Any]: Quote data
        """
        try:
            # Alpha Vantage API endpoint
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={self.alpha_vantage_key}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
            
            # Check for error response
            if "Error Message" in data:
                raise ValueError(data["Error Message"])
            
            # Extract quote data
            global_quote = data.get("Global Quote", {})
            
            if not global_quote:
                raise ValueError(f"No quote data available for {symbol}")
            
            # Format the response
            quote = {
                "symbol": global_quote.get("01. symbol", symbol),
                "price": float(global_quote.get("05. price", 0)),
                "change": float(global_quote.get("09. change", 0)),
                "change_percent": global_quote.get("10. change percent", "0%").strip("%"),
                "volume": int(global_quote.get("06. volume", 0)),
                "latest_trading_day": global_quote.get("07. latest trading day"),
                "previous_close": float(global_quote.get("08. previous close", 0)),
                "open": float(global_quote.get("02. open", 0)),
                "high": float(global_quote.get("03. high", 0)),
                "low": float(global_quote.get("04. low", 0)),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return quote
        except Exception as e:
            logger.error(f"Error fetching Alpha Vantage quote for {symbol}: {str(e)}")
            
            # Return placeholder data for demo/development
            return {
                "symbol": symbol,
                "price": 150.25,
                "change": 2.75,
                "change_percent": "1.85",
                "volume": 1250000,
                "latest_trading_day": datetime.utcnow().strftime("%Y-%m-%d"),
                "previous_close": 147.50,
                "open": 148.00,
                "high": 151.20,
                "low": 147.80,
                "timestamp": datetime.utcnow().isoformat(),
                "note": "Using placeholder data due to API error"
            }
    
    async def _fetch_alpha_vantage_historical(self, symbol: str, interval: str = "daily", limit: int = 30) -> Dict[str, Any]:
        """
        Fetch historical market data from Alpha Vantage
        
        Args:
            symbol (str): Trading symbol
            interval (str): Data interval (daily, weekly, monthly)
            limit (int): Number of data points to return
            
        Returns:
            Dict[str, Any]: Historical market data
        """
        try:
            # Map interval to Alpha Vantage function
            function_map = {
                "daily": "TIME_SERIES_DAILY",
                "weekly": "TIME_SERIES_WEEKLY",
                "monthly": "TIME_SERIES_MONTHLY"
            }
            
            function = function_map.get(interval, "TIME_SERIES_DAILY")
            
            # Alpha Vantage API endpoint
            url = f"https://www.alphavantage.co/query?function={function}&symbol={symbol}&apikey={self.alpha_vantage_key}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
            
            # Check for error response
            if "Error Message" in data:
                raise ValueError(data["Error Message"])
            
            # Extract time series data
            time_series_key = next((key for key in data.keys() if "Time Series" in key), None)
            
            if not time_series_key or not data.get(time_series_key):
                raise ValueError(f"No historical data available for {symbol}")
            
            time_series = data[time_series_key]
            
            # Format the response
            historical_data = []
            
            for date, values in sorted(time_series.items(), reverse=True)[:limit]:
                historical_data.append({
                    "date": date,
                    "open": float(values.get("1. open", 0)),
                    "high": float(values.get("2. high", 0)),
                    "low": float(values.get("3. low", 0)),
                    "close": float(values.get("4. close", 0)),
                    "volume": int(values.get("5. volume", 0))
                })
            
            return {
                "symbol": symbol,
                "interval": interval,
                "data": historical_data,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching Alpha Vantage historical data for {symbol}: {str(e)}")
            
            # Return placeholder data for demo/development
            historical_data = []
            base_price = 150.0
            
            for i in range(limit):
                day_offset = limit - i - 1
                date = (datetime.utcnow() - timedelta(days=day_offset)).strftime("%Y-%m-%d")
                
                # Generate some variation in price
                change = (i % 5 - 2) * 1.5
                price = base_price + change
                
                historical_data.append({
                    "date": date,
                    "open": price - 0.5,
                    "high": price + 1.5,
                    "low": price - 2.0,
                    "close": price + 0.5,
                    "volume": 1000000 + (i * 50000)
                })
            
            return {
                "symbol": symbol,
                "interval": interval,
                "data": historical_data,
                "timestamp": datetime.utcnow().isoformat(),
                "note": "Using placeholder data due to API error"
            }

# Create server instance
def create_market_data_server(config: Dict[str, Any] = None) -> MarketDataServer:
    """
    Create market data server
    
    Args:
        config (Dict[str, Any], optional): Server configuration. Defaults to None.
        
    Returns:
        MarketDataServer: Market data server
    """
    if config is None:
        config = {
            "host": "localhost",
            "port": 8002,
            "name": "market_data"
        }
    
    server = MarketDataServer(config)
    return server

# Start server function
def start_server(config: Dict[str, Any] = None) -> MarketDataServer:
    """
    Start market data server
    
    Args:
        config (Dict[str, Any], optional): Server configuration. Defaults to None.
        
    Returns:
        MarketDataServer: Market data server
    """
    server = create_market_data_server(config)
    server.start()
    return server
