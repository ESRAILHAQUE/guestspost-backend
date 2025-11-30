#!/bin/bash

# Backend Diagnostic Script
# This script helps diagnose backend issues

set -e

echo "🔍 Backend Diagnostic Check..."
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_DIR="/var/www/guestpostnow/Backend"

# Check if directory exists
echo -n "1. Checking backend directory... "
if [ -d "$BACKEND_DIR" ]; then
    echo -e "${GREEN}✓ Found${NC}"
    cd "$BACKEND_DIR"
else
    echo -e "${RED}✗ Not found at $BACKEND_DIR${NC}"
    echo "   Please check the path!"
    exit 1
fi

# Check Node.js
echo -n "2. Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check npm/pnpm
echo -n "3. Checking package manager... "
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓ pnpm $(pnpm -v)${NC}"
elif command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
fi

# Check PM2
echo -n "4. Checking PM2... "
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓ $PM2_VERSION${NC}"
    
    # Check if backend is running
    echo -n "5. Checking PM2 process... "
    if pm2 list | grep -q "guestpost-backend"; then
        STATUS=$(pm2 jlist | grep -A 5 "guestpost-backend" | grep "pm2_env" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Running (Status: $STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠ Not running in PM2${NC}"
    fi
else
    echo -e "${YELLOW}⚠ PM2 not installed${NC}"
fi

# Check .env file
echo -n "6. Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    
    # Check critical env vars
    echo -n "   - MONGODB_URI: "
    if grep -q "MONGODB_URI=" .env && ! grep -q "MONGODB_URI=$" .env; then
        echo -e "${GREEN}✓ Set${NC}"
    else
        echo -e "${RED}✗ Not set${NC}"
    fi
    
    echo -n "   - JWT_SECRET: "
    if grep -q "JWT_SECRET=" .env && ! grep -q "JWT_SECRET=$" .env; then
        echo -e "${GREEN}✓ Set${NC}"
    else
        echo -e "${RED}✗ Not set${NC}"
    fi
    
    echo -n "   - PORT: "
    if grep -q "PORT=" .env; then
        PORT=$(grep "PORT=" .env | cut -d'=' -f2 | tr -d ' ')
        echo -e "${GREEN}✓ $PORT${NC}"
    else
        echo -e "${YELLOW}⚠ Not set (default: 5000)${NC}"
    fi
else
    echo -e "${RED}✗ Not found${NC}"
    echo "   Run: cp env.example .env"
fi

# Check node_modules
echo -n "7. Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo "   Run: npm install"
fi

# Check dist folder
echo -n "8. Checking build output... "
if [ -f "dist/server.js" ]; then
    echo -e "${GREEN}✓ Built${NC}"
else
    echo -e "${RED}✗ Not built${NC}"
    echo "   Run: npm run build"
fi

# Check port availability
echo -n "9. Checking port 5000... "
PORT=5000
if grep -q "PORT=" .env 2>/dev/null; then
    PORT=$(grep "PORT=" .env | cut -d'=' -f2 | tr -d ' ')
fi

if lsof -i :$PORT &> /dev/null || netstat -tuln | grep ":$PORT " &> /dev/null; then
    PROCESS=$(lsof -i :$PORT 2>/dev/null | tail -1 | awk '{print $2}' || echo "unknown")
    echo -e "${YELLOW}⚠ Port $PORT is in use (PID: $PROCESS)${NC}"
else
    echo -e "${GREEN}✓ Port $PORT is available${NC}"
fi

# Check MongoDB connection (if MongoDB URI is set)
if [ -f ".env" ] && grep -q "MONGODB_URI=" .env; then
    MONGO_URI=$(grep "MONGODB_URI=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
    if [ ! -z "$MONGO_URI" ] && [ "$MONGO_URI" != "mongodb://localhost:27017/guestpost_db" ]; then
        echo -n "10. Checking MongoDB connection... "
        if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
            echo -e "${YELLOW}⚠ Manual check recommended${NC}"
        else
            echo -e "${YELLOW}⚠ MongoDB client not available for test${NC}"
        fi
    fi
fi

echo ""
echo "================================"
echo "Diagnostic check completed!"
echo ""
echo "Next steps:"
echo "1. If backend not running: ./deploy.sh"
echo "2. Check logs: pm2 logs guestpost-backend"
echo "3. Manual start: pm2 start ecosystem.config.js"

