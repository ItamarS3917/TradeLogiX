#!/usr/bin/env python3
"""
Trading Journal App GitHub Cleanup Script

This script removes unnecessary files and directories from the project 
that shouldn't be uploaded to GitHub and ensures only relevant files remain.
"""

import os
import shutil
import sys

# Directory to clean up
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# Files and directories to remove
TO_REMOVE = [
    # Virtual environments
    'venv',
    'py39_venv',
    'fresh_venv',
    '.venv',
    
    # Temporary files
    '.DS_Store',
    '__pycache__',
    '*.pyc',
    '*.pyo',
    '.pytest_cache',
    '.coverage',
    'htmlcov',
    
    # Local configuration
    '.env',
    '*.db',
    '*.sqlite3',
    'tradingjournalapp.db',
    
    # Docker related (if not part of the essential project)
    # Uncomment if you don't want to include Docker setup
    # 'Dockerfile',
    # 'docker-compose.yml',
    # 'docker-compose.backend-only.yml',
    
    # Backup directories
    'frontend-backup',
]

# Files to keep regardless of general patterns
ESSENTIAL_FILES = [
    'README.md',
    'requirements.txt',
    'setup.py',
    '.gitignore',
    '.env.example',
    'PROJECT_ROADMAP.md',
]

def should_remove(path):
    """Determine if a path should be removed based on our rules."""
    filename = os.path.basename(path)
    
    # Keep essential files
    if filename in ESSENTIAL_FILES:
        return False
    
    # Check against removal patterns
    for pattern in TO_REMOVE:
        # For exact matches
        if pattern == filename:
            return True
        
        # For wildcards (simple implementation)
        if '*' in pattern:
            pattern_base = pattern.replace('*', '')
            if pattern.startswith('*') and filename.endswith(pattern_base):
                return True
            if pattern.endswith('*') and filename.startswith(pattern_base):
                return True
    
    return False

def clean_directory(directory):
    """Clean a directory by removing files that match our patterns."""
    print(f"Cleaning directory: {directory}")
    
    # List all items in the directory
    try:
        items = os.listdir(directory)
    except PermissionError:
        print(f"Permission denied to access {directory}")
        return
    except FileNotFoundError:
        print(f"Directory not found: {directory}")
        return
    
    for item in items:
        item_path = os.path.join(directory, item)
        
        # Skip .git directory entirely
        if item == '.git':
            print(f"Skipping .git directory")
            continue
        
        # Check if this item should be removed
        if should_remove(item_path):
            try:
                if os.path.isfile(item_path) or os.path.islink(item_path):
                    os.unlink(item_path)
                    print(f"Removed file: {item_path}")
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                    print(f"Removed directory: {item_path}")
            except Exception as e:
                print(f"Error removing {item_path}: {e}")
        
        # Recursively clean subdirectories
        elif os.path.isdir(item_path):
            clean_directory(item_path)

def create_gitignore():
    """Create a comprehensive .gitignore file for the project."""
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environments
venv/
py39_venv/
fresh_venv/
.venv/
ENV/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite3
tradingjournalapp.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE specific files
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Testing
.coverage
htmlcov/
.pytest_cache/

# Frontend
node_modules/
frontend/build/
frontend/dist/
frontend/node_modules/

# Backup files
*-backup/
*_backup/
"""
    
    gitignore_path = os.path.join(PROJECT_DIR, '.gitignore')
    with open(gitignore_path, 'w') as file:
        file.write(gitignore_content)
    print(f"Created comprehensive .gitignore at {gitignore_path}")

def main():
    """Main function to run the cleanup process."""
    print("Starting Trading Journal App GitHub cleanup...")
    
    # Ask for confirmation
    response = input("This will remove unnecessary files from your project. Continue? (y/n): ")
    if response.lower() != 'y':
        print("Cleanup aborted.")
        sys.exit(0)
    
    # Clean the project directory
    clean_directory(PROJECT_DIR)
    
    # Create a comprehensive .gitignore
    create_gitignore()
    
    print("\nCleanup complete! Your project is now ready for GitHub.")
    print("\nImportant files that were preserved:")
    preserved_dirs = [d for d in os.listdir(PROJECT_DIR) if os.path.isdir(os.path.join(PROJECT_DIR, d))]
    preserved_files = [f for f in os.listdir(PROJECT_DIR) if os.path.isfile(os.path.join(PROJECT_DIR, f))]
    
    print("\nDirectories:")
    for d in sorted(preserved_dirs):
        print(f"- {d}")
    
    print("\nFiles:")
    for f in sorted(preserved_files):
        print(f"- {f}")

if __name__ == "__main__":
    main()
