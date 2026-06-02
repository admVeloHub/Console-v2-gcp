// VERSION: v1.7.2 | DATE: 2026-04-30 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.7.2 - Hub: Container mt 2 (igual a QA e Monitoria) para alinhar altura do Voltar à sub-rota
// CHANGELOG: v1.7.1 - Voltar: BackButton + VoltarHeaderRow (altura alinhada a QA e Monitoria)
// CHANGELOG: v1.6.1 - Cards hub Qualidade (Funcionários, QA e Monitoria, Gerenciar): sem sombra; borda 1px azul opaco; hover mantido (::before + lift)
// CHANGELOG: v1.6.0 - Card Gerenciar (ícone gerenciar.png) → /qualidade-gerenciar; grelha 3 colunas em md
// CHANGELOG: v1.5.1 - Funcionários / QA e Monitoria: ícone sem moldura nem fundo colorido
// CHANGELOG: v1.5.0 - Ícones dos cards: PNG em public/icons (qualidadeHubIconByModuleId)
import React from 'react';
import { Container, Box, Typography, Card, CardContent } from '@mui/material';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import { useNavigate } from 'react-router-dom';
import { qualidadeHubIconByModuleId } from '../config/dashboardCardIcons';

/** Cards do hub — mesmo contorno sem elevação; sem animação/translação ao hover (tema global MuiCard). */
const QUALIDADE_HUB_CARD_SX = {
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

const QualidadePage = () => {
  const navigate = useNavigate();

  const handleModuleClick = (moduleId) => {
    if (moduleId === 'funcionarios') {
      navigate('/funcionarios');
    } else if (moduleId === 'qualidade') {
      navigate('/qualidade-module');
    } else if (moduleId === 'gerenciar') {
      navigate('/qualidade-gerenciar');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 6.4, pb: 3.2, position: 'relative' }}>
      <VoltarHeaderRow left={<BackButton to="/" />} />

      {/* Cards dos módulos */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3.2,
        maxWidth: '1100px',
        mx: 'auto'
      }}>
        {/* Card Funcionários */}
        <Card onClick={() => handleModuleClick('funcionarios')} sx={QUALIDADE_HUB_CARD_SX}>
          <CardContent sx={{ p: 3.2, height: '160px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.4, width: '100%' }}>
              <Box
                component="img"
                src={qualidadeHubIconByModuleId.funcionarios}
                alt="Funcionários"
                sx={{
                  width: 48,
                  height: 48,
                  objectFit: 'contain',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
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
                  Registros, Status e Acessos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card Módulo de Qualidade */}
        <Card onClick={() => handleModuleClick('qualidade')} sx={QUALIDADE_HUB_CARD_SX}>
          <CardContent sx={{ p: 3.2, height: '160px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.4, width: '100%' }}>
              <Box
                component="img"
                src={qualidadeHubIconByModuleId.qualidade}
                alt="QA e Monitoria"
                sx={{
                  width: 48,
                  height: 48,
                  objectFit: 'contain',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 700, 
                  color: 'var(--blue-dark)',
                  mb: 0.8,
                  fontSize: '1.28rem'
                }}>
                  QA e Monitoria
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'Poppins', 
                  color: 'var(--gray)',
                  lineHeight: 1.5,
                  fontSize: '0.8rem'
                }}>
                  Avaliações de Atendimento
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card Gerenciar */}
        <Card onClick={() => handleModuleClick('gerenciar')} sx={QUALIDADE_HUB_CARD_SX}>
          <CardContent sx={{ p: 3.2, height: '160px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.4, width: '100%' }}>
              <Box
                component="img"
                src={qualidadeHubIconByModuleId.gerenciar}
                alt="Gerenciar"
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
                    mb: 0,
                    fontSize: '1.28rem',
                  }}
                >
                  Gerenciar
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
