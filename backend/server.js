<<<<<<< HEAD
// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
=======
// VERSION: v3.1.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
<<<<<<< HEAD
const { connectToDatabase, checkDatabaseHealth } = require('./config/database');
=======
const http = require('http');
const { Server } = require('socket.io');
const { connectToDatabase, checkDatabaseHealth } = require('./config/database');
const { initializeCollections, getCollectionsStats } = require('./config/collections');
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
require('dotenv').config();

// Importar rotas
const artigosRoutes = require('./routes/artigos');
const velonewsRoutes = require('./routes/velonews');
const botPerguntasRoutes = require('./routes/botPerguntas');
const botAnalisesRoutes = require('./routes/botAnalises');
const igpRoutes = require('./routes/igp');

<<<<<<< HEAD
const app = express();
=======
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
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
<<<<<<< HEAD
    ? ['https://yourdomain.com'] 
=======
    ? [process.env.CORS_ORIGIN || 'https://front-console.vercel.app'] 
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
<<<<<<< HEAD
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
=======
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // máximo 100 requests por IP
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'public/build')));
=======
// Servir arquivos estáticos (página de monitoramento)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de monitoramento
app.use(checkMonitoringFunctions);
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780

// Rotas da API
app.use('/api/artigos', artigosRoutes);
app.use('/api/velonews', velonewsRoutes);
app.use('/api/bot-perguntas', botPerguntasRoutes);
app.use('/api/bot-analises', botAnalisesRoutes);
app.use('/api/igp', igpRoutes);

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
<<<<<<< HEAD
    const dbHealth = await checkDatabaseHealth();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      database: dbHealth
=======
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
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
<<<<<<< HEAD
      version: '3.0.0',
=======
      version: '3.1.1',
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
      error: error.message
    });
  }
});

<<<<<<< HEAD
// Servir React app para todas as rotas não-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
=======
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
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

<<<<<<< HEAD
// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectToDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Console de Conteúdo VeloHub v3.0.0`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ MongoDB: Conectado`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
=======
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
>>>>>>> bdce0b48cb5cbb7b2cf78af9d0929933c5816780
  }
};

startServer();
