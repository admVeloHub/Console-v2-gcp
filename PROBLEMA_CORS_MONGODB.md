# PROBLEMA: Erro de CORS e Conexão MongoDB

## Contexto
- Frontend: https://front-console.vercel.app
- Backend: API route no Vercel (`/api/mongodb`)
- MongoDB: Atlas com cluster `ClusterCentral`
- Database: `console_conteudo`

## Erro Atual
```
back-console.vercel.app/api/submit:1 
Failed to load resource: net::ERR_FAILED
app.js:184 Erro ao enviar dados: TypeError: Failed to fetch
```

## Configuração Atual

### Variáveis de Ambiente Vercel
```
DB_NAME = console_conteudo
MONGODB_URI = mongodb+srv://REDACTED_ATLAS_URI
NODE_ENV = production
```

### API Route (`api/mongodb.js`)
```javascript
const { MongoClient } = require('mongodb');

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

        const client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        console.log('Conectado ao MongoDB');

        const db = client.db(DB_NAME);
        const collectionRef = db.collection(collection);

        const dataWithTimestamp = {
            ...data,
            created_at: new Date(),
            timestamp: new Date().toISOString()
        };

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
```

### Frontend (`js/app.js`)
```javascript
const MONGODB_API_URL = '/api/mongodb';

async function submitData(collection, data) {
    try {
        showFeedback('loading');
        setTimeout(fadeOutForm, 300);
        
        const response = await fetch(MONGODB_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collection: collection,
                data: data
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Sucesso
            return true;
        } else {
            showErrorToast(result.message || 'Falha ao salvar dados no MongoDB');
            return false;
        }
    } catch (error) {
        console.error('Erro ao enviar dados para MongoDB:', error);
        showErrorToast('Erro de conexão com MongoDB. Tente novamente.');
        return false;
    }
}
```

## Problemas Identificados
1. **CORS**: Erro de CORS mesmo com headers configurados
2. **URL da API**: Frontend tentando acessar `back-console.vercel.app` ao invés de `/api/mongodb`
3. **Configuração Vercel**: Possível problema na configuração das API routes

## Solicitação
Por favor, ajude a resolver:
1. O erro de CORS
2. A conexão com MongoDB
3. A configuração correta do Vercel
4. Qualquer outro problema identificado

## Repositório
https://github.com/admVeloHub/front-console
