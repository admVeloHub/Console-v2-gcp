// VERSION: v1.5.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

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
  ESCUTA_ATIVA: 15,                // Reduzido de 25 para 15
  CLAREZA_OBJETIVIDADE: 10,        // NOVO critério
  RESOLUCAO_QUESTAO: 25,           // Reduzido de 40 para 25
  DOMINIO_ASSUNTO: 15,             // NOVO critério
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
  
  // Critérios existentes (compatibilidade retroativa)
  if (avaliacao.saudacaoAdequada) total += PONTUACAO.SAUDACAO_ADEQUADA;
  if (avaliacao.escutaAtiva) total += PONTUACAO.ESCUTA_ATIVA;
  if (avaliacao.resolucaoQuestao) total += PONTUACAO.RESOLUCAO_QUESTAO;
  if (avaliacao.empatiaCordialidade) total += PONTUACAO.EMPATIA_CORDIALIDADE;
  if (avaliacao.direcionouPesquisa) total += PONTUACAO.DIRECIONOU_PESQUISA;
  if (avaliacao.procedimentoIncorreto) total += PONTUACAO.PROCEDIMENTO_INCORRETO;
  if (avaliacao.encerramentoBrusco) total += PONTUACAO.ENCERRAMENTO_BRUSCO;
  
  // Novos critérios (compatibilidade com avaliações antigas)
  if (avaliacao.clarezaObjetividade) total += PONTUACAO.CLAREZA_OBJETIVIDADE;
  if (avaliacao.dominioAssunto) total += PONTUACAO.DOMINIO_ASSUNTO;
  
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

// ===== FUNÇÕES PARA RELATÓRIOS =====

/**
 * Busca avaliações por colaborador
 * @param {string} colaboradorId - ID do colaborador
 * @param {Array} avaliacoes - Array de todas as avaliações
 * @returns {Array} Avaliações do colaborador
 */
export const getAvaliacoesPorColaborador = (colaboradorId, avaliacoes) => {
  if (!colaboradorId || !Array.isArray(avaliacoes)) return [];
  return avaliacoes.filter(a => a.colaboradorId === colaboradorId);
};

/**
 * Busca avaliações por mês e ano
 * @param {string} mes - Mês das avaliações
 * @param {number} ano - Ano das avaliações
 * @param {Array} avaliacoes - Array de todas as avaliações
 * @returns {Array} Avaliações do período
 */
export const getAvaliacoesPorMesAno = (mes, ano, avaliacoes) => {
  if (!mes || !ano || !Array.isArray(avaliacoes)) return [];
  return avaliacoes.filter(a => a.mes === mes && a.ano === ano);
};

/**
 * Gera relatório individual do agente
 * @param {string} colaboradorId - ID do colaborador
 * @param {string} colaboradorNome - Nome do colaborador
 * @param {Array} avaliacoes - Array de avaliações do colaborador
 * @returns {Object|null} Relatório do agente ou null se não houver dados
 */
export const gerarRelatorioAgente = (colaboradorId, colaboradorNome, avaliacoes) => {
  if (!colaboradorId || !colaboradorNome || !Array.isArray(avaliacoes) || avaliacoes.length === 0) {
    return null;
  }

  const notasAvaliador = avaliacoes.map(a => a.pontuacaoTotal || 0);
  const notasGPT = avaliacoes
    .filter(a => a.avaliacaoGPT && a.avaliacaoGPT.pontuacaoGPT)
    .map(a => a.avaliacaoGPT.pontuacaoGPT);

  const mediaAvaliador = notasAvaliador.reduce((a, b) => a + b, 0) / notasAvaliador.length;
  const mediaGPT = notasGPT.length > 0 ? notasGPT.reduce((a, b) => a + b, 0) / notasGPT.length : 0;

  // Calcular tendência (últimas 3 avaliações)
  const ultimasAvaliacoes = avaliacoes
    .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
    .slice(0, 3);

  let tendencia = 'estavel';
  if (ultimasAvaliacoes.length >= 2) {
    const primeira = ultimasAvaliacoes[ultimasAvaliacoes.length - 1].pontuacaoTotal || 0;
    const ultima = ultimasAvaliacoes[0].pontuacaoTotal || 0;
    if (ultima > primeira) tendencia = 'melhorando';
    else if (ultima < primeira) tendencia = 'piorando';
  }

  // Gerar histórico com notas reais, mediana e tendência
  const historico = [];
  
  // Ordenar avaliações por mês/ano da avaliação (cronológica: antigo → recente)
  const avaliacoesOrdenadas = [...avaliacoes].sort((a, b) => {
    // Converter mês/ano para timestamp para ordenação cronológica
    const dataA = new Date(a.ano, MESES.indexOf(a.mes));
    const dataB = new Date(b.ano, MESES.indexOf(b.mes));
    return dataA.getTime() - dataB.getTime();
  });
  
  // Calcular mediana geral
  const notasOrdenadas = notasAvaliador.sort((a, b) => a - b);
  const mediana = notasOrdenadas.length % 2 === 0 
    ? (notasOrdenadas[notasOrdenadas.length / 2 - 1] + notasOrdenadas[notasOrdenadas.length / 2]) / 2
    : notasOrdenadas[Math.floor(notasOrdenadas.length / 2)];
  
  // Gerar pontos para o gráfico (últimas 10 avaliações ou todas se menos)
  const pontosGrafico = Math.min(10, avaliacoesOrdenadas.length);
  const avaliacoesParaGrafico = avaliacoesOrdenadas.slice(-pontosGrafico);
  
  avaliacoesParaGrafico.forEach((avaliacao, index) => {
    // Usar mês/ano da avaliação para o período (ex: "Jan/2024", "Fev/2024")
    const mesAbreviado = avaliacao.mes.substring(0, 3); // Janeiro → Jan
    const periodo = `${mesAbreviado}/${avaliacao.ano}`;
    
    // Calcular tendência (média móvel das últimas 3 avaliações)
    const inicioTendencia = Math.max(0, index - 2);
    const avaliacoesTendencia = avaliacoesParaGrafico.slice(inicioTendencia, index + 1);
    const tendenciaValor = avaliacoesTendencia.reduce((sum, a) => sum + (a.pontuacaoTotal || 0), 0) / avaliacoesTendencia.length;
    
    historico.push({
      periodo,
      notaReal: Math.round((avaliacao.pontuacaoTotal || 0) * 100) / 100,
      mediana: Math.round(mediana * 100) / 100,
      tendencia: Math.round(tendenciaValor * 100) / 100
    });
  });

  return {
    colaboradorId,
    colaboradorNome,
    avaliacoes,
    mediaAvaliador: Math.round(mediaAvaliador * 100) / 100,
    mediaGPT: Math.round(mediaGPT * 100) / 100,
    totalAvaliacoes: avaliacoes.length,
    melhorNota: Math.max(...notasAvaliador),
    piorNota: Math.min(...notasAvaliador),
    tendencia,
    historico
  };
};

/**
 * Gera relatório gerencial da equipe
 * @param {string} mes - Mês do relatório
 * @param {number} ano - Ano do relatório
 * @param {Array} avaliacoes - Array de todas as avaliações
 * @returns {Object|null} Relatório da gestão ou null se não houver dados
 */
export const gerarRelatorioGestao = (mes, ano, avaliacoes) => {
  if (!mes || !ano || !Array.isArray(avaliacoes)) return null;

  const avaliacoesPeriodo = getAvaliacoesPorMesAno(mes, ano, avaliacoes);
  if (avaliacoesPeriodo.length === 0) return null;

  // Agrupar por colaborador
  const colaboradoresMap = new Map();
  
  avaliacoesPeriodo.forEach(avaliacao => {
    if (!colaboradoresMap.has(avaliacao.colaboradorId)) {
      colaboradoresMap.set(avaliacao.colaboradorId, { 
        notas: [], 
        nome: avaliacao.colaboradorNome 
      });
    }
    colaboradoresMap.get(avaliacao.colaboradorId).notas.push(avaliacao.pontuacaoTotal || 0);
  });

  // Calcular médias por colaborador
  const colaboradores = Array.from(colaboradoresMap.entries()).map(([id, data]) => ({
    colaboradorId: id,
    colaboradorNome: data.nome,
    nota: Math.round((data.notas.reduce((a, b) => a + b, 0) / data.notas.length) * 100) / 100
  }));

  // Ordenar por nota (maior para menor)
  colaboradores.sort((a, b) => b.nota - a.nota);

  // Adicionar posições
  colaboradores.forEach((colaborador, index) => {
    colaborador.posicao = index + 1;
  });

  // Calcular média geral
  const mediaGeral = colaboradores.length > 0 
    ? Math.round((colaboradores.reduce((a, b) => a + b.nota, 0) / colaboradores.length) * 100) / 100
    : 0;

  return {
    mes,
    ano,
    totalAvaliacoes: avaliacoesPeriodo.length,
    mediaGeral,
    top3Melhores: colaboradores.slice(0, 3),
    top3Piores: colaboradores.slice(-3).reverse(),
    colaboradores
  };
};

/**
 * Obtém classe CSS para tendência (Material-UI)
 * @param {string} tendencia - Tendência do colaborador
 * @returns {string} Classe CSS
 */
export const getTendenciaClass = (tendencia) => {
  switch (tendencia) {
    case 'melhorando':
      return 'success';
    case 'piorando':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Obtém texto da tendência
 * @param {string} tendencia - Tendência do colaborador
 * @returns {string} Texto da tendência
 */
export const getTendenciaText = (tendencia) => {
  switch (tendencia) {
    case 'melhorando':
      return 'Melhorando';
    case 'piorando':
      return 'Precisa de atenção';
    default:
      return 'Estável';
  }
};

/**
 * Obtém classe CSS para performance (Material-UI)
 * @param {number} nota - Nota do colaborador
 * @returns {string} Classe CSS
 */
export const getPerformanceClass = (nota) => {
  if (nota >= 80) return 'success';
  if (nota >= 60) return 'info';
  if (nota >= 40) return 'warning';
  return 'error';
};

/**
 * Obtém texto da performance
 * @param {number} nota - Nota do colaborador
 * @returns {string} Texto da performance
 */
export const getPerformanceText = (nota) => {
  if (nota >= 80) return 'Excelente';
  if (nota >= 60) return 'Bom';
  if (nota >= 40) return 'Regular';
  return 'Insuficiente';
};

/**
 * Formata data para exibição
 * @param {string} dateString - String da data
 * @returns {string} Data formatada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
