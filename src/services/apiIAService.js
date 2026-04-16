// VERSION: v1.1.0 | DATE: 2026-04-15 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.1.0 - Origem SKYNET via getResolvedApiOrigin (dev → localhost)
/**
 * VeloHub Console - API de IA Service
 * 
 * Serviço para comunicação com API de serviços de IA do SKYNET
 * Gerencia status, configurações e controle de serviços de IA
 */

import axios from 'axios';
import { getResolvedApiOrigin } from './api';

const SKYNET_API_URL = getResolvedApiOrigin();

const aiServicesApi = axios.create({
  baseURL: SKYNET_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar email do usuário nas requisições
aiServicesApi.interceptors.request.use((config) => {
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
    console.warn('[AI Services API] Erro ao obter email do usuário:', error);
  }
  
  console.log(`[AI Services API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor de resposta para logs
aiServicesApi.interceptors.response.use(
  (response) => {
    console.log(`[AI Services API] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`[AI Services API] ❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Erro:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Obter status dos serviços de IA
 * @returns {Promise<Object>} Status de ambos serviços
 */
export const getAIServicesStatus = async () => {
  try {
    const response = await aiServicesApi.get('/api/ai-services/status');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter status dos serviços de IA');
  }
};

/**
 * Obter configurações dos serviços de IA (API keys mascaradas)
 * @returns {Promise<Object>} Configurações mascaradas
 */
export const getAIServicesConfig = async () => {
  try {
    const response = await aiServicesApi.get('/api/ai-services/config');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter configurações dos serviços de IA');
  }
};

/**
 * Ativar ou desativar um serviço de IA
 * @param {string} service - Nome do serviço ('veloredes' ou 'workerQualidade')
 * @param {boolean} enabled - true para ativar, false para desativar
 * @returns {Promise<Object>} Novo status do serviço
 */
export const toggleAIService = async (service, enabled) => {
  try {
    const response = await aiServicesApi.post('/api/ai-services/toggle', {
      service,
      enabled
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || `Erro ao ${enabled ? 'ativar' : 'desativar'} serviço`);
  }
};

export default {
  getAIServicesStatus,
  getAIServicesConfig,
  toggleAIService
};
