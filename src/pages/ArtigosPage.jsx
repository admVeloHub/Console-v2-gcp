// VERSION: v3.10.7 | DATE: 2026-04-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.10.7 - Cabeçalho Voltar/abas: VoltarHeaderRow (alinhamento global)
// CHANGELOG: v3.10.6 - Cards painel principal: sem sombra 3D; sem hover lift (MuiCard tema)
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  DialogActions,
  IconButton
} from '@mui/material';
import { Save, Search, Delete, Settings, Add, DeleteOutline } from '@mui/icons-material';
import { artigosAPI, artigosCategoriasAPI } from '../services/api';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import MarkdownEditor from '../components/common/MarkdownEditor';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { processImageUploads, countTemporaryImages } from '../utils/imageUploadProcessor';
import { clearAllTemporaryImages } from '../utils/imageStorage';
import {
  inserirCategoriaNaPosicao,
  renumerarOrdemRascunho,
  montarPayloadCategorias
} from '../utils/categoriaSlugUtils';

/** Painéis principais do módulo: anula boxShadow e hover do tema MuiCard. */
const CARD_PRINCIPAL_SX = {
  boxShadow: 'none',
  transition: 'none',
  '&:hover': {
    boxShadow: 'none',
    transform: 'none',
  },
};

function newDraftId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

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

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriasModalOpen, setCategoriasModalOpen] = useState(false);
  const [categoriasDraft, setCategoriasDraft] = useState([]);
  const [savingCategorias, setSavingCategorias] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await artigosCategoriasAPI.get();
      const list = res?.data?.Categorias;
      if (Array.isArray(list)) {
        const sorted = [...list].sort(
          (a, b) => (a.Ordem ?? a.ordem ?? 0) - (b.Ordem ?? b.ordem ?? 0)
        );
        setCategories(sorted);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao carregar categorias. Verifique se o seed foi executado no backend.',
        severity: 'error'
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /** Quando o usuário seleciona artigo antes das categorias carregarem, sincroniza uma vez ao chegar a lista */
  const pendingCategoriaNormalizeIdRef = useRef(null);

  useEffect(() => {
    if (!selectedArtigo || categories.length === 0 || !pendingCategoriaNormalizeIdRef.current) return;
    if (String(pendingCategoriaNormalizeIdRef.current) !== String(selectedArtigo._id)) return;
    pendingCategoriaNormalizeIdRef.current = null;

    const artigo = selectedArtigo;
    let normalizedCategoriaId = artigo.categoria_id || '';
    if (normalizedCategoriaId) {
      const matchingCategory = categories.find(
        (cat) => cat.categoria_id.toLowerCase() === normalizedCategoriaId.toLowerCase()
      );
      normalizedCategoriaId = matchingCategory ? matchingCategory.categoria_id : '';
    }
    setEditFormData((prev) => ({
      ...prev,
      categoria_id: normalizedCategoriaId,
      categoria_titulo:
        categories.find((cat) => cat.categoria_id === normalizedCategoriaId)?.categoria_titulo ||
        artigo.categoria_titulo ||
        ''
    }));
  }, [categories, selectedArtigo]);

  const openCategoriasModal = useCallback(() => {
    if (categories.length > 0) {
      const rows = categories.map((c, idx) => ({
        draftId: c.categoria_id || newDraftId(),
        ordem: idx + 1,
        categoria_titulo: c.categoria_titulo || ''
      }));
      setCategoriasDraft(rows);
    } else {
      setCategoriasDraft([{ draftId: newDraftId(), ordem: 1, categoria_titulo: '' }]);
    }
    setCategoriasModalOpen(true);
  }, [categories]);

  const atualizarRascunhoCategorias = useCallback((rows) => {
    setCategoriasDraft(renumerarOrdemRascunho(rows));
  }, []);

  const handleSaveCategoriasModal = useCallback(async () => {
    if (categoriasDraft.length === 0) {
      setSnackbar({
        open: true,
        message: 'Informe ao menos uma categoria.',
        severity: 'warning'
      });
      return;
    }
    let body;
    try {
      body = montarPayloadCategorias(categoriasDraft);
    } catch (e) {
      setSnackbar({
        open: true,
        message: e.message || 'Verifique os dados das categorias.',
        severity: 'warning'
      });
      return;
    }
    try {
      setSavingCategorias(true);
      await artigosCategoriasAPI.update(body);
      await loadCategories();
      setCategoriasModalOpen(false);
      setSnackbar({
        open: true,
        message: 'Categorias salvas com sucesso.',
        severity: 'success'
      });
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.message ||
        'Erro ao salvar categorias';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error'
      });
    } finally {
      setSavingCategorias(false);
    }
  }, [categoriasDraft, loadCategories]);

  const categoriasGearIconButtonSx = {
    flexShrink: 0,
    alignSelf: 'flex-start',
    mt: '4px',
    color: 'secondary.main',
    border: '1px solid',
    borderColor: 'secondary.main',
    borderRadius: '4px',
    '&:hover': {
      borderColor: 'secondary.main',
      backgroundColor: 'rgba(0, 106, 185, 0.08)'
    }
  };

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

  // 2. Lista filtrada derivada de searchTerm e artigosList (sincroniza contador e lista)
  const filteredArtigos = useMemo(() => {
    if (!searchTerm.trim()) return artigosList;
    const term = searchTerm.toLowerCase();
    return artigosList.filter(artigo =>
      artigo.artigo_titulo?.toLowerCase().includes(term) ||
      artigo.artigo_conteudo?.toLowerCase().includes(term) ||
      artigo.tag?.toLowerCase().includes(term) ||
      artigo.categoria_titulo?.toLowerCase().includes(term)
    );
  }, [searchTerm, artigosList]);

  // 3. Pesquisar Artigos
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // 4. Selecionar Artigo para Edição
  const handleSelectArtigo = useCallback((artigo) => {
    setSelectedArtigo(artigo);
    if (categories.length === 0) {
      pendingCategoriaNormalizeIdRef.current = artigo._id;
    } else {
      pendingCategoriaNormalizeIdRef.current = null;
    }

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
  }, [categories]);

  // 5. Atualizar Artigo
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

  // 6. Deletar Artigo
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

  // 7. useEffect para Carregar Dados
  useEffect(() => {
    if (activeTab === 1) {
      loadArtigosList();
    }
  }, [activeTab, loadArtigosList]);


  return (
    <Container maxWidth="xl" sx={{ py: 3.2, mb: 6.4, pb: 3.2 }}>
      <VoltarHeaderRow
        left={<BackButton />}
        center={
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
        }
      />

      {/* Conteúdo das Abas - Renderização Condicional Direta */}
      {activeTab === 0 && (
        <Box sx={{ pt: 2.4 }}>
          <Card sx={{
            background: 'var(--cor-container)',
            borderRadius: '6px',
            ...CARD_PRINCIPAL_SX,
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
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <FormControl fullWidth required disabled={categoriesLoading || categories.length === 0} sx={{ flex: 1 }}>
                        <InputLabel sx={{ fontSize: '0.8rem' }}>Categoria</InputLabel>
                        <Select
                          value={formData.categoria_id}
                          onChange={handleInputChange('categoria_id')}
                          label="Categoria"
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 0, 0, 0.15)',
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
                      <IconButton
                        aria-label="Gerenciar categorias"
                        color="secondary"
                        onClick={openCategoriasModal}
                        size="small"
                        sx={categoriasGearIconButtonSx}
                      >
                        <Settings fontSize="small" />
                      </IconButton>
                    </Box>
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
            <Card sx={{ backgroundColor: 'var(--cor-container)', ...CARD_PRINCIPAL_SX }}>
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
                    
                    {/* Campo Categoria */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <FormControl fullWidth disabled={!selectedArtigo || categoriesLoading || categories.length === 0} required size="small" sx={{ flex: 1 }}>
                          <InputLabel sx={{ 
                            fontSize: '0.8rem',
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                              color: 'var(--blue-medium)',
                            },
                            '&.Mui-disabled': {
                              color: 'rgba(0, 0, 0, 0.38)',
                            },
                          }}>Categoria</InputLabel>
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
                            sx={{ 
                              fontFamily: 'Poppins', 
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--cor-container)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.15)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--blue-medium)',
                              },
                              '& .MuiSelect-select': {
                                color: 'var(--gray)',
                              },
                              '&.Mui-disabled': {
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                '& .MuiSelect-select': {
                                  color: 'rgba(0, 0, 0, 0.38)',
                                },
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
                        <IconButton
                          aria-label="Gerenciar categorias"
                          color="secondary"
                          onClick={openCategoriasModal}
                          size="small"
                          sx={categoriasGearIconButtonSx}
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Box>
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
            <Card sx={{ backgroundColor: 'var(--cor-container)', height: '100%', ...CARD_PRINCIPAL_SX }}>
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
                  {filteredArtigos.length} artigo(s) encontrado(s)
                </Typography>
                
                {/* Lista de Artigos - key força remount quando filtro muda (garante sincronia contador/lista) */}
                <Box
                  key={`artigos-list-${searchTerm}-${filteredArtigos.length}`}
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
        open={categoriasModalOpen}
        onClose={() => {
          if (!savingCategorias) setCategoriasModalOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        aria-labelledby="categorias-dialog-title"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            maxHeight: 'min(92vh, 760px)',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          id="categorias-dialog-title"
          sx={{
            fontFamily: 'Poppins',
            fontSize: '0.875rem',
            color: 'var(--gray)',
            flexShrink: 0,
            pb: 1,
            lineHeight: 1.3
          }}
        >
          Gerenciar categorias
        </DialogTitle>
        <DialogContent
          sx={{
            // Sobrescreve o padding-top: 0 do tema (.MuiDialogTitle-root + .MuiDialogContent-root)
            paddingTop: '16px !important',
            px: 2.4,
            pb: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0
          }}
        >
          <Box
            sx={{
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              flex: '1 1 auto',
              minHeight: 0,
              pr: 0.5,
              mr: -0.5,
              // espaço para labels dos OutlinedInput não serem cortados pelo overflow
              pt: 1.5,
              pb: 1,
              '&::-webkit-scrollbar': { width: 8 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 106, 185, 0.35)',
                borderRadius: '3.5px'
              }
            }}
          >
            {categoriasDraft.map((row) => (
              <Box
                key={row.draftId}
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 1.6,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <TextField
                  label="Ordenação"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={row.ordem === '' ? '' : row.ordem}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCategoriasDraft((prev) =>
                      prev.map((r) => {
                        if (r.draftId !== row.draftId) return r;
                        if (raw === '') return { ...r, ordem: '' };
                        const n = parseInt(raw, 10);
                        if (!Number.isFinite(n)) return r;
                        return { ...r, ordem: Math.max(1, n) };
                      })
                    );
                  }}
                  onBlur={() => {
                    setCategoriasDraft((prev) => {
                      const r = prev.find((x) => x.draftId === row.draftId);
                      if (!r) return prev;
                      let k = r.ordem;
                      if (k === '' || k === undefined) {
                        return inserirCategoriaNaPosicao(prev, row.draftId, prev.length);
                      }
                      const num =
                        typeof k === 'number' ? k : parseInt(String(k), 10);
                      if (!Number.isFinite(num)) {
                        return inserirCategoriaNaPosicao(prev, row.draftId, prev.length);
                      }
                      return inserirCategoriaNaPosicao(
                        prev,
                        row.draftId,
                        Math.max(1, num)
                      );
                    });
                  }}
                  size="small"
                  sx={{
                    width: 76,
                    flexShrink: 0,
                    '& .MuiInputLabel-root': { fontSize: '0.6875rem' },
                    '& .MuiOutlinedInput-input': { fontSize: '0.75rem', py: 0.8 }
                  }}
                />
                <TextField
                  label="Título da categoria"
                  value={row.categoria_titulo}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCategoriasDraft((prev) =>
                      prev.map((r) =>
                        r.draftId === row.draftId ? { ...r, categoria_titulo: v } : r
                      )
                    );
                  }}
                  size="small"
                  sx={{
                    flex: 1,
                    minWidth: 160,
                    '& .MuiInputLabel-root': { fontSize: '0.6875rem' },
                    '& .MuiOutlinedInput-input': { fontSize: '0.75rem', py: 0.8 }
                  }}
                />
                <IconButton
                  aria-label="Remover categoria"
                  size="small"
                  disabled={categoriasDraft.length <= 1}
                  onClick={() => {
                    const next = categoriasDraft.filter((r) => r.draftId !== row.draftId);
                    atualizarRascunhoCategorias(next);
                  }}
                  sx={{ color: 'rgba(0,0,0,0.45)' }}
                >
                  <DeleteOutline sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Button
            type="button"
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<Add sx={{ fontSize: '1rem' }} />}
            onClick={() => {
              const next = [
                ...categoriasDraft,
                {
                  draftId: newDraftId(),
                  ordem: categoriasDraft.length + 1,
                  categoria_titulo: ''
                }
              ];
              atualizarRascunhoCategorias(next);
            }}
            sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', mt: 1.2, flexShrink: 0, alignSelf: 'flex-start' }}
          >
            Adicionar
          </Button>
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.4,
            pb: 2.4,
            pt: 1,
            backgroundColor: 'var(--cor-container)',
            flexShrink: 0
          }}
        >
          <Button
            onClick={() => setCategoriasModalOpen(false)}
            disabled={savingCategorias}
            sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCategoriasModal}
            disabled={savingCategorias}
            sx={{
              fontFamily: 'Poppins',
              fontSize: '0.75rem',
              backgroundColor: 'var(--blue-medium)',
              '&:hover': { backgroundColor: 'var(--blue-dark)' }
            }}
          >
            {savingCategorias ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            color: 'var(--gray)',
            borderRadius: '6px',
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
            Tem certeza que deseja deletar o artigo "{editFormData.artigo_titulo}"? Esta ação não pode ser desfeita.
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
            onClick={handleDeleteArtigo} 
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