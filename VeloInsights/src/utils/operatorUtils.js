// Utilitários para gerenciamento de operadores e privacidade

/**
 * Identifica se um operador é o usuário logado baseado no email
 * @param {string} operatorName - Nome do operador
 * @param {object} userData - Dados do usuário logado
 * @returns {boolean} - True se for o próprio operador
 */
export const isCurrentUserOperator = (operatorName, userData) => {
  if (!userData?.email || !operatorName) {
    return false
  }
  
  try {
    // Extrair nome do email (parte antes do @)
    const emailName = userData.email.split('@')[0].toLowerCase()
    
    // Normalizar nome do operador para comparação
    const normalizedOperatorName = operatorName.toLowerCase()
      .replace(/\s+/g, '') // Remove espaços
      .replace(/[^a-z]/g, '') // Remove caracteres especiais
    
    // Verificar se o nome do operador contém o nome do email
    const result = normalizedOperatorName.includes(emailName) || 
           emailName.includes(normalizedOperatorName.substring(0, 5))
    
    return result
  } catch (error) {
    console.error('❌ Erro em isCurrentUserOperator:', error)
    return false
  }
}

/**
 * Gera nome do operador considerando privacidade
 * @param {string} operatorName - Nome do operador
 * @param {number} index - Índice do operador
 * @param {object} userData - Dados do usuário logado
 * @param {boolean} shouldHideNames - Se deve ocultar nomes
 * @returns {string} - Nome a ser exibido
 */
export const getOperatorDisplayName = (operatorName, index, userData, shouldHideNames) => {
  if (!shouldHideNames) {
    return operatorName
  }
  
  try {
    // Se é o próprio operador logado, mostrar o nome
    if (isCurrentUserOperator(operatorName, userData)) {
      return operatorName
    }
    
    // Para outros operadores, mostrar "Operador X"
    return `Operador ${index + 1}`
  } catch (error) {
    console.error('❌ Erro em getOperatorDisplayName:', error)
    return `Operador ${index + 1}`
  }
}

/**
 * Ordena operadores dando prioridade ao usuário logado no meio da lista
 * @param {Array} operators - Lista de operadores
 * @param {object} userData - Dados do usuário logado
 * @param {string} sortBy - Campo para ordenação ('totalCalls', 'avgRatingAttendance', etc.)
 * @returns {Array} - Lista ordenada com usuário logado no meio
 */
export const prioritizeCurrentUserInMiddle = (operators, userData, sortBy = 'totalCalls') => {
  if (!userData?.email || !operators.length) {
    return operators
  }
  
  try {
    // Encontrar o operador atual
    const currentUserOperator = operators.find(op => 
      isCurrentUserOperator(op.operator, userData)
    )
    
    if (!currentUserOperator) {
      return operators
    }
    
    // Separar o operador atual dos outros
    const otherOperators = operators.filter(op => 
      !isCurrentUserOperator(op.operator, userData)
    )
    
    // Ordenar outros operadores
    const sortedOthers = otherOperators.sort((a, b) => {
      const aValue = a[sortBy] || 0
      const bValue = b[sortBy] || 0
      return bValue - aValue
    })
    
    // Colocar operador logado no meio (posição 3 de 5, ou 4 de 7, etc.)
    const middlePosition = Math.min(3, Math.floor(sortedOthers.length / 2))
    const result = [...sortedOthers]
    result.splice(middlePosition, 0, currentUserOperator)
    
    return result
  } catch (error) {
    console.error('❌ Erro em prioritizeCurrentUserInMiddle:', error)
    return operators
  }
}