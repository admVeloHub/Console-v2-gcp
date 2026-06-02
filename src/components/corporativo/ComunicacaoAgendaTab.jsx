// VERSION: v1.0.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React, { useCallback, useEffect, useState } from 'react';
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
  Switch,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { corporativoAgendaAPI } from '../../services/corporativoAPI';

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
    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.15)' },
    '&:hover fieldset': { borderColor: 'var(--blue-medium)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--blue-medium)' },
  },
};

const EMPTY_FORM = {
  id: '',
  titulo: '',
  inicio: '',
  fim: '',
  url: '',
  ativo: true,
};

const normalizeData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.success && response?.data !== undefined) return response.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

const toDatetimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDisplay = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ComunicacaoAgendaTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await corporativoAgendaAPI.getAll();
      setItems(normalizeData(res) || []);
    } catch (err) {
      showMessage(err.message || 'Erro ao carregar agenda', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setFormData({
      id: item._id,
      titulo: item.titulo || '',
      inicio: toDatetimeLocal(item.inicio),
      fim: toDatetimeLocal(item.fim),
      url: item.url || '',
      ativo: item.ativo !== false,
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.inicio) {
      showMessage('Título e início são obrigatórios', 'warning');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        titulo: formData.titulo.trim(),
        inicio: new Date(formData.inicio).toISOString(),
        fim: formData.fim ? new Date(formData.fim).toISOString() : null,
        url: formData.url.trim(),
        ativo: formData.ativo,
      };

      if (formData.id) {
        await corporativoAgendaAPI.update(formData.id, payload);
        showMessage('Compromisso atualizado');
      } else {
        await corporativoAgendaAPI.create(payload);
        showMessage('Compromisso criado');
      }
      handleClose();
      await loadItems();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este compromisso?')) return;
    try {
      await corporativoAgendaAPI.delete(id);
      showMessage('Compromisso excluído');
      await loadItems();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || 'Erro ao excluir', 'error');
    }
  };

  const handleToggleAtivo = async (item) => {
    try {
      await corporativoAgendaAPI.update(item._id, { ativo: !(item.ativo !== false) });
      await loadItems();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || 'Erro ao alterar status', 'error');
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={openCreate}
          sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
        >
          Novo Compromisso
        </Button>
      </Box>

      <Card sx={CARD_SX}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {items.length === 0 ? (
            <Alert severity="info" sx={{ m: 2, fontFamily: 'Poppins', fontSize: '0.8rem' }}>
              Nenhum compromisso na agenda.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', backgroundColor: 'var(--cor-container)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Título</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Início</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Fim</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>URL</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }} align="center">Ativo</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }} align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>{item.titulo}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'var(--gray)' }}>
                        {formatDisplay(item.inicio)}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'var(--gray)' }}>
                        {formatDisplay(item.fim)}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-medium)' }}>
                            {item.url}
                          </a>
                        ) : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={item.ativo !== false}
                          onChange={() => handleToggleAtivo(item)}
                          size="small"
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--blue-medium)' } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: 'var(--blue-medium)' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item._id)} sx={{ color: '#d32f2f' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', color: 'var(--blue-dark)' }}>
          {formData.id ? 'Editar Compromisso' : 'Novo Compromisso'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData((p) => ({ ...p, titulo: e.target.value }))}
            size="small"
            required
            sx={{ ...TEXT_FIELD_SX, mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Início"
            type="datetime-local"
            value={formData.inicio}
            onChange={(e) => setFormData((p) => ({ ...p, inicio: e.target.value }))}
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            sx={{ ...TEXT_FIELD_SX, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Fim (opcional)"
            type="datetime-local"
            value={formData.fim}
            onChange={(e) => setFormData((p) => ({ ...p, fim: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ ...TEXT_FIELD_SX, mb: 2 }}
          />
          <TextField
            fullWidth
            label="URL"
            value={formData.url}
            onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
            size="small"
            sx={{ ...TEXT_FIELD_SX, mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.ativo}
                onChange={(e) => setFormData((p) => ({ ...p, ativo: e.target.checked }))}
              />
            }
            label={
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: 'var(--gray)' }}>
                Ativo
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ fontFamily: 'Poppins' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ComunicacaoAgendaTab;
