// VERSION: v1.1.0 | DATE: 2026-05-29 | AUTHOR: VeloHub Development Team
/**
 * Google Agenda Velotax — API do backend VeloHub (agenda corporativa por e-mail configurado).
 */

import axios from 'axios';
import { getResolvedVelohubApiUrl } from '../config/velohubApi';

const velohubApi = axios.create({
  baseURL: getResolvedVelohubApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

velohubApi.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userEmail = user.email || user._userMail;
      if (userEmail) {
        config.headers['X-User-Email'] = userEmail;
      }
    }
  } catch {
    /* ignore */
  }
  return config;
});

function wrapError(error, fallback) {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback ||
    error.message;
  const wrapped = new Error(message);
  if (error.response?.status != null) {
    wrapped.statusCode = error.response.status;
  }
  throw wrapped;
}

export const getGoogleCalendarConfig = async () => {
  try {
    const response = await velohubApi.get('/google-calendar/config');
    return response.data;
  } catch (error) {
    wrapError(error, 'Erro ao obter configuração da Google Agenda');
  }
};

export const putGoogleCalendarConfig = async (feedEmail) => {
  try {
    const response = await velohubApi.put('/google-calendar/config', { feedEmail });
    return response.data;
  } catch (error) {
    wrapError(error, 'Erro ao salvar e-mail da agenda');
  }
};

export const getGoogleCalendarStatus = async () => {
  try {
    const response = await velohubApi.get('/google-calendar/status');
    return response.data;
  } catch (error) {
    wrapError(error, 'Erro ao verificar Google Agenda');
  }
};

export const connectGoogleCalendar = async (code) => {
  try {
    const response = await velohubApi.post('/google-calendar/connect', { code });
    return response.data;
  } catch (error) {
    wrapError(error, 'Erro ao conectar Google Agenda');
  }
};

export const disconnectGoogleCalendar = async () => {
  try {
    const response = await velohubApi.post('/google-calendar/disconnect');
    return response.data;
  } catch (error) {
    wrapError(error, 'Erro ao desconectar Google Agenda');
  }
};

export default {
  getGoogleCalendarConfig,
  putGoogleCalendarConfig,
  getGoogleCalendarStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
};
