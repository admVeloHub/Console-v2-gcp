// VERSION: v4.1.4 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
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
  EngineeringOutlined,
  AnalyticsOutlined,
  SchoolOutlined,
  ChatOutlined
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

  // Primeira fileira: Artigos, Velonews, Bot Perguntas, Serviços, Academy (ESSENCIAL)
  const firstRowCards = [
    {
      title: 'Artigos',
      description: 'Criar e gerenciar artigos do sistema',
      icon: <ArticleOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/artigos',
      color: 'primary',
      permission: 'artigos'
    },
    {
      title: 'Velonews',
      description: 'Publicar notícias e alertas',
      icon: <WarningAmberOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/velonews',
      color: 'primary',
      permission: 'velonews'
    },
    {
      title: 'Bot Perguntas',
      description: 'Processos e Orientações',
      icon: <SmartToyOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/bot-perguntas',
      color: 'primary',
      permission: 'botPerguntas'
    },
    {
      title: 'Serviços',
      description: 'Serviços ativos no APP',
      icon: <EngineeringOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/servicos',
      color: 'primary',
      permission: 'servicos'
    },
    {
      title: 'Academy',
      icon: <SchoolOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/academy',
      color: 'primary',
      permission: 'academy'
    }
  ];

  // Segunda fileira: Hub Análises, Bot Análises, IGP, Capacity, Qualidade (RECICLAGEM)
  const secondRowCards = [
    {
      title: 'Hub Análises',
      description: 'Análises centralizadas do hub',
      icon: <AnalyticsOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/hub-analises',
      color: 'success',
      permission: 'hubAnalises'
    },
    {
      title: 'Bot Análises',
      description: 'Análises e relatórios do bot',
      icon: <AnalyticsOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/bot-analises',
      color: 'success',
      permission: 'botAnalises'
    },
    {
      title: 'IGP',
      description: 'Dashboard de métricas e relatórios',
      icon: <ShowChartOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/igp',
      color: 'success',
      permission: 'igp'
    },
    {
      title: 'Capacity',
      description: 'Monitoramento de capacidade e recursos',
      icon: <BoltOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/capacity',
      color: 'success',
      permission: 'capacity'
    },
    {
      title: 'Qualidade',
      description: 'Controle de qualidade e auditoria',
      icon: <CheckCircleOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/qualidade',
      color: 'success',
      permission: 'qualidade'
    }
  ];

  // Terceira fileira: Chamados Internos, WhatsApp (OPCIONAL)
  const thirdRowCards = [
    {
      title: 'Chamados Internos',
      description: 'Sistema de tickets e suporte interno',
      icon: <ConfirmationNumberOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/chamados-internos',
      color: 'secondary',
      permission: 'chamadosInternos'
    },
    {
      title: 'WhatsApp',
      description: 'Gerenciar conexão WhatsApp do sistema',
      icon: <ChatOutlined sx={{ fontSize: '2.24rem' }} />,
      path: '/whatsapp',
      color: 'secondary',
      permission: 'config'
    }
  ];

  // Card Config (OPCIONAL)
  const configCard = {
    title: 'Config',
    description: 'Configurações do sistema e permissões',
    icon: <SettingsOutlined sx={{ fontSize: '1.28rem' }} />,
    path: '/config',
    color: 'secondary',
    permission: 'config'
  };

  // Filtrar cards baseado nas permissões do usuário
  const filteredFirstRowCards = firstRowCards.filter(card => hasPermission(card.permission));
  const filteredSecondRowCards = secondRowCards.filter(card => hasPermission(card.permission));
  const filteredThirdRowCards = thirdRowCards.filter(card => hasPermission(card.permission));
  const hasConfigPermission = hasPermission(configCard.permission);

  // Debug: mostrar quais cards estão sendo renderizados
  console.log('🎯 CARDS FILTRADOS:');
  console.log('📋 Primeira fileira:', filteredFirstRowCards.map(c => c.title));
  console.log('📋 Segunda fileira:', filteredSecondRowCards.map(c => c.title));
  console.log('📋 Terceira fileira:', filteredThirdRowCards.map(c => c.title));
  console.log('⚙️ Config visível:', hasConfigPermission);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4.8, mb: 6.4, pb: 3.2 }}>
      {/* Primeira fileira: Artigos, Velonews, Bot Perguntas, Serviços */}
      {filteredFirstRowCards.length > 0 && (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          mb: 1.6
        }}>
          {filteredFirstRowCards.map((card) => (
            <DashboardCard 
              key={card.title}
              {...card} 
              onClick={() => handleCardClick(card.path)}
            />
          ))}
        </Box>
      )}

      {/* Grid 2: Segunda fileira - 5 colunas extrapolando o container */}
      {filteredSecondRowCards.length > 0 && (
        <Box sx={{ 
          width: '100vw', 
          marginLeft: 'calc(-50vw + 50%)', 
          paddingX: '24px',
          mb: 2,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {filteredSecondRowCards.map((card) => (
              <DashboardCard 
                key={card.title}
                {...card} 
                onClick={() => handleCardClick(card.path)}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Quarta fileira: Chamados Internos e Config na mesma linha */}
      {(filteredThirdRowCards.length > 0 || hasConfigPermission) && (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          mb: 1.6
        }}>
          {filteredThirdRowCards.map((card) => (
            <DashboardCard
              key={card.title}
              {...card}
              onClick={() => handleCardClick(card.path)}
            />
          ))}
          {hasConfigPermission && (
            <DashboardCard
              {...configCard}
              onClick={() => handleCardClick(configCard.path)}
            />
          )}
        </Box>
      )}

      {/* Mensagem quando usuário não tem permissões */}
      {filteredFirstRowCards.length === 0 && filteredSecondRowCards.length === 0 && filteredThirdRowCards.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8, 
          p: 4,
          backgroundColor: 'var(--cor-container)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Typography variant="h5" sx={{ 
            fontFamily: 'Poppins', 
            fontWeight: 600, 
            color: 'var(--gray)',
            mb: 2
          }}>
            Nenhuma funcionalidade disponível
          </Typography>
          <Typography variant="body1" sx={{ 
            fontFamily: 'Poppins', 
            color: 'var(--blue-dark)'
          }}>
            Entre em contato com o administrador para obter permissões de acesso.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage;
