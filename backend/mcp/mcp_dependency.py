# File: backend/mcp/mcp_dependency.py
# Purpose: FastAPI dependency for MCP client

from fastapi import Depends
from typing import Optional
from .mcp_client import MCPClient, get_statistics_client

def get_mcp_client() -> Optional[MCPClient]:
    """
    FastAPI dependency that provides an MCP client.
    Falls back to statistics client by default.
    
    Returns:
        Optional[MCPClient]: MCP client or None if not available
    """
    try:
        return get_statistics_client()
    except Exception as e:
        # Log the error but don't fail - allow the application to continue without MCP
        print(f"Warning: Could not initialize MCP client: {e}")
        return None
