import React, { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import './ModernChartsDashboard.css'

const ModernChartsDashboard = ({ data, operatorMetrics, rankings, selectedPeriod, userData, filters = {}, onFiltersChange, userInfo }) => {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentPeriod, setCurrentPeriod] = useState(null)

  // Determinar se deve mostrar dados pessoais baseado no cargo PRINCIPAL do usuário
  // SUPERADMIN/GESTOR/ANALISTA sempre veem métricas gerais, mesmo quando assumem cargo de OPERADOR
  const shouldShowPersonalData = userInfo?.cargo === 'OPERADOR'

  // Função para scroll suave até os gráficos
  const scrollToCharts = () => {
    
    // Procurar pela seção de gráficos - diferentes seletores para diferentes contextos
    const chartsSection = document.querySelector('.main-content-grid') || 
                         document.querySelector('.charts-grid') ||
                         document.querySelector('.charts-section') ||
                         document.querySelector('.metrics-dashboard') ||
                         document.querySelector('.dashboard-content')
    
    
    if (chartsSection) {
      chartsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    } else {
      // Fallback: scroll para o topo da página
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  // Função para aplicar período e ir direto aos gráficos
  const handlePeriodChange = async (period) => {
    
    if (!onFiltersChange) {
      console.warn('⚠️ [ModernChartsDashboard] onFiltersChange não foi fornecido')
      return
    }

    // Simular carregamento dos dados
    setIsLoading(true)
    
    // Aplicar o novo filtro
    onFiltersChange({ ...filters, period })
    
    // Delay menor para gráficos detalhados (dados já estão carregados)
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Após carregar, fazer scroll para os gráficos
    scrollToCharts()
    
    // Finalizar carregamento
    setIsLoading(false)
  }

  // Debug logs removidos para melhor performance

  // Função para filtrar dados por período
  const getFilteredData = React.useMemo(() => {
    // Se não há dados, retornar array vazio
    if (!data || !Array.isArray(data)) {
      return []
    }
    
    // Se não há período selecionado, retornar todos os dados
    if (!filters.period) {
      return data
    }

    // Encontrar a última data disponível nos dados
    const ultimaDataDisponivel = data.reduce((ultima, item) => {
      if (!item.data) return ultima
      
      let itemDate
      if (typeof item.data === 'string') {
        const [dia, mes, ano] = item.data.split('/')
        itemDate = new Date(ano, mes - 1, dia)
      } else {
        itemDate = new Date(item.data)
      }
      
      return itemDate > ultima ? itemDate : ultima
    }, new Date(0))

    let startDate, endDate

    switch (filters.period) {
      case 'last7Days':
        startDate = new Date(ultimaDataDisponivel.getTime() - (7 * 24 * 60 * 60 * 1000))
        endDate = ultimaDataDisponivel
        break
      
      case 'last15Days':
        startDate = new Date(ultimaDataDisponivel.getTime() - (15 * 24 * 60 * 60 * 1000))
        endDate = ultimaDataDisponivel
        break
      
      case 'ultimoMes':
        startDate = new Date(ultimaDataDisponivel.getFullYear(), ultimaDataDisponivel.getMonth() - 1, ultimaDataDisponivel.getDate())
        endDate = ultimaDataDisponivel
        break
      
        case 'allRecords':
          return data
      
      case 'custom':
        if (filters.customStartDate && filters.customEndDate) {
          startDate = new Date(filters.customStartDate)
          endDate = new Date(filters.customEndDate)
        } else {
          return data
        }
        break
      
      default:
        return data
    }

    const filteredData = data.filter(item => {
      if (!item.data) return false
      
      let itemDate
      if (typeof item.data === 'string') {
        const [dia, mes, ano] = item.data.split('/')
        itemDate = new Date(ano, mes - 1, dia)
      } else {
        itemDate = new Date(item.data)
      }
      
      return itemDate >= startDate && itemDate <= endDate
    })
    
    return filteredData
  }, [data, filters])

  // Memoizar dados do operador para evitar recálculos desnecessários
  const operatorData = React.useMemo(() => {
    if (!shouldShowPersonalData || !userData?.email || !getFilteredData) {
      return []
    }
    
    const emailName = userData.email.split('@')[0].toLowerCase()
    
    // Tentar diferentes variações do nome
    const nameVariations = [
      emailName,
      emailName.replace(/\./g, ' '), // gabriel.araujo -> gabriel araujo
      emailName.replace(/\./g, ''),  // gabriel.araujo -> gabrielaraujo
      emailName.split('.')[0],       // gabriel.araujo -> gabriel
      emailName.split('.')[1] || '', // gabriel.araujo -> araujo
    ].filter(Boolean)
    
    let data = []
    for (const variation of nameVariations) {
      data = getFilteredData.filter(item => 
        item.operador && item.operador.toLowerCase().includes(variation)
      )
      if (data.length > 0) {
        break
      }
    }
    
    return data
  }, [shouldShowPersonalData, userData?.email, getFilteredData])

  // Calcular métricas básicas (usando dados filtrados)
  const metrics = React.useMemo(() => {
    if (!getFilteredData || !Array.isArray(getFilteredData)) {
      return {
        totalCalls: 0,
        avgRating: 0,
        satisfactionRate: 0,
        referralScore: 0,
        totalOperators: 0,
        attendedCalls: 0,
        retainedCalls: 0,
        abandonedCalls: 0,
        uncategorizedCalls: 0,
        categorizedCalls: 0,
        totalEvaluations: 0
      }
    }

    // Calcular total de chamadas por operador logado (usando dados filtrados)
    let totalCalls = 0
    if (shouldShowPersonalData && userData?.email) {
      totalCalls = operatorData.length
    } else {
      totalCalls = getFilteredData.length
    }
    
    // Calcular chamadas por status de forma mais precisa (usando dados filtrados)
    // IMPORTANTE: Se há usuário logado, calcular apenas para esse operador
    let attendedCalls, retainedCalls, abandonedCalls
    
    if (shouldShowPersonalData && userData?.email) {
      // Para operador específico - usar dados do operador memoizados
      attendedCalls = operatorData.filter(item => 
        item.status === 'Atendida' || 
        item.chamada === 'Atendida'
      ).length
      
      retainedCalls = operatorData.filter(item => 
        item.status === 'Retida na URA' || 
        item.chamada === 'Retida na URA' ||
        (item.status && item.status.includes('URA'))
      ).length
      
      abandonedCalls = operatorData.filter(item => 
        item.status === 'Abandonada' || 
        item.chamada === 'Abandonada' ||
        (item.status && item.status.includes('Abandonada'))
      ).length
    } else {
      // Para dados gerais - usar todos os dados filtrados
      attendedCalls = getFilteredData.filter(item => 
        item.status === 'Atendida' || 
        item.chamada === 'Atendida'
      ).length
      
      retainedCalls = getFilteredData.filter(item => 
        item.status === 'Retida na URA' || 
        item.chamada === 'Retida na URA' ||
        (item.status && item.status.includes('URA'))
      ).length
      
      abandonedCalls = getFilteredData.filter(item => 
        item.status === 'Abandonada' || 
        item.chamada === 'Abandonada' ||
        (item.status && item.status.includes('Abandonada'))
      ).length
    }
    
    // Calcular chamadas não categorizadas
    const uncategorizedCalls = totalCalls - (attendedCalls + retainedCalls + abandonedCalls)
    
    // Calcular chamadas categorizadas
    const categorizedCalls = attendedCalls + retainedCalls + abandonedCalls
    
    // Calcular nota média - apenas para o operador logado usando coluna AB
    let avgRating = 0
    if (shouldShowPersonalData && userData?.email) {
      const operatorRatings = operatorData.filter(item => 
        item.notaAtendimento && item.notaAtendimento > 0
      )
      avgRating = operatorRatings.length > 0 
        ? operatorRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / operatorRatings.length 
        : 0
    } else {
      const attendedWithRatings = getFilteredData.filter(item => 
        (item.status === 'Atendida' || item.chamada === 'Atendida' || (item.operador && item.operador !== 'Sem Operador' && item.operador !== '')) &&
        item.notaAtendimento && item.notaAtendimento > 0
      )
      avgRating = attendedWithRatings.length > 0 
        ? attendedWithRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / attendedWithRatings.length 
        : 0
    }

    // Calcular taxa de satisfação (notas 4 e 5) - apenas para o operador logado
    let satisfactionRate = 0
    if (shouldShowPersonalData && userData?.email) {
      const operatorRatings = operatorData.filter(item => 
        item.notaAtendimento && item.notaAtendimento > 0
      )
      const satisfiedCalls = operatorRatings.filter(item => item.notaAtendimento >= 4).length
      satisfactionRate = operatorRatings.length > 0 ? (satisfiedCalls / operatorRatings.length) * 100 : 0
    } else {
      const attendedWithRatings = getFilteredData.filter(item => 
        (item.status === 'Atendida' || item.chamada === 'Atendida' || (item.operador && item.operador !== 'Sem Operador' && item.operador !== '')) &&
        item.notaAtendimento && item.notaAtendimento > 0
      )
      const satisfiedCalls = attendedWithRatings.filter(item => item.notaAtendimento >= 4).length
      satisfactionRate = attendedWithRatings.length > 0 ? (satisfiedCalls / attendedWithRatings.length) * 100 : 0
    }

    // Score de qualidade (média das notas de solução) - apenas para o operador logado usando coluna AC
    let referralScore = 0
    if (shouldShowPersonalData && userData?.email) {
      const operatorSolutionRatings = operatorData.filter(item => 
        item.notaSolucao && item.notaSolucao > 0
      )
      referralScore = operatorSolutionRatings.length > 0 
        ? operatorSolutionRatings.reduce((sum, item) => sum + item.notaSolucao, 0) / operatorSolutionRatings.length 
        : 0
    } else {
      const attendedWithSolutionRatings = getFilteredData.filter(item => 
        (item.status === 'Atendida' || item.chamada === 'Atendida' || (item.operador && item.operador !== 'Sem Operador' && item.operador !== '')) &&
        item.notaSolucao && item.notaSolucao > 0
      )
      referralScore = attendedWithSolutionRatings.length > 0 
        ? attendedWithSolutionRatings.reduce((sum, item) => sum + item.notaSolucao, 0) / attendedWithSolutionRatings.length 
        : 0
    }

    // Contar operadores únicos (usando dados filtrados)
    const uniqueOperators = new Set(getFilteredData.map(item => item.operador).filter(op => op && op !== 'Sem Operador'))
    const totalOperators = uniqueOperators.size
    
    const finalMetrics = {
      totalCalls,
      avgRating: parseFloat(avgRating.toFixed(1)),
      satisfactionRate,
      referralScore: parseFloat(referralScore.toFixed(1)),
      totalOperators,
      attendedCalls,
      retainedCalls,
      abandonedCalls,
      uncategorizedCalls,
      categorizedCalls,
      totalEvaluations: shouldShowPersonalData && userData?.email ? 
        operatorData.filter(item => 
          item.notaAtendimento && item.notaAtendimento > 0
        ).length :
        getFilteredData.filter(item => 
          (item.status === 'Atendida' || item.chamada === 'Atendida' || (item.operador && item.operador !== 'Sem Operador' && item.operador !== '')) &&
          item.notaAtendimento && item.notaAtendimento > 0
        ).length
    }
    
    return finalMetrics
  }, [getFilteredData, userData, operatorData])

  // Calcular dados semanais reais (usando dados filtrados)
  const weeklyData = React.useMemo(() => {
    if (!getFilteredData || !Array.isArray(getFilteredData)) {
      return [
        { day: 'Seg', value: 0, position: '20%' },
        { day: 'Ter', value: 0, position: '35%' },
        { day: 'Qua', value: 0, position: '50%' },
        { day: 'Qui', value: 0, position: '65%' },
        { day: 'Sex', value: 0, position: '80%' }
      ]
    }

    // Usar dados do operador se há usuário logado, senão usar dados gerais
    const dataToProcess = shouldShowPersonalData && userData?.email ? operatorData : getFilteredData

    // Agrupar dados por dia da semana
    const weeklyStats = {
      'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0
    }

    dataToProcess.forEach(item => {
      // Tentar diferentes campos de data
      const dateFields = ['data', 'Data', 'DATA', 'date', 'Date', 'DATE']
      let dateValue = null
      
      for (const field of dateFields) {
        if (item[field]) {
          dateValue = item[field]
          break
        }
      }

      if (dateValue) {
        try {
          let date
          // Tentar diferentes formatos de data
          if (typeof dateValue === 'string') {
            // Formato DD/MM/YYYY
            if (dateValue.includes('/')) {
              const parts = dateValue.split('/')
              if (parts.length === 3) {
                date = new Date(parts[2], parts[1] - 1, parts[0])
              }
            } else {
              date = new Date(dateValue)
            }
          } else {
            date = new Date(dateValue)
          }
          
          if (!isNaN(date.getTime())) {
            const dayOfWeek = date.getDay() // 0 = Domingo, 1 = Segunda, etc.
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
            const dayName = dayNames[dayOfWeek]
            
            if (weeklyStats.hasOwnProperty(dayName)) {
              weeklyStats[dayName]++
            }
          }
        } catch (e) {
          // Ignorar datas inválidas
        }
      }
    })

    // Converter para array com posições (posições são apenas para layout visual)
    return [
      { day: 'Seg', value: weeklyStats['Seg'], position: '20%' },
      { day: 'Ter', value: weeklyStats['Ter'], position: '35%' },
      { day: 'Qua', value: weeklyStats['Qua'], position: '50%' },
      { day: 'Qui', value: weeklyStats['Qui'], position: '65%' },
      { day: 'Sex', value: weeklyStats['Sex'], position: '80%' }
    ]
  }, [getFilteredData, userData, operatorData])

  // Dados pessoais do operador logado (usando dados filtrados)
  const personalData = React.useMemo(() => {
    if (!shouldShowPersonalData || !userData?.email || !getFilteredData) return null

    const personalCalls = operatorData

    // Se não encontrar dados pessoais, retornar dados básicos para evitar erro
    if (personalCalls.length === 0) {
      return {
        totalCalls: 0,
        avgDuration: 0,
        avgRatingAttendance: 0,
        avgRatingSolution: 0,
        hasData: false
      }
    }


    // Calcular tempo médio em minutos usando tempoFalado
    const totalDuration = personalCalls.reduce((sum, item) => {
      if (item.tempoFalado) {
        // Se já está em minutos
        if (typeof item.tempoFalado === 'number') {
          return sum + item.tempoFalado
        }
        // Se está em formato HH:MM:SS, converter para minutos
        if (typeof item.tempoFalado === 'string' && item.tempoFalado.includes(':')) {
          const parts = item.tempoFalado.split(':')
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          const seconds = parseInt(parts[2]) || 0
          return sum + (hours * 60) + minutes + (seconds / 60)
        }
      }
      return sum
    }, 0)

    // Calcular notas médias
    const attendanceRatings = personalCalls.filter(item => item.notaAtendimento && item.notaAtendimento > 0)
    const solutionRatings = personalCalls.filter(item => item.notaSolucao && item.notaSolucao > 0)

    const personalMetrics = {
      totalCalls: personalCalls.length,
      avgDuration: personalCalls.length > 0 ? totalDuration / personalCalls.length : 0,
      avgRatingAttendance: attendanceRatings.length > 0 
        ? attendanceRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / attendanceRatings.length 
        : 0,
      avgRatingSolution: solutionRatings.length > 0 
        ? solutionRatings.reduce((sum, item) => sum + item.notaSolucao, 0) / solutionRatings.length 
        : 0,
      hasData: true
    }

    return personalMetrics
  }, [shouldShowPersonalData, getFilteredData, userData, operatorData])

  useEffect(() => {
    if (getFilteredData) {
      setIsLoading(false)
      setHasError(false)
    }
  }, [getFilteredData])

  useEffect(() => {
    if (selectedPeriod) {
      setCurrentPeriod(selectedPeriod)
    }
  }, [selectedPeriod])

  if (isLoading) {
    return (
      <div className="modern-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="modern-dashboard">
        <div className="error-container">
          <h3>Erro ao carregar dados</h3>
          <p>Tente recarregar a página</p>
        </div>
      </div>
    )
  }

    return (
    <div className="modern-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="8" fill="url(#iconGradient)" />
            <path d="M12 32 L20 24 L28 28 L36 16" stroke="#1694FF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="36" cy="16" r="2" fill="#1694FF"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Análise completa dos dados de atendimento com precisão</p>
        </div>
        <div className="header-actions">
          <div 
            className={`period-selector clickable ${isLoading ? 'loading' : ''}`}
            onClick={() => handlePeriodChange(filters.period)}
            title="Clique para carregar dados e ir direto aos gráficos"
          >
            <span className="period-text">
              {filters.period === 'allRecords' ? 'TODOS OS REGISTROS' :
               filters.period === 'last7Days' ? 'Últimos 7 dias' :
               filters.period === 'last15Days' ? 'Últimos 15 dias' :
               filters.period === 'ultimoMes' ? 'Último mês' :
               filters.period === 'penultimoMes' ? 'Penúltimo mês' :
               filters.period === 'currentMonth' ? 'Mês atual' :
               filters.period === 'custom' ? 'Período personalizado' :
               selectedPeriod || 'Período não selecionado'}
            </span>
            {isLoading ? (
              <i className='bx bx-loader-alt scroll-indicator loading-spinner'></i>
            ) : (
              <i className='bx bx-down-arrow-alt scroll-indicator'></i>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className='bx bx-phone-call'></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{metrics.totalCalls.toLocaleString()}</div>
            <div className="stat-label">Total de Chamadas</div>
            <div className="stat-change positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baseado em dados reais
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className='bx bx-star'></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{metrics.avgRating}</div>
            <div className="stat-label">Nota Média</div>
            <div className="stat-change positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baseado em dados reais
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className='bx bx-target-lock'></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{metrics.referralScore}</div>
            <div className="stat-label">Score de Qualidade</div>
            <div className="stat-change positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baseado em dados reais
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - 4 cards em 2x2 */}
      <div className="main-content-grid">
        {/* Status das Chamadas */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className='bx bx-bar-chart-alt-2'></i> Status das Chamadas</h3>
            <p>Distribuição completa das chamadas</p>
          </div>
          <div className="bar-chart">
            <div className="bar-item">
              <div className="bar-label">Atendidas</div>
              <div className="bar-container">
                <div 
                  className="bar-fill success" 
                  style={{ width: `${metrics.totalCalls > 0 ? (metrics.attendedCalls / metrics.totalCalls) * 100 : 0}%` }}
                ></div>
                <span className="bar-value">{metrics.attendedCalls}</span>
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-label">Retidas na URA</div>
              <div className="bar-container">
                <div 
                  className="bar-fill warning" 
                  style={{ width: `${metrics.totalCalls > 0 ? (metrics.retainedCalls / metrics.totalCalls) * 100 : 0}%` }}
                ></div>
                <span className="bar-value">{metrics.retainedCalls}</span>
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-label">Abandonadas</div>
              <div className="bar-container">
                <div 
                  className="bar-fill danger" 
                  style={{ width: `${metrics.totalCalls > 0 ? (metrics.abandonedCalls / metrics.totalCalls) * 100 : 0}%` }}
                ></div>
                <span className="bar-value">{metrics.abandonedCalls}</span>
              </div>
            </div>
          </div>
          
          <div className="performance-evaluation">
            {(() => {
              const totalCalls = metrics.totalCalls
              const attendanceRate = totalCalls > 0 ? (metrics.attendedCalls / totalCalls) * 100 : 0
              let evaluation = ''
              let evaluationClass = ''
              
              if (attendanceRate >= 90) {
                evaluation = 'Excelente'
                evaluationClass = 'excellent'
              } else if (attendanceRate >= 80) {
                evaluation = 'Bom'
                evaluationClass = 'good'
              } else if (attendanceRate >= 70) {
                evaluation = 'Regular'
                evaluationClass = 'regular'
              } else {
                evaluation = 'Ruim'
                evaluationClass = 'poor'
              }
              
              return (
                <div className={`evaluation-badge ${evaluationClass}`}>
                  <i className='bx bx-trending-up'></i>
                  <span>{evaluation} - {attendanceRate.toFixed(1)}% de atendimento</span>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Avaliações de Qualidade */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className='bx bx-pie-chart-alt-2'></i> Avaliações de Qualidade</h3>
            <p>{shouldShowPersonalData ? 'Suas avaliações (AB e AC)' : 'Médias gerais da operação (AB e AC)'}</p>
          </div>
          <div className="pie-chart">
            {(() => {
              let operatorRatings = []
              if (shouldShowPersonalData && userData?.email) {
                // Para OPERADOR: usar apenas dados pessoais
                operatorRatings = operatorData.filter(item => 
                  ((item.notaAtendimento && item.notaAtendimento > 0) || (item.notaSolucao && item.notaSolucao > 0))
                )
              } else {
                // Para SUPERADMIN/GESTOR/ANALISTA: usar dados gerais de toda a operação
                operatorRatings = getFilteredData.filter(item => 
                  ((item.notaAtendimento && item.notaAtendimento > 0) || (item.notaSolucao && item.notaSolucao > 0))
                )
              }
              
              if (operatorRatings.length === 0) {
                return (
                  <div className="no-data-message">
                    <p>Nenhuma avaliação encontrada</p>
                  </div>
                )
              }
              
              const attendanceRatings = operatorRatings.filter(item => item.notaAtendimento && item.notaAtendimento > 0)
              const solutionRatings = operatorRatings.filter(item => item.notaSolucao && item.notaSolucao > 0)
              
              // Calcular quantas avaliações são excelentes (4-5) vs outras
              const excellentAttendance = attendanceRatings.filter(item => item.notaAtendimento >= 4).length
              const excellentSolution = solutionRatings.filter(item => item.notaSolucao >= 4).length
              const totalExcellent = excellentAttendance + excellentSolution
              const totalRatings = attendanceRatings.length + solutionRatings.length
              
              const excellentRate = totalRatings > 0 ? (totalExcellent / totalRatings) * 100 : 0
              const otherRate = 100 - excellentRate
              
              // Calcular médias para exibição
              const avgAttendance = attendanceRatings.length > 0 
                ? attendanceRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / attendanceRatings.length 
                : 0
              
              const avgSolution = solutionRatings.length > 0 
                ? solutionRatings.reduce((sum, item) => sum + item.notaSolucao, 0) / solutionRatings.length 
                : 0
              
              return (
                <>
                  <div className="pie-container" style={{ '--percentage': `${excellentRate}%` }}>
                    <div className="slice-content">
                      <span className="slice-label">Excelente</span>
                      <span className="slice-value">{(excellentRate / 100 * 5).toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="pie-legend">
                    <div className="legend-item">
                      <div className="legend-color excellent"></div>
                      <span>Excelente (4-5)</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color good"></div>
                      <span>Outros</span>
                    </div>
                  </div>
                  <div className="rating-details">
                    <div className="rating-item">
                      <span className="rating-label">Avaliação Atendimento:</span>
                      <span className="rating-value">{avgAttendance.toFixed(1)}</span>
                    </div>
                    <div className="rating-item">
                      <span className="rating-label">Avaliação Solução:</span>
                      <span className="rating-value">{avgSolution.toFixed(1)}</span>
                    </div>
                    <div className="rating-item">
                      <span className="rating-label">Média Geral:</span>
                      <span className="rating-value">{((avgAttendance + avgSolution) / 2).toFixed(1)}</span>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>

        {/* Sua Performance */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className='bx bx-doughnut-chart'></i> Sua Performance</h3>
            <p>Métricas pessoais</p>
          </div>
          <div className="donut-chart">
            {personalData && personalData.hasData ? (
              <>
                <div className="personal-metrics">
                  <div className="metric-item">
                    <div className="metric-icon">📞</div>
                    <div className="metric-content">
                      <span className="metric-value">{personalData.totalCalls}</span>
                      <span className="metric-label">Chamadas Realizadas</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                      <span className="metric-value">{personalData.avgDuration.toFixed(1)}min</span>
                      <span className="metric-label">Tempo Médio por Chamada</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <div className="metric-icon">⭐</div>
                    <div className="metric-content">
                      <span className="metric-value">{personalData.avgRatingAttendance.toFixed(1)}</span>
                      <span className="metric-label">Nota Média Atendimento</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <div className="metric-icon">🎯</div>
                    <div className="metric-content">
                      <span className="metric-value">{personalData.avgRatingSolution.toFixed(1)}</span>
                      <span className="metric-label">Nota Média Solução</span>
                    </div>
                  </div>
                </div>

                <div className="performance-analysis">
                  <h4>📊 Análise da Sua Performance</h4>
                  <div className="analysis-items">
                    <div className="analysis-item">
                      <span className="analysis-label">Eficiência:</span>
                      <span className={`analysis-value ${personalData.avgDuration < 5 ? 'excellent' : personalData.avgDuration < 8 ? 'good' : 'needs-improvement'}`}>
                        {personalData.avgDuration < 5 ? 'Excelente' : personalData.avgDuration < 8 ? 'Boa' : 'Pode Melhorar'}
                      </span>
                    </div>
                    
                    <div className="analysis-item">
                      <span className="analysis-label">Qualidade:</span>
                      <span className={`analysis-value ${personalData.avgRatingAttendance >= 4.5 ? 'excellent' : personalData.avgRatingAttendance >= 4 ? 'good' : 'needs-improvement'}`}>
                        {personalData.avgRatingAttendance >= 4.5 ? 'Excelente' : personalData.avgRatingAttendance >= 4 ? 'Boa' : 'Pode Melhorar'}
                      </span>
                    </div>
                    
                    <div className="analysis-item">
                      <span className="analysis-label">Volume:</span>
                      <span className={`analysis-value ${personalData.totalCalls >= 50 ? 'excellent' : personalData.totalCalls >= 20 ? 'good' : 'needs-improvement'}`}>
                        {personalData.totalCalls >= 50 ? 'Alto' : personalData.totalCalls >= 20 ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="trend-analysis">
                  {(() => {
                    if (!shouldShowPersonalData || !userData?.email) return null
                    
                    const operatorName = userData.email.split('@')[0].toLowerCase()
                    const sortedData = data.filter(item => 
                      item.operador && item.operador.toLowerCase().includes(operatorName)
                    ).sort((a, b) => {
                      const dateA = a.data || a.Data || a.DATA || a.date || a.Date || a.DATE
                      const dateB = b.data || b.Data || b.DATA || b.date || b.Date || b.DATE
                      
                      if (dateA && dateB) {
                        try {
                          const dateObjA = new Date(dateA.split('/').reverse().join('-'))
                          const dateObjB = new Date(dateB.split('/').reverse().join('-'))
                          return dateObjA - dateObjB
                        } catch (e) {
                          return 0
                        }
                      }
                      return 0
                    })
                    
                    if (sortedData.length < 4) {
                      return null
                    }
                    
                    const midPoint = Math.floor(sortedData.length / 2)
                    const firstHalf = sortedData.slice(0, midPoint)
                    const secondHalf = sortedData.slice(midPoint)
                    
                    const firstHalfRatings = firstHalf.filter(item => item.notaAtendimento && item.notaAtendimento > 0)
                    const secondHalfRatings = secondHalf.filter(item => item.notaAtendimento && item.notaAtendimento > 0)
                    
                    const firstHalfAvg = firstHalfRatings.length > 0 
                      ? firstHalfRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / firstHalfRatings.length 
                      : 0
                    
                    const secondHalfAvg = secondHalfRatings.length > 0 
                      ? secondHalfRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / secondHalfRatings.length 
                      : 0
                    
                    const difference = secondHalfAvg - firstHalfAvg
                    let trend = ''
                    let trendClass = ''
                    let trendIcon = ''
                    
                    if (Math.abs(difference) < 0.1) {
                      trend = 'Mantendo'
                      trendClass = 'stable'
                      trendIcon = 'bx-minus'
                    } else if (difference > 0) {
                      trend = 'Melhorando'
                      trendClass = 'improving'
                      trendIcon = 'bx-trending-up'
                    } else {
                      trend = 'Piorando'
                      trendClass = 'declining'
                      trendIcon = 'bx-trending-down'
                    }
                    
                    return (
                      <div className={`trend-item ${trendClass}`}>
                        <i className={`bx ${trendIcon}`}></i>
                        <span>{trend}</span>
                        <span className="trend-detail">
                          ({firstHalfAvg.toFixed(1)} → {secondHalfAvg.toFixed(1)})
                        </span>
                      </div>
                    )
                  })()}
                </div>
              </>
            ) : (
              <div className="no-personal-data">
                <div className="no-data-icon">📊</div>
                <h4>Dados Pessoais Não Encontrados</h4>
                <p>Não foram encontrados registros para o operador logado.</p>
                <div className="suggestions">
                  <h5>💡 Possíveis causas:</h5>
                  <ul>
                    <li>Nome do operador não corresponde ao email</li>
                    <li>Dados ainda não foram carregados</li>
                    <li>Filtros aplicados não incluem seus dados</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tendência Semanal */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className='bx bx-trending-up'></i> Tendência Semanal</h3>
            <p>Em breve</p>
          </div>
          <div className="line-chart">
            <div className="line-container">
              <div className="coming-soon-overlay">
                <div className="coming-soon-text">Em breve</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Card centralizado */}
      <div className="bottom-section">
        <div className="summary-card">
          <div className="summary-header">
            <h3>Resumo de Satisfação</h3>
          </div>
          <div className="summary-content">
            {(() => {
              if (!shouldShowPersonalData || !userData?.email) {
                return (
                  <>
                    <div className="summary-item">
                      <span className="summary-label">Taxa de Satisfação:</span>
                      <span className="summary-value">{metrics.satisfactionRate.toFixed(1)}%</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Baseado em:</span>
                      <span className="summary-value">{metrics.totalEvaluations.toLocaleString()} avaliações</span>
                    </div>
                  </>
                )
              }
              
              const operatorRatings = operatorData.filter(item => 
                ((item.notaAtendimento && item.notaAtendimento > 0) || (item.notaSolucao && item.notaSolucao > 0))
              )
              
              if (operatorRatings.length === 0) {
                return (
                  <div className="summary-item">
                    <span className="summary-label">Nenhuma avaliação encontrada</span>
                  </div>
                )
              }
              
              const attendanceRatings = operatorRatings.filter(item => item.notaAtendimento && item.notaAtendimento > 0)
              const solutionRatings = operatorRatings.filter(item => item.notaSolucao && item.notaSolucao > 0)
              
              const avgAttendance = attendanceRatings.length > 0 
                ? attendanceRatings.reduce((sum, item) => sum + item.notaAtendimento, 0) / attendanceRatings.length 
                : 0
              
              const avgSolution = solutionRatings.length > 0 
                ? solutionRatings.reduce((sum, item) => sum + item.notaSolucao, 0) / solutionRatings.length 
                : 0
              
              const totalEvaluations = attendanceRatings.length + solutionRatings.length
              
              return (
                <>
                  <div className="summary-item">
                    <span className="summary-label">Avaliação de Atendimento (AB):</span>
                    <span className="summary-value">{avgAttendance.toFixed(1)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Avaliação de Resolução (AC):</span>
                    <span className="summary-value">{avgSolution.toFixed(1)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Média Geral:</span>
                    <span className="summary-value">{((avgAttendance + avgSolution) / 2).toFixed(1)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Quantidade de Avaliações:</span>
                    <span className="summary-value">{totalEvaluations.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Operador:</span>
                    <span className="summary-value">{userData.email.split('@')[0]}</span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernChartsDashboard