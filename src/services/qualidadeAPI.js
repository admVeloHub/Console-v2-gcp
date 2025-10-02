// VERSION: v1.24.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

import { qualidadeFuncionariosAPI, qualidadeAvaliacoesAPI } from './api';
import axios from 'axios';
import { generateId, calcularPontuacaoTotal, PONTUACAO } from '../types/qualidade';
import { getAvaliadoresValidos as getUserAvaliadoresValidos, getAllAuthorizedUsers } from './userService';
import { 
  getAvaliacoes as getAvaliacoesLocalStorage,
  addAvaliacao as addAvaliacaoLocalStorage,
  updateAvaliacao as updateAvaliacaoLocalStorage,
  deleteAvaliacao as deleteAvaliacaoLocalStorage,
  gerarRelatorioAgente as gerarRelatorioAgenteLocalStorage,
  gerarRelatorioGestao as gerarRelatorioGestaoLocalStorage,
  getAvaliacoesPorColaborador as getAvaliacoesPorColaboradorLocalStorage,
  getTendenciaClass,
  getTendenciaText,
  getPerformanceClass,
  getPerformanceText,
  formatDate
} from './qualidadeStorage';

// ===== FUNCIONÁRIOS - API MONGODB =====

// Testar conectividade da API
export const testarAPI = async () => {
  try {
    console.log('🔍 Testando conectividade da API...');
    const response = await qualidadeFuncionariosAPI.getAll();
    console.log('✅ API funcionando:', response);
    return true;
  } catch (error) {
    console.error('❌ API com problemas:', error);
    return false;
  }
};

// Obter todos os funcionários
export const getFuncionarios = async () => {
  try {
    console.log('🔍 Tentando carregar funcionários da API...');
    const response = await qualidadeFuncionariosAPI.getAll();
    console.log('📊 Dados recebidos da API:', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const funcionarios = response?.data || response;
    console.log(`📊 Funcionários extraídos: ${Array.isArray(funcionarios) ? funcionarios.length : 0}`);
    
    // Garantir que sempre retorne um array
    return Array.isArray(funcionarios) ? funcionarios : [];
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários da API:', error);
    console.error('❌ Detalhes do erro:', error.response?.data || error.message);
    // Fallback para localStorage se API falhar
    return getFuncionariosLocalStorage();
  }
};

// Obter funcionários ativos
export const getFuncionariosAtivos = async () => {
  try {
    const response = await qualidadeFuncionariosAPI.getAtivos();
    console.log('📊 Dados recebidos da API (ativos):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const funcionarios = response?.data || response;
    console.log(`📊 Funcionários ativos extraídos: ${Array.isArray(funcionarios) ? funcionarios.length : 0}`);
    
    // Garantir que sempre retorne um array
    return Array.isArray(funcionarios) ? funcionarios : [];
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários ativos da API:', error);
    // Fallback para localStorage se API falhar
    return getFuncionariosAtivosLocalStorage();
  }
};

// Adicionar funcionário
export const addFuncionario = async (funcionarioData) => {
  try {
    // Converter strings de data para Date conforme schema MongoDB
    const novoFuncionario = {
      colaboradorNome: funcionarioData.nomeCompleto || funcionarioData.colaboradorNome,
      dataAniversario: funcionarioData.dataAniversario ? new Date(funcionarioData.dataAniversario) : null,
      empresa: funcionarioData.empresa,
      dataContratado: funcionarioData.dataContratado ? new Date(funcionarioData.dataContratado) : null,
      telefone: funcionarioData.telefone,
      atuacao: funcionarioData.atuacao,
      escala: funcionarioData.escala,
      acessos: funcionarioData.acessos || [],
      desligado: funcionarioData.desligado || false,
      dataDesligamento: funcionarioData.dataDesligamento ? new Date(funcionarioData.dataDesligamento) : null,
      afastado: funcionarioData.afastado || false,
      dataAfastamento: funcionarioData.dataAfastamento ? new Date(funcionarioData.dataAfastamento) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔍 Debug - Dados para POST funcionário:', novoFuncionario);
    
    const response = await qualidadeFuncionariosAPI.create(novoFuncionario);
    console.log(`✅ Funcionário adicionado via API: ${response.colaboradorNome || response.nomeCompleto}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao adicionar funcionário via API:', error);
    console.error('❌ Detalhes do erro:', error.response?.data || error.message);
    // Fallback para localStorage se API falhar
    return addFuncionarioLocalStorage(funcionarioData);
  }
};

// Atualizar funcionário
export const updateFuncionario = async (id, funcionarioData) => {
  try {
    // Converter strings de data para Date conforme schema
    const funcionarioAtualizado = {
      ...funcionarioData,
      colaboradorNome: funcionarioData.nomeCompleto || funcionarioData.colaboradorNome,
      dataAniversario: funcionarioData.dataAniversario ? new Date(funcionarioData.dataAniversario) : null,
      dataContratado: funcionarioData.dataContratado ? new Date(funcionarioData.dataContratado) : null,
      dataDesligamento: funcionarioData.dataDesligamento ? new Date(funcionarioData.dataDesligamento) : null,
      dataAfastamento: funcionarioData.dataAfastamento ? new Date(funcionarioData.dataAfastamento) : null,
      updatedAt: new Date()
    };
    
    const response = await qualidadeFuncionariosAPI.update(id, funcionarioAtualizado);
    console.log(`✅ Funcionário atualizado via API: ${response.colaboradorNome || response.nomeCompleto}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário via API:', error);
    // Fallback para localStorage se API falhar
    return updateFuncionarioLocalStorage(id, funcionarioData);
  }
};

// Excluir funcionário
export const deleteFuncionario = async (id) => {
  try {
    await qualidadeFuncionariosAPI.delete(id);
    console.log(`✅ Funcionário excluído via API: ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao excluir funcionário via API:', error);
    // Fallback para localStorage se API falhar
    return deleteFuncionarioLocalStorage(id);
  }
};

// ===== AVALIADORES =====

// Obter lista de avaliadores válidos
export const getAvaliadoresValidos = async () => {
  try {
    // Buscar usuários que são avaliadores (função admin/gestão + flag avaliador)
    const users = await getAllAuthorizedUsers();
    console.log('🔍 DEBUG - Total de usuários encontrados:', users.length);
    
    // Filtrar usuários que são avaliadores
    const avaliadores = users.filter(user => {
      console.log(`🔍 DEBUG - Analisando usuário: ${user._userMail || user.email}`);
      console.log(`🔍 DEBUG - Função: ${user._userRole}`);
      console.log(`🔍 DEBUG - Funções administrativas:`, user._funcoesAdministrativas);
      
      // Verificar se tem função de administrador ou gestão (case insensitive)
      const userRole = user._userRole?.toLowerCase();
      const isAdminOuGestao = userRole === 'administrador' || userRole === 'gestão' || userRole === 'gestao';
      console.log(`🔍 DEBUG - É admin/gestão? ${isAdminOuGestao}`);
      
      // Verificar se tem flag de avaliador
      const isAvaliador = user._funcoesAdministrativas && user._funcoesAdministrativas.avaliador === true;
      console.log(`🔍 DEBUG - É avaliador? ${isAvaliador}`);
      
      const isValid = isAdminOuGestao && isAvaliador;
      console.log(`🔍 DEBUG - É avaliador válido? ${isValid}`);
      
      return isValid;
    });
    
    console.log('🔍 DEBUG - Avaliadores filtrados:', avaliadores);
    
    // Retornar apenas os nomes dos avaliadores
    const nomesAvaliadores = avaliadores.map(user => {
      const nome = user._userId || user._userMail;
      console.log(`🔍 DEBUG - Mapeando usuário ${user._userMail} para nome: ${nome}`);
      return nome;
    });
    
    console.log(`📊 Avaliadores válidos carregados: ${nomesAvaliadores.length}`);
    return nomesAvaliadores;
  } catch (error) {
    console.error('❌ Erro ao carregar avaliadores:', error);
    return [];
  }
};

// ===== FALLBACK PARA LOCALSTORAGE =====

// Funções de fallback que usam localStorage
const STORAGE_KEY = 'funcionarios_velotax';

const getFuncionariosLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const funcionarios = JSON.parse(data);
      console.log(`📊 Funcionários carregados do localStorage: ${funcionarios.length}`);
      
      // Corrigir funcionários antigos que não têm _id conforme schema MongoDB
      const funcionariosCorrigidos = funcionarios.map(funcionario => {
        if (!funcionario._id) {
          console.log(`🔧 Adicionando _id para funcionário antigo: ${funcionario.nomeCompleto}`);
          return {
            ...funcionario,
            _id: generateId() // Usar _id conforme schema MongoDB
          };
        }
        return funcionario;
      });
      
      // Salvar funcionários corrigidos se houve mudanças
      if (funcionariosCorrigidos.length !== funcionarios.length || 
          funcionariosCorrigidos.some((f, i) => f._id !== funcionarios[i]?._id)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionariosCorrigidos));
        console.log(`✅ Funcionários antigos corrigidos com _id`);
      }
      
      return funcionariosCorrigidos;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários do localStorage:', error);
  }
  return [];
};

const getFuncionariosAtivosLocalStorage = () => {
  const funcionarios = getFuncionariosLocalStorage();
  return funcionarios.filter(f => !f.desligado && !f.afastado);
};

const addFuncionarioLocalStorage = (funcionarioData) => {
  try {
    const funcionarios = getFuncionariosLocalStorage();
    const novoFuncionario = {
      ...funcionarioData,
      _id: generateId(), // Usar _id conforme schema MongoDB
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    funcionarios.push(novoFuncionario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
    console.log(`✅ Funcionário adicionado ao localStorage: ${novoFuncionario.nomeCompleto}`);
    return novoFuncionario;
  } catch (error) {
    console.error('❌ Erro ao adicionar funcionário ao localStorage:', error);
    return null;
  }
};

const updateFuncionarioLocalStorage = (id, funcionarioData) => {
  try {
    const funcionarios = getFuncionariosLocalStorage();
    const index = funcionarios.findIndex(f => f.id === id);
    
    if (index !== -1) {
      funcionarios[index] = {
        ...funcionarios[index],
        ...funcionarioData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
      console.log(`✅ Funcionário atualizado no localStorage: ${funcionarios[index].nomeCompleto}`);
      return funcionarios[index];
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário no localStorage:', error);
  }
  return null;
};

const deleteFuncionarioLocalStorage = (id) => {
  try {
    const funcionarios = getFuncionariosLocalStorage();
    const funcionario = funcionarios.find(f => f.id === id);
    const funcionariosAtualizados = funcionarios.filter(f => f.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionariosAtualizados));
    console.log(`✅ Funcionário excluído do localStorage: ${funcionario?.nomeCompleto}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao excluir funcionário do localStorage:', error);
    return false;
  }
};

// ===== MIGRAÇÃO DE DADOS =====

// Migrar dados do localStorage para MongoDB
export const migrarDadosParaMongoDB = async () => {
  try {
    const funcionariosLocal = getFuncionariosLocalStorage();
    
    if (funcionariosLocal.length === 0) {
      console.log('📝 Nenhum dado local para migrar');
      return { total: 0, migrados: 0, erros: 0 };
    }

    console.log(`🔄 Iniciando migração de ${funcionariosLocal.length} funcionários...`);
    
    let migrados = 0;
    let erros = 0;

    for (const funcionario of funcionariosLocal) {
      try {
        // Usar _id conforme schema MongoDB
        const funcionarioId = funcionario._id;
        
        if (!funcionarioId) {
          console.log(`⚠️ Funcionário sem _id, pulando: ${funcionario.nomeCompleto}`);
          continue;
        }
        
        // Verificar se já existe no MongoDB
        const existente = await qualidadeFuncionariosAPI.getById(funcionarioId);
        
        if (!existente) {
          // Remover _id do funcionário antes de enviar (MongoDB gera automaticamente)
          const { _id, ...funcionarioParaEnviar } = funcionario;
          await qualidadeFuncionariosAPI.create(funcionarioParaEnviar);
          migrados++;
          console.log(`✅ Migrado: ${funcionario.nomeCompleto}`);
        } else {
          console.log(`⏭️ Já existe: ${funcionario.nomeCompleto}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar ${funcionario.nomeCompleto}:`, error);
        erros++;
      }
    }

    console.log(`🎉 Migração concluída: ${migrados} migrados, ${erros} erros`);
    return { total: funcionariosLocal.length, migrados, erros };
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return { total: 0, migrados: 0, erros: 1 };
  }
};

// Verificar se há dados locais para migrar
export const verificarDadosLocais = () => {
  const funcionariosLocal = getFuncionariosLocalStorage();
  return funcionariosLocal.length > 0;
};

// Limpar dados locais após migração bem-sucedida
export const limparDadosLocais = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('funcionarios_velotax_backup');
    localStorage.removeItem('funcionarios_velotax_log');
    console.log('🧹 Dados locais limpos com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar dados locais:', error);
    return false;
  }
};

// ===== AVALIAÇÕES - API MONGODB =====

// Obter todas as avaliações
export const getAvaliacoes = async () => {
  try {
    const response = await qualidadeAvaliacoesAPI.getAll();
    console.log('📊 Dados recebidos da API (avaliações):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const avaliacoes = response?.data || response;
    console.log(`📊 Avaliações extraídas: ${Array.isArray(avaliacoes) ? avaliacoes.length : 0}`);
    
    // Garantir que sempre retorne um array
    return Array.isArray(avaliacoes) ? avaliacoes : [];
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações da API:', error);
    // Fallback para localStorage se API falhar
    return getAvaliacoesLocalStorage();
  }
};

// Adicionar avaliação
export const addAvaliacao = async (avaliacaoData) => {
  try {
    // Debug dos valores originais
    console.log('🔍 DEBUG - Valores originais dos critérios:');
    console.log('  - saudacaoAdequada:', typeof avaliacaoData.saudacaoAdequada, avaliacaoData.saudacaoAdequada);
    console.log('  - escutaAtiva:', typeof avaliacaoData.escutaAtiva, avaliacaoData.escutaAtiva);
    console.log('  - resolucaoQuestao:', typeof avaliacaoData.resolucaoQuestao, avaliacaoData.resolucaoQuestao);
    console.log('  - empatiaCordialidade:', typeof avaliacaoData.empatiaCordialidade, avaliacaoData.empatiaCordialidade);
    console.log('  - direcionouPesquisa:', typeof avaliacaoData.direcionouPesquisa, avaliacaoData.direcionouPesquisa);
    console.log('  - procedimentoIncorreto:', typeof avaliacaoData.procedimentoIncorreto, avaliacaoData.procedimentoIncorreto);
    console.log('  - encerramentoBrusco:', typeof avaliacaoData.encerramentoBrusco, avaliacaoData.encerramentoBrusco);
    
    // Mapear dados conforme schema console_analises.qualidade_avaliacoes
    const novaAvaliacao = {
      colaboradorNome: avaliacaoData.colaboradorNome, // String
      avaliador: avaliacaoData.avaliador, // String
      mes: avaliacaoData.mes, // String
      ano: Number(avaliacaoData.ano), // Number
      dataAvaliacao: avaliacaoData.dataAvaliacao ? new Date(avaliacaoData.dataAvaliacao).toISOString() : new Date().toISOString(), // String ISO
      arquivoLigacao: avaliacaoData.arquivoLigacao || '', // String
      nomeArquivo: avaliacaoData.nomeArquivo || '', // String
      saudacaoAdequada: Boolean(avaliacaoData.saudacaoAdequada), // Boolean
      escutaAtiva: Boolean(avaliacaoData.escutaAtiva), // Boolean
      resolucaoQuestao: Boolean(avaliacaoData.resolucaoQuestao), // Boolean
      empatiaCordialidade: Boolean(avaliacaoData.empatiaCordialidade), // Boolean
      direcionouPesquisa: Boolean(avaliacaoData.direcionouPesquisa), // Boolean
      procedimentoIncorreto: Boolean(avaliacaoData.procedimentoIncorreto), // Boolean
      encerramentoBrusco: Boolean(avaliacaoData.encerramentoBrusco), // Boolean
      moderado: Boolean(avaliacaoData.moderado || false), // Boolean
      observacoesModeracao: avaliacaoData.observacoesModeracao || '', // String
      pontuacaoTotal: 0, // Será calculado
      createdAt: new Date().toISOString(), // String ISO
      updatedAt: new Date().toISOString() // String ISO
    };
    
    // Calcular pontuação total
    novaAvaliacao.pontuacaoTotal = calcularPontuacaoTotal(novaAvaliacao);
    
    console.log('🔍 DEBUG - Pontuação calculada:', novaAvaliacao.pontuacaoTotal);
    console.log('🔍 DEBUG - Dados da avaliação sendo enviados:', novaAvaliacao);
    console.log('🔍 DEBUG - Tipos dos campos:');
    console.log('  - colaboradorNome:', typeof novaAvaliacao.colaboradorNome, novaAvaliacao.colaboradorNome);
    console.log('  - avaliador:', typeof novaAvaliacao.avaliador, novaAvaliacao.avaliador);
    console.log('  - mes:', typeof novaAvaliacao.mes, novaAvaliacao.mes);
    console.log('  - ano:', typeof novaAvaliacao.ano, novaAvaliacao.ano);
    console.log('  - dataAvaliacao:', typeof novaAvaliacao.dataAvaliacao, novaAvaliacao.dataAvaliacao);
    console.log('🔍 DEBUG - Critérios de avaliação:');
    console.log('  - saudacaoAdequada:', typeof novaAvaliacao.saudacaoAdequada, novaAvaliacao.saudacaoAdequada);
    console.log('  - escutaAtiva:', typeof novaAvaliacao.escutaAtiva, novaAvaliacao.escutaAtiva);
    console.log('  - resolucaoQuestao:', typeof novaAvaliacao.resolucaoQuestao, novaAvaliacao.resolucaoQuestao);
    console.log('  - empatiaCordialidade:', typeof novaAvaliacao.empatiaCordialidade, novaAvaliacao.empatiaCordialidade);
    console.log('  - direcionouPesquisa:', typeof novaAvaliacao.direcionouPesquisa, novaAvaliacao.direcionouPesquisa);
    console.log('  - procedimentoIncorreto:', typeof novaAvaliacao.procedimentoIncorreto, novaAvaliacao.procedimentoIncorreto);
    console.log('  - encerramentoBrusco:', typeof novaAvaliacao.encerramentoBrusco, novaAvaliacao.encerramentoBrusco);
    
    console.log('🔍 DEBUG - Enviando dados para API:', JSON.stringify(novaAvaliacao, null, 2));
    
    const response = await qualidadeAvaliacoesAPI.create(novaAvaliacao);
    console.log(`✅ Avaliação adicionada via API: ${response._id}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao adicionar avaliação via API:', error);
    // Fallback para localStorage se API falhar
    return addAvaliacaoLocalStorage(avaliacaoData);
  }
};

// Atualizar avaliação
export const updateAvaliacao = async (id, avaliacaoData) => {
  try {
    const avaliacaoAtualizada = {
      ...avaliacaoData,
      updatedAt: new Date().toISOString()
    };
    
    // Calcular pontuação total
    avaliacaoAtualizada.pontuacaoTotal = calcularPontuacaoTotal(avaliacaoAtualizada);
    
    console.log('🔍 DEBUG - Pontuação recalculada:', avaliacaoAtualizada.pontuacaoTotal);
    
    const response = await qualidadeAvaliacoesAPI.update(id, avaliacaoAtualizada);
    console.log(`✅ Avaliação atualizada via API: ${response._id}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao atualizar avaliação via API:', error);
    // Fallback para localStorage se API falhar
    return updateAvaliacaoLocalStorage(id, avaliacaoData);
  }
};

// Deletar avaliação
export const deleteAvaliacao = async (id) => {
  try {
    const response = await qualidadeAvaliacoesAPI.delete(id);
    console.log(`✅ Avaliação deletada via API: ${id}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao deletar avaliação via API:', error);
    // Fallback para localStorage se API falhar
    return deleteAvaliacaoLocalStorage(id);
  }
};

// ===== RELATÓRIOS =====

// Gerar relatório do agente
export const gerarRelatorioAgente = async (colaboradorNome) => {
  try {
    // Buscar todas as avaliações da API e filtrar no frontend
    const response = await qualidadeAvaliacoesAPI.getAll();
    console.log('📊 Dados recebidos da API (relatório agente):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const todasAvaliacoes = response?.data || response;
    console.log(`📊 Total de avaliações encontradas: ${Array.isArray(todasAvaliacoes) ? todasAvaliacoes.length : 0}`);
    
    const avaliacoes = Array.isArray(todasAvaliacoes) 
      ? todasAvaliacoes.filter(a => a.colaboradorNome === colaboradorNome)
      : [];
    
    console.log(`📊 Avaliações filtradas para ${colaboradorNome}: ${avaliacoes.length}`);
    
    if (avaliacoes.length === 0) {
      console.log('⚠️ Nenhuma avaliação encontrada para o colaborador:', colaboradorNome);
      return null;
    }

    // Buscar avaliações GPT para cada avaliação
    const avaliacoesComGPT = await Promise.all(
      avaliacoes.map(async (avaliacao) => {
        const avaliacaoGPT = await getAvaliacaoGPTByAvaliacaoId(avaliacao._id);
        return {
          ...avaliacao,
          avaliacaoGPT
        };
      })
    );

    // Usar função utilitária para gerar relatório
    const { gerarRelatorioAgente: gerarRelatorioAgenteUtil } = await import('../types/qualidade');
    return gerarRelatorioAgenteUtil(colaboradorNome, colaboradorNome, avaliacoesComGPT);
  } catch (error) {
    console.error('❌ Erro ao gerar relatório do agente via API:', error);
    // Fallback para localStorage
    return gerarRelatorioAgenteLocalStorage(colaboradorNome);
  }
};

// Gerar relatório da gestão
export const gerarRelatorioGestao = async (mes, ano) => {
  try {
    // Buscar todas as avaliações da API e filtrar no frontend
    const response = await qualidadeAvaliacoesAPI.getAll();
    console.log('📊 Dados recebidos da API (relatório gestão):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const todasAvaliacoes = response?.data || response;
    console.log(`📊 Total de avaliações encontradas: ${Array.isArray(todasAvaliacoes) ? todasAvaliacoes.length : 0}`);
    
    const avaliacoes = Array.isArray(todasAvaliacoes) 
      ? todasAvaliacoes.filter(a => a.mes === mes && a.ano === ano)
      : [];
    
    console.log(`📊 Avaliações filtradas para ${mes}/${ano}: ${avaliacoes.length}`);
    
    if (avaliacoes.length === 0) {
      console.log('⚠️ Nenhuma avaliação encontrada para o período:', `${mes}/${ano}`);
      return null;
    }

    // Usar função utilitária para gerar relatório
    const { gerarRelatorioGestao: gerarRelatorioGestaoUtil } = await import('../types/qualidade');
    return gerarRelatorioGestaoUtil(mes, ano, avaliacoes);
  } catch (error) {
    console.error('❌ Erro ao gerar relatório da gestão via API:', error);
    // Fallback para localStorage
    return gerarRelatorioGestaoLocalStorage(mes, ano);
  }
};

// Obter avaliações por colaborador
export const getAvaliacoesPorColaborador = async (colaboradorNome) => {
  try {
    // Buscar todas as avaliações da API e filtrar no frontend
    const response = await qualidadeAvaliacoesAPI.getAll();
    console.log('📊 Dados recebidos da API (avaliações por colaborador):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const todasAvaliacoes = response?.data || response;
    const avaliacoes = Array.isArray(todasAvaliacoes) 
      ? todasAvaliacoes.filter(a => a.colaboradorNome === colaboradorNome)
      : [];
    console.log(`📊 Avaliações do colaborador extraídas: ${avaliacoes.length}`);
    return avaliacoes;
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações do colaborador via API:', error);
    // Fallback para localStorage
    return getAvaliacoesPorColaboradorLocalStorage(colaboradorNome);
  }
};

// ===== API GPT - IMPLEMENTAÇÃO COMPLETA =====

// Configuração do axios para API GPT
const gptAPI = axios.create({
  baseURL: 'https://back-console.vercel.app/api/qualidade',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// 1. Listar todas as avaliações GPT
export const getAvaliacoesGPT = async (avaliacaoId = null) => {
  try {
    const url = avaliacaoId 
      ? `/avaliacoes-gpt?avaliacaoId=${avaliacaoId}`
      : '/avaliacoes-gpt';
    
    const response = await gptAPI.get(url);
    console.log('📊 Dados recebidos da API (avaliações GPT):', response.data);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const avaliacoesGPT = response.data?.data || response.data;
    console.log(`📊 Avaliações GPT extraídas: ${Array.isArray(avaliacoesGPT) ? avaliacoesGPT.length : 1}`);
    
    return avaliacoesGPT;
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações GPT:', error);
    return null;
  }
};

// 2. Obter avaliação GPT por ID
export const getAvaliacaoGPTById = async (id) => {
  try {
    const response = await gptAPI.get(`/avaliacoes-gpt/${id}`);
    console.log(`📊 Avaliação GPT carregada: ${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao carregar avaliação GPT por ID:', error);
    return null;
  }
};

// 3. Obter avaliação GPT por ID da avaliação original
export const getAvaliacaoGPTByAvaliacaoId = async (avaliacaoId) => {
  try {
    const response = await gptAPI.get(`/avaliacoes-gpt/avaliacao/${avaliacaoId}`);
    console.log(`📊 Avaliação GPT carregada para avaliação: ${avaliacaoId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao carregar avaliação GPT por avaliação ID:', error);
    return null;
  }
};

// 4. Criar nova avaliação GPT
export const createAvaliacaoGPT = async (dadosGPT) => {
  try {
    const response = await gptAPI.post('/avaliacoes-gpt', dadosGPT);
    console.log(`✅ Avaliação GPT criada: ${dadosGPT.avaliacaoId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar avaliação GPT:', error);
    return null;
  }
};

// 5. Atualizar avaliação GPT
export const updateAvaliacaoGPT = async (id, dadosGPT) => {
  try {
    const response = await gptAPI.put(`/avaliacoes-gpt/${id}`, dadosGPT);
    console.log(`✅ Avaliação GPT atualizada: ${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar avaliação GPT:', error);
    return null;
  }
};

// 6. Deletar avaliação GPT
export const deleteAvaliacaoGPT = async (id) => {
  try {
    const response = await gptAPI.delete(`/avaliacoes-gpt/${id}`);
    console.log(`✅ Avaliação GPT deletada: ${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao deletar avaliação GPT:', error);
    return null;
  }
};

// Exportar funções utilitárias
export { 
  getTendenciaClass, 
  getTendenciaText, 
  getPerformanceClass, 
  getPerformanceText, 
  formatDate 
};
