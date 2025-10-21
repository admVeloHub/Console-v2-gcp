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
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

// Versão otimizada - mantém telefonia intacta, melhora apenas tickets
const CSATChart = ({ data = [], periodo = null }) => {
  // Verificar se é dados de tickets ou telefonia ANTES do useMemo
  const processedDataForType = processCSATByPeriod(data, periodo)
  
  // Detecção melhorada de dados de tickets
  const totalAvaliacoesTotal = processedDataForType.totalAvaliacoes ? processedDataForType.totalAvaliacoes.reduce((sum, v) => sum + (v || 0), 0) : 0
  const bomTotal = processedDataForType.bom ? processedDataForType.bom.reduce((sum, v) => sum + (v || 0), 0) : 0
  const ruimTotal = processedDataForType.ruim ? processedDataForType.ruim.reduce((sum, v) => sum + (v || 0), 0) : 0
  
  // Considerar como dados de tickets se houver avaliações ou contadores de bom/ruim
  const isTicketData = totalAvaliacoesTotal > 0 || bomTotal > 0 || ruimTotal > 0
  
  const notaAtendimentoTotal = processedDataForType.notaAtendimento ? processedDataForType.notaAtendimento.reduce((sum, v) => sum + (v || 0), 0) : 0
  const isPhoneData = notaAtendimentoTotal > 0 && !isTicketData
  
  // Verificar se há dados de tickets na coluna O a partir da linha 15
  let encontrouTickets = false
  let exemploTicket = null
  
  // Verificar a partir da linha 15 (índice 14) até linha 50
  for (let i = 14; i < Math.min(data.length, 50); i++) {
    const registro = data[i]
    if (registro && registro[14]) {
      const colunaO = String(registro[14]).trim().toLowerCase()
      if (colunaO.includes('bom') || colunaO.includes('ruim')) {
        encontrouTickets = true
        exemploTicket = { 
          linhaIndex: i, 
          linhaReal: i + 1, // Linha real no Excel
          colunaO: registro[14]
        }
        break
      }
    }
  }
  
  console.log('🎫 Verificação linha 15+:', {
    encontrouTickets,
    exemploTicket,
    totalRegistros: data.length
  })

  const chartData = useMemo(() => {
    if (encontrouTickets) {
      // Para tickets: contagem simples da coluna O
      const ticketCounts = data.slice(14).reduce((acc, row) => {
        if (Array.isArray(row) && row[14] !== undefined && row[14] !== null && row[14] !== '') {
          const tipo = String(row[14]).trim().toLowerCase()
          if (tipo.includes('bom')) {
            acc.bom++
          } else if (tipo.includes('ruim')) {
            acc.ruim++
          }
        }
        return acc
      }, { bom: 0, ruim: 0 })
      
      console.log('🎫 Contagem tickets:', ticketCounts)
      
      const total = ticketCounts.bom + ticketCounts.ruim
      const percentualSatisfacao = total > 0 ? (ticketCounts.bom / total) * 100 : 0
      
      return {
        labels: ['Avaliações'],
        datasets: [
          {
            label: 'Bom',
            data: [ticketCounts.bom],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10B981',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Ruim', 
            data: [ticketCounts.ruim],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: '#EF4444',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Satisfação (%)',
            data: [percentualSatisfacao],
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: '#8B5CF6',
            borderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      }
    }
    
    // Para telefonia: manter lógica original
    const processedData = processCSATByPeriod(data, periodo)
    
    // Criar gradientes para as barras
    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }
    
    // Converter para notas médias
    let bomPercent = []
    let ruimPercent = []
    let mediaTendencia = []
    
    if (isPhoneData) {
      // Para dados de telefonia (colunas AB e AC), calcular notas médias
      processedData.labels.forEach((_, index) => {
        const notaAtend = processedData.notaAtendimento[index] || 0
        const notaSol = processedData.notaSolucao[index] || 0
        
        // Calcular nota média ao invés de porcentagem
        const notaMedia = (notaAtend + notaSol) / 2
        
        bomPercent.push(notaMedia)
        ruimPercent.push(notaMedia) // Mesmo valor para ambos
        mediaTendencia.push(notaMedia) // Tendência = nota média
      })
    } else {
      // Para chamadas, manter lógica original
      mediaTendencia = processedData.labels.map((_, index) => {
        const notaAtend = processedData.notaAtendimento[index] || 0
        const notaSol = processedData.notaSolucao[index] || 0
        return (notaAtend + notaSol) / 2
      })
    }

    const datasets = isTicketData ? [
      {
        label: 'Bom',
        data: processedData.bom,
        type: 'bar',
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        order: 1,
        yAxisID: 'y'
      },
      {
        label: 'Ruim',
        data: processedData.ruim,
        type: 'bar',
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        order: 2,
        yAxisID: 'y'
      },
      {
        label: 'Pesquisa (%)',
        data: mediaTendencia,
        type: 'line',
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 4,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#7C3AED',
        tension: 0.3,
        fill: false,
        order: 3,
        yAxisID: 'y1'
      }
    ] : isPhoneData ? [
      {
        label: 'Atendimento',
        data: processedData.notaAtendimento,
        type: 'line',
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 4,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#1D4ED8',
        tension: 0.3,
        fill: true,
        order: 1,
        yAxisID: 'y',
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(59, 130, 246, 0.3)'
      },
      {
        label: 'Solução',
        data: processedData.notaSolucao,
        type: 'line',
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        borderWidth: 4,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#7C3AED',
        tension: 0.3,
        fill: true,
        order: 2,
        yAxisID: 'y',
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(139, 92, 246, 0.3)'
      }
    ] : [
      {
        label: '📈 Tendência Geral',
        data: mediaTendencia,
        type: 'line',
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
        order: 0,
        yAxisID: 'y'
      },
      {
        label: '⭐ Nota Atendimento',
        data: processedData.notaAtendimento,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)')
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 45,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(16, 185, 129, 1)', 'rgba(5, 150, 105, 1)')
        },
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        order: 1
      },
      {
        label: '🎯 Nota Solução',
        data: processedData.notaSolucao,
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)')
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 45,
        hoverBackgroundColor: (context) => {
          const ctx = context.chart.ctx
          return createGradient(ctx, 'rgba(59, 130, 246, 1)', 'rgba(37, 99, 235, 1)')
        },
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        order: 2
      }
    ]

    return {
      labels: processedData.labels,
      datasets
    }
  }, [data, periodo])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: encontrouTickets ? 0 : 1000, // Sem animação para tickets
      easing: 'easeInOutQuart'
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
      datalabels: {
        display: function(context) {
          // Mostrar apenas nos pontos de Atendimento e Solução
          return context.dataset.label === 'Atendimento' || context.dataset.label === 'Solução'
        },
        color: '#ffffff',
        font: {
          size: 11,
          weight: '700',
          family: "'Inter', sans-serif"
        },
        backgroundColor: function(context) {
          // Cor de fundo baseada no dataset
          if (context.dataset.label === 'Atendimento') {
            return '#3B82F6'
          } else if (context.dataset.label === 'Solução') {
            return '#8B5CF6'
          }
          return '#6B7280'
        },
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
        padding: 6,
        formatter: function(value, context) {
          // Acessar os dados através do chart
          const chart = context.chart
          const datasets = chart.data.datasets
          const dataIndex = context.dataIndex
          
          // Encontrar os datasets de Atendimento e Solução
          const atendimentoDataset = datasets.find(d => d.label === 'Atendimento')
          const solucaoDataset = datasets.find(d => d.label === 'Solução')
          
          if (atendimentoDataset && solucaoDataset) {
            const notaAtend = atendimentoDataset.data[dataIndex] || 0
            const notaSol = solucaoDataset.data[dataIndex] || 0
            
            
            // Se ambas as notas são válidas (entre 1-5), calcular nota média
            if (notaAtend >= 1 && notaAtend <= 5 && notaSol >= 1 && notaSol <= 5) {
              const notaMedia = (notaAtend + notaSol) / 2
              return notaMedia.toFixed(2)
            }
          }
          
          return '0.00'
        },
        anchor: 'center',
        align: 'center',
        offset: 0
      },
      tooltip: {
        enabled: true,
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
            return encontrouTickets ? '📊 Contagem de Avaliações' : `📅 ${context[0].label}`
          },
          label: function(context) {
            const label = context.dataset.label
            const value = context.parsed.y
            
            if (encontrouTickets) {
              if (label === 'Bom') {
                return `✅ ${label}: ${value.toLocaleString('pt-BR')}`
              } else if (label === 'Ruim') {
                return `❌ ${label}: ${value.toLocaleString('pt-BR')}`
              } else if (label === 'Satisfação (%)') {
                return `📊 ${label}: ${value.toFixed(1)}%`
              }
            } else if (label === 'Atendimento' || label === 'Solução') {
              return `${label}: ${value.toFixed(2)}/5`
            }
            
            return `${label}: ${value.toFixed(2)}`
          },
          afterBody: function(context) {
            if (encontrouTickets) {
              const bomItem = context.find(item => item.dataset.label === 'Bom')
              const ruimItem = context.find(item => item.dataset.label === 'Ruim')
              const satisfacaoItem = context.find(item => item.dataset.label === 'Satisfação (%)')
              
              if (bomItem && ruimItem && satisfacaoItem) {
                const bom = bomItem.parsed.y
                const ruim = ruimItem.parsed.y
                const satisfacao = satisfacaoItem.parsed.y
                const total = bom + ruim
                
                return `\n📊 Total: ${total.toLocaleString('pt-BR')}\n📈 Satisfação: ${satisfacao.toFixed(1)}%`
              }
            } else {
              // Para telefonia, mostrar informações sobre as médias
              const mediaAtendItem = context.find(item => item.dataset.label === 'Atendimento')
              const mediaSolItem = context.find(item => item.dataset.label === 'Solução')
              
              if (mediaAtendItem && mediaSolItem) {
                const mediaAtend = mediaAtendItem.parsed.y
                const mediaSol = mediaSolItem.parsed.y
                const mediaGeral = (mediaAtend + mediaSol) / 2
                
                info.push(`📊 Média Geral: ${mediaGeral.toFixed(2)}/5`)
                
                // Classificar qualidade
                if (mediaGeral >= 4.5) {
                  info.push(`🏆 Excelente qualidade!`)
                } else if (mediaGeral >= 4.0) {
                  info.push(`👍 Muito boa qualidade`)
                } else if (mediaGeral >= 3.0) {
                  info.push(`⚠️ Qualidade regular`)
                } else {
                  info.push(`❌ Precisa melhorar`)
                }
              }
            }
            
            return info.length > 0 ? `\n${info.join('\n')}` : ''
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Período',
          color: '#374151',
          font: {
            size: 14,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#6B7280',
          padding: 12,
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        position: 'left',
        title: {
          display: true,
          text: encontrouTickets ? 'Quantidade' : 'Nota Média',
          color: '#374151',
          font: {
            size: 14,
            weight: '700',
            family: "'Inter', sans-serif"
          }
        },
        ticks: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: '#6B7280',
          padding: 16,
          stepSize: 0.5,
          callback: function(value) {
            return value.toFixed(1)
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
          lineWidth: 1,
          circular: false
        }
      },
      ...(encontrouTickets || (!encontrouTickets && isPhoneData) ? {
        y1: {
          beginAtZero: true,
          min: 0,
          max: 100,
          position: 'right',
          title: {
            display: true,
            text: 'Satisfação (%)',
            color: '#374151',
            font: {
              size: 14,
              weight: '700',
              family: "'Inter', sans-serif"
            }
          },
          ticks: {
            font: {
              size: 13,
              family: "'Inter', sans-serif",
              weight: '600'
            },
            color: '#6B7280',
            padding: 16,
            stepSize: 20,
            callback: function(value) {
              return value + '%'
            }
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.05)',
            drawBorder: false,
            lineWidth: 1,
            circular: false
          }
        }
      } : {})
    }
  }

  return <Bar data={chartData} options={options} />
}

// Função para processar dados de acordo com o período selecionado
const processCSATByPeriod = (data, periodo) => {
  // Determinar o tipo de agrupamento baseado no período
  const totalDays = periodo?.totalDays || 0
  let groupBy = 'month' // padrão para quando não há período
  
  if (totalDays > 0 && totalDays <= 7) {
    groupBy = 'day' // 7 dias ou menos = agrupar por dia
  } else if (totalDays > 7 && totalDays <= 60) {
    groupBy = 'day' // 8 a 60 dias = agrupar por dia também
  } else if (totalDays > 60) {
    groupBy = 'month' // mais de 60 dias = agrupar por mês
  }
  
  return processCSATByGrouping(data, groupBy)
}

// Função auxiliar para processar dados com agrupamento específico
const processCSATByGrouping = (data, groupBy) => {
  if (!data || data.length === 0) {
    return {
      labels: ['Sem dados'],
      notaAtendimento: [0],
      notaSolucao: [0],
      bom: [0],
      ruim: [0]
    }
  }


  // Agrupar dados
  const groupedData = {}
  
  data.forEach((record, index) => {
    // Tentar diferentes nomes de campo de data
    let dateField
    
    // Se for array (dados de telefonia), usar campo 'data' (índice 3)
    if (Array.isArray(record)) {
      // Para dados de telefonia: índice 3 = data
      dateField = record[3] // Campo "data" nos dados de telefonia
    } else {
      // Se for objeto (dados de chamadas)
      dateField = record.calldate || record.Data || record.data || record.date
    }
    
    // Limpar timestamp
    if (dateField && typeof dateField === 'string') {
      if (dateField.includes(' ')) {
        dateField = dateField.split(' ')[0]
      }
      dateField = dateField.trim()
    }
    
    if (!dateField) return
    
    const date = parseBrazilianDate(dateField)
    if (!date || isNaN(date.getTime())) return
    
    const key = getGroupKey(date, groupBy)
    
    if (!groupedData[key]) {
      groupedData[key] = {
        notasAtendimento: [],
        notasSolucao: [],
        bom: 0,
        ruim: 0,
        bomComComentario: 0,
        totalAvaliacoes: 0,
        date: date // guardar data para ordenação
      }
    }
    
    // Para dados de telefonia (array) - buscar nas colunas AB e AC
    if (Array.isArray(record)) {
      
      // Buscar nas colunas AB e AC especificamente
      let notaAtendimento = null
      let notaSolucao = null
      
      // Coluna AB (índice 27) - Nota de Atendimento
      if (record[27] !== undefined && record[27] !== null && record[27] !== '') {
        notaAtendimento = parseFloat(record[27])
      }
      
      // Coluna AC (índice 28) - Nota de Solução  
      if (record[28] !== undefined && record[28] !== null && record[28] !== '') {
        notaSolucao = parseFloat(record[28])
      }
      
      // Processar notas válidas (escala 1-5)
      if (notaAtendimento && notaAtendimento >= 1 && notaAtendimento <= 5) {
        groupedData[key].notasAtendimento.push(notaAtendimento)
      }
      
      if (notaSolucao && notaSolucao >= 1 && notaSolucao <= 5) {
        groupedData[key].notasSolucao.push(notaSolucao)
      }
      
      // Processar dados de tickets - coluna O: "bom", "bom com comentario", "ruim", "ruim com comentario"
      let tipoAvaliacao = ''
      
      // Por índice (coluna O = índice 14) - buscar texto
      if (record[14] !== undefined && record[14] !== null && record[14] !== '') {
        tipoAvaliacao = String(record[14]).trim().toLowerCase()
      }
      
      // Processar tipos de avaliação válidos
      if (tipoAvaliacao && tipoAvaliacao !== '0' && tipoAvaliacao !== '' && tipoAvaliacao !== 'null' && tipoAvaliacao !== 'undefined') {
        // Contar como uma avaliação
        groupedData[key].totalAvaliacoes = (groupedData[key].totalAvaliacoes || 0) + 1
        
        // Classificar como bom ou ruim
        if (tipoAvaliacao.includes('bom')) {
          groupedData[key].bom = (groupedData[key].bom || 0) + 1
        } else if (tipoAvaliacao.includes('ruim')) {
          groupedData[key].ruim = (groupedData[key].ruim || 0) + 1
        }
      }
    } else {
      // Para dados de chamadas (objeto) - buscar especificamente nas colunas AB e AC
      const camposDisponiveis = Object.keys(record)
      
      
      // Buscar nas colunas AB e AC especificamente
      let notaAtendimento = null
      let notaSolucao = null
      
      // Coluna AB - Nota de Atendimento
      if (record['Pergunta2 1 PERGUNTA ATENDENTE']) {
        notaAtendimento = parseFloat(record['Pergunta2 1 PERGUNTA ATENDENTE'])
      }
      
      // Coluna AC - Nota de Solução  
      if (record['Pergunta2 2 PERGUNTA SOLUCAO']) {
        notaSolucao = parseFloat(record['Pergunta2 2 PERGUNTA SOLUCAO'])
      }
      
      // Fallback para campos conhecidos se AB/AC não tiverem dados
      if (!notaAtendimento) {
        notaAtendimento = record.notaAtendimento || record.rating_attendance
      }
      
      if (!notaSolucao) {
        notaSolucao = record.notaSolucao || record.rating_solution
      }
      
      // Processar notas válidas (escala 1-5)
      if (notaAtendimento && parseFloat(notaAtendimento) >= 1 && parseFloat(notaAtendimento) <= 5) {
        groupedData[key].notasAtendimento.push(parseFloat(notaAtendimento))
      }
      
      if (notaSolucao && parseFloat(notaSolucao) >= 1 && parseFloat(notaSolucao) <= 5) {
        groupedData[key].notasSolucao.push(parseFloat(notaSolucao))
      }
      
      // Processar dados de tickets (bom/ruim) se existirem
      if (record['Pergunta2 3 PERGUNTA BOM']) {
        const bomValue = parseFloat(record['Pergunta2 3 PERGUNTA BOM'])
        if (!isNaN(bomValue)) {
          groupedData[key].bom += bomValue
        }
      }
      
      if (record['Pergunta2 4 PERGUNTA RUIM']) {
        const ruimValue = parseFloat(record['Pergunta2 4 PERGUNTA RUIM'])
        if (!isNaN(ruimValue)) {
          groupedData[key].ruim += ruimValue
        }
      }
      
      // Processar dados de tickets - coluna O: "bom", "bom com comentario", "ruim", "ruim com comentario"
      let tipoAvaliacaoObj = ''
      
      // Por nome da coluna - buscar texto de avaliação
      if (record['Tipo de avaliação'] && record['Tipo de avaliação'] !== '' && record['Tipo de avaliação'] !== 0) {
        tipoAvaliacaoObj = String(record['Tipo de avaliação']).trim().toLowerCase()
      }
      
      // Processar tipos de avaliação válidos para objetos
      if (tipoAvaliacaoObj && tipoAvaliacaoObj !== '0' && tipoAvaliacaoObj !== '' && tipoAvaliacaoObj !== 'null' && tipoAvaliacaoObj !== 'undefined') {
        groupedData[key].totalAvaliacoes = (groupedData[key].totalAvaliacoes || 0) + 1
        
        if (tipoAvaliacaoObj.includes('bom')) {
          groupedData[key].bom = (groupedData[key].bom || 0) + 1
        } else if (tipoAvaliacaoObj.includes('ruim')) {
          groupedData[key].ruim = (groupedData[key].ruim || 0) + 1
        }
      }
      
      // Fallback para campos conhecidos se não tiver dados nas colunas específicas
      if (!groupedData[key].bom && record.bom) {
        const bomValue = parseFloat(record.bom)
        if (!isNaN(bomValue)) {
          groupedData[key].bom += bomValue
        }
      }
      
      if (!groupedData[key].ruim && record.ruim) {
        const ruimValue = parseFloat(record.ruim)
        if (!isNaN(ruimValue)) {
          groupedData[key].ruim += ruimValue
        }
      }
      
      if (!groupedData[key].bomComComentario && record.bomComComentario) {
        const bomComComentarioValue = parseFloat(record.bomComComentario)
        if (!isNaN(bomComComentarioValue)) {
          groupedData[key].bomComComentario = (groupedData[key].bomComComentario || 0) + bomComComentarioValue
        }
      }
      
      if (!groupedData[key].totalAvaliacoes && record.totalAvaliacoes) {
        const totalAvaliacoesValue = parseFloat(record.totalAvaliacoes)
        if (!isNaN(totalAvaliacoesValue)) {
          groupedData[key].totalAvaliacoes = (groupedData[key].totalAvaliacoes || 0) + totalAvaliacoesValue
        }
      }
    }
  })

  // Converter para arrays ordenados
  const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    return groupedData[a].date - groupedData[b].date
  })
  
  const labels = sortedKeys.map(k => formatLabel(k, groupBy))
  const notaAtendimento = sortedKeys.map(k => {
    const notas = groupedData[k].notasAtendimento
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })
  const notaSolucao = sortedKeys.map(k => {
    const notas = groupedData[k].notasSolucao
    return notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
  })
  const bom = sortedKeys.map(k => groupedData[k].bom)
  const ruim = sortedKeys.map(k => groupedData[k].ruim)
  const bomComComentario = sortedKeys.map(k => groupedData[k].bomComComentario || 0)
  const totalAvaliacoes = sortedKeys.map(k => groupedData[k].totalAvaliacoes || 0)

  // Debug: mostrar resumo das notas encontradas
  const totalNotasAtendimento = notaAtendimento.reduce((sum, media) => sum + (isNaN(media) ? 0 : 1), 0)
  const totalNotasSolucao = notaSolucao.reduce((sum, media) => sum + (isNaN(media) ? 0 : 1), 0)
  

  return { labels, notaAtendimento, notaSolucao, bom, ruim, bomComComentario, totalAvaliacoes }
}

// Parsear data brasileira (DD/MM/YYYY)
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null
  
  // Se já é uma data válida
  if (dateStr instanceof Date) return dateStr
  
  // Formato DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  
  // Tentar parse direto
  return new Date(dateStr)
}

// Obter chave de agrupamento
const getGroupKey = (date, groupBy) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (groupBy === 'day') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (groupBy === 'week') {
    const weekNum = getWeekNumber(date)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  } else { // month
    return `${year}-${String(month).padStart(2, '0')}`
  }
}

// Obter número da semana do ano
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// Formatar label de acordo com o agrupamento
const formatLabel = (key, groupBy) => {
  if (groupBy === 'day') {
    const parts = key.split('-')
    return `${parts[2]}/${parts[1]}`
  } else if (groupBy === 'week') {
    const parts = key.split('-W')
    return `Sem ${parts[1]}`
  } else { // month
    const parts = key.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return monthNames[parseInt(parts[1]) - 1]
  }
}

export default CSATChart
