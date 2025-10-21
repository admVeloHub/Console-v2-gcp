/**
 * Configuração MongoDB para VeloInsights
 * Schema otimizado para dados de ligações do %%pbx
 */

import { MongoClient } from 'mongodb'

// Configurações MongoDB
export const MONGODB_CONFIG = {
  // MongoDB Atlas (recomendado) ou Local
  url: process.env.MONGODB_URL || 'mongodb+srv://REDACTED_ATLAS_URI',
  database: 'console_analises',
  collections: {
    calls: 'calls',           // Dados de ligações
    pauses: 'pauses',         // Dados de pausas
    sync_logs: 'sync_logs',   // Logs de sincronização
    metrics: 'metrics',        // Métricas calculadas
    operators: 'operators',    // Dados dos operadores
    system_status: 'system_status' // Status do sistema
  }
}

// Schema para dados de ligações (calls)
export const CALL_SCHEMA = {
  call_id: String,           // ID único da ligação - Coluna U ✅
  colaboradorNome: String,   // Nome do colaborador - Coluna C ✅
  call_date: Date,          // Data da ligação - Coluna F ✅
  total_time: String,       // Tempo total em HH:MM:SS - Coluna O ✅
  wait_time: String,        // Tempo de espera em HH:MM:SS - Coluna M ✅
  time_in_ura: String,     // Tempo na URA em HH:MM:SS - Coluna L ✅
  status: String,           // Status da chamada - Coluna A ✅
  question_attendant: String, // Pergunta sobre atendente - Coluna AB ✅
  question_solution: String,  // Pergunta sobre solução - Coluna AC ✅
  queue_name: String,      // Nome da fila - Coluna K ✅
  recording_url: String,   // URL da gravação - Coluna B ✅
  created_at: Date,       // MongoDB ✅
  updated_at: Date        // MongoDB ✅
}

// Schema para dados de pausas (pauses)
export const PAUSE_SCHEMA = {
  colaboradorNome: String,  // Nome do colaborador (corrigido!)
  activity_name: String,   // Nome da atividade
  start_date: Date,       // Data de início
  start_time: String,     // Horário de início
  end_date: Date,         // Data de fim
  end_time: String,       // Horário de fim
  duration: Number,      // Duração em segundos
  pause_reason: String,   // Motivo da pausa
  created_at: Date,      // Quando foi inserido no MongoDB
  updated_at: Date       // Última atualização
}

// Schema para logs de sincronização
export const SYNC_LOG_SCHEMA = {
  timestamp: Date,         // Data/hora do log
  operation: String,       // Tipo de operação (sync, error, retry)
  status: String,         // Status (success, error, warning)
  message: String,        // Mensagem do log
  details: Object,        // Detalhes adicionais
  apiResponse: Object,    // Resposta da API (se aplicável)
  recordsProcessed: Number, // Quantidade de registros processados
  executionTime: Number   // Tempo de execução em ms
}

// Schema para métricas calculadas
export const METRICS_SCHEMA = {
  date: Date,             // Data das métricas
  operator: String,       // Operador (ou 'all' para geral)
  period: String,         // Período (daily, weekly, monthly)
  
  // Métricas principais
  totalCalls: Number,     // Total de ligações
  avgDuration: Number,    // Duração média
  avgRatingAttendance: Number, // Nota média atendimento
  avgRatingSolution: Number,   // Nota média solução
  
  // Metadados
  calculatedAt: Date,    // Quando foi calculado
  dataSource: String      // Fonte dos dados
}

// Schema para status do sistema
export const SYSTEM_STATUS_SCHEMA = {
  lastSync: Date,         // Última sincronização
  lastSuccessSync: Date,  // Última sincronização bem-sucedida
  lastErrorSync: Date,    // Última sincronização com erro
  syncStatus: String,     // Status atual (running, success, error)
  totalRecords: Number,   // Total de registros no sistema
  lastApiCall: Date,      // Última chamada à API
  apiStatus: String,      // Status da API (up, down, unknown)
  errorCount: Number,     // Contador de erros
  retryCount: Number      // Contador de tentativas
}

// Função para conectar ao MongoDB
export const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(MONGODB_CONFIG.url)
    await client.connect()
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db(MONGODB_CONFIG.database)
    
    // Criar índices para performance
    await createIndexes(db)
    
    return { client, db }
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error)
    throw error
  }
}

// Função para criar índices
const createIndexes = async (db) => {
  try {
    // Índices para collection de calls
    await db.collection(MONGODB_CONFIG.collections.calls).createIndex({ call_id: 1 }, { unique: true })
    await db.collection(MONGODB_CONFIG.collections.calls).createIndex({ call_date: 1 })
    await db.collection(MONGODB_CONFIG.collections.calls).createIndex({ colaboradorNome: 1 })
    await db.collection(MONGODB_CONFIG.collections.calls).createIndex({ created_at: 1 })
    
    // Índices para collection de pauses
    await db.collection(MONGODB_CONFIG.collections.pauses).createIndex({ colaboradorNome: 1 })
    await db.collection(MONGODB_CONFIG.collections.pauses).createIndex({ start_date: 1 })
    await db.collection(MONGODB_CONFIG.collections.pauses).createIndex({ activity_name: 1 })
    await db.collection(MONGODB_CONFIG.collections.pauses).createIndex({ created_at: 1 })
    
    // Índices para collection de sync_logs
    await db.collection(MONGODB_CONFIG.collections.sync_logs).createIndex({ timestamp: 1 })
    await db.collection(MONGODB_CONFIG.collections.sync_logs).createIndex({ status: 1 })
    
    // Índices para collection de metrics
    await db.collection(MONGODB_CONFIG.collections.metrics).createIndex({ date: 1, colaboradorNome: 1 })
    await db.collection(MONGODB_CONFIG.collections.metrics).createIndex({ period: 1 })
    
    console.log('✅ Índices criados com sucesso')
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error)
  }
}

export default MONGODB_CONFIG
