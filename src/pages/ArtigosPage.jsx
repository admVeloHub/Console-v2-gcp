// VERSION: v3.1.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useMemo, useCallback } from 'react';
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
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { Save, Construction } from '@mui/icons-material';
import { artigosAPI } from '../services/api';
import BackButton from '../components/common/BackButton';

const ArtigosPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    artigo_titulo: '',
    artigo_conteudo: '',
    categoria_id: '',
    categoria_titulo: ''
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Categorias conforme especificado - usando useMemo para evitar re-criação
  const categories = useMemo(() => [
    { categoria_id: '01_Crédito', categoria_titulo: 'Crédito' },
    { categoria_id: '02_restituição', categoria_titulo: 'Restituição e Declaração' },
    { categoria_id: '03_Calculadora e Darf', categoria_titulo: 'DARF e Calculadora' },
    { categoria_id: '04_Conta', categoria_titulo: 'Conta e Planos' },
    { categoria_id: '05_POP', categoria_titulo: 'POPs B2C' },
    { categoria_id: '06_ferramentas', categoria_titulo: 'Ferramentas do Agente' },
    { categoria_id: '07_manual de voz', categoria_titulo: 'Manual de Voz e Estilo' }
  ], []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = useCallback((field) => (event) => {
    if (field === 'categoria_id') {
      const selectedCategory = categories.find(cat => cat.categoria_id === event.target.value);
      setFormData(prev => ({
        ...prev,
        categoria_id: event.target.value,
        categoria_titulo: selectedCategory ? selectedCategory.categoria_titulo : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    }
  }, [categories]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await artigosAPI.create(formData);
      setSnackbar({
        open: true,
        message: 'Artigo criado com sucesso!',
        severity: 'success'
      });
      
      // Limpar formulário
      setFormData({
        artigo_titulo: '',
        artigo_conteudo: '',
        categoria_id: '',
        categoria_titulo: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao criar artigo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      
      {/* Títulos das Abas */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: activeTab === 0 ? 'var(--blue-medium)' : 'var(--gray)',
            opacity: activeTab === 0 ? 1 : 0.6,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onClick={() => setActiveTab(0)}
        >
          Adicionar Artigo
        </Typography>
        
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: activeTab === 1 ? 'var(--blue-medium)' : 'var(--gray)',
            opacity: activeTab === 1 ? 1 : 0.6,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onClick={() => setActiveTab(1)}
        >
          Gerenciar Artigos
        </Typography>
      </Box>

      {/* Conteúdo das Abas */}
      <TabPanel value={activeTab} index={0}>
        <Card sx={{ 
          background: 'var(--cor-container)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'var(--blue-dark)' }}>
              Novo Artigo
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título do Artigo"
                    value={formData.artigo_titulo}
                    onChange={handleInputChange('artigo_titulo')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'var(--blue-dark)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={formData.categoria_id}
                      onChange={handleInputChange('categoria_id')}
                      label="Categoria"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-dark)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-medium)',
                        },
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.categoria_id} value={category.categoria_id}>
                          {category.categoria_titulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Conteúdo do Artigo"
                    value={formData.artigo_conteudo}
                    onChange={handleInputChange('artigo_conteudo')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'var(--blue-dark)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: 'var(--blue-medium)',
                      '&:hover': {
                        backgroundColor: 'var(--blue-dark)',
                      },
                      px: 4,
                      py: 1.5
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Artigo'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card sx={{ 
          background: 'var(--cor-container)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Construction sx={{ 
              fontSize: 80, 
              color: 'var(--blue-medium)', 
              mb: 2 
            }} />
            <Typography variant="h5" sx={{ 
              color: 'var(--blue-dark)',
              mb: 1
            }}>
              Em Construção
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'var(--gray)',
              opacity: 0.7
            }}>
              Esta funcionalidade estará disponível em breve
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

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