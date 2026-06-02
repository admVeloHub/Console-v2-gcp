// VERSION: v3.7.14 | DATE: 2026-04-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.7.14 - Tema só velohub-theme (removido espelhamento veloinsights-theme)
// CHANGELOG: v3.7.13 - Comentários de tema: removida referência ao IGP; espelhamento veloinsights-theme (legado)
// CHANGELOG: v3.7.12 - Logo altura metade (43px via CSS var); Toolbar minHeight 56/64 (padrão MUI)
// CHANGELOG: v3.7.11 - Logo: ml 50px (var); altura +50% (86px); Toolbar minHeight 72/90 para o logo
// CHANGELOG: v3.7.10 - Logo: sem padding; Toolbar disableGutters + pl:0; wrapper/img p:0
// CHANGELOG: v3.7.9 - Logo: <img> nativo + id velohub-header-logo; altura em globals.css (--velohub-header-logo-height)
// CHANGELOG: v3.7.8 - Ícone do header: altura +30% (44→57px)
// CHANGELOG: v3.7.7 - Ícone do header: public/console.png (CRA, PUBLIC_URL)
// CHANGELOG: v3.7.6 - Título central: "Console Velohub"; cor azul médio (var(--blue-medium))
// CHANGELOG: v3.7.3 - Título central: Console Velohub: Gestão de dados e conteúdos
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Menu, MenuItem, Avatar, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brightness4, Brightness7, Dashboard, AccountCircle, Logout, ArrowForward } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const HEADER_LOGO = `${process.env.PUBLIC_URL || ''}/console.png`;

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
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Sistema unificado de tema
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('velohub-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('velohub-theme', 'light');
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
      <Toolbar
        disableGutters
        sx={{
          pl: 0,
          pr: { xs: 2, sm: 3 },
          minHeight: { xs: 56, sm: 64 },
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <Box
          aria-label="Página inicial"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/');
            }
          }}
          sx={{
            p: 0,
            m: 0,
            ml: 'var(--velohub-header-logo-offset-x, 50px)',
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: 0,
            cursor: 'pointer',
            mr: 2,
            transition: 'opacity 0.3s ease',
            '&:hover': { opacity: 0.8 },
            '&:focus-visible': { outline: '2px solid var(--blue-medium)', outlineOffset: 2 }
          }}
        >
          <img
            id="velohub-header-logo"
            src={HEADER_LOGO}
            alt="VeloHub Logo"
            decoding="async"
            draggable={false}
          />
        </Box>
        
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
              color: 'var(--blue-medium)',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            Console Velohub
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
              backgroundColor: 'var(--cor-card)',
              borderRadius: '6px',
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
