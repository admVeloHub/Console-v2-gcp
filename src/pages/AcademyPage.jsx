// VERSION: v1.17.1 | DATE: 2026-04-16 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.17.1 - Import MUI: Menu sem duplicar MenuItem (já usado em Select)
// CHANGELOG: v1.17.0 - Troféu Bronze/Prata: menu Adicionar novo | Selecionar existente (lista GCS pasta temas)
// CHANGELOG: v1.16.0 - GCS troféus: icones_conquistas/modulos|temas (bucket já é mediabank_academy)
// CHANGELOG: v1.15.8 - Troféus: removido link "Abrir URL" (miniatura basta)
// CHANGELOG: v1.15.7 - Pré-visualização troféu: URL proxy GET /uploads/academy-trophy-media (bucket privado)
// CHANGELOG: v1.15.6 - Troféus: uploadAcademyTrophyImage (multipart→SKYNET→GCS; evita CORS no bucket)
// CHANGELOG: v1.15.5 - Pastas troféu GCS: mediabank_academy/icones_conquistas/modulos | .../temas (bucket mediabank_academy)
// CHANGELOG: v1.15.3 - getApiBaseUrl via getResolvedApiUrl (dev → SKYNET local)
// CHANGELOG: v1.15.2 - Botões troféu: rótulos Troféu / Troféu Bronze / Troféu Prata (como pedido)
// CHANGELOG: v1.15.1 - UI troféus: removidos textos explicativos desnecessários
// CHANGELOG: v1.15.0 - Troféus: prévia local (object URL) até Salvar; upload GCS só ao gravar; remover prévia/URL; miniatura URL guardada ao reabrir
// CHANGELOG: v1.14.1 - Modais Módulo/Tema: inputs Troféu + upload; voltar de Aula repõe URLs Bronze/Prata; validarELimparCurso remove temaTrophyIconUrl legado
// CHANGELOG: v1.14.0 - Módulo/Tema: troféu GCS (mediabank_academy/icones_conquistas/modulos|temas); temaTrophyIconUrlBronze/Prata; legado temaTrophyIconUrl → Bronze no formulário
// CHANGELOG: v1.13.7 - Release push GitHub 2026-04-10
// CHANGELOG: v1.13.6 - Filtro Atendimento via util compartilhado qualidadeFuncionariosAtendimento
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu
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
  ArrowBack,
  EmojiEvents,
  Close,
  PhotoLibrary
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/common/BackButton';
import { academyAPI } from '../services/academyAPI';
import { uploadAcademyTrophyImage, fetchAcademyTrophyTemasList } from '../services/uploadAPI';
import {
  getResolvedApiUrl,
  qualidadeFuncionariosAPI,
  qualidadeFuncoesAPI
} from '../services/api';
import {
  normalizeFuncoesLista,
  findRegistroFuncaoAtendimento,
  filtrarFuncionariosComFuncaoAtendimento
} from '../utils/qualidadeFuncionariosAtendimento';

/** Pré-visualização: bucket mediabank_academy pode ser privado — proxy de leitura no SKYNET */
function academyTrophyProxyUrl(storedUrl) {
  if (!storedUrl || typeof storedUrl !== 'string') return '';
  if (storedUrl.startsWith('blob:') || storedUrl.startsWith('data:')) return storedUrl;
  try {
    const u = new URL(storedUrl);
    if (u.hostname !== 'storage.googleapis.com') return storedUrl;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return storedUrl;
    const bucketName = parts[0];
    if (bucketName !== 'mediabank_academy') return storedUrl;
    const objectPath = parts.slice(1).join('/');
    const ok =
      /^icones_conquistas\/(modulos|temas)\//.test(objectPath) ||
      /^mediabank_academy\/icones_conquistas\/(modulos|temas)\//.test(objectPath);
    if (!ok) return storedUrl;
    const base = getResolvedApiUrl();
    return `${base}/uploads/academy-trophy-media?filename=${encodeURIComponent(objectPath)}`;
  } catch {
    return storedUrl;
  }
}

/** Pastas dentro do bucket mediabank_academy (GCS_BUCKET_NAME3) — sem repetir o nome do bucket no path */
const GCS_FOLDER_TROFEU_MODULO = 'icones_conquistas/modulos';
const GCS_FOLDER_TROFEU_TEMAS = 'icones_conquistas/temas';

/** URL troféu tema: Bronze/Prata; legado temaTrophyIconUrl → Bronze se Bronze vazio */
function normalizeTemaTrophyFields(tema) {
  if (!tema || typeof tema !== 'object') {
    return { temaTrophyIconUrlBronze: '', temaTrophyIconUrlPrata: '' };
  }
  const legado = typeof tema.temaTrophyIconUrl === 'string' ? tema.temaTrophyIconUrl.trim() : '';
  const bronze =
    (typeof tema.temaTrophyIconUrlBronze === 'string' && tema.temaTrophyIconUrlBronze.trim()) ||
    legado ||
    '';
  const prata =
    (typeof tema.temaTrophyIconUrlPrata === 'string' && tema.temaTrophyIconUrlPrata.trim()) || '';
  return { temaTrophyIconUrlBronze: bronze, temaTrophyIconUrlPrata: prata };
}

/** Remove campo legado ao gravar (substituído por Bronze/Prata) */
function stripLegacyTemaTrophyUrl(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const next = { ...obj };
  delete next.temaTrophyIconUrl;
  return next;
}

/** Alinha quizId (cursos_conteudo) e quizID (quiz_conteudo) ao temaNome em snake_case — LISTA_SCHEMAS.rb */
function temaNomeToQuizId(nome) {
  if (!nome || typeof nome !== 'string') return '';
  return nome
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function emptyQuizQuestao() {
  return {
    pergunta: '',
    opção1: '',
    opção2: '',
    opção3: '',
    opção4: ''
  };
}

function isQuestaoQuizCompleta(q) {
  if (!q) return false;
  const p = String(q.pergunta ?? '').trim();
  const o1 = String(q.opção1 ?? '').trim();
  const o2 = String(q.opção2 ?? '').trim();
  if (!p || !o1 || !o2) return false;
  const o3 = String(q.opção3 ?? '').trim();
  const o4 = String(q.opção4 ?? '').trim();
  if (!o3 && !o4) return true;
  if (o3 && o4) return true;
  if (o3 && !o4) return true;
  return false;
}

function quizTemLinhaParcial(rows) {
  return rows.some((q) => {
    const n = ['pergunta', 'opção1', 'opção2', 'opção3', 'opção4'].filter(
      (k) => q[k] && String(q[k]).trim().length > 0
    ).length;
    if (n === 0) return false;
    return !isQuestaoQuizCompleta(q);
  });
}

const outlineFieldSxAcademy = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--cor-container)',
    color: 'var(--gray)',
    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.15)' },
    '&:hover fieldset': { borderColor: 'var(--blue-medium)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--blue-medium)' },
    '& input': { color: 'var(--gray)' },
    '& textarea': { color: 'var(--gray)' }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': { color: 'var(--blue-medium)' }
  }
};

/** Campos do modal Quiz — fontes menores */
const outlineFieldSxQuizModal = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--cor-container)',
    color: 'var(--gray)',
    fontSize: '0.8125rem',
    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.15)' },
    '&:hover fieldset': { borderColor: 'var(--blue-medium)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--blue-medium)' },
    '& input': { color: 'var(--gray)', fontSize: '0.8125rem', py: 0.75 },
    '& textarea': { color: 'var(--gray)', fontSize: '0.8125rem' }
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': { color: 'var(--blue-medium)' },
    '&.MuiInputLabel-shrink': { fontSize: '0.6875rem' }
  }
};

const AcademyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState(0);
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroClasse, setFiltroClasse] = useState('Todas');
  
  // Estados para aba Progresso
  const [progressoSubTab, setProgressoSubTab] = useState(0); // 0 = Aprovações, 1 = Reprovações
  const [aprovacoes, setAprovacoes] = useState([]);
  const [reprovacoes, setReprovacoes] = useState([]);
  const [loadingProgresso, setLoadingProgresso] = useState(false);
  
  // Estados para aba Recentes
  const [recentesLista, setRecentesLista] = useState([]);
  const [loadingRecentes, setLoadingRecentes] = useState(false);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [funcionariosAtendimento, setFuncionariosAtendimento] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
  
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
  const [modalQuizAberto, setModalQuizAberto] = useState(false);
  const [quizFormQuestoes, setQuizFormQuestoes] = useState([]);
  const [quizFormLoading, setQuizFormLoading] = useState(false);
  const [salvandoQuiz, setSalvandoQuiz] = useState(false);
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
    moduleTrophyIconUrl: '',
    sections: []
  });
  
  const [formTema, setFormTema] = useState({
    temaNome: '',
    temaOrder: 1,
    isActive: true,
    hasQuiz: false,
    quizId: '',
    temaTrophyIconUrlBronze: '',
    temaTrophyIconUrlPrata: '',
    lessons: []
  });

  const fileTrofeuModuloRef = useRef(null);
  const fileTrofeuBronzeRef = useRef(null);
  const fileTrofeuPrataRef = useRef(null);
  /** Upload GCS apenas ao Salvar; antes disso só prévia local */
  const [pendingTrofeuModulo, setPendingTrofeuModulo] = useState(null);
  const [pendingTrofeuBronze, setPendingTrofeuBronze] = useState(null);
  const [pendingTrofeuPrata, setPendingTrofeuPrata] = useState(null);
  const [uploadingTrophy, setUploadingTrophy] = useState(null);

  const [trofeuTemasMenuBronzeAnchor, setTrofeuTemasMenuBronzeAnchor] = useState(null);
  const [trofeuTemasMenuPrataAnchor, setTrofeuTemasMenuPrataAnchor] = useState(null);
  const [modalTrofeuExistenteOpen, setModalTrofeuExistenteOpen] = useState(false);
  const [trofeuExistenteSlot, setTrofeuExistenteSlot] = useState(null);
  const [listaTrofeusTemasGcs, setListaTrofeusTemasGcs] = useState([]);
  const [loadingListaTrofeusTemasGcs, setLoadingListaTrofeusTemasGcs] = useState(false);

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

  useEffect(() => {
    if (!modalTemaAberto) return;
    setFormTema((prev) => {
      const nextQuizId = prev.hasQuiz ? temaNomeToQuizId(prev.temaNome) : '';
      if (prev.quizId === nextQuizId) return prev;
      return { ...prev, quizId: nextQuizId };
    });
  }, [modalTemaAberto, formTema.temaNome, formTema.hasQuiz]);

  const podeSalvarQuiz = useMemo(
    () =>
      quizFormQuestoes.length > 0 &&
      isQuestaoQuizCompleta(quizFormQuestoes[0]) &&
      !quizTemLinhaParcial(quizFormQuestoes),
    [quizFormQuestoes]
  );
  
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
      console.log('🔄 Carregando cursos do servidor...');
      const dados = await academyAPI.cursosConteudo.getAll();
      console.log('📊 Cursos recebidos:', dados?.length || 0);
      console.log('📋 Lista de cursos:', dados?.map(c => ({ nome: c.cursoNome, ordem: c.courseOrder, modulos: c.modules?.length || 0 })));
      
      const cursosArray = Array.isArray(dados) ? dados : [];
      setCursos(cursosArray);
      
      if (cursosArray.length === 0) {
        console.warn('⚠️ Nenhum curso encontrado no servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cursos:', error);
      mostrarSnackbar(`Erro ao carregar cursos: ${error.message}`, 'error');
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

  const clearPendingTrofeuModulo = () => {
    setPendingTrofeuModulo((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
  };

  const clearPendingTrofeuTema = () => {
    setPendingTrofeuBronze((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    setPendingTrofeuPrata((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
  };

  const handleSelectTrofeuModulo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      mostrarSnackbar('Selecione um arquivo de imagem.', 'error');
      return;
    }
    setPendingTrofeuModulo((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return { file, objectUrl: URL.createObjectURL(file) };
    });
  };

  const handleSelectTrofeuBronze = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      mostrarSnackbar('Selecione um arquivo de imagem.', 'error');
      return;
    }
    setPendingTrofeuBronze((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return { file, objectUrl: URL.createObjectURL(file) };
    });
  };

  const handleSelectTrofeuPrata = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      mostrarSnackbar('Selecione um arquivo de imagem.', 'error');
      return;
    }
    setPendingTrofeuPrata((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return { file, objectUrl: URL.createObjectURL(file) };
    });
  };

  const removerTrofeuModulo = () => {
    setPendingTrofeuModulo((prevPending) => {
      if (prevPending) {
        if (prevPending.objectUrl) URL.revokeObjectURL(prevPending.objectUrl);
        return null;
      }
      setFormModulo((prev) => ({ ...prev, moduleTrophyIconUrl: '' }));
      return null;
    });
  };

  const removerTrofeuBronze = () => {
    setPendingTrofeuBronze((prevPending) => {
      if (prevPending) {
        if (prevPending.objectUrl) URL.revokeObjectURL(prevPending.objectUrl);
        return null;
      }
      setFormTema((prev) => ({ ...prev, temaTrophyIconUrlBronze: '' }));
      return null;
    });
  };

  const removerTrofeuPrata = () => {
    setPendingTrofeuPrata((prevPending) => {
      if (prevPending) {
        if (prevPending.objectUrl) URL.revokeObjectURL(prevPending.objectUrl);
        return null;
      }
      setFormTema((prev) => ({ ...prev, temaTrophyIconUrlPrata: '' }));
      return null;
    });
  };

  const abrirSelecaoTrofeuExistente = async (slot) => {
    setTrofeuExistenteSlot(slot);
    setModalTrofeuExistenteOpen(true);
    setListaTrofeusTemasGcs([]);
    setLoadingListaTrofeusTemasGcs(true);
    try {
      const items = await fetchAcademyTrophyTemasList();
      setListaTrofeusTemasGcs(items);
    } catch (err) {
      mostrarSnackbar(err.message || 'Erro ao listar imagens no GCS', 'error');
      setModalTrofeuExistenteOpen(false);
      setTrofeuExistenteSlot(null);
    } finally {
      setLoadingListaTrofeusTemasGcs(false);
    }
  };

  const aplicarTrofeuExistenteDoGcs = (url) => {
    if (trofeuExistenteSlot === 'bronze') {
      setPendingTrofeuBronze((prev) => {
        if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
        return null;
      });
      setFormTema((prev) => ({ ...prev, temaTrophyIconUrlBronze: url }));
    } else if (trofeuExistenteSlot === 'prata') {
      setPendingTrofeuPrata((prev) => {
        if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
        return null;
      });
      setFormTema((prev) => ({ ...prev, temaTrophyIconUrlPrata: url }));
    }
    setModalTrofeuExistenteOpen(false);
    setTrofeuExistenteSlot(null);
    mostrarSnackbar('Troféu selecionado (URL existente no bucket).', 'success');
  };

  const fecharModalTrofeuExistente = () => {
    setModalTrofeuExistenteOpen(false);
    setTrofeuExistenteSlot(null);
  };

  const flushPendingModuloTrophy = async (pending, formMod) => {
    if (!pending) return formMod.moduleTrophyIconUrl || '';
    const { file, objectUrl } = pending;
    setUploadingTrophy('modulo');
    try {
      const { url } = await uploadAcademyTrophyImage(file, GCS_FOLDER_TROFEU_MODULO);
      URL.revokeObjectURL(objectUrl);
      setPendingTrofeuModulo(null);
      return url;
    } catch (err) {
      mostrarSnackbar(err.message || 'Erro ao enviar troféu do módulo', 'error');
      throw err;
    } finally {
      setUploadingTrophy(null);
    }
  };

  const flushPendingTemaTrophies = async (pendingB, pendingP, formT) => {
    let bronze = formT.temaTrophyIconUrlBronze || '';
    let prata = formT.temaTrophyIconUrlPrata || '';
    if (pendingB) {
      setUploadingTrophy('bronze');
      try {
        const { url } = await uploadAcademyTrophyImage(pendingB.file, GCS_FOLDER_TROFEU_TEMAS);
        URL.revokeObjectURL(pendingB.objectUrl);
        setPendingTrofeuBronze(null);
        bronze = url;
      } catch (err) {
        mostrarSnackbar(err.message || 'Erro ao enviar troféu Bronze', 'error');
        throw err;
      } finally {
        setUploadingTrophy(null);
      }
    }
    if (pendingP) {
      setUploadingTrophy('prata');
      try {
        const { url } = await uploadAcademyTrophyImage(pendingP.file, GCS_FOLDER_TROFEU_TEMAS);
        URL.revokeObjectURL(pendingP.objectUrl);
        setPendingTrofeuPrata(null);
        prata = url;
      } catch (err) {
        mostrarSnackbar(err.message || 'Erro ao enviar troféu Prata', 'error');
        throw err;
      } finally {
        setUploadingTrophy(null);
      }
    }
    return { bronze, prata };
  };

  const abrirModalQuiz = async () => {
    if (!formTema.temaNome?.trim()) {
      mostrarSnackbar('Preencha o nome do tema antes de editar o quiz.', 'error');
      return;
    }
    const qid = temaNomeToQuizId(formTema.temaNome);
    if (!qid) {
      mostrarSnackbar('Nome do tema inválido para gerar o ID do quiz.', 'error');
      return;
    }
    setFormTema((prev) => ({ ...prev, quizId: qid }));
    setModalQuizAberto(true);
    setQuizFormLoading(true);
    try {
      const doc = await academyAPI.quizConteudo.getByQuizId(qid);
      if (doc && Array.isArray(doc.questões) && doc.questões.length > 0) {
        setQuizFormQuestoes(
          doc.questões.map((q) => ({
            pergunta: q.pergunta || '',
            opção1: q.opção1 || '',
            opção2: q.opção2 || '',
            opção3: q.opção3 || '',
            opção4: q.opção4 || ''
          }))
        );
      } else {
        setQuizFormQuestoes([]);
      }
    } catch (err) {
      console.error(err);
      mostrarSnackbar(`Erro ao carregar quiz: ${err.message}`, 'error');
      setQuizFormQuestoes([]);
    } finally {
      setQuizFormLoading(false);
    }
  };

  const atualizarQuestaoQuiz = (index, campo, valor) => {
    setQuizFormQuestoes((rows) => {
      const next = [...rows];
      next[index] = { ...next[index], [campo]: valor };
      return next;
    });
  };

  const adicionarQuestaoQuiz = () => {
    setQuizFormQuestoes((rows) => [...rows, emptyQuizQuestao()]);
  };

  const removerQuestaoQuiz = (index) => {
    setQuizFormQuestoes((rows) => rows.filter((_, i) => i !== index));
  };

  const salvarQuizConteudoModal = async () => {
    if (!podeSalvarQuiz) return;
    const questões = quizFormQuestoes.filter(isQuestaoQuizCompleta).map((q) => ({
      pergunta: q.pergunta.trim(),
      opção1: q.opção1.trim(),
      opção2: q.opção2.trim(),
      opção3: q.opção3.trim(),
      opção4: q.opção4.trim()
    }));
    if (questões.length === 0) return;
    const qid = temaNomeToQuizId(formTema.temaNome);
    if (!qid) {
      mostrarSnackbar('Nome do tema inválido.', 'error');
      return;
    }
    setSalvandoQuiz(true);
    try {
      await academyAPI.quizConteudo.upsert(qid, { questões });
      setFormTema((prev) => ({ ...prev, quizId: qid, hasQuiz: true }));
      mostrarSnackbar('Quiz salvo com sucesso');
      setModalQuizAberto(false);
    } catch (e) {
      mostrarSnackbar(e.message || 'Erro ao salvar quiz', 'error');
    } finally {
      setSalvandoQuiz(false);
    }
  };
  
  // Carregar funções e funcionários quando aba Progresso for selecionada
  useEffect(() => {
    if (activeTab === 1 && progressoSubTab === 0) {
      carregarFuncoesEFuncionarios();
      // Identificar registros problemáticos ao carregar
      identificarRegistrosProblemas();
    }
  }, [activeTab, progressoSubTab]);
  
  // Carregar dados quando aba Progresso for selecionada ou subcategoria mudar
  useEffect(() => {
    if (activeTab === 1) {
      if (progressoSubTab === 0) {
        carregarAprovacoes();
      } else {
        carregarReprovacoes();
      }
    }
  }, [activeTab, progressoSubTab]);
  
  // Carregar certificados e reprovas quando aba Recentes for selecionada
  useEffect(() => {
    if (activeTab === 2) {
      carregarRecentes();
    }
  }, [activeTab]);
  
  const carregarFuncoesEFuncionarios = async () => {
    try {
      setLoadingFuncionarios(true);
      
      const funcoesResponse = await qualidadeFuncoesAPI.getAll();
      const funcoesData = normalizeFuncoesLista(funcoesResponse);
      setFuncoes(funcoesData);
      
      const funcaoAtendimento = findRegistroFuncaoAtendimento(funcoesData);
      
      if (!funcaoAtendimento) {
        console.warn('⚠️ Função "atendimento" não encontrada');
        setFuncionariosAtendimento([]);
        return;
      }
      
      const funcionariosResponse = await qualidadeFuncionariosAPI.getAll();
      const funcionariosData = funcionariosResponse?.data || funcionariosResponse || [];
      
      const funcionariosFiltrados = filtrarFuncionariosComFuncaoAtendimento(
        funcionariosData,
        funcaoAtendimento
      );
      
      setFuncionariosAtendimento(funcionariosFiltrados);
    } catch (error) {
      console.error('❌ Erro ao carregar funções e funcionários:', error);
      setFuncionariosAtendimento([]);
    } finally {
      setLoadingFuncionarios(false);
    }
  };
  
  const getApiBaseUrl = () => getResolvedApiUrl();
  
  const carregarAprovacoes = async () => {
    try {
      setLoadingProgresso(true);
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/mongodb/certificados`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const aprovacoesData = data.data || [];
        // Log para debug: encontrar registros com courseName inválido
        const registrosInvalidos = aprovacoesData.filter(a => {
          const courseName = a.courseName;
          return !courseName || typeof courseName !== 'string' || courseName.trim() === '' || courseName.toLowerCase() === 'curso';
        });
        if (registrosInvalidos.length > 0) {
          console.warn('⚠️ Registros com courseName inválido encontrados:', registrosInvalidos.map(r => ({
            _id: r._id,
            courseName: r.courseName,
            courseId: r.courseId,
            name: r.name,
            email: r.email
          })));
        }
        setAprovacoes(aprovacoesData);
      } else {
        console.error('Erro ao carregar aprovações:', data.error);
        setAprovacoes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar aprovações:', error);
      mostrarSnackbar(`Erro ao carregar aprovações: ${error.message}`, 'error');
      setAprovacoes([]);
    } finally {
      setLoadingProgresso(false);
    }
  };
  
  const carregarRecentes = async () => {
    try {
      setLoadingRecentes(true);
      const apiUrl = getApiBaseUrl();
      const [resCertificados, resReprovacoes] = await Promise.all([
        fetch(`${apiUrl}/mongodb/certificados`),
        fetch(`${apiUrl}/mongodb/reprovas`)
      ]);
      if (!resCertificados.ok || !resReprovacoes.ok) {
        throw new Error('Erro ao carregar dados');
      }
      const dataCert = await resCertificados.json();
      const dataRep = await resReprovacoes.json();
      const certs = dataCert.success ? (dataCert.data || []) : [];
      const repros = dataRep.success ? (dataRep.data || []) : [];
      const unificados = [
        ...certs.map(c => ({ ...c, tipo: 'aprovacao', dataSort: c.date || c.createdAt })),
        ...repros.map(r => ({ ...r, tipo: 'reprovacao', dataSort: r.date || r.createdAt }))
      ].sort((a, b) => {
        const da = new Date(a.dataSort || 0).getTime();
        const db = new Date(b.dataSort || 0).getTime();
        return db - da;
      });
      setRecentesLista(unificados);
    } catch (error) {
      console.error('❌ Erro ao carregar recentes:', error);
      mostrarSnackbar(`Erro ao carregar recentes: ${error.message}`, 'error');
      setRecentesLista([]);
    } finally {
      setLoadingRecentes(false);
    }
  };
  
  const carregarReprovacoes = async () => {
    try {
      setLoadingProgresso(true);
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/mongodb/reprovas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const reprovacoesData = data.data || [];
        // Log para debug: encontrar registros com courseName inválido
        const registrosInvalidos = reprovacoesData.filter(r => {
          const courseName = r.courseName;
          return !courseName || typeof courseName !== 'string' || courseName.trim() === '' || courseName.toLowerCase() === 'curso';
        });
        if (registrosInvalidos.length > 0) {
          console.warn('⚠️ Registros com courseName inválido encontrados:', registrosInvalidos.map(r => ({
            _id: r._id,
            courseName: r.courseName,
            courseId: r.courseId,
            name: r.name,
            email: r.email
          })));
        }
        setReprovacoes(reprovacoesData);
      } else {
        console.error('Erro ao carregar reprovações:', data.error);
        setReprovacoes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar reprovações:', error);
      mostrarSnackbar(`Erro ao carregar reprovações: ${error.message}`, 'error');
      setReprovacoes([]);
    } finally {
      setLoadingProgresso(false);
    }
  };
  
  // Handlers de Tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleProgressoSubTabChange = (event, newValue) => {
    setProgressoSubTab(newValue);
  };
  
  // Formatar nota do Academy: dados podem vir em escala 0-10 ou 0-100
  const formatarNotaAcademy = (finalGrade) => {
    if (finalGrade === null || finalGrade === undefined) return '-';
    const num = Number(finalGrade);
    if (isNaN(num)) return '-';
    const percentual = num <= 10 ? num * 10 : num;
    return percentual % 1 === 0 ? `${percentual}%` : `${percentual.toFixed(1)}%`;
  };
  
  // Normalizar nome do curso - usar courseName, mas buscar por courseId se courseName for inválido
  const normalizarNomeCurso = (courseName, courseId = null) => {
    // Função auxiliar para buscar curso pelo courseId
    const buscarCursoPorId = (id) => {
      if (!id) return null;
      
      const idStr = id.toString().toLowerCase().trim();
      
      // Tentar múltiplas correspondências
      const cursoEncontrado = cursos.find(c => {
        // 1. Comparar com _id convertido para string
        if (c._id?.toString().toLowerCase() === idStr) return true;
        
        // 2. Comparar com courseId do curso (se existir)
        if (c.courseId?.toString().toLowerCase() === idStr) return true;
        
        // 3. Comparar com cursoNome (case-insensitive)
        if (c.cursoNome?.toLowerCase() === idStr) return true;
        
        // 4. Comparar com cursoNome parcialmente (para casos como "Exc Atendimento" vs "Excelência do Atendimento")
        if (c.cursoNome && idStr) {
          const nomeCursoLower = c.cursoNome.toLowerCase();
          // Verificar se o courseId está contido no nome do curso ou vice-versa
          if (nomeCursoLower.includes(idStr) || idStr.includes(nomeCursoLower)) {
            return true;
          }
        }
        
        return false;
      });
      
      return cursoEncontrado;
    };
    
    // Se courseName não for válido, tentar buscar pelo courseId
    if (!courseName || typeof courseName !== 'string') {
      if (courseId) {
        const cursoEncontrado = buscarCursoPorId(courseId);
        if (cursoEncontrado?.cursoNome) {
          return cursoEncontrado.cursoNome;
        }
      }
      return 'Sem Nome de Curso';
    }
    
    const nomeLimpo = courseName.trim();
    
    // Se courseName for "Curso" (genérico), tentar buscar pelo courseId
    if (nomeLimpo === '' || nomeLimpo.toLowerCase() === 'curso' || nomeLimpo.toLowerCase() === 'courseid') {
      if (courseId) {
        const cursoEncontrado = buscarCursoPorId(courseId);
        if (cursoEncontrado?.cursoNome) {
          return cursoEncontrado.cursoNome;
        }
      }
      return 'Sem Nome de Curso';
    }
    
    return nomeLimpo;
  };
  
  // Função para identificar registros problemáticos e buscar courseName pelo courseId
  const identificarRegistrosProblemas = async () => {
    try {
      const apiUrl = getApiBaseUrl();
      
      // Buscar aprovações
      const responseAprovacoes = await fetch(`${apiUrl}/mongodb/certificados`);
      const dataAprovacoes = await responseAprovacoes.json();
      
      if (dataAprovacoes.success) {
        const todosRegistros = dataAprovacoes.data || [];
        
        // Filtrar registros que serão normalizados para "Sem Nome de Curso"
        const problemasAprovacoes = todosRegistros.filter(a => {
          const courseName = a.courseName;
          const courseId = a.courseId;
          const nomeNormalizado = normalizarNomeCurso(courseName, courseId);
          
          // Capturar TODOS os casos que resultam em "Sem Nome de Curso"
          return nomeNormalizado === 'Sem Nome de Curso';
        });
        
        if (problemasAprovacoes.length > 0) {
          console.group('🔍 APROVAÇÕES que serão exibidas como "Sem Nome de Curso":');
          problemasAprovacoes.forEach((r, index) => {
            console.log(`\n📋 Registro ${index + 1}:`);
            console.log('  _id:', r._id);
            console.log('  courseName:', r.courseName, `(${typeof r.courseName})`);
            console.log('  courseId:', r.courseId, `(${typeof r.courseId})`);
            console.log('  name:', r.name);
            console.log('  email:', r.email);
            console.log('  date:', r.date);
            console.log('  nomeNormalizado:', normalizarNomeCurso(r.courseName, r.courseId));
            console.log('  Dados completos:', JSON.stringify(r, null, 2));
          });
          console.groupEnd();
        }
        
        // Buscar especificamente registros com courseId ausente/null/undefined
        const registrosSemCourseId = todosRegistros.filter(a => {
          const courseId = a.courseId;
          return !courseId || courseId === null || courseId === undefined || courseId === '';
        });
        
        if (registrosSemCourseId.length > 0) {
          console.group('🚨 APROVAÇÕES COM courseId AUSENTE/NULL/UNDEFINED:');
          registrosSemCourseId.forEach((r, index) => {
            console.log(`\n📋 Registro ${index + 1}:`);
            console.log('  _id:', r._id);
            console.log('  courseName:', r.courseName, `(${typeof r.courseName})`);
            console.log('  courseId:', r.courseId, `(${typeof r.courseId})`);
            console.log('  name:', r.name);
            console.log('  email:', r.email);
            console.log('  date:', r.date);
            console.log('  Dados completos:', JSON.stringify(r, null, 2));
          });
          console.groupEnd();
        }
      }
      
      // Buscar reprovações
      const responseReprovacoes = await fetch(`${apiUrl}/mongodb/reprovas`);
      const dataReprovacoes = await responseReprovacoes.json();
      
      if (dataReprovacoes.success) {
        const todosRegistros = dataReprovacoes.data || [];
        
        // Filtrar registros que serão normalizados para "Sem Nome de Curso"
        const problemasReprovacoes = todosRegistros.filter(r => {
          const courseName = r.courseName;
          const courseId = r.courseId;
          const nomeNormalizado = normalizarNomeCurso(courseName, courseId);
          
          // Capturar TODOS os casos que resultam em "Sem Nome de Curso"
          return nomeNormalizado === 'Sem Nome de Curso';
        });
        
        if (problemasReprovacoes.length > 0) {
          console.group('🔍 REPROVAÇÕES que serão exibidas como "Sem Nome de Curso":');
          problemasReprovacoes.forEach((r, index) => {
            console.log(`\n📋 Registro ${index + 1}:`);
            console.log('  _id:', r._id);
            console.log('  courseName:', r.courseName, `(${typeof r.courseName})`);
            console.log('  courseId:', r.courseId, `(${typeof r.courseId})`);
            console.log('  name:', r.name);
            console.log('  email:', r.email);
            console.log('  date:', r.date);
            console.log('  nomeNormalizado:', normalizarNomeCurso(r.courseName, r.courseId));
            console.log('  Dados completos:', JSON.stringify(r, null, 2));
          });
          console.groupEnd();
        }
        
        // Buscar especificamente registros com courseId ausente/null/undefined
        const registrosSemCourseId = todosRegistros.filter(r => {
          const courseId = r.courseId;
          return !courseId || courseId === null || courseId === undefined || courseId === '';
        });
        
        if (registrosSemCourseId.length > 0) {
          console.group('🚨 REPROVAÇÕES COM courseId AUSENTE/NULL/UNDEFINED:');
          registrosSemCourseId.forEach((r, index) => {
            console.log(`\n📋 Registro ${index + 1}:`);
            console.log('  _id:', r._id);
            console.log('  courseName:', r.courseName, `(${typeof r.courseName})`);
            console.log('  courseId:', r.courseId, `(${typeof r.courseId})`);
            console.log('  name:', r.name);
            console.log('  email:', r.email);
            console.log('  date:', r.date);
            console.log('  Dados completos:', JSON.stringify(r, null, 2));
          });
          console.groupEnd();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao identificar registros problemáticos:', error);
    }
  };
  
  // Agrupar aprovações por curso - usar courseName, buscar por courseId se necessário
  const agruparAprovacoesPorCurso = () => {
    const agrupado = {};
    aprovacoes.forEach((aprovacao) => {
      const courseName = aprovacao.courseName;
      const courseId = aprovacao.courseId;
      if (!courseName || typeof courseName !== 'string') {
        console.warn('⚠️ Aprovação sem courseName válido:', aprovacao._id, 'courseName:', courseName, 'courseId:', courseId);
      }
      const cursoNome = normalizarNomeCurso(courseName, courseId);
      if (!agrupado[cursoNome]) {
        agrupado[cursoNome] = [];
      }
      agrupado[cursoNome].push(aprovacao);
    });
    // Ordenar por nome do curso
    return Object.keys(agrupado)
      .sort()
      .reduce((acc, curso) => {
        acc[curso] = agrupado[curso];
        return acc;
      }, {});
  };
  
  // Cruzar funcionários com aprovações por curso - usar courseName, buscar por courseId se necessário
  const cruzarFuncionariosComAprovacoes = (cursoNome) => {
    // Filtrar por courseName normalizado (que pode ter sido buscado via courseId)
    const aprovacoesCurso = aprovacoes.filter(a => {
      const courseName = a.courseName;
      const courseId = a.courseId;
      return normalizarNomeCurso(courseName, courseId) === cursoNome;
    });
    
    return funcionariosAtendimento.map(funcionario => {
      // Tentar encontrar aprovação por email (mais confiável)
      let aprovacao = aprovacoesCurso.find(a => 
        a.email && funcionario.userMail && 
        a.email.toLowerCase() === funcionario.userMail.toLowerCase()
      );
      
      // Se não encontrar por email, tentar por nome
      if (!aprovacao) {
        aprovacao = aprovacoesCurso.find(a => 
          a.name && funcionario.colaboradorNome &&
          a.name.toLowerCase().trim() === funcionario.colaboradorNome.toLowerCase().trim()
        );
      }
      
      return {
        funcionario,
        aprovacao
      };
    });
  };
  
  // Agrupar reprovações por curso - usar courseName, buscar por courseId se necessário
  const agruparReprovacoesPorCurso = () => {
    const agrupado = {};
    reprovacoes.forEach((reprovacao) => {
      const courseName = reprovacao.courseName;
      const courseId = reprovacao.courseId;
      if (!courseName || typeof courseName !== 'string') {
        console.warn('⚠️ Reprovação sem courseName válido:', reprovacao._id, 'courseName:', courseName, 'courseId:', courseId);
      }
      const cursoNome = normalizarNomeCurso(courseName, courseId);
      if (!agrupado[cursoNome]) {
        agrupado[cursoNome] = [];
      }
      agrupado[cursoNome].push(reprovacao);
    });
    // Ordenar por nome do curso
    return Object.keys(agrupado)
      .sort()
      .reduce((acc, curso) => {
        acc[curso] = agrupado[curso];
        return acc;
      }, {});
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
  
  // Função para fechar modal após salvar (sem verificar cancelamento)
  const fecharModalCursoAposSalvar = () => {
    setModalCursoAberto(false);
    setCursoEditando(null);
    setCursoSelecionado(null);
    limparEstadosTemporarios();
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
      cursoDescription: cursoLimpo.cursoDescription !== undefined ? cursoLimpo.cursoDescription : null,
      courseOrder: cursoLimpo.courseOrder,
      isActive: cursoLimpo.isActive !== undefined ? cursoLimpo.isActive : true,
      modules: []
    };
    
    // Validar e limpar módulos
    if (cursoLimpo.modules && Array.isArray(cursoLimpo.modules)) {
      cursoValidado.modules = cursoLimpo.modules.map(modulo => {
        const moduloLimpo = { ...modulo };
        
        // Garantir que sections seja um array (pode ser vazio)
        if (!moduloLimpo.sections || !Array.isArray(moduloLimpo.sections)) {
          moduloLimpo.sections = [];
        }
        
        // Validar e limpar sections (temas) apenas se houver sections
        if (moduloLimpo.sections.length > 0) {
          moduloLimpo.sections = moduloLimpo.sections.map(section => {
            const sectionLimpa = { ...section };
            
            // Garantir que lessons seja um array (pode ser vazio)
            if (!sectionLimpa.lessons || !Array.isArray(sectionLimpa.lessons)) {
              sectionLimpa.lessons = [];
            }
            
            // Validar e limpar lessons (aulas) apenas se houver lessons
            if (sectionLimpa.lessons.length > 0) {
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
            // Se não há lessons, manter array vazio (permitido agora)
            if (sectionLimpa.hasQuiz && sectionLimpa.temaNome) {
              sectionLimpa.quizId = temaNomeToQuizId(sectionLimpa.temaNome);
            }
            
            return stripLegacyTemaTrophyUrl(sectionLimpa);
          });
          // Não filtrar seções vazias - permitir temas sem aulas
        }
        // Se não há sections, manter array vazio (permitido agora)
        
        return moduloLimpo;
      });
      // Não filtrar módulos vazios - permitir módulos sem seções
    }
    
    return cursoValidado;
  };
  
  // Função para salvar curso vazio (sem módulos) durante criação sequencial
  const salvarCursoVazio = async () => {
    try {
      // Validar campos obrigatórios
      if (!formCurso.cursoNome || !formCurso.cursoNome.trim()) {
        mostrarSnackbar('Nome do curso é obrigatório', 'error');
        return;
      }
      if (!formCurso.courseOrder || formCurso.courseOrder < 1) {
        mostrarSnackbar('Ordem do curso deve ser maior que zero', 'error');
        return;
      }

      // Criar curso completamente vazio (sem módulos)
      const dados = {
        cursoClasse: formCurso.cursoClasse,
        cursoNome: formCurso.cursoNome,
        cursoDescription: formCurso.cursoDescription || null,
        courseOrder: formCurso.courseOrder,
        isActive: formCurso.isActive,
        modules: [], // Curso vazio sem módulos
        createdBy: user?.email || user?._userMail || 'admin@velotax.com.br',
        version: 1
      };

      console.log('📤 Salvando curso vazio (sem módulos):', dados);
      const resultado = await academyAPI.cursosConteudo.create(dados);
      
      if (!resultado || resultado.success === false) {
        const erroMsg = resultado?.error || 'Erro desconhecido ao criar curso';
        mostrarSnackbar(`Erro ao criar curso: ${erroMsg}`, 'error');
        console.error('❌ Erro ao criar curso:', resultado);
        return;
      }

      mostrarSnackbar('Curso criado com sucesso. Adicione módulos, temas e aulas para completá-lo.');
      fecharModalCursoAposSalvar();
      // Recarregar cursos imediatamente após salvar
      carregarCursos();
    } catch (error) {
      console.error('Erro ao salvar curso vazio:', error);
      mostrarSnackbar(`Erro ao salvar curso: ${error.message}`, 'error');
    }
  };

  const salvarCurso = async () => {
    try {
      let dados = {
        cursoClasse: formCurso.cursoClasse,
        cursoNome: formCurso.cursoNome,
        cursoDescription: formCurso.cursoDescription || null, // Garantir inclusão explícita (null se vazio)
        courseOrder: formCurso.courseOrder,
        isActive: formCurso.isActive,
        modules: formCurso.modules || [], // Garantir array vazio se não houver módulos
        createdBy: user?.email || user?._userMail || 'admin@velotax.com.br',
        version: cursoEditando ? (cursoEditando.version || 1) + 1 : 1
      };
      
      // Validar e limpar dados antes de enviar apenas se houver módulos
      // Se não houver módulos, manter array vazio
      if (dados.modules && dados.modules.length > 0) {
        dados = validarELimparCurso(dados);
      }
      
      // DEBUG: Verificar se cursoDescription está presente antes de enviar
      console.log('Dados finais antes de enviar:', dados);
      console.log('cursoDescription:', dados.cursoDescription);
      console.log('Módulos:', dados.modules?.length || 0);
      
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
    clearPendingTrofeuModulo();
    setCursoContexto(curso);
    
    // Verificar se é curso temporário (sem _id) ou curso existente
    const isCursoTemporario = !curso._id;
    
    if (modulo) {
      setModuloEditando(modulo);
      setFormModulo({
        moduleId: modulo.moduleId || '',
        moduleNome: modulo.moduleNome || '',
        isActive: modulo.isActive !== undefined ? modulo.isActive : true,
        moduleTrophyIconUrl: typeof modulo.moduleTrophyIconUrl === 'string' ? modulo.moduleTrophyIconUrl : '',
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
        moduleTrophyIconUrl: '',
        sections: []
      });
    }
    setModalModuloAberto(true);
  };
  
  // Função para fechar modal de módulo após salvar (sem verificar cancelamento)
  const fecharModalModuloAposSalvar = () => {
    clearPendingTrofeuModulo();
    setModalModuloAberto(false);
    setModuloEditando(null);
    // Não limpar cursoContexto quando está salvando módulo temporário
    // para permitir continuar adicionando mais módulos depois
  };

  const fecharModalModulo = () => {
    if (cursoTemporario) {
      // Se está em fluxo de criação, pedir confirmação
      if (!confirmarCancelamento()) {
        return; // Dialog será exibido
      }
    }
    clearPendingTrofeuModulo();
    setModalModuloAberto(false);
    setModuloEditando(null);
    if (!cursoTemporario) {
      setCursoContexto(null);
    }
  };

  // Função para voltar ao modal de Curso
  const voltarParaCurso = async () => {
    if (!cursoTemporario) return;
    
    // Salvar dados do módulo atual antes de voltar
    if (formModulo.moduleId && formModulo.moduleNome) {
      let trophyUrl = formModulo.moduleTrophyIconUrl || '';
      try {
        trophyUrl = await flushPendingModuloTrophy(pendingTrofeuModulo, formModulo);
      } catch {
        return;
      }
      const moduloAtualizado = {
        moduleId: formModulo.moduleId,
        moduleNome: formModulo.moduleNome,
        isActive: formModulo.isActive,
        moduleTrophyIconUrl: trophyUrl,
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
  const proximoPassoModulo = async () => {
    // Validar campos obrigatórios
    if (!formModulo.moduleId || !formModulo.moduleId.trim()) {
      mostrarSnackbar('ID do módulo é obrigatório', 'error');
      return;
    }
    if (!formModulo.moduleNome || !formModulo.moduleNome.trim()) {
      mostrarSnackbar('Nome do módulo é obrigatório', 'error');
      return;
    }

    let trophyUrl = formModulo.moduleTrophyIconUrl || '';
    try {
      trophyUrl = await flushPendingModuloTrophy(pendingTrofeuModulo, formModulo);
    } catch {
      return;
    }

    // Criar objeto temporário do módulo
    const moduloTemp = {
      moduleId: formModulo.moduleId,
      moduleNome: formModulo.moduleNome,
      isActive: formModulo.isActive,
      moduleTrophyIconUrl: trophyUrl,
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
  
  // Função para salvar módulo no curso temporário sem seguir para o próximo passo
  const salvarModuloTemporario = async () => {
    // Validar campos obrigatórios
    if (!formModulo.moduleId || !formModulo.moduleId.trim()) {
      mostrarSnackbar('ID do módulo é obrigatório', 'error');
      return;
    }
    if (!formModulo.moduleNome || !formModulo.moduleNome.trim()) {
      mostrarSnackbar('Nome do módulo é obrigatório', 'error');
      return;
    }

    let trophyUrl = formModulo.moduleTrophyIconUrl || '';
    try {
      trophyUrl = await flushPendingModuloTrophy(pendingTrofeuModulo, formModulo);
    } catch {
      return;
    }

    // Criar objeto temporário do módulo
    const moduloTemp = {
      moduleId: formModulo.moduleId,
      moduleNome: formModulo.moduleNome,
      isActive: formModulo.isActive,
      moduleTrophyIconUrl: trophyUrl,
      sections: []
    };

    // Adicionar módulo ao curso temporário
    const cursoAtualizado = {
      ...cursoTemporario,
      modules: [...(cursoTemporario.modules || []), moduloTemp]
    };

    setCursoTemporario(cursoAtualizado);
    mostrarSnackbar('Módulo adicionado ao curso temporário');
    fecharModalModuloAposSalvar();
  };

  const salvarModulo = async () => {
    try {
      const curso = cursoContexto;
      
      // Se está em fluxo de criação (curso temporário), apenas adicionar ao temporário
      if (cursoTemporario && !curso._id) {
        await salvarModuloTemporario();
        return;
      }
      
      // Se é curso existente, salvar no banco
      const modulos = [...(curso.modules || [])];
      
      let trophyUrl = formModulo.moduleTrophyIconUrl || '';
      try {
        trophyUrl = await flushPendingModuloTrophy(pendingTrofeuModulo, formModulo);
      } catch {
        return;
      }

      // Garantir que o módulo tenha sections como array vazio se não especificado
      const moduloParaSalvar = {
        ...formModulo,
        moduleTrophyIconUrl: trophyUrl,
        sections: formModulo.sections || []
      };
      
      if (moduloEditando) {
        const index = modulos.findIndex(m => m.moduleId === moduloEditando.moduleId);
        if (index >= 0) {
          modulos[index] = { ...modulos[index], ...moduloParaSalvar };
        }
      } else {
        modulos.push(moduloParaSalvar);
      }
      
      // Enviar apenas os campos necessários, não o curso inteiro
      await academyAPI.cursosConteudo.update(curso._id, {
        modules: modulos,
        version: (curso.version || 1) + 1
      });
      
      mostrarSnackbar('Módulo salvo com sucesso');
      fecharModalModulo();
      carregarCursos();
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
      mostrarSnackbar(`Erro ao salvar módulo: ${error.message}`, 'error');
    }
  };
  
  const excluirModulo = async (curso, moduloId) => {
    // Validar se é o último módulo
    if (curso.modules && curso.modules.length === 1) {
      mostrarSnackbar('Não é possível excluir o último módulo. O curso deve ter pelo menos um módulo.', 'error');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        const modulos = curso.modules.filter(m => m.moduleId !== moduloId);
        
        // Validar novamente antes de enviar
        if (modulos.length === 0) {
          mostrarSnackbar('Não é possível excluir o último módulo. O curso deve ter pelo menos um módulo.', 'error');
          return;
        }
        
        await academyAPI.cursosConteudo.update(curso._id, {
          modules: modulos,
          version: (curso.version || 1) + 1
        });
        mostrarSnackbar('Módulo excluído com sucesso');
        carregarCursos();
      } catch (error) {
        console.error('Erro ao excluir módulo:', error);
        const erroMsg = error.message || 'Erro ao excluir módulo';
        mostrarSnackbar(`Erro ao excluir módulo: ${erroMsg}`, 'error');
      }
    }
  };
  
  // Handlers de Tema
  const abrirModalTema = (curso, modulo, tema = null) => {
    clearPendingTrofeuTema();
    setCursoContexto(curso);
    setModuloContexto(modulo);
    
    // Verificar se é módulo temporário (dentro de curso temporário)
    const isModuloTemporario = cursoTemporario && moduloTemporario && modulo.moduleId === moduloTemporario.moduleId;
    
    if (tema) {
      setTemaEditando(tema);
      const trof = normalizeTemaTrophyFields(tema);
      setFormTema({
        temaNome: tema.temaNome || '',
        temaOrder: tema.temaOrder || 1,
        isActive: tema.isActive !== undefined ? tema.isActive : true,
        hasQuiz: tema.hasQuiz || false,
        quizId: tema.hasQuiz ? temaNomeToQuizId(tema.temaNome || '') : '',
        temaTrophyIconUrlBronze: trof.temaTrophyIconUrlBronze,
        temaTrophyIconUrlPrata: trof.temaTrophyIconUrlPrata,
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
        temaTrophyIconUrlBronze: '',
        temaTrophyIconUrlPrata: '',
        lessons: []
      });
    }
    setModalTemaAberto(true);
  };
  
  // Função para fechar modal de tema após salvar (sem verificar cancelamento)
  const fecharModalTemaAposSalvar = () => {
    clearPendingTrofeuTema();
    setModalTemaAberto(false);
    setModalQuizAberto(false);
    setQuizFormQuestoes([]);
    setTemaEditando(null);
    // Não limpar contexto quando está salvando tema temporário
    // para permitir continuar adicionando mais temas depois
  };

  const fecharModalTema = () => {
    if (cursoTemporario) {
      // Se está em fluxo de criação, pedir confirmação
      if (!confirmarCancelamento()) {
        return; // Dialog será exibido
      }
    }
    clearPendingTrofeuTema();
    setModalTemaAberto(false);
    setModalQuizAberto(false);
    setQuizFormQuestoes([]);
    setTemaEditando(null);
    if (!cursoTemporario) {
      setModuloContexto(null);
    }
  };

  // Função para voltar ao modal de Módulo
  const voltarParaModulo = async () => {
    if (!cursoTemporario || !moduloTemporario) return;
    
    // Salvar dados do tema atual antes de voltar
    if (formTema.temaNome) {
      let bronze = formTema.temaTrophyIconUrlBronze || '';
      let prata = formTema.temaTrophyIconUrlPrata || '';
      try {
        const urls = await flushPendingTemaTrophies(pendingTrofeuBronze, pendingTrofeuPrata, formTema);
        bronze = urls.bronze;
        prata = urls.prata;
      } catch {
        return;
      }
      const temaAtualizado = stripLegacyTemaTrophyUrl({
        temaNome: formTema.temaNome,
        temaOrder: formTema.temaOrder,
        isActive: formTema.isActive,
        hasQuiz: formTema.hasQuiz || false,
        quizId: formTema.hasQuiz ? temaNomeToQuizId(formTema.temaNome) : '',
        temaTrophyIconUrlBronze: bronze,
        temaTrophyIconUrlPrata: prata,
        lessons: temaTemporario?.lessons || []
      });
      
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
      moduleTrophyIconUrl: moduloTemporario.moduleTrophyIconUrl || '',
      sections: moduloTemporario.sections || []
    });
    
    setModalModuloAberto(true);
  };

  // Função para avançar para próximo passo (Tema → Aula)
  const proximoPassoTema = async () => {
    // Validar campos obrigatórios
    if (!formTema.temaNome || !formTema.temaNome.trim()) {
      mostrarSnackbar('Nome do tema é obrigatório', 'error');
      return;
    }
    if (!formTema.temaOrder || formTema.temaOrder < 1) {
      mostrarSnackbar('Ordem do tema deve ser maior que zero', 'error');
      return;
    }

    let bronze = formTema.temaTrophyIconUrlBronze || '';
    let prata = formTema.temaTrophyIconUrlPrata || '';
    try {
      const urls = await flushPendingTemaTrophies(pendingTrofeuBronze, pendingTrofeuPrata, formTema);
      bronze = urls.bronze;
      prata = urls.prata;
    } catch {
      return;
    }

    // Criar objeto temporário do tema
    const temaTemp = stripLegacyTemaTrophyUrl({
      temaNome: formTema.temaNome,
      temaOrder: formTema.temaOrder,
      isActive: formTema.isActive,
      hasQuiz: formTema.hasQuiz || false,
      quizId: formTema.hasQuiz ? temaNomeToQuizId(formTema.temaNome) : '',
      temaTrophyIconUrlBronze: bronze,
      temaTrophyIconUrlPrata: prata,
      lessons: []
    });

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
  
  // Função para salvar tema no módulo temporário sem seguir para o próximo passo
  const salvarTemaTemporario = async () => {
    // Validar campos obrigatórios
    if (!formTema.temaNome || !formTema.temaNome.trim()) {
      mostrarSnackbar('Nome do tema é obrigatório', 'error');
      return;
    }
    if (!formTema.temaOrder || formTema.temaOrder < 1) {
      mostrarSnackbar('Ordem do tema deve ser maior que zero', 'error');
      return;
    }

    let bronze = formTema.temaTrophyIconUrlBronze || '';
    let prata = formTema.temaTrophyIconUrlPrata || '';
    try {
      const urls = await flushPendingTemaTrophies(pendingTrofeuBronze, pendingTrofeuPrata, formTema);
      bronze = urls.bronze;
      prata = urls.prata;
    } catch {
      return;
    }

    // Criar objeto temporário do tema
    const temaTemp = stripLegacyTemaTrophyUrl({
      temaNome: formTema.temaNome,
      temaOrder: formTema.temaOrder,
      isActive: formTema.isActive,
      hasQuiz: formTema.hasQuiz || false,
      quizId: formTema.hasQuiz ? temaNomeToQuizId(formTema.temaNome) : '',
      temaTrophyIconUrlBronze: bronze,
      temaTrophyIconUrlPrata: prata,
      lessons: []
    });

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
    mostrarSnackbar('Tema adicionado ao módulo temporário');
    fecharModalTemaAposSalvar();
  };

  const salvarTema = async () => {
    try {
      const curso = cursoContexto;
      const modulo = moduloContexto;
      
      // Se está em fluxo de criação (curso temporário), apenas adicionar ao temporário
      if (cursoTemporario && !curso._id) {
        await salvarTemaTemporario();
        return;
      }
      
      // Se é curso existente, salvar no banco
      const modulos = [...curso.modules];
      const moduloIndex = modulos.findIndex(m => m.moduleId === modulo.moduleId);
      
      if (moduloIndex >= 0) {
        const sections = [...(modulos[moduloIndex].sections || [])];
        
        let bronze = formTema.temaTrophyIconUrlBronze || '';
        let prata = formTema.temaTrophyIconUrlPrata || '';
        try {
          const urls = await flushPendingTemaTrophies(pendingTrofeuBronze, pendingTrofeuPrata, formTema);
          bronze = urls.bronze;
          prata = urls.prata;
        } catch {
          return;
        }

        // Garantir que o tema tenha lessons como array vazio se não especificado
        const temaParaSalvar = stripLegacyTemaTrophyUrl({
          ...formTema,
          temaTrophyIconUrlBronze: bronze,
          temaTrophyIconUrlPrata: prata,
          lessons: formTema.lessons || [],
          quizId: formTema.hasQuiz ? temaNomeToQuizId(formTema.temaNome) : ''
        });
        
        if (temaEditando) {
          const temaIndex = sections.findIndex(t => t.temaNome === temaEditando.temaNome);
          if (temaIndex >= 0) {
            sections[temaIndex] = stripLegacyTemaTrophyUrl({
              ...sections[temaIndex],
              ...temaParaSalvar
            });
          }
        } else {
          sections.push(temaParaSalvar);
        }
        
        modulos[moduloIndex] = { ...modulos[moduloIndex], sections };
        
        await academyAPI.cursosConteudo.update(curso._id, {
          modules: modulos,
          version: (curso.version || 1) + 1
        });
        
        mostrarSnackbar('Tema salvo com sucesso');
        fecharModalTema();
        carregarCursos();
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      mostrarSnackbar(`Erro ao salvar tema: ${error.message}`, 'error');
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
    const trofT = normalizeTemaTrophyFields(temaTemporario);
    setFormTema({
      temaNome: temaTemporario.temaNome,
      temaOrder: temaTemporario.temaOrder,
      isActive: temaTemporario.isActive,
      hasQuiz: temaTemporario.hasQuiz || false,
      quizId: temaTemporario.hasQuiz ? temaNomeToQuizId(temaTemporario.temaNome || '') : '',
      temaTrophyIconUrlBronze: trofT.temaTrophyIconUrlBronze,
      temaTrophyIconUrlPrata: trofT.temaTrophyIconUrlPrata,
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
        console.log('Módulos:', dadosParaSalvar.modules?.length || 0);
        
        // Validar que há pelo menos um módulo antes de salvar
        if (!dadosParaSalvar.modules || dadosParaSalvar.modules.length === 0) {
          mostrarSnackbar('Erro: Curso deve ter pelo menos um módulo com seção e aula válidos', 'error');
          console.error('Erro: Nenhum módulo válido após validação');
          return;
        }

        // Salvar curso completo no MongoDB
        console.log('📤 Enviando dados para API...');
        let resultado;
        try {
          resultado = await academyAPI.cursosConteudo.create(dadosParaSalvar);
          console.log('📥 Resposta completa da API:', resultado);
        } catch (error) {
          console.error('❌ Erro ao chamar API:', error);
          mostrarSnackbar(`Erro ao criar curso: ${error.message}`, 'error');
          return;
        }
        
        // Verificar se houve erro na criação
        if (!resultado) {
          mostrarSnackbar('Erro: Resposta vazia da API ao criar curso', 'error');
          console.error('❌ Erro: Resposta vazia da API');
          return;
        }
        
        // A API retorna { success: true, data: {...} } quando sucesso
        // ou { success: false, error: '...' } quando erro
        if (resultado.success === false) {
          const erroMsg = resultado.error || 'Erro desconhecido ao criar curso';
          mostrarSnackbar(`Erro ao criar curso: ${erroMsg}`, 'error');
          console.error('❌ Erro ao criar curso:', resultado);
          return;
        }
        
        // Verificar se há dados do curso salvo
        const cursoSalvo = resultado.data;
        if (!cursoSalvo) {
          mostrarSnackbar('Erro: Curso não foi retornado pela API após criação', 'error');
          console.error('❌ Erro: Nenhum dado de curso retornado:', resultado);
          return;
        }
        
        console.log('✅ Curso salvo com sucesso!');
        console.log('   ID:', cursoSalvo._id || cursoSalvo.id);
        console.log('   Nome:', cursoSalvo.cursoNome);
        console.log('   Módulos:', cursoSalvo.modules?.length || 0);
        
        // Limpar todos os estados temporários
        limparEstadosTemporarios();
        setModalAulaAberto(false);
        setCursoContexto(null);
        setModuloContexto(null);
        setTemaContexto(null);
        setAulaEditando(null);
        
        mostrarSnackbar('Curso criado com sucesso');
        
        // Recarregar cursos imediatamente após salvar
        console.log('🔄 Recarregando cursos do servidor...');
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
            <Tab label="Recentes" />
          </Tabs>
        </Box>
      </Box>
      
      {/* Conteúdo Principal */}
      {activeTab === 0 && (
        <Box>
            {/* Barra de Controle - Container Padrão Primário */}
            <Card 
              className="velohub-container academy-filtro-bar"
              sx={{ 
                backgroundColor: 'var(--cor-container)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                padding: '12px 24px',
                marginBottom: '24px',
                mx: 0,
                transition: 'none !important'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <FormControl className="academy-filtro-select" sx={{ minWidth: 200 }}>
                  <InputLabel sx={{ 
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: 'var(--blue-medium)',
                    },
                  }}>Classe</InputLabel>
                  <Select
                    value={filtroClasse}
                    onChange={(e) => setFiltroClasse(e.target.value)}
                    label="Classe"
                    sx={{ 
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--cor-container)',
                      '& .MuiSelect-select': {
                        color: 'var(--gray)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.15)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--blue-medium)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--blue-medium)',
                      },
                    }}
                  >
                    {classes.map(classe => (
                      <MenuItem key={classe} value={classe} sx={{ 
                        fontSize: '0.875rem',
                        color: 'var(--gray)',
                      }}>{classe}</MenuItem>
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
                        className="academy-card"
                        sx={{ 
                          cursor: isExpanded ? 'default' : 'pointer',
                          backgroundColor: 'var(--cor-card)', /* Usa variável CSS que muda com tema */
                          transition: isExpanded 
                            ? 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: cursoSelecionado?._id === curso._id && isExpanded ? '1px solid var(--blue-medium) !important' : cursoSelecionado?._id === curso._id ? '2px solid var(--blue-medium) !important' : '1px solid transparent !important',
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
                          maxHeight: isExpanded ? 'calc(100vh - 40px)' : 'none',
                          overflowY: isExpanded ? 'auto' : 'hidden',
                          overflowX: isExpanded ? 'hidden' : 'hidden',
                          pointerEvents: 'auto',
                          '&:hover': {
                            boxShadow: isExpanded ? 8 : 4,
                            border: cursoSelecionado?._id === curso._id && isExpanded ? '1px solid var(--blue-medium) !important' : cursoSelecionado?._id === curso._id ? '2px solid var(--blue-medium) !important' : '1px solid var(--blue-medium) !important',
                            transform: isExpanded ? 'translate(-50%, -50%) !important' : 'none'
                          }
                        }}
                        onClick={() => {
                          setCursoSelecionado(curso);
                        }}
                      >
                        <CardContent sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          p: 2,
                          overflow: isExpanded ? 'visible' : 'visible',
                        }}>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                              <Typography variant="h6" sx={{ 
                                fontFamily: 'Poppins', 
                                fontWeight: 600, 
                                flex: 1, 
                                fontSize: '0.95rem',
                                color: 'var(--gray)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: '1.4',
                                minHeight: '2.8em',
                                maxHeight: '2.8em',
                              }}>
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
                            maxHeight: isExpanded ? 'none' : '0',
                            overflow: isExpanded ? 'visible' : 'hidden',
                            transition: isExpanded 
                              ? 'opacity 0.4s ease 0.1s, border-top 0.3s ease'
                              : 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, border-top 0.3s ease',
                            opacity: isExpanded ? 1 : 0,
                            borderTop: isExpanded ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid transparent',
                            transform: 'translateZ(0)', // Aceleração de hardware
                            willChange: isExpanded ? 'opacity' : 'max-height, opacity' // Otimização de performance
                          }}
                        >
                          {isExpanded && (
                            <CardContent sx={{ 
                              pt: 2, 
                              pb: 2,
                              overflow: 'visible',
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
                                        backgroundColor: 'var(--cor-container)',
                                        border: '1px solid rgba(0, 0, 0, 0.15) !important',
                                        '&:hover': {
                                          border: '1px solid var(--blue-medium) !important'
                                        },
                                        '&:before': {
                                          display: 'none',
                                        },
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
                                            sx={{ 
                                              mr: 1,
                                              color: 'var(--gray)',
                                            }}
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
                                          backgroundColor: 'var(--cor-container)',
                                          '&:hover': {
                                            backgroundColor: isSelecionado ? 'rgba(22, 52, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                          }
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                                          <Typography sx={{ color: 'var(--gray)' }}>{modulo.moduleNome}</Typography>
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
                                      <AccordionDetails sx={{ backgroundColor: 'var(--cor-container)' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                          <Typography variant="subtitle2" sx={{ color: 'var(--gray)' }}>Temas</Typography>
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
                                                    backgroundColor: 'var(--cor-container)',
                                                    border: isSelecionado ? '1.4px solid var(--blue-medium)' : '1px solid rgba(0, 0, 0, 0.15)',
                                                    '&:hover': {
                                                      border: isSelecionado ? '1.4px solid var(--blue-medium)' : '1px solid var(--blue-medium)',
                                                      backgroundColor: 'var(--cor-container)',
                                                    }
                                                  }}
                                                >
                                                  <CardContent sx={{ backgroundColor: 'var(--cor-container)' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <Typography variant="body1" sx={{ color: 'var(--gray)' }}>{tema.temaNome}</Typography>
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
                                          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                            Nenhum tema cadastrado
                                          </Typography>
                                        )}
                                      </AccordionDetails>
                                    </Accordion>
                                  );
                                })
                              ) : (
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
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
            {/* Subcategorias: Aprovações e Reprovações */}
            <Box sx={{ mb: 3 }}>
              <Tabs 
                value={progressoSubTab} 
                onChange={handleProgressoSubTabChange}
                aria-label="progresso sub tabs"
                sx={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  mb: 2,
                  '& .MuiTab-root': {
                    fontSize: '0.95rem',
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    textTransform: 'none',
                    minHeight: 40,
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
                <Tab label="Aprovações" />
                <Tab label="Reprovações" />
              </Tabs>
            </Box>
            
            {/* Conteúdo das subcategorias */}
            {loadingProgresso ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : progressoSubTab === 0 ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 500, mb: 2 }}>
                  Aprovações ({aprovacoes.length})
                </Typography>
                {aprovacoes.length === 0 ? (
                  <Alert severity="info">Nenhuma aprovação encontrada</Alert>
                ) : (
                  <Box>
                    {Object.entries(agruparAprovacoesPorCurso()).map(([cursoNome, aprovacoesCurso]) => (
                      <Accordion 
                        key={cursoNome}
                        sx={{ 
                          mb: 1,
                          boxShadow: 'none',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          '&:before': { display: 'none' }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                              {cursoNome}
                            </Typography>
                            <Chip 
                              label={`${aprovacoesCurso.length} ${aprovacoesCurso.length === 1 ? 'aprovado' : 'aprovados'}`}
                              size="small"
                              sx={{ 
                                backgroundColor: 'var(--blue-light)',
                                color: 'white',
                                fontFamily: 'Poppins',
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {loadingFuncionarios ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : (
                            <List sx={{ width: '100%' }}>
                              {cruzarFuncionariosComAprovacoes(cursoNome).map(({ funcionario, aprovacao }, index) => (
                                <React.Fragment key={funcionario._id}>
                                  <ListItem
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2,
                                      py: 1,
                                      px: 2,
                                      backgroundColor: aprovacao ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                                      borderRadius: 1,
                                      mb: 0.5
                                    }}
                                  >
                                    <Box sx={{ width: '350px', flexShrink: 0 }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontFamily: 'Poppins', 
                                          fontWeight: 500,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {funcionario.colaboradorNome || '-'}
                                      </Typography>
                                    </Box>
                                    
                                    <Box sx={{ width: '120px', flexShrink: 0 }}>
                                      {aprovacao ? (
                                        <Chip
                                          label="Aprovado"
                                          size="small"
                                          sx={{
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            fontFamily: 'Poppins',
                                            fontWeight: 500,
                                            fontSize: '0.75rem'
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label="Sem aprovação"
                                          size="small"
                                          sx={{
                                            backgroundColor: '#e0e0e0',
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            fontFamily: 'Poppins',
                                            fontWeight: 400,
                                            fontSize: '0.75rem'
                                          }}
                                        />
                                      )}
                                    </Box>
                                    
                                    <Box sx={{ width: '80px', flexShrink: 0 }}>
                                      {aprovacao ? (
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontFamily: 'Poppins', 
                                            color: 'rgba(0, 0, 0, 0.7)'
                                          }}
                                        >
                                          {formatarNotaAcademy(aprovacao.finalGrade)}
                                        </Typography>
                                      ) : (
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontFamily: 'Poppins', 
                                            color: 'rgba(0, 0, 0, 0.4)'
                                          }}
                                        >
                                          -
                                        </Typography>
                                      )}
                                    </Box>
                                    
                                    <Box sx={{ width: '120px', flexShrink: 0 }}>
                                      {aprovacao ? (
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontFamily: 'Poppins', 
                                            color: 'rgba(0, 0, 0, 0.7)'
                                          }}
                                        >
                                          {aprovacao.date 
                                            ? new Date(aprovacao.date).toLocaleDateString('pt-BR')
                                            : aprovacao.createdAt 
                                              ? new Date(aprovacao.createdAt).toLocaleDateString('pt-BR')
                                              : '-'}
                                        </Typography>
                                      ) : (
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontFamily: 'Poppins', 
                                            color: 'rgba(0, 0, 0, 0.4)'
                                          }}
                                        >
                                          -
                                        </Typography>
                                      )}
                                    </Box>
                                    
                                    {aprovacao && aprovacao.certificateUrl && (
                                      <Box sx={{ ml: 'auto', flexShrink: 0 }}>
                                        <Button
                                          size="small"
                                          href={aprovacao.certificateUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ 
                                            textTransform: 'none',
                                            fontFamily: 'Poppins',
                                            fontSize: '0.75rem'
                                          }}
                                        >
                                          Certificado
                                        </Button>
                                      </Box>
                                    )}
                                  </ListItem>
                                  {index < cruzarFuncionariosComAprovacoes(cursoNome).length - 1 && <Divider />}
                                </React.Fragment>
                              ))}
                            </List>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 500, mb: 2 }}>
                  Reprovações ({reprovacoes.length})
                </Typography>
                {reprovacoes.length === 0 ? (
                  <Alert severity="info">Nenhuma reprovação encontrada</Alert>
                ) : (
                  <Box>
                    {Object.entries(agruparReprovacoesPorCurso()).map(([cursoNome, reprovacoesCurso]) => (
                      <Accordion 
                        key={cursoNome}
                        sx={{ 
                          mb: 1,
                          boxShadow: 'none',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          '&:before': { display: 'none' }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                              {cursoNome}
                            </Typography>
                            <Chip 
                              label={`${reprovacoesCurso.length} ${reprovacoesCurso.length === 1 ? 'reprovado' : 'reprovados'}`}
                              size="small"
                              sx={{ 
                                backgroundColor: '#f44336',
                                color: 'white',
                                fontFamily: 'Poppins',
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Nome</TableCell>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Email</TableCell>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Nota Final</TableCell>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Data</TableCell>
                                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Questões Erradas</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reprovacoesCurso.map((reprovacao) => (
                                  <TableRow key={reprovacao._id} hover>
                                    <TableCell>{reprovacao.name || '-'}</TableCell>
                                    <TableCell>{reprovacao.email || '-'}</TableCell>
                                    <TableCell>
                                      {formatarNotaAcademy(reprovacao.finalGrade)}
                                    </TableCell>
                                    <TableCell>
                                      {reprovacao.date 
                                        ? new Date(reprovacao.date).toLocaleDateString('pt-BR')
                                        : reprovacao.createdAt 
                                          ? new Date(reprovacao.createdAt).toLocaleDateString('pt-BR')
                                          : '-'}
                                    </TableCell>
                                    <TableCell>
                                      {reprovacao.wrongQuestions || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            {/* Filtro por data */}
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Data inicial"
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    minWidth: 180,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.15)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--blue-medium)' }
                  }}
                />
                <TextField
                  label="Data final"
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    minWidth: 180,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.15)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--blue-medium)' }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => { setFiltroDataInicio(''); setFiltroDataFim(''); }}
                  sx={{ fontFamily: 'Poppins', textTransform: 'none' }}
                >
                  Limpar filtro
                </Button>
              </Box>
            </Card>
            
            {/* Lista de recentes */}
            {loadingRecentes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (() => {
              const filtrados = recentesLista.filter(item => {
                const dataItem = item.date || item.createdAt;
                if (!dataItem) return true;
                const d = new Date(dataItem);
                const dia = d.toISOString().split('T')[0];
                if (filtroDataInicio && dia < filtroDataInicio) return false;
                if (filtroDataFim && dia > filtroDataFim) return false;
                return true;
              });
              return filtrados.length === 0 ? (
                <Alert severity="info">Nenhum registro encontrado</Alert>
              ) : (
                <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                  <List sx={{ py: 0 }}>
                    {filtrados.map((item, index) => {
                      const cursoNome = normalizarNomeCurso(item.courseName, item.courseId);
                      const dataFormatada = item.date || item.createdAt
                        ? new Date(item.date || item.createdAt).toLocaleDateString('pt-BR')
                        : '-';
                      const nota = formatarNotaAcademy(item.finalGrade);
                      const isAprovacao = item.tipo === 'aprovacao';
                      return (
                        <React.Fragment key={`${item._id}-${item.tipo}-${index}`}>
                          <ListItem
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              py: 1.5,
                              px: 2,
                              backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
                              borderBottom: index < filtrados.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'
                            }}
                          >
                            <Chip
                              label={isAprovacao ? 'Aprovado' : 'Reprovado'}
                              size="small"
                              sx={{
                                backgroundColor: isAprovacao ? '#15A237' : '#d32f2f',
                                color: 'white',
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                minWidth: 88
                              }}
                            />
                            <Box sx={{ minWidth: 100 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: 'rgba(0, 0, 0, 0.7)' }}>
                                {dataFormatada}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 60 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: 'rgba(0, 0, 0, 0.7)' }}>
                                {nota}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name || '-'}
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: 'rgba(0, 0, 0, 0.5)' }}>
                                {cursoNome}
                              </Typography>
                            </Box>
                            {isAprovacao && item.certificateUrl && (
                              <Button
                                size="small"
                                href={item.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontFamily: 'Poppins', textTransform: 'none', fontSize: '0.75rem' }}
                              >
                                Certificado
                              </Button>
                            )}
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Card>
              );
            })()}
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
              <InputLabel sx={{
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: 'var(--blue-medium)',
                },
              }}>Classe</InputLabel>
              <Select
                value={formCurso.cursoClasse}
                onChange={(e) => setFormCurso({ ...formCurso, cursoClasse: e.target.value })}
                label="Classe"
                sx={{
                  backgroundColor: 'var(--cor-container)',
                  '& .MuiSelect-select': {
                    color: 'var(--gray)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--blue-medium)',
                  },
                }}
              >
                {classes.filter(c => c !== 'Todas').map(classe => (
                  <MenuItem key={classe} value={classe} sx={{ color: 'var(--gray)' }}>{classe}</MenuItem>
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
          {emFluxoCriacao && (
            <Button 
              onClick={salvarCursoVazio} 
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Salvar
            </Button>
          )}
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
            <input
              ref={fileTrofeuModuloRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSelectTrofeuModulo}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<EmojiEvents />}
                  disabled={!!uploadingTrophy}
                  onClick={() => fileTrofeuModuloRef.current?.click()}
                >
                  {uploadingTrophy === 'modulo' ? 'A enviar…' : 'Troféu'}
                </Button>
                {pendingTrofeuModulo ? (
                  <Chip size="small" label="Pré-visualização local" variant="outlined" />
                ) : formModulo.moduleTrophyIconUrl ? (
                  <Chip size="small" label="Guardado no curso" color="primary" variant="outlined" />
                ) : null}
              </Box>
              {(pendingTrofeuModulo?.objectUrl || formModulo.moduleTrophyIconUrl) ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                  <Box
                    component="img"
                    src={
                      pendingTrofeuModulo?.objectUrl ||
                      academyTrophyProxyUrl(formModulo.moduleTrophyIconUrl)
                    }
                    alt="Pré-visualização troféu do módulo"
                    sx={{
                      maxHeight: 88,
                      maxWidth: 140,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid rgba(0,0,0,0.12)',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Remover imagem"
                    onClick={removerTrofeuModulo}
                    disabled={!!uploadingTrophy}
                  >
                    <Close />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
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
          {cursoTemporario && (
            <Button 
              onClick={salvarModuloTemporario} 
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Salvar
            </Button>
          )}
          <Button 
            onClick={cursoTemporario ? proximoPassoModulo : salvarModulo} 
            variant="contained"
          >
            {cursoTemporario ? 'Próximo' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Tema */}
      <Dialog 
        open={modalTemaAberto} 
        onClose={fecharModalTema} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            color: 'var(--gray)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'var(--gray)',
          backgroundColor: 'var(--cor-container)',
          fontFamily: 'Poppins',
        }}>
          {temaEditando ? 'Editar Tema' : 'Novo Tema'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--cor-container)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome do Tema"
              value={formTema.temaNome}
              onChange={(e) => setFormTema({ ...formTema, temaNome: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            <TextField
              label="Ordem"
              type="number"
              value={formTema.temaOrder}
              onChange={(e) => setFormTema({ ...formTema, temaOrder: parseInt(e.target.value) })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formTema.hasQuiz}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormTema({ ...formTema, hasQuiz: checked });
                      if (!checked) setModalQuizAberto(false);
                    }}
                    sx={{
                      color: 'var(--blue-medium)',
                      '&.Mui-checked': {
                        color: 'var(--blue-medium)',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: 'var(--gray)', fontFamily: 'Poppins' }}>
                    Tem Quiz
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              {formTema.hasQuiz && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={abrirModalQuiz}
                  sx={{
                    fontFamily: 'Poppins',
                    borderColor: 'var(--blue-medium)',
                    color: 'var(--blue-medium)',
                    '&:hover': {
                      borderColor: 'var(--blue-dark)',
                      backgroundColor: 'rgba(22, 52, 255, 0.08)',
                    },
                  }}
                >
                  Quiz
                </Button>
              )}
            </Box>
            <input
              ref={fileTrofeuBronzeRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSelectTrofeuBronze}
            />
            <input
              ref={fileTrofeuPrataRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSelectTrofeuPrata}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                pt: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'rgba(0, 0, 0, 0.6)', fontFamily: 'Poppins' }}
              >
                Ícones de conquista (tema)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={!!uploadingTrophy}
                    startIcon={<EmojiEvents />}
                    endIcon={<ExpandMore />}
                    onClick={(e) => setTrofeuTemasMenuBronzeAnchor(e.currentTarget)}
                    aria-haspopup="menu"
                    aria-expanded={Boolean(trofeuTemasMenuBronzeAnchor)}
                    sx={{
                      fontFamily: 'Poppins',
                      borderColor: 'var(--blue-medium)',
                      color: 'var(--blue-medium)',
                      '&:hover': {
                        borderColor: 'var(--blue-dark)',
                        backgroundColor: 'rgba(22, 52, 255, 0.08)',
                      },
                    }}
                  >
                    {uploadingTrophy === 'bronze' ? 'Enviando…' : 'Troféu Bronze'}
                  </Button>
                  <Menu
                    anchorEl={trofeuTemasMenuBronzeAnchor}
                    open={Boolean(trofeuTemasMenuBronzeAnchor)}
                    onClose={() => setTrofeuTemasMenuBronzeAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{ sx: { fontFamily: 'Poppins' } }}
                  >
                    <MenuItem
                      onClick={() => {
                        setTrofeuTemasMenuBronzeAnchor(null);
                        fileTrofeuBronzeRef.current?.click();
                      }}
                    >
                      <Add sx={{ mr: 1, fontSize: 20, color: 'var(--blue-medium)' }} />
                      Adicionar novo
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setTrofeuTemasMenuBronzeAnchor(null);
                        abrirSelecaoTrofeuExistente('bronze');
                      }}
                    >
                      <PhotoLibrary sx={{ mr: 1, fontSize: 20, color: 'var(--blue-medium)' }} />
                      Selecionar existente
                    </MenuItem>
                  </Menu>
                  {pendingTrofeuBronze ? (
                    <Chip size="small" label="Prévia local" sx={{ fontFamily: 'Poppins' }} />
                  ) : formTema.temaTrophyIconUrlBronze ? (
                    <Chip size="small" label="Guardado" color="primary" variant="outlined" sx={{ fontFamily: 'Poppins' }} />
                  ) : null}
                </Box>
                {(pendingTrofeuBronze?.objectUrl || formTema.temaTrophyIconUrlBronze) ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                    <Box
                      component="img"
                      src={
                        pendingTrofeuBronze?.objectUrl ||
                        academyTrophyProxyUrl(formTema.temaTrophyIconUrlBronze)
                      }
                      alt="Pré-visualização troféu Bronze"
                      sx={{
                        maxHeight: 88,
                        maxWidth: 140,
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      }}
                    />
                    <IconButton
                      size="small"
                      aria-label="Remover Bronze"
                      onClick={removerTrofeuBronze}
                      disabled={!!uploadingTrophy}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ) : null}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={!!uploadingTrophy}
                    startIcon={<EmojiEvents />}
                    endIcon={<ExpandMore />}
                    onClick={(e) => setTrofeuTemasMenuPrataAnchor(e.currentTarget)}
                    aria-haspopup="menu"
                    aria-expanded={Boolean(trofeuTemasMenuPrataAnchor)}
                    sx={{
                      fontFamily: 'Poppins',
                      borderColor: 'var(--blue-medium)',
                      color: 'var(--blue-medium)',
                      '&:hover': {
                        borderColor: 'var(--blue-dark)',
                        backgroundColor: 'rgba(22, 52, 255, 0.08)',
                      },
                    }}
                  >
                    {uploadingTrophy === 'prata' ? 'Enviando…' : 'Troféu Prata'}
                  </Button>
                  <Menu
                    anchorEl={trofeuTemasMenuPrataAnchor}
                    open={Boolean(trofeuTemasMenuPrataAnchor)}
                    onClose={() => setTrofeuTemasMenuPrataAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{ sx: { fontFamily: 'Poppins' } }}
                  >
                    <MenuItem
                      onClick={() => {
                        setTrofeuTemasMenuPrataAnchor(null);
                        fileTrofeuPrataRef.current?.click();
                      }}
                    >
                      <Add sx={{ mr: 1, fontSize: 20, color: 'var(--blue-medium)' }} />
                      Adicionar novo
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setTrofeuTemasMenuPrataAnchor(null);
                        abrirSelecaoTrofeuExistente('prata');
                      }}
                    >
                      <PhotoLibrary sx={{ mr: 1, fontSize: 20, color: 'var(--blue-medium)' }} />
                      Selecionar existente
                    </MenuItem>
                  </Menu>
                  {pendingTrofeuPrata ? (
                    <Chip size="small" label="Prévia local" sx={{ fontFamily: 'Poppins' }} />
                  ) : formTema.temaTrophyIconUrlPrata ? (
                    <Chip size="small" label="Guardado" color="primary" variant="outlined" sx={{ fontFamily: 'Poppins' }} />
                  ) : null}
                </Box>
                {(pendingTrofeuPrata?.objectUrl || formTema.temaTrophyIconUrlPrata) ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                    <Box
                      component="img"
                      src={
                        pendingTrofeuPrata?.objectUrl ||
                        academyTrophyProxyUrl(formTema.temaTrophyIconUrlPrata)
                      }
                      alt="Pré-visualização troféu Prata"
                      sx={{
                        maxHeight: 88,
                        maxWidth: 140,
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      }}
                    />
                    <IconButton
                      size="small"
                      aria-label="Remover Prata"
                      onClick={removerTrofeuPrata}
                      disabled={!!uploadingTrophy}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'var(--cor-container)', px: 2.4, pb: 2.4 }}>
          {cursoTemporario && (
            <Button 
              onClick={voltarParaModulo}
              startIcon={<ArrowBack />}
              sx={{
                color: 'var(--gray)',
                fontFamily: 'Poppins',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              Voltar
            </Button>
          )}
          <Button 
            onClick={fecharModalTema}
            sx={{
              color: 'var(--gray)',
              fontFamily: 'Poppins',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancelar
          </Button>
          {cursoTemporario && (
            <Button 
              onClick={salvarTemaTemporario} 
              variant="outlined"
              sx={{ 
                mr: 1,
                fontFamily: 'Poppins',
                borderColor: 'rgba(0, 0, 0, 0.15)',
                color: 'var(--gray)',
                '&:hover': {
                  borderColor: 'var(--blue-medium)',
                  backgroundColor: 'rgba(22, 52, 255, 0.08)',
                },
              }}
            >
              Salvar
            </Button>
          )}
          <Button 
            onClick={cursoTemporario ? proximoPassoTema : salvarTema} 
            variant="contained"
            sx={{
              fontFamily: 'Poppins',
              backgroundColor: 'var(--blue-medium)',
              '&:hover': {
                backgroundColor: 'var(--blue-dark)',
              },
            }}
          >
            {cursoTemporario ? 'Próximo' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modalTrofeuExistenteOpen}
        onClose={fecharModalTrofeuExistente}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            color: 'var(--gray)',
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
          Selecionar troféu existente
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--cor-container)' }}>
          <Typography variant="body2" sx={{ mb: 2, fontFamily: 'Poppins', color: 'rgba(0,0,0,0.65)' }}>
            Imagens na pasta <strong>icones_conquistas/temas</strong> do bucket. Ao escolher, o URL é reutilizado (sem novo upload).
          </Typography>
          {loadingListaTrofeusTemasGcs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
            </Box>
          ) : listaTrofeusTemasGcs.length === 0 ? (
            <Typography sx={{ fontFamily: 'Poppins', py: 2 }}>
              Nenhuma imagem encontrada nesta pasta.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {listaTrofeusTemasGcs.map((item) => (
                <Grid item xs={6} sm={4} md={3} key={item.fileName}>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => aplicarTrofeuExistenteDoGcs(item.url)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        aplicarTrofeuExistenteDoGcs(item.url);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.12)',
                      borderRadius: 1,
                      p: 1,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transition: 'box-shadow 0.15s',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'var(--blue-medium)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={academyTrophyProxyUrl(item.url)}
                      alt=""
                      sx={{
                        width: '100%',
                        height: 100,
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Poppins',
                        display: 'block',
                        mt: 0.5,
                        wordBreak: 'break-all',
                        color: 'rgba(0,0,0,0.7)',
                      }}
                    >
                      {item.fileName.split('/').pop()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'var(--cor-container)', px: 2, pb: 2 }}>
          <Button onClick={fecharModalTrofeuExistente} sx={{ fontFamily: 'Poppins' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Quiz (tema com Tem Quiz) — quizId/quizID derivados do nome do tema (snake_case), não exibidos */}
      <Dialog
        open={modalQuizAberto}
        onClose={() => setModalQuizAberto(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            color: 'var(--gray)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          color: 'var(--gray)',
          backgroundColor: 'var(--cor-container)',
          fontFamily: 'Poppins',
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.35,
          py: 1.5,
        }}>
          Quiz
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--cor-container)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
            {quizFormLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
              </Box>
            ) : (
              <>
                {quizFormQuestoes.map((q, index) => (
                  <Box key={`quiz-q-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {index > 0 ? <Divider sx={{ my: 0.5 }} /> : null}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ color: 'var(--gray)', fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8125rem' }}>
                        Questão {index + 1}
                      </Typography>
                      <IconButton
                        type="button"
                        size="small"
                        onClick={() => removerQuestaoQuiz(index)}
                        aria-label="Remover questão"
                        sx={{
                          color: '#d32f2f',
                          '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <TextField
                      label="Pergunta"
                      value={q.pergunta}
                      onChange={(e) => atualizarQuestaoQuiz(index, 'pergunta', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      sx={outlineFieldSxQuizModal}
                    />
                    <TextField
                      label="Opção Correta"
                      value={q.opção1}
                      onChange={(e) => atualizarQuestaoQuiz(index, 'opção1', e.target.value)}
                      fullWidth
                      size="small"
                      sx={outlineFieldSxQuizModal}
                    />
                    <TextField
                      label="Opção adicional 1"
                      value={q.opção2}
                      onChange={(e) => atualizarQuestaoQuiz(index, 'opção2', e.target.value)}
                      fullWidth
                      size="small"
                      sx={outlineFieldSxQuizModal}
                    />
                    <TextField
                      label="Opção adicional 2"
                      value={q.opção3}
                      onChange={(e) => atualizarQuestaoQuiz(index, 'opção3', e.target.value)}
                      fullWidth
                      size="small"
                      sx={outlineFieldSxQuizModal}
                    />
                    <TextField
                      label="Opção adicional 3"
                      value={q.opção4}
                      onChange={(e) => atualizarQuestaoQuiz(index, 'opção4', e.target.value)}
                      fullWidth
                      size="small"
                      sx={outlineFieldSxQuizModal}
                    />
                  </Box>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<Add sx={{ fontSize: '1.125rem' }} />}
                  onClick={adicionarQuestaoQuiz}
                  sx={{
                    alignSelf: 'flex-start',
                    mt: quizFormQuestoes.length > 0 ? 0.5 : 0,
                    fontFamily: 'Poppins',
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    py: 0.5,
                    px: 1.25,
                    borderColor: 'var(--blue-medium)',
                    color: 'var(--blue-medium)',
                    '&:hover': {
                      borderColor: 'var(--blue-dark)',
                      backgroundColor: 'rgba(22, 52, 255, 0.08)',
                    },
                  }}
                >
                  Questão
                </Button>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: 'var(--cor-container)',
            px: 2,
            pb: 2,
            pt: 0.5,
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Button
            size="small"
            onClick={() => setModalQuizAberto(false)}
            sx={{
              color: 'var(--gray)',
              fontFamily: 'Poppins',
              fontSize: '0.8125rem',
              textTransform: 'none',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
            }}
          >
            Fechar
          </Button>
          <Box sx={{ flex: '1 1 12px' }} />
          <Button
            variant="contained"
            size="small"
            disabled={!podeSalvarQuiz || salvandoQuiz || quizFormLoading}
            onClick={salvarQuizConteudoModal}
            sx={{
              fontFamily: 'Poppins',
              fontSize: '0.8125rem',
              textTransform: 'none',
              backgroundColor: 'var(--blue-medium)',
              '&:hover': { backgroundColor: 'var(--blue-dark)' },
            }}
          >
            {salvandoQuiz ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Aulas */}
      <Dialog 
        open={modalAulaAberto} 
        onClose={fecharModalAula} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--cor-container)',
            color: 'var(--gray)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'var(--gray)',
          backgroundColor: 'var(--cor-container)',
          fontFamily: 'Poppins',
        }}>
          {aulaEditando ? 'Editar Aula' : 'Nova Aula'} - {temaContexto?.temaNome}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--cor-container)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="ID da Aula"
              value={formAula.lessonId}
              onChange={(e) => setFormAula({ ...formAula, lessonId: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: 'var(--blue-medium)',
                },
              }}>Tipo de Aula</InputLabel>
              <Select
                value={formAula.lessonTipo}
                onChange={(e) => setFormAula({ ...formAula, lessonTipo: e.target.value })}
                label="Tipo de Aula"
                sx={{
                  backgroundColor: 'var(--cor-container)',
                  '& .MuiSelect-select': {
                    color: 'var(--gray)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--blue-medium)',
                  },
                }}
              >
                {tiposAula.map(tipo => (
                  <MenuItem key={tipo} value={tipo} sx={{ color: 'var(--gray)' }}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Título da Aula"
              value={formAula.lessonTitulo}
              onChange={(e) => setFormAula({ ...formAula, lessonTitulo: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            <TextField
              label="Ordem"
              type="number"
              value={formAula.lessonOrdem}
              onChange={(e) => setFormAula({ ...formAula, lessonOrdem: parseInt(e.target.value) })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            
            {/* Seção de Conteúdos/Vídeos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: 'var(--gray)' }}>
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
                  sx={{ 
                    fontSize: '0.875rem',
                    fontFamily: 'Poppins',
                    color: 'var(--blue-medium)',
                    borderColor: 'var(--blue-medium)',
                    '&:hover': {
                      borderColor: 'var(--blue-medium)',
                      backgroundColor: 'rgba(22, 52, 255, 0.08)',
                    },
                  }}
                  variant="outlined"
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--cor-container)',
                        color: 'var(--gray)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.15)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '& input': {
                          color: 'var(--gray)',
                          '&::placeholder': {
                            color: 'rgba(0, 0, 0, 0.5)',
                            opacity: 1,
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: 'var(--blue-medium)',
                        },
                      },
                    }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            <TextField
              label="YouTube ID (opcional)"
              value={formAula.youtubeId}
              onChange={(e) => setFormAula({ ...formAula, youtubeId: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--cor-container)',
                  color: 'var(--gray)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--blue-medium)',
                  },
                  '& input': {
                    color: 'var(--gray)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'var(--blue-medium)',
                  },
                },
              }}
            />
            
            {/* Lista de Aulas Existentes */}
            {temaContexto?.lessons && temaContexto.lessons.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--gray)' }}>Aulas Existentes</Typography>
                <List sx={{ backgroundColor: 'var(--cor-container)' }}>
                  {temaContexto.lessons.map((aula, index) => (
                    <React.Fragment key={aula.lessonId || index}>
                      <ListItem sx={{ backgroundColor: 'var(--cor-container)' }}>
                        <ListItemText
                          primary={<Typography sx={{ color: 'var(--gray)' }}>{aula.lessonTitulo}</Typography>}
                          secondary={<Typography sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>{`${aula.lessonTipo} - Ordem: ${aula.lessonOrdem}`}</Typography>}
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
                      {index < temaContexto.lessons.length - 1 && <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.12)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'var(--cor-container)', px: 2.4, pb: 2.4 }}>
          {cursoTemporario && (
            <Button 
              onClick={voltarParaTema}
              startIcon={<ArrowBack />}
              sx={{
                color: 'var(--gray)',
                fontFamily: 'Poppins',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              Voltar
            </Button>
          )}
          <Button 
            onClick={fecharModalAula}
            sx={{
              color: 'var(--gray)',
              fontFamily: 'Poppins',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={salvarAula} 
            variant="contained"
            sx={{
              fontFamily: 'Poppins',
              backgroundColor: 'var(--blue-medium)',
              '&:hover': {
                backgroundColor: 'var(--blue-dark)',
              },
            }}
          >
            Salvar
          </Button>
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

