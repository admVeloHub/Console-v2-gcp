// VERSION: v1.36.1 | DATE: 2026-04-10 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.36.1 - Release push GitHub 2026-04-10
// CHANGELOG: v1.36.0 - Status IA: somente campo qualidade_avaliacoes.avaliacaoIA (sem GET audio_analise_results na tabela)
// CHANGELOG: v1.35.0 - Status IA na lista: um GET em lote (results-por-avaliacoes) por página; fallback concorrência 2 se o lote falhar
// CHANGELOG: v1.34.10 - Status IA: gptInFlightRef + gptFetchedRef só após resposta (corrige Strict Mode sem perder cache ao paginar)
// CHANGELOG: v1.34.9 - Tabela avaliações: cabeçalhos Status, Áudio, Status IA centralizados; células e ícone de áudio centralizados
// CHANGELOG: v1.34.8 - Badges Status / Status IA: pontuação no manual (pts · faixa); largura fixa compartilhada + ellipsis + Tooltip
// CHANGELOG: v1.34.7 - Status IA: chip para _iaParcial (critérios/transcrição etc.); fallback quando áudio processado sem GET resultado; ícone Avaliação alinhado
// CHANGELOG: v1.34.6 - Filtro Status: registros somenteAnaliseAudioIA não entram em Ruim/Bom/etc.; opção "Pendente supervisor" (alinha ao chip da coluna)
// CHANGELOG: v1.34.5 - Status IA: chave String(_id) no mapa GPT; chip com análise só em texto; API agora usa qualityAnalysis/pontuacaoConsensual
// CHANGELOG: v1.34.4 - Mitigação 429: GPT por página com concorrência 2 + pausa entre lotes; carregarDados com token de sequência; debounce no refetch ao focar janela
// CHANGELOG: v1.34.3 - Lote de Áudio: fluxo Anexar + Enviar (sem abrir upload por linha); props onUploadItem + onLoteEnvioConcluido
// CHANGELOG: v1.34.2 - Aba IA: botão Lote de Áudio no canto superior direito (linha do título)
// CHANGELOG: v1.34.1 - Coluna da tabela: rótulo "Atendimento" (antes "Atendimento em")
// CHANGELOG: v1.34.0 - Aba Avaliações: paginação na tabela; IA (Status IA) só para linhas da página atual — abertura muito mais rápida
// CHANGELOG: v1.33.0 - Lote de Áudio (só IA); tabela Avaliação/Status IA; filtro colaboradores Atendimento; somenteAnaliseAudioIA; média relatório
// CHANGELOG: v1.32.0 - Pipeline áudio pending|done|failed; mic vermelho em falha; otimista pending no envio; merge preserva até done
// CHANGELOG: v1.31.3 - Nova Avaliação: avaliador preenchido da sessão (nome/_userId/id); Select inclui nome logado se fora da lista
// CHANGELOG: v1.31.2 - Filtros/tabela resilientes (colaboradorNome/avaliador opcionais); merge refetch com arrays seguros (evita quebra da página)
// CHANGELOG: v1.31.1 - Revalidar lista de avaliações ao voltar à aba Avaliações e ao focar a janela (status de áudio não ficar preso em amarelo sem F5)
// CHANGELOG: v1.31.0 - Atualização de métricas: Escuta 15→10pts, Clareza 15→10pts, Empatia 15→10pts, Procedimento -60→-100pts, substituído dominioAssunto por registroAtendimento, adicionado conformidadeTicket -15pts
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Divider,
  TablePagination,
  Tooltip
} from '@mui/material';
import { 
  Add, 
  EditNote,
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
  deleteAvaliacao,
  getFuncionarios,
  getFuncoes,
  gerarRelatorioAgente,
  gerarRelatorioGestao
} from '../services/qualidadeAPI';
import { exportAvaliacoesToExcel, exportAvaliacoesToPDF, exportAnaliseIAToXLSX } from '../services/qualidadeExport';
import { analyzeCallWithGPT } from '../services/gptService';
import { getAvaliadoresValidos } from '../services/userService';
import { 
  MESES, 
  ANOS, 
  getStatusPontuacao, 
  generateId,
  formatDate,
  isSomenteAnaliseAudioIA,
  hasAvaliacaoManualSupervisor
} from '../types/qualidade';
import {
  normalizeFuncoesLista,
  findRegistroFuncaoAtendimento,
  filtrarFuncionariosComFuncaoAtendimento
} from '../utils/qualidadeFuncionariosAtendimento';
import UploadAudioModal from '../components/qualidade/UploadAudioModal';
import LoteAudioModal from '../components/qualidade/LoteAudioModal';
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
  const [modalLoteAudioAberto, setModalLoteAudioAberto] = useState(false);
  
  // Estados dos formulários
  const [formData, setFormData] = useState({
    colaboradorNome: '',
    avaliador: '',
    mes: '',
    ano: new Date().getFullYear(),
    saudacaoAdequada: false,
    escutaAtiva: false,
    clarezaObjetividade: false,
    resolucaoQuestao: false,
    registroAtendimento: false,        // Substitui dominioAssunto
    empatiaCordialidade: false,
    direcionouPesquisa: false,
    naoConsultouBot: false,            // Critério detrator
    conformidadeTicket: false,         // NOVO critério detrator
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

  const [avaliacoesPage, setAvaliacoesPage] = useState(0);
  const [avaliacoesRowsPerPage, setAvaliacoesRowsPerPage] = useState(25);
  const carregarDadosSeqRef = useRef(0);
  const visibilityRecarregarTimerRef = useRef(null);

  /** Nome do avaliador na sessão (login grava em `nome`/`id`; cadastro Mongo usa `_userId`) */
  const nomeAvaliadorLogado = (user?.nome || user?._userId || user?.id || '').trim();

  const opcoesAvaliadorModal = useMemo(() => {
    if (!nomeAvaliadorLogado) return avaliadores;
    if (avaliadores.includes(nomeAvaliadorLogado)) return avaliadores;
    return [nomeAvaliadorLogado, ...avaliadores];
  }, [avaliadores, nomeAvaliadorLogado]);

  const avaliacoesFiltradas = useMemo(() => {
    const avaliacoesArray = Array.isArray(avaliacoes) ? avaliacoes : [];
    let filtrados = [...avaliacoesArray];

    if (filtros.colaborador) {
      const q = filtros.colaborador.toLowerCase();
      filtrados = filtrados.filter((a) =>
        String(a.colaboradorNome ?? '').toLowerCase().includes(q)
      );
    }

    if (filtros.avaliador) {
      const q = filtros.avaliador.toLowerCase();
      filtrados = filtrados.filter((a) =>
        String(a.avaliador ?? '').toLowerCase().includes(q)
      );
    }

    if (filtros.dataAvaliacaoInicio) {
      filtrados = filtrados.filter(
        (a) => new Date(a.createdAt) >= new Date(filtros.dataAvaliacaoInicio)
      );
    }
    if (filtros.dataAvaliacaoFim) {
      filtrados = filtrados.filter(
        (a) => new Date(a.createdAt) <= new Date(filtros.dataAvaliacaoFim)
      );
    }

    if (filtros.dataLigacaoInicio) {
      filtrados = filtrados.filter(
        (a) =>
          a.dataLigacao && new Date(a.dataLigacao) >= new Date(filtros.dataLigacaoInicio)
      );
    }
    if (filtros.dataLigacaoFim) {
      filtrados = filtrados.filter(
        (a) =>
          a.dataLigacao && new Date(a.dataLigacao) <= new Date(filtros.dataLigacaoFim)
      );
    }

    if (filtros.mes) {
      filtrados = filtrados.filter((a) => a.mes === filtros.mes);
    }
    if (filtros.ano) {
      filtrados = filtrados.filter((a) => a.ano === parseInt(filtros.ano, 10));
    }

    if (filtros.status) {
      filtrados = filtrados.filter((a) => {
        if (isSomenteAnaliseAudioIA(a)) {
          return filtros.status === 'pendente_supervisor';
        }
        if (filtros.status === 'pendente_supervisor') {
          return false;
        }
        const status = getStatusPontuacao(a.pontuacaoTotal);
        return status.status === filtros.status;
      });
    }

    return filtrados;
  }, [avaliacoes, filtros]);

  const avaliacoesPagina = useMemo(() => {
    const start = avaliacoesPage * avaliacoesRowsPerPage;
    return avaliacoesFiltradas.slice(start, start + avaliacoesRowsPerPage);
  }, [avaliacoesFiltradas, avaliacoesPage, avaliacoesRowsPerPage]);

  useEffect(() => {
    setAvaliacoesPage(0);
  }, [
    filtros.colaborador,
    filtros.avaliador,
    filtros.dataAvaliacaoInicio,
    filtros.dataAvaliacaoFim,
    filtros.dataLigacaoInicio,
    filtros.dataLigacaoFim,
    filtros.mes,
    filtros.ano,
    filtros.status
  ]);

  useEffect(() => {
    const total = avaliacoesFiltradas.length;
    const maxPage = Math.max(0, Math.ceil(total / avaliacoesRowsPerPage) - 1);
    if (avaliacoesPage > maxPage) {
      setAvaliacoesPage(maxPage);
    }
  }, [avaliacoesFiltradas.length, avaliacoesRowsPerPage, avaliacoesPage]);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const audioPipelineDone = useCallback((t) => t === true || t === 'done', []);

  /** Preserva uploadingAudio local só enquanto o backend ainda não marcou conclusão do pipeline. */
  const mergeAvaliacoesComEstadoLocal = useCallback((fresh, prev) => {
    const safeFresh = Array.isArray(fresh) ? fresh : [];
    const safePrev = Array.isArray(prev) ? prev : [];
    const map = new Map(safePrev.map((a) => [a._id, a]));
    return safeFresh.map((a) => {
      const old = map.get(a._id);
      if (old?.uploadingAudio && !audioPipelineDone(a.audioTreated)) {
        return { ...a, uploadingAudio: true };
      }
      return a;
    });
  }, [audioPipelineDone]);

  /** Atualiza só avaliações da API (status de áudio / PubSub) sem recarregar funcionários. */
  const recarregarAvaliacoesDaApi = useCallback(async () => {
    try {
      const data = await getAvaliacoes();
      setAvaliacoes((prev) => mergeAvaliacoesComEstadoLocal(data, prev));
    } catch (error) {
      console.error('Erro ao atualizar lista de avaliações:', error);
    }
  }, [mergeAvaliacoesComEstadoLocal]);

  // Evita refetch duplicado no primeiro mount (já coberto por carregarDados)
  const pularPrimeiroRefetchAvaliacoes = useRef(true);

  // Ao voltar para a aba Avaliações, buscar dados atuais (indicador de áudio / processamento)
  useEffect(() => {
    if (currentView !== 'avaliacoes') return;
    if (pularPrimeiroRefetchAvaliacoes.current) {
      pularPrimeiroRefetchAvaliacoes.current = false;
      return;
    }
    recarregarAvaliacoesDaApi();
  }, [currentView, recarregarAvaliacoesDaApi]);

  // Ao voltar à janela/aba do navegador com Avaliações visível, revalidar lista (debounce para não disparar 429)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible' || currentView !== 'avaliacoes') return;
      if (visibilityRecarregarTimerRef.current) {
        clearTimeout(visibilityRecarregarTimerRef.current);
      }
      visibilityRecarregarTimerRef.current = setTimeout(() => {
        visibilityRecarregarTimerRef.current = null;
        recarregarAvaliacoesDaApi();
      }, 900);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (visibilityRecarregarTimerRef.current) {
        clearTimeout(visibilityRecarregarTimerRef.current);
        visibilityRecarregarTimerRef.current = null;
      }
    };
  }, [currentView, recarregarAvaliacoesDaApi]);

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
    const seq = ++carregarDadosSeqRef.current;
    const stillCurrent = () => seq === carregarDadosSeqRef.current;
    try {
      setLoading(true);

      const avaliacoesData = await getAvaliacoes();
      if (!stillCurrent()) return;
      const todosFuncionarios = await getFuncionarios();
      if (!stillCurrent()) return;
      const avaliadoresValidos = await getAvaliadoresValidos();
      if (!stillCurrent()) return;

      let funcionariosComId = [];
      try {
        const funcoesRes = await getFuncoes();
        if (!stillCurrent()) return;
        const funcoesLista = normalizeFuncoesLista(funcoesRes);
        const registroAtend = findRegistroFuncaoAtendimento(funcoesLista);
        if (!registroAtend) {
          setSnackbar({
            open: true,
            message: 'Função "Atendimento" não encontrada no cadastro. Lista de colaboradores vazia.',
            severity: 'warning'
          });
        }
        const funcionariosAtivos = todosFuncionarios.filter((f) => !f.desligado && !f.afastado);
        const base = funcionariosAtivos.length > 0 ? funcionariosAtivos : todosFuncionarios;
        const filtrados = registroAtend
          ? filtrarFuncionariosComFuncaoAtendimento(base, registroAtend)
          : [];
        funcionariosComId = filtrados.map((f) => ({
          ...f,
          id: f._id || f.id,
          _id: f._id || f.id
        }));
      } catch (fe) {
        console.error('Erro ao carregar funções para filtro Atendimento:', fe);
        if (stillCurrent()) {
          setSnackbar({
            open: true,
            message: 'Não foi possível carregar funções. Colaboradores para avaliação indisponíveis.',
            severity: 'error'
          });
        }
        funcionariosComId = [];
      }

      if (!stillCurrent()) return;
      setAvaliacoes(Array.isArray(avaliacoesData) ? avaliacoesData : []);
      setFuncionarios(funcionariosComId);
      setAvaliadores(avaliadoresValidos);
    } catch (error) {
      if (stillCurrent()) {
        console.error('Erro ao carregar dados:', error);
      }
    } finally {
      if (stillCurrent()) {
        setLoading(false);
      }
    }
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
    setAvaliacoesPage(0);
    setModalFiltrosAberto(false);
  };

  const abrirModalAvaliacao = (avaliacao = null) => {
    if (avaliacao) {
      setAvaliacaoEditando(avaliacao);
      
      // Debug: Log dos dados da avaliação sendo editada
      console.log('🔍 DEBUG - Editando avaliação:', avaliacao._id);
      
      const isAvaliador = user?._funcoesAdministrativas?.avaliador === true;

      setFormData({
        colaboradorNome: avaliacao.colaboradorNome || avaliacao.colaboradorNome,
        avaliador: isAvaliador ? nomeAvaliadorLogado : (avaliacao.avaliador || ''),
        mes: avaliacao.mes,
        ano: avaliacao.ano,
        saudacaoAdequada: avaliacao.saudacaoAdequada,
        escutaAtiva: avaliacao.escutaAtiva,
        clarezaObjetividade: Boolean(avaliacao.clarezaObjetividade),
        resolucaoQuestao: avaliacao.resolucaoQuestao,
        registroAtendimento: Boolean(avaliacao.registroAtendimento),
        empatiaCordialidade: avaliacao.empatiaCordialidade,
        direcionouPesquisa: avaliacao.direcionouPesquisa,
        naoConsultouBot: Boolean(avaliacao.naoConsultouBot),
        conformidadeTicket: Boolean(avaliacao.conformidadeTicket),
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

      setFormData({
        colaboradorNome: '',
        avaliador: nomeAvaliadorLogado,
        mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
        ano: new Date().getFullYear(),
        saudacaoAdequada: false,
        escutaAtiva: false,
        clarezaObjetividade: false,
        resolucaoQuestao: false,
        registroAtendimento: false,
        empatiaCordialidade: false,
        direcionouPesquisa: false,
        naoConsultouBot: false,
        conformidadeTicket: false,
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
      clarezaObjetividade: false,
      resolucaoQuestao: false,
      registroAtendimento: false,
      naoConsultouBot: false,
      conformidadeTicket: false,
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
      
      const avaliadorEfetivo =
        user?._funcoesAdministrativas?.avaliador === true && nomeAvaliadorLogado
          ? nomeAvaliadorLogado
          : formData.avaliador;

      if (!avaliadorEfetivo) {
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
        avaliador: avaliadorEfetivo,
        colaboradorNome: formData.colaboradorNome, // colaboradorNome já é o nome agora
        dataLigacao: dataLigacaoCombinada,
        somenteAnaliseAudioIA: false
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

  const handleUploadAudio = async (result) => {
    try {
      if (result && result.avaliacaoId) {
        const nowIso = new Date().toISOString();
        setAvaliacoes(prev => prev.map(avaliacao =>
          avaliacao._id === result.avaliacaoId
            ? {
                ...avaliacao,
                uploadingAudio: false,
                audioSent: true,
                audioTreated: result.audioTreated || 'pending',
                nomeArquivoAudio: result.fileName || avaliacao.nomeArquivoAudio,
                audioCreatedAt: result.audioCreatedAt || nowIso,
                audioUpdatedAt: result.audioUpdatedAt || nowIso
              }
            : avaliacao
        ));
      }

      return result;
    } catch (error) {
      console.error('Erro ao processar resultado do upload:', error);
      throw error;
    }
  };

  const getAudioStatus = (avaliacao) => {
    const t = avaliacao.audioTreated;
    if (audioPipelineDone(t)) {
      return 'completo';
    }
    if (avaliacao.audioSent === true && t === 'failed') {
      return 'falha';
    }
    if (avaliacao.audioSent === true) {
      const pendente = t === 'pending' || t === false || t == null || t === '';
      if (pendente) return 'enviando';
    }
    if (avaliacao.audioStatus?.treated === true || audioPipelineDone(avaliacao.audioStatus?.treated)) {
      return 'completo';
    }
    if (avaliacao.audioGptId) return 'completo';
    if (avaliacao.uploadingAudio && !audioPipelineDone(t)) return 'enviando';

    return 'sem_audio';
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
        return (
          <Mic 
            {...iconProps}
            sx={{ 
              ...iconProps.sx,
              color: '#15A237',
              '& svg': {
                color: '#15A237'
              }
            }} 
          />
        );
      case 'enviando':
        return (
          <Mic 
            {...iconProps}
            sx={{ 
              ...iconProps.sx,
              color: '#FCC200',
              '& svg': {
                color: '#FCC200'
              }
            }} 
          />
        );
      case 'falha':
        return (
          <Mic
            {...iconProps}
            sx={{
              ...iconProps.sx,
              color: '#f44336',
              '& svg': {
                color: '#f44336'
              }
            }}
          />
        );
      default:
        return (
          <MicOff 
            {...iconProps}
            sx={{ 
              ...iconProps.sx,
              color: '#B0BEC5',
              '& svg': {
                color: '#B0BEC5'
              }
            }} 
          />
        );
    }
  };

  /** Largura fixa comum aos chips Status (supervisor) e Status IA na tabela de avaliações. */
  const larguraChipStatusTabela = 176;

  const pontuacaoManualNum = (avaliacao) => {
    const v = avaliacao?.pontuacaoTotal;
    if (v == null || v === '') return 0;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : 0;
  };

  const chipStatusManual = (avaliacao) => {
    const pts = pontuacaoManualNum(avaliacao);
    if (isSomenteAnaliseAudioIA(avaliacao)) {
      return { texto: `${pts} pts · Pendente supervisor`, cor: '#E0E0E0' };
    }
    const s = getStatusPontuacao(pts);
    return { texto: `${pts} pts · ${s.texto}`, cor: s.cor };
  };

  const corIconeColunaAvaliacao = (avaliacao) => {
    const ia = avaliacao?.avaliacaoIA;
    const temIa = ia != null && ia !== '' && !Number.isNaN(Number(ia));
    if (isSomenteAnaliseAudioIA(avaliacao) && temIa) return '#f44336';
    if (hasAvaliacaoManualSupervisor(avaliacao)) return 'var(--blue-medium)';
    return '#9E9E9E';
  };

  /** Status IA: apenas nota denormalizada em qualidade_avaliacoes.avaliacaoIA (sem outra collection). */
  const chipStatusIA = (avaliacao) => {
    const pRaw = avaliacao?.avaliacaoIA;
    if (pRaw == null || pRaw === '') return null;
    const p = Number(pRaw);
    if (Number.isNaN(p)) return null;
    const cor = p >= 80 ? '#15A237' : p >= 60 ? '#FCC200' : '#f44336';
    const faixa = p >= 80 ? 'Excelente' : p >= 60 ? 'Bom' : 'Precisa Melhorar';
    return { cor, label: `${p} pts · ${faixa}` };
  };

  const chipStatusIALinha = (avaliacao) => {
    const direct = chipStatusIA(avaliacao);
    if (direct) return direct;
    if (
      avaliacao.audioSent === true &&
      audioPipelineDone(avaliacao.audioTreated) &&
      (avaliacao.avaliacaoIA == null || avaliacao.avaliacaoIA === '' || Number.isNaN(Number(avaliacao.avaliacaoIA)))
    ) {
      return { cor: '#90A4AE', label: 'IA · sem nota' };
    }
    return null;
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
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
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
                  color: 'rgba(0, 0, 0, 0.35)',
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
          <Card sx={{ mb: 1.6, mt: 0.8, borderRadius: '12.8px', boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--cor-card)' }}>
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
            mt: 2,
            backgroundColor: 'var(--cor-card)'
          }}>
            <TableContainer className="qualidade-table" sx={{ maxHeight: '800px', overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Colaborador</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Avaliador</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Atendimento</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }} align="center">Avaliação</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }} align="center">Status</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }} align="center">Áudio</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }} align="center">Status IA</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avaliacoesPagina.length > 0 ? (
                    avaliacoesPagina.map((avaliacao) => {
                      const stMan = chipStatusManual(avaliacao);
                      const stIa = chipStatusIALinha(avaliacao);
                      const nomeColaboradorLista = String(avaliacao.colaboradorNome ?? '').trim() || '—';
                      const inicialColaborador = nomeColaboradorLista.charAt(0);
                      
                      return (
                        <TableRow key={avaliacao._id}>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Avatar sx={{ width: 25.6, height: 25.6, backgroundColor: '#1694FF', fontSize: '0.8rem' }}>
                                {inicialColaborador}
                              </Avatar>
                              {nomeColaboradorLista}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8, color: 'inherit' }}>{avaliacao.avaliador ?? '—'}</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8, color: 'inherit' }}>
                            {avaliacao.dataLigacao ? formatDate(avaliacao.dataLigacao) : '-'}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 0.8 }}>
                            <IconButton
                              size="medium"
                              onClick={() => abrirModalAvaliacao(avaliacao)}
                              sx={{ color: corIconeColunaAvaliacao(avaliacao), padding: '0.6rem' }}
                              aria-label="Abrir avaliação"
                            >
                              <EditNote sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                              <Tooltip title={stMan.texto} arrow placement="top">
                                <Chip
                                  label={stMan.texto}
                                  size="small"
                                  sx={{
                                    width: larguraChipStatusTabela,
                                    minWidth: larguraChipStatusTabela,
                                    maxWidth: larguraChipStatusTabela,
                                    height: 22,
                                    backgroundColor: stMan.cor,
                                    color: '#000000',
                                    fontFamily: 'Poppins',
                                    fontWeight: 500,
                                    fontSize: '0.64rem',
                                    '& .MuiChip-label': {
                                      px: 0.75,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      textAlign: 'center',
                                      width: '100%',
                                      boxSizing: 'border-box'
                                    }
                                  }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                              {renderAudioIcon(avaliacao)}
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                              {stIa ? (
                                <Tooltip title={stIa.label} arrow placement="top">
                                  <Chip
                                    label={stIa.label}
                                    size="small"
                                    sx={{
                                      width: larguraChipStatusTabela,
                                      minWidth: larguraChipStatusTabela,
                                      maxWidth: larguraChipStatusTabela,
                                      height: 22,
                                      backgroundColor: stIa.cor,
                                      color: '#ffffff',
                                      fontFamily: 'Poppins',
                                      fontWeight: 500,
                                      fontSize: '0.64rem',
                                      '& .MuiChip-label': {
                                        px: 0.75,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                        textAlign: 'center',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              ) : (
                                <Box
                                  sx={{
                                    width: larguraChipStatusTabela,
                                    minWidth: larguraChipStatusTabela,
                                    height: 22,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#999' }}>
                                    —
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 0.8 }}>
                            <IconButton
                              size="medium"
                              onClick={() => excluirAvaliacao(avaliacao._id)}
                              sx={{ color: '#EF4444', padding: '0.6rem' }}
                              aria-label="Excluir avaliação"
                            >
                              <Delete sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3.2 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.8rem' }}>
                          Nenhuma avaliação encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={avaliacoesFiltradas.length}
              page={avaliacoesPage}
              onPageChange={(_e, p) => setAvaliacoesPage(p)}
              rowsPerPage={avaliacoesRowsPerPage}
              onRowsPerPageChange={(e) => {
                setAvaliacoesRowsPerPage(parseInt(e.target.value, 10));
                setAvaliacoesPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Linhas por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
              sx={{
                borderTop: '1px solid rgba(0,0,0,0.08)',
                fontFamily: 'Poppins',
                '& .MuiTablePagination-toolbar': { fontFamily: 'Poppins', fontSize: '0.8rem' },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontFamily: 'Poppins',
                  fontSize: '0.8rem'
                }
              }}
            />
          </Card>
        </Box>
      )}

      {currentView === 'relatorio-agente' && (
        <Box>
          <Card sx={{ 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'var(--cor-card)',
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
                        backgroundColor: 'var(--cor-card)',
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
                        background: relatorioAgente.mediaAvaliador == null
                          ? 'var(--cor-card)'
                          : relatorioAgente.mediaAvaliador > 60 
                          ? 'linear-gradient(135deg, rgba(22, 180, 255, 0.15) 0%, rgba(22, 180, 255, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="h4" sx={{ fontSize: '1.28rem', 
                          fontFamily: 'Poppins', 
                          color: relatorioAgente.mediaAvaliador == null
                            ? '#666666'
                            : relatorioAgente.mediaAvaliador > 60 ? '#1694FF' : '#dc3545', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.mediaAvaliador == null ? '—' : relatorioAgente.mediaAvaliador}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: relatorioAgente.mediaAvaliador == null
                            ? '#666666'
                            : relatorioAgente.mediaAvaliador > 60 ? '#1694FF' : '#dc3545'
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
                        backgroundColor: relatorioAgente.tendencia === 'melhorando' 
                          ? 'rgba(22, 180, 255, 0.15)'
                          : relatorioAgente.tendencia === 'piorando'
                          ? 'rgba(220, 53, 69, 0.15)'
                          : 'var(--cor-card)',
                        backgroundImage: relatorioAgente.tendencia === 'melhorando' 
                          ? 'linear-gradient(135deg, rgba(22, 180, 255, 0.15) 0%, rgba(22, 180, 255, 0.05) 100%)'
                          : relatorioAgente.tendencia === 'piorando'
                          ? 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)'
                          : 'none',
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
                          {relatorioAgente.melhorNota == null ? '—' : relatorioAgente.melhorNota}
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
                          {relatorioAgente.piorNota == null ? '—' : relatorioAgente.piorNota}
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 3,
                  flexWrap: 'wrap'
                }}
              >
                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, flex: '1 1 auto', minWidth: 0 }}>
                  Avaliações de Performance por IA
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload />}
                  onClick={() => setModalLoteAudioAberto(true)}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    alignSelf: { xs: 'flex-end', sm: 'center' },
                    borderColor: 'var(--blue-medium)',
                    color: 'var(--blue-medium)',
                    '&:hover': {
                      borderColor: 'var(--blue-dark)',
                      backgroundColor: 'rgba(0, 106, 185, 0.06)'
                    }
                  }}
                >
                  Lote de Áudio
                </Button>
              </Box>

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
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Assessment />}
                  onClick={() => exportAnaliseIAToXLSX(analisesGPT, filtrosGPT.colaborador, filtrosGPT.mes, filtrosGPT.ano)}
                  disabled={!analisesGPT || analisesGPT.length === 0}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    py: 0.4,
                    px: 1.2,
                    backgroundColor: '#15A237',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#128A2F'
                    },
                    '&:disabled': {
                      backgroundColor: '#B0BEC5',
                      color: '#ffffff'
                    }
                  }}
                >
                  Exportar XLSX
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
                  value={nomeAvaliadorLogado}
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
                    {opcoesAvaliadorModal.map((avaliador) => (
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
              { key: 'saudacaoAdequada', label: 'Saudação Adequada', pontos: 5, isPositive: true },
              { key: 'escutaAtiva', label: 'Escuta Ativa / Sondagem', pontos: 10, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box className="avaliacao-criterio-card" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: 'var(--cor-card)'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                      {criterio.label}
                    </Typography>
                        <Typography variant="body2" className={criterio.pontos > 0 ? 'pontuacao-positiva' : 'pontuacao-negativa'} sx={{ fontFamily: 'Poppins', color: criterio.pontos > 0 ? '#006AB9' : '#D32F2F', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    className={`${criterio.isPositive ? 'checkbox-positivo' : 'checkbox-negativo'} ${formData[criterio.key] ? 'checkbox-selecionado' : ''}`}
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
              { key: 'resolucaoQuestao', label: 'Boa Resolução / Procedimento', pontos: 40, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box className="avaliacao-criterio-card" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: 'var(--cor-card)'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                      {criterio.label}
                    </Typography>
                        <Typography variant="body2" className={criterio.pontos > 0 ? 'pontuacao-positiva' : 'pontuacao-negativa'} sx={{ fontFamily: 'Poppins', color: criterio.pontos > 0 ? '#006AB9' : '#D32F2F', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    className={`${criterio.isPositive ? 'checkbox-positivo' : 'checkbox-negativo'} ${formData[criterio.key] ? 'checkbox-selecionado' : ''}`}
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
            
            {/* Linha 3: Registro do Atendimento e Empatia */}
            {[
              { key: 'registroAtendimento', label: 'Registro do Atendimento (anotação interna)', pontos: 15, isPositive: true },
              { key: 'empatiaCordialidade', label: 'Empatia / Cordialidade', pontos: 10, isPositive: true }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box className="avaliacao-criterio-card" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: 'var(--cor-card)'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                      {criterio.label}
                    </Typography>
                        <Typography variant="body2" className={criterio.pontos > 0 ? 'pontuacao-positiva' : 'pontuacao-negativa'} sx={{ fontFamily: 'Poppins', color: criterio.pontos > 0 ? '#006AB9' : '#D32F2F', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    className={`${criterio.isPositive ? 'checkbox-positivo' : 'checkbox-negativo'} ${formData[criterio.key] ? 'checkbox-selecionado' : ''}`}
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
              <Box className="avaliacao-criterio-card" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 1.6, 
                border: formData.direcionouPesquisa 
                  ? '1px solid rgba(22, 148, 255, 0.75)' 
                  : '1px solid rgba(22, 148, 255, 0.5)',
                borderRadius: '6.4px',
                backgroundColor: 'var(--cor-card)'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                    Direcionou para pesquisa de satisfação
                  </Typography>
                        <Typography variant="body2" className="pontuacao-positiva" sx={{ fontFamily: 'Poppins', color: '#006AB9', fontSize: '0.8rem' }}>
                    +10 pontos
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  className={`checkbox-positivo ${formData.direcionouPesquisa ? 'checkbox-selecionado' : ''}`}
                  onClick={() => setFormData({ ...formData, direcionouPesquisa: !formData.direcionouPesquisa })}
                  sx={{
                    minWidth: '22.4px',
                    width: '22.4px',
                    height: '22.4px',
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
                      fontSize: '11.2px' 
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
            
            {/* Linha 5: Não Consultou Bot e Inconformidade no Ticket */}
            {[
              { key: 'naoConsultouBot', label: 'Não consultou o bot', pontos: -10, isPositive: false },
              { key: 'conformidadeTicket', label: 'Inconformidade no Ticket', pontos: -15, isPositive: false }
            ].map((criterio) => (
              <Grid item xs={12} md={6} key={criterio.key}>
                <Box className="avaliacao-criterio-card" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  p: 1.6, 
                  border: criterio.isPositive 
                    ? (formData[criterio.key] ? '1px solid rgba(22, 148, 255, 0.75)' : '1px solid rgba(22, 148, 255, 0.5)')
                    : (formData[criterio.key] ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)'),
                  borderRadius: '6.4px',
                  backgroundColor: 'var(--cor-card)'
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                      {criterio.label}
                    </Typography>
                    <Typography variant="body2" className={criterio.pontos > 0 ? 'pontuacao-positiva' : 'pontuacao-negativa'} sx={{ fontFamily: 'Poppins', color: criterio.pontos > 0 ? '#006AB9' : '#D32F2F', fontSize: '0.8rem' }}>
                      {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    className={`${criterio.isPositive ? 'checkbox-positivo' : 'checkbox-negativo'} ${formData[criterio.key] ? 'checkbox-selecionado' : ''}`}
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
            
            {/* Linha 6: Encerramento Brusco (coluna 1) e Procedimento Incorreto (coluna 2) */}
            <Grid item xs={12} md={6}>
              <Box className="avaliacao-criterio-card" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 1.6, 
                border: formData.encerramentoBrusco 
                  ? '1px solid #EF4444' 
                  : '1px solid rgba(255, 193, 7, 0.6)',
                borderRadius: '6.4px',
                backgroundColor: 'var(--cor-card)'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                    Encerramento Brusco / Ligação Derrubada
                  </Typography>
                        <Typography variant="body2" className="pontuacao-negativa" sx={{ fontFamily: 'Poppins', color: '#D32F2F', fontSize: '0.8rem' }}>
                    -100 pontos
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  className={`checkbox-negativo ${formData.encerramentoBrusco ? 'checkbox-selecionado' : ''}`}
                  onClick={() => setFormData({ ...formData, encerramentoBrusco: !formData.encerramentoBrusco })}
                  sx={{
                    minWidth: '22.4px',
                    width: '22.4px',
                    height: '22.4px',
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
                      fontSize: '11.2px' 
                    }} />
                  )}
                </Button>
              </Box>
            </Grid>
            
            {/* Procedimento Incorreto - Coluna 2, Linha 6 */}
            <Grid item xs={12} md={6}>
              <Box className="avaliacao-criterio-card" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 1.6, 
                border: formData.procedimentoIncorreto ? '1px solid #EF4444' : '1px solid rgba(255, 193, 7, 0.6)',
                borderRadius: '6.4px',
                backgroundColor: 'var(--cor-card)'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}>
                    Colaborador repassou um procedimento incorreto
                  </Typography>
                        <Typography variant="body2" className="pontuacao-negativa" sx={{ fontFamily: 'Poppins', color: '#D32F2F', fontSize: '0.8rem' }}>
                    -100 pontos
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  className={`checkbox-negativo ${formData.procedimentoIncorreto ? 'checkbox-selecionado' : ''}`}
                  onClick={() => setFormData({ ...formData, procedimentoIncorreto: !formData.procedimentoIncorreto })}
                  sx={{
                    minWidth: '22.4px',
                    width: '22.4px',
                    height: '22.4px',
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
                      fontSize: '11.2px' 
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
                  <Box sx={{ p: 2, backgroundColor: 'var(--cor-container)', borderRadius: '8px' }}>
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
                    <Box sx={{ p: 2, backgroundColor: 'var(--cor-container)', borderRadius: '8px' }}>
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

      <LoteAudioModal
        open={modalLoteAudioAberto}
        onClose={() => setModalLoteAudioAberto(false)}
        funcionarios={funcionarios}
        avaliadorNome={nomeAvaliadorLogado}
        onUploadItem={handleUploadAudio}
        onLoteEnvioConcluido={async ({ enviados }) => {
          await recarregarAvaliacoesDaApi();
          mostrarSnackbar(
            enviados === 1 ? '1 áudio enviado para análise.' : `${enviados} áudios enviados para análise.`,
            'success'
          );
        }}
        onError={(msg) => mostrarSnackbar(msg, 'error')}
      />

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
        podeAuditar={
          user?._funcoesAdministrativas?.auditoria === true || 
          user?._funcoesAdministrativas?.auditor === true ||
          (user?.email === 'lucas.gravina@velotax.com.br' || user?._userMail === 'lucas.gravina@velotax.com.br')
        }
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
                  <MenuItem value="pendente_supervisor" sx={{ fontFamily: 'Poppins' }}>Pendente supervisor</MenuItem>
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
            onClick={() => setModalFiltrosAberto(false)}
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
