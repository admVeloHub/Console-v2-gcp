// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import axios from 'axios';

// Função auxiliar para normalizar URL base (remove /api do final se existir)
const normalizeBaseUrl = (url) => {
  return url.replace(/\/api\/?$/, '');
};

// Configuração base da API - garantir que sempre termine com /api
const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app') + '/api';

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
    console.error('Academy API Error:', error);
    
    if (error.response) {
      const message = error.response.data?.error || 'Erro do servidor';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    } else {
      throw new Error('Erro inesperado');
    }
  }
);

// API para Course Progress
export const courseProgressAPI = {
  // Listar todos os progressos
  getAll: async () => {
    const response = await api.get('/academy/course-progress');
    return response.data?.data || response.data || [];
  },

  // Buscar progresso por ID
  getById: async (id) => {
    const response = await api.get(`/academy/course-progress/${id}`);
    return response.data?.data || response.data;
  },

  // Buscar progressos por usuário
  getByUser: async (userEmail) => {
    const response = await api.get(`/academy/course-progress/user/${userEmail}`);
    return response.data?.data || response.data || [];
  },

  // Buscar progresso específico (usuário + subtítulo)
  getByUserAndSubtitle: async (userEmail, subtitle) => {
    const response = await api.get(`/academy/course-progress/user/${userEmail}/subtitle/${encodeURIComponent(subtitle)}`);
    return response.data?.data || response.data;
  },

  // Criar novo progresso
  create: async (data) => {
    const response = await api.post('/academy/course-progress', data);
    return response.data?.data || response.data;
  },

  // Atualizar progresso
  update: async (id, data) => {
    const response = await api.put(`/academy/course-progress/${id}`, data);
    return response.data?.data || response.data;
  },

  // Deletar progresso
  delete: async (id) => {
    const response = await api.delete(`/academy/course-progress/${id}`);
    return response.data;
  }
};

// API para Cursos Conteudo
export const cursosConteudoAPI = {
  // Listar todos os cursos
  getAll: async () => {
    const response = await api.get('/academy/cursos-conteudo');
    return response.data?.data || response.data || [];
  },

  // Buscar curso por ID
  getById: async (id) => {
    const response = await api.get(`/academy/cursos-conteudo/${id}`);
    return response.data?.data || response.data;
  },

  // Buscar cursos ativos
  getActive: async () => {
    const response = await api.get('/academy/cursos-conteudo/active');
    return response.data?.data || response.data || [];
  },

  // Buscar cursos por nome
  getByNome: async (cursoNome) => {
    const response = await api.get(`/academy/cursos-conteudo/curso/${cursoNome}`);
    return response.data?.data || response.data || [];
  },

  // Buscar cursos por classe
  getByClasse: async (cursoClasse) => {
    const response = await api.get(`/academy/cursos-conteudo/classe/${cursoClasse}`);
    return response.data?.data || response.data || [];
  },

  // Criar novo curso
  create: async (data) => {
    const response = await api.post('/academy/cursos-conteudo', data);
    return response.data?.data || response.data;
  },

  // Atualizar curso
  update: async (id, data) => {
    const response = await api.put(`/academy/cursos-conteudo/${id}`, data);
    return response.data?.data || response.data;
  },

  // Deletar curso
  delete: async (id) => {
    const response = await api.delete(`/academy/cursos-conteudo/${id}`);
    return response.data;
  }
};

// Exportar API unificada
export const academyAPI = {
  courseProgress: courseProgressAPI,
  cursosConteudo: cursosConteudoAPI
};

export default academyAPI;

