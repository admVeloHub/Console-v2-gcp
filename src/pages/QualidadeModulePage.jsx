// VERSION: v1.49.2 | DATE: 2026-06-08 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.49.2 - Coluna Atendimento: dataLigacao (LISTA) via formatDataHoraLigacao com legado BSON Date/dataChamado
// CHANGELOG: v1.49.1 - Fix runtime: confirma remoção total de DetalhesAnaliseModal (import, estado e JSX)
// CHANGELOG: v1.49.0 - Análise IA: novo schema LISTA no acordeão; remove DetalhesAnaliseModal e modal Ver Detalhes
// CHANGELOG: v1.48.3 - Aba Análise IA: fontes reduzidas no panorama (título, filtros, alertas)
// CHANGELOG: v1.48.2 - Aba «Feedback» → «Resultado Individual»; quadro «Envio de Feedback» → «Mensagem ao Agente»
// CHANGELOG: v1.48.1 - dataLigacao String YYYY-MM-DD absoluta; filtros/ordenação sem new Date()
// CHANGELOG: v1.48.0 - dataLigacao só data + horaLigacao persistido (HH:mm absoluto); exibição/edição sem conversão de fuso
// CHANGELOG: v1.47.3 - Tipos de feedback: só flag Auditoria (sem bypass por papel Administrador)
// CHANGELOG: v1.47.2 - Envio de Feedback: só Avaliador → Elogio; Auditoria → Elogio + Oportunidade + Apontamento
// CHANGELOG: v1.47.1 - Conceder troféu: tampão opaco «Em desenvolvimento» sobre o quadro (bloqueia interação)
// CHANGELOG: v1.47.0 - Envio de Feedback: Monitor só Elogio; Oportunidade/Apontamento só auditoria ou relatórios gestão (config)
// CHANGELOG: v1.46.9 - Filtros avançados da lista de avaliações: Colaborador com Autocomplete e busca por digitação
// CHANGELOG: v1.46.8 - Modal Nova Avaliação: Colaborador com Autocomplete e filtro ao digitar (alinhado à aba Feedback)
// CHANGELOG: v1.46.7 - Modal Nova Avaliação (ticket): mesma área de «Critérios de Avaliação» da ligação + divisor entre métricas positivas e detratoras (evita mistura com dados do atendimento)
// CHANGELOG: v1.46.6 - Modal Nova Avaliação: FormControl Avaliador com size="small" (alinha label/Select ao Colaborador); floating label shrink mantido nos dois (MUI + displayEmpty)
// CHANGELOG: v1.46.5 - Modal Nova Avaliação: Select colaborador/avaliador sem texto “Selecione” no campo (evita sobreposição com label); label com shrink; campo Ticket sem placeholder
// CHANGELOG: v1.46.3 - Relatório Individual: filtros com wrap mais compacto (alignContent, gaps, ml:auto em vez de space-between)
// CHANGELOG: v1.46.2 - Feedback Relatório Individual: cartão de filtros à parte do cartão de stats/XP; filtros com padding inferior reduzido (sem «vácuo»)
// CHANGELOG: v1.46.1 - Feedback: XP Excelência ao lado do título «Resultados para…» (stats); filtros sem XP e menos espaço vertical
// CHANGELOG: v1.45.0 - Conceder troféu: pré-visualização em coluna (título/legenda/XP + imagem ampla); Enviar → POST atendimento-trophy (academy_registros)
// CHANGELOG: v1.44.3 - Cabeçalho: VoltarHeaderRow (Sx partilhado com resto do projeto); referência mantida para alinhamento do Voltar
// CHANGELOG: v1.44.2 - Voltar: navegar para /qualidade (hub do módulo), alinhado a Funcionários/Gerenciar; evita default BackButton '/' (home)
// CHANGELOG: v1.44.1 - Correção JSX card Conceder troféu (CardContent + título) após ajuste de hover
// CHANGELOG: v1.44.0 - Cards: neutralizar hover do MuiCard do tema (sem translate/sombra extra) em todas as vistas
// CHANGELOG: v1.42.1 - Padronização global de border-radius (cards/containers 6px; botões/áreas secundárias 4px; troca seletor lista)
// CHANGELOG: v1.42.0 - Feedback: catálogos por ids fixos (destaques_itens/oportunidades_itens/apontamentos_itens); campo Oportunidades por lista
// CHANGELOG: v1.41.1 - Relatório Individual: 2.ª linha de cards = Melhor Média, Pior Média, Melhor Nota Ligação, Melhor Nota Ticket (dados em qualidade.js gerarRelatorioAgente)
// CHANGELOG: v1.41.0 - Envio de Feedback: Gerar entre Recomendações e Feedback Gerado; Gerar e Enviar cada um à direita na sua linha
// CHANGELOG: v1.40.9 - Envio de Feedback: botão Enviar alinhado à direita do container (Gerar à esquerda)
// CHANGELOG: v1.40.8 - Destaques/Apontamentos/Recomendações: removidos helperText e noOptionsText/placeholder explicativos
// CHANGELOG: v1.40.7 - Bloco relatorio+feedback: grid 70% Envio de Feedback + 30% sidebar “Conceder troféu”; mesma altura (row)
// CHANGELOG: v1.40.6 - Envio de Feedback: tipo/mês/ano com largura contida (não 33% fullWidth cada)
// CHANGELOG: v1.40.5 - Envio de Feedback: sem linhas com nome; modal Nova/Editar: colaborador/avaliador com Select (valor fechado = “selecionado”, sem o nome) + avaliador com função = só lógica (nomeAvaliadorLogado) — submit inalterado
// CHANGELOG: v1.40.4 - Destaques e Apontamentos: multi-seleção (catálogos QA); API envia arrays (Skynet junta com "; ")
// CHANGELOG: v1.40.3 - Recomendações: multi-select (Academy) em vez de texto preenchido automaticamente
// CHANGELOG: v1.40.2 - nomeColaboradorFeedback: só relatorioAgente.colaboradorNome (sem fallback a selectedColaborador)
// CHANGELOG: v1.40.1 - Envio de Feedback: sem campo Colaborador (usa colaborador do Relatório Individual); card só com relatório já gerado; colaboradorNome = relatorioAgente
// CHANGELOG: v1.40.0 - Aba Feedback: formulário Envio de Feedback (tipos Elogio/Oportunidade/Apontamento, catálogos API, recomendações Academy, Gerar IA, Enviar → qa_feedback)
// CHANGELOG: v1.39.8 - Abas: primeira "Avaliações"; ex-Relatório do Agente → "Feedback"; Card "Envio de Feedback" só na aba Feedback (value relatorio-agente)
// CHANGELOG: v1.39.7 - Rodapé do módulo: container Card com título "feedback"
// CHANGELOG: v1.39.6 - Aba e título da listagem: rótulo "Feedback" (antes "Avaliações")
// CHANGELOG: v1.39.5 - Gráfico Histórico: legenda "Média mensal" (notaReal = média aritmética do mês, ligação + ticket + IA quando aplicável)
// CHANGELOG: v1.39.4 - Relatório do Agente: colaborador com Autocomplete + filtro ao digitar (alinhado ao modal Nova Avaliação)
// CHANGELOG: v1.39.3 - Lista avaliações: ordenar por data de atendimento (dataLigacao / dataChamado), mais recente primeiro; posição "todos" exibe ligação + ticket
// CHANGELOG: v1.39.2 - Tabela: coluna Áudio com chip 'Ticket' em avaliações de ticket (N/A áudio)
// CHANGELOG: v1.39.1 - Filtro tipo lista: mesma peça visual do modal (Ligação + trilha/thumb 3 posições + Ticket), não ToggleButtonGroup
// CHANGELOG: v1.39.0 - Aba Avaliações: seletor 3 posições (Ligações | todos | Tickets) após título; padrão = todos
// CHANGELOG: v1.38.0 - Ticket: critérios com nomes PascalCase (FONTE LISTA_SCHEMAS / backend)
// CHANGELOG: v1.37.0 - Ticket: critérios em chaves pos*/neg*; exclusão e persistência alinhados a qualidade_ticket_avaliacoes; switch reseta o outro conjunto
// CHANGELOG: v1.36.10 - Ticket: grid aditivos + célula vazia se ímpar; detratoras só na linha seguinte + célula vazia se ímpar (padrão ligação)
// CHANGELOG: v1.36.9 - Ticket: removidos títulos seção Métricas Avaliativas / Métricas Detratoras
// CHANGELOG: v1.36.8 - Critérios e pontuações distintas para tipo ticket (Métricas Positivas / Detratoras)
// CHANGELOG: v1.36.7 - Campo Colaborador (modal avaliação): Autocomplete com filtro ao digitar (ligação e ticket)
// CHANGELOG: v1.36.6 - Modo Ticket: rótulos Data do Chamado + Ticket nº (numérico); ligação mantém data/hora
// CHANGELOG: v1.36.5 - Removido carácter ↔ no cabeçalho; só título + Ligação / switch / Ticket
// CHANGELOG: v1.36.4 - Cabeçalho modal: "Nova Avaliação" primeiro; depois Ligação ↔ Ticket (switch)
// CHANGELOG: v1.36.3 - Modal avaliação: título à esquerda como antes; switch imediatamente à frente do título (sem empurrar à direita)
// CHANGELOG: v1.36.2 - Modal Nova/Editar Avaliação: switch Ligação / Ticket; campo tipoAvaliacao no envio
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
  CircularProgress,
  Avatar,
  Divider,
  TablePagination,
  Tooltip,
  Switch
} from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
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
  gerarRelatorioGestao,
  getValoresCampoQa,
  listValoresCampos,
  gerarQaFeedback,
  salvarQaFeedback,
  salvarAtendimentoTrophy,
  getAtendimentoTrophyXpTotal
} from '../services/qualidadeAPI';
import { cursosConteudoAPI } from '../services/academyAPI';
import { getTrophyMediabankDisplayUrl } from '../services/uploadAPI';
import { exportAvaliacoesToExcel, exportAvaliacoesToPDF, exportAnaliseIAToXLSX } from '../services/qualidadeExport';
import { analyzeCallWithGPT } from '../services/gptService';
import { getAvaliadoresValidos } from '../services/userService';
import { 
  MESES, 
  ANOS, 
  getStatusPontuacao, 
  generateId,
  isSomenteAnaliseAudioIA,
  hasAvaliacaoManualSupervisor
} from '../types/qualidade';
import {
  normalizeFuncoesLista,
  findRegistroFuncaoAtendimento,
  filtrarFuncionariosComFuncaoAtendimento
} from '../utils/qualidadeFuncionariosAtendimento';
import {
  toDataLigacaoInputValue,
  resolveHoraLigacao,
  formatDataHoraLigacao,
  normalizeDataLigacaoInput,
  dataLigacaoSortKey
} from '../utils/qualidadeDataLigacao';
import UploadAudioModal from '../components/qualidade/UploadAudioModal';
import LoteAudioModal from '../components/qualidade/LoteAudioModal';
import AnaliseGPTAccordion from '../components/qualidade/AnaliseGPTAccordion';
import { uploadAudioParaAnalise, listarAnalisesPorColaborador } from '../services/qualidadeAudioService';
import { useAuth } from '../contexts/AuthContext';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';

const CRITERIOS_TICKET_POSITIVOS = [
  { key: 'ProducaoTexto', label: 'Produção de texto', pontos: 15, isPositive: true },
  { key: 'ClarezaObjetividade', label: 'Clareza e objetividade', pontos: 15, isPositive: true },
  { key: 'BoaResolucaoProcedimento', label: 'Boa resolução / procedimento', pontos: 30, isPositive: true },
  { key: 'AderenciaEstruturaResposta', label: 'Aderência e estrutura da resposta', pontos: 15, isPositive: true },
  { key: 'Tabulacao', label: 'Tabulação', pontos: 25, isPositive: true }
];

const CRITERIOS_TICKET_DETRATORES = [
  { key: 'PassouPrazoResposta', label: 'Passou do prazo de resposta', pontos: -30, isPositive: false },
  { key: 'RepassouProcedimentoIncorreto', label: 'Repassou procedimento incorreto', pontos: -100, isPositive: false },
  { key: 'NaoUtilizouBotApoio', label: 'Não utilização do bot de apoio', pontos: -10, isPositive: false }
];

const CAMPOS_CRITERIO_LIGACAO = [
  'saudacaoAdequada',
  'escutaAtiva',
  'clarezaObjetividade',
  'resolucaoQuestao',
  'registroAtendimento',
  'empatiaCordialidade',
  'direcionouPesquisa',
  'naoConsultouBot',
  'conformidadeTicket',
  'procedimentoIncorreto',
  'encerramentoBrusco'
];
const CAMPOS_CRITERIO_TICKET = [
  'ProducaoTexto',
  'ClarezaObjetividade',
  'BoaResolucaoProcedimento',
  'AderenciaEstruturaResposta',
  'Tabulacao',
  'PassouPrazoResposta',
  'RepassouProcedimentoIncorreto',
  'NaoUtilizouBotApoio'
];

/** Catálogo qa_trophies_catalog — alinhado a QualidadeGerenciarPage (lista + fallback qa_trophy_config). */
const QA_TROPHY_XP_OPTS = ['Baixo', 'Normal', 'Alto', 'Especial'];

const normalizeTrophyXpClassForRow = (raw) => {
  if (raw == null || raw === '') return 'Normal';
  const s = String(raw).trim();
  if (QA_TROPHY_XP_OPTS.includes(s)) return s;
  const n = Number(raw);
  if (Number.isFinite(n)) {
    const idx = Math.max(0, Math.min(QA_TROPHY_XP_OPTS.length - 1, Math.round(n)));
    return QA_TROPHY_XP_OPTS[idx];
  }
  return 'Normal';
};

const mapQaCatalogRow = (raw) => ({
  id: String(raw?.id || '').trim(),
  conquista_titulo: raw?.conquista_titulo != null ? String(raw.conquista_titulo) : '',
  conquista_legenda: raw?.conquista_legenda != null ? String(raw.conquista_legenda) : '',
  trophy_url: raw?.trophy_url != null ? String(raw.trophy_url).trim() : '',
  xpClass: normalizeTrophyXpClassForRow(raw?.xpClass)
});

const buildQaTrophiesListFromValoresDocs = (docsById) => {
  const catalogDoc = docsById?.qa_trophies_catalog;
  let rows = Array.isArray(catalogDoc?.trophies)
    ? catalogDoc.trophies.map(mapQaCatalogRow).filter((row) => row.id)
    : [];
  if (rows.length === 0) {
    const leg = docsById?.qa_trophy_config;
    if (leg && (leg.trophy_url || leg.conquista_titulo)) {
      rows = [
        mapQaCatalogRow({
          id: 'legacy-qa-trophy-config',
          conquista_titulo: leg.conquista_titulo,
          conquista_legenda: leg.conquista_legenda,
          xpClass: leg.xpClass,
          trophy_url: leg.trophy_url
        })
      ];
    }
  }
  return rows;
};

/** Ocupador invisível da 2ª coluna (md) quando a linha tem só um cartão — alinhado ao modal ligação */
const GridCelulaVaziaQualidade = () => (
  <Grid item xs={12} md={6}>
    <Box sx={{ p: 2, visibility: 'hidden' }}>
      <Typography variant="body1" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
        Espaço vazio
      </Typography>
    </Box>
  </Grid>
);

const renderCardCriterio = (criterio, formData, setFormData) => (
  <Grid item xs={12} md={6} key={criterio.key}>
    <Box
      className="avaliacao-criterio-card"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.6,
        border: criterio.isPositive
          ? formData[criterio.key]
            ? '1px solid rgba(22, 148, 255, 0.75)'
            : '1px solid rgba(22, 148, 255, 0.5)'
          : formData[criterio.key]
            ? '1px solid #EF4444'
            : '1px solid rgba(255, 193, 7, 0.6)',
        borderRadius: '4px',
        backgroundColor: 'var(--cor-card)'
      }}
    >
      <Box>
        <Typography
          variant="body1"
          sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.8rem', color: '#000000' }}
        >
          {criterio.label}
        </Typography>
        <Typography
          variant="body2"
          className={criterio.pontos > 0 ? 'pontuacao-positiva' : 'pontuacao-negativa'}
          sx={{
            fontFamily: 'Poppins',
            color: criterio.pontos > 0 ? '#006AB9' : '#D32F2F',
            fontSize: '0.8rem'
          }}
        >
          {criterio.pontos > 0 ? `+${criterio.pontos} pontos` : `${criterio.pontos} pontos`}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        className={`${criterio.isPositive ? 'checkbox-positivo' : 'checkbox-negativo'} ${
          formData[criterio.key] ? 'checkbox-selecionado' : ''
        }`}
        onClick={() => setFormData({ ...formData, [criterio.key]: !formData[criterio.key] })}
        sx={{
          minWidth: '22.4px',
          width: '22.4px',
          height: '22.4px',
          border: criterio.isPositive
            ? formData[criterio.key]
              ? '2px solid rgba(22, 148, 255, 0.75)'
              : '1px solid rgba(22, 148, 255, 0.5)'
            : formData[criterio.key]
              ? '2px solid #EF4444'
              : '1px solid rgba(255, 193, 7, 0.6)',
          backgroundColor: criterio.isPositive
            ? formData[criterio.key]
              ? '#000058'
              : 'transparent'
            : formData[criterio.key]
              ? '#EF4444'
              : 'transparent',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: criterio.isPositive
              ? formData[criterio.key]
                ? '#000040'
                : 'rgba(22, 148, 255, 0.1)'
              : formData[criterio.key]
                ? '#DC2626'
                : 'rgba(255, 193, 7, 0.1)',
            borderColor: criterio.isPositive ? 'rgba(22, 148, 255, 0.75)' : '#EF4444'
          }
        }}
      >
        {formData[criterio.key] && <CheckCircle sx={{ color: '#ffffff', fontSize: '11.2px' }} />}
      </Button>
    </Box>
  </Grid>
);

function CriteriosModalTicket({ formData, setFormData }) {
  const nAditivos = CRITERIOS_TICKET_POSITIVOS.length;
  const nDetratoras = CRITERIOS_TICKET_DETRATORES.length;

  return (
    <>
      {CRITERIOS_TICKET_POSITIVOS.map((c) => renderCardCriterio(c, formData, setFormData))}
      {nAditivos % 2 === 1 ? <GridCelulaVaziaQualidade /> : null}
      <Grid item xs={12}>
        <Divider sx={{ my: 0.4, borderColor: 'rgba(0, 0, 88, 0.12)' }} />
      </Grid>
      {CRITERIOS_TICKET_DETRATORES.map((c) => renderCardCriterio(c, formData, setFormData))}
      {nDetratoras % 2 === 1 ? <GridCelulaVaziaQualidade /> : null}
    </>
  );
}

/** Lista de opções (módulos e temas) a partir de cursos_conteudo (ativos), única e ordenada. v1.1.0 */
function buildListaRecomendacoesFromCursos(cursos) {
  const set = new Set();
  if (!Array.isArray(cursos)) return [];
  cursos
    .filter((c) => c && c.isActive !== false)
    .forEach((curso) => {
      (curso.modules || [])
        .filter((m) => m && m.isActive !== false)
        .forEach((mod) => {
          const mn = mod.moduleNome || mod.moduleId || '';
          if (mn) set.add(`Módulo: ${mn}`);
          (mod.sections || mod.secoes || [])
            .filter((s) => s && s.isActive !== false)
            .forEach((sec) => {
              const tn = sec.temaNome || sec.temaId || '';
              if (tn) set.add(`Tema: ${tn}`);
            });
        });
    });
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Mesma sombra no repouso e no hover — remove translate/sombra extra do tema MuiCard nesta página. */
const QM_SHADOW_SM = '0 3.2px 16px rgba(0, 0, 0, 0.1)';
const QM_SHADOW_LG = '0 4px 20px rgba(0, 0, 0, 0.1)';

const qmCardSemHoverSomra = (sombra) => ({
  transition: 'none',
  boxShadow: sombra,
  '&:hover': {
    transform: 'none',
    boxShadow: sombra
  }
});

/** Cards métricas relatório: sem sombra tema; apenas borda/gradientes locais */
const QM_METRICA_SEM_HOVER = {
  transition: 'none',
  boxShadow: 'none',
  '&:hover': {
    transform: 'none',
    boxShadow: 'none'
  }
};

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
    ProducaoTexto: false,
    ClarezaObjetividade: false,
    BoaResolucaoProcedimento: false,
    AderenciaEstruturaResposta: false,
    Tabulacao: false,
    PassouPrazoResposta: false,
    RepassouProcedimentoIncorreto: false,
    NaoUtilizouBotApoio: false,
    observacoes: '',
    dataLigacao: '',
    horaLigacao: '',
    /** Número do ticket (só quando tipoAvaliacao === 'ticket') */
    numeroTicket: '',
    /** 'ligacao' | 'ticket' — avaliação de ligação telefónica vs ticket */
    tipoAvaliacao: 'ligacao'
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

  // Formulário Envio de Feedback (aba Feedback)
  const [fbTipo, setFbTipo] = useState('Elogio');
  const [fbDestaquesSelecionados, setFbDestaquesSelecionados] = useState([]);
  const [fbObservacoesIndiv, setFbObservacoesIndiv] = useState('');
  const [fbOportunidadesSelecionadas, setFbOportunidadesSelecionadas] = useState([]);
  const [fbObservacao, setFbObservacao] = useState('');
  const [fbApontamentosSelecionados, setFbApontamentosSelecionados] = useState([]);
  const [opcoesQaDestaques, setOpcoesQaDestaques] = useState([]);
  const [opcoesQaOportunidades, setOpcoesQaOportunidades] = useState([]);
  const [opcoesQaApontamentos, setOpcoesQaApontamentos] = useState([]);
  const [opcoesRecomendacoesAcademy, setOpcoesRecomendacoesAcademy] = useState([]);
  const [fbRecomendacoesSelecionadas, setFbRecomendacoesSelecionadas] = useState([]);
  const [fbFeedbackGerado, setFbFeedbackGerado] = useState('');
  const [fbMes, setFbMes] = useState(MESES[new Date().getMonth()]);
  const [fbAno, setFbAno] = useState(new Date().getFullYear());
  const [fbGerando, setFbGerando] = useState(false);
  const [fbSalvando, setFbSalvando] = useState(false);
  const [qaTrophiesConcederLista, setQaTrophiesConcederLista] = useState([]);
  const [concederTrofeuId, setConcederTrofeuId] = useState('');
  const [concederTrofeusCatalogLoading, setConcederTrofeusCatalogLoading] = useState(false);
  const [concederTrofeuEnviando, setConcederTrofeuEnviando] = useState(false);
  const [xpExcelenciaTotal, setXpExcelenciaTotal] = useState(0);
  const [xpExcelenciaLoading, setXpExcelenciaLoading] = useState(false);

  // Estados para Análise GPT
  const [filtrosGPT, setFiltrosGPT] = useState({
    colaborador: '',
    mes: '',
    ano: new Date().getFullYear()
  });
  const [analisesGPT, setAnalisesGPT] = useState([]);
  const [loadingAnalisesGPT, setLoadingAnalisesGPT] = useState(false);

  const [avaliacoesPage, setAvaliacoesPage] = useState(0);
  const [avaliacoesRowsPerPage, setAvaliacoesRowsPerPage] = useState(25);
  /** Filtro da lista: `todos` (ligações + tickets), só ligação ou só ticket */
  const [seletorTipoListaAvaliacoes, setSeletorTipoListaAvaliacoes] = useState('todos');
  const carregarDadosSeqRef = useRef(0);
  const visibilityRecarregarTimerRef = useRef(null);

  /** Nome do avaliador na sessão (login grava em `nome`/`id`; cadastro Mongo usa `_userId`) */
  const nomeAvaliadorLogado = (user?.nome || user?._userId || user?.id || '').trim();

  /**
   * Tipos de feedback (config → Funções Administrativas, sem bypass de papel):
   * - Avaliador (sem Auditoria): Elogio
   * - Auditoria: Elogio + Oportunidade + Apontamento
   */
  const fbTiposDisponiveis = useMemo(() => {
    const fa = user?._funcoesAdministrativas || {};
    const isAuditor = fa.auditoria === true || fa.auditor === true;
    if (isAuditor) {
      return ['Elogio', 'Oportunidade', 'Apontamento'];
    }
    return ['Elogio'];
  }, [user]);

  const opcoesAvaliadorModal = useMemo(() => {
    if (!nomeAvaliadorLogado) return avaliadores;
    if (avaliadores.includes(nomeAvaliadorLogado)) return avaliadores;
    return [nomeAvaliadorLogado, ...avaliadores];
  }, [avaliadores, nomeAvaliadorLogado]);

  const filterOptionsColaborador = useMemo(
    () =>
      createFilterOptions({
        ignoreAccents: true,
        ignoreCase: true,
        matchFrom: 'any',
        limit: 200
      }),
    []
  );

  const filterOptionsQaValores = useMemo(
    () =>
      createFilterOptions({
        ignoreAccents: true,
        ignoreCase: true,
        matchFrom: 'any',
        limit: 200,
        stringify: (option) => {
          if (option == null) return '';
          if (typeof option === 'string') return option;
          return String(option.label || option.value || '');
        }
      }),
    []
  );

  /** Nomes únicos para o Autocomplete; inclui valor atual na edição se ainda não estiver na lista */
  const opcoesColaboradorModal = useMemo(() => {
    const nomes = funcionarios
      .map((f) => f.colaboradorNome || f.nomeCompleto)
      .filter(Boolean);
    const unique = [...new Set(nomes)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const v = (formData.colaboradorNome || '').trim();
    if (v && !unique.includes(v)) {
      return [v, ...unique];
    }
    return unique;
  }, [funcionarios, formData.colaboradorNome]);

  /** Opções do Autocomplete na aba Relatório do Agente (inclui valor selecionado ainda fora da lista) */
  const opcoesColaboradorRelatorioAgente = useMemo(() => {
    const nomes = funcionarios
      .map((f) => f.colaboradorNome || f.nomeCompleto)
      .filter(Boolean);
    const unique = [...new Set(nomes)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const v = (selectedColaborador || '').trim();
    if (v && !unique.includes(v)) {
      return [v, ...unique];
    }
    return unique;
  }, [funcionarios, selectedColaborador]);

  /** Opções do Autocomplete nos filtros avançados da lista de avaliações */
  const opcoesColaboradorFiltrosLista = useMemo(() => {
    const nomes = funcionarios
      .map((f) => f.colaboradorNome || f.nomeCompleto)
      .filter(Boolean);
    const unique = [...new Set(nomes)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const v = (filtros.colaborador || '').trim();
    if (v && !unique.includes(v)) {
      return [v, ...unique];
    }
    return unique;
  }, [funcionarios, filtros.colaborador]);

  /** Nome do colaborador alvo do feedback: só o documento do relatório individual (`colaboradorNome`). */
  const nomeColaboradorFeedback = useMemo(
    () => (relatorioAgente?.colaboradorNome || '').trim(),
    [relatorioAgente]
  );

  /** Email do colaborador (cadastro funcionários), para gravar em atendimento_trophies.colaboradorEmail. */
  const emailColaboradorFeedback = useMemo(() => {
    const nome = nomeColaboradorFeedback;
    if (!nome) return '';
    const nLower = nome.trim().toLowerCase();
    const f = funcionarios.find((x) => {
      const cand = String(x.colaboradorNome || x.nomeCompleto || '').trim().toLowerCase();
      return cand === nLower;
    });
    const em = f?.userMail || f?.email || '';
    return String(em || '').trim().toLowerCase();
  }, [funcionarios, nomeColaboradorFeedback]);

  const fbRecomendacoesTexto = useMemo(
    () => (fbRecomendacoesSelecionadas || []).map((s) => String(s).trim()).filter(Boolean).join('\n'),
    [fbRecomendacoesSelecionadas]
  );

  const trofeuConcederSelecionado = useMemo(
    () =>
      concederTrofeuId
        ? qaTrophiesConcederLista.find((t) => t.id === concederTrofeuId) || null
        : null,
    [qaTrophiesConcederLista, concederTrofeuId]
  );

  const concederTrofeuPodeEnviar = useMemo(
    () =>
      !!(relatorioAgente && nomeColaboradorFeedback && trofeuConcederSelecionado?.id),
    [relatorioAgente, nomeColaboradorFeedback, trofeuConcederSelecionado]
  );

  const fbPodeGerar = useMemo(() => {
    if (!relatorioAgente) return false;
    if (!nomeAvaliadorLogado) return false;
    if (!nomeColaboradorFeedback) return false;
    if (fbTipo === 'Elogio') {
      return !!(fbDestaquesSelecionados.length > 0 && (fbObservacoesIndiv || '').trim());
    }
    if (fbTipo === 'Oportunidade') {
      return !!(
        fbDestaquesSelecionados.length > 0 &&
        fbOportunidadesSelecionadas.length > 0 &&
        (fbObservacao || '').trim()
      );
    }
    if (fbTipo === 'Apontamento') {
      return !!(fbApontamentosSelecionados.length > 0 && (fbObservacao || '').trim());
    }
    return false;
  }, [
    relatorioAgente,
    nomeAvaliadorLogado,
    nomeColaboradorFeedback,
    fbTipo,
    fbDestaquesSelecionados,
    fbObservacoesIndiv,
    fbOportunidadesSelecionadas,
    fbObservacao,
    fbApontamentosSelecionados
  ]);

  const fbPodeEnviar = useMemo(() => {
    if (!relatorioAgente) return false;
    if (!nomeAvaliadorLogado) return false;
    if (!nomeColaboradorFeedback) return false;
    if (!fbMes || fbAno == null || fbAno === '') return false;
    if (!(fbFeedbackGerado || '').trim()) return false;
    return true;
  }, [relatorioAgente, nomeAvaliadorLogado, nomeColaboradorFeedback, fbMes, fbAno, fbFeedbackGerado]);

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
      filtrados = filtrados.filter((a) => {
        const ymd = normalizeDataLigacaoInput(a.dataLigacao);
        return ymd && ymd >= filtros.dataLigacaoInicio;
      });
    }
    if (filtros.dataLigacaoFim) {
      filtrados = filtrados.filter((a) => {
        const ymd = normalizeDataLigacaoInput(a.dataLigacao);
        return ymd && ymd <= filtros.dataLigacaoFim;
      });
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

    if (seletorTipoListaAvaliacoes === 'ligacao') {
      filtrados = filtrados.filter((a) => a.tipoAvaliacao !== 'ticket');
    } else if (seletorTipoListaAvaliacoes === 'ticket') {
      filtrados = filtrados.filter((a) => a.tipoAvaliacao === 'ticket');
    }
    // seletor 'todos': sem filtro de tipo (ligações + tickets)

    const sortKey = (a) => {
      const atendimento = dataLigacaoSortKey(a);
      if (atendimento) return atendimento;
      if (a?.createdAt) return String(a.createdAt);
      return '';
    };
    return [...filtrados].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  }, [avaliacoes, filtros, seletorTipoListaAvaliacoes]);

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
    filtros.status,
    seletorTipoListaAvaliacoes
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

  // Catálogos QA + recomendações (cursos_conteudo) — só com relatório individual já gerado
  useEffect(() => {
    if (currentView !== 'relatorio-agente' || !relatorioAgente) return;
    let cancelled = false;
    (async () => {
      setConcederTrofeuId('');
      setConcederTrofeusCatalogLoading(true);
      setQaTrophiesConcederLista([]);
      try {
        const [dDest, dOport, dApon, cursos, valoresData] = await Promise.all([
          getValoresCampoQa('destaques_itens'),
          getValoresCampoQa('oportunidades_itens'),
          getValoresCampoQa('apontamentos_itens'),
          cursosConteudoAPI.getActive(),
          listValoresCampos(false)
        ]);
        if (cancelled) return;
        setOpcoesQaDestaques(
          dDest?.success && Array.isArray(dDest.opcoes) ? dDest.opcoes : []
        );
        setOpcoesQaOportunidades(
          dOport?.success && Array.isArray(dOport.opcoes) ? dOport.opcoes : []
        );
        setOpcoesQaApontamentos(
          dApon?.success && Array.isArray(dApon.opcoes) ? dApon.opcoes : []
        );
        setOpcoesRecomendacoesAcademy(buildListaRecomendacoesFromCursos(cursos));
        setFbRecomendacoesSelecionadas([]);
        setFbDestaquesSelecionados([]);
        setFbOportunidadesSelecionadas([]);
        setFbApontamentosSelecionados([]);
        const docs = Array.isArray(valoresData?.data) ? valoresData.data : [];
        const docsById = docs.reduce((acc, doc) => {
          if (doc?.id) acc[doc.id] = doc;
          return acc;
        }, {});
        setQaTrophiesConcederLista(buildQaTrophiesListFromValoresDocs(docsById));
      } catch (e) {
        console.error('Envio de Feedback: catálogos/recomendações', e);
        if (!cancelled) {
          setSnackbar({
            open: true,
            message: 'Não foi possível carregar catálogos ou cursos para recomendações.',
            severity: 'error'
          });
        }
      } finally {
        if (!cancelled) setConcederTrofeusCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentView, relatorioAgente]);

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
      const ligaCriteriosFalsos = Object.fromEntries(
        CAMPOS_CRITERIO_LIGACAO.map((k) => [k, false])
      );
      const ticketCriteriosFalsos = Object.fromEntries(
        CAMPOS_CRITERIO_TICKET.map((k) => [k, false])
      );

      if (avaliacao.tipoAvaliacao === 'ticket') {
        const dataRef = avaliacao.dataChamado ?? avaliacao.dataLigacao;
        setFormData({
          colaboradorNome: avaliacao.colaboradorNome || '',
          avaliador: isAvaliador ? nomeAvaliadorLogado : (avaliacao.avaliador || ''),
          mes: avaliacao.mes,
          ano: avaliacao.ano,
          ...ligaCriteriosFalsos,
          ProducaoTexto: Boolean(avaliacao.ProducaoTexto),
          ClarezaObjetividade: Boolean(avaliacao.ClarezaObjetividade),
          BoaResolucaoProcedimento: Boolean(avaliacao.BoaResolucaoProcedimento),
          AderenciaEstruturaResposta: Boolean(avaliacao.AderenciaEstruturaResposta),
          Tabulacao: Boolean(avaliacao.Tabulacao),
          PassouPrazoResposta: Boolean(avaliacao.PassouPrazoResposta),
          RepassouProcedimentoIncorreto: Boolean(avaliacao.RepassouProcedimentoIncorreto),
          NaoUtilizouBotApoio: Boolean(avaliacao.NaoUtilizouBotApoio),
          observacoes: avaliacao.observacoes || '',
          dataLigacao: toDataLigacaoInputValue(dataRef),
          horaLigacao: '',
          numeroTicket: avaliacao.numeroTicket != null ? String(avaliacao.numeroTicket) : '',
          arquivoLigacao: null,
          tipoAvaliacao: 'ticket'
        });
      } else {
        setFormData({
          colaboradorNome: avaliacao.colaboradorNome || '',
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
          ...ticketCriteriosFalsos,
          observacoes: avaliacao.observacoes || '',
          dataLigacao: toDataLigacaoInputValue(avaliacao.dataLigacao),
          horaLigacao: resolveHoraLigacao(avaliacao),
          numeroTicket: '',
          arquivoLigacao: null,
          tipoAvaliacao: 'ligacao'
        });
      }
    } else {
      setAvaliacaoEditando(null);

      setFormData({
        colaboradorNome: '',
        avaliador: nomeAvaliadorLogado,
        mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase()),
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
        ProducaoTexto: false,
        ClarezaObjetividade: false,
        BoaResolucaoProcedimento: false,
        AderenciaEstruturaResposta: false,
        Tabulacao: false,
        PassouPrazoResposta: false,
        RepassouProcedimentoIncorreto: false,
        NaoUtilizouBotApoio: false,
        observacoes: '',
        dataLigacao: '',
        horaLigacao: '',
        numeroTicket: '',
        arquivoLigacao: null,
        tipoAvaliacao: 'ligacao'
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
      ProducaoTexto: false,
      ClarezaObjetividade: false,
      BoaResolucaoProcedimento: false,
      AderenciaEstruturaResposta: false,
      Tabulacao: false,
      PassouPrazoResposta: false,
      RepassouProcedimentoIncorreto: false,
      NaoUtilizouBotApoio: false,
      observacoes: '',
      dataLigacao: '',
      horaLigacao: '',
      numeroTicket: '',
      arquivoLigacao: null,
      tipoAvaliacao: 'ligacao'
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
      
      if (formData.tipoAvaliacao === 'ticket') {
        if (!formData.dataLigacao) {
          mostrarSnackbar('Informe a data do chamado', 'error');
          return;
        }
        const nro = String(formData.numeroTicket || '').replace(/\D/g, '');
        if (nro === '' || Number.isNaN(Number(nro))) {
          mostrarSnackbar('Informe o número do ticket (apenas numérico)', 'error');
          return;
        }
      } else if (!formData.dataLigacao) {
        mostrarSnackbar('Informe a data da ligação', 'error');
        return;
      }

      const dadosParaEnvio = {
        ...formData,
        avaliador: avaliadorEfetivo,
        colaboradorNome: formData.colaboradorNome,
        dataLigacao: formData.tipoAvaliacao === 'ticket' ? '' : formData.dataLigacao,
        horaLigacao: formData.tipoAvaliacao === 'ticket' ? '' : (formData.horaLigacao || ''),
        dataChamado: formData.tipoAvaliacao === 'ticket' ? formData.dataLigacao : undefined,
        somenteAnaliseAudioIA: false,
        numeroTicket:
          formData.tipoAvaliacao === 'ticket'
            ? Number(String(formData.numeroTicket || '').replace(/\D/g, ''))
            : null
      };

      if (formData.tipoAvaliacao === 'ticket') {
        delete dadosParaEnvio.horaLigacao;
        delete dadosParaEnvio.dataLigacao;
      } else {
        delete dadosParaEnvio.dataChamado;
      }
      
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

  const excluirAvaliacao = async (id, isTicket = false) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deleteAvaliacao(id, { isTicket: isTicket === true });
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

  const carregarXpExcelenciaFeedback = useCallback(async () => {
    const nome = (selectedColaborador || '').trim();
    if (!nome) {
      setXpExcelenciaTotal(0);
      return;
    }
    const nLower = nome.toLowerCase();
    const f = funcionarios.find(
      (x) =>
        String(x.colaboradorNome || x.nomeCompleto || '')
          .trim()
          .toLowerCase() === nLower
    );
    const em = String(f?.userMail || f?.email || '').trim().toLowerCase();

    setXpExcelenciaLoading(true);
    try {
      const res = await getAtendimentoTrophyXpTotal({
        email: em || undefined,
        colaboradorNome: em ? undefined : nome
      });
      if (res?.success && res.totalXp != null) {
        setXpExcelenciaTotal(Number(res.totalXp) || 0);
      } else {
        setXpExcelenciaTotal(0);
      }
    } catch {
      setXpExcelenciaTotal(0);
    } finally {
      setXpExcelenciaLoading(false);
    }
  }, [selectedColaborador, funcionarios]);

  useEffect(() => {
    if (currentView !== 'relatorio-agente') return;
    carregarXpExcelenciaFeedback();
  }, [currentView, carregarXpExcelenciaFeedback]);

  useEffect(() => {
    if (fbTiposDisponiveis.includes(fbTipo)) return;
    setFbTipo('Elogio');
    setFbFeedbackGerado('');
    setFbOportunidadesSelecionadas([]);
    setFbApontamentosSelecionados([]);
    setFbObservacao('');
  }, [fbTiposDisponiveis, fbTipo]);

  const montarPayloadGerarQaFeedback = () => {
    const base = {
      feedbackType: fbTipo,
      colaboradorNome: nomeColaboradorFeedback,
      avaliador: nomeAvaliadorLogado,
      recomendacoesTexto: fbRecomendacoesTexto
    };
    if (fbTipo === 'Elogio') {
      return { ...base, destaques: fbDestaquesSelecionados, observacoesIndividuais: fbObservacoesIndiv };
    }
    if (fbTipo === 'Oportunidade') {
      return {
        ...base,
        destaques: fbDestaquesSelecionados,
        oportunidade: fbOportunidadesSelecionadas.join('; '),
        observacao: fbObservacao
      };
    }
    return { ...base, apontamentos: fbApontamentosSelecionados, observacao: fbObservacao };
  };

  const handleFbGerar = async () => {
    if (!fbTiposDisponiveis.includes(fbTipo)) {
      mostrarSnackbar(
        'Oportunidade e Apontamento exigem a função Auditoria no Config.',
        'warning'
      );
      return;
    }
    if (!fbPodeGerar) {
      mostrarSnackbar(
        'Gere o relatório individual e preencha os campos obrigatórios deste tipo de feedback.',
        'warning'
      );
      return;
    }
    setFbGerando(true);
    try {
      const res = await gerarQaFeedback(montarPayloadGerarQaFeedback());
      if (res?.success && res.feedbackGerado != null) {
        setFbFeedbackGerado(String(res.feedbackGerado));
        mostrarSnackbar('Feedback gerado.', 'success');
      } else {
        mostrarSnackbar(res?.error || 'Não foi possível gerar o feedback.', 'error');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error || error?.message || 'Erro ao gerar feedback.';
      mostrarSnackbar(msg, 'error');
    } finally {
      setFbGerando(false);
    }
  };

  const handleFbSalvar = async () => {
    if (!fbTiposDisponiveis.includes(fbTipo)) {
      mostrarSnackbar(
        'Oportunidade e Apontamento exigem a função Auditoria no Config.',
        'warning'
      );
      return;
    }
    if (!fbPodeEnviar) {
      mostrarSnackbar('Preencha mês, ano (referência) e o feedback gerado.', 'warning');
      return;
    }
    setFbSalvando(true);
    try {
      const res = await salvarQaFeedback({
        colaboradorNome: nomeColaboradorFeedback,
        avaliador: nomeAvaliadorLogado,
        mes: fbMes,
        ano: Number(fbAno),
        feedbackType: fbTipo,
        feedbackBody: (fbFeedbackGerado || '').trim(),
        feedbackRecomendacoes: fbRecomendacoesTexto
      });
      if (res?.success) {
        mostrarSnackbar('Feedback enviado e gravado.', 'success');
      } else {
        mostrarSnackbar(res?.error || 'Não foi possível gravar.', 'error');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error || error?.message || 'Erro ao gravar feedback.';
      mostrarSnackbar(msg, 'error');
    } finally {
      setFbSalvando(false);
    }
  };

  const handleConcederTrofeuEnviar = async () => {
    if (!concederTrofeuPodeEnviar || !trofeuConcederSelecionado) {
      mostrarSnackbar(
        'Gere o relatório individual, confirme o colaborador e selecione um troféu.',
        'warning'
      );
      return;
    }
    setConcederTrofeuEnviando(true);
    try {
      const t = trofeuConcederSelecionado;
      const payload = {
        colaboradorNome: nomeColaboradorFeedback,
        qaTrophyId: String(t.id || '').trim(),
        colaboradorEmail: emailColaboradorFeedback || undefined,
        conquista_titulo: String(t.conquista_titulo || '').trim() || undefined,
        conquista_legenda: String(t.conquista_legenda || '').trim() || undefined,
        trophy_url: String(t.trophy_url || '').trim() || undefined,
        xpClass: t.xpClass != null && String(t.xpClass).trim() ? String(t.xpClass).trim() : undefined
      };
      const res = await salvarAtendimentoTrophy(payload);
      if (res?.success) {
        mostrarSnackbar('Troféu registrado na Academy (Excelência do Atendimento).', 'success');
        setConcederTrofeuId('');
        await carregarXpExcelenciaFeedback();
      } else {
        mostrarSnackbar(res?.error || 'Não foi possível gravar o troféu.', 'error');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error || error?.message || 'Erro ao gravar troféu de atendimento.';
      mostrarSnackbar(msg, 'error');
    } finally {
      setConcederTrofeuEnviando(false);
    }
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
      {/* Header único — faixa Voltar igual às demais páginas (VoltarHeaderRow) */}
      <VoltarHeaderRow
        left={<BackButton to="/qualidade" />}
        center={
          <Tabs
            value={currentView}
            onChange={(e, newValue) => setCurrentView(newValue)}
            aria-label="Avaliações, resultado individual e análise IA"
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
              label="Resultado Individual"
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
        }
      />

      {/* Conteúdo das Abas */}
      {currentView === 'avaliacoes' && (
        <Box>
          {/* Toolbar */}
          <Card
            sx={{
              mb: 1.6,
              mt: 0.8,
              borderRadius: '6px',
              boxShadow: QM_SHADOW_SM,
              backgroundColor: 'var(--cor-card)',
              ...qmCardSemHoverSomra(QM_SHADOW_SM)
            }}
          >
            <CardContent sx={{ py: 0.6, px: 2, '&:last-child': { pb: 0.6 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.2,
                  rowGap: 1,
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.2,
                    rowGap: 0.8,
                    minWidth: 0
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, fontSize: '0.96rem' }}
                  >
                    Avaliações ({avaliacoesFiltradas.length})
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexShrink: 0,
                      flexWrap: 'wrap'
                    }}
                    role="group"
                    aria-label="Alternar listagem: Ligação, todos os tipos ou Ticket"
                  >
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: seletorTipoListaAvaliacoes === 'ligacao' ? 600 : 500,
                        color: seletorTipoListaAvaliacoes === 'ligacao' ? '#000058' : '#8a94a0',
                        fontSize: '0.8rem'
                      }}
                    >
                      Ligação
                    </Typography>
                    <Box
                      sx={(theme) => ({
                        position: 'relative',
                        width: 52,
                        height: 20,
                        flexShrink: 0,
                        borderRadius: '6px',
                        backgroundColor:
                          seletorTipoListaAvaliacoes === 'ticket'
                            ? theme.palette.mode === 'dark'
                              ? 'rgba(144, 202, 249, 0.45)'
                              : 'rgba(25, 118, 210, 0.5)'
                            : 'rgba(0, 0, 0, 0.2)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        outline: 0,
                        '&:focus-visible': {
                          outline: '2px solid #1694FF',
                          outlineOffset: 2
                        }
                      })}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        const ord = ['ligacao', 'todos', 'ticket'];
                        const i = ord.indexOf(seletorTipoListaAvaliacoes);
                        if (e.key === 'Home') {
                          e.preventDefault();
                          setSeletorTipoListaAvaliacoes('ligacao');
                        } else if (e.key === 'End') {
                          e.preventDefault();
                          setSeletorTipoListaAvaliacoes('ticket');
                        } else if (e.key === 'ArrowLeft' && i > 0) {
                          e.preventDefault();
                          setSeletorTipoListaAvaliacoes(ord[i - 1]);
                        } else if (e.key === 'ArrowRight' && i < 2) {
                          e.preventDefault();
                          setSeletorTipoListaAvaliacoes(ord[i + 1]);
                        }
                      }}
                    >
                      <Box
                        onClick={() => setSeletorTipoListaAvaliacoes('ligacao')}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '33.33%',
                          height: '100%',
                          zIndex: 1,
                          borderRadius: '6px 0 0 6px',
                          cursor: 'pointer',
                          opacity: 0
                        }}
                        aria-label="Só ligação"
                        role="button"
                        tabIndex={-1}
                      />
                      <Box
                        onClick={() => setSeletorTipoListaAvaliacoes('todos')}
                        sx={{
                          position: 'absolute',
                          left: '33.33%',
                          top: 0,
                          width: '33.34%',
                          height: '100%',
                          zIndex: 1,
                          cursor: 'pointer',
                          opacity: 0
                        }}
                        aria-label="Ligação e tickets"
                        role="button"
                        tabIndex={-1}
                      />
                      <Box
                        onClick={() => setSeletorTipoListaAvaliacoes('ticket')}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          width: '33.33%',
                          height: '100%',
                          zIndex: 1,
                          borderRadius: '0 6px 6px 0',
                          cursor: 'pointer',
                          opacity: 0
                        }}
                        aria-label="Só ticket"
                        role="button"
                        tabIndex={-1}
                      />
                      <Box
                        aria-hidden
                        sx={(theme) => ({
                          position: 'absolute',
                          top: 2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 1.6px 3.2px rgba(0,0,0,0.4)'
                            : '0 1.6px 3.2px rgba(0,0,0,0.12), 0 0.8px 0.8px rgba(0,0,0,0.1)',
                          transition: 'left 0.2s ease',
                          pointerEvents: 'none',
                          zIndex: 0,
                          left:
                            seletorTipoListaAvaliacoes === 'ligacao'
                              ? 2
                              : seletorTipoListaAvaliacoes === 'todos'
                                ? 18
                                : 34
                        })}
                      />
                    </Box>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: seletorTipoListaAvaliacoes === 'ticket' ? 600 : 500,
                        color: seletorTipoListaAvaliacoes === 'ticket' ? '#000058' : '#8a94a0',
                        fontSize: '0.8rem'
                      }}
                    >
                      Ticket
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
          <Card
            sx={{
              borderRadius: '6px',
              boxShadow: QM_SHADOW_LG,
              mt: 2,
              backgroundColor: 'var(--cor-card)',
              ...qmCardSemHoverSomra(QM_SHADOW_LG)
            }}
          >
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
                            {formatDataHoraLigacao(
                              avaliacao.dataLigacao ?? avaliacao.dataChamado,
                              avaliacao.horaLigacao,
                              avaliacao
                            ) || '-'}
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
                              {avaliacao.tipoAvaliacao === 'ticket' ? (
                                <Tooltip title="Avaliação de ticket (sem fluxo de áudio)" arrow placement="top">
                                  <Chip
                                    label="Ticket"
                                    size="small"
                                    sx={{
                                      width: larguraChipStatusTabela,
                                      minWidth: larguraChipStatusTabela,
                                      maxWidth: larguraChipStatusTabela,
                                      height: 22,
                                      backgroundColor: 'rgba(0, 0, 88, 0.1)',
                                      color: '#000058',
                                      border: '1px solid rgba(0, 0, 88, 0.2)',
                                      fontFamily: 'Poppins',
                                      fontWeight: 600,
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
                                renderAudioIcon(avaliacao)
                              )}
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
                              onClick={() => excluirAvaliacao(avaliacao._id, avaliacao.tipoAvaliacao === 'ticket')}
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
          <Card
            sx={{
              borderRadius: '6px',
              boxShadow: QM_SHADOW_LG,
              backgroundColor: 'var(--cor-card)',
              px: { xs: 1.5, sm: 2 },
              pt: 1,
              pb: 1,
              mt: 1,
              ...qmCardSemHoverSomra(QM_SHADOW_LG)
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {/* Filtros: wrap compacto — space-between deixa «buracos» entre linhas; ml:auto empurra o grupo de controlos */}
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  alignContent: 'flex-start',
                  columnGap: 1.25,
                  rowGap: 0.75,
                  mb: 0
                }}>
                  {/* Título */}
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Poppins', 
                    color: '#000058', 
                    fontWeight: 500,
                  fontSize: '1.2rem',
                  flexShrink: 0,
                  lineHeight: 1.2
                  }}>
                    Relatório Individual
                  </Typography>

                {/* Controles: Botão, Seletor, Filtros de Data e Limpar */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                  alignContent: 'flex-start',
                  columnGap: 1,
                  rowGap: 0.75,
                  flexWrap: 'wrap',
                  flex: '1 1 0',
                  minWidth: 0,
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
                        borderRadius: '4px',
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
                    
                    {/* Seleção de Colaborador (Autocomplete: filtrar ao digitar, como no modal Nova Avaliação) */}
                    <Autocomplete
                      size="small"
                      className="velohub-select-alinhado"
                      sx={{ minWidth: 200, maxWidth: 360, flex: '0 1 auto' }}
                      options={opcoesColaboradorRelatorioAgente}
                      value={selectedColaborador ? selectedColaborador : null}
                      onChange={(_e, newValue) => {
                        setSelectedColaborador(newValue || '');
                      }}
                      isOptionEqualToValue={(option, value) => option === value}
                      filterOptions={filterOptionsColaborador}
                      noOptionsText="Nenhum colaborador encontrado"
                      ListboxProps={{
                        sx: { fontFamily: 'Poppins', fontSize: '0.8rem', maxHeight: 280 }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Selecione o Colaborador"
                          InputLabelProps={{
                            ...params.InputLabelProps,
                            sx: {
                              fontFamily: 'Poppins',
                              fontSize: '0.8rem',
                              color: '#000058',
                              '&.Mui-focused': { color: '#006AB9' }
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: 'Poppins',
                              fontSize: '0.8rem',
                              minHeight: 32,
                              height: 32,
                              borderRadius: '4px',
                              paddingRight: '9px !important',
                              '& fieldset': { borderColor: '#000058' },
                              '&:hover fieldset': { borderColor: '#006AB9' },
                              '&.Mui-focused fieldset': { borderColor: '#006AB9' }
                            },
                            '& .MuiInputBase-input': {
                              padding: '4px 8px 4px 6px !important',
                              minHeight: 0
                            }
                          }}
                        />
                      )}
                    />

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
                      borderRadius: '4px',
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
            </CardContent>
          </Card>

              {/* Stats + XP: cartão próprio, alinhado ao título «Resultados para…» */}
              {relatorioAgente && (
          <Card
            sx={{
              borderRadius: '6px',
              boxShadow: QM_SHADOW_LG,
              backgroundColor: 'var(--cor-card)',
              px: { xs: 2, sm: 2.5 },
              pt: 2,
              pb: 2,
              mt: 2,
              ...qmCardSemHoverSomra(QM_SHADOW_LG)
            }}
          >
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ mt: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.25,
                      mb: 2
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Poppins',
                        color: '#000058',
                        fontWeight: 600,
                        fontSize: { xs: '0.96rem', sm: '1.04rem' },
                        flex: '1 1 auto',
                        minWidth: 0
                      }}
                    >
                      Resultados para {relatorioAgente.colaboradorNome}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                        flexShrink: 0,
                        py: 0.25,
                        px: 1,
                        borderRadius: '4px',
                        border: '1px solid rgba(22, 52, 255, 0.18)',
                        backgroundColor: 'rgba(22, 52, 255, 0.04)'
                      }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--blue-dark)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        XP Excelência
                      </Typography>
                      {xpExcelenciaLoading ? (
                        <CircularProgress size={16} sx={{ color: 'var(--blue-medium)' }} />
                      ) : (
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            color: 'var(--blue-medium)',
                            minWidth: '1.5rem'
                          }}
                        >
                          {(selectedColaborador || '').trim() ? xpExcelenciaTotal : '—'}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Cards de Métricas */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        backgroundColor: 'var(--cor-card)',
                        border: '1.5px solid #000058',
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
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
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
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
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
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
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
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

                  {/* Melhor/Pior média mensal; melhor nota por canal (ligação / ticket) */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(22, 180, 255, 0.15) 0%, rgba(22, 180, 255, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
                      }}>
                        <Typography variant="h5" sx={{ fontSize: '1.2rem', 
                          fontFamily: 'Poppins', 
                          color: '#1694FF', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.melhorMedia == null ? '—' : relatorioAgente.melhorMedia}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#1694FF'
                        }}>
                          Melhor Média
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
                      }}>
                        <Typography variant="h5" sx={{ fontSize: '1.2rem', 
                          fontFamily: 'Poppins', 
                          color: '#dc3545', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.piorMedia == null ? '—' : relatorioAgente.piorMedia}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#dc3545'
                        }}>
                          Pior Média
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(22, 52, 255, 0.12) 0%, rgba(22, 52, 255, 0.04) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
                      }}>
                        <Typography variant="h5" sx={{ fontSize: '1.2rem', 
                          fontFamily: 'Poppins', 
                          color: '#1634FF', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.melhorNotaLigacao == null ? '—' : relatorioAgente.melhorNotaLigacao}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#1634FF'
                        }}>
                          Melhor Nota Ligação
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(252, 194, 0, 0.15) 0%, rgba(252, 194, 0, 0.05) 100%)',
                        border: '1.5px solid #000058',
                        borderRadius: '6px',
                        ...QM_METRICA_SEM_HOVER
                      }}>
                        <Typography variant="h5" sx={{ fontSize: '1.2rem', 
                          fontFamily: 'Poppins', 
                          color: '#C49000', 
                          fontWeight: 700 
                        }}>
                          {relatorioAgente.melhorNotaTicket == null ? '—' : relatorioAgente.melhorNotaTicket}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins', 
                          color: '#C49000'
                        }}>
                          Melhor Nota Ticket
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
            </CardContent>
          </Card>
              )}

          {/* Container do Gráfico de Histórico */}
          {relatorioAgente && (
            <Card
              sx={{
                borderRadius: '6px',
                boxShadow: QM_SHADOW_LG,
                background: '#F3F7FC',
                padding: '24px',
                mt: 2,
                ...qmCardSemHoverSomra(QM_SHADOW_LG)
              }}
            >
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
                  borderRadius: '4px',
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
                          borderRadius: '4px',
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
                        name="Média mensal"
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

          {relatorioAgente && (
          <Box
            sx={{
              mt: 3.2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '7fr 3fr' },
              gap: 2,
              width: '100%',
              minWidth: 0,
              alignItems: 'stretch'
            }}
          >
          <Card
            sx={{
              borderRadius: '6px',
              boxShadow: QM_SHADOW_SM,
              backgroundColor: 'var(--cor-card)',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: 'auto' },
              ...qmCardSemHoverSomra(QM_SHADOW_SM)
            }}
          >
            <CardContent sx={{ py: 2, px: 2, flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2 } }}>
              <Typography
                variant="h6"
                sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, fontSize: '0.96rem', mb: 0.5 }}
              >
                Mensagem ao Agente
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      flexWrap: 'wrap',
                      alignItems: { sm: 'flex-start' },
                      gap: 1.25
                    }}
                  >
                    <FormControl
                      size="small"
                      variant="outlined"
                      sx={{
                        width: { xs: '100%', sm: 200 },
                        minWidth: 0,
                        maxWidth: { sm: 220 }
                      }}
                    >
                      <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Tipo de feedback</InputLabel>
                      <Select
                        label="Tipo de feedback"
                        value={fbTipo}
                        onChange={(e) => {
                          setFbTipo(e.target.value);
                          setFbFeedbackGerado('');
                        }}
                        sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                      >
                        {fbTiposDisponiveis.map((tipo) => (
                          <MenuItem key={tipo} value={tipo} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                            {tipo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl
                      size="small"
                      variant="outlined"
                      sx={{
                        width: { xs: '100%', sm: 144 },
                        minWidth: 0,
                        maxWidth: { sm: 160 }
                      }}
                    >
                      <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Mês (referência)</InputLabel>
                      <Select
                        label="Mês (referência)"
                        value={fbMes}
                        onChange={(e) => setFbMes(e.target.value)}
                        sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                      >
                        {MESES.map((mes) => (
                          <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                            {mes}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl
                      size="small"
                      variant="outlined"
                      sx={{
                        width: { xs: '100%', sm: 100 },
                        minWidth: 0,
                        maxWidth: { sm: 108 }
                      }}
                    >
                      <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Ano (referência)</InputLabel>
                      <Select
                        label="Ano (referência)"
                        value={fbAno}
                        onChange={(e) => setFbAno(e.target.value)}
                        sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                      >
                        {ANOS.map((ano) => (
                          <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                            {ano}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {(fbTipo === 'Elogio' || fbTipo === 'Oportunidade') && (
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={opcoesQaDestaques}
                      getOptionLabel={(o) => o?.label || o?.value || ''}
                      isOptionEqualToValue={(a, b) => a.value === b.value}
                      value={fbDestaquesSelecionados
                        .map((v) => opcoesQaDestaques.find((o) => o.value === v))
                        .filter(Boolean)}
                      onChange={(_e, newValue) => {
                        setFbDestaquesSelecionados(newValue.map((o) => o.value));
                      }}
                      disableCloseOnSelect
                      filterSelectedOptions
                      filterOptions={filterOptionsQaValores}
                      size="small"
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={`${String(option.value)}-${index}`}
                            size="small"
                            label={option.label || option.value}
                            variant="outlined"
                            sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Destaques"
                          InputLabelProps={{ ...params.InputLabelProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                          inputProps={{ ...params.inputProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                        />
                      )}
                      sx={{ '& .MuiAutocomplete-inputRoot': { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                    />
                  </Grid>
                )}

                {fbTipo === 'Elogio' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      size="small"
                      label="Observações Individuais"
                      value={fbObservacoesIndiv}
                      onChange={(e) => setFbObservacoesIndiv(e.target.value)}
                      InputLabelProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                      inputProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                    />
                  </Grid>
                )}

                {fbTipo === 'Oportunidade' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        multiple
                        options={opcoesQaOportunidades}
                        getOptionLabel={(o) => o?.label || o?.value || ''}
                        isOptionEqualToValue={(a, b) => a.value === b.value}
                        value={fbOportunidadesSelecionadas
                          .map((v) => opcoesQaOportunidades.find((o) => o.value === v))
                          .filter(Boolean)}
                        onChange={(_e, newValue) => {
                          setFbOportunidadesSelecionadas(newValue.map((o) => o.value));
                        }}
                        disableCloseOnSelect
                        filterSelectedOptions
                        filterOptions={filterOptionsQaValores}
                        size="small"
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={`${String(option.value)}-${index}`}
                              size="small"
                              label={option.label || option.value}
                              variant="outlined"
                              sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Oportunidades"
                            InputLabelProps={{ ...params.InputLabelProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                            inputProps={{ ...params.inputProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                          />
                        )}
                        sx={{ '& .MuiAutocomplete-inputRoot': { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        label="Observação"
                        value={fbObservacao}
                        onChange={(e) => setFbObservacao(e.target.value)}
                        InputLabelProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                        inputProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                      />
                    </Grid>
                  </>
                )}

                {fbTipo === 'Apontamento' && (
                  <>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={opcoesQaApontamentos}
                        getOptionLabel={(o) => o?.label || o?.value || ''}
                        isOptionEqualToValue={(a, b) => a.value === b.value}
                        value={fbApontamentosSelecionados
                          .map((v) => opcoesQaApontamentos.find((o) => o.value === v))
                          .filter(Boolean)}
                        onChange={(_e, newValue) => {
                          setFbApontamentosSelecionados(newValue.map((o) => o.value));
                        }}
                        disableCloseOnSelect
                        filterSelectedOptions
                        filterOptions={filterOptionsQaValores}
                        size="small"
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={`${String(option.value)}-${index}`}
                              size="small"
                              label={option.label || option.value}
                              variant="outlined"
                              sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Apontamentos"
                            InputLabelProps={{ ...params.InputLabelProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                            inputProps={{ ...params.inputProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                          />
                        )}
                        sx={{ '& .MuiAutocomplete-inputRoot': { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        size="small"
                        label="Observação"
                        value={fbObservacao}
                        onChange={(e) => setFbObservacao(e.target.value)}
                        InputLabelProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                        inputProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={opcoesRecomendacoesAcademy}
                    value={fbRecomendacoesSelecionadas}
                    onChange={(_e, newValue) => {
                      setFbRecomendacoesSelecionadas(newValue);
                    }}
                    disableCloseOnSelect
                    filterSelectedOptions
                    isOptionEqualToValue={(a, b) => a === b}
                    getOptionLabel={(o) => o}
                    filterOptions={filterOptionsColaborador}
                    size="small"
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={`${option}-${index}`}
                          size="small"
                          label={option}
                          variant="outlined"
                          sx={{ fontFamily: 'Poppins', fontSize: '0.7rem' }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Recomendações (módulos e temas do Academy)"
                        InputLabelProps={{ ...params.InputLabelProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                        inputProps={{ ...params.inputProps, sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-inputRoot': { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleFbGerar}
                      disabled={!fbPodeGerar || fbGerando}
                      className="velohub-btn-azul-opaco"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        backgroundColor: '#006AB9 !important',
                        color: '#F3F7FC !important'
                      }}
                    >
                      {fbGerando ? 'Gerando…' : 'Gerar'}
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    size="small"
                    label="Feedback Gerado"
                    value={fbFeedbackGerado}
                    onChange={(e) => setFbFeedbackGerado(e.target.value)}
                    InputLabelProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                    inputProps={{ sx: { fontFamily: 'Poppins', fontSize: '0.8rem' } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleFbSalvar}
                      disabled={!fbPodeEnviar || fbSalvando}
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        backgroundColor: '#15A237 !important',
                        color: '#F3F7FC !important',
                        '&:disabled': { backgroundColor: '#B0BEC5 !important', color: '#F3F7FC !important' }
                      }}
                    >
                      {fbSalvando ? 'Enviando…' : 'Enviar'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card
            sx={{
              position: 'relative',
              borderRadius: '6px',
              boxShadow: QM_SHADOW_SM,
              backgroundColor: 'var(--cor-card)',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: 'auto' },
              overflow: 'hidden',
              ...qmCardSemHoverSomra(QM_SHADOW_SM)
            }}
          >
            <CardContent
              sx={{
                py: 2,
                px: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                '&:last-child': { pb: 2 }
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: 'Poppins', color: '#000058', fontWeight: 600, fontSize: '0.96rem' }}
              >
                Conceder troféu
              </Typography>
              {concederTrofeusCatalogLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={28} sx={{ color: 'var(--blue-medium)' }} />
                </Box>
              ) : (
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="qa-conceder-trofeu-label">Troféu</InputLabel>
                    <Select
                      labelId="qa-conceder-trofeu-label"
                      label="Troféu"
                      value={concederTrofeuId}
                      onChange={(e) => setConcederTrofeuId(e.target.value)}
                      sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                    >
                      <MenuItem value="">
                        <em>Selecione…</em>
                      </MenuItem>
                      {qaTrophiesConcederLista.map((row) => (
                        <MenuItem key={row.id} value={row.id} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                          {row.conquista_titulo || row.id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {qaTrophiesConcederLista.length === 0 && (
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'rgba(0,0,0,0.55)' }}>
                      Nenhum troféu no catálogo. Cadastre em Gestão e Qualidade → Gerenciar → Troféus.
                    </Typography>
                  )}
                  {trofeuConcederSelecionado && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                        gap: 1.25,
                        width: '100%'
                      }}
                    >
                      <Divider sx={{ borderColor: 'rgba(22, 52, 255, 0.12)' }} />

                      <Box>
                        <Typography
                          component="div"
                          variant="caption"
                          sx={{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            color: 'var(--blue-dark)',
                            display: 'block',
                            mb: 0.25,
                            letterSpacing: '0.02em'
                          }}
                        >
                          Título
                        </Typography>
                        <Typography
                          sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.88rem', color: '#000058', wordBreak: 'break-word' }}
                        >
                          {trofeuConcederSelecionado.conquista_titulo?.trim()
                            ? trofeuConcederSelecionado.conquista_titulo
                            : '—'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          component="div"
                          variant="caption"
                          sx={{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            color: 'var(--blue-dark)',
                            display: 'block',
                            mb: 0.25,
                            letterSpacing: '0.02em'
                          }}
                        >
                          Legenda
                        </Typography>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: 'var(--gray)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {trofeuConcederSelecionado.conquista_legenda?.trim()
                            ? trofeuConcederSelecionado.conquista_legenda
                            : '—'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          component="div"
                          variant="caption"
                          sx={{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            color: 'var(--blue-dark)',
                            display: 'block',
                            mb: 0.25,
                            letterSpacing: '0.02em'
                          }}
                        >
                          Classe de XP
                        </Typography>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#000058' }}>
                          {trofeuConcederSelecionado.xpClass != null && String(trofeuConcederSelecionado.xpClass).trim()
                            ? String(trofeuConcederSelecionado.xpClass)
                            : '—'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          minHeight: 140,
                          py: 1,
                          px: 0.5,
                          borderRadius: '4px',
                          border: '1px dashed rgba(22, 52, 255, 0.2)',
                          backgroundColor: 'rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        {trofeuConcederSelecionado.trophy_url ? (
                          <Box
                            component="img"
                            alt={trofeuConcederSelecionado.conquista_titulo || 'Troféu'}
                            src={getTrophyMediabankDisplayUrl(trofeuConcederSelecionado.trophy_url)}
                            sx={{
                              maxHeight: 200,
                              maxWidth: '100%',
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>
                            Sem imagem no catálogo
                          </Typography>
                        )}
                      </Box>

                      {!emailColaboradorFeedback && nomeColaboradorFeedback ? (
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: 'rgba(179,96,0,0.95)' }}>
                          Cadastro sem e-mail para este colaborador: o troféu será gravado; na Academy recomenda-se e-mail para filtrar por colaborador.
                        </Typography>
                      ) : null}

                      <Box sx={{ mt: 'auto', pt: 1, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleConcederTrofeuEnviar}
                          disabled={!concederTrofeuPodeEnviar || concederTrofeuEnviando}
                          sx={{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            textTransform: 'none',
                            backgroundColor: '#1694FF !important',
                            color: '#F3F7FC !important',
                            '&:disabled': { backgroundColor: '#B0BEC5 !important', color: '#F3F7FC !important' }
                          }}
                        >
                          {concederTrofeuEnviando ? 'Enviando…' : 'Enviar'}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
            <Box
              role="status"
              aria-label="Conceder troféu em desenvolvimento"
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 0.75,
                px: 2,
                backgroundColor: 'rgba(243, 247, 252, 0.94)',
                backdropFilter: 'blur(2px)',
                borderRadius: '6px',
                pointerEvents: 'all',
                cursor: 'not-allowed'
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#000058',
                  textAlign: 'center',
                  letterSpacing: '0.02em'
                }}
              >
                Em desenvolvimento
              </Typography>
            </Box>
          </Card>
          </Box>
          )}
        </Box>
      )}


      {currentView === 'gpt' && (
        <Box>
          <Card
            sx={{
              borderRadius: '6px',
              boxShadow: QM_SHADOW_LG,
              ...qmCardSemHoverSomra(QM_SHADOW_LG)
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Poppins',
                    color: '#000058',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    flex: '1 1 auto',
                    minWidth: 0
                  }}
                >
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
                    fontSize: '0.75rem',
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
                gap: 1.5,
                mb: 2,
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>Colaborador *</InputLabel>
                  <Select
                    value={filtrosGPT.colaborador}
                    onChange={(e) => setFiltrosGPT({ ...filtrosGPT, colaborador: e.target.value })}
                    label="Colaborador *"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
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
                        <MenuItem key={funcionario._id} value={nomeColaborador} sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>
                          {nomeColaborador}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>Mês</InputLabel>
                  <Select
                    value={filtrosGPT.mes}
                    onChange={(e) => setFiltrosGPT({ ...filtrosGPT, mes: e.target.value })}
                    label="Mês"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1694FF'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000058'
                      }
                    }}
                  >
                    {MESES.map((mes) => (
                      <MenuItem key={mes} value={mes} sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>
                        {mes}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 96 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>Ano</InputLabel>
                  <Select
                    value={filtrosGPT.ano}
                    onChange={(e) => setFiltrosGPT({ ...filtrosGPT, ano: e.target.value })}
                    label="Ano"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.75rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1694FF'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000058'
                      }
                    }}
                  >
                    {ANOS.map((ano) => (
                      <MenuItem key={ano} value={ano} sx={{ fontFamily: 'Poppins', fontSize: '0.75rem' }}>
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
                    fontSize: '0.75rem',
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
                    fontSize: '0.75rem',
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
                <Alert
                  severity="info"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '0.75rem',
                    py: 0.5,
                    mb: 2,
                    '& .MuiAlert-message': { fontSize: '0.75rem', py: 0.25 }
                  }}
                >
                  Selecione um colaborador para visualizar as análises GPT.
                </Alert>
              )}

              {/* Lista de Análises GPT */}
              {filtrosGPT.colaborador && (
                <Box>
                  {loadingAnalisesGPT && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <LinearProgress sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666', fontSize: '0.75rem' }}>
                        Carregando análises GPT...
                      </Typography>
                    </Box>
                  )}
                  
                  <AnaliseGPTAccordion
                    analises={analisesGPT}
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
        <DialogTitle
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            color: '#000058',
            fontSize: '0.96rem',
            py: 1.6,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            columnGap: 2,
            rowGap: 1
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              color: '#000058',
              fontSize: '0.96rem',
              flexShrink: 0
            }}
          >
            {avaliacaoEditando ? 'Editar Avaliação' : 'Nova Avaliação'}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              flexWrap: 'wrap'
            }}
            aria-label="Alternar entre avaliação de ligação e de ticket"
          >
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontFamily: 'Poppins',
                fontWeight: formData.tipoAvaliacao === 'ligacao' ? 600 : 500,
                color: formData.tipoAvaliacao === 'ligacao' ? '#000058' : '#8a94a0',
                fontSize: '0.8rem'
              }}
            >
              Ligação
            </Typography>
            <Switch
              size="small"
              checked={formData.tipoAvaliacao === 'ticket'}
              onChange={(e) => {
                const toTicket = e.target.checked;
                setFormData((fd) => ({
                  ...fd,
                  tipoAvaliacao: toTicket ? 'ticket' : 'ligacao',
                  ...Object.fromEntries(
                    CAMPOS_CRITERIO_LIGACAO.map((k) => [k, toTicket ? false : fd[k] ?? false])
                  ),
                  ...Object.fromEntries(
                    CAMPOS_CRITERIO_TICKET.map((k) => [k, !toTicket ? false : fd[k] ?? false])
                  )
                }));
              }}
              inputProps={{ 'aria-label': 'Ligação ou Ticket' }}
            />
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontFamily: 'Poppins',
                fontWeight: formData.tipoAvaliacao === 'ticket' ? 600 : 500,
                color: formData.tipoAvaliacao === 'ticket' ? '#000058' : '#8a94a0',
                fontSize: '0.8rem'
              }}
            >
              Ticket
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ fontSize: '0.8rem' }}>
          <Grid container spacing={1.6} sx={{ mt: 0.8 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                size="small"
                className="velohub-select-alinhado"
                options={opcoesColaboradorModal}
                value={formData.colaboradorNome ? formData.colaboradorNome : null}
                onChange={(_e, newValue) => {
                  setFormData({ ...formData, colaboradorNome: newValue || '' });
                }}
                isOptionEqualToValue={(option, value) => option === value}
                filterOptions={filterOptionsColaborador}
                noOptionsText="Nenhum colaborador encontrado"
                ListboxProps={{
                  sx: { fontFamily: 'Poppins', fontSize: '0.8rem', maxHeight: 280 }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Colaborador"
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      sx: {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        color: '#000058',
                        '&.Mui-focused': { color: '#006AB9' }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        '& fieldset': { borderColor: '#000058' },
                        '&:hover fieldset': { borderColor: '#006AB9' },
                        '&.Mui-focused fieldset': { borderColor: '#006AB9' }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            {user?._funcoesAdministrativas?.avaliador !== true ? (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel
                    id="qualidade-modal-avaliador-label"
                    shrink
                    sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}
                  >
                    Avaliador
                  </InputLabel>
                  <Select
                    labelId="qualidade-modal-avaliador-label"
                    value={formData.avaliador}
                    onChange={(e) => setFormData({ ...formData, avaliador: e.target.value })}
                    label="Avaliador"
                    size="small"
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return '';
                      return (
                        <span style={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>Avaliador selecionado</span>
                      );
                    }}
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
                    <MenuItem value="" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                      <em>Selecione</em>
                    </MenuItem>
                    {opcoesAvaliadorModal.map((avaliador) => (
                      <MenuItem key={avaliador} value={avaliador} sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                        {avaliador}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : null}
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
                label={formData.tipoAvaliacao === 'ticket' ? 'Data do Chamado' : 'Data da Ligação Avaliada'}
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
              {formData.tipoAvaliacao === 'ticket' ? (
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Ticket nº"
                  type="text"
                  inputMode="numeric"
                  value={formData.numeroTicket}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, numeroTicket: digits });
                  }}
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
              ) : (
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
              )}
            </Grid>
            
            {formData.tipoAvaliacao === 'ticket' ? (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ mt: 1.6, mb: 0.8, borderColor: 'rgba(0, 0, 88, 0.12)' }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      color: '#000058',
                      mb: 1.6,
                      fontSize: '0.96rem'
                    }}
                  >
                    Critérios de Avaliação
                  </Typography>
                </Grid>
                <CriteriosModalTicket formData={formData} setFormData={setFormData} />
              </>
            ) : (
              <>
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
                  borderRadius: '4px',
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
                  borderRadius: '4px',
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
                  borderRadius: '4px',
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
                borderRadius: '4px',
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
                  borderRadius: '4px',
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
                borderRadius: '4px',
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
                borderRadius: '4px',
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
              </>
            )}
            
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
                  <Box sx={{ p: 2, backgroundColor: 'var(--cor-container)', borderRadius: '4px' }}>
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
                    <Box sx={{ p: 2, backgroundColor: 'var(--cor-container)', borderRadius: '4px' }}>
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
              <Autocomplete
                fullWidth
                size="small"
                className="velohub-select-alinhado"
                options={opcoesColaboradorFiltrosLista}
                value={filtros.colaborador ? filtros.colaborador : null}
                onChange={(_e, newValue) => {
                  setFiltros({ ...filtros, colaborador: newValue || '' });
                }}
                isOptionEqualToValue={(option, value) => option === value}
                filterOptions={filterOptionsColaborador}
                noOptionsText="Nenhum colaborador encontrado"
                ListboxProps={{
                  sx: { fontFamily: 'Poppins', fontSize: '0.8rem', maxHeight: 280 }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Colaborador"
                    placeholder="Todos"
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      sx: {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        color: '#000058',
                        '&.Mui-focused': { color: '#006AB9' }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        '& fieldset': { borderColor: '#000058' },
                        '&:hover fieldset': { borderColor: '#006AB9' },
                        '&.Mui-focused fieldset': { borderColor: '#006AB9' }
                      }
                    }}
                  />
                )}
              />
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
