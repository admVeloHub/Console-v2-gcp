import React from 'react'
import './DataFilters.css'

const DataFilters = ({ 
  filters, 
  onFiltersChange, 
  operatorMetrics = [] 
}) => {
  const handlePeriodChange = (period) => {
    onFiltersChange({ ...filters, period })
  }

  const handleOperatorChange = (operator) => {
    onFiltersChange({ ...filters, operator })
  }

  const handleDateRangeChange = (field, value) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: { 
        ...filters.dateRange, 
        [field]: value 
      } 
    })
  }

  const getPeriodOptions = () => {
    const today = new Date()
    const options = [
      { value: 'last7days', label: 'Últimos 7 dias' },
      { value: 'last30days', label: 'Últimos 30 dias' },
      { value: 'last3months', label: 'Últimos 3 meses' },
      { value: 'custom', label: 'Período personalizado' }
    ]
    return options
  }

  return (
    <div className="data-filters">
      <h3>🔍 Filtros de Análise</h3>
      
      <div className="filters-grid">
        {/* Filtro de Período */}
        <div className="filter-group">
          <label>📅 Período:</label>
          <select 
            value={filters.period || 'last30days'} 
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="filter-select"
          >
            {getPeriodOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Operador */}
        <div className="filter-group">
          <label>👤 Operador:</label>
          <select 
            value={filters.operator || ''} 
            onChange={(e) => handleOperatorChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os operadores</option>
            {operatorMetrics.map((op, index) => (
              <option key={op.operator} value={op.operator}>
                {document.body.getAttribute('data-hide-names') === 'true' 
                  ? `Operador ${index + 1} (${op.totalCalls} chamadas)`
                  : `${op.operator} (${op.totalCalls} chamadas)`
                }
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Data Personalizada */}
        {filters.period === 'custom' && (
          <>
            <div className="filter-group">
              <label>📅 Data Inicial:</label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>📅 Data Final:</label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="filter-input"
              />
            </div>
          </>
        )}
      </div>

      {/* Botão de Limpar Filtros */}
      <div className="filters-actions">
        <button 
          onClick={() => onFiltersChange({ period: 'last30days', operator: '', dateRange: {} })}
          className="btn btn-secondary btn-sm"
        >
          🔄 Limpar Filtros
        </button>
      </div>
    </div>
  )
}

export default DataFilters
