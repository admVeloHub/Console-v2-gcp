import React, { useState, useEffect, useMemo } from 'react'
import './DarkListManager.css'

const DarkListManager = ({ 
  operators = [], 
  darkList = [], 
  onDarkListChange,
  isVisible = false,
  onToggle 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOperators, setSelectedOperators] = useState(new Set(darkList))

  // Usar useMemo para evitar re-renders desnecessários
  const darkListSet = useMemo(() => new Set(darkList), [darkList])

  useEffect(() => {
    setSelectedOperators(darkListSet)
  }, [darkListSet])

  const filteredOperators = operators.filter(operator => 
    operator.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOperatorToggle = (operator) => {
    const newSelected = new Set(selectedOperators)
    if (newSelected.has(operator)) {
      newSelected.delete(operator)
    } else {
      newSelected.add(operator)
    }
    setSelectedOperators(newSelected)
    onDarkListChange(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    const allOperators = new Set(operators)
    setSelectedOperators(allOperators)
    onDarkListChange(Array.from(allOperators))
  }

  const handleClearAll = () => {
    setSelectedOperators(new Set())
    onDarkListChange([])
  }

  if (!isVisible) return null

  return (
    <div className="dark-list-overlay">
      <div className="dark-list-modal">
        <div className="dark-list-header">
          <h3>🎯 Gerenciar Dark List</h3>
          <button 
            className="close-btn"
            onClick={onToggle}
            title="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="dark-list-content">
          <div className="dark-list-stats">
            <div className="stat-item">
              <span className="stat-label">Total de Operadores:</span>
              <span className="stat-value">{operators.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Na Dark List:</span>
              <span className="stat-value excluded">{selectedOperators.size}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ativos:</span>
              <span className="stat-value active">{operators.length - selectedOperators.size}</span>
            </div>
          </div>

          <div className="dark-list-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Buscar operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-select-all"
                onClick={handleSelectAll}
                title="Selecionar todos"
              >
                ✅ Todos
              </button>
              <button 
                className="btn btn-clear-all"
                onClick={handleClearAll}
                title="Limpar seleção"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>

          <div className="operators-list">
            <div className="list-header">
              <span className="operator-name">Nome do Operador</span>
              <span className="operator-status">Status</span>
            </div>
            
            <div className="operators-scroll">
              {filteredOperators.map((operator, index) => {
                const isExcluded = selectedOperators.has(operator)
                return (
                  <div 
                    key={`${operator}-${index}`}
                    className={`operator-item ${isExcluded ? 'excluded' : 'active'}`}
                    onClick={() => handleOperatorToggle(operator)}
                  >
                    <span className="operator-name">
                      {operator}
                    </span>
                    <span className={`operator-status ${isExcluded ? 'excluded' : 'active'}`}>
                      {isExcluded ? '❌ Excluído' : '✅ Ativo'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="dark-list-footer">
            <div className="info-text">
              💡 <strong>Dica:</strong> Operadores excluídos não aparecerão nas análises e rankings.
            </div>
            <button 
              className="btn btn-primary"
              onClick={onToggle}
            >
              ✅ Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DarkListManager
