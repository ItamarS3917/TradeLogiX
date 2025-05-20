import axios from 'axios';

// Sample trade data for demonstration purposes
const sampleTrades = [
  {
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // 2 days ago
    symbol: 'NQ',
    setupType: 'MMSB',
    entryPrice: 19285.50,
    exitPrice: 19312.25,
    positionSize: 1,
    entryTime: '09:45:00',
    exitTime: '10:12:00',
    plannedRiskReward: '1:3',
    outcome: 'win',
    profitLoss: 267.50,
    emotionalState: 'Neutral',
    planAdherence: 'Full',
    notes: 'Strong MMSB setup with clear level. Entered on breakout and exited at target.',
    tags: ['breakout', 'MMSB', 'morning']
  },
  {
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // 1 day ago
    symbol: 'NQ',
    setupType: 'OTE',
    entryPrice: 19402.25,
    exitPrice: 19365.75,
    positionSize: 1,
    entryTime: '11:30:00',
    exitTime: '12:15:00',
    plannedRiskReward: '1:2',
    outcome: 'win',
    profitLoss: 365.00,
    emotionalState: 'Confident',
    planAdherence: 'Partial',
    notes: 'OTE setup at major resistance level. Entered short on rejection, exited at first target.',
    tags: ['reversal', 'OTE', 'midday']
  },
  {
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // 1 day ago
    symbol: 'NQ',
    setupType: 'MMRB',
    entryPrice: 19322.50,
    exitPrice: 19298.75,
    positionSize: 1,
    entryTime: '14:15:00',
    exitTime: '14:45:00',
    plannedRiskReward: '1:2',
    outcome: 'loss',
    profitLoss: -237.50,
    emotionalState: 'Uncertain',
    planAdherence: 'Partial',
    notes: 'MMRB setup but market momentum changed. Stop loss hit before reaching first target.',
    tags: ['breakout', 'MMRB', 'afternoon']
  },
  {
    date: new Date().toISOString().split('T')[0], // Today
    symbol: 'NQ',
    setupType: 'BPR',
    entryPrice: 19345.25,
    exitPrice: 19388.50,
    positionSize: 1,
    entryTime: '10:30:00',
    exitTime: '11:15:00',
    plannedRiskReward: '1:2.5',
    outcome: 'win',
    profitLoss: 432.50,
    emotionalState: 'Calm',
    planAdherence: 'Full',
    notes: 'Clean BPR setup at key support. Entered long on confirmation, exited at second target.',
    tags: ['support', 'BPR', 'morning']
  },
  {
    date: new Date().toISOString().split('T')[0], // Today
    symbol: 'NQ',
    setupType: 'MMRB',
    entryPrice: 19410.25,
    exitPrice: 19410.25,
    positionSize: 1,
    entryTime: '13:45:00',
    exitTime: '14:30:00',
    plannedRiskReward: '1:2',
    outcome: 'breakeven',
    profitLoss: 0,
    emotionalState: 'Frustrated',
    planAdherence: 'Full',
    notes: 'MMRB setup but market chopped around. Exited at breakeven to preserve capital.',
    tags: ['breakout', 'MMRB', 'afternoon', 'choppy']
  }
];

// Sample daily plans for demonstration
const samplePlans = [
  {
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // 2 days ago
    marketBias: 'Bullish',
    keyLevels: '19250, 19300, 19350, 19400',
    goals: 'Focus on long setups near support levels. Target 2:1 R:R minimum.',
    riskParameters: 'Max 2 trades, 1% risk per trade, max daily loss 2%',
    mentalState: 'Focused',
    notes: 'Good pre-market analysis. SPY and QQQ showing strength, looking for longs on NQ.'
  },
  {
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // 1 day ago
    marketBias: 'Neutral to Bearish',
    keyLevels: '19375, 19400, 19425, 19450',
    goals: 'Watch for reversal setups at resistance. Be patient for quality setups.',
    riskParameters: 'Max 2 trades, 1% risk per trade, max daily loss 2%',
    mentalState: 'Cautious',
    notes: 'Market approaching resistance zone. Watching for rejection or breakout confirmation.'
  },
  {
    date: new Date().toISOString().split('T')[0], // Today
    marketBias: 'Bullish',
    keyLevels: '19325, 19350, 19400, 19450',
    goals: 'Look for continuation patterns. Wait for pullbacks to value.',
    riskParameters: 'Max 2 trades, 1% risk per trade, max daily loss 2%',
    mentalState: 'Confident',
    notes: 'Strong overnight session. Planning to trade with trend using pullback entries.'
  }
];

/**
 * Utility to add sample data to the app for demonstration purposes
 */
const SampleDataManager = {
  /**
   * Add sample trades to the database
   * @returns {Promise} Promise resolving to the added trades
   */
  addSampleTrades: async () => {
    try {
      const promises = sampleTrades.map(trade => 
        axios.post('/api/trades', trade)
      );
      
      const results = await Promise.all(promises);
      console.log('Sample trades added successfully', results);
      return results.map(r => r.data);
    } catch (error) {
      console.error('Error adding sample trades', error);
      throw error;
    }
  },
  
  /**
   * Add sample daily plans to the database
   * @returns {Promise} Promise resolving to the added plans
   */
  addSamplePlans: async () => {
    try {
      const promises = samplePlans.map(plan => 
        axios.post('/api/planning', plan)
      );
      
      const results = await Promise.all(promises);
      console.log('Sample plans added successfully', results);
      return results.map(r => r.data);
    } catch (error) {
      console.error('Error adding sample plans', error);
      throw error;
    }
  },
  
  /**
   * Add all sample data (trades and plans)
   * @returns {Promise} Promise resolving when all data is added
   */
  addAllSampleData: async () => {
    try {
      const tradeResults = await SampleDataManager.addSampleTrades();
      const planResults = await SampleDataManager.addSamplePlans();
      
      return {
        trades: tradeResults,
        plans: planResults
      };
    } catch (error) {
      console.error('Error adding all sample data', error);
      throw error;
    }
  },
  
  /**
   * Check if sample data already exists
   * @returns {Promise<boolean>} Promise resolving to true if sample data exists
   */
  checkSampleDataExists: async () => {
    try {
      // Check if any trades exist
      const tradesResponse = await axios.get('/api/trades?limit=1');
      const hasTrades = tradesResponse.data.length > 0;
      
      // Check if any plans exist
      const plansResponse = await axios.get('/api/planning?limit=1');
      const hasPlans = plansResponse.data.length > 0;
      
      return hasTrades && hasPlans;
    } catch (error) {
      console.error('Error checking for sample data', error);
      return false;
    }
  }
};

export default SampleDataManager;