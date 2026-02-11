/**
 * VeloHub Console - WhatsApp Admin Component
 * VERSION: v2.0.0 | DATE: 2025-02-11 | AUTHOR: VeloHub Development Team
 * 
 * Componente para gerenciamento de múltiplas conexões WhatsApp via SKYNET
 * 
 * Mudanças v2.0.0:
 * - Estado separado para cada conexão (requisicoes-produto e velodesk)
 * - Handlers separados para cada container
 * - Removido polling automático quando conectado
 * - Polling apenas manual via botão "Atualizar"
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  getStatusRequisicoesProduto,
  getQRRequisicoesProduto,
  logoutRequisicoesProduto,
  getNumberRequisicoesProduto,
  getStatusVelodesk,
  getQRVelodesk,
  logoutVelodesk,
  getNumberVelodesk
} from '../../services/whatsappApi';

const WhatsAppAdmin = () => {
  // Estado para Requisições de Produto
  const [statusRequisicoesProduto, setStatusRequisicoesProduto] = useState(null);
  const [qrDataRequisicoesProduto, setQrDataRequisicoesProduto] = useState(null);
  const [numberRequisicoesProduto, setNumberRequisicoesProduto] = useState(null);
  const [loadingRequisicoesProduto, setLoadingRequisicoesProduto] = useState(true);
  const [refreshingRequisicoesProduto, setRefreshingRequisicoesProduto] = useState(false);
  const [logoutLoadingRequisicoesProduto, setLogoutLoadingRequisicoesProduto] = useState(false);

  // Estado para VeloDesk
  const [statusVelodesk, setStatusVelodesk] = useState(null);
  const [qrDataVelodesk, setQrDataVelodesk] = useState(null);
  const [numberVelodesk, setNumberVelodesk] = useState(null);
  const [loadingVelodesk, setLoadingVelodesk] = useState(true);
  const [refreshingVelodesk, setRefreshingVelodesk] = useState(false);
  const [logoutLoadingVelodesk, setLogoutLoadingVelodesk] = useState(false);

  // Estado compartilhado
  const [error, setError] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrDialogConnection, setQrDialogConnection] = useState(null); // 'requisicoes-produto' ou 'velodesk'

  // Carregar status inicial (apenas uma vez, sem polling)
  useEffect(() => {
    loadStatusRequisicoesProduto();
    loadStatusVelodesk();
  }, []);

  // Handlers para Requisições de Produto
  const loadStatusRequisicoesProduto = async () => {
    try {
      setError(null);
      const [statusData, numberData] = await Promise.all([
        getStatusRequisicoesProduto(),
        getNumberRequisicoesProduto()
      ]);
      
      setStatusRequisicoesProduto(statusData);
      setNumberRequisicoesProduto(numberData);
      
      // Se tem QR disponível, carregar também
      if (statusData.hasQR) {
        try {
          const qr = await getQRRequisicoesProduto();
          setQrDataRequisicoesProduto(qr);
        } catch (err) {
          console.error('Erro ao carregar QR Requisições de Produto:', err);
        }
      } else {
        setQrDataRequisicoesProduto(null);
      }
    } catch (err) {
      console.error('Erro ao carregar status Requisições de Produto:', err);
      setError(err.message || 'Erro ao carregar status do WhatsApp (Requisições de Produto)');
    } finally {
      setLoadingRequisicoesProduto(false);
      setRefreshingRequisicoesProduto(false);
    }
  };

  const handleRefreshRequisicoesProduto = async () => {
    setRefreshingRequisicoesProduto(true);
    await loadStatusRequisicoesProduto();
  };

  const handleLogoutRequisicoesProduto = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar o WhatsApp (Requisições de Produto)? Um novo QR code será gerado.')) {
      return;
    }

    setLogoutLoadingRequisicoesProduto(true);
    setError(null);

    try {
      await logoutRequisicoesProduto();
      // Aguardar um pouco antes de recarregar
      setTimeout(() => {
        loadStatusRequisicoesProduto();
        setLogoutLoadingRequisicoesProduto(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao fazer logout Requisições de Produto:', err);
      setError(err.message || 'Erro ao fazer logout (Requisições de Produto)');
      setLogoutLoadingRequisicoesProduto(false);
    }
  };

  const handleShowQRRequisicoesProduto = async () => {
    setQrDialogConnection('requisicoes-produto');
    setQrDialogOpen(true);
    try {
      const qr = await getQRRequisicoesProduto();
      setQrDataRequisicoesProduto(qr);
    } catch (err) {
      console.error('Erro ao carregar QR Requisições de Produto:', err);
      setError(err.message || 'Erro ao carregar QR code (Requisições de Produto)');
    }
  };

  // Handlers para VeloDesk
  const loadStatusVelodesk = async () => {
    try {
      setError(null);
      const [statusData, numberData] = await Promise.all([
        getStatusVelodesk(),
        getNumberVelodesk()
      ]);
      
      setStatusVelodesk(statusData);
      setNumberVelodesk(numberData);
      
      // Se tem QR disponível, carregar também
      if (statusData.hasQR) {
        try {
          const qr = await getQRVelodesk();
          setQrDataVelodesk(qr);
        } catch (err) {
          console.error('Erro ao carregar QR VeloDesk:', err);
        }
      } else {
        setQrDataVelodesk(null);
      }
    } catch (err) {
      console.error('Erro ao carregar status VeloDesk:', err);
      setError(err.message || 'Erro ao carregar status do WhatsApp (VeloDesk)');
    } finally {
      setLoadingVelodesk(false);
      setRefreshingVelodesk(false);
    }
  };

  const handleRefreshVelodesk = async () => {
    setRefreshingVelodesk(true);
    await loadStatusVelodesk();
  };

  const handleLogoutVelodesk = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar o WhatsApp (VeloDesk)? Um novo QR code será gerado.')) {
      return;
    }

    setLogoutLoadingVelodesk(true);
    setError(null);

    try {
      await logoutVelodesk();
      // Aguardar um pouco antes de recarregar
      setTimeout(() => {
        loadStatusVelodesk();
        setLogoutLoadingVelodesk(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao fazer logout VeloDesk:', err);
      setError(err.message || 'Erro ao fazer logout (VeloDesk)');
      setLogoutLoadingVelodesk(false);
    }
  };

  const handleShowQRVelodesk = async () => {
    setQrDialogConnection('velodesk');
    setQrDialogOpen(true);
    try {
      const qr = await getQRVelodesk();
      setQrDataVelodesk(qr);
    } catch (err) {
      console.error('Erro ao carregar QR VeloDesk:', err);
      setError(err.message || 'Erro ao carregar QR code (VeloDesk)');
    }
  };

  // Helper para obter dados do QR dialog baseado na conexão
  const getQrDialogData = () => {
    if (qrDialogConnection === 'requisicoes-produto') {
      return qrDataRequisicoesProduto;
    } else if (qrDialogConnection === 'velodesk') {
      return qrDataVelodesk;
    }
    return null;
  };

  // Helper para atualizar QR do dialog
  const handleRefreshQRDialog = async () => {
    if (qrDialogConnection === 'requisicoes-produto') {
      await handleRefreshRequisicoesProduto();
      try {
        const qr = await getQRRequisicoesProduto();
        setQrDataRequisicoesProduto(qr);
      } catch (err) {
        console.error('Erro ao atualizar QR:', err);
      }
    } else if (qrDialogConnection === 'velodesk') {
      await handleRefreshVelodesk();
      try {
        const qr = await getQRVelodesk();
        setQrDataVelodesk(qr);
      } catch (err) {
        console.error('Erro ao atualizar QR:', err);
      }
    }
  };

  const loading = loadingRequisicoesProduto || loadingVelodesk;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Container Requisições de Produto */}
      <Card sx={{ mb: 3, backgroundColor: 'var(--cor-card)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Requisições de Produto</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefreshRequisicoesProduto}
              disabled={refreshingRequisicoesProduto}
              size="small"
            >
              {refreshingRequisicoesProduto ? <CircularProgress size={20} /> : 'Atualizar'}
            </Button>
          </Box>

          {statusRequisicoesProduto && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={statusRequisicoesProduto.connected ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={statusRequisicoesProduto.connected ? 'Conectado' : 'Desconectado'}
                  color={statusRequisicoesProduto.connected ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Status: {statusRequisicoesProduto.status}
                </Typography>
              </Box>

              {statusRequisicoesProduto.connected && numberRequisicoesProduto && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Número Conectado:
                  </Typography>
                  <Typography variant="h6">
                    {numberRequisicoesProduto.formatted || numberRequisicoesProduto.number || 'N/A'}
                  </Typography>
                </Box>
              )}

              {!statusRequisicoesProduto.connected && statusRequisicoesProduto.hasQR && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    QR Code disponível para conexão
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={handleShowQRRequisicoesProduto}
                    fullWidth
                  >
                    Exibir QR Code
                  </Button>
                </Box>
              )}

              {statusRequisicoesProduto.connected && (
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogoutRequisicoesProduto}
                    disabled={logoutLoadingRequisicoesProduto}
                    fullWidth
                  >
                    {logoutLoadingRequisicoesProduto ? <CircularProgress size={20} /> : 'Desconectar WhatsApp'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Container VeloDesk */}
      <Card sx={{ mb: 3, backgroundColor: 'var(--cor-card)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">VeloDesk</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefreshVelodesk}
              disabled={refreshingVelodesk}
              size="small"
            >
              {refreshingVelodesk ? <CircularProgress size={20} /> : 'Atualizar'}
            </Button>
          </Box>

          {statusVelodesk && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={statusVelodesk.connected ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={statusVelodesk.connected ? 'Conectado' : 'Desconectado'}
                  color={statusVelodesk.connected ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Status: {statusVelodesk.status}
                </Typography>
              </Box>

              {statusVelodesk.connected && numberVelodesk && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Número Conectado:
                  </Typography>
                  <Typography variant="h6">
                    {numberVelodesk.formatted || numberVelodesk.number || 'N/A'}
                  </Typography>
                </Box>
              )}

              {!statusVelodesk.connected && statusVelodesk.hasQR && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    QR Code disponível para conexão
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={handleShowQRVelodesk}
                    fullWidth
                  >
                    Exibir QR Code
                  </Button>
                </Box>
              )}

              {statusVelodesk.connected && (
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogoutVelodesk}
                    disabled={logoutLoadingVelodesk}
                    fullWidth
                  >
                    {logoutLoadingVelodesk ? <CircularProgress size={20} /> : 'Desconectar WhatsApp'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog do QR Code */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              QR Code para Conexão - {qrDialogConnection === 'requisicoes-produto' ? 'Requisições de Produto' : 'VeloDesk'}
            </Typography>
            <IconButton onClick={() => setQrDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {(() => {
            const qrData = getQrDialogData();
            return qrData && qrData.hasQR ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'var(--cor-card)'
                  }}
                >
                  <img
                    src={qrData.qr}
                    alt="QR Code WhatsApp"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Paper>
                {qrData.expiresIn && (
                  <Typography variant="body2" color="text.secondary">
                    Expira em {qrData.expiresIn} segundos
                  </Typography>
                )}
                <Alert severity="info">
                  Escaneie este QR code com o WhatsApp para conectar
                </Alert>
              </Box>
            ) : (
              <Alert severity="warning">
                {qrData?.message || 'QR code não disponível'}
              </Alert>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Fechar</Button>
          <Button onClick={handleRefreshQRDialog} startIcon={<RefreshIcon />}>
            Atualizar QR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsAppAdmin;
