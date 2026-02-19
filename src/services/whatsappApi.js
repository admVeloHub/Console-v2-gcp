/**
 * VeloHub Console - WhatsApp API Service
 * VERSION: v2.0.0 | DATE: 2025-02-11 | AUTHOR: VeloHub Development Team
 * 
 * Serviço para comunicação com API WhatsApp do SKYNET
 * Suporta múltiplas conexões (requisicoes-produto e velodesk)
 * Requer permissão 'whatsapp' no sistema de permissionamento
 * 
 * Mudanças v2.0.0:
 * - Suporte para múltiplas conexões WhatsApp
 * - Funções específicas para cada conexão
 * - Novas funcionalidades: react, grupos, replies, health checks
 */

import axios from 'axios';

// URL base do SKYNET
// Prioridade: REACT_APP_SKYNET_API_URL > NODE_ENV check > fallback produção
const SKYNET_API_URL = process.env.REACT_APP_SKYNET_API_URL || 
  (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001' 
    : 'https://backend-gcp-hfsqj6konq-ue.a.run.app');

// Log para debug - FORÇAR LOCALHOST EM DESENVOLVIMENTO
console.log('🔧 [WhatsApp API] ════════════════════════════════════════');
console.log('🔧 [WhatsApp API] Configuração de URL:');
console.log('🔧 [WhatsApp API] REACT_APP_SKYNET_API_URL:', process.env.REACT_APP_SKYNET_API_URL);
console.log('🔧 [WhatsApp API] NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 [WhatsApp API] hostname:', window.location.hostname);
console.log('🔧 [WhatsApp API] SKYNET_API_URL FINAL:', SKYNET_API_URL);
console.log('🔧 [WhatsApp API] ════════════════════════════════════════');

const whatsappApi = axios.create({
  baseURL: SKYNET_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para operações WhatsApp
});

// Interceptor para adicionar email do usuário nas requisições e logs
whatsappApi.interceptors.request.use((config) => {
  // Obter email do usuário do localStorage
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userEmail = user.email || user._userMail;
      if (userEmail) {
        config.headers['X-User-Email'] = userEmail;
      }
    }
  } catch (error) {
    console.warn('[WhatsApp API] Erro ao obter email do usuário:', error);
  }
  
  // Log da requisição com URL completa
  const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
  console.log(`[WhatsApp API] ${config.method?.toUpperCase()} ${fullUrl}`, {
    baseURL: config.baseURL,
    timeout: config.timeout
  });
  
  return config;
});

// Interceptor de resposta para logs
whatsappApi.interceptors.response.use(
  (response) => {
    console.log(`[WhatsApp API] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(`[WhatsApp API] ❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Erro:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Funções genéricas que aceitam connectionId
 */
const getStatusByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.get(`/api/whatsapp/${connectionId}/status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao obter status do WhatsApp (${connectionId})`);
  }
};

const getQRByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.get(`/api/whatsapp/${connectionId}/qr`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao obter QR code (${connectionId})`);
  }
};

const logoutByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.post(`/api/whatsapp/${connectionId}/logout`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao fazer logout (${connectionId})`);
  }
};

const connectByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.post(`/api/whatsapp/${connectionId}/connect`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao conectar (${connectionId})`);
  }
};

const getNumberByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.get(`/api/whatsapp/${connectionId}/number`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao obter número conectado (${connectionId})`);
  }
};

const reactByConnection = async (connectionId, messageId, jid, participant = null) => {
  try {
    const response = await whatsappApi.post(`/api/whatsapp/${connectionId}/react`, {
      messageId,
      jid,
      participant
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao enviar reação (${connectionId})`);
  }
};

const getGruposByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.get(`/api/whatsapp/${connectionId}/grupos`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao listar grupos (${connectionId})`);
  }
};

const getRecentRepliesByConnection = async (connectionId, agent = null) => {
  try {
    const url = agent 
      ? `/api/whatsapp/${connectionId}/replies/recent?agent=${encodeURIComponent(agent)}`
      : `/api/whatsapp/${connectionId}/replies/recent`;
    const response = await whatsappApi.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao obter replies (${connectionId})`);
  }
};

const connectRepliesStreamByConnection = (connectionId, agent = null, onMessage, onError) => {
  const url = agent
    ? `${SKYNET_API_URL}/api/whatsapp/${connectionId}/stream/replies?agent=${encodeURIComponent(agent)}`
    : `${SKYNET_API_URL}/api/whatsapp/${connectionId}/stream/replies`;
  
  const eventSource = new EventSource(url);
  
  eventSource.addEventListener('init', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage({ type: 'init', data });
    } catch (e) {
      console.error('[WhatsApp API] Erro ao processar evento init:', e);
    }
  });
  
  eventSource.addEventListener('reply', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage({ type: 'reply', data });
    } catch (e) {
      console.error('[WhatsApp API] Erro ao processar evento reply:', e);
    }
  });
  
  eventSource.onerror = (error) => {
    console.error('[WhatsApp API] Erro no EventSource:', error);
    if (onError) onError(error);
  };
  
  return eventSource;
};

const pingByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.get(`/api/whatsapp/${connectionId}/ping`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao fazer ping (${connectionId})`);
  }
};

const healthByConnection = async (connectionId) => {
  try {
    const response = await whatsappApi.get(`/api/whatsapp/${connectionId}/health`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao obter health (${connectionId})`);
  }
};

/**
 * Funções específicas para Requisições de Produto
 */
export const getStatusRequisicoesProduto = () => getStatusByConnection('requisicoes-produto');
export const getQRRequisicoesProduto = () => getQRByConnection('requisicoes-produto');
export const logoutRequisicoesProduto = () => logoutByConnection('requisicoes-produto');
export const connectRequisicoesProduto = () => connectByConnection('requisicoes-produto');
export const getNumberRequisicoesProduto = () => getNumberByConnection('requisicoes-produto');
export const reactRequisicoesProduto = (messageId, jid, participant) => reactByConnection('requisicoes-produto', messageId, jid, participant);
export const getGruposRequisicoesProduto = () => getGruposByConnection('requisicoes-produto');
export const getRecentRepliesRequisicoesProduto = (agent) => getRecentRepliesByConnection('requisicoes-produto', agent);
export const connectRepliesStreamRequisicoesProduto = (agent, onMessage, onError) => connectRepliesStreamByConnection('requisicoes-produto', agent, onMessage, onError);
export const pingRequisicoesProduto = () => pingByConnection('requisicoes-produto');
export const healthRequisicoesProduto = () => healthByConnection('requisicoes-produto');

/**
 * Funções específicas para VeloDesk
 */
export const getStatusVelodesk = () => getStatusByConnection('velodesk');
export const getQRVelodesk = () => getQRByConnection('velodesk');
export const logoutVelodesk = () => logoutByConnection('velodesk');
export const connectVelodesk = () => connectByConnection('velodesk');
export const getNumberVelodesk = () => getNumberByConnection('velodesk');
export const reactVelodesk = (messageId, jid, participant) => reactByConnection('velodesk', messageId, jid, participant);
export const getGruposVelodesk = () => getGruposByConnection('velodesk');
export const getRecentRepliesVelodesk = (agent) => getRecentRepliesByConnection('velodesk', agent);
export const connectRepliesStreamVelodesk = (agent, onMessage, onError) => connectRepliesStreamByConnection('velodesk', agent, onMessage, onError);
export const pingVelodesk = () => pingByConnection('velodesk');
export const healthVelodesk = () => healthByConnection('velodesk');

/**
 * Funções genéricas (mantidas para compatibilidade - usam requisicoes-produto)
 * @deprecated Use as funções específicas por conexão
 */
export const getStatus = getStatusRequisicoesProduto;
export const getQR = getQRRequisicoesProduto;
export const logout = logoutRequisicoesProduto;
export const getNumber = getNumberRequisicoesProduto;

export default {
  // Funções genéricas (deprecated)
  getStatus,
  getQR,
  logout,
  getNumber,
  
  // Requisições de Produto
  getStatusRequisicoesProduto,
  getQRRequisicoesProduto,
  logoutRequisicoesProduto,
  getNumberRequisicoesProduto,
  reactRequisicoesProduto,
  getGruposRequisicoesProduto,
  getRecentRepliesRequisicoesProduto,
  connectRepliesStreamRequisicoesProduto,
  pingRequisicoesProduto,
  healthRequisicoesProduto,
  
  // VeloDesk
  getStatusVelodesk,
  getQRVelodesk,
  logoutVelodesk,
  getNumberVelodesk,
  reactVelodesk,
  getGruposVelodesk,
  getRecentRepliesVelodesk,
  connectRepliesStreamVelodesk,
  pingVelodesk,
  healthVelodesk
};
