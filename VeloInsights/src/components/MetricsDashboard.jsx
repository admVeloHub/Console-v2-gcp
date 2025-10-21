import React, { memo, useState, useEffect } from 'react'
import { useCargo } from '../contexts/CargoContext'
import { getOperatorDisplayName, prioritizeCurrentUserInMiddle } from '../utils/operatorUtils'
import ComparativosTemporais from './ComparativosTemporais'
import './MetricsDashboard.css'

const MetricsDashboard = memo(({ metrics, operatorMetrics, rankings, darkList, addToDarkList, removeFromDarkList, periodo, onToggleNotes, userData, filters = {}, onFiltersChange, data = [], previousPeriodData = [], fullDataset = [], octaData = null }) => {
  const { hasPermission, selectedCargo, userInfo } = useCargo()
  
  // Verificar se deve ocultar nomes baseado no cargo PRINCIPAL do usuário, não no cargo selecionado
  // SUPERADMIN/GESTOR/ANALISTA sempre veem métricas gerais, mesmo quando assumem cargo de OPERADOR
  const shouldHideNames = userInfo?.cargo === 'OPERADOR'
  
  // Função para obter nome do operador (ocultar ou mostrar)
  const getOperatorName = (operator, index) => {
    return getOperatorDisplayName(operator.operator, index, userData, shouldHideNames)
  }

  // Função para calcular performance individual de tickets do operador
  const calculateOperatorPerformance = (operatorName) => {
    // Debug: verificar estrutura dos dados
    console.log('🔍 calculateOperatorPerformance - Debug:', {
      operatorName,
      octaData: octaData ? 'presente' : 'ausente',
      octaMetrics: octaData?.octaMetrics ? 'presente' : 'ausente',
      avaliacoes: octaData?.octaMetrics?.avaliacoes ? 'presente' : 'ausente',
      avaliacoesBoas: octaData?.octaMetrics?.avaliacoes?.boas ? `array com ${octaData.octaMetrics.avaliacoes.boas.length} itens` : 'ausente',
      avaliacoesRuins: octaData?.octaMetrics?.avaliacoes?.ruins ? `array com ${octaData.octaMetrics.avaliacoes.ruins.length} itens` : 'ausente'
    })
    
    if (!octaData?.octaMetrics?.avaliacoes) {
      console.log('❌ Dados de avaliações não disponíveis')
      return '0%'
    }
    
    // Usar a mesma lógica do NewSheetAnalyzer: filtrar avaliações por operador
    const avaliacoesBoas = octaData.octaMetrics.avaliacoes.boas.filter(av => 
      av.operador && av.operador.toLowerCase().trim() === operatorName.toLowerCase().trim()
    )
    
    const avaliacoesRuins = octaData.octaMetrics.avaliacoes.ruins.filter(av => 
      av.operador && av.operador.toLowerCase().trim() === operatorName.toLowerCase().trim()
    )
    
    console.log('🔍 Avaliações filtradas:', {
      avaliacoesBoas: avaliacoesBoas.length,
      avaliacoesRuins: avaliacoesRuins.length,
      totalAvaliados: avaliacoesBoas.length + avaliacoesRuins.length
    })
    
    // Debug: mostrar alguns exemplos de operadores nas avaliações
    if (octaData.octaMetrics.avaliacoes.boas.length > 0) {
      console.log('🔍 Exemplos de operadores nas avaliações boas:', 
        octaData.octaMetrics.avaliacoes.boas.slice(0, 5).map(av => av.operador)
      )
    }
    if (octaData.octaMetrics.avaliacoes.ruins.length > 0) {
      console.log('🔍 Exemplos de operadores nas avaliações ruins:', 
        octaData.octaMetrics.avaliacoes.ruins.slice(0, 5).map(av => av.operador)
      )
    }
    
    // Debug: mostrar todos os operadores únicos disponíveis nas avaliações
    const todosOperadores = [
      ...octaData.octaMetrics.avaliacoes.boas.map(av => av.operador),
      ...octaData.octaMetrics.avaliacoes.ruins.map(av => av.operador)
    ]
    const operadoresUnicos = [...new Set(todosOperadores)].slice(0, 10)
    console.log('🔍 Operadores únicos disponíveis nas avaliações:', operadoresUnicos)
    
    const totalAvaliados = avaliacoesBoas.length + avaliacoesRuins.length
    
    if (totalAvaliados === 0) {
      console.log('❌ Nenhuma avaliação encontrada para o operador:', operatorName)
      return '0%'
    }
    
    const performance = ((avaliacoesBoas.length / totalAvaliados) * 100).toFixed(1)
    console.log('✅ Performance calculada:', `${performance}%`)
    return `${performance}%`
  }
  
  // Ordenar rankings dando prioridade ao usuário logado no meio
  const prioritizedRankings = shouldHideNames && userData?.email 
    ? prioritizeCurrentUserInMiddle(rankings || [], userData, 'totalCalls')
    : rankings || []
  
  // Debug apenas se houver erro
  if (!metrics && operatorMetrics?.length > 0) {
    console.error('❌ MetricsDashboard: metrics ausente mas operatorMetrics presente')
  }

  // Verificar permissão para ver métricas gerais
  if (!hasPermission('canViewGeneralMetrics')) {
    return (
      <div className="metrics-dashboard">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Métricas Gerais</h2>
          </div>
          <div className="card-content">
            <p>❌ Você não tem permissão para visualizar métricas gerais.</p>
            <p>Cargo atual: {selectedCargo}</p>
            <p>Permissão necessária: canViewGeneralMetrics</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="metrics-dashboard">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Métricas Gerais</h2>
          </div>
          <div className="card-content">
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Section Title */}
      <div className="section-title">
        <i className='bx bxs-phone'></i>
        <h2>55pbx - Sistema de Telefonia</h2>
      </div>

      {/* Indicadores */}
      <div className="indicators-grid">
        <div className="indicator-card">
          <i className='bx bx-phone-call indicator-icon'></i>
          <div className="indicator-label">Total de Chamadas</div>
          <div className="indicator-value">{(metrics.totalCalls || 0).toLocaleString('pt-BR')}</div>
        </div>
        <div className="indicator-card">
          <i className='bx bx-time-five indicator-icon'></i>
          <div className="indicator-label">TMA Geral</div>
          <div className="indicator-value">{metrics.duracaoMediaAtendimento || '0.0'} min</div>
        </div>
        <div className="indicator-card">
          <i className='bx bx-check-circle indicator-icon'></i>
          <div className="indicator-label">Taxa de Atendimento</div>
          <div className="indicator-value">{((metrics.atendida / metrics.totalCalls * 100) || 0).toFixed(1)}%</div>
        </div>
        <div className="indicator-card">
          <i className='bx bx-star indicator-icon'></i>
          <div className="indicator-label">Nota Média</div>
          <div className="indicator-value">{metrics.notaMediaAtendimento || '0.0'}/5</div>
        </div>
      </div>

      {/* Cards de Gráficos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Volume Histórico Geral</h3>
          <i className='bx bx-trending-up card-icon'></i>
        </div>
        <div className="chart-container">
          {/* Gráfico será renderizado aqui */}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">CSAT - Satisfação do Cliente</h3>
          <i className='bx bx-star card-icon'></i>
        </div>
        <div className="chart-container">
          {/* Gráfico será renderizado aqui */}
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Volume por Produto URA</h3>
            <i className='bx bx-line-chart card-icon'></i>
          </div>
          <div className="chart-container">
            {/* Gráfico será renderizado aqui */}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Volume por Hora</h3>
            <i className='bx bx-bar-chart-alt-2 card-icon'></i>
          </div>
          <div className="chart-container">
            {/* Gráfico será renderizado aqui */}
          </div>
        </div>
      </div>

      {/* Ranking de Operadores */}
      {prioritizedRankings && prioritizedRankings.length > 0 && (
                     <div className="card">
                       <div className="card-header">
                         <h2 className="card-title">📊Tickets </h2>
                       </div>
                       <div className="card-content">
                         <div className="metrics-grid">
                           {/* Dados OCTA - Tickets */}
                           {octaData && octaData.octaMetrics ? (
                             <>
                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.totalTickets || 0}</div>
                                 <div className="metric-label">🎫 Total de Tickets</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.porcentagemGeral || '0%'}</div>
                                 <div className="metric-label">📈 Performance Geral</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{octaData.octaMetrics.totalAvaliados || 0}</div>
                                 <div className="metric-label">✅ Tickets Avaliados</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{(parseInt(octaData.octaMetrics.bomSemComentario?.replace(/\./g, '') || '0') + parseInt(octaData.octaMetrics.bomComComentario?.replace(/\./g, '') || '0')).toLocaleString('pt-BR')}</div>
                                 <div className="metric-label">👍 Bom</div>
                               </div>

                               <div className="metric-card octa-section">
                                 <div className="metric-value">{(parseInt(octaData.octaMetrics.ruimSemComentario?.replace(/\./g, '') || '0') + parseInt(octaData.octaMetrics.ruimComComentario?.replace(/\./g, '') || '0')).toLocaleString('pt-BR')}</div>
                                 <div className="metric-label">👎 Ruim</div>
                               </div>
                             </>
                           ) : octaData && octaData.error ? (
                             <div className="metric-card octa-section octa-error">
                               <div className="metric-value">❌</div>
                               <div className="metric-label">Erro OCTA</div>
                               <div className="octa-error-details">
                                 <p>{octaData.error}</p>
                                 {octaData.retryLoad && (
                                   <button 
                                     onClick={octaData.retryLoad}
                                     className="octa-retry-btn"
                                   >
                                     🔄 Tentar Novamente
                                   </button>
                                 )}
                               </div>
                             </div>
                           ) : octaData && octaData.isLoading ? (
                             <div className="metric-card octa-section octa-loading">
                               <div className="metric-value">
                                 <div className="loading-spinner-octa">
                                   <div className="spinner"></div>
                                 </div>
                               </div>
                               <div className="metric-label">Carregando dados OCTA...</div>
                             </div>
                           ) : (
                             <div className="metric-card octa-section">
                               <div className="metric-value">📊</div>
                               <div className="metric-label">Aguardando dados OCTA</div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ) : (
                     /* Mensagem quando não há período selecionado para OCTA */
                     <div className="card">
                       <div className="card-header">
                         <h2 className="card-title">📊 Tickets</h2>
                       </div>
                       <div className="card-content">
                         <div className="no-data-message">
                           <p>📅 Selecione um período para visualizar as métricas OCTA</p>
                         </div>
                       </div>
                     </div>
                   )}
          </div>
        </div>
      </div>

      {/* Ranking de Operadores - Só mostra se há período selecionado */}
      {prioritizedRankings && prioritizedRankings.length > 0 && periodo && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <h2 className="card-title">🏆 Ranking de Operadores</h2>
              <div className="ranking-filter">
                <label 
                  className="filter-checkbox-inline"
                  onClick={(e) => {
                    console.log('🔧 LABEL CLICADO!')
                    e.preventDefault()
                    const checkbox = e.currentTarget.querySelector('input[type="checkbox"]')
                    if (checkbox) {
                      checkbox.checked = !checkbox.checked
                      console.log('🔧 CHECKBOX alterado para:', checkbox.checked)
                      if (onFiltersChange) {
                        const newFilters = { ...filters, hideDesligados: checkbox.checked }
                        console.log('🔧 Enviando novos filters:', newFilters)
                        onFiltersChange(newFilters)
                      }
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters?.hideDesligados || false}
                    onChange={(e) => {
                      console.log('🔧 CHECKBOX CLICADO! Valor:', e.target.checked)
                      console.log('🔧 Filters atual:', filters)
                      if (onFiltersChange) {
                        const newFilters = { ...filters, hideDesligados: e.target.checked }
                        console.log('🔧 Enviando novos filters:', newFilters)
                        onFiltersChange(newFilters)
                      } else {
                        console.log('❌ onFiltersChange não existe!')
                      }
                    }}
                  />
                  <span className="checkbox-custom-inline"></span>
                  <span className="filter-label-inline">
                    <span className="filter-icon">👥</span>
                    Ocultar desligados
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Operador</th>
                    <th>Score</th>
                    <th>Chamadas</th>
                    <th>Duração Média</th>
                    <th>Nota Atendimento</th>
                    <th>Nota Solução</th>
                    <th>Chamadas Avaliadas</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritizedRankings.slice(0, 3).map((operator, index) => (
                    <tr key={`${operator.operator}-${index}`} className={`${index < 3 ? 'top-3' : ''} ${operator.isExcluded ? 'excluded-row' : ''} ${operator.isDesligado ? 'desligado-row' : ''}`}>
                      <td className="position">
                        {operator.isExcluded ? '🚫' : operator.isDesligado ? '👤' : (
                          <>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `${index + 1}º`}
                          </>
                        )}
                      </td>
                      <td className="operator-name">
                        {getOperatorName(operator, index)}
                        {operator.isExcluded && <span className="excluded-badge"> (Excluído)</span>}
                        {operator.isDesligado && <span className="desligado-badge"> (Desligado)</span>}
                      </td>
                      <td className="score">{operator.score || '0.0'}</td>
                      <td>{operator.totalCalls || operator.totalAtendimentos || 0}</td>
                      <td>{operator.avgDuration || 0} min</td>
                      <td>{operator.avgRatingAttendance || 0}/5</td>
                      <td>{operator.avgRatingSolution || 0}/5</td>
                      <td className="chamadas-avaliadas-cell">
                        <div className="chamadas-avaliadas-container">
                          <span className="chamadas-count">{operator.chamadasAvaliadas || 0}</span>
                          {operator.chamadasAvaliadas > 0 && periodo && periodo.type !== 'allRecords' && (
                            <button 
                              className="expand-notes-btn"
                              onClick={() => onToggleNotes(operator.operator)}
                              title="Ver notas detalhadas"
                            >
                              📋
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="performance-cell">
                        {calculateOperatorPerformance(operator.operator)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há período selecionado para ranking */}
      {!periodo && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 Ranking de Operadores</h2>
          </div>
          <div className="card-content">
            <div className="no-data-message">
              <p>📅 Selecione um período para visualizar o ranking de operadores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

MetricsDashboard.displayName = 'MetricsDashboard'

export default MetricsDashboard