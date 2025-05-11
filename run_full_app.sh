#!/bin/bash

# Make sure this script is executable:
# chmod +x run_full_app.sh

# Function to check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "Docker does not appear to be running. Please start Docker and try again."
    exit 1
  fi
}

# Start the backend in Docker
start_backend() {
  echo "Starting backend in Docker..."
  docker-compose up -d backend
  echo "Backend started! API available at http://localhost:8000"
}

# Set up and run the frontend locally
setup_and_run_frontend() {
  echo "Setting up frontend..."
  ./setup_frontend.sh
  
  echo "Starting frontend..."
  ./run_frontend_local.sh
}

# Main execution
echo "=== Trading Journal App Setup ==="
echo "This script will set up and run both backend and frontend components."

# Check if Docker is running
check_docker

# Start the backend
start_backend

# Start the frontend
setup_and_run_frontend

echo "Application is now running!"
echo "- Backend API: http://localhost:8000"
echo "- Frontend UI: http://localhost:3000"
