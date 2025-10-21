/**
 * Sistema de Dark List para filtragem inteligente de dados
 * Remove registros de baixa qualidade para melhorar métricas
 */

/**
 * Aplica a dark list aos dados
 */
export const applyDarkList = (data, config = {}) => {
  const {
    excludeWeekends = false,
    excludeHolidays = false,
    minCallDuration = 10, // segundos
    minOperatorCalls = 5,
    excludeTestCalls = true,
    excludeLowQuality = true
  } = config

  console.log('🔍 Aplicando Dark List com configurações:', config)

  const originalLength = data.length
  let filteredData = data.filter(record => {
    // Excluir por operador
    if (shouldExcludeOperator(record.operator)) {
      console.log('🚫 Operador excluído:', record.operator)
      return false
    }
    
    // Excluir por duração
    if (record.duration_minutes < minCallDuration / 60) {
      console.log('🚫 Duração muito baixa:', record.duration_minutes, 'min')
      return false
    }
    
    // Excluir por período
    if (excludeWeekends && isWeekend(record.date)) {
      console.log('🚫 Fim de semana excluído:', record.date)
      return false
    }
    
    // Excluir chamadas de teste
    if (excludeTestCalls && isTestCall(record)) {
      console.log('🚫 Chamada de teste excluída')
      return false
    }
    
    // Excluir registros de baixa qualidade
    if (excludeLowQuality && isLowQualityRecord(record)) {
      console.log('🚫 Registro de baixa qualidade excluído')
      return false
    }
    
    return true
  })

  const filteredCount = originalLength - filteredData.length
  console.log(`📊 Dark List aplicada: ${filteredCount} registros excluídos de ${originalLength}`)
  
  return filteredData
}

/**
 * Verifica se operador deve ser excluído
 */
function shouldExcludeOperator(operator) {
  if (!operator) return true
  
  const operatorStr = operator.toString().toLowerCase().trim()
  
  // Lista de exclusões
  const excludePatterns = [
    'agentes indisponíveis',
    'agente indisponivel',
    'desl ',
    'teste',
    'sistema',
    'admin',
    'não informado',
    'null',
    'undefined'
  ]
  
  // Lista específica de operadores excluídos
  const excludedOperators = [
    'Vitória Silva Lima',
    'Octávio Augusto Ramalho da Silva',
    'Caroline Santiago',
    'Anderson Felipe Araujo Silva',
    'João Pedro Andrade da Silva',
    'Brenda Miranda',
    'Vanessa Souza',
    'Nayara Nunes Ribeiro',
    'Emerson Medeiros José'
  ]
  
  // Verificar se está na lista específica de exclusões (case-insensitive)
  const isExcludedOperator = excludedOperators.some(excluded => 
    excluded.toLowerCase().trim() === operatorStr
  )
  
  if (isExcludedOperator) {
    return true
  }
  
  return excludePatterns.some(pattern => operatorStr.includes(pattern))
}

/**
 * Verifica se é fim de semana
 */
function isWeekend(date) {
  if (!date) return false
  
  const dayOfWeek = new Date(date).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Domingo ou Sábado
}

/**
 * Verifica se é chamada de teste
 */
function isTestCall(record) {
  const operator = record.operator?.toString().toLowerCase() || ''
  const status = record.original_data?.Chamada?.toString().toLowerCase() || ''
  
  return operator.includes('teste') || 
         status.includes('teste') ||
         operator.includes('demo') ||
         status.includes('demo')
}

/**
 * Verifica se é registro de baixa qualidade
 */
function isLowQualityRecord(record) {
  // Sem operador válido
  if (!record.operator || record.operator.toString().trim() === '') return true
  
  // Sem data válida
  if (!record.date || isNaN(new Date(record.date).getTime())) return true
  
  // Duração negativa ou muito alta (suspeita)
  if (record.duration_minutes < 0 || record.duration_minutes > 300) return true
  
  // Avaliações inválidas
  if (record.rating_attendance && (record.rating_attendance < 0 || record.rating_attendance > 5)) return true
  if (record.rating_solution && (record.rating_solution < 0 || record.rating_solution > 5)) return true
  
  return false
}

/**
 * Configurações padrão da Dark List
 */
export const DEFAULT_DARK_LIST_CONFIG = {
  excludeWeekends: false,
  excludeHolidays: false,
  minCallDuration: 10, // 10 segundos
  minOperatorCalls: 5,
  excludeTestCalls: true,
  excludeLowQuality: true
}

/**
 * Configurações rigorosas da Dark List
 */
export const STRICT_DARK_LIST_CONFIG = {
  excludeWeekends: true,
  excludeHolidays: true,
  minCallDuration: 30, // 30 segundos
  minOperatorCalls: 10,
  excludeTestCalls: true,
  excludeLowQuality: true
}

/**
 * Configurações permissivas da Dark List
 */
export const PERMISSIVE_DARK_LIST_CONFIG = {
  excludeWeekends: false,
  excludeHolidays: false,
  minCallDuration: 5, // 5 segundos
  minOperatorCalls: 1,
  excludeTestCalls: true,
  excludeLowQuality: false
}
