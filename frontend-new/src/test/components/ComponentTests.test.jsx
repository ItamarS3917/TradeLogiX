// Frontend component tests for the Trading Journal application
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock components - adjust imports based on your actual component structure
import Dashboard from '../../pages/Dashboard';
import TradeForm from '../../components/TradeForm';
import PerformanceCard from '../../components/PerformanceCard';
import StatisticsChart from '../../components/StatisticsChart';
import TradeSageChat from '../../components/TradeSageChat';

// Mock API services
import * as apiService from '../../services/apiService';
import * as mcpService from '../../services/mcpService';

// Mock data
const mockTradeData = {
  id: 1,
  symbol: 'NQ',
  setupType: 'MMXM_Breaker',
  entryPrice: 15000,
  exitPrice: 15025,
  positionSize: 1,
  outcome: 'win',
  profitLoss: 25,
  entryTime: '2024-01-01T09:30:00',
  exitTime: '2024-01-01T10:00:00',
  notes: 'Clean breakout setup'
};

const mockDashboardData = {
  performanceMetrics: {
    totalTrades: 100,
    winRate: 0.65,
    profitLoss: 2500,
    avgWin: 125,
    avgLoss: -75
  },
  recentTrades: [mockTradeData],
  chartData: {
    equity: [
      { date: '2024-01-01', value: 10000 },
      { date: '2024-01-02', value: 10025 },
      { date: '2024-01-03', value: 10050 }
    ]
  }
};

// Helper function to render components with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock API services
vi.mock('../../services/apiService', () => ({
  getDashboardData: vi.fn(),
  createTrade: vi.fn(),
  updateTrade: vi.fn(),
  deleteTrade: vi.fn(),
  getStatistics: vi.fn(),
  getTrades: vi.fn()
}));

vi.mock('../../services/mcpService', () => ({
  analyzeTrade: vi.fn(),
  getTradingAdvice: vi.fn(),
  calculateMetrics: vi.fn(),
  checkAlerts: vi.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.getDashboardData.mockResolvedValue(mockDashboardData);
  });

  it('renders dashboard with performance metrics', async () => {
    renderWithRouter(<Dashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Trades')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('65.0%')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    apiService.getDashboardData.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  it('updates when timeframe is changed', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('1W')).toBeInTheDocument();
    });
    
    // Click on 1M timeframe
    const oneMonthButton = screen.getByText('1M');
    fireEvent.click(oneMonthButton);
    
    await waitFor(() => {
      expect(apiService.getDashboardData).toHaveBeenCalledWith({ timeframe: '1M' });
    });
  });

  it('renders quick actions bar', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Add Trade')).toBeInTheDocument();
      expect(screen.getByText(/market status/i)).toBeInTheDocument();
    });
  });
});

describe('TradeForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    apiService.createTrade.mockResolvedValue({ id: 1, ...mockTradeData });
  });

  it('renders all form fields', () => {
    render(
      <TradeForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/setup type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exit price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/outcome/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TradeForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/symbol is required/i)).toBeInTheDocument();
      expect(screen.getByText(/setup type is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TradeForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill out the form
    await user.type(screen.getByLabelText(/symbol/i), 'NQ');
    await user.selectOptions(screen.getByLabelText(/setup type/i), 'MMXM_Breaker');
    await user.type(screen.getByLabelText(/entry price/i), '15000');
    await user.type(screen.getByLabelText(/exit price/i), '15025');
    await user.type(screen.getByLabelText(/position size/i), '1');
    await user.selectOptions(screen.getByLabelText(/outcome/i), 'win');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiService.createTrade).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: 'NQ',
          setupType: 'MMXM_Breaker',
          entryPrice: 15000,
          exitPrice: 15025,
          positionSize: 1,
          outcome: 'win'
        })
      );
    });
  });

  it('calculates profit/loss automatically', async () => {
    const user = userEvent.setup();
    
    render(
      <TradeForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill entry and exit prices
    await user.type(screen.getByLabelText(/entry price/i), '15000');
    await user.type(screen.getByLabelText(/exit price/i), '15025');
    await user.type(screen.getByLabelText(/position size/i), '1');

    // Profit/Loss should be calculated automatically
    await waitFor(() => {
      const profitLossField = screen.getByDisplayValue('25');
      expect(profitLossField).toBeInTheDocument();
    });
  });

  it('integrates with MCP trade analysis', async () => {
    const user = userEvent.setup();
    mcpService.analyzeTrade.mockResolvedValue({
      setupQuality: 'excellent',
      executionRating: 9,
      lessonsLearned: ['Perfect entry timing']
    });
    
    render(
      <TradeForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        enableMCPAnalysis={true}
      />
    );

    // Fill out form and enable analysis
    await user.type(screen.getByLabelText(/symbol/i), 'NQ');
    await user.selectOptions(screen.getByLabelText(/setup type/i), 'MMXM_Breaker');
    await user.type(screen.getByLabelText(/entry price/i), '15000');
    await user.type(screen.getByLabelText(/exit price/i), '15025');

    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /analyze trade/i });
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(mcpService.analyzeTrade).toHaveBeenCalled();
      expect(screen.getByText(/setup quality: excellent/i)).toBeInTheDocument();
    });
  });
});

describe('PerformanceCard Component', () => {
  const mockMetric = {
    title: 'Win Rate',
    value: '65.0%',
    change: '+5.2%',
    changeType: 'positive',
    sparklineData: [60, 62, 65, 63, 65]
  };

  it('renders metric information correctly', () => {
    render(<PerformanceCard metric={mockMetric} />);

    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('65.0%')).toBeInTheDocument();
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
  });

  it('applies correct styling for positive change', () => {
    render(<PerformanceCard metric={mockMetric} />);

    const changeElement = screen.getByText('+5.2%');
    expect(changeElement).toHaveClass('text-green-600'); // Adjust class name as needed
  });

  it('applies correct styling for negative change', () => {
    const negativeMetric = {
      ...mockMetric,
      change: '-3.1%',
      changeType: 'negative'
    };

    render(<PerformanceCard metric={negativeMetric} />);

    const changeElement = screen.getByText('-3.1%');
    expect(changeElement).toHaveClass('text-red-600'); // Adjust class name as needed
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(<PerformanceCard metric={mockMetric} onClick={mockOnClick} />);

    const card = screen.getByRole('button'); // Assuming card is clickable
    await user.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockMetric);
  });

  it('renders sparkline chart', () => {
    render(<PerformanceCard metric={mockMetric} />);

    // Check if sparkline container exists
    const sparklineContainer = screen.getByTestId('sparkline-container');
    expect(sparklineContainer).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    
    render(<PerformanceCard metric={mockMetric} />);

    const infoIcon = screen.getByTestId('info-icon');
    await user.hover(infoIcon);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});

describe('StatisticsChart Component', () => {
  const mockChartData = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Equity Curve',
        data: [10000, 10100, 10050, 10200, 10300],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  it('renders chart container', () => {
    render(<StatisticsChart data={mockChartData} />);

    const chartContainer = screen.getByTestId('statistics-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<StatisticsChart data={null} />);

    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('responds to chart type changes', async () => {
    const user = userEvent.setup();
    
    render(<StatisticsChart data={mockChartData} allowTypeChange={true} />);

    const chartTypeSelector = screen.getByRole('combobox', { name: /chart type/i });
    await user.selectOptions(chartTypeSelector, 'bar');

    // Chart should re-render with new type
    await waitFor(() => {
      expect(screen.getByTestId('statistics-chart')).toHaveAttribute('data-chart-type', 'bar');
    });
  });

  it('exports chart data', async () => {
    const user = userEvent.setup();
    const mockExport = vi.fn();
    
    render(<StatisticsChart data={mockChartData} onExport={mockExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    expect(mockExport).toHaveBeenCalledWith(mockChartData);
  });
});

describe('TradeSageChat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mcpService.getTradingAdvice.mockResolvedValue({
      advice: 'Focus on your best performing setups',
      confidence: 0.8,
      suggestions: ['Review morning trading performance', 'Consider position sizing']
    });
  });

  it('renders chat interface', () => {
    render(<TradeSageChat />);

    expect(screen.getByPlaceholderText(/ask tradesage/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends message and receives response', async () => {
    const user = userEvent.setup();
    
    render(<TradeSageChat />);

    const input = screen.getByPlaceholderText(/ask tradesage/i);
    await user.type(input, 'How can I improve my trading?');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mcpService.getTradingAdvice).toHaveBeenCalledWith({
        question: 'How can I improve my trading?',
        context: expect.any(Object)
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/focus on your best performing setups/i)).toBeInTheDocument();
    });
  });

  it('handles typing indicator', async () => {
    const user = userEvent.setup();
    
    render(<TradeSageChat />);

    const input = screen.getByPlaceholderText(/ask tradesage/i);
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Should show typing indicator
    expect(screen.getByText(/tradesage is typing/i)).toBeInTheDocument();
  });

  it('displays error message for failed requests', async () => {
    const user = userEvent.setup();
    mcpService.getTradingAdvice.mockRejectedValue(new Error('AI service unavailable'));
    
    render(<TradeSageChat />);

    const input = screen.getByPlaceholderText(/ask tradesage/i);
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/sorry, i'm having trouble/i)).toBeInTheDocument();
    });
  });

  it('maintains conversation history', async () => {
    const user = userEvent.setup();
    
    render(<TradeSageChat />);

    // Send first message
    const input = screen.getByPlaceholderText(/ask tradesage/i);
    await user.type(input, 'First question');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
    });

    // Send second message
    await user.clear(input);
    await user.type(input, 'Second question');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
      expect(screen.getByText('Second question')).toBeInTheDocument();
    });
  });

  it('formats AI responses with suggestions', async () => {
    const user = userEvent.setup();
    
    render(<TradeSageChat />);

    const input = screen.getByPlaceholderText(/ask tradesage/i);
    await user.type(input, 'Give me suggestions');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/review morning trading performance/i)).toBeInTheDocument();
      expect(screen.getByText(/consider position sizing/i)).toBeInTheDocument();
    });
  });
});

// Integration Tests
describe('Component Integration', () => {
  it('dashboard updates when trade is added', async () => {
    const user = userEvent.setup();
    
    // Mock dashboard update after trade creation
    apiService.createTrade.mockResolvedValue(mockTradeData);
    apiService.getDashboardData
      .mockResolvedValueOnce(mockDashboardData)
      .mockResolvedValueOnce({
        ...mockDashboardData,
        performanceMetrics: {
          ...mockDashboardData.performanceMetrics,
          totalTrades: 101
        }
      });

    // Render dashboard with trade form
    renderWithRouter(
      <div>
        <Dashboard />
        <TradeForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      </div>
    );

    // Wait for initial dashboard load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total trades
    });

    // Add a trade
    await user.type(screen.getByLabelText(/symbol/i), 'NQ');
    await user.selectOptions(screen.getByLabelText(/setup type/i), 'MMXM_Breaker');
    await user.type(screen.getByLabelText(/entry price/i), '15000');
    await user.type(screen.getByLabelText(/exit price/i), '15025');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Dashboard should update
    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument(); // Updated total trades
    });
  });
});

// Accessibility Tests
describe('Accessibility', () => {
  it('dashboard has proper ARIA labels', () => {
    renderWithRouter(<Dashboard />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('forms have proper labels and descriptions', () => {
    render(<TradeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const symbolInput = screen.getByLabelText(/symbol/i);
    expect(symbolInput).toHaveAttribute('aria-required', 'true');

    const setupTypeSelect = screen.getByLabelText(/setup type/i);
    expect(setupTypeSelect).toHaveAttribute('aria-required', 'true');
  });

  it('buttons have accessible names', () => {
    render(<TradeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('button', { name: /submit trade/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});

// Performance Tests
describe('Performance', () => {
  it('dashboard renders within performance budget', async () => {
    const startTime = performance.now();
    
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/total trades/i)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 1000ms
    expect(renderTime).toBeLessThan(1000);
  });

  it('handles large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockTradeData,
      id: i,
      date: new Date(2024, 0, i % 365).toISOString()
    }));

    apiService.getTrades.mockResolvedValue(largeDataset);

    const startTime = performance.now();
    
    render(<StatisticsChart data={{ datasets: [{ data: largeDataset }] }} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle large datasets within reasonable time
    expect(renderTime).toBeLessThan(2000);
  });
});
