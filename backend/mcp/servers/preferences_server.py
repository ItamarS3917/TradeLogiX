# File: backend/mcp/servers/preferences_server.py
# Purpose: MCP server for user preferences and theme customization

import logging
from typing import Dict, List, Any, Optional
from fastapi import Request
from sqlalchemy.orm import Session
import json

from ...db.database import get_db
from ...models.preferences import Preferences
from ...models.user import User
from ..mcp_server import MCPServer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PreferencesServer(MCPServer):
    """
    MCP server for user preferences and theme customization
    Provides functionality for managing theme and UI preferences
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize preferences server
        
        Args:
            config (Dict[str, Any]): Server configuration
        """
        super().__init__(config)
        self.db_session_factory = get_db
        logger.info("Initialized PreferencesServer")
    
    def register_routes(self):
        """
        Register API routes for the preferences server
        """
        @self.app.get("/api/v1/preferences/{user_id}")
        async def get_preferences_endpoint(user_id: int):
            return await self.get_preferences(user_id)
        
        @self.app.put("/api/v1/preferences/{user_id}")
        async def update_preferences_endpoint(user_id: int, request: Request):
            data = await request.json()
            return await self.update_preferences(user_id, data)
        
        @self.app.get("/api/v1/preferences/{user_id}/theme")
        async def get_theme_endpoint(user_id: int):
            return await self.get_theme(user_id)
        
        @self.app.put("/api/v1/preferences/{user_id}/theme")
        async def update_theme_endpoint(user_id: int, request: Request):
            data = await request.json()
            return await self.update_theme(user_id, data)
        
        @self.app.get("/api/v1/preferences/{user_id}/dashboard")
        async def get_dashboard_layout_endpoint(user_id: int):
            return await self.get_dashboard_layout(user_id)
        
        @self.app.put("/api/v1/preferences/{user_id}/dashboard")
        async def update_dashboard_layout_endpoint(user_id: int, request: Request):
            data = await request.json()
            return await self.update_dashboard_layout(user_id, data)
        
        @self.app.get("/api/v1/preferences/{user_id}/notifications")
        async def get_notification_preferences_endpoint(user_id: int):
            return await self.get_notification_preferences(user_id)
        
        @self.app.put("/api/v1/preferences/{user_id}/notifications")
        async def update_notification_preferences_endpoint(user_id: int, request: Request):
            data = await request.json()
            return await self.update_notification_preferences(user_id, data)
        
        @self.app.get("/api/v1/preferences/themes/available")
        async def get_available_themes_endpoint():
            return await self.get_available_themes()
    
    async def get_preferences(self, user_id: int) -> Dict[str, Any]:
        """
        Get all preferences for a user
        
        Args:
            user_id (int): User ID
            
        Returns:
            Dict[str, Any]: User preferences
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            return {
                "id": preferences.id,
                "user_id": preferences.user_id,
                "theme": preferences.theme,
                "dashboard_layout": preferences.dashboard_layout,
                "chart_preferences": preferences.chart_preferences,
                "notification_preferences": preferences.notification_preferences,
                "timezone": preferences.timezone,
                "date_format": preferences.date_format,
                "created_at": preferences.created_at.isoformat() if preferences.created_at else None,
                "updated_at": preferences.updated_at.isoformat() if preferences.updated_at else None
            }
        except Exception as e:
            logger.error(f"Error getting preferences: {str(e)}")
            return {"error": str(e)}
    
    async def update_preferences(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update preferences for a user
        
        Args:
            user_id (int): User ID
            data (Dict[str, Any]): Updated preferences data
            
        Returns:
            Dict[str, Any]: Updated preferences
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Update fields
            if 'theme' in data:
                preferences.theme = data['theme']
            if 'dashboard_layout' in data:
                preferences.dashboard_layout = data['dashboard_layout']
            if 'chart_preferences' in data:
                preferences.chart_preferences = data['chart_preferences']
            if 'notification_preferences' in data:
                preferences.notification_preferences = data['notification_preferences']
            if 'timezone' in data:
                preferences.timezone = data['timezone']
            if 'date_format' in data:
                preferences.date_format = data['date_format']
            
            # Save changes
            db.commit()
            db.refresh(preferences)
            
            return {
                "id": preferences.id,
                "user_id": preferences.user_id,
                "theme": preferences.theme,
                "dashboard_layout": preferences.dashboard_layout,
                "chart_preferences": preferences.chart_preferences,
                "notification_preferences": preferences.notification_preferences,
                "timezone": preferences.timezone,
                "date_format": preferences.date_format,
                "created_at": preferences.created_at.isoformat() if preferences.created_at else None,
                "updated_at": preferences.updated_at.isoformat() if preferences.updated_at else None
            }
        except Exception as e:
            logger.error(f"Error updating preferences: {str(e)}")
            return {"error": str(e)}
    
    async def get_theme(self, user_id: int) -> Dict[str, Any]:
        """
        Get theme preferences for a user
        
        Args:
            user_id (int): User ID
            
        Returns:
            Dict[str, Any]: Theme preferences
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Return theme with defaults if not set
            theme = preferences.theme or {}
            
            # Apply defaults if not set
            if 'mode' not in theme:
                theme['mode'] = 'light'
            if 'primary' not in theme:
                theme['primary'] = '#1976d2'
            if 'secondary' not in theme:
                theme['secondary'] = '#dc004e'
            if 'background' not in theme:
                theme['background'] = '#f5f5f5'
            if 'text' not in theme:
                theme['text'] = '#333333'
            
            return {"theme": theme}
        except Exception as e:
            logger.error(f"Error getting theme: {str(e)}")
            return {"error": str(e)}
    
    async def update_theme(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update theme preferences for a user
        
        Args:
            user_id (int): User ID
            data (Dict[str, Any]): Updated theme data
            
        Returns:
            Dict[str, Any]: Updated theme
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Get existing theme or init empty one
            theme = preferences.theme or {}
            
            # Update theme properties
            theme_data = data.get('theme', {})
            
            if 'mode' in theme_data:
                theme['mode'] = theme_data['mode']
            if 'primary' in theme_data:
                theme['primary'] = theme_data['primary']
            if 'secondary' in theme_data:
                theme['secondary'] = theme_data['secondary']
            if 'background' in theme_data:
                theme['background'] = theme_data['background']
            if 'text' in theme_data:
                theme['text'] = theme_data['text']
                
            # Save updated theme
            preferences.theme = theme
            db.commit()
            db.refresh(preferences)
            
            return {"theme": preferences.theme}
        except Exception as e:
            logger.error(f"Error updating theme: {str(e)}")
            return {"error": str(e)}
    
    async def get_dashboard_layout(self, user_id: int) -> Dict[str, Any]:
        """
        Get dashboard layout preferences for a user
        
        Args:
            user_id (int): User ID
            
        Returns:
            Dict[str, Any]: Dashboard layout preferences
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Return dashboard layout with defaults if not set
            layout = preferences.dashboard_layout or {}
            
            # Apply defaults if not set
            if 'widgets' not in layout:
                layout['widgets'] = [
                    {"id": "performance_summary", "position": 0, "visible": True},
                    {"id": "recent_trades", "position": 1, "visible": True},
                    {"id": "win_rate_chart", "position": 2, "visible": True},
                    {"id": "daily_pnl", "position": 3, "visible": True}
                ]
            
            return {"dashboard_layout": layout}
        except Exception as e:
            logger.error(f"Error getting dashboard layout: {str(e)}")
            return {"error": str(e)}
    
    async def update_dashboard_layout(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update dashboard layout preferences for a user
        
        Args:
            user_id (int): User ID
            data (Dict[str, Any]): Updated dashboard layout data
            
        Returns:
            Dict[str, Any]: Updated dashboard layout
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Update dashboard layout
            dashboard_layout = data.get('dashboard_layout', {})
            preferences.dashboard_layout = dashboard_layout
            
            # Save changes
            db.commit()
            db.refresh(preferences)
            
            return {"dashboard_layout": preferences.dashboard_layout}
        except Exception as e:
            logger.error(f"Error updating dashboard layout: {str(e)}")
            return {"error": str(e)}
    
    async def get_notification_preferences(self, user_id: int) -> Dict[str, Any]:
        """
        Get notification preferences for a user
        
        Args:
            user_id (int): User ID
            
        Returns:
            Dict[str, Any]: Notification preferences
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Return notification preferences with defaults if not set
            notification_prefs = preferences.notification_preferences or {}
            
            # Apply defaults if not set
            if 'email_notifications' not in notification_prefs:
                notification_prefs['email_notifications'] = True
            if 'in_app_notifications' not in notification_prefs:
                notification_prefs['in_app_notifications'] = True
            if 'browser_notifications' not in notification_prefs:
                notification_prefs['browser_notifications'] = False
            if 'alert_types' not in notification_prefs:
                notification_prefs['alert_types'] = {
                    "performance": True,
                    "rule_violation": True,
                    "goal": True,
                    "pattern": True,
                    "custom": True
                }
            
            return {"notification_preferences": notification_prefs}
        except Exception as e:
            logger.error(f"Error getting notification preferences: {str(e)}")
            return {"error": str(e)}
    
    async def update_notification_preferences(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update notification preferences for a user
        
        Args:
            user_id (int): User ID
            data (Dict[str, Any]): Updated notification preferences data
            
        Returns:
            Dict[str, Any]: Updated notification preferences
        """
        try:
            db = next(self.db_session_factory())
            preferences = self._get_or_create_preferences(db, user_id)
            
            # Get existing notification preferences or init empty one
            notification_prefs = preferences.notification_preferences or {}
            
            # Update notification preferences
            new_prefs = data.get('notification_preferences', {})
            
            if 'email_notifications' in new_prefs:
                notification_prefs['email_notifications'] = new_prefs['email_notifications']
            if 'in_app_notifications' in new_prefs:
                notification_prefs['in_app_notifications'] = new_prefs['in_app_notifications']
            if 'browser_notifications' in new_prefs:
                notification_prefs['browser_notifications'] = new_prefs['browser_notifications']
            if 'alert_types' in new_prefs:
                notification_prefs['alert_types'] = new_prefs['alert_types']
            
            # Save updated preferences
            preferences.notification_preferences = notification_prefs
            db.commit()
            db.refresh(preferences)
            
            return {"notification_preferences": preferences.notification_preferences}
        except Exception as e:
            logger.error(f"Error updating notification preferences: {str(e)}")
            return {"error": str(e)}
    
    async def get_available_themes(self) -> Dict[str, Any]:
        """
        Get available themes for the application
        
        Returns:
            Dict[str, Any]: Available themes
        """
        try:
            # Return predefined themes
            themes = [
                {
                    "id": "default_light",
                    "name": "Default Light",
                    "mode": "light",
                    "primary": "#1976d2",
                    "secondary": "#dc004e",
                    "background": "#f5f5f5",
                    "text": "#333333"
                },
                {
                    "id": "default_dark",
                    "name": "Default Dark",
                    "mode": "dark",
                    "primary": "#90caf9",
                    "secondary": "#f48fb1",
                    "background": "#303030",
                    "text": "#ffffff"
                },
                {
                    "id": "trading_pro",
                    "name": "Trading Pro",
                    "mode": "dark",
                    "primary": "#2e7d32",
                    "secondary": "#d32f2f",
                    "background": "#1c1c1c",
                    "text": "#e0e0e0"
                },
                {
                    "id": "ocean_blue",
                    "name": "Ocean Blue",
                    "mode": "light",
                    "primary": "#0288d1",
                    "secondary": "#0097a7",
                    "background": "#e3f2fd",
                    "text": "#263238"
                },
                {
                    "id": "warm_sunset",
                    "name": "Warm Sunset",
                    "mode": "light",
                    "primary": "#e64a19",
                    "secondary": "#ffb300",
                    "background": "#fbe9e7",
                    "text": "#3e2723"
                }
            ]
            
            return {"themes": themes}
        except Exception as e:
            logger.error(f"Error getting available themes: {str(e)}")
            return {"error": str(e)}
    
    def _get_or_create_preferences(self, db: Session, user_id: int) -> Preferences:
        """
        Get or create preferences for a user
        
        Args:
            db (Session): Database session
            user_id (int): User ID
            
        Returns:
            Preferences: User preferences object
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Check if preferences exist
        preferences = db.query(Preferences).filter(Preferences.user_id == user_id).first()
        
        # If not, create preferences
        if not preferences:
            preferences = Preferences(
                user_id=user_id,
                theme={
                    "mode": "light",
                    "primary": "#1976d2",
                    "secondary": "#dc004e",
                    "background": "#f5f5f5",
                    "text": "#333333"
                },
                dashboard_layout={
                    "widgets": [
                        {"id": "performance_summary", "position": 0, "visible": True},
                        {"id": "recent_trades", "position": 1, "visible": True},
                        {"id": "win_rate_chart", "position": 2, "visible": True},
                        {"id": "daily_pnl", "position": 3, "visible": True}
                    ]
                },
                notification_preferences={
                    "email_notifications": True,
                    "in_app_notifications": True,
                    "browser_notifications": False,
                    "alert_types": {
                        "performance": True,
                        "rule_violation": True,
                        "goal": True,
                        "pattern": True,
                        "custom": True
                    }
                }
            )
            db.add(preferences)
            db.commit()
            db.refresh(preferences)
        
        return preferences
