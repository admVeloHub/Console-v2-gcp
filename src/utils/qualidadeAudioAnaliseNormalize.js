/**
 * qualidadeAudioAnaliseNormalize.js
 * Normaliza documentos audio_analise_results (novo LISTA + legado) para view model unificado.
 *
 * VERSION: v1.1.0
 * DATE: 2026-06-05
 * CHANGELOG: v1.1.0 - CRITERIOS_LISTA_BASE, CRITERIOS_EXTENSAO_WORKER, getCriteriosIaParaExibir
 * AUTHOR: VeloHub Development Team
 */

const asNum = (x) => {
  if (typeof x === 'number' && !Number.isNaN(x)) return x;
  if (typeof x === 'string' && x.trim() !== '') {
    const n = Number(x);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};

const idToString = (v) => {
  if (v == null) return null;
  if (typeof v === 'object' && v._id != null) return String(v._id);
  return String(v);
};

function resolveTranscricao(doc) {
  if (Array.isArray(doc.transcricao) && doc.transcricao.length > 0) {
    return doc.transcricao
      .filter((t) => t && (t.role != null || t.fala != null))
      .map((t) => ({
        role: t.role != null ? String(t.role) : '',
        fala: t.fala != null ? String(t.fala) : ''
      }));
  }
  return [];
}

function resolveAnaliseDialogo(doc) {
  if (doc.analiseDialogo && typeof doc.analiseDialogo === 'object') {
    return doc.analiseDialogo;
  }
  return null;
}

function resolveCriteriosDetalhados(doc) {
  if (doc.criteriosDetalhados && typeof doc.criteriosDetalhados === 'object') {
    return { ...doc.criteriosDetalhados };
  }
  const g = doc.gptAnalysis;
  const q = doc.qualityAnalysis;
  if (g?.criterios && typeof g.criterios === 'object') return { ...g.criterios };
  if (q?.criterios && typeof q.criterios === 'object') return { ...q.criterios };
  return {};
}

function resolvePontuacaoCalculada(doc) {
  let p = asNum(doc.pontuacaoCalculada);
  if (p != null) return p;
  p = asNum(doc.pontuacaoConsensual);
  if (p != null) return p;
  p = asNum(doc.pontuacaoGPT);
  if (p != null) return p;
  if (doc.gptAnalysis) {
    p = asNum(doc.gptAnalysis.pontuacao);
    if (p != null) return p;
  }
  if (doc.qualityAnalysis) {
    p = asNum(doc.qualityAnalysis.pontuacao);
    if (p != null) return p;
  }
  return null;
}

function resolveObservacaoGPT(doc) {
  if (doc.observacaoGPT != null && String(doc.observacaoGPT).trim()) {
    return String(doc.observacaoGPT).trim();
  }
  const candidates = [
    doc.analiseGPT,
    doc.gptAnalysis?.analysis,
    doc.qualityAnalysis?.analysis,
    doc.analysis,
    doc.resumoAnalise,
    doc.resumo
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    if (c != null && String(c).trim()) return String(c).trim();
  }
  return '';
}

function resolvePalavrasCriticas(doc) {
  if (Array.isArray(doc.palavrasCriticas) && doc.palavrasCriticas.length > 0) {
    return doc.palavrasCriticas;
  }
  if (Array.isArray(doc.gptAnalysis?.palavrasCriticas) && doc.gptAnalysis.palavrasCriticas.length > 0) {
    return doc.gptAnalysis.palavrasCriticas;
  }
  if (Array.isArray(doc.qualityAnalysis?.palavrasCriticas) && doc.qualityAnalysis.palavrasCriticas.length > 0) {
    return doc.qualityAnalysis.palavrasCriticas;
  }
  return [];
}

function resolveAvaliacaoId(doc) {
  if (doc.avaliacao_id != null) return idToString(doc.avaliacao_id);
  if (doc.avaliacaoId != null) return idToString(doc.avaliacaoId);
  if (doc.avaliacaoMonitorId != null) return idToString(doc.avaliacaoMonitorId);
  return null;
}

function resolveAvaliacaoPopulada(doc) {
  const pop = doc.avaliacaoMonitorId;
  if (pop && typeof pop === 'object' && pop.colaboradorNome != null) return pop;
  const popId = doc.avaliacao_id;
  if (popId && typeof popId === 'object' && popId.colaboradorNome != null) return popId;
  return null;
}

/** Indica se o documento tem conteúdo IA exibível (novo ou legado). */
export function hasConteudoIa(doc) {
  if (!doc) return false;
  const pontuacao = resolvePontuacaoCalculada(doc);
  const observacao = resolveObservacaoGPT(doc);
  const dialogo = resolveAnaliseDialogo(doc);
  const criterios = resolveCriteriosDetalhados(doc);
  const temCriterios = criterios && Object.keys(criterios).length > 0;
  const temTranscricao = resolveTranscricao(doc).length > 0;
  return (
    pontuacao != null ||
    observacao.length > 0 ||
    dialogo != null ||
    temCriterios ||
    temTranscricao ||
    !!doc.gptAnalysis ||
    !!doc.qualityAnalysis
  );
}

/**
 * Normaliza documento para uso na UI, export e mapAudioAnaliseResultDocToGptRow.
 */
export function normalizeAudioAnaliseResult(doc, extras = {}) {
  if (!doc || typeof doc !== 'object') return null;

  const avaliacaoPop = resolveAvaliacaoPopulada(doc);
  const avaliacaoId = resolveAvaliacaoId(doc);
  const pontuacaoCalculada = resolvePontuacaoCalculada(doc);
  const observacaoGPT = resolveObservacaoGPT(doc);
  const criteriosDetalhados = resolveCriteriosDetalhados(doc);
  const transcricao = resolveTranscricao(doc);
  const analiseDialogo = resolveAnaliseDialogo(doc);
  const palavrasCriticas = resolvePalavrasCriticas(doc);

  const colaboradorNome =
    extras.colaboradorNome ??
    doc.colaboradorNome ??
    avaliacaoPop?.colaboradorNome ??
    null;

  const nomeArquivoAudio = doc.nomeArquivoAudio ?? doc.nomeArquivo ?? null;

  return {
    ...doc,
    avaliacaoId,
    avaliacao_id: avaliacaoId,
    colaboradorNome,
    nomeArquivoAudio,
    transcricao,
    analiseDialogo,
    criteriosDetalhados,
    pontuacaoCalculada,
    pontuacaoGPT: pontuacaoCalculada,
    observacaoGPT,
    analiseGPT: observacaoGPT,
    palavrasCriticas,
    criteriosGPT: criteriosDetalhados,
    dataLigacao: extras.dataLigacao ?? doc.dataLigacao ?? avaliacaoPop?.dataLigacao ?? null,
    horaLigacao: extras.horaLigacao ?? doc.horaLigacao ?? avaliacaoPop?.horaLigacao ?? null
  };
}

/** Critérios LISTA_SCHEMAS.rb 549–558 (sempre exibidos no quadro). */
export const CRITERIOS_LISTA_BASE = [
  'saudacaoAdequada',
  'escutaAtiva',
  'clarezaObjetividade',
  'resolucaoQuestao',
  'dominioAssunto',
  'empatiaCordialidade',
  'direcionouPesquisa',
  'procedimentoIncorreto',
  'encerramentoBrusco'
];

/** Extensões persistidas pelo worker quando presentes no documento. */
export const CRITERIOS_EXTENSAO_WORKER = [
  'registroAtendimento',
  'naoConsultouBot',
  'conformidadeTicket'
];

/** Ordem completa para export XLSX e demais usos. */
export const CRITERIOS_IA_ORDEM = [
  ...CRITERIOS_LISTA_BASE,
  ...CRITERIOS_EXTENSAO_WORKER
];

/** Lista de critérios para exibição: base LISTA + extensões só se existirem no doc. */
export function getCriteriosIaParaExibir(criterios) {
  const c = criterios && typeof criterios === 'object' ? criterios : {};
  const lista = [...CRITERIOS_LISTA_BASE];
  CRITERIOS_EXTENSAO_WORKER.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(c, k)) lista.push(k);
  });
  return lista;
}

export const CRITERIO_IA_LABELS = {
  saudacaoAdequada: 'Saudação Adequada',
  escutaAtiva: 'Escuta Ativa',
  clarezaObjetividade: 'Clareza e Objetividade',
  resolucaoQuestao: 'Resolução da Questão',
  dominioAssunto: 'Domínio do Assunto',
  empatiaCordialidade: 'Empatia e Cordialidade',
  direcionouPesquisa: 'Direcionamento de Pesquisa',
  procedimentoIncorreto: 'Procedimento Incorreto',
  encerramentoBrusco: 'Encerramento Brusco',
  registroAtendimento: 'Registro do Atendimento',
  naoConsultouBot: 'Não Consultou Bot',
  conformidadeTicket: 'Inconformidade no Ticket'
};

export const ANALISE_DIALOGO_CARDS = [
  { key: 'temperatura', label: 'Temperatura' },
  { key: 'tensao', label: 'Tensão' },
  { key: 'comportamentoVocal', label: 'Comportamento Vocal' }
];

export function isCriterioIaDetrator(criterio) {
  return (
    criterio === 'naoConsultouBot' ||
    criterio === 'conformidadeTicket' ||
    criterio === 'procedimentoIncorreto' ||
    criterio === 'encerramentoBrusco'
  );
}
