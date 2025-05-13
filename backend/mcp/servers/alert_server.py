# File: backend/mcp/servers/alert_server.py
# Purpose: MCP server for alerts and notification management

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import Request
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...models.alert import Alert, AlertStatus, AlertType
from ...models.user import User
from ..mcp_server import MCPServer
from ..tools.notification_manager import NotificationManager

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
        self.notification_manager = NotificationManager(config.get("notification", {}))
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
            
        @self.app.post("/api/v1/alerts/check")
        async def check_alerts_endpoint(request: Request):
            data = await request.json()
            return await self.check_alerts(data)
            
        @self.app.post("/api/v1/alerts/rules")
        async def get_alert_rules_endpoint():
            return await self.get_alert_rules()
        
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
            alert.status = AlertStatus.TRIGGERED
            alert.triggered_at = datetime.now()
            
            # Commit changes
            db.commit()
            db.refresh(alert)
            
            # Send notifications
            user = db.query(User).filter(User.id == alert.user_id).first()
            
            # Determine notification channels based on user preferences
            channels = []
            if user and user.preferences:
                prefs = user.preferences.get('notification_preferences', {})
                if prefs.get('in_app_notifications', True):
                    channels.append('in_app')
                if prefs.get('email_notifications', False):
                    channels.append('email')
                if prefs.get('browser_notifications', False):
                    channels.append('browser')
            
            # Default to in-app if no preferences set
            if not channels:
                channels = ['in_app']
            
            # Send notification
            notification_data = {
                "title": f"Alert: {alert.title}",
                "message": alert.message,
                "type": alert.type.value if isinstance(alert.type, AlertType) else alert.type,
                "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                "alert_id": alert.id
            }
            
            notification_result = await self.notification_manager.send_notification(
                alert.user_id, notification_data, channels)
            
            return {
                "success": True,
                "message": f"Alert with ID {alert_id} triggered",
                "alert": {
                    "id": alert.id,
                    "user_id": alert.user_id,
                    "type": alert.type.value if isinstance(alert.type, AlertType) else alert.type,
                    "title": alert.title,
                    "message": alert.message,
                    "status": alert.status.value if isinstance(alert.status, AlertStatus) else alert.status,
                    "created_at": alert.created_at.isoformat() if alert.created_at else None,
                    "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
                    "trigger_conditions": alert.trigger_conditions
                },
                "notification": notification_result
            }
            
        except Exception as e:
            logger.error(f"Error triggering alert: {str(e)}")
            return {"error": str(e)}
    
    async def check_alerts(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if any alerts should be triggered based on provided data
        
        Args:
            data (Dict[str, Any]): Data to check against alert conditions
            
        Returns:
            Dict[str, Any]: Result with triggered alerts
        """
        try:
            # Extract data
            user_id = data.get('user_id')
            metrics = data.get('metrics', {})
            trade_data = data.get('trade_data', {})
            
            if not user_id:
                return {"error": "Missing required field: user_id"}
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Get active alerts for user
            alerts = db.query(Alert).filter(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE
            ).all()
            
            # Check each alert against conditions
            triggered_alerts = []
            
            for alert in alerts:
                # Check if alert conditions are met
                if self._check_alert_conditions(alert, metrics, trade_data):
                    # Trigger alert
                    result = await self.trigger_alert(alert.id)
                    if result.get('success'):
                        triggered_alerts.append(result.get('alert'))
            
            return {
                "success": True,
                "triggered_alerts": triggered_alerts,
                "triggered_count": len(triggered_alerts)
            }
            
        except Exception as e:
            logger.error(f"Error checking alerts: {str(e)}")
            return {"error": str(e)}
    
    def _check_alert_conditions(self, alert: Alert, metrics: Dict[str, Any], 
                               trade_data: Dict[str, Any]) -> bool:
        """
        Check if alert conditions are met
        
        Args:
            alert (Alert): Alert to check
            metrics (Dict[str, Any]): Performance metrics
            trade_data (Dict[str, Any]): Trade data
            
        Returns:
            bool: Whether conditions are met
        """
        try:
            conditions = alert.trigger_conditions
            
            if not conditions:
                return False
            
            # Check conditions based on alert type
            if alert.type == AlertType.PERFORMANCE:
                return self._check_performance_conditions(conditions, metrics)
            elif alert.type == AlertType.RULE_VIOLATION:
                return self._check_rule_violation_conditions(conditions, trade_data)
            elif alert.type == AlertType.GOAL_ACHIEVEMENT:
                return self._check_goal_conditions(conditions, metrics)
            elif alert.type == AlertType.PATTERN_DETECTION:
                return self._check_pattern_conditions(conditions, metrics, trade_data)
            elif alert.type == AlertType.CUSTOM:
                return self._check_custom_conditions(conditions, metrics, trade_data)
            else:
                return False
                
        except Exception as e:
            logger.error(f"Error checking alert conditions: {str(e)}")
            return False
    
    def _check_performance_conditions(self, conditions: Dict[str, Any], metrics: Dict[str, Any]) -> bool:
        """
        Check performance alert conditions
        
        Args:
            conditions (Dict[str, Any]): Alert conditions
            metrics (Dict[str, Any]): Performance metrics
            
        Returns:
            bool: Whether conditions are met
        """
        try:
            for key, value in conditions.items():
                if key == 'win_rate':
                    operator = value.get('operator', '==')
                    threshold = value.get('threshold', 0)
                    actual = metrics.get('win_rate', 0)
                    
                    if not self._compare_values(actual, threshold, operator):
                        return False
                        
                elif key == 'profit_loss':
                    operator = value.get('operator', '==')
                    threshold = value.get('threshold', 0)
                    actual = metrics.get('profit_loss', 0)
                    
                    if not self._compare_values(actual, threshold, operator):
                        return False
                        
                elif key == 'drawdown':
                    operator = value.get('operator', '==')
                    threshold = value.get('threshold', 0)
                    actual = metrics.get('drawdown', 0)
                    
                    if not self._compare_values(actual, threshold, operator):
                        return False
                        
                elif key == 'streak':
                    operator = value.get('operator', '==')
                    threshold = value.get('threshold', 0)
                    streak_type = value.get('streak_type', 'win')
                    actual = metrics.get(f'{streak_type}_streak', 0)
                    
                    if not self._compare_values(actual, threshold, operator):
                        return False
            
            return True
                
        except Exception as e:
            logger.error(f"Error checking performance conditions: {str(e)}")
            return False
    
    def _check_rule_violation_conditions(self, conditions: Dict[str, Any], trade_data: Dict[str, Any]) -> bool:
        """
        Check rule violation alert conditions
        
        Args:
            conditions (Dict[str, Any]): Alert conditions
            trade_data (Dict[str, Any]): Trade data
            
        Returns:
            bool: Whether conditions are met
        """
        # Implementation will depend on specific trading rules
        # This is a simplified example
        try:
            for key, value in conditions.items():
                if key == 'position_size':
                    max_size = value.get('max', 0)
                    actual = trade_data.get('position_size', 0)
                    
                    if actual > max_size:
                        return True
                        
                elif key == 'risk_reward':
                    min_ratio = value.get('min', 0)
                    actual = trade_data.get('risk_reward', 0)
                    
                    if actual < min_ratio:
                        return True
                        
                elif key == 'setup_type':
                    allowed = value.get('allowed', [])
                    actual = trade_data.get('setup_type')
                    
                    if actual and actual not in allowed:
                        return True
            
            return False
                
        except Exception as e:
            logger.error(f"Error checking rule violation conditions: {str(e)}")
            return False
    
    def _check_goal_conditions(self, conditions: Dict[str, Any], metrics: Dict[str, Any]) -> bool:
        """
        Check goal achievement alert conditions
        
        Args:
            conditions (Dict[str, Any]): Alert conditions
            metrics (Dict[str, Any]): Performance metrics
            
        Returns:
            bool: Whether conditions are met
        """
        try:
            for key, value in conditions.items():
                if key == 'profit_target':
                    target = value.get('target', 0)
                    actual = metrics.get('profit_loss', 0)
                    
                    if actual >= target:
                        return True
                        
                elif key == 'win_rate_target':
                    target = value.get('target', 0)
                    actual = metrics.get('win_rate', 0)
                    
                    if actual >= target:
                        return True
                        
                elif key == 'trade_count':
                    target = value.get('target', 0)
                    actual = metrics.get('trade_count', 0)
                    
                    if actual >= target:
                        return True
            
            return False
                
        except Exception as e:
            logger.error(f"Error checking goal conditions: {str(e)}")
            return False
    
    def _check_pattern_conditions(self, conditions: Dict[str, Any], metrics: Dict[str, Any], 
                                 trade_data: Dict[str, Any]) -> bool:
        """
        Check pattern detection alert conditions
        
        Args:
            conditions (Dict[str, Any]): Alert conditions
            metrics (Dict[str, Any]): Performance metrics
            trade_data (Dict[str, Any]): Trade data
            
        Returns:
            bool: Whether conditions are met
        """
        try:
            for key, value in conditions.items():
                if key == 'consecutive_losses':
                    threshold = value.get('threshold', 0)
                    actual = metrics.get('current_loss_streak', 0)
                    
                    if actual >= threshold:
                        return True
                        
                elif key == 'emotional_trading':
                    threshold = value.get('threshold', 0)
                    emotional_trades = metrics.get('emotional_trades', 0)
                    total_trades = metrics.get('total_trades', 1)  # Avoid division by zero
                    actual = (emotional_trades / total_trades) * 100
                    
                    if actual >= threshold:
                        return True
                        
                elif key == 'time_based_pattern':
                    # This would be a more complex implementation
                    # For now, just return False
                    return False
            
            return False
                
        except Exception as e:
            logger.error(f"Error checking pattern conditions: {str(e)}")
            return False
    
    def _check_custom_conditions(self, conditions: Dict[str, Any], metrics: Dict[str, Any], 
                               trade_data: Dict[str, Any]) -> bool:
        """
        Check custom alert conditions
        
        Args:
            conditions (Dict[str, Any]): Alert conditions
            metrics (Dict[str, Any]): Performance metrics
            trade_data (Dict[str, Any]): Trade data
            
        Returns:
            bool: Whether conditions are met
        """
        # Custom conditions would depend on specific implementation
        # For this example, we'll just pass through the custom_condition value
        return conditions.get('custom_condition', False)
    
    def _compare_values(self, actual: Any, threshold: Any, operator: str) -> bool:
        """
        Compare values based on operator
        
        Args:
            actual (Any): Actual value
            threshold (Any): Threshold value
            operator (str): Comparison operator
            
        Returns:
            bool: Comparison result
        """
        try:
            if operator == '==':
                return actual == threshold
            elif operator == '!=':
                return actual != threshold
            elif operator == '<':
                return actual < threshold
            elif operator == '<=':
                return actual <= threshold
            elif operator == '>':
                return actual > threshold
            elif operator == '>=':
                return actual >= threshold
            else:
                return False
                
        except Exception as e:
            logger.error(f"Error comparing values: {str(e)}")
            return False
    
    async def get_alert_rules(self) -> Dict[str, Any]:
        """
        Get alert rules for each alert type
        
        Returns:
            Dict[str, Any]: Alert rules
        """
        try:
            rules = {
                "PERFORMANCE": {
                    "win_rate": {
                        "description": "Win rate threshold",
                        "operators": ["==", "!=", "<", "<=", ">", ">="],
                        "threshold_type": "percentage"
                    },
                    "profit_loss": {
                        "description": "Profit/loss threshold",
                        "operators": ["==", "!=", "<", "<=", ">", ">="],
                        "threshold_type": "currency"
                    },
                    "drawdown": {
                        "description": "Drawdown threshold",
                        "operators": ["==", "!=", "<", "<=", ">", ">="],
                        "threshold_type": "percentage"
                    },
                    "streak": {
                        "description": "Win/loss streak threshold",
                        "operators": ["==", "!=", "<", "<=", ">", ">="],
                        "threshold_type": "count",
                        "streak_types": ["win", "loss"]
                    }
                },
                "RULE_VIOLATION": {
                    "position_size": {
                        "description": "Maximum position size",
                        "threshold_type": "currency"
                    },
                    "risk_reward": {
                        "description": "Minimum risk:reward ratio",
                        "threshold_type": "ratio"
                    },
                    "setup_type": {
                        "description": "Allowed setup types",
                        "threshold_type": "list"
                    }
                },
                "GOAL_ACHIEVEMENT": {
                    "profit_target": {
                        "description": "Profit target",
                        "threshold_type": "currency"
                    },
                    "win_rate_target": {
                        "description": "Win rate target",
                        "threshold_type": "percentage"
                    },
                    "trade_count": {
                        "description": "Trade count target",
                        "threshold_type": "count"
                    }
                },
                "PATTERN_DETECTION": {
                    "consecutive_losses": {
                        "description": "Consecutive losses threshold",
                        "threshold_type": "count"
                    },
                    "emotional_trading": {
                        "description": "Emotional trading percentage threshold",
                        "threshold_type": "percentage"
                    },
                    "time_based_pattern": {
                        "description": "Time-based trading pattern",
                        "threshold_type": "custom"
                    }
                },
                "CUSTOM": {
                    "custom_condition": {
                        "description": "Custom alert condition",
                        "threshold_type": "boolean"
                    }
                }
            }
            
            return {"rules": rules}
            
        except Exception as e:
            logger.error(f"Error getting alert rules: {str(e)}")
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
                    "id": "PERFORMANCE",
                    "name": "Performance Alert",
                    "description": "Triggers when performance metrics reach certain thresholds",
                    "configurable_conditions": [
                        "win_rate", "profit_loss", "drawdown", "streak"
                    ]
                },
                {
                    "id": "RULE_VIOLATION",
                    "name": "Trading Rule Violation",
                    "description": "Triggers when trading rules are violated",
                    "configurable_conditions": [
                        "position_size", "risk_reward", "setup_type"
                    ]
                },
                {
                    "id": "GOAL_ACHIEVEMENT",
                    "name": "Goal Achievement",
                    "description": "Triggers when trading goals are achieved",
                    "configurable_conditions": [
                        "profit_target", "win_rate_target", "trade_count"
                    ]
                },
                {
                    "id": "PATTERN_DETECTION",
                    "name": "Pattern Detection",
                    "description": "Triggers when specific trading patterns are detected",
                    "configurable_conditions": [
                        "consecutive_losses", "emotional_trading", "time_based_pattern"
                    ]
                },
                {
                    "id": "CUSTOM",
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
