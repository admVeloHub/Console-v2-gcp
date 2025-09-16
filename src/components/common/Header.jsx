// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brightness4, Brightness7, Dashboard } from '@mui/icons-material';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('velohub-theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('velohub-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('velohub-theme', 'light');
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Console de Conteúdo';
      case '/igp':
        return 'Dashboard IGP';
      case '/artigos':
        return 'Gerenciar Artigos';
      case '/velonews':
        return 'Velonews';
      case '/bot-perguntas':
        return 'Bot Perguntas';
      default:
        return 'Console de Conteúdo';
    }
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: isDarkMode ? 'var(--cor-header-escuro)' : 'var(--cor-container)',
        color: isDarkMode ? 'var(--texto-principal-escuro)' : 'var(--gray)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderBottom: `1px solid ${isDarkMode ? 'var(--divisoria-escura)' : 'var(--borda-escura)'}`
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="dashboard"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <Dashboard />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontFamily: 'Poppins',
            fontWeight: 600
          }}
        >
          {getPageTitle()}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label="toggle theme"
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
