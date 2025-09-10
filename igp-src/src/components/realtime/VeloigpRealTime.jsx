import React, { useState, useEffect, useRef } from 'react';
import VeloigpCard from '../ui/VeloigpCard';
import VeloigpButton from '../ui/VeloigpButton';
import PageHeader from '../layout/PageHeader';
import { fetchRealTimeData, processarDadosAPI } from '../../services/api55pbx-veloigp';
import './VeloigpRealTime.css';

const VeloigpRealTime = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalo, setIntervalo] = useState(30); // segundos
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [historico, setHistorico] = useState([]);
  const intervalRef = useRef(null);

  // Intervalos disponíveis
  const intervalos = [
    { value: 10, label: '10 segundos' },
    { value: 30, label: '30 segundos' },
    { value: 60, label: '1 minuto' },
    { value: 300, label: '5 minutos' }
  ];

  // Buscar dados iniciais
  useEffect(() => {
    buscarDados();
  }, []);

  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(buscarDados, intervalo * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, intervalo]);

  const buscarDados = async () => {
    try {
      setError(null);
      
      const response = await fetchRealTimeData();
      const dadosProcessados = processarDadosAPI(response);
      
      setDados(dadosProcessados);
      setUltimaAtualizacao(new Date());
      
      // Adicionar ao histórico
      setHistorico(prev => {
        const novoHistorico = [...prev, {
          timestamp: new Date(),
          dados: dadosProcessados
        }];
        
        // Manter apenas os últimos 20 registros
        return novoHistorico.slice(-20);
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar dados em tempo real:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatarTempo = (data) => {
    return data.toLocaleTimeString('pt-BR');
  };

  const formatarNumero = (numero) => {
    return numero.toLocaleString('pt-BR');
  };

  const calcularVariacao = (atual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((atual - anterior) / anterior * 100).toFixed(1);
  };

  const obterVariacaoChamadas = () => {
    if (historico.length < 2) return 0;
    const atual = dados?.totalChamadas || 0;
    const anterior = historico[historico.length - 2]?.dados?.totalChamadas || 0;
    return calcularVariacao(atual, anterior);
  };

  const obterVariacaoAtendidas = () => {
    if (historico.length < 2) return 0;
    const atual = dados?.chamadasAtendidas || 0;
    const anterior = historico[historico.length - 2]?.dados?.chamadasAtendidas || 0;
    return calcularVariacao(atual, anterior);
  };

  if (loading && !dados) {
    return (
      <div className="veloigp-realtime">
        <div className="realtime-loading">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Conectando ao sistema em tempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-background">
      <div className="container-main">
        <PageHeader 
          title="Monitoramento em Tempo Real"
          subtitle="Acompanhe as métricas do sistema 55PBX ao vivo"
        />
      </div>
      <div className="realtime-header">
        <div className="header-controls">
          <div className="refresh-controls">
            <div className="interval-selector">
              <label htmlFor="intervalo">Intervalo:</label>
              <select 
                id="intervalo"
                value={intervalo} 
                onChange={(e) => setIntervalo(Number(e.target.value))}
                className="interval-select"
                disabled={!autoRefresh}
              >
                {intervalos.map(interval => (
                  <option key={interval.value} value={interval.value}>
                    {interval.label}
                  </option>
                ))}
              </select>
            </div>
            <VeloigpButton
              variant={autoRefresh ? 'success' : 'secondary'}
              icon={autoRefresh ? 'fas fa-pause' : 'fas fa-play'}
              onClick={toggleAutoRefresh}
            >
              {autoRefresh ? 'Pausar' : 'Iniciar'} Auto-refresh
            </VeloigpButton>
            <VeloigpButton
              variant="primary"
              icon="fas fa-refresh"
              onClick={buscarDados}
              loading={loading}
            >
              Atualizar Agora
            </VeloigpButton>
          </div>
        </div>
      </div>

      {/* Status de conexão */}
      <div className="connection-status">
        <VeloigpCard className="container-main">
          <div className="status-single-line">
            {/* Título + Indicador de status */}
            <div className="status-title-section">
              <h3 className="status-title">Status da Conexão</h3>
              <div className="status-indicator">
                <div className={`status-dot ${autoRefresh ? 'active' : 'paused'}`}></div>
                <span className="status-text">
                  {autoRefresh ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>

            {/* Container centralizado para os subcontainers */}
            <div className="status-containers-center">
              <div className="status-item">
                <span className="status-label">Intervalo</span>
                <span className="status-value">{intervalo}s</span>
              </div>
              <div className="status-item">
                <span className="status-label">Última</span>
                <span className="status-value">
                  {ultimaAtualizacao ? formatarTempo(ultimaAtualizacao) : 'Nunca'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Registros</span>
                <span className="status-value">{historico.length}</span>
              </div>
            </div>
          </div>
        </VeloigpCard>
      </div>

      {/* Métricas em tempo real */}
      {dados && (
        <div className="realtime-metrics">
          <div className="metrics-grid">
            <VeloigpCard
              title="Chamadas Totais"
              subtitle="Últimas 24 horas"
              icon="fas fa-phone"
              className="container-main"
              variant="accent"
            >
              <div className="metric-display">
                <div className="metric-number">
                  {formatarNumero(dados.totalChamadas)}
                </div>
                <div className={`metric-trend ${obterVariacaoChamadas() >= 0 ? 'positive' : 'negative'}`}>
                  <i className={`fas fa-arrow-${obterVariacaoChamadas() >= 0 ? 'up' : 'down'}`}></i>
                  <span>{Math.abs(obterVariacaoChamadas())}% vs anterior</span>
                </div>
              </div>
            </VeloigpCard>

            <VeloigpCard
              title="Chamadas Atendidas"
              subtitle="Taxa de atendimento"
              icon="fas fa-check-circle"
              className="container-main"
              variant="success"
            >
              <div className="metric-display">
                <div className="metric-number">
                  {formatarNumero(dados.chamadasAtendidas)}
                </div>
                <div className="metric-percentage">
                  {dados.taxaAtendimento}
                </div>
                <div className={`metric-trend ${obterVariacaoAtendidas() >= 0 ? 'positive' : 'negative'}`}>
                  <i className={`fas fa-arrow-${obterVariacaoAtendidas() >= 0 ? 'up' : 'down'}`}></i>
                  <span>{Math.abs(obterVariacaoAtendidas())}% vs anterior</span>
                </div>
              </div>
            </VeloigpCard>

            <VeloigpCard
              title="Tempo Médio"
              subtitle="Duração das chamadas"
              icon="fas fa-clock"
              className="container-main"
              variant="info"
            >
              <div className="metric-display">
                <div className="metric-number">
                  {dados.tempoMedioAtendimento}
                </div>
                <div className="metric-trend positive">
                  <i className="fas fa-arrow-down"></i>
                  <span>-5% vs anterior</span>
                </div>
              </div>
            </VeloigpCard>

            <VeloigpCard
              title="Satisfação"
              subtitle="Avaliação dos clientes"
              icon="fas fa-star"
              className="container-main"
              variant="warning"
            >
              <div className="metric-display">
                <div className="metric-number">
                  {dados.metricas.satisfacaoGeral}
                </div>
                <div className="metric-trend positive">
                  <i className="fas fa-arrow-up"></i>
                  <span>+0.2 vs anterior</span>
                </div>
              </div>
            </VeloigpCard>
          </div>
        </div>
      )}

      {/* Gráfico de tendência */}
      {historico.length > 1 && (
        <VeloigpCard
          title="Tendência de Chamadas"
          subtitle="Últimas atualizações"
          icon="fas fa-chart-line"
          className="container-main"
        >
          <div className="trend-chart">
            <div className="chart-container">
              {historico.slice(-10).map((registro, index) => {
                const maxChamadas = Math.max(...historico.slice(-10).map(h => h.dados.totalChamadas));
                const altura = (registro.dados.totalChamadas / maxChamadas) * 100;
                
                return (
                  <div key={index} className="trend-bar">
                    <div 
                      className="bar"
                      style={{ height: `${altura}%` }}
                      title={`${formatarTempo(registro.timestamp)}: ${registro.dados.totalChamadas} chamadas`}
                    ></div>
                    <div className="bar-label">
                      {formatarTempo(registro.timestamp).split(':').slice(0, 2).join(':')}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <span>Chamadas totais por período</span>
            </div>
          </div>
        </VeloigpCard>
      )}

      {/* Status dos agentes */}
      {dados && dados.agentes && (
        <VeloigpCard
          title="Status dos Agentes"
          subtitle="Monitoramento em tempo real"
          icon="fas fa-users"
          className="container-main"
        >
          <div className="agents-grid">
            {dados.agentes.map((agente, index) => (
              <div key={index} className="agent-status">
                <div className="agent-info">
                  <div className="agent-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="agent-details">
                    <h4>{agente.nome}</h4>
                    <p>{agente.fila}</p>
                  </div>
                </div>
                <div className="agent-metrics">
                  <div className="agent-metric">
                    <span className="metric-label">Atendidas:</span>
                    <span className="metric-value">{agente.atendidas}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="metric-label">Tempo:</span>
                    <span className="metric-value">{agente.tempoMedio}</span>
                  </div>
                </div>
                <div className="agent-status-badge">
                  <span className={`status-badge ${agente.status.toLowerCase()}`}>
                    {agente.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </VeloigpCard>
      )}

      {/* Error State */}
      {error && (
        <VeloigpCard
          title="Erro no Monitoramento"
          subtitle="Não foi possível obter dados"
          icon="fas fa-exclamation-triangle"
          className="container-main"
          variant="danger"
        >
          <p>{error}</p>
          <VeloigpButton
            variant="primary"
            icon="fas fa-refresh"
            onClick={buscarDados}
          >
            Tentar Novamente
          </VeloigpButton>
        </VeloigpCard>
      )}
    </div>
  );
};

export default VeloigpRealTime;
