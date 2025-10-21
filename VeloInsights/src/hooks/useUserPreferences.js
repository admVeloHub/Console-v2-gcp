import { useState, useEffect } from 'react'

const STORAGE_KEY = 'veloinsights_preferences'

const defaultPreferences = {
  // Ordem dos operadores
  operatorsOrder: [],
  
  // Ordem das métricas
  metricsOrder: [],
  
  // Modo drag & drop ativo
  dragDropMode: {
    operators: false,
    metrics: false,
    upload: false
  },
  
  // Configurações de tema
  theme: 'light',
  
  // Configurações de layout
  layout: {
    sidebarCollapsed: false,
    defaultView: 'dashboard'
  },
  
  // Configurações de filtros
  filters: {
    defaultPeriod: 'all',
    defaultOperator: 'all'
  },
  
  // Timestamp da última atualização
  lastUpdated: null
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar preferências do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsedPreferences = JSON.parse(saved)
        setPreferences({
          ...defaultPreferences,
          ...parsedPreferences,
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Salvar preferências no localStorage
  const savePreferences = (newPreferences) => {
    try {
      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
        lastUpdated: new Date().toISOString()
      }
      
      setPreferences(updatedPreferences)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPreferences))
      
      // console.log('✅ Preferências salvas:', updatedPreferences)
      return true
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      return false
    }
  }

  // Atualizar ordem dos operadores
  const updateOperatorsOrder = (operatorsOrder) => {
    return savePreferences({ operatorsOrder })
  }

  // Atualizar ordem das métricas
  const updateMetricsOrder = (metricsOrder) => {
    return savePreferences({ metricsOrder })
  }

  // Atualizar modo drag & drop
  const updateDragDropMode = (component, enabled) => {
    const newDragDropMode = {
      ...preferences.dragDropMode,
      [component]: enabled
    }
    return savePreferences({ dragDropMode: newDragDropMode })
  }

  // Atualizar tema
  const updateTheme = (theme) => {
    return savePreferences({ theme })
  }

  // Atualizar configurações de layout
  const updateLayout = (layout) => {
    return savePreferences({ layout: { ...preferences.layout, ...layout } })
  }

  // Atualizar configurações de filtros
  const updateFilters = (filters) => {
    return savePreferences({ filters: { ...preferences.filters, ...filters } })
  }

  // Resetar todas as preferências
  const resetPreferences = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setPreferences(defaultPreferences)
      // console.log('🔄 Preferências resetadas')
      return true
    } catch (error) {
      console.error('Erro ao resetar preferências:', error)
      return false
    }
  }

  // Exportar preferências
  const exportPreferences = () => {
    try {
      const dataStr = JSON.stringify(preferences, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `veloinsights-preferences-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Erro ao exportar preferências:', error)
      return false
    }
  }

  // Importar preferências
  const importPreferences = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const importedPreferences = JSON.parse(e.target.result)
          
          // Validar estrutura básica
          if (typeof importedPreferences === 'object' && importedPreferences !== null) {
            setPreferences({
              ...defaultPreferences,
              ...importedPreferences,
              lastUpdated: new Date().toISOString()
            })
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              ...defaultPreferences,
              ...importedPreferences,
              lastUpdated: new Date().toISOString()
            }))
            
            // console.log('✅ Preferências importadas:', importedPreferences)
            resolve(true)
          } else {
            reject(new Error('Formato de arquivo inválido'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file)
    })
  }

  // Obter estatísticas das preferências
  const getPreferencesStats = () => {
    return {
      totalItems: Object.keys(preferences).length,
      lastUpdated: preferences.lastUpdated,
      operatorsCount: preferences.operatorsOrder.length,
      metricsCount: preferences.metricsOrder.length,
      dragDropEnabled: Object.values(preferences.dragDropMode).filter(Boolean).length,
      storageSize: JSON.stringify(preferences).length
    }
  }

  return {
    preferences,
    isLoaded,
    savePreferences,
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
  }
}

export default useUserPreferences
