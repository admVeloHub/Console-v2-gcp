/**
 * Hook para buscar dados APENAS do MongoDB
 * Sem consultar Google Sheets - apenas MongoDB
 */

import { useState, useEffect } from 'react'

const MONGODB_API_URL = 'http://localhost:3001'

export const useMongoDBOnly = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  // Função para buscar dados do MongoDB
  const fetchFromMongoDB = async (filters = {}) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Buscando dados APENAS do MongoDB...')

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

      setData(sampleData.calls || [])
      setStatus(result)
      
      return {
        calls: sampleData.calls || [],
        totalCalls: result.calls || 0,
        totalPauses: result.pauses || 0,
        totalRecords: result.totalRecords || 0
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados do MongoDB:', error)
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar dados por período
  const fetchByPeriod = async (startDate, endDate) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 Buscando dados do período: ${startDate} a ${endDate}`)

      // Buscar TODOS os dados (139.457 registros) e filtrar no frontend
      const response = await fetch(`${MONGODB_API_URL}/api/sample-calls?limit=150000`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }

      const result = await response.json()
      
      // Filtrar por período no frontend
      const filteredCalls = result.calls?.filter(call => {
        const callDate = new Date(call.call_date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return callDate >= start && callDate <= end
      }) || []

      console.log(`✅ ${filteredCalls.length} chamadas encontradas no período`)
      setData(filteredCalls)
      
      return filteredCalls

    } catch (error) {
      console.error('❌ Erro ao buscar dados por período:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar dados por colaborador
  const fetchByColaborador = async (colaboradorNome) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 Buscando dados do colaborador: ${colaboradorNome}`)

      // Buscar TODOS os dados (139.457 registros) e filtrar por colaborador
      const response = await fetch(`${MONGODB_API_URL}/api/sample-calls?limit=150000`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }

      const result = await response.json()
      
      // Filtrar por colaborador
      const filteredCalls = result.calls?.filter(call => 
        call.colaboradorNome === colaboradorNome
      ) || []

      console.log(`✅ ${filteredCalls.length} chamadas encontradas para ${colaboradorNome}`)
      setData(filteredCalls)
      
      return filteredCalls

    } catch (error) {
      console.error('❌ Erro ao buscar dados por colaborador:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Função para verificar status do MongoDB
  const checkMongoDBStatus = async () => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/api/status`)
      
      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.status}`)
      }

      const status = await response.json()
      setStatus(status)
      
      console.log('📊 Status do MongoDB:', status)
      return status

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error)
      setError(error.message)
      return null
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      await checkMongoDBStatus()
      await fetchFromMongoDB()
    }
    loadInitialData()
  }, [])

  return {
    data,
    loading,
    error,
    status,
    fetchFromMongoDB,
    fetchByPeriod,
    fetchByColaborador,
    checkMongoDBStatus,
    // Métricas calculadas
    totalCalls: status?.calls || 0,
    totalPauses: status?.pauses || 0,
    totalRecords: status?.totalRecords || 0,
    isConnected: status?.status === 'connected'
  }
}

export default useMongoDBOnly
