#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Graduate Location Map...${NC}\n"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Port $port is in use by PID $pid${NC}"
        echo -e "${YELLOW}   Killing process on port $port...${NC}"
        kill -9 $pid 2>/dev/null
        
        # Wait a moment and check again
        sleep 1
        local pid_again=$(lsof -ti:$port)
        if [ -z "$pid_again" ]; then
            echo -e "${GREEN}✅ Port $port is now free${NC}"
        else
            echo -e "${RED}❌ Failed to free port $port${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
    fi
}

# Clear ports
echo -e "${YELLOW}Clearing ports...${NC}"
kill_port 3000  # Frontend port
kill_port 3001  # Backend port
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Start the application
echo -e "${GREEN}🚀 Starting application...${NC}"
echo -e "${YELLOW}   Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}   Backend:  http://localhost:3001${NC}"
echo -e "${YELLOW}   Press Ctrl+C to stop${NC}\n"

npm run dev

