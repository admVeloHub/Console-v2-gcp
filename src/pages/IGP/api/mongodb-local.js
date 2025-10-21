import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Configuração MongoDB Local
const MONGODB_URI = 'mongodb://localhost:27017/console_analises'

let client = null
let db = null

// Conectar ao MongoDB
async function connectToMongoDB() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI)
      await client.connect()
      db = client.db('console_analises')
      console.log('✅ Conectado ao MongoDB Local')
    }
    return { client, db }
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB Local:', error)
    throw error
  }
}

// Endpoint para salvar chamadas
app.post('/api/save-calls', async (req, res) => {
  try {
    const { calls, clearExisting = false } = req.body
    
    if (!calls || !Array.isArray(calls)) {
      return res.status(400).json({ error: 'Dados de chamadas inválidos' })
    }
    
    const { db } = await connectToMongoDB()
    const callsCollection = db.collection('calls')
    
    let result
    if (clearExisting) {
      // Limpar coleção existente
      await callsCollection.deleteMany({})
      console.log('🗑️ Chamadas existentes removidas')
    }
    
    // Inserir novas chamadas
    if (calls.length > 0) {
      result = await callsCollection.insertMany(calls)
      console.log(`✅ ${result.insertedCount} chamadas inseridas`)
    }
    
    res.json({
      success: true,
      callsSaved: result?.insertedCount || 0,
      message: `${result?.insertedCount || 0} chamadas salvas no MongoDB Local`
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar chamadas:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para obter dados
app.get('/api/get-data', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    const callsCollection = db.collection('calls')
    
    const calls = await callsCollection.find({}).toArray()
    
    res.json({
      success: true,
      calls: calls,
      total: calls.length
    })
    
  } catch (error) {
    console.error('❌ Erro ao obter dados:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint de status
app.get('/api/status', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    const callsCollection = db.collection('calls')
    
    const totalCalls = await callsCollection.countDocuments()
    
    res.json({
      success: true,
      connected: true,
      database: 'console_analises',
      collections: {
        calls: totalCalls
      },
      message: 'MongoDB Local conectado com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    res.status(500).json({ 
      success: false,
      connected: false,
      error: error.message 
    })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API MongoDB Local rodando na porta ${PORT}`)
  console.log('📊 Endpoints disponíveis:')
  console.log('   POST /api/save-calls - Salvar chamadas')
  console.log('   GET  /api/get-data - Obter dados')
  console.log('   GET  /api/status - Status do MongoDB')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...')
  if (client) {
    await client.close()
    console.log('✅ Conexão MongoDB fechada')
  }
  process.exit(0)
})
