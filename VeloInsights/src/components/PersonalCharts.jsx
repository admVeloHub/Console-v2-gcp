import React, { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useTheme } from '../hooks/useTheme'
import './PersonalCharts.css'

Chart.register(...registerables)

const PersonalCharts = ({ data, pauseData }) => {
  const { theme } = useTheme()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Estados dos seletores
  const [selectedOperator, setSelectedOperator] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Opções de métricas
  const metricOptions = [
    { id: 'tempoPausa', label: '⏱️ Tempo de Pausa', color: '#FF6B6B' },
    { id: 'tempoLogado', label: '🕐 Tempo Logado', color: '#4ECDC4' },
    { id: 'chamadas', label: '📞 Quantidade de Chamadas', color: '#45B7D1' },
    { id: 'notaAtendimento', label: '⭐ Nota de Atendimento', color: '#96CEB4' },
    { id: 'notaSolucao', label: '🎯 Nota de Solução', color: '#FFEAA7' },
    { id: 'duracaoMedia', label: '📊 Duração Média', color: '#DDA0DD' }
  ]

  // Opções de período
  const periodOptions = [
    { value: 'yesterday', label: 'Ontem' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'year', label: 'Ano' },
    { value: 'custom', label: 'Período Customizado' }
  ]

  // Extrair operadores disponíveis (priorizando pauseData)
  const availableOperators = React.useMemo(() => {
    const sourceData = pauseData && pauseData.length > 0 ? pauseData : data
    
    if (!sourceData || sourceData.length === 0) return []

    const operators = new Set()
    
    sourceData.forEach(record => {
      let operator = ''
      
      if (Array.isArray(record)) {
        operator = record[0] // Coluna A
      } else if (record.nomeOperador) {
        operator = record.nomeOperador
      } else if (record.operador) {
        operator = record.operador
      } else if (record.chamada) {
        operator = record.chamada
      }

      if (operator && typeof operator === 'string') {
        // Filtrar operadores válidos
        const isValidOperator = 
          !operator.toLowerCase().includes('sem operador') &&
          !operator.toLowerCase().includes('agentes indisponíveis') &&
          !operator.toLowerCase().includes('rejeitaram') &&
          !operator.toLowerCase().includes('agente') &&
          !operator.toLowerCase().includes('indisponível') &&
          !operator.toLowerCase().includes('atendida') &&
          !operator.toLowerCase().includes('abandonada') &&
          !operator.toLowerCase().includes('pausa') &&
          !/^\d/.test(operator) && // Não começa com número
          operator.includes(' ') && // Contém espaço (nome completo)
          operator.trim().length > 3

        if (isValidOperator) {
          operators.add(operator.trim())
        }
      }
    })

    return Array.from(operators).sort()
  }, [data, pauseData])

  // Função para obter cores dos gráficos baseadas no tema
  const getChartColors = () => {
    const isDarkTheme = document.body.classList.contains('theme-dark')
    
    if (!isDarkTheme) {
      return {
        text: '#000000',
        textSecondary: '#333333',
        grid: '#E5E7EB',
        ticks: '#666666',
        background: '#FFFFFF'
      }
    } else {
      return {
        text: '#FFFFFF',
        textSecondary: '#FFFFFF',
        grid: '#404040',
        ticks: '#FFFFFF',
        background: '#1F2937'
      }
    }
  }

  // Função para calcular métricas por período
  const calculateMetricsByPeriod = (filteredData, metrics) => {
    if (!filteredData || filteredData.length === 0) return {}

    const metricsData = {}
    
    // Inicializar dados para cada métrica
    metrics.forEach(metric => {
      metricsData[metric] = []
    })

    // Agrupar dados por período
    const groupedData = {}
    
    filteredData.forEach(record => {
      const date = new Date(record.data || record.dataInicial)
      let periodKey = ''
      
      switch (selectedPeriod) {
        case 'yesterday':
          periodKey = date.toLocaleDateString('pt-BR')
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          periodKey = `Semana ${weekStart.toLocaleDateString('pt-BR')}`
          break
        case 'month':
          periodKey = `${date.getMonth() + 1}/${date.getFullYear()}`
          break
        case 'year':
          periodKey = date.getFullYear().toString()
          break
        case 'custom':
          periodKey = date.toLocaleDateString('pt-BR')
          break
        default:
          periodKey = date.toLocaleDateString('pt-BR')
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = []
      }
      groupedData[periodKey].push(record)
    })

    // Calcular métricas para cada período
    Object.keys(groupedData).forEach(period => {
      const periodData = groupedData[period]
      
      metrics.forEach(metric => {
        let value = 0
        
        switch (metric) {
          case 'tempoPausa':
            value = periodData.reduce((sum, record) => {
              const tempoPausa = parseFloat(record.tempoPausa || record.tempoEspera || 0)
              return sum + (isNaN(tempoPausa) ? 0 : tempoPausa)
            }, 0)
            break
          case 'tempoLogado':
            value = periodData.reduce((sum, record) => {
              const tempoLogado = parseFloat(record.tempoLogado || record.tempoFalado || 0)
              return sum + (isNaN(tempoLogado) ? 0 : tempoLogado)
            }, 0)
            break
          case 'chamadas':
            value = periodData.filter(record => 
              record.chamada && record.chamada.toLowerCase().includes('atendida')
            ).length
            break
          case 'notaAtendimento':
            const notasAtendimento = periodData
              .map(record => parseFloat(record.notaAtendimento || record.ratingAttendance || 0))
              .filter(nota => !isNaN(nota) && nota > 0)
            value = notasAtendimento.length > 0 ? 
              notasAtendimento.reduce((sum, nota) => sum + nota, 0) / notasAtendimento.length : 0
            break
          case 'notaSolucao':
            const notasSolucao = periodData
              .map(record => parseFloat(record.notaSolucao || record.ratingSolution || 0))
              .filter(nota => !isNaN(nota) && nota > 0)
            value = notasSolucao.length > 0 ? 
              notasSolucao.reduce((sum, nota) => sum + nota, 0) / notasSolucao.length : 0
            break
          case 'duracaoMedia':
            const duracoes = periodData
              .map(record => parseFloat(record.duracaoMedia || record.durationMinutes || 0))
              .filter(duracao => !isNaN(duracao) && duracao > 0)
            value = duracoes.length > 0 ? 
              duracoes.reduce((sum, duracao) => sum + duracao, 0) / duracoes.length : 0
            break
        }
        
        metricsData[metric].push(value)
      })
    })

    return {
      labels: Object.keys(groupedData).sort(),
      data: metricsData
    }
  }

  // Filtrar dados por operador e período
  const getFilteredData = () => {
    if (!selectedOperator || !data || data.length === 0) return []

    let filteredData = data.filter(record => {
      const operatorMatch = 
        record.nomeOperador === selectedOperator ||
        record.operador === selectedOperator ||
        record.chamada === selectedOperator

      if (!operatorMatch) return false

      // Filtro por período
      const recordDate = new Date(record.data || record.dataInicial)
      const now = new Date()
      
      switch (selectedPeriod) {
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(now.getDate() - 1)
          return recordDate.toDateString() === yesterday.toDateString()
        
        case 'week':
          const weekAgo = new Date(now)
          weekAgo.setDate(now.getDate() - 7)
          return recordDate >= weekAgo
        
        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(now.getMonth() - 1)
          return recordDate >= monthAgo
        
        case 'year':
          const yearAgo = new Date(now)
          yearAgo.setFullYear(now.getFullYear() - 1)
          return recordDate >= yearAgo
        
        case 'custom':
          if (!customStartDate || !customEndDate) return true
          const startDate = new Date(customStartDate)
          const endDate = new Date(customEndDate)
          return recordDate >= startDate && recordDate <= endDate
        
        default:
          return true
      }
    })

    return filteredData
  }

  // Criar gráfico
  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const filteredData = getFilteredData()
    const chartData = calculateMetricsByPeriod(filteredData, selectedMetrics)
    const colors = getChartColors()

    if (!chartData.labels || chartData.labels.length === 0) {
      return
    }

    const datasets = selectedMetrics.map((metric, index) => {
      const metricOption = metricOptions.find(m => m.id === metric)
      return {
        label: metricOption ? metricOption.label : metric,
        data: chartData.data[metric] || [],
        borderColor: metricOption ? metricOption.color : `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: metricOption ? metricOption.color + '20' : `hsla(${index * 60}, 70%, 50%, 0.2)`,
        tension: 0.4,
        fill: false
      }
    })

    const config = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Análise de ${selectedOperator} - ${periodOptions.find(p => p.value === selectedPeriod)?.label}`,
            color: colors.text,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            labels: {
              color: colors.text,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: colors.background,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.grid,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: {
              color: colors.ticks,
              font: {
                size: 11
              }
            },
            grid: {
              color: colors.grid
            },
            title: {
              display: true,
              text: 'Período',
              color: colors.text,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: colors.ticks,
              font: {
                size: 11
              }
            },
            grid: {
              color: colors.grid
            },
            title: {
              display: true,
              text: 'Valores',
              color: colors.text,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      }
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, config)
    }
  }

  // Handlers
  const handleMetricChange = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    )
  }

  const handleGenerateChart = () => {
    if (selectedOperator && selectedMetrics.length > 0) {
      createChart()
    }
  }

  // Efeitos
  useEffect(() => {
    if (selectedOperator && selectedMetrics.length > 0) {
      createChart()
    }
  }, [selectedOperator, selectedPeriod, selectedMetrics, customStartDate, customEndDate, theme])

  // Listener para mudanças de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (selectedOperator && selectedMetrics.length > 0) {
        createChart()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [selectedOperator, selectedMetrics])

  return (
    <div className="personal-charts">
      <div className="personal-charts-header">
        <h2>📊 Análise Personalizada</h2>
        <p>Selecione um operador, período e métricas para gerar gráficos específicos</p>
      </div>

      <div className="personal-charts-controls">
        <div className="control-group">
          <label>👤 Operador:</label>
          <select 
            value={selectedOperator} 
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="operator-select"
          >
            <option value="">Selecione um operador</option>
            {availableOperators.map(operator => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>📅 Período:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="custom-dates">
            <div className="control-group">
              <label>Data Inicial:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="control-group">
              <label>Data Final:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        )}

        <div className="control-group metrics-group">
          <label>📈 Métricas:</label>
          <div className="metrics-checkboxes">
            {metricOptions.map(metric => (
              <label key={metric.id} className="metric-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={() => handleMetricChange(metric.id)}
                />
                <span>{metric.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerateChart}
          disabled={!selectedOperator || selectedMetrics.length === 0}
          className="generate-button"
        >
          📊 Gerar Gráfico
        </button>
      </div>

      <div className="chart-container">
        {selectedOperator && selectedMetrics.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="no-chart-message">
            <p>Selecione um operador e pelo menos uma métrica para gerar o gráfico</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonalCharts
