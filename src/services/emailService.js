// VERSION: v1.1.0 | DATE: 2026-04-15 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.1.0 - Origem SKYNET via getResolvedApiOrigin (dev → localhost)
/**
 * VeloHub Console - Email Service
 * 
 * Serviço para comunicação com API de email do SKYNET
 * Gerencia status, configurações e controle do serviço de email
 */

import axios from 'axios';
import { getResolvedApiOrigin } from './api';

const SKYNET_API_URL = getResolvedApiOrigin();

const emailApi = axios.create({
  baseURL: SKYNET_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar email do usuário nas requisições
emailApi.interceptors.request.use((config) => {
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
    console.warn('[Email API] Erro ao obter email do usuário:', error);
  }
  
  console.log(`[Email API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor de resposta para logs
emailApi.interceptors.response.use(
  (response) => {
    console.log(`[Email API] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`[Email API] ❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Erro:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Obter status do serviço de email
 * @returns {Promise<Object>} Status do serviço (enabled, status, lastChecked)
 */
export const getEmailStatus = async () => {
  try {
    const response = await emailApi.get('/api/email/status');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter status do serviço de email');
  }
};

/**
 * Obter configurações do serviço de email (senha mascarada)
 * @returns {Promise<Object>} Configurações SMTP
 */
export const getEmailConfig = async () => {
  try {
    const response = await emailApi.get('/api/email/config');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter configurações do serviço de email');
  }
};

/**
 * Testar conexão SMTP com credenciais fornecidas
 * @param {Object} config - Configuração SMTP { host, port, user, password }
 * @returns {Promise<Object>} Resultado do teste { success, message }
 */
export const testEmailConnection = async (config) => {
  try {
    const response = await emailApi.post('/api/email/test', config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao testar conexão SMTP');
  }
};

/**
 * Atualizar configurações SMTP
 * @param {Object} config - Configuração SMTP { host, port, user, password, from }
 * @returns {Promise<Object>} Configurações atualizadas (senha mascarada)
 */
export const updateEmailConfig = async (config) => {
  try {
    const response = await emailApi.put('/api/email/config', config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao atualizar configurações do serviço de email');
  }
};

/**
 * Ativar ou desativar serviço de email
 * @param {boolean} enabled - true para ativar, false para desativar
 * @returns {Promise<Object>} Novo status do serviço
 */
export const toggleEmailService = async (enabled) => {
  try {
    const response = await emailApi.post('/api/email/toggle', { enabled });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao ${enabled ? 'ativar' : 'desativar'} serviço de email`);
  }
};

export default {
  getEmailStatus,
  getEmailConfig,
  testEmailConnection,
  updateEmailConfig,
  toggleEmailService
};
