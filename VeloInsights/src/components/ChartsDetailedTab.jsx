import React from 'react'
import ChartsDetailedPage from './ChartsDetailedPage'
import './ChartsDetailedTab.css'

const ChartsDetailedTab = ({ 
  data, 
  operatorMetrics, 
  rankings, 
  selectedPeriod, 
  isLoading, 
  pauseData,
  userData,
  filters = {},
  originalData,
  onFiltersChange,
  loadDataOnDemand
}) => {
  return (
    <div className="charts-detailed-tab">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Carregando gráficos...</p>
        </div>
      ) : data && data.length > 0 ? (
        <ChartsDetailedPage 
          data={data}
          operatorMetrics={operatorMetrics}
          rankings={rankings}
          selectedPeriod={selectedPeriod}
          pauseData={pauseData}
          userData={userData}
          filters={filters}
          originalData={originalData}
          onFiltersChange={onFiltersChange}
          loadDataOnDemand={loadDataOnDemand}
        />
      ) : (
        <div className="no-data-container">
          <div className="no-data-icon">📊</div>
          <h3>Selecione um período para carregar dados</h3>
          <p>Escolha o período desejado para visualizar os gráficos avançados.</p>
          <div className="no-data-actions">
            <div className="period-selector">
              <select 
                className="period-select"
                onChange={(e) => {
                  const period = e.target.value
                  if (period && loadDataOnDemand) {
                    loadDataOnDemand(period)
                  }
                }}
                defaultValue=""
              >
                <option value="">Selecione um período...</option>
                <option value="last7Days">7 dias</option>
                <option value="last15Days">15 dias</option>
                <option value="lastMonth">Último mês</option>
                <option value="penultimateMonth">Penúltimo mês</option>
                <option value="currentMonth">Mês atual</option>
                <option value="all">Todos os registros</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartsDetailedTab