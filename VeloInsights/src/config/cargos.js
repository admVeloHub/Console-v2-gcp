// Sistema de Cargos e Hierarquia - Nova Estrutura
export const CARGO_HIERARCHY = {
  ADMINISTRADOR: 4,
  GESTAO: 3,
  MONITOR: 2,
  EDITOR: 1
}

// Hierarquia de acesso - quais cargos cada usuário pode assumir
export const CARGO_ACCESS_HIERARCHY = {
  ADMINISTRADOR: ['ADMINISTRADOR', 'GESTAO', 'MONITOR', 'EDITOR'],
  GESTAO: ['GESTAO', 'MONITOR', 'EDITOR'],
  MONITOR: ['MONITOR', 'EDITOR'],
  EDITOR: ['EDITOR']
}

export const CARGO_PERMISSIONS = {
  ADMINISTRADOR: {
    level: 4,
    name: 'Administrador',
    icon: '👑',
    color: '#8B5CF6',
    permissions: {
      canViewAllUsers: true,
      canViewManagers: true,
      canViewAnalysts: true,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: true,
      canViewAlerts: true,
      canViewMeasures: true
    }
  },
  GESTAO: {
    level: 3,
    name: 'Gestão',
    icon: '👔',
    color: '#3B82F6',
    permissions: {
      canViewAllUsers: false,
      canViewManagers: false,
      canViewAnalysts: true,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: true,
      canViewAlerts: true,
      canViewMeasures: true
    }
  },
  MONITOR: {
    level: 2,
    name: 'Monitor',
    icon: '📊',
    color: '#10B981',
    permissions: {
      canViewAllUsers: false,
      canViewManagers: false,
      canViewAnalysts: false,
      canViewOperators: true,
      canViewGeneralMetrics: true,
      canViewSystemSettings: false,
      canViewAlerts: true,
      canViewMeasures: false
    }
  },
  EDITOR: {
    level: 1,
    name: 'Editor',
    icon: '👤',
    color: '#6B7280',
    permissions: {
      canViewAllUsers: false,
      canViewManagers: false,
      canViewAnalysts: false,
      canViewOperators: false,
      canViewGeneralMetrics: false,
      canViewSystemSettings: false,
      canViewAlerts: false,
      canViewMeasures: false,
      canViewOwnData: true,
      canViewOwnPosition: true
    }
  }
}

// Função para verificar se um cargo tem permissão
export const hasPermission = (userCargo, permission) => {
  const cargoConfig = CARGO_PERMISSIONS[userCargo?.toUpperCase()]
  if (!cargoConfig) return false
  
  return cargoConfig.permissions[permission] || false
}

// Função para verificar nível hierárquico
export const hasHigherLevel = (userCargo, targetCargo) => {
  const userLevel = CARGO_PERMISSIONS[userCargo?.toUpperCase()]?.level || 0
  const targetLevel = CARGO_PERMISSIONS[targetCargo?.toUpperCase()]?.level || 0
  
  return userLevel >= targetLevel
}

// Função para obter configuração do cargo
export const getCargoConfig = (cargo) => {
  const result = CARGO_PERMISSIONS[cargo?.toUpperCase()] || CARGO_PERMISSIONS.EDITOR
  
  // Debug apenas se cargo não encontrado
  if (!CARGO_PERMISSIONS[cargo?.toUpperCase()]) {
    console.warn('⚠️ Cargo não encontrado:', cargo, 'usando EDITOR como padrão')
  }
  
  return result
}

// Função para verificar se pode ver dados de outro usuário
export const canViewUserData = (viewerCargo, targetCargo, viewerEmail, targetEmail) => {
  const viewerConfig = getCargoConfig(viewerCargo)
  
  // Sempre pode ver seus próprios dados
  if (viewerEmail === targetEmail) return true
  
  // Administrador pode ver todos
  if (viewerConfig.level >= 4) return true
  
  // Gestão pode ver Monitor e Editor
  if (viewerConfig.level >= 3) {
    const targetConfig = getCargoConfig(targetCargo)
    return targetConfig.level <= 2 // Monitor ou Editor
  }
  
  // Monitor pode ver apenas Editor
  if (viewerConfig.level >= 2) {
    const targetConfig = getCargoConfig(targetCargo)
    return targetConfig.level <= 1 // Apenas Editor
  }
  
  // Editor não pode ver dados de ninguém além de si mesmo
  return false
}

// Função para verificar se um usuário pode assumir um cargo específico
export const canAssumeCargo = (userCargo, targetCargo) => {
  const userCargoUpper = userCargo?.toUpperCase()
  const targetCargoUpper = targetCargo?.toUpperCase()
  
  const allowedCargos = CARGO_ACCESS_HIERARCHY[userCargoUpper] || []
  return allowedCargos.includes(targetCargoUpper)
}

// Função para obter lista de cargos que um usuário pode assumir
export const getAvailableCargos = (userCargo) => {
  const userCargoUpper = userCargo?.toUpperCase()
  return CARGO_ACCESS_HIERARCHY[userCargoUpper] || ['EDITOR']
}

// Função para obter configurações dos cargos disponíveis para um usuário
export const getAvailableCargoConfigs = (userCargo) => {
  const userCargoUpper = userCargo?.toUpperCase()
  
  const availableCargos = CARGO_ACCESS_HIERARCHY[userCargoUpper] || ['EDITOR']
  
  const configs = availableCargos.map(cargo => {
    const config = getCargoConfig(cargo)
    return {
      cargo,
      ...config
    }
  })
  
  return configs
}
