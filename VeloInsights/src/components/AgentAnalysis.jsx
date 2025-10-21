import React, { useState, useEffect, useRef, useMemo } from 'react'
import Chart from 'chart.js/auto'
import { useTheme } from '../hooks/useTheme'
import { useAccessControl } from '../hooks/useAccessControl'
import PeriodSelectorV2 from './PeriodSelectorV2'
import TemporalComparison from './TemporalComparison'
import './AgentAnalysis.css'

// Componente para seleção de operador
const OperatorSelector = ({ operators, onSelectOperator, hideNames }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchInput, setShowSearchInput] = useState(false)

  // Função para formatar números com pontos como separadores de milhares
  const formatarNumero = (numero) => {
    if (!numero || numero === 0) return '0'
    
    const num = parseFloat(numero)
    if (isNaN(num)) return '0'
    
    return num.toLocaleString('pt-BR')
  }

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator)
    setIsExpanded(false)
    setShowSearchInput(false)
    setSearchTerm('')
    onSelectOperator(operator)
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setShowSearchInput(false)
      setSearchTerm('')
    }
  }

  const handleSearchToggle = (e) => {
    e.stopPropagation()
    setShowSearchInput(!showSearchInput)
    if (!showSearchInput) {
      setSearchTerm('')
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filtrar operadores baseado na busca
  const filteredOperators = operators.filter(operator => {
    if (!searchTerm) return true
    const operatorName = operator.operator.toLowerCase()
    return operatorName.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="operator-selector">
      <div className="selector-header">
        <h3>👤 Selecionar Operador</h3>
        <p>Escolha um operador para visualizar suas métricas detalhadas</p>
      </div>
      
      <div className="selector-container">
        <button 
          className="selector-button"
          onClick={handleToggleExpanded}
        >
          <span className="selector-text">
            {selectedOperator 
              ? (hideNames ? `Operador Selecionado` : selectedOperator.operator)
              : 'Clique para selecionar um operador'
            }
          </span>
          <span className="selector-icon">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>
        
        {isExpanded && (
          <div className="operators-list">
            {/* Barra de busca */}
            <div className="search-section">
              <div className="search-toggle">
                <button 
                  className="search-toggle-btn"
                  onClick={handleSearchToggle}
                >
                  🔍 Buscar por nome
                </button>
              </div>
              
              {showSearchInput && (
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Digite o nome do operador..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Lista de operadores */}
            <div className="operators-scroll">
              {filteredOperators.length > 0 ? (
                filteredOperators.map((operator, index) => (
                  <div 
                    key={operator.id || operator.operator || index}
                    className="operator-item"
                    onClick={() => handleOperatorSelect(operator)}
                  >
                    <div className="operator-info">
                      <div className="operator-rank">#{operators.indexOf(operator) + 1}</div>
                      <div className="operator-details">
                        <span className="operator-name">
                          {hideNames ? 'Operador' : operator.operator}
                        </span>
                        <div className="operator-stats">
                          <span className="stat">📞 {formatarNumero(operator.totalCalls || 0)} chamadas</span>
                          <span className="stat">⭐ Score: {formatarNumero(operator.score || 0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="select-indicator">✓</div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>Nenhum operador encontrado para "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const AgentAnalysis = ({ data, operatorMetrics, rankings }) => {
  const { theme } = useTheme()
  const { 
    canViewOperatorData, 
    canViewGeneralMetrics, 
    getVisibleOperators,
    getCurrentUserInfo 
  } = useAccessControl()
  
  const currentUser = getCurrentUserInfo()
  // Verificar se deve ocultar nomes baseado no cargo PRINCIPAL do usuário, não no cargo selecionado
  // SUPERADMIN/GESTOR/ANALISTA sempre veem métricas gerais, mesmo quando assumem cargo de OPERADOR
  const shouldHideNames = currentUser?.cargoConfig?.level === 1 // Operador
  
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentData, setAgentData] = useState(null)
  const [agentPauses, setAgentPauses] = useState([])
  const [expandedMonths, setExpandedMonths] = useState({})
  const [monthlyData, setMonthlyData] = useState({})
  const [monthlyScores, setMonthlyScores] = useState({})
  const [showPeriodSelector, setShowPeriodSelector] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState({
    startDate: '',
    endDate: ''
  })
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  
  // Estados para o card de suporte
  const [showSupportCard, setShowSupportCard] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')

  // Debug adicional para rastrear mudanças de estado - MOVIDO PARA O TOPO
  useEffect(() => {
    console.log('🔄 AgentAnalysis re-render - selectedAgent mudou:', selectedAgent?.operator)
  }, [selectedAgent])
  
  useEffect(() => {
    console.log('🔄 AgentAnalysis re-render - agentData mudou:', agentData?.length)
  }, [agentData])
  
  useEffect(() => {
    console.log('🔄 AgentAnalysis re-render - showPeriodSelector mudou:', showPeriodSelector)
  }, [showPeriodSelector])

  // Atualizar estados quando dados mensais mudarem
  useEffect(() => {
    if (monthlyDataWithScores.length > 0) {
      setMonthlyData(monthlyDataWithScores)
      setMonthlyScores(monthlyDataWithScores.reduce((acc, mes) => {
        acc[mes.mes] = mes.pontuacao
        return acc
      }, {}))
    }
  }, [monthlyDataWithScores])

  // Criar gráfico quando dados mensais mudarem
  useEffect(() => {
    if (monthlyData && monthlyData.length > 0 && chartRef.current) {
      const dadosGrafico = prepararDadosGrafico(monthlyData)
      criarGraficoEvolucao(dadosGrafico)
    }
  }, [monthlyData, selectedAgent])

  // Listener para mudanças de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (monthlyData && monthlyData.length > 0) {
        const dadosGrafico = prepararDadosGrafico(monthlyData)
        criarGraficoEvolucao(dadosGrafico)
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [monthlyData])

  // Função para enviar email de suporte
  const sendSupportEmail = () => {
    if (!supportMessage.trim()) return
    
    // Criar email direto
    const emailBody = encodeURIComponent(
      `Olá Gabriel,\n\n` +
      `Estou enfrentando problemas para visualizar dados no período selecionado.\n\n` +
      `Período: ${selectedPeriod.startDate || 'N/A'} a ${selectedPeriod.endDate || 'N/A'}\n\n` +
      `Solicitação:\n${supportMessage}\n\n` +
      `Obrigado!`
    )
    const emailSubject = encodeURIComponent("Solicitação de Suporte - VeloInsights")
    
    // Abrir cliente de email
    window.open(`mailto:gabriel.araujo@velotax.com.br?subject=${emailSubject}&body=${emailBody}`)
    
    // Fechar card e limpar mensagem
    setShowSupportCard(false)
    setSupportMessage('')
    
    // Mostrar mensagem de sucesso
    alert('Email aberto! Complete o envio no seu cliente de email.')
  }

  // Debug inicial - verificar se há dados
  // console.log('🔍 AgentAnalysis - Dados recebidos:', data ? data.length : 'null')
  // console.log('🔍 AgentAnalysis - OperatorMetrics:', operatorMetrics ? Object.keys(operatorMetrics).length : 'null')
  // console.log('🔍 AgentAnalysis - OperatorMetrics keys:', operatorMetrics ? Object.keys(operatorMetrics).slice(0, 3) : 'null')
  
  if (!data || data.length === 0) {
    return (
      <div className="agent-analysis">
        <div className="no-data-container">
          <div className="no-data-icon">🔍</div>
          <h2>Nenhum dado encontrado</h2>
          <p>Infelizmente não pude localizar dados neste período, que tal selecionar outro período?</p>
          
          <div className="support-section">
            <button 
              className="support-button"
              onClick={() => setShowSupportCard(true)}
            >
              📧 Contatar suporte para análise
            </button>
          </div>
          
          <div className="suggested-periods">
            <button onClick={() => window.location.reload()}>🔄 Recarregar dados</button>
            <button onClick={() => setShowPeriodSelector(true)}>📅 Selecionar período</button>
          </div>
        </div>

        {/* Card de Suporte */}
        {showSupportCard && (
          <div className="support-card-overlay" onClick={() => setShowSupportCard(false)}>
            <div className="support-card" onClick={(e) => e.stopPropagation()}>
              <div className="support-card-header">
                <h4>📧 Contatar Suporte</h4>
                <button 
                  className="close-support-card"
                  onClick={() => setShowSupportCard(false)}
                >
                  ❌
                </button>
              </div>
              
              <div className="support-form">
                <div className="message-field">
                  <label>Descreva sua solicitação:</label>
                  <textarea 
                    placeholder="Ex: Não consigo visualizar dados do período selecionado..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="support-actions">
                  <button 
                    onClick={sendSupportEmail}
                    disabled={!supportMessage.trim()}
                    className="send-button"
                  >
                    📧 Enviar
                  </button>
                  <button 
                    onClick={() => setShowSupportCard(false)}
                    className="cancel-button"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Filtrar operadores válidos baseado no controle de acesso - memoizado
  const validOperators = useMemo(() => {
    if (!operatorMetrics) return []
    
    // Converter operatorMetrics (objeto) para array
    const operatorsArray = Object.values(operatorMetrics)
    if (operatorsArray.length === 0) return []
    
    // Lista de operadores inválidos para filtrar
    const invalidOperators = [
      'sem operador',
      'desligados',
      'excluidos',
      'excluídos',
      'agentes indisponiveis',
      'agentes indisponíveis',
      'indisponivel',
      'indisponível',
      'desligado',
      'excluido',
      'excluído',
      'rejeitaram',
      'rejeitaram',
      'rejeitado',
      'rejeitados',
      'sem nome',
      'n/a',
      'na',
      ''
    ]
    
    // Filtrar operadores inválidos primeiro
    const validNamesFiltered = operatorsArray.filter(operator => {
      if (!operator.operator) return false
      
      const operatorName = operator.operator.toLowerCase().trim()
      return !invalidOperators.includes(operatorName)
    })
    
    // Depois filtrar baseado no controle de acesso
    const accessFiltered = getVisibleOperators(validNamesFiltered)
    
    // Ordenar por score (maior para menor) - melhor atendente primeiro
    return accessFiltered.sort((a, b) => {
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      return scoreB - scoreA // Ordem decrescente (maior score primeiro)
    })
  }, [operatorMetrics, getVisibleOperators])

  // Função para visualizar dados do agente
  const handleViewAgent = (agent) => {
    setSelectedAgent(agent)
    setShowPeriodSelector(true)
    setAgentData(null) // Limpar dados anteriores
    setAgentPauses([])
    setMonthlyData({})
    setMonthlyScores({})
  }

  // Função para carregar dados detalhados do agente com período específico
  const loadAgentDetails = async (startDateOverride = null, endDateOverride = null) => {
    const startDate = startDateOverride || selectedPeriod.startDate
    const endDate = endDateOverride || selectedPeriod.endDate
    
    console.log('🔍 loadAgentDetails chamada:', { selectedAgent: selectedAgent?.operator, startDate, endDate })
    
    if (!selectedAgent || !startDate || !endDate) {
      console.log('❌ Parâmetros inválidos para loadAgentDetails')
      return
    }

    setIsLoadingDetails(true)
    
    try {
      // Filtrar dados específicos do agente no período selecionado
      const agentSpecificData = data.filter(record => {
        if (!record.operador || !record.data) return false
        
        // Verificar se é o agente correto
        const isCorrectAgent = record.operador.toLowerCase() === selectedAgent.operator.toLowerCase()
        
        // Verificar se está no período selecionado
        const recordDate = new Date(record.data.split('/').reverse().join('-')) // DD/MM/YYYY -> YYYY-MM-DD
        const startDateObj = new Date(startDate)
        const endDateObj = new Date(endDate)
        
        return isCorrectAgent && recordDate >= startDateObj && recordDate <= endDateObj
      })
      
      console.log('📊 Dados encontrados para', selectedAgent.operator, ':', agentSpecificData.length, 'registros')
      
      console.log('🔄 Definindo agentData para:', agentSpecificData.length, 'registros')
      setAgentData(agentSpecificData)
      console.log('✅ agentData definido')
      
      // Processar dados de atividades (coluna J e O)
      const timeData = agentSpecificData.filter(record => 
        (record.atividade || record.tipoAtividade) &&
        (record.tempoTotal && record.tempoTotal !== '00:00:00')
      )
      
      setAgentPauses(timeData)
      
      // Só fechar o seletor de período se houver dados
      if (agentSpecificData.length > 0) {
        console.log('✅ Fechando seletor de período - dados encontrados')
        setShowPeriodSelector(false)
      } else {
        console.log('❌ Mantendo seletor de período - nenhum dado encontrado')
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do agente:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Função para voltar à lista
  const handleBackToList = () => {
    setSelectedAgent(null)
    setAgentData(null)
    setAgentPauses([])
    setExpandedMonths({})
    setShowPeriodSelector(false)
    setSelectedPeriod({ startDate: '', endDate: '' })
    setIsLoadingDetails(false)
  }

  // Função para expandir/colapsar mês
  const toggleMonth = (mes) => {
    setExpandedMonths(prev => ({
      ...prev,
      [mes]: !prev[mes]
    }))
  }

  // Calcular pontuação mensal consolidada
  const calcularPontuacaoMensal = (dadosMes) => {
    const weights = {
      totalCalls: 0.25,        // 25% - Volume de atendimentos
      ratingAttendance: 0.30,  // 30% - Qualidade do atendimento
      ratingSolution: 0.25,    // 25% - Eficácia da solução
      avgDuration: 0.20        // 20% - Eficiência (menor é melhor)
    }

    // Normalizar valores (0-100)
    const normalizedCalls = Math.min((dadosMes.chamadas / 50) * 100, 100) // Máximo 50 chamadas = 100 pontos
    const normalizedAttendance = (parseFloat(dadosMes.notaMediaAtendimento) / 5) * 100
    const normalizedSolution = (parseFloat(dadosMes.notaMediaSolucao) / 5) * 100
    const normalizedDuration = Math.max(0, 100 - (parseFloat(dadosMes.tempoFaladoTotal) / 10) * 100) // Menor tempo = mais pontos

    const score = 
      normalizedCalls * weights.totalCalls +
      normalizedAttendance * weights.ratingAttendance +
      normalizedSolution * weights.ratingSolution +
      normalizedDuration * weights.avgDuration

    return Math.round(score * 10) / 10 // Arredondar para 1 casa decimal
  }

  // Preparar dados para gráfico de evolução
  const prepararDadosGrafico = (dadosMensais) => {
    const labels = dadosMensais.map(d => d.mes)
    const datasets = [
      {
        label: 'Pontuação Mensal',
        data: dadosMensais.map(d => calcularPontuacaoMensal(d)),
        borderColor: '#1634FF',
        backgroundColor: 'rgba(22, 52, 255, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Chamadas',
        data: dadosMensais.map(d => d.chamadas),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Nota Atendimento',
        data: dadosMensais.map(d => parseFloat(d.notaMediaAtendimento)),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        yAxisID: 'y2'
      }
    ]

    return { labels, datasets }
  }

  // Criar gráfico de evolução
  const criarGraficoEvolucao = (dadosGrafico) => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const colors = getChartColors()

    const config = {
      type: 'line',
      data: dadosGrafico,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Evolução Mensal - ${selectedAgent}`,
            color: colors.text,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            labels: { color: colors.text }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.ticks },
            grid: { color: colors.grid }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: colors.ticks },
            grid: { color: colors.grid },
            title: {
              display: true,
              text: 'Pontuação (0-100)',
              color: colors.text
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: colors.ticks },
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: 'Chamadas',
              color: colors.text
            }
          },
          y2: {
            type: 'linear',
            display: false
          }
        }
      }
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, config)
    }
  }

  // Função para obter cores dos gráficos baseadas no tema
  const getChartColors = () => {
    const isDarkTheme = document.body.classList.contains('theme-dark')
    
    if (!isDarkTheme) {
      return {
        text: '#000000',
        textSecondary: '#333333',
        grid: '#E5E7EB',
        ticks: '#666666'
      }
    } else {
      return {
        text: '#FFFFFF',
        textSecondary: '#FFFFFF',
        grid: '#404040',
        ticks: '#FFFFFF'
      }
    }
  }

  // Calcular métricas individuais do agente
  // Função para formatar minutos em HH:MM:SS
  const formatarTempo = (minutos) => {
    if (!minutos || minutos === 0) return '00:00:00'
    
    const horas = Math.floor(minutos / 60)
    const mins = Math.floor(minutos % 60)
    const segs = Math.floor((minutos % 1) * 60)
    
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  // Função para formatar números com pontos como separadores de milhares
  const formatarNumero = (numero) => {
    if (!numero || numero === 0) return '0'
    
    const num = parseFloat(numero)
    if (isNaN(num)) return '0'
    
    return num.toLocaleString('pt-BR')
  }

  // Função para formatar qualquer tempo (minutos ou string) em HH:MM:SS
  const formatarQualquerTempo = (tempo) => {
    if (!tempo || tempo === 0 || tempo === '00:00:00' || tempo === '') return '00:00:00'
    
    // Se já é uma string no formato HH:MM:SS, retorna como está
    if (typeof tempo === 'string' && tempo.includes(':')) {
      return tempo
    }
    
    // Se é um número (minutos), converte para HH:MM:SS
    const minutos = parseFloat(tempo)
    if (!isNaN(minutos)) {
      return formatarTempo(minutos)
    }
    
    return '00:00:00'
  }

  const calculateAgentMetrics = (agentData) => {
    if (!agentData || agentData.length === 0) {
      // console.log('🔍 Debug - Nenhum dado do agente para calcular métricas')
      return null
    }

    // console.log('🔍 Debug - Calculando métricas para:', agentData.length, 'registros')
    // console.log('🔍 Debug - Primeiro registro:', agentData[0])

    const totalCalls = agentData.length
    const attendedCalls = agentData.filter(record => 
      record.chamada && record.chamada.toLowerCase().includes('atendida')
    ).length
    
    // console.log('🔍 Debug - Chamadas atendidas:', attendedCalls, 'de', totalCalls)
    
    // Converter tempo para minutos corretamente
    const tempoParaMinutos = (tempo) => {
      if (!tempo || tempo === '00:00:00' || tempo === '' || tempo === null || tempo === undefined) return 0
      if (typeof tempo === 'number') return tempo
      
      try {
        // Converter para string e limpar
        const tempoStr = String(tempo).trim()
        
        // Se já é um número em minutos (sem :)
        if (!isNaN(parseFloat(tempoStr)) && !tempoStr.includes(':')) {
          return parseFloat(tempoStr)
        }
        
        // Se é formato HH:MM:SS ou MM:SS
        if (tempoStr.includes(':')) {
          const parts = tempoStr.split(':')
          if (parts.length === 3) {
            // HH:MM:SS
            const [horas, minutos, segundos] = parts.map(Number)
            if (isNaN(horas) || isNaN(minutos) || isNaN(segundos)) return 0
            return horas * 60 + minutos + segundos / 60
          } else if (parts.length === 2) {
            // MM:SS
            const [minutos, segundos] = parts.map(Number)
            if (isNaN(minutos) || isNaN(segundos)) return 0
            return minutos + segundos / 60
          }
        }
        
        return 0
      } catch (error) {
        console.warn('Erro ao converter tempo:', tempo, error)
        return 0
      }
    }
    
    // Debug dos tempos - verificar todos os campos disponíveis
    // console.log('🔍 Debug - Primeiros registros completos:', agentData.slice(0, 3))
    // console.log('🔍 Debug - Campos disponíveis:', Object.keys(agentData[0] || {}))
    
    // Debug específico dos tempos falado
    // const temposFaladoDebug = agentData.slice(0, 5).map(r => ({
    //   tempoFalado: r.tempoFalado,
    //   tempoTotal: r.tempoTotal,
    //   tempoURA: r.tempoURA,
    //   tempoEspera: r.tempoEspera,
    //   tempoConvertido: tempoParaMinutos(r.tempoFalado)
    // }))
    // console.log('🔍 Debug - Tempos falado convertidos:', temposFaladoDebug)
    
    const durations = agentData.map(record => tempoParaMinutos(record.tempoFalado)).filter(duration => duration > 0)
    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0
    
    // console.log('🔍 Debug - Durações válidas:', durations.length, 'de', agentData.length)

    const ratings = agentData.filter(record => 
      record.notaAtendimento && !isNaN(parseFloat(record.notaAtendimento))
    )
    
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, record) => sum + parseFloat(record.notaAtendimento), 0) / ratings.length
      : 0

    const solutionRatings = agentData.filter(record => 
      record.notaSolucao && !isNaN(parseFloat(record.notaSolucao))
    )
    
    const avgSolutionRating = solutionRatings.length > 0 
      ? solutionRatings.reduce((sum, record) => sum + parseFloat(record.notaSolucao), 0) / solutionRatings.length
      : 0

    // Debug específico dos campos de atividade
    // console.log('🔍 Debug - Campos de atividade disponíveis:', agentData.slice(0, 3).map(r => ({
    //   atividade: r.atividade,
    //   tipoAtividade: r.tipoAtividade,
    //   tempoTotal: r.tempoTotal,
    //   chamada: r.chamada
    // })))
    
    // Calcular tempo logado e pausado baseado nos dados reais da planilha
    const calcularTemposLogadoPausado = (records) => {
      let tempoTotalLogado = 0
      let tempoTotalPausado = 0
      let registrosLogado = 0
      let registrosPausado = 0

      // Para tempo logado, vamos deixar de lado por enquanto
      // (você mencionou que não sabe um cálculo que faria sentido)
      tempoTotalLogado = 0
      registrosLogado = 0

      // Para tempo pausado, também vamos deixar de lado por enquanto
      // até implementarmos a busca na aba "Pausas"
      tempoTotalPausado = 0
      registrosPausado = 0

      return {
        tempoTotalLogado,
        tempoTotalPausado,
        registrosLogado,
        registrosPausado
      }
    }

    // Calcular dados mensais do agente
    const calcularDadosMensais = (records) => {
      const dadosPorMes = {}
      
      records.forEach(record => {
        if (record.data) {
          // Extrair mês/ano da data (formato DD/MM/YYYY)
          const [dia, mes, ano] = record.data.split('/')
          const chaveMes = `${mes}/${ano}`
          
          if (!dadosPorMes[chaveMes]) {
            dadosPorMes[chaveMes] = {
              mes: chaveMes,
              chamadas: 0,
              tempoFalado: 0,
              tempoEspera: 0,
              notasAtendimento: [],
              notasSolucao: []
            }
          }
          
          dadosPorMes[chaveMes].chamadas++
          dadosPorMes[chaveMes].tempoFalado += tempoParaMinutos(record.tempoFalado)
          dadosPorMes[chaveMes].tempoEspera += tempoParaMinutos(record.tempoEspera)
          
          if (record.notaAtendimento && !isNaN(parseFloat(record.notaAtendimento))) {
            dadosPorMes[chaveMes].notasAtendimento.push(parseFloat(record.notaAtendimento))
          }
          
          if (record.notaSolucao && !isNaN(parseFloat(record.notaSolucao))) {
            dadosPorMes[chaveMes].notasSolucao.push(parseFloat(record.notaSolucao))
          }
        }
      })
      
      // Calcular médias mensais
      Object.values(dadosPorMes).forEach(mes => {
        mes.tempoFaladoTotal = mes.tempoFalado.toFixed(1)
        mes.tempoEsperaTotal = mes.tempoEspera.toFixed(1)
        mes.notaMediaAtendimento = mes.notasAtendimento.length > 0 
          ? (mes.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / mes.notasAtendimento.length).toFixed(1)
          : '0.0'
        mes.notaMediaSolucao = mes.notasSolucao.length > 0 
          ? (mes.notasSolucao.reduce((sum, nota) => sum + nota, 0) / mes.notasSolucao.length).toFixed(1)
          : '0.0'
      })
      
      return Object.values(dadosPorMes).sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/')
        const [mesB, anoB] = b.mes.split('/')
        return parseInt(anoA) - parseInt(anoB) || parseInt(mesA) - parseInt(mesB)
      })
    }


    const temposCalculados = calcularTemposLogadoPausado(agentData)
    const dadosMensais = calcularDadosMensais(agentData)

    // console.log('🔍 Debug - Tempos calculados:', {
    //   avgDuration: avgDuration.toFixed(1),
    //   tempoTotalLogado: temposCalculados.tempoTotalLogado.toFixed(1),
    //   tempoTotalPausado: temposCalculados.tempoTotalPausado.toFixed(1),
    //   registrosLogado: temposCalculados.registrosLogado,
    //   registrosPausado: temposCalculados.registrosPausado,
    //   dadosMensais: dadosMensais.length
    // })

    return {
      totalCalls,
      attendedCalls,
      avgDuration: avgDuration.toFixed(1),
      avgRating: avgRating.toFixed(1),
      avgSolutionRating: avgSolutionRating.toFixed(1),
      tempoTotalLogado: temposCalculados.tempoTotalLogado.toFixed(1),
      tempoTotalPausado: temposCalculados.tempoTotalPausado.toFixed(1),
      dadosMensais
    }
  }

  const agentMetrics = useMemo(() => {
    return selectedAgent && agentData ? calculateAgentMetrics(agentData) : null
  }, [selectedAgent, agentData])

  // Calcular dados mensais com pontuações usando useMemo
  const monthlyDataWithScores = useMemo(() => {
    if (agentMetrics && agentMetrics.dadosMensais) {
      return agentMetrics.dadosMensais.map(dadosMes => ({
        ...dadosMes,
        pontuacao: calcularPontuacaoMensal(dadosMes)
      }))
    }
    return []
  }, [agentMetrics])

  // Seletor de período
  // Função para lidar com seleção de período do PeriodSelectorV2
  const handlePeriodSelect = (periodData) => {
    console.log('📅 handlePeriodSelect chamada com:', periodData)
    console.log('📅 Período selecionado:', periodData)
    console.log('📅 Operador selecionado:', selectedAgent?.operator)
    
    // Atualizar o estado com o período selecionado
    setSelectedPeriod({
      startDate: periodData.startDate,
      endDate: periodData.endDate
    })
    
    // Carregar dados automaticamente com as novas datas
    console.log('📅 Chamando loadAgentDetails com:', periodData.startDate, periodData.endDate)
    loadAgentDetails(periodData.startDate, periodData.endDate)
  }

  // Verificar se há operador selecionado mas sem dados para o período
  if (selectedAgent && (!agentData || agentData.length === 0)) {
    console.log('🔍 Mostrando mensagem de nenhum dado encontrado para:', selectedAgent.operator)
    console.log('🔍 DEBUG Estados:', {
      selectedAgent: selectedAgent?.operator,
      agentData: agentData?.length,
      showPeriodSelector,
      isLoadingDetails
    })
    
    return (
      <div className="agent-analysis">
        <div className="no-data-container">
          <div className="no-data-icon">🔍</div>
          <h2>Nenhum dado encontrado</h2>
          <p>Infelizmente não pude localizar dados para <strong>{selectedAgent.operator}</strong> neste período, que tal selecionar outro período?</p>
          
          <div className="support-section">
            <button 
              className="support-button"
              onClick={() => setShowSupportCard(true)}
            >
              📧 Contatar suporte para análise
            </button>
          </div>
          
          <div className="suggested-periods">
            <button onClick={() => setShowPeriodSelector(true)}>📅 Selecionar outro período</button>
            <button onClick={handleBackToList}>👥 Voltar à lista de operadores</button>
          </div>
        </div>

        {/* Card de Suporte */}
        {showSupportCard && (
          <div className="support-card-overlay" onClick={() => setShowSupportCard(false)}>
            <div className="support-card" onClick={(e) => e.stopPropagation()}>
              <div className="support-card-header">
                <h4>📧 Contatar Suporte</h4>
                <button 
                  className="close-support-card"
                  onClick={() => setShowSupportCard(false)}
                >
                  ❌
                </button>
              </div>
              <div className="support-form">
                <div className="message-field">
                  <label>Descreva sua solicitação:</label>
                  <textarea 
                    placeholder="Ex: Não consigo visualizar dados do operador Juliana no período selecionado..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="support-actions">
                  <button 
                    onClick={sendSupportEmail}
                    disabled={!supportMessage.trim()}
                    className="send-button"
                  >
                    📧 Enviar
                  </button>
                  <button 
                    onClick={() => setShowSupportCard(false)}
                    className="cancel-button"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (selectedAgent && showPeriodSelector) {
    return (
      <div className="agent-analysis">
        <div className="agent-header">
          <button 
            className="back-button"
            onClick={handleBackToList}
          >
            ← Voltar à Lista
          </button>
          <h2>👤 {selectedAgent.operator}</h2>
          <p>Selecione o período para análise detalhada</p>
        </div>

        <PeriodSelectorV2 
          onPeriodSelect={handlePeriodSelect}
          isLoading={isLoadingDetails}
        />
      </div>
    )
  }

  if (selectedAgent && agentMetrics) {
    return (
      <div className="agent-analysis">
        <div className="agent-header">
          <button 
            className="back-button"
            onClick={handleBackToList}
          >
            ← Voltar à Lista
          </button>
          <h2>👤 {selectedAgent.operator}</h2>
          <p>Análise individual de performance</p>
        </div>

        <div className="agent-metrics-horizontal">
          {/* Métricas Principais */}
          <div className="metric-card">
            <div className="metric-icon">📞</div>
            <div className="metric-content">
              <h3>Total de Chamadas</h3>
              <div className="metric-value">{formatarNumero(agentMetrics.totalCalls)}</div>
              <p>Chamadas processadas</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <h3>Duração Média</h3>
              <div className="metric-value">{formatarQualquerTempo(agentMetrics.avgDuration)}</div>
              <p>Tempo médio por atendimento</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⭐</div>
            <div className="metric-content">
              <h3>Nota Atendimento</h3>
              <div className="metric-value">{agentMetrics.avgRating}</div>
              <p>Avaliação média do atendimento</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h3>Nota Solução</h3>
              <div className="metric-value">{agentMetrics.avgSolutionRating}</div>
              <p>Avaliação média da solução</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🕐</div>
            <div className="metric-content">
              <h3>Tempo Total Logado</h3>
              <div className="metric-value">{formatarTempo(agentMetrics.tempoTotalLogado)}</div>
              <p>Tempo total trabalhando</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏸️</div>
            <div className="metric-content">
              <h3>Tempo Total Pausado</h3>
              <div className="metric-value">{formatarTempo(agentMetrics.tempoTotalPausado)}</div>
              <p>Tempo total em pausa</p>
            </div>
          </div>
        </div>

        {/* Performance ao Longo do Tempo */}
        {monthlyData && monthlyData.length > 0 && (
          <div className="performance-timeline-section">
            <h3>📈 Performance ao Longo do Tempo</h3>
            
            {/* Resumo de Tendências */}
            <div className="trends-summary">
              <div className="trend-card">
                <div className="trend-icon">📊</div>
                <div className="trend-content">
                  <h4>Tendência Geral</h4>
                  <div className="trend-value">
                    {(() => {
                      if (monthlyData.length < 2) return 'Dados insuficientes'
                      const primeiroMes = monthlyData[0].pontuacao
                      const ultimoMes = monthlyData[monthlyData.length - 1].pontuacao
                      const variacao = ultimoMes - primeiroMes
                      const variacaoPercentual = ((variacao / primeiroMes) * 100).toFixed(1)
                      
                      if (variacao > 0) {
                        return `📈 Melhoria de ${variacaoPercentual}%`
                      } else if (variacao < 0) {
                        return `📉 Queda de ${Math.abs(variacaoPercentual)}%`
                      } else {
                        return `➡️ Estável`
                      }
                    })()}
                  </div>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-icon">🎯</div>
                <div className="trend-content">
                  <h4>Melhor Mês</h4>
                  <div className="trend-value">
                    {(() => {
                      const melhorMes = monthlyData.reduce((max, mes) => 
                        mes.pontuacao > max.pontuacao ? mes : max
                      )
                      return `${melhorMes.mes} (${formatarNumero(melhorMes.pontuacao)})`
                    })()}
                  </div>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-icon">📉</div>
                <div className="trend-content">
                  <h4>Mês com Desafios</h4>
                  <div className="trend-value">
                    {(() => {
                      const piorMes = monthlyData.reduce((min, mes) => 
                        mes.pontuacao < min.pontuacao ? mes : min
                      )
                      return `${piorMes.mes} (${formatarNumero(piorMes.pontuacao)})`
                    })()}
                  </div>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-icon">📈</div>
                <div className="trend-content">
                  <h4>Consistência</h4>
                  <div className="trend-value">
                    {(() => {
                      const pontuacoes = monthlyData.map(mes => mes.pontuacao)
                      const media = pontuacoes.reduce((sum, p) => sum + p, 0) / pontuacoes.length
                      const desvioPadrao = Math.sqrt(
                        pontuacoes.reduce((sum, p) => sum + Math.pow(p - media, 2), 0) / pontuacoes.length
                      )
                      const coeficienteVariacao = (desvioPadrao / media) * 100
                      
                      if (coeficienteVariacao < 10) return '🎯 Muito Consistente'
                      if (coeficienteVariacao < 20) return '✅ Consistente'
                      if (coeficienteVariacao < 30) return '⚠️ Variável'
                      return '📊 Muito Variável'
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Análise Detalhada por Período */}
            <div className="detailed-analysis">
              <h4>📊 Análise Detalhada</h4>
              <div className="analysis-grid">
                {monthlyData.map((mes, index) => {
                  const mesAnterior = index > 0 ? monthlyData[index - 1] : null
                  const variacao = mesAnterior ? mes.pontuacao - mesAnterior.pontuacao : 0
                  const variacaoPercentual = mesAnterior ? ((variacao / mesAnterior.pontuacao) * 100) : 0
                  
                  // Calcular tendência de 3 meses
                  const tendencia3Meses = index >= 2 ? (() => {
                    const ultimos3Meses = monthlyData.slice(index - 2, index + 1)
                    const primeiraPontuacao = ultimos3Meses[0].pontuacao
                    const ultimaPontuacao = ultimos3Meses[2].pontuacao
                    const variacao3Meses = ultimaPontuacao - primeiraPontuacao
                    return variacao3Meses > 0 ? '📈' : variacao3Meses < 0 ? '📉' : '➡️'
                  })() : 'N/A'

                  return (
                    <div key={mes.mes} className="analysis-card">
                      <div className="analysis-header">
                        <h5>{mes.mes}</h5>
                        <div className="analysis-badges">
                          {mesAnterior && (
                            <span className={`badge ${variacao >= 0 ? 'positive' : 'negative'}`}>
                              {variacao >= 0 ? '📈' : '📉'} {Math.abs(variacaoPercentual).toFixed(1)}%
                            </span>
                          )}
                          <span className="badge trend">
                            {tendencia3Meses} 3M
                          </span>
                        </div>
                      </div>
                      
                      <div className="analysis-metrics">
                        <div className="metric-row">
                          <span className="metric-label">Pontuação:</span>
                          <span className="metric-value">{formatarNumero(mes.pontuacao)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Chamadas:</span>
                          <span className="metric-value">{formatarNumero(mes.chamadas)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Atendimento:</span>
                          <span className="metric-value">{mes.notaMediaAtendimento}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Solução:</span>
                          <span className="metric-value">{mes.notaMediaSolucao}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Tempo Falado:</span>
                          <span className="metric-value">{formatarQualquerTempo(mes.tempoFaladoTotal)}</span>
                        </div>
                      </div>

                      {/* Insights automáticos */}
                      <div className="insights">
                        {(() => {
                          const insights = []
                          
                          // Insight sobre pontuação
                          if (mes.pontuacao >= 80) {
                            insights.push('🎯 Excelente performance!')
                          } else if (mes.pontuacao >= 60) {
                            insights.push('✅ Boa performance')
                          } else if (mes.pontuacao >= 40) {
                            insights.push('⚠️ Performance regular')
                          } else {
                            insights.push('📉 Performance abaixo do esperado')
                          }

                          // Insight sobre chamadas
                          if (mes.chamadas >= 50) {
                            insights.push('📞 Alto volume de atendimentos')
                          } else if (mes.chamadas >= 20) {
                            insights.push('📞 Volume moderado')
                          } else {
                            insights.push('📞 Volume baixo')
                          }

                          // Insight sobre notas
                          if (parseFloat(mes.notaMediaAtendimento) >= 4.5) {
                            insights.push('⭐ Atendimento muito bem avaliado')
                          } else if (parseFloat(mes.notaMediaAtendimento) >= 3.5) {
                            insights.push('⭐ Atendimento bem avaliado')
                          } else {
                            insights.push('⭐ Atendimento precisa melhorar')
                          }

                          return insights.map((insight, idx) => (
                            <div key={idx} className="insight-item">{insight}</div>
                          ))
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pontuação Consolidada */}
        {monthlyData && monthlyData.length > 0 && (
          <div className="score-section">
            <h3>🏆 Pontuação Consolidada</h3>
            <div className="score-cards">
              {monthlyData.map((mes, index) => {
                const mesAnterior = index > 0 ? monthlyData[index - 1] : null
                const variacao = mesAnterior ? mes.pontuacao - mesAnterior.pontuacao : 0
                const variacaoPercentual = mesAnterior ? ((variacao / mesAnterior.pontuacao) * 100) : 0
                
                return (
                  <div key={mes.mes} className="score-card">
                    <div className="score-header">
                      <h4>{mes.mes}</h4>
                      {mesAnterior && (
                        <div className={`score-variation ${variacao >= 0 ? 'positive' : 'negative'}`}>
                          {variacao >= 0 ? '📈' : '📉'} {Math.abs(variacaoPercentual).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <div className="score-value">{formatarNumero(mes.pontuacao)}</div>
                    <div className="score-details">
                      <div className="score-detail">
                        <span>Chamadas:</span>
                        <span>{formatarNumero(mes.chamadas)}</span>
                      </div>
                      <div className="score-detail">
                        <span>Atendimento:</span>
                        <span>{mes.notaMediaAtendimento}</span>
                      </div>
                      <div className="score-detail">
                        <span>Solução:</span>
                        <span>{mes.notaMediaSolucao}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Resumo Mensal de Tempos */}
        {agentMetrics.dadosMensais && agentMetrics.dadosMensais.length > 0 && (
          <div className="monthly-summary">
            <h3>📊 Resumo Mensal de Tempos</h3>
            <div className="summary-grid">
              {agentMetrics.dadosMensais.map((mes, index) => (
                <div key={index} className="summary-card">
                  <div 
                    className="summary-header clickable"
                    onClick={() => toggleMonth(mes.mes)}
                  >
                    <h4>📅 {mes.mes}</h4>
                    <span className="expand-icon">
                      {expandedMonths[mes.mes] ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  {expandedMonths[mes.mes] && (
                    <div className="summary-metrics">
                      <div className="summary-metric">
                        <span className="metric-label">📞 Chamadas:</span>
                        <span className="metric-value">{formatarNumero(mes.chamadas)}</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-label">🗣️ Tempo Falado:</span>
                        <span className="metric-value">{formatarQualquerTempo(mes.tempoFaladoTotal)}</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-label">⏳ Tempo Espera:</span>
                        <span className="metric-value">{formatarQualquerTempo(mes.tempoEsperaTotal)}</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-label">⭐ Nota Atendimento:</span>
                        <span className="metric-value">{mes.notaMediaAtendimento}</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-label">🎯 Nota Solução:</span>
                        <span className="metric-value">{mes.notaMediaSolucao}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Gráfico de Performance ao Longo do Tempo */}
        <div className="performance-chart">
          <h3>📈 Performance ao Longo do Tempo</h3>
          <div className="chart-placeholder">
            <p>Gráfico de evolução das métricas será implementado aqui</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-analysis">
      {/* Mensagem informativa sobre permissões */}
      {currentUser && currentUser.level === 1 && (
        <div className="access-info">
          <div className="info-card">
            <h3>👤 Modo Operador</h3>
            <p>Você está visualizando apenas seus próprios dados. Para ver dados de outros operadores, entre em contato com seu gestor.</p>
          </div>
        </div>
      )}

      {/* Dashboard Geral */}
      <div className="general-dashboard">
        <h2>📊 Dashboard Geral de Agentes</h2>
        <div className="general-metrics">
          <div className="metric-card">
            <h3>👥 Total de Agentes</h3>
            <div className="metric-value">{validOperators.length}</div>
            <p>Agentes ativos na base</p>
          </div>
          
          <div className="metric-card">
            <h3>📞 Total de Chamadas</h3>
            <div className="metric-value">{validOperators.reduce((sum, op) => sum + (op.totalCalls || 0), 0)}</div>
            <p>Chamadas processadas</p>
          </div>
          
          <div className="metric-card">
            <h3>⭐ Nota Média Geral</h3>
            <div className="metric-value">
              {validOperators.length > 0 
                ? (validOperators.reduce((sum, op) => sum + (op.avgRatingAttendance || 0), 0) / validOperators.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p>Avaliação média dos agentes</p>
          </div>
          
          <div className="metric-card">
            <h3>🎯 Nota Solução Média</h3>
            <div className="metric-value">
              {validOperators.length > 0 
                ? (validOperators.reduce((sum, op) => sum + (op.avgRatingSolution || 0), 0) / validOperators.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p>Avaliação média das soluções</p>
          </div>
        </div>
      </div>

      {/* Seletor de Operador */}
      {validOperators.length > 0 ? (
        <OperatorSelector
          operators={validOperators}
          onSelectOperator={handleViewAgent}
          hideNames={shouldHideNames}
        />
      ) : (
        <div className="no-agents">
          <h3>📊 Nenhum agente encontrado</h3>
          <p>Não foram encontrados operadores válidos na base de dados.</p>
        </div>
      )}
    </div>
  )
}

export default AgentAnalysis
