import { useState, useEffect, useCallback } from 'react'

export const useGoogleSheetsSimple = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Configurações
  const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const SHEET_RANGE = 'Sheet1!A:Z'
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // Verificar se está configurado e aguardar Google Identity Services
  useEffect(() => {
    if (!CLIENT_ID || false) {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env!'])
    }

    // Aguardar Google Identity Services carregar
    const checkGoogleLoaded = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        console.log('✅ Google Identity Services carregado')
      } else {
        setTimeout(checkGoogleLoaded, 100)
      }
    }
    
    checkGoogleLoaded()
  }, [])

  // Função para fazer login com OAuth2
  const signIn = useCallback(async () => {
    if (!CLIENT_ID || false) {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env primeiro!'])
      return false
    }

    try {
      setIsLoading(true)
      
      // Verificar se Google Identity Services carregou
      if (typeof google === 'undefined' || !google.accounts) {
        setErrors(prev => [...prev, '❌ Google Identity Services não carregou. Recarregue a página.'])
        setIsLoading(false)
        return false
      }
      
      // Usar Google Identity Services (mais moderno)
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        callback: async (response) => {
          if (response.error) {
            setErrors(prev => [...prev, `Erro de autenticação: ${response.error}`])
            setIsLoading(false)
            return
          }
          
          setIsAuthenticated(true)
          await fetchSheetData(response.access_token)
        }
      })

      tokenClient.requestAccessToken()
      
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      setErrors(prev => [...prev, 'Erro ao fazer login com Google'])
      setIsLoading(false)
    }
  }, [CLIENT_ID])

  // Função para fazer logout
  const signOut = useCallback(() => {
    setIsAuthenticated(false)
    setData([])
    setMetrics({})
    setOperatorMetrics({})
    setRankings([])
    setOperators([])
    setErrors([])
  }, [])

  // Função para buscar dados da planilha
  const fetchSheetData = useCallback(async (accessToken) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.values || result.values.length === 0) {
        throw new Error('Planilha vazia ou sem dados')
      }

      // Processar dados
      const processedData = processSheetData(result.values)
      setData(processedData)
      
      // Calcular métricas
      const calculatedMetrics = calculateMetrics(processedData)
      setMetrics(calculatedMetrics)
      
      // Calcular métricas por operador
      const calculatedOperatorMetrics = calculateOperatorMetrics(processedData)
      setOperatorMetrics(calculatedOperatorMetrics)
      
      // Calcular rankings
      const calculatedRankings = calculateRankings(calculatedOperatorMetrics)
      setRankings(calculatedRankings)
      
      // Extrair lista de operadores
      const operatorList = Object.keys(calculatedOperatorMetrics)
      setOperators(operatorList)
      
      setIsLoading(false)
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setErrors(prev => [...prev, `Erro ao buscar dados: ${error.message}`])
      setIsLoading(false)
    }
  }, [])

  // Processar dados da planilha
  const processSheetData = (values) => {
    if (!values || values.length < 2) return []

    const headers = values[0]
    const rows = values.slice(1)

    return rows.map(row => {
      const processedRow = {}
      headers.forEach((header, index) => {
        processedRow[header] = row[index] || ''
      })
      return processedRow
    }).filter(row => row['Data'] && row['Nome do Atendente'])
  }

  // Calcular métricas gerais
  const calculateMetrics = (data) => {
    if (!data || data.length === 0) return {}

    const totalCalls = data.length
    const avgDuration = data.reduce((sum, row) => sum + (parseFloat(row['Tempo Falado']) || 0), 0) / totalCalls
    const avgRatingAttendance = data.reduce((sum, row) => sum + (parseFloat(row['Pergunta2 1 PERGUNTA ATENDENTE']) || 0), 0) / totalCalls
    const avgRatingSolution = data.reduce((sum, row) => sum + (parseFloat(row['Pergunta2 2 PERGUNTA SOLUCAO']) || 0), 0) / totalCalls
    const avgPause = data.reduce((sum, row) => sum + (parseFloat(row['T M Pausado']) || 0), 0) / totalCalls
    const uniqueOperators = new Set(data.map(row => row['Nome do Atendente'])).size

    return {
      totalCalls,
      avgDuration: avgDuration.toFixed(1),
      avgRatingAttendance: avgRatingAttendance.toFixed(1),
      avgRatingSolution: avgRatingSolution.toFixed(1),
      avgPause: avgPause.toFixed(1),
      uniqueOperators
    }
  }

  // Calcular métricas por operador
  const calculateOperatorMetrics = (data) => {
    const operatorData = {}
    
    data.forEach(row => {
      const operator = row['Nome do Atendente']
      if (!operatorData[operator]) {
        operatorData[operator] = {
          totalCalls: 0,
          totalDuration: 0,
          totalRatingAttendance: 0,
          totalRatingSolution: 0,
          totalPause: 0,
          ratingCount: 0
        }
      }
      
      operatorData[operator].totalCalls++
      operatorData[operator].totalDuration += parseFloat(row['Tempo Falado']) || 0
      operatorData[operator].totalRatingAttendance += parseFloat(row['Pergunta2 1 PERGUNTA ATENDENTE']) || 0
      operatorData[operator].totalRatingSolution += parseFloat(row['Pergunta2 2 PERGUNTA SOLUCAO']) || 0
      operatorData[operator].totalPause += parseFloat(row['T M Pausado']) || 0
      
      if (row['Pergunta2 1 PERGUNTA ATENDENTE']) {
        operatorData[operator].ratingCount++
      }
    })

    // Calcular médias
    Object.keys(operatorData).forEach(operator => {
      const op = operatorData[operator]
      op.avgDuration = op.totalDuration / op.totalCalls
      op.avgRatingAttendance = op.totalRatingAttendance / op.totalCalls
      op.avgRatingSolution = op.totalRatingSolution / op.totalCalls
      op.avgPause = op.totalPause / op.totalCalls
    })

    return operatorData
  }

  // Calcular rankings
  const calculateRankings = (operatorMetrics) => {
    const operators = Object.keys(operatorMetrics)
    
    // Normalizar valores para score (0-1)
    const maxCalls = Math.max(...operators.map(op => operatorMetrics[op].totalCalls))
    const maxDuration = Math.max(...operators.map(op => operatorMetrics[op].avgDuration))
    const maxRatingAttendance = Math.max(...operators.map(op => operatorMetrics[op].avgRatingAttendance))
    const maxRatingSolution = Math.max(...operators.map(op => operatorMetrics[op].avgRatingSolution))
    const maxPause = Math.max(...operators.map(op => operatorMetrics[op].avgPause))

    const rankings = operators.map(operator => {
      const metrics = operatorMetrics[operator]
      
      const score = 
        0.35 * (metrics.totalCalls / maxCalls) +
        0.20 * (1 - metrics.avgDuration / maxDuration) +
        0.20 * (metrics.avgRatingAttendance / maxRatingAttendance) +
        0.20 * (metrics.avgRatingSolution / maxRatingSolution) -
        0.05 * (metrics.avgPause / maxPause)

      return {
        operator,
        score: (score * 100).toFixed(1),
        ...metrics
      }
    })

    return rankings.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
  }

  // Limpar dados
  const clearData = useCallback(() => {
    setData([])
    setMetrics({})
    setOperatorMetrics({})
    setRankings([])
    setOperators([])
    setErrors([])
    setIsAuthenticated(false)
  }, [])

  return {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    operators,
    isLoading,
    isAuthenticated,
    fetchSheetData,
    signIn,
    signOut,
    clearData
  }
}

