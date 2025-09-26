// VERSION: v1.1.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Tabs,
  Tab,
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
  Grid,
  Alert,
  Snackbar,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material';
import { 
  ArrowBack, 
  Add, 
  Edit, 
  Delete, 
  Assessment, 
  BarChart, 
  People, 
  Psychology,
  Search,
  Clear,
  CheckCircle,
  Cancel,
  VolumeUp,
  VolumeOff,
  MicOff,
  Upload,
  AttachFile
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getAvaliacoes, 
  addAvaliacao, 
  updateAvaliacao, 
  deleteAvaliacao,
  getFuncionariosAtivos
} from '../services/qualidadeStorage';
import { exportAvaliacoesToExcel, exportAvaliacoesToPDF } from '../services/qualidadeExport';
import { analyzeCallWithGPT } from '../services/gptService';
import { 
  MESES, 
  ANOS, 
  getStatusPontuacao, 
  generateId 
} from '../types/qualidade';

const QualidadeModulePage = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [currentView, setCurrentView] = useState('avaliacoes');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    colaborador: '',
    mes: '',
    ano: '',
    avaliador: ''
  });
  
  // Estados dos modais
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [modalGPTAberto, setModalGPTAberto] = useState(false);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(null);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
  
  // Estados dos formulários
  const [formData, setFormData] = useState({
    colaboradorId: '',
    avaliador: '',
    mes: '',
    ano: new Date().getFullYear(),
    saudacaoAdequada: false,
    escutaAtiva: false,
    resolucaoQuestao: false,
    empatiaCordialidade: false,
    direcionouPesquisa: false,
    procedimentoIncorreto: false,
    encerramentoBrusco: false,
    observacoesModeracao: ''
  });
  
  // Estados de UI
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [gptLoading, setGptLoading] = useState(false);
  const [gptResult, setGptResult] = useState(null);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    try {
      const avaliacoesData = getAvaliacoes();
      const funcionariosData = getFuncionariosAtivos();
      
      setAvaliacoes(avaliacoesData);
      setFuncionarios(funcionariosData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...avaliacoes];

    if (filtros.colaborador) {
      filtrados = filtrados.filter(a => 
        a.colaboradorNome.toLowerCase().includes(filtros.colaborador.toLowerCase())
      );
    }

    if (filtros.mes) {
      filtrados = filtrados.filter(a => a.mes === filtros.mes);
    }

    if (filtros.ano) {
      filtrados = filtrados.filter(a => a.ano === parseInt(filtros.ano));
    }

    if (filtros.avaliador) {
      filtrados = filtrados.filter(a => 
        a.avaliador.toLowerCase().includes(filtros.avaliador.toLowerCase())
      );
    }

    return filtrados;
  };

  const abrirModalAvaliacao = (avaliacao = null) => {
    if (avaliacao) {
      setAvaliacaoEditando(avaliacao);
      setFormData({
        colaboradorId: avaliacao.colaboradorId,
        avaliador: avaliacao.avaliador,
        mes: avaliacao.mes,
        ano: avaliacao.ano,
        saudacaoAdequada: avaliacao.saudacaoAdequada,
        escutaAtiva: avaliacao.escutaAtiva,
        resolucaoQuestao: avaliacao.resolucaoQuestao,
        empatiaCordialidade: avaliacao.empatiaCordialidade,
        direcionouPesquisa: avaliacao.direcionouPesquisa,
        procedimentoIncorreto: avaliacao.procedimentoIncorreto,
        encerramentoBrusco: avaliacao.encerramentoBrusco,
        arquivoLigacao: null,
        observacoesModeracao: avaliacao.observacoesModeracao || ''
      });
    } else {
      setAvaliacaoEditando(null);
      setFormData({
        colaboradorId: '',
        avaliador: '',
        mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
        ano: new Date().getFullYear(),
        saudacaoAdequada: false,
        escutaAtiva: false,
        resolucaoQuestao: false,
        empatiaCordialidade: false,
        direcionouPesquisa: false,
        procedimentoIncorreto: false,
        encerramentoBrusco: false,
        arquivoLigacao: null,
        observacoesModeracao: ''
      });
    }
    setModalAvaliacaoAberto(true);
  };

  const fecharModalAvaliacao = () => {
    setModalAvaliacaoAberto(false);
    setAvaliacaoEditando(null);
    setFormData({
      colaboradorId: '',
      avaliador: '',
      mes: '',
      ano: new Date().getFullYear(),
      saudacaoAdequada: false,
      escutaAtiva: false,
      resolucaoQuestao: false,
      empatiaCordialidade: false,
      direcionouPesquisa: false,
      procedimentoIncorreto: false,
      encerramentoBrusco: false,
      arquivoLigacao: null,
      observacoesModeracao: ''
    });
  };

  const salvarAvaliacao = async () => {
    try {
      if (avaliacaoEditando) {
        await updateAvaliacao(avaliacaoEditando.id, formData);
        mostrarSnackbar('Avaliação atualizada com sucesso!', 'success');
      } else {
        await addAvaliacao(formData);
        mostrarSnackbar('Avaliação adicionada com sucesso!', 'success');
      }
      carregarDados();
      fecharModalAvaliacao();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      mostrarSnackbar('Erro ao salvar avaliação', 'error');
    }
  };

  const excluirAvaliacao = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        deleteAvaliacao(id);
        mostrarSnackbar('Avaliação excluída com sucesso!', 'success');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        mostrarSnackbar('Erro ao excluir avaliação', 'error');
      }
    }
  };

  const abrirModalGPT = (avaliacao) => {
    setAvaliacaoSelecionada(avaliacao);
    setGptResult(null);
    setModalGPTAberto(true);
  };

  const fecharModalGPT = () => {
    setModalGPTAberto(false);
    setAvaliacaoSelecionada(null);
    setGptResult(null);
  };

  const analisarComGPT = async () => {
    if (!avaliacaoSelecionada) return;
    
    setGptLoading(true);
    try {
      const resultado = await analyzeCallWithGPT({
        id: avaliacaoSelecionada.id,
        colaboradorNome: avaliacaoSelecionada.colaboradorNome,
        arquivoLigacao: avaliacaoSelecionada.arquivoLigacao,
        nomeArquivo: avaliacaoSelecionada.nomeArquivo
      });
      
      setGptResult(resultado);
      mostrarSnackbar('Análise GPT concluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro na análise GPT:', error);
      mostrarSnackbar('Erro na análise GPT', 'error');
    } finally {
      setGptLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const fecharSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const avaliacoesFiltradas = aplicarFiltros();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8, pb: 4, position: 'relative' }}>
      {/* Botão Voltar - Canto esquerdo superior do dashboard */}
      <Button
        variant="outlined"
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
          Módulo de Qualidade
        </Typography>
      </Box>

      {/* Navegação por Abas */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <Tabs
          value={currentView}
          onChange={(e, newValue) => setCurrentView(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontFamily: 'Poppins',
              fontWeight: 500,
              textTransform: 'none',
              minHeight: 60
            },
            '& .Mui-selected': {
              color: '#000058 !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#000058'
            }
          }}
        >
          <Tab 
            value="avaliacoes" 
            label="Avaliações" 
            icon={<Assessment />}
            iconPosition="start"
          />
          <Tab 
            value="relatorio-agente" 
            label="Relatório do Agente" 
            icon={<People />}
            iconPosition="start"
          />
          <Tab 
            value="relatorio-gestao" 
            label="Relatório da Gestão" 
            icon={<BarChart />}
            iconPosition="start"
          />
          <Tab 
            value="gpt" 
            label="Análise GPT" 
            icon={<Psychology />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Conteúdo das Abas */}
      {currentView === 'avaliacoes' && (
        <Box>
          {/* Toolbar */}
          <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600 }}>
                  Avaliações ({avaliacoesFiltradas.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Add />}
                    onClick={() => abrirModalAvaliacao()}
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
                    Nova Avaliação
                  </Button>
                  <Button
                    startIcon={<Assessment />}
                    onClick={exportAvaliacoesToExcel}
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
                    startIcon={<BarChart />}
                    onClick={exportAvaliacoesToPDF}
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
                    label="Colaborador"
                    value={filtros.colaborador}
                    onChange={(e) => setFiltros({ ...filtros, colaborador: e.target.value })}
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
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontFamily: 'Poppins' }}>Mês</InputLabel>
                    <Select
                      value={filtros.mes}
                      onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                      label="Mês"
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
                      <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                      {MESES.map((mes) => (
                        <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins' }}>
                          {mes}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontFamily: 'Poppins' }}>Ano</InputLabel>
                    <Select
                      value={filtros.ano}
                      onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
                      label="Ano"
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
                      <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                      {ANOS.map((ano) => (
                        <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins' }}>
                          {ano}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Avaliador"
                    value={filtros.avaliador}
                    onChange={(e) => setFiltros({ ...filtros, avaliador: e.target.value })}
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
                  <Button
                    fullWidth
                    startIcon={<Clear />}
                    onClick={() => setFiltros({ colaborador: '', mes: '', ano: '', avaliador: '' })}
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

          {/* Lista de Avaliações */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Colaborador</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Avaliador</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Período</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Pontuação</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Status</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Áudio</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avaliacoesFiltradas.length > 0 ? (
                    avaliacoesFiltradas.map((avaliacao) => {
                      const status = getStatusPontuacao(avaliacao.pontuacaoTotal);
                      
                      return (
                        <TableRow key={avaliacao.id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ fontFamily: 'Poppins' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1694FF' }}>
                                {avaliacao.colaboradorNome.charAt(0)}
                              </Avatar>
                              {avaliacao.colaboradorNome}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins' }}>{avaliacao.avaliador}</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins' }}>
                            {avaliacao.mes}/{avaliacao.ano}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                            {avaliacao.pontuacaoTotal} pts
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.texto}
                              sx={{
                                backgroundColor: status.cor,
                                color: '#ffffff',
                                fontFamily: 'Poppins',
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {avaliacao.arquivoLigacao ? (
                              <IconButton
                                size="small"
                                onClick={() => mostrarSnackbar('Reprodução de áudio em desenvolvimento', 'info')}
                                sx={{ color: '#15A237' }}
                              >
                                <VolumeUp />
                              </IconButton>
                            ) : (
                              <IconButton size="small" disabled>
                                <MicOff sx={{ color: '#666666' }} />
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalAvaliacao(avaliacao)}
                              sx={{ color: '#1694FF' }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalGPT(avaliacao)}
                              sx={{ color: '#9C27B0' }}
                            >
                              <Psychology />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => excluirAvaliacao(avaliacao.id)}
                              sx={{ color: '#EF4444' }}
                            >
                              <Delete />
                            </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                          Nenhuma avaliação encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {currentView === 'relatorio-agente' && (
        <Box>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, mb: 3 }}>
                Relatório Individual do Agente
              </Typography>
              <Alert severity="info" sx={{ fontFamily: 'Poppins' }}>
                Selecione um colaborador para visualizar seu relatório individual de desempenho.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      {currentView === 'relatorio-gestao' && (
        <Box>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, mb: 3 }}>
                Relatório Gerencial
              </Typography>
              <Alert severity="info" sx={{ fontFamily: 'Poppins' }}>
                Visualize o desempenho geral da equipe e rankings de qualidade.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      {currentView === 'gpt' && (
        <Box>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, mb: 3 }}>
                Análise com Inteligência Artificial
              </Typography>
              <Alert severity="info" sx={{ fontFamily: 'Poppins' }}>
                Selecione uma avaliação para realizar análise automática com GPT.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Modal Avaliação */}
      <Dialog open={modalAvaliacaoAberto} onClose={fecharModalAvaliacao} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          {avaliacaoEditando ? 'Editar Avaliação' : 'Nova Avaliação'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Colaborador</InputLabel>
                <Select
                  value={formData.colaboradorId}
                  onChange={(e) => setFormData({ ...formData, colaboradorId: e.target.value })}
                  label="Colaborador"
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
                  {funcionarios.map((funcionario) => (
                    <MenuItem key={funcionario.id} value={funcionario.id} sx={{ fontFamily: 'Poppins' }}>
                      {funcionario.nomeCompleto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Avaliador"
                value={formData.avaliador}
                onChange={(e) => setFormData({ ...formData, avaliador: e.target.value })}
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
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Mês</InputLabel>
                <Select
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  label="Mês"
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
                  {MESES.map((mes) => (
                    <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins' }}>
                      {mes}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Ano</InputLabel>
                <Select
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                  label="Ano"
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
                  {ANOS.map((ano) => (
                    <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins' }}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Critérios de Avaliação */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 2 }}>
                Critérios de Avaliação
              </Typography>
            </Grid>
            
            {[
              { key: 'saudacaoAdequada', label: 'Saudação Adequada', pontos: 10 },
              { key: 'escutaAtiva', label: 'Escuta Ativa', pontos: 25 },
              { key: 'resolucaoQuestao', label: 'Resolução da Questão', pontos: 40 },
              { key: 'empatiaCordialidade', label: 'Empatia e Cordialidade', pontos: 15 },
              { key: 'direcionouPesquisa', label: 'Direcionamento de Pesquisa', pontos: 10 },
              { key: 'procedimentoIncorreto', label: 'Procedimento Incorreto', pontos: -60 },
              { key: 'encerramentoBrusco', label: 'Encerramento Brusco', pontos: -100 }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                      {criterio.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={formData[criterio.key] ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                      sx={{
                        backgroundColor: formData[criterio.key] ? '#15A237' : 'transparent',
                        color: formData[criterio.key] ? '#ffffff' : '#15A237',
                        borderColor: '#15A237',
                        fontFamily: 'Poppins',
                        '&:hover': {
                          backgroundColor: formData[criterio.key] ? '#128A2F' : '#f0f9ff',
                          borderColor: '#15A237'
                        }
                      }}
                    >
                      <CheckCircle />
                    </Button>
                    <Button
                      variant={!formData[criterio.key] ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                      sx={{
                        backgroundColor: !formData[criterio.key] ? '#EF4444' : 'transparent',
                        color: !formData[criterio.key] ? '#ffffff' : '#EF4444',
                        borderColor: '#EF4444',
                        fontFamily: 'Poppins',
                        '&:hover': {
                          backgroundColor: !formData[criterio.key] ? '#DC2626' : '#fef2f2',
                          borderColor: '#EF4444'
                        }
                      }}
                    >
                      <Cancel />
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoesModeracao}
                onChange={(e) => setFormData({ ...formData, observacoesModeracao: e.target.value })}
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
          <Button onClick={fecharModalAvaliacao} sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Cancelar
          </Button>
          <Button
            onClick={salvarAvaliacao}
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

      {/* Modal GPT */}
      <Dialog open={modalGPTAberto} onClose={fecharModalGPT} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          Análise GPT - {avaliacaoSelecionada?.colaboradorNome}
        </DialogTitle>
        <DialogContent>
          {avaliacaoSelecionada && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 2 }}>
                    Informações da Avaliação
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 1 }}>
                      <strong>Colaborador:</strong> {avaliacaoSelecionada.colaboradorNome}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 1 }}>
                      <strong>Período:</strong> {avaliacaoSelecionada.mes}/{avaliacaoSelecionada.ano}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 1 }}>
                      <strong>Pontuação:</strong> {avaliacaoSelecionada.pontuacaoTotal} pontos
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                      <strong>Arquivo:</strong> {avaliacaoSelecionada.arquivoLigacao ? 'Disponível' : 'Não disponível'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 2 }}>
                    Análise GPT
                  </Typography>
                  {gptLoading ? (
                    <Box sx={{ p: 2 }}>
                      <LinearProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                        Analisando ligação com inteligência artificial...
                      </Typography>
                    </Box>
                  ) : gptResult ? (
                    <Box sx={{ p: 2, backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 1 }}>
                        <strong>Pontuação GPT:</strong> {gptResult.pontuacao} pontos
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 1 }}>
                        <strong>Confiança:</strong> {gptResult.confianca}%
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 2 }}>
                        <strong>Resumo:</strong> {gptResult.resumoSolicitacao}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', whiteSpace: 'pre-wrap' }}>
                        {gptResult.analiseDetalhada}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Button
                        startIcon={<Psychology />}
                        onClick={analisarComGPT}
                        sx={{
                          backgroundColor: '#9C27B0',
                          color: '#ffffff',
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: '#7B1FA2'
                          }
                        }}
                      >
                        Iniciar Análise GPT
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalGPT} sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Fechar
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

export default QualidadeModulePage;
