// VERSION: v1.2.3 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  SchoolOutlined,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Save,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/common/BackButton';
import { academyAPI } from '../services/academyAPI';

const AcademyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState(0);
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroClasse, setFiltroClasse] = useState('Todas');
  
  // Estados de expansão
  const [cursoExpandido, setCursoExpandido] = useState(null);
  const [modulosExpandidos, setModulosExpandidos] = useState({});
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  
  // Estados de reordenação de módulos
  const [moduloSelecionado, setModuloSelecionado] = useState(null); // { cursoId, moduloId }
  const [modulosReordenados, setModulosReordenados] = useState({}); // { cursoId: [modulos] }
  
  // Estados de reordenação de temas
  const [temaSelecionado, setTemaSelecionado] = useState(null); // { cursoId, moduloId, temaNome }
  const [temasReordenados, setTemasReordenados] = useState({}); // { cursoId-moduloId: [temas] }
  
  // Estados de modais
  const [modalCursoAberto, setModalCursoAberto] = useState(false);
  const [modalModuloAberto, setModalModuloAberto] = useState(false);
  const [modalTemaAberto, setModalTemaAberto] = useState(false);
  const [modalAulaAberto, setModalAulaAberto] = useState(false);
  
  // Estados de edição
  const [cursoEditando, setCursoEditando] = useState(null);
  const [moduloEditando, setModuloEditando] = useState(null);
  const [temaEditando, setTemaEditando] = useState(null);
  const [aulaEditando, setAulaEditando] = useState(null);
  
  // Estados de contexto (qual curso/módulo/tema está sendo editado)
  const [cursoContexto, setCursoContexto] = useState(null);
  const [moduloContexto, setModuloContexto] = useState(null);
  const [temaContexto, setTemaContexto] = useState(null);
  
  // Estados temporários para criação sequencial
  const [cursoTemporario, setCursoTemporario] = useState(null);
  const [moduloTemporario, setModuloTemporario] = useState(null);
  const [temaTemporario, setTemaTemporario] = useState(null);
  const [emFluxoCriacao, setEmFluxoCriacao] = useState(false);
  const [dialogCancelamentoAberto, setDialogCancelamentoAberto] = useState(false);
  
  // Estados de formulários
  const [formCurso, setFormCurso] = useState({
    cursoClasse: 'Essencial',
    cursoNome: '',
    cursoDescription: '',
    courseOrder: 1,
    isActive: true,
    modules: []
  });
  
  const [formModulo, setFormModulo] = useState({
    moduleId: '',
    moduleNome: '',
    isActive: true,
    sections: []
  });
  
  const [formTema, setFormTema] = useState({
    temaNome: '',
    temaOrder: 1,
    isActive: true,
    hasQuiz: false,
    quizId: '',
    lessons: []
  });
  
  const [formAula, setFormAula] = useState({
    lessonId: '',
    lessonTipo: 'video',
    lessonTitulo: '',
    lessonOrdem: 1,
    isActive: true,
    lessonContent: [{ url: '' }],
    driveId: '',
    youtubeId: ''
  });
  
  // Estados de UI
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const classes = ['Todas', 'Essencial', 'Atualização', 'Opcional', 'Reciclagem'];
  const tiposAula = ['video', 'pdf', 'audio', 'slide', 'document'];
  
  // Carregar cursos
  useEffect(() => {
    carregarCursos();
  }, []);
  
  // Filtrar cursos por classe
  useEffect(() => {
    if (filtroClasse === 'Todas') {
      setFilteredCursos(cursos);
    } else {
      setFilteredCursos(cursos.filter(c => c.cursoClasse === filtroClasse));
    }
  }, [filtroClasse, cursos]);
  
  const carregarCursos = async () => {
    try {
      setLoading(true);
      const dados = await academyAPI.cursosConteudo.getAll();
      setCursos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      mostrarSnackbar('Erro ao carregar cursos', 'error');
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };
  
  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const fecharSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Handlers de Tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Função para limpar estados temporários
  const limparEstadosTemporarios = () => {
    setCursoTemporario(null);
    setModuloTemporario(null);
    setTemaTemporario(null);
    setEmFluxoCriacao(false);
  };

  // Função para confirmar cancelamento
  const confirmarCancelamento = () => {
    if (cursoTemporario || emFluxoCriacao) {
      setDialogCancelamentoAberto(true);
    } else {
      // Se não há curso temporário, fechar normalmente
      return true;
    }
    return false;
  };

  // Função para descartar criação
  const descartarCriacao = () => {
    limparEstadosTemporarios();
    setDialogCancelamentoAberto(false);
    setModalCursoAberto(false);
    setModalModuloAberto(false);
    setModalTemaAberto(false);
    setModalAulaAberto(false);
    setCursoEditando(null);
    setModuloEditando(null);
    setTemaEditando(null);
    setAulaEditando(null);
    setCursoContexto(null);
    setModuloContexto(null);
    setTemaContexto(null);
    setCursoSelecionado(null);
  };

  // Handlers de Curso
  const abrirModalCurso = (curso = null) => {
    if (curso) {
      // Edição de curso existente
      setCursoEditando(curso);
      setEmFluxoCriacao(false);
      setFormCurso({
        cursoClasse: curso.cursoClasse || 'Essencial',
        cursoNome: curso.cursoNome || '',
        cursoDescription: curso.cursoDescription || '',
        courseOrder: curso.courseOrder || 1,
        isActive: curso.isActive !== undefined ? curso.isActive : true,
        modules: curso.modules || []
      });
    } else {
      // Novo curso - iniciar fluxo sequencial
      setCursoEditando(null);
      setEmFluxoCriacao(true);
      setFormCurso({
        cursoClasse: 'Essencial',
        cursoNome: '',
        cursoDescription: '',
        courseOrder: 1,
        isActive: true,
        modules: []
      });
    }
    setModalCursoAberto(true);
  };
  
  const fecharModalCurso = () => {
    if (emFluxoCriacao) {
      // Se está em fluxo de criação, pedir confirmação
      if (!confirmarCancelamento()) {
        return; // Dialog será exibido
      }
    }
    setModalCursoAberto(false);
    setCursoEditando(null);
    setCursoSelecionado(null);
    if (!emFluxoCriacao) {
      limparEstadosTemporarios();
    }
  };

  // Função para avançar para próximo passo (Curso → Módulo)
  const proximoPassoCurso = () => {
    // Validar campos obrigatórios
    if (!formCurso.cursoNome || !formCurso.cursoNome.trim()) {
      mostrarSnackbar('Nome do curso é obrigatório', 'error');
      return;
    }
    if (!formCurso.courseOrder || formCurso.courseOrder < 1) {
      mostrarSnackbar('Ordem do curso deve ser maior que zero', 'error');
      return;
    }

    // Criar objeto temporário do curso
    const cursoTemp = {
      cursoClasse: formCurso.cursoClasse,
      cursoNome: formCurso.cursoNome,
      cursoDescription: formCurso.cursoDescription || '',
      courseOrder: formCurso.courseOrder,
      isActive: formCurso.isActive,
      modules: []
    };

    setCursoTemporario(cursoTemp);
    setModalCursoAberto(false);
    
    // Abrir modal de módulo automaticamente
    abrirModalModulo(cursoTemp);
  };
  
  // Função para validar e limpar dados do curso antes de salvar
  const validarELimparCurso = (cursoData) => {
    const cursoLimpo = JSON.parse(JSON.stringify(cursoData)); // Deep clone
    
    // Garantir que todos os campos do curso sejam preservados explicitamente
    const cursoValidado = {
      cursoClasse: cursoLimpo.cursoClasse,
      cursoNome: cursoLimpo.cursoNome,
      cursoDescription: cursoLimpo.cursoDescription || null, // Preservar explicitamente (pode ser null ou string)
      courseOrder: cursoLimpo.courseOrder,
      isActive: cursoLimpo.isActive !== undefined ? cursoLimpo.isActive : true,
      modules: []
    };
    
    // Validar e limpar módulos
    if (cursoLimpo.modules && Array.isArray(cursoLimpo.modules)) {
      cursoValidado.modules = cursoLimpo.modules.map(modulo => {
        const moduloLimpo = { ...modulo };
        
        // Validar e limpar sections (temas)
        if (moduloLimpo.sections && Array.isArray(moduloLimpo.sections)) {
          moduloLimpo.sections = moduloLimpo.sections.map(section => {
            const sectionLimpa = { ...section };
            
            // Validar e limpar lessons (aulas)
            if (sectionLimpa.lessons && Array.isArray(sectionLimpa.lessons)) {
              sectionLimpa.lessons = sectionLimpa.lessons.map(lesson => {
                const lessonLimpa = { ...lesson };
                
                // Validar lessonContent - remover URLs vazias e garantir pelo menos um conteúdo válido
                if (lessonLimpa.lessonContent && Array.isArray(lessonLimpa.lessonContent)) {
                  // Filtrar conteúdos válidos (com URL não vazia)
                  const conteudosValidos = lessonLimpa.lessonContent.filter(
                    content => content && content.url && typeof content.url === 'string' && content.url.trim() !== ''
                  );
                  
                  // Se não houver conteúdo válido, adicionar um placeholder
                  if (conteudosValidos.length === 0) {
                    lessonLimpa.lessonContent = [{ url: 'https://placeholder.com' }];
                  } else {
                    lessonLimpa.lessonContent = conteudosValidos;
                  }
                } else {
                  // Se não existe lessonContent, criar um array com placeholder
                  lessonLimpa.lessonContent = [{ url: 'https://placeholder.com' }];
                }
                
                return lessonLimpa;
              }).filter(lesson => {
                // Manter apenas aulas que têm dados mínimos válidos
                return lesson.lessonId && lesson.lessonTitulo;
              });
            }
            
            return sectionLimpa;
          }).filter(section => {
            // Manter apenas seções que têm pelo menos uma aula
            return section.lessons && section.lessons.length > 0;
          });
        }
        
        return moduloLimpo;
      }).filter(modulo => {
        // Manter apenas módulos que têm pelo menos uma seção
        return modulo.sections && modulo.sections.length > 0;
      });
    }
    
    return cursoValidado;
  };
  
  const salvarCurso = async () => {
    try {
      let dados = {
        cursoClasse: formCurso.cursoClasse,
        cursoNome: formCurso.cursoNome,
        cursoDescription: formCurso.cursoDescription || null, // Garantir inclusão explícita (null se vazio)
        courseOrder: formCurso.courseOrder,
        isActive: formCurso.isActive,
        modules: formCurso.modules,
        createdBy: user?.email || user?._userMail || 'admin@velotax.com.br',
        version: cursoEditando ? (cursoEditando.version || 1) + 1 : 1
      };
      
      // Validar e limpar dados antes de enviar
      dados = validarELimparCurso(dados);
      
      // DEBUG: Verificar se cursoDescription está presente antes de enviar
      console.log('Dados finais antes de enviar:', dados);
      console.log('cursoDescription:', dados.cursoDescription);
      
      if (cursoEditando) {
        await academyAPI.cursosConteudo.update(cursoEditando._id, dados);
        mostrarSnackbar('Curso atualizado com sucesso');
      } else {
        await academyAPI.cursosConteudo.create(dados);
        mostrarSnackbar('Curso criado com sucesso');
      }
      
      fecharModalCurso();
      carregarCursos();
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      mostrarSnackbar(`Erro ao salvar curso: ${error.message}`, 'error');
    }
  };
  
  const excluirCurso = async (cursoId) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await academyAPI.cursosConteudo.delete(cursoId);
        mostrarSnackbar('Curso excluído com sucesso');
        setCursoSelecionado(null);
        setCursoExpandido(null);
        carregarCursos();
      } catch (error) {
        console.error('Erro ao excluir curso:', error);
        mostrarSnackbar('Erro ao excluir curso', 'error');
      }
    }
  };
  
  // Handlers de Módulo
  const abrirModalModulo = (curso, modulo = null) => {
    setCursoContexto(curso);
    
    // Verificar se é curso temporário (sem _id) ou curso existente
    const isCursoTemporario = !curso._id;
    
    if (modulo) {
      setModuloEditando(modulo);
      setFormModulo({
        moduleId: modulo.moduleId || '',
        moduleNome: modulo.moduleNome || '',
        isActive: modulo.isActive !== undefined ? modulo.isActive : true,
        sections: modulo.sections || []
      });
    } else {
      setModuloEditando(null);
      // Se curso temporário, usar array temporário; senão, usar array do curso
      const modulosExistentes = isCursoTemporario 
        ? (cursoTemporario?.modules || [])
        : (curso.modules || []);
      
      setFormModulo({
        moduleId: `modulo-${modulosExistentes.length + 1}`,
        moduleNome: '',
        isActive: true,
        sections: []
      });
    }
    setModalModuloAberto(true);
  };
  
  const fecharModalModulo = () => {
    if (cursoTemporario) {
      // Se está em fluxo de criação, pedir confirmação
      if (!confirmarCancelamento()) {
        return; // Dialog será exibido
      }
    }
    setModalModuloAberto(false);
    setModuloEditando(null);
    if (!cursoTemporario) {
      setCursoContexto(null);
    }
  };

  // Função para voltar ao modal de Curso
  const voltarParaCurso = () => {
    if (!cursoTemporario) return;
    
    // Salvar dados do módulo atual antes de voltar
    if (formModulo.moduleId && formModulo.moduleNome) {
      const moduloAtualizado = {
        moduleId: formModulo.moduleId,
        moduleNome: formModulo.moduleNome,
        isActive: formModulo.isActive,
        sections: moduloTemporario?.sections || []
      };
      
      // Atualizar módulo no curso temporário se já existe
      const modulosAtualizados = cursoTemporario.modules.map(m => 
        m.moduleId === moduloTemporario?.moduleId ? moduloAtualizado : m
      );
      
      setCursoTemporario({
        ...cursoTemporario,
        modules: modulosAtualizados
      });
      
      if (moduloTemporario) {
        setModuloTemporario(moduloAtualizado);
      }
    }
    
    // Fechar modal de módulo
    setModalModuloAberto(false);
    setModuloEditando(null);
    
    // Reabrir modal de curso com dados temporários
    setFormCurso({
      cursoClasse: cursoTemporario.cursoClasse,
      cursoNome: cursoTemporario.cursoNome,
      cursoDescription: cursoTemporario.cursoDescription || '',
      courseOrder: cursoTemporario.courseOrder,
      isActive: cursoTemporario.isActive,
      modules: cursoTemporario.modules || []
    });
    
    setModalCursoAberto(true);
  };

  // Função para avançar para próximo passo (Módulo → Tema)
  const proximoPassoModulo = () => {
    // Validar campos obrigatórios
    if (!formModulo.moduleId || !formModulo.moduleId.trim()) {
      mostrarSnackbar('ID do módulo é obrigatório', 'error');
      return;
    }
    if (!formModulo.moduleNome || !formModulo.moduleNome.trim()) {
      mostrarSnackbar('Nome do módulo é obrigatório', 'error');
      return;
    }

    // Criar objeto temporário do módulo
    const moduloTemp = {
      moduleId: formModulo.moduleId,
      moduleNome: formModulo.moduleNome,
      isActive: formModulo.isActive,
      sections: []
    };

    // Adicionar módulo ao curso temporário
    const cursoAtualizado = {
      ...cursoTemporario,
      modules: [...(cursoTemporario.modules || []), moduloTemp]
    };

    setCursoTemporario(cursoAtualizado);
    setModuloTemporario(moduloTemp);
    setModalModuloAberto(false);
    
    // Abrir modal de tema automaticamente
    abrirModalTema(cursoAtualizado, moduloTemp);
  };
  
  const salvarModulo = async () => {
    try {
      const curso = cursoContexto;
      const modulos = [...(curso.modules || [])];
      
      if (moduloEditando) {
        const index = modulos.findIndex(m => m.moduleId === moduloEditando.moduleId);
        if (index >= 0) {
          modulos[index] = { ...modulos[index], ...formModulo };
        }
      } else {
        modulos.push(formModulo);
      }
      
      await academyAPI.cursosConteudo.update(curso._id, {
        ...curso,
        modules: modulos,
        version: (curso.version || 1) + 1
      });
      
      mostrarSnackbar('Módulo salvo com sucesso');
      fecharModalModulo();
      carregarCursos();
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
      mostrarSnackbar('Erro ao salvar módulo', 'error');
    }
  };
  
  const excluirModulo = async (curso, moduloId) => {
    if (window.confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        const modulos = curso.modules.filter(m => m.moduleId !== moduloId);
        await academyAPI.cursosConteudo.update(curso._id, {
          ...curso,
          modules: modulos,
          version: (curso.version || 1) + 1
        });
        mostrarSnackbar('Módulo excluído com sucesso');
        carregarCursos();
      } catch (error) {
        console.error('Erro ao excluir módulo:', error);
        mostrarSnackbar('Erro ao excluir módulo', 'error');
      }
    }
  };
  
  // Handlers de Tema
  const abrirModalTema = (curso, modulo, tema = null) => {
    setCursoContexto(curso);
    setModuloContexto(modulo);
    
    // Verificar se é módulo temporário (dentro de curso temporário)
    const isModuloTemporario = cursoTemporario && moduloTemporario && modulo.moduleId === moduloTemporario.moduleId;
    
    if (tema) {
      setTemaEditando(tema);
      setFormTema({
        temaNome: tema.temaNome || '',
        temaOrder: tema.temaOrder || 1,
        isActive: tema.isActive !== undefined ? tema.isActive : true,
        hasQuiz: tema.hasQuiz || false,
        quizId: tema.quizId || '',
        lessons: tema.lessons || []
      });
    } else {
      setTemaEditando(null);
      // Se módulo temporário, usar array temporário; senão, usar array do módulo
      const sectionsExistentes = isModuloTemporario
        ? (moduloTemporario?.sections || [])
        : (modulo.sections || []);
      
      setFormTema({
        temaNome: '',
        temaOrder: sectionsExistentes.length + 1,
        isActive: true,
        hasQuiz: false,
        quizId: '',
        lessons: []
      });
    }
    setModalTemaAberto(true);
  };
  
  const fecharModalTema = () => {
    if (cursoTemporario) {
      // Se está em fluxo de criação, pedir confirmação
      if (!confirmarCancelamento()) {
        return; // Dialog será exibido
      }
    }
    setModalTemaAberto(false);
    setTemaEditando(null);
    if (!cursoTemporario) {
      setModuloContexto(null);
    }
  };

  // Função para voltar ao modal de Módulo
  const voltarParaModulo = () => {
    if (!cursoTemporario || !moduloTemporario) return;
    
    // Salvar dados do tema atual antes de voltar
    if (formTema.temaNome) {
      const temaAtualizado = {
        temaNome: formTema.temaNome,
        temaOrder: formTema.temaOrder,
        isActive: formTema.isActive,
        hasQuiz: formTema.hasQuiz || false,
        quizId: formTema.quizId || '',
        lessons: temaTemporario?.lessons || []
      };
      
      // Atualizar tema no módulo temporário
      const sectionsAtualizadas = moduloTemporario.sections.map(s => 
        s.temaNome === temaTemporario?.temaNome ? temaAtualizado : s
      );
      
      const moduloAtualizado = {
        ...moduloTemporario,
        sections: sectionsAtualizadas
      };
      
      // Atualizar módulo no curso temporário
      const modulosAtualizados = cursoTemporario.modules.map(m => 
        m.moduleId === moduloTemporario.moduleId ? moduloAtualizado : m
      );
      
      setCursoTemporario({
        ...cursoTemporario,
        modules: modulosAtualizados
      });
      
      setModuloTemporario(moduloAtualizado);
      setTemaTemporario(temaAtualizado);
    }
    
    // Fechar modal de tema
    setModalTemaAberto(false);
    setTemaEditando(null);
    
    // Reabrir modal de módulo com dados temporários
    setFormModulo({
      moduleId: moduloTemporario.moduleId,
      moduleNome: moduloTemporario.moduleNome,
      isActive: moduloTemporario.isActive,
      sections: moduloTemporario.sections || []
    });
    
    setModalModuloAberto(true);
  };

  // Função para avançar para próximo passo (Tema → Aula)
  const proximoPassoTema = () => {
    // Validar campos obrigatórios
    if (!formTema.temaNome || !formTema.temaNome.trim()) {
      mostrarSnackbar('Nome do tema é obrigatório', 'error');
      return;
    }
    if (!formTema.temaOrder || formTema.temaOrder < 1) {
      mostrarSnackbar('Ordem do tema deve ser maior que zero', 'error');
      return;
    }

    // Criar objeto temporário do tema
    const temaTemp = {
      temaNome: formTema.temaNome,
      temaOrder: formTema.temaOrder,
      isActive: formTema.isActive,
      hasQuiz: formTema.hasQuiz || false,
      quizId: formTema.quizId || '',
      lessons: []
    };

    // Adicionar tema ao módulo temporário
    const moduloAtualizado = {
      ...moduloTemporario,
      sections: [...(moduloTemporario.sections || []), temaTemp]
    };

    // Atualizar módulo no curso temporário
    const modulosAtualizados = cursoTemporario.modules.map(m => 
      m.moduleId === moduloTemporario.moduleId ? moduloAtualizado : m
    );

    const cursoAtualizado = {
      ...cursoTemporario,
      modules: modulosAtualizados
    };

    setCursoTemporario(cursoAtualizado);
    setModuloTemporario(moduloAtualizado);
    setTemaTemporario(temaTemp);
    setModalTemaAberto(false);
    
    // Abrir modal de aula automaticamente
    abrirModalAula(cursoAtualizado, moduloAtualizado, temaTemp);
  };
  
  const salvarTema = async () => {
    try {
      const curso = cursoContexto;
      const modulo = moduloContexto;
      const modulos = [...curso.modules];
      const moduloIndex = modulos.findIndex(m => m.moduleId === modulo.moduleId);
      
      if (moduloIndex >= 0) {
        const sections = [...(modulos[moduloIndex].sections || [])];
        
        if (temaEditando) {
          const temaIndex = sections.findIndex(t => t.temaNome === temaEditando.temaNome);
          if (temaIndex >= 0) {
            sections[temaIndex] = { ...sections[temaIndex], ...formTema };
          }
        } else {
          sections.push(formTema);
        }
        
        modulos[moduloIndex] = { ...modulos[moduloIndex], sections };
        
        await academyAPI.cursosConteudo.update(curso._id, {
          ...curso,
          modules: modulos,
          version: (curso.version || 1) + 1
        });
        
        mostrarSnackbar('Tema salvo com sucesso');
        fecharModalTema();
        carregarCursos();
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      mostrarSnackbar('Erro ao salvar tema', 'error');
    }
  };
  
  const excluirTema = async (curso, modulo, temaNome) => {
    if (window.confirm('Tem certeza que deseja excluir este tema?')) {
      try {
        const modulos = [...curso.modules];
        const moduloIndex = modulos.findIndex(m => m.moduleId === modulo.moduleId);
        
        if (moduloIndex >= 0) {
          const sections = modulos[moduloIndex].sections.filter(t => t.temaNome !== temaNome);
          modulos[moduloIndex] = { ...modulos[moduloIndex], sections };
          
          await academyAPI.cursosConteudo.update(curso._id, {
            ...curso,
            modules: modulos,
            version: (curso.version || 1) + 1
          });
          
          mostrarSnackbar('Tema excluído com sucesso');
          carregarCursos();
        }
      } catch (error) {
        console.error('Erro ao excluir tema:', error);
        mostrarSnackbar('Erro ao excluir tema', 'error');
      }
    }
  };
  
  // Handlers de Aula
  const abrirModalAula = (curso, modulo, tema, aula = null) => {
    setCursoContexto(curso);
    setModuloContexto(modulo);
    setTemaContexto(tema);
    
    // Verificar se é tema temporário (dentro de curso temporário)
    const isTemaTemporario = cursoTemporario && temaTemporario && tema.temaNome === temaTemporario.temaNome;
    
    if (aula) {
      setAulaEditando(aula);
      setFormAula({
        lessonId: aula.lessonId || '',
        lessonTipo: aula.lessonTipo || 'video',
        lessonTitulo: aula.lessonTitulo || '',
        lessonOrdem: aula.lessonOrdem || 1,
        isActive: aula.isActive !== undefined ? aula.isActive : true,
        lessonContent: aula.lessonContent || [{ url: '' }],
        driveId: aula.driveId || '',
        youtubeId: aula.youtubeId || ''
      });
    } else {
      setAulaEditando(null);
      // Se tema temporário, usar array temporário; senão, usar array do tema
      const lessonsExistentes = isTemaTemporario
        ? (temaTemporario?.lessons || [])
        : (tema.lessons || []);
      
      setFormAula({
        lessonId: `l${lessonsExistentes.length + 1}-${lessonsExistentes.length + 1}`,
        lessonTipo: 'video',
        lessonTitulo: '',
        lessonOrdem: lessonsExistentes.length + 1,
        isActive: true,
        lessonContent: [{ url: '' }],
        driveId: '',
        youtubeId: ''
      });
    }
    setModalAulaAberto(true);
  };
  
  // Função para voltar ao modal de Tema
  const voltarParaTema = () => {
    if (!cursoTemporario || !moduloTemporario || !temaTemporario) return;
    
    // Salvar dados da aula atual antes de voltar (se houver dados preenchidos)
    const conteudosValidos = formAula.lessonContent?.filter(
      content => content && content.url && typeof content.url === 'string' && content.url.trim() !== ''
    ) || [];
    
    if (formAula.lessonId && formAula.lessonTitulo && conteudosValidos.length > 0) {
      const aulaAtualizada = {
        lessonId: formAula.lessonId,
        lessonTipo: formAula.lessonTipo,
        lessonTitulo: formAula.lessonTitulo,
        lessonOrdem: formAula.lessonOrdem,
        isActive: formAula.isActive,
        lessonContent: conteudosValidos,
        driveId: formAula.driveId || '',
        youtubeId: formAula.youtubeId || ''
      };
      
      // Atualizar aula no tema temporário
      const lessonsAtualizadas = [...(temaTemporario.lessons || []), aulaAtualizada];
      
      const temaAtualizado = {
        ...temaTemporario,
        lessons: lessonsAtualizadas
      };
      
      // Atualizar tema no módulo temporário
      const sectionsAtualizadas = moduloTemporario.sections.map(s => 
        s.temaNome === temaTemporario.temaNome ? temaAtualizado : s
      );
      
      const moduloAtualizado = {
        ...moduloTemporario,
        sections: sectionsAtualizadas
      };
      
      // Atualizar módulo no curso temporário
      const modulosAtualizados = cursoTemporario.modules.map(m => 
        m.moduleId === moduloTemporario.moduleId ? moduloAtualizado : m
      );
      
      setCursoTemporario({
        ...cursoTemporario,
        modules: modulosAtualizados
      });
      
      setModuloTemporario(moduloAtualizado);
      setTemaTemporario(temaAtualizado);
    }
    
    // Fechar modal de aula
    setModalAulaAberto(false);
    setAulaEditando(null);
    
    // Reabrir modal de tema com dados temporários
    setFormTema({
      temaNome: temaTemporario.temaNome,
      temaOrder: temaTemporario.temaOrder,
      isActive: temaTemporario.isActive,
      hasQuiz: temaTemporario.hasQuiz || false,
      quizId: temaTemporario.quizId || '',
      lessons: temaTemporario.lessons || []
    });
    
    setModalTemaAberto(true);
  };

  const fecharModalAula = () => {
    if (cursoTemporario) {
      // Se está em fluxo de criação, pedir confirmação
      if (!confirmarCancelamento()) {
        return; // Dialog será exibido
      }
    }
    setModalAulaAberto(false);
    setAulaEditando(null);
    if (!cursoTemporario) {
      setTemaContexto(null);
    }
  };
  
  const salvarAula = async () => {
    try {
      // Validar que a aula tem conteúdo válido antes de salvar
      const conteudosValidos = formAula.lessonContent.filter(
        content => content && content.url && typeof content.url === 'string' && content.url.trim() !== ''
      );
      
      if (conteudosValidos.length === 0) {
        mostrarSnackbar('Aula deve ter pelo menos um conteúdo com URL válida', 'error');
        return;
      }

      // Validar campos obrigatórios
      if (!formAula.lessonId || !formAula.lessonId.trim()) {
        mostrarSnackbar('ID da aula é obrigatório', 'error');
        return;
      }
      if (!formAula.lessonTitulo || !formAula.lessonTitulo.trim()) {
        mostrarSnackbar('Título da aula é obrigatório', 'error');
        return;
      }
      
      // Criar aula com conteúdo validado
      const aulaComConteudoValido = {
        ...formAula,
        lessonContent: conteudosValidos
      };

      // Se está criando novo curso (curso temporário existe)
      if (cursoTemporario) {
        // Adicionar aula ao tema temporário
        const temaAtualizado = {
          ...temaTemporario,
          lessons: [...(temaTemporario.lessons || []), aulaComConteudoValido]
        };

        // Atualizar tema no módulo temporário
        const moduloAtualizado = {
          ...moduloTemporario,
          sections: moduloTemporario.sections.map(s => 
            s.temaNome === temaTemporario.temaNome ? temaAtualizado : s
          )
        };

        // Atualizar módulo no curso temporário
        const cursoCompleto = {
          ...cursoTemporario,
          modules: cursoTemporario.modules.map(m => 
            m.moduleId === moduloTemporario.moduleId ? moduloAtualizado : m
          )
        };

        // Validar e limpar o curso completo antes de enviar
        const cursoLimpo = validarELimparCurso(cursoCompleto);

        // Adicionar campos obrigatórios para criação
        const dadosParaSalvar = {
          ...cursoLimpo, // cursoLimpo já vem de validarELimparCurso que preserva cursoDescription
          createdBy: user?.email || user?._userMail || 'admin@velotax.com.br',
          version: 1
        };

        // DEBUG: Verificar dados antes de enviar
        console.log('Dados para salvar (criação sequencial):', dadosParaSalvar);
        console.log('cursoDescription:', dadosParaSalvar.cursoDescription);

        // Salvar curso completo no MongoDB
        await academyAPI.cursosConteudo.create(dadosParaSalvar);
        
        // Limpar todos os estados temporários
        limparEstadosTemporarios();
        setModalAulaAberto(false);
        setCursoContexto(null);
        setModuloContexto(null);
        setTemaContexto(null);
        setAulaEditando(null);
        
        mostrarSnackbar('Curso criado com sucesso');
        carregarCursos();
      } else {
        // Edição de curso existente (comportamento atual)
        const curso = cursoContexto;
        const modulo = moduloContexto;
        const tema = temaContexto;
        const modulos = [...curso.modules];
        const moduloIndex = modulos.findIndex(m => m.moduleId === modulo.moduleId);
        
        if (moduloIndex >= 0) {
          const sections = [...modulos[moduloIndex].sections];
          const temaIndex = sections.findIndex(t => t.temaNome === tema.temaNome);
          
          if (temaIndex >= 0) {
            const lessons = [...(sections[temaIndex].lessons || [])];
            
            if (aulaEditando) {
              const aulaIndex = lessons.findIndex(l => l.lessonId === aulaEditando.lessonId);
              if (aulaIndex >= 0) {
                lessons[aulaIndex] = aulaComConteudoValido;
              }
            } else {
              lessons.push(aulaComConteudoValido);
            }
            
            sections[temaIndex] = { ...sections[temaIndex], lessons };
            modulos[moduloIndex] = { ...modulos[moduloIndex], sections };
            
            // Validar e limpar o curso completo antes de enviar
            const cursoLimpo = validarELimparCurso({
              ...curso,
              modules: modulos
            });
            
            await academyAPI.cursosConteudo.update(curso._id, {
              ...cursoLimpo,
              version: (curso.version || 1) + 1
            });
            
            mostrarSnackbar('Aula salva com sucesso');
            fecharModalAula();
            carregarCursos();
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      mostrarSnackbar(`Erro ao salvar aula: ${error.message}`, 'error');
    }
  };
  
  const excluirAula = async (curso, modulo, tema, lessonId) => {
    if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
      try {
        const modulos = [...curso.modules];
        const moduloIndex = modulos.findIndex(m => m.moduleId === modulo.moduleId);
        
        if (moduloIndex >= 0) {
          const sections = [...modulos[moduloIndex].sections];
          const temaIndex = sections.findIndex(t => t.temaNome === tema.temaNome);
          
          if (temaIndex >= 0) {
            const lessons = sections[temaIndex].lessons.filter(l => l.lessonId !== lessonId);
            sections[temaIndex] = { ...sections[temaIndex], lessons };
            modulos[moduloIndex] = { ...modulos[moduloIndex], sections };
            
            await academyAPI.cursosConteudo.update(curso._id, {
              ...curso,
              modules: modulos,
              version: (curso.version || 1) + 1
            });
            
            mostrarSnackbar('Aula excluída com sucesso');
            carregarCursos();
          }
        }
      } catch (error) {
        console.error('Erro ao excluir aula:', error);
        mostrarSnackbar('Erro ao excluir aula', 'error');
      }
    }
  };
  
  // Toggle expansão de curso
  const toggleCurso = (cursoId) => {
    setCursoExpandido(cursoExpandido === cursoId ? null : cursoId);
  };

  // Fechar card expandido ao clicar no backdrop
  const fecharCardExpandido = (e) => {
    if (e.target === e.currentTarget) {
      setCursoExpandido(null);
    }
  };

  // Toggle expansão de módulo - apenas pelo ícone
  const toggleModulo = (moduloId) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [moduloId]: !prev[moduloId]
    }));
  };

  // Selecionar módulo para reordenação
  const selecionarModulo = (cursoId, moduloId) => {
    setModuloSelecionado({ cursoId, moduloId });
  };

  // Mover módulo para cima
  const moverModuloParaCima = (cursoId, moduloIndex) => {
    if (moduloIndex === 0) return; // Já está no topo
    
    const curso = cursos.find(c => c._id === cursoId);
    if (!curso) return;
    
    const modulos = modulosReordenados[cursoId] || [...curso.modules];
    const novoModulos = [...modulos];
    [novoModulos[moduloIndex - 1], novoModulos[moduloIndex]] = [novoModulos[moduloIndex], novoModulos[moduloIndex - 1]];
    
    setModulosReordenados(prev => ({
      ...prev,
      [cursoId]: novoModulos
    }));
    
    // Atualizar seleção para o novo índice
    setModuloSelecionado({ cursoId, moduloId: novoModulos[moduloIndex - 1].moduleId });
  };

  // Mover módulo para baixo
  const moverModuloParaBaixo = (cursoId, moduloIndex) => {
    const curso = cursos.find(c => c._id === cursoId);
    if (!curso) return;
    
    const modulos = modulosReordenados[cursoId] || [...curso.modules];
    if (moduloIndex === modulos.length - 1) return; // Já está no final
    
    const novoModulos = [...modulos];
    [novoModulos[moduloIndex], novoModulos[moduloIndex + 1]] = [novoModulos[moduloIndex + 1], novoModulos[moduloIndex]];
    
    setModulosReordenados(prev => ({
      ...prev,
      [cursoId]: novoModulos
    }));
    
    // Atualizar seleção para o novo índice
    setModuloSelecionado({ cursoId, moduloId: novoModulos[moduloIndex + 1].moduleId });
  };

  // Salvar reordenação de módulos
  const salvarReordenacaoModulos = async (cursoId) => {
    try {
      const curso = cursos.find(c => c._id === cursoId);
      if (!curso) return;
      
      const modulosReordenados = modulosReordenados[cursoId];
      if (!modulosReordenados) return;
      
      await academyAPI.cursosConteudo.update(cursoId, {
        ...curso,
        modules: modulosReordenados,
        version: (curso.version || 1) + 1
      });
      
      // Limpar estados de reordenação
      setModulosReordenados(prev => {
        const novo = { ...prev };
        delete novo[cursoId];
        return novo;
      });
      setModuloSelecionado(null);
      
      mostrarSnackbar('Ordem dos módulos salva com sucesso');
      carregarCursos();
    } catch (error) {
      console.error('Erro ao salvar reordenação:', error);
      mostrarSnackbar('Erro ao salvar ordem dos módulos', 'error');
    }
  };

  // Selecionar tema para reordenação
  const selecionarTema = (cursoId, moduloId, temaNome) => {
    setTemaSelecionado({ cursoId, moduloId, temaNome });
  };

  // Mover tema para cima
  const moverTemaParaCima = (cursoId, moduloId, temaIndex) => {
    if (temaIndex === 0) return; // Já está no topo
    
    const curso = cursos.find(c => c._id === cursoId);
    if (!curso) return;
    
    const modulo = curso.modules.find(m => m.moduleId === moduloId);
    if (!modulo || !modulo.sections) return;
    
    const chave = `${cursoId}-${moduloId}`;
    const temas = temasReordenados[chave] || [...modulo.sections];
    const novoTemas = [...temas];
    [novoTemas[temaIndex - 1], novoTemas[temaIndex]] = [novoTemas[temaIndex], novoTemas[temaIndex - 1]];
    
    setTemasReordenados(prev => ({
      ...prev,
      [chave]: novoTemas
    }));
    
    // Atualizar seleção para o novo índice
    setTemaSelecionado({ cursoId, moduloId, temaNome: novoTemas[temaIndex - 1].temaNome });
  };

  // Mover tema para baixo
  const moverTemaParaBaixo = (cursoId, moduloId, temaIndex) => {
    const curso = cursos.find(c => c._id === cursoId);
    if (!curso) return;
    
    const modulo = curso.modules.find(m => m.moduleId === moduloId);
    if (!modulo || !modulo.sections) return;
    
    const chave = `${cursoId}-${moduloId}`;
    const temas = temasReordenados[chave] || [...modulo.sections];
    if (temaIndex === temas.length - 1) return; // Já está no final
    
    const novoTemas = [...temas];
    [novoTemas[temaIndex], novoTemas[temaIndex + 1]] = [novoTemas[temaIndex + 1], novoTemas[temaIndex]];
    
    setTemasReordenados(prev => ({
      ...prev,
      [chave]: novoTemas
    }));
    
    // Atualizar seleção para o novo índice
    setTemaSelecionado({ cursoId, moduloId, temaNome: novoTemas[temaIndex + 1].temaNome });
  };

  // Salvar reordenação de temas
  const salvarReordenacaoTemas = async (cursoId, moduloId) => {
    try {
      const curso = cursos.find(c => c._id === cursoId);
      if (!curso) return;
      
      const chave = `${cursoId}-${moduloId}`;
      const temasReordenadosParaSalvar = temasReordenados[chave];
      if (!temasReordenadosParaSalvar) return;
      
      // Encontrar o módulo e atualizar suas sections
      const cursoAtualizado = {
        ...curso,
        modules: curso.modules.map(modulo => {
          if (modulo.moduleId === moduloId) {
            return {
              ...modulo,
              sections: temasReordenadosParaSalvar
            };
          }
          return modulo;
        }),
        version: (curso.version || 1) + 1
      };
      
      await academyAPI.cursosConteudo.update(cursoId, cursoAtualizado);
      
      // Limpar estados de reordenação
      setTemasReordenados(prev => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
      setTemaSelecionado(null);
      
      mostrarSnackbar('Ordem dos temas salva com sucesso');
      carregarCursos();
    } catch (error) {
      console.error('Erro ao salvar reordenação de temas:', error);
      mostrarSnackbar('Erro ao salvar ordem dos temas', 'error');
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3.2, mb: 6.4, pb: 3.2 }}>
      {/* Header com botão voltar e abas alinhadas */}
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
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="academy tabs"
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
            <Tab label="Cursos" />
            <Tab label="Progresso" />
          </Tabs>
        </Box>
      </Box>
      
      {/* Conteúdo Principal */}
      {activeTab === 0 && (
        <Box>
            {/* Barra de Controle - Container Padrão Primário */}
            <Card 
              className="velohub-container"
              sx={{ 
                backgroundColor: 'var(--cor-container)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                padding: '12px 24px',
                marginBottom: '24px',
                mx: 0
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Classe</InputLabel>
                  <Select
                    value={filtroClasse}
                    onChange={(e) => setFiltroClasse(e.target.value)}
                    label="Classe"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {classes.map(classe => (
                      <MenuItem key={classe} value={classe} sx={{ fontSize: '0.875rem' }}>{classe}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => abrirModalCurso()}
                    sx={{ 
                      backgroundColor: 'var(--blue-medium)',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins',
                      fontWeight: 500
                    }}
                  >
                    Curso
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => cursoSelecionado && abrirModalCurso(cursoSelecionado)}
                    disabled={!cursoSelecionado}
                    sx={{ 
                      backgroundColor: '#FCC200 !important',
                      color: '#272A30 !important',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      opacity: !cursoSelecionado ? 0.5 : 1,
                      pointerEvents: !cursoSelecionado ? 'none' : 'auto',
                      '&:hover:not(:disabled)': {
                        backgroundColor: '#e6b000 !important'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#FCC200 !important',
                        color: '#272A30 !important',
                        opacity: 0.5
                      }
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Delete />}
                    onClick={() => {
                      if (cursoSelecionado) {
                        excluirCurso(cursoSelecionado._id);
                        setCursoSelecionado(null);
                      }
                    }}
                    disabled={!cursoSelecionado}
                    sx={{ 
                      backgroundColor: '#d32f2f !important',
                      color: 'white !important',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      opacity: !cursoSelecionado ? 0.5 : 1,
                      pointerEvents: !cursoSelecionado ? 'none' : 'auto',
                      '&:hover:not(:disabled)': {
                        backgroundColor: '#b71c1c !important'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#d32f2f !important',
                        color: 'white !important',
                        opacity: 0.5
                      }
                    }}
                  >
                    Excluir
                  </Button>
                </Box>
              </Box>
            </Card>
            
            {/* Cards de Cursos */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredCursos.length === 0 ? (
              <Alert severity="info">Nenhum curso encontrado</Alert>
            ) : (
              <>
                {/* Backdrop quando card está expandido */}
                {cursoExpandido && (
                  <Box
                    onClick={fecharCardExpandido}
                    sx={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      zIndex: 1000,
                      animation: 'fadeIn 0.3s ease-in-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0 },
                        to: { opacity: 1 }
                      }
                    }}
                  />
                )}
                <Grid container spacing={3} sx={{ px: 3, position: 'relative' }}>
                  {filteredCursos.map((curso) => {
                    const getClasseGradient = (classe) => {
                    switch(classe) {
                      case 'Essencial':
                        return 'linear-gradient(135deg, var(--blue-medium) 0%, var(--blue-medium) 60%, var(--blue-light) 100%)';
                      case 'Reciclagem':
                        return 'linear-gradient(135deg, var(--yellow) 0%, var(--yellow) 60%, var(--blue-medium) 100%)';
                      case 'Opcional':
                        return 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dark) 60%, var(--blue-opaque) 100%)';
                      case 'Atualização':
                        return 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dark) 60%, var(--yellow) 100%)';
                      default:
                        return 'linear-gradient(135deg, var(--blue-medium) 0%, var(--blue-medium) 60%, var(--blue-light) 100%)';
                    }
                  };

                  const isExpanded = cursoExpandido === curso._id;

                  return (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4} 
                      lg={3} 
                      key={curso._id}
                      sx={{
                        position: 'relative',
                        zIndex: isExpanded ? 1000 : 1,
                        transition: 'z-index 0s',
                        pointerEvents: isExpanded ? 'none' : 'auto'
                      }}
                    >
                      <Card 
                        sx={{ 
                          cursor: isExpanded ? 'default' : 'pointer',
                          transition: isExpanded 
                            ? 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: cursoSelecionado?._id === curso._id && isExpanded ? '1px solid var(--blue-medium)' : cursoSelecionado?._id === curso._id ? '2px solid var(--blue-medium)' : '1px solid rgba(0, 0, 0, 0.12)',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: isExpanded ? 'visible' : 'hidden',
                          position: isExpanded ? 'fixed' : 'relative',
                          width: isExpanded ? 'calc(100vw - 96px)' : '100%',
                          maxWidth: isExpanded ? '1200px' : '100%',
                          left: isExpanded ? '50%' : 'auto',
                          top: isExpanded ? '50%' : 'auto',
                          right: isExpanded ? 'auto' : 'auto',
                          bottom: isExpanded ? 'auto' : 'auto',
                          transform: isExpanded ? 'translate(-50%, -50%) !important' : 'none',
                          boxShadow: isExpanded ? 8 : 1,
                          zIndex: isExpanded ? 1001 : 1,
                          maxHeight: isExpanded ? '90vh' : 'none',
                          overflowY: isExpanded ? 'auto' : 'hidden',
                          pointerEvents: 'auto',
                          '&:hover': {
                            boxShadow: isExpanded ? 8 : 4,
                            border: cursoSelecionado?._id === curso._id && isExpanded ? '1px solid var(--blue-medium)' : cursoSelecionado?._id === curso._id ? '2px solid var(--blue-medium)' : '2px solid var(--blue-light)',
                            transform: isExpanded ? 'translate(-50%, -50%) !important' : 'none'
                          }
                        }}
                        onClick={() => {
                          setCursoSelecionado(curso);
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, flex: 1, fontSize: '0.95rem' }}>
                                {curso.cursoNome}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCurso(curso._id);
                                }}
                                sx={{
                                  backgroundColor: cursoSelecionado?._id === curso._id ? 'var(--blue-light)' : 'transparent',
                                  ml: 1,
                                  padding: '4px',
                                  '&:hover': {
                                    backgroundColor: 'var(--blue-light)'
                                  }
                                }}
                              >
                                <ExpandMore sx={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  fontSize: '1.2rem'
                                }} />
                              </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                              <Chip 
                                label={curso.cursoClasse} 
                                size="small" 
                                sx={{
                                  background: getClasseGradient(curso.cursoClasse),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  height: '22px',
                                  width: 'fit-content'
                                }}
                              />
                              <Chip 
                                label={curso.isActive ? 'Ativo' : 'Inativo'} 
                                size="small"
                                color={curso.isActive ? 'success' : 'default'}
                                sx={{ 
                                  width: 'fit-content',
                                  fontSize: '0.7rem',
                                  height: '22px'
                                }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                        
                        {/* Módulos Expandidos - DENTRO do Card */}
                        <Box
                          sx={{
                            maxHeight: isExpanded ? '2000px' : '0',
                            overflow: 'hidden',
                            transition: isExpanded 
                              ? 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease 0.1s, border-top 0.3s ease'
                              : 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, border-top 0.3s ease',
                            opacity: isExpanded ? 1 : 0,
                            borderTop: isExpanded ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid transparent',
                            transform: 'translateZ(0)', // Aceleração de hardware
                            willChange: 'max-height, opacity' // Otimização de performance
                          }}
                        >
                          {isExpanded && (
                            <CardContent sx={{ 
                              pt: 2, 
                              pb: 2,
                              animation: 'fadeIn 0.3s ease-in-out',
                              '@keyframes fadeIn': {
                                from: {
                                  opacity: 0,
                                  transform: 'translateY(-10px)'
                                },
                                to: {
                                  opacity: 1,
                                  transform: 'translateY(0)'
                                }
                              }
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                                  Módulos
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {/* Botão de salvar reordenação - só aparece se houver mudanças */}
                                  {modulosReordenados[curso._id] && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<Save />}
                                      onClick={() => salvarReordenacaoModulos(curso._id)}
                                      sx={{
                                        backgroundColor: 'var(--blue-medium)',
                                        fontSize: '0.875rem',
                                        fontFamily: 'Poppins',
                                        fontWeight: 500
                                      }}
                                    >
                                      Salvar Ordem
                                    </Button>
                                  )}
                                  <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={() => abrirModalModulo(curso)}
                                    sx={{
                                      border: '1px solid var(--blue-opaque)',
                                      borderRadius: '4px',
                                      '&:hover': {
                                        border: '1px solid var(--blue-opaque)',
                                        backgroundColor: 'rgba(0, 106, 185, 0.08)'
                                      }
                                    }}
                                  >
                                    Módulo
                                  </Button>
                                </Box>
                              </Box>
                              
                              {curso.modules && curso.modules.length > 0 ? (
                                (modulosReordenados[curso._id] || curso.modules).map((modulo, index) => {
                                  const isSelecionado = moduloSelecionado?.cursoId === curso._id && 
                                                       moduloSelecionado?.moduloId === modulo.moduleId;
                                  const modulos = modulosReordenados[curso._id] || curso.modules;
                                  
                                  return (
                                    <Accordion 
                                      key={modulo.moduleId}
                                      expanded={modulosExpandidos[modulo.moduleId] || false}
                                      onChange={() => {}} // Removido toggle automático
                                      sx={{ 
                                        mb: 1,
                                        border: isSelecionado || modulosExpandidos[modulo.moduleId] ? '1.4px solid var(--blue-dark)' : 'none',
                                        '&:hover': {
                                          border: isSelecionado || modulosExpandidos[modulo.moduleId] ? '1.4px solid var(--blue-dark)' : '1px solid rgba(0, 0, 0, 0.12)'
                                        }
                                      }}
                                    >
                                      <AccordionSummary 
                                        expandIcon={
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleModulo(modulo.moduleId);
                                            }}
                                            sx={{ mr: 1 }}
                                          >
                                            <ExpandMore />
                                          </IconButton>
                                        }
                                        onClick={(e) => {
                                          // Selecionar módulo ao clicar no card (não no ícone)
                                          if (e.target.closest('.MuiAccordionSummary-expandIconWrapper')) {
                                            return; // Não selecionar se clicou no ícone
                                          }
                                          selecionarModulo(curso._id, modulo.moduleId);
                                        }}
                                        sx={{ 
                                          cursor: 'pointer',
                                          '&:hover': {
                                            backgroundColor: isSelecionado ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                          }
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                                          <Typography>{modulo.moduleNome}</Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                                            {/* Botões de reordenação - só aparecem quando selecionado */}
                                            {isSelecionado && (
                                              <>
                                                <IconButton
                                                  size="small"
                                                  onClick={() => moverModuloParaCima(curso._id, index)}
                                                  disabled={index === 0}
                                                  sx={{
                                                    backgroundColor: 'var(--blue-light)',
                                                    '&:hover': {
                                                      backgroundColor: 'var(--blue-medium)'
                                                    },
                                                    '&.Mui-disabled': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.12)'
                                    }
                                                  }}
                                                >
                                                  <KeyboardArrowUp />
                                                </IconButton>
                                                <IconButton
                                                  size="small"
                                                  onClick={() => moverModuloParaBaixo(curso._id, index)}
                                                  disabled={index === modulos.length - 1}
                                                  sx={{
                                                    backgroundColor: 'var(--blue-light)',
                                                    '&:hover': {
                                                      backgroundColor: 'var(--blue-medium)'
                                                    },
                                                    '&.Mui-disabled': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.12)'
                                    }
                                                  }}
                                                >
                                                  <KeyboardArrowDown />
                                                </IconButton>
                                              </>
                                            )}
                                            <IconButton 
                                              size="small" 
                                              onClick={() => abrirModalModulo(curso, modulo)}
                                              color="primary"
                                            >
                                              <Edit />
                                            </IconButton>
                                            <IconButton 
                                              size="small" 
                                              onClick={() => excluirModulo(curso, modulo.moduleId)}
                                              color="error"
                                            >
                                              <Delete />
                                            </IconButton>
                                          </Box>
                                        </Box>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                          <Typography variant="subtitle2">Temas</Typography>
                                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            {temasReordenados[`${curso._id}-${modulo.moduleId}`] && (
                                              <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<Save />}
                                                onClick={() => salvarReordenacaoTemas(curso._id, modulo.moduleId)}
                                                sx={{
                                                  fontSize: '0.875rem',
                                                  fontFamily: 'Poppins',
                                                  fontWeight: 500
                                                }}
                                              >
                                                Salvar Ordem
                                              </Button>
                                            )}
                                            <Button
                                              size="small"
                                              startIcon={<Add />}
                                              onClick={() => abrirModalTema(curso, modulo)}
                                              sx={{
                                                border: '1px solid var(--blue-opaque)',
                                                borderRadius: '4px',
                                                '&:hover': {
                                                  border: '1px solid var(--blue-opaque)',
                                                  backgroundColor: 'rgba(0, 106, 185, 0.08)'
                                                }
                                              }}
                                            >
                                              Tema
                                            </Button>
                                          </Box>
                                        </Box>
                                        
                                        {modulo.sections && modulo.sections.length > 0 ? (
                                          (temasReordenados[`${curso._id}-${modulo.moduleId}`] || modulo.sections).map((tema, index) => {
                                            const chave = `${curso._id}-${modulo.moduleId}`;
                                            const temas = temasReordenados[chave] || modulo.sections;
                                            const isSelecionado = temaSelecionado?.cursoId === curso._id && 
                                                                 temaSelecionado?.moduloId === modulo.moduleId &&
                                                                 temaSelecionado?.temaNome === tema.temaNome;
                                            
                                            return (
                                              <Box key={index} sx={{ mb: 2 }}>
                                                <Card 
                                                  variant="outlined"
                                                  onClick={() => selecionarTema(curso._id, modulo.moduleId, tema.temaNome)}
                                                  sx={{
                                                    cursor: 'pointer',
                                                    border: isSelecionado ? '1.4px solid var(--blue-dark)' : '1px solid rgba(0, 0, 0, 0.12)',
                                                    '&:hover': {
                                                      border: isSelecionado ? '1.4px solid var(--blue-dark)' : '1px solid rgba(0, 0, 0, 0.3)'
                                                    }
                                                  }}
                                                >
                                                  <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <Typography variant="body1">{tema.temaNome}</Typography>
                                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                                                        {/* Botões de reordenação - só aparecem quando selecionado */}
                                                        {isSelecionado && (
                                                          <>
                                                            <IconButton
                                                              size="small"
                                                              onClick={() => moverTemaParaCima(curso._id, modulo.moduleId, index)}
                                                              disabled={index === 0}
                                                              sx={{ 
                                                                color: index === 0 ? 'rgba(0, 0, 0, 0.26)' : 'var(--blue-medium)',
                                                                '&:hover': {
                                                                  backgroundColor: index === 0 ? 'transparent' : 'rgba(22, 52, 255, 0.08)'
                                                                }
                                                              }}
                                                            >
                                                              <KeyboardArrowUp />
                                                            </IconButton>
                                                            <IconButton
                                                              size="small"
                                                              onClick={() => moverTemaParaBaixo(curso._id, modulo.moduleId, index)}
                                                              disabled={index === temas.length - 1}
                                                              sx={{ 
                                                                color: index === temas.length - 1 ? 'rgba(0, 0, 0, 0.26)' : 'var(--blue-medium)',
                                                                '&:hover': {
                                                                  backgroundColor: index === temas.length - 1 ? 'transparent' : 'rgba(22, 52, 255, 0.08)'
                                                                }
                                                              }}
                                                            >
                                                              <KeyboardArrowDown />
                                                            </IconButton>
                                                          </>
                                                        )}
                                                        <IconButton 
                                                          size="small" 
                                                          onClick={() => abrirModalTema(curso, modulo, tema)}
                                                          color="primary"
                                                        >
                                                          <Edit />
                                                        </IconButton>
                                                        <IconButton 
                                                          size="small" 
                                                          onClick={() => excluirTema(curso, modulo, tema.temaNome)}
                                                          color="error"
                                                        >
                                                          <Delete />
                                                        </IconButton>
                                                        <Button
                                                          size="small"
                                                          onClick={() => abrirModalAula(curso, modulo, tema)}
                                                        >
                                                          Ver Aulas
                                                        </Button>
                                                      </Box>
                                                    </Box>
                                                  </CardContent>
                                                </Card>
                                              </Box>
                                            );
                                          })
                                        ) : (
                                          <Typography variant="body2" color="text.secondary">
                                            Nenhum tema cadastrado
                                          </Typography>
                                        )}
                                      </AccordionDetails>
                                    </Accordion>
                                  );
                                })
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Nenhum módulo cadastrado
                                </Typography>
                              )}
                            </CardContent>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              </>
            )}
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 2 }}>
              Progresso dos Usuários
            </Typography>
            <Alert severity="info">
              Funcionalidade de progresso em desenvolvimento
            </Alert>
          </Box>
        )}
      
      {/* Modal de Curso */}
      <Dialog open={modalCursoAberto} onClose={fecharModalCurso} maxWidth="md" fullWidth>
        <DialogTitle>
          {cursoEditando ? 'Editar Curso' : 'Novo Curso'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                value={formCurso.cursoClasse}
                onChange={(e) => setFormCurso({ ...formCurso, cursoClasse: e.target.value })}
                label="Classe"
              >
                {classes.filter(c => c !== 'Todas').map(classe => (
                  <MenuItem key={classe} value={classe}>{classe}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Nome do Curso"
              value={formCurso.cursoNome}
              onChange={(e) => setFormCurso({ ...formCurso, cursoNome: e.target.value })}
              fullWidth
            />
            <TextField
              label="Descrição do Curso"
              value={formCurso.cursoDescription}
              onChange={(e) => setFormCurso({ ...formCurso, cursoDescription: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Ordem"
              type="number"
              value={formCurso.courseOrder}
              onChange={(e) => setFormCurso({ ...formCurso, courseOrder: parseInt(e.target.value) })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formCurso.isActive}
                  onChange={(e) => setFormCurso({ ...formCurso, isActive: e.target.checked })}
                />
              }
              label="Curso Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalCurso}>Cancelar</Button>
          <Button 
            onClick={emFluxoCriacao ? proximoPassoCurso : salvarCurso} 
            variant="contained"
          >
            {emFluxoCriacao ? 'Próximo' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Módulo */}
      <Dialog open={modalModuloAberto} onClose={fecharModalModulo} maxWidth="md" fullWidth>
        <DialogTitle>
          {moduloEditando ? 'Editar Módulo' : 'Novo Módulo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Campo: moduleId */}
            <TextField
              label="ID do Módulo"
              value={formModulo.moduleId}
              onChange={(e) => setFormModulo({ ...formModulo, moduleId: e.target.value })}
              fullWidth
            />
            
            {/* Campo: moduleNome */}
            <TextField
              label="Nome do Módulo"
              value={formModulo.moduleNome}
              onChange={(e) => setFormModulo({ ...formModulo, moduleNome: e.target.value })}
              fullWidth
            />
            
            {/* Campo: isActive */}
            <FormControlLabel
              control={
                <Switch
                  checked={formModulo.isActive}
                  onChange={(e) => setFormModulo({ ...formModulo, isActive: e.target.checked })}
                />
              }
              label="Módulo Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {cursoTemporario && (
            <Button 
              onClick={voltarParaCurso}
              startIcon={<ArrowBack />}
            >
              Voltar
            </Button>
          )}
          <Button onClick={fecharModalModulo}>Cancelar</Button>
          <Button 
            onClick={cursoTemporario ? proximoPassoModulo : salvarModulo} 
            variant="contained"
          >
            {cursoTemporario ? 'Próximo' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Tema */}
      <Dialog open={modalTemaAberto} onClose={fecharModalTema} maxWidth="md" fullWidth>
        <DialogTitle>
          {temaEditando ? 'Editar Tema' : 'Novo Tema'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome do Tema"
              value={formTema.temaNome}
              onChange={(e) => setFormTema({ ...formTema, temaNome: e.target.value })}
              fullWidth
            />
            <TextField
              label="Ordem"
              type="number"
              value={formTema.temaOrder}
              onChange={(e) => setFormTema({ ...formTema, temaOrder: parseInt(e.target.value) })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formTema.hasQuiz}
                  onChange={(e) => setFormTema({ ...formTema, hasQuiz: e.target.checked })}
                />
              }
              label="Tem Quiz"
            />
            {formTema.hasQuiz && (
              <TextField
                label="Quiz ID"
                value={formTema.quizId}
                onChange={(e) => setFormTema({ ...formTema, quizId: e.target.value })}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {cursoTemporario && (
            <Button 
              onClick={voltarParaModulo}
              startIcon={<ArrowBack />}
            >
              Voltar
            </Button>
          )}
          <Button onClick={fecharModalTema}>Cancelar</Button>
          <Button 
            onClick={cursoTemporario ? proximoPassoTema : salvarTema} 
            variant="contained"
          >
            {cursoTemporario ? 'Próximo' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Aulas */}
      <Dialog open={modalAulaAberto} onClose={fecharModalAula} maxWidth="lg" fullWidth>
        <DialogTitle>
          {aulaEditando ? 'Editar Aula' : 'Nova Aula'} - {temaContexto?.temaNome}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="ID da Aula"
              value={formAula.lessonId}
              onChange={(e) => setFormAula({ ...formAula, lessonId: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de Aula</InputLabel>
              <Select
                value={formAula.lessonTipo}
                onChange={(e) => setFormAula({ ...formAula, lessonTipo: e.target.value })}
                label="Tipo de Aula"
              >
                {tiposAula.map(tipo => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Título da Aula"
              value={formAula.lessonTitulo}
              onChange={(e) => setFormAula({ ...formAula, lessonTitulo: e.target.value })}
              fullWidth
            />
            <TextField
              label="Ordem"
              type="number"
              value={formAula.lessonOrdem}
              onChange={(e) => setFormAula({ ...formAula, lessonOrdem: parseInt(e.target.value) })}
              fullWidth
            />
            
            {/* Seção de Conteúdos/Vídeos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                  URLs de Conteúdo
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => {
                    setFormAula({
                      ...formAula,
                      lessonContent: [...formAula.lessonContent, { url: '' }]
                    });
                  }}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Adicionar Vídeo
                </Button>
              </Box>
              
              {formAula.lessonContent.map((content, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label={`URL ${index + 1}`}
                    value={content.url || ''}
                    onChange={(e) => {
                      const novosConteudos = [...formAula.lessonContent];
                      novosConteudos[index] = { url: e.target.value };
                      setFormAula({
                        ...formAula,
                        lessonContent: novosConteudos
                      });
                    }}
                    fullWidth
                    placeholder="https://youtu.be/..."
                  />
                  {formAula.lessonContent.length > 1 && (
                    <IconButton
                      onClick={() => {
                        const novosConteudos = formAula.lessonContent.filter((_, i) => i !== index);
                        setFormAula({
                          ...formAula,
                          lessonContent: novosConteudos.length > 0 ? novosConteudos : [{ url: '' }]
                        });
                      }}
                      color="error"
                      sx={{ mt: 1 }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
            
            <TextField
              label="Drive ID (opcional)"
              value={formAula.driveId}
              onChange={(e) => setFormAula({ ...formAula, driveId: e.target.value })}
              fullWidth
            />
            <TextField
              label="YouTube ID (opcional)"
              value={formAula.youtubeId}
              onChange={(e) => setFormAula({ ...formAula, youtubeId: e.target.value })}
              fullWidth
            />
            
            {/* Lista de Aulas Existentes */}
            {temaContexto?.lessons && temaContexto.lessons.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Aulas Existentes</Typography>
                <List>
                  {temaContexto.lessons.map((aula, index) => (
                    <React.Fragment key={aula.lessonId || index}>
                      <ListItem>
                        <ListItemText
                          primary={aula.lessonTitulo}
                          secondary={`${aula.lessonTipo} - Ordem: ${aula.lessonOrdem}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => abrirModalAula(cursoContexto, moduloContexto, temaContexto, aula)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={() => excluirAula(cursoContexto, moduloContexto, temaContexto, aula.lessonId)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < temaContexto.lessons.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {cursoTemporario && (
            <Button 
              onClick={voltarParaTema}
              startIcon={<ArrowBack />}
            >
              Voltar
            </Button>
          )}
          <Button onClick={fecharModalAula}>Cancelar</Button>
          <Button onClick={salvarAula} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog de Confirmação de Cancelamento */}
      <Dialog 
        open={dialogCancelamentoAberto} 
        onClose={() => setDialogCancelamentoAberto(false)}
      >
        <DialogTitle>Cancelar Criação?</DialogTitle>
        <DialogContent>
          <Typography>
            Todo o processo de criação do curso será perdido. Deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCancelamentoAberto(false)}>
            Não
          </Button>
          <Button 
            onClick={descartarCriacao} 
            variant="contained" 
            color="error"
          >
            Sim, Descartar
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
        <Alert onClose={fecharSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AcademyPage;

