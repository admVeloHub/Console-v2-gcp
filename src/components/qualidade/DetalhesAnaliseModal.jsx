/**
 * DetalhesAnaliseModal.jsx
 * Modal para exibir detalhes completos da análise GPT
 * 
 * VERSION: v1.6.3
 * DATE: 2026-03-19
 * AUTHOR: VeloHub Development Team
 * CHANGELOG: v1.6.3 - Botão Auditoria e Salvar: cores via var(--green|--yellow|--white|--blue-dark|--green-hover|--yellow-hover) alinhadas a LAYOUT_GUIDELINES / globals.css
 * CHANGELOG: v1.6.2 - Botão Auditoria: !important em .MuiButton-contained (theme.js define contained → #1634FF e anulava verde/amarelo)
 * CHANGELOG: v1.6.1 - Sempre GET /result ao abrir (não pular quando há populate); verde = presença no doc (corpo ou auditoriaFeita); salvar usa auditoria devolvida pela API; ícone ✓ no botão
 * CHANGELOG: v1.6.0 - auditoria como { auditoriaFeita, corpoAuditoria }; botão verde só com auditoriaFeita true; MUI color=inherit para não ficar azul (primary)
 * CHANGELOG: v1.5.1 - Botão verde após salvar: atualizar estado com setAnaliseCompleta (mutação direta não re-renderizava)
 * CHANGELOG: v1.5.0 - Botão Auditoria: abre modal secundário, salva em campo auditoria, fica verde quando preenchido
 * CHANGELOG: v1.4.0 - Atualização de métricas: substituído dominioAssunto por registroAtendimento, adicionado conformidadeTicket, atualizadas pontuações
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Gavel as GavelIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as CancelXIcon
} from '@mui/icons-material';
import { editarAuditoria, obterResultadoAnalise } from '../../services/qualidadeAudioService';
import { calcularPontuacaoTotal, PONTUACAO } from '../../types/qualidade';

/**
 * Alinha com o backend: auditoria pode ser string (legado), ou { auditoriaFeita, corpoAuditoria }.
 */
const normalizeAuditoriaFromDoc = (obj) => {
  if (!obj?.auditoria) return { auditoriaFeita: false, corpoAuditoria: '' };
  const a = obj.auditoria;
  if (typeof a === 'string') {
    const t = a.trim();
    return { auditoriaFeita: t.length > 0, corpoAuditoria: a };
  }
  if (typeof a === 'object' && a !== null) {
    const corpo = a.corpoAuditoria != null ? String(a.corpoAuditoria) : '';
    if (Object.prototype.hasOwnProperty.call(a, 'auditoriaFeita')) {
      return { auditoriaFeita: a.auditoriaFeita === true, corpoAuditoria: corpo };
    }
    const t = corpo.trim();
    return { auditoriaFeita: t.length > 0, corpoAuditoria: corpo };
  }
  return { auditoriaFeita: false, corpoAuditoria: '' };
};

/** Indicador visual: há auditoria persistida (texto não vazio ou flag explícita true). */
const docTemAuditoria = (norm) => {
  if (!norm) return false;
  if (norm.auditoriaFeita === true) return true;
  return String(norm.corpoAuditoria ?? '').trim().length > 0;
};

const DetalhesAnaliseModal = ({ 
  open, 
  onClose, 
  analise,
  onAuditar,
  podeAuditar = false,
  onAnaliseAtualizada
}) => {
  const [transcricaoExpandida, setTranscricaoExpandida] = useState(false);
  const [buscaTranscricao, setBuscaTranscricao] = useState('');
  const [modalAuditoriaAberto, setModalAuditoriaAberto] = useState(false);
  const [textoAuditoria, setTextoAuditoria] = useState('');
  const [salvandoAuditoria, setSalvandoAuditoria] = useState(false);
  const [erroAuditoria, setErroAuditoria] = useState(null);
  const [analiseCompleta, setAnaliseCompleta] = useState(null);
  const [carregandoAnalise, setCarregandoAnalise] = useState(false);

  // Sempre buscar GET /result pela id da avaliação monitor (qualidade_avaliacoes), para trazer auditoria e demais campos atuais.
  // Não usar atalho com só o item da lista: o populate ocultava auditoria desatualizada/ausente.
  useEffect(() => {
    let cancelado = false;

    const buscarDadosCompletos = async () => {
      if (!open || !analise) return;

      const idAvaliacaoMonitor = analise.avaliacaoId || analise.avaliacaoMonitorId?._id;

      if (!idAvaliacaoMonitor) {
        console.warn('⚠️ Nenhum id da avaliação (monitor) para GET /audio-analise/result — usando item da lista');
        if (!cancelado) setAnaliseCompleta(analise);
        return;
      }

      try {
        if (!cancelado) setCarregandoAnalise(true);
        const dadosCompletos = await obterResultadoAnalise(idAvaliacaoMonitor);
        if (!cancelado) {
          setAnaliseCompleta(dadosCompletos);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados completos:', error);
        if (!cancelado) setAnaliseCompleta(analise);
      } finally {
        if (!cancelado) setCarregandoAnalise(false);
      }
    };

    buscarDadosCompletos();
    return () => {
      cancelado = true;
    };
  }, [open, analise]);

  // Resetar estados quando o modal fechar ou análise mudar
  useEffect(() => {
    if (!open) {
      setModalAuditoriaAberto(false);
      setTextoAuditoria('');
      setErroAuditoria(null);
      setAnaliseCompleta(null);
    }
  }, [open]);

  // Debug: Log dos dados recebidos para verificar populate
  useEffect(() => {
    if (analiseCompleta && open) {
      console.log('🔍 DEBUG DetalhesAnaliseModal - Dados completos:', {
        avaliacaoMonitorId: analiseCompleta.avaliacaoMonitorId,
        tipoAvaliacaoMonitorId: typeof analiseCompleta.avaliacaoMonitorId,
        isObject: analiseCompleta.avaliacaoMonitorId && typeof analiseCompleta.avaliacaoMonitorId === 'object',
        criteriosMonitor: analiseCompleta.avaliacaoMonitorId ? {
          saudacaoAdequada: analiseCompleta.avaliacaoMonitorId.saudacaoAdequada,
          escutaAtiva: analiseCompleta.avaliacaoMonitorId.escutaAtiva,
          clarezaObjetividade: analiseCompleta.avaliacaoMonitorId.clarezaObjetividade,
          resolucaoQuestao: analiseCompleta.avaliacaoMonitorId.resolucaoQuestao,
          registroAtendimento: analiseCompleta.avaliacaoMonitorId.registroAtendimento,
          empatiaCordialidade: analiseCompleta.avaliacaoMonitorId.empatiaCordialidade,
          direcionouPesquisa: analiseCompleta.avaliacaoMonitorId.direcionouPesquisa,
          naoConsultouBot: analiseCompleta.avaliacaoMonitorId.naoConsultouBot,
          conformidadeTicket: analiseCompleta.avaliacaoMonitorId.conformidadeTicket,
          procedimentoIncorreto: analiseCompleta.avaliacaoMonitorId.procedimentoIncorreto,
          encerramentoBrusco: analiseCompleta.avaliacaoMonitorId.encerramentoBrusco
        } : null
      });
    }
  }, [analiseCompleta, open]);

  // Usar analiseCompleta se disponível, senão usar analise
  const analiseExibida = analiseCompleta || analise;

  if (!analise) return null;

  const auditoriaParaUi = normalizeAuditoriaFromDoc(analiseExibida);
  const botaoAuditoriaVerde = docTemAuditoria(auditoriaParaUi);

  const getScoreColor = (pontuacao) => {
    if (pontuacao >= 80) return '#15A237';
    if (pontuacao >= 60) return '#FCC200';
    return '#f44336';
  };

  const getScoreLabel = (pontuacao) => {
    if (pontuacao >= 80) return 'Excelente';
    if (pontuacao >= 60) return 'Bom';
    return 'Precisa Melhorar';
  };

  const getCriterioLabel = (criterio) => {
    const labels = {
      saudacaoAdequada: 'Saudação Adequada',
      escutaAtiva: 'Escuta Ativa',
      clarezaObjetividade: 'Clareza e Objetividade',
      resolucaoQuestao: 'Resolução da Questão',
      registroAtendimento: 'Registro do Atendimento',
      empatiaCordialidade: 'Empatia e Cordialidade',
      direcionouPesquisa: 'Direcionamento de Pesquisa',
      naoConsultouBot: 'Não Consultou Bot',
      conformidadeTicket: 'Inconformidade no Ticket',
      procedimentoIncorreto: 'Procedimento Incorreto',
      encerramentoBrusco: 'Encerramento Brusco / Ligação Derrubada'
    };
    return labels[criterio] || criterio;
  };

  const getCriterioPontuacao = (criterio, valor) => {
    const pontuacoes = {
      saudacaoAdequada: valor ? PONTUACAO.SAUDACAO_ADEQUADA : 0,
      escutaAtiva: valor ? PONTUACAO.ESCUTA_ATIVA : 0,
      clarezaObjetividade: valor ? PONTUACAO.CLAREZA_OBJETIVIDADE : 0,
      resolucaoQuestao: valor ? PONTUACAO.RESOLUCAO_QUESTAO : 0,
      registroAtendimento: valor ? PONTUACAO.REGISTRO_ATENDIMENTO : 0,
      empatiaCordialidade: valor ? PONTUACAO.EMPATIA_CORDIALIDADE : 0,
      direcionouPesquisa: valor ? PONTUACAO.DIRECIONOU_PESQUISA : 0,
      naoConsultouBot: valor ? PONTUACAO.NAO_CONSULTOU_BOT : 0,
      conformidadeTicket: valor ? PONTUACAO.CONFORMIDADE_TICKET : 0,
      procedimentoIncorreto: valor ? PONTUACAO.PROCEDIMENTO_INCORRETO : 0,
      encerramentoBrusco: valor ? PONTUACAO.ENCERRAMENTO_BRUSCO : 0
    };
    return pontuacoes[criterio] || 0;
  };

  // Calcular pontuação do monitor humano baseado nos critérios
  const calcularPontuacaoMonitor = (avaliacaoMonitor) => {
    if (!avaliacaoMonitor || typeof avaliacaoMonitor !== 'object') {
      return null;
    }
    // Usar pontuacaoTotal se disponível, senão calcular
    if (avaliacaoMonitor.pontuacaoTotal !== undefined && avaliacaoMonitor.pontuacaoTotal !== null) {
      return Math.max(0, avaliacaoMonitor.pontuacaoTotal);
    }
    return Math.max(0, calcularPontuacaoTotal(avaliacaoMonitor));
  };

  // Calcular pontuação da IA
  const calcularPontuacaoIA = () => {
    const pontuacaoIA = analiseExibida?.gptAnalysis?.pontuacao || 
                        analiseExibida?.qualityAnalysis?.pontuacao || 
                        analiseExibida?.pontuacaoGPT || 
                        analiseExibida?.pontuacaoConsensual;
    
    if (pontuacaoIA !== undefined && pontuacaoIA !== null) {
      return Math.max(0, pontuacaoIA);
    }
    
    // Se não houver pontuação direta, calcular a partir dos critérios
    const criterios = analiseExibida?.gptAnalysis?.criterios || analiseExibida?.qualityAnalysis?.criterios || {};
    const avaliacaoMonitor = analiseExibida?.avaliacaoMonitorId || analiseExibida?.avaliacaoOriginal || {};
    
    let total = 0;
    
    // Critérios avaliados pela IA
    if (criterios.saudacaoAdequada) total += PONTUACAO.SAUDACAO_ADEQUADA;
    if (criterios.escutaAtiva) total += PONTUACAO.ESCUTA_ATIVA;
    if (criterios.clarezaObjetividade) total += PONTUACAO.CLAREZA_OBJETIVIDADE;
    if (criterios.resolucaoQuestao) total += PONTUACAO.RESOLUCAO_QUESTAO;
    if (criterios.empatiaCordialidade) total += PONTUACAO.EMPATIA_CORDIALIDADE;
    if (criterios.direcionouPesquisa) total += PONTUACAO.DIRECIONOU_PESQUISA;
    if (criterios.procedimentoIncorreto) total += PONTUACAO.PROCEDIMENTO_INCORRETO;
    if (criterios.encerramentoBrusco) total += PONTUACAO.ENCERRAMENTO_BRUSCO;
    
    // Critérios copiados da avaliação manual (não verificáveis pela IA)
    // registroAtendimento e naoConsultouBot devem ser copiados da avaliação manual
    const registroAtendimento = criterios.registroAtendimento !== undefined 
      ? criterios.registroAtendimento 
      : (avaliacaoMonitor.registroAtendimento || false);
    const naoConsultouBot = criterios.naoConsultouBot !== undefined 
      ? criterios.naoConsultouBot 
      : (avaliacaoMonitor.naoConsultouBot || false);
    const conformidadeTicket = criterios.conformidadeTicket !== undefined 
      ? criterios.conformidadeTicket 
      : (avaliacaoMonitor.conformidadeTicket || false);
    
    if (registroAtendimento) total += PONTUACAO.REGISTRO_ATENDIMENTO;
    if (naoConsultouBot) total += PONTUACAO.NAO_CONSULTOU_BOT;
    if (conformidadeTicket) total += PONTUACAO.CONFORMIDADE_TICKET;
    
    return Math.max(0, total);
  };

  // Verificar se é critério detrator
  const isCriterioDetrator = (criterio) => {
    return criterio === 'naoConsultouBot' || criterio === 'conformidadeTicket' || criterio === 'procedimentoIncorreto' || criterio === 'encerramentoBrusco';
  };

  // Obter ícone e cor para critério
  const getCriterioIcon = (criterio, valor) => {
    const isDetrator = isCriterioDetrator(criterio);
    
    if (isDetrator) {
      // Detratores: true = checkmark vermelho, false = X verde
      if (valor) {
        return { icon: CheckCircleIcon, color: '#f44336' };
      } else {
        return { icon: CancelXIcon, color: '#15A237' };
      }
    } else {
      // Outros: true = checkmark verde, false = X amarelo
      if (valor) {
        return { icon: CheckCircleIcon, color: '#15A237' };
      } else {
        return { icon: CancelXIcon, color: '#FCC200' };
      }
    }
  };

  const filtrarTranscricao = (texto, busca) => {
    if (!busca) return texto;
    const regex = new RegExp(`(${busca})`, 'gi');
    return texto.replace(regex, '<mark style="background-color: #FCC200; padding: 2px;">$1</mark>');
  };

  const transcricaoFiltrada = filtrarTranscricao(analiseExibida?.transcricao || '', buscaTranscricao);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '6px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: 'Poppins', 
        fontWeight: 600, 
        color: '#000058',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Detalhes da Análise por IA
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {carregandoAnalise && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, fontFamily: 'Poppins' }}>
              Carregando dados completos...
            </Typography>
          </Box>
        )}
        {/* Seção 1: Informações da Avaliação */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins', 
            fontWeight: 600, 
            color: '#000058',
            mb: 2
          }}>
            Informações da Avaliação
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 500,
                color: '#666666'
              }}>
                Colaborador:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontFamily: 'Poppins',
                color: '#000058',
                fontWeight: 500
              }}>
                {analiseExibida?.colaboradorNome || analiseExibida?.avaliacaoMonitorId?.colaboradorNome || 'Não disponível'}
              </Typography>
            </Box>
            
            {(analiseExibida?.dataLigacao || analiseExibida?.avaliacaoMonitorId?.dataLigacao) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 500,
                  color: '#666666'
                }}>
                  Data da ligação:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  color: '#000058'
                }}>
                  {new Date(analiseExibida?.dataLigacao || analiseExibida?.avaliacaoMonitorId?.dataLigacao).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}
            
            {analiseExibida?.createdAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 500,
                  color: '#666666'
                }}>
                  Data da avaliação:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  color: '#000058'
                }}>
                  {new Date(analiseExibida?.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Typography>
              </Box>
            )}

          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 3: Comparação de Critérios */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'Poppins', 
            fontWeight: 600, 
            color: '#000058',
            mb: 2
          }}>
            Critérios de Avaliação
          </Typography>
          
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Critério</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>IA</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Monitor</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Pontos</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  // Array fixo com todos os critérios do schema para garantir que todos sejam sempre exibidos
                  const todosCriterios = [
                    'saudacaoAdequada',
                    'escutaAtiva',
                    'clarezaObjetividade',
                    'resolucaoQuestao',
                    'registroAtendimento',
                    'empatiaCordialidade',
                    'direcionouPesquisa',
                    'naoConsultouBot',
                    'conformidadeTicket',
                    'procedimentoIncorreto',
                    'encerramentoBrusco'
                  ];
                  
                  // Obter critérios de gptAnalysis ou qualityAnalysis
                  const criterios = analiseExibida.gptAnalysis?.criterios || analiseExibida.qualityAnalysis?.criterios || {};
                  // Obter critérios humanos diretamente de avaliacaoMonitorId populado
                  // avaliacaoMonitorId pode ser um objeto populado ou um ID, verificar ambos
                  const avaliacaoMonitor = analiseExibida.avaliacaoMonitorId || analiseExibida.avaliacaoOriginal;
                  
                  return todosCriterios.map((criterio) => {
                    // Para critérios não verificáveis pela IA, copiar da avaliação manual
                    let valorGPT = criterios[criterio];
                    if (criterio === 'registroAtendimento') {
                      // Se não estiver nos critérios da IA, copiar da avaliação manual
                      if (valorGPT === undefined) {
                        valorGPT = avaliacaoMonitor?.registroAtendimento || false;
                      }
                    } else if (criterio === 'naoConsultouBot') {
                      // Se não estiver nos critérios da IA, copiar da avaliação manual
                      if (valorGPT === undefined) {
                        valorGPT = avaliacaoMonitor?.naoConsultouBot || false;
                      }
                    } else if (criterio === 'conformidadeTicket') {
                      // Se não estiver nos critérios da IA, copiar da avaliação manual
                      if (valorGPT === undefined) {
                        valorGPT = avaliacaoMonitor?.conformidadeTicket || false;
                      }
                    } else {
                      // Para outros critérios, usar valor da IA ou false
                      valorGPT = valorGPT ?? false;
                    }
                    // Buscar critério humano diretamente do avaliacaoMonitorId populado
                    // Os critérios estão diretamente no objeto QualidadeAvaliacao
                    const valorHumano = avaliacaoMonitor?.[criterio] !== undefined 
                      ? avaliacaoMonitor[criterio] 
                      : undefined;
                    const pontos = getCriterioPontuacao(criterio, valorGPT);
                    const divergencia = valorHumano !== undefined && valorGPT !== valorHumano;
                  
                  return (
                    <TableRow 
                      key={criterio}
                      sx={{ 
                        backgroundColor: divergencia ? '#fff3cd' : 'transparent',
                        '&:hover': { backgroundColor: divergencia ? '#ffeaa7' : 'var(--cor-container)' }
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'Poppins' }}>
                        {getCriterioLabel(criterio)}
                      </TableCell>
                      <TableCell align="center">
                        {(() => {
                          const { icon: IconGPT, color: colorGPT } = getCriterioIcon(criterio, valorGPT);
                          return <IconGPT sx={{ color: colorGPT, fontSize: 24 }} />;
                        })()}
                      </TableCell>
                      <TableCell align="center">
                        {valorHumano !== undefined ? (
                          (() => {
                            const { icon: IconHumano, color: colorHumano } = getCriterioIcon(criterio, valorHumano);
                            return <IconHumano sx={{ color: colorHumano, fontSize: 24 }} />;
                          })()
                        ) : (
                          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          color: pontos >= 0 ? '#15A237' : '#f44336'
                        }}>
                          {pontos > 0 ? '+' : ''}{pontos}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {divergencia ? (
                          <Chip
                            label="Divergência"
                            size="small"
                            sx={{
                              backgroundColor: '#FCC200',
                              color: '#000000',
                              fontFamily: 'Poppins'
                            }}
                          />
                        ) : (
                          <Chip
                            label="Convergência"
                            size="small"
                            sx={{
                              backgroundColor: '#15A237',
                              color: '#ffffff',
                              fontFamily: 'Poppins'
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })})()}
                
                {/* Linha de Pontuação Total */}
                {(() => {
                  const avaliacaoMonitor = analiseExibida.avaliacaoMonitorId || analiseExibida.avaliacaoOriginal;
                  const pontuacaoIA = calcularPontuacaoIA();
                  const pontuacaoMonitor = calcularPontuacaoMonitor(avaliacaoMonitor);
                  const media = pontuacaoMonitor !== null 
                    ? Math.round((pontuacaoIA + pontuacaoMonitor) / 2) 
                    : pontuacaoIA;
                  const statusMedia = getScoreLabel(media);
                  const corMedia = getScoreColor(media);
                  
                  return (
                    <TableRow 
                      sx={{ 
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                        '& td': {
                          fontWeight: 600,
                          fontSize: '1rem'
                        }
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                        <strong>Pontuação</strong>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ 
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          color: getScoreColor(pontuacaoIA)
                        }}>
                          {pontuacaoIA !== null && pontuacaoIA !== undefined ? `${pontuacaoIA} pts` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {pontuacaoMonitor !== null ? (
                          <Typography variant="body1" sx={{ 
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            color: getScoreColor(pontuacaoMonitor)
                          }}>
                            {pontuacaoMonitor} pts
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ 
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          color: corMedia
                        }}>
                          {media} pts
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={statusMedia}
                          size="small"
                          sx={{
                            backgroundColor: corMedia,
                            color: '#ffffff',
                            fontFamily: 'Poppins',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 4: Análise (somente leitura) + Botão Auditoria */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins', 
              fontWeight: 600, 
              color: 'var(--blue-dark)'
            }}>
              Análise
            </Typography>
            {podeAuditar && (
              <Button
                variant="contained"
                color="inherit"
                size="small"
                startIcon={<GavelIcon />}
                endIcon={botaoAuditoriaVerde ? <CheckCircleIcon sx={{ fontSize: '1.1rem !important' }} /> : null}
                disableElevation
                aria-label={botaoAuditoriaVerde ? 'Auditoria registrada nesta análise' : 'Registrar ou editar auditoria'}
                onClick={() => {
                  const textoInicial = auditoriaParaUi.corpoAuditoria.trim()
                    ? auditoriaParaUi.corpoAuditoria
                    : (analiseExibida.gptAnalysis?.analysis || analiseExibida.qualityAnalysis?.analysis || '');
                  setTextoAuditoria(textoInicial);
                  setErroAuditoria(null);
                  setModalAuditoriaAberto(true);
                }}
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  // Paleta LAYOUT_GUIDELINES (via :root em globals.css); !important evita override do theme.js contained
                  ...(botaoAuditoriaVerde
                    ? {
                        color: 'var(--white)',
                        '&.MuiButton-contained': {
                          backgroundColor: 'var(--green) !important',
                          color: 'var(--white) !important',
                          boxShadow: 'none'
                        },
                        '&.MuiButton-contained:hover': {
                          backgroundColor: 'var(--green-hover) !important',
                          boxShadow: 'none'
                        }
                      }
                    : {
                        color: 'var(--blue-dark)',
                        '&.MuiButton-contained': {
                          backgroundColor: 'var(--yellow) !important',
                          color: 'var(--blue-dark) !important',
                          boxShadow: 'none'
                        },
                        '&.MuiButton-contained:hover': {
                          backgroundColor: 'var(--yellow-hover) !important',
                          boxShadow: 'none'
                        }
                      }),
                  '& .MuiButton-endIcon': { color: 'inherit' }
                }}
              >
                {botaoAuditoriaVerde ? 'Auditoria registrada' : 'Auditoria'}
              </Button>
            )}
          </Box>

          <Typography variant="body1" sx={{ 
            fontFamily: 'Poppins',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {analiseExibida.gptAnalysis?.analysis || analiseExibida.qualityAnalysis?.analysis || 'Análise não disponível'}
          </Typography>
        </Box>

        {/* Modal secundário: Auditoria */}
        <Dialog
          open={modalAuditoriaAberto}
          onClose={() => !salvandoAuditoria && setModalAuditoriaAberto(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '6px' }
          }}
        >
          <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)' }}>
            Auditoria
          </DialogTitle>
          <DialogContent>
            {erroAuditoria && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: 'Poppins' }}>
                {erroAuditoria}
              </Alert>
            )}
            <TextField
              fullWidth
              multiline
              rows={12}
              value={textoAuditoria}
              onChange={(e) => setTextoAuditoria(e.target.value)}
              variant="outlined"
              placeholder="Digite a auditoria da análise..."
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': { fontFamily: 'Poppins' }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => !salvandoAuditoria && setModalAuditoriaAberto(false)}
              sx={{ fontFamily: 'Poppins', color: '#666666' }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="inherit"
              disableElevation
              startIcon={salvandoAuditoria ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={salvandoAuditoria}
              onClick={async () => {
                try {
                  setSalvandoAuditoria(true);
                  setErroAuditoria(null);
                  const analiseId = analiseExibida?._id || analise?._id;
                  const respostaApi = await editarAuditoria(analiseId, textoAuditoria);
                  const base = analiseCompleta || analise;
                  const trimmed = textoAuditoria.trim();
                  const auditoriaApi = respostaApi?.data?.auditoria;
                  const auditoriaObj = auditoriaApi && typeof auditoriaApi === 'object'
                    ? auditoriaApi
                    : {
                        auditoriaFeita: trimmed.length > 0,
                        corpoAuditoria: textoAuditoria
                      };
                  const atualizado = { ...base, auditoria: auditoriaObj };
                  setAnaliseCompleta(atualizado);
                  setModalAuditoriaAberto(false);
                  if (onAnaliseAtualizada) onAnaliseAtualizada(atualizado);
                } catch (error) {
                  setErroAuditoria(error.message || 'Erro ao salvar auditoria');
                } finally {
                  setSalvandoAuditoria(false);
                }
              }}
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: 'none',
                '&.MuiButton-contained': {
                  backgroundColor: 'var(--green) !important',
                  color: 'var(--white) !important',
                  boxShadow: 'none'
                },
                '&.MuiButton-contained:hover': {
                  backgroundColor: 'var(--green-hover) !important',
                  boxShadow: 'none'
                }
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: 3 }} />

        {/* Seção 5: Palavras Críticas */}
        {analiseExibida.palavrasCriticas && analiseExibida.palavrasCriticas.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600, 
                color: '#f44336',
                mb: 2
              }}>
                ⚠️ Palavras Críticas Detectadas
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {analiseExibida.palavrasCriticas.map((palavra, index) => (
                  <Chip
                    key={index}
                    label={palavra}
                    sx={{
                      backgroundColor: '#f44336',
                      color: '#ffffff',
                      fontFamily: 'Poppins',
                      fontWeight: 500
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Seção 6: Transcrição */}
        {analiseExibida?.transcricao && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600, 
                color: '#000058'
              }}>
                Transcrição da Ligação
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Buscar na transcrição..."
                  value={buscaTranscricao}
                  onChange={(e) => setBuscaTranscricao(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#666666', mr: 1 }} />
                  }}
                  sx={{
                    width: 200,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
                <IconButton
                  onClick={() => setTranscricaoExpandida(!transcricaoExpandida)}
                  sx={{ color: '#000058' }}
                >
                  {transcricaoExpandida ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={transcricaoExpandida}>
              <Box sx={{ 
                backgroundColor: 'var(--cor-container)', 
                padding: 2, 
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid #e0e0e0'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Poppins',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                  dangerouslySetInnerHTML={{ __html: transcricaoFiltrada }}
                />
              </Box>
            </Collapse>
          </Box>
          </>
        )}

        {/* Seção 7: Auditoria (se aplicável) */}
        {analiseExibida?.auditoriaGestor && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins', 
              fontWeight: 600, 
              color: '#000058',
              mb: 2
            }}>
              Auditoria do Gestor
            </Typography>
            
            <Box sx={{ 
              backgroundColor: analiseExibida.auditoriaGestor.aprovado ? '#d4edda' : '#f8d7da', 
              padding: 2, 
              borderRadius: '4px',
              border: `1px solid ${analiseExibida.auditoriaGestor.aprovado ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={analiseExibida.auditoriaGestor.aprovado ? 'Aprovado' : 'Requer Correções'}
                  sx={{
                    backgroundColor: analiseExibida.auditoriaGestor.aprovado ? '#15A237' : '#f44336',
                    color: '#ffffff',
                    fontFamily: 'Poppins',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={`Auditor: ${analiseExibida.auditoriaGestor.auditor}`}
                  sx={{
                    backgroundColor: '#666666',
                    color: '#ffffff',
                    fontFamily: 'Poppins'
                  }}
                />
                <Chip
                  label={`Data: ${new Date(analiseExibida.auditoriaGestor.dataAuditoria).toLocaleDateString('pt-BR')}`}
                  sx={{
                    backgroundColor: '#666666',
                    color: '#ffffff',
                    fontFamily: 'Poppins'
                  }}
                />
              </Box>
              
              {analiseExibida?.auditoriaGestor?.comentarios && (
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  lineHeight: 1.6
                }}>
                  <strong>Comentários:</strong> {analiseExibida.auditoriaGestor.comentarios}
                </Typography>
              )}
            </Box>
          </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 500,
            color: '#666666'
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetalhesAnaliseModal;
