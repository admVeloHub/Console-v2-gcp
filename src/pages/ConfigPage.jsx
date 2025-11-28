// VERSION: v3.9.4 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Close,
  PersonAdd,
  Security
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/common/BackButton';
import { 
  getAllAuthorizedUsers, 
  addAuthorizedUser, 
  updateAuthorizedUser, 
  removeAuthorizedUser 
} from '../services/userService';

const ConfigPage = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);


  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Carregando usuários...');
      
      let usersData = [];
      try {
        usersData = await getAllAuthorizedUsers();
        console.log('Usuários carregados da API:', usersData);
      } catch (apiError) {
        console.log('⚠️ API não disponível, carregando do localStorage...');
        // Fallback: carregar do localStorage
        const localUsersString = localStorage.getItem('authorizedUsers');
        console.log('🔍 DEBUG - localStorage raw:', localUsersString);
        const localUsers = JSON.parse(localUsersString || '[]');
        usersData = localUsers;
        console.log('🔍 DEBUG - Usuários carregados do localStorage:', usersData);
        console.log('🔍 DEBUG - Quantidade de usuários no localStorage:', usersData.length);
      }
      
      setUsers(usersData || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsers([]);
      // Mostrar erro apenas se não for erro de API indisponível
      if (!error.message?.includes('API não disponível')) {
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao carregar usuários';
        alert(`Erro: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const [openUserModal, setOpenUserModal] = useState(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [modalStep, setModalStep] = useState(1); // 1 = dados básicos, 2 = permissões
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    funcao: ''
  });
  const [permissionsData, setPermissionsData] = useState({
    permissoes: {
      artigos: false,
      velonews: false,
      botPerguntas: false,
      botAnalises: false,
      hubAnalises: false,
      chamadosInternos: true,
      igp: false,
      qualidade: false,
      capacity: false,
      config: false,
      servicos: false,
      academy: false
    },
    tiposTickets: {
      artigos: false,
      processos: false,
      roteiros: false,
      treinamentos: false,
      funcionalidades: false,
      recursos: false,
      gestao: false,
      rhFin: false,
      facilities: false
    },
    funcoesAdministrativas: {
      avaliador: false,
      auditoria: false,
      relatoriosGestao: false
    }
  });

  // Mapeamento dos cards da tela inicial
  const cardPermissions = [
    { key: 'artigos', label: 'Artigos' },
    { key: 'velonews', label: 'Velonews' },
    { key: 'botPerguntas', label: 'Bot Perguntas' },
    { key: 'botAnalises', label: 'Bot Análises' },
    { key: 'hubAnalises', label: 'Hub Análises' },
    { key: 'chamadosInternos', label: 'Chamados Internos' },
    { key: 'igp', label: 'IGP' },
    { key: 'qualidade', label: 'Qualidade' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'config', label: 'Config' },
    { key: 'servicos', label: 'Serviços' },
    { key: 'academy', label: 'Academy' }
  ];

  // Mapeamento dos tipos de tickets dos chamados internos
  const ticketTypes = [
    { key: 'artigos', label: 'Artigos' },
    { key: 'processos', label: 'Velobot' },
    { key: 'roteiros', label: 'Roteiros' },
    { key: 'treinamentos', label: 'Treinamentos' },
    { key: 'funcionalidades', label: 'Funcionalidades' },
    { key: 'recursos', label: 'Recursos' },
    { key: 'gestao', label: 'Gestão' },
    { key: 'rhFin', label: 'RH & Fin' },
    { key: 'facilities', label: 'Facilities' }
  ];

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user._userMail,
        nome: user._userId,
        funcao: user._userRole
      });
      // Carregar permissões atuais do usuário para edição
      setPermissionsData({
        permissoes: user._userClearance || {
          artigos: false,
          velonews: false,
          botPerguntas: false,
          botAnalises: false,
          hubAnalises: false,
          chamadosInternos: true,
          igp: false,
          qualidade: false,
          capacity: false,
          config: false,
          servicos: false
        },
        tiposTickets: user._userTickets || {
          artigos: false,
          processos: false,
          roteiros: false,
          treinamentos: false,
          funcionalidades: false,
          recursos: false,
          gestao: false,
          rhFin: false,
          facilities: false
        },
        funcoesAdministrativas: {
          avaliador: user._funcoesAdministrativas?.avaliador || false,
          auditoria: user._funcoesAdministrativas?.auditoria || false,
          relatoriosGestao: user._funcoesAdministrativas?.relatoriosGestao || false
        }
      });
      setModalStep(1); // Para edição, sempre começar na etapa 1
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        nome: '',
        funcao: ''
      });
      setPermissionsData({
        permissoes: {
          artigos: false,
          velonews: false,
          botPerguntas: false,
          botAnalises: false,
          hubAnalises: false,
          chamadosInternos: true,
          igp: false,
          qualidade: false,
          capacity: false,
          config: false,
          servicos: false,
          academy: false
        },
        tiposTickets: {
          artigos: false,
          processos: false,
          roteiros: false,
          treinamentos: false,
          funcionalidades: false,
          recursos: false,
          gestao: false,
          rhFin: false,
          facilities: false
        },
        funcoesAdministrativas: {
          avaliador: false,
          auditoria: false,
          relatoriosGestao: false
        }
      });
      setModalStep(1); // Para novo usuário, começar na etapa 1
    }
    setOpenUserModal(true);
  };

  const handleCloseUserModal = () => {
    setOpenUserModal(false);
    setEditingUser(null);
    setModalStep(1);
    setFormData({
      email: '',
      nome: '',
      funcao: ''
    });
    setPermissionsData({
        permissoes: {
          artigos: false,
          velonews: false,
          botPerguntas: false,
          botAnalises: false,
          chamadosInternos: true,
          igp: false,
          qualidade: false,
          capacity: false,
          config: false,
          servicos: false
        },
        tiposTickets: {
          artigos: false,
          processos: false,
          roteiros: false,
          treinamentos: false,
          funcionalidades: false,
          recursos: false,
          gestao: false,
          rhFin: false,
          facilities: false
        },
        funcoesAdministrativas: {
          avaliador: false,
          auditoria: false,
          relatoriosGestao: false
        }
      });
  };

  const handleOpenPermissionsModal = (user) => {
    setSelectedUser(user);
    
    // Inicializar permissionsData com os dados atuais do usuário
    setPermissionsData({
      permissoes: user._userClearance || {
        artigos: false,
        velonews: false,
        botPerguntas: false,
        botAnalises: false,
        hubAnalises: false,
        chamadosInternos: true,
        igp: false,
        qualidade: false,
        capacity: false,
        config: false,
        servicos: false
      },
      tiposTickets: user._userTickets || {
        artigos: false,
        processos: false,
        roteiros: false,
        treinamentos: false,
        funcionalidades: false,
        recursos: false,
        gestao: false,
        rhFin: false,
        facilities: false
      },
      funcoesAdministrativas: {
        avaliador: user._funcoesAdministrativas?.avaliador || false,
        auditoria: user._funcoesAdministrativas?.auditoria || false,
        relatoriosGestao: user._funcoesAdministrativas?.relatoriosGestao || false
      }
    });
    
    setOpenPermissionsModal(true);
  };

  const handleClosePermissionsModal = () => {
    setOpenPermissionsModal(false);
    setSelectedUser(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('💾 Salvando permissões para usuário:', selectedUser._userMail);
      console.log('📋 Permissões dos cards:', permissionsData.permissoes);
      console.log('🎫 Tipos de tickets:', permissionsData.tiposTickets);
      console.log('🔧 Funções administrativas:', permissionsData.funcoesAdministrativas);
      
      // Atualizar usuário com as novas permissões - CORRIGIDO: usar dados do permissionsData
      const updatedUser = await updateAuthorizedUser(selectedUser._userMail, {
        _userClearance: permissionsData.permissoes,
        _userTickets: permissionsData.tiposTickets,
        _funcoesAdministrativas: permissionsData.funcoesAdministrativas
      });
      
      console.log('✅ Permissões salvas com sucesso!');
      console.log('📊 Usuário atualizado retornado pelo backend:', updatedUser);
      
      // ✅ Atualizar estado local com dados retornados pelo backend
      setUsers(prevUsers => 
        (prevUsers || []).map(user => 
          user._userMail === selectedUser._userMail 
            ? (updatedUser.data || user) // Usar dados do backend (estrutura correta)
            : user
        )
      );
      
      // 🔄 Invalidar cache do usuário logado se for o mesmo usuário
      if (currentUser && currentUser.email === selectedUser._userMail) {
        console.log('🔄 Invalidando cache do usuário logado');
        updateUser(updatedUser.data);
      }
      
      // 📢 Notificar outros usuários sobre mudança de permissões
      console.log('📢 Notificando mudança de permissões para outros usuários');
      // Em um sistema real, aqui seria enviado um WebSocket ou Server-Sent Events
      // Para agora, apenas logamos a notificação
      
      // Fechar modal
      handleClosePermissionsModal();
      
      // Mostrar feedback de sucesso
      showSnackbar('✅ Permissões salvas com sucesso! Cache invalidado.', 'success');
      
    } catch (error) {
      console.error('❌ Erro ao salvar permissões:', error);
      showSnackbar(`❌ Erro ao salvar permissões: ${error.message}`, 'error');
    }
  };

  const handleNextStep = () => {
    setModalStep(2);
  };

  const handlePrevStep = () => {
    setModalStep(1);
  };

  const handleSaveUser = async () => {
    try {
      // Validação de campos obrigatórios
      if (!formData.email || !formData.email.trim()) {
        showSnackbar('❌ Email é obrigatório', 'error');
        return;
      }
      
      if (!formData.nome || !formData.nome.trim()) {
        showSnackbar('❌ Nome é obrigatório', 'error');
        return;
      }
      
      if (!formData.funcao || !formData.funcao.trim()) {
        showSnackbar('❌ Função é obrigatória', 'error');
        return;
      }
      
      let updateData = null;
      
      if (editingUser) {
        // Editar usuário existente - incluir permissões se estiver na etapa 2
        updateData = modalStep === 2 ? {
          _userMail: formData.email.trim(),
          _userId: formData.nome.trim(),
          _userRole: formData.funcao.trim(),
          _userClearance: permissionsData.permissoes || {},
          _userTickets: permissionsData.tiposTickets || {},
          _funcoesAdministrativas: permissionsData.funcoesAdministrativas || {}
        } : {
          _userMail: formData.email.trim(),
          _userId: formData.nome.trim(),
          _userRole: formData.funcao.trim()
        };
        await updateAuthorizedUser(editingUser._userMail, updateData);
      } else {
        // Adicionar novo usuário
        const newUser = {
          _userMail: formData.email.trim(),
          _userId: formData.nome.trim(),
          _userRole: formData.funcao.trim(),
          _userClearance: permissionsData.permissoes || {},
          _userTickets: permissionsData.tiposTickets || {},
          _funcoesAdministrativas: permissionsData.funcoesAdministrativas || {}
        };
        
        console.log('📤 Criando novo usuário com dados:', newUser);
        await addAuthorizedUser(newUser);
      }
      
      // ✅ Atualizar estado local em vez de recarregar do backend
      if (editingUser && updateData) {
        // Para edição, atualizar o usuário existente na lista
        setUsers(prevUsers => 
          (prevUsers || []).map(user => 
            user._userMail === editingUser._userMail 
              ? { ...user, ...updateData }
              : user
          )
        );
      } else {
        // Para novo usuário, recarregar apenas se necessário
        await loadUsers();
      }
      handleCloseUserModal();
      
      // Mostrar feedback de sucesso
      showSnackbar('✅ Usuário salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      // Melhorar feedback de erro
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao salvar usuário';
      showSnackbar(`❌ Erro ao salvar usuário: ${errorMessage}`, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const userToDelete = users?.find(user => user._id === userId);
    if (userToDelete) {
        await removeAuthorizedUser(userToDelete._userMail);
        // ✅ Atualizar estado local em vez de recarregar do backend
        setUsers(prevUsers => 
          (prevUsers || []).filter(user => user._id !== userId)
        );
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao remover usuário';
      alert(`Erro: ${errorMessage}`);
    }
  };

  const handleModalPermissionChange = (permission, checked) => {
    setPermissionsData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permission]: checked
      }
    }));
  };

  const handleModalTicketTypeChange = (ticketType, checked) => {
    setPermissionsData(prev => ({
      ...prev,
      tiposTickets: {
        ...prev.tiposTickets,
        [ticketType]: checked
      }
    }));
  };

  const handleModalFuncaoAdministrativaChange = (funcao, checked) => {
    setPermissionsData(prev => ({
      ...prev,
      funcoesAdministrativas: {
        ...prev.funcoesAdministrativas,
        [funcao]: checked
      }
    }));
  };

  const handlePermissionChange = (permission, checked) => {
    if (selectedUser) {
      // Apenas atualizar o estado local do modal (sem chamada API)
      setPermissionsData(prev => ({
        ...prev,
        permissoes: {
          ...prev.permissoes,
          [permission]: checked
        }
      }));
      
      // Atualizar selectedUser para refletir no modal
      setSelectedUser(prev => ({
        ...prev,
        _userClearance: {
          ...prev._userClearance,
          [permission]: checked
        }
      }));
    }
  };

  const handleTicketTypeChange = (ticketType, checked) => {
    if (selectedUser) {
      // Apenas atualizar o estado local do modal (sem chamada API)
      setPermissionsData(prev => ({
        ...prev,
        tiposTickets: {
          ...prev.tiposTickets,
          [ticketType]: checked
        }
      }));
      
      // Atualizar selectedUser para refletir no modal
      setSelectedUser(prev => ({
        ...prev,
        _userTickets: {
          ...prev._userTickets,
          [ticketType]: checked
        }
      }));
    }
  };


  const getFuncaoColor = (funcao) => {
    const funcaoLower = funcao?.toLowerCase();
    switch (funcaoLower) {
      case 'administrador':
        return 'error'; // Vermelho para administrador
      case 'gestão':
      case 'gestao':
        return 'primary'; // Azul para gestão
      case 'monitor':
        return 'success'; // Verde para monitor
      case 'editor':
        return 'secondary'; // Cinza para editor
      default:
        return 'default'; // Cinza padrão
    }
  };

  const getFuncaoStyle = (funcao) => {
    const funcaoLower = funcao?.toLowerCase();
    switch (funcaoLower) {
      case 'administrador':
        // RECICLAGEM: Amarelo → Azul Médio
        return {
          background: 'linear-gradient(135deg, #FCC200 0%, #FCC200 60%, #1634FF 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: '20px'
        };
      case 'gestão':
      case 'gestao':
        // ATUALIZAÇÃO: Azul Escuro → Amarelo
        return {
          background: 'linear-gradient(135deg, #000058 0%, #000058 60%, #FCC200 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: '20px'
        };
      case 'monitor':
        // MONITOR: Verde → Azul Claro
        return {
          background: 'linear-gradient(135deg, #15A237 0%, #15A237 60%, #1694FF 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: '20px'
        };
      case 'editor':
        // ESSENCIAL: Azul Médio → Azul Claro
        return {
          background: 'linear-gradient(135deg, #1634FF 0%, #1634FF 60%, #1694FF 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: '20px'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #9e9e9e 0%, #9e9e9e 60%, #e0e0e0 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: '20px'
        };
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 4 }}>
        <Box sx={{ position: 'absolute', left: 0 }}>
          <BackButton />
        </Box>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Config
        </Typography>
      </Box>

      {/* Card de Controle de Acessos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security sx={{ color: 'var(--blue-medium)', fontSize: '2rem' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  color: 'var(--blue-dark)'
                }}
              >
                Controle de Acessos
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => handleOpenUserModal()}
              sx={{
                backgroundColor: 'var(--blue-medium)',
                '&:hover': {
                  backgroundColor: 'var(--blue-dark)'
                }
              }}
            >
              Novo Usuário
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Usuário
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Função
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Permissões
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users && Array.isArray(users) ? users.filter(user => user).map((user) => (
                  <TableRow 
                    key={user._id || `user-${Math.random()}`}
                    hover
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'var(--cor-container)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                          {user._userId || 'Nome não definido'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins' }}>
                          {user._userMail || 'Email não definido'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user._userRole || 'Não definida'}
                        size="small"
                        sx={{ 
                          ...getFuncaoStyle(user._userRole || 'Não definida'),
                          fontFamily: 'Poppins', 
                          fontWeight: 500 
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(user._userClearance || {}).map(([key, hasPermission]) => {
                          const permission = cardPermissions.find(p => p.key === key);
                          return hasPermission ? (
                            <Chip
                              key={key}
                              label={permission?.label || 'Permissão'}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: '20px',
                                fontFamily: 'Poppins'
                              }}
                            />
                          ) : null;
                        })}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Gerenciar Permissões">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPermissionsModal(user)}
                            sx={{ 
                              color: 'var(--blue-medium)',
                              '&:hover': {
                                backgroundColor: 'var(--blue-medium)',
                                color: 'white'
                              }
                            }}
                          >
                            <Security />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenUserModal(user)}
                            sx={{ 
                              color: 'var(--yellow)',
                              '&:hover': {
                                backgroundColor: 'var(--yellow)',
                                color: 'white'
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user._id || '')}
                            sx={{ 
                              color: 'var(--red)',
                              '&:hover': {
                                backgroundColor: 'var(--red)',
                                color: 'white'
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', fontFamily: 'Poppins' }}>
                      {loading ? 'Carregando usuários...' : 'Nenhum usuário encontrado'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal de Usuário - 2 Etapas */}
      <Dialog 
        open={openUserModal} 
        onClose={handleCloseUserModal}
        maxWidth={modalStep === 1 ? "sm" : "md"}
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins',
          fontWeight: 600,
          color: 'var(--blue-dark)'
        }}>
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'} - Etapa {modalStep} de 2
          <IconButton
            aria-label="close"
            onClick={handleCloseUserModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {modalStep === 1 ? (
            // ETAPA 1: Dados Básicos
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
              sx={{ fontFamily: 'Poppins' }}
            />
            <TextField
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              fullWidth
              required
              sx={{ fontFamily: 'Poppins' }}
            />
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={formData.funcao}
                label="Função"
                onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                sx={{ fontFamily: 'Poppins' }}
              >
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="Gestão">Gestão</MenuItem>
                <MenuItem value="Monitor">Monitor</MenuItem>
                <MenuItem value="Editor">Editor</MenuItem>
              </Select>
            </FormControl>
          </Box>
          ) : (
            // ETAPA 2: Permissões
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 2 }}>
                Módulos Disponíveis
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {cardPermissions.map((permission) => (
                  <Grid item xs={12} sm={6} key={permission.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissionsData.permissoes[permission.key] || false}
                          onChange={(e) => handleModalPermissionChange(permission.key, e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                            {permission.label}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 2 }}>
                Tipos de Tickets Liberados
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {ticketTypes.map((ticketType) => (
                  <Grid item xs={12} sm={6} key={ticketType.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissionsData.tiposTickets[ticketType.key] || false}
                          onChange={(e) => handleModalTicketTypeChange(ticketType.key, e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                            {ticketType.label}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Seção Funções Administrativas - apenas para Gestão, Monitor e Administrador */}
              {(formData.funcao === 'Gestão' || formData.funcao === 'Monitor' || formData.funcao === 'Administrador') && (
                <>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Poppins', 
                    fontWeight: 600, 
                    mb: 2,
                    color: 'var(--blue-dark)'
                  }}>
                    Funções Administrativas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={permissionsData.funcoesAdministrativas.avaliador || false}
                            onChange={(e) => handleModalFuncaoAdministrativaChange('avaliador', e.target.checked)}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                              Avaliador
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'Poppins', 
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}>
                              Pode avaliar funcionários no módulo Qualidade
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={permissionsData.funcoesAdministrativas.auditoria || false}
                            onChange={(e) => handleModalFuncaoAdministrativaChange('auditoria', e.target.checked)}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                              Auditoria
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'Poppins', 
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}>
                              Acesso às funcionalidades de auditoria do sistema
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={permissionsData.funcoesAdministrativas.relatoriosGestao || false}
                            onChange={(e) => handleModalFuncaoAdministrativaChange('relatoriosGestao', e.target.checked)}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                              Relatórios De Gestão
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'Poppins', 
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}>
                              Acesso aos relatórios gerenciais e de gestão
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserModal} sx={{ color: 'var(--blue-dark)' }}>
            Cancelar
          </Button>
          {modalStep === 1 ? (
            <>
              <Button 
                onClick={handleNextStep}
                variant="contained"
                disabled={!formData.email || !formData.nome || !formData.funcao}
                sx={{
                  backgroundColor: 'var(--blue-medium)',
                  '&:hover': {
                    backgroundColor: 'var(--blue-dark)'
                  }
                }}
              >
                Próximo
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handlePrevStep} sx={{ color: 'var(--blue-dark)' }}>
                Voltar
          </Button>
          <Button 
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              backgroundColor: 'var(--blue-medium)',
              '&:hover': {
                backgroundColor: 'var(--blue-dark)'
              }
            }}
          >
            {editingUser ? 'Atualizar' : 'Criar'}
          </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Permissões */}
      <Dialog 
        open={openPermissionsModal} 
        onClose={handleClosePermissionsModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins',
          fontWeight: 600,
          color: 'var(--blue-dark)'
        }}>
          {selectedUser?._userId || selectedUser?._userMail}
          <IconButton
            aria-label="close"
            onClick={handleClosePermissionsModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Box sx={{ mt: 2 }}>
            {/* Seção de Permissões dos Cards */}
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins', 
              fontWeight: 600, 
              color: 'var(--blue-dark)',
              mb: 2
            }}>
              Permissões dos Cards da Tela Inicial
            </Typography>
            
            <Grid container spacing={1.5}>
              {cardPermissions.map((permission) => (
                <Grid item xs={12} sm={6} md={4} key={permission.key}>
                  <Card sx={{ 
                    border: selectedUser?._userClearance[permission.key] 
                      ? '2px solid var(--blue-medium)' 
                      : '1px solid var(--gray-light)',
                    backgroundColor: selectedUser?._userClearance[permission.key] 
                      ? 'var(--cor-container)' 
                      : 'white',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'var(--blue-medium)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent sx={{ 
                      pt: 2,
                      pb: 0,
                      px: 1.5,
                      minHeight: '60px'
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedUser?._userClearance[permission.key] || false}
                            onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                            sx={{
                              color: 'var(--blue-medium)',
                              '&.Mui-checked': {
                                color: 'var(--blue-medium)',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 600,
                            color: 'var(--blue-dark)',
                            fontSize: '0.9rem',
                            ml: 1
                          }}>
                            {permission.label}
                          </Typography>
                        }
                        sx={{ 
                          width: '100%', 
                          margin: 0, 
                          alignItems: 'center'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Seção de Tipos de Tickets */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600, 
                color: 'var(--blue-dark)',
                mb: 2
              }}>
                Tipos de Tickets dos Chamados Internos
              </Typography>
              
              <Grid container spacing={1.5}>
                {ticketTypes.map((ticketType) => (
                  <Grid item xs={12} sm={6} md={4} key={ticketType.key}>
                    <Card sx={{ 
                      border: selectedUser?._userTickets[ticketType.key] 
                        ? '2px solid var(--yellow)' 
                        : '1px solid var(--gray-light)',
                      backgroundColor: selectedUser?._userTickets[ticketType.key] 
                        ? 'rgba(252, 194, 0, 0.1)' 
                        : 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'var(--yellow)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ 
                        pt: 2,
                        pb: 0,
                        px: 1.5,
                        minHeight: '60px'
                      }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedUser?._userTickets[ticketType.key] || false}
                              onChange={(e) => handleTicketTypeChange(ticketType.key, e.target.checked)}
                              sx={{
                                color: 'var(--yellow)',
                                '&.Mui-checked': {
                                  color: 'var(--yellow)',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ 
                              fontFamily: 'Poppins', 
                              fontWeight: 600,
                              color: 'var(--blue-dark)',
                              fontSize: '0.9rem',
                              ml: 1
                            }}>
                              {ticketType.label}
                            </Typography>
                          }
                          sx={{ 
                            width: '100%', 
                            margin: 0, 
                            alignItems: 'center'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSavePermissions} 
            variant="contained"
            sx={{ 
              backgroundColor: 'var(--blue-medium)',
              color: 'white',
              fontFamily: 'Poppins',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'var(--blue-dark)'
              }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConfigPage;
