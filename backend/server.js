/**
 * backend/server.js
 * Servidor Express para servir aplicação React no Cloud Run
 * 
 * VERSION: v1.2.0 | DATE: 2026-04-23 | AUTHOR: VeloHub Development Team
 * CHANGELOG: v1.2.0 - Dev: loadFonteVerdadeEnv antes de Express (FONTE DA VERDADE / VELOHUB_DOTENV_PATH)
 */

require('./config/loadFonteVerdadeEnv').loadFrom(__dirname);

const express = require('express');
const path = require('path');
const helmet = require('helmet');

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

// Servir arquivos estáticos do build React
app.use(express.static(path.join(__dirname, '../build'), {
  maxAge: '1y', // Cache estático por 1 ano
  etag: true
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

// Todas as outras rotas servem index.html (SPA - Single Page Application)
// Isso permite que o React Router funcione corretamente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
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

