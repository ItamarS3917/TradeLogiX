# File: backend/db/database.py
# Purpose: Database configuration and connection management

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tradingjournalapp.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for models
Base = declarative_base()

def get_db() -> Session:
    """
    Get database session
    
    Returns:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def initialize_db() -> None:
    """
    Initialize database by creating all tables
    """
    # Import all models to ensure they are registered with Base
    from ..models.user import User
    from ..models.trade import Trade
    from ..models.daily_plan import DailyPlan
    from ..models.journal import Journal
    from ..models.statistic import Statistic
    from ..models.alert import Alert
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # TODO: Add seed data if needed
    # TODO: Add migration support
    # TODO: Add MCP-specific database initialization

def get_engine():
    """
    Get SQLAlchemy engine
    
    Returns:
        SQLAlchemy engine
    """
    return engine

# TODO: Add connection pooling
# TODO: Add database health check
# TODO: Add transaction management utilities
# TODO: Add MCP-specific database connectors