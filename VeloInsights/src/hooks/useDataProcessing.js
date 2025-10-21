import { useState, useCallback } from 'react'
import { parseVelotaxData } from '../utils/velotaxParser'
import { calculateMetrics, calculateOperatorMetrics, calculateRankings } from '../utils/metricsCalculator'
import { useDataCache } from './useDataCache'
import { useWebWorker } from './useWebWorker'

export const useDataProcessing = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [operatorMetrics, setOperatorMetrics] = useState([])
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [darkList, setDarkList] = useState([])
  const [operators, setOperators] = useState([])

  // Hooks para cache e Web Worker
  const {
    getCachedMetrics,
    setCachedMetrics,
    generateDataHash,
    debounce,
    isProcessing,
    setIsProcessing
  } = useDataCache()

  const {
    processMetrics: workerProcessMetrics,
    calculateRankings: workerCalculateRankings,
    isSupported: workerSupported
  } = useWebWorker()

  const processFile = useCallback(async (file, onProgress) => {
    try {
      setErrors([])
      onProgress({ current: 10, total: 100, message: 'Lendo arquivo...' })
      
      // Limpar dados anteriores
      setData([])
      setMetrics(null)
      setOperatorMetrics([])
      setRankings([])
      
      // Timeout para arquivos muito grandes (5 minutos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Arquivo muito grande para processar (5 minutos)')), 300000)
      })

      // Verificar tamanho do arquivo antes do processamento
      const fileSizeMB = file.size / (1024 * 1024)
      console.log('📁 Tamanho do arquivo:', fileSizeMB.toFixed(2), 'MB')
      
      // Verificar memória disponível
      if (performance.memory) {
        const memoryInfo = performance.memory
        const availableMemoryMB = (memoryInfo.jsHeapSizeLimit - memoryInfo.usedJSHeapSize) / (1024 * 1024)
        console.log('🧠 Memória disponível:', availableMemoryMB.toFixed(2), 'MB')
        
        if (fileSizeMB > availableMemoryMB * 0.5) {
          throw new Error(`Arquivo muito grande (${fileSizeMB.toFixed(2)} MB) para a memória disponível (${availableMemoryMB.toFixed(2)} MB)`)
        }
      }

      // Aviso para arquivos grandes
      if (fileSizeMB > 20) {
        const estimatedTime = Math.ceil(fileSizeMB / 15) // Estimativa mais realista
        const memoryNeeded = Math.ceil(fileSizeMB * 3) // Memória necessária
        
        const confirm = window.confirm(`🚀 VELOINSIGHTS - ARQUIVO GRANDE DETECTADO

═══════════════════════════════════════════════════════════════

📊 INFORMAÇÕES DO ARQUIVO:
   📁 Tamanho: ${fileSizeMB.toFixed(2)} MB
   ⏱️ Tempo estimado: ${estimatedTime} minutos
   💾 Memória necessária: ${memoryNeeded} MB
   🔄 Processamento: Web Worker ativo

═══════════════════════════════════════════════════════════════

⚠️ CONSIDERAÇÕES IMPORTANTES:

🎯 Este arquivo é considerado grande e pode:
   • Demorar mais tempo para processar
   • Consumir mais memória do navegador
   • Afetar a performance temporariamente

💡 Para melhor experiência, considere:
   • Dividir em arquivos menores (10-20 MB)
   • Filtrar dados desnecessários
   • Processar por períodos específicos

═══════════════════════════════════════════════════════════════

🤔 DESEJA CONTINUAR?

✅ SIM - Processar arquivo completo
❌ NÃO - Cancelar e otimizar arquivo`)

        if (!confirm) {
          throw new Error('Processamento cancelado pelo usuário')
        }
      }

      onProgress({ current: 20, total: 100, message: 'Processando arquivo...' })

      let rawData = []
      
      if (file.name.endsWith('.csv')) {
        rawData = await processCSVFile(file)
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        if (fileSizeMB > 20 && workerSupported) {
          rawData = await processExcelWithWorker(file, fileSizeMB, onProgress)
        } else {
          rawData = await processExcelFile(file, fileSizeMB)
        }
      } else {
        throw new Error('Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls)')
      }

      onProgress({ current: 60, total: 100, message: 'Processando dados em chunks...' })
      
      const processedData = await parseVelotaxData(rawData, onProgress)
      setData(processedData)
      
      // Extrair lista única de operadores
      const operatorsList = extractOperators(processedData)
      setOperators(operatorsList)

      onProgress({ current: 70, total: 100, message: 'Calculando métricas...' })

      // Calcular métricas gerais
      const generalMetrics = calculateMetrics(processedData)
      setMetrics(generalMetrics)

      onProgress({ current: 85, total: 100, message: 'Calculando métricas por operador...' })

      // Calcular métricas por operador
      const opMetrics = calculateOperatorMetrics(processedData)
      setOperatorMetrics(opMetrics)

      onProgress({ current: 95, total: 100, message: 'Gerando ranking...' })

      // Calcular rankings
      const rankingsData = calculateRankings(opMetrics)
      setRankings(rankingsData)

      onProgress({ current: 100, total: 100, message: 'Concluído!' })

    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error)
      setErrors([error.message])
      throw error
    }
  }, [workerSupported])

  const clearData = useCallback(() => {
    setData([])
    setMetrics(null)
    setOperatorMetrics([])
    setRankings([])
    setErrors([])
    setDarkList([])
    setOperators([])
  }, [])

  const recalculateMetrics = useCallback(async (processedData) => {
    try {
      setIsProcessing(true)
      
      // Tentar usar cache primeiro
      const dataHash = generateDataHash(processedData)
      const cachedMetrics = getCachedMetrics(dataHash)
      
      if (cachedMetrics) {
        setMetrics(cachedMetrics.metrics)
        setOperatorMetrics(cachedMetrics.operatorMetrics)
        setRankings(cachedMetrics.rankings)
        return cachedMetrics
      }

      // Calcular métricas
      const metrics = calculateMetrics(processedData)
      const operatorMetrics = calculateOperatorMetrics(processedData)
      const rankings = calculateRankings(operatorMetrics)

      // Salvar no cache
      setCachedMetrics(dataHash, { metrics, operatorMetrics, rankings })
      
      setMetrics(metrics)
      setOperatorMetrics(operatorMetrics)
      setRankings(rankings)
      
      return { metrics, operatorMetrics, rankings }
    } catch (error) {
      console.error('❌ Erro ao recalcular métricas:', error)
      const fallbackMetrics = {
        totalCalls: 0,
        avgDuration: 0,
        avgRatingAttendance: 0,
        avgRatingSolution: 0,
        avgPauseTime: 0,
        totalOperators: 0,
        dataPeriod: { start: null, end: null }
      }
      setMetrics(fallbackMetrics)
      return fallbackMetrics
    } finally {
      setIsProcessing(false)
    }
  }, [getCachedMetrics, setCachedMetrics, generateDataHash, workerProcessMetrics, workerSupported])

  // Função para processar CSV
  const processCSVFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target.result
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length === 0) {
            reject(new Error('Arquivo CSV vazio'))
            return
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
            const obj = {}
            headers.forEach((header, index) => {
              obj[header] = values[index] || ''
            })
            return obj
          })
          
          resolve(rows)
        } catch (error) {
          reject(new Error(`Erro ao processar CSV: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo CSV'))
      }
      
      reader.readAsText(file, 'UTF-8')
    })
  }, [])

  // Função para processar Excel com Web Worker
  const processExcelWithWorker = useCallback(async (file, fileSizeMB, onProgress) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../workers/excelWorker.js', import.meta.url))
      
      const timeout = setTimeout(() => {
        worker.terminate()
        reject(new Error('Timeout: Web Worker demorou mais de 30 segundos'))
      }, 30000)
      
      worker.onmessage = (e) => {
        const { type, data, progress } = e.data
        
        if (type === 'progress') {
          onProgress({ current: 50 + (progress * 0.2), total: 100, message: 'Processando Excel...' })
        } else if (type === 'complete') {
          clearTimeout(timeout)
          worker.terminate()
          console.log('✅ Excel processado com Web Worker:', data.length, 'registros')
          resolve(data)
        } else if (type === 'error') {
          clearTimeout(timeout)
          worker.terminate()
          reject(new Error(`Web Worker error: ${data}`))
        }
      }
      
      worker.onerror = (error) => {
        clearTimeout(timeout)
        worker.terminate()
        reject(new Error(`Web Worker error: ${error.message}`))
      }
      
      // Enviar arquivo para o worker
      const reader = new FileReader()
      reader.onload = (e) => {
        worker.postMessage({
          fileData: e.target.result,
          fileName: file.name,
          fileSizeMB: fileSizeMB
        })
      }
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo para Web Worker'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }, [])

  // Função para processar Excel
  const processExcelFile = useCallback(async (file, fileSizeMB) => {
    return new Promise((resolve, reject) => {
      console.log('📊 Iniciando leitura do Excel...')
      const reader = new FileReader()
      
      reader.onload = (e) => {
        console.log('📊 Arquivo Excel lido, iniciando processamento...')
        try {
          import('xlsx').then(async (XLSX) => {
            console.log('📊 XLSX importado, processando dados...')
            const data = new Uint8Array(e.target.result)
            
            const workbook = XLSX.read(data, { 
              type: 'array',
              cellDates: false,
              cellNF: false,
              cellStyles: false,
              bookVBA: false,
              bookProps: false,
              bookSheets: false
            })
            
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              defval: '',
              raw: false,
              blankrows: false
            })
            
            if (jsonData.length === 0) {
              reject(new Error('Planilha Excel vazia'))
              return
            }

            const headers = jsonData[0]
            const rows = []
            
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i]
              const obj = {}
              headers.forEach((header, headerIndex) => {
                obj[header] = row[headerIndex] || ''
              })
              rows.push(obj)
            }

            console.log('✅ Excel processado com sucesso:', rows.length, 'registros')
            resolve(rows)
          }).catch(error => {
            console.error('❌ Erro ao processar Excel:', error)
            reject(new Error(`Erro ao processar Excel: ${error.message}`))
          })
        } catch (error) {
          reject(new Error(`Erro ao ler arquivo Excel: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo Excel'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }, [])
  
  // Função para atualizar a Dark List e recalcular métricas
  const updateDarkList = useCallback((newDarkList) => {
    console.log('🎯 Atualizando Dark List:', newDarkList.length, 'operadores excluídos')
    setDarkList(newDarkList)
    
    // Recalcular métricas com a nova Dark List
    if (data.length > 0) {
      const filteredData = data.filter(record => {
        const operator = record.operator
        return !newDarkList.includes(operator)
      })
      
      console.log('📊 Recalculando métricas com', filteredData.length, 'registros válidos')
      
      // Recalcular métricas gerais
      const newMetrics = calculateMetrics(filteredData)
      setMetrics(newMetrics)
      
      // Recalcular métricas por operador
      const newOperatorMetrics = calculateOperatorMetrics(filteredData)
      setOperatorMetrics(newOperatorMetrics)
      
      // Recalcular rankings
      const newRankings = calculateRankings(newOperatorMetrics)
      setRankings(newRankings)
    }
  }, [data])

  // Função para extrair lista única de operadores dos dados
  const extractOperators = useCallback((data) => {
    const operatorSet = new Set()
    data.forEach(record => {
      if (record.operator && record.operator.trim()) {
        operatorSet.add(record.operator.trim())
      }
    })
    return Array.from(operatorSet).sort()
  }, [])

  return {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    darkList,
    operators,
    updateDarkList,
    extractOperators,
    processFile,
    clearData,
    recalculateMetrics,
    isProcessing
  }
}