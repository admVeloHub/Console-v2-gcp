// VERSION: v1.0.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Save,
  Delete,
  UploadFile,
  Edit,
  Close,
} from '@mui/icons-material';
import { corporativoLegalAPI } from '../../services/corporativoAPI';

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

const normalizeData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.success && response?.data !== undefined) return response.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

const SectionEditor = ({ section, onSave, onDelete, saving }) => {
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(section.titulo || '');
  const [corpo, setCorpo] = useState(section.corpo || '');

  useEffect(() => {
    setTitulo(section.titulo || '');
    setCorpo(section.corpo || '');
  }, [section]);

  const handleSave = async () => {
    await onSave({ titulo, corpo });
    setEditing(false);
  };

  if (!editing) {
    return (
      <Box
        sx={{
          mb: 1.6,
          p: 1.6,
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '6px',
          backgroundColor: 'var(--cor-container)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', color: 'var(--blue-dark)' }}>
            {section.titulo}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => setEditing(true)} sx={{ color: 'var(--blue-medium)' }}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete} disabled={saving} sx={{ color: '#d32f2f' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'var(--gray)', whiteSpace: 'pre-wrap' }}>
          {section.corpo}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 1.6, p: 1.6, border: '1px solid var(--blue-medium)', borderRadius: '6px' }}>
      <TextField
        fullWidth
        label="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        size="small"
        sx={{ ...TEXT_FIELD_SX, mb: 1.6 }}
      />
      <TextField
        fullWidth
        label="Corpo"
        value={corpo}
        onChange={(e) => setCorpo(e.target.value)}
        multiline
        minRows={4}
        size="small"
        sx={TEXT_FIELD_SX}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 1.6, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={() => setEditing(false)} startIcon={<Close />} sx={{ fontFamily: 'Poppins' }}>
          Cancelar
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          disabled={saving || !titulo.trim()}
          startIcon={<Save />}
          sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
        >
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

const NovaVersaoDialog = ({ open, onClose, documentId, onCreated }) => {
  const [versao, setVersao] = useState('');
  const [file, setFile] = useState(null);
  const [previewSecoes, setPreviewSecoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setVersao('');
    setFile(null);
    setPreviewSecoes([]);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewSecoes([]);
    setError(null);
    try {
      setLoading(true);
      const res = await corporativoLegalAPI.previewDocx(documentId, selected);
      const secoes = res?.secoes || normalizeData(res);
      if (!Array.isArray(secoes) || secoes.length === 0) {
        setError('Nenhuma seção reconhecida no documento');
        return;
      }
      setPreviewSecoes(secoes);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao processar DOCX');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!versao.trim() || previewSecoes.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      await corporativoLegalAPI.createVersao(documentId, {
        versao: versao.trim(),
        secoes: previewSecoes,
      });
      onCreated();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao publicar versão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Poppins', color: 'var(--blue-dark)' }}>Nova Versão</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Versão"
          value={versao}
          onChange={(e) => setVersao(e.target.value)}
          size="small"
          sx={{ ...TEXT_FIELD_SX, mt: 1, mb: 2 }}
          placeholder="Ex: 1.0.0"
        />
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFile />}
          disabled={loading}
          sx={{ fontFamily: 'Poppins', mb: 2, borderColor: 'var(--blue-medium)', color: 'var(--blue-medium)' }}
        >
          Selecionar DOCX
          <input type="file" hidden accept=".docx" onChange={handleFileChange} />
        </Button>
        {file && (
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'var(--gray)', mb: 1 }}>
            Arquivo: {file.name}
          </Typography>
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: 'Poppins', fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}
        {previewSecoes.length > 0 && (
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', mb: 1 }}>
              Pré-visualização ({previewSecoes.length} seções)
            </Typography>
            {previewSecoes.map((sec, idx) => (
              <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                  {sec.titulo}
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', color: 'var(--gray)' }}>
                  {(sec.corpo || '').slice(0, 200)}{(sec.corpo || '').length > 200 ? '…' : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ fontFamily: 'Poppins' }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || !versao.trim() || previewSecoes.length === 0}
          sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
        >
          Confirmar e Publicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DocumentVersionPanel = ({ docDef, onNotify }) => {
  const [versoes, setVersoes] = useState([]);
  const [selectedVersaoId, setSelectedVersaoId] = useState('');
  const [versaoDoc, setVersaoDoc] = useState(null);
  const [loadingVersoes, setLoadingVersoes] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lgpdFieldTab, setLgpdFieldTab] = useState(0);
  const [novaVersaoOpen, setNovaVersaoOpen] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState({ titulo: '', corpo: '' });

  const isLgpd = docDef.kind === 'lgpd';
  const activeField = isLgpd ? (lgpdFieldTab === 0 ? 'publica' : 'corporativo') : 'corpo';

  const loadVersoes = useCallback(async () => {
    try {
      setLoadingVersoes(true);
      const res = await corporativoLegalAPI.getVersoes(docDef.documentId);
      const list = normalizeData(res) || [];
      setVersoes(Array.isArray(list) ? list : []);
      if (list.length > 0) {
        setSelectedVersaoId((prev) => prev || String(list[0]._id));
      }
    } catch (err) {
      onNotify(err.message || 'Erro ao carregar versões', 'error');
    } finally {
      setLoadingVersoes(false);
    }
  }, [docDef.documentId, onNotify]);

  const loadVersaoDoc = useCallback(async (versaoId) => {
    if (!versaoId) return;
    try {
      setLoadingDoc(true);
      const res = await corporativoLegalAPI.getVersao(docDef.documentId, versaoId);
      setVersaoDoc(normalizeData(res));
    } catch (err) {
      onNotify(err.message || 'Erro ao carregar versão', 'error');
      setVersaoDoc(null);
    } finally {
      setLoadingDoc(false);
    }
  }, [docDef.documentId, onNotify]);

  useEffect(() => {
    loadVersoes();
  }, [loadVersoes]);

  useEffect(() => {
    if (selectedVersaoId) {
      loadVersaoDoc(selectedVersaoId);
    }
  }, [selectedVersaoId, loadVersaoDoc]);

  const sections = Array.isArray(versaoDoc?.[activeField]) ? versaoDoc[activeField] : [];

  const handleUpdateSection = async (index, payload) => {
    try {
      setSaving(true);
      const res = await corporativoLegalAPI.updateSecao(
        docDef.documentId,
        selectedVersaoId,
        activeField,
        index,
        payload
      );
      setVersaoDoc(normalizeData(res));
      onNotify('Seção atualizada', 'success');
    } catch (err) {
      onNotify(err.response?.data?.error || err.message || 'Erro ao atualizar seção', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (index) => {
    if (!window.confirm('Excluir esta seção?')) return;
    try {
      setSaving(true);
      await corporativoLegalAPI.deleteSecao(docDef.documentId, selectedVersaoId, activeField, index);
      await loadVersaoDoc(selectedVersaoId);
      onNotify('Seção excluída', 'success');
    } catch (err) {
      onNotify(err.response?.data?.error || err.message || 'Erro ao excluir seção', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSection.titulo.trim()) return;
    try {
      setSaving(true);
      const res = await corporativoLegalAPI.addSecao(
        docDef.documentId,
        selectedVersaoId,
        activeField,
        newSection
      );
      setVersaoDoc(normalizeData(res));
      setNewSection({ titulo: '', corpo: '' });
      setAddingSection(false);
      onNotify('Seção adicionada', 'success');
    } catch (err) {
      onNotify(err.response?.data?.error || err.message || 'Erro ao adicionar seção', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVersaoCreated = async () => {
    onNotify('Nova versão publicada', 'success');
    setSelectedVersaoId('');
    await loadVersoes();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        {loadingVersoes ? (
          <CircularProgress size={20} />
        ) : (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Versão</InputLabel>
            <Select
              value={selectedVersaoId}
              label="Versão"
              onChange={(e) => setSelectedVersaoId(e.target.value)}
              sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
            >
              {versoes.map((v) => (
                <MenuItem key={String(v._id)} value={String(v._id)} sx={{ fontFamily: 'Poppins' }}>
                  {v.versao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => setNovaVersaoOpen(true)}
          sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
        >
          Nova Versão
        </Button>
      </Box>

      {isLgpd && (
        <Tabs
          value={lgpdFieldTab}
          onChange={(_e, v) => setLgpdFieldTab(v)}
          sx={{
            mb: 2,
            '& .MuiTab-root': { fontFamily: 'Poppins', textTransform: 'none', fontSize: '0.85rem' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--blue-light)' },
          }}
        >
          <Tab label="Pública" />
          <Tab label="Corporativa" />
        </Tabs>
      )}

      {loadingDoc ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: 'var(--blue-medium)' }} />
        </Box>
      ) : !versaoDoc ? (
        <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
          Selecione uma versão para visualizar as seções.
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', color: 'var(--blue-dark)' }}>
              Seções ({sections.length})
            </Typography>
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setAddingSection(true)}
              sx={{ fontFamily: 'Poppins', color: 'var(--blue-medium)' }}
            >
              Adicionar Seção
            </Button>
          </Box>

          {addingSection && (
            <Box sx={{ mb: 2, p: 1.6, border: '1px dashed var(--blue-medium)', borderRadius: '6px' }}>
              <TextField
                fullWidth
                label="Título"
                value={newSection.titulo}
                onChange={(e) => setNewSection((p) => ({ ...p, titulo: e.target.value }))}
                size="small"
                sx={{ ...TEXT_FIELD_SX, mb: 1.6 }}
              />
              <TextField
                fullWidth
                label="Corpo"
                value={newSection.corpo}
                onChange={(e) => setNewSection((p) => ({ ...p, corpo: e.target.value }))}
                multiline
                minRows={3}
                size="small"
                sx={TEXT_FIELD_SX}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1.6, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => setAddingSection(false)} sx={{ fontFamily: 'Poppins' }}>
                  Cancelar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAddSection}
                  disabled={saving || !newSection.titulo.trim()}
                  sx={{ fontFamily: 'Poppins', backgroundColor: 'var(--blue-medium)' }}
                >
                  Salvar Seção
                </Button>
              </Box>
            </Box>
          )}

          {sections.length === 0 ? (
            <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>
              Nenhuma seção nesta área.
            </Alert>
          ) : (
            sections.map((sec, idx) => (
              <SectionEditor
                key={`${activeField}-${idx}-${sec.titulo}`}
                section={sec}
                saving={saving}
                onSave={(payload) => handleUpdateSection(idx, payload)}
                onDelete={() => handleDeleteSection(idx)}
              />
            ))
          )}
        </>
      )}

      <NovaVersaoDialog
        open={novaVersaoOpen}
        onClose={() => setNovaVersaoOpen(false)}
        documentId={docDef.documentId}
        onCreated={handleVersaoCreated}
      />
    </Box>
  );
};

const LegalDocumentosTab = () => {
  const [registry, setRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await corporativoLegalAPI.getRegistry();
        setRegistry(normalizeData(res) || []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar registro de documentos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const lgpdDoc = registry.find((d) => d.documentId === 'lgpd');
  const politicasDocs = registry.filter((d) => d.kind === 'politicas');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
        {error}
      </Alert>
    );
  }

  const accordionSx = {
    mb: 1.6,
    backgroundColor: 'var(--cor-container)',
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    '&:before': { display: 'none' },
  };

  return (
    <Box>
      {lgpdDoc && (
        <Accordion defaultExpanded sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'var(--blue-medium)' }} />}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: 'var(--blue-dark)' }}>
              LGPD
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DocumentVersionPanel docDef={lgpdDoc} onNotify={notify} />
          </AccordionDetails>
        </Accordion>
      )}

      {politicasDocs.length > 0 && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'var(--blue-medium)' }} />}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: 'var(--blue-dark)' }}>
              Políticas e Normas
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {politicasDocs.map((docDef, idx) => (
              <Box key={docDef.documentId}>
                {idx > 0 && <Divider sx={{ my: 2 }} />}
                <Accordion sx={{ ...accordionSx, mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'var(--blue-medium)' }} />}>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', color: 'var(--blue-dark)' }}>
                      {docDef.titulo}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DocumentVersionPanel docDef={docDef} onNotify={notify} />
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
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

export default LegalDocumentosTab;
