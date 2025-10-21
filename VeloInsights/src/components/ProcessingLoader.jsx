import React from 'react'
import './ProcessingLoader.css'

const ProcessingLoader = ({ progress = 0, currentRecord = 0, totalRecords = 0, isVisible = false }) => {
  if (!isVisible) return null

  const percentage = Math.round(progress)
  const processedRecords = Math.round((progress / 100) * totalRecords)

  return (
    <div className="processing-loader-overlay">
      <div className="processing-loader-container">
        <div className="processing-loader-header">
          <div className="processing-icon">⚡</div>
          <h2>Processando TODOS OS REGISTROS</h2>
          <p>Carregando histórico completo da planilha...</p>
        </div>
        
        <div className="processing-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="progress-info">
            <div className="progress-percentage">
              {percentage}%
            </div>
            <div className="progress-details">
              <span className="processed-count">{processedRecords.toLocaleString()}</span>
              <span className="separator">de</span>
              <span className="total-count">{totalRecords.toLocaleString()}</span>
              <span className="records-label">registros</span>
            </div>
          </div>
        </div>
        
        <div className="processing-stats">
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-label">Total de Registros</span>
            <span className="stat-value">{totalRecords.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <span className="stat-label">Processados</span>
            <span className="stat-value">{processedRecords.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-label">Restantes</span>
            <span className="stat-value">{(totalRecords - processedRecords).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="processing-message">
          <p>Por favor, aguarde enquanto processamos todos os dados históricos...</p>
          <p className="processing-note">Este processo pode levar alguns minutos devido ao volume de dados.</p>
        </div>
      </div>
    </div>
  )
}

export default ProcessingLoader
