// VERSION: v3.3.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.3.0 - Velonews: filtro de funcionários elegíveis compatível com atuacao [{ funcao }] (schema atual)
// CHANGELOG: v3.2.9 - Cabeçalho Voltar/abas: VoltarHeaderRow (alinhamento global)
// CHANGELOG: v3.2.7 - Hub: removido rótulo “Sessões Abertas” do primeiro card
// CHANGELOG: v3.2.6 - Velonews declarações: data na mesma linha do título (accordion summary)
// CHANGELOG: v3.2.5 - Sessões Abertas: excluir agentes desligado/afastado; totais no cabeçalho conforme lista filtrada
// CHANGELOG: v3.2.4 - Sessões Abertas: Online/Offline em blocos separados; grid 4 cols; células reservadas vazias na última linha de cada bloco
// CHANGELOG: v3.2.3 - Sessões Abertas: seções Online e Offline separadas (cada uma em até 4 colunas; sem misturar na mesma linha)
// CHANGELOG: v3.2.2 - Sessões Abertas: grid em 4 colunas (md+)
// CHANGELOG: v3.2.1 - Cards painel Hub/Velonews — sem hover/elevação do tema Card (CARD_PRINCIPAL_SX).
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Grid,
  Button,
  Snackbar,
  TextField,
  IconButton,
  Pagination
} from '@mui/material';
import { ExpandMore, Refresh, Download, ChevronLeft, ChevronRight } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import { hubAnalisesAPI, qualidadeFuncionariosAPI, qualidadeFuncoesAPI } from '../services/api';

const CARD_PRINCIPAL_SX = {
  boxShadow: 'none',
  transition: 'none',
  '&:hover': {
    boxShadow: 'none',
    transform: 'none',
  },
};

/** Sessões Abertas: última linha incompleta — células vazias até 4 posições (sem misturar online/offline). */
const SESSOES_ABERTAS_COLunas = 4;

/** Agentes com desligado ou afastado verdadeiros não entram na lista (sem card). */
const manterAgenteSessoesHub = (usuario) => {
  if (!usuario || typeof usuario !== 'object') return false;
  return usuario.desligado !== true && usuario.afastado !== true;
};

const celulasVaziasParaLinhaCompleta = (itemCount) => {
  if (itemCount <= 0) return 0;
  const r = itemCount % SESSOES_ABERTAS_COLunas;
  return r === 0 ? 0 : SESSOES_ABERTAS_COLunas - r;
};

/** Nome de atuação elegível para painel Velonews (ciência por notícia). */
const nomeAtuacaoElegivelVelonews = (nomeRaw) => {
  if (nomeRaw == null || nomeRaw === '') return false;
  const funcaoLower = String(nomeRaw).toLowerCase().trim();
  return (
    funcaoLower.includes('atendimento') ||
    funcaoLower.includes('redes sociais') ||
    funcaoLower.includes('reclame aqui') ||
    funcaoLower === 'n2' ||
    funcaoLower === 'n 2' ||
    /\bn2\b/.test(funcaoLower)
  );
};

const HubAnalisesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para aba Hub
  const [usuariosOnlineOffline, setUsuariosOnlineOffline] = useState({ online: [], offline: [], totalOnline: 0, totalOffline: 0, totalFuncionarios: 0 });
  const [allSessions, setAllSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedColaborador, setSelectedColaborador] = useState('');
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [colaboradoresList, setColaboradoresList] = useState([]);
  
  // Estados para filtro de data e paginação (aba Hub)
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Estados para paginação (aba Velonews)
  const [currentPageVelonews, setCurrentPageVelonews] = useState(1);
  const itemsPerPageVelonews = 20;
  
  // Estados para aba Velonews
  const [cienciaPorNoticia, setCienciaPorNoticia] = useState([]);
  const [loadingAcknowledgment, setLoadingAcknowledgment] = useState(false);
  const [expandedNews, setExpandedNews] = useState(null);
  const [funcionariosVelonews, setFuncionariosVelonews] = useState([]);
  const [funcoesVelonews, setFuncoesVelonews] = useState([]);
  const [loadingFuncionariosVelonews, setLoadingFuncionariosVelonews] = useState(false);
  
  // Estado para feedback ao usuário
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // ========================================
  // FUNÇÕES DE VALIDAÇÃO
  // ========================================

  // Normalizar resposta da API
  const normalizeAPIResponse = useCallback((response) => {
    if (Array.isArray(response)) return response;
    if (response?.success && response?.data) return response.data;
    if (response?.data) return response.data;
    return null;
  }, []);

  // Validar se data é válida
  const isValidDate = useCallback((date) => {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime()) && d instanceof Date;
  }, []);

  // Validar estrutura de usuários online/offline
  const validateUsuariosOnlineOffline = useCallback((data) => {
    if (!data || typeof data !== 'object') return false;
    return Array.isArray(data.online) && Array.isArray(data.offline) &&
           typeof data.totalOnline === 'number' && typeof data.totalOffline === 'number';
  }, []);

  // Validar sessão - mais flexível para aceitar diferentes estruturas
  const validateSession = useCallback((session) => {
    if (!session || typeof session !== 'object') return false;
    // Aceitar sessão se tiver pelo menos um identificador ou dados básicos
    if (session.sessionId || session._id || session.userEmail || session.colaboradorNome) {
      return true;
    }
    return false;
  }, []);

  // Validar notícia
  const validateNoticia = useCallback((noticia) => {
    if (!noticia || typeof noticia !== 'object') return false;
    if (!noticia.newsId) return false;
    return Array.isArray(noticia.agentes);
  }, []);

  // Carregar usuários online/offline
  const loadUsuariosOnlineOffline = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      const response = await hubAnalisesAPI.getUsuariosOnlineOffline();
      
      const normalizedData = normalizeAPIResponse(response);
      
      // Validação mais flexível - aceitar diferentes estruturas
      let dataToProcess = null;
      
      if (normalizedData && validateUsuariosOnlineOffline(normalizedData)) {
        dataToProcess = normalizedData;
      } else if (normalizedData && typeof normalizedData === 'object') {
        // Tentar estruturas alternativas
        if (Array.isArray(normalizedData.online) || Array.isArray(normalizedData.offline)) {
          dataToProcess = {
            online: normalizedData.online || [],
            offline: normalizedData.offline || [],
            totalOnline: normalizedData.totalOnline ?? (normalizedData.online?.length || 0),
            totalOffline: normalizedData.totalOffline ?? (normalizedData.offline?.length || 0),
            totalFuncionarios: normalizedData.totalFuncionarios ?? ((normalizedData.online?.length || 0) + (normalizedData.offline?.length || 0))
          };
        } else if (response && typeof response === 'object') {
          // Tentar acessar diretamente a resposta
          if (Array.isArray(response.online) || Array.isArray(response.offline)) {
            dataToProcess = {
              online: response.online || [],
              offline: response.offline || [],
              totalOnline: response.totalOnline ?? (response.online?.length || 0),
              totalOffline: response.totalOffline ?? (response.offline?.length || 0),
              totalFuncionarios: response.totalFuncionarios ?? ((response.online?.length || 0) + (response.offline?.length || 0))
            };
          }
        }
      }
      
      if (dataToProcess && (Array.isArray(dataToProcess.online) || Array.isArray(dataToProcess.offline))) {
        // Validar e processar cada usuário
        const processedData = {
          online: (dataToProcess.online || []).map(user => ({
            ...user,
            colaboradorNome: user.colaboradorNome || user.nome || user.userEmail || 'N/A',
            loginTimestamp: user.loginTimestamp || user.createdAt || null,
            lastActivity: user.lastActivity || user.updatedAt || null
          })),
          offline: (dataToProcess.offline || []).map(user => ({
            ...user,
            colaboradorNome: user.colaboradorNome || user.nome || user.userEmail || 'N/A',
            logoutTimestamp: user.logoutTimestamp || user.updatedAt || null
          })),
          totalOnline: dataToProcess.totalOnline || 0,
          totalOffline: dataToProcess.totalOffline || 0,
          totalFuncionarios: dataToProcess.totalFuncionarios || (dataToProcess.totalOnline || 0) + (dataToProcess.totalOffline || 0)
        };
        
        setUsuariosOnlineOffline(processedData);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Estrutura de dados inválida. Resposta:', response, 'Normalizada:', normalizedData);
        }
        throw new Error('Estrutura de dados inválida recebida do servidor');
      }
    } catch (error) {
      // Log apenas se não for erro de conexão (erro esperado quando servidor está offline)
      if (!error.message?.includes('Erro de conexão')) {
        console.error('Erro ao carregar usuários online/offline:', error);
      }
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao carregar usuários online/offline. Tente novamente.',
        severity: 'error'
      });
      setUsuariosOnlineOffline({ online: [], offline: [], totalOnline: 0, totalOffline: 0, totalFuncionarios: 0 });
    } finally {
      setLoadingUsuarios(false);
    }
  }, [normalizeAPIResponse, validateUsuariosOnlineOffline]);

  // Carregar todas as sessões (histórico)
  const loadAllSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await hubAnalisesAPI.getHubSessions();
      
      const rawSessions = normalizeAPIResponse(response);
      
      // Validação mais flexível
      let sessionsArray = null;
      
      if (Array.isArray(rawSessions)) {
        sessionsArray = rawSessions;
      } else if (rawSessions && Array.isArray(rawSessions.data)) {
        sessionsArray = rawSessions.data;
      } else if (Array.isArray(response)) {
        sessionsArray = response;
      } else if (response && Array.isArray(response.data)) {
        sessionsArray = response.data;
      }
      
      if (!sessionsArray || !Array.isArray(sessionsArray)) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Resposta inválida. Esperado array de sessões. Resposta:', response, 'Normalizada:', rawSessions);
        }
        throw new Error('Resposta inválida: esperado array de sessões');
      }
      
      // Validar e processar cada sessão
      const validSessions = sessionsArray
        .filter(session => validateSession(session))
        .map(session => {
          // Garantir campos obrigatórios e validar datas
          const processedSession = {
            ...session,
            sessionId: session.sessionId || session._id || `session-${Date.now()}-${Math.random()}`,
            colaboradorNome: session.colaboradorNome || session.nome || session.userEmail || 'N/A',
            loginTimestamp: session.loginTimestamp || session.createdAt || null,
            logoutTimestamp: session.logoutTimestamp || null,
            ipAddress: session.ipAddress || session.ip || 'N/A',
            createdAt: session.createdAt || session.loginTimestamp || new Date().toISOString()
          };
          
          // Validar datas
          if (processedSession.loginTimestamp && !isValidDate(processedSession.loginTimestamp)) {
            console.warn('Data de login inválida:', processedSession.loginTimestamp);
            processedSession.loginTimestamp = null;
          }
          if (processedSession.logoutTimestamp && !isValidDate(processedSession.logoutTimestamp)) {
            console.warn('Data de logout inválida:', processedSession.logoutTimestamp);
            processedSession.logoutTimestamp = null;
          }
          if (processedSession.createdAt && !isValidDate(processedSession.createdAt)) {
            processedSession.createdAt = processedSession.loginTimestamp || new Date().toISOString();
          }
          
          return processedSession;
        });
      
      // Agrupar por sessionId único (evitar duplicatas) - melhorado
      const uniqueSessions = new Map();
      let sessionsWithoutId = 0;
      validSessions.forEach(session => {
        const sessionId = session.sessionId;
        if (!sessionId) {
          sessionsWithoutId++;
          // Em vez de ignorar, usar um ID temporário baseado em dados únicos
          const tempId = `${session.colaboradorNome || 'unknown'}-${session.loginTimestamp || Date.now()}-${Math.random()}`;
          session.sessionId = tempId;
          uniqueSessions.set(tempId, session);
          return;
        }
        
        const existingSession = uniqueSessions.get(sessionId);
        if (!existingSession) {
          uniqueSessions.set(sessionId, session);
        } else {
          // Manter a sessão com data mais recente
          const existingDate = existingSession.createdAt ? new Date(existingSession.createdAt) : new Date(0);
          const newDate = session.createdAt ? new Date(session.createdAt) : new Date(0);
          
          if (isValidDate(existingDate) && isValidDate(newDate) && newDate > existingDate) {
            uniqueSessions.set(sessionId, session);
          } else if (!isValidDate(existingDate) && isValidDate(newDate)) {
            uniqueSessions.set(sessionId, session);
          }
        }
      });
      
      const uniqueSessionsArray = Array.from(uniqueSessions.values());
      
      // Debug: verificar processamento
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [loadAllSessions] Processamento:', {
          totalRecebidas: sessionsArray.length,
          validas: validSessions.length,
          semSessionIdOriginal: sessionsWithoutId,
          unicas: uniqueSessionsArray.length,
          amostra: uniqueSessionsArray.slice(0, 3)
        });
      }
      
      setAllSessions(uniqueSessionsArray);
      setFilteredSessions(uniqueSessionsArray);
      
      // Extrair lista de colaboradores únicos
      const colaboradores = [...new Set(
        uniqueSessionsArray
          .map(s => s.colaboradorNome)
          .filter(name => name && name !== 'N/A')
      )];
      setColaboradoresList(colaboradores.sort());
    } catch (error) {
      // Log apenas se não for erro de conexão (erro esperado quando servidor está offline)
      if (!error.message?.includes('Erro de conexão')) {
        console.error('Erro ao carregar histórico de sessões:', error);
      }
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao carregar histórico de sessões. Tente novamente.',
        severity: 'error'
      });
      setAllSessions([]);
      setFilteredSessions([]);
      setColaboradoresList([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [normalizeAPIResponse, validateSession, isValidDate]);

  // Filtrar e ordenar sessões por colaborador e data
  useEffect(() => {
    let filtered = [...allSessions];
    
    // Filtrar por colaborador
    if (selectedColaborador) {
      filtered = filtered.filter(s => s.colaboradorNome === selectedColaborador);
    }
    
    // Filtrar por data
    if (filtroDataInicio) {
      const dataInicio = new Date(filtroDataInicio);
      dataInicio.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => {
        const sessionDate = s.loginTimestamp ? new Date(s.loginTimestamp) : (s.createdAt ? new Date(s.createdAt) : null);
        if (!sessionDate) return false;
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= dataInicio;
      });
    }
    
    if (filtroDataFim) {
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => {
        const sessionDate = s.loginTimestamp ? new Date(s.loginTimestamp) : (s.createdAt ? new Date(s.createdAt) : null);
        if (!sessionDate) return false;
        return sessionDate <= dataFim;
      });
    }
    
    // Ordenar da mais recente para a mais antiga
    filtered.sort((a, b) => {
      const dateA = a.loginTimestamp ? new Date(a.loginTimestamp) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
      const dateB = b.loginTimestamp ? new Date(b.loginTimestamp) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
      return dateB - dateA; // Mais recente primeiro
    });
    
    // Resetar página quando filtros mudarem
    setCurrentPage(1);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Filtro] Aplicando filtros:', {
        selectedColaborador,
        filtroDataInicio,
        filtroDataFim,
        totalSessions: allSessions.length,
        filteredCount: filtered.length
      });
    }
    
    setFilteredSessions(filtered);
  }, [selectedColaborador, filtroDataInicio, filtroDataFim, allSessions]);
  
  // Calcular dados de paginação
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);
  
  // Resetar página quando mudar de aba
  useEffect(() => {
    setCurrentPage(1);
    setCurrentPageVelonews(1);
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setSelectedColaborador('');
  }, [activeTab]);
  
  // Calcular dados de paginação para Velonews
  const totalPagesVelonews = Math.ceil(cienciaPorNoticia.length / itemsPerPageVelonews);
  const startIndexVelonews = (currentPageVelonews - 1) * itemsPerPageVelonews;
  const endIndexVelonews = startIndexVelonews + itemsPerPageVelonews;
  const paginatedCienciaPorNoticia = cienciaPorNoticia.slice(startIndexVelonews, endIndexVelonews);

  // Carregar funcionários para Velonews (atuacao: atendimento, redes sociais, reclame aqui, N2 e desligado = false)
  const carregarFuncionariosVelonews = useCallback(async () => {
    try {
      setLoadingFuncionariosVelonews(true);
      
      // Buscar funções
      const funcoesResponse = await qualidadeFuncoesAPI.getAll();
      const funcoesData = funcoesResponse?.data || funcoesResponse || [];
      setFuncoesVelonews(funcoesData);
      
      // Encontrar funções relevantes (case-insensitive)
      const funcoesRelevantes = funcoesData.filter(f => {
        if (!f.funcao) return false;
        const funcaoLower = f.funcao.toLowerCase().trim();
        return funcaoLower.includes('atendimento') ||
               funcaoLower.includes('redes sociais') ||
               funcaoLower.includes('reclame aqui') ||
               funcaoLower === 'n2' ||
               funcaoLower === 'n 2';
      });
      
      if (funcoesRelevantes.length === 0) {
        console.warn('⚠️ Nenhuma função em /qualidade/funcoes bateu o filtro Velonews; usando nomes em atuacao [{ funcao }]');
      }

      const idsFuncoesRelevantes = new Set(
        funcoesRelevantes.map((f) => String(f._id))
      );
      const nomesFuncoesRelevantes = new Set(
        funcoesRelevantes
          .map((f) => (f.funcao != null ? String(f.funcao).toLowerCase().trim() : ''))
          .filter(Boolean)
      );

      // Buscar todos os funcionários
      const funcionariosResponse = await qualidadeFuncionariosAPI.getAll();
      const funcionariosData = funcionariosResponse?.data || funcionariosResponse || [];
      
      // Filtrar funcionários: atuacao [{ funcao }], legado ObjectId ou string
      const funcionariosFiltrados = funcionariosData.filter((func) => {
        if (func.desligado === true || func.afastado === true) return false;

        const atuacao = func.atuacao;
        if (atuacao == null) return false;

        if (Array.isArray(atuacao)) {
          return atuacao.some((item) => {
            if (item == null) return false;
            if (typeof item === 'object' && item.funcao != null) {
              const nome = String(item.funcao).trim();
              if (nomeAtuacaoElegivelVelonews(nome)) return true;
              return nomesFuncoesRelevantes.has(nome.toLowerCase());
            }
            const idStr =
              typeof item === 'object' && item._id != null
                ? String(item._id)
                : String(item).trim();
            if (idsFuncoesRelevantes.has(idStr)) return true;
            if (typeof item === 'string') return nomeAtuacaoElegivelVelonews(item);
            return false;
          });
        }

        if (typeof atuacao === 'string') {
          return nomeAtuacaoElegivelVelonews(atuacao);
        }

        if (typeof atuacao === 'object' && atuacao.funcao != null) {
          const nome = String(atuacao.funcao).trim();
          return (
            nomeAtuacaoElegivelVelonews(nome) || nomesFuncoesRelevantes.has(nome.toLowerCase())
          );
        }

        return false;
      });
      
      setFuncionariosVelonews(funcionariosFiltrados);
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários para Velonews:', error);
      setFuncionariosVelonews([]);
    } finally {
      setLoadingFuncionariosVelonews(false);
    }
  }, []);

  // Carregar declarações de ciência
  const loadAcknowledgments = useCallback(async () => {
    try {
      setLoadingAcknowledgment(true);
      const response = await hubAnalisesAPI.getCienciaPorNoticia();
      const rawData = normalizeAPIResponse(response);
      
      if (!rawData || !Array.isArray(rawData)) {
        throw new Error('Resposta inválida: esperado array de notícias');
      }
      
      // Validar e processar cada notícia
      const validNoticias = rawData
        .filter(noticia => validateNoticia(noticia))
        .map(noticia => ({
          ...noticia,
          titulo: noticia.titulo || noticia.title || 'Sem título',
          newsId: noticia.newsId || noticia._id || `news-${Date.now()}`,
          totalAgentes: Array.isArray(noticia.agentes) ? noticia.agentes.length : 0,
          agentes: (noticia.agentes || []).map(agente => ({
            ...agente,
            colaboradorNome: agente.colaboradorNome || agente.nome || agente.userEmail || 'Usuário desconhecido',
            acknowledgedAt: agente.acknowledgedAt || agente.createdAt || null
          })),
          primeiraCiencia: noticia.primeiraCiencia || (noticia.agentes && noticia.agentes[0]?.acknowledgedAt) || null
        }));
      
      setCienciaPorNoticia(validNoticias);
    } catch (error) {
      // Log apenas se não for erro de conexão (erro esperado quando servidor está offline)
      if (!error.message?.includes('Erro de conexão')) {
        console.error('Erro ao carregar declarações de ciência:', error);
      }
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao carregar declarações de ciência. Tente novamente.',
        severity: 'error'
      });
      setCienciaPorNoticia([]);
    } finally {
      setLoadingAcknowledgment(false);
    }
  }, [normalizeAPIResponse, validateNoticia]);

  // Carregar dados quando mudar de aba
  useEffect(() => {
    if (activeTab === 0) {
      // Aba Hub
      loadUsuariosOnlineOffline();
      loadAllSessions();
    } else if (activeTab === 1) {
      // Aba Velonews
      loadAcknowledgments();
      carregarFuncionariosVelonews();
    }
  }, [activeTab, loadUsuariosOnlineOffline, loadAllSessions, loadAcknowledgments, carregarFuncionariosVelonews]);

  // Calcular duração da sessão - COM VALIDAÇÃO PRECISA
  const calculateSessionDuration = useCallback((loginTimestamp, logoutTimestamp) => {
    if (!loginTimestamp) return 'N/A';
    
    // Validar data de login
    if (!isValidDate(loginTimestamp)) {
      return 'Data inválida';
    }
    
    const login = new Date(loginTimestamp);
    
    // Se não há logout, calcular duração até agora
    if (!logoutTimestamp) {
      const now = new Date();
      const diffMs = now - login;
      
      if (diffMs < 0) return 'Data inválida';
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      if (diffHours > 0) {
        return `Em andamento: ${diffHours}h ${diffMinutes}min`;
      } else if (diffMinutes > 0) {
        return `Em andamento: ${diffMinutes}min ${diffSeconds}s`;
      } else {
        return `Em andamento: ${diffSeconds}s`;
      }
    }
    
    // Validar data de logout
    if (!isValidDate(logoutTimestamp)) {
      return 'Data de fechamento inválida';
    }
    
    const logout = new Date(logoutTimestamp);
    const diffMs = logout - login;
    
    if (diffMs < 0) {
      return 'Data inválida (fechamento antes do acesso)';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min ${diffSeconds}s`;
    } else {
      return `${diffSeconds}s`;
    }
  }, [isValidDate]);

  // Online e offline em listas separadas (ordenadas por nome) — grids distintos na UI
  const { usuariosOnlineLista, usuariosOfflineLista } = React.useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [sessões abertas] Estado atual:', {
        online: usuariosOnlineOffline.online?.length || 0,
        offline: usuariosOnlineOffline.offline?.length || 0,
        totalOnline: usuariosOnlineOffline.totalOnline,
        totalOffline: usuariosOnlineOffline.totalOffline
      });
    }

    if (!usuariosOnlineOffline || (!usuariosOnlineOffline.online && !usuariosOnlineOffline.offline)) {
      return { usuariosOnlineLista: [], usuariosOfflineLista: [] };
    }

    const usuariosOnlineLista = [...(usuariosOnlineOffline.online || [])]
      .filter(manterAgenteSessoesHub)
      .map((u) => ({
        ...u,
        isActive: true,
        loginTimestamp: u.loginTimestamp || u.createdAt || null,
        lastActivity: u.lastActivity || u.updatedAt || null,
        tempoOnline: u.loginTimestamp ? calculateSessionDuration(u.loginTimestamp, null) : 'N/A'
      }))
      .sort((a, b) => (a.colaboradorNome || '').localeCompare(b.colaboradorNome || ''));

    const usuariosOfflineLista = [...(usuariosOnlineOffline.offline || [])]
      .filter(manterAgenteSessoesHub)
      .map((u) => ({
        ...u,
        isActive: false,
        logoutTimestamp: u.logoutTimestamp || u.updatedAt || null
      }))
      .sort((a, b) => (a.colaboradorNome || '').localeCompare(b.colaboradorNome || ''));

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '✅ [sessões abertas] Online:',
        usuariosOnlineLista.length,
        'Offline:',
        usuariosOfflineLista.length
      );
    }

    return { usuariosOnlineLista, usuariosOfflineLista };
  }, [usuariosOnlineOffline, calculateSessionDuration]);

  const nenhumaSessaoAbertaLista =
    usuariosOnlineLista.length === 0 && usuariosOfflineLista.length === 0;

  /** Resumo contagens + botão atualizar (reutilizado na legenda Online e em loading/vazio). */
  const hubResumoTotRefreshLinha = React.useMemo(
    () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Typography variant="body2" sx={{ fontSize: '0.6rem', color: 'var(--gray)', fontFamily: 'Poppins', textAlign: 'right' }}>
          Online: {usuariosOnlineLista.length} | Offline: {usuariosOfflineLista.length} | Total:{' '}
          {usuariosOnlineLista.length + usuariosOfflineLista.length}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={loadUsuariosOnlineOffline}
          aria-label="Atualizar status online e offline"
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            color: 'var(--blue-medium)',
            '&:hover': { opacity: 0.7 }
          }}
        >
          <Refresh sx={{ fontSize: '0.7rem' }} />
        </Box>
      </Box>
    ),
    [usuariosOnlineLista.length, usuariosOfflineLista.length, loadUsuariosOnlineOffline]
  );

  // Formatar data - COM VALIDAÇÃO E PRECISÃO
  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    
    if (!isValidDate(date)) {
      console.warn('Tentativa de formatar data inválida:', date);
      return 'Data inválida';
    }
    
    try {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error, date);
      return 'Erro ao formatar';
    }
  }, [isValidDate]);
  
  // Formatar data com hora precisa (para exibição detalhada)
  const formatDatePrecise = useCallback((date) => {
    if (!date) return 'N/A';
    
    if (!isValidDate(date)) {
      return 'Data inválida';
    }
    
    try {
      const d = new Date(date);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Erro ao formatar data precisa:', error);
      return 'Erro ao formatar';
    }
  }, [isValidDate]);

  // Exportar histórico de sessões para XLSX
  const handleExportarXLSX = useCallback(() => {
    try {
      if (!filteredSessions || filteredSessions.length === 0) {
        alert('Não há sessões para exportar');
        return;
      }

      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // Preparar dados para exportação
      const headers = ['Nome', 'Início', 'Fim', 'Tempo de Sessão', 'IP'];
      
      const dados = [
        headers,
        ...filteredSessions
          .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // Mais recente primeiro
          })
          .map((session) => [
            session.colaboradorNome || 'N/A',
            session.loginTimestamp ? formatDatePrecise(session.loginTimestamp) : 'N/A',
            session.logoutTimestamp ? formatDatePrecise(session.logoutTimestamp) : 'Em andamento',
            calculateSessionDuration(session.loginTimestamp, session.logoutTimestamp),
            session.ipAddress || 'N/A'
          ])
      ];

      // Criar worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(dados);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 30 }, // Nome
        { wch: 20 }, // Início
        { wch: 20 }, // Fim
        { wch: 18 }, // Tempo de Sessão
        { wch: 15 }  // IP
      ];
      worksheet['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico de Sessões');

      // Gerar nome do arquivo com data atual
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `historico_sessoes_hub_${dataAtual}.xlsx`;

      // Salvar arquivo
      XLSX.writeFile(workbook, nomeArquivo);

      console.log('✅ Exportação para XLSX concluída:', filteredSessions.length, 'sessões');
    } catch (error) {
      console.error('❌ Erro ao exportar para XLSX:', error);
      alert('Erro ao exportar arquivo. Tente novamente.');
    }
  }, [filteredSessions]);

  return (
    <Container maxWidth="xl" sx={{ py: 3.2, mb: 6.4, pb: 3.2 }}>
      <VoltarHeaderRow
        left={<BackButton />}
        center={
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            aria-label="hub analises tabs"
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontFamily: 'Poppins',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'var(--blue-light)',
                },
                '&:not(.Mui-selected)': {
                  color: 'rgba(0, 0, 0, 0.35)',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--blue-light)',
                height: 2,
              }
            }}
          >
            <Tab label="Hub" />
            <Tab label="Velonews" />
          </Tabs>
        }
      />

      {/* Aba Hub */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Quadro 1: status online/offline (sem título de secção) */}
          <Card sx={{ backgroundColor: 'var(--cor-card)', ...CARD_PRINCIPAL_SX }}>
            <CardContent sx={{ backgroundColor: 'var(--cor-card)' }}>
              {loadingUsuarios ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>{hubResumoTotRefreshLinha}</Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: 'var(--blue-medium)', size: '1rem' }} />
                  </Box>
                </>
              ) : nenhumaSessaoAbertaLista ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.6 }}>{hubResumoTotRefreshLinha}</Box>
                  <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                    Nenhum funcionário encontrado.
                  </Alert>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1.2,
                        flexWrap: 'wrap',
                        mb: 1.2,
                        pb: 0.4,
                        borderBottom: '1px solid rgba(21, 162, 55, 0.35)'
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontSize: '0.68rem',
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          color: 'var(--blue-dark)',
                          flex: '1 1 auto',
                          minWidth: 0
                        }}
                      >
                        Online
                      </Typography>
                      <Box sx={{ flexShrink: 0, minWidth: 'min(100%, 320px)' }}>{hubResumoTotRefreshLinha}</Box>
                    </Box>
                    {usuariosOnlineLista.length === 0 ? (
                      <Typography sx={{ fontSize: '0.62rem', fontFamily: 'Poppins', color: 'rgba(0,0,0,0.5)' }}>
                        Nenhum usuário online no momento.
                      </Typography>
                    ) : (
                      <Grid container spacing={1.6}>
                        {usuariosOnlineLista.map((usuario, index) => (
                          <Grid item xs={12} sm={6} md={3} key={`sessao-online-${usuario.colaboradorNome || index}`}>
                            <Box
                              className="hub-analises-sessao-card"
                              sx={{
                                p: 1.2,
                                border: '1px solid rgba(22, 52, 255, 0.1)',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(21, 162, 55, 0.20)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.4
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#15A237',
                                    flexShrink: 0
                                  }}
                                />
                                <Typography sx={{ fontSize: '0.7rem', fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>
                                  {usuario.colaboradorNome || 'N/A'}
                                </Typography>
                              </Box>
                              {usuario.loginTimestamp && (
                                <Box sx={{ pl: 1.6, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                  <Typography sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'var(--gray)' }}>
                                    Acesso: {formatDatePrecise(usuario.loginTimestamp)}
                                  </Typography>
                                  {usuario.tempoOnline && usuario.tempoOnline !== 'N/A' && (
                                    <Typography sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'var(--blue-medium)', fontWeight: 500 }}>
                                      {usuario.tempoOnline}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                        {Array.from({ length: celulasVaziasParaLinhaCompleta(usuariosOnlineLista.length) }).map((__, idx) => (
                          <Grid item xs={12} sm={6} md={3} key={`sessao-online-vazio-${idx}`} aria-hidden>
                            <Box sx={{ minHeight: 1 }} />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: '0.68rem',
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        color: 'var(--blue-dark)',
                        mb: 1.2,
                        pb: 0.4,
                        borderBottom: '1px solid rgba(255, 0, 0, 0.35)'
                      }}
                    >
                      Offline
                    </Typography>
                    {usuariosOfflineLista.length === 0 ? (
                      <Typography sx={{ fontSize: '0.62rem', fontFamily: 'Poppins', color: 'rgba(0,0,0,0.5)' }}>
                        Nenhum usuário offline listado no momento.
                      </Typography>
                    ) : (
                      <Grid container spacing={1.6}>
                        {usuariosOfflineLista.map((usuario, index) => (
                          <Grid item xs={12} sm={6} md={3} key={`sessao-offline-${usuario.colaboradorNome || index}`}>
                            <Box
                              className="hub-analises-sessao-card-offline"
                              sx={{
                                p: 1.2,
                                border: '1px solid rgba(22, 52, 255, 0.1)',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255, 0, 0, 0.20)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.4
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#FF0000',
                                    flexShrink: 0
                                  }}
                                />
                                <Typography sx={{ fontSize: '0.7rem', fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>
                                  {usuario.colaboradorNome || 'N/A'}
                                </Typography>
                              </Box>
                              {usuario.logoutTimestamp && (
                                <Box sx={{ pl: 1.6 }}>
                                  <Typography sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'var(--gray)' }}>
                                    Fechamento: {formatDatePrecise(usuario.logoutTimestamp)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                        {Array.from({ length: celulasVaziasParaLinhaCompleta(usuariosOfflineLista.length) }).map((__, idx) => (
                          <Grid item xs={12} sm={6} md={3} key={`sessao-offline-vazio-${idx}`} aria-hidden>
                            <Box sx={{ minHeight: 1 }} />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quadro 2: Histórico de Sessões */}
          <Card sx={{ backgroundColor: 'var(--cor-card)', ...CARD_PRINCIPAL_SX }}>
            <CardContent sx={{ backgroundColor: 'var(--cor-card)' }}>
              <Box sx={{ mb: 1.6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
                  <Typography variant="h6" sx={{ fontSize: '0.7rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', fontWeight: 600 }}>
                    Histórico de Sessões
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    onClick={handleExportarXLSX}
                    disabled={filteredSessions.length === 0}
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.65rem',
                      textTransform: 'none',
                      borderColor: 'var(--blue-medium)',
                      color: 'var(--blue-dark)',
                      '&:hover': {
                        borderColor: 'var(--blue-light)',
                        backgroundColor: 'rgba(22, 148, 255, 0.1)'
                      },
                      '&.Mui-disabled': {
                        borderColor: '#e0e0e0',
                        color: '#bdbdbd'
                      }
                    }}
                  >
                    Exportar XLSX
                  </Button>
                </Box>
                
                {/* Filtros */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ 
                      fontFamily: 'Poppins', 
                      fontSize: '0.6rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: 'var(--blue-medium)',
                      },
                    }}>Filtrar por Colaborador</InputLabel>
                    <Select
                      value={selectedColaborador}
                      label="Filtrar por Colaborador"
                      onChange={(e) => setSelectedColaborador(e.target.value)}
                      sx={{ 
                        fontFamily: 'Poppins', 
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--cor-container)',
                        '& .MuiSelect-select': {
                          color: 'var(--gray)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.15)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--blue-medium)',
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', color: 'var(--gray)' }}>Todos</MenuItem>
                      {colaboradoresList.map((colab) => (
                        <MenuItem key={colab} value={colab} sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', color: 'var(--gray)' }}>
                          {colab}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* Filtro de Data Início */}
                  <TextField
                    type="date"
                    label="Data Início"
                    size="small"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 140,
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--cor-container)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.15)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.6rem',
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: 'var(--blue-medium)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.65rem',
                        color: 'var(--gray)',
                        padding: '8px 12px',
                      },
                    }}
                  />
                  
                  {/* Filtro de Data Fim */}
                  <TextField
                    type="date"
                    label="Data Fim"
                    size="small"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 140,
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--cor-container)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.15)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--blue-medium)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Poppins',
                        fontSize: '0.6rem',
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: 'var(--blue-medium)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.65rem',
                        color: 'var(--gray)',
                        padding: '8px 12px',
                      },
                    }}
                  />
                  
                  {/* Botão Limpar Filtros */}
                  {(filtroDataInicio || filtroDataFim || selectedColaborador) && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setFiltroDataInicio('');
                        setFiltroDataFim('');
                        setSelectedColaborador('');
                      }}
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '0.65rem',
                        textTransform: 'none',
                        borderColor: 'rgba(0, 0, 0, 0.15)',
                        color: 'var(--gray)',
                        '&:hover': {
                          borderColor: 'var(--blue-medium)',
                          backgroundColor: 'rgba(22, 52, 255, 0.05)',
                        },
                      }}
                    >
                      Limpar
                    </Button>
                  )}
                </Box>
              </Box>

              {loadingSessions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: 'var(--blue-medium)', size: '1rem' }} />
                </Box>
              ) : filteredSessions.length === 0 ? (
                <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                  Nenhuma sessão encontrada no histórico.
                </Alert>
              ) : (
                <>
                  <TableContainer 
                    component={Paper} 
                    sx={{
                      backgroundColor: 'var(--cor-container)', 
                      boxShadow: 'none',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                          <TableCell className="hub-analises-table-header" sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 600, 
                            color: 'var(--blue-dark)', 
                            fontSize: '0.65rem',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          }}>
                            Nome
                          </TableCell>
                          <TableCell className="hub-analises-table-header" sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 600, 
                            color: 'var(--blue-dark)', 
                            fontSize: '0.65rem',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          }}>
                            Início
                          </TableCell>
                          <TableCell className="hub-analises-table-header" sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 600, 
                            color: 'var(--blue-dark)', 
                            fontSize: '0.65rem',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          }}>
                            Fim
                          </TableCell>
                          <TableCell className="hub-analises-table-header" sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 600, 
                            color: 'var(--blue-dark)', 
                            fontSize: '0.65rem',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          }}>
                            Tempo de Sessão
                          </TableCell>
                          <TableCell className="hub-analises-table-header" sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 600, 
                            color: 'var(--blue-dark)', 
                            fontSize: '0.65rem',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          }}>
                            IP
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedSessions.map((session) => {
                            const loginTime = session.loginTimestamp ? formatDatePrecise(session.loginTimestamp) : 'N/A';
                            const logoutTime = session.logoutTimestamp ? formatDatePrecise(session.logoutTimestamp) : null;
                            const duration = calculateSessionDuration(session.loginTimestamp, session.logoutTimestamp);
                            
                            return (
                              <TableRow 
                                key={session._id || session.sessionId} 
                                hover
                                sx={{
                                  backgroundColor: 'var(--cor-container)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  },
                                }}
                              >
                                <TableCell className="hub-analises-table-cell" sx={{ 
                                  fontFamily: 'Poppins', 
                                  fontSize: '0.65rem', 
                                  fontWeight: 500,
                                  color: 'var(--gray)',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                }}>
                                  {session.colaboradorNome || 'N/A'}
                                </TableCell>
                                <TableCell className="hub-analises-table-cell" sx={{ 
                                  fontFamily: 'Poppins', 
                                  fontSize: '0.65rem',
                                  color: 'var(--gray)',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                }}>
                                  {loginTime}
                                </TableCell>
                                <TableCell className="hub-analises-table-cell" sx={{ 
                                  fontFamily: 'Poppins', 
                                  fontSize: '0.65rem',
                                  color: 'var(--gray)',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                }}>
                                  {logoutTime || <Typography component="span" className="hub-analises-em-andamento" sx={{ 
                                    color: 'var(--blue-medium)', 
                                    fontWeight: 500, 
                                    fontSize: '0.65rem'
                                  }}>Em andamento</Typography>}
                                </TableCell>
                                <TableCell className="hub-analises-table-cell" sx={{ 
                                  fontFamily: 'Poppins', 
                                  fontSize: '0.65rem', 
                                  fontWeight: session.logoutTimestamp ? 400 : 600,
                                  color: 'var(--gray)',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                }}>
                                  {duration}
                                </TableCell>
                                <TableCell className="hub-analises-table-cell" sx={{ 
                                  fontFamily: 'Poppins', 
                                  fontSize: '0.65rem',
                                  color: 'var(--gray)',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                }}>
                                  {session.ipAddress || 'N/A'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Controles de Paginação */}
                  {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)'
                  }}>
                    <Typography sx={{ 
                      fontFamily: 'Poppins', 
                      fontSize: '0.65rem', 
                      color: 'var(--gray)' 
                    }}>
                      Mostrando {startIndex + 1} - {Math.min(endIndex, filteredSessions.length)} de {filteredSessions.length} sessões
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        sx={{
                          color: 'var(--blue-medium)',
                          '&:disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(22, 52, 255, 0.08)',
                          },
                        }}
                      >
                        <ChevronLeft fontSize="small" />
                      </IconButton>
                      
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        size="small"
                        siblingCount={1}
                        boundaryCount={1}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontFamily: 'Poppins',
                            fontSize: '0.65rem',
                            minWidth: '28px',
                            height: '28px',
                            color: 'var(--gray)',
                            '&.Mui-selected': {
                              backgroundColor: 'var(--blue-medium)',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: 'var(--blue-light)',
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(22, 52, 255, 0.08)',
                            },
                          },
                        }}
                      />
                      
                      <IconButton
                        size="small"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        sx={{
                          color: 'var(--blue-medium)',
                          '&:disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(22, 52, 255, 0.08)',
                          },
                        }}
                      >
                        <ChevronRight fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Aba Velonews - Declarações de Ciência */}
      {activeTab === 1 && (
        <Card sx={{ backgroundColor: 'var(--cor-card)', ...CARD_PRINCIPAL_SX }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2.4, fontSize: '0.7rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', fontWeight: 600 }}>
              Declarações de Ciência
            </Typography>

            {loadingAcknowledgment ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: 'var(--blue-medium)', size: '1rem' }} />
              </Box>
            ) : cienciaPorNoticia.length === 0 ? (
              <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                Nenhuma declaração de ciência encontrada.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                  {paginatedCienciaPorNoticia.map((noticia) => (
                  <Accordion
                    key={noticia.newsId}
                    expanded={expandedNews === noticia.newsId}
                    onChange={() => setExpandedNews(expandedNews === noticia.newsId ? null : noticia.newsId)}
                    sx={{
                      '&:before': { display: 'none' },
                      backgroundColor: 'var(--cor-container)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '4px !important',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      '&.Mui-expanded': {
                        margin: '0 !important'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: 'var(--blue-medium)', fontSize: '0.7rem' }} />}
                      sx={{
                        backgroundColor: expandedNews === noticia.newsId ? 'rgba(22, 148, 255, 0.05)' : 'var(--cor-container)',
                        '&:hover': {
                          backgroundColor: 'rgba(22, 148, 255, 0.05)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'baseline',
                            gap: 1,
                            columnGap: 1.2,
                            flex: '1 1 auto',
                            minWidth: 0
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{ fontSize: '0.7rem', fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}
                          >
                            {noticia.titulo}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              fontSize: '0.6rem',
                              fontFamily: 'Poppins',
                              color: 'var(--gray)',
                              flexShrink: 0
                            }}
                          >
                            {noticia.primeiraCiencia ? formatDatePrecise(noticia.primeiraCiencia) : 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          label={loadingFuncionariosVelonews 
                            ? `${noticia.totalAgentes} declaração(ões)`
                            : `${noticia.totalAgentes}/${funcionariosVelonews.length} confirmado(s)`
                          }
                          size="small"
                          sx={{
                            backgroundColor: 'var(--blue-medium)',
                            color: 'white',
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            fontSize: '0.55rem',
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 0.8
                            }
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: 'var(--cor-container)' }}>
                      {loadingFuncionariosVelonews ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={20} sx={{ color: 'var(--blue-medium)' }} />
                        </Box>
                      ) : funcionariosVelonews.length === 0 ? (
                        <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                          Nenhum funcionário elegível encontrado.
                        </Alert>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 1,
                          p: 1
                        }}>
                          {funcionariosVelonews.map((funcionario) => {
                            // Verificar se o funcionário já deu ciência
                            const agenteComCiencia = noticia.agentes.find(agente => {
                              const emailFuncionario = funcionario.userMail?.toLowerCase();
                              const emailAgente = agente.userEmail?.toLowerCase() || agente.email?.toLowerCase();
                              const nomeFuncionario = funcionario.colaboradorNome?.toLowerCase();
                              const nomeAgente = agente.colaboradorNome?.toLowerCase() || agente.name?.toLowerCase();
                              
                              return (emailFuncionario && emailAgente && emailFuncionario === emailAgente) ||
                                     (nomeFuncionario && nomeAgente && nomeFuncionario === nomeAgente);
                            });
                            
                            const temCiencia = !!agenteComCiencia;
                            
                            return (
                              <Chip
                                key={funcionario._id || funcionario.userMail}
                                label={funcionario.colaboradorNome || funcionario.userMail || 'Nome não disponível'}
                                sx={{
                                  fontSize: '0.65rem',
                                  fontFamily: 'Poppins',
                                  fontWeight: temCiencia ? 600 : 400,
                                  backgroundColor: temCiencia ? '#4caf50' : 'rgba(0, 0, 0, 0.08)',
                                  color: temCiencia ? 'white' : 'var(--gray)',
                                  height: '28px',
                                  '& .MuiChip-label': {
                                    px: 1.2,
                                    py: 0.4
                                  }
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  ))}
                </Box>
                
                {/* Controles de Paginação */}
                {totalPagesVelonews > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)'
                  }}>
                    <Typography sx={{ 
                      fontFamily: 'Poppins', 
                      fontSize: '0.65rem', 
                      color: 'var(--gray)' 
                    }}>
                      Mostrando {startIndexVelonews + 1} - {Math.min(endIndexVelonews, cienciaPorNoticia.length)} de {cienciaPorNoticia.length} declarações
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => setCurrentPageVelonews(prev => Math.max(1, prev - 1))}
                        disabled={currentPageVelonews === 1}
                        sx={{
                          color: 'var(--blue-medium)',
                          '&:disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(22, 52, 255, 0.08)',
                          },
                        }}
                      >
                        <ChevronLeft fontSize="small" />
                      </IconButton>
                      
                      <Pagination
                        count={totalPagesVelonews}
                        page={currentPageVelonews}
                        onChange={(event, value) => setCurrentPageVelonews(value)}
                        size="small"
                        siblingCount={1}
                        boundaryCount={1}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontFamily: 'Poppins',
                            fontSize: '0.65rem',
                            minWidth: '28px',
                            height: '28px',
                            color: 'var(--gray)',
                            '&.Mui-selected': {
                              backgroundColor: 'var(--blue-medium)',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: 'var(--blue-light)',
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(22, 52, 255, 0.08)',
                            },
                          },
                        }}
                      />
                      
                      <IconButton
                        size="small"
                        onClick={() => setCurrentPageVelonews(prev => Math.min(totalPagesVelonews, prev + 1))}
                        disabled={currentPageVelonews === totalPagesVelonews}
                        sx={{
                          color: 'var(--blue-medium)',
                          '&:disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(22, 52, 255, 0.08)',
                          },
                        }}
                      >
                        <ChevronRight fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Snackbar para feedback de erros */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%', fontFamily: 'Poppins' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HubAnalisesPage;
