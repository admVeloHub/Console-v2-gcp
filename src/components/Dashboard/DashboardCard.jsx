// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const DashboardCard = ({ title, description, icon, color, onClick }) => {
  const getColorValue = (color) => {
    switch (color) {
      case 'primary':
        return 'var(--blue-medium)';
      case 'secondary':
        return 'var(--blue-opaque)';
      case 'success':
        return 'var(--green)';
      case 'warning':
        return 'var(--yellow)';
      default:
        return 'var(--blue-medium)';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid transparent`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          borderColor: getColorValue(color),
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
        <Box
          sx={{
            fontSize: '3rem',
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80px',
          }}
        >
          {icon}
        </Box>
        
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            color: 'var(--blue-dark)',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontFamily: 'Poppins',
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            sx={{
              backgroundColor: getColorValue(color),
              color: 'white',
              '&:hover': {
                backgroundColor: getColorValue(color),
                opacity: 0.9,
              },
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
