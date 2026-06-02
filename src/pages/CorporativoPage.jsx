// VERSION: v1.0.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Container, Box, Typography, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import { dashboardIconUrl, dashboardCardIconByPermission } from '../config/dashboardCardIcons';

const CORPORATIVO_HUB_CARD_SX = {
  cursor: 'pointer',
  backgroundColor: 'var(--cor-card)',
  borderRadius: '6px',
  border: '1px solid var(--blue-dark)',
  boxShadow: 'none',
  transition: 'none',
  overflow: 'hidden',
  '&:hover': {
    transform: 'none',
    boxShadow: 'none',
    borderColor: 'var(--blue-dark)',
  },
};

const corporativoHubIconByModuleId = {
  legal: dashboardIconUrl('gestao-e-qualidade.png'),
  comunicacao: dashboardCardIconByPermission.velonews || dashboardIconUrl('news.png'),
};

const MODULES = [
  {
    id: 'legal',
    title: 'Legal',
    description: 'Documentos legais e lista de adesão',
    path: '/corporativo/legal',
  },
  {
    id: 'comunicacao',
    title: 'Comunicação',
    description: 'Destaques, avisos e agenda',
    path: '/corporativo/comunicacao',
  },
];

const CorporativoPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 6.4, pb: 3.2, position: 'relative' }}>
      <VoltarHeaderRow left={<BackButton to="/" />} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 3.2,
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        {MODULES.map((module) => (
          <Card
            key={module.id}
            onClick={() => navigate(module.path)}
            sx={CORPORATIVO_HUB_CARD_SX}
          >
            <CardContent sx={{ p: 3.2, height: '160px', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.4, width: '100%' }}>
                <Box
                  component="img"
                  src={corporativoHubIconByModuleId[module.id]}
                  alt={module.title}
                  sx={{
                    width: 48,
                    height: 48,
                    objectFit: 'contain',
                    display: 'block',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 700,
                      color: 'var(--blue-dark)',
                      mb: 0.8,
                      fontSize: '1.28rem',
                    }}
                  >
                    {module.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Poppins',
                      color: 'var(--gray)',
                      lineHeight: 1.5,
                      fontSize: '0.8rem',
                    }}
                  >
                    {module.description}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default CorporativoPage;
