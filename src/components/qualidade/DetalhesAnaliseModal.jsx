/**
 * DetalhesAnaliseModal.jsx
 * Modal para exibir detalhes completos da análise GPT
 * 
 * VERSION: v1.0.0
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { editarAnaliseGPT } from '../../services/qualidadeAudioService';

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

  // Resetar estados quando o modal fechar ou análise mudar
  useEffect(() => {
    if (!open) {
      setEditandoAnalise(false);
      setAnaliseEditada('');
      setErroSalvar(null);
    }
  }, [open]);

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
      saudacaoAdequada: valor ? 10 : 0,
      escutaAtiva: valor ? 25 : 0,
      clarezaObjetividade: valor ? 15 : 0,
      resolucaoQuestao: valor ? 40 : 0,
      dominioAssunto: valor ? 20 : 0,
      empatiaCordialidade: valor ? 15 : 0,
      direcionouPesquisa: valor ? 10 : 0,
      procedimentoIncorreto: valor ? -60 : 0,
      encerramentoBrusco: valor ? -100 : 0
    };
    return pontuacoes[criterio] || 0;
  };

  const filtrarTranscricao = (texto, busca) => {
    if (!busca) return texto;
    const regex = new RegExp(`(${busca})`, 'gi');
    return texto.replace(regex, '<mark style="background-color: #FCC200; padding: 2px;">$1</mark>');
  };

  const transcricaoFiltrada = filtrarTranscricao(analise.transcricao || '', buscaTranscricao);

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
                {analise.colaboradorNome || 'Não disponível'}
              </Typography>
            </Box>
            
            {analise.dataLigacao && (
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
                  {new Date(analise.dataLigacao).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}
            
            {analise.createdAt && (
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
                  {new Date(analise.createdAt).toLocaleDateString('pt-BR', {
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

        {/* Seção 2: Relatório GPT */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins', 
              fontWeight: 600, 
              color: '#000058'
            }}>
              Relatório da Análise
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={`${analise.pontuacaoGPT} pontos`}
                sx={{
                  backgroundColor: getScoreColor(analise.pontuacaoGPT),
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              />
              <Chip
                label={getScoreLabel(analise.pontuacaoGPT)}
                sx={{
                  backgroundColor: getScoreColor(analise.pontuacaoGPT),
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  opacity: 0.8
                }}
              />
            </Box>
          </Box>
          
          {analise.confianca && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Confiança: ${analise.confianca}%`}
                sx={{
                  backgroundColor: '#1694FF',
                  color: '#ffffff',
                  fontFamily: 'Poppins'
                }}
              />
            </Box>
          )}

          {/* Cálculo Detalhado */}
          {analise.calculoDetalhado && analise.calculoDetalhado.length > 0 && (
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              padding: 2, 
              borderRadius: '8px',
              mb: 2
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600,
                mb: 1
              }}>
                Cálculo Detalhado:
              </Typography>
              {analise.calculoDetalhado.map((linha, index) => (
                <Typography key={index} variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  mb: 0.5
                }}>
                  {linha}
                </Typography>
              ))}
            </Box>
          )}
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
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>GPT</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Humano</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Pontos</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  // Obter critérios de gptAnalysis ou qualityAnalysis
                  const criterios = analise.gptAnalysis?.criterios || analise.qualityAnalysis?.criterios || {};
                  // Obter critérios humanos diretamente de avaliacaoMonitorId populado
                  const avaliacaoMonitor = analise.avaliacaoMonitorId || analise.avaliacaoOriginal;
                  return Object.entries(criterios).map(([criterio, valorGPT]) => {
                    // Buscar critério humano diretamente do avaliacaoMonitorId populado
                    const valorHumano = avaliacaoMonitor?.[criterio];
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
                        <Chip
                          label={valorGPT ? 'Sim' : 'Não'}
                          size="small"
                          sx={{
                            backgroundColor: valorGPT ? '#15A237' : '#f44336',
                            color: '#ffffff',
                            fontFamily: 'Poppins'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {valorHumano !== undefined ? (
                          <Chip
                            label={valorHumano ? 'Sim' : 'Não'}
                            size="small"
                            sx={{
                              backgroundColor: valorHumano ? '#15A237' : '#f44336',
                              color: '#ffffff',
                              fontFamily: 'Poppins'
                            }}
                          />
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
            {podeAuditar && !editandoAnalise && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => {
                  // Buscar o texto da análise (priorizar gptAnalysis, depois qualityAnalysis)
                  const textoAnalise = analise.gptAnalysis?.analysis || 
                                       analise.qualityAnalysis?.analysis || 
                                       '';
                  setAnaliseEditada(textoAnalise);
                  setEditandoAnalise(true);
                  setErroSalvar(null);
                }}
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  borderColor: '#FCC200',
                  color: '#000000',
                  '&:hover': {
                    borderColor: '#e6b000',
                    backgroundColor: 'rgba(252, 194, 0, 0.1)'
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
                      const tipo = (analise.gptAnalysis && (analise.gptAnalysis.analysis || Object.keys(analise.gptAnalysis).length > 0)) ? 'gpt' : 'quality';
                      
                      const resultado = await editarAnaliseGPT(analise._id, analiseEditada, tipo);
                      
                      // Atualizar o objeto analise localmente
                      if (tipo === 'gpt') {
                        analise.gptAnalysis = analise.gptAnalysis || {};
                        analise.gptAnalysis.analysis = analiseEditada;
                      } else {
                        analise.qualityAnalysis = analise.qualityAnalysis || {};
                        analise.qualityAnalysis.analysis = analiseEditada;
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
              {analise.gptAnalysis?.analysis || analise.qualityAnalysis?.analysis || 'Análise não disponível'}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 5: Palavras Críticas */}
        {analise.palavrasCriticas && analise.palavrasCriticas.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Poppins', 
              fontWeight: 600, 
              color: '#f44336',
              mb: 2
            }}>
              ⚠️ Palavras Críticas Detectadas
            </Typography>
            
            <Alert severity="warning" sx={{ fontFamily: 'Poppins', mb: 2 }}>
              As seguintes palavras críticas foram identificadas na ligação:
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {analise.palavrasCriticas.map((palavra, index) => (
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
        )}

        <Divider sx={{ my: 3 }} />

        {/* Seção 5: Transcrição */}
        {analise.transcricao && (
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
        )}

        {/* Seção 6: Auditoria (se aplicável) */}
        {analise.auditoriaGestor && (
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
              backgroundColor: analise.auditoriaGestor.aprovado ? '#d4edda' : '#f8d7da', 
              padding: 2, 
              borderRadius: '8px',
              border: `1px solid ${analise.auditoriaGestor.aprovado ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={analise.auditoriaGestor.aprovado ? 'Aprovado' : 'Requer Correções'}
                  sx={{
                    backgroundColor: analise.auditoriaGestor.aprovado ? '#15A237' : '#f44336',
                    color: '#ffffff',
                    fontFamily: 'Poppins',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={`Auditor: ${analise.auditoriaGestor.auditor}`}
                  sx={{
                    backgroundColor: '#666666',
                    color: '#ffffff',
                    fontFamily: 'Poppins'
                  }}
                />
                <Chip
                  label={`Data: ${new Date(analise.auditoriaGestor.dataAuditoria).toLocaleDateString('pt-BR')}`}
                  sx={{
                    backgroundColor: '#666666',
                    color: '#ffffff',
                    fontFamily: 'Poppins'
                  }}
                />
              </Box>
              
              {analise.auditoriaGestor.comentarios && (
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  lineHeight: 1.6
                }}>
                  <strong>Comentários:</strong> {analise.auditoriaGestor.comentarios}
                </Typography>
              )}
            </Box>
          </Box>
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
        
        {podeAuditar && !analise.auditoriaGestor && (
          <Button
            variant="contained"
            startIcon={<GavelIcon />}
            onClick={() => onAuditar(analise)}
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              backgroundColor: '#FCC200',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#e6b000'
              }
            }}
          >
            Auditar Análise
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DetalhesAnaliseModal;
