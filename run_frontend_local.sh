#!/bin/bash

# Make sure this script is executable:
# chmod +x run_frontend_local.sh

# Navigate to the frontend-new directory
cd frontend-new

# Check for missing dependencies and install them
echo "Checking for missing dependencies..."
if [ ! -d "node_modules/@mui/x-date-pickers" ]; then
  echo "Installing @mui/x-date-pickers..."
  npm install @mui/x-date-pickers
fi

if [ ! -d "node_modules/@hookform" ]; then
  echo "Installing @hookform/resolvers..."
  npm install @hookform/resolvers
fi

if [ ! -d "node_modules/recharts" ]; then
  echo "Installing recharts..."
  npm install recharts
fi

if [ ! -d "node_modules/yup" ]; then
  echo "Installing yup..."
  npm install yup
fi

if [ ! -d "node_modules/date-fns" ]; then
  echo "Installing date-fns..."
  npm install date-fns
fi

# Start the development server
echo "Starting frontend development server..."
npm start
