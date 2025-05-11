#!/bin/bash

# Make sure this script is executable:
# chmod +x install_frontend_deps.sh

# Navigate to the frontend-new directory
cd frontend-new

# Install all the missing dependencies
echo "Installing missing dependencies..."
npm install @mui/x-date-pickers @hookform/resolvers yup recharts date-fns

# Install any other missing dependencies from package.json
echo "Installing all dependencies from package.json..."
npm install

echo "Dependencies installed. You can now run ./run_frontend_local.sh"
