#!/usr/bin/env python3
"""
Test data factories for the Trading Journal application
Uses factory_boy to generate realistic test data
"""

import factory
import factory.fuzzy
from datetime import datetime, timedelta, time
from decimal import Decimal
import random
from typing import List, Dict, Any

# Import models (adjust imports based on your actual models)
# from backend.models import Trade, DailyPlan, JournalEntry, User


class UserFactory(factory.Factory):
    """Factory for creating test users"""
    
    class Meta:
        model = dict  # Replace with actual User model
    
    id = factory.Sequence(lambda n: n)
    username = factory.Sequence(lambda n: f"trader_{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    trading_style = factory.fuzzy.FuzzyChoice(['day_trader', 'swing_trader', 'scalper'])
    experience_level = factory.fuzzy.FuzzyChoice(['beginner', 'intermediate', 'advanced', 'expert'])
    preferred_instruments = factory.LazyFunction(
        lambda: random.sample(['NQ', 'ES', 'YM', 'RTY', 'CL', 'GC'], k=random.randint(1, 3))
    )
    risk_tolerance = factory.fuzzy.FuzzyChoice(['conservative', 'moderate', 'aggressive'])
    created_at = factory.Faker('date_time_between', start_date='-1y', end_date='now')
    is_active = True


class TradeFactory(factory.Factory):
    """Factory for creating test trades"""
    
    class Meta:
        model = dict  # Replace with actual Trade model
    
    id = factory.Sequence(lambda n: n)
    user_id = factory.SubFactory(UserFactory)
    
    # Basic trade information
    symbol = factory.fuzzy.FuzzyChoice(['NQ', 'ES', 'YM', 'RTY'])
    setup_type = factory.fuzzy.FuzzyChoice([
        'MMXM_Breaker', 'MMXM_Mitigation', 'MMXM_Displacement',
        'ICT_FVG', 'ICT_OB', 'ICT_MSS', 'ICT_BOS',
        'Supply_Zone', 'Demand_Zone', 'Liquidity_Grab'
    ])
    
    # Price and position data
    entry_price = factory.fuzzy.FuzzyDecimal(14500.0, 15500.0, 2)
    exit_price = factory.LazyAttribute(lambda obj: obj.entry_price + random.uniform(-50, 50))
    position_size = factory.fuzzy.FuzzyInteger(1, 5)
    
    # Timing
    trade_date = factory.Faker('date_between', start_date='-6m', end_date='today')
    entry_time = factory.LazyAttribute(lambda obj: 
        datetime.combine(obj.trade_date, time(
            hour=random.randint(9, 15),
            minute=random.randint(0, 59),
            second=random.randint(0, 59)
        ))
    )
    exit_time = factory.LazyAttribute(lambda obj: 
        obj.entry_time + timedelta(minutes=random.randint(5, 240))
    )
    
    # Risk and reward
    planned_risk_reward = factory.fuzzy.FuzzyFloat(1.5, 3.0)
    actual_risk_reward = factory.LazyAttribute(lambda obj: 
        (obj.exit_price - obj.entry_price) / abs(obj.entry_price * 0.01) if obj.exit_price != obj.entry_price else 0
    )
    
    # Outcome and P&L
    outcome = factory.LazyAttribute(lambda obj: 'win' if obj.exit_price > obj.entry_price else 'loss')
    profit_loss = factory.LazyAttribute(lambda obj: 
        (obj.exit_price - obj.entry_price) * obj.position_size * 20  # NQ point value
    )
    
    # Trading psychology
    emotional_state = factory.fuzzy.FuzzyChoice([
        'confident', 'nervous', 'calm', 'excited', 'frustrated', 'focused', 'impatient'
    ])
    plan_adherence = factory.fuzzy.FuzzyInteger(1, 10)
    
    # Additional data
    market_conditions = factory.fuzzy.FuzzyChoice([
        'trending_up', 'trending_down', 'ranging', 'volatile', 'low_volume'
    ])
    notes = factory.Faker('text', max_nb_chars=200)
    tags = factory.LazyFunction(lambda: random.sample([
        'breakout', 'reversal', 'continuation', 'gap_fill', 'news_driven',
        'technical', 'fundamental', 'momentum', 'mean_reversion'
    ], k=random.randint(1, 3)))
    
    # Screenshots and attachments
    screenshots = factory.LazyFunction(lambda: [
        f"screenshot_{random.randint(1000, 9999)}.png" for _ in range(random.randint(0, 3))
    ])
    
    created_at = factory.LazyAttribute(lambda obj: obj.entry_time)
    updated_at = factory.LazyAttribute(lambda obj: obj.exit_time)


class WinningTradeFactory(TradeFactory):
    """Factory for creating winning trades"""
    
    exit_price = factory.LazyAttribute(lambda obj: obj.entry_price + random.uniform(10, 50))
    outcome = 'win'
    emotional_state = factory.fuzzy.FuzzyChoice(['confident', 'calm', 'focused', 'excited'])
    plan_adherence = factory.fuzzy.FuzzyInteger(7, 10)


class LosingTradeFactory(TradeFactory):
    """Factory for creating losing trades"""
    
    exit_price = factory.LazyAttribute(lambda obj: obj.entry_price - random.uniform(10, 30))
    outcome = 'loss'
    emotional_state = factory.fuzzy.FuzzyChoice(['frustrated', 'nervous', 'impatient'])
    plan_adherence = factory.fuzzy.FuzzyInteger(3, 8)


class BreakevenTradeFactory(TradeFactory):
    """Factory for creating breakeven trades"""
    
    exit_price = factory.LazyAttribute(lambda obj: obj.entry_price + random.uniform(-2, 2))
    outcome = 'breakeven'
    profit_loss = factory.LazyAttribute(lambda obj: random.uniform(-5, 5))
    emotional_state = factory.fuzzy.FuzzyChoice(['calm', 'neutral', 'focused'])


class DailyPlanFactory(factory.Factory):
    """Factory for creating daily trading plans"""
    
    class Meta:
        model = dict  # Replace with actual DailyPlan model
    
    id = factory.Sequence(lambda n: n)
    user_id = factory.SubFactory(UserFactory)
    
    date = factory.Faker('date_between', start_date='-6m', end_date='today')
    
    # Market analysis
    market_bias = factory.fuzzy.FuzzyChoice(['bullish', 'bearish', 'neutral'])
    key_levels = factory.LazyFunction(lambda: sorted([
        round(15000 + random.uniform(-100, 100), 2) for _ in range(random.randint(3, 6))
    ]))
    
    # Goals and planning
    daily_goal = factory.Faker('sentence', nb_words=8)
    max_trades = factory.fuzzy.FuzzyInteger(3, 8)
    target_profit = factory.fuzzy.FuzzyInteger(100, 500)
    max_loss = factory.fuzzy.FuzzyInteger(100, 300)
    
    # Risk management
    risk_parameters = factory.LazyFunction(lambda: {
        'max_daily_loss': random.randint(200, 500),
        'max_position_size': random.randint(2, 5),
        'risk_per_trade': random.randint(25, 100),
        'max_drawdown': random.randint(100, 300)
    })
    
    # Mental preparation
    mental_state = factory.fuzzy.FuzzyChoice(['focused', 'confident', 'calm', 'energized', 'cautious'])
    market_expectations = factory.Faker('text', max_nb_chars=150)
    
    # Notes and observations
    notes = factory.Faker('text', max_nb_chars=300)
    weather = factory.fuzzy.FuzzyChoice(['sunny', 'cloudy', 'rainy', 'clear'])
    sleep_quality = factory.fuzzy.FuzzyInteger(1, 10)
    
    created_at = factory.LazyAttribute(lambda obj: 
        datetime.combine(obj.date, time(hour=8, minute=random.randint(0, 59)))
    )
    updated_at = factory.LazyAttribute(lambda obj: obj.created_at)


class JournalEntryFactory(factory.Factory):
    """Factory for creating journal entries"""
    
    class Meta:
        model = dict  # Replace with actual JournalEntry model
    
    id = factory.Sequence(lambda n: n)
    user_id = factory.SubFactory(UserFactory)
    
    date = factory.Faker('date_between', start_date='-6m', end_date='today')
    entry_type = factory.fuzzy.FuzzyChoice(['daily_review', 'trade_reflection', 'lesson_learned', 'goal_setting'])
    
    # Content
    title = factory.Faker('sentence', nb_words=5)
    content = factory.Faker('text', max_nb_chars=500)
    
    # Emotional tracking
    mood_rating = factory.fuzzy.FuzzyInteger(1, 10)
    confidence_level = factory.fuzzy.FuzzyInteger(1, 10)
    stress_level = factory.fuzzy.FuzzyInteger(1, 10)
    
    # Insights and lessons
    insights = factory.LazyFunction(lambda: [
        factory.Faker('sentence', nb_words=6).generate() for _ in range(random.randint(1, 3))
    ])
    lessons_learned = factory.LazyFunction(lambda: [
        factory.Faker('sentence', nb_words=8).generate() for _ in range(random.randint(0, 2))
    ])
    
    # Tags and categorization
    tags = factory.LazyFunction(lambda: random.sample([
        'psychology', 'strategy', 'risk_management', 'market_analysis', 
        'execution', 'discipline', 'learning', 'improvement'
    ], k=random.randint(1, 3)))
    
    # Related trades
    related_trade_ids = factory.LazyFunction(lambda: [
        random.randint(1, 100) for _ in range(random.randint(0, 3))
    ])
    
    created_at = factory.LazyAttribute(lambda obj: 
        datetime.combine(obj.date, time(hour=random.randint(16, 20), minute=random.randint(0, 59)))
    )
    updated_at = factory.LazyAttribute(lambda obj: obj.created_at)


class MarketDataFactory(factory.Factory):
    """Factory for creating market data snapshots"""
    
    class Meta:
        model = dict
    
    symbol = 'NQ'
    timestamp = factory.Faker('date_time_between', start_date='-1d', end_date='now')
    
    # Price data
    open_price = factory.fuzzy.FuzzyDecimal(14800.0, 15200.0, 2)
    high_price = factory.LazyAttribute(lambda obj: obj.open_price + random.uniform(0, 50))
    low_price = factory.LazyAttribute(lambda obj: obj.open_price - random.uniform(0, 50))
    close_price = factory.LazyAttribute(lambda obj: 
        obj.open_price + random.uniform(-25, 25)
    )
    
    # Volume and activity
    volume = factory.fuzzy.FuzzyInteger(50000, 200000)
    open_interest = factory.fuzzy.FuzzyInteger(100000, 500000)
    
    # Technical indicators
    rsi = factory.fuzzy.FuzzyFloat(20.0, 80.0)
    macd = factory.fuzzy.FuzzyFloat(-10.0, 10.0)
    moving_average_20 = factory.LazyAttribute(lambda obj: obj.close_price + random.uniform(-20, 20))
    moving_average_50 = factory.LazyAttribute(lambda obj: obj.close_price + random.uniform(-30, 30))


class AlertFactory(factory.Factory):
    """Factory for creating alert configurations"""
    
    class Meta:
        model = dict
    
    id = factory.Sequence(lambda n: n)
    user_id = factory.SubFactory(UserFactory)
    
    name = factory.Faker('sentence', nb_words=4)
    alert_type = factory.fuzzy.FuzzyChoice([
        'price_target', 'risk_management', 'performance_milestone', 
        'trading_pattern', 'market_condition'
    ])
    
    # Conditions
    condition = factory.LazyFunction(lambda: {
        'metric': random.choice(['daily_pnl', 'win_rate', 'drawdown', 'position_size']),
        'operator': random.choice(['greater_than', 'less_than', 'equals']),
        'threshold': random.uniform(50, 500)
    })
    
    # Actions
    action = factory.LazyFunction(lambda: {
        'type': random.choice(['email', 'push_notification', 'sms']),
        'message': factory.Faker('sentence', nb_words=10).generate(),
        'priority': random.choice(['low', 'medium', 'high'])
    })
    
    is_active = True
    triggered_count = factory.fuzzy.FuzzyInteger(0, 10)
    last_triggered = factory.Faker('date_time_between', start_date='-1m', end_date='now')
    
    created_at = factory.Faker('date_time_between', start_date='-3m', end_date='now')


# Utility functions for generating test datasets

def create_realistic_trading_session(user_id: int = 1, date: str = None) -> Dict[str, Any]:
    """Create a realistic trading session with multiple trades and a daily plan"""
    
    if date is None:
        date = factory.Faker('date_between', start_date='-30d', end_date='today').generate()
    
    # Create daily plan
    daily_plan = DailyPlanFactory(user_id=user_id, date=date)
    
    # Create trades for the day
    num_trades = random.randint(2, 6)
    trades = []
    
    # Determine session outcome (good day, bad day, mixed)
    session_type = random.choice(['good_day', 'bad_day', 'mixed_day'])
    
    for i in range(num_trades):
        if session_type == 'good_day':
            # More winning trades
            trade_factory = WinningTradeFactory if random.random() > 0.3 else LosingTradeFactory
        elif session_type == 'bad_day':
            # More losing trades
            trade_factory = LosingTradeFactory if random.random() > 0.3 else WinningTradeFactory
        else:
            # Mixed results
            trade_factory = random.choice([WinningTradeFactory, LosingTradeFactory, BreakevenTradeFactory])
        
        trade = trade_factory(
            user_id=user_id,
            trade_date=date,
            entry_time=datetime.combine(date, time(
                hour=9 + i,
                minute=random.randint(0, 59)
            ))
        )
        trades.append(trade)
    
    # Create journal entry for the day
    journal_entry = JournalEntryFactory(
        user_id=user_id,
        date=date,
        related_trade_ids=[trade['id'] for trade in trades]
    )
    
    return {
        'daily_plan': daily_plan,
        'trades': trades,
        'journal_entry': journal_entry,
        'session_type': session_type
    }


def create_performance_dataset(
    user_id: int = 1,
    days: int = 90,
    win_rate: float = 0.65
) -> Dict[str, List[Any]]:
    """Create a performance dataset with specified characteristics"""
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    all_trades = []
    all_plans = []
    all_journal_entries = []
    
    current_date = start_date
    while current_date <= end_date:
        # Skip weekends
        if current_date.weekday() < 5:
            # Determine if trading happened (90% chance on weekdays)
            if random.random() < 0.9:
                session = create_realistic_trading_session(user_id, current_date)
                
                # Adjust win rate
                winning_trades = sum(1 for trade in session['trades'] if trade['outcome'] == 'win')
                total_trades = len(session['trades'])
                current_win_rate = winning_trades / total_trades if total_trades > 0 else 0
                
                # Adjust trades to match target win rate
                if current_win_rate < win_rate and total_trades > 0:
                    # Convert some losing trades to winning
                    losing_indices = [i for i, trade in enumerate(session['trades']) if trade['outcome'] == 'loss']
                    if losing_indices:
                        idx = random.choice(losing_indices)
                        session['trades'][idx] = WinningTradeFactory(
                            user_id=user_id,
                            trade_date=current_date
                        )
                
                all_trades.extend(session['trades'])
                all_plans.append(session['daily_plan'])
                all_journal_entries.append(session['journal_entry'])
        
        current_date += timedelta(days=1)
    
    return {
        'trades': all_trades,
        'daily_plans': all_plans,
        'journal_entries': all_journal_entries,
        'summary': {
            'total_trades': len(all_trades),
            'total_days': len(all_plans),
            'actual_win_rate': sum(1 for trade in all_trades if trade['outcome'] == 'win') / len(all_trades),
            'date_range': (start_date, end_date)
        }
    }


def create_test_user_with_history(
    trading_experience: str = 'intermediate',
    performance_level: str = 'average'
) -> Dict[str, Any]:
    """Create a complete user profile with trading history"""
    
    user = UserFactory(experience_level=trading_experience)
    
    # Adjust performance based on level
    win_rates = {
        'poor': 0.45,
        'below_average': 0.55,
        'average': 0.65,
        'good': 0.75,
        'excellent': 0.85
    }
    
    win_rate = win_rates.get(performance_level, 0.65)
    
    # Create trading history
    history = create_performance_dataset(
        user_id=user['id'],
        days=180,  # 6 months of history
        win_rate=win_rate
    )
    
    # Create alerts
    alerts = [AlertFactory(user_id=user['id']) for _ in range(random.randint(2, 5))]
    
    return {
        'user': user,
        'trading_history': history,
        'alerts': alerts,
        'performance_summary': {
            'total_trades': len(history['trades']),
            'win_rate': history['summary']['actual_win_rate'],
            'total_pnl': sum(trade['profit_loss'] for trade in history['trades']),
            'best_day': max([
                sum(trade['profit_loss'] for trade in history['trades'] if trade['trade_date'] == date)
                for date in set(trade['trade_date'] for trade in history['trades'])
            ]),
            'worst_day': min([
                sum(trade['profit_loss'] for trade in history['trades'] if trade['trade_date'] == date)
                for date in set(trade['trade_date'] for trade in history['trades'])
            ])
        }
    }


# Convenience functions for specific test scenarios

def create_stress_test_data(num_users: int = 100, trades_per_user: int = 1000) -> List[Dict]:
    """Create large dataset for stress testing"""
    users_data = []
    
    for i in range(num_users):
        user = UserFactory()
        trades = [TradeFactory(user_id=user['id']) for _ in range(trades_per_user)]
        users_data.append({
            'user': user,
            'trades': trades
        })
    
    return users_data


def create_edge_case_data() -> Dict[str, List]:
    """Create data for testing edge cases"""
    return {
        'extreme_winners': [WinningTradeFactory(profit_loss=1000 + random.uniform(0, 500)) for _ in range(5)],
        'extreme_losers': [LosingTradeFactory(profit_loss=-500 - random.uniform(0, 300)) for _ in range(5)],
        'micro_positions': [TradeFactory(position_size=0.1) for _ in range(10)],
        'large_positions': [TradeFactory(position_size=50 + random.randint(0, 50)) for _ in range(10)],
        'same_day_multiple': [
            TradeFactory(trade_date=datetime.now().date()) for _ in range(20)
        ],
        'weekend_trades': [
            TradeFactory(trade_date=datetime.now().date() + timedelta(days=6)) for _ in range(5)
        ]
    }


if __name__ == "__main__":
    # Example usage
    print("Creating sample test data...")
    
    # Create a single user with full history
    user_data = create_test_user_with_history('intermediate', 'good')
    print(f"Created user: {user_data['user']['username']}")
    print(f"Trading history: {user_data['performance_summary']['total_trades']} trades")
    print(f"Win rate: {user_data['performance_summary']['win_rate']:.2%}")
    print(f"Total P&L: ${user_data['performance_summary']['total_pnl']:.2f}")
    
    # Create a realistic trading session
    session = create_realistic_trading_session()
    print(f"\nCreated trading session with {len(session['trades'])} trades")
    print(f"Session type: {session['session_type']}")
