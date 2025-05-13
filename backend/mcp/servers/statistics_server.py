# File: backend/mcp/servers/statistics_server.py
# Purpose: Enhanced MCP server for optimized statistics processing

import logging
import json
import asyncio
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from functools import lru_cache
from collections import defaultdict

from ..mcp_server import MCPServer
from ..tools.pattern_recognition import identify_trade_patterns, detect_mcp_complex_patterns
# Avoid circular imports
# from ...services.trade_service import TradeService
# from ...db.database import get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache TTL in seconds
CACHE_TTL = 300  # 5 minutes

class StatisticsMCPServer(MCPServer):
    """
    Enhanced MCP server for optimized statistics processing
    Provides high-performance statistical analysis capabilities
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the Statistics MCP server
        
        Args:
            config (Dict[str, Any], optional): Server configuration. Defaults to None.
        """
        if config is None:
            config = {
                "name": "statistics",
                "host": "localhost",
                "port": 8081,
                "version": "2.0.0"
            }
        
        super().__init__(config)
        
        # Initialize cache
        self.cache = {}
        self.cache_timestamps = {}
        self.processing_semaphores = {}
        
        # Batch processing queue
        self.batch_queue = asyncio.Queue()
        self.batch_processor_task = None
        
        logger.info(f"Initialized Statistics MCP server with enhanced performance optimizations")
    
    def register_routes(self):
        """Register API routes with optimized processing"""
        
        # Health check endpoint
        @self.app.get("/api/v1/health")
        async def health_check():
            return {"status": "healthy", "server": self.name, "version": self.config.get("version")}
        
        # Performance dashboard stats (optimized)
        @self.app.get("/api/v1/dashboard/{user_id}")
        async def get_dashboard_stats(
            user_id: int,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
        ):
            """
            Get optimized dashboard statistics
            
            Args:
                user_id (int): User ID
                start_date (Optional[str], optional): Start date (YYYY-MM-DD). Defaults to None.
                end_date (Optional[str], optional): End date (YYYY-MM-DD). Defaults to None.
                
            Returns:
                Dict[str, Any]: Dashboard statistics
            """
            try:
                cache_key = f"dashboard_{user_id}_{start_date}_{end_date}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for dashboard stats: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for dashboard stats: {cache_key}")
                        return cached_result
                    
                    # Set default dates if not provided
                    if not end_date:
                        end_date = datetime.now().strftime("%Y-%m-%d")
                    
                    if not start_date:
                        # Default to 30 days before end date
                        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                        start_datetime = end_datetime - timedelta(days=30)
                        start_date = start_datetime.strftime("%Y-%m-%d")
                    
                    # Get trades from the service (in a real implementation, this would be a service call)
                    # trades = await trade_service.get_trades_by_user(user_id, start_date, end_date)
                    
                    # For this example, assume we have the trades data
                    trades = self._get_mock_trades(user_id, start_date, end_date)
                    
                    # Process the data using optimized methods
                    stats = await self._process_dashboard_stats(trades)
                    
                    # Cache the result
                    self._add_to_cache(cache_key, stats)
                    
                    return stats
            
            except Exception as e:
                logger.error(f"Error getting dashboard stats: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting dashboard stats: {str(e)}")
        
        # Win rate by setup type (optimized)
        @self.app.get("/api/v1/win-rate-by-setup/{user_id}")
        async def get_win_rate_by_setup(
            user_id: int,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
        ):
            """
            Get win rate by setup type
            
            Args:
                user_id (int): User ID
                start_date (Optional[str], optional): Start date (YYYY-MM-DD). Defaults to None.
                end_date (Optional[str], optional): End date (YYYY-MM-DD). Defaults to None.
                
            Returns:
                Dict[str, Any]: Win rate by setup type
            """
            try:
                cache_key = f"win_rate_setup_{user_id}_{start_date}_{end_date}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for win rate by setup: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for win rate by setup: {cache_key}")
                        return cached_result
                    
                    # Set default dates if not provided
                    if not end_date:
                        end_date = datetime.now().strftime("%Y-%m-%d")
                    
                    if not start_date:
                        # Default to 30 days before end date
                        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                        start_datetime = end_datetime - timedelta(days=30)
                        start_date = start_datetime.strftime("%Y-%m-%d")
                    
                    # Get trades from the service (in a real implementation, this would be a service call)
                    # trades = await trade_service.get_trades_by_user(user_id, start_date, end_date)
                    
                    # For this example, assume we have the trades data
                    trades = self._get_mock_trades(user_id, start_date, end_date)
                    
                    # Process the data using optimized methods
                    result = await self._calculate_win_rate_by_setup(trades)
                    
                    # Cache the result
                    self._add_to_cache(cache_key, result)
                    
                    return result
            
            except Exception as e:
                logger.error(f"Error getting win rate by setup: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting win rate by setup: {str(e)}")
        
        # Profitability by time of day (optimized)
        @self.app.get("/api/v1/profitability-by-time/{user_id}")
        async def get_profitability_by_time(
            user_id: int,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            interval: Optional[str] = "hour"  # 'hour', 'session', '30min'
        ):
            """
            Get profitability by time of day
            
            Args:
                user_id (int): User ID
                start_date (Optional[str], optional): Start date (YYYY-MM-DD). Defaults to None.
                end_date (Optional[str], optional): End date (YYYY-MM-DD). Defaults to None.
                interval (Optional[str], optional): Time interval. Defaults to "hour".
                
            Returns:
                Dict[str, Any]: Profitability by time of day
            """
            try:
                cache_key = f"profit_time_{user_id}_{start_date}_{end_date}_{interval}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for profitability by time: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for profitability by time: {cache_key}")
                        return cached_result
                    
                    # Set default dates if not provided
                    if not end_date:
                        end_date = datetime.now().strftime("%Y-%m-%d")
                    
                    if not start_date:
                        # Default to 30 days before end date
                        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                        start_datetime = end_datetime - timedelta(days=30)
                        start_date = start_datetime.strftime("%Y-%m-%d")
                    
                    # Validate interval
                    valid_intervals = ["hour", "session", "30min", "15min"]
                    if interval not in valid_intervals:
                        raise HTTPException(status_code=400, detail=f"Invalid interval. Must be one of {valid_intervals}")
                    
                    # Get trades from the service (in a real implementation, this would be a service call)
                    # trades = await trade_service.get_trades_by_user(user_id, start_date, end_date)
                    
                    # For this example, assume we have the trades data
                    trades = self._get_mock_trades(user_id, start_date, end_date)
                    
                    # Process the data using optimized methods
                    result = await self._calculate_profitability_by_time(trades, interval)
                    
                    # Cache the result
                    self._add_to_cache(cache_key, result)
                    
                    return result
            
            except Exception as e:
                logger.error(f"Error getting profitability by time: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting profitability by time: {str(e)}")
        
        # Risk reward analysis (optimized)
        @self.app.get("/api/v1/risk-reward-analysis/{user_id}")
        async def get_risk_reward_analysis(
            user_id: int,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            group_by: Optional[str] = None  # Optional grouping (setup_type, day_of_week, etc.)
        ):
            """
            Get risk reward analysis
            
            Args:
                user_id (int): User ID
                start_date (Optional[str], optional): Start date (YYYY-MM-DD). Defaults to None.
                end_date (Optional[str], optional): End date (YYYY-MM-DD). Defaults to None.
                group_by (Optional[str], optional): Group by field. Defaults to None.
                
            Returns:
                Dict[str, Any]: Risk reward analysis
            """
            try:
                cache_key = f"risk_reward_{user_id}_{start_date}_{end_date}_{group_by}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for risk reward analysis: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for risk reward analysis: {cache_key}")
                        return cached_result
                    
                    # Set default dates if not provided
                    if not end_date:
                        end_date = datetime.now().strftime("%Y-%m-%d")
                    
                    if not start_date:
                        # Default to 30 days before end date
                        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                        start_datetime = end_datetime - timedelta(days=30)
                        start_date = start_datetime.strftime("%Y-%m-%d")
                    
                    # Get trades from the service (in a real implementation, this would be a service call)
                    # trades = await trade_service.get_trades_by_user(user_id, start_date, end_date)
                    
                    # For this example, assume we have the trades data
                    trades = self._get_mock_trades(user_id, start_date, end_date)
                    
                    # Process the data using optimized methods
                    result = await self._calculate_risk_reward_analysis(trades, group_by)
                    
                    # Cache the result
                    self._add_to_cache(cache_key, result)
                    
                    return result
            
            except Exception as e:
                logger.error(f"Error getting risk reward analysis: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting risk reward analysis: {str(e)}")
        
        # Plan adherence correlation (optimized)
        @self.app.get("/api/v1/plan-adherence-correlation/{user_id}")
        async def get_plan_adherence_correlation(
            user_id: int,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
        ):
            """
            Get plan adherence correlation
            
            Args:
                user_id (int): User ID
                start_date (Optional[str], optional): Start date (YYYY-MM-DD). Defaults to None.
                end_date (Optional[str], optional): End date (YYYY-MM-DD). Defaults to None.
                
            Returns:
                Dict[str, Any]: Plan adherence correlation
            """
            try:
                cache_key = f"plan_adherence_{user_id}_{start_date}_{end_date}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for plan adherence correlation: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for plan adherence correlation: {cache_key}")
                        return cached_result
                    
                    # Set default dates if not provided
                    if not end_date:
                        end_date = datetime.now().strftime("%Y-%m-%d")
                    
                    if not start_date:
                        # Default to 30 days before end date
                        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                        start_datetime = end_datetime - timedelta(days=30)
                        start_date = start_datetime.strftime("%Y-%m-%d")
                    
                    # Get trades from the service (in a real implementation, this would be a service call)
                    # trades = await trade_service.get_trades_by_user(user_id, start_date, end_date)
                    
                    # For this example, assume we have the trades data
                    trades = self._get_mock_trades(user_id, start_date, end_date)
                    
                    # Process the data using optimized methods
                    result = await self._calculate_plan_adherence_correlation(trades)
                    
                    # Cache the result
                    self._add_to_cache(cache_key, result)
                    
                    return result
            
            except Exception as e:
                logger.error(f"Error getting plan adherence correlation: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting plan adherence correlation: {str(e)}")
        
        # Emotional analysis (optimized)
        @self.app.get("/api/v1/emotional-analysis/{user_id}")
        async def get_emotional_analysis(
            user_id: int,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
        ):
            """
            Get emotional analysis
            
            Args:
                user_id (int): User ID
                start_date (Optional[str], optional): Start date (YYYY-MM-DD). Defaults to None.
                end_date (Optional[str], optional): End date (YYYY-MM-DD). Defaults to None.
                
            Returns:
                Dict[str, Any]: Emotional analysis
            """
            try:
                cache_key = f"emotional_analysis_{user_id}_{start_date}_{end_date}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for emotional analysis: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for emotional analysis: {cache_key}")
                        return cached_result
                    
                    # Set default dates if not provided
                    if not end_date:
                        end_date = datetime.now().strftime("%Y-%m-%d")
                    
                    if not start_date:
                        # Default to 30 days before end date
                        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                        start_datetime = end_datetime - timedelta(days=30)
                        start_date = start_datetime.strftime("%Y-%m-%d")
                    
                    # Get trades and journal entries (in a real implementation, these would be service calls)
                    # trades = await trade_service.get_trades_by_user(user_id, start_date, end_date)
                    # journals = await journal_service.get_journals_by_user(user_id, start_date, end_date)
                    
                    # For this example, assume we have the trades data
                    trades = self._get_mock_trades(user_id, start_date, end_date)
                    journals = self._get_mock_journals(user_id, start_date, end_date)
                    
                    # Process the data using optimized methods
                    result = await self._calculate_emotional_analysis(trades, journals)
                    
                    # Cache the result
                    self._add_to_cache(cache_key, result)
                    
                    return result
            
            except Exception as e:
                logger.error(f"Error getting emotional analysis: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error getting emotional analysis: {str(e)}")
        
        # Batch statistics processing endpoint
        @self.app.post("/api/v1/batch-process-stats")
        async def batch_process_stats(request: Request):
            """
            Batch process multiple statistics requests
            
            Args:
                request (Request): The request containing batch processing parameters
                
            Returns:
                Dict[str, Any]: Status of the batch request
            """
            try:
                # Parse the request body
                body = await request.json()
                
                # Validate the request
                if not isinstance(body, dict) or "requests" not in body:
                    raise HTTPException(status_code=400, detail="Invalid request format")
                
                requests = body["requests"]
                if not isinstance(requests, list):
                    raise HTTPException(status_code=400, detail="Requests must be a list")
                
                # Add each request to the batch processing queue
                batch_id = f"batch_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(requests)}"
                
                # Start the batch processor if not already running
                if self.batch_processor_task is None or self.batch_processor_task.done():
                    self.batch_processor_task = asyncio.create_task(self._batch_processor())
                
                # Add each request to the queue
                for req in requests:
                    await self.batch_queue.put((batch_id, req))
                
                return {
                    "status": "processing",
                    "batch_id": batch_id,
                    "request_count": len(requests),
                    "estimated_completion_seconds": len(requests) * 0.5  # Rough estimate
                }
            
            except Exception as e:
                logger.error(f"Error processing batch stats request: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing batch request: {str(e)}")
        
        # Advanced pattern analysis with MCP optimization
        @self.app.post("/api/v1/advanced-pattern-analysis")
        async def advanced_pattern_analysis(request: Request):
            """
            Perform advanced pattern analysis with MCP optimization
            
            Args:
                request (Request): The request containing trades and parameters
                
            Returns:
                Dict[str, Any]: Advanced pattern analysis results
            """
            try:
                # Parse the request body
                body = await request.json()
                
                # Validate the request
                if not isinstance(body, dict) or "trades" not in body:
                    raise HTTPException(status_code=400, detail="Invalid request format")
                
                trades = body["trades"]
                use_mcp = body.get("use_mcp", True)
                
                # Optional market data for context
                market_data = body.get("market_data")
                
                # Generate a cache key based on the request content
                # In a real implementation, you'd use a hash of the trades data
                cache_key = f"advanced_pattern_{len(trades)}_{use_mcp}_{datetime.now().strftime('%Y%m%d')}"
                
                # Try to get from cache first
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for advanced pattern analysis: {cache_key}")
                    return cached_result
                
                # Get a semaphore for this specific query to prevent duplicate processing
                async with await self._get_processing_semaphore(cache_key):
                    # Check cache again in case another request calculated this while we were waiting
                    cached_result = self._get_from_cache(cache_key)
                    if cached_result:
                        logger.info(f"Cache hit after semaphore for advanced pattern analysis: {cache_key}")
                        return cached_result
                    
                    # Process the data using optimized methods
                    if use_mcp:
                        patterns = detect_mcp_complex_patterns(trades, market_data)
                    else:
                        patterns = identify_trade_patterns(trades)
                    
                    # Format the result
                    result = {
                        "patterns": patterns,
                        "analysis_time": datetime.now().isoformat(),
                        "pattern_count": len(patterns),
                        "use_mcp": use_mcp
                    }
                    
                    # Cache the result
                    self._add_to_cache(cache_key, result)
                    
                    return result
            
            except Exception as e:
                logger.error(f"Error performing advanced pattern analysis: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error performing advanced pattern analysis: {str(e)}")
    
    async def _batch_processor(self):
        """Background task for processing batch requests"""
        while True:
            try:
                # Get the next request from the queue
                batch_id, request = await self.batch_queue.get()
                
                # Process the request
                try:
                    # Extract request type and parameters
                    req_type = request.get("type")
                    
                    # Process based on type
                    if req_type == "win_rate_by_setup":
                        user_id = request.get("user_id")
                        start_date = request.get("start_date")
                        end_date = request.get("end_date")
                        
                        # Get trades
                        trades = self._get_mock_trades(user_id, start_date, end_date)
                        
                        # Calculate and cache
                        result = await self._calculate_win_rate_by_setup(trades)
                        self._add_to_cache(f"win_rate_setup_{user_id}_{start_date}_{end_date}", result)
                    
                    elif req_type == "profitability_by_time":
                        user_id = request.get("user_id")
                        start_date = request.get("start_date")
                        end_date = request.get("end_date")
                        interval = request.get("interval", "hour")
                        
                        # Get trades
                        trades = self._get_mock_trades(user_id, start_date, end_date)
                        
                        # Calculate and cache
                        result = await self._calculate_profitability_by_time(trades, interval)
                        self._add_to_cache(f"profit_time_{user_id}_{start_date}_{end_date}_{interval}", result)
                    
                    # Add more types as needed
                
                except Exception as e:
                    logger.error(f"Error processing batch request: {str(e)}")
                
                # Mark the task as done
                self.batch_queue.task_done()
            
            except asyncio.CancelledError:
                # Clean exit if the task is cancelled
                break
            except Exception as e:
                logger.error(f"Error in batch processor: {str(e)}")
                # Sleep briefly to avoid tight loop in case of persistent errors
                await asyncio.sleep(1)
    
    def _get_from_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get a result from the cache if it exists and is not expired
        
        Args:
            key (str): Cache key
            
        Returns:
            Optional[Dict[str, Any]]: Cached result or None
        """
        if key in self.cache:
            timestamp = self.cache_timestamps.get(key, 0)
            current_time = datetime.now().timestamp()
            
            # Check if the cache entry is still valid
            if current_time - timestamp <= CACHE_TTL:
                return self.cache[key]
            else:
                # Remove expired entry
                del self.cache[key]
                del self.cache_timestamps[key]
        
        return None
    
    def _add_to_cache(self, key: str, value: Dict[str, Any]):
        """
        Add a result to the cache
        
        Args:
            key (str): Cache key
            value (Dict[str, Any]): Value to cache
        """
        self.cache[key] = value
        self.cache_timestamps[key] = datetime.now().timestamp()
        
        # Prune cache if it gets too large (simple LRU implementation)
        if len(self.cache) > 100:
            # Remove the oldest 20% of entries
            entries = sorted(self.cache_timestamps.items(), key=lambda x: x[1])
            for old_key, _ in entries[:20]:
                del self.cache[old_key]
                del self.cache_timestamps[old_key]
    
    async def _get_processing_semaphore(self, key: str):
        """
        Get a semaphore for a specific processing task to prevent duplicate work
        
        Args:
            key (str): Task key
            
        Returns:
            asyncio.Semaphore: The semaphore for this task
        """
        if key not in self.processing_semaphores:
            self.processing_semaphores[key] = asyncio.Semaphore(1)
        
        return self.processing_semaphores[key]
    
    async def _process_dashboard_stats(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process dashboard statistics with optimized methods
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            
        Returns:
            Dict[str, Any]: Dashboard statistics
        """
        # Optimized implementation using pandas for better performance
        if not trades:
            return {
                "win_rate": 0,
                "profit_loss": 0,
                "avg_win": 0,
                "avg_loss": 0,
                "total_trades": 0,
                "recent_performance": [],
                "best_setups": []
            }
        
        # Convert to DataFrame for faster processing
        df = pd.DataFrame(trades)
        
        # Calculate win rate
        win_rate = 0
        if 'outcome' in df.columns:
            wins = df['outcome'].str.lower().eq('win').sum()
            total = len(df)
            win_rate = (wins / total) * 100 if total > 0 else 0
        
        # Calculate profit/loss statistics
        profit_loss = df['profit_loss'].sum() if 'profit_loss' in df.columns else 0
        
        # Calculate average win and loss
        avg_win = 0
        avg_loss = 0
        
        if 'profit_loss' in df.columns and 'outcome' in df.columns:
            win_mask = df['outcome'].str.lower().eq('win')
            loss_mask = df['outcome'].str.lower().eq('loss')
            
            wins_df = df[win_mask]
            losses_df = df[loss_mask]
            
            avg_win = wins_df['profit_loss'].mean() if not wins_df.empty else 0
            avg_loss = losses_df['profit_loss'].mean() if not losses_df.empty else 0
        
        # Calculate recent performance (last 10 trades)
        recent_trades = df.sort_values('entry_time', ascending=False).head(10) if 'entry_time' in df.columns else df.head(10)
        recent_performance = []
        
        for _, trade in recent_trades.iterrows():
            recent_performance.append({
                "date": trade.get('entry_time', '').split('T')[0] if isinstance(trade.get('entry_time', ''), str) else '',
                "profit_loss": float(trade.get('profit_loss', 0)),
                "outcome": trade.get('outcome', ''),
                "setup_type": trade.get('setup_type', '')
            })
        
        # Calculate best setups
        best_setups = []
        
        if 'setup_type' in df.columns and 'outcome' in df.columns:
            setup_stats = df.groupby('setup_type').agg({
                'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
                'profit_loss': 'sum',
                'id': 'count'
            }).reset_index()
            
            setup_stats.columns = ['setup_type', 'win_rate', 'profit_loss', 'count']
            
            # Filter to setups with at least 3 trades
            setup_stats = setup_stats[setup_stats['count'] >= 3]
            
            # Sort by win rate and get top 3
            best_by_win_rate = setup_stats.sort_values('win_rate', ascending=False).head(3)
            
            for _, setup in best_by_win_rate.iterrows():
                best_setups.append({
                    "setup_type": setup['setup_type'],
                    "win_rate": float(setup['win_rate']),
                    "profit_loss": float(setup['profit_loss']),
                    "count": int(setup['count'])
                })
        
        return {
            "win_rate": float(win_rate),
            "profit_loss": float(profit_loss),
            "avg_win": float(avg_win),
            "avg_loss": float(avg_loss),
            "total_trades": len(df),
            "recent_performance": recent_performance,
            "best_setups": best_setups
        }
    
    async def _calculate_win_rate_by_setup(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate win rate by setup type with optimized methods
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            
        Returns:
            Dict[str, Any]: Win rate by setup type
        """
        if not trades:
            return {
                "setups": [],
                "total_trades": 0,
                "overall_win_rate": 0
            }
        
        # Convert to DataFrame for faster processing
        df = pd.DataFrame(trades)
        
        # Generate default columns if missing
        if 'setup_type' not in df.columns:
            df['setup_type'] = 'Unknown'
        
        if 'outcome' not in df.columns:
            df['outcome'] = 'Unknown'
        
        if 'profit_loss' not in df.columns:
            df['profit_loss'] = 0
        
        # Calculate overall win rate
        total_trades = len(df)
        overall_wins = df['outcome'].str.lower().eq('win').sum()
        overall_win_rate = (overall_wins / total_trades) * 100 if total_trades > 0 else 0
        
        # Calculate win rate by setup type
        setup_stats = df.groupby('setup_type').agg({
            'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
            'profit_loss': 'sum',
            'id': 'count'
        }).reset_index()
        
        setup_stats.columns = ['setup_type', 'win_rate', 'profit_loss', 'count']
        
        # Sort by count (descending) and convert to list of dicts
        setups = []
        for _, row in setup_stats.sort_values('count', ascending=False).iterrows():
            setups.append({
                "setup_type": row['setup_type'],
                "win_rate": float(row['win_rate']),
                "profit_loss": float(row['profit_loss']),
                "count": int(row['count']),
                "percentage": (int(row['count']) / total_trades) * 100 if total_trades > 0 else 0
            })
        
        return {
            "setups": setups,
            "total_trades": total_trades,
            "overall_win_rate": float(overall_win_rate)
        }
    
    async def _calculate_profitability_by_time(self, trades: List[Dict[str, Any]], interval: str = "hour") -> Dict[str, Any]:
        """
        Calculate profitability by time of day with optimized methods
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            interval (str, optional): Time interval. Defaults to "hour".
            
        Returns:
            Dict[str, Any]: Profitability by time of day
        """
        if not trades:
            return {
                "time_slots": [],
                "best_time": None,
                "worst_time": None,
                "total_trades": 0
            }
        
        # Convert to DataFrame for faster processing
        df = pd.DataFrame(trades)
        
        # Ensure datetime columns
        for col in ['entry_time', 'exit_time']:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Filter out invalid entries
        df = df.dropna(subset=['entry_time', 'profit_loss', 'outcome'])
        
        if df.empty:
            return {
                "time_slots": [],
                "best_time": None,
                "worst_time": None,
                "total_trades": 0
            }
        
        # Define time slots based on interval
        if interval == "hour":
            df['time_slot'] = df['entry_time'].dt.hour
            df['time_slot_display'] = df['entry_time'].dt.strftime('%H:00')
        elif interval == "30min":
            df['time_slot'] = df['entry_time'].dt.hour * 2 + (df['entry_time'].dt.minute >= 30).astype(int)
            df['time_slot_display'] = df.apply(
                lambda x: f"{x['entry_time'].hour}:{30 if x['entry_time'].minute >= 30 else 00:02d}",
                axis=1
            )
        elif interval == "15min":
            df['time_slot'] = df['entry_time'].dt.hour * 4 + (df['entry_time'].dt.minute // 15)
            df['time_slot_display'] = df.apply(
                lambda x: f"{x['entry_time'].hour}:{(x['entry_time'].minute // 15) * 15:02d}",
                axis=1
            )
        elif interval == "session":
            # Define market sessions
            def get_session(hour):
                if 9 <= hour <= 10:  # 9:30-11:00 AM
                    return "Opening (9:30-11:00 AM)"
                elif 11 <= hour <= 13:  # 11:00 AM-2:00 PM
                    return "Mid-day (11:00 AM-2:00 PM)"
                elif 14 <= hour <= 16:  # 2:00-4:00 PM
                    return "Closing (2:00-4:00 PM)"
                else:
                    return "After-hours"
            
            df['time_slot'] = df['entry_time'].dt.hour.apply(get_session)
            df['time_slot_display'] = df['time_slot']
        
        # Calculate statistics by time slot
        time_slot_stats = df.groupby(['time_slot', 'time_slot_display']).agg({
            'profit_loss': 'sum',
            'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
            'id': 'count'
        }).reset_index()
        
        time_slot_stats.columns = ['time_slot', 'time_slot_display', 'profit_loss', 'win_rate', 'count']
        
        # Convert to list of dicts for response
        time_slots = []
        for _, row in time_slot_stats.iterrows():
            time_slots.append({
                "time_slot": row['time_slot'],
                "display": row['time_slot_display'],
                "profit_loss": float(row['profit_loss']),
                "win_rate": float(row['win_rate']),
                "count": int(row['count']),
                "avg_profit": float(row['profit_loss'] / row['count']) if row['count'] > 0 else 0
            })
        
        # Identify best and worst time slots
        if time_slots:
            best_time = max(time_slots, key=lambda x: x['profit_loss']) if time_slots else None
            worst_time = min(time_slots, key=lambda x: x['profit_loss']) if time_slots else None
        else:
            best_time = None
            worst_time = None
        
        return {
            "time_slots": time_slots,
            "best_time": best_time,
            "worst_time": worst_time,
            "total_trades": len(df)
        }
    
    async def _calculate_risk_reward_analysis(self, trades: List[Dict[str, Any]], group_by: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculate risk reward analysis with optimized methods
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            group_by (Optional[str], optional): Group by field. Defaults to None.
            
        Returns:
            Dict[str, Any]: Risk reward analysis
        """
        if not trades:
            return {
                "overall": {
                    "avg_risk_reward": 0,
                    "win_rate": 0,
                    "expected_value": 0,
                    "total_trades": 0
                },
                "categories": [],
                "recommendations": []
            }
        
        # Convert to DataFrame for faster processing
        df = pd.DataFrame(trades)
        
        # Generate default columns if missing
        for col in ['planned_risk_reward', 'actual_risk_reward', 'outcome', 'profit_loss']:
            if col not in df.columns:
                df[col] = 0 if col != 'outcome' else 'Unknown'
        
        # Check for alternative column names
        if df['planned_risk_reward'].isna().all():
            for alt in ['planned_rr', 'risk_reward_planned']:
                if alt in df.columns:
                    df['planned_risk_reward'] = df[alt]
                    break
        
        if df['actual_risk_reward'].isna().all():
            for alt in ['actual_rr', 'risk_reward_actual']:
                if alt in df.columns:
                    df['actual_risk_reward'] = df[alt]
                    break
        
        # Filter out invalid entries
        df = df.dropna(subset=['planned_risk_reward', 'outcome'])
        
        if df.empty:
            return {
                "overall": {
                    "avg_risk_reward": 0,
                    "win_rate": 0,
                    "expected_value": 0,
                    "total_trades": 0
                },
                "categories": [],
                "recommendations": []
            }
        
        # Calculate overall statistics
        total_trades = len(df)
        overall_win_rate = (df['outcome'].str.lower().eq('win').sum() / total_trades) * 100
        avg_planned_rr = df['planned_risk_reward'].mean()
        avg_actual_rr = df['actual_risk_reward'].mean()
        expected_value = (overall_win_rate / 100 * avg_planned_rr) - (1 - overall_win_rate / 100)
        
        # Create risk:reward categories
        def categorize_rr(rr):
            if rr < 1.0:
                return "Low (<1.0)"
            elif rr < 2.0:
                return "Medium (1.0-2.0)"
            else:
                return "High (>2.0)"
        
        df['rr_category'] = df['planned_risk_reward'].apply(categorize_rr)
        
        # Group by risk:reward category
        rr_stats = df.groupby('rr_category').agg({
            'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
            'profit_loss': 'sum',
            'planned_risk_reward': 'mean',
            'actual_risk_reward': 'mean',
            'id': 'count'
        }).reset_index()
        
        rr_stats.columns = ['category', 'win_rate', 'profit_loss', 'avg_planned_rr', 'avg_actual_rr', 'count']
        
        # Calculate expected value for each category
        rr_stats['expected_value'] = (rr_stats['win_rate'] / 100 * rr_stats['avg_planned_rr']) - (1 - rr_stats['win_rate'] / 100)
        
        # Filter to categories with at least 3 trades
        rr_stats = rr_stats[rr_stats['count'] >= 3]
        
        # Convert to list of dicts for response
        categories = []
        for _, row in rr_stats.iterrows():
            categories.append({
                "category": row['category'],
                "win_rate": float(row['win_rate']),
                "profit_loss": float(row['profit_loss']),
                "avg_planned_rr": float(row['avg_planned_rr']),
                "avg_actual_rr": float(row['avg_actual_rr']),
                "expected_value": float(row['expected_value']),
                "count": int(row['count'])
            })
        
        # Sort by expected value (descending)
        categories.sort(key=lambda x: x['expected_value'], reverse=True)
        
        # Generate recommendations
        recommendations = []
        
        if categories:
            best_category = categories[0]
            
            if best_category['category'] == "Low (<1.0)":
                recommendations.append(
                    "Your data suggests focusing on setups with lower risk:reward ratios (below 1.0) may be more effective given your current win rate."
                )
            elif best_category['category'] == "Medium (1.0-2.0)":
                recommendations.append(
                    "Your optimal risk:reward ratio appears to be between 1.0 and 2.0, balancing win rate with profit potential."
                )
            else:  # High (>2.0)
                recommendations.append(
                    "Your data supports targeting higher risk:reward ratios (above 2.0), which maximizes expected value despite a potentially lower win rate."
                )
            
            if abs(avg_planned_rr - avg_actual_rr) > 0.5:
                if avg_actual_rr < avg_planned_rr:
                    recommendations.append(
                        "You're consistently achieving lower risk:reward than planned. Consider letting winners run longer or tightening your stops."
                    )
                else:
                    recommendations.append(
                        "You're achieving better risk:reward than planned. This is positive, but ensure you're not using overly conservative targets."
                    )
        
        # Group by another field if specified
        grouped_analysis = None
        if group_by and group_by in df.columns:
            # Group by the specified field
            group_stats = df.groupby([group_by, 'rr_category']).agg({
                'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
                'profit_loss': 'sum',
                'planned_risk_reward': 'mean',
                'actual_risk_reward': 'mean',
                'id': 'count'
            }).reset_index()
            
            group_stats.columns = [group_by, 'rr_category', 'win_rate', 'profit_loss', 'avg_planned_rr', 'avg_actual_rr', 'count']
            
            # Calculate expected value
            group_stats['expected_value'] = (group_stats['win_rate'] / 100 * group_stats['avg_planned_rr']) - (1 - group_stats['win_rate'] / 100)
            
            # Filter to entries with at least 3 trades
            group_stats = group_stats[group_stats['count'] >= 3]
            
            # Convert to nested dictionary for easier consumption
            grouped_analysis = {}
            
            for _, row in group_stats.iterrows():
                group_value = row[group_by]
                rr_category = row['rr_category']
                
                if group_value not in grouped_analysis:
                    grouped_analysis[group_value] = {}
                
                grouped_analysis[group_value][rr_category] = {
                    "win_rate": float(row['win_rate']),
                    "profit_loss": float(row['profit_loss']),
                    "avg_planned_rr": float(row['avg_planned_rr']),
                    "avg_actual_rr": float(row['avg_actual_rr']),
                    "expected_value": float(row['expected_value']),
                    "count": int(row['count'])
                }
        
        return {
            "overall": {
                "avg_planned_rr": float(avg_planned_rr),
                "avg_actual_rr": float(avg_actual_rr),
                "win_rate": float(overall_win_rate),
                "expected_value": float(expected_value),
                "total_trades": total_trades
            },
            "categories": categories,
            "recommendations": recommendations,
            "grouped_analysis": grouped_analysis
        }
    
    async def _calculate_plan_adherence_correlation(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate plan adherence correlation with optimized methods
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            
        Returns:
            Dict[str, Any]: Plan adherence correlation
        """
        if not trades:
            return {
                "overall": {
                    "avg_adherence": 0,
                    "correlation_strength": 0,
                    "total_trades": 0
                },
                "categories": [],
                "recommendations": []
            }
        
        # Convert to DataFrame for faster processing
        df = pd.DataFrame(trades)
        
        # Check if we have plan adherence data
        if 'plan_adherence' not in df.columns or df['plan_adherence'].isna().all():
            return {
                "overall": {
                    "avg_adherence": 0,
                    "correlation_strength": 0,
                    "total_trades": 0
                },
                "categories": [],
                "recommendations": [
                    "No plan adherence data found. Consider tracking how closely you follow your trading plan for each trade."
                ]
            }
        
        # Filter out invalid entries
        df = df.dropna(subset=['plan_adherence', 'outcome', 'profit_loss'])
        
        if df.empty:
            return {
                "overall": {
                    "avg_adherence": 0,
                    "correlation_strength": 0,
                    "total_trades": 0
                },
                "categories": [],
                "recommendations": []
            }
        
        # Calculate overall statistics
        total_trades = len(df)
        avg_adherence = df['plan_adherence'].mean()
        
        # Create adherence categories
        def categorize_adherence(adherence):
            # Assuming plan_adherence is on a 1-10 scale
            if adherence <= 3:
                return "Low (1-3)"
            elif adherence <= 7:
                return "Medium (4-7)"
            else:
                return "High (8-10)"
        
        df['adherence_category'] = df['plan_adherence'].apply(categorize_adherence)
        
        # Group by adherence category
        adherence_stats = df.groupby('adherence_category').agg({
            'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
            'profit_loss': 'mean',
            'plan_adherence': 'mean',
            'id': 'count'
        }).reset_index()
        
        adherence_stats.columns = ['category', 'win_rate', 'avg_pnl', 'avg_adherence', 'count']
        
        # Convert to list of dicts for response
        categories = []
        for _, row in adherence_stats.iterrows():
            categories.append({
                "category": row['category'],
                "win_rate": float(row['win_rate']),
                "avg_pnl": float(row['avg_pnl']),
                "avg_adherence": float(row['avg_adherence']),
                "count": int(row['count'])
            })
        
        # Calculate correlation strength (simplified)
        correlation_strength = 0
        if len(categories) >= 2:
            # Sort by adherence level
            sorted_categories = sorted(categories, key=lambda x: x['avg_adherence'])
            
            # Check if win rate increases with adherence
            if sorted_categories[-1]['win_rate'] > sorted_categories[0]['win_rate']:
                # Calculate a simple normalized correlation value
                win_rate_diff = sorted_categories[-1]['win_rate'] - sorted_categories[0]['win_rate']
                adherence_diff = sorted_categories[-1]['avg_adherence'] - sorted_categories[0]['avg_adherence']
                
                if adherence_diff > 0:
                    correlation_strength = min(1.0, win_rate_diff / 100)
        
        # Generate recommendations
        recommendations = []
        
        # Check if there's a strong correlation
        if correlation_strength > 0.3:
            recommendations.append(
                "Your data shows a strong correlation between plan adherence and trading success. Focus on strictly following your trading plan."
            )
            
            if len(categories) >= 2:
                high_adherence = next((c for c in categories if c['category'] == "High (8-10)"), None)
                low_adherence = next((c for c in categories if c['category'] == "Low (1-3)"), None)
                
                if high_adherence and low_adherence:
                    win_rate_diff = high_adherence['win_rate'] - low_adherence['win_rate']
                    pnl_diff = high_adherence['avg_pnl'] - low_adherence['avg_pnl']
                    
                    if win_rate_diff > 20:
                        recommendations.append(
                            f"Trades with high plan adherence have a {win_rate_diff:.1f}% higher win rate than trades with low adherence."
                        )
                    
                    if pnl_diff > 0:
                        recommendations.append(
                            f"Your average P&L is ${pnl_diff:.2f} higher when you closely follow your trading plan."
                        )
        elif correlation_strength > 0:
            recommendations.append(
                "There is a modest correlation between plan adherence and trading outcomes. Consider refining your trading plan."
            )
        else:
            recommendations.append(
                "Your current trading plan may need revision as adherence doesn't strongly correlate with better outcomes."
            )
        
        # Additional recommendations
        recommendations.append(
            "Create a pre-trade checklist to ensure consistent plan adherence for every trade."
        )
        
        return {
            "overall": {
                "avg_adherence": float(avg_adherence),
                "correlation_strength": float(correlation_strength),
                "total_trades": total_trades
            },
            "categories": categories,
            "recommendations": recommendations
        }
    
    async def _calculate_emotional_analysis(self, trades: List[Dict[str, Any]], journals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate emotional analysis with optimized methods
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            journals (List[Dict[str, Any]]): List of journal entries
            
        Returns:
            Dict[str, Any]: Emotional analysis
        """
        if not trades:
            return {
                "emotional_states": [],
                "emotional_trends": {
                    "dominant_emotions": [],
                    "sentiment_trend": "insufficient data"
                },
                "recommendations": [
                    "No trade data found for emotional analysis."
                ]
            }
        
        # Convert to DataFrame for faster processing
        trades_df = pd.DataFrame(trades)
        
        # Check if we have emotional state data
        if 'emotional_state' not in trades_df.columns or trades_df['emotional_state'].isna().all():
            return {
                "emotional_states": [],
                "emotional_trends": {
                    "dominant_emotions": [],
                    "sentiment_trend": "insufficient data"
                },
                "recommendations": [
                    "No emotional state data found. Consider tracking your emotional state for each trade."
                ]
            }
        
        # Filter out invalid entries
        trades_df = trades_df.dropna(subset=['emotional_state', 'outcome', 'profit_loss'])
        
        if trades_df.empty:
            return {
                "emotional_states": [],
                "emotional_trends": {
                    "dominant_emotions": [],
                    "sentiment_trend": "insufficient data"
                },
                "recommendations": [
                    "Insufficient valid trade data for emotional analysis."
                ]
            }
        
        # Group by emotional state
        emotion_stats = trades_df.groupby('emotional_state').agg({
            'outcome': lambda x: (x.str.lower().eq('win').sum() / len(x)) * 100 if len(x) > 0 else 0,
            'profit_loss': 'mean',
            'id': 'count'
        }).reset_index()
        
        emotion_stats.columns = ['emotional_state', 'win_rate', 'avg_pnl', 'count']
        
        # Filter to emotions with at least 3 trades
        emotion_stats = emotion_stats[emotion_stats['count'] >= 3]
        
        # Sort by win rate (descending)
        emotion_stats = emotion_stats.sort_values('win_rate', ascending=False)
        
        # Convert to list of dicts for response
        emotional_states = []
        for _, row in emotion_stats.iterrows():
            emotional_states.append({
                "emotional_state": row['emotional_state'],
                "win_rate": float(row['win_rate']),
                "avg_pnl": float(row['avg_pnl']),
                "count": int(row['count'])
            })
        
        # Analyze journal entries if available
        emotional_trends = {
            "dominant_emotions": [],
            "sentiment_trend": "insufficient data",
            "negative_dominant": False,
            "mood_trading_correlation": 0
        }
        
        if journals and len(journals) > 0:
            # Convert to DataFrame
            journals_df = pd.DataFrame(journals)
            
            # Extract dominant emotions (simplified)
            if 'mood_rating' in journals_df.columns or 'emotional_state' in journals_df.columns:
                # Use emotional_state if available, otherwise mood_rating
                if 'emotional_state' in journals_df.columns and not journals_df['emotional_state'].isna().all():
                    emotion_counts = journals_df['emotional_state'].value_counts()
                    dominant_emotions = emotion_counts.index.tolist()[:3]  # Top 3 emotions
                    emotional_trends["dominant_emotions"] = dominant_emotions
                elif 'mood_rating' in journals_df.columns and not journals_df['mood_rating'].isna().all():
                    # Simplistic mapping of mood ratings to emotions
                    def mood_to_emotion(mood):
                        if mood <= 3:
                            return "Negative"
                        elif mood <= 7:
                            return "Neutral"
                        else:
                            return "Positive"
                    
                    journals_df['emotion'] = journals_df['mood_rating'].apply(mood_to_emotion)
                    emotion_counts = journals_df['emotion'].value_counts()
                    dominant_emotions = emotion_counts.index.tolist()
                    emotional_trends["dominant_emotions"] = dominant_emotions
            
            # Determine sentiment trend (simplified)
            if 'date' in journals_df.columns and ('mood_rating' in journals_df.columns or 'emotional_state' in journals_df.columns):
                journals_df['date'] = pd.to_datetime(journals_df['date'], errors='coerce')
                journals_df = journals_df.sort_values('date')
                
                if 'mood_rating' in journals_df.columns and not journals_df['mood_rating'].isna().all():
                    # Split into two halves
                    mid_point = len(journals_df) // 2
                    first_half = journals_df.iloc[:mid_point]
                    second_half = journals_df.iloc[mid_point:]
                    
                    first_half_avg = first_half['mood_rating'].mean()
                    second_half_avg = second_half['mood_rating'].mean()
                    
                    if second_half_avg - first_half_avg > 1:
                        emotional_trends["sentiment_trend"] = "improving"
                    elif first_half_avg - second_half_avg > 1:
                        emotional_trends["sentiment_trend"] = "declining"
                    else:
                        emotional_trends["sentiment_trend"] = "stable"
                        
                    # Check for negative dominance
                    if 'mood_rating' in journals_df.columns:
                        negative_ratings = (journals_df['mood_rating'] <= 4).sum()
                        emotional_trends["negative_dominant"] = negative_ratings > (len(journals_df) / 2)
        
        # Generate recommendations
        recommendations = []
        
        if emotional_states:
            best_emotion = emotional_states[0]
            worst_emotion = emotional_states[-1] if len(emotional_states) > 1 else None
            
            recommendations.append(
                f"Trading when you feel '{best_emotion['emotional_state']}' correlates with your highest win rate ({best_emotion['win_rate']:.1f}%)."
            )
            
            if worst_emotion:
                win_rate_diff = best_emotion['win_rate'] - worst_emotion['win_rate']
                
                if win_rate_diff > 20:
                    recommendations.append(
                        f"Consider not trading or reducing position size when feeling '{worst_emotion['emotional_state']}' ({worst_emotion['win_rate']:.1f}% win rate)."
                    )
            
            recommendations.append(
                "Develop a pre-trading routine to cultivate your optimal emotional state before market open."
            )
        
        if emotional_trends["sentiment_trend"] != "insufficient data":
            if emotional_trends["sentiment_trend"] == "declining":
                recommendations.append(
                    "Your emotional state has been declining over time. Consider taking a short break or implementing stress management techniques."
                )
            elif emotional_trends["sentiment_trend"] == "improving":
                recommendations.append(
                    "Your emotional state has been improving over time. Identify what's working well and continue those practices."
                )
        
        if emotional_trends["negative_dominant"]:
            recommendations.append(
                "Your trading journals show predominantly negative emotions. Focus on psychological self-care and maintain a healthy work-life balance."
            )
        
        return {
            "emotional_states": emotional_states,
            "emotional_trends": emotional_trends,
            "recommendations": recommendations
        }
    
    def _get_mock_trades(self, user_id: int, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get mock trades for testing
        
        Args:
            user_id (int): User ID
            start_date (str): Start date
            end_date (str): End date
            
        Returns:
            List[Dict[str, Any]]: List of mock trades
        """
        # This is a placeholder for testing - in a real implementation,
        # this would be a service call to get actual trades from the database
        return [
            {
                "id": 1,
                "user_id": user_id,
                "entry_time": "2025-05-01T09:45:00",
                "exit_time": "2025-05-01T10:15:00",
                "symbol": "NQ",
                "setup_type": "MMXM Breakout",
                "outcome": "Win",
                "profit_loss": 250.0,
                "planned_risk_reward": 2.5,
                "actual_risk_reward": 2.0,
                "emotional_state": "Focused",
                "plan_adherence": 9
            },
            {
                "id": 2,
                "user_id": user_id,
                "entry_time": "2025-05-02T11:30:00",
                "exit_time": "2025-05-02T12:00:00",
                "symbol": "NQ",
                "setup_type": "ICT Order Block",
                "outcome": "Loss",
                "profit_loss": -125.0,
                "planned_risk_reward": 3.0,
                "actual_risk_reward": 0.0,
                "emotional_state": "Anxious",
                "plan_adherence": 6
            },
            # Add more mock trades as needed
        ]
    
    def _get_mock_journals(self, user_id: int, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get mock journal entries for testing
        
        Args:
            user_id (int): User ID
            start_date (str): Start date
            end_date (str): End date
            
        Returns:
            List[Dict[str, Any]]: List of mock journal entries
        """
        # This is a placeholder for testing - in a real implementation,
        # this would be a service call to get actual journal entries from the database
        return [
            {
                "id": 1,
                "user_id": user_id,
                "date": "2025-05-01",
                "content": "Felt focused today and had a good trading session.",
                "mood_rating": 8,
                "emotional_state": "Focused"
            },
            {
                "id": 2,
                "user_id": user_id,
                "date": "2025-05-02",
                "content": "Struggled with anxiety during trading.",
                "mood_rating": 4,
                "emotional_state": "Anxious"
            },
            # Add more mock journals as needed
        ]
    
    async def start(self):
        """Start the server and background tasks"""
        # Start the batch processor if not already running
        if self.batch_processor_task is None or self.batch_processor_task.done():
            self.batch_processor_task = asyncio.create_task(self._batch_processor())
        
        # Start the server
        await super().start()
    
    async def stop(self):
        """Stop the server and clean up"""
        # Cancel the batch processor
        if self.batch_processor_task and not self.batch_processor_task.done():
            self.batch_processor_task.cancel()
            try:
                await self.batch_processor_task
            except asyncio.CancelledError:
                pass
        
        # Stop the server
        await super().stop()

# Create server instance
statistics_server = StatisticsMCPServer()

# Start server function
def start_server():
    """Start Statistics MCP server"""
    return statistics_server

# Get statistics client
def get_statistics_client():
    """
    Get Statistics client
    
    Returns:
        object: Statistics client
    """
    from ..mcp_client import MCPClient
    from ..mcp_config import get_mcp_config
    
    config = get_mcp_config()
    client = MCPClient(config)
    
    return client.statistics