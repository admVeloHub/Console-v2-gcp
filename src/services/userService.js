// VERSION: v3.4.7 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

import { usersAPI } from './api';

// Cache local para melhor performance
let usersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para verificar se o cache é válido
const isCacheValid = () => {
  return usersCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

// Função para limpar o cache
const clearCache = () => {
  usersCache = null;
  cacheTimestamp = null;
};

// Função para verificar se um email está autorizado
export const isUserAuthorized = async (email) => {
  try {
    console.log('Verificando autorização para email:', email);
    const response = await usersAPI.isAuthorized(email);
    console.log('Resposta da verificação:', response);
    
    // O campo 'authorized' está no nível raiz da resposta
    const isAuthorized = response.authorized;
    console.log('Usuário autorizado?', isAuthorized);
    
    return isAuthorized;
  } catch (error) {
    console.error('Erro ao verificar autorização do usuário:', error);
    return false;
  }
};

// Função para obter dados do usuário autorizado
export const getAuthorizedUser = async (email) => {
  try {
    const response = await usersAPI.getByEmail(email);
    // Extrair dados do usuário da resposta
    const mongoUser = response.data || response;
    return mongoUser; // Retorna dados diretamente do MongoDB
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
};

// Função para mapear dados do frontend para o schema do MongoDB
const mapToMongoSchema = (userData) => {
  return {
    _userMail: userData.email,
    _userId: userData.nome, // Nome do usuário no cadastro
    _userRole: userData.funcao || 'Usuário',
    _userClearance: {
      ...userData.permissoes,
      servicos: userData.permissoes?.servicos || false
    },
    _userTickets: userData.tiposTickets || {}
  };
};

// Função para adicionar novo usuário autorizado
export const addAuthorizedUser = async (userData) => {
  try {
    const mongoData = mapToMongoSchema(userData);
    const newUser = await usersAPI.create(mongoData);
    clearCache(); // Limpar cache após adicionar usuário
    return newUser; // Retorna dados diretamente do MongoDB
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw error;
  }
};

// Função para atualizar usuário autorizado
export const updateAuthorizedUser = async (email, updatedData) => {
  try {
    // Se os dados já estão no formato MongoDB (vêm do modal de permissões), usar diretamente
    // Se não, mapear do formato frontend para MongoDB
    let mongoData;
    
    if (updatedData._userClearance || updatedData._userTickets) {
      // Já está no formato MongoDB - usar diretamente
      mongoData = updatedData;
    } else if (updatedData.permissoes || updatedData.tiposTickets) {
      // Está no formato frontend - mapear para MongoDB
      mongoData = mapToMongoSchema(updatedData);
    } else {
      // Dados básicos - manter estrutura MongoDB existente
      mongoData = updatedData;
    }
    
    console.log('Dados para atualização:', mongoData);
    console.log('Email do usuário:', email);
    
    const updatedMongoUser = await usersAPI.update(email, mongoData);
    clearCache(); // Limpar cache após atualizar usuário
    return updatedMongoUser; // Retorna dados diretamente do MongoDB
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

// Função para obter todos os usuários autorizados
export const getAllAuthorizedUsers = async () => {
  try {
    // Verificar cache primeiro
    if (isCacheValid()) {
      console.log('Retornando usuários do cache:', usersCache);
      return usersCache;
    }

    console.log('Buscando usuários do backend...');
    // Buscar do backend
    const response = await usersAPI.getAll();
    console.log('Resposta do backend:', response);
    
    // Extrair o array de usuários da resposta
    const mongoUsers = response.data || response;
    console.log('Usuários extraídos:', mongoUsers);
    
    // Atualizar cache
    usersCache = mongoUsers;
    cacheTimestamp = Date.now();
    
    return mongoUsers; // Retorna dados diretamente do MongoDB
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    
    // Em caso de erro, tentar usar cache mesmo que expirado
    if (usersCache) {
      console.warn('Usando cache expirado devido a erro na API');
      return usersCache;
    }
    
    throw error;
  }
};

// Função para remover usuário autorizado
export const removeAuthorizedUser = async (email) => {
  try {
    await usersAPI.delete(email);
    clearCache(); // Limpar cache após remover usuário
    return true;
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    throw error;
  }
};
