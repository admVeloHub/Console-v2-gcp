/**
 * Parser inteligente para dados da Velotax
 * Detecta colunas automaticamente e filtra dados inválidos
 */

export async function parseVelotaxData(rawData, onProgress = null) {
  try {
    
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Dados inválidos ou vazios')
    }

    // Verificar se o primeiro registro tem estrutura válida
    if (!rawData[0] || typeof rawData[0] !== 'object') {
      throw new Error('Primeiro registro não é um objeto válido')
    }

    // Detectar colunas automaticamente
    const columnMapping = detectColumns(rawData[0])

    // Verificar se pelo menos as colunas essenciais foram detectadas
    if (!columnMapping.date || !columnMapping.operator) {
      console.warn('⚠️ Colunas essenciais não detectadas:', columnMapping)
    }

    const processedData = []
    const errors = []
    let filteredCount = 0

    // Processar em chunks para arquivos grandes
    const CHUNK_SIZE = 1000
    const totalChunks = Math.ceil(rawData.length / CHUNK_SIZE)
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIndex = chunkIndex * CHUNK_SIZE
      const endIndex = Math.min(startIndex + CHUNK_SIZE, rawData.length)
      
      // Atualizar progresso se callback disponível
      if (onProgress) {
        const progressPercent = Math.round(((chunkIndex + 1) / totalChunks) * 100)
        onProgress({ 
          current: progressPercent, 
          total: 100, 
          message: `Processando chunk ${chunkIndex + 1}/${totalChunks} (${progressPercent}%)` 
        })
      }
      
      for (let i = startIndex; i < endIndex; i++) {
        try {
          const record = rawData[i]
          
          if (!record || typeof record !== 'object') {
            errors.push(`Linha ${i + 1}: Registro inválido`)
            continue
          }
          
          // Aplicar filtros inteligentes
          if (shouldFilterRecord(record, columnMapping)) {
            filteredCount++
            continue
          }

          const processedRecord = mapVelotaxRecord(record, columnMapping, i + 1)
          
          if (processedRecord) {
            processedData.push(processedRecord)
          }
        } catch (error) {
          errors.push(`Linha ${i + 1}: ${error.message}`)
          // Reduzir logs de erro para performance
          if (errors.length <= 10) {
            console.warn(`Erro na linha ${i + 1}:`, error.message)
          }
        }
      }
      
      // Pequena pausa para não travar a UI
      if (chunkIndex < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }

    if (errors.length > 0) {
      console.warn(`${errors.length} erros encontrados durante o processamento:`, errors.slice(0, 5))
    }


    if (processedData.length === 0) {
      throw new Error('Nenhum registro válido encontrado após processamento')
    }

    return processedData
  } catch (error) {
    console.error('❌ Erro crítico no parseVelotaxData:', error)
    throw error
  }
}

/**
 * Detecta automaticamente as colunas pelo nome
 */
function detectColumns(firstRecord) {
  const headers = Object.keys(firstRecord)
  const mapping = {}


  // Mapear colunas por nome (case-insensitive e mais flexível)
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase().trim()
    
    // Data - mais flexível
    if (lowerHeader.includes('data') && !lowerHeader.includes('inicial') && !lowerHeader.includes('pausa')) {
      mapping.date = header
    } 
    // Operador - priorizar campo "Operador" exato
    else if (lowerHeader === 'operador') {
      mapping.operator = header
    }
    // Operador - fallback para outros campos
    else if ((lowerHeader.includes('nome') && lowerHeader.includes('atendente')) ||
             lowerHeader.includes('atendente')) {
      // Só mapear se ainda não foi mapeado
      if (!mapping.operator) {
        mapping.operator = header
      }
    } 
    // Tempo de atendimento
    else if ((lowerHeader.includes('tempo') && lowerHeader.includes('falado')) ||
             lowerHeader.includes('duracao') ||
             lowerHeader.includes('tempo atendimento')) {
      mapping.duration = header
    } 
    // Avaliação atendimento - mais específico para evitar conflito com operador
    else if ((lowerHeader.includes('pergunta') && lowerHeader.includes('atendente') && lowerHeader.includes('pergunta2')) ||
             lowerHeader.includes('avaliacao atendimento') ||
             lowerHeader.includes('nota atendimento')) {
      mapping.ratingAttendance = header
    } 
    // Avaliação solução - mais específico
    else if ((lowerHeader.includes('pergunta') && lowerHeader.includes('solucao') && lowerHeader.includes('pergunta2')) ||
             lowerHeader.includes('avaliacao solucao') ||
             lowerHeader.includes('nota solucao')) {
      mapping.ratingSolution = header
    } 
    // Chamadas
    else if (lowerHeader.includes('chamada')) {
      mapping.callCount = header
    } 
    // Desconexão
    else if (lowerHeader.includes('desconexao')) {
      mapping.disconnection = header
    } 
    // Tempo de pausa
    else if (lowerHeader.includes('duracao') && !lowerHeader.includes('logado')) {
      mapping.pauseDuration = header
    } 
    // Motivo da pausa
    else if (lowerHeader.includes('motivo') && lowerHeader.includes('pausa')) {
      mapping.pauseReason = header
    } 
    // Data da pausa
    else if (lowerHeader.includes('data') && lowerHeader.includes('inicial')) {
      mapping.pauseDate = header
    } 
    // Tempo logado
    else if (lowerHeader.includes('logado') && lowerHeader.includes('dia')) {
      mapping.avgLoggedTime = header
    } 
    // Tempo pausado
    else if (lowerHeader.includes('pausado')) {
      mapping.avgPauseTime = header
    }
    // Tipo de chamada (ativa/receptiva)
    else if (lowerHeader.includes('tipo') && lowerHeader.includes('chamada')) {
      mapping.callType = header
    }
    else if (lowerHeader.includes('direção') || lowerHeader.includes('direction')) {
      mapping.callType = header
    }
    else if (lowerHeader.includes('inbound') || lowerHeader.includes('outbound')) {
      mapping.callType = header
    }
  })

  return mapping
}

/**
 * Filtra registros que devem ser ignorados
 */
function shouldFilterRecord(record, columnMapping) {
  const operatorField = columnMapping.operator
  
  // Se não tem campo de operador mapeado, não filtrar (aceitar todos)
  if (!operatorField) {
    return false
  }
  
  if (!record[operatorField]) {
    return true // Ignorar se não tem operador
  }

  const operator = record[operatorField].toString().trim()
  
  // Dark List removida - todos os operadores válidos serão incluídos
  
  // Filtrar agentes indisponíveis
  if (operator.toLowerCase().includes('agentes indisponíveis') || 
      operator.toLowerCase().includes('agente indisponivel')) {
    return true
  }
  
  // Filtrar desligados (começa com "desl ")
  if (operator.toLowerCase().startsWith('desl ')) {
    return true
  }
  
  // Filtrar valores vazios ou inválidos
  if (operator === '' || 
      operator === 'null' || 
      operator === 'undefined' ||
      operator === 'não informado') {
    return true
  }

  return false
}

function mapVelotaxRecord(record, columnMapping, lineNumber) {
  if (!record || typeof record !== 'object') {
    throw new Error('Registro inválido')
  }

  try {
    // Mapear campos usando detecção inteligente (com fallbacks)
    const mappedRecord = {
      // Data - tentar diferentes campos se não encontrar
      date: parseDate(record[columnMapping.date]) || 
            parseDate(record['Data']) || 
            parseDate(record['data']) ||
            null,
      
      // Operador - tentar diferentes campos se não encontrar
      operator: (() => {
        const operatorValue = record[columnMapping.operator] || 
                              record['Nome do Atendente'] || 
                              record['nome do atendente'] ||
                              record['Operador'] ||
                              record['operador'] ||
                              'Não informado'
        
        return operatorValue
      })(),
      
      // Tempo de atendimento
      duration_minutes: parseTimeToMinutes(record[columnMapping.duration]) ||
                       parseTimeToMinutes(record['Tempo Falado']) ||
                       parseTimeToMinutes(record['tempo falado']) ||
                       0,
      
      // Avaliação do atendimento
      rating_attendance: parseRating(record[columnMapping.ratingAttendance]) ||
                        parseRating(record['Pergunta2 1 PERGUNTA ATENDENTE']) ||
                        null,
      
      // Avaliação da solução
      rating_solution: parseRating(record[columnMapping.ratingSolution]) ||
                      parseRating(record['Pergunta2 2 PERGUNTA SOLUCAO']) ||
                      null,
      
      // Contagem de chamadas
      call_count: parseCallCount(record[columnMapping.callCount]) ||
                  parseCallCount(record['Chamada']) ||
                  parseCallCount(record['chamada']) ||
                  1, // Default para 1 se não encontrar
      
      // Desconexão
      disconnection: record[columnMapping.disconnection] || 
                    record['Desconexão'] ||
                    record['desconexao'] ||
                    'Não informado',
      
      // Tempo de pausa
      pause_minutes: parseTimeToMinutes(record[columnMapping.pauseDuration]) ||
                    parseTimeToMinutes(record['Duração']) ||
                    0,
      
      // Motivo da pausa
      pause_reason: record[columnMapping.pauseReason] ||
                   record['Motivo da Pausa'] ||
                   'Não informado',
      
      // Data da pausa
      pause_date: parseDate(record[columnMapping.pauseDate]) ||
                 parseDate(record['Data Inicial']) ||
                 null,
      
      // Tempo médio logado
      avg_logged_time: parseTimeToMinutes(record[columnMapping.avgLoggedTime]) ||
                      parseTimeToMinutes(record['T M Logado / Dia']) ||
                      0,
      
               // Tempo médio pausado
               avg_pause_time: parseTimeToMinutes(record[columnMapping.avgPauseTime]) ||
                              parseTimeToMinutes(record['T M Pausado']) ||
                              0,

               // Tipo de chamada (ativa/receptiva)
               call_type: record[columnMapping.callType] || 
                         record['Tipo de Chamada'] ||
                         record['Direção'] ||
                         'Não informado',

               // Campos originais para referência
               original_data: record,
               line_number: lineNumber,
               column_mapping: columnMapping // Para debug
    }

    // Validar se pelo menos o operador está presente (data pode ser null)
    if (!mappedRecord.operator || mappedRecord.operator === 'Não informado') {
      throw new Error('Operador ausente')
    }

           // Log apenas a cada 1000 registros para melhor performance
           if (lineNumber % 1000 === 0) {
           }

    return mappedRecord

  } catch (error) {
    throw new Error(`Erro no mapeamento: ${error.message}`)
  }
}

function parseDate(dateString) {
  if (!dateString) return null
  
  try {
    // Tentar diferentes formatos de data
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      // Tentar formato brasileiro DD/MM/YYYY
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const day = parts[0]
        const month = parts[1]
        const year = parts[2]
        return new Date(year, month - 1, day).toISOString()
      }
      return null
    }
    
    return date.toISOString()
  } catch (error) {
    return null
  }
}

function parseTimeToMinutes(timeString) {
  if (!timeString) return 0
  
  try {
    // Se já é um número, retornar como está
    if (typeof timeString === 'number') {
      return timeString
    }
    
    // Se é string no formato HH:MM:SS
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':')
      if (parts.length >= 2) {
        const hours = parseInt(parts[0]) || 0
        const minutes = parseInt(parts[1]) || 0
        const seconds = parseInt(parts[2]) || 0
        
        return hours * 60 + minutes + seconds / 60
      }
    }
    
    // Tentar converter para número
    const numValue = parseFloat(timeString)
    return isNaN(numValue) ? 0 : numValue
    
  } catch (error) {
    return 0
  }
}

function parseRating(ratingString) {
  if (!ratingString) return null
  
  try {
    const rating = parseFloat(ratingString)
    if (isNaN(rating)) return null
    
    // Validar se está no range esperado (0-5 ou 0-10)
    if (rating >= 0 && rating <= 10) {
      // Se está no range 0-10, normalizar para 0-5
      return rating > 5 ? rating / 2 : rating
    }
    
    return null
  } catch (error) {
    return null
  }
}

function parseCallCount(callString) {
  if (!callString) return 0
  
  try {
    // Se contém "Atendida" ou similar, considerar como 1 chamada
    if (typeof callString === 'string') {
      const lowerCall = callString.toLowerCase()
      if (lowerCall.includes('atendida') || lowerCall.includes('answered')) {
        return 1
      }
    }
    
    // Tentar converter para número
    const numValue = parseInt(callString)
    return isNaN(numValue) ? 0 : numValue
    
  } catch (error) {
    return 0
  }
}
