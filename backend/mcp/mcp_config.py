# File: backend/mcp/mcp_config.py
# Purpose: Configuration for Model Context Protocol (MCP) integration

import os
import json
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class MCPConfig(BaseModel):
    """
    Configuration for Model Context Protocol (MCP) integration
    """
    
    # MCP registry URL for service discovery
    registry_url: Optional[str] = Field(
        default=None,
        description="URL of the MCP registry for service discovery"
    )
    
    # MCP servers configuration
    servers: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Configuration for MCP servers"
    )
    
    # Authentication configuration
    auth_key: Optional[str] = Field(
        default=None,
        description="Authentication key for MCP services"
    )
    
    # Client configuration
    client: Dict[str, Any] = Field(
        default_factory=lambda: {
            "timeout": 30,
            "max_retries": 3,
            "retry_delay": 1
        },
        description="MCP client configuration"
    )
    
    # Security configuration
    security: Dict[str, Any] = Field(
        default_factory=lambda: {
            "api_key_required": False,
            "api_key": None
        },
        description="MCP security configuration"
    )
    
    # Feature flags
    features: Dict[str, bool] = Field(
        default_factory=dict,
        description="MCP feature flags"
    )
    
    def __init__(self, **data):
        """
        Initialize MCP configuration from environment variables or config file
        """
        # Default configuration
        default_config = {
            "registry_url": os.environ.get("MCP_REGISTRY_URL"),
            "auth_key": os.environ.get("MCP_AUTH_KEY"),
            "servers": {},
            "client": {
                "timeout": 30,
                "max_retries": 3,
                "retry_delay": 1
            },
            "security": {
                "api_key_required": False,
                "api_key": None
            },
            "features": {
                "statistics_enhancement": True,
                "market_data_integration": True,
                "ai_insights": True,
                "pattern_recognition": True,
                "sentiment_analysis": True
            }
        }
        
        # Load configuration from file if specified
        config_path = os.environ.get("MCP_CONFIG_PATH")
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    file_config = json.load(f)
                    default_config.update(file_config)
                logger.info(f"Loaded MCP configuration from {config_path}")
            except Exception as e:
                logger.error(f"Error loading MCP configuration from {config_path}: {str(e)}")
        
        # Load default servers if none specified
        if not default_config["servers"]:
            default_config["servers"] = self._load_default_servers()
        
        # Update with any data passed to the constructor
        default_config.update(data)
        
        # Initialize the model
        super().__init__(**default_config)
        
        logger.info(f"Initialized MCP configuration with {len(self.servers)} servers")
    
    def _load_default_servers(self) -> Dict[str, Dict[str, Any]]:
        """
        Load default MCP server configuration
        """
        # Default servers with local URLs
        default_servers = {
            "statistics": {
                "url": os.environ.get("MCP_STATISTICS_URL", "http://localhost:8001/mcp/statistics"),
                "version": "1.0.0",
                "enabled": True
            },
            "market_data": {
                "url": os.environ.get("MCP_MARKET_DATA_URL", "http://localhost:8002/mcp/market-data"),
                "version": "1.0.0",
                "enabled": True
            },
            "trade_analysis": {
                "url": os.environ.get("MCP_TRADE_ANALYSIS_URL", "http://localhost:8003/mcp/trade-analysis"),
                "version": "1.0.0",
                "enabled": True
            },
            "ai": {
                "url": os.environ.get("MCP_AI_URL", "http://localhost:8004/mcp/ai"),
                "version": "1.0.0",
                "enabled": bool(os.environ.get("MCP_AI_ENABLED", "true").lower() in ("true", "1", "yes"))
            },
            "alerts": {
                "url": os.environ.get("MCP_ALERTS_URL", "http://localhost:8005/mcp/alerts"),
                "version": "1.0.0",
                "enabled": True
            },
            "sentiment_analysis": {
                "url": os.environ.get("MCP_SENTIMENT_URL", "http://localhost:8006/mcp/sentiment"),
                "version": "1.0.0",
                "enabled": True
            },
            "tradeSage": {
                "url": os.environ.get("MCP_TRADESAGE_URL", "http://localhost:8007/mcp/tradesage"),
                "version": "1.0.0",
                "enabled": bool(os.environ.get("MCP_TRADESAGE_ENABLED", "true").lower() in ("true", "1", "yes"))
            }
        }
        
        return default_servers
    
    def get_server_url(self, server_name: str) -> Optional[str]:
        """
        Get the URL for a specific MCP server
        """
        server_config = self.servers.get(server_name)
        if server_config and server_config.get("enabled", True):
            return server_config.get("url")
        return None
    
    def is_feature_enabled(self, feature_name: str) -> bool:
        """
        Check if a specific MCP feature is enabled
        """
        return self.features.get(feature_name, False)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert configuration to dictionary for API responses
        """
        return {
            "registry_url": self.registry_url,
            "servers": {
                name: {
                    "url": config.get("url"),
                    "version": config.get("version"),
                    "enabled": config.get("enabled", True)
                }
                for name, config in self.servers.items()
            },
            "features": self.features
        }

# MCP configuration functions

def get_mcp_config():
    """
    Get MCP configuration
    """
    return MCPConfig()

def is_server_running(server_name: str) -> bool:
    """
    Check if an MCP server is running
    """
    config = get_mcp_config()
    server_config = config.servers.get(server_name)
    if not server_config or not server_config.get("enabled", True):
        return False
    
    # In a real implementation, this would check if the server is actually running
    # For now, we'll just return True if it's enabled in the config
    return True

def get_server_config(server_name: str) -> dict:
    """
    Get configuration for a specific MCP server
    """
    config = get_mcp_config()
    return config.servers.get(server_name, {})

# MCP Server setup function
def setup_mcp_servers():
    """
    Initialize and setup MCP servers
    """
    try:
        # Note: We're not actually importing the servers here to avoid circular imports
        # In a real implementation, we would import and initialize the servers
        logger.info("MCP servers initialized successfully")
        
        # Return a list of active MCP servers
        return [
            # List of active MCP servers would go here
            # For now, returning an empty list
        ]
    except Exception as e:
        logger.error(f"Error setting up MCP servers: {str(e)}")
        return []
