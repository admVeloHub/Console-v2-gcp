// Web Worker para processamento pesado de dados
self.onmessage = function(e) {
  const { type, data, options } = e.data

  try {
    switch (type) {
      case 'PROCESS_METRICS':
        const metrics = processMetrics(data)
        self.postMessage({ 
          type: 'METRICS_PROCESSED', 
          data: metrics,
          success: true 
        })
        break

      case 'FILTER_DATA':
        const filteredData = filterData(data.data, data.filters)
        self.postMessage({ 
          type: 'DATA_FILTERED', 
          data: filteredData,
          success: true 
        })
        break

      case 'CALCULATE_RANKINGS':
        const rankings = calculateRankings(data)
        self.postMessage({ 
          type: 'RANKINGS_CALCULATED', 
          data: rankings,
          success: true 
        })
        break

      default:
        self.postMessage({ 
          type: 'ERROR', 
          error: 'Tipo de operação não suportado',
          success: false 
        })
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error.message,
      success: false 
    })
  }
}

function processMetrics(data) {
  if (!data || data.length === 0) {
    return {
      totalCalls: 0,
      avgDuration: 0,
      avgRatingAttendance: 0,
      avgRatingSolution: 0,
      avgLoggedTime: 0,
      avgPauseTime: 0,
      totalOperators: 0,
      dataPeriod: { start: null, end: null }
    }
  }

  // Filtrar dados válidos
  const validData = data.filter(record => 
    record.date && 
    record.operator && 
    record.duration_minutes >= 0
  )

  if (validData.length === 0) {
    return {
      totalCalls: 0,
      avgDuration: 0,
      avgRatingAttendance: 0,
      avgRatingSolution: 0,
      avgLoggedTime: 0,
      avgPauseTime: 0,
      totalOperators: 0,
      dataPeriod: { start: null, end: null }
    }
  }

  // Calcular métricas básicas
  const totalCalls = validData.reduce((sum, record) => sum + (record.call_count || 0), 0)
  
  const totalDuration = validData.reduce((sum, record) => sum + (record.duration_minutes || 0), 0)
  const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

  // Calcular médias de avaliação (ignorar valores nulos)
  const attendanceRatings = validData
    .map(record => record.rating_attendance)
    .filter(rating => rating !== null && rating !== undefined)
  
  const avgRatingAttendance = attendanceRatings.length > 0 
    ? attendanceRatings.reduce((sum, rating) => sum + rating, 0) / attendanceRatings.length 
    : 0

  const solutionRatings = validData
    .map(record => record.rating_solution)
    .filter(rating => rating !== null && rating !== undefined)
  
  const avgRatingSolution = solutionRatings.length > 0 
    ? solutionRatings.reduce((sum, rating) => sum + rating, 0) / solutionRatings.length 
    : 0

  // Calcular médias de tempo logado e pausado
  const loggedTimes = validData
    .map(record => record.avg_logged_time)
    .filter(time => time !== null && time !== undefined && time > 0)
  
  const avgLoggedTime = loggedTimes.length > 0 
    ? loggedTimes.reduce((sum, time) => sum + time, 0) / loggedTimes.length 
    : 0

  const pauseTimes = validData
    .map(record => record.avg_pause_time)
    .filter(time => time !== null && time !== undefined && time > 0)
  
  const avgPauseTime = pauseTimes.length > 0 
    ? pauseTimes.reduce((sum, time) => sum + time, 0) / pauseTimes.length 
    : 0

  // Contar operadores únicos
  const uniqueOperators = new Set(validData.map(record => record.operator))
  const totalOperators = uniqueOperators.size

  // Calcular período dos dados
  const dates = validData
    .map(record => new Date(record.date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a - b)

  const dataPeriod = {
    start: dates.length > 0 ? dates[0].toISOString() : null,
    end: dates.length > 0 ? dates[dates.length - 1].toISOString() : null
  }

  return {
    totalCalls,
    avgDuration,
    avgRatingAttendance,
    avgRatingSolution,
    avgLoggedTime,
    avgPauseTime,
    totalOperators,
    dataPeriod
  }
}

function filterData(data, filters) {
  if (!data || data.length === 0) return []

  let filtered = [...data]

  // Filtrar por operador
  if (filters.operator) {
    filtered = filtered.filter(record => record.operator === filters.operator)
  }

  // Filtrar por período
  if (filters.period !== 'custom') {
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
        if (!record.date) return false
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= today
      })
    }
  } else if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
    // Filtro personalizado por data
    const startDate = new Date(filters.dateRange.start)
    const endDate = new Date(filters.dateRange.end)
    
    filtered = filtered.filter(record => {
      if (!record.date) return false
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  return filtered
}

function calculateRankings(operatorMetrics) {
  if (!operatorMetrics || operatorMetrics.length === 0) return []

  // Normalizar valores para cálculo de score
  const maxCalls = Math.max(...operatorMetrics.map(op => op.totalCalls))
  const maxDuration = Math.max(...operatorMetrics.map(op => op.avgDuration))
  const maxAttendanceRating = Math.max(...operatorMetrics.map(op => op.avgAttendanceRating))
  const maxSolutionRating = Math.max(...operatorMetrics.map(op => op.avgSolutionRating))
  const maxPauseTime = Math.max(...operatorMetrics.map(op => op.avgPauseTime))

  const normalize = (value, max) => max > 0 ? value / max : 0

  // Calcular score para cada operador
  const rankings = operatorMetrics.map(operator => {
    const score = 
      0.35 * normalize(operator.totalCalls, maxCalls) +
      0.20 * (1 - normalize(operator.avgDuration, maxDuration)) +
      0.20 * normalize(operator.avgAttendanceRating, maxAttendanceRating) +
      0.20 * normalize(operator.avgSolutionRating, maxSolutionRating) -
      0.05 * normalize(operator.avgPauseTime, maxPauseTime)

    return {
      ...operator,
      score: Math.max(0, Math.min(1, score)) // Garantir que score está entre 0 e 1
    }
  })

  // Ordenar por score (maior primeiro)
  return rankings.sort((a, b) => b.score - a.score)
}
