#!/bin/bash

# Navigate to the repository directory
cd "$(dirname "$0")"

# Show current status
echo "Current Git status:"
git status

# Add all files to the staging area
echo -e "\nAdding all files to staging area..."
git add .

# Show what's been staged
echo -e "\nFiles staged for commit:"
git status

# Get commit message from user or use default
echo -e "\nEnter commit message (or press enter to use default):"
read -r commit_msg

if [ -z "$commit_msg" ]; then
  commit_msg="Docker implementation and MCP integration for Trading Journal App"
fi

# Commit the changes
echo -e "\nCommitting changes with message: '$commit_msg'"
git commit -m "$commit_msg"

# Push to GitHub
echo -e "\nPushing to GitHub..."
git push origin master

echo -e "\nDone! Your code has been committed and pushed to GitHub at: https://github.com/ItamarS3917/Trading-Journal-App"
