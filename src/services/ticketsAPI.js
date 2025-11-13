// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// Serviço de API para Chamados Internos - Integração com backend real

import api from './api';

export const ticketsAPI = {
  /**
   * Buscar todos os tickets
   * GET /api/support/tickets
   */
  getAll: async () => {
    try {
      const response = await api.get('/support/tickets');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      throw error;
    }
  },

  /**
   * Buscar ticket específico por ID
   * GET /api/support/ticket/:id
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/support/ticket/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
      throw error;
    }
  },

  /**
   * Criar ticket de conteúdo
   * POST /api/support/tk-conteudos
   * Para gêneros: Artigo, Processo, Roteiro, Treinamento, Funcionalidade, Recurso Adicional
   */
  createConteudo: async (data) => {
    try {
      const response = await api.post('/support/tk-conteudos', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ticket de conteúdo:', error);
      throw error;
    }
  },

  /**
   * Criar ticket de gestão
   * POST /api/support/tk-gestao
   * Para gêneros: Gestão, RH e Financeiro, Facilities
   */
  createGestao: async (data) => {
    try {
      const response = await api.post('/support/tk-gestao', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ticket de gestão:', error);
      throw error;
    }
  },

  /**
   * Atualizar ticket de conteúdo
   * PUT /api/support/tk-conteudos
   * Apenas para IDs com prefixo TKC-
   */
  updateConteudo: async (id, data) => {
    try {
      const response = await api.put('/support/tk-conteudos', { ...data, _id: id });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ticket de conteúdo:', error);
      throw error;
    }
  },

  /**
   * Atualizar ticket de gestão
   * PUT /api/support/tk-gestao
   * Apenas para IDs com prefixo TKG-
   */
  updateGestao: async (id, data) => {
    try {
      const response = await api.put('/support/tk-gestao', { ...data, _id: id });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ticket de gestão:', error);
      throw error;
    }
  },

  /**
   * Método auxiliar para determinar o endpoint correto baseado no gênero
   */
  getEndpointByGenero: (genero) => {
    const generosConteudo = [
      'Artigo', 
      'Processo', 
      'Roteiro', 
      'Treinamento', 
      'Funcionalidade', 
      'Recurso Adicional'
    ];
    
    return generosConteudo.includes(genero) ? 'conteudo' : 'gestao';
  },

  /**
   * Método auxiliar para determinar o endpoint correto baseado no ID
   */
  getEndpointById: (id) => {
    return id.startsWith('TKC-') ? 'conteudo' : 'gestao';
  }
};
