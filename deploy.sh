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
if [ ! -d "ap-frontend-repo" ]; then
    echo -e "${YELLOW}Cloning the repository...${NC}"
    git clone https://github.com/gregoryoliveiraa/ap-frontend.git ap-frontend-repo
    cd ap-frontend-repo
else
    echo -e "${YELLOW}Updating the repository...${NC}"
    cd ap-frontend-repo
    git pull origin main
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci

# Create production .env file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating production environment file...${NC}"
    cp .env.example .env.production
    # Now we edit the file to set production values
    sed -i 's/REACT_APP_API_URL=.*/REACT_APP_API_URL=http:\/\/api.advogadaparceira.com.br\/api\/v1/' .env.production
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
    
    root /home/ubuntu/ap-frontend-repo/build;
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

# Enable the site
if [ ! -L /etc/nginx/sites-enabled/ap-frontend ]; then
    echo -e "${YELLOW}Enabling the site...${NC}"
    sudo ln -s /etc/nginx/sites-available/ap-frontend /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Set up a service to serve the frontend files
echo -e "${YELLOW}Setting up a service to serve the frontend files...${NC}"
PM2_PATH=$(which pm2)
cd /home/ubuntu/ap-frontend-repo
$PM2_PATH stop ap-frontend 2>/dev/null || true
$PM2_PATH delete ap-frontend 2>/dev/null || true

# Testing Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
sudo nginx -t

# Restart Nginx
echo -e "${YELLOW}Restarting Nginx...${NC}"
sudo systemctl restart nginx

# Setup PM2 to start on system reboot
echo -e "${YELLOW}Setting up PM2 to start on system reboot...${NC}"
$PM2_PATH startup
sudo env PATH=$PATH:$HOME/.nvm/versions/node/$(node -v)/bin $PM2_PATH startup systemd -u ubuntu --hp /home/ubuntu
$PM2_PATH save

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}The frontend is now available at: http://app.advogadaparceira.com.br${NC}" 