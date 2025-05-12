# File: backend/api/main.py
# Purpose: Main FastAPI application entry point for the Trading Journal API

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from .routes import users, trades, plans, journals, statistics, alerts, tradesage

# Import database
from ..db.database import get_db, initialize_db

# Import MCP integration
from ..mcp.mcp_integration import initialize_mcp, get_mcp_integration

# Set up import to avoid circular dependencies
import sys
if '.' not in sys.path:
    sys.path.append('.')

# Create FastAPI app
app = FastAPI(
    title="Trading Journal API",
    description="API for MCP-Enhanced Trading Journal Application",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and MCP servers on startup
@app.on_event("startup")
async def startup_event():
    # Initialize database
    initialize_db()
    
    # Initialize MCP integration
    mcp = initialize_mcp(app)
    
    # Start MCP servers
    mcp.start_servers()
    
    print(f"Initialized and started MCP integration with {len(mcp.servers)} servers")

# Include routes
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
app.include_router(journals.router, prefix="/api/journals", tags=["journals"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["statistics"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(tradesage.router, prefix="/api/tradesage", tags=["tradesage"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Trading Journal API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# API info endpoint
@app.get("/api/info")
async def api_info():
    # Get MCP integration status
    mcp = get_mcp_integration()
    mcp_status = {
        "status": "active" if mcp.initialized else "inactive",
        "servers": [name for name in mcp.servers]
    }
    
    return {
        "name": "Trading Journal API",
        "version": "0.1.0",
        "description": "API for MCP-Enhanced Trading Journal Application",
        "features": [
            "User management",
            "Trade tracking and analysis",
            "Daily planning",
            "Journaling",
            "Statistical analysis",
            "AI-powered insights (TradeSage)",
            "Alerts and notifications"
        ],
        "endpoints": {
            "users": "/api/users",
            "trades": "/api/trades",
            "plans": "/api/plans",
            "journals": "/api/journals",
            "statistics": "/api/statistics",
            "alerts": "/api/alerts",
            "tradesage": "/api/tradesage",
            "mcp": "/api/mcp"
        },
        "mcp": mcp_status
    }

# Shutdown event to stop MCP servers
@app.on_event("shutdown")
async def shutdown_event():
    # Stop MCP servers
    mcp = get_mcp_integration()
    mcp.stop_servers()
    print("Stopped MCP servers")

# TODO: Add authentication middleware
# TODO: Add error handling middleware
# TODO: Add logging middleware
