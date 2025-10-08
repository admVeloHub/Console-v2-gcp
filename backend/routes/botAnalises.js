// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const express = require('express');
const { getDatabase } = require('../config/database');
const router = express.Router();

// Middleware para verificar conexão com MongoDB
const checkMongoConnection = (req, res, next) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(503).json({
        error: 'MongoDB não conectado',
        message: 'Serviço temporariamente indisponível'
      });
    }
    req.db = db;
    next();
  } catch (error) {
    res.status(503).json({
      error: 'Erro de conexão com MongoDB',
      message: error.message
    });
  }
};

// Aplicar middleware em todas as rotas
router.use(checkMongoConnection);

// GET /api/bot-analises/metricas-gerais
router.get('/metricas-gerais', async (req, res) => {
  try {
    const { periodo = '7dias' } = req.query;
    const db = req.db;
    
    // Calcular data de início baseada no período
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1dia':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7dias':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(0); // todos
    }
    
    // Buscar dados de atividade do usuário
    const userActivityCollection = db.collection('user_activity');
    const dataFiltrada = await userActivityCollection.find({
      timestamp: { $gte: dataInicio }
    }).toArray();
    
    // Total de perguntas
    const totalPerguntas = dataFiltrada.filter(item => item.action === 'question_asked').length;
    
    // Usuários únicos
    const usuariosUnicos = new Set(
      dataFiltrada
        .map(item => item.userId)
        .filter(userId => userId && userId.includes('@velotax.com.br'))
    ).size;
    
    // Horário pico
    const horarios = dataFiltrada
      .filter(item => item.action === 'question_asked')
      .map(item => {
        const date = new Date(item.timestamp);
        return date.getHours();
      });
    
    let horarioPico;
    if (horarios.length === 0) {
      horarioPico = '00:00-01:00';
    } else {
      const horarioMaisFrequente = getModa(horarios);
      const horarioInicio = horarioMaisFrequente.toString().padStart(2, '0');
      const horarioFim = (horarioMaisFrequente + 1).toString().padStart(2, '0');
      horarioPico = `${horarioInicio}:00-${horarioFim}:00`;
    }
    
    // Taxa de crescimento
    const crescimento = calcularCrescimento(dataFiltrada, periodo);
    
    // Média diária
    const mediaDiaria = calcularMediaDiaria(dataFiltrada, periodo);
    
    res.json({
      totalPerguntas,
      usuariosAtivos: usuariosUnicos,
      horarioPico,
      crescimento,
      mediaDiaria
    });
    
  } catch (error) {
    console.error('Erro ao buscar métricas gerais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/bot-analises/dados-uso-operacao
router.get('/dados-uso-operacao', async (req, res) => {
  try {
    const { periodo = '7dias', exibicao = 'dia' } = req.query;
    const db = req.db;
    
    // Calcular data de início
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1dia':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7dias':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(0);
    }
    
    // Buscar dados de atividade
    const userActivityCollection = db.collection('user_activity');
    const dataFiltrada = await userActivityCollection.find({
      timestamp: { $gte: dataInicio }
    }).toArray();
    
    // Filtrar apenas perguntas
    const perguntasFiltradas = dataFiltrada.filter(item => item.action === 'question_asked');
    
    // Agrupar por período
    const dadosPorPeriodo = agruparPorPeriodo(perguntasFiltradas, exibicao);
    
    // Buscar dados de feedback
    const botFeedbackCollection = db.collection('bot_feedback');
    const feedbackData = await botFeedbackCollection.find({
      createdAt: { $gte: dataInicio }
    }).toArray();
    
    const feedbacksPositivos = agruparPorPeriodo(
      feedbackData.filter(item => item.details?.feedbackType === 'positive'),
      exibicao
    );
    const feedbacksNegativos = agruparPorPeriodo(
      feedbackData.filter(item => item.details?.feedbackType === 'negative'),
      exibicao
    );
    
    res.json({
      totalUso: dadosPorPeriodo,
      feedbacksPositivos,
      feedbacksNegativos
    });
    
  } catch (error) {
    console.error('Erro ao buscar dados de uso:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/bot-analises/perguntas-frequentes
router.get('/perguntas-frequentes', async (req, res) => {
  try {
    const { periodo = '7dias' } = req.query;
    const db = req.db;
    
    // Calcular data de início
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1dia':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7dias':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(0);
    }
    
    // Buscar dados de atividade
    const userActivityCollection = db.collection('user_activity');
    const dataFiltrada = await userActivityCollection.find({
      timestamp: { $gte: dataInicio }
    }).toArray();
    
    // Filtrar e normalizar perguntas
    const perguntas = dataFiltrada
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
    
    const resultado = topPerguntas.map(([pergunta, count]) => ({
      name: pergunta.length > 30 ? pergunta.substring(0, 30) + '...' : pergunta,
      value: count
    }));
    
    res.json(resultado);
    
  } catch (error) {
    console.error('Erro ao buscar perguntas frequentes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/bot-analises/ranking-agentes
router.get('/ranking-agentes', async (req, res) => {
  try {
    const { periodo = '7dias' } = req.query;
    const db = req.db;
    
    // Calcular data de início
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1dia':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7dias':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(0);
    }
    
    // Buscar dados de atividade
    const userActivityCollection = db.collection('user_activity');
    const dataFiltrada = await userActivityCollection.find({
      timestamp: { $gte: dataInicio }
    }).toArray();
    
    // Agrupar por usuário
    const atividadePorUsuario = {};
    dataFiltrada.forEach(item => {
      if (item.userId && item.userId.includes('@velotax.com.br')) {
        if (!atividadePorUsuario[item.userId]) {
          atividadePorUsuario[item.userId] = {
            nome: getNomeUsuario(item.userId),
            perguntas: 0,
            sessoes: new Set()
          };
        }
        if (item.action === 'question_asked') {
          atividadePorUsuario[item.userId].perguntas++;
        }
        if (item.sessionId) {
          atividadePorUsuario[item.userId].sessoes.add(item.sessionId);
        }
      }
    });
    
    // Calcular score
    const ranking = Object.entries(atividadePorUsuario).map(([userId, data]) => ({
      name: data.nome,
      perguntas: data.perguntas,
      sessoes: data.sessoes.size,
      score: data.perguntas + (data.sessoes.size * 0.5)
    })).sort((a, b) => b.score - a.score);
    
    res.json(ranking);
    
  } catch (error) {
    console.error('Erro ao buscar ranking de agentes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/bot-analises/lista-atividades
router.get('/lista-atividades', async (req, res) => {
  try {
    const { periodo = '7dias' } = req.query;
    const db = req.db;
    
    // Calcular data de início
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1dia':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7dias':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(0);
    }
    
    // Buscar dados de atividade
    const userActivityCollection = db.collection('user_activity');
    const dataFiltrada = await userActivityCollection.find({
      timestamp: { $gte: dataInicio }
    }).toArray();
    
    // Processar atividades
    const atividades = dataFiltrada
      .filter(item => item.action === 'question_asked' && item.details?.question && !item.details.question.includes('@velotax.com.br'))
      .map(item => ({
        usuario: getNomeUsuario(item.userId),
        pergunta: item.details.question.length > 60 ? item.details.question.substring(0, 60) + '...' : item.details.question,
        data: new Date(item.timestamp).toLocaleDateString('pt-BR'),
        horario: new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        acao: 'question_asked'
      }))
      .sort((a, b) => new Date(b.data + ' ' + b.horario) - new Date(a.data + ' ' + a.horario))
      .slice(0, 20);
    
    res.json(atividades);
    
  } catch (error) {
    console.error('Erro ao buscar lista de atividades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/bot-analises/analises-especificas
router.get('/analises-especificas', async (req, res) => {
  try {
    const { periodo = '7dias' } = req.query;
    const db = req.db;
    
    // Calcular data de início
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1dia':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7dias':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(0);
    }
    
    // Buscar dados de atividade
    const userActivityCollection = db.collection('user_activity');
    const dataFiltrada = await userActivityCollection.find({
      timestamp: { $gte: dataInicio }
    }).toArray();
    
    // Buscar dados de feedback
    const botFeedbackCollection = db.collection('bot_feedback');
    const feedbackFiltrado = await botFeedbackCollection.find({
      createdAt: { $gte: dataInicio }
    }).toArray();
    
    // Perguntas mais frequentes (top 10)
    const perguntasFiltradas = dataFiltrada
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
    
    const frequencia = {};
    perguntasFiltradas.forEach(pergunta => {
      frequencia[pergunta] = (frequencia[pergunta] || 0) + 1;
    });
    
    const topPerguntas = Object.entries(frequencia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const perguntasFrequentes = topPerguntas.map(([pergunta, count]) => ({
      name: pergunta.length > 30 ? pergunta.substring(0, 30) + '...' : pergunta,
      value: count
    }));
    
    // Padrões de uso
    const totalPerguntas = dataFiltrada.filter(item => item.action === 'question_asked').length;
    const totalFeedbacks = feedbackFiltrado.length;
    const feedbacksPositivos = feedbackFiltrado.filter(item => item.details?.feedbackType === 'positive').length;
    const feedbacksNegativos = feedbackFiltrado.filter(item => item.details?.feedbackType === 'negative').length;
    
    const taxaSatisfacao = totalFeedbacks > 0 ? Math.round((feedbacksPositivos / totalFeedbacks) * 100) : 0;
    
    const usuariosUnicos = new Set(dataFiltrada.map(item => item.userId).filter(id => id.includes('@velotax.com.br'))).size;
    const mediaDiariaPorAgente = usuariosUnicos > 0 ? Math.round(totalPerguntas / usuariosUnicos) : 0;
    
    const padroesUso = [
      { metrica: 'Taxa de Satisfação', valor: `${taxaSatisfacao}%` },
      { metrica: 'Média Diária por Agente', valor: `${mediaDiariaPorAgente}` },
      { metrica: 'Feedbacks Positivos', valor: `${feedbacksPositivos}` },
      { metrica: 'Feedbacks Negativos', valor: `${feedbacksNegativos}` },
      { metrica: 'Total de Feedbacks', valor: `${totalFeedbacks}` }
    ];
    
    // Análise de sessões
    const sessoesUnicas = new Set(dataFiltrada.map(item => item.sessionId).filter(Boolean)).size;
    const mediaPerguntasPorSessao = sessoesUnicas > 0 ? Math.round(totalPerguntas / sessoesUnicas) : 0;
    
    // Calcular taxa de engajamento real: usuários com múltiplas sessões
    const sessoesPorUsuario = {};
    dataFiltrada.forEach(item => {
      if (item.userId && item.userId.includes('@velotax.com.br') && item.sessionId) {
        if (!sessoesPorUsuario[item.userId]) {
          sessoesPorUsuario[item.userId] = new Set();
        }
        sessoesPorUsuario[item.userId].add(item.sessionId);
      }
    });
    
    const usuariosComMultiplasSessoes = Object.values(sessoesPorUsuario)
      .filter(sessoes => sessoes.size > 1).length;
    
    const taxaEngajamento = usuariosUnicos > 0 ? 
      Math.round((usuariosComMultiplasSessoes / usuariosUnicos) * 100) : 0;
    
    const analiseSessoes = [
      { metrica: 'Sessões Únicas', valor: `${sessoesUnicas}` },
      { metrica: 'Usuários Únicos', valor: `${usuariosUnicos}` },
      { metrica: 'Média Perguntas/Sessão', valor: `${mediaPerguntasPorSessao}` },
      { metrica: 'Taxa de Engajamento', valor: `${taxaEngajamento}%` }
    ];
    
    res.json({
      perguntasFrequentes,
      padroesUso,
      analiseSessoes
    });
    
  } catch (error) {
    console.error('Erro ao buscar análises específicas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Funções auxiliares
function getModa(array) {
  const frequencia = {};
  array.forEach(item => {
    frequencia[item] = (frequencia[item] || 0) + 1;
  });
  
  return parseInt(Object.keys(frequencia).reduce((a, b) => 
    frequencia[a] > frequencia[b] ? a : b
  ));
}

function calcularCrescimento(dataFiltrada, periodoFiltro) {
  if (dataFiltrada.length === 0) return { percentual: 0, positivo: true };

  const perguntas = dataFiltrada.filter(item => item.action === 'question_asked');
  
  if (perguntas.length === 0) return { percentual: 0, positivo: true };

  const perguntasPorDia = {};
  perguntas.forEach(item => {
    const data = new Date(item.timestamp);
    const dia = data.toISOString().split('T')[0];
    perguntasPorDia[dia] = (perguntasPorDia[dia] || 0) + 1;
  });

  const dias = Object.keys(perguntasPorDia).sort();
  
  if (dias.length < 2) return { percentual: 0, positivo: true };

  const primeiroDia = perguntasPorDia[dias[0]];
  const ultimoDia = perguntasPorDia[dias[dias.length - 1]];

  if (primeiroDia === 0) {
    return ultimoDia > 0 ? { percentual: 100, positivo: true } : { percentual: 0, positivo: true };
  }

  const percentual = Math.round(((ultimoDia - primeiroDia) / primeiroDia) * 100);
  const positivo = percentual >= 0;

  return { percentual: Math.abs(percentual), positivo };
}

function calcularMediaDiaria(dataFiltrada, periodoFiltro) {
  if (dataFiltrada.length === 0) return 0;

  const perguntas = dataFiltrada.filter(item => item.action === 'question_asked');
  
  if (perguntas.length === 0) return 0;

  const perguntasPorDia = {};
  perguntas.forEach(item => {
    const data = new Date(item.timestamp);
    const dia = data.toISOString().split('T')[0];
    perguntasPorDia[dia] = (perguntasPorDia[dia] || 0) + 1;
  });

  const diasComAtividade = Object.keys(perguntasPorDia).length;
  const totalPerguntas = Object.values(perguntasPorDia).reduce((sum, count) => sum + count, 0);

  if (diasComAtividade === 0) return 0;

  const media = totalPerguntas / diasComAtividade;
  
  return Math.round(media);
}

function agruparPorPeriodo(data, tipoPeriodo) {
  const agrupado = {};
  
  data.forEach(item => {
    const timestamp = item.timestamp || item.createdAt;
    const dataItem = new Date(timestamp);
    
    if (isNaN(dataItem.getTime())) {
      return;
    }
    
    let chave;
    
    switch (tipoPeriodo) {
      case 'dia':
        chave = dataItem.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(dataItem);
        inicioSemana.setDate(dataItem.getDate() - dataItem.getDay());
        chave = inicioSemana.toISOString().split('T')[0];
        break;
      case 'mes':
        chave = `${dataItem.getFullYear()}-${(dataItem.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        chave = dataItem.toISOString().split('T')[0];
    }
    
    agrupado[chave] = (agrupado[chave] || 0) + 1;
  });
  
  return agrupado;
}

function getNomeUsuario(email) {
  const nome = email.split('@')[0].replace(/\./g, ' ');
  return nome.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

module.exports = router;
