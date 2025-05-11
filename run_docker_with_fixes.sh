#!/bin/bash

# Make sure to make this script executable:
# chmod +x run_docker_with_fixes.sh

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Rebuild the containers to include our changes
echo "Rebuilding containers with changes..."
docker-compose build

# Start the containers
echo "Starting containers..."
docker-compose up
