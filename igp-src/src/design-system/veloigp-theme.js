// Sistema de Temas VeloIGP - Adaptado para React
export const veloigpTheme = {
  // Cores do tema claro
  light: {
    colors: {
      background: '#F3F7FC', /* Tom de branco oficial das guidelines */
      container: '#F3F7FC', /* Tom de branco oficial das guidelines */
      card: '#F3F7FC', /* Tom de branco oficial das guidelines */
      textPrimary: '#071a2f',
      textSecondary: '#5a677e',
      accent: '#007bff',
      border: 'rgba(0, 0, 0, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px'
    },
    typography: {
      fontFamily: {
        primary: "'Poppins', sans-serif",
        secondary: "'Anton', sans-serif"
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem', // Anton para textos menores
        md: '1rem', // Poppins para texto do corpo
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem', // Poppins para subtítulos
        xxxl: '2rem' // Poppins para títulos principais
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    }
  },
  
  // Cores do tema escuro
  dark: {
    colors: {
      background: '#0a1929',
      container: '#112240',
      card: '#1d3557',
      textPrimary: '#e6f1ff',
      textSecondary: '#a8b2d1',
      accent: '#4dabf7',
      border: 'rgba(77, 171, 247, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.4)',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      info: '#2196f3'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px'
    },
    typography: {
      fontFamily: {
        primary: "'Poppins', sans-serif",
        secondary: "'Anton', sans-serif"
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem', // Anton para textos menores
        md: '1rem', // Poppins para texto do corpo
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem', // Poppins para subtítulos
        xxxl: '2rem' // Poppins para títulos principais
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    }
  }
};

// Componentes de estilo baseados no VeloIGP
export const veloigpComponents = {
  // Botões
  button: {
    base: {
      padding: '12px 24px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600, // Peso oficial para botões
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1rem'
    },
    primary: {
      backgroundColor: 'var(--cor-accent)',
      color: 'white',
      '&:hover': {
        opacity: 0.9,
        transform: 'translateY(-2px)'
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--cor-accent)',
      border: '1px solid var(--cor-accent)',
      '&:hover': {
        backgroundColor: 'var(--cor-accent)',
        color: 'white'
      }
    }
  },
  
  // Cards
  card: {
    base: {
      backgroundColor: 'var(--cor-card)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px var(--cor-sombra)',
      border: '1px solid var(--cor-borda)',
      transition: 'all 0.3s ease'
    },
    hover: {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px var(--cor-sombra)'
      }
    }
  },
  
  // Seções
  section: {
    margin: '40px 0',
    padding: '20px'
  },
  
  // Grid
  grid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  }
};

// CSS Variables para integração com CSS
export const generateCSSVariables = (theme) => {
  return `
    :root {
      --cor-fundo: ${theme.colors.background};
      --cor-container: ${theme.colors.container};
      --cor-card: ${theme.colors.card};
      --cor-texto-principal: ${theme.colors.textPrimary};
      --cor-texto-secundario: ${theme.colors.textSecondary};
      --cor-accent: ${theme.colors.accent};
      --cor-borda: ${theme.colors.border};
      --cor-sombra: ${theme.colors.shadow};
      --borda-raio: ${theme.borderRadius.md};
      --espaco: ${theme.spacing.lg};
    }
  `;
};

// Hook para gerenciar tema (será implementado no componente)
export const useVeloigpTheme = () => {
  // Este hook será implementado no VeloigpLayout
  return {
    theme: 'light',
    currentTheme: veloigpTheme.light,
    toggleTheme: () => {},
    isDark: false
  };
};
