/**
 * VeloHub Console - WhatsApp API Service
 * VERSION: v1.2.1 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team
 * 
 * Serviço para comunicação com API WhatsApp do SKYNET
 * Requer permissão 'whatsapp' no sistema de permissionamento
 * 
 * Mudanças v1.2.1:
 * - Adicionados logs informativos sobre requisições WhatsApp
 */

import axios from 'axios';

// URL base do SKYNET em produção
// Pode ser sobrescrita via variável de ambiente REACT_APP_SKYNET_API_URL
const SKYNET_API_URL = process.env.REACT_APP_SKYNET_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app';

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
  
  // Log da requisição
  console.log(`[WhatsApp API] ${config.method?.toUpperCase()} ${config.url}`, {
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
 * Obter status da conexão WhatsApp
 * @returns {Promise<Object>} { connected, status, number, numberFormatted, hasQR }
 */
export const getStatus = async () => {
  try {
    const response = await whatsappApi.get('/api/whatsapp/status');
    console.log('[WhatsApp API] Status recebido:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter status do WhatsApp');
  }
};

/**
 * Obter QR code atual
 * @returns {Promise<Object>} { hasQR, qr?, expiresIn?, message? }
 */
export const getQR = async () => {
  try {
    const response = await whatsappApi.get('/api/whatsapp/qr');
    console.log('[WhatsApp API] QR recebido:', { hasQR: response.data.hasQR, expiresIn: response.data.expiresIn });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter QR code');
  }
};

/**
 * Fazer logout e gerar novo QR code
 * @returns {Promise<Object>} { success, message?, error? }
 */
export const logout = async () => {
  try {
    const response = await whatsappApi.post('/api/whatsapp/logout');
    console.log('[WhatsApp API] Logout realizado:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao fazer logout');
  }
};

/**
 * Obter número conectado
 * @returns {Promise<Object>} { number, formatted, connected }
 */
export const getNumber = async () => {
  try {
    const response = await whatsappApi.get('/api/whatsapp/number');
    console.log('[WhatsApp API] Número recebido:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter número conectado');
  }
};

export default {
  getStatus,
  getQR,
  logout,
  getNumber
};

