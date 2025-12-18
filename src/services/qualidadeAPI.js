// VERSION: v1.34.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.34.0 - Adicionado campo Desk ao objeto acessos {Velohub: Boolean, Console: Boolean, Academy: Boolean, Desk: Boolean}. Acessos são completamente opcionais.
// v1.33.0 - Adicionada normalização de formato de acessos (array vazio/null -> objeto {Velohub: Boolean, Console: Boolean}) para compatibilidade com novo schema

import { qualidadeFuncionariosAPI, qualidadeAvaliacoesAPI, qualidadeFuncoesAPI } from './api';
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

// Função auxiliar para normalizar formato de acessos
const normalizarAcessos = (acessos) => {
  // Se for null ou undefined, retornar objeto vazio
  if (!acessos) {
    return { Velohub: false, Console: false, Academy: false, Desk: false };
  }
  
  // Se já for objeto booleano, retornar como está (garantindo que tenha Velohub, Console, Academy e Desk)
  if (typeof acessos === 'object' && !Array.isArray(acessos)) {
    return {
      Velohub: acessos.Velohub === true,
      Console: acessos.Console === true,
      Academy: acessos.Academy === true,
      Desk: acessos.Desk === true
    };
  }
  
  // Se for array (formato antigo), converter para objeto booleano
  if (Array.isArray(acessos)) {
    const novoAcessos = { Velohub: false, Console: false, Academy: false, Desk: false };
    acessos.forEach(acesso => {
      if (acesso && acesso.sistema) {
        const sistema = acesso.sistema.toLowerCase();
        if (sistema === 'velohub') {
          novoAcessos.Velohub = true;
        } else if (sistema === 'console') {
          novoAcessos.Console = true;
        } else if (sistema === 'academy') {
          novoAcessos.Academy = true;
        } else if (sistema === 'desk') {
          novoAcessos.Desk = true;
        }
      }
    });
    return novoAcessos;
  }
  
  // Fallback: objeto vazio
  return { Velohub: false, Console: false, Academy: false, Desk: false };
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
    
    // Normalizar formato de acessos para cada funcionário
    const funcionariosNormalizados = Array.isArray(funcionarios) 
      ? funcionarios.map(func => ({
          ...func,
          acessos: normalizarAcessos(func.acessos)
        }))
      : [];
    
    return funcionariosNormalizados;
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
    
    // Normalizar formato de acessos para cada funcionário
    const funcionariosNormalizados = Array.isArray(funcionarios)
      ? funcionarios.map(func => ({
          ...func,
          acessos: normalizarAcessos(func.acessos)
        }))
      : [];
    
    return funcionariosNormalizados;
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários ativos da API:', error);
    // Fallback para localStorage se API falhar
    return getFuncionariosAtivosLocalStorage();
  }
};

// Adicionar funcionário
export const addFuncionario = async (funcionarioData) => {
  try {
    // Validar campos obrigatórios
    if (!funcionarioData.colaboradorNome?.trim()) {
      throw new Error('Nome do colaborador é obrigatório');
    }
    
    // Função para converter datas com validação
    const converterData = (dataString) => {
      if (!dataString || dataString.trim() === '') return null;
      const data = new Date(dataString);
      return isNaN(data.getTime()) ? null : data;
    };
    
    // Normalizar acessos: garantir formato objeto booleano
    let acessosNormalizados = null;
    if (funcionarioData.acessos) {
      if (typeof funcionarioData.acessos === 'object' && !Array.isArray(funcionarioData.acessos)) {
        // Formato novo: objeto booleano
        const novoAcessos = {};
        if (funcionarioData.acessos.Velohub === true) {
          novoAcessos.Velohub = true;
        }
        if (funcionarioData.acessos.Console === true) {
          novoAcessos.Console = true;
        }
        if (funcionarioData.acessos.Academy === true) {
          novoAcessos.Academy = true;
        }
        if (funcionarioData.acessos.Desk === true) {
          novoAcessos.Desk = true;
        }
        // Apenas definir se houver pelo menos um valor true
        acessosNormalizados = Object.keys(novoAcessos).length > 0 ? novoAcessos : null;
      }
    }
    
    // Converter strings de data para Date conforme schema MongoDB
    const novoFuncionario = {
      colaboradorNome: funcionarioData.colaboradorNome.trim(),
      dataAniversario: converterData(funcionarioData.dataAniversario),
      CPF: funcionarioData.CPF || null,
      profile_pic: funcionarioData.profile_pic || null,
      empresa: funcionarioData.empresa || '',
      dataContratado: converterData(funcionarioData.dataContratado),
      telefone: funcionarioData.telefone || '',
      userMail: funcionarioData.userMail || null,
      password: funcionarioData.password || null,
      atuacao: funcionarioData.atuacao || [],
      escala: funcionarioData.escala || '',
      acessos: acessosNormalizados,
      desligado: funcionarioData.desligado || false,
      dataDesligamento: converterData(funcionarioData.dataDesligamento),
      afastado: funcionarioData.afastado || false,
      dataAfastamento: converterData(funcionarioData.dataAfastamento)
    };
    
    console.log('🔍 Debug - Dados validados para POST funcionário:', novoFuncionario);
    
    const response = await qualidadeFuncionariosAPI.create(novoFuncionario);
    console.log(`✅ Funcionário adicionado via API: ${response.colaboradorNome}`);
    
    // Normalizar resposta também
    return {
      ...response,
      acessos: normalizarAcessos(response.acessos)
    };
  } catch (error) {
    console.error('❌ Erro ao adicionar funcionário via API:', error);
    console.error('❌ Detalhes do erro:', error.response?.data || error.message);
    throw error; // Não fazer fallback automático para identificar problemas reais
  }
};

// Atualizar funcionário
export const updateFuncionario = async (id, funcionarioData) => {
  try {
    // Validar campos obrigatórios
    if (!funcionarioData.colaboradorNome?.trim()) {
      throw new Error('Nome do colaborador é obrigatório');
    }
    
    // Função para converter datas com validação
    const converterData = (dataString) => {
      if (!dataString || dataString.trim() === '') return null;
      const data = new Date(dataString);
      return isNaN(data.getTime()) ? null : data;
    };
    
    // Normalizar acessos: garantir formato objeto booleano
    let acessosNormalizados = null;
    if (funcionarioData.acessos !== undefined && funcionarioData.acessos !== null) {
      if (typeof funcionarioData.acessos === 'object' && !Array.isArray(funcionarioData.acessos)) {
        // Formato novo: objeto booleano
        const novoAcessos = {};
        if (funcionarioData.acessos.Velohub === true) {
          novoAcessos.Velohub = true;
        }
        if (funcionarioData.acessos.Console === true) {
          novoAcessos.Console = true;
        }
        if (funcionarioData.acessos.Academy === true) {
          novoAcessos.Academy = true;
        }
        if (funcionarioData.acessos.Desk === true) {
          novoAcessos.Desk = true;
        }
        // Apenas definir se houver pelo menos um valor true
        acessosNormalizados = Object.keys(novoAcessos).length > 0 ? novoAcessos : null;
      }
    } else if (funcionarioData.acessos === null) {
      // Se explicitamente null, manter como null
      acessosNormalizados = null;
    }
    
    // Converter strings de data para Date conforme schema
    const funcionarioAtualizado = {
      ...funcionarioData,
      colaboradorNome: funcionarioData.colaboradorNome.trim(),
      dataAniversario: converterData(funcionarioData.dataAniversario),
      CPF: funcionarioData.CPF !== undefined ? (funcionarioData.CPF || null) : undefined,
      profile_pic: funcionarioData.profile_pic !== undefined ? (funcionarioData.profile_pic || null) : undefined,
      dataContratado: converterData(funcionarioData.dataContratado),
      dataDesligamento: converterData(funcionarioData.dataDesligamento),
      dataAfastamento: converterData(funcionarioData.dataAfastamento),
      userMail: funcionarioData.userMail !== undefined ? (funcionarioData.userMail || null) : undefined,
      password: funcionarioData.password !== undefined ? (funcionarioData.password || null) : undefined,
      acessos: acessosNormalizados !== undefined ? acessosNormalizados : undefined
    };
    
    const response = await qualidadeFuncionariosAPI.update(id, funcionarioAtualizado);
    console.log(`✅ Funcionário atualizado via API: ${response.colaboradorNome}`);
    
    // Normalizar resposta também
    return {
      ...response,
      acessos: normalizarAcessos(response.acessos)
    };
  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário via API:', error);
    throw error; // Não fazer fallback automático para identificar problemas reais
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
// Função removida - usar getAvaliadoresValidos de userService.js

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
// Função auxiliar para buscar status de áudio por avaliacaoId
const buscarStatusAudio = async (avaliacaoId) => {
  try {
    if (!avaliacaoId) return null;
    
    // Normalizar URL base removendo /api se existir no final
    const baseUrl = (process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app').replace(/\/api\/?$/, '');
    const response = await fetch(`${baseUrl}/api/audio-analise/status-por-avaliacao/${avaliacaoId}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success && data.data ? data.data : null;
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar status de áudio para avaliação ${avaliacaoId}:`, error.message);
    return null;
  }
};

export const getAvaliacoes = async () => {
  try {
    const response = await qualidadeAvaliacoesAPI.getAll();
    console.log('📊 Dados recebidos da API (avaliações):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const avaliacoes = response?.data || response;
    console.log(`📊 Avaliações extraídas: ${Array.isArray(avaliacoes) ? avaliacoes.length : 0}`);
    
    // Garantir que sempre retorne um array
    const avaliacoesArray = Array.isArray(avaliacoes) ? avaliacoes : [];
    
    // Mapear status de áudio diretamente dos campos da avaliação
    const avaliacoesComStatus = avaliacoesArray.map((avaliacao) => {
      // Os campos de status de áudio agora estão diretamente na avaliação
      return {
        ...avaliacao,
        audioStatus: avaliacao.audioSent || avaliacao.audioTreated ? {
          sent: avaliacao.audioSent || false,
          treated: avaliacao.audioTreated || false,
          nomeArquivoAudio: avaliacao.nomeArquivoAudio || null,
          audioCreatedAt: avaliacao.audioCreatedAt || null,
          audioUpdatedAt: avaliacao.audioUpdatedAt || null
        } : null,
        audioSent: avaliacao.audioSent || false,
        audioTreated: avaliacao.audioTreated || false
      };
    });
    
    return avaliacoesComStatus;
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações da API:', error);
    // Não fazer fallback - retornar array vazio em caso de erro
    return [];
  }
};

// Função para validar dados da avaliação
const validarDadosAvaliacao = (dados) => {
  if (!dados.colaboradorNome?.trim()) {
    throw new Error('Nome do colaborador é obrigatório');
  }
  if (!dados.avaliador?.trim()) {
    throw new Error('Nome do avaliador é obrigatório');
  }
  if (!dados.mes?.trim()) {
    throw new Error('Mês é obrigatório');
  }
  if (!dados.ano || dados.ano < 2020 || dados.ano > 2030) {
    throw new Error('Ano deve estar entre 2020 e 2030');
  }
  return true;
};

// Adicionar avaliação
export const addAvaliacao = async (avaliacaoData) => {
  try {
    // Validar dados antes do processamento
    validarDadosAvaliacao(avaliacaoData);
    
    // Mapear dados conforme schema console_analises.qualidade_avaliacoes
    const novaAvaliacao = {
      colaboradorNome: avaliacaoData.colaboradorNome, // String
      avaliador: avaliacaoData.avaliador, // String
      mes: avaliacaoData.mes, // String
      ano: Number(avaliacaoData.ano) || new Date().getFullYear(), // Number
      saudacaoAdequada: Boolean(avaliacaoData.saudacaoAdequada), // Boolean
      escutaAtiva: Boolean(avaliacaoData.escutaAtiva), // Boolean
      clarezaObjetividade: Boolean(avaliacaoData.clarezaObjetividade), // Boolean - NOVO
      resolucaoQuestao: Boolean(avaliacaoData.resolucaoQuestao), // Boolean
      dominioAssunto: Boolean(avaliacaoData.dominioAssunto), // Boolean - NOVO
      empatiaCordialidade: Boolean(avaliacaoData.empatiaCordialidade), // Boolean
      direcionouPesquisa: Boolean(avaliacaoData.direcionouPesquisa), // Boolean
      procedimentoIncorreto: Boolean(avaliacaoData.procedimentoIncorreto), // Boolean
      encerramentoBrusco: Boolean(avaliacaoData.encerramentoBrusco), // Boolean
      pontuacaoTotal: 0, // Será calculado
      observacoes: avaliacaoData.observacoes || '', // String
      dataLigacao: avaliacaoData.dataLigacao ? new Date(avaliacaoData.dataLigacao) : new Date(), // Date
      createdAt: new Date(), // Date
      updatedAt: new Date() // Date
    };
    
    // Calcular pontuação total
    novaAvaliacao.pontuacaoTotal = calcularPontuacaoTotal(novaAvaliacao);
    
    // DEBUG ESTRUTURADO - REMOVER APÓS CORREÇÃO
    console.log('🔍 DEBUG ESTRUTURADO:', {
      payload: novaAvaliacao,
      tipos: {
        dataAvaliacao: typeof novaAvaliacao.dataAvaliacao,
        dataLigacao: typeof novaAvaliacao.dataLigacao,
        createdAt: typeof novaAvaliacao.createdAt,
        updatedAt: typeof novaAvaliacao.updatedAt,
        ano: typeof novaAvaliacao.ano
      },
      valores: {
        ano: novaAvaliacao.ano,
        mes: novaAvaliacao.mes,
        colaboradorNome: novaAvaliacao.colaboradorNome,
        avaliador: novaAvaliacao.avaliador,
        pontuacaoTotal: novaAvaliacao.pontuacaoTotal
      },
      validacao: {
        colaboradorNomeValido: !!novaAvaliacao.colaboradorNome?.trim(),
        avaliadorValido: !!novaAvaliacao.avaliador?.trim(),
        mesValido: !!novaAvaliacao.mes?.trim(),
        anoValido: novaAvaliacao.ano >= 2020 && novaAvaliacao.ano <= 2030
      }
    });
    
    const response = await qualidadeAvaliacoesAPI.create(novaAvaliacao);
    console.log(`✅ Avaliação adicionada via API: ${response._id}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao adicionar avaliação via API:', error);
    
    // Se for erro de validação, não fazer fallback
    if (error.message.includes('obrigatório') || error.message.includes('deve estar entre')) {
      throw error;
    }
    
    // Não fazer fallback - apenas propagar erro da API
    throw error;
  }
};

// Atualizar avaliação
export const updateAvaliacao = async (id, avaliacaoData) => {
  try {
    // Validar dados antes do processamento
    validarDadosAvaliacao(avaliacaoData);
    
    // Mapear dados conforme schema console_analises.qualidade_avaliacoes (igual à criação)
    const avaliacaoAtualizada = {
      colaboradorNome: avaliacaoData.colaboradorNome, // String
      avaliador: avaliacaoData.avaliador, // String
      mes: avaliacaoData.mes, // String
      ano: Number(avaliacaoData.ano) || new Date().getFullYear(), // Number
      saudacaoAdequada: Boolean(avaliacaoData.saudacaoAdequada), // Boolean
      escutaAtiva: Boolean(avaliacaoData.escutaAtiva), // Boolean
      clarezaObjetividade: Boolean(avaliacaoData.clarezaObjetividade), // Boolean
      resolucaoQuestao: Boolean(avaliacaoData.resolucaoQuestao), // Boolean
      dominioAssunto: Boolean(avaliacaoData.dominioAssunto), // Boolean
      empatiaCordialidade: Boolean(avaliacaoData.empatiaCordialidade), // Boolean
      direcionouPesquisa: Boolean(avaliacaoData.direcionouPesquisa), // Boolean
      procedimentoIncorreto: Boolean(avaliacaoData.procedimentoIncorreto), // Boolean
      encerramentoBrusco: Boolean(avaliacaoData.encerramentoBrusco), // Boolean
      pontuacaoTotal: 0, // Será calculado
      observacoes: avaliacaoData.observacoes || '', // String
      dataLigacao: avaliacaoData.dataLigacao ? new Date(avaliacaoData.dataLigacao) : new Date(), // Date
      // Campos obrigatórios para atualização
      _id: id,
      updatedAt: new Date()
    };
    
    
    // Calcular pontuação total
    avaliacaoAtualizada.pontuacaoTotal = calcularPontuacaoTotal(avaliacaoAtualizada);
    
    
    const response = await qualidadeAvaliacoesAPI.update(id, avaliacaoAtualizada);
    console.log(`✅ Avaliação atualizada via API: ${response._id}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao atualizar avaliação via API:', error);
    // Não fazer fallback - apenas propagar erro da API
    throw error;
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
    // Não fazer fallback - apenas propagar erro da API
    throw error;
  }
};

// ===== RELATÓRIOS =====

// Gerar relatório do agente
export const gerarRelatorioAgente = async (colaboradorNome, dataInicio = null, dataFim = null) => {
  try {
    // Buscar todas as avaliações da API e filtrar no frontend
    const response = await qualidadeAvaliacoesAPI.getAll();
    console.log('📊 Dados recebidos da API (relatório agente):', response);
    
    // A API retorna { count: X, data: Array, success: true }
    // Precisamos extrair o array 'data'
    const todasAvaliacoes = response?.data || response;
    console.log(`📊 Total de avaliações encontradas: ${Array.isArray(todasAvaliacoes) ? todasAvaliacoes.length : 0}`);
    
    // Filtrar por colaborador
    let avaliacoes = Array.isArray(todasAvaliacoes) 
      ? todasAvaliacoes.filter(a => {
          const nomeAvaliacao = (a.colaboradorNome || '').trim().toLowerCase();
          const nomeColaborador = (colaboradorNome || '').trim().toLowerCase();
          return nomeAvaliacao === nomeColaborador;
        })
      : [];
    
    console.log(`📊 Avaliações filtradas para ${colaboradorNome}: ${avaliacoes.length}`);
    
    // Log de debug com nomes únicos encontrados
    if (Array.isArray(todasAvaliacoes) && todasAvaliacoes.length > 0 && avaliacoes.length === 0) {
      const nomesUnicos = [...new Set(todasAvaliacoes.map(a => a.colaboradorNome).filter(Boolean))];
      console.log('🔍 DEBUG - Nomes únicos encontrados nas avaliações:', nomesUnicos.slice(0, 10));
      console.log('🔍 DEBUG - Nome buscado:', colaboradorNome);
    }
    
    if (avaliacoes.length === 0) {
      console.log('⚠️ Nenhuma avaliação encontrada para o colaborador:', colaboradorNome);
      return null;
    }

    // Separar avaliações: todas para gráfico, filtradas para cards
    const avaliacoesParaGrafico = [...avaliacoes]; // Todas as avaliações para o gráfico
    
    // Filtrar por período (createdAt) se filtro estiver ativo (apenas para cards)
    let avaliacoesFiltradas = avaliacoes;
    if (dataInicio || dataFim) {
      avaliacoesFiltradas = avaliacoes.filter(a => {
        if (!a.createdAt) return false;
        
        const dataCriacao = new Date(a.createdAt);
        if (isNaN(dataCriacao.getTime())) return false;
        
        // Normalizar para início do dia
        const inicio = dataInicio ? new Date(dataInicio) : null;
        if (inicio) inicio.setHours(0, 0, 0, 0);
        
        const fim = dataFim ? new Date(dataFim) : null;
        if (fim) fim.setHours(23, 59, 59, 999);
        
        const dataNormalizada = new Date(dataCriacao);
        dataNormalizada.setHours(0, 0, 0, 0);
        
        const dentroInicio = !inicio || dataNormalizada >= inicio;
        const dentroFim = !fim || dataNormalizada <= fim;
        
        return dentroInicio && dentroFim;
      });
      
      console.log(`📊 Avaliações filtradas por período (${dataInicio || 'início'} a ${dataFim || 'fim'}): ${avaliacoesFiltradas.length}`);
    }

    // Buscar avaliações GPT para avaliações filtradas (para cards)
    const avaliacoesFiltradasComGPT = await Promise.all(
      avaliacoesFiltradas.map(async (avaliacao) => {
        try {
          const avaliacaoGPT = await getAvaliacaoGPTByAvaliacaoId(avaliacao._id);
          return {
            ...avaliacao,
            avaliacaoGPT: avaliacaoGPT || null
          };
        } catch (error) {
          console.warn(`⚠️ Não foi possível buscar avaliação GPT para ${avaliacao._id}:`, error.message);
          return {
            ...avaliacao,
            avaliacaoGPT: null
          };
        }
      })
    );

    // Buscar avaliações GPT para todas as avaliações (para gráfico)
    const avaliacoesParaGraficoComGPT = await Promise.all(
      avaliacoesParaGrafico.map(async (avaliacao) => {
        try {
          const avaliacaoGPT = await getAvaliacaoGPTByAvaliacaoId(avaliacao._id);
          return {
            ...avaliacao,
            avaliacaoGPT: avaliacaoGPT || null
          };
        } catch (error) {
          console.warn(`⚠️ Não foi possível buscar avaliação GPT para ${avaliacao._id}:`, error.message);
          return {
            ...avaliacao,
            avaliacaoGPT: null
          };
        }
      })
    );

    console.log(`📊 DEBUG - Total de avaliações com GPT (filtradas): ${avaliacoesFiltradasComGPT.length}`);
    console.log(`📊 DEBUG - Total de avaliações com GPT (gráfico): ${avaliacoesParaGraficoComGPT.length}`);

    // Buscar média IA do backend
    let mediaIA = null;
    try {
      // Normalizar URL base removendo /api se existir no final
      const baseUrl = (process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app').replace(/\/api\/?$/, '');
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);
      
      const mediaResponse = await fetch(`${baseUrl}/api/audio-analise/media-agente/${encodeURIComponent(colaboradorNome)}?${params}`);
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        if (mediaData.success) {
          mediaIA = mediaData.mediaIA;
          console.log(`📊 DEBUG - Média IA obtida do backend: ${mediaIA}, Total análises: ${mediaData.totalAnalises}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível buscar média IA do backend:', error.message);
    }

    // Usar função utilitária para gerar relatório
    // Passar avaliações filtradas para cards e todas para gráfico
    const { gerarRelatorioAgente: gerarRelatorioAgenteUtil } = await import('../types/qualidade');
    const relatorio = gerarRelatorioAgenteUtil(colaboradorNome, avaliacoesFiltradasComGPT, avaliacoesParaGraficoComGPT);
    
    // Substituir mediaGPT pela mediaIA do backend se disponível
    if (relatorio && mediaIA !== null) {
      relatorio.mediaGPT = mediaIA;
    }
    
    console.log(`📊 DEBUG - Relatório gerado:`, relatorio ? 'Sucesso' : 'Null');
    return relatorio;
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
  baseURL: 'https://backend-gcp-278491073220.us-east1.run.app/api/qualidade',
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
// DEPRECATED: Esta função não deve mais ser usada. Use buscarResultadoAnalise do qualidadeAudioService.js
export const getAvaliacaoGPTById = async (id) => {
  console.warn('⚠️ DEPRECATED: getAvaliacaoGPTById está deprecado. Use buscarResultadoAnalise() do qualidadeAudioService.js para buscar de audio_analise_results.');
  return null;
};

// 3. Obter avaliação GPT por ID da avaliação original
// DEPRECATED: Agora busca de audio_analise_results ao invés de qualidade_avaliacoes_gpt
export const getAvaliacaoGPTByAvaliacaoId = async (avaliacaoId) => {
  try {
    // Normalizar URL base removendo /api se existir no final
    const baseUrl = (process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app').replace(/\/api\/?$/, '');
    
    // Buscar de audio_analise_results ao invés de qualidade_avaliacoes_gpt
    const response = await fetch(`${baseUrl}/api/audio-analise/result/${avaliacaoId}`);
    
    if (!response.ok) {
      // Se não encontrar em audio_analise_results, retornar null (não há análise ainda)
      if (response.status === 404) {
        console.log(`📊 Nenhuma análise GPT encontrada em audio_analise_results para avaliação: ${avaliacaoId}`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.log(`📊 Resposta inválida de audio_analise_results para avaliação: ${avaliacaoId}`);
      return null;
    }
    
    // Se não houver gptAnalysis, retornar null
    if (!result.data.gptAnalysis) {
      console.log(`📊 Nenhuma análise GPT encontrada em audio_analise_results.gptAnalysis para avaliação: ${avaliacaoId}`);
      return null;
    }
    
    // Mapear dados de audio_analise_results.gptAnalysis para formato esperado (compatibilidade)
    const gptAnalysis = result.data.gptAnalysis;
    const mappedData = {
      _id: result.data._id,
      avaliacao_id: result.data.avaliacaoMonitorId,
      analiseGPT: gptAnalysis.analysis || '',
      pontuacaoGPT: gptAnalysis.pontuacao || 0,
      criteriosGPT: gptAnalysis.criterios || {},
      confianca: gptAnalysis.confianca || 0,
      palavrasCriticas: gptAnalysis.palavrasCriticas || [],
      calculoDetalhado: [], // Campo não existe em audio_analise_results - retornar array vazio
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
      // Campos adicionais disponíveis em audio_analise_results
      recomendacoes: gptAnalysis.recomendacoes || [],
      validacaoGemini: gptAnalysis.validacaoGemini || null
    };
    
    console.log(`📊 Avaliação GPT carregada de audio_analise_results para avaliação: ${avaliacaoId}`);
    return mappedData;
  } catch (error) {
    console.error('❌ Erro ao carregar análise GPT de audio_analise_results:', error);
    return null;
  }
};

// 4. Criar nova avaliação GPT
// DEPRECATED: Esta função não deve mais ser usada. Análises GPT são criadas automaticamente via Worker em audio_analise_results
export const createAvaliacaoGPT = async (dadosGPT) => {
  console.warn('⚠️ DEPRECATED: createAvaliacaoGPT está deprecado. Análises GPT são criadas automaticamente via Worker em audio_analise_results.');
  console.warn('⚠️ Use uploadAudioParaAnalise() do qualidadeAudioService.js para análise de áudio.');
  return null;
};

// 5. Atualizar avaliação GPT
// DEPRECATED: Esta função não deve mais ser usada. Atualizações devem ser feitas em audio_analise_results.gptAnalysis
export const updateAvaliacaoGPT = async (id, dadosGPT) => {
  console.warn('⚠️ DEPRECATED: updateAvaliacaoGPT está deprecado. Use editarAnaliseGPT() do qualidadeAudioService.js para atualizar análise em audio_analise_results.');
  return null;
};

// 6. Deletar avaliação GPT
// DEPRECATED: Esta função não deve mais ser usada. Dados estão em audio_analise_results
export const deleteAvaliacaoGPT = async (id) => {
  console.warn('⚠️ DEPRECATED: deleteAvaliacaoGPT está deprecado. Dados de análise GPT estão em audio_analise_results.');
  return null;
};

// ========================================
// 🎯 FUNÇÕES - CRUD OPERATIONS
// ========================================

// Listar todas as funções
export const getFuncoes = async () => {
  try {
    console.log('🔍 Carregando funções da API...');
    const response = await qualidadeFuncoesAPI.getAll();
    console.log('📊 Funções carregadas:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao carregar funções:', error);
    throw error;
  }
};

// Criar nova função
export const addFuncao = async (funcaoData) => {
  try {
    console.log('🔍 Criando nova função:', funcaoData);
    const response = await qualidadeFuncoesAPI.create(funcaoData);
    console.log('✅ Função criada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar função:', error);
    throw error;
  }
};

// Atualizar função
export const updateFuncao = async (id, funcaoData) => {
  try {
    console.log('🔍 Atualizando função:', id, funcaoData);
    const response = await qualidadeFuncoesAPI.update(id, funcaoData);
    console.log('✅ Função atualizada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao atualizar função:', error);
    throw error;
  }
};

// Deletar função
export const deleteFuncao = async (id) => {
  try {
    console.log('🔍 Deletando função:', id);
    const response = await qualidadeFuncoesAPI.delete(id);
    console.log('✅ Função deletada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao deletar função:', error);
    throw error;
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
