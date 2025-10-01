// VERSION: v3.7.4 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Container, Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  ArticleOutlined, 
  WarningAmberOutlined, 
  SmartToyOutlined, 
  ConfirmationNumberOutlined, 
  ShowChartOutlined, 
  CheckCircleOutlined, 
  BoltOutlined,
  SettingsOutlined,
  EngineeringOutlined
} from '@mui/icons-material';
import DashboardCard from '../components/Dashboard/DashboardCard';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();

  // Debug: verificar se é o gravina dev
  console.log('🔍 DEBUG - Usuário atual:', user);
  console.log('🔍 DEBUG - Email do usuário:', user?.email || user?._userMail);
  console.log('🔍 DEBUG - É Gravina@DEV?', (user?.email === 'lucas.gravina@velotax.com.br' || user?._userMail === 'lucas.gravina@velotax.com.br'));
  console.log('🔍 DEBUG - Tem permissão servicos?', hasPermission('servicos'));

  // Primeira fileira: Artigos, Velonews, Bot Perguntas, Serviços
  const firstRowCards = [
    {
      title: 'Artigos',
      description: 'Criar e gerenciar artigos do sistema',
      icon: <ArticleOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/artigos',
      color: 'secondary',
      permission: 'artigos'
    },
    {
      title: 'Velonews',
      description: 'Publicar notícias e alertas',
      icon: <WarningAmberOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/velonews',
      color: 'success',
      permission: 'velonews'
    },
    {
      title: 'Bot Perguntas',
      description: 'Processos e Orientações',
      icon: <SmartToyOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/bot-perguntas',
      color: 'warning',
      permission: 'botPerguntas'
    },
    {
      title: 'Serviços',
      description: 'Serviços ativos no APP',
      icon: <EngineeringOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/servicos',
      color: 'info',
      permission: 'servicos'
    }
  ];

  // Segunda fileira: IGP, Qualidade, Capacity, Chamados Internos
  const secondRowCards = [
    {
      title: 'IGP',
      description: 'Dashboard de métricas e relatórios',
      icon: <ShowChartOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/igp',
      color: 'primary',
      permission: 'igp'
    },
    {
      title: 'Qualidade',
      description: 'Controle de qualidade e auditoria',
      icon: <CheckCircleOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/qualidade',
      color: 'success',
      permission: 'qualidade'
    },
    {
      title: 'Capacity',
      description: 'Monitoramento de capacidade e recursos',
      icon: <BoltOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/capacity',
      color: 'info',
      permission: 'capacity'
    },
    {
      title: 'Chamados Internos',
      description: 'Sistema de tickets e suporte interno',
      icon: <ConfirmationNumberOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/chamados-internos',
      color: 'error',
      permission: 'chamadosInternos'
    }
  ];

  // Card Config (posicionado no canto inferior direito)
  const configCard = {
    title: 'Config',
    description: 'Configurações do sistema e permissões',
    icon: <SettingsOutlined sx={{ fontSize: '2rem' }} />,
    path: '/config',
    color: 'secondary',
    permission: 'config'
  };

  // Filtrar cards baseado nas permissões do usuário
  const filteredFirstRowCards = firstRowCards.filter(card => hasPermission(card.permission));
  const filteredSecondRowCards = secondRowCards.filter(card => hasPermission(card.permission));
  const hasConfigPermission = hasPermission(configCard.permission);

  // Debug: mostrar quais cards estão sendo renderizados
  console.log('🎯 CARDS FILTRADOS:');
  console.log('📋 Primeira fileira:', filteredFirstRowCards.map(c => c.title));
  console.log('📋 Segunda fileira:', filteredSecondRowCards.map(c => c.title));
  console.log('⚙️ Config visível:', hasConfigPermission);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4 }}>
      {/* Primeira fileira: Artigos, Velonews, Bot Perguntas, Serviços */}
      {filteredFirstRowCards.length > 0 && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {filteredFirstRowCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <DashboardCard 
                {...card} 
                onClick={() => handleCardClick(card.path)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Segunda fileira: IGP, Qualidade, Capacity, Chamados Internos */}
      {filteredSecondRowCards.length > 0 && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {filteredSecondRowCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <DashboardCard 
                {...card} 
                onClick={() => handleCardClick(card.path)}
              />
            </Grid>
          ))}
        </Grid>
      )}


      {/* Card Config - Posicionado no canto inferior direito */}
      {hasConfigPermission && (
        <Box sx={{
          position: 'fixed',
          bottom: '100px', // Acima do footer
          right: '20px',
          zIndex: 1000,
          width: '180px'
        }}>
          <Card
            className="velohub-card"
            sx={{
              height: '120px',
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
                height: '3px',
                background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dark) 60%, var(--blue-opaque) 100%)',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease',
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
                borderColor: 'var(--blue-medium)',
                '&::before': {
                  transform: 'scaleX(1)',
                },
              },
            }}
            onClick={() => handleCardClick(configCard.path)}
          >
            <CardContent sx={{ 
              flexGrow: 1, 
              textAlign: 'center', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
              <Box
                sx={{
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '40px',
                  color: 'var(--blue-opaque)',
                }}
              >
                {configCard.icon}
              </Box>
              
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  color: 'var(--blue-dark)',
                  fontSize: '1rem',
                  mb: 1,
                }}
              >
                {configCard.title}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Mensagem quando usuário não tem permissões */}
      {filteredFirstRowCards.length === 0 && filteredSecondRowCards.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8, 
          p: 4,
          backgroundColor: 'var(--cor-container)',
          borderRadius: '12px',
          border: '1px solid var(--cor-borda)'
        }}>
          <Typography variant="h5" sx={{ 
            fontFamily: 'Poppins', 
            fontWeight: 600, 
            color: 'var(--cor-texto)',
            mb: 2
          }}>
            Nenhuma funcionalidade disponível
          </Typography>
          <Typography variant="body1" sx={{ 
            fontFamily: 'Poppins', 
            color: 'var(--cor-texto-secundario)'
          }}>
            Entre em contato com o administrador para obter permissões de acesso.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage;
