// VERSION: v1.1.0 | DATE: 2025-02-02 | AUTHOR: VeloHub Development Team
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
  Grid,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { getEmailStatus, getEmailConfig, testEmailConnection, updateEmailConfig, toggleEmailService } from '../../services/emailService';

const EmailServices = () => {
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingVeloDesk, setRefreshingVeloDesk] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);
  
  // Estado do formulário Chamados Internos
  const [formData, setFormData] = useState({
    host: '',
    port: '587',
    user: '',
    password: '',
    from: ''
  });

  // Estado do formulário Velodesk Email (sem conexões por enquanto)
  const [formDataVeloDesk, setFormDataVeloDesk] = useState({
    host: '',
    port: '587',
    user: '',
    password: '',
    from: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [statusData, configData] = await Promise.all([
        getEmailStatus(),
        getEmailConfig()
      ]);
      setStatus(statusData);
      setConfig(configData);
      
      // Preencher formulário com configurações atuais
      setFormData({
        host: configData.host || '',
        port: configData.port?.toString() || '587',
        user: configData.user || '',
        password: '', // Não preencher senha por segurança
        from: configData.from || ''
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar informações do serviço de email');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleRefreshVeloDesk = async () => {
    setRefreshingVeloDesk(true);
    // Simular atualização (sem conexões por enquanto)
    setTimeout(() => {
      setRefreshingVeloDesk(false);
    }, 1000);
  };

  const handleToggle = async (enabled) => {
    try {
      setError(null);
      const newStatus = await toggleEmailService(enabled);
      setStatus(newStatus);
      setSuccess(`Serviço ${enabled ? 'ativado' : 'desativado'} com sucesso`);
    } catch (err) {
      console.error(`Erro ao ${enabled ? 'ativar' : 'desativar'} serviço:`, err);
      setError(err.message || `Erro ao ${enabled ? 'ativar' : 'desativar'} serviço`);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    
    try {
      const result = await testEmailConnection({
        host: formData.host,
        port: parseInt(formData.port),
        user: formData.user,
        password: formData.password
      });
      
      setTestResult(result);
      if (result.success) {
        setSuccess('Conexão SMTP testada com sucesso!');
      } else {
        setError(result.message || 'Erro ao testar conexão');
      }
    } catch (err) {
      console.error('Erro ao testar conexão:', err);
      setError(err.message || 'Erro ao testar conexão SMTP');
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Validar campos obrigatórios
      if (!formData.host || !formData.port || !formData.user || !formData.password || !formData.from) {
        setError('Todos os campos são obrigatórios');
        setSaving(false);
        return;
      }

      const updatedConfig = await updateEmailConfig({
        host: formData.host,
        port: parseInt(formData.port),
        user: formData.user,
        password: formData.password,
        from: formData.from
      });
      
      setConfig(updatedConfig);
      setFormData(prev => ({ ...prev, password: '' })); // Limpar senha após salvar
      setSuccess('Configurações salvas com sucesso!');
      
      // Recarregar status para verificar conexão
      const newStatus = await getEmailStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
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
      {/* Container Chamados Internos */}
      <Card 
        sx={{ 
          mb: 3,
          backgroundColor: 'var(--cor-card)',
          border: '1px solid rgba(22, 52, 255, 0.1)',
          boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
              Chamados Internos
            </Typography>
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
                  SMTP Email
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={status?.enabled && status?.status === 'active' ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={status?.enabled && status?.status === 'active' ? 'Ativo' : status?.status === 'error' ? 'Erro' : 'Inativo'}
                  color={status?.enabled && status?.status === 'active' ? 'success' : 'error'}
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
                      checked={status?.enabled || false}
                      onChange={(e) => handleToggle(e.target.checked)}
                      disabled={!config?.host || !config?.user}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#272A30' }}>
                      {status?.enabled ? 'Ativado' : 'Desativado'}
                    </Typography>
                  }
                />
              </Grid>
              
              {/* Linha 2: Host | Port | User */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Host SMTP"
                  value={formData.host}
                  onChange={handleInputChange('host')}
                  size="small"
                  placeholder="smtp.gmail.com"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Porta"
                  value={formData.port}
                  onChange={handleInputChange('port')}
                  size="small"
                  type="number"
                  placeholder="587"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Usuário"
                  value={formData.user}
                  onChange={handleInputChange('user')}
                  size="small"
                  placeholder="seu@email.com"
                />
              </Grid>
              
              {/* Linha 3: Password | From | Botões */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Senha"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  size="small"
                  type="password"
                  placeholder={config?.password ? '••••••••' : 'Digite a senha'}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Email Remetente"
                  value={formData.from}
                  onChange={handleInputChange('from')}
                  size="small"
                  placeholder="noreply@velohub.com.br"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={testing ? <CircularProgress size={16} /> : <SendIcon />}
                    onClick={handleTestConnection}
                    disabled={testing || !formData.host || !formData.user || !formData.password}
                    size="small"
                  >
                    Testar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSaveConfig}
                    disabled={saving || !formData.host || !formData.user || !formData.password || !formData.from}
                    size="small"
                    sx={{ backgroundColor: '#000058', '&:hover': { backgroundColor: '#000040' } }}
                  >
                    Salvar
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Resultado do teste */}
            {testResult && (
              <Alert 
                severity={testResult.success ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {testResult.message}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Container Velodesk Email */}
      <Card 
        sx={{ 
          mb: 3,
          backgroundColor: 'var(--cor-card)',
          border: '1px solid rgba(22, 52, 255, 0.1)',
          boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
              Velodesk Email
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefreshVeloDesk}
              disabled={refreshingVeloDesk}
              size="small"
            >
              {refreshingVeloDesk ? <CircularProgress size={20} /> : 'Atualizar'}
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
                  SMTP Email
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={<ErrorIcon />}
                  label="Inativo"
                  color="error"
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
                      checked={false}
                      disabled={true}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#272A30' }}>
                      Desativado
                    </Typography>
                  }
                />
              </Grid>
              
              {/* Linha 2: Host | Port | User */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Host SMTP"
                  value={formDataVeloDesk.host}
                  onChange={(e) => setFormDataVeloDesk(prev => ({ ...prev, host: e.target.value }))}
                  size="small"
                  placeholder="smtp.gmail.com"
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Porta"
                  value={formDataVeloDesk.port}
                  onChange={(e) => setFormDataVeloDesk(prev => ({ ...prev, port: e.target.value }))}
                  size="small"
                  type="number"
                  placeholder="587"
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Usuário"
                  value={formDataVeloDesk.user}
                  onChange={(e) => setFormDataVeloDesk(prev => ({ ...prev, user: e.target.value }))}
                  size="small"
                  placeholder="seu@email.com"
                  disabled={true}
                />
              </Grid>
              
              {/* Linha 3: Password | From | Botões */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Senha"
                  value={formDataVeloDesk.password}
                  onChange={(e) => setFormDataVeloDesk(prev => ({ ...prev, password: e.target.value }))}
                  size="small"
                  type="password"
                  placeholder="Digite a senha"
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Email Remetente"
                  value={formDataVeloDesk.from}
                  onChange={(e) => setFormDataVeloDesk(prev => ({ ...prev, from: e.target.value }))}
                  size="small"
                  placeholder="noreply@velohub.com.br"
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    disabled={true}
                    size="small"
                  >
                    Testar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={true}
                    size="small"
                    sx={{ backgroundColor: '#000058', '&:hover': { backgroundColor: '#000040' } }}
                  >
                    Salvar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbars para feedback */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailServices;
