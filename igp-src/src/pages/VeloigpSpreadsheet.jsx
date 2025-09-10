import React, { useState, useRef } from 'react';
import VeloigpCard from '../components/ui/VeloigpCard';
import VeloigpButton from '../components/ui/VeloigpButton';
import PageHeader from '../components/layout/PageHeader';
import ComparativeCharts from '../components/charts/ComparativeCharts';
import { 
  readSpreadsheetFile, 
  getSpreadsheetInfo, 
  getAvailableAgents,
  getAvailablePeriods,
  clearSpreadsheetData,
  SPREADSHEET_LOGS 
} from '../services/spreadsheetService';
import './VeloigpSpreadsheet.css';

const VeloigpSpreadsheet = () => {
  const [spreadsheetInfo, setSpreadsheetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  // Atualizar informações da planilha
  const updateSpreadsheetInfo = () => {
    const info = getSpreadsheetInfo();
    setSpreadsheetInfo(info);
  };

  // Atualizar logs
  const updateLogs = () => {
    setLogs(SPREADSHEET_LOGS.getLogs());
  };

  // Carregar arquivo da planilha
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      await readSpreadsheetFile(file);
      updateSpreadsheetInfo();
      updateLogs();
      
      // Mudar para aba de análise se carregou com sucesso
      setActiveTab('analysis');
      
    } catch (err) {
      setError(`Erro ao carregar planilha: ${err.message}`);
      console.error('Erro ao carregar planilha:', err);
    } finally {
      setLoading(false);
    }
  };

  // Limpar dados da planilha
  const handleClearData = () => {
    clearSpreadsheetData();
    updateSpreadsheetInfo();
    updateLogs();
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Renderizar aba de upload
  const renderUploadTab = () => (
    <div className="veloigp-spreadsheet__upload">
      <VeloigpCard 
        title="Carregar Planilha" 
        subtitle="Faça upload da planilha de dados"
        className="container-main"
      >
        <div className="veloigp-spreadsheet__upload-area">
          <div className="veloigp-spreadsheet__upload-icon">
            📁
          </div>
          <h3>Arraste e solte sua planilha aqui</h3>
          <p>ou clique para selecionar um arquivo</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <VeloigpButton
            variant="primary"
            icon="fas fa-upload"
            onClick={() => fileInputRef.current?.click()}
            loading={loading}
          >
            Selecionar Arquivo
          </VeloigpButton>
          
          <div className="veloigp-spreadsheet__supported-formats">
            <p>Formatos suportados: .xlsx, .xls, .csv</p>
          </div>
        </div>
      </VeloigpCard>

      {error && (
        <VeloigpCard title="❌ Erro" subtitle="Problema ao carregar a planilha" className="container-main">
          <div className="veloigp-spreadsheet__error">
            <p>{error}</p>
            <VeloigpButton
              variant="secondary"
              icon="fas fa-retry"
              onClick={() => setError(null)}
            >
              Tentar Novamente
            </VeloigpButton>
          </div>
        </VeloigpCard>
      )}
    </div>
  );

  // Renderizar aba de informações
  const renderInfoTab = () => (
    <div className="veloigp-spreadsheet__info">
      <VeloigpCard 
        title="Informações da Planilha" 
        subtitle="Detalhes sobre os dados carregados"
        className="container-main"
      >
        {spreadsheetInfo?.loaded ? (
          <div className="veloigp-spreadsheet__info-content">
            <div className="veloigp-spreadsheet__info-grid">
              <div className="veloigp-spreadsheet__info-item">
                <span className="veloigp-spreadsheet__info-label">Total de Registros:</span>
                <span className="veloigp-spreadsheet__info-value">{spreadsheetInfo.totalRows}</span>
              </div>
              
              <div className="veloigp-spreadsheet__info-item">
                <span className="veloigp-spreadsheet__info-label">Última Atualização:</span>
                <span className="veloigp-spreadsheet__info-value">
                  {new Date(spreadsheetInfo.lastProcessed).toLocaleString('pt-BR')}
                </span>
              </div>
              
              <div className="veloigp-spreadsheet__info-item">
                <span className="veloigp-spreadsheet__info-label">Agentes Disponíveis:</span>
                <span className="veloigp-spreadsheet__info-value">
                  {getAvailableAgents().length}
                </span>
              </div>
              
              <div className="veloigp-spreadsheet__info-item">
                <span className="veloigp-spreadsheet__info-label">Período dos Dados:</span>
                <span className="veloigp-spreadsheet__info-value">
                  {(() => {
                    const periods = getAvailablePeriods();
                    if (periods) {
                      return `${periods.start.toLocaleDateString('pt-BR')} - ${periods.end.toLocaleDateString('pt-BR')}`;
                    }
                    return 'N/A';
                  })()}
                </span>
              </div>
            </div>
            
            <div className="veloigp-spreadsheet__columns">
              <h4>Colunas Mapeadas:</h4>
              <div className="veloigp-spreadsheet__columns-grid">
                {Object.entries(spreadsheetInfo.columns).map(([key, index]) => (
                  <div key={key} className="veloigp-spreadsheet__column">
                    <span className="veloigp-spreadsheet__column-name">{key}</span>
                    <span className="veloigp-spreadsheet__column-index">
                      {index !== -1 ? `Coluna ${index + 1}` : 'Não encontrada'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="veloigp-spreadsheet__agents">
              <h4>Agentes Disponíveis:</h4>
              <div className="veloigp-spreadsheet__agents-list">
                {getAvailableAgents().map(agent => (
                  <span key={agent} className="veloigp-spreadsheet__agent-tag">
                    {agent}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="veloigp-spreadsheet__no-data">
            <p>Nenhuma planilha carregada</p>
          </div>
        )}
      </VeloigpCard>
    </div>
  );

  // Renderizar aba de análise
  const renderAnalysisTab = () => (
    <div className="veloigp-spreadsheet__analysis">
      <ComparativeCharts />
    </div>
  );

  // Renderizar aba de logs
  const renderLogsTab = () => (
    <div className="veloigp-spreadsheet__logs">
      <VeloigpCard 
        title="📝 Logs do Sistema" 
        subtitle="Histórico de operações com a planilha"
        className="container-main"
      >
        <div className="veloigp-spreadsheet__logs-controls">
          <VeloigpButton
            variant="secondary"
            icon="fas fa-refresh"
            onClick={updateLogs}
          >
            Atualizar Logs
          </VeloigpButton>
          
          <VeloigpButton
            variant="secondary"
            icon="fas fa-trash"
            onClick={() => {
              SPREADSHEET_LOGS.clearLogs();
              updateLogs();
            }}
          >
            Limpar Logs
          </VeloigpButton>
        </div>
        
        <div className="veloigp-spreadsheet__logs-content">
          {logs.length === 0 ? (
            <p>Nenhum log disponível</p>
          ) : (
            <div className="veloigp-spreadsheet__logs-list">
              {logs.map((log, index) => (
                <div key={index} className={`veloigp-spreadsheet__log veloigp-spreadsheet__log--${log.type}`}>
                  <div className="veloigp-spreadsheet__log-header">
                    <span className="veloigp-spreadsheet__log-time">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                    <span className={`veloigp-spreadsheet__log-type veloigp-spreadsheet__log-type--${log.type}`}>
                      {log.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="veloigp-spreadsheet__log-message">
                    {log.message}
                  </div>
                  {log.data && (
                    <div className="veloigp-spreadsheet__log-data">
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </VeloigpCard>
    </div>
  );

  return (
    <div className="dashboard-background">
      <div className="container-main">
        <PageHeader 
          title="Análise de Planilhas"
          subtitle="Carregue e analise dados de planilhas com gráficos comparativos"
        />
      </div>

        <div className="veloigp-spreadsheet__tabs">
          <button
            className={`veloigp-spreadsheet__tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📁 Carregar Planilha
          </button>
          
          <button
            className={`veloigp-spreadsheet__tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            disabled={!spreadsheetInfo?.loaded}
          >
            📋 Informações
          </button>
          
          <button
            className={`veloigp-spreadsheet__tab ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
            disabled={!spreadsheetInfo?.loaded}
          >
            📊 Análise & Gráficos
          </button>
          
          <button
            className={`veloigp-spreadsheet__tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📝 Logs
          </button>
        </div>

        <div className="veloigp-spreadsheet__content">
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'info' && renderInfoTab()}
          {activeTab === 'analysis' && renderAnalysisTab()}
          {activeTab === 'logs' && renderLogsTab()}
        </div>

        {spreadsheetInfo?.loaded && (
          <div className="veloigp-spreadsheet__actions">
            <VeloigpButton
              variant="secondary"
              icon="fas fa-trash"
              onClick={handleClearData}
            >
              Limpar Dados
            </VeloigpButton>
          </div>
        )}
    </div>
  );
};

export default VeloigpSpreadsheet;
