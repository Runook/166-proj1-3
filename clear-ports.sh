#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Clearing ports 3000 and 3001...${NC}\n"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Port $port is in use by PID $pid${NC}"
        kill -9 $pid 2>/dev/null
        sleep 0.5
        
        # Verify
        local pid_again=$(lsof -ti:$port)
        if [ -z "$pid_again" ]; then
            echo -e "${GREEN}✅ Port $port cleared${NC}"
        else
            echo -e "${RED}❌ Failed to clear port $port${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
    fi
}

kill_port 3000
kill_port 3001

echo -e "\n${GREEN}✨ Done!${NC}"

