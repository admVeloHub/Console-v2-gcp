import React, { useState } from 'react'
import { useUserPreferences } from '../hooks/useUserPreferences'
import './PreferencesManager.css'

const PreferencesManager = ({ isOpen, onClose }) => {
  const {
    preferences,
    isLoaded,
    updateOperatorsOrder,
    updateMetricsOrder,
    updateDragDropMode,
    updateTheme,
    updateLayout,
    updateFilters,
    resetPreferences,
    exportPreferences,
    importPreferences,
    getPreferencesStats
  } = useUserPreferences()

  const [activeTab, setActiveTab] = useState('general')
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  if (!isOpen || !isLoaded) return null

  const stats = getPreferencesStats()

  const handleImportPreferences = async () => {
    if (!importFile) return

    setIsImporting(true)
    try {
      await importPreferences(importFile)
      alert('✅ Preferências importadas com sucesso!')
      setImportFile(null)
    } catch (error) {
      alert(`❌ Erro ao importar preferências: ${error.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleResetPreferences = () => {
    if (window.confirm('⚠️ Tem certeza que deseja resetar todas as preferências? Esta ação não pode ser desfeita.')) {
      resetPreferences()
      alert('🔄 Preferências resetadas com sucesso!')
    }
  }

  const handleExportPreferences = () => {
    if (exportPreferences()) {
      alert('📁 Preferências exportadas com sucesso!')
    } else {
      alert('❌ Erro ao exportar preferências')
    }
  }

  return (
    <div className="preferences-overlay">
      <div className="preferences-modal">
        <div className="preferences-header">
          <h2>⚙️ Gerenciar Preferências</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="preferences-content">
          <div className="preferences-tabs">
            <button 
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              📊 Geral
            </button>
            <button 
              className={`tab-button ${activeTab === 'dragdrop' ? 'active' : ''}`}
              onClick={() => setActiveTab('dragdrop')}
            >
              🔄 Drag & Drop
            </button>
            <button 
              className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
              onClick={() => setActiveTab('layout')}
            >
              🎨 Layout
            </button>
            <button 
              className={`tab-button ${activeTab === 'importexport' ? 'active' : ''}`}
              onClick={() => setActiveTab('importexport')}
            >
              📁 Importar/Exportar
            </button>
          </div>

          <div className="preferences-body">
            {activeTab === 'general' && (
              <div className="preferences-section">
                <h3>📊 Configurações Gerais</h3>
                
                <div className="preference-group">
                  <label>Tema:</label>
                  <select 
                    value={preferences.theme}
                    onChange={(e) => updateTheme(e.target.value)}
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div className="preference-group">
                  <label>Visualização Padrão:</label>
                  <select 
                    value={preferences.layout.defaultView}
                    onChange={(e) => updateLayout({ defaultView: e.target.value })}
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="charts">Gráficos</option>
                    <option value="agents">Agentes</option>
                  </select>
                </div>

                <div className="preference-group">
                  <label>Período Padrão:</label>
                  <select 
                    value={preferences.filters.defaultPeriod}
                    onChange={(e) => updateFilters({ defaultPeriod: e.target.value })}
                  >
                    <option value="all">Todo o Período</option>
                    <option value="yesterday">Ontem</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="year">Este Ano</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'dragdrop' && (
              <div className="preferences-section">
                <h3>🔄 Configurações de Drag & Drop</h3>
                
                <div className="preference-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={preferences.dragDropMode.operators}
                      onChange={(e) => updateDragDropMode('operators', e.target.checked)}
                    />
                    Modo Drag & Drop para Operadores
                  </label>
                </div>

                <div className="preference-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={preferences.dragDropMode.metrics}
                      onChange={(e) => updateDragDropMode('metrics', e.target.checked)}
                    />
                    Modo Drag & Drop para Métricas
                  </label>
                </div>

                <div className="preference-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={preferences.dragDropMode.upload}
                      onChange={(e) => updateDragDropMode('upload', e.target.checked)}
                    />
                    Upload Múltiplo de Arquivos
                  </label>
                </div>

                <div className="preference-info">
                  <p>💡 As configurações de drag & drop permitem reorganizar elementos arrastando e soltando.</p>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="preferences-section">
                <h3>🎨 Configurações de Layout</h3>
                
                <div className="preference-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={preferences.layout.sidebarCollapsed}
                      onChange={(e) => updateLayout({ sidebarCollapsed: e.target.checked })}
                    />
                    Sidebar Recolhida por Padrão
                  </label>
                </div>

                <div className="preference-info">
                  <p>💡 As configurações de layout afetam como os elementos são exibidos na interface.</p>
                </div>
              </div>
            )}

            {activeTab === 'importexport' && (
              <div className="preferences-section">
                <h3>📁 Importar/Exportar Preferências</h3>
                
                <div className="preference-group">
                  <h4>📊 Estatísticas das Preferências</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total de Itens:</span>
                      <span className="stat-value">{stats.totalItems}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Operadores:</span>
                      <span className="stat-value">{stats.operatorsCount}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Métricas:</span>
                      <span className="stat-value">{stats.metricsCount}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Drag & Drop:</span>
                      <span className="stat-value">{stats.dragDropEnabled}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tamanho:</span>
                      <span className="stat-value">{stats.storageSize} bytes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Última Atualização:</span>
                      <span className="stat-value">
                        {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="preference-group">
                  <h4>📤 Exportar Preferências</h4>
                  <button 
                    className="export-button"
                    onClick={handleExportPreferences}
                  >
                    📁 Exportar para Arquivo
                  </button>
                </div>

                <div className="preference-group">
                  <h4>📥 Importar Preferências</h4>
                  <div className="import-section">
                    <input 
                      type="file"
                      accept=".json"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="file-input"
                    />
                    <button 
                      className="import-button"
                      onClick={handleImportPreferences}
                      disabled={!importFile || isImporting}
                    >
                      {isImporting ? '⏳ Importando...' : '📥 Importar'}
                    </button>
                  </div>
                </div>

                <div className="preference-group">
                  <h4>🔄 Resetar Preferências</h4>
                  <button 
                    className="reset-button"
                    onClick={handleResetPreferences}
                  >
                    🗑️ Resetar Todas as Preferências
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="preferences-footer">
          <button className="close-modal-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreferencesManager
