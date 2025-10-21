import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary capturou um erro:', error)
    console.error('Error Info:', errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card">
            <h2>🚨 Erro na Aplicação</h2>
            <p>Algo deu errado. Por favor, recarregue a página.</p>
            
            <details style={{ marginTop: '20px' }}>
              <summary>Detalhes do erro (para desenvolvedores)</summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo?.componentStack || 'Nenhuma informação adicional disponível'}
              </pre>
            </details>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#1634FF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
