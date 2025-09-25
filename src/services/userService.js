// VERSION: v3.3.8 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

// Lista de usuários autorizados (simulando banco de dados)
// Em produção, isso viria de uma API real
let authorizedUsers = [
  {
    id: 1,
    email: 'lucas.gravina@velotax.com.br',
    nome: 'Lucas Gravina',
    funcao: 'Administrador',
    permissoes: {
      artigos: true,
      velonews: true,
      botPerguntas: true,
      chamadosInternos: true,
      igp: true,
      qualidade: true,
      capacity: true,
      config: true
    },
    tiposTickets: {
      artigos: true,
      processos: true,
      roteiros: true,
      treinamentos: true,
      funcionalidades: true,
      recursos: true,
      gestao: true,
      rhFin: true,
      facilities: true
    }
  }
];

// Função para verificar se um email está autorizado
export const isUserAuthorized = (email) => {
  return authorizedUsers.some(user => user.email === email);
};

// Função para obter dados do usuário autorizado
export const getAuthorizedUser = (email) => {
  return authorizedUsers.find(user => user.email === email);
};

// Função para adicionar novo usuário autorizado
export const addAuthorizedUser = (userData) => {
  const newUser = {
    id: Date.now(),
    ...userData
  };
  authorizedUsers.push(newUser);
  return newUser;
};

// Função para atualizar usuário autorizado
export const updateAuthorizedUser = (email, updatedData) => {
  const userIndex = authorizedUsers.findIndex(user => user.email === email);
  if (userIndex !== -1) {
    authorizedUsers[userIndex] = { ...authorizedUsers[userIndex], ...updatedData };
    return authorizedUsers[userIndex];
  }
  return null;
};

// Função para obter todos os usuários autorizados
export const getAllAuthorizedUsers = () => {
  return [...authorizedUsers];
};

// Função para remover usuário autorizado
export const removeAuthorizedUser = (email) => {
  authorizedUsers = authorizedUsers.filter(user => user.email !== email);
};
