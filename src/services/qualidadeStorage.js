// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

import { generateId, calcularPontuacaoTotal, PONTUACAO } from '../types/qualidade';

const STORAGE_KEY = 'funcionarios_velotax';
const QUALIDADE_STORAGE_KEY = 'qualidade_avaliacoes';
const QUALIDADE_GPT_STORAGE_KEY = 'qualidade_avaliacoes_gpt';
const BACKUP_KEY = 'funcionarios_velotax_backup';
const LOG_KEY = 'funcionarios_velotax_log';

// Função para registrar operações no log
const addToLog = (operation, details) => {
  try {
    const logData = localStorage.getItem(LOG_KEY);
    const logs = logData ? JSON.parse(logData) : [];
    
    logs.push({
      timestamp: new Date().toISOString(),
      operation,
      details,
      userAgent: navigator.userAgent
    });
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('❌ Erro ao adicionar ao log:', error);
  }
};

// Função para restaurar backup se necessário
const restoreFromBackup = () => {
  try {
    const backupData = localStorage.getItem(BACKUP_KEY);
    if (backupData) {
      const backup = JSON.parse(backupData);
      if (backup.data && Array.isArray(backup.data) && backup.data.length > 0) {
        console.log(`🔄 Restaurando de backup: ${backup.data.length} funcionários (criado em ${backup.timestamp})`);
        return backup.data;
      }
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
  }
  return [];
};

// Função para criar backup
const createBackup = (data) => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      data: data,
      version: '1.0.0'
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    console.log(`✅ Backup criado: ${data.length} funcionários`);
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
  }
};

// ===== FUNCIONÁRIOS =====

// Obter todos os funcionários
export const getFuncionarios = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const funcionarios = JSON.parse(data);
      console.log(`📊 Funcionários carregados: ${funcionarios.length}`);
      return funcionarios;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários:', error);
    // Tentar restaurar do backup
    const backupData = restoreFromBackup();
    if (backupData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backupData));
      return backupData;
    }
  }
  return [];
};

// Obter funcionários ativos
export const getFuncionariosAtivos = () => {
  const funcionarios = getFuncionarios();
  return funcionarios.filter(f => !f.desligado && !f.afastado);
};

// Adicionar funcionário
export const addFuncionario = (funcionarioData) => {
  try {
    const funcionarios = getFuncionarios();
    const novoFuncionario = {
      id: generateId(),
      ...funcionarioData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    funcionarios.push(novoFuncionario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
    createBackup(funcionarios);
    addToLog('ADD_FUNCIONARIO', { id: novoFuncionario.id, nome: novoFuncionario.nomeCompleto });
    
    console.log(`✅ Funcionário adicionado: ${novoFuncionario.nomeCompleto}`);
    return novoFuncionario;
  } catch (error) {
    console.error('❌ Erro ao adicionar funcionário:', error);
    return null;
  }
};

// Atualizar funcionário
export const updateFuncionario = (id, funcionarioData) => {
  try {
    const funcionarios = getFuncionarios();
    const index = funcionarios.findIndex(f => f.id === id);
    
    if (index !== -1) {
      funcionarios[index] = {
        ...funcionarios[index],
        ...funcionarioData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
      createBackup(funcionarios);
      addToLog('UPDATE_FUNCIONARIO', { id, nome: funcionarios[index].nomeCompleto });
      
      console.log(`✅ Funcionário atualizado: ${funcionarios[index].nomeCompleto}`);
      return funcionarios[index];
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário:', error);
  }
  return null;
};

// Excluir funcionário
export const deleteFuncionario = (id) => {
  try {
    const funcionarios = getFuncionarios();
    const funcionario = funcionarios.find(f => f.id === id);
    const funcionariosAtualizados = funcionarios.filter(f => f.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionariosAtualizados));
    createBackup(funcionariosAtualizados);
    addToLog('DELETE_FUNCIONARIO', { id, nome: funcionario?.nomeCompleto });
    
    console.log(`✅ Funcionário excluído: ${funcionario?.nomeCompleto}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao excluir funcionário:', error);
    return false;
  }
};

// ===== AVALIAÇÕES =====

// Obter todas as avaliações
export const getAvaliacoes = () => {
  try {
    const data = localStorage.getItem(QUALIDADE_STORAGE_KEY);
    if (data) {
      const avaliacoes = JSON.parse(data);
      console.log(`📊 Avaliações carregadas: ${avaliacoes.length}`);
      return avaliacoes;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações:', error);
  }
  return [];
};

// Obter avaliação por ID
export const getAvaliacaoById = (id) => {
  const avaliacoes = getAvaliacoes();
  return avaliacoes.find(a => a.id === id);
};

// Obter avaliações por colaborador
export const getAvaliacoesPorColaborador = (colaboradorId) => {
  const avaliacoes = getAvaliacoes();
  return avaliacoes.filter(a => a.colaboradorId === colaboradorId);
};

// Adicionar avaliação
export const addAvaliacao = async (avaliacaoData) => {
  try {
    const avaliacoes = getAvaliacoes();
    const funcionarios = getFuncionarios();
    const funcionario = funcionarios.find(f => f.id === avaliacaoData.colaboradorId);
    
    if (!funcionario) {
      throw new Error('Funcionário não encontrado');
    }

    // Processar arquivo de áudio se fornecido
    let arquivoLigacao = null;
    let nomeArquivo = null;
    
    if (avaliacaoData.arquivoLigacao) {
      if (avaliacaoData.arquivoLigacao instanceof File) {
        // Converter File para Base64
        arquivoLigacao = await fileToBase64(avaliacaoData.arquivoLigacao);
        nomeArquivo = avaliacaoData.arquivoLigacao.name;
      } else {
        arquivoLigacao = avaliacaoData.arquivoLigacao;
        nomeArquivo = avaliacaoData.nomeArquivo || 'audio_ligacao';
      }
    }

    const novaAvaliacao = {
      id: generateId(),
      colaboradorId: avaliacaoData.colaboradorId,
      colaboradorNome: funcionario.nomeCompleto,
      avaliador: avaliacaoData.avaliador,
      mes: avaliacaoData.mes,
      ano: avaliacaoData.ano,
      dataAvaliacao: new Date().toISOString(),
      arquivoLigacao,
      nomeArquivo,
      saudacaoAdequada: avaliacaoData.saudacaoAdequada || false,
      escutaAtiva: avaliacaoData.escutaAtiva || false,
      resolucaoQuestao: avaliacaoData.resolucaoQuestao || false,
      empatiaCordialidade: avaliacaoData.empatiaCordialidade || false,
      direcionouPesquisa: avaliacaoData.direcionouPesquisa || false,
      procedimentoIncorreto: avaliacaoData.procedimentoIncorreto || false,
      encerramentoBrusco: avaliacaoData.encerramentoBrusco || false,
      moderado: false,
      observacoesModeracao: avaliacaoData.observacoesModeracao || '',
      pontuacaoTotal: 0, // Será calculado
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calcular pontuação total
    novaAvaliacao.pontuacaoTotal = calcularPontuacaoTotal(novaAvaliacao);

    avaliacoes.push(novaAvaliacao);
    localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoes));
    
    console.log(`✅ Avaliação adicionada: ${novaAvaliacao.colaboradorNome} - ${novaAvaliacao.pontuacaoTotal} pts`);
    return novaAvaliacao;
  } catch (error) {
    console.error('❌ Erro ao adicionar avaliação:', error);
    throw error;
  }
};

// Atualizar avaliação
export const updateAvaliacao = async (id, avaliacaoData) => {
  try {
    const avaliacoes = getAvaliacoes();
    const index = avaliacoes.findIndex(a => a.id === id);
    
    if (index !== -1) {
      const avaliacaoExistente = avaliacoes[index];
      
      // Processar arquivo de áudio se fornecido
      let arquivoLigacao = avaliacaoExistente.arquivoLigacao;
      let nomeArquivo = avaliacaoExistente.nomeArquivo;
      
      if (avaliacaoData.arquivoLigacao) {
        if (avaliacaoData.arquivoLigacao instanceof File) {
          arquivoLigacao = await fileToBase64(avaliacaoData.arquivoLigacao);
          nomeArquivo = avaliacaoData.arquivoLigacao.name;
        } else {
          arquivoLigacao = avaliacaoData.arquivoLigacao;
          nomeArquivo = avaliacaoData.nomeArquivo || nomeArquivo;
        }
      }

      const avaliacaoAtualizada = {
        ...avaliacaoExistente,
        ...avaliacaoData,
        arquivoLigacao,
        nomeArquivo,
        updatedAt: new Date().toISOString()
      };

      // Recalcular pontuação total
      avaliacaoAtualizada.pontuacaoTotal = calcularPontuacaoTotal(avaliacaoAtualizada);

      avaliacoes[index] = avaliacaoAtualizada;
      localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoes));
      
      console.log(`✅ Avaliação atualizada: ${avaliacaoAtualizada.colaboradorNome} - ${avaliacaoAtualizada.pontuacaoTotal} pts`);
      return avaliacaoAtualizada;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar avaliação:', error);
    throw error;
  }
  return null;
};

// Excluir avaliação
export const deleteAvaliacao = (id) => {
  try {
    const avaliacoes = getAvaliacoes();
    const avaliacao = avaliacoes.find(a => a.id === id);
    const avaliacoesAtualizadas = avaliacoes.filter(a => a.id !== id);
    
    localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoesAtualizadas));
    
    console.log(`✅ Avaliação excluída: ${avaliacao?.colaboradorNome}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao excluir avaliação:', error);
    return false;
  }
};

// ===== AVALIAÇÕES GPT =====

// Salvar avaliação GPT
export const salvarAvaliacaoGPT = (avaliacaoGPT) => {
  try {
    const gptData = localStorage.getItem(QUALIDADE_GPT_STORAGE_KEY);
    const gptAvaliacoes = gptData ? JSON.parse(gptData) : [];
    
    gptAvaliacoes.push(avaliacaoGPT);
    localStorage.setItem(QUALIDADE_GPT_STORAGE_KEY, JSON.stringify(gptAvaliacoes));
    
    console.log(`✅ Avaliação GPT salva: ${avaliacaoGPT.avaliacaoId}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar avaliação GPT:', error);
    return false;
  }
};

// Obter avaliação GPT
export const getAvaliacaoGPT = (avaliacaoId) => {
  try {
    const gptData = localStorage.getItem(QUALIDADE_GPT_STORAGE_KEY);
    const gptAvaliacoes = gptData ? JSON.parse(gptData) : [];
    
    return gptAvaliacoes.find(gpt => gpt.avaliacaoId === avaliacaoId);
  } catch (error) {
    console.error('❌ Erro ao obter avaliação GPT:', error);
    return null;
  }
};

// ===== RELATÓRIOS =====

// Gerar relatório do agente
export const gerarRelatorioAgente = (colaboradorId) => {
  const avaliacoes = getAvaliacoesPorColaborador(colaboradorId);
  const funcionarios = getFuncionarios();
  const funcionario = funcionarios.find(f => f.id === colaboradorId);
  
  if (!funcionario || avaliacoes.length === 0) {
    return null;
  }

  const pontuacoes = avaliacoes.map(a => a.pontuacaoTotal);
  const mediaAvaliador = pontuacoes.reduce((sum, p) => sum + p, 0) / pontuacoes.length;
  
  // Calcular tendência
  let tendencia = 'estavel';
  if (avaliacoes.length >= 2) {
    const primeiraMetade = avaliacoes.slice(0, Math.ceil(avaliacoes.length / 2));
    const segundaMetade = avaliacoes.slice(Math.ceil(avaliacoes.length / 2));
    
    const mediaPrimeira = primeiraMetade.reduce((sum, a) => sum + a.pontuacaoTotal, 0) / primeiraMetade.length;
    const mediaSegunda = segundaMetade.reduce((sum, a) => sum + a.pontuacaoTotal, 0) / segundaMetade.length;
    
    if (mediaSegunda > mediaPrimeira + 5) tendencia = 'melhorando';
    else if (mediaSegunda < mediaPrimeira - 5) tendencia = 'piorando';
  }

  return {
    colaboradorId,
    colaboradorNome: funcionario.nomeCompleto,
    avaliacoes,
    mediaAvaliador: Math.round(mediaAvaliador * 100) / 100,
    mediaGPT: 0, // Será implementado quando GPT estiver ativo
    totalAvaliacoes: avaliacoes.length,
    melhorNota: Math.max(...pontuacoes),
    piorNota: Math.min(...pontuacoes),
    tendencia
  };
};

// Gerar relatório da gestão
export const gerarRelatorioGestao = (mes, ano) => {
  const avaliacoes = getAvaliacoes().filter(a => a.mes === mes && a.ano === ano);
  
  if (avaliacoes.length === 0) {
    return null;
  }

  // Agrupar por colaborador
  const colaboradoresMap = new Map();
  
  avaliacoes.forEach(avaliacao => {
    if (!colaboradoresMap.has(avaliacao.colaboradorId)) {
      colaboradoresMap.set(avaliacao.colaboradorId, {
        colaboradorId: avaliacao.colaboradorId,
        colaboradorNome: avaliacao.colaboradorNome,
        avaliacoes: []
      });
    }
    colaboradoresMap.get(avaliacao.colaboradorId).avaliacoes.push(avaliacao);
  });

  // Calcular médias por colaborador
  const colaboradores = Array.from(colaboradoresMap.values()).map(colaborador => {
    const media = colaborador.avaliacoes.reduce((sum, a) => sum + a.pontuacaoTotal, 0) / colaborador.avaliacoes.length;
    return {
      colaboradorId: colaborador.colaboradorId,
      colaboradorNome: colaborador.colaboradorNome,
      nota: Math.round(media * 100) / 100,
      posicao: 0 // Será definido após ordenação
    };
  });

  // Ordenar por nota (maior para menor)
  colaboradores.sort((a, b) => b.nota - a.nota);
  colaboradores.forEach((colaborador, index) => {
    colaborador.posicao = index + 1;
  });

  const mediaGeral = colaboradores.reduce((sum, c) => sum + c.nota, 0) / colaboradores.length;

  return {
    mes,
    ano,
    totalAvaliacoes: avaliacoes.length,
    mediaGeral: Math.round(mediaGeral * 100) / 100,
    top3Melhores: colaboradores.slice(0, 3),
    top3Piores: colaboradores.slice(-3).reverse(),
    colaboradores
  };
};

// ===== UTILITÁRIOS =====

// Converter arquivo para Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Migrar arquivos antigos (placeholder)
export const migrarArquivosAntigos = async () => {
  console.log('🔄 Migração de arquivos antigos não implementada ainda');
  return { total: 0, migrados: 0, removidos: 0 };
};

// Exportar dados para Excel
export const exportToExcel = () => {
  try {
    const avaliacoes = getAvaliacoes();
    
    if (avaliacoes.length === 0) {
      alert('Não há avaliações para exportar');
      return;
    }

    // Criar CSV
    const headers = [
      'ID', 'Colaborador', 'Avaliador', 'Mês', 'Ano', 'Data Avaliação',
      'Saudação Adequada', 'Escuta Ativa', 'Resolução Questão', 'Empatia/Cordialidade',
      'Direcionou Pesquisa', 'Procedimento Incorreto', 'Encerramento Brusco',
      'Pontuação Total', 'Observações'
    ];

    const csvContent = [
      headers.join(','),
      ...avaliacoes.map(avaliacao => [
        avaliacao.id,
        `"${avaliacao.colaboradorNome}"`,
        `"${avaliacao.avaliador}"`,
        avaliacao.mes,
        avaliacao.ano,
        avaliacao.dataAvaliacao,
        avaliacao.saudacaoAdequada ? 'Sim' : 'Não',
        avaliacao.escutaAtiva ? 'Sim' : 'Não',
        avaliacao.resolucaoQuestao ? 'Sim' : 'Não',
        avaliacao.empatiaCordialidade ? 'Sim' : 'Não',
        avaliacao.direcionouPesquisa ? 'Sim' : 'Não',
        avaliacao.procedimentoIncorreto ? 'Sim' : 'Não',
        avaliacao.encerramentoBrusco ? 'Sim' : 'Não',
        avaliacao.pontuacaoTotal,
        `"${avaliacao.observacoesModeracao || ''}"`
      ].join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `avaliacoes_qualidade_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Exportação para Excel concluída:', avaliacoes.length, 'avaliações');
  } catch (error) {
    console.error('❌ Erro ao exportar para Excel:', error);
    alert('Erro ao exportar dados para Excel');
  }
};

// Exportar dados para PDF
export const exportToPDF = () => {
  try {
    const avaliacoes = getAvaliacoes();
    
    if (avaliacoes.length === 0) {
      alert('Não há avaliações para exportar');
      return;
    }

    // Criar HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Avaliações - Qualidade</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #000058; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Avaliações de Qualidade</h1>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="summary">
          <h3>Resumo</h3>
          <p><strong>Total de Avaliações:</strong> ${avaliacoes.length}</p>
          <p><strong>Média Geral:</strong> ${(avaliacoes.reduce((sum, a) => sum + a.pontuacaoTotal, 0) / avaliacoes.length).toFixed(2)} pontos</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Avaliador</th>
              <th>Mês/Ano</th>
              <th>Pontuação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${avaliacoes.map(avaliacao => `
              <tr>
                <td>${avaliacao.colaboradorNome}</td>
                <td>${avaliacao.avaliador}</td>
                <td>${avaliacao.mes}/${avaliacao.ano}</td>
                <td>${avaliacao.pontuacaoTotal}</td>
                <td>${avaliacao.pontuacaoTotal >= 80 ? 'Excelente' : avaliacao.pontuacaoTotal >= 60 ? 'Bom' : avaliacao.pontuacaoTotal >= 40 ? 'Regular' : 'Ruim'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Abrir em nova janela para impressão/salvamento como PDF
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Aguardar carregamento e imprimir
    newWindow.onload = () => {
      newWindow.print();
    };

    console.log('✅ Exportação para PDF concluída:', avaliacoes.length, 'avaliações');
  } catch (error) {
    console.error('❌ Erro ao exportar para PDF:', error);
    alert('Erro ao exportar dados para PDF');
  }
};
