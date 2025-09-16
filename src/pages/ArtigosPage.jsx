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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, Add } from '@mui/icons-material';
import { artigosAPI } from '../services/api';

const ArtigosPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    keywords: ''
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const categories = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'negocios', label: 'Negócios' },
    { value: 'educacao', label: 'Educação' },
    { value: 'saude', label: 'Saúde' },
    { value: 'entretenimento', label: 'Entretenimento' }
  ];

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Enviar dados para API
      const response = await artigosAPI.create(formData);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        keywords: ''
      });

      // Mostrar sucesso
      setSnackbar({
        open: true,
        message: response.message || 'Artigo criado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      // Mostrar erro
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao criar artigo. Tente novamente.',
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
          Gerenciar Artigos
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontFamily: 'Poppins' }}
        >
          Criar e gerenciar artigos do sistema VeloHub
        </Typography>
      </Box>

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
              Novo Artigo
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título do Artigo"
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

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontFamily: 'Poppins' }}>Categoria</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    label="Categoria"
                    sx={{ fontFamily: 'Poppins' }}
                  >
                    {categories.map((category) => (
                      <MenuItem 
                        key={category.value} 
                        value={category.value}
                        sx={{ fontFamily: 'Poppins' }}
                      >
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Palavras-chave (separadas por vírgula)"
                  value={formData.keywords}
                  onChange={handleInputChange('keywords')}
                  placeholder="ex: tecnologia, inovação, futuro"
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
                  label="Conteúdo do Artigo"
                  value={formData.content}
                  onChange={handleInputChange('content')}
                  multiline
                  rows={8}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
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
                      backgroundColor: 'var(--blue-medium)',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'var(--blue-dark)'
                      }
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Artigo'}
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

export default ArtigosPage;
