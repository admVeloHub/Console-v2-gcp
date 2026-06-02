// VERSION: v1.3.1 | DATE: 2026-05-29 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.3.1 - Google Agenda: doc email_calendar_api em console_config.email_config
// CHANGELOG: v1.3.0 - Google Agenda: e-mail da conta configurável (não usa usuário logado)
// CHANGELOG: v1.2.0 - Google Agenda (OAuth VeloHub); removido painel SMTP; Gmail API + toggle no mesmo card
// CHANGELOG: v1.1.2 - Textos Gmail sem mencionar campo de chave; segredo só no Mongo / JSON colado pelo usuário
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { Save, Science, LinkOff } from '@mui/icons-material';
import {
  getEmailStatus,
  toggleEmailService,
  getEmailGmailConfig,
  putEmailGmailConfig,
  postEmailGmailTest
} from '../../services/emailService';
import {
  getGoogleCalendarConfig,
  putGoogleCalendarConfig,
  getGoogleCalendarStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar
} from '../../services/googleCalendarService';
import { requestGoogleCalendarAuthorizationCode } from '../../utils/googleCalendarConnect';

const statusChipColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const statusChipLabel = (status, transportHint) => {
  if (status === 'active' && transportHint === 'gmail_api') return 'Gmail OK';
  switch (status) {
    case 'active':
      return 'Conexão OK';
    case 'error':
      return 'Erro';
    case 'inactive':
    default:
      return 'Inativo';
  }
};

const ConfigConexoesTab = () => {
  const [loading, setLoading] = useState(true);
  const [noPermission, setNoPermission] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [gmail, setGmail] = useState({
    transportMode: 'gmail_api',
    defaultFromEmail: '',
    delegatedUserEmail: '',
    serviceAccountJsonText: '',
    hasServiceAccount: false,
    serviceAccountClientEmail: '',
    collectionName: '',
    documentId: ''
  });
  const [gmailSaving, setGmailSaving] = useState(false);
  const [gmailTesting, setGmailTesting] = useState(false);
  const [serviceEnabled, setServiceEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('inactive');
  const [transportHint, setTransportHint] = useState('');
  const [togglePending, setTogglePending] = useState(false);

  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarFeedEmail, setCalendarFeedEmail] = useState('');
  const [calendarFeedEmailSaved, setCalendarFeedEmailSaved] = useState('');
  const [calendarMeta, setCalendarMeta] = useState({
    collectionName: 'email_config',
    documentId: 'email_calendar_api',
  });
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarPending, setCalendarPending] = useState(false);
  const [calendarSaving, setCalendarSaving] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadCalendarStatus = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const [cfg, st] = await Promise.all([
        getGoogleCalendarConfig(),
        getGoogleCalendarStatus()
      ]);
      const savedEmail = cfg?.feedEmail || '';
      setCalendarFeedEmail(savedEmail);
      setCalendarFeedEmailSaved(savedEmail);
      setCalendarMeta({
        collectionName: cfg?.collectionName || 'email_config',
        documentId: cfg?.documentId || 'email_calendar_api',
      });
      setCalendarConnected(Boolean(st?.connected));
    } catch (err) {
      setCalendarConnected(false);
      if (err.statusCode !== 401 && err.statusCode !== 403) {
        showSnackbar(err.message || 'Erro ao verificar Google Agenda', 'warning');
      }
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setNoPermission(false);
    try {
      const [st, gm] = await Promise.all([
        getEmailStatus(),
        getEmailGmailConfig().catch((gmErr) => {
          if (gmErr.statusCode === 403) throw gmErr;
          return {};
        })
      ]);

      setGmail((prev) => ({
        ...prev,
        transportMode: gm.transportMode || 'gmail_api',
        defaultFromEmail: gm.defaultFromEmail || '',
        delegatedUserEmail: gm.delegatedUserEmail || '',
        serviceAccountJsonText: '',
        hasServiceAccount: !!gm.hasServiceAccount,
        serviceAccountClientEmail: gm.serviceAccountClientEmail || '',
        collectionName: gm.collectionName || '',
        documentId: gm.documentId || ''
      }));
      setServiceEnabled(!!st.enabled);
      setConnectionStatus(st.status || 'inactive');
      setTransportHint(st.transportHint || '');

      await loadCalendarStatus();
    } catch (err) {
      if (err.statusCode === 403) {
        setNoPermission(true);
      } else {
        showSnackbar(err.message || 'Erro ao carregar configurações de conexão', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [loadCalendarStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (_, checked) => {
    setTogglePending(true);
    try {
      await toggleEmailService(checked);
      setServiceEnabled(checked);
      await loadData();
      showSnackbar(checked ? 'Serviço de e-mail ativado.' : 'Serviço de e-mail desativado.', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Erro ao alterar o serviço', 'error');
    } finally {
      setTogglePending(false);
    }
  };

  const handleGmailChange = (field) => (e) => {
    setGmail((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveGmail = async () => {
    if (!gmail.defaultFromEmail?.trim()) {
      showSnackbar('Informe o e-mail remetente (From).', 'warning');
      return;
    }
    if (!gmail.hasServiceAccount && !gmail.serviceAccountJsonText?.trim()) {
      showSnackbar('Cole o JSON da conta de serviço na primeira configuração (ou já existindo no servidor).', 'warning');
      return;
    }
    const body = {
      transportMode: 'gmail_api',
      defaultFromEmail: gmail.defaultFromEmail.trim(),
      delegatedUserEmail: (gmail.delegatedUserEmail || gmail.defaultFromEmail).trim()
    };
    if (gmail.serviceAccountJsonText?.trim()) {
      body.serviceAccountJson = gmail.serviceAccountJsonText.trim();
    }
    setGmailSaving(true);
    try {
      await putEmailGmailConfig(body);
      showSnackbar('Configuração Gmail salva.', 'success');
      setGmail((p) => ({ ...p, serviceAccountJsonText: '' }));
      await loadData();
    } catch (err) {
      showSnackbar(err.message || 'Erro ao salvar Gmail', 'error');
    } finally {
      setGmailSaving(false);
    }
  };

  const handleTestGmail = async () => {
    setGmailTesting(true);
    try {
      const result = await postEmailGmailTest({});
      showSnackbar(result.message || 'Teste Gmail enviado.', 'success');
      await loadData();
    } catch (err) {
      showSnackbar(err.message || 'Erro no teste Gmail', 'error');
    } finally {
      setGmailTesting(false);
    }
  };

  const handleSaveCalendarFeedEmail = async () => {
    if (!calendarFeedEmail?.trim() || !calendarFeedEmail.includes('@')) {
      showSnackbar('Informe o e-mail da conta Google que contém a agenda Velotax.', 'warning');
      return;
    }
    setCalendarSaving(true);
    try {
      const result = await putGoogleCalendarConfig(calendarFeedEmail.trim());
      const saved = result?.feedEmail || calendarFeedEmail.trim().toLowerCase();
      setCalendarFeedEmail(saved);
      setCalendarFeedEmailSaved(saved);
      setCalendarConnected(Boolean(result?.connected));
      showSnackbar(
        result?.message || 'E-mail da agenda salvo. Autorize o OAuth com essa conta Google.',
        'success'
      );
      await loadCalendarStatus();
    } catch (err) {
      showSnackbar(err.message || 'Erro ao salvar e-mail da agenda', 'error');
    } finally {
      setCalendarSaving(false);
    }
  };

  const handleConnectCalendar = async () => {
    if (!calendarFeedEmailSaved?.trim()) {
      showSnackbar('Salve o e-mail da agenda antes de conectar.', 'warning');
      return;
    }
    setCalendarPending(true);
    try {
      const code = await requestGoogleCalendarAuthorizationCode();
      await connectGoogleCalendar(code);
      await loadCalendarStatus();
      showSnackbar(
        `Google Agenda conectada para ${calendarFeedEmailSaved}. Eventos visíveis na Home do VeloHub.`,
        'success'
      );
    } catch (err) {
      showSnackbar(err.message || 'Não foi possível conectar ao Google Agenda', 'error');
    } finally {
      setCalendarPending(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setCalendarPending(true);
    try {
      await disconnectGoogleCalendar();
      setCalendarConnected(false);
      showSnackbar('Google Agenda desconectada.', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Erro ao desconectar Google Agenda', 'error');
    } finally {
      setCalendarPending(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
      </Box>
    );
  }

  if (noPermission) {
    return (
      <Card sx={{ mb: 4, backgroundColor: 'var(--cor-container)', boxShadow: 'none' }}>
        <CardContent>
          <Alert severity="warning" sx={{ fontFamily: 'Poppins' }}>
            Você não tem permissão para acessar as configurações de conexão. No perfil do usuário, é necessário o
            acesso marcado compatível com integrações / e-mail (servidor: permissão <strong>whatsapp</strong> nas
            rotas da API SKYNET). Peça a um administrador para habilitá-lo ao seu usuário.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 4, backgroundColor: 'var(--cor-container)', boxShadow: 'none' }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', mb: 0.5 }}
          >
            E-mail (Gmail API)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins', mb: 2 }}>
            Credenciais no MongoDB <code>console_config.{gmail.collectionName || 'email_config'}</code> — doc{' '}
            <code>{gmail.documentId || 'email_tk_notifications'}</code>. Delegação Workspace (Admin Google)
            obrigatória para a conta de serviço enviar como o usuário abaixo.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
            <Chip
              label={statusChipLabel(connectionStatus, transportHint)}
              color={statusChipColor(connectionStatus)}
              size="small"
              sx={{ fontFamily: 'Poppins' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={serviceEnabled}
                  onChange={handleToggle}
                  disabled={togglePending}
                  color="primary"
                />
              }
              label={<Typography sx={{ fontFamily: 'Poppins' }}>Serviço de envio ativo</Typography>}
            />
          </Box>

          <Grid container spacing={2.4}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-mail remetente (From)"
                type="email"
                value={gmail.defaultFromEmail}
                onChange={handleGmailChange('defaultFromEmail')}
                helperText="Editável quando quiser trocar o remetente padrão das notificações."
                sx={{ '& .MuiInputBase-root': { fontFamily: 'Poppins' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Conta delegada (JWT subject)"
                type="email"
                value={gmail.delegatedUserEmail}
                onChange={handleGmailChange('delegatedUserEmail')}
                placeholder={gmail.defaultFromEmail || ''}
                helperText="Em testes pode ser igual ao From. Deixe vazio para usar o mesmo remetente."
                sx={{ '& .MuiInputBase-root': { fontFamily: 'Poppins' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={5}
                label="JSON da conta de serviço (Google Cloud)"
                value={gmail.serviceAccountJsonText}
                onChange={handleGmailChange('serviceAccountJsonText')}
                placeholder={
                  gmail.hasServiceAccount
                    ? 'Credencial já armazenada no servidor. Cole aqui somente se for substituir o JSON inteiro.'
                    : 'Cole o JSON baixado do Google Cloud (arquivo da conta de serviço).'
                }
                sx={{ '& .MuiInputBase-root': { fontFamily: 'Poppins' } }}
              />
            </Grid>
            {gmail.serviceAccountClientEmail ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins' }}>
                  Service account (client): {gmail.serviceAccountClientEmail}
                </Typography>
              </Grid>
            ) : null}
          </Grid>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={gmailTesting ? <CircularProgress size={18} /> : <Science />}
              onClick={handleTestGmail}
              disabled={gmailTesting || gmailSaving}
              sx={{ fontFamily: 'Poppins' }}
            >
              Enviar teste (Gmail API)
            </Button>
            <Button
              variant="contained"
              startIcon={gmailSaving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSaveGmail}
              disabled={gmailSaving || gmailTesting}
              sx={{
                fontFamily: 'Poppins',
                backgroundColor: 'var(--blue-medium)',
                '&:hover': { backgroundColor: 'var(--blue-dark)' }
              }}
            >
              Salvar Gmail
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, backgroundColor: 'var(--cor-container)', boxShadow: 'none' }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', mb: 0.5 }}
          >
            Google Agenda (VeloHub)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins', mb: 2 }}>
            Credenciais no MongoDB <code>console_config.{calendarMeta.collectionName}</code> — doc{' '}
            <code>{calendarMeta.documentId}</code>. Informe qual conta Google contém a agenda do widget
            Agenda Velotax. O OAuth deve ser autorizado com essa mesma conta.
          </Typography>

          <Grid container spacing={2.4} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="E-mail da conta Google (agenda Velotax)"
                type="email"
                value={calendarFeedEmail}
                onChange={(e) => setCalendarFeedEmail(e.target.value)}
                placeholder="ex.: agenda@velotax.com.br"
                helperText="Calendário primary desta conta será exibido para todos os colaboradores no VeloHub."
                sx={{ '& .MuiInputBase-root': { fontFamily: 'Poppins' } }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Button
                variant="outlined"
                startIcon={calendarSaving ? <CircularProgress size={18} /> : <Save />}
                onClick={handleSaveCalendarFeedEmail}
                disabled={calendarSaving || calendarPending || calendarLoading}
                sx={{ fontFamily: 'Poppins', mt: { xs: 0, md: 0.5 } }}
              >
                Salvar e-mail
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={
                calendarLoading
                  ? 'Verificando…'
                  : calendarConnected
                    ? 'OAuth conectado'
                    : 'OAuth pendente'
              }
              color={calendarConnected ? 'success' : 'default'}
              size="small"
              sx={{ fontFamily: 'Poppins' }}
            />
            {calendarFeedEmailSaved ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins' }}>
                Agenda: <strong>{calendarFeedEmailSaved}</strong>
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {!calendarConnected ? (
              <Button
                variant="contained"
                onClick={handleConnectCalendar}
                disabled={calendarPending || calendarLoading || !calendarFeedEmailSaved}
                sx={{
                  fontFamily: 'Poppins',
                  backgroundColor: 'var(--blue-medium)',
                  '&:hover': { backgroundColor: 'var(--blue-dark)' }
                }}
              >
                {calendarPending ? 'Conectando…' : 'Conectar OAuth (conta da agenda)'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={loadCalendarStatus}
                  disabled={calendarPending || calendarLoading}
                  sx={{ fontFamily: 'Poppins' }}
                >
                  Atualizar status
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={calendarPending ? <CircularProgress size={18} /> : <LinkOff />}
                  onClick={handleDisconnectCalendar}
                  disabled={calendarPending}
                  sx={{ fontFamily: 'Poppins' }}
                >
                  Desconectar
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', fontFamily: 'Poppins' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfigConexoesTab;
