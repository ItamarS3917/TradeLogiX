# File: backend/mcp/mcp_client.py
# Purpose: Client for interacting with MCP servers

import logging
import json
import asyncio
from typing import Dict, List, Any, Optional, Callable, Union
from functools import lru_cache
import httpx

from fastapi import Depends
from .mcp_config import MCPConfig

logger = logging.getLogger(__name__)

class MCPClient:
    """
    Client for communicating with MCP servers
    """
    
    def __init__(self, config: MCPConfig):
        """
        Initialize the MCP client with configuration
        """
        self.config = config
        self.active_servers = {}
        self.http_client = httpx.AsyncClient(timeout=30.0)  # 30-second timeout
        
        # Initialize proxy attributes for server interactions
        self.statistics = MCPServerProxy(self, "statistics")
        self.market_data = MCPServerProxy(self, "market_data")
        self.trade_analysis = MCPServerProxy(self, "trade_analysis")
        self.ai = MCPServerProxy(self, "ai")
        self.alerts = MCPServerProxy(self, "alerts")
        self.sentiment_analysis = MCPServerProxy(self, "sentiment_analysis")
        self.tradeSage = MCPServerProxy(self, "tradeSage")
    
    async def initialize(self):
        """
        Initialize connections to all configured MCP servers
        """
        try:
            logger.info("Initializing MCP client")
            
            # Discover available servers
            await self.discover_servers()
            
            # Connect to each server
            connection_tasks = []
            for server_name, server_config in self.config.servers.items():
                connection_tasks.append(self.connect_to_server(server_name, server_config))
            
            # Wait for all connections to be established
            results = await asyncio.gather(*connection_tasks, return_exceptions=True)
            
            # Process results
            for i, result in enumerate(results):
                server_name = list(self.config.servers.keys())[i]
                if isinstance(result, Exception):
                    logger.error(f"Failed to connect to MCP server '{server_name}': {str(result)}")
                else:
                    logger.info(f"Successfully connected to MCP server '{server_name}'")
            
            return True
            
        except Exception as e:
            logger.error(f"Error initializing MCP client: {str(e)}")
            return False
    
    async def discover_servers(self):
        """
        Discover available MCP servers
        """
        try:
            if not self.config.registry_url:
                logger.info("No MCP registry configured, skipping server discovery")
                return
            
            logger.info(f"Discovering MCP servers from registry: {self.config.registry_url}")
            
            # Query the registry for available servers
            async with self.http_client as client:
                response = await client.get(f"{self.config.registry_url}/servers")
                
                if response.status_code == 200:
                    servers = response.json()
                    
                    # Update server configurations
                    for server in servers:
                        server_name = server.get("name")
                        server_url = server.get("url")
                        server_version = server.get("version")
                        
                        if server_name and server_url:
                            # Add or update server in config
                            self.config.servers[server_name] = {
                                "url": server_url,
                                "version": server_version,
                                "enabled": True
                            }
                            
                            logger.info(f"Discovered MCP server: {server_name} @ {server_url} (v{server_version})")
                else:
                    logger.warning(f"Failed to query MCP registry: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error discovering MCP servers: {str(e)}")
    
    async def connect_to_server(self, server_name: str, server_config: Dict[str, Any]):
        """
        Connect to a specific MCP server
        """
        if not server_config.get("enabled", True):
            logger.info(f"MCP server '{server_name}' is disabled, skipping connection")
            return False
        
        server_url = server_config.get("url")
        if not server_url:
            logger.warning(f"No URL configured for MCP server '{server_name}'")
            return False
        
        try:
            logger.info(f"Connecting to MCP server '{server_name}' @ {server_url}")
            
            # Check server health
            async with self.http_client as client:
                response = await client.get(f"{server_url}/health")
                
                if response.status_code == 200:
                    # Get server capabilities
                    capabilities_response = await client.get(f"{server_url}/capabilities")
                    
                    if capabilities_response.status_code == 200:
                        capabilities = capabilities_response.json()
                        
                        # Store server info
                        self.active_servers[server_name] = {
                            "url": server_url,
                            "capabilities": capabilities,
                            "status": "connected"
                        }
                        
                        logger.info(f"Successfully connected to MCP server '{server_name}' with {len(capabilities)} capabilities")
                        return True
                    else:
                        logger.warning(f"Failed to get capabilities from MCP server '{server_name}': {capabilities_response.status_code}")
                else:
                    logger.warning(f"MCP server '{server_name}' health check failed: {response.status_code}")
                
            return False
            
        except Exception as e:
            logger.error(f"Error connecting to MCP server '{server_name}': {str(e)}")
            raise
    
    async def call_method(self, server_name: str, method_name: str, params: Any = None, timeout: float = 30.0):
        """
        Call a method on an MCP server
        """
        if server_name not in self.active_servers:
            # Try to connect to the server if it's in the config but not active
            if server_name in self.config.servers:
                connected = await self.connect_to_server(server_name, self.config.servers[server_name])
                if not connected:
                    raise ValueError(f"MCP server '{server_name}' is not available")
            else:
                raise ValueError(f"Unknown MCP server '{server_name}'")
        
        server_info = self.active_servers[server_name]
        server_url = server_info["url"]
        
        # Check if the method is in the server's capabilities
        capabilities = server_info.get("capabilities", {})
        if method_name not in capabilities:
            raise ValueError(f"Method '{method_name}' is not supported by MCP server '{server_name}'")
        
        try:
            logger.debug(f"Calling MCP method: {server_name}.{method_name}({params})")
            
            request_data = {
                "method": method_name,
                "params": params
            }
            
            async with self.http_client as client:
                response = await client.post(
                    f"{server_url}/invoke",
                    json=request_data,
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("result")
                else:
                    error_data = response.json() if response.status_code != 204 else {}
                    error_msg = error_data.get("error", f"HTTP {response.status_code}")
                    logger.error(f"MCP method call failed: {server_name}.{method_name} - {error_msg}")
                    raise Exception(f"MCP method call failed: {error_msg}")
                
        except httpx.TimeoutException:
            logger.error(f"MCP method call timed out: {server_name}.{method_name}")
            raise TimeoutError(f"MCP method call timed out: {server_name}.{method_name}")
        except Exception as e:
            logger.error(f"Error calling MCP method {server_name}.{method_name}: {str(e)}")
            raise
    
    async def close(self):
        """
        Close connections to all MCP servers
        """
        try:
            logger.info("Closing MCP client connections")
            await self.http_client.aclose()
            self.active_servers = {}
        except Exception as e:
            logger.error(f"Error closing MCP client: {str(e)}")


class MCPServerProxy:
    """
    Dynamic proxy for MCP server interactions
    Allows for natural syntax: client.server_name.method_name(params)
    """
    
    def __init__(self, client: MCPClient, server_name: str):
        self._client = client
        self._server_name = server_name
    
    def __getattr__(self, method_name: str) -> Callable:
        """
        Dynamically create a method that calls the MCP server
        """
        # Replace Python-style methods with camelCase for the MCP protocol
        mcp_method_name = self._to_camel_case(method_name)
        
        async def method_proxy(*args, **kwargs):
            # Combine positional and keyword arguments
            params = kwargs
            if args:
                if len(args) == 1 and isinstance(args[0], dict):
                    # If a single dict is passed, use it as the params
                    params = args[0]
                else:
                    # Otherwise, raise an error
                    raise ValueError("MCP method calls only accept keyword arguments or a single dict")
            
            # Call the method on the MCP server
            return await self._client.call_method(self._server_name, mcp_method_name, params)
        
        return method_proxy
    
    def _to_camel_case(self, snake_case: str) -> str:
        """
        Convert snake_case to camelCase for MCP protocol compatibility
        """
        components = snake_case.split('_')
        return components[0] + ''.join(x.title() for x in components[1:])


# Create a global MCP config instance
@lru_cache()
def get_mcp_config():
    return MCPConfig()

# Factory function for FastAPI dependency injection
async def get_mcp_client():
    """
    Get or create an MCP client instance
    """
    # Load MCP configuration
    config = get_mcp_config()
    
    # Create a new client
    client = MCPClient(config)
    
    # Initialize the client
    await client.initialize()
    
    try:
        # Return the client for use
        yield client
    finally:
        # Ensure the client is closed when the request is finished
        await client.close()

# Backward compatibility with the old API
def get_trade_analysis_client():
    """
    Get client for trade analysis - compatibility function for old API
    This is a stub that returns a mock client with post method
    """
    class MockClient:
        def post(self, endpoint, data=None):
            return {"status": "success", "message": "This is a mock client"}
    
    return MockClient()

def get_statistics_client():
    """
    Get client for statistics service - compatibility function for old API
    This is a stub that returns a mock client with methods for statistics
    """
    class MockClient:
        def post(self, endpoint, data=None):
            return {"status": "success", "message": "This is a mock statistics client"}
        
        # Add statistics attribute to match the MCPClient structure
        class StatisticsProxy:
            async def get_statistics(self, params):
                return {
                    "win_rate": 0.65,
                    "profit_factor": 1.8,
                    "avg_win": 150.25,
                    "avg_loss": 75.50,
                    "total_trades": 42,
                    "mcp_mock": True
                }
            
            async def get_win_rate_by_setup(self, params):
                return {
                    "setups": [
                        {"name": "MMXM_STANDARD", "win_rate": 0.70, "trades": 20},
                        {"name": "ICT_BPR", "win_rate": 0.60, "trades": 15},
                        {"name": "LIQUIDITY_GRAB", "win_rate": 0.55, "trades": 7}
                    ],
                    "mcp_mock": True
                }
            
            async def get_profitability_by_time(self, params):
                return {
                    "time_slots": [
                        {"hour": 9, "win_rate": 0.75, "profit": 450.75},
                        {"hour": 10, "win_rate": 0.60, "profit": 320.25},
                        {"hour": 11, "win_rate": 0.50, "profit": 150.50}
                    ],
                    "mcp_mock": True
                }
        
        statistics = StatisticsProxy()
    
    return MockClient()
