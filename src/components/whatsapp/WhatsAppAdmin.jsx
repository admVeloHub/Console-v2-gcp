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
  connectRequisicoesProduto,
  getNumberRequisicoesProduto,
  getStatusVelodesk,
  getQRVelodesk,
  logoutVelodesk,
  connectVelodesk,
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
      
      // Apenas carregar QR se o status indicar que há QR disponível
      // NÃO forçar geração automática
      if (statusData.hasQR) {
        try {
          const qr = await getQRRequisicoesProduto();
          if (qr.hasQR) {
            setQrDataRequisicoesProduto(qr);
          } else {
            setQrDataRequisicoesProduto(null);
          }
        } catch (err) {
          console.error('[Requisições de Produto] Erro ao carregar QR:', err);
          setQrDataRequisicoesProduto(null);
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
      let qr = await getQRRequisicoesProduto();
      // Se QR não disponível, tentar conectar primeiro
      if (!qr.hasQR) {
        await connectRequisicoesProduto();
        await new Promise(resolve => setTimeout(resolve, 2000));
        qr = await getQRRequisicoesProduto();
      }
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
      
      // Apenas carregar QR se o status indicar que há QR disponível
      // NÃO forçar geração automática
      if (statusData.hasQR) {
        try {
          const qr = await getQRVelodesk();
          if (qr.hasQR) {
            setQrDataVelodesk(qr);
          } else {
            setQrDataVelodesk(null);
          }
        } catch (err) {
          console.error('Erro ao carregar QR VeloDesk:', err);
          setQrDataVelodesk(null);
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
      let qr = await getQRVelodesk();
      // Se QR não disponível, tentar conectar primeiro
      if (!qr.hasQR) {
        await connectVelodesk();
        await new Promise(resolve => setTimeout(resolve, 2000));
        qr = await getQRVelodesk();
      }
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
    try {
      if (qrDialogConnection === 'requisicoes-produto') {
        console.log('[Requisições de Produto] Forçando conexão para gerar novo QR...');
        
        // Limpar QR atual
        setQrDataRequisicoesProduto(null);
        
        // Forçar conexão para gerar novo QR
        try {
          await connectRequisicoesProduto();
        } catch (connectErr) {
          console.error('Erro ao conectar:', connectErr);
          setError('Erro ao iniciar conexão: ' + (connectErr.message || 'Erro desconhecido'));
          return;
        }
        
        // Aguardar e tentar obter QR várias vezes (máximo 10 segundos)
        let attempts = 0;
        let qr = null;
        while (attempts < 20 && (!qr || !qr.hasQR)) {
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            qr = await getQRRequisicoesProduto();
            console.log(`[Requisições de Produto] Tentativa ${attempts + 1}: QR disponível?`, qr.hasQR);
          } catch (qrErr) {
            console.error('Erro ao obter QR:', qrErr);
          }
          attempts++;
        }
        
        if (qr?.hasQR) {
          console.log('[Requisições de Produto] QR gerado com sucesso!');
          setQrDataRequisicoesProduto(qr);
          setError(null);
        } else {
          console.warn('[Requisições de Produto] QR não foi gerado após', attempts, 'tentativas');
          setError('QR code não foi gerado após várias tentativas. Tente novamente ou use o botão "Desconectar" para forçar novo QR.');
        }
        
        // Recarregar status
        await handleRefreshRequisicoesProduto();
      } else if (qrDialogConnection === 'velodesk') {
        console.log('[VeloDesk] Forçando conexão para gerar novo QR...');
        
        // Limpar QR atual
        setQrDataVelodesk(null);
        
        // Forçar conexão para gerar novo QR
        try {
          await connectVelodesk();
        } catch (connectErr) {
          console.error('Erro ao conectar:', connectErr);
          setError('Erro ao iniciar conexão: ' + (connectErr.message || 'Erro desconhecido'));
          return;
        }
        
        // Aguardar e tentar obter QR várias vezes (máximo 10 segundos)
        let attempts = 0;
        let qr = null;
        while (attempts < 20 && (!qr || !qr.hasQR)) {
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            qr = await getQRVelodesk();
            console.log(`[VeloDesk] Tentativa ${attempts + 1}: QR disponível?`, qr.hasQR);
          } catch (qrErr) {
            console.error('Erro ao obter QR:', qrErr);
          }
          attempts++;
        }
        
        if (qr?.hasQR) {
          console.log('[VeloDesk] QR gerado com sucesso!');
          setQrDataVelodesk(qr);
          setError(null);
        } else {
          console.warn('[VeloDesk] QR não foi gerado após', attempts, 'tentativas');
          setError('QR code não foi gerado após várias tentativas. Tente novamente ou use o botão "Desconectar" para forçar novo QR.');
        }
        
        // Recarregar status
        await handleRefreshVelodesk();
      }
    } catch (err) {
      console.error('Erro ao atualizar QR:', err);
      setError(err.message || 'Erro ao atualizar QR code');
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
