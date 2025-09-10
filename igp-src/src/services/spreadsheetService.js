// 🚀 Serviço de Integração com Planilha - VERSÃO OTIMIZADA
// Motor de cálculo ultra-rápido com cache inteligente e índices

import * as XLSX from 'xlsx';

// Sistema de logs otimizado
export const SPREADSHEET_LOGS = {
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

// Cache otimizado com índices
let spreadsheetData = null;
let lastModified = null;

// Índices para busca ultra-rápida
let agentIndex = new Map(); // agentName -> [rowIds]
let dateIndex = new Map(); // dateString -> [rowIds]
let statusIndex = new Map(); // status -> [rowIds]
let filaIndex = new Map(); // fila -> [rowIds]

// Cache de métricas calculadas
let metricsCache = new Map(); // cacheKey -> metrics
let cacheExpiry = new Map(); // cacheKey -> expiryTime

// Configurações de performance
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 100; // Máximo 100 entradas no cache

// Função para ler arquivo Excel/CSV (otimizada)
export async function readSpreadsheetFile(file) {
  try {
    SPREADSHEET_LOGS.addLog('info', 'Iniciando leitura otimizada da planilha', { fileName: file.name });
    
    const startTime = performance.now();
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Pegar a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON com otimizações
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '', // Valor padrão para células vazias
      raw: false // Processar valores como strings
    });
    
    // Processar dados com índices
    const processedData = processSpreadsheetDataOptimized(jsonData);
    
    // Salvar no cache
    spreadsheetData = processedData;
    lastModified = new Date();
    
    // Construir índices para busca rápida
    buildIndexes(processedData.data);
    
    // Limpar cache antigo
    clearExpiredCache();
    
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);
    
    SPREADSHEET_LOGS.addLog('success', `Planilha processada em ${processingTime}ms`, { 
      rows: processedData.length,
      columns: processedData.columns?.length || 0,
      indexes: {
        agents: agentIndex.size,
        dates: dateIndex.size,
        status: statusIndex.size,
        filas: filaIndex.size
      }
    });
    
    return processedData;
    
  } catch (error) {
    SPREADSHEET_LOGS.addLog('error', `Erro ao ler planilha: ${error.message}`);
    throw error;
  }
}

// Processar dados da planilha (otimizado)
function processSpreadsheetDataOptimized(rawData) {
  if (!rawData || rawData.length === 0) {
    throw new Error('Planilha vazia ou inválida');
  }
  
  // Primeira linha são os cabeçalhos
  const headers = rawData[0];
  const rows = rawData.slice(1);
  
  // Mapear colunas essenciais
  const columnMap = mapEssentialColumns(headers);
  
  // Processar cada linha com otimizações
  const processedRows = rows.map((row, index) => {
    const processedRow = {
      id: index + 1,
      raw: row
    };
    
    // Mapear dados essenciais
    Object.keys(columnMap).forEach(key => {
      const columnIndex = columnMap[key];
      processedRow[key] = columnIndex !== -1 ? row[columnIndex] : null;
    });
    
    return processedRow;
  });
  
  return {
    headers,
    columns: columnMap,
    data: processedRows,
    totalRows: processedRows.length,
    lastProcessed: new Date().toISOString()
  };
}

// Construir índices para busca ultra-rápida
function buildIndexes(data) {
  // Limpar índices existentes
  agentIndex.clear();
  dateIndex.clear();
  statusIndex.clear();
  filaIndex.clear();
  
  data.forEach((row, index) => {
    // Índice por agente
    if (row.agente) {
      const agentKey = row.agente.toString().toLowerCase();
      if (!agentIndex.has(agentKey)) {
        agentIndex.set(agentKey, []);
      }
      agentIndex.get(agentKey).push(index);
    }
    
    // Índice por data
    if (row.data) {
      const date = parseDate(row.data);
      if (date) {
        const dateKey = date.toISOString().split('T')[0];
        if (!dateIndex.has(dateKey)) {
          dateIndex.set(dateKey, []);
        }
        dateIndex.get(dateKey).push(index);
      }
    }
    
    // Índice por status
    if (row.status) {
      const statusKey = row.status.toString().toLowerCase();
      if (!statusIndex.has(statusKey)) {
        statusIndex.set(statusKey, []);
      }
      statusIndex.get(statusKey).push(index);
    }
    
    // Índice por fila
    if (row.fila) {
      const filaKey = row.fila.toString();
      if (!filaIndex.has(filaKey)) {
        filaIndex.set(filaKey, []);
      }
      filaIndex.get(filaKey).push(index);
    }
  });
  
  SPREADSHEET_LOGS.addLog('info', 'Índices construídos', {
    agents: agentIndex.size,
    dates: dateIndex.size,
    status: statusIndex.size,
    filas: filaIndex.size
  });
}

// Motor de cálculo ultra-rápido - Extrair dados por agente
export function getDataByAgent(agentName, startDate = null, endDate = null) {
  if (!spreadsheetData) {
    throw new Error('Nenhuma planilha carregada');
  }
  
  const startTime = performance.now();
  
  // Gerar chave do cache
  const cacheKey = `agent_${agentName}_${startDate?.getTime() || 'null'}_${endDate?.getTime() || 'null'}`;
  
  // Verificar cache
  if (metricsCache.has(cacheKey) && !isCacheExpired(cacheKey)) {
    const cachedResult = metricsCache.get(cacheKey);
    const endTime = performance.now();
    SPREADSHEET_LOGS.addLog('info', `Cache hit para agente ${agentName} (${Math.round(endTime - startTime)}ms)`);
    return cachedResult;
  }
  
  SPREADSHEET_LOGS.addLog('info', `Buscando dados do agente: ${agentName}`);
  
  // Busca otimizada usando índices
  let filteredData = getFilteredDataByAgent(agentName, startDate, endDate);
  
  // Calcular métricas
  const metrics = calculateAgentMetricsOptimized(filteredData);
  
  const result = {
    agent: agentName,
    period: { startDate, endDate },
    data: filteredData,
    metrics,
    summary: {
      totalRecords: filteredData.length,
      dateRange: getDateRange(filteredData),
      lastUpdate: new Date().toISOString()
    }
  };
  
  // Salvar no cache
  metricsCache.set(cacheKey, result);
  cacheExpiry.set(cacheKey, Date.now() + CACHE_DURATION);
  
  const endTime = performance.now();
  const processingTime = Math.round(endTime - startTime);
  
  SPREADSHEET_LOGS.addLog('success', `Dados do agente ${agentName} extraídos em ${processingTime}ms`, { 
    totalRecords: filteredData.length,
    metrics: Object.keys(metrics).length,
    cacheSize: metricsCache.size
  });
  
  return result;
}

// Busca otimizada por agente usando índices
function getFilteredDataByAgent(agentName, startDate, endDate) {
  const agentKey = agentName.toLowerCase();
  const agentRowIds = agentIndex.get(agentKey) || [];
  
  SPREADSHEET_LOGS.addLog('info', `Buscando dados para agente: ${agentName} (${agentRowIds.length} registros encontrados)`);
  
  if (agentRowIds.length === 0) {
    SPREADSHEET_LOGS.addLog('warning', `Nenhum registro encontrado para agente: ${agentName}`);
    return [];
  }
  
  // Se não há filtro de data, retornar todos os dados do agente
  if (!startDate && !endDate) {
    SPREADSHEET_LOGS.addLog('info', `Retornando todos os ${agentRowIds.length} registros do agente ${agentName}`);
    return agentRowIds.map(id => spreadsheetData.data[id]);
  }
  
  // Filtrar por data usando índice de data
  const filteredRowIds = new Set();
  
  // Iterar pelas datas no período
  const currentDate = new Date(startDate || new Date(0));
  const endDateToUse = endDate || new Date();
  
  SPREADSHEET_LOGS.addLog('info', `Filtrando por período: ${currentDate.toISOString()} até ${endDateToUse.toISOString()}`);
  
  while (currentDate <= endDateToUse) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dateRowIds = dateIndex.get(dateKey) || [];
    
    // Intersecção entre agentes e datas
    dateRowIds.forEach(id => {
      if (agentRowIds.includes(id)) {
        filteredRowIds.add(id);
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const result = Array.from(filteredRowIds).map(id => spreadsheetData.data[id]);
  SPREADSHEET_LOGS.addLog('info', `Filtro por data resultou em ${result.length} registros para agente ${agentName}`);
  
  return result;
}

// Motor de cálculo ultra-rápido - Extrair dados por período
export function getDataByPeriod(startDate, endDate, agentFilter = null) {
  if (!spreadsheetData) {
    throw new Error('Nenhuma planilha carregada');
  }
  
  const startTime = performance.now();
  
  // Gerar chave do cache
  const cacheKey = `period_${startDate.getTime()}_${endDate.getTime()}_${agentFilter || 'all'}`;
  
  // Verificar cache
  if (metricsCache.has(cacheKey) && !isCacheExpired(cacheKey)) {
    const cachedResult = metricsCache.get(cacheKey);
    const endTime = performance.now();
    SPREADSHEET_LOGS.addLog('info', `Cache hit para período (${Math.round(endTime - startTime)}ms)`);
    return cachedResult;
  }
  
  SPREADSHEET_LOGS.addLog('info', `Buscando dados do período: ${startDate} - ${endDate}`);
  
  // Busca otimizada usando índices
  let filteredData = getFilteredDataByPeriod(startDate, endDate, agentFilter);
  
  // Calcular métricas
  const metrics = calculatePeriodMetricsOptimized(filteredData);
  
  const result = {
    period: { startDate, endDate },
    agentFilter,
    data: filteredData,
    metrics,
    summary: {
      totalRecords: filteredData.length,
      agents: getUniqueAgents(filteredData),
      dateRange: getDateRange(filteredData),
      lastUpdate: new Date().toISOString()
    }
  };
  
  // Salvar no cache
  metricsCache.set(cacheKey, result);
  cacheExpiry.set(cacheKey, Date.now() + CACHE_DURATION);
  
  const endTime = performance.now();
  const processingTime = Math.round(endTime - startTime);
  
  SPREADSHEET_LOGS.addLog('success', `Dados do período extraídos em ${processingTime}ms`, { 
    totalRecords: filteredData.length,
    metrics: Object.keys(metrics).length,
    cacheSize: metricsCache.size
  });
  
  return result;
}

// Busca otimizada por período usando índices
function getFilteredDataByPeriod(startDate, endDate, agentFilter) {
  const filteredRowIds = new Set();
  
  // Iterar pelas datas no período
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dateRowIds = dateIndex.get(dateKey) || [];
    
    dateRowIds.forEach(id => {
      filteredRowIds.add(id);
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  let result = Array.from(filteredRowIds).map(id => spreadsheetData.data[id]);
  
  // Filtrar por agente se especificado
  if (agentFilter) {
    const agentKey = agentFilter.toLowerCase();
    const agentRowIds = agentIndex.get(agentKey) || [];
    const agentRowIdsSet = new Set(agentRowIds);
    
    result = result.filter(row => agentRowIdsSet.has(row.id - 1));
  }
  
  return result;
}

// Calcular métricas do agente (otimizado)
function calculateAgentMetricsOptimized(data) {
  const metrics = {
    totalChamadas: 0,
    totalDuracao: 0,
    chamadasAtendidas: 0,
    chamadasAbandonadas: 0,
    tempoMedioAtendimento: 0,
    satisfacaoMedia: 0,
    filas: {},
    status: {}
  };
  
  let totalSatisfacao = 0;
  let countSatisfacao = 0;
  
  // Processamento otimizado em uma única passada
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Contar chamadas
    if (row.chamadas) {
      metrics.totalChamadas += parseInt(row.chamadas) || 0;
    }
    
    // Somar duração
    if (row.duracao) {
      metrics.totalDuracao += parseDuration(row.duracao);
    }
    
    // Contar por status
    if (row.status) {
      const status = row.status.toString().toLowerCase();
      metrics.status[status] = (metrics.status[status] || 0) + 1;
      
      if (status.includes('atend') || status.includes('success')) {
        metrics.chamadasAtendidas++;
      } else if (status.includes('abandon') || status.includes('lost')) {
        metrics.chamadasAbandonadas++;
      }
    }
    
    // Contar por fila
    if (row.fila) {
      const fila = row.fila.toString();
      metrics.filas[fila] = (metrics.filas[fila] || 0) + 1;
    }
    
    // Somar satisfação
    if (row.satisfacao) {
      const satisfacao = parseFloat(row.satisfacao);
      if (!isNaN(satisfacao)) {
        totalSatisfacao += satisfacao;
        countSatisfacao++;
      }
    }
  }
  
  // Calcular médias
  if (metrics.chamadasAtendidas > 0) {
    metrics.tempoMedioAtendimento = metrics.totalDuracao / metrics.chamadasAtendidas;
  }
  
  if (countSatisfacao > 0) {
    metrics.satisfacaoMedia = totalSatisfacao / countSatisfacao;
  }
  
  return metrics;
}

// Calcular métricas do período (otimizado)
function calculatePeriodMetricsOptimized(data) {
  const metrics = {
    totalChamadas: 0,
    totalDuracao: 0,
    chamadasAtendidas: 0,
    chamadasAbandonadas: 0,
    tempoMedioAtendimento: 0,
    satisfacaoMedia: 0,
    agentes: {},
    filas: {},
    status: {},
    evolucaoDiaria: {}
  };
  
  let totalSatisfacao = 0;
  let countSatisfacao = 0;
  
  // Processamento otimizado em uma única passada
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Contar chamadas
    if (row.chamadas) {
      metrics.totalChamadas += parseInt(row.chamadas) || 0;
    }
    
    // Somar duração
    if (row.duracao) {
      metrics.totalDuracao += parseDuration(row.duracao);
    }
    
    // Contar por agente
    if (row.agente) {
      const agente = row.agente.toString();
      if (!metrics.agentes[agente]) {
        metrics.agentes[agente] = {
          chamadas: 0,
          duracao: 0,
          satisfacao: 0,
          countSatisfacao: 0
        };
      }
      metrics.agentes[agente].chamadas += parseInt(row.chamadas) || 0;
      metrics.agentes[agente].duracao += parseDuration(row.duracao);
      
      if (row.satisfacao) {
        const satisfacao = parseFloat(row.satisfacao);
        if (!isNaN(satisfacao)) {
          metrics.agentes[agente].satisfacao += satisfacao;
          metrics.agentes[agente].countSatisfacao++;
        }
      }
    }
    
    // Contar por status
    if (row.status) {
      const status = row.status.toString().toLowerCase();
      metrics.status[status] = (metrics.status[status] || 0) + 1;
      
      if (status.includes('atend') || status.includes('success')) {
        metrics.chamadasAtendidas++;
      } else if (status.includes('abandon') || status.includes('lost')) {
        metrics.chamadasAbandonadas++;
      }
    }
    
    // Contar por fila
    if (row.fila) {
      const fila = row.fila.toString();
      metrics.filas[fila] = (metrics.filas[fila] || 0) + 1;
    }
    
    // Evolução diária
    if (row.data) {
      const date = parseDate(row.data);
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        if (!metrics.evolucaoDiaria[dateStr]) {
          metrics.evolucaoDiaria[dateStr] = {
            chamadas: 0,
            duracao: 0
          };
        }
        metrics.evolucaoDiaria[dateStr].chamadas += parseInt(row.chamadas) || 0;
        metrics.evolucaoDiaria[dateStr].duracao += parseDuration(row.duracao);
      }
    }
    
    // Somar satisfação
    if (row.satisfacao) {
      const satisfacao = parseFloat(row.satisfacao);
      if (!isNaN(satisfacao)) {
        totalSatisfacao += satisfacao;
        countSatisfacao++;
      }
    }
  }
  
  // Calcular médias
  if (metrics.chamadasAtendidas > 0) {
    metrics.tempoMedioAtendimento = metrics.totalDuracao / metrics.chamadasAtendidas;
  }
  
  if (countSatisfacao > 0) {
    metrics.satisfacaoMedia = totalSatisfacao / countSatisfacao;
  }
  
  // Calcular médias dos agentes
  Object.keys(metrics.agentes).forEach(agente => {
    const agenteData = metrics.agentes[agente];
    if (agenteData.countSatisfacao > 0) {
      agenteData.satisfacaoMedia = agenteData.satisfacao / agenteData.countSatisfacao;
    }
    if (agenteData.chamadas > 0) {
      agenteData.tempoMedioAtendimento = agenteData.duracao / agenteData.chamadas;
    }
  });
  
  return metrics;
}

// Funções auxiliares otimizadas
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Tentar diferentes formatos de data
    let date;
    
    // Formato brasileiro DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        date = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    // Formato ISO YYYY-MM-DD
    else if (dateStr.includes('-')) {
      date = new Date(dateStr);
    }
    // Formato padrão
    else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      SPREADSHEET_LOGS.addLog('warning', `Data inválida: ${dateStr}`);
      return null;
    }
    
    return date;
  } catch (error) {
    SPREADSHEET_LOGS.addLog('error', `Erro ao parsear data: ${dateStr} - ${error.message}`);
    return null;
  }
}

function parseDuration(durationStr) {
  if (!durationStr) return 0;
  
  try {
    if (typeof durationStr === 'number') return durationStr;
    
    const str = durationStr.toString();
    
    // Formato HH:MM:SS
    if (str.includes(':')) {
      const parts = str.split(':');
      if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }
    
    // Formato em segundos
    return parseInt(str) || 0;
  } catch (error) {
    return 0;
  }
}

function getDateRange(data) {
  if (!data || data.length === 0) return null;
  
  let minDate = null;
  let maxDate = null;
  
  for (let i = 0; i < data.length; i++) {
    const date = parseDate(data[i].data);
    if (date) {
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    }
  }
  
  if (!minDate || !maxDate) return null;
  
  return { start: minDate, end: maxDate };
}

function getUniqueAgents(data) {
  const agents = new Set();
  for (let i = 0; i < data.length; i++) {
    if (data[i].agente) {
      agents.add(data[i].agente.toString());
    }
  }
  return Array.from(agents);
}

// Gerenciamento de cache
function isCacheExpired(cacheKey) {
  const expiry = cacheExpiry.get(cacheKey);
  return !expiry || Date.now() > expiry;
}

function clearExpiredCache() {
  const now = Date.now();
  const expiredKeys = [];
  
  cacheExpiry.forEach((expiry, key) => {
    if (now > expiry) {
      expiredKeys.push(key);
    }
  });
  
  expiredKeys.forEach(key => {
    metricsCache.delete(key);
    cacheExpiry.delete(key);
  });
  
  // Limitar tamanho do cache
  if (metricsCache.size > MAX_CACHE_SIZE) {
    const keys = Array.from(metricsCache.keys());
    const keysToDelete = keys.slice(0, keys.length - MAX_CACHE_SIZE);
    keysToDelete.forEach(key => {
      metricsCache.delete(key);
      cacheExpiry.delete(key);
    });
  }
}

// Mapear colunas essenciais (mesmo da versão original)
function mapEssentialColumns(headers) {
  const columnMap = {
    agente: -1,
    data: -1,
    hora: -1,
    chamadas: -1,
    duracao: -1,
    status: -1,
    fila: -1,
    satisfacao: -1
  };
  
  // Buscar colunas por nome (case insensitive)
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerLower = header.toLowerCase().trim();
    
    // Mapear agente
    if (headerLower.includes('agente') || headerLower.includes('agent') || headerLower.includes('operador')) {
      columnMap.agente = index;
    }
    
    // Mapear data
    if (headerLower.includes('data') || headerLower.includes('date') || headerLower.includes('dia')) {
      columnMap.data = index;
    }
    
    // Mapear hora
    if (headerLower.includes('hora') || headerLower.includes('time') || headerLower.includes('horario')) {
      columnMap.hora = index;
    }
    
    // Mapear chamadas
    if (headerLower.includes('chamada') || headerLower.includes('call') || headerLower.includes('ligacao')) {
      columnMap.chamadas = index;
    }
    
    // Mapear duração
    if (headerLower.includes('duracao') || headerLower.includes('duration') || headerLower.includes('tempo')) {
      columnMap.duracao = index;
    }
    
    // Mapear status
    if (headerLower.includes('status') || headerLower.includes('situacao') || headerLower.includes('estado')) {
      columnMap.status = index;
    }
    
    // Mapear fila
    if (headerLower.includes('fila') || headerLower.includes('queue') || headerLower.includes('grupo')) {
      columnMap.fila = index;
    }
    
    // Mapear satisfação
    if (headerLower.includes('satisfacao') || headerLower.includes('satisfaction') || headerLower.includes('avaliacao')) {
      columnMap.satisfacao = index;
    }
  });
  
  return columnMap;
}

// Funções de utilidade (mesmas da versão original)
export function getSpreadsheetInfo() {
  if (!spreadsheetData) {
    return {
      loaded: false,
      message: 'Nenhuma planilha carregada'
    };
  }
  
  return {
    loaded: true,
    totalRows: spreadsheetData.totalRows,
    columns: spreadsheetData.columns,
    lastProcessed: spreadsheetData.lastProcessed,
    lastModified: lastModified,
    cacheInfo: {
      size: metricsCache.size,
      maxSize: MAX_CACHE_SIZE,
      indexes: {
        agents: agentIndex.size,
        dates: dateIndex.size,
        status: statusIndex.size,
        filas: filaIndex.size
      }
    }
  };
}

export function getAvailableAgents() {
  if (!spreadsheetData) return [];
  
  return Array.from(agentIndex.keys()).map(key => 
    spreadsheetData.data[agentIndex.get(key)[0]]?.agente || key
  );
}

export function getAvailablePeriods() {
  if (!spreadsheetData) return null;
  
  return getDateRange(spreadsheetData.data);
}

export function clearSpreadsheetData() {
  spreadsheetData = null;
  lastModified = null;
  
  // Limpar índices
  agentIndex.clear();
  dateIndex.clear();
  statusIndex.clear();
  filaIndex.clear();
  
  // Limpar cache
  metricsCache.clear();
  cacheExpiry.clear();
  
  SPREADSHEET_LOGS.clearLogs();
}

// Função para obter estatísticas de performance
export function getPerformanceStats() {
  return {
    cache: {
      size: metricsCache.size,
      maxSize: MAX_CACHE_SIZE,
      hitRate: calculateCacheHitRate()
    },
    indexes: {
      agents: agentIndex.size,
      dates: dateIndex.size,
      status: statusIndex.size,
      filas: filaIndex.size
    },
    data: {
      totalRows: spreadsheetData?.totalRows || 0,
      lastModified: lastModified
    }
  };
}

function calculateCacheHitRate() {
  // Implementação simples - pode ser melhorada com contadores
  return metricsCache.size > 0 ? 'Ativo' : 'Inativo';
}
