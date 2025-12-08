/**
 * VeloHub Console - WhatsApp Admin Component
 * VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
 * 
 * Componente para gerenciamento da conexão WhatsApp via SKYNET
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
import { getStatus, getQR, logout, getNumber } from '../../services/whatsappApi';

const WhatsAppAdmin = () => {
  const [status, setStatus] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [number, setNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  // Carregar status inicial
  useEffect(() => {
    loadStatus();
  }, []);

  // Atualizar status periodicamente se desconectado
  useEffect(() => {
    if (status && !status.connected) {
      const interval = setInterval(() => {
        loadStatus();
      }, 5000); // Atualizar a cada 5 segundos se desconectado
      
      return () => clearInterval(interval);
    }
  }, [status?.connected]);

  const loadStatus = async () => {
    try {
      setError(null);
      const [statusData, numberData] = await Promise.all([
        getStatus(),
        getNumber()
      ]);
      
      setStatus(statusData);
      setNumber(numberData);
      
      // Se tem QR disponível, carregar também
      if (statusData.hasQR) {
        try {
          const qr = await getQR();
          setQrData(qr);
        } catch (err) {
          console.error('Erro ao carregar QR:', err);
        }
      } else {
        setQrData(null);
      }
    } catch (err) {
      console.error('Erro ao carregar status:', err);
      setError(err.message || 'Erro ao carregar status do WhatsApp');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatus();
  };

  const handleLogout = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar o WhatsApp? Um novo QR code será gerado.')) {
      return;
    }

    setLogoutLoading(true);
    setError(null);

    try {
      await logout();
      // Aguardar um pouco antes de recarregar
      setTimeout(() => {
        loadStatus();
        setLogoutLoading(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError(err.message || 'Erro ao fazer logout');
      setLogoutLoading(false);
    }
  };

  const handleShowQR = async () => {
    setQrDialogOpen(true);
    try {
      const qr = await getQR();
      setQrData(qr);
    } catch (err) {
      console.error('Erro ao carregar QR:', err);
      setError(err.message || 'Erro ao carregar QR code');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Gerenciamento WhatsApp
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Status da Conexão</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
            >
              {refreshing ? <CircularProgress size={20} /> : 'Atualizar'}
            </Button>
          </Box>

          {status && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={status.connected ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={status.connected ? 'Conectado' : 'Desconectado'}
                  color={status.connected ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Status: {status.status}
                </Typography>
              </Box>

              {status.connected && number && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Número Conectado:
                  </Typography>
                  <Typography variant="h6">
                    {number.formatted || number.number || 'N/A'}
                  </Typography>
                </Box>
              )}

              {!status.connected && status.hasQR && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    QR Code disponível para conexão
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={handleShowQR}
                    fullWidth
                  >
                    Exibir QR Code
                  </Button>
                </Box>
              )}

              {status.connected && (
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    fullWidth
                  >
                    {logoutLoading ? <CircularProgress size={20} /> : 'Desconectar WhatsApp'}
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
            <Typography variant="h6">QR Code para Conexão</Typography>
            <IconButton onClick={() => setQrDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {qrData && qrData.hasQR ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'white'
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Fechar</Button>
          <Button onClick={handleRefresh} startIcon={<RefreshIcon />}>
            Atualizar QR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsAppAdmin;

