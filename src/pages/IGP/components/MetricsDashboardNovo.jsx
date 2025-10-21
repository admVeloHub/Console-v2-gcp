import React, { memo, useState, useMemo } from 'react'
import './MetricsDashboard.css'
import TendenciaSemanalChart from './TendenciaSemanalChart2'
import CSATChart from './CSATChart'
import VolumeProdutoURAChart from './VolumeProdutoURAChart'
import VolumeHoraChart from './VolumeHoraChart'

// VERSION: v1.7.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const MetricsDashboard = memo(({ metrics = {}, rankings = [], octaData = null, data = [], periodo = null, fullDataset = [], hideNames = false, dataSource = 'telefonia' }) => {
  // Usar dataSource da prop em vez de estado interno
  const activeView = dataSource === 'telefonia' ? '55pbx' : 'octadesk'

  // Preparar dados para os gráficos - usar dados processados
  const chartData = useMemo(() => {
    // Sempre usar dados processados (objetos) em vez de dados brutos (arrays)
    return data.length > 0 ? data : []
  }, [data])

  return (
    <div>
      {/* View 55pbx */}
      {activeView === '55pbx' && (
        <div className="view active">

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
      </div>

      {/* Cards de Gráficos */}
      <div className="container-main">
        <h3 style={{ color: '#006AB9', marginBottom: '16px', marginTop: '0', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Análise Geral</h3>
        <div style={{ height: '400px' }}>
          <TendenciaSemanalChart data={chartData} periodo={periodo} />
        </div>
      </div>

      <div className="container-main">
        <h3 style={{ color: '#006AB9', marginBottom: '16px', marginTop: '0', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>CSAT - Satisfação do Cliente</h3>
        <div style={{ height: '400px' }}>
          <CSATChart data={chartData} periodo={periodo} />
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="container-main">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="container-secondary">
            <div className="chart-container">
              <h3 style={{ color: '#006AB9', marginBottom: '16px', marginTop: '0', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Volume por Produto URA</h3>
              {/* Gráfico será renderizado aqui */}
            </div>
          </div>

          <div className="container-secondary">
            <div className="chart-container">
              <h3 style={{ color: '#006AB9', marginBottom: '16px', marginTop: '0', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Volume por Hora</h3>
              {/* Gráfico será renderizado aqui */}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking de Operadores */}
      {rankings && rankings.length > 0 && (
        <div className="velohub-card">
          <div className="card-content">
            <h3 style={{ color: '#006AB9', marginBottom: '16px', marginTop: '0', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>🏆 Ranking de Operadores</h3>
            <table className="rankings-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Operador</th>
                  <th>Chamadas</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {rankings.slice(0, 3).map((operator, index) => (
                  <tr key={index}>
                    <td className="position">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}º`}
                    </td>
                    <td>{hideNames ? 'Operador' : operator.operator}</td>
                    <td>{operator.totalCalls || 0}</td>
                    <td>{operator.avgRatingAttendance || 0}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}

      {/* View Octadesk */}
      {activeView === 'octadesk' && (
        <div className="view active">

          <div className="indicators-grid">
            <div className="indicator-card">
              <i className='bx bx-message-detail indicator-icon'></i>
              <div className="indicator-label">Total de Tickets</div>
              <div className="indicator-value">{octaData?.octaMetrics?.totalTickets || 0}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-time-five indicator-icon'></i>
              <div className="indicator-label">Performance Geral</div>
              <div className="indicator-value">{octaData?.octaMetrics?.porcentagemGeral || '0%'}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-check-circle indicator-icon'></i>
              <div className="indicator-label">Tickets Avaliados</div>
              <div className="indicator-value">{octaData?.octaMetrics?.totalAvaliados || 0}</div>
            </div>
            <div className="indicator-card">
              <i className='bx bx-star indicator-icon'></i>
              <div className="indicator-label">Avaliações Boas</div>
              <div className="indicator-value">{(parseInt(octaData?.octaMetrics?.bomSemComentario?.replace(/\./g, '') || '0') + parseInt(octaData?.octaMetrics?.bomComComentario?.replace(/\./g, '') || '0')).toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* Cards de Gráficos - Tickets */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Análise Geral de Tickets</h3>
              <i className='bx bx-trending-up card-icon'></i>
            </div>
            <div className="chart-container">
              <TendenciaSemanalChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">CSAT - Satisfação do Cliente (Tickets)</h3>
              <i className='bx bx-star card-icon'></i>
            </div>
            <div className="chart-container">
              <CSATChart data={octaData?.octaRawData || []} periodo={periodo} />
            </div>
          </div>

          {/* Gráficos em Grid - Tickets */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Volume por Assunto</h3>
                <i className='bx bx-line-chart card-icon'></i>
              </div>
              <div className="chart-container">
                <VolumeProdutoURAChart data={octaData?.octaRawData || []} periodo={periodo} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Volume por Hora (Tickets)</h3>
                <i className='bx bx-bar-chart-alt-2 card-icon'></i>
              </div>
              <div className="chart-container">
                <VolumeHoraChart data={octaData?.octaRawData || []} periodo={periodo} />
              </div>
            </div>
          </div>

          {/* Ranking de Atendentes - Tickets */}
          {octaData?.octaRankings && octaData.octaRankings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🏆 Ranking de Atendentes</h3>
              </div>
              <div className="card-content">
                <table className="rankings-table">
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Atendente</th>
                      <th>Tickets</th>
                      <th>Avaliação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {octaData.octaRankings.slice(0, 3).map((atendente, index) => (
                      <tr key={index}>
                        <td className="position">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `${index + 1}º`}
                        </td>
                        <td>{atendente.nome || atendente.operator}</td>
                        <td>{atendente.totalTickets || atendente.totalCalls || 0}</td>
                        <td>{atendente.notaMedia || atendente.avgRatingAttendance || 0}/5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default MetricsDashboard
