import React, { useState, useEffect } from 'react'
import './ProgressIndicator.css'

const ProgressIndicator = ({ progress, onCancel }) => {
  const percentage = ((progress.current / progress.total) * 100).toFixed(1)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)

  // Atualizar tempo decorrido e estimativa
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      
      // Calcular tempo estimado baseado no progresso
      if (parseFloat(percentage) > 0) {
        const estimated = Math.floor((elapsed / parseFloat(percentage)) * 100) - elapsed
        setEstimatedTime(Math.max(0, estimated))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, percentage])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressStage = () => {
    if (percentage < 20) return { stage: 'Lendo arquivo...', icon: '📁' }
    if (percentage < 40) return { stage: 'Processando dados...', icon: '⚙️' }
    if (percentage < 60) return { stage: 'Validando registros...', icon: '✅' }
    if (percentage < 80) return { stage: 'Calculando métricas...', icon: '📊' }
    if (percentage < 95) return { stage: 'Gerando ranking...', icon: '🏆' }
    return { stage: 'Finalizando...', icon: '🎉' }
  }

  const currentStage = getProgressStage()

  return (
    <div className="progress-overlay animate-fade-in">
      <div className="progress-container animate-scale-in">
        <div className="progress-header">
          <div className="progress-title">
            <span className="progress-icon">{currentStage.icon}</span>
            <h3>Processando Arquivo</h3>
          </div>
          <button 
            className="btn btn-danger btn-sm hover-scale"
            onClick={onCancel}
          >
            ✕ Cancelar
          </button>
        </div>
        
        <div className="progress-content">
          {/* Etapa atual */}
          <div className="progress-stage animate-fade-in animate-delay-1">
            <div className="stage-info">
              <span className="stage-icon">{currentStage.icon}</span>
              <span className="stage-text">{currentStage.stage}</span>
            </div>
            <div className="stage-message">{progress.message}</div>
          </div>
          
          {/* Barra de progresso principal */}
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill animate-progress"
                style={{ width: `${percentage}%` }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
            <div className="progress-percentage">{percentage}%</div>
          </div>
          
          {/* Detalhes do progresso */}
          <div className="progress-details animate-fade-in animate-delay-2">
            <div className="detail-row">
              <span className="detail-label">Progresso:</span>
              <span className="detail-value">{progress.current} de {progress.total}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tempo decorrido:</span>
              <span className="detail-value">{formatTime(elapsedTime)}</span>
            </div>
            {estimatedTime > 0 && (
              <div className="detail-row">
                <span className="detail-label">Tempo estimado:</span>
                <span className="detail-value">{formatTime(estimatedTime)}</span>
              </div>
            )}
          </div>

          {/* Indicador de atividade */}
          <div className="progress-activity">
            <div className="activity-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <span className="activity-text">Processando...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressIndicator
