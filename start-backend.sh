#!/bin/bash

# Script to start backend after fixing issues

set -e

echo "🚀 Starting Backend..."
echo "======================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Find backend directory
BACKEND_DIR=""
if [ -d "/var/www/guestpostnow/guestpostnow-backend" ]; then
    BACKEND_DIR="/var/www/guestpostnow/guestpostnow-backend"
elif [ -d "/var/www/guestpostnow/Backend" ]; then
    BACKEND_DIR="/var/www/guestpostnow/Backend"
else
    echo -e "${RED}✗ Backend directory not found!${NC}"
    exit 1
fi

echo -e "Backend directory: ${GREEN}$BACKEND_DIR${NC}"
cd "$BACKEND_DIR"

# Check .env file
echo ""
echo "1. Checking .env file..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    if [ -f "env.example" ]; then
        echo "   Creating .env from env.example..."
        cp env.example .env
        echo -e "${YELLOW}   ⚠ Please configure .env file before starting backend!${NC}"
        echo "   Run: nano $BACKEND_DIR/.env"
    else
        echo -e "${RED}   ✗ env.example not found either!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Check if dist folder exists
echo ""
echo "2. Checking build..."
if [ ! -f "dist/server.js" ]; then
    echo -e "${YELLOW}⚠ dist/server.js not found, building...${NC}"
    npm install
    npm run build
    if [ ! -f "dist/server.js" ]; then
        echo -e "${RED}✗ Build failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${GREEN}✓ dist/server.js exists${NC}"
fi

# Check port 5000
echo ""
echo "3. Checking port 5000..."
if lsof -i :5000 &> /dev/null || netstat -tuln 2>/dev/null | grep ":5000 " &> /dev/null; then
    PORT_PID=$(lsof -ti :5000 || echo "")
    echo -e "${YELLOW}⚠ Port 5000 is in use (PID: $PORT_PID)${NC}"
    read -p "   Kill process on port 5000? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill -9 $PORT_PID 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✓ Port 5000 freed${NC}"
    else
        echo -e "${RED}✗ Cannot start backend, port 5000 is in use${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Port 5000 is available${NC}"
fi

# Delete existing errored process
echo ""
echo "4. Cleaning up PM2 processes..."
if pm2 list | grep -q "guestpost-backend"; then
    echo "   Deleting existing guestpost-backend process..."
    pm2 delete guestpost-backend || true
    sleep 2
fi

# Start backend
echo ""
echo "5. Starting backend with PM2..."

# Check if ecosystem.config.js exists
if [ -f "ecosystem.config.js" ]; then
    echo "   Using ecosystem.config.js..."
    pm2 start ecosystem.config.js
else
    echo "   Starting manually..."
    pm2 start dist/server.js --name guestpost-backend --cwd "$BACKEND_DIR"
fi

# Wait a moment
sleep 3

# Check status
echo ""
echo "6. Checking backend status..."
BACKEND_STATUS=$(pm2 list | grep "guestpost-backend" | awk '{print $10}')
if [ "$BACKEND_STATUS" = "online" ]; then
    echo -e "${GREEN}✓ Backend is online!${NC}"
else
    echo -e "${RED}✗ Backend failed to start (Status: $BACKEND_STATUS)${NC}"
    echo ""
    echo "Recent logs:"
    pm2 logs guestpost-backend --lines 20 --nostream || true
    exit 1
fi

# Save PM2 configuration
pm2 save

# Show final status
echo ""
echo "======================"
echo -e "${GREEN}✅ Backend started successfully!${NC}"
echo ""
echo "PM2 Status:"
pm2 list | grep -E "guestpost-backend|guestpostnow-frontend"

echo ""
echo "Check logs with:"
echo "  pm2 logs guestpost-backend"
echo "  pm2 logs guestpost-backend --lines 50"

