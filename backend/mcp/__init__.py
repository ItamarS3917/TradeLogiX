# File: backend/mcp/__init__.py
# Purpose: Package initialization for MCP (Model Context Protocol)

# Make sure all submodules are importable
from . import mcp_client
from . import mcp_config
from . import mcp_server
from . import mcp_integration
from .mcp_integration import initialize_mcp, get_mcp_integration, get_mcp

__all__ = [
    'initialize_mcp',
    'get_mcp_integration',
    'get_mcp',
    'mcp_client',
    'mcp_config',
    'mcp_server',
    'mcp_integration'
]
