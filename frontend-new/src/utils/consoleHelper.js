// Browser Console Helper for Real Data Management
// Open browser console and use these commands to manage your real data

// Add these functions to the browser console for easy management
window.tradingJournalUtils = {
  
  // Check current data mode status
  checkDataMode: () => {
    console.log('📊 Trading Journal Data Mode Status:');
    console.log('Data Source:', localStorage.getItem('data_source_mode'));
    console.log('Real Data Only:', localStorage.getItem('use_real_data_only'));
    console.log('Sample Data Disabled:', window.sampleDataDisabled);
    console.log('Current Mode:', window.dataSourceMode);
    
    // Check for any sample data indicators
    const sampleKeys = ['use_sample_data', 'enable_mock_data', 'sample_data_added', 'demo_mode'];
    const foundSample = sampleKeys.filter(key => localStorage.getItem(key));
    
    if (foundSample.length > 0) {
      console.warn('⚠️ Found sample data indicators:', foundSample);
    } else {
      console.log('✅ No sample data indicators found');
    }
    
    return {
      dataSource: localStorage.getItem('data_source_mode'),
      realDataOnly: localStorage.getItem('use_real_data_only') === 'true',
      sampleDataFound: foundSample.length > 0
    };
  },
  
  // Force real data mode
  forceRealData: () => {
    console.log('🔒 Forcing real data mode...');
    localStorage.setItem('data_source_mode', 'firebase');
    localStorage.setItem('use_real_data_only', 'true');
    
    // Clear sample data flags
    ['use_sample_data', 'enable_mock_data', 'sample_data_added', 'demo_mode'].forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Real data mode activated');
    console.log('🔄 Reloading page...');
    window.location.reload();
  },
  
  // Clear all data (nuclear option)
  clearAllData: () => {
    if (confirm('⚠️ This will clear ALL data. Are you sure?')) {
      console.log('🧹 Clearing all data...');
      localStorage.clear();
      console.log('🔄 Reloading page...');
      window.location.reload();
    }
  },
  
  // Add a real trade (template)
  addRealTradeTemplate: () => {
    console.log('📝 Real Trade Template:');
    console.log(`
const realTrade = {
  symbol: 'NQ',           // Your trading symbol
  setupType: 'ICT_BPR',   // Your actual setup
  entryPrice: 0,          // Your actual entry price
  exitPrice: 0,           // Your actual exit price
  positionSize: 1,        // Your position size
  entryTime: new Date(),  // Entry timestamp
  exitTime: new Date(),   // Exit timestamp
  plannedRiskReward: 0,   // Your planned R:R
  actualRiskReward: 0,    // Actual R:R
  outcome: 'win',         // 'win', 'loss', or 'breakeven'
  profitLoss: 0,          // Your actual P&L
  emotionalState: 'calm', // Your emotional state
  planAdherence: 'full',  // How well you followed your plan
  notes: 'Your trade notes here',
  tags: ['your', 'tags', 'here']
};

// Use tradeService to add it:
// await window.firebaseService.createTrade(realTrade);
    `);
  },
  
  // Show help
  help: () => {
    console.log(`
🎯 Trading Journal Real Data Utils

Available commands:
• tradingJournalUtils.checkDataMode() - Check current data mode
• tradingJournalUtils.forceRealData() - Force real data mode
• tradingJournalUtils.clearAllData() - Clear all data (careful!)
• tradingJournalUtils.addRealTradeTemplate() - Show real trade template
• tradingJournalUtils.help() - Show this help

Quick Start for Real Trading:
1. Run: tradingJournalUtils.checkDataMode()
2. Ensure you're in Firebase mode
3. Start adding your real trades through the UI
4. Use tradingJournalUtils.addRealTradeTemplate() for reference

🚫 No sample data will be created
📊 All data stored in Firebase
    `);
  }
};

// Auto-run on page load
if (typeof window !== 'undefined') {
  window.tradingJournalUtils.help();
  
  // Set global flag
  window.REAL_DATA_MODE = true;
  window.SAMPLE_DATA_DISABLED = true;
  
  console.log('🎯 Trading Journal Real Data Utils loaded');
  console.log('Type "tradingJournalUtils.help()" for commands');
}
