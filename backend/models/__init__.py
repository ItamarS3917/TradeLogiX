# File: backend/models/__init__.py
# Purpose: Import all models to ensure they are registered with SQLAlchemy

from .user import User
from .trade import Trade
from .daily_plan import DailyPlan
from .journal import Journal
from .statistic import Statistic
from .alert import Alert
from .asset import Asset
from .preferences import Preferences
from .chart_template import ChartTemplate

# This ensures all models are imported and registered with SQLAlchemy Base
