// VERSION: v1.2.0 | DATE: 2026-03-26 | AUTHOR: VeloHub Development Team

/**
 * Converte título em identificador snake_case ASCII (acentos removidos).
 */
export function tituloParaSnakeCase(str) {
  if (!str || typeof str !== 'string') return '';
  const normalized = str.normalize('NFD').replace(/\p{M}/gu, '');
  let s = normalized.toLowerCase().trim();
  s = s.replace(/[^a-z0-9]+/g, '_');
  s = s.replace(/^_+|_+$/g, '');
  s = s.replace(/_+/g, '_');
  return s || '';
}

/**
 * Gera lista de ids únicos a partir dos títulos (colisão → _2, _3…).
 */
export function uniqueSnakeIdsForTitles(titulos) {
  const used = new Set();
  const result = [];
  for (const t of titulos) {
    let base = tituloParaSnakeCase(t);
    if (!base) base = 'categoria';
    let candidate = base;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${n}`;
      n += 1;
    }
    used.add(candidate);
    result.push(candidate);
  }
  return result;
}

/**
 * Renumera ordem 1..n na ordem atual do array (sem reordenar por campo ordem).
 */
export function renumerarOrdemRascunho(rows) {
  return rows.map((r, i) => ({
    ...r,
    ordem: i + 1
  }));
}

/**
 * Move a linha identificada por draftId para a posição 1-based desejada;
 * as demais linhas deslocam-se. Depois renumera 1..n.
 */
export function inserirCategoriaNaPosicao(rows, draftId, posicao1Based) {
  const n = rows.length;
  if (n === 0) return rows;
  const row = rows.find((r) => r.draftId === draftId);
  if (!row) return renumerarOrdemRascunho(rows);
  const others = rows.filter((r) => r.draftId !== draftId);
  let k = Math.floor(Number(posicao1Based));
  if (!Number.isFinite(k)) k = n;
  k = Math.max(1, Math.min(k, n));
  const insertAt = k - 1;
  const merged = [...others.slice(0, insertAt), row, ...others.slice(insertAt)];
  return renumerarOrdemRascunho(merged);
}

/**
 * Payload final para PUT: usa a ordem das linhas na tela (array).
 */
export function montarPayloadCategorias(rows) {
  const titulos = rows.map((r) =>
    typeof r.categoria_titulo === 'string' ? r.categoria_titulo.trim() : ''
  );
  for (let i = 0; i < titulos.length; i++) {
    if (!titulos[i]) {
      throw new Error(`Preencha o título da categoria na linha ${i + 1}.`);
    }
  }
  const ids = uniqueSnakeIdsForTitles(titulos);
  const Categorias = titulos.map((titulo, i) => ({
    Ordem: i + 1,
    categoria_titulo: titulo,
    categoria_id: ids[i]
  }));
  return { Categorias };
}
