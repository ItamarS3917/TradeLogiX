#!/bin/bash

# Make sure this script is executable (chmod +x update_docker_files.sh)

# Stop current containers
docker-compose down

# Start containers in detached mode
docker-compose up -d

# Give containers time to start
sleep 5

# Copy the fixed index.js file to the frontend container
echo "Copying Planning index.js file to Docker container..."
docker cp /Users/itamarmacbook/Desktop/tradingjournalapp/frontend-new/src/components/Planning/index.js tradingjournalapp-frontend-1:/app/src/components/Planning/index.js

# Verify the file was copied
docker exec tradingjournalapp-frontend-1 cat /app/src/components/Planning/index.js

echo "Files updated. Displaying Docker logs:"
docker-compose logs -f
