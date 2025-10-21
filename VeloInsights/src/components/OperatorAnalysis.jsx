import React from 'react'
import './OperatorAnalysis.css'

const OperatorAnalysis = ({ data, operatorMetrics, selectedOperator }) => {
  // Filtrar dados por operador se selecionado
  const filteredData = selectedOperator 
    ? data.filter(record => record.operator === selectedOperator)
    : data

  // Calcular métricas do operador selecionado
  const operatorData = selectedOperator 
    ? operatorMetrics.find(op => op.operator === selectedOperator)
    : null

  // Calcular métricas gerais se nenhum operador específico
  const generalMetrics = !selectedOperator ? {
    totalOperators: operatorMetrics.length,
    totalCalls: operatorMetrics.reduce((sum, op) => sum + op.totalCalls, 0),
    avgDuration: operatorMetrics.reduce((sum, op) => sum + op.avgDuration, 0) / operatorMetrics.length,
    avgRatingAttendance: operatorMetrics.reduce((sum, op) => sum + op.avgRatingAttendance, 0) / operatorMetrics.length,
    avgRatingSolution: operatorMetrics.reduce((sum, op) => sum + op.avgRatingSolution, 0) / operatorMetrics.length
  } : null

  // Análise temporal do operador selecionado
  const getTemporalAnalysis = () => {
    if (!selectedOperator) return null

    const dailyData = {}
    filteredData.forEach(record => {
      if (record.date) {
        const date = new Date(record.date).toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = {
            calls: 0,
            duration: 0,
            ratings: []
          }
        }
        dailyData[date].calls += (record.call_count || 0)
        dailyData[date].duration += (record.duration_minutes || 0)
        if (record.rating_attendance) dailyData[date].ratings.push(record.rating_attendance)
      }
    })

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      calls: data.calls,
      avgDuration: data.calls > 0 ? data.duration / data.calls : 0,
      avgRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const temporalData = getTemporalAnalysis()

  return (
    <div className="operator-analysis">
      {/* Cabeçalho */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {selectedOperator ? `👤 Análise: ${selectedOperator}` : '👥 Análise Geral dos Operadores'}
          </h2>
          <p className="card-subtitle">
            {selectedOperator 
              ? `Análise detalhada do operador selecionado`
              : `Visão consolidada de todos os ${operatorMetrics.length} operadores`
            }
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Métricas Principais</h3>
        </div>
        
        <div className="metrics-grid">
          {selectedOperator && operatorData ? (
            <>
              <div className="metric-card">
                <div className="metric-value">{operatorData.totalCalls}</div>
                <div className="metric-label">Total de Chamadas</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{operatorData.avgDuration.toFixed(1)} min</div>
                <div className="metric-label">Tempo Médio</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{operatorData.avgRatingAttendance.toFixed(1)}/5</div>
                <div className="metric-label">Nota Atendimento</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{operatorData.avgRatingSolution.toFixed(1)}/5</div>
                <div className="metric-label">Nota Solução</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{operatorData.avgPauseTime.toFixed(1)} min</div>
                <div className="metric-label">Tempo Pausa</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{operatorData.totalRecords}</div>
                <div className="metric-label">Total Registros</div>
              </div>
            </>
          ) : (
            <>
              <div className="metric-card">
                <div className="metric-value">{generalMetrics.totalOperators}</div>
                <div className="metric-label">Total Operadores</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{generalMetrics.totalCalls}</div>
                <div className="metric-label">Total Chamadas</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{generalMetrics.avgDuration.toFixed(1)} min</div>
                <div className="metric-label">Tempo Médio Geral</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{generalMetrics.avgRatingAttendance.toFixed(1)}/5</div>
                <div className="metric-label">Nota Atendimento Geral</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{generalMetrics.avgRatingSolution.toFixed(1)}/5</div>
                <div className="metric-label">Nota Solução Geral</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ranking de Operadores */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏆 Ranking de Operadores</h3>
          <p className="card-subtitle">Ordenado por performance geral</p>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Operador</th>
                <th>Chamadas</th>
                <th>Tempo Médio</th>
                <th>Nota Atendimento</th>
                <th>Nota Solução</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {operatorMetrics.slice(0, 3).map((operator, index) => (
                <tr 
                  key={operator.operator}
                  className={selectedOperator === operator.operator ? 'selected-operator' : ''}
                >
                  <td>
                    <span className={`rank-badge rank-${index + 1}`}>
                      {index + 1}º
                    </span>
                  </td>
                  <td>
                    <strong>{operator.operator}</strong>
                    {selectedOperator === operator.operator && <span className="selected-indicator">👤</span>}
                  </td>
                  <td>{operator.totalCalls}</td>
                  <td>{operator.avgDuration.toFixed(1)} min</td>
                  <td>
                    <span className={`rating ${operator.avgRatingAttendance >= 4 ? 'good' : operator.avgRatingAttendance >= 3 ? 'medium' : 'poor'}`}>
                      {operator.avgRatingAttendance.toFixed(1)}/5
                    </span>
                  </td>
                  <td>
                    <span className={`rating ${operator.avgRatingSolution >= 4 ? 'good' : operator.avgRatingSolution >= 3 ? 'medium' : 'poor'}`}>
                      {operator.avgRatingSolution.toFixed(1)}/5
                    </span>
                  </td>
                  <td>
                    <span className={`performance ${index < 3 ? 'excellent' : index < 8 ? 'good' : 'average'}`}>
                      {index < 3 ? 'Excelente' : index < 8 ? 'Bom' : 'Médio'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise Temporal (apenas para operador específico) */}
      {selectedOperator && temporalData && temporalData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Evolução Temporal - {selectedOperator}</h3>
            <p className="card-subtitle">Performance ao longo do tempo</p>
          </div>
          
          <div className="temporal-analysis">
            <div className="temporal-stats">
              <div className="stat-item">
                <span className="stat-label">Melhor Dia:</span>
                <span className="stat-value">
                  {temporalData.reduce((best, current) => 
                    current.calls > best.calls ? current : best
                  ).date}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pior Dia:</span>
                <span className="stat-value">
                  {temporalData.reduce((worst, current) => 
                    current.calls < worst.calls ? current : worst
                  ).date}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tendência:</span>
                <span className="stat-value">
                  {temporalData.length > 1 ? 
                    (temporalData[temporalData.length - 1].calls > temporalData[0].calls ? '📈 Crescente' : '📉 Decrescente')
                    : '📊 Estável'
                  }
                </span>
              </div>
            </div>
            
            <div className="temporal-chart">
              <canvas id="operatorTemporalChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperatorAnalysis
