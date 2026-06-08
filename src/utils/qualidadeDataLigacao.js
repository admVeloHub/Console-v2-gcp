// VERSION: v1.3.0 | DATE: 2026-06-08 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.3.0 - coerceToDate: number, $date, prefixo ISO; fallback utcDateYmd; normalizar inclui dataChamado (ticket)
// CHANGELOG: v1.2.0 - Legado BSON Date: meia-noite UTC = só data; com hora = parede America/Sao_Paulo; normalizarAvaliacaoDataLigacaoLegado
// CHANGELOG: v1.1.0 - dataLigacao String YYYY-MM-DD absoluta (sem Date/UTC); horaLigacao HH:mm absoluta
// CHANGELOG: v1.0.0 - dataLigacao (só data, UTC) + horaLigacao (HH:mm absoluto); leitura legada embutida em dataLigacao

const DATA_LIGACAO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_LIGACAO_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
/** Fuso dos monitores no fluxo legado (data/hora informadas em horário local da operação). */
const LEGACY_WALL_CLOCK_TZ = 'America/Sao_Paulo';

const extractYmdPrefix = (s) => {
  if (!s || s.length < 10) return null;
  const prefix = s.substring(0, 10);
  return DATA_LIGACAO_REGEX.test(prefix) ? prefix : null;
};

const coerceToDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (value != null && typeof value === 'object') {
    if (value.$date != null) {
      const d = new Date(value.$date);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value.toISOString === 'function') {
      const d = new Date(value.toISOString());
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (DATA_LIGACAO_REGEX.test(s)) return null;
  const prefix = extractYmdPrefix(s);
  if (prefix) return new Date(`${prefix}T12:00:00.000Z`);
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
  try {
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
  } catch {
    return { y: '', m: '', d: '', h: '', min: '' };
  }
};

/**
 * Normaliza data para YYYY-MM-DD absoluto (fonte: LISTA_SCHEMAS dataLigacao).
 * Legado BSON Date: meia-noite UTC → dia UTC; com horário → dia em America/Sao_Paulo.
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export const normalizeDataLigacaoInput = (value) => {
  if (value == null || value === '') return '';
  if (typeof value === 'string') {
    const s = value.trim();
    if (DATA_LIGACAO_REGEX.test(s)) return s;
    const prefix = extractYmdPrefix(s);
    if (prefix) return prefix;
  }

  const d = coerceToDate(value);
  if (!d) return '';

  if (isUtcMidnight(d)) return utcDateYmd(d);

  const { y, m, day } = wallClockParts(d);
  if (y && m && day) return `${y}-${m}-${day}`;

  return utcDateYmd(d);
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

  const rawData = avaliacao.dataLigacao ?? avaliacao.dataChamado;
  const d = coerceToDate(rawData);
  if (!d || isUtcMidnight(d)) return '';

  const { h, min } = wallClockParts(d);
  if (!h && !min) return '';
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

/**
 * Normaliza avaliação para leitura absoluta (liga: dataLigacao; ticket: dataChamado → dataLigacao na UI).
 */
export const normalizarAvaliacaoDataLigacaoLegado = (avaliacao) => {
  if (!avaliacao || typeof avaliacao !== 'object') return avaliacao;

  const rawData = avaliacao.dataLigacao ?? avaliacao.dataChamado;
  const dataLigacao = normalizeDataLigacaoInput(rawData);
  const horaLigacao = resolveHoraLigacao({ ...avaliacao, dataLigacao: rawData });

  return {
    ...avaliacao,
    dataLigacao,
    horaLigacao
  };
};

export const toDataLigacaoInputValue = (dataLigacao) =>
  normalizeDataLigacaoInput(dataLigacao);

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
  const rawData = ctx.dataLigacao ?? ctx.dataChamado ?? dataLigacao;
  const dateStr = formatDataLigacaoDate(rawData);
  if (!dateStr) return '';
  const hora =
    horaLigacao != null && horaLigacao !== ''
      ? normalizeHoraLigacaoInput(horaLigacao)
      : resolveHoraLigacao(ctx);
  return hora ? `${dateStr} ${hora}` : dateStr;
};
