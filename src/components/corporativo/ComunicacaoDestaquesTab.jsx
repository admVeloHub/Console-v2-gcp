// VERSION: v1.0.1 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Save,
  Upload,
  ArrowUpward,
  ArrowDownward,
  Close,
  Add,
} from '@mui/icons-material';
import { corporativoBannerAPI } from '../../services/corporativoAPI';

const CARD_SX = {
  backgroundColor: 'var(--cor-container)',
  boxShadow: 'none',
  transition: 'none',
  '&:hover': { boxShadow: 'none', transform: 'none' },
};

const normalizeData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.success && response?.data !== undefined) return response.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

const toBannerItem = (image) => ({
  url: image.url || image.name || '',
  name: image.logicalPath || image.fileName || image.name || image.url || '',
  type: image.type || 'image',
  href: image.href ?? null,
});

const ComunicacaoDestaquesTab = () => {
  const [bucketImages, setBucketImages] = useState([]);
  const [selectedSlides, setSelectedSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [bucketRes, bannerRes] = await Promise.all([
        corporativoBannerAPI.listBucketImages(),
        corporativoBannerAPI.get(),
      ]);
      const images = normalizeData(bucketRes) || [];
      setBucketImages(Array.isArray(images) ? images : []);

      const bannerDoc = normalizeData(bannerRes);
      const bannerImg = bannerDoc?.bannerImg;
      setSelectedSlides(Array.isArray(bannerImg) ? bannerImg.map(toBannerItem) : []);
    } catch (err) {
      showMessage(err.message || 'Erro ao carregar destaques', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await corporativoBannerAPI.uploadImage(file);
      const uploaded = normalizeData(res);
      await loadAll();
      showMessage('Imagem enviada com sucesso');
      if (uploaded?.url) {
        setSelectedSlides((prev) => [
          ...prev,
          toBannerItem({ url: uploaded.url, name: uploaded.fileName || file.name }),
        ]);
      }
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || 'Erro no upload', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addSlide = (image) => {
    const item = toBannerItem(image);
    if (selectedSlides.some((s) => s.url === item.url)) {
      showMessage('Imagem já está nos slides', 'warning');
      return;
    }
    setSelectedSlides((prev) => [...prev, item]);
  };

  const removeSlide = (index) => {
    setSelectedSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSlide = (index, direction) => {
    setSelectedSlides((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await corporativoBannerAPI.save(selectedSlides);
      showMessage('Banner salvo com sucesso');
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || 'Erro ao salvar banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={CARD_SX}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.95rem', color: 'var(--blue-dark)' }}>
              Slides do Banner ({selectedSlides.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<Upload />}
                disabled={uploading}
                sx={{ fontFamily: 'Poppins', borderColor: 'var(--blue-medium)', color: 'var(--blue-medium)' }}
              >
                {uploading ? 'Enviando…' : 'Upload Imagem'}
                <input type="file" hidden accept="image/*" onChange={handleUpload} />
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
              >
                {saving ? 'Salvando…' : 'Salvar Banner'}
              </Button>
            </Box>
          </Box>

          {selectedSlides.length === 0 ? (
            <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', mb: 2 }}>
              Nenhum slide selecionado. Escolha imagens do bucket abaixo.
            </Alert>
          ) : (
            <Box sx={{ mb: 3 }}>
              {selectedSlides.map((slide, index) => (
                <Box
                  key={`${slide.url}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1.6,
                    p: 1.6,
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--cor-container)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--blue-dark)',
                      minWidth: 28,
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Box
                    component="img"
                    src={slide.url}
                    alt={slide.name || `Slide ${index + 1}`}
                    sx={{ width: 120, height: 68, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                  />
                  <TextField
                    size="small"
                    label="Link (opcional)"
                    value={slide.href || ''}
                    onChange={(e) => {
                      const href = e.target.value;
                      setSelectedSlides((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, href: href || null } : s))
                      );
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': { fontFamily: 'Poppins', fontSize: '0.75rem' },
                      '& .MuiInputLabel-root': { fontFamily: 'Poppins', fontSize: '0.75rem' },
                    }}
                  />
                  <IconButton size="small" onClick={() => moveSlide(index, -1)} disabled={index === 0}>
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveSlide(index, 1)}
                    disabled={index === selectedSlides.length - 1}
                  >
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => removeSlide(index)} sx={{ color: '#d32f2f' }}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', color: 'var(--blue-dark)', mb: 1.6, mt: 2 }}>
        Imagens no Bucket
      </Typography>
      <Grid container spacing={2}>
        {bucketImages.map((img) => (
          <Grid item xs={6} sm={4} md={3} key={img.fileName || img.url}>
            <Card sx={{ ...CARD_SX, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Box
                component="img"
                src={img.url}
                alt={img.name || img.fileName}
                sx={{ width: '100%', height: 100, objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.65rem',
                    color: 'var(--gray)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.8,
                  }}
                >
                  {img.name || img.fileName}
                </Typography>
                <Button
                  fullWidth
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addSlide(img)}
                  sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', color: 'var(--blue-medium)' }}
                >
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {bucketImages.length === 0 && (
        <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', mt: 2 }}>
          Nenhuma imagem no bucket. Faça upload para começar.
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default ComunicacaoDestaquesTab;
