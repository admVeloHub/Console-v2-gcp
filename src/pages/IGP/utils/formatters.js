/**
 * Utilitários de formatação para o sistema VeloInsights
 */

/**
 * Formata números com separadores de milhares no padrão brasileiro
 * @param {number} num - Número a ser formatado
 * @returns {string} - Número formatado (ex: 139.458)
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  
  return Number(num).toLocaleString('pt-BR')
}

/**
 * Formata números com casas decimais e separadores de milhares
 * @param {number} num - Número a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 0)
 * @returns {string} - Número formatado (ex: 139.458,50)
 */
export const formatNumberWithDecimals = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  
  return Number(num).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata porcentagens com separadores de milhares
 * @param {number} num - Número a ser formatado como porcentagem
 * @param {number} decimals - Número de casas decimais (padrão: 1)
 * @returns {string} - Porcentagem formatada (ex: 85,5%)
 */
export const formatPercentage = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0%'
  }
  
  return Number(num).toLocaleString('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata tempo em minutos com separadores de milhares
 * @param {number} minutes - Minutos a serem formatados
 * @param {number} decimals - Número de casas decimais (padrão: 0)
 * @returns {string} - Tempo formatado (ex: 1.250 min)
 */
export const formatMinutes = (minutes, decimals = 0) => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '0 min'
  }
  
  const formatted = Number(minutes).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return `${formatted} min`
}

/**
 * Formata avaliações (notas) com separadores de milhares
 * @param {number} rating - Nota a ser formatada
 * @param {number} decimals - Número de casas decimais (padrão: 1)
 * @returns {string} - Nota formatada (ex: 4,7/5)
 */
export const formatRating = (rating, decimals = 1) => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return '0,0/5'
  }
  
  const formatted = Number(rating).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return `${formatted}/5`
}
