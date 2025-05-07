# File: backend/api/main.py
# Purpose: Main FastAPI application entry point for the Trading Journal API

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from .routes import users, trades, plans, journals, statistics, alerts

# Import database
from ..db.database import get_db, initialize_db

# Import MCP configuration
from ..mcp.mcp_config import setup_mcp_servers

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
    
    # Setup MCP servers
    setup_mcp_servers()

# Include routes
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
app.include_router(journals.router, prefix="/api/journals", tags=["journals"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["statistics"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Trading Journal API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# TODO: Add authentication middleware
# TODO: Add error handling middleware
# TODO: Add logging middleware