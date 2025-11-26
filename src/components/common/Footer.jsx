// VERSION: v4.0.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { healthAPI } from '../../services/api';

const Footer = () => {
  const [apiStatus, setApiStatus] = useState({
    isOnline: false,
    version: '5.0.0',
    loading: true
  });

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus(prev => ({ ...prev, loading: true }));
        const response = await healthAPI.check();
        
        setApiStatus({
          isOnline: response.status === 'OK',
          version: '5.0.0', // Sempre usar versão fixa do frontend
          loading: false
        });
      } catch (error) {
        // Silenciar erro de conexão - API pode não estar rodando em desenvolvimento
        setApiStatus({
          isOnline: false,
          version: '5.0.0',
          loading: false
        });
      }
    };

    // Verificar status inicial
    checkApiStatus();

    // Verificar status a cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (apiStatus.loading) return '#FFA500'; // Laranja para loading
    return apiStatus.isOnline ? '#15A237' : '#DC3545'; // Verde para online, vermelho para offline
  };

  const getStatusText = () => {
    if (apiStatus.loading) return 'Verificando...';
    return apiStatus.isOnline ? 'Online' : 'Offline';
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'var(--cor-container)',
        borderTop: '1px solid var(--borda-escura)',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ flex: 1 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 500,
            color: 'var(--gray)'
          }}
        >
          Sistema Console
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Poppins',
              color: 'var(--gray)'
            }}
          >
            API Backend:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                transition: 'background-color 0.3s ease',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                },
                animation: apiStatus.loading ? 'pulse 1.5s infinite' : 'none'
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Poppins',
                fontWeight: 500,
                color: getStatusColor(),
                fontSize: '0.75rem'
              }}
            >
              {getStatusText()}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Poppins',
            color: 'var(--gray)',
            fontSize: '0.75rem'
          }}
        >
          v{apiStatus.version}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
