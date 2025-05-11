# File: backend/services/alert_service.py
# Purpose: Service for managing and processing trading alerts

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import logging
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session

from ..models.alert import Alert, AlertType, AlertStatus
from ..models.trade import Trade
from ..models.statistic import Statistic

logger = logging.getLogger(__name__)

def create_alert(db: Session, alert_data: Dict[str, Any]) -> Alert:
    """
    Create a new alert
    """
    # Convert trigger conditions to JSON if provided as dict
    trigger_conditions = alert_data.get("trigger_conditions")
    if trigger_conditions and isinstance(trigger_conditions, dict):
        alert_data["trigger_conditions"] = json.dumps(trigger_conditions)
    
    # Create new alert
    alert = Alert(
        user_id=alert_data.get("user_id"),
        type=alert_data.get("type", AlertType.CUSTOM),
        title=alert_data.get("title"),
        message=alert_data.get("message"),
        status=alert_data.get("status", AlertStatus.ACTIVE),
        trigger_conditions=alert_data.get("trigger_conditions", {})
    )
    
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    return alert

def update_alert(db: Session, alert_id: int, alert_data: Dict[str, Any]) -> Alert:
    """
    Update an existing alert
    """
    # Get alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise ValueError(f"Alert with ID {alert_id} not found")
    
    # Update fields
    if "type" in alert_data:
        alert.type = alert_data["type"]
    
    if "title" in alert_data:
        alert.title = alert_data["title"]
    
    if "message" in alert_data:
        alert.message = alert_data["message"]
    
    if "status" in alert_data:
        alert.status = alert_data["status"]
    
    if "trigger_conditions" in alert_data:
        if isinstance(alert_data["trigger_conditions"], dict):
            alert.trigger_conditions = alert_data["trigger_conditions"]
        else:
            alert.trigger_conditions = json.loads(alert_data["trigger_conditions"])
    
    db.commit()
    db.refresh(alert)
    
    return alert

def delete_alert(db: Session, alert_id: int) -> bool:
    """
    Delete an alert
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise ValueError(f"Alert with ID {alert_id} not found")
    
    db.delete(alert)
    db.commit()
    
    return True

def get_alert_by_id(db: Session, alert_id: int) -> Optional[Alert]:
    """
    Get an alert by ID
    """
    return db.query(Alert).filter(Alert.id == alert_id).first()

def get_alerts(
    db: Session,
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    type: Optional[str] = None,
    user_id: Optional[int] = None
) -> Tuple[List[Alert], int, Dict[str, Any]]:
    """
    Get alerts with pagination and filters
    """
    # Build query
    query = db.query(Alert)
    
    # Apply filters
    if status:
        query = query.filter(Alert.status == status)
    
    if type:
        query = query.filter(Alert.type == type)
    
    if user_id:
        query = query.filter(Alert.user_id == user_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    alerts = query.order_by(desc(Alert.created_at)).offset(offset).limit(limit).all()
    
    # Build pagination info
    pagination = {
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit  # Ceiling division
    }
    
    return alerts, total, pagination

def check_alerts(db: Session) -> List[Dict[str, Any]]:
    """
    Check all active alerts and trigger if conditions are met
    """
    # Get all active alerts
    active_alerts = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE).all()
    
    triggered_alerts = []
    
    for alert in active_alerts:
        is_triggered = False
        
        # Get trigger conditions
        conditions = alert.trigger_conditions
        
        if not conditions:
            continue
        
        # Check alert type and process accordingly
        try:
            if alert.type == AlertType.PERFORMANCE:
                is_triggered = _check_performance_alert(db, alert, conditions)
            elif alert.type == AlertType.RULE_VIOLATION:
                is_triggered = _check_rule_violation_alert(db, alert, conditions)
            elif alert.type == AlertType.GOAL_ACHIEVEMENT:
                is_triggered = _check_goal_achievement_alert(db, alert, conditions)
            elif alert.type == AlertType.RISK_MANAGEMENT:
                is_triggered = _check_risk_management_alert(db, alert, conditions)
            elif alert.type == AlertType.PATTERN_DETECTION:
                is_triggered = _check_pattern_detection_alert(db, alert, conditions)
            elif alert.type == AlertType.CUSTOM:
                is_triggered = _check_custom_alert(db, alert, conditions)
            
            # Update alert if triggered
            if is_triggered:
                alert.status = AlertStatus.TRIGGERED
                alert.triggered_at = datetime.utcnow()
                db.commit()
                
                triggered_alerts.append({
                    "id": alert.id,
                    "type": alert.type,
                    "title": alert.title,
                    "message": alert.message
                })
        except Exception as e:
            logger.error(f"Error checking alert {alert.id}: {str(e)}")
    
    return triggered_alerts

def mark_alert_as_read(db: Session, alert_id: int) -> Alert:
    """
    Mark an alert as read (dismissed)
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise ValueError(f"Alert with ID {alert_id} not found")
    
    alert.status = AlertStatus.DISMISSED
    db.commit()
    db.refresh(alert)
    
    return alert

def _check_performance_alert(db: Session, alert: Alert, conditions: Dict[str, Any]) -> bool:
    """
    Check if performance alert conditions are met
    """
    # Extract conditions
    metric = conditions.get("metric")
    operator = conditions.get("operator")
    threshold = conditions.get("threshold")
    time_period = conditions.get("time_period", "day")  # Default to day
    
    if not all([metric, operator, threshold is not None]):
        return False
    
    # Calculate time range
    now = datetime.utcnow()
    
    if time_period == "day":
        start_date = now - timedelta(days=1)
    elif time_period == "week":
        start_date = now - timedelta(days=7)
    elif time_period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=30)  # Default to 30 days
    
    # Query trades for the period
    trades_query = db.query(Trade).filter(
        Trade.user_id == alert.user_id,
        Trade.entry_time >= start_date,
        Trade.entry_time <= now
    )
    
    # Calculate metric value
    value = None
    
    if metric == "win_rate":
        trades = trades_query.all()
        if not trades:
            return False
        
        win_count = sum(1 for t in trades if t.outcome == "Win")
        value = (win_count / len(trades)) * 100 if trades else 0
    
    elif metric == "profit_loss":
        trades = trades_query.all()
        if not trades:
            return False
        
        value = sum(t.profit_loss for t in trades)
    
    elif metric == "consecutive_losses":
        trades = trades_query.order_by(Trade.entry_time.desc()).all()
        if not trades:
            return False
        
        value = 0
        for trade in trades:
            if trade.outcome == "Loss":
                value += 1
            else:
                break
    
    # Compare with threshold
    if value is not None:
        if operator == ">" and value > threshold:
            return True
        elif operator == ">=" and value >= threshold:
            return True
        elif operator == "<" and value < threshold:
            return True
        elif operator == "<=" and value <= threshold:
            return True
        elif operator == "==" and value == threshold:
            return True
    
    return False

def _check_rule_violation_alert(db: Session, alert: Alert, conditions: Dict[str, Any]) -> bool:
    """
    Check if rule violation alert conditions are met
    """
    # Extract conditions
    rule_type = conditions.get("rule_type")
    time_period = conditions.get("time_period", "day")  # Default to day
    
    if not rule_type:
        return False
    
    # Calculate time range
    now = datetime.utcnow()
    
    if time_period == "day":
        start_date = now - timedelta(days=1)
    elif time_period == "week":
        start_date = now - timedelta(days=7)
    elif time_period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=30)  # Default to 30 days
    
    # Query trades for the period
    trades_query = db.query(Trade).filter(
        Trade.user_id == alert.user_id,
        Trade.entry_time >= start_date,
        Trade.entry_time <= now
    )
    
    # Check rule violation
    if rule_type == "max_loss_exceeded":
        max_loss = conditions.get("max_loss")
        if max_loss is None:
            return False
        
        trades = trades_query.filter(Trade.profit_loss < 0).all()
        if not trades:
            return False
        
        for trade in trades:
            if abs(trade.profit_loss) > max_loss:
                return True
    
    elif rule_type == "max_position_size_exceeded":
        max_position_size = conditions.get("max_position_size")
        if max_position_size is None:
            return False
        
        trades = trades_query.all()
        if not trades:
            return False
        
        for trade in trades:
            if trade.position_size > max_position_size:
                return True
    
    elif rule_type == "trading_outside_hours":
        allowed_hours = conditions.get("allowed_hours", [])
        if not allowed_hours:
            return False
        
        trades = trades_query.all()
        if not trades:
            return False
        
        for trade in trades:
            if trade.entry_time:
                hour = trade.entry_time.hour
                if hour not in allowed_hours:
                    return True
    
    return False

def _check_goal_achievement_alert(db: Session, alert: Alert, conditions: Dict[str, Any]) -> bool:
    """
    Check if goal achievement alert conditions are met
    """
    # Extract conditions
    goal_type = conditions.get("goal_type")
    target = conditions.get("target")
    
    if not all([goal_type, target is not None]):
        return False
    
    # Calculate time range (usually from goal start date)
    start_date = datetime.fromisoformat(conditions.get("start_date")) if conditions.get("start_date") else datetime.utcnow() - timedelta(days=30)
    end_date = datetime.fromisoformat(conditions.get("end_date")) if conditions.get("end_date") else datetime.utcnow()
    
    # Query trades for the period
    trades_query = db.query(Trade).filter(
        Trade.user_id == alert.user_id,
        Trade.entry_time >= start_date,
        Trade.entry_time <= end_date
    )
    
    # Check goal achievement
    if goal_type == "win_rate":
        trades = trades_query.all()
        if not trades:
            return False
        
        win_count = sum(1 for t in trades if t.outcome == "Win")
        win_rate = (win_count / len(trades)) * 100 if trades else 0
        
        return win_rate >= target
    
    elif goal_type == "profit_target":
        trades = trades_query.all()
        if not trades:
            return False
        
        total_profit = sum(t.profit_loss for t in trades)
        
        return total_profit >= target
    
    elif goal_type == "trade_count":
        trade_count = trades_query.count()
        
        return trade_count >= target
    
    return False

def _check_risk_management_alert(db: Session, alert: Alert, conditions: Dict[str, Any]) -> bool:
    """
    Check if risk management alert conditions are met
    """
    # Extract conditions
    risk_type = conditions.get("risk_type")
    threshold = conditions.get("threshold")
    time_period = conditions.get("time_period", "day")  # Default to day
    
    if not all([risk_type, threshold is not None]):
        return False
    
    # Calculate time range
    now = datetime.utcnow()
    
    if time_period == "day":
        start_date = now - timedelta(days=1)
    elif time_period == "week":
        start_date = now - timedelta(days=7)
    elif time_period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=30)  # Default to 30 days
    
    # Query trades for the period
    trades_query = db.query(Trade).filter(
        Trade.user_id == alert.user_id,
        Trade.entry_time >= start_date,
        Trade.entry_time <= now
    )
    
    # Check risk management alert
    if risk_type == "drawdown":
        trades = trades_query.order_by(Trade.entry_time).all()
        if not trades:
            return False
        
        # Calculate drawdown
        cumulative_pnl = 0
        peak = 0
        max_drawdown = 0
        
        for trade in trades:
            cumulative_pnl += trade.profit_loss
            peak = max(peak, cumulative_pnl)
            drawdown = (peak - cumulative_pnl) / peak * 100 if peak > 0 else 0
            max_drawdown = max(max_drawdown, drawdown)
        
        return max_drawdown >= threshold
    
    elif risk_type == "risk_reward_ratio":
        trades = trades_query.all()
        if not trades:
            return False
        
        valid_trades = [t for t in trades if t.planned_risk_reward is not None]
        if not valid_trades:
            return False
        
        avg_rr = sum(t.planned_risk_reward for t in valid_trades) / len(valid_trades)
        
        return avg_rr <= threshold
    
    elif risk_type == "win_loss_ratio":
        trades = trades_query.all()
        if not trades:
            return False
        
        win_count = sum(1 for t in trades if t.outcome == "Win")
        loss_count = sum(1 for t in trades if t.outcome == "Loss")
        
        if loss_count == 0:
            return False  # Cannot divide by zero
        
        win_loss_ratio = win_count / loss_count
        
        return win_loss_ratio <= threshold
    
    return False

def _check_pattern_detection_alert(db: Session, alert: Alert, conditions: Dict[str, Any]) -> bool:
    """
    Check if pattern detection alert conditions are met
    """
    # Extract conditions
    pattern_type = conditions.get("pattern_type")
    lookback_period = conditions.get("lookback_period", 20)  # Default to 20 trades
    
    if not pattern_type:
        return False
    
    # Query recent trades
    trades = db.query(Trade).filter(
        Trade.user_id == alert.user_id
    ).order_by(Trade.entry_time.desc()).limit(lookback_period).all()
    
    if not trades:
        return False
    
    # Check for patterns
    if pattern_type == "overtrading":
        # Check for excessive trading in a short time period
        if len(trades) < 5:
            return False
        
        # Get the time span of the trades
        latest_trade = trades[0].entry_time
        earliest_trade = trades[-1].entry_time
        
        if not latest_trade or not earliest_trade:
            return False
        
        hours_diff = (latest_trade - earliest_trade).total_seconds() / 3600
        
        # If more than 5 trades in less than 4 hours, consider it overtrading
        return len(trades) >= 5 and hours_diff <= 4
    
    elif pattern_type == "revenge_trading":
        # Check for entering trades quickly after losses
        if len(trades) < 3:
            return False
        
        for i in range(len(trades) - 1):
            current_trade = trades[i]
            next_trade = trades[i+1]
            
            if (current_trade.outcome == "Loss" and next_trade.entry_time and current_trade.exit_time and 
                (next_trade.entry_time - current_trade.exit_time).total_seconds() < 600):  # Less than 10 minutes
                return True
        
        return False
    
    elif pattern_type == "deteriorating_performance":
        # Check for declining win rate over time
        if len(trades) < 10:
            return False
        
        # Split trades into two halves
        half_point = len(trades) // 2
        recent_trades = trades[:half_point]
        earlier_trades = trades[half_point:]
        
        recent_win_rate = sum(1 for t in recent_trades if t.outcome == "Win") / len(recent_trades) * 100
        earlier_win_rate = sum(1 for t in earlier_trades if t.outcome == "Win") / len(earlier_trades) * 100
        
        # If recent win rate is significantly lower (by 20 percentage points)
        return (earlier_win_rate - recent_win_rate) >= 20
    
    return False

def _check_custom_alert(db: Session, alert: Alert, conditions: Dict[str, Any]) -> bool:
    """
    Check if custom alert conditions are met
    """
    # Custom alerts can have arbitrary conditions
    # For simplicity, we'll just check if the alert is due
    
    # Check if alert has a due date
    due_date_str = conditions.get("due_date")
    if not due_date_str:
        return False
    
    try:
        due_date = datetime.fromisoformat(due_date_str)
        now = datetime.utcnow()
        
        return now >= due_date
    except (ValueError, TypeError):
        return False
