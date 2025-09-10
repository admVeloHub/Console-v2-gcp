import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import VeloigpCard from '../ui/VeloigpCard';
import VeloigpButton from '../ui/VeloigpButton';
import { 
  getDataByPeriod, 
  getDataByAgent,
  getAvailableAgents,
  getAvailablePeriods,
  SPREADSHEET_LOGS 
} from '../../services/spreadsheetService';
import './ComparativeCharts.css';

const ComparativeCharts = () => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('10d');
  const [lastDayData, setLastDayData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [logs, setLogs] = useState([]);

  // Períodos disponíveis
  const periods = [
    { value: '7d', label: 'Últimos 7 Dias' },
    { value: '10d', label: 'Últimos 10 Dias' },
    { value: '15d', label: 'Últimos 15 Dias' },
    { value: '30d', label: 'Últimos 30 Dias' }
  ];

  // Cores para gráficos
  const colors = {
    lastDay: '#3B82F6',      // Azul
    period: '#10B981',       // Verde
    primary: '#8B5CF6',      // Roxo
    secondary: '#F59E0B',    // Amarelo
    danger: '#EF4444',       // Vermelho
    success: '#059669'       // Verde escuro
  };

  // Carregar agentes disponíveis
  useEffect(() => {
    console.log('🔄 Carregando agentes disponíveis...');
    const agents = getAvailableAgents();
    console.log('👥 Agentes encontrados:', agents);
    setAvailableAgents(agents);
    if (agents.length > 0 && !selectedAgent) {
      console.log('✅ Selecionando primeiro agente:', agents[0]);
      setSelectedAgent(agents[0]);
    } else if (agents.length === 0) {
      console.log('⚠️ Nenhum agente encontrado na planilha');
    }
  }, []);

  // Atualizar logs
  useEffect(() => {
    const updateLogs = () => {
      setLogs(SPREADSHEET_LOGS.getLogs());
    };
    
    updateLogs();
    const interval = setInterval(updateLogs, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Calcular datas
  const getDateRange = (period) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date(now);
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '10d':
        startDate.setDate(now.getDate() - 10);
        break;
      case '15d':
        startDate.setDate(now.getDate() - 15);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 10);
    }
    
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
  };

  // Buscar dados comparativos
  const fetchComparativeData = async () => {
    if (!selectedAgent) {
      console.log('❌ Nenhum agente selecionado');
      return;
    }
    
    console.log('🔍 Buscando dados para agente:', selectedAgent);
    setLoading(true);
    setError(null);
    
    try {
      // Dados do último dia
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      console.log('📅 Buscando dados do último dia:', yesterday.toISOString(), 'até', today.toISOString());
      const lastDayResult = getDataByAgent(selectedAgent, yesterday, today);
      console.log('📊 Dados do último dia:', lastDayResult);
      setLastDayData(lastDayResult);
      
      // Dados do período selecionado
      const { startDate, endDate } = getDateRange(selectedPeriod);
      console.log('📅 Buscando dados do período:', startDate.toISOString(), 'até', endDate.toISOString());
      const periodResult = getDataByAgent(selectedAgent, startDate, endDate);
      console.log('📊 Dados do período:', periodResult);
      setPeriodData(periodResult);
      
    } catch (err) {
      console.error('❌ Erro ao buscar dados comparativos:', err);
      setError(`Erro ao buscar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando agente ou período mudar
  useEffect(() => {
    if (selectedAgent) {
      fetchComparativeData();
    }
  }, [selectedAgent, selectedPeriod]);

  // Preparar dados para gráfico de barras comparativo
  const prepareBarChartData = () => {
    if (!lastDayData || !periodData) return [];
    
    const lastDayMetrics = lastDayData.metrics;
    const periodMetrics = periodData.metrics;
    
    return [
      {
        name: 'Total Chamadas',
        'Último Dia': lastDayMetrics.totalChamadas || 0,
        'Período': Math.round((periodMetrics.totalChamadas || 0) / getPeriodDays()),
        fill: colors.primary
      },
      {
        name: 'Chamadas Atendidas',
        'Último Dia': lastDayMetrics.chamadasAtendidas || 0,
        'Período': Math.round((periodMetrics.chamadasAtendidas || 0) / getPeriodDays()),
        fill: colors.success
      },
      {
        name: 'Chamadas Abandonadas',
        'Último Dia': lastDayMetrics.chamadasAbandonadas || 0,
        'Período': Math.round((periodMetrics.chamadasAbandonadas || 0) / getPeriodDays()),
        fill: colors.danger
      },
      {
        name: 'Tempo Médio (min)',
        'Último Dia': Math.round((lastDayMetrics.tempoMedioAtendimento || 0) / 60),
        'Período': Math.round((periodMetrics.tempoMedioAtendimento || 0) / 60),
        fill: colors.secondary
      }
    ];
  };

  // Preparar dados para gráfico de linha (evolução)
  const prepareLineChartData = () => {
    if (!periodData || !periodData.metrics.evolucaoDiaria) return [];
    
    const evolucao = periodData.metrics.evolucaoDiaria;
    
    return Object.keys(evolucao)
      .sort()
      .map(date => ({
        data: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        chamadas: evolucao[date].chamadas,
        duracao: Math.round(evolucao[date].duracao / 60) // Converter para minutos
      }));
  };

  // Preparar dados para gráfico de pizza (status)
  const preparePieChartData = () => {
    if (!lastDayData) return [];
    
    const status = lastDayData.metrics.status || {};
    
    return Object.keys(status).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: status[key],
      fill: getStatusColor(key)
    }));
  };

  // Preparar dados para gráfico de filas
  const prepareQueueChartData = () => {
    if (!periodData) return [];
    
    const filas = periodData.metrics.filas || {};
    
    return Object.keys(filas).map(fila => ({
      fila: fila,
      chamadas: filas[fila],
      fill: getQueueColor(fila)
    }));
  };

  // Funções auxiliares
  const getPeriodDays = () => {
    switch (selectedPeriod) {
      case '7d': return 7;
      case '10d': return 10;
      case '15d': return 15;
      case '30d': return 30;
      default: return 10;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('atend') || statusLower.includes('success')) return colors.success;
    if (statusLower.includes('abandon') || statusLower.includes('lost')) return colors.danger;
    if (statusLower.includes('pendente') || statusLower.includes('waiting')) return colors.secondary;
    return colors.primary;
  };

  const getQueueColor = (fila) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const index = fila.length % colors.length;
    return colors[index];
  };

  // Renderizar métricas resumidas
  const renderSummaryMetrics = () => {
    if (!lastDayData || !periodData) return null;
    
    const lastDay = lastDayData.metrics;
    const period = periodData.metrics;
    
    return (
      <div className="comparative-charts__summary">
        <div className="comparative-charts__metric">
          <div className="comparative-charts__metric-header">
            <span className="comparative-charts__metric-label">Total Chamadas</span>
            <span className="comparative-charts__metric-trend">
              {lastDay.totalChamadas > (period.totalChamadas / getPeriodDays()) ? '📈' : '📉'}
            </span>
          </div>
          <div className="comparative-charts__metric-values">
            <span className="comparative-charts__metric-lastday">{lastDay.totalChamadas || 0}</span>
            <span className="comparative-charts__metric-period">
              {Math.round((period.totalChamadas || 0) / getPeriodDays())} (média)
            </span>
          </div>
        </div>
        
        <div className="comparative-charts__metric">
          <div className="comparative-charts__metric-header">
            <span className="comparative-charts__metric-label">Taxa de Atendimento</span>
            <span className="comparative-charts__metric-trend">
              {lastDay.chamadasAtendidas > (period.chamadasAtendidas / getPeriodDays()) ? '📈' : '📉'}
            </span>
          </div>
          <div className="comparative-charts__metric-values">
            <span className="comparative-charts__metric-lastday">
              {lastDay.totalChamadas > 0 ? Math.round((lastDay.chamadasAtendidas / lastDay.totalChamadas) * 100) : 0}%
            </span>
            <span className="comparative-charts__metric-period">
              {period.totalChamadas > 0 ? Math.round((period.chamadasAtendidas / period.totalChamadas) * 100) : 0}% (média)
            </span>
          </div>
        </div>
        
        <div className="comparative-charts__metric">
          <div className="comparative-charts__metric-header">
            <span className="comparative-charts__metric-label">Satisfação Média</span>
            <span className="comparative-charts__metric-trend">
              {lastDay.satisfacaoMedia > period.satisfacaoMedia ? '📈' : '📉'}
            </span>
          </div>
          <div className="comparative-charts__metric-values">
            <span className="comparative-charts__metric-lastday">
              {lastDay.satisfacaoMedia ? lastDay.satisfacaoMedia.toFixed(1) : 'N/A'}
            </span>
            <span className="comparative-charts__metric-period">
              {period.satisfacaoMedia ? period.satisfacaoMedia.toFixed(1) : 'N/A'} (média)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="comparative-charts">
      <div className="comparative-charts__header">
        <h2>📊 Gráficos Comparativos</h2>
        <p>Comparação entre último dia e período selecionado</p>
      </div>

      <div className="comparative-charts__controls">
        <div className="comparative-charts__control-group">
          <label>Agente:</label>
          <select 
            value={selectedAgent} 
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={loading}
          >
            <option value="">Selecione um agente</option>
            {availableAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
        
        <div className="comparative-charts__control-group">
          <label>Período:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled={loading}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
        
        <VeloigpButton
          variant="primary"
          icon="fas fa-refresh"
          onClick={fetchComparativeData}
          loading={loading}
        >
          Atualizar
        </VeloigpButton>
      </div>

      {error && (
        <div className="comparative-charts__error">
          <p>❌ {error}</p>
        </div>
      )}

      {loading && (
        <div className="comparative-charts__loading">
          <div className="spinner"></div>
          <p>Carregando dados comparativos...</p>
        </div>
      )}

      {!loading && !error && lastDayData && periodData && (
        <>
          {/* Métricas Resumidas */}
          <VeloigpCard title="📈 Resumo Comparativo" subtitle={`${selectedAgent} - Último dia vs ${selectedPeriod}`}>
            {renderSummaryMetrics()}
          </VeloigpCard>

          {/* Gráfico de Barras Comparativo */}
          <VeloigpCard title="📊 Comparativo de Métricas" subtitle="Último dia vs Média do período">
            <div className="comparative-charts__chart">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={prepareBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Último Dia" fill={colors.lastDay} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Período" fill={colors.period} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </VeloigpCard>

          {/* Gráfico de Linha - Evolução */}
          <VeloigpCard title="📈 Evolução Diária" subtitle="Chamadas e duração ao longo do período">
            <div className="comparative-charts__chart">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={prepareLineChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="data" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="chamadas" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="duracao" 
                    stroke={colors.secondary} 
                    strokeWidth={3}
                    dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </VeloigpCard>

          <div className="comparative-charts__row">
            {/* Gráfico de Pizza - Status */}
            <VeloigpCard title="🥧 Status das Chamadas" subtitle="Distribuição por status (último dia)">
              <div className="comparative-charts__chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={preparePieChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </VeloigpCard>

            {/* Gráfico de Filas */}
            <VeloigpCard title="📋 Distribuição por Filas" subtitle="Chamadas por fila (período)">
              <div className="comparative-charts__chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareQueueChartData()} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#64748B" />
                    <YAxis dataKey="fila" type="category" stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="chamadas" fill={colors.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </VeloigpCard>
          </div>
        </>
      )}

      {!loading && !error && (!lastDayData || !periodData) && selectedAgent && (
        <VeloigpCard title="⚠️ Dados Não Encontrados" subtitle="Nenhum dado disponível para o agente selecionado">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3>Nenhum dado encontrado</h3>
            <p>Não foram encontrados dados para o agente <strong>{selectedAgent}</strong> no período selecionado.</p>
            <p>Verifique se:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>A planilha foi carregada corretamente</li>
              <li>O agente existe na planilha</li>
              <li>Há dados no período selecionado</li>
            </ul>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Dados do último dia:</strong> {lastDayData ? 'Encontrados' : 'Não encontrados'}</p>
              <p><strong>Dados do período:</strong> {periodData ? 'Encontrados' : 'Não encontrados'}</p>
            </div>
          </div>
        </VeloigpCard>
      )}

      {/* Logs */}
      <VeloigpCard title="📝 Logs do Sistema" subtitle="Últimas operações">
        <div className="comparative-charts__logs">
          {logs.length === 0 ? (
            <p>Nenhum log disponível</p>
          ) : (
            <div className="comparative-charts__logs-list">
              {logs.slice(-5).map((log, index) => (
                <div key={index} className={`comparative-charts__log comparative-charts__log--${log.type}`}>
                  <span className="comparative-charts__log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="comparative-charts__log-message">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </VeloigpCard>
    </div>
  );
};

export default ComparativeCharts;
