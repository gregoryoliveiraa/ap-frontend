#!/bin/bash
# Script de deploy melhorado para o frontend da Advogada Parceira
# Corrige problemas de permissão, configuração e rotas

set -e  # Exit immediately if a command exits with a non-zero status

# Códigos de cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Advogada Parceira Frontend Deploy     ${NC}"
echo -e "${GREEN}   Versão 2.0 - Deploy Melhorado         ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Diretórios
SOURCE_DIR="/home/ubuntu/ap-frontend-source"
DEPLOY_DIR="/home/ubuntu/ap-frontend-deploy"
BACKUP_DIR="/home/ubuntu/ap-frontend-deploy-backup-$(date +%Y%m%d_%H%M%S)"

# Verificar se está em execução como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Este script precisa ser executado como root ou com sudo${NC}"
  exit 1
fi

# Função para verificar erros
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro: $1${NC}"
    exit 1
  fi
}

# 1. Atualizar o sistema e instalar dependências
echo -e "${YELLOW}Atualizando o sistema e instalando dependências...${NC}"
apt update
apt install -y nginx certbot python3-certbot-nginx git curl
check_error "Falha ao instalar dependências"

# 2. Configurar o Node.js (usando NVM para o usuário ubuntu)
echo -e "${YELLOW}Configurando Node.js...${NC}"
if [ ! -d "/home/ubuntu/.nvm" ]; then
  sudo -u ubuntu bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
  check_error "Falha ao instalar NVM"
fi

# Carregar NVM e instalar Node.js
sudo -u ubuntu bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 18 && nvm alias default 18'
check_error "Falha ao instalar Node.js"

# 3. Criar backup do diretório de deploy atual (se existir)
if [ -d "$DEPLOY_DIR" ]; then
  echo -e "${YELLOW}Criando backup do deploy atual...${NC}"
  mv "$DEPLOY_DIR" "$BACKUP_DIR"
  check_error "Falha ao criar backup"
  echo -e "${GREEN}Backup criado em: $BACKUP_DIR${NC}"
fi

# 4. Clonar ou atualizar o repositório
if [ ! -d "$SOURCE_DIR" ]; then
  echo -e "${YELLOW}Clonando o repositório...${NC}"
  sudo -u ubuntu mkdir -p "$SOURCE_DIR"
  sudo -u ubuntu git clone https://github.com/gregoryoliveiraa/ap-frontend.git "$SOURCE_DIR"
  check_error "Falha ao clonar o repositório"
else
  echo -e "${YELLOW}Atualizando o repositório...${NC}"
  cd "$SOURCE_DIR"
  sudo -u ubuntu git fetch
  sudo -u ubuntu git reset --hard origin/main
  check_error "Falha ao atualizar o repositório"
fi

# 5. Configurar variáveis de ambiente
echo -e "${YELLOW}Configurando variáveis de ambiente...${NC}"
sudo -u ubuntu bash -c "cat > $SOURCE_DIR/.env.production << EOF
# API Configuration
REACT_APP_API_URL=http://api.advogadaparceira.com.br/api/v1

# Authentication
REACT_APP_TOKEN_KEY=ap_auth_token

# Feature Flags
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_ANALYTICS=false

# Environment
REACT_APP_ENV=production

# UI Configuration
REACT_APP_DEFAULT_LANGUAGE=pt-BR
EOF"
check_error "Falha ao criar arquivo .env.production"

# 6. Instalar dependências e criar build
echo -e "${YELLOW}Instalando dependências e construindo a aplicação...${NC}"
cd "$SOURCE_DIR"
sudo -u ubuntu bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && npm install'
check_error "Falha ao instalar dependências do projeto"

sudo -u ubuntu bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && npm run build'
check_error "Falha ao construir a aplicação"

# 7. Criar diretório de deploy e copiar arquivos
echo -e "${YELLOW}Preparando diretório de deploy...${NC}"
sudo -u ubuntu mkdir -p "$DEPLOY_DIR"
sudo -u ubuntu cp -r "$SOURCE_DIR/build/"* "$DEPLOY_DIR/"
check_error "Falha ao copiar arquivos para diretório de deploy"

# 8. Adicionar base href ao HTML se necessário
echo -e "${YELLOW}Verificando e ajustando a configuração HTML...${NC}"
if ! grep -q '<base href="/">' "$DEPLOY_DIR/index.html"; then
  sed -i 's/<head>/<head><base href="\/">/' "$DEPLOY_DIR/index.html"
  check_error "Falha ao adicionar base href"
fi

# 9. Configurar permissões corretas
echo -e "${YELLOW}Configurando permissões dos arquivos...${NC}"
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
chown -R www-data:www-data "$DEPLOY_DIR"
check_error "Falha ao configurar permissões"

# 10. Configurar Nginx
echo -e "${YELLOW}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/ap-frontend << EOF
server {
    listen 80;
    server_name app.advogadaparceira.com.br;
    
    root $DEPLOY_DIR;
    index index.html;
    
    # Serve static files directly and with proper cache headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
        access_log off;
        try_files \$uri =404;
    }
    
    # For all other routes, serve index.html for client-side routing to handle
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests to the backend server
    location /api/ {
        proxy_pass http://api.advogadaparceira.com.br;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Limit request size
    client_max_body_size 10M;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # Logs
    access_log /var/log/nginx/ap-frontend-access.log;
    error_log /var/log/nginx/ap-frontend-error.log;
}
EOF
check_error "Falha ao criar arquivo de configuração do Nginx"

# 11. Habilitar o site e verificar configuração
echo -e "${YELLOW}Habilitando o site...${NC}"
if [ ! -L /etc/nginx/sites-enabled/ap-frontend ]; then
  ln -sf /etc/nginx/sites-available/ap-frontend /etc/nginx/sites-enabled/
fi

# Remover o site padrão se existir
if [ -L /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

# Testar configuração do Nginx
echo -e "${YELLOW}Testando configuração do Nginx...${NC}"
nginx -t
check_error "Configuração do Nginx está incorreta"

# 12. Reiniciar Nginx
echo -e "${YELLOW}Reiniciando Nginx...${NC}"
systemctl restart nginx
check_error "Falha ao reiniciar Nginx"

# 13. Configurar SSL com Let's Encrypt (opcional)
echo -e "${YELLOW}Deseja configurar SSL com Let's Encrypt? (y/n)${NC}"
read -p "Opção: " ssl_option
if [ "$ssl_option" = "y" ] || [ "$ssl_option" = "Y" ]; then
  echo -e "${YELLOW}Configurando SSL com Let's Encrypt...${NC}"
  certbot --nginx -d app.advogadaparceira.com.br
  check_error "Falha ao configurar SSL"
fi

# 14. Verificação final
echo -e "${YELLOW}Verificando se o site está respondendo...${NC}"
curl -I http://app.advogadaparceira.com.br
check_error "O site não está respondendo. Verifique os logs."

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}   Deploy do Frontend concluído com sucesso!      ${NC}"
echo -e "${GREEN}   Acesse: http://app.advogadaparceira.com.br     ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${YELLOW}Para verificar os logs do frontend:${NC}"
echo -e "sudo tail -f /var/log/nginx/ap-frontend-error.log"
echo ""
echo -e "${YELLOW}Para verificar as requisições:${NC}"
echo -e "sudo tail -f /var/log/nginx/ap-frontend-access.log" 