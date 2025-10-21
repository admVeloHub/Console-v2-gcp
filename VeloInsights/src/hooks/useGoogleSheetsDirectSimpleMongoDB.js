import { useState, useEffect, useCallback } from 'react'
import { processarDados } from '../utils/dataProcessor'

const MONGODB_API_URL = 'http://localhost:3001'

// Hook modificado para usar APENAS MongoDB no dashboard principal
export const useGoogleSheetsDirectSimple = () => {
  const [data, setData] = useState([])
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [mongoStatus, setMongoStatus] = useState(null)

  // Função para buscar dados do MongoDB
  const fetchFromMongoDB = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 Buscando dados APENAS do MongoDB (Dashboard Principal)...')

      // Buscar dados do MongoDB
      const response = await fetch(`${MONGODB_API_URL}/api/get-data`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Dados obtidos do MongoDB:', result)

      // Buscar TODOS os dados (139.457 registros!)
      const sampleResponse = await fetch(`${MONGODB_API_URL}/api/sample-calls?limit=150000`)
      const sampleData = await sampleResponse.json()

      console.log('📊 TODOS os dados carregados:', sampleData.calls?.length || 0)
      console.log('📊 Total esperado: 139.457 registros')

      // Converter dados do MongoDB para formato esperado pelo processador
      const convertedData = convertMongoDBToSpreadsheetFormat(sampleData.calls || [])
      
      // Processar dados
      const processedData = await processarDadosAssincrono(convertedData, true)
      
      setData(processedData.dadosProcessados || [])
      setOperatorMetrics(processedData.metricasOperadores || {})
      setRankings(processedData.rankings || [])
      setMongoStatus(result)
      
      return processedData

    } catch (error) {
      console.error('❌ Erro ao buscar dados do MongoDB:', error)
      setError(error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Função para converter dados MongoDB para formato de planilha
  const convertMongoDBToSpreadsheetFormat = (mongoCalls) => {
    console.log('🔄 Convertendo dados MongoDB para formato de planilha...')
    
    // Criar cabeçalho (primeira linha)
    const header = [
      'Audio E Transcrições', 'Operador', 'Data', 'Hora', 'Data Atendimento', 'Hora Atendimento',
      'Cliente', 'Telefone', 'Motivo', 'Fila', 'Tempo Na Ura', 'Tempo De Espera', 'Tempo Total',
      'Status', 'Tempo Total HH:MM:SS', 'Tempo De Espera HH:MM:SS', 'Tempo Na Ura HH:MM:SS',
      'Observações', 'Avaliação', 'Id Ligação', 'Id Ligação', 'Id Ligação', 'Id Ligação',
      'Id Ligação', 'Id Ligação', 'Id Ligação', 'Id Ligação', 'Pergunta2 1 PERGUNTA ATENDENTE',
      'Pergunta2 2 PERGUNTA SOLUCAO'
    ]

    // Converter chamadas para formato de planilha
    const spreadsheetRows = mongoCalls.map(call => [
      call.recording_url || '', // Coluna A - Audio E Transcrições
      call.colaboradorNome || 'Sistema/Automático', // Coluna B - Operador
      '', // Coluna C - Data (vazio)
      '', // Coluna D - Hora (vazio)
      call.call_date ? new Date(call.call_date).toLocaleDateString('pt-BR') : '', // Coluna E - Data Atendimento
      '', // Coluna F - Hora Atendimento (vazio)
      '', // Coluna G - Cliente (vazio)
      '', // Coluna H - Telefone (vazio)
      '', // Coluna I - Motivo (vazio)
      call.queue_name || 'Sistema', // Coluna J - Fila
      call.time_in_ura || '00:00:00', // Coluna K - Tempo Na Ura
      call.wait_time || '00:00:00', // Coluna L - Tempo De Espera
      call.total_time || '00:00:00', // Coluna M - Tempo Total
      '', // Coluna N - Status (vazio)
      call.total_time || '00:00:00', // Coluna O - Tempo Total HH:MM:SS
      call.wait_time || '00:00:00', // Coluna P - Tempo De Espera HH:MM:SS
      call.time_in_ura || '00:00:00', // Coluna Q - Tempo Na Ura HH:MM:SS
      '', // Coluna R - Observações (vazio)
      '', // Coluna S - Avaliação (vazio)
      call.call_id || '', // Coluna T - Id Ligação
      call.call_id || '', // Coluna U - Id Ligação
      '', '', '', '', '', '', // Colunas V-Z (vazias)
      call.question_attendant || '0', // Coluna AA - Pergunta2 1 PERGUNTA ATENDENTE
      call.question_solution || '0' // Coluna AB - Pergunta2 2 PERGUNTA SOLUCAO
    ])

    const result = [header, ...spreadsheetRows]
    console.log(`✅ Convertidos ${mongoCalls.length} registros MongoDB para formato de planilha`)
    
    return result
  }

  // Função para processamento assíncrono otimizado
  const processarDadosAssincrono = async (dados, processAllRecords = false) => {
    return new Promise((resolve) => {
      console.log(`⚡ Iniciando processamento de ${dados.length} registros...`)
      
      setTimeout(() => {
        const startTime = performance.now()
        const resultado = processarDados(dados, processAllRecords)
        const endTime = performance.now()
        
        console.log(`✅ Processamento concluído em ${(endTime - startTime).toFixed(2)}ms`)
        resolve(resultado)
      }, 0)
    })
  }

  // Função para buscar dados por período
  const fetchLast60Days = async () => {
    console.log('🔄 Buscando dados dos últimos 60 dias do MongoDB...')
    return await fetchFromMongoDB()
  }

  // Função para buscar dataset completo
  const fetchFullDataset = async () => {
    console.log('🔄 Buscando dataset completo do MongoDB...')
    return await fetchFromMongoDB()
  }

  // Função para verificar status do MongoDB
  const checkMongoDBStatus = async () => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/api/status`)
      
      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.status}`)
      }

      const status = await response.json()
      setMongoStatus(status)
      
      console.log('📊 Status do MongoDB:', status)
      return status

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error)
      setError(error.message)
      return null
    }
  }

  // Simular login (já que estamos usando MongoDB)
  useEffect(() => {
    const userData = localStorage.getItem('veloinsights_user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setIsLoggedIn(true)
      console.log('✅ Usuário já logado - usando MongoDB')
      
      // Carregar dados do MongoDB
      fetchFromMongoDB()
    } else {
      console.log('❌ Usuário não logado')
    }
  }, [])

  return {
    data,
    operatorMetrics,
    rankings,
    isLoading,
    error,
    isLoggedIn,
    user,
    mongoStatus,
    fetchLast60Days,
    fetchFullDataset,
    checkMongoDBStatus,
    // Métricas calculadas
    totalCalls: mongoStatus?.calls || 0,
    totalPauses: mongoStatus?.pauses || 0,
    totalRecords: mongoStatus?.totalRecords || 0,
    isConnected: mongoStatus?.status === 'connected'
  }
}

export default useGoogleSheetsDirectSimple
