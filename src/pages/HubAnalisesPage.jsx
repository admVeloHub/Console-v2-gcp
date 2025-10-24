// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import BackButton from '../components/common/BackButton';

const HubAnalisesPage = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 4 }}>
        <Box sx={{ position: 'absolute', left: 0 }}>
          <BackButton />
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
          Hub Análises
        </Typography>
      </Box>

      <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, color: 'var(--blue-dark)', fontFamily: 'Poppins' }}>
            Hub Análises
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--gray)', fontFamily: 'Poppins' }}>
            Módulo Hub Análises - Funcionalidade específica será definida e implementada aqui.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HubAnalisesPage;
