// VERSION: v3.6.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const DashboardCard = ({ title, description, icon, color, onClick }) => {
  const getArrowGradient = (color) => {
    switch (color) {
      case 'primary':
        // ESSENCIAL - Gradiente Azul Médio → Azul Claro
        return 'linear-gradient(135deg, var(--blue-medium) 0%, var(--blue-medium) 60%, var(--blue-light) 100%)';
      case 'success':
        // RECICLAGEM - Gradiente Amarelo → Azul Médio
        return 'linear-gradient(135deg, var(--yellow) 0%, var(--yellow) 60%, var(--blue-medium) 100%)';
      case 'secondary':
        // OPCIONAL - Gradiente Azul Escuro → Azul Opaco
        return 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dark) 60%, var(--blue-opaque) 100%)';
      default:
        return 'linear-gradient(135deg, var(--blue-medium) 0%, var(--blue-medium) 60%, var(--blue-light) 100%)';
    }
  };

  return (
    <Card
      className="velohub-card"
      sx={{
        height: '220px', // Altura aumentada para melhor proporção
        width: '85%', // Redução de 15% na largura
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(22, 52, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: getArrowGradient(color),
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          borderColor: 'var(--blue-medium)',
          '&::before': {
            transform: 'scaleX(1)',
          },
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        textAlign: 'center', 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80px',
            color: 'var(--blue-opaque)',
          }}
        >
          {icon}
        </Box>
        
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            color: 'var(--blue-dark)',
            fontSize: '1.3rem',
            mb: 2,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            sx={{
              background: getArrowGradient(color),
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
