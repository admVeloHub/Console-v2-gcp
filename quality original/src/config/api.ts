// Configuração das APIs externas
export const API_CONFIG = {
  // OpenAI GPT API
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4o-mini', // ou 'gpt-3.5-turbo' para versão mais econômica
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.3, // Baixa temperatura para respostas mais consistentes
    TIMEOUT: 30000, // 30 segundos
  },
  
  // Configurações de fallback
  FALLBACK: {
    ENABLED: true,
    SIMULATION_DELAY: 2000, // 2 segundos para simulação
  }
};

// Chaves de API (devem ser configuradas via variáveis de ambiente)
export const getApiKey = (service: 'openai'): string | null => {
  if (service === 'openai') {
    // Prioridade: variável de ambiente > localStorage > null
    return (import.meta as any).env.VITE_OPENAI_API_KEY || 
           localStorage.getItem('openai_api_key') || 
           null;
  }
  return null;
};

// Configuração de prompts para GPT
export const GPT_PROMPTS = {
  ANALISE_LIGACAO: `Você é um especialista em qualidade de atendimento ao cliente da empresa Velotax. 
  
Sua tarefa é analisar uma gravação de ligação e avaliar o atendimento baseado nos seguintes critérios:

CRITÉRIOS DE AVALIAÇÃO:
1. Saudação Adequada (+10 pontos): Agente se apresentou corretamente e identificou o cliente
2. Escuta Ativa (+25 pontos): Demonstrou atenção e não interrompeu o cliente
3. Resolução da Questão (+40 pontos): Problema foi resolvido ou encaminhamento correto
4. Empatia e Cordialidade (+15 pontos): Manteve conduta respeitosa e empática
5. Direcionou para Pesquisa (+10 pontos): Orientou sobre próximos passos
6. Procedimento Incorreto (-60 pontos): Seguiu procedimento inadequado
7. Encerramento Brusco (-100 pontos): Encerrou ligação de forma abrupta

INSTRUÇÕES:
- Analise o áudio da ligação fornecida
- Identifique palavras-chave críticas (BACEN, PROCON, PROCESSO, RECLAME AQUI)
- Calcule pontuação baseada nos critérios
- Forneça análise detalhada com exemplos específicos
- Sugira melhorias e treinamentos necessários
- Classifique a confiança da análise (0-100%)

FORMATO DA RESPOSTA:
Responda em JSON com a seguinte estrutura:
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
  "palavrasCriticas": string[],
  "analiseDetalhada": string,
  "pontosFortes": string[],
  "pontosMelhoria": string[],
  "recomendacoesTreinamento": string[],
  "trechosDestaque": {
    "positivos": string[],
    "melhoria": string[],
    "criticos": string[]
  },
  "confianca": number,
  "resumoSolicitacao": string,
  "resumoAtendimento": {
    "duracao": number,
    "interacoes": number,
    "transferencias": boolean,
    "resolvido": boolean,
    "satisfacao": string
  }
}`,

  MODERACAO: `Você é um moderador especialista em qualidade de atendimento. 
  
Analise a avaliação GPT fornecida e valide:
- Precisão dos critérios avaliados
- Adequação da pontuação
- Qualidade das recomendações
- Identificação de pontos críticos

Forneça feedback para melhorar o modelo GPT.`
};

// Configuração de headers para requisições
export const getHeaders = (service: 'openai') => {
  const apiKey = getApiKey(service);
  
  if (service === 'openai') {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {};
};

// Validação de configuração
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!getApiKey('openai')) {
    errors.push('Chave da API OpenAI não configurada');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
