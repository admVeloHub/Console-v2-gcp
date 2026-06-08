// VERSION: v1.2.0 | DATE: 2026-06-05 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.2.0 - Legado BSON Date: meia-noite UTC = só data; com hora = parede America/Sao_Paulo; normalizarAvaliacaoDataLigacaoLegado
// CHANGELOG: v1.1.0 - dataLigacao String YYYY-MM-DD absoluta (sem Date/UTC); horaLigacao HH:mm absoluta
// CHANGELOG: v1.0.0 - dataLigacao (só data, UTC) + horaLigacao (HH:mm absoluto); leitura legada embutida em dataLigacao

const DATA_LIGACAO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_LIGACAO_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
/** Fuso dos monitores no fluxo legado (data/hora informadas em horário local da operação). */
const LEGACY_WALL_CLOCK_TZ = 'America/Sao_Paulo';

const coerceToDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (DATA_LIGACAO_REGEX.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isUtcMidnight = (d) =>
  d.getUTCHours() === 0 &&
  d.getUTCMinutes() === 0 &&
  d.getUTCSeconds() === 0 &&
  d.getUTCMilliseconds() === 0;

const utcDateYmd = (d) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const wallClockParts = (d, timeZone = LEGACY_WALL_CLOCK_TZ) => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = fmt.formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  let hour = get('hour');
  if (hour === '24') hour = '00';
  return {
    y: get('year'),
    m: get('month'),
    d: get('day'),
    h: hour,
    min: get('minute')
  };
};

/**
 * Normaliza data para YYYY-MM-DD absoluto.
 * Legado BSON Date: meia-noite UTC → dia UTC; com horário → dia em America/Sao_Paulo.
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export const normalizeDataLigacaoInput = (value) => {
  if (value == null || value === '') return '';
  const s = typeof value === 'string' ? value.trim() : '';
  if (DATA_LIGACAO_REGEX.test(s)) return s;

  const d = coerceToDate(value);
  if (!d) return '';

  if (isUtcMidnight(d)) return utcDateYmd(d);

  const { y, m, day } = wallClockParts(d);
  if (!y || !m || !day) return '';
  return `${y}-${m}-${day}`;
};

/** @deprecated Use normalizeDataLigacaoInput */
export const parseDataLigacaoDateOnly = normalizeDataLigacaoInput;

/**
 * Normaliza hora informada pelo monitor (HH:mm, 24h).
 */
export const normalizeHoraLigacaoInput = (hora) => {
  if (hora == null || hora === '') return '';
  const s = String(hora).trim().substring(0, 5);
  return HORA_LIGACAO_REGEX.test(s) ? s : '';
};

/**
 * Hora absoluta: horaLigacao persistido ou legado embutido em dataLigacao Date.
 */
export const resolveHoraLigacao = (avaliacao) => {
  if (!avaliacao) return '';
  const persisted = normalizeHoraLigacaoInput(avaliacao.horaLigacao);
  if (persisted) return persisted;

  const d = coerceToDate(avaliacao.dataLigacao);
  if (!d || isUtcMidnight(d)) return '';

  const { h, min } = wallClockParts(d);
  if (!h && !min) return '';
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

/**
 * Normaliza avaliação ligação para leitura absoluta (inclui legado BSON Date).
 */
export const normalizarAvaliacaoDataLigacaoLegado = (avaliacao) => {
  if (!avaliacao || typeof avaliacao !== 'object') return avaliacao;
  if (avaliacao.tipoAvaliacao === 'ticket') return avaliacao;

  return {
    ...avaliacao,
    dataLigacao: normalizeDataLigacaoInput(avaliacao.dataLigacao),
    horaLigacao: resolveHoraLigacao(avaliacao)
  };
};

export const toDataLigacaoInputValue = (dataLigacao) => normalizeDataLigacaoInput(dataLigacao);

export const formatDataLigacaoDate = (dataLigacao) => {
  const ymd = normalizeDataLigacaoInput(dataLigacao);
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
};

export const dataLigacaoSortKey = (avaliacao) => {
  const ymd = normalizeDataLigacaoInput(avaliacao?.dataLigacao ?? avaliacao?.dataChamado);
  if (!ymd) return '';
  const hora = resolveHoraLigacao(avaliacao) || '00:00';
  return `${ymd}T${hora}`;
};

export const formatDataHoraLigacao = (dataLigacao, horaLigacao, avaliacao) => {
  const ctx = avaliacao || { dataLigacao, horaLigacao };
  const dateStr = formatDataLigacaoDate(ctx.dataLigacao ?? dataLigacao);
  if (!dateStr) return '';
  const hora =
    horaLigacao != null && horaLigacao !== ''
      ? normalizeHoraLigacaoInput(horaLigacao)
      : resolveHoraLigacao(ctx);
  return hora ? `${dateStr} ${hora}` : dateStr;
};
