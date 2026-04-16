// VERSION: v3.17.1 | DATE: 2026-04-16 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.17.1 - Erros 5xx: priorizar data.message (detalhe do backend) antes de data.error (mensagem genérica)
// CHANGELOG: v3.17.0 - Em NODE_ENV development, fallback da API é http://localhost:3001 (SKYNET local); PRD só em build produção ou REACT_APP_* explícito
// CHANGELOG: v3.16.1 - Payload categorias com Ordem + categoria_id snake_case (backend recalcula ids)
// CHANGELOG: v3.16.0 - artigosCategoriasAPI (GET/PUT /artigos-categorias)
// CHANGELOG: v3.15.1 - Comentários: removidas referências ao módulo WhatsApp removido do Console
// CHANGELOG: v3.15.0 - Base URL: fallback REACT_APP_SKYNET_API_URL antes do default; timeout axios 30s (cold start Cloud Run)
// CHANGELOG: v3.14.8 - Export getResolvedApiUrl para qualidadeAudioService (fetch/SSE mesmo host que axios na rede local)
// CHANGELOG: v3.14.7 - Correção rede local: usar hostname do browser quando API aponta para localhost (resolve lista de colaboradores vazia ao acessar via IP)
import axios from 'axios';

/** Backend SKYNET em PRD quando não há env e o build é produção (`npm run build`). */
export const DEFAULT_SKYNET_API_ORIGIN = 'https://backend-gcp-hfsqj6konq-ue.a.run.app';

/** SKYNET local (`npm start` no Dev - SKYNET — PORT padrão 3001 em server.js). Usado só em `NODE_ENV === 'development'`. */
export const DEFAULT_DEV_SKYNET_ORIGIN = 'http://localhost:3001';

// Função auxiliar para normalizar URL base (remove /api do final se existir)
const normalizeBaseUrl = (url) => {
  return url.replace(/\/api\/?$/, '');
};

/**
 * Origem do backend (sem path /api). Mesma regra que getResolvedApiUrl.
 * Ordem: REACT_APP_API_URL → REACT_APP_SKYNET_API_URL → em development DEFAULT_DEV_SKYNET_ORIGIN → senão DEFAULT_SKYNET_API_ORIGIN.
 */
const resolveEnvOrigin = () => {
  const envUrl =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_SKYNET_API_URL ||
    (process.env.NODE_ENV === 'development' ? DEFAULT_DEV_SKYNET_ORIGIN : DEFAULT_SKYNET_API_ORIGIN);
  const originBase = normalizeBaseUrl(envUrl);
  // Se env usa localhost e estamos no browser com hostname diferente (acesso via IP na LAN)
  if (typeof window !== 'undefined' && envUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const withScheme = originBase.match(/^https?:\/\//) ? originBase : `http://${originBase}`;
    const urlObj = new URL(withScheme);
    const fallbackOrigin = `${urlObj.protocol}//${window.location.hostname}:${urlObj.port || '3001'}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 [Rede local] API origin ajustada para:', fallbackOrigin, '(hostname:', window.location.hostname + ')');
    }
    return fallbackOrigin;
  }
  return originBase;
};

export const getResolvedApiOrigin = () => resolveEnvOrigin();

/**
 * URL base da API REST (axios): origem + `/api`.
 */
export const getResolvedApiUrl = () => resolveEnvOrigin() + '/api';

const API_BASE_URL = getResolvedApiUrl();

// Log da URL configurada (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL configurada:', API_BASE_URL);
  console.log('🔗 REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'não definido (dev usa backend local por defeito)');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s — listas Qualidade + cold start Cloud Run costumam estourar 10s
});

// Interceptor de request para logs detalhados (apenas em desenvolvimento)
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log(`🌐 [API Request] ${config.method?.toUpperCase()} ${fullUrl}`, {
        timeout: config.timeout,
        headers: config.headers
      });
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Interceptors para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log apenas em modo de desenvolvimento ou para erros do servidor
    if (process.env.NODE_ENV === 'development' && error.response) {
      console.error('API Error:', error);
      console.error('❌ Erro detalhado da API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });
    }
    
    if (error.response) {
      // Erro do servidor - preservar detalhes para debug
      // Para erros 400, preservar o erro original
      if (error.response.status === 400) {
        throw error; // Não mascarar erro 400
      }
      
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'Erro do servidor';
      throw new Error(message);
    } else if (error.request) {
      // Erro de rede - diagnóstico detalhado
      const baseURL = error.config?.baseURL || API_BASE_URL;
      const attemptedUrl = error.config?.url ? `${baseURL}${error.config.url}` : baseURL;
      
      // Determinar tipo de erro
      let errorType = 'Erro de conexão';
      let errorDetails = '';
      
      // Obter timeout configurado (pode ser específico da requisição ou padrão)
      const timeoutMs = error.config?.timeout || 30000;
      const timeoutSeconds = timeoutMs / 1000;
      
      if (error.code === 'ECONNABORTED') {
        errorType = 'Timeout';
        errorDetails = `A requisição excedeu o tempo limite (${timeoutSeconds}s). O servidor pode estar lento ou processando muitos dados.`;
      } else if (error.code === 'ERR_NETWORK') {
        errorType = 'Erro de rede';
        errorDetails = 'Não foi possível estabelecer conexão. Verifique sua conexão com a internet.';
      } else if (error.code === 'ERR_CANCELED') {
        errorType = 'Requisição cancelada';
        errorDetails = 'A requisição foi cancelada antes de completar.';
      } else if (error.message?.includes('CORS')) {
        errorType = 'Erro de CORS';
        errorDetails = 'O servidor não permite requisições deste domínio. Verifique as configurações de CORS no backend.';
      } else {
        errorDetails = `Código: ${error.code || 'desconhecido'}. Mensagem: ${error.message || 'sem detalhes'}`;
      }
      
      // Log detalhado em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ [${errorType}]`, {
          attemptedUrl,
          baseURL,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails,
          request: error.request
        });
      }
      
      throw new Error(`${errorType} com ${baseURL.replace('/api', '')}. ${errorDetails} URL tentada: ${attemptedUrl}`);
    } else {
      // Outros erros
      throw new Error(error.message || 'Erro inesperado');
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

// API para categorias de artigos (documento singleton em MongoDB)
export const artigosCategoriasAPI = {
  get: async () => {
    const response = await api.get('/artigos-categorias');
    return response.data;
  },
  update: async (payload) => {
    const response = await api.put('/artigos-categorias', payload);
    return response.data;
  }
};

// API para Velonews
export const velonewsAPI = {
  // Listar todas as velonews
  getAll: async () => {
    const response = await api.get('/velonews');
    // Verificar estrutura da resposta {success, data, count}
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback para formato antigo
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
  },

  // Obter velonews por ID
  getById: async (id) => {
    const response = await api.get(`/velonews/${id}`);
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

// API para Hub Sessions
export const hubSessionsAPI = {
  // GET /api/hub-sessions/user/:email - sessões por email
  getByUserEmail: async (email) => {
    const response = await api.get(`/hub-sessions/user/${email}`);
    return response.data;
  },
  
  // GET /api/hub-sessions/active - sessões ativas
  getActiveSessions: async () => {
    const response = await api.get('/hub-sessions/active');
    return response.data;
  },
  
  // GET /api/hub-sessions - todas as sessões
  getAll: async () => {
    const response = await api.get('/hub-sessions');
    return response.data;
  },
  
  // GET /api/hub-sessions/history/:email - histórico com duração
  getSessionHistory: async (email) => {
    const response = await api.get(`/hub-sessions/history/${email}`);
    return response.data;
  },
  
  // GET /api/hub-sessions/session/:sessionId - sessão específica
  getBySessionId: async (sessionId) => {
    const response = await api.get(`/hub-sessions/session/${sessionId}`);
    return response.data;
  },
  
  // GET /api/hub-sessions/stats - estatísticas gerais
  getStats: async () => {
    const response = await api.get('/hub-sessions/stats');
    return response.data;
  }
};

// API para Velonews Acknowledgments
export const velonewsAcknowledgmentsAPI = {
  // GET /api/velonews-acknowledgments/news/:newsId - quem confirmou uma notícia
  getByNewsId: async (newsId) => {
    const response = await api.get(`/velonews-acknowledgments/news/${newsId}`);
    return response.data;
  },
  
  // GET /api/velonews-acknowledgments/user/:email - notícias confirmadas pelo usuário
  getByUserEmail: async (email) => {
    const response = await api.get(`/velonews-acknowledgments/user/${email}`);
    return response.data;
  },
  
  // GET /api/velonews-acknowledgments/check/:newsId/:email - verificar confirmação específica
  checkAcknowledgment: async (newsId, email) => {
    const response = await api.get(`/velonews-acknowledgments/check/${newsId}/${email}`);
    return response.data;
  },
  
  // GET /api/velonews-acknowledgments/stats - estatísticas gerais
  getStats: async () => {
    const response = await api.get('/velonews-acknowledgments/stats');
    return response.data;
  },
  
  // GET /api/velonews-acknowledgments/recent - confirmações recentes
  getRecent: async () => {
    const response = await api.get('/velonews-acknowledgments/recent');
    return response.data;
  }
};

// API para Hub Análises
export const hubAnalisesAPI = {
  // GET /api/hub-analises/usuarios-online-offline - funcionários online/offline
  // Timeout aumentado para 30s devido ao processamento de grandes volumes de dados
  getUsuariosOnlineOffline: async () => {
    const response = await api.get('/hub-analises/usuarios-online-offline', {
      timeout: 30000 // 30 segundos
    });
    return response.data;
  },
  
  // GET /api/hub-analises/hub-sessions - todas as sessões (suporta filtros ?isActive=true/false, ?userEmail=email)
  // Timeout aumentado para 30s devido ao processamento de grandes volumes de dados
  getHubSessions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive);
    }
    if (filters.userEmail) {
      params.append('userEmail', filters.userEmail);
    }
    const queryString = params.toString();
    const url = `/hub-analises/hub-sessions${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url, {
      timeout: 30000 // 30 segundos
    });
    return response.data;
  },
  
  // GET /api/hub-analises/ciencia-por-noticia - confirmações agrupadas por notícia
  // Timeout aumentado para 30s devido ao processamento de grandes volumes de dados
  getCienciaPorNoticia: async () => {
    const response = await api.get('/hub-analises/ciencia-por-noticia', {
      timeout: 30000 // 30 segundos
    });
    return response.data;
  }
};

// API para Bot Feedback
export const botFeedbackAPI = {
  // GET /api/bot-feedback - lista todos os feedbacks
  getAll: async () => {
    const response = await api.get('/bot-feedback');
    return response.data;
  },
  
  // GET /api/bot-feedback/:id - obtém feedback por ID
  getById: async (id) => {
    const response = await api.get(`/bot-feedback/${id}`);
    return response.data;
  },
  
  // POST /api/bot-feedback - cria novo feedback
  create: async (data) => {
    const response = await api.post('/bot-feedback', data);
    return response.data;
  },
  
  // PUT /api/bot-feedback/:id - atualiza feedback existente
  update: async (id, data) => {
    const response = await api.put(`/bot-feedback/${id}`, data);
    return response.data;
  },
  
  // DELETE /api/bot-feedback/:id - deleta feedback
  delete: async (id) => {
    const response = await api.delete(`/bot-feedback/${id}`);
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
    return response.data;
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

// API para FAQ Bot
export const faqBotAPI = {
  // Atualizar perguntas frequentes do bot
  updateFAQ: async (faqData) => {
    const response = await api.post('/faq-bot', faqData);
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

  // Atualizar funcionário (timeout 30s - operação pode demorar com syncUserToConfig e carga do backend)
  update: async (id, data) => {
    const response = await api.put(`/qualidade/funcionarios/${id}`, data, { timeout: 30000 });
    return response.data;
  },

  // Deletar funcionário
  delete: async (id) => {
    const response = await api.delete(`/qualidade/funcionarios/${id}`);
    return response.data;
  }
};

// API para Qualidade - Funções
export const qualidadeFuncoesAPI = {
  // Listar todas as funções
  getAll: async () => {
    const response = await api.get('/qualidade/funcoes');
    return response.data;
  },

  // Obter função por ID
  getById: async (id) => {
    const response = await api.get(`/qualidade/funcoes/${id}`);
    return response.data;
  },

  // Criar nova função
  create: async (data) => {
    const response = await api.post('/qualidade/funcoes', data);
    return response.data;
  },

  // Atualizar função
  update: async (id, data) => {
    const response = await api.put(`/qualidade/funcoes/${id}`, data);
    return response.data;
  },

  // Deletar função
  delete: async (id) => {
    const response = await api.delete(`/qualidade/funcoes/${id}`);
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
