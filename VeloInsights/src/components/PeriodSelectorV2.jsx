import React, { useState, useEffect } from 'react'
import './PeriodSelectorV2.css'

const PeriodSelectorV2 = ({ onPeriodSelect, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState('currentMonth')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Função para obter nomes dos meses
  const getMonthName = (date) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }

  // Calcular períodos baseado na data
  const calculatePeriods = () => {
    const now = new Date()
    const periods = {
      currentMonth: {
        label: `Mês atual (${getMonthName(now)})`,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      },
      lastMonth: {
        label: `1 mês atrás (${getMonthName(new Date(now.getFullYear(), now.getMonth() - 1))})`,
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0)
      },
      twoMonthsAgo: {
        label: `2 meses atrás (${getMonthName(new Date(now.getFullYear(), now.getMonth() - 2))})`,
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 1, 0)
      },
      last7Days: {
        label: 'Últimos 7 dias',
        startDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        endDate: now
      },
      last15Days: {
        label: 'Últimos 15 dias',
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        endDate: now
      },
      custom: {
        label: 'Período personalizado',
        startDate: null,
        endDate: null
      }
    }
    return periods
  }

  const periods = calculatePeriods()

  // Função para converter data para formato YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  // Função principal para selecionar período
  const handlePeriodSelect = (periodKey) => {
    setSelectedOption(periodKey)
    
    if (periodKey === 'custom') {
      return // Aguardar datas personalizadas
    }

    const period = periods[periodKey]
    const startDate = formatDate(period.startDate)
    const endDate = formatDate(period.endDate)

    onPeriodSelect({
      type: periodKey,
      label: period.label,
      startDate,
      endDate,
      startDateObj: period.startDate,
      endDateObj: period.endDate
    })
  }

  // Função para período personalizado
  const handleCustomSubmit = (e) => {
    e.preventDefault()
    
    if (!customStartDate || !customEndDate) {
      alert('Por favor, selecione ambas as datas')
      return
    }

    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert('A data inicial não pode ser maior que a data final')
      return
    }

    onPeriodSelect({
      type: 'custom',
      label: `Período personalizado (${new Date(customStartDate).getDate()}/${new Date(customStartDate).getMonth() + 1} a ${new Date(customEndDate).getDate()}/${new Date(customEndDate).getMonth() + 1})`,
      startDate: customStartDate,
      endDate: customEndDate,
      startDateObj: new Date(customStartDate),
      endDateObj: new Date(customEndDate)
    })
  }

  // Atualizar períodos quando mês atual mudar
  useEffect(() => {
    setCurrentMonth(new Date())
  }, [])

  return (
    <div className="period-selector-v2">
      <div className="period-header">
        <h2>📅 Selecionar Período</h2>
        <p>Escolha o período para análise dos dados</p>
      </div>

      <div className="period-options">
        <div className="period-grid">
          {/* Mês atual */}
          <button 
            className={`period-card ${selectedOption === 'currentMonth' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('currentMonth')}
            disabled={isLoading}
          >
            <div className="period-icon">📅</div>
            <div className="period-label">Mês atual</div>
            <div className="period-month">{getMonthName(currentMonth)}</div>
          </button>

          {/* 1 mês atrás */}
          <button 
            className={`period-card ${selectedOption === 'lastMonth' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('lastMonth')}
            disabled={isLoading}
          >
            <div className="period-icon">📅</div>
            <div className="period-label">1 mês atrás</div>
            <div className="period-month">{getMonthName(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}</div>
          </button>

          {/* 2 meses atrás */}
          <button 
            className={`period-card ${selectedOption === 'twoMonthsAgo' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('twoMonthsAgo')}
            disabled={isLoading}
          >
            <div className="period-icon">📅</div>
            <div className="period-label">2 meses atrás</div>
            <div className="period-month">{getMonthName(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2))}</div>
          </button>

          {/* Últimos 7 dias */}
          <button 
            className={`period-card ${selectedOption === 'last7Days' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('last7Days')}
            disabled={isLoading}
          >
            <div className="period-icon">📊</div>
            <div className="period-label">Últimos 7 dias</div>
            <div className="period-subtitle">Análise semanal</div>
          </button>

          {/* Últimos 15 dias */}
          <button 
            className={`period-card ${selectedOption === 'last15Days' ? 'active' : ''}`}
            onClick={() => handlePeriodSelect('last15Days')}
            disabled={isLoading}
          >
            <div className="period-icon">📈</div>
            <div className="period-label">Últimos 15 dias</div>
            <div className="period-subtitle">Análise quinzenal</div>
          </button>

          {/* Período personalizado */}
          <button 
            className={`period-card ${selectedOption === 'custom' ? 'active' : ''}`}
            onClick={() => setSelectedOption('custom')}
            disabled={isLoading}
          >
            <div className="period-icon">🎯</div>
            <div className="period-label">Personalizado</div>
            <div className="period-subtitle">Escolha as datas</div>
          </button>
        </div>

        {/* Formulário para período personalizado */}
        {selectedOption === 'custom' && (
          <div className="custom-period-form">
            <h3>🎯 Período Personalizado</h3>
            <form onSubmit={handleCustomSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customStartDate">Data Inicial:</label>
                  <input
                    type="date"
                    id="customStartDate"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="customEndDate">Data Final:</label>
                  <input
                    type="date"
                    id="customEndDate"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? '🔄 Processando...' : '🔍 Buscar Dados'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PeriodSelectorV2
