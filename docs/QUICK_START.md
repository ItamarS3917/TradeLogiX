# 🚀 Trading Journal App - Quick Start Guide

## TL;DR - Just want to run the app?

```bash
cd /Users/itamarmacbook/Desktop/tradingjournalapp
docker-compose up --build
```

Then open: http://localhost:3000

---

## Answer to Your Question

**Yes, you're correct!** 
- ✅ **Docker for Backend**: Your backend runs in Docker (Python FastAPI)
- ✅ **npm for Frontend**: Your frontend runs with npm/Vite (React)

However, you actually have **both options** available:

### Option 1: Full Docker (Easiest)
```bash
docker-compose up --build
```
*Runs both backend AND frontend in Docker containers*

### Option 2: Mixed (Your Current Method)
```bash
# Terminal 1: Backend in Docker
docker-compose up backend

# Terminal 2: Frontend with npm
cd frontend-new && npm start
```

### Option 3: Manual Development
```bash
# Terminal 1: Backend manually
source venv/bin/activate
python -m uvicorn backend.api.main:app --reload

# Terminal 2: Frontend with npm  
cd frontend-new && npm start
```

## 🎯 My Recommendation

**Use Option 1 (Full Docker)** because:
- ✅ One command starts everything
- ✅ No environment conflicts
- ✅ Same as production setup
- ✅ Easier to share with others
- ✅ Less mental overhead

## Quick Commands

| Action | Command |
|--------|---------|
| **Start App** | `docker-compose up --build` |
| **Stop App** | `Ctrl+C` then `docker-compose down` |
| **Rebuild** | `docker-compose up --build` |
| **View Logs** | `docker-compose logs -f` |

## Access Points
- 🌐 **Frontend**: http://localhost:3000
- 🔗 **Backend API**: http://localhost:8000  
- 📚 **API Docs**: http://localhost:8000/docs

## Environment Setup (One-time)
```bash
# Backend environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Frontend environment  
cd frontend-new
cp .env.example .env
# Edit .env if using Firebase
```

---
*For detailed instructions, see [STARTUP_INSTRUCTIONS.md](STARTUP_INSTRUCTIONS.md)*
