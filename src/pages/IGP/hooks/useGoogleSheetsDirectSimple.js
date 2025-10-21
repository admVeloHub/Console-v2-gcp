// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import { useState, useEffect, useCallback } from 'react'
import { processarDados } from '../utils/dataProcessor'
import { VELOINSIGHTS_CONFIG } from '../../../config/veloinsights'

// Função para processamento assíncrono otimizado
const processarDadosAssincrono = async (dados, processAllRecords = false) => {
  // Processamento direto sem setTimeout para máxima performance
  const startTime = performance.now()
  const resultado = processarDados(dados, processAllRecords)
  const endTime = performance.now()
  
  return resultado
}

// Função para filtrar dados por período baseado na coluna de data
const filterDataByPeriod = (data, selectedPeriod, offsetDays = 0) => {
  if (!data || data.length === 0) return data
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Aplicar offset se especificado
  if (offsetDays !== 0) {
    today.setDate(today.getDate() + offsetDays)
  }
  
  // Encontrar índice da coluna de data (coluna D = índice 3)
  const headerRow = data[0]
  let dateColumnIndex = headerRow.findIndex(col => 
    col && col.toLowerCase().includes('data')
  )
  
  // Se não encontrar por nome, usar índice 3 (coluna D)
  if (dateColumnIndex === -1) {
    dateColumnIndex = 3
  } else {
  }
  
  // Detectar o ano dos dados automaticamente
  let dataYear = now.getFullYear()
  if (data.length > 1) {
    // Verificar mais datas para detectar o ano
    for (let i = 1; i <= Math.min(50, data.length - 1); i++) {
      const dateStr = data[i][dateColumnIndex]
      if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const year = parseInt(parts[2])
          if (year > 2000) {
            dataYear = year
            // Debug removido para melhor performance
            break
          }
        }
      }
    }
  }
  
  // Debug removido para melhor performance
  
  // Se não conseguiu detectar o ano, assumir 2025 (baseado nos logs anteriores)
  if (dataYear === now.getFullYear()) {
    // Debug removido para melhor performance
    dataYear = 2025
  }
  
  // Debug removido para melhor performance
  // Debug removido para melhor performance
  // Debug removido para melhor performance
  // Debug removido para melhor performance
  
  let validRecords = 0
  let invalidRecords = 0
  
  const filteredData = data.filter((row, index) => {
    // Manter cabeçalho
    if (index === 0) return true
    
    // Se selectedPeriod for 'all', retornar todos os dados sem validação de data
    if (selectedPeriod === 'all') {
      validRecords++
      return true
    }
    
    const dateStr = row[dateColumnIndex]
    if (!dateStr) {
      invalidRecords++
      return false
    }
    
    try {
      // Tentar diferentes formatos de data
      let rowDate
      if (dateStr.includes('/')) {
        // Formato DD/MM/YYYY ou DD/MM/YY
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1 // Mês é 0-indexado
          const year = parseInt(parts[2])
          // Se ano tem 2 dígitos, assumir 20xx
          const fullYear = year < 100 ? 2000 + year : year
          rowDate = new Date(fullYear, month, day)
        }
      } else {
        // Formato ISO ou outros
        rowDate = new Date(dateStr)
      }
      
      if (isNaN(rowDate.getTime())) {
        invalidRecords++
        return false
      }
      
      const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
      
      let shouldInclude = false
      
      switch (selectedPeriod) {
        case 'last7Days':
          // Usar o ano detectado nos dados
          const sevenDaysAgo = new Date(dataYear, today.getMonth(), today.getDate() - 7)
          shouldInclude = rowDateOnly >= sevenDaysAgo && rowDateOnly.getFullYear() === dataYear
          break
          
        case 'last15Days':
          // Usar o ano detectado nos dados
          const fifteenDaysAgo = new Date(dataYear, today.getMonth(), today.getDate() - 15)
          shouldInclude = rowDateOnly >= fifteenDaysAgo && rowDateOnly.getFullYear() === dataYear
          break
          
        case 'lastMonth':
          // Usar o ano detectado nos dados
          const lastMonth = new Date(dataYear, today.getMonth() - 1, today.getDate())
          shouldInclude = rowDateOnly.getMonth() === lastMonth.getMonth() && 
                         rowDateOnly.getFullYear() === dataYear
          break
          
        case 'penultimateMonth':
          // Usar o ano detectado nos dados
          const penultimateMonth = new Date(dataYear, today.getMonth() - 2, today.getDate())
          shouldInclude = rowDateOnly.getMonth() === penultimateMonth.getMonth() && 
                         rowDateOnly.getFullYear() === dataYear
          break
          
        case 'currentMonth':
          // Usar o ano detectado nos dados
          shouldInclude = rowDateOnly.getMonth() === today.getMonth() && 
                         rowDateOnly.getFullYear() === dataYear
          break
          
        default:
          shouldInclude = true
          break
      }
      
      if (shouldInclude) {
        validRecords++
      } else {
        invalidRecords++
      }
      
      return shouldInclude
      
    } catch (error) {
      console.warn(`⚠️ Erro ao processar data: ${dateStr}`, error)
      invalidRecords++
      return false
    }
  })
  
  // Debug removido para melhor performance
  // Debug removido para melhor performance
  // Debug removido para melhor performance
  
  // Debug: mostrar algumas datas filtradas
  if (filteredData.length > 1) {
    // Debug removido para melhor performance
    for (let i = 1; i <= Math.min(3, filteredData.length - 1); i++) {
      // Debug removido para melhor performance
    }
  } else {
    // Debug removido para melhor performance
  }
  
  return filteredData
}

// Função para processamento completo com progresso
const processarTodosOsDadosComProgresso = async (dados, onProgress) => {
  return new Promise((resolve) => {
    
    const totalRecords = dados.length - 1 // Excluir cabeçalho
    let processedRecords = 0
    
    // Simular progresso em chunks
    const processChunk = () => {
      const chunkSize = Math.max(1000, Math.floor(totalRecords / 100)) // Processar em chunks de pelo menos 1000 registros
      const endIndex = Math.min(processedRecords + chunkSize, totalRecords)
      
      // Simular processamento do chunk
      setTimeout(() => {
        processedRecords = endIndex
        const progress = (processedRecords / totalRecords) * 100
        
        // Atualizar progresso
        if (onProgress) {
          onProgress(progress, processedRecords, totalRecords)
        }
        
        if (processedRecords < totalRecords) {
          // Continuar processamento
          processChunk()
        } else {
          // Processamento completo - agora processar os dados reais
          const startTime = performance.now()
          const resultado = processarDados(dados, true) // processAllRecords = true
          const endTime = performance.now()
          
          resolve(resultado)
        }
      }, 50) // Delay pequeno para mostrar progresso
    }
    
    // Iniciar processamento
    processChunk()
  })
}

export const useGoogleSheetsDirectSimple = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [fullDataset, setFullDataset] = useState([]) // Dataset completo da planilha
  const [selectedPeriod, setSelectedPeriod] = useState(null) // Período selecionado pelo usuário
  const [isProcessingAllRecords, setIsProcessingAllRecords] = useState(false) // Estado para processamento completo
  const [processingProgress, setProcessingProgress] = useState(0) // Progresso do processamento (0-100)
  const [totalRecordsToProcess, setTotalRecordsToProcess] = useState(0) // Total de registros para processar

  // Configurações
  const SPREADSHEET_ID = VELOINSIGHTS_CONFIG.SPREADSHEET_ID
  const SHEET_RANGE_INITIAL = 'Base!A1:AC150000' // Atualizado para 150k linhas
  const SHEET_RANGE_FULL = 'Base!A1:AC150000'
  const CLIENT_ID = VELOINSIGHTS_CONFIG.GOOGLE_CLIENT_ID
  const DOMINIO_PERMITIDO = '@velotax.com.br'
  
  // Estado para controle de período
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  
  // Dark List removida - todos os operadores são contabilizados normalmente

  // Verificar configuração
  useEffect(() => {
    if (!CLIENT_ID) {
      setErrors(prev => [...prev, '❌ Configure o Client ID do Google no arquivo .env! Consulte GOOGLE_SSO_SETUP.md para instruções detalhadas.'])
    } else {
    }
  }, [CLIENT_ID])

  // Função para trocar código por tokens (sem useCallback para evitar dependências)
  const exchangeCodeForTokens = async (authCode) => {
    try {
      setIsLoading(true)
      
      const redirectUri = `${window.location.origin}/callback.html`
      const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET
      
      
      if (!clientSecret) {
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
        const errorData = await response.json()
        throw new Error(`Erro ao trocar código por token: ${errorData.error_description || errorData.error}`)
      }

      const tokenData = await response.json()

      // Obter informações do usuário do Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`)
      
      if (!userResponse.ok) {
        throw new Error('Erro ao obter informações do usuário')
      }
      
      const googleUserInfo = await userResponse.json()
      
      
      // Validar domínio do usuário
      if (!googleUserInfo.email || !googleUserInfo.email.endsWith(DOMINIO_PERMITIDO)) {
        throw new Error(`Acesso restrito ao domínio ${DOMINIO_PERMITIDO}. Seu email: ${googleUserInfo.email}`)
      }

      // Salvar dados do usuário
      const userInfo = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture
      }

      setUserData(userInfo)
      setIsAuthenticated(true)
      
      // Salvar no localStorage
      localStorage.setItem('veloinsights_user', JSON.stringify(userInfo))
      
      // Debug removido para melhor performance
      
      // Buscar dados automaticamente após login
      try {
        // Debug removido para melhor performance
        await fetchSheetData(tokenData.access_token)
      } catch (error) {
        console.error('❌ Erro ao carregar dados após login:', error)
      }
      
    } catch (error) {
      console.error('❌ Erro ao trocar código por token:', error)
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar código de autorização na URL e localStorage
  useEffect(() => {
    if (!CLIENT_ID) return

    // Verificar no query string
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${error}`])
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authCode) {
      exchangeCodeForTokens(authCode)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Verificar localStorage
    const storedAuthCode = localStorage.getItem('google_auth_code')
    const storedAuthError = localStorage.getItem('google_auth_error')
    
    if (storedAuthCode) {
      // Debug removido para melhor performance
      exchangeCodeForTokens(storedAuthCode)
      localStorage.removeItem('google_auth_code')
    }
    
    if (storedAuthError) {
      console.error('❌ Erro de autorização:', storedAuthError)
      setErrors(prev => [...prev, `❌ Erro de autenticação: ${storedAuthError}`])
      localStorage.removeItem('google_auth_error')
    }
  }, [CLIENT_ID])

  // Verificar se já está logado
  useEffect(() => {
    const savedUser = localStorage.getItem('veloinsights_user')
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        if (userInfo.expiresAt > Date.now()) {
          setUserData(userInfo)
          setIsAuthenticated(true)
          
          // NÃO carregar dados automaticamente - aguardar seleção de período
        } else {
          localStorage.removeItem('veloinsights_user')
          // Debug removido para melhor performance
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('veloinsights_user')
      }
    }
  }, [])

  // Função de login simplificada
  const signIn = async () => {
    try {
      if (!CLIENT_ID) {
        throw new Error('Client ID não configurado. Consulte GOOGLE_SSO_SETUP.md para instruções.')
      }

      const redirectUri = `${window.location.origin}/callback.html`
      const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly profile email'
      const responseType = 'code'
      
      // URL simplificada para evitar 2FA
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=online&` +
        `prompt=select_account`

      // Debug removido para melhor performance
      // Debug removido para melhor performance
      window.location.href = authUrl
      
    } catch (error) {
      console.error('❌ Erro ao iniciar login:', error)
      setErrors(prev => [...prev, `❌ Erro de login: ${error.message}`])
    }
  }

  // Função de logout
  const signOut = async () => {
    try {
      setUserData(null)
      setIsAuthenticated(false)
      setData([])
      setMetrics({})
      setOperatorMetrics({})
      setRankings([])
      setOperators([])
      
      localStorage.removeItem('veloinsights_user')
      localStorage.removeItem('google_auth_code')
      localStorage.removeItem('google_auth_error')
      
      // Debug removido para melhor performance
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
    }
  }

  // Função para carregar dados sob demanda (quando período é selecionado)
  const loadDataOnDemand = async (selectedPeriod = 'all') => {
    if (!userData?.accessToken) {
      console.error('❌ Usuário não autenticado')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Para operadores, carregar TODOS os registros históricos
      const loadDataFunction = userData.email?.includes('@velotax.com.br') 
        ? fetchFullDataset(userData.accessToken, selectedPeriod)
        : fetchSheetData(userData.accessToken, selectedPeriod)
      
      await loadDataFunction
      // Debug removido para melhor performance
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar dados de período anterior para comparação
  const loadPreviousPeriodData = useCallback(async (currentPeriod) => {
    if (!userData?.accessToken || !fullDataset || fullDataset.length === 0) {
      return []
    }

    try {
      
      let previousPeriodData = []
      
      switch (currentPeriod) {
        case 'last7Days':
          // Comparar com os 7 dias anteriores aos últimos 7 dias
          previousPeriodData = filterDataByPeriod(fullDataset, 'last7Days', -7) // -7 dias de offset
          break
        case 'last15Days':
          // Comparar com os 15 dias anteriores aos últimos 15 dias
          previousPeriodData = filterDataByPeriod(fullDataset, 'last15Days', -15) // -15 dias de offset
          break
        case 'last30Days':
          // Comparar com os 30 dias anteriores aos últimos 30 dias
          previousPeriodData = filterDataByPeriod(fullDataset, 'last30Days', -30) // -30 dias de offset
          break
        case 'currentMonth':
          // Comparar com o mês anterior
          previousPeriodData = filterDataByPeriod(fullDataset, 'currentMonth', -1) // -1 mês de offset
          break
        default:
          // Para outros períodos, não há comparação
          return []
      }
      
      // Debug removido para melhor performance
      return previousPeriodData
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do período anterior:', error)
      return []
    }
  }, [userData?.accessToken, fullDataset])

  // Função para buscar todos os dados da planilha
  const fetchFullDataset = async (accessToken, selectedPeriod = 'all') => {
    try {
      setIsLoading(true)
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE_FULL}?access_token=${accessToken}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        
        // Armazenar dataset completo
        setFullDataset(result.values)
        
        // FILTRAGEM POR PERÍODO: aplicar filtro baseado no período selecionado
        const filteredData = filterDataByPeriod(result.values, selectedPeriod)
        
        
        // Processamento assíncrono com progresso
        const dadosProcessados = await processarDadosAssincrono(filteredData, true) // processAllRecords = true
        
        // Atualizar estados com dados processados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        
        // Validar metricasOperadores antes de usar Object.values()
        if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
          setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
            operator: op.operador,
            totalCalls: op.totalAtendimentos,
            avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
            avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
            avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
            avgPauseTime: 0,
            totalRecords: op.totalAtendimentos
          })))
        } else {
          console.warn('⚠️ metricasOperadores não está disponível, definindo como objeto vazio')
          setOperatorMetrics({})
        }
        setRankings(dadosProcessados.rankings.map(ranking => ({
          ...ranking,
          isExcluded: false // Todos os operadores são incluídos
        })))
        setOperators(dadosProcessados.operadores)
        
        return dadosProcessados
      } else {
        throw new Error('Nenhum dado encontrado na planilha')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dataset completo:', error)
      setErrors(prev => [...prev, error.message])
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar TODOS OS REGISTROS com progresso
  const loadAllRecordsWithProgress = useCallback(async (accessToken) => {
    try {
      setIsProcessingAllRecords(true)
      setProcessingProgress(0)
      // Debug removido para melhor performance
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE_FULL}?access_token=${accessToken}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        // Debug removido para melhor performance
        
        // Definir total de registros para processar (excluindo cabeçalho)
        setTotalRecordsToProcess(result.values.length - 1)
        
        // Processar TODOS os dados com progresso
        const dadosProcessados = await processarTodosOsDadosComProgresso(
          result.values,
          (progress, processed, total) => {
            setProcessingProgress(progress)
            // Debug removido para melhor performance
          }
        )
        
        // Atualizar estados com TODOS os dados processados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        
        // Validar metricasOperadores antes de usar Object.values()
        if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
          setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
            operator: op.operador,
            totalCalls: op.totalAtendimentos,
            avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
            avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
            avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
            avgPauseTime: 0,
            totalRecords: op.totalAtendimentos
          })))
        } else {
          console.warn('⚠️ metricasOperadores não está disponível, definindo como objeto vazio')
          setOperatorMetrics({})
        }
        setRankings(dadosProcessados.rankings.map(ranking => ({
          ...ranking,
          isExcluded: false // Todos os operadores são incluídos
        })))
        setOperators(dadosProcessados.operadores)
        
        // Debug removido para melhor performance
        // console.log(`📊 Debug - Dados processados (TODOS): {dadosFiltrados: ${dadosProcessados.dadosFiltrados.length}, metricas: {...}, metricasOperadores: ${Object.keys(dadosProcessados.metricasOperadores).length}, rankings: ${dadosProcessados.rankings.length}, operadores: ${dadosProcessados.operadores.length}}`)
        
        return dadosProcessados
      } else {
        throw new Error('Nenhum dado encontrado na planilha')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar TODOS OS REGISTROS:', error)
      setErrors(prev => [...prev, `❌ Erro ao carregar todos os registros: ${error.message}`])
      throw error
    } finally {
      setIsProcessingAllRecords(false)
      setProcessingProgress(0)
    }
  }, [])

  // Função para filtrar dados por período (renomeada para evitar conflito)
  const filterDataByDateRange = (startDate, endDate) => {
    if (!fullDataset || fullDataset.length === 0) {
      console.warn('⚠️ Dataset completo não carregado')
      return []
    }

    // Converter datas para comparação - INCLUIR DIAS COMPLETOS
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0) // Início do dia (00:00:00)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Final do dia (23:59:59)

    let contadorValidos = 0
    let contadorInvalidos = 0
    let contadorForaPeriodo = 0
    let datasEncontradas = new Set()

    // Filtrar dados (assumindo que a coluna de data é a coluna 3 - índice 3)
    const dadosFiltrados = fullDataset.filter((row, index) => {
      if (index === 0) return false // Pular cabeçalho
      
      const dataStr = row[3] // Coluna de data
      if (!dataStr) {
        contadorInvalidos++
        return false
      }

      try {
        // Converter data brasileira (DD/MM/YYYY) para Date
        const [day, month, year] = dataStr.split('/')
        const dataRegistro = new Date(year, month - 1, day)
        
        // Adicionar data ao conjunto para debug
        datasEncontradas.add(dataStr)
        
        // Comparar apenas as datas (sem horário)
        const dataRegistroInicio = new Date(year, month - 1, day, 0, 0, 0, 0)
        const dataRegistroFim = new Date(year, month - 1, day, 23, 59, 59, 999)
        
        
        // Verificar se a data está dentro do período (incluindo os dias completos)
        if (dataRegistro >= start && dataRegistro <= end) {
          contadorValidos++
          return true
        } else {
          contadorForaPeriodo++
          return false
        }
      } catch (error) {
        console.warn('Data inválida encontrada:', dataStr, error)
        contadorInvalidos++
        return false
      }
    })

    // console.log(`📊 Debug da filtragem:`)
    // Debug removido para melhor performance
    // Debug removido para melhor performance
    // Debug removido para melhor performance
    // Debug removido para melhor performance
    // Debug removido para melhor performance
    
    // Debug específico para encontrar o registro perdido
    if (contadorValidos !== 1228) {
      console.warn(`⚠️ Diferença encontrada: Esperado 1228, encontrado ${contadorValidos}`)
    }
    
    return dadosFiltrados
  }

  // Função para processar dados de um período específico
  const processPeriodData = async (startDate, endDate) => {
    try {
      setIsLoading(true)
      setSelectedPeriod({ startDate, endDate })
      
      const dadosFiltrados = filterDataByDateRange(startDate, endDate)
      
      if (dadosFiltrados.length === 0) {
        console.warn('⚠️ Nenhum dado encontrado para o período selecionado')
        // Limpar dados atuais
        setData([])
        setMetrics({})
        setOperatorMetrics([])
        setRankings([])
        setOperators([])
        return
      }

      // Processar dados do período (OTIMIZADO)
      // Debug removido para melhor performance
      const dadosProcessados = await processarDadosAssincrono(dadosFiltrados, true) // processAllRecords = true
      
      // Converter metricasOperadores para o formato esperado pelo AgentAnalysis
      const operatorMetricsObj = {}
      if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
        Object.values(dadosProcessados.metricasOperadores).forEach(op => {
          // Filtrar apenas operadores com nomes válidos (excluir "Sem Operador", etc.)
          if (op.operador && 
              op.operador !== 'Sem Operador' && 
              !op.operador.toLowerCase().includes('sem operador') &&
              op.operador.trim().includes(' ') && // Deve ter pelo menos um espaço (nome completo)
              op.totalAtendimentos > 0) {
            
            operatorMetricsObj[op.operador] = {
              operator: op.operador,
              totalCalls: op.totalAtendimentos,
              avgDuration: parseFloat(op.tempoMedio?.toFixed(1) || 0),
              avgRatingAttendance: parseFloat(op.notaMediaAtendimento?.toFixed(1) || 0),
              avgRatingSolution: parseFloat(op.notaMediaSolucao?.toFixed(1) || 0),
              avgPauseTime: 0,
              totalRecords: op.totalAtendimentos,
              score: parseFloat(op.score?.toFixed(2) || 0)
            }
          }
        })
      } else {
        console.warn('⚠️ metricasOperadores não está disponível para processamento de período')
      }
      
      // Aplicar Dark List aos rankings
      const rankingsComDarkList = dadosProcessados.rankings.map(ranking => ({
        ...ranking,
        isExcluded: darkList.includes(ranking.operator)
      }))
      
      // Atualizar estados
      setData(dadosProcessados.dadosFiltrados)
      setMetrics(dadosProcessados.metricas)
      setOperatorMetrics(operatorMetricsObj)
      setRankings(rankingsComDarkList)
      setOperators(dadosProcessados.operadores)
      
      // Debug removido para melhor performance
      
    } catch (error) {
      console.error('❌ Erro ao processar dados do período:', error)
      setErrors(prev => [...prev, error.message])
    } finally {
      setIsLoading(false)
    }
  }

  // Função para renovar token de acesso
  const refreshAccessToken = async () => {
    if (!userData?.refreshToken) {
      throw new Error('Refresh token não disponível')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
        refresh_token: userData.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao renovar token')
    }

    const tokenData = await response.json()
    
    // Atualizar userData com novo token
    const updatedUserData = {
      ...userData,
      accessToken: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    }
    
    setUserData(updatedUserData)
    localStorage.setItem('veloinsights_user', JSON.stringify(updatedUserData))
    
    // Debug removido para melhor performance
  }

  // Função para buscar dados dos últimos 60 dias
  const fetchLast60Days = async (accessToken) => {
    try {
      setIsLoading(true)
      // Debug removido para melhor performance
      
      // Verificar se o token está válido
      let tokenToUse = accessToken
      if (!tokenToUse && userData) {
        // Verificar se o token expirou
        if (userData.expiresAt && Date.now() > userData.expiresAt) {
          // Debug removido para melhor performance
          await refreshAccessToken()
          tokenToUse = userData.accessToken
        } else {
          tokenToUse = userData.accessToken
        }
      }
      
      if (!tokenToUse) {
        throw new Error('Token de acesso não disponível')
      }
      
      // Usar range maior para garantir que temos dados dos últimos 60 dias
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE_FULL}?access_token=${tokenToUse}`
      
      console.log('🔗 URL da API:', url.replace(tokenToUse, '***'))
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.values && result.values.length > 0) {
        // Debug removido para melhor performance
        
        // Processar dados (já filtra os últimos 60 dias) - OTIMIZADO
        // Debug removido para melhor performance
        const dadosProcessados = await processarDadosAssincrono(result.values, true) // processAllRecords = true
        
        // console.log('📊 Debug - Dados processados (últimos 60 dias):', {
        //   dadosFiltrados: dadosProcessados.dadosFiltrados.length,
        //   metricas: dadosProcessados.metricas,
        //   metricasOperadores: Object.keys(dadosProcessados.metricasOperadores).length,
        //   rankings: dadosProcessados.rankings.length,
        //   operadores: dadosProcessados.operadores.length
        // })
        
        // Converter metricasOperadores para o formato esperado pelo AgentAnalysis
        const operatorMetricsObj = {}
        if (dadosProcessados.metricasOperadores && typeof dadosProcessados.metricasOperadores === 'object') {
          Object.values(dadosProcessados.metricasOperadores).forEach(op => {
            // Filtrar apenas operadores com nomes válidos (excluir apenas os realmente inválidos)
            if (op.operador && 
                op.operador !== 'Sem Operador' && 
                !op.operador.toLowerCase().includes('sem operador') &&
                !op.operador.toLowerCase().includes('desligado') &&
                !op.operador.toLowerCase().includes('excluído') &&
                !op.operador.toLowerCase().includes('inativo') &&
                op.totalAtendimentos > 0) {
              
              operatorMetricsObj[op.operador] = {
                operator: op.operador,
                totalCalls: op.totalAtendimentos,
                avgDuration: parseFloat(op.tempoMedio?.toFixed(1) || 0),
                avgRatingAttendance: parseFloat(op.notaMediaAtendimento?.toFixed(1) || 0),
                avgRatingSolution: parseFloat(op.notaMediaSolucao?.toFixed(1) || 0),
                avgPauseTime: 0,
                totalRecords: op.totalAtendimentos,
                score: parseFloat(op.score?.toFixed(2) || 0)
              }
            }
          })
        } else {
          console.warn('⚠️ metricasOperadores não está disponível para processamento completo')
        }
        
        
        // Aplicar Dark List aos rankings
        const rankingsComDarkList = dadosProcessados.rankings.map(ranking => ({
          ...ranking,
          isExcluded: false // Todos os operadores são incluídos
        }))
        
        // Atualizar estados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        setOperatorMetrics(operatorMetricsObj)
        setRankings(rankingsComDarkList)
        setOperators(dadosProcessados.operadores)
        setErrors(dadosProcessados.erros || [])
        setFullDataset(result.values)
        
        // Debug removido para melhor performance
      } else {
        console.log('⚠️ Nenhum dado encontrado')
        setData([])
        setMetrics({})
        setOperatorMetrics({})
        setRankings([])
        setOperators([])
        setErrors(['Nenhum dado encontrado na planilha'])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      if (error.name === 'AbortError') {
        setErrors(['Timeout: A requisição demorou muito para responder. Tente novamente.'])
      } else {
        setErrors([`Erro ao carregar dados: ${error.message}`])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Função para buscar dados (simplificada) - CARREGAMENTO COMPLETO RESTAURADO
  const fetchSheetData = async (accessToken, mode = 'recent') => {
    // Para operadores (@velotax.com.br), buscar TODOS os dados históricos
    if (userData?.email?.includes('@velotax.com.br')) {
      // Debug removido para melhor performance
      return await fetchFullDataset(accessToken)
    }
    
    // Para outros usuários, buscar dados dos últimos 60 dias
    return await fetchLast60Days(accessToken)
  }

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
    fullDataset, // Dataset completo da planilha
    // Dark List removida - todos os operadores são contabilizados normalmente
    // Novos estados para processamento completo
    isProcessingAllRecords,
    processingProgress,
    totalRecordsToProcess,
    // Funções existentes
    fetchSheetData,
    fetchLast60Days,
    fetchFullDataset,
    processPeriodData,
    filterDataByPeriod,
    fetchDataByPeriod: fetchSheetData,
    filterDataByDateRange: filterDataByDateRange,
    // Nova função para carregar todos os registros
    loadAllRecordsWithProgress,
    // Nova função para carregar dados sob demanda
    loadDataOnDemand,
    // Nova função para carregar dados do período anterior
    loadPreviousPeriodData,
    setSelectedPeriod,
    setCustomDateRange,
    signIn,
    signOut,
    clearData: () => {
      setData([])
      setMetrics({})
      setOperatorMetrics({})
      setRankings([])
      setOperators([])
      setErrors([])
    }
    // Funções da Dark List removidas - todos os operadores são contabilizados normalmente
  }
}
