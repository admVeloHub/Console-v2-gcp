// VERSION: v3.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const BackButton = ({ to = '/', label = 'Voltar' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(to);
  };

  return (
    <Box sx={{
      mb: 1.6,
      mt: 1.6,
      ml: 1.6,
      display: 'flex',
      justifyContent: 'flex-start'
    }}>
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
