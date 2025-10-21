// VERSION: v2.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import { useState, useEffect, useCallback } from 'react'
import { useServiceAccount } from './useServiceAccount'

// Configuração da planilha OCTA (mesmos ranges da seção de tickets)
const OCTA_CONFIG = {
  SPREADSHEET_ID: '1QkDmUTGAQQ7uF4ZBnHHcdrCyvjN76I_TN-RwTgvyn0o',
  RANGES: [
    'Página1!A1:AD150000',  // Range completo incluindo coluna AD (Mês) - atualizado para 150k linhas
    'Página1!A:AD',         // Todas as linhas das colunas A até AD
    'Página1!A1:AD1000',    // Range médio para teste
    'Página1!A1:AD100',     // Range pequeno para teste
    'Página1!A1:AD10'       // Teste básico para verificar se a planilha existe
  ]
}

export const useOctaData = (filters = {}) => {
  // Usar o hook de Service Account para obter dados
  const { octaData: serviceOctaData, loading: serviceLoading, error: serviceError, fetchOctaData: fetchServiceOctaData } = useServiceAccount()
  
  const [octaData, setOctaData] = useState([])
  const [octaMetrics, setOctaMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(true) // Iniciar como loading
  const [error, setError] = useState(null)

  // Função para normalizar nome do operador
  const normalizeOperatorName = (name) => {
    if (!name) return ''
    
    // Normalizar: remover pontos, espaços extras, converter para minúsculo
    let normalized = name.trim()
      .replace(/\./g, '') // Remove pontos
      .replace(/\s+/g, ' ') // Remove espaços extras
      .toLowerCase()
    
    return normalized
  }

  // Função para detectar se nomes são da mesma pessoa
  const isSamePerson = (name1, name2) => {
    const norm1 = normalizeOperatorName(name1)
    const norm2 = normalizeOperatorName(name2)
    
    // Se são exatamente iguais após normalização
    if (norm1 === norm2) return true
    
    // Se um é substring do outro (ex: "igor" ⊆ "igor s")
    // Mas não se têm sufixos diferentes (ex: "laura a" ≠ "laura g")
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      // Verificar se não são pessoas diferentes com sufixos
      const hasDifferentSuffix = (n1, n2) => {
        const words1 = n1.split(' ')
        const words2 = n2.split(' ')
        
        // Se ambos têm mais de uma palavra e a última palavra é diferente
        if (words1.length > 1 && words2.length > 1) {
          const lastWord1 = words1[words1.length - 1]
          const lastWord2 = words2[words2.length - 1]
          
          // Se a última palavra é uma letra única diferente
          if (lastWord1.length === 1 && lastWord2.length === 1 && lastWord1 !== lastWord2) {
            return true
          }
        }
        return false
      }
      
      return !hasDifferentSuffix(norm1, norm2)
    }
    
    return false
  }

  // Função para obter nome canônico do operador
  const getCanonicalOperatorName = (name, existingOperators) => {
    if (!name) return ''
    
    // Procurar por operador existente que seja a mesma pessoa
    for (const existingName of existingOperators) {
      if (isSamePerson(name, existingName)) {
        return existingName
      }
    }
    
    return name.trim()
  }

  // Função para buscar dados da planilha OCTA via Service Account
  const fetchSheetData = useCallback(async () => {
    try {
      console.log('🔄 Buscando dados OCTA via Service Account...')
      
      // Usar o hook de Service Account para buscar dados
      const data = await fetchServiceOctaData()
      
      if (!data || data.length < 2) {
        throw new Error('Nenhum dado encontrado na planilha OCTA')
      }
      
      return data
      
    } catch (err) {
      console.error('❌ Erro ao buscar dados da planilha OCTA:', err)
      throw err
    }
  }, [fetchServiceOctaData])

  // Função para filtrar dados OCTA por período
  const filterOctaDataByPeriod = (dataRows, period, customStartDate, customEndDate) => {
    if (!dataRows || dataRows.length === 0) return dataRows
    
    const now = new Date()
    let startDate, endDate
    
    // Determinar período baseado no filtro
    switch (period) {
      case 'last7Days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case 'last15Days':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'penultimateMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        break
      case 'currentMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = now
        break
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : null
        endDate = customEndDate ? new Date(customEndDate) : null
        break
      case 'allRecords':
        return dataRows // Retornar todos os dados
      default:
        return dataRows
    }
    
    // Se não há datas válidas, retornar todos os dados
    if (!startDate || !endDate) return dataRows
    
    // Filtrar dados baseado na coluna "Dia" (índice 28) com formato DD/MM/AAAA HH:MM:SS
    console.log('🔍 DEBUG FILTRO OCTA:', {
      totalLinhas: dataRows.length,
      periodo: period,
      startDate: startDate?.toLocaleDateString('pt-BR'),
      endDate: endDate?.toLocaleDateString('pt-BR'),
      colunaDiaExemplo: dataRows[0]?.[28] || 'VAZIO',
      colunaDiaExemplo2: dataRows[1]?.[28] || 'VAZIO',
      colunaDiaExemplo3: dataRows[2]?.[28] || 'VAZIO',
      totalColunas: dataRows[0]?.length || 0
    })
    
    return dataRows.filter(row => {
      const dateStr = row[28] // Coluna "Dia" (índice 28)
      if (!dateStr) return false
      
      try {
        // Parsear data no formato DD/MM/AAAA HH:MM:SS
        const datePart = dateStr.split(' ')[0] // Pegar apenas a parte da data (DD/MM/AAAA)
        const [day, month, year] = datePart.split('/')
        const rowDate = new Date(year, month - 1, day)
        
        return rowDate >= startDate && rowDate <= endDate
      } catch (error) {
        console.warn('Erro ao parsear data OCTA:', dateStr, error)
        return false
      }
    })
  }

  // Função para buscar dados da planilha OCTA
  const fetchOctaData = useCallback(async (period = 'allRecords', customStartDate = null, customEndDate = null) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Iniciando busca de dados OCTA via Service Account...')
      
      // Buscar dados diretamente da planilha via Service Account
      const data = await fetchSheetData()
      
      // Processar dados
      const headers = data[0]
      const dataRows = data.slice(1)
      
      // Aplicar filtro de período ANTES de processar os dados
      const filteredDataRows = filterOctaDataByPeriod(dataRows, period, customStartDate, customEndDate)
      
      

      // Mapear colunas
      const columnMapping = {
        numeroTicket: headers[0], // Coluna A
        responsavel: headers[13], // Coluna N
        tipoAvaliacao: headers[14], // Coluna O
        comentarioAvaliacao: headers[15], // Coluna P
        dia: headers[28], // Coluna AC
        mes: headers[29] // Coluna AD
      }

      // Processar dados com normalização de operadores
      const operadoresMap = new Map()
      const avaliacoes = {
        boas: [],
        ruins: [],
        totalBoas: 0,
        totalRuins: 0
      }

      // Contadores para debug
      let linhasProcessadas = 0
      let linhasComOperador = 0
      let linhasSemOperador = 0
      let linhasComAvaliacao = 0
      let linhasSemAvaliacao = 0
      let ticketsNaoDesignados = 0
      
      
      // Usar dados filtrados em vez de todos os dados
      filteredDataRows.forEach((row, index) => {
        linhasProcessadas++
        
        const numeroTicket = row[0] || ''
        const responsavelOriginal = row[13] || ''
        const tipoAvaliacao = row[14] || ''
        const comentarioAvaliacao = row[15] || ''
        const dia = row[28] || ''
        const mes = row[29] || ''

        // Log das primeiras 10 linhas para debug
        if (index < 10) {
        }

        if (!responsavelOriginal.trim()) {
          linhasSemOperador++
          ticketsNaoDesignados++
          return
        }
        
        linhasComOperador++

        // Obter nome canônico do operador
        const responsavel = getCanonicalOperatorName(responsavelOriginal, Array.from(operadoresMap.keys()))

        // Criar ou atualizar operador
        if (!operadoresMap.has(responsavel)) {
          operadoresMap.set(responsavel, {
            nome: responsavel,
            totalTickets: 0,
            ticketsUnicos: new Set(),
            tiposAvaliacao: new Set(),
            dias: new Set(),
            meses: new Set(),
            dados: [],
            ticketsDuplicados: new Map()
          })
        }

        const operador = operadoresMap.get(responsavel)

        // Verificar se é ticket duplicado
        if (numeroTicket.trim() && operador.ticketsUnicos.has(numeroTicket.trim())) {
          // Ticket duplicado
          const ticketKey = numeroTicket.trim()
          if (!operador.ticketsDuplicados.has(ticketKey)) {
            operador.ticketsDuplicados.set(ticketKey, {
              numeroTicket: ticketKey,
              alteracoes: []
            })
          }
          
          const ticketDuplicado = operador.ticketsDuplicados.get(ticketKey)
          ticketDuplicado.alteracoes.push({
            linha: index + 2,
            tipoAvaliacao: tipoAvaliacao,
            dia: dia,
            mes: mes,
            timestamp: new Date().toISOString()
          })
        } else {
          // Ticket único
          if (numeroTicket.trim()) {
            operador.ticketsUnicos.add(numeroTicket.trim())
          }
        }

        // SEMPRE contar todas as ocorrências
        operador.totalTickets++

        // Adicionar dados às coleções
        if (tipoAvaliacao.trim()) {
          linhasComAvaliacao++
          operador.tiposAvaliacao.add(tipoAvaliacao.trim())
        } else {
          linhasSemAvaliacao++
        }
        
        if (dia.trim()) {
          operador.dias.add(dia.trim())
        }
        
        if (mes.trim()) {
          operador.meses.add(mes.trim())
        }

        // Armazenar dados completos
        operador.dados.push({
          linha: index + 2,
          numeroTicket: numeroTicket,
          responsavel: responsavel,
          tipoAvaliacao: tipoAvaliacao,
          comentarioAvaliacao: comentarioAvaliacao,
          dia: dia,
          mes: mes
        })

        // Processar avaliações
        if (tipoAvaliacao.trim()) {
          const avaliacaoLower = tipoAvaliacao.trim().toLowerCase()
          const ticketData = {
            numeroTicket: numeroTicket,
            operador: responsavel,
            tipoAvaliacao: tipoAvaliacao.trim(),
            comentario: comentarioAvaliacao.trim(),
            temComentario: avaliacaoLower.includes('comentário') || avaliacaoLower.includes('comentario'),
            dia: dia,
            mes: mes
          }
          
          if (avaliacaoLower.includes('bom')) {
            avaliacoes.boas.push(ticketData)
            avaliacoes.totalBoas++
          } else if (avaliacaoLower.includes('ruim')) {
            avaliacoes.ruins.push(ticketData)
            avaliacoes.totalRuins++
          }
        }
      })
      

      // Converter Map para Array
      const operadoresArray = Array.from(operadoresMap.values())
        .sort((a, b) => b.totalTickets - a.totalTickets)

      // Calcular métricas gerais
      const totalTickets = linhasProcessadas // Baseado na coluna A (todos os registros)
      const totalTicketsComOperador = operadoresArray.reduce((sum, op) => sum + op.totalTickets, 0)
      const totalAvaliados = avaliacoes.totalBoas + avaliacoes.totalRuins
      const porcentagemGeral = totalAvaliados > 0 ? ((avaliacoes.totalBoas / totalAvaliados) * 100).toFixed(1) : '0.0'
      
      const bomSemComentario = avaliacoes.boas.filter(av => !av.temComentario).length
      const bomComComentario = avaliacoes.boas.filter(av => av.temComentario).length
      const ruimSemComentario = avaliacoes.ruins.filter(av => !av.temComentario).length
      const ruimComComentario = avaliacoes.ruins.filter(av => av.temComentario).length

      const metrics = {
        totalTickets: totalTickets.toLocaleString('pt-BR'),
        totalTicketsComOperador: totalTicketsComOperador.toLocaleString('pt-BR'),
        ticketsNaoDesignados: ticketsNaoDesignados.toLocaleString('pt-BR'),
        totalAvaliados: totalAvaliados.toLocaleString('pt-BR'),
        porcentagemGeral: `${porcentagemGeral}%`,
        bomSemComentario: bomSemComentario.toLocaleString('pt-BR'),
        bomComComentario: bomComComentario.toLocaleString('pt-BR'),
        ruimSemComentario: ruimSemComentario.toLocaleString('pt-BR'),
        ruimComComentario: ruimComComentario.toLocaleString('pt-BR'),
        operadores: operadoresArray,
        avaliacoes
      }

      setOctaData(filteredDataRows) // Usar dados filtrados
      setOctaMetrics(metrics)

    } catch (err) {
      console.error('❌ Erro ao buscar dados OCTA:', err)
      setError(`Erro ao buscar dados: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [fetchSheetData])

  // Função para buscar dados por período
  const fetchDataByPeriod = useCallback(async (period, customStartDate = null, customEndDate = null) => {
    await fetchOctaData(period, customStartDate, customEndDate)
  }, [fetchOctaData])

  // Efeito para carregar dados automaticamente quando filtros mudarem
  useEffect(() => {
    console.log('🔄 useEffect OCTA - Carregando dados automaticamente...')
    
    // Usar os filtros do sistema principal
    const period = filters.period || 'allRecords'
    const customStartDate = filters.customStartDate || null
    const customEndDate = filters.customEndDate || null
    
    fetchOctaData(period, customStartDate, customEndDate)
  }, [fetchOctaData, filters.period, filters.customStartDate, filters.customEndDate])

  // Função para tentar carregar dados manualmente
  const retryLoad = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await fetchOctaData('allRecords')
  }, [fetchOctaData])

  return {
    octaData,
    octaRawData: octaData, // Dados brutos para os gráficos
    octaMetrics,
    isLoading,
    error,
    fetchOctaData,
    fetchDataByPeriod,
    retryLoad
  }
}
