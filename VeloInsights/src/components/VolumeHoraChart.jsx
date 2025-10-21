import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const VolumeHoraChart = ({ data = [], periodo = null }) => {
  const chartData = useMemo(() => {
    const processedData = processVolumeHora(data)
    
    // Criar gradiente para as barras
    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    return {
      labels: processedData.labels,
      datasets: [
        {
          label: '📞 Chamadas por Hora',
          data: processedData.volumes,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const value = context.parsed.y
            const max = Math.max(...processedData.volumes)
            
            // Cores diferentes baseadas no volume (horário de pico)
            if (value > max * 0.8) {
              return createGradient(ctx, 'rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)') // Vermelho (pico)
            } else if (value > max * 0.5) {
              return createGradient(ctx, 'rgba(249, 115, 22, 0.9)', 'rgba(234, 88, 12, 0.9)') // Laranja (alto)
            } else if (value > max * 0.3) {
              return createGradient(ctx, 'rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)') // Azul (médio)
            } else {
              return createGradient(ctx, 'rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)') // Verde (baixo)
            }
          },
          borderWidth: 0,
          borderRadius: 6,
          maxBarThickness: 40,
          hoverBorderWidth: 2,
          hoverBorderColor: 'rgba(255, 255, 255, 0.8)'
        }
      ]
    }
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 12,
          boxHeight: 12,
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
          title: function(context) {
            return `🕐 ${context[0].label}`
          },
          label: function(context) {
            const value = context.parsed.y
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percent = ((value / total) * 100).toFixed(1)
            return `Chamadas: ${value} (${percent}%)`
          },
          afterLabel: function(context) {
            const value = context.parsed.y
            const max = Math.max(...context.dataset.data)
            
            if (value > max * 0.8) {
              return '🔥 Horário de PICO'
            } else if (value > max * 0.5) {
              return '⚠️ Volume ALTO'
            } else if (value > max * 0.3) {
              return '📊 Volume MÉDIO'
            } else {
              return '✅ Volume BAIXO'
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#6b7280',
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#6b7280',
          padding: 12
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false
        }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}

// Processar volume por hora
const processVolumeHora = (data) => {
  if (!data || data.length === 0) {
    return {
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      volumes: Array(24).fill(0)
    }
  }

  const volumePorHora = Array(24).fill(0)
  
  data.forEach(record => {
    // Pegar o campo de hora (coluna 'hora' ou 'time' para chamadas, 'Data de entrada' para tickets)
    let horaField = record.hora || record.time || record.calltime || 
                    record['Data de entrada'] || record.dataEntrada || ''
    
    if (horaField) {
      // Se for timestamp completo (ex: "2025-01-01 18:10:21.272000"), extrair apenas a hora
      if (horaField.includes(' ')) {
        horaField = horaField.split(' ')[1] // Pegar a parte da hora
      }
      
      // Extrair a hora (formato HH:MM:SS ou HH:MM)
      const horaParts = horaField.split(':')
      if (horaParts.length >= 1) {
        const hora = parseInt(horaParts[0])
        if (hora >= 0 && hora < 24) {
          volumePorHora[hora]++
        }
      }
    }
  })

  const labels = Array.from({ length: 24 }, (_, i) => {
    const hora = String(i).padStart(2, '0')
    return `${hora}:00`
  })

  return {
    labels,
    volumes: volumePorHora
  }
}

export default VolumeHoraChart
