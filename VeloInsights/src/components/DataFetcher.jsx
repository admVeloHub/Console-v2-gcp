/**
 * 🚀 DataFetcher SURPREENDENTE - Interface moderna com efeitos visuais incríveis
 * Substitui o UploadArea no novo sistema
 */

import React, { useState, useEffect } from 'react'
import './DataFetcher.css'

const DataFetcher = ({ 
  isLoading, 
  isAuthenticated, 
  userData,
  onFetchData, 
  onSignIn, 
  onSignOut, 
  errors = [] 
}) => {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [dataFlow, setDataFlow] = useState([])

  // Criar efeito de fluxo de dados animado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const createDataFlow = () => {
        const flows = []
        for (let i = 0; i < 8; i++) {
          flows.push({
            id: i,
            delay: i * 0.5,
            duration: 3 + Math.random() * 2
          })
        }
        setDataFlow(flows)
      }
      createDataFlow()
    }
  }, [isAuthenticated, isLoading])

  // Animação de pulso para botões
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="data-fetcher-modern">
      {/* Fundo com efeitos visuais */}
      <div className="fetcher-background">
        <div className="background-grid" />
        <div className="background-glow" />
        
        {/* Fluxo de dados animado quando autenticado */}
        {isAuthenticated && dataFlow.map(flow => (
          <div
            key={flow.id}
            className="data-flow"
            style={{
              animationDelay: `${flow.delay}s`,
              animationDuration: `${flow.duration}s`
            }}
          />
        ))}
      </div>

      <div className="fetcher-container-modern">
        {/* Header com logo animado */}
        <div className="fetcher-header-modern">
          <div className="logo-container-modern">
            <div className="logo-circle-modern">
              <div className="logo-inner-modern">
                <span className="logo-icon">📊</span>
              </div>
              <div className="logo-rings">
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
              </div>
            </div>
          </div>
          
          <div className="title-container">
            <h1 className="fetcher-title-modern">
              <span className="title-main">VeloInsights</span>
              <span className="title-accent">Pro</span>
            </h1>
            <p className="fetcher-subtitle-modern">
              Dashboard de Análise de Atendimentos
            </p>
            <div className="title-decoration" />
          </div>
        </div>

        <div className="fetcher-content-modern">
          {!isAuthenticated ? (
            <div className="auth-section-modern">
              <div className="auth-card">
                <div className="auth-header">
                  <div className="auth-icon-container">
                    <span className="auth-icon">🔐</span>
                    <div className="icon-glow" />
                  </div>
                  <h3 className="auth-title">Autenticação Necessária</h3>
                  <p className="auth-description">
                    Para acessar os dados da planilha, você precisa fazer login com sua conta Google corporativa (@velotax.com.br).
                  </p>
                </div>
                
                <div className="benefits-grid">
                  <div className="benefit-card" onMouseEnter={() => setHoveredCard('secure')} onMouseLeave={() => setHoveredCard(null)}>
                    <div className="benefit-icon">🛡️</div>
                    <h4>Acesso Seguro</h4>
                    <p>Dados protegidos com OAuth2</p>
                  </div>
                  <div className="benefit-card" onMouseEnter={() => setHoveredCard('updated')} onMouseLeave={() => setHoveredCard(null)}>
                    <div className="benefit-icon">🔄</div>
                    <h4>Sempre Atualizado</h4>
                    <p>Dados em tempo real</p>
                  </div>
                  <div className="benefit-card" onMouseEnter={() => setHoveredCard('analytics')} onMouseLeave={() => setHoveredCard(null)}>
                    <div className="benefit-icon">📈</div>
                    <h4>Análises Avançadas</h4>
                    <p>Insights poderosos</p>
                  </div>
                </div>
                
                <button 
                  className={`auth-button-modern ${isLoading ? 'loading' : ''}`}
                  onClick={onSignIn}
                  disabled={isLoading}
                >
                  <div className="button-content">
                    <div className="button-icon">
                      {isLoading ? (
                        <div className="spinner-modern" />
                      ) : (
                        <span>🔍</span>
                      )}
                    </div>
                    <span className="button-text">
                      {isLoading ? 'Conectando...' : 'Conectar com Google'}
                    </span>
                  </div>
                  <div className="button-glow" />
                </button>
              </div>
            </div>
          ) : (
            <div className="data-section-modern">
              <div className="data-card">
                <div className="data-header">
                  <div className="data-icon-container">
                    <span className="data-icon">📋</span>
                    <div className="icon-pulse" />
                  </div>
                  <h3 className="data-title">Dados Conectados</h3>
                  <p className="data-description">
                    Conectado com sucesso! Clique no botão abaixo para buscar os dados mais recentes da planilha.
                  </p>
                </div>
                
                {/* Informações do usuário com design moderno */}
                {userData && (
                  <div className="user-card-modern">
                    <div className="user-avatar-modern">
                      {userData.foto ? (
                        <img src={userData.foto} alt={userData.nome} />
                      ) : (
                        <span className="user-initial-modern">{userData.nome?.charAt(0)}</span>
                      )}
                      <div className="avatar-status" />
                    </div>
                    <div className="user-info-modern">
                      <div className="user-name-modern">{userData.nome}</div>
                      <div className="user-email-modern">{userData.email}</div>
                    </div>
                  </div>
                )}
                
                <div className="status-container-modern">
                  <div className="status-item-modern success">
                    <div className="status-icon-modern">✅</div>
                    <span className="status-text-modern">Autenticação ativa</span>
                  </div>
                  <div className="status-item-modern info">
                    <div className="status-icon-modern">📊</div>
                    <span className="status-text-modern">Planilha: VeloInsights</span>
                  </div>
                  <div className="status-item-modern warning">
                    <div className="status-icon-modern">🔄</div>
                    <span className="status-text-modern">Atualização semanal</span>
                  </div>
                </div>

                <div className="actions-modern">
                  <button 
                    className={`fetch-button-modern primary ${isLoading ? 'loading' : ''} ${pulseAnimation ? 'pulse' : ''}`}
                    onClick={onFetchData}
                    disabled={isLoading}
                  >
                    <div className="button-content">
                      <div className="button-icon">
                        {isLoading ? (
                          <div className="spinner-modern" />
                        ) : (
                          <span>📥</span>
                        )}
                      </div>
                      <span className="button-text">
                        {isLoading ? 'Buscando dados...' : 'Buscar Dados Atualizados'}
                      </span>
                    </div>
                    <div className="button-glow" />
                  </button>

                  <button 
                    className="fetch-button-modern secondary"
                    onClick={onSignOut}
                    disabled={isLoading}
                  >
                    <div className="button-content">
                      <div className="button-icon">
                        <span>🚪</span>
                      </div>
                      <span className="button-text">Desconectar</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Exibir erros com design moderno */}
          {errors.length > 0 && (
            <div className="error-section-modern">
              <div className="error-card">
                <div className="error-header">
                  <span className="error-icon">⚠️</span>
                  <h4>Erros Detectados</h4>
                </div>
                <div className="error-list-modern">
                  {errors.slice(0, 3).map((error, index) => (
                    <div key={index} className="error-item-modern">
                      <span className="error-bullet">•</span>
                      <span className="error-text">{error}</span>
                    </div>
                  ))}
                  {errors.length > 3 && (
                    <div className="error-more">
                      ... e mais {errors.length - 3} erros
                    </div>
                  )}
                </div>
                
                {/* Instruções de configuração */}
                {errors.some(error => error.includes('Client ID') || error.includes('configurado')) && (
                  <div className="config-help-modern">
                    <h5>🔧 Como configurar o Google SSO:</h5>
                    <div className="config-steps-modern">
                      <div className="config-step">
                        <span className="step-number">1</span>
                        <span>Crie um arquivo <code>.env</code> na raiz do projeto</span>
                      </div>
                      <div className="config-step">
                        <span className="step-number">2</span>
                        <span>Adicione suas credenciais do Google Cloud Console</span>
                      </div>
                      <div className="config-code-modern">
                        <code>
                          VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui<br/>
                          VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
                        </code>
                      </div>
                      <div className="config-step">
                        <span className="step-number">3</span>
                        <span>Consulte o arquivo <code>GOOGLE_SSO_SETUP.md</code> para instruções detalhadas</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações adicionais com design moderno */}
          <div className="info-section-modern">
            <div className="info-card">
              <div className="info-header">
                <span className="info-icon">ℹ️</span>
                <h4>Informações Importantes</h4>
              </div>
              <div className="info-list-modern">
                <div className="info-item-modern">
                  <span className="info-bullet">📅</span>
                  <span>Dados atualizados semanalmente</span>
                </div>
                <div className="info-item-modern">
                  <span className="info-bullet">⚡</span>
                  <span>Cache local para performance</span>
                </div>
                <div className="info-item-modern">
                  <span className="info-bullet">🔒</span>
                  <span>Dados seguros com OAuth2</span>
                </div>
                <div className="info-item-modern">
                  <span className="info-bullet">🚪</span>
                  <span>Desconexão a qualquer momento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataFetcher
