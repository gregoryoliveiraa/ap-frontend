#!/bin/bash

# Landing page deployment script for Advogada Parceira

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}    Advogada Parceira Landing Deploy    ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if repository exists
if [ ! -d "advogadaparceira-repo" ]; then
    echo -e "${YELLOW}Cloning the repository...${NC}"
    git clone https://github.com/gregoryoliveiraa/advogadaparceira.git advogadaparceira-repo
    cd advogadaparceira-repo
else
    echo -e "${YELLOW}Updating the repository...${NC}"
    cd advogadaparceira-repo
    git pull origin main
fi

# Ensure nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing nginx...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Setup nginx configuration
echo -e "${YELLOW}Setting up nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/landing > /dev/null << 'EOF'
server {
    listen 80;
    server_name advogadaparceira.com.br www.advogadaparceira.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name advogadaparceira.com.br www.advogadaparceira.com.br;
    
    ssl_certificate /etc/letsencrypt/live/advogadaparceira.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/advogadaparceira.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/advogadaparceira;
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
if [ ! -f "/etc/nginx/sites-enabled/landing" ]; then
    echo -e "${YELLOW}Enabling nginx site...${NC}"
    sudo ln -s /etc/nginx/sites-available/landing /etc/nginx/sites-enabled/
fi

# Copy files to the correct location
echo -e "${YELLOW}Copying files to production directory...${NC}"
sudo rm -rf /var/www/advogadaparceira/*
sudo cp -r * /var/www/advogadaparceira/
sudo chown -R www-data:www-data /var/www/advogadaparceira

# Test nginx configuration
echo -e "${YELLOW}Testing nginx configuration...${NC}"
sudo nginx -t

# Reload nginx
echo -e "${YELLOW}Reloading nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}Deploy completed successfully!${NC}"
echo -e "${GREEN}Landing page is now available at: https://advogadaparceira.com.br${NC}" 