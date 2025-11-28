// VERSION: v3.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
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
  Snackbar
} from '@mui/material';
import { ExpandMore, Refresh, Download } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import BackButton from '../components/common/BackButton';
import { hubAnalisesAPI } from '../services/api';

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
  
  // Estados para aba Velonews
  const [cienciaPorNoticia, setCienciaPorNoticia] = useState([]);
  const [loadingAcknowledgment, setLoadingAcknowledgment] = useState(false);
  const [expandedNews, setExpandedNews] = useState(null);
  
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

  // Validar sessão
  const validateSession = useCallback((session) => {
    if (!session || typeof session !== 'object') return false;
    if (!session.sessionId && !session._id) return false;
    return true;
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
      
      if (normalizedData && validateUsuariosOnlineOffline(normalizedData)) {
        // Validar e processar cada usuário
        const processedData = {
          online: (normalizedData.online || []).map(user => ({
            ...user,
            colaboradorNome: user.colaboradorNome || user.nome || user.userEmail || 'N/A',
            loginTimestamp: user.loginTimestamp || user.createdAt || null,
            lastActivity: user.lastActivity || user.updatedAt || null
          })),
          offline: (normalizedData.offline || []).map(user => ({
            ...user,
            colaboradorNome: user.colaboradorNome || user.nome || user.userEmail || 'N/A',
            logoutTimestamp: user.logoutTimestamp || user.updatedAt || null
          })),
          totalOnline: normalizedData.totalOnline || 0,
          totalOffline: normalizedData.totalOffline || 0,
          totalFuncionarios: normalizedData.totalFuncionarios || (normalizedData.totalOnline || 0) + (normalizedData.totalOffline || 0)
        };
        
        setUsuariosOnlineOffline(processedData);
      } else {
        throw new Error('Estrutura de dados inválida recebida do servidor');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários online/offline:', error);
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
      
      if (!rawSessions || !Array.isArray(rawSessions)) {
        throw new Error('Resposta inválida: esperado array de sessões');
      }
      
      // Validar e processar cada sessão
      const validSessions = rawSessions
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
      validSessions.forEach(session => {
        const sessionId = session.sessionId;
        if (!sessionId) return; // Ignorar sessões sem ID
        
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
      console.error('Erro ao carregar histórico de sessões:', error);
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

  // Filtrar sessões por colaborador
  useEffect(() => {
    if (!selectedColaborador) {
      setFilteredSessions(allSessions);
    } else {
      setFilteredSessions(
        allSessions.filter(s => s.colaboradorNome === selectedColaborador)
      );
    }
  }, [selectedColaborador, allSessions]);

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
      console.error('Erro ao carregar declarações de ciência:', error);
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
    }
  }, [activeTab, loadUsuariosOnlineOffline, loadAllSessions, loadAcknowledgments]);

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

  // Combinar online e offline em um único array - COM INFORMAÇÕES DE HORÁRIO
  const todosUsuarios = React.useMemo(() => {
    const combined = [
      ...usuariosOnlineOffline.online.map(u => ({ 
        ...u, 
        isActive: true,
        loginTimestamp: u.loginTimestamp || u.createdAt || null,
        lastActivity: u.lastActivity || u.updatedAt || null,
        tempoOnline: u.loginTimestamp ? calculateSessionDuration(u.loginTimestamp, null) : 'N/A'
      })),
      ...usuariosOnlineOffline.offline.map(u => ({ 
        ...u, 
        isActive: false,
        logoutTimestamp: u.logoutTimestamp || u.updatedAt || null
      }))
    ];
    return combined.sort((a, b) => {
      // Online primeiro, depois offline
      if (a.isActive !== b.isActive) {
        return b.isActive ? 1 : -1;
      }
      // Depois ordenar por nome
      return (a.colaboradorNome || '').localeCompare(b.colaboradorNome || '');
    });
  }, [usuariosOnlineOffline, calculateSessionDuration]);

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
      {/* Header com botão voltar e abas alinhadas */}
      <Box sx={{ position: 'relative', mb: 3.2, minHeight: 40 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
          <BackButton />
        </Box>
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          width: 'max-content'
        }}>
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
        </Box>
      </Box>

      {/* Aba Hub */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Quadro 1: Sessões Abertas */}
          <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
                <Typography variant="h6" sx={{ fontSize: '0.7rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', fontWeight: 600 }}>
                  Sessões Abertas
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.6rem', color: 'var(--gray)', fontFamily: 'Poppins' }}>
                    Online: {usuariosOnlineOffline.totalOnline} | Offline: {usuariosOnlineOffline.totalOffline} | Total: {usuariosOnlineOffline.totalFuncionarios}
                  </Typography>
                  <Box
                    component="button"
                    onClick={loadUsuariosOnlineOffline}
                    sx={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--blue-medium)',
                      '&:hover': { opacity: 0.7 }
                    }}
                  >
                    <Refresh sx={{ fontSize: '0.7rem' }} />
                  </Box>
                </Box>
              </Box>

              {loadingUsuarios ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: 'var(--blue-medium)', size: '1rem' }} />
                </Box>
              ) : todosUsuarios.length === 0 ? (
                <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                  Nenhum funcionário encontrado.
                </Alert>
              ) : (
                <Grid container spacing={1.6}>
                  {todosUsuarios.map((usuario, index) => (
                    <Grid item xs={12} sm={6} md={4} key={usuario.colaboradorNome || index}>
                      <Box
                        sx={{
                          p: 1.2,
                          border: '1px solid rgba(22, 52, 255, 0.1)',
                          borderRadius: '6px',
                          backgroundColor: usuario.isActive ? 'rgba(21, 162, 55, 0.05)' : 'rgba(255, 0, 0, 0.05)',
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
                              backgroundColor: usuario.isActive ? '#15A237' : '#FF0000',
                              flexShrink: 0
                            }}
                          />
                          <Typography sx={{ fontSize: '0.7rem', fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>
                            {usuario.colaboradorNome || 'N/A'}
                          </Typography>
                        </Box>
                        {usuario.isActive && usuario.loginTimestamp && (
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
                        {!usuario.isActive && usuario.logoutTimestamp && (
                          <Box sx={{ pl: 1.6 }}>
                            <Typography sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'var(--gray)' }}>
                              Fechamento: {formatDatePrecise(usuario.logoutTimestamp)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Quadro 2: Histórico de Sessões */}
          <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
                <Typography variant="h6" sx={{ fontSize: '0.7rem', color: 'var(--blue-dark)', fontFamily: 'Poppins', fontWeight: 600 }}>
                  Histórico de Sessões
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ fontFamily: 'Poppins', fontSize: '0.6rem' }}>Filtrar por Colaborador</InputLabel>
                    <Select
                      value={selectedColaborador}
                      label="Filtrar por Colaborador"
                      onChange={(e) => setSelectedColaborador(e.target.value)}
                      sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}
                    >
                      <MenuItem value="" sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>Todos</MenuItem>
                      {colaboradoresList.map((colab) => (
                        <MenuItem key={colab} value={colab} sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                          {colab}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'var(--cor-container)' }}>
                        <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', fontSize: '0.65rem' }}>
                          Nome
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', fontSize: '0.65rem' }}>
                          Início
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', fontSize: '0.65rem' }}>
                          Fim
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', fontSize: '0.65rem' }}>
                          Tempo de Sessão
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', fontSize: '0.65rem' }}>
                          IP
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSessions
                        .sort((a, b) => {
                          // Ordenar por loginTimestamp (mais recente primeiro), fallback para createdAt
                          const dateA = isValidDate(a.loginTimestamp) ? new Date(a.loginTimestamp) : 
                                        (isValidDate(a.createdAt) ? new Date(a.createdAt) : new Date(0));
                          const dateB = isValidDate(b.loginTimestamp) ? new Date(b.loginTimestamp) : 
                                        (isValidDate(b.createdAt) ? new Date(b.createdAt) : new Date(0));
                          return dateB - dateA; // Mais recente primeiro
                        })
                        .map((session) => {
                          const loginTime = session.loginTimestamp ? formatDatePrecise(session.loginTimestamp) : 'N/A';
                          const logoutTime = session.logoutTimestamp ? formatDatePrecise(session.logoutTimestamp) : null;
                          const duration = calculateSessionDuration(session.loginTimestamp, session.logoutTimestamp);
                          
                          return (
                            <TableRow key={session._id || session.sessionId} hover>
                              <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', fontWeight: 500 }}>
                                {session.colaboradorNome || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                                {loginTime}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                                {logoutTime || <Typography component="span" sx={{ color: 'var(--blue-medium)', fontWeight: 500 }}>Em andamento</Typography>}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', fontWeight: session.logoutTimestamp ? 400 : 600 }}>
                                {duration}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                                {session.ipAddress || 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Aba Velonews - Declarações de Ciência */}
      {activeTab === 1 && (
        <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                {cienciaPorNoticia.map((noticia) => (
                  <Accordion
                    key={noticia.newsId}
                    expanded={expandedNews === noticia.newsId}
                    onChange={() => setExpandedNews(expandedNews === noticia.newsId ? null : noticia.newsId)}
                    sx={{
                      '&:before': { display: 'none' },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px !important',
                      '&.Mui-expanded': {
                        margin: '0 !important'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: 'var(--blue-medium)', fontSize: '0.7rem' }} />}
                      sx={{
                        backgroundColor: expandedNews === noticia.newsId ? 'rgba(22, 148, 255, 0.05)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(22, 148, 255, 0.05)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>
                            {noticia.titulo}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'var(--gray)' }}>
                            {noticia.primeiraCiencia ? formatDatePrecise(noticia.primeiraCiencia) : 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${noticia.totalAgentes} declaração(ões)`}
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
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {noticia.agentes.map((agente, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.2,
                              backgroundColor: 'var(--cor-container)',
                              borderRadius: '4px',
                              border: '1px solid var(--gray-light)'
                            }}
                          >
                            <Typography sx={{ fontSize: '0.65rem', fontFamily: 'Poppins', fontWeight: 500 }}>
                              {agente.colaboradorNome || agente.userEmail || 'Usuário desconhecido'}
                            </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'var(--gray)' }}>
                            {agente.acknowledgedAt ? formatDatePrecise(agente.acknowledgedAt) : 'N/A'}
                          </Typography>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
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
