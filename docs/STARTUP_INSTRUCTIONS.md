# Trading Journal App - Clear Startup Instructions

## Current Setup Overview (December 2024)
- **Backend**: Python FastAPI (runs on port 8000)
- **Frontend**: React with Vite (runs on port 3000) 
- **Database**: Firebase Firestore (Cloud) - Real data mode
- **Authentication**: Firebase Auth (Email/Password)
- **Status**: 9/11 features working (82% functional)
- **Recent Fixes**: Backtesting restored, duplicate dashboard removed

## ✅ Recommended Method: Docker Compose (Simplest)

### Prerequisites
- Docker and Docker Compose installed
- Copy environment files (see Environment Setup below)

### Quick Start
```bash
# 1. Navigate to project directory
cd /Users/itamarmacbook/Desktop/tradingjournalapp

# 2. Start both backend and frontend with Docker
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Stop the application
```bash
# Press Ctrl+C in the terminal, then run:
docker-compose down
```

## 🔧 Alternative Method: Manual Development Setup

### Prerequisites
- Python 3.9+ installed
- Node.js 16+ installed
- Virtual environment activated

### Backend Setup (Terminal 1)
```bash
# Navigate to project directory
cd /Users/itamarmacbook/Desktop/tradingjournalapp

# Activate virtual environment
source venv/bin/activate

# Start backend server
python -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (Terminal 2)
```bash
# Navigate to frontend directory
cd /Users/itamarmacbook/Desktop/tradingjournalapp/frontend-new

# Start frontend development server
npm start
```

## 🚀 Convenience Script (Manual Method)

### Use the provided startup script
```bash
# Navigate to project directory
cd /Users/itamarmacbook/Desktop/tradingjournalapp

# Run the development startup script
./start_dev.sh
```

This script automatically:
- Activates the virtual environment
- Starts the backend server
- Starts the frontend server
- Displays access URLs

## Environment Setup (Required for All Methods)

### 1. Backend Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys:
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# FIREBASE_API_KEY=your_firebase_key_here (if using Firebase)
```

### 2. Frontend Environment Variables
```bash
# Navigate to frontend directory
cd frontend-new

# Copy the example file
cp .env.example .env

# Edit frontend-new/.env with your Firebase config (if using Firebase)
```

## Access URLs
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Alternative Docs**: http://localhost:8000/redoc

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 3000 or 8000
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

### Docker Issues
```bash
# Clean up Docker containers and rebuild
docker-compose down --volumes
docker-compose up --build
```

### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Dependencies Issues
```bash
# Clean install npm dependencies
cd frontend-new
rm -rf node_modules package-lock.json
npm install
```

## Recommendation

**For daily development**: Use the Docker Compose method (`docker-compose up --build`) as it:
- Eliminates environment inconsistencies
- Automatically handles dependencies
- Easier to manage both services
- Matches production environment better

**For debugging/development**: Use the manual method when you need to:
- Debug backend code with detailed logs
- Make frequent backend changes
- Test specific backend functionality
