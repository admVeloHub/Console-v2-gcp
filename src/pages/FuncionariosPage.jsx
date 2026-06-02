// VERSION: v1.22.0 | DATE: 2026-05-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.22.0 - atuacao persistida como [{ funcao }]; select envia nomes por extenso
// CHANGELOG: v1.21.0 - atuacao: array de strings (nome funcao por extenso); select e exibição alinhados ao schema
// CHANGELOG: v1.20.0 - Campo departamento no cadastro/edição e exibição (qualidade_funcionarios / LISTA_SCHEMAS)
// CHANGELOG: v1.19.2 - Voltar: VoltarHeaderRow (mesma faixa/altura que QA e Monitoria)
// CHANGELOG: v1.19.1 - Cabeçalho Voltar: alinhar ao padrão das abas Qualidade (flex + center, sem absolute/top); Container com mt/px como Gerenciar/Hub sem padding-top excessivo
// CHANGELOG: v1.19.0 - Cards da página/lista/modal Estatísticas: neutralizar hover elevado herdado do MuiCard do tema (sem transladar/sombra extra)
// CHANGELOG: v1.17.0 - Botão Novo abre cadastro de funcionário diretamente; gestão de funções movida para aba Gerenciar
// CHANGELOG: v1.16.0 - Credencial Chave Pix (campo ChavePix) no modal de acessos, normalizações e exibição na tabela/chips; payload completo inclui ChavePix
// CHANGELOG: v1.15.0 - Credencial Apoio N1 (campo apoioN1) no modal de acessos, normalizações e exibição na tabela/chips; formulário principal envia objeto acessos completo incl. Sociais e apoioN1
// CHANGELOG: v1.14.0 - Funções (cargas/CRUD) via qualidadeFuncoesAPI + extractQualidadeLista (mesma base URL que axios/rede local); filtros empresa/atuacao resilientes a campos ausentes
// CHANGELOG: v1.13.0 - Correção checkboxes acessos: lista fixa, merge com padrão, TransitionProps timeout 0, acessoData garantido antes de abrir modal.
// CHANGELOG: v1.12.0 - Adicionado campo Sociais ao modal de acessos. Correções de cache: useLayoutEffect para checkboxes, useLocation para recarregar dados ao abrir aba, key no Dialog, normalização no localStorage.
// CHANGELOG: v1.11.0 - Adicionado campo Ouvidoria ao modal de acessos. Acessos agora incluem: Velohub, Console, Academy, Desk e Ouvidoria.
// CHANGELOG: v1.10.0 - Adicionado campo Desk ao modal de acessos. Acessos são completamente opcionais - permitido salvar funcionários mesmo com todos os acessos como false.
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
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
  Snackbar,
  FormControlLabel,
  Checkbox,
  Divider,
  Avatar
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
  Schedule,
  BarChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import {
  getFuncionarios,
  getFuncionariosAtivos,
  addFuncionario,
  updateFuncionario,
  deleteFuncionario,
  migrarDadosParaMongoDB,
  verificarDadosLocais,
  limparDadosLocais,
  extractQualidadeLista,
  getCadastroCamposConfig
} from '../services/qualidadeAPI';
import { qualidadeFuncoesAPI, qualidadeFuncionariosAPI } from '../services/api';
import { ACESSOS_PLATAFORMA_PADRAO } from '../services/qualidadeAPI';
import { exportFuncionariosToExcel, exportFuncionariosToPDF } from '../services/qualidadeExport';
import { generateId } from '../types/qualidade';

// Lista fixa de acessos - garante que todos os checkboxes sejam sempre renderizados (evita bug de exibição parcial)
const LISTA_ACESSOS_MODAL = [
  { key: 'Velohub', label: 'VeloHub' },
  { key: 'Console', label: 'Console' },
  { key: 'Academy', label: 'Academy' },
  { key: 'Desk', label: 'Desk' },
  { key: 'realTime', label: 'Tempo Real' },
];

const normalizarAcessosPlataformaLocal = (acessos) => {
  const padrao = ACESSOS_PLATAFORMA_PADRAO();
  if (!acessos) return padrao;
  if (Array.isArray(acessos)) {
    acessos.forEach((acesso) => {
      if (!acesso?.sistema) return;
      const sistema = String(acesso.sistema).toLowerCase();
      if (sistema === 'velohub') padrao.Velohub = true;
      else if (sistema === 'console') padrao.Console = true;
      else if (sistema === 'academy') padrao.Academy = true;
      else if (sistema === 'desk') padrao.Desk = true;
      else if (sistema === 'realtime' || sistema === 'tempo real') padrao.realTime = true;
    });
    return padrao;
  }
  if (typeof acessos === 'object') {
    return {
      Velohub: acessos.Velohub === true,
      Console: acessos.Console === true,
      Academy: acessos.Academy === true,
      Desk: acessos.Desk === true,
      realTime: acessos.realTime === true,
    };
  }
  return ACESSOS_PLATAFORMA_PADRAO();
};

/** Sobra fixa igual ao uso nos cards lista/toolbar — hover não altera shadow (neutraliza tema MuiCard). */
const FUNCIONARIOS_SOMBRA_CARD = '0 3.2px 16px rgba(0, 0, 0, 0.1)';

const FUNCIONARIOS_CARD_SEM_HOVER_TOOLBAR_LISTA = {
  transition: 'none',
  '&:hover': {
    transform: 'none',
    boxShadow: FUNCIONARIOS_SOMBRA_CARD
  }
};

/** container-secondary modal estatísticas: sem elevação no hover */
const FUNCIONARIOS_CARD_SECUNDARIO_SEM_HOVER = {
  boxShadow: 'none',
  transition: 'none',
  '&:hover': {
    transform: 'none',
    boxShadow: 'none'
  }
};

/** Resumo geral modal: mantém uma sombra fixa igual ao repouso (tema aplicava translateY ao hover). */
const FUNCIONARIOS_CARD_RESUMO_SEM_HOVER = {
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'none',
  '&:hover': {
    transform: 'none',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  }
};

/** Nome por extenso — item { funcao }, string ou ObjectId legado. */
const rotuloAtuacao = (item, funcoes) => {
  if (item == null) return '';
  if (typeof item === 'object' && item.funcao != null) {
    return String(item.funcao).trim();
  }
  const str = String(item).trim();
  if (!str) return '';
  const porId = (funcoes || []).find((f) => String(f._id) === str);
  if (porId) return String(porId.funcao || '').trim();
  return str;
};

const atuacaoParaForm = (funcionario, funcoes) => {
  if (!funcionario?.atuacao) return [];
  if (typeof funcionario.atuacao === 'string') {
    const t = funcionario.atuacao.trim();
    return t ? [t] : [];
  }
  if (!Array.isArray(funcionario.atuacao)) return [];
  const seen = new Set();
  const out = [];
  funcionario.atuacao.forEach((item) => {
    const nome = rotuloAtuacao(item, funcoes);
    if (!nome) return;
    const key = nome.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(nome);
  });
  return out;
};

const formatarAtuacaoLista = (atuacao, funcoes) => {
  const nomes = atuacaoParaForm({ atuacao }, funcoes);
  return nomes.length ? nomes.join(', ') : 'Não informado';
};

const FuncionariosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados principais
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para gestão de funções
  const [funcoes, setFuncoes] = useState([]); // Lista de funções disponíveis
  const [opcoesEscalas, setOpcoesEscalas] = useState([]);
  const [opcoesEmpresas, setOpcoesEmpresas] = useState([]);
  
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
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  
  // Estados dos formulários
  const [formData, setFormData] = useState({
    colaboradorNome: '', // Campo padronizado conforme schema MongoDB
    dataAniversario: '',
    CPF: '', // CPF (11 dígitos, sem pontos ou traços)
    profile_pic: '', // Endereço da imagem no GCS
    empresa: '',
    dataContratado: '',
    telefone: '',
    userMail: '', // Email do usuário
    password: '', // Senha (hash) - opcional para reset
    departamento: '',
    atuacao: [], // Nomes por extenso no form; enviados como [{ funcao }]
    escala: '',
    acessos: ACESSOS_PLATAFORMA_PADRAO(),
    desligado: false,
    dataDesligamento: '',
    afastado: false,
    dataAfastamento: ''
  });
  
  const [acessoData, setAcessoData] = useState(ACESSOS_PLATAFORMA_PADRAO());
  
  // Estados de UI
  const [linhasExpandidas, setLinhasExpandidas] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showStats, setShowStats] = useState(false);

  // ✅ CORREÇÃO 2: Função para converter data ISO para formato yyyy-MM-dd
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Se já está no formato yyyy-MM-dd, retorna diretamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Se é uma data ISO, converte para yyyy-MM-dd
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return '';
    }
  };

  // Carregar funcionários e funções ao montar e sempre que a aba funcionários for acessada (dados sempre frescos)
  useEffect(() => {
    if (location.pathname === '/funcionarios') {
      carregarFuncionarios();
      carregarFuncoes();
      carregarCamposCadastro();
    }
  }, [location.pathname]);

  // Ao voltar à aba (ex.: alterou Config em outra aba), recarrega dados para refletir credenciais/funções/cadastro sem hard refresh
  useEffect(() => {
    if (location.pathname !== '/funcionarios') return undefined;
    let timeoutId;
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        carregarFuncionarios();
        carregarFuncoes();
        carregarCamposCadastro();
      }, 450);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  // Aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [funcionarios, filtros]);

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      
      // Verificar se há dados locais para migrar
      if (verificarDadosLocais()) {
        console.log('🔄 Dados locais encontrados, iniciando migração...');
        const resultado = await migrarDadosParaMongoDB();
        
        if (resultado.migrados > 0) {
          mostrarSnackbar(
            `Migração concluída: ${resultado.migrados} funcionários migrados para o banco de dados`, 
            'success'
          );
          
          // Limpar dados locais após migração bem-sucedida
          limparDadosLocais();
        }
      }
      
      const dados = await getFuncionarios();
      setFuncionarios(dados);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      mostrarSnackbar('Erro ao carregar funcionários', 'error');
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    // Garantir que funcionarios seja sempre um array
    const funcionariosArray = Array.isArray(funcionarios) ? funcionarios : [];
    let filtrados = [...funcionariosArray];

    if (filtros.nome) {
      filtrados = filtrados.filter(f => 
        (f.colaboradorNome || '').toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }

    if (filtros.empresa) {
      filtrados = filtrados.filter(f =>
        String(f.empresa || '').toLowerCase().includes(filtros.empresa.toLowerCase())
      );
    }

    if (filtros.atuacao) {
      const termo = filtros.atuacao.toLowerCase();
      filtrados = filtrados.filter((f) => {
        const nomes = atuacaoParaForm(f, funcoes);
        return nomes.some((nome) => nome.toLowerCase().includes(termo));
      });
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

  const carregarFuncoes = async () => {
    try {
      const raw = await qualidadeFuncoesAPI.getAll();
      const list = extractQualidadeLista(raw);
      setFuncoes(list);
      if (raw && typeof raw.success === 'boolean' && raw.success === false) {
        mostrarSnackbar(raw.error || raw.message || 'Erro ao carregar funções', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      mostrarSnackbar('Erro ao carregar funções', 'error');
    }
  };

  const carregarCamposCadastro = async () => {
    try {
      const data = await getCadastroCamposConfig();
      const normalizeUnique = (arr) => {
        const seen = new Set();
        return (Array.isArray(arr) ? arr : [])
          .map((v) => String(v || '').trim())
          .filter(Boolean)
          .filter((value) => {
            const key = value.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
      };
      setOpcoesEscalas(normalizeUnique(data?.escalas));
      setOpcoesEmpresas(normalizeUnique(data?.empresas));
    } catch (error) {
      console.error('Erro ao carregar cadastro de campos:', error);
      setOpcoesEscalas([]);
      setOpcoesEmpresas([]);
    }
  };

  const abrirModal = (funcionario = null) => {
    if (funcionario) {
      setFuncionarioEditando(funcionario);

      const acessosNormalizados = normalizarAcessosPlataformaLocal(funcionario.acessos);
      
      setFormData({
        colaboradorNome: funcionario.colaboradorNome || '',
        dataAniversario: formatDateForInput(funcionario.dataAniversario),
        CPF: funcionario.CPF || '',
        profile_pic: funcionario.profile_pic || '',
        empresa: funcionario.empresa,
        dataContratado: formatDateForInput(funcionario.dataContratado),
        telefone: funcionario.telefone || '',
        userMail: funcionario.userMail || '',
        password: '', // Não carregar senha por segurança
        departamento: funcionario.departamento || '',
        atuacao: atuacaoParaForm(funcionario, funcoes),
        escala: funcionario.escala || '',
        acessos: acessosNormalizados,
        desligado: funcionario.desligado,
        dataDesligamento: formatDateForInput(funcionario.dataDesligamento),
        afastado: funcionario.afastado,
        dataAfastamento: formatDateForInput(funcionario.dataAfastamento)
      });
    } else {
      setFuncionarioEditando(null);
      setFormData({
        colaboradorNome: '',
        dataAniversario: '',
        CPF: '',
        profile_pic: '',
        empresa: '',
        dataContratado: '',
        telefone: '',
        userMail: '',
        password: '',
        departamento: '',
        atuacao: [],
        escala: '',
        acessos: ACESSOS_PLATAFORMA_PADRAO(),
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
      colaboradorNome: '',
      dataAniversario: '',
      CPF: '',
      profile_pic: '',
      empresa: '',
      dataContratado: '',
      telefone: '',
      userMail: '',
      password: '',
      departamento: '',
        atuacao: [],
        escala: '',
        acessos: ACESSOS_PLATAFORMA_PADRAO(),
        desligado: false,
      dataDesligamento: '',
      afastado: false,
      dataAfastamento: ''
    });
  };

  const resetarSenha = () => {
    if (!formData.colaboradorNome || !formData.CPF) {
      mostrarSnackbar('Nome e CPF são necessários para gerar a senha padrão', 'warning');
      return;
    }
    
    // Formato: primeiroNome.ultimoNomeCPF (ex: joao.santos12345678901)
    // Usa o primeiro e último nome da string, mesmo que tenha nomes intermediários
    const nomeParts = formData.colaboradorNome.toLowerCase().trim().split(' ').filter(n => n.length > 0);
    const primeiroNome = nomeParts[0];
    const ultimoNome = nomeParts.length > 1 ? nomeParts[nomeParts.length - 1] : primeiroNome;
    const senhaPadrao = `${primeiroNome}.${ultimoNome}${formData.CPF}`;
    
    setFormData({ ...formData, password: senhaPadrao });
    mostrarSnackbar('Senha resetada para o valor padrão', 'success');
  };

  const salvarFuncionario = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.colaboradorNome?.trim()) {
        mostrarSnackbar('Nome do colaborador é obrigatório', 'error');
        return;
      }
      
      if (!formData.atuacao || formData.atuacao.length === 0) {
        mostrarSnackbar('Selecione ao menos uma função', 'error');
        return;
      }
      
      // Validar CPF se fornecido (11 dígitos)
      if (formData.CPF && !/^\d{11}$/.test(formData.CPF)) {
        mostrarSnackbar('CPF deve conter exatamente 11 dígitos numéricos', 'error');
        return;
      }
      
      // Validar email se fornecido
      if (formData.userMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userMail)) {
        mostrarSnackbar('Email inválido', 'error');
        return;
      }
      
      // Validar datas quando status está marcado
      if (formData.desligado && !formData.dataDesligamento) {
        mostrarSnackbar('Data de desligamento é obrigatória quando funcionário está desligado', 'error');
        return;
      }
      
      if (formData.afastado && !formData.dataAfastamento) {
        mostrarSnackbar('Data de afastamento é obrigatória quando funcionário está afastado', 'error');
        return;
      }
      
      // Preparar dados para envio
      const dadosParaEnvio = { ...formData };

      dadosParaEnvio.atuacao = (formData.atuacao || [])
        .map((nome) => String(nome).trim())
        .filter(Boolean)
        .map((funcao) => ({ funcao }));
      
      dadosParaEnvio.acessos =
        dadosParaEnvio.desligado || dadosParaEnvio.afastado
          ? ACESSOS_PLATAFORMA_PADRAO()
          : normalizarAcessosPlataformaLocal(dadosParaEnvio.acessos);
      
      // Remover campos vazios opcionais antes de enviar
      if (!dadosParaEnvio.CPF || dadosParaEnvio.CPF.trim() === '') {
        delete dadosParaEnvio.CPF;
      }
      if (!dadosParaEnvio.profile_pic || dadosParaEnvio.profile_pic.trim() === '') {
        delete dadosParaEnvio.profile_pic;
      }
      if (!dadosParaEnvio.userMail || dadosParaEnvio.userMail.trim() === '') {
        delete dadosParaEnvio.userMail;
      }
      if (!dadosParaEnvio.password || dadosParaEnvio.password.trim() === '') {
        delete dadosParaEnvio.password;
      }
      
      if (funcionarioEditando) {
        await updateFuncionario(funcionarioEditando._id || funcionarioEditando.id, dadosParaEnvio);
        mostrarSnackbar('Funcionário atualizado com sucesso!', 'success');
      } else {
        await addFuncionario(dadosParaEnvio);
        mostrarSnackbar('Funcionário adicionado com sucesso!', 'success');
      }
      await carregarFuncionarios();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao salvar funcionário';
      mostrarSnackbar(errorMessage, 'error');
    }
  };

  const excluirFuncionario = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await deleteFuncionario(id);
        mostrarSnackbar('Funcionário excluído com sucesso!', 'success');
        await carregarFuncionarios();
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        mostrarSnackbar('Erro ao excluir funcionário', 'error');
      }
    }
  };

  // Normalizar acessos do funcionário para formato objeto booleano (usado em abrirModalAcesso e useLayoutEffect)
  const normalizarAcessosFuncionario = useCallback(
    (acessos) => normalizarAcessosPlataformaLocal(acessos),
    []
  );

  const abrirModalAcesso = async (funcionario) => {
    const id = funcionario?._id || funcionario?.id;
    if (!id) {
      mostrarSnackbar('Colaborador sem identificador.', 'error');
      return;
    }
    let merged = funcionario;
    try {
      const raw = await qualidadeFuncionariosAPI.getById(id);
      const doc = raw?.success === true && raw?.data ? raw.data : raw?.data ?? raw;
      if (doc && typeof doc === 'object' && (doc._id || doc.id)) {
        merged = { ...funcionario, ...doc };
      }
    } catch (e) {
      console.warn('Atualização do colaborador ao abrir Acessos:', e);
      mostrarSnackbar('Não foi possível atualizar do servidor; exibindo dados em tela.', 'warning');
    }
    const acessosNormalizados = normalizarAcessosFuncionario(merged?.acessos);
    setFuncionarioSelecionado(merged);
    setAcessoData(acessosNormalizados);
    setModalAcessoAberto(true);
  };

  // Garantir acessoData completo quando modal abre (corrige checkboxes não exibidos na primeira abertura)
  useLayoutEffect(() => {
    if (modalAcessoAberto && funcionarioSelecionado) {
      const padrao = ACESSOS_PLATAFORMA_PADRAO();
      const normalizado = normalizarAcessosFuncionario(funcionarioSelecionado.acessos);
      setAcessoData((prev) => ({ ...padrao, ...prev, ...normalizado }));
    }
  }, [modalAcessoAberto, funcionarioSelecionado, normalizarAcessosFuncionario]);

  const fecharModalAcesso = () => {
    setModalAcessoAberto(false);
    setFuncionarioSelecionado(null);
    setAcessoData(ACESSOS_PLATAFORMA_PADRAO());
  };

  const salvarAcesso = async () => {
    try {
      if (!funcionarioSelecionado) {
        mostrarSnackbar('Funcionário não selecionado', 'error');
        return;
      }
      
      // Se funcionário está desligado ou afastado, definir acessos como objeto com todos false
      if (funcionarioSelecionado.desligado || funcionarioSelecionado.afastado) {
        const funcionarioAtualizado = {
          ...funcionarioSelecionado,
          acessos: ACESSOS_PLATAFORMA_PADRAO(),
        };
        await updateFuncionario(funcionarioSelecionado._id || funcionarioSelecionado.id, funcionarioAtualizado);
        mostrarSnackbar('Acessos removidos (funcionário desligado/afastado)', 'success');
        await carregarFuncionarios();
        fecharModalAcesso();
        return;
      }
      
      const acessosParaSalvar = normalizarAcessosPlataformaLocal(acessoData);
      
      // Buscar funcionário atualizado para garantir que temos todos os dados
      const funcionarioAtualizado = {
        ...funcionarioSelecionado,
        acessos: acessosParaSalvar
      };
      
      await updateFuncionario(funcionarioSelecionado._id || funcionarioSelecionado.id, funcionarioAtualizado);
      mostrarSnackbar('Acessos salvos com sucesso!', 'success');
      await carregarFuncionarios();
      fecharModalAcesso();
    } catch (error) {
      console.error('Erro ao salvar acessos:', error);
      mostrarSnackbar('Erro ao salvar acessos', 'error');
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

  // Funções para calcular estatísticas
  const calcularEstatisticas = () => {
    const stats = {
      porEmpresa: funcionarios.reduce((acc, func) => {
        const empresa = func.empresa || 'Não informado';
        acc[empresa] = (acc[empresa] || 0) + 1;
        return acc;
      }, {}),
      
      porEscala: funcionarios.reduce((acc, func) => {
        const escala = func.escala || 'Não informado';
        acc[escala] = (acc[escala] || 0) + 1;
        return acc;
      }, {}),
      
      porAtuacao: funcionarios.reduce((acc, func) => {
        atuacaoParaForm(func, funcoes).forEach((nome) => {
          acc[nome] = (acc[nome] || 0) + 1;
        });
        if (!func.atuacao || (Array.isArray(func.atuacao) && func.atuacao.length === 0)) {
          acc['Não informado'] = (acc['Não informado'] || 0) + 1;
        }
        return acc;
      }, {})
    };

    // Calcular estatísticas de atuação por empresa
    const statsAtuacaoPorEmpresa = funcionarios.reduce((acc, func) => {
      const empresa = func.empresa || 'Não informado';
      
      if (func.atuacao && Array.isArray(func.atuacao) && func.atuacao.length > 0) {
        atuacaoParaForm(func, funcoes).forEach((atuacao) => {
            if (!acc[atuacao]) {
              acc[atuacao] = {
                Velotax: 0,
                Job: 0,
                Total: 0
              };
            }
            
            // Contar por empresa
            if (empresa === 'Velotax') {
              acc[atuacao].Velotax++;
            } else if (empresa === 'Job Center' || empresa === 'Job') {
              acc[atuacao].Job++;
            }
            
            // Total geral
            acc[atuacao].Total++;
        });
      } else {
        const atuacao = 'Não informado';
        
        if (!acc[atuacao]) {
          acc[atuacao] = {
            Velotax: 0,
            Job: 0,
            Total: 0
          };
        }
        
        // Contar por empresa
        if (empresa === 'Velotax') {
          acc[atuacao].Velotax++;
        } else if (empresa === 'Job Center' || empresa === 'Job') {
          acc[atuacao].Job++;
        }
        
        // Total geral
        acc[atuacao].Total++;
      }
      
      return acc;
    }, {});

    // Calcular estatísticas específicas por status
    const funcionariosAtivos = funcionarios.filter(f => !f.desligado && !f.afastado);
    const funcionariosDesligados = funcionarios.filter(f => f.desligado);
    const funcionariosAfastados = funcionarios.filter(f => f.afastado);

    // Calcular estatísticas por empresa separadas por status
    const statsPorEmpresaStatus = {
      'JOB': {
        ativos: funcionarios.filter(f => 
          (f.empresa === 'Job Center' || f.empresa === 'Job') && 
          !f.desligado && !f.afastado
        ).length,
        afastados: funcionarios.filter(f => 
          (f.empresa === 'Job Center' || f.empresa === 'Job') && 
          f.afastado
        ).length,
        desligados: funcionarios.filter(f => 
          (f.empresa === 'Job Center' || f.empresa === 'Job') && 
          f.desligado
        ).length
      },
      'Velotax': {
        ativos: funcionarios.filter(f => 
          f.empresa === 'Velotax' && 
          !f.desligado && !f.afastado
        ).length,
        afastados: funcionarios.filter(f => 
          f.empresa === 'Velotax' && 
          f.afastado
        ).length,
        desligados: funcionarios.filter(f => 
          f.empresa === 'Velotax' && 
          f.desligado
        ).length
      }
    };

    // Calcular Job 6x1 apenas com status Ativo
    const job6x1Ativos = funcionarios.filter(f => 
      (f.empresa === 'Job Center' || f.empresa === 'Job') && 
      f.escala === '6x1' && 
      !f.desligado && !f.afastado
    ).length;

    return {
      stats,
      statsAtuacaoPorEmpresa,
      statsPorEmpresaStatus,
      funcionariosAtivos,
      funcionariosDesligados,
      funcionariosAfastados,
      job6x1Ativos
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4.8, mb: 8, pb: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Carregando funcionários...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4.8, mb: 8, pb: 4, position: 'relative', px: 2.5, fontSize: '0.8rem' }}>
      <VoltarHeaderRow left={<BackButton to="/qualidade" />} />

      {/* Toolbar */}
      <Card
        sx={{
          mb: 2.4,
          borderRadius: '6px',
          boxShadow: FUNCIONARIOS_SOMBRA_CARD,
          backgroundColor: 'var(--cor-card)',
          ...FUNCIONARIOS_CARD_SEM_HOVER_TOOLBAR_LISTA
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, fontSize: '0.96rem' }}>
              Funcionários ({funcionariosFiltrados.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                startIcon={<Add />}
                onClick={() => abrirModal()}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#1694FF',
                  fontFamily: 'Poppins',
                  fontSize: '0.8rem',
                  py: 0.4,
                  px: 1.2,
                  '&:hover': { backgroundColor: '#0D7AE5' }
                }}
              >
                Novo
              </Button>
              <Button
                startIcon={<BarChart />}
                onClick={() => setShowStats(true)}
                size="small"
                sx={{
                  backgroundColor: '#1694FF',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  py: 0.4,
                  px: 1.2,
                  '&:hover': {
                    backgroundColor: '#0D7AE5'
                  }
                }}
              >
                Estatísticas
              </Button>
              <Button
                startIcon={<Person />}
                onClick={() => exportFuncionariosToExcel()}
                size="small"
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
                startIcon={<Business />}
                onClick={() => exportFuncionariosToPDF()}
                size="small"
                sx={{
                  backgroundColor: '#EF4444',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  py: 0.4,
                  px: 1.2,
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
          <Grid container spacing={1.6}>
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
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
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
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
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
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Status</InputLabel>
                <Select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  label="Status"
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
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                size="small"
                startIcon={<Clear />}
                onClick={limparFiltros}
                sx={{
                  color: '#666666',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  py: 0.4,
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
      <Card
        sx={{
          borderRadius: '6px',
          boxShadow: FUNCIONARIOS_SOMBRA_CARD,
          backgroundColor: 'var(--cor-card)',
          ...FUNCIONARIOS_CARD_SEM_HOVER_TOOLBAR_LISTA
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Nome</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Empresa</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Status</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Acessos</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Ações</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', fontSize: '0.8rem', py: 0.8 }}>Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {funcionariosFiltrados.map((funcionario) => {
                const status = obterStatusFuncionario(funcionario);
                const isExpanded = linhasExpandidas.has(funcionario._id || funcionario.id);
                
                return (
                  <React.Fragment key={funcionario._id || funcionario.id}>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'var(--cor-container)' } }}>
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Person sx={{ color: '#666666', fontSize: 12.8 }} />
                          {funcionario.colaboradorNome}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Business sx={{ color: '#666666', fontSize: 12.8 }} />
                          {funcionario.empresa}
                        </Box>
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
                      <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', py: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: 'wrap' }}>
                          <Key sx={{ color: '#666666', fontSize: 12.8 }} />
                          {(() => {
                            // Suportar formato antigo (array) e novo (objeto)
                            if (Array.isArray(funcionario.acessos)) {
                              return funcionario.acessos.length > 0 ? funcionario.acessos.length : 'Nenhum';
                            } else if (funcionario.acessos && typeof funcionario.acessos === 'object') {
                              const acessos = LISTA_ACESSOS_MODAL.filter(
                                ({ key }) => funcionario.acessos[key] === true
                              ).map(({ label }) => label);
                              return acessos.length > 0 ? acessos.join(', ') : 'Nenhum';
                            }
                            return 'Nenhum';
                          })()}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.8 }}>
                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                          <IconButton
                            size="small"
                            onClick={() => abrirModal(funcionario)}
                            sx={{ color: '#1694FF', padding: '0.4rem' }}
                          >
                            <Edit sx={{ fontSize: '1rem' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => abrirModalAcesso(funcionario)}
                            sx={{ color: '#15A237', padding: '0.4rem' }}
                          >
                            <Key sx={{ fontSize: '1rem' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => excluirFuncionario(funcionario._id || funcionario.id)}
                            sx={{ color: '#EF4444', padding: '0.4rem' }}
                          >
                            <Delete sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.8 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleLinhaExpandida(funcionario._id || funcionario.id)}
                          sx={{ padding: '0.4rem' }}
                        >
                          {isExpanded ? <ExpandLess sx={{ fontSize: '0.8rem' }} /> : <ExpandMore sx={{ fontSize: '0.8rem' }} />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 1.6, backgroundColor: 'var(--cor-container)' }}>
                            <Grid container spacing={1.6}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 0.8, fontSize: '0.8rem' }}>
                                  Informações Pessoais
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday sx={{ color: '#666666', fontSize: 12.8 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                      <strong>Aniversário:</strong> {formatarData(funcionario.dataAniversario)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday sx={{ color: '#666666', fontSize: 12.8 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                      <strong>Contratado:</strong> {formatarData(funcionario.dataContratado)}
                                    </Typography>
                                  </Box>
                                  {funcionario.dataDesligamento && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CalendarToday sx={{ color: '#EF4444', fontSize: 12.8 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>Desligado em:</strong> {formatarData(funcionario.dataDesligamento)}
                                      </Typography>
                                    </Box>
                                  )}
                                  {funcionario.dataAfastamento && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CalendarToday sx={{ color: '#F59E0B', fontSize: 12.8 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>Afastado em:</strong> {formatarData(funcionario.dataAfastamento)}
                                      </Typography>
                                    </Box>
                                  )}
                                  {funcionario.telefone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Phone sx={{ color: '#666666', fontSize: 12.8 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>Telefone:</strong> {funcionario.telefone}
                                      </Typography>
                                    </Box>
                                  )}
                                  {funcionario.CPF && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Person sx={{ color: '#666666', fontSize: 12.8 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>CPF:</strong> {funcionario.CPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                      </Typography>
                                    </Box>
                                  )}
                                  {funcionario.userMail && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Person sx={{ color: '#666666', fontSize: 12.8 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>Email:</strong> {funcionario.userMail}
                                      </Typography>
                                    </Box>
                                  )}
                                  {funcionario.profile_pic && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Person sx={{ color: '#666666', fontSize: 12.8 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>Foto:</strong> {funcionario.profile_pic}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 0.8, fontSize: '0.8rem' }}>
                                  Informações Profissionais
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Business sx={{ color: '#666666', fontSize: 12.8 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                      <strong>Departamento:</strong> {funcionario.departamento || 'Não informado'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Work sx={{ color: '#666666', fontSize: 12.8 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                      <strong>Atuação:</strong> {formatarAtuacaoLista(funcionario.atuacao, funcoes)}
                                    </Typography>
                                  </Box>
                                  {funcionario.escala && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Schedule sx={{ color: '#666666', fontSize: 16 }} />
                                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                        <strong>Escala:</strong> {funcionario.escala}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 0.8, fontSize: '0.8rem' }}>
                                  Acessos
                                </Typography>
                                {(() => {
                                  // Suportar formato antigo (array) e novo (objeto)
                                  let acessosList = [];
                                  
                                  if (Array.isArray(funcionario.acessos) && funcionario.acessos.length > 0) {
                                    // Formato antigo: array de objetos
                                    acessosList = funcionario.acessos.map(acesso => ({
                                      label: `${acesso.sistema || 'Sistema'}${acesso.perfil ? ` (${acesso.perfil})` : ''}`,
                                      id: acesso.id
                                    }));
                                  } else if (funcionario.acessos && typeof funcionario.acessos === 'object' && !Array.isArray(funcionario.acessos)) {
                                    LISTA_ACESSOS_MODAL.forEach(({ key, label }) => {
                                      if (funcionario.acessos[key] === true) {
                                        acessosList.push({ label, id: key });
                                      }
                                    });
                                  }
                                  
                                  return acessosList.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      {acessosList.map((acesso) => (
                                        <Chip
                                          key={acesso.id}
                                          label={acesso.label}
                                          sx={{
                                            backgroundColor: '#1694FF',
                                            color: '#ffffff',
                                            fontFamily: 'Poppins'
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontStyle: 'italic' }}>
                                      Nenhum acesso cadastrado
                                    </Typography>
                                  );
                                })()}
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
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            {/* Nome Completo com Foto */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.colaboradorNome}
                  onChange={(e) => setFormData({ ...formData, colaboradorNome: e.target.value })}
                  required
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
                      fontFamily: 'Poppins',
                      fontSize: '0.8rem'
                    }
                  }}
                />
                <Avatar
                  src={formData.profile_pic || undefined}
                  sx={{ width: 64, height: 64 }}
                >
                  {formData.colaboradorNome ? formData.colaboradorNome.charAt(0).toUpperCase() : <Person />}
                </Avatar>
              </Box>
            </Grid>

            {/* Data de Nascimento e CPF */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                type="date"
                value={formData.dataAniversario}
                onChange={(e) => setFormData({ ...formData, dataAniversario: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF"
                value={formData.CPF}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
                  if (value.length <= 11) {
                    setFormData({ ...formData, CPF: value });
                  }
                }}
                placeholder="11 dígitos"
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
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>

            {/* E-mail e Telefone */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={formData.userMail}
                onChange={(e) => setFormData({ ...formData, userMail: e.target.value })}
                placeholder="usuario@exemplo.com"
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
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
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
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>

            {/* Escala e Departamento */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Escala</InputLabel>
                <Select
                  value={formData.escala}
                  label="Escala"
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
                >
                  {(opcoesEscalas || []).map((escala) => (
                    <MenuItem key={escala} value={escala}>
                      {escala}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Departamento"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
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
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>

            {/* Atuações */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Atuações *</InputLabel>
                <Select
                  multiple
                  value={formData.atuacao}
                  onChange={(e) => setFormData({...formData, atuacao: e.target.value})}
                  required
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((nome) => (
                        <Chip key={nome} label={nome} size="small" />
                      ))}
                    </Box>
                  )}
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
                >
                  {funcoes && funcoes.length > 0 && funcoes.map((funcao) => (
                    <MenuItem key={funcao._id} value={funcao.funcao}>
                      <Checkbox checked={Array.isArray(formData.atuacao) && formData.atuacao.indexOf(funcao.funcao) > -1} />
                      {funcao.funcao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Empresa e Data de Contratação */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Empresa</InputLabel>
                <Select
                  value={formData.empresa}
                  label="Empresa"
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
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
                >
                  {(opcoesEmpresas || []).map((empresa) => (
                    <MenuItem key={empresa} value={empresa}>
                      {empresa}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                    fontSize: '0.8rem',
                    '&:hover fieldset': {
                      borderColor: '#1694FF'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000058'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600, 
                color: '#000058', 
                mb: 1 
              }}>
                Status
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.desligado}
                    onChange={(e) => {
                      const isDesligado = e.target.checked;
                      setFormData({ 
                        ...formData, 
                        desligado: isDesligado,
                        // Se desmarcar desligado, limpar data de desligamento
                        dataDesligamento: isDesligado ? formData.dataDesligamento : '',
                        // Se marcar como desligado, remover todos os acessos (todos false)
                        acessos: isDesligado ? ACESSOS_PLATAFORMA_PADRAO() : formData.acessos
                      });
                    }}
                    sx={{
                      color: '#EF4444',
                      '&.Mui-checked': {
                        color: '#EF4444'
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: 'Poppins', color: '#EF4444', fontWeight: 500 }}>
                    Desligado
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.afastado}
                    onChange={(e) => {
                      const isAfastado = e.target.checked;
                      setFormData({ 
                        ...formData, 
                        afastado: isAfastado,
                        // Se desmarcar afastado, limpar data de afastamento
                        dataAfastamento: isAfastado ? formData.dataAfastamento : '',
                        // Se marcar como afastado, remover todos os acessos (todos false)
                        acessos: isAfastado ? ACESSOS_PLATAFORMA_PADRAO() : formData.acessos
                      });
                    }}
                    sx={{
                      color: '#F59E0B',
                      '&.Mui-checked': {
                        color: '#F59E0B'
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: 'Poppins', color: '#F59E0B', fontWeight: 500 }}>
                    Afastado
                  </Typography>
                }
              />
            </Grid>

            {/* Campo Data de Desligamento - Exibido condicionalmente */}
            {formData.desligado && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Desligamento"
                  type="date"
                  value={formData.dataDesligamento}
                  onChange={(e) => setFormData({ ...formData, dataDesligamento: e.target.value })}
                  required={formData.desligado}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins',
                      '&:hover fieldset': {
                        borderColor: '#EF4444'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#EF4444'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'Poppins',
                      color: '#EF4444'
                    }
                  }}
                />
              </Grid>
            )}

            {/* Campo Data de Afastamento - Exibido condicionalmente */}
            {formData.afastado && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Afastamento"
                  type="date"
                  value={formData.dataAfastamento}
                  onChange={(e) => setFormData({ ...formData, dataAfastamento: e.target.value })}
                  required={formData.afastado}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins',
                      '&:hover fieldset': {
                        borderColor: '#F59E0B'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#F59E0B'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'Poppins',
                      color: '#F59E0B'
                    }
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {funcionarioEditando && (
            <Button 
              onClick={resetarSenha} 
              sx={{ 
                fontFamily: 'Poppins', 
                color: '#1694FF',
                mr: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(22, 148, 255, 0.1)'
                }
              }}
            >
              Reset de Senha
            </Button>
          )}
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
      <Dialog 
        key={funcionarioSelecionado?._id || funcionarioSelecionado?.id || 'acesso-modal'} 
        open={modalAcessoAberto} 
        onClose={fecharModalAcesso} 
        maxWidth="sm" 
        fullWidth
        TransitionProps={{ timeout: 0 }}
        keepMounted
      >
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          Gerenciar Acessos - {funcionarioSelecionado?.colaboradorNome}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            {(funcionarioSelecionado?.desligado || funcionarioSelecionado?.afastado) && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ fontFamily: 'Poppins', mb: 2 }}>
                  Este funcionário está {funcionarioSelecionado?.desligado ? 'desligado' : 'afastado'}. 
                  Os acessos serão automaticamente removidos.
                </Alert>
              </Grid>
            )}
            {LISTA_ACESSOS_MODAL.map(({ key, label }) => (
              <Grid item xs={12} md={4} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acessoData[key] === true}
                      disabled={funcionarioSelecionado?.desligado || funcionarioSelecionado?.afastado}
                      onChange={(e) => setAcessoData(prev => ({ 
                        ...prev, 
                        [key]: e.target.checked 
                      }))}
                      sx={{
                        color: '#1694FF',
                        '&.Mui-checked': {
                          color: '#1694FF'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                      {label}
                    </Typography>
                  }
                />
              </Grid>
            ))}
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

      {/* Modal de Estatísticas */}
      <Dialog open={showStats} onClose={() => setShowStats(false)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', display: 'flex', alignItems: 'center' }}>
          <BarChart sx={{ mr: 1, color: '#1694FF' }} />
          Estatísticas do Sistema
        </DialogTitle>
        <DialogContent>
          {(() => {
            const {
              stats,
              statsAtuacaoPorEmpresa,
              statsPorEmpresaStatus,
              funcionariosAtivos,
              funcionariosDesligados,
              funcionariosAfastados,
              job6x1Ativos
            } = calcularEstatisticas();

            return (
              <Grid container spacing={3}>
                {/* Coluna Esquerda: Por Empresa e Por Escala */}
                <Grid item xs={12} lg={6}>
                  <Grid container spacing={3} direction="column">
                    {/* Estatísticas por Empresa */}
                    <Grid item>
                      <Card
                        className="container-secondary"
                        sx={{
                          background: 'transparent',
                          border: '1.5px solid var(--blue-dark)',
                          borderRadius: '4px',
                          padding: '16px',
                          margin: '8px',
                          ...FUNCIONARIOS_CARD_SECUNDARIO_SEM_HOVER
                        }}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Business sx={{ mr: 1 }} />
                            Por Empresa
                          </Typography>
                          
                          {/* Tabela de Empresa por Status */}
                          <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: 'var(--cor-container)' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#BBDEFB' }}>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Empresa</TableCell>
                                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Ativos</TableCell>
                                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Afastados</TableCell>
                                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Desligados</TableCell>
                                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>Total</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {/* JOB */}
                                <TableRow>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 500, color: 'var(--blue-dark)' }}>JOB</TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].ativos} size="small" sx={{ backgroundColor: '#C8E6C9', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].afastados} size="small" sx={{ backgroundColor: '#FFF3E0', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].desligados} size="small" sx={{ backgroundColor: '#FFCDD2', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].ativos + statsPorEmpresaStatus['JOB'].afastados + statsPorEmpresaStatus['JOB'].desligados} size="small" sx={{ backgroundColor: '#BBDEFB', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                </TableRow>
                                
                                {/* Velotax */}
                                <TableRow>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 500, color: 'var(--blue-dark)' }}>Velotax</TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['Velotax'].ativos} size="small" sx={{ backgroundColor: '#C8E6C9', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['Velotax'].afastados} size="small" sx={{ backgroundColor: '#FFF3E0', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['Velotax'].desligados} size="small" sx={{ backgroundColor: '#FFCDD2', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['Velotax'].ativos + statsPorEmpresaStatus['Velotax'].afastados + statsPorEmpresaStatus['Velotax'].desligados} size="small" sx={{ backgroundColor: '#BBDEFB', color: '#000000', fontFamily: 'Poppins', fontWeight: 600 }} />
                                  </TableCell>
                                </TableRow>
                                
                                {/* Total Geral */}
                                <TableRow sx={{ backgroundColor: '#E1F5FE' }}>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--blue-dark)' }}>TOTAL GERAL</TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].ativos + statsPorEmpresaStatus['Velotax'].ativos} size="small" sx={{ backgroundColor: '#A5D6A7', color: '#000000', fontFamily: 'Poppins', fontWeight: 700 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].afastados + statsPorEmpresaStatus['Velotax'].afastados} size="small" sx={{ backgroundColor: '#FFE0B2', color: '#000000', fontFamily: 'Poppins', fontWeight: 700 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={statsPorEmpresaStatus['JOB'].desligados + statsPorEmpresaStatus['Velotax'].desligados} size="small" sx={{ backgroundColor: '#FFAB91', color: '#000000', fontFamily: 'Poppins', fontWeight: 700 }} />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={funcionarios.length} size="small" sx={{ backgroundColor: '#90CAF9', color: '#000000', fontFamily: 'Poppins', fontWeight: 700 }} />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Estatísticas por Escala */}
                    <Grid item>
                      <Card
                        className="container-secondary"
                        sx={{
                          background: 'transparent',
                          border: '1.5px solid var(--blue-dark)',
                          borderRadius: '4px',
                          padding: '16px',
                          margin: '8px',
                          ...FUNCIONARIOS_CARD_SECUNDARIO_SEM_HOVER
                        }}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Schedule sx={{ mr: 1 }} />
                            Por Escala
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {Object.entries(stats.porEscala)
                              .sort(([,a], [,b]) => b - a)
                              .map(([escala, count]) => (
                                <Box key={escala} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: 'var(--blue-dark)', fontWeight: escala.toLowerCase() === 'afastada' ? 600 : 400 }}>
                                    {escala}
                                  </Typography>
                                  <Chip 
                                    label={count} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: escala.toLowerCase() === 'afastada' ? '#FFF3E0' : '#C8E6C9', 
                                      color: '#000000',
                                      fontFamily: 'Poppins', 
                                      fontWeight: 600 
                                    }} 
                                  />
                                </Box>
                              ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Coluna Direita: Por Atuação */}
                <Grid item xs={12} lg={6}>
                  <Card
                    className="container-secondary"
                    sx={{
                      background: 'transparent',
                      border: '1.5px solid var(--blue-dark)',
                      borderRadius: '4px',
                      padding: '16px',
                      margin: '8px',
                      height: '100%',
                      ...FUNCIONARIOS_CARD_SECUNDARIO_SEM_HOVER
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Work sx={{ mr: 1 }} />
                        Por Atuação
                      </Typography>
                      
                      {/* Tabela de Atuação por Empresa */}
                      <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#E1BEE7' }}>
                              <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#7B1FA2' }}>Atuação</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#7B1FA2' }}>Velotax</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#7B1FA2' }}>Job</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#7B1FA2' }}>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(statsAtuacaoPorEmpresa)
                              .sort(([,a], [,b]) => b.Total - a.Total)
                              .map(([atuacao, dados]) => (
                                <TableRow key={atuacao}>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#7B1FA2' }}>{atuacao}</TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={dados.Velotax} 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: dados.Velotax > 0 ? '#BBDEFB' : '#F5F5F5', 
                                        color: '#000000',
                                        fontFamily: 'Poppins', 
                                        fontWeight: 600 
                                      }} 
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={dados.Job} 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: dados.Job > 0 ? '#C8E6C9' : '#F5F5F5', 
                                        color: '#000000',
                                        fontFamily: 'Poppins', 
                                        fontWeight: 600 
                                      }} 
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={dados.Total} 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: '#E1BEE7', 
                                        color: '#000000',
                                        fontFamily: 'Poppins', 
                                        fontWeight: 600 
                                      }} 
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>


                {/* Resumo Geral */}
                <Grid item xs={12}>
                  <Card
                    sx={{
                      backgroundColor: 'var(--cor-card)',
                      border: '1px solid rgba(22, 52, 255, 0.1)',
                      ...FUNCIONARIOS_CARD_RESUMO_SEM_HOVER
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#424242', mb: 3 }}>
                        Resumo Geral
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1976D2' }}>
                              {funcionariosAtivos.length}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                              Funcionários Ativos
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#D32F2F' }}>
                              {funcionariosDesligados.length}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                              Funcionários Desligados
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#F57C00' }}>
                              {funcionariosAfastados.length}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                              Funcionários Afastados
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#FF9800' }}>
                              {job6x1Ativos}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                              Job 6x1 (sábado)
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowStats(false)} 
            sx={{ 
              fontFamily: 'Poppins', 
              color: '#666666',
              '&:hover': {
                backgroundColor: '#F5F5F5'
              }
            }}
          >
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

export default FuncionariosPage;