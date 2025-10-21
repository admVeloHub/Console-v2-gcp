import React from 'react'

const TemporalComparison = ({ data, period, onPeriodChange }) => {
  return (
    <div className="temporal-comparison">
      <h3>Comparação Temporal</h3>
      <div className="period-selector">
        <button 
          className={period === 'day' ? 'active' : ''}
          onClick={() => onPeriodChange('day')}
        >
          Dia
        </button>
        <button 
          className={period === 'week' ? 'active' : ''}
          onClick={() => onPeriodChange('week')}
        >
          Semana
        </button>
        <button 
          className={period === 'month' ? 'active' : ''}
          onClick={() => onPeriodChange('month')}
        >
          Mês
        </button>
      </div>
      <div className="comparison-content">
        {/* Conteúdo da comparação temporal */}
        <p>Análise temporal em desenvolvimento...</p>
      </div>
    </div>
  )
}

export default TemporalComparison
