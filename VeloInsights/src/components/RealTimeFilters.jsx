import React, { useState, useEffect, useCallback } from 'react'
import './RealTimeFilters.css'

const RealTimeFilters = ({ 
  onFiltersChange, 
  operators = [], 
  dateRange = null,
  isLoading = false 
}) => {
  const [filters, setFilters] = useState({
    operator: '',
    dateStart: '',
    dateEnd: '',
    minCalls: '',
    minRating: '',
    status: 'all'
  })
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  
  // Debounce para evitar muitas chamadas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [filters])
  
  // Notificar mudanças nos filtros
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(debouncedFilters)
    }
  }, [debouncedFilters, onFiltersChange])
  
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters({
      operator: '',
      dateStart: '',
      dateEnd: '',
      minCalls: '',
      minRating: '',
      status: 'all'
    })
  }, [])
  
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  )
  
  return (
    <div className="real-time-filters">
      <div className="filters-header">
        <h3 className="filters-title">
          <span className="filters-icon">🔍</span>
          Filtros em Tempo Real
        </h3>
        {hasActiveFilters && (
          <button 
            className="btn-clear-filters"
            onClick={clearFilters}
            disabled={isLoading}
          >
            🗑️ Limpar Filtros
          </button>
        )}
      </div>
      
      <div className="filters-grid">
        {/* Filtro por Operador */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">👤</span>
            Operador
          </label>
          <select
            className="filter-select"
            value={filters.operator}
            onChange={(e) => handleFilterChange('operator', e.target.value)}
            disabled={isLoading}
          >
            <option value="">Todos os operadores</option>
            {operators.map(op => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por Data */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📅</span>
            Data Início
          </label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateStart}
            onChange={(e) => handleFilterChange('dateStart', e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📅</span>
            Data Fim
          </label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateEnd}
            onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        {/* Filtro por Mínimo de Chamadas */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📞</span>
            Mín. Chamadas
          </label>
          <input
            type="number"
            className="filter-input"
            placeholder="Ex: 10"
            value={filters.minCalls}
            onChange={(e) => handleFilterChange('minCalls', e.target.value)}
            disabled={isLoading}
            min="0"
          />
        </div>
        
        {/* Filtro por Nota Mínima */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">⭐</span>
            Nota Mínima
          </label>
          <input
            type="number"
            className="filter-input"
            placeholder="Ex: 4.0"
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
            disabled={isLoading}
            min="0"
            max="5"
            step="0.1"
          />
        </div>
        
        {/* Filtro por Status */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📊</span>
            Status
          </label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={isLoading}
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="excluded">Excluídos</option>
          </select>
        </div>
      </div>
      
      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-icon">🎯</span>
          <span className="active-filters-text">
            {Object.values(filters).filter(v => v !== '' && v !== 'all').length} filtro(s) ativo(s)
          </span>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="filters-loading">
          <span className="loading-spinner">🔄</span>
          <span className="loading-text">Aplicando filtros...</span>
        </div>
      )}
    </div>
  )
}

export default RealTimeFilters
