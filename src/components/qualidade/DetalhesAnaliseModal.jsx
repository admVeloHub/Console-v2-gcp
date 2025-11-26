/**
 * DetalhesAnaliseModal.jsx
 * Modal para exibir detalhes completos da análise GPT
 * 
 * VERSION: v1.3.0
 * DATE: 2024-12-19
 * AUTHOR: VeloHub Development Team
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
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as CancelXIcon
} from '@mui/icons-material';
import { editarAnaliseGPT, obterResultadoAnalise } from '../../services/qualidadeAudioService';
import { calcularPontuacaoTotal, PONTUACAO } from '../../types/qualidade';

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
  const [editandoAnalise, setEditandoAnalise] = useState(false);
  const [analiseEditada, setAnaliseEditada] = useState('');
  const [salvandoAnalise, setSalvandoAnalise] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);
  const [analiseCompleta, setAnaliseCompleta] = useState(null);
  const [carregandoAnalise, setCarregandoAnalise] = useState(false);

  // Buscar dados completos quando o modal abrir
  useEffect(() => {
    const buscarDadosCompletos = async () => {
      if (!open || !analise) return;
      
      // Se já temos avaliacaoMonitorId populado com critérios, usar diretamente
      if (analise.avaliacaoMonitorId && typeof analise.avaliacaoMonitorId === 'object' && analise.avaliacaoMonitorId.saudacaoAdequada !== undefined) {
        setAnaliseCompleta(analise);
        return;
      }
      
      // Caso contrário, buscar dados completos usando avaliacaoId
      const avaliacaoId = analise.avaliacaoId || analise.avaliacaoMonitorId?._id || analise._id;
      if (!avaliacaoId) {
        console.warn('⚠️ Nenhum avaliacaoId encontrado para buscar dados completos');
        setAnaliseCompleta(analise);
        return;
      }
      
      try {
        setCarregandoAnalise(true);
        console.log('🔍 Buscando dados completos para avaliacaoId:', avaliacaoId);
        const dadosCompletos = await obterResultadoAnalise(avaliacaoId);
        console.log('✅ Dados completos recebidos:', dadosCompletos);
        setAnaliseCompleta(dadosCompletos);
      } catch (error) {
        console.error('❌ Erro ao buscar dados completos:', error);
        // Em caso de erro, usar os dados que já temos
        setAnaliseCompleta(analise);
      } finally {
        setCarregandoAnalise(false);
      }
    };
    
    buscarDadosCompletos();
  }, [open, analise]);

  // Resetar estados quando o modal fechar ou análise mudar
  useEffect(() => {
    if (!open) {
      setEditandoAnalise(false);
      setAnaliseEditada('');
      setErroSalvar(null);
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
          dominioAssunto: analiseCompleta.avaliacaoMonitorId.dominioAssunto,
          empatiaCordialidade: analiseCompleta.avaliacaoMonitorId.empatiaCordialidade,
          direcionouPesquisa: analiseCompleta.avaliacaoMonitorId.direcionouPesquisa,
          procedimentoIncorreto: analiseCompleta.avaliacaoMonitorId.procedimentoIncorreto,
          encerramentoBrusco: analiseCompleta.avaliacaoMonitorId.encerramentoBrusco
        } : null
      });
    }
  }, [analiseCompleta, open]);

  // Usar analiseCompleta se disponível, senão usar analise
  const analiseExibida = analiseCompleta || analise;

  if (!analise) return null;

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
      dominioAssunto: 'Domínio do Assunto',
      empatiaCordialidade: 'Empatia e Cordialidade',
      direcionouPesquisa: 'Direcionamento de Pesquisa',
      procedimentoIncorreto: 'Procedimento Incorreto',
      encerramentoBrusco: 'Encerramento Brusco'
    };
    return labels[criterio] || criterio;
  };

  const getCriterioPontuacao = (criterio, valor) => {
    const pontuacoes = {
      saudacaoAdequada: valor ? PONTUACAO.SAUDACAO_ADEQUADA : 0,
      escutaAtiva: valor ? PONTUACAO.ESCUTA_ATIVA : 0,
      clarezaObjetividade: valor ? PONTUACAO.CLAREZA_OBJETIVIDADE : 0,
      resolucaoQuestao: valor ? PONTUACAO.RESOLUCAO_QUESTAO : 0,
      dominioAssunto: valor ? PONTUACAO.DOMINIO_ASSUNTO : 0,
      empatiaCordialidade: valor ? PONTUACAO.EMPATIA_CORDIALIDADE : 0,
      direcionouPesquisa: valor ? PONTUACAO.DIRECIONOU_PESQUISA : 0,
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
    let total = 0;
    
    if (criterios.saudacaoAdequada) total += PONTUACAO.SAUDACAO_ADEQUADA;
    if (criterios.escutaAtiva) total += PONTUACAO.ESCUTA_ATIVA;
    if (criterios.clarezaObjetividade) total += PONTUACAO.CLAREZA_OBJETIVIDADE;
    if (criterios.resolucaoQuestao) total += PONTUACAO.RESOLUCAO_QUESTAO;
    if (criterios.dominioAssunto) total += PONTUACAO.DOMINIO_ASSUNTO;
    if (criterios.empatiaCordialidade) total += PONTUACAO.EMPATIA_CORDIALIDADE;
    if (criterios.direcionouPesquisa) total += PONTUACAO.DIRECIONOU_PESQUISA;
    if (criterios.procedimentoIncorreto) total += PONTUACAO.PROCEDIMENTO_INCORRETO;
    if (criterios.encerramentoBrusco) total += PONTUACAO.ENCERRAMENTO_BRUSCO;
    
    return Math.max(0, total);
  };

  // Verificar se é critério detrator
  const isCriterioDetrator = (criterio) => {
    return criterio === 'procedimentoIncorreto' || criterio === 'encerramentoBrusco';
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
          borderRadius: '16px',
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
                    'dominioAssunto',
                    'empatiaCordialidade',
                    'direcionouPesquisa',
                    'procedimentoIncorreto',
                    'encerramentoBrusco'
                  ];
                  
                  // Obter critérios de gptAnalysis ou qualityAnalysis
                  const criterios = analiseExibida.gptAnalysis?.criterios || analiseExibida.qualityAnalysis?.criterios || {};
                  // Obter critérios humanos diretamente de avaliacaoMonitorId populado
                  // avaliacaoMonitorId pode ser um objeto populado ou um ID, verificar ambos
                  const avaliacaoMonitor = analiseExibida.avaliacaoMonitorId || analiseExibida.avaliacaoOriginal;
                  
                  return todosCriterios.map((criterio) => {
                    // Buscar valor da IA (GPT) - se não existir, considerar false
                    const valorGPT = criterios[criterio] ?? false;
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
                        '&:hover': { backgroundColor: divergencia ? '#ffeaa7' : '#f8f9fa' }
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

        {/* Seção 4: Análise Editável */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins', 
              fontWeight: 600, 
              color: '#000058'
            }}>
              Análise
            </Typography>
            {!editandoAnalise && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                disabled={!podeAuditar}
                onClick={() => {
                  if (!podeAuditar) return;
                  // Buscar o texto da análise (priorizar gptAnalysis, depois qualityAnalysis)
                  const textoAnalise = analiseExibida.gptAnalysis?.analysis || 
                                       analiseExibida.qualityAnalysis?.analysis || 
                                       '';
                  setAnaliseEditada(textoAnalise);
                  setEditandoAnalise(true);
                  setErroSalvar(null);
                }}
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  borderColor: podeAuditar ? '#FCC200' : '#cccccc',
                  color: podeAuditar ? '#000000' : '#999999',
                  '&:hover': podeAuditar ? {
                    borderColor: '#e6b000',
                    backgroundColor: 'rgba(252, 194, 0, 0.1)'
                  } : {},
                  '&.Mui-disabled': {
                    borderColor: '#e0e0e0',
                    color: '#bdbdbd'
                  }
                }}
              >
                Auditoria
              </Button>
            )}
          </Box>

          {erroSalvar && (
            <Alert severity="error" sx={{ mb: 2, fontFamily: 'Poppins' }}>
              {erroSalvar}
            </Alert>
          )}

          {editandoAnalise ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={analiseEditada}
                onChange={(e) => setAnaliseEditada(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Poppins'
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={salvandoAnalise ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={async () => {
                    try {
                      setSalvandoAnalise(true);
                      setErroSalvar(null);
                      
                      // Determinar o tipo da análise (gpt ou quality)
                      // Priorizar gptAnalysis se existir, senão usar qualityAnalysis
                      const tipo = (analiseExibida.gptAnalysis && (analiseExibida.gptAnalysis.analysis || Object.keys(analiseExibida.gptAnalysis).length > 0)) ? 'gpt' : 'quality';
                      
                      const resultado = await editarAnaliseGPT(analiseExibida?._id || analise?._id, analiseEditada, tipo);
                      
                      // Atualizar o objeto analise localmente
                      if (tipo === 'gpt') {
                        analiseExibida.gptAnalysis = analiseExibida.gptAnalysis || {};
                        analiseExibida.gptAnalysis.analysis = analiseEditada;
                      } else {
                        analiseExibida.qualityAnalysis = analiseExibida.qualityAnalysis || {};
                        analiseExibida.qualityAnalysis.analysis = analiseEditada;
                      }
                      
                      setEditandoAnalise(false);
                      setSalvandoAnalise(false);
                      setErroSalvar(null);
                      
                      // Notificar componente pai se necessário
                      if (onAnaliseAtualizada) {
                        onAnaliseAtualizada(analise);
                      }
                    } catch (error) {
                      console.error('Erro ao salvar análise:', error);
                      setErroSalvar(error.message || 'Erro ao salvar análise');
                      setSalvandoAnalise(false);
                    }
                  }}
                  disabled={salvandoAnalise}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    backgroundColor: '#15A237',
                    '&:hover': {
                      backgroundColor: '#128a2e'
                    }
                  }}
                >
                  Salvar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setEditandoAnalise(false);
                    setAnaliseEditada('');
                    setErroSalvar(null);
                  }}
                  disabled={salvandoAnalise}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    borderColor: '#666666',
                    color: '#666666',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ 
              fontFamily: 'Poppins',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {analiseExibida.gptAnalysis?.analysis || analiseExibida.qualityAnalysis?.analysis || 'Análise não disponível'}
            </Typography>
          )}
        </Box>

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
                backgroundColor: '#f8f9fa', 
                padding: 2, 
                borderRadius: '8px',
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
              borderRadius: '8px',
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
