// Lista de operadores permitidos para análise - Velotax
// Baseado na lista oficial de funcionários

export const OPERADORES_PERMITIDOS = [
  'Dimas',
  'Brenda',
  'Octavio',
  'Nayara',
  'Nathalia',
  'Gabriel',
  'Rodrigo',
  'Stephanie',
  'Laura Guedes',
  'Viviane',
  'Murilo',
  'Igor',
  'Marcos',
  'Vinicius',
  'Juliana',
  'Shirley',
  'Laura Almeida',
  'Marcelo',
  'Gabrielli',
  'Monike',
  'Mariana'
]

// Lista de operadores excluídos (Dark List)
export const OPERADORES_EXCLUIDOS = [
  'Evelin', //demissão
  'João',   // Admin
  'Emerson', // Supervisor
  'Anderson', // Supervisor
  'André', // Diretor
  'Caroline', // Analista
  'Vanessa', // Analista
  'Fabio', // Analista
  'Thainara', //demissão
  'Bruno', //demissão
  'Geovane', //demissão
  'Tainara' //demissão
]

// Configurações de filtro
export const FILTRO_CONFIG = {
  // Se true, só mostra operadores da lista permitida
  usarListaPermitida: true,
  
  // Se true, exclui operadores da lista de exclusão
  usarListaExclusao: true,
  
  // Se true, mostra todos os operadores (ignora as listas)
  mostrarTodos: false
}
