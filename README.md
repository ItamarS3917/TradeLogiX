# Trading Journal App

A comprehensive trading journal application for day traders to track, analyze, and improve their trading performance.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- (Optional) Python 3.9+ and Node.js 16+ for manual development

### Start the Application
```bash
# Navigate to project directory
cd /Users/itamarmacbook/Desktop/tradingjournalapp

# Start with Docker (Recommended)
docker-compose up --build

# Access the app at: http://localhost:3000
```

**That's it!** The app will be running at http://localhost:3000

### Alternative Startup Methods
- **Interactive Script**: `./start_app.sh` (choose Docker or manual mode)
- **Development Script**: `./start_dev.sh` (manual development mode)
- **See detailed instructions**: [STARTUP_INSTRUCTIONS.md](STARTUP_INSTRUCTIONS.md)

## 📋 First-Time Setup

### 1. Environment Configuration
```bash
# Backend environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Frontend environment variables (if using Firebase)
cd frontend-new
cp .env.example .env
# Edit .env with Firebase configuration
```

### 2. Run Setup Verification (Optional)
```bash
./setup.sh
```

## 🎯 Core Features

### ✅ **WORKING FEATURES** (9/11 Complete)
- **📊 Enhanced Dashboard**: Real-time performance overview with widget customization
- **📝 Trade Journal**: Comprehensive trade logging with Firebase integration
- **📈 Statistics & Analytics**: Detailed performance metrics and visualizations
- **🔬 Strategy Backtesting**: Historical strategy testing and optimization
- **🤖 TradeSage AI**: AI-powered trading insights and pattern recognition
- **⚡ Daily Planning**: Pre-market planning and goal setting
- **☁️ Cloud Sync**: Firebase data synchronization and backup
- **📊 TradingView Integration**: Chart integration and trade marking
- **⚙️ Settings**: Theme customization and account management

### ⚠️ **PENDING FIXES** (Minor Issues)
- **🏆 Leaderboards**: Navigation present but route disabled
- **🔄 Data Migration**: Referenced but not implemented

**Overall Status**: 82% functional - ready for production with minor fixes

## 🏗️ Technology Stack

- **Backend**: Python FastAPI + SQLite/Firebase
- **Frontend**: React + Vite + Tailwind CSS
- **AI**: Anthropic Claude API via MCP Protocol
- **Charts**: Recharts + React-Stockcharts
- **Deployment**: Docker + Docker Compose

## 📱 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main trading journal application |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |

## 🛠️ Development

### Project Structure
```
tradingjournalapp/
├── backend/              # Python FastAPI backend
├── frontend-new/         # React frontend
├── docker-compose.yml    # Docker configuration
├── STARTUP_INSTRUCTIONS.md  # Detailed startup guide
└── QUICK_START.md        # Quick reference
```

### Common Commands
```bash
# Start application
docker-compose up --build

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build
```

## 🆘 Troubleshooting

### Port Conflicts
```bash
# Kill processes on ports 3000/8000
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

### Docker Issues
```bash
# Clean rebuild
docker-compose down --volumes
docker-compose up --build
```

### Need Help?
- See [STATUS.md](STATUS.md) for current feature status and known issues
- See [STARTUP_INSTRUCTIONS.md](STARTUP_INSTRUCTIONS.md) for detailed setup
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Check [QUICK_START.md](QUICK_START.md) for quick reference

## 📄 License

MIT License - see LICENSE file for details.

---

**Quick Start Summary**: `cd tradingjournalapp && docker-compose up --build` → http://localhost:3000
