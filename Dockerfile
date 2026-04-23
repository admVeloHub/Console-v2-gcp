# Dockerfile para Cloud Run - Frontend React Console VeloHub
# VERSION: v1.7.1 | DATE: 2026-04-23 | AUTHOR: VeloHub Development Team
# CHANGELOG: v1.7.1 - Stage produção: copiar backend/config (loadFonteVerdadeEnv); evita crash ao iniciar no Cloud Run
# CHANGELOG: v1.7.0 - Sem credenciais/IDs reais nos ARG padrão; Cloud Build deve passar --build-arg
# CHANGELOG: v1.6.0 - Adicionado fallback para REACT_APP_GOOGLE_CLIENT_ID caso não seja passado como build arg

# Stage 1: Build da aplicação React
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências (package.json e package-lock.json)
COPY package.json package-lock.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build args para variáveis de ambiente do React
# IMPORTANTE: Estas variáveis são incorporadas no build do React durante 'npm run build'
# e não podem ser alteradas em runtime. Devem ser passadas como --build-arg durante o build do Docker.
#
# REACT_APP_GOOGLE_CLIENT_ID: OBRIGATÓRIO - Client ID do Google OAuth (deve ser passado como build arg)
# REACT_APP_AUTHORIZED_DOMAIN: Domínio autorizado para validação de email
# 
# Obrigatório em PRD: passar --build-arg no Cloud Build (Secret Manager / substituições).
ARG REACT_APP_API_URL=
ARG REACT_APP_GOOGLE_CLIENT_ID=
ARG REACT_APP_AUTHORIZED_DOMAIN=velotax.com.br

# Definir como variáveis de ambiente para o build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_AUTHORIZED_DOMAIN=$REACT_APP_AUTHORIZED_DOMAIN

# Build da aplicação React
RUN npm run build

# Stage 2: Produção - Servidor Express
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e package-lock.json para instalar apenas dependências de produção
COPY package.json package-lock.json ./

# Criar diretório backend
RUN mkdir -p backend

# Copiar servidor Express e config (loadFonteVerdadeEnv — obrigatório no primeiro require de server.js)
COPY backend/server.js ./backend/
COPY backend/config ./backend/config/

# Instalar apenas dependências de produção (Express e Helmet)
RUN npm ci --only=production

# Copiar build da aplicação React do stage anterior
COPY --from=builder /app/build ./build

# Variáveis de ambiente
ENV PORT=8080
ENV NODE_ENV=production

# Expor porta (Cloud Run usa PORT env var)
EXPOSE 8080

# Comando para iniciar servidor
CMD ["node", "backend/server.js"]

