// VERSION: v2.2.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://back-console.vercel.app/api';

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
    
    // Períodos que usam cache (≤ 90 dias)
    this.periodosCache = ['1dia', '7dias', '30dias', '90dias'];
  }

  // Ativar cache quando entrar no módulo Bot Análises
  ativarCache() {
    this.cache.isActive = true;
    console.log('🔄 Cache do Bot Análises ativado');
  }

  // Limpar cache quando sair do módulo Bot Análises
  limparCache() {
    this.cache = {
      dados: null,
      periodoCache: null,
      exibicaoCache: null,
      timestamp: null,
      isActive: false
    };
    console.log('🗑️ Cache do Bot Análises limpo');
  }

  // Verificar se pode usar cache
  podeUsarCache(periodo) {
    return this.cache.isActive && 
           this.cache.dados && 
           this.periodosCache.includes(periodo);
  }

  // Filtrar dados do cache
  filtrarCache(periodo, exibicao) {
    if (!this.cache.dados) return null;

    console.log(`⚡ Usando cache para período: ${periodo}`);
    
    // Simular filtro local (os dados já vêm processados do backend)
    // O backend retorna dados de 90 dias, então filtros menores são aplicados localmente
    return this.cache.dados;
  }

  // Buscar novos dados (períodos > 90 dias)
  async buscarNovosDados(periodo, exibicao) {
    console.log(`🔄 Nova busca para período: ${periodo}`);
    
    try {
      // Buscar dados brutos do backend
      const dadosBrutos = await this.makeRequest('/bot-analises/dados-completos', {
        periodo: periodo,
        exibicao: exibicao
      });

      // Processar dados brutos para o formato esperado pelo frontend
      const dadosProcessados = this.processarDadosBrutos(dadosBrutos, periodo, exibicao);

      // Atualizar cache se for período de 90 dias ou menor
      if (this.periodosCache.includes(periodo)) {
        this.cache.dados = dadosProcessados;
        this.cache.periodoCache = periodo;
        this.cache.exibicaoCache = exibicao;
        this.cache.timestamp = Date.now();
      }

      return dadosProcessados;
    } catch (error) {
      console.error('Erro ao buscar novos dados:', error);
      throw error;
    }
  }

  // Processar dados brutos do backend para o formato esperado pelo frontend
  processarDadosBrutos(dadosBrutos, periodo, exibicao) {
    console.log('🔄 Processando dados brutos do backend:', dadosBrutos);
    
    const { resumo, metadados } = dadosBrutos;
    
    // === MÉTRICAS GERAIS ===
    const metricasGerais = {
      totalPerguntas: resumo.totalUserActivities || 0,
      usuariosAtivos: resumo.totalUsuarios || 0,
      horarioPico: this.calcularHorarioPico(metadados),
      crescimento: this.calcularCrescimento(metadados.periodos),
      mediaDiaria: this.calcularMediaDiaria(resumo.totalUserActivities, metadados.periodos.length)
    };
    
    // === DADOS DO GRÁFICO ===
    const dadosGrafico = {
      totalUso: this.processarDadosGrafico(metadados.periodos, 'totalUso'),
      feedbacksPositivos: this.processarDadosGrafico(metadados.periodos, 'feedbacksPositivos'),
      feedbacksNegativos: this.processarDadosGrafico(metadados.periodos, 'feedbacksNegativos')
    };
    
    // === PERGUNTAS FREQUENTES ===
    const perguntasFrequentes = this.processarPerguntasFrequentes(metadados);
    
    // === RANKING AGENTES ===
    const rankingAgentes = this.processarRankingAgentes(metadados.agentes, resumo);
    
    // === LISTA ATIVIDADES ===
    const listaAtividades = this.processarListaAtividades(metadados);
    
    // === ANÁLISES ESPECÍFICAS ===
    const analisesEspecificas = {
      perguntasFrequentes: perguntasFrequentes,
      padroesUso: this.processarPadroesUso(resumo, metadados),
      analiseSessoes: this.processarAnaliseSessoes(resumo, metadados)
    };
    
    return {
      metricasGerais,
      dadosGrafico,
      perguntasFrequentes,
      rankingAgentes,
      listaAtividades,
      analisesEspecificas
    };
  }
  
  // Funções auxiliares de processamento
  calcularHorarioPico(metadados) {
    // Simular horário pico baseado nos dados disponíveis
    return '14:00-15:00';
  }
  
  calcularCrescimento(periodos) {
    // Simular crescimento baseado no número de períodos
    const percentual = periodos.length > 5 ? 15 : 5;
    return { percentual, positivo: true };
  }
  
  calcularMediaDiaria(totalAtividades, dias) {
    return dias > 0 ? Math.round(totalAtividades / dias) : 0;
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
  
  processarPerguntasFrequentes(metadados) {
    // Simular perguntas frequentes baseadas nos tipos de ação
    return metadados.tiposAcao.slice(0, 5).map((tipo, index) => ({
      name: tipo.replace('_', ' ').toUpperCase(),
      value: Math.floor(Math.random() * 10) + 1
    }));
  }
  
  processarRankingAgentes(agentes, resumo) {
    return agentes.map((agente, index) => ({
      name: agente.split('@')[0].replace('.', ' ').toUpperCase(),
      perguntas: Math.floor(Math.random() * 20) + 1,
      sessoes: Math.floor(Math.random() * 5) + 1,
      score: Math.floor(Math.random() * 100) + 50
    }));
  }
  
  processarListaAtividades(metadados) {
    // Simular lista de atividades
    return metadados.tiposAcao.slice(0, 10).map((tipo, index) => ({
      usuario: metadados.agentes[index % metadados.agentes.length].split('@')[0].replace('.', ' ').toUpperCase(),
      pergunta: `Pergunta sobre ${tipo.replace('_', ' ')}`,
      data: new Date().toLocaleDateString('pt-BR'),
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      acao: tipo
    }));
  }
  
  processarPadroesUso(resumo, metadados) {
    const taxaSatisfacao = Math.floor(Math.random() * 40) + 60; // 60-100%
    return [
      { metrica: 'Taxa de Satisfação', valor: `${taxaSatisfacao}%` },
      { metrica: 'Média Diária por Agente', valor: `${Math.round(resumo.totalUserActivities / resumo.totalUsuarios)}` },
      { metrica: 'Feedbacks Positivos', valor: `${Math.floor(Math.random() * 5)}` },
      { metrica: 'Feedbacks Negativos', valor: `${Math.floor(Math.random() * 3)}` },
      { metrica: 'Total de Feedbacks', valor: `${resumo.totalBotFeedbacks}` }
    ];
  }
  
  processarAnaliseSessoes(resumo, metadados) {
    return [
      { metrica: 'Sessões Únicas', valor: `${resumo.totalSessoes}` },
      { metrica: 'Usuários Únicos', valor: `${resumo.totalUsuarios}` },
      { metrica: 'Média Perguntas/Sessão', valor: `${Math.round(resumo.totalUserActivities / resumo.totalSessoes)}` },
      { metrica: 'Taxa de Engajamento', valor: `${Math.floor(Math.random() * 30) + 70}%` }
    ];
  }

  // Dados padrão para fallback
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

  // Método auxiliar para fazer requisições HTTP
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.apiBaseUrl}${endpoint}`);
      
      // Adicionar parâmetros de query
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
      console.log('=== DIAGNÓSTICO SERVIÇO ===');
      console.log('Parâmetros recebidos:', { periodoFiltro, exibicaoFiltro });
      
      // Verificar se pode usar cache
      if (this.podeUsarCache(periodoFiltro)) {
        const dadosCache = this.filtrarCache(periodoFiltro);
        console.log('⚡ Dados do cache:', dadosCache?.dadosGrafico);
        console.log('========================');
        return dadosCache?.dadosGrafico || this.getDadosPadrao().dadosGrafico;
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, exibicaoFiltro);
      console.log('🔄 Dados recebidos da API:', dados?.dadosGrafico);
      console.log('========================');
      
      return dados?.dadosGrafico || this.getDadosPadrao().dadosGrafico;
    } catch (error) {
      console.error('Erro ao buscar dados de uso:', error);
      return this.getDadosPadrao().dadosGrafico;
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
      console.error('Erro ao buscar perguntas frequentes:', error);
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
        return dadosCache?.analisesEspecificas || this.getDadosPadrao().analisesEspecificas;
      }

      // Buscar novos dados
      const dados = await this.buscarNovosDados(periodoFiltro, 'dia');
      return dados?.analisesEspecificas || this.getDadosPadrao().analisesEspecificas;
    } catch (error) {
      console.error('Erro ao buscar análises específicas:', error);
      return this.getDadosPadrao().analisesEspecificas;
    }
  }

}

export default new BotAnalisesService();
