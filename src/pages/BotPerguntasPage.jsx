// VERSION: v4.2.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Save, Search, Delete } from '@mui/icons-material';
import { botPerguntasAPI } from '../services/api';
import BackButton from '../components/common/BackButton';

const BotPerguntasPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    keywords: '',        // Palavras-chave (movido para posição do tópico)
    sinonimos: '',       // Sinônimos (nova posição)
    context: '',         // Contexto renomeado para Resposta
    question: '',        // Pergunta (permanece)
    tabulacao: ''        // Tabulação (substitui URLs de imagens)
  });

  // Estados para a aba "Gerenciar Perguntas"
  const [perguntasList, setPerguntasList] = useState([]);
  const [filteredPerguntas, setFilteredPerguntas] = useState([]);
  const [selectedPergunta, setSelectedPergunta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFormData, setEditFormData] = useState({
    id: '',
    pergunta: '',
    resposta: '',
    palavrasChave: '',
    sinonimos: '',
    tabulacao: ''
  });
  const [loadingPerguntas, setLoadingPerguntas] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      // Validar campos obrigatórios
      if (!formData.question || !formData.context || !formData.keywords) {
        setSnackbar({
          open: true,
          message: 'Pergunta, Resposta e Palavras-chave são obrigatórios',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // Mapear dados para o schema do MongoDB conforme diretrizes
      const mappedData = {
        pergunta: formData.question,        // Pergunta → pergunta (minúscula)
        resposta: formData.context,         // Resposta → resposta (minúscula)
        palavrasChave: formData.keywords,   // "Palavras-chave" → palavrasChave (camelCase)
        sinonimos: formData.sinonimos,      // Sinonimos → sinonimos (minúscula)
        tabulacao: formData.tabulacao       // Tabulação → tabulacao (minúscula)
      };

      console.log('🔍 Debug - Dados mapeados para envio:', mappedData);
      console.log('🔍 Debug - Campos obrigatórios verificados:');
      console.log('  - Pergunta:', !!formData.question, formData.question);
      console.log('  - Resposta:', !!formData.context, formData.context);
      console.log('  - Palavras-chave:', !!formData.keywords, formData.keywords);

      // Enviar dados para API
      const response = await botPerguntasAPI.create(mappedData);
      
      // Reset form
      setFormData({
        keywords: '',
        sinonimos: '',
        context: '',
        question: '',
        tabulacao: ''
      });

      // Mostrar sucesso
      setSnackbar({
        open: true,
        message: response.message || 'Pergunta do bot configurada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      // Mostrar erro
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao configurar pergunta. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Funções para a aba "Gerenciar Perguntas"
  
  // 1. Carregar Lista de Perguntas
  const loadPerguntasList = useCallback(async () => {
    try {
      setLoadingPerguntas(true);
      const response = await botPerguntasAPI.getAll();
      
      // Extrair array de dados - backend retorna { success: true, data: [...] }
      let perguntasArray = [];
      if (Array.isArray(response)) {
        perguntasArray = response;
      } else if (response && response.success && Array.isArray(response.data)) {
        perguntasArray = response.data;
      } else if (response && Array.isArray(response.data)) {
        perguntasArray = response.data;
      } else {
        console.error('Resposta não é um array:', response);
        setPerguntasList([]);
        setFilteredPerguntas([]);
        return;
      }
      
      // Ordenar por data (mais recente primeiro) com validação
      const sorted = perguntasArray.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        // Validar datas
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn('Data inválida encontrada:', { 
            a: a.createdAt, 
            b: b.createdAt,
            perguntaA: a.pergunta,
            perguntaB: b.pergunta
          });
          return 0;
        }
        
        return dateB - dateA; // Mais recente primeiro
      });
      
      setPerguntasList(sorted);
      setFilteredPerguntas(sorted);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar perguntas',
        severity: 'error'
      });
    } finally {
      setLoadingPerguntas(false);
    }
  }, []);

  // 2. Pesquisar Perguntas
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredPerguntas(perguntasList);
      return;
    }
    
    const filtered = perguntasList.filter(pergunta =>
      pergunta.pergunta?.toLowerCase().includes(term.toLowerCase()) ||
      pergunta.resposta?.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredPerguntas(filtered);
  };

  // 3. Selecionar Pergunta para Edição
  const handleSelectPergunta = (pergunta) => {
    setSelectedPergunta(pergunta);
    setEditFormData({
      id: pergunta._id,
      pergunta: pergunta.pergunta || '',
      resposta: pergunta.resposta || '',
      palavrasChave: pergunta.palavrasChave || '',
      sinonimos: pergunta.sinonimos || '',
      tabulacao: pergunta.tabulacao || ''
    });
  };

  // 4. Atualizar Pergunta
  const handleUpdatePergunta = async (event) => {
    event.preventDefault();
    
    if (!editFormData.id) {
      setSnackbar({
        open: true,
        message: 'Selecione uma pergunta para editar',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Payload conforme schema MongoDB
      const updateData = {
        pergunta: editFormData.pergunta,
        resposta: editFormData.resposta,
        palavrasChave: editFormData.palavrasChave,
        sinonimos: editFormData.sinonimos,
        tabulacao: editFormData.tabulacao
      };
      
      await botPerguntasAPI.update(editFormData.id, updateData);
      
      setSnackbar({
        open: true,
        message: 'Pergunta atualizada com sucesso!',
        severity: 'success'
      });
      
      // Recarregar lista
      await loadPerguntasList();
      
      // Limpar seleção
      setSelectedPergunta(null);
      setEditFormData({
        id: '',
        pergunta: '',
        resposta: '',
        palavrasChave: '',
        sinonimos: '',
        tabulacao: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao atualizar pergunta',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. Deletar Pergunta
  const handleDeletePergunta = async () => {
    if (!editFormData.id) {
      setSnackbar({
        open: true,
        message: 'Selecione uma pergunta para deletar',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      await botPerguntasAPI.delete(editFormData.id);
      
      setSnackbar({
        open: true,
        message: 'Pergunta deletada com sucesso!',
        severity: 'success'
      });
      
      // Recarregar lista
      await loadPerguntasList();
      
      // Limpar seleção
      setSelectedPergunta(null);
      setEditFormData({
        id: '',
        pergunta: '',
        resposta: '',
        palavrasChave: '',
        sinonimos: '',
        tabulacao: ''
      });
      
      // Fechar diálogo
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao deletar pergunta',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 6. useEffect para Carregar Dados
  useEffect(() => {
    if (activeTab === 1) {
      loadPerguntasList();
    }
  }, [activeTab, loadPerguntasList]);

  return (
    <Container maxWidth="xl" sx={{ py: 3.2, mb: 6.4, pb: 3.2 }}>
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
            aria-label="bot perguntas tabs"
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
            <Tab label="Adicionar Pergunta" />
            <Tab label="Gerenciar Perguntas" />
          </Tabs>
        </Box>
      </Box>

      {/* Tab 0: Adicionar Pergunta */}
      {activeTab === 0 && (
        <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
        <CardContent>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Palavras-chave"
                  value={formData.keywords}
                  onChange={handleInputChange('keywords')}
                  required
                  placeholder="ex: ajuda, suporte, problema"
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sinônimos"
                  value={formData.sinonimos}
                  onChange={handleInputChange('sinonimos')}
                  placeholder="ex: auxílio, ajuda, suporte"
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
                  label="Resposta"
                  value={formData.context}
                  onChange={handleInputChange('context')}
                  multiline
                  rows={2.4}
                  required
                  placeholder="Digite a resposta que o bot deve fornecer..."
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
                  label="Pergunta"
                  value={formData.question}
                  onChange={handleInputChange('question')}
                  multiline
                  rows={1.6}
                  required
                  placeholder="Digite a pergunta que o bot deve responder..."
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
                  label="Tabulação"
                  value={formData.tabulacao}
                  onChange={handleInputChange('tabulacao')}
                  placeholder="Digite a tabulação para esta pergunta..."
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: 'var(--green)',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 2.4,
                      py: 0.8,
                      '&:hover': {
                        backgroundColor: 'var(--green)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Resposta'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      )}

      {/* Tab 1: Gerenciar Perguntas */}
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
                  {selectedPergunta ? 'Editar Pergunta' : 'Selecione uma pergunta'}
                </Typography>
                
                <form onSubmit={handleUpdatePergunta}>
                  <Grid container spacing={2.4}>
                    {/* Campo Pergunta */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Pergunta"
                        value={editFormData.pergunta}
                        onChange={(e) => setEditFormData({...editFormData, pergunta: e.target.value})}
                        multiline
                        rows={1.3}
                        disabled={!selectedPergunta}
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
                    
                    {/* Campo Resposta */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Resposta"
                        value={editFormData.resposta}
                        onChange={(e) => setEditFormData({...editFormData, resposta: e.target.value})}
                        multiline
                        rows={2}
                        disabled={!selectedPergunta}
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
                    
                    {/* Campo Palavras-chave */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Palavras-chave"
                        value={editFormData.palavrasChave}
                        onChange={(e) => setEditFormData({...editFormData, palavrasChave: e.target.value})}
                        disabled={!selectedPergunta}
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
                    
                    {/* Campo Sinônimos */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sinônimos"
                        value={editFormData.sinonimos}
                        onChange={(e) => setEditFormData({...editFormData, sinonimos: e.target.value})}
                        disabled={!selectedPergunta}
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
                    
                    {/* Campo Tabulação */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tabulação"
                        value={editFormData.tabulacao}
                        onChange={(e) => setEditFormData({...editFormData, tabulacao: e.target.value})}
                        disabled={!selectedPergunta}
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
                    
                    {/* Botões Salvar e Delete */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1.6 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!selectedPergunta || loading}
                          startIcon={<Save sx={{ fontSize: '0.8rem' }} />}
                          size="small"
                          sx={{
                            backgroundColor: 'var(--green)',
                            color: 'white',
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            py: 0.8,
                            px: 1.6,
                            '&:hover': {
                              backgroundColor: 'var(--green)',
                              opacity: 0.9
                            }
                          }}
                        >
                          {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button
                          variant="contained"
                          disabled={!selectedPergunta || loading}
                          startIcon={<Delete sx={{ fontSize: '0.8rem' }} />}
                          size="small"
                          onClick={() => setDeleteDialogOpen(true)}
                          sx={{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            py: 0.8,
                            px: 1.6,
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#b71c1c'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
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
                  placeholder="Pesquisar perguntas..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 0.8, color: 'var(--blue-medium)', fontSize: '0.8rem' }} />
                  }}
                  sx={{ 
                    mb: 1.6,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem',
                      '&:hover fieldset': {
                        borderColor: 'var(--blue-medium)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--blue-medium)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem'
                    }
                  }}
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1.6, fontSize: '0.64rem', color: 'var(--gray)', fontFamily: 'Poppins' }}>
                  {filteredPerguntas.length} pergunta(s) encontrada(s)
                </Typography>
                
                {/* Lista de Perguntas */}
                <Box sx={{ 
                  maxHeight: '600px', 
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'var(--green)',
                    borderRadius: '4px'
                  }
                }}>
                  {loadingPerguntas ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <CircularProgress sx={{ color: 'var(--green)' }} />
                    </Box>
                  ) : filteredPerguntas.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: 'var(--gray)', fontFamily: 'Poppins' }}>
                      Nenhuma pergunta encontrada
                    </Typography>
                  ) : (
                    filteredPerguntas.map((pergunta) => (
                      <Card
                        key={pergunta._id}
                        onClick={() => handleSelectPergunta(pergunta)}
                        sx={{
                          mb: 1.6,
                          cursor: 'pointer',
                          border: selectedPergunta?._id === pergunta._id ? '2px solid var(--green)' : '1px solid var(--gray)',
                          backgroundColor: selectedPergunta?._id === pergunta._id ? 'rgba(21, 162, 55, 0.1)' : 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(21, 162, 55, 0.05)',
                            borderColor: 'var(--green)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 1.6 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', mb: 0.8 }}>
                            {pergunta.pergunta}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ fontSize: '0.72rem', color: 'var(--gray)', fontFamily: 'Poppins', mb: 0.8 }}>
                            {pergunta.resposta?.substring(0, 100)}...
                          </Typography>
                          
                          <Typography variant="caption" sx={{ fontSize: '0.64rem', color: 'var(--gray)', fontFamily: 'Poppins', display: 'block' }}>
                            {new Date(pergunta.createdAt).toLocaleDateString('pt-BR', {
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontFamily: 'Poppins', fontSize: '0.96rem' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
            Tem certeza que deseja deletar a pergunta "{editFormData.pergunta}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeletePergunta} 
            color="error" 
            variant="contained"
            disabled={loading}
            sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
          >
            {loading ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default BotPerguntasPage;
