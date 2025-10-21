import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import LoginTest from './components/LoginTest'
import MetricsDashboard from './components/MetricsDashboardNovo'
import ChartsSection from './components/ChartsSection'
import OperatorAnalysis from './components/OperatorAnalysis'
import ProgressIndicator from './components/ProgressIndicator'
import { processarDados } from './utils/dataProcessor'
import ChartsDetailedTab from './components/ChartsDetailedTab'
import AgentAnalysis from './components/AgentAnalysis'
import PreferencesManager from './components/PreferencesManager'
import CargoSelection from './components/CargoSelection'
import ProcessingLoader from './components/ProcessingLoader'
import NewSheetAnalyzer from './components/NewSheetAnalyzer'
import PeriodModal from './components/PeriodModal'
import { CargoProvider, useCargo } from './contexts/CargoContext'
import { useGoogleSheetsDirectSimple } from './hooks/useGoogleSheetsDirectSimple'
import { useDataFilters } from './hooks/useDataFilters'
import { useTheme } from './hooks/useTheme'
import { useOctaData } from './hooks/useOctaData'
import './styles/App.css'

// Componente interno que usa o hook useCargo
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('fetch')
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [viewMode, setViewMode] = useState('company') // 'company' ou 'operator'
  const [showDarkList, setShowDarkList] = useState(false)
  const [showNewLogin, setShowNewLogin] = useState(false) // Para mostrar a nova tela de login
  const [showPreferences, setShowPreferences] = useState(false)
  const [expandedOperator, setExpandedOperator] = useState(null) // Para controlar qual operador está expandido
  const [previousPeriodData, setPreviousPeriodData] = useState([]) // Dados do período anterior para comparação
  const [showPeriodModal, setShowPeriodModal] = useState(false) // Modal de período
  const [currentPeriodLabel, setCurrentPeriodLabel] = useState('Selecionar') // Label do período atual
  
  // Hook do sistema de cargos - apenas para cargo selecionado
  const { 
    selectedCargo, 
    selectCargo,
    autoLogin,
    showCargoSelection,
    userInfo
  } = useCargo()
  
  // Hook para tema
  const { theme, toggleTheme } = useTheme()
  
  // Controle de ocultar nomes para operadores
  useEffect(() => {
    // Verificar se deve ocultar nomes baseado no cargo PRINCIPAL do usuário, não no cargo selecionado
    // SUPERADMIN/GESTOR/ANALISTA sempre veem métricas gerais, mesmo quando assumem cargo de OPERADOR
    const shouldHideNames = userInfo?.cargo === 'OPERADOR'
    document.body.setAttribute('data-hide-names', shouldHideNames.toString())
    
    return () => {
      document.body.removeAttribute('data-hide-names')
    }
  }, [userInfo?.cargo])
  
  // Estados para dados e outras configurações
  // Dark List removida - todos os operadores são contabilizados normalmente
  const [filters, setFilters] = useState({ hideDesligados: false })
  const [filteredData, setFilteredData] = useState([])
  const [filteredMetrics, setFilteredMetrics] = useState(null)
  const [filteredOperatorMetrics, setFilteredOperatorMetrics] = useState(null)
  const [allRecordsLoadingStarted, setAllRecordsLoadingStarted] = useState(false)
  const [filteredRankings, setFilteredRankings] = useState(null)
  
  // Hook para dados OCTA - passar filtros para que ele recarregue quando período mudar
  const octaData = useOctaData(filters)
  
  // Hook do Google Sheets - fonte principal de autenticação e dados
  const {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    isLoading,
    signIn,
    signOut,
    isAuthenticated,
    userData,
    fullDataset, // Dataset completo da planilha
    // Novos estados para processamento completo
    isProcessingAllRecords,
    processingProgress,
    totalRecordsToProcess,
    loadAllRecordsWithProgress,
    loadDataOnDemand,
    loadPreviousPeriodData
  } = useGoogleSheetsDirectSimple()

  // Reset allRecordsLoadingStarted quando o filtro muda
  useEffect(() => {
    if (filters.period !== 'allRecords') {
      setAllRecordsLoadingStarted(false)
    }
  }, [filters.period])

  // Carregar dados do período anterior para comparação
  useEffect(() => {
    const loadPreviousData = async () => {
      if (filters.period && loadPreviousPeriodData) {
        try {
          const previousData = await loadPreviousPeriodData(filters.period)
          setPreviousPeriodData(previousData)
        } catch (error) {
          console.error('❌ Erro ao carregar dados do período anterior:', error)
          setPreviousPeriodData([])
        }
      } else {
        setPreviousPeriodData([])
      }
    }

    loadPreviousData()
  }, [filters.period]) // Removido loadPreviousPeriodData das dependências

  // Processar dados quando filtros mudam
  useEffect(() => {
    if (data && data.length > 0) {
      // console.log('🔄 Aplicando filtros aos dados...', filters)
      
      // Se não há filtros ativos, usar dados originais
      if (!filters.period) {
        // console.log('🔍 Sem filtros ativos, usando dados originais')
        setFilteredData(data)
        setFilteredMetrics(metrics)
        setFilteredOperatorMetrics(operatorMetrics)
        setFilteredRankings(rankings)
        return
      }

      // Se o filtro for "allRecords", usar todos os dados disponíveis
      if (filters.period === 'allRecords') {
        // Debug removido para melhor performance
        setFilteredData(data)
        
        // Garantir que metrics tenha totalCalls para compatibilidade com MetricsDashboard
        const metricsWithTotalCalls = {
          ...metrics,
          totalCalls: metrics.totalChamadas || 0
        }
        
        setFilteredMetrics(metricsWithTotalCalls)
        setFilteredOperatorMetrics(operatorMetrics)
        setFilteredRankings(rankings)
        return
      }
      
      // console.log('🔍 Filtro ativo:', filters.period)

      // Encontrar a última data disponível nos dados
      const ultimaDataDisponivel = data.reduce((ultima, item) => {
        if (!item.data) return ultima
        
        let itemDate
        // Converter data para formato correto
        if (typeof item.data === 'string') {
          // Formato DD/MM/YYYY
          const [dia, mes, ano] = item.data.split('/')
          // Usar new Date com horas normalizadas para evitar problemas de timezone
          itemDate = new Date(ano, mes - 1, dia, 0, 0, 0, 0)
        } else {
          itemDate = new Date(item.data)
          // Normalizar horas para evitar problemas de timezone
          itemDate.setHours(0, 0, 0, 0)
        }
        
        return itemDate > ultima ? itemDate : ultima
      }, new Date(0))
      
      // console.log(`🔍 Última data disponível: ${ultimaDataDisponivel.toLocaleDateString('pt-BR')}`)
      
      // Aplicar filtros de data
      const now = new Date()
      let startDate, endDate

      switch (filters.period) {
        case 'last7Days':
          startDate = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000))
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'last15Days':
          startDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'ultimoMes':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'penultimoMes':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'currentMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            // Converter datas customizadas corretamente
            if (typeof filters.customStartDate === 'string' && filters.customStartDate.includes('/')) {
              // Formato DD/MM/YYYY
              const [diaInicio, mesInicio, anoInicio] = filters.customStartDate.split('/')
              startDate = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0)
            } else if (typeof filters.customStartDate === 'string' && filters.customStartDate.includes('-')) {
              // Formato YYYY-MM-DD (do input type="date")
              startDate = new Date(filters.customStartDate + 'T00:00:00')
            } else {
              startDate = new Date(filters.customStartDate)
              startDate.setHours(0, 0, 0, 0)
            }
            
            if (typeof filters.customEndDate === 'string' && filters.customEndDate.includes('/')) {
              // Formato DD/MM/YYYY
              const [diaFim, mesFim, anoFim] = filters.customEndDate.split('/')
              endDate = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999)
            } else if (typeof filters.customEndDate === 'string' && filters.customEndDate.includes('-')) {
              // Formato YYYY-MM-DD (do input type="date")
              endDate = new Date(filters.customEndDate + 'T23:59:59')
            } else {
              endDate = new Date(filters.customEndDate)
              endDate.setHours(23, 59, 59, 999)
            }
          } else {
            setFilteredData(data)
            setFilteredMetrics(metrics)
            setFilteredOperatorMetrics(operatorMetrics)
            setFilteredRankings(rankings)
            return
          }
          break
        default:
          setFilteredData(data)
          setFilteredMetrics(metrics)
          setFilteredOperatorMetrics(operatorMetrics)
          setFilteredRankings(rankings)
          return
      }

      // Debug das datas de filtro
      // Debug removido para melhor performance
      // Debug removido para melhor performance
      // Debug removido para melhor performance
      // Debug removido para melhor performance
      
      // Verificar algumas datas dos dados
      if (data.length > 0) {
        // console.log('🔍 Primeiras 5 datas dos dados:')
        // data.slice(0, 5).forEach((item, index) => {
        //   console.log(`  ${index + 1}. ${item.data}`)
        // })
        
        // console.log('🔍 Últimas 5 datas dos dados:')
        // data.slice(-5).forEach((item, index) => {
        //   console.log(`  ${index + 1}. ${item.data}`)
        // })
      }
      
      // Filtrar dados por data
      let filtered = data.filter(item => {
        if (!item.data) return false
        
        // Converter data para formato correto
        let itemDate
        if (typeof item.data === 'string') {
          // Formato DD/MM/YYYY
          const [dia, mes, ano] = item.data.split('/')
          // Usar new Date com horas normalizadas para evitar problemas de timezone
          itemDate = new Date(ano, mes - 1, dia, 0, 0, 0, 0)
        } else {
          itemDate = new Date(item.data)
          // Normalizar horas para evitar problemas de timezone
          itemDate.setHours(0, 0, 0, 0)
        }
        
        const isValid = itemDate >= startDate && itemDate <= endDate
        
        // Debug específico para último mês
        if (filters.period === 'ultimoMes' && data.indexOf(item) < 10) {
          // Debug removido para melhor performance
        }
        
        return isValid
      })

      // Aplicar filtro de funcionários desligados se ativo
      // Debug removido para melhor performance
      // Debug removido para melhor performance
      
      if (filters.hideDesligados) {
        const beforeCount = filtered.length
        // Debug removido para melhor performance
        
        filtered = filtered.filter(item => {
          if (!item.operador) return true
          
          const nomeOperador = item.operador.toLowerCase()
          const isDesligado = nomeOperador.includes('desl') || 
                             nomeOperador.includes('excluido') ||
                             nomeOperador.includes('desligado') ||
                             nomeOperador.includes('inativo')
          
          if (isDesligado) {
            // Debug removido para melhor performance
          }
          
          return !isDesligado
        })
        
        // Debug removido para melhor performance
      } else {
        // Debug removido para melhor performance
      }

      // Debug removido para melhor performance

      // Usar dados filtrados diretamente (já são objetos processados)
      if (filtered.length > 0) {
        setFilteredData(filtered)
        
        // Recalcular métricas apenas com dados filtrados
        const totalChamadas = filtered.length
        
        // Debug removido para melhor performance
        
        const retidaURA = filtered.filter(item => item.chamada === 'Retida na URA').length
        const atendida = filtered.filter(item => item.chamada === 'Atendida').length
        const abandonada = filtered.filter(item => item.chamada === 'Abandonada').length
        
        
        // Calcular notas médias
        const notasAtendimento = filtered
          .filter(item => item.notaAtendimento && !isNaN(parseFloat(item.notaAtendimento)))
          .map(item => parseFloat(item.notaAtendimento))
        
        const notasSolucao = filtered
          .filter(item => item.notaSolucao && !isNaN(parseFloat(item.notaSolucao)))
          .map(item => parseFloat(item.notaSolucao))
        
        const notaMediaAtendimento = notasAtendimento.length > 0 
          ? (notasAtendimento.reduce((sum, nota) => sum + nota, 0) / notasAtendimento.length).toFixed(1)
          : '0.0'
        
        const notaMediaSolucao = notasSolucao.length > 0 
          ? (notasSolucao.reduce((sum, nota) => sum + nota, 0) / notasSolucao.length).toFixed(1)
          : '0.0'
        
        // Calcular tempos médios
        const tempoParaMinutos = (tempo) => {
          if (!tempo || tempo === '00:00:00') return 0
          if (typeof tempo === 'number') return tempo
          
          try {
            const [horas, minutos, segundos] = tempo.split(':').map(Number)
            return horas * 60 + minutos + segundos / 60
    } catch (error) {
            console.warn('Erro ao converter tempo:', tempo, error)
            return 0
          }
        }
        
        const temposFalado = filtered
          .filter(item => item.tempoFalado && item.tempoFalado !== '00:00:00')
          .map(item => tempoParaMinutos(item.tempoFalado))
          .filter(tempo => tempo > 0)
        
        const temposEspera = filtered
          .filter(item => item.tempoEspera && item.tempoEspera !== '00:00:00')
          .map(item => tempoParaMinutos(item.tempoEspera))
          .filter(tempo => tempo > 0)
        
        const tempoMedioFalado = temposFalado.length > 0 
          ? (temposFalado.reduce((sum, tempo) => sum + tempo, 0) / temposFalado.length).toFixed(1)
          : '0.0'
        
        const tempoMedioEspera = temposEspera.length > 0 
          ? (temposEspera.reduce((sum, tempo) => sum + tempo, 0) / temposEspera.length).toFixed(1)
          : '0.0'
        
        // Calcular chamadas avaliadas (que têm nota de 1-5 em atendimento OU solução)
        const chamadasAvaliadas = filtered.filter(item => {
          const temNotaAtendimento = item.notaAtendimento && 
            !isNaN(parseFloat(item.notaAtendimento)) && 
            parseFloat(item.notaAtendimento) >= 1 && 
            parseFloat(item.notaAtendimento) <= 5
          
          const temNotaSolucao = item.notaSolucao && 
            !isNaN(parseFloat(item.notaSolucao)) && 
            parseFloat(item.notaSolucao) >= 1 && 
            parseFloat(item.notaSolucao) <= 5
          
          return temNotaAtendimento || temNotaSolucao
        }).length
        
        // Calcular métricas completas
        const metricasFiltradas = {
          totalCalls: totalChamadas, // Adicionado para compatibilidade com MetricsDashboard
          totalChamadas,
          retidaURA,
          atendida,
          abandonada,
          taxaAtendimento: totalChamadas > 0 ? ((atendida / totalChamadas) * 100).toFixed(1) : '0.0',
          taxaAbandono: totalChamadas > 0 ? ((abandonada / totalChamadas) * 100).toFixed(1) : '0.0',
          notaMediaAtendimento,
          notaMediaSolucao,
          duracaoMediaAtendimento: tempoMedioFalado,
          tempoMedioEspera: tempoMedioEspera,
          chamadasAvaliadas
        }
        
        
        // Calcular métricas por operador
        const operadoresMap = new Map()
        filtered.forEach(item => {
          if (item.operador && item.operador !== 'Sem Operador') {
            if (!operadoresMap.has(item.operador)) {
              operadoresMap.set(item.operador, {
                operador: item.operador,
                totalChamadas: 0,
                atendidas: 0,
                retidasURA: 0,
                abandonadas: 0,
                notasAtendimento: [],
                notasSolucao: [],
                temposFalado: [],
                chamadasAvaliadas: 0
              })
            }
            
            const op = operadoresMap.get(item.operador)
            op.totalChamadas++
            
            if (item.chamada === 'Atendida') op.atendidas++
            else if (item.chamada === 'Retida na URA') op.retidasURA++
            else if (item.chamada === 'Abandonada') op.abandonadas++
            
            if (item.notaAtendimento && !isNaN(parseFloat(item.notaAtendimento))) {
              op.notasAtendimento.push(parseFloat(item.notaAtendimento))
            }
            if (item.notaSolucao && !isNaN(parseFloat(item.notaSolucao))) {
              op.notasSolucao.push(parseFloat(item.notaSolucao))
            }
            if (item.tempoFalado && item.tempoFalado !== '00:00:00') {
              const tempoEmMinutos = tempoParaMinutos(item.tempoFalado)
              if (tempoEmMinutos > 0) {
                op.temposFalado.push(tempoEmMinutos)
              }
            }
            
            // Contar chamadas avaliadas (que têm nota de 1-5 em atendimento OU solução)
            const temNotaAtendimento = item.notaAtendimento && 
              !isNaN(parseFloat(item.notaAtendimento)) && 
              parseFloat(item.notaAtendimento) >= 1 && 
              parseFloat(item.notaAtendimento) <= 5
            
            const temNotaSolucao = item.notaSolucao && 
              !isNaN(parseFloat(item.notaSolucao)) && 
              parseFloat(item.notaSolucao) >= 1 && 
              parseFloat(item.notaSolucao) <= 5
            
            if (temNotaAtendimento || temNotaSolucao) {
              op.chamadasAvaliadas++
            }
          }
        })
        
        // Processar métricas dos operadores
        const metricasOperadoresFiltradas = {}
        operadoresMap.forEach((op, nome) => {
          metricasOperadoresFiltradas[nome] = {
            totalChamadas: op.totalChamadas,
            atendidas: op.atendidas,
            retidasURA: op.retidasURA,
            abandonadas: op.abandonadas,
            taxaAtendimento: op.totalChamadas > 0 ? ((op.atendidas / op.totalChamadas) * 100).toFixed(1) : '0.0',
            notaMediaAtendimento: op.notasAtendimento.length > 0 
              ? (op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length).toFixed(1)
              : '0.0',
            notaMediaSolucao: op.notasSolucao.length > 0 
              ? (op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length).toFixed(1)
              : '0.0',
            tempoMedioFalado: op.temposFalado.length > 0 
              ? (op.temposFalado.reduce((sum, tempo) => sum + tempo, 0) / op.temposFalado.length).toFixed(1)
              : '0.0',
            chamadasAvaliadas: op.chamadasAvaliadas
          }
        })
        
        // Criar ranking dos operadores
        const rankingFiltrado = Object.entries(metricasOperadoresFiltradas)
          .map(([nome, metrica]) => ({
            operator: nome, // Campo esperado pelo MetricsDashboard
            operador: nome, // Campo alternativo
            score: (parseFloat(metrica.notaMediaAtendimento) + parseFloat(metrica.notaMediaSolucao)).toFixed(1), // Score simples baseado nas notas
            totalCalls: metrica.totalChamadas, // Campo esperado pelo MetricsDashboard
            totalAtendimentos: metrica.totalChamadas, // Campo alternativo
            avgDuration: parseFloat(metrica.tempoMedioFalado), // Campo esperado pelo MetricsDashboard
            avgRatingAttendance: parseFloat(metrica.notaMediaAtendimento), // Campo esperado pelo MetricsDashboard
            avgRatingSolution: parseFloat(metrica.notaMediaSolucao), // Campo esperado pelo MetricsDashboard
            // Campos originais para compatibilidade
            totalChamadas: metrica.totalChamadas,
            tempoMedioFalado: metrica.tempoMedioFalado,
            notaMediaAtendimento: metrica.notaMediaAtendimento,
            notaMediaSolucao: metrica.notaMediaSolucao,
            taxaAtendimento: metrica.taxaAtendimento,
            chamadasAvaliadas: metrica.chamadasAvaliadas
          }))
          .sort((a, b) => b.totalCalls - a.totalCalls)
          .slice(0, 10) // Top 10
        
        
        setFilteredMetrics(metricasFiltradas)
        setFilteredOperatorMetrics(metricasOperadoresFiltradas)
        setFilteredRankings(rankingFiltrado)
      } else {
        setFilteredData([])
        // Criar métricas zeradas quando não há dados filtrados
        const metricasZeradas = {
          totalCalls: 0, // Adicionado para compatibilidade com MetricsDashboard
          totalChamadas: 0,
          retidaURA: 0,
          atendida: 0,
          abandonada: 0,
          taxaAtendimento: '0.0',
          taxaAbandono: '0.0',
          notaMediaAtendimento: '0.0',
          notaMediaSolucao: '0.0',
          duracaoMediaAtendimento: '0.0',
          tempoMedioEspera: '0.0',
          chamadasAvaliadas: 0
        }
        setFilteredMetrics(metricasZeradas)
        setFilteredOperatorMetrics({})
        setFilteredRankings([])
      }
    }
  }, [data, filters, metrics, operatorMetrics, rankings, isProcessingAllRecords, allRecordsLoadingStarted])

  // Reset do estado de carregamento quando o filtro mudar
  useEffect(() => {
    if (filters.period !== 'allRecords') {
      setAllRecordsLoadingStarted(false)
    }
  }, [filters.period])

  // Login automático baseado no email do usuário
  useEffect(() => {
    if (isAuthenticated && userData?.email && showCargoSelection) {
      // Debug removido para melhor performance
      const success = autoLogin(userData.email)
      if (success) {
        // Debug removido para melhor performance
      } else {
        // Debug removido para melhor performance
      }
    }
  }, [isAuthenticated, userData?.email, showCargoSelection, autoLogin])

  // Autenticação: navegar automaticamente para dashboard quando logado
  useEffect(() => {
    if (isAuthenticated && currentView === 'fetch') {
      // Debug removido para melhor performance
      setCurrentView('dashboard')
      // Carregar dados automaticamente se não houver dados
      if (loadDataOnDemand && (!data || data.length === 0)) {
        // Debug removido para melhor performance
        loadDataOnDemand('all')
      }
    }
  }, [isAuthenticated, currentView, loadDataOnDemand, data])

  // Debug do dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      // console.log('📊 Dashboard estado - data:', data?.length, 'isLoading:', isLoading, 'metrics:', !!metrics, 'operatorMetrics:', !!operatorMetrics)
    }
  }, [currentView, data, isLoading, metrics, operatorMetrics])


  // Função para lidar com cargo selecionado
  const handleCargoSelected = (cargo) => {
    if (userData?.email) {
      const success = selectCargo(cargo, userData.email)
      if (success) {
        // Debug removido para melhor performance
        // Carregar dados automaticamente após seleção de cargo
        if (loadDataOnDemand && (!data || data.length === 0)) {
          // Debug removido para melhor performance
          loadDataOnDemand('all')
        }
      } else {
        console.error('❌ Erro ao selecionar cargo')
      }
    } else {
      console.error('❌ Email do usuário não disponível')
    }
  }

  // Função para alternar sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Função para alternar notas detalhadas do operador
  const handleToggleNotes = (operatorName) => {
    if (expandedOperator === operatorName) {
      setExpandedOperator(null) // Fechar se já estiver aberto
    } else {
      setExpandedOperator(operatorName) // Abrir para este operador
    }
  }

  // Função para mudar visualização
  const handleViewChange = (view) => {
    setCurrentView(view)
    if (view === 'agents') {
      setSelectedOperator(null)
    }
  }

  // Função para selecionar operador
  const handleOperatorSelect = (op) => {
    setSelectedOperator(op)
  }

  // Funções da Dark List removidas - todos os operadores são contabilizados normalmente

  return (
    <div className="app">
      <Header 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
        onViewChange={handleViewChange}
        hasData={data && data.length > 0}
        onOpenPeriodModal={() => setShowPeriodModal(true)}
        currentPeriod={currentPeriodLabel}
        onSyncData={async () => {
          // Debug removido para melhor performance
          setIsLoading(true)
          try {
            await fetchData()
            // Debug removido para melhor performance
          } catch (error) {
            console.error('❌ Erro na sincronização manual:', error)
          } finally {
            setIsLoading(false)
          }
        }}
      />
      
      <div className="app-content">
        <Sidebar 
          open={sidebarOpen}
          currentView={currentView}
          onViewChange={handleViewChange}
          hasData={data && data.length > 0}
          onClearData={() => {}}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedOperator={selectedOperator}
          onOperatorSelect={handleOperatorSelect}
          operatorMetrics={operatorMetrics}
          onShowPreferences={() => setShowPreferences(true)}
          onClose={() => setSidebarOpen(false)}
          selectedCargo={selectedCargo}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {isLoading && (
            <ProgressIndicator 
              progress={{ current: 50, total: 100, message: 'Carregando dados...' }}
              onCancel={() => {}}
            />
          )}

          {/* Tela de carregamento para TODOS OS REGISTROS */}
          <ProcessingLoader 
            isVisible={isProcessingAllRecords}
            progress={processingProgress}
            currentRecord={Math.round((processingProgress / 100) * totalRecordsToProcess)}
            totalRecords={totalRecordsToProcess}
          />
          
          {(currentView === 'fetch' || showNewLogin) && (
            <LoginTest
              onContinue={() => {
                // Debug removido para melhor performance
                setShowNewLogin(false)
                setCurrentView('dashboard')
              }}
              onSignIn={signIn}
              isLoading={isLoading}
              isLoggedIn={isAuthenticated} // Usar o estado real de autenticação
            />
          )}
          
          {currentView === 'dashboard' && (
            <>
              {!isLoading && data && data.length > 0 ? (
                <>
                  {/* Dashboard Principal - Métricas Gerais com OCTA integrado */}
                  <div className="main-dashboard-container">
                    <div className="pbx-section">
                      <div className="section-header">
                        
                        <div className="section-info">
                          <span className="info-icon">ℹ️</span>
                          <span className="info-text">Dados de ligações e atendimentos</span>
                        </div>
                      </div>
                      <MetricsDashboard
                        metrics={filteredMetrics && Object.keys(filteredMetrics).length > 0 ? filteredMetrics : metrics}
                        operatorMetrics={filteredOperatorMetrics && Object.keys(filteredOperatorMetrics).length > 0 ? filteredOperatorMetrics : operatorMetrics}
                        rankings={(() => {
                          // Para o período "allRecords", sempre usar rankings originais
                          if (filters.period === 'allRecords') {
                            return rankings
                          }
                          
                          // Para outros períodos, usar filteredRankings se disponível
                          return filteredRankings && filteredRankings.length > 0 ? filteredRankings : rankings
                        })()}
                        data={filteredData.length > 0 ? filteredData : data}
                        periodo={(() => {
                          // Se não há filtro selecionado, retornar null para ocultar o ranking
                          if (!filters.period) {
                            return null
                          }
                          
                          // Se há filtros ativos, sempre usar filteredData (mesmo que vazio)
                          const currentData = filteredData
                          
                          
                          if (!currentData || currentData.length === 0) {
                            return {
                              startDate: null,
                              endDate: null,
                              totalDays: 0,
                              totalRecords: 0,
                              periodLabel: 'Nenhum dado disponível'
                            }
                          }
                          
                          // Verificar se os dados são objetos ou arrays
                          const firstItem = currentData[0]
                          const isObject = typeof firstItem === 'object' && !Array.isArray(firstItem)
                          
                          let datas = []
                          
                          if (isObject) {
                            // Dados são objetos - acessar propriedade 'data'
                            datas = currentData.map(d => d.data).filter(d => d && d.trim() !== '')
                          } else {
                            // Dados são arrays - acessar índice 3
                            datas = currentData.map(d => d[3]).filter(d => d && d.trim() !== '')
                          }
                          
                          if (datas.length === 0) {
                            return {
                              startDate: null,
                              endDate: null,
                              totalDays: 0,
                              totalRecords: currentData.length,
                              periodLabel: 'Datas não disponíveis'
                            }
                          }
                          
                          // Para período customizado, usar as datas selecionadas pelo usuário
                          if (filters.period === 'custom' && filters.customStartDate && filters.customEndDate) {
                            // Converter datas customizadas para formato DD/MM/YYYY
                            let startDateFormatted, endDateFormatted
                            
                            if (typeof filters.customStartDate === 'string' && filters.customStartDate.includes('/')) {
                              startDateFormatted = filters.customStartDate
                            } else if (typeof filters.customStartDate === 'string' && filters.customStartDate.includes('-')) {
                              // Formato YYYY-MM-DD (do input type="date")
                              const startDate = new Date(filters.customStartDate + 'T00:00:00')
                              startDateFormatted = startDate.toLocaleDateString('pt-BR')
                            } else {
                              const startDate = new Date(filters.customStartDate)
                              startDateFormatted = startDate.toLocaleDateString('pt-BR')
                            }
                            
                            if (typeof filters.customEndDate === 'string' && filters.customEndDate.includes('/')) {
                              endDateFormatted = filters.customEndDate
                            } else if (typeof filters.customEndDate === 'string' && filters.customEndDate.includes('-')) {
                              // Formato YYYY-MM-DD (do input type="date")
                              const endDate = new Date(filters.customEndDate + 'T23:59:59')
                              endDateFormatted = endDate.toLocaleDateString('pt-BR')
                            } else {
                              const endDate = new Date(filters.customEndDate)
                              endDateFormatted = endDate.toLocaleDateString('pt-BR')
                            }
                            
                            return {
                              startDate: startDateFormatted,
                              endDate: endDateFormatted,
                              totalDays: Math.ceil((new Date(filters.customEndDate) - new Date(filters.customStartDate)) / (1000 * 60 * 60 * 24)) + 1,
                              totalRecords: currentData.length,
                              periodLabel: `${startDateFormatted} a ${endDateFormatted}`
                            }
                          }
                          
                          // Para outros períodos, usar as datas do filtro aplicado (não dos dados filtrados)
                          const now = new Date()
                          let startDate, endDate, totalDays
                          
                          switch (filters.period) {
                            case 'last7Days':
                              startDate = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000))
                              endDate = new Date(now)
                              totalDays = 7
                              break
                            case 'last15Days':
                              startDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
                              endDate = new Date(now)
                              totalDays = 15
                              break
                            case 'lastMonth':
                              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                              endDate = new Date(now.getFullYear(), now.getMonth(), 0)
                              totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                              break
                            case 'penultimateMonth':
                              startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
                              endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
                              totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                              break
                            case 'currentMonth':
                              startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                              endDate = new Date(now)
                              totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                              break
                            default:
                              // Fallback para dados filtrados se não for um período conhecido
                              const datasUnicas = [...new Set(datas)].sort((a, b) => {
                                const dateA = new Date(a.split('/').reverse().join('-'))
                                const dateB = new Date(b.split('/').reverse().join('-'))
                                return dateA - dateB
                              })
                              startDate = datasUnicas[0]
                              endDate = datasUnicas[datasUnicas.length - 1]
                              totalDays = datasUnicas.length
                          }
                          
                          // Formatar datas para exibição
                          const startDateFormatted = startDate instanceof Date ? 
                            startDate.toLocaleDateString('pt-BR') : startDate
                          const endDateFormatted = endDate instanceof Date ? 
                            endDate.toLocaleDateString('pt-BR') : endDate
                          
                          return {
                            startDate: startDateFormatted,
                            endDate: endDateFormatted,
                            totalDays: totalDays,
                            totalRecords: currentData.length,
                            periodLabel: `${startDateFormatted} a ${endDateFormatted}`
                          }
                        })()}
                        onToggleNotes={handleToggleNotes}
                        userData={userData}
                        filters={filters}
                        onFiltersChange={setFilters}
                        fullDataset={fullDataset}
                        octaData={octaData}
                      />
                    </div>
                  </div>
                  
                  {/* Modal de Notas Detalhadas */}
                  {expandedOperator && (
                    <div className="notes-modal-overlay" onClick={() => setExpandedOperator(null)}>
                      <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notes-modal-header">
                          <h3>📋 Notas Detalhadas - {expandedOperator}</h3>
                          <button 
                            className="close-modal-btn"
                            onClick={() => setExpandedOperator(null)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="notes-modal-content">
                          {(() => {
                            // Coletar todas as notas do operador no período atual
                            const currentData = filteredData.length > 0 ? filteredData : data
                            
                            const operatorNotes = currentData.filter(item => {
                              const isOperator = item.operador === expandedOperator
                              const hasNotes = (item.notaAtendimento && item.notaAtendimento > 0) || 
                                             (item.notaSolucao && item.notaSolucao > 0)
                              return isOperator && hasNotes
                            })
                            
                            if (operatorNotes.length === 0) {
                              return (
                                <div>
                                  <p>Nenhuma nota encontrada para este operador no período selecionado.</p>
                                </div>
                              )
                            }
                            
                            return (
                              <div className="notes-list">
                                <div className="notes-summary">
                                  <p><strong>Total de avaliações:</strong> {operatorNotes.length}</p>
                                  <p><strong>Período:</strong> {filters.period || 'Todos os registros'}</p>
                                </div>
                                <div className="notes-grid">
                                  {operatorNotes.map((note, index) => {
                                    // Função para determinar o emoji baseado na nota
                                    const getNoteEmoji = (nota) => {
                                      if (nota >= 4) return '🟢' // Notas 4 e 5
                                      if (nota === 3) return '🟡' // Nota 3
                                      return '🔴' // Notas 1 e 2
                                    }
                                    
                                    return (
                                      <div key={index} className="note-card">
                                        <div className="note-date">{note.data}</div>
                                        <div className="note-scores">
                                          {note.notaAtendimento && (
                                            <div className="note-score">
                                              <span className="score-label">Atendimento:</span>
                                              <span className="score-value">
                                                {getNoteEmoji(note.notaAtendimento)} {note.notaAtendimento}/5
                                              </span>
                                            </div>
                                          )}
                                          {note.notaSolucao && (
                                            <div className="note-score">
                                              <span className="score-label">Solução:</span>
                                              <span className="score-value">
                                                {getNoteEmoji(note.notaSolucao)} {note.notaSolucao}/5
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : isLoading ? (
                <div className="loading-container">
                  <h2>🔄 Carregando dados da planilha...</h2>
                  <p>Por favor, aguarde enquanto os dados são processados.</p>
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <div className="loading-container">
                  <h2>🔄 Preparando dashboard...</h2>
                  <p>Aguarde enquanto carregamos os dados para você.</p>
                  <div className="loading-spinner"></div>
                  <div className="loading-info">
                    <p>📊 Processando dados da planilha...</p>
                    <p>📅 Detectando período dos dados...</p>
                    <p>⚡ Preparando métricas e gráficos...</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Aba Gráficos Detalhados */}
          {currentView === 'charts' && (
            <ChartsDetailedTab
              data={filteredData.length > 0 ? filteredData : data}
              operatorMetrics={operatorMetrics} // Sempre usar operatorMetrics completo
              rankings={rankings} // Sempre usar ranking completo para Melhores Desempenhos
              selectedPeriod={null}
              isLoading={isLoading}
              pauseData={filteredData.length > 0 ? filteredData : data}
              userData={userData}
              filters={filters}
              originalData={data}
              onFiltersChange={setFilters}
              loadDataOnDemand={loadDataOnDemand}
            />
          )}
          
          {/* Aba Visualizar por Agente */}
          {currentView === 'agents' && (
            <AgentAnalysis 
              data={data}
              operatorMetrics={operatorMetrics}
              rankings={rankings}
            />
          )}
          
          {currentView === 'new-sheet' && (
            <NewSheetAnalyzer />
          )}
          
          {currentView === 'operators' && data && data.length > 0 && (
            <OperatorAnalysis 
              data={data}
              operatorMetrics={operatorMetrics}
              selectedOperator={selectedOperator}
            />
          )}
          
          {errors.length > 0 && (
            <div className="error-container">
              <h3>Erros encontrados:</h3>
              <details>
                <summary>Mostrar erros ({errors.length})</summary>
                <ul>
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 10 && <li>... e mais {errors.length - 10} erros</li>}
                </ul>
              </details>
            </div>
          )}
        </main>
      </div>
      
      {/* Dark List Manager removido - todos os operadores são contabilizados normalmente */}

      {/* Preferences Manager */}
      <PreferencesManager
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* Cargo Selection */}
      {showCargoSelection && userData?.email && (
        <CargoSelection
          userEmail={userData.email}
          onCargoSelected={handleCargoSelected}
        />
      )}

      {/* Period Modal */}
      <PeriodModal 
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        onApply={(newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }))
          // Atualizar label do período
          const periodLabels = {
            'last7Days': 'Últimos 7 dias',
            'last15Days': 'Últimos 15 dias',
            'penultimoMes': 'Penúltimo mês',
            'ultimoMes': 'Último mês',
            'currentMonth': 'Mês atual',
            'allRecords': 'Todos os registros',
            'custom': 'Personalizado'
          }
          setCurrentPeriodLabel(periodLabels[newFilters.period] || 'Selecionar')
        }}
        currentFilters={filters}
        data={data}
      />

      {/* Export FAB removido */}
      
    </div>
  )
}

// Componente principal que envolve tudo com o CargoProvider
function App() {
  return (
    <CargoProvider>
      <AppContent />
    </CargoProvider>
  )
}

export default App