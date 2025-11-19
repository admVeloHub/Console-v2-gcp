// VERSION: v2.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// REFATORADO: Removida chamada direta à API OpenAI do frontend
// A análise GPT agora acontece via Worker (GCS → Pub/Sub → Worker → OpenAI)
// Este serviço mantém apenas fallback para compatibilidade

// Configurações da API
const API_CONFIG = {
  FALLBACK: {
    ENABLED: true,
    SIMULATION_DELAY: 2000
  }
};

// Prompts para o GPT
const GPT_PROMPTS = {
  ANALISE_LIGACAO: `Você é um especialista em análise de qualidade de atendimento ao cliente. 
Analise a ligação fornecida e avalie os seguintes critérios:

1. SAUDAÇÃO ADEQUADA: O atendente se apresentou adequadamente?
2. ESCUTA ATIVA: O atendente demonstrou escuta ativa e compreensão?
3. RESOLUÇÃO DA QUESTÃO: O problema foi resolvido efetivamente?
4. EMPATIA E CORDIALIDADE: O atendente foi empático e cordial?
5. DIRECIONAMENTO DE PESQUISA: O atendente direcionou adequadamente?
6. PROCEDIMENTO CORRETO: Os procedimentos foram seguidos corretamente?
7. ENCERRAMENTO ADEQUADO: O encerramento foi apropriado?

Responda APENAS em formato JSON com a seguinte estrutura:
{
  "criterios": {
    "saudacaoAdequada": boolean,
    "escutaAtiva": boolean,
    "resolucaoQuestao": boolean,
    "empatiaCordialidade": boolean,
    "direcionouPesquisa": boolean,
    "procedimentoIncorreto": boolean,
    "encerramentoBrusco": boolean
  },
  "pontuacao": number,
  "palavrasCriticas": ["palavra1", "palavra2"],
  "analiseDetalhada": "string",
  "pontosFortes": ["ponto1", "ponto2"],
  "pontosMelhoria": ["melhoria1", "melhoria2"],
  "recomendacoesTreinamento": ["treinamento1", "treinamento2"],
  "trechosDestaque": {
    "positivos": ["trecho1", "trecho2"],
    "melhoria": ["trecho1", "trecho2"],
    "criticos": ["trecho1", "trecho2"]
  },
  "confianca": number,
  "resumoSolicitacao": "string",
  "resumoAtendimento": {
    "duracao": number,
    "interacoes": number,
    "transferencias": boolean,
    "resolvido": boolean,
    "satisfacao": "string"
  }
}`
};

// Classe principal do serviço GPT
class GPTService {
  constructor() {
    this.apiKey = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    // Análise GPT agora acontece via Worker
    // Este serviço mantém apenas fallback para compatibilidade
    this.isConfigured = false;
    console.warn('GPT Service: Análise GPT deve ser feita via Worker. Use uploadAudioParaAnalise() do qualidadeAudioService.js');
  }

  // REMOVIDO: getApiKey, getHeaders, configure
  // API Key não deve mais ser armazenada no frontend
  // A análise GPT acontece via Worker usando Secret Manager

  // Verificar se está configurado
  getConfigurationStatus() {
    return {
      configured: false,
      hasApiKey: false,
      model: 'N/A - Análise via Worker',
      fallbackEnabled: API_CONFIG.FALLBACK.ENABLED,
      message: 'Análise GPT deve ser feita via Worker usando uploadAudioParaAnalise()'
    };
  }

  // Analisar ligação - REMOVIDA chamada direta à OpenAI
  // A análise GPT agora acontece via Worker (GCS → Pub/Sub → Worker → OpenAI)
  // Este método mantém apenas fallback para compatibilidade
  async analyzeCall(avaliacao) {
    console.warn('GPT Service: Chamada direta à OpenAI removida por segurança.');
    console.warn('GPT Service: Use uploadAudioParaAnalise() do qualidadeAudioService.js para análise via Worker.');
    console.warn('GPT Service: Usando análise simulada (fallback).');
    
    return this.fallbackAnalysis(avaliacao);
  }

  // REMOVIDO: callOpenAIAPI
  // Chamadas diretas à API OpenAI não devem acontecer do frontend
  // Use o fluxo: Frontend → Backend → GCS → Pub/Sub → Worker → OpenAI

  // Construir prompt personalizado para a avaliação
  buildPrompt(avaliacao) {
    return `Analise a seguinte ligação:

INFORMAÇÕES DA AVALIAÇÃO:
- ID: ${avaliacao.id}
- Colaborador: ${avaliacao.colaboradorNome}
- Arquivo: ${avaliacao.nomeArquivo || 'Não especificado'}

${avaliacao.arquivoLigacao ? 
  `ARQUIVO DE ÁUDIO DISPONÍVEL: ${avaliacao.arquivoLigacao}
  
  IMPORTANTE: Analise o conteúdo do áudio para fornecer uma avaliação precisa e detalhada.` : 
  'AVISO: Nenhum arquivo de áudio fornecido. Base sua análise nas informações disponíveis.'
}

Por favor, forneça uma análise completa seguindo exatamente o formato JSON especificado nas instruções.`;
  }

  // Validar e transformar resposta da API
  validateAndTransformResponse(response) {
    // Validação básica da estrutura
    const requiredFields = [
      'criterios', 'pontuacao', 'palavrasCriticas', 'analiseDetalhada',
      'pontosFortes', 'pontosMelhoria', 'recomendacoesTreinamento',
      'trechosDestaque', 'confianca', 'resumoSolicitacao', 'resumoAtendimento'
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Campo obrigatório ausente na resposta: ${field}`);
      }
    }

    // Validação dos critérios
    const criteriosRequired = [
      'saudacaoAdequada', 'escutaAtiva', 'resolucaoQuestao',
      'empatiaCordialidade', 'direcionouPesquisa', 'procedimentoIncorreto', 'encerramentoBrusco'
    ];

    for (const criterio of criteriosRequired) {
      if (typeof response.criterios[criterio] !== 'boolean') {
        throw new Error(`Critério ${criterio} deve ser um boolean`);
      }
    }

    // Validação da pontuação
    if (typeof response.pontuacao !== 'number') {
      throw new Error('Pontuação deve ser um número');
    }

    // Validação da confiança
    if (typeof response.confianca !== 'number' || response.confianca < 0 || response.confianca > 100) {
      throw new Error('Confiança deve ser um número entre 0 e 100');
    }

    // Transformar para o formato esperado
    return {
      criterios: response.criterios,
      pontuacao: response.pontuacao,
      palavrasCriticas: Array.isArray(response.palavrasCriticas) ? response.palavrasCriticas : [],
      analiseDetalhada: response.analiseDetalhada,
      pontosFortes: Array.isArray(response.pontosFortes) ? response.pontosFortes : [],
      pontosMelhoria: Array.isArray(response.pontosMelhoria) ? response.pontosMelhoria : [],
      recomendacoesTreinamento: Array.isArray(response.recomendacoesTreinamento) ? response.recomendacoesTreinamento : [],
      trechosDestaque: {
        positivos: Array.isArray(response.trechosDestaque?.positivos) ? response.trechosDestaque.positivos : [],
        melhoria: Array.isArray(response.trechosDestaque?.melhoria) ? response.trechosDestaque.melhoria : [],
        criticos: Array.isArray(response.trechosDestaque?.criticos) ? response.trechosDestaque.criticos : []
      },
      confianca: response.confianca,
      resumoSolicitacao: response.resumoSolicitacao,
      resumoAtendimento: {
        duracao: typeof response.resumoAtendimento.duracao === 'number' ? response.resumoAtendimento.duracao : 0,
        interacoes: typeof response.resumoAtendimento.interacoes === 'number' ? response.resumoAtendimento.interacoes : 0,
        transferencias: typeof response.resumoAtendimento.transferencias === 'boolean' ? response.resumoAtendimento.transferencias : false,
        resolvido: typeof response.resumoAtendimento.resolvido === 'boolean' ? response.resumoAtendimento.resolvido : false,
        satisfacao: typeof response.resumoAtendimento.satisfacao === 'string' ? response.resumoAtendimento.satisfacao : 'Não avaliado'
      }
    };
  }

  // Análise de fallback (simulada)
  async fallbackAnalysis(avaliacao) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.FALLBACK.SIMULATION_DELAY));
    
    // Simular resposta do GPT baseada nos critérios
    const criterios = {
      saudacaoAdequada: Math.random() > 0.3,
      escutaAtiva: Math.random() > 0.2,
      resolucaoQuestao: Math.random() > 0.25,
      empatiaCordialidade: Math.random() > 0.3,
      direcionouPesquisa: Math.random() > 0.4,
      procedimentoIncorreto: Math.random() > 0.1,
      encerramentoBrusco: Math.random() > 0.05
    };

    // Calcular pontuação
    let pontuacao = 0;
    if (criterios.saudacaoAdequada) pontuacao += 10;
    if (criterios.escutaAtiva) pontuacao += 25;
    if (criterios.resolucaoQuestao) pontuacao += 40;
    if (criterios.empatiaCordialidade) pontuacao += 15;
    if (criterios.direcionouPesquisa) pontuacao += 10;
    if (criterios.procedimentoIncorreto) pontuacao -= 60;
    if (criterios.encerramentoBrusco) pontuacao -= 100;

    // Simular palavras críticas
    const palavrasCriticas = ['BACEN', 'PROCON', 'PROCESSO', 'RECLAME AQUI'].filter(() => Math.random() > 0.7);

    // Simular resumo da solicitação
    const resumosSolicitacao = [
      "Cliente solicitou informações sobre restituição de imposto de renda",
      "Cliente questionou sobre prazo para entrega da declaração",
      "Cliente solicitou esclarecimentos sobre deduções permitidas",
      "Cliente reportou problema com acesso ao sistema",
      "Cliente solicitou orientação sobre documentos necessários"
    ];
    
    const resumoSolicitacao = resumosSolicitacao[Math.floor(Math.random() * resumosSolicitacao.length)];

    // Simular resumo do atendimento
    const resumoAtendimento = {
      duracao: Math.floor(Math.random() * 10) + 3,
      interacoes: Math.floor(Math.random() * 8) + 3,
      transferencias: Math.random() > 0.7,
      resolvido: criterios.resolucaoQuestao,
      satisfacao: criterios.empatiaCordialidade ? "Alta" : "Baixa"
    };

    // Gerar análise detalhada
    const analiseDetalhada = this.generateDetailedAnalysis(criterios, pontuacao, palavrasCriticas, avaliacao, resumoSolicitacao, resumoAtendimento);

    // Gerar pontos fortes e de melhoria
    const pontosFortes = [];
    const pontosMelhoria = [];
    
    if (criterios.saudacaoAdequada) pontosFortes.push("Apresentação profissional e identificação clara do cliente");
    if (criterios.escutaAtiva) pontosFortes.push("Demonstração de escuta ativa e compreensão das necessidades");
    if (criterios.resolucaoQuestao) pontosFortes.push("Resolução efetiva e completa do problema apresentado");
    if (criterios.empatiaCordialidade) pontosFortes.push("Tratamento respeitoso e compreensivo com o cliente");
    if (criterios.direcionouPesquisa) pontosFortes.push("Orientação clara sobre próximos passos e procedimentos");
    
    if (!criterios.saudacaoAdequada) pontosMelhoria.push("Necessita melhorar a apresentação inicial e identificação do cliente");
    if (!criterios.escutaAtiva) pontosMelhoria.push("Deve desenvolver técnicas de escuta ativa para melhor compreensão");
    if (!criterios.resolucaoQuestao) pontosMelhoria.push("Necessita aprimorar habilidades de resolução de problemas");
    if (!criterios.empatiaCordialidade) pontosMelhoria.push("Deve trabalhar a empatia e cordialidade no atendimento");
    if (!criterios.direcionouPesquisa) pontosMelhoria.push("Necessita melhorar o direcionamento e orientação ao cliente");
    if (criterios.procedimentoIncorreto) pontosMelhoria.push("URGENTE: Revisar e seguir corretamente os procedimentos operacionais");
    if (criterios.encerramentoBrusco) pontosMelhoria.push("CRÍTICO: Treinar protocolos adequados de encerramento de ligações");

    // Gerar recomendações de treinamento
    const recomendacoesTreinamento = [];
    if (!criterios.saudacaoAdequada) recomendacoesTreinamento.push("Capacitação em Apresentação Profissional");
    if (!criterios.escutaAtiva) recomendacoesTreinamento.push("Técnicas de Escuta Ativa");
    if (criterios.procedimentoIncorreto) recomendacoesTreinamento.push("TREINAMENTO URGENTE - Procedimentos Operacionais");
    if (criterios.encerramentoBrusco) recomendacoesTreinamento.push("TREINAMENTO CRÍTICO - Protocolos de Encerramento");

    // Gerar trechos de destaque
    const trechosDestaque = {
      positivos: [],
      melhoria: [],
      criticos: []
    };

    if (criterios.saudacaoAdequada) trechosDestaque.positivos.push("Bom dia, sou [Nome], como posso ajudá-lo hoje? - Apresentação adequada");
    if (criterios.escutaAtiva) trechosDestaque.positivos.push("Entendo sua situação, deixe-me verificar as informações... - Demonstração de escuta ativa");
    if (criterios.resolucaoQuestao) trechosDestaque.positivos.push("Baseado no que você me relatou, a solução é... - Resolução objetiva");
    
    if (!criterios.saudacaoAdequada) trechosDestaque.melhoria.push("Oi, o que você quer? - Falta de apresentação profissional");
    if (!criterios.escutaAtiva) trechosDestaque.melhoria.push("Espera aí, deixa eu ver... - Falta de atenção ao cliente");
    if (criterios.procedimentoIncorreto) trechosDestaque.melhoria.push("Vou fazer do jeito que acho melhor... - Desvio de procedimento");
    
    if (criterios.encerramentoBrusco) trechosDestaque.criticos.push("Tchau! - Encerramento abrupto e inadequado");
    if (criterios.procedimentoIncorreto) trechosDestaque.criticos.push("Não sei se posso fazer isso, mas vou tentar... - Procedimento inadequado");

    return {
      criterios,
      pontuacao,
      palavrasCriticas,
      analiseDetalhada,
      pontosFortes,
      pontosMelhoria,
      recomendacoesTreinamento,
      trechosDestaque,
      confianca: Math.floor(Math.random() * 30) + 70,
      resumoSolicitacao,
      resumoAtendimento
    };
  }

  // Gerar análise detalhada para fallback
  generateDetailedAnalysis(criterios, pontuacao, palavrasCriticas, avaliacao, resumoSolicitacao, resumoAtendimento) {
    return `# RELATÓRIO DE ANÁLISE - AGENTE GPT (MODO FALLBACK)
*Análise simulada - API OpenAI não configurada*

## 1️⃣ IDENTIFICAÇÃO DA CHAMADA
- **ID da Gravação**: ${avaliacao.id}
- **Data e Hora**: ${new Date().toLocaleString('pt-BR')}
- **Nome/ID do Atendente**: ${avaliacao.colaboradorNome}
- **Protocolo**: ${avaliacao.id.slice(0, 8).toUpperCase()}

## 2️⃣ RESUMO OBJETIVO DA INTERAÇÃO
- **Motivo do Contato**: ${resumoSolicitacao}
- **Resultado Final**: ${resumoAtendimento.resolvido ? 'Problema resolvido com sucesso' : 'Encaminhamento para setor especializado'}

${palavrasCriticas.length > 0 ? `## 🚨 PALAVRAS DO CLIENTE QUE REQUEREM ATENÇÃO
**ALERTA CRÍTICO**: O cliente mencionou as seguintes palavras-chave que indicam situação de risco:
${palavrasCriticas.map(palavra => `• **${palavra}** - Requer atenção imediata e escalonamento`).join('\n')}` : ''}

## 3️⃣ AVALIAÇÃO POR CRITÉRIOS
- **Saudação Adequada**: ${criterios.saudacaoAdequada ? '✅ Adequada' : '❌ Inadequada'}
- **Escuta Ativa**: ${criterios.escutaAtiva ? '✅ Demonstrada' : '❌ Não demonstrada'}
- **Resolução da Questão**: ${criterios.resolucaoQuestao ? '✅ Resolvida' : '❌ Não resolvida'}
- **Empatia e Cordialidade**: ${criterios.empatiaCordialidade ? '✅ Mantida' : '❌ Não mantida'}
- **Direcionamento de Pesquisa**: ${criterios.direcionouPesquisa ? '✅ Realizado' : '❌ Não realizado'}
- **Procedimento Correto**: ${!criterios.procedimentoIncorreto ? '✅ Seguido' : '⚠️ Não seguido'}
- **Encerramento Adequado**: ${!criterios.encerramentoBrusco ? '✅ Adequado' : '🚨 Inadequado'}

## 4️⃣ PONTUAÇÃO
- **Nota Final**: **${pontuacao} pontos**
- **Classificação**: ${pontuacao >= 90 ? 'Excelente' : pontuacao >= 70 ? 'Bom' : pontuacao >= 50 ? 'Regular' : pontuacao >= 30 ? 'Abaixo do Esperado' : pontuacao >= 0 ? 'Inadequado' : 'Crítico'}

## 5️⃣ MÉTRICAS ADICIONAIS
- **Duração da Ligação**: ${resumoAtendimento.duracao} minutos
- **Número de Interações**: ${resumoAtendimento.interacoes} trocas
- **Transferência Realizada**: ${resumoAtendimento.transferencias ? 'Sim' : 'Não'}
- **Nível de Satisfação**: ${resumoAtendimento.satisfacao}

---
*Relatório gerado em modo fallback - Configure a API OpenAI para análises mais precisas*`;
  }

  // Testar conexão - REMOVIDA chamada direta à API
  async testConnection() {
    return {
      success: false,
      message: 'Chamadas diretas à API OpenAI foram removidas por segurança. Use uploadAudioParaAnalise() do qualidadeAudioService.js para análise via Worker.'
    };
  }

  // Obter estatísticas de uso (simulado)
  getUsageStats() {
    return {
      totalAnalyses: parseInt(localStorage.getItem('gpt_total_analyses') || '0'),
      apiCalls: parseInt(localStorage.getItem('gpt_api_calls') || '0'),
      fallbackUses: parseInt(localStorage.getItem('gpt_fallback_uses') || '0')
    };
  }
}

// Instância singleton do serviço
export const gptService = new GPTService();

// Funções de conveniência
// DEPRECATED: analyzeCallWithGPT - Use uploadAudioParaAnalise() do qualidadeAudioService.js
export const analyzeCallWithGPT = (avaliacao) => {
  console.warn('DEPRECATED: analyzeCallWithGPT está deprecado. Use uploadAudioParaAnalise() do qualidadeAudioService.js');
  return gptService.analyzeCall(avaliacao);
};
// REMOVIDO: configureGPT - API Key não deve ser configurada no frontend
export const configureGPT = () => {
  console.warn('DEPRECATED: configureGPT foi removido. API Key é gerenciada via Secret Manager no Worker.');
};
export const getGPTStatus = () => gptService.getConfigurationStatus();
export const testGPTConnection = () => gptService.testConnection();
export const getGPTStats = () => gptService.getUsageStats();
