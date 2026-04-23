// VERSION: v1.2.0 | DATE: 2026-04-23 — Bootstrap FONTE DA VERDADE; URI Mongo só via env
import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'
import cron from 'node-cron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
require('../config/loadFonteVerdadeEnv.cjs').loadFrom(__dirname)

function getMongoUri() {
  const u = process.env.MONGODB_URI || process.env.MONGO_ENV || process.env.MONGODB_URL
  if (!u || !String(u).trim()) {
    throw new Error('MONGODB_URI, MONGO_ENV ou MONGODB_URL deve estar definido.')
  }
  return u.trim()
}

const app = express()
const PORT = 3002 // Porta diferente para evitar conflitos

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Configuração da API da 55
const API_55_CONFIG = {
  baseUrl: process.env.API_55_BASE_URL || 'https://api.55pbx.com', // URL base da API da 55
  apiKey: process.env.API_55_KEY || '', // Chave da API da 55
  username: process.env.API_55_USERNAME || '', // Usuário da API da 55
  password: process.env.API_55_PASSWORD || '', // Senha da API da 55
  endpoints: {
    calls: '/api/calls', // Endpoint para chamadas
    pauses: '/api/pauses', // Endpoint para pausas
    auth: '/api/auth/login' // Endpoint de autenticação
  }
}

let client = null
let db = null
let api55Token = null

// Conectar ao MongoDB
async function connectToMongoDB() {
  try {
    if (!client) {
      client = new MongoClient(getMongoUri())
      await client.connect()
      db = client.db('console_analises')
      console.log('✅ Conectado ao MongoDB Atlas')
    }
    return { client, db }
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error)
    throw error
  }
}

// Autenticar com a API da 55
async function authenticateWith55API() {
  try {
    console.log('🔐 Autenticando com a API da 55...')
    
    const authResponse = await fetch(`${API_55_CONFIG.baseUrl}${API_55_CONFIG.endpoints.auth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: API_55_CONFIG.username,
        password: API_55_CONFIG.password,
        apiKey: API_55_CONFIG.apiKey
      })
    })
    
    if (!authResponse.ok) {
      throw new Error(`Erro na autenticação: ${authResponse.status}`)
    }
    
    const authData = await authResponse.json()
    api55Token = authData.token || authData.access_token
    
    console.log('✅ Autenticado com a API da 55')
    return api55Token
    
  } catch (error) {
    console.error('❌ Erro na autenticação com API da 55:', error)
    throw error
  }
}

// Buscar dados da API da 55
async function fetchDataFrom55API(endpoint, date = null) {
  try {
    if (!api55Token) {
      await authenticateWith55API()
    }
    
    let url = `${API_55_CONFIG.baseUrl}${endpoint}`
    if (date) {
      url += `?date=${date}`
    }
    
    console.log(`🔄 Buscando dados de ${endpoint}...`)
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${api55Token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, reautenticar
        await authenticateWith55API()
        return fetchDataFrom55API(endpoint, date)
      }
      throw new Error(`Erro na API da 55: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ Dados obtidos de ${endpoint}: ${data.length || 0} registros`)
    
    return data
    
  } catch (error) {
    console.error(`❌ Erro ao buscar dados de ${endpoint}:`, error)
    throw error
  }
}

// Converter dados da API da 55 para formato MongoDB
function convert55DataToMongoFormat(data, type) {
  try {
    const convertedData = []
    
    for (const item of data) {
      if (type === 'calls') {
        const call = {
          call_id: item.id || item.call_id || `CALL_${Date.now()}_${Math.random()}`,
          operator_name: item.operator || item.operator_name || 'Unknown',
          call_date: new Date(item.date || item.call_date || new Date()),
          start_time: item.start_time || '00:00:00',
          end_time: item.end_time || '00:00:00',
          total_time: item.duration || item.total_time || 0,
          wait_time: item.wait_time || 0,
          time_in_ura: item.ura_time || item.time_in_ura || 0,
          question_attendant: item.question_attendant || '0',
          question_solution: item.question_solution || '0',
          queue_name: item.queue || item.queue_name || 'Unknown',
          recording_url: item.recording || item.recording_url || '',
          created_at: new Date(),
          updated_at: new Date()
        }
        convertedData.push(call)
      } else if (type === 'pauses') {
        const pause = {
          operator_name: item.operator || item.operator_name || 'Unknown',
          activity_name: item.activity || item.activity_name || 'Unknown',
          start_date: new Date(item.start_date || new Date()),
          start_time: item.start_time || '00:00:00',
          end_date: new Date(item.end_date || new Date()),
          end_time: item.end_time || '00:00:00',
          duration: item.duration || 0,
          pause_reason: item.reason || item.pause_reason || 'Unknown',
          created_at: new Date(),
          updated_at: new Date()
        }
        convertedData.push(pause)
      }
    }
    
    return convertedData
    
  } catch (error) {
    console.error('❌ Erro ao converter dados:', error)
    throw error
  }
}

// Sincronizar dados da API da 55
async function syncDataFrom55API(date = null) {
  try {
    console.log('🔄 Iniciando sincronização com API da 55...')
    
    const { db } = await connectToMongoDB()
    
    // Buscar dados de chamadas
    const callsData = await fetchDataFrom55API(API_55_CONFIG.endpoints.calls, date)
    const convertedCalls = convert55DataToMongoFormat(callsData, 'calls')
    
    // Buscar dados de pausas
    const pausesData = await fetchDataFrom55API(API_55_CONFIG.endpoints.pauses, date)
    const convertedPauses = convert55DataToMongoFormat(pausesData, 'pauses')
    
    let callsSaved = 0
    let pausesSaved = 0
    
    // Salvar chamadas
    if (convertedCalls.length > 0) {
      const callsResult = await db.collection('IGP_chamadas').insertMany(convertedCalls)
      callsSaved = callsResult.insertedCount
      console.log(`✅ ${callsSaved} chamadas salvas`)
    }
    
    // Salvar pausas
    if (convertedPauses.length > 0) {
      const pausesResult = await db.collection('pauses').insertMany(convertedPauses)
      pausesSaved = pausesResult.insertedCount
      console.log(`✅ ${pausesSaved} pausas salvas`)
    }
    
    // Log da sincronização
    await db.collection('sync_logs').insertOne({
      date: new Date(),
      source: '55_api',
      calls_synced: callsSaved,
      pauses_synced: pausesSaved,
      status: 'success',
      created_at: new Date()
    })
    
    console.log(`🎉 Sincronização concluída: ${callsSaved} chamadas, ${pausesSaved} pausas`)
    
    return { callsSaved, pausesSaved }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    
    // Log do erro
    try {
      const { db } = await connectToMongoDB()
      await db.collection('sync_logs').insertOne({
        date: new Date(),
        source: '55_api',
        calls_synced: 0,
        pauses_synced: 0,
        status: 'error',
        error: error.message,
        created_at: new Date()
      })
    } catch (logError) {
      console.error('❌ Erro ao salvar log:', logError)
    }
    
    throw error
  }
}

// Endpoint para sincronização manual
app.post('/api/sync-55', async (req, res) => {
  try {
    const { date } = req.body
    
    const result = await syncDataFrom55API(date)
    
    res.json({
      success: true,
      ...result,
      message: 'Sincronização com API da 55 concluída'
    })
    
  } catch (error) {
    console.error('❌ Erro na sincronização manual:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Endpoint para status da API da 55
app.get('/api/55-status', async (req, res) => {
  try {
    const { db } = await connectToMongoDB()
    
    const callsCount = await db.collection('IGP_chamadas').countDocuments()
    const pausesCount = await db.collection('pauses').countDocuments()
    const lastSync = await db.collection('sync_logs').findOne(
      { source: '55_api' },
      { sort: { date: -1 } }
    )
    
    res.json({
      success: true,
      status: 'connected',
      calls: callsCount,
      pauses: pausesCount,
      lastSync: lastSync?.date || null,
      api55Token: api55Token ? 'authenticated' : 'not_authenticated'
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Endpoint para testar conexão com API da 55
app.get('/api/test-55-connection', async (req, res) => {
  try {
    await authenticateWith55API()
    
    res.json({
      success: true,
      message: 'Conexão com API da 55 estabelecida',
      token: api55Token ? 'obtained' : 'not_obtained'
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Sincronização automática diária às 6:00
cron.schedule('0 6 * * *', async () => {
  try {
    console.log('🕕 Executando sincronização automática diária...')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateString = yesterday.toISOString().split('T')[0]
    
    await syncDataFrom55API(dateString)
    
  } catch (error) {
    console.error('❌ Erro na sincronização automática:', error)
  }
})

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 API 55 Integration rodando na porta ${PORT}`)
  console.log('📊 Endpoints disponíveis:')
  console.log('   POST /api/sync-55 - Sincronização manual')
  console.log('   GET  /api/55-status - Status da API da 55')
  console.log('   GET  /api/test-55-connection - Testar conexão')
  console.log('⏰ Sincronização automática: Diária às 6:00')
})
