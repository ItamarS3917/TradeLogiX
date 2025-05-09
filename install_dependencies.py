#!/usr/bin/env python3
# File: install_dependencies.py
# Purpose: Simple script to install dependencies for the Trading Journal app

import os
import sys
import subprocess
import platform

def main():
    """Install backend dependencies directly"""
    print("Installing backend dependencies...")
    
    # Check Python version
    python_version = platform.python_version()
    print(f"Using Python {python_version}")
    
    # Determine pip command
    if os.path.exists("venv"):
        pip_cmd = os.path.join("venv", "bin", "pip") if os.name != "nt" else os.path.join("venv", "Scripts", "pip")
        print(f"Using pip from virtual environment: {pip_cmd}")
    else:
        pip_cmd = "pip"
        print("Using system pip")
    
    # Install critical packages first
    critical_packages = [
        "pydantic==1.9.0",
        "fastapi==0.75.0",
        "uvicorn==0.17.6",
        "sqlalchemy==1.4.36"
    ]
    
    for package in critical_packages:
        try:
            print(f"Installing {package}...")
            subprocess.run([pip_cmd, "install", "--prefer-binary", package], check=True)
        except subprocess.CalledProcessError:
            print(f"Warning: Failed to install {package}")
    
    # Try direct installation of problematic packages
    problem_packages = [
        # Alternative packages - newer or older versions that might be compatible
        "aiohttp>=3.7.0,<3.9.0",
        "pillow==9.0.0",
        "python-multipart>=0.0.5"
    ]
    
    for package in problem_packages:
        try:
            print(f"Installing {package}...")
            subprocess.run([pip_cmd, "install", "--prefer-binary", package], check=True)
        except subprocess.CalledProcessError:
            print(f"Warning: Failed to install {package}")
    
    # Install the rest of the packages
    other_packages = [
        "alembic==1.7.7",
        "python-jose==3.3.0",
        "passlib==1.7.4",
        "bcrypt==3.2.0",
        "requests==2.27.1",
        "python-dateutil==2.8.2",
        "aiofiles==0.8.0"
    ]
    
    for package in other_packages:
        try:
            print(f"Installing {package}...")
            subprocess.run([pip_cmd, "install", "--prefer-binary", package], check=True)
        except subprocess.CalledProcessError:
            print(f"Warning: Failed to install {package}")
    
    # Install development packages
    dev_packages = [
        "pytest==7.1.1",
        "pytest-asyncio==0.18.3",
        "httpx==0.22.0",
        "black==22.3.0",
        "isort==5.10.1",
        "flake8==4.0.1"
    ]
    
    for package in dev_packages:
        try:
            print(f"Installing {package}...")
            subprocess.run([pip_cmd, "install", "--prefer-binary", package], check=True)
        except subprocess.CalledProcessError:
            print(f"Warning: Failed to install {package}")
    
    print("\nDependency installation completed.")
    print("Note: Some packages might have failed to install. If you encounter errors running the application,")
    print("you might need to install some packages manually or check for compatibility issues.")

if __name__ == "__main__":
    main()
