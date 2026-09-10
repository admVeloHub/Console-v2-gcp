// VERSION: v2.0.0 | DATE: 2026-09-10 | AUTHOR: VeloHub Development Team
// CHANGELOG: v2.0.0 - Serviços viram lista dinâmica vinda do backend (array `servicos`);
// incluir/remover um serviço gera/some um card automaticamente, sem deploy.
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  CheckCircle as OnIcon,
  Warning as RevisaoIcon,
  Cancel as OffIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import { servicesAPI } from '../services/api';

const ServicosPage = () => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [novoServico, setNovoServico] = useState({ key: '', nome: '' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ open: false, message: '', severity: 'success' });
  };

  // Buscar lista atual de serviços
  const fetchServicos = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getModuleStatus();
      const data = Array.isArray(response?.data) ? response.data : [];
      setServicos(data);
    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error);
      showToast('Erro ao carregar serviços', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  // Atualizar status local de um serviço (sem enviar para backend ainda)
  const updateLocalStatus = (key, newStatus) => {
    setServicos((prev) => prev.map((s) => (s.key === key ? { ...s, status: newStatus } : s)));
  };

  // Salvar todos os status para o backend de uma vez
  const saveAllStatus = async () => {
    try {
      setSaving(true);
      await servicesAPI.updateMultipleModules(servicos);
      showToast('Status de todos os serviços atualizados com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao salvar status dos serviços:', error);
      showToast('Erro ao salvar status dos serviços', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Adicionar um novo serviço - gera um card novo automaticamente, sem deploy
  const handleAddServico = async () => {
    const key = novoServico.key.trim();
    const nome = novoServico.nome.trim();
    if (!key || !nome) {
      showToast('Preencha a chave e o nome do serviço', 'error');
      return;
    }
    try {
      const response = await servicesAPI.addServico({ key, nome, status: 'off' });
      setServicos(Array.isArray(response?.data) ? response.data : servicos);
      setAddDialogOpen(false);
      setNovoServico({ key: '', nome: '' });
      showToast(`Serviço "${nome}" criado com sucesso!`, 'success');
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      const msg = error.response?.data?.error || 'Erro ao criar serviço';
      showToast(msg, 'error');
    }
  };

  // Remover um serviço - o card some automaticamente, sem deploy
  const handleRemoveServico = async (key, nome) => {
    if (!window.confirm(`Remover o serviço "${nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      const response = await servicesAPI.removeServico(key);
      setServicos(Array.isArray(response?.data) ? response.data : servicos.filter((s) => s.key !== key));
      showToast(`Serviço "${nome}" removido com sucesso!`, 'success');
    } catch (error) {
      console.error('❌ Erro ao remover serviço:', error);
      showToast('Erro ao remover serviço', 'error');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on': return 'Ativo';
      case 'revisao': return 'Revisão';
      case 'off': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on': return 'success';
      case 'revisao': return 'warning';
      case 'off': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on': return <OnIcon />;
      case 'revisao': return <RevisaoIcon />;
      case 'off': return <OffIcon />;
      default: return null;
    }
  };

  const renderStatusButtons = (key, currentStatus) => {
    const statuses = [
      { key: 'on', label: 'Ativo', color: 'success', icon: <OnIcon /> },
      { key: 'revisao', label: 'Revisão', color: 'warning', icon: <RevisaoIcon /> },
      { key: 'off', label: 'Inativo', color: 'error', icon: <OffIcon /> }
    ];

    return (
      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
        {statuses.map((status) => (
          <Button
            key={status.key}
            variant={currentStatus === status.key ? 'contained' : 'outlined'}
            color={status.color}
            size="small"
            startIcon={status.icon}
            onClick={() => updateLocalStatus(key, status.key)}
            sx={{
              minWidth: '80px',
              textTransform: 'none',
              fontWeight: currentStatus === status.key ? 600 : 400,
              fontSize: '0.64rem',
              py: 0.4,
              px: 1.2
            }}
          >
            {status.label}
          </Button>
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3.2, pb: 6.4 }}>
      <VoltarHeaderRow
        left={<BackButton />}
        center={
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              color: 'var(--blue-dark)',
              fontSize: '1.92rem'
            }}
          >
            Serviços
          </Typography>
        }
        right={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              disabled={loading}
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '0.64rem',
                padding: '3.2px 9.6px',
                minWidth: 'auto',
                height: '28.8px'
              }}
            >
              Adicionar Serviço
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={saveAllStatus}
              disabled={saving || loading}
              sx={{
                backgroundColor: 'var(--green)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '0.64rem',
                padding: '3.2px 9.6px',
                minWidth: 'auto',
                height: '28.8px',
                '&:hover': {
                  backgroundColor: 'var(--green)',
                  opacity: 0.9
                }
              }}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </Box>
        }
      />

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3.2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Grid de Serviços - gerado dinamicamente a partir da lista vinda do backend */}
      {!loading && (
        <Grid container spacing={2.4}>
          {servicos.map((service) => {
            const currentStatus = service.status || 'off';

            return (
              <Grid item xs={12} md={6} lg={4} key={service.key}>
                <Card
                  className="servico-card"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--cor-card)',
                    border: '1px solid transparent !important',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      border: '1px solid var(--blue-medium) !important'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 1.6 }}>
                    {/* Header do Card */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.4 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          flexGrow: 1,
                          color: 'var(--blue-dark)',
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.96rem'
                        }}
                      >
                        {service.nome}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(currentStatus)}
                        label={getStatusLabel(currentStatus)}
                        color={getStatusColor(currentStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.64rem', height: '20px', mr: 0.5 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveServico(service.key, service.nome)}
                        title="Remover serviço"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Botões de Status */}
                    {renderStatusButtons(service.key, currentStatus)}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog de Adicionar Serviço */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar Serviço</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Chave (identificador único)"
            placeholder="ex: novo-produto"
            value={novoServico.key}
            onChange={(e) => setNovoServico((prev) => ({ ...prev, key: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Nome exibido no card"
            placeholder="ex: Novo Produto"
            value={novoServico.nome}
            onChange={(e) => setNovoServico((prev) => ({ ...prev, nome: e.target.value }))}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddServico} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>

      {/* Toast de Notificação */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ServicosPage;
