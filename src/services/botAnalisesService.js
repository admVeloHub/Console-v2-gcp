// VERSION: v2.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

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
      const dados = await this.makeRequest('/bot-analises/dados-completos', {
        periodo: periodo,
        exibicao: exibicao
      });

      // Atualizar cache se for período de 90 dias ou menor
      if (this.periodosCache.includes(periodo)) {
        this.cache.dados = dados;
        this.cache.periodoCache = periodo;
        this.cache.exibicaoCache = exibicao;
        this.cache.timestamp = Date.now();
      }

      return dados;
    } catch (error) {
      console.error('Erro ao buscar novos dados:', error);
      throw error;
    }
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
