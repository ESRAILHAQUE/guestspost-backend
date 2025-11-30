#!/bin/bash

# Script to check which website/service is using which port

echo "🔍 Port Usage Check"
echo "==================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Common ports to check
PORTS=(3000 5000 80 443 8080 8000)

echo "📊 PM2 Processes Status:"
echo "------------------------"
pm2 list
echo ""

echo "🔌 Port Usage Details:"
echo "----------------------"

# Check each common port
for PORT in "${PORTS[@]}"; do
    echo ""
    echo -e "${BLUE}Port $PORT:${NC}"
    
    # Try lsof first
    if command -v lsof &> /dev/null; then
        LSOF_OUTPUT=$(lsof -i :$PORT 2>/dev/null)
        if [ ! -z "$LSOF_OUTPUT" ]; then
            echo "$LSOF_OUTPUT" | tail -n +2 | while IFS= read -r line; do
                PID=$(echo "$line" | awk '{print $2}')
                CMD=$(echo "$line" | awk '{print $1}')
                NAME=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
                USER=$(echo "$line" | awk '{print $3}')
                echo "   ├─ Process: $CMD (PID: $PID, User: $USER)"
                if [ ! -z "$PID" ]; then
                    FULL_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "N/A")
                    echo "   ├─ Command: $FULL_CMD"
                    
                    # Check if it's a PM2 process
                    if echo "$FULL_CMD" | grep -q "pm2\|node\|next"; then
                        echo -e "   └─ ${YELLOW}⚠ Node.js/PM2 process detected${NC}"
                    fi
                fi
            done
        else
            echo -e "   ${GREEN}✓ Port is free${NC}"
        fi
    # Fallback to netstat
    elif command -v netstat &> /dev/null; then
        NETSTAT_OUTPUT=$(netstat -tulnp 2>/dev/null | grep ":$PORT ")
        if [ ! -z "$NETSTAT_OUTPUT" ]; then
            echo "$NETSTAT_OUTPUT" | while IFS= read -r line; do
                PID=$(echo "$line" | awk '{print $7}' | cut -d'/' -f1)
                PROG=$(echo "$line" | awk '{print $7}' | cut -d'/' -f2)
                echo "   ├─ Process: $PROG (PID: $PID)"
                if [ ! -z "$PID" ] && [ "$PID" != "-" ]; then
                    FULL_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "N/A")
                    echo "   └─ Command: $FULL_CMD"
                fi
            done
        else
            echo -e "   ${GREEN}✓ Port is free${NC}"
        fi
    else
        echo -e "   ${YELLOW}⚠ Cannot check (lsof/netstat not available)${NC}"
    fi
done

echo ""
echo "📋 PM2 Process Details:"
echo "-----------------------"
pm2 jlist | grep -E '"name"|"pid"|"pm2_env"' | head -20

echo ""
echo "🌐 Service Mapping:"
echo "-------------------"

# Check frontend
echo -n "Frontend (Port 3000): "
if pm2 list | grep -q "guestpostnow-frontend\|guestpost-frontend"; then
    FRONTEND_NAME=$(pm2 list | grep "guestpostnow-frontend\|guestpost-frontend" | awk '{print $2}')
    FRONTEND_STATUS=$(pm2 list | grep "guestpostnow-frontend\|guestpost-frontend" | awk '{print $10}')
    echo -e "${GREEN}✓ Running${NC} (Process: $FRONTEND_NAME, Status: $FRONTEND_STATUS)"
    
    # Check if port 3000 is actually listening
    if lsof -i :3000 &> /dev/null || netstat -tuln 2>/dev/null | grep ":3000 " &> /dev/null; then
        echo -e "  ${GREEN}✓ Port 3000 is listening${NC}"
    else
        echo -e "  ${RED}✗ Port 3000 is NOT listening (process may have crashed)${NC}"
    fi
else
    echo -e "${RED}✗ Not running in PM2${NC}"
fi

# Check backend
echo -n "Backend (Port 5000): "
if pm2 list | grep -q "guestpost-backend\|guestpostnow-backend"; then
    BACKEND_NAME=$(pm2 list | grep "guestpost-backend\|guestpostnow-backend" | awk '{print $2}')
    BACKEND_STATUS=$(pm2 list | grep "guestpost-backend\|guestpostnow-backend" | awk '{print $10}')
    echo -e "${GREEN}✓ Running${NC} (Process: $BACKEND_NAME, Status: $BACKEND_STATUS)"
    
    # Check if port 5000 is actually listening
    if lsof -i :5000 &> /dev/null || netstat -tuln 2>/dev/null | grep ":5000 " &> /dev/null; then
        echo -e "  ${GREEN}✓ Port 5000 is listening${NC}"
    else
        echo -e "  ${RED}✗ Port 5000 is NOT listening (process may have crashed)${NC}"
    fi
else
    echo -e "${RED}✗ Not running in PM2${NC}"
fi

# Check web server (Nginx/Apache)
echo -n "Web Server (Port 80/443): "
if lsof -i :80 &> /dev/null || netstat -tuln 2>/dev/null | grep ":80 " &> /dev/null; then
    HTTP_PROCESS=$(lsof -i :80 2>/dev/null | tail -1 | awk '{print $1}' || netstat -tlnp 2>/dev/null | grep ":80 " | awk '{print $7}' | cut -d'/' -f2)
    echo -e "${GREEN}✓ Running${NC} (Process: $HTTP_PROCESS)"
else
    echo -e "${YELLOW}⚠ Port 80 not listening${NC}"
fi

if lsof -i :443 &> /dev/null || netstat -tuln 2>/dev/null | grep ":443 " &> /dev/null; then
    HTTPS_PROCESS=$(lsof -i :443 2>/dev/null | tail -1 | awk '{print $1}' || netstat -tlnp 2>/dev/null | grep ":443 " | awk '{print $7}' | cut -d'/' -f2)
    echo -e "  ${GREEN}✓ HTTPS (443) running${NC} (Process: $HTTPS_PROCESS)"
fi

echo ""
echo "🔗 Active Connections Summary:"
echo "-------------------------------"
if command -v ss &> /dev/null; then
    ss -tulpn | grep -E ":(3000|5000|80|443)" | head -10
elif command -v netstat &> /dev/null; then
    netstat -tulnp 2>/dev/null | grep -E ":(3000|5000|80|443)" | head -10
fi

echo ""
echo "📂 Directory Locations:"
echo "-----------------------"
echo -n "Frontend: "
if [ -d "/var/www/guestpostnow/guestpostnow-frontend" ]; then
    echo -e "${GREEN}/var/www/guestpostnow/guestpostnow-frontend${NC}"
elif [ -d "/var/www/guestpostnow/frontend" ]; then
    echo -e "${GREEN}/var/www/guestpostnow/frontend${NC}"
else
    echo -e "${RED}Not found${NC}"
fi

echo -n "Backend: "
if [ -d "/var/www/guestpostnow/guestpostnow-backend" ]; then
    echo -e "${GREEN}/var/www/guestpostnow/guestpostnow-backend${NC}"
elif [ -d "/var/www/guestpostnow/Backend" ]; then
    echo -e "${GREEN}/var/www/guestpostnow/Backend${NC}"
else
    echo -e "${RED}Not found${NC}"
fi

echo ""
echo "✅ Check complete!"

