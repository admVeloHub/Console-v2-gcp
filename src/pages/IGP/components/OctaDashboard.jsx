import React, { useEffect } from 'react'
import { useOctaData } from '../hooks/useOctaData'
import './OctaDashboard.css'

const OctaDashboard = ({ selectedPeriod, onPeriodChange }) => {
  const {
    octaData,
    octaMetrics,
    isLoading,
    error,
    isAuthenticated,
    fetchDataByPeriod
  } = useOctaData()

  // Buscar dados quando o período mudar
  useEffect(() => {
    if (selectedPeriod && !isLoading) {
      fetchDataByPeriod(selectedPeriod)
    }
  }, [selectedPeriod, fetchDataByPeriod, isLoading])

  if (isLoading) {
    return (
      <div className="octa-dashboard">
        <div className="octa-header">
          <h2>🎫 OCTA</h2>
        </div>
        <div className="octa-loading">
          <div className="loading-spinner"></div>
          <p>Conectando com a planilha OCTA...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="octa-dashboard">
        <div className="octa-header">
          <h2>🎫 OCTA</h2>
        </div>
        <div className="octa-error">
          <p>❌ {error}</p>
          <button onClick={() => fetchDataByPeriod(selectedPeriod || 'all')}>
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="octa-dashboard">
        <div className="octa-header">
          <h2>🎫 OCTA</h2>
        </div>
        <div className="octa-auth-required">
          <p>🔐 Autenticação necessária para acessar dados OCTA</p>
        </div>
      </div>
    )
  }

  return (
    <div className="octa-dashboard">
      <div className="octa-header">
        <h2>🎫 OCTA</h2>
        <div className="octa-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">Dados de tickets e avaliações</span>
        </div>
      </div>

      <div className="octa-metrics">
        <div className="metric-card primary">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">Total de Tickets</div>
            <div className="metric-value">{octaMetrics.totalTickets || 0}</div>
          </div>
        </div>

        <div className="metric-card performance">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-label">Performance Geral</div>
            <div className="metric-value">{octaMetrics.porcentagemGeral || '0%'}</div>
          </div>
        </div>

        <div className="metric-card evaluated">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-label">Tickets Avaliados</div>
            <div className="metric-value">{octaMetrics.totalAvaliados || 0}</div>
          </div>
        </div>
      </div>

      <div className="octa-evaluations">
        <div className="evaluation-section good">
          <h3>👍 Avaliações Boas</h3>
          <div className="evaluation-metrics">
            <div className="evaluation-item">
              <span className="evaluation-label">Bom</span>
              <span className="evaluation-value">{octaMetrics.bomSemComentario || 0}</span>
            </div>
            <div className="evaluation-item">
              <span className="evaluation-label">Bom com comentário</span>
              <span className="evaluation-value">{octaMetrics.bomComComentario || 0}</span>
            </div>
          </div>
        </div>

        <div className="evaluation-section bad">
          <h3>👎 Avaliações Ruins</h3>
          <div className="evaluation-metrics">
            <div className="evaluation-item">
              <span className="evaluation-label">Ruim</span>
              <span className="evaluation-value">{octaMetrics.ruimSemComentario || 0}</span>
            </div>
            <div className="evaluation-item">
              <span className="evaluation-label">Ruim com comentário</span>
              <span className="evaluation-value">{octaMetrics.ruimComComentario || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="octa-summary">
        <div className="summary-item">
          <span className="summary-label">Período:</span>
          <span className="summary-value">
            {selectedPeriod === 'all' ? 'Todos os dados' : 
             selectedPeriod === '15' ? 'Últimos 15 dias' :
             selectedPeriod === '30' ? 'Últimos 30 dias' :
             selectedPeriod === '90' ? 'Últimos 90 dias' :
             'Período personalizado'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Operadores:</span>
          <span className="summary-value">{octaMetrics.operadores?.length || 0}</span>
        </div>
      </div>
    </div>
  )
}

export default OctaDashboard
