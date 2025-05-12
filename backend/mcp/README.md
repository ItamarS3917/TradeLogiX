# Model Context Protocol (MCP) Integration

This module provides integration with Model Context Protocol (MCP) technology for the Trading Journal App. MCP is used to enhance application capabilities with advanced data analysis, pattern recognition, and AI features.

## Overview

MCP is a modular system designed to:

1. Accelerate development of advanced features
2. Provide standardized communication between various application components
3. Enhance data analysis capabilities
4. Enable AI-powered insights through TradeSage

## Architecture

The MCP system consists of the following components:

- **MCP Integration Manager** (`mcp_integration.py`): Central manager for initializing and coordinating MCP servers
- **MCP Configuration** (`mcp_config.py`): Configuration for MCP servers and features
- **MCP Servers** (`servers/`): Specialized servers for different features
- **MCP Tools** (`tools/`): Standalone tools for data analysis
- **MCP Client** (`mcp_client.py`): Client for communicating with MCP servers

## Getting Started

### Using MCP in FastAPI Routes

```python
from fastapi import APIRouter, Depends
from ...mcp.mcp_integration import get_mcp
from ...mcp.tools.pattern_recognition import detect_mcp_complex_patterns

router = APIRouter()

@router.get("/endpoint")
async def endpoint(mcp = Depends(get_mcp)):
    # Use MCP features here
    # For example:
    result = detect_mcp_complex_patterns(data)
    return {"result": result}
```

### Available MCP Servers

| Server | Purpose | Default Port |
|--------|---------|--------------|
| StatisticsMCPServer | Enhanced statistics and analytics | 8001 |
| MarketDataServer | Market data integration | 8002 |
| TradeAnalysisServer | Trade pattern analysis | 8003 |
| AIServer | AI-powered insights | 8004 |
| AlertServer | Alert system | 8005 |
| SentimentAnalysisServer | Sentiment analysis of journal entries | 8006 |
| TradeSageMCPServer | TradeSage AI assistant | 8007 |

### MCP Pattern Recognition

The MCP system provides advanced pattern recognition capabilities through the `detect_mcp_complex_patterns` function in `tools/pattern_recognition.py`.

```python
from ...mcp.tools.pattern_recognition import detect_mcp_complex_patterns

# Get trade data
trades = get_trades()

# Convert to appropriate format
trade_dicts = [trade.to_dict() for trade in trades]

# Detect patterns
patterns = detect_mcp_complex_patterns(trade_dicts)

# Process patterns
for pattern in patterns:
    print(f"Pattern: {pattern['name']}")
    print(f"Description: {pattern['description']}")
    print(f"Confidence: {pattern['confidence']}")
    print(f"Recommendation: {pattern['recommendation']}")
```

## Available Pattern Types

The MCP pattern recognition system can detect the following types of patterns:

1. **Time of Day Performance**: Optimal times for trading
2. **Day of Week Performance**: Best days for trading
3. **Emotional State Impact**: Correlation between emotions and performance
4. **Setup Type Performance**: Most profitable setup types
5. **Overtrading Detection**: Signs of overtrading
6. **Revenge Trading Detection**: Signs of revenge trading
7. **Trading Streak Impact**: Impact of winning/losing streaks
8. **Risk-Reward Correlation**: Optimal risk-reward ratios
9. **Trade Duration Impact**: Optimal trade durations
10. **Plan Adherence Correlation**: Impact of adhering to trading plans
11. **Position Sizing Optimization**: Optimal position sizes
12. **Session Profitability**: Most profitable market sessions
13. **Win/Loss Sequence Prediction**: Predictive patterns in win/loss sequences

## Extending MCP

### Creating New MCP Servers

To create a new MCP server:

1. Create a new file in the `servers/` directory
2. Extend the `MCPServer` class
3. Implement the `register_routes` method
4. Add the server to the `MCPIntegration` class in `mcp_integration.py`

```python
from ..mcp_server import MCPServer

class MyCustomServer(MCPServer):
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config or {"name": "custom", "host": "localhost", "port": 8010})
    
    def register_routes(self):
        @self.app.get("/api/v1/custom-endpoint")
        async def custom_endpoint():
            return {"result": "custom data"}
```

### Creating New MCP Tools

To create a new MCP tool:

1. Create a new file in the `tools/` directory
2. Implement your tool functions
3. Import and use the tool in your application

```python
# tools/my_custom_tool.py
def my_custom_analysis(data):
    # Analyze data
    result = process_data(data)
    return result
```

## Configuration

MCP can be configured through environment variables or a configuration file. The following environment variables are supported:

- `MCP_REGISTRY_URL`: URL of the MCP registry for service discovery
- `MCP_AUTH_KEY`: Authentication key for MCP services
- `MCP_CONFIG_PATH`: Path to a configuration file
- `MCP_STATISTICS_URL`: URL of the statistics server
- `MCP_MARKET_DATA_URL`: URL of the market data server
- `MCP_TRADE_ANALYSIS_URL`: URL of the trade analysis server
- `MCP_AI_URL`: URL of the AI server
- `MCP_AI_ENABLED`: Whether the AI server is enabled
- `MCP_ALERTS_URL`: URL of the alerts server
- `MCP_SENTIMENT_URL`: URL of the sentiment analysis server
- `MCP_TRADESAGE_URL`: URL of the TradeSage server
- `MCP_TRADESAGE_ENABLED`: Whether the TradeSage server is enabled

## Best Practices

1. **Use the MCP Integration Manager**: Always use the `get_mcp_integration()` function to access MCP features
2. **Error Handling**: Always handle errors from MCP tools and servers
3. **Feature Flags**: Use the `is_feature_enabled()` method to check if a feature is enabled
4. **Configuration**: Use the MCP configuration system for configuring MCP features
5. **Testing**: Test MCP features with unit tests

## Troubleshooting

Common issues:

1. **MCP Server Not Starting**: Check the server configuration and port availability
2. **Missing Dependencies**: Ensure all required dependencies are installed
3. **Configuration Issues**: Check the MCP configuration and environment variables
4. **Connection Issues**: Ensure the MCP servers are running and accessible
5. **Performance Issues**: Check for excessive tool calls or long-running operations

For more information, refer to the MCP documentation or contact the development team.
