// VERSION: v1.3.2 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
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

  // Atualizar estados quando ticket muda
  useEffect(() => {
    if (ticket) {
      setEditedStatus(ticket._statusHub || ticket._statusConsole || '');
      setEditedProcess(ticket._processo || '');
      setNewMessage('');
      setSelectedTicket(ticket);
    }
  }, [ticket]);

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
        setEditedStatus(newStatus === 'em espera' ? 'em espera' : newStatus);
        if (newMessage && newMessage.trim()) {
          setNewMessage('');
        }
        // Update ticket state immediately for real-time UI updates
        setSelectedTicket(prev => ({
          ...prev,
          _statusHub: updateData._statusHub,
          _statusConsole: updateData._statusConsole,
          _processo: updateData._processo || prev._processo,
          _corpo: newMessage && newMessage.trim() ? [...(prev._corpo || []), updateData._novaMensagem] : prev._corpo
        }));
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
        // Update ticket state immediately for real-time UI updates
        setSelectedTicket(prev => ({
          ...prev,
          _processo: editedProcess
        }));
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
        setEditedStatus('pendente');
        // Update local state by appending to existing corpo
        setSelectedTicket(prev => ({
          ...prev,
          _corpo: [...(prev._corpo || []), newMessageObj],
          _processo: editedProcess,
          _statusHub: 'aberto',
          _statusConsole: 'pendente'
        }));
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
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
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}>
          {isTicketConteudo(ticket) ?
            `${ticket._id} - ${ticket._tipo} - ${ticket._assunto || ticket._direcionamento || 'Não informado'}` :
            `${ticket._id} - ${ticket._tipo} - ${ticket._direcionamento || 'Não informado'}`
          }
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', height: '100%', fontSize: '0.8em' }}>
          <Box sx={{
            background: 'transparent',
            border: '1.5px solid var(--blue-dark)',
            borderRadius: '8px',
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
              gap: 2,
              mb: 0,
              width: '100%',
              justifyContent: 'flex-start'
            }}>
              {/* Linha 1 */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Solicitante:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket._corpo && ticket._corpo.length > 0 ? ticket._corpo[0].userName : 'Não informado'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Email:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket._userEmail || 'Não informado'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Data:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  SLA:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {calculateSLA(ticket.createdAt)}
                </Typography>
              </Box>
              {/* Linha 2 correta */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  {isTicketConteudo(ticket) ? 'Assunto/Direcionamento:' : 'Direcionamento:'}
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {isTicketConteudo(ticket) ? (ticket._assunto || ticket._direcionamento || 'Não informado') : (ticket._direcionamento || 'Não informado')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Atribuído:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket._atribuido || 'Não atribuído'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Processo:
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editedProcess}
                    onChange={(e) => setEditedProcess(e.target.value)}
                    disabled={isLoading}
                    sx={{
                      fontFamily: 'Poppins',
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins'
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
              <Box>
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

              {/* Linha 2 removida (duplicada) */}
              {/* Botões removidos daqui para reposicionamento */}

            </Box>
            {/* Removido bloco excedente de botões duplicados */}

            {/* Ocorrência - Full Width Row */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 0.5 }}>
                  Ocorrência:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {ticket._obs || 'Não informado'}
                </Typography>
              </Box>
              {/* Botões Em Espera e Resolvido - MESMA linha, alinhados à direita */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2,
                ml: 2
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
                  borderRadius: 1,
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