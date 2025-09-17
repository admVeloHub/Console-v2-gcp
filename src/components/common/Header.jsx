// VERSION: v3.1.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
        <Box
          component="img"
          src={`${process.env.PUBLIC_URL}/console.png`}
          alt="VeloHub Logo"
          onClick={() => navigate('/')}
          sx={{
            height: 40,
            width: 'auto',
            cursor: 'pointer',
            mr: 2,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 0.8
            }
          }}
        />
        
        <Box sx={{ flexGrow: 1 }} />

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
