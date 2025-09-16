// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectToDatabase, checkDatabaseHealth } = require('./config/database');
require('dotenv').config();

// Importar rotas
const artigosRoutes = require('./routes/artigos');
const velonewsRoutes = require('./routes/velonews');
const botPerguntasRoutes = require('./routes/botPerguntas');
const igpRoutes = require('./routes/igp');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'public/build')));

// Rotas da API
app.use('/api/artigos', artigosRoutes);
app.use('/api/velonews', velonewsRoutes);
app.use('/api/bot-perguntas', botPerguntasRoutes);
app.use('/api/igp', igpRoutes);

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      error: error.message
    });
  }
});

// Servir React app para todas as rotas não-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

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
  }
};

startServer();
