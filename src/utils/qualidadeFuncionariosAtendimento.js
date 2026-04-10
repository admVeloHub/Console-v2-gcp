/**
 * Filtro de funcionários elegíveis para avaliação de qualidade (função Atendimento).
 * VERSION: v1.0.2 | DATE: 2026-04-10
 * CHANGELOG: v1.0.2 - Release push GitHub 2026-04-10
 * CHANGELOG: v1.0.1 - Doc: descrição alinhada ao rótulo de coluna "Atendimento"
 */

/**
 * @param {unknown} response - Resposta bruta de getAll de funções
 * @returns {Array}
 */
export function normalizeFuncoesLista(response) {
  const raw = response?.data ?? response;
  return Array.isArray(raw) ? raw : [];
}

/**
 * Primeira função cujo nome contém "atendimento" (case-insensitive).
 * @param {Array<{ _id?: string, funcao?: string }>} funcoesData
 * @returns {{ _id?: string, funcao?: string }|null}
 */
export function findRegistroFuncaoAtendimento(funcoesData) {
  if (!Array.isArray(funcoesData)) return null;
  return (
    funcoesData.find(
      (f) => f?.funcao && String(f.funcao).toLowerCase().includes('atendimento')
    ) || null
  );
}

/**
 * Funcionários ativos (não desligados / não afastados) com função Atendimento na lista `atuacao`.
 * @param {Array} funcionarios
 * @param {{ _id?: string }|null} funcaoAtendimentoRegistro
 * @returns {Array}
 */
export function filtrarFuncionariosComFuncaoAtendimento(funcionarios, funcaoAtendimentoRegistro) {
  if (!funcaoAtendimentoRegistro?._id || !Array.isArray(funcionarios)) return [];
  const id = funcaoAtendimentoRegistro._id;
  return funcionarios.filter((func) => {
    if (func.desligado === true || func.afastado === true) return false;
    if (Array.isArray(func.atuacao)) {
      return func.atuacao.some(
        (atuacaoId) =>
          atuacaoId === id || atuacaoId?.toString() === id?.toString()
      );
    }
    if (typeof func.atuacao === 'string') {
      return func.atuacao.toLowerCase().includes('atendimento');
    }
    return false;
  });
}
