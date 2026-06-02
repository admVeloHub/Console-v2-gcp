// VERSION: v2.3.0 | DATE: 2026-05-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v2.3.0 - Atuações: modal Visibilidade (modulosVelohub) via botão Opções na lista; form só nome/descrição
// CHANGELOG: v2.2.1 - Resgates Adicionar: sem Box trophyPanelSx aninhado (um só nível no acordeão secundário)
// CHANGELOG: v2.2.0 - Acordeão Resgates (qa_resgate_items: item, xpPrice) — Adicionar / Gerenciar
// CHANGELOG: v2.1.5 - Correção sintaxe: restabelecer declaração `sectionTitleSx` removida por engano na v2.1.4
// CHANGELOG: v2.1.2 - Atuações: seta apenas inclui na fila local (rascunhos); só "Salvar" persiste API; reload de dados silent (accordion permanece aberto)
// CHANGELOG: v2.1.1 - Troféus Gerenciar: excluir troféu do catálogo
// CHANGELOG: v2.1.0 - Troféus: acordeões Adicionar e Gerenciar; catálogo qa_trophies_catalog; trocar troféu com prévia atual/novo
// CHANGELOG: v2.0.10 - Troféus: Classe de XP sem texto “Selecione” no campo (só floating label)
// CHANGELOG: v2.0.9 - Troféus: Classe de XP inicia vazio (Selecione…) até haver valor no doc ou escolha do utilizador
// CHANGELOG: v2.0.8 - Troféus: Classe de XP como dropdown (Baixo, Normal, Alto, Especial)
// CHANGELOG: v2.0.7 - Troféus: Título, Classe de XP e botão Troféu na mesma linha
// CHANGELOG: v2.0.6 - Troféus: removido campo URL; prévia de imagem (proxy mediabank) + remover miniatura como no Academy
// CHANGELOG: v2.0.5 - Troféus: único bloco sem acordeão/título interno (Box estilo container secundário)
// CHANGELOG: v2.0.4 - Atuações: botão seta (mesmo padrão); lista sempre exibe descrição (menor + itálica; fallback "Sem descrição")
// CHANGELOG: v2.0.3 - Secundárias Atuações/Escalas/Empresas/Feedback: layout 2 colunas (entrada à esquerda, lista à direita); título Funções→Atuações; feedback com Item+Descrição (persistência "título — descrição")
// CHANGELOG: v2.0.2 - Lista de funções: extrair array da resposta GET /qualidade/funcoes ({ data }) via extractQualidadeLista
// CHANGELOG: v2.0.1 - Containers secundários (acordeões internos) ajustados ao padrão do LAYOUT_GUIDELINES
// CHANGELOG: v2.0.0 - Página Gerenciar com acordeões: Atuações/Escalas/Empresas, Troféus e Feedback
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  ListItemButton,
  ListItemText,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { ArrowForward, Close, Delete, ExpandMore, MoreVert, Save } from '@mui/icons-material';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import { getFuncoes, addFuncao, updateFuncao, deleteFuncao, listValoresCampos, upsertCadastroCamposConfig, upsertFeedbackCatalogConfig, upsertQaTrophiesCatalog, extractQualidadeLista, getQaResgateItems, createQaResgateItem, updateQaResgateItem, deleteQaResgateItem } from '../services/qualidadeAPI';
import { uploadQaTrophyImage, getTrophyMediabankDisplayUrl } from '../services/uploadAPI';
import {
  MODULOS_VELOHUB_KEYS,
  MODULOS_VELOHUB_LABELS,
  modulosVelohubPadrao,
  normalizarModulosVelohubFromApi,
  contarModulosAtivos,
} from '../utils/modulosVelohub';

const sectionTitleSx = {
  fontFamily: 'Poppins',
  fontWeight: 600,
  color: 'var(--blue-dark)',
  fontSize: '0.96rem'
};

const listBoxSx = {
  border: '1px solid rgba(22, 52, 255, 0.15)',
  borderRadius: '4px',
  maxHeight: '220px',
  overflowY: 'auto'
};

const emptyListSx = {
  p: 1.2,
  fontFamily: 'Poppins',
  fontSize: '0.8rem',
  color: 'var(--gray)'
};

const secondaryAccordionSx = {
  background: 'transparent',
  border: '1.5px solid var(--blue-dark)',
  borderRadius: '4px',
  boxShadow: 'none',
  m: 1,
  '&::before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    m: 1
  }
};

const secondaryAccordionDetailsSx = {
  p: 2
};

/** Painel único de Troféus (sem acordeão interno): mesmo contorno do container secundário do guia. */
const trophyPanelSx = {
  background: 'transparent',
  border: '1.5px solid var(--blue-dark)',
  borderRadius: '4px',
  boxShadow: 'none',
  m: 1,
  p: 2
};

const catalogFieldMap = {
  destaques_itens: 'destaques',
  oportunidades_itens: 'oportunidades',
  apontamentos_itens: 'apontamentos',
};

const QA_TROPHY_XP_OPTIONS = ['Baixo', 'Normal', 'Alto', 'Especial'];

/** Valor para o Select ao carregar do Mongo: vazio se o campo não existir; legado numérico → rótulo. */
const normalizeTrophyXpClassFromDoc = (raw) => {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (s === '') return '';
  if (QA_TROPHY_XP_OPTIONS.includes(s)) return s;
  const n = Number(raw);
  if (Number.isFinite(n)) {
    const idx = Math.max(0, Math.min(QA_TROPHY_XP_OPTIONS.length - 1, Math.round(n)));
    return QA_TROPHY_XP_OPTIONS[idx];
  }
  return '';
};

/** Persistência: em branco no formulário grava como Normal no backend. */
const normalizeTrophyXpClassForSave = (raw) => {
  if (raw == null || String(raw).trim() === '') return 'Normal';
  const s = String(raw).trim();
  if (QA_TROPHY_XP_OPTIONS.includes(s)) return s;
  return 'Normal';
};

const generateNewTrophyId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `qa-tr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const mapRawToTrophyRow = (raw) => ({
  id: String(raw?.id || '').trim(),
  conquista_titulo: raw?.conquista_titulo != null ? String(raw.conquista_titulo) : '',
  conquista_legenda: raw?.conquista_legenda != null ? String(raw.conquista_legenda) : '',
  trophy_url: raw?.trophy_url != null ? String(raw.trophy_url).trim() : '',
  xpClass: normalizeTrophyXpClassForSave(raw?.xpClass)
});

const manageFieldsFromRow = (t) =>
  t
    ? {
        conquista_titulo: t.conquista_titulo || '',
        conquista_legenda: t.conquista_legenda || '',
        trophy_url: t.trophy_url || '',
        xpClass: normalizeTrophyXpClassFromDoc(t.xpClass)
      }
    : {
        conquista_titulo: '',
        conquista_legenda: '',
        trophy_url: '',
        xpClass: ''
      };

const trophyThumbSx = {
  maxHeight: 72,
  maxWidth: 120,
  objectFit: 'contain',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.12)',
  backgroundColor: 'rgba(0,0,0,0.02)',
  display: 'block'
};

const trophyPreviewLargeSx = {
  maxHeight: 88,
  maxWidth: 140,
  objectFit: 'contain',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.12)',
  backgroundColor: 'rgba(0,0,0,0.02)'
};

const CATALOG_TITLE_DESC_SEP = ' — ';

const initialCatalogState = {
  items: [],
  input: '',
  inputDesc: '',
  selectedIndex: -1
};

/** Exibe título/descrição a partir do valor salvo (array de strings; descrição opcional após separador). */
const splitCatalogStoredLine = (stored) => {
  const s = String(stored ?? '');
  const i = s.indexOf(CATALOG_TITLE_DESC_SEP);
  if (i === -1) return { primary: s, secondary: '' };
  return { primary: s.slice(0, i), secondary: s.slice(i + CATALOG_TITLE_DESC_SEP.length) };
};

/** Texto de descrição da atuação a partir do documento (API/Mongoose). */
const descricaoAtuacaoFromDoc = (doc) => {
  if (!doc || typeof doc !== 'object') return '';
  const raw = doc.descricao ?? doc.description ?? doc.Descricao;
  return String(raw ?? '').trim();
};

const twoColumnRowSx = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
  alignItems: 'flex-start'
};

const editorLeftColumnSx = {
  flex: { xs: '1 1 auto', md: '0 0 340px' },
  width: { xs: '100%', md: '340px' },
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.2
};

const editorRightColumnSx = {
  flex: 1,
  minWidth: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.2
};

const TEMP_ATUACAO_PREFIX = 'temp-atuacao-';

const isDraftAtuacaoId = (id) => id != null && String(id).startsWith(TEMP_ATUACAO_PREFIX);

const novoTempIdAtuacao = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? `${TEMP_ATUACAO_PREFIX}${crypto.randomUUID()}`
    : `${TEMP_ATUACAO_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const normalizeQaResgateRowsFromResponse = (payload) => {
  const arr = Array.isArray(payload?.data) ? payload.data : extractQualidadeLista(payload);
  if (!Array.isArray(arr)) return [];
  return arr
    .map((doc) => ({
      _id: doc?._id != null ? String(doc._id) : '',
      item: doc?.item != null ? String(doc.item).trim() : '',
      xpPrice: Number.isFinite(Number(doc?.xpPrice)) ? Number(doc.xpPrice) : 0,
      createdAt: doc?.createdAt,
      updatedAt: doc?.updatedAt
    }))
    .filter((r) => r._id);
};

const normalizeStringArray = (values) => {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  return values
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const QualidadeGerenciarPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [funcoes, setFuncoes] = useState([]);
  const [atuacoesRascunho, setAtuacoesRascunho] = useState([]);
  const [novaFuncao, setNovaFuncao] = useState({ funcao: '', descricao: '' });
  const [funcaoEditando, setFuncaoEditando] = useState(null);
  const [modalVisibilidadeAberto, setModalVisibilidadeAberto] = useState(false);
  const [atuacaoVisibilidade, setAtuacaoVisibilidade] = useState(null);
  const [visibilidadeDraft, setVisibilidadeDraft] = useState(() => modulosVelohubPadrao());

  const [escalasInput, setEscalasInput] = useState('');
  const [empresasInput, setEmpresasInput] = useState('');
  const [escalas, setEscalas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [escalaSelectedIndex, setEscalaSelectedIndex] = useState(-1);
  const [empresaSelectedIndex, setEmpresaSelectedIndex] = useState(-1);

  const [trophiesList, setTrophiesList] = useState([]);
  const trophiesListRef = useRef([]);
  const trophyManageIdRef = useRef('');

  const [trophyAdd, setTrophyAdd] = useState({
    conquista_titulo: '',
    conquista_legenda: '',
    xpClass: '',
    trophy_url: ''
  });
  const [trophyManageId, setTrophyManageId] = useState('');
  const [trophyManage, setTrophyManage] = useState(manageFieldsFromRow(null));
  /** Ficheiro escolhido para troca de troféu — prévia em blob até Salvar disparar upload. */
  const [trophyManageReplaceFile, setTrophyManageReplaceFile] = useState(null);
  const [trophyManageReplacePreviewUrl, setTrophyManageReplacePreviewUrl] = useState('');
  /** Nova troféu (Adicionar): ficheiro + blob prévia até Salvar enviar ao GCS. */
  const [trophyAddImageFile, setTrophyAddImageFile] = useState(null);
  const [trophyAddPreviewBlobUrl, setTrophyAddPreviewBlobUrl] = useState('');
  const [trophyUploading, setTrophyUploading] = useState(false);

  const [resgateList, setResgateList] = useState([]);
  const resgateSelectedIdRef = useRef('');
  const [resgateSelectedId, setResgateSelectedId] = useState('');
  const [resgateAdd, setResgateAdd] = useState({ item: '', xpPrice: '' });
  const [resgateManage, setResgateManage] = useState({ item: '', xpPrice: '' });

  useEffect(() => {
    resgateSelectedIdRef.current = resgateSelectedId;
  }, [resgateSelectedId]);

  useEffect(() => {
    trophiesListRef.current = trophiesList;
  }, [trophiesList]);

  useEffect(() => {
    trophyManageIdRef.current = trophyManageId;
  }, [trophyManageId]);

  const trophyBlobCleanupRef = useRef({ add: '', manage: '' });
  useEffect(() => {
    trophyBlobCleanupRef.current = {
      add: trophyAddPreviewBlobUrl,
      manage: trophyManageReplacePreviewUrl,
    };
  });
  useEffect(
    () => () => {
      const { add, manage } = trophyBlobCleanupRef.current;
      if (add) URL.revokeObjectURL(add);
      if (manage) URL.revokeObjectURL(manage);
    },
    []
  );

  const [feedbackCatalogs, setFeedbackCatalogs] = useState({
    destaques_itens: { ...initialCatalogState },
    oportunidades_itens: { ...initialCatalogState },
    apontamentos_itens: { ...initialCatalogState }
  });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const carregarDados = useCallback(async (options = {}) => {
    const silent = !!options.silent;
    if (!silent) setLoading(true);
    try {
      const [funcoesData, valoresData, resgatesRes] = await Promise.all([
        getFuncoes(),
        listValoresCampos(false),
        getQaResgateItems()
      ]);
      const docs = Array.isArray(valoresData?.data) ? valoresData.data : [];
      const docsById = docs.reduce((acc, doc) => {
        if (doc?.id) acc[doc.id] = doc;
        return acc;
      }, {});

      const cadastroCamposDoc = docsById.cadastro_campos || {};
      setEscalas(normalizeStringArray(cadastroCamposDoc.escalas));
      setEmpresas(normalizeStringArray(cadastroCamposDoc.empresas));

      const catalogDoc = docsById.qa_trophies_catalog;
      let trophyRows = Array.isArray(catalogDoc?.trophies)
        ? catalogDoc.trophies.map(mapRawToTrophyRow).filter((row) => row.id)
        : [];
      if (trophyRows.length === 0) {
        const leg = docsById.qa_trophy_config;
        if (leg && (leg.trophy_url || leg.conquista_titulo)) {
          trophyRows = [
            mapRawToTrophyRow({
              id: 'legacy-qa-trophy-config',
              conquista_titulo: leg.conquista_titulo,
              conquista_legenda: leg.conquista_legenda,
              xpClass: leg.xpClass,
              trophy_url: leg.trophy_url
            })
          ];
        }
      }
      setTrophiesList(trophyRows);
      const sel = trophyManageIdRef.current;
      if (sel && trophyRows.some((r) => r.id === sel)) {
        const t = trophyRows.find((r) => r.id === sel);
        setTrophyManage(manageFieldsFromRow(t));
        setTrophyManageReplaceFile(null);
        setTrophyManageReplacePreviewUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return '';
        });
      } else if (sel && !trophyRows.some((r) => r.id === sel)) {
        setTrophyManageId('');
        trophyManageIdRef.current = '';
        setTrophyManage(manageFieldsFromRow(null));
        setTrophyManageReplaceFile(null);
        setTrophyManageReplacePreviewUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return '';
        });
      }

      setFeedbackCatalogs({
        destaques_itens: {
          ...initialCatalogState,
          items: normalizeStringArray(docsById.destaques_itens?.destaques),
        },
        oportunidades_itens: {
          ...initialCatalogState,
          items: normalizeStringArray(docsById.oportunidades_itens?.oportunidades),
        },
        apontamentos_itens: {
          ...initialCatalogState,
          items: normalizeStringArray(docsById.apontamentos_itens?.apontamentos),
        }
      });

      setFuncoes(
        extractQualidadeLista(funcoesData).map((f) => ({
          ...f,
          modulosVelohub: normalizarModulosVelohubFromApi(f.modulosVelohub),
        }))
      );

      const resgateRows = normalizeQaResgateRowsFromResponse(resgatesRes);
      setResgateList(resgateRows);
      const rSel = resgateSelectedIdRef.current;
      if (rSel && resgateRows.some((r) => r._id === rSel)) {
        const r = resgateRows.find((row) => row._id === rSel);
        setResgateManage({ item: r.item, xpPrice: String(r.xpPrice) });
      } else if (rSel && !resgateRows.some((r) => r._id === rSel)) {
        setResgateSelectedId('');
        resgateSelectedIdRef.current = '';
        setResgateManage({ item: '', xpPrice: '' });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da aba Gerenciar:', error);
      showSnackbar('Erro ao carregar dados da aba Gerenciar.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const startSaving = () => setSaving(true);
  const stopSaving = () => setSaving(false);

  const handleIncluirAtuacaoNaLista = () => {
    const funcao = String(novaFuncao.funcao || '').trim();
    if (!funcao) {
      showSnackbar('Nome da atuação é obrigatório.', 'error');
      return;
    }
    const descricao = String(novaFuncao.descricao || '').trim();
    setAtuacoesRascunho((prev) => [
      ...prev,
      { tempId: novoTempIdAtuacao(), funcao, descricao }
    ]);
    setNovaFuncao({ funcao: '', descricao: '' });
    setFuncaoEditando(null);
  };

  const handleSalvarFuncao = async () => {
    const trimNome = (s) => String(s || '').trim();

    const editServerId = funcaoEditando?._id && !isDraftAtuacaoId(funcaoEditando._id) ? funcaoEditando._id : null;
    if (editServerId) {
      const funcao = trimNome(novaFuncao.funcao);
      if (!funcao) {
        showSnackbar('Nome da atuação é obrigatório.', 'error');
        return;
      }
      try {
        startSaving();
        await updateFuncao(editServerId, { funcao, descricao: trimNome(novaFuncao.descricao) });
        setNovaFuncao({ funcao: '', descricao: '' });
        setFuncaoEditando(null);
        await carregarDados({ silent: true });
        showSnackbar('Atuação salva com sucesso.');
      } catch (error) {
        console.error('Erro ao salvar atuação:', error);
        showSnackbar('Erro ao salvar atuação.', 'error');
      } finally {
        stopSaving();
      }
      return;
    }

    const editDraftId = funcaoEditando?._id && isDraftAtuacaoId(funcaoEditando._id) ? funcaoEditando._id : null;
    if (editDraftId) {
      const funcao = trimNome(novaFuncao.funcao);
      if (!funcao) {
        showSnackbar('Nome da atuação é obrigatório.', 'error');
        return;
      }
      setAtuacoesRascunho((prev) =>
        prev.map((d) =>
          d.tempId === editDraftId ? { ...d, funcao, descricao: trimNome(novaFuncao.descricao) } : d
        )
      );
      setNovaFuncao({ funcao: '', descricao: '' });
      setFuncaoEditando(null);
      showSnackbar('Rascunho atualizado.');
      return;
    }

    const criar = [...atuacoesRascunho.map((d) => ({ funcao: trimNome(d.funcao), descricao: trimNome(d.descricao) }))];
    const formNome = trimNome(novaFuncao.funcao);
    if (formNome) {
      criar.push({ funcao: formNome, descricao: trimNome(novaFuncao.descricao) });
    }

    if (criar.length === 0) {
      showSnackbar('Inclua itens na lista ou preencha o nome da atuação antes de salvar.', 'error');
      return;
    }

    try {
      startSaving();
      for (const row of criar) {
        await addFuncao(row);
      }
      setAtuacoesRascunho([]);
      setNovaFuncao({ funcao: '', descricao: '' });
      setFuncaoEditando(null);
      await carregarDados({ silent: true });
      showSnackbar(
        criar.length > 1 ? `${criar.length} atuações salvas com sucesso.` : 'Atuação salva com sucesso.'
      );
    } catch (error) {
      console.error('Erro ao salvar atuação:', error);
      showSnackbar('Erro ao salvar atuação.', 'error');
    } finally {
      stopSaving();
    }
  };

  const handleDeleteFuncao = async (id) => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja excluir esta atuação?')) return;
    try {
      startSaving();
      await deleteFuncao(id);
      await carregarDados({ silent: true });
      showSnackbar('Atuação removida com sucesso.');
    } catch (error) {
      console.error('Erro ao remover atuação:', error);
      showSnackbar('Erro ao remover atuação.', 'error');
    } finally {
      stopSaving();
    }
  };

  const handleRemoverAtuacaoOuRascunho = () => {
    if (!funcaoEditando?._id) return;
    if (isDraftAtuacaoId(funcaoEditando._id)) {
      setAtuacoesRascunho((prev) => prev.filter((d) => d.tempId !== funcaoEditando._id));
      setNovaFuncao({ funcao: '', descricao: '' });
      setFuncaoEditando(null);
      return;
    }
    handleDeleteFuncao(funcaoEditando._id);
  };

  const abrirModalVisibilidade = (event, funcaoRow) => {
    event.stopPropagation();
    if (isDraftAtuacaoId(funcaoRow._id)) {
      showSnackbar('Salve a atuação antes de configurar visibilidade.', 'warning');
      return;
    }
    const flat = normalizarModulosVelohubFromApi(funcaoRow.modulosVelohub)[0] || modulosVelohubPadrao();
    setAtuacaoVisibilidade(funcaoRow);
    setVisibilidadeDraft({ ...flat });
    setModalVisibilidadeAberto(true);
  };

  const fecharModalVisibilidade = () => {
    setModalVisibilidadeAberto(false);
    setAtuacaoVisibilidade(null);
    setVisibilidadeDraft(modulosVelohubPadrao());
  };

  const salvarVisibilidade = async () => {
    if (!atuacaoVisibilidade?._id || isDraftAtuacaoId(atuacaoVisibilidade._id)) return;
    try {
      startSaving();
      await updateFuncao(atuacaoVisibilidade._id, {
        modulosVelohub: [{ ...visibilidadeDraft }],
      });
      fecharModalVisibilidade();
      await carregarDados({ silent: true });
      showSnackbar('Visibilidade salva com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar visibilidade:', error);
      showSnackbar('Erro ao salvar visibilidade.', 'error');
    } finally {
      stopSaving();
    }
  };

  const addSimpleItem = (type) => {
    const trimmed = (type === 'escala' ? escalasInput : empresasInput).trim();
    if (!trimmed) return;
    if (type === 'escala') {
      setEscalas((prev) => normalizeStringArray([...prev, trimmed]));
      setEscalasInput('');
    } else {
      setEmpresas((prev) => normalizeStringArray([...prev, trimmed]));
      setEmpresasInput('');
    }
  };

  const removeSimpleItem = (type) => {
    if (type === 'escala' && escalaSelectedIndex >= 0) {
      setEscalas((prev) => prev.filter((_, idx) => idx !== escalaSelectedIndex));
      setEscalaSelectedIndex(-1);
    }
    if (type === 'empresa' && empresaSelectedIndex >= 0) {
      setEmpresas((prev) => prev.filter((_, idx) => idx !== empresaSelectedIndex));
      setEmpresaSelectedIndex(-1);
    }
  };

  const saveCadastroCampos = async () => {
    try {
      startSaving();
      await upsertCadastroCamposConfig({ escalas, empresas });
      showSnackbar('Cadastro de campos salvo com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar cadastro de campos:', error);
      showSnackbar('Erro ao salvar cadastro de campos.', 'error');
    } finally {
      stopSaving();
    }
  };

  const updateCatalogDraft = (catalogId, updater) => {
    setFeedbackCatalogs((prev) => ({
      ...prev,
      [catalogId]: updater(prev[catalogId])
    }));
  };

  const handleCatalogAdd = (catalogId) => {
    updateCatalogDraft(catalogId, (draft) => {
      const title = String(draft.input || '').trim();
      if (!title) return draft;
      const desc = String(draft.inputDesc || '').trim();
      const value = desc ? `${title}${CATALOG_TITLE_DESC_SEP}${desc}` : title;
      return {
        ...draft,
        input: '',
        inputDesc: '',
        items: normalizeStringArray([...draft.items, value])
      };
    });
  };

  const handleCatalogDelete = (catalogId) => {
    updateCatalogDraft(catalogId, (draft) => {
      if (draft.selectedIndex < 0) return draft;
      return {
        ...draft,
        selectedIndex: -1,
        items: draft.items.filter((_, idx) => idx !== draft.selectedIndex)
      };
    });
  };

  const handleCatalogSave = async (catalogId) => {
    const values = feedbackCatalogs[catalogId]?.items || [];
    try {
      startSaving();
      await upsertFeedbackCatalogConfig(catalogId, values);
      showSnackbar('Lista salva com sucesso.');
    } catch (error) {
      console.error(`Erro ao salvar catálogo ${catalogId}:`, error);
      showSnackbar('Erro ao salvar lista.', 'error');
    } finally {
      stopSaving();
    }
  };

  const handleUploadAddTrophy = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setTrophyAddPreviewBlobUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(file);
    });
    setTrophyAddImageFile(file);
    setTrophyAdd((prev) => ({ ...prev, trophy_url: '' }));
  };

  const clearTrophyAddLocalImage = () => {
    setTrophyAddPreviewBlobUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return '';
    });
    setTrophyAddImageFile(null);
    setTrophyAdd((prev) => ({ ...prev, trophy_url: '' }));
  };

  const handleUploadManageReplace = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!trophyManageId) {
      showSnackbar('Selecione um troféu na lista.', 'error');
      return;
    }
    setTrophyManageReplacePreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(file);
    });
    setTrophyManageReplaceFile(file);
  };

  const clearTrophyManageReplaceLocal = () => {
    setTrophyManageReplacePreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return '';
    });
    setTrophyManageReplaceFile(null);
  };

  const saveTrophyAdd = async () => {
    const pendingFile = trophyAddImageFile;
    const urlAlready = String(trophyAdd.trophy_url || '').trim();
    if (!pendingFile && !urlAlready) {
      showSnackbar('Selecione a imagem do troféu antes de salvar.', 'error');
      return;
    }
    try {
      startSaving();
      let trophy_url = urlAlready;
      if (pendingFile) {
        try {
          setTrophyUploading(true);
          const upload = await uploadQaTrophyImage(pendingFile);
          trophy_url = String(upload.url || '').trim();
        } finally {
          setTrophyUploading(false);
        }
      }
      if (!trophy_url) {
        showSnackbar('Não foi possível obter a URL da imagem.', 'error');
        return;
      }

      const newItem = {
        id: generateNewTrophyId(),
        conquista_titulo: String(trophyAdd.conquista_titulo || '').trim(),
        conquista_legenda: String(trophyAdd.conquista_legenda || '').trim(),
        trophy_url,
        xpClass: normalizeTrophyXpClassForSave(trophyAdd.xpClass),
      };
      await upsertQaTrophiesCatalog([...trophiesListRef.current, newItem]);
      setTrophyAdd({
        conquista_titulo: '',
        conquista_legenda: '',
        xpClass: '',
        trophy_url: '',
      });
      clearTrophyAddLocalImage();
      await carregarDados({ silent: true });
      showSnackbar('Troféu adicionado com sucesso.');
    } catch (error) {
      console.error('Erro ao adicionar troféu:', error);
      showSnackbar(error.message || 'Erro ao adicionar troféu.', 'error');
    } finally {
      stopSaving();
    }
  };

  const saveTrophyManage = async () => {
    if (!trophyManageId) {
      showSnackbar('Selecione um troféu na lista.', 'error');
      return;
    }
    try {
      startSaving();
      const current = trophiesListRef.current;
      let trophy_url = String(trophyManage.trophy_url || '').trim();

      if (trophyManageReplaceFile) {
        try {
          setTrophyUploading(true);
          const upload = await uploadQaTrophyImage(trophyManageReplaceFile);
          trophy_url = String(upload.url || '').trim();
        } finally {
          setTrophyUploading(false);
        }
      }

      if (!trophy_url) {
        showSnackbar('O troféu precisa de uma imagem guardada antes de atualizar.', 'error');
        return;
      }

      const next = current.map((row) =>
        row.id === trophyManageId
          ? {
              id: row.id,
              conquista_titulo: String(trophyManage.conquista_titulo || '').trim(),
              conquista_legenda: String(trophyManage.conquista_legenda || '').trim(),
              trophy_url,
              xpClass: normalizeTrophyXpClassForSave(trophyManage.xpClass),
            }
          : row
      );
      await upsertQaTrophiesCatalog(next);

      clearTrophyManageReplaceLocal();
      await carregarDados({ silent: true });
      showSnackbar('Troféu atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar troféu:', error);
      showSnackbar(error.message || 'Erro ao atualizar troféu.', 'error');
    } finally {
      stopSaving();
    }
  };

  const deleteTrophyManage = async () => {
    if (!trophyManageId) {
      showSnackbar('Selecione um troféu na lista.', 'error');
      return;
    }
    if (!window.confirm('Excluir este troféu do catálogo? Esta ação não remove o arquivo no armazenamento.')) return;
    try {
      startSaving();
      const next = trophiesListRef.current.filter((row) => row.id !== trophyManageId);
      await upsertQaTrophiesCatalog(next);
      setTrophyManageId('');
      trophyManageIdRef.current = '';
      setTrophyManage(manageFieldsFromRow(null));
      clearTrophyManageReplaceLocal();
      await carregarDados({ silent: true });
      showSnackbar('Troféu excluído.');
    } catch (error) {
      console.error('Erro ao excluir troféu:', error);
      showSnackbar('Erro ao excluir troféu.', 'error');
    } finally {
      stopSaving();
    }
  };

  const saveResgateAdd = async () => {
    const item = String(resgateAdd.item || '').trim();
    const xpPrice = Number(String(resgateAdd.xpPrice ?? '').replace(',', '.'));
    if (!item) {
      showSnackbar('Item é obrigatório.', 'error');
      return;
    }
    if (!Number.isFinite(xpPrice) || xpPrice < 0) {
      showSnackbar('Preço em XP deve ser um número ≥ 0.', 'error');
      return;
    }
    try {
      startSaving();
      await createQaResgateItem({ item, xpPrice });
      setResgateAdd({ item: '', xpPrice: '' });
      await carregarDados({ silent: true });
      showSnackbar('Resgate adicionado.');
    } catch (error) {
      console.error('Erro ao adicionar resgate:', error);
      showSnackbar(error.response?.data?.error || 'Erro ao adicionar resgate.', 'error');
    } finally {
      stopSaving();
    }
  };

  const saveResgateManage = async () => {
    if (!resgateSelectedId) {
      showSnackbar('Selecione um resgate na lista.', 'error');
      return;
    }
    const item = String(resgateManage.item || '').trim();
    const xpPrice = Number(String(resgateManage.xpPrice ?? '').replace(',', '.'));
    if (!item) {
      showSnackbar('Item é obrigatório.', 'error');
      return;
    }
    if (!Number.isFinite(xpPrice) || xpPrice < 0) {
      showSnackbar('Preço em XP deve ser um número ≥ 0.', 'error');
      return;
    }
    try {
      startSaving();
      await updateQaResgateItem(resgateSelectedId, { item, xpPrice });
      await carregarDados({ silent: true });
      showSnackbar('Resgate atualizado.');
    } catch (error) {
      console.error('Erro ao atualizar resgate:', error);
      showSnackbar(error.response?.data?.error || 'Erro ao atualizar resgate.', 'error');
    } finally {
      stopSaving();
    }
  };

  const deleteResgateManage = async () => {
    if (!resgateSelectedId) {
      showSnackbar('Selecione um resgate na lista.', 'error');
      return;
    }
    if (!window.confirm('Excluir este item de resgate?')) return;
    try {
      startSaving();
      await deleteQaResgateItem(resgateSelectedId);
      setResgateSelectedId('');
      resgateSelectedIdRef.current = '';
      setResgateManage({ item: '', xpPrice: '' });
      await carregarDados({ silent: true });
      showSnackbar('Resgate excluído.');
    } catch (error) {
      console.error('Erro ao excluir resgate:', error);
      showSnackbar(error.response?.data?.error || 'Erro ao excluir resgate.', 'error');
    } finally {
      stopSaving();
    }
  };

  const renderXpSelect = (value, onChange, labelId, formSx, disabled = false) => (
    <FormControl
      size="small"
      sx={
        formSx || {
          flex: '0 0 auto',
          minWidth: 160,
          width: { xs: '100%', sm: 180 }
        }
      }
    >
      <InputLabel id={labelId}>Classe de XP</InputLabel>
      <Select
        labelId={labelId}
        label="Classe de XP"
        displayEmpty
        value={value}
        onChange={onChange}
        disabled={disabled}
        notched={value !== ''}
        renderValue={(selected) => (selected === '' ? '' : selected)}
      >
        <MenuItem value="">
          <em>—</em>
        </MenuItem>
        {QA_TROPHY_XP_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderSimpleListEditor = (type) => {
    const isEscala = type === 'escala';
    const title = isEscala ? 'Escalas' : 'Empresas';
    const inputValue = isEscala ? escalasInput : empresasInput;
    const setInputValue = isEscala ? setEscalasInput : setEmpresasInput;
    const items = isEscala ? escalas : empresas;
    const selectedIndex = isEscala ? escalaSelectedIndex : empresaSelectedIndex;
    const setSelectedIndex = isEscala ? setEscalaSelectedIndex : setEmpresaSelectedIndex;

    return (
      <Accordion disableGutters sx={secondaryAccordionSx}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={sectionTitleSx}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={secondaryAccordionDetailsSx}>
          <Box sx={twoColumnRowSx}>
            <Box sx={editorLeftColumnSx}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Item"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSimpleItem(type);
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  aria-label={`Adicionar item em ${title}`}
                  onClick={() => addSimpleItem(type)}
                  sx={{ mt: 0.25 }}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            </Box>
            <Box sx={editorRightColumnSx}>
              <Box sx={listBoxSx}>
                {items.length === 0 ? (
                  <Typography sx={emptyListSx}>Nenhum item cadastrado.</Typography>
                ) : (
                  <List dense disablePadding>
                    {items.map((item, idx) => (
                      <ListItemButton
                        key={`${item}-${idx}`}
                        divider={idx < items.length - 1}
                        selected={selectedIndex === idx}
                        onClick={() => setSelectedIndex(idx)}
                      >
                        <ListItemText primary={item} />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => removeSimpleItem(type)}
              disabled={selectedIndex < 0}
            >
              Excluir
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveCadastroCampos}
              disabled={saving}
            >
              Salvar
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const catalogMetadata = useMemo(() => ({
    destaques_itens: 'Destaques',
    oportunidades_itens: 'Oportunidades',
    apontamentos_itens: 'Apontamentos'
  }), []);

  const renderCatalogEditor = (catalogId) => {
    const label = catalogMetadata[catalogId];
    const draft = feedbackCatalogs[catalogId] || initialCatalogState;
    return (
      <Accordion disableGutters key={catalogId} sx={secondaryAccordionSx}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={sectionTitleSx}>{label}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={secondaryAccordionDetailsSx}>
          <Box sx={twoColumnRowSx}>
            <Box sx={editorLeftColumnSx}>
              <TextField
                fullWidth
                label="Item"
                value={draft.input}
                onChange={(e) => updateCatalogDraft(catalogId, (old) => ({ ...old, input: e.target.value }))}
                size="small"
              />
              <TextField
                fullWidth
                label="Descrição (opcional)"
                value={draft.inputDesc || ''}
                onChange={(e) => updateCatalogDraft(catalogId, (old) => ({ ...old, inputDesc: e.target.value }))}
                size="small"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  color="primary"
                  aria-label={`Adicionar item em ${label}`}
                  onClick={() => handleCatalogAdd(catalogId)}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            </Box>
            <Box sx={editorRightColumnSx}>
              <Box sx={listBoxSx}>
                {draft.items.length === 0 ? (
                  <Typography sx={emptyListSx}>Nenhum item cadastrado.</Typography>
                ) : (
                  <List dense disablePadding>
                    {draft.items.map((item, idx) => {
                      const { primary, secondary } = splitCatalogStoredLine(item);
                      return (
                        <ListItemButton
                          key={`${catalogId}-${item}-${idx}`}
                          divider={idx < draft.items.length - 1}
                          selected={draft.selectedIndex === idx}
                          onClick={() => updateCatalogDraft(catalogId, (old) => ({ ...old, selectedIndex: idx }))}
                        >
                          <ListItemText
                            primary={primary}
                            secondary={secondary || undefined}
                            primaryTypographyProps={{ sx: { fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.875rem' } }}
                            secondaryTypographyProps={{
                              sx: {
                                fontFamily: 'Poppins',
                                fontSize: '0.75rem',
                                color: 'var(--gray)'
                              }
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleCatalogDelete(catalogId)}
              disabled={draft.selectedIndex < 0}
            >
              Excluir
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleCatalogSave(catalogId)}
              disabled={saving}
            >
              Salvar
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4.8, mb: 6.4, pb: 3.2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4.8, mb: 6.4, pb: 3.2, position: 'relative' }}>
      <VoltarHeaderRow left={<BackButton to="/qualidade" />} />

      <Accordion sx={{ mb: 1.6 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={sectionTitleSx}>Atuações, Escalas e Empresas</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ display: 'grid', gap: 1.2 }}>
          <Accordion disableGutters sx={secondaryAccordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={sectionTitleSx}>Atuações</Typography>
            </AccordionSummary>
            <AccordionDetails sx={secondaryAccordionDetailsSx}>
              <Box sx={twoColumnRowSx}>
                <Box sx={editorLeftColumnSx}>
                  <TextField
                    fullWidth
                    label="Item"
                    size="small"
                    value={novaFuncao.funcao}
                    onChange={(e) => setNovaFuncao((prev) => ({ ...prev, funcao: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleIncluirAtuacaoNaLista();
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Descrição (opcional)"
                    size="small"
                    value={novaFuncao.descricao}
                    onChange={(e) => setNovaFuncao((prev) => ({ ...prev, descricao: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleIncluirAtuacaoNaLista();
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      color="primary"
                      aria-label="Incluir atuação na lista (rascunho)"
                      onClick={handleIncluirAtuacaoNaLista}
                      disabled={saving}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setFuncaoEditando(null);
                        setNovaFuncao({ funcao: '', descricao: '' });
                      }}
                      disabled={saving}
                    >
                      Limpar
                    </Button>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSalvarFuncao} disabled={saving}>
                      Salvar atuação
                    </Button>
                  </Box>
                </Box>
                <Box sx={editorRightColumnSx}>
                  <Box sx={listBoxSx}>
                    {atuacoesRascunho.length === 0 && funcoes.length === 0 ? (
                      <Typography sx={emptyListSx}>Nenhuma atuação cadastrada.</Typography>
                    ) : (
                      <List dense disablePadding>
                        {[
                          ...atuacoesRascunho.map((d) => ({
                            _id: d.tempId,
                            funcao: d.funcao,
                            descricao: d.descricao
                          })),
                          ...funcoes
                        ].map((funcao, idx, arr) => {
                          const modCount = isDraftAtuacaoId(funcao._id)
                            ? 0
                            : contarModulosAtivos(funcao.modulosVelohub);
                          return (
                            <ListItem
                              key={funcao._id}
                              divider={idx < arr.length - 1}
                              disablePadding
                              secondaryAction={
                                !isDraftAtuacaoId(funcao._id) ? (
                                  <IconButton
                                    edge="end"
                                    aria-label={`Opções de visibilidade — ${funcao.funcao}`}
                                    onClick={(e) => abrirModalVisibilidade(e, funcao)}
                                    disabled={saving}
                                  >
                                    <MoreVert />
                                  </IconButton>
                                ) : null
                              }
                            >
                              <ListItemButton
                                selected={funcaoEditando?._id === funcao._id}
                                onClick={() => {
                                  if (isDraftAtuacaoId(funcao._id)) {
                                    setFuncaoEditando(funcao);
                                    setNovaFuncao({
                                      funcao: funcao.funcao || '',
                                      descricao: String(funcao.descricao || '').trim(),
                                    });
                                  } else {
                                    setFuncaoEditando(funcao);
                                    setNovaFuncao({
                                      funcao: funcao.funcao || '',
                                      descricao: descricaoAtuacaoFromDoc(funcao),
                                    });
                                  }
                                }}
                                sx={{ pr: !isDraftAtuacaoId(funcao._id) ? 6 : undefined }}
                              >
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                      <span>{funcao.funcao}</span>
                                      {modCount > 0 ? (
                                        <Chip
                                          label={`${modCount} módulo${modCount > 1 ? 's' : ''}`}
                                          size="small"
                                          sx={{ height: 20, fontSize: '0.65rem' }}
                                        />
                                      ) : null}
                                    </Box>
                                  }
                                  secondary={
                                    isDraftAtuacaoId(funcao._id)
                                      ? (String(funcao.descricao || '').trim() || 'Sem descrição') +
                                        ' — (rascunho)'
                                      : descricaoAtuacaoFromDoc(funcao) || 'Sem descrição'
                                  }
                                  primaryTypographyProps={{
                                    sx: { fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.875rem' },
                                    component: 'div',
                                  }}
                                  secondaryTypographyProps={{
                                    sx: {
                                      fontFamily: 'Poppins',
                                      fontSize: '0.65rem',
                                      fontStyle: 'italic',
                                      color: 'var(--gray)',
                                      lineHeight: 1.35,
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleRemoverAtuacaoOuRascunho}
                  disabled={!funcaoEditando?._id || saving}
                >
                  Excluir
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          {renderSimpleListEditor('escala')}
          {renderSimpleListEditor('empresa')}
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 1.6 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={sectionTitleSx}>Troféus</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, display: 'grid', gap: 1.2 }}>
          <Accordion disableGutters sx={secondaryAccordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={sectionTitleSx}>Adicionar</Typography>
            </AccordionSummary>
            <AccordionDetails sx={secondaryAccordionDetailsSx}>
              <Box sx={trophyPanelSx}>
                <Box sx={{ display: 'grid', gap: 1.2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.2,
                      alignItems: 'flex-end'
                    }}
                  >
                    <TextField
                      label="Título"
                      size="small"
                      value={trophyAdd.conquista_titulo}
                      onChange={(e) => setTrophyAdd((prev) => ({ ...prev, conquista_titulo: e.target.value }))}
                      sx={{ flex: '1 1 200px', minWidth: 160 }}
                    />
                    {renderXpSelect(trophyAdd.xpClass, (e) => setTrophyAdd((prev) => ({ ...prev, xpClass: e.target.value })), 'qa-trophy-add-xp-label')}
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={saving}
                      sx={{ flex: '0 0 auto', height: 40, whiteSpace: 'nowrap' }}
                    >
                      Troféu
                      <input type="file" hidden accept="image/*" onChange={handleUploadAddTrophy} />
                    </Button>
                  </Box>
                  <TextField
                    label="Legenda"
                    size="small"
                    fullWidth
                    value={trophyAdd.conquista_legenda}
                    onChange={(e) => setTrophyAdd((prev) => ({ ...prev, conquista_legenda: e.target.value }))}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={saveTrophyAdd}
                        disabled={saving || trophyUploading}
                      >
                        {trophyUploading ? 'Enviando…' : 'Salvar'}
                      </Button>
                    </Box>
                    {trophyAddPreviewBlobUrl || trophyAdd.trophy_url ? (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                        <Box
                          component="img"
                          src={
                            trophyAddPreviewBlobUrl ||
                            getTrophyMediabankDisplayUrl(trophyAdd.trophy_url)
                          }
                          alt="Pré-visualização do troféu"
                          sx={trophyPreviewLargeSx}
                        />
                        <IconButton
                          size="small"
                          aria-label="Remover imagem do troféu"
                          onClick={clearTrophyAddLocalImage}
                          disabled={saving || trophyUploading}
                        >
                          <Close />
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={secondaryAccordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={sectionTitleSx}>Gerenciar</Typography>
            </AccordionSummary>
            <AccordionDetails sx={secondaryAccordionDetailsSx}>
              <Box sx={twoColumnRowSx}>
                <Box sx={editorLeftColumnSx}>
                  <TextField
                    label="Título"
                    size="small"
                    fullWidth
                    value={trophyManage.conquista_titulo}
                    onChange={(e) => setTrophyManage((prev) => ({ ...prev, conquista_titulo: e.target.value }))}
                    disabled={!trophyManageId}
                  />
                  <TextField
                    label="Legenda"
                    size="small"
                    fullWidth
                    value={trophyManage.conquista_legenda}
                    onChange={(e) => setTrophyManage((prev) => ({ ...prev, conquista_legenda: e.target.value }))}
                    disabled={!trophyManageId}
                  />
                  {renderXpSelect(
                    trophyManage.xpClass,
                    (e) => setTrophyManage((prev) => ({ ...prev, xpClass: e.target.value })),
                    'qa-trophy-manage-xp-label',
                    { width: '100%' },
                    !trophyManageId
                  )}
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={trophyUploading || !trophyManageId || saving}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Trocar troféu
                    <input type="file" hidden accept="image/*" onChange={handleUploadManageReplace} />
                  </Button>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                    {trophyManage.trophy_url ? (
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', fontFamily: 'Poppins', color: 'var(--gray)', mb: 0.5 }}>
                          Atual
                        </Typography>
                        <Box
                          component="img"
                          src={getTrophyMediabankDisplayUrl(trophyManage.trophy_url)}
                          alt="Troféu atual"
                          sx={trophyPreviewLargeSx}
                        />
                      </Box>
                    ) : null}
                    {trophyManageReplacePreviewUrl ? (
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', fontFamily: 'Poppins', color: 'var(--gray)', mb: 0.5 }}>
                          Novo (ainda não enviado)
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                          <Box
                            component="img"
                            src={trophyManageReplacePreviewUrl}
                            alt="Novo troféu"
                            sx={trophyPreviewLargeSx}
                          />
                          <IconButton
                            size="small"
                            aria-label="Descartar nova imagem"
                            onClick={clearTrophyManageReplaceLocal}
                            disabled={trophyUploading || saving}
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={deleteTrophyManage}
                      disabled={saving || !trophyManageId}
                    >
                      Excluir
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={saveTrophyManage}
                      disabled={(saving || !trophyManageId) || trophyUploading}
                    >
                      {trophyUploading ? 'Enviando…' : 'Salvar alterações'}
                    </Button>
                  </Box>
                </Box>
                <Box sx={editorRightColumnSx}>
                  <Typography sx={{ ...sectionTitleSx, fontSize: '0.85rem', mb: 0.5 }}>Troféus existentes</Typography>
                  <Box sx={listBoxSx}>
                    {trophiesList.length === 0 ? (
                      <Typography sx={emptyListSx}>Nenhum troféu cadastrado.</Typography>
                    ) : (
                      <List dense disablePadding>
                        {trophiesList.map((row, idx) => (
                          <ListItemButton
                            key={row.id}
                            divider={idx < trophiesList.length - 1}
                            selected={trophyManageId === row.id}
                            onClick={() => {
                              setTrophyManageId(row.id);
                              trophyManageIdRef.current = row.id;
                              setTrophyManage(manageFieldsFromRow(row));
                              clearTrophyManageReplaceLocal();
                            }}
                          >
                            {row.trophy_url ? (
                              <Box
                                component="img"
                                src={getTrophyMediabankDisplayUrl(row.trophy_url)}
                                alt=""
                                sx={{ ...trophyThumbSx, mr: 1.2, flexShrink: 0 }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 72,
                                  height: 72,
                                  mr: 1.2,
                                  flexShrink: 0,
                                  borderRadius: '4px',
                                  border: '1px dashed rgba(22, 52, 255, 0.25)',
                                  backgroundColor: 'rgba(0,0,0,0.02)'
                                }}
                              />
                            )}
                            <ListItemText
                              primary={row.conquista_titulo || row.id}
                              secondary={[row.conquista_legenda, row.xpClass].filter(Boolean).join(' · ') || ' '}
                              secondaryTypographyProps={{
                                sx: { fontFamily: 'Poppins', fontSize: '0.72rem', color: 'var(--gray)' }
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    )}
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 1.6 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={sectionTitleSx}>Resgates</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, display: 'grid', gap: 1.2 }}>
          <Accordion disableGutters sx={secondaryAccordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={sectionTitleSx}>Adicionar</Typography>
            </AccordionSummary>
            <AccordionDetails sx={secondaryAccordionDetailsSx}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <TextField
                  label="Item"
                  size="small"
                  fullWidth
                  value={resgateAdd.item}
                  onChange={(e) => setResgateAdd((prev) => ({ ...prev, item: e.target.value }))}
                />
                <TextField
                  label="Preço em XP"
                  size="small"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  value={resgateAdd.xpPrice}
                  onChange={(e) => setResgateAdd((prev) => ({ ...prev, xpPrice: e.target.value }))}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<Save />} onClick={saveResgateAdd} disabled={saving}>
                    Salvar
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={secondaryAccordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={sectionTitleSx}>Gerenciar</Typography>
            </AccordionSummary>
            <AccordionDetails sx={secondaryAccordionDetailsSx}>
              <Box sx={twoColumnRowSx}>
                <Box sx={editorLeftColumnSx}>
                  <TextField
                    label="Item"
                    size="small"
                    fullWidth
                    value={resgateManage.item}
                    onChange={(e) => setResgateManage((prev) => ({ ...prev, item: e.target.value }))}
                    disabled={!resgateSelectedId}
                  />
                  <TextField
                    label="Preço em XP"
                    size="small"
                    fullWidth
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    value={resgateManage.xpPrice}
                    onChange={(e) => setResgateManage((prev) => ({ ...prev, xpPrice: e.target.value }))}
                    disabled={!resgateSelectedId}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={deleteResgateManage}
                      disabled={saving || !resgateSelectedId}
                    >
                      Excluir
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={saveResgateManage}
                      disabled={saving || !resgateSelectedId}
                    >
                      Salvar alterações
                    </Button>
                  </Box>
                </Box>
                <Box sx={editorRightColumnSx}>
                  <Typography sx={{ ...sectionTitleSx, fontSize: '0.85rem', mb: 0.5 }}>Itens cadastrados</Typography>
                  <Box sx={listBoxSx}>
                    {resgateList.length === 0 ? (
                      <Typography sx={emptyListSx}>Nenhum resgate cadastrado.</Typography>
                    ) : (
                      <List dense disablePadding>
                        {resgateList.map((row, idx) => (
                          <ListItemButton
                            key={row._id}
                            divider={idx < resgateList.length - 1}
                            selected={resgateSelectedId === row._id}
                            onClick={() => {
                              setResgateSelectedId(row._id);
                              resgateSelectedIdRef.current = row._id;
                              setResgateManage({ item: row.item, xpPrice: String(row.xpPrice) });
                            }}
                          >
                            <ListItemText
                              primary={row.item || row._id}
                              secondary={`${row.xpPrice} XP`}
                              primaryTypographyProps={{ sx: { fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.875rem' } }}
                              secondaryTypographyProps={{
                                sx: { fontFamily: 'Poppins', fontSize: '0.72rem', color: 'var(--gray)' }
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    )}
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={sectionTitleSx}>Feedback</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ display: 'grid', gap: 1.2 }}>
          {renderCatalogEditor('destaques_itens')}
          {renderCatalogEditor('oportunidades_itens')}
          {renderCatalogEditor('apontamentos_itens')}
        </AccordionDetails>
      </Accordion>

      <Dialog
        open={modalVisibilidadeAberto}
        onClose={fecharModalVisibilidade}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>
          Visibilidade — {atuacaoVisibilidade?.funcao || ''}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins', mb: 2, color: 'var(--gray)' }}>
            Define quais áreas do VeloHub ficam visíveis para agentes com esta atuação.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {MODULOS_VELOHUB_KEYS.map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={visibilidadeDraft[key] === true}
                    onChange={(e) =>
                      setVisibilidadeDraft((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                }
                label={MODULOS_VELOHUB_LABELS[key]}
                sx={{ fontFamily: 'Poppins' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={fecharModalVisibilidade} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarVisibilidade} disabled={saving} startIcon={<Save />}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QualidadeGerenciarPage;
