/**
 * backend/server.js
 * Servidor Express para servir aplicação React no Cloud Run
 * 
 * VERSION: v1.3.0 | DATE: 2026-04-23 | AUTHOR: VeloHub Development Team
 * CHANGELOG: v1.3.0 - Injetar window.__VELOHUB_RUNTIME_CONFIG__ no index.html a partir de process.env
 *  (Cloud Run) para REACT_APP_GOOGLE_CLIENT_ID / REACT_APP_API_URL / REACT_APP_AUTHORIZED_DOMAIN.
 *  express.static com index:false para a raiz cair no handler SPA (documento com injeção).
 * CHANGELOG: v1.2.0 - Dev: loadFonteVerdadeEnv antes de Express (FONTE DA VERDADE / VELOHUB_DOTENV_PATH)
 */

require('./config/loadFonteVerdadeEnv').loadFrom(__dirname);

const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const INDEX_PATH = path.join(__dirname, '../build/index.html');
let indexHtmlCache = null;

/**
 * Lê o template do build (uma vez) e injeta script antes de </head> com variáveis do contêiner.
 * Nomes alinhados ao que o front já usa (REACT_APP_*); GOOGLE_ID_CONSOLE = mesmo valor, nome do segredo.
 */
function buildIndexHtml() {
  if (!indexHtmlCache) {
    if (!fs.existsSync(INDEX_PATH)) {
      throw new Error('build/index.html não encontrado. Execute npm run build antes de iniciar o servidor.');
    }
    indexHtmlCache = fs.readFileSync(INDEX_PATH, 'utf8');
  }
  const cfg = {};
  const gid =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_ID_CONSOLE ||
    '';
  if (gid) cfg.REACT_APP_GOOGLE_CLIENT_ID = gid;
  if (process.env.REACT_APP_AUTHORIZED_DOMAIN) {
    cfg.REACT_APP_AUTHORIZED_DOMAIN = process.env.REACT_APP_AUTHORIZED_DOMAIN;
  }
  if (process.env.REACT_APP_API_URL) {
    cfg.REACT_APP_API_URL = process.env.REACT_APP_API_URL;
  }
  if (process.env.REACT_APP_SKYNET_API_URL) {
    cfg.REACT_APP_SKYNET_API_URL = process.env.REACT_APP_SKYNET_API_URL;
  }
  const script = `<script>window.__VELOHUB_RUNTIME_CONFIG__=${JSON.stringify(cfg)}<\/script>`;
  if (indexHtmlCache.includes('</head>')) {
    return indexHtmlCache.replace('</head>', `${script}</head>`);
  }
  return script + indexHtmlCache;
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para React Router funcionar
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Permite popup do Google OAuth funcionar corretamente
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware para parsing JSON (caso necessário para futuras APIs)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do build React (index: false = GET / entrega HTML via handler com injeção de env)
app.use(express.static(path.join(__dirname, '../build'), {
  maxAge: '1y', // Cache estático por 1 ano
  etag: true,
  index: false
}));

// Rota para health check (Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: PORT
  });
});

// Rota para monitoramento (compatibilidade com backend)
app.get('/monitor.html', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'frontend-console',
    timestamp: new Date().toISOString()
  });
});

// Rotas client-side: entregar index com __VELOHUB_RUNTIME_CONFIG__ (valores do contêiner Cloud Run)
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.type('html');
  res.send(buildIndexHtml());
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

