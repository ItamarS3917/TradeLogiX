# File: backend/mcp/mcp_config.py
# Purpose: MCP configuration and server setup

import os
import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MCP configuration
MCP_CONFIG = {
    "servers": {
        "ai_server": {
            "enabled": True,
            "host": os.getenv("MCP_AI_SERVER_HOST", "localhost"),
            "port": int(os.getenv("MCP_AI_SERVER_PORT", "5001")),
            "api_key": os.getenv("MCP_AI_SERVER_API_KEY", "development-key"),
            "model": os.getenv("MCP_AI_SERVER_MODEL", "claude-3-opus-20240229")
        },
        "market_data_server": {
            "enabled": True,
            "host": os.getenv("MCP_MARKET_DATA_SERVER_HOST", "localhost"),
            "port": int(os.getenv("MCP_MARKET_DATA_SERVER_PORT", "5002")),
            "api_key": os.getenv("MCP_MARKET_DATA_SERVER_API_KEY", "development-key"),
            "data_sources": ["alpaca", "yahoo", "local"]
        },
        "statistics_server": {
            "enabled": True,
            "host": os.getenv("MCP_STATISTICS_SERVER_HOST", "localhost"),
            "port": int(os.getenv("MCP_STATISTICS_SERVER_PORT", "5003")),
            "cache_enabled": os.getenv("MCP_STATISTICS_CACHE_ENABLED", "true").lower() == "true",
            "cache_ttl": int(os.getenv("MCP_STATISTICS_CACHE_TTL", "3600"))
        },
        "trade_analysis_server": {
            "enabled": True,
            "host": os.getenv("MCP_TRADE_ANALYSIS_SERVER_HOST", "localhost"),
            "port": int(os.getenv("MCP_TRADE_ANALYSIS_SERVER_PORT", "5004")),
            "analysis_types": ["pattern", "risk", "emotion", "adherence"]
        },
        "alert_server": {
            "enabled": True,
            "host": os.getenv("MCP_ALERT_SERVER_HOST", "localhost"),
            "port": int(os.getenv("MCP_ALERT_SERVER_PORT", "5005")),
            "notification_channels": ["app", "email"]
        },
        "sentiment_analysis": {
            "enabled": True,
            "host": os.getenv("MCP_SENTIMENT_ANALYSIS_SERVER_HOST", "localhost"),
            "port": int(os.getenv("MCP_SENTIMENT_ANALYSIS_SERVER_PORT", "5006")),
            "model": os.getenv("MCP_SENTIMENT_ANALYSIS_MODEL", "default")
        }
    },
    "client": {
        "timeout": int(os.getenv("MCP_CLIENT_TIMEOUT", "30")),
        "max_retries": int(os.getenv("MCP_CLIENT_MAX_RETRIES", "3")),
        "retry_delay": int(os.getenv("MCP_CLIENT_RETRY_DELAY", "1"))
    },
    "security": {
        "enabled": os.getenv("MCP_SECURITY_ENABLED", "true").lower() == "true",
        "encryption": os.getenv("MCP_SECURITY_ENCRYPTION", "true").lower() == "true",
        "token_ttl": int(os.getenv("MCP_SECURITY_TOKEN_TTL", "3600"))
    }
}

# Server states
SERVER_STATES = {
    "ai_server": {"running": False, "instance": None},
    "market_data_server": {"running": False, "instance": None},
    "statistics_server": {"running": False, "instance": None},
    "trade_analysis_server": {"running": False, "instance": None},
    "alert_server": {"running": False, "instance": None},
    "sentiment_analysis": {"running": False, "instance": None}
}

def get_mcp_config() -> Dict[str, Any]:
    """
    Get MCP configuration
    
    Returns:
        Dict[str, Any]: MCP configuration
    """
    return MCP_CONFIG

def get_server_config(server_name: str) -> Dict[str, Any]:
    """
    Get configuration for a specific MCP server
    
    Args:
        server_name (str): Name of the server
        
    Returns:
        Dict[str, Any]: Server configuration
    """
    if server_name in MCP_CONFIG["servers"]:
        return MCP_CONFIG["servers"][server_name]
    
    logger.error(f"Server '{server_name}' not found in MCP configuration")
    raise ValueError(f"Server '{server_name}' not found in MCP configuration")

def get_enabled_servers() -> List[str]:
    """
    Get list of enabled MCP servers
    
    Returns:
        List[str]: List of enabled server names
    """
    return [
        server_name
        for server_name, config in MCP_CONFIG["servers"].items()
        if config.get("enabled", False)
    ]

def setup_mcp_servers() -> None:
    """
    Set up and start MCP servers
    """
    logger.info("Setting up MCP servers...")
    
    # Import server modules dynamically to avoid circular imports
    from .servers import (
        ai_server,
        market_data_server,
        statistics_server,
        trade_analysis_server,
        alert_server,
        sentiment_analysis
    )
    
    # Map server name to module
    server_modules = {
        "ai_server": ai_server,
        "market_data_server": market_data_server,
        "statistics_server": statistics_server,
        "trade_analysis_server": trade_analysis_server,
        "alert_server": alert_server,
        "sentiment_analysis": sentiment_analysis
    }
    
    # Start enabled servers
    for server_name in get_enabled_servers():
        if server_name in server_modules:
            try:
                logger.info(f"Starting MCP server: {server_name}")
                server_config = get_server_config(server_name)
                
                # Start server
                server_instance = server_modules[server_name].start_server(server_config)
                
                # Update server state
                SERVER_STATES[server_name]["running"] = True
                SERVER_STATES[server_name]["instance"] = server_instance
                
                logger.info(f"MCP server started: {server_name}")
            except Exception as e:
                logger.error(f"Failed to start MCP server '{server_name}': {str(e)}")
                SERVER_STATES[server_name]["running"] = False
                SERVER_STATES[server_name]["instance"] = None
    
    logger.info("MCP servers setup complete")

def shutdown_mcp_servers() -> None:
    """
    Shut down all running MCP servers
    """
    logger.info("Shutting down MCP servers...")
    
    for server_name, state in SERVER_STATES.items():
        if state["running"] and state["instance"]:
            try:
                logger.info(f"Stopping MCP server: {server_name}")
                state["instance"].stop()
                state["running"] = False
                state["instance"] = None
                logger.info(f"MCP server stopped: {server_name}")
            except Exception as e:
                logger.error(f"Failed to stop MCP server '{server_name}': {str(e)}")
    
    logger.info("MCP servers shutdown complete")

def is_server_running(server_name: str) -> bool:
    """
    Check if a specific MCP server is running
    
    Args:
        server_name (str): Name of the server
        
    Returns:
        bool: True if server is running, False otherwise
    """
    if server_name in SERVER_STATES:
        return SERVER_STATES[server_name]["running"]
    
    logger.error(f"Server '{server_name}' not found in SERVER_STATES")
    return False
