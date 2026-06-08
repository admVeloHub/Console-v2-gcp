// VERSION: v1.61.0 | DATE: 2026-06-05 | AUTHOR: VeloHub Development Team
// CHANGELOG: v1.61.0 - mapAudioAnaliseResultDocToGptRow: normalizador dual LISTA+legado (analiseDialogo, criteriosDetalhados, pontuacaoCalculada, observacaoGPT)
// CHANGELOG: v1.60.2 - getAvaliacoes: normalizar legado dataLigacao/horaLigacao absolutos na leitura
// CHANGELOG: v1.60.1 - dataLigacao String YYYY-MM-DD absoluta (sem Date/UTC) + horaLigacao HH:mm
// CHANGELOG: v1.60.0 - dataLigacao só data (UTC) + horaLigacao String HH:mm absoluto em add/update avaliação ligação
// CHANGELOG: v1.59.0 - addFuncionario/updateFuncionario: campo departamento (qualidade_funcionarios)
// CHANGELOG: v1.58.0 - CRUD qa_resgate_items (GET/POST/PUT/DELETE /qualidade/qa-resgate-items)
// CHANGELOG: v1.57.0 - getAtendimentoTrophyXpTotal: GET /atendimento-trophy/xp-total (Quadro XP Excelência)
// CHANGELOG: v1.56.0 - salvarAtendimentoTrophy: POST /atendimento-trophy (academy_registros.atendimento_trophies)
// CHANGELOG: v1.55.0 - gptAPI: interceptor GET com _nc (mesma política anti-cache que api.js / valores_campos)
// CHANGELOG: v1.54.0 - upsertQaTrophiesCatalog (valores_campos qa_trophies_catalog)
// CHANGELOG: v1.53.0 - qa_trophy_config: xpClass no payload como rótulo (Baixo|Normal|Alto|Especial), alinhado ao SKYNET
// CHANGELOG: v1.52.0 - valores_campos: listagem + upsert de catálogos fixos (cadastro_campos, feedback, qa_trophy_config)
// CHANGELOG: v1.51.0 - QA Feedback: getValoresCampoQa, gerarQaFeedback, salvarQaFeedback (GET/POST /api/qualidade — Skynet)
// CHANGELOG: v1.50.0 - Relatório agente: com filtro de data, o gráfico (histórico/média mensal) usa a mesma lista que os cards; sem filtro mantém histórico completo
// CHANGELOG: v1.49.0 - ticket: payload com critérios PascalCase (FONTE / backend qualidade_ticket_avaliacoes)
// CHANGELOG: v1.48.0 - getAvaliacoes/relatórios: merge liga + ticket-avaliacoes; add/update/delete: ticket → API qualidade_ticket_avaliacoes; liga sem tipoAvaliacao/numeroTicket no POST/PUT; deleteAvaliacao(id, { isTicket })
// CHANGELOG: v1.47.2 - addAvaliacao/updateAvaliacao: numeroTicket (modo ticket; null em ligação)
// CHANGELOG: v1.47.1 - addAvaliacao/updateAvaliacao: campo tipoAvaliacao ('ligacao' | 'ticket')
// CHANGELOG: v1.47.0 - fetch áudio/IA: base URL via getResolvedApiOrigin (dev → localhost:3001 alinhado a api.js)
// CHANGELOG: v1.46.0 - Campo ChavePix (credencial Chave Pix) no objeto acessos em normalizarAcessos, addFuncionario e updateFuncionario; formato legado array aceita sistema ChavePix / normalizado chavepix
// CHANGELOG: v1.45.1 - Release push GitHub 2026-04-10
// CHANGELOG: v1.45.0 - gerarRelatorioAgente: média/gráfico IA usa avaliacao.avaliacaoIA (sem sequência getAvaliacaoGPT por id)
// CHANGELOG: v1.44.0 - getAvaliacaoGPTByAvaliacaoIdsBatch: GET results-por-avaliacoes (lote); mapAudioAnaliseResultDocToGptRow compartilhado com get por id
// CHANGELOG: v1.43.3 - getAvaliacaoGPTByAvaliacaoId: mais fontes de texto/nota; nunca retorna null em 200 se houver doc (critérios/transcrição/metadados → _iaParcial)
// CHANGELOG: v1.43.2 - addAvaliacao/updateAvaliacao: extrair documento de { success, data } retornado pelo POST/PUT /qualidade/avaliacoes
// CHANGELOG: v1.43.1 - getAvaliacaoGPTByAvaliacaoId: aceita qualityAnalysis + pontuacaoConsensual (além de gptAnalysis); alinhado ao schema audio_analise_results
// CHANGELOG: v1.43.0 - getAvaliacaoGPTByAvaliacaoId: dedupe in-flight, retry/backoff 429; gerarRelatorioAgente: fetch GPT sequencial (evita rate limit)
// CHANGELOG: v1.42.0 - Campo somenteAnaliseAudioIA em addAvaliacao/updateAvaliacao (fluxo lote só IA)
// CHANGELOG: v1.41.0 - Mapeamento avaliações: audioTreated sem coerção false; campos auto-retry e unlock no audioStatus
// CHANGELOG: v1.40.0 - Campo apoioN1 (credencial Apoio N1) no objeto acessos em normalizarAcessos, addFuncionario e updateFuncionario
// CHANGELOG: v1.39.0 - extractQualidadeLista: suporta vários formatos de resposta da API (data/funcionarios/items/results e aninhados); getFuncionarios/getFuncionariosAtivos usam extração resiliente
// CHANGELOG: v1.38.0 - Adicionado campo Sociais ao objeto acessos em todas as funções. Normalização aplicada ao retorno de getFuncionariosLocalStorage.
// CHANGELOG: v1.37.0 - Adicionado campo realTime ao objeto acessos em todas as funções de normalização {Velohub: Boolean, Console: Boolean, Academy: Boolean, Desk: Boolean, Ouvidoria: Boolean, realTime: Boolean}
// CHANGELOG: v1.36.1 - Corrigido acesso aos dados do funcionário criado em addFuncionario: API retorna {success, data, message}, então dados estão em response.data
// CHANGELOG: v1.36.0 - Adicionado campo Ouvidoria ao objeto acessos {Velohub: Boolean, Console: Boolean, Academy: Boolean, Desk: Boolean, Ouvidoria: Boolean}
// CHANGELOG: v1.35.0 - Atualização de métricas: substituído dominioAssunto por registroAtendimento, adicionado conformidadeTicket e naoConsultouBot
// CHANGELOG: v1.34.0 - Adicionado campo Desk ao objeto acessos {Velohub: Boolean, Console: Boolean, Academy: Boolean, Desk: Boolean}. Acessos são completamente opcionais.
// v1.33.0 - Adicionada normalização de formato de acessos (array vazio/null -> objeto {Velohub: Boolean, Console: Boolean}) para compatibilidade com novo schema

import { qualidadeFuncionariosAPI, qualidadeAvaliacoesAPI, qualidadeTicketAvaliacoesAPI, qualidadeFuncoesAPI, qualidadeQaResgateItemsAPI, getResolvedApiOrigin } from './api';
import axios from 'axios';
import { generateId, calcularPontuacaoTotal, calcularPontuacaoTotalTicket } from '../types/qualidade';
import {
  normalizeDataLigacaoInput,
  normalizeHoraLigacaoInput,
  normalizarAvaliacaoDataLigacaoLegado
} from '../utils/qualidadeDataLigacao';
import { normalizeAudioAnaliseResult, hasConteudoIa } from '../utils/qualidadeAudioAnaliseNormalize';
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

const _sleepQualidadeApi = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const _gptResultFetchByAvaliacaoId = new Map();
const _gptBatchFetchByKey = new Map();

/** Resposta da API costuma ser { success, data: documento }; em alguns ambientes pode vir o documento direto. */
const unwrapQualidadeAvaliacaoDoc = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.data != null && typeof raw.data === 'object' && (raw.data._id != null || raw.data.id != null)) {
    return raw.data;
  }
  if (raw._id != null || raw.id != null) return raw;
  return null;
};

// ===== FUNCIONÁRIOS - API MONGODB =====

/**
 * Extrai um array de documentos de respostas da API Qualidade (formatos variados).
 * Evita lista vazia quando o backend envia { funcionarios }, { data: { data } }, etc.
 */
export const extractQualidadeLista = (payload) => {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  const topKeys = ['data', 'funcionarios', 'items', 'results', 'rows'];
  for (const k of topKeys) {
    const v = payload[k];
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') {
      const innerKeys = ['data', 'items', 'rows', 'results', 'funcionarios'];
      for (const ik of innerKeys) {
        if (Array.isArray(v[ik])) return v[ik];
      }
    }
  }
  return [];
};

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

/** Credenciais de plataforma (módulos VeloHub → qualidade_funcoes.modulosVelohub) */
export const ACESSOS_PLATAFORMA_PADRAO = () => ({
  Velohub: false,
  Console: false,
  Academy: false,
  Desk: false,
  realTime: false,
});

const normalizarAcessos = (acessos) => {
  if (Array.isArray(acessos)) {
    const novo = ACESSOS_PLATAFORMA_PADRAO();
    acessos.forEach((acesso) => {
      if (!acesso?.sistema) return;
      const sistema = String(acesso.sistema).toLowerCase();
      if (sistema === 'velohub') novo.Velohub = true;
      else if (sistema === 'console') novo.Console = true;
      else if (sistema === 'academy') novo.Academy = true;
      else if (sistema === 'desk') novo.Desk = true;
      else if (sistema === 'realtime' || sistema === 'tempo real') novo.realTime = true;
    });
    return novo;
  }
  if (typeof acessos === 'object' && acessos) {
    return {
      Velohub: acessos.Velohub === true,
      Console: acessos.Console === true,
      Academy: acessos.Academy === true,
      Desk: acessos.Desk === true,
      realTime: acessos.realTime === true,
    };
  }
  return ACESSOS_PLATAFORMA_PADRAO();
};

// Obter todos os funcionários
export const getFuncionarios = async () => {
  try {
    console.log('🔍 Tentando carregar funcionários da API...');
    const response = await qualidadeFuncionariosAPI.getAll();
    console.log('📊 Dados recebidos da API:', response);

    const funcionarios = extractQualidadeLista(response);
    console.log(`📊 Funcionários extraídos: ${funcionarios.length}`);
    
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

    const funcionarios = extractQualidadeLista(response);
    console.log(`📊 Funcionários ativos extraídos: ${funcionarios.length}`);
    
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
    
    let acessosNormalizados = ACESSOS_PLATAFORMA_PADRAO();
    if (funcionarioData.desligado || funcionarioData.afastado) {
      acessosNormalizados = ACESSOS_PLATAFORMA_PADRAO();
    } else {
      acessosNormalizados = normalizarAcessos(funcionarioData.acessos);
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
      departamento: funcionarioData.departamento || '',
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
    console.log(`✅ Funcionário adicionado via API: ${response.data?.colaboradorNome}`);
    
    // Normalizar resposta também
    return {
      ...response.data,
      acessos: normalizarAcessos(response.data?.acessos)
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
    
    let acessosNormalizados = ACESSOS_PLATAFORMA_PADRAO();
    if (funcionarioData.desligado || funcionarioData.afastado) {
      acessosNormalizados = ACESSOS_PLATAFORMA_PADRAO();
    } else if (funcionarioData.acessos !== undefined && funcionarioData.acessos !== null) {
      acessosNormalizados = normalizarAcessos(funcionarioData.acessos);
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
      departamento: funcionarioData.departamento !== undefined ? (funcionarioData.departamento || '') : undefined,
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
      
      // Aplicar normalização de acessos para garantir formato consistente (evita checkboxes não exibidos)
      return funcionariosCorrigidos.map(func => ({
        ...func,
        acessos: normalizarAcessos(func.acessos)
      }));
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
    const baseUrl = getResolvedApiOrigin();
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

/**
 * Funde listas liga (qualidade_avaliacoes) e ticket (qualidade_ticket_avaliacoes) para UI e filtros.
 * @param {import('../types/qualidade').Avaliacao[]|any[]} liga
 * @param {any[]} ticket
 */
const mergeAvaliacoesLigaETicket = (liga, ticket) => {
  const l = (liga || []).map((a) =>
    normalizarAvaliacaoDataLigacaoLegado({ ...a, tipoAvaliacao: 'ligacao' })
  );
  const t = (ticket || []).map((a) => ({
    ...a,
    tipoAvaliacao: 'ticket',
    dataLigacao: a.dataLigacao != null ? a.dataLigacao : a.dataChamado
  }));
  return [...l, ...t];
};

const fetchAvaliacoesAgrupado = async () => {
  const [resL, resT] = await Promise.all([
    qualidadeAvaliacoesAPI.getAll().catch(() => ({})),
    qualidadeTicketAvaliacoesAPI.getAll().catch(() => ({}))
  ]);
  return mergeAvaliacoesLigaETicket(extractQualidadeLista(resL), extractQualidadeLista(resT));
};

export const getAvaliacoes = async () => {
  try {
    const avaliacoesArray = await fetchAvaliacoesAgrupado();
    console.log('📊 Dados recebidos da API (avaliações liga+ticket):', avaliacoesArray.length);
    console.log(`📊 Avaliações extraídas: ${avaliacoesArray.length}`);
    
    
    // Mapear status de áudio diretamente dos campos da avaliação
    const avaliacoesComStatus = avaliacoesArray.map((avaliacao) => {
      const hasAudioFields =
        avaliacao.audioSent ||
        avaliacao.audioTreated !== undefined ||
        avaliacao.nomeArquivoAudio;
      return {
        ...avaliacao,
        audioStatus: hasAudioFields ? {
          sent: avaliacao.audioSent || false,
          treated: avaliacao.audioTreated,
          nomeArquivoAudio: avaliacao.nomeArquivoAudio || null,
          audioCreatedAt: avaliacao.audioCreatedAt || null,
          audioUpdatedAt: avaliacao.audioUpdatedAt || null,
          audioManualReenvioDisponivelEm: avaliacao.audioManualReenvioDisponivelEm || null,
          audioAutoRepublishAttempts: avaliacao.audioAutoRepublishAttempts ?? 0,
          audioLastAutoRepublishAt: avaliacao.audioLastAutoRepublishAt || null
        } : null,
        audioSent: avaliacao.audioSent || false,
        audioTreated: avaliacao.audioTreated,
        audioManualReenvioDisponivelEm: avaliacao.audioManualReenvioDisponivelEm || null,
        audioAutoRepublishAttempts: avaliacao.audioAutoRepublishAttempts ?? 0,
        audioLastAutoRepublishAt: avaliacao.audioLastAutoRepublishAt || null
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

    if (avaliacaoData.tipoAvaliacao === 'ticket') {
      const dataRef = avaliacaoData.dataChamado || avaliacaoData.dataLigacao;
      const nro = avaliacaoData.numeroTicket;
      const numTicket = nro != null && !Number.isNaN(Number(nro)) ? Number(String(nro).replace(/\D/g, '')) : NaN;
      if (!dataRef) throw new Error('Data do chamado é obrigatória (ticket).');
      if (Number.isNaN(numTicket)) throw new Error('Número do ticket inválido.');

      const docTicket = {
        colaboradorNome: avaliacaoData.colaboradorNome,
        avaliador: avaliacaoData.avaliador,
        mes: avaliacaoData.mes,
        ano: Number(avaliacaoData.ano) || new Date().getFullYear(),
        ProducaoTexto: Boolean(avaliacaoData.ProducaoTexto),
        ClarezaObjetividade: Boolean(avaliacaoData.ClarezaObjetividade),
        BoaResolucaoProcedimento: Boolean(avaliacaoData.BoaResolucaoProcedimento),
        AderenciaEstruturaResposta: Boolean(avaliacaoData.AderenciaEstruturaResposta),
        Tabulacao: Boolean(avaliacaoData.Tabulacao),
        PassouPrazoResposta: Boolean(avaliacaoData.PassouPrazoResposta),
        RepassouProcedimentoIncorreto: Boolean(avaliacaoData.RepassouProcedimentoIncorreto),
        NaoUtilizouBotApoio: Boolean(avaliacaoData.NaoUtilizouBotApoio),
        observacoes: avaliacaoData.observacoes || '',
        dataChamado: new Date(dataRef),
        numeroTicket: numTicket,
        pontuacaoTotal: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      docTicket.pontuacaoTotal = calcularPontuacaoTotalTicket(docTicket);

      const raw = await qualidadeTicketAvaliacoesAPI.create(docTicket);
      const created = unwrapQualidadeAvaliacaoDoc(raw) || { ...docTicket, _id: null };
      if (!created || (created._id == null && created.id == null)) {
        console.error('❌ Resposta inesperada ao criar avaliação de ticket:', raw);
        throw new Error('Resposta da API sem id da avaliação (ticket).');
      }
      const uid = created._id || created.id;
      console.log(`✅ Avaliação de ticket adicionada via API: ${uid}`);
      return {
        ...created,
        tipoAvaliacao: 'ticket',
        dataLigacao: created.dataChamado || created.dataLigacao
      };
    }

    // Mapear dados conforme schema console_analises.qualidade_avaliacoes
    const novaAvaliacao = {
      colaboradorNome: avaliacaoData.colaboradorNome, // String
      avaliador: avaliacaoData.avaliador, // String
      mes: avaliacaoData.mes, // String
      ano: Number(avaliacaoData.ano) || new Date().getFullYear(), // Number
      saudacaoAdequada: Boolean(avaliacaoData.saudacaoAdequada), // Boolean
      escutaAtiva: Boolean(avaliacaoData.escutaAtiva), // Boolean
      clarezaObjetividade: Boolean(avaliacaoData.clarezaObjetividade), // Boolean
      resolucaoQuestao: Boolean(avaliacaoData.resolucaoQuestao), // Boolean
      registroAtendimento: Boolean(avaliacaoData.registroAtendimento), // Boolean
      empatiaCordialidade: Boolean(avaliacaoData.empatiaCordialidade), // Boolean
      direcionouPesquisa: Boolean(avaliacaoData.direcionouPesquisa), // Boolean
      naoConsultouBot: Boolean(avaliacaoData.naoConsultouBot), // Boolean
      conformidadeTicket: Boolean(avaliacaoData.conformidadeTicket), // Boolean - NOVO
      procedimentoIncorreto: Boolean(avaliacaoData.procedimentoIncorreto), // Boolean
      encerramentoBrusco: Boolean(avaliacaoData.encerramentoBrusco), // Boolean
      pontuacaoTotal: 0, // Será calculado
      observacoes: avaliacaoData.observacoes || '', // String
      dataLigacao: normalizeDataLigacaoInput(avaliacaoData.dataLigacao), // String YYYY-MM-DD absoluta
      horaLigacao: normalizeHoraLigacaoInput(avaliacaoData.horaLigacao), // String HH:mm absoluta
      somenteAnaliseAudioIA: avaliacaoData.somenteAnaliseAudioIA === true,
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
    
    const raw = await qualidadeAvaliacoesAPI.create(novaAvaliacao);
    const created = unwrapQualidadeAvaliacaoDoc(raw);
    if (!created || (created._id == null && created.id == null)) {
      console.error('❌ Resposta inesperada ao criar avaliação:', raw);
      throw new Error('Resposta da API sem id da avaliação.');
    }
    console.log(`✅ Avaliação adicionada via API: ${created._id || created.id}`);
    return normalizarAvaliacaoDataLigacaoLegado(created);
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

    if (avaliacaoData.tipoAvaliacao === 'ticket') {
      const dataRef = avaliacaoData.dataChamado || avaliacaoData.dataLigacao;
      const nro = avaliacaoData.numeroTicket;
      const numTicket = nro != null && !Number.isNaN(Number(nro)) ? Number(String(nro).replace(/\D/g, '')) : NaN;
      if (!dataRef) throw new Error('Data do chamado é obrigatória (ticket).');
      if (Number.isNaN(numTicket)) throw new Error('Número do ticket inválido.');

      const docTicket = {
        colaboradorNome: avaliacaoData.colaboradorNome,
        avaliador: avaliacaoData.avaliador,
        mes: avaliacaoData.mes,
        ano: Number(avaliacaoData.ano) || new Date().getFullYear(),
        ProducaoTexto: Boolean(avaliacaoData.ProducaoTexto),
        ClarezaObjetividade: Boolean(avaliacaoData.ClarezaObjetividade),
        BoaResolucaoProcedimento: Boolean(avaliacaoData.BoaResolucaoProcedimento),
        AderenciaEstruturaResposta: Boolean(avaliacaoData.AderenciaEstruturaResposta),
        Tabulacao: Boolean(avaliacaoData.Tabulacao),
        PassouPrazoResposta: Boolean(avaliacaoData.PassouPrazoResposta),
        RepassouProcedimentoIncorreto: Boolean(avaliacaoData.RepassouProcedimentoIncorreto),
        NaoUtilizouBotApoio: Boolean(avaliacaoData.NaoUtilizouBotApoio),
        observacoes: avaliacaoData.observacoes || '',
        dataChamado: new Date(dataRef),
        numeroTicket: numTicket,
        pontuacaoTotal: 0,
        updatedAt: new Date()
      };
      docTicket.pontuacaoTotal = calcularPontuacaoTotalTicket(docTicket);

      const raw = await qualidadeTicketAvaliacoesAPI.update(id, docTicket);
      const updated = unwrapQualidadeAvaliacaoDoc(raw) || { ...docTicket, _id: id };
      const uid = updated?._id ?? updated?.id ?? id;
      console.log(`✅ Avaliação de ticket atualizada via API: ${uid}`);
      return {
        ...updated,
        tipoAvaliacao: 'ticket',
        dataLigacao: updated.dataChamado || updated.dataLigacao
      };
    }
    
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
      registroAtendimento: Boolean(avaliacaoData.registroAtendimento), // Boolean
      empatiaCordialidade: Boolean(avaliacaoData.empatiaCordialidade), // Boolean
      direcionouPesquisa: Boolean(avaliacaoData.direcionouPesquisa), // Boolean
      naoConsultouBot: Boolean(avaliacaoData.naoConsultouBot), // Boolean
      conformidadeTicket: Boolean(avaliacaoData.conformidadeTicket), // Boolean
      procedimentoIncorreto: Boolean(avaliacaoData.procedimentoIncorreto), // Boolean
      encerramentoBrusco: Boolean(avaliacaoData.encerramentoBrusco), // Boolean
      pontuacaoTotal: 0, // Será calculado
      observacoes: avaliacaoData.observacoes || '', // String
      dataLigacao: normalizeDataLigacaoInput(avaliacaoData.dataLigacao), // String YYYY-MM-DD absoluta
      horaLigacao: normalizeHoraLigacaoInput(avaliacaoData.horaLigacao), // String HH:mm absoluta
      somenteAnaliseAudioIA: avaliacaoData.somenteAnaliseAudioIA === true,
      // Campos obrigatórios para atualização
      _id: id,
      updatedAt: new Date()
    };
    
    
    // Calcular pontuação total
    avaliacaoAtualizada.pontuacaoTotal = calcularPontuacaoTotal(avaliacaoAtualizada);
    
    
    const raw = await qualidadeAvaliacoesAPI.update(id, avaliacaoAtualizada);
    const updated = unwrapQualidadeAvaliacaoDoc(raw) || raw;
    const uid = updated?._id ?? updated?.id ?? id;
    console.log(`✅ Avaliação atualizada via API: ${uid}`);
    return normalizarAvaliacaoDataLigacaoLegado(updated);
  } catch (error) {
    console.error('❌ Erro ao atualizar avaliação via API:', error);
    // Não fazer fallback - apenas propagar erro da API
    throw error;
  }
};

// Deletar avaliação (segundo argumento: { isTicket: true } para documentos em qualidade_ticket_avaliacoes)
export const deleteAvaliacao = async (id, options = {}) => {
  const isTicket = options?.isTicket === true;
  try {
    // #region agent log
    fetch('http://127.0.0.1:7621/ingest/8e27b4c3-0140-42a6-b4bc-2e9c16a86c7a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'17a57b'},body:JSON.stringify({sessionId:'17a57b',location:'qualidadeAPI.js:664',message:'deleteAvaliacao entry',data:{id,idType:typeof id,isTicket},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const response = isTicket
      ? await qualidadeTicketAvaliacoesAPI.delete(id)
      : await qualidadeAvaliacoesAPI.delete(id);
    // #region agent log
    fetch('http://127.0.0.1:7621/ingest/8e27b4c3-0140-42a6-b4bc-2e9c16a86c7a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'17a57b'},body:JSON.stringify({sessionId:'17a57b',location:'qualidadeAPI.js:665',message:'deleteAvaliacao success',data:{id,responseSuccess:response?.success},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log(`✅ Avaliação deletada via API: ${id}`);
    return response;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7621/ingest/8e27b4c3-0140-42a6-b4bc-2e9c16a86c7a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'17a57b'},body:JSON.stringify({sessionId:'17a57b',location:'qualidadeAPI.js:668',message:'deleteAvaliacao error',data:{id,errorMessage:error?.message,errorStatus:error?.response?.status},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    console.error('❌ Erro ao deletar avaliação via API:', error);
    // Não fazer fallback - apenas propagar erro da API
    throw error;
  }
};

// ===== RELATÓRIOS =====

// Gerar relatório do agente
export const gerarRelatorioAgente = async (colaboradorNome, dataInicio = null, dataFim = null) => {
  try {
    // Buscar liga + ticket, filtrar no frontend
    const todasAvaliacoes = await fetchAvaliacoesAgrupado();
    console.log('📊 Dados recebidos da API (relatório agente, liga+ticket):', todasAvaliacoes.length);
    console.log(`📊 Total de avaliações encontradas: ${todasAvaliacoes.length}`);
    
    // Filtrar por colaborador
    let avaliacoes = (todasAvaliacoes || [])
      .filter((a) => {
          const nomeAvaliacao = (a.colaboradorNome || '').trim().toLowerCase();
          const nomeColaborador = (colaboradorNome || '').trim().toLowerCase();
          return nomeAvaliacao === nomeColaborador;
        });
    
    console.log(`📊 Avaliações filtradas para ${colaboradorNome}: ${avaliacoes.length}`);
    
    // Log de debug com nomes únicos encontrados
    if (todasAvaliacoes.length > 0 && avaliacoes.length === 0) {
      const nomesUnicos = [...new Set(todasAvaliacoes.map((a) => a.colaboradorNome).filter(Boolean))];
      console.log('🔍 DEBUG - Nomes únicos encontrados nas avaliações:', nomesUnicos.slice(0, 10));
      console.log('🔍 DEBUG - Nome buscado:', colaboradorNome);
    }
    
    if (avaliacoes.length === 0) {
      console.log('⚠️ Nenhuma avaliação encontrada para o colaborador:', colaboradorNome);
      return null;
    }

    // Filtrar por período (createdAt) se filtro estiver ativo
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

    // Gráfico (média mensal / notaReal no histórico): mesma base que os cards quando há filtro; sem filtro, histórico completo do colaborador
    const avaliacoesParaGrafico =
      dataInicio || dataFim ? avaliacoesFiltradas : avaliacoes;

    const avaliacoesFiltradasComGPT = avaliacoesFiltradas;
    const avaliacoesParaGraficoComGPT = avaliacoesParaGrafico;

    console.log(`📊 DEBUG - Relatório agente (nota IA em avaliacao.avaliacaoIA): filtradas ${avaliacoesFiltradasComGPT.length}, gráfico ${avaliacoesParaGraficoComGPT.length}`);

    // Buscar média IA do backend
    let mediaIA = null;
    try {
      // Normalizar URL base removendo /api se existir no final
      const baseUrl = getResolvedApiOrigin();
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
    const todasAvaliacoes = await fetchAvaliacoesAgrupado();
    console.log('📊 Dados recebidos da API (relatório gestão, liga+ticket):', todasAvaliacoes.length);
    console.log(`📊 Total de avaliações encontradas: ${todasAvaliacoes.length}`);
    
    const avaliacoes = (todasAvaliacoes || []).filter(
      (a) => a.mes === mes && a.ano === ano
    );
    
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
    const todasAvaliacoes = await fetchAvaliacoesAgrupado();
    console.log('📊 Dados recebidos da API (avaliações por colaborador, liga+ticket):', todasAvaliacoes.length);
    const avaliacoes = (todasAvaliacoes || []).filter(
      (a) => a.colaboradorNome === colaboradorNome
    );
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
  baseURL: `${getResolvedApiOrigin()}/api/qualidade`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

gptAPI.interceptors.request.use((config) => {
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = { ...config.params, _nc: Date.now() };
  }
  return config;
});

/** Catálogo valores_campos (qa_destaques, qa_apontamentos). Resposta: { success, opcoes, key }. */
export const getValoresCampoQa = async (key) => {
  const k = String(key || '').trim();
  const response = await gptAPI.get(`/valores-campos/${encodeURIComponent(k)}`);
  return response.data;
};

/** Lista docs de configuração em valores_campos. includeAll=true retorna toda a coleção. */
export const listValoresCampos = async (includeAll = false) => {
  const response = await gptAPI.get('/valores-campos', {
    params: includeAll ? { includeAll: true } : undefined
  });
  return response.data;
};

/** Upsert por id fixo em valores_campos. */
export const upsertValoresCampos = async (id, payload) => {
  const docId = String(id || '').trim();
  if (!docId) {
    throw new Error('id é obrigatório para upsertValoresCampos');
  }
  const response = await gptAPI.put(`/valores-campos/${encodeURIComponent(docId)}`, payload || {});
  return response.data;
};

export const getCadastroCamposConfig = async () => {
  const response = await listValoresCampos(false);
  const docs = Array.isArray(response?.data) ? response.data : [];
  return docs.find((doc) => doc?.id === 'cadastro_campos') || { id: 'cadastro_campos', escalas: [], empresas: [] };
};

export const upsertCadastroCamposConfig = async ({ escalas = [], empresas = [] } = {}) =>
  upsertValoresCampos('cadastro_campos', { escalas, empresas });

export const upsertFeedbackCatalogConfig = async (catalogId, values = []) => {
  if (catalogId === 'destaques_itens') {
    return upsertValoresCampos(catalogId, { destaques: values });
  }
  if (catalogId === 'oportunidades_itens') {
    return upsertValoresCampos(catalogId, { oportunidades: values });
  }
  if (catalogId === 'apontamentos_itens') {
    return upsertValoresCampos(catalogId, { apontamentos: values });
  }
  throw new Error('catalogId inválido para upsertFeedbackCatalogConfig');
};

export const upsertQaTrophyConfig = async (payload = {}) =>
  upsertValoresCampos('qa_trophy_config', payload);

/** Catálogo de troféus QA (array `trophies` em valores_campos id qa_trophies_catalog). */
export const upsertQaTrophiesCatalog = async (trophies = []) =>
  upsertValoresCampos('qa_trophies_catalog', { trophies });

/** Gera corpo do e-mail via Gemini (Skynet). Body: feedbackType, colaboradorNome, avaliador, campos por tipo, recomendacoesTexto. */
export const gerarQaFeedback = async (payload) => {
  const response = await gptAPI.post('/qa-feedback/gerar', payload, { timeout: 120000 });
  return response.data;
};

/** Persiste em console_analises.qa_feedback. */
export const salvarQaFeedback = async (doc) => {
  const response = await gptAPI.post('/qa-feedback', doc);
  return response.data;
};

/** Grava em academy_registros.atendimento_trophies (quadro Excelência do Atendimento na Academy). */
export const salvarAtendimentoTrophy = async (payload) => {
  const response = await gptAPI.post('/atendimento-trophy', payload);
  return response.data;
};

/** XP total concedido (matriz classe → pontos); query por e-mail ou nome do colaborador. */
export const getAtendimentoTrophyXpTotal = async ({ email, colaboradorNome } = {}) => {
  const response = await gptAPI.get('/atendimento-trophy/xp-total', {
    params: {
      ...(email ? { email: String(email).trim() } : {}),
      ...(colaboradorNome != null && String(colaboradorNome).trim()
        ? { colaboradorNome: String(colaboradorNome).trim() }
        : {})
    }
  });
  return response.data;
};

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

function listaIaValorFromGptRow(g) {
  if (!g) return false;
  if (!hasConteudoIa(g)) return false;
  const temNota = g.pontuacaoCalculada != null && !Number.isNaN(Number(g.pontuacaoCalculada));
  const temTexto = (g.observacaoGPT && String(g.observacaoGPT).trim().length > 0)
    || (g.analiseGPT && String(g.analiseGPT).trim().length > 0);
  const temDialogo = g.analiseDialogo != null;
  const temCriterios = g.criteriosDetalhados && Object.keys(g.criteriosDetalhados).length > 0;
  const temParcial = typeof g._iaParcial === 'string' && g._iaParcial.length > 0;
  return temNota || temTexto || temDialogo || temCriterios || temParcial ? g : false;
}

/** Mapeia documento de audio_analise (GET /result ou item do lote) para o formato usado na UI. */
function mapAudioAnaliseResultDocToGptRow(d) {
  if (!d) return null;
  const norm = normalizeAudioAnaliseResult(d);
  if (!norm) return null;

  const g = d.gptAnalysis;
  const q = d.qualityAnalysis;
  const hasCriteriosBlock =
    norm.criteriosDetalhados && Object.keys(norm.criteriosDetalhados).length > 0;
  const hasTranscription = Array.isArray(norm.transcricao) && norm.transcricao.length > 0;
  const hasCalculo = Array.isArray(q?.calculoDetalhado) && q.calculoDetalhado.length > 0;
  const hasPalavras = Array.isArray(norm.palavrasCriticas) && norm.palavrasCriticas.length > 0;

  let _iaParcial = null;
  if (norm.pontuacaoCalculada == null && !norm.observacaoGPT) {
    if (hasCriteriosBlock) _iaParcial = 'criterios';
    else if (hasTranscription) _iaParcial = 'transcricao';
    else if (hasCalculo || hasPalavras) _iaParcial = 'metadados';
    else if (norm.analiseDialogo) _iaParcial = 'dialogo';
    else if (g || q) _iaParcial = 'estrutura';
    else _iaParcial = 'resultado';
  }

  const out = {
    ...norm,
    avaliacao_id: norm.avaliacaoId,
    calculoDetalhado: (q && q.calculoDetalhado) || [],
    confianca: (g && g.confianca) ?? (q && q.confianca) ?? null,
    recomendacoes: (g && g.recomendacoes) || [],
    validacaoGemini: g && g.validacaoGemini != null ? g.validacaoGemini : null
  };
  if (_iaParcial) out._iaParcial = _iaParcial;
  return out;
}

const LISTA_IA_BATCH_MAX_IDS = 60;

async function fetchAudioAnaliseResultsPorAvaliacoesChunk(chunkIds, baseUrl) {
  const maxAttempts = 4;
  const url = `${baseUrl}/api/audio-analise/results-por-avaliacoes?ids=${encodeURIComponent(chunkIds.join(','))}`;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      if (attempt < maxAttempts - 1) {
        await _sleepQualidadeApi(350 * (attempt + 1));
        continue;
      }
      throw error;
    }

    if (response.status === 429) {
      let waitMs = 500 * 2 ** attempt + Math.floor(Math.random() * 200);
      const ra = response.headers.get('Retry-After');
      if (ra) {
        const sec = parseInt(ra, 10);
        if (!Number.isNaN(sec) && sec > 0) waitMs = Math.max(waitMs, sec * 1000);
      }
      try {
        await response.text();
      } catch {
        /* ignore */
      }
      if (attempt < maxAttempts - 1) {
        await _sleepQualidadeApi(waitMs);
        continue;
      }
      throw new Error('batch 429');
    }

    if (!response.ok) {
      try {
        await response.text();
      } catch {
        /* ignore */
      }
      if (attempt < maxAttempts - 1 && response.status >= 500) {
        await _sleepQualidadeApi(400 * (attempt + 1));
        continue;
      }
      throw new Error(`batch ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('batch json');
    }

    if (!result.success || !result.data || typeof result.data !== 'object') {
      throw new Error('batch payload');
    }

    const out = {};
    for (const id of chunkIds) {
      const raw = result.data[id];
      out[id] = listaIaValorFromGptRow(mapAudioAnaliseResultDocToGptRow(raw));
    }
    return out;
  }

  throw new Error('batch exhausted');
}

/**
 * Uma requisição (ou poucas, se >60 ids) para preencher Status IA na lista.
 * Retorna objeto { [avaliacaoId]: row|false }.
 */
export const getAvaliacaoGPTByAvaliacaoIdsBatch = async (avaliacaoIds) => {
  const ids = [...new Set((avaliacaoIds || []).map((x) => String(x).trim()).filter(Boolean))];
  if (ids.length === 0) return {};

  const batchKey = [...ids].sort().join('\u0001');
  const pending = _gptBatchFetchByKey.get(batchKey);
  if (pending) return pending;

  const task = (async () => {
    const baseUrl = getResolvedApiOrigin();
    const merged = {};
    for (let i = 0; i < ids.length; i += LISTA_IA_BATCH_MAX_IDS) {
      const chunk = ids.slice(i, i + LISTA_IA_BATCH_MAX_IDS);
      const part = await fetchAudioAnaliseResultsPorAvaliacoesChunk(chunk, baseUrl);
      Object.assign(merged, part);
    }
    return merged;
  })();

  _gptBatchFetchByKey.set(batchKey, task);
  try {
    return await task;
  } finally {
    _gptBatchFetchByKey.delete(batchKey);
  }
};

// 3. Obter avaliação GPT por ID da avaliação original
// DEPRECATED: Agora busca de audio_analise_results ao invés de qualidade_avaliacoes_gpt
export const getAvaliacaoGPTByAvaliacaoId = async (avaliacaoId) => {
  if (!avaliacaoId) return null;
  const key = String(avaliacaoId);
  const pending = _gptResultFetchByAvaliacaoId.get(key);
  if (pending) return pending;

  const task = (async () => {
    const baseUrl = getResolvedApiOrigin();
    const url = `${baseUrl}/api/audio-analise/result/${avaliacaoId}`;
    const maxAttempts = 6;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let response;
      try {
        response = await fetch(url);
      } catch (error) {
        if (attempt < maxAttempts - 1) {
          await _sleepQualidadeApi(350 * (attempt + 1));
          continue;
        }
        console.error('❌ Erro ao carregar análise GPT de audio_analise_results:', error);
        return null;
      }

      if (response.status === 429) {
        let waitMs = 500 * 2 ** attempt + Math.floor(Math.random() * 200);
        const ra = response.headers.get('Retry-After');
        if (ra) {
          const sec = parseInt(ra, 10);
          if (!Number.isNaN(sec) && sec > 0) waitMs = Math.max(waitMs, sec * 1000);
        }
        try {
          await response.text();
        } catch {
          /* ignore */
        }
        if (attempt < maxAttempts - 1) {
          await _sleepQualidadeApi(waitMs);
          continue;
        }
        return null;
      }

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        try {
          await response.text();
        } catch {
          /* ignore */
        }
        if (attempt < maxAttempts - 1 && response.status >= 500) {
          await _sleepQualidadeApi(400 * (attempt + 1));
          continue;
        }
        return null;
      }

      let result;
      try {
        result = await response.json();
      } catch {
        return null;
      }

      if (!result.success || !result.data) {
        return null;
      }

      return mapAudioAnaliseResultDocToGptRow(result.data);
    }

    return null;
  })();

  _gptResultFetchByAvaliacaoId.set(key, task);
  try {
    return await task;
  } finally {
    _gptResultFetchByAvaliacaoId.delete(key);
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

// ========================================
// QA RESGATE ITEMS — qa_resgate_items
// ========================================

export const getQaResgateItems = async () => {
  try {
    const response = await qualidadeQaResgateItemsAPI.getAll();
    return response;
  } catch (error) {
    console.error('❌ Erro ao listar resgates QA:', error);
    throw error;
  }
};

export const createQaResgateItem = async (payload) => {
  try {
    const response = await qualidadeQaResgateItemsAPI.create(payload);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar item de resgate:', error);
    throw error;
  }
};

export const updateQaResgateItem = async (id, payload) => {
  try {
    const response = await qualidadeQaResgateItemsAPI.update(id, payload);
    return response;
  } catch (error) {
    console.error('❌ Erro ao atualizar item de resgate:', error);
    throw error;
  }
};

export const deleteQaResgateItem = async (id) => {
  try {
    const response = await qualidadeQaResgateItemsAPI.delete(id);
    return response;
  } catch (error) {
    console.error('❌ Erro ao remover item de resgate:', error);
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
