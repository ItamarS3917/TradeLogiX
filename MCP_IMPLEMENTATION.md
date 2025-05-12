# MCP Implementation Guide

This document provides instructions for implementing and using the Model Context Protocol (MCP) in the Trading Journal App.

## Overview

The Model Context Protocol (MCP) is a system for enhancing the Trading Journal App with advanced analytics, pattern recognition, and AI capabilities. It consists of several components:

1. **MCP Integration Manager**: Coordinates and initializes MCP servers
2. **MCP Servers**: Specialized servers for different features
3. **MCP Tools**: Standalone components for data analysis and processing
4. **MCP Clients**: Components for communicating with MCP servers
5. **Claude Integration**: AI capabilities powered by Anthropic's Claude API

## Setup Instructions

### 1. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. Set other configuration values as needed.

### 2. Initialize MCP Servers

The MCP Integration Manager automatically initializes and coordinates MCP servers based on your configuration. To start all enabled MCP servers:

```python
from backend.mcp.mcp_integration import initialize_mcp

# Initialize MCP with your FastAPI app
mcp = initialize_mcp(app)

# Start MCP servers
mcp.start_servers()
```

This is already done in the main FastAPI app initialization.

### 3. Use MCP Tools in Your Code

MCP tools can be used directly in your code:

```python
from backend.mcp.tools.pattern_recognition import detect_mcp_complex_patterns
from backend.mcp.tools.ai_integration import get_claude_client

# Use pattern recognition
patterns = detect_mcp_complex_patterns(trade_data)

# Use Claude AI integration
claude_client = await get_claude_client()
analysis = await claude_client.analyze_trading_patterns(trade_data)
```

### 4. Connect to MCP Servers

MCP servers can be accessed through the MCP Client:

```python
from backend.mcp.mcp_client import MCPClient
from backend.mcp.mcp_config import get_mcp_config

# Get MCP client
config = get_mcp_config()
client = MCPClient(config)

# Access a specific MCP server
statistics_client = client.statistics
result = await statistics_client.get_win_rate_by_setup(params)
```

## Available MCP Components

### MCP Servers

The following MCP servers are available:

- **StatisticsMCPServer**: Enhanced statistics and analytics
- **MarketDataServer**: Market data integration
- **TradeAnalysisServer**: Trade pattern analysis
- **AIServer**: AI-powered insights
- **AlertServer**: Alert system
- **SentimentAnalysisServer**: Sentiment analysis of journal entries
- **TradeSageMCPServer**: TradeSage AI assistant

### MCP Tools

The following MCP tools are available:

- **Pattern Recognition**: Tools for identifying trading patterns
  - `identify_trade_patterns`: Basic pattern identification
  - `detect_mcp_complex_patterns`: Advanced MCP-enhanced pattern detection

- **Sentiment Analysis**: Tools for analyzing text sentiment
  - `analyze_text_sentiment`: Analyze sentiment of text
  - `analyze_emotional_impact`: Analyze emotional impact on trading

- **AI Integration**: Tools for AI-powered insights
  - `ClaudeClient`: Client for Anthropic's Claude API
  - `get_claude_client`: Get a Claude client instance (singleton)

## Claude AI Integration

The Trading Journal App uses Anthropic's Claude for AI-powered insights. This is implemented through the `ClaudeClient` class in `backend/mcp/tools/ai_integration.py`.

### Available Claude Capabilities

1. **Trading Pattern Analysis**:
   ```python
   claude_client = await get_claude_client()
   analysis = await claude_client.analyze_trading_patterns(trades)
   ```

2. **Journal Entry Analysis**:
   ```python
   claude_client = await get_claude_client()
   analysis = await claude_client.analyze_journal_entries(journals)
   ```

3. **Improvement Plan Generation**:
   ```python
   claude_client = await get_claude_client()
   plan = await claude_client.generate_improvement_plan(trades, journals)
   ```

4. **Question Answering**:
   ```python
   claude_client = await get_claude_client()
   answer = await claude_client.answer_trading_question(question, context)
   ```

## Extending MCP

### Creating a New MCP Server

To create a new MCP server:

1. Create a new file in `backend/mcp/servers/`
2. Extend the `MCPServer` class
3. Implement the `register_routes` method
4. Add the server to the `MCPIntegration` class in `mcp_integration.py`

Example:

```python
from ..mcp_server import MCPServer

class MyCustomServer(MCPServer):
    def __init__(self, config: Dict[str, Any] = None):
        if config is None:
            config = {
                "name": "my_custom",
                "host": "localhost",
                "port": 8010,
                "version": "1.0.0"
            }
        super().__init__(config)
    
    def register_routes(self):
        @self.app.get("/api/v1/custom")
        async def custom_endpoint():
            return {"status": "success"}
```

### Creating a New MCP Tool

To create a new MCP tool:

1. Create a new file in `backend/mcp/tools/`
2. Implement your tool functions
3. Import and use the tool in your application

Example:

```python
# backend/mcp/tools/my_custom_tool.py
def analyze_custom_data(data):
    # Analyze data
    result = process_data(data)
    return result
```

## Troubleshooting

### Common Issues

1. **MCP servers not starting**:
   - Check the server configuration in `mcp_config.py`
   - Ensure ports are available and not already in use
   - Check for error messages in the logs

2. **Claude API not working**:
   - Verify your Anthropic API key in `.env`
   - Check for error messages in the logs
   - Ensure you have network connectivity to Anthropic's API

3. **MCP integration issues**:
   - Check for circular imports in your code
   - Verify that all required MCP components are installed
   - Check for error messages in the logs

### Debugging

To debug MCP issues:

1. Enable verbose logging:
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. Check MCP server status:
   ```bash
   curl http://localhost:8001/api/v1/health
   ```

3. Inspect MCP configuration:
   ```bash
   curl http://localhost:8000/api/mcp/config
   ```

## Further Resources

- [MCP Documentation](./backend/mcp/README.md): Detailed documentation for the MCP module
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/): Documentation for the Claude API
- [FastAPI Documentation](https://fastapi.tiangolo.com/): Documentation for FastAPI

## Contact

For questions or issues regarding MCP implementation, please contact the development team.
