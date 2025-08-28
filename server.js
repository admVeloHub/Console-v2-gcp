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

// Conexão MongoDB
let db;

async function connectDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ MongoDB conectado');
    } catch (error) {
        console.error('❌ Erro MongoDB:', error);
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
        const { collection, data } = req.body;
        
        if (!collection || !data) {
            return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
        }

        const collectionObj = db.collection(collection);
        const result = await collectionObj.insertOne({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Erro ao inserir:', error);
        res.status(500).json({ success: false, message: 'Erro interno' });
    }
});

// API - Buscar dados
app.get('/api/data/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const collectionObj = db.collection(collection);
        const data = await collectionObj.find({}).toArray();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ success: false, message: 'Erro interno' });
    }
});

// Inicialização
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
});
