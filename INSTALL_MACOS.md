# macOS Installation Guide for Trading Journal App

This guide provides instructions for setting up the Trading Journal application on macOS, specifically addressing issues that might arise when using Anaconda Python.

## Installation Steps

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/tradingjournalapp.git
cd tradingjournalapp
```

### 2. Set Up a Virtual Environment (Optional but Recommended)

When using Anaconda, you can create a dedicated environment for this project:

```bash
conda create -n tradingjournalapp python=3.9
conda activate tradingjournalapp
```

Alternatively, create a standard Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Manual Package Installation

If you encounter issues with the automatic setup script, you can install packages manually:

```bash
# Upgrade pip first
pip install --upgrade pip

# Install core packages
pip install --prefer-binary fastapi==0.75.0 uvicorn==0.17.6 sqlalchemy==1.4.36 pydantic==1.9.0

# Install authentication packages
pip install --prefer-binary python-jose==3.3.0 passlib==1.7.4 bcrypt==3.2.0 python-multipart==0.0.5

# Install database migration
pip install --prefer-binary alembic==1.7.7

# Install utility packages
pip install --prefer-binary requests==2.27.1 python-dateutil==2.8.2
```

### 4. Troubleshooting aiohttp Installation

If you encounter issues installing aiohttp, try these approaches:

#### Option 1: Install a different version
```bash
pip install --prefer-binary aiohttp==3.7.4
```

#### Option 2: Install with conda
```bash
conda install -c conda-forge aiohttp
```

#### Option 3: Install without binary extensions (slower but more compatible)
```bash
AIOHTTP_NO_EXTENSIONS=1 pip install aiohttp
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Initialize the Database

```bash
cd ..  # Return to project root
python -c "from backend.db.database import initialize_db; initialize_db()"
```

### 7. Start the Application

In one terminal, start the backend:
```bash
cd backend
uvicorn api.main:app --reload
```

In another terminal, start the frontend:
```bash
cd frontend
npm start
```

## Common Issues and Solutions

### Missing Header Files

If you encounter errors about missing header files (like `longintrepr.h`), it's usually because you're missing development headers. Try:

```bash
# For Homebrew Python
brew install python-tk

# For Anaconda
conda install -c anaconda python
```

### Package Conflicts

If you're using Anaconda and facing package conflicts:

1. Create a clean conda environment
```bash
conda create -n tradingjournalapp python=3.9 --no-default-packages
conda activate tradingjournalapp
```

2. Install packages with conda first, then pip
```bash
conda install -c conda-forge fastapi uvicorn sqlalchemy
```

### Binary Wheel Issues

For M1/M2 Macs, some packages might not have ARM64 wheels. You can try:

```bash
pip install --no-binary :all: package_name
```

Or force x86_64 architecture:
```bash
ARCHFLAGS="-arch x86_64" pip install package_name
```

## Need Help?

If you continue to encounter issues:

1. Create an issue on the GitHub repository
2. Try running the frontend without the backend - many features will still work
3. Consider using a Docker-based setup (instructions forthcoming)
