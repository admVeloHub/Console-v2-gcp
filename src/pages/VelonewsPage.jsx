// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, Add, Warning } from '@mui/icons-material';
import { velonewsAPI } from '../services/api';

const VelonewsPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isCritical: false
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Enviar dados para API
      const response = await velonewsAPI.create(formData);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        isCritical: false
      });

      // Mostrar sucesso
      setSnackbar({
        open: true,
        message: response.message || 'Velonews publicada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      // Mostrar erro
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao publicar Velonews. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Velonews
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontFamily: 'Poppins' }}
        >
          Publicar notícias e alertas do sistema
        </Typography>
      </Box>

      {formData.isCritical && (
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ mb: 3, fontFamily: 'Poppins' }}
        >
          <strong>Alerta Crítico:</strong> Esta notícia será marcada como crítica e terá prioridade máxima.
        </Alert>
      )}

      <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Add sx={{ mr: 1, color: 'var(--blue-medium)' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: 'var(--blue-dark)'
              }}
            >
              Nova Velonews
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título da Notícia"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Conteúdo da Notícia"
                  value={formData.content}
                  onChange={handleInputChange('content')}
                  multiline
                  rows={6}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isCritical}
                      onChange={handleInputChange('isCritical')}
                      sx={{
                        color: 'var(--yellow)',
                        '&.Mui-checked': {
                          color: 'var(--yellow)',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                      Marcar como Alerta Crítico
                    </Typography>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: formData.isCritical ? 'var(--yellow)' : 'var(--blue-medium)',
                      color: formData.isCritical ? 'var(--blue-dark)' : 'white',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: formData.isCritical ? 'var(--yellow)' : 'var(--blue-dark)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {loading ? 'Publicando...' : 'Publicar Velonews'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VelonewsPage;
