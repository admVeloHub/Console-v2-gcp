import React from 'react'
import { getUserByEmail } from '../config/usuarios'
import { getAvailableCargoConfigs } from '../config/cargos'
import './CargoSelection.css'

const CargoSelection = ({ userEmail, onCargoSelected }) => {
  const user = getUserByEmail(userEmail)
  
  if (!user) {
    return (
      <div className="cargo-selection-error">
        <h2>❌ Usuário não encontrado</h2>
        <p>E-mail: {userEmail}</p>
      </div>
    )
  }

  // Obter cargos disponíveis diretamente usando a hierarquia
  const availableCargos = getAvailableCargoConfigs(user.cargo)

  const handleCargoClick = (cargo) => {
    if (onCargoSelected) {
      onCargoSelected(cargo)
    }
  }

  return (
    <div className="cargo-selection-overlay">
      <div className="cargo-selection-modal">
        <div className="cargo-selection-header">
          <h2>🎯 Selecione seu Perfil</h2>
          <p>Olá, <strong>{user.nome}</strong>!</p>
          <p>Escolha como deseja acessar o sistema:</p>
        </div>

        <div className="cargo-selection-grid">
          {availableCargos.map((cargoConfig) => (
            <div
              key={cargoConfig.cargo}
              className="cargo-card"
              onClick={() => handleCargoClick(cargoConfig.cargo)}
              style={{ '--cargo-color': cargoConfig.color }}
            >
              <div className="cargo-icon">
                {cargoConfig.icon}
              </div>
              <div className="cargo-info">
                <h3>{cargoConfig.name}</h3>
                <div className="cargo-permissions">
                  {cargoConfig.cargo === 'OPERADOR' && (
                    <ul>
                      <li>✅ Seus dados pessoais</li>
                      <li>✅ Posição no ranking geral</li>
                      <li>❌ Dados de outros usuários</li>
                    </ul>
                  )}
                  {cargoConfig.cargo === 'ANALISTA' && (
                    <ul>
                      <li>✅ Dados de operadores</li>
                      <li>✅ Métricas gerais</li>
                      <li>✅ Avisos do sistema</li>
                      <li>❌ Dados de gestores</li>
                    </ul>
                  )}
                  {cargoConfig.cargo === 'GESTOR' && (
                    <ul>
                      <li>✅ Dados de operadores</li>
                      <li>✅ Informações de analistas</li>
                      <li>✅ Métricas gerais</li>
                      <li>✅ Configurações do sistema</li>
                    </ul>
                  )}
                  {(cargoConfig.cargo === 'DIRETOR' || cargoConfig.cargo === 'SUPERADMIN') && (
                    <ul>
                      <li>✅ Acesso total ao sistema</li>
                      <li>✅ Todos os dados e usuários</li>
                      <li>✅ Configurações avançadas</li>
                      <li>✅ Relatórios completos</li>
                    </ul>
                  )}
                </div>
              </div>
              <div className="cargo-action">
                <button className="select-cargo-btn">
                  Selecionar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cargo-selection-footer">
          <p>💡 Esta escolha será válida por 10 minutos offline</p>
          <p>🔄 Logout automático ao fechar/recarregar a página</p>
        </div>
      </div>
    </div>
  )
}

export default CargoSelection
