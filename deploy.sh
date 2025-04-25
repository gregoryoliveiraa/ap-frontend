#!/bin/bash
# Frontend deployment script for Advogada Parceira

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Build the production version
echo -e "${YELLOW}Building production version...${NC}"
npm run build

# Ensure nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing nginx...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Setup nginx configuration
echo -e "${YELLOW}Setting up nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/ap-frontend > /dev/null << 'EOF'
server {
    listen 80;
    server_name app.advogadaparceira.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name app.advogadaparceira.com.br;
    
    ssl_certificate /etc/letsencrypt/live/app.advogadaparceira.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.advogadaparceira.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/adp;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optional: Add caching headers for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
    
    # Optional: Limit request size
    client_max_body_size 10M;
    
    # Optional: Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
EOF

# Enable the site if not already enabled
if [ ! -f "/etc/nginx/sites-enabled/ap-frontend" ]; then
    echo -e "${YELLOW}Enabling nginx site...${NC}"
    sudo ln -s /etc/nginx/sites-available/ap-frontend /etc/nginx/sites-enabled/
fi

# Copy build files to the correct location
echo -e "${YELLOW}Copying build files to production directory...${NC}"
sudo rm -rf /var/www/adp/*
sudo cp -r build/* /var/www/adp/
sudo chown -R www-data:www-data /var/www/adp

# Test nginx configuration
echo -e "${YELLOW}Testing nginx configuration...${NC}"
sudo nginx -t

# Reload nginx
echo -e "${YELLOW}Reloading nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}Deploy completed successfully!${NC}"
echo -e "${GREEN}Frontend is now available at: https://app.advogadaparceira.com.br${NC}"

# Configurações
SERVER="ubuntu@18.217.19.191"
KEY_PATH="/Users/gregoryoliveira/AP/admin.pem"
REMOTE_DIR="/home/ubuntu/ap-frontend-deploy"

# Copy build files to server
echo -e "${YELLOW}Copying build files to server...${NC}"
ssh -i "$KEY_PATH" "$SERVER" "rm -rf $REMOTE_DIR/* && mkdir -p $REMOTE_DIR"
scp -i "$KEY_PATH" -r build/* "$SERVER:$REMOTE_DIR/"

echo -e "${GREEN}Deploy completed successfully!${NC}"
echo -e "${GREEN}Frontend is now available at: https://app.advogadaparceira.com.br${NC}" 