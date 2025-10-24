// VERSION: v1.2.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ArrowBack, Sync, People, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QualidadePage = () => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização manual...');
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleModuleClick = (moduleId) => {
    if (moduleId === 'funcionarios') {
      navigate('/funcionarios');
    } else if (moduleId === 'qualidade') {
      navigate('/qualidade-module');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 4 }}>
        <Box sx={{ position: 'absolute', left: 0 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{
              color: '#000058',
              borderColor: '#000058',
              fontFamily: 'Poppins',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#1694FF',
                color: '#ffffff',
                borderColor: '#1694FF'
              }
            }}
          >
            Voltar
          </Button>
        </Box>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Qualidade
        </Typography>
        <Box sx={{ position: 'absolute', right: 0 }}>
          <Button
            startIcon={<Sync />}
            onClick={handleSync}
            disabled={isSyncing}
            sx={{
              backgroundColor: '#000058',
              color: '#ffffff',
              fontFamily: 'Poppins',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#000040'
              },
              '&:disabled': {
                backgroundColor: '#666666'
              }
            }}
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronização'}
          </Button>
        </Box>
      </Box>

      {/* Cards dos módulos */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 4,
        maxWidth: '800px',
        mx: 'auto'
      }}>
        {/* Card Funcionários */}
        <Card
          onClick={() => handleModuleClick('funcionarios')}
          sx={{
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #000058, #1694FF)',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&:hover::before': {
              transform: 'scaleX(1)'
            },
            '&:hover': {
              transform: 'translateY(-12px) scale(1.02)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              borderColor: '#1694FF'
            }
          }}
        >
          <CardContent sx={{ p: 4, height: '200px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
              <Box sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#1694FF',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <People sx={{ fontSize: 32 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 700, 
                  color: '#000058',
                  mb: 1
                }}>
                  Funcionários
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'Poppins', 
                  color: '#666666',
                  lineHeight: 1.5
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
          sx={{
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #000058, #1694FF)',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&:hover::before': {
              transform: 'scaleX(1)'
            },
            '&:hover': {
              transform: 'translateY(-12px) scale(1.02)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              borderColor: '#1694FF'
            }
          }}
        >
          <CardContent sx={{ p: 4, height: '200px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
              <Box sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#000058',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Assessment sx={{ fontSize: 32 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 700, 
                  color: '#000058',
                  mb: 1
                }}>
                  Módulo de Qualidade
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'Poppins', 
                  color: '#666666',
                  lineHeight: 1.5
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
