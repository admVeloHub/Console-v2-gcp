// VERSION: v1.3.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.3.0 - Exclusão de aviso (UI + corporativoAvisosAPI.delete); hub_avisos
// CHANGELOG: v1.2.0 - Upload de imagens via processImageUploads (GCS img_avisos/) antes de salvar aviso
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import { Save, Add, Search, Delete } from '@mui/icons-material';
import { corporativoAvisosAPI } from '../../services/corporativoAPI';
import MarkdownEditor from '../common/MarkdownEditor';
import { processImageUploads, countTemporaryImages } from '../../utils/imageUploadProcessor';
import { clearAllTemporaryImages } from '../../utils/imageStorage';

const CARD_SX = {
  backgroundColor: 'var(--cor-container)',
  boxShadow: 'none',
  transition: 'none',
  '&:hover': { boxShadow: 'none', transform: 'none' },
};

const TEXT_FIELD_SX = {
  '& .MuiInputLabel-root': { fontSize: '0.8rem', fontFamily: 'Poppins' },
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Poppins',
    fontSize: '0.8rem',
    backgroundColor: 'var(--cor-container)',
    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.15)' },
    '&:hover fieldset': { borderColor: 'var(--blue-medium)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--blue-medium)' },
  },
};

const EMPTY_FORM = {
  id: '',
  titulo: '',
  conteudo: '',
};

const normalizeData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.success && response?.data !== undefined) return response.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

/** Extrai caminhos relativos GCS de hub_avisos.media (array ou { images }) */
const extractExistingImagePaths = (media) => {
  if (Array.isArray(media)) {
    return media
      .filter((m) => m?.type === 'image' || !m?.type)
      .map((m) => (typeof m === 'string' ? m : m?.url || m?.name))
      .filter(Boolean);
  }
  if (media?.images && Array.isArray(media.images)) {
    return media.images.filter(Boolean);
  }
  return [];
};

const ComunicacaoAvisosTab = () => {
  const [avisosList, setAvisosList] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await corporativoAvisosAPI.getAll();
      const rows = normalizeData(res) || [];
      const sorted = [...rows].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setAvisosList(sorted);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Erro ao carregar avisos',
        severity: 'error',
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const filteredAvisos = useMemo(() => {
    if (!searchTerm.trim()) return avisosList;
    const term = searchTerm.toLowerCase();
    return avisosList.filter(
      (a) =>
        a.titulo?.toLowerCase().includes(term) ||
        a.conteudo?.toLowerCase().includes(term)
    );
  }, [avisosList, searchTerm]);

  const handleSelect = (aviso) => {
    setSelectedId(aviso._id);
    setSelectedMedia(aviso.media || null);
    setFormData({
      id: aviso._id,
      titulo: aviso.titulo || '',
      conteudo: aviso.conteudo || '',
    });
  };

  const handleNovoAviso = () => {
    setSelectedId(null);
    setSelectedMedia(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      setSnackbar({ open: true, message: 'Título é obrigatório', severity: 'warning' });
      return;
    }
    try {
      setLoading(true);

      let processedContent = formData.conteudo;
      let imageFileNames = [];
      const imageCount = countTemporaryImages(formData.conteudo);

      if (imageCount > 0) {
        const result = await processImageUploads(formData.conteudo, 'avisos', (current, total) => {
          console.log(`⬆️ Upload aviso ${current}/${total}`);
        });
        processedContent = result.markdown;
        imageFileNames = result.imageFileNames;
      }

      const existingImages = extractExistingImagePaths(selectedMedia);
      const mergedImages =
        imageFileNames.length > 0
          ? [...new Set([...existingImages, ...imageFileNames])]
          : existingImages;

      const payload = {
        titulo: formData.titulo.trim(),
        conteudo: processedContent,
        media: {
          images: mergedImages,
          videos: [],
        },
      };

      if (formData.id) {
        await corporativoAvisosAPI.update(formData.id, payload);
        setSelectedMedia(payload.media);
        setSnackbar({ open: true, message: 'Aviso atualizado com sucesso', severity: 'success' });
      } else {
        const res = await corporativoAvisosAPI.create(payload);
        const created = normalizeData(res);
        if (created?._id) {
          setFormData((p) => ({ ...p, id: created._id }));
          setSelectedId(created._id);
          setSelectedMedia(created.media || payload.media);
        }
        setSnackbar({ open: true, message: 'Aviso criado com sucesso', severity: 'success' });
      }

      clearAllTemporaryImages('avisos');
      await loadList();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || err.message || 'Erro ao salvar aviso',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (!window.confirm('Excluir este aviso?')) return;
    try {
      setLoading(true);
      await corporativoAvisosAPI.delete(formData.id);
      setSnackbar({ open: true, message: 'Aviso excluído', severity: 'success' });
      handleNovoAviso();
      await loadList();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || err.message || 'Erro ao excluir aviso',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 0 }}>
      {/* Lista 30% */}
      <Box sx={{ width: '30%' }}>
        <Card sx={{ ...CARD_SX, height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.6 }}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={handleNovoAviso}
                sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)', fontSize: '0.75rem' }}
              >
                Novo Aviso
              </Button>
            </Box>
            <TextField
              fullWidth
              placeholder="Pesquisar avisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ ...TEXT_FIELD_SX, mb: 1.6 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 0.8, color: 'var(--blue-medium)', fontSize: '0.8rem' }} />,
              }}
            />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.64rem', color: 'var(--gray)', mb: 1.6 }}>
              {filteredAvisos.length} aviso(s)
            </Typography>
            {loadingList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ maxHeight: '560px', overflowY: 'auto' }}>
                {filteredAvisos.map((aviso) => (
                  <Box
                    key={aviso._id}
                    onClick={() => handleSelect(aviso)}
                    sx={{
                      p: 1.2,
                      mb: 0.8,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border:
                        selectedId === aviso._id
                          ? '1px solid var(--blue-medium)'
                          : '1px solid rgba(0,0,0,0.08)',
                      backgroundColor:
                        selectedId === aviso._id ? 'rgba(22, 52, 255, 0.06)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(22, 52, 255, 0.04)' },
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: 'var(--blue-dark)',
                      }}
                    >
                      {aviso.titulo}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.6rem', color: 'var(--gray)' }}>
                      {aviso.createdAt
                        ? new Date(aviso.createdAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </Typography>
                  </Box>
                ))}
                {filteredAvisos.length === 0 && (
                  <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                    Nenhum aviso encontrado.
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Editor 70% */}
      <Box sx={{ width: '70%', pl: 2.5 }}>
        <Card sx={CARD_SX}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ mb: 2.4, fontSize: '0.96rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', fontWeight: 600 }}
            >
              {formData.id ? 'Editar Aviso' : 'Novo Aviso'}
            </Typography>

            <form onSubmit={handleSave}>
              <Grid container spacing={2.4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={formData.titulo}
                    onChange={(e) => setFormData((p) => ({ ...p, titulo: e.target.value }))}
                    required
                    size="small"
                    sx={TEXT_FIELD_SX}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontSize: '0.8rem', fontFamily: 'Poppins', color: 'rgba(0, 0, 0, 0.6)' }}
                  >
                    Conteúdo *
                  </Typography>
                  <MarkdownEditor
                    value={formData.conteudo}
                    onChange={(value) => setFormData((p) => ({ ...p, conteudo: value }))}
                    placeholder="Digite o conteúdo do aviso..."
                    enableImageUpload={true}
                    pageId="avisos"
                    rows={5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {formData.id ? (
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        disabled={loading}
                        onClick={handleDelete}
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '0.8rem',
                          borderColor: 'var(--red, #d32f2f)',
                          color: 'var(--red, #d32f2f)',
                          '&:hover': { borderColor: '#b71c1c', backgroundColor: 'rgba(211, 47, 47, 0.04)' },
                        }}
                      >
                        Excluir
                      </Button>
                    ) : null}
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{
                        backgroundColor: 'var(--blue-medium)',
                        color: 'white',
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        '&:hover': { backgroundColor: 'var(--blue-dark)' },
                      }}
                    >
                      {loading ? 'Salvando…' : formData.id ? 'Salvar Alterações' : 'Criar Aviso'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: 'Poppins' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComunicacaoAvisosTab;
