import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log do erro para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--veloigp-background-primary)',
          color: 'var(--veloigp-text-primary)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⚠️</div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: 'var(--veloigp-danger)',
            marginBottom: '1rem' 
          }}>
            Ops! Algo deu errado
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--veloigp-text-secondary)',
            marginBottom: '2rem',
            maxWidth: '600px' 
          }}>
            Ocorreu um erro inesperado no sistema. Nossa equipe foi notificada e está trabalhando para resolver o problema.
          </p>
          <button 
            onClick={this.handleRetry}
            style={{
              background: 'var(--veloigp-primary)',
              color: 'var(--veloigp-text-inverse)',
              border: 'none',
              borderRadius: 'var(--veloigp-border-radius-md)',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;