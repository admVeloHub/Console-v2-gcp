// VERSION: v3.2.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app/api';

// Import do novo endpoint FAQ
import { faqBotAPI } from './api';

class BotAnalisesService {
  constructor() {
    this.apiBaseUrl = API_BASE_URL;
    
    // Cache inteligente com escopo de módulo
    this.cache = {
      dados: null,
      periodoCache: null,
      exibicaoCache: null,
      timestamp: null,
      isActive: false // Indica se o módulo está ativo
    };
    
    // Períodos que usam cache (≤ 30 dias)
    this.periodosCache = ['1dia', '7dias', '30dias'];
    
    // Cache para cálculos pesados
    this.calculosCache = new Map();
    this.calculosCacheTimeout = 2 * 60 * 1000; // 2 minutos
    
    // Sistema de retry
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo base
    
    // Métricas de performance
    this.metricasPerformance = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgResponseTime: 0
    };
    
    // Sistema de agendamento diário
    this.agendamentoAtivo = false;
    this.intervaloAgendamento = null;
    
    // Inicializar agendamento automático
    this.inicializarAgendamentoDiario();
  }

  // ========================================
  // MÉTODOS HELPER
  // ========================================

  // Converter período em número de dias
  obterDiasDoPeriodo(periodo) {
    const map = {
      '1dia': 1,
      '7dias': 7,
      '30dias': 30,
      '90dias': 90,
      '180dias': 180,
      '365dias': 365
    };
    return map[periodo] || 30;
  }

  // Limpar cache do módulo
  limparCache() {
    console.log('🧹 Limpando cache do Bot Análises');
    this.cache = {
      dados: null,
      dadosBrutos: null,
      periodoCache: null,
      exibicaoCache: null,
      timestamp: null,
      isActive: false
    };
  }

  // Ativar cache quando entrar no módulo Bot Análises
  ativarCache() {
    this.cache.isActive = true;
    // Log removido - muito verboso
  }

  // Limpar cache quando sair do módulo Bot Análises
  limparCache() {
    this.cache = {
      dados: null,
      dadosBrutos: null,
      periodoCache: null,
      exibicaoCache: null,
      timestamp: null,
      isActive: false
    };
    // Log removido - muito verboso
  }

  // Verificar se pode usar cache
  podeUsarCache(periodo) {
    if (!this.cache.isActive || !this.cache.dados) return false;
    
    // Cache válido apenas para períodos <= 30 dias
    const periodosComCache = ['1dia', '7dias', '30dias'];
    if (!periodosComCache.includes(periodo)) return false;
    
    const agora = Date.now();
    const tempoDecorrido = agora - this.cache.timestamp;
    const CACHE_VALIDO = 5 * 60 * 1000; // 5 minutos
    
    return tempoDecorrido < CACHE_VALIDO && this.cache.periodoCache === periodo;
  }

  // Filtrar dados do cache
  filtrarCache(periodo, exibicao) {
    if (!this.cache.dados) return null;

    // Log removido - muito verboso para uso frequente de cache
    
    // Retornar dados processados + dados brutos para recálculo de gráficos
    return {
      ...this.cache.dados,
      dadosBrutos: this.cache.dadosBrutos
    };
  }

  // Buscar novos dados (períodos > 90 dias) com retry
  async buscarNovosDados(periodo, exibicao) {
    try {
      // Chamar APENAS /metricas-gerais (retorna tudo)
      const response = await this.makeRequestWithRetry('/bot-analises/metricas-gerais', {
        params: { periodo }
      });

      // Validar resposta
      if (!response.success) {
        throw new Error('Resposta inválida do backend');
      }

      console.log('✅ Dados recebidos do backend:', {
        success: response.success,
        totalPerguntas: response.totalPerguntas || 0,
        totalAtividades: response.dadosBrutos?.atividades?.length || 0
      });

      // Extrair dados diretamente da resposta (backend retorna dados no nível raiz)
      const atividades = response.dadosBrutos?.atividades || [];

      // Montar métricas dos cards usando dados diretos da resposta
      const metricasGerais = {
        totalPerguntas: response.totalPerguntas || 0,
        usuariosAtivos: response.usuariosAtivos || 0,
        horarioPico: response.horarioPico || '00:00-01:00',
        crescimento: response.crescimento || { percentual: 0, positivo: true },
        mediaDiaria: response.mediaDiaria || 0
      };

      // Calcular dados processados no frontend a partir de dadosBrutos
      const dadosProcessados = {
        metricasGerais,
        dadosGrafico: this.calcularDadosGrafico(atividades, exibicao, periodo),
        perguntasFrequentes: this.calcularPerguntasFrequentes(atividades),
        rankingAgentes: this.calcularRankingAgentes(atividades),
        listaAtividades: this.calcularListaAtividades(atividades),
        analisesEspecificas: this.calcularAnalisesEspecificas(atividades)
      };

      console.log('📊 Dados processados:', {
        metricas: dadosProcessados.metricasGerais,
        grafico: Object.keys(dadosProcessados.dadosGrafico.totalUso).length + ' períodos',
        perguntas: dadosProcessados.perguntasFrequentes.length + ' itens',
        ranking: dadosProcessados.rankingAgentes.length + ' agentes',
        atividades: dadosProcessados.listaAtividades.length + ' atividades',
        analises: {
          padroes: dadosProcessados.analisesEspecificas.padroesUso.length + ' padrões',
          sessoes: dadosProcessados.analisesEspecificas.analiseSessoes.length + ' análises'
        }
      });

      // Atualizar cache se for período de 30 dias ou menor
      if (this.periodosCache.includes(periodo)) {
        this.cache.dados = dadosProcessados;
        this.cache.dadosBrutos = { atividades }; // Armazenar dados brutos para recálculo
        this.cache.periodoCache = periodo;
        this.cache.exibicaoCache = exibicao;
        this.cache.timestamp = Date.now();
      }

      return dadosProcessados;
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      throw error;
    }
  }

  // Método auxiliar para extrair horário pico
  extrairHorarioPico(horariosPico) {
    if (!horariosPico || !Array.isArray(horariosPico) || horariosPico.length === 0) {
      return '00:00-01:00';
    }
    
    // Backend já retorna array de horários, pegar o mais frequente
    const horarioMaisFrequente = horariosPico[0];
    
    if (typeof horarioMaisFrequente === 'string') {
      return horarioMaisFrequente;
    }
    
    if (typeof horarioMaisFrequente === 'number') {
      const inicio = horarioMaisFrequente.toString().padStart(2, '0');
      const fim = (horarioMaisFrequente + 1).toString().padStart(2, '0');
      return `${inicio}:00-${fim}:00`;
    }
    
    return '00:00-01:00';
  }

  // Calcular dados do gráfico a partir das atividades
  calcularDadosGrafico(atividades, exibicao, periodoFiltro = null) {
    // Filtrar perguntas e feedbacks
    let perguntas = atividades.filter(item => item.action === 'question_asked');
    let feedbacksPositivos = atividades.filter(item => 
      item.action === 'feedback_given' && 
      item.details?.feedbackType === 'positive'
    );
    let feedbacksNegativos = atividades.filter(item => 
      item.action === 'feedback_given' && 
      item.details?.feedbackType === 'negative'
    );
    
    // Se periodoFiltro fornecido, filtrar pelos últimos N dias com dados
    if (periodoFiltro) {
      const diasPeriodo = this.obterDiasDoPeriodo(periodoFiltro);
      
      // Função auxiliar para filtrar por período
      const filtrarPorPeriodo = (listaAtividades) => {
        if (listaAtividades.length === 0) return [];
        
        // Ordenar atividades por data (mais recente primeiro)
        const atividadesOrdenadas = [...listaAtividades].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Pegar data da atividade mais recente
        const dataUltimaAtividade = new Date(atividadesOrdenadas[0].createdAt);
        const dataLimite = new Date(dataUltimaAtividade.getTime() - (diasPeriodo * 24 * 60 * 60 * 1000));
        
        // Filtrar apenas atividades dentro do período
        return atividadesOrdenadas.filter(item => {
          const dataAtividade = new Date(item.createdAt);
          return dataAtividade >= dataLimite;
        });
      };
      
      perguntas = filtrarPorPeriodo(perguntas);
      feedbacksPositivos = filtrarPorPeriodo(feedbacksPositivos);
      feedbacksNegativos = filtrarPorPeriodo(feedbacksNegativos);
    }

    // Função auxiliar para obter chave do período
    const obterChavePeriodo = (data) => {
      switch (exibicao) {
        case 'dia':
          return data.toISOString().split('T')[0]; // YYYY-MM-DD
        case 'semana':
          const inicioSemana = new Date(data);
          inicioSemana.setDate(data.getDate() - data.getDay());
          return inicioSemana.toISOString().split('T')[0];
        case 'mes':
          return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        default:
          return data.toISOString().split('T')[0];
      }
    };

    // Agrupar perguntas por período
    const totalUso = {};
    perguntas.forEach(item => {
      const data = new Date(item.createdAt);
      const chave = obterChavePeriodo(data);
      totalUso[chave] = (totalUso[chave] || 0) + 1;
    });

    // Agrupar feedbacks positivos por período
    const feedbacksPositivosAgrupados = {};
    feedbacksPositivos.forEach(item => {
      const data = new Date(item.createdAt);
      const chave = obterChavePeriodo(data);
      feedbacksPositivosAgrupados[chave] = (feedbacksPositivosAgrupados[chave] || 0) + 1;
    });

    // Agrupar feedbacks negativos por período
    const feedbacksNegativosAgrupados = {};
    feedbacksNegativos.forEach(item => {
      const data = new Date(item.createdAt);
      const chave = obterChavePeriodo(data);
      feedbacksNegativosAgrupados[chave] = (feedbacksNegativosAgrupados[chave] || 0) + 1;
    });

    return {
      totalUso,
      feedbacksPositivos: feedbacksPositivosAgrupados,
      feedbacksNegativos: feedbacksNegativosAgrupados
    };
  }

  // Calcular perguntas frequentes a partir das atividades
  calcularPerguntasFrequentes(atividades) {
    // Filtrar e normalizar perguntas
    const perguntas = atividades
      .filter(item => {
        const question = item.details?.question;
        return item.action === 'question_asked' && 
               question && 
               !question.includes('@velotax.com.br') &&
               question.trim().length > 0;
      })
      .map(item => {
        let pergunta = item.details.question.toLowerCase().trim();
        pergunta = pergunta.replace(/[.!?]+$/, '');
        return pergunta;
      });

    // Contar frequência
    const frequencia = {};
    perguntas.forEach(pergunta => {
      frequencia[pergunta] = (frequencia[pergunta] || 0) + 1;
    });

    // Ordenar e pegar top 10
    const topPerguntas = Object.entries(frequencia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return topPerguntas.map(([pergunta, count]) => ({
      name: pergunta.length > 30 ? pergunta.substring(0, 30) + '...' : pergunta,
      value: count
    }));
  }

  // Calcular ranking de agentes a partir das atividades
  calcularRankingAgentes(atividades) {
    // Agrupar por usuário
    const atividadePorUsuario = {};
    
    atividades.forEach(item => {
      if (item.colaboradorNome && item.colaboradorNome.includes('@velotax.com.br')) {
        if (!atividadePorUsuario[item.colaboradorNome]) {
          atividadePorUsuario[item.colaboradorNome] = {
            nome: this.getNomeUsuario(item.colaboradorNome),
            perguntas: 0,
            sessoes: new Set()
          };
        }
        
        if (item.action === 'question_asked') {
          atividadePorUsuario[item.colaboradorNome].perguntas++;
        }
        
        if (item.sessionId) {
          atividadePorUsuario[item.colaboradorNome].sessoes.add(item.sessionId);
        }
      }
    });

    // Calcular score e ordenar
    const ranking = Object.entries(atividadePorUsuario)
      .map(([userId, data]) => ({
        name: data.nome,
        perguntas: data.perguntas,
        sessoes: data.sessoes.size,
        score: data.perguntas + (data.sessoes.size * 0.5)
      }))
      .sort((a, b) => b.score - a.score);

    return ranking;
  }

  // Método auxiliar para extrair nome do usuário do email
  getNomeUsuario(email) {
    if (!email) return 'Desconhecido';
    
    // Extrair nome do email
    const nome = email.split('@')[0];
    
    // Capitalizar cada palavra
    return nome.split(/[._-]/)
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(' ');
  }

  // Calcular lista de atividades a partir das atividades
  calcularListaAtividades(atividades) {
    // Processar atividades recentes
    const lista = atividades
      .filter(item => 
        item.action === 'question_asked' && 
        item.details?.question && 
        !item.details.question.includes('@velotax.com.br')
      )
      .map(item => ({
        usuario: this.getNomeUsuario(item.colaboradorNome),
        pergunta: item.details.question.length > 60 
          ? item.details.question.substring(0, 60) + '...' 
          : item.details.question,
        data: new Date(item.createdAt).toLocaleDateString('pt-BR'),
        horario: new Date(item.createdAt).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        acao: 'question_asked'
      }))
      .sort((a, b) => {
        const dataA = new Date(a.data.split('/').reverse().join('-') + ' ' + a.horario);
        const dataB = new Date(b.data.split('/').reverse().join('-') + ' ' + b.horario);
        return dataB - dataA;
      })
      .slice(0, 20); // Top 20 mais recentes

    return lista;
  }

  // Calcular análises específicas a partir das atividades
  calcularAnalisesEspecificas(atividades) {
    // 1. Perguntas Frequentes (já calculadas, mas vamos usar uma versão mais detalhada)
    const perguntasFrequentes = this.calcularPerguntasFrequentes(atividades);

    // 2. Padrões de Uso - análise de horários e dias da semana
    const padroesUso = this.calcularPadroesUso(atividades);

    // 3. Análise de Sessões - duração e comportamento
    const analiseSessoes = this.calcularAnaliseSessoes(atividades);

    return {
      perguntasFrequentes,
      padroesUso,
      analiseSessoes
    };
  }

  // Calcular padrões de uso (horários e dias)
  calcularPadroesUso(atividades) {
    const perguntas = atividades.filter(item => item.action === 'question_asked');
    
    // Análise por horário
    const porHorario = {};
    const porDiaSemana = {};
    
    perguntas.forEach(item => {
      const data = new Date(item.createdAt);
      const hora = data.getHours();
      const diaSemana = data.getDay(); // 0 = domingo, 1 = segunda, etc.
      
      // Agrupar por hora
      porHorario[hora] = (porHorario[hora] || 0) + 1;
      
      // Agrupar por dia da semana
      porDiaSemana[diaSemana] = (porDiaSemana[diaSemana] || 0) + 1;
    });

    // Encontrar horário pico
    const horarioPico = Object.entries(porHorario)
      .sort(([,a], [,b]) => b - a)[0];

    // Encontrar dia mais ativo
    const diaMaisAtivo = Object.entries(porDiaSemana)
      .sort(([,a], [,b]) => b - a)[0];

    return [
      {
        tipo: 'Horário Pico',
        valor: horarioPico ? `${horarioPico[0]}:00` : 'N/A',
        detalhes: horarioPico ? `${horarioPico[1]} perguntas` : 'Sem dados'
      },
      {
        tipo: 'Dia Mais Ativo',
        valor: this.getNomeDiaSemana(diaMaisAtivo ? parseInt(diaMaisAtivo[0]) : 0),
        detalhes: diaMaisAtivo ? `${diaMaisAtivo[1]} perguntas` : 'Sem dados'
      },
      {
        tipo: 'Distribuição',
        valor: `${Object.keys(porHorario).length} horários ativos`,
        detalhes: `Pico: ${horarioPico ? horarioPico[1] : 0} perguntas`
      }
    ];
  }

  // Calcular análise de sessões
  calcularAnaliseSessoes(atividades) {
    // Agrupar por sessionId
    const sessoes = {};
    
    atividades.forEach(item => {
      if (item.sessionId) {
        if (!sessoes[item.sessionId]) {
          sessoes[item.sessionId] = {
            perguntas: 0,
            inicio: null,
            fim: null,
            usuario: item.colaboradorNome
          };
        }
        
        if (item.action === 'question_asked') {
          sessoes[item.sessionId].perguntas++;
        }
        
        const data = new Date(item.createdAt);
        if (!sessoes[item.sessionId].inicio || data < sessoes[item.sessionId].inicio) {
          sessoes[item.sessionId].inicio = data;
        }
        if (!sessoes[item.sessionId].fim || data > sessoes[item.sessionId].fim) {
          sessoes[item.sessionId].fim = data;
        }
      }
    });

    // Calcular estatísticas
    const sessoesArray = Object.values(sessoes);
    const totalSessoes = sessoesArray.length;
    const totalPerguntas = sessoesArray.reduce((sum, sessao) => sum + sessao.perguntas, 0);
    
    // Duração média das sessões
    const duracoes = sessoesArray
      .filter(sessao => sessao.inicio && sessao.fim)
      .map(sessao => sessao.fim - sessao.inicio);
    
    const duracaoMedia = duracoes.length > 0 
      ? Math.round(duracoes.reduce((sum, dur) => sum + dur, 0) / duracoes.length / 1000 / 60) // em minutos
      : 0;

    return [
      {
        tipo: 'Total de Sessões',
        valor: totalSessoes.toString(),
        detalhes: `${totalPerguntas} perguntas no total`
      },
      {
        tipo: 'Duração Média',
        valor: `${duracaoMedia} min`,
        detalhes: `${duracoes.length} sessões analisadas`
      },
      {
        tipo: 'Perguntas por Sessão',
        valor: totalSessoes > 0 ? Math.round(totalPerguntas / totalSessoes) : 0,
        detalhes: 'Média de perguntas por sessão'
      }
    ];
  }

  // Método auxiliar para obter nome do dia da semana
  getNomeDiaSemana(dia) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia] || 'Desconhecido';
  }

  // ========================================
  // SISTEMA DE CACHE DE CÁLCULOS
  // ========================================
  
  // Obter valor do cache de cálculos
  obterCacheCalculo(chave) {
    const item = this.calculosCache.get(chave);
    if (item && Date.now() - item.timestamp < this.calculosCacheTimeout) {
      this.metricasPerformance.cacheHits++;
      return item.valor;
    }
    this.metricasPerformance.cacheMisses++;
    return null;
  }
  
  // Armazenar valor no cache de cálculos
  armazenarCacheCalculo(chave, valor) {
    this.calculosCache.set(chave, {
      valor,
      timestamp: Date.now()
    });
  }
  
  // Limpar cache de cálculos expirado
  limparCacheCalculosExpirado() {
    const agora = Date.now();
    let removidos = 0;
    
    for (const [chave, item] of this.calculosCache.entries()) {
      if (agora - item.timestamp > this.calculosCacheTimeout) {
        this.calculosCache.delete(chave);
        removidos++;
      }
    }
    
    if (removidos > 0) {
      this.logSuccess('limparCacheCalculosExpirado', { removidos });
    }
  }
  
  // Limpeza automática de cache (chamada periódica)
  iniciarLimpezaAutomatica() {
    // Limpar cache a cada 5 minutos
    setInterval(() => {
      this.limparCacheCalculosExpirado();
    }, 5 * 60 * 1000);
  }
  
  // Otimizar performance - debounce para requisições
  debounceRequest(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Funções auxiliares de processamento otimizadas
  calcularHorarioPico(metadados) {
    try {
      // Verificar cache primeiro
      const cacheKey = `horario_${JSON.stringify(metadados.agentes)}`;
      const cached = this.obterCacheCalculo(cacheKey);
      if (cached) {
        return cached;
      }
      
      let resultado;
      
      // Se tivermos dados de horário nos metadados, usar
      if (metadados.horariosPico && Array.isArray(metadados.horariosPico) && metadados.horariosPico.length > 0) {
        resultado = metadados.horariosPico[0];
      } else if (metadados.agentes && metadados.agentes.length > 0) {
        // Calcular baseado nos dados disponíveis
        const horaBase = 14 + (metadados.agentes.length % 4);
        resultado = `${horaBase.toString().padStart(2, '0')}:00-${(horaBase + 1).toString().padStart(2, '0')}:00`;
      } else {
        resultado = '14:00-15:00';
      }
      
      // Armazenar no cache
      this.armazenarCacheCalculo(cacheKey, resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao calcular horário pico:', error);
      return '14:00-15:00';
    }
  }
  
  calcularCrescimento(metadados, resumo) {
    try {
      // Verificar cache primeiro
      const cacheKey = `crescimento_${resumo.totalUsuarios}_${resumo.totalSessoes}`;
      const cached = this.obterCacheCalculo(cacheKey);
      if (cached) {
        return cached;
      }
      
      let resultado;
      
      // Se tivermos dados de crescimento nos metadados, usar
      if (metadados.crescimento && typeof metadados.crescimento === 'object') {
        resultado = metadados.crescimento;
      } else {
        // Calcular crescimento baseado nos dados disponíveis
        const totalUsuarios = resumo.totalUsuarios || 0;
        const totalSessoes = resumo.totalSessoes || 0;
        
        // Calcular percentual baseado na relação usuários/sessões
        let percentual = 0;
        if (totalUsuarios > 0 && totalSessoes > 0) {
          const ratio = totalSessoes / totalUsuarios;
          percentual = Math.min(Math.round(ratio * 10), 50); // Máximo 50%
        }
        
        resultado = { 
          percentual, 
          positivo: percentual >= 0 
        };
      }
      
      // Armazenar no cache
      this.armazenarCacheCalculo(cacheKey, resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao calcular crescimento:', error);
      return { percentual: 0, positivo: true };
    }
  }
  
  calcularMediaDiaria(totalAtividades, dias) {
    try {
      if (!totalAtividades || totalAtividades <= 0 || !dias || dias <= 0) {
        return 0;
      }
      return Math.round(totalAtividades / dias);
    } catch (error) {
      console.error('❌ Erro ao calcular média diária:', error);
      return 0;
    }
  }

  // Obter número de dias baseado no período
  obterDiasDoPeriodo(periodo) {
    const periodosMap = {
      '1dia': 1,
      '7dias': 7,
      '30dias': 30,
      '90dias': 90,
      '1ano': 365,
      'todos': 365
    };
    return periodosMap[periodo] || 7;
  }
  
  processarDadosGrafico(periodos, tipo) {
    const dados = {};
    periodos.forEach(periodo => {
      // Simular dados baseados no tipo
      switch (tipo) {
        case 'totalUso':
          dados[periodo] = Math.floor(Math.random() * 10) + 1;
          break;
        case 'feedbacksPositivos':
          dados[periodo] = Math.floor(Math.random() * 3);
          break;
        case 'feedbacksNegativos':
          dados[periodo] = Math.floor(Math.random() * 2);
          break;
      }
    });
    return dados;
  }
  
  
  

  // Gerar pergunta baseada no tipo de ação
  gerarPerguntaBaseadaNoTipo(tipo) {
    const perguntasMap = {
      'question_asked': 'Como solicitar crédito trabalhador?',
      'feedback_given': 'Qual o status do meu pedido?',
      'article_viewed': 'Como funciona a antecipação?',
      'ai_button_used': 'Preciso de ajuda com meu pedido'
    };
    
    return perguntasMap[tipo] || `Ação: ${tipo.replace('_', ' ')}`;
  }
  

  // Dados padrão vazios (sem fallbacks)
  getDadosPadrao() {
    return {
      metricasGerais: {
        totalPerguntas: 0,
        usuariosAtivos: 0,
        horarioPico: '00:00-01:00',
        crescimento: { percentual: 0, positivo: true },
        mediaDiaria: 0
      },
      dadosGrafico: {
        totalUso: {},
        feedbacksPositivos: {},
        feedbacksNegativos: {}
      },
      perguntasFrequentes: [],
      rankingAgentes: [],
      listaAtividades: [],
      analisesEspecificas: {
        perguntasFrequentes: [],
        padroesUso: [],
        analiseSessoes: []
      }
    };
  }

  // ========================================
  // SISTEMA DE RETRY INTELIGENTE
  // ========================================
  
  // Fazer requisição com retry automático
  async makeRequestWithRetry(endpoint, options = {}, maxRetries = null) {
    const retries = maxRetries || this.maxRetries;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.metricasPerformance.totalRequests++;
        const resultado = await this.makeRequest(endpoint, options);
        
        // Atualizar métricas de performance
        const responseTime = Date.now() - startTime;
        this.atualizarMetricasPerformance(responseTime);
        
        return resultado;
      } catch (error) {
        this.metricasPerformance.errors++;
        
        if (attempt === retries) {
          this.logError('makeRequestWithRetry', error, { 
            endpoint, 
            attempts: attempt,
            maxRetries: retries 
          });
          throw new Error(`Falha após ${retries} tentativas: ${error.message}`);
        }
        
        // Backoff exponencial
        const delay = Math.pow(2, attempt) * this.retryDelay;
        console.warn(`⚠️ Tentativa ${attempt}/${retries} falhou, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Atualizar métricas de performance
  atualizarMetricasPerformance(responseTime) {
    const total = this.metricasPerformance.totalRequests;
    const currentAvg = this.metricasPerformance.avgResponseTime;
    this.metricasPerformance.avgResponseTime = 
      (currentAvg * (total - 1) + responseTime) / total;
  }
  
  // Obter métricas de performance
  obterMetricasPerformance() {
    return {
      ...this.metricasPerformance,
      cacheHitRate: this.metricasPerformance.totalRequests > 0 
        ? (this.metricasPerformance.cacheHits / this.metricasPerformance.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // ========================================
  // SISTEMA DE LOGS ESTRUTURADOS
  // ========================================
  
  // Log de erro estruturado
  logError(contexto, error, dadosAdicionais = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      contexto,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      dadosAdicionais,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      performance: this.obterMetricasPerformance()
    };
    
    console.error('🚨 ERRO ESTRUTURADO:', logEntry);
    
    // Enviar para serviço de monitoramento se disponível
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${contexto}: ${error.message}`,
        fatal: false
      });
    }
  }
  
  // Log de sucesso estruturado
  logSuccess(contexto, dados = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      contexto,
      status: 'success',
      dados,
      performance: this.obterMetricasPerformance()
    };
    
    console.log('✅ SUCESSO ESTRUTURADO:', logEntry);
  }
  
  // Log de warning estruturado
  logWarning(contexto, mensagem, dados = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      contexto,
      status: 'warning',
      mensagem,
      dados,
      performance: this.obterMetricasPerformance()
    };
    
    console.warn('⚠️ WARNING ESTRUTURADO:', logEntry);
  }

  // Método auxiliar para fazer requisições HTTP
  async makeRequest(endpoint, options = {}) {
    try {
      const url = new URL(`${this.apiBaseUrl}${endpoint}`);
      
      // Configurações padrão
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      };

      // Se for GET, adicionar parâmetros de query
      if (config.method === 'GET' && options.params) {
        Object.keys(options.params).forEach(key => {
          if (options.params[key] !== undefined && options.params[key] !== null) {
            url.searchParams.append(key, options.params[key]);
          }
        });
      }

      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  }

  // Métricas Gerais da Operação
  async getMetricasGerais(periodoFiltro = '7dias') {
    try {
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        const dadosCache = this.filtrarCache(periodoFiltro);
        return dadosCache?.metricasGerais || this.getDadosPadrao().metricasGerais;
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, 'dia');
      return dados?.metricasGerais || this.getDadosPadrao().metricasGerais;
    } catch (error) {
      console.error('Erro ao buscar métricas gerais:', error);
      return this.getDadosPadrao().metricasGerais;
    }
  }

  // Dados para gráfico de linhas - Uso da Operação
  async getDadosUsoOperacao(periodoFiltro = '7dias', exibicaoFiltro = 'dia') {
    try {
      console.log(`🔄 getDadosUsoOperacao chamado: periodo=${periodoFiltro}, exibicao=${exibicaoFiltro}`);
      
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        console.log('📦 Usando cache, recalculando gráfico para exibição:', exibicaoFiltro);
        const dadosCache = this.filtrarCache(periodoFiltro);
        if (dadosCache && dadosCache.dadosBrutos) {
          // Recalcular gráfico com a exibição correta E período correto
          const dadosGrafico = this.calcularDadosGrafico(dadosCache.dadosBrutos.atividades, exibicaoFiltro, periodoFiltro);
          console.log('📊 Gráfico recalculado:', Object.keys(dadosGrafico.totalUso).length, 'períodos');
          return dadosGrafico;
        }
      } else {
        // Se não pode usar cache, limpar cache antigo
        this.limparCache();
      }

      console.log('🆕 Buscando novos dados do backend');
      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, exibicaoFiltro);
      
      return dados?.dadosGrafico || { totalUso: {}, feedbacksPositivos: {}, feedbacksNegativos: {} };
    } catch (error) {
      console.error('Erro ao buscar dados de uso:', error);
      return { totalUso: {}, feedbacksPositivos: {}, feedbacksNegativos: {} };
    }
  }

  // Perguntas mais frequentes
  async getPerguntasMaisFrequentes(periodoFiltro = '7dias') {
    try {
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        const dadosCache = this.filtrarCache(periodoFiltro);
        return dadosCache?.perguntasFrequentes || [];
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, 'dia');
      return dados?.perguntasFrequentes || [];
    } catch (error) {
      console.error('❌ Erro ao buscar perguntas frequentes:', error);
      return [];
    }
  }

  // Ranking dos agentes
  async getRankingAgentes(periodoFiltro = '7dias') {
    try {
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        const dadosCache = this.filtrarCache(periodoFiltro);
        return dadosCache?.rankingAgentes || [];
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, 'dia');
      return dados?.rankingAgentes || [];
    } catch (error) {
      console.error('Erro ao buscar ranking de agentes:', error);
      return [];
    }
  }

  // Lista de atividades para o container
  async getListaAtividades(periodoFiltro = '7dias') {
    try {
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        const dadosCache = this.filtrarCache(periodoFiltro);
        return dadosCache?.listaAtividades || [];
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, 'dia');
      return dados?.listaAtividades || [];
    } catch (error) {
      console.error('Erro ao buscar lista de atividades:', error);
      return [];
    }
  }

  // Análises específicas para o container
  async getAnalisesEspecificas(periodoFiltro = '7dias') {
    try {
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        const dadosCache = this.filtrarCache(periodoFiltro);
        return dadosCache?.analisesEspecificas || { perguntasFrequentes: [], padroesUso: [], analiseSessoes: [] };
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, 'dia');
      return dados?.analisesEspecificas || { perguntasFrequentes: [], padroesUso: [], analiseSessoes: [] };
    } catch (error) {
      console.error('Erro ao buscar análises específicas:', error);
      return { perguntasFrequentes: [], padroesUso: [], analiseSessoes: [] };
    }
  }

  // ========================================
  // SISTEMA DE AGENDAMENTO DIÁRIO
  // ========================================

  // Inicializar agendamento automático às 13h e 20:30
  inicializarAgendamentoDiario() {
    if (this.agendamentoAtivo) {
      console.log('⚠️ Agendamento diário já está ativo');
      return;
    }

    console.log('🕐 Inicializando agendamento diário às 13h e 20:30...');
    
    // Verificar a cada minuto se é 13h ou 20:30
    this.intervaloAgendamento = setInterval(() => {
      const agora = new Date();
      const hora = agora.getHours();
      const minuto = agora.getMinutes();
      
      // Executar às 13h00
      if (hora === 13 && minuto === 0) {
        console.log('⏰ Executando agendamento diário às 13h...');
        this.executarAgendamentoDiario();
      }
      
      // Executar às 20:30
      if (hora === 20 && minuto === 30) {
        console.log('⏰ Executando agendamento diário às 20:30...');
        this.executarAgendamentoDiario();
      }
    }, 60000); // Verificar a cada minuto

    this.agendamentoAtivo = true;
    console.log('✅ Agendamento diário ativado - execução às 13h00 e 20:30');
  }

  // Executar tarefa agendada diariamente
  async executarAgendamentoDiario() {
    try {
      console.log('🔄 Iniciando execução do agendamento diário...');
      
      // Buscar contagem das perguntas frequentes dos últimos 7 dias
      const perguntasFrequentes = await this.getPerguntasMaisFrequentes('7dias');
      
      console.log('📊 Perguntas frequentes obtidas:', perguntasFrequentes);
      
      // Calcular total de perguntas
      const totalPerguntas = perguntasFrequentes.reduce((total, item) => total + item.value, 0);
      
      // Extrair apenas os nomes das perguntas (top 10)
      const perguntasTexto = perguntasFrequentes.slice(0, 10).map(item => item.name);
      
      // Preparar dados para envio (novo endpoint específico)
      const dadosParaEnvio = {
        dados: perguntasTexto,
        totalPerguntas: totalPerguntas
      };

      console.log('📤 Enviando dados para faq-bot:', dadosParaEnvio);

      // Enviar para o novo endpoint específico usando faqBotAPI
      const resposta = await faqBotAPI.updateFAQ(dadosParaEnvio);

      console.log('✅ Agendamento diário executado com sucesso:', resposta);
      
      // Salvar timestamp da última execução
      this.salvarUltimaExecucao();
      
    } catch (error) {
      console.error('❌ Erro na execução do agendamento diário:', error);
    }
  }

  // Parar agendamento (para limpeza)
  pararAgendamentoDiario() {
    if (this.intervaloAgendamento) {
      clearInterval(this.intervaloAgendamento);
      this.intervaloAgendamento = null;
      this.agendamentoAtivo = false;
      console.log('🛑 Agendamento diário parado');
    }
  }

  // Verificar status do agendamento
  getStatusAgendamento() {
    return {
      ativo: this.agendamentoAtivo,
      proximaExecucao: this.calcularProximaExecucao(),
      ultimaExecucao: this.getUltimaExecucao()
    };
  }

  // Calcular próxima execução
  calcularProximaExecucao() {
    const agora = new Date();
    const proximaExecucao = new Date();
    
    proximaExecucao.setHours(13, 0, 0, 0);
    
    // Se já passou das 13h hoje, agendar para amanhã
    if (agora.getHours() >= 13) {
      proximaExecucao.setDate(proximaExecucao.getDate() + 1);
    }
    
    return proximaExecucao.toISOString();
  }

  // Obter última execução (simulado - em produção seria salvo no localStorage ou banco)
  getUltimaExecucao() {
    const ultimaExecucao = localStorage.getItem('bot_analises_ultima_execucao');
    return ultimaExecucao || null;
  }

  // Salvar última execução
  salvarUltimaExecucao() {
    localStorage.setItem('bot_analises_ultima_execucao', new Date().toISOString());
  }

}

export default new BotAnalisesService();
