# File: backend/mcp/mcp_server.py
# Purpose: Base MCP server class

import os
import json
import logging
import threading
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Callable
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCPServer(ABC):
    """Base MCP server class"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize MCP server
        
        Args:
            config (Dict[str, Any]): Server configuration
        """
        self.config = config
        self.host = config.get("host", "localhost")
        self.port = config.get("port", self._get_default_port())
        self.name = self.__class__.__name__
        
        # Create FastAPI app
        self.app = FastAPI(
            title=f"{self.name} API",
            description=f"API for {self.name}",
            version="0.1.0"
        )
        
        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # TODO: Update for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Add routes
        self._setup_routes()
        
        # Add security middleware
        self._setup_security()
        
        # Server instance
        self.server_instance = None
        self.server_thread = None
        self.is_running = False
    
    def _get_default_port(self) -> int:
        """
        Get default port based on server class name to avoid conflicts
        
        Returns:
            int: Default port number
        """
        class_name = self.__class__.__name__
        
        # Map server names to default ports
        port_map = {
            "StatisticsMCPServer": 8001,
            "MarketDataServer": 8002,
            "TradeAnalysisServer": 8003,
            "AIServer": 8004,
            "AlertServer": 8005,
            "SentimentAnalysisServer": 8006,
            "TradeSageMCPServer": 8007
        }
        
        # Return mapped port or fallback to 9000
        return port_map.get(class_name, 9000)
        
    def _setup_routes(self):
        """Set up API routes"""
        # Health check endpoint
        @self.app.get("/api/v1/health")
        async def health_check():
            return {"status": "healthy", "server": self.name}
        
        # Register additional routes defined by subclasses
        self.register_routes()
    
    def _setup_security(self):
        """Set up security middleware"""
        # API key authentication middleware
        @self.app.middleware("http")
        async def api_key_middleware(request: Request, call_next):
            # Skip health check endpoint
            if request.url.path == "/api/v1/health":
                return await call_next(request)
            
            # Check if API key is required
            if "api_key" in self.config:
                # Check API key header
                api_key = request.headers.get("X-API-Key")
                if not api_key or api_key != self.config["api_key"]:
                    return Response(
                        content=json.dumps({"detail": "Invalid API key"}),
                        status_code=401,
                        media_type="application/json"
                    )
            
            # Continue processing request
            return await call_next(request)
    
    @abstractmethod
    def register_routes(self):
        """
        Register API routes
        
        This method must be implemented by subclasses
        """
        pass
    
    def start(self):
        """
        Start the server in a separate thread
        
        Returns:
            MCPServer: Server instance
        """
        if self.is_running:
            logger.warning(f"Server '{self.name}' is already running")
            return self
        
        # Create server thread
        self.server_thread = threading.Thread(
            target=self._run_server,
            daemon=True
        )
        
        # Start server thread
        self.server_thread.start()
        
        # Mark as running
        self.is_running = True
        
        logger.info(f"Started MCP server '{self.name}' at {self.host}:{self.port}")
        
        return self
    
    def _run_server(self):
        """Run the server with uvicorn"""
        try:
            # Run server
            uvicorn.run(
                self.app,
                host=self.host,
                port=self.port,
                log_level="info",
                access_log=False
            )
        except Exception as e:
            logger.error(f"Error running MCP server '{self.name}': {str(e)}")
            self.is_running = False
    
    def stop(self):
        """
        Stop the server
        
        Returns:
            bool: True if stopped successfully, False otherwise
        """
        if not self.is_running:
            logger.warning(f"Server '{self.name}' is not running")
            return False
        
        # TODO: Implement proper shutdown
        # Currently relying on daemon thread to terminate on app exit
        
        # Mark as not running
        self.is_running = False
        
        logger.info(f"Stopped MCP server '{self.name}'")
        
        return True
