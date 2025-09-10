import React, { useState, useEffect } from 'react';
import VeloigpCard from '../components/ui/VeloigpCard';
import VeloigpButton from '../components/ui/VeloigpButton';
import PageHeader from '../components/layout/PageHeader';
import { 
  fetchReport01, 
  fetchReport02, 
  fetchReport03, 
  fetchReport04,
  getVeloigpLogs 
} from '../services/api55pbx-veloigp';
import './VeloigpReports.css';

const VeloigpReports = () => {
  const [activeReport, setActiveReport] = useState('report01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [apiLogs, setApiLogs] = useState([]);

  // Períodos disponíveis
  const periods = [
    { value: '1h', label: 'Última Hora' },
    { value: '24h', label: 'Últimas 24 Horas' },
    { value: '7d', label: 'Últimos 7 Dias' },
    { value: '30d', label: 'Últimos 30 Dias' }
  ];

  // Relatórios disponíveis
  const reports = [
    { id: 'report01', name: 'Report 01', title: 'Métricas Principais', icon: '', description: 'Dados gerais do sistema' },
    { id: 'report02', name: 'Report 02', title: 'Dados por Hora', icon: '', description: 'Análise temporal detalhada' },
    { id: 'report03', name: 'Report 03', title: 'Dados de Agentes', icon: '', description: 'Performance dos agentes' },
    { id: 'report04', name: 'Report 04', title: 'Dados de Filas', icon: '', description: 'Status das filas de atendimento' }
  ];

  // Calcular datas baseado no período selecionado
  const getDateRange = (period) => {
    const now = new Date();
    const dataFim = new Date(now);
    
    let dataInicio = new Date(now);
    
    switch (period) {
      case '1h':
        dataInicio.setHours(now.getHours() - 1);
        break;
      case '24h':
        dataInicio.setDate(now.getDate() - 1);
        break;
      case '7d':
        dataInicio.setDate(now.getDate() - 7);
        break;
      case '30d':
        dataInicio.setDate(now.getDate() - 30);
        break;
      default:
        dataInicio.setDate(now.getDate() - 1);
    }
    
    return { dataInicio, dataFim };
  };

  // Buscar dados do relatório
  const fetchReportData = async (reportId, period) => {
    setLoading(true);
    setError(null);
    
    try {
      const { dataInicio, dataFim } = getDateRange(period);
      let data = null;
      
      switch (reportId) {
        case 'report01':
          data = await fetchReport01(dataInicio, dataFim);
          break;
        case 'report02':
          data = await fetchReport02(dataInicio, dataFim);
          break;
        case 'report03':
          data = await fetchReport03(dataInicio, dataFim);
          break;
        case 'report04':
          data = await fetchReport04(dataInicio, dataFim);
          break;
        default:
          throw new Error('Relatório não encontrado');
      }
      
      setReportData(prev => ({
        ...prev,
        [reportId]: data
      }));
      
    } catch (err) {
      setError(`Erro ao buscar dados do ${reportId}: ${err.message}`);
      console.error('Erro ao buscar relatório:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o relatório ou período mudar
  useEffect(() => {
    if (activeReport) {
      fetchReportData(activeReport, selectedPeriod);
    }
  }, [activeReport, selectedPeriod]);

  // Atualizar logs da API
  useEffect(() => {
    const updateLogs = () => {
      setApiLogs(getVeloigpLogs());
    };
    
    updateLogs();
    const interval = setInterval(updateLogs, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Renderizar dados do relatório
  const renderReportData = (data) => {
    if (!data) {
      return (
        <div className="veloigp-reports__no-data">
          <p>Nenhum dado disponível para este período.</p>
        </div>
      );
    }

    return (
      <div className="veloigp-reports__data">
        <div className="veloigp-reports__metrics">
          {data.metricas && Object.entries(data.metricas).map(([key, value]) => (
            <div key={key} className="veloigp-reports__metric">
              <span className="veloigp-reports__metric-label">{key}:</span>
              <span className="veloigp-reports__metric-value">{value}</span>
            </div>
          ))}
        </div>
        
        {data.dados && data.dados.length > 0 && (
          <div className="veloigp-reports__table">
            <h4>Dados Detalhados</h4>
            <table>
              <thead>
                <tr>
                  {Object.keys(data.dados[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.dados.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-background">
      <div className="container-main">
        <PageHeader 
          title="Relatórios 55PBX"
          subtitle="Gere relatórios personalizados e análises avançadas dos dados"
        />
      </div>

        <div className="veloigp-reports__controls">
          <div className="veloigp-reports__period-selector">
            <label>Período:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="veloigp-reports__navigation">
            {reports.map(report => (
              <VeloigpButton
                key={report.id}
                variant={activeReport === report.id ? 'primary' : 'secondary'}
                onClick={() => setActiveReport(report.id)}
              >
                {report.title}
              </VeloigpButton>
            ))}
          </div>
          
          <VeloigpButton
            variant="primary"
            icon="fas fa-refresh"
            onClick={() => fetchReportData(activeReport, selectedPeriod)}
            loading={loading}
          >
            Atualizar
          </VeloigpButton>
        </div>

        <div className="veloigp-reports__content">
          {reports.map(report => (
            <div 
              key={report.id}
              className={`veloigp-reports__report ${activeReport === report.id ? 'active' : ''}`}
            >
              <VeloigpCard
                title={report.title}
                subtitle={report.description}
                className="container-main"
              >
                {loading && activeReport === report.id ? (
                  <div className="veloigp-reports__loading">
                    <div className="spinner"></div>
                    <p>Carregando dados...</p>
                  </div>
                ) : error && activeReport === report.id ? (
                  <div className="veloigp-reports__error">
                    <p>❌ {error}</p>
                    <VeloigpButton
                      variant="secondary"
                      icon="fas fa-retry"
                      onClick={() => fetchReportData(activeReport, selectedPeriod)}
                    >
                      Tentar Novamente
                    </VeloigpButton>
                  </div>
                ) : (
                  renderReportData(reportData[report.id])
                )}
              </VeloigpCard>
            </div>
          ))}
        </div>

        <div className="veloigp-reports__logs">
          <VeloigpCard title="📝 Logs da API" subtitle="Últimas interações com a API 55PBX" className="container-main">
            <div className="veloigp-reports__logs-content">
              {apiLogs.length === 0 ? (
                <p>Nenhum log disponível</p>
              ) : (
                <div className="veloigp-reports__logs-list">
                  {apiLogs.slice(-10).map((log, index) => (
                    <div key={index} className={`veloigp-reports__log veloigp-reports__log--${log.type}`}>
                      <span className="veloigp-reports__log-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="veloigp-reports__log-message">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </VeloigpCard>
        </div>
    </div>
  );
};

export default VeloigpReports;

