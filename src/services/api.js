// VERSION: v3.8.1 | DATE: 2025-01-10 | AUTHOR: VeloHub Development Team
import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://back-console.vercel.app/api';

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

// API para Usuários
export const usersAPI = {
  // Listar todos os usuários
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Criar novo usuário
  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Atualizar usuário
  update: async (email, data) => {
    const response = await api.put(`/users/${email}`, data);
    return response.data;
  },

  // Deletar usuário
  delete: async (email) => {
    const response = await api.delete(`/users/${email}`);
    return response.data;
  },

  // Verificar se usuário está autorizado
  isAuthorized: async (email) => {
    const response = await api.get(`/users/check/${email}`);
    return response.data;
  },

  // Obter dados do usuário
  getByEmail: async (email) => {
    const response = await api.get(`/users/${email}`);
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

// API de Serviços
export const servicesAPI = {
  // Buscar status atual dos módulos
  getModuleStatus: async () => {
    const response = await api.get('/module-status');
    return response.data.data; // Extrair o data interno da resposta
  },

  // Atualizar status de um módulo específico
  updateModuleStatus: async (moduleKey, status) => {
    const response = await api.post('/module-status', {
      moduleKey,
      status
    });
    return response.data;
  },

  // Atualizar múltiplos módulos
  updateMultipleModules: async (modules) => {
    const response = await api.put('/module-status', modules);
    return response.data;
  },

  // Atualizar todos os status dos módulos (seguindo estratégia do backend)
  updateAllModuleStatus: async (schemaData) => {
    const response = await api.post('/module-status', schemaData);
    return response.data;
  }
};

// API para Qualidade - Funcionários
export const qualidadeFuncionariosAPI = {
  // Listar todos os funcionários
  getAll: async () => {
    const response = await api.get('/qualidade/funcionarios');
    return response.data;
  },

  // Listar apenas funcionários ativos
  getAtivos: async () => {
    const response = await api.get('/qualidade/funcionarios/ativos');
    return response.data;
  },

  // Obter funcionário por ID
  getById: async (id) => {
    const response = await api.get(`/qualidade/funcionarios/${id}`);
    return response.data;
  },

  // Criar novo funcionário
  create: async (data) => {
    const response = await api.post('/qualidade/funcionarios', data);
    return response.data;
  },

  // Atualizar funcionário
  update: async (id, data) => {
    const response = await api.put(`/qualidade/funcionarios/${id}`, data);
    return response.data;
  },

  // Deletar funcionário
  delete: async (id) => {
    const response = await api.delete(`/qualidade/funcionarios/${id}`);
    return response.data;
  }
};

// API para Qualidade - Avaliações
export const qualidadeAvaliacoesAPI = {
  // Listar todas as avaliações
  getAll: async () => {
    const response = await api.get('/qualidade/avaliacoes');
    return response.data;
  },

  // Obter avaliação por ID
  getById: async (id) => {
    const response = await api.get(`/qualidade/avaliacoes/${id}`);
    return response.data;
  },

  // Criar nova avaliação
  create: async (data) => {
    const response = await api.post('/qualidade/avaliacoes', data);
    return response.data;
  },

  // Atualizar avaliação
  update: async (id, data) => {
    const response = await api.put(`/qualidade/avaliacoes/${id}`, data);
    return response.data;
  },

  // Deletar avaliação
  delete: async (id) => {
    const response = await api.delete(`/qualidade/avaliacoes/${id}`);
    return response.data;
  }
};

export default api;
