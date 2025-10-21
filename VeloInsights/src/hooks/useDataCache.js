import { useState, useCallback, useMemo } from 'react'

export const useDataCache = () => {
  const [cache, setCache] = useState(new Map())
  const [isProcessing, setIsProcessing] = useState(false)

  // Cache de métricas calculadas
  const getCachedMetrics = useCallback((dataHash, operatorMetricsHash) => {
    const key = `metrics_${dataHash}_${operatorMetricsHash}`
    return cache.get(key)
  }, [cache])

  const setCachedMetrics = useCallback((dataHash, operatorMetricsHash, metrics) => {
    const key = `metrics_${dataHash}_${operatorMetricsHash}`
    setCache(prev => new Map(prev).set(key, {
      data: metrics,
      timestamp: Date.now()
    }))
  }, [])

  // Cache de dados filtrados
  const getCachedFilteredData = useCallback((dataHash, filtersHash) => {
    const key = `filtered_${dataHash}_${filtersHash}`
    return cache.get(key)
  }, [cache])

  const setCachedFilteredData = useCallback((dataHash, filtersHash, filteredData) => {
    const key = `filtered_${dataHash}_${filtersHash}`
    setCache(prev => new Map(prev).set(key, {
      data: filteredData,
      timestamp: Date.now()
    }))
  }, [])

  // Limpar cache antigo (mais de 5 minutos)
  const cleanOldCache = useCallback(() => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    setCache(prev => {
      const newCache = new Map()
      for (const [key, value] of prev) {
        if (value.timestamp > fiveMinutesAgo) {
          newCache.set(key, value)
        }
      }
      return newCache
    })
  }, [])

  // Gerar hash simples para dados
  const generateDataHash = useCallback((data) => {
    if (!data || data.length === 0) return 'empty'
    return `${data.length}_${data[0]?.date || 'no_date'}_${data[data.length - 1]?.date || 'no_date'}`
  }, [])

  // Gerar hash para filtros
  const generateFiltersHash = useCallback((filters) => {
    return JSON.stringify(filters)
  }, [])

  // Debounce para operações pesadas
  const debounce = useCallback((func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  return {
    getCachedMetrics,
    setCachedMetrics,
    getCachedFilteredData,
    setCachedFilteredData,
    generateDataHash,
    generateFiltersHash,
    cleanOldCache,
    debounce,
    isProcessing,
    setIsProcessing,
    cacheSize: cache.size
  }
}
