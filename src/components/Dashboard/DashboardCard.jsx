// VERSION: v3.13.0 | DATE: 2026-04-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.13.0 - Ícone+título reposicionados (menos centro “solto”: padding assimétrico onde eram as setas)
// CHANGELOG: v3.12.0 - Contorno 1px por fileira: azul médio | amarelo | azul escuro; sem class velohub-card (evita sobrescrever borda no globals)
// CHANGELOG: v3.11.0 - Home: cards sem sombra em repouso; hover mantém translate, escala, borda e sombra
// CHANGELOG: v3.10.0 - Suporte a iconSrc (PNG em public/icons); icon React opcional (fallback)
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const DashboardCard = ({ title, description, icon, iconSrc, color, onClick }) => {
  /** Cor do contorno 1px por linha da home (primary / success / secondary). */
  const getOutlineBorderAndHover = (c) => {
    switch (c) {
      case 'primary':
        return {
          border: '1px solid var(--blue-medium)',
          hoverBorderColor: 'var(--blue-light)',
        };
      case 'success':
        return {
          border: '1px solid var(--yellow)',
          hoverBorderColor: 'var(--yellow-hover)',
        };
      case 'secondary':
        return {
          border: '1px solid var(--blue-dark)',
          hoverBorderColor: 'var(--blue-opaque)',
        };
      default:
        return {
          border: '1px solid var(--blue-medium)',
          hoverBorderColor: 'var(--blue-light)',
        };
    }
  };

  const outline = getOutlineBorderAndHover(color);

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
      sx={{
        height: '144px', // Reduzido mais 10% (era 160px, agora 144px)
        width: '144px', // Reduzido mais 10% (era 160px, agora 144px)
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: outline.border,
        borderRadius: '6px',
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden',
        p: 0, // Removido padding
        m: 0, // Removido margin
        backgroundColor: 'var(--cor-card)', // Usa variável CSS que muda automaticamente com o tema
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.2px',
          background: getArrowGradient(color),
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-9.6px) scale(1.02)',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
          borderColor: outline.hoverBorderColor,
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
        p: 0,
        m: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100%',
        pt: '24px',
        pb: '18px',
        px: '8px',
        boxSizing: 'border-box',
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            mt: '4px',
            gap: '10px',
          }}
        >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '52px',
            flexShrink: 0,
            color: 'var(--blue-opaque)',
          }}
        >
          {iconSrc ? (
            <Box
              component="img"
              src={iconSrc}
              alt={title}
              sx={{
                height: 42,
                width: 42,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            icon
          )}
        </Box>
        
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            color: 'var(--blue-dark)',
            fontSize: '0.792rem', // Reduzido mais 10% (era 0.88rem, agora 0.792rem)
            mb: 0,
          }}
        >
          {title}
        </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
