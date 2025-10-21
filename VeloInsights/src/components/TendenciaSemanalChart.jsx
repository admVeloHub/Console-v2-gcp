import React, { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TendenciaSemanalChart = ({ data = [] }) => {
  // Processar dados reais para o gráfico
  const processedData = processWeeklyData(data)

    // Paleta de cores
    const azul = 'rgba(58, 91, 255, 1)'
    const azulFill = 'rgba(58, 91, 255, 0.12)'
    const verde = 'rgba(58, 179, 115, 1)'
    const verdeFill = 'rgba(58, 179, 115, 0.10)'
    const vermelho = 'rgba(231, 88, 88, 1)'
    const amarelo = 'rgba(249, 191, 63, 1)'

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: processedData.labels,
        datasets: [
          {
            label: 'Total de Chamadas',
            data: processedData.total,
            borderColor: azul,
            backgroundColor: azulFill,
            borderWidth: 3,
            tension: 0.35,
            fill: 'start',
            pointRadius: 4,
            pointHoverRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: azul,
            yAxisID: 'y',
          },
          {
            label: 'Chamadas Atendidas',
            data: processedData.atendidas,
            borderColor: verde,
            backgroundColor: verdeFill,
            borderWidth: 3,
            tension: 0.35,
            fill: 'origin',
            pointRadius: 0,
            yAxisID: 'y',
          },
          {
            label: 'Chamadas Abandonadas',
            data: processedData.abandonadas,
            borderColor: vermelho,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 3,
            tension: 0.35,
            fill: false,
            pointRadius: 0,
            yAxisID: 'y',
          },
          {
            label: 'Nota Média',
            data: processedData.notaMedia,
            borderColor: amarelo,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 3,
            borderDash: [6, 6],
            tension: 0.25,
            pointRadius: 0,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: false,
              boxWidth: 28,
              boxHeight: 12,
              borderRadius: 2,
              padding: 14,
              color: '#344054',
              font: { weight: 600, size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: '#0f172a',
            borderWidth: 1,
            padding: 10,
            titleFont: { weight: '700' },
            bodyFont: { weight: '500' },
            callbacks: {
              label: (ctx) => {
                const ds = ctx.dataset.label || ''
                const val = ctx.parsed.y
                if (ctx.dataset.yAxisID === 'y1') return `${ds}: ${val.toFixed(2)}`
                return `${ds}: ${val.toLocaleString('pt-BR')}`
              }
            }
          },
          title: { display: false },
          subtitle: { display: false }
        },
        scales: {
          x: {
            grid: { color: '#eef2fb' },
            ticks: { color: '#6576aa', font: { size: 11 } }
          },
          y: {
            title: { display: true, text: 'Volume de Chamadas' },
            min: 0,
            grid: { color: '#e9eef7' },
            ticks: {
              color: '#6576aa',
              callback: (v) => Number(v).toLocaleString('pt-BR')
            }
          },
          y1: {
            position: 'right',
            title: { display: true, text: 'Nota Média' },
            min: 0,
            max: 5,
            grid: { drawOnChartArea: false },
            ticks: { color: '#6576aa' }
          }
        },
        elements: {
          point: { hitRadius: 8, hoverRadius: 6 }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef}></canvas>
}

// Função para processar dados reais em semanas
const processWeeklyData = (data) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      total: [0, 0, 0, 0],
      atendidas: [0, 0, 0, 0],
      abandonadas: [0, 0, 0, 0],
      notaMedia: [0, 0, 0, 0]
    }
  }

  // Agrupar dados por semana
  const weeklyData = {}
  
  data.forEach(record => {
    if (!record.calldate) return
    
    const date = new Date(record.calldate)
    const weekKey = getWeekKey(date)
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        total: 0,
        atendidas: 0,
        abandonadas: 0,
        notas: []
      }
    }
    
    weeklyData[weekKey].total++
    
    if (record.disposition === 'ANSWERED') {
      weeklyData[weekKey].atendidas++
    } else if (record.disposition === 'NO ANSWER') {
      weeklyData[weekKey].abandonadas++
    }
    
    if (record.rating_attendance && record.rating_attendance > 0) {
      weeklyData[weekKey].notas.push(parseFloat(record.rating_attendance))
    }
  })

  // Converter para arrays ordenados
  const weeks = Object.keys(weeklyData).sort()
  const labels = weeks.map(w => `Sem ${w}`)
  const total = weeks.map(w => weeklyData[w].total)
  const atendidas = weeks.map(w => weeklyData[w].atendidas)
  const abandonadas = weeks.map(w => weeklyData[w].abandonadas)
  const notaMedia = weeks.map(w => {
    const notas = weeklyData[w].notas
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })

  return { labels, total, atendidas, abandonadas, notaMedia }
}

// Obter chave da semana (formato: "DD/MM")
const getWeekKey = (date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  return `${day}/${month}`
}

export default TendenciaSemanalChart
