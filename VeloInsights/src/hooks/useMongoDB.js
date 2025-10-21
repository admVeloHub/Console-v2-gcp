/**
 * Hook MongoDB - VeloInsights
 * Lê dados do MongoDB em vez do Google Sheets
 */

import { useState, useEffect, useCallback } from 'react'
import { connectToMongoDB, MONGODB_CONFIG } from '../config/mongodb.js'
import { processarDados } from '../utils/dataProcessor.js'

export const useMongoDB = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [errors, setErrors] = useState([])
  const [operators, setOperators] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Função para buscar dados do MongoDB
  const fetchDataFromMongoDB = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Buscando dados do MongoDB...')
      
      const { client, db } = await connectToMongoDB()
      
      // Buscar calls
      const calls = await db.collection(MONGODB_CONFIG.collections.calls)
        .find({})
        .sort({ call_date: -1 })
        .toArray()
      
      // Buscar pauses
      const pauses = await db.collection(MONGODB_CONFIG.collections.pauses)
        .find({})
        .sort({ start_date: -1 })
        .toArray()
      
      await client.close()
      
      console.log(`✅ ${calls.length} calls e ${pauses.length} pauses obtidos do MongoDB`)
      
      // Converter para formato esperado pelo processador
      const formattedData = convertMongoToSpreadsheetFormat(calls, pauses)
      
      if (formattedData.length > 0) {
        // Processar dados
        const dadosProcessados = processarDados(formattedData)
        
        // Atualizar estados
        setData(dadosProcessados.dadosFiltrados)
        setMetrics(dadosProcessados.metricas)
        setOperatorMetrics(Object.values(dadosProcessados.metricasOperadores).map(op => ({
          operator: op.operador,
          totalCalls: op.totalAtendimentos,
          avgDuration: parseFloat(op.tempoMedio.toFixed(1)),
          avgRatingAttendance: parseFloat(op.notaMediaAtendimento.toFixed(1)),
          avgRatingSolution: parseFloat(op.notaMediaSolucao.toFixed(1)),
          avgPauseTime: 0,
          totalRecords: op.totalAtendimentos
        })))
        setRankings(dadosProcessados.rankings)
        setOperators(dadosProcessados.operadores)
        
        setLastUpdate(new Date())
        console.log('✅ Dados carregados com sucesso do MongoDB!')
      } else {
        console.log('⚠️ Nenhum dado encontrado no MongoDB')
        setData([])
        setMetrics({})
        setOperatorMetrics({})
        setRankings([])
        setOperators([])
        setErrors(['Nenhum dado encontrado no MongoDB'])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do MongoDB:', error)
      setErrors([`Erro ao carregar dados: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  // Converter dados do MongoDB para formato da planilha
  const convertMongoToSpreadsheetFormat = (calls, pauses) => {
    try {
      // Criar cabeçalho
      const headers = [
        'Data',
        'Nome do Atendente',
        'Tempo Falado',
        'Pergunta2 1 PERGUNTA ATENDENTE',
        'Pergunta2 2 PERGUNTA SOLUCAO',
        'Chamada',
        'Desconexão',
        'Duração',
        'Motivo da Pausa',
        'Data Inicial',
        'T M Logado / Dia',
        'T M Pausado'
      ]
      
      const rows = [headers]
      
      // Adicionar calls
      calls.forEach(call => {
        const row = [
          call.call_date.toISOString().split('T')[0], // Data
          call.operator_name, // Nome do Atendente
          call.total_time.toString(), // Tempo Falado
          call.question_attendant, // Pergunta2 1 PERGUNTA ATENDENTE
          call.question_solution, // Pergunta2 2 PERGUNTA SOLUCAO
          'Atendida', // Chamada (assumindo que todas são atendidas)
          'Não', // Desconexão
          '', // Duração (não aplicável para calls)
          '', // Motivo da Pausa (não aplicável para calls)
          '', // Data Inicial (não aplicável para calls)
          '', // T M Logado / Dia (não aplicável para calls)
          '' // T M Pausado (não aplicável para calls)
        ]
        rows.push(row)
      })
      
      // Adicionar pauses
      pauses.forEach(pause => {
        const row = [
          pause.start_date.toISOString().split('T')[0], // Data
          pause.operator_name, // Nome do Atendente
          '', // Tempo Falado (não aplicável para pauses)
          '', // Pergunta2 1 PERGUNTA ATENDENTE (não aplicável para pauses)
          '', // Pergunta2 2 PERGUNTA SOLUCAO (não aplicável para pauses)
          '', // Chamada (não aplicável para pauses)
          '', // Desconexão (não aplicável para pauses)
          pause.duration.toString(), // Duração
          pause.pause_reason, // Motivo da Pausa
          pause.start_date.toISOString().split('T')[0], // Data Inicial
          '', // T M Logado / Dia (não aplicável para pauses)
          pause.duration.toString() // T M Pausado
        ]
        rows.push(row)
      })
      
      console.log(`📊 Convertidos: ${calls.length} calls + ${pauses.length} pauses = ${rows.length - 1} registros`)
      
      return rows
    } catch (error) {
      console.error('❌ Erro ao converter dados:', error)
      return []
    }
  }

  // Função para atualizar dados manualmente
  const refreshData = useCallback(() => {
    fetchDataFromMongoDB()
  }, [])

  // Carregar dados automaticamente
  useEffect(() => {
    fetchDataFromMongoDB()
  }, [])

  return {
    data,
    metrics,
    operatorMetrics,
    rankings,
    errors,
    operators,
    isLoading,
    lastUpdate,
    refreshData,
    clearData: () => {
      setData([])
      setMetrics({})
      setOperatorMetrics({})
      setRankings([])
      setOperators([])
      setErrors([])
    }
  }
}

export default useMongoDB
