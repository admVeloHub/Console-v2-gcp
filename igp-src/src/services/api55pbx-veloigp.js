import axios from 'axios';

// 🎯 API 55PBX - Serviço VeloIGP
// Baseado na documentação oficial e integração com design VeloIGP

// URL base da API 55PBX
export const API_BASE_URL = 'https://reportapi02.55pbx.com:50500/api/pbx/reports/metrics';

// Token da API 55PBX
const getToken = () => {
  const storedToken = localStorage.getItem('veloigp-api-token');
  if (storedToken) {
    return storedToken;
  }
  
  // Token padrão - usar variável de ambiente ou token padrão
  const envToken = process.env.REACT_APP_API_TOKEN;
  if (envToken) {
    return envToken;
  }
  
  // Token padrão para demonstração - substitua pelo seu token real
  return 'ebd331c1-44b7-4947-aa8f-91e5df9479e3-202581414188';
};

const TOKEN = getToken();

// Sistema de logs VeloIGP
export const VELOIGP_LOGS = {
  logs: [],
  addLog: function (type, message, data = null) {
    const log = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
      data: data,
    };
    this.logs.push(log);
    
    // Manter apenas os últimos 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  },
  getLogs: function () {
    return this.logs;
  },
  clearLogs: function () {
    this.logs = [];
  },
};

// Formatação de data para API 55PBX
export function formatarDataParaAPI(date) {
  const diasSemana = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ];
  const meses = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  
  const diaSemana = diasSemana[date.getDay()];
  const month = meses[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  const dataFormatada = `${diaSemana} ${month} ${day} ${year} ${hours}:${minutes}:${seconds} GMT -0300`;
  
  VELOIGP_LOGS.addLog('debug', `Data formatada: ${dataFormatada}`);
  return dataFormatada;
}

// Construir URL da API
function construirURLAPI(dataInicio, dataFim, reportName = 'report_01') {
  const dataInicioFormatada = encodeURIComponent(dataInicio);
  const dataFimFormatada = encodeURIComponent(dataFim);
  
  const url = `${API_BASE_URL}/${dataInicioFormatada}/${dataFimFormatada}/all_queues/all_numbers/all_agent/${reportName}/undefined/-3`;
  
  VELOIGP_LOGS.addLog('debug', `URL construída: ${url}`);
  return url;
}

// Função principal para chamar a API
async function chamarAPI(url) {
  try {
    VELOIGP_LOGS.addLog('info', `Fazendo requisição para: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        key: TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    });

    VELOIGP_LOGS.addLog('success', `Resposta da API: Status ${response.status}`);
    
    if (response.status === 200) {
      return response;
    } else {
      throw new Error(`Status inválido: ${response.status}`);
    }
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro na API: ${error.message}`, error.response || null);
    
    // Não retornar dados simulados automaticamente - deixar o erro ser tratado pelo componente
    throw new Error(`Falha na conexão com API 55PBX: ${error.message}`);
  }
}

// Dados simulados com identidade VeloIGP
export function gerarDadosSimuladosVeloigp() {
  return {
    // Métricas principais
    totalChamadas: 1847,
    chamadasAtendidas: 1653,
    chamadasAbandonadas: 194,
    tempoMedioAtendimento: '00:04:32',
    tempoMedioEspera: '00:00:15',
    taxaAtendimento: '89.5%',
    taxaAbandono: '10.5%',
    
    // Dados por hora (últimas 24h)
    dadosPorHora: [
      { hora: '00:00', chamadas: 12, atendidas: 10, abandonadas: 2, tempoMedio: 180, tempoEspera: 8 },
      { hora: '01:00', chamadas: 8, atendidas: 7, abandonadas: 1, tempoMedio: 165, tempoEspera: 6 },
      { hora: '02:00', chamadas: 5, atendidas: 4, abandonadas: 1, tempoMedio: 150, tempoEspera: 5 },
      { hora: '03:00', chamadas: 3, atendidas: 3, abandonadas: 0, tempoMedio: 140, tempoEspera: 4 },
      { hora: '04:00', chamadas: 4, atendidas: 4, abandonadas: 0, tempoMedio: 145, tempoEspera: 3 },
      { hora: '05:00', chamadas: 6, atendidas: 5, abandonadas: 1, tempoMedio: 155, tempoEspera: 4 },
      { hora: '06:00', chamadas: 15, atendidas: 13, abandonadas: 2, tempoMedio: 170, tempoEspera: 6 },
      { hora: '07:00', chamadas: 28, atendidas: 25, abandonadas: 3, tempoMedio: 185, tempoEspera: 8 },
      { hora: '08:00', chamadas: 45, atendidas: 40, abandonadas: 5, tempoMedio: 200, tempoEspera: 12 },
      { hora: '09:00', chamadas: 78, atendidas: 70, abandonadas: 8, tempoMedio: 215, tempoEspera: 15 },
      { hora: '10:00', chamadas: 92, atendidas: 82, abandonadas: 10, tempoMedio: 220, tempoEspera: 18 },
      { hora: '11:00', chamadas: 85, atendidas: 76, abandonadas: 9, tempoMedio: 210, tempoEspera: 16 },
      { hora: '12:00', chamadas: 65, atendidas: 58, abandonadas: 7, tempoMedio: 195, tempoEspera: 14 },
      { hora: '13:00', chamadas: 55, atendidas: 49, abandonadas: 6, tempoMedio: 190, tempoEspera: 12 },
      { hora: '14:00', chamadas: 88, atendidas: 78, abandonadas: 10, tempoMedio: 205, tempoEspera: 17 },
      { hora: '15:00', chamadas: 95, atendidas: 84, abandonadas: 11, tempoMedio: 225, tempoEspera: 20 },
      { hora: '16:00', chamadas: 82, atendidas: 73, abandonadas: 9, tempoMedio: 200, tempoEspera: 16 },
      { hora: '17:00', chamadas: 68, atendidas: 60, abandonadas: 8, tempoMedio: 185, tempoEspera: 14 },
      { hora: '18:00', chamadas: 42, atendidas: 37, abandonadas: 5, tempoMedio: 175, tempoEspera: 11 },
      { hora: '19:00', chamadas: 25, atendidas: 22, abandonadas: 3, tempoMedio: 165, tempoEspera: 9 },
      { hora: '20:00', chamadas: 18, atendidas: 16, abandonadas: 2, tempoMedio: 160, tempoEspera: 7 },
      { hora: '21:00', chamadas: 12, atendidas: 11, abandonadas: 1, tempoMedio: 155, tempoEspera: 6 },
      { hora: '22:00', chamadas: 8, atendidas: 7, abandonadas: 1, tempoMedio: 150, tempoEspera: 5 },
      { hora: '23:00', chamadas: 6, atendidas: 5, abandonadas: 1, tempoMedio: 145, tempoEspera: 4 },
    ],
    
    // Dados por fila
    filas: [
      { 
        nome: 'Suporte Técnico', 
        atendidas: 520, 
        abandonadas: 45, 
        tempoMedio: '00:05:20', 
        agentes: 8,
        taxaAtendimento: '92.0%',
        status: 'Ativo'
      },
      { 
        nome: 'Vendas', 
        atendidas: 380, 
        abandonadas: 35, 
        tempoMedio: '00:03:45', 
        agentes: 6,
        taxaAtendimento: '91.6%',
        status: 'Ativo'
      },
      { 
        nome: 'Financeiro', 
        atendidas: 220, 
        abandonadas: 25, 
        tempoMedio: '00:06:10', 
        agentes: 4,
        taxaAtendimento: '89.8%',
        status: 'Ativo'
      },
      { 
        nome: 'Administrativo', 
        atendidas: 120, 
        abandonadas: 15, 
        tempoMedio: '00:04:30', 
        agentes: 3,
        taxaAtendimento: '88.9%',
        status: 'Ativo'
      },
      { 
        nome: 'Emergência', 
        atendidas: 413, 
        abandonadas: 74, 
        tempoMedio: '00:02:15', 
        agentes: 5,
        taxaAtendimento: '84.8%',
        status: 'Ativo'
      },
    ],
    
    // Dados por agente
    agentes: [
      { 
        nome: 'João Silva', 
        atendidas: 125, 
        tempoMedio: '00:04:15', 
        status: 'Online', 
        tempoOnline: '08:30:00',
        fila: 'Suporte Técnico',
        satisfacao: '4.8/5'
      },
      { 
        nome: 'Maria Santos', 
        atendidas: 118, 
        tempoMedio: '00:03:50', 
        status: 'Online', 
        tempoOnline: '08:15:00',
        fila: 'Vendas',
        satisfacao: '4.7/5'
      },
      { 
        nome: 'Pedro Costa', 
        atendidas: 112, 
        tempoMedio: '00:05:20', 
        status: 'Online', 
        tempoOnline: '07:45:00',
        fila: 'Suporte Técnico',
        satisfacao: '4.6/5'
      },
      { 
        nome: 'Ana Oliveira', 
        atendidas: 98, 
        tempoMedio: '00:04:30', 
        status: 'Pausa', 
        tempoOnline: '06:20:00',
        fila: 'Financeiro',
        satisfacao: '4.5/5'
      },
      { 
        nome: 'Carlos Lima', 
        atendidas: 105, 
        tempoMedio: '00:03:45', 
        status: 'Online', 
        tempoOnline: '08:00:00',
        fila: 'Vendas',
        satisfacao: '4.9/5'
      },
      { 
        nome: 'Fernanda Costa', 
        atendidas: 108, 
        tempoMedio: '00:04:10', 
        status: 'Online', 
        tempoOnline: '07:30:00',
        fila: 'Administrativo',
        satisfacao: '4.4/5'
      },
      { 
        nome: 'Roberto Alves', 
        atendidas: 95, 
        tempoMedio: '00:05:05', 
        status: 'Online', 
        tempoOnline: '07:15:00',
        fila: 'Emergência',
        satisfacao: '4.3/5'
      },
      { 
        nome: 'Juliana Santos', 
        atendidas: 102, 
        tempoMedio: '00:03:55', 
        status: 'Online', 
        tempoOnline: '08:10:00',
        fila: 'Suporte Técnico',
        satisfacao: '4.7/5'
      },
    ],
    
    // Métricas de performance
    metricas: {
      satisfacaoGeral: '4.6/5',
      tempoRespostaMedio: '12s',
      chamadasHoje: 1653,
      chamadasOntem: 1589,
      picoHorario: '15:00',
      volumePico: 95,
      agentesOnline: 7,
      agentesTotal: 8,
      filasAtivas: 5,
      uptime: '99.8%'
    },
    
    // Dados de tendência (últimos 7 dias)
    tendencia: [
      { dia: 'Seg', chamadas: 1456, atendidas: 1302, taxa: '89.4%' },
      { dia: 'Ter', chamadas: 1523, atendidas: 1368, taxa: '89.8%' },
      { dia: 'Qua', chamadas: 1689, atendidas: 1512, taxa: '89.5%' },
      { dia: 'Qui', chamadas: 1745, atendidas: 1567, taxa: '89.8%' },
      { dia: 'Sex', chamadas: 1823, atendidas: 1634, taxa: '89.6%' },
      { dia: 'Sáb', chamadas: 1234, atendidas: 1108, taxa: '89.8%' },
      { dia: 'Dom', chamadas: 1847, atendidas: 1653, taxa: '89.5%' },
    ]
  };
}

// Funções principais da API
export async function fetchReport01(dataInicio, dataFim) {
  try {
    VELOIGP_LOGS.addLog('info', 'Buscando Report 01 - Métricas Principais');
    
    const dataInicioFormatada = formatarDataParaAPI(dataInicio);
    const dataFimFormatada = formatarDataParaAPI(dataFim);
    
    const url = construirURLAPI(dataInicioFormatada, dataFimFormatada, 'report_01');
    const response = await chamarAPI(url);
    
    VELOIGP_LOGS.addLog('success', 'Report 01 obtido com sucesso');
    return response;
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro em fetchReport01: ${error.message}`);
    throw error;
  }
}

export async function fetchReport02(dataInicio, dataFim) {
  try {
    VELOIGP_LOGS.addLog('info', 'Buscando Report 02 - Dados por Hora');
    
    const dataInicioFormatada = formatarDataParaAPI(dataInicio);
    const dataFimFormatada = formatarDataParaAPI(dataFim);
    
    const url = construirURLAPI(dataInicioFormatada, dataFimFormatada, 'report_02');
    const response = await chamarAPI(url);
    
    VELOIGP_LOGS.addLog('success', 'Report 02 obtido com sucesso');
    return response;
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro em fetchReport02: ${error.message}`);
    throw error;
  }
}

export async function fetchReport03(dataInicio, dataFim) {
  try {
    VELOIGP_LOGS.addLog('info', 'Buscando Report 03 - Dados de Agentes');
    
    const dataInicioFormatada = formatarDataParaAPI(dataInicio);
    const dataFimFormatada = formatarDataParaAPI(dataFim);
    
    const url = construirURLAPI(dataInicioFormatada, dataFimFormatada, 'report_03');
    const response = await chamarAPI(url);
    
    VELOIGP_LOGS.addLog('success', 'Report 03 obtido com sucesso');
    return response;
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro em fetchReport03: ${error.message}`);
    throw error;
  }
}

export async function fetchReport04(dataInicio, dataFim) {
  try {
    VELOIGP_LOGS.addLog('info', 'Buscando Report 04 - Dados de Filas');
    
    const dataInicioFormatada = formatarDataParaAPI(dataInicio);
    const dataFimFormatada = formatarDataParaAPI(dataFim);
    
    const url = construirURLAPI(dataInicioFormatada, dataFimFormatada, 'report_04');
    const response = await chamarAPI(url);
    
    VELOIGP_LOGS.addLog('success', 'Report 04 obtido com sucesso');
    return response;
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro em fetchReport04: ${error.message}`);
    throw error;
  }
}

// Buscar dados em tempo real
export async function fetchRealTimeData() {
  try {
    VELOIGP_LOGS.addLog('info', 'Buscando dados em tempo real');
    
    const agora = new Date();
    const dataInicio = new Date(agora);
    dataInicio.setDate(dataInicio.getDate() - 1); // Últimas 24 horas
    const dataFim = agora;
    
    const dataInicioFormatada = formatarDataParaAPI(dataInicio);
    const dataFimFormatada = formatarDataParaAPI(dataFim);
    
    const url = construirURLAPI(dataInicioFormatada, dataFimFormatada, 'report_01');
    const response = await chamarAPI(url);
    
    VELOIGP_LOGS.addLog('success', 'Dados em tempo real obtidos com sucesso');
    return response;
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro em fetchRealTimeData: ${error.message}`);
    throw error;
  }
}

// Buscar todos os relatórios
export async function fetchAllReports(dataInicio, dataFim) {
  try {
    VELOIGP_LOGS.addLog('info', 'Buscando todos os relatórios');
    
    const [report01, report02, report03, report04] = await Promise.allSettled([
      fetchReport01(dataInicio, dataFim),
      fetchReport02(dataInicio, dataFim),
      fetchReport03(dataInicio, dataFim),
      fetchReport04(dataInicio, dataFim)
    ]);
    
    const resultados = {
      report01: report01.status === 'fulfilled' ? report01.value : null,
      report02: report02.status === 'fulfilled' ? report02.value : null,
      report03: report03.status === 'fulfilled' ? report03.value : null,
      report04: report04.status === 'fulfilled' ? report04.value : null
    };
    
    VELOIGP_LOGS.addLog('success', 'Todos os relatórios processados');
    return resultados;
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Erro em fetchAllReports: ${error.message}`);
    throw error;
  }
}

// Função para obter dados simulados quando a API falha
export async function obterDadosSimulados() {
  VELOIGP_LOGS.addLog('info', 'Usando dados simulados');
  return {
    data: gerarDadosSimuladosVeloigp(),
    status: 200,
    isSimulated: true
  };
}

// Processar dados da API para o dashboard
export function processarDadosAPI(dadosAPI) {
  VELOIGP_LOGS.addLog('info', 'Processando dados da API');
  
  if (!dadosAPI || !dadosAPI.data) {
    VELOIGP_LOGS.addLog('warning', 'Dados da API não encontrados, usando dados simulados');
    return gerarDadosSimuladosVeloigp();
  }
  
  const dados = dadosAPI.data;
  
  // Se já são dados simulados
  if (dados.totalChamadas && dados.chamadasAtendidas) {
    VELOIGP_LOGS.addLog('info', 'Dados simulados detectados');
    return dados;
  }
  
  // Processar dados reais da API
  if (dados.totalCallAttended || dados.totalCallAbandonedURA || dados.totalCallAbandonedQueue) {
    VELOIGP_LOGS.addLog('success', 'Processando dados reais da API 55PBX');
    
    const totalChamadas = (dados.totalCallAttended || 0) + (dados.totalCallAbandonedURA || 0) + (dados.totalCallAbandonedQueue || 0);
    const chamadasAtendidas = dados.totalCallAttended || 0;
    const chamadasAbandonadas = (dados.totalCallAbandonedURA || 0) + (dados.totalCallAbandonedQueue || 0);
    
    return {
      totalChamadas,
      chamadasAtendidas,
      chamadasAbandonadas,
      tempoMedioAtendimento: dados.timeMediumDurationCall || '00:04:32',
      tempoMedioEspera: dados.timeMediumWaitingAttendance || '00:00:15',
      taxaAtendimento: dados.sla_attendance || '89.5%',
      taxaAbandono: dados.sla_abandonment || '10.5%',
      dadosPorHora: dados.hourly_data || [],
      filas: dados.queue_data || [],
      agentes: dados.agent_data || [],
      metricas: {
        satisfacaoGeral: dados.satisfaction_score || '4.6/5',
        tempoRespostaMedio: dados.response_time || '12s',
        chamadasHoje: chamadasAtendidas,
        chamadasOntem: chamadasAtendidas,
        picoHorario: dados.peak_hour || '15:00',
        volumePico: dados.peak_volume || 95,
        agentesOnline: dados.agents_online || 7,
        agentesTotal: dados.agents_total || 8,
        filasAtivas: dados.queues_active || 5,
        uptime: dados.uptime || '99.8%'
      }
    };
  }
  
  // Retornar dados simulados se não há dados reais
  VELOIGP_LOGS.addLog('warning', 'Nenhum dado real encontrado, usando dados simulados');
  return gerarDadosSimuladosVeloigp();
}

// Testar conexão com a API
export async function testarConexaoAPI() {
  try {
    VELOIGP_LOGS.addLog('info', 'Testando conexão com a API 55PBX');
    
    const agora = new Date();
    const dataInicio = new Date(agora);
    dataInicio.setHours(dataInicio.getHours() - 1);
    
    const dataInicioFormatada = formatarDataParaAPI(dataInicio);
    const dataFimFormatada = formatarDataParaAPI(agora);
    
    const url = construirURLAPI(dataInicioFormatada, dataFimFormatada, 'report_01');
    
    const response = await axios.get(url, {
      headers: {
        key: TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    });
    
    VELOIGP_LOGS.addLog('success', 'Conexão com API testada com sucesso');
    return {
      connected: true,
      status: response.status,
      message: 'API 55PBX conectada com sucesso'
    };
  } catch (error) {
    VELOIGP_LOGS.addLog('error', `Falha no teste de conexão: ${error.message}`);
    return {
      connected: false,
      error: error.message,
      message: 'Falha na conexão com API 55PBX'
    };
  }
}

// Exportar logs
export function getVeloigpLogs() {
  return VELOIGP_LOGS.getLogs();
}

export function clearVeloigpLogs() {
  VELOIGP_LOGS.clearLogs();
}
