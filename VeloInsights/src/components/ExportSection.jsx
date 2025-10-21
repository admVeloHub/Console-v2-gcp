import React from 'react'
import './ExportSection.css'

const ExportSection = ({ data, metrics, operatorMetrics }) => {
  const handleExportExcel = async () => {
    alert('🚧 Funcionalidade em desenvolvimento - Em breve!')
  }

  const handleExportPDF = async () => {
    alert('🚧 Funcionalidade em desenvolvimento - Em breve!')
  }

  const handleExportCSV = () => {
    alert('🚧 Funcionalidade em desenvolvimento - Em breve!')
  }

  if (!data || data.length === 0) {
    return (
      <div className="export-section">
        <div className="card">
          <h2>📤 Exportação</h2>
          <p>Nenhum dado disponível para exportar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="export-section">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📤 Exportação de Dados</h2>
          <p className="card-subtitle">
            Exporte os dados processados em diferentes formatos
          </p>
        </div>
        
        <div className="export-options">
          <div className="export-card">
            <div className="export-icon">📊</div>
            <h3>Excel (XLSX)</h3>
            <p>Arquivo Excel com múltiplas planilhas contendo dados brutos, resumo e métricas por operador</p>
            <button 
              className="btn btn-primary"
              onClick={handleExportExcel}
              data-status="coming-soon"
            >
              🚧 Em breve
            </button>
          </div>
          
          <div className="export-card">
            <div className="export-icon">📄</div>
            <h3>PDF</h3>
            <p>Relatório em PDF com dashboard completo incluindo gráficos e métricas</p>
            <button 
              className="btn btn-secondary"
              onClick={handleExportPDF}
              data-status="coming-soon"
            >
              🚧 Em breve
            </button>
          </div>
          
          <div className="export-card">
            <div className="export-icon">📋</div>
            <h3>CSV</h3>
            <p>Arquivo CSV com dados processados para análise em outras ferramentas</p>
            <button 
              className="btn btn-success"
              onClick={handleExportCSV}
              data-status="coming-soon"
            >
              🚧 Em breve
            </button>
          </div>
        </div>
        
        <div className="export-info">
          <h4>ℹ️ Informações sobre Exportação:</h4>
          <ul>
            <li><strong>Excel:</strong> 🚧 Em desenvolvimento - Múltiplas planilhas com dados brutos, resumo e métricas por operador</li>
            <li><strong>PDF:</strong> 🚧 Em desenvolvimento - Relatório visual do dashboard com gráficos e métricas</li>
            <li><strong>CSV:</strong> 🚧 Em desenvolvimento - Dados tabulares processados, compatível com Excel e outras ferramentas</li>
            <li>📅 <strong>Previsão:</strong> Funcionalidades serão implementadas nas próximas versões</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExportSection
