// VERSION: v3.8.1 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Tab,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Save, Search, Delete } from '@mui/icons-material';
import { artigosAPI } from '../services/api';
import BackButton from '../components/common/BackButton';
import MarkdownEditor from '../components/common/MarkdownEditor';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { processImageUploads, countTemporaryImages } from '../utils/imageUploadProcessor';
import { clearAllTemporaryImages } from '../utils/imageStorage';

const ArtigosPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    tag: '',                    // Campo obrigatório do schema
    artigo_titulo: '',
    artigo_conteudo: '',
    categoria_id: '',
    categoria_titulo: ''
  });
  const [attachedVideos, setAttachedVideos] = useState([]);

  // Estados para a aba "Gerenciar Artigos"
  const [artigosList, setArtigosList] = useState([]);
  const [filteredArtigos, setFilteredArtigos] = useState([]);
  const [selectedArtigo, setSelectedArtigo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFormData, setEditFormData] = useState({
    id: '',
    tag: '',
    artigo_titulo: '',
    artigo_conteudo: '',
    categoria_id: '',
    categoria_titulo: ''
  });
  const [editAttachedVideos, setEditAttachedVideos] = useState([]);
  const [loadingArtigos, setLoadingArtigos] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

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
      // Processar uploads de imagens temporárias antes de salvar
      let processedContent = formData.artigo_conteudo;
      let imageFileNames = [];
      const imageCount = countTemporaryImages(formData.artigo_conteudo);
      
      if (imageCount > 0) {
        console.log(`📤 Processando ${imageCount} imagem(ns) antes de salvar...`);
        const result = await processImageUploads(formData.artigo_conteudo, 'artigos', (current, total) => {
          console.log(`⬆️ Upload de imagem ${current}/${total}`);
        });
        processedContent = result.markdown;
        imageFileNames = result.imageFileNames;
        console.log('✅ Todas imagens processadas com sucesso');
        console.log(`📋 Caminhos relativos para media.images:`, imageFileNames);
      }

      // Extrair URLs dos vídeos anexados
      const videoUrls = attachedVideos.map(v => v.url);

      const dataToSubmit = {
        ...formData,
        artigo_conteudo: processedContent, // Conteúdo com URLs do GCS
        media: {                           // Objeto de mídia
          images: imageFileNames,          // Array de caminhos relativos das imagens no GCS
          videos: videoUrls                // Array de URLs dos vídeos do YouTube
        }
      };

      await artigosAPI.create(dataToSubmit);
      
      // Limpar imagens temporárias do localStorage após sucesso
      clearAllTemporaryImages('artigos');
      
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
      setAttachedVideos([]);
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

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Funções para a aba "Gerenciar Artigos"
  
  // 1. Carregar Lista de Artigos
  const loadArtigosList = useCallback(async () => {
    try {
      setLoadingArtigos(true);
      const response = await artigosAPI.getAll();
      
      // Extrair array de dados - backend retorna { success: true, data: [...] }
      let artigosArray = [];
      if (Array.isArray(response)) {
        artigosArray = response;
      } else if (response && response.success && Array.isArray(response.data)) {
        artigosArray = response.data;
      } else if (response && Array.isArray(response.data)) {
        artigosArray = response.data;
      } else {
        console.error('Resposta não é um array:', response);
        setArtigosList([]);
        setFilteredArtigos([]);
        return;
      }
      
      // Ordenar por data (mais recente primeiro) com validação
      const sorted = artigosArray.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        // Validar datas
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn('Data inválida encontrada:', { 
            a: a.createdAt, 
            b: b.createdAt,
            tituloA: a.artigo_titulo,
            tituloB: b.artigo_titulo
          });
          return 0;
        }
        
        return dateB - dateA; // Mais recente primeiro
      });
      
      setArtigosList(sorted);
      setFilteredArtigos(sorted);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar artigos',
        severity: 'error'
      });
    } finally {
      setLoadingArtigos(false);
    }
  }, []);

  // 2. Pesquisar Artigos
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredArtigos(artigosList);
      return;
    }
    
    const filtered = artigosList.filter(artigo =>
      artigo.artigo_titulo?.toLowerCase().includes(term.toLowerCase()) ||
      artigo.artigo_conteudo?.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredArtigos(filtered);
  };

  // 3. Selecionar Artigo para Edição
  const handleSelectArtigo = (artigo) => {
    setSelectedArtigo(artigo);
    
    // Normalizar categoria_id para garantir que corresponda exatamente a um dos valores disponíveis
    let normalizedCategoriaId = artigo.categoria_id || '';
    if (normalizedCategoriaId) {
      // Buscar categoria correspondente (case-insensitive)
      const matchingCategory = categories.find(cat => 
        cat.categoria_id.toLowerCase() === normalizedCategoriaId.toLowerCase()
      );
      if (matchingCategory) {
        normalizedCategoriaId = matchingCategory.categoria_id; // Usar o valor exato da lista
      } else {
        // Se não encontrar correspondência, usar o valor original ou vazio
        normalizedCategoriaId = '';
      }
    }
    
    setEditFormData({
      id: artigo._id,
      tag: artigo.tag || '',
      artigo_titulo: artigo.artigo_titulo || '',
      artigo_conteudo: artigo.artigo_conteudo || '',
      categoria_id: normalizedCategoriaId,
      categoria_titulo: categories.find(cat => cat.categoria_id === normalizedCategoriaId)?.categoria_titulo || artigo.categoria_titulo || ''
    });
    
    // Carregar vídeos existentes
    if (artigo.media && artigo.media.videos && Array.isArray(artigo.media.videos)) {
      const videos = artigo.media.videos.map(url => ({
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

  // 4. Atualizar Artigo
  const handleUpdateArtigo = async (event) => {
    event.preventDefault();
    
    if (!editFormData.id) {
      setSnackbar({
        open: true,
        message: 'Selecione um artigo para editar',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Processar uploads de imagens temporárias antes de atualizar
      let processedContent = editFormData.artigo_conteudo;
      let imageFileNames = [];
      const imageCount = countTemporaryImages(editFormData.artigo_conteudo);
      
      if (imageCount > 0) {
        console.log(`📤 Processando ${imageCount} imagem(ns) antes de atualizar...`);
        const result = await processImageUploads(editFormData.artigo_conteudo, 'artigos', (current, total) => {
          console.log(`⬆️ Upload de imagem ${current}/${total}`);
        });
        processedContent = result.markdown;
        imageFileNames = result.imageFileNames;
        console.log('✅ Todas imagens processadas com sucesso');
        console.log(`📋 Caminhos relativos para media.images:`, imageFileNames);
      }
      
      // Extrair URLs dos vídeos anexados
      const videoUrls = editAttachedVideos.map(v => v.url);
      
      // Payload conforme schema MongoDB
      const updateData = {
        tag: editFormData.tag,
        artigo_titulo: editFormData.artigo_titulo,
        artigo_conteudo: processedContent, // Conteúdo com URLs do GCS
        categoria_id: editFormData.categoria_id,
        categoria_titulo: editFormData.categoria_titulo,
        media: {                           // Objeto de mídia
          images: imageFileNames.length > 0 ? imageFileNames : (selectedArtigo?.media?.images || []), // Preservar imagens existentes se não houver novas
          videos: videoUrls                // Array de URLs dos vídeos do YouTube
        }
      };
      
      await artigosAPI.update(editFormData.id, updateData);
      
      // Limpar imagens temporárias do localStorage após sucesso
      clearAllTemporaryImages('artigos');
      
      setSnackbar({
        open: true,
        message: 'Artigo atualizado com sucesso!',
        severity: 'success'
      });
      
      // Recarregar lista
      await loadArtigosList();
      
      // Limpar seleção
      setSelectedArtigo(null);
      setEditFormData({
        id: '',
        tag: '',
        artigo_titulo: '',
        artigo_conteudo: '',
        categoria_id: '',
        categoria_titulo: ''
      });
      setEditAttachedVideos([]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao atualizar artigo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. Deletar Artigo
  const handleDeleteArtigo = async () => {
    if (!editFormData.id) {
      setSnackbar({
        open: true,
        message: 'Selecione um artigo para deletar',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      await artigosAPI.delete(editFormData.id);
      
      setSnackbar({
        open: true,
        message: 'Artigo deletado com sucesso!',
        severity: 'success'
      });
      
      // Recarregar lista
      await loadArtigosList();
      
      // Limpar seleção
      setSelectedArtigo(null);
      setEditFormData({
        id: '',
        tag: '',
        artigo_titulo: '',
        artigo_conteudo: '',
        categoria_id: '',
        categoria_titulo: ''
      });
      
      // Fechar diálogo
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao deletar artigo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 6. useEffect para Carregar Dados
  useEffect(() => {
    if (activeTab === 1) {
      loadArtigosList();
    }
  }, [activeTab, loadArtigosList]);


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
            onChange={handleTabChange}
            aria-label="artigos tabs"
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
            <Tab
              label="Adicionar Artigo"
              id="artigos-tab-0"
              aria-controls="artigos-tabpanel-0"
            />
            <Tab
              label="Gerenciar Artigos"
              id="artigos-tab-1"
              aria-controls="artigos-tabpanel-1"
            />
          </Tabs>
        </Box>
      </Box>

      {/* Conteúdo das Abas - Renderização Condicional Direta */}
      {activeTab === 0 && (
        <Box sx={{ pt: 2.4 }}>
          <Card sx={{ 
            background: 'var(--cor-container)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent sx={{ p: 3.2 }}>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.4}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título do Artigo"
                      value={formData.artigo_titulo}
                      onChange={handleInputChange('artigo_titulo')}
                      required
                      sx={{
                        '& .MuiInputLabel-root': {
                          fontSize: '0.8rem',
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.12)',
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
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ fontSize: '0.8rem' }}>Categoria</InputLabel>
                      <Select
                        value={formData.categoria_id}
                        onChange={handleInputChange('categoria_id')}
                        label="Categoria"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--blue-medium)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--blue-medium)',
                          },
                          '& .MuiSelect-select': {
                            fontSize: '0.8rem',
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
                        Conteúdo do Artigo *
                      </Typography>
                      <MarkdownEditor
                        value={formData.artigo_conteudo}
                        onChange={(value) => setFormData(prev => ({ ...prev, artigo_conteudo: value }))}
                        placeholder="Digite o conteúdo do artigo..."
                        enableImageUpload={true}
                        pageId="artigos"
                        rows={6}
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        startIcon={<Save />}
                        disabled={loading}
                        sx={{
                          backgroundColor: 'var(--blue-medium)',
                          '&:hover': {
                            backgroundColor: 'var(--blue-dark)',
                          },
                          fontSize: '0.8rem',
                          px: 2.4,
                          py: 0.8
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
        </Box>
      )}

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
                  {selectedArtigo ? 'Editar Artigo' : 'Selecione um artigo'}
                </Typography>
                
                <form onSubmit={handleUpdateArtigo}>
                  <Grid container spacing={2.4}>
                    {/* Campo Tag */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tag"
                        value={editFormData.tag}
                        onChange={(e) => setEditFormData({...editFormData, tag: e.target.value})}
                        disabled={!selectedArtigo}
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
                    
                    {/* Campo Título */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Título do Artigo"
                        value={editFormData.artigo_titulo}
                        onChange={(e) => setEditFormData({...editFormData, artigo_titulo: e.target.value})}
                        disabled={!selectedArtigo}
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
                    
                    {/* Campo Categoria */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth disabled={!selectedArtigo} required size="small">
                        <InputLabel sx={{ fontSize: '0.8rem' }}>Categoria</InputLabel>
                        <Select
                          value={editFormData.categoria_id}
                          label="Categoria"
                          onChange={(e) => {
                            const selectedCategory = categories.find(cat => cat.categoria_id === e.target.value);
                            setEditFormData({
                              ...editFormData,
                              categoria_id: e.target.value,
                              categoria_titulo: selectedCategory ? selectedCategory.categoria_titulo : ''
                            });
                          }}
                          sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.categoria_id} value={category.categoria_id}>
                              {category.categoria_titulo}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                          Conteúdo do Artigo *
                        </Typography>
                        <MarkdownEditor
                          value={editFormData.artigo_conteudo}
                          onChange={(value) => setEditFormData(prev => ({ ...prev, artigo_conteudo: value }))}
                          placeholder="Digite o conteúdo do artigo..."
                          enableImageUpload={true}
                          pageId="artigos"
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
                    
                    {/* Botões Salvar e Delete */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1.6 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!selectedArtigo || loading}
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
                          disabled={!selectedArtigo || loading}
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
                  placeholder="Pesquisar artigos..."
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
                  {filteredArtigos.length} artigo(s) encontrado(s)
                </Typography>
                
                {/* Lista de Artigos */}
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
                  {loadingArtigos ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
                    </Box>
                  ) : filteredArtigos.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: 'var(--gray)', fontFamily: 'Poppins' }}>
                      Nenhum artigo encontrado
                    </Typography>
                  ) : (
                    filteredArtigos.map((artigo) => (
                      <Card
                        key={artigo._id}
                        onClick={() => handleSelectArtigo(artigo)}
                        sx={{
                          mb: 1.6,
                          cursor: 'pointer',
                          border: selectedArtigo?._id === artigo._id ? '2px solid var(--blue-medium)' : '1px solid var(--gray)',
                          backgroundColor: selectedArtigo?._id === artigo._id ? 'rgba(22, 148, 255, 0.1)' : 'transparent',
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
                              {artigo.artigo_titulo}
              </Typography>
                          </Box>
                          
                          {artigo.categoria_titulo && (
                            <Chip 
                              label={artigo.categoria_titulo} 
                              size="small"
                              sx={{ 
                                fontFamily: 'Poppins', 
                                fontSize: '0.56rem',
                                height: '20px',
                                mb: 0.8,
                                backgroundColor: 'var(--blue-medium)',
                                color: 'white',
                                '& .MuiChip-label': {
                                  px: 0.8
                                }
                              }}
                            />
                          )}
                          
                          {artigo.artigo_conteudo && (
                            <MarkdownRenderer 
                              content={artigo.artigo_conteudo} 
                              maxLength={80}
                              sx={{ fontSize: '0.64rem', color: 'var(--gray)', mb: 0.8 }}
                            />
                          )}
                          
                          <Typography variant="caption" sx={{ fontSize: '0.64rem', color: 'var(--gray)', fontFamily: 'Poppins', display: 'block' }}>
                            {new Date(artigo.createdAt).toLocaleDateString('pt-BR', {
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
            Tem certeza que deseja deletar o artigo "{editFormData.artigo_titulo}"? Esta ação não pode ser desfeita.
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
            onClick={handleDeleteArtigo} 
            color="error" 
            variant="contained"
            disabled={loading}
            sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
          >
            {loading ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>

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