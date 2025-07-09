// Mock Service Worker (MSW) configuration for frontend testing
// This file sets up API mocking for unit and integration tests

import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock data generators
const generateMockTrade = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  symbol: 'NQ',
  setupType: 'MMXM_Breaker',
  entryPrice: 15000 + Math.random() * 100,
  exitPrice: 15025 + Math.random() * 100,
  positionSize: Math.floor(Math.random() * 3) + 1,
  outcome: Math.random() > 0.6 ? 'win' : 'loss',
  profitLoss: (Math.random() - 0.5) * 100,
  entryTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  exitTime: new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000).toISOString(),
  emotionalState: ['confident', 'nervous', 'calm', 'excited'][Math.floor(Math.random() * 4)],
  planAdherence: Math.floor(Math.random() * 10) + 1,
  notes: 'Mock trade for testing',
  tags: ['test', 'mock'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

const generateMockStatistics = () => ({
  totalTrades: 150,
  winningTrades: 98,
  losingTrades: 52,
  winRate: 0.653,
  profitLoss: 2750.50,
  avgWin: 125.25,
  avgLoss: -75.80,
  largestWin: 450.00,
  largestLoss: -200.00,
  consecutiveWins: 7,
  consecutiveLosses: 3,
  profitFactor: 2.15,
  sharpeRatio: 1.35,
  maxDrawdown: -350.00,
  totalCommissions: 300.00,
  riskRewardRatio: 1.65,
  avgTradeDuration: 45, // minutes
  setupBreakdown: {
    'MMXM_Breaker': { count: 45, winRate: 0.73, avgPnL: 85.5 },
    'ICT_FVG': { count: 35, winRate: 0.60, avgPnL: 45.2 },
    'MMXM_Mitigation': { count: 30, winRate: 0.67, avgPnL: 67.8 },
    'ICT_OB': { count: 25, winRate: 0.56, avgPnL: 32.1 },
    'Other': { count: 15, winRate: 0.47, avgPnL: 15.3 }
  },
  timeAnalysis: {
    '09:30-10:30': { trades: 45, winRate: 0.71, avgPnL: 78.5 },
    '10:30-11:30': { trades: 35, winRate: 0.66, avgPnL: 56.2 },
    '11:30-12:30': { trades: 25, winRate: 0.60, avgPnL: 45.1 },
    '12:30-13:30': { trades: 20, winRate: 0.55, avgPnL: 32.8 },
    '13:30-14:30': { trades: 15, winRate: 0.47, avgPnL: 25.4 },
    '14:30-15:30': { trades: 10, winRate: 0.50, avgPnL: 28.9 }
  },
  monthlyPerformance: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toISOString().slice(0, 7),
    trades: Math.floor(Math.random() * 20) + 10,
    winRate: 0.5 + Math.random() * 0.3,
    profitLoss: (Math.random() - 0.3) * 500
  }))
});

const generateMockDashboardData = () => ({
  performanceMetrics: {
    totalTrades: 150,
    winRate: 0.653,
    profitLoss: 2750.50,
    avgWin: 125.25,
    todayTrades: 3,
    todayPnL: 75.50,
    weeklyPnL: 285.75,
    monthlyPnL: 1250.00
  },
  recentTrades: Array.from({ length: 5 }, () => generateMockTrade()),
  equityCurve: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    value: 10000 + Math.random() * 3000 - 1500 + i * 50
  })),
  alerts: [
    {
      id: 1,
      type: 'warning',
      message: 'Daily loss limit approaching',
      timestamp: new Date().toISOString(),
      isRead: false
    },
    {
      id: 2,
      type: 'info',
      message: 'Weekly goal achieved',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true
    }
  ],
  marketStatus: {
    isOpen: true,
    nextSession: 'Regular Trading Hours',
    timeUntilOpen: null,
    timeUntilClose: '4:30:00'
  },
  upcomingEvents: [
    {
      id: 1,
      title: 'FOMC Meeting',
      time: '14:00',
      importance: 'high',
      description: 'Federal Reserve interest rate decision'
    },
    {
      id: 2,
      title: 'NFP Release',
      time: '08:30',
      importance: 'medium',
      description: 'Non-farm payrolls report'
    }
  ]
});

// API handlers
export const handlers = [
  // Health check
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      })
    );
  }),

  // Dashboard endpoints
  rest.get('/api/dashboard', (req, res, ctx) => {
    const timeframe = req.url.searchParams.get('timeframe') || '1M';
    return res(
      ctx.status(200),
      ctx.json(generateMockDashboardData())
    );
  }),

  // Trade endpoints
  rest.get('/api/trades', (req, res, ctx) => {
    const limit = parseInt(req.url.searchParams.get('limit') || '50');
    const search = req.url.searchParams.get('search');
    const setupType = req.url.searchParams.get('setupType');
    
    let trades = Array.from({ length: Math.min(limit, 100) }, () => generateMockTrade());
    
    // Apply filters
    if (search) {
      trades = trades.filter(trade => 
        trade.notes.toLowerCase().includes(search.toLowerCase()) ||
        trade.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (setupType) {
      trades = trades.filter(trade => trade.setupType === setupType);
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        trades,
        total: trades.length,
        page: 1,
        limit
      })
    );
  }),

  rest.get('/api/trades/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json(generateMockTrade({ id: parseInt(id) }))
    );
  }),

  rest.post('/api/trades', (req, res, ctx) => {
    const newTrade = generateMockTrade({ 
      id: Math.floor(Math.random() * 10000),
      ...req.body 
    });
    
    return res(
      ctx.status(201),
      ctx.json(newTrade)
    );
  }),

  rest.put('/api/trades/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updatedTrade = generateMockTrade({ 
      id: parseInt(id),
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    
    return res(
      ctx.status(200),
      ctx.json(updatedTrade)
    );
  }),

  rest.delete('/api/trades/:id', (req, res, ctx) => {
    return res(
      ctx.status(204)
    );
  }),

  // Statistics endpoints
  rest.get('/api/statistics', (req, res, ctx) => {
    const timeframe = req.url.searchParams.get('timeframe') || '1M';
    const startDate = req.url.searchParams.get('startDate');
    const endDate = req.url.searchParams.get('endDate');
    
    return res(
      ctx.status(200),
      ctx.json(generateMockStatistics())
    );
  }),

  // TradeSage AI endpoints
  rest.post('/api/tradesage/advice', (req, res, ctx) => {
    const advice = {
      advice: 'Based on your recent trading performance, you\'re showing good discipline with your planned setups. Consider focusing on position sizing to maximize your edge during high-probability setups.',
      confidence: 0.85,
      suggestions: [
        'Review your position sizing strategy for different setup types',
        'Consider scaling into positions on your highest conviction trades',
        'Track execution timing metrics to identify optimal entry points',
        'Focus on MMXM setups during the first hour of trading'
      ]
    };
    
    return res(
      ctx.delay(1500), // Simulate AI processing time
      ctx.status(200),
      ctx.json(advice)
    );
  })
];

// Create the server instance
export const server = setupServer(...handlers);

// Test utilities
export const mockApiError = (endpoint, status = 500, message = 'Server error') => {
  server.use(
    rest.get(endpoint, (req, res, ctx) => {
      return res(
        ctx.status(status),
        ctx.json({ error: message })
      );
    })
  );
};

export const resetHandlers = () => {
  server.resetHandlers(...handlers);
};

export default server;
