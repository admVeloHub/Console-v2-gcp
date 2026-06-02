// VERSION: v1.5.3 | DATE: 2026-05-08 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.5.3 - Grid: L1 email/sla/atribuído/status; L2 ocorrência C1, processo C3, botões status C4
// CHANGELOG: v1.5.2 - Processo: largura só até ~22rem (não linha inteira); fonte explícita legível (sem autoWidth)
// CHANGELOG: v1.5.1 - Campo Processo com largura contida (autoWidth + justifySelf start)
// CHANGELOG: v1.5.0 - Cabeçalho: id, solicitante, direcionamento, data; removidos do quadro superior
// CHANGELOG: v1.4.0 - Após PUT: aplica response.data no estado; useEffect não zera rascunho ao só atualizar o mesmo ticket
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ticketsAPI } from '../services/ticketsAPI';
import { useAuth } from '../contexts/AuthContext';

const ModalAtribuido = ({ ticket, open, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [editedStatus, setEditedStatus] = useState(ticket?._statusHub || ticket?._statusConsole || '');
  const [editedProcess, setEditedProcess] = useState(ticket?._processo || '');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedTicket, setSelectedTicket] = useState(ticket);
  const lastTicketIdRef = useRef(null);

  // Função para verificar se o ticket é de conteúdo
  const isTicketConteudo = (ticket) => {
    if (!ticket) return false;
    // Verificar pelo ID primeiro (mais confiável)
    if (ticket._id && ticket._id.startsWith('TKC-')) {
      return true;
    }
    // Verificar pelo gênero
    const generoLower = ticket._genero?.toLowerCase();
    const generosConteudo = ['artigo', 'processo', 'velobot', 'roteiro', 'treinamento', 'funcionalidade', 'recurso adicional', 'recurso'];
    return generosConteudo.includes(generoLower);
  };

  // Sincronizar com o ticket do pai (inclui mesma _id com _corpo atualizado após refresh silencioso)
  useEffect(() => {
    if (!ticket) return;
    setEditedStatus(ticket._statusHub || ticket._statusConsole || '');
    setEditedProcess(ticket._processo || '');
    setSelectedTicket(ticket);
    if (lastTicketIdRef.current !== ticket._id) {
      setNewMessage('');
      lastTicketIdRef.current = ticket._id;
    }
  }, [ticket]);

  const applyServerTicket = (data) => {
    if (!data) return;
    setSelectedTicket(data);
    setEditedStatus(data._statusConsole || data._statusHub || '');
    setEditedProcess(data._processo || '');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo': return { background: 'var(--blue-opaque)', color: 'white' };
      case 'aberto': return { background: '#FF0000', color: 'white' };
      case 'em espera': return { background: 'var(--yellow)', color: 'white' };
      case 'pendente': return { background: 'var(--green)', color: 'white' };
      case 'resolvido': return { background: 'rgba(128, 128, 128, 0.3)', color: 'white' };
      default: return { background: 'var(--blue-medium)', color: 'white' };
    }
  };

  const calculateSLA = (createdAt) => {
    if (!createdAt) return 'N/A';
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now - createdDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    const remainingHours = 48 - diffHours;

    if (remainingHours <= 0) return 'VENCIDO';
    else if (remainingHours <= 24) return `${Math.ceil(remainingHours)}h`;
    else return `${Math.ceil(remainingHours / 24)}d`;
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticket) return;

    setIsLoading(true);
    try {
      const endpoint = ticket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
      const updateData = {
        _lastUpdatedBy: user._userId || user.email || user._userMail
      };

      // Definir status baseado no botão clicado
      if (newStatus === 'em espera') {
        updateData._statusHub = 'em espera';
        updateData._statusConsole = 'em espera';
      } else if (newStatus === 'resolvido') {
        updateData._statusHub = 'resolvido';
        updateData._statusConsole = 'resolvido';
      } else {
        updateData._statusHub = newStatus === 'em espera' ? 'aberto' : newStatus;
        updateData._statusConsole = newStatus === 'em espera' ? 'pendente' : newStatus;
      }

      // Sempre incluir _processo se foi alterado
      if (editedProcess !== ticket._processo) {
        updateData._processo = editedProcess;
      }

      // Se há uma nova mensagem, incluir no payload (apenas se foi fornecida)
      if (newMessage && newMessage.trim()) {
        const newMessageObj = {
          mensagem: newMessage,
          userName: user._userId || user.email,
          autor: 'admin',
          timestamp: new Date().toISOString()
        };
        updateData._novaMensagem = newMessageObj; // Use new backend approach
      }

      const response = endpoint === 'conteudo'
        ? await ticketsAPI.updateConteudo(ticket._id, updateData)
        : await ticketsAPI.updateGestao(ticket._id, updateData);

      if (response.success) {
        if (newMessage && newMessage.trim()) {
          setNewMessage('');
        }
        if (response.data) {
          applyServerTicket(response.data);
        } else {
          const statusConsole = updateData._statusConsole;
          const statusHub = updateData._statusHub;
          setEditedStatus(newStatus === 'em espera' ? 'em espera' : (statusConsole || statusHub || ''));
          setSelectedTicket((prev) => ({
            ...prev,
            _statusHub: statusHub ?? prev._statusHub,
            _statusConsole: statusConsole ?? prev._statusConsole,
            _processo: updateData._processo || prev._processo,
            _corpo:
              newMessage && newMessage.trim() && updateData._novaMensagem
                ? [...(prev._corpo || []), updateData._novaMensagem]
                : prev._corpo
          }));
        }
        onUpdate && onUpdate();
        showSnackbar('Status atualizado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showSnackbar('Erro ao atualizar status do ticket', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessUpdate = async () => {
    if (!ticket || !editedProcess.trim()) return;

    setIsLoading(true);
    try {
      const endpoint = ticket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
      const updateData = {
        _lastUpdatedBy: user._userId || user.email || user._userMail,
        _processo: editedProcess
      };

      const response = endpoint === 'conteudo'
        ? await ticketsAPI.updateConteudo(ticket._id, updateData)
        : await ticketsAPI.updateGestao(ticket._id, updateData);

      if (response.success) {
        if (response.data) {
          applyServerTicket(response.data);
        } else {
          setSelectedTicket((prev) => ({
            ...prev,
            _processo: editedProcess
          }));
        }
        onUpdate && onUpdate();
        showSnackbar('Processo atualizado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      showSnackbar('Erro ao atualizar processo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!ticket || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const newMessageObj = {
        mensagem: newMessage,
        userName: user._userId || user.email,
        autor: 'admin',
        timestamp: new Date().toISOString()
      };

      const updateData = {
        _lastUpdatedBy: user._userId || user.email || user._userMail,
        _novaMensagem: newMessageObj, // Send only the new message - backend handles append
        _processo: editedProcess,
        _statusHub: 'aberto',
        _statusConsole: 'pendente'
      };

      const endpoint = ticket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
      const response = endpoint === 'conteudo'
        ? await ticketsAPI.updateConteudo(ticket._id, updateData)
        : await ticketsAPI.updateGestao(ticket._id, updateData);

      if (response.success) {
        setNewMessage('');
        if (response.data) {
          applyServerTicket(response.data);
        } else {
          setEditedStatus('pendente');
          setSelectedTicket((prev) => ({
            ...prev,
            _corpo: [...(prev._corpo || []), newMessageObj],
            _processo: editedProcess,
            _statusHub: 'aberto',
            _statusConsole: 'pendente'
          }));
        }
        onUpdate && onUpdate();
        showSnackbar('Mensagem adicionada com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      showSnackbar('Erro ao adicionar mensagem', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsResolved = async () => {
    const confirmResolve = window.confirm('Tem certeza que deseja marcar este ticket como resolvido?');
    if (!confirmResolve) return;

    // Não requer mensagem obrigatória
    await handleStatusChange('resolvido');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!ticket) return null;

  const headerTicket = selectedTicket || ticket;
  const headerSolicitante =
    headerTicket._corpo && headerTicket._corpo.length > 0
      ? headerTicket._corpo[0].userName
      : 'Não informado';
  const headerDirecionamento = isTicketConteudo(ticket)
    ? headerTicket._assunto || headerTicket._direcionamento || 'Não informado'
    : headerTicket._direcionamento || 'Não informado';
  const headerData = headerTicket.createdAt
    ? new Date(headerTicket.createdAt).toLocaleDateString('pt-BR')
    : 'Não informado';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '6px',
            height: '90vh',
            width: '90%',
            maxWidth: 'none'
          },
          // Aumenta apenas os dados fixos do ticket (container superior)
          '& .MuiDialogContent-root > .MuiBox-root > .MuiBox-root > .MuiTypography-root, & .MuiDialogContent-root > .MuiBox-root > .MuiBox-root > .MuiFormControl-root, & .MuiDialogContent-root > .MuiBox-root > .MuiBox-root > .MuiChip-root': {
            fontSize: '0.9em !important'
          },
          // Mantém o restante do modal em 0.8em
          '& .MuiDialogTitle-root, & .MuiDialogContent-root, & .MuiDialogActions-root, & .MuiTypography-root, & .MuiInputBase-root, & .MuiButton-root, & .MuiChip-root, & .MuiFormControl-root, & .MuiSelect-root, & .MuiMenuItem-root, & .MuiOutlinedInput-input, & .MuiInputLabel-root': {
            fontSize: '0.8em'
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: 'Poppins',
          fontWeight: 600,
          color: 'var(--blue-dark)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          pb: 1
        }}>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: 0.5,
            columnGap: 1,
            flex: 1,
            minWidth: 0,
            pr: 1
          }}>
            <Typography component="span" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--blue-dark)', fontSize: '1rem' }}>
              {headerTicket._id}
            </Typography>
            <Typography component="span" sx={{ color: 'text.secondary', userSelect: 'none', lineHeight: 1 }} aria-hidden>·</Typography>
            <Typography component="span" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.95rem' }}>
              {headerSolicitante}
            </Typography>
            <Typography component="span" sx={{ color: 'text.secondary', userSelect: 'none', lineHeight: 1 }} aria-hidden>·</Typography>
            <Typography component="span" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-word' }}>
              {headerDirecionamento}
            </Typography>
            <Typography component="span" sx={{ color: 'text.secondary', userSelect: 'none', lineHeight: 1 }} aria-hidden>·</Typography>
            <Typography component="span" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.9rem' }}>
              {headerData}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0 }} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', height: '100%', fontSize: '0.8em' }}>
          <Box sx={{
            background: 'transparent',
            border: '1.5px solid var(--blue-dark)',
            borderRadius: '4px',
            padding: '16px',
            margin: '8px',
            flexShrink: 0,
            // Aplica 0.9em a todos os textos do container superior
            '& .MuiTypography-root, & .MuiFormControl-root, & .MuiInputBase-root, & .MuiChip-root, & .MuiSelect-root, & .MuiMenuItem-root, & .MuiOutlinedInput-input, & .MuiInputLabel-root': {
              fontSize: '0.9em !important'
            }
          }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gridTemplateRows: 'auto auto',
              gap: 2,
              mb: 0,
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'start'
            }}>
              <Box sx={{ gridColumn: 1, gridRow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Email:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket._userEmail || 'Não informado'}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: 2, gridRow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  SLA:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {calculateSLA(ticket.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: 3, gridRow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Atribuído:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket._atribuido || 'Não atribuído'}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: 4, gridRow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Status:
                </Typography>
                <Chip
                  label={selectedTicket ? (selectedTicket._statusConsole || selectedTicket._statusHub || 'Não definida') : (ticket._statusConsole || ticket._statusHub || 'Não definida')}
                  size="small"
                  sx={{
                    background: getStatusColor(selectedTicket ? (selectedTicket._statusConsole || selectedTicket._statusHub) : (ticket._statusConsole || ticket._statusHub)).background,
                    color: getStatusColor(selectedTicket ? (selectedTicket._statusConsole || selectedTicket._statusHub) : (ticket._statusConsole || ticket._statusHub)).color,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    border: 'none'
                  }}
                  variant="filled"
                />
              </Box>

              <Box sx={{ gridColumn: 1, gridRow: 2, minWidth: 0, pr: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Ocorrência:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', wordBreak: 'break-word' }}>
                  {ticket._obs || 'Não informado'}
                </Typography>
              </Box>

              <Box sx={{ gridColumn: 3, gridRow: 2, justifySelf: 'stretch', minWidth: 0, width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5, fontSize: '0.9em' }}>
                  Processo:
                </Typography>
                <FormControl
                  size="small"
                  variant="outlined"
                  fullWidth
                  sx={{
                    maxWidth: 'min(100%, 22rem)'
                  }}
                >
                  <Select
                    value={editedProcess}
                    onChange={(e) => setEditedProcess(e.target.value)}
                    disabled={isLoading}
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.9em',
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.9em',
                        py: 1
                      },
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            fontFamily: 'Poppins',
                            fontSize: '0.9em'
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="Aprovação do Gestor">Aprovação do Gestor</MenuItem>
                    <MenuItem value="Avaliação Viabilidade">Avaliação Viabilidade</MenuItem>
                    <MenuItem value="Em Desenvolvimento">Em Desenvolvimento</MenuItem>
                    <MenuItem value="Em Teste">Em Teste</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{
                gridColumn: 4,
                gridRow: 2,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                alignSelf: 'end',
                gap: 1,
                minWidth: 0
              }}>
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange('em espera')}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--yellow)',
                    borderColor: 'var(--yellow)',
                    fontSize: '0.9em',
                    px: 2,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: 'var(--yellow)',
                      color: 'white',
                      borderColor: 'var(--yellow)'
                    }
                  }}
                >
                  Em Espera
                </Button>
                <Button
                  variant="contained"
                  onClick={handleMarkAsResolved}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: 'var(--blue-dark)',
                    fontSize: '0.9em',
                    px: 2,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: 'var(--blue-medium)'
                    }
                  }}
                >
                  Resolvido
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Scrollable messages area */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 1,
            minHeight: 0
          }}>
            {selectedTicket && selectedTicket._corpo && selectedTicket._corpo.length > 0 ? (
              selectedTicket._corpo.map((mensagem, index) => (
                <Box key={`${mensagem.timestamp}-${index}`} sx={{
                  mb: 1,
                  p: 1.5,
                  backgroundColor: 'var(--cor-container)',
                  borderRadius: '4px',
                  borderBottom: index < selectedTicket._corpo.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      color: mensagem.autor === 'admin' ? 'var(--blue-dark)' : 'var(--blue-medium)',
                      fontSize: '1rem'
                    }}
                  >
                    {mensagem.userName} <span style={{
                      fontStyle: 'italic',
                      color: 'black',
                      fontSize: '0.75rem',
                      fontWeight: 300
                    }}>
                      {new Date(mensagem.timestamp).toLocaleDateString('pt-BR')}, {new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins', mt: 0.5 }}>
                    {mensagem.mensagem}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ fontFamily: 'Poppins', textAlign: 'center', py: 4 }}>
                Não há mensagens no ticket
              </Typography>
            )}
          </Box>

          {/* Fixed message input at bottom */}
          <Box sx={{
            flexShrink: 0,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            p: 2,
            backgroundColor: 'transparent'
          }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1em !important'
                  }
                }}
              />
              <IconButton
                onClick={handleAddMessage}
                disabled={!newMessage.trim() || isLoading}
                sx={{
                  color: newMessage.trim() ? 'var(--blue-medium)' : 'var(--blue-opaque)',
                  opacity: newMessage.trim() ? 1 : 0.5,
                  '&:hover': {
                    color: 'var(--blue-dark)',
                    opacity: 1
                  },
                  '&.Mui-disabled': {
                    color: 'var(--blue-opaque)',
                    opacity: 0.5
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </DialogContent>

      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalAtribuido;