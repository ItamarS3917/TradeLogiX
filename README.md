# MCP-Enhanced Trading Journal Application

A comprehensive trading journal application inspired by TradePath, designed to help day traders track, analyze, and improve their trading performance through detailed journaling, statistics, and AI-powered insights. The application leverages Model Context Protocol (MCP) technology to accelerate development, provide advanced capabilities, and ensure future extensibility.

## Core Objectives

- **Track Trading Performance**: Automatically calculate and visualize key trading metrics
- **Enforce Trading Discipline**: Encourage pre-market planning and post-trade reflection
- **Identify Patterns**: Help discover both profitable setups and problematic behaviors
- **Provide AI Insights**: Leverage artificial intelligence to offer personalized trading advice
- **Support Growth**: Enable continuous improvement through data-driven feedback
- **Accelerate Development**: Use MCP technology to speed up implementation and enhance capabilities
- **Create Learning Opportunities**: Implement key components manually to develop skills

## Features

### Personal Dashboard
- Real-time performance snapshot (win rate, P&L, etc.)
- Recent trade summary
- Trading streak indicators
- Performance comparisons (day/week/month)
- Goal tracking
- Alert notifications

### Pre-Market Planning ("Log Your Day")
- Market bias input
- Key levels identification
- Daily goals setting
- Trading plan articulation
- Mental state assessment
- Risk management parameters

### Trade Journal
- Manual trade entry (with future API integration potential)
- Trade categorization by setup type
- Comprehensive trade data capture
- Trade tagging system
- Search and filter capabilities

### Statistics Page
- Win rate by setup type
- Profitability by time of day
- Risk:Reward ratio analysis
- Average win vs. average loss
- Consecutive win/loss streaks
- Performance by market conditions
- Emotional correlation analysis
- Plan adherence correlation
- Custom metric tracking

### TradeSage AI Assistant
- Pattern recognition in profitable vs. unprofitable trades
- Emotional analysis and management suggestions
- Trading plan adherence feedback
- Personalized improvement recommendations
- Trading psychology insights
- Natural language Q&A about trading performance

### Alert System
- Performance trend alerts
- Trading rule violation warnings
- Goal achievement notifications
- Risk management alerts
- Pattern detection notifications
- Custom alert creation

### Customization Options
- Color theme customization
- Dashboard widget arrangement
- Custom data fields
- Chart and visualization preferences
- Notification preferences
- Custom tags and categories

## Technology Stack

### Backend
- **Framework**: FastAPI with Python 3.9+
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with PassLib and Python-Jose
- **MCP Integration**: 
  - Custom MCP servers for specialized functionality
  - AI integration via Anthropic's Claude API
  - Data processing and analytics tools

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Charting**: Recharts, React-Stockcharts
- **State Management**: React Context API
- **API Client**: Axios

## Setup and Installation

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### Using Docker (Recommended)
1. Clone the repository:
```bash
git clone https://github.com/yourusername/tradingjournalapp.git
cd tradingjournalapp
```

2. Copy the environment file and add your Anthropic API key:
```bash
cp .env.example .env
# Edit .env to add your ANTHROPIC_API_KEY
```

3. Build and run with Docker Compose:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

### Manual Setup

#### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tradingjournalapp.git
cd tradingjournalapp
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env to add your ANTHROPIC_API_KEY
```

5. Run the backend server:
```bash
cd backend
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000`.

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend-new
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
tradingjournalapp/
├── backend/
│   ├── api/                 # FastAPI application
│   │   ├── routes/          # API routes
│   │   └── main.py          # Main application entry point
│   ├── db/                  # Database configuration
│   │   ├── database.py      # Database connection
│   │   ├── repository.py    # Data repository
│   │   └── schemas.py       # Pydantic schemas
│   ├── mcp/                 # MCP configuration
│   │   ├── servers/         # MCP servers
│   │   ├── tools/           # MCP tools
│   │   ├── mcp_client.py    # MCP client
│   │   ├── mcp_config.py    # MCP configuration
│   │   └── mcp_server.py    # Base MCP server
│   ├── models/              # SQLAlchemy models
│   └── services/            # Business logic
├── frontend-new/            # React frontend with Vite
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # React components
│       ├── contexts/        # React Context providers
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── utils/           # Utility functions
└── docs/                    # Documentation
```

## Development Status

The project is currently in active development following these phases:

1. **Foundation & Core Data Structure** - ✅ Completed
   - Basic project structure established
   - Database models defined
   - Core MCP architecture implemented
   
2. **Journal & Trade Entry System** - ✅ Completed
   - Trade entry forms
   - Journal entry system
   - Tagging functionality
   
3. **Dashboard & Statistics** - 🔄 In Progress
   - Dashboard layout implemented
   - Basic statistics visualization
   - Working on advanced MCP-powered analytics
   
4. **TradeSage AI Assistant** - 🔄 In Progress
   - Basic Claude AI integration implemented
   - AI-powered trading insights
   - Continuing development of specialized MCP prompts
   
5. **Customization & Alerts** - 🔜 Planned
   - Theme customization
   - Alert system
   - User preference system
   
6. **TradingView Integration & Cloud** - 🔜 Planned
   - TradingView API integration
   - Cloud storage functionality
   - User authentication

## MCP Implementation

This project uses Model Context Protocol (MCP) to enhance its capabilities. For detailed information on MCP implementation, see:

- [MCP Implementation Guide](MCP_IMPLEMENTATION.md)
- [TradeSage MCP Implementation](MCP_TRADESAGE_IMPLEMENTATION.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by TradePath trading journal
- MCP technology enables advanced AI capabilities
- MMXM and ICT Concepts form the basis of trading setups
- Anthropic's Claude API powers the AI features