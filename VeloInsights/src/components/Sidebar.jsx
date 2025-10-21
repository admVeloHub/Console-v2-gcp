import React from 'react'
import './Sidebar.css'

const Sidebar = ({ open, currentView, onViewChange, hasData, onClearData, viewMode, onViewModeChange, selectedOperator, onOperatorSelect, operatorMetrics, onShowPreferences, onClose, selectedCargo }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Principal',
      icon: '📊',
      description: 'Métricas gerais e ranking',
      disabled: !hasData
    },
    {
      id: 'charts',
      label: 'Gráficos Detalhados',
      icon: '📈',
      description: 'Análise visual completa',
      disabled: !hasData
    },
    {
      id: 'new-sheet',
      label: 'Análise de Ticket por Operador',
      icon: '📋',
      description: 'Análise de tickets por operador',
      disabled: false
    },
    // Só mostrar "Visualizar por Agente" se não for OPERADOR
    ...(selectedCargo !== 'OPERADOR' ? [{
      id: 'agents',
      label: 'Visualizar por Agente',
      icon: '👤',
      description: 'Métricas de tempo por operador',
      disabled: !hasData
    }] : [])
  ]

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  onViewChange(item.id)
                  onClose() // Fechar o sidebar após selecionar
                }
              }}
              disabled={item.disabled}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>
        
        {/* Seletor de Operador */}
        {currentView === 'operators' && operatorMetrics && operatorMetrics.length > 0 && (
          <div className="operator-selector">
            <h4>👤 Selecionar Operador</h4>
            <select 
              value={selectedOperator || ''} 
              onChange={(e) => onOperatorSelect(e.target.value)}
              className="operator-select"
            >
              <option value="">Todos os Operadores</option>
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
        )}
        
        <div className="sidebar-footer">
          <button 
            className="preferences-button"
            onClick={() => {
              onShowPreferences()
              onClose() // Fechar o sidebar após clicar
            }}
            title="Gerenciar Preferências"
          >
            ⚙️ Preferências
          </button>
          
          {hasData && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => {
                onClearData()
                onClose() // Fechar o sidebar após clicar
              }}
            >
              🗑️ Limpar Dados
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
