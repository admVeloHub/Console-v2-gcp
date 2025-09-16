// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import { createTheme } from '@mui/material/styles';

export const velohubTheme = createTheme({
  palette: {
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
      default: '#f0f4f8', // --cor-fundo
      paper: '#F3F7FC', // --cor-container
    },
    text: {
      primary: '#272A30', // --gray
      secondary: '#000058', // --blue-dark
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
  },
});
