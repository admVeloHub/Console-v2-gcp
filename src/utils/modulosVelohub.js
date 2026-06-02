// VERSION: v1.0.0 | DATE: 2026-05-28 | AUTHOR: VeloHub Development Team

export const MODULOS_VELOHUB_KEYS = [
  'corporativo',
  'atendimento',
  'liberacaoPix',
  'acompanhamento',
  'reclamacoes',
  'sociais',
];

export const MODULOS_VELOHUB_LABELS = {
  corporativo: 'Corporativo',
  atendimento: 'Atendimento',
  liberacaoPix: 'Liberação chave pix',
  acompanhamento: 'Acompanhamento (visão geral)',
  reclamacoes: 'Reclamações',
  sociais: 'Sociais',
};

export function modulosVelohubPadrao() {
  return Object.fromEntries(MODULOS_VELOHUB_KEYS.map((k) => [k, false]));
}

export function normalizarModulosVelohubFromApi(input) {
  const base = modulosVelohubPadrao();
  const arr = Array.isArray(input) ? input : input && typeof input === 'object' ? [input] : [];
  arr.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    MODULOS_VELOHUB_KEYS.forEach((k) => {
      if (item[k] === true) base[k] = true;
    });
  });
  return [base];
}

export function contarModulosAtivos(modulosArr) {
  const flat = normalizarModulosVelohubFromApi(modulosArr)[0] || modulosVelohubPadrao();
  return MODULOS_VELOHUB_KEYS.filter((k) => flat[k] === true).length;
}
