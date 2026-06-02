// VERSION: v4.5.1 | DATE: 2026-04-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v4.5.1 - Segunda fileira: sem full-bleed 100vw (evita scroll horizontal na home)
// CHANGELOG: v4.5.0 - Ícones dos cards: PNG em public/icons (dashboardCardIcons)
// CHANGELOG: v4.4.1 - Card Bot Perguntas renomeado para VeloBot (rótulo apenas)
// CHANGELOG: v4.4.0 - Removido card IGP do dashboard
// CHANGELOG: v4.3.0 - Removido card Conexões/WhatsApp do dashboard
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/Dashboard/DashboardCard';
import { useAuth } from '../contexts/AuthContext';
import { dashboardCardIconByPermission } from '../config/dashboardCardIcons';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();

  // Primeira fileira: Artigos, Velonews, VeloBot, Serviços, Academy (ESSENCIAL)
  const firstRowCards = [
    {
      title: 'Artigos',
      description: 'Criar e gerenciar artigos do sistema',
      iconSrc: dashboardCardIconByPermission.artigos,
      path: '/artigos',
      color: 'primary',
      permission: 'artigos'
    },
    {
      title: 'Velonews',
      description: 'Publicar notícias e alertas',
      iconSrc: dashboardCardIconByPermission.velonews,
      path: '/velonews',
      color: 'primary',
      permission: 'velonews'
    },
    {
      title: 'VeloBot',
      description: 'Processos e Orientações',
      iconSrc: dashboardCardIconByPermission.botPerguntas,
      path: '/bot-perguntas',
      color: 'primary',
      permission: 'botPerguntas'
    },
    {
      title: 'Serviços',
      description: 'Serviços ativos no APP',
      iconSrc: dashboardCardIconByPermission.servicos,
      path: '/servicos',
      color: 'primary',
      permission: 'servicos'
    },
    {
      title: 'Academy',
      iconSrc: dashboardCardIconByPermission.academy,
      path: '/academy',
      color: 'primary',
      permission: 'academy'
    }
  ];

  // Segunda fileira: Hub Análises, Bot Análises, Capacity, Qualidade (RECICLAGEM)
  const secondRowCards = [
    {
      title: 'Hub Análises',
      description: 'Análises centralizadas do hub',
      iconSrc: dashboardCardIconByPermission.hubAnalises,
      path: '/hub-analises',
      color: 'success',
      permission: 'hubAnalises'
    },
    {
      title: 'Bot Análises',
      description: 'Análises e relatórios do bot',
      iconSrc: dashboardCardIconByPermission.botAnalises,
      path: '/bot-analises',
      color: 'success',
      permission: 'botAnalises'
    },
    {
      title: 'Capacity',
      description: 'Monitoramento de capacidade e recursos',
      iconSrc: dashboardCardIconByPermission.capacity,
      path: '/capacity',
      color: 'success',
      permission: 'capacity'
    },
    {
      title: 'Gestão e Qualidade',
      description: 'Controle de qualidade e auditoria',
      iconSrc: dashboardCardIconByPermission.qualidade,
      path: '/qualidade',
      color: 'success',
      permission: 'qualidade'
    },
    {
      title: 'Corporativo',
      description: 'Legal, comunicação e conteúdo VeloHub',
      iconSrc: dashboardCardIconByPermission.corporativo,
      path: '/corporativo',
      color: 'success',
      permission: 'corporativo'
    }
  ];

  // Terceira fileira: Chamados Internos
  const thirdRowCards = [
    {
      title: 'Chamados Internos',
      description: 'Sistema de tickets e suporte interno',
      iconSrc: dashboardCardIconByPermission.chamadosInternos,
      path: '/chamados-internos',
      color: 'secondary',
      permission: 'chamadosInternos'
    }
  ];

  // Card Config (OPCIONAL)
  const configCard = {
    title: 'Config',
    description: 'Configurações do sistema e permissões',
    iconSrc: dashboardCardIconByPermission.config,
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

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4.8, mb: 6.4, pb: 3.2 }}>
      {/* Primeira fileira: Artigos, Velonews, VeloBot, Serviços */}
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

      {/* Segunda fileira: mesmo alinhamento da primeira (sem 100vw — evita overflow-x) */}
      {filteredSecondRowCards.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1.6
          }}
        >
          {filteredSecondRowCards.map((card) => (
            <DashboardCard
              key={card.title}
              {...card}
              onClick={() => handleCardClick(card.path)}
            />
          ))}
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
          borderRadius: '6px',
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
