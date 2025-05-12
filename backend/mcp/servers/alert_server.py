# File: backend/mcp/servers/alert_server.py
# Purpose: MCP server for alerts and notification management

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import Request
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...models.alert import Alert
from ..mcp_server import MCPServer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlertServer(MCPServer):
    """
    MCP server for alerts and notification management
    Provides functionality for creating, managing, and triggering alerts
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize alert server
        
        Args:
            config (Dict[str, Any]): Server configuration
        """
        super().__init__(config)
        self.db_session_factory = get_db
        logger.info("Initialized AlertServer")
    
    def register_routes(self):
        """
        Register API routes for the alert server
        """
        # Alert endpoints
        @self.app.get("/api/v1/alerts")
        async def get_alerts_endpoint(request: Request):
            params = dict(request.query_params)
            return await self.get_alerts(params)
        
        @self.app.post("/api/v1/alerts")
        async def create_alert_endpoint(request: Request):
            data = await request.json()
            return await self.create_alert(data)
        
        @self.app.get("/api/v1/alerts/{alert_id}")
        async def get_alert_endpoint(alert_id: int):
            return await self.get_alert(alert_id)
        
        @self.app.put("/api/v1/alerts/{alert_id}")
        async def update_alert_endpoint(alert_id: int, request: Request):
            data = await request.json()
            return await self.update_alert(alert_id, data)
        
        @self.app.delete("/api/v1/alerts/{alert_id}")
        async def delete_alert_endpoint(alert_id: int):
            return await self.delete_alert(alert_id)
        
        @self.app.post("/api/v1/alerts/{alert_id}/trigger")
        async def trigger_alert_endpoint(alert_id: int):
            return await self.trigger_alert(alert_id)
        
        @self.app.get("/api/v1/alerts/types")
        async def get_alert_types_endpoint():
            return await self.get_alert_types()
    
    async def get_alerts(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get alerts based on query parameters
        
        Args:
            params (Dict[str, Any]): Query parameters
            
        Returns:
            Dict[str, Any]: Alerts
        """
        try:
            # Extract parameters
            user_id = params.get('user_id')
            status = params.get('status')
            type = params.get('type')
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Build query with filters
            query = db.query(Alert)
            
            if user_id:
                query = query.filter(Alert.user_id == user_id)
            if status:
                query = query.filter(Alert.status == status)
            if type:
                query = query.filter(Alert.type == type)
            
            # Execute query
            alerts = query.all()
            
            # Convert to list of dictionaries
            alert_list = [
                {
                    "id": alert.id,
                    "user_id": alert.user_id,
                    "type": alert.type,
                    "message": alert.message,
                    "status": alert.status,
                    "created_at": alert.created_at.isoformat() if alert.created_at else None,
                    "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                    "conditions": alert.conditions
                }
                for alert in alerts
            ]
            
            return {"alerts": alert_list}
            
        except Exception as e:
            logger.error(f"Error getting alerts: {str(e)}")
            return {"error": str(e)}
    
    async def create_alert(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new alert
        
        Args:
            data (Dict[str, Any]): Alert data
            
        Returns:
            Dict[str, Any]: Created alert
        """
        try:
            # Extract alert data
            user_id = data.get('user_id')
            type = data.get('type')
            message = data.get('message')
            conditions = data.get('conditions', {})
            
            # Validate required fields
            if not all([user_id, type, message]):
                return {"error": "Missing required fields: user_id, type, message"}
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Create alert
            alert = Alert(
                user_id=user_id,
                type=type,
                message=message,
                status="active",
                conditions=conditions,
                created_at=datetime.now()
            )
            
            # Add to database
            db.add(alert)
            db.commit()
            db.refresh(alert)
            
            return {
                "id": alert.id,
                "user_id": alert.user_id,
                "type": alert.type,
                "message": alert.message,
                "status": alert.status,
                "created_at": alert.created_at.isoformat() if alert.created_at else None,
                "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                "conditions": alert.conditions
            }
            
        except Exception as e:
            logger.error(f"Error creating alert: {str(e)}")
            return {"error": str(e)}
    
    async def get_alert(self, alert_id: int) -> Dict[str, Any]:
        """
        Get an alert by ID
        
        Args:
            alert_id (int): Alert ID
            
        Returns:
            Dict[str, Any]: Alert
        """
        try:
            # Get database session
            db = next(self.db_session_factory())
            
            # Get alert
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            
            if not alert:
                return {"error": f"Alert with ID {alert_id} not found"}
            
            return {
                "id": alert.id,
                "user_id": alert.user_id,
                "type": alert.type,
                "message": alert.message,
                "status": alert.status,
                "created_at": alert.created_at.isoformat() if alert.created_at else None,
                "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                "conditions": alert.conditions
            }
            
        except Exception as e:
            logger.error(f"Error getting alert: {str(e)}")
            return {"error": str(e)}
    
    async def update_alert(self, alert_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an alert
        
        Args:
            alert_id (int): Alert ID
            data (Dict[str, Any]): Updated alert data
            
        Returns:
            Dict[str, Any]: Updated alert
        """
        try:
            # Get database session
            db = next(self.db_session_factory())
            
            # Get alert
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            
            if not alert:
                return {"error": f"Alert with ID {alert_id} not found"}
            
            # Update fields
            if 'message' in data:
                alert.message = data['message']
            if 'status' in data:
                alert.status = data['status']
            if 'conditions' in data:
                alert.conditions = data['conditions']
            
            # Commit changes
            db.commit()
            db.refresh(alert)
            
            return {
                "id": alert.id,
                "user_id": alert.user_id,
                "type": alert.type,
                "message": alert.message,
                "status": alert.status,
                "created_at": alert.created_at.isoformat() if alert.created_at else None,
                "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                "conditions": alert.conditions
            }
            
        except Exception as e:
            logger.error(f"Error updating alert: {str(e)}")
            return {"error": str(e)}
    
    async def delete_alert(self, alert_id: int) -> Dict[str, Any]:
        """
        Delete an alert
        
        Args:
            alert_id (int): Alert ID
            
        Returns:
            Dict[str, Any]: Result
        """
        try:
            # Get database session
            db = next(self.db_session_factory())
            
            # Get alert
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            
            if not alert:
                return {"error": f"Alert with ID {alert_id} not found"}
            
            # Delete alert
            db.delete(alert)
            db.commit()
            
            return {"success": True, "message": f"Alert with ID {alert_id} deleted"}
            
        except Exception as e:
            logger.error(f"Error deleting alert: {str(e)}")
            return {"error": str(e)}
    
    async def trigger_alert(self, alert_id: int) -> Dict[str, Any]:
        """
        Trigger an alert
        
        Args:
            alert_id (int): Alert ID
            
        Returns:
            Dict[str, Any]: Result
        """
        try:
            # Get database session
            db = next(self.db_session_factory())
            
            # Get alert
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            
            if not alert:
                return {"error": f"Alert with ID {alert_id} not found"}
            
            # Update alert status
            alert.status = "triggered"
            alert.triggered_at = datetime.now()
            
            # Commit changes
            db.commit()
            db.refresh(alert)
            
            # Here we would also send notifications, but for now we just update the status
            return {
                "success": True,
                "message": f"Alert with ID {alert_id} triggered",
                "alert": {
                    "id": alert.id,
                    "user_id": alert.user_id,
                    "type": alert.type,
                    "message": alert.message,
                    "status": alert.status,
                    "created_at": alert.created_at.isoformat() if alert.created_at else None,
                    "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                    "conditions": alert.conditions
                }
            }
            
        except Exception as e:
            logger.error(f"Error triggering alert: {str(e)}")
            return {"error": str(e)}
    
    async def get_alert_types(self) -> Dict[str, Any]:
        """
        Get available alert types
        
        Returns:
            Dict[str, Any]: Alert types
        """
        try:
            # Return alert types
            types = [
                {
                    "id": "performance",
                    "name": "Performance Alert",
                    "description": "Triggers when performance metrics reach certain thresholds",
                    "configurable_conditions": [
                        "win_rate", "profit_loss", "drawdown", "streak"
                    ]
                },
                {
                    "id": "rule_violation",
                    "name": "Trading Rule Violation",
                    "description": "Triggers when trading rules are violated",
                    "configurable_conditions": [
                        "position_size", "risk_reward", "setup_type"
                    ]
                },
                {
                    "id": "goal",
                    "name": "Goal Achievement",
                    "description": "Triggers when trading goals are achieved",
                    "configurable_conditions": [
                        "profit_target", "win_rate_target", "trade_count"
                    ]
                },
                {
                    "id": "pattern",
                    "name": "Pattern Detection",
                    "description": "Triggers when specific trading patterns are detected",
                    "configurable_conditions": [
                        "consecutive_losses", "emotional_trading", "time_based_pattern"
                    ]
                },
                {
                    "id": "custom",
                    "name": "Custom Alert",
                    "description": "Customizable alert with user-defined conditions",
                    "configurable_conditions": [
                        "custom_condition"
                    ]
                }
            ]
            
            return {"types": types}
            
        except Exception as e:
            logger.error(f"Error getting alert types: {str(e)}")
            return {"error": str(e)}
