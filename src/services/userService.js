// VERSION: v1.2.6 | DATE: 2026-06-02 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.2.6 - getAuthorizedUser: consulta API para todos os e-mails (funções administrativas vêm do MongoDB)
// CHANGELOG: v1.2.5 - Bypass getAuthorizedUser: gestaoQa nos tickets
// CHANGELOG: v1.2.3 | DATE: 2025-11-13
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
    
    // BYPASS TEMPORÁRIO: Permitir login do Lucas Gravina
    if (email === 'lucas.gravina@velotax.com.br') {
      return true;
    }
    
    const response = await usersAPI.isAuthorized(email);
    
    // O campo 'authorized' está no nível raiz da resposta
    const isAuthorized = response.authorized;
    
    return isAuthorized;
  } catch (error) {
    console.error('Erro ao verificar autorização do usuário:', error);
    
    // BYPASS TEMPORÁRIO: Em caso de erro, permitir login do Lucas Gravina
    if (email === 'lucas.gravina@velotax.com.br') {
      return true;
    }
    
    return false;
  }
};

// Função para obter dados do usuário autorizado
export const getAuthorizedUser = async (email) => {
  try {
    const response = await usersAPI.getByEmail(email);
    const mongoUser = response.data || response;
    return mongoUser;
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
    _userTickets: userData.tiposTickets || {},
    _funcoesAdministrativas: {
      avaliador: userData.funcoesAdministrativas?.avaliador || false,
      auditoria: userData.funcoesAdministrativas?.auditoria || false,
      relatoriosGestao: userData.funcoesAdministrativas?.relatoriosGestao || false
    }
  };
};

// Função para adicionar novo usuário autorizado
export const addAuthorizedUser = async (userData) => {
  try {
    // Se os dados já estão no formato MongoDB (vêm do ConfigPage), usar diretamente
    // Se não, mapear do formato frontend para MongoDB
    let mongoData;
    
    if (userData._userMail && userData._userId) {
      // Já está no formato MongoDB - usar diretamente
      mongoData = userData;
    } else if (userData.email && userData.nome) {
      // Está no formato frontend - mapear para MongoDB
      mongoData = mapToMongoSchema(userData);
    } else {
      // Tentar mapear mesmo assim (fallback)
      mongoData = mapToMongoSchema(userData);
    }
    
    console.log('📤 Dados para criação de usuário:', mongoData);
    
    // Validar campos obrigatórios antes de enviar
    if (!mongoData._userMail || !mongoData._userId || !mongoData._userRole) {
      throw new Error('Email, UserId e UserRole são obrigatórios');
    }
    
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
    
    if (updatedData._userClearance || updatedData._userTickets || updatedData._funcoesAdministrativas) {
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

// Buscar avaliadores válidos (apenas flag avaliador=true)
export const getAvaliadoresValidos = async () => {
  try {
    console.log('🔍 DEBUG - Iniciando busca de avaliadores válidos...');
    const users = await getAllAuthorizedUsers();
    console.log('🔍 DEBUG - Total de usuários encontrados:', users.length);
    console.log('🔍 DEBUG - Usuários encontrados:', users);
    
    // Filtrar usuários que são avaliadores válidos
    const avaliadores = users.filter(user => {
      console.log(`🔍 DEBUG - Analisando usuário: ${user._userMail || user.email}`);
      console.log(`🔍 DEBUG - Funções administrativas:`, user._funcoesAdministrativas);
      
      // CONTEXTO 3: Verificar APENAS se tem flag de avaliador
      const isAvaliador = user._funcoesAdministrativas && user._funcoesAdministrativas.avaliador === true;
      console.log(`🔍 DEBUG - É avaliador? ${isAvaliador}`);
      
      const isValid = isAvaliador;
      console.log(`🔍 DEBUG - É avaliador válido? ${isValid}`);
      
      return isValid;
    });
    
    console.log('🔍 DEBUG - Avaliadores filtrados:', avaliadores);
    
    // Retornar apenas os nomes dos avaliadores
    const nomesAvaliadores = avaliadores.map(user => {
      // Usar _userId que contém o nome do usuário, senão usar email como fallback
      const nome = user._userId || user._userMail;
      console.log(`🔍 DEBUG - Mapeando usuário ${user._userMail} para nome: ${nome}`);
      return nome;
    });
    
    console.log('✅ Avaliadores válidos encontrados:', nomesAvaliadores);
    return nomesAvaliadores;
  } catch (error) {
    console.error('Erro ao buscar avaliadores válidos:', error);
    console.log('⚠️ API não disponível, usando fallback local...');
    
    // Fallback: verificar localStorage para usuários
    try {
      const localUsers = JSON.parse(localStorage.getItem('authorizedUsers') || '[]');
      console.log('🔍 DEBUG - Usuários do localStorage:', localUsers);
      
      // Filtrar usuários que são avaliadores válidos no localStorage
      const avaliadores = localUsers.filter(user => {
        console.log(`🔍 DEBUG - Analisando usuário local: ${user._userMail}`);
        console.log(`🔍 DEBUG - Funções administrativas local:`, user._funcoesAdministrativas);
        
        // CONTEXTO 3: Verificar APENAS se tem flag de avaliador
        const isAvaliador = user._funcoesAdministrativas && user._funcoesAdministrativas.avaliador === true;
        console.log(`🔍 DEBUG - É avaliador local? ${isAvaliador}`);
        
        const isValid = isAvaliador;
        console.log(`🔍 DEBUG - É avaliador válido local? ${isValid}`);
        
        return isValid;
      });
      
      console.log('🔍 DEBUG - Avaliadores filtrados do localStorage:', avaliadores);
      
      // Retornar apenas os nomes dos avaliadores
      const nomesAvaliadores = avaliadores.map(user => {
        // Usar _userId que contém o nome do usuário, senão usar email como fallback
        const nome = user._userId || user._userMail;
        console.log(`🔍 DEBUG - Mapeando usuário local ${user._userMail} para nome: ${nome}`);
        return nome;
      });
      
      console.log('✅ Avaliadores válidos encontrados no localStorage:', nomesAvaliadores);
      return nomesAvaliadores;
      
    } catch (localError) {
      console.error('Erro ao acessar localStorage:', localError);
      console.log('⚠️ Usando fallback: lista vazia de avaliadores');
      return [];
    }
  }
};
