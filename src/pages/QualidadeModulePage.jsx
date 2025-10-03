// VERSION: v1.16.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  getAvaliacoes, 
  addAvaliacao, 
  updateAvaliacao, 
  deleteAvaliacao
} from '../services/qualidadeAPI';
import { 
  getFuncionarios,
  gerarRelatorioAgente,
  gerarRelatorioGestao
} from '../services/qualidadeAPI';
import { exportAvaliacoesToExcel, exportAvaliacoesToPDF } from '../services/qualidadeExport';
import { analyzeCallWithGPT } from '../services/gptService';
import { getAvaliadoresValidos } from '../services/qualidadeAPI';
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
  const [avaliadores, setAvaliadores] = useState([]);
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

  // Estados dos Relatórios
  const [selectedColaborador, setSelectedColaborador] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [relatorioAgente, setRelatorioAgente] = useState(null);
  const [relatorioGestao, setRelatorioGestao] = useState(null);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  // Limpar selectedColaborador quando funcionários carregam (para evitar cache de IDs)
  useEffect(() => {
    if (funcionarios.length > 0) {
      console.log('🔍 DEBUG - Limpando selectedColaborador para evitar cache de IDs');
      setSelectedColaborador('');
    }
  }, [funcionarios]);

  // Debug: Monitorar mudanças no selectedColaborador
  useEffect(() => {
    console.log('🔍 DEBUG - selectedColaborador mudou para:', selectedColaborador);
  }, [selectedColaborador]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Debug localStorage
      const funcionariosLocal = localStorage.getItem('funcionarios_velotax');
      console.log('🔍 Debug - localStorage funcionarios_velotax:', funcionariosLocal);
      
      const avaliacoesData = await getAvaliacoes();
      const todosFuncionarios = await getFuncionarios();
      const avaliadoresValidos = await getAvaliadoresValidos();
      
      console.log('🔍 Debug - Todos os funcionários:', todosFuncionarios);
      console.log('🔍 Debug - Quantidade de funcionários:', todosFuncionarios.length);
      console.log('🔍 Debug - Avaliadores válidos:', avaliadoresValidos);
      
      // Filtrar apenas funcionários ativos (mais permissivo para debug)
      const funcionariosAtivos = todosFuncionarios.filter(f => {
        const isAtivo = !f.desligado && !f.afastado;
        console.log(`🔍 Debug - Funcionário ${f.colaboradorNome || f.nomeCompleto}: desligado=${f.desligado}, afastado=${f.afastado}, isAtivo=${isAtivo}`);
        return isAtivo;
      });
      
      console.log('🔍 Debug - Funcionários ativos:', funcionariosAtivos);
      console.log('🔍 Debug - Quantidade de funcionários ativos:', funcionariosAtivos.length);
      
      // Fallback: se não há funcionários ativos, usar todos os funcionários
      const funcionariosParaUsar = funcionariosAtivos.length > 0 ? funcionariosAtivos : todosFuncionarios;
      console.log('🔍 Debug - Funcionários para usar no modal:', funcionariosParaUsar);
      
      // Garantir que todos os funcionários tenham um ID válido
      const funcionariosComId = funcionariosParaUsar.map(f => ({
        ...f,
        id: f._id || f.id, // Usar _id se disponível, senão usar id
        _id: f._id || f.id // Garantir que _id também esteja disponível
      }));
      
      console.log('🔍 Debug - Funcionários com ID corrigido:', funcionariosComId);
      
      setAvaliacoes(avaliacoesData);
      setFuncionarios(funcionariosComId);
      setAvaliadores(avaliadoresValidos);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    // Garantir que avaliacoes seja sempre um array
    const avaliacoesArray = Array.isArray(avaliacoes) ? avaliacoes : [];
    let filtrados = [...avaliacoesArray];

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
        mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
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
      // Validações obrigatórias
      if (!formData.colaboradorId) {
        mostrarSnackbar('Selecione um colaborador', 'error');
        return;
      }
      
      if (!formData.avaliador) {
        mostrarSnackbar('Selecione um avaliador', 'error');
        return;
      }
      
      // Mapear colaboradorId (que agora é o nome) para colaboradorNome
      const funcionarioSelecionado = funcionarios.find(f => 
        (f.colaboradorNome || f.nomeCompleto) === formData.colaboradorId
      );
      const dadosParaEnvio = {
        ...formData,
        colaboradorNome: formData.colaboradorId // colaboradorId já é o nome agora
      };
      
      // Debug dos dados antes do envio
      console.log('🔍 DEBUG - Funcionário selecionado:', funcionarioSelecionado);
      console.log('🔍 DEBUG - Dados para envio:', dadosParaEnvio);
      
      if (avaliacaoEditando) {
        await updateAvaliacao(avaliacaoEditando._id, dadosParaEnvio);
        mostrarSnackbar('Avaliação atualizada com sucesso!', 'success');
      } else {
        await addAvaliacao(dadosParaEnvio);
        mostrarSnackbar('Avaliação adicionada com sucesso!', 'success');
      }
      await carregarDados();
      fecharModalAvaliacao();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      mostrarSnackbar('Erro ao salvar avaliação', 'error');
    }
  };

  const excluirAvaliacao = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deleteAvaliacao(id);
        mostrarSnackbar('Avaliação excluída com sucesso!', 'success');
        await carregarDados();
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
        id: avaliacaoSelecionada._id,
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

  // ===== FUNÇÕES DOS RELATÓRIOS =====

  const gerarRelatorioAgenteHandler = async () => {
    console.log('🔍 DEBUG - gerarRelatorioAgenteHandler chamado');
    console.log('🔍 DEBUG - selectedColaborador:', selectedColaborador);
    console.log('🔍 DEBUG - Tipo do selectedColaborador:', typeof selectedColaborador);
    console.log('🔍 DEBUG - Tamanho do selectedColaborador:', selectedColaborador?.length);
    
    if (!selectedColaborador) {
      console.log('⚠️ DEBUG - Nenhum colaborador selecionado');
      mostrarSnackbar('Selecione um colaborador', 'warning');
      return;
    }

    console.log('🚀 DEBUG - Iniciando geração de relatório para:', selectedColaborador);
    console.log('🚀 DEBUG - Passando para gerarRelatorioAgente:', selectedColaborador);
    setLoading(true);
    try {
      const relatorio = await gerarRelatorioAgente(selectedColaborador);
      console.log('📊 DEBUG - Relatório recebido:', relatorio);
      setRelatorioAgente(relatorio);
      
      if (relatorio) {
        mostrarSnackbar('Relatório gerado com sucesso!', 'success');
      } else {
        mostrarSnackbar('Nenhuma avaliação encontrada para este colaborador', 'info');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório do agente:', error);
      mostrarSnackbar('Erro ao gerar relatório', 'error');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioGestaoHandler = async () => {
    if (!filtroMes || !filtroAno) {
      mostrarSnackbar('Selecione mês e ano', 'warning');
      return;
    }

    setLoading(true);
    try {
      const relatorio = await gerarRelatorioGestao(filtroMes, filtroAno);
      setRelatorioGestao(relatorio);
      
      if (relatorio) {
        mostrarSnackbar('Relatório gerado com sucesso!', 'success');
      } else {
        mostrarSnackbar('Nenhuma avaliação encontrada para este período', 'info');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório da gestão:', error);
      mostrarSnackbar('Erro ao gerar relatório', 'error');
    } finally {
      setLoading(false);
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
    <Container maxWidth="lg" sx={{ mt: 2, mb: 8, pb: 4, position: 'relative' }}>
      {/* Botão Voltar - Canto esquerdo superior do dashboard */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/qualidade')}
        sx={{
          position: 'absolute',
          top: '10px',
          left: '10px',
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
        mb: 2,
        pt: 1
      }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 588, 
          color: '#000058',
          textAlign: 'center',
          mt: 1
        }}>
          Módulo de Qualidade
        </Typography>
      </Box>

      {/* Navegação por Abas */}
      <Card sx={{ mb: 2, mt: 1, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
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
          <Card sx={{ mb: 2, mt: 1, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
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
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mt: 2
          }}>
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
                        <TableRow key={avaliacao._id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
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
                              label={status.texto || 'Indefinido'}
                              sx={{
                                backgroundColor: status.cor || '#666666',
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
                              onClick={() => excluirAvaliacao(avaliacao._id)}
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
          <Card sx={{ 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            background: '#F3F7FC',
            padding: '24px',
            mt: 1
          }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header com título, botão e seletor na mesma linha */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                {/* Título */}
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Poppins', 
                  color: '#000058', 
                  fontWeight: 500,
                  fontSize: '1.5rem'
                }}>
                  Relatório Individual
                </Typography>

                {/* Linha com botão e seletor */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  {/* Botão Gerar Relatório */}
                  <Button
                    variant="contained"
                    onClick={gerarRelatorioAgenteHandler}
                    disabled={!selectedColaborador || loading}
                    className="velohub-btn-azul-opaco"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 3,
                      py: 0.5,
                      height: '40px',
                      backgroundColor: '#006AB9 !important', // Azul Opaco oficial do LAYOUT_GUIDELINES.md
                      color: '#F3F7FC !important', // Tom de branco oficial do LAYOUT_GUIDELINES.md
                      '&:hover': {
                        backgroundColor: '#005A9F !important', // Tom mais escuro do azul opaco
                      },
                      '&:disabled': {
                        backgroundColor: '#B0BEC5 !important',
                        color: '#F3F7FC !important'
                      }
                    }}
                  >
                    {loading ? 'Gerando...' : 'Gerar'}
                  </Button>
                  
                  {/* Seleção de Colaborador */}
                  <FormControl sx={{ minWidth: 250 }} className="velohub-select-alinhado">
                  <InputLabel 
                    sx={{ 
                      fontFamily: 'Poppins', 
                      color: '#000058',
                      '&.Mui-focused': {
                        color: '#006AB9'
                      }
                    }}
                  >
                    Selecione o Colaborador
                  </InputLabel>
                  <Select
                    value={selectedColaborador || ''}
                    onChange={(e) => {
                      console.log('🔍 DEBUG - Select onChange:', e.target.value);
                      setSelectedColaborador(e.target.value);
                    }}
                    label="Selecione o Colaborador"
                    sx={{ 
                      fontFamily: 'Poppins',
                      height: '40px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        height: '40px',
                        '& fieldset': {
                          borderColor: '#000058'
                        },
                        '&:hover fieldset': {
                          borderColor: '#006AB9'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#006AB9'
                        }
                      },
                      '& .MuiSelect-select': {
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: '8px !important',
                        paddingBottom: '8px !important',
                        boxSizing: 'border-box'
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 14px !important',
                        height: '24px !important',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  >
                    {funcionarios.map((funcionario) => (
                      <MenuItem 
                        key={funcionario.id} 
                        value={funcionario.colaboradorNome || funcionario.nomeCompleto}
                        sx={{ fontFamily: 'Poppins' }}
                      >
                        {funcionario.colaboradorNome || funcionario.nomeCompleto}
                      </MenuItem>
                    ))}
                  </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Resultados do Relatório */}
              {relatorioAgente && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Poppins', 
                    color: '#000058', 
                    fontWeight: 600, 
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Resultados para {relatorioAgente.colaboradorNome}
                  </Typography>

                  {/* Cards de Métricas */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'transparent',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h4" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#1634FF', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.totalAvaliacoes}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#1634FF' 
                        }}>
                          Total de Avaliações
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: relatorioAgente.mediaAvaliador > 60 
                          ? 'linear-gradient(135deg, rgba(22, 180, 255, 0.15) 0%, rgba(22, 180, 255, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h4" sx={{ 
                          fontFamily: 'Poppins', 
                          color: relatorioAgente.mediaAvaliador > 60 ? '#1694FF' : '#dc3545', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.mediaAvaliador}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: relatorioAgente.mediaAvaliador > 60 ? '#1694FF' : '#dc3545'
                        }}>
                          Média Avaliador
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(252, 194, 0, 0.15) 0%, rgba(252, 194, 0, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h4" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#FCC200', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.mediaGPT}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#FCC200'
                        }}>
                          Média GPT
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: relatorioAgente.tendencia === 'melhorando' 
                          ? 'linear-gradient(135deg, rgba(22, 180, 255, 0.15) 0%, rgba(22, 180, 255, 0.05) 100%)'
                          : relatorioAgente.tendencia === 'piorando'
                          ? 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)'
                          : 'transparent',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h4" sx={{ 
                          fontFamily: 'Poppins', 
                          color: relatorioAgente.tendencia === 'melhorando' 
                            ? '#1694FF'
                            : relatorioAgente.tendencia === 'piorando'
                            ? '#dc3545'
                            : '#1634FF',
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.tendencia === 'melhorando' ? '📈' : 
                           relatorioAgente.tendencia === 'piorando' ? '📉' : '➡️'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: relatorioAgente.tendencia === 'melhorando' 
                            ? '#1694FF'
                            : relatorioAgente.tendencia === 'piorando'
                            ? '#dc3545'
                            : '#1634FF'
                        }}>
                          {relatorioAgente.tendencia === 'melhorando' ? 'Melhorando' : 
                           relatorioAgente.tendencia === 'piorando' ? 'Precisa Atenção' : 'Estável'}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Melhor e Pior Nota */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(22, 180, 255, 0.15) 0%, rgba(22, 180, 255, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#1694FF', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.melhorNota}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#1694FF'
                        }}>
                          🏆 Melhor Nota
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#dc3545', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.piorNota}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#dc3545'
                        }}>
                          ⚠️ Pior Nota
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Container do Gráfico de Histórico */}
          {relatorioAgente && (
            <Card sx={{ 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              background: '#F3F7FC',
              padding: '24px',
              mt: 2
            }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Poppins', 
                  color: '#000058', 
                  fontWeight: 600, 
                  mb: 3
                }}>
                  Histórico de Avaliações
                </Typography>

                {/* Gráfico de Linha */}
                <Box sx={{ 
                  height: '300px', 
                  background: 'transparent',
                  border: '1.5px solid #000058',
                  borderRadius: '8px',
                  p: 2
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={relatorioAgente.historico || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis 
                        dataKey="periodo" 
                        stroke="#000058"
                        fontSize={12}
                        fontFamily="Poppins"
                      />
                      <YAxis 
                        stroke="#000058"
                        fontSize={12}
                        fontFamily="Poppins"
                        domain={[0, 100]}
                      />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: '#F3F7FC',
                          border: '1px solid #000058',
                          borderRadius: '8px',
                          fontFamily: 'Poppins',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#000058', fontWeight: 600 }}
                      />
                      <Legend 
                        wrapperStyle={{
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          color: '#000058'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="notaReal" 
                        stroke="#1694FF" 
                        strokeWidth={3}
                        dot={{ fill: '#1694FF', strokeWidth: 2, r: 4 }}
                        name="Notas Reais"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mediana" 
                        stroke="#FCC200" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#FCC200', strokeWidth: 2, r: 3 }}
                        name="Mediana"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tendencia" 
                        stroke={relatorioAgente.tendencia === 'melhorando' ? '#15A237' : 
                               relatorioAgente.tendencia === 'piorando' ? '#dc3545' : '#9e9e9e'} 
                        strokeWidth={2}
                        strokeDasharray="10 5"
                        dot={{ fill: relatorioAgente.tendencia === 'melhorando' ? '#15A237' : 
                                     relatorioAgente.tendencia === 'piorando' ? '#dc3545' : '#9e9e9e', 
                              strokeWidth: 2, r: 3 }}
                        name="Tendência"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}
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
                  {funcionarios.map((funcionario) => {
                    const nomeColaborador = funcionario.colaboradorNome || funcionario.nomeCompleto;
                    console.log('🔍 DEBUG - Criando MenuItem:', { 
                      id: funcionario._id, 
                      nome: nomeColaborador, 
                      value: nomeColaborador 
                    });
                    return (
                      <MenuItem key={funcionario._id || funcionario.id} value={nomeColaborador} sx={{ fontFamily: 'Poppins' }}>
                        {nomeColaborador}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Avaliador</InputLabel>
                <Select
                  value={formData.avaliador}
                  onChange={(e) => setFormData({ ...formData, avaliador: e.target.value })}
                  label="Avaliador"
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
                  {avaliadores.map((avaliador) => (
                    <MenuItem key={avaliador} value={avaliador} sx={{ fontFamily: 'Poppins' }}>
                      {avaliador}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            
            {/* Linha 1: Saudação e Escuta Ativa */}
            {[
              { key: 'saudacaoAdequada', label: 'Saudação Adequada', pontos: 10, isPositive: true },
              { key: 'escutaAtiva', label: 'Escuta Ativa', pontos: 25, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '8px',
                  backgroundColor: '#ffffff'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                      {criterio.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                    sx={{
                      minWidth: '28px',
                      width: '28px',
                      height: '28px',
                      border: criterio.isPositive 
                        ? (formData[criterio.key] ? '2px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                        : (formData[criterio.key] ? '2px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                      backgroundColor: criterio.isPositive 
                        ? (formData[criterio.key] ? '#000058' : 'transparent')
                        : (formData[criterio.key] ? '#EF4444' : 'transparent'),
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: criterio.isPositive 
                          ? (formData[criterio.key] ? '#000040' : 'rgba(22, 148, 255, 0.1)')
                          : (formData[criterio.key] ? '#DC2626' : 'rgba(255, 193, 7, 0.1)'),
                        borderColor: criterio.isPositive 
                          ? 'rgba(22, 148, 255, 0.75)'
                          : '#EF4444'
                      }
                    }}
                  >
                    {formData[criterio.key] && (
                      <CheckCircle sx={{ 
                        color: '#ffffff', 
                        fontSize: '14px' 
                      }} />
                    )}
                  </Button>
                </Box>
              </Grid>
            ))}
            
            {/* Linha 2: Resolução e Empatia */}
            {[
              { key: 'resolucaoQuestao', label: 'Resolução da Questão', pontos: 40, isPositive: true },
              { key: 'empatiaCordialidade', label: 'Empatia e Cordialidade', pontos: 15, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '8px',
                  backgroundColor: '#ffffff'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                      {criterio.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                    sx={{
                      minWidth: '28px',
                      width: '28px',
                      height: '28px',
                      border: criterio.isPositive 
                        ? (formData[criterio.key] ? '2px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                        : (formData[criterio.key] ? '2px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                      backgroundColor: criterio.isPositive 
                        ? (formData[criterio.key] ? '#000058' : 'transparent')
                        : (formData[criterio.key] ? '#EF4444' : 'transparent'),
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: criterio.isPositive 
                          ? (formData[criterio.key] ? '#000040' : 'rgba(22, 148, 255, 0.1)')
                          : (formData[criterio.key] ? '#DC2626' : 'rgba(255, 193, 7, 0.1)'),
                        borderColor: criterio.isPositive 
                          ? 'rgba(22, 148, 255, 0.75)'
                          : '#EF4444'
                      }
                    }}
                  >
                    {formData[criterio.key] && (
                      <CheckCircle sx={{ 
                        color: '#ffffff', 
                        fontSize: '14px' 
                      }} />
                    )}
                  </Button>
                </Box>
              </Grid>
            ))}
            
            {/* Linha 3: Direcionamento (coluna 1) - coluna 2 vazia */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 2, 
                border: formData.direcionouPesquisa 
                  ? '1px solid rgba(22, 148, 255, 0.75)' 
                  : '1px solid rgba(22, 148, 255, 0.5)',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                    Direcionamento de Pesquisa
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                    +10 pontos
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFormData({ ...formData, direcionouPesquisa: !formData.direcionouPesquisa })}
                  sx={{
                    minWidth: '28px',
                    width: '28px',
                    height: '28px',
                    border: formData.direcionouPesquisa 
                      ? '2px solid rgba(22, 148, 255, 0.75)' 
                      : '1px solid rgba(22, 148, 255, 0.5)',
                    backgroundColor: formData.direcionouPesquisa ? '#000058' : 'transparent',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: formData.direcionouPesquisa 
                        ? '#000040' 
                        : 'rgba(22, 148, 255, 0.1)',
                      borderColor: 'rgba(22, 148, 255, 0.75)'
                    }
                  }}
                >
                  {formData.direcionouPesquisa && (
                    <CheckCircle sx={{ 
                      color: '#ffffff', 
                      fontSize: '14px' 
                    }} />
                  )}
                </Button>
              </Box>
            </Grid>
            
            {/* Card invisível para ocupar coluna 2 da linha 3 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 2, 
                visibility: 'hidden'
              }}>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                  Espaço vazio
                </Typography>
              </Box>
            </Grid>
            
            {/* Linha 4: Encerramento Brusco (coluna 1) e Procedimento Incorreto (coluna 2) */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 2, 
                border: formData.encerramentoBrusco 
                  ? '1px solid #EF4444' 
                  : '1px solid rgba(255, 193, 7, 0.6)',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                    Encerramento Brusco
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                    -100 pontos
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFormData({ ...formData, encerramentoBrusco: !formData.encerramentoBrusco })}
                  sx={{
                    minWidth: '28px',
                    width: '28px',
                    height: '28px',
                    border: formData.encerramentoBrusco 
                      ? '2px solid #EF4444' 
                      : '1px solid rgba(255, 193, 7, 0.6)',
                    backgroundColor: formData.encerramentoBrusco ? '#EF4444' : 'transparent',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: formData.encerramentoBrusco 
                        ? '#DC2626' 
                        : 'rgba(255, 193, 7, 0.1)',
                      borderColor: '#EF4444'
                    }
                  }}
                >
                  {formData.encerramentoBrusco && (
                    <CheckCircle sx={{ 
                      color: '#ffffff', 
                      fontSize: '14px' 
                    }} />
                  )}
                </Button>
              </Box>
            </Grid>
            
            {/* Procedimento Incorreto - Coluna 2, Linha 4 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 2, 
                border: formData.procedimentoIncorreto ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                    Procedimento Incorreto
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                    -60 pontos
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFormData({ ...formData, procedimentoIncorreto: !formData.procedimentoIncorreto })}
                  sx={{
                    minWidth: '28px',
                    width: '28px',
                    height: '28px',
                    border: formData.procedimentoIncorreto ? '2px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)',
                    backgroundColor: formData.procedimentoIncorreto ? '#EF4444' : 'transparent',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: formData.procedimentoIncorreto ? '#DC2626' : 'rgba(255, 193, 7, 0.1)',
                      borderColor: '#EF4444'
                    }
                  }}
                >
                  {formData.procedimentoIncorreto && (
                    <CheckCircle sx={{ 
                      color: '#ffffff', 
                      fontSize: '14px' 
                    }} />
                  )}
                </Button>
              </Box>
            </Grid>
            
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
