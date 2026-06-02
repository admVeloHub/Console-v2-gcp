// VERSION: v1.5.0 | DATE: 2026-05-29 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.5.0 - Removidas funções SMTP (getEmailConfig, testEmailConnection, updateEmailConfig); só Gmail API
// CHANGELOG: v1.4.0 - Logs e mensagens de erro da API de e-mail: redação de PEM/private_key (nada de credencial no DevTools)
/**
 * VeloHub Console - Email Service (SKYNET — Gmail API)
 */

import axios from 'axios';
import { getResolvedApiOrigin } from './api';

const SKYNET_API_URL = getResolvedApiOrigin();

function redactSensitiveEmailText(input) {
  if (input == null || input === '') return input;
  let s;
  try {
    s = typeof input === 'string' ? input : JSON.stringify(input);
  } catch {
    s = '[resposta não serializável — omissão por segurança]';
  }
  s = s.replace(/-----BEGIN[^\n]+-----[\s\S]*?-----END[^\n]+-----/gi, '[material sensível oculto]');
  s = s.replace(/"private_key"\s*:\s*"[^"]*"/gi, '"private_key":"[oculto]"');
  return s.length > 1200 ? `${s.slice(0, 1200)}…` : s;
}

function wrapEmailError(error, fallbackMessage) {
  const apiMsg =
    error.response?.data?.error ||
    error.response?.data?.message ||
    (typeof error.response?.data === 'string' ? error.response.data : null);
  const raw = apiMsg || fallbackMessage || error.message || 'Erro na API de e-mail';
  const message = redactSensitiveEmailText(String(raw));
  const wrapped = new Error(message);
  if (error.response?.status != null) {
    wrapped.statusCode = error.response.status;
  }
  return wrapped;
}

const emailApi = axios.create({
  baseURL: SKYNET_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

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
  return config;
});

export const getEmailStatus = async () => {
  try {
    const response = await emailApi.get('/api/email/status');
    return response.data;
  } catch (error) {
    throw wrapEmailError(error, 'Erro ao obter status do serviço de email');
  }
};

export const toggleEmailService = async (enabled) => {
  try {
    const response = await emailApi.post('/api/email/toggle', { enabled });
    return response.data;
  } catch (error) {
    throw wrapEmailError(error, `Erro ao ${enabled ? 'ativar' : 'desativar'} serviço de email`);
  }
};

export const getEmailGmailConfig = async () => {
  try {
    const response = await emailApi.get('/api/email/gmail-config');
    return response.data;
  } catch (error) {
    throw wrapEmailError(error, 'Erro ao obter configuração Gmail');
  }
};

export const putEmailGmailConfig = async (body) => {
  try {
    const response = await emailApi.put('/api/email/gmail-config', body);
    return response.data;
  } catch (error) {
    throw wrapEmailError(error, 'Erro ao salvar configuração Gmail');
  }
};

export const postEmailGmailTest = async (payload = {}) => {
  try {
    const response = await emailApi.post('/api/email/gmail-test', payload);
    return response.data;
  } catch (error) {
    throw wrapEmailError(error, 'Erro ao enviar e-mail de teste Gmail');
  }
};

export default {
  getEmailStatus,
  toggleEmailService,
  getEmailGmailConfig,
  putEmailGmailConfig,
  postEmailGmailTest
};
