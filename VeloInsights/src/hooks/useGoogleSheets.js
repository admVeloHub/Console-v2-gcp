/**
 * Hook para integração com Google Sheets
 * Substitui o sistema de upload de arquivos
 */

import { useState, useEffect, useCallback } from 'react'
import { SPREADSHEET_ID, SHEET_RANGE, COLUMN_MAPPING, CACHE_CONFIG } from '../config/googleSheets'

export const useGoogleSheets = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [operatorMetrics, setOperatorMetrics] = useState([])
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gapi, setGapi] = useState(null)

  // Inicializar Google API
  useEffect(() => {
    const initializeGapi = async () => {
      try {
        // Carregar Google API
        if (!window.gapi) {
          const script = document.createElement('script')
          script.src = 'https://apis.google.com/js/api.js'
          script.onload = () => {
            window.gapi.load('client:auth2', () => {
              setGapi(window.gapi)
            })
          }
          document.head.appendChild(script)
        } else {
          setGapi(window.gapi)
        }
      } catch (error) {
        console.error('Erro ao inicializar Google API:', error)
        setErrors(prev => [...prev, 'Erro ao inicializar Google API'])
      }
    }

    initializeGapi()
  }, [])

  // Configurar cliente OAuth2
  const initializeAuth = useCallback(async () => {
    if (!gapi) return false

    // Verificar se as credenciais estão configuradas
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    
    if (!clientId || false) {
      console.warn('⚠️ Credenciais do Google não configuradas. Modo demo ativo.')
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env!'])
      return false
    }

    try {
      const initConfig = {
        clientId: clientId,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly'
      }
      
      // Adicionar API Key apenas se estiver configurada
      if (apiKey && apiKey !== 'sua_api_key_aqui') {
        initConfig.apiKey = apiKey
      }
      
      await gapi.client.init(initConfig)

      const authInstance = gapi.auth2.getAuthInstance()
      setIsAuthenticated(authInstance.isSignedIn.get())
      
      return authInstance
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error)
      setErrors(prev => [...prev, 'Erro ao configurar autenticação'])
      return false
    }
  }, [gapi])

  // Fazer login
  const signIn = useCallback(async () => {
    if (!gapi) return false

    // Verificar credenciais antes de tentar fazer login
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    
    if (!clientId || false) {
      setErrors(prev => [...prev, '❌ Configure as credenciais do Google no arquivo .env primeiro!'])
      return false
    }

    try {
      const authInstance = await initializeAuth()
      if (!authInstance) return false

      const user = await authInstance.signIn()
      setIsAuthenticated(true)
      return user
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      setErrors(prev => [...prev, 'Erro ao fazer login no Google'])
      return false
    }
  }, [gapi, initializeAuth])

  // Fazer logout
  const signOut = useCallback(async () => {
    if (!gapi) return

    try {
      const authInstance = gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      setIsAuthenticated(false)
      setData([])
      setMetrics(null)
      setOperatorMetrics([])
      setRankings([])
      setOperators([])
      
      // Limpar cache
      localStorage.removeItem(CACHE_CONFIG.key)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }, [gapi])

  // Buscar dados da planilha
  const fetchSheetData = useCallback(async () => {
    if (!gapi || !isAuthenticated) {
      await signIn()
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      // Verificar cache primeiro
      const cachedData = getCachedData()
      if (cachedData) {
        setData(cachedData.data)
        setMetrics(cachedData.metrics)
        setOperatorMetrics(cachedData.operatorMetrics)
        setRankings(cachedData.rankings)
        setOperators(cachedData.operators)
        setIsLoading(false)
        return
      }

      // Buscar dados da planilha
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: SHEET_RANGE,
      })

      const rows = response.result.values
      if (!rows || rows.length === 0) {
        throw new Error('Nenhum dado encontrado na planilha')
      }

      // Processar dados
      const processedData = processSheetData(rows)
      setData(processedData.data)
      setMetrics(processedData.metrics)
      setOperatorMetrics(processedData.operatorMetrics)
      setRankings(processedData.rankings)
      setOperators(processedData.operators)

      // Salvar no cache
      cacheData(processedData)

    } catch (error) {
      console.error('Erro ao buscar dados da planilha:', error)
      setErrors(prev => [...prev, `Erro ao buscar dados: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }, [gapi, isAuthenticated, signIn])

  // Processar dados da planilha
  const processSheetData = (rows) => {
    try {
      // Primeira linha são os cabeçalhos
      const headers = rows[0]
      const dataRows = rows.slice(1)

      // Encontrar índices das colunas
      const columnIndices = {}
      Object.entries(COLUMN_MAPPING).forEach(([key, columnName]) => {
        const index = headers.findIndex(header => 
          header && header.toLowerCase().includes(columnName.toLowerCase())
        )
        if (index !== -1) {
          columnIndices[key] = index
        }
      })

      // Converter dados
      const processedData = dataRows.map((row, index) => {
        const record = {
          id: index,
          date: row[columnIndices.date] || null,
          operator: row[columnIndices.operator] || 'Não informado',
          duration_minutes: parseFloat(row[columnIndices.duration]) || 0,
          rating_attendance: parseFloat(row[columnIndices.ratingAttendance]) || null,
          rating_solution: parseFloat(row[columnIndices.ratingSolution]) || null,
          call_status: row[columnIndices.callStatus] || 'Atendida',
          disconnection: row[columnIndices.disconnection] || null,
          pause_duration: parseFloat(row[columnIndices.pauseDuration]) || 0,
          pause_reason: row[columnIndices.pauseReason] || null,
          pause_date: row[columnIndices.pauseDate] || null,
          avg_logged_time: parseFloat(row[columnIndices.avgLoggedTime]) || 0,
          avg_paused_time: parseFloat(row[columnIndices.avgPausedTime]) || 0,
          call_count: 1, // Cada linha representa uma chamada
          original_data: Object.fromEntries(
            headers.map((header, i) => [header, row[i]])
          )
        }

        return record
      }).filter(record => record.date && record.operator)

      // Calcular métricas
      const metrics = calculateMetrics(processedData)
      const operatorMetrics = calculateOperatorMetrics(processedData)
      const rankings = calculateRankings(operatorMetrics)
      const operators = [...new Set(processedData.map(r => r.operator))]

      return {
        data: processedData,
        metrics,
        operatorMetrics,
        rankings,
        operators
      }

    } catch (error) {
      console.error('Erro ao processar dados:', error)
      throw new Error('Erro ao processar dados da planilha')
    }
  }

  // Funções de cálculo (importadas do metricsCalculator)
  const calculateMetrics = (data) => {
    if (!data || data.length === 0) {
      return {
        totalCalls: 0,
        avgDuration: 0,
        avgRatingAttendance: 0,
        avgRatingSolution: 0,
        avgPauseTime: 0,
        totalOperators: 0,
        dataPeriod: { start: null, end: null }
      }
    }

    const validData = data.filter(record => 
      record.date && record.operator && record.duration_minutes >= 0
    )

    if (validData.length === 0) {
      return {
        totalCalls: 0,
        avgDuration: 0,
        avgRatingAttendance: 0,
        avgRatingSolution: 0,
        avgPauseTime: 0,
        totalOperators: 0,
        dataPeriod: { start: null, end: null }
      }
    }

    const totalCalls = validData.reduce((sum, record) => sum + (record.call_count || 0), 0)
    const totalDuration = validData.reduce((sum, record) => sum + (record.duration_minutes || 0), 0)
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

    const attendanceRatings = validData
      .map(record => record.rating_attendance)
      .filter(rating => rating !== null && rating !== undefined)
    
    const solutionRatings = validData
      .map(record => record.rating_solution)
      .filter(rating => rating !== null && rating !== undefined)

    const avgRatingAttendance = attendanceRatings.length > 0 
      ? attendanceRatings.reduce((sum, rating) => sum + rating, 0) / attendanceRatings.length 
      : 0

    const avgRatingSolution = solutionRatings.length > 0 
      ? solutionRatings.reduce((sum, rating) => sum + rating, 0) / solutionRatings.length 
      : 0

    const pauseTimes = validData
      .map(record => record.avg_paused_time)
      .filter(time => time > 0)

    const avgPauseTime = pauseTimes.length > 0 
      ? pauseTimes.reduce((sum, time) => sum + time, 0) / pauseTimes.length 
      : 0

    const uniqueOperators = new Set(validData.map(record => record.operator))
    const totalOperators = uniqueOperators.size

    const dates = validData
      .map(record => new Date(record.date))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a - b)

    const dataPeriod = {
      start: dates.length > 0 ? dates[0].toISOString().split('T')[0] : null,
      end: dates.length > 0 ? dates[dates.length - 1].toISOString().split('T')[0] : null
    }

    const callStatuses = {}
    let abandonedCalls = 0
    
    validData.forEach(record => {
      const status = record.call_status || 'Atendida'
      const duration = record.duration_minutes || 0
      
      callStatuses[status] = (callStatuses[status] || 0) + 1
      
      const isAbandoned = 
        status.toLowerCase().includes('abandon') ||
        status.toLowerCase().includes('desconect') ||
        (duration < 0.5 && !record.rating_attendance) ||
        status.toLowerCase().includes('cancel')
      
      if (isAbandoned) {
        abandonedCalls += (record.call_count || 0)
      }
    })

    const abandonmentRate = totalCalls > 0 ? (abandonedCalls / totalCalls) * 100 : 0

    return {
      totalCalls,
      avgDuration: parseFloat(avgDuration.toFixed(2)),
      avgRatingAttendance: parseFloat(avgRatingAttendance.toFixed(2)),
      avgRatingSolution: parseFloat(avgRatingSolution.toFixed(2)),
      avgPauseTime: parseFloat(avgPauseTime.toFixed(2)),
      totalOperators,
      dataPeriod,
      totalRecords: validData.length,
      abandonmentRate: parseFloat(abandonmentRate.toFixed(2)),
      callStatuses
    }
  }

  const calculateOperatorMetrics = (data) => {
    if (!data || data.length === 0) return []

    const operatorGroups = {}
    
    data.forEach(record => {
      const operator = record.operator || 'Não informado'
      
      if (!operatorGroups[operator]) {
        operatorGroups[operator] = []
      }
      
      operatorGroups[operator].push(record)
    })

    const operatorMetrics = Object.entries(operatorGroups).map(([operator, records]) => {
      const validRecords = records.filter(record => 
        record.date && record.duration_minutes >= 0
      )

      if (validRecords.length === 0) {
        return {
          operator,
          totalCalls: 0,
          avgDuration: 0,
          avgRatingAttendance: 0,
          avgRatingSolution: 0,
          avgPauseTime: 0,
          totalRecords: 0
        }
      }

      const totalCalls = validRecords.reduce((sum, record) => sum + (record.call_count || 0), 0)
      const totalDuration = validRecords.reduce((sum, record) => sum + (record.duration_minutes || 0), 0)
      const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

      const attendanceRatings = validRecords
        .map(record => record.rating_attendance)
        .filter(rating => rating !== null && rating !== undefined)
      
      const solutionRatings = validRecords
        .map(record => record.rating_solution)
        .filter(rating => rating !== null && rating !== undefined)

      const avgRatingAttendance = attendanceRatings.length > 0 
        ? attendanceRatings.reduce((sum, rating) => sum + rating, 0) / attendanceRatings.length 
        : 0

      const avgRatingSolution = solutionRatings.length > 0 
        ? solutionRatings.reduce((sum, rating) => sum + rating, 0) / solutionRatings.length 
        : 0

      const pauseTimes = validRecords
        .map(record => record.avg_paused_time)
        .filter(time => time > 0)

      const avgPauseTime = pauseTimes.length > 0 
        ? pauseTimes.reduce((sum, time) => sum + time, 0) / pauseTimes.length 
        : 0

      return {
        operator,
        totalCalls,
        avgDuration: parseFloat(avgDuration.toFixed(2)),
        avgRatingAttendance: parseFloat(avgRatingAttendance.toFixed(2)),
        avgRatingSolution: parseFloat(avgRatingSolution.toFixed(2)),
        avgPauseTime: parseFloat(avgPauseTime.toFixed(2)),
        totalRecords: validRecords.length
      }
    })

    return operatorMetrics.sort((a, b) => b.totalCalls - a.totalCalls)
  }

  const calculateRankings = (operatorMetrics) => {
    if (!operatorMetrics || operatorMetrics.length === 0) return []

    const maxCalls = Math.max(...operatorMetrics.map(op => op.totalCalls))
    const maxDuration = Math.max(...operatorMetrics.map(op => op.avgDuration))
    const maxRatingAttendance = Math.max(...operatorMetrics.map(op => op.avgRatingAttendance))
    const maxRatingSolution = Math.max(...operatorMetrics.map(op => op.avgRatingSolution))
    const maxPauseTime = Math.max(...operatorMetrics.map(op => op.avgPauseTime))

    const rankings = operatorMetrics.map(operator => {
      const normCalls = maxCalls > 0 ? operator.totalCalls / maxCalls : 0
      const normDuration = maxDuration > 0 ? operator.avgDuration / maxDuration : 0
      const normRatingAttendance = maxRatingAttendance > 0 ? operator.avgRatingAttendance / maxRatingAttendance : 0
      const normRatingSolution = maxRatingSolution > 0 ? operator.avgRatingSolution / maxRatingSolution : 0
      const normPauseTime = maxPauseTime > 0 ? operator.avgPauseTime / maxPauseTime : 0

      const score = (
        0.35 * normCalls +
        0.20 * (1 - normDuration) +
        0.20 * normRatingAttendance +
        0.20 * normRatingSolution -
        0.05 * normPauseTime
      ) * 100

      return {
        ...operator,
        score: parseFloat(score.toFixed(2)),
        rank: 0
      }
    })

    rankings.sort((a, b) => b.score - a.score)
    rankings.forEach((operator, index) => {
      operator.rank = index + 1
    })

    return rankings
  }

  // Funções de cache
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      
      if (now - timestamp > CACHE_CONFIG.ttl) {
        localStorage.removeItem(CACHE_CONFIG.key)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao ler cache:', error)
      return null
    }
  }

  const cacheData = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_CONFIG.key, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Erro ao salvar cache:', error)
    }
  }

  // Limpar dados
  const clearData = useCallback(() => {
    setData([])
    setMetrics(null)
    setOperatorMetrics([])
    setRankings([])
    setOperators([])
    setErrors([])
    localStorage.removeItem(CACHE_CONFIG.key)
  }, [])

  return {
    // Estado
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    operators,
    isLoading,
    isAuthenticated,
    
    // Ações
    fetchSheetData,
    signIn,
    signOut,
    clearData
  }
}
