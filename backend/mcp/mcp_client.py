# File: backend/mcp/mcp_client.py
# Purpose: MCP client for connecting to MCP servers

import json
import logging
import time
import requests
from typing import Dict, Any, Optional, List, Union
from requests.exceptions import RequestException

from .mcp_config import get_mcp_config, is_server_running, get_server_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCPClient:
    """MCP client for connecting to MCP servers"""
    
    def __init__(self, server_name: str):
        """
        Initialize MCP client
        
        Args:
            server_name (str): Name of the MCP server to connect to
        """
        if not is_server_running(server_name):
            logger.warning(f"MCP server '{server_name}' is not running")
        
        self.server_name = server_name
        self.server_config = get_server_config(server_name)
        self.client_config = get_mcp_config()["client"]
        self.security_config = get_mcp_config()["security"]
        
        self.host = self.server_config["host"]
        self.port = self.server_config["port"]
        self.base_url = f"http://{self.host}:{self.port}/api/v1"
        
        self.timeout = self.client_config["timeout"]
        self.max_retries = self.client_config["max_retries"]
        self.retry_delay = self.client_config["retry_delay"]
        
        self.session = requests.Session()
        
        # Add API key if configured
        if "api_key" in self.server_config:
            self.session.headers.update({"X-API-Key": self.server_config["api_key"]})
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        files: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make request to MCP server
        
        Args:
            method (str): HTTP method (GET, POST, PUT, DELETE)
            endpoint (str): API endpoint
            data (Optional[Dict[str, Any]], optional): Request data. Defaults to None.
            params (Optional[Dict[str, Any]], optional): Query parameters. Defaults to None.
            headers (Optional[Dict[str, str]], optional): Additional headers. Defaults to None.
            files (Optional[Dict[str, Any]], optional): Files to upload. Defaults to None.
            
        Returns:
            Dict[str, Any]: Response data
            
        Raises:
            Exception: If request fails after max retries
        """
        url = f"{self.base_url}/{endpoint}"
        request_headers = {"Content-Type": "application/json"}
        
        # Add additional headers
        if headers:
            request_headers.update(headers)
        
        # Prepare request arguments
        request_args = {
            "url": url,
            "timeout": self.timeout,
            "headers": request_headers,
            "params": params
        }
        
        # Add data or files if provided
        if data and not files:
            request_args["data"] = json.dumps(data)
        elif files:
            # Don't use JSON for file uploads
            request_args["data"] = data
            request_args["files"] = files
            # Remove Content-Type header for file uploads
            request_args["headers"].pop("Content-Type", None)
        
        # Make request with retries
        for attempt in range(self.max_retries):
            try:
                response = self.session.request(method, **request_args)
                response.raise_for_status()
                
                # Parse JSON response if available
                if response.content:
                    try:
                        return response.json()
                    except json.JSONDecodeError:
                        logger.warning(f"Response is not valid JSON: {response.text}")
                        return {"success": True, "data": response.text}
                
                return {"success": True}
            
            except RequestException as e:
                logger.warning(f"Request attempt {attempt + 1}/{self.max_retries} failed: {str(e)}")
                
                # Last attempt, raise exception
                if attempt == self.max_retries - 1:
                    logger.error(f"Request to MCP server '{self.server_name}' failed after {self.max_retries} attempts")
                    raise Exception(f"Failed to connect to MCP server: {str(e)}")
                
                # Wait before retrying
                time.sleep(self.retry_delay)
    
    def get(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make GET request to MCP server
        
        Args:
            endpoint (str): API endpoint
            params (Optional[Dict[str, Any]], optional): Query parameters. Defaults to None.
            headers (Optional[Dict[str, str]], optional): Additional headers. Defaults to None.
            
        Returns:
            Dict[str, Any]: Response data
        """
        return self._make_request("GET", endpoint, params=params, headers=headers)
    
    def post(
        self, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        files: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make POST request to MCP server
        
        Args:
            endpoint (str): API endpoint
            data (Optional[Dict[str, Any]], optional): Request data. Defaults to None.
            params (Optional[Dict[str, Any]], optional): Query parameters. Defaults to None.
            headers (Optional[Dict[str, str]], optional): Additional headers. Defaults to None.
            files (Optional[Dict[str, Any]], optional): Files to upload. Defaults to None.
            
        Returns:
            Dict[str, Any]: Response data
        """
        return self._make_request("POST", endpoint, data=data, params=params, headers=headers, files=files)
    
    def put(
        self, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make PUT request to MCP server
        
        Args:
            endpoint (str): API endpoint
            data (Optional[Dict[str, Any]], optional): Request data. Defaults to None.
            params (Optional[Dict[str, Any]], optional): Query parameters. Defaults to None.
            headers (Optional[Dict[str, str]], optional): Additional headers. Defaults to None.
            
        Returns:
            Dict[str, Any]: Response data
        """
        return self._make_request("PUT", endpoint, data=data, params=params, headers=headers)
    
    def delete(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make DELETE request to MCP server
        
        Args:
            endpoint (str): API endpoint
            params (Optional[Dict[str, Any]], optional): Query parameters. Defaults to None.
            headers (Optional[Dict[str, str]], optional): Additional headers. Defaults to None.
            
        Returns:
            Dict[str, Any]: Response data
        """
        return self._make_request("DELETE", endpoint, params=params, headers=headers)

# Convenience functions to get MCP clients
def get_ai_client() -> MCPClient:
    """Get MCP client for AI server"""
    return MCPClient("ai_server")

def get_market_data_client() -> MCPClient:
    """Get MCP client for market data server"""
    return MCPClient("market_data_server")

def get_statistics_client() -> MCPClient:
    """Get MCP client for statistics server"""
    return MCPClient("statistics_server")

def get_trade_analysis_client() -> MCPClient:
    """Get MCP client for trade analysis server"""
    return MCPClient("trade_analysis_server")

def get_alert_client() -> MCPClient:
    """Get MCP client for alert server"""
    return MCPClient("alert_server")

def get_sentiment_analysis_client() -> MCPClient:
    """Get MCP client for sentiment analysis server"""
    return MCPClient("sentiment_analysis")
