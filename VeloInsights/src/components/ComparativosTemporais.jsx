import React, { memo, useMemo, useCallback, useState } from 'react'
import './ComparativosTemporais.css'

const ComparativosTemporais = memo(({ dadosAtuais, dadosAnterior, tipoComparativo = 'mensal', periodoSelecionado = 'allRecords' }) => {
  
  // Estados para controlar o fluxo
  const [mostrarSeletores, setMostrarSeletores] = useState(false)
  const [mesA, setMesA] = useState('')
  const [mesB, setMesB] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [dadosComparativo, setDadosComparativo] = useState(null)

  // Lista de meses disponíveis (baseado nos dados)
  const mesesDisponiveis = useMemo(() => {
    if (!dadosAtuais || dadosAtuais.length === 0) {
      console.log('❌ ComparativosTemporais: Sem dados atuais')
      return []
    }
    
    const meses = new Set()
    const headerRow = dadosAtuais[0]
    let dateColumnIndex = 3 // Coluna D por padrão
    
    if (Array.isArray(headerRow)) {
      dateColumnIndex = headerRow.findIndex(col => 
        col && col.toLowerCase().includes('data')
      )
      if (dateColumnIndex === -1) {
        dateColumnIndex = 3
      }
    }
    
    console.log('📊 Coluna de data encontrada no índice:', dateColumnIndex)

    // Coletar meses únicos dos dados - PROCESSAR TODOS OS REGISTROS
    for (let i = 1; i < dadosAtuais.length; i++) {
      let dateStr = null
      
      // Verificar se é objeto ou array
      if (typeof dadosAtuais[i] === 'object' && !Array.isArray(dadosAtuais[i])) {
        // É um objeto - acessar propriedade 'data'
        dateStr = dadosAtuais[i].data || dadosAtuais[i]['Data'] || dadosAtuais[i].dataAtendimento
      } else if (Array.isArray(dadosAtuais[i])) {
        // É um array - acessar por índice
        dateStr = dadosAtuais[i][dateColumnIndex]
      }
      
      if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const month = parseInt(parts[1]) - 1
          const year = parseInt(parts[2])
          const fullYear = year < 100 ? 2000 + year : year
          const monthKey = `${month}-${fullYear}`
          meses.add(monthKey)
          
          // Log apenas os primeiros 10 para debug
          if (i <= 10) {
            console.log(`📅 Data encontrada: ${dateStr} -> Mês: ${month}, Ano: ${fullYear}`)
          }
        }
      }
    }

    console.log(`📊 Processados ${dadosAtuais.length - 1} registros`)
    console.log('📊 Meses únicos encontrados:', Array.from(meses))

    // Converter para array de objetos
    const mesesArray = Array.from(meses).map(monthKey => {
      const [month, year] = monthKey.split('-')
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
      return {
        value: monthKey,
        label: `${monthNames[parseInt(month)]} ${year}`,
        month: parseInt(month),
        year: parseInt(year)
      }
    })

    // Ordenar por ano e mês
    const mesesOrdenados = mesesArray.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
    
    console.log('📊 Meses finais para dropdown:', mesesOrdenados)
    
    // Se não encontrou meses nos dados, criar uma lista básica
    if (mesesOrdenados.length === 0) {
      console.log('⚠️ Nenhum mês encontrado nos dados, criando lista básica...')
      const mesesBasicos = [
        { value: '0-2025', label: 'Janeiro 2025', month: 0, year: 2025 },
        { value: '1-2025', label: 'Fevereiro 2025', month: 1, year: 2025 },
        { value: '2-2025', label: 'Março 2025', month: 2, year: 2025 },
        { value: '3-2025', label: 'Abril 2025', month: 3, year: 2025 },
        { value: '4-2025', label: 'Maio 2025', month: 4, year: 2025 },
        { value: '5-2025', label: 'Junho 2025', month: 5, year: 2025 },
        { value: '6-2025', label: 'Julho 2025', month: 6, year: 2025 },
        { value: '7-2025', label: 'Agosto 2025', month: 7, year: 2025 },
        { value: '8-2025', label: 'Setembro 2025', month: 8, year: 2025 },
        { value: '9-2025', label: 'Outubro 2025', month: 9, year: 2025 },
        { value: '10-2025', label: 'Novembro 2025', month: 10, year: 2025 },
        { value: '11-2025', label: 'Dezembro 2025', month: 11, year: 2025 }
      ]
      console.log('📊 Usando meses básicos:', mesesBasicos)
      return mesesBasicos
    }
    
    return mesesOrdenados
  }, [dadosAtuais])

  // Função para filtrar dados por mês
  const filtrarDadosPorMes = useCallback((dados, mesKey) => {
    if (!dados || dados.length === 0 || !mesKey) return []
    
    // Encontrar coluna de data - verificar se é array
    const headerRow = dados[0]
    let dateColumnIndex = 3 // Coluna D por padrão
    
    if (Array.isArray(headerRow)) {
      dateColumnIndex = headerRow.findIndex(col => 
        col && col.toLowerCase().includes('data')
      )
      if (dateColumnIndex === -1) {
        dateColumnIndex = 3 // Coluna D por padrão
      }
    }

    // Extrair mês e ano do mesKey
    const [month, year] = mesKey.split('-')
    const targetMonth = parseInt(month)
    const targetYear = parseInt(year)

    return dados.filter((row, index) => {
      if (index === 0) return true // Manter header
      
      let dateStr = null
      
      // Verificar se é objeto ou array
      if (typeof row === 'object' && !Array.isArray(row)) {
        // É um objeto - acessar propriedade 'data'
        dateStr = row.data || row['Data'] || row.dataAtendimento
      } else if (Array.isArray(row)) {
        // É um array - acessar por índice
        dateStr = row[dateColumnIndex]
      }
      
      if (!dateStr) return false

      try {
        let rowDate
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/')
          if (parts.length === 3) {
            const day = parseInt(parts[0])
            const month = parseInt(parts[1]) - 1
            const year = parseInt(parts[2])
            const fullYear = year < 100 ? 2000 + year : year
            rowDate = new Date(fullYear, month, day)
          }
        } else {
          rowDate = new Date(dateStr)
        }

        if (isNaN(rowDate.getTime())) return false

        // Verificar se a data está no mês e ano especificados
        return rowDate.getMonth() === targetMonth && rowDate.getFullYear() === targetYear
      } catch (error) {
        return false
      }
    })
  }, [])

  // Função para executar comparação
  const executarComparacao = useCallback(async () => {
    if (!mesA || !mesB) return

    setCarregando(true)
    
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Filtrar dados para cada mês
    const dadosMesA = filtrarDadosPorMes(dadosAtuais, mesA)
    const dadosMesB = filtrarDadosPorMes(dadosAtuais, mesB)
    
    // Encontrar os nomes dos meses selecionados
    const mesASelecionado = mesesDisponiveis.find(m => m.value === mesA)
    const mesBSelecionado = mesesDisponiveis.find(m => m.value === mesB)
    
    // 🔍 VERIFICAÇÃO AUTOMÁTICA COMPLETA
    console.log('='.repeat(80))
    console.log('🔍 VERIFICAÇÃO AUTOMÁTICA - COMPARATIVOS TEMPORAIS')
    console.log('='.repeat(80))
    
    // Verificar dados filtrados
    console.log('📊 DADOS FILTRADOS:')
    console.log(`  Mês A (${mesASelecionado?.label}): ${dadosMesA.length} registros`)
    console.log(`  Mês B (${mesBSelecionado?.label}): ${dadosMesB.length} registros`)
    
    // Verificar quantidade de chamadas
    const qtdChamadasA = dadosMesA.length - 1
    const qtdChamadasB = dadosMesB.length - 1
    console.log(`  Quantidade A: ${qtdChamadasA} chamadas`)
    console.log(`  Quantidade B: ${qtdChamadasB} chamadas`)
    
    // Verificar avaliações
    const avaliacoesA = verificarAvaliacoes(dadosMesA)
    const avaliacoesB = verificarAvaliacoes(dadosMesB)
    console.log('⭐ AVALIAÇÕES:')
    console.log(`  Atendimento A: ${avaliacoesA.atendimento.media}/5 (${avaliacoesA.atendimento.total} válidas)`)
    console.log(`  Atendimento B: ${avaliacoesB.atendimento.media}/5 (${avaliacoesB.atendimento.total} válidas)`)
    console.log(`  Solução A: ${avaliacoesA.solucao.media}/5 (${avaliacoesA.solucao.total} válidas)`)
    console.log(`  Solução B: ${avaliacoesB.solucao.media}/5 (${avaliacoesB.solucao.total} válidas)`)
    
    // Verificar tempos
    const temposA = verificarTempos(dadosMesA)
    const temposB = verificarTempos(dadosMesB)
    console.log('⏱️ TEMPOS:')
    console.log(`  TMA A: ${temposA.tma.formatado} (${temposA.tma.total} válidos)`)
    console.log(`  TMA B: ${temposB.tma.formatado} (${temposB.tma.total} válidos)`)
    console.log(`  TME A: ${temposA.tme.formatado} (${temposA.tme.total} válidos)`)
    console.log(`  TME B: ${temposB.tme.formatado} (${temposB.tme.total} válidos)`)
    console.log(`  TMU A: ${temposA.tmu.formatado} (${temposA.tmu.total} válidos)`)
    console.log(`  TMU B: ${temposB.tmu.formatado} (${temposB.tmu.total} válidos)`)
    
    // Calcular variações
    const variacoes = calcularVariacoes(avaliacoesA, avaliacoesB, temposA, temposB, qtdChamadasA, qtdChamadasB)
    console.log('📈 VARIAÇÕES:')
    console.log(`  Chamadas: ${variacoes.chamadas.percentual.toFixed(1)}% (${variacoes.chamadas.tendencia})`)
    console.log(`  Atendimento: ${variacoes.atendimento.percentual.toFixed(1)}% (${variacoes.atendimento.tendencia})`)
    console.log(`  Solução: ${variacoes.solucao.percentual.toFixed(1)}% (${variacoes.solucao.tendencia})`)
    console.log(`  TMA: ${variacoes.tma.percentual.toFixed(1)}% (${variacoes.tma.tendencia})`)
    console.log(`  TME: ${variacoes.tme.percentual.toFixed(1)}% (${variacoes.tme.tendencia})`)
    console.log(`  TMU: ${variacoes.tmu.percentual.toFixed(1)}% (${variacoes.tmu.tendencia})`)
    
    console.log('='.repeat(80))
    
    setDadosComparativo({
      periodoA: dadosMesA,
      periodoB: dadosMesB,
      nomePeriodoA: mesASelecionado?.label || mesA,
      nomePeriodoB: mesBSelecionado?.label || mesB
    })
    
    setCarregando(false)
  }, [mesA, mesB, dadosAtuais, filtrarDadosPorMes, mesesDisponiveis])

  // Função auxiliar para verificar avaliações
  const verificarAvaliacoes = (dados) => {
    let totalAtendimento = 0, contadorAtendimento = 0
    let totalSolucao = 0, contadorSolucao = 0
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      
      // Avaliação Atendimento
      let avaliacaoAtendimento = null
      if (Array.isArray(record)) {
        avaliacaoAtendimento = record[27]
      } else if (typeof record === 'object') {
        avaliacaoAtendimento = record.pergunta2Atendente || record['Pergunta2 1 PERGUNTA ATENDENTE']
      }
      
      if (avaliacaoAtendimento && !isNaN(parseFloat(avaliacaoAtendimento))) {
        const valor = parseFloat(avaliacaoAtendimento)
        if (valor >= 1 && valor <= 5) {
          totalAtendimento += valor
          contadorAtendimento++
        }
      }
      
      // Avaliação Solução
      let avaliacaoSolucao = null
      if (Array.isArray(record)) {
        avaliacaoSolucao = record[28]
      } else if (typeof record === 'object') {
        avaliacaoSolucao = record.pergunta2Solucao || record['Pergunta2 2 PERGUNTA SOLUCAO']
      }
      
      if (avaliacaoSolucao && !isNaN(parseFloat(avaliacaoSolucao))) {
        const valor = parseFloat(avaliacaoSolucao)
        if (valor >= 1 && valor <= 5) {
          totalSolucao += valor
          contadorSolucao++
        }
      }
    }
    
    return {
      atendimento: {
        total: contadorAtendimento,
        media: contadorAtendimento > 0 ? totalAtendimento / contadorAtendimento : 0
      },
      solucao: {
        total: contadorSolucao,
        media: contadorSolucao > 0 ? totalSolucao / contadorSolucao : 0
      }
    }
  }

  // Função auxiliar para verificar tempos
  const verificarTempos = (dados) => {
    let totalTMA = 0, contadorTMA = 0
    let totalTME = 0, contadorTME = 0
    let totalTMU = 0, contadorTMU = 0
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      
      // TMA
      let tempoTMA = null
      if (Array.isArray(record)) {
        tempoTMA = record[14]
      } else if (typeof record === 'object') {
        tempoTMA = record.tempoTotal || record['Tempo Total']
      }
      
      if (tempoTMA && typeof tempoTMA === 'string' && tempoTMA.includes(':')) {
        const minutos = parseDurationToMinutes(tempoTMA)
        if (minutos > 0) {
          totalTMA += minutos
          contadorTMA++
        }
      }
      
      // TME
      let tempoTME = null
      if (Array.isArray(record)) {
        tempoTME = record[12]
      } else if (typeof record === 'object') {
        tempoTME = record.tempoEspera || record['Tempo De Espera']
      }
      
      if (tempoTME && typeof tempoTME === 'string' && tempoTME.includes(':')) {
        const minutos = parseDurationToMinutes(tempoTME)
        totalTME += minutos
        contadorTME++
      }
      
      // TMU
      let tempoTMU = null
      if (Array.isArray(record)) {
        tempoTMU = record[11]
      } else if (typeof record === 'object') {
        tempoTMU = record.tempoURA || record['Tempo Na Ura']
      }
      
      if (tempoTMU && typeof tempoTMU === 'string' && tempoTMU.includes(':')) {
        const minutos = parseDurationToMinutes(tempoTMU)
        totalTMU += minutos
        contadorTMU++
      }
    }
    
    return {
      tma: {
        total: contadorTMA,
        media: contadorTMA > 0 ? totalTMA / contadorTMA : 0,
        formatado: contadorTMA > 0 ? formatarTempo(totalTMA / contadorTMA) : '0:00'
      },
      tme: {
        total: contadorTME,
        media: contadorTME > 0 ? totalTME / contadorTME : 0,
        formatado: contadorTME > 0 ? formatarTempo(totalTME / contadorTME) : '0:00'
      },
      tmu: {
        total: contadorTMU,
        media: contadorTMU > 0 ? totalTMU / contadorTMU : 0,
        formatado: contadorTMU > 0 ? formatarTempo(totalTMU / contadorTMU) : '0:00'
      }
    }
  }

  // Função auxiliar para calcular variações
  const calcularVariacoes = (avaliacoesA, avaliacoesB, temposA, temposB, qtdA, qtdB) => {
    const calcularVariacao = (atual, anterior) => {
      if (anterior === 0) return { percentual: 0, tendencia: 'neutra' }
      const variacao = ((anterior - atual) / anterior) * 100
      return {
        percentual: variacao,
        tendencia: variacao > 5 ? 'crescimento' : variacao < -5 ? 'declínio' : 'neutra'
      }
    }
    
    return {
      chamadas: calcularVariacao(qtdA, qtdB),
      atendimento: calcularVariacao(avaliacoesA.atendimento.media, avaliacoesB.atendimento.media),
      solucao: calcularVariacao(avaliacoesA.solucao.media, avaliacoesB.solucao.media),
      tma: calcularVariacao(temposA.tma.media, temposB.tma.media),
      tme: calcularVariacao(temposA.tme.media, temposB.tme.media),
      tmu: calcularVariacao(temposA.tmu.media, temposB.tmu.media)
    }
  }
  
  // Função para converter HH:MM:SS para minutos
  const parseDurationToMinutes = useCallback((durationString) => {
    if (!durationString || typeof durationString !== 'string') return 0
    
    const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = parseInt(timeMatch[3], 10);
      return (hours * 60) + minutes + (seconds / 60);
    }
    
    return parseFloat(durationString) || 0;
  }, [])

  // Função para determinar status da tendência
  const getTendenciaStatus = useCallback((percentual, tipoMetrica = 'geral') => {
    // Para métricas de tempo (TME, TMA, TMU): subindo = ruim (vermelho), descendo = bom (verde)
    if (tipoMetrica === 'tempo') {
      if (percentual > 5) return { status: 'Subindo', cor: '#ef4444', icone: '📈' } // Vermelho - ruim
      if (percentual < -5) return { status: 'Descendo', cor: '#10b981', icone: '📉' } // Verde - bom
      return { status: 'Mantendo', cor: '#6b7280', icone: '➡️' }
    }
    
    // Para métricas gerais (quantidade, avaliação): subindo = bom (verde), descendo = ruim (vermelho)
    if (percentual > 5) return { status: 'Subindo', cor: '#10b981', icone: '📈' } // Verde - bom
    if (percentual < -5) return { status: 'Caindo', cor: '#ef4444', icone: '📉' } // Vermelho - ruim
    return { status: 'Mantendo', cor: '#6b7280', icone: '➡️' }
  }, [])

  // Função para formatar valores com separadores
  const formatarNumero = useCallback((numero) => {
    if (!numero || numero === 0) return '0'
    return parseFloat(numero).toLocaleString('pt-BR')
  }, [])

  // Função para calcular métricas de um período
  const calcularMetricasPeriodo = useCallback((dados) => {
    if (!dados || dados.length === 0) {
      return {
        quantidadeChamadas: 0,
        avaliacaoAtendimento: 0,
        avaliacaoSolucao: 0,
        tma: 0,
        tme: 0,
        tmu: 0
      }
    }

    let totalAvaliacaoAtendimento = 0
    let totalAvaliacaoSolucao = 0
    let totalTMA = 0
    let totalTME = 0
    let totalTMU = 0
    let contadorAvaliacaoAtendimento = 0
    let contadorAvaliacaoSolucao = 0
    let contadorTMA = 0
    let contadorTME = 0
    let contadorTMU = 0
    let contadorTMEZero = 0
    let contadorTMUZero = 0

    dados.forEach((record, index) => {
      // Pular header
      if (index === 0) return
      
      // Quantidade de Chamadas - Coluna A (índice 0)
      // (já contado pelo length do array)

      // Avaliação Atendimento - Coluna AB (índice 27)
      let avaliacaoAtendimento = null
      if (typeof record === 'object' && !Array.isArray(record)) {
        // É um objeto
        avaliacaoAtendimento = record.pergunta2Atendente || record['Pergunta2 1 PERGUNTA ATENDENTE'] || record.avaliacaoAtendimento
      } else if (Array.isArray(record)) {
        // É um array
        avaliacaoAtendimento = record[27]
      }
      
      if (avaliacaoAtendimento && !isNaN(parseFloat(avaliacaoAtendimento))) {
        totalAvaliacaoAtendimento += parseFloat(avaliacaoAtendimento)
        contadorAvaliacaoAtendimento++
      }

      // Avaliação Solução - Coluna AC (índice 28)
      let avaliacaoSolucao = null
      if (typeof record === 'object' && !Array.isArray(record)) {
        // É um objeto
        avaliacaoSolucao = record.pergunta2Solucao || record['Pergunta2 2 PERGUNTA SOLUCAO'] || record.avaliacaoSolucao
      } else if (Array.isArray(record)) {
        // É um array
        avaliacaoSolucao = record[28]
      }
      
      if (avaliacaoSolucao && !isNaN(parseFloat(avaliacaoSolucao))) {
        totalAvaliacaoSolucao += parseFloat(avaliacaoSolucao)
        contadorAvaliacaoSolucao++
      }

      // TMA - Tempo Médio de Atendimento - Coluna O (índice 14)
      let tempoTotal = null
      if (typeof record === 'object' && !Array.isArray(record)) {
        // É um objeto
        tempoTotal = record.tempoTotal || record['Tempo Total'] || record.duracao
      } else if (Array.isArray(record)) {
        // É um array
        tempoTotal = record[14]
      }
      
      // Debug para TMA
      if (index <= 5) {
        console.log(`🔍 TMA Debug - Registro ${index}:`, {
          tempoTotal,
          record: typeof record === 'object' ? Object.keys(record) : 'array',
          coluna14: Array.isArray(record) ? record[14] : 'N/A',
          parseResult: tempoTotal ? parseDurationToMinutes(tempoTotal) : 'N/A'
        })
      }
      
      if (tempoTotal) {
        const minutosTMA = parseDurationToMinutes(tempoTotal)
        if (minutosTMA > 0) {
          totalTMA += minutosTMA
          contadorTMA++
        }
      }

      // TME - Tempo Médio de Espera - Coluna M (índice 12)
      let tempoEspera = null
      if (typeof record === 'object' && !Array.isArray(record)) {
        // É um objeto
        tempoEspera = record.tempoEspera || record['Tempo De Espera'] || record.tme
      } else if (Array.isArray(record)) {
        // É um array
        tempoEspera = record[12]
      }
      
      // Debug para TME
      if (index <= 5) {
        console.log(`🔍 TME Debug - Registro ${index}:`, {
          tempoEspera,
          record: typeof record === 'object' ? Object.keys(record) : 'array',
          coluna12: Array.isArray(record) ? record[12] : 'N/A',
          parseResult: tempoEspera ? parseDurationToMinutes(tempoEspera) : 'N/A',
          isZero: tempoEspera === '00:00:00'
        })
      }
      
      if (tempoEspera) {
        const minutosTME = parseDurationToMinutes(tempoEspera)
        totalTME += minutosTME // Incluir zeros na média
        contadorTME++
        if (tempoEspera === '00:00:00') {
          contadorTMEZero++
        }
      }

      // TMU - Tempo Médio na URA - Coluna L (índice 11)
      let tempoURA = null
      if (typeof record === 'object' && !Array.isArray(record)) {
        // É um objeto
        tempoURA = record.tempoURA || record['Tempo Na Ura'] || record.tmu
      } else if (Array.isArray(record)) {
        // É um array
        tempoURA = record[11]
      }
      
      // Debug para TMU
      if (index <= 5) {
        console.log(`🔍 TMU Debug - Registro ${index}:`, {
          tempoURA,
          record: typeof record === 'object' ? Object.keys(record) : 'array',
          coluna11: Array.isArray(record) ? record[11] : 'N/A',
          parseResult: tempoURA ? parseDurationToMinutes(tempoURA) : 'N/A'
        })
      }
      
      if (tempoURA) {
        const minutosTMU = parseDurationToMinutes(tempoURA)
        totalTMU += minutosTMU // Incluir zeros na média
        contadorTMU++
        if (tempoURA === '00:00:00') {
          contadorTMUZero++
        }
      }
    })

    // Calcular médias inteligentes para TME e TMU
    const percentualZerosTME = contadorTME > 0 ? (contadorTMEZero / contadorTME * 100) : 0
    const percentualZerosTMU = contadorTMU > 0 ? (contadorTMUZero / contadorTMU * 100) : 0
    
    // Se mais de 90% são zeros, usar média apenas dos registros válidos
    const tmeFinal = percentualZerosTME > 90 && (contadorTME - contadorTMEZero) > 0 
      ? totalTME / (contadorTME - contadorTMEZero) 
      : contadorTME > 0 ? totalTME / contadorTME : 0
      
    const tmuFinal = percentualZerosTMU > 90 && (contadorTMU - contadorTMUZero) > 0 
      ? totalTMU / (contadorTMU - contadorTMUZero) 
      : contadorTMU > 0 ? totalTMU / contadorTMU : 0

    // Log de resumo dos cálculos
    console.log('📊 Resumo dos Cálculos:', {
      registrosProcessados: dados.length - 1, // Excluir header
      TMA: {
        contador: contadorTMA,
        total: totalTMA,
        media: contadorTMA > 0 ? totalTMA / contadorTMA : 0,
        mediaFormatada: contadorTMA > 0 ? formatarTempo(totalTMA / contadorTMA) : '0:00'
      },
      TME: {
        contador: contadorTME,
        contadorZero: contadorTMEZero,
        total: totalTME,
        percentualZeros: percentualZerosTME.toFixed(1) + '%',
        registrosComTempo: contadorTME - contadorTMEZero,
        mediaComZeros: contadorTME > 0 ? totalTME / contadorTME : 0,
        mediaSemZeros: (contadorTME - contadorTMEZero) > 0 ? totalTME / (contadorTME - contadorTMEZero) : 0,
        mediaFinal: tmeFinal,
        logicaUsada: percentualZerosTME > 90 ? 'SEM_ZEROS' : 'COM_ZEROS'
      },
      TMU: {
        contador: contadorTMU,
        contadorZero: contadorTMUZero,
        total: totalTMU,
        percentualZeros: percentualZerosTMU.toFixed(1) + '%',
        registrosComTempo: contadorTMU - contadorTMUZero,
        mediaComZeros: contadorTMU > 0 ? totalTMU / contadorTMU : 0,
        mediaSemZeros: (contadorTMU - contadorTMUZero) > 0 ? totalTMU / (contadorTMU - contadorTMUZero) : 0,
        mediaFinal: tmuFinal,
        logicaUsada: percentualZerosTMU > 90 ? 'SEM_ZEROS' : 'COM_ZEROS'
      }
    })

    // Log detalhado para debug
    console.log('🔍 DEBUG DETALHADO TME:', {
      contadorTME,
      contadorTMEZero,
      totalTME,
      percentualZerosTME,
      tmeFinal,
      formatarTempo: formatarTempo(tmeFinal)
    })

    console.log('🔍 DEBUG DETALHADO TMU:', {
      contadorTMU,
      contadorTMUZero,
      totalTMU,
      percentualZerosTMU,
      tmuFinal,
      formatarTempo: formatarTempo(tmuFinal)
    })

    return {
      quantidadeChamadas: dados.length - 1, // Excluir header
      avaliacaoAtendimento: contadorAvaliacaoAtendimento > 0 ? totalAvaliacaoAtendimento / contadorAvaliacaoAtendimento : 0,
      avaliacaoSolucao: contadorAvaliacaoSolucao > 0 ? totalAvaliacaoSolucao / contadorAvaliacaoSolucao : 0,
      tma: contadorTMA > 0 ? totalTMA / contadorTMA : 0,
      tme: tmeFinal,
      tmu: tmuFinal,
      // Debug info
      debug: {
        contadorTMA,
        contadorTME,
        contadorTMU,
        totalTMA,
        totalTME,
        totalTMU,
        registrosProcessados: dados.length - 1, // Excluir header
        percentualZerosTME: percentualZerosTME.toFixed(1) + '%',
        percentualZerosTMU: percentualZerosTMU.toFixed(1) + '%',
        tmeFinal,
        tmuFinal
      }
    }
  }, [parseDurationToMinutes])

  // Função para formatar tempo em HH:MM:SS ou MM:SS
  const formatarTempo = useCallback((minutos) => {
    if (minutos === 0) return '0:00'

    const horas = Math.floor(minutos / 60)
    const mins = Math.floor(minutos % 60)
    const segs = Math.round((minutos % 1) * 60)
    
    if (horas > 0) {
      return `${horas}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
    } else if (mins > 0) {
      return `${mins}:${segs.toString().padStart(2, '0')}`
    } else {
      return `0:${segs.toString().padStart(2, '0')}`
    }
  }, [])

  // Função para calcular variação percentual
  const calcularVariacao = useCallback((atual, anterior) => {
    if (anterior === 0) return { percentual: 0, tendencia: 'neutra' }
    const variacao = ((anterior - atual) / anterior) * 100
    return {
      percentual: variacao, // ✅ CORRIGIDO: (anterior - atual) para lógica correta
      tendencia: variacao > 0 ? 'crescimento' : variacao < 0 ? 'declínio' : 'neutra'
    }
  }, [])

  const comparativo = useMemo(() => {
    if (!dadosComparativo) return null
    
    const metricasPeriodoA = calcularMetricasPeriodo(dadosComparativo.periodoA)
    const metricasPeriodoB = calcularMetricasPeriodo(dadosComparativo.periodoB)

    return {
      quantidadeChamadas: {
        atual: metricasPeriodoA.quantidadeChamadas,
        anterior: metricasPeriodoB.quantidadeChamadas,
        ...calcularVariacao(metricasPeriodoA.quantidadeChamadas, metricasPeriodoB.quantidadeChamadas)
      },
      avaliacaoAtendimento: {
        atual: metricasPeriodoA.avaliacaoAtendimento,
        anterior: metricasPeriodoB.avaliacaoAtendimento,
        ...calcularVariacao(metricasPeriodoA.avaliacaoAtendimento, metricasPeriodoB.avaliacaoAtendimento)
      },
      avaliacaoSolucao: {
        atual: metricasPeriodoA.avaliacaoSolucao,
        anterior: metricasPeriodoB.avaliacaoSolucao,
        ...calcularVariacao(metricasPeriodoA.avaliacaoSolucao, metricasPeriodoB.avaliacaoSolucao)
      },
      tma: {
        atual: metricasPeriodoA.tma,
        anterior: metricasPeriodoB.tma,
        ...calcularVariacao(metricasPeriodoA.tma, metricasPeriodoB.tma)
      },
      tme: {
        atual: metricasPeriodoA.tme,
        anterior: metricasPeriodoB.tme,
        ...calcularVariacao(metricasPeriodoA.tme, metricasPeriodoB.tme)
      },
      tmu: {
        atual: metricasPeriodoA.tmu,
        anterior: metricasPeriodoB.tmu,
        ...calcularVariacao(metricasPeriodoA.tmu, metricasPeriodoB.tmu)
      }
    }
  }, [dadosComparativo, calcularMetricasPeriodo, calcularVariacao])

  // Se não há dados atuais, não mostrar o componente
  if (!dadosAtuais || dadosAtuais.length === 0) {
    return null
  }

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'crescimento': return '📈'
      case 'declínio': return '📉'
      default: return '➡️'
    }
  }

  const getTendenciaColor = (tendencia) => {
    switch (tendencia) {
      case 'crescimento': return 'var(--color-success)'
      case 'declínio': return 'var(--color-error)'
      default: return 'var(--color-text-secondary)'
    }
  }

  // Tela de carregamento
  if (carregando) {
    return (
      <div className="comparativos-temporais">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <h3>Processando Comparativo</h3>
          <p>Analisando dados dos períodos selecionados...</p>
          <div className="loading-info">
            <p>📊 Filtrando dados do período A...</p>
            <p>📊 Filtrando dados do período B...</p>
            <p>🧮 Calculando métricas comparativas...</p>
          </div>
        </div>
      </div>
    )
  }

  // Tela de resultados do comparativo
  if (dadosComparativo && comparativo) {
    return (
      <div className="comparativos-temporais">
        <div className="comparativo-header">
          <h3>📊 Comparativo Temporal</h3>
          <span className="periodo-info">
            {dadosComparativo.nomePeriodoA} vs {dadosComparativo.nomePeriodoB}
          </span>
          <button 
            className="btn-nova-comparacao"
            onClick={() => {
              setDadosComparativo(null)
              setMostrarSeletores(false)
              setMesA('')
              setMesB('')
            }}
          >
            🔄 Nova Comparação
          </button>
        </div>
        
        <div className="comparativo-grid">
          <div className="comparativo-item">
            <div className="metric-label">📞 Quantidade de Chamadas</div>
            <div className="metric-periods">
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoA}</span>
                <span className="period-value">{formatarNumero(comparativo.quantidadeChamadas.atual)} chamadas</span>
              </div>
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoB}</span>
                <span className="period-value">{formatarNumero(comparativo.quantidadeChamadas.anterior)} chamadas</span>
              </div>
            </div>
             <div className="tendencia-status" style={{ color: getTendenciaStatus(comparativo.quantidadeChamadas.percentual, 'geral').cor }}>
               {getTendenciaStatus(comparativo.quantidadeChamadas.percentual, 'geral').icone} {getTendenciaStatus(comparativo.quantidadeChamadas.percentual, 'geral').status}
             </div>
          </div>

          <div className="comparativo-item">
            <div className="metric-label">⭐ Avaliação Atendimento</div>
            <div className="metric-periods">
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoA}</span>
                <span className="period-value">{comparativo.avaliacaoAtendimento.atual.toFixed(1)}/5</span>
              </div>
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoB}</span>
                <span className="period-value">{comparativo.avaliacaoAtendimento.anterior.toFixed(1)}/5</span>
              </div>
            </div>
             <div className="tendencia-status" style={{ color: getTendenciaStatus(comparativo.avaliacaoAtendimento.percentual, 'geral').cor }}>
               {getTendenciaStatus(comparativo.avaliacaoAtendimento.percentual, 'geral').icone} {getTendenciaStatus(comparativo.avaliacaoAtendimento.percentual, 'geral').status}
             </div>
          </div>

          <div className="comparativo-item">
            <div className="metric-label">⭐ Avaliação Solução</div>
            <div className="metric-periods">
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoA}</span>
                <span className="period-value">{comparativo.avaliacaoSolucao.atual.toFixed(1)}/5</span>
              </div>
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoB}</span>
                <span className="period-value">{comparativo.avaliacaoSolucao.anterior.toFixed(1)}/5</span>
              </div>
            </div>
             <div className="tendencia-status" style={{ color: getTendenciaStatus(comparativo.avaliacaoSolucao.percentual, 'geral').cor }}>
               {getTendenciaStatus(comparativo.avaliacaoSolucao.percentual, 'geral').icone} {getTendenciaStatus(comparativo.avaliacaoSolucao.percentual, 'geral').status}
             </div>
          </div>

          <div className="comparativo-item">
            <div className="metric-label">⏱️ TMA (Tempo Médio de Atendimento)</div>
            <div className="metric-periods">
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoA}</span>
                <span className="period-value">{formatarTempo(comparativo.tma.atual)}</span>
              </div>
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoB}</span>
                <span className="period-value">{formatarTempo(comparativo.tma.anterior)}</span>
              </div>
            </div>
             <div className="tendencia-status" style={{ color: getTendenciaStatus(comparativo.tma.percentual, 'tempo').cor }}>
               {getTendenciaStatus(comparativo.tma.percentual, 'tempo').icone} {getTendenciaStatus(comparativo.tma.percentual, 'tempo').status}
             </div>
          </div>

          <div className="comparativo-item">
            <div className="metric-label">⏳ TME (Tempo Médio de Espera)</div>
            <div className="metric-periods">
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoA}</span>
                <span className="period-value">{formatarTempo(comparativo.tme.atual)}</span>
              </div>
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoB}</span>
                <span className="period-value">{formatarTempo(comparativo.tme.anterior)}</span>
              </div>
            </div>
             <div className="tendencia-status" style={{ color: getTendenciaStatus(comparativo.tme.percentual, 'tempo').cor }}>
               {getTendenciaStatus(comparativo.tme.percentual, 'tempo').icone} {getTendenciaStatus(comparativo.tme.percentual, 'tempo').status}
             </div>
          </div>

          <div className="comparativo-item">
            <div className="metric-label">🎯 TMU (Tempo Médio na URA)</div>
            <div className="metric-periods">
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoA}</span>
                <span className="period-value">{formatarTempo(comparativo.tmu.atual)}</span>
              </div>
              <div className="period-data">
                <span className="period-name">{dadosComparativo.nomePeriodoB}</span>
                <span className="period-value">{formatarTempo(comparativo.tmu.anterior)}</span>
              </div>
            </div>
             <div className="tendencia-status" style={{ color: getTendenciaStatus(comparativo.tmu.percentual, 'tempo').cor }}>
               {getTendenciaStatus(comparativo.tmu.percentual, 'tempo').icone} {getTendenciaStatus(comparativo.tmu.percentual, 'tempo').status}
             </div>
          </div>
        </div>
      </div>
    )
  }

  // Card de seletores de período
  if (mostrarSeletores) {
    return (
      <div className="comparativos-temporais">
        <div className="comparativo-header">
          <h3>📊 Comparativo Temporal</h3>
          <span className="periodo-info">Selecione os meses para comparação</span>
        </div>
        
        <div className="seletores-container">
          <div className="debug-info">
            <p>📊 Meses disponíveis: {mesesDisponiveis.length}</p>
            {mesesDisponiveis.length > 0 && (
              <p>📅 Primeiro mês: {mesesDisponiveis[0]?.label}</p>
            )}
          </div>
          
          <div className="periodo-group">
            <h4>📅 Primeiro Mês</h4>
            <div className="mes-selector">
              <select 
                value={mesA} 
                onChange={(e) => setMesA(e.target.value)}
                className="mes-select"
              >
                <option value="">Selecione o primeiro mês</option>
                {mesesDisponiveis.map(mes => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="periodo-group">
            <h4>📅 Segundo Mês</h4>
            <div className="mes-selector">
              <select 
                value={mesB} 
                onChange={(e) => setMesB(e.target.value)}
                className="mes-select"
              >
                <option value="">Selecione o segundo mês</option>
                {mesesDisponiveis.map(mes => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="botoes-container">
            <button 
              className="btn-comparar"
              onClick={executarComparacao}
              disabled={!mesA || !mesB}
            >
              🔍 Comparar Meses
            </button>
            <button 
              className="btn-cancelar"
              onClick={() => {
                setMostrarSeletores(false)
                setMesA('')
                setMesB('')
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Botão inicial "Comparar Datas"
  return (
    <div className="comparativos-temporais">
      <div className="comparativo-header">
        <h3>📊 Comparativo Temporal</h3>
        <span className="periodo-info">Compare métricas entre diferentes períodos</span>
      </div>
      
      <div className="botao-inicial-container">
        <button 
          className="btn-comparar-datas"
          onClick={() => setMostrarSeletores(true)}
        >
          📊 Comparar Datas
        </button>
      </div>
    </div>
  )
})

ComparativosTemporais.displayName = 'ComparativosTemporais'

export default ComparativosTemporais
