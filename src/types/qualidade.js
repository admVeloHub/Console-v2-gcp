// VERSION: v1.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

/**
 * @typedef {Object} Funcionario
 * @property {string} id
 * @property {string} nomeCompleto
 * @property {string} dataAniversario
 * @property {string} empresa
 * @property {string} dataContratado
 * @property {string} [telefone]
 * @property {string} [atuacao]
 * @property {string} [escala]
 * @property {Acesso[]} acessos
 * @property {boolean} desligado
 * @property {string} [dataDesligamento]
 * @property {boolean} afastado
 * @property {string} [dataAfastamento]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Acesso
 * @property {string} id
 * @property {string} sistema
 * @property {string} [perfil]
 * @property {string} [observacoes]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} FuncionarioFormData
 * @property {string} nomeCompleto
 * @property {string} dataAniversario
 * @property {string} empresa
 * @property {string} dataContratado
 * @property {string} [telefone]
 * @property {string} [atuacao]
 * @property {string} [escala]
 * @property {boolean} desligado
 * @property {string} [dataDesligamento]
 * @property {boolean} afastado
 * @property {string} [dataAfastamento]
 */

/**
 * @typedef {Object} AcessoFormData
 * @property {string} sistema
 * @property {string} [perfil]
 * @property {string} [observacoes]
 */

/**
 * @typedef {Object} Avaliacao
 * @property {string} id
 * @property {string} colaboradorId
 * @property {string} colaboradorNome
 * @property {string} avaliador
 * @property {string} mes
 * @property {number} ano
 * @property {string} dataAvaliacao
 * @property {string} [arquivoLigacao] - Base64 para arquivos pequenos
 * @property {DriveFile} [arquivoDrive] - Dados do Google Drive para arquivos grandes
 * @property {string} [nomeArquivo]
 * @property {boolean} saudacaoAdequada
 * @property {boolean} escutaAtiva
 * @property {boolean} resolucaoQuestao
 * @property {boolean} empatiaCordialidade
 * @property {boolean} direcionouPesquisa
 * @property {boolean} procedimentoIncorreto
 * @property {boolean} encerramentoBrusco
 * @property {boolean} moderado
 * @property {string} observacoesModeracao
 * @property {number} pontuacaoTotal
 * @property {AvaliacaoGPT} [avaliacaoGPT]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AvaliacaoGPT
 * @property {string} id
 * @property {string} avaliacaoId
 * @property {string} analiseGPT
 * @property {number} pontuacaoGPT
 * @property {Object} criteriosGPT
 * @property {boolean} criteriosGPT.saudacaoAdequada
 * @property {boolean} criteriosGPT.escutaAtiva
 * @property {boolean} criteriosGPT.resolucaoQuestao
 * @property {boolean} criteriosGPT.empatiaCordialidade
 * @property {boolean} criteriosGPT.direcionouPesquisa
 * @property {boolean} criteriosGPT.procedimentoIncorreto
 * @property {boolean} criteriosGPT.encerramentoBrusco
 * @property {number} confianca - 0-100
 * @property {string[]} [palavrasCriticas] - Palavras-chave críticas mencionadas pelo cliente
 * @property {string[]} [calculoDetalhado] - Cálculo detalhado da pontuação por critério
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AvaliacaoFormData
 * @property {string} colaboradorId
 * @property {string} avaliador
 * @property {string} mes
 * @property {number} ano
 * @property {boolean} saudacaoAdequada
 * @property {boolean} escutaAtiva
 * @property {boolean} resolucaoQuestao
 * @property {boolean} empatiaCordialidade
 * @property {boolean} direcionouPesquisa
 * @property {boolean} procedimentoIncorreto
 * @property {boolean} encerramentoBrusco
 * @property {File} [arquivoLigacao]
 * @property {string} [observacoesModeracao]
 */

/**
 * @typedef {Object} RelatorioAgente
 * @property {string} colaboradorId
 * @property {string} colaboradorNome
 * @property {Avaliacao[]} avaliacoes
 * @property {number} mediaAvaliador
 * @property {number} mediaGPT
 * @property {number} totalAvaliacoes
 * @property {number} melhorNota
 * @property {number} piorNota
 * @property {'melhorando'|'piorando'|'estavel'} tendencia
 */

/**
 * @typedef {Object} RelatorioGestao
 * @property {string} mes
 * @property {number} ano
 * @property {number} totalAvaliacoes
 * @property {number} mediaGeral
 * @property {Array<{colaboradorId: string, colaboradorNome: string, nota: number, posicao: number}>} top3Melhores
 * @property {Array<{colaboradorId: string, colaboradorNome: string, nota: number, posicao: number}>} top3Piores
 * @property {Array<{colaboradorId: string, colaboradorNome: string, nota: number, posicao: number}>} colaboradores
 */

/**
 * @typedef {Object} MesesAno
 * @property {string} mes
 * @property {number} ano
 */

/**
 * @typedef {Object} DriveFile
 * @property {string} id
 * @property {string} name
 * @property {string} webViewLink
 * @property {number} size
 * @property {string} mimeType
 */

// Tipos para o módulo de qualidade integrado

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ANOS = [2025, 2026, 2027, 2028];

// Constantes de pontuação
export const PONTUACAO = {
  SAUDACAO_ADEQUADA: 10,
  ESCUTA_ATIVA: 25,
  RESOLUCAO_QUESTAO: 40,
  EMPATIA_CORDIALIDADE: 15,
  DIRECIONOU_PESQUISA: 10,
  PROCEDIMENTO_INCORRETO: -60,
  ENCERRAMENTO_BRUSCO: -100
};

// Função para gerar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função para calcular pontuação total
export const calcularPontuacaoTotal = (avaliacao) => {
  let total = 0;
  
  if (avaliacao.saudacaoAdequada) total += PONTUACAO.SAUDACAO_ADEQUADA;
  if (avaliacao.escutaAtiva) total += PONTUACAO.ESCUTA_ATIVA;
  if (avaliacao.resolucaoQuestao) total += PONTUACAO.RESOLUCAO_QUESTAO;
  if (avaliacao.empatiaCordialidade) total += PONTUACAO.EMPATIA_CORDIALIDADE;
  if (avaliacao.direcionouPesquisa) total += PONTUACAO.DIRECIONOU_PESQUISA;
  if (avaliacao.procedimentoIncorreto) total += PONTUACAO.PROCEDIMENTO_INCORRETO;
  if (avaliacao.encerramentoBrusco) total += PONTUACAO.ENCERRAMENTO_BRUSCO;
  
  return total;
};

// Função para obter status da pontuação
export const getStatusPontuacao = (pontuacao) => {
  // Validar se pontuacao é um número válido
  const pontuacaoNum = typeof pontuacao === 'number' ? pontuacao : 0;
  
  if (pontuacaoNum >= 80) return { status: 'excelente', cor: '#10B981', texto: 'Excelente' };
  if (pontuacaoNum >= 60) return { status: 'bom', cor: '#3B82F6', texto: 'Bom' };
  if (pontuacaoNum >= 40) return { status: 'regular', cor: '#F59E0B', texto: 'Regular' };
  return { status: 'ruim', cor: '#EF4444', texto: 'Ruim' };
};
