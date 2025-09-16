// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/Dashboard/DashboardCard';

const DashboardPage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'IGP',
      description: 'Dashboard de métricas e relatórios',
      icon: '📊',
      path: '/igp',
      color: 'primary'
    },
    {
      title: 'Artigos',
      description: 'Criar e gerenciar artigos do sistema',
      icon: '📝',
      path: '/artigos',
      color: 'secondary'
    },
    {
      title: 'Velonews',
      description: 'Publicar notícias e alertas',
      icon: '📰',
      path: '/velonews',
      color: 'success'
    },
    {
      title: 'Bot Perguntas',
      description: 'Configurar perguntas do chatbot',
      icon: '🤖',
      path: '/bot-perguntas',
      color: 'warning'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Console de Conteúdo VeloHub
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontFamily: 'Poppins' }}
        >
          Gerencie todo o conteúdo do sistema em um só lugar
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <DashboardCard 
              {...card} 
              onClick={() => handleCardClick(card.path)}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 2, backgroundColor: 'var(--cor-container)', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
          Status do Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary">
          MongoDB: Conectado ✅ | API: Online ✅ | Versão: 3.0.0
        </Typography>
      </Box>
    </Container>
  );
};

export default DashboardPage;
