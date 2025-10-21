import { useState, useEffect, useCallback } from 'react'

export const useGoogleSheetsDirect = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)

  // Configurações
  const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'
  const SHEET_RANGE_INITIAL = 'Base!A1:AC5000' // Carregamento inicial rápido (incluindo colunas AB e AC)
  const SHEET_RANGE_FULL = 'Base!A1:AC150000' // Carregamento completo por período (incluindo colunas AB e AC)
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const DOMINIO_PERMITIDO = '@velotax.com.br'
  
  // Estado para controle de período
  const [selectedPeriod, setSelectedPeriod] = useState('recent') // 'recent', 'custom'
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  
  // Estado para Dark List (lista de operadores excluídos)
  const [darkList, setDarkList] = useState([])

  // Carregar Dark List do localStorage
  useEffect(() => {
    const savedDarkList = localStorage.getItem('veloinsights_darklist')
    if (savedDarkList) {
      try {
        const parsed = JSON.parse(savedDarkList)
        setDarkList(parsed)
      } catch (error) {
        console.error('❌ Erro ao carregar Dark List:', error)
        setDarkList([])
      }
    } else {
      // Dark List inicial com operadores que devem ser excluídos
      const initialDarkList = ['Evelin Medrado']
      setDarkList(initialDarkList)
      localStorage.setItem('veloinsights_darklist', JSON.stringify(initialDarkList))
    }
  }, [])

  // Verificar se está configurado
  useEffect(() => {
    if (!CLIENT_ID || false) {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env!'])
    } else {
    }
  }, [CLIENT_ID])

  // Verificar código de autorização na URL (retorno do OAuth)
  useEffect(() => {
    if (!CLIENT_ID || false) return

    // Verificar no query string (para response_type=code)
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${error}`])
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authCode) {
      // Trocar código por tokens
      exchangeCodeForTokens(authCode)
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

  }, [CLIENT_ID])

  // Verificar localStorage após exchangeCodeForTokens ser definido
  useEffect(() => {
    if (!CLIENT_ID || false) return

    // Verificar se há código de autorização no localStorage (callback direto)
    const storedAuthCode = localStorage.getItem('google_auth_code')
    const storedAuthError = localStorage.getItem('google_auth_error')
    
    if (storedAuthCode) {
      exchangeCodeForTokens(storedAuthCode)
      localStorage.removeItem('google_auth_code')
    }
    
    if (storedAuthError) {
      console.error('❌ Erro de autorização:', storedAuthError)
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${storedAuthError}`])
      localStorage.removeItem('google_auth_error')
    }
  }, [CLIENT_ID, exchangeCodeForTokens])

  // Trocar código de autorização por tokens
  const exchangeCodeForTokens = useCallback(async (authCode) => {
    try {
      setIsLoading(true)
      
      const redirectUri = `${window.location.origin}/callback.html`
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
      
      
      if (!clientSecret || false) {
        throw new Error('Client Secret não configurado no arquivo .env')
      }
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Erro ao trocar código por tokens: ${errorData}`)
      }
      
      const tokenData = await response.json()
      
      // Buscar dados do usuário com o access token
      await fetchUserData(tokenData.access_token, tokenData.refresh_token)
      
    } catch (error) {
      console.error('❌ Erro ao trocar código por tokens:', error)
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${error.message}`])
      setIsLoading(false)
    }
  }, [CLIENT_ID])

  // Verificar identificação salva
  useEffect(() => {
    // Limpar dados antigos para forçar novo login com o sistema corrigido
    localStorage.removeItem('veloinsights_user')
    setUserData(null)
    setIsAuthenticated(false)
    setData([])
    setMetrics({})
    setOperatorMetrics({})
    setRankings([])
    setOperators([])
    setErrors([])
  }, [])

  // Buscar dados do usuário
  const fetchUserData = useCallback(async (accessToken, refreshToken = null) => {
    try {
      setIsLoading(true)
      
      // Buscar dados do usuário na API do Google
      const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      if (!googleResponse.ok) {
        throw new Error('Erro ao buscar dados do usuário')
      }
      
      const user = await googleResponse.json()

      // Validar domínio corporativo
      if (user.email && user.email.endsWith(DOMINIO_PERMITIDO)) {
        // Salvar dados do usuário
        const userData = {
          nome: user.name,
          email: user.email,
          foto: user.picture,
          timestamp: Date.now(),
          accessToken: accessToken,
          refreshToken: refreshToken
        }

        // Persistir no localStorage
        localStorage.setItem('veloinsights_user', JSON.stringify(userData))
        setUserData(userData)
        setIsAuthenticated(true)
        
        // Buscar dados da planilha
        await fetchSheetData(accessToken)
        
        
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
    if (!CLIENT_ID || false) {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env primeiro!'])
      return false
    }

    try {
      setIsLoading(true)
      
      // Configurações OAuth2
      const redirectUri = `${window.location.origin}/callback.html`
      const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly profile email'
      const responseType = 'code'
      
      // URL de autorização do Google
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=offline&` +
        `prompt=consent`

      
      // Redirecionar para Google
      window.location.href = authUrl
      
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error)
      setErrors(prev => [...prev, '❌ Erro ao fazer login com Google'])
      setIsLoading(false)
    }
  }, [CLIENT_ID])

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
    
  }, [])

  // Função para buscar dados da planilha
  const fetchSheetData = useCallback(async (accessToken, period = 'recent') => {
    try {
      setIsLoading(true)
      
      // Verificar se o token ainda é válido
      const tokenResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      if (!tokenResponse.ok) {
        // Token expirado, limpar dados e pedir novo login
        localStorage.removeItem('veloinsights_user')
        setUserData(null)
        setIsAuthenticated(false)
        setData([])
        setMetrics({})
        setOperatorMetrics({})
        setRankings([])
        setOperators([])
        setErrors(prev => [...prev, '❌ Sessão expirada. Faça login novamente.'])
        setIsLoading(false)
        return
      }
      
      // Escolher range baseado no período
      const range = period === 'recent' ? SHEET_RANGE_INITIAL : SHEET_RANGE_FULL
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro detalhado da API:', errorText)
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
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
    

    const processedRows = rows.map(row => {
      const processedRow = {}
      headers.forEach((header, index) => {
        processedRow[header] = row[index] || ''
      })
      return processedRow
    })
    
    
    // Aplicar filtro básico - apenas linhas com dados válidos (ignorar linhas vazias)
    const filteredRows = processedRows.filter(row => {
      // Verificar se tem pelo menos um campo com dados válidos
      const hasAnyData = Object.values(row).some(value => {
        if (!value) return false
        const trimmed = value.toString().trim()
        return trimmed !== '' && trimmed !== '0' && trimmed !== 'null' && trimmed !== 'undefined'
      })
      return hasAnyData
    })
    
    
    // Mostrar algumas linhas de exemplo
    if (filteredRows.length > 0) {
      
      // Verificar se os campos que precisamos existem
      const sampleRow = filteredRows[0]
      
      // Verificar colunas AB e AC especificamente
      const allKeys = Object.keys(sampleRow)
      
      // Procurar por campos que contenham "nota" ou "avaliação"
      const notaFields = allKeys.filter(key => 
        key.toLowerCase().includes('nota') || 
        key.toLowerCase().includes('avaliação') ||
        key.toLowerCase().includes('rating')
      )
    }
    
    
    return filteredRows
  }

  // Calcular métricas gerais
  const calculateMetrics = (data) => {
    
    if (!data || data.length === 0) {
      return {}
    }

    // Verificar se as colunas AB e AC existem
    const totalColumns = Object.keys(data[0]).length
    
    if (totalColumns < 29) {
    } else {
    }

    // Total de Chamadas: Contar registros na coluna A (Chamada)
    const totalCalls = data.length
    
    // Debug detalhado dos status das chamadas
    
    // Analisar algumas linhas para entender os padrões
    const sampleData = data.slice(0, 10)
    sampleData.forEach((row, index) => {
      const chamada = row['Chamada'] || ''
      const tempoFalado = row['Tempo Falado'] || '00:00:00'
      const tempoEspera = row['Tempo De Espera'] || '00:00:00'
      
      // Log removido para evitar loop infinito
    })
    
    // Contar por tipo de status na coluna Chamada
    const statusCounts = {}
    data.forEach(row => {
      const status = row['Chamada'] || 'Vazio'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    
    Object.entries(statusCounts).forEach(([status, count]) => {
    })
    
    // Retida na URA: chamadas com "Retida na URA" na coluna Chamada
    const retidaURA = data.filter(row => {
      const chamada = row['Chamada'] || ''
      return chamada.toLowerCase().includes('retida') || chamada.toLowerCase().includes('ura')
    }).length
    
    // Atendida: chamadas com tempo falado > 0 ou status de atendida
    const atendida = data.filter(row => {
      const tempoFalado = row['Tempo Falado'] || '00:00:00'
      const chamada = row['Chamada'] || ''
      
      // Converter tempo para minutos para verificar se > 0
      const [horas, minutos, segundos] = tempoFalado.split(':').map(Number)
      const tempoTotalMinutos = horas * 60 + minutos + segundos / 60
      
      return tempoTotalMinutos > 0 || chamada.toLowerCase().includes('atendida')
    }).length
    
    // Abandonada: chamadas que não foram atendidas mas têm tempo de espera
    const abandonada = data.filter(row => {
      const tempoEspera = row['Tempo De Espera'] || '00:00:00'
      const tempoFalado = row['Tempo Falado'] || '00:00:00'
      const chamada = row['Chamada'] || ''
      
      // Converter tempos para minutos
      const [horasEspera, minutosEspera, segundosEspera] = tempoEspera.split(':').map(Number)
      const [horasFalado, minutosFalado, segundosFalado] = tempoFalado.split(':').map(Number)
      
      const tempoEsperaMinutos = horasEspera * 60 + minutosEspera + segundosEspera / 60
      const tempoFaladoMinutos = horasFalado * 60 + minutosFalado + segundosFalado / 60
      
      return tempoEsperaMinutos > 0 && tempoFaladoMinutos === 0 && !chamada.toLowerCase().includes('retida')
    }).length
    
    // Verificar se a soma bate
    const somaStatus = retidaURA + atendida + abandonada
    
    // Função auxiliar para converter tempo HH:MM:SS para minutos
    const tempoParaMinutos = (tempo) => {
      if (!tempo || tempo === '00:00:00') return 0
      const [horas, minutos, segundos] = tempo.split(':').map(Number)
      return horas * 60 + minutos + segundos / 60
    }
    
    // Duração Média de Atendimento (Tempo Falado - Coluna N)
    const temposFalado = data.map(row => tempoParaMinutos(row['Tempo Falado'])).filter(tempo => tempo > 0)
    const duracaoMediaAtendimento = temposFalado.length > 0 
      ? temposFalado.reduce((sum, tempo) => sum + tempo, 0) / temposFalado.length
      : 0
    
    // Tempo Médio de Espera (Tempo De Espera - Coluna M)
    const temposEspera = data.map(row => tempoParaMinutos(row['Tempo De Espera'])).filter(tempo => tempo > 0)
    const tempoMedioEspera = temposEspera.length > 0 
      ? temposEspera.reduce((sum, tempo) => sum + tempo, 0) / temposEspera.length
      : 0
    
    // Tempo Médio na URA (Tempo Na Ura - Coluna L)
    const temposURA = data.map(row => tempoParaMinutos(row['Tempo Na Ura'])).filter(tempo => tempo > 0)
    const tempoMedioURA = temposURA.length > 0 
      ? temposURA.reduce((sum, tempo) => sum + tempo, 0) / temposURA.length
      : 0
    
    // Taxa de Atendimento (% de chamadas atendidas)
    const taxaAtendimento = totalCalls > 0 ? (atendida / totalCalls) * 100 : 0
    
    // Taxa de Abandono (% de chamadas abandonadas)
    const taxaAbandono = totalCalls > 0 ? (abandonada / totalCalls) * 100 : 0
    
    // Nota Média de Atendimento: Usar nome do campo correto
    const ratingsAttendance = data.filter(row => {
      const rating = parseFloat(row['Pergunta2 1 PERGUNTA ATENDENTE']) || 0
      const hasRating = rating > 0 && rating <= 5 // Notas válidas entre 1-5
      if (hasRating) {
        console.log('⭐ Nota Atendimento:', rating)
      }
      return hasRating
    })
    const avgRatingAttendance = ratingsAttendance.length > 0 
      ? ratingsAttendance.reduce((sum, row) => sum + parseFloat(row['Pergunta2 1 PERGUNTA ATENDENTE']), 0) / ratingsAttendance.length
      : 0
    console.log('⭐ Nota média atendimento:', avgRatingAttendance, '(de', ratingsAttendance.length, 'avaliações válidas)')
    
    // Nota Média de Solução: Usar nome do campo correto
    const ratingsSolution = data.filter(row => {
      const rating = parseFloat(row['Pergunta2 2 PERGUNTA SOLUCAO']) || 0
      const hasRating = rating > 0 && rating <= 5 // Notas válidas entre 1-5
      if (hasRating) {
        console.log('⭐ Nota Solução:', rating)
      }
      return hasRating
    })
    const avgRatingSolution = ratingsSolution.length > 0 
      ? ratingsSolution.reduce((sum, row) => sum + parseFloat(row['Pergunta2 2 PERGUNTA SOLUCAO']), 0) / ratingsSolution.length
      : 0
    console.log('⭐ Nota média solução:', avgRatingSolution, '(de', ratingsSolution.length, 'avaliações válidas)')

    const result = {
      totalCalls,
      retidaURA,
      atendida,
      abandonada,
      avgRatingAttendance: avgRatingAttendance.toFixed(1),
      avgRatingSolution: avgRatingSolution.toFixed(1),
      duracaoMediaAtendimento: duracaoMediaAtendimento.toFixed(1),
      tempoMedioEspera: tempoMedioEspera.toFixed(1),
      tempoMedioURA: tempoMedioURA.toFixed(1),
      taxaAtendimento: taxaAtendimento.toFixed(1),
      taxaAbandono: taxaAbandono.toFixed(1)
    }
    
    console.log('📈 Métricas finais:', result)
    return result
  }

  // Calcular métricas por operador (APENAS para ranking - exclui desligados)
  const calculateOperatorMetrics = (data) => {
    console.log('👥 Calculando métricas por operador para', data.length, 'registros')
    console.log('📋 Dark List ativa:', darkList.length, 'operadores excluídos:', darkList)
    
    const operatorData = {}
    
    data.forEach(row => {
      const operator = row['Operador']
      if (!operator || operator.trim() === '') return
      
      // Verificar se operador está na dark list OU é desligado
      const isExcluded = darkList.includes(operator)
      const isDesligado = operator.toLowerCase().includes('desl') || 
                         operator.toLowerCase().includes('desligado') ||
                         operator.toLowerCase().includes('excluído') ||
                         operator.toLowerCase().includes('inativo')
      
      if (isExcluded || isDesligado) {
        console.log('🚫 Operador excluído da análise:', operator, isDesligado ? '(Desligado)' : '(Dark List)')
        return
      }
      
      if (!operatorData[operator]) {
        operatorData[operator] = {
          totalAtendimentos: 0,
          temposFalado: [],
          notasAtendimento: [],
          notasSolucao: [],
          temposEspera: [],
          temposURA: []
        }
      }
      
      // Contar atendimentos (apenas chamadas com tempo falado > 0)
      const tempoFalado = row['Tempo Falado'] || '00:00:00'
      const [horas, minutos, segundos] = tempoFalado.split(':').map(Number)
      const tempoTotalMinutos = horas * 60 + minutos + segundos / 60
      
      if (tempoTotalMinutos > 0) {
        operatorData[operator].totalAtendimentos++
        operatorData[operator].temposFalado.push(tempoTotalMinutos)
      }
      
      // Coletar tempos de espera
      const tempoEspera = row['Tempo De Espera'] || '00:00:00'
      const [horasEspera, minutosEspera, segundosEspera] = tempoEspera.split(':').map(Number)
      const tempoEsperaMinutos = horasEspera * 60 + minutosEspera + segundosEspera / 60
      if (tempoEsperaMinutos > 0) {
        operatorData[operator].temposEspera.push(tempoEsperaMinutos)
      }
      
      // Coletar tempos na URA
      const tempoURA = row['Tempo Na Ura'] || '00:00:00'
      const [horasURA, minutosURA, segundosURA] = tempoURA.split(':').map(Number)
      const tempoURAMinutos = horasURA * 60 + minutosURA + segundosURA / 60
      if (tempoURAMinutos > 0) {
        operatorData[operator].temposURA.push(tempoURAMinutos)
      }
      
      // Coletar notas de atendimento
      const notaAtendimento = parseFloat(row['Pergunta2 1 PERGUNTA ATENDENTE']) || 0
      if (notaAtendimento > 0 && notaAtendimento <= 5) {
        operatorData[operator].notasAtendimento.push(notaAtendimento)
      }
      
      // Coletar notas de solução
      const notaSolucao = parseFloat(row['Pergunta2 2 PERGUNTA SOLUCAO']) || 0
      if (notaSolucao > 0 && notaSolucao <= 5) {
        operatorData[operator].notasSolucao.push(notaSolucao)
      }
    })

    // Calcular médias para cada operador
    Object.keys(operatorData).forEach(operator => {
      const op = operatorData[operator]
      
      // Duração média de atendimento
      op.avgDuration = op.temposFalado.length > 0 
        ? op.temposFalado.reduce((sum, tempo) => sum + tempo, 0) / op.temposFalado.length
        : 0
      
      // Tempo médio de espera
      op.avgWaitTime = op.temposEspera.length > 0
        ? op.temposEspera.reduce((sum, tempo) => sum + tempo, 0) / op.temposEspera.length
        : 0
      
      // Tempo médio na URA
      op.avgURATime = op.temposURA.length > 0
        ? op.temposURA.reduce((sum, tempo) => sum + tempo, 0) / op.temposURA.length
        : 0
      
      // Nota média de atendimento
      op.avgRatingAttendance = op.notasAtendimento.length > 0
        ? op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length
        : 0
      
      // Nota média de solução
      op.avgRatingSolution = op.notasSolucao.length > 0
        ? op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length
        : 0
    })

    console.log('👥 Métricas por operador calculadas:', Object.keys(operatorData).length, 'operadores')
    
    // Debug: mostrar alguns operadores
    Object.entries(operatorData).slice(0, 3).forEach(([name, metrics]) => {
      console.log(`👤 ${name}:`, {
        atendimentos: metrics.totalAtendimentos,
        duracaoMedia: metrics.avgDuration.toFixed(1),
        notaAtendimento: metrics.avgRatingAttendance.toFixed(1),
        notaSolucao: metrics.avgRatingSolution.toFixed(1)
      })
    })

    return operatorData
  }

  // Calcular rankings
  const calculateRankings = (operatorMetrics) => {
    console.log('🏆 Calculando rankings para', Object.keys(operatorMetrics).length, 'operadores')
    console.log('📋 Dark List ativa:', darkList.length, 'operadores excluídos')
    
    const operators = Object.keys(operatorMetrics)
    
    // Normalizar valores para score (0-1)
    const maxCalls = Math.max(...operators.map(op => operatorMetrics[op].totalAtendimentos))
    const maxDuration = Math.max(...operators.map(op => operatorMetrics[op].avgDuration))
    const maxRatingAttendance = Math.max(...operators.map(op => operatorMetrics[op].avgRatingAttendance))
    const maxRatingSolution = Math.max(...operators.map(op => operatorMetrics[op].avgRatingSolution))
    const maxWaitTime = Math.max(...operators.map(op => operatorMetrics[op].avgWaitTime))
    
    console.log('📊 Valores máximos para normalização:', {
      maxCalls,
      maxDuration: maxDuration.toFixed(1),
      maxRatingAttendance: maxRatingAttendance.toFixed(1),
      maxRatingSolution: maxRatingSolution.toFixed(1),
      maxWaitTime: maxWaitTime.toFixed(1)
    })

    const rankings = operators.map(operator => {
      const metrics = operatorMetrics[operator]
      
      // Evitar divisão por zero
      const normalizedCalls = maxCalls > 0 ? metrics.totalAtendimentos / maxCalls : 0
      const normalizedDuration = maxDuration > 0 ? metrics.avgDuration / maxDuration : 0
      const normalizedRatingAttendance = maxRatingAttendance > 0 ? metrics.avgRatingAttendance / maxRatingAttendance : 0
      const normalizedRatingSolution = maxRatingSolution > 0 ? metrics.avgRatingSolution / maxRatingSolution : 0
      const normalizedWaitTime = maxWaitTime > 0 ? metrics.avgWaitTime / maxWaitTime : 0
      
      const score = 
        0.35 * normalizedCalls +
        0.20 * (1 - normalizedDuration) +
        0.20 * normalizedRatingAttendance +
        0.20 * normalizedRatingSolution -
        0.05 * normalizedWaitTime

      return {
        operator,
        score: Math.max(0, score * 100).toFixed(1), // Garantir score positivo
        totalAtendimentos: metrics.totalAtendimentos,
        avgDuration: metrics.avgDuration.toFixed(1),
        avgRatingAttendance: metrics.avgRatingAttendance.toFixed(1),
        avgRatingSolution: metrics.avgRatingSolution.toFixed(1),
        avgWaitTime: metrics.avgWaitTime.toFixed(1),
        isExcluded: darkList.includes(operator), // Marcar se está na dark list
        isDesligado: operator.toLowerCase().includes('desl') || 
                    operator.toLowerCase().includes('desligado') ||
                    operator.toLowerCase().includes('excluído') ||
                    operator.toLowerCase().includes('inativo')
      }
    })

    // Ordenar por score (maior primeiro)
    const sortedRankings = rankings.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    
    console.log('🏆 Rankings calculados:', sortedRankings.length, 'posições')
    
    // Debug: mostrar top 3
    sortedRankings.slice(0, 3).forEach((ranking, index) => {
      console.log(`${index + 1}º ${ranking.operator}:`, {
        score: ranking.score,
        atendimentos: ranking.totalAtendimentos,
        duracao: ranking.avgDuration,
        notaAtendimento: ranking.avgRatingAttendance,
        notaSolucao: ranking.avgRatingSolution,
        excluido: ranking.isExcluded
      })
    })

    return sortedRankings
  }

  // Funções para gerenciar Dark List
  const addToDarkList = useCallback((operatorName) => {
    if (!darkList.includes(operatorName)) {
      const newDarkList = [...darkList, operatorName]
      setDarkList(newDarkList)
      localStorage.setItem('veloinsights_darklist', JSON.stringify(newDarkList))
      console.log('🚫 Operador adicionado à Dark List:', operatorName)
    }
  }, [darkList])

  const removeFromDarkList = useCallback((operatorName) => {
    const newDarkList = darkList.filter(name => name !== operatorName)
    setDarkList(newDarkList)
    localStorage.setItem('veloinsights_darklist', JSON.stringify(newDarkList))
    console.log('✅ Operador removido da Dark List:', operatorName)
  }, [darkList])

  const clearDarkList = useCallback(() => {
    setDarkList([])
    localStorage.removeItem('veloinsights_darklist')
    console.log('🗑️ Dark List limpa')
  }, [])

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

  // Função para buscar dados por período específico
  const fetchDataByPeriod = useCallback(async (period) => {
    if (!isAuthenticated || !userData) {
      console.error('❌ Usuário não autenticado!')
      return
    }
    
    console.log(`🔄 Buscando dados para período: ${period}`)
    await fetchSheetData(userData.accessToken, period)
  }, [isAuthenticated, userData, fetchSheetData])

  // Função para filtrar dados por data
  const filterDataByDateRange = useCallback((startDate, endDate) => {
    if (!data || data.length === 0) return []
    
    const filtered = data.filter(row => {
      const rowDate = new Date(row['Data'])
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      return rowDate >= start && rowDate <= end
    })
    
    console.log(`📅 Dados filtrados: ${filtered.length} de ${data.length} registros`)
    return filtered
  }, [data])

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
    selectedPeriod,
    customDateRange,
    fetchSheetData,
    fetchDataByPeriod,
    filterDataByDateRange,
    setSelectedPeriod,
    setCustomDateRange,
    signIn,
    signOut,
    clearData,
    // Dark List functions
    darkList,
    addToDarkList,
    removeFromDarkList,
    clearDarkList
  }
}
