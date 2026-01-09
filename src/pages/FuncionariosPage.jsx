// VERSION: v1.10.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.10.0 - Adicionado campo Desk ao modal de acessos. Acessos são completamente opcionais - permitido salvar funcionários mesmo com todos os acessos como false.
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
  PersonAdd,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackButton';
import {
  getFuncionarios,
  getFuncionariosAtivos,
  addFuncionario,
  updateFuncionario,
  deleteFuncionario,
  migrarDadosParaMongoDB,
  verificarDadosLocais,
  limparDadosLocais
} from '../services/qualidadeAPI';
import { exportFuncionariosToExcel, exportFuncionariosToPDF } from '../services/qualidadeExport';
import { generateId } from '../types/qualidade';

// Função auxiliar para normalizar URL base (remove /api do final se existir)
const normalizeBaseUrl = (url) => {
  return url.replace(/\/api\/?$/, '');
};

// ✅ CORREÇÃO 1: Importar API_BASE_URL do arquivo de configuração - garantir que sempre termine com /api
const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL || 'https://backend-gcp-hfsqj6konq-ue.a.run.app') + '/api';

const FuncionariosPage = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para gestão de funções
  const [funcoes, setFuncoes] = useState([]); // Lista de funções disponíveis
  const [showModalNovo, setShowModalNovo] = useState(false); // Modal "Novo"
  const [showModalFuncao, setShowModalFuncao] = useState(false); // Modal "Função"
  const [novaFuncao, setNovaFuncao] = useState({ funcao: '', descricao: '' });
  const [funcaoEditando, setFuncaoEditando] = useState(null);
  
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
    atuacao: [], // Array de referências para funções
    escala: '',
    acessos: { // Objeto booleano {Velohub: Boolean, Console: Boolean, Academy: Boolean}
      Velohub: false,
      Console: false,
      Academy: false
    },
    desligado: false,
    dataDesligamento: '',
    afastado: false,
    dataAfastamento: ''
  });
  
  const [acessoData, setAcessoData] = useState({
    Velohub: false,
    Console: false,
    Academy: false,
    Desk: false
  });
  
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

  // Carregar funcionários
  useEffect(() => {
    carregarFuncionarios();
    carregarFuncoes(); // Adicionar esta linha
  }, []);

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
        f.empresa.toLowerCase().includes(filtros.empresa.toLowerCase())
      );
    }

    if (filtros.atuacao) {
      filtrados = filtrados.filter(f => {
        if (Array.isArray(f.atuacao)) {
          // Para array, verificar se alguma função contém o filtro
          return f.atuacao.some(id => {
            const funcao = funcoes.find(fun => fun._id === id);
            return funcao && funcao.funcao.toLowerCase().includes(filtros.atuacao.toLowerCase());
          });
        } else if (typeof f.atuacao === 'string') {
          // Para string (dados antigos), usar busca normal
          return f.atuacao.toLowerCase().includes(filtros.atuacao.toLowerCase());
        }
        return false;
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
      const response = await fetch(`${API_BASE_URL}/qualidade/funcoes`);
      const data = await response.json();
      if (data.success) {
        setFuncoes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      mostrarSnackbar('Erro ao carregar funções', 'error');
    }
  };

  const salvarFuncao = async () => {
    try {
      if (!novaFuncao.funcao.trim()) {
        mostrarSnackbar('Nome da função é obrigatório', 'error');
        return;
      }

      const url = funcaoEditando 
        ? `${API_BASE_URL}/qualidade/funcoes/${funcaoEditando._id}`
        : `${API_BASE_URL}/qualidade/funcoes`;
      
      const method = funcaoEditando ? 'PUT' : 'POST';
      
      // ✅ LOG: Exibir payload das funções antes do envio
      console.log('🔍 DEBUG - Salvando função:');
      console.log('📋 URL:', url);
      console.log('🔧 Método:', method);
      console.log('📦 Payload:', novaFuncao);
      console.log('🆔 Função editando:', funcaoEditando ? funcaoEditando._id : 'Nova função');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaFuncao)
      });

      const data = await response.json();
      
      // ✅ LOG: Exibir resposta da API
      console.log('📥 Resposta da API:', data);
      console.log('✅ Status da resposta:', data.success ? 'Sucesso' : 'Erro');
      
      if (data.success) {
        mostrarSnackbar(
          funcaoEditando ? 'Função atualizada com sucesso!' : 'Função criada com sucesso!', 
          'success'
        );
        setNovaFuncao({ funcao: '', descricao: '' });
        setFuncaoEditando(null);
        carregarFuncoes();
      } else {
        mostrarSnackbar(data.error || 'Erro ao salvar função', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar função:', error);
      mostrarSnackbar('Erro ao salvar função', 'error');
    }
  };

  const editarFuncao = (funcao) => {
    setFuncaoEditando(funcao);
    setNovaFuncao({ funcao: funcao.funcao, descricao: funcao.descricao || '' });
  };

  const deletarFuncao = async (id) => {
    try {
      if (window.confirm('Tem certeza que deseja deletar esta função?')) {
        const response = await fetch(`${API_BASE_URL}/qualidade/funcoes/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
          mostrarSnackbar('Função deletada com sucesso!', 'success');
          carregarFuncoes();
        } else {
          mostrarSnackbar(data.error || 'Erro ao deletar função', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao deletar função:', error);
      mostrarSnackbar('Erro ao deletar função', 'error');
    }
  };

  const abrirModal = (funcionario = null) => {
    if (funcionario) {
      setFuncionarioEditando(funcionario);
      
      // Verificar se há dados antigos (atuacao como string)
      const temDadosAntigos = funcionario.atuacao && typeof funcionario.atuacao === 'string';
      if (temDadosAntigos) {
        mostrarSnackbar('Dados antigos detectados. Atualize selecionando as funções.', 'warning');
      }
      
      // Normalizar formato de acessos (suporta formato antigo array e novo objeto)
      let acessosNormalizados = { Velohub: false, Console: false, Academy: false, Desk: false };
      if (funcionario.acessos && typeof funcionario.acessos === 'object') {
        if (Array.isArray(funcionario.acessos)) {
          // Formato antigo: array de objetos
          funcionario.acessos.forEach(acesso => {
            if (acesso && acesso.sistema) {
              const sistema = acesso.sistema.toLowerCase();
              if (sistema === 'velohub') {
                acessosNormalizados.Velohub = true;
              } else if (sistema === 'console') {
                acessosNormalizados.Console = true;
              } else if (sistema === 'academy') {
                acessosNormalizados.Academy = true;
              } else if (sistema === 'desk') {
                acessosNormalizados.Desk = true;
              }
            }
          });
        } else if (!Array.isArray(funcionario.acessos)) {
          // Formato novo: objeto booleano
          acessosNormalizados.Velohub = funcionario.acessos?.Velohub === true;
          acessosNormalizados.Console = funcionario.acessos?.Console === true;
          acessosNormalizados.Academy = funcionario.acessos?.Academy === true;
          acessosNormalizados.Desk = funcionario.acessos?.Desk === true;
        }
      }
      
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
        atuacao: Array.isArray(funcionario.atuacao) ? funcionario.atuacao : [],
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
        atuacao: [],
        escala: '',
        acessos: { Velohub: false, Console: false, Academy: false, Desk: false },
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
        atuacao: [],
        escala: '',
        acessos: { Velohub: false, Console: false, Academy: false, Desk: false },
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
      
      // Se funcionário está desligado ou afastado, forçar acessos como objeto com todos false
      if (dadosParaEnvio.desligado || dadosParaEnvio.afastado) {
        dadosParaEnvio.acessos = { Velohub: false, Console: false, Academy: false, Desk: false };
      } else {
        // Processar acessos: sempre retornar objeto booleano
        if (dadosParaEnvio.acessos && typeof dadosParaEnvio.acessos === 'object' && !Array.isArray(dadosParaEnvio.acessos)) {
          // Verificar todos os 4 campos de acesso
          const temAcesso = dadosParaEnvio.acessos?.Velohub === true || 
                           dadosParaEnvio.acessos?.Console === true ||
                           dadosParaEnvio.acessos?.Academy === true ||
                           dadosParaEnvio.acessos?.Desk === true;
          
          if (temAcesso) {
            // Enviar apenas os campos que são true
            const acessosEnvio = {};
            if (dadosParaEnvio.acessos?.Velohub === true) {
              acessosEnvio.Velohub = true;
            }
            if (dadosParaEnvio.acessos?.Console === true) {
              acessosEnvio.Console = true;
            }
            if (dadosParaEnvio.acessos?.Academy === true) {
              acessosEnvio.Academy = true;
            }
            if (dadosParaEnvio.acessos?.Desk === true) {
              acessosEnvio.Desk = true;
            }
            dadosParaEnvio.acessos = acessosEnvio;
          } else {
            // Se nenhum acesso está marcado, enviar objeto com todos false
            dadosParaEnvio.acessos = { Velohub: false, Console: false, Academy: false, Desk: false };
          }
        } else {
          // Se acessos não é um objeto válido, definir como objeto com todos false
          dadosParaEnvio.acessos = { Velohub: false, Console: false, Academy: false, Desk: false };
        }
      }
      
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

  const abrirModalAcesso = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    
    // Normalizar acessos do funcionário para o formato objeto booleano
    let acessosNormalizados = { Velohub: false, Console: false, Academy: false, Desk: false };
    if (funcionario.acessos && typeof funcionario.acessos === 'object') {
      if (!Array.isArray(funcionario.acessos)) {
        // Formato novo: objeto booleano
        acessosNormalizados = {
          Velohub: funcionario.acessos?.Velohub === true,
          Console: funcionario.acessos?.Console === true,
          Academy: funcionario.acessos?.Academy === true,
          Desk: funcionario.acessos?.Desk === true
        };
      } else {
        // Formato antigo: array de objetos
        funcionario.acessos.forEach(acesso => {
          if (acesso && acesso.sistema) {
            const sistema = acesso.sistema.toLowerCase();
            if (sistema === 'velohub') {
              acessosNormalizados.Velohub = true;
            } else if (sistema === 'console') {
              acessosNormalizados.Console = true;
            } else if (sistema === 'academy') {
              acessosNormalizados.Academy = true;
            } else if (sistema === 'desk') {
              acessosNormalizados.Desk = true;
            }
          }
        });
      }
    }
    
    setAcessoData(acessosNormalizados);
    setModalAcessoAberto(true);
  };

  const fecharModalAcesso = () => {
    setModalAcessoAberto(false);
    setFuncionarioSelecionado(null);
    setAcessoData({
      Velohub: false,
      Console: false,
      Academy: false,
      Desk: false
    });
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
          acessos: { Velohub: false, Console: false, Academy: false, Desk: false }
        };
        await updateFuncionario(funcionarioSelecionado._id || funcionarioSelecionado.id, funcionarioAtualizado);
        mostrarSnackbar('Acessos removidos (funcionário desligado/afastado)', 'success');
        await carregarFuncionarios();
        fecharModalAcesso();
        return;
      }
      
      // Preparar objeto de acessos no formato novo
      const novoAcessos = {};
      if (acessoData.Velohub === true) {
        novoAcessos.Velohub = true;
      }
      if (acessoData.Console === true) {
        novoAcessos.Console = true;
      }
      if (acessoData.Academy === true) {
        novoAcessos.Academy = true;
      }
      if (acessoData.Desk === true) {
        novoAcessos.Desk = true;
      }
      
      // Sempre salvar como objeto booleano completo
      // Se todos forem false, salvar como objeto com todos false
      const acessosParaSalvar = Object.keys(novoAcessos).length > 0 ? novoAcessos : { Velohub: false, Console: false, Academy: false, Desk: false };
      
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
        if (func.atuacao && Array.isArray(func.atuacao)) {
          func.atuacao.forEach(funcaoId => {
            const funcao = funcoes.find(f => f._id === funcaoId);
            if (funcao) {
              acc[funcao.funcao] = (acc[funcao.funcao] || 0) + 1;
            }
          });
        } else {
          acc['Não informado'] = (acc['Não informado'] || 0) + 1;
        }
        return acc;
      }, {})
    };

    // Calcular estatísticas de atuação por empresa
    const statsAtuacaoPorEmpresa = funcionarios.reduce((acc, func) => {
      const empresa = func.empresa || 'Não informado';
      
      if (func.atuacao && Array.isArray(func.atuacao)) {
        func.atuacao.forEach(funcaoId => {
          const funcao = funcoes.find(f => f._id === funcaoId);
          if (funcao) {
            const atuacao = funcao.funcao;
            
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
    <Container maxWidth="lg" sx={{ mt: 2, mb: 8, pb: 4, position: 'relative', padding: '40px 20px', fontSize: '0.8rem' }}>
      {/* Header com botão voltar no mesmo estilo da aba Artigos */}
      <Box sx={{ position: 'relative', mb: 0.96, minHeight: 32 }}>
        <Box sx={{ position: 'absolute', left: 0, top: -8, bottom: 0, display: 'flex', alignItems: 'flex-start' }}>
          {/* Botão voltar padrão das abas, usando BackButton */}
          <BackButton to="/qualidade" />
        </Box>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 2.4, borderRadius: '12.8px', boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, fontSize: '0.96rem' }}>
              Funcionários ({funcionariosFiltrados.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                startIcon={<Add />}
                onClick={() => setShowModalNovo(true)}
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
      <Card sx={{ borderRadius: '12.8px', boxShadow: '0 3.2px 16px rgba(0, 0, 0, 0.1)' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
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
                    <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
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
                              const acessos = [];
                              if (funcionario.acessos.Velohub === true) acessos.push('VeloHub');
                              if (funcionario.acessos.Console === true) acessos.push('Console');
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
                          <Box sx={{ p: 1.6, backgroundColor: '#f8f9fa' }}>
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
                                    <Work sx={{ color: '#666666', fontSize: 12.8 }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                                      <strong>Atuação:</strong> {funcionario.atuacao && Array.isArray(funcionario.atuacao) && funcionario.atuacao.length > 0
                                        ? funcionario.atuacao.map(id => {
                                            const funcao = funcoes.find(f => f._id === id);
                                            return funcao ? funcao.funcao : '';
                                          }).filter(Boolean).join(', ')
                                        : typeof funcionario.atuacao === 'string' && funcionario.atuacao
                                        ? funcionario.atuacao
                                        : 'Não informado'}
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
                                    // Formato novo: objeto booleano
                                    if (funcionario.acessos.Velohub === true) {
                                      acessosList.push({ label: 'VeloHub', id: 'velohub' });
                                    }
                                    if (funcionario.acessos.Console === true) {
                                      acessosList.push({ label: 'Console', id: 'console' });
                                    }
                                    if (funcionario.acessos.Academy === true) {
                                      acessosList.push({ label: 'Academy', id: 'academy' });
                                    }
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

            {/* Escala e Atuações */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Escala"
                value={formData.escala}
                onChange={(e) => setFormData({ ...formData, escala: e.target.value })}
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
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Atuações *</InputLabel>
                <Select
                  multiple
                  value={formData.atuacao}
                  onChange={(e) => setFormData({...formData, atuacao: e.target.value})}
                  required
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const funcao = funcoes.find(f => f._id === id);
                        return funcao ? (
                          <Chip key={id} label={funcao.funcao} size="small" />
                        ) : null;
                      })}
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
                    <MenuItem key={funcao._id} value={funcao._id}>
                      <Checkbox checked={Array.isArray(formData.atuacao) && formData.atuacao.indexOf(funcao._id) > -1} />
                      {funcao.funcao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Empresa e Data de Contratação */}
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
                        acessos: isDesligado ? { Velohub: false, Console: false, Academy: false, Desk: false } : formData.acessos
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
                        acessos: isAfastado ? { Velohub: false, Console: false, Academy: false, Desk: false } : formData.acessos
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
      <Dialog open={modalAcessoAberto} onClose={fecharModalAcesso} maxWidth="sm" fullWidth>
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
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acessoData.Velohub === true}
                    disabled={funcionarioSelecionado?.desligado || funcionarioSelecionado?.afastado}
                    onChange={(e) => setAcessoData({ 
                      ...acessoData, 
                      Velohub: e.target.checked 
                    })}
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
                    VeloHub
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acessoData.Console === true}
                    disabled={funcionarioSelecionado?.desligado || funcionarioSelecionado?.afastado}
                    onChange={(e) => setAcessoData({ 
                      ...acessoData, 
                      Console: e.target.checked 
                    })}
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
                    Console
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acessoData.Academy === true}
                    disabled={funcionarioSelecionado?.desligado || funcionarioSelecionado?.afastado}
                    onChange={(e) => setAcessoData({ 
                      ...acessoData, 
                      Academy: e.target.checked 
                    })}
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
                    Academy
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acessoData.Desk === true}
                    disabled={funcionarioSelecionado?.desligado || funcionarioSelecionado?.afastado}
                    onChange={(e) => setAcessoData({ 
                      ...acessoData, 
                      Desk: e.target.checked 
                    })}
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
                    Desk
                  </Typography>
                }
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
                {/* Estatísticas por Empresa */}
                <Grid item xs={12} lg={5}>
                  <Card sx={{ backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1976D2', mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1 }} />
                        Por Empresa
                      </Typography>
                      
                      {/* Tabela de Empresa por Status */}
                      <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#BBDEFB' }}>
                              <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1976D2' }}>Empresa</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1976D2' }}>Ativos</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1976D2' }}>Afastados</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1976D2' }}>Desligados</TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1976D2' }}>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* JOB */}
                            <TableRow>
                              <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#1976D2' }}>JOB</TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].ativos} size="small" sx={{ backgroundColor: '#C8E6C9', color: '#2E7D32', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].afastados} size="small" sx={{ backgroundColor: '#FFF3E0', color: '#F57C00', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].desligados} size="small" sx={{ backgroundColor: '#FFCDD2', color: '#D32F2F', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].ativos + statsPorEmpresaStatus['JOB'].afastados + statsPorEmpresaStatus['JOB'].desligados} size="small" sx={{ backgroundColor: '#BBDEFB', color: '#1976D2', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                            </TableRow>
                            
                            {/* Velotax */}
                            <TableRow>
                              <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#1976D2' }}>Velotax</TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['Velotax'].ativos} size="small" sx={{ backgroundColor: '#C8E6C9', color: '#2E7D32', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['Velotax'].afastados} size="small" sx={{ backgroundColor: '#FFF3E0', color: '#F57C00', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['Velotax'].desligados} size="small" sx={{ backgroundColor: '#FFCDD2', color: '#D32F2F', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['Velotax'].ativos + statsPorEmpresaStatus['Velotax'].afastados + statsPorEmpresaStatus['Velotax'].desligados} size="small" sx={{ backgroundColor: '#BBDEFB', color: '#1976D2', fontFamily: 'Poppins', fontWeight: 600 }} />
                              </TableCell>
                            </TableRow>
                            
                            {/* Total Geral */}
                            <TableRow sx={{ backgroundColor: '#E1F5FE' }}>
                              <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#01579B' }}>TOTAL GERAL</TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].ativos + statsPorEmpresaStatus['Velotax'].ativos} size="small" sx={{ backgroundColor: '#A5D6A7', color: '#1B5E20', fontFamily: 'Poppins', fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].afastados + statsPorEmpresaStatus['Velotax'].afastados} size="small" sx={{ backgroundColor: '#FFE0B2', color: '#E65100', fontFamily: 'Poppins', fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={statsPorEmpresaStatus['JOB'].desligados + statsPorEmpresaStatus['Velotax'].desligados} size="small" sx={{ backgroundColor: '#FFAB91', color: '#BF360C', fontFamily: 'Poppins', fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={funcionarios.length} size="small" sx={{ backgroundColor: '#90CAF9', color: '#0D47A1', fontFamily: 'Poppins', fontWeight: 700 }} />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Estatísticas por Escala */}
                <Grid item xs={12} lg={2}>
                  <Card sx={{ backgroundColor: '#E8F5E8', border: '1px solid #C8E6C9' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#2E7D32', mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ mr: 1 }} />
                        Por Escala
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.entries(stats.porEscala)
                          .sort(([,a], [,b]) => b - a)
                          .map(([escala, count]) => (
                            <Box key={escala} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#2E7D32', fontWeight: escala.toLowerCase() === 'afastada' ? 600 : 400 }}>
                                {escala}
                              </Typography>
                              <Chip 
                                label={count} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: escala.toLowerCase() === 'afastada' ? '#FFF3E0' : '#C8E6C9', 
                                  color: escala.toLowerCase() === 'afastada' ? '#F57C00' : '#2E7D32',
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

                {/* Estatísticas por Atuação */}
                <Grid item xs={12} lg={5}>
                  <Card sx={{ backgroundColor: '#F3E5F5', border: '1px solid #E1BEE7' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#7B1FA2', mb: 2, display: 'flex', alignItems: 'center' }}>
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
                                        color: dados.Velotax > 0 ? '#1976D2' : '#9E9E9E',
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
                                        color: dados.Job > 0 ? '#2E7D32' : '#9E9E9E',
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
                                        color: '#7B1FA2',
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
                  <Card sx={{ backgroundColor: '#FAFAFA', border: '1px solid #E0E0E0' }}>
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

      {/* Modal Novo */}
      <Dialog open={showModalNovo} onClose={() => setShowModalNovo(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', textAlign: 'center' }}>
          Novo
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#666666', mb: 3 }}>
            O que você gostaria de criar?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                setShowModalNovo(false);
                abrirModal();
              }}
              sx={{
                backgroundColor: '#1694FF',
                fontFamily: 'Poppins',
                py: 1.5,
                '&:hover': { backgroundColor: '#0D7AE5' }
              }}
            >
              Funcionário
            </Button>
            <Button
              variant="contained"
              startIcon={<Work />}
              onClick={() => {
                setShowModalNovo(false);
                setShowModalFuncao(true);
              }}
              sx={{
                backgroundColor: '#1694FF',
                fontFamily: 'Poppins',
                py: 1.5,
                '&:hover': { backgroundColor: '#0D7AE5' }
              }}
            >
              Função
            </Button>
            <Button
              variant="contained"
              startIcon={<Security />}
              disabled
              sx={{
                backgroundColor: '#CCCCCC',
                fontFamily: 'Poppins',
                py: 1.5,
                opacity: 0.5
              }}
            >
              Acesso
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setShowModalNovo(false)}
            sx={{ 
              fontFamily: 'Poppins', 
              color: '#666666',
              '&:hover': {
                backgroundColor: '#F5F5F5'
              }
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Gestão de Funções */}
      <Dialog open={showModalFuncao} onClose={() => setShowModalFuncao(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>
          Gestão de Funções
        </DialogTitle>
        <DialogContent>
          {/* Seção Superior - Formulário */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058', mb: 2 }}>
              {funcaoEditando ? 'Editar Função' : 'Nova Função'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Função"
                  value={novaFuncao.funcao}
                  onChange={(e) => setNovaFuncao({...novaFuncao, funcao: e.target.value})}
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
                  label="Descrição (opcional)"
                  value={novaFuncao.descricao}
                  onChange={(e) => setNovaFuncao({...novaFuncao, descricao: e.target.value})}
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={salvarFuncao}
                    sx={{
                      backgroundColor: '#1694FF',
                      fontFamily: 'Poppins',
                      px: 3,
                      '&:hover': { backgroundColor: '#0D7AE5' }
                    }}
                  >
                    {funcaoEditando ? 'Atualizar' : 'Salvar'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Seção Inferior - Lista */}
          <Box>
            {funcoes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                  Nenhuma função cadastrada
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Item</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Desc</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Editar</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#000058' }}>Remover</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {funcoes && funcoes.length > 0 && funcoes.map((funcao) => (
                      <TableRow key={funcao._id}>
                        <TableCell sx={{ fontFamily: 'Poppins' }}>{funcao.funcao}</TableCell>
                        <TableCell sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                          {funcao.descricao || '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => editarFuncao(funcao)}
                            sx={{ color: '#1694FF' }}
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => deletarFuncao(funcao._id)}
                            sx={{ color: '#FF4444' }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => {
              setShowModalFuncao(false);
              setFuncaoEditando(null);
              setNovaFuncao({ funcao: '', descricao: '' });
            }}
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