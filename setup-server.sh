#!/bin/bash

# Server Setup Script for Backend
# This script helps set up the backend on the server

set -e

echo "🔧 Backend Server Setup Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_DIR="/var/www/guestpostnow"
BACKEND_DIR="$BASE_DIR/Backend"

# Check if base directory exists
echo -n "1. Checking /var/www/guestpostnow directory... "
if [ -d "$BASE_DIR" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    
    # List contents
    echo "   Contents:"
    ls -la "$BASE_DIR" | tail -n +2 | awk '{print "   - " $9}'
else
    echo -e "${RED}✗ Not found${NC}"
    echo "   Creating directory..."
    mkdir -p "$BASE_DIR"
fi

# Check if Backend directory exists
echo ""
echo -n "2. Checking Backend directory... "
if [ -d "$BACKEND_DIR" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    cd "$BACKEND_DIR"
    
    # Check if it's a git repository
    if [ -d ".git" ]; then
        echo -e "   ${GREEN}✓ Git repository found${NC}"
        echo "   Current branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
        echo "   Remote: $(git remote get-url origin 2>/dev/null || echo 'not set')"
    else
        echo -e "   ${YELLOW}⚠ Not a git repository${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Not found${NC}"
    echo ""
    echo "   Backend directory doesn't exist."
    echo "   Choose an option:"
    echo "   1) Clone from GitHub"
    echo "   2) Create empty directory"
    echo ""
    read -p "   Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "   Cloning backend repository..."
        cd "$BASE_DIR"
        
        # Check if GitHub URL is available
        GITHUB_URL="https://github.com/ESRAILHAQUE/guestspost-backend.git"
        echo "   Repository: $GITHUB_URL"
        
        if git clone "$GITHUB_URL" Backend 2>/dev/null; then
            echo -e "   ${GREEN}✓ Cloned successfully${NC}"
            cd "$BACKEND_DIR"
        else
            echo -e "   ${RED}✗ Clone failed${NC}"
            echo "   Please clone manually:"
            echo "   cd $BASE_DIR"
            echo "   git clone $GITHUB_URL Backend"
            exit 1
        fi
    else
        echo "   Creating Backend directory..."
        mkdir -p "$BACKEND_DIR"
        cd "$BACKEND_DIR"
    fi
fi

# Check if we're in Backend directory now
if [ ! -f "package.json" ]; then
    echo ""
    echo -e "${YELLOW}⚠ package.json not found. This might not be the backend directory.${NC}"
    echo "   Current directory: $(pwd)"
    echo ""
    echo "   Please verify the backend is cloned or initialized."
    exit 1
fi

echo ""
echo "3. Backend setup checklist:"
echo "   - Directory: $(pwd)"
echo "   - package.json: $(test -f package.json && echo '✓ Found' || echo '✗ Missing')"
echo "   - .env file: $(test -f .env && echo '✓ Found' || echo '✗ Missing (create from env.example)')"
echo "   - node_modules: $(test -d node_modules && echo '✓ Installed' || echo '✗ Not installed')"
echo "   - dist folder: $(test -d dist && echo '✓ Built' || echo '✗ Not built')"

echo ""
echo "================================"
echo "Next steps:"
echo ""
echo "1. Setup environment:"
echo "   cp env.example .env"
echo "   nano .env"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Build:"
echo "   npm run build"
echo ""
echo "4. Deploy:"
echo "   ./deploy.sh"
echo ""
echo "Or run diagnostic:"
echo "   ./check-backend.sh"

