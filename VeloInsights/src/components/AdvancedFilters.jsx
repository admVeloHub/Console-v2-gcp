import React, { useState, useEffect, memo } from 'react'
import './AdvancedFilters.css'

const AdvancedFilters = memo(({ 
  filters, 
  onFiltersChange, 
  data = []
}) => {
  const [localFilters, setLocalFilters] = useState(filters)

  // Função para formatar números com pontos como separadores de milhares
  const formatarNumero = (numero) => {
    if (!numero || numero === 0) return '0'
    
    const num = parseFloat(numero)
    if (isNaN(num)) return '0'
    
    return num.toLocaleString('pt-BR')
  }

  // Função para scroll suave até os gráficos
  const scrollToCharts = () => {
    console.log('🔄 Tentando fazer scroll para os gráficos...')
    
    // Aguardar um pouco mais para garantir que o DOM foi atualizado
    setTimeout(() => {
      // Procurar pela seção de gráficos no dashboard
      const chartsSection = document.querySelector('.main-content-grid') || 
                           document.querySelector('.charts-grid') ||
                           document.querySelector('.charts-section') ||
                           document.querySelector('.metrics-dashboard') ||
                           document.querySelector('.dashboard-content') ||
                           document.querySelector('.stats-grid') ||
                           document.querySelector('.chart-card')
      
      console.log('🎯 Seção encontrada:', chartsSection)
      
      if (chartsSection) {
        console.log('✅ Fazendo scroll para:', chartsSection.className)
        chartsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      } else {
        console.log('⚠️ Nenhuma seção encontrada, fazendo scroll para o topo')
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  // Função para aplicar período e ir direto aos gráficos
  const handlePeriodChangeWithScroll = async (period) => {
    console.log('🚀 Aplicando período:', period)
    
    // Aplicar o filtro
    handlePeriodChange(period)
    
    // Pequeno delay para permitir que os dados sejam processados
    setTimeout(() => {
      console.log('⏰ Executando scroll após delay...')
      scrollToCharts()
    }, 500) // Aumentei o delay para 500ms
  }

  useEffect(() => {
    // Não definir período padrão - deixar vazio até o usuário selecionar
    // if (!localFilters.period) {
    //   const newFilters = { ...localFilters, period: 'currentMonth' }
    //   setLocalFilters(newFilters)
    //   onFiltersChange(newFilters)
    // }
  }, [])

  // Filtrar dados pelas datas automaticamente quando carregado
  const getFilteredData = (periodType) => {
    if (!data || !periodType) return data

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

    const now = new Date()
    let startDate, endDate

    switch (periodType) {
      case 'last7Days':
        startDate = new Date(ultimaDataDisponivel.getTime() - (7 * 24 * 60 * 60 * 1000))
        endDate = ultimaDataDisponivel
        break
      
      case 'last15Days':
        startDate = new Date(ultimaDataDisponivel.getTime() - (15 * 24 * 60 * 60 * 1000))
        endDate = ultimaDataDisponivel
        break
      
      case 'penultimoMes':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        break
      
      case 'ultimoMes':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      
      case 'currentMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = now
        break
      
      case 'allRecords':
        // Retornar todos os dados sem filtro de data
        return data
      
      case 'custom':
        if (localFilters.customStartDate && localFilters.customEndDate) {
          startDate = new Date(localFilters.customStartDate)
          endDate = new Date(localFilters.customEndDate)
        } else {
          return data
        }
        break
      
      default:
        return data
    }

    const filtered = data.filter(record => {
      if (!record.data) return false
      try {
        const recordDate = new Date(record.data.split('/').reverse().join('-'))
        return recordDate >= startDate && recordDate <= endDate
      } catch {
        return false
      }
    })
    
    return filtered
  }

  const handlePeriodChange = (periodType) => {
    const newFilters = { 
      ...localFilters, 
      period: periodType,
      customStartDate: '',
      customEndDate: ''
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCustomDateChange = (field, value) => {
    const newFilters = { 
      ...localFilters, 
      [field]: value 
    }
    if (newFilters.customStartDate && newFilters.customEndDate) {
      newFilters.period = 'custom'
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const filteredDataCount = getFilteredData().length

  return (
    <div className="advanced-filters card">
      <div className="filters-header">
        <h3>📅 Selecionar Período</h3>
        <div 
          className="period-selector clickable" 
          title="Clique para carregar dados e ir direto aos gráficos"
          onClick={() => handlePeriodChangeWithScroll(localFilters.period)}
        >
          <span className="period-text">
            {localFilters.period === 'allRecords' ? 'TODOS OS REGISTROS' :
             localFilters.period === 'last7Days' ? 'Últimos 7 dias' :
             localFilters.period === 'last15Days' ? 'Últimos 15 dias' :
             localFilters.period === 'ultimoMes' ? 'Último mês' :
             localFilters.period === 'penultimoMes' ? 'Penúltimo mês' :
             localFilters.period === 'currentMonth' ? 'Mês atual' :
             localFilters.period === 'custom' ? 'Período personalizado' :
             'Selecione um período'}
          </span>
          <i className='bx bx-down-arrow-alt scroll-indicator'></i>
        </div>
      </div>
      
      {/* Seletor de Período */}
      <div className="period-selector">
        <div className="period-options">
          
          <button 
            className={`period-option ${localFilters.period === 'last7Days' ? 'active' : ''}`}
            onClick={() => handlePeriodChangeWithScroll('last7Days')}
          >
            <span className="period-icon">🗓️</span>
            <div>
              <div className="period-title">Últimos 7 dias</div>
              <div className="period-subtitle">Veja os últimos 7 dias</div>
            </div>
            <span className="period-count">
              <span className="count-number">{formatarNumero(getFilteredData('last7Days').length)}</span>
              <span className="count-label">registros</span>
            </span>
          </button>

          <button 
            className={`period-option ${localFilters.period === 'last15Days' ? 'active' : ''}`}
            onClick={() => handlePeriodChangeWithScroll('last15Days')}
          >
            <span className="period-icon">📊</span>
            <div>
              <div className="period-title">Últimos 15 dias</div>
              <div className="period-subtitle">Últimas duas semanas</div>
            </div>
            <span className="period-count">
              <span className="count-number">{formatarNumero(getFilteredData('last15Days').length)}</span>
              <span className="count-label">registros</span>
            </span>
          </button>

          <button 
            className={`period-option ${localFilters.period === 'penultimoMes' ? 'active' : ''}`}
            onClick={() => handlePeriodChangeWithScroll('penultimoMes')}
          >
            <span className="period-icon">📅</span>
            <div>
              <div className="period-title">Penúltimo mês</div>
              <div className="period-subtitle">Mês anterior ao passado</div>
            </div>
            <span className="period-count">
              <span className="count-number">{formatarNumero(getFilteredData('penultimoMes').length)}</span>
              <span className="count-label">registros</span>
            </span>
          </button>

          <button 
            className={`period-option ${localFilters.period === 'ultimoMes' ? 'active' : ''}`}
            onClick={() => handlePeriodChangeWithScroll('ultimoMes')}
          >
            <span className="period-icon">📆</span>
            <div>
              <div className="period-title">Último mês</div>
              <div className="period-subtitle">Mês passado</div>
            </div>
            <span className="period-count">
              <span className="count-number">{formatarNumero(getFilteredData('ultimoMes').length)}</span>
              <span className="count-label">registros</span>
            </span>
          </button>

          <button 
            className={`period-option ${localFilters.period === 'currentMonth' ? 'active' : ''}`}
            onClick={() => handlePeriodChangeWithScroll('currentMonth')}
          >
            <span className="period-icon">🗓️</span>
            <div>
              <div className="period-title">Mês atual</div>
              <div className="period-subtitle">{new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</div>
            </div>
            <span className="period-count">
              <span className="count-number">{formatarNumero(getFilteredData('currentMonth').length)}</span>
              <span className="count-label">registros</span>
            </span>
          </button>

          <button 
            className={`period-option ${localFilters.period === 'allRecords' ? 'active' : ''}`}
            onClick={() => handlePeriodChangeWithScroll('allRecords')}
          >
            <span className="period-icon">📈</span>
            <div>
              <div className="period-title">TODOS OS REGISTROS</div>
              <div className="period-subtitle">Histórico completo</div>
            </div>
            <span className="period-count">
              <span className="count-number">{formatarNumero(data.length)}</span>
              <span className="count-label">registros</span>
            </span>
          </button>

        </div>

        {/* Período Personalizado */}
        <div className="custom-period-section">
          <h4>📅 Período Personalizado</h4>
          <div className="custom-date-inputs">
            <div className="date-input-group">
              <label htmlFor="customStartDate">Data inicial:</label>
              <input
                type="date"
                id="customStartDate"
                value={localFilters.customStartDate || ''}
                onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="customEndDate">Data final:</label>
              <input
                type="date"
                id="customEndDate"
                value={localFilters.customEndDate || ''}
                onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
              />
            </div>
          </div>
          {localFilters.period === 'custom' && (
            <div className="custom-period-info">
              📊 <strong>{filteredDataCount}</strong> registros encontrados no período personalizado
            </div>
          )}
        </div>

        {/* Informação do Período Atual */}
        <div className="current-period-info">
          <div className="period-summary">
            <span className="summary-icon">📊</span>
            <div className="summary-content">
              <div className="summary-title">Período Selecionado</div>
              <div className="summary-details">
                {localFilters.period === 'last7Days' && 'Últimos 7 dias'}
                {localFilters.period === 'last15Days' && 'Últimos 15 dias'}
                {localFilters.period === 'penultimoMes' && 'Penúltimo mês'}
                {localFilters.period === 'ultimoMes' && 'Último mês'}
                {localFilters.period === 'currentMonth' && 'Mês atual'}
                {localFilters.period === 'allRecords' && 'TODOS OS REGISTROS'}
                {localFilters.period === 'custom' && 'Período personalizado'}
              </div>
            </div>
            <div className="summary-stats">
              <span className="stats-number">{formatarNumero(filteredDataCount)}</span>
              <span className="stats-label">registros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

AdvancedFilters.displayName = 'AdvancedFilters'

export default AdvancedFilters