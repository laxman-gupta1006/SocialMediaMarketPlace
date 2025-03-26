#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env.production ]; then
  source .env.production
else
  echo "Error: .env.production file not found"
  exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p $UPLOAD_PATH/posts
mkdir -p logs

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 $UPLOAD_PATH
chmod -R 755 logs

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --production

# Build frontend for Nginx
echo "Building frontend for Nginx..."
cd ../frontend
npm install --production
npm run build

# Start backend with PM2
echo "Starting backend server..."
cd ../backend
pm2 start ecosystem.config.js --env production

echo "Deployment completed successfully!"
echo "Backend is running at https://192.168.2.250:3000"
echo "Frontend build is ready for Nginx deployment at ../frontend/build" 