// Sistema global de gerenciamento de warnings para evitar spam
class WarningManager {
  constructor() {
    this.warningsShown = new Map() // Mudança: usar Map ao invés de Set
    this.sessionStart = Date.now()
  }

  // Verificar se um warning já foi mostrado nesta sessão
  hasShownWarning(key) {
    return this.warningsShown.has(key)
  }

  // Marcar um warning como mostrado
  markWarningShown(key) {
    this.warningsShown.set(key, 1)
  }

  // Mostrar warning apenas uma vez por sessão (modo silencioso)
  showWarningOnce(key, message, data = null) {
    if (!this.hasShownWarning(key)) {
      this.markWarningShown(key)
      // Modo silencioso - não mostrar warnings no console
    }
  }

  // Mostrar warning com limite de repetições (modo silencioso)
  showWarningWithLimit(key, message, data = null, limit = 3) {
    const count = this.getWarningCount(key)
    if (count < limit) {
      this.incrementWarningCount(key)
      // Modo silencioso - não mostrar warnings no console
    } else if (count === limit) {
      this.incrementWarningCount(key)
      // Modo silencioso - não mostrar warnings no console
    }
  }

  // Contar quantas vezes um warning foi mostrado
  getWarningCount(key) {
    return this.warningsShown.get(key) || 0
  }

  // Incrementar contador de warning
  incrementWarningCount(key) {
    const current = this.getWarningCount(key)
    this.warningsShown.set(key, current + 1)
  }

  // Reset do sistema (útil para testes)
  reset() {
    this.warningsShown.clear()
    this.sessionStart = Date.now()
  }

  // Obter estatísticas dos warnings
  getStats() {
    return {
      totalWarnings: this.warningsShown.size,
      sessionDuration: Date.now() - this.sessionStart,
      warnings: Array.from(this.warningsShown.entries())
    }
  }
}

// Instância global do gerenciador de warnings
const warningManager = new WarningManager()

// Funções de conveniência para uso em componentes
export const showWarningOnce = (key, message, data = null) => {
  warningManager.showWarningOnce(key, message, data)
}

export const showWarningWithLimit = (key, message, data = null, limit = 3) => {
  warningManager.showWarningWithLimit(key, message, data, limit)
}

export const hasShownWarning = (key) => {
  return warningManager.hasShownWarning(key)
}

export const getWarningStats = () => {
  return warningManager.getStats()
}

export const resetWarnings = () => {
  warningManager.reset()
}

export default warningManager
