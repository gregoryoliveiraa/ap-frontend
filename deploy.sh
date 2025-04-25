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

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
SERVER="ubuntu@18.217.19.191"
KEY_PATH="/Users/gregoryoliveira/AP/admin.pem"
REMOTE_DIR="/home/ubuntu/ap-frontend-deploy"
LOCAL_BUILD_DIR="build"

echo -e "${YELLOW}Iniciando processo de deploy otimizado...${NC}"

# Verificar se o diretório de build existe
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
  echo -e "${RED}Diretório de build não encontrado. Executando build...${NC}"
  npm run build
  if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao construir o aplicativo. Abortando deploy.${NC}"
    exit 1
  fi
fi

# Criar diretório temporário para comparação
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Criando diretório temporário: $TEMP_DIR${NC}"

# Baixar arquivos atuais do servidor para comparação
echo -e "${YELLOW}Baixando arquivos atuais do servidor para comparação...${NC}"
ssh -i "$KEY_PATH" "$SERVER" "mkdir -p $TEMP_DIR && tar -czf - -C $REMOTE_DIR ." | tar -xzf - -C "$TEMP_DIR"

# Função para verificar se um arquivo foi modificado
check_file_modified() {
  local file=$1
  local remote_file="$TEMP_DIR/$file"
  
  # Se o arquivo não existe no servidor, ele foi modificado
  if [ ! -f "$remote_file" ]; then
    return 0
  fi
  
  # Comparar timestamps
  local local_mtime=$(stat -f %m "$LOCAL_BUILD_DIR/$file" 2>/dev/null || stat -c %Y "$LOCAL_BUILD_DIR/$file")
  local remote_mtime=$(stat -f %m "$remote_file" 2>/dev/null || stat -c %Y "$remote_file")
  
  if [ "$local_mtime" -gt "$remote_mtime" ]; then
    return 0
  fi
  
  # Comparar tamanhos
  local local_size=$(stat -f %z "$LOCAL_BUILD_DIR/$file" 2>/dev/null || stat -c %s "$LOCAL_BUILD_DIR/$file")
  local remote_size=$(stat -f %z "$remote_file" 2>/dev/null || stat -c %s "$remote_file")
  
  if [ "$local_size" -ne "$remote_size" ]; then
    return 0
  fi
  
  return 1
}

# Lista de arquivos modificados
MODIFIED_FILES=()

# Verificar cada arquivo no diretório de build
echo -e "${YELLOW}Verificando arquivos modificados...${NC}"
for file in $(find "$LOCAL_BUILD_DIR" -type f); do
  relative_file=${file#$LOCAL_BUILD_DIR/}
  if check_file_modified "$relative_file"; then
    MODIFIED_FILES+=("$relative_file")
    echo -e "${GREEN}Arquivo modificado: $relative_file${NC}"
  fi
done

# Se não houver arquivos modificados, verificar se o .env foi modificado
if [ ${#MODIFIED_FILES[@]} -eq 0 ]; then
  echo -e "${YELLOW}Nenhum arquivo modificado encontrado.${NC}"
  
  # Verificar se o .env foi modificado
  if check_file_modified ".env"; then
    MODIFIED_FILES+=(".env")
    echo -e "${GREEN}Arquivo .env modificado${NC}"
  fi
fi

# Se houver arquivos modificados, fazer upload apenas deles
if [ ${#MODIFIED_FILES[@]} -gt 0 ]; then
  echo -e "${YELLOW}Fazendo upload de ${#MODIFIED_FILES[@]} arquivos modificados...${NC}"
  
  for file in "${MODIFIED_FILES[@]}"; do
    echo -e "${YELLOW}Upload: $file${NC}"
    scp -i "$KEY_PATH" "$LOCAL_BUILD_DIR/$file" "$SERVER:$REMOTE_DIR/$file"
  done
  
  echo -e "${GREEN}Upload concluído com sucesso!${NC}"
else
  echo -e "${GREEN}Nenhum arquivo precisa ser atualizado.${NC}"
fi

# Limpar diretório temporário
rm -rf "$TEMP_DIR"
echo -e "${GREEN}Deploy otimizado concluído!${NC}" 