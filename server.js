require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'console_conteudo';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

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

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/artigos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'artigos.html'));
});

app.get('/velonews', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'velonews.html'));
});

app.get('/bot-perguntas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bot-perguntas.html'));
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
