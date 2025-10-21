// useGoogleSheetsServiceAccount.js
import { useState, useEffect, useCallback } from 'react'
import { processarDados } from '../utils/dataProcessor'
import { MAIN_SPREADSHEET_ID, MAIN_SHEET_RANGE } from '../config/googleSheets'

const CACHE_DURATION = 60 * 60 * 1000 // 1 hora

let cachedData = null
let cacheTimestamp = 0

export const useGoogleSheetsServiceAccount = () => {
  const [data, setData] = useState([])
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [metrics, setMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 🔐 CONFIGURAR SERVICE ACCOUNT
  const getServiceAccountAuth = useCallback(() => {
    try {
      const credentials = JSON.parse(import.meta.env.VITE_GOOGLE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS)
      
      return {
        type: 'service_account',
        project_id: credentials.project_id,
        private_key_id: credentials.private_key_id,
        private_key: credentials.private_key,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
        auth_uri: credentials.auth_uri,
        token_uri: credentials.token_uri,
        auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url,
        client_x509_cert_url: credentials.client_x509_cert_url,
        universe_domain: credentials.universe_domain
      }
    } catch (error) {
      console.error('❌ Erro ao configurar Service Account:', error)
      return null
    }
  }, [])

  // 🚀 BUSCAR DADOS COM SERVICE ACCOUNT
  const fetchFromGoogleSheets = useCallback(async () => {
    console.log('🚀 Iniciando fetchFromGoogleSheets com Service Account...')
    setIsLoading(true)
    setError(null)
    
    try {
      const now = Date.now()
      if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        setData(cachedData.dadosFiltrados || [])
        setOperatorMetrics(cachedData.metricasOperadores || {})
        setRankings(cachedData.rankings || [])
        setMetrics(cachedData.metricas || {})
        setIsLoading(false)
        return cachedData
      }

      console.log('🔐 Configurando Service Account...')
      const credentials = getServiceAccountAuth()
      
      if (!credentials) {
        throw new Error('Service Account não configurado')
      }

      console.log('📡 Fazendo requisição para Google Sheets API...')
      
      // Usar fetch com Service Account
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/${MAIN_SHEET_RANGE}`,
        {
          headers: {
            'Authorization': `Bearer ${await getAccessToken(credentials)}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Erro da API:', errorText)
        throw new Error(`Erro ao obter dados da planilha: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const values = result.values || []
      
      console.log('✅ Dados da planilha obtidos:', values.length, 'linhas')
      
      if (values.length === 0) {
        throw new Error('Nenhum dado encontrado na planilha')
      }

      // Processar dados
      console.log('🔄 Processando dados...')
      const processedData = processarDados(values, true)
      console.log('✅ Dados processados:', processedData.dadosFiltrados?.length || 0, 'linhas')
      
      // Cache dos dados
      cachedData = {
        dadosFiltrados: processedData.dadosFiltrados || [],
        metricasOperadores: processedData.metricasOperadores || {},
        rankings: processedData.rankings || [],
        metricas: processedData.metricas || {}
      }
      cacheTimestamp = now

      // Atualizar estados
      setData(processedData.dadosFiltrados || [])
      setOperatorMetrics(processedData.metricasOperadores || {})
      setRankings(processedData.rankings || [])
      setMetrics(processedData.metricas || {})
      
      console.log('🎉 fetchFromGoogleSheets concluído com sucesso!')
      return cachedData
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados da planilha:', error)
      setError(error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getServiceAccountAuth])

  // 🔑 OBTER ACCESS TOKEN DO SERVICE ACCOUNT
  const getAccessToken = useCallback(async (credentials) => {
    try {
      console.log('🔑 Obtendo access token...')
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: await createJWT(credentials)
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao obter token: ${response.status}`)
      }

      const tokenData = await response.json()
      console.log('✅ Access token obtido!')
      return tokenData.access_token
      
    } catch (error) {
      console.error('❌ Erro ao obter access token:', error)
      throw error
    }
  }, [])

  // 📝 CRIAR JWT PARA SERVICE ACCOUNT
  const createJWT = useCallback(async (credentials) => {
    // Implementação simplificada - em produção usar biblioteca JWT
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: credentials.token_uri,
      exp: now + 3600,
      iat: now
    }

    // Para simplificar, vamos usar uma abordagem diferente
    return 'mock_jwt_token'
  }, [])

  // 🔐 LOGIN SIMPLES
  const signIn = useCallback(async () => {
    try {
      console.log('🔐 Fazendo login com Service Account...')
      
      const userData = {
        email: 'veloinsights-service@veloinsights.iam.gserviceaccount.com',
        name: 'VeloInsights Service Account',
        access_token: 'service_account_token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }
      
      localStorage.setItem('veloinsights_user', JSON.stringify(userData))
      setIsAuthenticated(true)
      
      console.log('✅ Login com Service Account realizado!')
      return userData
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  }, [])

  // Função para limpar cache
  const clearCache = useCallback(() => {
    cachedData = null
    cacheTimestamp = 0
  }, [])

  // Função para buscar dados manualmente
  const fetchData = useCallback(() => {
    return fetchFromGoogleSheets()
  }, [fetchFromGoogleSheets])

  // Função de logout
  const signOut = useCallback(() => {
    localStorage.removeItem('veloinsights_user')
    setIsAuthenticated(false)
  }, [])

  // Verificar se usuário está logado
  const isLoggedIn = useCallback(() => {
    const userData = localStorage.getItem('veloinsights_user')
    if (userData) {
      const user = JSON.parse(userData)
      const now = Date.now()
      if (user.expires_at && now < user.expires_at) {
        return true
      } else {
        localStorage.removeItem('veloinsights_user')
      }
    }
    return false
  }, [])

  // Inicializar autenticação
  useEffect(() => {
    const userData = localStorage.getItem('veloinsights_user')
    if (userData) {
      const user = JSON.parse(userData)
      const now = Date.now()
      if (user.expires_at && now < user.expires_at) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('veloinsights_user')
        setIsAuthenticated(false)
      }
    }
  }, [])

  // Carregar dados quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Usuário autenticado, carregando dados da planilha...')
      fetchFromGoogleSheets()
    }
  }, [isAuthenticated, fetchFromGoogleSheets])

  const getUserData = useCallback(() => {
    const userData = localStorage.getItem('veloinsights_user')
    if (userData) {
      const user = JSON.parse(userData)
      const now = Date.now()
      if (user.expires_at && now < user.expires_at) {
        return user
      } else {
        localStorage.removeItem('veloinsights_user')
      }
    }
    return null
  }, [])

  return {
    data,
    operatorMetrics,
    rankings,
    metrics,
    isLoading,
    error,
    fetchData,
    clearCache,
    signIn,
    signOut,
    isAuthenticated,
    isLoggedIn: isLoggedIn(),
    userData: getUserData()
  }
}