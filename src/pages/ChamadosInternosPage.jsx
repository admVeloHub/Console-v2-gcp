// VERSION: v3.3.4 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility,
  Edit,
  Add,
  Refresh,
  FilterList
} from '@mui/icons-material';
import BackButton from '../components/common/BackButton';
import ModalAtribuido from '../components/ModalAtribuido';
import { ticketsAPI } from '../services/ticketsAPI';
import { useAuth } from '../contexts/AuthContext';

const ChamadosInternosPage = () => {
  const { user, canViewTicketType } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');


  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const response = await ticketsAPI.getAll();
        // O backend retorna { success: true, data: { gestao: [...], conteudos: [...] } }
        const allTickets = [
          ...(response.data?.gestao || []),
          ...(response.data?.conteudos || [])
        ];
        setTickets(allTickets);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar tickets:', err);
        setError('Erro ao carregar tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo':
        // Novo = Azul Opaco (#006AB9)
        return {
          background: 'var(--blue-opaque)',
          color: 'white'
        };
      case 'aberto':
        // Aberto = Vermelho sólido básico
        return {
          background: '#FF0000',
          color: 'white'
        };
      case 'em espera':
        // Em espera = Amarelo (#FCC200)
        return {
          background: 'var(--yellow)',
          color: 'white'
        };
      case 'pendente':
        // Pendente = Verde (#15A237)
        return {
          background: 'var(--green)',
          color: 'white'
        };
      case 'resolvido':
        // Resolvido = Cinza claro
        return {
          background: 'rgba(128, 128, 128, 0.3)',
          color: 'white'
        };
      default:
        return {
          background: 'var(--blue-medium)',
          color: 'white'
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica':
        return 'error';
      case 'Alta':
        return 'warning';
      case 'Média':
        return 'info';
      case 'Baixa':
        return 'success';
      default:
        return 'default';
    }
  };

  // Função para calcular SLA (48h a partir da data de criação)
  const calculateSLA = (createdAt) => {
    if (!createdAt) return 'N/A';

    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now - createdDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    const remainingHours = 48 - diffHours;

    if (remainingHours <= 0) {
      return 'VENCIDO';
    } else if (remainingHours <= 24) {
      return `${Math.ceil(remainingHours)}h`;
    } else {
      return `${Math.ceil(remainingHours / 24)}d`;
    }
  };

  const limitSolicitanteName = (name) => {
    if (!name) return 'Não informado';
    const words = name.split(' ');
    return words.slice(0, 2).join(' ');
  };

  // Função para verificar se o ticket é de conteúdo
  const isTicketConteudo = (ticket) => {
    if (!ticket) return false;
    // Verificar pelo ID primeiro (mais confiável)
    if (ticket._id && ticket._id.startsWith('TKC-')) {
      return true;
    }
    // Verificar pelo gênero
    const generoLower = ticket._genero?.toLowerCase();
    const generosConteudo = ['artigo', 'processo', 'roteiro', 'treinamento', 'funcionalidade', 'recurso adicional', 'recurso'];
    return generosConteudo.includes(generoLower);
  };

  // Função para mapear _genero do ticket para a chave de _userTickets
  const mapGeneroToTicketType = (genero) => {
    if (!genero) return null;
    
    const generoLower = genero.toLowerCase();
    
    // Mapeamento para tk_conteudos
    const conteudosMap = {
      'artigo': 'artigos',
      'processo': 'processos',
      'roteiro': 'roteiros',
      'treinamento': 'treinamentos',
      'funcionalidade': 'funcionalidades',
      'recurso adicional': 'recursos',
      'recurso': 'recursos'
    };
    
    // Mapeamento para tk_gestao
    const gestaoMap = {
      'gestão': 'gestao',
      'gestao': 'gestao',
      'rh e financeiro': 'rhFin',
      'rh & financeiro': 'rhFin',
      'facilities': 'facilities'
    };
    
    // Verificar primeiro em conteudos, depois em gestao
    if (conteudosMap[generoLower]) {
      return conteudosMap[generoLower];
    }
    if (gestaoMap[generoLower]) {
      return gestaoMap[generoLower];
    }
    
    return null;
  };

  // Função para verificar se o usuário pode visualizar um ticket
  const canViewTicket = (ticket) => {
    if (!ticket || !ticket._genero) return true; // Se não tem gênero, permitir visualização
    
    const ticketType = mapGeneroToTicketType(ticket._genero);
    if (!ticketType) return true; // Se não conseguiu mapear, permitir visualização
    
    return canViewTicketType(ticketType);
  };

  // Separar tickets ativos e encerrados (com filtro de permissão)
  const activeTickets = tickets
    .filter(ticket => canViewTicket(ticket))
    .filter(ticket => (ticket._statusHub || ticket._statusConsole) !== 'resolvido');
  const closedTickets = tickets
    .filter(ticket => canViewTicket(ticket))
    .filter(ticket => (ticket._statusHub || ticket._statusConsole) === 'resolvido');
  
  const filteredActiveTickets = filterStatus === 'all'
    ? activeTickets
    : activeTickets.filter(ticket => (ticket._statusHub || ticket._statusConsole) === filterStatus);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleTicketUpdate = async () => {
    // Recarregar tickets após atualização
    setLoading(true);
    try {
      const response = await ticketsAPI.getAll();
      const allTickets = [
        ...(response.data?.gestao || []),
        ...(response.data?.conteudos || [])
      ];
      setTickets(allTickets);
      setError(null);
    } catch (err) {
      console.error('Erro ao recarregar tickets:', err);
      setError('Erro ao recarregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
  };

  const handleAssumeTicket = async (ticket) => {
    try {
      const endpoint = ticket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
      const updateData = {
        _atribuido: user._userId || user.email || user._userMail,
        _statusHub: 'aberto',
        _statusConsole: 'aberto',
        _lastUpdatedBy: 'admin'
      };

      if (endpoint === 'conteudo') {
        await ticketsAPI.updateConteudo(ticket._id, updateData);
      } else {
        await ticketsAPI.updateGestao(ticket._id, updateData);
      }

      // Reload tickets to reflect changes
      const loadTickets = async () => {
        setLoading(true);
        try {
          const response = await ticketsAPI.getAll();
          const allTickets = [
            ...(response.data?.gestao || []),
            ...(response.data?.conteudos || [])
          ];
          setTickets(allTickets);
          setError(null);
        } catch (err) {
          console.error('Erro ao carregar tickets:', err);
          setError('Erro ao carregar tickets');
        } finally {
          setLoading(false);
        }
      };
      await loadTickets();
    } catch (error) {
      console.error('Erro ao assumir ticket:', error);
      setError('Erro ao assumir ticket');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, fontFamily: 'Poppins' }}>
          Carregando tickets...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4, fontSize: '0.8em' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 4 }}>
        <Box sx={{ position: 'absolute', left: 0 }}>
          <BackButton />
        </Box>
        {/* Removido o título Chamados Internos */}
      </Box>

      {/* Dashboard de Tickets */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ fontSize: '0.8em' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: 'var(--blue-dark)'
              }}
            >
              Tickets Ativos
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filtrar</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filtrar"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="novo">Novo</MenuItem>
                  <MenuItem value="aberto">Aberto</MenuItem>
                  <MenuItem value="em espera">Em Espera</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                </Select>
              </FormControl>
              
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  const loadTickets = async () => {
                    setLoading(true);
                    try {
                      const response = await ticketsAPI.getAll();
                      const allTickets = [
                        ...(response.data?.gestao || []),
                        ...(response.data?.conteudos || [])
                      ];
                      setTickets(allTickets);
                      setError(null);
                    } catch (err) {
                      console.error('Erro ao carregar tickets:', err);
                      setError('Erro ao carregar tickets');
                    } finally {
                      setLoading(false);
                    }
                  };
                  loadTickets();
                }}
                sx={{
                  fontFamily: 'Poppins',
                  borderColor: 'var(--blue-medium)',
                  color: 'var(--blue-medium)',
                  '&:hover': {
                    borderColor: 'var(--blue-dark)',
                    backgroundColor: 'var(--blue-medium)',
                    color: 'white'
                  }
                }}
              >
                Atualizar
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    ID
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Solicitante
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Data
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Gênero
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Assunto
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'center'
                  }}>
                    SLA
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'center'
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'center'
                  }}>
                    Responsável
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActiveTickets.map((ticket) => (
                  <TableRow
                    key={ticket._id}
                    hover
                    onClick={() => handleViewTicket(ticket)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--cor-container)'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}>
                      {ticket._id}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '150px'
                    }}>
                      {limitSolicitanteName(ticket._corpo && ticket._corpo.length > 0 ? ticket._corpo[0].userName : 'Não informado')}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}>
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '120px'
                    }}>
                      {ticket._genero || 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '120px'
                    }}>
                      {ticket._tipo || 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {ticket._assunto || ticket._direcionamento || 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins', 
                      textAlign: 'center',
                      fontSize: '0.75rem'
                    }}>
                      <Chip
                        label={calculateSLA(ticket.createdAt)}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontSize: '0.75rem'
                    }}>
                      <Chip
                        label={ticket._statusConsole || ticket._statusHub || 'Não definida'}
                        size="small"
                        sx={{
                          background: getStatusColor(ticket._statusConsole || ticket._statusHub).background,
                          color: getStatusColor(ticket._statusConsole || ticket._statusHub).color,
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          border: 'none',
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      {(() => {
                        if (ticket._atribuido) {
                          // Show assigned agent's avatar and name
                          return (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 8px',
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.3s ease',
                                cursor: 'default',
                                maxWidth: '200px',
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                component="img"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ticket._atribuido)}&background=1634FF&color=fff&size=24&bold=true`}
                                alt="Avatar"
                                sx={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                              <Typography
                                sx={{
                                  color: 'var(--cor-texto)',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  fontFamily: 'Poppins',
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {ticket._atribuido}
                              </Typography>
                            </Box>
                          );
                        }

                        // Show "Assumir" button if not assigned
                        return (
                          <Box
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleAssumeTicket(ticket);
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 12px',
                              backgroundColor: 'white',
                              borderRadius: '16px',
                              border: '1px solid #e0e0e0',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #d0d0d0'
                              }
                            }}
                          >
                            <Typography
                              sx={{
                                color: 'var(--cor-texto)',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                fontFamily: 'Poppins'
                              }}
                            >
                              Assumir
                            </Typography>
                          </Box>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Container de Tickets Encerrados */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ fontSize: '0.8em' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: 'var(--blue-dark)'
              }}
            >
              Tickets Encerrados
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    ID
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Solicitante
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Data
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Gênero
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'left'
                  }}>
                    Assunto
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'center'
                  }}>
                    SLA
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'center'
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)',
                    textAlign: 'center'
                  }}>
                    Responsável
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {closedTickets.map((ticket) => (
                  <TableRow
                    key={ticket._id}
                    hover
                    onClick={() => handleViewTicket(ticket)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--cor-container)'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}>
                      {ticket._id}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '150px'
                    }}>
                      {limitSolicitanteName(ticket._corpo && ticket._corpo.length > 0 ? ticket._corpo[0].userName : ticket._userEmail || 'Não informado')}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}>
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '120px'
                    }}>
                      {ticket._genero || 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '120px'
                    }}>
                      {ticket._tipo || 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {ticket._assunto || ticket._direcionamento || 'Não informado'}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem'
                    }}>
                      <Chip
                        label={calculateSLA(ticket.createdAt)}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      <Chip
                        label={ticket._statusHub || ticket._statusConsole || 'Não definida'}
                        size="small"
                        sx={{
                          background: getStatusColor(ticket._statusHub || ticket._statusConsole).background,
                          color: getStatusColor(ticket._statusConsole || ticket._statusHub).color,
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          border: 'none',
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '0.75rem',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          borderColor: 'var(--gray)',
                          color: 'var(--gray)',
                          opacity: 0.6
                        }}
                      >
                        Resolvido
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal condicional baseado na atribuição */}
      {selectedTicket && (
        (() => {
          const currentUserId = user._userId || user.email || user._userMail;
          const isAssignedToCurrentUser = selectedTicket._atribuido && selectedTicket._atribuido === currentUserId;

          return isAssignedToCurrentUser ? (
            <ModalAtribuido
              ticket={selectedTicket}
              open={openDialog}
              onClose={handleCloseDialog}
              onUpdate={handleTicketUpdate}
            />
          ) : (
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              maxWidth="sm"
              fullWidth={false}
              PaperProps={{
                sx: {
                  fontSize: '0.8em',
                  minWidth: 340,
                  maxWidth: 540
                }
              }}
            >
              <DialogTitle sx={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: 'var(--blue-dark)'
              }}>
                {isTicketConteudo(selectedTicket) ?
                  `${selectedTicket._id} - ${selectedTicket._tipo} - ${selectedTicket._assunto || selectedTicket._direcionamento || 'Não informado'}` :
                  `${selectedTicket._id} - ${selectedTicket._tipo} - ${selectedTicket._direcionamento || 'Não informado'}`
                }
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    {/* Linha 1 */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Solicitante:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {selectedTicket._corpo && selectedTicket._corpo.length > 0 ? selectedTicket._corpo[0].userName : 'Não informado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Email:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {selectedTicket._userEmail || 'Não informado'}
                      </Typography>
                    </Box>
                    {/* Linha 2 */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Data:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        SLA:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {calculateSLA(selectedTicket.createdAt)}
                      </Typography>
                    </Box>
                    {/* Linha 3 */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        {isTicketConteudo(selectedTicket) ? 'Assunto/Direcionamento:' : 'Direcionamento:'}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {isTicketConteudo(selectedTicket) ? (selectedTicket._assunto || selectedTicket._direcionamento || 'Não informado') : (selectedTicket._direcionamento || 'Não informado')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Atribuído:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {selectedTicket._atribuido || 'Não atribuído'}
                      </Typography>
                    </Box>
                    {/* Linha 4 */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Processo em Andamento:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {selectedTicket._processamento || 'Não informado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Gênero:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}>
                        {selectedTicket._genero || 'Não informado'}
                      </Typography>
                    </Box>
                    {/* Linha 5 */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem' }}>
                        Status:
                      </Typography>
                      <Chip
                        label={selectedTicket._statusConsole || selectedTicket._statusHub || 'Não definida'}
                        size="small"
                        sx={{
                          background: getStatusColor(selectedTicket._statusConsole || selectedTicket._statusHub).background,
                          color: getStatusColor(selectedTicket._statusConsole || selectedTicket._statusHub).color,
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          border: 'none',
                          fontSize: '0.65rem',
                          height: '20px'
                        }}
                        variant="filled"
                      />
                    </Box>
                    <Box>
                      {/* Vazio - coluna 2 da linha 5 */}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 1, fontSize: '0.75rem' }}>
                      Ocorrência:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Poppins', mb: 2, fontSize: '0.75rem' }}>
                      {selectedTicket._obs || 'Não informado'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 1, fontSize: '0.75rem' }}>
                      Corpo da Mensagem:
                    </Typography>
                    {selectedTicket._corpo && selectedTicket._corpo.length > 0 ? (
                      selectedTicket._corpo.map((mensagem, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1.5, backgroundColor: 'var(--cor-container)', borderRadius: 1, borderBottom: index < selectedTicket._corpo.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Poppins',
                              fontWeight: 600,
                              color: mensagem.autor === 'admin' ? 'var(--blue-dark)' : 'var(--blue-medium)',
                              fontSize: '0.75rem'
                            }}
                          >
                            {mensagem.userName} <span style={{ fontStyle: 'italic', color: 'black', fontSize: '0.65rem', fontWeight: 300 }}>{new Date(mensagem.timestamp).toLocaleDateString('pt-BR')}, {new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </Typography>
                          <Typography sx={{ fontFamily: 'Poppins', mt: 0.5, fontSize: '0.75rem' }}>
                            {mensagem.mensagem}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>
                        Não há mensagens no ticket
                      </Typography>
                    )}
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => handleAssumeTicket(selectedTicket)}
                  variant="contained"
                  sx={{
                    fontFamily: 'Poppins',
                    backgroundColor: 'var(--blue-medium)',
                    '&:hover': {
                      backgroundColor: 'var(--blue-dark)'
                    },
                    mr: 1
                  }}
                >
                  Assumir Ticket
                </Button>
                <Button
                  onClick={handleCloseDialog}
                  sx={{
                    fontFamily: 'Poppins',
                    color: 'var(--blue-medium)'
                  }}
                >
                  Fechar
                </Button>
              </DialogActions>
            </Dialog>
          );
        })()
      )}
    </Container>
  );
};

export default ChamadosInternosPage;
