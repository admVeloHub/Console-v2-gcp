// Configuração de Usuários e Cargos - Nova Estrutura
// Migração: DIRETOR/SUPERADMIN -> ADMINISTRADOR, GESTOR -> GESTAO, ANALISTA -> MONITOR, OPERADOR -> EDITOR

export const USUARIOS_CONFIG = [
  {
    email: "andre.violaro@velotax.com.br",
    nome: "André",
    cargo: "ADMINISTRADOR" // ex-DIRETOR
  },
  {
    email: "emerson.jose@velotax.com.br",
    nome: "Emerson",
    cargo: "GESTAO" // ex-GESTOR
  },
  {
    email: "anderson.silva@velotax.com.br",
    nome: "Anderson",
    cargo: "GESTAO" // ex-GESTOR
  },
  {
    email: "gabriel.araujo@velotax.com.br",
    nome: "Gabriel",
    cargo: "ADMINISTRADOR" // ex-SUPERADMIN
  },
  {
    email: "joao.silva@velotax.com.br",
    nome: "João",
    cargo: "MONITOR" // ex-ANALISTA
  },
  {
    email: "gabrielli.assuncao@velotax.com.br",
    nome: "Gabrielli",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "caroline.santiago@velotax.com.br",
    nome: "Caroline",
    cargo: "MONITOR" // ex-ANALISTA
  },
  {
    email: "vanessa.souza@velotax.com.br",
    nome: "Vanessa",
    cargo: "MONITOR" // ex-ANALISTA
  },
  {
    email: "fabio.santos@velotax.com.br",
    nome: "Fabio",
    cargo: "MONITOR" // ex-ANALISTA
  },
  {
    email: "tainara.silva@velotax.com.br",
    nome: "Tainara",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "dimas.nascimento@velotax.com.br",
    nome: "Dimas",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "brenda.miranda@velotax.com.br",
    nome: "Brenda",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "octavio.silva@velotax.com.br",
    nome: "Octavio",
    cargo: "MONITOR" // ex-ANALISTA
  },
  {
    email: "nayara.ribeiro@velotax.com.br",
    nome: "Nayara",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "geovane.souza@velotax.com.br",
    nome: "Geovane",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "nathalia.villanova@velotax.com.br",
    nome: "Nathalia",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "rodrigo.reis@velotax.com.br",
    nome: "Rodrigo",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "thainara.silva@velotax.com.br",
    nome: "Thainara",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "stephanie.oliveira@velotax.com.br",
    nome: "Stephanie",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "laura.guedes@velotax.com.br",
    nome: "Laura Guedes",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "viviane.silva@velotax.com.br",
    nome: "Viviane",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "murilo.caetano@velotax.com.br",
    nome: "Murilo",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "igor.siqueira@velotax.com.br",
    nome: "Igor",
    cargo: "ADMINISTRADOR" // ex-SUPERADMIN
  },
  {
    email: "marcos.pereira@velotax.com.br",
    nome: "Marcos",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "vinicius.assuncao@velotax.com.br",
    nome: "Vinicius",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "juliana.rofino@velotax.com.br",
    nome: "Juliana",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "shirley.cunha@velotax.com.br",
    nome: "Shirley",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "bruno.silva@velotax.com.br",
    nome: "Bruno",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "laura.almeida@velotax.com.br",
    nome: "Laura Almeida",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "marcelo.silva@velotax.com.br",
    nome: "Marcelo",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "monike.silva@velotax.com.br",
    nome: "Monike",
    cargo: "EDITOR" // ex-OPERADOR
  },
  {
    email: "mariana.luz@velotax.com.br",
    nome: "Mariana",
    cargo: "EDITOR" // ex-OPERADOR
  }
]

// Função para buscar usuário por email
export const getUserByEmail = (email) => {
  return USUARIOS_CONFIG.find(user => 
    user.email.toLowerCase() === email.toLowerCase()
  )
}

// Função para obter cargo do usuário
export const getUserCargo = (email) => {
  const user = getUserByEmail(email)
  return user ? user.cargo : 'EDITOR'
}

// Função para obter nome do usuário
export const getUserName = (email) => {
  const user = getUserByEmail(email)
  return user ? user.nome : 'Usuário'
}
