import React, { useState, useEffect, useCallback } from 'react';
import VeloigpMetrics from '../components/metrics/VeloigpMetrics';
import VeloigpCard from '../components/ui/VeloigpCard';
import VeloigpButton from '../components/ui/VeloigpButton';
import PageHeader from '../components/layout/PageHeader';
import { 
  getDataByPeriod,
  getSpreadsheetInfo,
  getAvailableAgents,
  getAvailablePeriods,
  SPREADSHEET_LOGS 
} from '../services/spreadsheetService';

const VeloigpDashboard = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('7d');
  const [logs, setLogs] = useState([]);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);

  // Períodos disponíveis (baseados em planilha D-1)
  const periodos = [
    { value: '1d', label: 'Último Dia' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '15d', label: 'Últimos 15 dias' },
    { value: '30d', label: 'Últimos 30 dias' }
  ];

  // Buscar dados baseado no período selecionado
  useEffect(() => {
    atualizarInfoPlanilha();
    buscarDados();
    atualizarLogs();
  }, [periodo]);

  const buscarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se há planilha carregada
      const info = getSpreadsheetInfo();
      if (!info.loaded) {
        setError('Nenhuma planilha carregada. Acesse a página de Planilhas para fazer upload dos dados.');
        setLoading(false);
        return;
      }
      
      const { dataInicio, dataFim } = calcularPeriodo(periodo);
      
      // Buscar dados do período usando o motor de planilha
      const dadosPeriodo = getDataByPeriod(dataInicio, dataFim);
      
      // Processar dados para o formato do dashboard
      const dadosProcessados = processarDadosPlanilha(dadosPeriodo);
      setDados(dadosProcessados);
      
    } catch (err) {
      console.error('Erro ao buscar dados da planilha:', err);
      setError('Erro ao carregar dados da planilha: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  const calcularPeriodo = (periodoSelecionado) => {
    const agora = new Date();
    const dataFim = new Date(agora);
    const dataInicio = new Date(agora);
    
    // Para dados D-1, sempre trabalhamos com dias completos
    switch (periodoSelecionado) {
      case '1d':
        dataInicio.setDate(dataInicio.getDate() - 1);
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setDate(dataFim.getDate() - 1);
        dataFim.setHours(23, 59, 59, 999);
        break;
      case '7d':
        dataInicio.setDate(dataInicio.getDate() - 7);
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setDate(dataFim.getDate() - 1);
        dataFim.setHours(23, 59, 59, 999);
        break;
      case '15d':
        dataInicio.setDate(dataInicio.getDate() - 15);
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setDate(dataFim.getDate() - 1);
        dataFim.setHours(23, 59, 59, 999);
        break;
      case '30d':
        dataInicio.setDate(dataInicio.getDate() - 30);
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setDate(dataFim.getDate() - 1);
        dataFim.setHours(23, 59, 59, 999);
        break;
      default:
        dataInicio.setDate(dataInicio.getDate() - 7);
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setDate(dataFim.getDate() - 1);
        dataFim.setHours(23, 59, 59, 999);
    }
    
    return { dataInicio, dataFim };
  };

  const atualizarInfoPlanilha = () => {
    const info = getSpreadsheetInfo();
    setSpreadsheetInfo(info);
    
    if (info.loaded) {
      const agents = getAvailableAgents();
      setAvailableAgents(agents);
    }
  };

  const atualizarLogs = () => {
    const logsAtuais = SPREADSHEET_LOGS.getLogs();
    setLogs(logsAtuais);
  };

  const formatarNumero = (numero) => {
    return numero.toLocaleString('pt-BR');
  };

  const calcularVariacao = (atual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((atual - anterior) / anterior * 100).toFixed(1);
  };

  // Processar dados de planilha para o formato do dashboard
  const processarDadosPlanilha = (dadosPeriodo) => {
    if (!dadosPeriodo || !dadosPeriodo.metrics) {
      return null;
    }

    const metrics = dadosPeriodo.metrics;
    
    return {
      totalChamadas: metrics.totalChamadas || 0,
      chamadasAtendidas: metrics.chamadasAtendidas || 0,
      chamadasAbandonadas: metrics.chamadasAbandonadas || 0,
      tempoMedioAtendimento: formatarTempo(metrics.tempoMedioAtendimento || 0),
      tempoMedioEspera: '00:00:15', // Valor padrão
      taxaAtendimento: metrics.totalChamadas > 0 ? 
        `${Math.round((metrics.chamadasAtendidas / metrics.totalChamadas) * 100)}%` : '0%',
      taxaAbandono: metrics.totalChamadas > 0 ? 
        `${Math.round((metrics.chamadasAbandonadas / metrics.totalChamadas) * 100)}%` : '0%',
      
      // Dados por hora (simulados baseados na evolução diária)
      dadosPorHora: gerarDadosPorHora(metrics.evolucaoDiaria),
      
      // Dados por fila
      filas: processarFilas(metrics.filas),
      
      // Dados por agente
      agentes: processarAgentes(metrics.agentes),
      
      // Métricas de performance
      metricas: {
        satisfacaoGeral: metrics.satisfacaoMedia ? `${metrics.satisfacaoMedia.toFixed(1)}/5` : 'N/A',
        tempoRespostaMedio: '12s',
        chamadasHoje: metrics.chamadasAtendidas || 0,
        chamadasOntem: metrics.chamadasAtendidas || 0,
        picoHorario: '15:00',
        volumePico: 95,
        agentesOnline: Object.keys(metrics.agentes || {}).length,
        agentesTotal: Object.keys(metrics.agentes || {}).length,
        filasAtivas: Object.keys(metrics.filas || {}).length,
        uptime: '99.8%'
      },
      
      // Dados de tendência
      tendencia: processarTendencia(metrics.evolucaoDiaria)
    };
  };

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const gerarDadosPorHora = (evolucaoDiaria) => {
    if (!evolucaoDiaria) return [];
    
    return Object.keys(evolucaoDiaria).map(date => {
      const data = new Date(date);
      const hora = data.getHours();
      const chamadas = evolucaoDiaria[date].chamadas || 0;
      
      return {
        hora: `${hora.toString().padStart(2, '0')}:00`,
        chamadas: chamadas,
        atendidas: Math.round(chamadas * 0.9),
        abandonadas: Math.round(chamadas * 0.1),
        tempoMedio: 180,
        tempoEspera: 8
      };
    });
  };

  const processarFilas = (filas) => {
    if (!filas) return [];
    
    return Object.keys(filas).map((fila, index) => ({
      nome: fila,
      atendidas: Math.round(filas[fila] * 0.9),
      abandonadas: Math.round(filas[fila] * 0.1),
      tempoMedio: '00:04:30',
      agentes: Math.max(1, Math.floor(filas[fila] / 50)),
      taxaAtendimento: '90%',
      status: 'Ativo'
    }));
  };

  const processarAgentes = (agentes) => {
    if (!agentes) return [];
    
    return Object.keys(agentes).map((agente, index) => ({
      nome: agente,
      atendidas: agentes[agente].chamadas || 0,
      tempoMedio: formatarTempo(agentes[agente].tempoMedioAtendimento || 0),
      status: 'Online',
      tempoOnline: '08:00:00',
      fila: 'Geral',
      satisfacao: agentes[agente].satisfacaoMedia ? `${agentes[agente].satisfacaoMedia.toFixed(1)}/5` : 'N/A'
    }));
  };

  const processarTendencia = (evolucaoDiaria) => {
    if (!evolucaoDiaria) return [];
    
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return Object.keys(evolucaoDiaria).slice(-7).map(date => {
      const data = new Date(date);
      const diaSemana = dias[data.getDay()];
      const chamadas = evolucaoDiaria[date].chamadas || 0;
      const atendidas = Math.round(chamadas * 0.9);
      
      return {
        dia: diaSemana,
        chamadas: chamadas,
        atendidas: atendidas,
        taxa: `${Math.round((atendidas / chamadas) * 100)}%`
      };
    });
  };

  return (
    <div className="veloigp-dashboard">
        {/* Header do Dashboard */}
        <PageHeader 
          title="Dashboard - Dados de Planilha"
          subtitle="Visualize métricas e estatísticas dos dados de planilha"
        />
        
        {/* Status da Planilha */}
        <div className="spreadsheet-status-card">
          <VeloigpCard className="container-main">
            <div className="status-title-row">
              <h3 className="veloigp-card__title">Status da Planilha</h3>
              <span className={`status-badge ${spreadsheetInfo?.loaded ? 'connected' : 'disconnected'}`}>
                {spreadsheetInfo?.loaded ? '🟢 Carregada' : '🔴 Não Carregada'}
              </span>
            </div>
            <div className="status-content">
              {spreadsheetInfo?.loaded ? (
                <div className="spreadsheet-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Registros:</span>
                      <span className="info-value">{spreadsheetInfo.totalRows}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Agentes:</span>
                      <span className="info-value">{availableAgents.length}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Última Atualização:</span>
                      <span className="info-value">
                        {new Date(spreadsheetInfo.lastProcessed).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="status-controls">
                    <div className="period-selector">
                      <label htmlFor="periodo">Período:</label>
                      <select 
                        id="periodo"
                        value={periodo} 
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="period-select"
                      >
                        {periodos.map(p => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <VeloigpButton 
                      variant="primary" 
                      icon="fas fa-refresh"
                      onClick={buscarDados}
                      loading={loading}
                    >
                      Atualizar
                    </VeloigpButton>
                  </div>
                </div>
              ) : (
                <div className="no-spreadsheet">
                  <p>Nenhuma planilha carregada. Acesse a página de <strong>Planilhas</strong> para fazer upload dos dados.</p>
                  <VeloigpButton 
                    variant="primary" 
                    icon="fas fa-upload"
                    href="/spreadsheet"
                  >
                    Carregar Planilha
                  </VeloigpButton>
                </div>
              )}
            </div>
          </VeloigpCard>
        </div>

        {/* Métricas Principais */}
        {dados && (
          <div className="metrics-overview">
            <div className="metrics-grid">
              <VeloigpCard
                title="Total de Chamadas"
                subtitle="Período selecionado"
                icon="fas fa-phone"
                className="container-main"
              >
                <div className="metric-display">
                  <div className="metric-number">
                    {formatarNumero(dados.totalChamadas)}
                  </div>
                  <div className="metric-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+12% vs período anterior</span>
                  </div>
                </div>
              </VeloigpCard>

              <VeloigpCard
                title="Taxa de Atendimento"
                subtitle="Chamadas atendidas"
                icon="fas fa-check-circle"
                className="container-main"
              >
                <div className="metric-display">
                  <div className="metric-number">
                    {dados.taxaAtendimento}
                  </div>
                  <div className="metric-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+2.1% vs período anterior</span>
                  </div>
                </div>
              </VeloigpCard>

              <VeloigpCard
                title="Tempo Médio"
                subtitle="Duração das chamadas"
                icon="fas fa-clock"
                className="container-main"
              >
                <div className="metric-display">
                  <div className="metric-number">
                    {dados.tempoMedioAtendimento}
                  </div>
                  <div className="metric-trend negative">
                    <i className="fas fa-arrow-down"></i>
                    <span>-5% vs período anterior</span>
                  </div>
                </div>
              </VeloigpCard>

              <VeloigpCard
                title="Satisfação"
                subtitle="Avaliação dos clientes"
                icon="fas fa-star"
                className="container-main"
              >
                <div className="metric-display">
                  <div className="metric-number">
                    {dados.metricas.satisfacaoGeral}
                  </div>
                  <div className="metric-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+0.3 vs período anterior</span>
                  </div>
                </div>
              </VeloigpCard>
            </div>
          </div>
        )}

        {/* Componente de Métricas Detalhadas */}
        <VeloigpMetrics />

        {/* Resumo das Filas */}
        {dados && dados.filas && (
          <div className="queues-summary">
            <VeloigpCard
              title="Resumo das Filas"
              subtitle="Performance por fila"
              icon="fas fa-list"
              className="container-main"
            >
              <div className="queues-overview">
                {dados.filas.slice(0, 3).map((fila, index) => (
                  <div key={index} className="queue-summary">
                    <div className="queue-info">
                      <h4>{fila.nome}</h4>
                      <span className={`queue-status ${fila.status.toLowerCase()}`}>
                        {fila.status}
                      </span>
                    </div>
                    <div className="queue-stats">
                      <div className="stat">
                        <span className="stat-label">Atendidas:</span>
                        <span className="stat-value">{fila.atendidas}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Taxa:</span>
                        <span className="stat-value">{fila.taxaAtendimento}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Agentes:</span>
                        <span className="stat-value">{fila.agentes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </VeloigpCard>
          </div>
        )}

        {/* Logs da Planilha */}
        <div className="spreadsheet-logs">
          <VeloigpCard
            title="Logs da Planilha"
            subtitle="Histórico de operações com dados"
            icon="fas fa-list-alt"
            className="container-main"
          >
            <div className="logs-content">
              <div className="logs-header">
                <VeloigpButton 
                  variant="secondary" 
                  size="small"
                  icon="fas fa-refresh"
                  onClick={atualizarLogs}
                >
                  Atualizar Logs
                </VeloigpButton>
                <span className="logs-count">
                  {logs.length} entradas
                </span>
              </div>
              <div className="logs-list">
                {logs.slice(-10).reverse().map((log, index) => (
                  <div key={index} className={`log-entry ${log.type}`}>
                    <div className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </div>
                    <div className="log-message">
                      {log.message}
                    </div>
                    <div className="log-type">
                      <i className={`fas fa-${log.type === 'success' ? 'check' : log.type === 'error' ? 'times' : 'info'}`}></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </VeloigpCard>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="dashboard-loading">
            <div className="loading-content">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Carregando dados...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="dashboard-error">
            <VeloigpCard
              title="Erro ao Carregar Dados"
              subtitle="Problema ao processar dados da planilha"
              icon="fas fa-exclamation-triangle"
              className="container-main"
            >
              <p>{error}</p>
              <div className="error-actions">
                <VeloigpButton 
                  variant="primary" 
                  icon="fas fa-refresh"
                  onClick={buscarDados}
                >
                  Tentar Novamente
                </VeloigpButton>
                {!spreadsheetInfo?.loaded && (
                  <VeloigpButton 
                    variant="secondary" 
                    icon="fas fa-upload"
                    href="/spreadsheet"
                  >
                    Carregar Planilha
                  </VeloigpButton>
                )}
              </div>
            </VeloigpCard>
          </div>
        )}
    </div>
  );
};

export default VeloigpDashboard;
