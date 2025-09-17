// VERSION: v3.1.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { connectToDatabase, checkDatabaseHealth } = require('./config/database');
const { initializeCollections, getCollectionsStats } = require('./config/collections');
require('dotenv').config();

// Importar rotas
const artigosRoutes = require('./routes/artigos');
const velonewsRoutes = require('./routes/velonews');
const botPerguntasRoutes = require('./routes/botPerguntas');
const igpRoutes = require('./routes/igp');

// Importar middleware
const { checkMonitoringFunctions } = require('./middleware/monitoring');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.CORS_ORIGIN || 'https://front-console.vercel.app'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://front-console.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // máximo 100 requests por IP
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (página de monitoramento)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de monitoramento
app.use(checkMonitoringFunctions);

// Rotas da API
app.use('/api/artigos', artigosRoutes);
app.use('/api/velonews', velonewsRoutes);
app.use('/api/bot-perguntas', botPerguntasRoutes);
app.use('/api/igp', igpRoutes);

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    let dbHealth = { status: 'disabled', message: 'MongoDB não configurado' };
    let collectionsStats = {};
    
    // Verificar MongoDB apenas se não estiver no Vercel
    if (process.env.VERCEL !== '1') {
      dbHealth = await checkDatabaseHealth();
      collectionsStats = await getCollectionsStats();
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '3.1.1',
      environment: process.env.VERCEL === '1' ? 'vercel' : 'local',
      database: dbHealth,
      collections: collectionsStats
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      version: '3.1.1',
      error: error.message
    });
  }
});

// Rota raiz para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'Console de Conteúdo VeloHub API v3.1.1',
    status: 'OK',
    timestamp: new Date().toISOString(),
    monitor: '/monitor.html'
  });
});

// Rota para a página de monitoramento
app.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'monitor.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// WebSocket para monitoramento
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado ao Monitor Skynet');
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado do Monitor Skynet');
  });
});

// Função para emitir logs para o monitor
const emitLog = (level, message) => {
  io.emit('console-log', {
    level,
    message,
    timestamp: new Date().toISOString()
  });
};

// Função para emitir tráfego da API
const emitTraffic = (origin, status, message, details = null) => {
  io.emit('api-traffic', {
    origin,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });
};

// Função para emitir JSON atual
const emitJson = (data) => {
  io.emit('current-json', data);
};

// Tornar as funções disponíveis globalmente
global.emitLog = emitLog;
global.emitTraffic = emitTraffic;
global.emitJson = emitJson;

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB apenas se não estiver no Vercel
    if (process.env.VERCEL !== '1') {
      await connectToDatabase();
      await initializeCollections();
      console.log(`🗄️ MongoDB: Conectado`);
      console.log(`📊 Collections: Inicializadas`);
    } else {
      console.log(`🗄️ MongoDB: Modo Vercel (sem conexão)`);
    }
    
    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Console de Conteúdo VeloHub v3.1.1`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Monitor Skynet: http://localhost:${PORT}/monitor`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    // No Vercel, não fazer exit(1) para evitar crash
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

startServer();
