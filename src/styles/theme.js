// VERSION: v3.2.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { createTheme } from '@mui/material/styles';

// Verificar se tema escuro está ativo
const isDarkMode = typeof window !== 'undefined' && 
  (document.documentElement.classList.contains('dark') || 
   localStorage.getItem('velohub-theme') === 'dark');

export const velohubTheme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: '#1634FF', // --blue-medium
      dark: '#000058', // --blue-dark
      light: '#1694FF', // --blue-light
    },
    secondary: {
      main: '#006AB9', // --blue-opaque
    },
    success: {
      main: '#15A237', // --green
    },
    warning: {
      main: '#FCC200', // --yellow
    },
    background: {
      default: isDarkMode ? '#272A30' : '#f0f4f8', // --cor-fundo-escuro : --cor-fundo
      paper: isDarkMode ? '#323a42' : '#F3F7FC', // --cor-container-escuro : --cor-container
    },
    text: {
      primary: isDarkMode ? '#F3F7FC' : '#272A30', // --texto-principal-escuro : --gray
      secondary: isDarkMode ? '#B0BEC5' : '#000058', // --texto-secundario-escuro : --blue-dark
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
          borderRadius: '8px',
          textTransform: 'none',
        },
        contained: {
          '&.MuiButton-contained': {
            backgroundColor: '#1634FF', // blue-medium padrão
            color: '#F3F7FC',
            '&:hover': {
              backgroundColor: '#000058', // blue-dark
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        select: {
          padding: '8px 14px',
          height: 'auto',
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
  },
});
