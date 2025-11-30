#!/bin/bash

# Script to fix server deployment issues
# This script addresses common PM2 and port conflicts

set -e

echo "🔧 Fixing Server Deployment Issues..."
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check what's using port 3000
echo "1. Checking port 3000 usage..."
if lsof -i :3000 &> /dev/null || netstat -tuln | grep ":3000 " &> /dev/null; then
    echo -e "${YELLOW}⚠ Port 3000 is in use${NC}"
    echo "   Finding process..."
    PORT_3000_PID=$(lsof -ti :3000 || netstat -tlnp 2>/dev/null | grep ":3000 " | awk '{print $7}' | cut -d'/' -f1 | head -1)
    if [ ! -z "$PORT_3000_PID" ]; then
        echo "   Process using port 3000: $PORT_3000_PID"
        PORT_3000_CMD=$(ps -p $PORT_3000_PID -o cmd= 2>/dev/null || echo "unknown")
        echo "   Command: $PORT_3000_CMD"
        
        # Check if it's a PM2 process
        if echo "$PORT_3000_CMD" | grep -q "next\|node\|pm2"; then
            echo -e "${YELLOW}   This appears to be a Node.js/Next.js process${NC}"
            echo "   Checking PM2 processes..."
            
            # Stop the frontend process properly
            if pm2 list | grep -q "guestpostnow-frontend"; then
                echo "   Stopping guestpostnow-frontend process..."
                pm2 stop guestpostnow-frontend || true
                sleep 2
                pm2 delete guestpostnow-frontend || true
                echo -e "${GREEN}   ✓ Stopped and deleted guestpostnow-frontend${NC}"
            fi
            
            # Kill any orphaned processes
            echo "   Killing orphaned process on port 3000..."
            kill -9 $PORT_3000_PID 2>/dev/null || true
            sleep 2
        fi
    fi
else
    echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

# 2. Check backend status
echo ""
echo "2. Checking backend status..."
if pm2 list | grep -q "guestpost-backend.*errored"; then
    echo -e "${RED}✗ Backend is in errored state${NC}"
    
    # Check backend directory
    if [ -d "/var/www/guestpostnow/guestpostnow-backend" ]; then
        BACKEND_DIR="/var/www/guestpostnow/guestpostnow-backend"
    elif [ -d "/var/www/guestpostnow/Backend" ]; then
        BACKEND_DIR="/var/www/guestpostnow/Backend"
    else
        echo -e "${RED}   Backend directory not found!${NC}"
        exit 1
    fi
    
    echo "   Backend directory: $BACKEND_DIR"
    
    # Delete errored process
    echo "   Deleting errored backend process..."
    pm2 delete guestpost-backend || true
    
    # Check if .env exists
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo -e "${YELLOW}   ⚠ .env file not found in backend${NC}"
        echo "   Please create .env file before starting backend"
    fi
    
    # Check if dist folder exists
    if [ ! -f "$BACKEND_DIR/dist/server.js" ]; then
        echo "   Building backend..."
        cd "$BACKEND_DIR"
        npm install
        npm run build
    fi
    
    # Start backend
    echo "   Starting backend..."
    cd "$BACKEND_DIR"
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start dist/server.js --name guestpost-backend
    fi
    echo -e "${GREEN}   ✓ Backend started${NC}"
fi

# 3. Check frontend status
echo ""
echo "3. Checking frontend status..."
if [ -d "/var/www/guestpostnow/guestpostnow-frontend" ]; then
    FRONTEND_DIR="/var/www/guestpostnow/guestpostnow-frontend"
    cd "$FRONTEND_DIR"
    
    # Check if process exists
    if pm2 list | grep -q "guestpostnow-frontend"; then
        FRONTEND_STATUS=$(pm2 jlist | grep -A 5 "guestpostnow-frontend" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo "   Frontend status: $FRONTEND_STATUS"
        
        if [ "$FRONTEND_STATUS" != "online" ]; then
            echo "   Restarting frontend..."
            pm2 restart guestpostnow-frontend || {
                echo "   Restart failed, deleting and starting fresh..."
                pm2 delete guestpostnow-frontend || true
                sleep 2
                
                # Ensure port 3000 is free
                PORT_PID=$(lsof -ti :3000 || echo "")
                if [ ! -z "$PORT_PID" ]; then
                    kill -9 $PORT_PID 2>/dev/null || true
                    sleep 2
                fi
                
                # Start fresh
                pm2 start npm --name guestpostnow-frontend -- start --cwd "$FRONTEND_DIR"
            }
        fi
    else
        echo "   Frontend process not found, starting..."
        
        # Ensure port 3000 is free
        PORT_PID=$(lsof -ti :3000 || echo "")
        if [ ! -z "$PORT_PID" ]; then
            kill -9 $PORT_PID 2>/dev/null || true
            sleep 2
        fi
        
        pm2 start npm --name guestpostnow-frontend -- start --cwd "$FRONTEND_DIR"
    fi
    
    echo -e "${GREEN}   ✓ Frontend process managed${NC}"
else
    echo -e "${YELLOW}   ⚠ Frontend directory not found${NC}"
fi

# 4. Save PM2 configuration
echo ""
echo "4. Saving PM2 configuration..."
pm2 save || true

# 5. Show final status
echo ""
echo "5. Final PM2 Status:"
echo "==================="
pm2 list

echo ""
echo "==================="
echo -e "${GREEN}✅ Server issues fixed!${NC}"
echo ""
echo "Check logs with:"
echo "  pm2 logs guestpost-backend"
echo "  pm2 logs guestpostnow-frontend"

