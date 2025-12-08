/**
 * VeloHub Console - WhatsApp API Service
 * VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
 * 
 * Serviço para comunicação com API WhatsApp do SKYNET
 */

import axios from 'axios';

// URL base do SKYNET (pode ser configurada via variável de ambiente)
const SKYNET_API_URL = process.env.REACT_APP_SKYNET_API_URL || 'http://localhost:3001';

const whatsappApi = axios.create({
  baseURL: SKYNET_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para operações WhatsApp
});

/**
 * Obter status da conexão WhatsApp
 * @returns {Promise<Object>} { connected, status, number, numberFormatted, hasQR }
 */
export const getStatus = async () => {
  try {
    const response = await whatsappApi.get('/api/whatsapp/status');
    return response.data;
  } catch (error) {
    console.error('[WhatsApp API] Erro ao obter status:', error);
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
    return response.data;
  } catch (error) {
    console.error('[WhatsApp API] Erro ao obter QR:', error);
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
    return response.data;
  } catch (error) {
    console.error('[WhatsApp API] Erro ao fazer logout:', error);
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
    return response.data;
  } catch (error) {
    console.error('[WhatsApp API] Erro ao obter número:', error);
    throw new Error(error.response?.data?.error || 'Erro ao obter número conectado');
  }
};

export default {
  getStatus,
  getQR,
  logout,
  getNumber
};

