// VERSION: v1.1.1 | DATE: 2026-03-27 | AUTHOR: VeloHub Development Team
import axios from 'axios';

// Função auxiliar para normalizar URL base (remove /api do final se existir)
const normalizeBaseUrl = (url) => {
  return url.replace(/\/api\/?$/, '');
};

// Configuração base da API - garantir que sempre termine com /api
const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL || 'https://backend-gcp-hfsqj6konq-ue.a.run.app') + '/api';

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

// API para Cursos Conteudo (estrutura aninhada - cursos_conteudo)
export const cursosConteudoAPI = {
  // Listar todos os cursos (usa endpoint cursos-conteudo diretamente)
  getAll: async () => {
    const response = await api.get('/academy/cursos-conteudo');
    // A resposta vem como { success: true, data: [...], count: N }
    const dados = response.data?.data || response.data || [];
    console.log('📡 Resposta getAll cursos-conteudo:', {
      success: response.data?.success,
      count: response.data?.count,
      dadosLength: Array.isArray(dados) ? dados.length : 'não é array'
    });
    return dados;
  },

  // Buscar curso por ID (usa endpoint cursos-conteudo diretamente)
  getById: async (id) => {
    const response = await api.get(`/academy/cursos-conteudo/${id}`);
    return response.data?.data || response.data;
  },

  // Buscar cursos ativos (usa endpoint cursos-conteudo diretamente)
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

  // Criar novo curso (usa endpoint cursos-conteudo diretamente)
  create: async (data) => {
    console.log('📤 API create - Enviando dados:', {
      cursoNome: data.cursoNome,
      modules: data.modules?.length || 0
    });
    const response = await api.post('/academy/cursos-conteudo', data);
    console.log('📥 API create - Resposta completa:', response.data);
    
    // A resposta vem como { success: true, data: {...} } ou { success: false, error: '...' }
    if (response.data?.success === false) {
      const erro = response.data.error || 'Erro ao criar curso';
      console.error('❌ API create - Erro:', erro);
      throw new Error(erro);
    }
    
    // Retornar a resposta completa para que o código possa verificar success e data
    return response.data;
  },

  // Atualizar curso (usa endpoint cursos-conteudo diretamente)
  update: async (id, data) => {
    const response = await api.put(`/academy/cursos-conteudo/${id}`, data);
    // A resposta pode vir como { success: true, data: {...} } ou diretamente como objeto
    const resultado = response.data?.data || response.data;
    // Se houver erro na resposta, propagar
    if (response.data?.success === false) {
      throw new Error(response.data.error || 'Erro ao atualizar curso');
    }
    return resultado;
  },

  // Deletar curso (usa endpoint cursos-conteudo diretamente)
  delete: async (id) => {
    const response = await api.delete(`/academy/cursos-conteudo/${id}`);
    return response.data;
  }
};

// API quiz_conteudo (academy_registros) — quizID alinhado ao quizId do tema (nome do tema em snake_case)
export const quizConteudoAPI = {
  getByQuizId: async (quizID) => {
    const encoded = encodeURIComponent(quizID);
    const response = await api.get(`/academy/quiz-conteudo/quiz/${encoded}`, {
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 404
    });
    if (response.status === 404) return null;
    return response.data?.data ?? null;
  },

  upsert: async (quizID, body) => {
    const encoded = encodeURIComponent(quizID);
    const response = await api.put(`/academy/quiz-conteudo/quiz/${encoded}`, body);
    if (response.data?.success === false) {
      throw new Error(response.data.error || 'Erro ao salvar quiz');
    }
    return response.data?.data || response.data;
  }
};

// Exportar API unificada
export const academyAPI = {
  courseProgress: courseProgressAPI,
  cursosConteudo: cursosConteudoAPI, // DEPRECATED - usar cursos, modulos, secoes, aulas
  cursos: cursosAPI,
  modulos: modulosAPI,
  secoes: secoesAPI,
  aulas: aulasAPI,
  quizConteudo: quizConteudoAPI
};

export default academyAPI;

