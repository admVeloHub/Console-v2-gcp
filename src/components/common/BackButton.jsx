// VERSION: v3.2.0 | DATE: 2026-04-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.2.0 - Margens outer zeradas (alinhamento vertical no VoltarHeaderRow); VoltarHeaderRow + Sx exportados (referência QA/Monitoria)
// CHANGELOG: v3.1.0 - COMPONENTE INICIAL
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

/** Faixa única referência QA/Monitoria — altura mínima 40px, Voltar centrado vertical à esquerda. */
export const VOLTAR_HEADER_OUTER_SX = {
  position: 'relative',
  mb: 3.2,
  minHeight: 40,
};

export const VOLTAR_HEADER_LEFT_SX = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
};

export const VOLTAR_HEADER_CENTER_SX = {
  position: 'absolute',
  left: '50%',
  top: 0,
  bottom: 0,
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  width: 'max-content',
};

export const VOLTAR_HEADER_RIGHT_SX = {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  pr: 2,
  zIndex: 2,
};

/**
 * @param {React.ReactNode} left — Ex.: `<BackButton to="/qualidade" />`
 * @param {React.ReactNode} [center] — Tabs ou título central (opcional)
 * @param {React.ReactNode} [right] — Ações à direita (opcional)
 */
export function VoltarHeaderRow({ left, center, right }) {
  return (
    <Box sx={VOLTAR_HEADER_OUTER_SX}>
      <Box sx={VOLTAR_HEADER_LEFT_SX}>{left}</Box>
      {center != null ? (
        <Box sx={VOLTAR_HEADER_CENTER_SX}>{center}</Box>
      ) : null}
      {right != null ? (
        <Box sx={VOLTAR_HEADER_RIGHT_SX}>{right}</Box>
      ) : null}
    </Box>
  );
}

const BackButton = ({ to = '/', label = 'Voltar' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(to);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={handleBack}
        size="small"
        sx={{
          color: 'var(--blue-dark)',
          borderColor: 'var(--blue-dark)',
          fontSize: '0.64rem',
          padding: '3.2px 9.6px',
          minWidth: 'auto',
          height: '28.8px',
          '&:hover': {
            backgroundColor: 'var(--blue-light)',
            color: 'var(--white)',
            borderColor: 'var(--blue-light)',
          },
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

export default BackButton;
