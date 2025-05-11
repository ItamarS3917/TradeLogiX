#!/bin/bash

# Make sure this script is executable:
# chmod +x run_dev_environment.sh

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Rebuild the containers with our development setup
echo "Building containers..."
docker-compose build

# Start the containers
echo "Starting development environment..."
docker-compose up
