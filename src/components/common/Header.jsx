// VERSION: v3.7.2 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Menu, MenuItem, Avatar, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brightness4, Brightness7, Dashboard, AccountCircle, Logout, ArrowForward } from '@mui/icons-material';
import consoleLogo from '../../assets/console.png';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Carregar tema salvo - Sistema unificado
    const savedTheme = localStorage.getItem('velohub-theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    
    // Aplicar tema no documentElement
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Sincronizar com sistema do IGP (se existir)
    if (localStorage.getItem('veloinsights-theme')) {
      localStorage.setItem('veloinsights-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Sistema unificado de tema
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('velohub-theme', 'dark');
      // Sincronizar com sistema do IGP
      localStorage.setItem('veloinsights-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('velohub-theme', 'light');
      // Sincronizar com sistema do IGP
      localStorage.setItem('veloinsights-theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: isDarkMode ? 'var(--cor-header-escuro)' : 'var(--cor-container)',
        color: isDarkMode ? 'var(--texto-principal-escuro)' : 'var(--gray)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderBottom: isDarkMode ? '1px solid var(--divisoria-escura)' : '1px solid rgba(0, 0, 0, 0.12)'
      }}
    >
      <Toolbar>
        <Box
          component="img"
          src={consoleLogo}
          alt="VeloHub Logo"
          onClick={() => navigate('/')}
          sx={{
            height: 44,
            width: 'auto',
            cursor: 'pointer',
            mr: 2,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 0.8
            }
          }}
        />
        
        <Box sx={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography 
            variant="h5" 
            component="h1"
            sx={{ 
              fontFamily: 'Poppins',
              fontWeight: 700,
              color: isDarkMode ? 'var(--texto-principal-escuro)' : 'var(--blue-dark)',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            Console de Gestão Velohub
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Sistema de Usuário Logado - LAYOUT_GUIDELINES */}
        {user && (
          <Box 
            id="user-info"
            className="user-info"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              position: 'relative',
              zIndex: 10,
              transition: 'all 0.3s ease',
              mr: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                border: '1px solid #d0d0d0'
              }
            }}
          >
            {/* Avatar do Usuário */}
            <Box
              component="img"
              id="user-avatar"
              className="user-avatar"
              src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user._userId || user.nome || user.email)}&background=1634FF&color=fff&size=32&bold=true`}
              alt="Avatar"
              sx={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />

            {/* Nome do Usuário */}
            <Typography
              id="user-name"
              className="user-name"
              sx={{
                color: 'var(--cor-texto)',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: 'Poppins',
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user._userId || user.nome || user.email}
            </Typography>

            {/* Botão de Logout */}
            <Box
              component="button"
              id="logout-btn"
              className="logout-btn"
              title="Logout"
              onClick={handleLogout}
              sx={{
                background: 'none',
                border: 'none',
                color: 'var(--blue-dark)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  color: 'var(--blue-medium)',
                  backgroundColor: 'rgba(22, 52, 255, 0.1)'
                }
              }}
            >
              <ArrowForward sx={{ fontSize: '1.1rem', color: '#1634FF' }} />
            </Box>
          </Box>
        )}

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
