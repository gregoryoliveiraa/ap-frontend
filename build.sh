#!/bin/bash
# This script builds the frontend for production

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "Building project..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
  echo "Build successful! Output is in the 'build' directory."
else
  echo "Build failed! No 'build' directory found."
  exit 1
fi 