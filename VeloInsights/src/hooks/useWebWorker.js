import { useRef, useCallback, useEffect } from 'react'

export const useWebWorker = () => {
  const workerRef = useRef(null)
  const callbacksRef = useRef(new Map())

  // Inicializar worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(new URL('../workers/dataProcessor.worker.js', import.meta.url))
      
      workerRef.current.onmessage = (e) => {
        const { type, data, success, error } = e.data
        const callback = callbacksRef.current.get(type)
        
        if (callback) {
          if (success) {
            callback.resolve(data)
          } else {
            callback.reject(new Error(error))
          }
          callbacksRef.current.delete(type)
        }
      }

      workerRef.current.onerror = (error) => {
        console.error('Web Worker error:', error)
        // Rejeitar todas as promises pendentes
        callbacksRef.current.forEach((callback) => {
          callback.reject(error)
        })
        callbacksRef.current.clear()
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        callbacksRef.current.clear()
      }
    }
  }, [])

  // Função genérica para enviar mensagens ao worker
  const postMessage = useCallback((type, data, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Web Worker não está disponível'))
        return
      }

      const messageId = `${type}_${Date.now()}`
      callbacksRef.current.set(messageId, { resolve, reject })

      workerRef.current.postMessage({
        type,
        data,
        options,
        messageId
      })

      // Timeout para evitar promises pendentes
      setTimeout(() => {
        if (callbacksRef.current.has(messageId)) {
          callbacksRef.current.delete(messageId)
          reject(new Error('Timeout do Web Worker'))
        }
      }, 30000) // 30 segundos timeout
    })
  }, [])

  // Métodos específicos
  const processMetrics = useCallback((data) => {
    return postMessage('PROCESS_METRICS', data)
  }, [postMessage])

  const filterData = useCallback((data, filters) => {
    return postMessage('FILTER_DATA', { data, filters })
  }, [postMessage])

  const calculateRankings = useCallback((operatorMetrics) => {
    return postMessage('CALCULATE_RANKINGS', operatorMetrics)
  }, [postMessage])

  return {
    processMetrics,
    filterData,
    calculateRankings,
    isSupported: typeof Worker !== 'undefined'
  }
}
