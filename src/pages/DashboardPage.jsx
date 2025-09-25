// VERSION: v3.3.5 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  ArticleOutlined, 
  WarningAmberOutlined, 
  SmartToyOutlined, 
  ConfirmationNumberOutlined, 
  ShowChartOutlined, 
  CheckCircleOutlined, 
  BoltOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import DashboardCard from '../components/Dashboard/DashboardCard';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // Primeira fileira: Artigos, Velonews, Bot Perguntas, Chamados Internos
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
      description: 'Configurar perguntas do chatbot',
      icon: <SmartToyOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/bot-perguntas',
      color: 'warning',
      permission: 'botPerguntas'
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

  // Segunda fileira: IGP, Qualidade, Capacity, Config
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
      title: 'Config',
      description: 'Configurações do sistema e permissões',
      icon: <SettingsOutlined sx={{ fontSize: '3.5rem' }} />,
      path: '/config',
      color: 'secondary',
      permission: 'config'
    }
  ];

  // Filtrar cards baseado nas permissões do usuário
  const filteredFirstRowCards = firstRowCards.filter(card => hasPermission(card.permission));
  const filteredSecondRowCards = secondRowCards.filter(card => hasPermission(card.permission));

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4 }}>
      {/* Primeira fileira: Artigos, Velonews, Bot Perguntas, Chamados Internos */}
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

      {/* Segunda fileira: IGP, Qualidade, Capacity, Config */}
      {filteredSecondRowCards.length > 0 && (
        <Grid container spacing={4}>
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
