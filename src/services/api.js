// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptors para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Erro do servidor
      const message = error.response.data?.error || 'Erro do servidor';
      throw new Error(message);
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    } else {
      // Outros erros
      throw new Error('Erro inesperado');
    }
  }
);

// API para Artigos
export const artigosAPI = {
  // Listar todos os artigos
  getAll: async () => {
    const response = await api.get('/artigos');
    return response.data;
  },

  // Criar novo artigo
  create: async (data) => {
    const response = await api.post('/artigos', data);
    return response.data;
  },

  // Atualizar artigo
  update: async (id, data) => {
    const response = await api.put(`/artigos/${id}`, data);
    return response.data;
  },

  // Deletar artigo
  delete: async (id) => {
    const response = await api.delete(`/artigos/${id}`);
    return response.data;
  }
};

// API para Velonews
export const velonewsAPI = {
  // Listar todas as velonews
  getAll: async () => {
    const response = await api.get('/velonews');
    return response.data;
  },

  // Criar nova velonews
  create: async (data) => {
    const response = await api.post('/velonews', data);
    return response.data;
  },

  // Atualizar velonews
  update: async (id, data) => {
    const response = await api.put(`/velonews/${id}`, data);
    return response.data;
  },

  // Deletar velonews
  delete: async (id) => {
    const response = await api.delete(`/velonews/${id}`);
    return response.data;
  }
};

// API para Bot Perguntas
export const botPerguntasAPI = {
  // Listar todas as perguntas
  getAll: async () => {
    const response = await api.get('/bot-perguntas');
    return response.data;
  },

  // Criar nova pergunta
  create: async (data) => {
    const response = await api.post('/bot-perguntas', data);
    return response.data;
  },

  // Atualizar pergunta
  update: async (id, data) => {
    const response = await api.put(`/bot-perguntas/${id}`, data);
    return response.data;
  },

  // Deletar pergunta
  delete: async (id) => {
    const response = await api.delete(`/bot-perguntas/${id}`);
    return response.data;
  }
};

// API para IGP
export const igpAPI = {
  // Obter métricas
  getMetrics: async () => {
    const response = await api.get('/igp/metrics');
    return response.data;
  },

  // Obter relatórios
  getReports: async (params = {}) => {
    const response = await api.get('/igp/reports', { params });
    return response.data;
  },

  // Exportar dados
  exportData: async (format, data, filename) => {
    const response = await api.post(`/igp/export/${format}`, { data, filename });
    return response.data;
  }
};

// API de Health Check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
