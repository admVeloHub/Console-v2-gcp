import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DataFetcher from './components/DataFetcher'
import LoginTest from './components/LoginTest'
import MetricsDashboard from './components/MetricsDashboard'
import ChartsSection from './components/ChartsSection'
import ExportSection from './components/ExportSection'
import OperatorAnalysis from './components/OperatorAnalysis'
import ProgressIndicator from './components/ProgressIndicator'
import AdvancedFilters from './components/AdvancedFilters'
import DarkListManager from './components/DarkListManager'
import ChartsDetailedTab from './components/ChartsDetailedTab'
import AgentAnalysis from './components/AgentAnalysis'
import PreferencesManager from './components/PreferencesManager'
import CargoSelection from './components/CargoSelection'
import { CargoProvider, useCargo } from './contexts/CargoContext'
import { useGoogleSheetsDirectSimple } from './hooks/useGoogleSheetsDirectSimple'
import { useDataFilters } from './hooks/useDataFilters'
import { useTheme } from './hooks/useTheme'
import './styles/App.css'

// Componente interno que usa o hook useCargo
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('fetch')
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [viewMode, setViewMode] = useState('company') // 'company' ou 'operator'
  const [showDarkList, setShowDarkList] = useState(false)
  const [showNewLogin, setShowNewLogin] = useState(false) // Para mostrar a nova tela de login
  const [showPreferences, setShowPreferences] = useState(false)
  
  // Hook do sistema de cargos
  const { 
    selectedCargo, 
    setSelectedCargo,
    showCargoSelection,
    userData,
    isAuthenticated,
    isLoading: cargoLoading,
    error: cargoError 
  } = useCargo()
  
  // Hook para tema
  const { theme, toggleTheme } = useTheme()
  
  // Estados para dados e outras configurações
  const [data, setData] = useState([])
  const [rawData, setRawData] = useState([])
  const [metrics, setMetrics] = useState({})
  const [operatorMetrics, setOperatorMetrics] = useState({})
  const [rankings, setRankings] = useState([])
  const [darkList, setDarkList] = useState([])
  const [filters, setFilters] = useState({})
  const [filteredData, setFilteredData] = useState([])
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Hook do Google Sheets
  const {
    data: sheetsData,
    isLoading: sheetsLoading,
    error: sheetsError,
    signIn,
    signOut,
    isAuth,
    user
  } = useGoogleSheetsDirectSimple()

  // Hook para filtros
  const {
    filteredData: processedFilteredData,
    operatorMetrics: processedOperatorMetrics,
    rankings: processedRankings,
    metrics: processedMetrics,
    isLoading: isProcessing,
    error: processingError
  } = useDataFilters(data, filters, darkList)

  // Efeito para lidar com mudanças de dados
  useEffect(() => {
    if (processedFilteredData && processedOperatorMetrics && processedRankings && processedMetrics) {
      setData(processedFilteredData)
      setOperatorMetrics(processedOperatorMetrics)
      setRankings(processedRankings)
      setMetrics(processedMetrics)
    }
  }, [processedFilteredData, processedOperatorMetrics, processedRankings, processedMetrics])

  // Função para lidar com cargo selecionado
  const handleCargoSelected = (cargo) => {
    setSelectedCargo(cargo)
    console.log('🎯 Cargo selecionado:', cargo)
  }

  // Função para alternar sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Função para mudar visualização
  const handleViewChange = (view) => {
    setCurrentView(view)
    if (view === 'agents') {
      setSelectedOperator(null)
    }
  }

  // Função para selecionar operador
  const handleOperatorSelect = (op) => {
    setSelectedOperator(op)
  }

  // Função para adicionar à dark list
  const addToDarkList = (operator) => {
    setDarkList([...darkList, operator])
  }

  // Função para remover da dark list
  const removeFromDarkList = (operator) => {
    setDarkList(darkList.filter(op => op !== operator))
  }

  // Função para atualizar dark list
  const updateDarkList = (newDarkList) => {
    setDarkList(newDarkList)
  }

  return (
    <div className="app">
      <Header 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <div className="app-content">
        <Sidebar 
          open={sidebarOpen}
          currentView={currentView}
          onViewChange={handleViewChange}
          hasData={data && data.length > 0}
          onClearData={() => {}}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedOperator={selectedOperator}
          onOperatorSelect={handleOperatorSelect}
          operatorMetrics={operatorMetrics}
          onShowPreferences={() => setShowPreferences(true)}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {isLoading && (
            <ProgressIndicator 
              progress={{ current: 50, total: 100, message: 'Carregando dados...' }}
              onCancel={() => {}}
            />
          )}
          
          {(currentView === 'fetch' || showNewLogin) && (
            <LoginTest
              onContinue={() => setShowNewLogin(false)}
              onSignIn={signIn}
              isLoading={isLoading}
              isLoggedIn={false} // Será true quando o usuário estiver autenticado
            />
          )}
          
          {currentView === 'dashboard' && (
            <>
              {data && data.length > 0 ? (
                <>
                  <AdvancedFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    operatorMetrics={operatorMetrics}
                    data={data}
                    pauseData={data}
                  />
                  
                  <div className="dark-list-controls">
                    <button 
                      className="btn btn-dark-list"
                      onClick={() => setShowDarkList(true)}
                      title="Gerenciar Dark List de operadores"
                    >
                      Gerenciar Dark List ({darkList.length} excluídos)
                    </button>
                  </div>
                  
                  <MetricsDashboard 
                    metrics={metrics}
                    operatorMetrics={operatorMetrics}
                    rankings={rankings}
                    filteredData={filteredData}
                    darkList={darkList}
                    addToDarkList={addToDarkList}
                    removeFromDarkList={removeFromDarkList}
                    data={data}
                  />
                  
                  <ExportSection 
                    data={data}
                    metrics={metrics}
                    operatorMetrics={operatorMetrics}
                    rankings={rankings}
                  />
                </>
              ) : (
                <div className="loading-container">
                  <h2>Carregando dados da planilha...</h2>
                  <p>Por favor, aguarde enquanto os dados são processados.</p>
                </div>
              )}
            </>
          )}
          
          {/* Aba Gráficos Detalhados */}
          {currentView === 'charts' && data && data.length > 0 && (
            <ChartsDetailedTab 
              data={data}
              operatorMetrics={operatorMetrics}
              rankings={rankings}
              selectedPeriod={null}
              isLoading={isLoading}
              pauseData={data}
            />
          )}
          
          {/* Aba Visualizar por Agente */}
          {currentView === 'agents' && data && data.length > 0 && (
            <AgentAnalysis 
              data={data}
              operatorMetrics={operatorMetrics}
              rankings={rankings}
            />
          )}
          
          {currentView === 'operators' && data && data.length > 0 && (
            <OperatorAnalysis 
              data={data}
              operatorMetrics={operatorMetrics}
              selectedOperator={selectedOperator}
            />
          )}
          
          {errors.length > 0 && (
            <div className="error-container">
              <h3>Erros encontrados:</h3>
              <details>
                <summary>Mostrar erros ({errors.length})</summary>
                <ul>
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 10 && <li>... e mais {errors.length - 10} erros</li>}
                </ul>
              </details>
            </div>
          )}
        </main>
      </div>
      
      {/* Dark List Manager */}
      {showDarkList && (
        <DarkListManager
          operators={[]}
          darkList={darkList}
          onDarkListChange={updateDarkList}
          isVisible={showDarkList}
          onToggle={() => setShowDarkList(!showDarkList)}
        />
      )}

      {/* Preferences Manager */}
      <PreferencesManager
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* Cargo Selection */}
      {showCargoSelection && userData?.email && (
        <CargoSelection
          userEmail={userData.email}
          onCargoSelected={handleCargoSelected}
        />
      )}
      
    </div>
  )
}

// Componente principal que envolve tudo com o CargoProvider
function App() {
  return (
    <CargoProvider>
      <AppContent />
    </CargoProvider>
  )
}

export default App
