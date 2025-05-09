# MCP-Enhanced Trading Journal Application

This is a comprehensive trading journal application inspired by TradePath, designed to help day traders track, analyze, and improve their trading performance. The application leverages Model Context Protocol (MCP) technology to provide advanced capabilities.

## Features

- **Track Trading Performance**: Automatically calculate and visualize key trading metrics
- **Enforce Trading Discipline**: Encourage pre-market planning and post-trade reflection
- **Identify Patterns**: Help discover both profitable setups and problematic behaviors
- **Provide AI Insights**: Leverage artificial intelligence to offer personalized trading advice
- **Support Growth**: Enable continuous improvement through data-driven feedback

## Technology Stack

### Backend
- **Framework**: FastAPI with Python 3.9+
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with PassLib and Python-Jose
- **MCP Integration**: Custom MCP servers for specialized functionality

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Charting**: Recharts, React-Stockcharts
- **State Management**: React Context API
- **API Client**: Axios

## Setup and Installation

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

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

4. Run the backend server:
```bash
cd backend
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
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
│   │   ├── mcp_client.py    # MCP client
│   │   ├── mcp_config.py    # MCP configuration
│   │   └── mcp_server.py    # Base MCP server
│   ├── models/              # SQLAlchemy models
│   └── services/            # Business logic
├── frontend/
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # React components
│       ├── context/         # React Context API
│       ├── pages/           # Page components
│       ├── services/        # API services
│       ├── styles/          # CSS styles
│       └── utils/           # Utility functions
└── docs/                    # Documentation
```

## Development Phases

1. **Foundation & Core Data Structure** - Set up the project structure, database models, and basic CRUD operations
2. **Journal & Trade Entry System** - Implement trade logging and journaling functionality
3. **Dashboard & Statistics** - Create the dashboard and statistical analysis features
4. **TradeSage AI Assistant** - Implement the AI-powered trading coach
5. **Customization & Alerts** - Add user customization options and alert system
6. **TradingView Integration & Cloud** - Integrate with TradingView API and add cloud storage

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
