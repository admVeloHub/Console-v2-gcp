import React from 'react'
import './Header.css'

const Header = ({ onToggleSidebar, sidebarOpen, theme, onToggleTheme, currentView, onViewChange, hasData, onOpenPeriodModal, currentPeriod }) => {
  return (
    <>
      <header className="header">
        <div className="logo-section">
          <div className="logo">VELOINSIGHTS</div>
        </div>

        {/* Botão Seletor de Período - CENTRO */}
        {hasData && onOpenPeriodModal && (
          <div className="period-selector" onClick={onOpenPeriodModal}>
            <i className='bx bx-calendar'></i>
            <div className="period-text">
              <strong>{currentPeriod || 'Últimos 15 dias'}</strong>
            </div>
          </div>
        )}
        
        <div className="header-actions">
          {/* Botão de tema removido */}
        </div>
      </header>

      {/* Tabs de Navegação - Abaixo do Header */}
      {hasData && (
        <nav className="header-nav">
          <button
            className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            <i className='bx bxs-dashboard'></i>
            Dashboard
          </button>
          <button
            className={`nav-tab ${currentView === 'charts' ? 'active' : ''}`}
            onClick={() => onViewChange('charts')}
          >
            <i className='bx bxs-bar-chart-alt-2'></i>
            Gráficos
          </button>
          <button
            className={`nav-tab ${currentView === 'agents' ? 'active' : ''}`}
            onClick={() => onViewChange('agents')}
          >
            <i className='bx bxs-user-account'></i>
            Operadores
          </button>
        </nav>
      )}
    </>
  )
}

export default Header
