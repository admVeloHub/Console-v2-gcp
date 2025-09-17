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
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{
          color: 'var(--blue-dark)',
          borderColor: 'var(--blue-dark)',
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
