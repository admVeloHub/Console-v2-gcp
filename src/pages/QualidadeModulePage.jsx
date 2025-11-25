// VERSION: v1.30.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
  Add, 
  Edit, 
  Delete, 
  Assessment, 
  BarChart, 
  People, 
  Psychology,
  Search,
  Clear,
  FilterList,
  CheckCircle,
  Cancel,
  VolumeUp,
  VolumeOff,
  MicOff,
  Mic,
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
import { getAvaliadoresValidos } from '../services/userService';
import { 
  MESES, 
  ANOS, 
  getStatusPontuacao, 
  generateId,
  formatDate
} from '../types/qualidade';
import UploadAudioModal from '../components/qualidade/UploadAudioModal';
import AnaliseGPTAccordion from '../components/qualidade/AnaliseGPTAccordion';
import DetalhesAnaliseModal from '../components/qualidade/DetalhesAnaliseModal';
import { uploadAudioParaAnalise, listarAnalisesPorColaborador } from '../services/qualidadeAudioService';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/common/BackButton';

const QualidadeModulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados principais
  const [currentView, setCurrentView] = useState('avaliacoes');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [avaliadores, setAvaliadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    colaborador: '',
    avaliador: '',
    dataAvaliacaoInicio: '',
    dataAvaliacaoFim: '',
    dataLigacaoInicio: '',
    dataLigacaoFim: '',
    mes: '',
    ano: '',
    status: ''
  });
  
  // Estados dos modais
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [modalGPTAberto, setModalGPTAberto] = useState(false);
  const [modalUploadAberto, setModalUploadAberto] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(null);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
  const [avaliacaoParaUpload, setAvaliacaoParaUpload] = useState(null);
  
  // Estados dos formulários
  const [formData, setFormData] = useState({
    colaboradorNome: '',
    avaliador: '',
    mes: '',
    ano: new Date().getFullYear(),
    saudacaoAdequada: false,
    escutaAtiva: false,
    clarezaObjetividade: false,        // NOVO critério
    resolucaoQuestao: false,
    dominioAssunto: false,             // NOVO critério
    empatiaCordialidade: false,
    direcionouPesquisa: false,
    procedimentoIncorreto: false,
    encerramentoBrusco: false,
    observacoes: '',
    dataLigacao: '',
    horaLigacao: ''
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
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [relatorioAgente, setRelatorioAgente] = useState(null);
  const [relatorioGestao, setRelatorioGestao] = useState(null);

  // Estados para Análise GPT
  const [filtrosGPT, setFiltrosGPT] = useState({
    colaborador: '',
    mes: '',
    ano: new Date().getFullYear()
  });
  const [analisesGPT, setAnalisesGPT] = useState([]);
  const [loadingAnalisesGPT, setLoadingAnalisesGPT] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null);

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
      const avaliacoesData = await getAvaliacoes();
      const todosFuncionarios = await getFuncionarios();
      const avaliadoresValidos = await getAvaliadoresValidos();
      
      // Filtrar apenas funcionários ativos
      const funcionariosAtivos = todosFuncionarios.filter(f => !f.desligado && !f.afastado);
      
      // Fallback: se não há funcionários ativos, usar todos os funcionários
      const funcionariosParaUsar = funcionariosAtivos.length > 0 ? funcionariosAtivos : todosFuncionarios;
      
      // Garantir que todos os funcionários tenham um ID válido
      const funcionariosComId = funcionariosParaUsar.map(f => ({
        ...f,
        id: f._id || f.id,
        _id: f._id || f.id
      }));
      
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

    // Filtro por colaborador (nome parcial, case-insensitive)
    if (filtros.colaborador) {
      filtrados = filtrados.filter(a => 
        a.colaboradorNome.toLowerCase().includes(filtros.colaborador.toLowerCase())
      );
    }

    // Filtro por avaliador (nome parcial, case-insensitive)
    if (filtros.avaliador) {
      filtrados = filtrados.filter(a => 
        a.avaliador.toLowerCase().includes(filtros.avaliador.toLowerCase())
      );
    }

    // Filtro por data da avaliação (range)
    if (filtros.dataAvaliacaoInicio) {
      filtrados = filtrados.filter(a => 
        new Date(a.createdAt) >= new Date(filtros.dataAvaliacaoInicio)
      );
    }
    if (filtros.dataAvaliacaoFim) {
      filtrados = filtrados.filter(a => 
        new Date(a.createdAt) <= new Date(filtros.dataAvaliacaoFim)
      );
    }

    // Filtro por data da ligação (range)
    if (filtros.dataLigacaoInicio) {
      filtrados = filtrados.filter(a => 
        a.dataLigacao && new Date(a.dataLigacao) >= new Date(filtros.dataLigacaoInicio)
      );
    }
    if (filtros.dataLigacaoFim) {
      filtrados = filtrados.filter(a => 
        a.dataLigacao && new Date(a.dataLigacao) <= new Date(filtros.dataLigacaoFim)
      );
    }

    // Filtro por período (mês/ano)
    if (filtros.mes) {
      filtrados = filtrados.filter(a => a.mes === filtros.mes);
    }
    if (filtros.ano) {
      filtrados = filtrados.filter(a => a.ano === parseInt(filtros.ano));
    }

    // Filtro por status
    if (filtros.status) {
      filtrados = filtrados.filter(a => {
        const status = getStatusPontuacao(a.pontuacaoTotal);
        return status.status === filtros.status;
      });
    }

    return filtrados;
  };

  const limparFiltros = () => {
    setFiltros({
      colaborador: '',
      avaliador: '',
      dataAvaliacaoInicio: '',
      dataAvaliacaoFim: '',
      dataLigacaoInicio: '',
      dataLigacaoFim: '',
      mes: '',
      ano: '',
      status: ''
    });
    setModalFiltrosAberto(false);
  };

  const abrirModalAvaliacao = (avaliacao = null) => {
    if (avaliacao) {
      setAvaliacaoEditando(avaliacao);
      
      // Debug: Log dos dados da avaliação sendo editada
      console.log('🔍 DEBUG - Editando avaliação:', avaliacao._id);
      
      // Verificar se o usuário atual é avaliador
      const isAvaliador = user?._funcoesAdministrativas?.avaliador === true;
      const avaliadorAutomatico = isAvaliador ? user._userId : '';
      
      setFormData({
        colaboradorNome: avaliacao.colaboradorNome || avaliacao.colaboradorNome,
        avaliador: isAvaliador ? user._userId : avaliacao.avaliador,
        mes: avaliacao.mes,
        ano: avaliacao.ano,
        saudacaoAdequada: avaliacao.saudacaoAdequada,
        escutaAtiva: avaliacao.escutaAtiva,
        clarezaObjetividade: Boolean(avaliacao.clarezaObjetividade),  // NOVO critério - garantir boolean
        resolucaoQuestao: avaliacao.resolucaoQuestao,
        dominioAssunto: Boolean(avaliacao.dominioAssunto),            // NOVO critério - garantir boolean
        empatiaCordialidade: avaliacao.empatiaCordialidade,
        direcionouPesquisa: avaliacao.direcionouPesquisa,
        procedimentoIncorreto: avaliacao.procedimentoIncorreto,
        encerramentoBrusco: avaliacao.encerramentoBrusco,
        observacoes: avaliacao.observacoes || '',
        dataLigacao: avaliacao.dataLigacao ? (avaliacao.dataLigacao.includes('T') ? avaliacao.dataLigacao.split('T')[0] : avaliacao.dataLigacao) : '',
        horaLigacao: avaliacao.dataLigacao && avaliacao.dataLigacao.includes('T') 
          ? avaliacao.dataLigacao.split('T')[1]?.substring(0, 5) || '' 
          : '',
        arquivoLigacao: null
      });
      
    } else {
      setAvaliacaoEditando(null);
      
      // Verificar se o usuário atual é avaliador para preenchimento automático
      const isAvaliador = user?._funcoesAdministrativas?.avaliador === true;
      const avaliadorAutomatico = isAvaliador ? user._userId : '';
      
      setFormData({
        colaboradorNome: '',
        avaliador: avaliadorAutomatico,
        mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
        ano: new Date().getFullYear(),
        saudacaoAdequada: false,
        escutaAtiva: false,
        clarezaObjetividade: false,        // NOVO critério
        resolucaoQuestao: false,
        dominioAssunto: false,             // NOVO critério
        empatiaCordialidade: false,
        direcionouPesquisa: false,
        procedimentoIncorreto: false,
        encerramentoBrusco: false,
        observacoes: '',
        dataLigacao: '',
        horaLigacao: '',
        arquivoLigacao: null
      });
    }
    setModalAvaliacaoAberto(true);
  };

  const fecharModalAvaliacao = () => {
    setModalAvaliacaoAberto(false);
    setAvaliacaoEditando(null);
    setFormData({
      colaboradorNome: '',
      avaliador: '',
      mes: '',
      ano: new Date().getFullYear(),
      saudacaoAdequada: false,
      escutaAtiva: false,
      clarezaObjetividade: false,        // NOVO critério
      resolucaoQuestao: false,
      dominioAssunto: false,             // NOVO critério
      empatiaCordialidade: false,
      direcionouPesquisa: false,
      procedimentoIncorreto: false,
      encerramentoBrusco: false,
      observacoes: '',
      dataLigacao: '',
      horaLigacao: '',
      arquivoLigacao: null,
    });
  };

  const salvarAvaliacao = async () => {
    try {
      // Validações obrigatórias
      if (!formData.colaboradorNome) {
        mostrarSnackbar('Selecione um colaborador', 'error');
        return;
      }
      
      if (!formData.avaliador) {
        mostrarSnackbar('Selecione um avaliador', 'error');
        return;
      }
      
      // Mapear colaboradorNome (que agora é o nome) para colaboradorNome
      const funcionarioSelecionado = funcionarios.find(f => 
        (f.colaboradorNome || f.nomeCompleto) === formData.colaboradorNome
      );
      
      // Combinar data e hora em um único string datetime
      let dataLigacaoCombinada = '';
      if (formData.dataLigacao) {
        if (formData.horaLigacao) {
          // Combinar data e hora: "YYYY-MM-DDTHH:mm"
          dataLigacaoCombinada = `${formData.dataLigacao}T${formData.horaLigacao}`;
        } else {
          // Apenas data: "YYYY-MM-DD"
          dataLigacaoCombinada = formData.dataLigacao;
        }
      }
      
      const dadosParaEnvio = {
        ...formData,
        colaboradorNome: formData.colaboradorNome, // colaboradorNome já é o nome agora
        dataLigacao: dataLigacaoCombinada
      };
      
      // Remover horaLigacao do objeto de envio (já foi combinado com dataLigacao)
      delete dadosParaEnvio.horaLigacao;
      
      // Debug dos dados antes do envio
      console.log('🔍 DEBUG - Salvando avaliação:', avaliacaoEditando ? 'EDITANDO' : 'CRIANDO');
      
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
      console.error('🔍 DEBUG - Detalhes do erro:', error.response?.data || error.message);
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

  // ===== FUNÇÕES DO MODAL DE UPLOAD =====

  const abrirModalUpload = (avaliacao) => {
    setAvaliacaoParaUpload(avaliacao);
    setModalUploadAberto(true);
  };

  const fecharModalUpload = () => {
    setModalUploadAberto(false);
    setAvaliacaoParaUpload(null);
  };

  const handleUploadAudio = async (avaliacaoId, audioFile) => {
    try {
      const result = await uploadAudioParaAnalise(avaliacaoId, audioFile);
      
      // Atualizar estado da avaliação para mostrar que está processando
      setAvaliacoes(prev => prev.map(avaliacao => 
        avaliacao._id === avaliacaoId 
          ? { ...avaliacao, uploadingAudio: true, audioUploadId: result.audioId }
          : avaliacao
      ));
      
      return result;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  // Função para determinar status do áudio
  const getAudioStatus = (avaliacao) => {
    // Usar campos diretamente da avaliação (fundidos de audio_analise_status)
    // Verde quando treated=true (processamento concluído)
    if (avaliacao.audioTreated === true) {
      return 'completo'; // Verde
    }
    
    // Amarelo quando sent=true mas treated=false (enviado mas não processado)
    if (avaliacao.audioSent === true && avaliacao.audioTreated === false) {
      return 'enviando'; // Amarelo
    }
    
    // Compatibilidade com campos antigos (durante migração)
    if (avaliacao.audioStatus?.treated === true) {
      return 'completo'; // Verde
    }
    if (avaliacao.audioStatus?.sent === true && avaliacao.audioStatus?.treated === false) {
      return 'enviando'; // Amarelo
    }
    if (avaliacao.audioGptId) return 'completo'; // Verde
    if (avaliacao.uploadingAudio) return 'enviando'; // Amarelo
    
    return 'sem_audio'; // Cinza opaco
  };

  // Função para renderizar ícone de áudio
  const renderAudioIcon = (avaliacao) => {
    const status = getAudioStatus(avaliacao);
    
    const iconProps = {
      sx: { 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)'
        }
      },
      onClick: () => abrirModalUpload(avaliacao)
    };

    switch (status) {
      case 'completo':
        return <Mic sx={{ ...iconProps.sx, color: '#15A237' }} {...iconProps} />;
      case 'enviando':
        return <Mic sx={{ ...iconProps.sx, color: '#FCC200' }} {...iconProps} />;
      default:
        return <MicOff sx={{ ...iconProps.sx, color: '#B0BEC5' }} {...iconProps} />;
    }
  };

  // ===== FUNÇÕES DA ABA ANÁLISE GPT =====

  const carregarAnalisesGPT = async () => {
    if (!filtrosGPT.colaborador) return;
    
    try {
      setLoadingAnalisesGPT(true);
      
      const result = await listarAnalisesPorColaborador(
        filtrosGPT.colaborador, 
        filtrosGPT.mes, 
        filtrosGPT.ano
      );
      setAnalisesGPT(result.analises || []);
      
      if (result.analises && result.analises.length > 0) {
        mostrarSnackbar(`${result.analises.length} análise(s) encontrada(s)`, 'success');
      } else {
        mostrarSnackbar('Nenhuma análise encontrada para este colaborador', 'info');
      }
    } catch (error) {
      console.error('Erro ao carregar análises GPT:', error);
      mostrarSnackbar('Erro ao carregar análises GPT', 'error');
    } finally {
      setLoadingAnalisesGPT(false);
    }
  };

  const abrirModalDetalhesGPT = (analise) => {
    setAnaliseSelecionada(analise);
    setModalDetalhesAberto(true);
  };

  const fecharModalDetalhes = () => {
    setModalDetalhesAberto(false);
    setAnaliseSelecionada(null);
  };

  const abrirModalAuditoria = (analise) => {
    // TODO: Implementar modal de auditoria
    console.log('Abrir modal de auditoria para:', analise);
    mostrarSnackbar('Modal de auditoria será implementado na próxima fase', 'info');
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
    console.log('🚀 DEBUG - Filtro período:', { inicio: filtroDataInicio, fim: filtroDataFim });
    console.log('🚀 DEBUG - Passando para gerarRelatorioAgente:', selectedColaborador);
    setLoading(true);
    try {
      const relatorio = await gerarRelatorioAgente(selectedColaborador, filtroDataInicio, filtroDataFim);
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
      <Container maxWidth={false} sx={{ 
        mt: 6, 
        mb: 8, 
        pb: 4, 
        position: 'relative',
        px: 3.125, // 25px padding nas laterais
        maxWidth: '100%'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{
      mt: 2,
      mb: 8,
      pb: 4,
      position: 'relative',
      px: 3.125, // 25px padding nas laterais
      maxWidth: '100%',
      fontSize: '0.8rem'
    }}>
      {/* Header único - alinhamento central absoluto das abas */}
      <Box sx={{ position: 'relative', mb: 3.2, minHeight: 40 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
          <BackButton />
        </Box>
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          width: 'max-content'
        }}>
          <Tabs
            value={currentView}
            onChange={(e, newValue) => setCurrentView(newValue)}
            aria-label="qualidade tabs"
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontFamily: 'Poppins',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'var(--blue-light)',
                },
                '&:not(.Mui-selected)': {
                  color: 'var(--gray)',
                  opacity: 0.7,
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--blue-light)',
                height: 2,
              }
            }}
          >
            <Tab 
              value="avaliacoes" 
              label="Avaliações"
              id="qualidade-tab-0"
              aria-controls="qualidade-tabpanel-0"
            />
            <Tab 
              value="relatorio-agente" 
              label="Relatório do Agente"
              id="qualidade-tab-1"
              aria-controls="qualidade-tabpanel-1"
            />
            <Tab 
              value="gpt" 
              label="Análise IA"
              id="qualidade-tab-2"
              aria-controls="qualidade-tabpanel-2"
            />
          </Tabs>
        </Box>
      </Box>

      {/* Conteúdo das Abas */}
      {currentView === 'avaliacoes' && (
        <Box>
          {/* Toolbar */}
          <Card sx={{ mb: 1.6, mt: 0.8, borderRadius: '12.8px', boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)' }}>
            <CardContent sx={{ py: 0.6, px: 2, '&:last-child': { pb: 0.6 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, fontSize: '0.96rem' }}>
                  Avaliações ({avaliacoesFiltradas.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Button
                    size="small"
                    startIcon={<FilterList />}
                    onClick={() => setModalFiltrosAberto(true)}
                    sx={{
                      backgroundColor: '#1694FF',
                      color: '#ffffff',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      py: 0.4,
                      px: 1.2,
                      '&:hover': {
                        backgroundColor: '#0F7AD9'
                      }
                    }}
                  >
                    Filtrar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => abrirModalAvaliacao()}
                    sx={{
                      backgroundColor: '#000058',
                      color: '#ffffff',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      py: 0.4,
                      px: 1.2,
                      '&:hover': {
                        backgroundColor: '#000040'
                      }
                    }}
                  >
                    Nova Avaliação
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Assessment />}
                    onClick={exportAvaliacoesToExcel}
                    sx={{
                      backgroundColor: '#15A237',
                      color: '#ffffff',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      py: 0.4,
                      px: 1.2,
                      '&:hover': {
                        backgroundColor: '#128A2F'
                      }
                    }}
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    size="small"
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

            </CardContent>
          </Card>

          {/* Lista de Avaliações */}
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mt: 2
          }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Colaborador</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Avaliador</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Data da Avaliação</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Data da Ligação</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Período</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Pontuação</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Status</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Áudio</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avaliacoesFiltradas.length > 0 ? (
                    avaliacoesFiltradas.map((avaliacao) => {
                      const status = getStatusPontuacao(avaliacao.pontuacaoTotal);
                      
                      return (
                        <TableRow key={avaliacao._id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Avatar sx={{ width: 25.6, height: 25.6, backgroundColor: '#1694FF', fontSize: '0.8rem' }}>
                                {avaliacao.colaboradorNome.charAt(0)}
                              </Avatar>
                              {avaliacao.colaboradorNome}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>{avaliacao.avaliador}</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                            {avaliacao.createdAt ? formatDate(avaliacao.createdAt) : '-'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                            {avaliacao.dataLigacao ? formatDate(avaliacao.dataLigacao) : '-'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                            {avaliacao.mes}/{avaliacao.ano}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', py: 0.8 }}>
                            {avaliacao.pontuacaoTotal} pts
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            <Chip
                              label={status.texto || 'Indefinido'}
                              size="small"
                              sx={{
                                backgroundColor: status.cor || '#666666',
                                color: '#ffffff',
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '0.64rem',
                                height: '20px'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            {renderAudioIcon(avaliacao)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalAvaliacao(avaliacao)}
                              sx={{ color: '#1694FF', padding: '0.4rem' }}
                            >
                              <Edit sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalGPT(avaliacao)}
                              sx={{ color: '#9C27B0', padding: '0.4rem' }}
                            >
                              <Psychology sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => excluirAvaliacao(avaliacao._id)}
                              sx={{ color: '#EF4444', padding: '0.4rem' }}
                            >
                              <Delete sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3.2 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
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
              {/* Header com título, botão, seletor e filtro de período - Tudo em uma única linha */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 1.6,
                mb: 3,
                flexWrap: 'wrap'
                }}>
                  {/* Título */}
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Poppins', 
                    color: '#000058', 
                    fontWeight: 500,
                  fontSize: '1.2rem',
                  flexShrink: 0
                  }}>
                    Relatório Individual
                  </Typography>

                {/* Controles: Botão, Seletor, Filtros de Data e Limpar */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                  gap: 1.6,
                  flexWrap: 'wrap',
                  flex: 1,
                  justifyContent: 'flex-end'
                  }}>
                    {/* Botão Gerar Relatório */}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={gerarRelatorioAgenteHandler}
                      disabled={!selectedColaborador || loading}
                      className="velohub-btn-azul-opaco"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        borderRadius: '6.4px',
                        px: 2.4,
                      py: 0.2,
                      height: '32px',
                        backgroundColor: '#006AB9 !important',
                        color: '#F3F7FC !important',
                        '&:hover': {
                          backgroundColor: '#005A9F !important',
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
                  <FormControl size="small" sx={{ minWidth: 200, height: '32px' }} className="velohub-select-alinhado">
                    <InputLabel 
                      sx={{ 
                        fontFamily: 'Poppins', 
                        fontSize: '0.8rem',
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
                      size="small"
                      sx={{ 
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        height: '32px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6.4px',
                          height: '32px',
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
                          display: 'flex',
                          alignItems: 'center',
                          paddingTop: '6px !important',
                          paddingBottom: '6px !important',
                          boxSizing: 'border-box',
                          height: '32px !important'
                        },
                        '& .MuiInputBase-input': {
                          padding: '6px 14px !important',
                          height: '32px !important',
                          display: 'flex',
                          alignItems: 'center'
                        }
                      }}
                    >
                      {funcionarios.map((funcionario) => (
                        <MenuItem 
                          key={funcionario.id} 
                          value={funcionario.colaboradorNome || funcionario.nomeCompleto}
                          sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                        >
                          {funcionario.colaboradorNome || funcionario.nomeCompleto}
                        </MenuItem>
                      ))}
                    </Select>
                    </FormControl>

                  {/* Campo Data Início */}
                  <TextField
                    type="date"
                    label="Início"
                    size="small"
                    value={filtroDataInicio || ''}
                    onChange={(e) => setFiltroDataInicio(e.target.value || null)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: '140px',
                      height: '32px',
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        height: '32px',
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
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        color: '#000058',
                        '&.Mui-focused': {
                          color: '#006AB9'
                        }
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.8rem',
                        padding: '6px 10px',
                        height: '32px'
                      }
                    }}
                  />
                  
                  {/* Campo Data Fim */}
                  <TextField
                    type="date"
                    label="Fim"
                    size="small"
                    value={filtroDataFim || ''}
                    onChange={(e) => setFiltroDataFim(e.target.value || null)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: '140px',
                      height: '32px',
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        height: '32px',
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
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        color: '#000058',
                        '&.Mui-focused': {
                          color: '#006AB9'
                        }
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.8rem',
                        padding: '6px 10px',
                        height: '32px'
                      }
                    }}
                  />

                  {/* Botão Limpar */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setFiltroDataInicio(null);
                      setFiltroDataFim(null);
                    }}
                    disabled={!filtroDataInicio && !filtroDataFim}
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      borderRadius: '6.4px',
                      px: 1.6,
                      py: 0.2,
                      minWidth: 'auto',
                      height: '32px',
                      borderColor: '#000058',
                      color: '#000058',
                      '&:hover': {
                        borderColor: '#006AB9',
                        color: '#006AB9',
                        backgroundColor: 'rgba(0, 106, 185, 0.04)'
                      },
                      '&:disabled': {
                        borderColor: '#B0BEC5',
                        color: '#B0BEC5'
                      }
                    }}
                  >
                    Limpar
                  </Button>
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
                        <Typography variant="h4" sx={{ fontSize: '1.28rem', 
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
                        <Typography variant="h4" sx={{ fontSize: '1.28rem', 
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
                        <Typography variant="h4" sx={{ fontSize: '1.28rem', 
                          fontFamily: 'Poppins', 
                          color: '#FCC200', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.mediaGPT !== null && relatorioAgente.mediaGPT !== undefined 
                            ? relatorioAgente.mediaGPT 
                            : '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#FCC200'
                        }}>
                          Média IA
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
                        <Typography variant="h4" sx={{ fontSize: '1.28rem', 
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
                        <Typography variant="h5" sx={{ fontSize: '1.2rem', 
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
                        <Typography variant="h5" sx={{ fontSize: '1.2rem', 
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


      {currentView === 'gpt' && (
        <Box>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, mb: 3 }}>
                Análise GPT - Avaliações por Inteligência Artificial
              </Typography>
              
              {/* Filtros */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3, 
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Colaborador *</InputLabel>
                  <Select
                    value={filtrosGPT.colaborador}
                    onChange={(e) => setFiltrosGPT({ ...filtrosGPT, colaborador: e.target.value })}
                    label="Colaborador *"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem',
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
                      return (
                        <MenuItem key={funcionario._id} value={nomeColaborador} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                          {nomeColaborador}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Mês</InputLabel>
                  <Select
                    value={filtrosGPT.mes}
                    onChange={(e) => setFiltrosGPT({ ...filtrosGPT, mes: e.target.value })}
                    label="Mês"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1694FF'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000058'
                      }
                    }}
                  >
                    {MESES.map((mes) => (
                      <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                        {mes}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 96 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Ano</InputLabel>
                  <Select
                    value={filtrosGPT.ano}
                    onChange={(e) => setFiltrosGPT({ ...filtrosGPT, ano: e.target.value })}
                    label="Ano"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1694FF'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000058'
                      }
                    }}
                  >
                    {ANOS.map((ano) => (
                      <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                        {ano}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  size="small"
                  onClick={carregarAnalisesGPT}
                  disabled={!filtrosGPT.colaborador}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    py: 0.4,
                    px: 1.2,
                    bgcolor: 'var(--blue-medium)',
                    '&:hover': {
                      bgcolor: 'var(--blue-dark)'
                    },
                    '&:disabled': {
                      bgcolor: 'var(--gray)',
                      color: 'white'
                    }
                  }}
                >
                  Buscar Análises
                </Button>
              </Box>

              {/* Mensagem de instrução */}
              {!filtrosGPT.colaborador && (
                <Alert severity="info" sx={{ fontFamily: 'Poppins', mb: 3 }}>
                  Selecione um colaborador para visualizar as análises GPT.
                </Alert>
              )}

              {/* Lista de Análises GPT */}
              {filtrosGPT.colaborador && (
                <Box>
                  {loadingAnalisesGPT && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <LinearProgress sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
                        Carregando análises GPT...
                      </Typography>
                    </Box>
                  )}
                  
                  <AnaliseGPTAccordion 
                    analises={analisesGPT}
                    onVerDetalhes={abrirModalDetalhesGPT}
                    loading={loadingAnalisesGPT}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Modal Avaliação */}
      <Dialog open={modalAvaliacaoAberto} onClose={fecharModalAvaliacao} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.96rem', py: 1.6 }}>
          {avaliacaoEditando ? 'Editar Avaliação' : 'Nova Avaliação'}
        </DialogTitle>
        <DialogContent sx={{ fontSize: '0.8rem' }}>
          <Grid container spacing={1.6} sx={{ mt: 0.8 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Colaborador</InputLabel>
                <Select
                  value={formData.colaboradorNome}
                  onChange={(e) => setFormData({ ...formData, colaboradorNome: e.target.value })}
                  label="Colaborador"
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
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
                    return (
                      <MenuItem key={funcionario._id || funcionario.id} value={nomeColaborador} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                        {nomeColaborador}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              {user?._funcoesAdministrativas?.avaliador === true ? (
                <TextField
                  value={user._userId}
                  label="Avaliador"
                  disabled
                  fullWidth
                  required
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: '#000058',
                      fontWeight: 500
                    },
                    '& .MuiInputLabel-root.Mui-disabled': {
                      color: '#666666'
                    }
                  }}
                />
              ) : (
                <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Avaliador</InputLabel>
                <Select
                  value={formData.avaliador}
                  onChange={(e) => setFormData({ ...formData, avaliador: e.target.value })}
                  label="Avaliador"
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1694FF'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000058'
                      }
                    }}
                  >
                    {avaliadores.map((avaliador) => (
                      <MenuItem key={avaliador} value={avaliador} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                        {avaliador}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Mês</InputLabel>
                <Select
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  label="Mês"
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000058'
                    }
                  }}
                >
                  {MESES.map((mes) => (
                    <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                      {mes}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Ano</InputLabel>
                <Select
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                  label="Ano"
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000058'
                    }
                  }}
                >
                  {ANOS.map((ano) => (
                    <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Data da Ligação Avaliada"
                type="date"
                value={formData.dataLigacao}
                onChange={(e) => setFormData({ ...formData, dataLigacao: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                  style: { fontFamily: 'Poppins', fontSize: '0.8rem' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Hora da Ligação"
                type="time"
                value={formData.horaLigacao}
                onChange={(e) => setFormData({ ...formData, horaLigacao: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                  style: { fontFamily: 'Poppins', fontSize: '0.8rem' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  }
                }}
              />
            </Grid>
            
            {/* Critérios de Avaliação */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 1.6, fontSize: '0.96rem' }}>
                Critérios de Avaliação
              </Typography>
            </Grid>
            
            {/* Linha 1: Saudação e Escuta Ativa */}
            {[
              { key: 'saudacaoAdequada', label: 'Saudação Adequada', pontos: 10, isPositive: true },
              { key: 'escutaAtiva', label: 'Escuta Ativa / Sondagem', pontos: 15, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: '#ffffff'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem' }}>
                      {criterio.label}
                    </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                    sx={{
                      minWidth: '22.4px',
                      width: '22.4px',
                      height: '22.4px',
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
                        fontSize: '11.2px' 
                      }} />
                    )}
                  </Button>
                </Box>
              </Grid>
            ))}
            
            {/* Linha 2: Clareza e Resolução */}
            {[
              { key: 'clarezaObjetividade', label: 'Clareza e Objetividade', pontos: 10, isPositive: true },
              { key: 'resolucaoQuestao', label: 'Boa Resolução / Procedimento', pontos: 25, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: '#ffffff'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem' }}>
                      {criterio.label}
                    </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                    sx={{
                      minWidth: '22.4px',
                      width: '22.4px',
                      height: '22.4px',
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
                        fontSize: '11.2px' 
                      }} />
                    )}
                  </Button>
                </Box>
              </Grid>
            ))}
            
            {/* Linha 3: Domínio e Empatia */}
            {[
              { key: 'dominioAssunto', label: 'Domínio no assunto abordado', pontos: 15, isPositive: true },
              { key: 'empatiaCordialidade', label: 'Empatia / Cordialidade', pontos: 15, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: '#ffffff'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem' }}>
                      {criterio.label}
                    </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
                    sx={{
                      minWidth: '22.4px',
                      width: '22.4px',
                      height: '22.4px',
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
                        fontSize: '11.2px' 
                      }} />
                    )}
                  </Button>
                </Box>
              </Grid>
            ))}
            
            {/* Linha 4: Direcionamento (coluna 1) - coluna 2 vazia */}
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
                    Direcionou para pesquisa de satisfação
                  </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
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
            
            {/* Card invisível para ocupar coluna 2 da linha 4 */}
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
            
            {/* Linha 5: Encerramento Brusco (coluna 1) e Procedimento Incorreto (coluna 2) */}
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
                    Colaborador encerrou o contato de forma brusca / Derrubou a ligação
                  </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
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
                    Colaborador repassou um procedimento incorreto
                  </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
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
                size="small"
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.8rem',
                    fontFamily: 'Poppins'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ py: 1.6, px: 1.6 }}>
          <Button 
            size="small"
            onClick={fecharModalAvaliacao} 
            sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem', py: 0.4, px: 1.2 }}
          >
            Cancelar
          </Button>
          <Button
            size="small"
            onClick={salvarAvaliacao}
            sx={{
              backgroundColor: '#000058',
              color: '#ffffff',
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '0.8rem',
              py: 0.4,
              px: 1.2,
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
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
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

      {/* Modal de Upload de Áudio */}
      <UploadAudioModal
        open={modalUploadAberto}
        onClose={fecharModalUpload}
        onUpload={handleUploadAudio}
        avaliacaoId={avaliacaoParaUpload?._id}
        avaliacao={avaliacaoParaUpload}
      />

      {/* Modal Detalhes da Análise GPT */}
      <DetalhesAnaliseModal
        open={modalDetalhesAberto}
        onClose={fecharModalDetalhes}
        analise={analiseSelecionada}
        onAuditar={abrirModalAuditoria}
        podeAuditar={user?._funcoesAdministrativas?.auditoria === true}
      />

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

      {/* Modal de Filtros Avançados */}
      <Dialog 
        open={modalFiltrosAberto} 
        onClose={() => setModalFiltrosAberto(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          Filtros Avançados
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Colaborador */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Colaborador</InputLabel>
                <Select
                  value={filtros.colaborador}
                  onChange={(e) => setFiltros({ ...filtros, colaborador: e.target.value })}
                  label="Colaborador"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                  {funcionarios.map((funcionario) => {
                    const nomeColaborador = funcionario.colaboradorNome || funcionario.nomeCompleto;
                    return (
                      <MenuItem key={funcionario._id} value={nomeColaborador} sx={{ fontFamily: 'Poppins' }}>
                        {nomeColaborador}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Avaliador */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Avaliador</InputLabel>
                <Select
                  value={filtros.avaliador}
                  onChange={(e) => setFiltros({ ...filtros, avaliador: e.target.value })}
                  label="Avaliador"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                  {avaliadores.map((avaliador) => (
                    <MenuItem key={avaliador} value={avaliador} sx={{ fontFamily: 'Poppins' }}>
                      {avaliador}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Data da Avaliação - Início */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Avaliação - Início"
                type="date"
                value={filtros.dataAvaliacaoInicio}
                onChange={(e) => setFiltros({ ...filtros, dataAvaliacaoInicio: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                  style: { fontFamily: 'Poppins' }
                }}
                sx={{ fontFamily: 'Poppins' }}
              />
            </Grid>

            {/* Data da Avaliação - Fim */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Avaliação - Fim"
                type="date"
                value={filtros.dataAvaliacaoFim}
                onChange={(e) => setFiltros({ ...filtros, dataAvaliacaoFim: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                  style: { fontFamily: 'Poppins' }
                }}
                sx={{ fontFamily: 'Poppins' }}
              />
            </Grid>

            {/* Data da Ligação - Início */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Ligação - Início"
                type="date"
                value={filtros.dataLigacaoInicio}
                onChange={(e) => setFiltros({ ...filtros, dataLigacaoInicio: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                  style: { fontFamily: 'Poppins' }
                }}
                sx={{ fontFamily: 'Poppins' }}
              />
            </Grid>

            {/* Data da Ligação - Fim */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Ligação - Fim"
                type="date"
                value={filtros.dataLigacaoFim}
                onChange={(e) => setFiltros({ ...filtros, dataLigacaoFim: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                  style: { fontFamily: 'Poppins' }
                }}
                sx={{ fontFamily: 'Poppins' }}
              />
            </Grid>

            {/* Mês */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Mês</InputLabel>
                <Select
                  value={filtros.mes}
                  onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                  label="Mês"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                  {MESES.map((mes) => (
                    <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                      {mes}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ano */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Ano</InputLabel>
                <Select
                  value={filtros.ano}
                  onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
                  label="Ano"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                  {ANOS.map((ano) => (
                    <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Status</InputLabel>
                <Select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  label="Status"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  <MenuItem value="" sx={{ fontFamily: 'Poppins' }}>Todos</MenuItem>
                  <MenuItem value="excelente" sx={{ fontFamily: 'Poppins' }}>Excelente</MenuItem>
                  <MenuItem value="bom" sx={{ fontFamily: 'Poppins' }}>Bom</MenuItem>
                  <MenuItem value="regular" sx={{ fontFamily: 'Poppins' }}>Regular</MenuItem>
                  <MenuItem value="ruim" sx={{ fontFamily: 'Poppins' }}>Ruim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={limparFiltros}
            sx={{ fontFamily: 'Poppins' }}
          >
            Limpar
          </Button>
          <Button 
            onClick={aplicarFiltros}
            variant="contained"
            sx={{ 
              fontFamily: 'Poppins',
              backgroundColor: '#1694FF',
              '&:hover': { backgroundColor: '#0F7AD9' }
            }}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QualidadeModulePage;
