# Trading Journal App Database Documentation

This document provides a comprehensive overview of the database implementation in the Trading Journal App. It explains what each file does, how the components interact, and common error scenarios to watch for.

## Table of Contents

1. [Database Architecture Overview](#database-architecture-overview)
2. [Database Files and Their Functions](#database-files-and-their-functions)
3. [Models and Schema](#models-and-schema)
4. [Database Initialization Process](#database-initialization-process)
5. [Common Error Scenarios](#common-error-scenarios)
6. [Debugging and Troubleshooting](#debugging-and-troubleshooting)

## Database Architecture Overview

The Trading Journal App uses a robust database architecture with the following components:

- **ORM**: SQLAlchemy for object-relational mapping
- **Schema Validation**: Pydantic models for request/response validation
- **Database**: SQLite for development, PostgreSQL support for production
- **Pattern**: Repository pattern for database operations
- **API Integration**: FastAPI dependency injection for database sessions

The database architecture follows the MVC pattern with a clear separation between:
- Models (SQLAlchemy models in `/backend/models/`)
- Controllers (API routes in `/backend/api/routes/`)
- Repository layer (in `/backend/db/repository.py`)

## Database Files and Their Functions

### `/backend/db/` Directory

#### `database.py`
**Purpose**: Core database configuration and connection management
**Key Functions**:
- `engine`: SQLAlchemy engine instance
- `SessionLocal`: Session factory for database operations
- `Base`: Declarative base for SQLAlchemy models
- `get_db()`: Dependency function for FastAPI that provides a database session
- `initialize_db()`: Creates all database tables based on model definitions
- `get_engine()`: Returns the SQLAlchemy engine instance

**Error Points**: 
- Database connection issues (check DATABASE_URL in .env)
- Table creation failures (check model definitions)

#### `repository.py`
**Purpose**: Implements the repository pattern for database operations
**Key Components**:
- `Repository` class: Generic repository with CRUD operations
- `TradeRepository`: Specialized repository for Trade operations
- `UserRepository`: Specialized repository for User operations
- `JournalRepository`: Specialized repository for Journal operations

**Key Functions**:
- `get_by_id()`: Retrieve entity by ID
- `get_all()`: Get all entities with pagination
- `create()`: Create a new entity
- `update()`: Update an existing entity
- `delete()`: Delete an entity
- `count()`: Count all entities
- `exists()`: Check if entity exists

**Specialized Methods**:
- `TradeRepository.get_by_user_id()`: Get trades for a specific user
- `TradeRepository.get_by_symbol()`: Get trades for a specific symbol
- `TradeRepository.get_by_user()`: Get trades by user with date filtering
- `UserRepository.get_by_email()`: Get user by email
- `UserRepository.get_by_username()`: Get user by username
- `JournalRepository.get_by_user_id()`: Get journals for a specific user
- `JournalRepository.get_by_date_range()`: Get journals in a date range

**Error Points**:
- JSON field processing errors (check trade.screenshots and trade.tags)
- Date parsing issues (check entry_time and exit_time formats)
- Foreign key constraint violations

#### `schemas.py`
**Purpose**: Pydantic schemas for API request/response validation
**Key Components**:
- Base schemas: Define common fields (e.g., `UserBase`, `TradeBase`)
- Create schemas: For entity creation (e.g., `UserCreate`, `TradeCreate`)
- Update schemas: For entity updates (e.g., `UserUpdate`, `TradeUpdate`)
- Response schemas: For API responses (e.g., `UserResponse`, `TradeResponse`)

**Key Validators**:
- Trade outcome validation: Ensures outcome is Win/Loss/Breakeven
- Plan adherence validation: Ensures values between 1-10
- Mood rating validation: Ensures values between 1-10
- Alert type validation: Ensures valid alert types
- Datetime validation: Handles various datetime formats

**Error Points**:
- Validation errors (check input data against schema requirements)
- Field type mismatches (especially dates and JSON fields)

### `/backend/models/` Directory

Each model file in this directory defines an SQLAlchemy model that maps to a database table.

#### `__init__.py`
**Purpose**: Imports all models to ensure they're registered with SQLAlchemy Base
**Key Function**: Ensures all models are available for database operations

#### `user.py`
**Purpose**: User model with authentication and preferences
**Key Fields**:
- `id`: Primary key
- `username`, `email`: User identifiers
- `hashed_password`: For authentication
- `preferences`: JSON field for user settings
- Relationship fields to trades, plans, journals, etc.

**Error Points**: 
- Unique constraint violations (username, email)
- JSON serialization issues with preferences

#### `trade.py`
**Purpose**: Trade model to record trading activities
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `symbol`, `setup_type`: Trade identifiers
- `entry_price`, `exit_price`, `position_size`: Trade details
- `entry_time`, `exit_time`: Timestamps for trade
- `planned_risk_reward`, `actual_risk_reward`: Risk metrics
- `outcome`, `profit_loss`: Trade results
- `emotional_state`, `plan_adherence`: Psychological factors
- `notes`, `screenshots`, `tags`: Additional data

**Error Points**:
- Enum validation failures (outcome, emotional state, plan adherence)
- DateTime parsing issues
- JSON field serialization (screenshots, tags)

#### `daily_plan.py`
**Purpose**: Daily trading plan model for pre-market planning
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `date`: Plan date
- `market_bias`: Market direction assessment
- `key_levels`: JSON field for price levels
- `goals`, `risk_parameters`, `mental_state`, `notes`: Plan details

**Error Points**:
- Enum validation failures (market_bias, mental_state)
- JSON field serialization (key_levels, risk_parameters)
- Date formatting issues

#### `journal.py`
**Purpose**: Journal entries for trading reflections
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `date`: Journal entry date
- `content`: Main journal text
- `mood_rating`: Numerical rating of mood
- `tags`: JSON field for categorization
- `related_trade_ids`: JSON field linking to trades

**Error Points**:
- JSON field serialization (tags, related_trade_ids)
- Date formatting issues

#### `alert.py`
**Purpose**: Alert model for notifications
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `type`, `title`, `message`: Alert content
- `status`: Alert status (ACTIVE, TRIGGERED, etc.)
- `trigger_conditions`: JSON field for alert rules

**Error Points**:
- Enum validation failures (type, status)
- JSON field serialization (trigger_conditions)

#### `statistic.py`
**Purpose**: Statistics for performance metrics
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `name`, `category`, `period`: Statistic identifiers
- `value`, `text_value`, `json_value`: Different value types
- `start_date`, `end_date`: Time period
- `filters`: JSON field for filtering criteria

**Error Points**:
- JSON field serialization (json_value, filters)
- Date formatting issues

#### `asset.py`
**Purpose**: Trading assets model
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `symbol`, `name`, `type`: Asset identifiers
- `description`, `metadata`: Additional information

**Error Points**:
- JSON field serialization (metadata)
- Unique constraint violations (symbol)

#### `preferences.py`
**Purpose**: User preferences model
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `theme`, `layout`: UI preferences
- `default_symbol`, `default_timeframe`: Trading defaults
- `notification_settings`: JSON field for notifications
- `chart_settings`: JSON field for chart preferences

**Error Points**:
- JSON field serialization (notification_settings, chart_settings)

#### `chart_template.py`
**Purpose**: Chart templates for visualization
**Key Fields**:
- `id`, `user_id`: Primary and foreign keys
- `name`, `description`: Template identifiers
- `config`: JSON field for chart configuration

**Error Points**:
- JSON field serialization (config)
- Unique constraint violations (name per user)

## Database Initialization Process

The database initialization process occurs in multiple stages:

1. **Configuration Loading**:
   - Environment variables are loaded from `.env`
   - `DATABASE_URL` determines the database connection

2. **Engine and Session Setup** (in `database.py`):
   - SQLAlchemy engine is created with the connection string
   - Session factory is configured for database operations

3. **Table Creation** (in `initialize_db()` function):
   - All models are imported to ensure registration with Base
   - `Base.metadata.create_all(bind=engine)` creates all tables

4. **Initialization Triggers**:
   - On application startup via `@app.on_event("startup")` in `main.py`
   - Through the setup script (`setup.py`) during installation
   - Manually via utility scripts

## Common Error Scenarios

### Database Connection Issues
- **Symptoms**: "Cannot connect to database" errors on startup
- **Check**: 
  - `DATABASE_URL` in `.env` file
  - Database server is running (if PostgreSQL)
  - Database file permissions (if SQLite)

### Schema Migration Errors
- **Symptoms**: "Table already exists" or column definition errors
- **Check**:
  - Delete database file and re-initialize (development only)
  - Check model definitions for compatibility

### JSON Field Processing Errors
- **Symptoms**: "Not JSON serializable" or deserialization errors
- **Check**:
  - The `process_json_field` function in `/backend/utils/json_helpers.py`
  - JSON data structure in requests

### Date Parsing Issues
- **Symptoms**: "Invalid date format" or timezone errors
- **Check**:
  - The `parse_date_string` function in `/backend/utils/date_helpers.py`
  - Date format in requests (ISO 8601 recommended)

### Foreign Key Constraint Violations
- **Symptoms**: "Foreign key constraint failed" errors during operations
- **Check**:
  - Entity existence before referencing (e.g., user_id before creating a trade)
  - Cascading delete settings in relationships

### Enum Validation Failures
- **Symptoms**: "Value is not a valid enumeration member" errors
- **Check**:
  - Enum definitions in model files
  - Input validation in schema files

## Debugging and Troubleshooting

### Database Inspection

To inspect the database directly:

**SQLite**:
```bash
# Using SQLite CLI
sqlite3 tradingjournalapp.db

# Common commands
.tables                           # List all tables
.schema <table_name>              # Show table schema
SELECT * FROM <table_name>;       # View table contents
```

**PostgreSQL**:
```bash
# Connect to PostgreSQL
psql -U <username> -d tradingjournalapp

# Common commands
\dt                               # List all tables
\d <table_name>                   # Show table schema
SELECT * FROM <table_name>;       # View table contents
```

### Logging Database Operations

To enable SQLAlchemy logging, modify `database.py`:

```python
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Verifying Database Structure

Use the following script to verify the database structure:

```python
# Save as verify_db.py
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Import necessary modules
from backend.db.database import engine
from sqlalchemy import inspect, MetaData

# Get inspector
inspector = inspect(engine)

# Print all tables
print("=== Database Tables ===")
for table_name in inspector.get_table_names():
    print(f"\nTable: {table_name}")
    print("  Columns:")
    for column in inspector.get_columns(table_name):
        print(f"    - {column['name']}: {column['type']}")
    
    print("  Primary Key:", inspector.get_pk_constraint(table_name))
    print("  Foreign Keys:")
    for fk in inspector.get_foreign_keys(table_name):
        print(f"    - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")

# Run with: python verify_db.py
```

## Additional Resources

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [FastAPI Database Documentation](https://fastapi.tiangolo.com/tutorial/sql-databases/)
