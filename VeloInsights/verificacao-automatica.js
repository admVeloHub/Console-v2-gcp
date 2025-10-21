/* ========================================
   SCRIPT DE VERIFICAÇÃO AUTOMÁTICA
   Sistema VeloInsights - Verificação de Dados
   ======================================== */

const fs = require('fs');
const path = require('path');

class VerificadorDados {
  constructor() {
    this.resultados = {
      comparativos: {},
      agentes: {},
      erros: [],
      avisos: []
    };
  }

  // Verificar dados dos comparativos temporais
  verificarComparativos(dados) {
    console.log('🔍 Verificando Comparativos Temporais...');
    
    const verificacoes = {
      quantidadeChamadas: this.verificarQuantidadeChamadas(dados),
      avaliacaoAtendimento: this.verificarAvaliacaoAtendimento(dados),
      avaliacaoSolucao: this.verificarAvaliacaoSolucao(dados),
      tma: this.verificarTMA(dados),
      tme: this.verificarTME(dados),
      tmu: this.verificarTMU(dados)
    };

    this.resultados.comparativos = verificacoes;
    return verificacoes;
  }

  // Verificar quantidade de chamadas
  verificarQuantidadeChamadas(dados) {
    const totalRegistros = dados.length - 1; // Excluir header
    const registrosValidos = dados.filter((record, index) => {
      if (index === 0) return false; // Pular header
      return record && record.length > 0;
    }).length;

    return {
      totalRegistros,
      registrosValidos,
      diferenca: totalRegistros - registrosValidos,
      status: registrosValidos === totalRegistros ? '✅ OK' : '⚠️ ATENÇÃO'
    };
  }

  // Verificar avaliação de atendimento (Coluna AB - índice 27)
  verificarAvaliacaoAtendimento(dados) {
    const avaliacoes = [];
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let avaliacao = null;
      
      if (Array.isArray(record)) {
        avaliacao = record[27]; // Coluna AB
      } else if (typeof record === 'object') {
        avaliacao = record.pergunta2Atendente || record['Pergunta2 1 PERGUNTA ATENDENTE'];
      }
      
      if (avaliacao && !isNaN(parseFloat(avaliacao))) {
        const valor = parseFloat(avaliacao);
        if (valor >= 1 && valor <= 5) {
          avaliacoes.push(valor);
        }
      }
    }

    const media = avaliacoes.length > 0 ? avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length : 0;
    
    return {
      totalAvaliacoes: avaliacoes.length,
      media: media.toFixed(2),
      min: Math.min(...avaliacoes),
      max: Math.max(...avaliacoes),
      valoresInvalidos: dados.length - 1 - avaliacoes.length,
      status: avaliacoes.length > 0 ? '✅ OK' : '❌ ERRO'
    };
  }

  // Verificar avaliação de solução (Coluna AC - índice 28)
  verificarAvaliacaoSolucao(dados) {
    const avaliacoes = [];
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let avaliacao = null;
      
      if (Array.isArray(record)) {
        avaliacao = record[28]; // Coluna AC
      } else if (typeof record === 'object') {
        avaliacao = record.pergunta2Solucao || record['Pergunta2 2 PERGUNTA SOLUCAO'];
      }
      
      if (avaliacao && !isNaN(parseFloat(avaliacao))) {
        const valor = parseFloat(avaliacao);
        if (valor >= 1 && valor <= 5) {
          avaliacoes.push(valor);
        }
      }
    }

    const media = avaliacoes.length > 0 ? avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length : 0;
    
    return {
      totalAvaliacoes: avaliacoes.length,
      media: media.toFixed(2),
      min: Math.min(...avaliacoes),
      max: Math.max(...avaliacoes),
      valoresInvalidos: dados.length - 1 - avaliacoes.length,
      status: avaliacoes.length > 0 ? '✅ OK' : '❌ ERRO'
    };
  }

  // Verificar TMA (Coluna O - índice 14)
  verificarTMA(dados) {
    const tempos = [];
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let tempo = null;
      
      if (Array.isArray(record)) {
        tempo = record[14]; // Coluna O
      } else if (typeof record === 'object') {
        tempo = record.tempoTotal || record['Tempo Total'];
      }
      
      if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
        const minutos = this.parseDurationToMinutes(tempo);
        if (minutos > 0) {
          tempos.push(minutos);
        }
      }
    }

    const media = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0;
    
    return {
      totalTempos: tempos.length,
      mediaMinutos: media.toFixed(2),
      mediaFormatada: this.formatarTempo(media),
      min: Math.min(...tempos),
      max: Math.max(...tempos),
      valoresInvalidos: dados.length - 1 - tempos.length,
      status: tempos.length > 0 ? '✅ OK' : '❌ ERRO'
    };
  }

  // Verificar TME (Coluna M - índice 12)
  verificarTME(dados) {
    const tempos = [];
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let tempo = null;
      
      if (Array.isArray(record)) {
        tempo = record[12]; // Coluna M
      } else if (typeof record === 'object') {
        tempo = record.tempoEspera || record['Tempo De Espera'];
      }
      
      if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
        const minutos = this.parseDurationToMinutes(tempo);
        tempos.push(minutos); // Incluir zeros
      }
    }

    const media = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0;
    
    return {
      totalTempos: tempos.length,
      mediaMinutos: media.toFixed(2),
      mediaFormatada: this.formatarTempo(media),
      min: Math.min(...tempos),
      max: Math.max(...tempos),
      valoresZero: tempos.filter(t => t === 0).length,
      status: tempos.length > 0 ? '✅ OK' : '❌ ERRO'
    };
  }

  // Verificar TMU (Coluna L - índice 11)
  verificarTMU(dados) {
    const tempos = [];
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let tempo = null;
      
      if (Array.isArray(record)) {
        tempo = record[11]; // Coluna L
      } else if (typeof record === 'object') {
        tempo = record.tempoURA || record['Tempo Na Ura'];
      }
      
      if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
        const minutos = this.parseDurationToMinutes(tempo);
        tempos.push(minutos); // Incluir zeros
      }
    }

    const media = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0;
    
    return {
      totalTempos: tempos.length,
      mediaMinutos: media.toFixed(2),
      mediaFormatada: this.formatarTempo(media),
      min: Math.min(...tempos),
      max: Math.max(...tempos),
      valoresZero: tempos.filter(t => t === 0).length,
      status: tempos.length > 0 ? '✅ OK' : '❌ ERRO'
    };
  }

  // Verificar dados dos agentes
  verificarAgentes(dados) {
    console.log('🔍 Verificando Dados dos Agentes...');
    
    const operadores = new Map();
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let operador = null;
      
      if (Array.isArray(record)) {
        operador = record[1]; // Coluna B - Operador
      } else if (typeof record === 'object') {
        operador = record.operador || record['Operador'];
      }
      
      if (operador && typeof operador === 'string' && operador.trim() !== '') {
        const nomeOperador = operador.trim();
        
        // Verificar se é um operador válido
        if (this.isOperadorValido(nomeOperador)) {
          if (!operadores.has(nomeOperador)) {
            operadores.set(nomeOperador, {
              nome: nomeOperador,
              chamadas: 0,
              avaliacoes: [],
              tempos: []
            });
          }
          
          const op = operadores.get(nomeOperador);
          op.chamadas++;
          
          // Adicionar avaliação
          let avaliacao = null;
          if (Array.isArray(record)) {
            avaliacao = record[27]; // Coluna AB
          } else if (typeof record === 'object') {
            avaliacao = record.pergunta2Atendente || record['Pergunta2 1 PERGUNTA ATENDENTE'];
          }
          
          if (avaliacao && !isNaN(parseFloat(avaliacao))) {
            const valor = parseFloat(avaliacao);
            if (valor >= 1 && valor <= 5) {
              op.avaliacoes.push(valor);
            }
          }
          
          // Adicionar tempo
          let tempo = null;
          if (Array.isArray(record)) {
            tempo = record[14]; // Coluna O
          } else if (typeof record === 'object') {
            tempo = record.tempoTotal || record['Tempo Total'];
          }
          
          if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
            const minutos = this.parseDurationToMinutes(tempo);
            if (minutos > 0) {
              op.tempos.push(minutos);
            }
          }
        }
      }
    }

    // Calcular métricas finais
    const agentes = Array.from(operadores.values()).map(op => ({
      nome: op.nome,
      chamadas: op.chamadas,
      notaMedia: op.avaliacoes.length > 0 ? (op.avaliacoes.reduce((a, b) => a + b, 0) / op.avaliacoes.length).toFixed(2) : '0.00',
      tempoMedio: op.tempos.length > 0 ? this.formatarTempo(op.tempos.reduce((a, b) => a + b, 0) / op.tempos.length) : '0:00',
      avaliacoesValidas: op.avaliacoes.length,
      temposValidos: op.tempos.length
    }));

    // Ordenar por nota média
    agentes.sort((a, b) => parseFloat(b.notaMedia) - parseFloat(a.notaMedia));

    this.resultados.agentes = {
      totalAgentes: agentes.length,
      agentes: agentes.slice(0, 10), // Top 10
      operadoresInvalidos: this.contarOperadoresInvalidos(dados),
      status: agentes.length > 0 ? '✅ OK' : '❌ ERRO'
    };

    return this.resultados.agentes;
  }

  // Verificar se operador é válido
  isOperadorValido(nome) {
    const operadoresInvalidos = [
      'sem operador', 'desl', 'excluídos', 'agentes indisponíveis', 
      'rejeitaram', 'sem operador', 'desligados', 'n/a', 'null', 
      'undefined', '', ' ', '0', '1', '2', '3', '4', '5'
    ];
    
    const nomeLower = nome.toLowerCase().trim();
    return !operadoresInvalidos.includes(nomeLower) && 
           !/^\d+$/.test(nomeLower) && 
           nomeLower.length > 2;
  }

  // Contar operadores inválidos
  contarOperadoresInvalidos(dados) {
    const operadoresInvalidos = new Set();
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i];
      let operador = null;
      
      if (Array.isArray(record)) {
        operador = record[1];
      } else if (typeof record === 'object') {
        operador = record.operador || record['Operador'];
      }
      
      if (operador && !this.isOperadorValido(operador)) {
        operadoresInvalidos.add(operador.trim());
      }
    }
    
    return Array.from(operadoresInvalidos);
  }

  // Converter tempo HH:MM:SS para minutos
  parseDurationToMinutes(durationString) {
    if (!durationString || typeof durationString !== 'string') return 0;
    
    const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = parseInt(timeMatch[3], 10);
      return (hours * 60) + minutes + (seconds / 60);
    }
    
    return parseFloat(durationString) || 0;
  }

  // Formatar tempo em HH:MM:SS ou MM:SS
  formatarTempo(minutos) {
    if (minutos === 0) return '0:00';

    const horas = Math.floor(minutos / 60);
    const mins = Math.floor(minutos % 60);
    const segs = Math.round((minutos % 1) * 60);
    
    if (horas > 0) {
      return `${horas}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    } else if (mins > 0) {
      return `${mins}:${segs.toString().padStart(2, '0')}`;
    } else {
      return `0:${segs.toString().padStart(2, '0')}`;
    }
  }

  // Gerar relatório completo
  gerarRelatorio() {
    const relatorio = {
      timestamp: new Date().toISOString(),
      resumo: {
        comparativos: Object.keys(this.resultados.comparativos).length,
        agentes: this.resultados.agentes.totalAgentes || 0,
        erros: this.resultados.erros.length,
        avisos: this.resultados.avisos.length
      },
      detalhes: this.resultados
    };

    // Salvar relatório
    const nomeArquivo = `relatorio-verificacao-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(relatorio, null, 2));
    
    console.log(`📊 Relatório salvo em: ${nomeArquivo}`);
    return relatorio;
  }

  // Exibir resumo no console
  exibirResumo() {
    console.log('\n📊 RESUMO DA VERIFICAÇÃO:');
    console.log('='.repeat(50));
    
    console.log('\n🔍 COMPARATIVOS TEMPORAIS:');
    Object.entries(this.resultados.comparativos).forEach(([metrica, dados]) => {
      console.log(`  ${metrica}: ${dados.status}`);
    });
    
    console.log('\n👤 AGENTES:');
    console.log(`  Total de agentes: ${this.resultados.agentes.totalAgentes}`);
    console.log(`  Status: ${this.resultados.agentes.status}`);
    
    if (this.resultados.erros.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      this.resultados.erros.forEach(erro => console.log(`  - ${erro}`));
    }
    
    if (this.resultados.avisos.length > 0) {
      console.log('\n⚠️ AVISOS:');
      this.resultados.avisos.forEach(aviso => console.log(`  - ${aviso}`));
    }
  }
}

// Função principal para executar verificação
async function executarVerificacao(dados) {
  const verificador = new VerificadorDados();
  
  try {
    // Verificar comparativos
    verificador.verificarComparativos(dados);
    
    // Verificar agentes
    verificador.verificarAgentes(dados);
    
    // Gerar relatório
    const relatorio = verificador.gerarRelatorio();
    
    // Exibir resumo
    verificador.exibirResumo();
    
    return relatorio;
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    throw error;
  }
}

module.exports = { VerificadorDados, executarVerificacao };

// Se executado diretamente
if (require.main === module) {
  console.log('🚀 Script de Verificação Automática - VeloInsights');
  console.log('📝 Para usar: const { executarVerificacao } = require("./verificacao-automatica.js")');
  console.log('📝 Exemplo: executarVerificacao(dadosDaPlanilha)');
}
