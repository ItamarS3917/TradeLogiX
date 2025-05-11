# File: setup.py
# Purpose: Setup script for initializing the Trading Journal application

import os
import sys
import subprocess
import argparse
import shutil

def check_python_version():
    """Check if Python version is 3.9 or higher"""
    required_major = 3
    required_minor = 9
    
    current_major = sys.version_info.major
    current_minor = sys.version_info.minor
    
    if current_major < required_major or (current_major == required_major and current_minor < required_minor):
        print(f"Error: Python {required_major}.{required_minor} or higher is required")
        print(f"Current Python version: {current_major}.{current_minor}")
        sys.exit(1)

def check_node_version():
    """Check if Node.js is installed and version is 20 or higher"""
    try:
        node_version = subprocess.check_output(["node", "--version"]).decode("utf-8").strip()
        # Remove 'v' prefix and split by '.'
        version_parts = node_version[1:].split('.')
        
        major_version = int(version_parts[0])
        
        if major_version < 20:
            print(f"Error: Node.js 20 or higher is required")
            print(f"Current Node.js version: {node_version}")
            sys.exit(1)
        
        print(f"Node.js version: {node_version}")
    except (subprocess.SubprocessError, FileNotFoundError):
        print("Error: Node.js is not installed or not in PATH")
        sys.exit(1)

def create_virtual_env():
    """Create Python virtual environment"""
    if os.path.exists("venv"):
        print("Virtual environment already exists")
        return
    
    print("Creating virtual environment...")
    subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
    print("Virtual environment created successfully")

def install_backend_dependencies():
    """Install backend dependencies"""
    print("Installing backend dependencies...")
    
    # Determine the correct pip executable
    pip_executable = os.path.join("venv", "bin", "pip") if os.name != "nt" else os.path.join("venv", "Scripts", "pip")
    
    try:
        # First, upgrade pip
        subprocess.run([pip_executable, "install", "--upgrade", "pip"], check=True)
        
        # Try to install dependencies with binary preference
        print("Attempting to install dependencies with binary preference...")
        subprocess.run([pip_executable, "install", "--prefer-binary", "-r", "requirements.txt"], check=True)
        
    except subprocess.CalledProcessError:
        print("\nStandard installation failed. Trying alternative installation method...\n")
        
        # Try installing packages one by one
        with open("requirements.txt", "r") as f:
            requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]
        
        # Install each package separately
        for req in requirements:
            try:
                print(f"Installing {req}...")
                subprocess.run([pip_executable, "install", "--prefer-binary", req], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Warning: Failed to install {req}. Error: {e}")
                print(f"Continuing with other packages...")
    
    print("Backend dependencies installation completed")
    print("Note: If some packages failed to install, you may need to install them manually.")


def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("Installing frontend dependencies...")
    
    # Change to frontend directory
    os.chdir("frontend")
    
    # Install dependencies
    subprocess.run(["npm", "install"], check=True)
    
    # Change back to root directory
    os.chdir("..")
    
    print("Frontend dependencies installed successfully")

def initialize_database():
    """Initialize database"""
    print("Initializing database...")
    
    # Determine the correct python executable
    python_executable = os.path.join("venv", "bin", "python") if os.name != "nt" else os.path.join("venv", "Scripts", "python")
    
    # Run database initialization script
    db_init_script = """
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath('.'))

# Import database modules
from backend.db.database import initialize_db

# Initialize database
initialize_db()

print("Database initialized successfully")
"""
    
    with open("init_db.py", "w") as f:
        f.write(db_init_script)
    
    # Run initialization script
    subprocess.run([python_executable, "init_db.py"], check=True)
    
    # Remove temporary script
    os.remove("init_db.py")

def create_env_files():
    """Create environment files"""
    print("Creating environment files...")
    
    # Backend .env file
    backend_env = """# Backend environment variables
DATABASE_URL=sqlite:///./tradingjournalapp.db
SECRET_KEY=supersecretkey_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MCP configuration
MCP_AI_SERVER_HOST=localhost
MCP_AI_SERVER_PORT=5001
MCP_AI_SERVER_API_KEY=development-key
MCP_AI_SERVER_MODEL=claude-3-opus-20240229

MCP_MARKET_DATA_SERVER_HOST=localhost
MCP_MARKET_DATA_SERVER_PORT=5002
MCP_MARKET_DATA_SERVER_API_KEY=development-key

MCP_STATISTICS_SERVER_HOST=localhost
MCP_STATISTICS_SERVER_PORT=5003
MCP_STATISTICS_CACHE_ENABLED=true
MCP_STATISTICS_CACHE_TTL=3600

MCP_TRADE_ANALYSIS_SERVER_HOST=localhost
MCP_TRADE_ANALYSIS_SERVER_PORT=5004

MCP_ALERT_SERVER_HOST=localhost
MCP_ALERT_SERVER_PORT=5005

MCP_SENTIMENT_ANALYSIS_SERVER_HOST=localhost
MCP_SENTIMENT_ANALYSIS_SERVER_PORT=5006
"""
    
    # Frontend .env file
    frontend_env = """# Frontend environment variables
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MCP_API_URL=http://localhost:5000
"""
    
    # Create backend .env file
    with open(os.path.join("backend", ".env"), "w") as f:
        f.write(backend_env)
    
    # Create frontend .env file
    with open(os.path.join("frontend", ".env"), "w") as f:
        f.write(frontend_env)
    
    print("Environment files created successfully")

def create_start_scripts():
    """Create start scripts"""
    print("Creating start scripts...")
    
    # Backend start script
    backend_start = """#!/bin/bash
# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start backend server
cd backend
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
"""
    
    # Frontend start script
    frontend_start = """#!/bin/bash
# Start frontend server
cd frontend
npm start
"""
    
    # Create backend start script
    with open("start_backend.sh", "w") as f:
        f.write(backend_start)
    
    # Create frontend start script
    with open("start_frontend.sh", "w") as f:
        f.write(frontend_start)
    
    # Make scripts executable
    if os.name != "nt":
        os.chmod("start_backend.sh", 0o755)
        os.chmod("start_frontend.sh", 0o755)
    
    # Create Windows batch files
    if os.name == "nt":
        # Backend batch file
        backend_batch = """@echo off
:: Activate virtual environment
call venv\\Scripts\\activate

:: Start backend server
cd backend
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
"""
        
        # Frontend batch file
        frontend_batch = """@echo off
:: Start frontend server
cd frontend
npm start
"""
        
        # Create backend batch file
        with open("start_backend.bat", "w") as f:
            f.write(backend_batch)
        
        # Create frontend batch file
        with open("start_frontend.bat", "w") as f:
            f.write(frontend_batch)
    
    print("Start scripts created successfully")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Setup script for Trading Journal application")
    parser.add_argument("--no-venv", action="store_true", help="Skip virtual environment creation")
    parser.add_argument("--backend-only", action="store_true", help="Setup backend only")
    parser.add_argument("--frontend-only", action="store_true", help="Setup frontend only")
    
    args = parser.parse_args()
    
    print("Setting up Trading Journal application...")
    
    # Check Python version
    check_python_version()
    
    # Setup backend
    if not args.frontend_only:
        # Create virtual environment
        if not args.no_venv:
            create_virtual_env()
        
        # Install backend dependencies
        install_backend_dependencies()
        
        # Initialize database
        initialize_database()
    
    # Setup frontend
    if not args.backend_only:
        # Check Node.js version
        check_node_version()
        
        # Install frontend dependencies
        install_frontend_dependencies()
    
    # Create environment files
    create_env_files()
    
    # Create start scripts
    create_start_scripts()
    
    print("\nSetup completed successfully!")
    print("\nTo start the application:")
    
    if os.name != "nt":
        print("1. Backend: ./start_backend.sh")
        print("2. Frontend: ./start_frontend.sh")
    else:
        print("1. Backend: start_backend.bat")
        print("2. Frontend: start_frontend.bat")
    
    print("\nAccess the application at http://localhost:3000")

if __name__ == "__main__":
    main()
