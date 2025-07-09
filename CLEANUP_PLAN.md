# Repository Cleanup Plan

## 📁 ROOT DIRECTORY - BEFORE vs AFTER

### ✅ KEEP IN ROOT (Essential Files Only):
- `README.md` - Main project documentation
- `requirements.txt` - Python dependencies
- `docker-compose.yml` - Main deployment config
- `Dockerfile` - Container setup
- `.gitignore` - Git ignore rules
- `.env.example` - Environment template
- `setup.py` - Python package setup
- `firebase.json` - Firebase configuration
- `firestore.indexes.json` - Firestore setup
- `firestore.rules` - Firebase security rules

### 📚 MOVE TO docs/ FOLDER:
- `CLEANUP_COMPLETE.md`
- `GITHUB_SETUP.md` 
- `QUICK_START.md`
- `SQL_MIGRATION_ANALYSIS.md`
- `STARTUP_INSTRUCTIONS.md`
- `STATUS.md`
- `TESTING_GUIDE.md`
- `TROUBLESHOOTING.md`
- `PROJECT_ROADMAP.md`
- `updated-masterplan.md`

### 🗑️ REMOVE COMPLETELY:
- All `.sh` script files (cleanup.sh, start_dev.sh, etc.)
- `install_dependencies.py`
- `playwright.config.js`
- `Dockerfile.frontend`
- `Dockerfile.test`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `cloud_sync.db`
- `backups/` directory
- `clean-repo/` directory
- `project images/` directory

### 🏗️ KEEP AS-IS (Core Application):
- `backend/` - Python FastAPI application
- `frontend-new/` - React application
- `docs/` - Documentation (will contain moved files)
- `static/` - Static assets
- `testing/` - Test files
- `venv/` - Already ignored by .gitignore

## 🎯 RESULT:
**Before**: 30+ files in root directory  
**After**: 10 essential files in root directory  
**Benefit**: Clean, professional GitHub repository
