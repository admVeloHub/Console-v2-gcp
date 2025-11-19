// VERSION: v1.0.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

/**
 * Determina o collectionId baseado nas permissões do usuário
 * @param {Object} user - Objeto do usuário com permissões e tiposTickets
 * @returns {string|null} - CollectionId determinado pelas permissões ou null se não tem permissões
 */
export const determineCollectionId = (user) => {
  if (!user || !user.tiposTickets) {
    return null; // Sem permissões = null
  }

  const { tiposTickets } = user;

  // Lista de tipos de tickets para "tk_conteudos"
  const conteudosTypes = ['artigos', 'processos', 'roteiros', 'treinamentos', 'recursos'];
  
  // Lista de tipos de tickets para "tk_gestão"
  const gestaoTypes = ['funcionalidades', 'gestao', 'rhFin', 'facilities'];

  // Verificar se tem acesso a tipos de conteúdo
  const hasConteudosAccess = conteudosTypes.some(type => tiposTickets[type] === true);
  
  // Verificar se tem acesso a tipos de gestão
  const hasGestaoAccess = gestaoTypes.some(type => tiposTickets[type] === true);

  // Determinar collectionId baseado nas permissões
  if (hasConteudosAccess && hasGestaoAccess) {
    return 'console_chamados';
  } else if (hasConteudosAccess) {
    return 'tk_conteudos';
  } else if (hasGestaoAccess) {
    return 'tk_gestão';
  } else {
    return null; // Sem permissões para nenhuma collection
  }
};

/**
 * Gera o userId no formato 'nome_sobrenome' a partir do nome completo
 * @param {string} fullName - Nome completo do usuário
 * @returns {string} - userId no formato 'nome_sobrenome'
 */
export const generateUserId = (fullName) => {
  if (!fullName) {
    return 'usuario_anonimo';
  }

  // Remover acentos e caracteres especiais
  const normalizedName = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Dividir em palavras e pegar as duas primeiras
  const words = normalizedName.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) {
    return 'usuario_anonimo';
  } else if (words.length === 1) {
    return words[0];
  } else {
    return `${words[0]}_${words[1]}`;
  }
};

/**
 * Envia ping para o backend com dados do usuário
 * @param {Object} user - Objeto do usuário
 * @returns {Promise<Object>} - Resposta da API ou null se não deve enviar ping
 */
export const sendUserPing = async (user) => {
  try {
    const userId = generateUserId(user.nome);
    const collectionId = determineCollectionId(user);

    // Se collectionId for null, não enviar ping para o backend
    if (collectionId === null) {
      console.log('Usuário sem permissões para collections - ping não enviado');
      return {
        success: true,
        skipped: true,
        reason: 'Usuário sem permissões para collections',
        pingData: {
          _userId: userId,
          _collectionId: null
        }
      };
    }

    const pingData = {
      _userId: userId,
      _collectionId: collectionId
    };

    console.log('Enviando ping do usuário:', pingData);

    // URL do backend - usar a mesma configuração da API principal
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app/api';
    const apiUrl = `${API_BASE_URL}/user-ping`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pingData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ping enviado com sucesso:', result);
    
    return {
      success: true,
      data: result,
      pingData
    };

  } catch (error) {
    console.error('Erro ao enviar ping do usuário:', error);
    
    return {
      success: false,
      error: error.message,
      pingData: {
        _userId: generateUserId(user?.nome),
        _collectionId: determineCollectionId(user)
      }
    };
  }
};

/**
 * Função utilitária para debug - mostra as permissões e collectionId determinado
 * @param {Object} user - Objeto do usuário
 */
export const debugUserPermissions = (user) => {
  if (!user) {
    console.log('Usuário não fornecido para debug');
    return;
  }

  const collectionId = determineCollectionId(user);
  const userId = generateUserId(user.nome);

  console.group('🔍 Debug - Permissões do Usuário');
  console.log('Nome:', user.nome);
  console.log('Email:', user.email);
  console.log('UserId gerado:', userId);
  console.log('CollectionId determinado:', collectionId === null ? 'null (sem permissões)' : collectionId);
  console.log('Tipos de Tickets:', user.tiposTickets);
  
  // Mostrar quais tipos estão ativos
  const conteudosTypes = ['artigos', 'processos', 'roteiros', 'treinamentos', 'recursos'];
  const gestaoTypes = ['funcionalidades', 'gestao', 'rhFin', 'facilities'];
  
  const activeConteudos = conteudosTypes.filter(type => user.tiposTickets[type]);
  const activeGestao = gestaoTypes.filter(type => user.tiposTickets[type]);
  
  console.log('Tipos de Conteúdo ativos:', activeConteudos);
  console.log('Tipos de Gestão ativos:', activeGestao);
  
  if (collectionId === null) {
    console.log('⚠️ Usuário sem permissões para nenhuma collection - ping não será enviado');
  }
  
  console.groupEnd();
};
