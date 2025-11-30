#!/bin/bash

# Backend Deployment Script
# This script helps deploy the backend to the server

set -e

echo "🚀 Starting Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}Warning: Running as root. Consider using a non-root user.${NC}"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Installing PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}PM2 installed successfully!${NC}"
fi

# Navigate to backend directory
BACKEND_DIR="/var/www/guestpostnow/Backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

echo -e "${GREEN}Current directory: $(pwd)${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.env file not found. Creating from env.example...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}Please update the .env file with your production configuration!${NC}"
    else
        echo -e "${RED}env.example file not found!${NC}"
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build TypeScript
echo -e "${YELLOW}Building TypeScript...${NC}"
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if PM2 process is already running
if pm2 list | grep -q "guestpost-backend"; then
    echo -e "${YELLOW}Backend is already running. Restarting...${NC}"
    pm2 restart guestpost-backend
else
    echo -e "${YELLOW}Starting backend with PM2...${NC}"
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
if ! pm2 startup | grep -q "already"; then
    echo -e "${YELLOW}Setting up PM2 startup script...${NC}"
    pm2 startup
fi

echo -e "${GREEN}✅ Backend deployment completed successfully!${NC}"
echo -e "${GREEN}Check backend status: pm2 status${NC}"
echo -e "${GREEN}View logs: pm2 logs guestpost-backend${NC}"
echo -e "${GREEN}Monitor: pm2 monit${NC}"

