import React, { useState } from 'react'

const PeriodSelector = ({ onPeriodSelect, isLoading, selectedPeriod }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!startDate || !endDate) {
      alert('Por favor, selecione ambas as datas')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('A data inicial não pode ser maior que a data final')
      return
    }

    onPeriodSelect(startDate, endDate)
  }

  const handleQuickSelect = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    
    onPeriodSelect(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  return (
    <div className="period-selector">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📅 Selecionar Período</h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="period-form">
            <div className="form-group">
              <label htmlFor="startDate">Data Inicial:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">Data Final:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '🔄 Processando...' : '🔍 Buscar Dados'}
              </button>
            </div>
          </form>

          <div className="quick-select">
            <h3>Seleção Rápida:</h3>
            <div className="quick-buttons">
              <button 
                onClick={() => handleQuickSelect(7)}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                Últimos 7 dias
              </button>
              <button 
                onClick={() => handleQuickSelect(30)}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                Últimos 30 dias
              </button>
              <button 
                onClick={() => handleQuickSelect(90)}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                Últimos 90 dias
              </button>
            </div>
          </div>

          {selectedPeriod && (
            <div className="selected-period">
              <h3>Período Selecionado:</h3>
              <p>
                📅 {new Date(selectedPeriod.startDate).toLocaleDateString('pt-BR')} até{' '}
                {new Date(selectedPeriod.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .period-selector {
          margin-bottom: 2rem;
        }

        .period-form {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #B0B0B0;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #404040;
          border-radius: 8px;
          background: #1a1a1a;
          color: #FFFFFF;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #1634FF;
          box-shadow: 0 0 0 2px rgba(22, 52, 255, 0.2);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          align-items: center;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #1634FF;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0f2cc7;
        }

        .btn-secondary {
          background: #404040;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #505050;
        }

        .quick-select {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #404040;
        }

        .quick-select h3 {
          margin-bottom: 1rem;
          color: #B0B0B0;
        }

        .quick-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .selected-period {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(22, 52, 255, 0.1);
          border: 1px solid #1634FF;
          border-radius: 8px;
        }

        .selected-period h3 {
          margin-bottom: 0.5rem;
          color: #1634FF;
        }

        .selected-period p {
          margin: 0;
          color: #B0B0B0;
        }

        @media (max-width: 768px) {
          .period-form {
            grid-template-columns: 1fr;
          }
          
          .quick-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default PeriodSelector