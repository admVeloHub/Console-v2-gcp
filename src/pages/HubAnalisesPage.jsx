// VERSION: v2.2.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
  Grid
} from '@mui/material';
import { ExpandMore, Refresh } from '@mui/icons-material';
import BackButton from '../components/common/BackButton';
import { hubAnalisesAPI } from '../services/api';

const HubAnalisesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para aba Hub
  const [usuariosOnlineOffline, setUsuariosOnlineOffline] = useState({ online: [], offline: [], totalOnline: 0, totalOffline: 0, totalFuncionarios: 0 });
  const [allSessions, setAllSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedColaborador, setSelectedColaborador] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [colaboradoresList, setColaboradoresList] = useState([]);
  
  // Estados para aba Velonews
  const [cienciaPorNoticia, setCienciaPorNoticia] = useState([]);
  const [loadingAcknowledgment, setLoadingAcknowledgment] = useState(false);
  const [expandedNews, setExpandedNews] = useState(null);

  // Carregar usuários online/offline
  const loadUsuariosOnlineOffline = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await hubAnalisesAPI.getUsuariosOnlineOffline();
      if (response.success && response.data) {
        setUsuariosOnlineOffline(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários online/offline:', error);
      setUsuariosOnlineOffline({ online: [], offline: [], totalOnline: 0, totalOffline: 0, totalFuncionarios: 0 });
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  // Carregar todas as sessões (histórico)
  const loadAllSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await hubAnalisesAPI.getHubSessions();
      const sessions = Array.isArray(response) ? response : (response.data || []);
      
      // Agrupar por sessionId único (evitar duplicatas)
      const uniqueSessions = new Map();
      sessions.forEach(session => {
        const sessionId = session.sessionId;
        if (!uniqueSessions.has(sessionId) || 
            new Date(session.createdAt) > new Date(uniqueSessions.get(sessionId).createdAt)) {
          uniqueSessions.set(sessionId, session);
        }
      });
      
      const uniqueSessionsArray = Array.from(uniqueSessions.values());
      setAllSessions(uniqueSessionsArray);
      setFilteredSessions(uniqueSessionsArray);
      
      // Extrair lista de colaboradores únicos
      const colaboradores = [...new Set(uniqueSessionsArray.map(s => s.colaboradorNome).filter(Boolean))];
      setColaboradoresList(colaboradores.sort());
    } catch (error) {
      console.error('Erro ao carregar histórico de sessões:', error);
      setAllSessions([]);
      setFilteredSessions([]);
      setColaboradoresList([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

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
      const data = Array.isArray(response) ? response : (response.data || []);
      setCienciaPorNoticia(data);
    } catch (error) {
      console.error('Erro ao carregar declarações de ciência:', error);
      setCienciaPorNoticia([]);
    } finally {
      setLoadingAcknowledgment(false);
    }
  }, []);

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

  // Calcular duração da sessão
  const calculateSessionDuration = (loginTimestamp, logoutTimestamp) => {
    if (!loginTimestamp) return 'N/A';
    if (!logoutTimestamp) return 'Em andamento';
    
    const login = new Date(loginTimestamp);
    const logout = new Date(logoutTimestamp);
    const diffMs = logout - login;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  };

  // Combinar online e offline em um único array
  const todosUsuarios = React.useMemo(() => {
    const combined = [
      ...usuariosOnlineOffline.online.map(u => ({ ...u, isActive: true })),
      ...usuariosOnlineOffline.offline.map(u => ({ ...u, isActive: false }))
    ];
    return combined.sort((a, b) => {
      // Online primeiro, depois offline
      if (a.isActive !== b.isActive) {
        return b.isActive ? 1 : -1;
      }
      // Depois ordenar por nome
      return (a.colaboradorNome || '').localeCompare(b.colaboradorNome || '');
    });
  }, [usuariosOnlineOffline]);

  // Formatar data
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
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
                  color: 'var(--gray)',
                  opacity: 0.7,
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

              {loadingSessions ? (
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
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box
                        sx={{
                          p: 1,
                          border: '1px solid var(--gray-light)',
                          borderRadius: '4px',
                          backgroundColor: usuario.isActive ? 'rgba(21, 162, 55, 0.05)' : 'rgba(255, 0, 0, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: usuario.isActive ? '#15A237' : '#FF0000',
                            flexShrink: 0
                          }}
                        />
                        <Typography sx={{ fontSize: '0.65rem', fontFamily: 'Poppins', color: 'var(--blue-dark)' }}>
                          {usuario.colaboradorNome || 'N/A'}
                        </Typography>
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
                          const dateA = new Date(a.createdAt);
                          const dateB = new Date(b.createdAt);
                          return dateB - dateA; // Mais recente primeiro
                        })
                        .map((session) => (
                          <TableRow key={session._id || session.sessionId} hover>
                            <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                              {formatDate(session.loginTimestamp)}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                              {session.logoutTimestamp ? formatDate(session.logoutTimestamp) : 'Em andamento'}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                              {calculateSessionDuration(session.loginTimestamp, session.logoutTimestamp)}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins', fontSize: '0.65rem' }}>
                              {session.ipAddress || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
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
                            {formatDate(noticia.primeiraCiencia)}
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
                              {formatDate(agente.acknowledgedAt)}
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
    </Container>
  );
};

export default HubAnalisesPage;
