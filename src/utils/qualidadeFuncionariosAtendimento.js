/**
 * Filtro de funcionários elegíveis para avaliação de qualidade (função Atendimento).
 * VERSION: v1.1.0 | DATE: 2026-06-02
 * CHANGELOG: v1.1.0 - atuacao [{ funcao }] por extenso (SKYNET v5.27); mantém legado ObjectId/string
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
 * Extrai nome da função de um item de `atuacao` (novo formato, string ou legado ObjectId).
 * @param {unknown} item
 * @returns {string}
 */
function extrairNomeAtuacaoItem(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object' && item.funcao != null) return String(item.funcao).trim();
  return String(item).trim();
}

/**
 * Funcionários ativos (não desligados / não afastados) com função Atendimento na lista `atuacao`.
 * @param {Array} funcionarios
 * @param {{ _id?: string, funcao?: string }|null} funcaoAtendimentoRegistro
 * @returns {Array}
 */
export function filtrarFuncionariosComFuncaoAtendimento(funcionarios, funcaoAtendimentoRegistro) {
  if (!Array.isArray(funcionarios) || !funcaoAtendimentoRegistro) return [];

  const id = funcaoAtendimentoRegistro._id;
  const nomeAlvo = String(funcaoAtendimentoRegistro.funcao || '').trim().toLowerCase();
  if (!id && !nomeAlvo) return [];

  const idStr = id != null ? String(id) : '';

  return funcionarios.filter((func) => {
    if (func.desligado === true || func.afastado === true) return false;

    if (typeof func.atuacao === 'string') {
      const s = func.atuacao.trim().toLowerCase();
      if (nomeAlvo && s === nomeAlvo) return true;
      return s.includes('atendimento');
    }

    if (!Array.isArray(func.atuacao)) return false;

    return func.atuacao.some((item) => {
      const nomeItem = extrairNomeAtuacaoItem(item).toLowerCase();
      if (nomeItem && nomeAlvo) {
        if (nomeItem === nomeAlvo) return true;
        if (nomeItem.includes('atendimento') && nomeAlvo.includes('atendimento')) return true;
      }

      if (idStr) {
        const raw =
          typeof item === 'object' && item != null && item._id != null
            ? String(item._id)
            : String(item).trim();
        return raw === idStr;
      }

      return false;
    });
  });
}
