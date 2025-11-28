// VERSION: v1.6.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

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
 * @property {string} colaboradorNome
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
 * @property {string} colaboradorNome
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
 * @property {string} colaboradorNome
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
 * @property {Array<{colaboradorNome: string, colaboradorNome: string, nota: number, posicao: number}>} top3Melhores
 * @property {Array<{colaboradorNome: string, colaboradorNome: string, nota: number, posicao: number}>} top3Piores
 * @property {Array<{colaboradorNome: string, colaboradorNome: string, nota: number, posicao: number}>} colaboradores
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
 * @param {string} colaboradorNome - ID do colaborador
 * @param {Array} avaliacoes - Array de todas as avaliações
 * @returns {Array} Avaliações do colaborador
 */
export const getAvaliacoesPorColaborador = (colaboradorNome, avaliacoes) => {
  if (!colaboradorNome || !Array.isArray(avaliacoes)) return [];
  return avaliacoes.filter(a => a.colaboradorNome === colaboradorNome);
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
 * @param {string} colaboradorNome - Nome do colaborador
 * @param {Array} avaliacoesFiltradas - Array de avaliações filtradas para os cards
 * @param {Array} [avaliacoesParaGrafico] - Array de todas as avaliações para o gráfico (opcional, usa avaliacoesFiltradas se não fornecido)
 * @returns {Object|null} Relatório do agente ou null se não houver dados
 */
export const gerarRelatorioAgente = (colaboradorNome, avaliacoesFiltradas, avaliacoesParaGrafico = null) => {
  // Usar avaliacoesFiltradas como padrão se avaliacoesParaGrafico não for fornecido
  const avaliacoesGrafico = avaliacoesParaGrafico || avaliacoesFiltradas;
  
  if (!colaboradorNome || !Array.isArray(avaliacoesFiltradas) || avaliacoesFiltradas.length === 0) {
    return null;
  }

  // Calcular métricas dos cards usando avaliações filtradas
  const notasAvaliador = avaliacoesFiltradas.map(a => a.pontuacaoTotal || 0);
  const notasGPT = avaliacoesFiltradas
    .filter(a => a.avaliacaoGPT && a.avaliacaoGPT.pontuacaoGPT)
    .map(a => a.avaliacaoGPT.pontuacaoGPT);

  const mediaAvaliador = notasAvaliador.reduce((a, b) => a + b, 0) / notasAvaliador.length;
  const mediaGPT = notasGPT.length > 0 
    ? Math.round((notasGPT.reduce((a, b) => a + b, 0) / notasGPT.length) * 100) / 100
    : null; // Retorna null em vez de 0 quando não há avaliações GPT

  // Calcular tendência (últimas 3 avaliações filtradas)
  const ultimasAvaliacoes = avaliacoesFiltradas
    .sort((a, b) => {
      const dataA = a.createdAt ? new Date(a.createdAt).getTime() : (a.dataAvaliacao ? new Date(a.dataAvaliacao).getTime() : 0);
      const dataB = b.createdAt ? new Date(b.createdAt).getTime() : (b.dataAvaliacao ? new Date(b.dataAvaliacao).getTime() : 0);
      return dataB - dataA;
    })
    .slice(0, 3);

  let tendencia = 'estavel';
  if (ultimasAvaliacoes.length >= 2) {
    const primeira = ultimasAvaliacoes[ultimasAvaliacoes.length - 1].pontuacaoTotal || 0;
    const ultima = ultimasAvaliacoes[0].pontuacaoTotal || 0;
    if (ultima > primeira) tendencia = 'melhorando';
    else if (ultima < primeira) tendencia = 'piorando';
  }

  // Gerar histórico com notas reais, mediana e tendência usando todas as avaliações do gráfico
  const historico = [];
  
  // Ordenar avaliações por período (mes/ano) cronologicamente: antigo → recente
  const avaliacoesOrdenadas = [...avaliacoesGrafico].sort((a, b) => {
    // Criar chave de ordenação: ano primeiro, depois mês
    const mesA = MESES.indexOf(a.mes || '');
    const mesB = MESES.indexOf(b.mes || '');
    const anoA = a.ano || 0;
    const anoB = b.ano || 0;
    
    // Comparar por ano primeiro
    if (anoA !== anoB) {
      return anoA - anoB;
    }
    // Se mesmo ano, comparar por mês
    return mesA - mesB;
  });
  
  // Calcular mediana geral (usando todas as avaliações do gráfico)
  const notasGrafico = avaliacoesOrdenadas.map(a => a.pontuacaoTotal || 0);
  const notasOrdenadas = [...notasGrafico].sort((a, b) => a - b);
  const mediana = notasOrdenadas.length % 2 === 0 
    ? (notasOrdenadas[notasOrdenadas.length / 2 - 1] + notasOrdenadas[notasOrdenadas.length / 2]) / 2
    : notasOrdenadas[Math.floor(notasOrdenadas.length / 2)];
  
  // Agrupar avaliações por período (mes/ano) e calcular média quando houver múltiplas no mesmo período
  const avaliacoesPorPeriodo = {};
  avaliacoesOrdenadas.forEach(avaliacao => {
    // Validar que temos mes e ano
    if (!avaliacao.mes || !avaliacao.ano) return;
    
    // Criar chave única por período (mes/ano)
    const chavePeriodo = `${avaliacao.mes}/${avaliacao.ano}`;
    
    if (!avaliacoesPorPeriodo[chavePeriodo]) {
      avaliacoesPorPeriodo[chavePeriodo] = [];
    }
    avaliacoesPorPeriodo[chavePeriodo].push(avaliacao);
  });
  
  // Converter para array e ordenar por período cronologicamente
  const periodosOrdenados = Object.keys(avaliacoesPorPeriodo).sort((a, b) => {
    // Extrair mes e ano de cada chave
    const [mesA, anoA] = a.split('/');
    const [mesB, anoB] = b.split('/');
    
    const indiceMesA = MESES.indexOf(mesA);
    const indiceMesB = MESES.indexOf(mesB);
    const numAnoA = parseInt(anoA, 10);
    const numAnoB = parseInt(anoB, 10);
    
    // Comparar por ano primeiro
    if (numAnoA !== numAnoB) {
      return numAnoA - numAnoB;
    }
    // Se mesmo ano, comparar por mês
    return indiceMesA - indiceMesB;
  });
  
  // Gerar pontos para o gráfico (últimos 30 períodos ou todos se menos)
  const pontosGrafico = Math.min(30, periodosOrdenados.length);
  const periodosParaGrafico = periodosOrdenados.slice(-pontosGrafico);
  
  periodosParaGrafico.forEach((chavePeriodo, index) => {
    const avaliacoesNoPeriodo = avaliacoesPorPeriodo[chavePeriodo];
    
    // Calcular média quando houver múltiplas avaliações no mesmo período
    const mediaNotaNoPeriodo = avaliacoesNoPeriodo.reduce((sum, a) => sum + (a.pontuacaoTotal || 0), 0) / avaliacoesNoPeriodo.length;
    
    // Formatar período como "Mês/Ano" (ex: "Abril/2025")
    const periodo = chavePeriodo;
    
    // Calcular tendência (média móvel dos últimos 3 períodos)
    const inicioTendencia = Math.max(0, index - 2);
    const periodosTendencia = periodosParaGrafico.slice(inicioTendencia, index + 1);
    const avaliacoesTendencia = periodosTendencia.flatMap(chave => avaliacoesPorPeriodo[chave]);
    const tendenciaValor = avaliacoesTendencia.reduce((sum, a) => sum + (a.pontuacaoTotal || 0), 0) / avaliacoesTendencia.length;
    
    historico.push({
      periodo,
      notaReal: Math.round(mediaNotaNoPeriodo * 100) / 100,
      mediana: Math.round(mediana * 100) / 100,
      tendencia: Math.round(tendenciaValor * 100) / 100
    });
  });

  return {
    colaboradorNome,
    colaboradorNome,
    avaliacoes: avaliacoesFiltradas, // Usar avaliações filtradas para referência
    mediaAvaliador: Math.round(mediaAvaliador * 100) / 100,
    mediaGPT: mediaGPT !== null ? Math.round(mediaGPT * 100) / 100 : null,
    totalAvaliacoes: avaliacoesFiltradas.length,
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
    if (!colaboradoresMap.has(avaliacao.colaboradorNome)) {
      colaboradoresMap.set(avaliacao.colaboradorNome, { 
        notas: [], 
        nome: avaliacao.colaboradorNome 
      });
    }
    colaboradoresMap.get(avaliacao.colaboradorNome).notas.push(avaliacao.pontuacaoTotal || 0);
  });

  // Calcular médias por colaborador
  const colaboradores = Array.from(colaboradoresMap.entries()).map(([id, data]) => ({
    colaboradorNome: id,
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
