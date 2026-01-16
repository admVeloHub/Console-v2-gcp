// VERSION: v1.2.0 | DATE: 2025-02-02 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { getAIServicesStatus, getAIServicesConfig, toggleAIService } from '../../services/apiIAService';

const ApiIAServices = () => {
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({ veloredes: false, workerQualidade: false });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [statusData, configData] = await Promise.all([
        getAIServicesStatus(),
        getAIServicesConfig()
      ]);
      setStatus(statusData);
      setConfig(configData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar informações dos serviços de IA');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleToggle = async (service, enabled) => {
    setToggling(prev => ({ ...prev, [service]: true }));
    try {
      setError(null);
      const newStatus = await toggleAIService(service, enabled);
      setStatus(prev => ({
        ...prev,
        [service]: newStatus[service]
      }));
    } catch (err) {
      console.error(`Erro ao ${enabled ? 'ativar' : 'desativar'} serviço:`, err);
      setError(err.message || `Erro ao ${enabled ? 'ativar' : 'desativar'} serviço`);
    } finally {
      setToggling(prev => ({ ...prev, [service]: false }));
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
      {/* Container Veloredes (SKYNET) */}
      <Card 
        sx={{ 
          mb: 3,
          backgroundColor: 'var(--cor-card)', /* Usa variável CSS que muda com tema */
          border: '1px solid rgba(22, 52, 255, 0.1)',
          boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Veloredes (SKYNET)</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
            >
              {refreshing ? <CircularProgress size={20} /> : 'Atualizar'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              {/* Linha 1: Serviço | Status | Toggle */}
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Serviço
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#272A30' }}>
                  Veloredes (SKYNET)
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={status?.veloredes?.enabled && status?.veloredes?.status === 'active' ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={status?.veloredes?.enabled && status?.veloredes?.status === 'active' ? 'Ativo' : 'Inativo'}
                  color={status?.veloredes?.enabled && status?.veloredes?.status === 'active' ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ativação
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={status?.veloredes?.enabled || false}
                      onChange={(e) => handleToggle('veloredes', e.target.checked)}
                      disabled={toggling.veloredes || !status?.veloredes}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#272A30' }}>
                      {toggling.veloredes ? 'Alterando...' : status?.veloredes?.enabled ? 'Ativado' : 'Desativado'}
                    </Typography>
                  }
                />
              </Grid>
              {/* Linha 2: Provedor | Key */}
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provedor
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#272A30' }}>
                  Gemini AI
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API Key
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#272A30' }}>
                  {config?.veloredes?.apiKey || 'Não configurada'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Container Worker Qualidade */}
      <Card 
        sx={{ 
          mb: 3,
          backgroundColor: 'var(--cor-card)', /* Usa variável CSS que muda com tema */
          border: '1px solid rgba(22, 52, 255, 0.1)',
          boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Worker Qualidade</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
            >
              {refreshing ? <CircularProgress size={20} /> : 'Atualizar'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              {/* Linha 1: Serviço | Status | Toggle */}
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Serviço
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#272A30' }}>
                  Worker Qualidade
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={status?.workerQualidade?.enabled && status?.workerQualidade?.status === 'active' ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={status?.workerQualidade?.enabled && status?.workerQualidade?.status === 'active' ? 'Ativo' : 'Inativo'}
                  color={status?.workerQualidade?.enabled && status?.workerQualidade?.status === 'active' ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ativação
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={status?.workerQualidade?.enabled || false}
                      onChange={(e) => handleToggle('workerQualidade', e.target.checked)}
                      disabled={toggling.workerQualidade || !status?.workerQualidade}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#272A30' }}>
                      {toggling.workerQualidade ? 'Alterando...' : status?.workerQualidade?.enabled ? 'Ativado' : 'Desativado'}
                    </Typography>
                  }
                />
              </Grid>
              {/* Linha 2: Provedor | Key */}
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provedor
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#272A30' }}>
                  Gemini AI
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API Key
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#272A30' }}>
                  {config?.workerQualidade?.geminiApiKey || 'Não configurada'}
                </Typography>
              </Grid>
              {/* Linha 3: Provedor | Key */}
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provedor
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#272A30' }}>
                  OpenAI
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API Key
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#272A30' }}>
                  {config?.workerQualidade?.openaiApiKey || 'Não configurada'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiIAServices;
