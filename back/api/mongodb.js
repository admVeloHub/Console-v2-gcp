const { MongoClient } = require('mongodb');

// Configuração do MongoDB usando variáveis de ambiente do Vercel
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://REDACTED_ATLAS_URI';
const DB_NAME = process.env.DB_NAME || 'console_conteudo';

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido' });
    }

    try {
        const { collection, data } = req.body;

        if (!collection || !data) {
            return res.status(400).json({ 
                success: false, 
                message: 'Collection e data são obrigatórios' 
            });
        }

        // Conectar ao MongoDB
        const client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        console.log('Conectado ao MongoDB');

        const db = client.db(DB_NAME);
        const collectionRef = db.collection(collection);

        // Adicionar timestamp se não existir
        const dataWithTimestamp = {
            ...data,
            created_at: new Date(),
            timestamp: new Date().toISOString()
        };

        // Inserir dados
        const result = await collectionRef.insertOne(dataWithTimestamp);
        
        console.log(`Dados inseridos na collection ${collection}:`, result.insertedId);

        await client.close();

        return res.status(200).json({
            success: true,
            message: 'Dados inseridos com sucesso no MongoDB',
            insertedId: result.insertedId
        });

    } catch (error) {
        console.error('Erro ao conectar/inserir no MongoDB:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};
