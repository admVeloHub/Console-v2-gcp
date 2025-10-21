import { useState, useEffect, useCallback } from 'react'

export const useGoogleSheetsSSO = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [tokenClient, setTokenClient] = useState(null)

  // Configurações
  const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const SHEET_RANGE = 'Sheet1!A:Z'
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const DOMINIO_PERMITIDO = '@velotax.com.br' // Altere para seu domínio

  // Aguardar Google Identity Services carregar
  const waitForGoogleScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Verificar se já está carregado
      if (window.google && window.google.accounts) {
        console.log('✅ Google Identity Services já carregado')
        return resolve(window.google.accounts)
      }
      
      console.log('⏳ Aguardando Google Identity Services carregar...')
      
      let attempts = 0
      const maxAttempts = 100 // 10 segundos
      
      const checkInterval = setInterval(() => {
        attempts++
        
        if (window.google && window.google.accounts) {
          clearInterval(checkInterval)
          console.log('✅ Google Identity Services carregado após', attempts * 100, 'ms')
          resolve(window.google.accounts)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          console.error('❌ Timeout: Google Identity Services não carregou')
          reject(new Error('Google Identity Services não carregou após 10 segundos'))
        }
      }, 100)
    })
  }, [])

  // Inicializar Google Sign-In
  const initializeGoogleSignIn = useCallback(async () => {
    if (!CLIENT_ID || false) {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env!'])
      return false
    }

    try {
      const accounts = await waitForGoogleScript()
      
      const client = accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly profile email',
        callback: handleGoogleSignIn
      })
      
      setTokenClient(client)
      console.log('✅ Google Identity Services inicializado')
      return true
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Google Sign-In:', error)
      setErrors(prev => [...prev, '❌ Erro ao carregar autenticação do Google'])
      return false
    }
  }, [CLIENT_ID, waitForGoogleScript])

  // Verificar identificação salva
  const verificarIdentificacao = useCallback(() => {
    const umDiaEmMs = 24 * 60 * 60 * 1000 // 24 horas
    let dadosSalvos = null
    
    try {
      const dadosSalvosString = localStorage.getItem('veloinsights_user')
      if (dadosSalvosString) {
        dadosSalvos = JSON.parse(dadosSalvosString)
      }
    } catch (e) {
      localStorage.removeItem('veloinsights_user')
    }

    // Verificar se há dados válidos e não expirados
    if (dadosSalvos && 
        dadosSalvos.email && 
        dadosSalvos.email.endsWith(DOMINIO_PERMITIDO) && 
        (Date.now() - dadosSalvos.timestamp < umDiaEmMs)) {
      
      setUserData(dadosSalvos)
      setIsAuthenticated(true)
      console.log('✅ Usuário já autenticado:', dadosSalvos.nome)
      return true
    } else {
      // Dados inválidos ou expirados
      localStorage.removeItem('veloinsights_user')
      return false
    }
  }, [DOMINIO_PERMITIDO])

  // Handler do login Google
  const handleGoogleSignIn = useCallback(async (response) => {
    try {
      setIsLoading(true)
      
      // 1. Buscar dados do usuário na API do Google
      const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${response.access_token}` }
      })
      
      if (!googleResponse.ok) {
        throw new Error('Erro ao buscar dados do usuário')
      }
      
      const user = await googleResponse.json()

      // 2. Validar domínio corporativo
      if (user.email && user.email.endsWith(DOMINIO_PERMITIDO)) {
        // 3. Salvar dados do usuário
        const userData = {
          nome: user.name,
          email: user.email,
          foto: user.picture,
          timestamp: Date.now(),
          accessToken: response.access_token
        }

        // 4. Persistir no localStorage
        localStorage.setItem('veloinsights_user', JSON.stringify(userData))
        setUserData(userData)
        setIsAuthenticated(true)
        
        // 5. Buscar dados da planilha
        await fetchSheetData(response.access_token)
        
        console.log('✅ Login realizado com sucesso:', user.name)
        
      } else {
        // Domínio não permitido
        setErrors(prev => [...prev, `❌ Acesso permitido apenas para e-mails ${DOMINIO_PERMITIDO}!`])
        setIsLoading(false)
      }
      
    } catch (error) {
      console.error('❌ Erro no fluxo de login:', error)
      setErrors(prev => [...prev, '❌ Erro ao verificar login ou permissões. Tente novamente.'])
      setIsLoading(false)
    }
  }, [DOMINIO_PERMITIDO])

  // Função para fazer login
  const signIn = useCallback(async () => {
    if (!tokenClient) {
      console.log('🔄 Tentando reinicializar Google Sign-In...')
      const success = await initializeGoogleSignIn()
      if (!success) {
        setErrors(prev => [...prev, '❌ Google Sign-In não inicializado. Recarregue a página.'])
        return false
      }
    }

    try {
      tokenClient.requestAccessToken()
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error)
      setErrors(prev => [...prev, '❌ Erro ao fazer login com Google'])
    }
  }, [tokenClient, initializeGoogleSignIn])

  // Função para fazer logout
  const signOut = useCallback(() => {
    // Limpar dados locais
    localStorage.removeItem('veloinsights_user')
    setUserData(null)
    setIsAuthenticated(false)
    setData([])
    setMetrics({})
    setOperatorMetrics({})
    setRankings([])
    setOperators([])
    setErrors([])
    
    console.log('✅ Logout realizado')
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
      console.error('❌ Erro ao buscar dados:', error)
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
    setUserData(null)
  }, [])

  // Inicialização
  useEffect(() => {
    const init = async () => {
      console.log('🚀 Iniciando VeloInsights SSO...')
      
      // Aguardar um pouco para o script carregar
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const success = await initializeGoogleSignIn()
      if (success) {
        verificarIdentificacao()
      }
    }
    
    init()
  }, [initializeGoogleSignIn, verificarIdentificacao])

  // Verificar expiração a cada hora
  useEffect(() => {
    const checkExpiration = () => {
      if (userData) {
        const tempoExpiracao = 23 * 60 * 60 * 1000 // 23 horas
        if (Date.now() - userData.timestamp > tempoExpiracao) {
          signOut()
        }
      }
    }

    const interval = setInterval(checkExpiration, 60 * 60 * 1000) // A cada hora
    return () => clearInterval(interval)
  }, [userData, signOut])

  return {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    operators,
    isLoading,
    isAuthenticated,
    userData,
    fetchSheetData,
    signIn,
    signOut,
    clearData
  }
}
