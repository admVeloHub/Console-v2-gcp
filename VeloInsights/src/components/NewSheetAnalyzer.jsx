import React, { useState, useEffect } from 'react'
import { useGoogleSheetsDirectSimple } from '../hooks/useGoogleSheetsDirectSimple'
import './NewSheetAnalyzer.css'

/**
 * Componente para ler e analisar dados da nova planilha
 * Colunas específicas: N, O, AC, AD
 */
const NewSheetAnalyzer = () => {
  const { userData, isAuthenticated } = useGoogleSheetsDirectSimple()
  const [newSheetData, setNewSheetData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [showAllOperators, setShowAllOperators] = useState(false)

  // ID da nova planilha
  const NEW_SPREADSHEET_ID = '1QkDmUTGAQQ7uF4ZBnHHcdrCyvjN76I_TN-RwTgvyn0o'

  // Função para verificar se a planilha existe e obter informações
  const checkSpreadsheetInfo = async (accessToken) => {
    try {
      console.log('🔍 Verificando informações da planilha...')
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}?access_token=${accessToken}`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Planilha encontrada:', result.properties?.title)
        console.log('📋 Abas disponíveis:', result.sheets?.map(s => s.properties?.title))
        return { success: true, info: result }
      } else {
        console.log('❌ Erro ao verificar planilha:', response.status)
        return { success: false, error: `Erro ${response.status}` }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar planilha:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Função para testar diferentes ranges e encontrar o correto
  const testDifferentRanges = async (accessToken) => {
    // Primeiro, verificar se a planilha existe
    const sheetInfo = await checkSpreadsheetInfo(accessToken)
    if (!sheetInfo.success) {
      return { success: false, error: `Planilha não encontrada: ${sheetInfo.error}` }
    }
    
    // Usar o nome real da aba encontrado
    const sheetName = sheetInfo.info.sheets?.[0]?.properties?.title || 'Página1'
    console.log(`📋 Usando nome da aba: ${sheetName}`)
    
    const rangesToTest = [
      `${sheetName}!A1:P97768`,   // Range completo incluindo coluna P (comentários)
      `${sheetName}!A:P`,         // Todas as linhas das colunas A até P
      `${sheetName}!A1:P1000`,    // Range médio para teste
      `${sheetName}!A1:P100`,     // Range pequeno para teste
      `${sheetName}!A1:Z10`       // Teste básico para verificar se a planilha existe
    ]
    
    for (const range of rangesToTest) {
      try {
        console.log(`🧪 Testando range: ${range}`)
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}/values/${range}?access_token=${accessToken}`
        
        const response = await fetch(url)
        
        if (response.ok) {
          const result = await response.json()
          console.log(`✅ Range ${range} funcionou! Encontrou ${result.values?.length || 0} linhas`)
          return { success: true, range, data: result.values }
        } else {
          const errorText = await response.text()
          console.log(`❌ Range ${range} falhou: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.log(`❌ Range ${range} erro:`, error.message)
      }
    }
    
    return { success: false, error: 'Nenhum range funcionou' }
  }

  // Função para ler dados da nova planilha
  const readNewSheetData = async () => {
    if (!userData?.accessToken) {
      setError('Usuário não autenticado')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Lendo dados da nova planilha...')
      console.log('📋 Planilha ID:', NEW_SPREADSHEET_ID)
      console.log('🔑 Token disponível:', !!userData.accessToken)
      
      // Testar diferentes ranges para encontrar um que funcione
      const testResult = await testDifferentRanges(userData.accessToken)
      
      if (!testResult.success) {
        throw new Error(`Não foi possível acessar a planilha. ${testResult.error}`)
      }
      
      console.log(`✅ Range funcionando: ${testResult.range}`)
      console.log(`📊 Dados encontrados: ${testResult.data.length} linhas`)
      
      // Processar os dados encontrados
      processData(testResult.data)
      
    } catch (error) {
      console.error('❌ Erro ao ler nova planilha:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para processar os dados obtidos
  const processData = (data) => {
    const headers = data[0]
    const dataRows = data.slice(1)
    
    // Mapear as colunas específicas (agora incluindo coluna A e P)
    const columnMapping = {
      numeroTicket: headers[0],      // Coluna A - Número do ticket
      responsavelTicket: headers[13], // Coluna N (índice 13 no range A:P)
      tipoAvaliacao: headers[14],    // Coluna O (índice 14 no range A:P)
      comentarioAvaliacao: headers[15], // Coluna P (índice 15 no range A:P)
      dia: headers[28],              // Coluna AC (índice 28 no range A:P)
      mes: headers[29]               // Coluna AD (índice 29 no range A:P)
    }
    
    console.log('📋 Cabeçalhos encontrados:', headers)
    console.log('🎯 Mapeamento das colunas:', columnMapping)
    
    // Analisar os dados
    const analysisResult = analyzeData(dataRows, columnMapping)
    
    setNewSheetData(data)
    setAnalysis(analysisResult)
    
    console.log('📊 Análise concluída:', analysisResult)
  }

  // Função para analisar os dados das colunas específicas
  const analyzeData = (dataRows, columnMapping) => {
    const analysis = {
      totalRows: dataRows.length,
      operadores: new Map(), // Mapa para contar por operador
      ticketsDuplicados: new Map(), // Mapa para tickets duplicados do mesmo operador
      numeroTicket: {
        values: [],
        uniqueValues: new Set(),
        emptyCount: 0,
        patterns: new Map()
      },
      responsavelTicket: {
        values: [],
        uniqueValues: new Set(),
        emptyCount: 0,
        patterns: new Map()
      },
      tipoAvaliacao: {
        values: [],
        uniqueValues: new Set(),
        emptyCount: 0,
        patterns: new Map()
      },
      dia: {
        values: [],
        uniqueValues: new Set(),
        emptyCount: 0,
        patterns: new Map()
      },
      mes: {
        values: [],
        uniqueValues: new Set(),
        emptyCount: 0,
        patterns: new Map()
      },
      avaliacoes: {
        boas: [],
        ruins: [],
        totalBoas: 0,
        totalRuins: 0
      }
    }
    
    // Processar cada linha de dados
    dataRows.forEach((row, index) => {
      // Número do ticket (coluna A)
      const numeroTicket = row[0] || ''
      analysis.numeroTicket.values.push(numeroTicket)
      
      if (numeroTicket.trim()) {
        analysis.numeroTicket.uniqueValues.add(numeroTicket.trim())
      } else {
        analysis.numeroTicket.emptyCount++
      }
      
      // Responsável do ticket (coluna N - índice 13 no range A:AD)
      const responsavel = row[13] || ''
      analysis.responsavelTicket.values.push(responsavel)
      
      if (responsavel.trim()) {
        const operadorNome = responsavel.trim()
        analysis.responsavelTicket.uniqueValues.add(operadorNome)
        
        // Contar por operador
        if (!analysis.operadores.has(operadorNome)) {
          analysis.operadores.set(operadorNome, {
            nome: operadorNome,
            totalTickets: 0,
            ticketsUnicos: new Set(),
            tiposAvaliacao: new Set(),
            dias: new Set(),
            meses: new Set(),
            dados: [],
            ticketsDuplicados: new Map()
          })
        }
        
        const operador = analysis.operadores.get(operadorNome)
        
        // Tipo de avaliação (coluna O - índice 14 no range A:P)
        const tipoAvaliacao = row[14] || ''
        
        // Comentário da avaliação (coluna P - índice 15 no range A:P)
        const comentarioAvaliacao = row[15] || ''
        
        // Dia (coluna AC - índice 28 no range A:P)
        const dia = row[28] || ''
        
        // Mês (coluna AD - índice 29 no range A:P)
        const mes = row[29] || ''
        
        // Verificar se é um ticket duplicado do mesmo operador
        if (numeroTicket.trim() && operador.ticketsUnicos.has(numeroTicket.trim())) {
          // Ticket duplicado - adicionar às alterações
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
          // Ticket único - adicionar ao Set de únicos
          if (numeroTicket.trim()) {
            operador.ticketsUnicos.add(numeroTicket.trim())
          }
        }
        
        // SEMPRE contar todas as ocorrências (linhas) do operador
        operador.totalTickets++
        
        // Adicionar dados às coleções do operador
        if (tipoAvaliacao.trim()) {
          operador.tiposAvaliacao.add(tipoAvaliacao.trim())
        }
        
        if (dia.trim()) {
          operador.dias.add(dia.trim())
        }
        
        if (mes.trim()) {
          operador.meses.add(mes.trim())
        }
        
        // Armazenar dados completos da linha
        operador.dados.push({
          linha: index + 2,
          numeroTicket: numeroTicket,
          responsavel: responsavel,
          tipoAvaliacao: tipoAvaliacao,
          comentarioAvaliacao: comentarioAvaliacao,
          dia: dia,
          mes: mes
        })
        
        // Processar avaliações (Bom/Ruim)
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
            analysis.avaliacoes.boas.push(ticketData)
            analysis.avaliacoes.totalBoas++
          } else if (avaliacaoLower.includes('ruim')) {
            analysis.avaliacoes.ruins.push(ticketData)
            analysis.avaliacoes.totalRuins++
          }
        }
        
        // Contar padrões de nomes
        const namePattern = operadorNome.split(' ').length > 1 ? 'Nome Completo' : 'Nome Simples'
        analysis.responsavelTicket.patterns.set(namePattern, (analysis.responsavelTicket.patterns.get(namePattern) || 0) + 1)
      } else {
        analysis.responsavelTicket.emptyCount++
      }
      
      // Tipo de avaliação (coluna O - índice 14) - análise geral
      const tipoAvaliacaoGeral = row[14] || ''
      analysis.tipoAvaliacao.values.push(tipoAvaliacaoGeral)
      if (tipoAvaliacaoGeral.trim()) {
        analysis.tipoAvaliacao.uniqueValues.add(tipoAvaliacaoGeral.trim())
      } else {
        analysis.tipoAvaliacao.emptyCount++
      }
      
      // Dia (coluna AC - índice 28) - análise geral
      const diaGeral = row[28] || ''
      analysis.dia.values.push(diaGeral)
      if (diaGeral.trim()) {
        analysis.dia.uniqueValues.add(diaGeral.trim())
        // Analisar formato da data
        const datePattern = diaGeral.includes('/') ? 'DD/MM/YYYY' : diaGeral.includes('-') ? 'YYYY-MM-DD' : 'Outro'
        analysis.dia.patterns.set(datePattern, (analysis.dia.patterns.get(datePattern) || 0) + 1)
      } else {
        analysis.dia.emptyCount++
      }
      
      // Mês (coluna AD - índice 29) - análise geral
      const mesGeral = row[29] || ''
      analysis.mes.values.push(mesGeral)
      if (mesGeral.trim()) {
        analysis.mes.uniqueValues.add(mesGeral.trim())
        // Analisar formato do mês
        const monthPattern = mesGeral.length === 2 ? 'MM' : mesGeral.length === 1 ? 'M' : 'Texto'
        analysis.mes.patterns.set(monthPattern, (analysis.mes.patterns.get(monthPattern) || 0) + 1)
      } else {
        analysis.mes.emptyCount++
      }
    })
    
    // Converter Sets para Arrays e ordenar operadores por total de tickets
    analysis.numeroTicket.uniqueValues = Array.from(analysis.numeroTicket.uniqueValues)
    analysis.responsavelTicket.uniqueValues = Array.from(analysis.responsavelTicket.uniqueValues)
    analysis.tipoAvaliacao.uniqueValues = Array.from(analysis.tipoAvaliacao.uniqueValues)
    analysis.dia.uniqueValues = Array.from(analysis.dia.uniqueValues)
    analysis.mes.uniqueValues = Array.from(analysis.mes.uniqueValues)
    
    // Converter operadores para array ordenado
    analysis.operadoresArray = Array.from(analysis.operadores.values())
      .map(op => ({
        ...op,
        ticketsUnicos: Array.from(op.ticketsUnicos),
        tiposAvaliacao: Array.from(op.tiposAvaliacao),
        dias: Array.from(op.dias),
        meses: Array.from(op.meses),
        ticketsDuplicados: Array.from(op.ticketsDuplicados.values())
      }))
      .sort((a, b) => b.totalTickets - a.totalTickets) // Ordenar por total de tickets (maior primeiro)
    
    return analysis
  }

  // Efeito para carregar dados automaticamente quando autenticado
  useEffect(() => {
    if (isAuthenticated && userData?.accessToken) {
      readNewSheetData()
    }
  }, [isAuthenticated, userData?.accessToken])

  if (!isAuthenticated) {
    return (
      <div className="new-sheet-analyzer">
        <div className="alert alert-warning">
          <h3>🔐 Autenticação Necessária</h3>
          <p>Você precisa estar logado para acessar a nova planilha.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="new-sheet-analyzer">
      {error && (
        <div className="alert alert-error">
          <h4>❌ Erro</h4>
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          {/* Seção integrada: Análise de Tickets */}
          {analysis && analysis.avaliacoes && (
            <div className="ticket-analysis-section">
              <h2>📊 Análise de Ticket por Operador</h2>
              
              {/* Controles Superiores */}
              <div className="ticket-controls-top">
                <div className="operator-selector-main">
                  <label>Selecione um operador:</label>
                  <select 
                    value={selectedOperator || ''} 
                    onChange={(e) => setSelectedOperator(e.target.value || null)}
                    className="operator-dropdown-main"
                  >
                    <option value="">-- Escolha um operador --</option>
                    {analysis.operadoresArray.map((operador, index) => (
                      <option key={index} value={operador.nome}>
                        {operador.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Controles Inferiores */}
              <div className="ticket-controls-bottom">
                <div className="control-item">
                  <span className="control-icon">📁</span>
                  <span className="control-label">Número do Ticket</span>
                </div>
                
                <div className="control-item">
                  <span className="control-icon">👥</span>
                  <span className="control-label">Responsáveis</span>
                </div>
                
                <div className="control-item">
                  <span className="control-icon">📊</span>
                  <span className="control-label">Quantidade de avaliações</span>
                </div>
              </div>

              {/* Seção Dinâmica */}
              <div className="dynamic-section">
                <div className="dynamic-content">
                  {selectedOperator ? (
                    <div className="operator-details-dynamic">
                      {(() => {
                        const operador = analysis.operadoresArray.find(op => op.nome === selectedOperator)
                        if (!operador) return null
                        
                        // Filtrar avaliações do operador selecionado
                        const avaliacoesBoas = analysis.avaliacoes.boas.filter(av => av.operador === operador.nome)
                        const avaliacoesRuins = analysis.avaliacoes.ruins.filter(av => av.operador === operador.nome)
                        
                        return (
                          <div className="operator-performance-layout">
                            {/* Nome do Operador */}
                            <div className="operator-name">
                              <h2>{operador.nome}</h2>
                            </div>
                            
                            {/* Cards de Resumo Detalhados */}
                            <div className="summary-cards-detailed">
                              {/* Primeira linha */}
                              <div className="summary-row">
                                <div className="summary-card-small">
                                  <h3>Total de tickets</h3>
                                  <div className="summary-value">{operador.totalTickets}</div>
                                </div>
                                
                                <div className="summary-card-small">
                                  <h3>Tickets com avaliação</h3>
                                  <div className="summary-value">{avaliacoesBoas.length + avaliacoesRuins.length}</div>
                                </div>
                                
                             <div className="summary-card-small">
                               <h3>Média de Performance</h3>
                               <div className="summary-value">
                                 {(() => {
                                   const totalAvaliados = avaliacoesBoas.length + avaliacoesRuins.length;
                                   if (totalAvaliados === 0) return '0%';
                                   const totalBoas = avaliacoesBoas.length;
                                   const porcentagem = ((totalBoas / totalAvaliados) * 100).toFixed(1);
                                   return `${porcentagem}%`;
                                 })()}
                               </div>
                             </div>
                              </div>
                              
                              {/* Segunda linha */}
                              <div className="summary-row">
                                <div className="summary-card-small">
                                  <h3>Bom</h3>
                                  <div className="summary-value">{avaliacoesBoas.filter(av => !av.temComentario).length}</div>
                                </div>
                                
                                <div className="summary-card-small">
                                  <h3>Bom com comentário</h3>
                                  <div className="summary-value">{avaliacoesBoas.filter(av => av.temComentario).length}</div>
                                </div>
                                
                                <div className="summary-card-small">
                                  <h3>Ruim</h3>
                                  <div className="summary-value">{avaliacoesRuins.filter(av => !av.temComentario).length}</div>
                                </div>
                                
                                <div className="summary-card-small">
                                  <h3>Ruim com comentário</h3>
                                  <div className="summary-value">{avaliacoesRuins.filter(av => av.temComentario).length}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Seções de Avaliações */}
                            <div className="evaluations-sections">
                              <div className="evaluation-section notas-boas">
                                <h3>Notas boas</h3>
                                <div className="evaluation-content">
                                  {avaliacoesBoas.length > 0 ? (
                                    <div className="evaluation-list">
                                      {avaliacoesBoas.map((avaliacao, index) => (
                                        <TicketAvaliacaoCard key={index} avaliacao={avaliacao} tipo="boa" />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="empty-evaluation">
                                      <p>Nenhuma avaliação boa encontrada</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="evaluation-section notas-ruins">
                                <h3>Notas ruins</h3>
                                <div className="evaluation-content">
                                  {avaliacoesRuins.length > 0 ? (
                                    <div className="evaluation-list">
                                      {avaliacoesRuins.map((avaliacao, index) => (
                                        <TicketAvaliacaoCard key={index} avaliacao={avaliacao} tipo="ruim" />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="empty-evaluation">
                                      <p>Nenhuma avaliação ruim encontrada</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="placeholder-content">
                      <p>Seção que irá ser visualizada após selecionar o operador e o período</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

// Componente para exibir cada avaliação de ticket
const TicketAvaliacaoCard = ({ avaliacao, tipo }) => {
  const [mostrarComentario, setMostrarComentario] = React.useState(false)
  
  return (
    <div className={`ticket-avaliacao-card ${tipo}`}>
      <div className="ticket-info">
        <span className="ticket-numero">
          🎫 Ticket #
          <a 
            href={`https://app.octadesk.com/ticket/edit/${avaliacao.numeroTicket}`}
            target="_blank"
            className="ticket-link"
            title="Abrir ticket no OCTA"
          >
            {avaliacao.numeroTicket}
          </a>
        </span>
        <span className="ticket-avaliacao">{avaliacao.tipoAvaliacao}</span>
      </div>
      
      {avaliacao.temComentario && avaliacao.comentario && (
        <div className="comentario-section">
          <button 
            className="btn-ver-comentario"
            onClick={() => setMostrarComentario(!mostrarComentario)}
          >
            {mostrarComentario ? '📝 Ocultar Comentário' : '📝 Ver Comentário'}
          </button>
          
          {mostrarComentario && (
            <div className="comentario-texto">
              <p>{avaliacao.comentario}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NewSheetAnalyzer
