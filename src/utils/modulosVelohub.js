// VERSION: v1.2.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.2.0 - Reclamações N1/N2 (retrocompat modulosVelohub.reclamacoes → N2)
// CHANGELOG: v1.1.0 - Chave velobot (visibilidade exclusiva VeloBot no VeloHub; retrocompat atendimento)

export const MODULOS_VELOHUB_KEYS = [
  'corporativo',
  'atendimento',
  'velobot',
  'liberacaoPix',
  'acompanhamento',
  'reclamacoesN1',
  'reclamacoesN2',
  'sociais',
];

export const MODULOS_VELOHUB_LABELS = {
  corporativo: 'Corporativo',
  atendimento: 'Atendimento',
  velobot: 'VeloBot',
  liberacaoPix: 'Liberação chave pix',
  acompanhamento: 'Acompanhamento (visão geral)',
  reclamacoesN1: 'Reclamações - N1',
  reclamacoesN2: 'Reclamações - N2',
  sociais: 'Sociais',
};

export function modulosVelohubPadrao() {
  return Object.fromEntries(MODULOS_VELOHUB_KEYS.map((k) => [k, false]));
}

/** Documentos antigos sem chave velobot: atendimento legado libera VeloBot */
function aplicarRetrocompatVelobotNoItem(item, merged) {
  if (!item || typeof item !== 'object') return;
  const hasVelobotKey =
    Object.prototype.hasOwnProperty.call(item, 'velobot') ||
    Object.prototype.hasOwnProperty.call(item, 'VeloBot');
  if (!hasVelobotKey && item.atendimento === true) {
    merged.velobot = true;
  }
}

/** Legado reclamacoes: true → N2 (todas as abas), se N1/N2 não estiverem no documento */
function aplicarRetrocompatReclamacoesNoItem(item, merged) {
  if (!item || typeof item !== 'object') return;
  const hasN1 = Object.prototype.hasOwnProperty.call(item, 'reclamacoesN1');
  const hasN2 = Object.prototype.hasOwnProperty.call(item, 'reclamacoesN2');
  if (!hasN1 && !hasN2 && item.reclamacoes === true) {
    merged.reclamacoesN2 = true;
  }
}

export function normalizarModulosVelohubFromApi(input) {
  const base = modulosVelohubPadrao();
  const arr = Array.isArray(input) ? input : input && typeof input === 'object' ? [input] : [];
  arr.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    MODULOS_VELOHUB_KEYS.forEach((k) => {
      if (item[k] === true) base[k] = true;
    });
    aplicarRetrocompatVelobotNoItem(item, base);
    aplicarRetrocompatReclamacoesNoItem(item, base);
  });
  return [base];
}

export function contarModulosAtivos(modulosArr) {
  const flat = normalizarModulosVelohubFromApi(modulosArr)[0] || modulosVelohubPadrao();
  return MODULOS_VELOHUB_KEYS.filter((k) => flat[k] === true).length;
}
