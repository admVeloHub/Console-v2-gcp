// VERSION: v1.17.1 | DATE: 2026-06-05 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.17.1 - dataLigacao String YYYY-MM-DD absoluta (sem Date/fuso)
// CHANGELOG: v1.17.0 - Avaliacao: horaLigacao (String HH:mm absoluto, informado pelo monitor)
// CHANGELOG: v1.16.0 - Relatório agente: melhor/pior média (entre médias mensais); melhor nota ligação e melhor nota ticket (em vez de melhor/pior nota única)
// CHANGELOG: v1.15.0 - Relatório agente: nota do mês e média geral = média aritmética (soma/quantidade) de todas as avaliações do período (ligação + ticket; IA quando somente análise)
// CHANGELOG: v1.14.0 - qualidade_ticket_avaliacoes: critérios com nomes PascalCase (FONTE LISTA_SCHEMAS), alinhado ao backend; calcularPontuacaoTotalTicket / hasAvaliacaoManualSupervisor
// CHANGELOG: v1.13.0 - Qualidade ticket: booleanos em campos pos e neg (qualidade_ticket_avaliacoes); calcularPontuacaoTotal delega a calcularPontuacaoTotalTicket; hasAvaliacaoManualSupervisor
// CHANGELOG: v1.12.0 - calcularPontuacaoTotal: ramo tipoAvaliacao ticket (métricas e pesos distintos da ligação)
// CHANGELOG: v1.11.1 - Release push GitHub 2026-04-10
// CHANGELOG: v1.11.0 - Relatório agente: mediaGPT e gráficos usam avaliacao.avaliacaoIA (campo em qualidade_avaliacoes)
// CHANGELOG: v1.10.0 - somenteAnaliseAudioIA: média/tendência/histórico ignoram nota manual 0 nesse fluxo; mediana e períodos usam nota IA quando só áudio
// CHANGELOG: v1.9.0 - Removida compatibilidade retroativa com dominioAssunto
// CHANGELOG: v1.8.0 - Atualização de métricas: Escuta 15→10pts, Clareza 15→10pts, Empatia 15→10pts, Procedimento -60→-100pts, substituído dominioAssunto por registroAtendimento, adicionado conformidadeTicket -15pts

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
 * @property {string} [dataLigacao] - Data da ligação YYYY-MM-DD (absoluta, informada pelo monitor)
 * @property {string} [horaLigacao] - Hora da ligação HH:mm (absoluta, informada pelo monitor)
 * @property {string} [arquivoLigacao] - Base64 para arquivos pequenos
 * @property {DriveFile} [arquivoDrive] - Dados do Google Drive para arquivos grandes
 * @property {string} [nomeArquivo]
 * @property {boolean} saudacaoAdequada
 * @property {boolean} escutaAtiva
 * @property {boolean} clarezaObjetividade
 * @property {boolean} resolucaoQuestao
 * @property {boolean} registroAtendimento
 * @property {boolean} empatiaCordialidade
 * @property {boolean} direcionouPesquisa
 * @property {boolean} naoConsultouBot
 * @property {boolean} conformidadeTicket
 * @property {boolean} procedimentoIncorreto
 * @property {boolean} encerramentoBrusco
 * @property {boolean} moderado
 * @property {string} observacoesModeracao
 * @property {number} pontuacaoTotal
 * @property {number} [avaliacaoIA] - Nota IA espelhada no documento (worker); exibição Status IA / relatórios
 * @property {boolean} [somenteAnaliseAudioIA] - Registro criado para análise por áudio/IA sem avaliação manual prévia
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
 * @property {boolean} criteriosGPT.clarezaObjetividade
 * @property {boolean} criteriosGPT.resolucaoQuestao
 * @property {boolean} criteriosGPT.registroAtendimento
 * @property {boolean} criteriosGPT.empatiaCordialidade
 * @property {boolean} criteriosGPT.direcionouPesquisa
 * @property {boolean} criteriosGPT.naoConsultouBot
 * @property {boolean} criteriosGPT.conformidadeTicket
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
 * @property {boolean} clarezaObjetividade
 * @property {boolean} resolucaoQuestao
 * @property {boolean} registroAtendimento
 * @property {boolean} empatiaCordialidade
 * @property {boolean} direcionouPesquisa
 * @property {boolean} naoConsultouBot
 * @property {boolean} conformidadeTicket
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
 * @property {number|null} melhorMedia - maior entre as médias por mês/ano (período)
 * @property {number|null} piorMedia - menor entre as médias por mês/ano
 * @property {number|null} melhorNotaLigacao - maior pontuação em avaliações de ligação
 * @property {number|null} melhorNotaTicket - maior pontuação em avaliações de ticket
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
  SAUDACAO_ADEQUADA: 5,            // Mantém 5 pontos
  ESCUTA_ATIVA: 10,                // Reduzido de 15 para 10
  CLAREZA_OBJETIVIDADE: 10,        // Reduzido de 15 para 10
  RESOLUCAO_QUESTAO: 40,           // Mantém 40 pontos
  REGISTRO_ATENDIMENTO: 15,       // Novo - substitui DOMINIO_ASSUNTO
  EMPATIA_CORDIALIDADE: 10,        // Reduzido de 15 para 10
  DIRECIONOU_PESQUISA: 10,         // Mantém 10 pontos
  NAO_CONSULTOU_BOT: -10,          // Mantém -10 pontos
  CONFORMIDADE_TICKET: -15,        // Novo critério detrator
  PROCEDIMENTO_INCORRETO: -100,    // Aumentado de -60 para -100
  ENCERRAMENTO_BRUSCO: -100        // Mantém -100 pontos
};

/** Pontos alinhados ao schema qualidade_ticket_avaliacoes (métricas pos e neg), não reutilizam PONTUACAO de ligação. */
export const PONTUACAO_TICKET = {
  PRODUCAO_TEXTO: 15,
  CLAREZA_OBJETIVIDADE: 15,
  BOA_RESOLUCAO: 30,
  ADERENCIA_ESTRUTURA: 15,
  TABULACAO: 25,
  PASSOU_PRAZO: -30,
  PROCEDIMENTO_INCORRETO: -100,
  NAO_UTILIZOU_BOT: -10
};

/** @param {Object} a documento (ou payload) de avaliação de ticket, com tipoAvaliacao === 'ticket' */
export const isTicketAvaliacao = (a) => a?.tipoAvaliacao === 'ticket';

/** Avaliação criada no fluxo lote / só IA (sem nota manual do supervisor). */
export const isSomenteAnaliseAudioIA = (avaliacao) => avaliacao?.somenteAnaliseAudioIA === true;

/**
 * Há preenchimento de critérios ou pontuação pelo supervisor (fluxo manual).
 * @param {Object} avaliacao
 * @returns {boolean}
 */
export const hasAvaliacaoManualSupervisor = (avaliacao) => {
  if (isSomenteAnaliseAudioIA(avaliacao)) return false;
  const p = avaliacao?.pontuacaoTotal ?? 0;
  if (p > 0) return true;
  if (isTicketAvaliacao(avaliacao)) {
    return Boolean(
      avaliacao?.ProducaoTexto ||
        avaliacao?.ClarezaObjetividade ||
        avaliacao?.BoaResolucaoProcedimento ||
        avaliacao?.AderenciaEstruturaResposta ||
        avaliacao?.Tabulacao ||
        avaliacao?.PassouPrazoResposta ||
        avaliacao?.RepassouProcedimentoIncorreto ||
        avaliacao?.NaoUtilizouBotApoio
    );
  }
  return Boolean(
    avaliacao?.saudacaoAdequada ||
      avaliacao?.escutaAtiva ||
      avaliacao?.clarezaObjetividade ||
      avaliacao?.resolucaoQuestao ||
      avaliacao?.registroAtendimento ||
      avaliacao?.empatiaCordialidade ||
      avaliacao?.direcionouPesquisa ||
      avaliacao?.naoConsultouBot ||
      avaliacao?.conformidadeTicket ||
      avaliacao?.procedimentoIncorreto ||
      avaliacao?.encerramentoBrusco
  );
};

/** Nota para gráficos: manual ou pontuação IA quando só áudio (campo avaliacaoIA no doc). */
const pontuacaoParaGrafico = (avaliacao) => {
  if (!isSomenteAnaliseAudioIA(avaliacao)) {
    return avaliacao?.pontuacaoTotal ?? 0;
  }
  const ia = avaliacao?.avaliacaoIA;
  return ia != null && ia !== '' && !Number.isNaN(Number(ia)) ? Number(ia) : null;
};

/**
 * Média aritmética (soma / quantidade) das notas consideradas no relatório do agente.
 * Inclui ligação e ticket (pontuacaoTotal) e, no fluxo somente análise IA, avaliacaoIA.
 * Itens sem nota numérica entram fora do somatório e do denominador.
 * @param {Array} avaliacoes
 * @returns {number|null} null se não houver nenhuma nota válida
 */
const mediaAritmeticaRelatorioAgente = (avaliacoes) => {
  if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) return null;
  const notas = avaliacoes
    .map((a) => pontuacaoParaGrafico(a))
    .filter((n) => n != null && !Number.isNaN(n));
  if (notas.length === 0) return null;
  return (
    Math.round(
      (notas.reduce((s, n) => s + n, 0) / notas.length) * 100
    ) / 100
  );
};

// Função para gerar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/** Pontuação de ticket (console_analises.qualidade_ticket_avaliacoes: campos booleanos em PascalCase). */
export const calcularPontuacaoTotalTicket = (avaliacao) => {
  if (!avaliacao || typeof avaliacao !== 'object') return 0;
  let total = 0;
  if (avaliacao.ProducaoTexto) total += PONTUACAO_TICKET.PRODUCAO_TEXTO;
  if (avaliacao.ClarezaObjetividade) total += PONTUACAO_TICKET.CLAREZA_OBJETIVIDADE;
  if (avaliacao.BoaResolucaoProcedimento) total += PONTUACAO_TICKET.BOA_RESOLUCAO;
  if (avaliacao.AderenciaEstruturaResposta) total += PONTUACAO_TICKET.ADERENCIA_ESTRUTURA;
  if (avaliacao.Tabulacao) total += PONTUACAO_TICKET.TABULACAO;
  if (avaliacao.PassouPrazoResposta) total += PONTUACAO_TICKET.PASSOU_PRAZO;
  if (avaliacao.RepassouProcedimentoIncorreto) total += PONTUACAO_TICKET.PROCEDIMENTO_INCORRETO;
  if (avaliacao.NaoUtilizouBotApoio) total += PONTUACAO_TICKET.NAO_UTILIZOU_BOT;
  return Math.max(0, total);
};

// Função para calcular pontuação total
export const calcularPontuacaoTotal = (avaliacao) => {
  if (isTicketAvaliacao(avaliacao)) {
    return calcularPontuacaoTotalTicket(avaliacao);
  }

  let total = 0;

  if (avaliacao.saudacaoAdequada) total += PONTUACAO.SAUDACAO_ADEQUADA;
  if (avaliacao.escutaAtiva) total += PONTUACAO.ESCUTA_ATIVA;
  if (avaliacao.clarezaObjetividade) total += PONTUACAO.CLAREZA_OBJETIVIDADE;
  if (avaliacao.resolucaoQuestao) total += PONTUACAO.RESOLUCAO_QUESTAO;
  if (avaliacao.registroAtendimento) total += PONTUACAO.REGISTRO_ATENDIMENTO;
  if (avaliacao.empatiaCordialidade) total += PONTUACAO.EMPATIA_CORDIALIDADE;
  if (avaliacao.direcionouPesquisa) total += PONTUACAO.DIRECIONOU_PESQUISA;

  if (avaliacao.naoConsultouBot) total += PONTUACAO.NAO_CONSULTOU_BOT;
  if (avaliacao.conformidadeTicket) total += PONTUACAO.CONFORMIDADE_TICKET;
  if (avaliacao.procedimentoIncorreto) total += PONTUACAO.PROCEDIMENTO_INCORRETO;
  if (avaliacao.encerramentoBrusco) total += PONTUACAO.ENCERRAMENTO_BRUSCO;

  return Math.max(0, total);
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
  const avaliacoesGrafico = avaliacoesParaGrafico || avaliacoesFiltradas;

  if (!colaboradorNome || !Array.isArray(avaliacoesFiltradas) || avaliacoesFiltradas.length === 0) {
    return null;
  }

  const comManual = avaliacoesFiltradas.filter((a) => !isSomenteAnaliseAudioIA(a));
  const mediaAvaliador = mediaAritmeticaRelatorioAgente(avaliacoesFiltradas);

  const notasGPT = avaliacoesFiltradas
    .map((a) => a.avaliacaoIA)
    .filter((n) => n != null && n !== '' && !Number.isNaN(Number(n)))
    .map(Number);

  const mediaGPT =
    notasGPT.length > 0
      ? Math.round((notasGPT.reduce((a, b) => a + b, 0) / notasGPT.length) * 100) / 100
      : null;

  const ultimasAvaliacoes = comManual
    .sort((a, b) => {
      const dataA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : a.dataAvaliacao
          ? new Date(a.dataAvaliacao).getTime()
          : 0;
      const dataB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : b.dataAvaliacao
          ? new Date(b.dataAvaliacao).getTime()
          : 0;
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

  const historico = [];

  const avaliacoesOrdenadas = [...avaliacoesGrafico].sort((a, b) => {
    const mesA = MESES.indexOf(a.mes || '');
    const mesB = MESES.indexOf(b.mes || '');
    const anoA = a.ano || 0;
    const anoB = b.ano || 0;
    if (anoA !== anoB) return anoA - anoB;
    return mesA - mesB;
  });

  const notasGraficoBrutas = avaliacoesOrdenadas
    .map((a) => pontuacaoParaGrafico(a))
    .filter((n) => n != null && !Number.isNaN(n));
  const notasOrdenadas = [...notasGraficoBrutas].sort((a, b) => a - b);
  const mediana =
    notasOrdenadas.length > 0
      ? notasOrdenadas.length % 2 === 0
        ? (notasOrdenadas[notasOrdenadas.length / 2 - 1] +
            notasOrdenadas[notasOrdenadas.length / 2]) /
          2
        : notasOrdenadas[Math.floor(notasOrdenadas.length / 2)]
      : 0;

  const avaliacoesPorPeriodo = {};
  avaliacoesOrdenadas.forEach((avaliacao) => {
    if (!avaliacao.mes || !avaliacao.ano) return;
    const chavePeriodo = `${avaliacao.mes}/${avaliacao.ano}`;
    if (!avaliacoesPorPeriodo[chavePeriodo]) {
      avaliacoesPorPeriodo[chavePeriodo] = [];
    }
    avaliacoesPorPeriodo[chavePeriodo].push(avaliacao);
  });

  const mediasMensais = [];
  Object.keys(avaliacoesPorPeriodo).forEach((chave) => {
    const m = mediaAritmeticaRelatorioAgente(avaliacoesPorPeriodo[chave]);
    if (m != null) mediasMensais.push(m);
  });
  let melhorMedia = null;
  let piorMedia = null;
  if (mediasMensais.length > 0) {
    melhorMedia = Math.round(Math.max(...mediasMensais) * 100) / 100;
    piorMedia = Math.round(Math.min(...mediasMensais) * 100) / 100;
  }

  const notasLigacao = avaliacoesFiltradas
    .filter((a) => !isTicketAvaliacao(a))
    .map((a) => pontuacaoParaGrafico(a))
    .filter((n) => n != null && !Number.isNaN(n));
  const notasTicketAval = avaliacoesFiltradas
    .filter((a) => isTicketAvaliacao(a))
    .map((a) => pontuacaoParaGrafico(a))
    .filter((n) => n != null && !Number.isNaN(n));
  const melhorNotaLigacao =
    notasLigacao.length > 0 ? Math.round(Math.max(...notasLigacao) * 100) / 100 : null;
  const melhorNotaTicket =
    notasTicketAval.length > 0 ? Math.round(Math.max(...notasTicketAval) * 100) / 100 : null;

  const periodosOrdenados = Object.keys(avaliacoesPorPeriodo).sort((a, b) => {
    const [mesA, anoA] = a.split('/');
    const [mesB, anoB] = b.split('/');
    const indiceMesA = MESES.indexOf(mesA);
    const indiceMesB = MESES.indexOf(mesB);
    const numAnoA = parseInt(anoA, 10);
    const numAnoB = parseInt(anoB, 10);
    if (numAnoA !== numAnoB) return numAnoA - numAnoB;
    return indiceMesA - indiceMesB;
  });

  const pontosGrafico = Math.min(30, periodosOrdenados.length);
  const periodosParaGrafico = periodosOrdenados.slice(-pontosGrafico);

  periodosParaGrafico.forEach((chavePeriodo, index) => {
    const avaliacoesNoPeriodo = avaliacoesPorPeriodo[chavePeriodo];
    const mPeriodo = mediaAritmeticaRelatorioAgente(avaliacoesNoPeriodo);
    const mediaNotaNoPeriodo = mPeriodo != null ? mPeriodo : 0;

    const periodo = chavePeriodo;
    const inicioTendencia = Math.max(0, index - 2);
    const periodosTendencia = periodosParaGrafico.slice(inicioTendencia, index + 1);
    const avaliacoesTendencia = periodosTendencia.flatMap((chave) => avaliacoesPorPeriodo[chave]);
    const valsTendencia = avaliacoesTendencia
      .map((a) => pontuacaoParaGrafico(a))
      .filter((n) => n != null && !Number.isNaN(n));
    const tendenciaValor =
      valsTendencia.length > 0
        ? valsTendencia.reduce((sum, n) => sum + n, 0) / valsTendencia.length
        : 0;

    historico.push({
      periodo,
      notaReal: Math.round(mediaNotaNoPeriodo * 100) / 100,
      mediana: Math.round(mediana * 100) / 100,
      tendencia: Math.round(tendenciaValor * 100) / 100
    });
  });

  return {
    colaboradorNome,
    avaliacoes: avaliacoesFiltradas,
    mediaAvaliador,
    mediaGPT: mediaGPT !== null ? Math.round(mediaGPT * 100) / 100 : null,
    totalAvaliacoes: avaliacoesFiltradas.length,
    melhorMedia,
    piorMedia,
    melhorNotaLigacao,
    melhorNotaTicket,
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
