# Dockerfile para Cloud Run - Frontend React Console VeloHub
# VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

# Stage 1: Build da aplicação React
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências (package.json e package-lock.json)
COPY package.json package-lock.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação React
RUN npm run build

# Stage 2: Produção - Servidor Express
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json para instalar apenas dependências de produção
COPY package.json package-lock.json ./

# Criar diretório backend
RUN mkdir -p backend

# Copiar servidor Express
COPY backend/server.js ./backend/

# Instalar apenas dependências de produção (Express e Helmet)
RUN npm ci --only=production

# Copiar build da aplicação React do stage anterior
COPY --from=builder /app/build ./build

# Variáveis de ambiente
ENV PORT=8080
ENV NODE_ENV=production

# Expor porta (Cloud Run usa PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar servidor
CMD ["node", "backend/server.js"]

