// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// Hook para acesso ao Google Sheets via Service Account (sem SSO do usuário)

import { useState, useCallback } from 'react'

// Configuração da planilha principal do VeloInsights
const VELOINSIGHTS_CONFIG = {
  SPREADSHEET_ID: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA',
  RANGES: [
    'Base!A1:AC150000',  // Range completo
    'Base!A:AC',         // Todas as linhas
    'Base!A1:AC1000',    // Range médio
    'Base!A1:AC100'      // Range pequeno
  ]
}

// Configuração da planilha OCTA
const OCTA_CONFIG = {
  SPREADSHEET_ID: '1QkDmUTGAQQ7uF4ZBnHHcdrCyvjN76I_TN-RwTgvyn0o',
  RANGES: [
    'Página1!A1:AD150000',  // Range completo
    'Página1!A:AD',         // Todas as linhas
    'Página1!A1:AD1000',    // Range médio
    'Página1!A1:AD100'      // Range pequeno
  ]
}

export const useServiceAccount = () => {
  const [data, setData] = useState([])
  const [octaData, setOctaData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Função para buscar dados da planilha principal
  const fetchVeloInsightsData = useCallback(async (range = 'Base!A1:AC1000') => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Buscando dados do VeloInsights via Service Account...')

      // Usar API pública CSV (mais simples e confiável)
      const csvUrl = `https://docs.google.com/spreadsheets/d/${VELOINSIGHTS_CONFIG.SPREADSHEET_ID}/export?format=csv&gid=0`
      
      const response = await fetch(csvUrl)
      
      if (!response.ok) {
        throw new Error(`Erro ao acessar planilha: ${response.status}`)
      }

      const csvData = await response.text()
      
      if (!csvData || csvData.length < 100) {
        throw new Error('Planilha vazia ou inacessível')
      }

      // Converter CSV para array
      const lines = csvData.split('\n').filter(line => line.trim())
      const values = lines.map(line => {
        // Parse CSV simples (pode precisar de ajustes dependendo do formato)
        const row = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            row.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        row.push(current.trim())
        
        return row
      })

      console.log(`✅ Dados obtidos: ${values.length} linhas`)
      setData(values)
      return values

    } catch (error) {
      console.error('❌ Erro ao buscar dados do VeloInsights:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para buscar dados da planilha OCTA
  const fetchOctaData = useCallback(async (range = 'Página1!A1:AD1000') => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Buscando dados do OCTA via Service Account...')

      // Usar API pública CSV
      const csvUrl = `https://docs.google.com/spreadsheets/d/${OCTA_CONFIG.SPREADSHEET_ID}/export?format=csv&gid=0`
      
      const response = await fetch(csvUrl)
      
      if (!response.ok) {
        throw new Error(`Erro ao acessar planilha OCTA: ${response.status}`)
      }

      const csvData = await response.text()
      
      if (!csvData || csvData.length < 100) {
        throw new Error('Planilha OCTA vazia ou inacessível')
      }

      // Converter CSV para array
      const lines = csvData.split('\n').filter(line => line.trim())
      const values = lines.map(line => {
        const row = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            row.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        row.push(current.trim())
        
        return row
      })

      console.log(`✅ Dados OCTA obtidos: ${values.length} linhas`)
      setOctaData(values)
      return values

    } catch (error) {
      console.error('❌ Erro ao buscar dados do OCTA:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para buscar dados de ambas as planilhas
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Buscando dados de todas as planilhas...')

      const [veloinsightsData, octaData] = await Promise.all([
        fetchVeloInsightsData(),
        fetchOctaData()
      ])

      console.log('✅ Todos os dados carregados com sucesso')
      return {
        veloinsights: veloinsightsData,
        octa: octaData
      }

    } catch (error) {
      console.error('❌ Erro ao buscar todos os dados:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchVeloInsightsData, fetchOctaData])

  // Função para limpar dados
  const clearData = useCallback(() => {
    setData([])
    setOctaData([])
    setError(null)
  }, [])

  return {
    // Estados
    data,
    octaData,
    loading,
    error,
    
    // Funções
    fetchVeloInsightsData,
    fetchOctaData,
    fetchAllData,
    clearData,
    
    // Configurações
    VELOINSIGHTS_CONFIG,
    OCTA_CONFIG
  }
}

export default useServiceAccount
