// VERSION: v1.0.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Box, Chip, CircularProgress, Alert } from '@mui/material';

const matchAgente = (funcionario, agentes) => {
  if (!Array.isArray(agentes) || agentes.length === 0) return null;
  const emailFuncionario = funcionario.userMail?.toLowerCase?.() || funcionario.userEmail?.toLowerCase?.();
  const nomeFuncionario = funcionario.colaboradorNome?.toLowerCase?.();

  return agentes.find((agente) => {
    const emailAgente = agente.userEmail?.toLowerCase?.() || agente.email?.toLowerCase?.();
    const nomeAgente = agente.colaboradorNome?.toLowerCase?.() || agente.name?.toLowerCase?.();
    return (
      (emailFuncionario && emailAgente && emailFuncionario === emailAgente) ||
      (nomeFuncionario && nomeAgente && nomeFuncionario === nomeAgente)
    );
  });
};

const AcknowledgmentEmployeeChips = ({ funcionarios = [], agentes = [], loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} sx={{ color: 'var(--blue-medium)' }} />
      </Box>
    );
  }

  if (!funcionarios.length) {
    return (
      <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
        Nenhum funcionário encontrado.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        p: 1,
      }}
    >
      {funcionarios.map((funcionario) => {
        const agenteComCiencia = matchAgente(funcionario, agentes);
        const temCiencia = !!agenteComCiencia;

        return (
          <Chip
            key={funcionario._id || funcionario.userMail || funcionario.userEmail}
            label={funcionario.colaboradorNome || funcionario.userMail || funcionario.userEmail || 'Nome não disponível'}
            sx={{
              fontSize: '0.65rem',
              fontFamily: 'Poppins',
              fontWeight: temCiencia ? 600 : 400,
              backgroundColor: temCiencia ? '#4caf50' : 'rgba(0, 0, 0, 0.08)',
              color: temCiencia ? 'white' : 'var(--gray)',
              height: '28px',
              '& .MuiChip-label': {
                px: 1.2,
                py: 0.4,
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default AcknowledgmentEmployeeChips;
