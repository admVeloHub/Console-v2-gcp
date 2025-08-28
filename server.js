require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3002;

// Configurações
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'console_conteudo';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware de segurança
app.use(helmet());

// CORS configurado para o frontend
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: {
        error: 'Muitas requisições. Tente novamente em 15 minutos.'
    }
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));

// Variáveis globais para conexão persistente
let mongoClient = null;
let mongoDb = null;

// Função para conectar ao MongoDB (conexão persistente)
async function connectDB() {
    try {
        if (!mongoClient) {
            console.log('🔗 Iniciando conexão MongoDB...');
            mongoClient = new MongoClient(MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            await mongoClient.connect();
            mongoDb = mongoClient.db(DB_NAME);
            console.log('✅ MongoDB conectado (conexão persistente)');
        }
        return { client: mongoClient, db: mongoDb };
    } catch (error) {
        console.error('❌ Erro MongoDB:', error);
        mongoClient = null;
        mongoDb = null;
        throw error;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoClient ? 'connected' : 'disconnected'
    });
});

// Rota raiz - redirecionar para documentação da API
app.get('/', (req, res) => {
    res.json({
        message: 'Console de Conteúdo - Backend API',
        version: '2.0.0',
        endpoints: {
            health: 'GET /health',
            test: 'GET /api/test',
            submit: 'POST /api/submit',
            data: 'GET /api/data/:collection'
        },
        documentation: 'Esta é uma API REST para o Console de Conteúdo'
    });
});

// API - Inserir dados
app.post('/api/submit', async (req, res) => {
    try {
        console.log('📥 Recebendo requisição POST /api/submit');
        console.log('📋 Body da requisição:', JSON.stringify(req.body, null, 2));
        
        const { collection, data } = req.body;
        
        if (!collection || !data) {
            console.log('❌ Dados obrigatórios não fornecidos');
            return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
        }

        console.log('🔗 Usando conexão MongoDB persistente...');
        // Usar conexão persistente
        const { db } = await connectDB();

        console.log(`📊 Inserindo na coleção: ${collection}`);
        const collectionObj = db.collection(collection);
        const result = await collectionObj.insertOne({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ Dados inseridos com sucesso. ID:', result.insertedId);
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('❌ Erro ao inserir:', error);
        res.status(500).json({ success: false, message: 'Erro interno: ' + error.message });
    }
});

// API - Buscar dados
app.get('/api/data/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        
        // Usar conexão persistente
        const { db } = await connectDB();

        const collectionObj = db.collection(collection);
        const data = await collectionObj.find({}).toArray();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ success: false, message: 'Erro interno: ' + error.message });
    }
});

// Rota de teste para verificar se a API está funcionando
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API funcionando!',
        timestamp: new Date().toISOString(),
        env: {
            hasMongoUri: !!MONGODB_URI,
            dbName: DB_NAME,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

// Função para fechar conexão MongoDB
async function closeDB() {
    if (mongoClient) {
        console.log('🔌 Fechando conexão MongoDB...');
        await mongoClient.close();
        mongoClient = null;
        mongoDb = null;
    }
}

// Inicialização
if (process.env.NODE_ENV !== 'production') {
    // Apenas para desenvolvimento local
    connectDB().then(() => {
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
        
        // Fechar conexão quando o servidor for encerrado
        process.on('SIGINT', async () => {
            console.log('\n🛑 Encerrando servidor...');
            await closeDB();
            server.close(() => {
                console.log('✅ Servidor encerrado');
                process.exit(0);
            });
        });
    });
} else {
    // Para produção (Vercel)
    const server = app.listen(PORT, () => {
        console.log(`🚀 Servidor pronto na porta ${PORT}`);
    });
    
    // Fechar conexão quando o servidor for encerrado
    process.on('SIGINT', async () => {
        console.log('\n🛑 Encerrando servidor...');
        await closeDB();
        server.close(() => {
            console.log('✅ Servidor encerrado');
            process.exit(0);
        });
    });
}
