# Guia de Deploy do Frontend - Advogada Parceira

Este guia descreve os passos necessários para implantar corretamente o frontend da plataforma Advogada Parceira em um servidor de produção.

## Requisitos

- Ubuntu Server 22.04 LTS ou superior
- Node.js 18.x ou superior
- Nginx
- Acesso ao servidor via SSH
- Domínio configurado apontando para o IP do servidor

## Passos para Deploy

### 1. Preparação do Ambiente

```bash
# Instalar dependências necessárias
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git

# Instalar Node.js (usando NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 2. Clonar o Repositório

```bash
# Criar diretório para o projeto
mkdir -p ~/ap-frontend-deploy
cd ~

# Clonar o repositório
git clone https://github.com/gregoryoliveiraa/ap-frontend.git ap-frontend-source
cd ap-frontend-source
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.production` na raiz do projeto:

```bash
cat > .env.production << EOF
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
EOF
```

### 4. Construir o Projeto

```bash
# Instalar dependências
npm install

# Criar a build de produção
npm run build

# Copiar os arquivos de build para o diretório de deploy
cp -r build/* ~/ap-frontend-deploy/
```

### 5. Configurar o Nginx

Crie um arquivo de configuração para o Nginx:

```bash
sudo tee /etc/nginx/sites-available/ap-frontend << EOF
server {
    listen 80;
    server_name app.advogadaparceira.com.br;
    
    root /home/ubuntu/ap-frontend-deploy;
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
```

### 6. Habilitar o Site e Configurar SSL

```bash
# Criar link simbólico para habilitar o site
sudo ln -s /etc/nginx/sites-available/ap-frontend /etc/nginx/sites-enabled/

# Remover o site padrão se necessário
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar a configuração do Nginx
sudo nginx -t

# Se a configuração estiver correta, reiniciar o Nginx
sudo systemctl restart nginx

# Configurar SSL com Let's Encrypt
sudo certbot --nginx -d app.advogadaparceira.com.br
```

### 7. Ajustar Permissões

```bash
# Garantir que os arquivos estão acessíveis ao Nginx
sudo chown -R www-data:www-data ~/ap-frontend-deploy
sudo chmod -R 755 ~/ap-frontend-deploy
```

## Verificações e Resolução de Problemas

### Verificar se o Frontend está Funcionando

```bash
# Verificar resposta da página inicial
curl -I http://app.advogadaparceira.com.br

# Verificar logs do Nginx em caso de erros
sudo tail -n 50 /var/log/nginx/ap-frontend-error.log
```

### Problemas Comuns e Soluções

#### Páginas em Branco / Rotas Não Funcionando

Pode ser um problema no React Router. Certifique-se que:

1. A configuração do Nginx inclui a linha `try_files $uri $uri/ /index.html;` para redirecionar todas as rotas para o arquivo index.html.
2. Não há erros de JavaScript no console do navegador.
3. No arquivo de produção, verifique se a rota base está correta no arquivo `index.html`.

```bash
# Verificar a configuração HTML
grep -r "base href" ~/ap-frontend-deploy/index.html

# Se necessário, adicionar a base href
sudo sed -i 's/<head>/<head><base href="\/">/' ~/ap-frontend-deploy/index.html
```

#### Falha nas Chamadas à API

Se o frontend não conseguir se comunicar com o backend:

1. Verifique se a URL da API está correta em `.env.production`
2. Adicione um proxy reverso no Nginx para evitar problemas de CORS
3. Teste a conectividade à API:

```bash
# Verificar se a API está respondendo
curl http://api.advogadaparceira.com.br/api/v1
```

#### Permissões Incorretas

Se o Nginx não conseguir acessar os arquivos:

```bash
# Aplicar permissões recursivamente
sudo find ~/ap-frontend-deploy -type d -exec chmod 755 {} \;
sudo find ~/ap-frontend-deploy -type f -exec chmod 644 {} \;
sudo chown -R www-data:www-data ~/ap-frontend-deploy
```

## Atualização do Frontend

Para atualizar a aplicação com uma nova versão:

```bash
cd ~/ap-frontend-source
git pull origin main
npm install
npm run build

# Fazer backup da versão atual
sudo mv ~/ap-frontend-deploy ~/ap-frontend-deploy.bak

# Criar novo diretório e copiar arquivos
mkdir -p ~/ap-frontend-deploy
cp -r build/* ~/ap-frontend-deploy/

# Ajustar permissões
sudo chown -R www-data:www-data ~/ap-frontend-deploy
sudo chmod -R 755 ~/ap-frontend-deploy

# Não é necessário reiniciar o Nginx para uma atualização normal
```

## Monitoramento e Logs

Para monitorar o funcionamento do frontend:

```bash
# Monitorar logs de acesso em tempo real
sudo tail -f /var/log/nginx/ap-frontend-access.log

# Monitorar logs de erro em tempo real
sudo tail -f /var/log/nginx/ap-frontend-error.log
```

## Estrutura Final

Após o deploy, você deve ter a seguinte estrutura:

```
/home/ubuntu/
  ├── ap-frontend-source/        # Código fonte do projeto
  │   ├── .git/
  │   ├── src/
  │   ├── public/
  │   ├── build/
  │   └── ...
  │
  └── ap-frontend-deploy/        # Arquivos de produção
      ├── index.html
      ├── static/
      │   ├── css/
      │   ├── js/
      │   └── media/
      └── ...

/etc/nginx/
  ├── sites-available/
  │   └── ap-frontend
  │
  └── sites-enabled/
      └── ap-frontend -> ../sites-available/ap-frontend
``` 