import React, { useEffect, useRef, memo } from 'react'
import './ChartsSection.css'
import LazyWrapper, { LazyChart } from './LazyWrapper'
import { getOperatorDisplayName, prioritizeCurrentUserInMiddle } from '../utils/operatorUtils'

const ChartsSection = memo(({ data, operatorMetrics, rankings, userData }) => {
  const chartRefs = {
    callsChart: useRef(null),
    ratingsChart: useRef(null),
    durationChart: useRef(null),
    operatorsChart: useRef(null),
    trendChart: useRef(null),
    hourlyChart: useRef(null),
    performanceChart: useRef(null),
    abandonmentChart: useRef(null),
    rankingChart: useRef(null)
  }

  // Instâncias dos gráficos para controle
  const chartInstances = useRef({})
  
  // Verificar se deve ocultar nomes
  const shouldHideNames = document.body.getAttribute('data-hide-names') === 'true'

  useEffect(() => {
    if (!data || data.length === 0) return

    // Importar Chart.js dinamicamente
    import('chart.js/auto').then(({ Chart }) => {
      createCharts(Chart)
    })

    return () => {
      // Limpar charts ao desmontar
      Object.values(chartInstances.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy()
        }
      })
    }
  }, [data, operatorMetrics, rankings])

  const createCharts = (Chart) => {
    // Destruir gráficos existentes antes de criar novos
    Object.values(chartInstances.current).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
    
    // Limpar instâncias
    chartInstances.current = {}
    
    createCallsChart(Chart)
    createRatingsChart(Chart)
    createDurationChart(Chart)
    createOperatorsChart(Chart)
    createTrendChart(Chart)
    createHourlyChart(Chart)
    createAbandonmentChart(Chart)
    createRankingChart(Chart)
  }

  // Função para converter data brasileira (DD/MM/YYYY) para formato ISO
  const parseBrazilianDate = (dateStr) => {
    if (!dateStr) return null
    
    // Se já está no formato ISO, retorna como está
    if (dateStr.includes('-')) {
      return new Date(dateStr)
    }
    
    // Se está no formato brasileiro DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/')
      return new Date(year, month - 1, day)
    }
    
    return new Date(dateStr)
  }

  // 📊 GRÁFICO DE CHAMADAS POR DIA
  const createCallsChart = (Chart) => {
    if (!chartRefs.callsChart.current || !data) return

    // Agrupar dados por dia usando dados processados do Velotax
    const dailyData = {}
    data.forEach(record => {
      if (record.data) {
        try {
          const date = parseBrazilianDate(record.data)
          if (date && !isNaN(date.getTime())) {
            const dateStr = date.toISOString().split('T')[0]
            if (!dailyData[dateStr]) {
              dailyData[dateStr] = 0
            }
            dailyData[dateStr] += 1 // Cada linha é uma chamada
          }
        } catch (error) {
          console.warn('Data inválida encontrada:', record.data, error)
        }
      }
    })

    const dates = Object.keys(dailyData).sort()
    const calls = dates.map(date => dailyData[date])

    chartInstances.current.callsChart = new Chart(chartRefs.callsChart.current, {
      type: 'line',
      data: {
        labels: dates.map(date => {
          try {
            return new Date(date).toLocaleDateString('pt-BR')
          } catch (error) {
            return date
          }
        }),
        datasets: [{
          label: 'Chamadas por Dia',
          data: calls,
          borderColor: '#1634FF',
          backgroundColor: 'rgba(22, 52, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '📞 Chamadas por Dia',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // ⭐ GRÁFICO DE AVALIAÇÕES
  const createRatingsChart = (Chart) => {
    if (!chartRefs.ratingsChart.current || !data) return

    // Contar distribuição de notas usando dados do Velotax
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    data.forEach(record => {
      if (record.notaAtendimento && record.notaAtendimento >= 1 && record.notaAtendimento <= 5) {
        ratingDistribution[record.notaAtendimento]++
      }
    })

    chartInstances.current.ratingsChart = new Chart(chartRefs.ratingsChart.current, {
      type: 'bar',
      data: {
        labels: ['⭐ 1', '⭐⭐ 2', '⭐⭐⭐ 3', '⭐⭐⭐⭐ 4', '⭐⭐⭐⭐⭐ 5'],
        datasets: [{
          label: 'Distribuição de Notas',
          data: Object.values(ratingDistribution),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '⭐ Distribuição de Avaliações',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // ⏱️ GRÁFICO DE DURAÇÃO
  const createDurationChart = (Chart) => {
    if (!chartRefs.durationChart.current || !data) return

    // Função para converter tempo HH:MM:SS para minutos
    const tempoParaMinutos = (tempo) => {
      if (!tempo || tempo === '00:00:00') return 0
      const [horas, minutos, segundos] = tempo.split(':').map(Number)
      return horas * 60 + minutos + segundos / 60
    }

    // Agrupar por faixas de duração usando dados do Velotax
    const durationRanges = {
      '0-5 min': 0,
      '5-10 min': 0,
      '10-15 min': 0,
      '15-30 min': 0,
      '30+ min': 0
    }

    data.forEach(record => {
      const duration = tempoParaMinutos(record.tempoFalado)
      if (duration <= 5) durationRanges['0-5 min']++
      else if (duration <= 10) durationRanges['5-10 min']++
      else if (duration <= 15) durationRanges['10-15 min']++
      else if (duration <= 30) durationRanges['15-30 min']++
      else durationRanges['30+ min']++
    })

    chartInstances.current.durationChart = new Chart(chartRefs.durationChart.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(durationRanges),
        datasets: [{
          data: Object.values(durationRanges),
          backgroundColor: [
            '#1634FF',
            '#1694FF',
            '#15A237',
            '#FCC200',
            '#FF6B6B'
          ],
          borderColor: '#272A30',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '⏱️ Distribuição por Duração',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        }
      }
    })
  }

  // 👥 GRÁFICO DE OPERADORES
  const createOperatorsChart = (Chart) => {
    if (!chartRefs.operatorsChart.current || !operatorMetrics) return

    // Pegar top 10 operadores usando dados do Velotax (excluindo "Sem Operador")
    const filteredOperators = operatorMetrics
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
    
    // Priorizar usuário logado no meio se necessário
    const topOperators = shouldHideNames && userData?.email
      ? prioritizeCurrentUserInMiddle(filteredOperators, userData, 'totalCalls').slice(0, 3)
      : filteredOperators.sort((a, b) => b.totalCalls - a.totalCalls).slice(0, 3)
    
    const labels = topOperators.map((op, index) => 
      getOperatorDisplayName(op.operator, index, userData, shouldHideNames)
    )

    chartInstances.current.operatorsChart = new Chart(chartRefs.operatorsChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Chamadas por Operador',
          data: topOperators.map(op => op.totalCalls),
          backgroundColor: 'rgba(22, 52, 255, 0.8)',
          borderColor: '#1634FF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '👥 Top 10 Operadores por Chamadas',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // 📈 GRÁFICO DE TENDÊNCIA SEMANAL MELHORADO
  const createTrendChart = (Chart) => {
    if (!chartRefs.trendChart.current || !data) return

    // Função para obter início da semana (segunda-feira)
    const getWeekStart = (date) => {
      const weekStart = new Date(date)
      const day = weekStart.getDay()
      const diff = day === 0 ? -6 : 1 - day // Segunda-feira como início da semana
      weekStart.setDate(weekStart.getDate() + diff)
      weekStart.setHours(0, 0, 0, 0)
      return weekStart
    }

    // Agrupar por semana com métricas completas
    const weeklyData = {}
    data.forEach(record => {
      if (record.data) {
        try {
          const date = parseBrazilianDate(record.data)
          if (date && !isNaN(date.getTime())) {
            const weekStart = getWeekStart(date)
            const weekKey = weekStart.toISOString().split('T')[0]
            
            if (!weeklyData[weekKey]) {
              weeklyData[weekKey] = {
                calls: 0,
                atendidas: 0,
                abandonadas: 0,
                retidasURA: 0,
                totalRating: 0,
                ratingCount: 0,
                totalDuration: 0,
                durationCount: 0,
                weekLabel: `Sem ${weekStart.getDate()}/${weekStart.getMonth() + 1}`
              }
            }
            
            // Contar por tipo de chamada
            weeklyData[weekKey].calls += 1
            if (record.chamada) {
              const chamada = record.chamada.toLowerCase()
              if (chamada.includes('retida') || chamada.includes('ura')) {
                weeklyData[weekKey].retidasURA += 1
              } else if (chamada.includes('abandonada')) {
                weeklyData[weekKey].abandonadas += 1
              } else {
                weeklyData[weekKey].atendidas += 1
              }
            }
            
            // Acumular notas
            if (record.notaAtendimento) {
              weeklyData[weekKey].totalRating += record.notaAtendimento
              weeklyData[weekKey].ratingCount += 1
            }
            
            // Acumular duração
            if (record.tempoFalado && record.tempoFalado !== '00:00:00') {
              const [h, m, s] = record.tempoFalado.split(':').map(Number)
              const duration = h * 60 + m + s / 60
              weeklyData[weekKey].totalDuration += duration
              weeklyData[weekKey].durationCount += 1
            }
          }
        } catch (error) {
          console.warn('Data inválida encontrada no gráfico de tendência:', record.data, error)
        }
      }
    })

    const weeks = Object.keys(weeklyData).sort()
    const calls = weeks.map(week => weeklyData[week].calls)
    const atendidas = weeks.map(week => weeklyData[week].atendidas)
    const abandonadas = weeks.map(week => weeklyData[week].abandonadas)
    const avgRatings = weeks.map(week => 
      weeklyData[week].ratingCount > 0 
        ? (weeklyData[week].totalRating / weeklyData[week].ratingCount).toFixed(1)
        : 0
    )
    const avgDuration = weeks.map(week =>
      weeklyData[week].durationCount > 0
        ? (weeklyData[week].totalDuration / weeklyData[week].durationCount).toFixed(1)
        : 0
    )

    chartInstances.current.trendChart = new Chart(chartRefs.trendChart.current, {
      type: 'line',
      data: {
        labels: weeks.map(week => weeklyData[week].weekLabel),
        datasets: [
          {
            label: '📞 Total de Chamadas',
            data: calls,
            borderColor: '#1634FF',
            backgroundColor: 'rgba(22, 52, 255, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: '✅ Chamadas Atendidas',
            data: atendidas,
            borderColor: '#15A237',
            backgroundColor: 'rgba(21, 162, 55, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '❌ Chamadas Abandonadas',
            data: abandonadas,
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '⭐ Nota Média',
            data: avgRatings,
            borderColor: '#FCC200',
            backgroundColor: 'rgba(252, 194, 0, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '📈 Tendência Semanal - Análise Completa',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' },
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(context) {
                return `Semana: ${context[0].label}`
              },
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                if (label.includes('Nota')) {
                  return `${label}: ${value}/5`
                }
                return `${label}: ${value}`
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#B0B0B0' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    })
  }

  // 🕐 GRÁFICO DE DISTRIBUIÇÃO POR HORÁRIO
  const createHourlyChart = (Chart) => {
    if (!chartRefs.hourlyChart.current || !data) return

    const hourlyData = Array(24).fill(0)
    data.forEach(record => {
      if (record.hora) {
        try {
          // Usar a coluna Hora (E) diretamente no formato HH:MM:SS
          const [hour] = record.hora.split(':')
          const hourIndex = parseInt(hour)
          if (hourIndex >= 0 && hourIndex <= 23) {
            hourlyData[hourIndex] += 1
          }
        } catch (error) {
          console.warn('Hora inválida encontrada no gráfico de horário:', record.hora, error)
        }
      }
    })

    chartInstances.current.hourlyChart = new Chart(chartRefs.hourlyChart.current, {
      type: 'bar',
      data: {
        labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        datasets: [{
          label: 'Chamadas por Hora',
          data: hourlyData,
          backgroundColor: '#1634FF',
          borderColor: '#1694FF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '🕐 Distribuição de Chamadas por Horário',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  // 🎯 GRÁFICO DE PERFORMANCE POR OPERADOR (MELHORADO)
  const createPerformanceChart = (Chart) => {
    if (!chartRefs.performanceChart.current || !operatorMetrics) return

    const filteredOperators = operatorMetrics
      .filter(op => op.operator && !op.operator.toLowerCase().includes('sem operador'))
    
    // Priorizar usuário logado no meio se necessário
    const topOperators = shouldHideNames && userData?.email
      ? prioritizeCurrentUserInMiddle(filteredOperators, userData, 'totalCalls').slice(0, 3)
      : filteredOperators.sort((a, b) => b.totalCalls - a.totalCalls).slice(0, 3)
    
    // Preparar dados para gráfico de barras agrupadas
    const labels = topOperators.map((op, index) => 
      getOperatorDisplayName(op.operator, index, userData, shouldHideNames)
    )
    
    const callsData = topOperators.map(op => op.totalCalls || 0)
    const attendanceData = topOperators.map(op => (op.avgRatingAttendance || 0).toFixed(1))
    const solutionData = topOperators.map(op => (op.avgRatingSolution || 0).toFixed(1))
    const durationData = topOperators.map(op => (op.avgDuration || 0).toFixed(1))

    chartInstances.current.performanceChart = new Chart(chartRefs.performanceChart.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '📞 Total de Chamadas',
            data: callsData,
            backgroundColor: 'rgba(22, 52, 255, 0.8)',
            borderColor: '#1634FF',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: '⭐ Nota Atendimento',
            data: attendanceData,
            backgroundColor: 'rgba(252, 194, 0, 0.8)',
            borderColor: '#FCC200',
            borderWidth: 1,
            yAxisID: 'y1'
          },
          {
            label: '🎯 Nota Solução',
            data: solutionData,
            backgroundColor: 'rgba(21, 162, 55, 0.8)',
            borderColor: '#15A237',
            borderWidth: 1,
            yAxisID: 'y1'
          },
          {
            label: '⏱️ Duração Média (min)',
            data: durationData,
            backgroundColor: 'rgba(255, 107, 107, 0.8)',
            borderColor: '#FF6B6B',
            borderWidth: 1,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '🎯 Performance dos Top 6 Operadores',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' },
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(context) {
                return `Operador: ${context[0].label}`
              },
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                if (label.includes('Nota')) {
                  return `${label}: ${value}/5`
                } else if (label.includes('Duração')) {
                  return `${label}: ${value} min`
                }
                return `${label}: ${value}`
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' },
            title: {
              display: true,
              text: 'Chamadas',
              color: '#F3F7FC'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#B0B0B0' },
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: 'Notas (0-5)',
              color: '#F3F7FC'
            },
            min: 0,
            max: 5
          },
          y2: {
            type: 'linear',
            display: false,
            ticks: { color: '#B0B0B0' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    })
  }

  // 📉 GRÁFICO DE TAXA DE ABANDONO
  const createAbandonmentChart = (Chart) => {
    if (!chartRefs.abandonmentChart.current || !data) return

    // Analisar campo "chamada" para identificar abandonos usando dados do Velotax
    const callStatus = {}
    data.forEach(record => {
      const status = record.chamada || 'Atendida'
      callStatus[status] = (callStatus[status] || 0) + 1
    })

    const labels = Object.keys(callStatus)
    const values = Object.values(callStatus)
    const colors = labels.map(status => {
      if (status.toLowerCase().includes('abandon')) return '#FF6B6B'
      if (status.toLowerCase().includes('atend')) return '#4ECDC4'
      return '#45B7D1'
    })

    chartInstances.current.abandonmentChart = new Chart(chartRefs.abandonmentChart.current, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#272A30',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '📉 Status das Chamadas',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        }
      }
    })
  }

  // 🏆 GRÁFICO DE RANKING DE OPERADORES
  const createRankingChart = (Chart) => {
    if (!chartRefs.rankingChart.current || !rankings) return

    // Pegar top 10 operadores do ranking (excluindo "Sem Operador")
    const topRankings = rankings
      .filter(r => r.operator && !r.operator.toLowerCase().includes('sem operador'))
      .slice(0, 3)

    chartInstances.current.rankingChart = new Chart(chartRefs.rankingChart.current, {
      type: 'bar',
      data: {
        labels: topRankings.map(r => r.operator.length > 12 ? r.operator.substring(0, 12) + '...' : r.operator),
        datasets: [{
          label: 'Score de Performance',
          data: topRankings.map(r => parseFloat(r.score)),
          backgroundColor: topRankings.map((_, index) => {
            if (index === 0) return '#FFD700' // Ouro
            if (index === 1) return '#C0C0C0' // Prata
            if (index === 2) return '#CD7F32' // Bronze
            return '#1634FF' // Azul padrão
          }),
          borderColor: topRankings.map((_, index) => {
            if (index === 0) return '#FFA500'
            if (index === 1) return '#A0A0A0'
            if (index === 2) return '#B8860B'
            return '#1694FF'
          }),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '🏆 Top 10 Ranking de Operadores',
            color: '#F3F7FC',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#F3F7FC' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          },
          y: {
            ticks: { color: '#B0B0B0' },
            grid: { color: '#404040' }
          }
        }
      }
    })
  }

  if (!data || data.length === 0) {
    return (
      <div className="charts-section">
        <div className="card">
          <h3>📊 Gráficos</h3>
          <p>Nenhum dado disponível para exibir gráficos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-section">
      <h2>📊 Análise Visual dos Dados</h2>
      
      <div className="charts-grid">
        <div className="card">
          <canvas ref={chartRefs.callsChart}></canvas>
        </div>
        
        <div className="card">
          <canvas ref={chartRefs.ratingsChart}></canvas>
        </div>
        
        <div className="card">
          <canvas ref={chartRefs.durationChart}></canvas>
        </div>
        
        <div className="card">
          <canvas ref={chartRefs.operatorsChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.trendChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.hourlyChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.abandonmentChart}></canvas>
        </div>

        <div className="card">
          <canvas ref={chartRefs.rankingChart}></canvas>
        </div>
      </div>
    </div>
  )
})

ChartsSection.displayName = 'ChartsSection'

export default ChartsSection