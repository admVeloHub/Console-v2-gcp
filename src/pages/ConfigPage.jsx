// VERSION: v3.3.8 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
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
  Alert
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
  const [users, setUsers] = useState(getAllAuthorizedUsers());

  const [openUserModal, setOpenUserModal] = useState(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    funcao: ''
  });

  // Mapeamento dos cards da tela inicial
  const cardPermissions = [
    { key: 'artigos', label: 'Artigos', description: 'Gerenciamento de artigos' },
    { key: 'velonews', label: 'Velonews', description: 'Sistema de notícias' },
    { key: 'botPerguntas', label: 'Bot Perguntas', description: 'Sistema de perguntas automáticas' },
    { key: 'chamadosInternos', label: 'Chamados Internos', description: 'Sistema de tickets' },
    { key: 'igp', label: 'IGP', description: 'Indicadores de gestão' },
    { key: 'qualidade', label: 'Qualidade', description: 'Controle de qualidade' },
    { key: 'capacity', label: 'Capacity', description: 'Gestão de capacidade' },
    { key: 'config', label: 'Config', description: 'Configurações do sistema' }
  ];

  // Mapeamento dos tipos de tickets dos chamados internos
  const ticketTypes = [
    { key: 'artigos', label: 'Artigos', description: 'Tickets relacionados a artigos' },
    { key: 'processos', label: 'Processos', description: 'Tickets sobre processos internos' },
    { key: 'roteiros', label: 'Roteiros', description: 'Tickets de roteiros e procedimentos' },
    { key: 'treinamentos', label: 'Treinamentos', description: 'Tickets sobre treinamentos' },
    { key: 'funcionalidades', label: 'Funcionalidades', description: 'Tickets de novas funcionalidades' },
    { key: 'recursos', label: 'Recursos', description: 'Tickets sobre recursos do sistema' },
    { key: 'gestao', label: 'Gestão', description: 'Tickets de gestão e administração' },
    { key: 'rhFin', label: 'RH & Fin', description: 'Tickets de recursos humanos e financeiro' },
    { key: 'facilities', label: 'Facilities', description: 'Tickets de infraestrutura e facilities' }
  ];

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        nome: user.nome,
        funcao: user.funcao
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        nome: '',
        funcao: ''
      });
    }
    setOpenUserModal(true);
  };

  const handleCloseUserModal = () => {
    setOpenUserModal(false);
    setEditingUser(null);
    setFormData({
      email: '',
      nome: '',
      funcao: ''
    });
  };

  const handleOpenPermissionsModal = (user) => {
    setSelectedUser(user);
    setOpenPermissionsModal(true);
  };

  const handleClosePermissionsModal = () => {
    setOpenPermissionsModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      // Editar usuário existente
      const updatedUser = updateAuthorizedUser(editingUser.email, formData);
      if (updatedUser) {
        setUsers(getAllAuthorizedUsers());
      }
    } else {
      // Adicionar novo usuário
      const newUser = {
        ...formData,
        permissoes: {
          artigos: false,
          velonews: false,
          botPerguntas: false,
          chamadosInternos: false,
          igp: false,
          qualidade: false,
          capacity: false,
          config: false
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
        }
      };
      addAuthorizedUser(newUser);
      setUsers(getAllAuthorizedUsers());
    }
    handleCloseUserModal();
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete) {
      removeAuthorizedUser(userToDelete.email);
      setUsers(getAllAuthorizedUsers());
    }
  };

  const handlePermissionChange = (permission, checked) => {
    if (selectedUser) {
      const updatedUser = {
        ...selectedUser,
        permissoes: {
          ...selectedUser.permissoes,
          [permission]: checked
        }
      };
      
      // Atualizar o selectedUser para refletir imediatamente no modal
      setSelectedUser(updatedUser);
      
      // Atualizar no serviço de usuários
      updateAuthorizedUser(selectedUser.email, updatedUser);
      setUsers(getAllAuthorizedUsers());

      // Se é o usuário logado, atualizar o AuthContext e localStorage
      if (currentUser && currentUser.email === selectedUser.email) {
        updateUser(updatedUser);
      }
    }
  };

  const handleTicketTypeChange = (ticketType, checked) => {
    if (selectedUser) {
      const updatedUser = {
        ...selectedUser,
        tiposTickets: {
          ...selectedUser.tiposTickets,
          [ticketType]: checked
        }
      };
      
      // Atualizar o selectedUser para refletir imediatamente no modal
      setSelectedUser(updatedUser);
      
      // Atualizar no serviço de usuários
      updateAuthorizedUser(selectedUser.email, updatedUser);
      setUsers(getAllAuthorizedUsers());

      // Se é o usuário logado, atualizar o AuthContext e localStorage
      if (currentUser && currentUser.email === selectedUser.email) {
        updateUser(updatedUser);
      }
    }
  };


  const getFuncaoColor = (funcao) => {
    switch (funcao) {
      case 'Administrador':
        return 'error';
      case 'Gestão':
        return 'primary';
      case 'Editor':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
      <BackButton />
      
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Configurações do Sistema
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontFamily: 'Poppins' }}
        >
          Gerencie usuários e controle de acessos
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
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
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
                          {user.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins' }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.funcao}
                        size="small"
                        color={getFuncaoColor(user.funcao)}
                        sx={{ fontFamily: 'Poppins', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(user.permissoes).map(([key, hasPermission]) => {
                          const permission = cardPermissions.find(p => p.key === key);
                          return hasPermission ? (
                            <Chip
                              key={key}
                              label={permission?.label}
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
                            onClick={() => handleDeleteUser(user.id)}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal de Usuário */}
      <Dialog 
        open={openUserModal} 
        onClose={handleCloseUserModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins',
          fontWeight: 600,
          color: 'var(--blue-dark)'
        }}>
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                <MenuItem value="Editor">Editor</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserModal} sx={{ color: 'var(--blue-dark)' }}>
            Cancelar
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
          Permissões - {selectedUser?.nome}
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
            <Alert severity="info" sx={{ mb: 3, fontFamily: 'Poppins' }}>
              Selecione quais funcionalidades este usuário pode acessar na tela inicial.
            </Alert>
            
            <Grid container spacing={1.5}>
              {cardPermissions.map((permission) => (
                <Grid item xs={12} sm={6} md={4} key={permission.key}>
                  <Card sx={{ 
                    border: selectedUser?.permissoes[permission.key] 
                      ? '2px solid var(--blue-medium)' 
                      : '1px solid var(--gray-light)',
                    backgroundColor: selectedUser?.permissoes[permission.key] 
                      ? 'var(--cor-container)' 
                      : 'white',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'var(--blue-medium)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedUser?.permissoes[permission.key] || false}
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
                          <Box sx={{ ml: 1 }}>
                            <Typography sx={{ 
                              fontFamily: 'Poppins', 
                              fontWeight: 600,
                              color: 'var(--blue-dark)',
                              fontSize: '0.9rem'
                            }}>
                              {permission.label}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'Poppins',
                              color: 'var(--gray)',
                              fontSize: '0.8rem'
                            }}>
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%', margin: 0, alignItems: 'flex-start' }}
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
              <Alert severity="warning" sx={{ mb: 3, fontFamily: 'Poppins' }}>
                Selecione quais tipos de tickets este usuário pode visualizar no sistema de chamados internos.
              </Alert>
              
              <Grid container spacing={1.5}>
                {ticketTypes.map((ticketType) => (
                  <Grid item xs={12} sm={6} md={4} key={ticketType.key}>
                    <Card sx={{ 
                      border: selectedUser?.tiposTickets[ticketType.key] 
                        ? '2px solid var(--yellow)' 
                        : '1px solid var(--gray-light)',
                      backgroundColor: selectedUser?.tiposTickets[ticketType.key] 
                        ? 'rgba(252, 194, 0, 0.1)' 
                        : 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'var(--yellow)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedUser?.tiposTickets[ticketType.key] || false}
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
                            <Box sx={{ ml: 1 }}>
                              <Typography sx={{ 
                                fontFamily: 'Poppins', 
                                fontWeight: 600,
                                color: 'var(--blue-dark)',
                                fontSize: '0.9rem'
                              }}>
                                {ticketType.label}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'Poppins',
                                color: 'var(--gray)',
                                fontSize: '0.8rem'
                              }}>
                                {ticketType.description}
                              </Typography>
                            </Box>
                          }
                          sx={{ width: '100%', margin: 0, alignItems: 'flex-start' }}
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
          <Button onClick={handleClosePermissionsModal} sx={{ color: 'var(--blue-dark)' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConfigPage;
