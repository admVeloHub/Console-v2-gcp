// VERSION: v4.8.6 | DATE: 2025-03-19 | AUTHOR: VeloHub Development Team
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Save, Add, Warning, Search, Delete } from '@mui/icons-material';
import { velonewsAPI } from '../services/api';
import BackButton from '../components/common/BackButton';
import MarkdownEditor from '../components/common/MarkdownEditor';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { processImageUploads, countTemporaryImages } from '../utils/imageUploadProcessor';
import { clearAllTemporaryImages } from '../utils/imageStorage';

const VelonewsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isCritical: false
  });
  const [attachedVideos, setAttachedVideos] = useState([]);

  // Estados para a aba "Gerenciar Notícias"
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFormData, setEditFormData] = useState({
    id: '',
    titulo: '',
    conteudo: '',
    isCritical: false,
    solved: false
  });
  const [editAttachedVideos, setEditAttachedVideos] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      // Processar uploads de imagens temporárias antes de salvar
      let processedContent = formData.content;
      let imageFileNames = [];
      
      // DEBUG: Verificar conteúdo antes de processar
      console.log('🔍 [handleSubmit] Conteúdo antes de processar:', formData.content.substring(0, 200));
      console.log('🔍 [handleSubmit] Tipo:', typeof formData.content);
      
      const imageCount = countTemporaryImages(formData.content);
      console.log(`🔍 [handleSubmit] Imagens temporárias encontradas: ${imageCount}`);
      
      if (imageCount > 0) {
        console.log(`📤 Processando ${imageCount} imagem(ns) antes de publicar...`);
        const result = await processImageUploads(formData.content, 'velonews', (current, total) => {
          console.log(`⬆️ Upload de imagem ${current}/${total}`);
        });
        processedContent = result.markdown;
        imageFileNames = result.imageFileNames;
        console.log('✅ Todas imagens processadas com sucesso');
        console.log(`📋 Caminhos relativos para media.images:`, imageFileNames);
        console.log('🔍 [handleSubmit] Conteúdo após processamento:', processedContent.substring(0, 200));
      } else {
        console.warn('⚠️ [handleSubmit] Nenhuma imagem temporária detectada - verificando conteúdo manualmente...');
        // Debug adicional
        const hasBlob = formData.content.includes('blob:');
        const hasTemp = formData.content.includes('temp:');
        const hasImgTag = formData.content.includes('<img');
        console.log(`   - Contém "blob:": ${hasBlob}`);
        console.log(`   - Contém "temp:": ${hasTemp}`);
        console.log(`   - Contém "<img": ${hasImgTag}`);
      }

      // Extrair URLs dos vídeos anexados
      const videoUrls = attachedVideos.map(v => v.url);

      // Mapear dados para o schema MongoDB conforme diretrizes
      const mappedData = {
        titulo: formData.title,        // title → titulo (português)
        conteudo: processedContent,    // content → conteudo (português) - com URLs completas do GCS no markdown
        isCritical: formData.isCritical, // Campo já correto
        solved: false,                 // SEMPRE false ao publicar nova notícia
        media: {                       // Objeto de mídia
          images: imageFileNames,      // Array de caminhos relativos das imagens no GCS (ex: "img_velonews/timestamp-file.png")
          videos: videoUrls             // Array de URLs dos vídeos do YouTube
        }
      };

      console.log('🔍 DEBUG - Dados mapeados para envio:', mappedData);

      // Enviar dados mapeados para API
      const response = await velonewsAPI.create(mappedData);
      
      // Limpar imagens temporárias do localStorage após sucesso
      clearAllTemporaryImages('velonews');
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        isCritical: false
      });
      setAttachedVideos([]);

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

  // Funções para a aba "Gerenciar Notícias"
  
  // 1. Carregar Lista de Notícias
  const loadNewsList = useCallback(async () => {
    try {
      setLoadingNews(true);
      const response = await velonewsAPI.getAll();
      
      // Garantir que temos um array
      if (!Array.isArray(response)) {
        console.error('Resposta não é um array:', response);
        setNewsList([]);
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

  // 2. Lista filtrada derivada de searchTerm e newsList (sincroniza contador e lista)
  const filteredNews = useMemo(() => {
    if (!searchTerm.trim()) return newsList;
    const term = searchTerm.toLowerCase();
    return newsList.filter(news =>
      news.titulo?.toLowerCase().includes(term) ||
      news.conteudo?.toLowerCase().includes(term)
    );
  }, [searchTerm, newsList]);

  // 3. Pesquisar Notícias
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // 4. Selecionar Notícia para Edição (CRÍTICO - Carregar todos os campos)
  const handleSelectNews = (news) => {
    setSelectedNews(news);
    setEditFormData({
      id: news._id,
      titulo: news.titulo || '',
      conteudo: news.conteudo || '',
      isCritical: news.isCritical || false,  // Carregar estado do DB
      solved: news.solved || false           // Carregar estado do DB
    });
    
    // Carregar vídeos existentes
    if (news.media && news.media.videos && Array.isArray(news.media.videos)) {
      const videos = news.media.videos.map(url => ({
        url: url,
        videoId: url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)?.[1] || 
                 url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1] ||
                 url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)?.[1] ||
                 url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/)?.[1] || '',
        title: 'Vídeo do YouTube'
      }));
      setEditAttachedVideos(videos);
    } else {
      setEditAttachedVideos([]);
    }
  };

  // 5. Atualizar Notícia (Payload completo com solved)
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
      
      // Processar uploads de imagens temporárias antes de atualizar
      let processedContent = editFormData.conteudo;
      let imageFileNames = [];
      const imageCount = countTemporaryImages(editFormData.conteudo);
      
      if (imageCount > 0) {
        console.log(`📤 Processando ${imageCount} imagem(ns) antes de atualizar...`);
        const result = await processImageUploads(editFormData.conteudo, 'velonews', (current, total) => {
          console.log(`⬆️ Upload de imagem ${current}/${total}`);
        });
        processedContent = result.markdown;
        imageFileNames = result.imageFileNames;
        console.log('✅ Todas imagens processadas com sucesso');
        console.log(`📋 Caminhos relativos para media.images:`, imageFileNames);
      }
      
      // Extrair URLs dos vídeos anexados
      const videoUrls = editAttachedVideos.map(v => v.url);
      
      // Payload COMPLETO conforme schema MongoDB
      const updateData = {
        titulo: editFormData.titulo,
        conteudo: processedContent, // Conteúdo com URLs completas do GCS no markdown
        isCritical: editFormData.isCritical,
        solved: editFormData.solved, // Incluir solved no payload
        media: {                     // Objeto de mídia
          images: imageFileNames.length > 0 ? imageFileNames : (selectedNews?.media?.images || []), // Preservar imagens existentes se não houver novas
          videos: videoUrls          // Array de URLs dos vídeos do YouTube
        }
      };
      
      await velonewsAPI.update(editFormData.id, updateData);
      
      // Limpar imagens temporárias do localStorage após sucesso
      clearAllTemporaryImages('velonews');
      
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

  // 6. Deletar Notícia
  const handleDeleteVelonews = async () => {
    if (!editFormData.id) {
      setSnackbar({
        open: true,
        message: 'Selecione uma notícia para deletar',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      await velonewsAPI.delete(editFormData.id);
      
      setSnackbar({
        open: true,
        message: 'Notícia deletada com sucesso!',
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
      
      // Fechar diálogo
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao deletar notícia',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 7. useEffect para Carregar Dados
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
            <Tab label="Gerenciar Notícias" />
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
                      fontFamily: 'Poppins',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.15)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--blue-medium)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--blue-medium)',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.8rem',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1, 
                      fontSize: '0.8rem', 
                      fontFamily: 'Poppins',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}
                  >
                    Conteúdo da Notícia *
                  </Typography>
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Digite o conteúdo da notícia..."
                    enableImageUpload={true}
                    pageId="velonews"
                    rows={5}
                    onVideoChange={(video) => {
                      setAttachedVideos(prev => [...prev, video]);
                    }}
                    onVideoRemove={(index) => {
                      setAttachedVideos(prev => prev.filter((_, i) => i !== index));
                    }}
                    attachedVideos={attachedVideos}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isCritical}
                      onChange={handleInputChange('isCritical')}
                      sx={{
                        color: '#d32f2f',
                        '&.Mui-checked': {
                          color: '#d32f2f',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ 
                      fontFamily: 'Poppins', 
                      fontWeight: 500,
                      color: 'var(--gray)',
                    }}>
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

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            color: 'var(--gray)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle 
          id="delete-dialog-title" 
          sx={{ 
            fontFamily: 'Poppins', 
            fontSize: '0.96rem',
            color: 'var(--gray)',
            backgroundColor: 'var(--cor-container)',
          }}
        >
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--cor-container)' }}>
          <DialogContentText 
            id="delete-dialog-description" 
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.8rem',
              color: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            Tem certeza que deseja deletar a notícia "{editFormData.titulo}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'var(--cor-container)', px: 2.4, pb: 2.4 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.8rem',
              color: 'var(--gray)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteVelonews} 
            color="error" 
            variant="contained"
            disabled={loading}
            sx={{ 
              fontFamily: 'Poppins', 
              fontSize: '0.8rem',
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {loading ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tab 1: Gerenciar Notícias */}
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
                            fontSize: '0.8rem',
                            backgroundColor: 'var(--cor-container)',
                            color: 'var(--gray)',
                            '& fieldset': {
                              borderColor: 'rgba(0, 0, 0, 0.15)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'var(--blue-medium)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'var(--blue-medium)',
                            },
                            '& input': {
                              color: 'var(--gray)',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              '& input': {
                                color: 'rgba(0, 0, 0, 0.38)',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.8rem',
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                              color: 'var(--blue-medium)',
                            },
                            '&.Mui-disabled': {
                              color: 'rgba(0, 0, 0, 0.38)',
                            },
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Campo Conteúdo */}
                    <Grid item xs={12}>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1, 
                            fontSize: '0.8rem', 
                            fontFamily: 'Poppins',
                            color: 'rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          Conteúdo da Notícia *
                        </Typography>
                        <MarkdownEditor
                          value={editFormData.conteudo}
                          onChange={(value) => setEditFormData(prev => ({ ...prev, conteudo: value }))}
                          placeholder="Digite o conteúdo da notícia..."
                          enableImageUpload={true}
                          pageId="velonews"
                          rows={5}
                          onVideoChange={(video) => {
                            setEditAttachedVideos(prev => [...prev, video]);
                          }}
                          onVideoRemove={(index) => {
                            setEditAttachedVideos(prev => prev.filter((_, i) => i !== index));
                          }}
                          attachedVideos={editAttachedVideos}
                        />
                      </Box>
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
                                color: '#d32f2f',
                                '&.Mui-checked': {
                                  color: '#d32f2f',
                                },
                                '&.Mui-disabled': {
                                  color: 'rgba(0, 0, 0, 0.26)',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ 
                              fontFamily: 'Poppins', 
                              fontWeight: 500, 
                              fontSize: '0.8rem',
                              color: 'var(--gray)',
                            }}>
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
                            <Typography sx={{ 
                              fontFamily: 'Poppins', 
                              fontWeight: 500, 
                              fontSize: '0.8rem',
                              color: 'var(--gray)',
                            }}>
                              Resolvido
                            </Typography>
                          }
                        />
                      </Box>
                    </Grid>
                    
                    {/* Botões Salvar e Delete */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1.6 }}>
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
                        <Button
                          variant="contained"
                          disabled={!selectedNews || loading}
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
                  placeholder="Pesquisar notícias..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ 
                    mb: 1.6,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--cor-container)',
                      color: 'var(--gray)',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.15)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--blue-medium)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--blue-medium)',
                      },
                      '& input': {
                        color: 'var(--gray)',
                        '&::placeholder': {
                          color: 'rgba(0, 0, 0, 0.5)',
                          opacity: 1,
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                    }
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 0.8, color: 'var(--blue-medium)', fontSize: '0.8rem' }} />
                  }}
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1.6, fontSize: '0.64rem', color: 'var(--gray)', fontFamily: 'Poppins' }}>
                  {filteredNews.length} notícia(s) encontrada(s)
                </Typography>
                
                {/* Lista de Notícias - key força remount quando filtro muda (garante sincronia contador/lista) */}
                <Box
                  key={`news-list-${searchTerm}-${filteredNews.length}`}
                  sx={{ 
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
                          
                          {news.conteudo && (
                            <MarkdownRenderer 
                              content={news.conteudo} 
                              maxLength={80}
                              sx={{ fontSize: '0.64rem', color: 'var(--gray)', mb: 0.8 }}
                            />
                          )}
                          
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
