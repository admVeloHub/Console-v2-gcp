import { useState, useEffect, useCallback } from 'react'

export const useGoogleSheetsJSON = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState(null)

  // Configurações
  const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const SHEET_RANGE = 'Sheet1!A:Z'

  // Carregar credenciais do arquivo JSON
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        // Carregar do diretório raiz (não public)
        const response = await fetch('/google-credentials.json')
        if (!response.ok) {
          throw new Error('Arquivo de credenciais não encontrado')
        }
        const creds = await response.json()
        setCredentials(creds)
        console.log('✅ Credenciais carregadas:', creds.client_id)
      } catch (error) {
        console.error('❌ Erro ao carregar credenciais:', error)
        setErrors(prev => [...prev, '❌ Arquivo google-credentials.json não encontrado na raiz do projeto'])
      }
    }
    
    loadCredentials()
  }, [])

  // Função para fazer login com popup
  const signIn = useCallback(async () => {
    if (!credentials) {
      setErrors(prev => [...prev, '❌ Credenciais não carregadas'])
      return false
    }

    try {
      setIsLoading(true)
      
      // Configurações OAuth2
      const redirectUri = window.location.origin
      const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly'
      const responseType = 'token'
      
      // URL de autorização do Google
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${credentials.client_id}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=offline&` +
        `prompt=consent`

      // Redirecionar para Google
      window.location.href = authUrl
      
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      setErrors(prev => [...prev, '❌ Erro ao fazer login com Google'])
      setIsLoading(false)
    }
  }, [credentials])

  // Verificar token na URL
  useEffect(() => {
    if (!credentials) return

    // Verificar no hash da URL (para response_type=token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashAccessToken = hashParams.get('access_token')
    const hashError = hashParams.get('error')

    if (hashError) {
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${hashError}`])
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (hashAccessToken) {
      setIsAuthenticated(true)
      fetchSheetData(hashAccessToken)
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [credentials])

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
      setErrors(prev => [...prev, `❌ Erro ao buscar dados: ${error.message}`])
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
