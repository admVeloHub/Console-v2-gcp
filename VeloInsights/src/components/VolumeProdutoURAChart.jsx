import React, { useMemo } from 'react'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const VolumeProdutoURAChart = ({ data = [], periodo = null }) => {
  const chartData = useMemo(() => {
    const processedData = processVolumeProdutoRadar(data)
    
    return {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Volume de Tickets por Categoria',
          data: processedData.values,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.25)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverBorderWidth: 4
        }
      ]
    }
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10,
          color: '#1f2937'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 16,
        cornerRadius: 12,
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '700'
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: '500'
        },
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 6,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r} tickets`
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1.5
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          lineWidth: 1.5
        },
        pointLabels: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#374151',
          padding: 10
        },
        ticks: {
          font: {
            size: 10,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#6b7280',
          backdropColor: 'rgba(255, 255, 255, 0.9)',
          backdropPadding: 4,
          showLabelBackdrop: true
        }
      }
    }
  }

  return <Radar data={chartData} options={options} />
}

// Processar dados para gráfico de radar (categorias de assunto)
const processVolumeProdutoRadar = (data) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }

  // Mapear todas as categorias únicas dos dados
  const categorias = {}
  
  data.forEach(record => {
    let assunto = ''
    
    // Se for array (dados OCTA), pegar posição 10 (coluna K = "Categoria de assunto do ticket")
    if (Array.isArray(record)) {
      assunto = record[10] || '' // Posição 10 = "Categoria de assunto do ticket"
    } else {
      // Se for objeto (dados de chamadas)
      assunto = record.produto || record.produtoURA || record.ura_product || 
                record.assunto || record.subject || record['Assunto do ticket'] || 
                record['Categoria de assunto do ticket'] || ''
    }
    
    // Limpar
    assunto = assunto.trim()
    
    // Ignorar vazios
    if (!assunto || assunto === '' || assunto === 'VAZIO') {
      return
    }
    
    // Contar
    if (!categorias[assunto]) {
      categorias[assunto] = 0
    }
    categorias[assunto]++
  })

  // Ordenar por volume e pegar top 12 (para não ficar muito poluído)
  const sorted = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
  
  if (sorted.length === 0) {
    return {
      labels: ['Sem dados'],
      values: [0]
    }
  }
  
  return {
    labels: sorted.map(item => item[0]),
    values: sorted.map(item => item[1])
  }
}

// Funções auxiliares
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  
  return new Date(dateStr)
}

const getGroupKey = (date, groupBy) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (groupBy === 'day') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    const weekNum = getWeekNumber(date)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  } else {
    return `${year}-${String(month).padStart(2, '0')}`
  }
}

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

const formatLabel = (key, groupBy) => {
  if (groupBy === 'day') {
    const parts = key.split('-')
    return `${parts[2]}/${parts[1]}`
  } else if (groupBy === 'week') {
    const parts = key.split('-W')
    return `Sem ${parts[1]}`
  } else {
    const parts = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return monthNames[parseInt(parts[1]) - 1]
  }
}

export default VolumeProdutoURAChart
