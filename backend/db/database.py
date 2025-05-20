# File: backend/db/database.py
# Purpose: Database configuration and connection management

import os
import logging
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///tradingjournalapp.db")
logger.info(f"Using database URL: {DATABASE_URL}")

# Ensure the database directory exists
if DATABASE_URL.startswith("sqlite:///"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    dir_path = os.path.dirname(db_path)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Ensured database directory exists: {dir_path}")

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
    try:
        # Import all models to ensure they are registered with Base
        from ..models.user import User
        from ..models.trade import Trade
        from ..models.daily_plan import DailyPlan
        from ..models.journal import Journal
        from ..models.statistic import Statistic
        from ..models.alert import Alert
        
        # Create tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

def get_engine():
    """
    Get SQLAlchemy engine
    
    Returns:
        SQLAlchemy engine
    """
    return engine
