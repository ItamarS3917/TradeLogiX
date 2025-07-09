# File: backend/api/main.py
# Purpose: Main FastAPI application entry point for the Trading Journal API (Firebase-Only)

import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import routes
from .routes import users, trades, plans, journals, statistics, alerts, tradesage, cloud_sync, assets, uploads, leaderboards, backtest

# Import Firebase database
from ..db.firebase_database import get_firebase_db, initialize_firebase_db

# Import MCP integration
from ..mcp.mcp_integration import initialize_mcp, get_mcp_integration

# Set up import to avoid circular dependencies
import sys
if '.' not in sys.path:
    sys.path.append('.')

# Create FastAPI app
app = FastAPI(
    title="Trading Journal API (Firebase)",
    description="API for MCP-Enhanced Trading Journal Application using Firebase/Firestore",
    version="0.2.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directories
def setup_static_directories():
    os.makedirs("static", exist_ok=True)
    os.makedirs("static/screenshots", exist_ok=True)
    os.makedirs("cloud_storage", exist_ok=True)
    
    # Mount static directories
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.mount("/cloud_storage", StaticFiles(directory="cloud_storage"), name="cloud_storage")

setup_static_directories()

# Initialize Firebase and MCP on startup
@app.on_event("startup")
async def startup_event():
    # Initialize Firebase database
    initialize_firebase_db()
    print("✅ Firebase/Firestore initialized successfully")
    
    # Initialize MCP integration
    mcp = initialize_mcp(app)
    
    # Start MCP servers
    mcp.start_servers()
    
    print(f"✅ Initialized and started MCP integration with {len(mcp.servers)} servers")
    print("🔥 Trading Journal API running with Firebase-only storage")

# Include routes
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
app.include_router(journals.router, prefix="/api/journals", tags=["journals"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["statistics"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(tradesage.router, prefix="/api/tradesage", tags=["tradesage"])
app.include_router(cloud_sync.router, prefix="/api/cloud-sync", tags=["cloud-sync"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(leaderboards.router, prefix="/api/leaderboards", tags=["leaderboards"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["backtest"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Trading Journal API",
        "database": "Firebase/Firestore",
        "version": "0.2.0",
        "status": "🔥 Firebase-Only Mode"
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    try:
        # Test Firebase connection
        firebase_db = get_firebase_db()
        firebase_db.get_client()  # Test connection
        
        return {
            "status": "healthy",
            "database": "Firebase/Firestore",
            "timestamp": "2025-06-14",
            "firebase_connected": True
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# API info endpoint
@app.get("/api/info")
async def api_info():
    # Get MCP integration status
    try:
        mcp = get_mcp_integration()
        mcp_status = {
            "status": "active" if mcp.initialized else "inactive",
            "servers": [name for name in mcp.servers]
        }
    except:
        mcp_status = {"status": "inactive", "servers": []}
    
    return {
        "name": "Trading Journal API",
        "version": "0.2.0",
        "description": "API for MCP-Enhanced Trading Journal Application using Firebase/Firestore",
        "database": "Firebase/Firestore",
        "storage_mode": "Firebase-Only",
        "features": [
            "User management with Firebase Auth",
            "Trade tracking and analysis",
            "Daily planning",
            "Journaling",
            "Statistical analysis",
            "AI-powered insights (TradeSage)",
            "Alerts and notifications",
            "Cloud synchronization (Firebase)",
            "TradingView integration",
            "Anonymous leaderboards and competitions",
            "Achievement and badge system",
            "Trading challenges and community features",
            "Strategy backtesting and validation",
            "Performance analysis and optimization"
        ],
        "endpoints": {
            "users": "/api/users",
            "trades": "/api/trades",
            "assets": "/api/assets",
            "plans": "/api/plans",
            "journals": "/api/journals",
            "statistics": "/api/statistics",
            "alerts": "/api/alerts",
            "tradesage": "/api/tradesage",
            "cloud_sync": "/api/cloud-sync",
            "leaderboards": "/api/leaderboards",
            "backtest": "/api/backtest"
        },
        "mcp": mcp_status,
        "firebase": {
            "connected": True,
            "collections": [
                "users",
                "trades", 
                "plans",
                "journal_entries",
                "alerts",
                "user_preferences",
                "tradesage_conversations"
            ]
        }
    }

# Shutdown event to stop MCP servers
@app.on_event("shutdown")
async def shutdown_event():
    # Stop MCP servers
    try:
        mcp = get_mcp_integration()
        mcp.stop_servers()
    except:
        pass
    
    # Close cloud sync manager if running
    try:
        from ..services.cloud_service import CloudSyncManager
        if 'cloud_sync_manager' in globals() and cloud_sync_manager is not None:
            await cloud_sync_manager.close()
    except:
        pass
    
    print("🔥 Stopped MCP servers and closed Firebase resources")
