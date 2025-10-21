import React from 'react'
import './ProgressBar.css'

const ProgressBar = ({ 
  progress = 0, 
  total = 100, 
  current = 0, 
  message = '', 
  showDetails = true,
  color = 'primary',
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, progress))
  
  const getColorClass = () => {
    switch (color) {
      case 'success': return 'progress-success'
      case 'warning': return 'progress-warning'
      case 'error': return 'progress-error'
      case 'info': return 'progress-info'
      default: return 'progress-primary'
    }
  }
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'progress-sm'
      case 'lg': return 'progress-lg'
      case 'xl': return 'progress-xl'
      default: return 'progress-md'
    }
  }

  return (
    <div className={`progress-container ${getSizeClass()}`}>
      {/* Header com informações */}
      <div className="progress-header">
        <div className="progress-title">
          <span className="progress-icon">🔄</span>
          <span className="progress-label">Processando Dados</span>
        </div>
        <div className="progress-percentage">{percentage.toFixed(1)}%</div>
      </div>
      
      {/* Barra de progresso */}
      <div className="progress-bar-container">
        <div 
          className={`progress-bar ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Detalhes do progresso */}
      {showDetails && (
        <div className="progress-details">
          <div className="progress-stats">
            <span className="progress-current">{current.toLocaleString()}</span>
            <span className="progress-separator">de</span>
            <span className="progress-total">{total.toLocaleString()}</span>
            <span className="progress-unit">registros</span>
          </div>
          
          {message && (
            <div className="progress-message">
              <span className="progress-message-icon">📊</span>
              <span className="progress-message-text">{message}</span>
            </div>
          )}
          
          {/* Estimativa de tempo */}
          {percentage > 0 && percentage < 100 && (
            <div className="progress-eta">
              <span className="progress-eta-icon">⏱️</span>
              <span className="progress-eta-text">
                Tempo estimado: {Math.round((100 - percentage) * 0.1)}s restantes
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Indicador de velocidade */}
      {percentage > 10 && (
        <div className="progress-speed">
          <span className="progress-speed-icon">⚡</span>
          <span className="progress-speed-text">
            Velocidade: {Math.round((current / (performance.now() / 1000)) * 100) / 100} registros/s
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
