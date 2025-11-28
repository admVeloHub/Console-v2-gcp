// VERSION: v4.4.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useCallback, useEffect } from 'react';
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
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  Chip
} from '@mui/material';
import { Save, Add, Warning, Search } from '@mui/icons-material';
import { velonewsAPI } from '../services/api';
import BackButton from '../components/common/BackButton';

const VelonewsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isCritical: false
  });

  // Estados para a aba "Localizar Notícias"
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFormData, setEditFormData] = useState({
    id: '',
    titulo: '',
    conteudo: '',
    isCritical: false,
    solved: false
  });
  const [loadingNews, setLoadingNews] = useState(false);

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
      // Mapear dados para o schema MongoDB conforme diretrizes
      const mappedData = {
        titulo: formData.title,        // title → titulo (português)
        conteudo: formData.content,    // content → conteudo (português)
        isCritical: formData.isCritical, // Campo já correto
        solved: false                  // SEMPRE false ao publicar nova notícia
      };

      console.log('🔍 DEBUG - Dados mapeados para envio:', mappedData);

      // Enviar dados mapeados para API
      const response = await velonewsAPI.create(mappedData);
      
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

  // Funções para a aba "Localizar Notícias"
  
  // 1. Carregar Lista de Notícias
  const loadNewsList = useCallback(async () => {
    try {
      setLoadingNews(true);
      const response = await velonewsAPI.getAll();
      
      // Garantir que temos um array
      if (!Array.isArray(response)) {
        console.error('Resposta não é um array:', response);
        setNewsList([]);
        setFilteredNews([]);
        return;
      }
      
      // Ordenar por data (mais recente primeiro) com validação
      const sorted = response.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        // Validar datas
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn('Data inválida encontrada:', { 
            a: a.createdAt, 
            b: b.createdAt,
            tituloA: a.titulo,
            tituloB: b.titulo
          });
          return 0;
        }
        
        return dateB - dateA; // Mais recente primeiro
      });
      
      setNewsList(sorted);
      setFilteredNews(sorted);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar notícias',
        severity: 'error'
      });
    } finally {
      setLoadingNews(false);
    }
  }, []);

  // 2. Pesquisar Notícias
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredNews(newsList);
      return;
    }
    
    const filtered = newsList.filter(news =>
      news.titulo?.toLowerCase().includes(term.toLowerCase()) ||
      news.conteudo?.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredNews(filtered);
  };

  // 3. Selecionar Notícia para Edição (CRÍTICO - Carregar todos os campos)
  const handleSelectNews = (news) => {
    setSelectedNews(news);
    setEditFormData({
      id: news._id,
      titulo: news.titulo || '',
      conteudo: news.conteudo || '',
      isCritical: news.isCritical || false,  // Carregar estado do DB
      solved: news.solved || false           // Carregar estado do DB
    });
  };

  // 4. Atualizar Notícia (Payload completo com solved)
  const handleUpdateNews = async (event) => {
    event.preventDefault();
    
    if (!editFormData.id) {
      setSnackbar({
        open: true,
        message: 'Selecione uma notícia para editar',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Payload COMPLETO conforme schema MongoDB
      const updateData = {
        titulo: editFormData.titulo,
        conteudo: editFormData.conteudo,
        isCritical: editFormData.isCritical,
        solved: editFormData.solved  // Incluir solved no payload
      };
      
      await velonewsAPI.update(editFormData.id, updateData);
      
      setSnackbar({
        open: true,
        message: 'Notícia atualizada com sucesso!',
        severity: 'success'
      });
      
      // Recarregar lista
      await loadNewsList();
      
      // Limpar seleção
      setSelectedNews(null);
      setEditFormData({
        id: '',
        titulo: '',
        conteudo: '',
        isCritical: false,
        solved: false
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao atualizar notícia',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. useEffect para Carregar Dados
  useEffect(() => {
    if (activeTab === 1) {
      loadNewsList();
    }
  }, [activeTab, loadNewsList]);

  return (
    <Container maxWidth="xl" sx={{ py: 3.2, mb: 6.4, pb: 3.2 }}>
      {/* Header com botão voltar e abas alinhadas */}
      {/* Header único - alinhamento central absoluto das abas */}
      <Box sx={{ position: 'relative', mb: 3.2, minHeight: 40 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
          <BackButton />
        </Box>
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          width: 'max-content'
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            aria-label="velonews tabs"
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontFamily: 'Poppins',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'var(--blue-light)',
                },
                '&:not(.Mui-selected)': {
                  color: 'rgba(0, 0, 0, 0.35)',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--blue-light)',
                height: 2,
              }
            }}
          >
            <Tab label="Publicar Notícia" />
            <Tab label="Localizar Notícias" />
          </Tabs>
        </Box>
      </Box>

      {/* Tab 0: Publicar Notícia */}
      {activeTab === 0 && (
        <>
          {formData.isCritical && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 2.4, fontFamily: 'Poppins' }}
        >
          <strong>Alerta Crítico:</strong> Esta notícia será marcada como crítica e terá prioridade máxima.
        </Alert>
      )}

      <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
        <CardContent sx={{ p: 3.2 }}>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título da Notícia"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                    },
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.8rem',
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
                  rows={4.8}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                    },
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.8rem',
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: formData.isCritical ? 'var(--yellow)' : 'var(--blue-medium)',
                      color: formData.isCritical ? 'var(--blue-dark)' : 'white',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 2.4,
                      py: 0.8,
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
        </>
      )}

      {/* Tab 1: Localizar Notícias */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', gap: 0 }}>
          {/* Área Principal 70% - Esquerda */}
          <Box sx={{ 
            width: '70%', 
            pr: 2.5   // 20px de padding direito
          }}>
            <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2.4, fontSize: '0.96rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', fontWeight: 600 }}>
                  {selectedNews ? 'Editar Notícia' : 'Selecione uma notícia'}
                </Typography>
                
                <form onSubmit={handleUpdateNews}>
                  <Grid container spacing={2.4}>
                    {/* Campo Título */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Título"
                        value={editFormData.titulo}
                        onChange={(e) => setEditFormData({...editFormData, titulo: e.target.value})}
                        disabled={!selectedNews}
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Poppins',
                            fontSize: '0.8rem'
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.8rem'
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Campo Conteúdo */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Conteúdo da Notícia"
                        value={editFormData.conteudo}
                        onChange={(e) => setEditFormData({...editFormData, conteudo: e.target.value})}
                        multiline
                        rows={5}
                        disabled={!selectedNews}
                        required
                        size="small"
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: '0.64rem',
                          },
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Poppins'
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: '0.64rem',
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Checkboxes: Urgente e Resolvido */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editFormData.isCritical}
                              onChange={(e) => setEditFormData({...editFormData, isCritical: e.target.checked})}
                              disabled={!selectedNews}
                              sx={{
                                color: 'var(--yellow)',
                                '&.Mui-checked': {
                                  color: 'var(--yellow)',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem' }}>
                              Alerta Crítico
                            </Typography>
                          }
                        />
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editFormData.solved}
                              onChange={(e) => setEditFormData({...editFormData, solved: e.target.checked})}
                              disabled={!selectedNews}
                              sx={{
                                color: 'var(--green)',
                                '&.Mui-checked': {
                                  color: 'var(--green)',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem' }}>
                              Resolvido
                            </Typography>
                          }
                        />
                      </Box>
                    </Grid>
                    
                    {/* Botão Salvar */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!selectedNews || loading}
                        startIcon={<Save sx={{ fontSize: '0.8rem' }} />}
                        size="small"
                        sx={{
                          backgroundColor: 'var(--blue-medium)',
                          color: 'white',
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          py: 0.8,
                          px: 1.6,
                          '&:hover': {
                            backgroundColor: 'var(--blue-dark)'
                          }
                        }}
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar 30% - Direita */}
          <Box sx={{ 
            width: '30%'
          }}>
            <Card sx={{ backgroundColor: 'var(--cor-container)', height: '100%' }}>
              <CardContent>
                {/* Barra de Pesquisa */}
                <TextField
                  fullWidth
                  placeholder="Pesquisar notícias..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ 
                    mb: 1.6,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem'
                    }
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 0.8, color: 'var(--blue-medium)', fontSize: '0.8rem' }} />
                  }}
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1.6, fontSize: '0.64rem', color: 'var(--gray)', fontFamily: 'Poppins' }}>
                  {filteredNews.length} notícia(s) encontrada(s)
                </Typography>
                
                {/* Lista de Notícias */}
                <Box sx={{ 
                  maxHeight: '600px', 
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'var(--blue-medium)',
                    borderRadius: '4px'
                  }
                }}>
                  {loadingNews ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
                    </Box>
                  ) : filteredNews.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: 'var(--gray)', fontFamily: 'Poppins' }}>
                      Nenhuma notícia encontrada
                    </Typography>
                  ) : (
                    filteredNews.map((news) => (
                      <Card
                        key={news._id}
                        onClick={() => handleSelectNews(news)}
                        sx={{
                          mb: 1.6,
                          cursor: 'pointer',
                          border: selectedNews?._id === news._id ? '2px solid var(--blue-medium)' : '1px solid var(--gray)',
                          backgroundColor: selectedNews?._id === news._id ? 'rgba(22, 148, 255, 0.1)' : 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(22, 148, 255, 0.05)',
                            borderColor: 'var(--blue-light)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 1.6 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.8 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', flex: 1, pr: 0.8 }}>
                              {news.titulo}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.4, flexShrink: 0 }}>
                              {news.isCritical && (
                                <Chip 
                                  label="Alerta Crítico" 
                                  color="warning" 
                                  size="small"
                                  sx={{ fontFamily: 'Poppins', fontSize: '0.56rem', height: '20px', '& .MuiChip-label': { px: 0.8 } }}
                                />
                              )}
                              {news.solved && (
                                <Chip 
                                  label="Resolvido" 
                                  color="success" 
                                  size="small"
                                  sx={{ fontFamily: 'Poppins', fontSize: '0.56rem', height: '20px', '& .MuiChip-label': { px: 0.8 } }}
                                />
                              )}
                            </Box>
                          </Box>
                          
                          <Typography variant="caption" sx={{ fontSize: '0.64rem', color: 'var(--gray)', fontFamily: 'Poppins' }}>
                            {new Date(news.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default VelonewsPage;
