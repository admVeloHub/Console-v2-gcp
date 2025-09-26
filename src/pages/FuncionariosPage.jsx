// VERSION: v1.1.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack, 
  Add, 
  Edit, 
  Delete, 
  Key, 
  Search, 
  Clear,
  ExpandMore,
  ExpandLess,
  Person,
  Business,
  Phone,
  CalendarToday,
  Work,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getFuncionarios, 
  getFuncionariosAtivos, 
  addFuncionario, 
  updateFuncionario, 
  deleteFuncionario 
} from '../services/qualidadeStorage';
import { exportFuncionariosToExcel, exportFuncionariosToPDF } from '../services/qualidadeExport';
import { generateId } from '../types/qualidade';

const FuncionariosPage = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    nome: '',
    empresa: '',
    atuacao: '',
    status: 'todos',
    escala: ''
  });
  
  // Estados dos modais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAcessoAberto, setModalAcessoAberto] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);
  const [acessoEditando, setAcessoEditando] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  
  // Estados dos formulários
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    dataAniversario: '',
    empresa: '',
    dataContratado: '',
    telefone: '',
    atuacao: '',
    escala: '',
    desligado: false,
    dataDesligamento: '',
    afastado: false,
    dataAfastamento: ''
  });
  
  const [acessoData, setAcessoData] = useState({
    sistema: '',
    perfil: '',
    observacoes: ''
  });
  
  // Estados de UI
  const [linhasExpandidas, setLinhasExpandidas] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Carregar funcionários
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [funcionarios, filtros]);

  const carregarFuncionarios = () => {
    try {
      const dados = getFuncionarios();
      setFuncionarios(dados);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...funcionarios];

    if (filtros.nome) {
      filtrados = filtrados.filter(f => 
        f.nomeCompleto.toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }

    if (filtros.empresa) {
      filtrados = filtrados.filter(f => 
        f.empresa.toLowerCase().includes(filtros.empresa.toLowerCase())
      );
    }

    if (filtros.atuacao) {
      filtrados = filtrados.filter(f => 
        f.atuacao && f.atuacao.toLowerCase().includes(filtros.atuacao.toLowerCase())
      );
    }

    if (filtros.escala) {
      filtrados = filtrados.filter(f => 
        f.escala && f.escala.toLowerCase().includes(filtros.escala.toLowerCase())
      );
    }

    if (filtros.status !== 'todos') {
      filtrados = filtrados.filter(f => {
        switch (filtros.status) {
          case 'ativos':
            return !f.desligado && !f.afastado;
          case 'desligados':
            return f.desligado;
          case 'afastados':
            return f.afastado;
          default:
            return true;
        }
      });
    }

    setFuncionariosFiltrados(filtrados);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      nome: '',
      empresa: '',
      atuacao: '',
      status: 'todos',
      escala: ''
    });
  };

  const abrirModal = (funcionario = null) => {
    if (funcionario) {
      setFuncionarioEditando(funcionario);
      setFormData({
        nomeCompleto: funcionario.nomeCompleto,
        dataAniversario: funcionario.dataAniversario,
        empresa: funcionario.empresa,
        dataContratado: funcionario.dataContratado,
        telefone: funcionario.telefone || '',
        atuacao: funcionario.atuacao || '',
        escala: funcionario.escala || '',
        desligado: funcionario.desligado,
        dataDesligamento: funcionario.dataDesligamento || '',
        afastado: funcionario.afastado,
        dataAfastamento: funcionario.dataAfastamento || ''
      });
    } else {
      setFuncionarioEditando(null);
      setFormData({
        nomeCompleto: '',
        dataAniversario: '',
        empresa: '',
        dataContratado: '',
        telefone: '',
        atuacao: '',
        escala: '',
        desligado: false,
        dataDesligamento: '',
        afastado: false,
        dataAfastamento: ''
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFuncionarioEditando(null);
    setFormData({
      nomeCompleto: '',
      dataAniversario: '',
      empresa: '',
      dataContratado: '',
      telefone: '',
      atuacao: '',
      escala: '',
      desligado: false,
      dataDesligamento: '',
      afastado: false,
      dataAfastamento: ''
    });
  };

  const salvarFuncionario = () => {
    try {
      if (funcionarioEditando) {
        updateFuncionario(funcionarioEditando.id, formData);
        mostrarSnackbar('Funcionário atualizado com sucesso!', 'success');
      } else {
        addFuncionario(formData);
        mostrarSnackbar('Funcionário adicionado com sucesso!', 'success');
      }
      carregarFuncionarios();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      mostrarSnackbar('Erro ao salvar funcionário', 'error');
    }
  };

  const excluirFuncionario = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        deleteFuncionario(id);
        mostrarSnackbar('Funcionário excluído com sucesso!', 'success');
        carregarFuncionarios();
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        mostrarSnackbar('Erro ao excluir funcionário', 'error');
      }
    }
  };

  const abrirModalAcesso = (funcionario, acesso = null) => {
    setFuncionarioSelecionado(funcionario);
    setAcessoEditando(acesso);
    setAcessoData(acesso ? {
      sistema: acesso.sistema,
      perfil: acesso.perfil || '',
      observacoes: acesso.observacoes || ''
    } : {
      sistema: '',
      perfil: '',
      observacoes: ''
    });
    setModalAcessoAberto(true);
  };

  const fecharModalAcesso = () => {
    setModalAcessoAberto(false);
    setFuncionarioSelecionado(null);
    setAcessoEditando(null);
    setAcessoData({
      sistema: '',
      perfil: '',
      observacoes: ''
    });
  };

  const salvarAcesso = () => {
    try {
      const funcionarioAtualizado = { ...funcionarioSelecionado };
      
      // Garantir que acessos existe
      if (!funcionarioAtualizado.acessos) {
        funcionarioAtualizado.acessos = [];
      }
      
      if (acessoEditando) {
        // Editar acesso existente
        const index = funcionarioAtualizado.acessos.findIndex(a => a.id === acessoEditando.id);
        funcionarioAtualizado.acessos[index] = {
          ...acessoEditando,
          ...acessoData,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Adicionar novo acesso
        const novoAcesso = {
          id: generateId(),
          ...acessoData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        funcionarioAtualizado.acessos.push(novoAcesso);
      }
      
      updateFuncionario(funcionarioSelecionado.id, funcionarioAtualizado);
      mostrarSnackbar('Acesso salvo com sucesso!', 'success');
      carregarFuncionarios();
      fecharModalAcesso();
    } catch (error) {
      console.error('Erro ao salvar acesso:', error);
      mostrarSnackbar('Erro ao salvar acesso', 'error');
    }
  };

  const excluirAcesso = (funcionarioId, acessoId) => {
    if (window.confirm('Tem certeza que deseja excluir este acesso?')) {
      try {
        const funcionario = funcionarios.find(f => f.id === funcionarioId);
        const funcionarioAtualizado = {
          ...funcionario,
          acessos: (funcionario.acessos || []).filter(a => a.id !== acessoId)
        };
        updateFuncionario(funcionarioId, funcionarioAtualizado);
        mostrarSnackbar('Acesso excluído com sucesso!', 'success');
        carregarFuncionarios();
      } catch (error) {
        console.error('Erro ao excluir acesso:', error);
        mostrarSnackbar('Erro ao excluir acesso', 'error');
      }
    }
  };

  const toggleLinhaExpandida = (id) => {
    const novasLinhas = new Set(linhasExpandidas);
    if (novasLinhas.has(id)) {
      novasLinhas.delete(id);
    } else {
      novasLinhas.add(id);
    }
    setLinhasExpandidas(novasLinhas);
  };

  const formatarData = (dataString) => {
    if (!dataString || dataString.trim() === '') return 'Não informado';
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const obterStatusFuncionario = (funcionario) => {
    if (funcionario.desligado) return { texto: 'Desligado', cor: '#EF4444' };
    if (funcionario.afastado) return { texto: 'Afastado', cor: '#F59E0B' };
    return { texto: 'Ativo', cor: '#15A237' };
  };

  const mostrarSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const fecharSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Carregando funcionários...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4, position: 'relative' }}>
      {/* Botão Voltar */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/qualidade')}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: '#000058',
          borderColor: '#000058',
          fontFamily: 'Poppins',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#1694FF',
            color: '#ffffff',
            borderColor: '#1694FF'
          }
        }}
      >
        Voltar
      </Button>

      {/* Título */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 4,
        pt: 2
      }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          color: '#000058',
          textAlign: 'center'
        }}>
          Gestão de Funcionários
        </Typography>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600 }}>
              Funcionários ({funcionariosFiltrados.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Add />}
                onClick={() => abrirModal()}
                sx={{
                  backgroundColor: '#000058',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#000040'
                  }
                }}
              >
                Novo Funcionário
              </Button>
              <Button
                startIcon={<Person />}
                onClick={exportFuncionariosToExcel}
                sx={{
                  backgroundColor: '#15A237',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#128A2F'
                  }
                }}
              >
                Exportar Excel
              </Button>
              <Button
                startIcon={<Business />}
                onClick={exportFuncionariosToPDF}
                sx={{
                  backgroundColor: '#EF4444',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#DC2626'
                  }
                }}
              >
                Exportar PDF
              </Button>
            </Box>
          </Box>

          {/* Filtros */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Nome"
                value={filtros.nome}
                onChange={(e) => handleFiltroChange('nome', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666666' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Empresa"
                value={filtros.empresa}
                onChange={(e) => handleFiltroChange('empresa', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Atuação"
                value={filtros.atuacao}
                onChange={(e) => handleFiltroChange('atuacao', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Status</InputLabel>
                <Select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  label="Status"
                  sx={{
                    fontFamily: 'Poppins',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000058'
                    }
                  }}
                >
                  <MenuItem value="todos" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                  <MenuItem value="ativos" sx={{ fontFamily: 'Poppins' }}>Ativos</MenuItem>
                  <MenuItem value="desligados" sx={{ fontFamily: 'Poppins' }}>Desligados</MenuItem>
                  <MenuItem value="afastados" sx={{ fontFamily: 'Poppins' }}>Afastados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Escala"
                value={filtros.escala}
                onChange={(e) => handleFiltroChange('escala', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                startIcon={<Clear />}
                onClick={limparFiltros}
                sx={{
                  color: '#666666',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Funcionários */}
      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Nome</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Empresa</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Status</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Acessos</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Ações</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {funcionariosFiltrados.map((funcionario) => {
                const status = obterStatusFuncionario(funcionario);
                const isExpanded = linhasExpandidas.has(funcionario.id);
                
                return (
                  <React.Fragment key={funcionario.id}>
                    <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell sx={{ fontFamily: 'Poppins' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ color: '#666666', fontSize: 20 }} />
                          {funcionario.nomeCompleto}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ color: '#666666', fontSize: 20 }} />
                          {funcionario.empresa}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.texto || 'Indefinido'}
                          sx={{
                            backgroundColor: status.cor || '#666666',
                            color: '#ffffff',
                            fontFamily: 'Poppins',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Key sx={{ color: '#666666', fontSize: 20 }} />
                          {funcionario.acessos ? funcionario.acessos.length : 0}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => abrirModal(funcionario)}
                            sx={{ color: '#1694FF' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => abrirModalAcesso(funcionario)}
                            sx={{ color: '#15A237' }}
                          >
                            <Key />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => excluirFuncionario(funcionario.id)}
                            sx={{ color: '#EF4444' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleLinhaExpandida(funcionario.id)}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 1 }}>
                                  Informações Pessoais
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday sx={{ color: '#666666', fontSize: 16 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                                      <strong>Aniversário:</strong> {formatarData(funcionario.dataAniversario)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday sx={{ color: '#666666', fontSize: 16 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                                      <strong>Contratado:</strong> {formatarData(funcionario.dataContratado)}
                                    </Typography>
                                  </Box>
                                  {funcionario.telefone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Phone sx={{ color: '#666666', fontSize: 16 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                                        <strong>Telefone:</strong> {funcionario.telefone}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 1 }}>
                                  Informações Profissionais
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {funcionario.atuacao && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Work sx={{ color: '#666666', fontSize: 16 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                                        <strong>Atuação:</strong> {funcionario.atuacao}
                                      </Typography>
                                    </Box>
                                  )}
                                  {funcionario.escala && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Schedule sx={{ color: '#666666', fontSize: 16 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                                        <strong>Escala:</strong> {funcionario.escala}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 1 }}>
                                  Acessos ({funcionario.acessos ? funcionario.acessos.length : 0})
                                </Typography>
                                {funcionario.acessos && funcionario.acessos.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {funcionario.acessos.map((acesso) => (
                                      <Chip
                                        key={acesso.id}
                                        label={`${acesso.sistema || 'Sistema'}${acesso.perfil ? ` (${acesso.perfil})` : ''}`}
                                        onDelete={() => excluirAcesso(funcionario.id, acesso.id)}
                                        sx={{
                                          backgroundColor: '#1694FF',
                                          color: '#ffffff',
                                          fontFamily: 'Poppins',
                                          '& .MuiChip-deleteIcon': {
                                            color: '#ffffff'
                                          }
                                        }}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontStyle: 'italic' }}>
                                    Nenhum acesso cadastrado
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Funcionário */}
      <Dialog open={modalAberto} onClose={fecharModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          {funcionarioEditando ? 'Editar Funcionário' : 'Novo Funcionário'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Aniversário"
                type="date"
                value={formData.dataAniversario}
                onChange={(e) => setFormData({ ...formData, dataAniversario: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Contratação"
                type="date"
                value={formData.dataContratado}
                onChange={(e) => setFormData({ ...formData, dataContratado: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Atuação"
                value={formData.atuacao}
                onChange={(e) => setFormData({ ...formData, atuacao: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Escala"
                value={formData.escala}
                onChange={(e) => setFormData({ ...formData, escala: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal} sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Cancelar
          </Button>
          <Button
            onClick={salvarFuncionario}
            sx={{
              backgroundColor: '#000058',
              color: '#ffffff',
              fontFamily: 'Poppins',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#000040'
              }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Acesso */}
      <Dialog open={modalAcessoAberto} onClose={fecharModalAcesso} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          {acessoEditando ? 'Editar Acesso' : 'Novo Acesso'} - {funcionarioSelecionado?.nomeCompleto}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sistema"
                value={acessoData.sistema}
                onChange={(e) => setAcessoData({ ...acessoData, sistema: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Perfil"
                value={acessoData.perfil}
                onChange={(e) => setAcessoData({ ...acessoData, perfil: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={acessoData.observacoes}
                onChange={(e) => setAcessoData({ ...acessoData, observacoes: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalAcesso} sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Cancelar
          </Button>
          <Button
            onClick={salvarAcesso}
            sx={{
              backgroundColor: '#000058',
              color: '#ffffff',
              fontFamily: 'Poppins',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#000040'
              }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={fecharSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={fecharSnackbar} severity={snackbar.severity} sx={{ fontFamily: 'Poppins' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FuncionariosPage;