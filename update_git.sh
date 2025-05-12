#!/bin/bash

# Set the current directory
cd /Users/itamarmacbook/Desktop/tradingjournalapp

# Print current status
echo "Current git status:"
git status

# Check if frontend directory exists in git
if git ls-files | grep -q "^frontend/"; then
  echo "Frontend directory still exists in git, removing it..."
  git rm -rf frontend
fi

# Stage modified files
echo "Staging modified files..."
git add README.md
git add docs/
git add MCP_IMPLEMENTATION.md

# Commit changes
git commit -m "Update documentation based on revised masterplan, remove frontend directory"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin master

echo "All done!"
