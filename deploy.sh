#!/bin/bash
# Frontend deployment script for Advogada Parceira

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
SERVER="ubuntu@18.217.19.191"
KEY_PATH="/Users/gregoryoliveira/AP/admin.pem"
REMOTE_DIR="/home/ubuntu/ap-frontend-deploy"

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}    Advogada Parceira Frontend Deploy    ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Install NVM if not already installed
if ! command -v nvm &> /dev/null; then
    echo -e "${YELLOW}Installing NVM...${NC}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node.js LTS version
echo -e "${YELLOW}Setting up Node.js...${NC}"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

# Check if repository exists
if [ ! -d "." ]; then
    echo -e "${RED}Current directory not found. Aborting...${NC}"
    exit 1
fi

echo -e "${YELLOW}Building in current directory...${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci

# Create production .env file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating production environment file...${NC}"
    cp .env.example .env.production
    # Now we edit the file to set production values
    sed -i 's/REACT_APP_API_URL=.*/REACT_APP_API_URL=https:\/\/api.advogadaparceira.com.br\/api\/v1/' .env.production
    sed -i 's/REACT_APP_ENV=.*/REACT_APP_ENV=production/' .env.production
    sed -i 's/REACT_APP_ENABLE_MOCK_DATA=.*/REACT_APP_ENABLE_MOCK_DATA=false/' .env.production
fi

# Copy favicon files to public directory
echo -e "${YELLOW}Copying favicon files...${NC}"
mkdir -p public/favicon_io
cp -r src/assets/images/favicon_io/* public/favicon_io/

# Build the production version
echo -e "${YELLOW}Building production version...${NC}"
npm run build

# Copy build files to server
echo -e "${YELLOW}Copying build files to server...${NC}"
ssh -i "$KEY_PATH" "$SERVER" "rm -rf $REMOTE_DIR/* && mkdir -p $REMOTE_DIR"
scp -i "$KEY_PATH" -r build/* "$SERVER:$REMOTE_DIR/"

# Configure and restart nginx on the server
echo -e "${YELLOW}Configuring nginx on server...${NC}"
ssh -i "$KEY_PATH" "$SERVER" "sudo systemctl restart nginx"

echo -e "${GREEN}Deploy completed successfully!${NC}"
echo -e "${GREEN}Frontend is now available at: https://app.advogadaparceira.com.br${NC}" 