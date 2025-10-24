// VERSION: v3.1.11 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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

const ChamadosInternosPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dados mockados para demonstração
  const mockTickets = [
    // Tickets ativos
    {
      id: 'TK-001',
      solicitante: 'João Silva',
      data: '2024-12-19',
      tipo: 'Suporte Técnico',
      sla: '24h',
      situacao: 'Novo',
      prioridade: 'Alta',
      setor: 'TI',
      descricao: 'Problema com acesso ao sistema de vendas'
    },
    {
      id: 'TK-002',
      solicitante: 'Maria Santos',
      data: '2024-12-18',
      tipo: 'Manutenção',
      sla: '48h',
      situacao: 'Em Andamento',
      prioridade: 'Média',
      setor: 'Operações',
      descricao: 'Solicitação de manutenção preventiva'
    },
    {
      id: 'TK-003',
      solicitante: 'Pedro Costa',
      data: '2024-12-17',
      tipo: 'Incidente',
      sla: '4h',
      situacao: 'Aberto',
      prioridade: 'Crítica',
      setor: 'Produção',
      descricao: 'Falha no sistema de produção'
    },
    {
      id: 'TK-004',
      solicitante: 'Ana Oliveira',
      data: '2024-12-16',
      tipo: 'Solicitação',
      sla: '72h',
      situacao: 'Novo',
      prioridade: 'Baixa',
      setor: 'RH',
      descricao: 'Solicitação de novo usuário no sistema'
    },
    {
      id: 'TK-005',
      solicitante: 'Carlos Lima',
      data: '2024-12-15',
      tipo: 'Bug',
      sla: '12h',
      situacao: 'Em Andamento',
      prioridade: 'Média',
      setor: 'Desenvolvimento',
      descricao: 'Erro na validação de formulários'
    },
    {
      id: 'TK-006',
      solicitante: 'Lucia Costa',
      data: '2024-12-14',
      tipo: 'Melhoria',
      sla: '96h',
      situacao: 'Aberto',
      prioridade: 'Baixa',
      setor: 'UX',
      descricao: 'Sugestão para melhorar interface do usuário'
    },
    
    // Tickets encerrados
    {
      id: 'TK-007',
      solicitante: 'Roberto Alves',
      data: '2024-12-13',
      tipo: 'Bug',
      sla: '8h',
      situacao: 'Encerrado',
      prioridade: 'Alta',
      setor: 'Desenvolvimento',
      descricao: 'Erro de login corrigido com sucesso'
    },
    {
      id: 'TK-008',
      solicitante: 'Fernanda Lima',
      data: '2024-12-12',
      tipo: 'Dúvida',
      sla: '24h',
      situacao: 'Encerrado',
      prioridade: 'Baixa',
      setor: 'Suporte',
      descricao: 'Dúvida sobre configuração de permissões resolvida'
    },
    {
      id: 'TK-009',
      solicitante: 'Marcos Oliveira',
      data: '2024-12-11',
      tipo: 'Requisição',
      sla: '48h',
      situacao: 'Encerrado',
      prioridade: 'Média',
      setor: 'Operações',
      descricao: 'Nova funcionalidade implementada conforme solicitado'
    },
    {
      id: 'TK-010',
      solicitante: 'Carla Mendes',
      data: '2024-12-10',
      tipo: 'Melhoria',
      sla: '72h',
      situacao: 'Encerrado',
      prioridade: 'Alta',
      setor: 'Desenvolvimento',
      descricao: 'Melhoria na performance do sistema aplicada'
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    const loadTickets = async () => {
      setLoading(true);
      try {
        // Aqui seria feita a chamada para a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTickets(mockTickets);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Novo':
        // ESSENCIAL - Azul Médio → Azul Claro
        return {
          background: 'linear-gradient(135deg, var(--blue-medium) 0%, var(--blue-medium) 60%, var(--blue-light) 100%)',
          color: 'white'
        };
      case 'Em Andamento':
        // ATUALIZAÇÃO - Azul Escuro → Amarelo
        return {
          background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dark) 60%, var(--yellow) 100%)',
          color: 'white'
        };
      case 'Aberto':
        // RECICLAGEM - Amarelo → Azul Médio
        return {
          background: 'linear-gradient(135deg, var(--yellow) 0%, var(--yellow) 60%, var(--blue-medium) 100%)',
          color: 'white'
        };
      case 'Encerrado':
        // Cinza sólido com 50% de opacidade
        return {
          background: 'rgba(128, 128, 128, 0.5)',
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

  // Separar tickets ativos e encerrados
  const activeTickets = tickets.filter(ticket => ticket.situacao !== 'Encerrado');
  const closedTickets = tickets.filter(ticket => ticket.situacao === 'Encerrado');
  
  const filteredActiveTickets = filterStatus === 'all' 
    ? activeTickets 
    : activeTickets.filter(ticket => ticket.situacao === filterStatus);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
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
          Chamados Internos
        </Typography>
      </Box>

      {/* Dashboard de Tickets */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
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
                  <MenuItem value="Novo">Novo</MenuItem>
                  <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                  <MenuItem value="Aberto">Aberto</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<Add />}
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
                Novo Ticket
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
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
                    color: 'var(--blue-dark)'
                  }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Solicitante
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Data
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    SLA
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Situação
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
                {filteredActiveTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    hover
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'var(--cor-container)'
                      }
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {ticket.id}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {ticket.solicitante}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {new Date(ticket.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {ticket.tipo}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      <Chip 
                        label={ticket.sla || 'Não definido'}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.situacao || 'Não definida'}
                        size="small"
                        sx={{
                          background: getStatusColor(ticket.situacao).background,
                          color: getStatusColor(ticket.situacao).color,
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          border: 'none'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleViewTicket(ticket)}
                          sx={{ 
                            color: 'var(--blue-medium)',
                            '&:hover': {
                              backgroundColor: 'var(--blue-medium)',
                              color: 'white'
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          sx={{ 
                            color: 'var(--blue-medium)',
                            '&:hover': {
                              backgroundColor: 'var(--blue-medium)',
                              color: 'white'
                            }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
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
        <CardContent>
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
                    color: 'var(--blue-dark)'
                  }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Solicitante
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Data
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    SLA
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: 'var(--blue-dark)'
                  }}>
                    Situação
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
                {closedTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    hover
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'var(--cor-container)'
                      }
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {ticket.id}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {ticket.solicitante}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {new Date(ticket.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      {ticket.tipo}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins' }}>
                      <Chip 
                        label={ticket.sla || 'Não definido'}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.situacao || 'Não definida'}
                        size="small"
                        sx={{
                          background: getStatusColor(ticket.situacao).background,
                          color: getStatusColor(ticket.situacao).color,
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          border: 'none'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleViewTicket(ticket)}
                          sx={{ 
                            color: 'var(--blue-medium)',
                            '&:hover': {
                              backgroundColor: 'var(--blue-medium)',
                              color: 'white'
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para visualizar ticket */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins',
          fontWeight: 600,
          color: 'var(--blue-dark)'
        }}>
          Detalhes do Ticket - {selectedTicket?.id}
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                    Solicitante:
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins' }}>
                    {selectedTicket.solicitante}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                    Data:
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins' }}>
                    {new Date(selectedTicket.data).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                    Tipo:
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins' }}>
                    {selectedTicket.tipo}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                    Setor:
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins' }}>
                    {selectedTicket.setor}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                    Prioridade:
                  </Typography>
                  <Chip 
                    label={selectedTicket.prioridade || 'Não definida'}
                    size="small"
                    color={getPriorityColor(selectedTicket.prioridade)}
                    variant="filled"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                    Situação:
                  </Typography>
                  <Chip 
                    label={selectedTicket.situacao || 'Não definida'}
                    size="small"
                    color={getStatusColor(selectedTicket.situacao)}
                    variant="filled"
                  />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 1 }}>
                  Descrição:
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins' }}>
                  {selectedTicket.descricao}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
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
    </Container>
  );
};

export default ChamadosInternosPage;
