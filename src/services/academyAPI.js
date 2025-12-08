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

// API para Cursos (normalizado)
export const cursosAPI = {
  // Listar todos os cursos
  getAll: async () => {
    const response = await api.get('/academy/cursos');
    return response.data?.data || response.data || [];
  },

  // Buscar curso por ID
  getById: async (id) => {
    const response = await api.get(`/academy/cursos/${id}`);
    return response.data?.data || response.data;
  },

  // Buscar curso completo (com módulos, seções e aulas)
  getComplete: async (id) => {
    const response = await api.get(`/academy/cursos/${id}/complete`);
    return response.data?.data || response.data;
  },

  // Buscar cursos ativos
  getActive: async () => {
    const response = await api.get('/academy/cursos/active');
    return response.data?.data || response.data || [];
  },

  // Buscar cursos por nome
  getByNome: async (cursoNome) => {
    const response = await api.get(`/academy/cursos/curso/${cursoNome}`);
    return response.data?.data || response.data || [];
  },

  // Buscar cursos por classe
  getByClasse: async (cursoClasse) => {
    const response = await api.get(`/academy/cursos/classe/${cursoClasse}`);
    return response.data?.data || response.data || [];
  },

  // Criar novo curso
  create: async (data) => {
    const response = await api.post('/academy/cursos', data);
    return response.data?.data || response.data;
  },

  // Atualizar curso
  update: async (id, data) => {
    const response = await api.put(`/academy/cursos/${id}`, data);
    return response.data?.data || response.data;
  },

  // Deletar curso
  delete: async (id) => {
    const response = await api.delete(`/academy/cursos/${id}`);
    return response.data;
  }
};

// API para Módulos
export const modulosAPI = {
  // Buscar módulos por curso
  getByCursoId: async (cursoId) => {
    const response = await api.get(`/academy/modulos/curso/${cursoId}`);
    return response.data?.data || response.data || [];
  },

  // Buscar módulo por ID
  getById: async (id) => {
    const response = await api.get(`/academy/modulos/${id}`);
    return response.data?.data || response.data;
  },

  // Criar novo módulo
  create: async (data) => {
    const response = await api.post('/academy/modulos', data);
    return response.data?.data || response.data;
  },

  // Atualizar módulo
  update: async (id, data) => {
    const response = await api.put(`/academy/modulos/${id}`, data);
    return response.data?.data || response.data;
  },

  // Deletar módulo
  delete: async (id) => {
    const response = await api.delete(`/academy/modulos/${id}`);
    return response.data;
  }
};

// API para Seções
export const secoesAPI = {
  // Buscar seções por módulo
  getByModuloId: async (moduloId) => {
    const response = await api.get(`/academy/secoes/modulo/${moduloId}`);
    return response.data?.data || response.data || [];
  },

  // Buscar seção por ID
  getById: async (id) => {
    const response = await api.get(`/academy/secoes/${id}`);
    return response.data?.data || response.data;
  },

  // Criar nova seção
  create: async (data) => {
    const response = await api.post('/academy/secoes', data);
    return response.data?.data || response.data;
  },

  // Atualizar seção
  update: async (id, data) => {
    const response = await api.put(`/academy/secoes/${id}`, data);
    return response.data?.data || response.data;
  },

  // Deletar seção
  delete: async (id) => {
    const response = await api.delete(`/academy/secoes/${id}`);
    return response.data;
  }
};

// API para Aulas
export const aulasAPI = {
  // Buscar aulas por seção
  getBySecaoId: async (secaoId) => {
    const response = await api.get(`/academy/aulas/secao/${secaoId}`);
    return response.data?.data || response.data || [];
  },

  // Buscar aula por ID
  getById: async (id) => {
    const response = await api.get(`/academy/aulas/${id}`);
    return response.data?.data || response.data;
  },

  // Criar nova aula
  create: async (data) => {
    const response = await api.post('/academy/aulas', data);
    return response.data?.data || response.data;
  },

  // Atualizar aula
  update: async (id, data) => {
    const response = await api.put(`/academy/aulas/${id}`, data);
    return response.data?.data || response.data;
  },

  // Deletar aula
  delete: async (id) => {
    const response = await api.delete(`/academy/aulas/${id}`);
    return response.data;
  }
};

// API para Cursos Conteudo (DEPRECATED - usar cursosAPI.getComplete)
export const cursosConteudoAPI = {
  // Listar todos os cursos (usa endpoint completo)
  getAll: async () => {
    const cursos = await cursosAPI.getAll();
    // Para cada curso, buscar estrutura completa
    const cursosCompletos = await Promise.all(
      cursos.map(async (curso) => {
        try {
          return await cursosAPI.getComplete(curso._id);
        } catch (error) {
          console.warn(`Erro ao buscar curso completo ${curso._id}:`, error);
          return curso;
        }
      })
    );
    return cursosCompletos;
  },

  // Buscar curso por ID (usa endpoint completo)
  getById: async (id) => {
    return await cursosAPI.getComplete(id);
  },

  // Buscar cursos ativos (usa endpoint completo)
  getActive: async () => {
    const cursos = await cursosAPI.getActive();
    const cursosCompletos = await Promise.all(
      cursos.map(async (curso) => {
        try {
          return await cursosAPI.getComplete(curso._id);
        } catch (error) {
          console.warn(`Erro ao buscar curso completo ${curso._id}:`, error);
          return curso;
        }
      })
    );
    return cursosCompletos;
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

  // Criar novo curso (usa nova API)
  create: async (data) => {
    return await cursosAPI.create(data);
  },

  // Atualizar curso (usa nova API)
  update: async (id, data) => {
    return await cursosAPI.update(id, data);
  },

  // Deletar curso (usa nova API)
  delete: async (id) => {
    return await cursosAPI.delete(id);
  }
};

// Exportar API unificada
export const academyAPI = {
  courseProgress: courseProgressAPI,
  cursosConteudo: cursosConteudoAPI, // DEPRECATED - usar cursos, modulos, secoes, aulas
  cursos: cursosAPI,
  modulos: modulosAPI,
  secoes: secoesAPI,
  aulas: aulasAPI
};

export default academyAPI;

