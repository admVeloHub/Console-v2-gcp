import { useState, useMemo, useCallback } from 'react'
import { useDataCache } from './useDataCache'

export const useDataFilters = (data) => {
  const [filters, setFilters] = useState({
    period: 'all', // Mudado de 'last30days' para 'all'
    operator: '',
    dateRange: {},
    minCalls: '',
    minRating: '',
    minDuration: '',
    maxDuration: ''
  })

  const {
    getCachedFilteredData,
    setCachedFilteredData,
    generateDataHash,
    generateFiltersHash,
    debounce
  } = useDataCache()

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Gerar hashes para cache
    const dataHash = generateDataHash(data)
    const filtersHash = generateFiltersHash(filters)

    // Tentar buscar dados filtrados do cache
    const cachedData = getCachedFilteredData(dataHash, filtersHash)
    if (cachedData) {
      return cachedData.data
    }
    let filtered = [...data]

      // Filtrar por operador
      if (filters.operator) {
        filtered = filtered.filter(record => record.operador === filters.operator)
      }

           // Filtrar por período
           if (filters.period !== 'custom' && filters.period !== 'all') {
             const today = new Date()
             let startDate = new Date()

             switch (filters.period) {
               case 'last7days':
                 startDate.setDate(today.getDate() - 7)
                 break
               case 'last30days':
                 startDate.setDate(today.getDate() - 30)
                 break
               case 'last3months':
                 startDate.setMonth(today.getMonth() - 3)
                 break
               default:
                 startDate = null
             }

             if (startDate) {
               filtered = filtered.filter(record => {
                 if (!record.data) return false
                 const recordDate = new Date(record.data)
                 return recordDate >= startDate && recordDate <= today
               })
             }
           } else if (filters.dateRange.start && filters.dateRange.end) {
             // Filtro personalizado por data
             const startDate = new Date(filters.dateRange.start)
             const endDate = new Date(filters.dateRange.end)
             
             filtered = filtered.filter(record => {
               if (!record.data) return false
               const recordDate = new Date(record.data)
               return recordDate >= startDate && recordDate <= endDate
             })
           }

           // Filtrar por avaliação mínima de atendimento
           if (filters.minRating) {
             const minRating = parseFloat(filters.minRating)
             filtered = filtered.filter(record => 
               record['Pergunta2 1 PERGUNTA ATENDENTE'] && parseFloat(record['Pergunta2 1 PERGUNTA ATENDENTE']) >= minRating
             )
           }

           // Filtrar por duração mínima
           if (filters.minDuration) {
             const minDuration = parseFloat(filters.minDuration)
             filtered = filtered.filter(record => parseFloat(record['Tempo Falado'] || 0) >= minDuration)
           }

           // Filtrar por duração máxima
           if (filters.maxDuration) {
             const maxDuration = parseFloat(filters.maxDuration)
             filtered = filtered.filter(record => parseFloat(record['Tempo Falado'] || 0) <= maxDuration)
           }

    // Salvar no cache
    setCachedFilteredData(dataHash, filtersHash, filtered)
    console.log('✅ useDataFilters - dados filtrados finais:', filtered.length)
    return filtered
  }, [data, filters, generateDataHash, generateFiltersHash, getCachedFilteredData, setCachedFilteredData])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  return {
    filters,
    filteredData,
    handleFiltersChange
  }
}
