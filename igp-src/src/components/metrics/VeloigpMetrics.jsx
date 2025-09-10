import React, { useState, useEffect } from 'react';
import VeloigpCard from '../ui/VeloigpCard';
import VeloigpButton from '../ui/VeloigpButton';
import { 
  fetchRealTimeData, 
  processarDadosAPI, 
  getVeloigpLogs,
  testarConexaoAPI 
} from '../../services/api55pbx-veloigp';
import './VeloigpMetrics.css';

const VeloigpMetrics = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [statusAPI, setStatusAPI] = useState(null);

  // Buscar dados iniciais
  useEffect(() => {
    buscarDados();
    testarConexao();
  }, []);

  const buscarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchRealTimeData();
      const dadosProcessados = processarDadosAPI(response);
      
      setDados(dadosProcessados);
      setUltimaAtualizacao(new Date());
      
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const testarConexao = async () => {
    try {
      const resultado = await testarConexaoAPI();
      setStatusAPI(resultado);
    } catch (err) {
      setStatusAPI({
        connected: false,
        error: err.message,
        message: 'Erro ao testar conexão'
      });
    }
  };

  const formatarTempo = (tempo) => {
    if (typeof tempo === 'string') return tempo;
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  const formatarNumero = (numero) => {
    return numero.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="veloigp-metrics">
        <div className="metrics-loading">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="veloigp-metrics">
        <VeloigpCard
          title="Erro ao Carregar Dados"
          subtitle="Não foi possível conectar com a API"
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
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="veloigp-metrics">
        <VeloigpCard
          title="Nenhum Dado Disponível"
          subtitle="Não há dados para exibir"
          icon="fas fa-info-circle"
          className="container-main"
        >
          <VeloigpButton 
            variant="primary" 
            icon="fas fa-refresh"
            onClick={buscarDados}
          >
            Buscar Dados
          </VeloigpButton>
        </VeloigpCard>
      </div>
    );
  }

  return (
    <div className="veloigp-metrics">
      {/* Header com status da API */}
      <div className="metrics-header">
        <div className="header-info">
          <h1>Dashboard de Métricas</h1>
        </div>
        <div className="header-actions">
          <div className={`api-status ${statusAPI?.connected ? 'connected' : 'disconnected'}`}>
            <i className={`fas fa-circle ${statusAPI?.connected ? 'connected' : 'disconnected'}`}></i>
            <span>{statusAPI?.connected ? 'API Conectada' : 'API Desconectada'}</span>
          </div>
          <VeloigpButton 
            variant="secondary" 
            size="small"
            icon="fas fa-refresh"
            onClick={buscarDados}
            loading={loading}
          >
            Atualizar
          </VeloigpButton>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="metrics-grid">
        <VeloigpCard
          title="Total de Chamadas"
          subtitle="Últimas 24 horas"
          icon="fas fa-phone"
          className="container-main"
          variant="accent"
        >
          <div className="metric-value">
            {formatarNumero(dados.totalChamadas)}
          </div>
          <div className="metric-trend">
            <i className="fas fa-arrow-up"></i>
            <span>+12% vs ontem</span>
          </div>
        </VeloigpCard>

        <VeloigpCard
          title="Chamadas Atendidas"
          subtitle="Taxa de atendimento"
          icon="fas fa-check-circle"
          className="container-main"
          variant="success"
        >
          <div className="metric-value">
            {formatarNumero(dados.chamadasAtendidas)}
          </div>
          <div className="metric-percentage">
            {dados.taxaAtendimento}
          </div>
        </VeloigpCard>

        <VeloigpCard
          title="Chamadas Abandonadas"
          subtitle="Taxa de abandono"
          icon="fas fa-times-circle"
          className="container-main"
          variant="danger"
        >
          <div className="metric-value">
            {formatarNumero(dados.chamadasAbandonadas)}
          </div>
          <div className="metric-percentage">
            {dados.taxaAbandono}
          </div>
        </VeloigpCard>

        <VeloigpCard
          title="Tempo Médio de Atendimento"
          subtitle="Duração média das chamadas"
          icon="fas fa-clock"
          className="container-main"
          variant="info"
        >
          <div className="metric-value">
            {dados.tempoMedioAtendimento}
          </div>
          <div className="metric-trend">
            <i className="fas fa-arrow-down"></i>
            <span>-5% vs ontem</span>
          </div>
        </VeloigpCard>

        <VeloigpCard
          title="Tempo Médio de Espera"
          subtitle="Tempo na fila"
          icon="fas fa-hourglass-half"
          className="container-main"
          variant="warning"
        >
          <div className="metric-value">
            {dados.tempoMedioEspera}
          </div>
          <div className="metric-trend">
            <i className="fas fa-arrow-down"></i>
            <span>-8% vs ontem</span>
          </div>
        </VeloigpCard>

        <VeloigpCard
          title="Satisfação Geral"
          subtitle="Avaliação dos clientes"
          icon="fas fa-star"
          className="container-main"
          variant="accent"
        >
          <div className="metric-value">
            {dados.metricas.satisfacaoGeral}
          </div>
          <div className="metric-trend">
            <i className="fas fa-arrow-up"></i>
            <span>+0.2 vs ontem</span>
          </div>
        </VeloigpCard>
      </div>

      {/* Gráfico de chamadas por hora */}
      <VeloigpCard
        title="Chamadas por Hora"
        subtitle="Últimas 24 horas"
        icon="fas fa-chart-line"
        className="container-main"
      >
        <div className="hourly-chart">
          {dados.dadosPorHora && dados.dadosPorHora.length > 0 ? dados.dadosPorHora.map((hora, index) => (
            <div key={index} className="hour-bar">
              <div className="bar-container">
                <div 
                  className="bar attended" 
                  style={{ height: `${(hora.atendidas / 100) * 100}%` }}
                  title={`Atendidas: ${hora.atendidas}`}
                ></div>
                <div 
                  className="bar abandoned" 
                  style={{ height: `${(hora.abandonadas / 100) * 100}%` }}
                  title={`Abandonadas: ${hora.abandonadas}`}
                ></div>
              </div>
              <div className="hour-label">{hora.hora}</div>
            </div>
          )) : (
            <div className="no-data">
              <p>Nenhum dado disponível para o gráfico</p>
            </div>
          )}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color attended"></div>
            <span>Atendidas</span>
          </div>
          <div className="legend-item">
            <div className="legend-color abandoned"></div>
            <span>Abandonadas</span>
          </div>
        </div>
      </VeloigpCard>

      {/* Filas */}
      <VeloigpCard
        title="Performance das Filas"
        subtitle="Status atual das filas"
        icon="fas fa-list"
        className="container-main"
      >
        <div className="queues-grid">
          {dados.filas && dados.filas.length > 0 ? dados.filas.map((fila, index) => (
            <div key={index} className="queue-item">
              <div className="queue-header">
                <h4>{fila.nome}</h4>
                <span className={`queue-status ${fila.status.toLowerCase()}`}>
                  {fila.status}
                </span>
              </div>
              <div className="queue-metrics">
                <div className="queue-metric">
                  <span className="metric-label">Atendidas:</span>
                  <span className="metric-value">{fila.atendidas}</span>
                </div>
                <div className="queue-metric">
                  <span className="metric-label">Abandonadas:</span>
                  <span className="metric-value">{fila.abandonadas}</span>
                </div>
                <div className="queue-metric">
                  <span className="metric-label">Taxa:</span>
                  <span className="metric-value">{fila.taxaAtendimento}</span>
                </div>
                <div className="queue-metric">
                  <span className="metric-label">Agentes:</span>
                  <span className="metric-value">{fila.agentes}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="no-data">
              <p>Nenhuma fila disponível</p>
            </div>
          )}
        </div>
      </VeloigpCard>

      {/* Agentes */}
      <VeloigpCard
        title="Performance dos Agentes"
        subtitle="Status e métricas dos agentes"
        icon="fas fa-users"
        className="container-main"
      >
        <div className="agents-table">
          <div className="table-header">
            <div className="header-cell">Agente</div>
            <div className="header-cell">Fila</div>
            <div className="header-cell">Atendidas</div>
            <div className="header-cell">Tempo Médio</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Satisfação</div>
          </div>
          {dados.agentes.map((agente, index) => (
            <div key={index} className="table-row">
              <div className="table-cell">
                <div className="agent-info">
                  <div className="agent-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <span>{agente.nome}</span>
                </div>
              </div>
              <div className="table-cell">{agente.fila}</div>
              <div className="table-cell">{agente.atendidas}</div>
              <div className="table-cell">{agente.tempoMedio}</div>
              <div className="table-cell">
                <span className={`status-badge ${agente.status.toLowerCase()}`}>
                  {agente.status}
                </span>
              </div>
              <div className="table-cell">{agente.satisfacao}</div>
            </div>
          ))}
        </div>
      </VeloigpCard>

      {/* Informações de atualização */}
      {ultimaAtualizacao && (
        <div className="update-info">
          <p>
            <i className="fas fa-clock"></i>
            Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default VeloigpMetrics;
