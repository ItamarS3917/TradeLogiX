"""
Quick test to validate backtesting module imports
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

def test_imports():
    """Test that all key imports work correctly."""
    print("Testing backtesting module imports...")
    
    try:
        # Test main module imports
        from backtesting import BacktestEngine, TradingViewProcessor
        print("✅ Main engine imports successful")
        
        # Test strategy imports
        from backtesting.strategies import ICTStrategy, BaseStrategy
        print("✅ Strategy imports successful")
        
        # Test indicator imports  
        from backtesting.indicators import ICTAnalyzer
        print("✅ Indicator imports successful")
        
        # Test utility imports
        from backtesting.utils import TimeframeConverter
        print("✅ Utility imports successful")
        
        # Test basic instantiation
        processor = TradingViewProcessor()
        converter = TimeframeConverter()
        
        print("✅ Basic object creation successful")
        
        # Test strategy creation
        params = {
            'initial_capital': 10000,
            'risk_per_trade': 0.02,
            'required_timeframes': ['5T', '15T']
        }
        strategy = ICTStrategy(params)
        
        print("✅ ICT Strategy creation successful")
        
        print("\n🎉 All imports and basic tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    if success:
        print("\n✨ Module is ready for use!")
    else:
        print("\n⚠️  Module has issues that need to be resolved.")
