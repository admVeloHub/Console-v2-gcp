import { useState, useEffect, useCallback } from 'react'

export const useGoogleSheetsDemo = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)

  // Dados de demonstração
  const demoData = [
    {
      'Data': '2024-01-15',
      'Nome do Atendente': 'João Silva',
      'Tempo Falado': '5.2',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.5',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.8',
      'T M Pausado': '0.5'
    },
    {
      'Data': '2024-01-15',
      'Nome do Atendente': 'Maria Santos',
      'Tempo Falado': '4.8',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.7',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.9',
      'T M Pausado': '0.3'
    },
    {
      'Data': '2024-01-16',
      'Nome do Atendente': 'João Silva',
      'Tempo Falado': '6.1',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.2',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.6',
      'T M Pausado': '0.7'
    },
    {
      'Data': '2024-01-16',
      'Nome do Atendente': 'Carlos Oliveira',
      'Tempo Falado': '3.9',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.9',
      'Pergunta2 2 PERGUNTA SOLUCAO': '5.0',
      'T M Pausado': '0.2'
    },
    {
      'Data': '2024-01-17',
      'Nome do Atendente': 'Maria Santos',
      'Tempo Falado': '5.5',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.8',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.7',
      'T M Pausado': '0.4'
    },
    {
      'Data': '2024-01-17',
      'Nome do Atendente': 'Ana Costa',
      'Tempo Falado': '4.2',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.6',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.8',
      'T M Pausado': '0.6'
    },
    {
      'Data': '2024-01-18',
      'Nome do Atendente': 'João Silva',
      'Tempo Falado': '5.8',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.4',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.5',
      'T M Pausado': '0.8'
    },
    {
      'Data': '2024-01-18',
      'Nome do Atendente': 'Carlos Oliveira',
      'Tempo Falado': '4.1',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.9',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.9',
      'T M Pausado': '0.3'
    },
    {
      'Data': '2024-01-19',
      'Nome do Atendente': 'Maria Santos',
      'Tempo Falado': '5.3',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.7',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.8',
      'T M Pausado': '0.5'
    },
    {
      'Data': '2024-01-19',
      'Nome do Atendente': 'Ana Costa',
      'Tempo Falado': '4.7',
      'Pergunta2 1 PERGUNTA ATENDENTE': '4.5',
      'Pergunta2 2 PERGUNTA SOLUCAO': '4.7',
      'T M Pausado': '0.4'
    }
  ]

  // Verificar identificação salva
  useEffect(() => {
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
        dadosSalvos.email.endsWith('@velotax.com.br') && 
        (Date.now() - dadosSalvos.timestamp < umDiaEmMs)) {
      
      setUserData(dadosSalvos)
      setIsAuthenticated(true)
      console.log('✅ Usuário já autenticado:', dadosSalvos.nome)
      
      // Carregar dados de demonstração
      loadDemoData()
    }
  }, [])

  // Carregar dados de demonstração
  const loadDemoData = useCallback(() => {
    try {
      setIsLoading(true)
      
      // Simular carregamento
      setTimeout(() => {
        setData(demoData)
        
        // Calcular métricas
        const calculatedMetrics = calculateMetrics(demoData)
        setMetrics(calculatedMetrics)
        
        // Calcular métricas por operador
        const calculatedOperatorMetrics = calculateOperatorMetrics(demoData)
        setOperatorMetrics(calculatedOperatorMetrics)
        
        // Calcular rankings
        const calculatedRankings = calculateRankings(calculatedOperatorMetrics)
        setRankings(calculatedRankings)
        
        // Extrair lista de operadores
        const operatorList = Object.keys(calculatedOperatorMetrics)
        setOperators(operatorList)
        
        setIsLoading(false)
        console.log('✅ Dados de demonstração carregados')
      }, 1500)
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      setErrors(prev => [...prev, `❌ Erro ao carregar dados: ${error.message}`])
      setIsLoading(false)
    }
  }, [])

  // Função para fazer login (modo demo)
  const signIn = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Simular login
      setTimeout(() => {
        const userData = {
          nome: 'Usuário Demo',
          email: 'demo@velotax.com.br',
          foto: null,
          timestamp: Date.now(),
          accessToken: 'demo_token'
        }

        // Persistir no localStorage
        localStorage.setItem('veloinsights_user', JSON.stringify(userData))
        setUserData(userData)
        setIsAuthenticated(true)
        
        // Carregar dados de demonstração
        loadDemoData()
        
        console.log('✅ Login demo realizado com sucesso')
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error)
      setErrors(prev => [...prev, '❌ Erro ao fazer login'])
      setIsLoading(false)
    }
  }, [loadDemoData])

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

  // Função para buscar dados (modo demo)
  const fetchSheetData = useCallback(async () => {
    loadDemoData()
  }, [loadDemoData])

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
