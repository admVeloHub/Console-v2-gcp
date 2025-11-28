// VERSION: v1.4.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ArrowBack, People, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QualidadePage = () => {
  const navigate = useNavigate();

  const handleModuleClick = (moduleId) => {
    if (moduleId === 'funcionarios') {
      navigate('/funcionarios');
    } else if (moduleId === 'qualidade') {
      navigate('/qualidade-module');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4.8, mb: 6.4, pb: 3.2, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', mb: 3.2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{
            color: 'var(--blue-dark)',
            borderColor: 'var(--blue-dark)',
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontSize: '0.8rem',
            py: 0.4,
            px: 1.2,
            '&:hover': {
              backgroundColor: 'var(--blue-light)',
              color: 'var(--white)',
              borderColor: 'var(--blue-light)'
            }
          }}
        >
          Voltar
        </Button>
      </Box>

      {/* Cards dos módulos */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3.2,
        maxWidth: '800px',
        mx: 'auto'
      }}>
        {/* Card Funcionários */}
        <Card
          onClick={() => handleModuleClick('funcionarios')}
          className="velohub-card"
          sx={{
            cursor: 'pointer',
            backgroundColor: 'var(--cor-card)',
            borderRadius: '12.8px',
            border: '1px solid rgba(22, 52, 255, 0.1)',
            boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.2px',
              background: 'linear-gradient(90deg, var(--blue-dark), var(--blue-light))',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&:hover::before': {
              transform: 'scaleX(1)'
            },
            '&:hover': {
              transform: 'translateY(-9.6px) scale(1.02)',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
              borderColor: 'var(--blue-light)'
            }
          }}
        >
          <CardContent sx={{ p: 3.2, height: '160px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.4, width: '100%' }}>
              <Box sx={{
                p: 1.6,
                borderRadius: '9.6px',
                backgroundColor: 'var(--blue-light)',
                color: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <People sx={{ fontSize: 25.6 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 700, 
                  color: 'var(--blue-dark)',
                  mb: 0.8,
                  fontSize: '1.28rem'
                }}>
                  Funcionários
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'Poppins', 
                  color: 'var(--gray)',
                  lineHeight: 1.5,
                  fontSize: '0.8rem'
                }}>
                  Gestão de colaboradores e acessos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card Módulo de Qualidade */}
        <Card
          onClick={() => handleModuleClick('qualidade')}
          className="velohub-card"
          sx={{
            cursor: 'pointer',
            backgroundColor: 'var(--cor-card)',
            borderRadius: '12.8px',
            border: '1px solid rgba(22, 52, 255, 0.1)',
            boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.2px',
              background: 'linear-gradient(90deg, var(--blue-dark), var(--blue-light))',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&:hover::before': {
              transform: 'scaleX(1)'
            },
            '&:hover': {
              transform: 'translateY(-9.6px) scale(1.02)',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
              borderColor: 'var(--blue-light)'
            }
          }}
        >
          <CardContent sx={{ p: 3.2, height: '160px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.4, width: '100%' }}>
              <Box sx={{
                p: 1.6,
                borderRadius: '9.6px',
                backgroundColor: 'var(--blue-dark)',
                color: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Assessment sx={{ fontSize: 25.6 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 700, 
                  color: 'var(--blue-dark)',
                  mb: 0.8,
                  fontSize: '1.28rem'
                }}>
                  Módulo de Qualidade
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'Poppins', 
                  color: 'var(--gray)',
                  lineHeight: 1.5,
                  fontSize: '0.8rem'
                }}>
                  Monitoramento e avaliação de atendimentos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default QualidadePage;
