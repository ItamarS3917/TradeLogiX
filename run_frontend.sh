#!/bin/bash

# Navigate to the frontend directory
cd "$(dirname "$0")"/frontend

# Install dependencies if needed
echo "Installing frontend dependencies..."
npm install

# Start the frontend development server
echo "Starting frontend server..."
npm start

echo "Frontend should be accessible at http://localhost:3000"
