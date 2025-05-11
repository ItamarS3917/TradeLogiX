#!/bin/bash

# Make sure this script is executable:
# chmod +x setup_frontend.sh

# Navigate to the frontend-new directory
cd frontend-new

# Remove node_modules and package-lock.json for a clean start
echo "Cleaning up existing installation..."
rm -rf node_modules
rm -f package-lock.json

# Install all dependencies from the updated package.json
echo "Installing all dependencies from package.json..."
npm install

echo "Dependencies installed. You can now run ./run_frontend_local.sh"
